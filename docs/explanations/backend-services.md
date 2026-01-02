# Backend Services Architecture

**Audience:** All stakeholders
**Purpose:** How buildright-service provides shared functionality

---

## Overview

BuildRight uses a **shared backend service** (`buildright-service`) that all frontend personas call via GraphQL. This eliminates duplicate code and ensures consistent behavior.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  buildright-eds                                          │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │ Sarah   │ │ Marcus  │ │ Lisa    │ │ David   │ ...   │    │
│  │  │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│       │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │    │
│  │       │           │           │           │             │    │
│  │       └───────────┴───────────┴───────────┘             │    │
│  │                       │                                  │    │
│  │              mesh-client.js                              │    │
│  │                       │ GraphQL Query                    │    │
│  └───────────────────────┼─────────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API MESH (Gateway)                             │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  buildright-service/mesh/resolvers-src/                    │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │   │
│  │  │ dropin-search  │  │ bom-from-      │  │ persona      │ │   │
│  │  │                │  │ template       │  │              │ │   │
│  │  │ Product grid   │  │ BOM generation │  │ Pricing      │ │   │
│  │  │ for dropins    │  │ for templates  │  │ headers      │ │   │
│  │  └────────────────┘  └────────────────┘  └──────────────┘ │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │   │
│  │  │ dropin-pdp     │  │ categories     │  │ breadcrumbs  │ │   │
│  │  │                │  │                │  │              │ │   │
│  │  │ Product detail │  │ Category tree  │  │ Navigation   │ │   │
│  │  │ pages          │  │ navigation     │  │ paths        │ │   │
│  │  └────────────────┘  └────────────────┘  └──────────────┘ │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│               ADOBE COMMERCE OPTIMIZER (ACO)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ Product Catalog │  │ Pricing Books   │  │ Categories      │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Resolvers

| Resolver | What It Does | Who Uses It |
|----------|--------------|-------------|
| `dropin-search.js` | Product grid queries for Adobe dropins | All personas |
| `dropin-pdp.js` | Product detail page data | All personas |
| `persona.js` | Resolves pricing headers (catalog view, price book) | All personas |
| `bom-from-template.js` | Generates Bill of Materials from templates | Sarah, Marcus, Lisa |
| `categories.js` | Category tree for navigation | All personas |
| `breadcrumbs.js` | Navigation path for pages | All pages |

---

## Request Flow

```
1. User Action (e.g., "Start New Build")
   │
   ▼
2. Frontend calls mesh-client.js
   │
   │  const bom = await meshQuery(bomQuery, { templateId: "sedona" });
   │
   ▼
3. API Mesh routes to resolver
   │
   │  buildright-service/mesh/resolvers-src/bom-from-template.js
   │
   ▼
4. Resolver fetches from ACO
   │
   │  - Gets template definition
   │  - Fetches products for phases
   │  - Calculates quantities
   │
   ▼
5. Resolver returns formatted response
   │
   │  { items: [...], totals: { subtotal, tax, total } }
   │
   ▼
6. Frontend renders result
```

---

## Why This Architecture?

| Benefit | Explanation |
|---------|-------------|
| **Reuse** | All personas call same backend services |
| **Consistency** | Pricing/catalog logic in one place |
| **Extensibility** | Add new resolvers without frontend changes |
| **Performance** | Mesh caches and optimizes queries |

---

## Related Documents

- [Architecture Overview](./architecture-overview.md) - Full system context
- [Mesh Adapter Pattern](./mesh-adapter.md) - Query interception details
- [Shared Backend Services](../planning/features/shared-backend-services.md) - Implementation status
