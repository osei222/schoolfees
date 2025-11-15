from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.auth_service import get_current_user, require_active_school

router = APIRouter(prefix="/fees", tags=["Fee Structure"])

@router.post("/", response_model=schemas.FeeStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_structure(
    fee_data: schemas.FeeStructureCreate,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Create a new fee structure"""
    # Check if fee type already exists for this year/term/level
    existing = db.query(models.FeeStructure)\
        .filter(
            models.FeeStructure.user_id == current_user.id,
            models.FeeStructure.school_id == current_user.school_id,
            models.FeeStructure.academic_year == fee_data.academic_year,
            models.FeeStructure.term == fee_data.term,
            models.FeeStructure.fee_type == fee_data.fee_type,
            models.FeeStructure.level == fee_data.level
        ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee type '{fee_data.fee_type}' already exists for {fee_data.term} - {fee_data.academic_year} - {fee_data.level}"
        )
    
    new_fee = models.FeeStructure(
        user_id=current_user.id,
        school_id=current_user.school_id,
        academic_year=fee_data.academic_year,
        term=fee_data.term,
        fee_type=fee_data.fee_type,
        amount=fee_data.amount,
        level=fee_data.level
    )
    
    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)
    
    return new_fee

@router.get("/", response_model=List[schemas.FeeStructureResponse])
async def get_fee_structures(
    academic_year: Optional[str] = None,
    term: Optional[str] = None,
    level: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Get all fee structures for current user
    Optional filters: academic_year, term, level
    """
    query = db.query(models.FeeStructure).filter(models.FeeStructure.user_id == current_user.id)
    if current_user.school_id:
        query = query.filter(models.FeeStructure.school_id == current_user.school_id)
    
    if academic_year:
        query = query.filter(models.FeeStructure.academic_year == academic_year)
    
    if term:
        query = query.filter(models.FeeStructure.term == term)
    
    if level:
        query = query.filter(models.FeeStructure.level == level)
    
    fees = query.order_by(
        models.FeeStructure.academic_year.desc(),
        models.FeeStructure.term,
        models.FeeStructure.fee_type
    ).all()
    
    return fees

@router.get("/{fee_id}", response_model=schemas.FeeStructureResponse)
async def get_fee_structure(
    fee_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get a specific fee structure by ID"""
    fee = db.query(models.FeeStructure).filter(
        models.FeeStructure.id == fee_id,
        models.FeeStructure.user_id == current_user.id
    )
    if current_user.school_id:
        fee = fee.filter(models.FeeStructure.school_id == current_user.school_id)
    fee = fee.first()
    
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee structure not found"
        )
    
    return fee

@router.put("/{fee_id}", response_model=schemas.FeeStructureResponse)
async def update_fee_structure(
    fee_id: int,
    fee_update: schemas.FeeStructureUpdate,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Update a fee structure"""
    fee = db.query(models.FeeStructure).filter(
        models.FeeStructure.id == fee_id,
        models.FeeStructure.user_id == current_user.id
    )
    if current_user.school_id:
        fee = fee.filter(models.FeeStructure.school_id == current_user.school_id)
    fee = fee.first()
    
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee structure not found"
        )
    
    if fee_update.amount is not None:
        fee.amount = fee_update.amount
    
    if fee_update.level is not None:
        fee.level = fee_update.level
    
    db.commit()
    db.refresh(fee)
    
    return fee

@router.delete("/{fee_id}")
async def delete_fee_structure(
    fee_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Delete a fee structure"""
    fee = db.query(models.FeeStructure).filter(
        models.FeeStructure.id == fee_id,
        models.FeeStructure.user_id == current_user.id
    )
    if current_user.school_id:
        fee = fee.filter(models.FeeStructure.school_id == current_user.school_id)
    fee = fee.first()
    
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee structure not found"
        )
    
    db.delete(fee)
    db.commit()
    
    return {"message": "Fee structure deleted successfully"}

@router.get("/summary/by-term")
async def get_fee_summary(
    academic_year: str = Query(..., description="Academic year e.g., 2024/2025"),
    term: str = Query(..., description="Term e.g., Term 1"),
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get total fees summary for a specific term"""
    fees = db.query(models.FeeStructure).filter(
        models.FeeStructure.user_id == current_user.id,
        models.FeeStructure.academic_year == academic_year,
        models.FeeStructure.term == term
    )
    if current_user.school_id:
        fees = fees.filter(models.FeeStructure.school_id == current_user.school_id)
    fees = fees.all()
    
    total_amount = sum(fee.amount for fee in fees)
    
    return {
        "academic_year": academic_year,
        "term": term,
        "fee_types": [{"fee_type": fee.fee_type, "amount": fee.amount, "level": fee.level} for fee in fees],
        "total_amount": total_amount,
        "fee_count": len(fees)
    }
