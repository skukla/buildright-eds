# Mesh Technical Reference

**Audience**: Developers, backend engineers
**Purpose**: Code examples and implementation patterns for API Mesh resolvers

---

## Overview

The API Mesh sits between the frontend and backend services, intercepting requests to add business logic, validation, and transformation.

```
Frontend → Mesh Resolvers → ACO/Commerce → Mesh Resolvers → Frontend
              │                                  │
              └── transforms request             └── transforms response
```

---

## Documents

| Document | Purpose |
|----------|---------|
| [mesh-resolvers.md](./mesh-resolvers.md) | Complete resolver catalog with code examples |
| [product-query-flows.md](./product-query-flows.md) | Dropin vs custom query comparison |
| [backend-services.md](./backend-services.md) | Shared backend architecture |

---

## Resolver Quick Reference

| Resolver | Purpose | Backend |
|----------|---------|---------|
| `dropin-plp.js` | Product grid queries | ACO |
| `dropin-pdp.js` | Product detail queries | ACO |
| `dropin-cart.js` | Cart operations | Commerce |
| `dropin-checkout.js` | Checkout mutations | Commerce |
| `dropin-auth.js` | Authentication | Commerce |
| `dropin-order.js` | Order queries | Commerce |
| `product-search.js` | Custom product queries | ACO |
| `persona.js` | Pricing headers | N/A (header injection) |

---

## Code Example: Resolver Pattern

```javascript
// mesh/resolvers-src/dropin-plp.js
export async function productSearch(args, context) {
  // Validate
  const pageSize = Math.min(args.page_size || 20, 100);

  // Transform for ACO
  const filter = transformFilter(args.filter);

  // Delegate to ACO with BuildRight prefix
  const result = await context.ACO_BuildRight.Query.BuildRight_productSearch({
    ...args,
    filter,
    page_size: pageSize
  });

  // Strip prefix for dropin compatibility
  return stripBuildRightPrefix(result);
}
```

---

**See Also**:
- [Explanations: Mesh](../../explanations/mesh/) - Visual documentation
- [buildright-service/mesh/README.md](../../../buildright-service/mesh/README.md) - Mesh source code
