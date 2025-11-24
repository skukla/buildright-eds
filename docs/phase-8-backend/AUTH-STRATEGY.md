# Authentication Strategy

**Research Date**: November 15, 2024  
**Purpose**: Define authentication approach for BuildRight demo and production

This document outlines the authentication strategy for BuildRight, covering both demo mode (persona selection) and future production integration with Adobe Commerce Auth Dropin.

---

## Overview

### Two-Phase Authentication Strategy

**Phase 1: Demo Mode** (Phases 0-7)
- Simple persona selection interface
- No real authentication required
- Session-based persona storage
- Quick persona switching for demos

**Phase 2: Production Mode** (Post-Launch)
- Adobe Commerce Auth Dropin integration
- Real user authentication
- Persona mapped from user account attributes
- ACO-driven catalog view assignment

---

## Demo Mode Authentication

### User Flow

```
1. User visits BuildRight site
   ↓
2. Not logged in → Redirect to persona selector
   ↓
3. User clicks "I am [Persona Name]"
   ↓
4. Store persona in session
   ↓
5. Redirect to persona's default dashboard
   ↓
6. User browses with persona-specific catalog view
```

### Persona Selector Interface

**File**: `pages/persona-selector.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to BuildRight</title>
  <link rel="stylesheet" href="/styles/styles.css">
</head>
<body>
  <main>
    <section class="persona-selector">
      <div class="hero">
        <h1>Welcome to BuildRight</h1>
        <p>Select your role to get started</p>
      </div>
      
      <div class="persona-grid">
        <!-- Sarah - Production Builder -->
        <div class="persona-card" data-persona="sarah">
          <div class="persona-icon">🏗️</div>
          <h2>Production Builder</h2>
          <p class="persona-name">Sarah Mitchell</p>
          <p class="persona-description">
            Building 15-30 homes/year<br>
            Template-based workflow<br>
            Bulk material ordering
          </p>
          <button class="select-persona" data-persona="sarah">
            Continue as Sarah
          </button>
        </div>
        
        <!-- Marcus - Project Manager -->
        <div class="persona-card" data-persona="marcus">
          <div class="persona-icon">📋</div>
          <h2>Project Manager</h2>
          <p class="persona-name">Marcus Chen</p>
          <p class="persona-description">
            Managing commercial projects<br>
            Multi-phase planning<br>
            Team coordination
          </p>
          <button class="select-persona" data-persona="marcus">
            Continue as Marcus
          </button>
        </div>
        
        <!-- Lisa - Luxury Builder -->
        <div class="persona-card" data-persona="lisa">
          <div class="persona-icon">✨</div>
          <h2>Luxury Builder</h2>
          <p class="persona-name">Lisa Rodriguez</p>
          <p class="persona-description">
            Custom luxury homes<br>
            Premium materials<br>
            Package configurations
          </p>
          <button class="select-persona" data-persona="lisa">
            Continue as Lisa
          </button>
        </div>
        
        <!-- David - Deck Specialist -->
        <div class="persona-card" data-persona="david">
          <div class="persona-icon">🪵</div>
          <h2>Deck Specialist</h2>
          <p class="persona-name">David Thompson</p>
          <p class="persona-description">
            Outdoor living projects<br>
            Deck & patio building<br>
            DIY-friendly guidance
          </p>
          <button class="select-persona" data-persona="david">
            Continue as David
          </button>
        </div>
        
        <!-- Kevin - Facilities Manager -->
        <div class="persona-card" data-persona="kevin">
          <div class="persona-icon">🔧</div>
          <h2>Facilities Manager</h2>
          <p class="persona-name">Kevin Park</p>
          <p class="persona-description">
            Multi-property maintenance<br>
            Quick reordering<br>
            Inventory management
          </p>
          <button class="select-persona" data-persona="kevin">
            Continue as Kevin
          </button>
        </div>
      </div>
      
      <div class="demo-notice">
        <p>ℹ️ This is a demo environment. Select any persona to explore BuildRight's capabilities.</p>
      </div>
    </section>
  </main>
  
  <script type="module">
    import { selectPersona } from '/scripts/auth.js';
    
    document.querySelectorAll('.select-persona').forEach(button => {
      button.addEventListener('click', async () => {
        const personaId = button.dataset.persona;
        await selectPersona(personaId);
      });
    });
  </script>
</body>
</html>
```

---

### Authentication Service (Demo Mode)

**File**: `scripts/auth.js`

```javascript
import { personas } from './persona-config.js';

const AUTH_KEY = 'buildright_current_persona';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Select a persona (demo mode)
 */
export async function selectPersona(personaId) {
  const persona = personas[personaId];
  
  if (!persona) {
    throw new Error(`Persona ${personaId} not found`);
  }
  
  // Store in session
  const session = {
    personaId: persona.id,
    personaName: persona.name,
    role: persona.role,
    catalogView: persona.policies.catalogView || `${personaId}-catalog`,
    timestamp: Date.now(),
    mode: 'demo'
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  
  console.log(`[Auth] Persona selected: ${persona.name} (${persona.role})`);
  
  // Emit auth event
  window.dispatchEvent(new CustomEvent('auth:persona-selected', {
    detail: { persona }
  }));
  
  // Redirect to persona's default dashboard
  const dashboardUrl = getPersonaDashboard(persona);
  window.location.href = dashboardUrl;
}

/**
 * Get current persona
 */
export function getCurrentPersona() {
  // Try sessionStorage first (browser session)
  let sessionData = sessionStorage.getItem(AUTH_KEY);
  
  // Fall back to localStorage (persistent)
  if (!sessionData) {
    sessionData = localStorage.getItem(AUTH_KEY);
  }
  
  if (!sessionData) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionData);
    
    // Check if session expired
    if (Date.now() - session.timestamp > SESSION_DURATION) {
      clearAuth();
      return null;
    }
    
    // Return full persona object
    return personas[session.personaId];
  } catch (error) {
    console.error('[Auth] Failed to parse session:', error);
    clearAuth();
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return getCurrentPersona() !== null;
}

/**
 * Require authentication - redirect if not logged in
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    // Store intended destination
    sessionStorage.setItem('buildright_return_url', window.location.href);
    
    // Redirect to persona selector
    window.location.href = '/pages/persona-selector.html';
    return false;
  }
  return true;
}

/**
 * Clear authentication
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  
  // Emit logout event
  window.dispatchEvent(new CustomEvent('auth:logout'));
  
  console.log('[Auth] Session cleared');
}

/**
 * Logout and return to persona selector
 */
export function logout() {
  clearAuth();
  window.location.href = '/pages/persona-selector.html';
}

/**
 * Switch persona (demo mode feature)
 */
export function switchPersona(personaId) {
  selectPersona(personaId);
}

/**
 * Get persona's dashboard URL
 */
function getPersonaDashboard(persona) {
  const dashboardMap = {
    'sarah': '/pages/templates.html',
    'marcus': '/pages/project-builder.html',
    'lisa': '/pages/packages.html',
    'david': '/pages/deck-wizard.html',
    'kevin': '/pages/restock-dashboard.html'
  };
  
  return dashboardMap[persona.id] || '/pages/catalog.html';
}

/**
 * Get return URL after auth
 */
export function getReturnUrl() {
  const returnUrl = sessionStorage.getItem('buildright_return_url');
  sessionStorage.removeItem('buildright_return_url');
  return returnUrl || '/';
}

// Auto-check auth on protected pages
if (document.body.classList.contains('protected-page')) {
  requireAuth();
}
```

---

### User Menu Component (Demo Mode)

**File**: `blocks/user-menu/user-menu.js`

```javascript
import { getCurrentPersona, logout } from '../../scripts/auth.js';

export default function decorate(block) {
  const persona = getCurrentPersona();
  
  if (!persona) {
    block.innerHTML = `
      <div class="user-menu guest">
        <a href="/pages/persona-selector.html" class="login-link">
          Select Persona
        </a>
      </div>
    `;
    return;
  }
  
  block.innerHTML = `
    <div class="user-menu authenticated">
      <button class="user-menu-trigger">
        <span class="persona-icon">${getPersonaIcon(persona.id)}</span>
        <span class="persona-name">${persona.name}</span>
        <span class="persona-role">${persona.role}</span>
      </button>
      
      <div class="user-menu-dropdown" hidden>
        <div class="persona-info">
          <div class="persona-icon-large">${getPersonaIcon(persona.id)}</div>
          <div>
            <strong>${persona.name}</strong>
            <p>${persona.role}</p>
          </div>
        </div>
        
        <hr>
        
        <nav class="menu-nav">
          <a href="${getDashboardUrl(persona)}">Dashboard</a>
          <a href="/pages/catalog.html">Browse Catalog</a>
          <a href="/pages/cart.html">Cart</a>
          <a href="/pages/order-history.html">Order History</a>
        </nav>
        
        <hr>
        
        <div class="demo-features">
          <p class="demo-label">Demo Mode</p>
          <button class="switch-persona">Switch Persona</button>
        </div>
        
        <hr>
        
        <button class="logout-btn">Sign Out</button>
      </div>
    </div>
  `;
  
  // Toggle dropdown
  const trigger = block.querySelector('.user-menu-trigger');
  const dropdown = block.querySelector('.user-menu-dropdown');
  
  trigger.addEventListener('click', () => {
    dropdown.hidden = !dropdown.hidden;
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      dropdown.hidden = true;
    }
  });
  
  // Logout
  block.querySelector('.logout-btn').addEventListener('click', () => {
    logout();
  });
  
  // Switch persona
  block.querySelector('.switch-persona').addEventListener('click', () => {
    window.location.href = '/pages/persona-selector.html';
  });
}

function getPersonaIcon(personaId) {
  const icons = {
    'sarah': '🏗️',
    'marcus': '📋',
    'lisa': '✨',
    'david': '🪵',
    'kevin': '🔧'
  };
  return icons[personaId] || '👤';
}

function getDashboardUrl(persona) {
  const dashboards = {
    'sarah': '/pages/templates.html',
    'marcus': '/pages/project-builder.html',
    'lisa': '/pages/packages.html',
    'david': '/pages/deck-wizard.html',
    'kevin': '/pages/restock-dashboard.html'
  };
  return dashboards[persona.id] || '/';
}
```

---

## Production Mode Authentication

### Adobe Commerce Auth Dropin Integration

When moving to production, we'll integrate the `@dropins/storefront-auth` dropin.

### User Flow (Production)

```
1. User visits BuildRight site
   ↓
2. Not logged in → Show Auth Dropin (SignIn)
   ↓
3. User enters credentials
   ↓
4. Auth Dropin validates with Adobe Commerce
   ↓
5. Fetch user account data
   ↓
6. Determine persona from account attributes
   ↓
7. Fetch catalog view from ACO
   ↓
8. Redirect to persona's dashboard
```

### Persona Determination Logic

**How to map real users to personas**:

Adobe Commerce provides three mechanisms for customer categorization:

**1. Customer Groups** (Single assignment)
- A customer belongs to **ONE customer group** at a time
- Used for: Pricing, tax classes, discounts
- API: `GET /V1/customers/{customerId}` returns `group_id`

**2. Customer Segments** (Multiple assignments)
- A customer can belong to **MULTIPLE segments** simultaneously
- Dynamic, behavior-based segmentation
- API: GraphQL `customerSegments` query returns array

**3. Custom Attributes** (Flexible, recommended) ⭐
- Store custom data directly on customer record
- Validated via input validation rules
- Most straightforward for persona assignment
- API: Included in customer data response

---

### Recommended Approach: Business Attribute-Based Assignment

**Best practice for BuildRight**: Use **realistic business attributes** collected during customer onboarding.

**Why Business Attributes?**
- ✅ Reflects real onboarding process
- ✅ Production-ready (not demo-specific)
- ✅ Natural data collection points
- ✅ Can power other business logic
- ✅ Works with ACO catalog view mapping
- ✅ Validated through normal business rules

**Onboarding Attributes** (what we'd actually collect):

1. **Business Type** (`business_type`)
   - Residential Builder
   - Commercial Contractor
   - Facilities Management Company
   - Specialty Contractor
   - Individual/DIY

2. **Project Scale** (`project_scale`)
   - High Volume (15+ projects/year)
   - Medium Volume (5-15 projects/year)
   - Low Volume (1-5 projects/year)
   - Maintenance/Restock

3. **Primary Service** (`primary_service`)
   - New Construction
   - Renovation/Remodel
   - Specialty Work (Decks, Outdoor)
   - Maintenance/Repairs
   - Multi-Service

4. **Customer Tier** (`customer_tier`) - Could be set by sales team
   - Premium Plus
   - Premium
   - Standard
   - Basic

5. **Buying Behavior** (`buying_behavior`)
   - Template/Repeat Orders
   - Custom Project Planning
   - Package Deals
   - Quick Restock
   - DIY with Guidance

**Implementation**:

```javascript
/**
 * Determine persona from business attributes
 * Uses realistic onboarding data
 */
export async function determinePersonaFromAccount(customer) {
  // Extract business attributes
  const attrs = getCustomerAttributes(customer);
  
  const businessType = attrs.business_type;
  const projectScale = attrs.project_scale;
  const primaryService = attrs.primary_service;
  const customerTier = attrs.customer_tier;
  const buyingBehavior = attrs.buying_behavior;
  
  console.log('[Auth] Customer profile:', {
    businessType,
    projectScale,
    primaryService,
    customerTier,
    buyingBehavior
  });
  
  // Determine experience based on business attributes
  
  // Sarah (Production Builder)
  // - Residential Builder + High Volume + Template/Repeat Orders
  if (businessType === 'Residential Builder' && 
      projectScale === 'High Volume' &&
      buyingBehavior === 'Template/Repeat Orders') {
    console.log('[Auth] Mapped to Production Builder experience');
    return 'sarah';
  }
  
  // Marcus (Commercial Contractor / Project Manager)
  // - Commercial Contractor + Medium/High Volume + Custom Project Planning
  if (businessType === 'Commercial Contractor' &&
      (projectScale === 'Medium Volume' || projectScale === 'High Volume') &&
      buyingBehavior === 'Custom Project Planning') {
    console.log('[Auth] Mapped to Commercial Project Manager experience');
    return 'marcus';
  }
  
  // Lisa (Luxury Builder)
  // - Residential Builder + Premium Plus Tier + Package Deals
  if (businessType === 'Residential Builder' &&
      customerTier === 'Premium Plus' &&
      buyingBehavior === 'Package Deals') {
    console.log('[Auth] Mapped to Luxury Builder experience');
    return 'lisa';
  }
  
  // David (Specialty Contractor - Deck/Outdoor)
  // - Specialty Contractor + Specialty Work (Decks) + DIY with Guidance
  if ((businessType === 'Specialty Contractor' || businessType === 'Individual/DIY') &&
      primaryService === 'Specialty Work (Decks, Outdoor)') {
    console.log('[Auth] Mapped to Deck Specialist experience');
    return 'david';
  }
  
  // Kevin (Facilities Manager)
  // - Facilities Management Company + Maintenance/Restock + Quick Restock
  if (businessType === 'Facilities Management Company' &&
      projectScale === 'Maintenance/Restock' &&
      buyingBehavior === 'Quick Restock') {
    console.log('[Auth] Mapped to Facilities Manager experience');
    return 'kevin';
  }
  
  // Fallback 1: Customer group mapping (if attributes incomplete)
  if (customer.group_id) {
    const groupToPersona = {
      4: 'sarah',    // Production Builders group
      5: 'marcus',   // Commercial Contractors group
      6: 'lisa',     // Luxury Builders group
      7: 'david',    // Deck Specialists group
      8: 'kevin'     // Facilities Managers group
    };
    
    if (groupToPersona[customer.group_id]) {
      console.log('[Auth] Mapped via customer group:', customer.group_id);
      return groupToPersona[customer.group_id];
    }
  }
  
  // Default: Residential Builder experience (most common)
  console.warn('[Auth] No clear match, defaulting to production builder');
  return 'sarah';
}

/**
 * Helper to extract custom attributes
 */
function getCustomerAttributes(customer) {
  const attrs = {};
  
  if (customer.custom_attributes) {
    customer.custom_attributes.forEach(attr => {
      attrs[attr.attribute_code] = attr.value;
    });
  }
  
  return attrs;
}
```

---

### Onboarding Flow Example

**Registration/Account Setup Form**:

```html
<form id="business-profile-form">
  <h2>Tell us about your business</h2>
  
  <!-- Business Type -->
  <label>What type of business are you?</label>
  <select name="business_type" required>
    <option value="">Select...</option>
    <option value="Residential Builder">Residential Builder</option>
    <option value="Commercial Contractor">Commercial Contractor</option>
    <option value="Facilities Management Company">Facilities Management Company</option>
    <option value="Specialty Contractor">Specialty Contractor</option>
    <option value="Individual/DIY">Individual/Homeowner (DIY)</option>
  </select>
  
  <!-- Project Scale -->
  <label>What's your typical project volume?</label>
  <select name="project_scale" required>
    <option value="">Select...</option>
    <option value="High Volume">High Volume (15+ projects/year)</option>
    <option value="Medium Volume">Medium Volume (5-15 projects/year)</option>
    <option value="Low Volume">Low Volume (1-5 projects/year)</option>
    <option value="Maintenance/Restock">Maintenance/Restock Orders</option>
  </select>
  
  <!-- Primary Service -->
  <label>What's your primary focus?</label>
  <select name="primary_service" required>
    <option value="">Select...</option>
    <option value="New Construction">New Construction</option>
    <option value="Renovation/Remodel">Renovation/Remodel</option>
    <option value="Specialty Work (Decks, Outdoor)">Specialty Work (Decks, Outdoor)</option>
    <option value="Maintenance/Repairs">Maintenance/Repairs</option>
    <option value="Multi-Service">Multi-Service</option>
  </select>
  
  <!-- Buying Behavior -->
  <label>How do you typically order materials?</label>
  <select name="buying_behavior" required>
    <option value="">Select...</option>
    <option value="Template/Repeat Orders">Same materials repeatedly (templates)</option>
    <option value="Custom Project Planning">Custom planning for each project</option>
    <option value="Package Deals">Pre-configured packages</option>
    <option value="Quick Restock">Quick restock of common items</option>
    <option value="DIY with Guidance">DIY with step-by-step guidance</option>
  </select>
  
  <button type="submit">Create Account</button>
</form>
```

---

### Mapping Table: Attributes → Persona

| Persona | Business Type | Project Scale | Primary Service | Buying Behavior | Customer Tier |
|---------|---------------|---------------|-----------------|-----------------|---------------|
| **Sarah** (Production Builder) | Residential Builder | High Volume | New Construction | Template/Repeat Orders | Premium |
| **Marcus** (Project Manager) | Commercial Contractor | Medium/High Volume | New Construction or Multi-Service | Custom Project Planning | Premium |
| **Lisa** (Luxury Builder) | Residential Builder | Low/Medium Volume | New Construction | Package Deals | Premium Plus |
| **David** (Deck Specialist) | Specialty Contractor or Individual/DIY | Low/Medium Volume | Specialty Work (Decks) | DIY with Guidance | Standard |
| **Kevin** (Facilities Manager) | Facilities Management | Maintenance/Restock | Maintenance/Repairs | Quick Restock | Basic |

---

### Demo Mode Adaptation

For demos, we have **two options**:

**Option 1: Quick Persona Selector** (For time-limited demos)
- Shows 5 persona cards
- One click to enter experience
- Simulates completed onboarding in background

**Option 2: Guided Sign-Up Flow** (For realistic demos) ⭐ **RECOMMENDED**
- Shows actual onboarding form
- Collects business attributes step-by-step
- More realistic, demonstrates the process
- Better for stakeholder demos

---

### Recommended: Guided Sign-Up Demo Flow

**Page**: `/pages/signup-demo.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Create Your BuildRight Account</title>
  <link rel="stylesheet" href="/styles/styles.css">
</head>
<body>
  <main>
    <section class="signup-container">
      <div class="signup-header">
        <h1>Welcome to BuildRight</h1>
        <p>Let's get your account set up. This takes about 2 minutes.</p>
      </div>
      
      <!-- Multi-step form -->
      <div class="signup-wizard">
        
        <!-- Step 1: Account Info -->
        <div class="signup-step" data-step="1">
          <h2>Step 1: Your Account Information</h2>
          
          <label>Email Address</label>
          <input type="email" name="email" required placeholder="your@email.com">
          
          <label>Password</label>
          <input type="password" name="password" required>
          
          <label>Company Name</label>
          <input type="text" name="company_name" required placeholder="Your Company">
          
          <label>Your Name</label>
          <div class="name-fields">
            <input type="text" name="firstname" required placeholder="First Name">
            <input type="text" name="lastname" required placeholder="Last Name">
          </div>
          
          <button class="next-btn">Continue</button>
        </div>
        
        <!-- Step 2: Business Profile -->
        <div class="signup-step" data-step="2" hidden>
          <h2>Step 2: Tell Us About Your Business</h2>
          <p>This helps us customize your experience and show you relevant products.</p>
          
          <label>What type of business are you?</label>
          <select name="business_type" required>
            <option value="">Select your business type...</option>
            <option value="Residential Builder">Residential Builder</option>
            <option value="Commercial Contractor">Commercial Contractor</option>
            <option value="Facilities Management Company">Facilities Management Company</option>
            <option value="Specialty Contractor">Specialty Contractor (Decks, Outdoor, etc.)</option>
            <option value="Individual/DIY">Individual/Homeowner (DIY Projects)</option>
          </select>
          
          <label>What's your typical project volume?</label>
          <select name="project_scale" required>
            <option value="">Select project volume...</option>
            <option value="High Volume">High Volume (15+ projects per year)</option>
            <option value="Medium Volume">Medium Volume (5-15 projects per year)</option>
            <option value="Low Volume">Low Volume (1-5 projects per year)</option>
            <option value="Maintenance/Restock">Ongoing Maintenance & Restock</option>
          </select>
          
          <label>What's your primary focus?</label>
          <select name="primary_service" required>
            <option value="">Select primary service...</option>
            <option value="New Construction">New Construction</option>
            <option value="Renovation/Remodel">Renovation/Remodel</option>
            <option value="Specialty Work (Decks, Outdoor)">Specialty Work (Decks, Outdoor Living)</option>
            <option value="Maintenance/Repairs">Maintenance/Repairs</option>
            <option value="Multi-Service">Multi-Service (All of the above)</option>
          </select>
          
          <label>How do you typically order materials?</label>
          <select name="buying_behavior">
            <option value="">Select ordering preference...</option>
            <option value="Template/Repeat Orders">Same materials repeatedly (I have standard templates)</option>
            <option value="Custom Project Planning">Custom planning for each unique project</option>
            <option value="Package Deals">Pre-configured material packages</option>
            <option value="Quick Restock">Quick restock of common items</option>
            <option value="DIY with Guidance">DIY projects with step-by-step guidance</option>
          </select>
          
          <div class="button-group">
            <button class="back-btn">Back</button>
            <button class="next-btn">Continue</button>
          </div>
        </div>
        
        <!-- Step 3: Confirmation & Experience Preview -->
        <div class="signup-step" data-step="3" hidden>
          <h2>Step 3: Your Personalized Experience</h2>
          <p>Based on your profile, we've customized BuildRight for you:</p>
          
          <div class="experience-preview">
            <!-- Dynamically populated based on selections -->
            <div class="preview-card">
              <div class="preview-icon"><!-- Icon --></div>
              <h3 class="preview-title"><!-- Experience Name --></h3>
              <p class="preview-description"><!-- Description --></p>
              
              <div class="preview-features">
                <h4>Your customized features:</h4>
                <ul class="feature-list">
                  <!-- Dynamically populated -->
                </ul>
              </div>
              
              <div class="preview-catalog">
                <p><strong>Your catalog:</strong> <span class="product-count"><!-- # --></span> products curated for your needs</p>
              </div>
            </div>
          </div>
          
          <div class="terms-acceptance">
            <label>
              <input type="checkbox" name="terms" required>
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>
          
          <div class="button-group">
            <button class="back-btn">Back</button>
            <button class="submit-btn">Create My Account</button>
          </div>
        </div>
        
      </div>
      
      <!-- Progress Indicator -->
      <div class="progress-bar">
        <div class="progress-step active" data-step="1">
          <span class="step-number">1</span>
          <span class="step-label">Account</span>
        </div>
        <div class="progress-step" data-step="2">
          <span class="step-number">2</span>
          <span class="step-label">Business Profile</span>
        </div>
        <div class="progress-step" data-step="3">
          <span class="step-number">3</span>
          <span class="step-label">Confirm</span>
        </div>
      </div>
      
      <div class="signup-footer">
        <p>Already have an account? <a href="/pages/login.html">Sign in</a></p>
        <p class="demo-notice">ℹ️ Demo Mode: This simulates account creation</p>
      </div>
    </section>
  </main>
  
  <script type="module" src="/scripts/signup-wizard.js"></script>
</body>
</html>
```

---

### Sign-Up Wizard JavaScript

**File**: `scripts/signup-wizard.js`

```javascript
import { determinePersonaFromAttributes, getBusinessProfileForPersona } from './auth.js';

let currentStep = 1;
let formData = {};

// Initialize wizard
document.addEventListener('DOMContentLoaded', () => {
  initializeWizard();
});

function initializeWizard() {
  // Next button handlers
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => nextStep());
  });
  
  // Back button handlers
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => prevStep());
  });
  
  // Submit handler
  document.querySelector('.submit-btn')?.addEventListener('click', () => submitSignup());
  
  // Listen for business attribute changes to update preview
  ['business_type', 'project_scale', 'primary_service', 'buying_behavior'].forEach(field => {
    document.querySelector(`[name="${field}"]`)?.addEventListener('change', () => {
      if (currentStep === 2) {
        updateExperiencePreview();
      }
    });
  });
}

function nextStep() {
  // Validate current step
  const currentStepEl = document.querySelector(`.signup-step[data-step="${currentStep}"]`);
  const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
  
  let valid = true;
  inputs.forEach(input => {
    if (!input.value) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
      // Store value
      formData[input.name] = input.value;
    }
  });
  
  if (!valid) {
    alert('Please fill in all required fields');
    return;
  }
  
  // If moving to step 3, generate preview
  if (currentStep === 2) {
    generateExperiencePreview();
  }
  
  // Move to next step
  currentStep++;
  showStep(currentStep);
}

function prevStep() {
  currentStep--;
  showStep(currentStep);
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.signup-step').forEach(el => {
    el.hidden = true;
  });
  
  // Show current step
  document.querySelector(`.signup-step[data-step="${step}"]`).hidden = false;
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    if (stepNum < step) {
      el.classList.add('completed');
      el.classList.remove('active');
    } else if (stepNum === step) {
      el.classList.add('active');
      el.classList.remove('completed');
    } else {
      el.classList.remove('active', 'completed');
    }
  });
  
  // Scroll to top
  window.scrollTo(0, 0);
}

function generateExperiencePreview() {
  // Determine which experience they'll get
  const personaId = determinePersonaFromAttributes(formData);
  const profile = getBusinessProfileForPersona(personaId);
  
  // Get persona details
  const personaDetails = {
    'sarah': {
      icon: '🏗️',
      title: 'Production Builder Experience',
      description: 'Streamlined for high-volume residential construction with template-based ordering',
      features: [
        'Pre-configured home templates',
        'Bulk material ordering',
        'Volume-based pricing',
        'Repeat order templates',
        'Multi-property management'
      ],
      productCount: '~156 products'
    },
    'marcus': {
      icon: '📋',
      title: 'Commercial Project Manager Experience',
      description: 'Comprehensive tools for multi-phase commercial projects',
      features: [
        'Project-based material wizard',
        'Multi-phase planning',
        'Custom BOMs (Bill of Materials)',
        'Team collaboration tools',
        'Job site delivery tracking'
      ],
      productCount: '~168 products'
    },
    'lisa': {
      icon: '✨',
      title: 'Luxury Builder Experience',
      description: 'Premium materials and custom packages for luxury home construction',
      features: [
        'Pre-configured luxury packages',
        'Premium/specialty materials',
        'White-glove delivery',
        'Custom material sourcing',
        'Concierge support'
      ],
      productCount: '~142 products'
    },
    'david': {
      icon: '🪵',
      title: 'Deck Specialist Experience',
      description: 'Guided workflow for deck and outdoor living projects',
      features: [
        'Interactive deck builder wizard',
        'Material calculator',
        'DIY-friendly guidance',
        'Educational content',
        'Progressive product filtering'
      ],
      productCount: '~35-80 products (filtered by project)'
    },
    'kevin': {
      icon: '🔧',
      title: 'Facilities Manager Experience',
      description: 'Quick restock and maintenance ordering for property managers',
      features: [
        'Quick reorder dashboard',
        'Order history shortcuts',
        'Scheduled deliveries',
        'Multi-property tracking',
        'Bulk restock suggestions'
      ],
      productCount: '~58 products'
    }
  };
  
  const details = personaDetails[personaId];
  
  // Populate preview
  const previewCard = document.querySelector('.experience-preview .preview-card');
  previewCard.querySelector('.preview-icon').textContent = details.icon;
  previewCard.querySelector('.preview-title').textContent = details.title;
  previewCard.querySelector('.preview-description').textContent = details.description;
  
  // Features list
  const featureList = previewCard.querySelector('.feature-list');
  featureList.innerHTML = details.features.map(f => `<li>✓ ${f}</li>`).join('');
  
  // Product count
  previewCard.querySelector('.product-count').textContent = details.productCount;
  
  // Store persona for submission
  formData.determinedPersona = personaId;
}

async function submitSignup() {
  // Validate terms
  const termsAccepted = document.querySelector('[name="terms"]').checked;
  if (!termsAccepted) {
    alert('Please accept the Terms of Service');
    return;
  }
  
  console.log('[Signup] Creating account with profile:', formData);
  
  // Show loading
  const submitBtn = document.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  
  try {
    // In demo mode: Simulate account creation
    await simulateAccountCreation(formData);
    
    // Store session
    const session = {
      personaId: formData.determinedPersona,
      email: formData.email,
      firstname: formData.firstname,
      lastname: formData.lastname,
      companyName: formData.company_name,
      businessProfile: {
        business_type: formData.business_type,
        project_scale: formData.project_scale,
        primary_service: formData.primary_service,
        buying_behavior: formData.buying_behavior,
        customer_tier: 'Standard' // Default for new accounts
      },
      timestamp: Date.now(),
      mode: 'demo'
    };
    
    localStorage.setItem('buildright_current_persona', JSON.stringify(session));
    sessionStorage.setItem('buildright_current_persona', JSON.stringify(session));
    
    // Emit event
    window.dispatchEvent(new CustomEvent('auth:signup-complete', {
      detail: { session }
    }));
    
    // Show success message
    showSuccessMessage();
    
    // Redirect to dashboard after brief delay
    setTimeout(() => {
      window.location.href = getDashboardUrl(formData.determinedPersona);
    }, 2000);
    
  } catch (error) {
    console.error('[Signup] Error:', error);
    alert('Account creation failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create My Account';
  }
}

function simulateAccountCreation(data) {
  // Simulate API call delay
  return new Promise(resolve => setTimeout(resolve, 1500));
}

function showSuccessMessage() {
  const step3 = document.querySelector('.signup-step[data-step="3"]');
  step3.innerHTML = `
    <div class="success-message">
      <div class="success-icon">✓</div>
      <h2>Welcome to BuildRight, ${formData.firstname}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Redirecting you to your personalized dashboard...</p>
      <div class="loading-spinner"></div>
    </div>
  `;
}

function getDashboardUrl(personaId) {
  const dashboards = {
    'sarah': '/pages/templates.html',
    'marcus': '/pages/project-builder.html',
    'lisa': '/pages/packages.html',
    'david': '/pages/deck-wizard.html',
    'kevin': '/pages/restock-dashboard.html'
  };
  return dashboards[personaId] || '/pages/catalog.html';
}
```

---

### Production Implementation

For production, the sign-up form would:

1. **Call Adobe Commerce Registration API**:
```javascript
async function createAccount(formData) {
  const response = await fetch('/rest/V1/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        custom_attributes: [
          { attribute_code: 'business_type', value: formData.business_type },
          { attribute_code: 'project_scale', value: formData.project_scale },
          { attribute_code: 'primary_service', value: formData.primary_service },
          { attribute_code: 'buying_behavior', value: formData.buying_behavior },
          { attribute_code: 'customer_tier', value: 'Standard' },
          { attribute_code: 'company_name', value: formData.company_name }
        ]
      },
      password: formData.password
    })
  });
  
  return response.json();
}
```

2. **Automatically log the user in** using Auth Dropin

3. **Fetch persona** from the attributes we just set

4. **Get ACO catalog view** for the determined persona

5. **Redirect to personalized dashboard**

---

### Demo Entry Points

**Option A: Quick Persona Selector** (for rapid demos)
```
/pages/persona-selector.html
→ Click persona card
→ Instant entry (simulates completed signup in background)
```

**Option B: Guided Sign-Up** (for realistic demos) ⭐
```
/pages/signup-demo.html
→ Fill out 3-step wizard
→ See experience preview
→ Account created with realistic profile
→ Enter personalized dashboard
```

**Option C: Direct Login** (for repeated demos)
```
/pages/login.html
→ Use pre-created demo accounts
→ sarah@demo.com, marcus@demo.com, etc.
```

---

### Validation Strategy

**Option 1: REST API Validation** (Recommended for custom attributes)

```javascript
/**
 * Validate persona assignment via REST API
 */
export async function validatePersonaViaAPI(customerId) {
  try {
    // GET customer data
    const response = await fetch(`/rest/V1/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    const customer = await response.json();
    
    // Extract custom attribute
    const personaAttr = customer.custom_attributes?.find(
      attr => attr.attribute_code === 'buildright_persona'
    );
    
    if (!personaAttr || !personaAttr.value) {
      throw new Error('No buildright_persona attribute found');
    }
    
    // Validate persona value
    const validPersonas = ['sarah', 'marcus', 'lisa', 'david', 'kevin'];
    if (!validPersonas.includes(personaAttr.value)) {
      throw new Error(`Invalid persona value: ${personaAttr.value}`);
    }
    
    console.log('[Auth] Persona validated:', personaAttr.value);
    return {
      valid: true,
      personaId: personaAttr.value,
      customer
    };
    
  } catch (error) {
    console.error('[Auth] Persona validation failed:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}
```

**Option 2: GraphQL Validation** (For custom attributes + segments)

```javascript
/**
 * Validate persona via GraphQL
 */
export async function validatePersonaViaGraphQL() {
  const query = `
    query {
      customer {
        id
        email
        group_id
        custom_attributes {
          attribute_code
          value
        }
      }
      customerSegments {
        segment_id
      }
    }
  `;
  
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    const { data } = await response.json();
    const customer = data.customer;
    const segments = data.customerSegments;
    
    // Check custom attribute
    const personaAttr = customer.custom_attributes.find(
      attr => attr.attribute_code === 'buildright_persona'
    );
    
    if (personaAttr) {
      return {
        valid: true,
        personaId: personaAttr.value,
        method: 'custom_attribute',
        customer,
        segments
      };
    }
    
    // Fallback: Check segments
    if (segments && segments.length > 0) {
      const personaId = mapSegmentToPersona(segments[0].segment_id);
      return {
        valid: true,
        personaId,
        method: 'customer_segment',
        customer,
        segments
      };
    }
    
    throw new Error('No persona assignment found');
    
  } catch (error) {
    console.error('[Auth] GraphQL validation failed:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}
```

**Option 3: Customer Segments Query** (For dynamic segmentation)

```javascript
/**
 * Get customer segments via GraphQL
 */
export async function getCustomerSegments() {
  const query = `
    query {
      customerSegments {
        segment_id
      }
    }
  `;
  
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    const { data } = await response.json();
    return data.customerSegments; // Array of segment IDs
    
  } catch (error) {
    console.error('[Auth] Failed to get customer segments:', error);
    return [];
  }
}
```

---

### Setting Custom Attributes in Adobe Commerce

**Via Admin Panel**:

1. Navigate to **Stores** > **Attributes** > **Customer**
2. Create the following attributes:

**Attribute: `business_type`**
- Attribute Code: `business_type`
- Input Type: Dropdown
- Values Required: Yes
- Manage Options:
  - Residential Builder
  - Commercial Contractor
  - Facilities Management Company
  - Specialty Contractor
  - Individual/DIY

**Attribute: `project_scale`**
- Attribute Code: `project_scale`
- Input Type: Dropdown
- Values Required: Yes
- Manage Options:
  - High Volume
  - Medium Volume
  - Low Volume
  - Maintenance/Restock

**Attribute: `primary_service`**
- Attribute Code: `primary_service`
- Input Type: Dropdown
- Values Required: Yes
- Manage Options:
  - New Construction
  - Renovation/Remodel
  - Specialty Work (Decks, Outdoor)
  - Maintenance/Repairs
  - Multi-Service

**Attribute: `buying_behavior`**
- Attribute Code: `buying_behavior`
- Input Type: Dropdown
- Values Required: No (can be inferred over time)
- Manage Options:
  - Template/Repeat Orders
  - Custom Project Planning
  - Package Deals
  - Quick Restock
  - DIY with Guidance

**Attribute: `customer_tier`**
- Attribute Code: `customer_tier`
- Input Type: Dropdown
- Values Required: No (set by sales team)
- Manage Options:
  - Premium Plus
  - Premium
  - Standard
  - Basic

3. Assign to customers during account creation or via bulk import

---

**Via REST API** (during registration):

```javascript
// Create customer with business attributes
const createCustomer = async (customerData) => {
  const response = await fetch('/rest/V1/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer: {
        email: customerData.email,
        firstname: customerData.firstname,
        lastname: customerData.lastname,
        custom_attributes: [
          {
            attribute_code: 'business_type',
            value: customerData.businessType
          },
          {
            attribute_code: 'project_scale',
            value: customerData.projectScale
          },
          {
            attribute_code: 'primary_service',
            value: customerData.primaryService
          },
          {
            attribute_code: 'buying_behavior',
            value: customerData.buyingBehavior
          },
          {
            attribute_code: 'customer_tier',
            value: 'Standard'  // Default, sales can upgrade
          }
        ]
      },
      password: customerData.password
    })
  });
  
  return response.json();
};
```

---

**Via CSV Import**:

```csv
email,firstname,lastname,business_type,project_scale,primary_service,buying_behavior,customer_tier
sarah@mitchellhomes.com,Sarah,Mitchell,Residential Builder,High Volume,New Construction,Template/Repeat Orders,Premium
marcus@chenconstruction.com,Marcus,Chen,Commercial Contractor,Medium Volume,Multi-Service,Custom Project Planning,Premium
lisa@rodriguezluxury.com,Lisa,Rodriguez,Residential Builder,Low Volume,New Construction,Package Deals,Premium Plus
david@thompsonoutdoor.com,David,Thompson,Specialty Contractor,Medium Volume,Specialty Work (Decks Outdoor),DIY with Guidance,Standard
kevin@parkpropertyservices.com,Kevin,Park,Facilities Management Company,Maintenance/Restock,Maintenance/Repairs,Quick Restock,Basic
```

---

### Comparison: Business Attributes vs Customer Groups vs Segments

| Feature | Business Attributes ⭐ | Customer Group | Customer Segment |
|---------|------------------------|----------------|------------------|
| **Assignment** | Multiple attributes collected | Single group only | Multiple, dynamic |
| **Data Collection** | During onboarding/registration | Admin or sales team | Automatic (rules-based) |
| **Validation** | REST API (custom_attributes) | REST API (group_id) | GraphQL query |
| **Persistence** | Permanent until changed | Permanent until changed | Dynamic (can change) |
| **Flexibility** | Very flexible (5+ attributes) | Limited (1 group) | Very flexible |
| **Production Ready** | ✅ Yes (real business data) | ✅ Yes | ✅ Yes |
| **Demo Friendly** | ✅ Yes (simulated profiles) | ✅ Yes | ⚠️ Complex setup |
| **ACO Integration** | Direct mapping via rules | Can be used | Can be used |
| **Admin Control** | Easy (onboarding form) | Easy (single selection) | Complex (segment rules) |
| **API Access** | REST + GraphQL | REST + GraphQL | GraphQL only |
| **Best For** | Explicit business profiling | Pricing/discount groups | Dynamic targeting |
| **BuildRight Use** | ✅ **RECOMMENDED** | Fallback | Optional |

---

### Why Business Attributes Are Better Than `buildright_persona`

**Business Attributes** (Recommended):
- ✅ Production-ready: Real data you'd collect anyway
- ✅ Multi-dimensional: 5 attributes vs. 1 hardcoded value
- ✅ Flexible: Can adjust mapping logic without changing data
- ✅ Extensible: Can add more attributes over time
- ✅ Audit-friendly: "Why did they get this experience?" → Clear business logic
- ✅ Demo-realistic: Shows real onboarding process

**Single `buildright_persona` attribute** (Avoid):
- ❌ Demo-specific: Not realistic for production
- ❌ Inflexible: Hardcoded persona IDs
- ❌ Not extensible: Adding new persona = changing data
- ❌ Poor audit trail: "sarah" doesn't explain why
- ❌ Doesn't demonstrate onboarding

**Example Comparison**:

```javascript
// BAD: Demo-specific persona attribute
custom_attributes: [
  { attribute_code: 'buildright_persona', value: 'sarah' }
]
// Why "sarah"? What does that mean? Hard to explain in production.

// GOOD: Business attributes
custom_attributes: [
  { attribute_code: 'business_type', value: 'Residential Builder' },
  { attribute_code: 'project_scale', value: 'High Volume' },
  { attribute_code: 'buying_behavior', value: 'Template/Repeat Orders' },
  { attribute_code: 'customer_tier', value: 'Premium' }
]
// Clear business logic: High-volume residential builder 
// who orders templates → Gets production builder experience
```

---

### Recommended Implementation Approach

**For BuildRight Production**:

1. **Primary Method**: Custom Attribute `buildright_persona`
   - Set via Admin when account is created
   - Validated via REST API: `GET /V1/customers/me`
   - Returned in Auth Dropin customer data
   
2. **Fallback Method**: Customer Group Mapping
   - If custom attribute not set, map group_id to persona
   - Customer belongs to ONE group only
   - Groups: Production Builders, Commercial Contractors, etc.

3. **Optional Enhancement**: Customer Segments
   - For dynamic persona suggestion
   - Example: "Looks like you're a frequent deck builder - switch to David's experience?"
   - Customer can belong to MULTIPLE segments

**Code Flow**:

```javascript
// In production auth.js
export async function getCurrentUser() {
  // Get customer from Auth Dropin
  const customer = await getCustomer(); // From @dropins/storefront-auth
  
  // Validate and determine persona
  const validation = await validatePersonaViaAPI(customer.id);
  
  if (!validation.valid) {
    // Show error or assign default
    console.error('[Auth] Invalid persona assignment');
    return null;
  }
  
  // Get persona config
  const persona = personas[validation.personaId];
  
  // Get ACO catalog view
  const catalogView = await getCatalogView(validation.personaId);
  
  return {
    customer,
    persona,
    catalogView,
    authenticated: true,
    validationMethod: validation.method
  };
}
```

### Updated Auth Service (Production)

**File**: `scripts/auth.js` (production mode)

```javascript
import { getCustomer } from '@dropins/storefront-auth';
import { getCatalogView } from './aco-service.js';

/**
 * Get current user (production mode)
 */
export async function getCurrentUser() {
  try {
    // Get customer from Auth Dropin
    const customer = await getCustomer();
    
    if (!customer) {
      return null;
    }
    
    // Determine persona from customer data
    const personaId = await determinePersonaFromAccount(customer);
    const persona = personas[personaId];
    
    // Get catalog view from ACO
    const catalogView = await getCatalogView(personaId);
    
    return {
      customer,
      persona,
      catalogView,
      authenticated: true,
      mode: 'production'
    };
  } catch (error) {
    console.error('[Auth] Failed to get current user:', error);
    return null;
  }
}

/**
 * Initialize Auth Dropin
 */
export function initAuth() {
  // Listen for auth events from dropin
  window.addEventListener('auth:login', async (event) => {
    console.log('[Auth] User logged in:', event.detail);
    
    // Refresh user context
    const user = await getCurrentUser();
    
    // Redirect to persona dashboard
    if (user && user.persona) {
      window.location.href = getPersonaDashboard(user.persona);
    }
  });
  
  window.addEventListener('auth:logout', () => {
    console.log('[Auth] User logged out');
    
    // Clear session
    clearAuth();
    
    // Redirect to login
    window.location.href = '/pages/login.html';
  });
}
```

### Login Page (Production)

**File**: `pages/login.html` (production mode)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Sign In - BuildRight</title>
  <link rel="stylesheet" href="/styles/styles.css">
</head>
<body>
  <main>
    <section class="auth-container">
      <div class="auth-header">
        <h1>Welcome to BuildRight</h1>
        <p>Sign in to access your account</p>
      </div>
      
      <!-- Auth Dropin will render here -->
      <div id="auth-signin"></div>
      
    </section>
  </main>
  
  <script type="module">
    import { initializeSignIn } from '@dropins/storefront-auth';
    import { initAuth } from '/scripts/auth.js';
    
    // Initialize auth event handlers
    initAuth();
    
    // Initialize Auth Dropin
    initializeSignIn(document.getElementById('auth-signin'), {
      routeSignUp: () => '/pages/register.html',
      routeForgotPassword: () => '/pages/forgot-password.html',
      routeRedirectOnSignIn: () => '/', // Will be overridden by auth.js
    });
  </script>
</body>
</html>
```

---

## Hybrid Approach (Optional)

For demos that want to show both modes:

### Demo Mode with Account Creation

```javascript
/**
 * Create demo account for persona
 */
export async function createDemoAccount(personaId) {
  const persona = personas[personaId];
  
  // Create demo user object (not stored in Adobe Commerce)
  const demoUser = {
    id: `demo_${personaId}_${Date.now()}`,
    email: `${personaId}@buildright-demo.com`,
    firstname: persona.name.split(' ')[0],
    lastname: persona.name.split(' ')[1],
    persona: personaId,
    mode: 'demo'
  };
  
  // Store in session
  localStorage.setItem('buildright_demo_user', JSON.stringify(demoUser));
  
  return demoUser;
}
```

---

## Migration Path

### Demo → Production Transition

**Step 1: Update imports**

```javascript
// Demo mode
import { getCurrentPersona } from '../../scripts/auth.js';

// Production mode (same function, different implementation)
import { getCurrentPersona } from '../../scripts/auth.js';
// Now calls Adobe Commerce Auth Dropin internally
```

**Step 2: Add persona determination**

```javascript
// Add to Adobe Commerce customer attributes:
customer.custom_attributes.buildright_persona = 'sarah'
```

**Step 3: Configure ACO**

```javascript
// ACO maps customer attributes to catalog views
// No code changes needed in EDS blocks
```

**Step 4: Swap persona selector for Auth Dropin**

```html
<!-- Demo: Persona Selector -->
<a href="/pages/persona-selector.html">Select Persona</a>

<!-- Production: Real Login -->
<a href="/pages/login.html">Sign In</a>
```

---

## Security Considerations

### Demo Mode

⚠️ **Not secure** - Anyone can select any persona
✅ **Acceptable for**: Demos, prototypes, internal showcases
❌ **Not acceptable for**: Production, real customer data

### Production Mode

✅ **Secure** - Adobe Commerce Auth Dropin handles security
✅ **Authentication** - Real user credentials validated
✅ **Authorization** - ACO policies enforce catalog access
✅ **Session management** - Commerce backend manages sessions

---

## Testing Strategy

### Demo Mode Testing

```javascript
// Test persona selection
test('Can select Sarah persona', async () => {
  await selectPersona('sarah');
  const persona = getCurrentPersona();
  expect(persona.id).toBe('sarah');
  expect(persona.role).toBe('Production Builder');
});

// Test session persistence
test('Persona persists across page reloads', () => {
  selectPersona('marcus');
  // Simulate page reload
  window.location.reload();
  const persona = getCurrentPersona();
  expect(persona.id).toBe('marcus');
});

// Test logout
test('Can logout', () => {
  selectPersona('lisa');
  logout();
  expect(getCurrentPersona()).toBeNull();
});
```

### Production Mode Testing

```javascript
// Test auth dropin integration
test('User logs in and gets persona', async () => {
  // Mock Auth Dropin
  const mockCustomer = {
    id: 123,
    email: 'sarah@example.com',
    custom_attributes: {
      buildright_persona: 'sarah'
    }
  };
  
  const user = await determinePersonaFromAccount(mockCustomer);
  expect(user).toBe('sarah');
});
```

---

## Configuration

### Environment Variables

```env
# Demo Mode
AUTH_MODE=demo
DEMO_SESSION_DURATION=86400000  # 24 hours

# Production Mode
AUTH_MODE=production
COMMERCE_API_ENDPOINT=https://your-commerce-instance.com/graphql
COMMERCE_API_KEY=your_api_key
```

### Feature Flags

```javascript
export const authConfig = {
  mode: process.env.AUTH_MODE || 'demo',
  
  demo: {
    sessionDuration: 24 * 60 * 60 * 1000,
    allowPersonaSwitching: true,
    showDemoNotice: true
  },
  
  production: {
    requireAuth: true,
    sessionDuration: 12 * 60 * 60 * 1000, // 12 hours
    allowPersonaSwitching: false,
    enableSSORedirect: true
  }
};
```

---

## Summary

### Demo Mode

✅ **Quick persona selection** for demos  
✅ **No real authentication** required  
✅ **Session-based** storage  
✅ **Easy persona switching** for showcasing  
✅ **Perfect for prototyping** and internal demos  

### Production Mode

✅ **Adobe Commerce Auth Dropin** integration  
✅ **Real user authentication** with credentials  
✅ **Persona mapped** from account attributes  
✅ **ACO catalog views** assigned automatically  
✅ **Production-ready security**  

### Migration Path

✅ **Designed for easy swap** - Same APIs, different backends  
✅ **No block changes** needed for auth integration  
✅ **Add custom attributes** to Commerce customer accounts  
✅ **Configure ACO** catalog view assignments  
✅ **Deploy** - Everything works!  

---

## Related Documents

- `DROPIN-ARCHITECTURE.md` - Auth dropin details
- `DROPIN-INTEGRATION-GUIDE.md` - Dropin integration steps
- `MOCK-ACO-API-SPEC.md` - Catalog view assignment
- `PERSONA-IMPLEMENTATION-PLAN.md` - Persona definitions

---

**Last Updated**: November 15, 2024  
**Status**: Authentication strategy defined for demo and production modes

