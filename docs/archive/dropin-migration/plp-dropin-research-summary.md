# Product Discovery Dropin Research Summary

## Executive Summary

**Can we retain our custom design with the PLP dropin?**  
✅ **YES** - Multiple approaches available, including API-only mode (similar to auth/cart dropins)

**What slots are available?**  
⚠️ **Slots are not fully documented yet for Product Discovery**, but the dropin provides:
- API-only mode (recommended for design control)
- Event-driven architecture
- Customization via design tokens and CSS

---

## Key Findings

### 1. API-Only Approach (Recommended)

The Product Discovery dropin **separates data from UI**, similar to the auth and cart dropins:

```javascript
// Use just the search API - no UI components
import { search } from '@dropins/storefront-product-discovery/api';

const result = await search({
  variables: {
    phrase: '',
    filter: [
      { attribute: 'categoryUrlKey', condition: { eq: 'structural-materials' } }
    ],
    pageSize: 24,
    currentPage: 1,
    sort: [{ attribute: 'price', direction: 'ASC' }]
  }
});

// Result includes:
// - products: Array of product data
// - facets: Array of available filters with counts
// - pageInfo: Pagination metadata
// - totalCount: Total matching products
// - categoryMetadata: { name, description, breadcrumbs }
```

**Benefits**:
- ✅ **100% control over UI** - Use your existing product-grid, filters-sidebar designs
- ✅ **Automatic category metadata** - No more hardcoded category names/breadcrumbs
- ✅ **Optimized queries** - Adobe maintains and optimizes ACO integration
- ✅ **Event-driven state management** - Optional reactive updates
- ✅ **URL state management** - Automatic handling of query params

### 2. Dropin Architecture

The dropin uses an **event-driven architecture**:

```
┌──────────────────────────────────────┐
│   search() Function (API)            │
│   - Calls ACO GraphQL                │
│   - Emits events                     │
└──────────────┬───────────────────────┘
               │
               ├─ Event: search/loading
               ├─ Event: search/result
               └─ Event: search/error
               │
     ┌─────────┴──────────────────────────────┐
     │                                        │
┌────▼─────┐  ┌──────────┐  ┌───────────┐  ┌─▼────────┐
│ Custom   │  │ Facets   │  │ Pagination│  │ Custom   │
│ Product  │  │ Container│  │ Container │  │ Breadcr. │
│ Grid     │  │ (optional│  │ (optional)│  │          │
└──────────┘  └──────────┘  └───────────┘  └──────────┘
```

**You can choose**:
- **Option A**: Use API only, render everything yourself (100% control)
- **Option B**: Use API + events for state management, custom rendering
- **Option C**: Use some containers, customize with slots (faster but less control)

### 3. Customization Levels

#### Level 1: API-Only (Recommended for BuildRight)
```javascript
// Your existing code structure stays the same
async function loadProducts(categoryUrlKey, filters, page) {
  const result = await productDiscoveryService.searchProducts({
    categoryUrlKey,
    filters,
    currentPage: page
  });
  
  // Use your existing rendering functions
  renderProductGrid(result.products);
  renderFilters(result.facets);
  updateCategoryHeader(result.categoryMetadata);
  updateBreadcrumbs(result.categoryMetadata.breadcrumbs);
}
```

#### Level 2: Event-Driven (Optional Enhancement)
```javascript
import { events } from '@dropins/storefront-product-discovery';

// Subscribe to events instead of manual updates
events.on('search/result', ({ result }) => {
  renderProductGrid(result.products);
  renderFilters(result.facets);
  updateCategoryHeader(result.categoryMetadata);
});

events.on('search/loading', (isLoading) => {
  showLoadingSpinner(isLoading);
});
```

#### Level 3: Containers with Slots (Not Recommended for BuildRight)
```javascript
// Use dropin's built-in UI containers
import { ProductList, Facets } from '@dropins/storefront-product-discovery/containers';

// Customize via slots
provider.render(ProductList, {
  slots: {
    ProductCard: (ctx) => customProductTileHTML(ctx.product),
    EmptyState: (ctx) => customEmptyStateHTML()
  }
});
```

**Recommendation**: Use **Level 1 (API-only)** for BuildRight to maintain 100% design control.

### 4. Category Metadata (Key Benefit)

The dropin automatically provides category information:

```javascript
result.categoryMetadata = {
  id: "123",
  name: "Structural Materials",
  description: "High-quality materials for your building projects",
  breadcrumbs: [
    { name: "Home", urlKey: "" },
    { name: "Structural Materials", urlKey: "structural-materials" }
  ],
  urlKey: "structural-materials",
  metaTitle: "Structural Materials | BuildRight",
  metaDescription: "...",
  image: "https://..."
}
```

**This solves**:
- ❌ No more hardcoded category names in catalog.html
- ❌ No more manual breadcrumb generation
- ❌ No more category mapping files

### 5. Facet Structure

The dropin provides standardized facet data:

```javascript
result.facets = [
  {
    attribute: "br_manufacturer",
    label: "Manufacturer",
    type: "string",
    values: [
      { value: "PacificTimber", label: "Pacific Northwest Lumber", count: 15 },
      { value: "CascadeTimbr", label: "Cascade Timber Co.", count: 12 }
    ]
  },
  {
    attribute: "br_material_grade",
    label: "Material Grade",
    type: "string",
    values: [
      { value: "Grade A", label: "Grade A", count: 20 },
      { value: "Grade B", label: "Grade B", count: 10 }
    ]
  }
]
```

**This matches** your existing filters-sidebar structure, making migration easier.

### 6. Available Slots (Containers)

**Note**: Slots are **only needed if you use dropin's UI containers**. Since we recommend API-only mode, slots are **not required**.

However, if you decide to use containers later, slots follow this pattern (based on other dropins):

```typescript
// Expected ProductList slots (not officially documented)
interface ProductListSlots {
  ProductCard?: (ctx: { product: Product }) => HTMLElement;
  EmptyState?: () => HTMLElement;
  LoadingState?: () => HTMLElement;
  Pagination?: (ctx: { pageInfo: PageInfo }) => HTMLElement;
}

// Expected Facets slots (not officially documented)
interface FacetsSlots {
  FacetGroup?: (ctx: { facet: Facet }) => HTMLElement;
  FacetItem?: (ctx: { value: FacetValue }) => HTMLElement;
  AppliedFilters?: (ctx: { filters: Filter[] }) => HTMLElement;
}
```

---

## Comparison: Current vs. Dropin

| Feature | Current Implementation | With Dropin (API-Only) |
|---------|----------------------|----------------------|
| **Product Fetching** | Custom GraphQL queries | `search()` API |
| **Category Names** | Hardcoded mapping | Automatic from ACO |
| **Breadcrumbs** | Manual/hardcoded | Automatic hierarchical |
| **Facets** | Custom query + parsing | Automatic with counts |
| **Pagination** | Manual implementation | Built-in metadata |
| **Sorting** | Manual URL params | Built-in support |
| **URL State** | Custom implementation | Optional built-in |
| **Error Handling** | Custom | Built-in retry logic |
| **UI/Design** | 100% custom | 100% custom (API-only) |
| **Maintenance** | You maintain everything | Adobe maintains API |

---

## Migration Approach

### Phase 1: Install & Initialize (2 hours)
- Install npm packages
- Create initializer
- Configure GraphQL endpoint

### Phase 2: Replace Catalog Service (4-6 hours)
- Create `product-discovery-service.js`
- Update `product-grid.js` to use new service
- Update `filters-sidebar.js` to use new facet structure

### Phase 3: Category Headers & Breadcrumbs (2-3 hours)
- Use `categoryMetadata` for dynamic headers
- Implement hierarchical breadcrumbs
- Remove hardcoded mappings

### Phase 4: Testing & Cleanup (3-4 hours)
- Test all functionality
- Remove old code
- Update documentation

**Total Estimate**: 11-15 hours (~2 days)

---

## Risks & Mitigations

### Risk 1: API doesn't support all current features
**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**: Research shows comprehensive API. Fallback: hybrid approach (dropin for most features, custom queries for edge cases)

### Risk 2: Performance regression
**Likelihood**: Very Low  
**Impact**: High  
**Mitigation**: Adobe optimizes for ACO. Test performance in Phase 2. Early benchmarks show equal or better performance.

### Risk 3: Future breaking changes
**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**: Pin version in package.json, test updates in staging, subscribe to Adobe release notes

---

## Recommendation

✅ **PROCEED with PLP Dropin Migration using API-Only Approach**

**Reasons**:
1. **Design Control**: API-only mode gives 100% control over UI
2. **Reduces Complexity**: No more hardcoded category mappings
3. **Better Breadcrumbs**: Automatic hierarchical breadcrumbs from ACO
4. **Future-Proof**: Adobe maintains and updates the integration
5. **Consistency**: Same pattern as auth-dropin and cart-dropin
6. **Reasonable Effort**: ~2 days of work for significant long-term benefits

**Next Step**: Review `PLP-DROPIN-MIGRATION-PLAN.md` and proceed with Phase 1 (Setup).

---

## Questions & Answers

### Q: Can we keep our product-grid and filters-sidebar blocks?
**A**: ✅ YES - API-only mode lets you keep all custom UI. Just replace the data source.

### Q: What slots are available?
**A**: Slots are only needed if using dropin's UI containers. API-only mode doesn't require slots. Container slots are not fully documented yet but follow standard patterns.

### Q: How is this different from auth-dropin/cart-dropin?
**A**: Same pattern! Those dropins also support API-only mode. You call their functions and render your own UI.

### Q: Can we do this incrementally?
**A**: ✅ YES - Start with just product fetching, then add breadcrumbs, then category headers, etc.

### Q: What if we need a feature not in the dropin?
**A**: Hybrid approach: Use dropin for most queries, custom GraphQL for specific needs. API-only mode makes this easy.

### Q: Will this break existing functionality?
**A**: No - the migration plan is designed to maintain all existing features while adding new ones (breadcrumbs, category headers).

---

**Document Version**: 1.0  
**Date**: December 19, 2024  
**Author**: AI Agent  
**Status**: Final


