# ACO Category Routes Fix - Dyson Pattern

**Date**: December 19, 2025  
**Status**: Analysis Complete - Ready for Implementation  
**Priority**: High

---

## Problem Summary

Our ACO product routes are **incorrect**. We're only creating category paths, not product routes.

### Current (WRONG):
```json
{
  "sku": "BR-2X4-8-PREM",
  "routes": [
    { "path": "structural-materials", "position": 0 },
    { "path": "structural-materials/lumber", "position": 1 }
  ]
}
```

### Should Be (CORRECT - Dyson Pattern):
```json
{
  "sku": "BR-2X4-8-PREM",
  "routes": [
    { "path": "2x4-premium-stud-8ft", "position": 0 },
    { "path": "structural-materials/lumber/2x4-premium-stud-8ft", "position": 1 }
  ]
}
```

---

## Dyson Example Analysis

### 1. Category Structure

**Dyson categories use hierarchical slugs:**

```http
POST /catalog/categories
[
  {
    "slug": "floorcare",
    "name": "Floorcare",
    "families": ["home","floorcare"]
  },
  {
    "slug": "floorcare/cordless",    ← Full path includes parent
    "name": "Cordless",
    "families": ["home","floorcare"]
  },
  {
    "slug": "floorcare/submarine",
    "name": "Submarine (Wet & Dry)",
    "families": ["home","floorcare"]
  }
]
```

**Key Insight**: Category `slug` field contains **full hierarchical path**.

---

### 2. Product Routes

**Dyson products have TWO routes:**

```json
{
  "sku": "304919-01",
  "name": "Dyson Piston Animal Absolute DS60 + Dok cordless vacuum",
  "slug": "dyson-piston-animal-absolute-ds60-plus-dok-cordless-vacuum",
  "routes": [
    { 
      "path": "dyson-piston-animal-absolute-ds60-plus-dok-cordless-vacuum"
    },
    { 
      "path": "floorcare/cordless/dyson-piston-animal-absolute-ds60-plus-dok-cordless-vacuum", 
      "position": 1 
    }
  ]
}
```

**Route 1**: Product slug alone (direct access)  
**Route 2**: Full category path + product slug (category browsing)

---

### 3. What This Enables

#### URL Structure:
```
https://site.com/floorcare/cordless
  → Shows all products with route "floorcare/cordless/*"

https://site.com/floorcare/cordless/dyson-piston-animal-ds60
  → Shows specific product

https://site.com/dyson-piston-animal-ds60
  → Also shows specific product (direct access)
```

#### Filtering:
```graphql
query {
  products(filter: {
    routes: { path: { startsWith: "floorcare/cordless" } }
  }) {
    # Returns all products in Floorcare > Cordless category
  }
}
```

---

## Required Changes

### 1. Fix Category Generation (`generate-canonical.js`)

**Current**:
```javascript
{
  "slug": "lumber",
  "name": "Lumber"
}
```

**Should Be**:
```javascript
{
  "slug": "structural-materials/lumber",  ← Full path
  "name": "Lumber"
}
```

**Implementation**:
```javascript
function generateCategories(categoryTree, parentPath = '') {
  const categories = [];
  
  for (const category of categoryTree) {
    const fullPath = parentPath 
      ? `${parentPath}/${category.urlKey}` 
      : category.urlKey;
    
    categories.push({
      slug: fullPath,  ← Use full path
      name: category.name
    });
    
    if (category.subcategories && category.subcategories.length > 0) {
      categories.push(
        ...generateCategories(category.subcategories, fullPath)
      );
    }
  }
  
  return categories;
}
```

---

### 2. Fix Product Routes (`generate-aco.js`)

**Function**: `extractCategoryCodes()`

**Current Logic**:
- Returns category paths only
- Missing product slug

**New Logic**:
- Route 1: Product slug
- Route 2+: Full category path + product slug

**Implementation**:
```javascript
function extractCategoryCodes(productCategories, categoryCodeMap, productSlug) {
  if (!productCategories || !productSlug) {
    return [];
  }
  
  const routes = [];
  
  // Route 1: Product slug alone (direct access)
  routes.push(productSlug);
  
  // Route 2+: Full category path + product slug
  const categoriesArray = typeof productCategories === 'string' 
    ? [productCategories] 
    : productCategories;
  
  for (const categoryPath of categoriesArray) {
    let categorySlug = null;
    
    // Try full path first
    if (categoryCodeMap.has(categoryPath)) {
      categorySlug = categoryCodeMap.get(categoryPath);
    } else {
      // Try splitting and using the last part
      const parts = categoryPath.split('/');
      const leafCategory = parts[parts.length - 1];
      
      if (categoryCodeMap.has(leafCategory)) {
        categorySlug = categoryCodeMap.get(leafCategory);
      }
    }
    
    if (categorySlug) {
      // Combine category path + product slug
      routes.push(`${categorySlug}/${productSlug}`);
    }
  }
  
  return Array.from(new Set(routes)); // Remove duplicates
}
```

**Update Call Sites**:
```javascript
// In transformToAcoProduct()
if (categoryCodeMap && commerceProduct.categories) {
  const categoryCodes = extractCategoryCodes(
    commerceProduct.categories, 
    categoryCodeMap,
    commerceProduct.url_key  ← ADD product slug
  );
  
  if (categoryCodes.length > 0) {
    acoProduct.routes = categoryCodes.map((path, index) => ({
      path: path,
      position: index === 0 ? undefined : index  // Position 0 omitted per Dyson
    }));
  }
}
```

---

### 3. Update Category Code Map (`generate-aco.js`)

**Current**:
```javascript
const categoryCodeMap = new Map();
for (const cat of canonical.categories) {
  categoryCodeMap.set(cat.name, cat.slug);
}
```

**Should Be**:
```javascript
const categoryCodeMap = new Map();
for (const cat of canonical.categories) {
  // Map by full path
  categoryCodeMap.set(cat.name, cat.slug);
  
  // Also map by leaf name for backward compatibility
  const leafName = cat.name.split('/').pop();
  if (leafName !== cat.name) {
    categoryCodeMap.set(leafName, cat.slug);
  }
}
```

---

## BuildRight Example

### Before:
```json
{
  "sku": "BR-2X4-8-PREM",
  "name": "2x4 Premium Stud - 8ft",
  "slug": "2x4-premium-stud-8ft",
  "routes": [
    { "path": "structural-materials", "position": 0 },
    { "path": "lumber", "position": 1 }
  ]
}
```

### After:
```json
{
  "sku": "BR-2X4-8-PREM",
  "name": "2x4 Premium Stud - 8ft",
  "slug": "2x4-premium-stud-8ft",
  "routes": [
    { "path": "2x4-premium-stud-8ft" },
    { "path": "structural-materials/lumber/2x4-premium-stud-8ft", "position": 1 }
  ]
}
```

### Category in ACO:
```json
{
  "slug": "structural-materials/lumber",
  "name": "Lumber",
  "families": ["construction", "lumber"]
}
```

---

## Files to Modify

### 1. `/commerce-demo-generator/generators/generate-canonical.js`
**Change**: Update `generateCategories()` to use full hierarchical paths in `slug` field

### 2. `/commerce-demo-generator/generators/generate-aco.js`
**Changes**:
- Update `extractCategoryCodes()` signature to accept `productSlug`
- Add product slug as first route
- Combine category path + product slug for subsequent routes
- Update `transformToAcoProduct()` to pass product slug

### 3. `/commerce-demo-generator/generators/generate-aco-categories.js` (if exists)
**Change**: Ensure categories use hierarchical slugs

---

## Testing Plan

### 1. Generate New Datapack
```bash
cd commerce-demo-generator
npm run generate:canonical
npm run generate:aco
```

### 2. Verify Categories
```bash
# Check ACO categories.json
cat ../buildright-data/generated/aco/categories.json | jq '.[] | {slug, name}'

# Expected:
# { "slug": "structural-materials", "name": "Structural Materials" }
# { "slug": "structural-materials/lumber", "name": "Lumber" }
# { "slug": "structural-materials/metal-studs-track", "name": "Metal Studs & Track" }
```

### 3. Verify Product Routes
```bash
# Check first product
cat ../buildright-data/generated/aco/products.json | jq '.[0] | {sku, slug, routes}'

# Expected:
# {
#   "sku": "BR-2X4-8-PREM",
#   "slug": "2x4-premium-stud-8ft",
#   "routes": [
#     { "path": "2x4-premium-stud-8ft" },
#     { "path": "structural-materials/lumber/2x4-premium-stud-8ft", "position": 1 }
#   ]
# }
```

### 4. Re-import to ACO
```bash
cd ../buildright-service
npm run import:aco
```

### 5. Test Frontend
```javascript
// Navigate to: http://localhost:3000/pages/catalog.html?category=lumber

// Should filter by:
filter: {
  routes: { 
    path: { startsWith: "structural-materials/lumber" } 
  }
}
```

---

## Benefits

### 1. **Correct Category Filtering**
Products will be properly associated with their category hierarchy

### 2. **Direct Product Access**
Products accessible via slug alone: `/2x4-premium-stud-8ft`

### 3. **Category Browsing**
Products accessible via category path: `/structural-materials/lumber/2x4-premium-stud-8ft`

### 4. **Breadcrumbs**
Can extract category path from route for breadcrumb display

### 5. **SEO**
Clean, hierarchical URLs for better search engine indexing

---

## Migration Notes

### Backward Compatibility
- Old category filters using `categoryUrlKey` will still work if we maintain the `br_product_category` attribute
- New category filters should use `routes.path` with `startsWith` operator

### Frontend Updates Required
- Update `catalog-service.js` to filter by `routes.path` instead of `categoryUrlKey`
- Update breadcrumb generation to parse route paths
- Update category navigation to use full hierarchical paths

---

## Related Documentation

- **Dyson Example**: `/Users/kukla/Desktop/Dyson CCDM.http`
- **Previous Fix**: `docs/HANDOFF-CATEGORY-NAVIGATION-2024-12-19.md`
- **Generator Code**: `commerce-demo-generator/generators/generate-aco.js`

---

**Next Steps**:
1. Review this analysis
2. Implement changes in `generate-canonical.js`
3. Implement changes in `generate-aco.js`
4. Test datapack generation
5. Re-import to ACO
6. Update frontend filtering logic
7. Test all category navigation flows

---

**Document Version**: 1.0  
**Author**: AI Assistant  
**Reviewer**: [Pending]

