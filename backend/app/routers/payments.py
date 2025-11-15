from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.auth_service import get_current_user, require_active_school
from app.services.sms_service import ArkeselSMSProvider
from datetime import datetime
import uuid

router = APIRouter(prefix="/payments", tags=["Payments"])

def update_student_payment_status(student: models.Student, db: Session):
    """Update student payment status based on paid amount"""
    if student.balance == 0:
        student.status = models.PaymentStatus.PAID
    elif student.paid_amount > 0:
        student.status = models.PaymentStatus.PARTIAL
    else:
        student.status = models.PaymentStatus.UNPAID
    
    db.commit()

@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: schemas.PaymentCreate,
    send_sms: bool = Query(True, description="Send SMS receipt to parent"),
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Process a payment
    - Updates student balance
    - Updates fee record balance
    - Generates receipt reference
    - Optionally sends SMS to parent
    """
    # Get student
    student = db.query(models.Student)\
        .filter(
            models.Student.id == payment_data.student_id,
            models.Student.user_id == current_user.id,
            models.Student.school_id == current_user.school_id
        ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Validate payment amount
    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than 0"
        )
    
    if payment_data.amount > student.balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount (GHS {payment_data.amount}) exceeds balance (GHS {student.balance})"
        )
    
    # Generate reference
    reference = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    
    # Create payment record
    new_payment = models.Payment(
        user_id=current_user.id,
        school_id=current_user.school_id,
        student_id=student.id,
        reference=reference,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        fee_type=payment_data.fee_type,
        term=payment_data.term or student.term,
        academic_year=payment_data.academic_year or student.academic_year,
        payment_date=payment_data.payment_date or datetime.now(),
        student_name=student.name,
        student_class=student.student_class
    )
    
    db.add(new_payment)
    
    # Update student balance
    student.paid_amount += payment_data.amount
    student.balance -= payment_data.amount
    update_student_payment_status(student, db)
    
    # Update specific fee record if fee_type is provided
    if payment_data.fee_type:
        fee_record = db.query(models.StudentFeeRecord)\
            .filter(
                models.StudentFeeRecord.student_id == student.id,
                models.StudentFeeRecord.fee_type == payment_data.fee_type,
                models.StudentFeeRecord.term == (payment_data.term or student.term),
                models.StudentFeeRecord.school_id == current_user.school_id
            ).first()
        
        if fee_record:
            fee_record.paid_amount += payment_data.amount
            fee_record.balance = fee_record.amount - fee_record.paid_amount
            
            if fee_record.balance == 0:
                fee_record.status = models.PaymentStatus.PAID
            elif fee_record.paid_amount > 0:
                fee_record.status = models.PaymentStatus.PARTIAL
    
    db.commit()
    db.refresh(new_payment)
    
    # Send SMS receipt if requested and parent has contact
    if send_sms and student.parent_contact and current_user.sms_balance > 0:
        # Generate detailed receipt message
        message = f"*** {current_user.school_name} ***\n"
        message += f"PAYMENT RECEIPT\n"
        message += f"========================\n"
        message += f"Date: {new_payment.payment_date.strftime('%d/%m/%Y %I:%M %p')}\n"
        message += f"Receipt: {new_payment.reference}\n\n"
        
        message += f"Student: {student.name}\n"
        message += f"Class: {student.student_class}\n"
        message += f"Term: {new_payment.term}\n\n"
        
        message += f"PAYMENT DETAILS\n"
        message += f"Fee Type: {new_payment.fee_type}\n"
        message += f"Amount Paid: GHS {new_payment.amount:,.2f}\n"
        message += f"Method: {new_payment.payment_method}\n\n"
        
        message += f"SUMMARY\n"
        message += f"Total Fees: GHS {student.total_fees:,.2f}\n"
        message += f"Total Paid: GHS {student.paid_amount:,.2f}\n"
        message += f"Balance: GHS {student.balance:,.2f}\n\n"
        
        # Status message based on payment status
        if student.status == models.PaymentStatus.PAID:
            message += f"✅ ALL FEES FULLY PAID!\n"
            message += f"Well done! All fees cleared.\n"
        elif student.status == models.PaymentStatus.PARTIAL:
            # Get unpaid fees
            unpaid_fees = db.query(models.StudentFeeRecord)\
                .filter(
                    models.StudentFeeRecord.student_id == student.id,
                    models.StudentFeeRecord.balance > 0
                ).all()
            
            message += f"UNPAID FEES:\n"
            for fee in unpaid_fees:
                message += f"- {fee.fee_type}: GHS {fee.balance:,.2f}\n"
        else:
            message += f"Outstanding: GHS {student.balance:,.2f}\n"
        
        message += f"\nThank you for your payment!"
        
        sms_provider = ArkeselSMSProvider(sender_id=current_user.arkesel_sender_id)
        result = await sms_provider.send_sms(student.parent_contact, message)
        
        if result['success']:
            current_user.sms_balance -= 1
            
            # Log SMS
            sms_log = models.SMSLog(
                user_id=current_user.id,
                school_id=current_user.school_id,
                recipient=student.parent_contact,
                message=message,
                status="sent",
                units_used=1,
                arkesel_response=str(result.get('response'))
            )
            db.add(sms_log)
            
            # Log wallet transaction
            transaction = models.WalletTransaction(
                user_id=current_user.id,
                school_id=current_user.school_id,
                transaction_type="sms_usage",
                sms_units=1,
                description=f"Payment receipt sent to {student.parent_name}",
                balance_before=current_user.wallet_balance,
                balance_after=current_user.wallet_balance,
                sms_balance_before=current_user.sms_balance + 1,
                sms_balance_after=current_user.sms_balance
            )
            db.add(transaction)
            db.commit()
    
    return new_payment

@router.get("/", response_model=List[schemas.PaymentResponse])
async def get_payments(
    student_id: Optional[int] = None,
    payment_method: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get all payments with optional filters"""
    query = db.query(models.Payment).filter(
        models.Payment.user_id == current_user.id,
        models.Payment.school_id == current_user.school_id
    )
    
    if student_id:
        query = query.filter(models.Payment.student_id == student_id)
    
    if payment_method:
        query = query.filter(models.Payment.payment_method == payment_method)
    
    payments = query.order_by(desc(models.Payment.created_at)).offset(skip).limit(limit).all()
    
    return payments

@router.get("/{payment_id}", response_model=schemas.PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get a specific payment by ID"""
    payment = db.query(models.Payment)\
        .filter(
            models.Payment.id == payment_id,
            models.Payment.user_id == current_user.id,
            models.Payment.school_id == current_user.school_id
        ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment

@router.post("/{payment_id}/resend-receipt")
async def resend_receipt(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Resend SMS receipt for a payment"""
    payment = db.query(models.Payment)\
        .filter(
            models.Payment.id == payment_id,
            models.Payment.user_id == current_user.id,
            models.Payment.school_id == current_user.school_id
        ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    student = db.query(models.Student).filter(
        models.Student.id == payment.student_id,
        models.Student.school_id == current_user.school_id
    ).first()
    
    if not student or not student.parent_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student or parent contact not found"
        )
    
    if current_user.sms_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient SMS balance"
        )
    
    message = generate_receipt_message(student, payment, current_user.school_name)
    
    sms_provider = ArkeselSMSProvider(sender_id=current_user.arkesel_sender_id)
    result = await sms_provider.send_sms(student.parent_contact, message)
    
    if result['success']:
        current_user.sms_balance -= 1
        
        sms_log = models.SMSLog(
            user_id=current_user.id,
            school_id=current_user.school_id,
            recipient=student.parent_contact,
            message=message,
            status="sent",
            units_used=1,
            arkesel_response=str(result.get('response'))
        )
        db.add(sms_log)
        db.commit()
        
        return {"message": "Receipt resent successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS: {result['message']}"
        )

@router.post("/bulk-sms")
async def send_bulk_sms(
    bulk_sms: schemas.BulkSMSRequest,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Send bulk SMS to multiple students' parents
    - Can filter by payment status
    - Can select specific student IDs
    - Sends custom message
    """
    # Build query for students
    query = db.query(models.Student).filter(
        models.Student.user_id == current_user.id,
        models.Student.school_id == current_user.school_id
    )
    
    # Filter by payment status if provided
    if bulk_sms.payment_status:
        try:
            payment_status = models.PaymentStatus(bulk_sms.payment_status)
            query = query.filter(models.Student.status == payment_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment status"
            )
    
    # Filter by specific student IDs if provided
    if bulk_sms.student_ids:
        query = query.filter(models.Student.id.in_(bulk_sms.student_ids))
    
    students = query.all()
    
    if not students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No students found matching criteria"
        )
    
    # Check SMS balance
    required_sms = len(students)
    if current_user.sms_balance < required_sms:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient SMS balance. Need {required_sms}, have {current_user.sms_balance}"
        )
    
    # Send SMS to each parent
    sms_provider = ArkeselSMSProvider(sender_id=current_user.arkesel_sender_id)
    sent_count = 0
    failed_count = 0
    results = []
    
    for student in students:
        if not student.parent_contact:
            failed_count += 1
            results.append({
                "student": student.name,
                "status": "failed",
                "reason": "No parent contact"
            })
            continue
        
        # Personalize message
        personalized_message = bulk_sms.message.replace("{student_name}", student.name)\
            .replace("{parent_name}", student.parent_name or "Parent")\
            .replace("{balance}", f"GHS {student.balance:,.2f}")\
            .replace("{total_fees}", f"GHS {student.total_fees:,.2f}")\
            .replace("{paid_amount}", f"GHS {student.paid_amount:,.2f}")
        
        result = await sms_provider.send_sms(student.parent_contact, personalized_message)
        
        if result['success']:
            sent_count += 1
            current_user.sms_balance -= 1
            
            # Log SMS
            sms_log = models.SMSLog(
                user_id=current_user.id,
                recipient=student.parent_contact,
                message=personalized_message,
                status="sent",
                units_used=1,
                arkesel_response=str(result.get('response'))
            )
            db.add(sms_log)
            
            results.append({
                "student": student.name,
                "parent_contact": student.parent_contact,
                "status": "sent"
            })
        else:
            failed_count += 1
            results.append({
                "student": student.name,
                "parent_contact": student.parent_contact,
                "status": "failed",
                "reason": result['message']
            })
    
    # Log bulk SMS transaction
    transaction = models.WalletTransaction(
        user_id=current_user.id,
        school_id=current_user.school_id,
        transaction_type="sms_usage",
        sms_units=sent_count,
        description=f"Bulk SMS to {sent_count} parents",
        balance_before=current_user.wallet_balance,
        balance_after=current_user.wallet_balance,
        sms_balance_before=current_user.sms_balance + sent_count,
        sms_balance_after=current_user.sms_balance
    )
    db.add(transaction)
    db.commit()
    
    return {
        "total_attempted": len(students),
        "sent": sent_count,
        "failed": failed_count,
        "sms_balance_remaining": current_user.sms_balance,
        "details": results
    }

def generate_receipt_message(student: models.Student, payment: models.Payment, school_name: str) -> str:
    """Generate SMS receipt message"""
    message = f"{school_name}\n"
    message += f"Payment Receipt\n"
    message += f"Student: {student.name}\n"
    message += f"Amount: GHS {payment.amount:,.2f}\n"
    message += f"Fee: {payment.fee_type}\n"
    message += f"Balance: GHS {student.balance:,.2f}\n"
    message += f"Ref: {payment.reference}\n"
    message += f"Thank you!"
    
    return message

@router.get("/{payment_id}/receipt", response_model=schemas.PaymentReceipt)
async def get_payment_receipt(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Generate professional receipt for a payment
    - Complete fee breakdown
    - Payment status (Paid/Partial/Unpaid)
    - Personalized messages
    """
    payment = db.query(models.Payment)\
        .filter(
            models.Payment.id == payment_id,
            models.Payment.user_id == current_user.id,
            models.Payment.school_id == current_user.school_id
        ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    student = db.query(models.Student).filter(
        models.Student.id == payment.student_id,
        models.Student.school_id == current_user.school_id
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get all fee records for the student
    fee_records = db.query(models.StudentFeeRecord)\
        .filter(
            models.StudentFeeRecord.student_id == student.id,
            models.StudentFeeRecord.school_id == current_user.school_id
        )\
        .all()
    
    # Build fee breakdown
    fee_breakdown = []
    for record in fee_records:
        fee_breakdown.append(schemas.FeeBreakdown(
            fee_type=record.fee_type,
            amount=record.amount,
            paid_amount=record.paid_amount,
            balance=record.balance,
            status=record.status
        ))
    
    # Generate status message
    if student.status == models.PaymentStatus.PAID:
        status_message = "✅ ALL FEES FULLY PAID"
        thank_you_message = "Well done! All fees have been cleared. We appreciate your prompt payment."
    elif student.status == models.PaymentStatus.PARTIAL:
        status_message = f"⚠️ PARTIALLY PAID - Balance: GHS {student.balance:,.2f}"
        thank_you_message = "Thank you for your payment. Please clear the remaining balance at your earliest convenience."
    else:
        status_message = f"❌ UNPAID - Outstanding: GHS {student.balance:,.2f}"
        thank_you_message = "Please make payment to avoid any inconvenience. Thank you."
    
    # Build receipt
    receipt = schemas.PaymentReceipt(
        # Receipt Header
        receipt_number=payment.reference,
        school_name=current_user.school_name,
        school_address=current_user.address,
        school_phone=current_user.phone,
        
        # Student Information
        student_name=student.name,
        student_class=student.student_class,
        parent_name=student.parent_name,
        parent_contact=student.parent_contact,
        
        # Payment Details
        payment_date=payment.payment_date,
        amount_paid=payment.amount,
        payment_method=payment.payment_method,
        fee_type=payment.fee_type,
        term=payment.term,
        academic_year=payment.academic_year,
        
        # Financial Summary
        total_fees=student.total_fees,
        total_paid=student.paid_amount,
        total_balance=student.balance,
        payment_status=student.status,
        
        # Fee Breakdown
        fee_breakdown=fee_breakdown,
        
        # Messages
        status_message=status_message,
        thank_you_message=thank_you_message
    )
    
    return receipt

@router.post("/{payment_id}/send-receipt-sms")
async def send_receipt_sms(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Generate and send professional receipt via SMS
    """
    payment = db.query(models.Payment)\
        .filter(
            models.Payment.id == payment_id,
            models.Payment.user_id == current_user.id,
            models.Payment.school_id == current_user.school_id
        ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    student = db.query(models.Student).filter(
        models.Student.id == payment.student_id,
        models.Student.school_id == current_user.school_id
    ).first()
    
    if not student or not student.parent_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student or parent contact not found"
        )
    
    if current_user.sms_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient SMS balance"
        )
    
    # Generate detailed receipt message
    message = f"*** {current_user.school_name} ***\n"
    message += f"PAYMENT RECEIPT\n"
    message += f"========================\n"
    message += f"Date: {payment.payment_date.strftime('%d/%m/%Y %I:%M %p')}\n"
    message += f"Receipt: {payment.reference}\n\n"
    
    message += f"Student: {student.name}\n"
    message += f"Class: {student.student_class}\n"
    message += f"Term: {payment.term}\n\n"
    
    message += f"PAYMENT DETAILS\n"
    message += f"------------------------\n"
    message += f"Fee Type: {payment.fee_type}\n"
    message += f"Amount Paid: GHS {payment.amount:,.2f}\n"
    message += f"Method: {payment.payment_method}\n\n"
    
    message += f"FINANCIAL SUMMARY\n"
    message += f"------------------------\n"
    message += f"Total Fees: GHS {student.total_fees:,.2f}\n"
    message += f"Total Paid: GHS {student.paid_amount:,.2f}\n"
    message += f"Balance: GHS {student.balance:,.2f}\n\n"
    
    # Status message
    if student.status == models.PaymentStatus.PAID:
        message += f"✅ ALL FEES PAID!\n"
        message += f"Well done! Fees fully cleared.\n"
    elif student.status == models.PaymentStatus.PARTIAL:
        message += f"⚠️ Partial Payment\n"
        message += f"Balance: GHS {student.balance:,.2f}\n"
    else:
        message += f"Outstanding: GHS {student.balance:,.2f}\n"
    
    message += f"\nThank you for your payment!"
    
    sms_provider = ArkeselSMSProvider(sender_id=current_user.arkesel_sender_id)
    result = await sms_provider.send_sms(student.parent_contact, message)
    
    if result['success']:
        current_user.sms_balance -= 1
        
        sms_log = models.SMSLog(
            user_id=current_user.id,
            school_id=current_user.school_id,
            recipient=student.parent_contact,
            message=message,
            status="sent",
            units_used=1,
            arkesel_response=str(result.get('response'))
        )
        db.add(sms_log)
        
        # Log transaction
        transaction = models.WalletTransaction(
            user_id=current_user.id,
            school_id=current_user.school_id,
            transaction_type="sms_usage",
            sms_units=1,
            description=f"Receipt sent to {student.parent_name}",
            balance_before=current_user.wallet_balance,
            balance_after=current_user.wallet_balance,
            sms_balance_before=current_user.sms_balance + 1,
            sms_balance_after=current_user.sms_balance
        )
        db.add(transaction)
        db.commit()
        
        return {
            "message": "Receipt sent successfully",
            "recipient": student.parent_contact,
            "sms_balance_remaining": current_user.sms_balance
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS: {result['message']}"
        )
