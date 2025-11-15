# 🎯 SMS Pricing Management - Quick Guide

## ✅ What I Added

I've added SMS pricing management that you can control from the backend code. The prices will automatically appear throughout the system (frontend wallet page, API responses, etc.).

---

## 📍 Where to Update Prices

### File: `backend/app/config.py`

```python
# SMS Pricing
SMS_COST_PER_UNIT: float = 0.20  # ← Change this value

# Subscription Plans
FREE_TRIAL_DAYS: int = 10
FREE_TRIAL_SMS_LIMIT: int = 20
BASIC_PLAN_MONTHLY: float = 200  # ← Change this value
PREMIUM_PLAN_MONTHLY: float = 400  # ← Change this value
```

**Just change the numbers, save, and restart the backend!**

---

## 🔧 How It Works

### 1. Backend Configuration
Prices are defined in `backend/app/config.py`:
- SMS cost per unit: **GHS 0.10**
- Basic plan: **GHS 29.99/month**
- Premium plan: **GHS 79.99/month**

### 2. API Endpoint (Public)
```
GET http://localhost:8000/wallet/pricing
```
Returns all current prices and subscription plans.

### 3. Frontend Display
The pricing automatically appears in:
- Wallet page (SMS purchase options)
- Subscription plans page
- Payment calculations

---

## 💡 Example Price Changes

### Change SMS to GHS 0.15 per unit:
```python
# backend/app/config.py
SMS_COST_PER_UNIT: float = 0.15  # Changed from 0.10
```

### Change Basic Plan to GHS 39.99:
```python
# backend/app/config.py
BASIC_PLAN_MONTHLY: float = 39.99  # Changed from 29.99
```

### Give 100 Free SMS in Trial:
```python
# backend/app/config.py
FREE_TRIAL_SMS_LIMIT: int = 100  # Changed from 50
```

**After changes:**
1. Save the file
2. Restart backend: `uvicorn app.main:app --reload`
3. Prices updated everywhere!

---

## 📊 What Gets Updated Automatically

When you change prices in `config.py`:

✅ API `/wallet/pricing` returns new prices  
✅ Frontend wallet page shows new costs  
✅ SMS purchase calculations use new rate  
✅ Subscription plans show new prices  
✅ Balance deductions use new rate  

---

## 🎨 Frontend Integration

The frontend can fetch pricing like this:

```javascript
import { walletAPI } from '../utils/api';

// Get current pricing (no auth needed)
const pricing = await walletAPI.getPricing();

console.log(pricing.sms_pricing.cost_per_unit); // 0.10
console.log(pricing.subscription_plans.basic.monthly_cost); // 29.99
```

Display in Wallet page:
```jsx
<h4>SMS Packages</h4>
<ul>
  <li>100 SMS - GHS {pricing.sms_pricing.packages[0].cost}</li>
  <li>500 SMS - GHS {pricing.sms_pricing.packages[1].cost}</li>
  <li>1000 SMS - GHS {pricing.sms_pricing.packages[2].cost}</li>
</ul>
```

---

## 📁 New Files Created

1. **`backend/app/routers/wallet.py`** (updated)
   - Added `/wallet/pricing` endpoint
   - Returns SMS pricing and subscription plans

2. **`backend/SMS_PRICING_GUIDE.md`** (new)
   - Detailed guide on managing prices
   - Examples and best practices
   - Bulk discount instructions

3. **`school-fee-management/src/utils/api.js`** (updated)
   - Added `walletAPI.getPricing()` method
   - Public endpoint (no authentication)

4. **`backend/API_DOCUMENTATION.md`** (updated)
   - Added pricing endpoint documentation
   - Example responses and usage

---

## 🚀 Quick Test

1. **Check current pricing:**
   ```
   GET http://localhost:8000/wallet/pricing
   ```

2. **Change price in code:**
   ```python
   # backend/app/config.py
   SMS_COST_PER_UNIT: float = 0.12
   ```

3. **Restart backend:**
   ```powershell
   uvicorn app.main:app --reload
   ```

4. **Check again:**
   ```
   GET http://localhost:8000/wallet/pricing
   ```
   You'll see: `"cost_per_unit": 0.12`

---

## 📝 Summary

✅ **Prices controlled in:** `backend/app/config.py`  
✅ **Public API endpoint:** `GET /wallet/pricing`  
✅ **Frontend method:** `walletAPI.getPricing()`  
✅ **Update method:** Edit config → Restart backend  
✅ **No database changes needed**  

---

## 🎯 Current Default Pricing

| Item | Price |
|------|-------|
| SMS per unit | GHS 0.10 |
| 100 SMS | GHS 10.00 |
| 500 SMS | GHS 50.00 |
| 1000 SMS | GHS 100.00 |
| 5000 SMS | GHS 500.00 |
| Free Trial | 14 days, 50 SMS |
| Basic Plan | GHS 29.99/month |
| Premium Plan | GHS 79.99/month |

**Change anytime in `backend/app/config.py`!** 🎊

---

For detailed instructions, see: **`backend/SMS_PRICING_GUIDE.md`**
