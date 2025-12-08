# Product Images Strategy for ACO Integration

**Status**: ✅ Implemented (Strategy Pattern)  
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

**Implementation**: We use a **strategy pattern** (like `catalogService`) that allows seamless switching between local demo images and AEM Assets when ready.

```
imageService.initialize({ strategy: 'local' });     // Demo mode
imageService.initialize({ strategy: 'aem-assets' }); // Production mode
```

---

## Implementation: Image Service (Strategy Pattern)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    buildright-eds Frontend                          │
│                                                                     │
│   build-configurator.js ──┐                                         │
│   bom-review.js ──────────► imageService ──► LocalStrategy ────┐    │
│   product-grid.js ────────┘       │                            │    │
│                                   ▼                            │    │
│                           AEMAssetsStrategy                    │    │
│                           (future production)                  │    │
└────────────────────────────────────────────────────────────────│────┘
                                                                 │
                                                                 ▼
┌────────────────────────────────────┐    ┌──────────────────────────┐
│         Local Sources              │    │    AEM Assets (Future)   │
│  /images/products/{sku}.png        │    │  Dynamic Media CDN       │
│  /images/templates/{id}.jpg        │    │  Smart Crop              │
│  Unsplash (demo images)            │    │  Auto-format (webp)      │
└────────────────────────────────────┘    └──────────────────────────┘
```

### File Location

```
scripts/services/
├── catalog-service.js   ← Product data (strategy pattern)
├── image-service.js     ← Product images (strategy pattern) ✨ NEW
├── mesh-client.js       ← GraphQL client
└── mesh-integration.js  ← Auth bridge
```

### Usage

```javascript
import { imageService } from './services/image-service.js';

// Initialize (once, typically in auth.js or app init)
await imageService.initialize(); // Auto-detects strategy

// Or explicitly set strategy
await imageService.initialize({ strategy: 'local' });

// Get image URLs (same API regardless of strategy)
const productUrl = imageService.getProductImage('LBR-001');
const templateUrl = imageService.getTemplateImage('sedona');
const variantUrl = imageService.getVariantImage('Covered Patio');
const packageUrl = imageService.getPackageImage('premium-select', 'premium');
const phaseUrl = imageService.getPhaseImage('Foundation & Framing');
const categoryUrl = imageService.getCategoryImage('structural_materials');

// Check active strategy
console.log(imageService.getActiveStrategy()); // 'local' or 'aem-assets'
console.log(imageService.isUsingAEMAssets()); // true/false
```

### Strategies

| Strategy | Description | When Used |
|----------|-------------|-----------|
| **LocalStrategy** | Local files + Unsplash demo images | Development, demos |
| **AEMAssetsStrategy** | AEM Assets Dynamic Media URLs | Production (future) |

---

## Current State Analysis

### What We Have Now

```
buildright-eds/
├── images/products/           ← Local placeholder SVGs
├── scripts/services/
│   ├── image-service.js       ← Strategy pattern (NEW)
│   ├── catalog-service.js     ← Returns imageUrl from mesh or mock
│   └── mesh-client.js         ← GraphQL includes imageUrl field
└── scripts/data-mock.js       ← Legacy getProductImageUrl() (to be deprecated)
```

**Current Image Resolution Flow**:
1. `imageService.getProductImage(sku)` called
2. LocalStrategy returns `/images/products/{sku}.png`
3. If file not found → CSS placeholder pattern (diagonal lines)

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
**Use `imageService` with `LocalStrategy`**

```javascript
// Auto-initializes with LocalStrategy
const url = imageService.getProductImage('LBR-001');
// Returns: /images/products/LBR-001.png (or CSS placeholder if missing)
```

**Image Resolution Priority**:
1. LocalStrategy returns local path `/images/products/{sku}.png`
2. If file not found → CSS placeholder pattern (diagonal lines)
3. Variants/packages use curated Unsplash URLs

**Completed**:
- [x] Created `image-service.js` with strategy pattern
- [x] LocalStrategy with all image types (product, template, variant, package, phase, category)
- [x] AEMAssetsStrategy scaffold ready for production
- [x] CSS placeholder fallback

**Remaining**:
- [ ] Integrate `imageService` into `build-configurator.js` (replace hardcoded URLs)
- [ ] Integrate `imageService` into `bom-review.js`
- [ ] Deprecate `getProductImageUrl()` in `data-mock.js`

### Phase 2: Production Pilot
**Switch to `AEMAssetsStrategy`**

```javascript
// Configure AEM Assets
await imageService.initialize({ 
  strategy: 'aem-assets',
  aemConfig: {
    deliveryUrl: 'https://delivery.adobeassets.com',
    assetPrefix: '/content/dam/buildright'
  }
});

// Same API, different source
const url = imageService.getProductImage('LBR-001');
// Returns: https://delivery.adobeassets.com/dm/.../LBR-001?width=400&format=webp&crop=smart
```

**Tasks**:
- [ ] Set up AEM Assets as a Cloud Service
- [ ] Create folder structure: `/content/dam/buildright/products/`, `/templates/`, etc.
- [ ] Upload product images with SKU metadata
- [ ] Configure Commerce integration
- [ ] Set environment variable: `AEM_ASSETS_DELIVERY_URL`
- [ ] Test with `{ strategy: 'aem-assets' }`

### Phase 3: Full Production
**AEM Assets as single source of truth**

```javascript
// Auto-detection (checks AEM_ASSETS_DELIVERY_URL)
await imageService.initialize({ strategy: 'auto' });
// Automatically uses AEMAssetsStrategy if configured
```

Features enabled:
- Dynamic Media for responsive delivery
- AI-powered Smart Crop
- Automatic format conversion (webp)
- Workflow automation for approvals
- Multi-channel delivery (web, mobile, print)

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

### Immediate (Demo Phase)

1. **Integrate `imageService` into components** ✅ Ready
   ```javascript
   // build-configurator.js
   import { imageService } from './services/image-service.js';
   
   const url = imageService.getVariantImage('Covered Patio');
   const packageUrl = imageService.getPackageImage('premium-select', 'premium');
   ```

2. **Replace hardcoded Unsplash URLs**
   - `build-configurator.js` - variants, packages, phases
   - `bom-review.js` - product images
   - `product-grid.js` - product cards

3. **Deprecate legacy functions**
   - Remove `getProductImageUrl()` from `data-mock.js`
   - Remove `getVariantImageUrl()` from `build-configurator.js`
   - Consolidate all image logic in `imageService`

### Future (Production Phase)

1. **Provision AEM Assets**
   - Review licensing and provisioning
   - Create tenant and configure access

2. **Set up folder structure**
   ```
   /content/dam/buildright/
   ├── products/           # By SKU
   │   ├── LBR-001.jpg
   │   └── ...
   ├── templates/          # Floor plans
   │   ├── sedona.jpg
   │   └── ...
   └── categories/         # Category banners
   ```

3. **Configure integration**
   - Set `AEM_ASSETS_DELIVERY_URL` environment variable
   - Enable Commerce-AEM Assets sync
   - Test Dynamic Media transformations

4. **Switch strategy**
   ```javascript
   // Just change initialization
   await imageService.initialize({ strategy: 'aem-assets' });
   // All existing code continues to work!
   ```

---

## References

- [AEM Assets Integration for Commerce](https://experienceleague.adobe.com/en/docs/commerce/aem-assets-integration/overview)
- [Product Visuals Integration](https://experienceleague.adobe.com/en/docs/commerce/product-visuals/get-started/setup-synchronization)
- [Dynamic Media Best Practices](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dm-journey/dm-best-practices)
- [Commerce Storefront - AEM Assets Config](https://experienceleague.adobe.com/developer/commerce/storefront/setup/configuration/aem-assets-configuration/)

---

**Last Updated**: December 8, 2025  
**Status**: ✅ Strategy Pattern Implemented

