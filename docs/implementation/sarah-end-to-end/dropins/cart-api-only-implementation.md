# Cart API-Only Implementation

**Date**: December 12, 2024  
**Status**: ✅ Complete  
**Pattern**: API-Only Commerce Dropin Integration

---

## Summary

Successfully implemented BuildRight's shopping cart using the **API-only pattern** with Commerce Cart Dropin. This follows the same successful approach used for Auth Dropin integration.

---

## Implementation Details

### Files Created

| File | Purpose |
|------|---------|
| `blocks/cart-page/cart-page.js` | Cart block with BuildRight HTML + Dropin APIs |
| `blocks/cart-page/cart-page.css` | BuildRight cart styling (from `wip` branch) |

### Files Modified

| File | Change |
|------|--------|
| `pages/cart.html` | Replaced `cart-dropin` with `cart-page` block |
| `scripts/scripts.js` | Registered `cart-page` in `blockSelectors` and `blockPatterns` |

---

## Architecture

### Pattern: API-Only Integration

```
┌─────────────────────────────────────┐
│   BuildRight Cart HTML/CSS          │
│   (from wip branch)                 │
│   - Two-column layout               │
│   - Cart items list                 │
│   - Order summary sidebar           │
│   - Quantity controls               │
│   - Remove buttons                  │
│   - Promo code section              │
└─────────────────────────────────────┘
              ↓ Wired to
┌─────────────────────────────────────┐
│   Commerce Cart Dropin APIs         │
│   - getCart()                       │
│   - updateQuantity(itemId, qty)     │
│   - removeFromCart(itemId)          │
│   - waitForCart()                   │
└─────────────────────────────────────┘
              ↓ Listens to
┌─────────────────────────────────────┐
│   Commerce Cart Events              │
│   - cart/updated                    │
│   - cart/data                       │
│   - cart/initialized                │
└─────────────────────────────────────┘
```

---

## Features Implemented

### ✅ Cart Display

- **Two-column layout**:
  - Left: Cart items list
  - Right: Order summary sidebar
- **Empty cart state**:
  - Cart icon
  - "Your cart is empty" message
  - "Browse Catalog" button
- **Cart item cards**:
  - Product image
  - Product name
  - SKU
  - Unit price
  - Quantity controls (increase/decrease)
  - Remove button
  - Item total

### ✅ Cart Operations

- **Get cart data**: `await getCart()`
- **Update quantity**: `await updateQuantity(itemId, newQuantity)`
- **Remove item**: `await removeFromCart(itemId)`
- **Navigate to product**: Click on cart item card

### ✅ Order Summary

- Subtotal
- Discount (if applied)
- Estimated savings
- Shipping (Free)
- Total
- **Promo code section**:
  - Input field
  - Apply button
  - Success/error messages

### ✅ Event Handling

- **Listens for** `cart/updated` event
- **Listens for** `cart/data` event
- **Auto-updates** UI when cart changes

---

## Why API-Only?

### BuildRight Cart Complexity

1. ✅ **Custom two-column layout** - Dropin can't control overall layout
2. ✅ **Specific order summary structure** - Promo code UI, discount badges
3. ✅ **Bundle handling (future)** - Project bundles with BOM line items
4. ✅ **Custom item cards** - Badges, persona-based pricing display

### Cart Dropin Slot Limitations

The Commerce Cart Dropin provides slots for:
- ✅ Individual item parts (thumbnail, title, SKU, quantity, price)
- ✅ Footer content

But **NOT** for:
- ❌ Overall layout structure (can't control 2-column vs stacked)
- ❌ Order summary sidebar structure
- ❌ Promo code UI customization
- ❌ Custom item card containers

### Architectural Consistency

- ✅ Same pattern as Auth Dropin (proven successful)
- ✅ Full control over HTML structure
- ✅ Maintains BuildRight's exact design
- ✅ Flexible for future features (bundles, BOM editing)

---

## Code Example

### Cart Page Block

```javascript
// blocks/cart-page/cart-page.js

// Import Cart Dropin APIs
const { 
  getCart, 
  updateQuantity, 
  removeFromCart, 
  waitForCart 
} = await import('../../scripts/initializers/cart.js');

// Wait for cart to initialize
await waitForCart();

// Render cart items
async function renderCartItems() {
  const cart = await getCart();
  
  if (!cart || !cart.items || cart.items.length === 0) {
    // Show empty state
    return;
  }
  
  // Render items with BuildRight HTML
  cart.items.forEach(item => {
    const card = createCartItemCard(item);
    itemsContainer.appendChild(card);
  });
}

// Listen for cart updates
events.on('cart/updated', () => {
  renderCartItems();
});
```

---

## Testing

### Empty Cart State ✅

- **URL**: `http://localhost:8000/pages/cart.html`
- **Expected**: "Your cart is empty" message
- **Result**: ✅ Working correctly

### Cart Operations ⚠️

- **Add to cart**: Requires real Commerce backend (CORS issues in local dev)
- **Update quantity**: APIs wired correctly, will work with backend
- **Remove item**: APIs wired correctly, will work with backend

---

## Next Steps

1. **Test with real Commerce backend** when CORS is configured
2. **Implement bundle handling** for project BOMs (Phase 7)
3. **Apply same pattern to checkout page** (use Checkout Dropin APIs)
4. **Document pattern** for other API-only integrations

---

## Related Documents

- [dropin-integration-pattern.md](../../../standards/dropin-integration-pattern.md) - Standard pattern for Dropin integration
- [AUTH-DROPIN-IMPLEMENTATION.md](../../../archive/reference-old/AUTH-DROPIN-IMPLEMENTATION.md) - Auth Dropin implementation
- [PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md](../../../archive/reference-old/PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md) - Original research

---

**Last Updated**: December 12, 2024

