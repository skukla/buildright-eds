# Components Visual Guide

BuildRight has **29 EDS blocks** organized by function. This shows how they compose together.

## Block Categories

```
┌─────────────────────────────────────────────────────────────┐
│  COMMERCE BLOCKS (Dropin-powered)                           │
├─────────────────────────────────────────────────────────────┤
│  product-list ──── Catalog grid with facets                 │
│  cart-dropin ───── Full cart page                           │
│  checkout-dropin ─ Checkout flow                            │
│  auth-dropin ───── Login/signup forms                       │
│  mini-cart ─────── Header cart dropdown                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PERSONA BLOCKS (BuildRight-specific)                        │
├─────────────────────────────────────────────────────────────┤
│  template-dashboard ── Sarah's template browser              │
│  project-builder ───── BOM configuration wizard              │
│  savings-calculator ── Volume pricing display                │
│  persona-switcher ──── Demo persona selection                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LAYOUT BLOCKS (Standard EDS)                                │
├─────────────────────────────────────────────────────────────┤
│  header ────────── Site header + navigation                  │
│  footer ────────── Site footer                               │
│  breadcrumb ────── Navigation breadcrumbs                    │
│  cards ─────────── Content cards                             │
│  hero ──────────── Page hero banners                         │
└─────────────────────────────────────────────────────────────┘
```

## Page Composition Example

```
┌───────────────────────────────────────────────────────────┐
│ HEADER BLOCK                           [🔍] [👤] [🛒]     │
├───────────────────────────────────────────────────────────┤
│ BREADCRUMB BLOCK                                          │
│ Home > Catalog > Framing                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐  ┌─────────────────────────────────────┐   │
│  │ FACETS   │  │  PRODUCT-LIST BLOCK                 │   │
│  │ ───────  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │   │
│  │ Category │  │  │     │ │     │ │     │ │     │   │   │
│  │ Brand    │  │  │ SKU │ │ SKU │ │ SKU │ │ SKU │   │   │
│  │ Grade    │  │  │     │ │     │ │     │ │     │   │   │
│  │ Price    │  │  └─────┘ └─────┘ └─────┘ └─────┘   │   │
│  └──────────┘  └─────────────────────────────────────┘   │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ FOOTER BLOCK                                              │
└───────────────────────────────────────────────────────────┘
```

---

**See Also:** [blocks/CLAUDE.md](../../blocks/CLAUDE.md) | [ADR-014](../adr/ADR-014-eds-blocks-vs-dropins.md)
