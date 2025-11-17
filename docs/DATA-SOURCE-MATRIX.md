# Data Source Matrix: Adobe Commerce PaaS vs. ACO

## Overview

This document clarifies which data is created in **Adobe Commerce PaaS** (and syncs to ACO) vs. which data is **ACO-only** (created directly in ACO).

**Key Insight**: Not all data flows from Commerce → ACO. Some ACO features (Price Books, Policies, Catalog Views) are **ACO-only** and must be configured directly in ACO.

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADOBE COMMERCE PaaS                          │
│                    (Source of Truth)                            │
│                                                                 │
│  ✅ Products (SKU, name, description, type)                    │
│  ✅ Attributes (all custom attributes)                         │
│  ✅ Base Prices (retail prices)                                │
│  ✅ Categories (category tree)                                 │
│  ✅ Images (product images)                                    │
│  ✅ Inventory (stock quantities)                               │
│  ✅ Customer Groups (for pricing rules)                        │
│  ✅ Customer Accounts (demo personas)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ SaaS Data Export
                            │ (Automatic Sync)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ADOBE COMMERCE OPTIMIZER (ACO)               │
│                    (Enhancement Layer)                          │
│                                                                 │
│  ✅ Synced Product Data (read-only)                            │
│  ✅ Synced Attributes (read-only)                              │
│  ✅ Synced Base Prices (read-only)                             │
│  ✅ Synced Categories (read-only)                              │
│                                                                 │
│  ➕ Price Books (ACO-ONLY, not synced)                         │
│  ➕ Policies (ACO-ONLY, not synced)                            │
│  ➕ Catalog Views (ACO-ONLY, not synced)                       │
│  ➕ Multi-Source Inventory (ACO-ONLY, not synced)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Data Matrix

| Data Type | Created In | Synced? | Script Location | API Used | Notes |
|-----------|-----------|---------|-----------------|----------|-------|
| **PRODUCTS** |
| Simple Products | Commerce PaaS | ✅ Yes | `create-products-commerce.js` | Commerce REST API | 70 products |
| Configurable Products | Commerce PaaS | ✅ Yes | `create-variants-commerce.js` | Commerce REST API | 20 configurables |
| Variant Products | Commerce PaaS | ✅ Yes | `create-variants-commerce.js` | Commerce REST API | 72 variants |
| Bundle Products | Commerce PaaS | ✅ Yes | `create-bundles-commerce.js` | Commerce REST API | 15 bundles |
| **ATTRIBUTES** |
| Custom Attributes | Commerce PaaS | ✅ Yes | `register-attributes-commerce.js` | Commerce REST API | 20 attributes |
| Attribute Values | Commerce PaaS | ✅ Yes | Part of product creation | Commerce REST API | All persona attributes |
| **PRICING** |
| Base Prices | Commerce PaaS | ✅ Yes | Part of product creation | Commerce REST API | Retail prices |
| Customer Group Discounts | Commerce PaaS | ❌ No | Manual in Admin UI | N/A | Catalog Price Rules |
| **Price Books** | **ACO ONLY** | ❌ No | `generate-price-books.js` + Manual | **ACO API** | **5 price books** |
| Price Book Entries | **ACO ONLY** | ❌ No | `ingest-prices.js` | **ACO API** | **850+ prices** |
| Volume Tier Pricing | **ACO ONLY** | ❌ No | Manual in ACO Admin UI | N/A | **3 tiers** |
| **POLICIES** |
| Policy Definitions | **ACO ONLY** | ❌ No | `generate-policy-guide.js` + Manual | **ACO Admin UI** | **28 policies** |
| Policy Triggers | **ACO ONLY** | ❌ No | Manual in ACO Admin UI | N/A | Attribute-based |
| **CATALOG VIEWS** |
| Catalog View Definitions | **ACO ONLY** | ❌ No | Manual in ACO Admin UI | N/A | Per persona |
| Product Assignments | **ACO ONLY** | ❌ No | Manual in ACO Admin UI | N/A | Policy-based |
| **INVENTORY** |
| Single-Source Inventory | Commerce PaaS | ✅ Yes | Part of product creation | Commerce REST API | Default stock |
| Multi-Source Inventory (MSI) | Commerce PaaS | ✅ Yes | `create-inventory-sources-commerce.js` | Commerce REST API | 3 warehouses |
| **CATEGORIES** |
| Category Tree | Commerce PaaS | ✅ Yes | `create-categories-commerce.js` | Commerce REST API | Full tree |
| **CUSTOMERS** |
| Customer Accounts | Commerce PaaS | ❌ No | `create-customers-commerce.js` | Commerce REST API | 5 personas |
| Customer Groups | Commerce PaaS | ❌ No | Manual in Admin UI | N/A | 5 groups |
| Customer Attributes | Commerce PaaS | ❌ No | `register-customer-attributes-commerce.js` | Commerce REST API | Business attributes |

---

## ACO-Only Data (Does Not Sync from Commerce)

### 1. Price Books ⚠️ **ACO-ONLY**

**What They Are**:
- Named collections of prices for specific customer segments
- Hierarchical (can inherit from parent price books)
- Support customer group mapping

**Why ACO-Only**:
- Adobe Commerce PaaS doesn't have a "price book" concept
- Commerce uses "Catalog Price Rules" instead
- ACO Price Books are a CCDM feature

**How to Create**:
```bash
# Step 1: Generate price book definitions (local JSON)
cd buildright-aco
npm run generate:price-books

# Step 2: Ingest to ACO via ACO API
npm run ingest:price-books

# Step 3: Generate price entries for each book
npm run generate:prices

# Step 4: Ingest prices to ACO via ACO API
npm run ingest:prices
```

**Scripts Needed**:
- ✅ `generate-price-books.js` - Already exists
- ✅ `ingest-price-books.js` - Already exists
- ✅ `generate-prices-simple.js` - Already exists
- ✅ `ingest-prices.js` - Already exists

**API Used**: ACO Data Ingestion API (NOT Commerce REST API)

---

### 2. Policies ⚠️ **ACO-ONLY**

**What They Are**:
- Rules that filter products based on attribute values
- Triggered by customer context (e.g., `construction_phase=foundation_framing`)
- Enable progressive catalog disclosure

**Why ACO-Only**:
- Policies are a core CCDM feature
- No equivalent in Adobe Commerce PaaS
- Configured in ACO Admin UI

**How to Create**:
```bash
# Step 1: Generate policy setup guide (documentation)
cd buildright-aco
npm run generate:policy-guide

# Step 2: Manual configuration in ACO Admin UI
# Follow: data/buildright/POLICY-SETUP-GUIDE.md
# Create 28 policies manually
```

**Scripts Needed**:
- ✅ `generate-policy-guide.js` - Already exists (generates documentation)
- ❌ No ingestion script (manual UI configuration only)

**API Used**: ACO Admin UI (no API for policy creation)

---

### 3. Catalog Views ⚠️ **ACO-ONLY**

**What They Are**:
- Named product assortments for specific distribution channels
- Each catalog view has its own product visibility rules
- Can be mapped to customer groups

**Why ACO-Only**:
- Catalog Views are a CCDM feature
- Adobe Commerce has "Store Views" but they're different
- ACO Catalog Views are more flexible

**How to Create**:
```bash
# Manual configuration in ACO Admin UI
# No script available
```

**Scripts Needed**:
- ❌ No script (manual UI configuration only)

**API Used**: ACO Admin UI

---

### 4. Volume Tier Pricing ⚠️ **ACO-ONLY**

**What It Is**:
- Quantity-based discounts (e.g., 100-293 units = 3% off)
- Stacks with customer tier pricing
- Configured per price book

**Why ACO-Only**:
- Adobe Commerce has "Tier Pricing" but it's product-specific
- ACO Volume Tiers apply across entire price books
- More flexible for B2B scenarios

**How to Create**:
```bash
# Manual configuration in ACO Admin UI
# Configure for each price book
```

**Scripts Needed**:
- ❌ No script (manual UI configuration only)

**API Used**: ACO Admin UI

---

## Updated Script Strategy

### Scripts That Target Adobe Commerce PaaS ✅ **NEW**

These scripts create data in Commerce (which syncs to ACO):

1. **`register-attributes-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: 20 custom attributes
   - Syncs to ACO: Yes (automatic)

2. **`create-products-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: 70 simple products
   - Syncs to ACO: Yes (automatic)

3. **`create-variants-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: 92 variant products
   - Syncs to ACO: Yes (automatic)

4. **`create-bundles-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: 15 bundle products
   - Syncs to ACO: Yes (automatic)

5. **`create-categories-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: Category tree
   - Syncs to ACO: Yes (automatic)

6. **`create-customers-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: 5 demo customer accounts
   - Syncs to ACO: No (customers don't sync)

7. **`register-customer-attributes-commerce.js`** ✅ NEW
   - Target: Adobe Commerce REST API
   - Creates: Customer attributes (business_type, etc.)
   - Syncs to ACO: No (customer data doesn't sync)

---

### Scripts That Target ACO Directly ✅ **KEEP**

These scripts create ACO-only data:

1. **`generate-price-books.js`** ✅ KEEP
   - Target: Local JSON generation
   - Creates: 5 price book definitions

2. **`ingest-price-books.js`** ✅ KEEP
   - Target: ACO Data Ingestion API
   - Creates: 5 price books in ACO
   - Does NOT sync from Commerce

3. **`generate-prices-simple.js`** ✅ KEEP
   - Target: Local JSON generation
   - Creates: 850+ price entries

4. **`ingest-prices.js`** ✅ KEEP
   - Target: ACO Data Ingestion API
   - Creates: Price entries in ACO
   - Does NOT sync from Commerce

5. **`generate-policy-guide.js`** ✅ KEEP
   - Target: Local markdown generation
   - Creates: Documentation for manual policy setup

6. **`generate-inventory.js`** ❌ REMOVE/REPLACE
   - Replaced by: `create-inventory-sources-commerce.js`
   - Reason: Using Commerce MSI (Multi-Source Inventory) extension
   - Inventory sources and quantities created in Commerce, sync to ACO

---

### Scripts That Are Obsolete ❌ **REMOVE**

These scripts are no longer needed:

1. **`ingest-products.js`** ❌ REMOVE
   - Replaced by: `create-products-commerce.js`
   - Reason: Products now created in Commerce, not ACO

2. **`ingest-variants.js`** ❌ REMOVE
   - Replaced by: `create-variants-commerce.js`
   - Reason: Variants now created in Commerce, not ACO

3. **`ingest-bundles.js`** ❌ REMOVE
   - Replaced by: `create-bundles-commerce.js`
   - Reason: Bundles now created in Commerce, not ACO

---

## Complete Phase 8 Flow (Updated)

### Step 1: Create in Adobe Commerce PaaS

```bash
cd buildright-aco

# 1. Register attributes
npm run commerce:register-attributes

# 2. Create categories
npm run commerce:create-categories

# 3. Create products
npm run commerce:create-products      # 70 simple
npm run commerce:create-variants      # 92 variants
npm run commerce:create-bundles       # 15 bundles

# 4. Create customers
npm run commerce:create-customers     # 5 personas
```

**Result**: 177 products, 20 attributes, 5 customers in Adobe Commerce PaaS

---

### Step 2: Trigger Sync to ACO

```bash
# Trigger SaaS Data Export
./scripts/trigger-sync.sh

# This syncs:
# ✅ Products (177)
# ✅ Attributes (20)
# ✅ Base prices (177)
# ✅ Categories
# ❌ NOT price books
# ❌ NOT policies
# ❌ NOT customer data
```

**Result**: Products and attributes now in ACO

---

### Step 3: Create ACO-Only Data

```bash
# 1. Generate and ingest price books
npm run generate:price-books
npm run ingest:price-books

# 2. Generate and ingest prices
npm run generate:prices
npm run ingest:prices

# 3. Generate policy guide (manual setup)
npm run generate:policy-guide
# Then manually configure 28 policies in ACO Admin UI
```

**Result**: Price books, prices, and policies in ACO

---

### Step 4: Manual ACO Configuration

**In ACO Admin UI**:
1. Create 28 policies (follow `POLICY-SETUP-GUIDE.md`)
2. Configure volume tier pricing (3 tiers)
3. Create catalog views (per persona)
4. Map price books to customer groups

**Result**: Complete ACO CCDM configuration

---

## Summary: What Reaches Outside Commerce PaaS?

### ✅ YES - These Scripts Reach Outside Commerce PaaS

| Script | Target | Purpose |
|--------|--------|---------|
| `generate-price-books.js` | Local JSON | Generate price book definitions |
| `ingest-price-books.js` | **ACO API** | Create price books in ACO |
| `generate-prices-simple.js` | Local JSON | Generate price entries |
| `ingest-prices.js` | **ACO API** | Create prices in ACO |
| `generate-policy-guide.js` | Local Markdown | Generate policy documentation |
| Manual ACO Admin UI | **ACO Admin UI** | Configure policies, catalog views, volume tiers |

### ❌ NO - These Scripts Do NOT Reach Outside Commerce PaaS

| Script | Target | Purpose |
|--------|--------|---------|
| `register-attributes-commerce.js` | Commerce REST API | Register attributes |
| `create-products-commerce.js` | Commerce REST API | Create products |
| `create-variants-commerce.js` | Commerce REST API | Create variants |
| `create-bundles-commerce.js` | Commerce REST API | Create bundles |
| `create-categories-commerce.js` | Commerce REST API | Create categories |
| `create-customers-commerce.js` | Commerce REST API | Create customers |

---

## Answer to Your Question

**Question**: "Does our new approach address the fact that we may have ACO generation scripts that reach outside the Adobe Commerce PaaS backend?"

**Answer**: **YES**, but we need to keep some ACO-specific scripts:

### ✅ What We Fixed
- Products, attributes, categories, and base prices now created in **Commerce PaaS** (correct)
- These automatically sync to ACO (correct)
- No more direct product ingestion to ACO (correct)

### ✅ What We Still Need (ACO-Only)
- **Price Books**: Must be created directly in ACO via ACO API
  - Scripts: `generate-price-books.js`, `ingest-price-books.js` ✅ KEEP
- **Price Entries**: Must be created directly in ACO via ACO API
  - Scripts: `generate-prices-simple.js`, `ingest-prices.js` ✅ KEEP
- **Policies**: Must be configured manually in ACO Admin UI
  - Scripts: `generate-policy-guide.js` ✅ KEEP (generates docs)
- **Catalog Views**: Must be configured manually in ACO Admin UI
- **Volume Tiers**: Must be configured manually in ACO Admin UI

### ❌ What We Remove
- Direct product ingestion to ACO
  - Scripts: `ingest-products.js`, `ingest-variants.js`, `ingest-bundles.js` ❌ REMOVE

---

## Recommendation

**Keep the ACO-specific scripts** because:

1. **Price Books are ACO-only** - No equivalent in Commerce PaaS
2. **Policies are ACO-only** - Core CCDM feature
3. **Volume Tiers are ACO-only** - More flexible than Commerce Tier Pricing
4. **These features don't sync** - Must be created directly in ACO

**The new approach is correct**: Products come from Commerce, but ACO enhancements (price books, policies) are created directly in ACO.

---

**Status**: ✅ Approach is correct  
**Action Required**: Keep ACO-specific scripts for price books, prices, and policy documentation

**Last Updated**: January 17, 2025

