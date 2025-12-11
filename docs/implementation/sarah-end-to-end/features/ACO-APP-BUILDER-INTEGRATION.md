# ACO/App Builder Integration Strategy for BOM Service

**Date**: November 26, 2025  
**Status**: 📋 Architecture Guide  
**Version**: 1.0

## Overview

This document defines the integration strategy between Adobe Commerce Optimizer (ACO), App Builder, and the BuildRight EDS frontend for dynamic BOM generation and product catalog management.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BuildRight Ecosystem                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   BuildRight     │         │   App Builder    │         │   Adobe Commerce │
│   EDS Frontend   │◀───────▶│   Backend        │◀───────▶│   Optimizer      │
│                  │         │                  │         │   (ACO)          │
└──────────────────┘         └──────────────────┘         └──────────────────┘
     │                              │                              │
     │ UI Layer                     │ Business Logic              │ Data Layer
     │ - Project Builder            │ - BOM Calculator            │ - Product Catalog
     │ - Product Selection          │ - Price Calculator          │ - Pricing Engine
     │ - Dashboard                  │ - Persona Filter            │ - Inventory
     │ - Cart                       │ - Quote Generator           │ - Search Index
     │                              │ - Order Management          │
     │                              │                             │
     ▼                              ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Static HTML     │         │  Serverless      │         │  GraphQL API     │
│  + JavaScript    │         │  Functions       │         │  + REST API      │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

## Integration Layers

### Layer 1: Data Layer (ACO)

**Responsibilities:**
- Product catalog management (SKUs, names, descriptions)
- Pricing engine (price books, tiers, rules)
- Inventory tracking (stock levels, availability)
- Search indexing (GraphQL query optimization)

**ACO Entities:**
- **Products**: Master product data with attributes
- **Price Books**: Pricing by region, customer type, tier
- **Catalog Views**: Persona-specific product filtering
- **Attributes**: Custom fields (construction_phase, quality_tier, persona_relevance)

**APIs Used:**
- **GraphQL API**: Product queries, search, filtering
- **Catalog Service API**: Bulk operations, indexing
- **ACO SDK (TypeScript)**: Data ingestion, management

### Layer 2: Business Logic Layer (App Builder)

**Responsibilities:**
- BOM calculation with estimating formulas
- Price calculations and quote generation
- Persona-based catalog filtering
- Order processing and workflow
- Integration orchestration

**App Builder Actions:**
```
/api/v1/bom/calculate       - Calculate BOM for template
/api/v1/bom/estimate        - Get cost estimate
/api/v1/products/search     - Search products with persona filter
/api/v1/products/lookup     - Lookup by attributes
/api/v1/quotes/generate     - Generate customer quote
/api/v1/orders/create       - Create order from BOM
/api/v1/pricing/calculate   - Calculate total pricing
```

**App Builder Benefits:**
- Serverless scalability
- Adobe I/O Events integration
- Secure credential management
- Built-in authentication
- API gateway capabilities

### Layer 3: Presentation Layer (BuildRight EDS)

**Responsibilities:**
- User interface and interactions
- Template selection and customization
- Product browsing and selection
- BOM review and approval
- Cart and checkout

**EDS Features:**
- Fast page loads (static HTML)
- Progressive enhancement (JavaScript)
- Mobile-responsive design
- Accessible UI components
- SEO-friendly content

## BOM Calculator Integration Patterns

### Pattern 1: Server-Side Generation (Recommended)

**Flow:**
```
1. User selects template + package in EDS
2. EDS calls App Builder: POST /api/v1/bom/calculate
3. App Builder queries ACO for products
4. App Builder calculates BOM with formulas
5. App Builder returns BOM JSON to EDS
6. EDS displays BOM in dashboard
```

**Pros:**
- Secure product data access
- Centralized business logic
- Easier to update formulas
- Better performance (server-side caching)

**Cons:**
- Requires App Builder deployment
- Additional API latency
- More complex infrastructure

**Implementation:**

```javascript
// App Builder Action: actions/bom/calculate.js
const { calculateBOM } = require('./bom-calculator');
const { getACOProducts } = require('./aco-client');

async function main(params) {
  const { templateId, packageId, variantId } = params;
  
  // Validate inputs
  if (!templateId || !packageId) {
    return {
      statusCode: 400,
      body: { error: 'Missing required parameters' }
    };
  }
  
  try {
    // Get template and package data
    const template = await getTemplate(templateId);
    const package = await getPackage(packageId);
    const variant = variantId ? await getVariant(variantId) : null;
    
    // Calculate BOM (using ACO products)
    const bom = await calculateBOM(template, package, variant);
    
    return {
      statusCode: 200,
      body: bom
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}

exports.main = main;
```

```javascript
// EDS Frontend: scripts/services/bom-client.js
export async function generateBOM(templateId, packageId, variantId = null) {
  const response = await fetch('/api/v1/bom/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, packageId, variantId })
  });
  
  if (!response.ok) {
    throw new Error(`BOM generation failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Usage in Project Builder
const bom = await generateBOM('sedona', 'desert-ridge-premium');
displayBOM(bom);
```

### Pattern 2: Client-Side Generation (Current)

**Flow:**
```
1. User selects template + package in EDS
2. EDS calls BOM calculator locally (JavaScript)
3. BOM calculator queries ACO GraphQL directly
4. BOM calculator calculates with formulas
5. EDS displays BOM in dashboard
```

**Pros:**
- Simpler deployment (no App Builder needed)
- Lower latency (direct ACO access)
- Easier local development
- No server infrastructure

**Cons:**
- Exposes ACO credentials to client
- Business logic in frontend
- Harder to update formulas
- Limited caching capabilities

**Current Implementation:**
```javascript
// scripts/services/bom-calculator.js (running in browser)
import { calculateBOM } from './services/bom-calculator.js';

async function onTemplateSelected(template, package) {
  // Calculate BOM client-side
  const bom = await calculateBOM(template, package);
  displayBOM(bom);
}
```

**Migration Path:** Move to Pattern 1 for production.

### Pattern 3: Hybrid (Pre-Generated + Dynamic)

**Flow:**
```
1. Reference BOMs pre-generated and stored in EDS
2. User selects template + package
3. EDS loads pre-generated BOM from JSON
4. For customizations, call App Builder for delta
5. Merge base + delta for final BOM
```

**Pros:**
- Fast initial load (pre-generated)
- Dynamic customization support
- Reduced API calls
- Good for caching

**Cons:**
- BOMs can become stale
- Requires regeneration process
- More complex state management

**Implementation:**
```javascript
// Load pre-generated BOM
const baseBOM = await fetch(`/data/boms/${templateId}-${packageId}.json`)
  .then(r => r.json());

// If user customizes, calculate delta
if (hasCustomizations) {
  const delta = await fetch('/api/v1/bom/calculate-delta', {
    method: 'POST',
    body: JSON.stringify({ baseBOM, customizations })
  }).then(r => r.json());
  
  // Merge base + delta
  const finalBOM = mergeBOM(baseBOM, delta);
}
```

## Product Lookup Integration

### GraphQL Product Query

**Direct ACO Query (Client-Side):**

```javascript
// scripts/services/product-lookup.js
async function queryProducts(searchPhrase, filters = {}) {
  const query = {
    query: `
      query ProductSearch($phrase: String!, $filters: [SearchClauseInput!]) {
        productSearch(phrase: $phrase, filter: $filters, page_size: 100) {
          total_count
          items {
            productView {
              __typename
              sku
              name
              ... on SimpleProductView {
                price {
                  final {
                    amount {
                      value
                      currency
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { phrase: searchPhrase, filters }
  };
  
  const response = await fetch(ACO_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'AC-Environment-Id': ACO_TENANT_ID,
      'AC-Source-Locale': 'en-US',
      'AC-Price-Book-Id': 'US-Retail'
    },
    body: JSON.stringify(query)
  });
  
  return response.json();
}
```

**Via App Builder (Server-Side):**

```javascript
// App Builder Action: actions/products/search.js
async function main(params) {
  const { phrase, personaId, tier, category } = params;
  
  // Build filters
  const filters = [];
  if (personaId) {
    filters.push({ attribute: 'persona_relevance', eq: personaId });
  }
  if (tier) {
    filters.push({ attribute: 'quality_tier', eq: tier });
  }
  if (category) {
    filters.push({ attribute: 'product_category', eq: category });
  }
  
  // Query ACO
  const products = await queryACO(phrase, filters);
  
  return {
    statusCode: 200,
    body: { products, total: products.length }
  };
}
```

## Authentication & Security

### ACO Credentials

**Current: OAuth Client Credentials Flow**

```javascript
// buildright-aco/utils/oauth-token-manager.js
async function getAccessToken() {
  const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: 'openid,AdobeID,read_organizations'
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

**Recommended: App Builder JWT Authentication**

```javascript
// App Builder handles authentication
const { Core } = require('@adobe/aio-sdk');

async function getACOToken() {
  const orgId = process.env.AIO_ORG_ID;
  const apiKey = process.env.AIO_API_KEY;
  
  const accessToken = await Core.getAccessToken({
    orgId,
    apiKey,
    imsContextName: 'aio-cli-plugin-aco'
  });
  
  return accessToken;
}
```

### Security Best Practices

1. **Never Expose Credentials in Frontend**
   - ❌ Don't hardcode ACO credentials in JavaScript
   - ✅ Route all ACO calls through App Builder

2. **Use Environment Variables**
   ```bash
   # .env (App Builder)
   ACO_TENANT_ID=X2duJmy3FaTKf1Mmr4GiQY
   ACO_CLIENT_ID=xxxxx
   ACO_CLIENT_SECRET=xxxxx
   ACO_PRICE_BOOK_ID=US-Retail
   ```

3. **Implement Rate Limiting**
   ```javascript
   // Limit API calls to prevent abuse
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // 100 requests per window
   });
   ```

4. **Cache Aggressively**
   ```javascript
   // Cache product catalog
   const cache = new Map();
   const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
   
   async function getProducts() {
     if (cache.has('products') && Date.now() - cache.get('products').timestamp < CACHE_TTL) {
       return cache.get('products').data;
     }
     
     const products = await queryACO();
     cache.set('products', { data: products, timestamp: Date.now() });
     return products;
   }
   ```

## Deployment Architecture

### Development Environment

```
Local Development:
- EDS Frontend: http://localhost:8000
- App Builder: http://localhost:3000 (local runtime)
- ACO: Sandbox environment (na1-sandbox)

Workflow:
1. Edit EDS files → auto-reload at localhost:8000
2. Edit App Builder actions → aio app run
3. Test ACO queries → buildright-aco scripts
```

### Staging Environment

```
Staging URLs:
- EDS Frontend: https://staging.buildright.com (AEM Preview)
- App Builder: https://staging-api.buildright.com
- ACO: Sandbox environment

Workflow:
1. Push to staging branch → AEM auto-deploys
2. Deploy App Builder → aio app deploy --no-publish
3. Run integration tests
```

### Production Environment

```
Production URLs:
- EDS Frontend: https://buildright.com (AEM Live)
- App Builder: https://api.buildright.com
- ACO: Production environment

Workflow:
1. Push to main branch → AEM auto-deploys to live
2. Deploy App Builder → aio app deploy --publish
3. ACO products ingested via scheduled job
4. Monitor with Adobe I/O Runtime logs
```

## Performance Optimization

### 1. Product Catalog Caching

```javascript
// Cache all products on App Builder startup
let productCache = null;
let cacheTimestamp = null;

async function refreshProductCache() {
  console.log('Refreshing product cache...');
  productCache = await queryAllProducts();
  cacheTimestamp = Date.now();
  console.log(`Cached ${productCache.length} products`);
}

// Refresh every 5 minutes
setInterval(refreshProductCache, 5 * 60 * 1000);

// Initial refresh
refreshProductCache();
```

### 2. BOM Pre-Generation

```bash
# Cron job to regenerate BOMs nightly
0 2 * * * cd /app/buildright-eds && node scripts/generate-bom.js --all
```

```javascript
// Store generated BOMs in fast storage
const generatedBOMs = new Map();

async function getBOM(templateId, packageId) {
  const key = `${templateId}-${packageId}`;
  
  // Check cache first
  if (generatedBOMs.has(key)) {
    return generatedBOMs.get(key);
  }
  
  // Load from pre-generated file
  const bom = await loadBOMFile(key);
  generatedBOMs.set(key, bom);
  return bom;
}
```

### 3. CDN for Static BOMs

```
CloudFlare/Fastly CDN:
https://cdn.buildright.com/boms/sedona-desert-ridge-premium.json

Benefits:
- Global edge caching
- <50ms response time
- Reduced App Builder load
- Better scalability
```

## Monitoring & Observability

### App Builder Logging

```javascript
const { Core } = require('@adobe/aio-sdk');
const logger = Core.Logger('bom-calculator');

async function calculateBOM(template, package) {
  logger.info('Starting BOM calculation', { template: template.id, package: package.id });
  
  try {
    const bom = await performCalculation(template, package);
    logger.info('BOM calculation successful', { 
      templateId: template.id,
      totalCost: bom.summary.totalCost,
      lineItems: bom.summary.totalItems
    });
    return bom;
  } catch (error) {
    logger.error('BOM calculation failed', { 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Metrics to Track

- **API Response Times**: 95th percentile < 500ms
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%
- **ACO Query Time**: < 2s
- **BOM Calculation Time**: < 100ms

### Adobe I/O Events

```javascript
// Emit events for monitoring
const { Events } = require('@adobe/aio-sdk');

await Events.publish({
  type: 'com.buildright.bom.calculated',
  source: 'bom-calculator-action',
  data: {
    templateId: 'sedona',
    packageId: 'desert-ridge-premium',
    totalCost: 49534.48,
    timestamp: new Date().toISOString()
  }
});
```

## Migration Roadmap

### Phase 1: Current State (✅ Complete)
- [x] Product catalog in ACO (265 products)
- [x] Client-side BOM calculator in EDS
- [x] Direct ACO GraphQL queries
- [x] Reference BOMs generated

### Phase 2: App Builder Foundation (Next)
- [ ] Create App Builder project
- [ ] Implement BOM calculation action
- [ ] Implement product search action
- [ ] Deploy to staging
- [ ] Integrate with EDS frontend

### Phase 3: Production Readiness
- [ ] Move credentials to App Builder
- [ ] Implement caching layer
- [ ] Add monitoring and logging
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deploy to production

### Phase 4: Advanced Features
- [ ] Real-time BOM updates
- [ ] Variant delta calculations
- [ ] Quote generation API
- [ ] Order creation workflow
- [ ] Inventory availability checks

## Conclusion

The ACO/App Builder/EDS integration provides a robust, scalable architecture for dynamic BOM generation:

- **ACO** manages the product catalog and pricing
- **App Builder** handles business logic and orchestration
- **EDS** provides the user interface and experience

This separation of concerns enables:
- Independent scaling of each layer
- Secure credential management
- Flexible deployment options
- Easy maintenance and updates

---

**Status**: Architecture defined, Pattern 2 (client-side) implemented  
**Next Step**: Migrate to Pattern 1 (server-side) via App Builder  
**Related Docs**: 
- [BOM Calculator Summary](BOM-CALCULATOR-SUMMARY.md)
- [ACO Catalog Architecture](ACO-CATALOG-ARCHITECTURE.md)
- [ACO Cleanup Lessons Learned](/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco/ACO-CLEANUP-LESSONS-LEARNED.md)

