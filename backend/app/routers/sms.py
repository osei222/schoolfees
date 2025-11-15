from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app import models, schemas
from app.services.auth_service import get_current_user, require_active_school
from app.services.sms_service import ArkeselSMSProvider
import uuid

router = APIRouter(prefix="/sms", tags=["SMS"])

@router.post("/send", response_model=schemas.SMSLogResponse)
async def send_sms(
    sms_data: schemas.SMSSend,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Send SMS to a recipient
    - Deducts 1 unit from SMS balance
    - Logs the transaction
    - Returns delivery status
    """
    # Check SMS balance
    if current_user.sms_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient SMS balance. Please purchase SMS units."
        )
    
    # Initialize SMS provider with user's sender ID
    sms_provider = ArkeselSMSProvider(sender_id=current_user.arkesel_sender_id)
    
    # Send SMS
    result = await sms_provider.send_sms(sms_data.recipient, sms_data.message)
    
    # Deduct SMS unit if sent successfully
    sms_log = models.SMSLog(
        user_id=current_user.id,
        school_id=current_user.school_id,
        recipient=sms_data.recipient,
        message=sms_data.message,
        status="sent" if result['success'] else "failed",
        units_used=1 if result['success'] else 0,
        arkesel_response=str(result.get('response')),
        error_message=result.get('message') if not result['success'] else None
    )
    
    if result['success']:
        current_user.sms_balance -= 1
        
        # Log SMS usage transaction
        transaction = models.WalletTransaction(
            user_id=current_user.id,
            school_id=current_user.school_id,
            transaction_type="sms_usage",
            sms_units=1,
            description=f"SMS sent to {sms_data.recipient}",
            balance_before=current_user.wallet_balance,
            balance_after=current_user.wallet_balance,
            sms_balance_before=current_user.sms_balance + 1,
            sms_balance_after=current_user.sms_balance
        )
        db.add(transaction)
    
    db.add(sms_log)
    db.commit()
    db.refresh(sms_log)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS: {result['message']}"
        )
    
    return sms_log

@router.get("/logs", response_model=List[schemas.SMSLogResponse])
async def get_sms_logs(
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get SMS sending history"""
    logs = db.query(models.SMSLog)\
        .filter(models.SMSLog.user_id == current_user.id)\
        .order_by(desc(models.SMSLog.created_at))\
        .limit(limit)\
        .all()
    
    return logs

@router.get("/balance")
async def get_sms_balance(
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school)
):
    """Get SMS balance and limits"""
    return {
        "sms_balance": current_user.sms_balance,
        "subscription_plan": current_user.subscription_plan,
        "free_trial_limit": 50 if current_user.subscription_plan == models.SubscriptionPlan.FREE_TRIAL else None
    }
