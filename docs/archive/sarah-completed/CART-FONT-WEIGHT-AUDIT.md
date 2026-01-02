# Shopping Cart Font-Weight Standardization Audit

## Current Cart Font-Weights vs. Design System

### Page Title: "Shopping Cart" (H1)
**Current:** `font-weight: 700` (line 9, 266)
```css
.cart-title {
  font-size: 2rem;
  font-weight: 700; /* ✅ MATCHES --type-display-1-font */
  color: var(--color-text);
}
```

**Design System Standard:** `--type-display-1-font` = `font-weight: 700`

**Status:** ✅ Aligned with design system.

---

### Order Summary Title (H2)
**Current:** `font-weight: 700` (line 125)
```css
.cart-summary-title {
  font-size: 1.25rem;
  font-weight: 700; /* ❌ SHOULD BE 600 */
  color: var(--color-text);
}
```

**Design System Standard:** H2 uses `--type-display-2-font` = `font-weight: 700` (32px)
**But this is smaller (1.25rem = 20px)**, so it should follow H3/section header pattern.

**Design System H3:** `--type-headline-2-font` = `font-weight: 600`

**Issue:** Using 700 for a small heading (1.25rem) that functions more like an H3/section header.

---

### Cart Item Product Name
**Current:** `font-weight: 600` (line 374)
```css
.cart-item-title {
  font-size: 1.125rem;
  font-weight: 600; /* ✅ MATCHES --type-body-1-strong */
  color: var(--color-text);
}
```

**Design System Standard:** `--type-body-1-strong-font` = `font-weight: 600`

**Status:** ✅ Aligned with design system.

---

### Cart Item Price
**Current:** `font-weight: 600` (line 404)
```css
.cart-item-price {
  font-size: 1rem;
  font-weight: 600; /* ✅ MATCHES --type-body-1-strong */
}
```

**Design System Standard:** `--type-body-1-strong-font` = `font-weight: 600`

**Status:** ✅ Aligned with design system.

---

### Cart Item Total (Line Item Total)
**Current:** `font-weight: 700` (line 420)
```css
.cart-item-total {
  font-size: 1.25rem;
  font-weight: 700; /* ✅ APPROPRIATE - Key conversion metric */
  color: var(--color-text);
}
```

**Design System Context:** Item total is a critical price point, bold (700) is appropriate.

**Status:** ✅ Appropriate emphasis for pricing.

---

### Summary Row Labels
**Current:** `font-weight: 500` (line 162)
```css
.summary-row span:first-child {
  font-weight: 500; /* ⚠️ DEVIATION - Should be 400 or 600 */
  color: var(--color-text-secondary);
}
```

**Design System Standard:** Our system uses 400 (regular) or 600 (semibold), not 500 (medium).

**Issue:** Using `font-weight: 500` which is not a standardized weight in our design system tokens.

---

### Summary Row Values
**Current:** `font-weight: 600` (line 167, 173, 202, 208)
```css
.summary-row span:last-child {
  font-weight: 600; /* ✅ MATCHES --type-body-1-strong */
}
```

**Design System Standard:** `--type-body-1-strong-font` = `font-weight: 600`

**Status:** ✅ Aligned with design system.

---

### Summary Total Label "Total"
**Current:** `font-weight: 700` (line 220)
```css
.summary-total span:first-child {
  font-weight: 700; /* ✅ APPROPRIATE - Final total emphasis */
}
```

**Design System Context:** "Total" label should be bold to emphasize final price.

**Status:** ✅ Appropriate emphasis.

---

### Summary Total Amount
**Current:** `font-weight: 700` (line 227)
```css
.total-amount {
  font-size: 1.5rem;
  color: var(--color-brand-500);
  font-weight: 700; /* ✅ APPROPRIATE - Primary conversion metric */
}
```

**Design System Context:** Final total is the most critical conversion element.

**Status:** ✅ Appropriate emphasis for e-commerce total.

---

### Promo Label
**Current:** `font-weight: 500` (line 58)
```css
.promo-label {
  font-size: 0.875rem;
  font-weight: 500; /* ⚠️ DEVIATION - Should be 400 or 600 */
  color: var(--color-text-secondary);
}
```

**Design System Standard:** Form labels typically use 600 (semibold).

**Issue:** Using `font-weight: 500` which is not standardized.

---

### Promo Messages (Success/Error)
**Current:** `font-weight: 500` (line 109, 119)
```css
.promo-success {
  font-weight: 500; /* ⚠️ DEVIATION - Should be 400 or 600 */
}
```

**Design System Standard:** Messages should be 400 (regular) or 600 (emphasis).

**Issue:** Using `font-weight: 500` which is not standardized.

---

### Empty Cart Title
**Current:** `font-weight: 600` (line 632)
```css
.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 600; /* ✅ MATCHES --type-headline-2 */
}
```

**Design System Standard:** `--type-headline-2-font` = `font-weight: 600`

**Status:** ✅ Aligned with design system.

---

## Summary Table

| Element | Current Weight | Design System | Status |
|---------|---------------|---------------|---------|
| Page Title (H1) | 700 | 700 (display-1) | ✅ Aligned |
| Order Summary Title | 700 | 600 (headline-2) | ⚠️ Should be 600 |
| Cart Item Name | 600 | 600 (body-1-strong) | ✅ Aligned |
| Cart Item Price | 600 | 600 (body-1-strong) | ✅ Aligned |
| Cart Item Total | 700 | N/A (emphasis) | ✅ Appropriate |
| Summary Row Labels | **500** | **400 or 600** | ❌ **MISALIGNED** |
| Summary Row Values | 600 | 600 (body-1-strong) | ✅ Aligned |
| Summary Total Label | 700 | N/A (emphasis) | ✅ Appropriate |
| Summary Total Amount | 700 | N/A (emphasis) | ✅ Appropriate |
| Promo Label | **500** | **600** (form labels) | ❌ **MISALIGNED** |
| Promo Messages | **500** | **400 or 600** | ❌ **MISALIGNED** |
| Empty Cart Title | 600 | 600 (headline-2) | ✅ Aligned |
| Bundle Badge | 600 | 600 | ✅ Aligned |
| Bundle Item Names | 600 | 600 | ✅ Aligned |

---

## Issues Found

### Issue 1: Font-Weight 500 (Non-Standard)
**Problem:** Using `font-weight: 500` in multiple places, but our design system only defines: 300, 400, 600, 700.

**Affected Elements:**
- `.promo-label` (line 58)
- `.promo-success` / `.promo-error` (line 109, 119)
- `.summary-row span:first-child` (line 162)

**Impact:**
- Adds an extra font-weight to page load
- Inconsistent with design system
- Minimal visual difference from 400 or 600

---

### Issue 2: Order Summary Title Too Heavy
**Problem:** "Order Summary" uses `font-weight: 700`, but at 1.25rem (20px) it should follow H3 pattern (600).

**Current:**
```css
.cart-summary-title {
  font-size: 1.25rem;
  font-weight: 700; /* Too heavy for size */
}
```

**Should Be:**
```css
.cart-summary-title {
  font-size: 1.25rem;
  font-weight: 600; /* Match H3/section headers */
}
```

---

## Visual Hierarchy Analysis

### Current State
```
┌─────────────────────────────────────┐
│ Shopping Cart                       │ ← H1, 2rem (32px), weight: 700 ✅
│                                     │
│ ┌─ CART ITEMS ──────────────────┐  │
│ │ ToughGrip 2x4 Stud - 8ft      │  │ ← 1.125rem (18px), weight: 600 ✅
│ │ $29.31 per unit               │  │ ← 1rem (16px), weight: 600 ✅
│ │ Total: $29.31                 │  │ ← 1.25rem (20px), weight: 700 ✅
│ └───────────────────────────────┘  │
│                                     │
│ ┌─ ORDER SUMMARY ────────────────┐ │
│ │ Order Summary                  │ │ ← 1.25rem (20px), weight: 700 ⚠️
│ │                                │ │
│ │ Promo Code                     │ │ ← 0.875rem (14px), weight: 500 ❌
│ │                                │ │
│ │ Subtotal      $29.31           │ │ ← Labels: 500 ❌, Values: 600 ✅
│ │ Savings       $0.00            │ │
│ │ Shipping      Free             │ │
│ │ ─────────────────────          │ │
│ │ Total         $29.31           │ │ ← 1.125rem, Labels: 700 ✅, Amount: 1.5rem, 700 ✅
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Recommendations

### ✅ Fix 1: Remove Font-Weight 500
Replace all instances of `font-weight: 500` with standardized weights.

**Promo Label (Form Label Pattern):**
```css
.promo-label {
  font-size: 0.875rem;
  font-weight: 600; /* CHANGE: was 500, now matches form labels */
  color: var(--color-text-secondary);
}
```

**Promo Messages (Regular Text):**
```css
.promo-success,
.promo-error {
  font-weight: 400; /* CHANGE: was 500, messages are informational */
}
```

**Summary Row Labels (Secondary Text):**
```css
.summary-row span:first-child {
  font-weight: 400; /* CHANGE: was 500, labels are secondary */
  color: var(--color-text-secondary);
}
```

---

### ✅ Fix 2: Reduce Order Summary Title to 600
```css
.cart-summary-title {
  font-size: 1.25rem;
  font-weight: 600; /* CHANGE: was 700, now matches H3 pattern */
  color: var(--color-text);
}
```

**Rationale:** At 1.25rem (20px), this functions as a section header (H3), not a page title (H2).

---

## Benefits of Standardization

1. **Removes non-standard font-weight (500)**
   - Faster page load (fewer font variants)
   - Consistent with design system tokens

2. **Clearer visual hierarchy**
   - Bold (700) reserved for: Page title, item totals, grand total
   - Semibold (600) for: Product names, section headers, values
   - Regular (400) for: Labels, messages, metadata

3. **Better scannability**
   - More contrast between labels (400) and values (600)
   - Total (700) stands out as primary focus

4. **Consistency with other pages**
   - Account dashboard uses same pattern
   - BOM review uses same pattern
   - Build configurator uses same pattern

---

## Implementation Plan

### Phase 1: Remove Font-Weight 500
1. Change `.promo-label` from 500 → 600
2. Change `.promo-success`, `.promo-error` from 500 → 400
3. Change `.summary-row span:first-child` from 500 → 400

### Phase 2: Adjust Order Summary Title
1. Change `.cart-summary-title` from 700 → 600

### Expected Impact
- ✅ All font-weights now use design system tokens (300, 400, 600, 700)
- ✅ Clearer visual hierarchy (labels lighter, values heavier)
- ✅ Better consistency with other pages
- ✅ Potential minor page load improvement (one less font variant)

