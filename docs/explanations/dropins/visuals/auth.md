# Auth Dropin

**What it does**: Handles customer authentication - sign in, sign up, and password reset
**Pages**: `/login`, `/signup`, `/reset-password`

---

## Two Login Experiences

BuildRight has two ways to log in:

| Experience | Purpose | Page |
|------------|---------|------|
| **Quick Login (Demo)** | Fast persona switching for demonstrations | `/login` |
| **Standard Login** | Normal email/password authentication | `/login` (tab) |

---

## Login Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN PAGE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ LOGIN                                                               ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  ┌────────────────────────┬────────────────────────┐                ║    │
│  ║  │   [ Email Login ]      │   [ Quick Login ]      │  ◄── Tabs      ║    │
│  ║  └────────────────────────┴────────────────────────┘                ║    │
│  ║                                                                     ║    │
│  ║  EMAIL LOGIN TAB:                                                   ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Email Address                                                 │  ║    │
│  ║  │ [_______________________________________]                     │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Password                                                      │  ║    │
│  ║  │ [_______________________________________]                     │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ ☐ Remember me                                                 │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │              [ Sign In ]                                      │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Forgot password?          Don't have an account? Sign up      │  ║    │
│  ║  │                                                               │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  QUICK LOGIN TAB (Demo Only):                                       ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Select a Persona                                              │  ║    │
│  ║  │ [ Sarah Martinez - Production Builder        ▼]               │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ ┌─────────────────────────────────────────────────────────┐   │  ║    │
│  ║  │ │ Sarah Martinez                                          │   │  ║    │
│  ║  │ │ Production Builder at BuildRight Construction           │   │  ║    │
│  ║  │ │                                                         │   │  ║    │
│  ║  │ │ • Sees: Production-focused products                     │   │  ║    │
│  ║  │ │ • Pricing: Bulk/volume discounts                        │   │  ║    │
│  ║  │ │ • Features: Project builder, BOM generator              │   │  ║    │
│  ║  │ └─────────────────────────────────────────────────────────┘   │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │              [ Login as Sarah ]                               │  ║    │
│  ║  │                                                               │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOOTER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Sign Up Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SIGN UP PAGE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ CREATE ACCOUNT                                                      ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  First Name              Last Name                                  ║    │
│  ║  [________________]      [________________]                         ║    │
│  ║                                                                     ║    │
│  ║  Email Address                                                      ║    │
│  ║  [_______________________________________]                          ║    │
│  ║                                                                     ║    │
│  ║  Password                                                           ║    │
│  ║  [_______________________________________]                          ║    │
│  ║                                                                     ║    │
│  ║  Confirm Password                                                   ║    │
│  ║  [_______________________________________]                          ║    │
│  ║                                                                     ║    │
│  ║                    [ Create Account ]                               ║    │
│  ║                                                                     ║    │
│  ║  Already have an account? Sign in                                   ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Available Personas (Demo)

For demonstrations, Quick Login provides instant access as different user types:

| Persona | Role | Catalog View | Pricing |
|---------|------|--------------|---------|
| **Sarah Martinez** | Production Builder | Commercial products | Bulk discounts |
| **Marcus Johnson** | General Contractor | Full catalog | Contractor pricing |
| **Lisa Chen** | Remodeling Contractor | Remodeling focus | Project pricing |
| **David Thompson** | Pro Homeowner (DIY) | Consumer products | Retail pricing |
| **Kevin Rodriguez** | Store Manager | All products | Admin view |

---

## Authentication Features

### Sign In

| Feature | Description |
|---------|-------------|
| Email + Password | Standard authentication |
| Remember Me | Stay signed in on this device |
| Forgot Password | Link to password reset |
| Sign Up Link | Create new account |

### Sign Up

| Field | Required | Validation |
|-------|----------|------------|
| First Name | Yes | 2+ characters |
| Last Name | Yes | 2+ characters |
| Email | Yes | Valid email format |
| Password | Yes | 8+ characters, mix of types |
| Confirm Password | Yes | Must match password |

### Password Reset

| Step | Description |
|------|-------------|
| 1. Enter email | Customer provides account email |
| 2. Check inbox | System sends reset link |
| 3. Click link | Opens secure reset page |
| 4. New password | Enter and confirm new password |
| 5. Sign in | Use new password to log in |

---

## User Menu (When Logged In)

After signing in, the header shows:

```
┌─────────────────────────────────────┐
│  [Avatar]  Sarah Martinez        ▼  │
├─────────────────────────────────────┤
│  BuildRight Construction            │
│                                     │
│  My Account                         │
│  Order History                      │
│  ─────────────────────────          │
│  Sign Out                           │
└─────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **Avatar** | Initials or profile image |
| **Name** | Customer's name |
| **Company** | Associated company (B2B) |
| **My Account** | Profile and settings |
| **Order History** | Past orders |
| **Sign Out** | Log out of account |

---

## After Login Redirects

Where customers go after signing in:

| Scenario | Redirect To |
|----------|-------------|
| Normal login | Dashboard or home page |
| Login from checkout | Back to checkout |
| Login from protected page | That page |
| Demo persona login | Catalog page |

---

## BuildRight Customizations

| Component | Customization |
|-----------|---------------|
| **Login form** | BuildRight styling and colors |
| **Persona cards** | Custom design for demo |
| **User menu** | BuildRight avatar and dropdown |
| **Error messages** | Custom styling |

---

## Security Features

| Feature | Description |
|---------|-------------|
| **Password requirements** | Minimum strength enforced |
| **Session timeout** | Auto-logout after inactivity |
| **Secure redirect** | Only redirect to trusted URLs |
| **HTTPS only** | All auth over encrypted connection |

---

## Related Pages

- [Checkout](./checkout.md) - Faster checkout when logged in
- [Product Discovery](./product-discovery.md) - Persona-specific catalog
