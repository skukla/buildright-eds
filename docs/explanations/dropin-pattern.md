# Dropin Pattern

## What It Does

Adobe provides pre-built UI components called "dropins" for commerce features. We customize their appearance using "slots" - insertion points where we can inject our own HTML/CSS.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  DROPIN (Adobe npm package)                                      │
│  @dropins/storefront-product-discovery                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CONTAINER (renderable component)                        │    │
│  │  SearchResults                                           │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  SLOT (customization point)                      │    │    │
│  │  │  ProductCardPrice                                │    │    │
│  │  │                                                  │    │    │
│  │  │  ┌───────────────────────────────────────┐      │    │    │
│  │  │  │  CUSTOM COMPONENT                     │      │    │    │
│  │  │  │  .buildright-price                    │      │    │    │
│  │  │  │  (our custom styling/content)         │      │    │    │
│  │  │  └───────────────────────────────────────┘      │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Slot Customization

```javascript
// In product-list block
SearchResults.render(container, {
  slots: {
    // Intercept the price slot
    ProductCardPrice: (ctx) => {
      const el = document.createElement('div');
      el.className = 'buildright-price';  // Our custom CSS
      el.textContent = formatPrice(ctx.product.price);
      ctx.replaceWith(el);  // Replace default with ours
    }
  }
});
```

## Available Slot Methods

| Method | What It Does |
|--------|--------------|
| `ctx.replaceWith(el)` | Replace default content entirely |
| `ctx.prependChild(el)` | Add before default content |
| `ctx.appendChild(el)` | Add after default content |
| `ctx.product` | Access product data |

## CSS Naming Convention

```css
/* Our customizations use .buildright-* prefix */
.buildright-price { ... }
.buildright-tier-badge { ... }
.buildright-product-image { ... }

/* This avoids conflicts with Adobe's dropin CSS */
```

## Which Dropins We Use

| Dropin | What It Does | Customization Level |
|--------|--------------|---------------------|
| Auth | Login/logout | Low (use as-is) |
| Cart | Shopping cart | Medium (slots) |
| Checkout | Payment flow | Low (use as-is) |
| Product Discovery | Product grid | High (many slots) |

---

**See Also:** [ADR-010](../adr/ADR-010-dropin-slot-customization-pattern.md) | [catalog-flow.md](./catalog-flow.md)
