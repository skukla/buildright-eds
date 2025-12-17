# Commerce Mini Cart Block

**Integration Pattern: Custom HTML + Dropin APIs**

This block implements BuildRight's exact mini-cart design while using Adobe Commerce Storefront Cart Dropin APIs for functionality.

## Why API-Only Integration?

The Cart Dropin's `MiniCart` container has **limited customization slots** that cannot accommodate BuildRight's specific design requirements:

- ❌ **No header customization** - Cannot add custom title, item count, or close button
- ❌ **No empty state control** - Cannot replace empty cart UI with custom messaging/CTA
- ❌ **No footer structure control** - Can only inject content, not replace button layout
- ❌ **No item template control** - Limited slots for item display customization

## Architecture

```
┌─────────────────────────────────────────┐
│  BuildRight Custom HTML/CSS             │
│  • Header with title + count + close    │
│  • Custom empty state                   │
│  • Custom item templates                │
│  • Custom footer with two buttons       │
└─────────────────┬───────────────────────┘
                  │
                  │ Wired to
                  ↓
┌─────────────────────────────────────────┐
│  Commerce Cart Dropin APIs              │
│  • getCartData()                        │
│  • removeCartItems()                    │
│  • Event listeners (cart/updated)       │
└─────────────────────────────────────────┘
```

## Features

### 1. Context-Aware Rendering

The block adapts based on where it's used:

- **Header context**: Populates `#mini-cart-container` in the header
- **Standalone context**: Renders as a standalone component

### 2. Real-Time Synchronization

Listens to Cart Dropin events:

```javascript
events.on('cart/updated', (data) => {
  updateMiniCart();
});
```

### 3. BuildRight Design Features

- **Custom header**: Title, item count, close button with gradient background
- **Empty state**: Custom icon, messaging, and CTA to browse catalog
- **Item display**: Product image, name, quantity, price with remove button
- **Footer**: Subtotal display with "View Cart" and "Checkout" buttons
- **Bundle support**: Ready for future custom bundle display (currently showing regular items)

## Usage

### In Header (Recommended)

The block is automatically decorated by the header block:

```html
<!-- header.html -->
<div id="mini-cart-container">
  <!-- Populated by commerce-mini-cart block -->
</div>
```

```javascript
// header.js
await decorateBlock(createBlock('commerce-mini-cart'));
```

### Standalone

```html
<div class="commerce-mini-cart"></div>
```

## API Integration

### Get Cart Data

```javascript
import { getCartData } from '@dropins/storefront-cart/api.js';

const cart = await getCartData();
// Returns: { items, prices, total_quantity, ... }
```

### Remove Items

```javascript
import { removeCartItems } from '@dropins/storefront-cart/api.js';

await removeCartItems([itemId]);
// Triggers cart/updated event automatically
```

### Event Handling

```javascript
import { events } from '@dropins/tools/event-bus.js';

events.on('cart/updated', (cartData) => {
  // Re-render mini cart
});
```

## Styling

All styles are contained in `commerce-mini-cart.css` following EDS block patterns:

- **BuildRight Design System**: Uses CSS variables from `base.css`
- **Responsive**: Adapts to mobile with `max-width` constraints
- **Animations**: Smooth transitions for open/close, hover states, item highlights

## Future Enhancements

### Bundle Support

When implementing custom bundles (via Custom SDK Dropins), update `createItemHTML()` to detect and render bundle items:

```javascript
if (item.bundleId) {
  return createBundleHTML(item);
} else {
  return createItemHTML(item);
}
```

### Quantity Adjustment

Add quantity controls by using `updateCartItems()` API:

```javascript
import { updateCartItems } from '@dropins/storefront-cart/api.js';

await updateCartItems([{ id: itemId, quantity: newQuantity }]);
```

## Related Documentation

- [Dropin Integration Pattern](../../docs/standards/DROPIN-INTEGRATION-PATTERN.md)
- [Auth Dropin Decision](../../docs/reference/decisions/AUTH-DROPIN-API-ONLY.md)
- [Cart Dropin Slots](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/cart/slots)

## Testing

1. **Add to cart**: Verify items appear in mini cart
2. **Remove items**: Click remove button, verify item is removed
3. **Empty state**: Remove all items, verify empty state displays
4. **Cart badge sync**: Verify header badge updates with item count
5. **Navigation**: Verify "View Cart" and "Checkout" buttons work
6. **Close button**: Verify mini cart closes when X is clicked

