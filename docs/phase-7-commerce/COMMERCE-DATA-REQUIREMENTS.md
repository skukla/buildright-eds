# Adobe Commerce Data Requirements for BuildRight

**Created**: December 9, 2025  
**Status**: Planning  
**Purpose**: Document all data that needs to be configured in Adobe Commerce to support the BuildRight demo

---

## Executive Summary

BuildRight currently uses Adobe Commerce Optimizer (ACO) for catalog management with an API Mesh layer for data transformation. To add Commerce backend features (native bundle pricing, customer management, orders), we need to configure Commerce with matching product data.

### What's Already in ACO

| Data Type | Count | Notes |
|-----------|-------|-------|
| **Simple Products** | ~200+ | Across 11 categories |
| **Bundle Products** | ~15 | 3 bundles per category |
| **Price Books** | 5 | Persona-based pricing |
| **Catalog Views** | 5 | One per persona (manual setup) |
| **Triggered Policies** | ~30 | Dynamic catalog filtering |

### What Commerce Provides (That ACO Doesn't)

| Feature | Commerce Capability | Current ACO Workaround |
|---------|---------------------|------------------------|
| **Bundle Pricing** | Native `BundleProduct.price_range` | Mesh calculates dynamically |
| **Customer Accounts** | Full customer management | Mocked in frontend |
| **Orders** | Order management, history | localStorage mock |
| **Customer Groups** | Tier-based pricing | Header-based in mesh |
| **Quotes** | B2B quote requests | Not implemented |

---

## 1. Product Categories

Commerce needs a category tree matching the ACO structure:

```
└── Root Category
    ├── Structural Materials
    │   ├── Lumber
    │   └── Plywood & Sheathing
    ├── Framing & Drywall
    │   ├── Metal Studs & Track
    │   ├── Drywall
    │   └── Insulation
    ├── Windows & Doors
    │   ├── Windows
    │   └── Doors
    ├── Fasteners & Hardware
    │   ├── Nails
    │   └── Screws
    ├── Roofing
    │   ├── Shingles
    │   ├── Underlayment
    │   └── Siding
    ├── Interior Finishes
    │   ├── Flooring
    │   ├── Paint
    │   ├── Lighting
    │   └── Plumbing Fixtures
    ├── Concrete & Foundation
    ├── Electrical Systems
    │   ├── Wiring
    │   ├── Devices
    │   └── Panels
    ├── Plumbing Pipes & Fittings
    │   ├── Water Supply
    │   ├── Drain/Waste
    │   └── Fittings
    ├── HVAC Systems
    │   ├── Units
    │   ├── Ductwork
    │   └── Vents & Thermostats
    └── Kitchen Appliances
```

---

## 2. Product Attributes

### Global Attributes (All Products)

| Attribute Code | Type | Values | Used For |
|----------------|------|--------|----------|
| `construction_phase` | Multiselect | Foundation & Framing, Envelope, Rough-In, Interior Finish, Exterior Finish | Phase-based filtering |
| `quality_tier` | Select | Builder Grade, Professional, Premium, Luxury | Quality tier filtering |
| `brand` | Select | BuildRight Pro, StructureMaster, ProFrame, SafeGuard, etc. | Brand filtering |
| `uom` | Select | EA, LF, SF, BOX, BUNDLE, PALLET, BAG, ROLL, etc. | Unit of measure |

### Persona-Specific Attributes

#### For David (DIY Homeowner - Deck Builder)
| Attribute | Type | Values |
|-----------|------|--------|
| `deck_compatible` | Boolean | Yes/No |
| `deck_shape` | Multiselect | rectangular, l_shaped, multi_level |
| `deck_material_type` | Select | wood, composite, pvc |
| `deck_railing_compatible` | Multiselect | wood, composite, metal, glass |

#### For Lisa (Remodeling Contractor - Package Builder)
| Attribute | Type | Values |
|-----------|------|--------|
| `package_tier` | Multiselect | good, better, best |
| `room_category` | Multiselect | bathroom, kitchen, surfaces, fixtures, finishes |

#### For Kevin (Store Manager - Restock Dashboard)
| Attribute | Type | Values |
|-----------|------|--------|
| `store_velocity_category` | Select | high, medium, low |
| `restock_priority` | Select | critical, high, medium, low |
| `recommended_restock_quantity` | Integer | - |
| `typical_days_supply` | Integer | - |

### Product-Specific Attributes

| Category | Attributes |
|----------|-----------|
| **Lumber** | `lumber_dimension` (2x4, 2x6, etc.), `lumber_length` |
| **Windows** | `window_operation_type`, `window_material`, `window_glazing_type` |
| **Doors** | `door_type`, `door_material`, `door_core_type` |
| **Roofing** | `roofing_material`, `roofing_style` |
| **Insulation** | `insulation_type`, `insulation_r_value` |
| **Electrical** | (standard attributes) |
| **Plumbing** | `fixture_type`, `fixture_location` |

---

## 3. Simple Products

### Product Count by Category

| Category | Simple Products | Notes |
|----------|-----------------|-------|
| Structural Materials | ~12 | Lumber, OSB, plywood |
| Framing & Drywall | ~18 | Metal studs, drywall types, insulation |
| Windows & Doors | ~12 | Various window/door types |
| Fasteners & Hardware | ~12 | Nails, screws |
| Roofing | ~18 | Shingles, underlayment, siding |
| Interior Finishes | ~24 | Flooring, paint, lighting, plumbing fixtures |
| Concrete & Foundation | ~5 | Ready-mix, bagged |
| Electrical Systems | ~11 | Wire, outlets, panels |
| Plumbing Pipes | ~10 | PEX, PVC, fittings |
| HVAC Systems | ~12 | Units, ductwork, vents |
| Kitchen Appliances | ~8 | Ranges, dishwashers, microwaves |

**Total: ~200 simple products**

### SKU Naming Convention

```
{CATEGORY}-{8-CHAR-HEX}

Examples:
- LBR-D0414F1E (Lumber)
- PLY-7D58FF99 (Plywood)
- WINDOW-795D51C5 (Windows)
- ROOF-7E825911 (Roofing)
```

### Sample Product Structure

```json
{
  "sku": "LBR-D0414F1E",
  "name": "ToughGrip 2x4 Stud - 8ft",
  "type": "simple",
  "price": 10.99,
  "status": "enabled",
  "visibility": "catalog,search",
  "attributes": {
    "construction_phase": ["Foundation & Framing"],
    "quality_tier": "Builder Grade",
    "brand": "ToughGrip",
    "uom": "EA",
    "lumber_dimension": "2x4",
    "lumber_length": "8ft",
    "deck_compatible": true,
    "deck_shape": ["rectangular", "l_shaped"],
    "deck_material_type": "wood",
    "store_velocity_category": "high",
    "recommended_restock_quantity": 100,
    "typical_days_supply": 7,
    "restock_priority": "high"
  }
}
```

---

## 4. Bundle Products

### Bundle Count: 15 total (3 per core category)

| Category | Bundle Products |
|----------|----------------|
| **Structural** | Deck Building Bundle, Framing Package - 10x12 Shed, Foundation Materials Bundle |
| **Framing** | Complete Wall System, Bathroom Renovation Kit, Soundproofing Package |
| **Windows & Doors** | Whole House Window Package, Complete Door Package, Energy Efficiency Upgrade |
| **Fasteners** | Professional Framer Kit, Roofing Fastener Bundle, Cabinet Installation Kit |

### Bundle Structure

Each bundle has:
- **Option Groups** (3-4 per bundle)
- **Options within groups** (choices within each group)
- **Default quantities** for each option

```json
{
  "sku": "BUNDLE-XXXXXX",
  "name": "Deck Building Bundle",
  "type": "bundle",
  "price_type": "dynamic",  // Price = sum of selected options
  "ship_separately": true,
  "items": [
    {
      "title": "Lumber Selection",
      "type": "radio",
      "required": true,
      "options": [
        { "sku": "LBR-XXX", "default_qty": 12, "is_default": true },
        { "sku": "LBR-YYY", "default_qty": 12, "is_default": false }
      ]
    },
    {
      "title": "Decking Material", 
      "type": "radio",
      "required": true,
      "options": [...]
    },
    {
      "title": "Fasteners",
      "type": "checkbox",
      "required": false,
      "options": [...]
    }
  ]
}
```

### Why Commerce Bundles Matter

**Current Problem (ACO)**:
```graphql
# ACO returns null for bundle prices
{
  productSearch(phrase: "bundle") {
    items {
      sku           # "BUNDLE-ABC123"
      priceRange    # null ← Problem!
    }
  }
}
```

**Commerce Solution**:
```graphql
# Commerce computes bundle prices natively
{
  products(filter: { sku: { eq: "BUNDLE-ABC123" } }) {
    items {
      ... on BundleProduct {
        price_range {
          minimum_price { final_price { value } }  # e.g., $1,800
          maximum_price { final_price { value } }  # e.g., $2,400
        }
      }
    }
  }
}
```

---

## 5. Customer Groups & Tier Pricing

### Customer Groups

| Group ID | Name | Description | Price Book Equivalent |
|----------|------|-------------|----------------------|
| 1 | US-Retail | Default/guest pricing | US-Retail |
| 2 | Production-Builder | Sarah's tier | Production-Builder |
| 3 | Trade-Professional | Marcus/Lisa tier | Trade-Professional |
| 4 | Wholesale-Reseller | Kevin's tier | Wholesale-Reseller |
| 5 | Retail-Registered | David's tier | Retail-Registered |

### Tier Pricing Rules

| Customer Group | Discount from Retail | Example |
|----------------|---------------------|---------|
| US-Retail | Base price | $10.00 |
| Retail-Registered | 5% off | $9.50 |
| Trade-Professional | 15% off | $8.50 |
| Production-Builder | 20% off | $8.00 |
| Wholesale-Reseller | 25% off | $7.50 |

### Price Configuration per Product

```json
{
  "sku": "LBR-D0414F1E",
  "price": 10.99,
  "tier_prices": [
    { "customer_group_id": 2, "qty": 1, "price": 8.79 },
    { "customer_group_id": 3, "qty": 1, "price": 9.34 },
    { "customer_group_id": 4, "qty": 1, "price": 8.24 },
    { "customer_group_id": 5, "qty": 1, "price": 10.44 }
  ]
}
```

---

## 6. Customer Accounts (Demo Users)

### Pre-configured Demo Accounts

| Email | Name | Customer Group | Role |
|-------|------|----------------|------|
| sarah.martinez@sunbelthomes.com | Sarah Martinez | Production-Builder | Production Builder |
| marcus.johnson@johnsonconstruction.com | Marcus Johnson | Trade-Professional | General Contractor |
| lisa.chen@chendesignbuild.com | Lisa Chen | Trade-Professional | Remodeling Contractor |
| david.thompson@email.com | David Thompson | Retail-Registered | DIY Homeowner |
| kevin.rodriguez@precisionlumber.com | Kevin Rodriguez | Wholesale-Reseller | Store Manager |

### Customer Attributes

| Attribute | Type | Used For |
|-----------|------|----------|
| `company_name` | Text | B2B company association |
| `primary_warehouse` | Select | Regional warehouse preference |
| `default_route` | Text | Persona-specific landing page |
| `persona_id` | Text | Frontend persona identification |

---

## 7. Website/Store Structure

### Recommended Structure

```
└── BuildRight Website
    └── BuildRight Store
        └── Default Store View (en-US)
```

### B2B Configuration

- **Company accounts**: Enable for B2B personas (Sarah, Marcus, Lisa, Kevin)
- **Requisition lists**: Enable for repeat ordering
- **Quick Order**: Enable for SKU-based ordering
- **Quotes**: Enable for custom pricing requests

---

## 8. Integration Points

### Mesh Configuration

When Commerce is added, update `mesh.config.js`:

```javascript
{
  sources: [
    {
      name: 'ACO',
      // existing ACO configuration
    },
    {
      name: 'Commerce',
      handler: {
        graphql: {
          endpoint: 'https://{COMMERCE_URL}/graphql'
        }
      }
    }
  ]
}
```

### Header Mapping

| Frontend Header | Commerce Equivalent |
|-----------------|---------------------|
| `X-Catalog-View-Id` | Customer Group (implicit) |
| `X-Price-Book-Id` | Customer Group Pricing |
| `Authorization` | Customer Token |

---

## 9. Data Migration Strategy

### Phase 1: Core Products
1. Create category structure
2. Create product attributes
3. Import simple products (~200)
4. Configure tier pricing

### Phase 2: Bundle Products
1. Import bundle products (15)
2. Configure bundle options
3. Verify `price_range` returns correctly

### Phase 3: Customers
1. Create customer groups
2. Create demo customer accounts
3. Assign customers to groups

### Phase 4: Integration
1. Add Commerce to mesh
2. Update resolvers for bundle pricing
3. Update frontend for price range display

---

## 10. Data Generation Options

### Option A: Manual Import via Admin
- Use Commerce Admin UI
- Good for small changes
- Time-consuming for full catalog

### Option B: REST/GraphQL API
- Script product creation
- Can reuse ACO generation scripts
- Requires API authentication setup

### Option C: Data Migration Tools
- Use Commerce data migration tools
- CSV import capabilities
- Bulk operations

### Recommended Approach

Adapt existing `buildright-aco` scripts:

```bash
# In a new buildright-commerce repo or directory
npm run generate:products    # Generate Commerce-format products
npm run generate:bundles     # Generate bundle configurations  
npm run generate:customers   # Generate demo customer accounts
npm run import:all           # Import via Commerce API
```

---

## 11. Validation Checklist

### Products
- [ ] All ~200 simple products imported
- [ ] Product attributes properly configured
- [ ] Products assigned to correct categories
- [ ] Images uploaded and associated

### Bundle Products
- [ ] All 12 bundles created
- [ ] Bundle options configured correctly
- [ ] `price_range` returns computed values (not null)
- [ ] Bundle components link to correct simple products

### Pricing
- [ ] Customer groups created
- [ ] Tier pricing configured for all groups
- [ ] Bundle pricing reflects component prices

### Customers
- [ ] Demo accounts created
- [ ] Accounts assigned to correct groups
- [ ] Login credentials documented

### Integration
- [ ] Commerce GraphQL accessible
- [ ] Mesh can query Commerce
- [ ] Frontend receives correct price ranges

---

## 12. Files to Create/Update

### New Files (buildright-commerce or integration)

| File | Purpose |
|------|---------|
| `scripts/generate-commerce-products.js` | Generate Commerce product JSON |
| `scripts/generate-commerce-bundles.js` | Generate bundle configurations |
| `scripts/import-to-commerce.js` | API import script |
| `data/commerce-products.json` | Product data in Commerce format |
| `data/commerce-bundles.json` | Bundle data in Commerce format |

### Updated Files (buildright-service)

| File | Change |
|------|--------|
| `mesh/mesh.config.js` | Add Commerce source |
| `mesh/resolvers-src/product-search.js` | Query Commerce for bundles |
| `mesh/resolvers-src/utils/bundle-pricing.js` | Deprecate when Commerce works |

### Updated Files (buildright-eds)

| File | Change |
|------|--------|
| `blocks/product-tile/product-tile.js` | Handle price ranges |
| `blocks/product-grid/product-grid.js` | Display min/max prices |
| `scripts/services/catalog-service.js` | Handle Commerce responses |

---

## Next Steps

1. **Provision Commerce Instance** - Get sandbox environment
2. **Create Import Scripts** - Adapt ACO generation to Commerce format
3. **Run Data Import** - Populate Commerce with products
4. **Configure Mesh** - Add Commerce as source
5. **Test Integration** - Verify bundle pricing works
6. **Update Frontend** - Handle price range display

---

*Document Version: 1.0*  
*Last Updated: December 9, 2025*

