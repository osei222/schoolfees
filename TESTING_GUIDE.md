# 🧪 Testing Guide - School Fee Management System

## Quick Test Commands

### Start Everything (Recommended)
```powershell
# Run from project root
.\quick-start.ps1

# Select option 5: "Start BOTH servers"
```

This opens two PowerShell windows:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173

---

## 📋 Step-by-Step Testing

### Phase 1: Backend Setup (5 minutes)

#### 1.1 Install PostgreSQL
```powershell
# Check if already installed
Get-Service postgresql*

# If not installed, download from:
# https://www.postgresql.org/download/windows/
```

#### 1.2 Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

#### 1.3 Initialize Database
```powershell
python init_db.py
```

**Expected Output:**
```
✓ Database tables created successfully!
✓ Ready to use!
```

#### 1.4 Start Backend
```powershell
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### 1.5 Verify Backend
Open: http://localhost:8000/docs

You should see Swagger UI with all endpoints.

---

### Phase 2: Backend API Tests (10 minutes)

#### 2.1 Register a School
**Endpoint:** POST /auth/register

**Request Body:**
```json
{
  "username": "testschool",
  "email": "admin@testschool.com",
  "password": "test123",
  "school_name": "Test School",
  "school_address": "123 Test Street",
  "school_phone": "0241234567"
}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "username": "testschool",
  "email": "admin@testschool.com",
  "school_name": "Test School",
  "subscription_plan": "Free Trial",
  "subscription_status": "active",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**✅ Save the `access_token` - you'll need it!**

---

#### 2.2 Authorize in Swagger
1. Click the green **"Authorize"** button (top right)
2. Enter: `Bearer YOUR_ACCESS_TOKEN_HERE`
3. Click **"Authorize"**
4. All endpoints are now authenticated!

---

#### 2.3 Create Fee Structure
**Endpoint:** POST /fees/

**Request Body:**
```json
{
  "fee_type": "Tuition Fee",
  "amount": 850,
  "year": "2024/2025",
  "term": "Term 1",
  "level": "All"
}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "fee_type": "Tuition Fee",
  "amount": 850,
  "year": "2024/2025",
  "term": "Term 1",
  "level": "All",
  "user_id": 1
}
```

**Repeat for more fee types:**
```json
{
  "fee_type": "Exam Fee",
  "amount": 200,
  "year": "2024/2025",
  "term": "Term 1",
  "level": "All"
}
```

---

#### 2.4 Create a Student
**Endpoint:** POST /students/

**Request Body:**
```json
{
  "name": "John Doe",
  "class_name": "Grade 10A",
  "parent_name": "Jane Doe",
  "parent_phone": "0241234567",
  "parent_email": "jane@email.com",
  "year": "2024/2025",
  "term": "Term 1"
}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "class_name": "Grade 10A",
  "parent_name": "Jane Doe",
  "parent_phone": "0241234567",
  "parent_email": "jane@email.com",
  "total_fees": 1050,
  "total_paid": 0,
  "balance": 1050,
  "payment_status": "Unpaid",
  "year": "2024/2025",
  "term": "Term 1"
}
```

**✅ Note:** Student automatically gets all fee types assigned!

---

#### 2.5 Get Student's Fee Records
**Endpoint:** GET /students/1/fee-records

**Expected Response:**
```json
[
  {
    "id": 1,
    "student_id": 1,
    "fee_structure_id": 1,
    "fee_type": "Tuition Fee",
    "amount": 850,
    "paid_amount": 0,
    "balance": 850,
    "status": "Unpaid"
  },
  {
    "id": 2,
    "student_id": 1,
    "fee_structure_id": 2,
    "fee_type": "Exam Fee",
    "amount": 200,
    "paid_amount": 0,
    "balance": 200,
    "status": "Unpaid"
  }
]
```

---

#### 2.6 Make a Payment (WITHOUT SMS)
**Endpoint:** POST /payments/?send_sms=false

**Request Body:**
```json
{
  "student_id": 1,
  "amount": 500,
  "fee_type": "Tuition Fee",
  "payment_method": "Cash",
  "term": "Term 1",
  "year": "2024/2025"
}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "student_id": 1,
  "amount": 500,
  "fee_type": "Tuition Fee",
  "payment_method": "Cash",
  "created_at": "2024-11-02T12:00:00",
  "receipt_number": "RCP20241102120000"
}
```

---

#### 2.7 Verify Balance Updated
**Endpoint:** GET /students/1

**Expected Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "total_fees": 1050,
  "total_paid": 500,
  "balance": 550,
  "payment_status": "Partial"  // ✅ Changed from Unpaid!
}
```

---

#### 2.8 Get Payment Receipt
**Endpoint:** GET /payments/1/receipt

**Expected Response:**
```json
{
  "receipt_number": "RCP20241102120000",
  "school_name": "Test School",
  "school_address": "123 Test Street",
  "school_phone": "0241234567",
  "student_name": "John Doe",
  "class_name": "Grade 10A",
  "parent_name": "Jane Doe",
  "parent_phone": "0241234567",
  "payment_date": "2024-11-02T12:00:00",
  "amount": 500,
  "payment_method": "Cash",
  "fee_type": "Tuition Fee",
  "total_fees": 1050,
  "total_paid": 500,
  "total_balance": 550,
  "payment_status": "Partial",
  "fee_breakdown": [
    {
      "fee_type": "Tuition Fee",
      "amount": 850,
      "paid_amount": 500,
      "balance": 350,
      "status": "Partial"
    },
    {
      "fee_type": "Exam Fee",
      "amount": 200,
      "paid_amount": 0,
      "balance": 200,
      "status": "Unpaid"
    }
  ],
  "status_message": "⚠️ PARTIALLY PAID - Balance Remaining: GHS 550.00",
  "thank_you_message": "Thank you for your payment."
}
```

---

#### 2.9 Test Payment with SMS
**Endpoint:** POST /payments/?send_sms=true

**Request Body:**
```json
{
  "student_id": 1,
  "amount": 550,
  "fee_type": "Mixed",
  "payment_method": "Mobile Money",
  "term": "Term 1",
  "year": "2024/2025"
}
```

**Expected:**
- Payment recorded ✅
- Balance = 0 ✅
- Status = "Paid" ✅
- SMS sent to parent's phone ✅

**Check SMS Log:**
**Endpoint:** GET /sms/logs?limit=10

---

### Phase 3: Frontend Setup (5 minutes)

#### 3.1 Install Frontend Dependencies
```powershell
cd school-fee-management
npm install
```

#### 3.2 Start Frontend
```powershell
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

### Phase 4: Frontend Integration Tests (15 minutes)

#### 4.1 Test Login
1. Open: http://localhost:5173
2. Enter credentials from Phase 2.1:
   - Username: `testschool`
   - Password: `test123`
3. Click **"Sign In"**

**Expected:**
- No errors in browser console ✅
- Redirected to dashboard ✅
- Loading spinner appears briefly ✅
- Dashboard shows data ✅

---

#### 4.2 Verify Dashboard Data
**Check Dashboard Cards:**

- **Total Students**: Should show 1
- **Total Collected**: Should show GHS 1,050 (500 + 550)
- **Outstanding Balance**: Should show GHS 0
- **School Wallet**: Shows wallet balance

**Browser Console Check:**
```javascript
// Open DevTools (F12) > Console
// Should NOT see any errors
// Should see API calls to localhost:8000
```

---

#### 4.3 Test Students List
1. Navigate to **"Students"** page (sidebar)
2. Verify:
   - John Doe appears in list ✅
   - Status shows "Paid" ✅
   - Balance shows GHS 0 ✅

---

#### 4.4 Test Adding New Student
1. Click **"Add Student"** button
2. Fill form:
   ```
   Name: Mary Smith
   Class: Grade 9B
   Parent Name: John Smith
   Parent Phone: 0242345678
   Parent Email: john@email.com
   Year: 2024/2025
   Term: Term 1
   ```
3. Click **"Save"**

**Expected:**
- Success message ✅
- New student appears in list ✅
- Student has "Unpaid" status ✅
- Total fees = GHS 1,050 (auto-assigned) ✅

---

#### 4.5 Test Making Payment
1. Navigate to **"Payments"** page
2. Click **"New Payment"**
3. Fill form:
   ```
   Student: Mary Smith
   Amount: GHS 300
   Fee Type: Tuition Fee
   Payment Method: Cash
   Send SMS Receipt: ✓ (checked)
   ```
4. Click **"Submit Payment"**

**Expected:**
- Payment recorded ✅
- Receipt displayed ✅
- SMS sent (if SMS balance available) ✅
- Mary's balance updated to GHS 750 ✅
- Status changed to "Partial" ✅

---

#### 4.6 Test Fee Structure Management
1. Navigate to **"Settings"** page
2. Click **"Add Fee Type"**
3. Fill form:
   ```
   Fee Type: Library Fee
   Amount: GHS 100
   Academic Year: 2024/2025
   Term: Term 1
   Level: All
   ```
4. Click **"Save"**

**Expected:**
- New fee type added ✅
- Total fees for term updated ✅
- New students will get this fee automatically ✅

---

#### 4.7 Test SMS Wallet
1. Navigate to **"Wallet"** page
2. View current balances:
   - Wallet Balance: GHS X
   - SMS Balance: Y units

3. **Top Up Wallet:**
   - Click "Top Up"
   - Amount: GHS 100
   - Method: Mobile Money
   - Submit

4. **Purchase SMS:**
   - Click "Buy SMS"
   - Units: 100
   - Cost: GHS 10 (0.10 per SMS)
   - Submit

**Expected:**
- Wallet balance decreases ✅
- SMS balance increases ✅
- Transaction appears in history ✅

---

#### 4.8 Test Bulk SMS
1. Navigate to **"Communication"** page
2. Filter students:
   - Payment Status: **"Unpaid"**
3. Enter message:
   ```
   Dear parent, this is a reminder about outstanding school fees. 
   Please pay at your earliest convenience. Thank you.
   ```
4. Click **"Send Bulk SMS"**

**Expected:**
- SMS sent to all unpaid students' parents ✅
- SMS balance decreases ✅
- SMS log shows sent messages ✅

---

## 🎯 Test Scenarios

### Scenario 1: New School Registration
```
1. Register school via frontend
2. Login automatically
3. See empty dashboard (0 students)
4. Add fee structure
5. Add first student
6. Record first payment
7. See updated statistics
```

### Scenario 2: End of Term Workflow
```
1. Create new term fees (Term 2)
2. Update all students to Term 2
3. View outstanding balances
4. Send bulk fee reminders to unpaid students
5. Record payments as they come
6. Track collection progress on dashboard
```

### Scenario 3: Full Payment Cycle
```
1. Add student (GHS 1,050 total)
2. Payment 1: GHS 500 (Status: Partial, SMS sent)
3. Payment 2: GHS 300 (Status: Partial, SMS sent)
4. Payment 3: GHS 250 (Status: Paid, "Well done" SMS sent)
5. View all receipts
```

---

## 🔍 Debugging Checklist

### Backend Issues

**Server won't start:**
```powershell
# Check port 8000
netstat -ano | findstr :8000

# Kill process if occupied
taskkill /PID <PID> /F

# Check PostgreSQL
Get-Service postgresql*
```

**Database errors:**
```powershell
# Reinitialize database
python init_db.py

# Check database exists
psql -U postgres -l
```

**Import errors:**
```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

### Frontend Issues

**Login fails:**
1. Check backend is running (port 8000)
2. Open DevTools > Network tab
3. Look for POST /auth/login request
4. Check response (should be 200)
5. Verify token in localStorage

**No data showing:**
1. Check browser console for errors
2. Verify API_BASE_URL in src/utils/api.js
3. Check JWT token exists
4. Try logging out and in again

**CORS errors:**
1. Check backend CORS configuration
2. Verify frontend URL is http://localhost:5173
3. Restart both servers

---

## ✅ Success Criteria

Your system is working perfectly when:

- [ ] Backend Swagger shows all 6 routers
- [ ] Can register school from frontend
- [ ] Login redirects to dashboard
- [ ] Dashboard loads real data (not mock)
- [ ] Can add students with auto-fee assignment
- [ ] Payments update balances automatically
- [ ] SMS receipts send successfully
- [ ] Wallet operations work (topup, purchase, deduct)
- [ ] Bulk SMS sends to filtered students
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## 📊 Test Data Summary

After completing all tests, you should have:

**Users:**
- 1 school (testschool)

**Fee Structure:**
- Tuition Fee: GHS 850
- Exam Fee: GHS 200
- Library Fee: GHS 100
- **Total per student:** GHS 1,150

**Students:**
- John Doe (Paid, GHS 0 balance)
- Mary Smith (Partial, GHS 750 balance)

**Payments:**
- 3 payments totaling GHS 1,400

**SMS:**
- Several SMS sent (receipts + bulk)
- SMS balance reduced accordingly

---

## 🚀 Next Steps After Testing

1. **Production Setup:**
   - Deploy backend to cloud (Heroku, DigitalOcean, AWS)
   - Deploy frontend (Netlify, Vercel)
   - Configure production database
   - Set environment variables

2. **Additional Features:**
   - Email notifications
   - PDF receipt downloads
   - Advanced analytics
   - User roles (Admin, Accountant)
   - Academic year rollover

3. **Optimizations:**
   - Add caching (Redis)
   - Implement pagination
   - Add search indexes
   - Optimize database queries

---

**🎊 Happy Testing! Your school fee system is production-ready! 🎊**
