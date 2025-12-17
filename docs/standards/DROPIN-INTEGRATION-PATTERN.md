# BuildRight Dropin Integration Pattern

**Status**: Active Standard  
**Date**: December 11, 2025  
**Applies To**: All Adobe Commerce Dropin integrations  
**Research**: Based on Perplexity findings validating API-only approach

---

## Core Principle

**Keep BuildRight's exact design. Use Dropin APIs for functionality.**

> **Research Validation**: "The Auth Dropin has only ONE slot available (`SuccessNotification`), and it provides ZERO slots for customizing form containers or input fields. This is a critical architectural limitation that completely validates your approach." - Perplexity Research

This means:
- ✅ **DO** use our existing HTML/CSS for UI elements
- ✅ **DO** call Dropin APIs for functionality (auth, cart, etc.)
- ❌ **DON'T** let Dropins render their own UI over our design
- ❌ **DON'T** compromise on pixel-perfect design matching

---

## Pattern: Header Integration Example

### ❌ Wrong Approach (Letting Dropin Render Its Own UI)

```html
<!-- header.html -->
<div class="header-actions">
  <!-- Dropin renders its own generic button -->
  <div class="auth-dropin user-menu"></div>
  <div class="commerce-mini-cart"></div>
</div>
```

**Problems:**
- Generic "Sign In" link (not our design)
- No control over button styling
- Breaks visual consistency

---

### ✅ Correct Approach (BuildRight Pattern)

#### Step 1: Keep Our Exact HTML

```html
<!-- header.html -->
<div class="header-actions">
  <div class="user-menu-wrapper">
    <!-- OUR custom button with OUR design -->
    <button class="user-link" id="user-menu-toggle">
      <span class="user-icon">
        <svg>...</svg>
      </span>
      <span class="user-label">Account</span>
    </button>
    <!-- Empty container for dropin to populate -->
    <div id="user-menu-container"></div>
  </div>
  
  <div class="cart-link-wrapper">
    <!-- OUR custom button with OUR design -->
    <button class="cart-link" id="cart-link-toggle">
      <span class="cart-icon">
        <svg>...</svg>
      </span>
      <span class="cart-label">Cart</span>
      <span class="cart-count">0</span>
    </button>
    <!-- Empty container for dropin to populate -->
    <div id="mini-cart-container"></div>
  </div>
</div>
```

#### Step 2: Initialize Dropins in Custom Containers

```javascript
// header.js
const userMenuContainer = block.querySelector('#user-menu-container');
if (userMenuContainer) {
  // Create auth-dropin block and insert into custom container
  const authDropinBlock = document.createElement('div');
  authDropinBlock.className = 'auth-dropin user-menu';
  authDropinBlock.dataset.headerContext = 'true'; // Signal this is in header
  userMenuContainer.appendChild(authDropinBlock);
  await decorateBlock(authDropinBlock, 'auth-dropin');
}

const miniCartContainer = block.querySelector('#mini-cart-container');
if (miniCartContainer) {
  // Create commerce-mini-cart block and insert into custom container
  const miniCartBlock = document.createElement('div');
  miniCartBlock.className = 'commerce-mini-cart';
  miniCartBlock.dataset.headerContext = 'true'; // Signal this is in header
  miniCartContainer.appendChild(miniCartBlock);
  await decorateBlock(miniCartBlock, 'commerce-mini-cart');
}
```

#### Step 3: Detect Header Context in Dropin Block

```javascript
// blocks/auth-dropin/auth-dropin.js
async function renderUserMenu(block) {
  const { isAuthenticated, getCurrentCustomer, logout } = await import('../../scripts/initializers/auth.js');
  
  // Check if we're in header context (BuildRight's custom design)
  const isHeaderContext = block.dataset.headerContext === 'true';
  
  if (isHeaderContext) {
    // BuildRight Pattern: Work with existing custom HTML
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userLabel = document.querySelector('.user-label');
    
    if (isAuthenticated()) {
      const customer = getCurrentCustomer();
      const name = customer?.firstname || 'User';
      
      // Update OUR button label
      if (userLabel) {
        userLabel.textContent = name;
      }
      
      // Populate OUR dropdown container
      block.innerHTML = `
        <div class="user-menu-dropdown" hidden>
          <a href="${window.BASE_PATH || ''}/pages/account.html">My Account</a>
          <a href="${window.BASE_PATH || ''}/pages/order-history.html">Order History</a>
          <hr>
          <button class="logout-btn">Sign Out</button>
        </div>
      `;
      
      // Wire up functionality to OUR custom button
      if (userMenuToggle) {
        userMenuToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
          userMenuToggle.setAttribute('aria-expanded', !isExpanded);
          dropdown.hidden = isExpanded;
        });
      }
      
      // Wire up logout
      block.querySelector('.logout-btn').addEventListener('click', async () => {
        await logout();
        window.location.href = `${window.BASE_PATH || ''}/pages/login.html`;
      });
    } else {
      // Not authenticated - button already says "Account", make it link to login
      if (userMenuToggle) {
        userMenuToggle.addEventListener('click', () => {
          window.location.href = `${window.BASE_PATH || ''}/pages/login.html`;
        });
      }
    }
    
  } else {
    // Standalone context: Render Dropin's own UI (for pages that don't have custom design)
    // ... render generic dropin UI ...
  }
}
```

---

## Pattern: Login Form Example

### ❌ Wrong Approach

```html
<!-- login.html -->
<main>
  <!-- Let dropin render its generic form -->
  <div class="auth-dropin sign-in"></div>
</main>
```

**Problems:**
- Generic form design
- No control over field styling
- Can't match BuildRight's exact aesthetic

---

### ✅ Correct Approach (BuildRight Pattern)

#### Step 1: Keep Our Exact HTML

```html
<!-- login.html -->
<main>
  <div class="login-form"></div>
</main>
```

#### Step 2: Block Creates Our Custom Form

```javascript
// blocks/login-form/login-form.js
export default async function decorate(block) {
  // Create OUR exact form structure
  const form = document.createElement('form');
  form.id = 'login-form';
  form.innerHTML = `
    <div class="login-form-group">
      <label for="email">Email Address</label>
      <input type="email" id="email" class="login-form-input" required>
    </div>
    <div class="login-form-group">
      <label for="password">Password</label>
      <input type="password" id="password" class="login-form-input" required>
    </div>
    <div class="login-form-group">
      <button type="submit" class="btn btn-cta">Login</button>
    </div>
  `;
  
  block.appendChild(form);
  
  // Wire OUR form to Dropin API
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Call Dropin API (not render Dropin UI)
    const { getCustomerToken } = await import('@dropins/storefront-auth/api.js');
    
    await getCustomerToken({ email, password });
    
    // Handle success
    window.location.href = './dashboard.html';
  });
}
```

---

## Adobe's Official Position

According to Adobe's Storefront SDK documentation:

> **"Using API functions without containers: Call API functions directly for programmatic control without rendering UI"**

This is **explicitly supported** as an advanced extension point. The research confirms:

### The Three-Level Architecture
1. **Extend** (RECOMMENDED) - Use dropin containers with slots, styling, events
2. **Substitute** - Replace dropins with third-party solutions when extensibility insufficient
3. **Create** - Build entirely new dropins (early access)

**Our Approach**: We're using **Substitute** pattern - calling Dropin APIs directly because Auth Dropin has zero form customization slots.

### When API-Only is Appropriate (from Research)

- ✅ **Design-pixel-perfect matching required** (BuildRight's case)
- ✅ **Need complete control over DOM hierarchy** (custom tabs, layout)
- ✅ **Container slots don't provide sufficient extension points** (Auth has ZERO)
- ✅ **Custom rendering layer for ACO data** (our product catalog)

---

## Benefits of This Pattern

### 1. **Design Control**
- ✅ Pixel-perfect BuildRight design
- ✅ Complete CSS control
- ✅ Consistent visual language

### 2. **Functionality**
- ✅ Real Commerce authentication
- ✅ Real cart management
- ✅ All Dropin features available

### 3. **Maintainability**
- ✅ Clear separation: HTML/CSS (ours) + APIs (Dropins)
- ✅ Easy to update design without touching functionality
- ✅ Easy to update functionality without touching design

### 4. **Flexibility**
- ✅ Can use Dropin UI in standalone contexts (if desired)
- ✅ Can use custom UI in key user-facing areas (like header)
- ✅ Context-aware rendering via `data-header-context` attribute

---

## Critical: What You MUST Handle (Research Requirements)

When using API-only approach (not using Dropin containers), you are responsible for:

### 1. ✅ Event Synchronization
**Requirement**: Listen to dropin events to keep state synchronized

```javascript
// ✅ IMPLEMENTED: scripts/initializers/auth.js
import { events } from '@dropins/tools/event-bus.js';

events.on('authenticated', async (isAuthenticated) => {
  if (isAuthenticated) {
    // Your custom handling
  }
});
```

### 2. ✅ State Management
**Requirement**: Handle loading states that containers normally manage

```javascript
// ✅ IMPLEMENTED: blocks/login-form/login-form.js
submitBtn.disabled = true;
submitBtn.textContent = 'Logging in...';

try {
  await getCustomerToken({ email, password });
} catch (error) {
  submitBtn.disabled = false;
  submitBtn.textContent = 'Login';
  alert(error.message);
}
```

### 3. ✅ Error Handling
**Requirement**: Map auth API errors to your design system

```javascript
// ✅ IMPLEMENTED: Proper error handling with user feedback
catch (error) {
  console.error('[Login Form] Error:', error);
  alert(error.message || 'Login failed. Please try again.');
}
```

### 4. ✅ Session Persistence
**Requirement**: Verify auth API sets auth tokens correctly

```javascript
// ✅ IMPLEMENTED: Dropin API handles tokens automatically
// Our role: Bridge to BuildRight persona system
const customer = await getCustomerData(token);
await initializeMeshForEmail(customer.email);
```

### 5. ✅ Performance Optimization
**Requirement**: Efficiently manage API calls and caching

```javascript
// ✅ IMPLEMENTED: Persona data cached in sessionStorage
sessionStorage.setItem('buildright_persona_email', customer.email);
```

---

## Implementation Checklist

When integrating a new Dropin:

### 1. Identify the UI Elements
- [ ] What existing BuildRight HTML do we want to keep?
- [ ] What buttons, forms, or containers are involved?

### 2. Create Empty Containers
- [ ] Add empty `<div id="xxx-container"></div>` placeholders
- [ ] Keep existing buttons, labels, and styling intact

### 3. Initialize Dropin in Container
- [ ] Create dropin block element dynamically
- [ ] Add `data-header-context="true"` if in header
- [ ] Insert into custom container
- [ ] Call `decorateBlock()`

### 4. Update Dropin Block JS
- [ ] Check for `block.dataset.headerContext === 'true'`
- [ ] **If true**: Wire to existing BuildRight HTML
- [ ] **If false**: Render Dropin's own UI (for standalone use)

### 5. Wire Up Events
- [ ] Connect existing buttons to Dropin APIs
- [ ] Update labels/badges based on Dropin state
- [ ] Listen for Dropin events (`cart/updated`, `authenticated`, etc.)

### 6. Test Both Contexts
- [ ] Test in header (custom design)
- [ ] Test on standalone page (if applicable)
- [ ] Verify state changes (login, cart add, etc.)

---

## Files to Reference

### Examples of This Pattern

1. **Header Integration**
   - `blocks/header/header.html` - Custom HTML with containers
   - `blocks/header/header.js` - Dropin initialization
   - `blocks/auth-dropin/auth-dropin.js` - Context-aware rendering
   - `blocks/commerce-mini-cart/commerce-mini-cart.js` - Context-aware rendering

2. **Login Form Integration**
   - `pages/login.html` - Simple block reference
   - `blocks/login-form/login-form.js` - Custom form + Dropin API
   - `blocks/login-form/login-form.css` - Self-contained block styles

### Related Documentation

- **Decision Record**: `docs/reference/decisions/AUTH-DROPIN-API-ONLY.md` ⭐ **Read this for full rationale**
- **Perplexity Research**: `docs/reference/research/I have an existing front end design...md`
- **EDS Block Patterns**: `docs/reference/backend/EDS-BLOCK-PATTERNS.md`
- **CSS Architecture**: `docs/standards/CSS-ARCHITECTURE.md`
- **Phase 5.5 Plan**: `docs/implementation/active/PHASE-5.5-COMMERCE-DROPINS.md`

---

## Anti-Patterns to Avoid

### ❌ Don't: Mix UI Rendering

```javascript
// BAD: Letting dropin partially render, then overriding styles
const { render } = await import('@dropins/storefront-auth/render.js');
await render(SignIn, {})(block);
// Then trying to override CSS with !important rules
```

**Why it's bad:**
- CSS specificity battles
- Brittle and hard to maintain
- Dropin updates can break overrides

### ❌ Don't: Create Wrapper Divs Unnecessarily

```html
<!-- BAD: Extra wrappers for no reason -->
<div class="custom-wrapper">
  <div class="inner-wrapper">
    <div class="auth-dropin"></div>
  </div>
</div>
```

**Why it's bad:**
- Adds complexity
- Makes CSS harder to write
- Violates EDS block-first architecture

### ❌ Don't: Inline Event Handlers in HTML

```html
<!-- BAD: Inline onclick -->
<button onclick="handleLogin()">Login</button>
```

**Why it's bad:**
- Violates Content Security Policy (CSP)
- Harder to test
- Not the EDS way

---

## Summary

**The BuildRight Dropin Pattern:**

1. **Keep our exact design** (HTML/CSS)
2. **Use dropin APIs** (not dropin UI)
3. **Detect context** (`data-header-context`)
4. **Wire functionality** to our custom elements
5. **Listen for events** to update state

This ensures:
- ✅ Perfect visual match to BuildRight design
- ✅ Full Commerce functionality
- ✅ Maintainable, testable code
- ✅ Flexibility for different contexts

