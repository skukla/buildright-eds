# Product Record Creation: How Adobe Commerce and ACO Work Together

## Executive Summary

This document provides a detailed, step-by-step explanation of how product records are created across Adobe Commerce PaaS and Adobe Commerce Optimizer (ACO), and how they work together to deliver the persona-driven BuildRight experience.

**Key Insight**: A "product" exists as **separate but linked records** in two systems:
1. **Adobe Commerce PaaS**: The master product record (source of truth)
2. **ACO**: A synchronized copy + ACO-specific enhancements

---

## The Two Product Records

### Record 1: Product in Adobe Commerce PaaS (Master)

**Database**: Adobe Commerce MySQL database

**Table**: `catalog_product_entity` (and related EAV tables)

**Example Record**:
```sql
-- Main product table
catalog_product_entity
├─ entity_id: 12345
├─ sku: "LBR-D0414F1E"
├─ type_id: "simple"
├─ created_at: "2024-11-16 10:00:00"
└─ updated_at: "2024-11-16 10:00:00"

-- EAV attributes (varchar)
catalog_product_entity_varchar
├─ entity_id: 12345
├─ attribute_id: 71 (name)
└─ value: "2x4x8 Douglas Fir Framing Lumber"

-- EAV attributes (decimal)
catalog_product_entity_decimal
├─ entity_id: 12345
├─ attribute_id: 75 (price)
└─ value: 10.00

-- Custom attributes (varchar)
catalog_product_entity_varchar
├─ entity_id: 12345
├─ attribute_id: 201 (construction_phase)
└─ value: "foundation_framing"

catalog_product_entity_varchar
├─ entity_id: 12345
├─ attribute_id: 202 (quality_tier)
└─ value: "professional"
```

**What This Record Contains**:
- ✅ SKU (unique identifier)
- ✅ Product name, description
- ✅ Product type (simple, configurable, bundle)
- ✅ Base price
- ✅ Weight, dimensions
- ✅ Images
- ✅ Categories
- ✅ Status (enabled/disabled)
- ✅ Visibility
- ✅ **ALL custom attributes** (construction_phase, quality_tier, etc.)
- ✅ Inventory quantity
- ✅ Stock status

**Managed Via**:
- Adobe Commerce Admin UI
- Adobe Commerce REST API
- Adobe Commerce GraphQL API

---

### Record 2: Product in ACO (Synchronized Copy + Enhancements)

**Database**: ACO SaaS database (Adobe-managed)

**Storage**: Document-based (likely MongoDB or similar)

**Example Record**:
```json
{
  "_id": "aco_product_abc123",
  "sku": "LBR-D0414F1E",
  "sourceSystem": "adobe_commerce",
  "sourceId": "12345",
  "syncedAt": "2024-11-16T10:05:00Z",
  
  "basicInfo": {
    "name": "2x4x8 Douglas Fir Framing Lumber",
    "description": "Premium grade Douglas Fir lumber...",
    "type": "simple",
    "status": "active"
  },
  
  "pricing": {
    "basePrice": 10.00,
    "currency": "USD"
  },
  
  "attributes": {
    "construction_phase": "foundation_framing",
    "quality_tier": "professional",
    "category": "structural_lumber",
    "weight": 8.5,
    "manufacturer": "Pacific Lumber"
  },
  
  "images": [
    {
      "url": "https://cdn.example.com/lumber.jpg",
      "role": "main"
    }
  ],
  
  "categories": ["lumber", "framing", "douglas-fir"],
  
  "acoEnhancements": {
    "catalogViews": [
      "US-Production-Builder",
      "US-General-Contractor"
    ],
    "policyEligibility": {
      "foundation_framing_policy": true,
      "professional_quality_policy": true
    },
    "priceBooks": {
      "US-Retail": {
        "price": 10.00,
        "currency": "USD"
      },
      "Production-Builder": {
        "price": 8.50,
        "currency": "USD",
        "discount": 0.15
      },
      "Trade-Professional": {
        "price": 9.00,
        "currency": "USD",
        "discount": 0.10
      }
    }
  }
}
```

**What This Record Contains**:
- ✅ **Synced data** from Adobe Commerce (read-only)
  - SKU, name, description, price
  - All custom attributes
  - Images, categories
- ✅ **ACO enhancements** (configured in ACO)
  - Catalog View assignments
  - Policy eligibility
  - Price Book entries

**Managed Via**:
- ACO Admin UI (for enhancements)
- ACO GraphQL API (for querying)
- **NOT directly editable** (synced data is read-only)

---

## Step-by-Step: Creating a Product Record

### Phase 1: Create Product in Adobe Commerce

#### Step 1.1: Define Product Attributes (One-Time Setup)

**Action**: Create custom attributes in Adobe Commerce

**Location**: Adobe Commerce Admin → Stores → Attributes → Product

**Example**: Create `construction_phase` attribute

```
Attribute Properties:
├─ Attribute Code: construction_phase
├─ Catalog Input Type: Dropdown
├─ Values:
│   ├─ foundation_framing
│   ├─ rough_framing
│   ├─ exterior_finishing
│   ├─ interior_finishing
│   └─ final_finishing
├─ Scope: Global
├─ Use in Search: Yes
├─ Use in Layered Navigation: Filterable (with results)
└─ Used for Sorting in Product Listing: No
```

**Database Impact**:
```sql
-- Attribute definition
INSERT INTO eav_attribute (
  attribute_code,
  frontend_label,
  frontend_input,
  is_searchable,
  is_filterable
) VALUES (
  'construction_phase',
  'Construction Phase',
  'select',
  1,
  1
);

-- Attribute options
INSERT INTO eav_attribute_option_value (
  option_id,
  value
) VALUES
  (1, 'foundation_framing'),
  (2, 'rough_framing'),
  (3, 'exterior_finishing'),
  (4, 'interior_finishing'),
  (5, 'final_finishing');
```

**Repeat for all custom attributes**:
- construction_phase
- quality_tier
- package_tier
- room_category
- deck_compatible
- deck_shape
- deck_material_type
- store_velocity_category
- restock_priority

---

#### Step 1.2: Create Product Record

**Action**: Create product in Adobe Commerce

**Method A: Admin UI**

1. Navigate to Catalog → Products
2. Click "Add Product"
3. Fill in product details:
   - SKU: `LBR-D0414F1E`
   - Product Name: `2x4x8 Douglas Fir Framing Lumber`
   - Price: `10.00`
   - Quantity: `1000`
4. Set custom attributes:
   - Construction Phase: `foundation_framing`
   - Quality Tier: `professional`
5. Assign categories: Lumber → Framing → Douglas Fir
6. Upload images
7. Click "Save"

**Method B: REST API**

```bash
curl -X POST "https://your-commerce-instance.adobe.io/rest/V1/products" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "sku": "LBR-D0414F1E",
      "name": "2x4x8 Douglas Fir Framing Lumber",
      "attribute_set_id": 4,
      "price": 10.00,
      "status": 1,
      "visibility": 4,
      "type_id": "simple",
      "weight": 8.5,
      "extension_attributes": {
        "stock_item": {
          "qty": 1000,
          "is_in_stock": true
        }
      },
      "custom_attributes": [
        {
          "attribute_code": "construction_phase",
          "value": "foundation_framing"
        },
        {
          "attribute_code": "quality_tier",
          "value": "professional"
        },
        {
          "attribute_code": "description",
          "value": "Premium grade Douglas Fir lumber for framing applications"
        }
      ]
    }
  }'
```

**Database Impact**:
```sql
-- Main product record
INSERT INTO catalog_product_entity (
  sku,
  type_id,
  created_at,
  updated_at
) VALUES (
  'LBR-D0414F1E',
  'simple',
  NOW(),
  NOW()
);
-- Returns entity_id: 12345

-- Product name
INSERT INTO catalog_product_entity_varchar (
  entity_id,
  attribute_id,
  value
) VALUES (
  12345,
  71, -- name attribute
  '2x4x8 Douglas Fir Framing Lumber'
);

-- Product price
INSERT INTO catalog_product_entity_decimal (
  entity_id,
  attribute_id,
  value
) VALUES (
  12345,
  75, -- price attribute
  10.00
);

-- Custom attribute: construction_phase
INSERT INTO catalog_product_entity_varchar (
  entity_id,
  attribute_id,
  value
) VALUES (
  12345,
  201, -- construction_phase attribute
  'foundation_framing'
);

-- Custom attribute: quality_tier
INSERT INTO catalog_product_entity_varchar (
  entity_id,
  attribute_id,
  value
) VALUES (
  12345,
  202, -- quality_tier attribute
  'professional'
);

-- Inventory
INSERT INTO cataloginventory_stock_item (
  product_id,
  stock_id,
  qty,
  is_in_stock
) VALUES (
  12345,
  1,
  1000,
  1
);
```

**Result**: Product record exists in Adobe Commerce ✅

---

### Phase 2: Prepare for Sync (Indexing)

#### Step 2.1: Product Save Triggers Indexer

**What Happens**: When you save a product, Adobe Commerce triggers indexers

**Indexers Triggered**:
```bash
catalog_product_attribute
catalog_product_price
cataloginventory_stock
catalog_category_product
cde_products_feed          # ← SaaS Data Export feed
cde_product_attributes_feed # ← SaaS Data Export feed
```

**Focus on**: `cde_products_feed` indexer

---

#### Step 2.2: Indexer Processes Product Data

**Action**: Indexer transforms product data into feed format

**Process**:
```php
// Simplified indexer logic
class ProductFeedIndexer
{
    public function execute($productId)
    {
        // 1. Load product from Adobe Commerce
        $product = $this->productRepository->getById($productId);
        
        // 2. Transform to feed format
        $feedData = [
            'sku' => $product->getSku(),
            'name' => $product->getName(),
            'price' => $product->getPrice(),
            'type' => $product->getTypeId(),
            'status' => $product->getStatus(),
            'visibility' => $product->getVisibility(),
            'attributes' => [],
            'categories' => [],
            'images' => []
        ];
        
        // 3. Add all custom attributes
        foreach ($product->getCustomAttributes() as $attribute) {
            $feedData['attributes'][$attribute->getAttributeCode()] = 
                $attribute->getValue();
        }
        
        // 4. Add categories
        $feedData['categories'] = $product->getCategoryIds();
        
        // 5. Add images
        foreach ($product->getMediaGalleryImages() as $image) {
            $feedData['images'][] = [
                'url' => $image->getUrl(),
                'role' => $image->getRole()
            ];
        }
        
        // 6. Store in feed table
        $this->feedTable->insert([
            'feed_data' => json_encode($feedData),
            'product_id' => $productId,
            'store_view_code' => 'default',
            'modified_at' => time()
        ]);
    }
}
```

**Database Impact**:
```sql
-- Feed table entry
INSERT INTO cde_products_feed (
  feed_id,
  product_id,
  store_view_code,
  feed_data,
  modified_at,
  is_deleted
) VALUES (
  UUID(),
  12345,
  'default',
  '{
    "sku": "LBR-D0414F1E",
    "name": "2x4x8 Douglas Fir Framing Lumber",
    "price": 10.00,
    "type": "simple",
    "status": 1,
    "visibility": 4,
    "attributes": {
      "construction_phase": "foundation_framing",
      "quality_tier": "professional",
      "weight": 8.5,
      "manufacturer": "Pacific Lumber"
    },
    "categories": [123, 456, 789],
    "images": [
      {
        "url": "https://cdn.example.com/lumber.jpg",
        "role": "main"
      }
    ]
  }',
  UNIX_TIMESTAMP(),
  0
);
```

**Result**: Product data is staged in feed table ✅

---

### Phase 3: Export to ACO (SaaS Data Export)

#### Step 3.1: Cron Job Runs

**Trigger**: Cron schedule (every 5-15 minutes, configurable)

**Cron Group**: `saas_data_exporter`

**Command**:
```bash
bin/magento cron:run --group=saas_data_exporter
```

**What It Does**:
1. Checks for new/updated records in feed tables
2. Batches records for export
3. Sends to Adobe Commerce SaaS API

---

#### Step 3.2: Data Exporter Processes Feed

**Process**:
```php
// Simplified exporter logic
class SaasDataExporter
{
    public function export()
    {
        // 1. Get unsynced products from feed table
        $products = $this->feedTable->getUnsynced('cde_products_feed');
        
        // 2. Batch products (100 at a time)
        $batches = array_chunk($products, 100);
        
        foreach ($batches as $batch) {
            // 3. Prepare payload
            $payload = [
                'feed' => 'products',
                'data' => []
            ];
            
            foreach ($batch as $product) {
                $payload['data'][] = json_decode($product['feed_data'], true);
            }
            
            // 4. Send to SaaS API
            $response = $this->httpClient->post(
                'https://commerce-data-export.adobe.io/v1/feed',
                [
                    'headers' => [
                        'x-api-key' => $this->config->getApiKey(),
                        'x-gw-ims-org-id' => $this->config->getOrgId(),
                        'Authorization' => 'Bearer ' . $this->getToken()
                    ],
                    'json' => $payload
                ]
            );
            
            // 5. Mark as synced
            if ($response->getStatusCode() === 200) {
                foreach ($batch as $product) {
                    $this->feedTable->markSynced($product['feed_id']);
                }
            }
        }
    }
}
```

**HTTP Request**:
```http
POST https://commerce-data-export.adobe.io/v1/feed
Content-Type: application/json
x-api-key: YOUR_API_KEY
x-gw-ims-org-id: YOUR_ORG_ID
Authorization: Bearer YOUR_TOKEN

{
  "feed": "products",
  "environmentId": "your-environment-id",
  "websiteCode": "base",
  "storeViewCode": "default",
  "data": [
    {
      "sku": "LBR-D0414F1E",
      "name": "2x4x8 Douglas Fir Framing Lumber",
      "price": 10.00,
      "type": "simple",
      "status": 1,
      "visibility": 4,
      "attributes": {
        "construction_phase": "foundation_framing",
        "quality_tier": "professional",
        "weight": 8.5,
        "manufacturer": "Pacific Lumber"
      },
      "categories": [123, 456, 789],
      "images": [
        {
          "url": "https://cdn.example.com/lumber.jpg",
          "role": "main"
        }
      ]
    }
  ]
}
```

**Database Impact** (Adobe Commerce):
```sql
-- Mark as synced in feed table
UPDATE cde_products_feed
SET 
  is_sent = 1,
  sent_at = UNIX_TIMESTAMP()
WHERE feed_id = 'abc-123-def-456';
```

**Result**: Product data sent to ACO ✅

---

#### Step 3.3: ACO Receives and Stores Product

**Action**: ACO SaaS API receives product data and stores it

**Process** (ACO side):
```javascript
// Simplified ACO ingestion logic
class ACOProductIngestion {
  async ingestProduct(productData) {
    // 1. Validate product data
    this.validateProduct(productData);
    
    // 2. Check if product exists
    const existingProduct = await this.db.products.findOne({
      sku: productData.sku,
      sourceSystem: 'adobe_commerce'
    });
    
    if (existingProduct) {
      // 3a. Update existing product
      await this.db.products.updateOne(
        { _id: existingProduct._id },
        {
          $set: {
            'basicInfo': {
              name: productData.name,
              description: productData.description,
              type: productData.type,
              status: productData.status === 1 ? 'active' : 'inactive'
            },
            'pricing.basePrice': productData.price,
            'attributes': productData.attributes,
            'images': productData.images,
            'categories': productData.categories,
            'syncedAt': new Date()
          }
        }
      );
    } else {
      // 3b. Create new product
      await this.db.products.insertOne({
        sku: productData.sku,
        sourceSystem: 'adobe_commerce',
        sourceId: productData.entityId,
        basicInfo: {
          name: productData.name,
          description: productData.description,
          type: productData.type,
          status: productData.status === 1 ? 'active' : 'inactive'
        },
        pricing: {
          basePrice: productData.price,
          currency: 'USD'
        },
        attributes: productData.attributes,
        images: productData.images,
        categories: productData.categories,
        acoEnhancements: {
          catalogViews: [],
          policyEligibility: {},
          priceBooks: {}
        },
        createdAt: new Date(),
        syncedAt: new Date()
      });
    }
    
    // 4. Index for search
    await this.searchIndex.indexProduct(productData.sku);
    
    // 5. Trigger policy evaluation
    await this.policyEngine.evaluateProduct(productData.sku);
  }
}
```

**Database Impact** (ACO):
```javascript
// MongoDB-style document
db.products.insertOne({
  _id: ObjectId("aco_product_abc123"),
  sku: "LBR-D0414F1E",
  sourceSystem: "adobe_commerce",
  sourceId: "12345",
  
  basicInfo: {
    name: "2x4x8 Douglas Fir Framing Lumber",
    description: "Premium grade Douglas Fir lumber...",
    type: "simple",
    status: "active"
  },
  
  pricing: {
    basePrice: 10.00,
    currency: "USD"
  },
  
  attributes: {
    construction_phase: "foundation_framing",
    quality_tier: "professional",
    weight: 8.5,
    manufacturer: "Pacific Lumber"
  },
  
  images: [
    {
      url: "https://cdn.example.com/lumber.jpg",
      role: "main"
    }
  ],
  
  categories: [123, 456, 789],
  
  acoEnhancements: {
    catalogViews: [],
    policyEligibility: {},
    priceBooks: {}
  },
  
  createdAt: ISODate("2024-11-16T10:05:00Z"),
  syncedAt: ISODate("2024-11-16T10:05:00Z")
});
```

**Result**: Product record exists in ACO ✅

---

### Phase 4: Configure ACO Enhancements

#### Step 4.1: Assign to Catalog Views

**Action**: Configure which Catalog Views this product appears in

**Location**: ACO Admin UI → Catalog Views

**Process**:
1. Open Catalog View: "US-Production-Builder"
2. Define filter rules:
   ```
   Include products where:
   - construction_phase IN ['foundation_framing', 'rough_framing']
   OR
   - quality_tier = 'professional'
   ```
3. Save Catalog View

**Database Impact** (ACO):
```javascript
// Update product with catalog view assignments
db.products.updateOne(
  { sku: "LBR-D0414F1E" },
  {
    $set: {
      "acoEnhancements.catalogViews": [
        "US-Production-Builder",
        "US-General-Contractor"
      ]
    }
  }
);

// Store catalog view definition
db.catalogViews.insertOne({
  _id: "US-Production-Builder",
  name: "US Production Builder View",
  filters: {
    $or: [
      { "attributes.construction_phase": { $in: ["foundation_framing", "rough_framing"] } },
      { "attributes.quality_tier": "professional" }
    ]
  },
  priceBookId: "Production-Builder"
});
```

**Result**: Product assigned to Catalog Views ✅

---

#### Step 4.2: Configure Policies

**Action**: Define policies that filter this product

**Location**: ACO Admin UI → Policies

**Process**:
1. Create Policy: "Foundation & Framing Phase"
2. Set trigger: `AC-Policy-Phase: foundation_framing`
3. Define filter: `construction_phase = 'foundation_framing'`
4. Save Policy

**Database Impact** (ACO):
```javascript
// Store policy definition
db.policies.insertOne({
  _id: "foundation_framing_policy",
  name: "Foundation & Framing Phase",
  triggerHeader: "AC-Policy-Phase",
  triggerValue: "foundation_framing",
  filter: {
    "attributes.construction_phase": "foundation_framing"
  },
  active: true
});

// Update product with policy eligibility
db.products.updateOne(
  { sku: "LBR-D0414F1E" },
  {
    $set: {
      "acoEnhancements.policyEligibility.foundation_framing_policy": true
    }
  }
);
```

**Result**: Product linked to policies ✅

---

#### Step 4.3: Configure Price Books

**Action**: Define pricing for different customer segments

**Location**: ACO Admin UI → Price Books

**Process**:
1. Create Price Book: "Production-Builder"
2. Set base price book: "US-Retail"
3. Set discount: 15%
4. Apply to products

**Database Impact** (ACO):
```javascript
// Store price book definition
db.priceBooks.insertOne({
  _id: "Production-Builder",
  name: "Production Builder Pricing",
  parentPriceBook: "US-Retail",
  discount: 0.15,
  currency: "USD"
});

// Update product with price book entries
db.products.updateOne(
  { sku: "LBR-D0414F1E" },
  {
    $set: {
      "acoEnhancements.priceBooks": {
        "US-Retail": {
          price: 10.00,
          currency: "USD"
        },
        "Production-Builder": {
          price: 8.50,
          currency: "USD",
          discount: 0.15
        },
        "Trade-Professional": {
          price: 9.00,
          currency: "USD",
          discount: 0.10
        },
        "Wholesale-Reseller": {
          price: 7.50,
          currency: "USD",
          discount: 0.25
        }
      }
    }
  }
);
```

**Result**: Product has persona-based pricing ✅

---

## Phase 5: Query Product (Runtime)

### Step 5.1: User Logs In (Adobe Commerce)

**Action**: Sarah Martinez logs into the storefront

**Flow**:
```
User enters credentials
  ↓
Edge Delivery Services (EDS)
  ↓
Adobe Commerce Auth Dropin
  ↓
API Mesh → Adobe Commerce GraphQL
  ↓
Adobe Commerce authenticates
  ↓
Returns customer data
```

**GraphQL Query** (API Mesh → Adobe Commerce):
```graphql
query GetCustomer {
  customer {
    id
    email
    firstname
    lastname
    group_id
    custom_attributes {
      attribute_code
      value
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "customer": {
      "id": 456,
      "email": "sarah.martinez@sunbelthomes.com",
      "firstname": "Sarah",
      "lastname": "Martinez",
      "group_id": "Production-Builder",
      "custom_attributes": [
        {
          "attribute_code": "construction_phase",
          "value": "foundation_framing"
        },
        {
          "attribute_code": "business_type",
          "value": "production_builder"
        },
        {
          "attribute_code": "project_scale",
          "value": "high_volume"
        }
      ]
    }
  }
}
```

**Result**: API Mesh has customer context ✅

---

### Step 5.2: API Mesh Maps Customer to Catalog

**Action**: API Mesh resolver maps customer data to ACO query parameters

**Resolver Logic**:
```javascript
// API Mesh custom resolver
export default {
  Query: {
    personaProducts: async (parent, args, context) => {
      // 1. Get customer from Adobe Commerce
      const customer = await context.AdobeCommerce.Query.customer();
      
      // 2. Map customer group to price book
      const priceBookId = customer.group_id; // "Production-Builder"
      
      // 3. Build policy headers from customer attributes
      const policyHeaders = {};
      
      customer.custom_attributes.forEach(attr => {
        if (attr.attribute_code === 'construction_phase') {
          policyHeaders['AC-Policy-Phase'] = attr.value;
        }
        if (attr.attribute_code === 'quality_tier') {
          policyHeaders['AC-Policy-Quality'] = attr.value;
        }
      });
      
      // 4. Query ACO with context
      const products = await context.ACO.Query.products(
        {
          ...args,
          priceBookId
        },
        {
          headers: policyHeaders
        }
      );
      
      return products;
    }
  }
};
```

**Result**: Query parameters prepared ✅

---

### Step 5.3: Query ACO with Context

**Action**: API Mesh queries ACO GraphQL API

**GraphQL Query** (API Mesh → ACO):
```graphql
query GetPersonaProducts($priceBookId: String!) {
  products(priceBookId: $priceBookId, first: 20) {
    edges {
      node {
        sku
        name
        description
        price(priceBookId: $priceBookId) {
          value
          currency
        }
        attributes {
          construction_phase
          quality_tier
        }
        images {
          url
          role
        }
      }
    }
  }
}
```

**Variables**:
```json
{
  "priceBookId": "Production-Builder"
}
```

**Headers**:
```http
AC-Policy-Phase: foundation_framing
AC-Policy-Quality: professional
```

**ACO Processing**:
```javascript
// ACO query handler
class ProductQueryHandler {
  async getProducts(args, headers) {
    // 1. Build base query
    let query = { status: 'active' };
    
    // 2. Apply policy filters from headers
    if (headers['AC-Policy-Phase']) {
      query['attributes.construction_phase'] = headers['AC-Policy-Phase'];
    }
    
    if (headers['AC-Policy-Quality']) {
      query['attributes.quality_tier'] = headers['AC-Policy-Quality'];
    }
    
    // 3. Query products
    const products = await this.db.products.find(query).toArray();
    
    // 4. Apply price book
    const priceBookId = args.priceBookId || 'US-Retail';
    
    products.forEach(product => {
      product.price = product.acoEnhancements.priceBooks[priceBookId];
    });
    
    return products;
  }
}
```

**Database Query** (ACO):
```javascript
db.products.find({
  status: 'active',
  'attributes.construction_phase': 'foundation_framing'
}).toArray()
```

**Response**:
```json
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
            "sku": "LBR-D0414F1E",
            "name": "2x4x8 Douglas Fir Framing Lumber",
            "description": "Premium grade Douglas Fir lumber...",
            "price": {
              "value": 8.50,
              "currency": "USD"
            },
            "attributes": {
              "construction_phase": "foundation_framing",
              "quality_tier": "professional"
            },
            "images": [
              {
                "url": "https://cdn.example.com/lumber.jpg",
                "role": "main"
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Result**: Filtered, priced products returned ✅

---

### Step 5.4: API Mesh Returns Unified Response

**Action**: API Mesh enhances ACO response with additional context

**Resolver Logic**:
```javascript
// API Mesh response enhancement
const enhancedProducts = acoProducts.map(product => ({
  ...product,
  customerGroup: customer.group_id,
  retailPrice: product.acoEnhancements.priceBooks['US-Retail'].price,
  customerPrice: product.price.value,
  savings: product.acoEnhancements.priceBooks['US-Retail'].price - product.price.value,
  savingsPercent: (
    (product.acoEnhancements.priceBooks['US-Retail'].price - product.price.value) /
    product.acoEnhancements.priceBooks['US-Retail'].price
  ) * 100
}));
```

**Response to EDS**:
```json
{
  "data": {
    "personaProducts": [
      {
        "sku": "LBR-D0414F1E",
        "name": "2x4x8 Douglas Fir Framing Lumber",
        "description": "Premium grade Douglas Fir lumber...",
        "price": 8.50,
        "currency": "USD",
        "customerGroup": "Production-Builder",
        "retailPrice": 10.00,
        "savings": 1.50,
        "savingsPercent": 15,
        "attributes": {
          "construction_phase": "foundation_framing",
          "quality_tier": "professional"
        },
        "images": [
          {
            "url": "https://cdn.example.com/lumber.jpg",
            "role": "main"
          }
        ]
      }
    ]
  }
}
```

**Result**: Persona-specific product data delivered to storefront ✅

---

## Summary: The Complete Flow

### Product Creation Flow

```
1. CREATE PRODUCT (Adobe Commerce)
   ├─ Admin UI or REST API
   ├─ Set product data + custom attributes
   └─ Save to database
          ↓
2. INDEX PRODUCT (Adobe Commerce)
   ├─ Indexer processes product
   ├─ Transforms to feed format
   └─ Stores in cde_products_feed table
          ↓
3. EXPORT TO ACO (SaaS Data Export)
   ├─ Cron runs every 5-15 minutes
   ├─ Reads from feed table
   ├─ Sends to ACO SaaS API
   └─ Marks as synced
          ↓
4. STORE IN ACO (ACO)
   ├─ Receives product data
   ├─ Creates/updates product record
   └─ Indexes for search
          ↓
5. CONFIGURE ENHANCEMENTS (ACO Admin UI)
   ├─ Assign to Catalog Views
   ├─ Link to Policies
   └─ Set up Price Books
```

### Product Query Flow

```
1. USER LOGS IN (Adobe Commerce)
   ├─ EDS → API Mesh → Adobe Commerce
   ├─ Returns customer data
   └─ Customer group + custom attributes
          ↓
2. MAP CUSTOMER TO CATALOG (API Mesh)
   ├─ Customer group → Price book ID
   └─ Custom attributes → Policy headers
          ↓
3. QUERY ACO (ACO)
   ├─ Apply policy filters
   ├─ Apply price book
   └─ Return filtered products
          ↓
4. ENHANCE RESPONSE (API Mesh)
   ├─ Add savings calculation
   ├─ Add customer context
   └─ Return unified data
          ↓
5. DISPLAY TO USER (EDS)
   └─ Persona-specific experience
```

---

## Key Takeaways

1. **Two Separate Records** ✅
   - Adobe Commerce: Master product record
   - ACO: Synchronized copy + enhancements

2. **One-Way Sync** ✅
   - Adobe Commerce → ACO (automatic)
   - ACO → Adobe Commerce (never)

3. **Different Purposes** ✅
   - Adobe Commerce: Product management
   - ACO: Storefront optimization

4. **ACO Enhancements are Separate** ✅
   - Catalog Views, Policies, Price Books
   - Configured in ACO, not synced from Adobe Commerce

5. **API Mesh is the Bridge** ✅
   - Connects customer data (Adobe Commerce) to catalog (ACO)
   - Orchestrates persona experience

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Related Documents**:
- `PRODUCT-FLOW-ADOBE-COMMERCE-TO-ACO.md`
- `ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md`
- `PHASE-8-BACKEND-SETUP.md`

