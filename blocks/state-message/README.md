# State Message Block

A reusable component for displaying consistent state messages across the BuildRight site.

## Purpose

Provides a standardized UI for displaying:
- ✅ **Error states** - API failures, validation errors
- ✅ **Success states** - Order confirmations, successful actions
- ✅ **Empty states** - Empty cart, no results
- ✅ **Loading states** - Content loading indicators

## Design System Integration

This block uses BuildRight's state styling system defined in `styles/components.css`:
- `.state-container` - Base container with centered layout
- `.error-state` - Red error styling
- `.loading-state` - Loading spinner animation
- `.empty-state` - Empty state styling

## Usage

### 1. Declarative (via HTML)

```html
<div class="state-message" 
     data-type="error"
     data-icon="x-circle"
     data-title="Failed to Load"
     data-message="Unable to load content. Please try again."
     data-button-text="Try Again"
     data-button-href="/pages/catalog.html"
     data-button-secondary-text="Contact Support"
     data-button-secondary-href="/pages/support.html">
</div>
```

### 2. Programmatic (via JavaScript)

```javascript
import { createStateMessage } from '../state-message/state-message.js';

// Simple error
block.innerHTML = '';
block.appendChild(createStateMessage({
  type: 'error',
  icon: 'x-circle',
  title: 'Failed to Load Cart',
  message: 'Unable to load the shopping cart. Please try again later.',
  buttons: [
    { text: 'Browse Catalog', href: '/pages/catalog.html', primary: true }
  ]
}));

// Success with HTML in message
block.innerHTML = '';
block.appendChild(createStateMessage({
  type: 'success',
  icon: 'check-circle',
  title: 'Order Complete!',
  message: 'Your order <strong>#12345</strong> has been placed.',
  buttons: [
    { text: 'Continue Shopping', href: '/pages/catalog.html', primary: true },
    { text: 'View Orders', href: '/pages/order-history.html', primary: false }
  ]
}));

// Error with callback button
block.innerHTML = '';
block.appendChild(createStateMessage({
  type: 'error',
  icon: 'alert-circle',
  title: 'Configuration Error',
  message: 'Some required fields are missing.',
  buttons: [
    { 
      text: 'Try Again', 
      onClick: () => retryConfiguration(), 
      primary: true 
    }
  ]
}));
```

## Available Icons

The block includes pre-defined SVG icons:

| Icon Key | Description | Common Use |
|----------|-------------|------------|
| `alert-circle` | Circle with exclamation | Warnings, validation errors |
| `x-circle` | Circle with X | Failures, API errors |
| `check-circle` | Circle with checkmark | Success messages |
| `shopping-cart` | Shopping cart | Empty cart states |
| `spinner` | Loading spinner | Loading states |

## Options

### `type`
State type affects styling via CSS classes:
- `error` - Red error styling
- `success` - Success styling (green checkmark)
- `empty` - Empty state styling
- `loading` - Loading state with spinner

### `icon`
Icon key from the `ICONS` object (see Available Icons above).

### `title`
Message title displayed as an `<h2>` element.

### `message`
Message content. Supports HTML (use `<strong>`, `<br>`, etc.).

### `buttons`
Array of button configurations:
```javascript
{
  text: 'Button Label',      // Required
  href: '/path/to/page',     // For links (OR use onClick)
  onClick: () => {},         // For callbacks (OR use href)
  primary: true              // true = primary button, false = secondary
}
```

## Best Practices

### ⚠️ Never Expose Technical Errors to Users

Always show **user-friendly messages** and log technical details to the console:

```javascript
try {
  // ... some operation
} catch (error) {
  console.error('[Component] Failed:', error); // ✅ Log for developers
  
  // ✅ User-friendly message only
  const userMessage = 'Unable to load content. Please try again later.';
  
  // ✅ Optionally show technical details in development only
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const debugInfo = isDevelopment ? `<br><small style="color: var(--color-text-disabled); margin-top: 0.5rem; display: block;">Dev Info: ${error.message}</small>` : '';
  
  block.appendChild(createStateMessage({
    type: 'error',
    icon: 'x-circle',
    title: 'Failed to Load',
    message: userMessage + debugInfo, // ✅ Clean message + dev-only details
    buttons: [{ text: 'Try Again', href: '/pages/home.html', primary: true }]
  }));
}
```

**❌ Don't do this:**
```javascript
// Bad: Exposes technical details to customers in production
message: error.message || 'Unable to load content.'
```

**✅ Do this:**
```javascript
// Good: Always show friendly message, log technical details
const userMessage = 'Unable to load content. Please try again later.';
console.error('[Component] Technical error:', error);
```

## Examples from Codebase

### Cart Dropin - API Failure
```javascript
catch (error) {
  console.error('[Cart Dropin] Failed to render:', error);
  
  const userMessage = 'We\'re unable to load your shopping cart right now.<br>Please try again or continue browsing.';
  const isDevelopment = window.location.hostname === 'localhost';
  const debugInfo = isDevelopment ? `<br><small>Dev Info: ${error.message}</small>` : '';
  
  block.appendChild(createStateMessage({
    type: 'error',
    icon: 'x-circle',
    title: 'Something went wrong',  // Generic title (sentence case, not redundant)
    message: userMessage + debugInfo,  // Specific context + guidance, multi-line
    buttons: [{ text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true }]
  }));
}
```

**Note**: Title uses sentence case ("Something went wrong"), message provides specific context with line breaks for readability. This avoids redundancy.

### Order Confirmation - Success
```javascript
block.appendChild(createStateMessage({
  type: 'success',
  icon: 'check-circle',
  title: 'Thank You for Your Order!',
  message: `Your order <strong>${orderNumber}</strong> has been placed successfully.`,
  buttons: [
    { text: 'Continue Shopping', href: `${basePath}pages/catalog.html`, primary: true },
    { text: 'View Order History', href: `${basePath}pages/order-history.html`, primary: false }
  ]
}));
```

### Checkout - Feature Disabled
```javascript
block.appendChild(createStateMessage({
  type: 'error',
  icon: 'alert-circle',
  title: 'Commerce Dropins Not Enabled',
  message: 'Please enable Commerce Dropins to proceed with checkout.',
  buttons: [{ text: 'Return to Cart', href: `${basePath}pages/cart.html`, primary: false }]
}));
```

## Benefits

✅ **Consistency** - All error/success/empty states use the same design system
✅ **DRY** - No duplicated HTML across blocks
✅ **Maintainability** - Update once, applies everywhere
✅ **Accessibility** - Proper semantic HTML with ARIA support
✅ **Themeable** - Uses BuildRight design tokens

## Related

- `styles/components.css` - State container base styles
- `blocks/cart-dropin/cart-dropin.js` - Example usage
- `blocks/checkout-dropin/checkout-dropin.js` - Example usage
- `blocks/order-confirmation-dropin/order-confirmation-dropin.js` - Example usage

