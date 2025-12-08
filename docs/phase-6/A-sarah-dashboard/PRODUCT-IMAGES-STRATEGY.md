# Product Images Strategy for ACO Integration

**Status**: 📋 Planning  
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

**Recommendation for BuildRight**: Use **External CDN approach** (Option 3) with Unsplash/custom URLs during demo development, then plan migration to **AEM Assets** for production.

---

## Current State Analysis

### What We Have Now

```
buildright-eds/
├── images/products/           ← Local placeholder SVGs
├── scripts/data-mock.js       ← getProductImageUrl() with fallbacks
└── scripts/services/
    ├── catalog-service.js     ← Returns imageUrl from mesh or mock
    └── mesh-client.js         ← GraphQL includes imageUrl field
```

**Current Image Resolution Flow**:
1. Mesh response includes `imageUrl` field
2. If empty/null → fallback to `/images/products/{sku}.png`
3. If file not found → CSS placeholder pattern

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

### Phase 1: Demo/Development (Current)
**Use External CDN approach with local fallbacks**

```
Image Resolution Priority:
1. Mesh response `imageUrl` (if populated in ACO)
2. Local file `/images/products/{sku}.png`
3. CSS placeholder pattern (diagonal lines)
```

**Tasks**:
- [ ] Add `image_url` attribute to ACO product schema
- [ ] Populate with Unsplash URLs for demo products
- [ ] Update mesh resolver to return `imageUrl`
- [ ] Frontend already handles fallback ✅

### Phase 2: Production Pilot
**Migrate to AEM Assets for core catalog**

**Tasks**:
- [ ] Set up AEM Assets as a Cloud Service
- [ ] Create folder structure for BuildRight products
- [ ] Upload product images with SKU metadata
- [ ] Configure Commerce integration
- [ ] Enable Dynamic Media for optimization

### Phase 3: Full Production
**AEM Assets as single source of truth**

- All product images managed in AEM
- Dynamic Media for responsive delivery
- AI-powered features (Smart Crop, Smart Tags)
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

1. **Add image URLs to demo products**
   - Select 10-20 key products
   - Use high-quality Unsplash images
   - Add `image_url` attribute to ACO data

2. **Update mesh to return imageUrl**
   - Modify `product-search.js` resolver
   - Map `image_url` attribute to response

3. **Test end-to-end**
   - Verify images load from mesh response
   - Confirm fallback to placeholders works

### Future (Production Phase)

1. **Evaluate AEM Assets setup**
   - Review licensing and provisioning
   - Plan folder structure and metadata schema

2. **Migration plan**
   - Bulk upload product images to AEM
   - Configure SKU-based matching
   - Update storefront configuration

---

## References

- [AEM Assets Integration for Commerce](https://experienceleague.adobe.com/en/docs/commerce/aem-assets-integration/overview)
- [Product Visuals Integration](https://experienceleague.adobe.com/en/docs/commerce/product-visuals/get-started/setup-synchronization)
- [Dynamic Media Best Practices](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dm-journey/dm-best-practices)
- [Commerce Storefront - AEM Assets Config](https://experienceleague.adobe.com/developer/commerce/storefront/setup/configuration/aem-assets-configuration/)

---

**Last Updated**: December 8, 2025  
**Status**: 📋 Planning

