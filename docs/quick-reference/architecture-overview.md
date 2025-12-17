# Quick Reference: Architecture Overview

**⏱️ Reading time**: 5 minutes

High-level overview of BuildRight's technical architecture.

---

## 🎯 What BuildRight Is

A **persona-driven B2B commerce demo** showcasing Adobe Commerce + ACO + EDS integration for building materials distribution.

**5 personas** × **Unique experiences** = Demonstrates personalization at scale

---

## 🏗️ Dual-Endpoint Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Frontend (Adobe EDS)                      │
│   - EDS Blocks (content)                                │
│   - Commerce Dropins (cart, auth, checkout)             │
│   - Persona-driven dashboards                           │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
             │ Commerce Dropins            │ BuildRight Custom
             │ (unprefixed)                │ (ACO_, BuildRight_)
             ▼                             ▼
    ┌────────────────┐          ┌──────────────────┐
    │   Commerce     │          │    API Mesh      │
    │   GraphQL      │          │  (ACO + Custom)  │
    │                │          └──────────┬───────┘
    │ - Customer     │                     │
    │ - Cart         │                     ▼
    │ - Checkout     │          ┌──────────────────┐
    │ - Orders       │          │      ACO         │
    └────────────────┘          │ - Products       │
                                │ - Pricing        │
                                │ - Catalog Views  │
                                │ - Price Books    │
                                └──────────────────┘
```

**Key Design:** Commerce Dropins connect directly to Commerce (best practice),
while BuildRight custom queries (catalog, persona, BOM) use API Mesh.

**See**: [ADR-008](../reference/decisions/ADR-008-COMMERCE-DROPINS-DIRECT-CONNECTION.md) for rationale

---

## 📦 Frontend: Adobe Edge Delivery Services

### EDS Blocks (Content)
**Purpose**: Author-managed content (heroes, features, footers)  
**Examples**: Hero banners, feature sections, promos  
**Authoring**: Google Docs or SharePoint  
**Pattern**: `/blocks/{block-name}/`

### Commerce Dropins (Commerce)
**Purpose**: Pre-built commerce UI components  
**Examples**: PDP, cart, checkout  
**Source**: Adobe's Storefront Dropins  
**Integration**: Via API Mesh GraphQL

### Custom Blocks (Experience)
**Purpose**: Persona-specific experiences  
**Examples**: Project wizard (Marcus), deck builder (David), restock dashboard (Kevin)  
**Built with**: JavaScript, CSS, EDS patterns

**See**: [adr/ADR-002](../adr/ADR-002-use-eds-blocks-for-content.md)

---

## 🔌 Integration: Dual Endpoints

### Commerce Direct (Commerce Dropins)
**Purpose**: Customer, cart, checkout, order operations  
**Endpoint**: `https://com750.adobedemo.com/graphql`  
**Operations**: Unprefixed GraphQL queries (standard Commerce)  
**Pattern**: Dropins → Commerce (no adapter needed)

### API Mesh (BuildRight Custom + ACO)
**Purpose**: Product catalog, persona resolution, BOM generation  
**Endpoint**: `https://edge-sandbox-graph.adobe.io/api/.../graphql`  
**Operations**: Prefixed queries (`BuildRight_*`, `ACO_*`)  
**Pattern**: Custom queries → Mesh → ACO

### Why Two Endpoints?
1. **Best Practice**: Commerce Dropins designed for direct Commerce connection
2. **Simpler**: No query transformation adapter needed
3. **Faster**: Eliminates unnecessary mesh hop for cart operations
4. **Clear Separation**: Commerce (customer/cart) vs ACO (catalog/pricing)

**See**: 
- [ADR-008: Commerce Dropins Direct Connection](../reference/decisions/ADR-008-COMMERCE-DROPINS-DIRECT-CONNECTION.md)
- [COMMERCE-MESH-INTEGRATION.md](../implementation/sarah-end-to-end/dropins/COMMERCE-MESH-INTEGRATION.md) (previous approach)

---

## 💾 Backend: Hybrid Commerce + ACO

### Adobe Commerce PaaS
**Owns**: Products, inventory (MSI), customers, B2B structure  
**Provides**: Product data, availability, customer accounts  
**Export**: SaaS Data Export → ACO

### Adobe Commerce Optimizer (ACO)
**Owns**: Pricing, policies, catalog views, CCDM rules  
**Provides**: Personalized pricing, filtered catalogs  
**Receives**: Product catalog from Commerce via SaaS Data Export

### Key Principle
**Products live in Commerce** → Auto-sync to ACO → **Pricing/policies in ACO**

**See**: [phase-8-backend/DATA-SOURCE-MATRIX.md](../phase-8-backend/DATA-SOURCE-MATRIX.md)

---

## 👥 Persona Architecture

### 1. Persona Definition
**File**: `scripts/persona-config.js`

Defines:
- Customer group
- Features enabled
- Default route
- Preferences

### 2. Authentication
**File**: `scripts/auth.js`

**Demo Mode**: Company selection → Persona mapping  
**Production**: Customer API → Persona detection via custom attributes

**See**: [adr/ADR-005](../adr/ADR-005-dual-mode-authentication.md)

### 3. Customer Context
**File**: `scripts/data-mock.js`

Stores: Company, location, customer group, persona attributes  
**Production**: Retrieved from Commerce Customer API

### 4. ACO Service
**File**: `scripts/aco-service.js`

**Demo**: Returns mock data based on customer context  
**Production**: Queries real ACO APIs via API Mesh

**See**: [adr/ADR-003](../adr/ADR-003-mock-aco-service.md)

---

## 🎨 Design System

### Base Styles
**File**: `styles/base.css`

- CSS variables (colors, spacing, typography)
- Container system
- Utility classes

### Component Styles
**Pattern**: Co-located with blocks  
**Example**: `blocks/header/header.css`

### Standards
**Documentation**: `standards/CSS-ARCHITECTURE.md`

Enforces: BEM naming, semantic tokens, responsive patterns

---

## 📊 Data Flow: Demo Mode (Current)

### When User Logs In

```
1. User selects company
   ↓
2. auth.js maps company → persona
   ↓
3. Set customer context (company, group, location)
   ↓
4. Redirect to persona's default dashboard
   ↓
5. Dashboard queries aco-service.js (mock)
   ↓
6. Mock service filters by customer context
   ↓
7. Returns persona-appropriate products/pricing
```

### Product Display

```
1. Catalog page loads
   ↓
2. Gets customer context (group, persona)
   ↓
3. Queries aco-service.js with filters
   ↓
4. Returns filtered catalog + pricing
   ↓
5. Renders products with customer group pricing
```

---

## 📊 Data Flow: Production Mode (Phase 8)

### When User Logs In

```
1. User enters credentials
   ↓
2. Commerce Customer API authenticates
   ↓
3. Retrieve customer attributes (company, group, location)
   ↓
4. Frontend detects persona from custom attributes
   ↓
5. Set customer context
   ↓
6. Redirect to persona's dashboard
```

### Product Display

```
1. Catalog page loads
   ↓
2. Gets customer context
   ↓
3. Queries API Mesh GraphQL
   ↓
4. API Mesh resolves:
   - Products from Commerce PaaS
   - Pricing from ACO Price Books
   - CCDM policies from ACO
   ↓
5. Returns filtered, priced catalog
   ↓
6. Renders with persona-specific view
```

**See**: [phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md](../phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md)

---

## 🔑 Key Architectural Decisions

### ADR-001: Use Commerce Dropins
**Decision**: Use Adobe's pre-built storefront components  
**Why**: Production-ready, maintained, integrates with Commerce

### ADR-002: Use EDS Blocks
**Decision**: Use EDS block pattern for all custom content  
**Why**: Author-friendly, CDN-cached, scalable

### ADR-003: Mock ACO Service
**Decision**: Create mock ACO service for demo mode  
**Why**: Matches real API format, easy production migration

### ADR-004: Custom Attributes for Personas
**Decision**: Use Commerce custom attributes for persona detection  
**Why**: Native Commerce feature, flexible, scalable

### ADR-005: Dual Mode Authentication
**Decision**: Demo mode (company select) + production mode (real auth)  
**Why**: Better demo UX, but ready for production

### ADR-007: Custom SDK Dropins for ACO
**Decision**: Build custom dropins using Adobe Commerce SDK for ACO-sourced components  
**Why**: Visual consistency with Commerce Dropins, leverages SDK design tokens

### ADR-008: Commerce Dropins Direct Connection
**Decision**: Connect Commerce Dropins directly to Commerce, not through API Mesh  
**Why**: Best practice, simpler, faster, standard integration pattern

**See**: [reference/decisions/](../reference/decisions/)

---

## 🎯 CCDM (Catalog Optimization)

### What It Is
**Context-Driven Catalog Management** - Filtering products by customer attributes

### How It Works

**Demo Mode**:
1. Customer context set (persona, group, location)
2. Mock ACO service applies filters
3. Returns subset of 70 products relevant to persona

**Production Mode**:
1. Customer logs in
2. ACO evaluates CCDM policies
3. Returns filtered catalog based on:
   - Customer group
   - Location/region
   - Purchase history
   - Business attributes

### Example: David's Deck
David (DIY) only sees 8-12 deck-specific products, not all 70 products

**See**: [personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)

---

## 🗺️ File Structure

```
buildright-eds/
├── blocks/              # EDS blocks (content + custom)
├── scripts/             # Core logic
│   ├── auth.js          # Authentication
│   ├── persona-config.js # Persona definitions
│   ├── aco-service.js   # Mock ACO API
│   ├── data-mock.js     # Customer context
│   └── dashboards/      # Persona dashboards
├── styles/              # Global + component styles
├── data/                # Mock data (JSON)
├── pages/               # HTML pages
└── docs/                # Documentation
```

---

## 📈 Implementation Phases

| Phase | Status | Focus |
|-------|--------|-------|
| 0-5 | ✅ Complete | Foundation, auth, shared components |
| 6A | ✅ Complete | Sarah persona (production builder) |
| 6B-E | 🚧 In Progress | Marcus, Lisa, David, Kevin personas |
| 7 | 📋 Planned | Integration & polish |
| 8 | 📋 Planned | Backend setup (Commerce + ACO) |
| 9 | 📋 Planned | Production deployment |
| 10 | 📋 Planned | Content authoring transition |

**See**: [PHASE-PLANS-INDEX.md](../PHASE-PLANS-INDEX.md)

---

## 🎯 Current Focus: Personas 6B-7

Implementing 4 remaining personas with unique dashboards:
- **Marcus**: Project wizard with CCDM filtering
- **Lisa**: Package builder with Good/Better/Best
- **David**: Deck builder ⭐ Primary CCDM demo
- **Kevin**: Multi-location restock dashboard

**See**: [PHASES-6B-TO-7-CONSOLIDATED.md](../PHASES-6B-TO-7-CONSOLIDATED.md)

---

## Need More Detail?

**Full architecture**: [phase-0-5-foundation/PHASE-3-CORE-ARCHITECTURE.md](../phase-0-5-foundation/PHASE-3-CORE-ARCHITECTURE.md)  
**Backend integration**: [phase-8-backend/](../phase-8-backend/)  
**Architectural decisions**: [adr/](../adr/)  
**Design system**: [standards/CSS-ARCHITECTURE.md](../standards/CSS-ARCHITECTURE.md)

---

**Back to**: [IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)


