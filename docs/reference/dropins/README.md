# Dropins Technical Reference

**Audience**: Developers, frontend engineers
**Purpose**: Code examples and implementation patterns for Adobe Commerce dropins

---

## Overview

Adobe Commerce Dropins are npm packages that provide pre-built UI components. BuildRight customizes them using slots - JavaScript hooks that allow injecting custom content.

```
HIERARCHY
═════════
@dropins/storefront-[name]                ← DROPIN (npm package)
├── containers/                           ← CONTAINERS (renderable components)
│   ├── ComponentA
│   └── ComponentB
└── slots (within containers)             ← SLOTS (customization points)
    ├── SlotName1
    └── SlotName2
```

---

## Documents in This Directory

| Document | Purpose |
|----------|---------|
| [dropin-pattern.md](./dropin-pattern.md) | Slot customization code examples |

## Related Reference Documents

| Document | Purpose |
|----------|---------|
| [dropin-architecture.md](../dropin-architecture.md) | **Canonical** - hierarchy, integration patterns |
| [dropin-integration-reference.md](../dropin-integration-reference.md) | Configuration options |
| [dropin-slots-inventory.md](../dropin-slots-inventory.md) | Complete slot catalog |
| [dropin-styling-comparison.md](../dropin-styling-comparison.md) | CSS strategies |
| [slot-method-limitations.md](../slot-method-limitations.md) | Known issues |

---

## BuildRight Dropins

| Dropin | Purpose | Block |
|--------|---------|-------|
| `@dropins/storefront-product-discovery` | Product search, filters, sorting | `product-list` |
| `@dropins/storefront-auth` | Authentication UI | `auth`, `login-form` |
| `@dropins/storefront-cart` | Cart functionality | `cart` |
| `@dropins/storefront-checkout` | Checkout flow | `checkout` |
| `@dropins/storefront-order` | Order confirmation | `order-confirmation` |

---

## Code Example: Slot Customization

```javascript
// blocks/product-list/product-list.js
import { SearchResults, Facets } from '@dropins/storefront-product-discovery/containers';

export default async function decorate(block) {
  await waitForDropins();

  SearchResults.render(document.querySelector('.dropin-results'), {
    slots: {
      ProductCardPrice: (ctx) => {
        const el = document.createElement('div');
        el.className = 'buildright-price';
        el.innerHTML = `
          <span class="price">${formatPrice(ctx.product.price)}</span>
          <span class="tier-badge">${getTierLabel()}</span>
        `;
        ctx.replaceWith(el);
      },
      ProductCardActions: (ctx) => {
        const button = document.createElement('button');
        button.className = 'buildright-add-to-cart';
        button.textContent = 'Add to Cart';
        button.onclick = () => addToCart(ctx.product.sku);
        ctx.replaceWith(button);
      }
    }
  });
}
```

## Slot API Methods

| Method | Purpose |
|--------|---------|
| `ctx.replaceWith(element)` | Replace default content entirely |
| `ctx.prependChild(element)` | Add before default content |
| `ctx.appendChild(element)` | Add after default content |
| `ctx.product` / `ctx.data` | Access data for current item |

---

## CSS Naming Convention

```css
/* BuildRight custom slot content - uses .buildright-* prefix */
.buildright-price { ... }
.buildright-tier-badge { ... }
.buildright-add-to-cart { ... }

/* This avoids conflicts with Adobe's dropin CSS */
```

---

**See Also**:
- [Explanations: Dropins](../../explanations/dropins/) - Visual documentation for consultants
- [blocks/product-list/](../../../blocks/product-list/) - Product list block implementation
