# Phase 1: ACO Data Foundation

## Overview

**Duration**: 2-3 weeks  
**Dependencies**: None (can run parallel to Phase 0)  
**Status**: In Progress

Generate persona-enhanced product data and ingest to Adobe Commerce Optimizer (ACO). This phase works in the `buildright-aco` repository to generate data that will be ingested to a real ACO instance and also consumed by `buildright-eds` for frontend mock services.

**CRITICAL**: This phase works with a **REAL ACO INSTANCE**. All data structures follow ACO format and will be ingested via ACO API. The frontend (`buildright-eds`) will use a mock service that reads the same data structure for development without GraphQL calls.

---

## Objectives

1. Update product definitions with persona-specific attributes
2. Enhance generation scripts to include new attributes
3. Ingest products to ACO instance with new attributes
4. Create 6 customer group price books and ingest to ACO
5. Document triggered policy definitions (for manual ACO configuration)
6. Generate EDS-compatible data files (for frontend mock)
7. Update documentation (BUILDRIGHT-CASE-STUDY.md, SETUP-GUIDE.md)

---

## Repository Context

**Working Directory**: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco`

**Branch Strategy**:
```bash
cd /path/to/buildright-aco
git checkout -b persona-enhancements
```

---

## Task 1: Update Product Definitions

### 1.1 Add Persona-Specific Attributes

**File**: `scripts/config/product-definitions.js`

**New Attributes to Add**:

```javascript
{
  // Construction phase attributes (for Marcus & Sarah)
  construction_phase: ['foundation_framing', 'envelope', 'interior_finish'],
  
  // Quality tier (for Marcus)
  quality_tier: 'professional', // builder_grade | professional | premium
  
  // Package tier (for Lisa)
  package_tier: ['good', 'better', 'best'],
  room_category: 'fixtures', // fixtures | surfaces | finishes
  
  // Deck builder (for David)
  deck_compatible: true,
  deck_shape: ['rectangular', 'l_shaped'],
  deck_material_type: 'composite', // wood | composite | pvc
  deck_railing_compatible: ['aluminum', 'composite'],
  
  // Store inventory (for Kevin)
  store_velocity_category: 'fastener', // high | medium | low
  recommended_restock_quantity: 15,
  typical_days_supply: 14,
  restock_priority: 'medium' // high | medium | low
}
```

**Implementation**:
- Add attributes to each product category
- Ensure attributes are relevant to product type
- Use consistent value enumerations

**Deliverable**: Updated `product-definitions.js` with all new attributes

---

### 1.2 Validate Attribute Coverage

**Validation Script** (create if doesn't exist):

```bash
npm run validate:attributes
```

**Check**:
- All products have `construction_phase` (if applicable)
- All products have `quality_tier`
- Deck products have `deck_compatible` and related attributes
- Fixtures/surfaces/finishes have `package_tier` and `room_category`
- Fasteners/high-velocity items have store inventory attributes

**Deliverable**: Validation report showing attribute coverage

---

## Task 2: Update Generation Scripts

**CRITICAL**: Ensure new attributes are included in generated output.

### 2.1 Update Product Generation

**File**: `scripts/generate-products.js`

**Changes Required**:
1. Include all new attributes in generated JSON
2. Ensure attributes are properly formatted
3. Add validation to check attribute presence
4. Generate realistic attribute values

**Example Addition**:
```javascript
// In generate-products.js
function generateProduct(definition) {
  return {
    // ... existing fields
    attributes: {
      // ... existing attributes
      construction_phase: definition.construction_phase,
      quality_tier: definition.quality_tier,
      package_tier: definition.package_tier,
      room_category: definition.room_category,
      deck_compatible: definition.deck_compatible,
      deck_shape: definition.deck_shape,
      store_velocity_category: definition.store_velocity_category,
      // ... etc
    }
  };
}
```

**Testing**:
```bash
npm run generate:products
# Manually inspect data/buildright/products.json
# Verify new attributes are present
```

**Deliverable**: Updated `generate-products.js` with attribute support

---

### 2.2 Update Ingestion Scripts

**File**: `scripts/ingest-products.js`

**Changes Required**:
1. Ensure new attributes are sent to ACO (when connected)
2. For now, validate data structure matches ACO format
3. Add logging to show attributes being "ingested"

**Mock Ingestion**:
```javascript
// In ingest-products.js
function mockIngestProduct(product) {
  console.log(`[MOCK] Ingesting product: ${product.sku}`);
  console.log(`  Attributes: ${Object.keys(product.attributes).join(', ')}`);
  
  // Validate required attributes
  const required = ['construction_phase', 'quality_tier'];
  const missing = required.filter(attr => !product.attributes[attr]);
  
  if (missing.length > 0) {
    console.warn(`  Missing attributes: ${missing.join(', ')}`);
  }
  
  // In production, this would call ACO API
  // return acoClient.ingestProduct(product);
  
  return { success: true, product: product.sku };
}
```

**Deliverable**: Updated `ingest-products.js` with mock ingestion

---

## Task 3: Update Price Book Configuration

**CRITICAL**: Support all 6 customer groups in both generation and ingestion.

### 3.1 Define 6 Customer Groups

**Customer Groups**:
1. `commercial_tier1` - Large commercial contractors (best pricing)
2. `commercial_tier2` - Mid-size commercial contractors
3. `residential_builder` - Production home builders (Marcus, Sarah)
4. `pro_specialty` - Specialty contractors (Lisa)
5. `retail_homeowner` - DIY homeowners (David)
6. `retail_chain_buyer` - Store managers (Kevin)

### 3.2 Update Price Book Generation

**File**: `scripts/generate-price-books.js`

**Changes Required**:
```javascript
const CUSTOMER_GROUPS = [
  'commercial_tier1',
  'commercial_tier2',
  'residential_builder',
  'pro_specialty',
  'retail_homeowner',
  'retail_chain_buyer'
];

function generatePriceBooks() {
  const products = loadProducts();
  
  CUSTOMER_GROUPS.forEach(group => {
    const priceBook = {
      customer_group: group,
      effective_date: new Date().toISOString(),
      prices: []
    };
    
    products.forEach(product => {
      priceBook.prices.push({
        sku: product.sku,
        pricing: calculateGroupPricing(product, group)
      });
    });
    
    savePriceBook(group, priceBook);
  });
}
```

**Pricing Tiers Example**:
```javascript
// Base price: $34.48
const PRICING_MULTIPLIERS = {
  commercial_tier1: 0.93,    // Best pricing
  commercial_tier2: 0.95,    // Good pricing
  residential_builder: 0.97, // Standard B2B
  pro_specialty: 0.98,       // Small business
  retail_homeowner: 1.07,    // Retail markup
  retail_chain_buyer: 0.88   // Volume buyer (Kevin)
};
```

**Testing**:
```bash
npm run generate:price-books
# Check data/buildright/price-books/ directory
# Verify 6 files created (one per customer group)
```

**Deliverable**: Updated `generate-price-books.js` with 6 customer groups

---

### 3.3 Update Price Book Ingestion

**File**: `scripts/ingest-price-books.js`

**Changes Required**:
```javascript
async function mockIngestPriceBooks() {
  const groups = CUSTOMER_GROUPS;
  
  for (const group of groups) {
    const priceBook = loadPriceBook(group);
    console.log(`[MOCK] Ingesting price book for: ${group}`);
    console.log(`  Products: ${priceBook.prices.length}`);
    
    // In production: await acoClient.ingestPriceBook(priceBook);
  }
}
```

**Deliverable**: Updated `ingest-price-books.js` with mock for 6 groups

---

## Task 4: Create Policy Definitions

**CRITICAL**: Policies cannot be created via API—they must be documented for manual ACO setup.

### 4.1 Create Policy Documentation

**New File**: `scripts/config/policy-definitions.js`

**Content**:
```javascript
/**
 * Triggered Policy Definitions for BuildRight CCDM Demo
 * 
 * NOTE: Policies must be created manually in ACO Admin UI.
 * This file documents the required configuration.
 */

export const POLICY_DEFINITIONS = {
  // Project type policies (Marcus)
  PROJECT_TYPE: {
    new_construction: {
      name: 'New Construction Project',
      trigger: 'user_selection',
      filter_type: 'include_categories',
      categories: ['structural_materials', 'fasteners_hardware', 'roofing'],
      description: 'Show products relevant to new construction projects'
    },
    remodel: {
      name: 'Remodel Project',
      trigger: 'user_selection',
      filter_type: 'include_all',
      description: 'Show all product categories for remodel projects'
    }
  },
  
  // Construction phase policies (Marcus)
  CONSTRUCTION_PHASE: {
    foundation_framing: {
      name: 'Foundation & Framing Phase',
      trigger: 'wizard_step',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'foundation_framing',
      description: 'Show products for foundation and framing work'
    },
    envelope: {
      name: 'Building Envelope Phase',
      trigger: 'wizard_step',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'envelope'
    },
    interior_finish: {
      name: 'Interior Finish Phase',
      trigger: 'wizard_step',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'interior_finish'
    }
  },
  
  // Quality tier policies (Marcus)
  QUALITY_TIER: {
    builder_grade: {
      name: 'Builder Grade Materials',
      trigger: 'user_selection',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'builder_grade'
    },
    professional: {
      name: 'Professional Grade Materials',
      trigger: 'user_selection',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'professional'
    },
    premium: {
      name: 'Premium Materials',
      trigger: 'user_selection',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'premium'
    }
  },
  
  // Deck builder policies (David)
  DECK_BUILDER: {
    deck_compatible_only: {
      name: 'Deck-Compatible Products Only',
      trigger: 'wizard_entry',
      filter_type: 'attribute_match',
      attribute: 'deck_compatible',
      value: true,
      description: 'Initial filter when entering deck builder'
    },
    rectangular_deck: {
      name: 'Rectangular Deck Products',
      trigger: 'shape_selection',
      filter_type: 'attribute_match',
      attribute: 'deck_shape',
      value: 'rectangular'
    },
    l_shaped_deck: {
      name: 'L-Shaped Deck Products',
      trigger: 'shape_selection',
      filter_type: 'attribute_match',
      attribute: 'deck_shape',
      value: 'l_shaped'
    },
    wood_decking: {
      name: 'Wood Decking Material',
      trigger: 'material_selection',
      filter_type: 'attribute_match',
      attribute: 'deck_material_type',
      value: 'wood'
    },
    composite_decking: {
      name: 'Composite Decking Material',
      trigger: 'material_selection',
      filter_type: 'attribute_match',
      attribute: 'deck_material_type',
      value: 'composite'
    }
  },
  
  // Package tier policies (Lisa)
  PACKAGE_TIER: {
    good_tier: {
      name: 'Good Tier Package',
      trigger: 'package_selection',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'good'
    },
    better_tier: {
      name: 'Better Tier Package',
      trigger: 'package_selection',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'better'
    },
    best_tier: {
      name: 'Best Tier Package',
      trigger: 'package_selection',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'best'
    }
  }
};

/**
 * Generate ACO policy configuration guide
 */
export function generatePolicyGuide() {
  let guide = '# ACO Policy Configuration Guide\n\n';
  
  Object.entries(POLICY_DEFINITIONS).forEach(([category, policies]) => {
    guide += `## ${category}\n\n`;
    
    Object.entries(policies).forEach(([key, policy]) => {
      guide += `### ${policy.name}\n`;
      guide += `- **Trigger**: ${policy.trigger}\n`;
      guide += `- **Filter Type**: ${policy.filter_type}\n`;
      if (policy.attribute) {
        guide += `- **Attribute**: ${policy.attribute}\n`;
        guide += `- **Value**: ${policy.value}\n`;
      }
      guide += `- **Description**: ${policy.description || 'N/A'}\n\n`;
    });
  });
  
  return guide;
}
```

**Deliverable**: `scripts/config/policy-definitions.js`

---

### 4.2 Generate Policy Configuration Guide

**File**: `scripts/generate-policy-guide.js`

```javascript
import { generatePolicyGuide } from './config/policy-definitions.js';
import fs from 'fs';

const guide = generatePolicyGuide();
fs.writeFileSync('data/buildright/POLICY-SETUP-GUIDE.md', guide);
console.log('Policy guide generated: data/buildright/POLICY-SETUP-GUIDE.md');
```

**Add to package.json**:
```json
{
  "scripts": {
    "generate:policy-guide": "node scripts/generate-policy-guide.js"
  }
}
```

**Testing**:
```bash
npm run generate:policy-guide
# Review data/buildright/POLICY-SETUP-GUIDE.md
```

**Deliverable**: Auto-generated policy setup guide

---

## Task 5: Generate EDS-Compatible Data

Create transformation script to convert ACO format to EDS format.

### 5.1 Create EDS Data Generator

**New File**: `scripts/generate-eds-data.js`

```javascript
/**
 * Transform ACO-format data into EDS-compatible JSON files
 * Output files are used by buildright-eds frontend
 */

import fs from 'fs';
import path from 'path';

const ACO_DATA_DIR = './data/buildright';
const EDS_OUTPUT_DIR = '../buildright-eds/data';

/**
 * Transform products.json (ACO) to mock-products.json (EDS)
 */
function generateEDSProducts() {
  const acoProducts = JSON.parse(
    fs.readFileSync(path.join(ACO_DATA_DIR, 'products.json'))
  );
  
  const edsProducts = acoProducts.map(product => ({
    // EDS format
    id: product.sku,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image_url,
    category: product.category,
    // Preserve all attributes for filtering
    attributes: product.attributes,
    // Add computed fields for EDS
    inStock: true, // mock inventory
    rating: 4.5 // mock rating
  }));
  
  fs.writeFileSync(
    path.join(EDS_OUTPUT_DIR, 'mock-products.json'),
    JSON.stringify(edsProducts, null, 2)
  );
  
  console.log(`Generated ${edsProducts.length} products for EDS`);
}

/**
 * Generate templates.json for Sarah
 */
function generateTemplates() {
  const templates = [
    {
      id: 'sedona',
      name: 'The Sedona',
      sqft: 2450,
      stories: 2,
      bedrooms: 4,
      bathrooms: 2.5,
      image: '/images/floor-plans/sedona.png',
      finishedImage: '/images/finished-homes/sedona.jpg',
      variants: ['standard', 'bonus_room'],
      bom: [] // Will be populated from products
    },
    // ... more templates
  ];
  
  fs.writeFileSync(
    path.join(EDS_OUTPUT_DIR, 'templates.json'),
    JSON.stringify(templates, null, 2)
  );
}

/**
 * Generate bathroom-packages.json for Lisa
 */
function generateBathroomPackages() {
  const packages = {
    good: {
      tier: 'good',
      name: 'Good Package',
      price: 8500,
      image: '/images/packages/bathroom-good.jpg',
      products: [] // SKUs from products.json where package_tier includes 'good'
    },
    better: {
      tier: 'better',
      name: 'Better Package',
      price: 14200,
      image: '/images/packages/bathroom-better.jpg',
      products: []
    },
    best: {
      tier: 'best',
      name: 'Best Package',
      price: 23800,
      image: '/images/packages/bathroom-best.jpg',
      products: []
    }
  };
  
  fs.writeFileSync(
    path.join(EDS_OUTPUT_DIR, 'bathroom-packages.json'),
    JSON.stringify(packages, null, 2)
  );
}

/**
 * Generate store-inventory.json for Kevin
 */
function generateStoreInventory() {
  const acoProducts = JSON.parse(
    fs.readFileSync(path.join(ACO_DATA_DIR, 'products.json'))
  );
  
  // Filter to high-velocity products
  const inventory = acoProducts
    .filter(p => p.attributes.store_velocity_category)
    .map(product => ({
      sku: product.sku,
      name: product.name,
      currentStock: Math.floor(Math.random() * 50),
      recommendedStock: product.attributes.recommended_restock_quantity,
      daysSupply: product.attributes.typical_days_supply,
      velocityCategory: product.attributes.store_velocity_category,
      restockPriority: product.attributes.restock_priority
    }));
  
  fs.writeFileSync(
    path.join(EDS_OUTPUT_DIR, 'store-inventory.json'),
    JSON.stringify(inventory, null, 2)
  );
}

// Run all generators
generateEDSProducts();
generateTemplates();
generateBathroomPackages();
generateStoreInventory();

console.log('EDS data generation complete');
```

**Add to package.json**:
```json
{
  "scripts": {
    "generate:eds": "node scripts/generate-eds-data.js"
  }
}
```

**Deliverable**: `scripts/generate-eds-data.js`

---

## Task 6: Update Documentation

### 6.1 Update BUILDRIGHT-CASE-STUDY.md

**File**: `docs/BUILDRIGHT-CASE-STUDY.md`

**New Sections to Add**:

#### Section 6: Persona-Based Experiences
```markdown
## 6. Persona-Based Experiences

BuildRight serves 5 distinct user personas, each with unique needs:

### 6.1 Sarah Martinez - Production Builder
- **Customer Group**: Commercial Tier 2
- **Use Case**: Template-based repeat ordering
- **Features**: Floor plan templates, phase-based BOMs, variant management

### 6.2 Marcus Johnson - General Contractor
- **Customer Group**: Residential Builder
- **Use Case**: Custom project material planning
- **Features**: Project wizard, phase selection, quality tier selection

### 6.3 Lisa Chen - Remodeling Contractor
- **Customer Group**: Pro Specialty
- **Use Case**: Room package selection and customization
- **Features**: Good/Better/Best packages, visual comparisons, customization

### 6.4 David Thompson - Pro Homeowner
- **Customer Group**: Retail Homeowner
- **Use Case**: DIY deck building
- **Features**: Guided deck builder, progressive disclosure, educational content

### 6.5 Kevin Rodriguez - Store Manager
- **Customer Group**: Retail Chain Buyer
- **Use Case**: Velocity-based inventory management
- **Features**: Restock dashboard, smart suggestions, priority indicators
```

#### Section 7: Customer Group Architecture
```markdown
## 7. Customer Group Architecture

BuildRight uses Adobe Commerce native customer groups for differentiated experiences:

| Customer Group | Pricing Tier | Target Audience | Personas |
|----------------|--------------|-----------------|----------|
| Commercial Tier 1 | Best (93% of base) | Large commercial | (Future) |
| Commercial Tier 2 | Good (95% of base) | Mid-size commercial | Sarah |
| Residential Builder | Standard (97% of base) | Production builders | Marcus, Sarah |
| Pro Specialty | Small business (98% of base) | Specialty contractors | Lisa |
| Retail Homeowner | Retail (107% of base) | DIY homeowners | David |
| Retail Chain Buyer | Volume (88% of base) | Store buyers | Kevin |

Volume pricing tiers apply within each customer group.
```

#### Section 8: Triggered Policy Framework
```markdown
## 8. Triggered Policy Framework

CCDM policies progressively filter the catalog based on user selections:

### Policy Categories

1. **Project Type Policies** (Marcus)
   - New Construction: Show structural materials, exclude finishes
   - Remodel: Show all categories

2. **Construction Phase Policies** (Marcus)
   - Foundation/Framing: Filter to phase-specific products
   - Envelope: Windows, doors, roofing
   - Interior: Finishes, fixtures, flooring

3. **Quality Tier Policies** (Marcus)
   - Builder Grade, Professional, Premium
   - Filters products by quality_tier attribute

4. **Deck Builder Policies** (David)
   - Shape: Rectangular vs. L-shaped
   - Material: Wood, Composite, PVC
   - Progressive filtering at each step

5. **Package Tier Policies** (Lisa)
   - Good/Better/Best filtering
   - Room category: Fixtures, Surfaces, Finishes

See `data/buildright/POLICY-SETUP-GUIDE.md` for detailed configuration.
```

**Deliverable**: Updated `docs/BUILDRIGHT-CASE-STUDY.md`

---

### 6.2 Update SETUP-GUIDE.md

**File**: `docs/SETUP-GUIDE.md`

**Add New Phases**:

#### Phase 7: Persona Customer Groups
```markdown
## Phase 7: Persona Customer Groups

### Create Customer Groups in ACO Admin

1. Navigate to: **ACO Admin** > **Customers** > **Customer Groups**

2. Create 6 groups:
   - `commercial_tier1` - Description: "Large Commercial Contractors"
   - `commercial_tier2` - Description: "Mid-size Commercial Contractors"
   - `residential_builder` - Description: "Production Home Builders"
   - `pro_specialty` - Description: "Specialty Contractors"
   - `retail_homeowner` - Description: "DIY Homeowners"
   - `retail_chain_buyer` - Description: "Store Managers/Buyers"

3. Assign pricing tiers (from ingested price books)

### Assign Demo Users to Groups

Map demo personas to customer groups:
- Sarah Martinez → `commercial_tier2`
- Marcus Johnson → `residential_builder`
- Lisa Chen → `pro_specialty`
- David Thompson → `retail_homeowner`
- Kevin Rodriguez → `retail_chain_buyer`
```

#### Phase 8: Triggered Policies for Personas
```markdown
## Phase 8: Triggered Policies for Personas

**NOTE**: Policies must be created manually in ACO Admin UI.

Refer to: `data/buildright/POLICY-SETUP-GUIDE.md`

### Create Policies

For each policy in the guide:
1. Navigate to: **ACO Admin** > **CCDM** > **Policies** > **Create New**
2. Set trigger type (user_selection, wizard_step, etc.)
3. Configure filter (attribute_match, include_categories, etc.)
4. Test policy with sample data
5. Activate policy

### Policy Testing Checklist

- [ ] Project type policies (new_construction, remodel)
- [ ] Construction phase policies (foundation, envelope, interior)
- [ ] Quality tier policies (builder_grade, professional, premium)
- [ ] Deck builder policies (shape, material)
- [ ] Package tier policies (good, better, best)
```

**Deliverable**: Updated `docs/SETUP-GUIDE.md`

---

## Task 7: Run Full Generation Pipeline

### 7.1 Generate All Data

```bash
# From buildright-aco directory
npm run generate:all
npm run validate:all
npm run generate:policy-guide
npm run generate:eds
```

### 7.2 Validate Output

**Checklist**:
- [ ] `data/buildright/products.json` includes all new attributes
- [ ] 6 price book files in `data/buildright/price-books/`
- [ ] `data/buildright/POLICY-SETUP-GUIDE.md` generated
- [ ] `../buildright-eds/data/mock-products.json` generated
- [ ] `../buildright-eds/data/templates.json` generated
- [ ] `../buildright-eds/data/bathroom-packages.json` generated
- [ ] `../buildright-eds/data/store-inventory.json` generated

### 7.3 Mock Ingestion Test

```bash
npm run ingest:all
# Should show mock ingestion logs for all data
# No actual ACO connection made
```

**Deliverable**: Validated generated data files

---

## Success Criteria

✅ All product definitions include persona-specific attributes  
✅ Generation scripts output new attributes  
✅ Ingestion scripts validate ACO-format data (mocked)  
✅ 6 customer group price books generated  
✅ Policy definitions documented with setup guide  
✅ EDS-compatible data files generated  
✅ BUILDRIGHT-CASE-STUDY.md updated with persona info  
✅ SETUP-GUIDE.md updated with new phases  
✅ Full generation pipeline runs without errors  
✅ All validation scripts pass

---

## Testing/Validation

### Unit Tests
- [ ] Product generation includes all required attributes
- [ ] Price books generate for all 6 customer groups
- [ ] EDS data format matches expected structure

### Integration Tests
- [ ] Full generation pipeline runs end-to-end
- [ ] Output files are valid JSON
- [ ] Attribute coverage meets requirements

### Manual Validation
- [ ] Spot-check products.json for attribute completeness
- [ ] Review price-books for pricing correctness
- [ ] Verify EDS data files can be consumed by frontend

---

## Deliverables Checklist

### Code Files
- [ ] `scripts/config/product-definitions.js` (updated)
- [ ] `scripts/config/policy-definitions.js` (new)
- [ ] `scripts/generate-products.js` (updated)
- [ ] `scripts/ingest-products.js` (updated)
- [ ] `scripts/generate-price-books.js` (updated)
- [ ] `scripts/ingest-price-books.js` (updated)
- [ ] `scripts/generate-policy-guide.js` (new)
- [ ] `scripts/generate-eds-data.js` (new)

### Data Files
- [ ] `data/buildright/products.json` (regenerated)
- [ ] `data/buildright/price-books/*.json` (6 files)
- [ ] `data/buildright/POLICY-SETUP-GUIDE.md` (generated)
- [ ] `../buildright-eds/data/mock-products.json` (generated)
- [ ] `../buildright-eds/data/templates.json` (generated)
- [ ] `../buildright-eds/data/bathroom-packages.json` (generated)
- [ ] `../buildright-eds/data/store-inventory.json` (generated)

### Documentation
- [ ] `docs/BUILDRIGHT-CASE-STUDY.md` (updated)
- [ ] `docs/SETUP-GUIDE.md` (updated)

---

## Next Steps

Upon completion of Phase 1:
1. **Phase 2**: Create design system icons
2. **Phase 3**: Build core architecture using generated data
3. **Ongoing**: Regenerate data as needed during implementation

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `PHASE-0-RESEARCH-AND-DECISIONS.md` - Architecture decisions
- `PERSONA-IMPLEMENTATION-PLAN.md` - Original comprehensive plan

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

