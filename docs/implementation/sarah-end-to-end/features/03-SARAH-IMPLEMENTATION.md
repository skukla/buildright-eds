# Phase 6-Foundation: Sarah Martinez Implementation

**📊 Document Type**: Persona-Specific Implementation Guide  
**📖 Reading Time**: 20-25 minutes  
**👥 Audience**: Developers implementing Phase 6A (Sarah's dashboard redesign)

This is **Part 4 of 6** in the Phase 6-Foundation planning series.

**← Previous**: [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)  
**→ Next**: [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)

**🔗 Related Architecture**:
- ⭐ [PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md#sarah-martinez---production-home-builder) - Sarah's mental model & shopping behavior
- ⭐ [ACO-CATALOG-ARCHITECTURE.md](./ACO-CATALOG-ARCHITECTURE.md#view-1-production-builder-view-sarah) - Sarah's catalog view configuration
- ⭐ [INDUSTRY-REALISM-ANALYSIS.md](../A-sarah-dashboard/INDUSTRY-REALISM-ANALYSIS.md) - Research validation & scale decision

---

## Overview

This document details Sarah Martinez's (Regional Production Builder) complete implementation using the Project entity.

**What's Different**: Sarah orders materials for multiple house builds, tracks deliveries, and reuses configurations across identical units.

**Key Focus**: Materials ordering and delivery tracking (BuildRight's actual scope) - NOT construction management.

**Scale Context**: Sarah works for a regional builder (20-30 homes/year) without ERP integration. She uses the BuildRight B2B portal directly for ordering—making this flow ideal for demonstrating Adobe Commerce's full B2B capabilities including cart, checkout, and order management.

---

## Design System Compliance: Reuse Existing Patterns

### ⚠️ Critical: Do NOT Invent New Layouts

**Principle**: The BuildRight design system already has established patterns for all the UX we need. We MUST reuse them, not create new ones.

### Existing Patterns We Will Reuse

**Pattern 1: Card-Based Dashboard** (`pages/account.html`)
- **Component**: `.card` with `.card-header`, `.card-body`, `.card-footer`
- **Layout**: `.grid .grid-3` for responsive 3-column grid
- **Use For**: Sarah's dashboard landing page (Quick Actions section)

**Pattern 2: Data Table** (`pages/order-history.html`)
- **Component**: `.orders-table` (full `<table>` structure)
- **Responsive**: Converts to card-style on mobile automatically
- **Use For**: Active Builds list, Order History, Delivery Schedule

**Pattern 3: Product Grid** (`pages/catalog.html`)
- **Component**: `.catalog-layout` (sidebar + grid)
- **Grid**: `.product-grid` with `.products-container` for cards
- **Use For**: Template browsing

**Pattern 4: Simple List** (existing components)
- **Components**: `.simple-list-header`, `.simple-list-row`, `.simple-qty-controls`
- **Use For**: BOM display

### Sarah's Dashboard: Component Mapping

| Screen | Existing Pattern | File Reference |
|--------|------------------|----------------|
| Dashboard Landing | Card Grid (`.grid .grid-3`) | `pages/account.html` |
| Active Builds List | Table (`.orders-table`) | `pages/order-history.html` |
| Delivery Schedule | Table (`.orders-table`) | `pages/order-history.html` |
| Template Browser | Product Grid (`.catalog-layout`) | `pages/catalog.html` |
| BOM Review | Simple List (`.simple-list-*`) | Existing components |

**Result**: Zero new CSS required!

---

## Sarah's User Journey: Before vs. After

### BEFORE (Current State - Browsing-Oriented)

**Current Pain Points**:
- Template dashboard tries to do both browsing AND operational management
- No clear separation between "selecting a template" and "managing active builds"
- No persistent project entities
- Mock data for "active builds"

**Current Flow**:
1. Sarah views template dashboard (verbose cards, browsing + management mixed)
2. Clicks template card → Opens modal with details
3. Selects variant in modal
4. Configures materials (no persistence)
5. Generates BOM
6. Orders materials
7. **No way to track this build afterward** (no project entity)

---

### AFTER (Updated Plan - Materials-Focused, Multi-Screen Design)

**UX Improvements**:
- ✅ **BuildRight scope**: Materials ordering and delivery (not construction management)
- ✅ **Clean, focused screens**: Dashboard as navigation hub, not content overload
- ✅ **Materials context**: Track orders, deliveries, and BOMs per build
- ✅ **Smart defaults**: Naming based on subdivision + lot, delivery locations
- ✅ **Persistent entities**: Never lose configuration data
- ✅ **Multi-phase ordering**: Order foundation now, envelope later

---

## User Flow 1: Ordering Materials for a New Build

**Steps**:

1. **Dashboard Landing**: Sarah clicks **"+ Order Materials for New Build"**

2. **Template Selection** (`pages/templates.html`):
   - Clean 3-column card grid (`.grid .grid-3`)
   - Large images, minimal text, clean spacing
   - Each template card has "Start New Build" button

```html
<section class="section">
  <div class="container" style="max-width: 1200px;">
    <div style="text-align: center; margin-bottom: 3rem;">
      <h1>Select a Template</h1>
    </div>
    <div class="grid grid-3" style="gap: 2rem;">
      <div class="card">
        <img src="/images/templates/sedona.jpg" 
             alt="The Sedona" 
             style="width: 100%; aspect-ratio: 4/3; object-fit: cover;">
        <div class="card-body" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 0.5rem;">The Sedona</h3>
          <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">
            2,450 sqft • 3 bed • 2.5 bath
          </p>
          <button class="btn btn-primary" style="width: 100%;">
            Start New Build
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
```

3. **Build Configuration** (`pages/build-configurator.html`):
   - Reuses `.catalog-layout` (sidebar + main content)
   - Sidebar: Template info, section nav, pricing summary
   - Main: Visual tiles for variant, package cards for material selections

```html
<section class="section">
  <div class="breadcrumbs">
    <a href="dashboard.html">Dashboard</a>
    <span>›</span>
    <a href="templates.html">Templates</a>
    <span>›</span>
    <span>Configure Build</span>
  </div>
  
  <div class="catalog-layout">
    <!-- Sidebar -->
    <aside class="config-sidebar">
      <div class="config-template-header">
        <img src="/images/templates/sedona-thumb.jpg" alt="The Sedona">
        <h3>The Sedona</h3>
        <p>2,450 sqft • 3 bed • 2.5 bath</p>
      </div>
      
      <div class="config-nav">
        <a href="#variant" class="active">1. Variant</a>
        <a href="#package">2. Selection Package</a>
        <a href="#upgrades">3. Additional Upgrades</a>
      </div>
      
      <div class="config-summary">
        <h4>Base Price</h4>
        <p>$93,000</p>
        
        <h4>Package Added Cost</h4>
        <p>+$18,000</p>
        
        <h4>Total</h4>
        <p><strong>$111,000</strong></p>
      </div>
    </aside>
    
    <!-- Main Content -->
    <div class="config-content">
      <!-- Variant Selection -->
      <div class="config-panel active" data-panel="variant">
        <h2>Choose a Variant</h2>
        <div class="grid grid-3">
          <div class="card config-option-card">
            <img src="/images/templates/sedona-standard.jpg" alt="Standard">
            <div class="card-body">
              <h3>Standard</h3>
              <p>2,450 sqft</p>
              <button class="btn btn-outline">Select</button>
            </div>
          </div>
          <div class="card config-option-card active">
            <img src="/images/templates/sedona-bonus.jpg" alt="Bonus Room">
            <div class="card-body">
              <h3>Bonus Room</h3>
              <p>2,680 sqft (+$8K)</p>
              <button class="btn btn-primary">Selected</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Package Selection -->
      <div class="config-panel hidden" data-panel="package">
        <h2>Choose a Selection Package</h2>
        <p style="margin-bottom: 2rem;">
          Pre-configured material packages for your builds
        </p>
        <div class="grid grid-3">
          <div class="card config-option-card">
            <div class="card-body">
              <h3>Builder's Choice</h3>
              <p>Standard selections</p>
              <p><strong>Base Price</strong></p>
              <button class="btn btn-outline">Select</button>
            </div>
          </div>
          <div class="card config-option-card active">
            <div class="card-body">
              <h3>Desert Ridge Premium</h3>
              <p>Upgraded finishes tailored to Desert Ridge subdivision</p>
              <p><strong>+$18,000</strong></p>
              <ul style="font-size: 0.875rem; margin-top: 1rem;">
                <li>Andersen 400 Series Windows</li>
                <li>GAF Timberline HDZ Roofing</li>
                <li>Hardie Plank Siding</li>
              </ul>
              <button class="btn btn-primary">Selected</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Upgrades -->
      <div class="config-panel hidden" data-panel="upgrades">
        <h2>Additional Upgrades</h2>
        <p style="margin-bottom: 2rem;">
          Optional upgrades beyond your package
        </p>
        <div class="upgrade-list">
          <label class="upgrade-item">
            <input type="checkbox" checked>
            <div>
              <h4>Seismic Strapping</h4>
              <p>Recommended for this template • <strong>+$850</strong></p>
              <p style="font-size: 0.875rem; color: var(--color-text-secondary);">
                💡 78% of Sedona builders choose this
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
  
  <div class="config-footer">
    <button class="btn btn-outline">Cancel</button>
    <button class="btn btn-primary">Save Build</button>
  </div>
</section>
```

**ProjectManager Integration**:
```javascript
// In build-configurator.js

// 1. When user clicks "Start New Build"
async handleStartBuild(templateId) {
  // Prompt for build details
  const buildInfo = await this.promptBuildInfo();
  
  // Create project
  this.project = await projectManager.createProject({
    name: buildInfo.name || await projectManager.generateProjectName('template', {
      subdivision: buildInfo.subdivision,
      lotNumber: buildInfo.lotNumber
    }),
    type: 'template',
    source: {
      templateId,
      variantId: null, // Selected later
      subdivision: buildInfo.subdivision,
      lotNumber: buildInfo.lotNumber
    }
  });
  
  // Add delivery location
  if (buildInfo.deliveryLocation) {
    this.project.deliveryLocation = buildInfo.deliveryLocation;
    await projectManager.saveProject(this.project);
  }
}

// 2. When user selects variant
async handleVariantSelection(variantId) {
  this.project.source.variantId = variantId;
  await projectManager.saveProject(this.project);
}

// 3. When user selects package
async handlePackageSelection(packageId) {
  const packageData = this.getPackageData(packageId);
  
  await projectManager.updateConfiguration(this.project.id, {
    selectionPackage: {
      id: packageId,
      name: packageData.name,
      subdivisionSpecific: packageData.subdivisionSpecific,
      selections: packageData.selections,
      addedCost: packageData.addedCost
    }
  });
}

// 4. When user adds upgrades
async handleUpgradeToggle(upgradeId, checked) {
  const currentUpgrades = this.project.configuration.additionalUpgrades || [];
  
  const upgrades = checked
    ? [...currentUpgrades, upgradeId]
    : currentUpgrades.filter(id => id !== upgradeId);
  
  await projectManager.updateConfiguration(this.project.id, {
    additionalUpgrades: upgrades
  });
}

// 5. When user clicks "Save Build"
async handleSaveBuild() {
  // Mark as configured
  await projectManager.updateStatus(this.project.id, 'configured');
  
  // Redirect to dashboard
  window.location.href = '/pages/dashboard.html?view=builds&success=build-saved';
}
```

---

## User Flow 2: Ordering Materials for an Existing Build

**Steps**:

1. **My Builds Dashboard**: Sarah sees list of active builds
2. Clicks **"Order Materials"** on a specific build
3. **Phase Selection Modal**: Choose which phases to order

```javascript
// In builds-dashboard.js

async handleOrderMaterials(buildId) {
  const project = await projectManager.getProject(buildId);
  
  // Show modal with phase selection
  const selectedPhases = await this.showPhaseSelectionModal(project);
  
  if (selectedPhases.length === 0) return;
  
  // Generate BOM for selected phases
  const bom = await templateBuilder.generateBOM({
    ...project,
    selectedPhases
  });
  
  // Store BOM temporarily
  sessionStorage.setItem('current_bom', JSON.stringify({
    buildId,
    phases: selectedPhases,
    bom
  }));
  
  // Navigate to BOM review
  window.location.href = '/pages/bom-review.html';
}
```

4. **BOM Review Page** (`pages/bom-review.html`):
   - Uses existing `.simple-list-*` components
   - Grouped by phase and category
   - Edit quantities, remove items
   - Add to cart

```html
<section class="section">
  <div class="container" style="max-width: 1200px;">
    <div class="breadcrumbs">
      <a href="dashboard.html">Dashboard</a>
      <span>›</span>
      <a href="dashboard.html?view=builds">My Builds</a>
      <span>›</span>
      <span>Review Materials</span>
    </div>
    
    <div class="simple-list-header">
      <h1>Review Materials</h1>
      <p>Desert Ridge Lot 12 - The Sedona (Bonus)</p>
      <p>Phases: Envelope, Interior Finish</p>
    </div>
    
    <div class="simple-list-table">
      <!-- Phase: Envelope -->
      <div class="bundle-group-section">
        <div class="bundle-group-header">
          <h2>📦 Envelope</h2>
          <p>Estimated: $62,000 • 182 items</p>
        </div>
        
        <div class="bundle-group-categories">
          <!-- Category: Windows -->
          <div class="bundle-category-section">
            <button class="category-toggle" aria-expanded="true">
              <span>Windows</span>
              <svg class="chevron">...</svg>
            </button>
            
            <div class="category-items">
              <div class="simple-list-items">
                <div class="simple-list-row">
                  <div class="simple-list-col-item">
                    <img src="/images/products/window.png" alt="">
                    <div>
                      <h4>Andersen 400 Series Double Hung 36x60</h4>
                      <p>SKU: WIN-ANDER-3660</p>
                    </div>
                  </div>
                  <div class="simple-list-col-qty">
                    <div class="simple-qty-controls">
                      <button>-</button>
                      <input type="number" value="18">
                      <button>+</button>
                    </div>
                  </div>
                  <div class="simple-list-col-price">$425.00</div>
                  <div class="simple-list-col-total">$7,650</div>
                  <div class="simple-list-col-actions">
                    <button class="simple-remove-btn" aria-label="Remove">
                      <svg>...</svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="simple-list-footer">
      <div>
        <p><strong>Total: $111,000</strong></p>
        <p>425 items across 2 phases</p>
      </div>
      <div>
        <button class="btn btn-outline">Back to Build</button>
        <button class="btn btn-primary">Add to Cart</button>
      </div>
    </div>
  </div>
</section>
```

**Add to Cart Integration**:
```javascript
// In bom-review.js

async handleAddToCart() {
  const bomData = JSON.parse(sessionStorage.getItem('current_bom'));
  
  // Add each item to cart
  for (const phase of bomData.bom.phases) {
    for (const product of phase.products) {
      await addToCart(product.sku, product.quantity);
    }
  }
  
  // Navigate to cart
  window.location.href = '/pages/cart.html?from=bom&buildId=' + bomData.buildId;
}

// After checkout (in cart.js)
async handleCheckoutComplete(orderId, totalCost) {
  const buildId = new URLSearchParams(window.location.search).get('buildId');
  
  if (buildId) {
    // Associate order with build
    await projectManager.addOrder(buildId, {
      orderId,
      totalCost,
      items: cartItems.length
    });
    
    // Mark phases as ordered
    const bomData = JSON.parse(sessionStorage.getItem('current_bom'));
    const project = await projectManager.getProject(buildId);
    project.phasesOrdered = [
      ...(project.phasesOrdered || []),
      ...bomData.phases
    ];
    await projectManager.saveProject(project);
  }
}
```

---

## User Flow 3: Reusing Configurations

**Steps**:

1. **Build Detail Page**: Sarah views an existing build
2. Clicks **"Clone Build"** button
3. System creates new build with same configuration
4. Sarah updates build name, lot number, delivery address
5. Ready to order in minutes!

```javascript
// In build-detail.js

async handleCloneBuild(buildId) {
  const original = await projectManager.getProject(buildId);
  
  // Clone the build
  const clone = await projectManager.createProject({
    name: `${original.name} (Copy)`,
    type: 'template',
    source: { ...original.source },
    configuration: { ...original.configuration }
  });
  
  // Prompt for updates
  const updates = await this.promptCloneUpdates(clone);
  
  // Update clone
  clone.name = updates.name;
  clone.source.lotNumber = updates.lotNumber;
  clone.deliveryLocation = updates.deliveryLocation;
  await projectManager.saveProject(clone);
  
  // Navigate to new build
  window.location.href = `/pages/build-detail.html?id=${clone.id}`;
}
```

---

## Dashboard Design

### Landing Page

**Purpose**: Navigation hub (not content overload)

**HTML Structure**:
```html
<section class="section">
  <div class="container" style="max-width: 1200px;">
    <h1 style="margin-bottom: 2rem;">My Builds Dashboard</h1>
    
    <!-- Sales Rep Info -->
    <div class="card" style="margin-bottom: 2rem; background: var(--color-brand-50);">
      <div class="card-body">
        <p style="margin: 0;">
          <strong>Your Account Manager:</strong> John Smith • 
          555-0123 • john.smith@buildright.com
        </p>
      </div>
    </div>
    
    <!-- Quick Actions: Reuse .grid .grid-3 -->
    <div class="grid grid-3" style="margin-bottom: 3rem;">
      <!-- Deliveries Card -->
      <div class="card">
        <div class="card-header">
          <h3>📦 Deliveries This Week</h3>
        </div>
        <div class="card-body">
          <p><strong>3 deliveries</strong> scheduled</p>
          <p style="font-size: 0.875rem;">
            Tomorrow: Lot 15 - Framing
          </p>
        </div>
        <div class="card-footer">
          <a href="deliveries.html" class="btn btn-outline btn-sm">View Schedule</a>
        </div>
      </div>
      
      <!-- Orders Card -->
      <div class="card">
        <div class="card-header">
          <h3>🛒 Recent Orders</h3>
        </div>
        <div class="card-body">
          <p><strong>2 orders</strong> this week</p>
          <p style="font-size: 0.875rem;">
            #1234 - Delivered ✓
          </p>
        </div>
        <div class="card-footer">
          <a href="orders.html" class="btn btn-outline btn-sm">View All Orders</a>
        </div>
      </div>
      
      <!-- Builds Card -->
      <div class="card">
        <div class="card-header">
          <h3>🏗️ My Builds</h3>
        </div>
        <div class="card-body">
          <p><strong>8 builds</strong> active</p>
          <p style="font-size: 0.875rem;">
            Track materials ordered per build
          </p>
        </div>
        <div class="card-footer">
          <a href="?view=builds" class="btn btn-outline btn-sm">View All Builds</a>
        </div>
      </div>
    </div>
    
    <!-- Primary CTA -->
    <div style="text-align: center;">
      <a href="templates.html" class="btn btn-primary btn-lg">
        + Order Materials for New Build
      </a>
    </div>
  </div>
</section>
```

**ProjectManager Integration**:
```javascript
// In dashboard.js

async loadDashboard() {
  const projects = await projectManager.getProjectsByType('template');
  
  // Count active builds
  const activeBuilds = projects.filter(p => 
    p.status === 'active' || p.status === 'ordered'
  );
  document.querySelector('.builds-count').textContent = activeBuilds.length;
  
  // Get deliveries this week (from orders)
  const thisWeekDeliveries = this.getDeliveriesThisWeek(projects);
  document.querySelector('.deliveries-count').textContent = thisWeekDeliveries.length;
  
  // Get recent orders
  const recentOrders = this.getRecentOrders(projects);
  document.querySelector('.orders-count').textContent = recentOrders.length;
}
```

---

## Key UX Wins

✅ **Clean, uncluttered**: Multi-screen approach, focused content per screen  
✅ **Materials-focused**: No construction management features (out of scope)  
✅ **Smart recommendations**: Template-contextual, data-driven suggestions  
✅ **Delivery tracking**: BuildRight's responsibility, highly visible  
✅ **Reusability**: Copy proven configurations, order in minutes  
✅ **Sales rep integration**: Contact info readily available  
✅ **Multi-phase ordering**: Order what you need now, rest later  
✅ **Zero new CSS**: All components reused from existing design system

---

## Next Steps

**→ [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)** - Marcus, Lisa, David flows  
**→ [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)** - Tasks & timeline

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

