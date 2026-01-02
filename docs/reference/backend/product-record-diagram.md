# Product Record Visualization: Single Product Across Both Systems

## Overview

This document visualizes a single product record as it exists in both Adobe Commerce PaaS and Adobe Commerce Optimizer (ACO), showing exactly how the data is structured, stored, and enhanced in each system.

**Example Product**: 2x4x8 Douglas Fir Framing Lumber (SKU: LBR-D0414F1E)

---

## The Product Record in Adobe Commerce PaaS

### Database Structure (MySQL + EAV)

Adobe Commerce uses an Entity-Attribute-Value (EAV) model, where product data is spread across multiple tables.

#### Main Product Table: `catalog_product_entity`

```sql
+------------+------------------+-------------+---------------------+---------------------+
| entity_id  | sku              | type_id     | created_at          | updated_at          |
+------------+------------------+-------------+---------------------+---------------------+
| 12345      | LBR-D0414F1E     | simple      | 2024-11-16 10:00:00 | 2024-11-16 10:00:00 |
+------------+------------------+-------------+---------------------+---------------------+
```

**What This Stores**:
- `entity_id`: Internal Adobe Commerce ID (primary key)
- `sku`: Unique product identifier (our key)
- `type_id`: Product type (simple, configurable, bundle, etc.)
- `created_at`: When product was created
- `updated_at`: Last modification timestamp

---

#### Product Attributes: `catalog_product_entity_varchar` (Text Values)

```sql
+-----------+--------------+----------+-----------------------------------------------+
| entity_id | attribute_id | store_id | value                                         |
+-----------+--------------+----------+-----------------------------------------------+
| 12345     | 71           | 0        | 2x4x8 Douglas Fir Framing Lumber              |  ← name
| 12345     | 72           | 0        | Premium grade Douglas Fir lumber for...       |  ← description
| 12345     | 84           | 0        | lumber/douglas-fir-framing-lumber             |  ← url_key
| 12345     | 87           | 0        | /l/u/lumber-douglas-fir.jpg                   |  ← image
| 12345     | 201          | 0        | foundation_framing                            |  ← construction_phase
| 12345     | 202          | 0        | professional                                  |  ← quality_tier
| 12345     | 203          | 0        | structural_lumber                             |  ← category
| 12345     | 85           | 0        | Pacific Lumber Co.                            |  ← manufacturer
+-----------+--------------+----------+-----------------------------------------------+
```

**What This Stores**:
- Text-based attributes (name, description, URLs, custom text attributes)
- Each row is one attribute value for the product
- `attribute_id` references `eav_attribute` table for attribute definition

---

#### Product Attributes: `catalog_product_entity_decimal` (Numeric Values)

```sql
+-----------+--------------+----------+--------+
| entity_id | attribute_id | store_id | value  |
+-----------+--------------+----------+--------+
| 12345     | 75           | 0        | 10.00  |  ← price
| 12345     | 81           | 0        | 8.50   |  ← weight (lbs)
| 12345     | 82           | 0        | 96.00  |  ← length (inches)
| 12345     | 83           | 0        | 3.50   |  ← width (inches)
+-----------+--------------+----------+--------+
```

**What This Stores**:
- Numeric attributes (price, weight, dimensions)
- Decimal precision for monetary values

---

#### Product Attributes: `catalog_product_entity_int` (Integer/Boolean Values)

```sql
+-----------+--------------+----------+-------+
| entity_id | attribute_id | store_id | value |
+-----------+--------------+----------+-------+
| 12345     | 96           | 0        | 1     |  ← status (1=enabled, 2=disabled)
| 12345     | 99           | 0        | 4     |  ← visibility (4=catalog+search)
| 12345     | 204          | 0        | 0     |  ← deck_compatible (0=no, 1=yes)
| 12345     | 120          | 0        | 1     |  ← tax_class_id
+-----------+--------------+----------+-------+
```

**What This Stores**:
- Integer values and boolean flags
- Status, visibility, and yes/no custom attributes

---

#### Product Inventory: `cataloginventory_stock_item`

```sql
+------------+----------+------+-------------+----------------+
| product_id | stock_id | qty  | is_in_stock | manage_stock   |
+------------+----------+------+-------------+----------------+
| 12345      | 1        | 1000 | 1           | 1              |
+------------+----------+------+-------------+----------------+
```

**What This Stores**:
- `qty`: Available quantity
- `is_in_stock`: Stock status (1=in stock, 0=out of stock)
- `manage_stock`: Whether to track inventory

---

#### Product Categories: `catalog_category_product`

```sql
+-------------+------------+----------+
| category_id | product_id | position |
+-------------+------------+----------+
| 123         | 12345      | 10       |  ← Lumber
| 456         | 12345      | 5        |  ← Framing
| 789         | 12345      | 1        |  ← Douglas Fir
+-------------+------------+----------+
```

**What This Stores**:
- Category assignments
- Position within each category

---

#### Product Images: `catalog_product_entity_media_gallery`

```sql
+-----------+--------------+-------+--------------------------------+
| value_id  | entity_id    | label | file                           |
+-----------+--------------+-------+--------------------------------+
| 5001      | 12345        | Main  | /l/u/lumber-douglas-fir.jpg    |
| 5002      | 12345        | Alt1  | /l/u/lumber-douglas-fir-2.jpg  |
| 5003      | 12345        | Alt2  | /l/u/lumber-douglas-fir-3.jpg  |
+-----------+--------------+-------+--------------------------------+
```

**What This Stores**:
- Image files
- Image labels
- Multiple images per product

---

### Complete Product Record (Adobe Commerce)

**Assembled View** (as returned by API):

```json
{
  "id": 12345,
  "sku": "LBR-D0414F1E",
  "name": "2x4x8 Douglas Fir Framing Lumber",
  "type_id": "simple",
  "status": 1,
  "visibility": 4,
  "price": 10.00,
  "weight": 8.5,
  
  "custom_attributes": [
    {
      "attribute_code": "description",
      "value": "Premium grade Douglas Fir lumber for framing applications. Ideal for residential and light commercial construction. Meets or exceeds industry standards for structural integrity."
    },
    {
      "attribute_code": "url_key",
      "value": "lumber/douglas-fir-framing-lumber"
    },
    {
      "attribute_code": "image",
      "value": "/l/u/lumber-douglas-fir.jpg"
    },
    {
      "attribute_code": "manufacturer",
      "value": "Pacific Lumber Co."
    },
    {
      "attribute_code": "construction_phase",
      "value": "foundation_framing"
    },
    {
      "attribute_code": "quality_tier",
      "value": "professional"
    },
    {
      "attribute_code": "category",
      "value": "structural_lumber"
    },
    {
      "attribute_code": "deck_compatible",
      "value": "0"
    },
    {
      "attribute_code": "length",
      "value": "96.00"
    },
    {
      "attribute_code": "width",
      "value": "3.50"
    }
  ],
  
  "extension_attributes": {
    "stock_item": {
      "item_id": 12345,
      "product_id": 12345,
      "stock_id": 1,
      "qty": 1000,
      "is_in_stock": true,
      "manage_stock": true
    },
    "category_links": [
      {
        "category_id": "123",
        "position": 10
      },
      {
        "category_id": "456",
        "position": 5
      },
      {
        "category_id": "789",
        "position": 1
      }
    ]
  },
  
  "media_gallery_entries": [
    {
      "id": 5001,
      "media_type": "image",
      "label": "Main",
      "position": 1,
      "disabled": false,
      "file": "/l/u/lumber-douglas-fir.jpg"
    },
    {
      "id": 5002,
      "media_type": "image",
      "label": "Alt1",
      "position": 2,
      "disabled": false,
      "file": "/l/u/lumber-douglas-fir-2.jpg"
    },
    {
      "id": 5003,
      "media_type": "image",
      "label": "Alt2",
      "position": 3,
      "disabled": false,
      "file": "/l/u/lumber-douglas-fir-3.jpg"
    }
  ],
  
  "created_at": "2024-11-16 10:00:00",
  "updated_at": "2024-11-16 10:00:00"
}
```

---

## The Sync Process: Feed Table

### Feed Table: `cde_products_feed`

Before being sent to ACO, the product is transformed into a feed format:

```sql
+-----------+------------+-----------------+------------------------+-------------+
| feed_id   | product_id | store_view_code | feed_data              | modified_at |
+-----------+------------+-----------------+------------------------+-------------+
| abc-123   | 12345      | default         | {...JSON payload...}   | 1700136000  |
+-----------+------------+-----------------+------------------------+-------------+
```

**Feed Data JSON** (simplified for readability):

```json
{
  "sku": "LBR-D0414F1E",
  "name": "2x4x8 Douglas Fir Framing Lumber",
  "description": "Premium grade Douglas Fir lumber for framing applications...",
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
      "unit": "inches"
    }
  },
  
  "attributes": {
    "manufacturer": "Pacific Lumber Co.",
    "construction_phase": "foundation_framing",
    "quality_tier": "professional",
    "category": "structural_lumber",
    "deck_compatible": false
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
    },
    {
      "url": "https://cdn.example.com/media/catalog/product/l/u/lumber-douglas-fir-3.jpg",
      "label": "Alt2",
      "position": 3,
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

---

## The Product Record in ACO

### Database Structure (Document-Based)

ACO uses a document-based database (likely MongoDB or similar), where each product is a single document.

#### Complete Product Document in ACO

```javascript
{
  // ACO Internal IDs
  "_id": ObjectId("673858a1b2c3d4e5f6789012"),
  "acoProductId": "aco_prod_LBR-D0414F1E",
  
  // Source System Reference
  "sourceSystem": "adobe_commerce",
  "sourceEnvironmentId": "prod-12345",
  "sourceProductId": "12345",
  "sku": "LBR-D0414F1E",
  
  // Sync Metadata
  "syncStatus": {
    "lastSyncedAt": ISODate("2024-11-16T10:05:00Z"),
    "syncVersion": 1,
    "isDeleted": false
  },
  
  // ========================================
  // SYNCED DATA (from Adobe Commerce)
  // Read-only - managed by sync process
  // ========================================
  
  "basicInfo": {
    "name": "2x4x8 Douglas Fir Framing Lumber",
    "description": "Premium grade Douglas Fir lumber for framing applications. Ideal for residential and light commercial construction. Meets or exceeds industry standards for structural integrity.",
    "type": "simple",
    "status": "active",
    "visibility": "catalog_search",
    "urlKey": "lumber/douglas-fir-framing-lumber"
  },
  
  "pricing": {
    "basePrice": 10.00,
    "currency": "USD",
    "priceType": "fixed"
  },
  
  "physical": {
    "weight": {
      "value": 8.5,
      "unit": "lbs"
    },
    "dimensions": {
      "length": 96.00,
      "width": 3.50,
      "height": 1.50,
      "unit": "inches"
    }
  },
  
  "attributes": {
    // Standard Attributes
    "manufacturer": "Pacific Lumber Co.",
    
    // Custom Attributes (Persona Filtering)
    "construction_phase": "foundation_framing",
    "quality_tier": "professional",
    "category": "structural_lumber",
    "deck_compatible": false,
    
    // Additional Attributes
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
      "role": "main",
      "width": 1200,
      "height": 1200
    },
    {
      "url": "https://cdn.example.com/media/catalog/product/l/u/lumber-douglas-fir-2.jpg",
      "label": "Alt1",
      "position": 2,
      "role": "gallery",
      "width": 1200,
      "height": 1200
    },
    {
      "url": "https://cdn.example.com/media/catalog/product/l/u/lumber-douglas-fir-3.jpg",
      "label": "Alt2",
      "position": 3,
      "role": "gallery",
      "width": 1200,
      "height": 1200
    }
  ],
  
  "categories": [
    {
      "id": "123",
      "name": "Lumber",
      "path": "lumber",
      "level": 1
    },
    {
      "id": "456",
      "name": "Framing",
      "path": "lumber/framing",
      "level": 2
    },
    {
      "id": "789",
      "name": "Douglas Fir",
      "path": "lumber/framing/douglas-fir",
      "level": 3
    }
  ],
  
  "inventory": {
    "qty": 1000,
    "inStock": true,
    "stockStatus": "in_stock"
  },
  
  // ========================================
  // ACO ENHANCEMENTS
  // Configured in ACO Admin UI
  // NOT synced from Adobe Commerce
  // ========================================
  
  "acoEnhancements": {
    
    // Catalog Views: Which views this product appears in
    "catalogViews": [
      {
        "viewId": "US-Production-Builder",
        "viewName": "US Production Builder View",
        "isVisible": true,
        "addedAt": ISODate("2024-11-16T11:00:00Z"),
        "reason": "Matches construction_phase filter"
      },
      {
        "viewId": "US-General-Contractor",
        "viewName": "US General Contractor View",
        "isVisible": true,
        "addedAt": ISODate("2024-11-16T11:00:00Z"),
        "reason": "Matches quality_tier filter"
      },
      {
        "viewId": "US-DIY-Homeowner",
        "viewName": "US DIY Homeowner View",
        "isVisible": false,
        "addedAt": ISODate("2024-11-16T11:00:00Z"),
        "reason": "Filtered out - professional grade only"
      }
    ],
    
    // Policies: Which policies this product is eligible for
    "policyEligibility": {
      "foundation_framing_policy": {
        "eligible": true,
        "policyName": "Foundation & Framing Phase",
        "triggerHeader": "AC-Policy-Phase",
        "triggerValue": "foundation_framing",
        "matchedAttribute": "construction_phase",
        "evaluatedAt": ISODate("2024-11-16T11:00:00Z")
      },
      "professional_quality_policy": {
        "eligible": true,
        "policyName": "Professional Quality Tier",
        "triggerHeader": "AC-Policy-Quality",
        "triggerValue": "professional",
        "matchedAttribute": "quality_tier",
        "evaluatedAt": ISODate("2024-11-16T11:00:00Z")
      },
      "deck_compatible_policy": {
        "eligible": false,
        "policyName": "Deck Compatible Products",
        "triggerHeader": "AC-Policy-Deck",
        "triggerValue": "true",
        "matchedAttribute": "deck_compatible",
        "evaluatedAt": ISODate("2024-11-16T11:00:00Z")
      }
    },
    
    // Price Books: Pricing for different customer segments
    "priceBooks": {
      "US-Retail": {
        "priceBookId": "US-Retail",
        "priceBookName": "US Retail Catalog Pricing",
        "price": 10.00,
        "currency": "USD",
        "isBase": true,
        "effectiveDate": ISODate("2024-11-16T00:00:00Z"),
        
        // Volume Tier Pricing
        "volumeTiers": [
          {
            "minQty": 1,
            "maxQty": 99,
            "price": 10.00,
            "discount": 0
          },
          {
            "minQty": 100,
            "maxQty": 293,
            "price": 9.70,
            "discount": 0.03
          },
          {
            "minQty": 294,
            "maxQty": null,
            "price": 9.20,
            "discount": 0.08
          }
        ]
      },
      
      "Production-Builder": {
        "priceBookId": "Production-Builder",
        "priceBookName": "Production Builder Pricing",
        "parentPriceBook": "US-Retail",
        "price": 8.50,
        "currency": "USD",
        "discount": 0.15,
        "isBase": false,
        "effectiveDate": ISODate("2024-11-16T00:00:00Z"),
        
        // Volume Tier Pricing (stacks with customer tier discount)
        "volumeTiers": [
          {
            "minQty": 1,
            "maxQty": 99,
            "price": 8.50,
            "discount": 0.15,
            "totalDiscount": 0.15
          },
          {
            "minQty": 100,
            "maxQty": 293,
            "price": 8.25,
            "discount": 0.03,
            "totalDiscount": 0.175
          },
          {
            "minQty": 294,
            "maxQty": null,
            "price": 7.82,
            "discount": 0.08,
            "totalDiscount": 0.218
          }
        ]
      },
      
      "Trade-Professional": {
        "priceBookId": "Trade-Professional",
        "priceBookName": "Trade Professional Pricing",
        "parentPriceBook": "US-Retail",
        "price": 9.00,
        "currency": "USD",
        "discount": 0.10,
        "isBase": false,
        "effectiveDate": ISODate("2024-11-16T00:00:00Z"),
        
        "volumeTiers": [
          {
            "minQty": 1,
            "maxQty": 99,
            "price": 9.00,
            "discount": 0.10,
            "totalDiscount": 0.10
          },
          {
            "minQty": 100,
            "maxQty": 293,
            "price": 8.73,
            "discount": 0.03,
            "totalDiscount": 0.127
          },
          {
            "minQty": 294,
            "maxQty": null,
            "price": 8.28,
            "discount": 0.08,
            "totalDiscount": 0.172
          }
        ]
      },
      
      "Wholesale-Reseller": {
        "priceBookId": "Wholesale-Reseller",
        "priceBookName": "Wholesale Reseller Pricing",
        "parentPriceBook": "US-Retail",
        "price": 7.50,
        "currency": "USD",
        "discount": 0.25,
        "isBase": false,
        "effectiveDate": ISODate("2024-11-16T00:00:00Z"),
        
        "volumeTiers": [
          {
            "minQty": 1,
            "maxQty": 99,
            "price": 7.50,
            "discount": 0.25,
            "totalDiscount": 0.25
          },
          {
            "minQty": 100,
            "maxQty": 293,
            "price": 7.28,
            "discount": 0.03,
            "totalDiscount": 0.272
          },
          {
            "minQty": 294,
            "maxQty": null,
            "price": 6.90,
            "discount": 0.08,
            "totalDiscount": 0.31
          }
        ]
      },
      
      "Retail-Registered": {
        "priceBookId": "Retail-Registered",
        "priceBookName": "Registered Customer Pricing",
        "parentPriceBook": "US-Retail",
        "price": 9.50,
        "currency": "USD",
        "discount": 0.05,
        "isBase": false,
        "effectiveDate": ISODate("2024-11-16T00:00:00Z"),
        
        "volumeTiers": [
          {
            "minQty": 1,
            "maxQty": 99,
            "price": 9.50,
            "discount": 0.05,
            "totalDiscount": 0.05
          },
          {
            "minQty": 100,
            "maxQty": 293,
            "price": 9.22,
            "discount": 0.03,
            "totalDiscount": 0.078
          },
          {
            "minQty": 294,
            "maxQty": null,
            "price": 8.74,
            "discount": 0.08,
            "totalDiscount": 0.126
          }
        ]
      }
    },
    
    // Merchandising Rules (optional)
    "merchandising": {
      "featured": false,
      "newArrival": false,
      "bestSeller": true,
      "recommended": true,
      "relatedProducts": [
        "FAS-N0234S",
        "FAS-N0456L",
        "ADH-C0123"
      ],
      "crossSellProducts": [
        "TOL-H0789",
        "SAF-G0456"
      ]
    },
    
    // Search & Discovery
    "searchOptimization": {
      "searchKeywords": [
        "2x4",
        "framing lumber",
        "douglas fir",
        "structural lumber",
        "construction lumber"
      ],
      "searchBoost": 1.2,
      "isSearchable": true,
      "isFilterable": true
    }
  },
  
  // ========================================
  // ACO COMPUTED FIELDS
  // Calculated by ACO for performance
  // ========================================
  
  "computed": {
    "lowestPrice": 6.90,
    "highestPrice": 10.00,
    "averageDiscount": 0.15,
    "catalogViewCount": 2,
    "policyEligibilityCount": 2,
    "priceBookCount": 5,
    "lastQueried": ISODate("2024-11-16T14:30:00Z"),
    "queryCount": 1523,
    "conversionRate": 0.12
  },
  
  // ========================================
  // SYSTEM METADATA
  // ========================================
  
  "metadata": {
    "createdAt": ISODate("2024-11-16T10:05:00Z"),
    "updatedAt": ISODate("2024-11-16T11:00:00Z"),
    "version": 1,
    "locale": "en_US",
    "environment": "production"
  }
}
```

---

## Side-by-Side Comparison

### Data Mapping: Adobe Commerce → ACO

| Adobe Commerce Field | Adobe Commerce Value | ACO Field | ACO Value | Notes |
|---------------------|---------------------|-----------|-----------|-------|
| **Core Product Data** |
| `entity_id` | `12345` | `sourceProductId` | `"12345"` | Internal ID mapping |
| `sku` | `"LBR-D0414F1E"` | `sku` | `"LBR-D0414F1E"` | Primary key (same) |
| `type_id` | `"simple"` | `basicInfo.type` | `"simple"` | Product type |
| `status` | `1` (enabled) | `basicInfo.status` | `"active"` | Status (transformed) |
| `name` | `"2x4x8 Douglas Fir..."` | `basicInfo.name` | `"2x4x8 Douglas Fir..."` | Product name (same) |
| `description` | `"Premium grade..."` | `basicInfo.description` | `"Premium grade..."` | Description (same) |
| **Pricing** |
| `price` | `10.00` | `pricing.basePrice` | `10.00` | Base price (same) |
| N/A | N/A | `acoEnhancements.priceBooks` | `{...5 price books...}` | **ACO ONLY** |
| **Physical Attributes** |
| `weight` | `8.5` | `physical.weight.value` | `8.5` | Weight (same) |
| N/A | N/A | `physical.weight.unit` | `"lbs"` | Unit added by ACO |
| **Custom Attributes (Persona Filtering)** |
| `construction_phase` | `"foundation_framing"` | `attributes.construction_phase` | `"foundation_framing"` | **KEY FOR FILTERING** |
| `quality_tier` | `"professional"` | `attributes.quality_tier` | `"professional"` | **KEY FOR FILTERING** |
| `category` | `"structural_lumber"` | `attributes.category` | `"structural_lumber"` | Category attribute |
| `deck_compatible` | `0` (false) | `attributes.deck_compatible` | `false` | Boolean (transformed) |
| **Images** |
| `media_gallery_entries[0].file` | `"/l/u/lumber-douglas-fir.jpg"` | `images[0].url` | `"https://cdn.../lumber-douglas-fir.jpg"` | Full URL in ACO |
| **Categories** |
| `category_links` | `[123, 456, 789]` | `categories` | `[{id, name, path}...]` | Enriched in ACO |
| **Inventory** |
| `stock_item.qty` | `1000` | `inventory.qty` | `1000` | Quantity (same) |
| `stock_item.is_in_stock` | `true` | `inventory.inStock` | `true` | Stock status (same) |
| **ACO Enhancements (NOT in Adobe Commerce)** |
| N/A | N/A | `acoEnhancements.catalogViews` | `[...3 views...]` | **ACO ONLY** |
| N/A | N/A | `acoEnhancements.policyEligibility` | `{...3 policies...}` | **ACO ONLY** |
| N/A | N/A | `acoEnhancements.merchandising` | `{...}` | **ACO ONLY** |
| N/A | N/A | `acoEnhancements.searchOptimization` | `{...}` | **ACO ONLY** |

---

## Visual Flow: Data Population

### Step 1: Product Created in Adobe Commerce

```
┌─────────────────────────────────────────────────────────────┐
│ ADOBE COMMERCE PaaS                                         │
│                                                             │
│ Product Created:                                            │
│ ├─ SKU: LBR-D0414F1E                                        │
│ ├─ Name: 2x4x8 Douglas Fir Framing Lumber                  │
│ ├─ Price: $10.00                                            │
│ ├─ construction_phase: foundation_framing ← PERSONA ATTR    │
│ ├─ quality_tier: professional ← PERSONA ATTR                │
│ └─ Inventory: 1000 units                                    │
│                                                             │
│ Database Tables:                                            │
│ ├─ catalog_product_entity (main record)                     │
│ ├─ catalog_product_entity_varchar (text attributes)         │
│ ├─ catalog_product_entity_decimal (price, weight)           │
│ ├─ catalog_product_entity_int (status, visibility)          │
│ ├─ cataloginventory_stock_item (inventory)                  │
│ └─ catalog_category_product (categories)                    │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Indexed for Export

```
┌─────────────────────────────────────────────────────────────┐
│ ADOBE COMMERCE PaaS - FEED TABLE                            │
│                                                             │
│ cde_products_feed:                                          │
│ ├─ feed_id: abc-123                                         │
│ ├─ product_id: 12345                                        │
│ └─ feed_data: {                                             │
│      sku: "LBR-D0414F1E",                                   │
│      name: "2x4x8 Douglas Fir Framing Lumber",              │
│      price: 10.00,                                          │
│      attributes: {                                          │
│        construction_phase: "foundation_framing",            │
│        quality_tier: "professional"                         │
│      }                                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (SaaS Data Export)
                            ↓
```

### Step 3: Synced to ACO

```
┌─────────────────────────────────────────────────────────────┐
│ ACO - SYNCED DATA                                           │
│                                                             │
│ Product Document:                                           │
│ ├─ sku: "LBR-D0414F1E"                                      │
│ ├─ sourceSystem: "adobe_commerce"                           │
│ ├─ sourceProductId: "12345"                                 │
│ │                                                           │
│ ├─ basicInfo: {                                             │
│ │    name: "2x4x8 Douglas Fir Framing Lumber",              │
│ │    status: "active"                                       │
│ │  }                                                        │
│ │                                                           │
│ ├─ pricing: {                                               │
│ │    basePrice: 10.00                                       │
│ │  }                                                        │
│ │                                                           │
│ └─ attributes: {                                            │
│      construction_phase: "foundation_framing", ← SYNCED     │
│      quality_tier: "professional" ← SYNCED                  │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Enhanced in ACO

```
┌─────────────────────────────────────────────────────────────┐
│ ACO - ENHANCED DATA                                         │
│                                                             │
│ Same Product Document + ACO Enhancements:                   │
│                                                             │
│ acoEnhancements: {                                          │
│   ├─ catalogViews: [                                        │
│   │    "US-Production-Builder" ← VISIBLE                    │
│   │    "US-General-Contractor" ← VISIBLE                    │
│   │    "US-DIY-Homeowner" ← HIDDEN                          │
│   │  ]                                                      │
│   │                                                         │
│   ├─ policyEligibility: {                                   │
│   │    foundation_framing_policy: true ← ELIGIBLE           │
│   │    professional_quality_policy: true ← ELIGIBLE         │
│   │    deck_compatible_policy: false ← NOT ELIGIBLE         │
│   │  }                                                      │
│   │                                                         │
│   └─ priceBooks: {                                          │
│        "US-Retail": $10.00 (base)                           │
│        "Production-Builder": $8.50 (-15%) ← SARAH           │
│        "Trade-Professional": $9.00 (-10%) ← MARCUS/LISA     │
│        "Wholesale-Reseller": $7.50 (-25%) ← KEVIN           │
│        "Retail-Registered": $9.50 (-5%) ← DAVID             │
│      }                                                      │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Query Example: Sarah's View

### Sarah's Customer Record (Adobe Commerce)

```json
{
  "id": 456,
  "email": "sarah.martinez@sunbelthomes.com",
  "group_id": "Production-Builder",
  "custom_attributes": {
    "construction_phase": "foundation_framing",
    "business_type": "production_builder"
  }
}
```

### API Mesh Query to ACO

```graphql
query GetPersonaProducts {
  products(priceBookId: "Production-Builder") {
    sku
    name
    price
  }
}
```

**Headers**:
```
AC-Policy-Phase: foundation_framing
```

### ACO Returns

```json
{
  "products": [
    {
      "sku": "LBR-D0414F1E",
      "name": "2x4x8 Douglas Fir Framing Lumber",
      "price": {
        "value": 8.50,
        "currency": "USD",
        "discount": 0.15,
        "retailPrice": 10.00,
        "savings": 1.50
      },
      "attributes": {
        "construction_phase": "foundation_framing",
        "quality_tier": "professional"
      },
      "inventory": {
        "qty": 1000,
        "inStock": true
      }
    }
  ]
}
```

**What Happened**:
1. ✅ Product matched `construction_phase = foundation_framing` (policy filter)
2. ✅ Product is in "US-Production-Builder" catalog view
3. ✅ Price returned from "Production-Builder" price book ($8.50)
4. ✅ Sarah sees 15% discount ($1.50 savings)

---

## Key Takeaways

1. **Same Product, Two Records** ✅
   - Adobe Commerce: Master record (source of truth)
   - ACO: Synced copy + enhancements

2. **All Custom Attributes Sync** ✅
   - `construction_phase`, `quality_tier`, etc.
   - These enable ACO policy filtering

3. **ACO Enhancements are Separate** ✅
   - Catalog Views, Policies, Price Books
   - Configured in ACO, NOT synced from Adobe Commerce

4. **Pricing is Layered** ✅
   - Base price in Adobe Commerce ($10.00)
   - Customer tier pricing in ACO ($8.50 for Production-Builder)
   - Volume tier pricing in ACO (additional discounts)

5. **Query-Time Magic** ✅
   - Customer attributes → Policy headers
   - Customer group → Price book
   - ACO filters and prices dynamically
   - Result: Personalized product data

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Related Documents**:
- `PRODUCT-RECORD-CREATION-FLOW.md`
- `PRODUCT-FLOW-ADOBE-COMMERCE-TO-ACO.md`
- `ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md`

