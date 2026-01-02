# Product Images: Convention-Based URL Strategy

**Status**: ✅ Implemented  
**Created**: December 17, 2025  
**Source of Truth**: Commerce Datapack  
**Migration Path**: AEM Assets (future)

---

## Overview

BuildRight uses a **convention-based URL strategy** for product images where the backend **always** returns an image URL based on the product SKU, regardless of whether the image file exists.

```
SKU: STR-49C283DE  →  Image URL: /images/products/STR-49C283DE.jpeg
SKU: ANY-SKU-HERE  →  Image URL: /images/products/ANY-SKU-HERE.jpeg
```

The frontend handles missing images gracefully with CSS placeholders (diagonal line pattern).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Source of Truth: Commerce Datapack                              │
│ buildright-data/generated/commerce/data/accs/                   │
│                                                                  │
│ accs_product_images_*.json files contain:                       │
│   - Product SKU                                                  │
│   - Base64-encoded image data                                   │
│   - MIME type (image/jpeg)                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: buildright-service/mesh/resolvers-src                  │
│                                                                  │
│ getProductImageUrl(sku, acoImageUrl)                            │
│   1. If ACO has image → return ACO URL (future: Commerce sync)  │
│   2. Otherwise → return `/images/products/${sku}.jpeg`          │
│                                                                  │
│ No hardcoded SKU lists! No mapping files!                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: buildright-eds/images/products/                       │
│                                                                  │
│ Images extracted from Commerce datapack:                        │
│ ├── STR-49C283DE.jpeg  ✅ 200 OK → Image displays               │
│ ├── FRA-1253AF84.jpeg  ✅ 200 OK → Image displays               │
│ ├── WIN-19BE7821.jpeg  ✅ 200 OK → Image displays               │
│ └── (33 images total)                                           │
│                                                                  │
│ Missing images (products without images in Commerce):           │
│ └── OTHER-SKU.jpeg     ❌ 404 → CSS placeholder shows           │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### Backend Behavior

**File**: `buildright-service/mesh/resolvers-src/utils/product-transforms.js`

```javascript
function getProductImageUrl(sku, acoImageUrl) {
  // Priority 1: Use ACO/Commerce image if available
  // (Future: when Commerce → ACO image sync is working)
  if (acoImageUrl && acoImageUrl.trim() !== '') {
    return acoImageUrl;
  }
  
  // Priority 2: Return local image path based on SKU convention
  // Commerce exports images as .jpeg (not .jpg)
  if (sku && sku.trim() !== '') {
    return '/images/products/' + sku + '.jpeg';
  }
  
  return null;
}
```

**GraphQL Response**:
```json
{
  "sku": "STR-49C283DE",
  "imageUrl": "/images/products/STR-49C283DE.jpeg"  // Always returned
}
```

### Frontend Behavior

**File**: `buildright-eds/blocks/product-grid/product-grid.js`

```javascript
const imageUrl = resolveImagePath(product.image || '');
if (imageUrl && imageUrl.trim() !== '') {
  // Test if image loads
  const testImg = new Image();
  testImg.onload = () => {
    // Image loaded - display it
    imageContainer.style.backgroundImage = `url('${imageUrl}')`;
  };
  testImg.onerror = () => {
    // Image 404 - show placeholder with diagonal lines
    imageContainer.classList.add('product-card-image-placeholder');
  };
  testImg.src = imageUrl;
}
```

**CSS**: `buildright-eds/blocks/product-grid/product-grid.css`

```css
.product-card-image {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Diagonal lines placeholder for missing images */
.product-card-image-placeholder::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  background: repeating-linear-gradient(
    45deg,
    var(--color-text-disabled),
    var(--color-text-disabled) 2px,
    transparent 2px,
    transparent 8px
  );
  opacity: 0.5;
  pointer-events: none;
}
```

---

## Current Image Coverage

**Source**: Commerce Datapack → Frontend

| Category | Sample SKUs | Images |
|----------|-------------|--------|
| Structural Materials (STR-*) | STR-49C283DE, STR-37E20863, STR-3BA0FC6D | 11 |
| Framing (FRA-*) | FRA-1253AF84, FRA-2CAEDBC2, FRA-DCC4E0D | 13 |
| Windows (WIN-*) | WIN-19BE7821, WIN-36ACE286, WIN-36ACE285 | 8 |
| Drywall (DRY-*) | DRY-44CFACB0 | 1 |
| **Total** | **33 products with images** | **33** |

**Images in buildright-eds/images/products/**:
```
STR-49C283DE.jpeg    FRA-1253AF84.jpeg    WIN-19BE7821.jpeg
STR-49C283DF.jpeg    FRA-2CAEDBC2.jpeg    WIN-36ACE286.jpeg
STR-49C283E0.jpeg    FRA-2CAEDBC3.jpeg    WIN-36ACE285.jpeg
STR-49C283E1.jpeg    FRA-2CAEDBD9.jpeg    WIN-36ACE284.jpeg
STR-49C283E2.jpeg    FRA-2CAEDBDA.jpeg    WIN-36ACE283.jpeg
STR-49C283E3.jpeg    FRA-2CAEDBDB.jpeg    WIN-19BE7822.jpeg
STR-37E20863.jpeg    FRA-2CAEDBDC.jpeg    WIN-19BE7823.jpeg
STR-37E20864.jpeg    FRA-DCC4E0D.jpeg     WIN-19BE7839.jpeg
STR-37E20865.jpeg    FRA-DCC4E0E.jpeg     DRY-44CFACB0.jpeg
STR-37E20866.jpeg    FRA-DCC4E0F.jpeg
STR-3BA0FC6D.jpeg    FRA-DCC4E10.jpeg
                     FRA-DCC4E11.jpeg
                     FRA-DCC4E12.jpeg
```

---

## Adding New Product Images

### Process

1. **Add image to Commerce**: Use Commerce Admin to upload product images to Media Gallery
2. **Export Commerce data**: Run the commerce-demo-ingestion export
   ```bash
   cd buildright-data
   npm run export:commerce
   ```
3. **Extract to frontend**: Run the image sync script
   ```bash
   cd buildright-eds
   npm run sync:images
   ```
4. **Deploy frontend**: Push to repository
5. **Done!** No backend changes needed

### Image Extraction Script

**File**: `buildright-eds/scripts/extract-commerce-images.js`

This script:
- Reads Commerce datapack files (`accs_product_images_*.json`)
- Decodes base64-encoded image data
- Saves images as `.jpeg` files with SKU as filename
- Overwrites existing images to ensure sync with Commerce

**Usage**:
```bash
./scripts/sync-product-images.sh
```

---

## Why Convention-Based?

### ✅ Advantages

1. **Commerce is source of truth**: All product data (including images) comes from Commerce
2. **Simplicity**: No mapping files, no hardcoded lists, no complex backend logic
3. **Flexibility**: Add images via Commerce Admin, export, and sync
4. **Scalability**: Works for any number of products (1 or 10,000)
5. **Future-proof**: Easy migration to AEM Assets (just change URL prefix)
6. **Graceful degradation**: Missing images don't break the UI

### ⚠️ Trade-offs

1. **404 Requests**: Products without images generate 404s (harmless, cached)
2. **Console Noise**: Dev console shows 404 warnings (doesn't affect users)
3. **Bandwidth**: ~1 KB per missing image on first load (one-time)

### Real-World Precedent

This pattern is used by major platforms:
- **GitHub**: User avatars (`avatars.githubusercontent.com/u/{id}`)
- **Twitter**: Profile images (with fallback)
- **NPM**: Package icons
- **Gravatar**: Email-based avatars

---

## Migration to AEM Assets

When AEM Assets is ready, update one function:

```javascript
// buildright-service/mesh/resolvers-src/utils/product-transforms.js
function getProductImageUrl(sku, acoImageUrl) {
  // Priority 1: ACO/Commerce (now includes AEM Assets URLs)
  if (acoImageUrl && acoImageUrl.trim() !== '') {
    return acoImageUrl;
  }
  
  // Priority 2: AEM Assets convention-based URL
  if (sku && sku.trim() !== '') {
    return `https://delivery.adobeassets.com/dm/buildright/products/${sku}?width=400&format=webp`;
  }
  
  return null;
}
```

**No frontend changes needed!** The convention stays the same.

---

## Testing

### Verify Images in Frontend

```bash
cd buildright-eds
ls -l images/products/*.jpeg | wc -l
# Should show 33
```

### Check Frontend in Browser

1. Open http://localhost:4001/catalog
2. Search for **"STR-"** or **"FRA-"** or **"WIN-"** to see products with images
3. **Products with images**: Should display product photos
4. **Products without images**: Should show diagonal line placeholder
5. **Browser console**: May show 404 warnings (expected, harmless)

### Quick Test SKUs

Search these in the catalog to see images:
- **STR-49C283DE** - Structural material
- **FRA-1253AF84** - Framing
- **WIN-19BE7821** - Window

---

## Troubleshooting

### Images Not Displaying

**Check 1: Image exists in frontend**
```bash
ls buildright-eds/images/products/STR-49C283DE.jpeg
```

**Check 2: File extension is .jpeg (not .jpg)**
Commerce exports images as `.jpeg`. The backend returns `.jpeg` URLs.

**Check 3: Browser network tab**
- 200 OK → Image should display
- 404 Not Found → Placeholder should display
- CORS error → Check server configuration

### Placeholder Not Showing

**Check JavaScript is adding the class**:
```javascript
// Should add class on image error
imageContainer.classList.add('product-card-image-placeholder');
```

**Verify CSS is loaded**:
```css
.product-card-image-placeholder::before {
  background: repeating-linear-gradient(...);
}
```

---

## References

- **Image source**: Commerce Datapack (`buildright-data/generated/commerce/data/accs/`)
- **Extraction script**: `buildright-eds/scripts/extract-commerce-images.js`
- **Sync script**: `buildright-eds/scripts/sync-product-images.sh`
- **Backend transform**: `buildright-service/mesh/resolvers-src/utils/product-transforms.js`
- **Frontend handling**: `buildright-eds/blocks/product-grid/product-grid.js`
- **CSS placeholder**: `buildright-eds/blocks/product-grid/product-grid.css`

---

**Last Updated**: December 17, 2025  
**Status**: ✅ Implemented - Commerce is source of truth, convention-based URLs active

