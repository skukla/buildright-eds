# Decision: Auth Dropin Implementation Pattern

**Date**: December 11, 2024 (Original) / December 19, 2025 (Corrected)  
**Status**: Accepted (Corrected)  
**Context**: Phase 5.5 - Commerce Dropins Integration  
**Supersedes**: `AUTH-DROPIN-API-ONLY.md` (which was based on incorrect understanding)

---

## Decision

**We use Auth Dropin UI containers (`SignIn`, `SignUp`, `ResetPassword`) with configuration options for standard authentication pages.**

**For special cases (mini cart, user menu), we use custom HTML with auth APIs.**

This means:
- ✅ Use `SignIn`, `SignUp`, `ResetPassword` containers for login/signup/reset pages
- ✅ Configure with routes and callbacks (no slots needed)
- ✅ Use custom HTML + APIs for header user menu (no suitable container exists)
- ❌ Do NOT use slots for auth dropin (none are needed for BuildRight)

---

## Context

### The Initial Misunderstanding

During research phase (Dec 11), we documented an "API-only" approach based on:
1. Research showing Auth Dropin has limited slots (only `SuccessNotification`)
2. Assumption that we'd need custom HTML for all auth flows
3. Documentation created: `AUTH-DROPIN-API-ONLY.md`

### What Actually Happened During Implementation

When implementing, we discovered:
1. Auth dropin's **configuration options** (routes, callbacks) are sufficient
2. We don't need to customize the form HTML itself
3. The dropin's default form UI works fine for BuildRight
4. We implemented using **UI containers**, not API-only

### Result

**Documentation said "API-only"**  
**Code actually uses "UI containers with configuration"**

This decision document corrects the record.

---

## Implementation Pattern

### Pattern 1: Standard Auth Pages (SignIn, SignUp, ResetPassword)

**Use Case**: Login page, signup page, password reset page

**Pattern**: UI Container + Configuration Options (Level 1)

```javascript
// blocks/auth-dropin/auth-dropin.js

async function renderSignInForm(block) {
  const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
  const SignIn = (await import('@dropins/storefront-auth/containers/SignIn.js')).default;
  
  await authRenderer.render(SignIn, {
    // Configuration options (no slots)
    routeForgotPassword: () => './reset-password.html',
    routeSignUp: () => './signup.html',
    routeRedirectOnSignIn: () => './dashboard.html',
    renderSignUpLink: true,
    onSuccessCallback: () => { console.log('Login success'); },
    onErrorCallback: (error) => { console.error(error); }
  })(block);
}

async function renderRegisterForm(block) {
  const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
  const SignUp = (await import('@dropins/storefront-auth/containers/SignUp.js')).default;
  
  await authRenderer.render(SignUp, {
    routeSignIn: () => './login.html',
    routeRedirectOnSignIn: () => './dashboard.html',
    onSuccessCallback: () => { console.log('Registration success'); },
    onErrorCallback: (error) => { console.error(error); }
  })(block);
}

async function renderResetPasswordForm(block) {
  const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
  const ResetPassword = (await import('@dropins/storefront-auth/containers/ResetPassword.js')).default;
  
  await authRenderer.render(ResetPassword, {
    routeSignIn: () => './login.html',
    onSuccessCallback: () => { console.log('Password reset email sent'); },
    onErrorCallback: (error) => { console.error(error); }
  })(block);
}
```

**Why this works**:
- ✅ Dropin's default form UI is professional and accessible
- ✅ Configuration options handle all our routing needs
- ✅ Callbacks provide success/error handling
- ✅ No custom HTML needed
- ✅ No slots needed

---

### Pattern 2: Header User Menu

**Use Case**: User menu dropdown in header

**Pattern**: Custom HTML + Auth APIs (Level 3)

```javascript
// blocks/auth-dropin/auth-dropin.js

async function renderUserMenu(block) {
  const { isAuthenticated, getCurrentCustomer, logout } = await import('../../scripts/initializers/auth.js');
  
  const isHeaderContext = block.dataset.headerContext === 'true';
  
  if (isHeaderContext) {
    // Custom HTML for BuildRight's header dropdown
    if (isAuthenticated()) {
      const customer = getCurrentCustomer();
      const firstname = customer?.firstname || 'User';
      const initials = `${firstname.charAt(0)}${customer?.lastname?.charAt(0) || ''}`.toUpperCase();
      
      block.innerHTML = `
        <div class="user-menu">
          <div class="user-menu-logged-in">
            <div class="user-menu-header">
              <div class="user-avatar">
                <span class="user-initials">${initials}</span>
              </div>
              <div class="user-info">
                <div class="user-name">${customer.firstname} ${customer.lastname || ''}</div>
                <div class="user-company">${customer.company || 'BuildRight Customer'}</div>
              </div>
            </div>
            <div class="user-menu-content">
              <a href="./account.html" class="user-menu-link">My Account</a>
              <button class="user-menu-logout" type="button">Logout</button>
            </div>
          </div>
        </div>
      `;
      
      // Wire up logout
      block.querySelector('.user-menu-logout').addEventListener('click', async () => {
        await logout();
        window.location.href = './login.html';
      });
    } else {
      // Not authenticated
      block.innerHTML = `
        <div class="user-menu">
          <div class="user-menu-logged-out">
            <h3>Welcome to BuildRight</h3>
            <a href="./login.html" class="btn btn-cta">Login</a>
            <a href="./signup.html" class="btn btn-secondary">Create Account</a>
          </div>
        </div>
      `;
    }
  }
}
```

**Why custom HTML**:
- ❌ No auth dropin container exists for "user menu"
- ❌ Auth dropin only has form containers (`SignIn`, `SignUp`, etc.)
- ✅ Need custom dropdown structure for header
- ✅ Need to show user initials, name, company
- ✅ Need BuildRight-specific styling

---

## Decision Rationale

### Why UI Containers (Not API-Only)?

**Original concern**: "Auth Dropin has no slots for customization"  
**Reality**: We don't need slots because the default form UI works fine

| Aspect | Concern | Reality |
|--------|---------|---------|
| **Form Layout** | "Need custom layout" | Dropin's default layout is acceptable |
| **Field Styling** | "Need custom inputs" | Dropin's inputs are professional |
| **Button Styling** | "Need custom buttons" | CSS design tokens handle styling |
| **Validation** | "Need custom validation UI" | Dropin's validation is good |
| **Error Messages** | "Need custom error display" | Dropin's error handling works |

**Result**: Configuration options (routes, callbacks) are sufficient. No slots needed.

---

### Configuration Options We Use

#### SignIn Container

```javascript
{
  routeForgotPassword: () => './reset-password.html',  // Where "Forgot password?" goes
  routeSignUp: () => './signup.html',                  // Where "Create account" goes
  routeRedirectOnSignIn: () => './dashboard.html',     // Where to go after login
  renderSignUpLink: true,                              // Show "Create account" link
  onSuccessCallback: () => { ... },                    // Success handler
  onErrorCallback: (error) => { ... }                  // Error handler
}
```

#### SignUp Container

```javascript
{
  routeSignIn: () => './login.html',                   // Where "Sign in" link goes
  routeRedirectOnSignIn: () => './dashboard.html',     // Where to go after registration
  onSuccessCallback: () => { ... },                    // Success handler
  onErrorCallback: (error) => { ... }                  // Error handler
}
```

#### ResetPassword Container

```javascript
{
  routeSignIn: () => './login.html',                   // Where "Back to sign in" goes
  onSuccessCallback: () => { ... },                    // Success handler (email sent)
  onErrorCallback: (error) => { ... }                  // Error handler
}
```

---

### Slots Available (But Not Needed)

Auth Dropin provides **one slot**:

| Slot | Purpose | Do We Use It? |
|------|---------|---------------|
| `SuccessNotification` | Custom success message after login | ❌ No (default is fine) |

We don't use this slot because:
- ✅ Default success behavior is good (redirect via `routeRedirectOnSignIn`)
- ✅ `onSuccessCallback` handles any custom logic we need
- ✅ No need to customize the UI of the success message

---

## Comparison: login-form vs auth-dropin

BuildRight has TWO login implementations:

### 1. login-form Block (API-Only)

**File**: `blocks/login-form/login-form.js`  
**Pattern**: Custom HTML + APIs (Level 3)  
**Use Case**: Demo-specific tabbed login (Email Login / Quick Login with personas)

```javascript
// Custom HTML structure
const form = document.createElement('form');
form.innerHTML = `
  <div class="login-card">
    <div class="login-tabs">
      <button class="tab active">Email Login</button>
      <button class="tab">Quick Login (Demo)</button>
    </div>
    <div class="tab-content">
      <input type="email" />
      <input type="password" />
      <button type="submit">Login</button>
    </div>
  </div>
`;

// Call API directly
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { getCustomerToken } = await import('@dropins/storefront-auth/api.js');
  await getCustomerToken({ email, password });
  window.location.href = './dashboard.html';
});
```

**Why API-only**:
- ✅ Has tabbed interface (Email Login / Quick Login)
- ✅ Persona selector for demo purposes
- ✅ Completely custom structure

---

### 2. auth-dropin Block (UI Container)

**File**: `blocks/auth-dropin/auth-dropin.js`  
**Pattern**: UI Container + Configuration (Level 1)  
**Use Case**: Standard login/signup/reset pages

```javascript
// Use dropin container
const SignIn = (await import('@dropins/storefront-auth/containers/SignIn.js')).default;
await render.render(SignIn, {
  routeForgotPassword: () => './reset-password.html',
  routeSignUp: () => './signup.html',
  routeRedirectOnSignIn: () => './dashboard.html'
})(block);
```

**Why UI container**:
- ✅ Standard form (no special tabs/features)
- ✅ Dropin's default UI is professional
- ✅ Configuration options handle all our needs

---

## When to Use Each Pattern

| Scenario | Pattern | Example |
|----------|---------|---------|
| Standard login page | **auth-dropin** (UI container) | `pages/login.html` with `<div class="auth-dropin sign-in"></div>` |
| Standard signup page | **auth-dropin** (UI container) | `pages/signup.html` with `<div class="auth-dropin register"></div>` |
| Password reset page | **auth-dropin** (UI container) | `pages/reset-password.html` with `<div class="auth-dropin reset-password"></div>` |
| Custom login with personas | **login-form** (API-only) | Demo-specific tabbed interface |
| Header user menu | **auth-dropin** (custom HTML) | `renderUserMenu()` function with custom dropdown |

---

## File Structure

```
blocks/
├── auth-dropin/
│   ├── auth-dropin.js          ← UI containers for standard pages + custom HTML for user menu
│   └── auth-dropin.css         ← Styles for both patterns
└── login-form/
    ├── login-form.js           ← Custom HTML + APIs for demo login
    └── login-form.css          ← Styles for custom login

scripts/initializers/
└── auth.js                     ← Auth API wrapper (isAuthenticated, logout, etc.)
```

---

## Implementation Details

### auth-dropin.js Structure

```javascript
export default async function decorate(block) {
  const variant = getBlockVariant(block);
  
  switch (variant) {
    case 'sign-in':
      await renderSignInForm(block);        // UI Container
      break;
    case 'register':
      await renderRegisterForm(block);       // UI Container
      break;
    case 'reset-password':
      await renderResetPasswordForm(block);  // UI Container
      break;
    case 'user-menu':
      await renderUserMenu(block);           // Custom HTML
      break;
  }
}
```

**Variants**:
- `sign-in`: Uses `SignIn` container
- `register`: Uses `SignUp` container
- `reset-password`: Uses `ResetPassword` container
- `user-menu`: Uses custom HTML (no container)

---

## Slots Used: Summary

| Dropin | Container | Slots Available | Slots We Use | Why Not Using Slots |
|--------|-----------|-----------------|--------------|---------------------|
| **Auth** | `SignIn` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | `SignUp` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | `ResetPassword` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | (User Menu) | N/A | N/A | No container exists |

**Key insight**: Auth dropin doesn't require slots because configuration options handle everything we need.

---

## Configuration Options Used: Summary

### SignIn Container

| Option | Type | Description | Our Value |
|--------|------|-------------|-----------|
| `routeForgotPassword` | Function | Password reset link routing | `() => './reset-password.html'` |
| `routeSignUp` | Function | Create account link routing | `() => './signup.html'` |
| `routeRedirectOnSignIn` | Function | Post-login redirect | `() => sessionStorage.getItem('auth_redirect') \|\| './dashboard.html'` |
| `renderSignUpLink` | Boolean | Show "Create account" link | `true` |
| `onSuccessCallback` | Function | Success handler | `() => { console.log('Login success'); }` |
| `onErrorCallback` | Function | Error handler | `(error) => { console.error(error); }` |

### SignUp Container

| Option | Type | Description | Our Value |
|--------|------|-------------|-----------|
| `routeSignIn` | Function | Sign in link routing | `() => './login.html'` |
| `routeRedirectOnSignIn` | Function | Post-registration redirect | `() => './dashboard.html'` |
| `onSuccessCallback` | Function | Success handler | `() => { console.log('Registration success'); }` |
| `onErrorCallback` | Function | Error handler | `(error) => { console.error(error); }` |

### ResetPassword Container

| Option | Type | Description | Our Value |
|--------|------|-------------|-----------|
| `routeSignIn` | Function | Back to sign in link routing | `() => './login.html'` |
| `onSuccessCallback` | Function | Success handler (email sent) | `() => { console.log('Password reset email sent'); }` |
| `onErrorCallback` | Function | Error handler | `(error) => { console.error(error); }` |

---

## Comparison with Other Dropins

| Dropin | Pattern Level | Containers | Configuration Options | Slots | APIs | Events |
|--------|---------------|------------|----------------------|-------|------|--------|
| **Auth** (forms) | Level 1 | `SignIn`, `SignUp`, `ResetPassword` | ✅ Yes | ❌ None | - | - |
| **Auth** (user menu) | Level 3 | None | - | - | ✅ Yes | - |
| **Cart** | Level 1 | `CartSummaryList` | ✅ Yes | ❌ None | - | - |
| **Checkout** | Level 1 | `Checkout` | ✅ Yes | ❌ None | - | - |
| **Mini Cart** | Level 3 | None | - | - | ✅ Yes | ✅ Yes |
| **PLP** (planned) | Level 2 | `ProductList`, `Facets` | ✅ Yes | ✅ Yes | - | - |

**Pattern consistency**: Auth, Cart, and Checkout all use Level 1 (UI Container + Configuration). PLP will be the first to use Level 2 (adding custom slots).

---

## References

### Related Documentation
- **Integration Pattern**: `docs/reference/standards/DROPIN-INTEGRATION-PATTERN.md` - Complete pattern guide
- **Clarification**: `docs/DROPIN-APPROACH-CLARIFICATION.md` - Doc vs reality analysis
- **Component Breakdown**: `docs/CLP-COMPONENT-BREAKDOWN.md` - Visual component breakdown

### Code Files
- `blocks/auth-dropin/auth-dropin.js` - UI container implementation
- `blocks/login-form/login-form.js` - API-only implementation (demo)
- `scripts/initializers/auth.js` - Auth API wrapper
- `pages/login.html` - Uses `auth-dropin` block
- `pages/signup.html` - Uses `auth-dropin` block
- `pages/reset-password.html` - Uses `auth-dropin` block

---

## Correction History

### Version 1.0 (Dec 11, 2024)
- **Status**: Incorrect
- **Stated**: "Use API-only approach for auth dropin"
- **File**: `AUTH-DROPIN-API-ONLY.md`

### Version 2.0 (Dec 19, 2025)
- **Status**: Corrected
- **States**: "Use UI containers with configuration for auth dropin"
- **File**: `AUTH-DROPIN-IMPLEMENTATION.md` (this document)

---

**Document Version**: 2.0 (Corrected)  
**Date**: December 19, 2025  
**Status**: Accepted - Reflects Actual Implementation  
**Supersedes**: `AUTH-DROPIN-API-ONLY.md`

