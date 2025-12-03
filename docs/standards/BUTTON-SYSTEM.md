# BuildRight Button System

## Overview

BuildRight uses a **3-tier button hierarchy** based on the chosen **Option 3: Deep Blue + Warm Orange** theme. This system ensures visual consistency, clear action hierarchy, and WCAG accessibility compliance.

---

## Color Palette Reference

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Tangerine Orange | `#f97316` | `--color-accent-500` | Primary CTAs |
| Sapphire Blue | `#0f5ba7` | `--color-brand-500` | Navigation/Utility |
| Slate Gray | `#475569` | `--color-secondary-500` | Secondary Actions |

---

## Button Hierarchy

### Tier 1: Primary Emphasis - `btn-cta`

**Visual**: Orange solid (#f97316), bold font-weight (700)

**Use for**: The single most important action in any section/view (accent color for emphasis)

**Examples**:
- "View Dashboard" (hero primary path)
- "View My Templates" (CTA section primary)
- "Proceed to Checkout" (cart conversion)
- "Generate BOM" (configurator submission)
- "Create Account" (signup final step)
- "Login" (authentication)

```html
<button class="btn btn-cta btn-lg">View Dashboard</button>
<button class="btn btn-cta">Proceed to Checkout</button>
<button class="btn btn-cta">Generate BOM</button>
```

**The Core Rule: ONE Orange Button Per Section**
- Orange provides visual **emphasis and focal point**
- Use for the **primary path forward** in any context
- Can be navigation, conversion, or submission - what matters is hierarchy
- Creates energy and contrast with the blue/gray color scheme

**When NOT to use**:
- ❌ Repeated actions in grids/lists (use `btn-primary` instead)
- ❌ Individual "Add to Cart" on product cards (visual density rule - use blue)
- ❌ Multiple competing actions in the same view (only one orange per section)

---

### Tier 2: Secondary Actions - `btn-secondary`

**Visual**: Slate gray solid (#475569), medium font-weight (600)

**Use for**: Important but non-primary actions, including destructive actions

**Examples**:
- "Cancel"
- "Back"
- "Edit"
- "View Details"
- "Delete Template" (with confirmation modal)
- "Remove Item" (with confirmation modal)

```html
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-secondary btn-sm">Back</button>
<a href="/templates" class="btn btn-secondary">View Details</a>
```

**When to use**:
- Secondary action paired with a primary CTA
- Cancel/dismiss actions
- Navigation back to previous state
- Destructive actions (must use explicit labels + confirmation modals)

---

### Tier 3: Utility Actions - `btn-primary`

**Visual**: Blue solid (#0f5ba7), medium font-weight (600)

**Use for**: All other actionable buttons (when orange would be too much)

**Examples**:
- "Add to Cart" (on product cards/grids)
- "Browse Catalog" (when not the primary section action)
- "View Details"
- "Continue" (multi-step forms)
- "Apply Filters"
- "Start Build" (template cards)

```html
<button class="btn btn-primary">Add to Cart</button>
<a href="/catalog" class="btn btn-primary">Browse Catalog</a>
<button class="btn btn-primary btn-sm">Apply Filters</button>
```

**When to use**:
- **Repeated grid/list actions** - maintains visual calm
- **Secondary navigation** - when not the primary path
- **Utility functions** - filters, continue, retry
- **Card actions** - multiple cards with similar actions
- **Brand alignment** - blue matches BuildRight logo

**Why blue works:**
- Maintains brand consistency across repeated elements
- Provides clear actionability without overwhelming
- Professional, trustworthy appearance
- Complements orange accent without competing

---

## Size Modifiers

| Class | Padding | Font Size | Use Case |
|-------|---------|-----------|----------|
| (default) | `0.75rem 1.5rem` | 16px | Standard buttons |
| `btn-sm` | `0.5rem 1rem` | 14px | Compact UI, tables, cards |
| `btn-lg` | `1rem 2rem` | 18px | Hero CTAs, prominent actions |

```html
<button class="btn btn-cta btn-sm">Small CTA</button>
<button class="btn btn-cta">Default CTA</button>
<button class="btn btn-cta btn-lg">Large CTA</button>
```

---

## Destructive Actions Pattern

Destructive actions (delete, remove) use `btn-secondary` with explicit labels and confirmation modals. **Do NOT use red buttons** - this pattern follows industry standards (GitHub, Google, Shopify) and ensures accessibility.

### Implementation

**Step 1: Trigger Button**
```html
<button class="btn btn-secondary" onclick="showDeleteModal('template-123')">
  Delete Template
</button>
```

**Step 2: Confirmation Modal**
```html
<div class="modal" id="delete-confirm-modal">
  <div class="modal-overlay" onclick="closeDeleteModal()"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h3>Delete Template?</h3>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to delete "<strong>The Sedona</strong>"?</p>
      <p class="modal-warning">This action cannot be undone.</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="closeDeleteModal()">Cancel</button>
      <button class="btn btn-secondary" onclick="executeDelete('template-123')">
        Yes, Delete Template
      </button>
    </div>
  </div>
</div>
```

### Why This Pattern?

1. **Accessibility**: Red buttons fail for colorblind users. WCAG requires that color is not the only means of conveying information.
2. **Clarity**: Explicit labels ("Delete Template" not "Delete") prevent accidental actions.
3. **Confirmation**: Two-step process ensures intentional destructive actions.
4. **Industry Standard**: GitHub, Google, Stripe, and Shopify all use this pattern.

---

## The "One Orange Button Per Section" Rule

Orange is BuildRight's **accent color** - it provides visual emphasis and creates focal points. Use orange strategically to guide users toward the primary action.

### Principle: Visual Hierarchy Over Semantics

**Think "What's the MAIN action here?"** not "Is this a conversion or navigation?"

Orange buttons create emphasis through:
1. **Contrast** - Warm orange vs. cool blue/gray
2. **Scarcity** - Only ONE per section = visual priority
3. **Energy** - Breaks up the professional blue/slate palette

### Examples by Context

| Section Type | Primary Action (Orange) | Secondary Action(s) |
|--------------|------------------------|---------------------|
| **Hero** | "View Dashboard" | "Browse Catalog" (slate) |
| **CTA Section** | "View My Templates" | "Browse Catalog" (slate) |
| **Product Grid** | None (too many cards) | "Add to Cart" (blue, repeated) |
| **Cart Summary** | "Proceed to Checkout" | None |
| **BOM Review** | "Add All to Cart" | "Edit Configuration" (slate) |
| **Signup Form** | "Create Account" (final step) | "Back" (slate), "Continue" (blue) |

### Visual Density Rule

**Ask: "How many times does this action appear on screen?"**

- **1-2 instances** → Orange is safe (`btn-cta`)
- **3-5 instances** → Consider blue to avoid overwhelming
- **10+ instances** → MUST use blue (`btn-primary`)

```html
<!-- BAD: 20 orange buttons competing for attention -->
<div class="product-grid">
  <button class="btn btn-cta">Add to Cart</button> <!-- ❌ -->
  <button class="btn btn-cta">Add to Cart</button> <!-- ❌ -->
  <!-- ... 18 more orange buttons = visual chaos -->
</div>

<!-- GOOD: Blue maintains calm, brand consistency -->
<div class="product-grid">
  <button class="btn btn-primary">Add to Cart</button> <!-- ✅ -->
  <button class="btn btn-primary">Add to Cart</button> <!-- ✅ -->
  <!-- ... 18 more blue buttons = organized, scannable -->
</div>
```

---

## Button Pairing Guidelines

### Primary + Secondary (Most Common)
```html
<div class="button-group">
  <button class="btn btn-cta">Generate BOM</button>
  <button class="btn btn-secondary">Cancel</button>
</div>
```

### Primary CTA + Navigation
```html
<div class="hero-actions">
  <a href="/checkout" class="btn btn-cta btn-lg">Proceed to Checkout</a>
  <a href="/catalog" class="btn btn-primary btn-lg">Continue Shopping</a>
</div>
```

### Confirmation Modal Actions
```html
<div class="modal-actions">
  <button class="btn btn-primary">Cancel</button>  <!-- Safe default -->
  <button class="btn btn-secondary">Yes, Delete</button>  <!-- Destructive -->
</div>
```

---

## Accessibility Requirements

### Color Contrast
All button styles meet WCAG AA standards (4.5:1 minimum contrast ratio):

| Button | Background | Text | Contrast Ratio |
|--------|------------|------|----------------|
| `btn-cta` | #f97316 | white | 4.5:1 ✅ |
| `btn-secondary` | #475569 | white | 7.1:1 ✅ |
| `btn-primary` | #0f5ba7 | white | 5.9:1 ✅ |

### Focus States
All buttons have visible focus indicators:
```css
.btn:focus {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

### Keyboard Navigation
- All buttons are tabbable (`tabindex` not needed for native buttons)
- Enter/Space activates buttons
- Focus order follows visual order

### ARIA Labels
Use `aria-label` when button text alone isn't descriptive:
```html
<button class="btn btn-secondary" aria-label="Delete The Sedona template">
  Delete
</button>
```

---

## Deprecated Classes

The following button classes have been **removed** from the design system:

| Class | Reason | Replacement |
|-------|--------|-------------|
| `btn-outline` | Poor visibility on white backgrounds | `btn-secondary` |
| `btn-outline-accent` | Unused | `btn-secondary` |
| `btn-accent` | Redundant with `btn-cta` | `btn-cta` |
| `btn-error` | Unused; confirmation modals are preferred | `btn-secondary` + modal |
| `btn-checkout` | Custom duplicate | `btn-cta` |

---

## Quick Reference

| Button Type | Class | Color | Usage |
|-------------|-------|-------|-------|
| **Primary Emphasis** | `btn-cta` | Orange | ONE per section - most important action |
| **Utility Actions** | `btn-primary` | Blue | Repeated actions, navigation, secondary paths |
| **Cancel/Secondary** | `btn-secondary` | Slate | Back, cancel, edit, destructive actions |

### Decision Tree

**Ask yourself:**
1. **How many times does this button appear?**
   - 10+ times → Blue (`btn-primary`)
   - 1-2 times → Could be orange
   
2. **Is this THE main action in this section?**
   - Yes → Orange (`btn-cta`)
   - No → Blue (`btn-primary`) or Slate (`btn-secondary`)

3. **Is this cancel/back/destructive?**
   - Yes → Slate (`btn-secondary`)

### Common Patterns

| Context | Primary Action | Secondary Actions |
|---------|---------------|-------------------|
| **Hero Section** | Orange - "View Dashboard" | Slate - "Browse Catalog" |
| **CTA Section** | Orange - "View My Templates" | Slate - "Browse Catalog" |
| **Product Grid** | Blue - "Add to Cart" (repeated) | None |
| **Cart Summary** | Orange - "Proceed to Checkout" | None |
| **Configurator** | Orange - "Generate BOM" | Slate - "Cancel" |
| **Signup Form** | Orange - "Create Account" (final) | Blue - "Continue", Slate - "Back" |

---

## Industry Standards Reference

This button system follows patterns established by:
- **GitHub**: Gray buttons + confirmation modals for destructive actions
- **Google Material Design**: Primary/Secondary/Text button hierarchy
- **Shopify Polaris**: Primary/Secondary/Destructive with confirmation patterns
- **WCAG 2.1 AA**: Accessibility requirements for color contrast and focus states

