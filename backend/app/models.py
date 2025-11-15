from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime, timedelta

class SubscriptionPlan(str, enum.Enum):
    FREE_TRIAL = "free_trial"
    BASIC = "basic"
    PREMIUM = "premium"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    UNPAID = "Unpaid"
    PARTIAL = "Partial"
    PAID = "Paid"


class School(Base):
    """Tenant (School) model for SaaS"""
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    subdomain = Column(String(100), unique=True, index=True, nullable=False)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(255))
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.FREE_TRIAL)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    users = relationship("User", back_populates="school", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="school", cascade="all, delete-orphan")
    fee_structures = relationship("FeeStructure", back_populates="school", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="school", cascade="all, delete-orphan")
    sms_logs = relationship("SMSLog", back_populates="school", cascade="all, delete-orphan")

class User(Base):
    """Multi-tenant users - each school/institution is a user"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)  # Tenant identifier
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    school_name = Column(String(255), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    phone = Column(String(20))
    address = Column(Text)
    
    # Subscription
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.FREE_TRIAL)
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    subscription_start_date = Column(DateTime, default=func.now())
    subscription_end_date = Column(DateTime)
    
    # SMS Wallet
    wallet_balance = Column(Float, default=0.0)  # GHS
    sms_balance = Column(Integer, default=50)  # Free trial SMS
    
    # Settings
    arkesel_sender_id = Column(String(11), default="CodelabSMS")
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    school = relationship("School", back_populates="users")
    students = relationship("Student", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    fee_structures = relationship("FeeStructure", back_populates="user", cascade="all, delete-orphan")
    wallet_transactions = relationship("WalletTransaction", back_populates="user", cascade="all, delete-orphan")
    sms_logs = relationship("SMSLog", back_populates="user", cascade="all, delete-orphan")

class Student(Base):
    """Students belong to a specific user (tenant)"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Student Info
    name = Column(String(255), nullable=False)
    student_class = Column(String(50), nullable=False)
    gender = Column(String(10))
    date_of_birth = Column(DateTime)
    
    # Parent Info
    parent_name = Column(String(255))
    parent_contact = Column(String(20))
    parent_email = Column(String(255))
    
    # Academic Info
    academic_year = Column(String(20), nullable=False)  # e.g., "2024/2025"
    term = Column(String(20))  # e.g., "Term 1"
    
    # Financial Summary
    total_fees = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="students")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    student_fee_records = relationship("StudentFeeRecord", back_populates="student", cascade="all, delete-orphan")
    school = relationship("School", back_populates="students")

class FeeStructure(Base):
    """Fee types configured by each user (tenant)"""
    __tablename__ = "fee_structures"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    
    academic_year = Column(String(20), nullable=False)
    term = Column(String(20), nullable=False)
    fee_type = Column(String(100), nullable=False)  # e.g., "Tuition", "PTA", "Sports"
    amount = Column(Float, nullable=False)
    level = Column(String(50))  # e.g., "JHS 1", "All"
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="fee_structures")
    school = relationship("School", back_populates="fee_structures")
    student_fee_records = relationship("StudentFeeRecord", back_populates="fee_structure")

class StudentFeeRecord(Base):
    """Tracks individual fee type payment status per student"""
    __tablename__ = "student_fee_records"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False)
    
    fee_type = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    balance = Column(Float)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID)
    term = Column(String(20))
    academic_year = Column(String(20))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="student_fee_records")
    fee_structure = relationship("FeeStructure", back_populates="student_fee_records")

class Payment(Base):
    """Payment transactions"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reference = Column(String(50), unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)  # Cash, Mobile Money, etc.
    fee_type = Column(String(100), nullable=False)
    term = Column(String(20))
    academic_year = Column(String(20))
    payment_date = Column(DateTime, default=func.now())
    
    # Additional Info
    student_name = Column(String(255))
    student_class = Column(String(50))
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    student = relationship("Student", back_populates="payments")
    school = relationship("School", back_populates="payments")

class WalletTransaction(Base):
    """Wallet top-ups and SMS purchases"""
    __tablename__ = "wallet_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    
    transaction_type = Column(String(20), nullable=False)  # topup, sms_purchase, sms_usage
    amount = Column(Float)  # For top-ups and purchases
    sms_units = Column(Integer)  # SMS units involved
    description = Column(Text)
    payment_method = Column(String(50))  # For top-ups
    reference = Column(String(50))
    
    balance_before = Column(Float)
    balance_after = Column(Float)
    sms_balance_before = Column(Integer)
    sms_balance_after = Column(Integer)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="wallet_transactions")
    school = relationship("School")

class SMSLog(Base):
    """SMS sending logs"""
    __tablename__ = "sms_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    
    recipient = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, sent, failed
    units_used = Column(Integer, default=1)
    
    # Arkesel Response
    arkesel_response = Column(Text)
    error_message = Column(Text)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sms_logs")
    school = relationship("School", back_populates="sms_logs")


class SMSPricing(Base):
    """SMS pricing configuration"""
    __tablename__ = "sms_pricing"
    
    id = Column(Integer, primary_key=True, index=True)
    price_per_sms = Column(Float, nullable=False, default=0.10)  # GHS per SMS
    bulk_discount_threshold = Column(Integer, default=1000)  # Minimum units for discount
    bulk_discount_percentage = Column(Float, default=10.0)  # Percentage discount
    
    effective_from = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class SystemSettings(Base):
    """Global system settings"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Free Trial Settings
    free_trial_days = Column(Integer, default=14)
    free_trial_sms = Column(Integer, default=50)
    
    # Subscription Plans
    basic_plan_sms_limit = Column(Integer, default=500)
    premium_plan_sms_limit = Column(Integer, default=2000)
    basic_plan_price = Column(Float, default=29.99)  # GHS per month
    premium_plan_price = Column(Float, default=79.99)  # GHS per month
    
    # System Settings
    maintenance_mode = Column(Boolean, default=False)
    max_students_per_school = Column(Integer, default=1000)
    
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
