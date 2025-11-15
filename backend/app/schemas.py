from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class SubscriptionPlanEnum(str, Enum):
    FREE_TRIAL = "free_trial"
    BASIC = "basic"
    PREMIUM = "premium"

class SubscriptionStatusEnum(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class PaymentStatusEnum(str, Enum):
    UNPAID = "Unpaid"
    PARTIAL = "Partial"
    PAID = "Paid"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    school_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    school_subdomain: str
    phone: Optional[str] = None
    address: Optional[str] = None

    @field_validator('username')
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        assert v.isalnum(), 'username must be alphanumeric'
        return v.lower()

    @field_validator('school_subdomain')
    @classmethod
    def subdomain_slug(cls, v: str) -> str:
        slug = v.strip().lower()
        if not slug:
            raise ValueError('school_subdomain is required')
        allowed = set('abcdefghijklmnopqrstuvwxyz0123456789-')
        if any(char not in allowed for char in slug):
            raise ValueError('Subdomain can only contain letters, numbers, and hyphen (-)')
        if slug.startswith('-') or slug.endswith('-'):
            raise ValueError('Subdomain cannot start or end with a hyphen (-)')
        return slug

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    subdomain: Optional[str] = None

class UserResponse(UserBase):
    id: int
    school_id: Optional[int] = None
    subscription_plan: SubscriptionPlanEnum
    subscription_status: SubscriptionStatusEnum
    subscription_end_date: Optional[datetime]
    wallet_balance: float
    sms_balance: int
    arkesel_sender_id: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    school_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    arkesel_sender_id: Optional[str] = None

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    school: Optional["SchoolResponse"] = None

class TokenData(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    school_id: Optional[int] = None

# School Schemas
class SchoolCreate(BaseModel):
    name: str
    subdomain: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class SchoolResponse(BaseModel):
    id: int
    name: str
    subdomain: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription_plan: SubscriptionPlanEnum
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Registration schema combines school and admin user
class SchoolRegistration(BaseModel):
    school_name: str
    subdomain: str
    school_address: Optional[str] = None
    school_phone: Optional[str] = None
    school_email: Optional[EmailStr] = None

    admin_username: str
    admin_email: EmailStr
    admin_password: str
    admin_full_name: str
    admin_phone: Optional[str] = None


# Forgot/Reset Password Schemas
class ForgotPassword(BaseModel):
    email: EmailStr
    subdomain: Optional[str] = None


class ResetPassword(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str
    subdomain: Optional[str] = None

# Student Schemas
class StudentBase(BaseModel):
    name: str
    student_class: str
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    academic_year: str
    term: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    student_class: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None
    parent_email: Optional[EmailStr] = None

class StudentResponse(StudentBase):
    id: int
    user_id: int
    total_fees: float
    paid_amount: float
    balance: float
    status: PaymentStatusEnum
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Fee Structure Schemas
class FeeStructureBase(BaseModel):
    academic_year: str
    term: str
    fee_type: str
    amount: float
    level: Optional[str] = "All"

class FeeStructureCreate(FeeStructureBase):
    pass

class FeeStructureUpdate(BaseModel):
    amount: Optional[float] = None
    level: Optional[str] = None

class FeeStructureResponse(FeeStructureBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    student_id: int
    amount: float
    payment_method: str
    fee_type: str
    term: Optional[str] = None
    academic_year: Optional[str] = None
    payment_date: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    user_id: int
    reference: str
    student_name: Optional[str]
    student_class: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Wallet Schemas
class WalletTopUp(BaseModel):
    amount: float
    payment_method: str  # Mobile Money, Cash, Bank Transfer, Card
    reference: Optional[str] = None
    
    @field_validator('amount')
    @classmethod
    def amount_positive(cls, v):
        if v < 5.0:
            raise ValueError('Minimum top-up amount is GHS 5.00')
        return v

class SMSPurchase(BaseModel):
    units: int
    
    @field_validator('units')
    @classmethod
    def units_positive(cls, v):
        if v < 10:
            raise ValueError('Minimum SMS purchase is 10 units')
        return v

class WalletTransactionResponse(BaseModel):
    id: int
    transaction_type: str
    amount: Optional[float]
    sms_units: Optional[int]
    description: Optional[str]
    balance_after: Optional[float]
    sms_balance_after: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# SMS Schemas
class SMSSend(BaseModel):
    recipient: str
    message: str
    
    @field_validator('recipient')
    @classmethod
    def validate_phone(cls, v):
        # Remove spaces and validate format
        v = v.replace(' ', '')
        if not v.startswith('+') and not v.startswith('0'):
            raise ValueError('Phone number must start with + or 0')
        return v

class SMSLogResponse(BaseModel):
    id: int
    recipient: str
    message: str
    status: str
    units_used: int
    created_at: datetime
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionUpgrade(BaseModel):
    plan: SubscriptionPlanEnum
    payment_method: str
    reference: Optional[str] = None

# Dashboard Stats
class DashboardStats(BaseModel):
    total_students: int
    total_collected: float
    total_pending: float
    sms_balance: int
    wallet_balance: float
    recent_payments: List[PaymentResponse]
    subscription_days_left: Optional[int]

# Bulk SMS Schemas
class BulkSMSRequest(BaseModel):
    message: str
    payment_status: Optional[PaymentStatusEnum] = None  # Filter by status
    student_ids: Optional[List[int]] = None  # Or specific students
    
    @field_validator('message')
    @classmethod
    def message_not_empty(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Message cannot be empty')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "message": "Dear {parent_name}, {student_name} has a balance of {balance}. Please make payment. Thank you.",
                "payment_status": "Unpaid",
                "student_ids": None
            }
        }

# Receipt Schemas
class FeeBreakdown(BaseModel):
    fee_type: str
    amount: float
    paid_amount: float
    balance: float
    status: PaymentStatusEnum
    
    class Config:
        from_attributes = True

class PaymentReceipt(BaseModel):
    # Receipt Header
    receipt_number: str
    school_name: str
    school_address: Optional[str]
    school_phone: Optional[str]
    
    # Student Information
    student_name: str
    student_class: str
    parent_name: Optional[str]
    parent_contact: Optional[str]
    
    # Payment Details
    payment_date: datetime
    amount_paid: float
    payment_method: str
    fee_type: str
    term: str
    academic_year: str
    
    # Financial Summary
    total_fees: float
    total_paid: float
    total_balance: float
    payment_status: PaymentStatusEnum
    
    # Fee Breakdown
    fee_breakdown: List[FeeBreakdown]
    
    # Messages
    status_message: str
    thank_you_message: str
