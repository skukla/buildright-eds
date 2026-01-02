# Product Images Implementation Summary

**Date**: December 17, 2025  
**Status**: ✅ Complete  
**Strategy**: Convention-Based URLs  
**Source of Truth**: Commerce Datapack

---

## What Was Implemented

### ✅ Convention-Based Image URLs

**Commerce is the source of truth** for all product data and images.

**Backend returns image URL for every product** based on SKU:
```javascript
SKU: "STR-49C283DE" → Image URL: "/images/products/STR-49C283DE.jpeg"
SKU: "ANY-SKU" → Image URL: "/images/products/ANY-SKU.jpeg"
```

**Frontend handles missing images** with CSS placeholder (diagonal lines pattern).

---

## Changes Made

### 1. Backend: buildright-service

**File**: `mesh/resolvers-src/utils/product-transforms.js`

**Updated `getProductImageUrl()` function**:
- ✅ Returns `/images/products/{SKU}.jpeg` (Commerce images use .jpeg)
- ✅ Works for ALL products (no code changes needed to add images)
- ✅ Prioritizes ACO/Commerce images when available (future: AEM Assets)
- ✅ No hardcoded lists, no mapping files

**GraphQL Response**:
```json
{
  "sku": "STR-49C283DE",
  "imageUrl": "/images/products/STR-49C283DE.jpeg"
}
```

**Mesh deployed**: December 17, 2025

---

### 2. Frontend: buildright-eds

**Extracted 33 product images** from Commerce datapack:
```bash
Source: buildright-data/generated/commerce/data/accs/accs_product_images_*.json
Destination: buildright-eds/images/products/
Format: JPEG (.jpeg) - Commerce export format
Count: 33 images
```

**Image coverage**: 33 out of 281 products (11.7%)

**CSS placeholder** with diagonal lines:
```css
.product-card-image-placeholder::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 70%;
  background: repeating-linear-gradient(45deg, ...);
  opacity: 0.5;
}
```

**JavaScript**: Detects image 404s and adds placeholder class dynamically

---

### 3. Image Extraction & Sync Scripts

**File**: `scripts/extract-commerce-images.js`

**Purpose**: Extract images from Commerce datapack (base64-encoded) and save as .jpeg files

**File**: `scripts/sync-product-images.sh`

**Usage**:
```bash
cd buildright-eds
./scripts/sync-product-images.sh
```

**Purpose**: Wrapper script to run extraction process

---

## How It Works

### Adding New Product Images

**Process**:
1. **Add image to Commerce**: Upload product image in Commerce Admin
2. **Export Commerce data**:
   ```bash
   cd buildright-data
   npm run export:commerce
   ```
3. **Extract to frontend**:
   ```bash
   cd buildright-eds
   npm run sync:images
   ```
4. **Deploy frontend**
5. **Done!** No backend code changes needed

### Network Behavior

**First page load** (catalog with 48 products):
- Products with images: **200 OK** → Image displays
- Products without images: **404** → CSS placeholder shows diagonal lines
- Performance impact: ~200ms one-time (404s are cached)

**Second page load**:
- All images cached (304 Not Modified)
- No 404 requests (browser cached the 404)

---

## Current Image List (33 images)

**Structural Materials (STR-*) - 11 images**:
```
STR-49C283DE.jpeg  STR-49C283DF.jpeg  STR-49C283E0.jpeg  STR-49C283E1.jpeg
STR-49C283E2.jpeg  STR-49C283E3.jpeg  STR-37E20863.jpeg  STR-37E20864.jpeg
STR-37E20865.jpeg  STR-37E20866.jpeg  STR-3BA0FC6D.jpeg
```

**Framing (FRA-*) - 13 images**:
```
FRA-1253AF84.jpeg  FRA-2CAEDBC2.jpeg  FRA-2CAEDBC3.jpeg  FRA-2CAEDBD9.jpeg
FRA-2CAEDBDA.jpeg  FRA-2CAEDBDB.jpeg  FRA-2CAEDBDC.jpeg  FRA-DCC4E0D.jpeg
FRA-DCC4E0E.jpeg   FRA-DCC4E0F.jpeg   FRA-DCC4E10.jpeg   FRA-DCC4E11.jpeg
FRA-DCC4E12.jpeg
```

**Windows (WIN-*) - 8 images**:
```
WIN-19BE7821.jpeg  WIN-36ACE286.jpeg  WIN-36ACE285.jpeg  WIN-36ACE284.jpeg
WIN-36ACE283.jpeg  WIN-19BE7822.jpeg  WIN-19BE7823.jpeg  WIN-19BE7839.jpeg
```

**Drywall (DRY-*) - 1 image**:
```
DRY-44CFACB0.jpeg
```

---

## Testing

### Verify Images Extracted from Commerce

```bash
cd buildright-eds
ls -l images/products/*.jpeg | wc -l
# Expected: 33
```

### Verify Frontend Displays Images

1. Open http://localhost:4001/catalog
2. Search for **"STR-"** to see structural materials with images
3. Search for **"FRA-"** to see framing products with images
4. Search for **"WIN-"** to see windows with images
5. **Products with images**: Should display photos
6. **Products without images**: Should show diagonal line placeholder
7. **Browser console**: May show 404 warnings (expected, harmless)

### Quick Test SKUs

Search these in the catalog to verify images load:
- **STR-49C283DE** - Structural material
- **FRA-1253AF84** - Framing
- **WIN-19BE7821** - Window

---

## Data Flow

```
┌────────────────────────────────────────────────┐
│ 1. Commerce Admin                              │
│    Upload product images to Media Gallery      │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│ 2. Commerce Export (buildright-data)           │
│    npm run export:commerce                     │
│    → accs_product_images_*.json                │
│    → Contains base64-encoded images            │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│ 3. Image Extraction (buildright-eds)           │
│    ./scripts/sync-product-images.sh            │
│    → Decodes base64                            │
│    → Saves as {SKU}.jpeg                       │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│ 4. Frontend Serving                            │
│    /images/products/{SKU}.jpeg                 │
│    → 200 OK: Display image                     │
│    → 404: Show diagonal placeholder            │
└────────────────────────────────────────────────┘
```

---

## Migration to AEM Assets (Future)

When ready, update **one function** in backend:

```javascript
// buildright-service/mesh/resolvers-src/utils/product-transforms.js
function getProductImageUrl(sku, acoImageUrl) {
  if (acoImageUrl && acoImageUrl.trim() !== '') {
    return acoImageUrl;  // ACO now returns AEM Assets URLs
  }
  
  // Fallback to AEM Assets convention
  if (sku && sku.trim() !== '') {
    return `https://delivery.adobeassets.com/dm/buildright/products/${sku}?width=400&format=webp`;
  }
  
  return null;
}
```

**No frontend changes needed!**

---

## Why Convention-Based?

### ✅ Advantages

1. **Commerce is source of truth**: All product data centralized
2. **Simple**: No mapping files, no hardcoded lists
3. **Scalable**: Works for 1 or 10,000 products
4. **Flexible**: Add images via Commerce Admin
5. **Future-proof**: Easy migration to AEM Assets
6. **Graceful degradation**: Missing images don't break UI

### ⚠️ Trade-offs

1. **404 Requests**: Products without images generate 404s (cached, harmless)
2. **Console Noise**: Dev console shows warnings (doesn't affect users)
3. **Extraction step**: Need to run sync script after Commerce export

---

## Documentation

- **Architecture**: [PRODUCT-IMAGES-CONVENTION.md](./PRODUCT-IMAGES-CONVENTION.md)
- **Image source**: Commerce Datapack (`buildright-data/generated/commerce/data/accs/`)
- **Extraction script**: `buildright-eds/scripts/extract-commerce-images.js`
- **Sync script**: `buildright-eds/scripts/sync-product-images.sh`

---

## Summary

✅ **Commerce**: Source of truth for all product data and images  
✅ **Backend**: Returns `/images/products/{SKU}.jpeg` for all products  
✅ **Frontend**: 33 images extracted from Commerce datapack  
✅ **CSS**: Diagonal lines placeholder for missing images  
✅ **Sync script**: Extract images from Commerce export  
✅ **Migration path**: Ready for AEM Assets (one function change)

**Status**: ✅ Fully operational

