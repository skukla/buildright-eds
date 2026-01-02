# Decision: Auth Dropin API-Only Implementation

**Date**: December 11, 2025  
**Status**: Accepted  
**Context**: Phase 5.5 - Commerce Dropins Integration  
**Research**: Based on Perplexity findings (see `docs/reference/research/`)

---

## Decision

**We will use the Auth Dropin API directly without using its UI containers.**

This means:
- ✅ Call `getCustomerToken()`, `getCustomerData()`, etc. (Dropin APIs)
- ✅ Render our own custom form HTML/CSS (BuildRight design)
- ❌ Do NOT use `SignIn`, `SignUp` containers (Dropin UI)

---

## Context

### The Problem

BuildRight has an existing, pixel-perfect login form design that must be preserved. When attempting to integrate the Adobe Commerce Auth Dropin, we discovered:

1. **Auth Dropin has ZERO slots for form customization**
   - Only slot available: `SuccessNotification` (post-auth)
   - Cannot customize: form container, input fields, labels, layout

2. **Design token overrides are insufficient**
   - Can only change colors, spacing, fonts
   - Cannot change DOM structure, input wrappers, or container layout

3. **BuildRight's requirements**
   - Custom card layout with tabs ("Email Login" / "Quick Login (Demo)")
   - Specific input styling (inset gradient backgrounds)
   - Custom button hierarchy (`.btn.btn-cta.btn-lg`)
   - Persona selector integration

### Research Validation

According to Adobe's documentation and Perplexity research:

> **"The Auth Dropin exposes only 1 slot (SuccessNotification). Form/Fields/useForm containers have 0 customization points. Cannot achieve pixel-perfect design with containers."**

This is a **deliberate architectural limitation** of the auth dropin. Adobe prioritized security and standardization over customization for auth flows.

---

## Decision Rationale

### Why API-Only is Correct

1. **Zero Slot Availability**
   ```
   | Container | Available Slots |
   |-----------|-----------------|
   | Form      | None           |
   | useForm   | None           |
   | Fields    | None           |
   | SignIn    | SuccessNotification (post-auth only) |
   ```

2. **Design Requirements**
   - Must match existing BuildRight aesthetic exactly
   - Custom tab system for email vs. persona login
   - Specific form field styling not achievable via tokens

3. **Official Pattern**
   - Adobe documentation explicitly supports this:
     > "Using API functions without containers: Call API functions directly for programmatic control without rendering UI"

4. **Architectural Alignment**
   - Fits Adobe's three-level architecture:
     1. Extend (tried - insufficient slots)
     2. **Substitute** (our approach)
     3. Create (not necessary)

---

## Implementation Approach

### 1. Custom Form Block

```javascript
// blocks/login-form/login-form.js
export default async function decorate(block) {
  // Create OUR custom HTML structure
  const form = createCustomForm();
  block.appendChild(form);
  
  // Wire to Dropin API
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { email, password } = getFormValues(e.target);
    
    // Call Dropin API (not Dropin UI)
    const { getCustomerToken } = await import('@dropins/storefront-auth/api.js');
    await getCustomerToken({ email, password });
    
    // Redirect handled by 'authenticated' event listener
  });
}
```

### 2. Event Synchronization

```javascript
// scripts/initializers/auth.js
import { events } from '@dropins/tools/event-bus.js';

events.on('authenticated', async (isAuthenticated) => {
  if (isAuthenticated) {
    // Bridge to BuildRight persona system
    const customer = await getCustomerData();
    await initializeMeshForEmail(customer.email);
    
    // Dispatch BuildRight event
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
  }
});
```

### 3. State Management

```javascript
// Handle loading states
submitBtn.disabled = true;
submitBtn.textContent = 'Logging in...';

try {
  await getCustomerToken({ email, password });
} catch (error) {
  // Handle errors
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
  alert(error.message);
}
```

---

## What We Must Handle

Since we're not using Dropin containers, we are responsible for:

### ✅ Event Synchronization
- **Implemented**: `scripts/initializers/auth.js` listens to `authenticated` event
- **Implemented**: Bridges Commerce auth to BuildRight persona system
- **Implemented**: Dispatches `auth:login` / `auth:logout` events

### ✅ State Management
- **Implemented**: Loading states (disabled button, "Logging in..." text)
- **Implemented**: Error handling (try/catch, alert messages)
- **Implemented**: Form validation (required fields)

### ✅ Session Persistence
- **Implemented**: Dropin API handles auth tokens automatically
- **Implemented**: Persona data cached in sessionStorage
- **Implemented**: Customer data retrieved via `getCustomerData()`

### ✅ Mutations & Side Effects
- **Implemented**: `getCustomerToken()` triggers backend authentication
- **Implemented**: Persona lookup via `initializeMeshForEmail()`
- **Implemented**: Catalog service initialized with persona context

---

## Benefits of This Approach

### Design Control
- ✅ Pixel-perfect BuildRight design preserved
- ✅ Complete CSS control (no specificity battles)
- ✅ Consistent visual language across site

### Functionality
- ✅ Real Commerce authentication (not bypassed)
- ✅ All Dropin security features intact
- ✅ Persona-based pricing/catalog integration

### Maintainability
- ✅ Clear separation: HTML/CSS (ours) + APIs (Dropins)
- ✅ Easy to update design without touching auth logic
- ✅ Easy to update auth logic without touching design
- ✅ Well-documented decision

### Flexibility
- ✅ Can add social login later (custom buttons + APIs)
- ✅ Can integrate multi-factor auth (custom UI + APIs)
- ✅ Can extend to registration, password reset (same pattern)

---

## Risks & Mitigations

### Risk: API Changes
**Mitigation**: 
- APIs are more stable than UI components
- Test auth flow in CI/CD
- Monitor Adobe's release notes

### Risk: Event Bus Changes
**Mitigation**:
- Event bus is core to Dropin architecture (stable)
- Document event dependencies
- Test event synchronization

### Risk: Security Updates
**Mitigation**:
- We're still using Dropin authentication (not reimplementing)
- Security handled by Adobe's API
- We only handle UI presentation

---

## Testing Strategy

### Manual Testing
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Persona lookup succeeds after auth
- [ ] Redirect to correct page after login
- [ ] "Remember me" functionality (if implemented)

### Automated Testing (Future)
```javascript
// Test auth flow
test('login with valid credentials', async () => {
  const loginForm = new LoginForm();
  await loginForm.submit('user@example.com', 'password');
  
  expect(getCustomerToken).toHaveBeenCalled();
  expect(window.location.href).toBe('/dashboard.html');
});
```

---

## Upgrade Path

When Adobe releases Dropin updates:

1. **Check API compatibility**
   - Review release notes for `@dropins/storefront-auth/api.js` changes
   - Test `getCustomerToken()`, `getCustomerData()` still work

2. **Verify event names**
   - Confirm `authenticated` event still fires
   - Check event payload structure

3. **Test integration**
   - Run full login flow
   - Verify persona lookup still works
   - Check error handling

4. **Monitor for new slots**
   - If Adobe adds form customization slots, re-evaluate approach
   - Consider hybrid approach if slots become available

---

## Related Documentation

- **Pattern Documentation**: `docs/reference/standards/DROPIN-INTEGRATION-PATTERN.md`
- **Perplexity Research**: `docs/reference/research/I have an existing front end design...md`
- **Login Form Block**: `blocks/login-form/README.md`
- **Auth Initializer**: `scripts/initializers/auth.js`
- **Adobe Docs**: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-auth/

---

## Conclusion

**The API-only approach is the correct architectural decision for BuildRight's auth integration.**

This is not a workaround or a compromise - it's the **recommended pattern** when:
- Dropin containers lack necessary customization slots
- Design requirements mandate pixel-perfect matching
- You need complete DOM control

Adobe explicitly supports this pattern, and BuildRight's implementation follows best practices for event synchronization, state management, and maintainability.

