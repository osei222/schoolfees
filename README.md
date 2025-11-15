# 🎓 School Fee Management System - Complete Guide

A modern, full-stack school fee management system with SMS integration, built with React and FastAPI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- 🔐 **Multi-tenant Architecture** - Multiple schools on one platform
- 👥 **Student Management** - CRUD operations with payment tracking
- 💰 **Fee Structure Management** - Configurable by year/term/level
- 💳 **Payment Processing** - Record payments with auto-balance calculation
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 🧾 **Professional Receipts** - Detailed receipts with fee breakdown

### Communication Features
- 📱 **SMS Integration** - Arkesel SMS API integration
- 💬 **Automated Receipts** - Auto-send payment receipts via SMS
- 📨 **Bulk Messaging** - Send bulk SMS to filtered students
- 🎯 **Payment Status Filtering** - Target Paid/Unpaid/Partial students
- 📝 **Custom Messages** - Personalized messages based on payment status

### Financial Features
- 💼 **SMS Wallet System** - Buy and manage SMS credits
- 💵 **Wallet Top-up** - Support for multiple payment methods
- 📈 **Transaction History** - Complete audit trail
- 🎁 **Free Trial** - 14 days with 50 free SMS
- 📦 **Subscription Plans** - Basic and Premium tiers

### Smart Features
- ✅ **Auto-fee Assignment** - Students get all term fees automatically
- 🔄 **Real-time Balance Updates** - Auto-calculate after each payment
- 📧 **Status Messages** - Contextual messages (Paid/Partial/Unpaid)
- 🎊 **Congratulatory Messages** - "Well done" when fully paid
- ⚠️ **Unpaid Fee Lists** - Show what remains unpaid

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and serialization
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Arkesel SMS API** - SMS delivery service

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Bootstrap** - UI components
- **React Router** - Client-side routing
- **Context API** - State management
- **React Icons** - Icon library

---

## 🏗 System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   React SPA     │ ◄─────► │   FastAPI       │
│  (Port 5173)    │  HTTP   │  (Port 8000)    │
└─────────────────┘  REST   └─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐    ┌─────▼─────┐   ┌──────▼──────┐
              │ PostgreSQL │    │  Arkesel  │   │    JWT      │
              │  Database  │    │  SMS API  │   │    Auth     │
              └────────────┘    └───────────┘   └─────────────┘
```

### Data Flow

1. **User Registration/Login**
   ```
   Frontend → POST /auth/login → Backend → JWT Token → Frontend (stored)
   ```

2. **Student Creation**
   ```
   Frontend → POST /students/ → Backend → Create Student
                                       → Auto-create Fee Records
                                       → Return Student Data
   ```

3. **Payment Processing**
   ```
   Frontend → POST /payments/?send_sms=true → Backend → Record Payment
                                                      → Update Balances
                                                      → Generate Receipt
                                                      → Send SMS (Arkesel)
                                                      → Return Success
   ```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### One-Command Setup

```powershell
# Run the quick start script
.\quick-start.ps1

# Select option 5: "Start BOTH servers"
```

This will:
1. Check system requirements
2. Start backend on port 8000
3. Start frontend on port 5173
4. Open in separate PowerShell windows

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📝 Detailed Setup

### 1. Backend Setup

```powershell
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure database (optional - create .env file)
# Copy .env.example to .env and update DATABASE_URL

# Initialize database
python init_db.py

# Run setup check
python setup_check.py

# Start server
uvicorn app.main:app --reload

# Or use the PowerShell script
.\start.ps1
```

### 2. Frontend Setup

```powershell
cd school-fee-management

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Database Configuration

**Default Configuration** (works if PostgreSQL is installed with defaults):
```
Host: localhost
Port: 5432
Database: school_fee_db
Username: postgres
Password: postgres
```

**Custom Configuration**:
Create `backend/.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
```

---

## 📚 API Documentation

### Complete API Reference

The backend provides comprehensive API documentation via Swagger UI.

**Access Swagger UI**: http://localhost:8000/docs

### Key Endpoints

#### Authentication
```
POST /auth/register - Register new school
POST /auth/login - Login and get JWT token
GET /auth/me - Get current user info
```

#### Students
```
GET /students/ - List students (with filters)
  ?payment_status=Paid|Unpaid|Partial
  ?search=name
  ?class_name=Grade 10A

POST /students/ - Create student
GET /students/{id} - Get student details
PUT /students/{id} - Update student
DELETE /students/{id} - Delete student
GET /students/statistics/summary - Get statistics
```

#### Payments
```
GET /payments/ - List payments
POST /payments/?send_sms=true - Create payment & send receipt
GET /payments/{id} - Get payment details
GET /payments/{id}/receipt - Get formatted receipt
POST /payments/{id}/send-receipt-sms - Resend receipt
```

#### Fee Structure
```
GET /fees/ - List fee structures
POST /fees/ - Create fee type
PUT /fees/{id} - Update fee type
DELETE /fees/{id} - Delete fee type
GET /fees/summary/ - Get term fee summary
```

#### Wallet & SMS
```
GET /wallet/balance - Get balances
POST /wallet/topup - Top up wallet
POST /wallet/purchase-sms - Buy SMS units
GET /wallet/transactions - Get transaction history
POST /sms/send-bulk - Send bulk SMS
GET /sms/logs - Get SMS logs
```

For detailed examples, see `backend/API_DOCUMENTATION.md`

---

## 🎨 Frontend Pages

### 1. Login Page
- Modern gradient design
- JWT authentication
- Error handling
- Loading states

### 2. Dashboard
- Student statistics (Total, Paid, Unpaid, Partial)
- Financial overview
- Recent payments
- SMS balance
- Quick actions

### 3. Students Page
- List all students
- Filter by payment status
- Search by name
- Add/Edit/Delete students
- View fee records

### 4. Payments Page
- Record new payments
- View payment history
- Filter by student/date
- View/Download receipts
- Resend SMS receipts

### 5. Settings Page
- Fee structure management
- Add fee types by year/term/level
- Set fee amounts
- View fee summary

### 6. Wallet Page
- View SMS balance
- Top up wallet (Mobile Money/Bank Transfer/Cash)
- Purchase SMS units
- Transaction history

### 7. Communication Page
- Send bulk SMS
- Filter by payment status
- Select specific students
- Custom message templates
- View SMS logs

---

## 🧪 Testing

### Backend Testing

```powershell
cd backend

# Test database connection
python setup_check.py

# Test API endpoints
python test_api.py

# Manual testing via Swagger
# Open: http://localhost:8000/docs
```

### Frontend Testing

```powershell
cd school-fee-management

# Run dev server
npm run dev

# Manual testing checklist:
# 1. Register new school
# 2. Login
# 3. Create fee structure
# 4. Add students
# 5. Record payments
# 6. Send SMS receipts
# 7. Check balances update
```

### Integration Testing

1. **Register School via Swagger**
   - Open http://localhost:8000/docs
   - POST /auth/register
   - Save the access_token

2. **Login via Frontend**
   - Open http://localhost:5173
   - Use same credentials
   - Verify dashboard loads

3. **Create Fee Structure**
   - Add Tuition Fee: GHS 850
   - Add Exam Fee: GHS 200
   - Term 1, 2024/2025

4. **Add Student**
   - Name, class, parent details
   - Year: 2024/2025, Term: Term 1
   - Verify fee records auto-created

5. **Make Payment**
   - Select student
   - Amount: GHS 500
   - Enable "Send SMS Receipt"
   - Verify SMS sent
   - Check balance updated

---

## 🚢 Deployment

### Backend Deployment

**Requirements**:
- Python 3.8+
- PostgreSQL database
- Environment variables configured

**Steps**:
1. Set up PostgreSQL database
2. Create `.env` with production settings
3. Run database migrations: `python init_db.py`
4. Use Gunicorn or Uvicorn with multiple workers
5. Set up reverse proxy (Nginx)

**Example with Gunicorn**:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

**Build for production**:
```bash
cd school-fee-management
npm run build
```

**Deploy**:
- Static hosting: Netlify, Vercel, GitHub Pages
- Update API base URL to production backend
- Configure CORS on backend for production domain

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=production-secret-key
ARKESEL_API_KEY=your-api-key
CORS_ORIGINS=https://yourfrontend.com
DEBUG=False
```

**Frontend**:
Update `src/utils/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-api.com';
```

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
```
Error: could not connect to server
Solution:
1. Check PostgreSQL is running: Get-Service postgresql*
2. Verify credentials in .env or config.py
3. Create database: createdb -U postgres school_fee_db
```

**Import Errors**
```
Error: No module named 'fastapi'
Solution:
cd backend
pip install -r requirements.txt
```

**Port Already in Use**
```
Error: Address already in use
Solution:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend Issues

**CORS Errors**
```
Error: CORS policy blocked
Solution:
1. Backend has CORS configured for localhost:5173
2. Check backend/app/main.py CORS settings
3. Verify backend is running
```

**API Request Failed**
```
Error: Failed to fetch
Solution:
1. Check backend is running on port 8000
2. Verify API_BASE_URL in src/utils/api.js
3. Check browser console for details
```

**Login Not Working**
```
Error: Invalid credentials
Solution:
1. Register user first via Swagger or frontend
2. Check username/password are correct
3. Verify JWT token in localStorage after login
```

### SMS Issues

**SMS Not Sending**
```
Error: SMS failed to send
Solution:
1. Check SMS balance is sufficient
2. Verify Arkesel API key is valid
3. Check phone number format (0XXXXXXXXX)
4. Check backend logs for Arkesel errors
```

---

## 📖 Additional Documentation

- **Backend API**: `backend/API_DOCUMENTATION.md`
- **Backend README**: `backend/README.md`
- **Frontend Guide**: `school-fee-management/README.md`
- **Integration Guide**: `FRONTEND_BACKEND_INTEGRATION.md`
- **System Architecture**: `SYSTEM_ARCHITECTURE.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **SMS Pricing Management**: `SMS_PRICING_SETUP.md` ⭐ **NEW!**
- **SMS Pricing Details**: `backend/SMS_PRICING_GUIDE.md`
- **Quick Start**: `backend/QUICKSTART.md`

---

## 🎯 Key Workflows

### Complete School Setup Workflow

1. **Register School**
   ```
   POST /auth/register
   {
     "username": "myschool",
     "email": "admin@school.com",
     "password": "secure123",
     "school_name": "Example School",
     "school_address": "123 Main St",
     "school_phone": "0241234567"
   }
   ```

2. **Create Fee Structure**
   ```
   POST /fees/
   {
     "fee_type": "Tuition Fee",
     "amount": 850,
     "year": "2024/2025",
     "term": "Term 1",
     "level": "All"
   }
   ```

3. **Add Students**
   ```
   POST /students/
   {
     "name": "John Doe",
     "class_name": "Grade 10A",
     "parent_name": "Jane Doe",
     "parent_phone": "0241234567",
     "year": "2024/2025",
     "term": "Term 1"
   }
   ```
   → Fee records auto-created for student

4. **Record Payment**
   ```
   POST /payments/?send_sms=true
   {
     "student_id": 1,
     "amount": 500,
     "fee_type": "Tuition Fee",
     "payment_method": "Cash",
     "term": "Term 1",
     "year": "2024/2025"
   }
   ```
   → Payment recorded
   → Balance updated
   → Receipt sent via SMS

5. **Send Bulk Reminders**
   ```
   POST /sms/send-bulk
   {
     "message": "Reminder: School fees due",
     "payment_status": "Unpaid"
   }
   ```
   → SMS sent to all unpaid students

---

## 🤝 Contributing

This is a school project. For improvements:
1. Test thoroughly
2. Update documentation
3. Follow existing code style
4. Add comments for complex logic

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Support

For issues or questions:
1. Check documentation in `/backend/API_DOCUMENTATION.md`
2. Review troubleshooting section above
3. Check backend logs for errors
4. Use Swagger UI to test endpoints

---

## 🎉 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Backend dependencies installed
- [ ] Database initialized
- [ ] Backend server running (port 8000)
- [ ] Frontend dependencies installed
- [ ] Frontend server running (port 5173)
- [ ] Can access Swagger UI
- [ ] Can register/login from frontend
- [ ] Dashboard loads with data
- [ ] Can create students
- [ ] Can record payments
- [ ] SMS receipts send successfully

---

**🎊 Congratulations! Your school fee management system is ready to use! 🎊**

Start by registering your school at: http://localhost:5173
