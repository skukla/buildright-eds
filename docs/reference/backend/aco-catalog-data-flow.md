# ACO Catalog Architecture: Multi-Persona Implementation

**📊 Document Type**: Technical Architecture Specification  
**📖 Reading Time**: 25-30 minutes  
**👥 Audience**: Developers, architects, ACO specialists  
**⚠️ Critical**: This defines how ACO catalogs, categories, policies, and views work for multi-persona

---

## Executive Summary

**Question**: How does the unified catalog work across 5 different personas?

**Answer**: **Hybrid Approach** combining ACO features with EDS UI adaptation:

```
┌─────────────────────────────────────────────────────────────┐
│                    ACO LAYER (Backend)                      │
├─────────────────────────────────────────────────────────────┤
│ ✅ ONE Catalog: "BuildRight Materials"                      │
│ ✅ ONE Category Structure: Universal (6 main categories)    │
│ ✅ MULTIPLE Catalog Views: 5 views (one per persona)        │
│ ✅ MULTIPLE Policies: Per customer group + attributes       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  EDS UI LAYER (Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│ ✅ DIFFERENT Top Nav: Adapted per persona                   │
│ ✅ DIFFERENT Category Display: Reorganized per persona      │
│ ✅ DIFFERENT Filters: Persona-specific defaults             │
│ ✅ Runtime Filtering: Based on persona context              │
└─────────────────────────────────────────────────────────────┘
```

**Recommendation**: **Option 3** - Different top nav + SKUs via policies + views per persona

---

## Understanding ACO Components

### 1. Catalog (Container)
**What it is**: The root container for all products in ACO

**Our Approach**: **ONE catalog** for BuildRight
```
Catalog: "BuildRight Materials Catalog"
├── ID: buildright-materials
├── Products: ~500-600 SKUs (all products)
└── Shared by: All 5 personas
```

**Why ONE**: 
- Reflects real business (one inventory)
- Easier to maintain
- Products can be reused across personas

---

### 2. Categories (Organization)
**What it is**: Hierarchical structure for organizing products within a catalog

**Our Approach**: **ONE universal category structure** that works for all personas

**Category Tree**:
```
BuildRight Materials Catalog
├── Lumber & Building Materials
│   ├── Dimensional Lumber
│   ├── Engineered Lumber
│   ├── Sheet Goods
│   └── Specialty Lumber
│
├── Doors & Windows
│   ├── Windows
│   ├── Entry Doors
│   ├── Patio Doors
│   └── Garage Doors
│
├── Roofing & Siding
│   ├── Roofing
│   ├── Siding
│   └── Trim
│
├── Framing & Drywall
│   ├── Framing Hardware
│   ├── Fasteners
│   ├── Insulation
│   └── Drywall
│
├── Interior Finishes
│   ├── Flooring
│   ├── Paint
│   ├── Lighting
│   └── Plumbing Fixtures
│
└── Hardware & Tools
    ├── Fasteners
    ├── Power Tools
    ├── Hand Tools
    └── Safety Equipment
```

**Why Universal**: 
- Traditional building supply categories
- Makes sense across personas
- Allows for cross-persona browsing
- Standard industry terminology

**Key Insight**: Categories are the **same**, but the **UI presentation** will differ per persona.

---

### 3. Catalog Views (ACO Feature)
**What it is**: Different "lenses" for viewing the same catalog, with different:
- Product visibility rules
- Category visibility
- Sort orders
- Default filters

**Our Approach**: **FIVE catalog views** (one per persona)

#### View 1: Production Builder View (Sarah)
```json
{
  "id": "production-builder-view",
  "name": "Production Builder Catalog View",
  "catalogId": "buildright-materials",
  "customerGroups": ["Commercial-Tier2", "Production-Builder"],
  
  "visibilityRules": {
    "includeAttributes": {
      "construction_phase": ["foundation_framing", "envelope", "interior_finish"]
    },
    "excludeAttributes": {
      "project_type": ["fence", "shed"]  // Sarah doesn't build these
    }
  },
  
  "defaultFilters": {
    "construction_phase": "envelope"  // Default to most common phase
  },
  
  "categoryVisibility": {
    // Hide categories irrelevant to house construction
    "hardware_tools": false,  // Sarah doesn't buy tools
    "specialty_lumber": false  // Rarely needed
  },
  
  "defaultSort": "selection_category"
}
```

**Result for Sarah**:
- Sees ~150-200 SKUs (house building materials only)
- Categories: All except Hardware & Tools
- Default view: Organized by construction phase

#### View 2: General Contractor View (Marcus)
```json
{
  "id": "general-contractor-view",
  "name": "General Contractor Catalog View",
  "catalogId": "buildright-materials",
  "customerGroups": ["Residential-Builder"],
  
  "visibilityRules": {
    "includeAttributes": {
      "construction_phase": ["foundation_framing", "envelope", "interior_finish"]
    }
  },
  
  "defaultFilters": {
    "quality_tier": "professional"  // Marcus's typical tier
  },
  
  "categoryVisibility": {
    // Show all categories
  },
  
  "defaultSort": "category"
}
```

**Result for Marcus**:
- Sees ~300-400 SKUs (all construction materials)
- Categories: All categories visible
- Default view: Traditional categories

#### View 3: Remodeling Contractor View (Lisa)
```json
{
  "id": "remodeling-contractor-view",
  "name": "Remodeling Contractor Catalog View",
  "catalogId": "buildright-materials",
  "customerGroups": ["Pro-Specialty"],
  
  "visibilityRules": {
    "includeAttributes": {
      "room_category": ["bathroom", "kitchen", "flooring", "fixtures"]
    },
    "excludeAttributes": {
      "construction_phase": ["foundation_framing"]  // No structural work
    }
  },
  
  "defaultFilters": {
    "package_tier": "better"  // Lisa's typical tier
  },
  
  "categoryVisibility": {
    // Hide structural categories
    "lumber_building_materials": false,
    "framing_drywall": {
      "framing_hardware": false,
      "fasteners": false,
      "insulation": false
      // Keep drywall visible (for repairs)
    }
  },
  
  "defaultSort": "room_category"
}
```

**Result for Lisa**:
- Sees ~200-250 SKUs (finish materials only)
- Categories: Interior Finishes, some Doors & Windows
- Default view: Organized by room

#### View 4: DIY Homeowner View (David)
```json
{
  "id": "diy-homeowner-view",
  "name": "DIY Homeowner Catalog View",
  "catalogId": "buildright-materials",
  "customerGroups": ["Retail-Homeowner"],
  
  "visibilityRules": {
    "includeAttributes": {
      "project_type": ["deck", "fence", "patio", "general"]
    },
    "includeOnlyIfAttribute": {
      "diy_friendly": true  // Only show DIY-appropriate products
    }
  },
  
  "defaultFilters": {
    "project_type": "deck"  // David's most common project
  },
  
  "categoryVisibility": {
    // Show simplified categories
    "lumber_building_materials": {
      "dimensional_lumber": true,
      "specialty_lumber": true,
      "engineered_lumber": false  // Too advanced for DIY
    },
    "roofing_siding": false,  // David doesn't do roofing
    "framing_drywall": {
      "fasteners": true,
      "others": false
    }
  },
  
  "defaultSort": "project_type"
}
```

**Result for David**:
- Sees ~100-150 SKUs (DIY-friendly only)
- Categories: Simplified subset
- Default view: Organized by project type

#### View 5: Store Manager View (Kevin)
```json
{
  "id": "store-manager-view",
  "name": "Store Manager Catalog View",
  "catalogId": "buildright-materials",
  "customerGroups": ["Retail-Chain-Buyer"],
  
  "visibilityRules": {
    // No restrictions - Kevin sees everything
  },
  
  "defaultFilters": {
    "store_velocity_category": "high",
    "restock_priority": "critical"
  },
  
  "categoryVisibility": {
    // Show all categories
  },
  
  "defaultSort": "store_velocity_category"
}
```

**Result for Kevin**:
- Sees ~500-600 SKUs (everything in catalog)
- Categories: All categories
- Default view: Organized by velocity, not category

---

### 4. Policies (Product Visibility Rules)
**What it is**: ACO rules that dynamically control which products are visible/purchasable based on context

**Our Approach**: **Attribute-based policies** per customer group

#### Policy 1: Construction Phase Access
```json
{
  "policyId": "construction-phase-access",
  "name": "Control product visibility by construction phase",
  "applies_to": ["Commercial-Tier2", "Residential-Builder", "Pro-Specialty"],
  
  "rules": [
    {
      "condition": "customerGroup == 'Commercial-Tier2' AND construction_phase IN ['foundation_framing', 'envelope', 'interior_finish']",
      "action": "SHOW"
    },
    {
      "condition": "customerGroup == 'Residential-Builder' AND construction_phase IN ['foundation_framing', 'envelope', 'interior_finish']",
      "action": "SHOW"
    },
    {
      "condition": "customerGroup == 'Pro-Specialty' AND construction_phase == 'foundation_framing'",
      "action": "HIDE"  // Lisa doesn't do structural work
    }
  ]
}
```

#### Policy 2: Quality Tier Pricing
```json
{
  "policyId": "quality-tier-pricing",
  "name": "Apply pricing based on quality tier and customer group",
  "applies_to": ["ALL"],
  
  "rules": [
    {
      "condition": "customerGroup == 'Commercial-Tier2' AND quality_tier == 'professional'",
      "action": "APPLY_PRICE_MODIFIER",
      "modifier": 0.95  // 5% discount
    },
    {
      "condition": "customerGroup == 'Residential-Builder' AND quality_tier IN ['professional', 'premium']",
      "action": "APPLY_PRICE_MODIFIER",
      "modifier": 0.97  // 3% discount
    }
  ]
}
```

#### Policy 3: Package Tier Bundling
```json
{
  "policyId": "package-tier-bundling",
  "name": "Control which products appear in which package tiers",
  "applies_to": ["Commercial-Tier2", "Pro-Specialty"],
  
  "rules": [
    {
      "condition": "package_tier == 'good'",
      "action": "TAG_AS_AVAILABLE_IN_PACKAGE",
      "package": "builders-choice"
    },
    {
      "condition": "package_tier IN ['better', 'best']",
      "action": "TAG_AS_AVAILABLE_IN_PACKAGE",
      "package": "desert-ridge-premium"
    }
  ]
}
```

#### Policy 4: DIY Safety Restrictions
```json
{
  "policyId": "diy-safety-restrictions",
  "name": "Hide professional-grade or dangerous products from DIY users",
  "applies_to": ["Retail-Homeowner"],
  
  "rules": [
    {
      "condition": "customerGroup == 'Retail-Homeowner' AND diy_friendly == false",
      "action": "HIDE"
    },
    {
      "condition": "customerGroup == 'Retail-Homeowner' AND requires_license == true",
      "action": "HIDE"
    }
  ]
}
```

---

### 5. Top Navigation (EDS UI Layer)
**What it is**: The main navigation menu in buildright-eds

**Our Approach**: **Persona-specific navigation** that adapts based on logged-in user

#### Sarah's Top Nav
```html
<!-- Header for Sarah Martinez (Production Builder) -->
<header class="header">
  <nav class="main-nav">
    <a href="/pages/dashboard.html">Dashboard</a>
    <a href="/pages/templates.html">House Templates</a>
    <a href="/pages/my-builds.html">My Builds</a>
    <a href="/pages/catalog.html?view=phase&phase=envelope">Materials Catalog</a>
    <a href="/pages/order-history.html">Orders & Deliveries</a>
  </nav>
</header>
```

**Key Differences**:
- "House Templates" (not "Catalog")
- "My Builds" (project management)
- "Materials Catalog" links to phase-filtered view

#### Marcus's Top Nav
```html
<!-- Header for Marcus Johnson (General Contractor) -->
<header class="header">
  <nav class="main-nav">
    <a href="/pages/dashboard.html">Dashboard</a>
    <a href="/pages/project-wizard.html">Project Wizard</a>
    <a href="/pages/catalog.html">Catalog</a>
    <a href="/pages/my-jobs.html">My Jobs</a>
    <a href="/pages/order-history.html">Order History</a>
  </nav>
</header>
```

**Key Differences**:
- "Project Wizard" (custom BOM generation)
- "My Jobs" (not "My Builds")
- Traditional "Catalog" link

#### Lisa's Top Nav
```html
<!-- Header for Lisa Chen (Remodeling Contractor) -->
<header class="header">
  <nav class="main-nav">
    <a href="/pages/dashboard.html">Dashboard</a>
    <a href="/pages/packages.html">Remodel Packages</a>
    <a href="/pages/catalog.html?view=room">Materials Catalog</a>
    <a href="/pages/my-projects.html">My Projects</a>
    <a href="/pages/quotes.html">Quotes</a>
  </nav>
</header>
```

**Key Differences**:
- "Remodel Packages" (Good/Better/Best)
- "Materials Catalog" links to room-filtered view
- "Quotes" (for client sharing)

#### David's Top Nav
```html
<!-- Header for David Thompson (DIY Homeowner) -->
<header class="header">
  <nav class="main-nav">
    <a href="/pages/dashboard.html">My Projects</a>
    <a href="/pages/deck-builder.html">Deck Builder</a>
    <a href="/pages/catalog.html?diy=true">Shop Materials</a>
    <a href="/pages/how-to-guides.html">How-To Guides</a>
    <a href="/pages/order-history.html">My Orders</a>
  </nav>
</header>
```

**Key Differences**:
- "Deck Builder" (guided wizard)
- "Shop Materials" (friendly language)
- "How-To Guides" (educational content)

#### Kevin's Top Nav
```html
<!-- Header for Kevin Rodriguez (Store Manager) -->
<header class="header">
  <nav class="main-nav">
    <a href="/pages/dashboard.html">Restock Dashboard</a>
    <a href="/pages/catalog.html?view=velocity">Inventory</a>
    <a href="/pages/analytics.html">Sales Analytics</a>
    <a href="/pages/orders.html">Purchase Orders</a>
  </nav>
</header>
```

**Key Differences**:
- "Restock Dashboard" (operational focus)
- "Inventory" links to velocity-sorted view
- "Sales Analytics" (store management)

---

## Implementation: The Three Options Explained

### Option 1: Same Categories AND Same Catalog View ❌
**Not Recommended**

```
ACO:
├── ONE Catalog
├── ONE Category Structure
└── ONE Catalog View (shared by all)

EDS:
├── SAME Top Nav (all personas)
├── SAME Category Display
└── Only difference: Client-side filtering in browser
```

**Why NOT**:
- Doesn't leverage ACO's catalog view feature
- Forces all personas to use same navigation
- Suboptimal UX (everyone sees everything, just filtered)
- Misses opportunity to showcase ACO capabilities

---

### Option 2: Same Catalog Structure BUT Different Views + Policies ⚠️
**Partial Solution**

```
ACO:
├── ONE Catalog
├── ONE Category Structure
├── MULTIPLE Catalog Views (per persona)
└── MULTIPLE Policies (per customer group)

EDS:
├── SAME Top Nav (all personas)
├── SAME Category Display
└── Different products shown via ACO policies
```

**Why PARTIAL**:
✅ Leverages ACO catalog views  
✅ Uses ACO policies for product visibility  
❌ Top nav is still generic (not persona-optimized)  
❌ Category display doesn't adapt (shows same categories to everyone)

**Use Case**: If you want to minimize EDS changes and rely heavily on ACO

---

### Option 3: Different Top Nav + SKUs via Policies + Views ✅
**RECOMMENDED**

```
ACO:
├── ONE Catalog
├── ONE Category Structure
├── MULTIPLE Catalog Views (5 views, one per persona)
└── MULTIPLE Policies (attribute-based rules)

EDS:
├── DIFFERENT Top Nav (adapted per persona)
├── DIFFERENT Category Display (reorganized per persona)
├── DIFFERENT Filters (persona-specific defaults)
└── Runtime Filtering (based on persona context)
```

**Why RECOMMENDED**:
✅ **Best of both worlds**: ACO power + EDS flexibility  
✅ **Optimal UX**: Each persona gets tailored experience  
✅ **Showcases ACO**: Catalog views, policies, attribute filtering  
✅ **Showcases EDS**: Dynamic UI adaptation, personalization  
✅ **Realistic**: Real apps adapt UI to user type  
✅ **Demo Impact**: "Watch how the experience transforms per persona"

---

## Option 3 Implementation Details

### Layer 1: ACO Configuration

**Step 1: Create ONE Catalog**
```bash
# In buildright-aco
npm run ingest:catalog
```

**Catalog Definition**:
```json
{
  "id": "buildright-materials",
  "name": "BuildRight Materials Catalog",
  "description": "Complete building materials catalog for all customer types",
  "defaultView": "general-contractor-view"
}
```

**Step 2: Define Category Structure**
```javascript
// scripts/config/categories.js
export const CATEGORIES = {
  lumber_building_materials: {
    id: 'lumber_building_materials',
    name: 'Lumber & Building Materials',
    subcategories: ['dimensional_lumber', 'engineered_lumber', 'sheet_goods', 'specialty_lumber']
  },
  // ... 5 more main categories
};
```

**Step 3: Create 5 Catalog Views**
```bash
# In buildright-aco
npm run create:catalog-views
```

**Step 4: Define Policies**
```javascript
// scripts/config/policies.js
export const POLICIES = [
  {
    id: 'construction-phase-access',
    rules: [/* ... */]
  },
  {
    id: 'quality-tier-pricing',
    rules: [/* ... */]
  },
  // ... more policies
];
```

**Step 5: Tag All Products**
```javascript
// scripts/config/product-definitions.js
{
  sku: 'WIN-ANDER-400-3660',
  // ... basic info
  attributes: {
    construction_phase: ['envelope'],
    quality_tier: 'premium',
    package_tier: ['better', 'best'],
    selection_category: 'windows',
    room_category: 'windows',
    project_type: ['general'],
    diy_friendly: false,
    store_velocity_category: 'medium',
    // ... 15-20 total attributes
  }
}
```

---

### Layer 2: EDS UI Adaptation

**Step 1: Detect Persona**
```javascript
// scripts/auth.js
export function getPersona() {
  const user = getCurrentUser();
  return PERSONAS[user.personaId]; // sarah, marcus, lisa, david, kevin
}
```

**Step 2: Adapt Header**
```javascript
// blocks/header/header.js
export function decorateHeader(block) {
  const persona = getPersona();
  const navConfig = PERSONA_NAV_CONFIG[persona.id];
  
  const nav = document.createElement('nav');
  navConfig.items.forEach(item => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    nav.appendChild(link);
  });
  
  block.appendChild(nav);
}
```

**Nav Configuration**:
```javascript
// scripts/persona-config.js
export const PERSONA_NAV_CONFIG = {
  sarah: {
    items: [
      { label: 'Dashboard', href: '/pages/dashboard.html' },
      { label: 'House Templates', href: '/pages/templates.html' },
      { label: 'My Builds', href: '/pages/my-builds.html' },
      { label: 'Materials Catalog', href: '/pages/catalog.html?view=phase&phase=envelope' },
      { label: 'Orders & Deliveries', href: '/pages/order-history.html' }
    ]
  },
  marcus: {
    items: [
      { label: 'Dashboard', href: '/pages/dashboard.html' },
      { label: 'Project Wizard', href: '/pages/project-wizard.html' },
      { label: 'Catalog', href: '/pages/catalog.html' },
      { label: 'My Jobs', href: '/pages/my-jobs.html' },
      { label: 'Order History', href: '/pages/order-history.html' }
    ]
  },
  // ... lisa, david, kevin
};
```

**Step 3: Adapt Catalog View**
```javascript
// scripts/catalog.js
async function loadCatalog() {
  const persona = getPersona();
  const config = PERSONA_CATALOG_CONFIG[persona.id];
  
  // Get catalog view ID from persona config
  const catalogViewId = config.catalogViewId; // e.g., 'production-builder-view'
  
  // Fetch products from ACO using this catalog view
  const products = await fetchProductsFromACO({
    catalogViewId,
    filters: config.defaultFilters,
    sort: config.defaultSort
  });
  
  // Render using persona-specific layout
  if (config.layout === 'by-phase') {
    renderByPhase(products);
  } else if (config.layout === 'by-room') {
    renderByRoom(products);
  } else if (config.layout === 'by-category') {
    renderByCategory(products);
  } else if (config.layout === 'by-velocity') {
    renderByVelocity(products);
  }
}
```

**Catalog Configuration**:
```javascript
// scripts/persona-config.js
export const PERSONA_CATALOG_CONFIG = {
  sarah: {
    catalogViewId: 'production-builder-view',
    layout: 'by-phase',
    defaultFilters: { construction_phase: 'envelope' },
    defaultSort: 'selection_category',
    showFilters: ['construction_phase', 'package_tier', 'selection_category']
  },
  marcus: {
    catalogViewId: 'general-contractor-view',
    layout: 'by-category',
    defaultFilters: { quality_tier: 'professional' },
    defaultSort: 'category',
    showFilters: ['construction_phase', 'quality_tier', 'category']
  },
  lisa: {
    catalogViewId: 'remodeling-contractor-view',
    layout: 'by-room',
    defaultFilters: { package_tier: 'better' },
    defaultSort: 'room_category',
    showFilters: ['room_category', 'package_tier', 'quality_tier']
  },
  david: {
    catalogViewId: 'diy-homeowner-view',
    layout: 'by-project',
    defaultFilters: { project_type: 'deck' },
    defaultSort: 'project_type',
    showFilters: ['project_type', 'diy_friendly']
  },
  kevin: {
    catalogViewId: 'store-manager-view',
    layout: 'by-velocity',
    defaultFilters: { restock_priority: 'critical' },
    defaultSort: 'store_velocity_category',
    showFilters: ['store_velocity_category', 'restock_priority', 'department']
  }
};
```

**Step 4: Render Persona-Specific Category Views**

**Sarah's View** (By Construction Phase):
```javascript
function renderByPhase(products) {
  const phases = ['foundation_framing', 'envelope', 'interior_finish'];
  
  phases.forEach(phase => {
    const phaseProducts = products.filter(p => p.attributes.construction_phase.includes(phase));
    
    const section = document.createElement('section');
    section.innerHTML = `
      <h2>${formatPhaseName(phase)}</h2>
      <div class="product-grid">
        ${phaseProducts.map(p => renderProductCard(p)).join('')}
      </div>
    `;
    
    container.appendChild(section);
  });
}
```

**Lisa's View** (By Room):
```javascript
function renderByRoom(products) {
  const rooms = ['bathroom', 'kitchen', 'flooring', 'fixtures'];
  
  rooms.forEach(room => {
    const roomProducts = products.filter(p => p.attributes.room_category === room);
    
    const section = document.createElement('section');
    section.innerHTML = `
      <h2>${formatRoomName(room)}</h2>
      <p>Products for ${room} remodels</p>
      <div class="product-grid">
        ${roomProducts.map(p => renderProductCard(p)).join('')}
      </div>
    `;
    
    container.appendChild(section);
  });
}
```

---

## Visual Comparison: What Each Persona Sees

### Sarah's Catalog Experience
```
┌──────────────────────────────────────────────────────┐
│ 🏠 BuildRight Materials                              │
│ [Dashboard] [House Templates] [My Builds] [Catalog]  │
└──────────────────────────────────────────────────────┘

Materials Catalog › Envelope Phase

Filters:
☑ Construction Phase: Envelope
☑ Package Tier: Desert Ridge Premium

═══════════════════════════════════════════════════════
WINDOWS (12 products)
─────────────────────────────────────────────────────
[Card] Andersen 400 Series     [Card] Pella Architect
       Double-Hung                     Casement
       $850                            $920
─────────────────────────────────────────────────────

DOORS (8 products)
─────────────────────────────────────────────────────
[Card] Therma-Tru Entry        [Card] Andersen Gliding
       Smooth Star                     Patio Door
       $1,240                          $2,100
─────────────────────────────────────────────────────

ROOFING (10 products)
SIDING (12 products)
```

### Marcus's Catalog Experience
```
┌──────────────────────────────────────────────────────┐
│ 🏠 BuildRight Materials                              │
│ [Dashboard] [Project Wizard] [Catalog] [My Jobs]     │
└──────────────────────────────────────────────────────┘

Catalog › All Materials

Filters:
☑ Quality Tier: Professional
☐ Construction Phase: All

═══════════════════════════════════════════════════════
LUMBER & BUILDING MATERIALS (45 products)
─────────────────────────────────────────────────────
› Dimensional Lumber (18)
› Engineered Lumber (12)
› Sheet Goods (15)
─────────────────────────────────────────────────────

DOORS & WINDOWS (32 products)
─────────────────────────────────────────────────────
› Windows (12)
› Entry Doors (8)
› Patio Doors (6)
› Garage Doors (6)
─────────────────────────────────────────────────────

ROOFING & SIDING (28 products)
FRAMING & DRYWALL (34 products)
```

### Lisa's Catalog Experience
```
┌──────────────────────────────────────────────────────┐
│ 🏠 BuildRight Materials                              │
│ [Dashboard] [Packages] [Materials] [Projects]        │
└──────────────────────────────────────────────────────┘

Materials Catalog › By Room

Filters:
☑ Package Tier: Better
☑ Room: Bathroom

═══════════════════════════════════════════════════════
BATHROOM REMODEL MATERIALS
─────────────────────────────────────────────────────
Vanities (6 products)
[Card] 36" Vanity - Oak        [Card] 48" Vanity - Walnut
       $850                            $1,200
       [Upgrade to $1,200]             [Upgrade to $1,650]
─────────────────────────────────────────────────────

Toilets (4 products)
Tubs & Showers (8 products)
Tile & Flooring (10 products)
Fixtures (7 products)
```

---

## Summary Table: The Three Options

| Aspect | Option 1 (Same Everything) | Option 2 (ACO Only) | Option 3 (Hybrid) ✅ |
|--------|---------------------------|---------------------|----------------------|
| **ACO Catalog** | ✅ ONE | ✅ ONE | ✅ ONE |
| **ACO Categories** | ✅ ONE structure | ✅ ONE structure | ✅ ONE structure |
| **ACO Catalog Views** | ❌ ONE (shared) | ✅ MULTIPLE (5) | ✅ MULTIPLE (5) |
| **ACO Policies** | ⚠️ Basic | ✅ Advanced | ✅ Advanced |
| **EDS Top Nav** | ❌ SAME | ❌ SAME | ✅ DIFFERENT |
| **EDS Category Display** | ❌ SAME | ❌ SAME | ✅ DIFFERENT |
| **EDS Filters** | ⚠️ Client-side only | ⚠️ Generic | ✅ Persona-specific |
| **Product Visibility** | Client-side filter | ACO policies | ACO policies |
| **UX Quality** | ⭐⭐ Generic | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Demo Impact** | ⭐⭐ Low | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ High |
| **Showcases ACO** | ❌ No | ✅ Yes | ✅✅ Best |
| **Showcases EDS** | ❌ No | ⚠️ Partial | ✅✅ Best |
| **Implementation Effort** | Low | Medium | High |
| **Maintenance** | Easy | Medium | Medium |

---

## Recommendation: Option 3 (Hybrid Approach)

### Why This is Best

1. **Showcases Adobe Stack**:
   - ACO: Catalog views, policies, attribute filtering
   - EDS: Dynamic UI, personalization, runtime adaptation

2. **Optimal User Experience**:
   - Each persona gets navigation that makes sense to them
   - Categories organized how they think
   - Only see relevant products

3. **Realistic Implementation**:
   - Real apps adapt UI to user types
   - Real suppliers use policies to control visibility
   - Real systems combine backend + frontend personalization

4. **Demo Impact**:
   - "Watch how Sarah sees materials by construction phase..."
   - "...while Marcus sees the same products by traditional categories"
   - "All from ONE catalog, powered by ACO + EDS"

5. **Scalability**:
   - Add 6th persona: Create catalog view + nav config
   - Add new product: Tag once, appears in all relevant views
   - Update product: Update once, changes everywhere

---

## Implementation Checklist

### Phase 1: ACO Setup (buildright-aco)
- [ ] Define ONE catalog structure
- [ ] Define universal category tree
- [ ] Create attribute schema (15-20 attributes)
- [ ] Tag all products with attributes
- [ ] Create 5 catalog views (one per persona)
- [ ] Define 4-6 policies (visibility, pricing, bundling)
- [ ] Test catalog views return correct products

### Phase 2: EDS Configuration (buildright-eds)
- [ ] Define persona nav configs
- [ ] Define persona catalog configs
- [ ] Update header block to adapt per persona
- [ ] Update catalog page to render persona-specific layouts
- [ ] Create layout renderers (by-phase, by-room, by-category, by-velocity)
- [ ] Test persona switching updates nav + catalog view

### Phase 3: Integration Testing
- [ ] Sarah sees ~150 products, organized by phase
- [ ] Marcus sees ~300 products, organized by category
- [ ] Lisa sees ~200 products, organized by room
- [ ] David sees ~100 products, organized by project
- [ ] Kevin sees ~500 products, organized by velocity
- [ ] Switching personas updates everything instantly

---

## Next Steps

1. **Approve Option 3** as the implementation approach
2. **Begin ACO setup** in buildright-aco
3. **Update persona-config.js** in buildright-eds
4. **Implement header adaptation** first (quick win)
5. **Implement catalog adaptation** (core feature)
6. **Test with all 5 personas**

---

**Status**: ✅ Architecture Documented, Awaiting Approval  
**Recommendation**: **Option 3 - Hybrid Approach**  
**Next Action**: Approve and begin ACO catalog view creation


