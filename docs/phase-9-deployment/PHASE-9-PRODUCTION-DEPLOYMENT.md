# Phase 9: Production Deployment

## Overview

**Duration**: 2-3 weeks  
**Dependencies**: Phase 8 (Backend Setup), Access to Adobe Commerce/ACO/API Mesh  
**Status**: Not Started  
**Prerequisites**: Completed Phase 3-7 (Frontend with mock), Completed Phase 8 (Backend)

Deploy the BuildRight persona demo to production using Adobe Edge Delivery Services (EDS), Adobe API Mesh, and Adobe Commerce/ACO backend. This phase transitions from the local mock-based demo to a fully production-ready storefront.

---

## Architecture Overview

### **Current State (Phase 0-7)**
```
buildright-eds (local)
├─ Mock ACO service (scripts/aco-service.js)
├─ Mock auth (scripts/auth.js)
├─ Static data (data/*.json)
└─ Local development server
```

### **Target State (Phase 9)**
```
Edge Delivery Services (EDS)
├─ accs-citisignal repository
├─ Adobe Commerce Dropins
│   ├─ @dropins/storefront-auth
│   ├─ @dropins/storefront-pdp
│   ├─ @dropins/storefront-cart
│   └─ @dropins/storefront-account
├─ Custom EDS Blocks
│   ├─ persona-dashboard
│   ├─ project-builder
│   ├─ product-filters
│   └─ pricing-display
└─ Connects via Adobe API Mesh

Adobe API Mesh
├─ GraphQL gateway
├─ Adobe Commerce API
├─ ACO CCDM API
├─ Custom resolvers
└─ Authentication middleware

Adobe Commerce + ACO
├─ Customer groups (5)
├─ Custom attributes (5)
├─ Price books (5)
├─ Products (177)
└─ Policies (28)
```

---

## Objectives

1. Set up Adobe API Mesh for GraphQL gateway
2. Migrate BuildRight code to `accs-citisignal` EDS repository
3. Configure EDS environment and deployment
4. Integrate Adobe Commerce Dropins with real backend
5. Replace mock services with API Mesh calls
6. Deploy to production EDS environment
7. End-to-end testing and validation

---

## Task 1: Adobe API Mesh Setup

### 1.1 Review Reference Implementation

**Location**: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/commerce-mesh`

**Review**:
- Mesh configuration structure
- GraphQL schema definitions
- Resolver patterns
- Authentication middleware
- Environment configuration

**Deliverable**: Understanding of mesh architecture

---

### 1.2 Create BuildRight API Mesh Configuration

**Repository**: New `buildright-mesh` directory (or within `buildright-aco`)

**Files to Create**:

#### `mesh.json` - Main Configuration
```json
{
  "meshConfig": {
    "sources": [
      {
        "name": "AdobeCommerce",
        "handler": {
          "graphql": {
            "endpoint": "${env:COMMERCE_GRAPHQL_ENDPOINT}",
            "operationHeaders": {
              "Authorization": "Bearer ${context.headers.authorization}"
            }
          }
        }
      },
      {
        "name": "ACO",
        "handler": {
          "graphql": {
            "endpoint": "${env:ACO_GRAPHQL_ENDPOINT}",
            "operationHeaders": {
              "x-api-key": "${env:ACO_API_KEY}",
              "x-gw-ims-org-id": "${env:ACO_ORG_ID}"
            }
          }
        }
      }
    ],
    "additionalTypeDefs": "./schema/buildright-extensions.graphql",
    "additionalResolvers": [
      "./resolvers/persona-resolver.js",
      "./resolvers/pricing-resolver.js",
      "./resolvers/policy-resolver.js"
    ]
  }
}
```

#### `schema/buildright-extensions.graphql` - Custom Schema
```graphql
extend type Customer {
  """Customer persona attributes"""
  businessType: String
  projectScale: String
  primaryService: String
  customerTier: String
  buyingBehavior: String
  
  """Computed persona"""
  persona: Persona
}

type Persona {
  id: String!
  name: String!
  title: String!
  description: String!
  customerGroup: String!
  attributes: PersonaAttributes!
}

type PersonaAttributes {
  constructionPhase: String
  qualityTier: String
  packageTier: String
  roomCategory: String
  deckCompatible: Boolean
  deckShape: String
  deckMaterialType: String
  storeVelocityCategory: String
  restockPriority: String
}

extend type Query {
  """Get current customer's persona"""
  currentPersona: Persona
  
  """Get filtered products based on persona policies"""
  personaProducts(
    search: String
    pageSize: Int
    currentPage: Int
  ): Products
  
  """Get persona-specific pricing"""
  personaPricing(sku: String!): PersonaPricing
}

type PersonaPricing {
  sku: String!
  customerGroupPrice: Money!
  volumeTiers: [VolumeTier!]!
  savings: Money
  savingsPercent: Float
}

type VolumeTier {
  quantity: Int!
  price: Money!
  discount: Float!
}
```

#### `resolvers/persona-resolver.js` - Persona Logic
```javascript
export default {
  Customer: {
    persona: async (customer, args, context) => {
      // Map customer attributes to persona
      const { businessType, projectScale, primaryService, customerTier } = customer;
      
      // Persona determination logic (matches AUTH-STRATEGY.md)
      if (businessType === 'production_builder' && projectScale === 'high_volume') {
        return {
          id: 'sarah',
          name: 'Sarah Martinez',
          title: 'Production Builder',
          description: 'Managing 12 spec homes per year',
          customerGroup: 'Production-Builder',
          attributes: {
            constructionPhase: 'foundation_framing',
            customerTier: 'Production-Builder'
          }
        };
      }
      
      // ... other persona mappings
      
      return null;
    }
  },
  
  Query: {
    currentPersona: async (parent, args, context) => {
      const customer = await context.AdobeCommerce.Query.customer();
      return customer.persona;
    },
    
    personaProducts: async (parent, args, context) => {
      const persona = await context.AdobeCommerce.Query.customer().persona;
      
      // Build policy headers based on persona attributes
      const policyHeaders = {};
      if (persona.attributes.constructionPhase) {
        policyHeaders['AC-Policy-Phase'] = persona.attributes.constructionPhase;
      }
      if (persona.attributes.qualityTier) {
        policyHeaders['AC-Policy-Quality'] = persona.attributes.qualityTier;
      }
      // ... other policy headers
      
      // Query ACO with policy headers
      return context.ACO.Query.products(args, { headers: policyHeaders });
    },
    
    personaPricing: async (parent, { sku }, context) => {
      const customer = await context.AdobeCommerce.Query.customer();
      const product = await context.ACO.Query.product({ sku });
      
      // Get customer group pricing
      const customerGroupPrice = product.priceBooks.find(
        pb => pb.id === customer.customerTier
      );
      
      // Get volume tiers
      const volumeTiers = product.priceBooks
        .filter(pb => pb.id === customer.customerTier)
        .flatMap(pb => pb.volumeTiers);
      
      return {
        sku,
        customerGroupPrice: customerGroupPrice.price,
        volumeTiers,
        savings: product.retailPrice - customerGroupPrice.price,
        savingsPercent: ((product.retailPrice - customerGroupPrice.price) / product.retailPrice) * 100
      };
    }
  }
};
```

#### `resolvers/pricing-resolver.js` - Pricing Logic
```javascript
export default {
  Query: {
    personaPricing: async (parent, { sku }, context) => {
      // Implementation in persona-resolver.js
    }
  }
};
```

#### `resolvers/policy-resolver.js` - Policy Logic
```javascript
export default {
  Query: {
    personaProducts: async (parent, args, context) => {
      // Implementation in persona-resolver.js
    }
  }
};
```

**Deliverable**: API Mesh configuration files

---

### 1.3 Deploy API Mesh

**Prerequisites**:
- Adobe I/O CLI installed
- Adobe I/O project created
- API Mesh entitlement

**Commands**:
```bash
# Install Adobe I/O CLI
npm install -g @adobe/aio-cli

# Login
aio login

# Create API Mesh
aio api-mesh:create buildright-mesh

# Deploy mesh configuration
aio api-mesh:update buildright-mesh --mesh-config mesh.json

# Get mesh endpoint
aio api-mesh:get buildright-mesh
```

**Expected Output**:
```
✓ API Mesh deployed successfully
Endpoint: https://graph.adobe.io/api/buildright-mesh/graphql
```

**Validation**:
```bash
# Test mesh endpoint
curl -X POST https://graph.adobe.io/api/buildright-mesh/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"query":"{ currentPersona { id name title } }"}'
```

**Deliverable**: Deployed API Mesh with GraphQL endpoint

---

## Task 2: EDS Repository Setup

### 2.1 Clone and Configure `accs-citisignal`

**Repository**: `https://github.com/demo-system-stores/accs-citisignal`

**Commands**:
```bash
# Clone repository
git clone https://github.com/demo-system-stores/accs-citisignal.git
cd accs-citisignal

# Install dependencies
npm install

# Review existing structure
ls -la blocks/
ls -la scripts/
```

**Review**:
- Existing EDS blocks (Accordion, Cards, Carousel, etc.)
- Dropin integration (`scripts/__dropins__/`)
- Build configuration (`build.mjs`)
- Demo configuration (`demo-config.json`, `demo-config-aco.json`)

**Deliverable**: Understanding of `accs-citisignal` structure

---

### 2.2 Configure Environment Variables

**File**: `accs-citisignal/.env` (create if not exists)

```bash
# Adobe Commerce
COMMERCE_ENDPOINT=https://your-commerce-instance.adobe.io
COMMERCE_GRAPHQL_ENDPOINT=https://your-commerce-instance.adobe.io/graphql

# ACO
ACO_ENDPOINT=https://your-aco-instance.adobe.io
ACO_API_KEY=your-aco-api-key
ACO_ORG_ID=your-aco-org-id

# API Mesh
API_MESH_ENDPOINT=https://graph.adobe.io/api/buildright-mesh/graphql
API_MESH_API_KEY=your-mesh-api-key

# EDS
EDS_PROJECT=accs-citisignal
EDS_BRANCH=main
```

**File**: `accs-citisignal/demo-config-buildright.json` (new)

```json
{
  "commerce": {
    "endpoint": "${API_MESH_ENDPOINT}",
    "apiKey": "${API_MESH_API_KEY}"
  },
  "personas": {
    "enabled": true,
    "defaultPersona": "sarah",
    "personas": [
      {
        "id": "sarah",
        "name": "Sarah Martinez",
        "title": "Production Builder",
        "customerGroup": "Production-Builder"
      },
      {
        "id": "marcus",
        "name": "Marcus Johnson",
        "title": "General Contractor",
        "customerGroup": "Trade-Professional"
      },
      {
        "id": "lisa",
        "name": "Lisa Chen",
        "title": "Remodeling Contractor",
        "customerGroup": "Trade-Professional"
      },
      {
        "id": "david",
        "name": "David Thompson",
        "title": "Pro Homeowner",
        "customerGroup": "Retail-Registered"
      },
      {
        "id": "kevin",
        "name": "Kevin Rodriguez",
        "title": "Store Manager",
        "customerGroup": "Wholesale-Reseller"
      }
    ]
  },
  "features": {
    "personaDashboards": true,
    "projectBuilder": true,
    "policyFiltering": true,
    "tierPricing": true
  }
}
```

**Deliverable**: Environment configuration files

---

### 2.3 Migrate BuildRight Code to EDS

**Source**: `buildright-eds` repository  
**Target**: `accs-citisignal` repository

**Migration Plan**:

#### Custom Blocks to Migrate
```
buildright-eds/blocks/              → accs-citisignal/blocks/
├─ persona-dashboard/               → persona-dashboard/
├─ project-builder/                 → project-builder/
├─ project-filter/                  → project-filter/
├─ pricing-display/                 → pricing-display/
├─ tier-badge/                      → tier-badge/
├─ wizard-progress/                 → wizard-progress/
└─ wizard-sidebar/                  → wizard-sidebar/
```

#### Scripts to Migrate
```
buildright-eds/scripts/             → accs-citisignal/scripts/
├─ persona-config.js                → persona-config.js (NEW)
├─ aco-service.js                   → REPLACE with api-mesh-client.js
├─ auth.js                          → UPDATE to use @dropins/storefront-auth
├─ pricing-calculator.js            → pricing-calculator.js (UPDATE)
└─ project-builder.js               → project-builder.js (UPDATE)
```

#### Pages to Migrate
```
buildright-eds/pages/               → accs-citisignal/ (root)
├─ dashboard.html                   → dashboard.html
├─ builder.html                     → builder.html
├─ catalog.html                     → catalog.html (UPDATE)
├─ product-detail.html              → product-detail.html (UPDATE)
└─ cart.html                        → cart.html (UPDATE)
```

**Migration Commands**:
```bash
# From buildright-eds directory
cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-eds

# Copy custom blocks
cp -r blocks/persona-dashboard ../accs-citisignal/blocks/
cp -r blocks/project-builder ../accs-citisignal/blocks/
cp -r blocks/project-filter ../accs-citisignal/blocks/
cp -r blocks/pricing-display ../accs-citisignal/blocks/
cp -r blocks/tier-badge ../accs-citisignal/blocks/
cp -r blocks/wizard-progress ../accs-citisignal/blocks/
cp -r blocks/wizard-sidebar ../accs-citisignal/blocks/

# Copy scripts
cp scripts/persona-config.js ../accs-citisignal/scripts/
cp scripts/pricing-calculator.js ../accs-citisignal/scripts/
cp scripts/project-builder.js ../accs-citisignal/scripts/

# Copy pages
cp pages/dashboard.html ../accs-citisignal/
cp pages/builder.html ../accs-citisignal/
```

**Deliverable**: BuildRight code migrated to `accs-citisignal`

---

## Task 3: API Mesh Integration

### 3.1 Create API Mesh Client

**File**: `accs-citisignal/scripts/api-mesh-client.js` (NEW)

```javascript
/**
 * API Mesh Client
 * Replaces mock ACO service with real API Mesh calls
 */

const API_MESH_ENDPOINT = window.apiMeshConfig?.endpoint || 
  'https://graph.adobe.io/api/buildright-mesh/graphql';
const API_MESH_API_KEY = window.apiMeshConfig?.apiKey;

/**
 * Execute GraphQL query via API Mesh
 */
async function executeQuery(query, variables = {}, headers = {}) {
  const response = await fetch(API_MESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_MESH_API_KEY,
      ...headers
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    throw new Error(`API Mesh error: ${response.statusText}`);
  }
  
  const { data, errors } = await response.json();
  
  if (errors) {
    console.error('GraphQL errors:', errors);
    throw new Error(errors[0].message);
  }
  
  return data;
}

/**
 * Get current persona
 */
export async function getCurrentPersona() {
  const query = `
    query GetCurrentPersona {
      currentPersona {
        id
        name
        title
        description
        customerGroup
        attributes {
          constructionPhase
          qualityTier
          packageTier
          roomCategory
          deckCompatible
          deckShape
          deckMaterialType
          storeVelocityCategory
          restockPriority
        }
      }
    }
  `;
  
  const data = await executeQuery(query);
  return data.currentPersona;
}

/**
 * Get persona-filtered products
 */
export async function getPersonaProducts(search = '', pageSize = 24, currentPage = 1) {
  const query = `
    query GetPersonaProducts($search: String, $pageSize: Int, $currentPage: Int) {
      personaProducts(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
        totalCount
        items {
          sku
          name
          description
          image {
            url
          }
          priceRange {
            minimumPrice {
              regularPrice {
                value
                currency
              }
              finalPrice {
                value
                currency
              }
            }
          }
        }
        pageInfo {
          currentPage
          totalPages
        }
      }
    }
  `;
  
  const data = await executeQuery(query, { search, pageSize, currentPage });
  return data.personaProducts;
}

/**
 * Get persona-specific pricing
 */
export async function getPersonaPricing(sku) {
  const query = `
    query GetPersonaPricing($sku: String!) {
      personaPricing(sku: $sku) {
        sku
        customerGroupPrice {
          value
          currency
        }
        volumeTiers {
          quantity
          price {
            value
            currency
          }
          discount
        }
        savings {
          value
          currency
        }
        savingsPercent
      }
    }
  `;
  
  const data = await executeQuery(query, { sku });
  return data.personaPricing;
}

/**
 * Get product details
 */
export async function getProduct(sku) {
  const query = `
    query GetProduct($sku: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          sku
          name
          description {
            html
          }
          image {
            url
          }
          mediaGallery {
            url
            label
          }
          priceRange {
            minimumPrice {
              regularPrice {
                value
                currency
              }
              finalPrice {
                value
                currency
              }
            }
          }
          ... on ConfigurableProduct {
            configurableOptions {
              attributeCode
              label
              values {
                valueIndex
                label
              }
            }
          }
        }
      }
    }
  `;
  
  const data = await executeQuery(query, { sku });
  return data.products.items[0];
}

// Export all functions
export default {
  getCurrentPersona,
  getPersonaProducts,
  getPersonaPricing,
  getProduct,
  executeQuery
};
```

**Deliverable**: API Mesh client module

---

### 3.2 Update Scripts to Use API Mesh

#### Update `pricing-calculator.js`
```javascript
// OLD: import { getMockPricing } from './aco-service.js';
// NEW:
import { getPersonaPricing } from './api-mesh-client.js';

export async function calculatePrice(sku, quantity, customerGroup) {
  // OLD: const pricing = await getMockPricing(sku, customerGroup);
  // NEW:
  const pricing = await getPersonaPricing(sku);
  
  // Find applicable volume tier
  const tier = pricing.volumeTiers
    .reverse()
    .find(t => quantity >= t.quantity);
  
  return {
    unitPrice: tier.price.value,
    totalPrice: tier.price.value * quantity,
    discount: tier.discount,
    savings: pricing.savings.value * quantity
  };
}
```

#### Update `project-builder.js`
```javascript
// OLD: import { getMockProducts } from './aco-service.js';
// NEW:
import { getPersonaProducts } from './api-mesh-client.js';

export async function loadProjectProducts(category) {
  // OLD: const products = await getMockProducts({ category });
  // NEW:
  const result = await getPersonaProducts(category, 100, 1);
  return result.items;
}
```

**Deliverable**: Updated scripts using API Mesh

---

## Task 4: Adobe Commerce Dropin Integration

### 4.1 Update Authentication to Use Real Dropin

**File**: `accs-citisignal/scripts/auth.js`

```javascript
import { initialize } from '@dropins/storefront-auth';

// Initialize Auth Dropin with API Mesh endpoint
await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

// Replace mock login with real authentication
export async function login(email, password) {
  const { signIn } = await import('@dropins/storefront-auth/api');
  
  try {
    const result = await signIn({ email, password });
    
    if (result.success) {
      // Get customer persona
      const { getCurrentPersona } = await import('./api-mesh-client.js');
      const persona = await getCurrentPersona();
      
      // Store persona in session
      sessionStorage.setItem('currentPersona', JSON.stringify(persona));
      
      return { success: true, persona };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Replace mock logout
export async function logout() {
  const { signOut } = await import('@dropins/storefront-auth/api');
  await signOut();
  sessionStorage.removeItem('currentPersona');
}

// Get current user
export async function getCurrentUser() {
  const { getCustomer } = await import('@dropins/storefront-auth/api');
  return await getCustomer();
}
```

**Deliverable**: Real authentication integration

---

### 4.2 Update Product Display to Use Real Dropin

**File**: `accs-citisignal/blocks/product-detail/product-detail.js`

```javascript
import { initialize } from '@dropins/storefront-pdp';

// Initialize PDP Dropin
await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

export default async function decorate(block) {
  const { render } = await import('@dropins/storefront-pdp/api');
  
  // Get SKU from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sku = urlParams.get('sku');
  
  // Render PDP with persona pricing
  await render(block, {
    sku,
    enablePersonaPricing: true,
    enableVolumeTiers: true
  });
}
```

**Deliverable**: Real PDP integration

---

### 4.3 Update Cart to Use Real Dropin

**File**: `accs-citisignal/blocks/cart/cart.js`

```javascript
import { initialize } from '@dropins/storefront-cart';

// Initialize Cart Dropin
await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

export default async function decorate(block) {
  const { render } = await import('@dropins/storefront-cart/api');
  
  // Render cart with persona pricing
  await render(block, {
    enablePersonaPricing: true,
    showSavings: true
  });
}
```

**Deliverable**: Real cart integration

---

## Task 5: EDS Deployment

### 5.1 Configure EDS Project

**File**: `accs-citisignal/fstab.yaml`

```yaml
mountpoints:
  /: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

**File**: `accs-citisignal/head.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script src="/scripts/aem.js" type="module"></script>
<script src="/scripts/scripts.js" type="module"></script>
<link rel="stylesheet" href="/styles/styles.css"/>
<link rel="icon" href="data:,">

<!-- API Mesh Configuration -->
<script>
  window.apiMeshConfig = {
    endpoint: 'https://graph.adobe.io/api/buildright-mesh/graphql',
    apiKey: 'YOUR_API_KEY'
  };
</script>
```

**Deliverable**: EDS project configuration

---

### 5.2 Deploy to EDS

**Prerequisites**:
- GitHub repository (`accs-citisignal`) connected to EDS
- Google Drive or SharePoint for content authoring
- EDS project configured in Adobe Cloud

**Commands**:
```bash
# Commit and push changes
cd accs-citisignal
git add .
git commit -m "feat: integrate BuildRight persona demo"
git push origin main

# EDS will auto-deploy on push to main
```

**Expected Result**:
```
✓ EDS deployment triggered
✓ Building assets...
✓ Deploying to https://main--accs-citisignal--demo-system-stores.aem.live
✓ Deployment complete
```

**Validation**:
```bash
# Test deployed site
curl https://main--accs-citisignal--demo-system-stores.aem.live
```

**Deliverable**: Live EDS deployment

---

## Task 6: End-to-End Testing

### 6.1 Test Authentication Flow

**Test**:
1. Navigate to `https://main--accs-citisignal--demo-system-stores.aem.live/login`
2. Log in as Sarah Martinez (`sarah.martinez@sunbelthomes.com`)
3. Verify persona dashboard loads
4. Verify customer group is "Production-Builder"
5. Verify custom attributes are set

**Expected Result**: Successful login with persona assignment

---

### 6.2 Test Policy Filtering

**Test**:
1. Log in as Marcus Johnson
2. Navigate to catalog
3. Select "Foundation & Framing" phase
4. Verify only foundation/framing products shown
5. Check network tab for `AC-Policy-Phase` header

**Expected Result**: Products filtered by ACO policy

---

### 6.3 Test Persona Pricing

**Test**:
1. Log in as Sarah Martinez (Production-Builder, 15% off)
2. View product detail page
3. Verify pricing shows 15% discount
4. Add 100 units to cart
5. Verify volume tier pricing applies (additional 3% off)
6. Check cart total

**Expected Result**: Correct tier + volume pricing

---

### 6.4 Test Project Builder

**Test**:
1. Log in as Marcus Johnson
2. Navigate to project builder
3. Select "Custom Home" template
4. Add products to project
5. Verify pricing is Trade-Professional (10% off)
6. Save project
7. Load project

**Expected Result**: Project builder works with real data

---

## Task 7: Performance Optimization

### 7.1 Enable EDS Caching

**File**: `accs-citisignal/.hlxignore`

```
# Cache static assets
*.js
*.css
*.png
*.jpg
*.svg

# Don't cache dynamic content
/api/*
/graphql/*
```

**Deliverable**: Optimized caching configuration

---

### 7.2 Optimize API Mesh Queries

**Strategy**:
- Use GraphQL fragments for reusable fields
- Implement query batching
- Add DataLoader for N+1 prevention
- Enable mesh caching

**File**: `buildright-mesh/mesh.json` (update)

```json
{
  "meshConfig": {
    "cache": {
      "enabled": true,
      "ttl": 300
    }
  }
}
```

**Deliverable**: Optimized API performance

---

## Task 8: Documentation

### 8.1 Create Production Runbook

**File**: `accs-citisignal/docs/PRODUCTION-RUNBOOK.md`

**Contents**:
- Deployment process
- Environment variables
- API Mesh endpoints
- Monitoring and alerts
- Rollback procedures
- Troubleshooting guide

**Deliverable**: Production operations documentation

---

### 8.2 Update Architecture Diagrams

**File**: `buildright-eds/docs/PRODUCTION-ARCHITECTURE.md`

**Contents**:
- Production architecture diagram
- Data flow diagrams
- Integration points
- Security considerations
- Scalability notes

**Deliverable**: Production architecture documentation

---

## Success Criteria

✅ API Mesh deployed and operational  
✅ `accs-citisignal` repository configured  
✅ BuildRight code migrated to EDS  
✅ API Mesh client integrated  
✅ Adobe Commerce Dropins using real backend  
✅ EDS site deployed to production  
✅ Authentication working with real Adobe Commerce  
✅ Policy filtering working via ACO  
✅ Persona pricing working (tier + volume)  
✅ Project builder working with real data  
✅ Performance optimized  
✅ Production documentation complete

---

## Testing Checklist

### API Mesh
- [ ] Mesh deployed successfully
- [ ] GraphQL endpoint accessible
- [ ] Custom resolvers working
- [ ] Policy headers working
- [ ] Pricing queries working

### EDS Deployment
- [ ] Site deployed to production URL
- [ ] All pages loading correctly
- [ ] Custom blocks rendering
- [ ] Dropins initialized
- [ ] API Mesh connection working

### Authentication
- [ ] Can log in with demo accounts
- [ ] Persona assigned correctly
- [ ] Customer attributes retrieved
- [ ] Session persists
- [ ] Logout works

### Catalog & PDP
- [ ] Products load from ACO
- [ ] Policy filtering works
- [ ] Persona pricing displays
- [ ] Volume tiers show
- [ ] Add to cart works

### Cart & Checkout
- [ ] Cart shows correct pricing
- [ ] Volume discounts apply
- [ ] Savings displayed
- [ ] Checkout works

### Persona Features
- [ ] Dashboard loads persona data
- [ ] Project builder works
- [ ] Filters work
- [ ] Recommendations work

### Performance
- [ ] Page load < 2s
- [ ] API calls < 500ms
- [ ] Caching working
- [ ] No console errors

---

## Architecture Comparison

### Before (Mock)
```
User → buildright-eds (local)
       ├─ Mock ACO service
       ├─ Static JSON data
       └─ Demo auth
```

### After (Production)
```
User → Edge Delivery Services (accs-citisignal)
       ├─ Adobe Commerce Dropins
       └─ API Mesh Client
           ↓
       Adobe API Mesh (buildright-mesh)
       ├─ GraphQL Gateway
       ├─ Custom Resolvers
       └─ Policy/Pricing Logic
           ↓
       Adobe Commerce + ACO
       ├─ Customer Groups
       ├─ Custom Attributes
       ├─ Price Books
       ├─ Products
       └─ Policies
```

---

## Related Documents

- **`DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md`** ⭐ **NEW** - Step-by-step migration checklist
- **`DATA-SOURCE-MATRIX.md`** - Hybrid Commerce PaaS + ACO data architecture
- `PHASE-8-BACKEND-SETUP.md` - Backend configuration
- `buildright-aco/docs/SETUP-GUIDE.md` - Data generation
- `buildright-aco/docs/BUILDRIGHT-CASE-STUDY.md` - Use cases
- `PHASE-3-CORE-ARCHITECTURE.md` - Frontend architecture
- `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/commerce-mesh` - Mesh reference

**Note**: This Phase 9 document provides implementation details. For a complete, ordered migration checklist with before/after code examples, see **[DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md](./DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md)**.

---

## Next Steps

After Phase 9 completion:
1. **Production Launch**
   - Final testing
   - Performance validation
   - Security audit
   - Go-live

2. **Post-Launch**
   - Monitor performance
   - Gather feedback
   - Iterate on features
   - Scale as needed

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 16, 2024

