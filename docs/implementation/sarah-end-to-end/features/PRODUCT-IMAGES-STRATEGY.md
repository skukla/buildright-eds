# Product Images Strategy for ACO Integration

**Status**: ✅ Implemented (Data-Driven)  
**Created**: December 8, 2025  
**Related**: [Catalog Service Architecture](./CATALOG-SERVICE-ARCHITECTURE.md) | [Phase 6A Integration Plan](./PHASE-6A-INTEGRATION-PLAN.md)

---

## Executive Summary

Adobe provides **three primary approaches** for managing product images in Commerce + ACO environments:

| Approach | Source | Best For | Complexity |
|----------|--------|----------|------------|
| **Commerce Media Gallery** | Adobe Commerce backend | Simple setups, small catalogs | Low |
| **AEM Assets Integration** | AEM Assets as a Service | Enterprise, multi-channel | Medium |
| **External DAM/CDN** | Custom URL attributes | Existing DAM, flexibility | Low |

**Implementation**: We use a **data-driven approach** where image URLs are stored in JSON data files. To migrate to AEM Assets, simply update the URLs in the data files—no code changes needed.

```
Demo:       data/templates.json → Unsplash URLs
Production: data/templates.json → AEM Assets URLs
```

---

## Implementation: Data-Driven Images

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    buildright-eds Frontend                          │
│                                                                     │
│   build-configurator.js ─────┐                                      │
│                              ├──► data/templates.json               │
│   (variants, phases,         │    ├── variantImages{}  → Unsplash   │
│    packages, templates)      │    ├── phases[]         → Unsplash   │
│                              │    ├── packages[]       → Unsplash   │
│                              │    └── templates[]      → Local      │
│                                                                     │
│   product-grid.js ───────────► data/mock-products.json → Local      │
│   bom-review.js ─────────────► data/mock-products.json → Local      │
└─────────────────────────────────────────────────────────────────────┘

Migration to AEM Assets: Just update the URLs in data/templates.json!
```

### Image Data Files

| File | Contains | Image Sources |
|------|----------|---------------|
| `data/templates.json` | Variant images, phase images, package images, templates | Unsplash + local |
| `data/mock-products.json` | Product images | Local `/images/products/{sku}.png` |

### Example: data/templates.json (variantImages)

```json
{
  "variantImages": {
    "Covered Patio": {
      "url": "https://images.unsplash.com/photo-1635108199803-b1e5eebc8ccf?w=400&h=300&fit=crop",
      "credit": "Unsplash"
    },
    "Home Office": {
      "url": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop",
      "credit": "Unsplash"
    }
  }
}
```

### Example: data/templates.json (phases)

```json
{
  "phases": [
    {
      "id": "foundation_framing",
      "name": "Foundation & Framing",
      "description": "Concrete foundation, structural framing, and load-bearing elements",
      "image": "https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400&h=300&fit=crop",
      "estimatedPercentage": 35
    }
  ]
}
```

---

## Current State Analysis

### What We Have Now

```
buildright-eds/
├── data/
│   ├── templates.json         ← ALL image URLs (variants, phases, packages)
│   └── mock-products.json     ← Product images (local paths)
├── images/products/           ← Local product image files
└── scripts/
    ├── build-configurator.js  ← Reads from data files
    └── data-mock.js           ← getProductImageUrl() for products
```

**Current Image Resolution Flow**:
1. Component loads data file (e.g., `data/variants.json`)
2. Gets image URL from data
3. If no image → CSS placeholder pattern (diagonal lines)

### What ACO Products Have

From `buildright-aco/data/buildright/products.json`:
- ❌ **No `imageUrl` attribute** currently defined
- ✅ Has `sku`, `name`, `slug`, `description`, `attributes[]`
- ❌ No media gallery or image references

---

## Option 1: Commerce Media Gallery (Traditional)

### How It Works
- Upload images to Adobe Commerce Admin
- Images stored in Commerce backend storage
- ACO syncs product data including media gallery URLs
- Storefront fetches images from Commerce media CDN

### Pros
- Native Commerce feature, well-documented
- Works out-of-the-box with ACO product sync
- Automatic image optimization (resize, format conversion)

### Cons
- Requires Commerce Admin access for image uploads
- Images tied to Commerce instance
- Less flexible for multi-channel use
- No advanced DAM features (workflows, AI tagging)

### Implementation
```json
// ACO GraphQL Response (from Commerce sync)
{
  "product": {
    "sku": "LBR-001",
    "media_gallery": [
      {
        "url": "https://commerce.adobe.com/media/catalog/product/l/b/lbr-001.jpg",
        "label": "2x4 Stud - Front View",
        "position": 1
      }
    ]
  }
}
```

---

## Option 2: AEM Assets Integration (Recommended for Enterprise)

### How It Works
- Store all product images in **AEM Assets as a Cloud Service**
- Configure SKU-based matching between AEM metadata and Commerce products
- Dynamic Media serves optimized images via CDN
- Integration syncs asset assignments to Commerce

### Key Features
- **Centralized Asset Management**: Single source of truth for all digital assets
- **Dynamic Media**: Smart Crop, auto-format, responsive images
- **AI-Powered**: Adobe Sensei for tagging, cropping, search
- **Workflow Automation**: Approval workflows, version control
- **Multi-Channel**: Same assets for web, mobile, print, social

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AEM Assets as a Cloud Service            │
│                                                             │
│  Assets organized by SKU:                                   │
│  /content/dam/buildright/products/                          │
│    ├── LBR-001/                                             │
│    │   ├── main.jpg          (with SKU metadata)            │
│    │   ├── angle-left.jpg                                   │
│    │   └── detail-grain.jpg                                 │
│    └── ...                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (SKU matching sync)
┌─────────────────────────────────────────────────────────────┐
│                    Adobe Commerce                           │
│  Product SKU: LBR-001                                       │
│  Media Gallery: (linked from AEM Assets)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (GraphQL via ACO/Mesh)
┌─────────────────────────────────────────────────────────────┐
│                    EDS Storefront                           │
│  Image URL: https://delivery.adobeassets.com/dm/...         │
│             (Dynamic Media optimized delivery)              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps (from Adobe Docs)

1. **Configure AEM Assets**
   - Enable Commerce metadata schema
   - Set up folder structure by SKU
   - Add `sku` metadata field to assets

2. **Install Commerce Packages**
   ```bash
   composer require magento/commerce-assets-integration
   ```

3. **Configure Storefront**
   ```javascript
   // Enable AEM Assets in storefront config
   {
     "commerce-assets-enabled": true
   }
   ```

4. **Sync Configuration**
   - Match rule: Asset metadata `sku` = Commerce product `sku`
   - Auto-sync on asset publish

### Dynamic Media URLs
```javascript
// Optimized delivery with transformations
const imageUrl = `https://delivery.adobeassets.com/dm/${assetId}/rendition.webp?width=400&crop=smart`;
```

---

## Option 3: External DAM/CDN with URL Attributes (Current Approach)

### How It Works
- Store images on any CDN or DAM (Unsplash, Cloudinary, S3, etc.)
- Add custom `imageUrl` attribute to ACO products
- Frontend uses URL directly

### Pros
- **Maximum flexibility** - any image source
- **No Commerce dependency** - images managed externally
- **Simple implementation** - just a URL string
- **Good for demos** - use stock images (Unsplash, Pexels)

### Cons
- No centralized asset management
- Manual URL maintenance
- No automatic optimization (unless CDN provides it)
- No AI features

### Implementation for BuildRight

**Step 1: Add `imageUrl` attribute to ACO products**

```json
// buildright-aco/data/buildright/products.json
{
  "sku": "LBR-D0414F1E",
  "attributes": [
    // ... existing attributes
    {
      "code": "image_url",
      "values": [
        "https://images.unsplash.com/photo-lumber-stud?w=400&h=400&fit=crop"
      ]
    }
  ]
}
```

**Step 2: Update Mesh resolver to include imageUrl**

```javascript
// buildright-service/mesh/resolvers-src/product-search.js
const product = {
  sku: acoProduct.sku,
  name: acoProduct.name,
  imageUrl: getAttributeValue(acoProduct, 'image_url') || null,
  // ...
};
```

**Step 3: Update frontend fallback logic**

```javascript
// scripts/services/catalog-service.js
function transformProduct(meshProduct) {
  return {
    // ...
    imageUrl: meshProduct.imageUrl 
              || `/images/products/${meshProduct.sku}.png`
              || null // Will trigger placeholder CSS
  };
}
```

---

## Recommended Strategy for BuildRight

### Phase 1: Demo/Development (Current) ✅ IMPLEMENTED
**Data-driven images with Unsplash and local files**

All image URLs are defined in data files:
- `data/templates.json` - Variant images, phase images, package images (Unsplash)
- `data/mock-products.json` - Product images (local paths)

**Completed**:
- [x] Added `variantImages` to `data/templates.json` with all variant images
- [x] Added `phases[]` to `data/templates.json` with construction phase images
- [x] Package images already in `data/templates.json`
- [x] Updated `build-configurator.js` to read from single data file
- [x] Removed hardcoded image URLs from code
- [x] CSS placeholder fallback for missing images

### Phase 2: Production Pilot
**Update data file with AEM Assets URLs**

```json
// data/templates.json - replace Unsplash with AEM Assets
{
  "variantImages": {
    "Covered Patio": {
      "url": "https://delivery.adobeassets.com/dm/buildright/variants/covered-patio?width=400&format=webp",
      "credit": "AEM Assets"
    }
  },
  "phases": [
    {
      "id": "foundation_framing",
      "image": "https://delivery.adobeassets.com/dm/buildright/phases/foundation?width=400&format=webp"
    }
  ]
}
```

**Tasks**:
- [ ] Set up AEM Assets as a Cloud Service
- [ ] Upload images organized by type (variants, phases, products)
- [ ] Update `data/templates.json` with AEM URLs for variants, phases, packages
- [ ] Update `data/mock-products.json` with AEM URLs (or use ACO images)

### Phase 3: Full Production
**AEM Assets + ACO product images**

For products, images will come from ACO:
```javascript
// Mesh response includes imageUrl from ACO/Commerce
{
  "sku": "LBR-001",
  "imageUrl": "https://delivery.adobeassets.com/dm/buildright/products/LBR-001"
}
```

Features enabled:
- Dynamic Media for responsive delivery
- AI-powered Smart Crop
- Automatic format conversion (webp)
- Commerce-AEM Assets sync via SKU matching

---

## Technical Considerations

### Image URL Format in Mesh Response

```graphql
type BuildRight_Product {
  sku: String!
  name: String!
  imageUrl: String  # Direct URL to image
  images: [ProductImage!]  # Future: gallery support
}

type ProductImage {
  url: String!
  label: String
  position: Int
  types: [String!]  # ["thumbnail", "main", "swatch"]
}
```

### Fallback Strategy

```javascript
// scripts/services/catalog-service.js
function resolveProductImage(product) {
  // 1. Use mesh-provided URL
  if (product.imageUrl && isValidUrl(product.imageUrl)) {
    return product.imageUrl;
  }
  
  // 2. Check local assets
  const localPath = `/images/products/${product.sku}.png`;
  // Note: Can't check file existence from browser
  // Frontend handles onerror with placeholder
  
  return localPath;
}
```

### Image Placeholder CSS (Already Implemented)

```css
/* styles/components.css */
.image-placeholder {
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(100, 116, 139, 0.1) 10px,
      rgba(100, 116, 139, 0.1) 20px
    );
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Cost/Benefit Analysis

| Approach | Dev Effort | Ongoing Cost | Flexibility | Features |
|----------|------------|--------------|-------------|----------|
| Commerce Media | Low | $$$ | Low | Basic |
| AEM Assets | Medium | $$$$ | High | Enterprise |
| External CDN | Low | $ | High | Varies |

**For BuildRight Demo**: External CDN (Unsplash) is the pragmatic choice.

**For Production**: AEM Assets is the Adobe-recommended approach for enterprise storefronts.

---

## Next Steps

### Immediate (Demo Phase) ✅ DONE

1. **Consolidated all image URLs into `data/templates.json`** ✅
   - `variantImages{}` - All variant images with Unsplash URLs
   - `phases[]` - All phase images with Unsplash URLs
   - `packages[]` - Package images (already present)
   - Product images remain in `data/mock-products.json`

2. **Updated `build-configurator.js`** ✅
   - Loads single `data/templates.json` file
   - `getVariantImageUrl()` reads from `this.variantImages`
   - `getPhaseImageUrl()` reads from `this.phases`
   - `getDefaultPackageImage()` reads from `this.packages`

### Future (Production Phase)

1. **Provision AEM Assets**
   - Review licensing and provisioning
   - Create tenant and configure access

2. **Upload assets to AEM**
   - Products: `/content/dam/buildright/products/{sku}.jpg`
   - Variants: `/content/dam/buildright/variants/{name}.jpg`
   - Phases: `/content/dam/buildright/phases/{id}.jpg`

3. **Update `data/templates.json` with AEM URLs**
   ```json
   {
     "variantImages": {
       "Covered Patio": {
         "url": "https://delivery.adobeassets.com/dm/buildright/variants/covered-patio?width=400&format=webp",
         "credit": "AEM Assets"
       }
     },
     "phases": [
       {
         "id": "foundation_framing",
         "image": "https://delivery.adobeassets.com/dm/buildright/phases/foundation?width=400&format=webp"
       }
     ]
   }
   ```

4. **No code changes needed!**
   - Components already read from data files
   - Just update the URLs in `data/templates.json`

---

## References

- [AEM Assets Integration for Commerce](https://experienceleague.adobe.com/en/docs/commerce/aem-assets-integration/overview)
- [Product Visuals Integration](https://experienceleague.adobe.com/en/docs/commerce/product-visuals/get-started/setup-synchronization)
- [Dynamic Media Best Practices](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dm-journey/dm-best-practices)
- [Commerce Storefront - AEM Assets Config](https://experienceleague.adobe.com/developer/commerce/storefront/setup/configuration/aem-assets-configuration/)

---

**Last Updated**: December 8, 2025  
**Status**: ✅ Data-Driven Images Implemented

