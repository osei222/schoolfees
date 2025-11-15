from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.auth_service import get_current_user, require_active_school
from datetime import datetime

router = APIRouter(prefix="/students", tags=["Students"])

def _tenant_filter(query, current_user: models.User):
    if current_user.school_id:
        return query.filter(models.Student.school_id == current_user.school_id)
    return query


@router.post("/", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: schemas.StudentCreate,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Create a new student
    - Auto-creates unpaid fee records based on fee structure
    - Calculates total fees from fee structure
    """
    # Get fee structure for the selected year and term
    fee_structures_query = db.query(models.FeeStructure).filter(
        models.FeeStructure.user_id == current_user.id,
        models.FeeStructure.academic_year == student_data.academic_year,
        models.FeeStructure.term == student_data.term
    )
    if current_user.school_id:
        fee_structures_query = fee_structures_query.filter(models.FeeStructure.school_id == current_user.school_id)
    fee_structures = fee_structures_query.all()
    
    # Calculate total fees
    total_fees = sum(fee.amount for fee in fee_structures)
    
    # Create student
    new_student = models.Student(
        user_id=current_user.id,
        name=student_data.name,
        student_class=student_data.student_class,
        gender=student_data.gender,
        date_of_birth=student_data.date_of_birth,
        parent_name=student_data.parent_name,
        parent_contact=student_data.parent_contact,
        parent_email=student_data.parent_email,
        academic_year=student_data.academic_year,
        term=student_data.term,
        total_fees=total_fees,
        paid_amount=0.0,
        balance=total_fees,
        status=models.PaymentStatus.UNPAID,
        school_id=current_user.school_id
    )
    
    db.add(new_student)
    db.flush()  # Get student ID
    
    # Create unpaid fee records for each fee type
    for fee in fee_structures:
        fee_record = models.StudentFeeRecord(
            student_id=new_student.id,
            fee_structure_id=fee.id,
            fee_type=fee.fee_type,
            amount=fee.amount,
            paid_amount=0.0,
            balance=fee.amount,
            status=models.PaymentStatus.UNPAID,
            term=fee.term,
            academic_year=fee.academic_year
        )
        db.add(fee_record)
    
    db.commit()
    db.refresh(new_student)
    
    return new_student

@router.get("/", response_model=List[schemas.StudentResponse])
async def get_students(
    status: Optional[str] = Query(None, description="Filter by payment status: Unpaid, Partial, Paid"),
    search: Optional[str] = Query(None, description="Search by name or parent name"),
    student_class: Optional[str] = Query(None, description="Filter by class"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Get all students for current user with optional filters:
    - Filter by payment status (Unpaid, Partial, Paid)
    - Search by name
    - Filter by class
    """
    query = db.query(models.Student).filter(models.Student.user_id == current_user.id)
    if current_user.school_id:
        query = query.filter(models.Student.school_id == current_user.school_id)
    
    # Filter by payment status
    if status:
        try:
            payment_status = models.PaymentStatus(status)
            query = query.filter(models.Student.status == payment_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Use: Unpaid, Partial, or Paid"
            )
    
    # Search by name
    if search:
        query = query.filter(
            or_(
                models.Student.name.ilike(f"%{search}%"),
                models.Student.parent_name.ilike(f"%{search}%")
            )
        )
    
    # Filter by class
    if student_class:
        query = query.filter(models.Student.student_class == student_class)
    
    students = query.order_by(desc(models.Student.created_at)).offset(skip).limit(limit).all()
    
    return students

@router.get("/{student_id}", response_model=schemas.StudentResponse)
async def get_student(
    student_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get a specific student by ID"""
    student = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.user_id == current_user.id
    )
    if current_user.school_id:
        student = student.filter(models.Student.school_id == current_user.school_id)
    student = student.first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student

@router.put("/{student_id}", response_model=schemas.StudentResponse)
async def update_student(
    student_id: int,
    student_update: schemas.StudentUpdate,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Update student information"""
    student_query = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.user_id == current_user.id
    )
    if current_user.school_id:
        student_query = student_query.filter(models.Student.school_id == current_user.school_id)
    student = student_query.first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Update fields
    if student_update.name:
        student.name = student_update.name
    if student_update.student_class:
        student.student_class = student_update.student_class
    if student_update.gender:
        student.gender = student_update.gender
    if student_update.date_of_birth:
        student.date_of_birth = student_update.date_of_birth
    if student_update.parent_name:
        student.parent_name = student_update.parent_name
    if student_update.parent_contact:
        student.parent_contact = student_update.parent_contact
    if student_update.parent_email:
        student.parent_email = student_update.parent_email
    
    db.commit()
    db.refresh(student)
    
    return student

@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Delete a student"""
    student = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.user_id == current_user.id
    )
    if current_user.school_id:
        student = student.filter(models.Student.school_id == current_user.school_id)
    student = student.first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    db.delete(student)
    db.commit()
    
    return {"message": "Student deleted successfully"}

@router.get("/{student_id}/fee-records")
async def get_student_fee_records(
    student_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get all fee records for a specific student"""
    student = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.user_id == current_user.id
    )
    if current_user.school_id:
        student = student.filter(models.Student.school_id == current_user.school_id)
    student = student.first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    fee_records = db.query(models.StudentFeeRecord)\
        .filter(models.StudentFeeRecord.student_id == student_id)\
        .all()
    
    return {
        "student": student,
        "fee_records": fee_records
    }

@router.get("/statistics/summary")
async def get_students_statistics(
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get student statistics summary"""
    summary_query = db.query(models.Student).filter(models.Student.user_id == current_user.id)
    if current_user.school_id:
        summary_query = summary_query.filter(models.Student.school_id == current_user.school_id)

    total_students = summary_query.count()
    
    status_query = summary_query.subquery()
    fully_paid = db.query(models.Student).filter(
        models.Student.user_id == current_user.id,
        models.Student.status == models.PaymentStatus.PAID
    )
    if current_user.school_id:
        fully_paid = fully_paid.filter(models.Student.school_id == current_user.school_id)
    fully_paid = fully_paid.count()
    
    partially_paid = db.query(models.Student).filter(
        models.Student.user_id == current_user.id,
        models.Student.status == models.PaymentStatus.PARTIAL
    )
    if current_user.school_id:
        partially_paid = partially_paid.filter(models.Student.school_id == current_user.school_id)
    partially_paid = partially_paid.count()
    
    unpaid = db.query(models.Student).filter(
        models.Student.user_id == current_user.id,
        models.Student.status == models.PaymentStatus.UNPAID
    )
    if current_user.school_id:
        unpaid = unpaid.filter(models.Student.school_id == current_user.school_id)
    unpaid = unpaid.count()
    
    return {
        "total_students": total_students,
        "fully_paid": fully_paid,
        "partially_paid": partially_paid,
        "unpaid": unpaid
    }
