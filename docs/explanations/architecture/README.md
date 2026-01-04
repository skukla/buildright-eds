# Architecture

**What it does**: Explains how BuildRight's components work together
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What This Section Covers

Understanding BuildRight's architecture helps you explain to clients:
- Why we use two backend systems (ACO and Commerce)
- How the pieces fit together
- What happens when a customer browses products

---

## Documents in This Section

| Document | What It Explains |
|----------|------------------|
| [Architecture Overview](./architecture-overview.md) | The big picture - all components and how they connect |
| [Data Ownership](./data-ownership.md) | Which system owns what data (products vs transactions) |
| [Catalog Flow](./catalog-flow.md) | Step-by-step: what happens when a customer browses products |

---

## The 30-Second Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BUILDRIGHT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    BROWSER (What customers see)                          │
│   ═══════════════════════════════════════════════════════════════════   │
│   Edge Delivery Services renders pages using blocks and dropins          │
│                                │                                         │
│                                ▼                                         │
│                    API MESH (The traffic controller)                     │
│   ═══════════════════════════════════════════════════════════════════   │
│   Routes each request to the right backend                               │
│                                │                                         │
│            ┌───────────────────┴───────────────────┐                    │
│            ▼                                       ▼                    │
│   ┌─────────────────────────┐       ┌─────────────────────────┐         │
│   │   ACO                   │       │   Adobe Commerce        │         │
│   │   (Commerce Optimizer)  │       │   (Magento)             │         │
│   │                         │       │                         │         │
│   │   PRODUCTS + PRICING    │       │   TRANSACTIONS          │         │
│   │   • Catalog             │       │   • Login/Logout        │         │
│   │   • Prices per persona  │       │   • Shopping Cart       │         │
│   │   • Categories          │       │   • Checkout            │         │
│   │   • Search              │       │   • Orders              │         │
│   └─────────────────────────┘       └─────────────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**The key insight**: Products come from ACO (with persona-specific pricing). Transactions go through Commerce.

---

## Related Documentation

- [Dropins](../dropins/README.md) - How the UI components work
- [API Mesh](../mesh/README.md) - How requests get routed
- [Personas](../personas/README.md) - How different customers see different things
