# Phase 6A Integration Summary

**Date**: December 2, 2025  
**Discovery**: BuildRight Service (production-ready GraphQL backend)  
**Impact**: Major architecture shift - from mock to real integration

---

## 🎯 Executive Summary

You have a **production-ready backend service** (`buildright-service`) that perfectly aligns with Phase 6A requirements. Instead of building mock BOM calculations in the frontend, we should integrate with the real GraphQL API.

### Key Benefits

✅ **Real ACO Integration** - Live product lookups with persona-specific pricing  
✅ **Automated Calculations** - Backend handles all BOM math and formulas  
✅ **SKU Overrides** - Selection packages automatically substitute correct products  
✅ **Phase Filtering** - Built-in support for ordering specific phases  
✅ **Rich Specifications** - Product details from ACO composable attributes  
✅ **Saves Time** - No need to build complex BOM logic in frontend

---

## 📊 What Changed

### Original Plan (Mocks)

```
buildright-eds
├── data/mock-products.json (local products)
├── scripts/aco-service.js (mock ACO)
└── scripts/builders/template-builder.js (local BOM calculations)
    └── Complex formulas, quantity math, phase grouping
```

### Updated Plan (Real Integration)

```
buildright-eds                     buildright-service                ACO
├── scripts/graphql/               ├── API Mesh (GraphQL)            └── Products
│   ├── apollo-client.js           ├── BOM Generation                └── Pricing
│   ├── queries.js                 ├── Persona Mapping
│   └── hooks.js                   └── Template Resolution
└── Simple UI (just pass IDs!)
```

---

## 🔄 Architecture Comparison

### Before (Mock)

```javascript
// Complex: Frontend calculates everything
const template = { sqft: 2450, width: 40, depth: 61.25, ... };
const package = { tier: 'premium', skuMappings: {...}, ... };

const measurements = calculateMeasurements(template);
const products = await findProductsLocally(package.tier);
const bom = {
  foundation: calculateFoundation(measurements, products),
  envelope: calculateEnvelope(measurements, products),
  interior: calculateInterior(measurements, products)
};
```

### After (GraphQL)

```javascript
// Simple: Backend handles everything
const bom = await apolloClient.query({
  query: GENERATE_BOM,
  variables: {
    templateId: "sedona-2450",
    variantId: "bonus-room",
    packageId: "desert-ridge-premium",
    selectedPhases: ["FOUNDATION_FRAMING", "ENVELOPE"]
  }
});
// Done! Backend returns complete BOM
```

---

## 📈 Complexity Reduction

| Aspect | Mock Approach | GraphQL Approach | Reduction |
|--------|---------------|------------------|-----------|
| **Lines of Code** | ~500 lines | ~100 lines | 80% |
| **Dependencies** | Custom math libraries | Apollo Client only | Simpler |
| **Data Management** | Mock products JSON | Live ACO queries | Real-time |
| **Calculations** | Manual formulas | Backend service | Reliable |
| **Testing** | Mock all calculations | Test API contract | Easier |

---

## 🗂️ Updated File Structure

### New Files to Create

```
buildright-eds/
├── scripts/
│   ├── graphql/                        # NEW: GraphQL integration
│   │   ├── apollo-client.js           # Apollo Client setup
│   │   ├── queries.js                 # Query definitions
│   │   └── hooks.js                   # Query wrappers
│   └── services/
│       └── persona-service.js          # NEW: Persona management
└── docs/
    └── phase-6/
        └── A-sarah-dashboard/
            ├── BACKEND-INTEGRATION-ANALYSIS.md    # NEW: Analysis
            └── UPDATED-IMPLEMENTATION-PLAN.md     # NEW: Revised plan
```

### Files to Modify

```
buildright-eds/
├── pages/
│   ├── build-configurator.html         # Call GraphQL instead of local
│   └── bom-review.html                 # Display GraphQL response
├── scripts/
│   ├── dashboards/
│   │   └── template-dashboard.js       # Already simplified ✅
│   └── builders/
│       └── build-configurator.js       # GraphQL integration
└── data/
    └── templates.json                  # May need ID alignment
```

---

## 🔑 Key Integration Points

### 1. Persona Headers (Simple!)

```javascript
// Get persona once per session
const persona = await getPersona(customerGroupId);

// Cache for all queries
localStorage.setItem('buildright_persona', JSON.stringify({
  catalogViewId: persona.catalogViewId,   // UUID for ACO catalog view
  priceBookId: persona.priceBookId        // String for price book
}));

// Apollo Client automatically adds these as headers
// X-Catalog-View-Id: 22c02790-7c5e-474d-a3b6-c72b22203be5
// X-Price-Book-Id: Production-Builder
```

### 2. BOM Generation (One Query!)

```graphql
query GenerateBOM {
  BuildRight_generateBOMFromTemplate(
    templateId: "sedona-2450"
    variantId: "bonus-room"
    packageId: "desert-ridge-premium"
    selectedPhases: [FOUNDATION_FRAMING, ENVELOPE]
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
        species
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
```

### 3. Package SKU Overrides (Automatic!)

**Frontend just passes packageId:**
```javascript
packageId: "desert-ridge-premium"
```

**Backend automatically applies overrides:**
```json
{
  "desert-ridge-premium": {
    "skuOverrides": [
      { "productType": "windows", "sku": "WIN-PELLA-350-DBL" },
      { "productType": "doors", "sku": "DOOR-JELD-PREMIUM" },
      { "productType": "roofing", "sku": "ROOF-SHINGLE-ARCH-DIM" }
    ]
  }
}
```

**Result:** BOM contains Pella windows, not generic windows!

---

## 📋 Updated Sub-Phases

| # | Sub-Phase | Status | Hours | Notes |
|---|-----------|--------|-------|-------|
| 1 | Dashboard Simplification | ✅ Done | 3h | No changes needed |
| 2 | Persona Integration | 🚧 Next | 2h | **NEW** - Get & cache persona |
| 3 | Apollo Client Setup | ⏭️ Pending | 3h | **NEW** - GraphQL client |
| 4 | GraphQL Query Hooks | ⏭️ Pending | 2h | **NEW** - Query utilities |
| 5 | Build Configurator | ⏭️ Pending | 5h | **UPDATED** - Use GraphQL |
| 6 | My Builds Dashboard | ⏭️ Pending | 4h | **UPDATED** - Save BOM responses |
| 7 | BOM Review Page | ⏭️ Pending | 3h | **UPDATED** - Display GraphQL data |
| 8 | Integration & Polish | ⏭️ Pending | 3h | **NEW** - E2E testing |

**Total: ~29 hours** (vs. original 22h + unmeasured backend work)

---

## 🎯 What We Get for "Free"

By integrating with the backend service, we get:

1. **Real Product Data**
   - Live ACO product catalog
   - Persona-specific pricing
   - Rich product specifications (brand, species, grade, etc.)

2. **Accurate Calculations**
   - Professional construction formulas
   - Tested and validated math
   - Industry-standard waste factors

3. **Production-Ready**
   - Proven service (already deployed)
   - Error handling built-in
   - Performance optimized

4. **Future-Proof**
   - Real data source (not mocks to replace later)
   - Scales to other personas
   - Ready for Commerce integration

---

## ⚠️ Potential Challenges

### Challenge 1: Template ID Mapping

**Issue:** Our template IDs don't match service IDs  
- EDS: `"sedona"` → Service: `"sedona-2450"`

**Solution:** Create ID mapping config
```javascript
const TEMPLATE_ID_MAP = {
  'sedona': 'sedona-2450',
  'prescott': 'ranch-1200',
  // ... etc
};
```

### Challenge 2: Package Data Format

**Issue:** Slightly different package structures  
- EDS: `skuMappings` object → Service: `skuOverrides` array

**Solution:** Backend handles this - we just pass IDs!

### Challenge 3: CORS/Network

**Issue:** Mesh endpoint might have CORS restrictions

**Solution:** 
- Test connection early (Sub-Phase 3)
- Contact service team if issues
- Fallback: Use proxy during development

---

## 📚 Documentation Generated

1. **BACKEND-INTEGRATION-ANALYSIS.md** (12 pages)
   - Detailed architecture analysis
   - Data structure comparison
   - GraphQL API reference
   - Security considerations

2. **UPDATED-IMPLEMENTATION-PLAN.md** (14 pages)
   - Revised sub-phases
   - Code examples for each phase
   - Updated timeline
   - Success criteria

3. **INTEGRATION-SUMMARY.md** (this document)
   - Executive summary
   - Key changes
   - Quick reference

---

## ✅ Recommended Next Steps

### Immediate (This Week)

1. **Review documents** with team ✅ (you are here!)
2. **Install dependencies**
   ```bash
   cd buildright-eds
   npm install @apollo/client graphql
   ```
3. **Test mesh connection**
   ```bash
   curl -X POST https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ __schema { types { name } } }"}'
   ```
4. **Begin Sub-Phase 2**: Persona Integration
5. **Set up Apollo Client** (Sub-Phase 3)

### Next Week

6. Create GraphQL query hooks
7. Build configurator with GraphQL
8. Implement BOM review page
9. End-to-end testing

---

## 🎉 Bottom Line

**Before:** Building everything from scratch with mocks  
**After:** Integrating with production-ready service

**Impact:**
- ⬇️ 80% less frontend code
- ⬆️ 100% more real data
- ✅ Production-ready from day 1
- 🚀 Faster implementation

**Recommendation:** **Proceed with GraphQL integration!**

---

**Questions?** See:
- [BACKEND-INTEGRATION-ANALYSIS.md](./BACKEND-INTEGRATION-ANALYSIS.md) - Deep dive
- [UPDATED-IMPLEMENTATION-PLAN.md](./UPDATED-IMPLEMENTATION-PLAN.md) - Detailed plan
- [buildright-service/docs/frontend/FRONTEND-INTEGRATION-GUIDE.md](../../../../buildright-service/docs/frontend/FRONTEND-INTEGRATION-GUIDE.md) - Service docs

---

**Last Updated:** December 2, 2025  
**Status:** Ready to proceed with integration  
**Decision:** ✅ Approve GraphQL integration approach

