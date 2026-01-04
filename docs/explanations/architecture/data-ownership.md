# Data Ownership

**What it does**: Explains which backend system owns which data
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Core Question

BuildRight uses **two backend systems**. When explaining the architecture to clients, they often ask: "Which system handles what?"

This document answers that question.

---

## Ownership Matrix

| Data Type | Owner | Why | Example |
|-----------|-------|-----|---------|
| **Products** | ACO | Supports persona catalog views | SKUs, images, descriptions |
| **Pricing** | ACO | Price books per customer type | Sarah pays $4.79, David pays $6.99 |
| **Categories** | ACO | Hierarchical product taxonomy | Framing → Lumber → Dimensional |
| **Search** | ACO | Product discovery | "Find 2x4 lumber" |
| **Login/Logout** | Commerce | Customer account management | "Sign in" button |
| **Cart** | Commerce | Shopping session state | Add/remove items |
| **Checkout** | Commerce | Payment processing | Place order |
| **Orders** | Commerce | Order history | Past purchases |

---

## The Customer Journey View

Following a customer through the site shows how ownership flows:

```
┌──────────────────────────────────────────────────────────────────┐
│  CUSTOMER JOURNEY                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browse Catalog ──────▶ ACO                                      │
│  "Show me lumber"         (products, prices, filters)            │
│         │                                                        │
│         ▼                                                        │
│  Log In ──────────────▶ Commerce                                 │
│  "Sign in as Sarah"       (authentication)                       │
│         │                                                        │
│         ▼                                                        │
│  View Personalized ───▶ ACO                                      │
│  Prices                   (applies Sarah's wholesale prices)     │
│         │                                                        │
│         ▼                                                        │
│  Add to Cart ─────────▶ Commerce                                 │
│  "Add 240 2×4s"           (cart state via dropin)                │
│         │                                                        │
│         ▼                                                        │
│  Checkout ────────────▶ Commerce                                 │
│  "Place order"            (payment, shipping)                    │
│         │                                                        │
│         ▼                                                        │
│  View Orders ─────────▶ Commerce                                 │
│  "Show my past orders"    (order history)                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## The Golden Rule

> **Products come from ACO. Transactions go through Commerce.**

If you remember nothing else, remember this. It explains most architecture questions.

---

## Common Questions

**Q: Why not put everything in one system?**
A: ACO specializes in fast catalog queries with persona pricing. Commerce specializes in transactions. Using each for its strength gives the best performance.

**Q: What if a customer adds a product to cart - doesn't that involve both systems?**
A: Yes! The product info comes from ACO, but the "add to cart" action goes to Commerce. The mesh handles this seamlessly.

**Q: When prices change, where do we update them?**
A: In ACO. Price books are managed there, and changes appear automatically in the catalog.

**Q: What about inventory?**
A: This is managed in Commerce (Adobe Commerce has inventory management). ACO reflects the current state.

---

## What This Means for Demos

When explaining data ownership to clients:

- **"Products and transactions are separate"** - Different systems, different strengths
- **"Pricing is persona-aware from ACO"** - The same product shows different prices to different customers
- **"Cart and checkout are Commerce"** - Familiar Adobe Commerce functionality
- **"The mesh unifies the experience"** - Customers don't see the split

---

**Related**: [Architecture Overview](./architecture-overview.md) | [Catalog Flow](./catalog-flow.md)
