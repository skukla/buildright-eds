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
| 5.5 | **Planned** | Commerce Dropins (Auth, Cart, Checkout, Orders) |
| 6A | **In Progress** | Sarah persona end-to-end flow |
| 7 | Planned | Custom SDK dropins for ACO |
| 8 | Planned | Polish & performance |

---

## Key Directories

```
buildright-eds/
├── blocks/           # 30 EDS blocks (see blocks/CLAUDE.md)
├── pages/            # 18 HTML pages
├── scripts/          # Services, initializers (see scripts/CLAUDE.md)
├── styles/           # CSS design system
├── config/           # env.json configuration
├── docs/             # 51+ documentation files
│   ├── adr/          # 7 Architecture Decision Records
│   ├── implementation/
│   └── personas/
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
| `docs/MASTER-IMPLEMENTATION-PLAN.md` | Authoritative implementation plan |

---

## Catalog Implementations

Two catalog pages exist for comparison:

| Route | Implementation | Status | Use Case |
|-------|----------------|--------|----------|
| `/catalog` | Custom product-grid block | Working | **Production** - full design control |
| `/catalog-dropin` | Adobe Product Discovery dropin | Working | Reference/comparison |

**Decision:** Use `/catalog` (custom) for production per design requirements.

---

## Persona System

5 B2B personas with different catalog views and pricing:

1. **Sarah Martinez** (Phase 6A - Current) - Designer/Decorator
2. **Marcus Johnson** (Phase 6B) - Commercial contractor
3. **Lisa Wong** (Phase 6C) - Residential designer
4. **David Chen** (Phase 6D) - Deck builder specialist
5. **Kevin O'Brien** (Phase 6E) - Restock/inventory manager

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
AC-View-Id: [from persona, e.g., "default"]
AC-Price-Book-Id: [from persona, e.g., "US-Retail"]
```

**Mesh Architecture:**
The mesh has three sources (see `buildright-service/mesh/README.md` for details):
- `ACO_Dropins` - Unprefixed ACO queries for Adobe dropins
- `ACO_BuildRight` - Prefixed (`BuildRight_*`) ACO queries for custom blocks
- `Commerce` - Adobe Commerce for cart/auth (catalog filtered out)

---

## Key Documentation

| Document | When to Read |
|----------|--------------|
| `docs/MASTER-IMPLEMENTATION-PLAN.md` | Understanding overall project scope |
| `docs/adr/ADR-001-use-dropins-for-commerce.md` | Commerce dropin decisions |
| `docs/adr/ADR-007.md` | Custom SDK dropin decisions |
| `docs/CATALOG-VS-CATALOG-DROPIN-COMPARISON.md` | PLP architecture decisions |
| `docs/CODEBASE-AUDIT-DROPINS.md` | File-by-file migration plan |
| `docs/DATA-SOURCE-STATUS.md` | Data source limitations |

---

## Known Issues

1. **Data Source Gap:** buildright-aco is archived; mock data in `/data/` cannot be refreshed. Needs API endpoint in buildright-service.

2. **Dropin CSS Overrides:** Product list dropin CSS refactored (ADR-008). Now uses 6 component files with only 8 `!important` declarations (down from 299) and 49 design tokens in `styles/dropin-tokens.css`.

3. **Demo Mode:** Auth currently uses demo mode fallback. Phase 5.5 will integrate real Auth dropin.

4. **Dropin Pricing Architecture:** Product Discovery dropins receive pricing through a mesh adapter layer (`dropin-search.js`). If dropins show products without prices, verify:
   - Mesh is deployed with latest `dropin-search.js` resolver
   - `AC-Price-Book-Id` header is being sent (check `scripts/initializers/index.js`)
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
