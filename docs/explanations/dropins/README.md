# BuildRight Dropin Visualizations

**Purpose**: Explain how Adobe Commerce dropins power the BuildRight storefront
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Are Dropins?

**Dropins** are pre-built commerce components from Adobe that provide standard e-commerce functionality. Think of them as "building blocks" that handle complex features like product search, shopping carts, and checkout - so we don't have to build them from scratch.

### The Three Layers

```
DROPIN HIERARCHY
════════════════

DROPIN (the package)
│
├── CONTAINERS (visual components you see on the page)
│   ├── Product Grid
│   ├── Filter Sidebar
│   └── Shopping Cart
│
└── SLOTS (places where we inject BuildRight branding)
    ├── Product Card styling
    ├── Price display format
    └── Button appearance
```

**In plain terms:**
- **Dropin** = A feature package (e.g., "Product Discovery" handles everything about browsing products)
- **Container** = A visible component (e.g., the product grid, the filter sidebar)
- **Slot** = A customization point where we apply BuildRight's look and feel

---

## Dropins Used in BuildRight

| Page | Dropin | What It Does |
|------|--------|--------------|
| Catalog (`/catalog`) | Product Discovery | Product grid, filters, sorting, search |
| Cart (`/cart`) | Cart | Shopping cart display and management |
| Checkout (`/checkout`) | Checkout | Address forms, shipping, payment, order placement |
| Login (`/login`) | Auth | Sign in, sign up, password reset |
| Order Confirmation | Order | Order details after purchase |

**Detailed documentation for each:**
- [Product Discovery](./product-discovery.md) - How the catalog page works
- [Cart](./cart.md) - How the shopping cart works
- [Checkout](./checkout.md) - How the checkout flow works
- [Auth](./auth.md) - How login and registration work
- [Order](./order.md) - How order confirmation works

---

## How We Customize Dropins

Adobe provides the functionality; we apply BuildRight's brand identity.

### Customization Levels

| Level | What We Change | Example |
|-------|----------------|---------|
| **Level 1: Styling** | Colors, fonts, spacing | Blue buttons, BuildRight typography |
| **Level 2: Content** | What displays in each slot | Custom price badges, product card layout |
| **Level 3: Behavior** | How components interact | Custom filter logic (rare) |

**BuildRight primarily uses Level 1 and Level 2** - we customize appearance and content while keeping Adobe's reliable functionality.

---

## Data Flow Overview

When a customer browses products, here's what happens behind the scenes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HOW DATA FLOWS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CUSTOMER BROWSER                                                          │
│   ════════════════                                                          │
│   Customer clicks "Power Tools" category                                    │
│                          │                                                  │
│                          ▼                                                  │
│   DROPIN CONTAINERS                                                         │
│   ═════════════════                                                         │
│   Product Grid, Filters, Sort dropdown                                      │
│   (These are the visual components)                                         │
│                          │                                                  │
│                          ▼                                                  │
│   API MESH (Our Control Layer)                                              │
│   ════════════════════════════                                              │
│   Routes requests, applies business logic,                                  │
│   adds persona-specific pricing                                             │
│                          │                                                  │
│                          ▼                                                  │
│   ADOBE COMMERCE SERVICES                                                   │
│   ═══════════════════════                                                   │
│   ┌─────────────────────┐    ┌─────────────────────┐                       │
│   │ Commerce Optimizer  │    │ Adobe Commerce      │                       │
│   │ (ACO)               │    │ (Magento)           │                       │
│   │                     │    │                     │                       │
│   │ • Product catalog   │    │ • Cart operations   │                       │
│   │ • Pricing           │    │ • Checkout          │                       │
│   │ • Search/filters    │    │ • Customer accounts │                       │
│   └─────────────────────┘    └─────────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key insight:** Products and pricing come from Adobe Commerce Optimizer (ACO), while cart, checkout, and accounts use Adobe Commerce (Magento).

---

## Mesh Routing

Each dropin routes through the API Mesh to its appropriate backend. For the complete routing diagram, see **[Unified Mesh Routing](../mesh/unified-routing.md)**.

### Quick Reference: Which Backend?

| Dropin | Backend | What It Handles |
|--------|---------|-----------------|
| **Product Discovery** | Commerce Optimizer (ACO) | Product catalog, search, filters, pricing |
| **Cart** | Adobe Commerce (Magento) | Add/remove items, quantity updates |
| **Checkout** | Adobe Commerce (Magento) | Addresses, shipping, payment, order placement |
| **Auth** | Adobe Commerce (Magento) | Sign in, sign up, password reset |
| **Order** | Adobe Commerce (Magento) | Order confirmation, order history |

**Why two backends?** ACO is optimized for fast product search and personalized pricing. Commerce handles transactional operations like cart and checkout.

---

## Persona-Aware Catalog

BuildRight shows different products and prices to different customer types:

| Persona | Role | What They See |
|---------|------|---------------|
| Sarah Martinez | Production Builder | Bulk pricing, commercial-grade products |
| Marcus Johnson | General Contractor | Contractor pricing, full catalog |
| Lisa Chen | Remodeling Contractor | Remodeling-focused products |
| David Thompson | Pro Homeowner (DIY) | Retail pricing, consumer products |
| Kevin Rodriguez | Store Manager | Admin view, all products |

**How it works:** When a user logs in, their persona determines which price book and product catalog they see. The dropins automatically display the right products at the right prices.

---

## Why Dropins Matter (Business Value)

| Benefit | Explanation |
|---------|-------------|
| **Faster time-to-market** | Adobe handles complex commerce logic; we focus on branding |
| **Proven reliability** | Dropins are battle-tested across many Adobe implementations |
| **Consistent UX** | Standard e-commerce patterns customers expect |
| **Easy updates** | Adobe improves dropins; we get updates automatically |
| **Customizable** | Slots let us apply BuildRight branding without modifying core logic |

---

## Related Documentation

- [Dropin Architecture Reference](../../reference/dropin-architecture.md) - Technical implementation details
- [Mesh Architecture](../../../buildright-service/mesh/README.md) - How the API layer works
