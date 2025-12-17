# Cart Badge Race Condition Fix

**Date**: December 12, 2024  
**Status**: ✅ Resolved  
**Issue**: Cart badge showing "Loading..." or incorrect state during page load  
**Root Cause**: Race condition between header initialization and Cart Dropin initialization

---

## Problem Description

### Symptom
Users occasionally saw "Loading..." text or an inconsistent state in the cart badge (the small bubble showing cart item count) in the header during page load.

### Root Cause
There was a **race condition** between:
1. **Header HTML loading** with the cart badge element
2. **Cart Dropin initialization** (asynchronous)
3. **Badge update logic** running

**Timeline of the race**:
```
Time 0ms:  Header HTML loads with <span class="cart-badge"></span>
Time 10ms: Header.js starts executing
Time 20ms: Cart Dropin initializer starts loading
Time 50ms: Header.js finishes, badge still has no explicit state
Time 100ms: Cart Dropin initializes
Time 150ms: Cart badge update runs
```

During the ~150ms gap, the badge was in an **undefined state** - it might:
- Show "Loading..." (if something set initial text)
- Show "0" (from previous page load)
- Be visible when it should be hidden
- Flash/flicker as state updates

---

## Solution

### Explicit Initialization in Header

Added explicit badge initialization **before** any dropin logic runs:

```javascript
// blocks/header/header.js

export default async function decorate(block) {
  // ... existing setup ...
  
  // Initialize cart badge to hidden state (prevent race condition)
  const cartBadge = block.querySelector('.cart-badge, [data-cart-badge]');
  if (cartBadge) {
    cartBadge.textContent = '';
    cartBadge.classList.remove('has-items');
    console.log('[Header] Cart badge initialized to hidden state');
  }
  
  // ... rest of initialization ...
}
```

### CSS Defaults

Ensured CSS has correct default state:

```css
/* blocks/header/header.css */

.cart-badge {
  /* ... other styles ... */
  display: none; /* Hidden by default when empty */
}

.cart-badge.has-items {
  display: flex; /* Show when cart has items */
}
```

### Cart Initializer Updates

The cart initializer correctly updates the badge once the cart is loaded:

```javascript
// scripts/initializers/cart.js

function updateCartBadge() {
  const totalQuantity = _cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const badges = document.querySelectorAll('.cart-badge, [data-cart-badge]');
  badges.forEach(badge => {
    badge.textContent = totalQuantity > 0 ? totalQuantity : '';
    badge.classList.toggle('has-items', totalQuantity > 0);
  });
}
```

---

## Timeline (After Fix)

```
Time 0ms:  Header HTML loads with <span class="cart-badge"></span>
Time 10ms: Header.js starts executing
Time 15ms: Badge explicitly set to hidden state ✅
Time 20ms: Cart Dropin initializer starts loading
Time 50ms: Header.js finishes, badge is in known hidden state ✅
Time 100ms: Cart Dropin initializes
Time 150ms: Cart badge update runs, shows correct count (or stays hidden) ✅
```

**Result**: No flashing, no "Loading...", consistent behavior.

---

## Key Principles

### 1. **Explicit Initial State**
Never rely on implicit/undefined initial state for UI elements. Always set a known state **before** asynchronous operations.

### 2. **Early Initialization**
Initialize UI elements as early as possible in the component lifecycle, before any async operations that might update them.

### 3. **Defensive CSS**
Use CSS to provide a safe default state (`display: none` for cart badge when empty).

### 4. **Clear State Transitions**
Define clear states and transitions:
- **Hidden** (default): `display: none`, no text
- **Visible with count**: `display: flex`, `.has-items` class, count text

---

## Testing

### Before Fix
- ❌ Badge sometimes showed "Loading..."
- ❌ Badge flickered during page load
- ❌ Inconsistent behavior across page refreshes

### After Fix
- ✅ Badge always starts hidden
- ✅ No flickering or flash of unstyled content
- ✅ Consistent behavior across all page loads
- ✅ Badge appears smoothly when cart has items

### Verification
Check console logs for initialization sequence:
```
[Header] Cart badge initialized to hidden state
[Cart Dropin] Initializing...
[Cart Dropin] Registered
[Commerce Mini Cart] Initialization complete
```

---

## Related Files

| File | Change | Purpose |
|------|--------|---------|
| `blocks/header/header.js` | Added explicit badge initialization | Set known state before async ops |
| `blocks/header/header.html` | Changed `.cart-count` to `.cart-badge` | Consistent selector convention |
| `blocks/header/header.css` | Updated `.cart-badge` with `.has-items` | Correct default/visible states |
| `scripts/initializers/cart.js` | No changes needed | Already had correct update logic |

---

## Prevention for Future Components

### Checklist for Async-Dependent UI Elements

When creating UI elements that depend on asynchronous data:

- [ ] **Set explicit initial state** in component's `decorate()` function
- [ ] **Use CSS defaults** that provide a safe fallback
- [ ] **Document the initialization sequence** in comments
- [ ] **Add console logs** for debugging initialization timing
- [ ] **Test with slow network** to verify race conditions don't occur

### Example Template

```javascript
export default async function decorate(block) {
  // 1. Find UI elements
  const dynamicElement = block.querySelector('.my-dynamic-element');
  
  // 2. Set explicit initial state FIRST
  if (dynamicElement) {
    dynamicElement.textContent = '';
    dynamicElement.classList.add('loading');
    dynamicElement.style.display = 'none'; // or appropriate default
  }
  
  // 3. Then start async operations
  const data = await fetchSomeData();
  
  // 4. Update element based on data
  if (dynamicElement && data) {
    dynamicElement.textContent = data.value;
    dynamicElement.classList.remove('loading');
    dynamicElement.style.display = 'block';
  }
}
```

---

## Additional Notes

### Why This Matters

Race conditions in UI initialization create:
- **Poor user experience** (flickering, confusing states)
- **Difficult-to-reproduce bugs** (timing-dependent)
- **Maintenance overhead** (hard to debug)

### EDS Best Practice

This fix aligns with **EDS block patterns**:
- Blocks should initialize their own state
- Don't rely on external timing or initialization order
- Make components resilient to async operations

---

## Conclusion

The cart badge race condition was resolved by:
1. ✅ Adding explicit initialization in `header.js`
2. ✅ Ensuring CSS defaults to hidden state
3. ✅ Maintaining correct update logic in cart initializer

This creates a **predictable, testable initialization sequence** that prevents UI inconsistencies.

