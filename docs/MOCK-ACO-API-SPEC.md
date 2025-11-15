# Mock ACO Service Architecture - CORRECTED

**Research Date**: November 15, 2024  
**Purpose**: Design mock Adobe Commerce Optimizer (ACO) service for BuildRight demo  
**Corrections**: Updated to accurately reflect Adobe's Composable Catalog Data Model (CCDM)

This document specifies the architecture for our mock ACO service that will demonstrate Adobe Commerce Optimizer's **Composable Catalog Data Model (CCDM)** capabilities through catalog views, policies, and progressive product filtering.

---

## IMPORTANT CORRECTION

**CCDM = Composable Catalog Data Model** (NOT "Customer-Centric Data Management")

Based on official Adobe Commerce documentation:
- [ACO Overview](https://experienceleague.adobe.com/en/docs/commerce/optimizer/overview)
- [Catalog View Setup](https://experienceleague.adobe.com/en/docs/commerce/optimizer/setup/catalog-view)
- [ACO Product Page](https://business.adobe.com/products/commerce/commerce-optimizer.html)

---

## What is CCDM?

### Composable Catalog Data Model

**CCDM** is Adobe Commerce Optimizer's flexible and scalable catalog data model that:

**1. Separates Product Data from Business Context**
- Product data (SKU, specs, images) is stored centrally
- Business context (pricing, availability, visibility) is defined per catalog view
- Allows same products to appear differently in different contexts

**2. Supports Massive Scale**
- Up to **250 million SKUs** in a single instance
- Up to **30,000 unique price points per SKU**
- Handles complex multi-brand, multi-geography scenarios

**3. Enables Multiple Catalog Views**
- Each **catalog view** represents a product assortment for a specific distribution channel
- Examples: B2B dealers, B2C consumers, regional subsidiaries, trade partners

**4. Uses Policies for Data Access**
- **Policies** are data access actions that determine what content appears where
- Ensures consistency across catalog views and platforms

**5. Ingests from Multiple Sources**
- PIMs (Product Information Management systems)
- ERPs (Enterprise Resource Planning systems)
- Existing commerce platforms
- Flat files

---

## BuildRight's CCDM Implementation

### Core CCDM Concepts for BuildRight

#### 1. Catalog Views (Per Persona)

Each persona gets their own **catalog view**:

```
┌─────────────────────────────────────────────┐
│       Central Product Catalog               │
│       (All 184 BuildRight Products)         │
└──────────────┬──────────────────────────────┘
               │
               ├─→ Catalog View: "Production Builder"
               │   (Sarah's catalog - 156 products)
               │   Policies: Bulk materials, premium tier, template products
               │
               ├─→ Catalog View: "Commercial Contractor"
               │   (Marcus's catalog - 168 products)
               │   Policies: All construction phases, commercial pricing
               │
               ├─→ Catalog View: "Luxury Builder"
               │   (Lisa's catalog - 142 products)
               │   Policies: Premium+ tier, package products, custom options
               │
               ├─→ Catalog View: "Deck Specialist"
               │   (David's catalog - 35 products)
               │   Policies: Outdoor/decking only, triggered by selections
               │
               └─→ Catalog View: "Facilities"
                   (Kevin's catalog - 58 products)
                   Policies: Maintenance supplies, fasteners, basic tier
```

#### 2. Policies (Filtering Rules)

**Policies** determine which products appear in each catalog view:

**Policy Types:**
- **Category Policies** - Which product categories are visible
- **Tier Policies** - Which product tiers are accessible (basic, standard, premium, luxury)
- **Pricing Policies** - Which price book applies
- **Feature Policies** - Which special features are enabled (bulk pricing, custom orders, etc.)

**Example Policy for Sarah's Catalog View**:
```javascript
{
  catalogView: 'production-builder',
  policies: {
    categoryAccess: {
      allowed: ['lumber', 'framing', 'roofing', 'windows-doors', 'structural'],
      denied: ['decking', 'outdoor-living'] // Not her focus
    },
    tierAccess: {
      allowed: ['basic', 'standard', 'premium'],
      denied: ['luxury'] // Premium+ products hidden
    },
    pricing: {
      priceBook: 'production-builder',
      features: ['bulk-discounts', 'volume-pricing']
    },
    features: {
      enabled: ['template-recommendations', 'project-bundles', 'bulk-ordering']
    }
  }
}
```

#### 3. Triggered Policies (Progressive Filtering)

**Triggered policies** dynamically filter the catalog based on user selections.

**Best demonstrated by David's deck builder**:

```javascript
// Initial state: David sees all deck-related products (~80 products)
catalogView: 'deck-specialist'

// User selects: Deck Shape = "Rectangular"
→ Triggered Policy Applied
→ Filters OUT: octagon railings, curved boards
→ Now showing: ~65 products

// User selects: Size = "16x20"
→ Triggered Policy Applied
→ Calculates material quantities needed
→ Now showing: ~50 products (relevant to this size)

// User selects: Material = "Composite"
→ Triggered Policy Applied  
→ Filters OUT: wood-specific products (stains, sealers)
→ Filters IN: composite-specific fasteners
→ Now showing: ~35 products (final filtered catalog)
```

**Loading messages show CCDM in action**:
```
"Filtering to products for rectangular decks..."
"Finding materials for your 16x20 composite deck..."
"Finding railings compatible with composite decking..."
```

#### 4. Catalog Sources (Localization)

**Catalog sources** specify language and geography (locale):

```javascript
{
  catalogSource: 'en-US-Southwest',
  locale: 'en_US',
  region: 'Southwest',
  currency: 'USD',
  warehouse: 'PHX-01'
}
```

For BuildRight demo, we'll use a single catalog source (US Southwest), but CCDM supports multiple locales.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    EDS Blocks                           │
│  (product-grid, filters, pdp, cart, etc.)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│           scripts/aco-service.js                        │
│  Mock ACO Service (mimics real CCDM APIs)               │
│  - getCatalogView(personaId)                            │
│  - getProducts(catalogView, filters, triggeredPolicies) │
│  - getProduct(sku, catalogView)                         │
│  - getPricing(sku, catalogView, quantity)               │
│  - applyTriggeredPolicy(catalogView, trigger)           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│           scripts/catalog-views.js                      │
│  CCDM Catalog View & Policy Definitions                │
│  - Catalog view per persona                             │
│  - Policies for each view                               │
│  - Triggered policy rules                               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│              data/products.json                         │
│  Central Product Catalog                                │
│  - All 184 BuildRight products                          │
│  - CCDM metadata: categories, tiers, attributes         │
└─────────────────────────────────────────────────────────┘
```

---

## Mock CCDM API Specification

### API: `getCatalogView(personaId)`

**Purpose**: Get the catalog view configuration for a persona

**Parameters**:
```javascript
{
  personaId: 'sarah'
}
```

**Returns**:
```javascript
{
  catalogView: 'production-builder',
  displayName: 'Production Builder Catalog',
  personaId: 'sarah',
  policies: {
    categoryAccess: {
      allowed: ['lumber', 'framing', 'roofing', 'windows-doors', 'structural'],
      denied: ['decking', 'outdoor-living']
    },
    tierAccess: {
      allowed: ['basic', 'standard', 'premium'],
      denied: ['luxury']
    },
    pricing: {
      priceBook: 'production-builder',
      currency: 'USD'
    },
    features: {
      bulkPricing: true,
      customOrders: false,
      templateRecommendations: true
    }
  },
  catalogSource: {
    locale: 'en_US',
    region: 'Southwest',
    warehouse: 'PHX-01'
  }
}
```

---

### API: `getProducts(catalogView, options)`

**Purpose**: Fetch filtered product list based on catalog view and optional triggered policies

**Parameters**:
```javascript
{
  catalogView: 'production-builder',  // From getCatalogView()
  search: '',                          // Optional search term
  filters: {                           // Optional filters
    categories: ['lumber'],
    priceRange: { min: 0, max: 100 }
  },
  triggeredPolicies: [                 // Optional triggered policy filters
    { type: 'deck-shape', value: 'rectangular' },
    { type: 'deck-size', value: '16x20' }
  ],
  sort: 'name-asc',
  page: 1,
  pageSize: 24
}
```

**Returns**:
```javascript
{
  products: [
    {
      sku: 'LUM-2X4-8',
      name: '2x4x8 Premium Framing Lumber',
      price: 6.99,              // From catalog view's price book
      listPrice: 7.99,          // Base price
      category: 'lumber',
      image: '/images/products/lum-2x4-8.png',
      inStock: true,
      badges: ['bulk-pricing'],
      ccdmMetadata: {
        visibleInCatalogView: true,
        pricingRule: 'production-builder',
        tier: 'premium'
      }
    }
  ],
  total: 156,                   // Total products in this catalog view
  page: 1,
  pageSize: 24,
  catalogView: 'production-builder',
  appliedPolicies: {            // Which policies filtered this result
    categoryPolicies: ['lumber', 'framing', 'roofing'],
    tierPolicies: ['basic', 'standard', 'premium'],
    triggeredPolicies: []
  },
  facets: {
    categories: [...],
    priceRanges: [...]
  }
}
```

---

### API: `applyTriggeredPolicy(catalogView, trigger, currentProducts)`

**Purpose**: Apply a triggered policy to further filter products (progressive filtering)

**Parameters**:
```javascript
{
  catalogView: 'deck-specialist',
  trigger: {
    type: 'deck-shape',
    value: 'rectangular'
  },
  currentProducts: [...] // Current product set
}
```

**Returns**:
```javascript
{
  products: [...],        // Filtered product list
  filteredOut: 15,        // How many products were removed
  filteredIn: 0,          // How many products were added
  totalNow: 65,           // New total
  message: 'Filtered to products compatible with rectangular decks',
  appliedPolicy: {
    type: 'deck-shape',
    value: 'rectangular',
    rules: [
      { action: 'exclude', attribute: 'deck-compatibility', value: 'octagon-only' },
      { action: 'exclude', attribute: 'deck-compatibility', value: 'curved-only' }
    ]
  }
}
```

**Example flow** (David's deck builder):

```javascript
// Step 1: Get David's catalog view
const catalogView = await getCatalogView('david');
// catalogView.catalogView = 'deck-specialist'

// Step 2: Get initial products
let result = await getProducts(catalogView.catalogView);
// result.total = 80 (all deck products)

// Step 3: User selects shape
result = await applyTriggeredPolicy(catalogView.catalogView, 
  { type: 'deck-shape', value: 'rectangular' },
  result.products
);
// result.totalNow = 65 (filtered down)

// Step 4: User selects size
result = await applyTriggeredPolicy(catalogView.catalogView,
  { type: 'deck-size', value: '16x20' },
  result.products
);
// result.totalNow = 50 (filtered more)

// Step 5: User selects material
result = await applyTriggeredPolicy(catalogView.catalogView,
  { type: 'deck-material', value: 'composite' },
  result.products
);
// result.totalNow = 35 (final filtered catalog)
```

---

### API: `getProduct(sku, catalogView)`

**Purpose**: Fetch single product detail within a catalog view context

**Parameters**:
```javascript
{
  sku: 'LUM-2X4-8',
  catalogView: 'production-builder'
}
```

**Returns**:
```javascript
{
  sku: 'LUM-2X4-8',
  name: '2x4x8 Premium Framing Lumber',
  description: 'Premium grade kiln-dried framing lumber...',
  price: 6.99,                  // Catalog view's price
  listPrice: 7.99,              // Base price
  category: 'lumber',
  images: [...],
  specifications: {...},
  inventory: {
    inStock: true,
    quantity: 5000,
    warehouse: 'PHX-01'          // From catalog view's source
  },
  pricing: {
    priceBook: 'production-builder',
    basePrice: 6.99,
    bulkPricing: [
      { qty: 100, price: 6.49 },
      { qty: 500, price: 5.99 },
      { qty: 1000, price: 5.49 }
    ]
  },
  ccdmMetadata: {
    catalogView: 'production-builder',
    tier: 'premium',
    visibilityReason: 'Category policy: lumber allowed, Tier policy: premium accessible'
  },
  recommendations: [
    { sku: 'NAL-FRM-16', reason: 'frequently-bought-together' }
  ]
}
```

---

### API: `getPricing(sku, catalogView, quantity)`

**Purpose**: Get catalog-view-specific pricing for a product

**Parameters**:
```javascript
{
  sku: 'LUM-2X4-8',
  catalogView: 'production-builder',
  quantity: 250
}
```

**Returns**:
```javascript
{
  sku: 'LUM-2X4-8',
  catalogView: 'production-builder',
  priceBook: 'production-builder',
  quantity: 250,
  unitPrice: 6.49,              // Applied bulk pricing
  lineTotal: 1622.50,
  savings: 125.00,              // vs. base price
  bulkDiscountApplied: true,
  nextBreak: {
    quantity: 500,
    unitPrice: 5.99,
    potentialSavings: 125.00
  }
}
```

---

## Data Structures

### Catalog View Configuration

**File**: `scripts/catalog-views.js`

```javascript
export const catalogViews = {
  'production-builder': {
    id: 'production-builder',
    displayName: 'Production Builder Catalog',
    personaId: 'sarah',
    description: 'Catalog view for production home builders',
    
    policies: {
      categoryAccess: {
        allowed: ['lumber', 'framing', 'roofing', 'windows-doors', 'structural'],
        denied: ['decking', 'outdoor-living', 'specialty-tools']
      },
      tierAccess: {
        allowed: ['basic', 'standard', 'premium'],
        denied: ['luxury', 'premium-plus']
      },
      pricing: {
        priceBook: 'production-builder',
        currency: 'USD',
        taxRate: 0.083  // Arizona
      },
      features: {
        bulkPricing: true,
        customOrders: false,
        templateRecommendations: true,
        projectBundles: true
      }
    },
    
    catalogSource: {
      locale: 'en_US',
      region: 'Southwest',
      warehouse: 'PHX-01',
      currency: 'USD'
    }
  },
  
  'commercial-contractor': {
    id: 'commercial-contractor',
    displayName: 'Commercial Contractor Catalog',
    personaId: 'marcus',
    description: 'Catalog view for commercial project managers',
    
    policies: {
      categoryAccess: {
        allowed: ['lumber', 'framing', 'roofing', 'windows-doors', 'structural', 'concrete', 'electrical'],
        denied: ['decking'] // Broader access
      },
      tierAccess: {
        allowed: ['basic', 'standard', 'premium'],
        denied: ['luxury']
      },
      pricing: {
        priceBook: 'commercial-contractor',
        currency: 'USD',
        taxRate: 0.083
      },
      features: {
        bulkPricing: true,
        customOrders: true,
        projectWizard: true,
        phaseEstimator: true
      }
    },
    
    catalogSource: {
      locale: 'en_US',
      region: 'Southwest',
      warehouse: 'PHX-01',
      currency: 'USD'
    }
  },
  
  'luxury-builder': {
    id: 'luxury-builder',
    displayName: 'Luxury Builder Catalog',
    personaId: 'lisa',
    description: 'Catalog view for custom luxury home builders',
    
    policies: {
      categoryAccess: {
        allowed: ['lumber', 'framing', 'roofing', 'windows-doors', 'structural', 'specialty'],
        denied: []  // Access to specialty items
      },
      tierAccess: {
        allowed: ['standard', 'premium', 'premium-plus', 'luxury'],
        denied: ['basic']  // No basic tier for luxury builders
      },
      pricing: {
        priceBook: 'luxury-builder',
        currency: 'USD',
        taxRate: 0.083
      },
      features: {
        bulkPricing: true,
        customOrders: true,
        whiteGloveDelivery: true,
        packageBuilder: true,
        conciergeService: true
      }
    },
    
    catalogSource: {
      locale: 'en_US',
      region: 'Southwest',
      warehouse: 'PHX-01',
      currency: 'USD'
    }
  },
  
  'deck-specialist': {
    id: 'deck-specialist',
    displayName: 'Deck & Outdoor Specialist Catalog',
    personaId: 'david',
    description: 'Catalog view for deck and outdoor builders',
    
    policies: {
      categoryAccess: {
        allowed: ['lumber', 'decking', 'fasteners', 'outdoor', 'tools'],
        denied: ['roofing', 'windows-doors', 'concrete', 'electrical']  // Narrow focus
      },
      tierAccess: {
        allowed: ['basic', 'standard'],
        denied: ['premium', 'luxury']
      },
      pricing: {
        priceBook: 'specialty-contractor',
        currency: 'USD',
        taxRate: 0.083
      },
      features: {
        deckCalculator: true,
        materialEstimator: true,
        triggeredPolicies: true,  // KEY FEATURE for CCDM demo
        educationalContent: true
      }
    },
    
    triggeredPolicies: {
      'deck-shape': {
        rectangular: {
          exclude: [
            { attribute: 'deck-compatibility', value: 'octagon-only' },
            { attribute: 'deck-compatibility', value: 'curved-only' }
          ]
        },
        octagon: {
          exclude: [
            { attribute: 'deck-compatibility', value: 'rectangular-only' }
          ],
          include: [
            { attribute: 'specialtyItem', value: 'octagon-kit' }
          ]
        }
      },
      'deck-material': {
        composite: {
          exclude: [
            { category: 'wood-treatments' },
            { attribute: 'material-compatibility', value: 'wood-only' }
          ],
          include: [
            { attribute: 'material-compatibility', value: 'composite' }
          ]
        },
        wood: {
          exclude: [
            { attribute: 'material-compatibility', value: 'composite-only' }
          ],
          include: [
            { category: 'wood-treatments' }
          ]
        }
      }
    },
    
    catalogSource: {
      locale: 'en_US',
      region: 'Southwest',
      warehouse: 'PHX-01',
      currency: 'USD'
    }
  },
  
  'facilities': {
    id: 'facilities',
    displayName: 'Facilities Maintenance Catalog',
    personaId: 'kevin',
    description: 'Catalog view for facilities managers',
    
    policies: {
      categoryAccess: {
        allowed: ['fasteners', 'tools', 'maintenance', 'electrical', 'plumbing'],
        denied: ['lumber', 'framing', 'roofing', 'structural']  // Different focus
      },
      tierAccess: {
        allowed: ['basic'],
        denied: ['standard', 'premium', 'luxury']  // Basic access only
      },
      pricing: {
        priceBook: 'facilities',
        currency: 'USD',
        taxRate: 0.083
      },
      features: {
        quickReorder: true,
        scheduledDelivery: true,
        inventoryTracking: true
      }
    },
    
    catalogSource: {
      locale: 'en_US',
      region: 'Southwest',
      warehouse: 'PHX-01',
      currency: 'USD'
    }
  }
};

export function getCatalogView(personaId) {
  // Map persona to catalog view
  const personaToCatalogView = {
    'sarah': 'production-builder',
    'marcus': 'commercial-contractor',
    'lisa': 'luxury-builder',
    'david': 'deck-specialist',
    'kevin': 'facilities'
  };
  
  const viewId = personaToCatalogView[personaId] || 'production-builder';
  return catalogViews[viewId];
}
```

---

### Product Data Structure (with CCDM Metadata)

**File**: `data/products.json`

```json
{
  "products": [
    {
      "sku": "LUM-2X4-8",
      "name": "2x4x8 Premium Framing Lumber",
      "description": "Premium grade kiln-dried Douglas fir framing lumber",
      "category": "lumber",
      "subcategory": "framing",
      "basePrice": 7.99,
      "image": "/images/products/lum-2x4-8.png",
      "images": [...],
      "specifications": {...},
      "inventory": {...},
      
      "ccdmMetadata": {
        "tier": "premium",
        "categories": ["framing", "structural"],
        "attributes": {
          "material": "wood",
          "grade": "premium",
          "treatment": "kiln-dried",
          "application": ["framing", "structural"]
        },
        "catalogViewVisibility": {
          "production-builder": true,
          "commercial-contractor": true,
          "luxury-builder": true,
          "deck-specialist": false,
          "facilities": false
        },
        "pricingByView": {
          "production-builder": {
            "basePrice": 6.99,
            "bulkBreaks": [
              { "qty": 100, "price": 6.49 },
              { "qty": 500, "price": 5.99 },
              { "qty": 1000, "price": 5.49 }
            ]
          },
          "commercial-contractor": {
            "basePrice": 7.29,
            "bulkBreaks": [
              { "qty": 50, "price": 6.99 },
              { "qty": 200, "price": 6.49 }
            ]
          },
          "luxury-builder": {
            "basePrice": 7.49,
            "bulkBreaks": [
              { "qty": 100, "price": 6.99 }
            ]
          }
        }
      }
    },
    
    {
      "sku": "DECK-COMP-16",
      "name": "Composite Decking Board 16ft",
      "description": "Weather-resistant composite decking",
      "category": "decking",
      "basePrice": 42.99,
      
      "ccdmMetadata": {
        "tier": "standard",
        "categories": ["decking", "outdoor"],
        "attributes": {
          "material": "composite",
          "material-compatibility": "composite",
          "deck-compatibility": ["rectangular", "octagon"],
          "length": 16,
          "application": ["decking"]
        },
        "catalogViewVisibility": {
          "production-builder": false,
          "commercial-contractor": false,
          "luxury-builder": false,
          "deck-specialist": true,
          "facilities": false
        },
        "pricingByView": {
          "deck-specialist": {
            "basePrice": 39.99,
            "bulkBreaks": [
              { "qty": 50, "price": 37.99 }
            ]
          }
        },
        "triggeredPolicyBehavior": {
          "deck-material-composite": { "visible": true, "priority": 10 },
          "deck-material-wood": { "visible": false },
          "deck-shape-rectangular": { "visible": true },
          "deck-shape-octagon": { "visible": true }
        }
      }
    }
  ]
}
```

---

## Mock Service Implementation

**File**: `scripts/aco-service.js`

```javascript
import { getCatalogView as getCatalogViewConfig, catalogViews } from './catalog-views.js';

// Simulated network delay
const SIMULATED_DELAY = 300; // ms

// In-memory product cache
let productCatalog = [];

/**
 * Initialize ACO service - load product data
 */
export async function initACOService() {
  try {
    const response = await fetch('/data/products.json');
    const data = await response.json();
    productCatalog = data.products;
    console.log('[ACO/CCDM] Initialized with', productCatalog.length, 'products');
    console.log('[ACO/CCDM] Catalog views:', Object.keys(catalogViews));
  } catch (error) {
    console.error('[ACO/CCDM] Failed to load products:', error);
  }
}

/**
 * Get catalog view for persona
 */
export async function getCatalogView(personaId) {
  await simulateDelay();
  
  const view = getCatalogViewConfig(personaId);
  console.log(`[ACO/CCDM] Catalog view "${view.id}" for persona "${personaId}"`);
  
  return view;
}

/**
 * Get products filtered by catalog view
 */
export async function getProducts(catalogViewId, options = {}) {
  await simulateDelay();
  
  const {
    search = '',
    filters = {},
    triggeredPolicies = [],
    sort = 'name-asc',
    page = 1,
    pageSize = 24
  } = options;
  
  const catalogView = catalogViews[catalogViewId];
  
  if (!catalogView) {
    throw new Error(`Catalog view "${catalogViewId}" not found`);
  }
  
  console.log(`[ACO/CCDM] Getting products for catalog view: ${catalogView.displayName}`);
  
  // Step 1: Apply catalog view policies
  let filtered = applyCatalogViewPolicies(productCatalog, catalogView);
  console.log(`[ACO/CCDM] After catalog view policies: ${filtered.length} products`);
  
  // Step 2: Apply triggered policies (progressive filtering)
  if (triggeredPolicies.length > 0) {
    filtered = applyTriggeredPolicies(filtered, catalogView, triggeredPolicies);
    console.log(`[ACO/CCDM] After triggered policies: ${filtered.length} products`);
  }
  
  // Step 3: Apply search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower)
    );
  }
  
  // Step 4: Apply additional filters
  filtered = applyFilters(filtered, filters);
  
  // Step 5: Apply pricing from catalog view
  filtered = filtered.map(p => applyPricingForView(p, catalogView));
  
  // Step 6: Sort
  filtered = sortProducts(filtered, sort);
  
  // Step 7: Paginate
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const products = filtered.slice(start, end);
  
  // Step 8: Generate facets
  const facets = generateFacets(filtered);
  
  return {
    products,
    total,
    page,
    pageSize,
    catalogView: catalogView.id,
    appliedPolicies: {
      catalogView: catalogView.id,
      categoryPolicies: catalogView.policies.categoryAccess.allowed,
      tierPolicies: catalogView.policies.tierAccess.allowed,
      triggeredPolicies: triggeredPolicies
    },
    facets
  };
}

/**
 * Apply triggered policy (for progressive filtering demo)
 */
export async function applyTriggeredPolicy(catalogViewId, trigger, currentProducts) {
  await simulateDelay();
  
  const catalogView = catalogViews[catalogViewId];
  const triggeredPolicyRules = catalogView.triggeredPolicies;
  
  if (!triggeredPolicyRules || !triggeredPolicyRules[trigger.type]) {
    console.warn(`[ACO/CCDM] No triggered policy found for ${trigger.type}`);
    return {
      products: currentProducts,
      filteredOut: 0,
      filteredIn: 0,
      totalNow: currentProducts.length,
      message: 'No filtering applied'
    };
  }
  
  const policyRules = triggeredPolicyRules[trigger.type][trigger.value];
  
  if (!policyRules) {
    return {
      products: currentProducts,
      filteredOut: 0,
      filteredIn: 0,
      totalNow: currentProducts.length,
      message: 'No filtering applied'
    };
  }
  
  const initialCount = currentProducts.length;
  let filtered = [...currentProducts];
  
  // Apply exclusions
  if (policyRules.exclude) {
    policyRules.exclude.forEach(rule => {
      if (rule.category) {
        filtered = filtered.filter(p => p.category !== rule.category);
      } else if (rule.attribute) {
        filtered = filtered.filter(p => {
          const attr = p.ccdmMetadata.attributes[rule.attribute];
          if (Array.isArray(attr)) {
            return !attr.includes(rule.value);
          }
          return attr !== rule.value;
        });
      }
    });
  }
  
  // Apply inclusions (for now, just mark them as prioritized)
  if (policyRules.include) {
    // In a real system, this might fetch additional products
    // For demo, we're just filtering down
  }
  
  const finalCount = filtered.length;
  const filteredOut = initialCount - finalCount;
  
  console.log(`[ACO/CCDM] Triggered policy applied: ${trigger.type}=${trigger.value}`);
  console.log(`[ACO/CCDM] Products: ${initialCount} → ${finalCount} (filtered out: ${filteredOut})`);
  
  return {
    products: filtered,
    filteredOut,
    filteredIn: 0,
    totalNow: finalCount,
    message: getTriggeredPolicyMessage(trigger),
    appliedPolicy: {
      type: trigger.type,
      value: trigger.value,
      rules: policyRules
    }
  };
}

/**
 * Get single product by SKU
 */
export async function getProduct(sku, catalogViewId) {
  await simulateDelay();
  
  const catalogView = catalogViews[catalogViewId];
  const product = productCatalog.find(p => p.sku === sku);
  
  if (!product) {
    throw new Error(`Product ${sku} not found`);
  }
  
  // Check if product is visible in this catalog view
  if (!product.ccdmMetadata.catalogViewVisibility[catalogViewId]) {
    throw new Error(`Product ${sku} not available in catalog view ${catalogViewId}`);
  }
  
  // Apply pricing
  const priced = applyPricingForView(product, catalogView);
  
  // Add CCDM metadata to response
  priced.ccdmMetadata = {
    ...product.ccdmMetadata,
    catalogView: catalogView.id,
    visibilityReason: getVisibilityReason(product, catalogView)
  };
  
  return priced;
}

/**
 * Get pricing for a product in a catalog view
 */
export async function getPricing(sku, catalogViewId, quantity = 1) {
  await simulateDelay();
  
  const catalogView = catalogViews[catalogViewId];
  const product = productCatalog.find(p => p.sku === sku);
  
  if (!product) {
    throw new Error(`Product ${sku} not found`);
  }
  
  const viewPricing = product.ccdmMetadata.pricingByView[catalogViewId];
  
  if (!viewPricing) {
    throw new Error(`No pricing for ${sku} in catalog view ${catalogViewId}`);
  }
  
  // Find applicable bulk break
  let unitPrice = viewPricing.basePrice;
  let bulkDiscountApplied = false;
  
  if (viewPricing.bulkBreaks) {
    for (const breakRule of viewPricing.bulkBreaks.reverse()) {
      if (quantity >= breakRule.qty) {
        unitPrice = breakRule.price;
        bulkDiscountApplied = true;
        break;
      }
    }
  }
  
  const lineTotal = unitPrice * quantity;
  const savings = (viewPricing.basePrice - unitPrice) * quantity;
  
  // Find next break
  let nextBreak = null;
  if (viewPricing.bulkBreaks) {
    for (const breakRule of viewPricing.bulkBreaks) {
      if (quantity < breakRule.qty) {
        nextBreak = {
          quantity: breakRule.qty,
          unitPrice: breakRule.price,
          potentialSavings: (unitPrice - breakRule.price) * breakRule.qty
        };
        break;
      }
    }
  }
  
  return {
    sku,
    catalogView: catalogViewId,
    priceBook: catalogView.policies.pricing.priceBook,
    quantity,
    unitPrice,
    lineTotal,
    savings,
    bulkDiscountApplied,
    nextBreak
  };
}

/**
 * Apply catalog view policies to filter products
 */
function applyCatalogViewPolicies(products, catalogView) {
  const policies = catalogView.policies;
  
  return products.filter(product => {
    const metadata = product.ccdmMetadata;
    
    // Check catalog view visibility
    if (!metadata.catalogViewVisibility[catalogView.id]) {
      return false;
    }
    
    // Check category access
    const hasCategoryAccess = policies.categoryAccess.allowed.includes(product.category);
    
    // Check tier access
    const hasTierAccess = policies.tierAccess.allowed.includes(metadata.tier);
    
    return hasCategoryAccess && hasTierAccess;
  });
}

/**
 * Apply triggered policies
 */
function applyTriggeredPolicies(products, catalogView, triggeredPolicies) {
  let filtered = products;
  
  triggeredPolicies.forEach(trigger => {
    const policyRules = catalogView.triggeredPolicies?.[trigger.type]?.[trigger.value];
    
    if (policyRules) {
      // Apply exclusions
      if (policyRules.exclude) {
        policyRules.exclude.forEach(rule => {
          if (rule.category) {
            filtered = filtered.filter(p => p.category !== rule.category);
          } else if (rule.attribute) {
            filtered = filtered.filter(p => {
              const behavior = p.ccdmMetadata.triggeredPolicyBehavior;
              const key = `${trigger.type}-${trigger.value}`;
              return behavior?.[key]?.visible !== false;
            });
          }
        });
      }
    }
  });
  
  return filtered;
}

/**
 * Apply pricing from catalog view
 */
function applyPricingForView(product, catalogView) {
  const viewPricing = product.ccdmMetadata.pricingByView[catalogView.id];
  
  if (!viewPricing) {
    return {
      ...product,
      price: product.basePrice,
      listPrice: product.basePrice,
      priceBook: 'default'
    };
  }
  
  return {
    ...product,
    price: viewPricing.basePrice,
    listPrice: product.basePrice,
    hasBulkPricing: viewPricing.bulkBreaks && viewPricing.bulkBreaks.length > 0,
    priceBook: catalogView.policies.pricing.priceBook
  };
}

/**
 * Apply additional filters
 */
function applyFilters(products, filters) {
  let filtered = products;
  
  if (filters.priceRange) {
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );
  }
  
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(p => filters.categories.includes(p.category));
  }
  
  if (filters.inStock) {
    filtered = filtered.filter(p => p.inventory.inStock);
  }
  
  return filtered;
}

/**
 * Sort products
 */
function sortProducts(products, sort) {
  const sorted = [...products];
  
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

/**
 * Generate facets
 */
function generateFacets(products) {
  const categories = {};
  const priceRanges = [
    { min: 0, max: 50, count: 0 },
    { min: 50, max: 100, count: 0 },
    { min: 100, max: 500, count: 0 },
    { min: 500, max: Infinity, count: 0 }
  ];
  
  products.forEach(product => {
    // Category facets
    if (!categories[product.category]) {
      categories[product.category] = {
        id: product.category,
        name: formatCategoryName(product.category),
        count: 0
      };
    }
    categories[product.category].count++;
    
    // Price range facets
    for (const range of priceRanges) {
      if (product.price >= range.min && product.price < range.max) {
        range.count++;
        break;
      }
    }
  });
  
  return {
    categories: Object.values(categories),
    priceRanges: priceRanges.filter(r => r.count > 0)
  };
}

/**
 * Get visibility reason for product
 */
function getVisibilityReason(product, catalogView) {
  const policies = catalogView.policies;
  const metadata = product.ccdmMetadata;
  
  const reasons = [];
  
  if (policies.categoryAccess.allowed.includes(product.category)) {
    reasons.push(`Category policy: ${product.category} allowed`);
  }
  
  if (policies.tierAccess.allowed.includes(metadata.tier)) {
    reasons.push(`Tier policy: ${metadata.tier} accessible`);
  }
  
  return reasons.join(', ');
}

/**
 * Get message for triggered policy
 */
function getTriggeredPolicyMessage(trigger) {
  const messages = {
    'deck-shape': {
      'rectangular': 'Filtering to products compatible with rectangular decks',
      'octagon': 'Filtering to products compatible with octagon decks'
    },
    'deck-size': {
      '16x20': 'Finding materials for your 16x20 deck',
      '12x16': 'Finding materials for your 12x16 deck'
    },
    'deck-material': {
      'composite': 'Finding products for composite decking',
      'wood': 'Finding products for wood decking'
    }
  };
  
  return messages[trigger.type]?.[trigger.value] || 'Applying triggered policy';
}

/**
 * Simulate network delay
 */
function simulateDelay() {
  return new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
}

/**
 * Format category name
 */
function formatCategoryName(id) {
  return id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
```

---

## Integration with EDS Blocks

### Example: Product Grid with CCDM

**File**: `blocks/product-grid/product-grid.js`

```javascript
import { getCatalogView, getProducts } from '../../scripts/aco-service.js';
import { getCurrentPersona } from '../../scripts/auth.js';

export default async function decorate(block) {
  const persona = getCurrentPersona();
  
  // Show loading state
  block.innerHTML = '<div class="loading">Loading catalog view...</div>';
  
  try {
    // Step 1: Get catalog view for persona
    const catalogView = await getCatalogView(persona.id);
    console.log(`[Product Grid] Catalog view: ${catalogView.displayName}`);
    
    // Step 2: Fetch products for this catalog view
    const result = await getProducts(catalogView.id, {
      category: block.dataset.category,
      pageSize: 24
    });
    
    console.log(`[Product Grid] Showing ${result.total} products from catalog view "${catalogView.displayName}"`);
    
    // Render products
    block.innerHTML = `
      <div class="catalog-info">
        <p>Catalog: <strong>${catalogView.displayName}</strong></p>
        <p>${result.total} products available</p>
      </div>
      <div class="product-grid">
        ${result.products.map(product => `
          <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="price">
              <span class="current">$${product.price.toFixed(2)}</span>
              ${product.listPrice > product.price ? 
                `<span class="list">$${product.listPrice.toFixed(2)}</span>` : ''}
            </div>
            <p class="price-book">${product.priceBook} pricing</p>
            <button data-sku="${product.sku}">Add to Cart</button>
          </div>
        `).join('')}
      </div>
    `;
    
  } catch (error) {
    console.error('[Product Grid] Error:', error);
    block.innerHTML = '<div class="error">Failed to load products</div>';
  }
}
```

---

### Example: David's Deck Wizard (CCDM Demo)

**File**: `blocks/deck-wizard/deck-wizard.js`

```javascript
import { getCatalogView, getProducts, applyTriggeredPolicy } from '../../scripts/aco-service.js';

export default async function decorate(block) {
  let catalogView;
  let currentProducts = [];
  let appliedTriggers = [];
  
  // Initialize
  catalogView = await getCatalogView('david');
  const initialResult = await getProducts(catalogView.id);
  currentProducts = initialResult.products;
  
  renderWizard(block, currentProducts.length);
  
  // Step 1: Deck Shape
  block.querySelector('#shape-select').addEventListener('change', async (e) => {
    showLoading('Filtering to products compatible with ' + e.target.value + ' decks...');
    
    const result = await applyTriggeredPolicy(catalogView.id, 
      { type: 'deck-shape', value: e.target.value },
      currentProducts
    );
    
    currentProducts = result.products;
    appliedTriggers.push({ type: 'deck-shape', value: e.target.value });
    
    updateProductCount(result.totalNow, result.filteredOut);
    hideLoading();
  });
  
  // Step 2: Deck Material
  block.querySelector('#material-select').addEventListener('change', async (e) => {
    showLoading('Finding products for ' + e.target.value + ' decking...');
    
    const result = await applyTriggeredPolicy(catalogView.id,
      { type: 'deck-material', value: e.target.value },
      currentProducts
    );
    
    currentProducts = result.products;
    appliedTriggers.push({ type: 'deck-material', value: e.target.value });
    
    updateProductCount(result.totalNow, result.filteredOut);
    hideLoading();
  });
}

function updateProductCount(total, filteredOut) {
  const counter = document.querySelector('.product-counter');
  counter.innerHTML = `
    <div class="ccdm-demo">
      <p><strong>${total} products</strong> match your selections</p>
      <p class="filtered">Filtered out ${filteredOut} incompatible products</p>
    </div>
  `;
}
```

---

## Testing the Mock CCDM Service

### Manual Testing

```javascript
// In browser console:

// Initialize
await window.acoService.initACOService();

// Test Sarah's catalog view
const sarahView = await window.acoService.getCatalogView('sarah');
console.log('Sarah catalog view:', sarahView.displayName);

const sarahProducts = await window.acoService.getProducts(sarahView.id);
console.log('Sarah sees', sarahProducts.total, 'products');

// Test Kevin's catalog view (should be different)
const kevinView = await window.acoService.getCatalogView('kevin');
const kevinProducts = await window.acoService.getProducts(kevinView.id);
console.log('Kevin sees', kevinProducts.total, 'products');

// Test triggered policy (David's deck wizard)
const davidView = await window.acoService.getCatalogView('david');
let davidProducts = await window.acoService.getProducts(davidView.id);
console.log('David initially sees', davidProducts.total, 'products');

const filtered = await window.acoService.applyTriggeredPolicy(davidView.id,
  { type: 'deck-shape', value: 'rectangular' },
  davidProducts.products
);
console.log('After shape filter:', filtered.totalNow, 'products (filtered out:', filtered.filteredOut, ')');
```

### Expected Outcomes

**Sarah (Production Builder)**:
- Catalog View: "Production Builder Catalog"
- ~156 products visible
- Categories: lumber, framing, roofing, windows-doors
- Price book: production-builder
- Bulk pricing enabled

**Kevin (Facilities Manager)**:
- Catalog View: "Facilities Maintenance Catalog"
- ~58 products visible (completely different set)
- Categories: fasteners, tools, maintenance
- Price book: facilities
- No bulk pricing

**David (Deck Specialist) with Triggered Policies**:
- Initial: ~80 deck products
- After shape=rectangular: ~65 products
- After material=composite: ~35 products
- Demonstrates progressive CCDM filtering

---

## Migration to Real ACO

When connecting to real Adobe Commerce Optimizer:

### Step 1: Install ACO Client

```bash
npm install @adobe/aco-client
```

### Step 2: Configure ACO

```javascript
import { ACOClient } from '@adobe/aco-client';

const acoClient = new ACOClient({
  endpoint: process.env.ACO_ENDPOINT,
  apiKey: process.env.ACO_API_KEY,
  orgId: process.env.ACO_ORG_ID
});
```

### Step 3: Update Imports

**Before** (mock):
```javascript
import { getCatalogView, getProducts } from '../../scripts/aco-service.js';
```

**After** (real ACO):
```javascript
import { getCatalogView, getProducts } from '@adobe/aco-client';
```

**API signatures designed to match** - rest of code works the same!

---

## Summary

### What CCDM Actually Means

✅ **Composable Catalog Data Model** - Adobe's flexible, scalable catalog system

**NOT** ❌ "Customer-Centric Data Management"

### Key CCDM Concepts

1. **Catalog Views** - Product assortments per distribution channel (persona in our case)
2. **Policies** - Data access rules that filter products per catalog view
3. **Triggered Policies** - Progressive filtering based on user selections
4. **Catalog Sources** - Locale/region/warehouse specifications
5. **Price Books** - Pricing rules per catalog view
6. **Massive Scale** - 250M SKUs, 30K price points per SKU

### BuildRight's CCDM Demo

✅ 5 catalog views (one per persona)  
✅ Policy-based filtering (category, tier access)  
✅ Catalog-view-specific pricing (price books)  
✅ Triggered policies (David's deck wizard - PRIMARY DEMO)  
✅ Progressive product count visualization  
✅ Loading states showing CCDM in action  

---

## Related Documents

- `PERSONA-IMPLEMENTATION-PLAN.md` - Overall persona strategy
- `PHASE-1-ACO-DATA-FOUNDATION.md` - Product data generation with CCDM metadata
- `PHASE-3-CORE-ARCHITECTURE.md` - Implementation in EDS

---

**Last Updated**: November 15, 2024  
**Status**: CORRECTED - Now accurately reflects Adobe's Composable Catalog Data Model (CCDM)  
**Source**: Adobe Commerce documentation (experienceleague.adobe.com, business.adobe.com)
