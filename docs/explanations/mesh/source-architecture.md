# Source Architecture

**What it does**: Shows the three mesh sources and how resolvers connect to them
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Three Sources

BuildRight's API Mesh connects to three distinct backend sources. Understanding this architecture explains how dropins, custom blocks, and transactions all work together.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THREE MESH SOURCES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│   │    ACO_Dropins      │  │    ACO_BuildRight   │  │      Commerce       │ │
│   │    (Schema Only)    │  │    (Execution)      │  │    (Transactions)   │ │
│   ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │
│   │                     │  │                     │  │                     │ │
│   │  Provides:          │  │  Provides:          │  │  Provides:          │ │
│   │  • GraphQL schema   │  │  • Actual queries   │  │  • Cart operations  │ │
│   │  • Type definitions │  │  • Product data     │  │  • Checkout flow    │ │
│   │                     │  │  • Pricing          │  │  • Customer auth    │ │
│   │  Prefix: (none)     │  │  Prefix: BuildRight_│  │  • Order history    │ │
│   │                     │  │                     │  │                     │ │
│   │  Purpose:           │  │  Purpose:           │  │  Purpose:           │ │
│   │  Dropins expect     │  │  Where queries      │  │  All transactional  │ │
│   │  standard types     │  │  actually run       │  │  operations         │ │
│   │                     │  │                     │  │                     │ │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                             │
│         ▲                           ▲                        ▲              │
│         │                           │                        │              │
│    Schema only             Query execution            Cart/Checkout         │
│   (no queries run)          (all ACO data)           (all Commerce)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Two ACO Sources?

This is the key insight that explains the adapter pattern:

> ⚠️ **Header Configuration**: The two ACO sources also have **different header configurations** due to ACO API conflicts. See [ACO Header Requirements](./visuals/aco-header-requirements.md) for the full visual explanation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE DUAL ACO SOURCE PATTERN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE PROBLEM:                                                              │
│   ════════════                                                              │
│   • Dropins expect types like "SimpleProductView"                           │
│   • Our mesh prefixes queries: "BuildRight_productSearch"                   │
│   • Prefixed queries return prefixed types: "BuildRight_SimpleProductView"  │
│   • Mismatch!  Dropin can't render BuildRight_SimpleProductView             │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   THE SOLUTION:                                                             │
│   ═════════════                                                             │
│                                                                             │
│   Source 1: ACO_Dropins                                                     │
│   ─────────────────────                                                     │
│   • Provides unprefixed schema types                                        │
│   • Dropin receives: SimpleProductView ← (what it expects)                  │
│   • NO queries actually execute here                                        │
│                                                                             │
│   Source 2: ACO_BuildRight                                                  │
│   ───────────────────────                                                   │
│   • Provides prefixed queries: BuildRight_productSearch                     │
│   • Queries execute here, return: BuildRight_SimpleProductView              │
│   • Adapter transforms prefix away before returning to dropin               │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   THE FLOW:                                                                 │
│   ══════════                                                                │
│                                                                             │
│   Dropin                   Adapter                          ACO_BuildRight  │
│      │                        │                                   │         │
│      │── productSearch ──►    │                                   │         │
│      │   (unprefixed)         │                                   │         │
│      │                        │── BuildRight_productSearch ──────►│         │
│      │                        │   (prefixed, actually runs)       │         │
│      │                        │                                   │         │
│      │                        │◄── BuildRight_SimpleProductView ──│         │
│      │                        │                                   │         │
│      │◄── SimpleProductView ──│                                   │         │
│      │    (prefix stripped)   │                                   │         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Source-to-Resolver Mapping

Which resolvers use which sources:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESOLVERS → SOURCES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ACO_BuildRight (Product Data)                                             │
│   ═════════════════════════════                                             │
│   • dropin-plp.js        → Product grid queries                             │
│   • dropin-pdp.js        → Product detail queries                           │
│   • product-search.js    → Featured products, search                        │
│   • categories.js        → Navigation menu                                  │
│   • breadcrumbs.js       → Page trails                                      │
│   • dropin-metadata.js   → Sort options                                     │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   Commerce (Transactions)                                                   │
│   ═══════════════════════                                                   │
│   • dropin-cart.js       → Cart operations                                  │
│   • dropin-checkout.js   → Checkout flow                                    │
│   • dropin-auth.js       → Customer login/signup                            │
│   • dropin-order.js      → Order history                                    │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   Both Sources                                                              │
│   ════════════                                                              │
│   • persona.js           → Gets customer context (used by both)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Shared Queries

Multiple resolvers can share the same underlying query:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SHARED QUERY PATTERN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                      BuildRight_productSearch                               │
│                      ════════════════════════                               │
│                               │                                             │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│              ▼                ▼                ▼                            │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│   │   dropin-plp.js  │ │ product-search.js│ │ Featured blocks  │            │
│   │                  │ │                  │ │                  │            │
│   │ Used by:         │ │ Used by:         │ │ Used by:         │            │
│   │ Product Discovery│ │ Search bar       │ │ Home page        │            │
│   │ dropin           │ │ Custom blocks    │ │ recommendations  │            │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                             │
│   All three call the SAME underlying ACO query, but:                        │
│   • dropin-plp.js adds dropin-specific formatting                           │
│   • product-search.js supports custom blocks                                │
│   • Both use the same persona headers for pricing                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Table

| Source | Prefix | What It Provides | Who Uses It | AC-Environment-Id |
|--------|--------|------------------|-------------|-------------------|
| **ACO_Dropins** | (none) | Schema types + product queries | Dropin type compatibility, product grid/detail | ❌ Not included (conflicts with pricing) |
| **ACO_BuildRight** | `BuildRight_` | Navigation + custom queries | All product resolvers, categories | ✅ Included (required for navigation) |
| **Commerce** | (none) | Transactions | Cart, Checkout, Auth, Orders | N/A |

---

## Why This Matters for Demos

When explaining to clients:

1. **"We have full control"** - The dual ACO source pattern lets us customize without breaking dropins
2. **"Same data, different views"** - Dropins and custom blocks share the same product query
3. **"Clean separation"** - Product data (ACO) is separate from transactions (Commerce)
4. **"Flexible architecture"** - Can add new resolvers without changing sources

---

## Related Documentation

- [Adapter Pattern](./adapter-pattern.md) - Why we intercept dropin queries
- [Unified Routing](./unified-routing.md) - How dropins route through adapters
- [Mesh Resolvers](./mesh-resolvers.md) - Individual resolver details
- [ACO Header Requirements](./visuals/aco-header-requirements.md) - **Why the two ACO sources have different headers**
- [Technical Reference](../../reference/mesh/mesh-resolvers.md) - Code-level documentation
