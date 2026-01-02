# Product Images: Standardized Flow Implementation

**Date**: December 17, 2025  
**Status**: ✅ Implemented  
**Related**: [product-images-convention.md](./product-images-convention.md)

---

## What Changed

### **Problem**
Image extraction logic was in the **wrong repository** (buildright-eds), breaking the standardized data flow pattern used by all other data types.

### **Solution**
Moved image extraction to **commerce-demo-generator** where it belongs, making images follow the same flow as products, categories, customers, etc.

---

## Before vs. After

### **Before (Inconsistent)** ❌

```
buildright-data
└── generated/commerce/data/accs/accs_product_images_*.json (base64)
                              ↓
                    [Manual step in frontend]
                              ↓
buildright-eds/scripts/extract-commerce-images.js
  • Reads JSON files
  • Decodes base64
  • Writes .jpeg files
                              ↓
buildright-eds/images/products/*.jpeg
```

**Problems**:
- ❌ Extraction logic in consuming repository
- ❌ Manual step required after every data update
- ❌ Inconsistent with all other data flows
- ❌ Extraction script in wrong repo

---

### **After (Standardized)** ✅

```
buildright-data/definitions/media/images/products/*.jpg (source)
                              ↓
commerce-demo-generator
  • Reads source images
  • Generates JSON (base64 for Commerce import)
  • ⭐ Extracts images to media/images/products/ (NEW)
                              ↓
buildright-data
├── generated/commerce/data/accs/accs_product_images_*.json (for Commerce)
└── media/images/products/*.jpeg                             (for frontend)
                              ↓
buildright-eds/scripts/sync-product-images.sh
  • Simple rsync from buildright-data
                              ↓
buildright-eds/images/products/*.jpeg
```

**Benefits**:
- ✅ Extraction happens during generation (automatic)
- ✅ Consistent with products, categories, customers
- ✅ Frontend just syncs files (no transformation)
- ✅ Single command to regenerate everything

---

## Changes Made

### **1. commerce-demo-generator** (New Logic) ⭐

**File**: `generators/generate-commerce.js`

**Added function**:
```javascript
/**
 * Extract product images from generated JSON to media/images/products/
 * This provides a source for frontend image syncing
 */
function extractProductImagesToMedia(productImages, outputMediaPath) {
  ensureDir(outputMediaPath);
  let extractedCount = 0;
  
  for (const item of productImages) {
    const sku = item.product.sku;
    const entries = item.product.media_gallery_entries || [];
    
    for (const entry of entries) {
      if (entry.content?.base64_encoded_data) {
        const buffer = Buffer.from(entry.content.base64_encoded_data, 'base64');
        const mimeType = entry.content.type || 'image/jpeg';
        const ext = mimeType.split('/')[1] || 'jpeg';
        const outputFile = join(outputMediaPath, `${sku}.${ext}`);
        
        writeFileSync(outputFile, buffer);
        extractedCount++;
      }
    }
  }
  
  return extractedCount;
}
```

**Called during generation**:
```javascript
// Generate product images JSON
const productImages = generateProductImagesJson(allProducts);

// Write JSON files (for Commerce import)
imageChunks.forEach((chunk, index) => {
  writeFileSync(join(DATA_DIR, `accs_product_images_${index+1}.json`), ...);
});

// Copy to media/catalog/product (for Commerce import)
const copiedImages = copyProductImages(MEDIA_DIR);

// ⭐ NEW: Extract to media/images/products/ (for frontend sync)
const frontendMediaPath = join(PROJECT_CONFIG.paths.media, 'images/products');
const extractedImages = extractProductImagesToMedia(productImages, frontendMediaPath);
```

---

### **2. buildright-eds** (Simplified) ⭐

**File**: `scripts/sync-product-images.sh`

**Before** (extraction + sync):
```bash
# Run Node.js script to extract from JSON
node scripts/extract-commerce-images.js
```

**After** (just sync):
```bash
# Simple rsync from buildright-data
rsync -av --delete \
  --include="*.jpg" \
  --include="*.jpeg" \
  --include="*.png" \
  --exclude="*" \
  "$DATA_REPO_IMAGES/" "$DEST_DIR/"
```

**Deleted**:
- ❌ `scripts/extract-commerce-images.js` (no longer needed)

---

### **3. buildright-data** (Output) ⭐

**New output location**:
```
buildright-data/
├── generated/
│   └── commerce/
│       ├── data/accs/accs_product_images_*.json (for Commerce import)
│       └── media/catalog/product/...            (for Commerce import)
└── media/
    └── images/
        └── products/                             ⭐ NEW
            ├── STR-49C283DE.jpeg                 (extracted from JSON)
            ├── FRA-1253AF84.jpeg
            └── ...
```

---

## Standardized Flow

### **All Data Types Follow Same Pattern**

| Data Type | Source | Generator | Output | Ingestion | Frontend |
|-----------|--------|-----------|--------|-----------|----------|
| **Products** | `definitions/products/` | commerce-demo-generator | `generated/commerce/accs_products.json` | commerce-demo-ingestion | API query |
| **Categories** | `definitions/categories/` | commerce-demo-generator | `generated/commerce/accs_categories.json` | commerce-demo-ingestion | API query |
| **Customers** | `definitions/customers/` | commerce-demo-generator | `generated/commerce/accs_customers.json` | commerce-demo-ingestion | API query |
| **Images** ⭐ | `media/images/products/` | commerce-demo-generator | `media/images/products/*.jpeg` | (sync via rsync) | File serving |

**All data**:
1. ✅ Defined in buildright-data
2. ✅ Generated by commerce-demo-generator
3. ✅ Consumed by buildright-eds/buildright-service

---

## Usage

### **Regenerating Everything**

```bash
# 1. Generate datapacks (includes image extraction)
cd commerce-demo-generator
npm run generate:all

# Output:
# ✔ Generated 33 images (33 for Commerce, 33 for frontend, 7 files)
```

### **Syncing Images to Frontend**

```bash
# 2. Sync to frontend (simple rsync)
cd buildright-eds
npm run sync:images

# Output:
# Images in buildright-data: 33
# Images in buildright-eds (after): 33
# ✅ Sync complete!
```

### **Full Workflow**

```bash
# 1. Edit source data
cd buildright-data
vim definitions/products/catalog.json

# 2. Regenerate datapacks
cd ../commerce-demo-generator
npm run generate:all  # ← Images extracted automatically

# 3. Import to Commerce/ACO
cd ../commerce-demo-ingestion
npm run import:all

# 4. Sync images to frontend
cd ../buildright-eds
npm run sync:images  # ← Simple copy

# 5. Deploy frontend
# Done!
```

---

## Testing

### **Test 1: Verify Extraction During Generation**

```bash
cd commerce-demo-generator
npm run generate:commerce

# Expected output:
# ✔ Generated 33 images (33 for Commerce, 33 for frontend, 7 files)

# Verify files exist:
ls -l ../buildright-data/media/images/products/*.jpeg | wc -l
# Expected: 33
```

### **Test 2: Verify Frontend Sync**

```bash
cd buildright-eds
npm run sync:images

# Expected output:
# Images in buildright-data: 33
# Images in buildright-eds (after): 33
# ✅ Sync complete!

# Verify files:
ls -l images/products/*.jpeg | wc -l
# Expected: 33
```

### **Test 3: Verify Image URLs**

```bash
# Start frontend
cd buildright-eds
npm start

# Open http://localhost:4001/catalog
# Search for "STR-49C283DE"
# Expected: Image displays (not placeholder)
```

---

## Benefits

### **1. Consistency**
- Images follow the same flow as all other data
- No special-case logic needed

### **2. Automation**
- Image extraction happens automatically during generation
- No manual scripts to run

### **3. Maintainability**
- Extraction logic in one place (generator)
- Frontend has no transformation logic

### **4. Reproducibility**
- Extracted images are in buildright-data
- Easy to regenerate from source

### **5. Simplicity**
- Frontend just syncs files (rsync)
- Clear separation of concerns

---

## Architecture Alignment

### **Repository Responsibilities**

| Repository | Role | Images |
|------------|------|--------|
| **buildright-data** | Storage | ✅ Stores source images<br>✅ Stores extracted images |
| **commerce-demo-generator** | Transformation | ✅ Extracts images from JSON<br>✅ Writes to buildright-data |
| **commerce-demo-ingestion** | Import | ✅ Imports images to Commerce |
| **buildright-eds** | Presentation | ✅ Syncs images from buildright-data<br>✅ Serves images to users |
| **buildright-service** | API | ✅ Returns image URLs (convention-based) |

**Every repo has a clear, single responsibility for images.**

---

## Related Documentation

- **Standardized flow**: `buildright-data/docs/STANDARDIZED-DATA-FLOW.md`
- **Image convention**: `buildright-eds/docs/implementation/PRODUCT-IMAGES-CONVENTION.md`
- **Implementation summary**: `buildright-eds/docs/implementation/PRODUCT-IMAGES-IMPLEMENTATION-SUMMARY.md`
- **Generator**: `commerce-demo-generator/README.md`

---

**Last Updated**: December 17, 2025  
**Status**: ✅ Fully Implemented - Images now follow standardized flow


