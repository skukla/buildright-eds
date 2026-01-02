# ADR-010: Dropin Slot Customization Pattern

**Status**: Accepted

**Date**: December 2024

**Decision Makers**: BuildRight Implementation Team

**Related Documentation**:
- `docs/DROPIN-ARCHITECTURE.md` - Canonical dropin reference
- `docs/adr/ADR-008-dropin-css-refactoring-strategy.md` - CSS approach
- `docs/adr/ADR-009-mesh-adapter-resolver-pattern.md` - Mesh adapter pattern

---

## Context

Adobe Commerce dropins provide pre-built UI components with customization points called **slots**. BuildRight needs a consistent pattern for customizing these slots across all dropin implementations while maintaining:

1. **Visual consistency** - BuildRight brand styling
2. **CSS isolation** - Avoiding specificity wars with dropin defaults
3. **Maintainability** - Clear separation between Adobe and BuildRight code
4. **Reusability** - Patterns that apply to all dropin containers

### The Hierarchy

```
DROPIN (npm package)
    |
    +-- CONTAINER (renderable component)
            |
            +-- SLOT (customization point)
                    |
                    +-- CUSTOM COMPONENT (.buildright-* namespaced)
```

---

## Decision

**We will use a three-tier customization architecture for all dropin implementations:**

### Tier 1: Container Rendering

Containers are rendered into designated DOM elements:

```javascript
SearchResults.render(document.querySelector('.dropin-search-results-container'), {
  slots: { /* slot overrides */ }
});
```

### Tier 2: Slot Interception

Slots receive context and allow custom element injection:

```javascript
slots: {
  ProductCardImage: (ctx) => {
    const el = document.createElement('div');
    el.className = 'buildright-product-image';
    el.style.backgroundImage = `url(${ctx.product.image.url})`;
    ctx.replaceWith(el);
  }
}
```

### Tier 3: CSS Namespacing

All custom slot content uses `.buildright-*` prefix for CSS isolation:

```css
/* Custom content - no !important needed */
.buildright-product-image { ... }
.buildright-price { ... }
.buildright-tier-badge { ... }
```

---

## Visual Template: Container/Slot Architecture

### Product Discovery Dropin (CLP/PLP)

```
+-------------------------------------------------------------+
| SearchResults Container                                      |
| +----------------------------------------------------------+ |
| | ProductCard Slot                                          | |
| | +-------------------+  +--------------------------------+ | |
| | | ProductCardImage  |  | ProductCardPrice               | | |
| | | (buildright-      |  | (buildright-price + tier       | | |
| | | product-image)    |  | badge)                         | | |
| | +-------------------+  +--------------------------------+ | |
| |                                                          | |
| | +-------------------+  +--------------------------------+ | |
| | | ProductCardName   |  | ProductCardActions             | | |
| | | (buildright-      |  | (buildright-add-to-cart)       | | |
| | | product-name)     |  |                                | | |
| | +-------------------+  +--------------------------------+ | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Facets Container

```
+---------------------------+
| Facets Container          |
| +------------------------+ |
| | SelectedFacets SLOT    | |
| | (Clear All button)     | |
| +------------------------+ |
|                           |
| +------------------------+ |
| | FacetBucket SLOT       | |
| | +--------------------+ | |
| | | RangeBucket        | | |
| | | (custom checkbox)  | | |
| | +--------------------+ | |
| | +--------------------+ | |
| | | ScalarBucket       | | |
| | | (native dropin)    | | |
| | +--------------------+ | |
| +------------------------+ |
+---------------------------+
```

### Full Page Layout

```
+-----------------------------------------------------------------------------+
|                           /catalog (catalog.html)                            |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | header (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | breadcrumbs (EDS Block)                                               |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +=======================================================================+  |
|  || product-list (EDS Block)                                            ||  |
|  || Uses: @dropins/storefront-product-discovery (DROPIN)                ||  |
|  ||=====================================================================||  |
|  ||                                                                     ||  |
|  ||  +-----------------------------+  +-----------------------------+   ||  |
|  ||  | SearchBarInput (CONTAINER)  |  | SortBy (CONTAINER)          |   ||  |
|  ||  +-----------------------------+  +-----------------------------+   ||  |
|  ||                                                                     ||  |
|  ||  +-----------------------+----------------------------------------+ ||  |
|  ||  |                       |                                        | ||  |
|  ||  |  Facets (CONTAINER)   |  SearchResults (CONTAINER)             | ||  |
|  ||  |                       |                                        | ||  |
|  ||  |  +------------------+ |  +----------------------------------+  | ||  |
|  ||  |  | SelectedFacets   | |  | ProductCard (repeats in grid)    |  | ||  |
|  ||  |  | SLOT             | |  | +------------------------------+ |  | ||  |
|  ||  |  +------------------+ |  | | ProductCardImage SLOT        | |  | ||  |
|  ||  |                       |  | | ProductCardName SLOT         | |  | ||  |
|  ||  |  +------------------+ |  | | ProductCardPrice SLOT        | |  | ||  |
|  ||  |  | FacetBucket SLOT | |  | | ProductCardActions SLOT      | |  | ||  |
|  ||  |  | [ ] Option 1 (12)| |  | +------------------------------+ |  | ||  |
|  ||  |  | [ ] Option 2 (8) | |  +----------------------------------+  | ||  |
|  ||  |  +------------------+ |                                        | ||  |
|  ||  |                       |                                        | ||  |
|  ||  +-----------------------+----------------------------------------+ ||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | Pagination (CONTAINER)                                        |  ||  |
|  ||  |  < Prev   1   [2]   3   4   ...   10   Next >                |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  +=======================================================================+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | footer (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## CSS Isolation Strategy

### Problem

Adobe dropin styles use high specificity. Overriding with `!important` creates maintenance burden and fragile CSS.

### Solution

Use **BEM specificity chains** instead of `!important`:

```css
/* INSTEAD OF: */
.dropin-product-card__price {
  font-size: 18px !important;
  color: red !important;
}

/* USE: */
.product-list .dropin-search-results-container .buildright-price {
  font-size: 18px;
  color: var(--color-brand-500);
}
```

### Selector Priority Guide

| Approach | Specificity | When to Use |
|----------|-------------|-------------|
| `.buildright-*` alone | Low | Custom slot content (isolated) |
| `.container .slot .buildright-*` | Medium | Override slot defaults |
| `.block .container [class*="dropin"] .buildright-*` | High | Override resistant dropin styles |
| `!important` | Nuclear | Last resort only (<30 per block) |

### Design Token Integration

Custom slot content uses BuildRight design tokens:

```css
.buildright-price {
  font: var(--type-body-1-default-font);
  color: var(--color-text-primary);
}

.buildright-tier-badge {
  background-color: var(--color-brand-500);
  border-radius: var(--shape-border-radius-1);
}
```

---

## Slot API Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `ctx.replaceWith(element)` | Replace default content | Custom price display |
| `ctx.prependChild(element)` | Add before default | Badge before name |
| `ctx.appendChild(element)` | Add after default | CTA after actions |
| `ctx.product` / `ctx.data` | Access item data | Get price, name, image |

---

## Implementation Checklist for New Dropins

When implementing a new dropin (Auth, Cart, Checkout, Order):

- [ ] Identify all available containers
- [ ] Map slots within each container
- [ ] Define which slots need BuildRight customization
- [ ] Create `.buildright-*` CSS classes for custom content
- [ ] Use BEM specificity chains (not `!important`)
- [ ] Document slot usage in block's CSS files
- [ ] Add visual ASCII diagram to DROPIN-ARCHITECTURE.md

---

## Consequences

### Positive

- **Consistency**: All dropin customizations follow same pattern
- **Maintainability**: Clear separation of Adobe vs BuildRight code
- **Debuggability**: `.buildright-*` classes easy to inspect
- **Upgradability**: Dropin updates less likely to break custom code
- **Documentation**: Visual templates aid developer understanding

### Negative

- **Learning curve**: Developers must understand slot API
- **Limited flexibility**: Cannot modify dropin internals, only slots
- **CSS complexity**: BEM chains can be verbose

---

## Related Decisions

- [ADR-001: Use Dropins for Commerce Functions](./ADR-001-use-dropins-for-commerce.md) - Commerce dropins for auth/cart/checkout
- [ADR-008: Dropin CSS Refactoring Strategy](./ADR-008-dropin-css-refactoring-strategy.md) - CSS methodology
- [ADR-009: Mesh Adapter Resolver Pattern](./ADR-009-mesh-adapter-resolver-pattern.md) - Backend query adaptation

---

## References

### Internal Documentation
- `docs/DROPIN-ARCHITECTURE.md` - Canonical dropin reference
- `blocks/product-list/product-list.js` - Reference implementation

### Adobe Documentation
- [Slots Documentation](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/customize/slots/)
- [Styling Drop-In Components](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/styling/)
- [Design Tokens](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/customize/design-tokens/)

---

**Last Updated**: December 2024
