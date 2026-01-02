# Commerce Mini Cart Block

**Integration Pattern: UI Container + Configuration + Slots (Level 2)**

This block uses the Adobe Commerce `MiniCart` dropin container with custom slots to achieve BuildRight's exact design while benefiting from automatic state management and built-in features.

## Why MiniCart Container?

The `MiniCart` container provides **17 customization slots** and handles all data management automatically:

- ✅ **Automatic data fetching** - No manual `getCartData()` calls needed
- ✅ **Automatic event handling** - No manual event listeners needed
- ✅ **Automatic state updates** - Counts, totals, and items update automatically
- ✅ **Built-in features** - Loading states, error states, empty states
- ✅ **Custom design via slots** - Full control over HTML structure

**Result**: 35% less code, better maintainability, same BuildRight design

## Architecture

```
┌─────────────────────────────────────────┐
│  MiniCart Dropin Container              │
│  • Fetches cart data automatically      │
│  • Listens to cart events automatically │
│  • Updates counts/totals automatically   │
│  • Handles loading/error states         │
└─────────────────┬───────────────────────┘
                  │
                  │ Custom slots provide
                  ↓
┌─────────────────────────────────────────┐
│  BuildRight Custom HTML (via slots)     │
│  • Heading (title + count + close btn)  │
│  • EmptyCart (custom message + CTA)     │
│  • CartItem (custom styling)            │
│  • Footer (subtotal + action buttons)   │
└─────────────────────────────────────────┘
```

## Features

### 1. Context-Aware Rendering

The block adapts based on where it's used:

- **Header context**: Renders in `#mini-cart-container` as dropdown
- **Standalone context**: Renders as standalone component

### 2. Automatic Synchronization

The dropin container automatically:
- ✅ Fetches cart data
- ✅ Listens to `cart/updated` and `cart/initialized` events
- ✅ Updates item counts and totals
- ✅ Re-renders when cart changes

### 3. BuildRight Design (via Slots)

**Heading Slot**:
- Custom title: "Shopping Cart"
- Item count display
- Close button with SVG icon

**EmptyCart Slot**:
- Custom shopping cart icon
- "Your cart is empty" message
- "Browse Catalog" CTA button

**CartItem Slot**:
- Product image with placeholder support
- Product name and remove button
- Quantity and price display
- Link to product detail page

**Footer Slot**:
- Subtotal display
- "View Cart" button (secondary)
- "Checkout" button (primary)

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

## Implementation

### Container Configuration

```javascript
import { render } from '@dropins/storefront-cart/render.js';
import { MiniCart } from '@dropins/storefront-cart/containers/MiniCart.js';

await render.render(MiniCart, {
  // Configuration options
  routeProduct: (item) => `./product-detail.html?sku=${item.product.sku}`,
  routeCart: () => './cart.html',
  routeCheckout: () => './checkout.html',
  routeEmptyCartCTA: () => './catalog.html',
  displayAllItems: false, // Limit to 5 items
  enableItemRemoval: true,
  hideHeading: true, // Use custom heading via slot
  
  // Custom slots for BuildRight design
  slots: {
    Heading: () => `<!-- Custom header HTML -->`,
    EmptyCart: () => `<!-- Custom empty state HTML -->`,
    CartItem: (context) => `<!-- Custom item HTML -->`,
    Footer: () => `<!-- Custom footer HTML -->`
  }
})(targetContainer);
```

### Configuration Options Used

| Option | Type | Description | Value |
|--------|------|-------------|-------|
| `routeProduct` | `(item) => string` | Product detail page routing | `./product-detail.html?sku=${sku}` |
| `routeCart` | `() => string` | View cart page routing | `./cart.html` |
| `routeCheckout` | `() => string` | Checkout page routing | `./checkout.html` |
| `routeEmptyCartCTA` | `() => string` | Empty cart CTA routing | `./catalog.html` |
| `displayAllItems` | `boolean` | Show all items vs. limited | `false` (limit to 5) |
| `enableItemRemoval` | `boolean` | Enable remove button | `true` |
| `hideHeading` | `boolean` | Hide default heading | `true` (use custom slot) |

### Slots Used

| Slot | Purpose | Context Provided |
|------|---------|------------------|
| `Heading` | Custom header with close button | None |
| `EmptyCart` | Custom empty state | None |
| `CartItem` | Custom cart item template | `{ item }` |
| `Footer` | Custom footer with buttons | None |

**Note**: The MiniCart container provides 17 slots total. We use 4 slots to achieve BuildRight's design.

## Header Integration

Post-render setup handles header-specific functionality:

```javascript
function setupHeaderIntegration(targetContainer) {
  // Wire up toggle button
  const cartToggle = document.getElementById('cart-link-toggle');
  cartToggle.addEventListener('click', (e) => {
    miniCart.classList.toggle('active');
  });
  
  // Wire up close button
  const closeBtn = document.querySelector('#mini-cart-close');
  closeBtn.addEventListener('click', () => {
    miniCart.classList.remove('active');
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!cartWrapper.contains(e.target)) {
      miniCart.classList.remove('active');
    }
  });
}
```

## Styling

All styles are contained in `commerce-mini-cart.css` following EDS block patterns:

- **BuildRight Design System**: Uses CSS variables from `base.css`
- **Responsive**: Adapts to mobile with `max-width` constraints
- **Animations**: Smooth transitions for open/close, hover states
- **Consistent Classes**: Same CSS classes as before (no changes needed)

## What the Dropin Handles Automatically

✅ **Data Fetching**
- Calls cart API automatically
- No manual `getCartData()` needed

✅ **Event Listening**
- Listens to `cart/updated` automatically
- Listens to `cart/initialized` automatically
- No manual event listeners needed

✅ **State Management**
- Updates item counts automatically
- Updates totals automatically
- Re-renders on cart changes

✅ **Loading States**
- Shows spinner while loading
- Built-in loading UI

✅ **Error States**
- Shows error messages on failure
- Built-in error handling

✅ **Empty States**
- Detects empty cart
- Shows EmptyCart slot when empty

✅ **Item Removal**
- Handles remove button clicks
- Calls remove API automatically
- Updates cart after removal

## What We Provide

🎨 **Custom HTML Templates (via slots)**
- Heading slot HTML
- EmptyCart slot HTML
- CartItem slot HTML
- Footer slot HTML

⚙️ **Configuration**
- Route functions for navigation
- Feature flags (displayAllItems, etc.)

🔧 **Header Integration**
- Toggle button behavior
- Close button behavior
- Click-outside handling

## Benefits Over Previous API-Only Approach

### Code Reduction
- **Before**: ~308 lines
- **After**: ~200 lines
- **Reduction**: 35%

### Automatic Features
- ❌ **Before**: Manual data fetching, event listening, state updates
- ✅ **After**: All handled by dropin automatically

### Maintainability
- ❌ **Before**: We maintain all cart logic
- ✅ **After**: Adobe maintains logic, we provide HTML templates

### Future Features
- ❌ **Before**: We must implement new cart features
- ✅ **After**: New features come free from Adobe updates

## Testing

Verify all functionality after changes:

- [ ] Mini cart opens when clicking cart icon
- [ ] Mini cart shows correct item count
- [ ] Mini cart shows correct subtotal
- [ ] Cart items display correctly (name, image, quantity, price)
- [ ] Remove button removes items
- [ ] Click outside closes mini cart
- [ ] Close button closes mini cart
- [ ] Empty state shows when cart is empty
- [ ] "View Cart" button navigates to cart page
- [ ] "Checkout" button navigates to checkout page
- [ ] Product click navigates to product detail page
- [ ] CSS styling is preserved
- [ ] No console errors

## Related Documentation

- [Dropin Integration Pattern](../../docs/standards/dropin-integration-pattern.md) - Pattern guide
- [Mini Cart Refactor](../../docs/archive/MINICART-REFACTOR-DEC-19-2025.md) - Migration details
- [Slots Reference](../../docs/reference/dropin-slots-inventory.md) - All slots used

## Migration History

**December 19, 2025**: Refactored from Level 3 (API-Only) to Level 2 (Container + Slots)
- Changed from custom HTML + manual APIs to MiniCart container with slots
- Reduced code by 35%
- Improved maintainability
- Added automatic state management
- See `docs/archive/MINICART-REFACTOR-DEC-19-2025.md` for complete details

---

**Integration Pattern**: Level 2 (UI Container + Configuration + Slots)  
**Container**: `MiniCart` from `@dropins/storefront-cart`  
**Slots Used**: 4 of 17 available  
**Maintenance**: Low (Adobe maintains logic, we maintain HTML templates)
