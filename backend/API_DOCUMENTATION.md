# 📚 Complete API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register New School
**POST** `/auth/register`

Creates a new school account with Free Trial (14 days, 50 SMS)

**Request Body:**
```json
{
  "username": "greenhill_school",
  "email": "admin@greenhill.edu",
  "password": "secure123",
  "school_name": "Greenhill Academy",
  "phone": "0241234567",
  "address": "123 Main St, Accra"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "greenhill_school",
    "email": "admin@greenhill.edu",
    "school_name": "Greenhill Academy",
    "subscription_plan": "free_trial",
    "subscription_status": "active",
    "wallet_balance": 0.0,
    "sms_balance": 50,
    "is_active": true
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "greenhill_school",
  "password": "secure123"
}
```

**Response:** Same as register

### Get Current User
**GET** `/auth/me`

Requires: `Authorization: Bearer <token>`

**Response:** User object

### Update Profile
**PUT** `/auth/me`

**Request Body:**
```json
{
  "school_name": "Updated School Name",
  "phone": "0241234567",
  "address": "New Address",
  "arkesel_sender_id": "MySchool"
}
```

---

## 👨‍🎓 Students Endpoints

### Create Student
**POST** `/students/`

**Request Body:**
```json
{
  "name": "John Doe",
  "student_class": "JHS 1",
  "gender": "Male",
  "parent_name": "Jane Doe",
  "parent_contact": "0241234567",
  "parent_email": "jane@example.com",
  "academic_year": "2024/2025",
  "term": "Term 1"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "John Doe",
  "student_class": "JHS 1",
  "total_fees": 920.0,
  "paid_amount": 0.0,
  "balance": 920.0,
  "status": "Unpaid",
  "created_at": "2024-11-02T10:30:00"
}
```

### Get All Students (with filters)
**GET** `/students/`

**Query Parameters:**
- `status` - Filter by payment status (Unpaid, Partial, Paid)
- `search` - Search by name or parent name
- `student_class` - Filter by class
- `skip` - Pagination offset (default: 0)
- `limit` - Results per page (default: 100)

**Examples:**
```bash
# Get all unpaid students
GET /students/?status=Unpaid

# Search by name
GET /students/?search=John

# Get students in JHS 1
GET /students/?student_class=JHS 1

# Get partially paid students
GET /students/?status=Partial
```

### Get Student by ID
**GET** `/students/{student_id}`

### Update Student
**PUT** `/students/{student_id}`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "student_class": "JHS 2",
  "parent_contact": "0241111111"
}
```

### Delete Student
**DELETE** `/students/{student_id}`

### Get Student Fee Records
**GET** `/students/{student_id}/fee-records`

Returns all fee records for a student showing payment status per fee type.

### Get Students Statistics
**GET** `/students/statistics/summary`

**Response:**
```json
{
  "total_students": 150,
  "fully_paid": 45,
  "partially_paid": 80,
  "unpaid": 25
}
```

---

## 💰 Payments Endpoints

### Process Payment
**POST** `/payments/`

**Query Parameters:**
- `send_sms` - Send SMS receipt to parent (default: true)

**Request Body:**
```json
{
  "student_id": 1,
  "amount": 100.0,
  "payment_method": "Mobile Money",
  "fee_type": "Tuition",
  "term": "Term 1",
  "academic_year": "2024/2025"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "student_id": 1,
  "reference": "PAY-ABC12345",
  "amount": 100.0,
  "payment_method": "Mobile Money",
  "fee_type": "Tuition",
  "student_name": "John Doe",
  "student_class": "JHS 1",
  "created_at": "2024-11-02T10:35:00"
}
```

**Note:** Automatically updates student balance and sends SMS if enabled.

### Get All Payments
**GET** `/payments/`

**Query Parameters:**
- `student_id` - Filter by student
- `payment_method` - Filter by method
- `skip`, `limit` - Pagination

### Get Payment by ID
**GET** `/payments/{payment_id}`

### Resend Receipt
**POST** `/payments/{payment_id}/resend-receipt`

Resends SMS receipt for a specific payment. Deducts 1 SMS unit.

### **📄 Get Professional Receipt (NEW!)**
**GET** `/payments/{payment_id}/receipt`

Generate a detailed professional receipt with complete fee breakdown.

**Response:**
```json
{
  "receipt_number": "PAY-ABC12345",
  "school_name": "Greenhill Academy",
  "school_address": "123 Main St, Accra",
  "school_phone": "0241234567",
  
  "student_name": "John Doe",
  "student_class": "JHS 1",
  "parent_name": "Jane Doe",
  "parent_contact": "0241234567",
  
  "payment_date": "2024-11-02T10:35:00",
  "amount_paid": 100.0,
  "payment_method": "Mobile Money",
  "fee_type": "Tuition",
  "term": "Term 1",
  "academic_year": "2024/2025",
  
  "total_fees": 920.0,
  "total_paid": 100.0,
  "total_balance": 820.0,
  "payment_status": "Partial",
  
  "fee_breakdown": [
    {
      "fee_type": "Tuition",
      "amount": 850.0,
      "paid_amount": 100.0,
      "balance": 750.0,
      "status": "Partial"
    },
    {
      "fee_type": "PTA",
      "amount": 40.0,
      "paid_amount": 0.0,
      "balance": 40.0,
      "status": "Unpaid"
    },
    {
      "fee_type": "Examination",
      "amount": 30.0,
      "paid_amount": 0.0,
      "balance": 30.0,
      "status": "Unpaid"
    }
  ],
  
  "status_message": "⚠️ PARTIALLY PAID - Balance: GHS 820.00",
  "thank_you_message": "Thank you for your payment. Please clear the remaining balance at your earliest convenience."
}
```

**Status Messages:**
- ✅ **Fully Paid**: "ALL FEES FULLY PAID" + "Well done! All fees have been cleared."
- ⚠️ **Partially Paid**: "PARTIALLY PAID - Balance: GHS X" + Shows unpaid fees breakdown
- ❌ **Unpaid**: "UNPAID - Outstanding: GHS X" + Payment reminder

### **📱 Send Professional Receipt via SMS (NEW!)**
**POST** `/payments/{payment_id}/send-receipt-sms`

Sends a professionally formatted receipt SMS with:
- Payment date & time
- Receipt number
- Student & class information
- Fee type & amount paid
- Payment method
- Complete financial summary
- Fee breakdown (if partially paid)
- Personalized status message

**SMS Format:**
```
*** Greenhill Academy ***
PAYMENT RECEIPT
========================
Date: 02/11/2024 10:35 AM
Receipt: PAY-ABC12345

Student: John Doe
Class: JHS 1
Term: Term 1

PAYMENT DETAILS
Fee Type: Tuition
Amount Paid: GHS 100.00
Method: Mobile Money

SUMMARY
Total Fees: GHS 920.00
Total Paid: GHS 100.00
Balance: GHS 820.00

UNPAID FEES:
- Tuition: GHS 750.00
- PTA: GHS 40.00
- Examination: GHS 30.00

Thank you for your payment!
```

**If Fully Paid:**
```
*** Greenhill Academy ***
PAYMENT RECEIPT
========================
Date: 02/11/2024 02:30 PM
Receipt: PAY-XYZ67890

Student: John Doe
Class: JHS 1
Term: Term 1

PAYMENT DETAILS
Fee Type: Examination
Amount Paid: GHS 30.00
Method: Cash

SUMMARY
Total Fees: GHS 920.00
Total Paid: GHS 920.00
Balance: GHS 0.00

✅ ALL FEES FULLY PAID!
Well done! Fees fully cleared.

Thank you for your payment!
```

**Response:**
```json
{
  "message": "Receipt sent successfully",
  "recipient": "0241234567",
  "sms_balance_remaining": 49
}
```

### **🎯 Send Bulk SMS (NEW!)**
**POST** `/payments/bulk-sms`

Send SMS to multiple parents based on criteria.

**Request Body:**
```json
{
  "message": "Dear {parent_name}, {student_name} has a balance of {balance}. Please make payment. Thank you.",
  "payment_status": "Unpaid",
  "student_ids": null
}
```

**Available Variables:**
- `{student_name}` - Student's name
- `{parent_name}` - Parent's name
- `{balance}` - Outstanding balance
- `{total_fees}` - Total fees amount
- `{paid_amount}` - Amount already paid

**Filter Options:**
1. **By Payment Status:**
```json
{
  "message": "Dear {parent_name}, reminder: {student_name} balance is {balance}",
  "payment_status": "Unpaid"
}
```

2. **Specific Students:**
```json
{
  "message": "Your message here",
  "student_ids": [1, 5, 10, 23]
}
```

3. **All Students:**
```json
{
  "message": "General announcement to all parents",
  "payment_status": null,
  "student_ids": null
}
```

**Response:**
```json
{
  "total_attempted": 25,
  "sent": 23,
  "failed": 2,
  "sms_balance_remaining": 27,
  "details": [
    {
      "student": "John Doe",
      "parent_contact": "0241234567",
      "status": "sent"
    },
    {
      "student": "Jane Smith",
      "status": "failed",
      "reason": "No parent contact"
    }
  ]
}
```

---

## 📋 Fee Structure Endpoints

### Create Fee Type
**POST** `/fees/`

**Request Body:**
```json
{
  "academic_year": "2024/2025",
  "term": "Term 1",
  "fee_type": "Tuition",
  "amount": 850.0,
  "level": "All"
}
```

### Get All Fees (with filters)
**GET** `/fees/`

**Query Parameters:**
- `academic_year` - e.g., "2024/2025"
- `term` - e.g., "Term 1"
- `level` - e.g., "JHS 1"

### Get Fee by ID
**GET** `/fees/{fee_id}`

### Update Fee
**PUT** `/fees/{fee_id}`

**Request Body:**
```json
{
  "amount": 900.0,
  "level": "JHS 1"
}
```

### Delete Fee
**DELETE** `/fees/{fee_id}`

### Get Fee Summary
**GET** `/fees/summary/by-term?academic_year=2024/2025&term=Term 1`

**Response:**
```json
{
  "academic_year": "2024/2025",
  "term": "Term 1",
  "fee_types": [
    {"fee_type": "Tuition", "amount": 850.0, "level": "All"},
    {"fee_type": "PTA", "amount": 40.0, "level": "All"},
    {"fee_type": "Examination", "amount": 50.0, "level": "All"}
  ],
  "total_amount": 940.0,
  "fee_count": 3
}
```

---

## 💵 SMS Wallet Endpoints

### Get SMS Pricing (Public)
**GET** `/wallet/pricing`

**No authentication required** - Public endpoint to display pricing on website/app

**Response:**
```json
{
  "sms_pricing": {
    "cost_per_unit": 0.10,
    "currency": "GHS",
    "packages": [
      {
        "units": 100,
        "cost": 10.0,
        "savings": 0,
        "discount_percentage": 0
      },
      {
        "units": 500,
        "cost": 50.0,
        "savings": 0,
        "discount_percentage": 0
      },
      {
        "units": 1000,
        "cost": 100.0,
        "savings": 0,
        "discount_percentage": 0
      },
      {
        "units": 5000,
        "cost": 500.0,
        "savings": 0,
        "discount_percentage": 0
      }
    ]
  },
  "subscription_plans": {
    "free_trial": {
      "name": "Free Trial",
      "duration_days": 14,
      "sms_included": 50,
      "monthly_cost": 0,
      "features": [
        "Student Management",
        "Payment Processing",
        "50 SMS Credits",
        "14 Days Free"
      ]
    },
    "basic": {
      "name": "Basic Plan",
      "monthly_cost": 29.99,
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
      "monthly_cost": 79.99,
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
```

**Usage:**
- Display pricing on frontend wallet page
- Show subscription plans on signup
- Calculate costs before purchase
- **Update prices in `backend/app/config.py`**

---

### Top Up Wallet
**POST** `/wallet/topup`

**Request Body:**
```json
{
  "amount": 50.0,
  "payment_method": "Mobile Money",
  "reference": "MTN-123456"
}
```

### Purchase SMS Units
**POST** `/wallet/purchase-sms`

**Request Body:**
```json
{
  "units": 100
}
```

Cost: GHS 0.10 per unit (100 units = GHS 10.00)

### Get Wallet Transactions
**GET** `/wallet/transactions?limit=50`

### Get Wallet Balance
**GET** `/wallet/balance`

**Response:**
```json
{
  "wallet_balance": 50.0,
  "sms_balance": 150,
  "sms_cost_per_unit": 0.10,
  "subscription_plan": "free_trial",
  "subscription_status": "active"
}
```

---

## 📱 SMS Endpoints

### Send Single SMS
**POST** `/sms/send`

**Request Body:**
```json
{
  "recipient": "0241234567",
  "message": "Your message here"
}
```

### Get SMS Logs
**GET** `/sms/logs?limit=50`

### Get SMS Balance
**GET** `/sms/balance`

---

## 📊 Complete Workflow Example

### 1. Register School
```bash
POST /auth/register
{
  "username": "myschool",
  "email": "admin@myschool.com",
  "password": "secure123",
  "school_name": "My School"
}
```

### 2. Login & Get Token
```bash
POST /auth/login
→ Get access_token
```

### 3. Create Fee Structure
```bash
POST /fees/
Authorization: Bearer <token>
{
  "academic_year": "2024/2025",
  "term": "Term 1",
  "fee_type": "Tuition",
  "amount": 850.0
}
```

### 4. Add Student
```bash
POST /students/
{
  "name": "John Doe",
  "student_class": "JHS 1",
  "parent_contact": "0241234567",
  "academic_year": "2024/2025",
  "term": "Term 1"
}
→ Auto-creates unpaid fee records
```

### 5. Process Payment
```bash
POST /payments/?send_sms=true
{
  "student_id": 1,
  "amount": 100.0,
  "payment_method": "Cash",
  "fee_type": "Tuition"
}
→ Updates balance & sends SMS receipt
```

### 6. Send Bulk Reminder to Unpaid
```bash
POST /payments/bulk-sms
{
  "message": "Dear {parent_name}, {student_name} balance: {balance}",
  "payment_status": "Unpaid"
}
→ Sends to all unpaid students' parents
```

### 7. Check Statistics
```bash
GET /students/statistics/summary
→ See paid/unpaid counts
```

---

## 🎯 Use Cases

### Use Case 1: Send Reminder to All Unpaid Students
```bash
POST /payments/bulk-sms
{
  "message": "URGENT: Dear {parent_name}, {student_name} has outstanding fees of {balance}. Please pay to avoid inconvenience.",
  "payment_status": "Unpaid"
}
```

### Use Case 2: Send Custom Message to Specific Students
```bash
POST /payments/bulk-sms
{
  "message": "Dear parent, {student_name} has been selected for sports day. Contact school for details.",
  "student_ids": [1, 5, 10, 15, 20]
}
```

### Use Case 3: General Announcement
```bash
POST /payments/bulk-sms
{
  "message": "School will be closed on Monday for national holiday. Resume Tuesday.",
  "payment_status": null
}
```

### Use Case 4: Thank Fully Paid Students
```bash
POST /payments/bulk-sms
{
  "message": "Thank you {parent_name} for prompt payment of {student_name}'s fees!",
  "payment_status": "Paid"
}
```

---

## 🚀 Testing with cURL

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testschool","email":"test@school.com","password":"test123","school_name":"Test School"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testschool","password":"test123"}'

# Get students (with token)
curl -X GET http://localhost:8000/students/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send bulk SMS to unpaid
curl -X POST http://localhost:8000/payments/bulk-sms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Payment reminder","payment_status":"Unpaid"}'
```

---

## 📖 Interactive Documentation

Visit these URLs after starting the server:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

### ✅ Complete Feature List

- [x] Multi-tenant user registration
- [x] JWT authentication
- [x] Student CRUD with payment status
- [x] Fee structure management
- [x] Payment processing with auto-balance
- [x] **Professional receipt generation**
- [x] **Detailed fee breakdown in receipts**
- [x] **Smart status messages (Paid/Partial/Unpaid)**
- [x] **Automatic SMS receipts with full details**
- [x] **Personalized "Well Done" message for fully paid**
- [x] **Unpaid fees list in receipts**
- [x] Bulk SMS to filtered students
- [x] Custom message templates
- [x] Payment status filtering
- [x] SMS wallet management
- [x] Transaction history
- [x] Subscription management
- [x] Complete API documentation

## 🎯 Receipt Features Summary

### Automatic Receipt Generation
When a payment is made with `send_sms=true`, the system automatically:

1. **Calculates balances** for all fee types
2. **Generates professional receipt** with:
   - School header with name, address, phone
   - Date & time of payment
   - Unique receipt number
   - Student & parent information
   - Payment details (amount, method, fee type)
   - Financial summary (total fees, paid, balance)
   
3. **Shows payment status**:
   - ✅ **Fully Paid**: Congratulatory "Well done" message
   - ⚠️ **Partially Paid**: Lists all unpaid fees with amounts
   - ❌ **Unpaid**: Shows outstanding amount

4. **Sends via SMS** to parent's contact number
5. **Logs transaction** for audit trail

### Receipt Endpoints
- **GET** `/payments/{id}/receipt` - View receipt (JSON)
- **POST** `/payments/{id}/send-receipt-sms` - Send via SMS
- **POST** `/payments/` with `?send_sms=true` - Auto-send on payment

Your backend is now **production-ready** with professional receipts! 🎉
