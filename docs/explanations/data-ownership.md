# Data Ownership: ACO vs Commerce

BuildRight uses **two data sources** - knowing which owns what is critical for implementation.

## Ownership Matrix

| Data Type | Owner | Why | Example |
|-----------|-------|-----|---------|
| **Products** | ACO | Catalog views, persona filtering | SKUs, images, descriptions |
| **Pricing** | ACO | Price books per persona | Wholesale vs retail prices |
| **Categories** | ACO | Hierarchical taxonomy | Framing → Lumber → Dimensional |
| **Cart** | Commerce | Session state, line items | Add/remove items |
| **Auth** | Commerce | Customer accounts, tokens | Login/logout |
| **Checkout** | Commerce | Orders, payments | Place order |
| **Orders** | Commerce | Order history | Past purchases |

## Visual: Which System Handles What

```
┌─────────────────────────────────────────────────────────────┐
│  USER JOURNEY                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Browse Catalog ──▶ ACO (products, prices, filters)         │
│         │                                                    │
│         ▼                                                    │
│  Add to Cart ────▶ Commerce (cart state via dropin)         │
│         │                                                    │
│         ▼                                                    │
│  Checkout ───────▶ Commerce (payment, shipping)             │
│         │                                                    │
│         ▼                                                    │
│  View Orders ────▶ Commerce (order history)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Rule

> **Products come from ACO, transactions go through Commerce.**

---

**See Also:** [aco-commerce-relationship.md](../reference/backend/aco-commerce-relationship.md) | [ADR-001](../adr/ADR-001-use-dropins-for-commerce.md)
