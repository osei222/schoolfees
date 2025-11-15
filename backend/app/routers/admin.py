from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import User, SMSPricing, SystemSettings
from ..services.auth_service import get_current_user
from pydantic import BaseModel, Field

router = APIRouter(prefix="/admin", tags=["Admin"])


# ========================
# SMS Pricing Schemas
# ========================

class SMSPricingCreate(BaseModel):
    price_per_sms: float = Field(..., gt=0, description="Price per SMS unit in GHS")
    bulk_discount_threshold: int = Field(default=1000, description="Minimum units for bulk discount")
    bulk_discount_percentage: float = Field(default=10.0, description="Discount percentage for bulk")
    effective_from: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "price_per_sms": 0.10,
                "bulk_discount_threshold": 1000,
                "bulk_discount_percentage": 10.0,
                "effective_from": "2024-11-02T00:00:00"
            }
        }


class SMSPricingUpdate(BaseModel):
    price_per_sms: float | None = Field(None, gt=0)
    bulk_discount_threshold: int | None = None
    bulk_discount_percentage: float | None = None
    is_active: bool | None = None


class SMSPricingResponse(BaseModel):
    id: int
    price_per_sms: float
    bulk_discount_threshold: int
    bulk_discount_percentage: float
    effective_from: datetime
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========================
# System Settings Schemas
# ========================

class SystemSettingsUpdate(BaseModel):
    free_trial_days: int | None = Field(None, ge=0, description="Free trial duration in days")
    free_trial_sms: int | None = Field(None, ge=0, description="Free SMS units for trial")
    basic_plan_sms_limit: int | None = Field(None, ge=0, description="Monthly SMS for Basic plan")
    premium_plan_sms_limit: int | None = Field(None, ge=0, description="Monthly SMS for Premium plan")
    basic_plan_price: float | None = Field(None, ge=0, description="Monthly price for Basic plan")
    premium_plan_price: float | None = Field(None, ge=0, description="Monthly price for Premium plan")
    maintenance_mode: bool | None = Field(None, description="Enable/disable maintenance mode")
    max_students_per_school: int | None = Field(None, ge=0, description="Maximum students allowed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "free_trial_days": 14,
                "free_trial_sms": 50,
                "basic_plan_sms_limit": 500,
                "premium_plan_sms_limit": 2000,
                "basic_plan_price": 29.99,
                "premium_plan_price": 79.99,
                "maintenance_mode": False,
                "max_students_per_school": 1000
            }
        }


class SystemSettingsResponse(BaseModel):
    id: int
    free_trial_days: int
    free_trial_sms: int
    basic_plan_sms_limit: int
    premium_plan_sms_limit: int
    basic_plan_price: float
    premium_plan_price: float
    maintenance_mode: bool
    max_students_per_school: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========================
# SMS Pricing Endpoints
# ========================

@router.get("/sms-pricing/current", response_model=SMSPricingResponse)
async def get_current_sms_pricing(db: Session = Depends(get_db)):
    """
    Get the current active SMS pricing.
    
    Returns the currently active pricing configuration for SMS.
    """
    pricing = db.query(SMSPricing).filter(
        SMSPricing.is_active == True
    ).order_by(SMSPricing.effective_from.desc()).first()
    
    if not pricing:
        # Return default pricing if none exists
        raise HTTPException(
            status_code=404,
            detail="No active SMS pricing found. Please set up pricing first."
        )
    
    return pricing


@router.get("/sms-pricing/history", response_model=List[SMSPricingResponse])
async def get_sms_pricing_history(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get SMS pricing history.
    
    Returns historical pricing changes (admin only).
    """
    # Only allow for super admin (you can add admin role check here)
    pricings = db.query(SMSPricing).order_by(
        SMSPricing.effective_from.desc()
    ).limit(limit).all()
    
    return pricings


@router.post("/sms-pricing", response_model=SMSPricingResponse, status_code=201)
async def create_sms_pricing(
    pricing: SMSPricingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new SMS pricing (Admin only).
    
    Sets new SMS pricing. Only one pricing can be active at a time.
    Previous pricing is automatically deactivated.
    """
    # Deactivate all previous pricing
    db.query(SMSPricing).update({"is_active": False})
    
    # Create new pricing
    new_pricing = SMSPricing(
        price_per_sms=pricing.price_per_sms,
        bulk_discount_threshold=pricing.bulk_discount_threshold,
        bulk_discount_percentage=pricing.bulk_discount_percentage,
        effective_from=pricing.effective_from,
        is_active=True
    )
    
    db.add(new_pricing)
    db.commit()
    db.refresh(new_pricing)
    
    return new_pricing


@router.put("/sms-pricing/{pricing_id}", response_model=SMSPricingResponse)
async def update_sms_pricing(
    pricing_id: int,
    pricing: SMSPricingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update existing SMS pricing (Admin only).
    
    Modify an existing pricing configuration.
    """
    db_pricing = db.query(SMSPricing).filter(SMSPricing.id == pricing_id).first()
    
    if not db_pricing:
        raise HTTPException(status_code=404, detail="SMS pricing not found")
    
    # Update fields
    for field, value in pricing.model_dump(exclude_unset=True).items():
        setattr(db_pricing, field, value)
    
    # If activating this pricing, deactivate others
    if pricing.is_active:
        db.query(SMSPricing).filter(SMSPricing.id != pricing_id).update({"is_active": False})
    
    db.commit()
    db.refresh(db_pricing)
    
    return db_pricing


class SMSCostCalculation(BaseModel):
    units: int = Field(..., gt=0, description="Number of SMS units")

@router.post("/sms-pricing/calculate-cost")
async def calculate_sms_cost(
    calculation: SMSCostCalculation,
    db: Session = Depends(get_db)
):
    """
    Calculate SMS purchase cost with discounts.
    
    Returns the total cost, discount applied, and final price.
    """
    pricing = db.query(SMSPricing).filter(
        SMSPricing.is_active == True
    ).first()
    
    if not pricing:
        raise HTTPException(status_code=404, detail="No active pricing found")
    
    units = calculation.units
    base_cost = units * pricing.price_per_sms
    discount_amount = 0
    discount_percentage = 0
    
    # Apply bulk discount if applicable
    if units >= pricing.bulk_discount_threshold:
        discount_percentage = pricing.bulk_discount_percentage
        discount_amount = base_cost * (discount_percentage / 100)
    
    final_cost = base_cost - discount_amount
    
    return {
        "units": units,
        "price_per_sms": pricing.price_per_sms,
        "base_cost": round(base_cost, 2),
        "bulk_discount_threshold": pricing.bulk_discount_threshold,
        "discount_percentage": discount_percentage,
        "discount_amount": round(discount_amount, 2),
        "final_cost": round(final_cost, 2),
        "you_save": round(discount_amount, 2)
    }


# ========================
# System Settings Endpoints
# ========================

@router.get("/settings", response_model=SystemSettingsResponse)
async def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current system settings.
    
    Returns current configuration for the entire system.
    """
    settings = db.query(SystemSettings).first()
    
    if not settings:
        # Create default settings if none exist
        settings = SystemSettings(
            free_trial_days=14,
            free_trial_sms=50,
            basic_plan_sms_limit=500,
            premium_plan_sms_limit=2000,
            basic_plan_price=29.99,
            premium_plan_price=79.99,
            maintenance_mode=False,
            max_students_per_school=1000
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/settings", response_model=SystemSettingsResponse)
async def update_system_settings(
    settings: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update system settings (Admin only).
    
    Modify global system configuration.
    """
    db_settings = db.query(SystemSettings).first()
    
    if not db_settings:
        # Create if doesn't exist
        db_settings = SystemSettings()
        db.add(db_settings)
    
    # Update fields
    for field, value in settings.model_dump(exclude_unset=True).items():
        setattr(db_settings, field, value)
    
    db_settings.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_settings)
    
    return db_settings


@router.get("/statistics")
async def get_admin_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall system statistics (Admin only).
    
    Returns statistics for all schools in the system.
    """
    from ..models import Student, Payment, WalletTransaction, SMSLog
    
    total_schools = db.query(User).count()
    total_students = db.query(Student).count()
    total_payments = db.query(Payment).count()
    
    # Calculate total revenue
    total_revenue = db.query(db.func.sum(Payment.amount)).scalar() or 0
    
    # SMS statistics
    total_sms_sent = db.query(SMSLog).count()
    total_wallet_transactions = db.query(WalletTransaction).count()
    
    # Active subscriptions
    active_trials = db.query(User).filter(
        User.subscription_plan == "Free Trial",
        User.subscription_status == "active"
    ).count()
    
    active_basic = db.query(User).filter(
        User.subscription_plan == "Basic",
        User.subscription_status == "active"
    ).count()
    
    active_premium = db.query(User).filter(
        User.subscription_plan == "Premium",
        User.subscription_status == "active"
    ).count()
    
    return {
        "total_schools": total_schools,
        "total_students": total_students,
        "total_payments": total_payments,
        "total_revenue": round(total_revenue, 2),
        "total_sms_sent": total_sms_sent,
        "total_wallet_transactions": total_wallet_transactions,
        "subscriptions": {
            "free_trial": active_trials,
            "basic": active_basic,
            "premium": active_premium
        }
    }
