# SMS Pricing Configuration Guide

## How to Update SMS Pricing

The SMS pricing is controlled in the backend configuration file. Here's how to update it:

### File Location
```
backend/app/config.py
```

### Current Pricing Settings

```python
# SMS Pricing
SMS_COST_PER_UNIT: float = 0.10  # GHS per SMS

# Subscription Plans
FREE_TRIAL_DAYS: int = 14
FREE_TRIAL_SMS_LIMIT: int = 50
BASIC_PLAN_MONTHLY: float = 29.99  # GHS per month
PREMIUM_PLAN_MONTHLY: float = 79.99  # GHS per month
```

---

## Quick Price Update Examples

### Example 1: Change SMS Price to GHS 0.15
```python
# In backend/app/config.py
SMS_COST_PER_UNIT: float = 0.15  # Changed from 0.10
```

### Example 2: Change Basic Plan Price
```python
# In backend/app/config.py
BASIC_PLAN_MONTHLY: float = 39.99  # Changed from 29.99
```

### Example 3: Increase Free Trial SMS
```python
# In backend/app/config.py
FREE_TRIAL_SMS_LIMIT: int = 100  # Changed from 50
```

---

## Price Changes via Environment Variables

You can also set prices using environment variables without editing code:

### Create/Edit `.env` file in backend folder:
```env
# SMS Pricing
SMS_COST_PER_UNIT=0.12

# Subscription Plans
FREE_TRIAL_DAYS=14
FREE_TRIAL_SMS_LIMIT=50
BASIC_PLAN_MONTHLY=34.99
PREMIUM_PLAN_MONTHLY=89.99
```

**Priority:** `.env` file overrides `config.py` defaults

---

## How Pricing Appears in the System

### 1. Wallet Page
When users visit the Wallet page, they see:
- Current SMS price per unit
- Suggested packages (100, 500, 1000, 5000 SMS)
- Total cost calculated automatically

### 2. Purchase SMS
When buying SMS:
```
100 SMS × GHS 0.10 = GHS 10.00
500 SMS × GHS 0.10 = GHS 50.00
1000 SMS × GHS 0.10 = GHS 100.00
```

### 3. Subscription Plans
On signup/upgrade pages:
- Free Trial: 14 days, 50 SMS
- Basic: GHS 29.99/month, 500 SMS
- Premium: GHS 79.99/month, 2000 SMS

---

## API Endpoint for Pricing

### Get Current Pricing (Public Endpoint)
```
GET http://localhost:8000/wallet/pricing
```

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
      "features": [...]
    },
    "basic": {
      "name": "Basic Plan",
      "monthly_cost": 29.99,
      "sms_included": 500,
      "features": [...]
    },
    "premium": {
      "name": "Premium Plan",
      "monthly_cost": 79.99,
      "sms_included": 2000,
      "features": [...]
    }
  }
}
```

---

## Adding Bulk Discounts (Advanced)

To add discounts for bulk purchases, modify the pricing endpoint in `backend/app/routers/wallet.py`:

### Example: 5% off for 1000+ SMS, 10% off for 5000+ SMS

```python
@router.get("/pricing")
async def get_sms_pricing():
    base_cost = settings.SMS_COST_PER_UNIT
    
    return {
        "sms_pricing": {
            "cost_per_unit": base_cost,
            "currency": "GHS",
            "packages": [
                {
                    "units": 100,
                    "cost": 100 * base_cost,
                    "savings": 0,
                    "discount_percentage": 0
                },
                {
                    "units": 500,
                    "cost": 500 * base_cost,
                    "savings": 0,
                    "discount_percentage": 0
                },
                {
                    "units": 1000,
                    "cost": 1000 * base_cost * 0.95,  # 5% discount
                    "savings": 1000 * base_cost * 0.05,
                    "discount_percentage": 5
                },
                {
                    "units": 5000,
                    "cost": 5000 * base_cost * 0.90,  # 10% discount
                    "savings": 5000 * base_cost * 0.10,
                    "discount_percentage": 10
                }
            ]
        },
        ...
    }
```

---

## Testing Price Changes

### 1. Update Price in Code
```python
# backend/app/config.py
SMS_COST_PER_UNIT: float = 0.15  # New price
```

### 2. Restart Backend
```powershell
# Stop server (Ctrl+C)
# Start again
uvicorn app.main:app --reload
```

### 3. Check Pricing Endpoint
```
GET http://localhost:8000/wallet/pricing
```

### 4. Verify in Frontend
- Go to Wallet page
- Check SMS purchase options
- Prices should reflect new rate

---

## Price History Tracking (Optional)

To track price changes over time, you can:

1. Add a `SMSPricing` model to store historical prices
2. Create admin endpoint to update prices
3. Log all price changes with timestamps
4. Show price history in admin dashboard

### Example Model:
```python
class SMSPricing(Base):
    __tablename__ = "sms_pricing"
    
    id = Column(Integer, primary_key=True, index=True)
    cost_per_unit = Column(Float)
    effective_from = Column(DateTime)
    effective_to = Column(DateTime, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Recommended Pricing Strategy

### SMS Pricing:
- **Start Low:** GHS 0.08 - 0.10 per SMS
- **Bulk Discounts:** 5-10% off for 1000+ SMS
- **Review Monthly:** Adjust based on Arkesel costs

### Subscription Plans:
- **Free Trial:** 14 days, 50 SMS (acquisition)
- **Basic:** GHS 29.99, 500 SMS (small schools)
- **Premium:** GHS 79.99, 2000 SMS (large schools)

### Price Increases:
- Give 30 days notice
- Grandfather existing users for 3 months
- Offer annual plans with discount

---

## Quick Reference

| What to Change | Where to Edit | How |
|----------------|---------------|-----|
| SMS Price | `backend/app/config.py` | `SMS_COST_PER_UNIT = 0.10` |
| Free Trial Days | `backend/app/config.py` | `FREE_TRIAL_DAYS = 14` |
| Free Trial SMS | `backend/app/config.py` | `FREE_TRIAL_SMS_LIMIT = 50` |
| Basic Plan Price | `backend/app/config.py` | `BASIC_PLAN_MONTHLY = 29.99` |
| Premium Plan Price | `backend/app/config.py` | `PREMIUM_PLAN_MONTHLY = 79.99` |
| Add Discounts | `backend/app/routers/wallet.py` | Edit `/pricing` endpoint |

---

## After Changing Prices

1. ✅ Update `config.py` or `.env`
2. ✅ Restart backend server
3. ✅ Test pricing endpoint
4. ✅ Check frontend wallet page
5. ✅ Update documentation if needed
6. ✅ Notify users of price changes

---

**💡 Pro Tip:** Use environment variables (`.env`) for easy price changes without touching code!

**🎯 Current Pricing:** SMS = GHS 0.10, Basic = GHS 29.99, Premium = GHS 79.99
