# API Mesh

**What it does**: Routes data requests between the storefront and backend services
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Is the API Mesh?

The API Mesh is the **traffic controller** for BuildRight. When a customer browses products, adds items to cart, or checks out, the mesh routes each request to the right backend service.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HOW THE MESH WORKS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CUSTOMER BROWSER                                                          │
│   ════════════════                                                          │
│   Customer browses products, adds to cart, checks out                       │
│                          │                                                  │
│                          ▼                                                  │
│   API MESH (The Traffic Controller)                                         │
│   ═════════════════════════════════                                         │
│   Receives all requests and routes them to the right place                  │
│                          │                                                  │
│          ┌───────────────┴───────────────┐                                  │
│          │                               │                                  │
│          ▼                               ▼                                  │
│   ┌─────────────────┐          ┌─────────────────┐                         │
│   │ Commerce        │          │ Adobe Commerce  │                         │
│   │ Optimizer (ACO) │          │ (Magento)       │                         │
│   │                 │          │                 │                         │
│   │ Products        │          │ Cart            │                         │
│   │ Pricing         │          │ Checkout        │                         │
│   │ Categories      │          │ Orders          │                         │
│   │ Search          │          │ Accounts        │                         │
│   └─────────────────┘          └─────────────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Do We Need It?

BuildRight uses **two backend systems** for different purposes:

| Backend | What It Handles | Why |
|---------|-----------------|-----|
| **Commerce Optimizer (ACO)** | Products, pricing, catalog | Optimized for fast search and persona-specific pricing |
| **Adobe Commerce (Magento)** | Cart, checkout, orders | Handles transactions and order management |

The mesh **unifies these backends** so the storefront sees one consistent API.

---

## Key Mesh Functions

### 1. Routing Requests

The mesh knows which backend to call based on the request type:

| Request Type | Routed To | Example |
|--------------|-----------|---------|
| Product search | ACO | "Show me lumber products" |
| Product details | ACO | "Get details for SKU LUM-2X4-8" |
| Category navigation | ACO | "Show categories menu" |
| Add to cart | Commerce | "Add this product to cart" |
| Checkout | Commerce | "Process payment" |
| Order history | Commerce | "Show my past orders" |

### 2. Adding Persona Headers

When a customer logs in, the mesh adds their persona information to every product request:

| Header | Purpose | Example |
|--------|---------|---------|
| **AC-View-Id** | Which products they can see | Sarah sees commercial products |
| **AC-Price-Book-Id** | Which prices they pay | Sarah gets wholesale pricing |

This is how the same product shows different prices to different customers.

### 3. Transforming Data

The mesh translates between different data formats so the storefront doesn't need to know backend details.

---

## Documents in This Section

| Document | Purpose |
|----------|---------|
| [Unified Routing](./unified-routing.md) | Master diagram showing all dropin-to-backend routing |
| [Adapter Pattern](./adapter-pattern.md) | Why we intercept dropin queries instead of direct connections |
| [Source Architecture](./source-architecture.md) | The 3 mesh sources and how resolvers connect to them |
| [Mesh Resolvers](./mesh-resolvers.md) | How each resolver works |
| [Product Query Flows](./product-query-flows.md) | How product data flows through the system |
| [Category Ordering](./category-ordering.md) | How navigation honors Commerce backend ordering |
| [Backend Services](./backend-services.md) | Shared backend services architecture |
| [Persona Service](./persona-service.md) | How personalized pricing works |
| [Persona Authentication](./persona-authentication.md) | How Quick Login works for demos |

---

## Related Documentation

- [Dropins](../dropins/README.md) - How storefront components use mesh data
- [Architecture Overview](../architecture/README.md) - Full system context
- [Technical Reference](../../reference/mesh/) - Developer documentation with code examples

