# ACO Source Header Requirements

**What it explains**: Why the two ACO sources have different header configurations
**Audience**: Technical consultants, solution architects, developers debugging ACO issues

---

## The Header Conflict Problem

ACO (Adobe Commerce Optimizer) has inconsistent header requirements across different APIs. This visual explains why BuildRight configures its two ACO sources differently.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    THE ACO HEADER CONFLICT                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   NAVIGATION API                           PRODUCT API + PRICING                │
│   ══════════════                           ═════════════════════                │
│                                                                                 │
│   Headers REQUIRED:                        Headers REQUIRED:                    │
│   ┌─────────────────────────┐              ┌─────────────────────────┐          │
│   │ AC-Environment-Id   ✅  │              │ AC-View-Id          ✅  │          │
│   │ AC-Scope-Locale     ✅  │              │ AC-Price-Book-Id    ✅  │          │
│   │ AC-View-Id          ✅  │              │ AC-Source-Locale    ✅  │          │
│   └─────────────────────────┘              └─────────────────────────┘          │
│                                                                                 │
│   Without AC-Environment-Id:               With AC-Environment-Id:              │
│   ┌─────────────────────────┐              ┌─────────────────────────┐          │
│   │ ❌ "Missing environment │              │ ❌ Products return NULL │          │
│   │    id, header:          │              │    when combined with   │          │
│   │    AC-Environment-Id"   │              │    AC-Price-Book-Id     │          │
│   └─────────────────────────┘              └─────────────────────────┘          │
│                                                                                 │
│   ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│   THE CONFLICT: AC-Environment-Id is REQUIRED for navigation                   │
│                 but BREAKS product queries with price books                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Our Solution: Different Headers Per Source

BuildRight configures its two ACO sources with different headers to satisfy both APIs:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DUAL SOURCE HEADER STRATEGY                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌───────────────────────────────────┐    ┌───────────────────────────────────┐│
│   │         ACO_BuildRight            │    │          ACO_Dropins              ││
│   │    (Navigation & Custom Queries)  │    │      (Product & Pricing)          ││
│   ├───────────────────────────────────┤    ├───────────────────────────────────┤│
│   │                                   │    │                                   ││
│   │   Headers Sent:                   │    │   Headers Sent:                   ││
│   │   ┌───────────────────────────┐   │    │   ┌───────────────────────────┐   ││
│   │   │ AC-Environment-Id     ✅  │   │    │   │ AC-Environment-Id     ❌  │   ││
│   │   │ AC-Source-Locale      ✅  │   │    │   │ AC-Source-Locale      ✅  │   ││
│   │   │ AC-View-Id            ✅  │   │    │   │ AC-View-Id            ✅  │   ││
│   │   │ AC-Price-Book-Id      ✅  │   │    │   │ AC-Price-Book-Id      ✅  │   ││
│   │   │ Magento-Website-Code  ✅  │   │    │   │ Magento-Website-Code  ✅  │   ││
│   │   └───────────────────────────┘   │    │   └───────────────────────────┘   ││
│   │                                   │    │                                   ││
│   │   Used By:                        │    │   Used By:                        ││
│   │   • categories.js (navigation)    │    │   • dropin-plp.js (product grid)  ││
│   │   • breadcrumbs.js                │    │   • dropin-pdp.js (product detail)││
│   │   • product-search.js             │    │   • Schema type provider          ││
│   │                                   │    │                                   ││
│   │   Prefix: BuildRight_             │    │   Prefix: (none)                  ││
│   │                                   │    │                                   ││
│   └───────────────────────────────────┘    └───────────────────────────────────┘│
│                                                                                 │
│              ▼                                           ▼                      │
│   Navigation works with                     Products work with                  │
│   AC-Environment-Id ✅                      Price Books ✅                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Query Flow with Headers

How the headers flow from frontend through mesh to ACO:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    HEADER FLOW: NAVIGATION                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Frontend                                                                      │
│      │                                                                          │
│      │  Headers sent:                                                           │
│      │  • AC-View-Id: "US-Retail"                                               │
│      │                                                                          │
│      ▼                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                        API Mesh                                         │   │
│   │                                                                         │   │
│   │   Query: BuildRight_getCategories                                       │   │
│   │   Uses source: ACO_BuildRight                                           │   │
│   │                                                                         │   │
│   │   Headers added by mesh.config.js:                                      │   │
│   │   • AC-Environment-Id: "{env.TENANT_ID}"  ← Added from environment      │   │
│   │   • AC-Source-Locale: "{env.SOURCE_LOCALE}"                             │   │
│   │   • AC-View-Id: "{context.headers["ac-view-id"]}"  ← Forwarded          │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│      │                                                                          │
│      ▼                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    ACO Navigation API                                   │   │
│   │                                                                         │   │
│   │   Receives all required headers → Returns categories ✅                 │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                    HEADER FLOW: PRODUCT PRICING                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Frontend                                                                      │
│      │                                                                          │
│      │  Headers sent:                                                           │
│      │  • AC-View-Id: "US-Retail"                                               │
│      │  • AC-Price-Book-Id: "US-Retail"                                         │
│      │                                                                          │
│      ▼                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                        API Mesh                                         │   │
│   │                                                                         │   │
│   │   Query: productSearch (via dropin adapter)                             │   │
│   │   Uses source: ACO_Dropins                                              │   │
│   │                                                                         │   │
│   │   Headers added by mesh.config.js:                                      │   │
│   │   • AC-Environment-Id: (NOT INCLUDED)  ← Intentionally omitted!         │   │
│   │   • AC-Source-Locale: "{env.SOURCE_LOCALE}"                             │   │
│   │   • AC-View-Id: "{context.headers["ac-view-id"]}"                       │   │
│   │   • AC-Price-Book-Id: "{context.headers["ac-price-book-id"]}"           │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│      │                                                                          │
│      ▼                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    ACO Merchandising API                                │   │
│   │                                                                         │   │
│   │   No AC-Environment-Id conflict → Products with prices returned ✅      │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Header Requirements Reference

| Header | Navigation API | Product API | Notes |
|--------|---------------|-------------|-------|
| `AC-Environment-Id` | ✅ Required | ❌ Conflicts with pricing | Set in ACO_BuildRight only |
| `AC-View-Id` | ✅ Required | ✅ Required | Controls product visibility |
| `AC-Price-Book-Id` | ➖ Optional | ✅ Required for pricing | Sent from frontend |
| `AC-Source-Locale` | ✅ Required | ✅ Required | Set from environment |
| `AC-Scope-Locale` | ✅ Required | ➖ Not needed | Same as Source-Locale |
| `Magento-Website-Code` | ➖ Optional | ✅ Recommended | Commerce integration |

---

## Troubleshooting

### Categories Not Loading (Skeleton Loaders)

**Symptom**: Navigation bar shows skeleton loaders indefinitely

**Cause**: `AC-Environment-Id` missing from `ACO_BuildRight` source

**Solution**: Ensure `mesh.config.js` includes:
```javascript
{
  name: 'ACO_BuildRight',
  handler: {
    graphql: {
      operationHeaders: {
        'AC-Environment-Id': '{env.TENANT_ID}',  // Required for navigation
        // ... other headers
      }
    }
  }
}
```

### Products Not Found (Empty Results)

**Symptom**: Product grid shows "No products found" despite products existing

**Cause**: `AC-Environment-Id` combined with `AC-Price-Book-Id` causes conflict

**Solution**: Ensure `mesh.config.js` does NOT include `AC-Environment-Id` in `ACO_Dropins`:
```javascript
{
  name: 'ACO_Dropins',
  handler: {
    graphql: {
      operationHeaders: {
        // NO AC-Environment-Id here!
        'AC-View-Id': '{context.headers["ac-view-id"]}',
        'AC-Price-Book-Id': '{context.headers["ac-price-book-id"]}',
        // ... other headers
      }
    }
  }
}
```

---

## Related Documentation

- [Source Architecture](../source-architecture.md) - Overview of the three mesh sources
- [ACO API Architecture](../../../../buildright-service/docs/architecture/ACO-API-ARCHITECTURE.md) - Full ACO API documentation
- [Mesh Delegation Architecture](../../../../buildright-service/docs/architecture/MESH-DELEGATION-ARCHITECTURE.md) - How resolvers delegate to sources
