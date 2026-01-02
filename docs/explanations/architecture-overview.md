# Architecture Overview

## What It Does

BuildRight is a B2B construction supply storefront that shows different products and prices to different customer types (personas).

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Adobe Edge Delivery Services                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Blocks  │  │  Dropins │  │  Pages   │              │   │
│  │  │ (custom) │  │ (Adobe)  │  │  (HTML)  │              │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────┘              │   │
│  └───────┼─────────────┼────────────────────────────────────┘   │
└──────────┼─────────────┼────────────────────────────────────────┘
           │             │
           ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API MESH (GraphQL)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes queries to correct backend based on type         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────┬─────────────────────────────────┬─────────────────────┘
          │                                 │
          ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Adobe Commerce      │          │  Adobe Commerce      │
│  Optimizer (ACO)     │          │  (Magento)           │
│                      │          │                      │
│  • Products          │          │  • Authentication    │
│  • Pricing           │          │  • Cart              │
│  • Catalog views     │          │  • Checkout          │
│  • Categories        │          │  • Orders            │
└──────────────────────┘          └──────────────────────┘
```

## Key Components

| Component | What It Does | Technology |
|-----------|--------------|------------|
| Blocks | Custom UI components | Vanilla JS + CSS |
| Dropins | Pre-built commerce UI | Adobe npm packages |
| API Mesh | Routes GraphQL queries | Adobe I/O Gateway |
| ACO | Products and pricing | Adobe Commerce Optimizer |
| Commerce | Auth, cart, checkout | Adobe Commerce (Magento) |

## Key Insight

**Products come from ACO. Transactions go through Commerce.**

This split means:
- Product catalog queries → ACO (with persona headers)
- Login, cart, checkout → Commerce (Adobe dropins)

---

**See Also:** [DROPIN-PATTERN.md](./DROPIN-PATTERN.md) | [MESH-ADAPTER.md](./MESH-ADAPTER.md)
