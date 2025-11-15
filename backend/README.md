# Backend API

Multi-tenant School Fee Management System - FastAPI Backend

## Features

- ✅ **Multi-Tenant Architecture**: Username-based tenant isolation
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Subscription Management**: Free Trial (14 days, 50 SMS) / Basic / Premium plans
- ✅ **Arkesel SMS Integration**: Hardcoded API key for instant SMS functionality
- ✅ **SMS Wallet**: Top-up, purchase SMS units, transaction tracking
- ✅ **Auto-Generated API Docs**: Swagger UI and ReDoc

## Tech Stack

- **FastAPI**: Modern, high-performance Python web framework
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: ORM for database operations
- **JWT**: Secure authentication
- **Arkesel**: SMS provider integration

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database

```sql
-- Create database
CREATE DATABASE school_fee_management;

-- Create user (optional)
CREATE USER school_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE school_fee_management TO school_admin;
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/school_fee_management
SECRET_KEY=your-very-secure-secret-key-min-32-characters-long
```

### 4. Run Database Migrations

```bash
# The app will auto-create tables on first run
# Or use Alembic for migrations:
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5. Start the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python -m app.main
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/register` - Register new school/user
- `POST /auth/login` - Login with username/password
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile

### SMS Wallet (`/wallet`)

- `POST /wallet/topup` - Top up wallet balance (min GHS 5.00)
- `POST /wallet/purchase-sms` - Purchase SMS units (cost: GHS 0.10/unit)
- `GET /wallet/transactions` - Get transaction history
- `GET /wallet/balance` - Get wallet & SMS balance

### SMS (`/sms`)

- `POST /sms/send` - Send SMS to recipient
- `GET /sms/logs` - Get SMS sending history
- `GET /sms/balance` - Get SMS balance

## Multi-Tenant Data Isolation

Each registered user (school) gets:

1. **Unique username** as tenant identifier
2. **Isolated data** - students, payments, fees
3. **Separate SMS wallet** - individual balance tracking
4. **Custom sender ID** - configurable per school

## Subscription Plans

### Free Trial
- Duration: 14 days
- SMS: 50 units free
- Access: All features

### Basic Plan
- Cost: GHS 29.99/month
- SMS: Purchase as needed (GHS 0.10/unit)
- Access: All features + priority support

### Premium Plan
- Cost: GHS 79.99/month
- SMS: Discounted rates
- Access: All features + advanced analytics + API access

## SMS Integration

Uses **Arkesel SMS API** with hardcoded credentials:

```python
API_KEY = "TlZMTndiYXZzaXJtWWxkTFJOdVI"
SENDER_ID = "CodelabSMS"  # User customizable
API_URL = "https://sms.arkesel.com/sms/api"
```

### SMS Features

- ✅ Auto-send receipts after payment
- ✅ Wallet-based SMS units
- ✅ Transaction logging
- ✅ Delivery status tracking
- ✅ Custom sender ID per school

## Database Schema

### Users Table
- Multi-tenant root - each school is a user
- Contains: subscription info, wallet balance, SMS balance

### Students Table
- Linked to user_id (tenant isolation)
- Contains: student info, parent info, fee totals

### FeeStructures Table
- Custom fee types per user/tenant
- Flexible: year, term, amount, level

### Payments Table
- Transaction records per student
- Linked to user_id for tenant isolation

### WalletTransactions Table
- Top-ups, SMS purchases, SMS usage
- Complete audit trail

### SMSLogs Table
- Every SMS sent/failed logged
- Arkesel API responses stored

## Security Features

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Tenant data isolation
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic)

## Development

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # DB connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── routers/             # API endpoints
│   │   ├── auth.py
│   │   ├── wallet.py
│   │   └── sms.py
│   └── services/            # Business logic
│       ├── auth_service.py
│       └── sms_service.py
├── requirements.txt
├── .env.example
└── README.md
```

### Adding New Routers

```python
# Create router file: app/routers/students.py
from fastapi import APIRouter
router = APIRouter(prefix="/students", tags=["Students"])

# Register in app/main.py
from app.routers import students
app.include_router(students.router)
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Deployment

### Using Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables (Production)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=generate-strong-key-for-production
ALLOWED_ORIGINS=https://yourfrontend.com
```

## Next Steps

1. ✅ Complete remaining routers (students, payments, fees, reports)
2. ✅ Add email notifications
3. ✅ Implement payment gateway (Paystack/Flutterwave)
4. ✅ Add advanced analytics
5. ✅ Deploy to production

## Support

For issues or questions, contact: support@yourschool.com

## License

Proprietary - All rights reserved
