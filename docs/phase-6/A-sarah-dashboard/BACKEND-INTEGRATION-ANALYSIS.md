# BuildRight Service Integration Analysis

**Date**: December 2, 2025  
**Status**: Architecture review complete - Plan needs updating

---

## Executive Summary

The **buildright-service** repository contains a **production-ready backend** that perfectly aligns with Phase 6A requirements. This analysis reviews how it changes our implementation plan.

### Key Finding

🎯 **We should integrate with the real backend service instead of building mocks!**

**Why:**
- ✅ Service is production-ready with API Mesh + ACO integration
- ✅ Matches Phase 6A requirements exactly (templates, variants, packages, phases)
- ✅ Provides real SKU lookups, pricing, and BOM calculations
- ✅ Header-based architecture is simple and clean
- ✅ Saves 2-3 weeks of backend work in EDS

---

## Service Architecture

### 1. Context Delegation Pattern

```
buildright-eds (Frontend)           buildright-service (Backend)         ACO
─────────────────────────           ────────────────────────────         ───

1. Get persona once per session
   └─> GraphQL: BuildRight_personaForCustomer(customerGroupId: "1")
       Returns: { catalogViewId, priceBookId }
       ↓
   Cache in localStorage/React Context

2. Send headers with all queries
   ├─> X-Catalog-View-Id: "22c02790-..."
   └─> X-Price-Book-Id: "Production-Builder"

3. Generate BOM
   └─> GraphQL: BuildRight_generateBOMFromTemplate(
         templateId: "sedona-2450",
         variantId: "bonus-room",
         packageId: "desert-ridge-premium",
         selectedPhases: [FOUNDATION_FRAMING, ENVELOPE]
       )
       ├─> Mesh resolves template/variant/package data
       ├─> Queries ACO for products (filtered by catalog view)
       ├─> Applies package SKU overrides
       ├─> Calculates quantities
       └─> Returns BOM with line items
```

**Key Insight:** Frontend just passes IDs. Backend handles all calculations.

---

## Data Structure Comparison

### Templates

**buildright-service** format:
```json
{
  "sedona-2450": {
    "id": "sedona-2450",
    "name": "Sedona 2450",
    "baseSpecs": {
      "sqft": 2450,
      "stories": 1,
      "bedrooms": 3,
      "bathrooms": 2,
      "dimensions": {
        "width": 40,
        "depth": 61.25,
        "wallHeight": 8,
        "stories": 1
      }
    },
    "availableVariants": ["standard", "bonus-room", "3-car-garage"],
    "availablePackages": ["builders-choice", "desert-ridge-premium"]
  }
}
```

**buildright-eds** current format (templates.json):
```json
{
  "templates": [
    {
      "id": "sedona",
      "name": "The Sedona",
      "sqft": 2450,
      "stories": 2,
      "bedrooms": 4,
      "bathrooms": 2.5,
      "foundation": "Slab",
      "variants": [
        { "id": "sedona-standard", "name": "Standard", "sqft": 2450 },
        { "id": "sedona-bonus", "name": "Bonus Room", "sqft": 2650 }
      ],
      "compatiblePackages": ["builders-choice", "desert-ridge-premium"]
    }
  ]
}
```

**Action Required:** ✅ Our EDS format is compatible! Just need to map IDs correctly.

---

### Selection Packages

**buildright-service** format:
```json
{
  "desert-ridge-premium": {
    "id": "desert-ridge-premium",
    "name": "Desert Ridge Premium",
    "tier": 2,
    "skuOverrides": [
      { "productType": "windows", "sku": "WIN-PELLA-350-DBL" },
      { "productType": "doors", "sku": "DOOR-JELD-PREMIUM" },
      { "productType": "roofing", "sku": "ROOF-SHINGLE-ARCH-DIM" }
    ]
  }
}
```

**buildright-eds** current format (templates.json packages):
```json
{
  "packages": [
    {
      "id": "desert-ridge-premium",
      "name": "Desert Ridge Premium",
      "tier": "premium",
      "addedCost": 18000,
      "skuMappings": {
        "windows_casement": "WINDOW-8F26E917",
        "doors_patio": "DOOR-E93CC71C"
      }
    }
  ]
}
```

**Action Required:** ⚠️ Need to align formats. Backend uses `skuOverrides` array, we use `skuMappings` object.

---

### BOM Response

**buildright-service** returns:
```json
{
  "totalCost": { "value": 58432.50, "currency": "USD" },
  "lineItems": [
    {
      "sku": "LBR-2X4-8FT-SPF",
      "name": "2x4 x 8' Kiln-Dried Stud",
      "quantity": 485,
      "unit": "EA",
      "unitPrice": { "value": 3.50, "currency": "USD" },
      "totalPrice": { "value": 1697.50, "currency": "USD" },
      "category": "Framing",
      "phase": "FOUNDATION_FRAMING",
      "specifications": {
        "brand": "BuildMaster",
        "qualityTier": "builder_grade",
        "species": "spruce_pine_fir"
      }
    }
  ],
  "phases": [
    {
      "phase": "FOUNDATION_FRAMING",
      "totalCost": { "value": 15234.00, "currency": "USD" },
      "percentageOfTotal": 26,
      "lineItems": [ /* filtered to this phase */ ]
    }
  ],
  "metadata": {
    "templateId": "sedona-2450",
    "packageId": "desert-ridge-premium",
    "variantId": "bonus-room",
    "selectedPhases": ["FOUNDATION_FRAMING", "ENVELOPE"],
    "appliedOverrides": 4,
    "generatedAt": "2025-12-02T10:30:00Z"
  }
}
```

**Action Required:** ✅ Perfect! This is exactly what we need for the BOM review page.

---

## GraphQL API

### Endpoint
```
https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql
```

### Query 1: Get Persona (once per session)

```graphql
query GetPersona($customerGroupId: String!) {
  BuildRight_personaForCustomer(customerGroupId: $customerGroupId) {
    id                # "production-builder"
    name              # "Sarah Martinez - Production Builder"
    tier              # 2
    catalogViewId     # "22c02790-7c5e-474d-a3b6-c72b22203be5"
    priceBookId       # "Production-Builder"
    features          # ["templates", "phases", "variants"]
  }
}
```

**Frontend Action:**
1. Call this once on login
2. Cache `catalogViewId` and `priceBookId` in localStorage
3. Add these as headers to all subsequent queries

### Query 2: Generate BOM (from configurator)

```graphql
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
    totalCost {
      value
      currency
    }
    lineItems {
      sku
      name
      quantity
      unit
      unitPrice { value currency }
      totalPrice { value currency }
      category
      phase
      specifications {
        brand
        qualityTier
        species
        dimension
      }
    }
    phases {
      phase
      totalCost { value currency }
      percentageOfTotal
      lineItems { sku name quantity }
    }
    metadata {
      templateId
      packageId
      variantId
      squareFootage
      selectedPhases
      appliedOverrides
      generatedAt
    }
  }
}
```

**Frontend Variables:**
```javascript
{
  templateId: "sedona-2450",
  variantId: "bonus-room",
  packageId: "desert-ridge-premium",
  selectedPhases: ["FOUNDATION_FRAMING", "ENVELOPE"]
}
```

**Headers (from cached persona):**
```javascript
{
  'X-Catalog-View-Id': '22c02790-7c5e-474d-a3b6-c72b22203be5',
  'X-Price-Book-Id': 'Production-Builder'
}
```

---

## Impact on Phase 6A Plan

### What STAYS the Same ✅

1. **Sub-Phase 1: Dashboard Simplification** - ✅ DONE
   - No backend integration needed
   - Just UI cleanup

2. **Sub-Phase 2: Template Selection Page** - Optional
   - Can skip (dashboard already has templates)

3. **Sub-Phase 3: Build Configurator** - ✅ KEEP
   - Still need UI for:
     - Template selection
     - Variant selection (Standard, Bonus Room, 3-Car Garage)
     - Package selection (Builder's Choice, Desert Ridge Premium)
     - Phase selection (checkboxes for Foundation, Envelope, Interior)
   - Just calls GraphQL instead of local functions

4. **Sub-Phase 5: My Builds Dashboard** - ✅ KEEP (modified)
   - Needs ProjectManager for saving builds
   - But BOMs come from service, not local calculations

5. **Sub-Phase 6: BOM Review Page** - ✅ KEEP
   - Displays BOM from GraphQL response
   - Grouped by phase (from `bom.phases[]`)

6. **Sub-Phase 7: Integration & Polish** - ✅ KEEP
   - Test end-to-end with real service

### What CHANGES ⚠️

**Sub-Phase 4: BOM Generation Update** ❌ DELETE
- **Old plan**: Update `template-builder.js` to calculate BOMs locally
- **New plan**: Delete this! Backend handles it via GraphQL

**New Sub-Phase 4: Apollo Client Setup** 🆕
- Install Apollo Client
- Configure mesh endpoint
- Implement persona header middleware
- Create GraphQL query hooks

### New Sub-Phases Needed 🆕

**Sub-Phase 3.5: Persona Integration** (1-2h)
- Get persona on login/page load
- Cache catalogViewId + priceBookId in localStorage
- Display persona info in header

**Sub-Phase 4: Apollo Client Setup** (2-3h)
- Install: `@apollo/client graphql`
- Create `apolloClient.js` with mesh endpoint
- Create persona header middleware
- Test connection with GetPersona query

**Sub-Phase 4.5: GraphQL Query Hooks** (1-2h)
- Create `usePersona()` hook
- Create `useGenerateBOM()` hook
- Error handling and loading states

---

## Updated Implementation Plan

### Phase 6A Revised Timeline

**Week 1:**

| Day | Sub-Phase | Hours | Status |
|-----|-----------|-------|--------|
| Mon | 1: Dashboard Simplification | 2-3h | ✅ **DONE** |
| Tue | 3.5: Persona Integration | 2h | 🚧 **NEXT** |
| Wed | 4: Apollo Client Setup | 3h | ⏭️ Pending |
| Thu | 4.5: GraphQL Query Hooks | 2h | ⏭️ Pending |
| Fri | 3: Build Configurator (start) | 4h | ⏭️ Pending |

**Week 2:**

| Day | Sub-Phase | Hours | Status |
|-----|-----------|-------|--------|
| Mon-Tue | 3: Build Configurator (finish) | 6h | ⏭️ Pending |
| Wed | 5: My Builds Dashboard | 4h | ⏭️ Pending |
| Thu | 6: BOM Review Page | 3h | ⏭️ Pending |
| Fri | 7: Integration & Polish | 2h | ⏭️ Pending |

**Total: ~28 hours over 2 weeks** (vs. original 22 hours + backend work)

---

## Technical Debt / Future Work

### Data Alignment

**Issue:** Our templates.json vs. service templates.json have different structures

**Solution:**
- **Short-term (Phase 6A)**: Map IDs in frontend (e.g., `sedona` → `sedona-2450`)
- **Long-term (Phase 6B)**: Unify data sources, pull templates from service

### Selection Packages

**Issue:** We have packages in templates.json, service has packages.json

**Solution:**
- **Short-term**: Keep both, use service packages for BOM generation
- **Long-term**: Service becomes single source of truth for all data

### Mock vs. Real Data

**Issue:** We have mock-products.json with local products

**Solution:**
- **Phase 6A**: BOM comes from real ACO via service
- **Product browsing**: Can still use mock data for catalog page
- **Phase 6B**: Migrate catalog to service productSearch query

---

## Dependencies & Prerequisites

### Required

1. **Mesh Endpoint Access** ✅
   - URL: `https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql`
   - Headers: `X-Catalog-View-Id`, `X-Price-Book-Id`

2. **Persona Mapping**
   - Need to know Sarah's `customerGroupId` (from docs: `"1"`)

3. **Template ID Mapping**
   - Map our template IDs to service template IDs
   - Example: `"sedona"` → `"sedona-2450"`

### Optional (Nice to Have)

1. **GraphQL Code Generator**
   - Generate TypeScript types from schema
   - Better autocomplete and type safety

2. **Apollo DevTools**
   - Browser extension for debugging GraphQL queries

---

## Security Considerations

### Development Mode

**Current approach (acceptable for demo):**
- Hardcoded customer group IDs
- Headers sent from browser
- No authentication

**Why it's okay:**
- This is a demo system
- Real authentication in production (Commerce customer sessions)

### Production (Future)

**Required changes:**
- Integrate with Adobe Commerce authentication
- Customer group ID from Commerce session
- Backend validates user can access requested persona

---

## Success Criteria

### Integration Complete When:

- [ ] Apollo Client configured with mesh endpoint
- [ ] Persona headers automatically added to all queries
- [ ] Build configurator successfully generates BOM via GraphQL
- [ ] BOM review page displays real BOM from service
- [ ] Phase filtering works (select Foundation + Envelope only)
- [ ] Package SKU overrides apply correctly (Pella windows, not generic)
- [ ] Pricing reflects Sarah's customer group (Commercial Tier 2)
- [ ] Error handling works (network failures, missing headers)
- [ ] Loading states display during GraphQL queries

---

## Next Steps

1. **Review this analysis with team** ✅
2. **Update Phase 6A plan document** (THIS DOCUMENT)
3. **Install Apollo Client** (`npm install @apollo/client graphql`)
4. **Implement persona integration** (Sub-Phase 3.5)
5. **Set up Apollo Client** (Sub-Phase 4)
6. **Build configurator with GraphQL** (Sub-Phase 3)
7. **Test end-to-end**

---

## Questions for Discussion

### Q1: Should we use Apollo Client or plain fetch?

**Recommendation:** Apollo Client

**Pros:**
- Built-in caching
- Automatic request deduplication
- React hooks integration
- Better error handling
- DevTools support

**Cons:**
- Adds dependency (~45 KB gzipped)
- Learning curve if team unfamiliar

**Alternative:** Plain `fetch()` with manual header management

### Q2: Where should persona data be cached?

**Options:**
1. **localStorage** - Persists across page reloads
2. **sessionStorage** - Cleared on tab close
3. **React Context** - In-memory only
4. **Apollo Cache** - Managed by Apollo Client

**Recommendation:** localStorage + React Context (belt and suspenders)

### Q3: Should we keep mock-products.json?

**Recommendation:** Yes, for now

**Use cases:**
- Catalog browsing (not BOM generation)
- Offline development
- Testing without backend

**Future:** Migrate catalog to `BuildRight_searchProducts` query

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2025  
**Status:** Analysis complete, awaiting plan update

