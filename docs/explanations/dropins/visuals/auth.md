# Auth Dropin

**What it does**: Handles customer authentication - sign in, sign up, and password reset
**Pages**: `/login`, `/signup`, `/reset-password`

---

## Container/Slot Architecture

The Auth dropin uses three separate containers for different authentication actions:

### SignIn Container

```
+-------------------------------------------------------------+
| SignIn Container                                             |
| +----------------------------------------------------------+ |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | Form SLOT (via configuration, not custom slot)        | | |
| | | Email:    [________________________]                  | | |
| | | Password: [________________________]                  | | |
| | | ☐ Remember me                                         | | |
| | |              [ Sign In ]                              | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | SuccessNotification SLOT                              | | |
| | | (Shown after successful login)                        | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### SignUp Container

```
+-------------------------------------------------------------+
| SignUp Container                                             |
| +----------------------------------------------------------+ |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | Form SLOT (via configuration)                         | | |
| | | First Name: [____________] Last Name: [____________]  | | |
| | | Email:      [__________________________________]      | | |
| | | Password:   [__________________________________]      | | |
| | | Confirm:    [__________________________________]      | | |
| | |                                                       | | |
| | |              [ Create Account ]                       | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### ResetPassword Container

```
+-------------------------------------------------------------+
| ResetPassword Container                                      |
| +----------------------------------------------------------+ |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | Form SLOT (via configuration)                         | | |
| | | Email: [__________________________________]           | | |
| | |                                                       | | |
| | |              [ Reset Password ]                       | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Slot Customization Summary

| Container | Slot | Adobe Default | BuildRight Override | Level |
|-----------|------|---------------|---------------------|-------|
| **SignIn** | SuccessNotification | Toast message | ❌ Using default | Level 1 |
| **SignUp** | SuccessNotification | Toast message | ❌ Using default | Level 1 |
| **ResetPassword** | SuccessNotification | Toast message | ❌ Using default | Level 1 |

**Note**: Auth uses **Level 1** customization (CSS styling only). Adobe's default form UI is professional and meets BuildRight's needs.

**Exception - User Menu**: The user dropdown in the header uses **Level 3** (Custom HTML + APIs) because there's no suitable dropin container for this specific use case.

---

## Full Page Layout

```
+-----------------------------------------------------------------------------+
|                             /login (login.html)                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | header (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +=======================================================================+  |
|  || auth-dropin (EDS Block)                                             ||  |
|  || Uses: @dropins/storefront-auth (DROPIN)                             ||  |
|  ||=====================================================================||  |
|  ||                                                                     ||  |
|  ||  +------------------------+------------------------+                ||  |
|  ||  | [ Email Login ]        | [ Quick Login ]        |  ◄── Tabs     ||  |
|  ||  +------------------------+------------------------+                ||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | SignIn (CONTAINER)                                            |  ||  |
|  ||  |                                                               |  ||  |
|  ||  |  Email:    [________________________]                         |  ||  |
|  ||  |  Password: [________________________]                         |  ||  |
|  ||  |                                                               |  ||  |
|  ||  |             [ Sign In ]                                       |  ||  |
|  ||  |                                                               |  ||  |
|  ||  |  Forgot password?      Don't have an account? Sign up         |  ||  |
|  ||  |                                                               |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | Quick Login (BuildRight Custom - Level 3)                     |  ||  |
|  ||  | [Persona Selector Dropdown]                                   |  ||  |
|  ||  | [Persona Details Card]                                        |  ||  |
|  ||  | [ Login as {Persona} ]                                        |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  +=======================================================================+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | footer (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

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
