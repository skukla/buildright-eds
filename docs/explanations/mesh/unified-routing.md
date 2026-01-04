# Unified Mesh Routing

**What it does**: Shows how every dropin routes through the mesh to its appropriate backend
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Big Picture

Every request from a dropin passes through the API Mesh before reaching the backend. The mesh acts as a traffic controller, routing product queries to ACO and transactional operations to Commerce.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED MESH ROUTING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     DROPIN COMPONENTS (What customers see)          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Product Grid │ Shopping Cart │ Checkout │ Sign In │ Order Details  │   │
│  └───────┬───────────────┬──────────────┬──────────┬────────────┬──────┘   │
│          │               │              │          │            │          │
│          ▼               ▼              ▼          ▼            ▼          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     API MESH (Our control layer)                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Product    │   Cart     │  Checkout   │   Auth    │   Order       │   │
│  │  Adapter    │  Adapter   │  Adapter    │  Adapter  │   Adapter     │   │
│  └───────┬───────────────┬──────────────┬──────────┬────────────┬──────┘   │
│          │               │              │          │            │          │
│          │    ROUTES     │    ROUTES    │  ROUTES  │   ROUTES   │          │
│          │    TO ACO     │  TO COMMERCE │    TO COMMERCE        │          │
│          │               │              │          │            │          │
│          ▼               ▼              ▼          ▼            ▼          │
│  ┌───────────────┐  ┌────────────────────────────────────────────────┐    │
│  │ Commerce      │  │              Adobe Commerce                    │    │
│  │ Optimizer     │  │              (Magento)                         │    │
│  │ (ACO)         │  │                                                │    │
│  │               │  │   • Add/remove cart items                      │    │
│  │ • Products    │  │   • Shipping & billing addresses               │    │
│  │ • Pricing     │  │   • Payment processing                         │    │
│  │ • Search      │  │   • Customer sign in/sign up                   │    │
│  │ • Facets      │  │   • Order history                              │    │
│  └───────────────┘  └────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Routing Rules

| Dropin | Adapter | Routes To | What It Handles |
|--------|---------|-----------|-----------------|
| **Product Discovery** | `dropin-plp` | ACO | Product catalog, search, filters, pricing |
| **Product Details** | `dropin-pdp` | ACO | Single product info, variants |
| **Cart** | `dropin-cart` | Commerce | Add/remove items, quantity updates |
| **Checkout** | `dropin-checkout` | Commerce | Addresses, shipping, payment, order placement |
| **Auth** | `dropin-auth` | Commerce | Sign in, sign up, password reset |
| **Order** | `dropin-order` | Commerce | Order confirmation, order history |

---

## Why Two Backends?

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         TWO BACKENDS, TWO PURPOSES                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   COMMERCE OPTIMIZER (ACO)              ADOBE COMMERCE (MAGENTO)            │
│   ═══════════════════════               ═════════════════════════           │
│                                                                             │
│   Optimized for READING                 Optimized for WRITING               │
│   • Fast product search                 • Cart state management             │
│   • Personalized pricing                • Order processing                  │
│   • Faceted filtering                   • Payment handling                  │
│   • Catalog browsing                    • Customer accounts                 │
│                                                                             │
│   "What can I buy?"                     "Let me buy it"                     │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

**In plain terms:**
- **ACO** is like a product showroom - optimized for browsing and comparing
- **Commerce** is like the cash register - handles the actual transaction

---

## What the Mesh Adds

The mesh isn't just a pass-through. Each adapter provides:

| Capability | What It Does | Example |
|------------|--------------|---------|
| **Validation** | Checks inputs before forwarding | Limits page size to 100 products |
| **Transformation** | Converts formats between systems | Category paths → filter format |
| **Extensibility** | Adds BuildRight-specific fields | Custom product attributes |
| **Persona Headers** | Injects pricing/catalog context | `AC-Price-Book-Id: Wholesale` |
| **Logging** | Records requests for debugging | Performance monitoring |

---

## Request Flow Example

When Sarah (a wholesale customer) views the catalog:

```
1. BROWSER
   Sarah clicks "Lumber" category
        │
        ▼
2. PRODUCT DISCOVERY DROPIN
   Sends: productSearch(category: "Lumber")
        │
        ▼
3. API MESH - PRODUCT ADAPTER
   • Validates: page_size ≤ 100 ✓
   • Adds header: AC-Price-Book-Id: "Wholesale"
   • Transforms: categoryPath → subcategory filter
        │
        ▼
4. ACO
   Returns products with WHOLESALE pricing
        │
        ▼
5. API MESH - PRODUCT ADAPTER
   • Strips internal type prefixes
   • Formats response for dropin
        │
        ▼
6. DROPIN
   Renders product grid with wholesale prices
```

---

## What This Means for Demos

When explaining the architecture:

- **"Single entry point"** - All requests go through the mesh for consistency
- **"Right tool for the job"** - ACO for browsing, Commerce for transactions
- **"Extensibility built in"** - Adapters let us customize behavior without modifying dropins
- **"Persona-aware"** - The mesh knows who's asking and adjusts responses

---

**Related**: [Mesh Overview](./README.md) | [Dropins Overview](../dropins/README.md) | [Data Ownership](../architecture/data-ownership.md)
