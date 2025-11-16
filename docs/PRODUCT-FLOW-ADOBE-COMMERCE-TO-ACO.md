# Product Flow: Adobe Commerce PaaS → ACO

## Executive Summary

This document explains how products flow from Adobe Commerce PaaS to Adobe Commerce Optimizer (ACO), and how this impacts the BuildRight persona demo implementation.

**Key Insight**: Adobe Commerce PaaS and ACO have a **one-way, automatic sync** for product catalog data. Products are created in Adobe Commerce, then automatically synced to ACO, where they can be enhanced with CCDM features (Catalog Views, Policies, Price Books).

---

## The Product Lifecycle

### Stage 1: Creation in Adobe Commerce PaaS

**Where**: Adobe Commerce Admin UI or REST API

**What You Create**:
```
Product in Adobe Commerce
├─ Basic Info
│   ├─ SKU: "LBR-D0414F1E"
│   ├─ Name: "2x4x8 Douglas Fir Framing Lumber"
│   ├─ Description: "Premium grade..."
│   ├─ Type: "simple"
│   └─ Price: $10.00 (base retail)
├─ Attributes
│   ├─ Standard Attributes
│   │   ├─ weight: 8.5
│   │   ├─ color: "Natural"
│   │   └─ manufacturer: "Pacific Lumber"
│   └─ Custom Attributes (Persona Filtering)
│       ├─ construction_phase: "foundation_framing"
│       ├─ quality_tier: "professional"
│       └─ category: "structural_lumber"
├─ Images
│   └─ Main image URL
├─ Categories
│   └─ Lumber > Framing > Douglas Fir
└─ Inventory
    └─ Qty: 1000
```

**How to Create**:

**Option A: Admin UI**
1. Navigate to Catalog → Products
2. Click "Add Product"
3. Fill in product details
4. Add custom attributes
5. Save

**Option B: REST API**
```bash
curl -X POST "https://your-instance.adobe.io/rest/V1/products" \
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
      "custom_attributes": [
        {
          "attribute_code": "construction_phase",
          "value": "foundation_framing"
        },
        {
          "attribute_code": "quality_tier",
          "value": "professional"
        }
      ]
    }
  }'
```

---

### Stage 2: Automatic Sync to ACO

**Mechanism**: SaaS Data Export extension (automatic)

**When It Happens**:
- **Scheduled**: Cron runs every X minutes (configurable)
- **Manual Trigger**: `bin/magento saas:resync --feed=products`
- **On Save**: Can be configured to sync immediately on product save

**What Gets Synced**:
```
From Adobe Commerce          To ACO
─────────────────────────────────────────────────
SKU                       →  SKU (primary key)
Name                      →  Name
Description               →  Description
Type                      →  Type
Price                     →  Base price
Images                    →  Image URLs
Categories                →  Category IDs
Status                    →  Active/Inactive
Visibility                →  Visibility settings

ALL Custom Attributes     →  Product attributes
├─ construction_phase     →  construction_phase
├─ quality_tier           →  quality_tier
└─ category               →  category

Attribute Metadata        →  Attribute definitions
├─ Attribute code         →  Attribute code
├─ Attribute label        →  Attribute label
├─ Input type             →  Input type
├─ Is searchable          →  Is searchable
└─ Is filterable          →  Is filterable
```

**The Sync Process**:
```
Adobe Commerce Product
          ↓
    Indexer Process
    (cde_products_feed indexer)
          ↓
    Feed Table (Staging)
    (cde_products_feed table in DB)
          ↓
    SaaS Data Exporter Cron
    (saas_data_exporter group)
          ↓
    Adobe Commerce SaaS API
          ↓
    ACO Catalog Service
          ↓
    Product Available in ACO
```

**Verification**:
```bash
# Check if product is in feed table
mysql> SELECT * FROM cde_products_feed 
       WHERE json_extract(feed_data, '$.sku') = 'LBR-D0414F1E';

# Trigger manual sync
bin/magento saas:resync --feed=products

# Check sync status
bin/magento saas:resync --feed=products --status
```

---

### Stage 3: Enhancement in ACO

**Where**: ACO Admin UI

**What You Configure** (Does NOT sync back to Adobe Commerce):

```
Product in ACO (After Sync)
├─ Synced Data (from Adobe Commerce)
│   ├─ SKU: "LBR-D0414F1E"
│   ├─ Name: "2x4x8 Douglas Fir Framing Lumber"
│   ├─ All attributes (including custom)
│   └─ Base price: $10.00
│
└─ ACO Enhancements (Configured in ACO)
    ├─ Catalog Views
    │   ├─ "US-Production-Builder" view
    │   │   └─ Product IS visible
    │   ├─ "US-DIY-Homeowner" view
    │   │   └─ Product NOT visible (filtered out)
    │   └─ "US-Remodeler" view
    │       └─ Product NOT visible (filtered out)
    │
    ├─ Policies (Triggered Filters)
    │   └─ Policy: "Foundation & Framing Phase"
    │       ├─ Trigger: AC-Policy-Phase: foundation_framing
    │       ├─ Filter: construction_phase = 'foundation_framing'
    │       └─ Result: Product IS included
    │
    └─ Price Books
        ├─ US-Retail: $10.00 (base)
        ├─ Production-Builder: $8.50 (-15%)
        ├─ Trade-Professional: $9.00 (-10%)
        └─ Wholesale-Reseller: $7.50 (-25%)
```

**Key Point**: Catalog Views, Policies, and Price Books are **ACO-only** configurations. They do NOT exist in Adobe Commerce PaaS.

---

## The One-Way Relationship

### What Syncs: Adobe Commerce → ACO ✅

```
Adobe Commerce PaaS (Source)
├─ Products ────────────────→ ACO
├─ Attributes ──────────────→ ACO
├─ Prices (base) ───────────→ ACO
└─ Categories ──────────────→ ACO
```

**Sync Method**: Automatic (SaaS Data Export)

---

### What Does NOT Sync: ACO → Adobe Commerce ❌

```
ACO (Enhancements)
├─ Catalog Views ──────────✗ Adobe Commerce
├─ Policies ───────────────✗ Adobe Commerce
├─ Price Books ────────────✗ Adobe Commerce
└─ Merchandising Rules ────✗ Adobe Commerce
```

**Why**: ACO is a **storefront enhancement layer**, not a product management system. Adobe Commerce remains the source of truth for product data.

---

## Key Concepts Explained

### 1. Product in Adobe Commerce (Source)

**Purpose**: Product data management

**Contains**:
- Core product information (SKU, name, description)
- Product attributes (standard + custom)
- Base pricing
- Inventory
- Categories
- Images

**Managed Via**:
- Adobe Commerce Admin UI
- Adobe Commerce REST API
- Adobe Commerce GraphQL API

**Example**:
```json
{
  "sku": "LBR-D0414F1E",
  "name": "2x4x8 Douglas Fir Framing Lumber",
  "type_id": "simple",
  "price": 10.00,
  "custom_attributes": [
    {
      "attribute_code": "construction_phase",
      "value": "foundation_framing"
    }
  ]
}
```

---

### 2. Product in ACO (Synced + Enhanced)

**Purpose**: Storefront experience optimization

**Contains**:
- **Synced data** from Adobe Commerce (read-only)
- **ACO enhancements** (configured in ACO)

**Synced Data** (from Adobe Commerce):
```json
{
  "sku": "LBR-D0414F1E",
  "name": "2x4x8 Douglas Fir Framing Lumber",
  "attributes": {
    "construction_phase": "foundation_framing",
    "quality_tier": "professional"
  }
}
```

**ACO Enhancements** (configured separately):
```json
{
  "catalogViews": ["US-Production-Builder"],
  "policies": ["foundation_framing_policy"],
  "priceBooks": {
    "US-Retail": 10.00,
    "Production-Builder": 8.50,
    "Trade-Professional": 9.00
  }
}
```

**Managed Via**:
- ACO Admin UI (for Catalog Views, Policies, Price Books)
- ACO GraphQL API (for querying)

---

### 3. Catalog Views (ACO-Only)

**What They Are**: Filters that determine product visibility based on business structure

**Purpose**: Show different products to different audiences

**Example**:
```
Catalog View: "US-Production-Builder"
├─ Includes products where:
│   ├─ construction_phase = 'foundation_framing' OR
│   ├─ construction_phase = 'rough_framing' OR
│   └─ quality_tier = 'professional'
└─ Linked to Price Book: "Production-Builder"
```

**Result**: Sarah (Production Builder) only sees relevant products

**Configured In**: ACO Admin UI (NOT Adobe Commerce)

---

### 4. Policies (ACO-Only)

**What They Are**: Dynamic filters triggered by HTTP headers

**Purpose**: Progressive disclosure based on user context

**Example**:
```
Policy: "Foundation & Framing Phase"
├─ Trigger Header: AC-Policy-Phase: foundation_framing
├─ Filter Rule: construction_phase = 'foundation_framing'
└─ Result: Only shows foundation & framing products
```

**How It Works**:
```
API Mesh receives request from Marcus
  ↓
Marcus's customer attributes: { construction_phase: 'foundation_framing' }
  ↓
API Mesh sets header: AC-Policy-Phase: foundation_framing
  ↓
ACO receives query with policy header
  ↓
ACO applies policy filter
  ↓
Returns only foundation & framing products
```

**Configured In**: ACO Admin UI (NOT Adobe Commerce)

---

### 5. Price Books (ACO-Only)

**What They Are**: Hierarchical pricing structures for different customer segments

**Purpose**: Customer-tier pricing (B2B)

**Example**:
```
Price Book Hierarchy:
US-Retail (base: $10.00)
├─ Production-Builder ($8.50, -15%)
├─ Trade-Professional ($9.00, -10%)
└─ Wholesale-Reseller ($7.50, -25%)
```

**How It Works**:
```
API Mesh receives request from Sarah
  ↓
Sarah's customer group: "Production-Builder"
  ↓
API Mesh queries ACO with priceBookId: "Production-Builder"
  ↓
ACO returns prices from "Production-Builder" price book
  ↓
Sarah sees $8.50 (15% off retail)
```

**Configured In**: ACO Admin UI (NOT Adobe Commerce)

---

## Impact on BuildRight Implementation

### What This Means for Phase 8

**Task 1: Create Products in Adobe Commerce PaaS** ✅

**Where**: Adobe Commerce Admin UI or REST API

**What to Create**:
1. **177 Products**
   - 70 simple products
   - 92 variant products
   - 15 bundle products

2. **Custom Attributes for Persona Filtering**
   - `construction_phase` (dropdown)
   - `quality_tier` (dropdown)
   - `package_tier` (dropdown)
   - `room_category` (dropdown)
   - `deck_compatible` (boolean)
   - `deck_shape` (dropdown)
   - `deck_material_type` (dropdown)
   - `store_velocity_category` (dropdown)
   - `restock_priority` (dropdown)

3. **Assign Attribute Values**
   - Set values for each product based on Phase 1 data

**How to Create**:

**Option A: Use buildright-aco Scripts (Modified)**
- Modify scripts to target Adobe Commerce REST API
- Use Phase 1 generated data
- Automated creation of all 177 products

**Option B: Manual Creation**
- Use Adobe Commerce Admin UI
- Time-consuming but visual
- Good for understanding the process

**Recommendation**: **Option A** - Modify scripts

---

**Task 2: Trigger SaaS Data Export** ✅

**Command**:
```bash
bin/magento saas:resync --feed=products
bin/magento saas:resync --feed=productAttributes
```

**Verification**:
1. Check ACO Admin UI → Data Sync page
2. Verify 177 products synced
3. Verify all custom attributes present

---

**Task 3: Configure ACO Enhancements** ✅

**In ACO Admin UI**:

1. **Create Catalog Views** (5 views, one per persona)
   - US-Production-Builder
   - US-General-Contractor
   - US-Remodeler
   - US-DIY-Homeowner
   - US-Store-Manager

2. **Configure Policies** (28 policies)
   - Foundation & Framing Phase
   - Rough Framing Phase
   - Professional Quality Tier
   - Better Package Tier
   - Bathroom Room Category
   - Deck Compatible
   - Rectangular Deck Shape
   - High Volume Store Velocity
   - ... (20 more)

3. **Set Up Price Books** (5 books)
   - US-Retail (base)
   - Production-Builder (15% off)
   - Trade-Professional (10% off)
   - Wholesale-Reseller (25% off)
   - Retail-Registered (5% off)

---

### What This Means for Phase 9 (API Mesh)

**API Mesh Role**: Orchestrate the connection between Adobe Commerce (customers) and ACO (catalog)

**Key Responsibilities**:

1. **Authenticate Customer** (Adobe Commerce PaaS)
   ```graphql
   query {
     customer {
       id
       email
       group_id  # e.g., "Production-Builder"
       custom_attributes {
         construction_phase  # e.g., "foundation_framing"
         quality_tier
       }
     }
   }
   ```

2. **Map Customer Group to Price Book** (API Mesh Logic)
   ```javascript
   const priceBookId = customer.group_id; // "Production-Builder"
   ```

3. **Map Custom Attributes to Policy Headers** (API Mesh Logic)
   ```javascript
   const policyHeaders = {
     'AC-Policy-Phase': customer.custom_attributes.construction_phase,
     'AC-Policy-Quality': customer.custom_attributes.quality_tier
   };
   ```

4. **Query ACO with Context** (ACO GraphQL)
   ```graphql
   query GetProducts {
     products(priceBookId: "Production-Builder") {
       items {
         sku
         name
         price  # Returns $8.50 (15% off)
       }
     }
   }
   ```
   **Headers**:
   ```
   AC-Policy-Phase: foundation_framing
   AC-Policy-Quality: professional
   ```

5. **Return Unified Response** (API Mesh)
   ```json
   {
     "products": [
       {
         "sku": "LBR-D0414F1E",
         "name": "2x4x8 Douglas Fir Framing Lumber",
         "price": 8.50,
         "customerGroup": "Production-Builder",
         "savings": 1.50,
         "savingsPercent": 15
       }
     ]
   }
   ```

---

## Comparison: Direct ACO Ingestion vs. Adobe Commerce Sync

### Option A: Adobe Commerce PaaS as Source (Recommended) ✅

```
Adobe Commerce PaaS (Product Management)
├─ Create 177 products
├─ Add custom attributes
└─ Manage product data
          ↓
    SaaS Data Export (Automatic)
          ↓
    ACO (Storefront Enhancement)
    ├─ Configure Catalog Views
    ├─ Configure Policies
    └─ Configure Price Books
          ↓
    API Mesh (Integration)
          ↓
    Edge Delivery Services
          ↓
    Storefront
```

**Pros**:
- ✅ Single source of truth (Adobe Commerce)
- ✅ Automatic sync (no manual ingestion)
- ✅ Familiar Adobe Commerce Admin UI
- ✅ Production-ready workflow
- ✅ Easy to add/update products
- ✅ Standard Adobe Commerce + ACO pattern

**Cons**:
- ⚠️ Must set up Adobe Commerce products first
- ⚠️ Sync latency (cron-based, typically 5-15 minutes)
- ⚠️ Requires Adobe Commerce PaaS instance

---

### Option B: Direct ACO Ingestion (Original Plan)

```
buildright-aco Scripts (Data Generation)
├─ Generate 177 products
├─ Generate prices
└─ Generate attributes
          ↓
    ACO Data Ingestion API (Manual)
          ↓
    ACO (Product Management + Storefront)
    ├─ Products stored directly in ACO
    ├─ Configure Catalog Views
    ├─ Configure Policies
    └─ Configure Price Books
          ↓
    API Mesh (Integration)
          ↓
    Edge Delivery Services
          ↓
    Storefront

Adobe Commerce PaaS (Separate)
├─ Customer management ONLY
├─ Order processing ONLY
└─ NO product catalog
```

**Pros**:
- ✅ ACO is source of truth
- ✅ No dependency on Adobe Commerce catalog
- ✅ Full control over data structure
- ✅ No sync latency
- ✅ Scripts already built (Phase 1)

**Cons**:
- ⚠️ Manual data management
- ⚠️ No automatic sync
- ⚠️ Two separate systems (Adobe Commerce for customers, ACO for products)
- ⚠️ Less standard pattern
- ⚠️ Harder to maintain long-term

---

## Recommendation: Use Adobe Commerce as Source

### Why Option A is Better for BuildRight

1. **Production-Ready Pattern** ✅
   - Standard Adobe Commerce + ACO workflow
   - Follows Adobe's recommended architecture
   - Easier to explain to stakeholders

2. **Single Source of Truth** ✅
   - All product data in Adobe Commerce
   - ACO is enhancement layer (as designed)
   - Clear separation of concerns

3. **Easier Maintenance** ✅
   - Add products in familiar Adobe Commerce UI
   - Automatic sync to ACO
   - No manual ingestion scripts to maintain

4. **Better for Demo** ✅
   - Shows complete Adobe Commerce + ACO integration
   - Demonstrates real-world workflow
   - More impressive to potential customers

5. **Scalable** ✅
   - Easy to add more products
   - Easy to update product data
   - Automatic propagation to ACO

---

## How to Modify buildright-aco Scripts

### Current Scripts (Phase 1)

**Target**: ACO Data Ingestion API

**Example** (`ingest-products.js`):
```javascript
// Current: Ingest directly to ACO
const response = await fetch(ACO_API_ENDPOINT, {
  method: 'POST',
  headers: {
    'x-api-key': ACO_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(productData)
});
```

---

### Modified Scripts (Phase 8)

**Target**: Adobe Commerce REST API

**Example** (`create-products-commerce.js`):
```javascript
// Modified: Create in Adobe Commerce
const response = await fetch(`${COMMERCE_API_ENDPOINT}/rest/V1/products`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${COMMERCE_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product: {
      sku: productData.sku,
      name: productData.name,
      attribute_set_id: 4,
      price: productData.price,
      status: 1,
      visibility: 4,
      type_id: 'simple',
      custom_attributes: productData.attributes.map(attr => ({
        attribute_code: attr.code,
        value: attr.value
      }))
    }
  })
});

// After all products created, trigger sync
console.log('Triggering SaaS Data Export...');
execSync('bin/magento saas:resync --feed=products');
execSync('bin/magento saas:resync --feed=productAttributes');
```

---

## Summary: The Complete Flow

### 1. Product Creation (Adobe Commerce)

**Who**: BuildRight team  
**Where**: Adobe Commerce Admin UI or REST API  
**What**: Create 177 products with custom attributes  
**Tool**: Modified buildright-aco scripts (recommended)

---

### 2. Automatic Sync (SaaS Data Export)

**Who**: Adobe Commerce (automatic)  
**When**: Scheduled (cron) or manual trigger  
**What**: Sync products, attributes, prices to ACO  
**Verification**: ACO Admin UI → Data Sync page

---

### 3. ACO Configuration (ACO Admin UI)

**Who**: BuildRight team  
**Where**: ACO Admin UI  
**What**: Configure Catalog Views, Policies, Price Books  
**Reference**: `buildright-aco/data/buildright/POLICY-SETUP-GUIDE.md`

---

### 4. API Mesh Integration (Phase 9)

**Who**: BuildRight team  
**Where**: API Mesh configuration  
**What**: Map customers to catalog, orchestrate queries  
**Result**: Unified persona experience

---

### 5. Storefront (EDS)

**Who**: End users  
**Where**: Edge Delivery Services (accs-citisignal)  
**What**: Browse products with persona-specific filtering and pricing  
**Experience**: Seamless, personalized shopping

---

## Key Takeaways

1. **Adobe Commerce is the Product Source** ✅
   - Create and manage products in Adobe Commerce
   - All product data lives here

2. **SaaS Data Export is Automatic** ✅
   - Products automatically sync to ACO
   - No manual ingestion needed

3. **ACO is the Enhancement Layer** ✅
   - Catalog Views for visibility
   - Policies for filtering
   - Price Books for pricing

4. **API Mesh is the Orchestrator** ✅
   - Connects customers (Adobe Commerce) to catalog (ACO)
   - Maps groups to price books
   - Maps attributes to policies

5. **One-Way Sync** ✅
   - Adobe Commerce → ACO (automatic)
   - ACO → Adobe Commerce (never)

---

## Next Steps

1. ✅ **Decide on Approach**
   - Recommendation: Use Adobe Commerce as source (Option A)
   - Alternative: Continue with direct ACO ingestion (Option B)

2. ✅ **Update Phase 8 Plan**
   - Include product creation in Adobe Commerce
   - Include SaaS Data Export sync
   - Include ACO configuration

3. ✅ **Modify buildright-aco Scripts** (if using Option A)
   - Target Adobe Commerce REST API
   - Use Phase 1 data
   - Add sync trigger

4. ✅ **Proceed with Phase 3**
   - Frontend development with mock ACO
   - No changes needed to frontend plans

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Related Documents**:
- `ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md`
- `PHASE-8-BACKEND-SETUP.md`
- `PHASE-9-PRODUCTION-DEPLOYMENT.md`

