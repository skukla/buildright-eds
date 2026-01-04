# Backend Services

**What it does**: Explains how all BuildRight personas share common backend functionality
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Core Idea

BuildRight uses **one shared backend service** that all customer personas can access. Whether Sarah is generating a bill of materials or David is browsing products, they all use the same backend - just with different permissions and pricing.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    CUSTOMER BROWSER                              │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ Sarah   │ │ Marcus  │ │ Lisa    │ │ David   │ │ Kevin   │     │
│  │Produc-  │ │General  │ │Remodel  │ │DIY Pro  │ │Store    │     │
│  │tion     │ │Contrac- │ │Contrac- │ │Home-    │ │Manager  │     │
│  │Builder  │ │tor      │ │tor      │ │owner    │ │         │     │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘     │
│       │           │           │           │           │          │
│       └───────────┴───────────┴───────────┴───────────┘          │
│                               │                                  │
│                       All requests go                            │
│                       through one gateway                        │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                        API MESH                                   │
│                                                                   │
│  The "traffic controller" that routes requests to the right       │
│  resolver based on what the customer is asking for                │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ Product        │  │ Bill of        │  │ Persona        │       │
│  │ Queries        │  │ Materials      │  │ Pricing        │       │
│  │                │  │                │  │                │       │
│  │ "Show me       │  │ "Generate BOM  │  │ "What prices   │       │
│  │  lumber"       │  │  for template" │  │  does Sarah    │       │
│  │                │  │                │  │  get?"         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
└───────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│               ADOBE COMMERCE OPTIMIZER (ACO)                      │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │ Products        │  │ Pricing Tiers   │  │ Categories      │    │
│  │                 │  │                 │  │                 │    │
│  │ 281 SKUs        │  │ Retail,         │  │ Lumber,         │    │
│  │ with variants   │  │ Wholesale,      │  │ Hardware,       │    │
│  │                 │  │ Contractor      │  │ Flooring...     │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Key Resolvers (What Handles Each Request Type)

| Request Type | Handler | What It Does | Who Uses It |
|--------------|---------|--------------|-------------|
| **Product browsing** | dropin-plp | Gets products for catalog grids | All personas |
| **Product details** | dropin-pdp | Gets single product info | All personas |
| **Pricing headers** | persona | Maps customer → their prices | All personas |
| **Material lists** | bom-from-template | Calculates quantities for builds | Sarah, Marcus, Lisa |
| **Navigation** | categories | Gets category menu structure | All pages |
| **Page trails** | breadcrumbs | Shows "Home > Category > ..." | Category pages |

---

## How a Request Flows Through the System

**Example: Sarah starts a new build project**

```
1. Sarah clicks "Start New Build" on her dashboard
   │
   ▼
2. Frontend sends request to API Mesh
   │
   │  "Generate a bill of materials for the Sedona template,
   │   Standard package, Framing phase"
   │
   ▼
3. Mesh routes to the BOM resolver
   │
   │  The resolver:
   │  • Looks up the Sedona template specs
   │  • Queries ACO for all framing products
   │  • Calculates quantities based on formulas
   │  • Applies Sarah's wholesale pricing
   │
   ▼
4. Resolver returns formatted response
   │
   │  Items:
   │  • 2×4×8 Lumber: 240 pieces @ $4.79 = $1,149.60
   │  • 2×6×10 Lumber: 80 pieces @ $7.29 = $583.20
   │  • Simpson ties: 48 pieces @ $2.99 = $143.52
   │  ...
   │  Total: $2,847.50
   │
   ▼
5. Frontend displays the bill of materials
```

---

## Why This Architecture?

| Benefit | How It Helps |
|---------|--------------|
| **One codebase for all personas** | No duplicate backend logic per customer type |
| **Consistent pricing** | All pricing rules live in one place |
| **Easy to extend** | Add new features without touching each persona |
| **Better performance** | Mesh can cache and optimize queries |

---

## What This Means for Demos

When explaining the backend to clients:

- **"All customers use the same backend"** - Whether it's a production builder or a DIY homeowner, they all hit the same services
- **"Persona determines what they see and pay"** - The same product query returns different results based on who's asking
- **"The mesh handles complexity"** - Frontend code doesn't need to know about pricing rules or data transformations
- **"Easy to add new customer types"** - Adding a new persona just means new configuration, not new backend code

---

**Related**: [API Mesh Overview](./README.md) | [Source Architecture](./source-architecture.md) | [Mesh Resolvers](./mesh-resolvers.md) | [Product Query Flows](./product-query-flows.md)
