# PDP Visual Hierarchy Analysis

## Current State (Before Standardization)

### Sidebar Hierarchy
```
┌─────────────────────────────────────┐
│ ToughGrip 2x4 Stud - 8ft           │ ← H1, 2rem (32px), weight: 400 (light)
│ LBR-D0414F1E                        │ ← SKU, 0.9375rem (15px), weight: 400
│                                     │
│ $29.31                              │ ← Price, 3rem (48px), weight: 700 (bold)
│ [PRODUCTION BUILDER]                │ ← Badge, 0.875rem (14px), weight: 600
│                                     │
│ ─────────────────────────────       │ ← Border separator
│ View Volume Pricing                 │ ← Link, 0.875rem (14px), weight: 400
│ [-] [1] [+]                         │ ← Quantity, 1.125rem (18px), weight: 600
│ [Add to Cart]                       │ ← Button, 1.125rem (18px), weight: 600
└─────────────────────────────────────┘
```

**Visual Weight Analysis:**
- **Price (700, 48px)** = Heaviest visual weight ← Dominates the design
- **Product Name (400, 32px)** = Light visual weight ← Recedes into background
- **Tier Badge (600, 14px)** = Medium-small
- **Quantity/Button (600, 18px)** = Medium

**Issue:** The price visually **overwhelms** the product name. The product name feels secondary.

---

## Proposed State (After Standardization)

### With Product Name at 700
```
┌─────────────────────────────────────┐
│ ToughGrip 2x4 Stud - 8ft           │ ← H1, 2rem (32px), weight: 700 (BOLD)
│ LBR-D0414F1E                        │ ← SKU, 0.9375rem (15px), weight: 400
│                                     │
│ $29.31                              │ ← Price, 3rem (48px), weight: 700 (BOLD)
│ [PRODUCTION BUILDER]                │ ← Badge, 0.875rem (14px), weight: 600
│                                     │
│ ─────────────────────────────       │ ← Border separator
│ View Volume Pricing                 │ ← Link, 0.875rem (14px), weight: 400
│ [-] [1] [+]                         │ ← Quantity, 1.125rem (18px), weight: 600
│ [Add to Cart]                       │ ← Button, 1.125rem (18px), weight: 600
└─────────────────────────────────────┘
```

**Visual Weight Analysis:**
- **Price (700, 48px)** = Heaviest (size wins)
- **Product Name (700, 32px)** = Second heaviest ← More balanced!
- **Tier Badge (600, 14px)** = Medium-small
- **Quantity/Button (600, 18px)** = Medium

**Improvement:** Clear hierarchy through **SIZE**, not weight. Both product name and price have appropriate emphasis.

---

## Alternative: Reduce Price Weight?

### Option A: Reduce Price to 600
```
┌─────────────────────────────────────┐
│ ToughGrip 2x4 Stud - 8ft           │ ← H1, 2rem, weight: 700
│ LBR-D0414F1E                        │ ← SKU, 0.9375rem, weight: 400
│                                     │
│ $29.31                              │ ← Price, 3rem, weight: 600 ← LIGHTER
│ [PRODUCTION BUILDER]                │ ← Badge, 0.875rem, weight: 600
└─────────────────────────────────────┘
```

**Analysis:**
- Price at 600 feels less emphasized
- For e-commerce, bold prices (700) are a conversion best practice
- Price at 600 might feel "weak" for such a critical element

**Verdict:** ❌ Not recommended. Price should remain bold (700).

---

### Option B: Increase Price to 800 or 900?
```
│ $29.31                              │ ← Price, 3rem, weight: 800/900
```

**Analysis:**
- Our design system only defines: 300, 400, 500, 600, 700
- Adding 800/900 introduces new weights (increases page load)
- Price at 700 is already bold enough

**Verdict:** ❌ Not recommended. No need to go heavier.

---

## Recommended Approach: Keep Price at 700

### Rationale

1. **E-commerce Best Practices**
   - Bold prices (700) are standard in conversion-optimized designs
   - Price is the primary decision factor for many B2B buyers
   - Emphasis is appropriate and expected

2. **Visual Hierarchy Through Size**
   - Price: 3rem (48px), 700 = Largest + Bold = **Primary**
   - Product Name: 2rem (32px), 700 = Medium + Bold = **Secondary**
   - SKU: 0.9375rem (15px), 400 = Small + Regular = **Tertiary**
   
   **This creates clear hierarchy through SIZE, not weight.**

3. **Consistency with Design System**
   - Product Name uses standard H1 token (700)
   - Price uses standard bold emphasis (700)
   - No custom weights needed

4. **Real-World Examples**
   - **Amazon:** Product name (bold), Price (bold, larger)
   - **Home Depot:** Product name (bold), Price (bold, larger)
   - **Grainger:** Product name (bold), Price (bold, larger)
   
   Industry standard = both bold, differentiated by size.

---

## Final Recommendation

### ✅ Standardize Product Name, Keep Price Bold

**Changes:**
```css
/* Product Name - Use standard H1 */
.product-name-clean {
  font-size: 2rem;
  font-weight: 700; /* ← CHANGE from 400 to 700 */
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

/* Price - Keep bold (no change) */
.current-price-clean {
  font-size: 3rem;
  font-weight: 700; /* ← KEEP at 700 */
  color: var(--color-text);
  line-height: 1;
  margin-bottom: 0.5rem;
}
```

**Benefits:**
- ✅ Clear hierarchy: Size > Weight
- ✅ Consistent with design system
- ✅ Follows e-commerce best practices
- ✅ Product name has appropriate emphasis
- ✅ Price maintains conversion focus
- ✅ No new font-weights needed

---

## Visual Comparison

### Before (Current)
- Product Name: **Light** (400) + Medium Size (32px) = **Recedes**
- Price: **Bold** (700) + Large Size (48px) = **Dominates**
- **Result:** Price overwhelms product name

### After (Proposed)
- Product Name: **Bold** (700) + Medium Size (32px) = **Strong presence**
- Price: **Bold** (700) + Large Size (48px) = **Primary focus**
- **Result:** Balanced hierarchy, clear importance of both elements

---

## Implementation

Change only the product name font-weight in `blocks/product-detail/product-detail.css`:

```css
.product-name-clean {
  font-size: 2rem;
  font-weight: 700; /* CHANGED: was 400 */
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
```

**No changes needed to price** - it's already optimal at 700.

