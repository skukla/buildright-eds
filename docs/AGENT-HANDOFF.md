# BuildRight Demo System - Agent Handoff Document

> **Created:** December 11, 2025  
> **Updated:** December 2024  
> **Purpose:** Comprehensive context for continuing development with a new AI agent  
> **Current Focus:** Commerce Dropins integration, then Persona implementations  
> **Master Plan:** [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Architecture Overview](#architecture-overview)
4. [Current Implementation Status](#current-implementation-status)
5. [Key Technical Decisions](#key-technical-decisions)
6. [Persona System](#persona-system)
7. [Data Flow](#data-flow)
8. [Immediate Next Steps](#immediate-next-steps)
9. [Known Issues & Technical Debt](#known-issues--technical-debt)
10. [Important Files Reference](#important-files-reference)

---

## Project Overview

**BuildRight** is a B2B construction supply demo system showcasing Adobe's commerce ecosystem. It demonstrates:

- **Adobe Commerce Optimizer (ACO)** for product catalog and search
- **Adobe Commerce PaaS** for customer management, orders, and cart
- **Adobe API Mesh** as a unified GraphQL gateway
- **Adobe I/O Runtime Actions** for custom business logic
- **Edge Delivery Services (EDS)** patterns for the frontend

### Business Context

BuildRight is a fictional construction supply company serving multiple customer segments:
- Production home builders (high volume)
- General contractors
- Remodeling contractors
- DIY homeowners
- Wholesale resellers (lumber yards)

### Key Demo Features

1. **Bill of Materials (BOM) Builder** - Configure home templates, select materials, generate itemized BOMs
2. **Persona-based pricing** - Different customer groups see different prices and catalog views
3. **B2B workflows** - Volume pricing, customer-specific catalogs, multi-location support

---

## Repository Structure

```
adobe-demo-system/
├── buildright-eds/          # Frontend (EDS-style prototype)
├── buildright-service/      # API Mesh + I/O Runtime Actions
├── buildright-aco/          # ACO data ingestion scripts
└── buildright-commerce/     # Commerce PaaS setup scripts
```

### buildright-eds (Frontend)

```
buildright-eds/
├── blocks/                  # EDS-style blocks
│   ├── header/             # Site header with auth integration
│   ├── product-grid/       # Catalog with infinite scroll
│   ├── pricing-display/    # Persona-aware pricing on PDP
│   ├── product-gallery/    # PDP image gallery
│   └── ...
├── pages/                   # HTML pages (not EDS-authored yet)
│   ├── build-configurator.html
│   ├── bom-review.html
│   ├── product-detail.html
│   └── ...
├── scripts/
│   ├── auth.js             # Demo auth system (to be replaced with dropins)
│   ├── site-config.js      # Centralized configuration
│   ├── services/
│   │   ├── catalog-service.js   # Strategy pattern for data sources
│   │   ├── mesh-client.js       # API Mesh GraphQL client
│   │   └── queries.js           # GraphQL query definitions
│   └── ...
└── docs/                    # Documentation
```

### buildright-service (Backend)

```
buildright-service/
├── actions/
│   ├── bom/                # BOM generation action
│   │   ├── index.js        # Main BOM resolver
│   │   ├── bom-calculator.js
│   │   ├── templates/data/ # Template definitions
│   │   ├── packages/data/  # Material packages
│   │   ├── variants/data/  # Floor plan variants
│   │   └── criteria/data/  # Product selection criteria
│   └── persona/            # Persona resolution action
│       ├── index.js        # Maps Commerce groups → ACO context
│       └── data/persona-mappings.json
├── mesh/
│   ├── mesh.config.js      # API Mesh configuration
│   └── schema/
│       ├── bom.graphql
│       └── persona.graphql
└── docs/
    └── services/
        ├── BOM-SERVICE.md
        └── PERSONA-SERVICE.md
```

### buildright-aco (ACO Data)

```
buildright-aco/
├── data/buildright/         # Product data JSON files
│   ├── products.json        # Simple products
│   └── bundles.json         # Bundle products
├── scripts/
│   ├── ingest-products.js   # Ingest products to ACO
│   ├── ingest-bundles.js    # Ingest bundles to ACO
│   ├── fetch-catalog-views.js  # Fetch ACO catalog views
│   └── delete-orphans.js    # Clean up orphaned products
└── utils/
    └── aco-client.js        # ACO API utilities
```

### buildright-commerce (Commerce PaaS)

```
buildright-commerce/
├── scripts/
│   ├── import-all.js        # Orchestrates all imports
│   ├── import-customers.js  # Import demo customers
│   └── ...
├── lib/
│   ├── commerce-api.js      # Commerce REST API client
│   └── commerce-config.js   # Demo data definitions
└── data/                    # Generated import files
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BuildRight Frontend                          │
│                        (buildright-eds)                              │
├─────────────────────────────────────────────────────────────────────┤
│  Custom Blocks          │  Auth System (demo)   │  Services          │
│  ├─ product-grid        │  └─ auth.js           │  ├─ catalog-service│
│  ├─ pricing-display     │                       │  ├─ mesh-client    │
│  ├─ product-gallery     │  TO BE REPLACED BY:   │  └─ queries.js     │
│  └─ build-configurator  │  Commerce Dropins     │                    │
└─────────────────────────┴───────────────────────┴────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Mesh                                    │
│                    (buildright-service/mesh)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Mesh ID: 2463edc1-5cf7-4393-af04-95a3d1b6973c                      │
│  Endpoint: https://edge-sandbox-graph.adobe.io/api/{meshId}/graphql │
├─────────────────────────────────────────────────────────────────────┤
│  Sources:                                                            │
│  ├─ ACO (Adobe Commerce Optimizer) - Product catalog & search       │
│  └─ I/O Runtime Actions - Custom resolvers                          │
├─────────────────────────────────────────────────────────────────────┤
│  Custom Resolvers:                                                   │
│  ├─ BuildRight_generateBOMFromTemplate → BOM Action                 │
│  ├─ BuildRight_personaForCustomer → Persona Action                  │
│  ├─ BuildRight_personaByEmail → Persona Action                      │
│  └─ BuildRight_getProductBySKU → ACO with persona headers           │
└─────────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐  ┌──────────────────────────────────┐
│   Adobe Commerce Optimizer    │  │    Adobe I/O Runtime Actions     │
│          (ACO)                │  │     (buildright-service)         │
├───────────────────────────────┤  ├──────────────────────────────────┤
│  • Product catalog            │  │  BOM Action:                     │
│  • Faceted search             │  │  • Template resolution           │
│  • Multiple catalog views     │  │  • Product matching via ACO      │
│  • Price books                │  │  • Quantity calculation          │
│                               │  │                                  │
│  Catalog Views:               │  │  Persona Action:                 │
│  • BuildRight-Default         │  │  • Maps email → customer group   │
│  • BuildRight-Production-...  │  │  • Resolves catalogViewId        │
│  • BuildRight-Trade-...       │  │  • Dynamically queries ACO Admin │
│  • BuildRight-Retail-...      │  │    API for view UUIDs            │
│  • BuildRight-Wholesale-...   │  │                                  │
└───────────────────────────────┘  └──────────────────────────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────────┐
                               │     Adobe Commerce PaaS          │
                               │     (buildright-commerce)        │
                               ├──────────────────────────────────┤
                               │  • Customer management           │
                               │  • Customer groups               │
                               │  • Custom attributes:            │
                               │    - aco_catalog_view_id         │
                               │    - aco_price_book_id           │
                               │  • Orders (future)               │
                               │  • Cart (future - via dropins)   │
                               └──────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| ACO Product Ingestion | ✅ Complete | 158 products + bundles |
| API Mesh Integration | ✅ Complete | Unified GraphQL gateway |
| Product Catalog (frontend) | ✅ Complete | Infinite scroll, faceted search |
| PDP with persona pricing | ✅ Complete | Tier badges, volume pricing |
| BOM Builder | ✅ Complete | Template → line items via mesh |
| Persona Action | ✅ Complete | Dynamic ACO catalog view resolution |
| Commerce Customer Setup | ✅ Complete | 5 demo customers with custom attributes |
| Currency Formatting | ✅ Complete | `formatCurrency()` utility everywhere |
| **Dropins Architecture Decisions** | ✅ Complete | Commerce + Custom SDK dropins strategy |

### Key Decisions Made (December 2024)

| Decision | Details |
|----------|---------|
| Use Commerce Dropins for Commerce data | Auth, Cart, Checkout, Orders |
| Create Custom SDK Dropins for ACO data | Product Grid, PDP, Project Builder |
| Keep Persona Service | Works WITH Auth Dropin (not replaced) |
| No dual-mode auth | Dropins are primary; demo mode deprecated |

See [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md) for full decision log.

### 🔄 Current Focus: Sarah End-to-End

Complete Sarah's entire experience (including all infrastructure) before other personas.

| Order | Phase | Status | Description |
|-------|-------|--------|-------------|
| 1 | Phase 5.5 | 🔲 Next | Commerce Dropins (for Sarah) |
| 2 | Phase 6A | 🔄 In Progress | Sarah's features (configurator, BOM) |
| 3 | Phase 7 | 🔲 Planned | Custom SDK Dropins (for Sarah) |
| 4 | Phase 8 | 🔲 Planned | Polish Sarah's experience |

### 🔲 Deferred: Other Personas (End of Project)

| Phase | Persona | Status |
|-------|---------|--------|
| 6B | Marcus Johnson | 🔲 After Sarah |
| 6C | Lisa Chen | 🔲 After Sarah |
| 6D | David Thompson | 🔲 After Sarah |
| 6E | Kevin Rodriguez | 🔲 After Sarah |

---

## Key Technical Decisions

### 1. Hybrid Catalog Architecture

**Decision:** Use ACO for products, Commerce for customers/orders.

**Rationale:** ACO provides superior search/filtering for product discovery. Commerce handles B2B customer relationships and transactions.

**Implication:** Commerce Dropins for cart/checkout will add items by SKU, not by Commerce product ID.

### 2. Name-Based ACO Catalog View Mapping

**Decision:** Store human-readable catalog view names in `persona-mappings.json`, resolve UUIDs dynamically via ACO Admin GraphQL API.

**Rationale:** ACO doesn't provide a programmatic way to create catalog views - admins create them manually. Storing UUIDs would require updates whenever views are recreated.

**Implementation:**
```json
// persona-mappings.json
{
  "mappings": {
    "1": {
      "catalogViewName": "BuildRight-Production-Builder",  // Human-readable
      "priceBookId": "Production-Builder"
    }
  },
  "catalogViewCache": {
    "BuildRight-Production-Builder": "22c02790-..."  // Resolved UUID
  }
}
```

### 3. Email-Based Persona Lookup

**Decision:** Frontend uses email to look up persona, not customer group ID.

**Rationale:** The demo auth system doesn't have access to Commerce customer data. Using email allows the persona action to query Commerce for the real customer group.

**Flow:**
```
User logs in → auth.js stores email → catalog-service calls initializePersonaByEmail 
→ persona action queries Commerce for customer group → returns ACO context
```

### 4. Frontend Caching Strategy

**Decision:** Cache persona data in `sessionStorage`, clear on logout.

**Implementation in `auth.js`:**
```javascript
logout() {
  sessionStorage.removeItem('buildright_persona');
  sessionStorage.removeItem('buildright_persona_headers');
  sessionStorage.removeItem('buildright_persona_email');
  catalogService.reset();
  // ... clear other state
}
```

### 5. Mesh Endpoint Configuration

**Decision:** Store mesh endpoint in `site-config.js`, not environment variables.

**Rationale:** EDS frontend doesn't have build-time env injection. The mesh endpoint is public (auth is via headers).

```javascript
// scripts/site-config.js
export const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql';
```

---

## Persona System

### Demo Personas

| Persona | Email | Commerce Group ID | ACO Catalog View | Price Book |
|---------|-------|-------------------|------------------|------------|
| Sarah Martinez | sarah.martinez@sunbelthomes.com | 1 | BuildRight-Production-Builder | Production-Builder |
| Marcus Johnson | marcus.johnson@johnsonconstruction.com | 2 | BuildRight-Trade-Professional | Trade-Professional |
| Lisa Chen | lisa.chen@chendesignbuild.com | 3 | BuildRight-Trade-Professional | Trade-Professional |
| David Thompson | david.thompson@email.com | 4 | BuildRight-Retail-Registered | Retail-Registered |
| Kevin Rodriguez | kevin.rodriguez@precisionlumber.com | 5 | BuildRight-Wholesale-Reseller | Wholesale-Reseller |
| Guest (unauthenticated) | - | 0 | BuildRight-Default | US-Retail |

### Persona Action Flow

```
┌─────────────────┐
│   Frontend      │
│ (mesh-client)   │
└────────┬────────┘
         │ BuildRight_personaByEmail(email: "sarah...")
         ▼
┌─────────────────┐
│   API Mesh      │
└────────┬────────┘
         │ Calls persona action
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Persona Action                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Look up email in emailMappings → customerGroupId         │
│ 2. Look up customerGroupId in mappings → catalogViewName    │
│ 3. Call ACO Admin API: GET catalogViews                     │
│ 4. Find view by name → get UUID                             │
│ 5. Cache UUID in catalogViewCache                           │
│ 6. Return { id, name, catalogViewId, priceBookId, ... }     │
└─────────────────────────────────────────────────────────────┘
```

### Files

- **Mapping data:** `buildright-service/actions/persona/data/persona-mappings.json`
- **Action logic:** `buildright-service/actions/persona/index.js`
- **GraphQL schema:** `buildright-service/mesh/schema/persona.graphql`
- **Documentation:** `buildright-service/docs/services/PERSONA-SERVICE.md`

---

## Data Flow

### Product Catalog Flow

```
User visits catalog → product-grid block → catalogService.searchWithFacets()
    → mesh-client.meshQuery(QUERY_SEARCH_PRODUCTS) 
    → API Mesh → ACO_productSearch (with X-Catalog-View-Id header)
    → ACO returns products with persona-specific visibility/pricing
    → Render product cards with formatCurrency()
```

### PDP Flow

```
User visits PDP → product-detail.html script
    → catalogService.getProduct(sku)
    → mesh-client.meshQuery(QUERY_GET_PRODUCT)
    → API Mesh → ACO_product (with persona headers)
    → PDP script constructs pricing object with volumeTiers
    → Passes to pricing-display and product-gallery blocks
```

### BOM Generation Flow

```
User configures build → build-configurator.js saves to localStorage
    → Navigate to bom-review.html
    → bom-review.js reads config from localStorage
    → mesh-client.meshQuery(QUERY_GENERATE_BOM)
    → API Mesh → BOM Action
        → Load template, packages, variants, criteria
        → For each construction phase:
            → Query ACO for matching products
            → Calculate quantities based on template specs
            → Build line items with pricing
        → Return BOM with metadata
    → Render BOM review UI
```

---

## Immediate Next Steps

### Current Phase: 5.5 (Commerce Dropins) + 6A (Sarah Persona)

See [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md) for the full plan.

### Phase 5.5: Commerce Dropins Integration

| Task | Status |
|------|--------|
| Finalize `scripts/initializers/` structure | 🔲 |
| Complete `auth-dropin` block | 🔲 |
| Wire `authenticated` event to `initializeMeshForEmail()` | 🔲 |
| Complete `commerce-mini-cart` block | 🔲 |
| Create `pages/checkout.html` with Checkout dropin | 🔲 |
| Implement order history with Order dropin | 🔲 |

### Phase 6A: Sarah Persona (In Progress)

| Task | Status |
|------|--------|
| Build Configurator (Sub-Phase 5) | 🔲 |
| My Builds Dashboard (Sub-Phase 6) | 🔲 |
| BOM Review Page (Sub-Phase 7) | 🔲 |
| Integration & Polish (Sub-Phase 8) | 🔲 |

### Architecture: Two Types of Dropins

```
┌─────────────────────────────────────────────────────────────┐
│                    Commerce Dropins                          │
│  (Auth, Cart, Checkout, Orders)                              │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ Auth Dropin  │ │  Cart Dropin   │ │ Order Dropin   │     │
│  └──────┬───────┘ └───────┬────────┘ └───────┬────────┘     │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          │ authenticated   │ cart/data        │ orders
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       Event Bus                              │
│  Standard @dropins/tools/event-bus.js                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Custom SDK Dropins (Phase 7)                 │
│  (Product Grid, PDP, Project Builder)                        │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ Product      │ │  Product       │ │ Project        │     │
│  │ Discovery    │ │  Detail        │ │ Builder        │     │
│  └──────┬───────┘ └───────┬────────┘ └───────┬────────┘     │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          │ ACO data        │ persona pricing  │ BOM generation
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Catalog Service + Mesh Client              │
│  catalog-service.js → mesh-client.js → API Mesh → ACO        │
└─────────────────────────────────────────────────────────────┘
```

### Key Integration: Auth → Persona → Catalog

```javascript
// In scripts/initializers/auth.js
events.on('authenticated', async (payload) => {
  if (payload?.customer?.email) {
    // Auth Dropin fires event → Persona Service gets ACO context
    await initializeMeshForEmail(payload.customer.email);
    // Headers now set for all ACO queries
  }
});
```

**Why both Auth Dropin and Persona Service?**
- Auth Dropin: Commerce authentication (login UI, tokens)
- Persona Service: ACO context (catalogViewId, priceBookId)
- They work together — neither replaces the other

---

## Known Issues & Technical Debt

### Current Issues

1. **Image 404s:** Many product images return 404 (visible in console). The `handleImageError` utility displays placeholders, but the images should be properly hosted.

2. **ACO room_category attribute:** Not configured as filterable in ACO, limiting BOM product matching for flooring. Workaround: removed from criteria.

3. **Demo auth passwords:** All demo personas use "demo123" - not for production.

### Technical Debt

1. **Data Actions:** The BOM templates/packages/criteria are stored as JSON files bundled with actions. Future: migrate to Adobe App Builder Runtime database.

2. **Hardcoded persona email mapping:** `DEMO_EMAIL_MAPPING` in `catalog-service.js` maps persona IDs to emails. Should be removed when Commerce dropins provide real auth.

3. **Mock cart:** Current cart uses `localStorage`. Will be replaced by Cart dropin.

4. **Inline HTML pages:** Pages like `product-detail.html` have significant inline JavaScript. Should be refactored to blocks when migrating to EDS authoring.

---

## Important Files Reference

### Frontend (buildright-eds)

| File | Purpose |
|------|---------|
| `scripts/auth.js` | Demo authentication (to be replaced) |
| `scripts/site-config.js` | Mesh endpoint and config |
| `scripts/services/catalog-service.js` | Data access layer with strategy pattern |
| `scripts/services/mesh-client.js` | GraphQL client for API Mesh |
| `scripts/services/queries.js` | GraphQL query definitions |
| `scripts/utils.js` | Shared utilities including `formatCurrency()` |
| `scripts/persona-config.js` | Demo persona definitions |
| `blocks/pricing-display/pricing-display.js` | Persona-aware pricing |
| `blocks/product-grid/product-grid.js` | Catalog with infinite scroll |
| `pages/product-detail.html` | PDP implementation |
| `pages/build-configurator.html` | BOM configuration |
| `pages/bom-review.html` | BOM review/display |

### Backend (buildright-service)

| File | Purpose |
|------|---------|
| `actions/persona/index.js` | Persona resolution action |
| `actions/persona/data/persona-mappings.json` | Customer group → ACO mapping |
| `actions/bom/index.js` | BOM generation action |
| `actions/bom/bom-calculator.js` | BOM calculation logic |
| `mesh/mesh.config.js` | API Mesh configuration |
| `mesh/schema/persona.graphql` | Persona GraphQL types |
| `mesh/schema/bom.graphql` | BOM GraphQL types |
| `app.config.yaml` | I/O Runtime action configuration |
| `.env` | Environment variables (credentials) |

### ACO (buildright-aco)

| File | Purpose |
|------|---------|
| `data/buildright/products.json` | Product catalog data |
| `data/buildright/bundles.json` | Bundle product data |
| `scripts/ingest-products.js` | Ingest products to ACO |
| `scripts/fetch-catalog-views.js` | Developer utility for ACO views |

### Commerce (buildright-commerce)

| File | Purpose |
|------|---------|
| `lib/commerce-config.js` | Demo customer definitions |
| `lib/commerce-api.js` | Commerce REST API client |
| `scripts/import-customers.js` | Import demo customers |

---

## Environment Variables

### buildright-service/.env

```bash
# Adobe I/O
AIO_PROJECT_ID=...
AIO_PROJECT_NAME=BuildRight Service
AIO_RUNTIME_NAMESPACE=...

# ACO Credentials
CLIENT_ID=...
CLIENT_SECRET=...
TENANT_ID=...
REGION=na1
ENVIRONMENT=sandbox

# Commerce (for persona action)
COMMERCE_API_URL=https://your-commerce-instance.com
COMMERCE_ADMIN_USER=...
COMMERCE_ADMIN_PASSWORD=...

# Feature Flags
PERSONA_DATA_SOURCE=commerce  # or 'json'
LOG_LEVEL=info
```

### buildright-aco/.env

```bash
CLIENT_ID=...
CLIENT_SECRET=...
TENANT_ID=...
REGION=na1
ENVIRONMENT=sandbox
```

### buildright-commerce/.env

```bash
COMMERCE_API_URL=https://your-commerce-instance.com
COMMERCE_ADMIN_USER=...
COMMERCE_ADMIN_PASSWORD=...
```

---

## Quick Start Commands

```bash
# Frontend development
cd buildright-eds
npm install
npm start  # Runs on http://localhost:8000

# Deploy mesh and actions
cd buildright-service
npm install
aio app deploy  # Deploys actions
npm run deploy:mesh  # Deploys mesh

# Ingest products to ACO
cd buildright-aco
npm install
npm run ingest:products
npm run ingest:bundles

# Import customers to Commerce
cd buildright-commerce
npm install
npm run import:all
```

---

## Documentation

- **Implementation Plan:** `buildright-eds/docs/IMPLEMENTATION-PLAN-V2.md`
- **BOM Service:** `buildright-service/docs/services/BOM-SERVICE.md`
- **Persona Service:** `buildright-service/docs/services/PERSONA-SERVICE.md`
- **Catalog Service Architecture:** `buildright-eds/docs/architecture/CATALOG-SERVICE.md`

---

## Summary for Next Agent

**You are continuing work on BuildRight, a B2B construction supply demo.**

**Current state:**
- ✅ ACO product catalog working via API Mesh
- ✅ Persona-based pricing and catalog views working
- ✅ BOM Builder working end-to-end
- ✅ Key architecture decisions made (see below)
- 🔄 Sarah persona (Phase 6A) in progress
- 🔲 Commerce Dropins integration (Phase 5.5) ready to implement

**Key decisions already made (December 2024):**
1. Use Commerce Dropins for Commerce data (auth, cart, checkout, orders)
2. Create Custom SDK Dropins for ACO data (product grid, PDP, project builder)
3. Keep Persona Service — works WITH Auth Dropin, not replaced by it
4. No dual-mode auth — Dropins are primary

**Immediate tasks (Sarah end-to-end):**
1. **Phase 5.5**: Commerce Dropins (auth, cart, checkout, orders)
2. **Phase 6A**: Sarah's features (build configurator, BOM review)
3. **Phase 7**: Custom SDK Dropins (product grid, PDP, project builder)
4. **Phase 8**: Polish Sarah's complete experience

**Deferred (after Sarah):** Other personas (Marcus, Lisa, David, Kevin)

**Key constraint:**
Products come from ACO, not Commerce Catalog Service. Cart dropin will add items by SKU.

**Start by:**
1. Reading [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md) for the full plan
2. Reading [implementation/sarah-end-to-end/dropins/](./implementation/sarah-end-to-end/dropins/) for Dropins details
3. Implementing Phase 5.5 tasks (Commerce Dropins) or Phase 6A tasks (Sarah persona)

