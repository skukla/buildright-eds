# Phase 5: Existing Page Refactor

## Overview

**Duration**: 2-3 weeks  
**Dependencies**: Phase 3 (architecture), Phase 4 (shared components)  
**Status**: Not Started

Audit and refactor existing pages to support persona-aware experiences, remove deprecated patterns (kit mode), integrate with auth system, and replace all emoji icons with custom SVG icons.

---

## Objectives

1. Complete comprehensive page audit
2. Refactor login page with persona selection
3. Update account/dashboard page for persona routing
4. Refactor catalog page (remove kit mode, add CCDM filtering)
5. Refactor product detail page (customer group pricing)
6. Refactor cart page (integrate with mock commerce)
7. Remove all emoji icons
8. Ensure all pages work with persona system

---

## Task 1: Page Audit

### 1.1 Create Page Audit Document

**File**: `docs/PAGE-AUDIT-CHECKLIST.md`

For each existing page, document:
- Current components and their purpose
- Persona-specific requirements
- Block vs. Dropin decisions
- Required updates
- Emoji removal tasks
- Testing checklist

**Pages to Audit**:
1. `index.html` - Home page
2. `pages/login.html` - Login page
3. `pages/account.html` - Account/dashboard page
4. `pages/catalog.html` - Category/product listing
5. `pages/product-detail.html` - Product detail page
6. `pages/cart.html` - Shopping cart
7. `pages/order-history.html` - Order history

### 1.2 Audit Template

**File**: `docs/PAGE-AUDIT-CHECKLIST.md`

```markdown
# Page Audit Checklist

## 1. Home Page (`index.html`)

### Current State
- [ ] Hero section with static content
- [ ] Featured categories
- [ ] Product highlights
- [ ] Generic CTAs

### Persona Requirements
- [ ] Persona-aware CTAs (route to correct dashboard)
- [ ] Show relevant categories per customer group
- [ ] Display appropriate messaging per role

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Hero Banner | Static HTML | EDS Block | Convert to block, add persona logic |
| Category Grid | Static HTML | EDS Block | Make persona-aware |
| CTA Buttons | Hardcoded | Dynamic | Route based on auth context |

### Updates Required
- [ ] Integrate with auth service
- [ ] Add persona detection
- [ ] Update CTAs to route to persona-specific pages
- [ ] Remove any emoji icons
- [ ] Ensure responsive design

### Testing
- [ ] Test with each persona
- [ ] Verify CTAs route correctly
- [ ] Check unauthenticated state
- [ ] Mobile responsive

---

## 2. Login Page (`pages/login.html`)

### Current State
- [ ] Basic login form
- [ ] Email/password fields
- [ ] Submit button

### Persona Requirements
- [ ] Demo mode: Persona selection cards
- [ ] Production mode: Standard login form
- [ ] Clear mode toggle for demos

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Login Form | Standard | Dual-mode | Add persona selection for demo |
| Auth Integration | None | Auth Service | Integrate with auth.js |

### Updates Required
- [ ] Create persona selection cards (demo mode)
- [ ] Add persona avatars
- [ ] Integrate with auth service
- [ ] Add mode toggle (hidden, for demos)
- [ ] Style persona cards professionally
- [ ] Use custom icons for personas

### Testing
- [ ] Test login with each persona
- [ ] Verify redirect to correct dashboard
- [ ] Test production login flow (mocked)
- [ ] Check error handling

---

## 3. Account/Dashboard Page (`pages/account.html`)

### Current State
- [ ] Generic account page
- [ ] Order history link
- [ ] Profile information

### Persona Requirements
- [ ] Route to persona-specific dashboard
- [ ] Show persona-relevant features only
- [ ] Display customer group information

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Account Nav | Generic | Persona-aware | Filter by available features |
| Dashboard Content | Static | Dynamic Router | Use dashboard.js router |

### Updates Required
- [ ] Integrate dashboard router from Phase 3
- [ ] Add persona context to navigation
- [ ] Show/hide features based on persona
- [ ] Display customer group pricing info
- [ ] Remove emojis from UI

### Testing
- [ ] Test with each persona
- [ ] Verify correct dashboard loads
- [ ] Check feature visibility
- [ ] Test navigation

---

## 4. Catalog Page (`pages/catalog.html`)

### Current State
- [ ] Product grid
- [ ] Filters sidebar
- [ ] Kit mode sidebar (DEPRECATED)
- [ ] Sort controls

### Persona Requirements
- [ ] Customer-group-specific pricing
- [ ] CCDM filtering based on persona context
- [ ] No kit mode

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Product Grid | Static | EDS Block | Convert to product-grid block |
| Filters | HTML | EDS Block | Convert to filters-sidebar block |
| Kit Sidebar | Deprecated | REMOVE | Delete kit-sidebar block |
| Products | Hardcoded | Mock ACO API | Fetch from acoService |

### Updates Required
- [ ] Remove kit mode completely
- [ ] Remove kit-sidebar block
- [ ] Remove kit-mode-banner.js
- [ ] Integrate with mock ACO service
- [ ] Add CCDM filtering
- [ ] Display customer-group pricing
- [ ] Update product tiles to use product-tile block
- [ ] Replace emoji icons with custom icons
- [ ] Add loading states for CCDM queries

### Testing
- [ ] Test with each customer group
- [ ] Verify pricing displays correctly
- [ ] Test CCDM filtering
- [ ] Verify no kit mode remnants
- [ ] Check loading states

---

## 5. Product Detail Page (`pages/product-detail.html`)

### Current State
- [ ] Product information
- [ ] Image gallery
- [ ] Add to cart button
- [ ] Hardcoded pricing

### Persona Requirements
- [ ] Customer-group-specific pricing
- [ ] Volume tier pricing display
- [ ] Persona-relevant recommendations
- [ ] Inventory status with icons

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Product Info | Static HTML | EDS Block or Dropin | Decide based on Phase 0 research |
| Pricing | Hardcoded | Dynamic | Fetch from acoService |
| Inventory | Text only | Icon + Text | Use custom inventory icons |
| Recommendations | Static | CCDM-driven | Based on persona policies |

### Updates Required
- [ ] Integrate with mock ACO for pricing
- [ ] Display volume tiers
- [ ] Show customer group discount
- [ ] Update inventory display with icons
- [ ] CCDM-based recommendations
- [ ] Remove emojis

### Testing
- [ ] Test with each customer group
- [ ] Verify pricing calculation
- [ ] Test volume tier display
- [ ] Check recommendations
- [ ] Test add to cart

---

## 6. Cart Page (`pages/cart.html`)

### Current State
- [ ] Cart items list
- [ ] Quantity controls
- [ ] Subtotal calculation
- [ ] Checkout button

### Persona Requirements
- [ ] Customer-group pricing in cart
- [ ] Volume discounts reflected
- [ ] Phase/project context (B2B personas)

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Cart Items | Static HTML | EDS Block or Cart Dropin | Integrate with cart system |
| Pricing | Hardcoded | Dynamic | Real-time pricing from ACO |
| Cart State | Local | Cart Manager | Use cart-manager.js |

### Updates Required
- [ ] Integrate with cart-manager.js
- [ ] Display customer-group pricing
- [ ] Show volume discounts
- [ ] Add phase/project context for B2B
- [ ] Update inventory icons
- [ ] Remove emojis

### Testing
- [ ] Test with each customer group
- [ ] Verify pricing updates
- [ ] Test quantity changes
- [ ] Check volume discount calculation
- [ ] Test checkout flow

---

## 7. Order History Page (`pages/order-history.html`)

### Current State
- [ ] Order list
- [ ] Order details
- [ ] Reorder button

### Persona Requirements
- [ ] Persona-specific order views
- [ ] Template/project context (for Sarah/Marcus)
- [ ] Enhanced reorder (repeat BOM)

### Components
| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Order List | Static | Dynamic | Fetch from user context |
| Reorder | Simple | Context-aware | Link to template/project |

### Updates Required
- [ ] Add persona context to orders
- [ ] Enhanced reorder for templates
- [ ] Project reference for Marcus orders
- [ ] Replace emoji icons

### Testing
- [ ] Test with each persona
- [ ] Verify order display
- [ ] Test reorder functionality
- [ ] Check context preservation

---

## Summary

### High Priority Updates
1. Login page - Persona selection (critical path)
2. Account/dashboard - Routing (critical path)
3. Catalog - Remove kit mode, add CCDM
4. Product detail - Customer group pricing

### Medium Priority Updates
1. Cart - Integrate cart manager
2. Order history - Enhanced reorder
3. Home page - Persona-aware CTAs

### Low Priority Updates
1. Static content pages
2. Footer updates
3. Header enhancements

### Emoji Removal Checklist
- [ ] Search all HTML files for emoji characters
- [ ] Search all JS files for emoji characters
- [ ] Replace with custom SVG icons
- [ ] Update any emoji in data files
- [ ] Remove emoji from CSS content properties

---

**Document Version**: 1.0  
**Created**: November 15, 2024
```

**Deliverable**: Complete page audit document

---

## Task 2: Authentication Pages

This task covers both the quick persona selector (for rapid demos) and the guided sign-up wizard (for realistic onboarding demos).

---

### 2.1 Create Sign-Up Wizard (Guided Onboarding) ⭐ **RECOMMENDED FOR DEMOS**

**Purpose**: Demonstrate realistic customer onboarding that collects business attributes and determines persona assignment.

**File**: `pages/signup-demo.html`

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

**Deliverable**: Sign-up wizard page

---

### 2.2 Create Sign-Up Wizard Script

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

**Deliverable**: Sign-up wizard script with persona determination logic

---

### 2.3 Update Auth.js with Helper Functions

**File**: `scripts/auth.js` (add these helper functions)

```javascript
/**
 * Determine persona from business attributes
 * This is the core logic that maps business profile to persona
 */
export function determinePersonaFromAttributes(attributes) {
  const {
    business_type,
    project_scale,
    primary_service,
    buying_behavior
  } = attributes;
  
  // Sarah (Production Builder): High-volume residential with template ordering
  if (
    business_type === 'Residential Builder' &&
    project_scale === 'High Volume' &&
    buying_behavior === 'Template/Repeat Orders'
  ) {
    return 'sarah';
  }
  
  // Marcus (Commercial PM): Commercial contractor with custom project planning
  if (
    business_type === 'Commercial Contractor' ||
    (project_scale === 'Medium Volume' && buying_behavior === 'Custom Project Planning')
  ) {
    return 'marcus';
  }
  
  // Lisa (Luxury Builder): Low-volume residential with package deals
  if (
    business_type === 'Residential Builder' &&
    project_scale === 'Low Volume' &&
    buying_behavior === 'Package Deals'
  ) {
    return 'lisa';
  }
  
  // David (Deck Specialist): Specialty contractor or DIY with outdoor focus
  if (
    business_type === 'Specialty Contractor' ||
    (primary_service === 'Specialty Work (Decks, Outdoor)' && buying_behavior === 'DIY with Guidance')
  ) {
    return 'david';
  }
  
  // Kevin (Facilities Manager): Facilities management with restock focus
  if (
    business_type === 'Facilities Management Company' ||
    (project_scale === 'Maintenance/Restock' && buying_behavior === 'Quick Restock')
  ) {
    return 'kevin';
  }
  
  // Default fallback: Marcus (most versatile experience)
  return 'marcus';
}

/**
 * Get realistic business profile for a given persona
 * Used for demo mode persona selector
 */
export function getBusinessProfileForPersona(personaId) {
  const profiles = {
    'sarah': {
      business_type: 'Residential Builder',
      project_scale: 'High Volume',
      primary_service: 'New Construction',
      buying_behavior: 'Template/Repeat Orders',
      customer_tier: 'Premium',
      company_name: 'Mitchell Homes',
      years_in_business: 12,
      annual_projects: 25
    },
    'marcus': {
      business_type: 'Commercial Contractor',
      project_scale: 'Medium Volume',
      primary_service: 'Multi-Service',
      buying_behavior: 'Custom Project Planning',
      customer_tier: 'Premium',
      company_name: 'Chen Construction Group',
      years_in_business: 8,
      annual_projects: 12
    },
    'lisa': {
      business_type: 'Residential Builder',
      project_scale: 'Low Volume',
      primary_service: 'New Construction',
      buying_behavior: 'Package Deals',
      customer_tier: 'Premium Plus',
      company_name: 'Rodriguez Luxury Homes',
      years_in_business: 15,
      annual_projects: 6
    },
    'david': {
      business_type: 'Specialty Contractor',
      project_scale: 'Medium Volume',
      primary_service: 'Specialty Work (Decks, Outdoor)',
      buying_behavior: 'DIY with Guidance',
      customer_tier: 'Standard',
      company_name: 'Thompson Outdoor Living',
      years_in_business: 5,
      annual_projects: 18
    },
    'kevin': {
      business_type: 'Facilities Management Company',
      project_scale: 'Maintenance/Restock',
      primary_service: 'Maintenance/Repairs',
      buying_behavior: 'Quick Restock',
      customer_tier: 'Basic',
      company_name: 'Park Property Services',
      years_in_business: 10,
      properties_managed: 45
    }
  };
  
  return profiles[personaId];
}
```

**Deliverable**: Helper functions added to auth.js

---

### 2.4 Sign-Up Wizard Styles

**File**: `styles/signup-wizard.css` (new file)

```css
/* Sign-Up Wizard Styles */
.signup-container {
  max-width: 800px;
  margin: var(--spacing-xxlarge) auto;
  padding: var(--spacing-large);
}

.signup-header {
  text-align: center;
  margin-bottom: var(--spacing-xlarge);
}

.signup-header h1 {
  font-size: var(--type-heading-1-font-size);
  font-weight: var(--type-heading-1-font-weight);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-small);
}

.signup-header p {
  font-size: var(--type-body-1-font-size);
  color: var(--color-neutral-600);
}

/* Wizard Steps */
.signup-wizard {
  background: white;
  border-radius: var(--shape-border-radius-3);
  box-shadow: var(--shape-shadow-2);
  padding: var(--spacing-xlarge);
  margin-bottom: var(--spacing-large);
}

.signup-step {
  animation: fadeIn 0.3s ease;
}

.signup-step h2 {
  font-size: var(--type-heading-3-font-size);
  font-weight: var(--type-heading-3-font-weight);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-medium);
}

.signup-step label {
  display: block;
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-neutral-700);
  margin: var(--spacing-medium) 0 var(--spacing-small);
}

.signup-step input,
.signup-step select {
  width: 100%;
  padding: var(--spacing-small) var(--spacing-medium);
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--shape-border-radius-2);
  font-size: var(--type-body-1-font-size);
  transition: border-color 0.2s ease;
}

.signup-step input:focus,
.signup-step select:focus {
  outline: none;
  border-color: var(--color-brand-500);
}

.signup-step input.error,
.signup-step select.error {
  border-color: var(--color-error-500);
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-medium);
}

/* Button Group */
.button-group {
  display: flex;
  gap: var(--spacing-medium);
  margin-top: var(--spacing-xlarge);
}

.back-btn,
.next-btn,
.submit-btn {
  flex: 1;
  padding: var(--spacing-medium) var(--spacing-large);
  border: none;
  border-radius: var(--shape-border-radius-2);
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn {
  background: var(--color-neutral-200);
  color: var(--color-neutral-700);
}

.back-btn:hover {
  background: var(--color-neutral-300);
}

.next-btn,
.submit-btn {
  background: var(--color-brand-500);
  color: white;
}

.next-btn:hover,
.submit-btn:hover {
  background: var(--color-brand-600);
  transform: translateY(-2px);
  box-shadow: var(--shape-shadow-2);
}

.next-btn:disabled,
.submit-btn:disabled {
  background: var(--color-neutral-300);
  cursor: not-allowed;
  transform: none;
}

/* Experience Preview */
.experience-preview {
  margin: var(--spacing-large) 0;
}

.preview-card {
  background: var(--color-neutral-50);
  border: 2px solid var(--color-brand-200);
  border-radius: var(--shape-border-radius-3);
  padding: var(--spacing-large);
}

.preview-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: var(--spacing-medium);
}

.preview-title {
  font-size: var(--type-heading-3-font-size);
  font-weight: var(--type-heading-3-font-weight);
  color: var(--color-brand-700);
  margin-bottom: var(--spacing-small);
  text-align: center;
}

.preview-description {
  font-size: var(--type-body-1-font-size);
  color: var(--color-neutral-700);
  text-align: center;
  margin-bottom: var(--spacing-large);
}

.preview-features h4 {
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-small);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-medium);
}

.feature-list li {
  padding: var(--spacing-small) 0;
  color: var(--color-neutral-700);
}

.preview-catalog {
  padding-top: var(--spacing-medium);
  border-top: 1px solid var(--color-neutral-200);
  text-align: center;
  color: var(--color-neutral-600);
}

.product-count {
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-brand-600);
}

/* Terms Acceptance */
.terms-acceptance {
  margin-top: var(--spacing-large);
  padding: var(--spacing-medium);
  background: var(--color-neutral-50);
  border-radius: var(--shape-border-radius-2);
}

.terms-acceptance label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-small);
  font-weight: normal;
  cursor: pointer;
}

.terms-acceptance input[type="checkbox"] {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

/* Progress Bar */
.progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  background: white;
  border-radius: var(--shape-border-radius-2);
  box-shadow: var(--shape-shadow-1);
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--color-neutral-300);
  z-index: -1;
}

.progress-step.completed::after {
  background: var(--color-brand-500);
}

.step-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-neutral-300);
  color: var(--color-neutral-600);
  border-radius: 50%;
  font-weight: var(--type-body-1-strong-font-weight);
  margin-bottom: var(--spacing-small);
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--color-brand-500);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: var(--color-brand-500);
  color: white;
}

.step-label {
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
}

.progress-step.active .step-label {
  color: var(--color-brand-600);
  font-weight: var(--type-body-1-strong-font-weight);
}

/* Footer */
.signup-footer {
  text-align: center;
  color: var(--color-neutral-600);
  font-size: var(--type-body-2-font-size);
}

.signup-footer p {
  margin: var(--spacing-small) 0;
}

.demo-notice {
  padding: var(--spacing-small) var(--spacing-medium);
  background: var(--color-info-50);
  color: var(--color-info-700);
  border-radius: var(--shape-border-radius-2);
  display: inline-block;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: var(--spacing-xxlarge);
}

.success-icon {
  font-size: 72px;
  color: var(--color-success-500);
  margin-bottom: var(--spacing-large);
}

.success-message h2 {
  font-size: var(--type-heading-2-font-size);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-medium);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
  margin: var(--spacing-large) auto;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .signup-container {
    padding: var(--spacing-medium);
  }
  
  .signup-wizard {
    padding: var(--spacing-large);
  }
  
  .name-fields {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .progress-bar {
    flex-wrap: wrap;
  }
  
  .progress-step {
    margin: var(--spacing-small);
  }
  
  .progress-step:not(:last-child)::after {
    display: none;
  }
}
```

**Deliverable**: Sign-up wizard styles

---

### 2.5 Update Styles Import

**File**: `styles/styles.css`

Add import for signup wizard styles:

```css
/* Existing imports */
@import './base.css';
@import './components.css';
@import './utilities.css';
@import './page-specific.css';

/* Add this */
@import './signup-wizard.css';
```

---

### 2.6 Update Login Page (Quick Persona Selector)

**Purpose**: Provide a fast entry point for quick demos where you just click a persona card.

**File**: `pages/login.html`

**File**: `scripts/login.js`

```javascript
/**
 * Login Page Script
 * Handles both demo (persona selection) and production (standard login) modes
 */

import { authService } from './auth.js';
import { getAllPersonas } from './persona-config.js';
import { createIcon } from './icon-helper.js';

class LoginPage {
  constructor() {
    this.isDemo = true; // Set based on environment
  }
  
  async initialize() {
    // Check if already authenticated
    await authService.initialize();
    
    if (authService.isAuthenticated()) {
      this.redirectToDashboard();
      return;
    }
    
    if (this.isDemo) {
      this.renderPersonaSelection();
    } else {
      this.renderStandardLogin();
    }
  }
  
  renderPersonaSelection() {
    const container = document.querySelector('.persona-grid');
    const personas = getAllPersonas();
    
    personas.forEach(persona => {
      const card = this.createPersonaCard(persona);
      container.appendChild(card);
    });
  }
  
  createPersonaCard(persona) {
    const card = document.createElement('div');
    card.className = 'persona-card';
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'persona-avatar';
    const img = document.createElement('img');
    img.src = persona.avatar || '/images/avatars/default.jpg';
    img.alt = persona.name;
    avatar.appendChild(img);
    
    // Content
    const content = document.createElement('div');
    content.className = 'persona-content';
    
    const name = document.createElement('h3');
    name.className = 'persona-name';
    name.textContent = persona.name;
    
    const role = document.createElement('p');
    role.className = 'persona-role';
    role.textContent = persona.role;
    
    const company = document.createElement('p');
    company.className = 'persona-company';
    company.textContent = persona.company || 'Individual';
    
    content.appendChild(name);
    content.appendChild(role);
    content.appendChild(company);
    
    card.appendChild(avatar);
    card.appendChild(content);
    
    // Click handler
    card.addEventListener('click', async () => {
      card.classList.add('loading');
      
      try {
        await authService.loginWithPersona(persona.id);
        this.redirectToDashboard();
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
        card.classList.remove('loading');
      }
    });
    
    return card;
  }
  
  renderStandardLogin() {
    document.getElementById('demo-login').style.display = 'none';
    document.getElementById('production-login').style.display = 'block';
    
    const form = document.querySelector('.login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.email.value;
      const password = form.password.value;
      
      try {
        await authService.login({ email, password });
        this.redirectToDashboard();
      } catch (error) {
        console.error('Login failed:', error);
        alert('Invalid credentials. Please try again.');
      }
    });
  }
  
  redirectToDashboard() {
    const user = authService.getCurrentUser();
    const defaultRoute = user.persona?.defaultRoute || '/pages/dashboard.html';
    window.location.href = defaultRoute;
  }
}

// Initialize on page load
const loginPage = new LoginPage();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loginPage.initialize());
} else {
  loginPage.initialize();
}
```

**Deliverable**: Login page script

---

### 2.3 Login Page Styles

**File**: `styles/page-specific.css` (add to existing file)

```css
/* Login Page */
.login-page {
  background: var(--color-neutral-50);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-header {
  background: white;
  padding: var(--spacing-medium) 0;
  box-shadow: var(--shape-shadow-1);
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  padding: var(--spacing-xxlarge) 0;
}

.login-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.login-content h1 {
  font-size: var(--type-heading-1-font-size);
  font-weight: var(--type-heading-1-font-weight);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-medium);
}

.login-subtitle {
  font-size: var(--type-body-1-font-size);
  color: var(--color-neutral-600);
  margin-bottom: var(--spacing-xlarge);
}

/* Persona Selection */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-large);
  max-width: 1200px;
  margin: 0 auto;
}

.persona-card {
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--shape-border-radius-3);
  padding: var(--spacing-large);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.persona-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-brand-500);
  box-shadow: var(--shape-shadow-3);
}

.persona-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.persona-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-medium);
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.persona-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.persona-name {
  font-size: var(--type-heading-4-font-size);
  font-weight: var(--type-heading-4-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-small);
}

.persona-role {
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-brand-600);
  margin: 0 0 0.25rem;
}

.persona-company {
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
  margin: 0;
}

/* Standard Login Form */
.standard-login {
  max-width: 400px;
  margin: 0 auto;
}

.login-form {
  background: white;
  padding: var(--spacing-xlarge);
  border-radius: var(--shape-border-radius-3);
  box-shadow: var(--shape-shadow-2);
}

.login-footer {
  background: white;
  padding: var(--spacing-medium) 0;
  border-top: 1px solid var(--color-neutral-200);
  text-align: center;
  color: var(--color-neutral-600);
  font-size: var(--type-body-2-font-size);
}

@media (max-width: 768px) {
  .persona-grid {
    grid-template-columns: 1fr;
  }
}
```

**Deliverable**: Login page styles

---

## Task 3: Catalog Page Refactor

### 3.1 Remove Kit Mode

**Files to Delete**:
- `blocks/kit-sidebar/` (entire directory)
- `scripts/kit-mode-banner.js`
- `scripts/kit-sidebar.js`

**Files to Update**:
- `pages/catalog.html` - Remove kit sidebar references
- `scripts/app.js` - Remove kit mode initialization
- Any other files referencing kit mode

**Search and Remove**:
```bash
# Find all references to kit mode
grep -r "kit-mode" --include="*.html" --include="*.js" --include="*.css"
grep -r "kit-sidebar" --include="*.html" --include="*.js" --include="*.css"
grep -r "kitMode" --include="*.js"
```

**Deliverable**: Kit mode completely removed

---

### 3.2 Update Catalog Page

**File**: `pages/catalog.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catalog - BuildRight</title>
  <link rel="stylesheet" href="/styles/styles.css">
  <script type="module" src="/scripts/catalog.js"></script>
</head>
<body>
  <!-- Header -->
  <div class="header-block" data-block-name="header"></div>
  
  <main class="catalog-page">
    <div class="container">
      <div class="catalog-layout">
        <!-- Filters Sidebar -->
        <aside class="catalog-sidebar">
          <div class="filters-sidebar" data-block-name="filters-sidebar"></div>
        </aside>
        
        <!-- Product Grid -->
        <div class="catalog-main">
          <!-- Breadcrumbs -->
          <nav class="breadcrumbs">
            <a href="/">Home</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">Catalog</span>
          </nav>
          
          <!-- Category Header -->
          <div class="catalog-header">
            <h1 id="category-title">Products</h1>
            <div class="catalog-controls">
              <div class="catalog-view-toggle">
                <!-- View toggle buttons -->
              </div>
              <div class="catalog-sort">
                <select id="sort-select">
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- CCDM Loading State -->
          <div class="loading-overlay" data-block-name="loading-overlay"></div>
          
          <!-- Product Grid -->
          <div class="product-grid" data-block-name="product-grid">
            <!-- Products loaded by catalog.js -->
          </div>
          
          <!-- Pagination -->
          <div class="catalog-pagination">
            <!-- Pagination controls -->
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <!-- Footer -->
  <div class="footer-block" data-block-name="footer"></div>
</body>
</html>
```

**Deliverable**: Updated catalog.html without kit mode

---

### 3.3 Create Catalog Script

**File**: `scripts/catalog.js`

```javascript
/**
 * Catalog Page Script
 * Integrates with mock ACO service for CCDM filtering
 */

import { authService } from './auth.js';
import { acoService } from './aco-service.js';
import { showLoading, hideLoading } from '../blocks/loading-overlay/loading-overlay.js';
import { decorateBlocks } from './scripts.js';

class CatalogPage {
  constructor() {
    this.products = [];
    this.filters = {};
    this.sortBy = 'relevance';
    this.currentPage = 1;
    this.pageSize = 24;
  }
  
  async initialize() {
    // Require authentication
    if (!authService.requireAuth()) return;
    
    await authService.initialize();
    
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.category = urlParams.get('category');
    this.policy = urlParams.get('policy'); // For CCDM filtering
    
    // Load products
    await this.loadProducts();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Decorate blocks
    decorateBlocks(document.body);
  }
  
  async loadProducts() {
    showLoading(
      'Finding products for you...',
      this.policy ? 'Applying smart catalog filtering' : ''
    );
    
    try {
      const userContext = await acoService.getUserContext(
        authService.getCurrentUser().id
      );
      
      const result = await acoService.getProducts({
        filters: this.filters,
        userContext,
        policy: this.policy,
        limit: this.pageSize,
        offset: (this.currentPage - 1) * this.pageSize
      });
      
      this.products = result.products;
      this.totalCount = result.totalCount;
      this.facets = result.facets;
      
      this.render();
      
    } catch (error) {
      console.error('Error loading products:', error);
      this.renderError(error.message);
    } finally {
      hideLoading();
    }
  }
  
  render() {
    // Update category title
    const titleEl = document.getElementById('category-title');
    if (titleEl) {
      titleEl.textContent = this.category || 'All Products';
    }
    
    // Render products
    this.renderProducts();
    
    // Render filters
    this.renderFilters();
    
    // Render pagination
    this.renderPagination();
  }
  
  renderProducts() {
    const grid = document.querySelector('.product-grid');
    grid.innerHTML = '';
    
    if (this.products.length === 0) {
      grid.innerHTML = '<div class="empty-state">No products found</div>';
      return;
    }
    
    this.products.forEach(product => {
      const tile = this.createProductTile(product);
      grid.appendChild(tile);
    });
  }
  
  createProductTile(product) {
    // Use product-tile block from Phase 4
    const tile = document.createElement('div');
    tile.className = 'product-tile';
    tile.dataset.blockName = 'product-tile';
    
    // Tile will be decorated by block system
    // Set data after decoration
    
    return tile;
  }
  
  renderFilters() {
    // Render filters based on facets
    // Integrate with filters-sidebar block
  }
  
  renderPagination() {
    // Render pagination controls
  }
  
  setupEventListeners() {
    // Sort change
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.loadProducts();
      });
    }
    
    // Filter changes
    window.addEventListener('filter:change', (e) => {
      this.filters = e.detail.filters;
      this.currentPage = 1;
      this.loadProducts();
    });
  }
  
  renderError(message) {
    const grid = document.querySelector('.product-grid');
    grid.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Products</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          Retry
        </button>
      </div>
    `;
  }
}

// Initialize
const catalogPage = new CatalogPage();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => catalogPage.initialize());
} else {
  catalogPage.initialize();
}
```

**Deliverable**: Catalog script with CCDM integration

---

## Task 4: Product Detail Page Refactor

### 4.1 Update Product Detail Page

**File**: `pages/product-detail.html`

Update to fetch pricing from mock ACO service based on customer group.

**File**: `scripts/product-detail.js` (create or update)

```javascript
/**
 * Product Detail Page Script
 * Display customer-group-specific pricing
 */

import { authService } from './auth.js';
import { acoService } from './aco-service.js';
import { createIcon } from './icon-helper.js';

class ProductDetailPage {
  constructor() {
    this.product = null;
    this.pricing = null;
  }
  
  async initialize() {
    if (!authService.requireAuth()) return;
    
    await authService.initialize();
    
    // Get product SKU from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.sku = urlParams.get('sku');
    
    if (!this.sku) {
      this.renderError('No product specified');
      return;
    }
    
    await this.loadProduct();
  }
  
  async loadProduct() {
    try {
      // Get product data
      const result = await acoService.getProducts({
        filters: { sku: this.sku },
        limit: 1
      });
      
      if (result.products.length === 0) {
        this.renderError('Product not found');
        return;
      }
      
      this.product = result.products[0];
      
      // Get pricing
      const customerGroup = authService.getCustomerGroup();
      const pricingResult = await acoService.getPricing({
        productIds: [this.sku],
        customerGroup,
        quantity: 1
      });
      
      this.pricing = pricingResult.pricing[this.sku];
      
      this.render();
      
    } catch (error) {
      console.error('Error loading product:', error);
      this.renderError(error.message);
    }
  }
  
  render() {
    // Update product information
    this.renderProductInfo();
    this.renderPricing();
    this.renderInventory();
  }
  
  renderProductInfo() {
    // Update product name, description, images
  }
  
  renderPricing() {
    // Display pricing with volume tiers
    const priceContainer = document.getElementById('product-price');
    if (!priceContainer || !this.pricing) return;
    
    priceContainer.innerHTML = `
      <div class="product-price-main">
        <span class="price-label">Your Price:</span>
        <span class="price-value">$${this.pricing.unitPrice.toFixed(2)}</span>
      </div>
      ${this.pricing.basePrice !== this.pricing.unitPrice ? `
        <div class="product-price-savings">
          <span class="price-original">List: $${this.pricing.basePrice.toFixed(2)}</span>
          <span class="price-discount">
            Save ${(((this.pricing.basePrice - this.pricing.unitPrice) / this.pricing.basePrice) * 100).toFixed(0)}%
          </span>
        </div>
      ` : ''}
      <div class="product-price-group">
        <span class="price-group-label">
          ${this.pricing.customerGroup} pricing
        </span>
      </div>
    `;
  }
  
  renderInventory() {
    // Display inventory status with custom icons
    const inventoryContainer = document.getElementById('product-inventory');
    if (!inventoryContainer) return;
    
    const { inStock } = this.product;
    
    let iconName, statusText, statusClass;
    if (!inStock || inStock === 0) {
      iconName = 'inventory-error';
      statusText = 'Out of Stock';
      statusClass = 'out-of-stock';
    } else if (inStock < 10) {
      iconName = 'inventory-warning';
      statusText = `Only ${inStock} left in stock`;
      statusClass = 'low-stock';
    } else {
      iconName = 'inventory-check';
      statusText = 'In Stock';
      statusClass = 'in-stock';
    }
    
    const icon = createIcon('commerce', iconName, 'medium');
    inventoryContainer.innerHTML = '';
    inventoryContainer.className = `product-inventory ${statusClass}`;
    inventoryContainer.appendChild(icon);
    
    const text = document.createElement('span');
    text.textContent = statusText;
    inventoryContainer.appendChild(text);
  }
  
  renderError(message) {
    document.querySelector('.product-detail-main').innerHTML = `
      <div class="error-state">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/pages/catalog.html" class="btn btn-primary">Back to Catalog</a>
      </div>
    `;
  }
}

// Initialize
const pdp = new ProductDetailPage();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => pdp.initialize());
} else {
  pdp.initialize();
}
```

**Deliverable**: Updated PDP with customer group pricing

---

## Task 5: Remove All Emojis

### 5.1 Search and Replace Emojis

**Script**: Run emoji detection script from Phase 2

```bash
node scripts/replace-emojis.js
```

**Manual Replacement**:
- Review each file flagged by script
- Replace emoji with appropriate custom SVG icon
- Update HTML/JS to use icon helper
- Test visual appearance

**Files to Check**:
- All `.html` files
- All `.js` files in `scripts/` and `blocks/`
- Data files (`.json`)
- CSS content properties

**Deliverable**: No emojis remaining in codebase

---

## Success Criteria

✅ Page audit document completed  
✅ Login page refactored with persona selection  
✅ Account page routes to persona dashboards  
✅ Catalog page integrated with mock ACO service  
✅ Catalog page has CCDM filtering  
✅ Kit mode completely removed  
✅ PDP displays customer-group pricing  
✅ Cart integrates with cart manager  
✅ All emojis replaced with custom icons  
✅ All pages work with auth system  
✅ All pages tested with each persona

---

## Testing/Validation

### Per-Page Testing
- [ ] Test with each of 5 personas
- [ ] Verify customer-group pricing displays
- [ ] Test CCDM filtering where applicable
- [ ] Verify no kit mode remnants
- [ ] Check no emojis remain

### Integration Testing
- [ ] Login → Dashboard flow
- [ ] Catalog → PDP → Cart flow
- [ ] Auth persistence across pages
- [ ] Customer group context maintained

### Visual Testing
- [ ] All custom icons display correctly
- [ ] Responsive design works
- [ ] Design system compliance
- [ ] Loading states appear correctly

### Regression Testing
- [ ] Existing functionality still works
- [ ] No broken links
- [ ] No console errors
- [ ] Performance acceptable

---

## Deliverables Checklist

### Documentation
- [ ] `docs/PAGE-AUDIT-CHECKLIST.md`

### Updated Pages
- [ ] `pages/login.html`
- [ ] `pages/catalog.html`
- [ ] `pages/product-detail.html`
- [ ] `pages/cart.html`
- [ ] `pages/account.html`
- [ ] `pages/order-history.html`
- [ ] `index.html`

### Updated Scripts
- [ ] `scripts/login.js`
- [ ] `scripts/catalog.js`
- [ ] `scripts/product-detail.js`
- [ ] `scripts/cart.js`

### Deleted Files
- [ ] `blocks/kit-sidebar/` (entire directory)
- [ ] `scripts/kit-mode-banner.js`
- [ ] `scripts/kit-sidebar.js`

### Updated Styles
- [ ] Login page styles added to `styles/page-specific.css`
- [ ] Catalog updates
- [ ] Remove kit mode styles

---

## Next Steps

Upon completion of Phase 5:
1. **Phase 6A-6E**: Build persona-specific dashboards and builders
2. Use refactored pages as foundation
3. Test persona flows end-to-end

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `PHASE-3-CORE-ARCHITECTURE.md` - Auth and ACO service
- `PHASE-4-SHARED-COMPONENTS.md` - Shared blocks

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

