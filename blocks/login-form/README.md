# Login Form Block

**Type**: EDS Block  
**Path**: `blocks/login-form/`  
**Status**: Active  
**Phase**: 5.5 - Commerce Dropins Integration

---

## Purpose

Provides a dual-mode authentication interface:
1. **Email Login** - Uses Commerce Auth Dropin API for real authentication
2. **Quick Login (Demo)** - Uses persona-based demo authentication

This block follows EDS best practices by:
- ✅ Separating logic from HTML pages (no inline `<script>` tags)
- ✅ Using the standard `decorate()` pattern
- ✅ Being reusable across multiple pages/contexts
- ✅ Maintaining clean separation of concerns

---

## Usage

### In HTML Pages

```html
<div class="login-form"></div>
```

The block automatically decorates and initializes when EDS loads the page.

### In JavaScript

```javascript
import loginForm from './blocks/login-form/login-form.js';

const container = document.querySelector('.login-form');
await loginForm(container);
```

---

## Features

### Email Login (Commerce)
- Calls `getCustomerToken` from `@dropins/storefront-auth/api.js`
- Triggers persona lookup via `authenticated` event
- Redirects to appropriate dashboard based on persona

### Quick Login (Demo)
- Dropdown of pre-configured personas (Sarah, Marcus, Lisa, David, Kevin)
- Shows persona details (name, company, role, description)
- Logs in directly as selected persona

### Tab Switching
- Two tabs: "Email Login" and "Quick Login (Demo)"
- Clean transitions with active state management
- Maintains BuildRight's exact visual design

---

## Integration Points

### Services
- **authService** (`scripts/auth.js`) - Handles persona-based authentication
- **loadConfig** (`scripts/site-config.js`) - Determines if Commerce Dropins are enabled

### Commerce Dropins
- **@dropins/storefront-auth/api.js** - `getCustomerToken()` for real authentication
- **Authenticated Event** - Triggers persona resolution in `scripts/initializers/auth.js`

### Persona System
- **PERSONAS** (`scripts/persona-config.js`) - Persona definitions
- **DEMO_ACCOUNTS** - Email-to-Persona mapping for demo mode

---

## Design System Compliance

### CSS Classes
All classes follow BuildRight's existing design system:

- `.login-form` - Block container
- `.login-card-single` - Card wrapper
- `.login-card` - Card container
- `.login-card-body` - Card content
- `.login-card-footer` - Card footer
- `.login-tabs` - Tab navigation
- `.login-tab` - Individual tab button
- `.login-tab.active` - Active tab state
- `.login-tab-content` - Tab content container
- `.login-tab-content.active` - Active tab content
- `.login-form-group` - Form field grouping
- `.login-form-label` - Form labels
- `.login-form-input` - Form inputs
- `.login-checkbox-group` - Checkbox grouping
- `.persona-info` - Persona details display
- `.btn.btn-cta.btn-lg` - Primary action button

Styling is primarily defined in `styles/login.css` for consistency.

---

## Authentication Flow

### Commerce Mode (`useCommerceDropins: true`)

1. User enters email and password
2. Block calls `getCustomerToken({ email, password })`
3. Commerce returns customer token
4. Auth initializer (`scripts/initializers/auth.js`) listens for `authenticated` event
5. Persona lookup via `initializeMeshForEmail(email)`
6. Redirect to homepage or specified redirect URL

### Demo Mode (`useCommerceDropins: false`)

1. User enters email and password
2. Block looks up email in `DEMO_ACCOUNTS`
3. Block calls `authService.loginWithPersona(personaId)`
4. Redirect to homepage or specified redirect URL

### Quick Login (Always Available)

1. User selects persona from dropdown
2. Block shows persona details
3. User clicks "Login as [Name]"
4. Block calls `authService.loginWithPersona(personaId)`
5. Redirect to homepage or specified redirect URL

---

## Architecture Decision

This refactor addresses **ADR-002: Use EDS Blocks for Content-Driven Components**.

### Before (Anti-Pattern)
```html
<!-- pages/login.html -->
<div class="login-card">
  <!-- 100+ lines of hard-coded HTML -->
</div>

<script type="module">
  // 200+ lines of inline JavaScript
</script>
```

**Problems:**
- ❌ Logic tied to specific page
- ❌ Not reusable
- ❌ Mixed concerns (structure + behavior)
- ❌ Harder to test and maintain

### After (EDS Best Practice)
```html
<!-- pages/login.html -->
<div class="login-form"></div>
```

```javascript
// blocks/login-form/login-form.js
export default async function decorate(block) {
  // All logic encapsulated in block
}
```

**Benefits:**
- ✅ Reusable across pages
- ✅ Clean separation of concerns
- ✅ Follows EDS decoration pattern
- ✅ Easier to test and maintain
- ✅ Can be used in modals, checkout, etc.

---

## Testing

### Local Development
1. Start local server: `npm start`
2. Navigate to `/pages/login.html`
3. Test both Email Login and Quick Login tabs
4. Verify tab switching
5. Verify form validation
6. Verify successful authentication and redirect

### Browser Console
The block logs all actions with `[Login Form]` prefix:
```
[Login Form] Email login submitted: sarah.martinez@sunbelthomes.com
[Login Form] Calling Commerce getCustomerToken
[Login Form] Commerce authentication successful
[Login Form] Redirecting to homepage
```

---

## Related Documentation

- **EDS Block Patterns**: `docs/reference/backend/EDS-BLOCK-PATTERNS.md`
- **ADR-002**: `docs/adr/ADR-002-use-eds-blocks-for-content.md`
- **Phase 5.5 Plan**: `docs/implementation/active/PHASE-5.5-COMMERCE-DROPINS.md`
- **Auth Service**: `scripts/auth.js`
- **Persona System**: `docs/reference/backend/PERSONA-RESOLUTION.md`

---

## Future Enhancements

### Potential Improvements
1. Use Dropin SDK UI components (`Input`, `Button`) for visual consistency
2. Add password visibility toggle
3. Add "Forgot Password" link and flow
4. Add form field validation with inline error messages
5. Add loading spinner during authentication
6. Add auto-login if valid token exists

### Extensibility
The block can be extended to:
- Display in a modal for quick login anywhere
- Show in the checkout flow for guest → registered user conversion
- Support social login providers (Google, Microsoft, etc.)

