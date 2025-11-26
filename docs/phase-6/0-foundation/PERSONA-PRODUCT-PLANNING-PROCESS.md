# Persona Product Planning & Reuse Process

**Date**: November 26, 2025  
**Status**: 🎯 Reference Guide  
**Version**: 1.0

## Overview

This document defines the systematic process for planning product catalogs for new personas while maximizing product reuse across the BuildRight ecosystem. The goal is to maintain a unified product catalog in ACO while providing persona-appropriate views and experiences.

## Core Principles

### 1. **Unified Catalog, Personalized Views**

We maintain ONE product catalog in ACO that serves all personas, but each persona sees a customized view based on:
- Product category relevance
- Quality tier preferences
- Construction phase alignment
- Mental model mapping

### 2. **Maximize Product Reuse**

Products are shared across personas whenever possible:
- Reduces catalog maintenance
- Improves pricing consistency
- Leverages bulk purchasing
- Simplifies inventory management

### 3. **Persona-Specific Attributes**

Products are tagged with attributes that enable filtering:
- `construction_phase`: foundation_framing, envelope, interior_finish
- `quality_tier`: builder_grade, professional, premium, luxury
- `product_category`: structural_materials, windows_doors, roofing, etc.
- `persona_relevance`: sarah, marcus, lisa, david, kevin

## Process: Planning Products for a New Persona

### Step 1: Analyze Persona Catalog Needs

**Ask these questions:**

1. **What does this persona build/create?**
   - Sarah: Complete homes (foundation to finish)
   - Marcus: Custom home additions and renovations
   - Lisa: Interior remodels and design projects
   - David: Outdoor structures (decks, fences, pergolas)
   - Kevin: Specialty projects (workshops, studios, ADUs)

2. **What construction phases are relevant?**
   - Foundation & Framing?
   - Envelope (roof, walls, windows, doors)?
   - Interior Finish (flooring, paint, fixtures)?
   - Outdoor/Exterior?
   - Specialty systems?

3. **What quality tiers matter?**
   - Builder Grade (DIY, budget-conscious)
   - Professional (standard contractor grade)
   - Premium (upgraded, mid-range)
   - Luxury (high-end, designer)

4. **What's their mental model?**
   - How do they think about products?
   - What categories make sense to them?
   - What terminology do they use?

**Output**: Persona Catalog Requirements Document

```markdown
# Marcus (Custom Builder) - Catalog Requirements

## Project Types
- Room additions (bedrooms, bathrooms, kitchens)
- Basement finishing
- Garage conversions
- Major renovations

## Construction Phases
- ✅ Foundation & Framing (partial - often connecting to existing)
- ✅ Envelope (walls, windows, doors)
- ✅ Interior Finish (full spectrum)
- ❌ Complete foundation (rarely starts from ground up)

## Quality Tiers
- Primary: Professional (80% of projects)
- Secondary: Premium (20% of projects for upgrades)

## Mental Model Categories
- Structural & Framing
- Windows & Doors
- Electrical & Lighting
- Plumbing & Fixtures
- Flooring & Tile
- Drywall & Paint
- Hardware & Fasteners
```

### Step 2: Product Reuse Analysis

**Compare with existing products in ACO:**

1. **Query existing catalog by construction phase:**
   ```javascript
   const structuralProducts = await findProductsByPhase('foundation_framing');
   const envelopeProducts = await findProductsByPhase('envelope');
   const finishProducts = await findProductsByPhase('interior_finish');
   ```

2. **Identify reusable products:**
   - Which products from Sarah's catalog apply to this persona?
   - Which products from other personas can be reused?

3. **Calculate reuse percentage:**
   ```
   Reuse % = (Reusable Products / Total Needed) × 100
   ```

**Example: Marcus vs Sarah Product Reuse**

| Category | Sarah Products | Marcus Can Reuse | Reuse % |
|----------|----------------|------------------|---------|
| Structural Materials | 18 | 18 | 100% |
| Windows & Doors | 12 | 12 | 100% |
| Roofing | 10 | 8 | 80% |
| Interior Finishes | 45 | 45 | 100% |
| Electrical | 8 | 8 | 100% |
| Plumbing | 9 | 9 | 100% |
| HVAC | 10 | 6 | 60% |
| Concrete/Foundation | 6 | 2 | 33% |
| **Total** | **118** | **108** | **92%** |

**Reuse Insight**: Marcus can reuse 92% of Sarah's products. Only 10 new products needed (primarily foundation-related items that Marcus rarely uses at full scale).

**Output**: Product Reuse Matrix (see Step 5 for full matrix)

### Step 3: Define Delta Products

**Identify products unique to this persona:**

1. **What products does this persona need that don't exist?**
   - New categories?
   - Different sizes/specifications?
   - Specialty items?

2. **Why can't existing products be reused?**
   - Different mental model category?
   - Different unit of measure?
   - Different quality tier range?

3. **How many delta products are needed?**
   - Target: <20% new products for similar personas
   - Target: 30-50% new products for different personas

**Example: Marcus Delta Products**

```javascript
// Marcus needs these products that Sarah doesn't:
const marcusDeltaProducts = [
  {
    category: 'renovation_supplies',
    products: [
      'Dumpster Rental - 20 Yard',
      'Dust Barrier System',
      'Lead Paint Test Kit',
      'Asbestos Abatement Kit'
    ]
  },
  {
    category: 'structural_materials',
    products: [
      'Steel I-Beam - 20ft (for load-bearing wall removal)',
      'Steel Support Post - Adjustable',
      'Structural Steel Fastener Kit'
    ]
  },
  {
    category: 'foundation_repair',
    products: [
      'Concrete Crack Repair Kit',
      'Foundation Waterproofing Membrane',
      'Sump Pump System'
    ]
  }
];

// Total delta: ~10 products (8% of Marcus's total catalog)
```

**Output**: Delta Product Definitions List

### Step 4: Update Product Definitions

**Add delta products to `buildright-aco/scripts/config/product-definitions.js`:**

```javascript
// Add new category for Marcus
export const PRODUCT_CATEGORIES = {
  // ... existing categories
  
  renovation_supplies: {
    name: 'Renovation Supplies',
    attributeValue: 'renovation_supplies',
    personas: ['marcus', 'kevin'], // Tag with relevant personas
    subcategories: {
      demolition: {
        simple: [
          {
            nameTemplate: 'Dumpster Rental - {size} Yard',
            variants: { size: ['10', '20', '30'] },
            basePrice: { min: 300, max: 600 },
            unit: 'EA',
            tier: 'professional'
          }
        ]
      },
      protection: {
        simple: [
          {
            nameTemplate: 'Dust Barrier System',
            basePrice: { min: 150, max: 250 },
            unit: 'KIT',
            tier: 'professional'
          }
        ]
      }
    }
  }
};
```

**Regenerate and ingest catalog:**

```bash
cd buildright-aco
npm run generate:products  # Generate with new products
npm run ingest:products    # Ingest to ACO
npm run generate:prices
npm run ingest:prices
```

**Output**: Updated ACO catalog with delta products

### Step 5: Create Product Reuse Matrix

**Visual matrix showing product sharing across all personas:**

| Product Category | Sarah | Marcus | Lisa | David | Kevin | Notes |
|-----------------|-------|--------|------|-------|-------|-------|
| **Structural Materials** | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | Marcus/Kevin use 100%, David uses 20% |
| **Windows & Doors** | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | David doesn't use (outdoor focus) |
| **Roofing** | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | Interior/outdoor personas skip |
| **Interior Finishes** | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | Highest reuse across personas |
| **Electrical Systems** | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 | David uses subset (outdoor lighting) |
| **Plumbing Systems** | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | David doesn't need |
| **HVAC Systems** | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | Only relevant for conditioned spaces |
| **Concrete/Foundation** | 🟢 | 🟡 | 🔴 | 🟢 | 🟢 | Marcus uses less, David uses more |
| **Deck Materials** | 🔴 | 🟡 | 🔴 | 🟢 | 🟢 | David primary, others occasional |
| **Fence Materials** | 🔴 | 🟡 | 🔴 | 🟢 | 🟢 | David primary, others occasional |
| **Paint & Finishes** | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 | Universal except David (exterior only) |
| **Drywall & Supplies** | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | Interior personas only |
| **Renovation Supplies** | 🔴 | 🟢 | 🟡 | 🔴 | 🟡 | Marcus primary, others occasional |
| **Outdoor Lighting** | 🟡 | 🟡 | 🔴 | 🟢 | 🟡 | David primary |
| **Specialty Fasteners** | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | Universal with variations |

**Legend:**
- 🟢 **Primary Use** (100% of category) - Core to this persona's work
- 🟡 **Secondary Use** (20-50% of category) - Used occasionally or in subset
- 🔴 **Not Relevant** (0% of category) - Not part of this persona's workflow

**Output**: Product sharing visualization

### Step 6: Validate with Taxonomy

**Ensure products map to persona's mental model:**

1. **Test catalog view filtering:**
   ```javascript
   // In ACO, filter by persona relevance
   const marcusProducts = await queryProducts({
     filter: [
       { attribute: 'persona_relevance', eq: 'marcus' }
     ]
   });
   
   console.log(`Marcus sees ${marcusProducts.length} products`);
   // Expected: ~120 products (Sarah's 118 + Marcus delta 10 - irrelevant 8)
   ```

2. **Verify category mapping:**
   - Do categories make sense to this persona?
   - Is terminology appropriate?
   - Are products grouped logically?

3. **Test UI filtering:**
   - Can persona find products easily?
   - Are quality tiers presented correctly?
   - Does search work with persona's vocabulary?

**Example: Marcus Category Validation**

```javascript
// Marcus's mental model categories:
const marcusCategories = [
  'Structural & Framing',      // Maps to: structural_materials
  'Windows & Doors',           // Maps to: windows_doors
  'Electrical & Lighting',     // Maps to: electrical_systems + lighting_fixtures
  'Plumbing & Fixtures',       // Maps to: plumbing_fixtures + plumbing_pipes
  'Flooring & Tile',          // Maps to: flooring + tile
  'Drywall & Paint',          // Maps to: drywall + paint
  'Renovation & Demo',        // Maps to: renovation_supplies (NEW)
  'Hardware & Fasteners'      // Maps to: fasteners_hardware
];

// Validate mapping in UI:
marcusCategories.forEach(category => {
  const products = filterByMarcusCategory(category);
  console.log(`${category}: ${products.length} products`);
  assert(products.length > 0, `Category ${category} has no products!`);
});
```

**Output**: Validated category mapping and UI configuration

## Product Reuse Examples

### Example 1: High Reuse (Marcus from Sarah)

**Scenario**: Marcus (Custom Builder) leverages Sarah's (Home Builder) catalog

```
Sarah's Catalog: 118 products
Marcus Can Reuse: 108 products (92%)
Marcus Needs New: 10 products (8%)

Reused Categories:
- Structural Materials (18 products) ✅ 100%
- Windows & Doors (12 products) ✅ 100%
- Interior Finishes (45 products) ✅ 100%
- Electrical (8 products) ✅ 100%
- Plumbing (9 products) ✅ 100%

Partial Reuse:
- Roofing (8/10 products) - Marcus doesn't need all types
- Foundation (2/6 products) - Marcus rarely does full foundations

New Products Needed:
- Renovation supplies (demolition, protection)
- Structural steel (for load-bearing wall removal)
- Foundation repair products

Result: Highly efficient, minimal delta
```

### Example 2: Medium Reuse (Lisa from Sarah)

**Scenario**: Lisa (Interior Designer) uses subset of Sarah's catalog

```
Sarah's Catalog: 118 products
Lisa Can Reuse: 60 products (51%)
Lisa Needs New: 20 products (25% of her total catalog)

Reused Categories:
- Interior Finishes (45 products) ✅ 100%
- Paint & Coatings (8 products) ✅ 100%
- Lighting Fixtures (7 products) ✅ 100%

Not Relevant:
- Structural Materials (18 products) ❌ 0%
- Roofing (10 products) ❌ 0%
- Foundation (6 products) ❌ 0%
- HVAC (10 products) ❌ 0%

New Products Needed:
- Designer tile collections
- High-end cabinet hardware
- Specialty lighting fixtures
- Custom millwork materials

Result: Moderate reuse, focused on interior categories
```

### Example 3: Low Reuse (David from Sarah)

**Scenario**: David (DIY Outdoor) has different focus

```
Sarah's Catalog: 118 products
David Can Reuse: 25 products (21%)
David Needs New: 60 products (71% of his total catalog)

Reused Categories:
- Concrete/Foundation (6 products) ✅ 100% - for deck footings
- Fasteners & Hardware (12 products) ✅ 100%
- Structural Materials (7/18 products) 🟡 39% - for framing

Not Relevant:
- Windows & Doors (12 products) ❌ 0%
- Roofing (10 products) ❌ 0%
- Interior Finishes (45 products) ❌ 0%
- HVAC (10 products) ❌ 0%
- Plumbing Fixtures (9 products) ❌ 0%

New Products Needed:
- Deck boards (composite, wood, PVC)
- Deck railing systems
- Fence panels and posts
- Outdoor stains and sealers
- Landscape lighting
- Pergola kits
- Outdoor fasteners

Result: Low reuse due to different product domain
```

## Implementation Checklist

When planning products for a new persona:

### Phase 1: Analysis
- [ ] Complete Persona Catalog Requirements document
- [ ] Identify relevant construction phases
- [ ] Define quality tier preferences
- [ ] Map persona's mental model categories

### Phase 2: Reuse Analysis
- [ ] Query existing products by construction phase
- [ ] Calculate reuse percentage vs each existing persona
- [ ] Identify reusable products (list specific SKUs)
- [ ] Document why certain products can't be reused

### Phase 3: Delta Definition
- [ ] List required new products (with justification)
- [ ] Define new categories (if needed)
- [ ] Specify product attributes and variants
- [ ] Estimate pricing ranges

### Phase 4: Implementation
- [ ] Update `product-definitions.js` with delta products
- [ ] Add persona relevance tags to existing products (if needed)
- [ ] Regenerate product catalog
- [ ] Ingest products to ACO
- [ ] Regenerate and ingest prices

### Phase 5: Validation
- [ ] Query ACO to verify product count
- [ ] Test catalog view filtering by persona
- [ ] Validate category mapping in UI
- [ ] Test search with persona's vocabulary
- [ ] Verify quality tier presentation

### Phase 6: Documentation
- [ ] Update product reuse matrix
- [ ] Document persona-specific categories
- [ ] Create UI configuration guide
- [ ] Update catalog architecture docs

## Tools & Scripts

### Query Products by Persona

```javascript
// scripts/tools/query-persona-products.js
import { queryAllProductsGraphQL } from '../utils/aco-graphql-query.js';

async function getPersonaProducts(personaId) {
  const allProducts = await queryAllProductsGraphQL();
  
  // Filter by persona relevance attribute
  const personaProducts = allProducts.filter(p => {
    // Check if product has persona_relevance attribute
    // and includes this persona
    return p.attributes?.persona_relevance?.includes(personaId);
  });
  
  console.log(`${personaId}: ${personaProducts.length} products`);
  return personaProducts;
}
```

### Calculate Reuse Percentage

```javascript
// scripts/tools/calculate-reuse.js
function calculateReusePercentage(sourcePersona, targetPersona) {
  const sourceProducts = getPersonaProducts(sourcePersona);
  const targetProducts = getPersonaProducts(targetPersona);
  
  // Find intersection
  const reusableProducts = sourceProducts.filter(sp =>
    targetProducts.find(tp => tp.sku === sp.sku)
  );
  
  const reusePercentage = (reusableProducts.length / targetProducts.length) * 100;
  
  return {
    sourceTotal: sourceProducts.length,
    targetTotal: targetProducts.length,
    reusable: reusableProducts.length,
    reusePercentage: reusePercentage.toFixed(1),
    deltaNeeded: targetProducts.length - reusableProducts.length
  };
}
```

## Best Practices

### 1. **Start with Highest Reuse**

Implement personas in order of reuse potential:
1. Marcus (92% reuse from Sarah) ← Do first
2. Kevin (85% reuse from Sarah + Marcus)
3. Lisa (51% reuse from Sarah)
4. David (21% reuse from Sarah) ← Do last

This minimizes delta product work and validates the taxonomy early.

### 2. **Use Consistent Naming**

Keep product names consistent across personas:
- ✅ "2x4 Stud - 8ft" (clear, universal)
- ❌ "Framing Stud 2x4" (Sarah) vs "Wall Stud 2x4x8" (Marcus)

### 3. **Tag Generously**

Add persona relevance tags even if not primary use:
```javascript
{
  sku: 'PAINT-INTERIOR-5GAL',
  name: 'Interior Paint - Satin White 5 Gallon',
  persona_relevance: ['sarah', 'marcus', 'lisa', 'kevin'], // Not david
  primary_persona: 'sarah'
}
```

### 4. **Document Decisions**

Record why products were/weren't reused:
```markdown
## Marcus - Product Reuse Decisions

### Reused: All Interior Finishes (45 products)
**Why**: Marcus does the same interior finish work as Sarah, just on renovations instead of new construction. Same products, same quality tiers.

### Not Reused: Full Foundation Products (4/6 skipped)
**Why**: Marcus rarely pours full foundations. He typically connects to existing foundations. Kept 2 products for small footings and repair work.
```

### 5. **Validate with Real Use Cases**

Test with actual workflows:
```
Marcus Use Case: "I need to finish a basement"

Required Products:
- Moisture barrier ✅ (from Sarah)
- Framing lumber ✅ (from Sarah)
- Drywall ✅ (from Sarah)
- Insulation ✅ (from Sarah)
- Electrical ✅ (from Sarah)
- Plumbing ✅ (from Sarah)
- Flooring ✅ (from Sarah)
- Paint ✅ (from Sarah)

Validation: All products available, no gaps ✅
```

## Success Metrics

### Catalog Efficiency
- **Target**: >80% reuse for similar personas
- **Target**: >50% reuse for adjacent personas
- **Target**: <100 delta products per new persona

### Product Coverage
- **Target**: 100% coverage of persona's primary workflows
- **Target**: 90%+ coverage of secondary workflows
- **Target**: Zero product gaps in BOM generation

### Maintenance Efficiency
- **Target**: <10% catalog growth per new persona
- **Target**: <5% duplicate/overlapping products
- **Target**: Single product update affects all relevant personas

## Conclusion

The persona product planning process ensures:

1. **Efficient Catalog Growth** - Maximize reuse, minimize duplication
2. **Consistent Experience** - Same products work across personas
3. **Persona Relevance** - Each persona sees appropriate products
4. **Maintainable System** - One catalog, many views
5. **Scalable Approach** - Process works for any number of personas

By following this systematic process, we can expand BuildRight to serve all 5 personas with a lean, efficient, and maintainable product catalog.

---

**Next Step**: Implement Marcus's catalog using this process (92% reuse validated)  
**Related Docs**: 
- [ACO Catalog Architecture](ACO-CATALOG-ARCHITECTURE.md)
- [Product Taxonomy Analysis](PRODUCT-TAXONOMY-ANALYSIS.md)
- [BOM Calculator Summary](BOM-CALCULATOR-SUMMARY.md)

