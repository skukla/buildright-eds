# Components Visual Guide

**What it does**: Shows all the UI building blocks and how they fit together
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## BuildRight's UI Building Blocks

BuildRight uses **29 different blocks** (UI components) organized into three categories:

---

## Block Categories

### Commerce Blocks (Powered by Adobe Dropins)

These handle e-commerce functionality using Adobe's pre-built components:

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMERCE BLOCKS                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  product-list ──── The main catalog grid with filters            │
│                    Shows products with persona-specific prices   │
│                                                                  │
│  cart-dropin ───── The full shopping cart page                   │
│                    Line items, quantities, totals                │
│                                                                  │
│  checkout-dropin ─ The checkout flow                             │
│                    Shipping, payment, order confirmation         │
│                                                                  │
│  auth-dropin ───── Login and signup forms                        │
│                    Password reset, account creation              │
│                                                                  │
│  mini-cart ─────── The cart dropdown in the header               │
│                    Quick view of cart contents                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Persona Blocks (BuildRight-Specific Features)

These are custom to BuildRight and enable B2B workflows:

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA BLOCKS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  template-dashboard ── Browse pre-built project templates        │
│                        Sarah uses this to start new builds       │
│                                                                  │
│  project-builder ───── Configure a bill of materials             │
│                        Select template, package, phases          │
│                                                                  │
│  savings-calculator ── Show volume pricing benefits              │
│                        "Buy 100+, save 15%"                      │
│                                                                  │
│  persona-switcher ──── For demos: switch between personas        │
│                        Show how different users see the site     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Blocks (Standard Page Structure)

These create the page framework:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYOUT BLOCKS                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  header ────────── Site header with navigation, search, cart     │
│                                                                  │
│  footer ────────── Site footer with links and info               │
│                                                                  │
│  breadcrumb ────── Navigation trail (Home > Category > Product)  │
│                                                                  │
│  cards ─────────── Content cards for marketing sections          │
│                                                                  │
│  hero ──────────── Large banner at top of pages                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## How Blocks Compose Into Pages

Here's how blocks combine to create the catalog page:

```
┌───────────────────────────────────────────────────────────────┐
│ HEADER BLOCK                           [🔍] [👤] [🛒]          │
│ Logo  |  Shop  |  Projects  |  Account                        │
├───────────────────────────────────────────────────────────────┤
│ BREADCRUMB BLOCK                                              │
│ Home > Catalog > Framing                                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌─────────────────────────────────────┐   │
│  │   FACETS     │  │  PRODUCT-LIST BLOCK                 │   │
│  │   ────────   │  │                                     │   │
│  │   Category   │  │  ┌───────┐ ┌───────┐ ┌───────┐     │   │
│  │   □ Lumber   │  │  │ 2×4×8 │ │ 2×6×8 │ │ 2×4×10│     │   │
│  │   □ Hardware │  │  │ $4.79 │ │ $6.29 │ │ $5.99 │     │   │
│  │              │  │  └───────┘ └───────┘ └───────┘     │   │
│  │   Brand      │  │                                     │   │
│  │   □ BuildMax │  │  ┌───────┐ ┌───────┐ ┌───────┐     │   │
│  │   □ ProGrade │  │  │ 2×6×10│ │ 2×8×8 │ │ 4×4×8 │     │   │
│  │              │  │  │ $7.29 │ │ $8.49 │ │ $12.99│     │   │
│  │   Price      │  │  └───────┘ └───────┘ └───────┘     │   │
│  │   $0 - $500  │  │                                     │   │
│  └──────────────┘  └─────────────────────────────────────┘   │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ FOOTER BLOCK                                                  │
│ © 2024 BuildRight  |  Contact  |  Privacy  |  Terms          │
└───────────────────────────────────────────────────────────────┘
```

---

## Key Pages and Their Blocks

| Page | Primary Blocks | Purpose |
|------|----------------|---------|
| **Catalog** | header, breadcrumb, product-list, footer | Browse products |
| **Product Detail** | header, breadcrumb, product-details, footer | View single product |
| **Cart** | header, cart-dropin, footer | Review cart contents |
| **Checkout** | header, checkout-dropin, footer | Complete purchase |
| **Login** | header, auth-dropin, footer | Sign in/up |
| **Dashboard** | header, template-dashboard, project-builder, footer | Sarah's workflow |

---

## What This Means for Demos

When showing the UI:

- **"29 reusable blocks"** - Components combine to create any page
- **"Dropins for commerce"** - Adobe handles the complex e-commerce UI
- **"Custom blocks for B2B"** - BuildRight-specific features for professionals
- **"Consistent layouts"** - Same header/footer pattern across all pages

---

**Related**: [Design System Architecture](./design-system-architecture.md) | [Dropins](../dropins/README.md)
