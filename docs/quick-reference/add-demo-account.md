# Quick Reference: Add a Demo Account

**⏱️ Time**: 5 minutes

---

## TL;DR

Add one entry to `DEMO_ACCOUNTS` array in `scripts/auth.js`

---

## Step-by-Step

### 1. Open Auth Service

**File**: `scripts/auth.js`

### 2. Find DEMO_ACCOUNTS Array

Located near the top of the file:

```javascript
const DEMO_ACCOUNTS = [
  {
    company: 'Sunbelt Homes',
    email: 'sarah.martinez@sunbelthomes.com',
    persona: 'sarah'
  },
  // ... more accounts
];
```

### 3. Add Your Account

```javascript
const DEMO_ACCOUNTS = [
  // ... existing accounts
  
  {
    company: 'Your Company Name',
    email: 'user@company.com',
    persona: 'persona_id'  // Must match persona-config.js
  }
];
```

### 4. Verify Persona ID

Make sure `persona_id` exists in `scripts/persona-config.js`:

```javascript
export const PERSONAS = {
  // ...
  YOUR_PERSONA: {
    id: 'persona_id',  // This ID
    // ... rest of config
  }
};
```

---

## Current Demo Accounts

| Company | Email | Password | Persona | Role |
|---------|-------|----------|---------|------|
| Sunbelt Homes | sarah.martinez@sunbelthomes.com | any | sarah | Production Builder |
| Custom Builders LLC | marcus.johnson@custombuilders.com | any | marcus | General Contractor |
| Elite Remodeling | lisa.chen@eliteremodeling.com | any | lisa | Remodeling Contractor |
| Thompson Residence | david.thompson@gmail.com | any | david | Pro Homeowner |
| Precision Lumber | kevin.rodriguez@precisionlumber.com | any | kevin | Store Manager |

**Note**: In demo mode, any password works!

---

## Testing

1. Open login page: `/pages/login.html`
2. Select your company from dropdown
3. Email should auto-fill
4. Enter any password
5. Click "Sign In"
6. Should redirect to persona's default dashboard

---

## Troubleshooting

**Account not appearing in dropdown?**
- Check you added it to `DEMO_ACCOUNTS` array
- Make sure file is saved

**Login fails?**
- Verify `persona` ID matches `scripts/persona-config.js`
- Check browser console for errors

**Wrong dashboard appears?**
- Check `defaultRoute` in persona config
- Verify persona ID is correct

---

## Need More Detail?

**Auth implementation**: [phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md)  
**Persona config**: [quick-reference/implement-persona.md](./implement-persona.md)

---

**Back to**: [IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)


