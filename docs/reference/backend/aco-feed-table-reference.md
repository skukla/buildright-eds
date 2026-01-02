# Feed Table Explained: The Bridge Between Adobe Commerce and ACO

## What is the Feed Table?

The **Feed Table** is an intermediate staging table in Adobe Commerce PaaS that acts as a **queue** for data that needs to be exported to Adobe Commerce SaaS services (including ACO).

**Official Name**: `cde_products_feed` (Commerce Data Export - Products Feed)

**Purpose**: Store product data in a **pre-formatted, export-ready** state before it's sent to ACO via the SaaS Data Export extension.

---

## Why Does It Exist?

### Problem It Solves

Adobe Commerce stores product data in a complex **EAV (Entity-Attribute-Value)** model spread across multiple tables. This structure is:
- ✅ Great for flexible product management
- ❌ Inefficient for external API consumption
- ❌ Requires multiple database joins to assemble a complete product

**The Feed Table solves this by**:
1. **Pre-assembling** product data into a single JSON payload
2. **Staging** data for export (queue-based approach)
3. **Tracking** what's been synced vs. what's pending
4. **Decoupling** the export process from the main database

---

## Feed Table Structure

### Database Schema: `cde_products_feed`

```sql
CREATE TABLE cde_products_feed (
  feed_id VARCHAR(255) PRIMARY KEY,           -- Unique feed entry ID
  product_id INT NOT NULL,                    -- Reference to catalog_product_entity.entity_id
  store_view_code VARCHAR(32) NOT NULL,       -- Store view (e.g., 'default', 'en_us')
  feed_data LONGTEXT NOT NULL,                -- JSON payload (pre-formatted product data)
  modified_at INT NOT NULL,                   -- Unix timestamp of last modification
  is_sent TINYINT(1) DEFAULT 0,               -- Sync status (0=pending, 1=sent)
  sent_at INT DEFAULT NULL,                   -- Unix timestamp when sent to ACO
  is_deleted TINYINT(1) DEFAULT 0,            -- Deletion flag (1=product deleted)
  
  INDEX idx_product_id (product_id),
  INDEX idx_is_sent (is_sent),
  INDEX idx_modified_at (modified_at)
);
```

### Example Record

```sql
+------------------+------------+-----------------+------------------------+-------------+---------+------------+------------+
| feed_id          | product_id | store_view_code | feed_data              | modified_at | is_sent | sent_at    | is_deleted |
+------------------+------------+-----------------+------------------------+-------------+---------+------------+------------+
| abc-123-def-456  | 12345      | default         | {...JSON payload...}   | 1700136000  | 1       | 1700136300 | 0          |
+------------------+------------+-----------------+------------------------+-------------+---------+------------+------------+
```

---

## The `feed_data` JSON Payload

### What's Inside

The `feed_data` column contains a **complete, flattened representation** of the product, ready for ACO consumption.

**Example for SKU: LBR-D0414F1E**:

```json
{
  "sku": "LBR-D0414F1E",
  "name": "2x4x8 Douglas Fir Framing Lumber",
  "description": "Premium grade Douglas Fir lumber for framing applications. Ideal for residential and light commercial construction. Meets or exceeds industry standards for structural integrity.",
  "type": "simple",
  "status": "enabled",
  "visibility": "catalog_search",
  "urlKey": "lumber/douglas-fir-framing-lumber",
  
  "pricing": {
    "regular": 10.00,
    "currency": "USD"
  },
  
  "physical": {
    "weight": 8.5,
    "weightUnit": "lbs",
    "dimensions": {
      "length": 96.00,
      "width": 3.50,
      "height": 1.50,
      "unit": "inches"
    }
  },
  
  "attributes": {
    "manufacturer": "Pacific Lumber Co.",
    "construction_phase": "foundation_framing",
    "quality_tier": "professional",
    "category": "structural_lumber",
    "deck_compatible": false,
    "material": "douglas_fir",
    "grade": "premium",
    "treatment": "kiln_dried",
    "certification": "FSC_certified"
  },
  
  "images": [
    {
      "url": "https://cdn.example.com/media/catalog/product/l/u/lumber-douglas-fir.jpg",
      "label": "Main",
      "position": 1,
      "role": "main"
    },
    {
      "url": "https://cdn.example.com/media/catalog/product/l/u/lumber-douglas-fir-2.jpg",
      "label": "Alt1",
      "position": 2,
      "role": "gallery"
    }
  ],
  
  "categories": [
    {
      "id": "123",
      "name": "Lumber",
      "path": "lumber"
    },
    {
      "id": "456",
      "name": "Framing",
      "path": "lumber/framing"
    },
    {
      "id": "789",
      "name": "Douglas Fir",
      "path": "lumber/framing/douglas-fir"
    }
  ],
  
  "inventory": {
    "qty": 1000,
    "inStock": true
  },
  
  "metadata": {
    "sourceSystem": "adobe_commerce",
    "sourceId": "12345",
    "storeViewCode": "default",
    "websiteCode": "base",
    "exportedAt": "2024-11-16T10:05:00Z"
  }
}
```

### Key Differences from EAV Storage

| Aspect | EAV Tables (Adobe Commerce) | Feed Table |
|--------|----------------------------|------------|
| **Structure** | Spread across 7+ tables | Single JSON document |
| **Access** | Requires multiple JOINs | Single column read |
| **Format** | Normalized (attribute_id → value) | Denormalized (attribute_code → value) |
| **Performance** | Slower (multiple queries) | Faster (one query) |
| **Purpose** | Internal storage | External export |

---

## How the Feed Table Works: Complete Flow

### Step 1: Product Save Triggers Indexer

When you save a product in Adobe Commerce:

```
User saves product
  ↓
Adobe Commerce triggers indexers
  ↓
cde_products_feed indexer runs
```

**Indexer**: `Magento\CatalogDataExporter\Model\Indexer\ProductFeedIndexer`

---

### Step 2: Indexer Assembles Product Data

The indexer:
1. Loads the product from the database (with all JOINs)
2. Transforms EAV data into a flat structure
3. Converts attribute IDs to attribute codes
4. Resolves URLs, categories, images
5. Formats as JSON

**Simplified Code**:

```php
class ProductFeedIndexer
{
    public function execute($productId)
    {
        // 1. Load product (with all JOINs)
        $product = $this->productRepository->getById($productId);
        
        // 2. Transform to feed format
        $feedData = [
            'sku' => $product->getSku(),
            'name' => $product->getName(),
            'price' => $product->getPrice(),
            'type' => $product->getTypeId(),
            'status' => $product->getStatus() == 1 ? 'enabled' : 'disabled',
            'visibility' => $this->getVisibilityLabel($product->getVisibility()),
            'attributes' => [],
            'categories' => [],
            'images' => []
        ];
        
        // 3. Add all custom attributes (flatten EAV)
        foreach ($product->getCustomAttributes() as $attribute) {
            $feedData['attributes'][$attribute->getAttributeCode()] = 
                $attribute->getValue();
        }
        
        // 4. Add categories (resolve IDs to names/paths)
        foreach ($product->getCategoryIds() as $categoryId) {
            $category = $this->categoryRepository->get($categoryId);
            $feedData['categories'][] = [
                'id' => $categoryId,
                'name' => $category->getName(),
                'path' => $this->getCategoryPath($category)
            ];
        }
        
        // 5. Add images (resolve to full URLs)
        foreach ($product->getMediaGalleryImages() as $image) {
            $feedData['images'][] = [
                'url' => $this->mediaConfig->getMediaUrl($image->getFile()),
                'label' => $image->getLabel(),
                'position' => $image->getPosition(),
                'role' => $this->getImageRole($image)
            ];
        }
        
        // 6. Store in feed table
        $this->feedTable->insert([
            'feed_id' => $this->generateFeedId(),
            'product_id' => $productId,
            'store_view_code' => 'default',
            'feed_data' => json_encode($feedData),
            'modified_at' => time(),
            'is_sent' => 0,
            'is_deleted' => 0
        ]);
    }
}
```

**Result**: Product data is now in the feed table, ready for export.

---

### Step 3: Cron Job Exports Feed Data

A scheduled cron job runs periodically (every 5-15 minutes):

```bash
bin/magento cron:run --group=saas_data_exporter
```

**What It Does**:

```php
class SaasDataExporter
{
    public function export()
    {
        // 1. Get unsynced products from feed table
        $unsyncedProducts = $this->feedTable->getUnsynced('cde_products_feed');
        
        // 2. Batch products (100 at a time)
        $batches = array_chunk($unsyncedProducts, 100);
        
        foreach ($batches as $batch) {
            // 3. Prepare payload
            $payload = [
                'feed' => 'products',
                'data' => []
            ];
            
            foreach ($batch as $product) {
                $payload['data'][] = json_decode($product['feed_data'], true);
            }
            
            // 4. Send to ACO SaaS API
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

**Database Update**:

```sql
-- Mark as synced
UPDATE cde_products_feed
SET 
  is_sent = 1,
  sent_at = UNIX_TIMESTAMP()
WHERE feed_id IN ('abc-123-def-456', 'ghi-789-jkl-012', ...);
```

---

### Step 4: ACO Receives and Stores

ACO receives the JSON payload and stores it in its own database (see `PRODUCT-RECORD-VISUALIZATION.md` for ACO structure).

---

## Feed Table Lifecycle

### State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCT SAVED                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FEED TABLE: PENDING                                         │
│ ├─ is_sent: 0                                               │
│ ├─ sent_at: NULL                                            │
│ └─ feed_data: {...JSON...}                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Cron runs every 5-15 min)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ EXPORT TO ACO                                               │
│ ├─ Read feed_data                                           │
│ ├─ POST to ACO API                                          │
│ └─ Receive 200 OK                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FEED TABLE: SYNCED                                          │
│ ├─ is_sent: 1                                               │
│ ├─ sent_at: 1700136300                                      │
│ └─ feed_data: {...JSON...} (retained for history)           │
└─────────────────────────────────────────────────────────────┘
```

### Product Updates

When a product is updated:

```
Product updated
  ↓
Indexer re-runs
  ↓
Feed table entry UPDATED
├─ feed_data: {...new JSON...}
├─ modified_at: NEW_TIMESTAMP
├─ is_sent: 0 (reset to pending)
└─ sent_at: NULL (reset)
  ↓
Next cron run exports updated data
  ↓
is_sent: 1 (marked as synced again)
```

### Product Deletion

When a product is deleted:

```
Product deleted
  ↓
Indexer marks for deletion
  ↓
Feed table entry UPDATED
├─ is_deleted: 1
├─ modified_at: NEW_TIMESTAMP
├─ is_sent: 0 (reset to pending)
└─ feed_data: {...JSON with deletion flag...}
  ↓
Next cron run sends deletion to ACO
  ↓
ACO removes product from catalog
  ↓
Feed table entry can be purged (or retained for history)
```

---

## Other Feed Tables

The `cde_products_feed` is just one of several feed tables used by SaaS Data Export:

### Complete List

| Feed Table | Purpose | Syncs To |
|-----------|---------|----------|
| `cde_products_feed` | Product data | ACO, Live Search, Product Recommendations |
| `cde_product_attributes_feed` | Product attributes (definitions) | ACO, Live Search |
| `cde_categories_feed` | Category data | ACO, Live Search |
| `cde_product_prices_feed` | Product prices | ACO, Live Search |
| `cde_product_variants_feed` | Configurable product variants | ACO |
| `cde_product_overrides_feed` | Store-specific overrides | ACO |

**Each feed table**:
- Has the same basic structure (`feed_id`, `feed_data`, `is_sent`, etc.)
- Stores a different type of data
- Is managed by its own indexer
- Is exported by the same SaaS Data Export cron job

---

## Why This Matters for BuildRight

### For Phase 1 (ACO Data Foundation)

When we create products in Adobe Commerce:

1. **Products saved** → Triggers indexer
2. **Indexer runs** → Populates `cde_products_feed`
3. **Feed table contains**:
   - All 177 products
   - All custom attributes (`construction_phase`, `quality_tier`, etc.)
   - Ready for export
4. **Cron job runs** → Sends to ACO
5. **ACO receives** → Creates product records

**Key Point**: We don't need to manually format data for ACO. The feed table does this automatically.

---

### For Phase 8 (Backend Setup)

When setting up the real Adobe Commerce instance:

1. **Configure SaaS Data Export**:
   ```bash
   bin/magento config:set services/saas/project_id YOUR_PROJECT_ID
   bin/magento config:set services/saas/environment_id YOUR_ENV_ID
   bin/magento config:set services/saas/api_key YOUR_API_KEY
   ```

2. **Trigger initial sync**:
   ```bash
   bin/magento saas:resync --feed=products
   ```

3. **Verify feed table**:
   ```sql
   SELECT 
     COUNT(*) as total_products,
     SUM(CASE WHEN is_sent = 1 THEN 1 ELSE 0 END) as synced,
     SUM(CASE WHEN is_sent = 0 THEN 1 ELSE 0 END) as pending
   FROM cde_products_feed;
   ```

4. **Monitor sync status** in Adobe Commerce Admin:
   - Stores → Configuration → Services → Commerce Services Connector
   - View "Data Export" dashboard

---

## Troubleshooting Feed Table Issues

### Common Issues

#### Issue 1: Products Not Syncing

**Symptom**: `is_sent = 0` for all products

**Possible Causes**:
- Cron not running
- SaaS credentials not configured
- Network connectivity issues

**Solution**:
```bash
# Check cron status
bin/magento cron:run --group=saas_data_exporter

# Check SaaS configuration
bin/magento config:show services/saas

# Manually trigger sync
bin/magento saas:resync --feed=products
```

---

#### Issue 2: Feed Table Growing Too Large

**Symptom**: `cde_products_feed` table has millions of rows

**Possible Causes**:
- Old synced entries not being cleaned up
- Frequent product updates creating many entries

**Solution**:
```sql
-- Clean up old synced entries (older than 30 days)
DELETE FROM cde_products_feed
WHERE is_sent = 1
  AND sent_at < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
```

---

#### Issue 3: Feed Data Incorrect

**Symptom**: ACO has wrong product data

**Possible Causes**:
- Indexer not running after product update
- Stale feed data

**Solution**:
```bash
# Reindex feed
bin/magento indexer:reindex cde_products_feed

# Force resync
bin/magento saas:resync --feed=products --cleanup
```

---

## Summary

### What is the Feed Table?

- **Name**: `cde_products_feed`
- **Purpose**: Staging table for product data export to ACO
- **Structure**: `feed_id`, `product_id`, `feed_data` (JSON), `is_sent`, `sent_at`
- **Managed By**: SaaS Data Export extension

### Why Does It Exist?

1. **Pre-assembles** product data from EAV into flat JSON
2. **Stages** data for export (queue-based)
3. **Tracks** sync status (pending vs. synced)
4. **Decouples** export from main database

### How Does It Work?

1. **Product saved** → Indexer populates feed table
2. **Cron runs** → Exports feed data to ACO
3. **ACO receives** → Stores in ACO database
4. **Feed table updated** → Marked as synced

### Key Takeaways

- ✅ **Automatic**: No manual formatting required
- ✅ **Efficient**: Pre-assembled, ready for export
- ✅ **Reliable**: Queue-based, tracks sync status
- ✅ **Transparent**: Can query to monitor sync progress

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Related Documents**:
- `PRODUCT-RECORD-CREATION-FLOW.md`
- `PRODUCT-RECORD-VISUALIZATION.md`
- `ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md`

