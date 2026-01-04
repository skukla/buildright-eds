# Architecture Overview

**What it does**: Shows how all BuildRight components connect and work together
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Is BuildRight?

BuildRight is a **B2B construction supply storefront** that shows different products and prices to different customer types. A production builder sees wholesale prices and commercial products, while a DIY homeowner sees retail prices and consumer products.

---

## How the Pieces Fit Together

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER'S BROWSER                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Adobe Edge Delivery Services                │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │   Custom     │  │   Adobe      │  │   HTML       │   │    │
│  │  │   Blocks     │  │   Dropins    │  │   Pages      │   │    │
│  │  │              │  │              │  │              │   │    │
│  │  │ • Featured   │  │ • Cart       │  │ • catalog    │   │    │
│  │  │   Products   │  │ • Checkout   │  │ • product    │   │    │
│  │  │ • Build      │  │ • Login      │  │ • cart       │   │    │
│  │  │   Wizard     │  │ • Products   │  │ • checkout   │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │  All data requests go through
                              │  the API Mesh
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API MESH                                 │
│                                                                  │
│  The "traffic controller" that routes each request to the       │
│  correct backend based on what the customer is asking for       │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
┌──────────────────────┐          ┌──────────────────────┐
│  ACO                 │          │  Adobe Commerce      │
│  (Commerce Optimizer)│          │  (Magento)           │
│                      │          │                      │
│  PRODUCTS + PRICING  │          │  TRANSACTIONS        │
│                      │          │                      │
│  • Product catalog   │          │  • Customer login    │
│  • Persona pricing   │          │  • Shopping cart     │
│  • Categories        │          │  • Checkout flow     │
│  • Search & filters  │          │  • Order history     │
└──────────────────────┘          └──────────────────────┘
```

---

## Component Summary

| Component | What It Does | Example |
|-----------|--------------|---------|
| **Edge Delivery Services** | Renders the website pages | Fast, CDN-delivered HTML |
| **Custom Blocks** | BuildRight-specific features | Build wizard, featured products |
| **Adobe Dropins** | Pre-built commerce UI | Cart, checkout, login |
| **API Mesh** | Routes requests to backends | "Product query? → ACO" |
| **ACO** | Products and pricing | 281 SKUs with persona pricing |
| **Commerce** | Transactions | Login, cart, checkout, orders |

---

## The Key Insight

**Products come from ACO. Transactions go through Commerce.**

This means:
- When a customer browses products → ACO provides the data (with persona-specific pricing)
- When a customer logs in, adds to cart, or checks out → Commerce handles it

---

## Why This Split?

| Backend | What It's Good At | BuildRight Usage |
|---------|-------------------|------------------|
| **ACO** | Fast product queries, persona-based pricing | Catalog, search, pricing |
| **Commerce** | Transactions, order management | Auth, cart, checkout, orders |

Adobe's Commerce dropins are designed for the transactional side. We use them for auth/cart/checkout, but get product data from ACO because ACO supports the persona pricing BuildRight needs.

---

## What This Means for Demos

When explaining the architecture to clients:

- **"Two backends, one experience"** - Customers don't know the data comes from different places
- **"ACO for browsing, Commerce for buying"** - Simple mental model
- **"The mesh handles the routing"** - Frontend code doesn't need to know which backend to call
- **"Persona pricing is automatic"** - Once logged in, prices adjust everywhere

---

**Related**: [Data Ownership](./data-ownership.md) | [Catalog Flow](./catalog-flow.md) | [Dropins](../dropins/README.md)
