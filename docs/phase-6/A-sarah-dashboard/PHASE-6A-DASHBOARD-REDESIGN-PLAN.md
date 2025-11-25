# Phase 6A: Sarah's Template Dashboard & BOM Configurator Redesign

## Overview

Transform Sarah's template dashboard from a catalog browsing experience into a production builder command center with quick project initiation and material configuration capabilities.

**Status**: Planning  
**Persona**: Sarah Martinez (Production Builder)  
**Goal**: Fast, data-dense ordering workflow for repeat template-based builds

---

## Key Design Decisions

### Dashboard Philosophy
- **NOT a catalog**: Sarah knows her 6 templates by heart
- **NOT browsing-oriented**: She's here to start work, not shop
- **IS a command center**: Quick access to start projects, track active builds, monitor costs
- **IS action-oriented**: Minimize clicks from login to BOM generation

### Configuration Approach
Sarah configures **structural/material decisions that affect BOM**, not aesthetic finishes:

**What Sarah CAN configure:**
1. **Structural Variants**: Bonus room, extended garage, covered patio (adds entire material packages)
2. **Material Quality Tiers**: Budget/Standard/Premium per construction phase
3. **Phase-Specific Upgrades**: Seismic strapping, upgraded subflooring, energy-efficient windows

**What Sarah does NOT configure:**
- Paint colors, fixtures, flooring styles (not relevant to material ordering)
- Room layouts (uses fixed templates)
- Aesthetic choices (not part of BOM)

### Visual Configurator Pattern: Hybrid Card + Phase Selector

**Selected Option**: Compact cards with collapsible phase sections (Option A from research)

**Why this pattern:**
- Compact, data-dense (suits Sarah's expert persona)
- Progressive disclosure (variants first, details optional)
- Shows cost impact in real-time
- Reuses existing card patterns from design system
- Familiar to B2B users (like ERP/procurement systems)

**Future evolution**: Interactive SVG floor plan (Option B) in Phase 2

---

## Architecture Changes

### 1. Dashboard Separation

**Create two distinct dashboards:**

**Dashboard A: Templates Dashboard** (`scripts/dashboards/template-dashboard.js`)
- Sarah's default landing page
- Focus: Quick access to her 6 templates for starting new projects
- Purpose: Project initiation

**Dashboard B: Account Dashboard** (`scripts/dashboards/account-dashboard.js`)
- Accessed via top nav "Account" link
- Contains: Order history, active projects, saved BOMs, cost analytics
- Purpose: Project management and account administration

**Why separate?**
- Different mental models: "Starting work" vs "Managing work"
- Sarah needs FAST access to templates (her primary action)
- Account management is secondary/administrative

**Routing updates** (`scripts/dashboard.js`):
- Sarah's `defaultView: 'templates'` stays (already correct)
- Add new route: `'account'` -> `account-dashboard.js`

---

### 2. Templates Dashboard Simplification

**File**: `scripts/dashboards/template-dashboard.js`

**Remove verbose elements:**
- Statistics cards (times built, avg cost, last ordered) - Sarah knows her templates
- "View Details" button - unnecessary step
- Large dual-image grid - reduce to single house photo thumbnail
- Floor plan images on cards (unnecessary for quick selection)

**Add action-oriented elements:**
- Primary action: "Start New Build" (large, prominent button)
- Mini visual: Small house photo (150x100px max)
- Quick reference: Sqft, stories, bedrooms (single line)
- Status indicators: "3 active" badge if builds in progress (NEW)
- Cost trends: "↑ 8% vs last order" alert (NEW, future phase)

**Updated card structure:**

```javascript
renderTemplateCard(template) {
  const activeBuilds = this.getActiveBuildsCount(template.id); // NEW
  
  return `
    <div class="template-card-compact" data-template-id="${template.id}">
      <img src="${template.finishedImage}" class="template-thumb" alt="${template.name}"/>
      
      <div class="template-info">
        <h3>${template.name}</h3>
        <p class="template-specs">
          ${template.sqft.toLocaleString()} sq ft • 
          ${template.stories} ${template.stories === 1 ? 'story' : 'stories'} • 
          ${template.bedrooms}BR/${template.bathrooms}BA
        </p>
        ${activeBuilds > 0 ? `
          <span class="active-badge">${activeBuilds} active</span>
        ` : ''}
      </div>
      
      <button class="btn btn-primary btn-block" data-action="configure" data-template="${template.id}">
        Start New Build
      </button>
    </div>
  `;
}
```

**File**: `styles/dashboards/template-dashboard.css`

**Updates:**
- Reduce card size: 300px width (from 400px)
- Grid: 4 columns on large screens (from 3 columns)
- Remove dual-image layout
- Add compact card styles
- Single thumbnail image (150x100px)
- Larger "Start New Build" button
- Active badge styling (small pill, brand color)

---

### 3. Project Configuration Flow

**NEW File**: `scripts/builders/project-configurator.js`

**Purpose**: Multi-step configuration interface for selecting variant and material options

**Flow:**
```
Templates Dashboard
    ↓ Click "Start New Build"
Project Configurator (Modal or Full Page)
    ↓ Step 1: Select Variant
    ↓ Step 2: Material Options (Optional)
    ↓ Click "Generate BOM"
BOM Review Page
    ↓ Review products by phase
    ↓ Click "Add to Cart" or "Save as Requisition List"
Cart/Checkout
```

**Class Structure:**

```javascript
class ProjectConfigurator {
  constructor(templateId) {
    this.template = null;
    this.selections = {
      projectName: '',        // Auto-generated: "House #47"
      variant: null,          // Selected variant ID
      materialOptions: {      // Per-phase selections
        foundation_framing: {
          qualityTier: 'standard',
          upgrades: []
        },
        envelope: {
          qualityTier: 'standard',
          upgrades: []
        },
        interior_finish: {
          qualityTier: 'standard',
          upgrades: []
        }
      }
    };
  }
  
  async initialize() {
    await this.loadTemplate();
    this.render();
    this.setupEventListeners();
  }
  
  render() {
    // Main configuration UI
  }
  
  renderVariantSelection() {
    // Compact radio button cards
    // Show: variant name, sqft delta, cost delta
  }
  
  renderMaterialOptions() {
    // Collapsible phase sections
    // Each phase: Quality tier radio + optional upgrades checkboxes
  }
  
  calculateTotalCost() {
    // Real-time cost calculation based on selections
  }
  
  async generateBOM() {
    // Pass selections to template-builder
  }
}
```

**UI Structure:**

```
┌─────────────────────────────────────────┐
│ Configure: The Sedona                   │
│ Project: House #47 (auto-increment)    │
├─────────────────────────────────────────┤
│ [Mini floor plan preview - right side]  │
│                                         │
│ STEP 1: Select Variant                 │
│ ┌─────────────────────────────────────┐│
│ │ ○ Standard (2,450 sq ft) - Base    ││
│ │ ○ + Bonus Room (2,650 sq ft) +$15K ││
│ │ ○ + Extended Garage (2,450) +$8K   ││
│ │ ○ + Covered Patio (2,450) +$12K    ││
│ └─────────────────────────────────────┘│
│                                         │
│ STEP 2: Material Selections (Optional) │
│ ▼ Foundation & Framing ($45K base)     │
│   Quality: ○ Budget (-10%) ● Standard ○ Premium (+15%)│
│   Upgrades:                             │
│   ☐ Seismic strapping (+$800)          │
│   ☐ Upgraded subflooring (+$1,200)     │
│                                         │
│ ▶ Building Envelope ($38K base)         │
│ ▶ Interior Finish ($28K base)           │
│                                         │
│ ─────────────────────────────────────  │
│ Estimated Total: $111,000               │
│ [Generate BOM] [Save Configuration]     │
└─────────────────────────────────────────┘
```

**NEW File**: `styles/builders/project-configurator.css`

**Key styles:**
- Modal overlay or full-page layout
- Compact variant cards with radio buttons (not large photo tiles)
- Collapsible phase sections with accordion pattern
- Quality tier radio buttons (horizontal layout)
- Upgrade checkboxes (vertical list)
- Real-time cost calculator (sticky footer or right sidebar)
- Mini floor plan preview (top-right, 300x200px)

---

### 4. Data Structure Extensions

**File**: `data/templates.json`

**Add `materialOptions` to each template:**

```json
{
  "id": "sedona",
  "name": "The Sedona",
  "sqft": 2450,
  "stories": 2,
  "bedrooms": 4,
  "bathrooms": 2.5,
  "foundation": "Slab",
  "exteriorFinish": "Stucco",
  "roofType": "Tile",
  "image": "/images/floor-plans/sedona.png",
  "finishedImage": "/images/finished-homes/sedona.jpg",
  
  "variants": [
    {
      "id": "sedona-standard",
      "name": "Standard",
      "sqft": 2450,
      "addedCost": 0,
      "description": "Standard configuration"
    },
    {
      "id": "sedona-bonus",
      "name": "Bonus Room",
      "sqft": 2650,
      "addedCost": 15000,
      "description": "Adds 200 sq ft bonus room over garage"
    }
  ],
  
  "bomSummary": {
    "foundation_framing": {
      "categories": ["structural_materials", "fasteners_hardware"],
      "estimatedCost": 45000,
      "itemCount": 180
    },
    "envelope": {
      "categories": ["roofing", "windows_doors", "siding"],
      "estimatedCost": 38000,
      "itemCount": 95
    },
    "interior_finish": {
      "categories": ["flooring", "paint", "fixtures"],
      "estimatedCost": 28000,
      "itemCount": 150
    }
  },
  
  "materialOptions": {
    "foundation_framing": {
      "qualityTiers": [
        {
          "id": "budget",
          "name": "Budget",
          "costMultiplier": 0.90,
          "description": "Standard materials, basic specifications"
        },
        {
          "id": "standard",
          "name": "Standard",
          "costMultiplier": 1.0,
          "description": "Recommended for most builds",
          "default": true
        },
        {
          "id": "premium",
          "name": "Premium",
          "costMultiplier": 1.15,
          "description": "Enhanced materials, upgraded specifications"
        }
      ],
      "upgrades": [
        {
          "id": "seismic_strapping",
          "name": "Seismic Strapping",
          "cost": 800,
          "description": "Enhanced earthquake resistance",
          "skus": ["NAIL-SEISMIC-01", "STRAP-METAL-01"]
        },
        {
          "id": "upgraded_subflooring",
          "name": "Upgraded Subflooring",
          "cost": 1200,
          "description": "3/4\" tongue & groove plywood",
          "skus": ["PLY-SUBFLOOR-TG-01"]
        }
      ]
    },
    "envelope": {
      "qualityTiers": [
        {
          "id": "budget",
          "name": "Budget",
          "costMultiplier": 0.90,
          "description": "Standard shingles, basic windows"
        },
        {
          "id": "standard",
          "name": "Standard",
          "costMultiplier": 1.0,
          "description": "Architectural shingles, standard windows",
          "default": true
        },
        {
          "id": "premium",
          "name": "Premium",
          "costMultiplier": 1.15,
          "description": "Metal roof, energy-efficient windows"
        }
      ],
      "upgrades": [
        {
          "id": "energy_star_windows",
          "name": "Energy Star Windows",
          "cost": 2500,
          "description": "Low-E glass, improved insulation",
          "skus": ["WINDOW-ES-01", "WINDOW-ES-02"]
        },
        {
          "id": "impact_resistant_doors",
          "name": "Impact Resistant Doors",
          "cost": 1800,
          "description": "Hurricane/wind rated doors",
          "skus": ["DOOR-IMPACT-01"]
        }
      ]
    },
    "interior_finish": {
      "qualityTiers": [
        {
          "id": "budget",
          "name": "Budget",
          "costMultiplier": 0.90,
          "description": "Basic finishes"
        },
        {
          "id": "standard",
          "name": "Standard",
          "costMultiplier": 1.0,
          "description": "Mid-grade finishes",
          "default": true
        },
        {
          "id": "premium",
          "name": "Premium",
          "costMultiplier": 1.15,
          "description": "Upgraded finishes"
        }
      ],
      "upgrades": [
        {
          "id": "upgraded_insulation",
          "name": "Upgraded Insulation",
          "cost": 1500,
          "description": "R-21 vs R-13 standard",
          "skus": ["INSUL-R21-01"]
        }
      ]
    }
  }
}
```

**Schema Notes:**
- `qualityTiers`: Affects entire phase cost via multiplier
- `upgrades`: Specific products added to BOM (with SKUs for future ACO integration)
- `default: true`: Pre-selected option
- `skus`: Optional array of product SKUs to add for this upgrade

---

### 5. BOM Generation Update

**File**: `scripts/builders/template-builder.js`

**Update `generateBOM()` to accept and apply configurations:**

```javascript
async generateBOM() {
  showLoading('Generating Bill of Materials...', 'Calculating materials for ' + this.template.name);

  try {
    const phases = ['foundation_framing', 'envelope', 'interior_finish'];
    this.bom = [];

    for (const phase of phases) {
      const phaseData = this.template.bomSummary[phase];
      const qualityTier = this.selectedVariant.materialOptions?.[phase]?.qualityTier || 'standard';
      const upgrades = this.selectedVariant.materialOptions?.[phase]?.upgrades || [];

      // Get base products for phase
      const result = await acoService.getProducts({
        filters: { construction_phase: phase },
        policy: `phase_${phase}`,
        userContext: await acoService.getUserContext(authService.getCurrentUser().id),
        limit: phaseData.itemCount
      });

      // Apply quality tier cost multiplier
      const tierMultiplier = this.getQualityTierMultiplier(phase, qualityTier);
      const adjustedCost = phaseData.estimatedCost * tierMultiplier;

      // Get upgrade products
      const upgradeProducts = await this.fetchUpgradeProducts(phase, upgrades);
      const upgradeCost = upgradeProducts.reduce((sum, p) => sum + p.price, 0);

      this.bom.push({
        phase,
        qualityTier,
        products: result.products.slice(0, 20), // Limit for demo
        estimatedCost: adjustedCost + upgradeCost,
        baseProducts: result.products.slice(0, 20),
        upgradeProducts
      });
    }

    this.currentPhase = 'bom_review';
    this.render();

  } catch (error) {
    console.error('Error generating BOM:', error);
    alert('Error generating BOM. Please try again.');
  } finally {
    hideLoading();
  }
}

getQualityTierMultiplier(phase, tierId) {
  const phaseOptions = this.template.materialOptions[phase];
  const tier = phaseOptions.qualityTiers.find(t => t.id === tierId);
  return tier ? tier.costMultiplier : 1.0;
}

async fetchUpgradeProducts(phase, upgradeIds) {
  const phaseOptions = this.template.materialOptions[phase];
  const products = [];
  
  for (const upgradeId of upgradeIds) {
    const upgrade = phaseOptions.upgrades.find(u => u.id === upgradeId);
    if (upgrade && upgrade.skus) {
      // In real implementation, fetch actual products by SKU from ACO
      // For demo, create mock products
      products.push({
        name: upgrade.name,
        sku: upgrade.skus[0],
        price: upgrade.cost,
        description: upgrade.description
      });
    }
  }
  
  return products;
}
```

**Update BOM Review to show selected options:**

```javascript
renderPhaseSection(phaseData) {
  const tierLabel = phaseData.qualityTier.charAt(0).toUpperCase() + phaseData.qualityTier.slice(1);
  
  return `
    <div class="bom-phase">
      <h3>${this.formatPhase(phaseData.phase)}</h3>
      <p class="phase-summary">
        ${phaseData.products.length} items • 
        Quality: ${tierLabel} • 
        ${phaseData.upgradeProducts.length > 0 ? `${phaseData.upgradeProducts.length} upgrades • ` : ''}
        Estimated: $${phaseData.estimatedCost.toLocaleString()}
      </p>
      
      <div class="phase-products">
        ${phaseData.baseProducts.slice(0, 5).map(product => `
          <div class="bom-product">
            <img src="${product.images?.[0] || '/images/placeholder-product.png'}" alt="${product.name}" class="product-thumbnail">
            <span class="product-name">${product.name}</span>
            <span class="product-sku">${product.sku}</span>
          </div>
        `).join('')}
        
        ${phaseData.upgradeProducts.length > 0 ? `
          <div class="bom-upgrades">
            <h4>Selected Upgrades:</h4>
            ${phaseData.upgradeProducts.map(product => `
              <div class="bom-product upgrade">
                <span class="product-name">${product.name}</span>
                <span class="product-price">+$${product.price.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${phaseData.baseProducts.length > 5 ? `
          <p class="products-more">+ ${phaseData.baseProducts.length - 5} more items</p>
        ` : ''}
      </div>
    </div>
  `;
}
```

---

### 6. Account Dashboard (NEW)

**NEW File**: `scripts/dashboards/account-dashboard.js`

**Purpose**: Separate dashboard for order management, project tracking, and analytics

**Sections:**

1. **Active Projects** - Houses currently in progress
2. **Order History** - Recent material orders (reuse existing order-history data)
3. **Saved BOMs** - Template configurations saved for reuse
4. **Cost Analytics** - Spending trends per template (future phase)

**Sample structure:**

```javascript
export async function initialize(container) {
  const dashboard = new AccountDashboard(container);
  await dashboard.initialize();
}

class AccountDashboard {
  constructor(container) {
    this.container = container;
    this.activeProjects = [];
    this.orders = [];
    this.savedConfigs = [];
  }

  async initialize() {
    await this.loadData();
    this.render();
    this.setupEventListeners();
  }

  async loadData() {
    // Load active projects (mock data for now)
    this.activeProjects = await this.fetchActiveProjects();
    
    // Load orders (reuse existing order history)
    this.orders = await this.fetchOrderHistory();
    
    // Load saved configurations
    this.savedConfigs = await this.fetchSavedConfigurations();
  }

  render() {
    this.container.innerHTML = `
      <div class="account-dashboard">
        <header class="dashboard-header">
          <h1>My Account</h1>
          <p class="subtitle">Manage your projects, orders, and configurations</p>
        </header>

        <div class="dashboard-grid">
          <section class="active-projects">
            <h2>Active Projects (${this.activeProjects.length})</h2>
            ${this.renderActiveProjects()}
          </section>

          <section class="recent-orders">
            <h2>Recent Orders</h2>
            ${this.renderRecentOrders()}
          </section>

          <section class="saved-boms">
            <h2>Saved Configurations</h2>
            ${this.renderSavedBOMs()}
          </section>
        </div>
      </div>
    `;
  }

  renderActiveProjects() {
    if (this.activeProjects.length === 0) {
      return '<p class="empty-state">No active projects</p>';
    }
    
    return `
      <div class="projects-list">
        ${this.activeProjects.map(project => `
          <div class="project-card">
            <div class="project-info">
              <h3>${project.name}</h3>
              <p class="project-template">${project.template}</p>
              <p class="project-status">Status: ${project.status}</p>
              <p class="project-phase">Current Phase: ${project.currentPhase}</p>
            </div>
            <div class="project-actions">
              <button class="btn btn-secondary" data-action="view-project" data-id="${project.id}">
                View Details
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderRecentOrders() {
    // Reuse existing order history rendering
    return `<p>Integration with existing order history</p>`;
  }

  renderSavedBOMs() {
    if (this.savedConfigs.length === 0) {
      return '<p class="empty-state">No saved configurations</p>';
    }
    
    return `
      <div class="saved-configs-list">
        ${this.savedConfigs.map(config => `
          <div class="config-card">
            <h4>${config.name}</h4>
            <p>${config.template} - ${config.variant}</p>
            <p class="config-cost">Est. Cost: $${config.estimatedCost.toLocaleString()}</p>
            <button class="btn btn-primary btn-small" data-action="reuse-config" data-id="${config.id}">
              Use This Configuration
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  async fetchActiveProjects() {
    // Mock data for now
    return [
      {
        id: 'proj-001',
        name: 'House #47',
        template: 'The Sedona',
        status: 'In Progress',
        currentPhase: 'Foundation & Framing'
      }
    ];
  }

  async fetchOrderHistory() {
    // Integration point with existing order history
    return [];
  }

  async fetchSavedConfigurations() {
    // Load from localStorage for now
    const saved = localStorage.getItem('buildright_saved_configs');
    return saved ? JSON.parse(saved) : [];
  }
}
```

**NEW File**: `styles/dashboards/account-dashboard.css`

```css
.account-dashboard {
  padding: var(--spacing-large);
}

.dashboard-grid {
  display: grid;
  gap: var(--spacing-large);
  margin-top: var(--spacing-large);
}

.dashboard-grid section {
  background: white;
  border-radius: var(--shape-border-radius-3);
  box-shadow: var(--shape-shadow-2);
  padding: var(--spacing-large);
}

.projects-list,
.saved-configs-list {
  display: grid;
  gap: var(--spacing-medium);
}

.project-card,
.config-card {
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--shape-border-radius-2);
  padding: var(--spacing-medium);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

### 7. Header Navigation Update

**File**: `blocks/header/header.js` (or wherever navigation is rendered)

**Add "My Account" link to authenticated user menu:**

```javascript
// In the renderAuthenticatedMenu() or similar function
function renderUserNavigation() {
  const persona = authService.getCurrentUser()?.persona;
  
  if (persona === 'sarah') {
    return `
      <nav class="user-menu">
        <a href="/pages/dashboard.html?view=templates" class="nav-link">Templates</a>
        <a href="/pages/dashboard.html?view=account" class="nav-link">My Account</a>
        <a href="/pages/order-history.html" class="nav-link">Orders</a>
      </nav>
    `;
  }
  
  // Other personas...
}
```

**Update dashboard router** (`scripts/dashboard.js`):

```javascript
const viewModules = {
  templates: () => import('./dashboards/template-dashboard.js'),
  account: () => import('./dashboards/account-dashboard.js'),
  // ... other views
};

async function loadDashboardView(viewName) {
  const module = await viewModules[viewName]();
  const container = document.querySelector('.dashboard-container');
  await module.initialize(container);
}
```

---

## Implementation Phases

### Phase 1: Dashboard Simplification (2-3 hours)
**Goal**: Streamline template dashboard to be action-oriented

- [ ] Update `template-dashboard.js` - simplify card rendering
- [ ] Update `template-dashboard.css` - compact layout, 4-column grid
- [ ] Remove statistics display from cards
- [ ] Remove dual-image layout, keep single thumbnail
- [ ] Add "Start New Build" as primary button
- [ ] Test responsive design (mobile, tablet, desktop)

### Phase 2: Data Structure (1-2 hours)
**Goal**: Extend template data with material options

- [ ] Extend `data/templates.json` with `materialOptions` for all 6 templates
- [ ] Add quality tiers per phase (foundation_framing, envelope, interior_finish)
- [ ] Add upgrade options per phase with SKUs
- [ ] Document data schema in comments
- [ ] Validate JSON structure

### Phase 3: Project Configurator (4-6 hours)
**Goal**: Create configuration UI for variants and material options

- [ ] Create `scripts/builders/project-configurator.js`
- [ ] Implement variant selection UI (compact radio cards)
- [ ] Implement phase-based material options (collapsible accordion)
- [ ] Add quality tier selection (radio buttons)
- [ ] Add upgrade checkboxes
- [ ] Implement real-time cost calculator
- [ ] Create `styles/builders/project-configurator.css`
- [ ] Integrate with template-builder flow
- [ ] Add modal/page routing from template dashboard

### Phase 4: BOM Generation Update (2-3 hours)
**Goal**: Update BOM generation to apply selected configurations

- [ ] Update `template-builder.js` to accept configuration selections
- [ ] Implement `getQualityTierMultiplier()` method
- [ ] Implement `fetchUpgradeProducts()` method
- [ ] Apply quality tier multipliers to phase costs
- [ ] Add upgrade products to BOM
- [ ] Update BOM review to show selected tier and upgrades
- [ ] Test cost calculations

### Phase 5: Account Dashboard (3-4 hours)
**Goal**: Create separate dashboard for project management

- [ ] Create `scripts/dashboards/account-dashboard.js`
- [ ] Implement active projects section (mock data)
- [ ] Integrate with existing order history
- [ ] Create saved BOMs section (localStorage for now)
- [ ] Create `styles/dashboards/account-dashboard.css`
- [ ] Add responsive design for mobile

### Phase 6: Navigation & Integration (1-2 hours)
**Goal**: Wire up routing and navigation

- [ ] Update header with "My Account" link (for Sarah persona)
- [ ] Update `scripts/dashboard.js` to handle 'account' view
- [ ] Test navigation flow: Templates → Account → Templates
- [ ] Update breadcrumbs for configurator
- [ ] Test deep linking (direct URL access to views)

### Phase 7: Testing & Polish (2-3 hours)
**Goal**: Comprehensive testing and refinement

- [ ] End-to-end flow testing: Template → Configure → BOM → Cart
- [ ] Mobile responsive testing (all breakpoints)
- [ ] Cost calculation validation
- [ ] Browser compatibility (Chrome, Safari, Firefox)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance testing (page load times)
- [ ] Error handling (network failures, missing data)

**Total Estimated Time**: 15-22 hours

---

## Success Criteria

### User Experience
- [ ] Sarah can start a new build in 2 clicks (template → start build)
- [ ] Configuration screen shows all options on one page (no excessive scrolling)
- [ ] Cost updates in real-time as selections change
- [ ] Flow feels fast and data-dense (not browsing-oriented)
- [ ] Mobile experience is functional (not just responsive)

### Technical
- [ ] BOM accurately reflects quality tiers and upgrades
- [ ] Cost calculations are correct (multipliers + upgrades)
- [ ] Navigation works bidirectionally (can go back/forward)
- [ ] State persists appropriately (localStorage for saved configs)
- [ ] Error states are handled gracefully

### Business
- [ ] Demonstrates ACO flexibility (material options, variants)
- [ ] Shows B2B workflow efficiency (repeat ordering)
- [ ] Highlights persona-specific experience (vs consumer browsing)
- [ ] Account dashboard shows project management capabilities

---

## Files to Create

### JavaScript Modules
- `scripts/builders/project-configurator.js` - Configuration UI for variant and material selection
- `scripts/dashboards/account-dashboard.js` - Account management dashboard

### Stylesheets
- `styles/builders/project-configurator.css` - Configuration UI styles
- `styles/dashboards/account-dashboard.css` - Account dashboard styles

---

## Files to Modify

### JavaScript
- `scripts/dashboards/template-dashboard.js` - Simplify cards, add action buttons
- `scripts/builders/template-builder.js` - Accept configurations, apply tiers/upgrades
- `scripts/dashboard.js` - Add 'account' route
- `blocks/header/header.js` - Add "My Account" link for Sarah

### Stylesheets
- `styles/dashboards/template-dashboard.css` - Compact layout, 4-column grid

### Data
- `data/templates.json` - Add `materialOptions` with quality tiers and upgrades

---

## Future Enhancements (Phase 2)

### Interactive Floor Plan (Option B from research)
- Create SVG floor plans for all 6 templates
- Implement clickable regions (garage, bonus room, patio)
- Animate variant selection (highlight affected areas)
- Room-by-room configuration (future scope)

### Advanced Features
- Cost trend tracking and alerts ("Prescott costs up 8% this month")
- Material lead time indicators ("2-week lead time for engineered lumber")
- Duplicate previous build feature ("Reorder Sedona from Oct 15")
- Bulk project creation ("Order materials for 3 Prescotts")
- Budget forecasting ("Your typical Sedona costs $111K ± $3K")

### Integration Points
- Real ACO product fetching by SKU (for upgrades)
- Adobe Commerce requisition lists (save configurations)
- Purchase order workflow (for large orders)
- Approval workflows (if Sarah needs manager approval)

---

## Related Documentation

- [Phase 6A Original Plan](./PHASE-6A-PERSONA-SARAH.md) - Initial implementation (completed)
- [Persona Configuration](../scripts/persona-config.js) - Sarah's persona settings
- [Project Builder Wizard](./archive/old-project-builder/) - David's deck builder (reference)
- [Dashboard Router](../scripts/dashboard.js) - Routing logic for views

---

## Research References

### Visual Configurator Patterns
- Existing project-builder wizard (David's deck builder) - Photo tile pattern with progressive disclosure
- Adobe Commerce B2B requisition lists - Saved product lists for quick reordering
- Production builder workflows - Material ordering by construction phase

### Design Decisions
- **Why not large photo tiles?** Sarah is an expert user who doesn't need visual selling - she needs data density
- **Why collapsible sections?** Progressive disclosure keeps UI clean while allowing deep configuration
- **Why separate dashboards?** Different contexts (starting work vs managing work) deserve different UIs
- **Why quality tiers instead of individual products?** Sarah thinks in terms of "budget vs standard vs premium" at phase level, not individual SKU selection

---

## Questions & Decisions Log

**Q: Should configurator be a modal or full page?**  
**A**: Start with full page for simplicity. Modal can be added later if UX testing shows preference.

**Q: How many configuration options is too many?**  
**A**: Limit to 3-5 upgrades per phase. Too many choices slow down ordering (paradox of choice).

**Q: Should we save configurations automatically?**  
**A**: Yes, to localStorage as "draft" until user explicitly saves. Prevents data loss.

**Q: Do we need to validate configuration compatibility?**  
**A**: Not in MVP. Future phase could add logic (e.g., "Bonus room requires 2-story variant").

**Q: Should active projects be real data or mock?**  
**A**: Start with mock data. Future phase can integrate with actual order tracking.

---

## Status

**Current**: Planning complete, ready for implementation  
**Next**: Begin Phase 1 (Dashboard Simplification)  
**Blocker**: None

