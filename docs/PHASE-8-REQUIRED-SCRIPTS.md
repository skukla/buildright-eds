# Phase 8: Required Scripts for Adobe Commerce Integration

## Overview

This document outlines the scripts that need to be created in the `buildright-aco` repository to support Phase 8: Backend Setup. These scripts will create products in Adobe Commerce PaaS (which will then auto-sync to ACO).

**Repository**: `buildright-aco`  
**Location**: `buildright-aco/scripts/`

---

## Script Summary

| Script | Purpose | Priority |
|--------|---------|----------|
| `register-attributes-commerce.js` | Register custom attributes in Adobe Commerce | HIGH |
| `create-products-commerce.js` | Create simple products in Adobe Commerce | HIGH |
| `create-variants-commerce.js` | Create configurable products/variants | MEDIUM |
| `create-bundles-commerce.js` | Create bundle products | MEDIUM |
| `create-inventory-sources-commerce.js` | Create MSI sources and assign inventory | MEDIUM |
| `create-customers-commerce.js` | Create demo customer accounts | HIGH |
| `validate-commerce-sync.js` | Validate Commerce → ACO sync | HIGH |
| `trigger-sync.sh` | Helper to trigger SaaS Data Export | HIGH |

---

## 1. register-attributes-commerce.js

### Purpose
Register all 20 custom persona attributes in Adobe Commerce via REST API.

### Input
- Reads from: `buildright-aco/config/attribute-definitions.json` (needs to be created)

### Output
- 20 custom attributes registered in Adobe Commerce
- Attributes automatically available in ACO after sync

### Key Functions
```javascript
async function registerAttribute(attributeData, token) {
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/products/attributes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      attribute: {
        attribute_code: attributeData.code,
        frontend_label: attributeData.label,
        frontend_input: attributeData.input_type, // 'select', 'multiselect', 'boolean'
        is_searchable: true,
        is_filterable: true,
        is_visible_on_front: true,
        used_in_product_listing: true,
        options: attributeData.options?.map((opt, idx) => ({
          label: opt,
          value: idx,
          sort_order: idx
        }))
      }
    })
  });
  
  return await response.json();
}
```

### Attributes to Register
```javascript
const ATTRIBUTES = [
  {
    code: 'construction_phase',
    label: 'Construction Phase',
    input_type: 'select',
    options: ['foundation_framing', 'envelope', 'interior_finish', 'exterior_finish', 'final_touches']
  },
  {
    code: 'quality_tier',
    label: 'Quality Tier',
    input_type: 'select',
    options: ['builder_grade', 'professional', 'premium']
  },
  {
    code: 'package_tier',
    label: 'Package Tier',
    input_type: 'multiselect',
    options: ['good', 'better', 'best']
  },
  {
    code: 'room_category',
    label: 'Room Category',
    input_type: 'select',
    options: ['bathroom', 'kitchen', 'bedroom', 'living_room']
  },
  {
    code: 'deck_compatible',
    label: 'Deck Compatible',
    input_type: 'boolean'
  },
  {
    code: 'deck_shape',
    label: 'Deck Shape',
    input_type: 'multiselect',
    options: ['rectangular', 'l_shaped', 'wrap_around', 'multi_level']
  },
  {
    code: 'deck_material_type',
    label: 'Deck Material Type',
    input_type: 'select',
    options: ['wood', 'composite', 'pvc']
  },
  {
    code: 'deck_railing_compatible',
    label: 'Deck Railing Compatible',
    input_type: 'boolean'
  },
  {
    code: 'store_velocity_category',
    label: 'Store Velocity Category',
    input_type: 'select',
    options: ['high_volume', 'medium_volume', 'low_volume']
  },
  {
    code: 'restock_priority',
    label: 'Restock Priority',
    input_type: 'select',
    options: ['high', 'medium', 'low']
  }
  // ... 10 more attributes
];
```

### Usage
```bash
cd buildright-aco
export COMMERCE_API_URL="https://your-instance.adobe.io"
export COMMERCE_ADMIN_TOKEN="your-token"
node scripts/register-attributes-commerce.js
```

---

## 2. create-products-commerce.js

### Purpose
Create simple products in Adobe Commerce via REST API. Products will auto-sync to ACO.

### Input
- Reads from: `buildright-aco/data/buildright/products.json` (already exists)

### Output
- 70 simple products created in Adobe Commerce
- Products auto-sync to ACO via SaaS Data Export

### Key Functions
```javascript
function transformProduct(acoProduct) {
  return {
    product: {
      sku: acoProduct.sku,
      name: acoProduct.name,
      attribute_set_id: 4, // Default attribute set
      price: acoProduct.price || 0,
      status: 1, // Enabled
      visibility: 4, // Catalog, Search
      type_id: acoProduct.type || 'simple',
      weight: acoProduct.weight || 0,
      extension_attributes: {
        stock_item: {
          qty: 1000,
          is_in_stock: true
        },
        category_links: acoProduct.categoryIds?.map(catId => ({
          category_id: catId
        }))
      },
      custom_attributes: [
        {
          attribute_code: 'description',
          value: acoProduct.description || ''
        },
        // Transform ACO attributes to Commerce custom_attributes
        ...(acoProduct.attributes || []).map(attr => ({
          attribute_code: attr.code,
          value: Array.isArray(attr.value) ? attr.value.join(',') : attr.value
        }))
      ]
    }
  };
}

async function createProduct(product, token) {
  const commerceProduct = transformProduct(product);
  
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
```

### Usage
```bash
cd buildright-aco
node scripts/create-products-commerce.js

# Then trigger sync
bin/magento saas:resync --feed=products
```

---

## 3. create-variants-commerce.js

### Purpose
Create configurable products and their variants in Adobe Commerce.

### Input
- Reads from: `buildright-aco/data/buildright/variants.json` (already exists)

### Output
- 20 configurable products
- 72 variant products
- All linked correctly

### Key Differences from Simple Products
```javascript
// 1. Create configurable product
const configurableProduct = {
  product: {
    sku: 'WINDOW-DH-BASE',
    type_id: 'configurable',
    attribute_set_id: 4,
    name: 'Double-Hung Window',
    extension_attributes: {
      configurable_product_options: [
        {
          attribute_id: 123, // Size attribute
          label: 'Size',
          position: 0,
          values: [
            { value_index: 1 },
            { value_index: 2 },
            { value_index: 3 }
          ]
        }
      ],
      configurable_product_links: [456, 457, 458] // Variant product IDs
    }
  }
};

// 2. Create variant products (simple products)
const variant1 = {
  product: {
    sku: 'WINDOW-DH-2436',
    type_id: 'simple',
    name: 'Double-Hung Window 24x36',
    custom_attributes: [
      { attribute_code: 'size', value: '24x36' }
    ]
  }
};
```

### Usage
```bash
cd buildright-aco
node scripts/create-variants-commerce.js
bin/magento saas:resync --feed=products
```

---

## 4. create-bundles-commerce.js

### Purpose
Create bundle products in Adobe Commerce.

### Input
- Reads from: `buildright-aco/data/buildright/bundles.json` (already exists)

### Output
- 15 bundle products with all components linked

### Key Differences
```javascript
const bundleProduct = {
  product: {
    sku: 'DECK-KIT-BASIC-12X12',
    type_id: 'bundle',
    attribute_set_id: 4,
    name: 'Basic Deck Kit 12x12',
    extension_attributes: {
      bundle_product_options: [
        {
          title: 'Decking Boards',
          type: 'select',
          required: true,
          position: 1,
          sku: 'decking-boards',
          product_links: [
            {
              sku: 'DECK-COMP-6X16',
              qty: 50,
              position: 1,
              is_default: true,
              price: 0,
              price_type: 0 // Fixed
            }
          ]
        },
        {
          title: 'Fasteners',
          type: 'select',
          required: true,
          position: 2,
          sku: 'fasteners',
          product_links: [
            {
              sku: 'FAS-DECK-SS-100',
              qty: 2,
              position: 1,
              is_default: true,
              price: 0,
              price_type: 0
            }
          ]
        }
      ]
    }
  }
};
```

### Usage
```bash
cd buildright-aco
node scripts/create-bundles-commerce.js
bin/magento saas:resync --feed=products
```

---

## 5. create-inventory-sources-commerce.js

### Purpose
Create Multi-Source Inventory (MSI) sources and assign inventory quantities to products.

### Input
- Reads from: `buildright-aco/data/buildright/inventory.json` (if exists)
- Or uses hardcoded source definitions

### Output
- 3 inventory sources created in Adobe Commerce
- Inventory quantities assigned to all products
- Inventory syncs to ACO via SaaS Data Export

### Key Functions
```javascript
const INVENTORY_SOURCES = [
  {
    source_code: 'warehouse_west',
    name: 'West Coast Warehouse',
    enabled: true,
    description: 'Primary distribution center - West Coast',
    latitude: 37.7749,
    longitude: -122.4194,
    country_id: 'US',
    region_id: 12, // California
    city: 'San Francisco',
    street: '123 Warehouse Blvd',
    postcode: '94102',
    phone: '555-0100'
  },
  {
    source_code: 'warehouse_central',
    name: 'Central Warehouse',
    enabled: true,
    description: 'Central distribution hub',
    latitude: 41.8781,
    longitude: -87.6298,
    country_id: 'US',
    region_id: 14, // Illinois
    city: 'Chicago',
    street: '456 Distribution Way',
    postcode: '60601',
    phone: '555-0200'
  },
  {
    source_code: 'warehouse_east',
    name: 'East Coast Warehouse',
    enabled: true,
    description: 'East Coast distribution center',
    latitude: 40.7128,
    longitude: -74.0060,
    country_id: 'US',
    region_id: 43, // New York
    city: 'New York',
    street: '789 Logistics Ln',
    postcode: '10001',
    phone: '555-0300'
  }
];

async function createInventorySource(source, token) {
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/inventory/sources`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ source })
  });
  
  return await response.json();
}

async function assignInventoryToProduct(sku, sourceItems, token) {
  // sourceItems = [
  //   { source_code: 'warehouse_west', quantity: 500, status: 1 },
  //   { source_code: 'warehouse_central', quantity: 300, status: 1 },
  //   { source_code: 'warehouse_east', quantity: 200, status: 1 }
  // ]
  
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/inventory/source-items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sourceItems: sourceItems.map(item => ({
        sku,
        source_code: item.source_code,
        quantity: item.quantity,
        status: item.status
      }))
    })
  });
  
  return await response.json();
}

async function main() {
  console.log('=== Creating Multi-Source Inventory ===\n');
  
  // Get admin token
  const token = await getAdminToken();
  
  // 1. Create inventory sources
  console.log('Creating inventory sources...');
  for (const source of INVENTORY_SOURCES) {
    try {
      await createInventorySource(source, token);
      console.log(`✓ Created source: ${source.source_code}`);
    } catch (error) {
      console.error(`✗ Failed to create ${source.source_code}: ${error.message}`);
    }
  }
  
  // 2. Load products
  const products = JSON.parse(fs.readFileSync('data/buildright/products.json', 'utf-8'));
  
  // 3. Assign inventory to each product
  console.log('\nAssigning inventory to products...');
  for (const product of products) {
    try {
      // Distribute inventory across sources
      const sourceItems = [
        { source_code: 'warehouse_west', quantity: 500, status: 1 },
        { source_code: 'warehouse_central', quantity: 300, status: 1 },
        { source_code: 'warehouse_east', quantity: 200, status: 1 }
      ];
      
      await assignInventoryToProduct(product.sku, sourceItems, token);
      console.log(`✓ Assigned inventory: ${product.sku}`);
    } catch (error) {
      console.error(`✗ Failed to assign inventory for ${product.sku}: ${error.message}`);
    }
  }
  
  console.log('\n=== Summary ===');
  console.log('Sources created: 3');
  console.log(`Products with inventory: ${products.length}`);
  console.log('\nNext: Trigger sync to propagate to ACO');
}
```

### Usage
```bash
cd buildright-aco
node scripts/create-inventory-sources-commerce.js

# Then trigger sync
./scripts/trigger-sync.sh
```

### Expected Result
```
=== Creating Multi-Source Inventory ===

Creating inventory sources...
✓ Created source: warehouse_west
✓ Created source: warehouse_central
✓ Created source: warehouse_east

Assigning inventory to products...
✓ Assigned inventory: LBR-D0414F1E
✓ Assigned inventory: LBR-D0616F1E
...

=== Summary ===
Sources created: 3
Products with inventory: 177
```

---

## 6. create-customers-commerce.js

### Purpose
Create demo customer accounts with correct customer groups and attributes.

### Input
- Hardcoded persona data (from persona-config.js)

### Output
- 5 demo customer accounts in Adobe Commerce

### Implementation
```javascript
const CUSTOMERS = [
  {
    email: 'sarah.martinez@sunbelthomes.com',
    firstname: 'Sarah',
    lastname: 'Martinez',
    group_id: 4, // Production-Builder group ID
    custom_attributes: [
      { attribute_code: 'business_type', value: 'production_builder' },
      { attribute_code: 'project_scale', value: 'large' },
      { attribute_code: 'primary_service', value: 'new_construction' }
    ]
  },
  // ... 4 more customers
];

async function createCustomer(customer, token) {
  const response = await fetch(`${COMMERCE_API_URL}/rest/V1/customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ customer })
  });
  
  return await response.json();
}
```

### Usage
```bash
cd buildright-aco
node scripts/create-customers-commerce.js
```

---

## 6. validate-commerce-sync.js

### Purpose
Validate that products created in Commerce have successfully synced to ACO.

### Checks
1. Product count matches (Commerce vs ACO)
2. All SKUs present in both systems
3. All custom attributes synced
4. Prices synced correctly
5. Categories synced

### Implementation
```javascript
async function validateSync() {
  console.log('=== Validating Commerce → ACO Sync ===\n');
  
  // 1. Get products from Commerce
  const commerceProducts = await getCommerceProducts();
  console.log(`Commerce: ${commerceProducts.length} products`);
  
  // 2. Get products from ACO
  const acoProducts = await getACOProducts();
  console.log(`ACO: ${acoProducts.length} products`);
  
  // 3. Compare counts
  if (commerceProducts.length !== acoProducts.length) {
    console.error('❌ Product count mismatch!');
  } else {
    console.log('✓ Product counts match');
  }
  
  // 4. Check each SKU
  const commerceSkus = new Set(commerceProducts.map(p => p.sku));
  const acoSkus = new Set(acoProducts.map(p => p.sku));
  
  const missing = [...commerceSkus].filter(sku => !acoSkus.has(sku));
  if (missing.length > 0) {
    console.error(`❌ Missing in ACO: ${missing.join(', ')}`);
  } else {
    console.log('✓ All SKUs present in ACO');
  }
  
  // 5. Validate attributes for sample products
  const sampleSkus = ['LBR-D0414F1E', 'WINDOW-DH-2436', 'DECK-KIT-BASIC-12X12'];
  
  for (const sku of sampleSkus) {
    const commerceProduct = commerceProducts.find(p => p.sku === sku);
    const acoProduct = acoProducts.find(p => p.sku === sku);
    
    if (!commerceProduct || !acoProduct) continue;
    
    // Check attributes
    const commerceAttrs = commerceProduct.custom_attributes || [];
    const acoAttrs = acoProduct.attributes || {};
    
    const attrMismatches = [];
    for (const attr of commerceAttrs) {
      if (acoAttrs[attr.attribute_code] !== attr.value) {
        attrMismatches.push(attr.attribute_code);
      }
    }
    
    if (attrMismatches.length > 0) {
      console.error(`❌ ${sku}: Attribute mismatch: ${attrMismatches.join(', ')}`);
    } else {
      console.log(`✓ ${sku}: All attributes synced`);
    }
  }
}
```

### Usage
```bash
cd buildright-aco
node scripts/validate-commerce-sync.js
```

---

## 7. trigger-sync.sh

### Purpose
Helper script to trigger SaaS Data Export sync from Commerce to ACO.

### Implementation
```bash
#!/bin/bash

# trigger-sync.sh
# Trigger SaaS Data Export sync

echo "=== Triggering SaaS Data Export Sync ==="
echo ""

# Trigger product sync
echo "Syncing products..."
bin/magento saas:resync --feed=products

# Trigger attribute sync
echo "Syncing attributes..."
bin/magento saas:resync --feed=productAttributes

# Trigger price sync
echo "Syncing prices..."
bin/magento saas:resync --feed=prices

# Trigger category sync
echo "Syncing categories..."
bin/magento saas:resync --feed=categories

# Check status
echo ""
echo "=== Sync Status ==="
bin/magento saas:status

echo ""
echo "✓ Sync triggered successfully"
echo ""
echo "Next steps:"
echo "1. Wait 2-5 minutes for sync to complete"
echo "2. Run: node scripts/validate-commerce-sync.js"
echo "3. Verify in ACO Admin UI"
```

### Usage
```bash
cd buildright-aco
chmod +x scripts/trigger-sync.sh
./scripts/trigger-sync.sh
```

---

## Updated npm Scripts

Add to `buildright-aco/package.json`:

```json
{
  "scripts": {
    "commerce:register-attributes": "node scripts/register-attributes-commerce.js",
    "commerce:create-products": "node scripts/create-products-commerce.js",
    "commerce:create-variants": "node scripts/create-variants-commerce.js",
    "commerce:create-bundles": "node scripts/create-bundles-commerce.js",
    "commerce:create-inventory": "node scripts/create-inventory-sources-commerce.js",
    "commerce:create-customers": "node scripts/create-customers-commerce.js",
    "commerce:validate-sync": "node scripts/validate-commerce-sync.js",
    "commerce:all": "npm run commerce:register-attributes && npm run commerce:create-products && npm run commerce:create-variants && npm run commerce:create-bundles && npm run commerce:create-inventory && npm run commerce:create-customers",
    "commerce:full-setup": "npm run commerce:all && echo 'Now run: ./scripts/trigger-sync.sh'"
  }
}
```

---

## Complete Setup Flow

```bash
# 1. Register attributes
npm run commerce:register-attributes

# 2. Create all products
npm run commerce:create-products
npm run commerce:create-variants
npm run commerce:create-bundles

# 3. Create inventory sources (MSI)
npm run commerce:create-inventory

# 4. Create customers
npm run commerce:create-customers

# 5. Trigger sync
./scripts/trigger-sync.sh

# 6. Wait 2-5 minutes

# 7. Validate sync
npm run commerce:validate-sync

# 8. Verify in ACO Admin UI
# - Check products
# - Check attributes
# - Check prices
# - Check inventory sources

# 9. Configure ACO enhancements
# - Create price books (npm run ingest:price-books)
# - Ingest prices (npm run ingest:prices)
# - Configure policies (manual in ACO Admin UI)
# - Set up catalog views (manual in ACO Admin UI)
```

---

## Environment Variables Required

Add to `buildright-aco/.env`:

```bash
# Adobe Commerce PaaS
COMMERCE_API_URL=https://your-instance.adobe.io
COMMERCE_ADMIN_USERNAME=admin
COMMERCE_ADMIN_PASSWORD=your-password
# OR
COMMERCE_ADMIN_TOKEN=your-token

# Adobe Commerce Optimizer (for validation)
ACO_API_URL=https://commerce-optimizer.adobe.io
ACO_TENANT_ID=your-tenant-id
ACO_API_KEY=your-api-key
ACO_ADMIN_TOKEN=your-admin-token

# Configuration
ATTRIBUTE_SET_ID=4
DEFAULT_INVENTORY_QTY=1000
```

---

## Success Criteria

- [ ] All 8 scripts created and tested
- [ ] 20 custom attributes registered in Commerce
- [ ] 70 simple products created in Commerce
- [ ] 92 variant products created in Commerce
- [ ] 15 bundle products created in Commerce
- [ ] 3 inventory sources created in Commerce (MSI)
- [ ] Inventory assigned to all 177 products
- [ ] 5 demo customers created in Commerce
- [ ] All products synced to ACO
- [ ] All attributes synced to ACO
- [ ] All inventory synced to ACO
- [ ] Validation script passes all checks
- [ ] Products visible in ACO Admin UI
- [ ] Attributes filterable in ACO GraphQL
- [ ] Inventory sources visible in ACO

---

**Status**: Ready to implement  
**Repository**: `buildright-aco`  
**Priority**: HIGH (required for Phase 8)

**Last Updated**: November 17, 2025

