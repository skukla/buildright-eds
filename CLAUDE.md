# BuildRight EDS - AI Assistant Context

## Project Overview

**BuildRight Solutions** is a B2B construction supply demonstration system built on Adobe Edge Delivery Services (EDS). It showcases a hybrid dropin architecture combining Adobe Commerce dropins with custom ACO (Adobe Commerce Optimizer) integrations.

**Tech Stack:**
- Frontend: Adobe Edge Delivery Services (EDS)
- Commerce: Adobe Commerce (Magento) via API Mesh
- Product Data: Adobe Commerce Optimizer (ACO)
- Backend Services: Adobe I/O Runtime Actions

---

## Architecture Decision: Hybrid Dropins

Per ADR-001 and ADR-007, this project uses a **hybrid dropin strategy**:

| Component Type | Source | Reason |
|----------------|--------|--------|
| Auth, Cart, Checkout, Orders | Adobe Commerce Dropins | Pre-built, production-ready |
| Products, Pricing, Catalog | Custom/SDK Dropins | ACO data not supported by Commerce dropins |
| Project Builder, BOM | Custom EDS Blocks | BuildRight-specific features |

**Key Insight:** Commerce dropins cannot query ACO directly - they're hardcoded to Commerce Catalog/Live Search.

---

## Current Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| 0-5 | Complete | Research, ACO data, design system, core architecture |
| 5.5 | **Complete** | Commerce Dropins (Auth, Cart, Checkout, Orders) - All blocks created with BuildRight slots |
| 6A | **In Progress** | Sarah persona end-to-end flow |
| 7 | Planned | Custom SDK dropins for ACO |
| 8 | Planned | Polish & performance |

---

## Key Directories

```
buildright-eds/
├── blocks/           # 29 EDS blocks (see blocks/CLAUDE.md)
├── pages/            # 16 HTML pages
├── scripts/          # Services, initializers (see scripts/CLAUDE.md)
├── styles/           # CSS design system
├── config/           # env.json configuration
├── docs/             # 271+ documentation files
│   ├── adr/          # 11 Architecture Decision Records
│   ├── planning/     # AI/Dev implementation guides
│   ├── explanations/ # Visual docs, personas
│   ├── reference/    # Technical specs, standards
│   └── implementation/
├── data/             # Mock product data (from archived buildright-aco)
└── fragments/        # Reusable content fragments
```

---

## Critical Files

| File | Purpose |
|------|---------|
| `config/env.json` | Mesh endpoint, feature flags |
| `scripts/initializers/index.js` | Dropin initialization hub |
| `scripts/services/catalog-service.js` | ACO product queries (648 lines) |
| `scripts/persona-config.js` | 5 persona definitions |
| `docs/planning/master-implementation-plan.md` | Authoritative implementation plan |

---

## Catalog Implementation

| Route | Implementation | Block | Status |
|-------|----------------|-------|--------|
| `/catalog` | Adobe Product Discovery dropin | `product-list` | **Production** |

**Architecture:**
- Uses Adobe's SearchResults, Facets, SortBy, and Pagination dropins
- Custom slot rendering for BuildRight design (`.buildright-*` classes)
- Mesh adapter resolvers intercept queries for extensibility control

---

## Persona System

5 B2B personas with different catalog views and pricing:

1. **Sarah Martinez** (Phase 6A - Current) - Production Builder
2. **Marcus Johnson** (Phase 6B) - General Contractor
3. **Lisa Chen** (Phase 6C) - Remodeling Contractor
4. **David Thompson** (Phase 6D) - Pro Homeowner (DIY)
5. **Kevin Rodriguez** (Phase 6E) - Store Manager

Each persona maps to:
- `catalog_view_id` - Which products they see
- `price_book_id` - Their tier pricing

---

## API Integration

**API Mesh Endpoint:**
```
https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql
```

**Headers Required for ACO Pricing:**
```
AC-View-Id: [UUID from persona service, e.g., "6792f1d5-9e79-4813-8d8e-df5ed76e5692"]
AC-Price-Book-Id: [from persona, e.g., "US-Retail"]
```

> **Critical:** `AC-View-Id` must be a UUID, not a human-readable string like "default". The persona service resolves human-readable identifiers to UUIDs.

**Mesh Architecture:**
The mesh has three sources (see `buildright-service/mesh/README.md` for details):
- `ACO_Dropins` - Unprefixed ACO queries for Adobe dropins
- `ACO_BuildRight` - Prefixed (`BuildRight_*`) ACO queries for custom blocks
- `Commerce` - Adobe Commerce for cart/auth (catalog filtered out)

---

## Key Documentation

| Document | When to Read |
|----------|--------------|
| `docs/reference/dropin-architecture.md` | **Canonical** dropin reference (containers, slots, patterns) |
| `docs/planning/master-implementation-plan.md` | Understanding overall project scope |
| `docs/adr/ADR-001-use-dropins-for-commerce.md` | Commerce dropin decisions |
| `docs/adr/ADR-007-custom-sdk-dropins-for-aco.md` | Custom SDK dropin decisions |
| `buildright-service/mesh/README.md` | Mesh adapter pattern for dropin queries |

---

## Known Issues

1. **Data Source Gap:** buildright-aco is archived; mock data in `/data/` cannot be refreshed. Needs API endpoint in buildright-service.

2. **Dropin CSS Overrides:** Product list dropin CSS refactored (ADR-008). Now uses 6 component files with only 8 `!important` declarations (down from 299) and 49 design tokens in `styles/dropin-tokens.css`.

3. **Auth Block:** Auth block now uses Commerce Auth dropin with 4 variants (SignIn, SignUp, ResetPassword, UpdatePassword). Includes security hardening for redirect validation and XSS prevention.

4. **Dropin Pricing Architecture:** ACO returns pricing natively when correct headers are provided. If dropins show products without prices, verify:
   - `AC-View-Id` header contains **UUID** (not human-readable like "default") - persona service resolves this
   - `AC-Price-Book-Id` header is being sent
   - Persona initialization happens BEFORE dropin headers are set (see `scripts/initializers/index.js`)
   - The `dropin-plp.js` adapter is for **extensibility control**, not required for basic pricing
   - See `buildright-service/mesh/README.md` "Dropin Adapter Pattern" section

---

## Development Patterns

### Block Structure (EDS Standard)
```html
<div class="blockname">
  <div>
    <div><!-- content --></div>
  </div>
</div>
```

### CSS Naming
- Design tokens: `--color-brand-500`, `--spacing-medium`
- Custom classes: `.buildright-*` namespace
- Block classes: `.blockname__element--modifier`

### Dropin Slot Pattern
```javascript
slots: {
  ProductPrice: (ctx) => {
    const el = document.createElement('div');
    el.className = 'buildright-price';
    // ... render custom content
    ctx.replaceWith(el);
  }
}
```

---

## Commands

```bash
# Start local dev server
npm start

# Or use http-server
npx http-server -p 8000 -c-1
```

---

## Important Constraints

1. **Never modify** files in `/data/` - they're from archived buildright-aco
2. **Always use** `.buildright-*` prefix for custom CSS classes
3. **Check ADRs** before making architectural changes
4. **Phase 5.5 first** - Auth/Cart/Checkout dropins are critical path
5. **Persona headers** required for all ACO queries
