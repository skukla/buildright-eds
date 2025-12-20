# PLP Dropin Migration Plan

## Overview
Migrate from custom product listing implementation to Adobe Commerce Product Discovery dropin using an API-only/headless approach to maintain BuildRight's custom design.

## Current State

### Custom Implementation
- **product-grid** block: Custom product display with filters
- **filters-sidebar** block: Custom faceted navigation
- **catalog-service.js**: Manual ACO GraphQL queries
- **Custom URL state management**: Manual query param handling
- **Custom breadcrumbs**: Hardcoded logic
- **Custom category headers**: Static mapping

### Issues
- Manual category name mapping (hardcoded)
- No hierarchical breadcrumbs
- Manual pagination implementation
- Manual sort implementation
- Duplicated state management logic

## Target State

### Product Discovery Dropin (API-Only Mode)
- **search() API**: Handles all ACO queries
- **Event system**: Manages state and URL synchronization
- **Custom UI**: Retain existing product-grid, filters-sidebar design
- **Automatic features**: Category metadata, breadcrumbs, pagination, sorting

## Implementation Strategy

### Phase 1: Research & Setup
**Goal**: Install dropin and understand API

**Tasks**:
1. Install Product Discovery dropin
   ```bash
   npm install @dropins/storefront-product-discovery @dropins/tools
   ```

2. Add import map to `head.html`
   ```html
   <script type="importmap">
   {
     "imports": {
       "@dropins/tools": "./node_modules/@dropins/tools/index.js",
       "@dropins/storefront-product-discovery": "./node_modules/@dropins/storefront-product-discovery/index.js"
     }
   }
   </script>
   ```

3. Create initializer: `scripts/initializers/product-discovery.js`
   ```javascript
   import { initialize } from '@dropins/storefront-product-discovery';
   import { initializeDropin } from '@dropins/tools/initializer.js';
   import { fetchGraphQl } from '@dropins/tools/fetch-graphql.js';

   export default async function initProductDiscovery() {
     await initializeDropin(async () => {
       // Set GraphQL endpoint
       await fetchGraphQl.setEndpoint(
         'https://commerce-mesh.adobe.io/graphql',
         {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Magento-Environment-Id': window.adobeCommerce?.environmentId,
             'Magento-Store-Code': window.adobeCommerce?.storeCode,
             'Magento-Store-View-Code': window.adobeCommerce?.storeViewCode,
             'x-api-key': window.adobeCommerce?.apiKey
           }
         }
       );

       // Initialize Product Discovery
       return initialize({
         langDefinitions: {
           'en-US': './i18n/en-US.json'
         }
       });
     });
   }
   ```

**Validation**: Console logs show dropin initialized successfully

---

### Phase 2: API Integration (Headless)
**Goal**: Replace catalog-service.js with dropin's search() API

**Tasks**:
1. Create new service: `scripts/services/product-discovery-service.js`
   ```javascript
   import { search } from '@dropins/storefront-product-discovery/api';
   
   /**
    * Search products using dropin API
    */
   export async function searchProducts(params = {}) {
     const {
       categoryUrlKey,
       filters = {},
       currentPage = 1,
       pageSize = 24,
       sort = []
     } = params;
     
     // Build filter array for ACO
     const filterArray = [];
     
     // Add category filter
     if (categoryUrlKey) {
       filterArray.push({
         attribute: 'categoryUrlKey',
         condition: { eq: categoryUrlKey }
       });
     }
     
     // Add facet filters
     Object.entries(filters).forEach(([attribute, values]) => {
       if (values && values.length > 0) {
         filterArray.push({
           attribute,
           condition: { in: values }
         });
       }
     });
     
     // Call dropin search API
     try {
       const result = await search({
         variables: {
           phrase: '', // Empty for category browsing
           pageSize,
           currentPage,
           filter: filterArray,
           sort
         }
       });
       
       return {
         products: result.products || [],
         facets: result.facets || [],
         totalCount: result.totalCount || 0,
         pageInfo: result.pageInfo || {},
         categoryMetadata: result.categoryMetadata || {} // Includes name, breadcrumbs
       };
     } catch (error) {
       console.error('Product Discovery search error:', error);
       throw error;
     }
   }
   
   /**
    * Get category metadata (name, breadcrumbs)
    */
   export async function getCategoryInfo(categoryUrlKey) {
     const result = await searchProducts({ 
       categoryUrlKey, 
       pageSize: 1 // Minimal products, we just want metadata
     });
     
     return result.categoryMetadata;
   }
   ```

2. Update `blocks/product-grid/product-grid.js` to use new service
   - Replace `catalogService.getProducts()` with `productDiscoveryService.searchProducts()`
   - Use `categoryMetadata` for category headers
   - Use `facets` for filters
   - Use `pageInfo` for pagination

3. Update `blocks/filters-sidebar/filters-sidebar.js`
   - Replace facet logic with dropin's `facets` structure
   - Use dropin's facet format: `{ attribute, label, values: [{ value, count }] }`

**Validation**: 
- Products load correctly
- Filters work
- Category filtering works
- Facets display with counts

---

### Phase 3: Category Headers & Breadcrumbs
**Goal**: Use dropin's category metadata for headers and breadcrumbs

**Tasks**:
1. Update `pages/catalog.html` to use dynamic category data
   ```html
   <div class="catalog-header">
     <div id="category-breadcrumbs" class="breadcrumbs"></div>
     <h1 id="category-title" class="category-title">All Products</h1>
     <div id="category-description" class="category-description"></div>
   </div>
   ```

2. Create `blocks/breadcrumbs/breadcrumbs.js` (if not exists)
   ```javascript
   export default function decorate(block) {
     // This will be populated by product-grid when category loads
   }
   
   export function updateBreadcrumbs(categoryMetadata) {
     const breadcrumbsBlock = document.querySelector('.breadcrumbs');
     if (!breadcrumbsBlock || !categoryMetadata?.breadcrumbs) return;
     
     const breadcrumbs = categoryMetadata.breadcrumbs;
     const html = breadcrumbs.map((crumb, index) => {
       if (index === breadcrumbs.length - 1) {
         // Last item (current category)
         return `<span class="breadcrumb-current">${crumb.name}</span>`;
       }
       return `<a href="catalog?category=${crumb.urlKey}" class="breadcrumb-link">${crumb.name}</a>`;
     }).join('<span class="breadcrumb-separator">/</span>');
     
     breadcrumbsBlock.innerHTML = html;
   }
   ```

3. Update `blocks/product-grid/product-grid.js` to set category info
   ```javascript
   async function applyFilters() {
     const result = await productDiscoveryService.searchProducts({
       categoryUrlKey: currentCategory,
       filters: activeFilters,
       currentPage: currentPage
     });
     
     // Update category header
     if (result.categoryMetadata) {
       const titleEl = document.getElementById('category-title');
       const descEl = document.getElementById('category-description');
       
       if (titleEl) titleEl.textContent = result.categoryMetadata.name || 'All Products';
       if (descEl) descEl.textContent = result.categoryMetadata.description || '';
       
       // Update breadcrumbs
       updateBreadcrumbs(result.categoryMetadata);
     }
     
     // Render products...
   }
   ```

**Validation**:
- Category titles show correctly
- Breadcrumbs show hierarchical path (Home > Structural Materials > Lumber)
- Breadcrumb links navigate correctly

---

### Phase 4: URL State Management
**Goal**: Use dropin's URL state management (if available) or keep custom

**Decision Point**: 
- **If dropin provides URL state management**: Adopt it
- **If not**: Keep current implementation but ensure it works with dropin API

**Tasks**:
1. Test dropin's URL handling
2. If suitable, replace custom URL param logic
3. Ensure back/forward browser navigation works

**Validation**:
- URL reflects current state (category, filters, page)
- Shareable URLs work correctly
- Browser back/forward works

---

### Phase 5: Event-Driven Updates (Optional Enhancement)
**Goal**: Use dropin's event system for reactive updates

**Tasks**:
1. Subscribe to dropin events in product-grid
   ```javascript
   import { events } from '@dropins/storefront-product-discovery';
   
   events.on('search/loading', (isLoading) => {
     showLoadingState(isLoading);
   });
   
   events.on('search/result', ({ result }) => {
     renderProducts(result.products);
     renderFacets(result.facets);
     updatePagination(result.pageInfo);
     updateBreadcrumbs(result.categoryMetadata);
   });
   
   events.on('search/error', (error) => {
     showErrorMessage(error);
   });
   ```

2. Use event system for filter changes
   ```javascript
   // In filters-sidebar.js
   filterCheckbox.addEventListener('change', () => {
     // Emit event instead of direct function call
     window.dispatchEvent(new CustomEvent('filter-changed', {
       detail: { attribute, value, checked }
     }));
   });
   ```

**Validation**:
- Loading states work
- Error handling works
- Filters update grid reactively

---

### Phase 6: Testing & Cleanup
**Goal**: Ensure all functionality works, remove old code

**Tasks**:
1. **Functional Testing**
   - Category navigation (top-level + subcategories)
   - Faceted filtering
   - Pagination
   - Sorting
   - Breadcrumbs
   - Category headers
   - URL sharing
   - Browser back/forward

2. **Performance Testing**
   - Initial load time
   - Filter response time
   - Category switch time

3. **Code Cleanup**
   - Remove old catalog-service.js (if fully replaced)
   - Remove hardcoded category mappings
   - Remove manual GraphQL queries
   - Update documentation

4. **Documentation**
   - Update component architecture docs
   - Document dropin integration approach
   - Add troubleshooting guide

**Validation**:
- All tests pass
- No console errors
- Performance meets targets

---

## Benefits of Migration

### Immediate Benefits
- ✅ **Category metadata**: Automatic names, descriptions, breadcrumbs
- ✅ **Reduced maintenance**: No manual category mappings
- ✅ **Better error handling**: Dropin includes retry logic
- ✅ **Future-proof**: Adobe maintains and updates the dropin

### Long-term Benefits
- ✅ **New features**: Adobe adds features (AI search, recommendations) to dropin
- ✅ **Performance**: Adobe optimizes queries for ACO
- ✅ **Support**: Official support channel for issues
- ✅ **Consistency**: Same patterns as other dropins (auth, cart)

## Risks & Mitigations

### Risk 1: Dropin API doesn't support all features
**Mitigation**: 
- Research shows API is comprehensive
- Fallback: Keep custom implementation for specific features
- Gradual migration allows validation at each step

### Risk 2: UI customization limits
**Mitigation**: 
- API-only approach avoids UI constraints
- Custom rendering maintains complete control
- Slots available if needed

### Risk 3: Breaking changes in future dropin versions
**Mitigation**: 
- Pin dropin version in package.json
- Subscribe to Adobe's release notes
- Test updates in staging before production

## Timeline Estimate

- **Phase 1 (Setup)**: 2 hours
- **Phase 2 (API Integration)**: 4-6 hours
- **Phase 3 (Category Headers/Breadcrumbs)**: 2-3 hours
- **Phase 4 (URL State)**: 2 hours
- **Phase 5 (Events - Optional)**: 3-4 hours
- **Phase 6 (Testing & Cleanup)**: 3-4 hours

**Total**: ~16-21 hours (2-3 days)

## Success Criteria

- [ ] All products load correctly via dropin API
- [ ] Category filtering works (top-level + subcategories)
- [ ] Faceted navigation works with accurate counts
- [ ] Category headers show correct names dynamically
- [ ] Breadcrumbs show hierarchical paths
- [ ] Pagination works
- [ ] Sorting works
- [ ] URL state management works
- [ ] Browser back/forward works
- [ ] No console errors
- [ ] Performance equal or better than current implementation
- [ ] Custom design maintained 100%

## Next Steps

1. **Review & Approve**: Review this plan, adjust as needed
2. **Phase 1**: Install dropin and create basic integration
3. **Validate**: Test basic search functionality
4. **Iterate**: Complete phases 2-6
5. **Deploy**: Test in production environment

---

**Document Version**: 1.0  
**Date**: December 19, 2024  
**Author**: AI Agent  
**Status**: Proposed


