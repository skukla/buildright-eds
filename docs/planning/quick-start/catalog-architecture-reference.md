# Quick Reference: Catalog Architecture by Persona

**📊 Document Type**: Quick Reference Guide  
**📖 Reading Time**: 5 minutes  
**👥 Audience**: Developers implementing persona-specific catalog views  
**🔗 Parent**: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)

---

## Quick Summary

**Architecture Decision**: ✅ **Hybrid Approach (Option 3)**
- **ACO Layer**: ONE catalog, ONE category structure, FIVE catalog views, attribute-based policies
- **EDS Layer**: DIFFERENT top nav, DIFFERENT category display, persona-specific filters

**Key Principle**: The SAME products appear DIFFERENTLY for each persona based on their mental model.

---

## Persona-Specific Catalog Views

### Sarah Martinez - Production Home Builder

**Mental Model**: Construction Phase → Selection Category → Package Tier

**ACO Catalog View**: `production-builder-view`
- **Visibility**: ~150 SKUs (house construction materials only)
- **Primary Filter**: `construction_phase: ['foundation_framing', 'envelope', 'interior_finish']`
- **Default Sort**: `selection_category`
- **Categories Shown**: All except Hardware & Tools

**EDS Organization**:
```
Foundation & Framing Phase
├── Lumber (2x4, 2x6, Plywood)
├── Fasteners
└── Insulation

Envelope Phase
├── Windows (by package tier: Good/Better/Best)
├── Doors
├── Roofing
└── Siding

Interior Finish Phase
├── Flooring
├── Paint
├── Lighting
└── Plumbing Fixtures
```

**Top Nav Items**:
- Dashboard
- House Templates
- My Builds
- Materials Catalog (links to `?view=phase&phase=envelope`)
- Orders & Deliveries

**Key Features**:
- Selects pre-configured packages (not individual SKUs)
- Orders by construction phase
- Sees materials grouped by selection category

**Full Details**:
- Mental Model: [product-category-structure.md](../implementation/sarah-end-to-end/features/product-category-structure.md)
- ACO Config: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)
- Implementation: [sarah-persona-overview.md](../implementation/sarah-end-to-end/features/sarah-persona-overview.md)

---

### Marcus Johnson - General Contractor

**Mental Model**: Project Phase → Quality Tier → Product Type

**ACO Catalog View**: `general-contractor-view`
- **Visibility**: ~300 SKUs (all construction materials)
- **Primary Filter**: `construction_phase: ['foundation_framing', 'envelope', 'interior_finish']`
- **Default Filter**: `quality_tier: 'professional'`
- **Default Sort**: `category`
- **Categories Shown**: All categories

**EDS Organization**:
```
Lumber & Building Materials
├── Dimensional Lumber
├── Engineered Lumber
├── Sheet Goods
└── Specialty Lumber

Doors & Windows
├── Windows
├── Entry Doors
├── Patio Doors
└── Garage Doors

Roofing & Siding
Framing & Drywall
Interior Finishes
Hardware & Tools
```

**Top Nav Items**:
- Dashboard
- Project Wizard
- Catalog
- My Jobs
- Order History

**Key Features**:
- Uses Project Wizard to generate custom BOMs
- Filters by quality tier (Builder Grade/Professional/Premium)
- Traditional category organization

**Full Details**:
- Mental Model: [product-category-structure.md](../implementation/sarah-end-to-end/features/product-category-structure.md)
- ACO Config: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)
- Implementation: [personas-overview.md](../explanations/personas/personas-overview.md)

---

### Lisa Chen - Remodeling Contractor

**Mental Model**: Room → Package Tier → Product Category

**ACO Catalog View**: `remodeling-contractor-view`
- **Visibility**: ~200 SKUs (finish materials only)
- **Primary Filter**: `room_category: ['bathroom', 'kitchen', 'flooring', 'fixtures']`
- **Exclude Filter**: `construction_phase: 'foundation_framing'` (no structural work)
- **Default Filter**: `package_tier: 'better'`
- **Default Sort**: `room_category`
- **Categories Hidden**: Lumber, Framing Hardware (shows only finishes)

**EDS Organization**:
```
Bathroom Remodel
├── Vanities
├── Toilets
├── Tubs & Showers
├── Tile
└── Fixtures

Kitchen Remodel
├── Cabinets
├── Countertops
├── Sinks & Faucets
├── Appliances
└── Backsplash

General Finishes
├── Flooring
├── Paint
└── Lighting
```

**Top Nav Items**:
- Dashboard
- Remodel Packages
- Materials Catalog (links to `?view=room`)
- My Projects
- Quotes

**Key Features**:
- Presents Good/Better/Best package options
- Customizes within selected package
- Generates quotes for client sharing

**Full Details**:
- Mental Model: [product-category-structure.md](../implementation/sarah-end-to-end/features/product-category-structure.md)
- ACO Config: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)
- Implementation: [personas-overview.md](../explanations/personas/personas-overview.md)

---

### David Thompson - DIY Homeowner

**Mental Model**: Project Type → Step-by-Step → Individual Products

**ACO Catalog View**: `diy-homeowner-view`
- **Visibility**: ~100 SKUs (DIY-friendly only)
- **Primary Filter**: `project_type: ['deck', 'fence', 'patio', 'general']`
- **Required Filter**: `diy_friendly: true`
- **Default Filter**: `project_type: 'deck'`
- **Default Sort**: `project_type`
- **Categories Hidden**: Professional-grade, requires license

**EDS Organization**:
```
Deck Building
├── Foundation (Concrete, Anchors)
├── Framing (Joists, Beams)
├── Decking (Composite, Wood)
├── Railing (Aluminum, Cable, Wood)
└── Finishes (Stain, Sealant)

Fence Building
├── Posts & Caps
├── Panels & Pickets
├── Hardware
└── Finishes

General Home Improvement
├── Paint
├── Hardware
└── Tools
```

**Top Nav Items**:
- My Projects
- Deck Builder
- Shop Materials (links to `?diy=true`)
- How-To Guides
- My Orders

**Key Features**:
- Wizard-driven step-by-step guidance
- Educational content ("Why do I need this?")
- Simplified product options

**Full Details**:
- Mental Model: [product-category-structure.md](../implementation/sarah-end-to-end/features/product-category-structure.md)
- ACO Config: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)
- Implementation: [personas-overview.md](../explanations/personas/personas-overview.md)

---

### Kevin Rodriguez - Store Manager

**Mental Model**: Velocity → Department → Product Type

**ACO Catalog View**: `store-manager-view`
- **Visibility**: ~500 SKUs (everything in catalog)
- **No Filters**: Kevin sees all products
- **Default Filter**: `store_velocity_category: 'high'`, `restock_priority: 'critical'`
- **Default Sort**: `store_velocity_category`
- **Categories Shown**: All categories

**EDS Organization**:
```
High Velocity Products
├── 2x4x8 PT Lumber (2.3 days supply) → Restock: 500 units
├── 3" Deck Screws (1.8 days supply) → Restock: 200 boxes
└── 1/2" Drywall 4x8 (2.9 days supply) → Restock: 150 sheets

Medium Velocity Products
├── Pressure-Treated 2x6x10 (5.2 days supply)
└── ...

Low Velocity Products
```

**Top Nav Items**:
- Restock Dashboard
- Inventory (links to `?view=velocity`)
- Sales Analytics
- Purchase Orders

**Key Features**:
- NOT browsing-oriented (alert-driven)
- Smart restock quantity suggestions
- Organized by velocity and days supply

**Full Details**:
- Mental Model: [product-category-structure.md](../implementation/sarah-end-to-end/features/product-category-structure.md)
- ACO Config: [aco-catalog-data-flow.md](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md)
- Implementation: Kevin does NOT use Project entity (separate workflow)

---

## Implementation Checklist by Persona

### Sarah (Phase 6A)
- [ ] Create ACO catalog view: `production-builder-view`
- [ ] Define visibility rules (construction materials only)
- [ ] Configure EDS nav: "House Templates", "My Builds"
- [ ] Implement phase-based catalog layout
- [ ] Create selection package UI
- [ ] Test package → SKU mapping

### Marcus (Phase 6B)
- [ ] Create ACO catalog view: `general-contractor-view`
- [ ] Define visibility rules (all construction)
- [ ] Configure EDS nav: "Project Wizard", "My Jobs"
- [ ] Implement traditional category layout
- [ ] Create quality tier filters
- [ ] Test BOM generation

### Lisa (Phase 6C)
- [ ] Create ACO catalog view: `remodeling-contractor-view`
- [ ] Define visibility rules (finish materials only)
- [ ] Configure EDS nav: "Remodel Packages", "Quotes"
- [ ] Implement room-based catalog layout
- [ ] Create Good/Better/Best package UI
- [ ] Test quote generation

### David (Phase 6D)
- [ ] Create ACO catalog view: `diy-homeowner-view`
- [ ] Define visibility rules (DIY-friendly only)
- [ ] Configure EDS nav: "Deck Builder", "How-To Guides"
- [ ] Implement project-type layout
- [ ] Create wizard-driven flow
- [ ] Test educational content integration

### Kevin (Phase 6E)
- [ ] Create ACO catalog view: `store-manager-view`
- [ ] No visibility restrictions (all products)
- [ ] Configure EDS nav: "Restock Dashboard", "Inventory"
- [ ] Implement velocity-based layout
- [ ] Create restock alerts UI
- [ ] Test smart suggestions

---

## Common Code Patterns

### Detecting Persona and Loading Catalog View

```javascript
// In scripts/catalog.js

import { getPersona } from './auth.js';
import { PERSONA_CATALOG_CONFIG } from './persona-config.js';

async function loadCatalog() {
  const persona = getPersona();
  const config = PERSONA_CATALOG_CONFIG[persona.id];
  
  // Get catalog view ID from persona config
  const catalogViewId = config.catalogViewId;
  
  // Fetch products from ACO using this catalog view
  const products = await fetchProductsFromACO({
    catalogViewId,
    filters: config.defaultFilters,
    sort: config.defaultSort
  });
  
  // Render using persona-specific layout
  renderCatalog(products, config.layout);
}
```

### Persona Catalog Configuration

```javascript
// In scripts/persona-config.js

export const PERSONA_CATALOG_CONFIG = {
  sarah: {
    catalogViewId: 'production-builder-view',
    layout: 'by-phase',
    defaultFilters: { construction_phase: 'envelope' },
    defaultSort: 'selection_category'
  },
  marcus: {
    catalogViewId: 'general-contractor-view',
    layout: 'by-category',
    defaultFilters: { quality_tier: 'professional' },
    defaultSort: 'category'
  },
  // ... lisa, david, kevin
};
```

---

## Quick Links

**Strategic Documents**:
- [Product Category Structure](../implementation/sarah-end-to-end/features/product-category-structure.md) - Why unified taxonomy?
- [ACO Catalog Data Flow](../implementation/sarah-end-to-end/features/aco-catalog-data-flow.md) - Technical implementation

**Persona Implementation Guides**:
- [Sarah Implementation](../implementation/sarah-end-to-end/features/sarah-persona-overview.md)
- [Persona Profiles](../explanations/personas/personas-overview.md)

---

**Last Updated**: 2025-11-26  
**Status**: ✅ Architecture Defined, Ready for Implementation  
**Next Step**: Begin ACO catalog view creation in buildright-aco


