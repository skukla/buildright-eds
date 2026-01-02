# Phase 6A: Updated Implementation Plan (with Backend Integration)

**Date**: December 2, 2025  
**Last Updated**: December 10, 2025  
**Status**: Active - Sub-Phase 5 (Build Configurator) next

---

## Major Change: Real Backend Integration! 🎉

**Discovery:** The `buildright-service` repository contains a **production-ready GraphQL API** that:
- Generates BOMs from template IDs (no complex objects needed!)
- Integrates with real ACO for product lookups and pricing
- Handles package SKU overrides automatically
- Supports phase-based filtering
- Uses header-based persona system (simple and clean!)

**Impact:** We're replacing mock BOM calculations with real GraphQL queries.

---

## Updated Sub-Phases

### ✅ Sub-Phase 1: Dashboard Simplification (COMPLETE)

**Status**: ✅ Done  
**Changes**: None - this was pure UI work

**Deliverables:**
- Simplified template dashboard
- Removed sort/filter UI
- Removed statistics displays
- Added "Start New Build" primary action
- 70% code reduction

---

### ✅ Sub-Phase 2: Persona Integration (COMPLETE)

**Status**: ✅ Done (December 10, 2025)

**What was done:**
- Created persona action as single source of truth (`buildright-service/actions/persona/`)
- Added JSON and Commerce data sources with `PERSONA_DATA_SOURCE` toggle
- New GraphQL queries: `personaByEmail`, `personas` list
- Commerce customers have ACO attributes populated (`aco_catalog_view_id`, `aco_price_book_id`)
- Updated `PERSONA-SERVICE.md` documentation

**Key Files:**
- `buildright-service/actions/persona/index.js` - Persona action
- `buildright-service/actions/persona/data/persona-mappings.json` - JSON mappings
- `buildright-commerce/scripts/config/commerce-config.js` - Customer definitions with ACO attributes
- `buildright-eds/scripts/services/mesh-client.js` - Already has persona header caching

---

### ⏭️ Sub-Phase 3: Apollo Client Setup (SKIPPED)

**Status**: ⏭️ Skipped  
**Reason**: `mesh-client.js` already provides GraphQL client functionality with persona headers.
Using fetch-based approach is simpler and already working.

---

### ⏭️ Sub-Phase 4: GraphQL Query Hooks (SKIPPED)

**Status**: ⏭️ Skipped  
**Reason**: `mesh-client.js` already has query functions:
- `initializePersona(customerGroupId)` - Gets and caches persona
- `searchProducts(phrase, options)` - Product search
- `generateBOM(config)` - BOM generation
- `getProductBySKU(sku)` - Single product lookup

---

### 🚧 Sub-Phase 5: Build Configurator (NEXT)

**Code Example:**
```javascript
// scripts/graphql/apollo-client.js
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql'
});

const personaHeaderLink = setContext((_, { headers }) => {
  const persona = JSON.parse(localStorage.getItem('buildright_persona'));
  
  if (!persona) {
    console.warn('No persona found - queries may fail');
    return { headers };
  }
  
  return {
    headers: {
      ...headers,
      'X-Catalog-View-Id': persona.catalogViewId,
      'X-Price-Book-Id': persona.priceBookId
    }
  };
});

export const apolloClient = new ApolloClient({
  link: personaHeaderLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

**Deliverables:**
- Apollo Client configured
- Headers automatically added
- Test query successful
- Error handling for missing persona

---

### 🆕 Sub-Phase 4: GraphQL Query Hooks (NEW)

**Status**: ⏭️ Pending  
**Time**: 1-2 hours  
**Prerequisites**: Sub-Phase 3 complete

**What**: Create reusable GraphQL query utilities

**Tasks:**
1. Create `scripts/graphql/queries.js` with query definitions
2. Create `scripts/graphql/hooks.js` with query wrappers
3. Add loading and error states
4. Test with real queries

**Code Example:**
```javascript
// scripts/graphql/queries.js
export const GET_PERSONA = `
  query GetPersona($customerGroupId: String!) {
    BuildRight_personaForCustomer(customerGroupId: $customerGroupId) {
      id
      name
      tier
      catalogViewId
      priceBookId
      features
    }
  }
`;

export const GENERATE_BOM = `
  query GenerateBOM(
    $templateId: String!
    $variantId: String
    $packageId: String!
    $selectedPhases: [ConstructionPhase!]
  ) {
    BuildRight_generateBOMFromTemplate(
      templateId: $templateId
      variantId: $variantId
      packageId: $packageId
      selectedPhases: $selectedPhases
    ) {
      totalCost { value currency }
      lineItems {
        sku
        name
        quantity
        unit
        unitPrice { value currency }
        totalPrice { value currency }
        phase
        specifications {
          brand
          qualityTier
        }
      }
      phases {
        phase
        totalCost { value currency }
        percentageOfTotal
      }
      metadata {
        templateId
        packageId
        variantId
        selectedPhases
        appliedOverrides
      }
    }
  }
`;

// scripts/graphql/hooks.js
export async function generateBOM(templateId, variantId, packageId, selectedPhases) {
  try {
    const result = await apolloClient.query({
      query: GENERATE_BOM,
      variables: {
        templateId,
        variantId,
        packageId,
        selectedPhases: selectedPhases || undefined
      }
    });
    
    return result.data.BuildRight_generateBOMFromTemplate;
  } catch (error) {
    console.error('Error generating BOM:', error);
    throw error;
  }
}
```

**Deliverables:**
- Query definitions
- Query wrapper functions
- Error handling
- Loading states

---

### 📝 Sub-Phase 5: Build Configurator (UPDATED)

**Status**: ⏭️ Pending  
**Time**: 4-6 hours  
**Prerequisites**: Sub-Phase 4 complete

**What**: UI for template/variant/package/phase selection

**Changes from original plan:**
- ✅ Still need template selection UI
- ✅ Still need variant selection UI
- ✅ Still need package selection UI
- ✅ Still need phase selection UI
- ❌ **NO local BOM calculations!**
- ✅ **Call GraphQL query instead!**

**Tasks:**
1. Create `pages/build-configurator.html`
2. Create `scripts/builders/build-configurator.js`
3. Implement sidebar layout with progress
4. Implement variant selection (radio cards)
5. Implement package selection (card grid with descriptions)
6. Implement phase selection (checkboxes)
7. Implement real-time cost preview (optional)
8. Wire up "Generate BOM" button to GraphQL query
9. Handle loading state during BOM generation
10. Redirect to BOM review on success

**Code Example:**
```javascript
// scripts/builders/build-configurator.js
import { generateBOM } from '../graphql/hooks.js';

class BuildConfigurator {
  constructor(templateId) {
    this.templateId = templateId;
    this.selectedVariant = 'standard';
    this.selectedPackage = null;
    this.selectedPhases = [];
  }
  
  async handleGenerateBOM() {
    // Show loading overlay
    this.showLoading('Generating Bill of Materials...');
    
    try {
      // Call GraphQL query
      const bom = await generateBOM(
        this.templateId,
        this.selectedVariant,
        this.selectedPackage,
        this.selectedPhases.length > 0 ? this.selectedPhases : null
      );
      
      // Save BOM to localStorage for review page
      localStorage.setItem('current_bom', JSON.stringify(bom));
      
      // Navigate to review page
      window.location.href = '/pages/bom-review.html';
      
    } catch (error) {
      this.showError('Failed to generate BOM. Please try again.');
    } finally {
      this.hideLoading();
    }
  }
}
```

**Deliverables:**
- Build configurator page
- Template/variant/package/phase selection UI
- GraphQL integration
- Loading states
- Error handling
- Navigation to BOM review

---

### 📝 Sub-Phase 6: My Builds Dashboard (UPDATED)

**Status**: ⏭️ Pending  
**Time**: 3-4 hours  
**Prerequisites**: Sub-Phase 5 complete

**What**: Dashboard showing saved builds and past BOMs

**Changes from original plan:**
- ✅ Still need ProjectManager for saving builds
- ✅ BOMs come from GraphQL (save response in project)
- ❌ No local BOM re-calculation

**Tasks:**
1. Create dashboard view for "My Builds"
2. Display saved projects (from ProjectManager)
3. Show BOM summary per build
4. "Re-order Materials" button (re-generates BOM)
5. "Clone Build" button (duplicate configuration)
6. Filter by status (active, completed, archived)

**Deliverables:**
- My Builds dashboard view
- Project listing
- Re-order functionality
- Clone functionality

---

### 📝 Sub-Phase 7: BOM Review Page (UPDATED)

**Status**: ⏭️ Pending  
**Time**: 2-3 hours  
**Prerequisites**: Sub-Phase 5 complete

**What**: Display generated BOM with phase grouping

**Changes from original plan:**
- ✅ Display BOM from GraphQL response (not local calculations)
- ✅ Use `bom.phases[]` for grouping
- ✅ Show rich specifications from ACO

**Tasks:**
1. Create `pages/bom-review.html`
2. Load BOM from localStorage (set by configurator)
3. Display BOM summary (total cost, phase breakdown)
4. Display line items grouped by phase
5. Show product specifications (brand, quality tier, etc.)
6. "Edit Configuration" button (back to configurator)
7. "Add to Cart" button (add all line items)
8. Print/Export functionality

**Code Example:**
```javascript
// scripts/bom-review.js
function renderBOMReview() {
  const bom = JSON.parse(localStorage.getItem('current_bom'));
  
  const html = `
    <div class="bom-review">
      <h1>Bill of Materials</h1>
      
      <div class="bom-summary">
        <div class="total-cost">
          <span class="label">Total Cost:</span>
          <span class="value">$${bom.totalCost.value.toLocaleString()}</span>
        </div>
        
        <div class="metadata">
          <p>Template: ${bom.metadata.templateId}</p>
          <p>Package: ${bom.metadata.packageId}</p>
          <p>Variant: ${bom.metadata.variantId || 'Standard'}</p>
          <p>Phases: ${bom.metadata.selectedPhases?.join(', ') || 'All'}</p>
          <p>SKU Overrides: ${bom.metadata.appliedOverrides || 0}</p>
        </div>
      </div>
      
      ${bom.phases.map(phase => `
        <div class="phase-section">
          <h2>${formatPhase(phase.phase)}</h2>
          <p class="phase-cost">
            $${phase.totalCost.value.toLocaleString()} 
            (${phase.percentageOfTotal.toFixed(1)}% of total)
          </p>
          
          <table class="line-items">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${phase.lineItems.map(item => `
                <tr>
                  <td>${item.sku}</td>
                  <td>${item.name}</td>
                  <td>${item.specifications?.brand || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>$${item.unitPrice.value.toFixed(2)}</td>
                  <td>$${item.totalPrice.value.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      
      <div class="actions">
        <button class="btn btn-secondary" onclick="history.back()">
          Edit Configuration
        </button>
        <button class="btn btn-primary" onclick="addBOMToCart()">
          Add to Cart
        </button>
      </div>
    </div>
  `;
  
  return html;
}
```

**Deliverables:**
- BOM review page
- Phase-grouped display
- Product specifications shown
- Add to cart functionality
- Edit/back navigation

---

### 📝 Sub-Phase 8: Integration & Polish

**Status**: ⏭️ Pending  
**Time**: 2-3 hours  
**Prerequisites**: All previous sub-phases complete

**What**: End-to-end testing and refinement

**Tasks:**
1. Test complete flow: Dashboard → Configurator → BOM Review → Cart
2. Test persona switching (different customer groups)
3. Test phase filtering (select 1, 2, or all 3 phases)
4. Test package SKU overrides (verify Pella windows in BOM)
5. Error handling for network failures
6. Loading states everywhere
7. Mobile responsive testing
8. Cross-browser testing (Chrome, Safari, Firefox)
9. Performance optimization
10. Documentation updates

**Deliverables:**
- Complete user flow working
- All error cases handled
- Loading states everywhere
- Mobile responsive
- Documentation updated

---

## Updated Timeline

### Week 1 (December 2-6, 2025)

| Day | Sub-Phase | Hours | Status |
|-----|-----------|-------|--------|
| Mon | 1: Dashboard Simplification | 3h | ✅ **DONE** |
| Tue | 2: Persona Integration | 2h | 🚧 **NEXT** |
| Wed | 3: Apollo Client Setup | 3h | ⏭️ Pending |
| Thu | 4: GraphQL Query Hooks | 2h | ⏭️ Pending |
| Fri | 5: Build Configurator (start) | 3h | ⏭️ Pending |

### Week 2 (December 9-13, 2025)

| Day | Sub-Phase | Hours | Status |
|-----|-----------|-------|--------|
| Mon | 5: Build Configurator (finish) | 4h | ⏭️ Pending |
| Tue | 6: My Builds Dashboard | 4h | ⏭️ Pending |
| Wed | 7: BOM Review Page | 3h | ⏭️ Pending |
| Thu | 8: Integration & Polish | 3h | ⏭️ Pending |
| Fri | Buffer / Documentation | 2h | ⏭️ Pending |

**Total: ~29 hours over 2 weeks**

---

## Dependencies

### Required NPM Packages

```bash
npm install @apollo/client graphql
```

### Required Access

- ✅ Mesh GraphQL endpoint: `https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql`
- ✅ Sarah's customerGroupId: `"1"` (from persona mappings)

### Data Alignment

**Template ID mapping:**
- EDS: `"sedona"` → Service: `"sedona-2450"`
- EDS: `"prescott"` → Service: `"ranch-1200"` (or create new?)

**Action**: Create ID mapping config file

---

## Success Criteria

### Technical

- [ ] Apollo Client configured and working
- [ ] Persona headers automatically added to all queries
- [ ] BOM generation works via GraphQL
- [ ] Phase filtering works correctly
- [ ] Package SKU overrides applied (Pella windows vs. generic)
- [ ] Pricing reflects Sarah's customer group
- [ ] Error handling for network failures
- [ ] Loading states during async operations
- [ ] No console errors
- [ ] No linter errors

### User Experience

- [ ] Sarah can select template
- [ ] Sarah can choose variant (Standard, Bonus Room, etc.)
- [ ] Sarah can select package (Builder's Choice, Desert Ridge Premium)
- [ ] Sarah can filter phases (Foundation, Envelope, Interior)
- [ ] BOM generates in 2-3 seconds
- [ ] BOM displays rich product info (brand, specs)
- [ ] Costs are accurate and match persona pricing
- [ ] Flow feels fast and responsive
- [ ] Mobile experience works

### Business

- [ ] Demonstrates real ACO integration
- [ ] Shows persona-specific pricing
- [ ] Demonstrates package SKU overrides
- [ ] Phase-based ordering workflow clear
- [ ] Ready for demo to stakeholders

---

## Risks & Mitigations

### Risk 1: Mesh endpoint not accessible

**Mitigation**: Test connection early (Sub-Phase 3)  
**Fallback**: Use mock GraphQL server locally

### Risk 2: Data structure mismatches

**Mitigation**: Create mapping layer for IDs  
**Fallback**: Update EDS data to match service format

### Risk 3: CORS issues

**Mitigation**: Verify CORS headers on mesh endpoint  
**Fallback**: Use proxy server during development

### Risk 4: Apollo Client bundle size

**Mitigation**: Monitor bundle size, use code splitting  
**Fallback**: Use plain fetch() if bundle too large

---

## Next Steps

1. ✅ Complete this updated plan review
2. 🚧 Begin Sub-Phase 2: Persona Integration
3. Install Apollo Client dependencies
4. Test mesh endpoint connection
5. Implement configurator with GraphQL
6. End-to-end testing

---

**Document Version:** 2.0  
**Last Updated:** December 2, 2025  
**Status:** Active - Backend integration in progress  
**Previous Version:** Local BOM calculations (superseded)

