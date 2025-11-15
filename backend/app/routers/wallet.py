from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app import models, schemas
from app.services.auth_service import get_current_user, require_active_school
from app.config import settings
import uuid

router = APIRouter(prefix="/wallet", tags=["SMS Wallet"])

@router.post("/topup", response_model=schemas.WalletTransactionResponse)
async def topup_wallet(
    topup: schemas.WalletTopUp,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Top up wallet balance
    Minimum: GHS 5.00
    """
    balance_before = current_user.wallet_balance
    current_user.wallet_balance += topup.amount
    
    # Create transaction record
    transaction = models.WalletTransaction(
        user_id=current_user.id,
        school_id=current_user.school_id,
        transaction_type="topup",
        amount=topup.amount,
        payment_method=topup.payment_method,
        reference=topup.reference or f"TOP-{uuid.uuid4().hex[:8].upper()}",
        description=f"Wallet top-up via {topup.payment_method}",
        balance_before=balance_before,
        balance_after=current_user.wallet_balance,
        sms_balance_before=current_user.sms_balance,
        sms_balance_after=current_user.sms_balance
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.post("/purchase-sms", response_model=schemas.WalletTransactionResponse)
async def purchase_sms(
    purchase: schemas.SMSPurchase,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """
    Purchase SMS units from wallet balance.
    
    Pricing is dynamic and supports bulk discounts.
    Use GET /admin/sms-pricing/calculate-cost to preview cost.
    """
    from ..models import SMSPricing
    
    # Get current SMS pricing
    pricing = db.query(SMSPricing).filter(SMSPricing.is_active == True).first()
    
    if not pricing:
        # Fallback to config if no pricing is set
        cost = purchase.units * settings.SMS_COST_PER_UNIT
        discount = 0
    else:
        # Calculate with bulk discount
        base_cost = purchase.units * pricing.price_per_sms
        discount = 0
        
        if purchase.units >= pricing.bulk_discount_threshold:
            discount = base_cost * (pricing.bulk_discount_percentage / 100)
        
        cost = base_cost - discount
    
    if current_user.wallet_balance < cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Need GHS {cost:.2f}, have GHS {current_user.wallet_balance:.2f}"
        )
    
    # Deduct from wallet and add SMS units
    balance_before = current_user.wallet_balance
    sms_before = current_user.sms_balance
    
    current_user.wallet_balance -= cost
    current_user.sms_balance += purchase.units
    
    # Create transaction record
    description = f"Purchased {purchase.units} SMS units"
    if discount > 0:
        description += f" (Bulk discount: GHS {discount:.2f} saved)"
    
    transaction = models.WalletTransaction(
        user_id=current_user.id,
        school_id=current_user.school_id,
        transaction_type="sms_purchase",
        amount=cost,
        sms_units=purchase.units,
        reference=f"SMS-{uuid.uuid4().hex[:8].upper()}",
        description=description,
        balance_before=balance_before,
        balance_after=current_user.wallet_balance,
        sms_balance_before=sms_before,
        sms_balance_after=current_user.sms_balance
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.get("/transactions", response_model=List[schemas.WalletTransactionResponse])
async def get_transactions(
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school),
    db: Session = Depends(get_db)
):
    """Get wallet transaction history"""
    transactions = db.query(models.WalletTransaction)\
        .filter(
            models.WalletTransaction.user_id == current_user.id,
            models.WalletTransaction.school_id == current_user.school_id
        )\
        .order_by(desc(models.WalletTransaction.created_at))\
        .limit(limit)\
        .all()
    
    return transactions

@router.get("/balance")
async def get_wallet_balance(
    current_user: models.User = Depends(get_current_user),
    school=Depends(require_active_school)
):
    """Get current wallet and SMS balance"""
    return {
        "wallet_balance": current_user.wallet_balance,
        "sms_balance": current_user.sms_balance,
        "sms_cost_per_unit": settings.SMS_COST_PER_UNIT,
        "subscription_plan": current_user.subscription_plan,
        "subscription_status": current_user.subscription_status
    }

@router.get("/pricing")
async def get_sms_pricing():
    """
    Get SMS pricing and subscription plans
    This endpoint is public - no authentication required
    You can update prices in backend/app/config.py
    """
    return {
        "sms_pricing": {
            "cost_per_unit": settings.SMS_COST_PER_UNIT,
            "currency": "GHS",
            "packages": [
                {
                    "units": 100,
                    "cost": 100 * settings.SMS_COST_PER_UNIT,
                    "savings": 0,
                    "discount_percentage": 0
                },
                {
                    "units": 500,
                    "cost": 500 * settings.SMS_COST_PER_UNIT,
                    "savings": 0,
                    "discount_percentage": 0
                },
                {
                    "units": 1000,
                    "cost": 1000 * settings.SMS_COST_PER_UNIT,
                    "savings": 0,
                    "discount_percentage": 0
                },
                {
                    "units": 5000,
                    "cost": 5000 * settings.SMS_COST_PER_UNIT,
                    "savings": 0,
                    "discount_percentage": 0
                }
            ]
        },
        "subscription_plans": {
            "free_trial": {
                "name": "Free Trial",
                "duration_days": settings.FREE_TRIAL_DAYS,
                "sms_included": settings.FREE_TRIAL_SMS_LIMIT,
                "monthly_cost": 0,
                "features": [
                    "Student Management",
                    "Payment Processing",
                    f"{settings.FREE_TRIAL_SMS_LIMIT} SMS Credits",
                    f"{settings.FREE_TRIAL_DAYS} Days Free"
                ]
            },
            "basic": {
                "name": "Basic Plan",
                "monthly_cost": settings.BASIC_PLAN_MONTHLY,
                "sms_included": 500,
                "features": [
                    "Unlimited Students",
                    "Payment Processing",
                    "500 SMS/month",
                    "Email Support",
                    "Basic Reports"
                ]
            },
            "premium": {
                "name": "Premium Plan",
                "monthly_cost": settings.PREMIUM_PLAN_MONTHLY,
                "sms_included": 2000,
                "features": [
                    "Everything in Basic",
                    "2000 SMS/month",
                    "Advanced Analytics",
                    "Priority Support",
                    "API Access",
                    "Custom Reports"
                ]
            }
        },
        "note": "Prices can be updated in backend/app/config.py",
        "last_updated": "2024-11-02"
    }
