# Dropin Customization Pattern

**What it does**: Explains how we customize Adobe's pre-built components to match BuildRight's brand
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Are Dropins?

Adobe provides **pre-built UI components** called "dropins" for common e-commerce features:
- Product grids
- Shopping carts
- Checkout flows
- Login forms

BuildRight uses these dropins but customizes their appearance to match our brand.

---

## How Customization Works

Dropins have **slots** - designated spots where we can insert custom content or styling. Think of slots like picture frames - Adobe provides the frame, we fill it with our content.

```
┌──────────────────────────────────────────────────────────────────┐
│  ADOBE DROPIN (The Package)                                      │
│  @dropins/storefront-product-discovery                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CONTAINER (The Component)                               │    │
│  │  SearchResults                                           │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐     │    │
│  │  │  SLOT (The Customization Point)                 │     │    │
│  │  │  ProductCardPrice                               │     │    │
│  │  │                                                 │     │    │
│  │  │  ┌───────────────────────────────────────┐      │     │    │
│  │  │  │  OUR CUSTOM CONTENT                   │      │     │    │
│  │  │  │                                       │      │     │    │
│  │  │  │  BuildRight-styled price display      │      │     │    │
│  │  │  │  with wholesale/retail indicator      │      │     │    │
│  │  │  │                                       │      │     │    │
│  │  │  └───────────────────────────────────────┘      │     │    │
│  │  └─────────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Three Levels of Customization

| Level | What You Change | Example |
|-------|-----------------|---------|
| **Level 1: CSS** | Colors, fonts, spacing | Making buttons Sapphire Blue |
| **Level 2: Slots** | Content inside components | Adding a "Wholesale" badge to prices |
| **Level 3: Behavior** | How components work | Custom price formatting logic |

BuildRight primarily uses **Level 1** (CSS tokens) and **Level 2** (slot customization).

---

## Slot Actions

When customizing a slot, you can:

| Action | What It Does | When to Use |
|--------|--------------|-------------|
| **Replace** | Remove default, add custom | When you need completely different content |
| **Prepend** | Add before default content | When you want to add above the default |
| **Append** | Add after default content | When you want to add below the default |

---

## BuildRight's Naming Convention

All BuildRight customizations use the `.buildright-*` CSS prefix:

- `.buildright-price` - Custom price display
- `.buildright-tier-badge` - Wholesale/Retail indicator
- `.buildright-product-image` - Custom image styling

This prevents conflicts with Adobe's dropin CSS.

---

## What This Means for Demos

When explaining dropin customization:

- **"Adobe provides the functionality"** - We don't build cart/checkout from scratch
- **"We customize the appearance"** - Slots let us inject BuildRight branding
- **"Best of both worlds"** - Production-ready e-commerce with custom brand feel
- **"Easy to update"** - Change a token, update all components

---

**Related**: [Dropins Overview](./README.md) | [Design System](../design/README.md)
