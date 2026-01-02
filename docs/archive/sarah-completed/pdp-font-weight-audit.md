# PDP Font-Weight Standardization Audit

## Current PDP Font-Weights vs. Design System

### Product Name (H1)
**Current:** `font-weight: 400` (line 60)
```css
.product-name-clean {
  font-size: 2rem;
  font-weight: 400; /* ❌ DEVIATION */
  color: var(--color-text);
}
```

**Design System Standard:** H1 uses `--type-display-1-font` = `font-weight: 700`
```css
h1 {
  font: var(--type-display-1-font); /* 700 */
}
```

**Issue:** The product name is using a much lighter weight (400 vs 700), creating a refined/elegant look but deviating from our standard H1 hierarchy.

---

### SKU
**Current:** No explicit font-weight (inherits body default)
```css
.product-sku-clean {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  /* Inherits 400 from body */
}
```

**Design System Standard:** Body text = `font-weight: 400` ✅

**Status:** Aligned with design system.

---

### Price
**Current:** `font-weight: 700` (line 84)
```css
.current-price-clean {
  font-size: 3rem;
  font-weight: 700; /* ✅ APPROPRIATE */
}
```

**Design System Context:** Price is a critical conversion element and should be bold/emphasized.

**Status:** Appropriate emphasis for e-commerce pricing.

---

### Tier Badge (e.g., "PRODUCTION BUILDER")
**Current:** `font-weight: 600` (line 98)
```css
.tier-badge-clean {
  font-size: 0.875rem;
  font-weight: 600; /* ✅ MATCHES --type-body-2-strong */
}
```

**Design System Standard:** `--type-body-2-strong-font` = `font-weight: 600`

**Status:** Aligned with design system.

---

### Tab Labels
**Current:** `font-weight: 600` (line 436)
```css
.product-tab {
  font-size: 1rem;
  font-weight: 600; /* ✅ MATCHES --type-body-1-strong */
}
```

**Design System Standard:** `--type-body-1-strong-font` = `font-weight: 600`

**Status:** Aligned with design system.

---

### Modal Header (Volume Pricing)
**Current:** `font-weight: 600` (line 695)
```css
.volume-pricing-modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600; /* ✅ MATCHES --type-headline-2 */
}
```

**Design System Standard:** H3 uses `--type-headline-2-font` = `font-weight: 600`

**Status:** Aligned with design system.

---

### Table Headers
**Current:** `font-weight: 600` (line 125, 737)
```css
.volume-pricing-table-full thead th {
  font-size: 0.875rem;
  font-weight: 600; /* ✅ MATCHES --type-body-2-strong */
}
```

**Design System Standard:** `--type-body-2-strong-font` = `font-weight: 600`

**Status:** Aligned with design system.

---

## Summary

| Element | Current Weight | Design System | Status |
|---------|---------------|---------------|---------|
| Product Name (H1) | **400** | **700** (display-1) | ❌ **MISALIGNED** |
| SKU | 400 (inherited) | 400 (body default) | ✅ Aligned |
| Price | 700 | N/A (emphasis) | ✅ Appropriate |
| Tier Badge | 600 | 600 (body-2-strong) | ✅ Aligned |
| Tabs | 600 | 600 (body-1-strong) | ✅ Aligned |
| Modal H3 | 600 | 600 (headline-2) | ✅ Aligned |
| Table Headers | 600 | 600 (body-2-strong) | ✅ Aligned |
| Specs Labels | 600 | 600 (body-1-strong) | ✅ Aligned |

---

## Issue: Product Name Font-Weight

### Current Design Rationale
The PDP uses `font-weight: 400` for the product name to create a **refined, elegant aesthetic** inspired by high-end e-commerce (Apple, Williams Sonoma, etc.). This creates visual hierarchy through:
- **Size contrast** (2rem vs smaller elements)
- **Whitespace** (3.5rem margin-bottom)
- **Light weight** (elegant, not shouty)

### Standardization Conflict
Our design system defines **all H1 elements** as `font-weight: 700` for:
- **Accessibility** (clear visual hierarchy)
- **Consistency** (all page titles use same weight)
- **Scannability** (bold titles are easier to parse)

### Other Pages Using H1
- **Account Dashboard:** "My Account" (uses standard H1 = 700)
- **Catalog:** "All Products" / Category names (uses standard H1 = 700)
- **Build Configurator:** "Build Configurator" (uses standard H1 = 700)
- **BOM Review:** "Bill of Materials Review" (uses standard H1 = 700)

**Observation:** The PDP product name is the **only H1** across all pages using `font-weight: 400`.

---

## Recommendation

### Option 1: Standardize to Design System (Recommended)
**Change product name to use standard H1 weight:**
```css
.product-name-clean {
  font-size: 2rem;
  font-weight: 700; /* Match --type-display-1-font */
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
```

**Benefits:**
- ✅ Consistent with all other pages
- ✅ Better accessibility (clear hierarchy)
- ✅ Follows design system token
- ✅ Easier to maintain

**Trade-offs:**
- Loses the "refined" aesthetic
- More traditional e-commerce look

---

### Option 2: Document as Intentional Exception
If the lighter weight is a critical brand/UX decision for product pages:

1. **Document the exception** in CSS-ARCHITECTURE.md
2. **Create a design token** for PDP-specific headers:
```css
/* base.css */
--type-product-name-font: normal normal 400 2rem/1.3 var(--type-font-family-display);
```
3. **Use the token** in product-detail.css:
```css
.product-name-clean {
  font: var(--type-product-name-font);
  letter-spacing: -0.02em;
}
```

**Benefits:**
- Preserves the refined aesthetic
- Documents the intentional deviation
- Makes it a reusable pattern

**Trade-offs:**
- Adds complexity to design system
- Breaks H1 consistency

---

## Decision Required

**Which approach aligns with BuildRight's design goals?**

1. **Prioritize consistency** → Use Option 1 (standardize to 700)
2. **Prioritize refined PDP aesthetic** → Use Option 2 (document exception)

I recommend **Option 1** for maximum consistency and maintainability, unless there's a strong brand/UX requirement for the lighter weight.

