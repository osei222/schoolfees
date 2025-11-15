# 🚀 Quick Start Guide - Backend Setup

## Prerequisites Check

```bash
# Check Python version (need 3.9+)
python --version

# Check PostgreSQL
psql --version
```

## Step 1: Install PostgreSQL (if not installed)

### Windows
Download from: https://www.postgresql.org/download/windows/

### Or use Docker
```bash
docker run --name school-fee-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL console:
CREATE DATABASE school_fee_management;
\q
```

## Step 3: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Verify setup
python setup_check.py
```

## Step 4: Configure Environment

Edit `.env` file:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/school_fee_management
SECRET_KEY=your-32-character-secret-key-here
```

## Step 5: Start Server

```bash
# Development mode (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## Step 6: Test API

### Open Browser
- **Swagger Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Test Registration (using Swagger UI)

1. Go to http://localhost:8000/docs
2. Click on `POST /auth/register`
3. Click "Try it out"
4. Enter test data:

```json
{
  "username": "testschool",
  "email": "test@school.com",
  "password": "secure123",
  "school_name": "Test School",
  "phone": "0241234567"
}
```

5. Click "Execute"
6. You'll get a JWT token and user data!

### Test Login

```json
{
  "username": "testschool",
  "password": "secure123"
}
```

### Test SMS Wallet

1. Copy the `access_token` from login response
2. Click the 🔒 "Authorize" button at top
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. Now you can call protected endpoints!

Try:
- `GET /wallet/balance` - Check wallet
- `POST /wallet/topup` - Add funds
- `POST /wallet/purchase-sms` - Buy SMS units
- `POST /sms/send` - Send SMS

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          React Frontend (Port 5173)             │
│  - Student Registration                         │
│  - Payment Processing                           │
│  - SMS Wallet Management                        │
└────────────────┬────────────────────────────────┘
                 │ HTTP/REST API
                 │ JWT Authentication
┌────────────────▼────────────────────────────────┐
│        FastAPI Backend (Port 8000)              │
│  - Multi-tenant (username-based)                │
│  - JWT Auth + Subscription Logic                │
│  - SMS Wallet Management                        │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│  PostgreSQL  │  │ Arkesel SMS   │
│   Database   │  │   Provider    │
│              │  │               │
│ • Users      │  │ • Send SMS    │
│ • Students   │  │ • Track Logs  │
│ • Payments   │  │ • Receipts    │
│ • Fees       │  └───────────────┘
│ • Wallet     │
│ • SMS Logs   │
└──────────────┘
```

## Multi-Tenant Flow

```
User Registration (testschool)
    ↓
Auto-create tenant database records
    ↓
JWT token with username claim
    ↓
All API calls filtered by user_id
    ↓
Complete data isolation per school
```

## Subscription Flow

```
New User → Free Trial (14 days, 50 SMS)
    ↓
Trial Expires → Upgrade Required
    ↓
Basic Plan (GHS 29.99/month) or Premium (GHS 79.99/month)
    ↓
Active Subscription → Full Access
```

## SMS Flow

```
1. User tops up wallet (GHS)
2. Purchase SMS units (GHS 0.10 per unit)
3. Send SMS → Deduct 1 unit
4. Log transaction + Arkesel API response
5. Update student/parent with receipt
```

## Common Issues

### Issue: Database connection failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
# or check Windows Services

# Test connection
psql -U postgres -h localhost -d school_fee_management
```

### Issue: Module not found
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: CORS error from frontend
```bash
# Add frontend URL to .env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Production Deployment

### 1. Generate Strong Secret Key
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 2. Set Production Database
```env
DATABASE_URL=postgresql://user:pass@production-host:5432/dbname
```

### 3. Deploy with Gunicorn
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 4. Use Nginx as Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.yourschool.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Next Steps

✅ Backend is ready!
✅ Now update your React frontend to use the API

Update `DataContext.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:8000';

// Register user
const response = await fetch(`${API_BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

// Authenticated requests
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE_URL}/students`, {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

🎉 **You're all set!** Your multi-tenant school fee management system is ready to use!
