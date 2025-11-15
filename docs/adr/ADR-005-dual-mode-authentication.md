# ADR-005: Dual-Mode Authentication (Demo + Production)

**Status**: Accepted

**Date**: 2024-11-15

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight must function in two distinct modes:

1. **Demo Mode**: For presentations, stakeholder reviews, and development
   - No backend required
   - Fast persona switching
   - Controlled demo scenarios
   - No real customer data

2. **Production Mode**: For real deployment with Adobe Commerce
   - Full Adobe Commerce authentication
   - Real customer accounts
   - Secure session management
   - Real persona assignments from customer attributes

We need an authentication strategy that supports both modes without requiring significant code changes when transitioning between them.

### Key Requirements
1. **Demo-Friendly**: Easy persona selection for demos
2. **Production-Ready**: Secure auth with Adobe Commerce
3. **Minimal Code Changes**: Same auth.js interface for both modes
4. **Clear Mode Indication**: Obvious when in demo vs production
5. **Flexible Entry**: Multiple ways to enter demo mode

---

## Decision

**We will implement a dual-mode authentication system with a unified `authService` interface.**

### Architecture

**File**: `scripts/auth.js`

```javascript
class AuthService {
  constructor() {
    this.mode = this._detectMode();
    this.currentUser = null;
  }
  
  _detectMode() {
    // Check URL param: ?mode=demo or ?mode=production
    // Check environment variable
    // Check localStorage override
    // Default to demo for development
  }
  
  async initialize() {
    if (this.mode === 'demo') {
      return this._initializeDemo();
    } else {
      return this._initializeProduction();
    }
  }
  
  async login(credentials) {
    if (this.mode === 'demo') {
      return this._demoLogin(credentials);
    } else {
      return this._productionLogin(credentials);
    }
  }
  
  // Unified interface for both modes
}
```

### Demo Mode

**Entry Points**:

1. **Quick Persona Selector** (`/pages/login.html`)
   - Shows 5 persona cards
   - Click to instantly enter as that persona
   - ~10 seconds to start demo

2. **Guided Sign-Up Wizard** (`/pages/signup-demo.html`) ⭐ **RECOMMENDED**
   - 3-step onboarding flow
   - Collects business attributes
   - Shows experience preview
   - Determines persona automatically
   - ~2 minutes, more realistic

3. **Direct URL** (`/pages/catalog.html?persona=sarah`)
   - URL parameter specifies persona
   - Bypasses login entirely
   - For quick testing

**Demo Storage**:
- Session stored in `localStorage` and `sessionStorage`
- Persists across page reloads
- Clear on logout or browser close
- No server-side session

**Demo Data Structure**:
```javascript
{
  personaId: 'sarah',
  email: 'sarah@demo.com',
  firstname: 'Sarah',
  lastname: 'Mitchell',
  companyName: 'Mitchell Homes',
  businessProfile: {
    business_type: 'Residential Builder',
    project_scale: 'High Volume',
    primary_service: 'New Construction',
    buying_behavior: 'Template/Repeat Orders',
    customer_tier: 'Premium'
  },
  timestamp: Date.now(),
  mode: 'demo'
}
```

### Production Mode

**Entry Point**: Standard login form

**Authentication Flow**:
1. User enters email/password
2. Auth Dropin (`@dropins/storefront-auth`) handles login
3. Adobe Commerce validates credentials
4. Returns customer token
5. Fetch customer data via REST API
6. Extract `buildright_persona` custom attribute
7. Load persona config
8. Redirect to persona dashboard

**Production Storage**:
- Adobe Commerce session token
- Token stored in httpOnly cookie (secure)
- Server-side session management
- Proper logout flow

**Production Data Structure**:
```javascript
{
  personaId: 'sarah', // from custom attribute
  customerId: 12345,
  email: 'sarah@mitchellhomes.com',
  firstname: 'Sarah',
  lastname: 'Mitchell',
  customerGroup: 'Premium',
  token: '[secure-token]',
  mode: 'production'
}
```

---

## Consequences

### Positive Outcomes

✅ **Demo-Friendly**
- Quick persona switching for presentations
- No backend setup required
- Controlled demo scenarios
- Fast iteration during development

✅ **Production-Ready**
- Real authentication with Adobe Commerce
- Secure session management
- Standard commerce auth patterns
- Production-grade security

✅ **Unified Interface**
- Same `authService` API for both modes
- Minimal code changes when switching modes
- Components don't need to know the mode
- Easy to test both modes

✅ **Flexible Demo Entry**
- Multiple entry points for different demo scenarios
- Can choose quick selector or guided wizard
- URL parameters for rapid testing
- Pre-configured demo accounts

✅ **Clear Mode Indication**
- Demo mode shows indicator in UI
- Console logs indicate current mode
- Easy to verify which mode is active
- No confusion during demos

✅ **Smooth Migration**
- Change one config setting to switch modes
- Same code works in both modes
- Gradual transition possible (demo first, production later)
- Can run production mode in staging

### Negative Outcomes

⚠️ **Code Complexity**
- Need to maintain two auth paths
- More branching logic in auth service
- Need to test both modes thoroughly
- Risk of mode-specific bugs

⚠️ **Demo Mode Security Risk**
- Local storage is not secure
- Anyone can inspect demo session
- Need to ensure demo mode disabled in production
- Risk of leaving demo mode enabled accidentally

⚠️ **Mode Detection Complexity**
- Need robust mode detection logic
- URL params, env vars, config all possible
- Confusion if multiple sources conflict
- Need clear documentation

⚠️ **Feature Parity**
- Must ensure features work in both modes
- Demo mode might not catch all production issues
- Mock services must stay in sync with real APIs
- Some production features may be hard to mock

---

## Alternatives Considered

### Alternative 1: Demo Mode Only

**Approach**: Build only for demos, deal with production later.

**Pros**:
- Simpler initial development
- No production complexity
- Fast to build

**Cons**:
- Large refactor needed for production
- Risk of architectural mismatch
- Would need to rebuild auth from scratch
- Demo code might not be production-quality

**Why Rejected**: Short-sighted. Would create significant rework for production deployment.

---

### Alternative 2: Production Mode Only

**Approach**: Build for production from day one, use real Adobe Commerce for demos.

**Pros**:
- Production-ready from start
- No mock services needed
- Tests real integration

**Cons**:
- Requires Adobe Commerce instance for development
- Slower iteration (backend dependency)
- Demo data harder to control
- Can't demo without backend

**Why Rejected**: Too restrictive for rapid development and demos. Requires backend access.

---

### Alternative 3: Separate Demo and Production Codebases

**Approach**: Maintain two separate codebases, one for demo, one for production.

**Pros**:
- No mode-switching logic
- Each optimized for its purpose
- No risk of demo code in production

**Cons**:
- Double maintenance burden
- Features must be built twice
- Divergence over time
- Hard to keep in sync

**Why Rejected**: Maintenance nightmare. Too much duplicate work.

---

### Alternative 4: Feature Flags for Each Feature

**Approach**: Use feature flags to toggle demo vs production behavior per feature.

**Pros**:
- Granular control
- Can mix demo and production features
- Easy to test combinations

**Cons**:
- Flag explosion (many flags needed)
- Complex logic (multiple flags per feature)
- Hard to reason about state
- Flags scattered across codebase

**Why Rejected**: Too granular. One mode flag is simpler and easier to understand.

---

## Implementation Details

### Mode Detection

**Priority Order**:
1. URL parameter: `?mode=demo` or `?mode=production`
2. Environment variable: `BUILDRIGHT_MODE`
3. Config file: `config.json`
4. localStorage override: `buildright_mode`
5. Default: `demo` (development), `production` (deployed)

```javascript
_detectMode() {
  // 1. URL param
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('mode')) {
    return urlParams.get('mode');
  }
  
  // 2. Environment variable (if available)
  if (typeof process !== 'undefined' && process.env.BUILDRIGHT_MODE) {
    return process.env.BUILDRIGHT_MODE;
  }
  
  // 3. localStorage override
  const storedMode = localStorage.getItem('buildright_mode');
  if (storedMode) {
    return storedMode;
  }
  
  // 4. Default based on hostname
  if (window.location.hostname.includes('localhost')) {
    return 'demo';
  }
  
  return 'production';
}
```

### Mode Indicator UI

Show current mode in UI (dev only, hidden in production):

```html
<!-- Demo Mode Indicator -->
<div class="mode-indicator" data-mode="demo">
  🎭 Demo Mode - <a href="?mode=production">Switch to Production</a>
</div>
```

### Sign-Up Flow Integration

**Demo Mode**:
```javascript
async function submitSignup(formData) {
  // Determine persona from business attributes
  const personaId = determinePersonaFromAttributes(formData);
  
  // Simulate account creation (1.5s delay)
  await simulateAccountCreation();
  
  // Store in localStorage
  const session = {
    personaId,
    email: formData.email,
    firstname: formData.firstname,
    lastname: formData.lastname,
    businessProfile: { ... },
    mode: 'demo'
  };
  
  localStorage.setItem('buildright_session', JSON.stringify(session));
  
  // Redirect to dashboard
  window.location.href = getDashboardUrl(personaId);
}
```

**Production Mode**:
```javascript
async function submitSignup(formData) {
  // Call Adobe Commerce registration API
  const response = await fetch('/rest/V1/customers', {
    method: 'POST',
    body: JSON.stringify({
      customer: {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        custom_attributes: [
          { attribute_code: 'business_type', value: formData.business_type },
          { attribute_code: 'project_scale', value: formData.project_scale },
          // ... other attributes
          { attribute_code: 'buildright_persona', value: determinedPersona }
        ]
      },
      password: formData.password
    })
  });
  
  // Auto-login with Auth Dropin
  await authDropin.login(formData.email, formData.password);
  
  // Fetch persona from customer attributes
  const customer = await authDropin.getCustomer();
  const personaId = getPersonaFromCustomer(customer);
  
  // Redirect to dashboard
  window.location.href = getDashboardUrl(personaId);
}
```

### Production Migration Checklist

To switch from demo to production:

- [ ] Set `BUILDRIGHT_MODE=production`
- [ ] Configure Adobe Commerce endpoint
- [ ] Install Adobe Commerce Auth Dropin
- [ ] Create `buildright_persona` custom attribute in Adobe Commerce
- [ ] Import customer data with persona assignments
- [ ] Test authentication flow
- [ ] Verify persona determination
- [ ] Remove/hide demo mode UI indicators
- [ ] Deploy to production environment

---

## Related Decisions

- [ADR-001: Use Adobe Commerce Dropins](./ADR-001-use-dropins-for-commerce.md) - Auth Dropin used in production mode
- [ADR-004: Custom Attributes for Personas](./ADR-004-custom-attributes-for-personas.md) - How production mode retrieves persona

---

## References

- [Authentication Strategy Documentation](../AUTH-STRATEGY.md)
- [Dropin Integration Guide](../DROPIN-INTEGRATION-GUIDE.md)
- [Phase 5: Authentication Pages](../PHASE-5-EXISTING-PAGE-REFACTOR.md#task-2-authentication-pages)

---

**Last Updated**: November 15, 2024

