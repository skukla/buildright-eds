# ADR-022: Dropin Inspector Detection Requirements

**Status**: Accepted

**Date**: January 2026

**Decision Makers**: BuildRight Implementation Team

**Related Documentation**:
- `docs/adr/ADR-010-dropin-slot-customization-pattern.md` - Slot customization pattern
- `docs/reference/dropin-architecture.md` - Canonical dropin reference
- `dropin-inspector-chrome-extension/CLAUDE.md` - Inspector implementation details

---

## Context

The Dropin Inspector Chrome extension provides visual debugging for Adobe EDS blocks and dropin slots. During implementation of the `commerce-mini-cart` block in the header, we discovered that dynamically created blocks were not appearing in the inspector, while slots in other blocks (like `product-list`) were visible.

### Investigation Findings

The dropin inspector uses two selectors for detection:

```javascript
// Block detection
document.querySelectorAll('[data-block-name]')

// Slot detection
document.querySelectorAll('[data-slot], [data-slot-key]')
```

**Key discovery**: Adobe dropins automatically add `data-slot` attributes to slot wrapper elements. However, dynamically created EDS blocks do not automatically receive the `data-block-name` attribute—this must be set manually.

### The Problem

When the header dynamically creates commerce blocks:

```javascript
// Original code - MISSING data-block-name
const miniCartBlock = document.createElement('div');
miniCartBlock.className = 'commerce-mini-cart';
miniCartBlock.dataset.headerContext = 'true';
```

The inspector could not find the block because it searches for `[data-block-name]`, not class names. The slots inside the block existed with proper `data-slot` attributes, but without a parent block, they weren't displayed in the inspector's hierarchical view.

---

## Decision

**Dynamically created EDS blocks MUST include the `data-block-name` attribute for dropin inspector compatibility.**

### Implementation Pattern

```javascript
// Correct pattern for dynamically created blocks
const block = document.createElement('div');
block.className = 'block-name';
block.dataset.blockName = 'block-name';  // Required for inspector
block.dataset.headerContext = 'true';    // Optional context flags
container.appendChild(block);
await decorateBlock(block, 'block-name');
```

### Detection Hierarchy

```
Inspector Detection Flow:

1. Find all blocks:      [data-block-name]
2. For each block:       Find [data-slot] or [data-slot-key] within
3. Build tree:           blocks → slots → nested blocks → nested slots

Without data-block-name, slots are orphaned and not displayed.
```

---

## Slot API and Inspector Visibility

### Slot Context Methods

| Method | Inspector Visibility | Slot Wrapper |
|--------|---------------------|--------------|
| `ctx.replaceWith(el)` | Visible | Preserved (with `data-slot`) |
| `ctx.appendChild(el)` | Visible | Preserved (with `data-slot`) |
| `ctx.prependChild(el)` | Visible | Preserved (with `data-slot`) |

**Key insight**: Both `replaceWith()` and `appendChild()` preserve the slot wrapper element with its `data-slot` attribute. The difference is:
- `replaceWith()` - Replaces the slot's *content*, wrapper remains
- `appendChild()` - Adds content inside the slot wrapper

Both approaches maintain inspector visibility.

---

## Verification

To verify blocks and slots are detectable, run in browser console:

```javascript
// Check all detected blocks
document.querySelectorAll('[data-block-name]')
  .forEach(el => console.log(el.dataset.blockName));

// Check slots within a specific block
document.querySelectorAll('.commerce-mini-cart [data-slot]')
  .forEach(el => console.log(el.dataset.slot));

// Quick counts
console.log('Blocks:', document.querySelectorAll('[data-block-name]').length);
console.log('Slots:', document.querySelectorAll('[data-slot]').length);
```

### Expected Results for Header Blocks

```javascript
// Header should contain:
{
  blocks: ['header', 'user-menu', 'commerce-mini-cart', ...],
  miniCartSlots: ['ProductList', 'EmptyCart', 'ProductListFooter', 'PreCheckoutSection']
}
// Note: user-menu has no slots (it's custom BuildRight UI, not a dropin)
// commerce-mini-cart has slots from the MiniCart dropin container
```

---

## Files Modified

### blocks/header/header.js

Added `data-block-name` to dynamically created blocks:

```javascript
// User menu block (custom BuildRight UI, not using auth dropin)
const userMenuBlock = document.createElement('div');
userMenuBlock.className = 'user-menu';
userMenuBlock.dataset.blockName = 'user-menu';  // Required for inspector
userMenuBlock.dataset.headerContext = 'true';

// Mini cart block
const miniCartBlock = document.createElement('div');
miniCartBlock.className = 'commerce-mini-cart';
miniCartBlock.dataset.blockName = 'commerce-mini-cart';  // Required for inspector
miniCartBlock.dataset.headerContext = 'true';
```

**Note:** The header originally used an `auth` block for the user menu, but this was separated into a dedicated `user-menu` block because:
- The `auth` block uses @dropins/storefront-auth containers (SignIn, SignUp, ResetPassword)
- The user menu is completely custom BuildRight UI with no dropin involvement
- Separating them clarifies the architecture and makes dropin inspector output more accurate

### blocks/commerce-mini-cart/commerce-mini-cart.js

Changed to render dropin content **inside** the block element:

```javascript
// BEFORE (wrong): Rendered to container, slots were siblings to block
const targetContainer = isHeaderContext
  ? document.getElementById('mini-cart-container')
  : block;
targetContainer.appendChild(miniCartWrapper);

// AFTER (correct): Render inside block so slots are descendants
block.appendChild(miniCartWrapper);
```

This ensures the slot hierarchy is:
```
commerce-mini-cart (data-block-name)
  └─ .mini-cart wrapper
      └─ slots (data-slot)
```

Instead of the broken structure:
```
mini-cart-container
  ├─ commerce-mini-cart (data-block-name) ← empty!
  └─ .mini-cart wrapper
      └─ slots ← orphaned from block
```

---

## Slot Visibility Filtering

The inspector filters out slots that are hidden or empty. Understanding this helps debug why slots appear or don't appear.

### Filtering Criteria

Slots are **hidden** if any of these are true:
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- `width === 0` or `height === 0`
- No visible content (text, images, buttons, or sized children)

### Why Some Hidden Slots Still Appear

Slots inside collapsed containers (like the mini-cart dropdown) may still appear in the inspector if:

1. **Timing**: The inspector scanned before CSS fully applied
2. **Content detection**: The slot has text/images even if dimensions are 0
3. **Ancestor vs element**: The slot element itself may have `display: block` even if an ancestor has `visibility: hidden`

Example from SelectedFacets:
- Has `214px × 4px` dimensions (4px from padding)
- Contains a child element
- Passes all visibility checks legitimately

---

## Consequences

### Positive

- **Debuggability**: All blocks visible in dropin inspector
- **Consistency**: Same detection pattern for static and dynamic blocks
- **Documentation**: Clear requirements for future dynamic block creation

### Negative

- **Manual step**: Developers must remember to add `data-block-name`
- **Not enforced**: `decorateBlock()` doesn't add the attribute automatically

### Future Consideration

Consider updating `decorateBlock()` to automatically set `data-block-name` if not present:

```javascript
export async function decorateBlock(block, blockName = null) {
  let name = blockName || block.dataset.blockName;

  // Auto-set data-block-name for inspector compatibility
  if (name && !block.dataset.blockName) {
    block.dataset.blockName = name;
  }
  // ... rest of function
}
```

---

## Checklist for Dynamic Block Creation

When creating blocks dynamically (not from DOM/fragment):

- [ ] Set `className` to block name
- [ ] Set `dataset.blockName` to block name (required for inspector)
- [ ] Set any context flags (`dataset.headerContext`, etc.)
- [ ] Append to container
- [ ] Call `decorateBlock(block, 'block-name')`

---

## References

### Internal
- `blocks/header/header.js:503-541` - Dynamic block creation (user-menu, commerce-mini-cart)
- `blocks/user-menu/user-menu.js` - User menu block (custom BuildRight UI)
- `scripts/scripts.js:109` - `decorateBlock()` function
- `dropin-inspector-chrome-extension/content.js:381` - Block detection selector

### External
- [Adobe EDS Block Development](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started.html)

---

**Last Updated**: January 2026
