# BuildRight Persona-Based Implementation Plan

## Overview

Transform the BuildRight EDS prototype into a comprehensive, persona-driven experience that demonstrates Adobe Commerce Optimizer's CCDM capabilities. The implementation will support 5 distinct personas with unique user journeys, shared UI components following the existing design system, and a demo-ready authentication system.

**CRITICAL:** All file names, block names, and URLs are persona-agnostic. Persona-specific behavior is determined by user context stored in localStorage.

---

## Phase 1: ACO Data Generation Updates (buildright-aco repository)

### 1.1 Create New Branch

```bash
cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco
git checkout -b persona-enhancements
```

### 1.2 Update Product Definitions

**File:** `scripts/config/product-definitions.js`

Add new product attributes to support all persona flows:

```javascript
// Add to each product definition:
{
  construction_phase: ['foundation_framing', 'envelope', 'interior_finish'],
  quality_tier: 'professional', // builder_grade | professional | premium
  package_tier: ['good', 'better', 'best'], // for Lisa's packages
  room_category: 'fixtures', // fixtures | surfaces | finishes
  deck_compatible: true,
  deck_shape: ['rectangular', 'l_shaped'],
  store_velocity_category: 'fastener', // for Kevin's restock logic
  recommended_restock_quantity: 15,
  typical_days_supply: 14
}
```

### 1.3 Update Price Book Configuration

**File:** `scripts/config/product-definitions.js` (pricing section)

Ensure all 6 customer groups have pricing:

```javascript
pricing: {
  base: 34.48,
  commercial_tier1: { '1-99': 33.45, '100-293': 32.76, '294+': 32.07 },
  commercial_tier2: { '1-99': 32.76, '100-293': 32.07, '294+': 31.03 },
  residential_builder: { '1-99': 34.48, '100-293': 33.45, '294+': 32.76 },
  pro_specialty: { '1-99': 34.48, '100-293': 33.79, '294+': 33.10 },
  retail_homeowner: 36.99,
  retail_chain_buyer: { '1-99': 30.50, '100-293': 29.80, '294+': 29.00 }
}
```

### 1.4 Create Triggered Policy Metadata

**New File:** `scripts/config/policy-definitions.js`

```javascript
/**
 * Define triggered policy configurations for CCDM demo
 */
export const POLICY_DEFINITIONS = {
  PROJECT_TYPE: {
    new_construction: {
      includes_categories: ['structural_materials', 'fasteners_hardware'],
      excludes_categories: ['paint', 'flooring']
    },
    remodel: {
      includes_categories: ['all'],
      excludes_categories: []
    }
  },
  CONSTRUCTION_PHASE: {
    foundation_framing: {
      attribute_filter: { construction_phase: 'foundation_framing' }
    },
    envelope: {
      attribute_filter: { construction_phase: 'envelope' }
    },
    interior_finish: {
      attribute_filter: { construction_phase: 'interior_finish' }
    }
  },
  QUALITY_TIER: {
    builder_grade: {
      attribute_filter: { quality_tier: 'builder_grade' }
    },
    professional: {
      attribute_filter: { quality_tier: 'professional' }
    },
    premium: {
      attribute_filter: { quality_tier: 'premium' }
    }
  },
  DECK_BUILDER: {
    rectangular: {
      attribute_filter: { deck_shape: 'rectangular' }
    },
    l_shaped: {
      attribute_filter: { deck_shape: 'l_shaped' }
    }
  },
  PACKAGE_TIER: {
    good: {
      attribute_filter: { package_tier: 'good' }
    },
    better: {
      attribute_filter: { package_tier: 'better' }
    },
    best: {
      attribute_filter: { package_tier: 'best' }
    }
  }
};
```

### 1.5 Generate Enhanced Data

```bash
# From buildright-aco directory
npm run generate:all
npm run validate:all
```

### 1.6 Update SETUP-GUIDE.md

**File:** `docs/SETUP-GUIDE.md`

Add new sections:

- **Phase 7: Persona Customer Groups** - Document the 6 customer groups and their tiers
- **Phase 8: Triggered Policies for Personas** - Document policies for each persona flow
- **Phase 9: Template BOMs for Production Builders** - Document saved templates
- **Phase 10: Package Definitions for Remodelers** - Document Good/Better/Best packages
- **Phase 11: Deck Builder Product Tagging** - Document deck-specific attributes

---

## Phase 2: Design System Compliance (buildright-eds repository)

All new UI components will use the existing design system from `styles/base.css` and `styles/components.css`.

### 2.1 Design System Tokens to Use

From `base.css`, we'll use:

**Colors:**
- `--color-brand-500` (sapphire blue) - Primary actions, headers
- `--color-accent-500` (tangerine orange) - High-priority CTAs, Project Builder
- `--color-positive-500` - Success states, in-stock
- `--color-warning-500` - Low stock warnings
- `--color-negative-500` - Out of stock, errors

**Typography:**
- `--type-display-1-font` - Hero titles (40px)
- `--type-headline-1-font` - Page titles (32px)
- `--type-headline-2-font` - Section headers (24px)
- `--type-body-1-default-font` - Normal text (16px)
- `--type-button-1-font` - Primary button text (18px)

**Spacing:**
- `--spacing-small` (8px), `--spacing-medium` (16px), `--spacing-large` (24px), `--spacing-xlarge` (32px)

**Shapes:**
- `--shape-border-radius-3` (8px) - Default for buttons/cards
- `--shape-shadow-2` - Card hover states
- `--shape-shadow-3` - Elevated elements

**Buttons (from `components.css`):**
- `.btn-primary` - Primary actions
- `.btn-secondary` - Secondary actions
- `.btn-accent` - High-priority CTAs (tangerine orange)
- `.btn-outline` - Tertiary actions

**Cards (from `components.css`):**
- `.card` - Standard card container
- `.card-header`, `.card-body`, `.card-footer` - Card sections

**Badges (from `components.css`):**
- `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`

### 2.2 Block-First Architecture

Following EDS best practices from `docs/CSS-ARCHITECTURE.md`:

```
blocks/
  wizard-vertical-progress/      ← New generic wizard progress
    wizard-vertical-progress.css
    wizard-vertical-progress.html
    wizard-vertical-progress.js
  
  template-card/                  ← New floor plan/template card
    template-card.css
    template-card.html
    template-card.js
  
  product-tile/                   ← New product photo tile
    product-tile.css
    product-tile.html
    product-tile.js
  
  loading-overlay/                ← New loading state component
    loading-overlay.css
    loading-overlay.html
    loading-overlay.js
  
  package-comparison/             ← New package comparison view
    package-comparison.css
    package-comparison.html
    package-comparison.js
  
  dashboard-summary/              ← New dashboard summary widget
    dashboard-summary.css
    dashboard-summary.html
    dashboard-summary.js
```

---

## Phase 3: Architecture Foundation

### 3.1 Persona Configuration System

**File:** `scripts/persona-config.js` (NEW)

```javascript
/**
 * Persona and Customer Group Configuration
 * Maps personas to Adobe Commerce customer groups
 */

export const CUSTOMER_GROUPS = {
  COMMERCIAL_TIER1: { id: 1, name: 'Commercial-Tier1', label: 'Commercial Tier 1' },
  COMMERCIAL_TIER2: { id: 2, name: 'Commercial-Tier2', label: 'Commercial Tier 2' },
  RESIDENTIAL_BUILDER: { id: 3, name: 'Residential-Builder', label: 'Residential Builder' },
  PRO_SPECIALTY: { id: 4, name: 'Pro-Specialty', label: 'Pro Specialty' },
  RETAIL_HOMEOWNER: { id: 5, name: 'Retail-Homeowner', label: 'Retail Homeowner' },
  RETAIL_CHAIN_BUYER: { id: 6, name: 'Retail-Chain-Buyer', label: 'Retail Chain Buyer' }
};

export const PERSONAS = {
  PRODUCTION_BUILDER: {
    id: 'production_builder',
    name: 'Sarah Martinez',
    title: 'Purchasing Manager',
    company: 'Sunset Valley Homes',
    customerGroup: CUSTOMER_GROUPS.COMMERCIAL_TIER2,
    defaultRoute: '/pages/dashboard.html?view=templates', // Generic URL with query param
    avatar: 'images/avatars/production-builder.jpg',
    features: {
      hasTemplates: true,
      hasPhases: true,
      hasVariants: true
    }
  },
  GENERAL_CONTRACTOR: {
    id: 'general_contractor',
    name: 'Marcus Johnson',
    title: 'Owner/General Contractor',
    company: 'Johnson Custom Builders',
    customerGroup: CUSTOMER_GROUPS.RESIDENTIAL_BUILDER,
    defaultRoute: '/pages/dashboard.html?view=projects',
    avatar: 'images/avatars/general-contractor.jpg',
    features: {
      hasProjects: true,
      hasPhases: true,
      useWizard: true
    }
  },
  REMODELING_CONTRACTOR: {
    id: 'remodeling_contractor',
    name: 'Lisa Chen',
    title: 'Owner',
    company: 'Chen Kitchen & Bath Remodeling',
    customerGroup: CUSTOMER_GROUPS.RESIDENTIAL_BUILDER,
    defaultRoute: '/pages/dashboard.html?view=packages',
    avatar: 'images/avatars/remodeling-contractor.jpg',
    features: {
      hasPackages: true,
      hasCustomization: true,
      hasQuotes: true
    }
  },
  PRO_HOMEOWNER: {
    id: 'pro_homeowner',
    name: 'David Thompson',
    title: 'Software Engineer',
    company: 'Personal Project',
    customerGroup: CUSTOMER_GROUPS.RETAIL_HOMEOWNER,
    defaultRoute: '/pages/builder.html?type=deck',
    avatar: 'images/avatars/pro-homeowner.jpg',
    features: {
      hasBuilder: true,
      hasGuides: true,
      hasTipsAndEducation: true
    }
  },
  STORE_MANAGER: {
    id: 'store_manager',
    name: 'Kevin Rodriguez',
    title: 'Store Manager',
    company: 'Pacific Northwest Hardware',
    customerGroup: CUSTOMER_GROUPS.RETAIL_CHAIN_BUYER,
    defaultRoute: '/pages/dashboard.html?view=restock',
    avatar: 'images/avatars/store-manager.jpg',
    features: {
      hasRestock: true,
      hasVelocityData: true,
      hasStoreManagement: true
    }
  }
};
```

### 3.2 Mock ACO Service Layer

**File:** `scripts/aco-service.js` (NEW)

```javascript
/**
 * Mock Adobe Commerce Optimizer Service
 * Simulates ACO catalog filtering with triggered policies
 */

import { getUserContext } from './auth.js';

export class ACOService {
  constructor() {
    this.masterCatalog = null;
  }
  
  /**
   * Load master catalog from mock-products.json
   */
  async loadCatalog() {
    if (this.masterCatalog) return;
    
    const basePath = window.BASE_PATH || '/';
    const response = await fetch(`${basePath}data/mock-products.json`);
    const data = await response.json();
    this.masterCatalog = data.products;
  }
  
  /**
   * Query products with triggered policies
   * @param {Object} policies - Filter policies
   * @returns {Promise<Object>} { products, metadata }
   */
  async queryProducts(policies = {}) {
    await this.loadCatalog();
    
    // Simulate API delay (1-2 seconds for realistic loading)
    await this.simulateDelay(1000, 2000);
    
    let filtered = [...this.masterCatalog];
    const appliedFilters = [];
    
    // Apply customer group pricing
    const userContext = getUserContext();
    if (userContext?.customerGroup) {
      filtered = this.applyCustomerGroupPricing(filtered, userContext.customerGroup);
      appliedFilters.push(`Customer Group: ${userContext.customerGroup.label}`);
    }
    
    // Apply project type filter
    if (policies.projectType) {
      filtered = filtered.filter(p => 
        p.project_types?.includes(policies.projectType)
      );
      appliedFilters.push(`Project Type: ${policies.projectType}`);
    }
    
    // Apply construction phase filter
    if (policies.constructionPhase) {
      filtered = filtered.filter(p => 
        p.construction_phase?.includes(policies.constructionPhase)
      );
      appliedFilters.push(`Phase: ${policies.constructionPhase}`);
    }
    
    // Apply quality tier filter
    if (policies.qualityTier) {
      filtered = filtered.filter(p => 
        p.quality_tier === policies.qualityTier || p.quality_tier === 'all'
      );
      appliedFilters.push(`Quality: ${policies.qualityTier}`);
    }
    
    // Apply package tier filter (for Lisa's flow)
    if (policies.packageTier) {
      filtered = filtered.filter(p => 
        p.package_tier?.includes(policies.packageTier)
      );
      appliedFilters.push(`Package Tier: ${policies.packageTier}`);
    }
    
    // Apply deck filters (for David's flow)
    if (policies.deckShape) {
      filtered = filtered.filter(p => 
        p.deck_shape?.includes(policies.deckShape) || !p.deck_shape
      );
      appliedFilters.push(`Deck Shape: ${policies.deckShape}`);
    }
    
    if (policies.deckSize) {
      filtered = filtered.filter(p => 
        this.hasInventoryForSize(p, policies.deckSize)
      );
      appliedFilters.push(`Deck Size: ${policies.deckSize.width}x${policies.deckSize.depth}`);
    }
    
    return {
      products: filtered,
      metadata: {
        totalCatalog: this.masterCatalog.length,
        filteredCount: filtered.length,
        filterPercentage: Math.round((filtered.length / this.masterCatalog.length) * 100),
        appliedPolicies: appliedFilters
      }
    };
  }
  
  applyCustomerGroupPricing(products, customerGroup) {
    return products.map(p => ({
      ...p,
      activePrice: this.getPrice(p, customerGroup)
    }));
  }
  
  getPrice(product, customerGroup) {
    const pricing = product.pricing || {};
    const groupKey = customerGroup.name.toLowerCase().replace('-', '_');
    
    if (pricing[groupKey]) {
      return pricing[groupKey];
    }
    
    return pricing.base || 0;
  }
  
  hasInventoryForSize(product, size) {
    const totalInventory = Object.values(product.inventory || {})
      .reduce((sum, qty) => sum + qty, 0);
    const required = size.requiredQuantity || 0;
    return totalInventory >= required;
  }
  
  async simulateDelay(min, max) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Singleton instance
export const acoService = new ACOService();
```

### 3.3 Enhanced Authentication System

**File:** `scripts/auth.js` (ENHANCED - not new)

Add persona login function:

```javascript
import { PERSONAS } from './persona-config.js';

/**
 * Login as a specific persona (for demo purposes)
 */
export function loginAsPersona(personaKey) {
  const persona = PERSONAS[personaKey];
  
  if (!persona) {
    console.error('Invalid persona:', personaKey);
    return false;
  }
  
  const userContext = {
    personaId: persona.id,
    personaKey: personaKey,
    name: persona.name,
    title: persona.title,
    company: persona.company,
    customerGroup: persona.customerGroup,
    features: persona.features,
    loggedInAt: new Date().toISOString()
  };
  
  setLoggedIn(userContext);
  
  // Redirect to persona's default route
  window.location.href = persona.defaultRoute;
  return true;
}
```

---

## Phase 4: Shared UI Components

All components use existing design system tokens and follow EDS block-first architecture.

### 4.1 Loading Overlay Component

**File:** `blocks/loading-overlay/loading-overlay.js`

```javascript
/**
 * Loading Overlay Component
 * Shows CCDM filtering progress during ACO queries
 */
export default function decorate(block) {
  // Block auto-decorated from HTML
  // Add spinner animation class
  block.classList.add('loading-overlay-animated');
}

/**
 * Show loading overlay with custom messages
 */
export function showLoading(container, options = {}) {
  const {
    title = 'Loading...',
    messages = ['Processing...']
  } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <h3 class="loading-title">${title}</h3>
      <div class="loading-messages">
        ${messages.map(msg => `<p class="loading-message">${msg}</p>`).join('')}
      </div>
    </div>
  `;
  
  container.appendChild(overlay);
}

export function hideLoading(container) {
  const overlay = container.querySelector('.loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}
```

**File:** `blocks/loading-overlay/loading-overlay.css`

```css
/* Loading Overlay - Uses design system tokens */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn var(--transition-base);
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: var(--spacing-xlarge);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-medium);
  border: 4px solid var(--color-border);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-title {
  font: var(--type-headline-2-font);
  color: var(--color-text);
  margin-bottom: var(--spacing-medium);
}

.loading-message {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-small);
}

.loading-message:last-child {
  margin-bottom: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 4.2 Vertical Wizard Progress Component

**File:** `blocks/wizard-vertical-progress/wizard-vertical-progress.js`

```javascript
/**
 * Vertical Wizard Progress Sidebar
 * Generic wizard progress indicator
 */
export default function decorate(block) {
  const steps = JSON.parse(block.dataset.steps || '[]');
  const currentStep = parseInt(block.dataset.currentStep || '0');
  
  const stepsHTML = steps.map((step, index) => {
    const isComplete = index < currentStep;
    const isActive = index === currentStep;
    const stepNum = index + 1;
    
    return `
      <div class="wizard-step ${isComplete ? 'complete' : ''} ${isActive ? 'active' : ''}">
        <div class="wizard-step-indicator">
          ${isComplete ? '✓' : '○'}
        </div>
        <div class="wizard-step-content">
          <div class="wizard-step-title">${step.title}</div>
          ${step.subtitle ? `<div class="wizard-step-subtitle">${step.subtitle}</div>` : ''}
        </div>
        ${index < steps.length - 1 ? '<div class="wizard-step-connector"></div>' : ''}
      </div>
    `;
  }).join('');
  
  block.innerHTML = stepsHTML;
}
```

**File:** `blocks/wizard-vertical-progress/wizard-vertical-progress.css`

```css
/* Vertical Wizard Progress - Uses design system tokens */
.wizard-vertical-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium);
  padding: var(--spacing-large);
  background: var(--color-surface);
  border-radius: var(--shape-border-radius-3);
  border: 1px solid var(--color-border);
}

.wizard-step {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-medium);
  position: relative;
}

.wizard-step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: white;
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.wizard-step.active .wizard-step-indicator {
  border-color: var(--color-brand-500);
  background: var(--color-brand-500);
  color: white;
}

.wizard-step.complete .wizard-step-indicator {
  border-color: var(--color-positive-500);
  background: var(--color-positive-500);
  color: white;
}

.wizard-step-content {
  flex: 1;
  padding-top: 4px;
}

.wizard-step-title {
  font: var(--type-body-1-strong-font);
  color: var(--color-text);
}

.wizard-step.active .wizard-step-title {
  color: var(--color-brand-500);
}

.wizard-step-subtitle {
  font: var(--type-body-2-default-font);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xsmall);
}

.wizard-step-connector {
  position: absolute;
  left: 15px;
  top: 40px;
  width: 2px;
  height: calc(100% + var(--spacing-medium));
  background: var(--color-border);
}

.wizard-step.complete .wizard-step-connector {
  background: var(--color-positive-500);
}
```

### 4.3 Template/Floor Plan Card Component

**File:** `blocks/template-card/template-card.js`

```javascript
/**
 * Template Card Component
 * Displays floor plans, saved projects, or templates
 */
export default function decorate(block) {
  const data = JSON.parse(block.dataset.template || '{}');
  
  block.innerHTML = `
    <div class="template-card-image">
      <img src="${data.imageUrl}" alt="${data.name}" />
    </div>
    <div class="template-card-info">
      <h3 class="template-card-title">${data.name}</h3>
      <p class="template-card-specs">${data.specs}</p>
      <div class="template-card-stats">
        ${data.stats.map(stat => `<span class="template-card-stat">${stat}</span>`).join('')}
      </div>
      ${data.variants ? `
        <div class="template-card-variants">
          <p class="template-card-variants-label">Variants:</p>
          <ul class="template-card-variants-list">
            ${data.variants.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <button class="btn btn-primary template-card-action">${data.actionLabel || 'Select'}</button>
      ${data.secondaryActions ? `
        <div class="template-card-secondary-actions">
          ${data.secondaryActions.map(action => 
            `<a href="${action.href}" class="template-card-link">${action.label}</a>`
          ).join(' • ')}
        </div>
      ` : ''}
    </div>
  `;
}
```

### 4.4 Product Tile Component

**File:** `blocks/product-tile/product-tile.js`

```javascript
/**
 * Product Photo Tile Component
 * Displays product options with hero images
 */
export default function decorate(block) {
  const product = JSON.parse(block.dataset.product || '{}');
  const isSelected = block.classList.contains('selected');
  const isDisabled = block.classList.contains('disabled');
  
  block.innerHTML = `
    <div class="product-tile-image">
      <img src="${product.heroImageUrl || product.imageUrl}" alt="${product.name}" />
      ${isSelected ? '<div class="product-tile-badge">✓ Selected</div>' : ''}
      ${isDisabled ? '<div class="product-tile-disabled-overlay">Unavailable</div>' : ''}
    </div>
    <div class="product-tile-info">
      <h4 class="product-tile-name">${product.name}</h4>
      <p class="product-tile-price">$${product.price.toLocaleString()}</p>
      ${product.features ? `
        <ul class="product-tile-features">
          ${product.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      ` : ''}
      ${product.stockStatus ? `
        <div class="product-tile-stock">
          <span class="badge badge-${product.stockStatus === 'in_stock' ? 'success' : 'error'}">
            ${product.stockStatus === 'in_stock' ? '✅ In Stock' : '❌ Unavailable'}
          </span>
        </div>
      ` : ''}
      ${!isDisabled ? `
        <button class="btn ${isSelected ? 'btn-secondary' : 'btn-primary'} product-tile-action">
          ${isSelected ? 'Selected' : 'Select'}
        </button>
      ` : ''}
    </div>
  `;
}
```

---

## Phase 5: Generic Page Structure

All pages use generic names with persona-specific behavior via user context.

### 5.1 Universal Dashboard

**File:** `pages/dashboard.html` (GENERIC - serves all B2B personas)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - BuildRight Solutions</title>
  <link rel="stylesheet" href="../styles/styles.css">
</head>
<body>
  <header></header>
  
  <main>
    <div class="container">
      <!-- Dashboard content rendered dynamically based on user context -->
      <div id="dashboard-content" class="dashboard-container"></div>
    </div>
  </main>
  
  <footer></footer>
  
  <script type="module" src="../scripts/scripts.js"></script>
  <script type="module" src="../scripts/dashboard.js"></script>
</body>
</html>
```

**File:** `scripts/dashboard.js` (GENERIC - handles all persona dashboards)

```javascript
/**
 * Generic Dashboard Controller
 * Renders different dashboards based on user context
 */

import { getUserContext, isLoggedIn } from './auth.js';
import { PERSONAS } from './persona-config.js';

async function initDashboard() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return;
  }
  
  const userContext = getUserContext();
  const personaKey = userContext.personaKey;
  
  // Get query params
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  
  // Determine which dashboard module to load based on persona
  let dashboardModule;
  
  if (personaKey === 'PRODUCTION_BUILDER' || view === 'templates') {
    dashboardModule = await import('./dashboards/template-dashboard.js');
  } else if (personaKey === 'GENERAL_CONTRACTOR' || view === 'projects') {
    dashboardModule = await import('./dashboards/project-dashboard.js');
  } else if (personaKey === 'REMODELING_CONTRACTOR' || view === 'packages') {
    dashboardModule = await import('./dashboards/package-dashboard.js');
  } else if (personaKey === 'STORE_MANAGER' || view === 'restock') {
    dashboardModule = await import('./dashboards/restock-dashboard.js');
  } else {
    // Default to empty dashboard
    dashboardModule = await import('./dashboards/empty-dashboard.js');
  }
  
  const container = document.getElementById('dashboard-content');
  await dashboardModule.render(container, userContext);
}

document.addEventListener('DOMContentLoaded', initDashboard);
```

### 5.2 Universal Builder/Wizard

**File:** `pages/builder.html` (GENERIC - serves all wizard flows)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Builder - BuildRight Solutions</title>
  <link rel="stylesheet" href="../styles/styles.css">
</head>
<body>
  <header></header>
  
  <main>
    <div class="builder-layout">
      <!-- Sidebar with vertical progress -->
      <aside class="builder-sidebar">
        <div class="wizard-vertical-progress" id="wizard-progress"></div>
      </aside>
      
      <!-- Main wizard content -->
      <div class="builder-main">
        <div id="builder-content" class="builder-content"></div>
      </div>
    </div>
  </main>
  
  <footer></footer>
  
  <script type="module" src="../scripts/scripts.js"></script>
  <script type="module" src="../scripts/builder.js"></script>
</body>
</html>
```

**File:** `scripts/builder.js` (GENERIC - routes to specific builder modules)

```javascript
/**
 * Generic Builder Controller
 * Routes to persona-specific builder implementations
 */

import { getUserContext, isLoggedIn } from './auth.js';
import { acoService } from './aco-service.js';

async function initBuilder() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return;
  }
  
  const userContext = getUserContext();
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  
  let builderModule;
  
  if (type === 'deck' || userContext.features?.hasBuilder) {
    // David's deck builder
    builderModule = await import('./builders/deck-builder.js');
  } else if (type === 'bathroom' || userContext.features?.hasPackages) {
    // Lisa's package builder
    builderModule = await import('./builders/package-builder.js');
  } else if (userContext.features?.useWizard) {
    // Marcus's project wizard
    builderModule = await import('./builders/project-wizard.js');
  } else {
    // Redirect to dashboard if no builder type specified
    window.location.href = '/pages/dashboard.html';
    return;
  }
  
  await builderModule.init(userContext, acoService);
}

document.addEventListener('DOMContentLoaded', initBuilder);
```

### 5.3 Login Page

**File:** `pages/login.html` (UPDATED)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - BuildRight Solutions</title>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/login.css">
</head>
<body>
  <main class="login-page">
    <div class="container">
      <div class="login-header">
        <h1>BuildRight Solutions</h1>
        <p class="login-subtitle">Demo Login - Select Your Persona</p>
      </div>
      
      <div class="persona-grid grid grid-3">
        <!-- Persona cards rendered dynamically -->
      </div>
    </div>
  </main>
  
  <script type="module" src="../scripts/login.js"></script>
</body>
</html>
```

**File:** `scripts/login.js`

```javascript
/**
 * Login Page Controller
 * Renders persona cards for demo login
 */

import { PERSONAS, CUSTOMER_GROUPS } from './persona-config.js';
import { loginAsPersona } from './auth.js';

function renderPersonaCards() {
  const grid = document.querySelector('.persona-grid');
  
  const personaCards = Object.entries(PERSONAS).map(([key, persona]) => `
    <div class="card persona-card" data-persona="${key}">
      <div class="persona-avatar">
        <img src="${persona.avatar}" alt="${persona.name}" />
      </div>
      <div class="card-body">
        <h3 class="persona-name">${persona.name}</h3>
        <p class="persona-title">${persona.title}</p>
        <p class="persona-company">${persona.company}</p>
        <span class="badge badge-secondary">${persona.customerGroup.label}</span>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary btn-login" data-persona="${key}">
          Login as ${persona.name.split(' ')[0]}
        </button>
      </div>
    </div>
  `).join('');
  
  grid.innerHTML = personaCards;
  
  // Add click handlers
  document.querySelectorAll('.btn-login').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const personaKey = e.target.dataset.persona;
      loginAsPersona(personaKey);
    });
  });
}

document.addEventListener('DOMContentLoaded', renderPersonaCards);
```

---

## Phase 6: Persona-Specific Implementation Modules

### 6.1 Template Dashboard (for Sarah - Production Builder)

**File:** `scripts/dashboards/template-dashboard.js`

Loads and displays saved floor plan templates with usage stats and order actions.

### 6.2 Project Dashboard (for Marcus - General Contractor)

**File:** `scripts/dashboards/project-dashboard.js`

Shows saved projects or empty state on first visit with "Start New Project" CTA.

### 6.3 Package Dashboard (for Lisa - Remodeling Contractor)

**File:** `scripts/dashboards/package-dashboard.js`

Displays saved quotes and quick access to package builders.

### 6.4 Restock Dashboard (for Kevin - Store Manager)

**File:** `scripts/dashboards/restock-dashboard.js`

Shows inventory health, velocity-based suggestions, and quick restock actions.

### 6.5 Project Wizard (for Marcus)

**File:** `scripts/builders/project-wizard.js`

4-step wizard with ACO queries for BOM generation based on project specs.

### 6.6 Deck Builder (for David)

**File:** `scripts/builders/deck-builder.js`

Progressive deck builder with triggered policies and progressive product count display.

### 6.7 Package Builder (for Lisa)

**File:** `scripts/builders/package-builder.js`

Good/Better/Best comparison with customization and quote generation.

---

## Phase 7: Data Files

### 7.1 Templates Data (for Sarah)

**File:** `data/templates.json` (NEW)

Saved floor plan templates with BOMs, variants, and usage statistics.

### 7.2 Packages Data (for Lisa)

**File:** `data/bathroom-packages.json` (NEW)

Good/Better/Best package definitions with fixtures, surfaces, and finishes.

### 7.3 Store Inventory Data (for Kevin)

**File:** `data/store-inventory.json` (NEW)

Store-specific inventory levels and velocity data.

### 7.4 Deck Products Data (for David)

**File:** `data/deck-products.json` (NEW)

Deck-specific products with compatibility attributes.

---

## Implementation Roadmap

### Phase 1: Foundation & Data (Weeks 1-2)
1. Update buildright-aco product definitions with new attributes
2. Update pricing for all 6 customer groups
3. Create policy definitions
4. Generate enhanced data
5. Update SETUP-GUIDE.md

### Phase 2: Core Architecture (Week 3)
1. Create persona-config.js
2. Create aco-service.js (mock ACO layer)
3. Enhance auth.js with persona login
4. Create login page with persona cards

### Phase 3: Shared Components (Week 4)
1. Build loading-overlay block
2. Build wizard-vertical-progress block
3. Build template-card block
4. Build product-tile block
5. Create generic page templates (dashboard.html, builder.html)

### Phase 4: Dashboard Modules (Weeks 5-6)
1. Create template-dashboard.js (Sarah)
2. Create project-dashboard.js (Marcus - empty first-time)
3. Create package-dashboard.js (Lisa)
4. Create restock-dashboard.js (Kevin)
5. Create dashboard.js router

### Phase 5: Builder Modules (Weeks 7-9)
1. Create project-wizard.js (Marcus) with ACO integration
2. Create deck-builder.js (David) with progressive policies
3. Create package-builder.js (Lisa) with customization
4. Create builder.js router

### Phase 6: Data Files (Week 10)
1. Create templates.json
2. Create bathroom-packages.json
3. Create store-inventory.json (for Kevin)
4. Create deck-products.json

### Phase 7: Polish & Testing (Weeks 11-12)
1. Add CSS animations using design system
2. Implement responsive layouts
3. Test all user flows end-to-end
4. Add educational tooltips
5. Create demo walkthrough guide
6. Performance optimization

---

## Success Criteria

✅ All files use generic, persona-agnostic names  
✅ Persona routing via user context (not URLs)  
✅ 5 distinct persona login flows  
✅ 5 unique user journeys with no overlap  
✅ Visual loading states showing CCDM filtering  
✅ Customer group-based pricing throughout  
✅ Progressive catalog filtering demonstrated  
✅ Mobile-responsive layouts using design system  
✅ Demo-ready with easy persona switching  
✅ Fully functional without backend connection  
✅ Shared component library following EDS architecture  
✅ Adobe Commerce native customer group architecture  
✅ Updated ACO data generation scripts  
✅ Updated SETUP-GUIDE.md with persona configuration

