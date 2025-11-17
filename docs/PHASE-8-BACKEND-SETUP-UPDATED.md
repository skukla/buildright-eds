# Phase 8: Adobe Commerce Backend Setup (UPDATED)

## Overview

**Duration**: 2-3 weeks  
**Dependencies**: Phase 1 (ACO data foundation), Access to Adobe Commerce/ACO instance  
**Status**: Not Started  
**Can Run in Parallel With**: Phase 3-6 (frontend development)

**UPDATED**: This phase now correctly creates products in Adobe Commerce PaaS (which auto-syncs to ACO) rather than directly ingesting to ACO.

Set up real Adobe Commerce and ACO backend to support the persona-driven demo. This phase takes the data and scripts from Phase 1 (`buildright-aco` repo) and deploys them to a production Adobe Commerce/ACO instance.

**CRITICAL**: This phase can run **in parallel** with frontend development (Phase 3-7). The mock ACO service ensures frontend work isn't blocked.

---

## Key Understanding: Product Data Flow

```
1. CREATE PRODUCTS                2. AUTO-SYNC              3. ENHANCE IN ACO
   (Adobe Commerce PaaS)             (SaaS Data Export)        (ACO Admin UI)
   
   ┌─────────────────┐              ┌─────────────────┐      ┌─────────────────┐
   │ REST API or     │              │ Automatic       │      │ Catalog Views   │
   │ Admin UI        │─────────────>│ Sync            │─────>│ Policies        │
   │                 │              │ (every X min)   │      │ Price Books     │
   │ • Products      │              │                 │      │                 │
   │ • Attributes    │              │ Syncs:          │      │ No product      │
   │ • Base Prices   │              │ • Products      │      │ creation here!  │
   │ • Categories    │              │ • Attributes    │      │                 │
   │ • Images        │              │ • Prices        │      │                 │
   └─────────────────┘              └─────────────────┘      └─────────────────┘
   
   Source of Truth                  Bridge                   Enhancement Layer
```

**Critical**: Products are **created in Adobe Commerce**, then **automatically synced to ACO**, then **enhanced in ACO**.

---

## Objectives

1. ✅ Configure customer groups in Adobe Commerce
2. ✅ Register custom attributes in Adobe Commerce
3. ✅ **Create products in Adobe Commerce PaaS** (NEW APPROACH)
4. ✅ **Trigger automatic sync to ACO** (NEW STEP)
5. ✅ Set up ACO price books and pricing
6. ✅ Configure ACO policies (28 triggered policies)
7. ✅ Create demo customer accounts
8. ✅ Validate end-to-end data flow

---

## Prerequisites

### Required Access
- [ ] Adobe Commerce Admin access
- [ ] Adobe Commerce REST API credentials
- [ ] ACO Admin UI access
- [ ] ACO API credentials (for validation only)
- [ ] Ability to create customer groups
- [ ] Ability to register custom attributes
- [ ] Ability to run `bin/magento` commands (for sync trigger)

### Environment Configuration
- [ ] Adobe Commerce instance URL
- [ ] Adobe Commerce Admin Token
- [ ] ACO tenant ID
- [ ] ACO API endpoint
- [ ] Environment variables configured in `buildright-aco/.env`

**See**: `buildright-aco/docs/SETUP-GUIDE.md` for detailed environment setup

---

## Task 1: Customer Group Configuration

### 1.1 Create Customer Groups in Adobe Commerce Admin

**Location**: Adobe Commerce Admin → Customers → Customer Groups

**Groups to Create**:

| Group Name | Tax Class | Discount % | Persona(s) |
|------------|-----------|------------|------------|
| US-Retail | Retail Customer | 0% | David (base) |
| Retail-Registered | Retail Customer | 5% | David (registered) |
| Trade-Professional | Wholesale | 10% | Marcus, Lisa |
| Production-Builder | Wholesale | 15% | Sarah |
| Wholesale-Reseller | Wholesale | 25% | Kevin |

**Steps**:
1. Navigate to Customers → Customer Groups
2. Click "Add New Customer Group"
3. Enter group name
4. Select tax class
5. Save customer group
6. Repeat for all 5 groups

**Validation**:
```bash
# Query customer groups via API
curl -X GET "https://your-instance.adobe.io/rest/V1/customerGroups/search" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Deliverable**: 5 customer groups created in Adobe Commerce

---

### 1.2 Configure Group Pricing Rules

**Location**: Adobe Commerce Admin → Marketing → Catalog Price Rules

**Rules to Create**:

1. **Trade Professional Discount**
   - Customer Group: Trade-Professional
   - Discount: 10% off catalog price
   - Priority: 10

2. **Production Builder Discount**
   - Customer Group: Production-Builder
   - Discount: 15% off catalog price
   - Priority: 20

3. **Wholesale Reseller Discount**
   - Customer Group: Wholesale-Reseller
   - Discount: 25% off catalog price
   - Priority: 30

4. **Retail Registered Discount**
   - Customer Group: Retail-Registered
   - Discount: 5% off catalog price
   - Priority: 5

**Deliverable**: 4 pricing rules configured

---

## Task 2: Custom Attribute Registration

### 2.1 Register Persona Attributes in Adobe Commerce

**Location**: Adobe Commerce Admin → Stores → Attributes → Product

**Attributes to Create** (20 total):

#### Construction Phase Attributes (Marcus)
1. **construction_phase**
   - Type: Dropdown
   - Values: foundation_framing, envelope, interior_finish, exterior_finish, final_touches
   - Searchable: Yes
   - Filterable: Yes
   - Used in ACO Policies: Yes

2. **quality_tier**
   - Type: Dropdown
   - Values: builder_grade, professional, premium
   - Searchable: Yes
   - Filterable: Yes

#### Package Tier Attributes (Lisa)
3. **package_tier**
   - Type: Multi-select
   - Values: good, better, best
   - Searchable: Yes
   - Filterable: Yes

4. **room_category**
   - Type: Dropdown
   - Values: bathroom, kitchen, bedroom, living_room
   - Searchable: Yes
   - Filterable: Yes

#### Deck Builder Attributes (David)
5. **deck_compatible**
   - Type: Yes/No
   - Searchable: Yes
   - Filterable: Yes

6. **deck_shape**
   - Type: Multi-select
   - Values: rectangular, l_shaped, wrap_around, multi_level
   - Searchable: Yes
   - Filterable: Yes

7. **deck_material_type**
   - Type: Dropdown
   - Values: wood, composite, pvc
   - Searchable: Yes
   - Filterable: Yes

8. **deck_railing_compatible**
   - Type: Yes/No
   - Searchable: Yes
   - Filterable: Yes

#### Store Velocity Attributes (Kevin)
9. **store_velocity_category**
   - Type: Dropdown
   - Values: high_volume, medium_volume, low_volume
   - Searchable: Yes
   - Filterable: Yes

10. **restock_priority**
    - Type: Dropdown
    - Values: high, medium, low
    - Searchable: Yes
    - Filterable: Yes

**... (10 more attributes as defined in Phase 1)**

**Validation**:
```bash
# Query attributes via API
curl -X GET "https://your-instance.adobe.io/rest/V1/products/attributes?searchCriteria[filterGroups][0][filters][0][field]=attribute_code&searchCriteria[filterGroups][0][filters][0][value]=construction_phase" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Deliverable**: 20 custom attributes registered in Adobe Commerce

**IMPORTANT**: These attributes will **automatically sync to ACO** via SaaS Data Export.

---

## Task 3: ACO Price Book Configuration

### 3.1 Create Price Books in ACO Admin UI

**Location**: ACO Admin UI → Price Books

**Price Books to Create**:

1. **US-Retail** (Base)
   - Currency: USD
   - Parent: None
   - Description: Base retail pricing

2. **Production-Builder**
   - Currency: USD
   - Parent: US-Retail
   - Discount: 15% off base
   - Customer Group: Production-Builder

3. **Trade-Professional**
   - Currency: USD
   - Parent: US-Retail
   - Discount: 10% off base
   - Customer Group: Trade-Professional

4. **Wholesale-Reseller**
   - Currency: USD
   - Parent: US-Retail
   - Discount: 25% off base
   - Customer Group: Wholesale-Reseller

5. **Retail-Registered**
   - Currency: USD
   - Parent: US-Retail
   - Discount: 5% off base
   - Customer Group: Retail-Registered

**Deliverable**: 5 price books in ACO

---

### 3.2 Configure Volume Tier Pricing

**Location**: ACO Admin UI → Price Books → Volume Tiers

**Volume Tiers** (apply to all price books):

| Quantity Range | Discount |
|----------------|----------|
| 1-99 | 0% |
| 100-293 | 3% |
| 294+ | 8% |

**Example Calculation**:
- Product base price: $10.00
- Customer: Sarah (Production-Builder, 15% off)
- Quantity: 500 units
- Final price: $10.00 × 0.85 (customer tier) × 0.92 (volume tier) = $7.82/unit

**Deliverable**: Volume tiers configured for all price books

---

## Task 4: Product Creation in Adobe Commerce PaaS ⚠️ **UPDATED**

### 4.1 NEW: Create Script for Adobe Commerce REST API

**File**: `buildright-aco/scripts/create-products-commerce.js`

**Purpose**: Create products in Adobe Commerce PaaS (which will auto-sync to ACO)

**Implementation**:

```javascript
/**
 * Create Products in Adobe Commerce PaaS
 * Products will automatically sync to ACO via SaaS Data Export
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMMERCE_API_URL = process.env.COMMERCE_API_URL || 'https://your-instance.adobe.io';
const COMMERCE_TOKEN = process.env.COMMERCE_ADMIN_TOKEN;
const ATTRIBUTE_SET_ID = process.env.ATTRIBUTE_SET_ID || 4; // Default attribute set

/**
 * Get admin token
 */
async function getAdminToken() {
  if (COMMERCE_TOKEN) {
    return COMMERCE_TOKEN;
  }
  
  // If no token in env, authenticate
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/integration/admin/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.COMMERCE_ADMIN_USERNAME,
      password: process.env.COMMERCE_ADMIN_PASSWORD
    })
  });
  
  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Transform ACO product format to Commerce API format
 */
function transformProduct(acoProduct) {
  return {
    product: {
      sku: acoProduct.sku,
      name: acoProduct.name,
      attribute_set_id: ATTRIBUTE_SET_ID,
      price: acoProduct.price || 0,
      status: 1, // Enabled
      visibility: 4, // Catalog, Search
      type_id: acoProduct.type || 'simple',
      weight: acoProduct.weight || 0,
      extension_attributes: {
        stock_item: {
          qty: 1000, // Default inventory
          is_in_stock: true
        }
      },
      custom_attributes: [
        {
          attribute_code: 'description',
          value: acoProduct.description || ''
        },
        // Transform ACO attributes to Commerce custom_attributes
        ...(acoProduct.attributes || []).map(attr => ({
          attribute_code: attr.code,
          value: attr.value
        }))
      ]
    }
  };
}

/**
 * Create single product in Commerce
 */
async function createProduct(product, token) {
  const commerceProduct = transformProduct(product);
  
  console.log(`Creating product: ${product.sku}`);
  
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commerceProduct)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${product.sku}: ${error}`);
  }
  
  return await response.json();
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Creating Products in Adobe Commerce PaaS ===\n');
  
  // Get admin token
  console.log('Authenticating...');
  const token = await getAdminToken();
  console.log('✓ Authenticated\n');
  
  // Load ACO product data
  const productsFile = path.join(__dirname, '../data/buildright/products.json');
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
  
  console.log(`Loaded ${products.length} products\n`);
  
  // Create products
  let created = 0;
  let failed = 0;
  
  for (const product of products) {
    try {
      await createProduct(product, token);
      created++;
      console.log(`✓ Created: ${product.sku}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${product.sku} - ${error.message}`);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${products.length}`);
  
  console.log(`\n=== Next Steps ===`);
  console.log(`1. Trigger SaaS Data Export sync:`);
  console.log(`   bin/magento saas:resync --feed=products`);
  console.log(`   bin/magento saas:resync --feed=productAttributes`);
  console.log(`\n2. Verify sync in ACO Admin UI`);
  console.log(`\n3. Configure ACO enhancements (Policies, Price Books)`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

**Deliverable**: Script to create products in Adobe Commerce

---

### 4.2 Create Products in Adobe Commerce

**Command**:
```bash
cd buildright-aco

# Set environment variables
export COMMERCE_API_URL="https://your-instance.adobe.io"
export COMMERCE_ADMIN_USERNAME="admin"
export COMMERCE_ADMIN_PASSWORD="your-password"
# OR
export COMMERCE_ADMIN_TOKEN="your-token"

# Run script
node scripts/create-products-commerce.js
```

**Expected Result**:
```
=== Creating Products in Adobe Commerce PaaS ===

Authenticating...
✓ Authenticated

Loaded 70 products

✓ Created: LBR-D0414F1E
✓ Created: LBR-D0616F1E
✓ Created: FAS-N16D-5LB
...

=== Summary ===
Created: 70
Failed: 0
Total: 70

=== Next Steps ===
1. Trigger SaaS Data Export sync:
   bin/magento saas:resync --feed=products
   bin/magento saas:resync --feed=productAttributes

2. Verify sync in ACO Admin UI

3. Configure ACO enhancements (Policies, Price Books)
```

**Deliverable**: 70 products created in Adobe Commerce PaaS

---

### 4.3 Trigger SaaS Data Export Sync

**Purpose**: Force immediate sync of products to ACO (instead of waiting for cron)

**Commands**:
```bash
# SSH into Adobe Commerce instance
ssh your-instance

# Trigger product sync
bin/magento saas:resync --feed=products

# Trigger attribute sync
bin/magento saas:resync --feed=productAttributes

# Trigger price sync
bin/magento saas:resync --feed=prices

# Check sync status
bin/magento saas:status
```

**Expected Output**:
```
Resyncing feed: products
Processing batch 1 of 1...
✓ Synced 70 products to SaaS

Resyncing feed: productAttributes
Processing batch 1 of 1...
✓ Synced 20 attributes to SaaS

Resyncing feed: prices
Processing batch 1 of 1...
✓ Synced 70 price entries to SaaS
```

**Deliverable**: Products synced from Adobe Commerce to ACO

---

### 4.4 Verify Products in ACO

**Method 1: ACO Admin UI**
1. Log into ACO Admin UI
2. Navigate to Catalog → Products
3. Verify 70 products are present
4. Check that custom attributes are visible

**Method 2: ACO GraphQL API**
```graphql
query {
  products(
    filter: { sku: { eq: "LBR-D0414F1E" } }
  ) {
    items {
      sku
      name
      price
      attributes {
        construction_phase
        quality_tier
      }
    }
  }
}
```

**Expected Result**:
```json
{
  "data": {
    "products": {
      "items": [
        {
          "sku": "LBR-D0414F1E",
          "name": "2x4x8 Douglas Fir Framing Lumber",
          "price": 10.00,
          "attributes": {
            "construction_phase": "foundation_framing",
            "quality_tier": "professional"
          }
        }
      ]
    }
  }
}
```

**Deliverable**: Products verified in ACO with all custom attributes

---

### 4.5 Create Variants in Adobe Commerce

**File**: `buildright-aco/scripts/create-variants-commerce.js`

**Similar to 4.1, but for configurable products and variants**

**Command**:
```bash
node scripts/create-variants-commerce.js
bin/magento saas:resync --feed=products
```

**Deliverable**: 92 variant products in Adobe Commerce → ACO

---

### 4.6 Create Bundles in Adobe Commerce

**File**: `buildright-aco/scripts/create-bundles-commerce.js`

**Similar to 4.1, but for bundle products**

**Command**:
```bash
node scripts/create-bundles-commerce.js
bin/magento saas:resync --feed=products
```

**Deliverable**: 15 bundle products in Adobe Commerce → ACO

---

## Task 5: ACO Policy Configuration

### 5.1 Create Triggered Policies in ACO Admin UI

**Location**: ACO Admin UI → Policies

**Guide**: `buildright-aco/data/buildright/POLICY-SETUP-GUIDE.md`

**Policies to Create**: 28 total across 10 categories

**Policy Categories**:
1. Construction Phase (5 policies) - Marcus
2. Quality Tier (3 policies) - Marcus
3. Package Tier (3 policies) - Lisa
4. Room Category (4 policies) - Lisa
5. Deck Compatible (1 policy) - David
6. Deck Shape (3 policies) - David
7. Deck Material (3 policies) - David
8. Deck Railing (1 policy) - David
9. Store Velocity (3 policies) - Kevin
10. Restock Priority (2 policies) - Kevin

**Process for Each Policy**:
1. Open ACO Admin UI
2. Navigate to Policies
3. Click "Create Policy"
4. Set policy name
5. Set trigger attribute (e.g., `construction_phase`)
6. Set filter condition (e.g., `equals "foundation_framing"`)
7. Test policy with sample query
8. Save policy

**Validation**:
```graphql
# Test policy filtering
query {
  products(
    filter: { 
      construction_phase: { eq: "foundation_framing" }
    }
  ) {
    items {
      sku
      name
      attributes {
        construction_phase
      }
    }
  }
}
```

**Deliverable**: 28 policies configured in ACO

---

## Task 6: Demo Customer Account Creation

### 6.1 Create Customer Accounts in Adobe Commerce

**Location**: Adobe Commerce Admin → Customers → All Customers

**Customers to Create**:

1. **Sarah Martinez** (Production Builder)
   - Email: sarah.martinez@sunbelthomes.com
   - Customer Group: Production-Builder
   - Custom Attributes:
     - business_type: production_builder
     - project_scale: large
     - primary_service: new_construction

2. **Marcus Johnson** (General Contractor)
   - Email: marcus.johnson@customhomesllc.com
   - Customer Group: Trade-Professional
   - Custom Attributes:
     - business_type: general_contractor
     - project_scale: medium
     - primary_service: custom_homes

3. **Lisa Chen** (Remodeling Contractor)
   - Email: lisa.chen@renovationpros.com
   - Customer Group: Trade-Professional
   - Custom Attributes:
     - business_type: remodeling_contractor
     - project_scale: medium
     - primary_service: remodeling

4. **David Thompson** (Pro Homeowner)
   - Email: david.thompson@email.com
   - Customer Group: Retail-Registered
   - Custom Attributes:
     - business_type: homeowner
     - project_scale: small
     - primary_service: diy_projects

5. **Kevin Rodriguez** (Store Manager)
   - Email: kevin.rodriguez@prosupplystore.com
   - Customer Group: Wholesale-Reseller
   - Custom Attributes:
     - business_type: retail_store
     - project_scale: large
     - primary_service: resale

**Deliverable**: 5 demo customer accounts

---

## Task 7: End-to-End Validation

### 7.1 Validate Complete Flow

**Test 1: Product Sync**
```bash
# 1. Create product in Commerce
curl -X POST "${COMMERCE_API_URL}/rest/V1/products" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"product": {...}}'

# 2. Trigger sync
bin/magento saas:resync --feed=products

# 3. Query in ACO
# Should see product with all attributes
```

**Test 2: Customer Group Pricing**
```bash
# Query product as Sarah (Production-Builder)
# Should see 15% discount applied
```

**Test 3: Policy Filtering**
```bash
# Query with construction_phase filter
# Should only return matching products
```

**Test 4: Volume Tier Pricing**
```bash
# Query pricing for 500 units
# Should see both customer tier and volume tier discounts
```

**Deliverable**: All tests passing

---

## Success Criteria

- [ ] 5 customer groups created in Adobe Commerce
- [ ] 20 custom attributes registered in Adobe Commerce
- [ ] 20 custom attributes synced to ACO
- [ ] 70 simple products created in Adobe Commerce
- [ ] 70 simple products synced to ACO
- [ ] 92 variant products created in Adobe Commerce
- [ ] 92 variant products synced to ACO
- [ ] 15 bundle products created in Adobe Commerce
- [ ] 15 bundle products synced to ACO
- [ ] 5 price books configured in ACO
- [ ] Volume tier pricing configured
- [ ] 28 policies configured in ACO
- [ ] 5 demo customer accounts created
- [ ] End-to-end validation passing

---

## New Scripts Required

### In buildright-aco Repository

1. **scripts/create-products-commerce.js** ✅ NEW
   - Create simple products in Adobe Commerce via REST API
   
2. **scripts/create-variants-commerce.js** ✅ NEW
   - Create configurable products and variants in Adobe Commerce
   
3. **scripts/create-bundles-commerce.js** ✅ NEW
   - Create bundle products in Adobe Commerce
   
4. **scripts/register-attributes-commerce.js** ✅ NEW
   - Register custom attributes in Adobe Commerce
   
5. **scripts/create-customers-commerce.js** ✅ NEW
   - Create demo customer accounts in Adobe Commerce
   
6. **scripts/validate-commerce-sync.js** ✅ NEW
   - Validate that products synced from Commerce to ACO correctly

7. **scripts/trigger-sync.sh** ✅ NEW
   - Helper script to trigger SaaS Data Export sync

---

## Updated npm Scripts

**Add to buildright-aco/package.json**:

```json
{
  "scripts": {
    "commerce:create-products": "node scripts/create-products-commerce.js",
    "commerce:create-variants": "node scripts/create-variants-commerce.js",
    "commerce:create-bundles": "node scripts/create-bundles-commerce.js",
    "commerce:register-attributes": "node scripts/register-attributes-commerce.js",
    "commerce:create-customers": "node scripts/create-customers-commerce.js",
    "commerce:validate-sync": "node scripts/validate-commerce-sync.js",
    "commerce:all": "npm run commerce:register-attributes && npm run commerce:create-products && npm run commerce:create-variants && npm run commerce:create-bundles && npm run commerce:create-customers"
  }
}
```

---

## Timeline

**Week 1**:
- Day 1-2: Customer groups and attributes
- Day 3-5: Product creation scripts

**Week 2**:
- Day 1-3: Create all products in Commerce
- Day 4-5: Trigger sync and verify in ACO

**Week 3**:
- Day 1-2: Configure ACO price books and policies
- Day 3-4: Create demo customer accounts
- Day 5: End-to-end validation

---

## Key Differences from Original Plan

| Original Plan | Updated Plan |
|---------------|--------------|
| Ingest products directly to ACO | Create products in Adobe Commerce |
| Use ACO Data Ingestion API | Use Adobe Commerce REST API |
| Register attributes in ACO | Register attributes in Adobe Commerce |
| Manual sync not needed | Trigger SaaS Data Export sync |
| Single source (ACO) | Two sources (Commerce → ACO) |

---

## Benefits of Updated Approach

1. **Correct Architecture** ✅
   - Follows Adobe's recommended product flow
   - Adobe Commerce is source of truth
   - ACO is enhancement layer

2. **Automatic Sync** ✅
   - No manual data duplication
   - Attributes sync automatically
   - Prices sync automatically

3. **Easier Maintenance** ✅
   - Update products in Commerce UI
   - Changes automatically propagate to ACO
   - No custom sync scripts to maintain

4. **Better Demo** ✅
   - Shows complete Commerce + ACO integration
   - Demonstrates real-world workflow
   - More impressive to customers

5. **Production-Ready** ✅
   - Uses standard Adobe Commerce APIs
   - Follows best practices
   - Scalable to thousands of products

---

**Phase 8 Status**: Ready to implement (with updated scripts)  
**Next**: Create Commerce REST API scripts in buildright-aco repository

**Last Updated**: January 17, 2025

