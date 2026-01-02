# Adaptive Layout Pattern (Hybrid Approach)

## Overview

BuildRight uses a **Hybrid Adaptive Layout Pattern** that balances **automatic optimization** with **author control**. This pattern was implemented in Phase 5, Task 4 (PDP Refactor) to solve the problem of wasted space for B2C users while preserving flexibility for merchandising teams.

## The Problem We Solved

### Original Issue
- **B2B users** need space for volume pricing tables (60/40 layout works well)
- **B2C users** don't have volume pricing, resulting in wasted space in purchase sidebar
- Large product images are more important for B2C homeowners than contractors

### Solution
A hybrid system that:
1. **Automatically** optimizes layout based on customer type (smart defaults)
2. **Allows** authors to override for special cases (promotional PDPs, A/B tests)
3. **Preserves** single HTML template (no duplication)

---

## How It Works

### Block Variants (Author Control)

Authors can specify layout variants using EDS block variant syntax:

#### Available Variants:

| Variant | Grid Split | Use Case |
|---------|-----------|----------|
| Default | 60/40 | Standard B2B products with volume pricing |
| `compact` | 70/30 | B2C users - narrower sidebar, minimal content |
| `showcase` | 80/20 | Hero products, promotional pages, featured items |
| `full-width` | 75/25 | Alternative balanced layout |

#### Author Syntax:

```html
<!-- In AEM/Franklin authoring: -->
Product Detail Header              <!-- Default (60/40) -->
Product Detail Header (compact)    <!-- Compact (70/30) -->
Product Detail Header (showcase)   <!-- Showcase (80/20) -->
Product Detail Header (full-width) <!-- Full Width (75/25) -->
```

This generates:

```html
<div class="product-detail-header">
<div class="product-detail-header compact">
<div class="product-detail-header showcase">
<div class="product-detail-header full-width">
```

---

### Smart Defaults (Automatic Behavior)

If **no author variant is specified**, the system applies intelligent defaults:

```javascript
// Customer Type Detection
const B2C_GROUPS = ['US-Retail', 'Retail-Registered'];
const isB2C = B2C_GROUPS.includes(customerGroup);

// Smart Default Logic
if (isB2C) {
  // B2C users automatically get compact layout (bigger images)
  headerElement.classList.add('compact');
} else {
  // B2B users get default 60/40 layout (optimized for volume pricing)
  // No class added - uses default CSS
}
```

#### Decision Tree:

```
Page Load:
├─ Does author specify variant? (compact, showcase, full-width)
│  ├─ YES → Use author's choice (always wins)
│  └─ NO → Check customer type
│     ├─ B2C → Apply 'compact' layout automatically
│     │        • 70/30 split (narrower sidebar)
│     │        • Less wasted space
│     │        • Volume pricing hidden
│     └─ B2B → Use default (60/40)
│              • Volume pricing shown
│              • Room for tier tables
```

---

## Implementation Details

### CSS (blocks/product-detail/product-detail.css)

```css
/* Default: 60/40 split (balanced for B2B users with volume pricing) */
.product-detail-header-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: start;
  transition: grid-template-columns 0.3s ease;
}

/* Block Variant: Compact Layout (70/30 split) */
/* Automatically applied to B2C users - narrower sidebar, minimal content */
.product-detail-header.compact .product-detail-header-content {
  grid-template-columns: 2.33fr 1fr;
}

/* Block Variant: Showcase Layout (80/20 split) */
/* For hero products or promotional pages - author controlled */
.product-detail-header.showcase .product-detail-header-content {
  grid-template-columns: 4fr 1fr;
  gap: 2rem;
}

/* Block Variant: Full Width Gallery (75/25 split) */
/* Alternative layout option for authors */
.product-detail-header.full-width .product-detail-header-content {
  grid-template-columns: 3fr 1fr;
}
```

### JavaScript (pages/product-detail.html)

Located in the inline `<script type="module">` after block decoration:

```javascript
// Apply smart layout defaults (Hybrid Approach - Option C)
// Authors can override by adding variant classes: compact, showcase, full-width
// If no author override, system applies optimal layout based on customer type
const headerElement = document.querySelector('.product-detail-header');
if (headerElement) {
  const hasAuthorVariant = headerElement.classList.contains('compact') || 
                           headerElement.classList.contains('showcase') || 
                           headerElement.classList.contains('full-width');
  
  if (!hasAuthorVariant) {
    // Smart default: B2C users get compact layout (bigger product images)
    const customerGroup = userContext?.customerGroup || 'US-Retail';
    const B2C_GROUPS = ['US-Retail', 'Retail-Registered'];
    const isB2C = B2C_GROUPS.includes(customerGroup);
    
    if (isB2C) {
      headerElement.classList.add('compact');
    }
    // B2B users get default 60/40 layout (optimized for volume pricing)
  }
}
```

---

## Usage Examples

## Design Philosophy

### Keep It Professional and Simple

BuildRight is a B2B portal first. The adaptive layout respects this by:

- **No consumer marketing language** - Professional tone throughout
- **No emojis or casual iconography** - Clean, data-focused design
- **Minimal sidebar content for B2C** - Comprehensive specs/details live below in dedicated sections
- **Typography consistency** - Matches existing design system (section titles, tables, borders)

### Why Compact Layout Works:

**For B2C Users (without volume pricing):**
- Larger product images (70% vs 60%)
- Less wasted sidebar space
- Clean, minimal purchase area: Price + Quantity + Add to Cart
- Full product details in Description, Specifications, and Regional Availability sections below

**For B2B Users (with volume pricing):**
- Default 60/40 split provides room for collapsible volume pricing tables
- Dynamic savings badges
- Customer tier indicators
- Professional, operational focus

---

### Example 1: Standard Product (Automatic)

**Authoring:** Create a normal PDP with no variant specified

**Result:**
- B2C users (David, unauthenticated): See 70/30 compact layout
  - Larger product image
  - Minimal sidebar: Price + Quantity + Add to Cart
  - No volume pricing (hidden)
- B2B users (Kevin, Sarah, Mark): See 60/40 default layout
  - Room for volume pricing tables
  - Dynamic savings indicators
  - Customer tier badges

**Author effort:** Zero - system handles it

---

### Example 2: Black Friday Hero Product (Override)

**Authoring:** Specify "Product Detail Header (showcase)"

**Result:**
- ALL users (B2C and B2B): See 80/20 showcase layout
- Huge hero image for promotional impact

**Author effort:** Select variant in dropdown

---

### Example 3: Category-Specific Layout

**Authoring:** 
- Lumber products: No variant (automatic)
- Power tools: "showcase" variant (bigger images important)
- Hardware: "compact" variant (images less critical)

**Result:** Merchandising team can optimize per category

---

## Benefits of This Approach

### ✅ For Developers
- Single HTML template (no duplication)
- CSS-first approach (follows our coding principles)
- Easy to extend with new variants
- No complex conditional rendering

### ✅ For Authors/Merchandisers
- Full control when needed
- Don't have to think about it for standard products
- Can A/B test layouts
- Can optimize per category or promotion

### ✅ For Users
- Optimized experience based on their needs
- B2C users get better product imagery
- B2B users get space for volume pricing
- Consistent within their user type

---

## Extending This Pattern

### Adding a New Variant

**Step 1:** Add CSS for the new variant

```css
/* Block Variant: Hero Layout (full width image, sidebar below) */
.product-detail-header.hero .product-detail-header-content {
  grid-template-columns: 1fr;
  gap: 2rem;
}

.product-detail-header.hero .product-detail-purchase-section {
  max-width: 600px;
  margin: 0 auto;
}
```

**Step 2:** Document it in this file (Available Variants table)

**Step 3:** Authors can now use it: "Product Detail Header (hero)"

No JavaScript changes needed!

---

### Adding New Customer Types

If you add a new customer group that should get a specific layout:

**Option A:** Add to smart defaults (JavaScript)

```javascript
const B2C_GROUPS = ['US-Retail', 'Retail-Registered', 'DIY-Member'];
const WHOLESALE_GROUPS = ['Wholesale-Reseller', 'Wholesale-Premium'];

if (B2C_GROUPS.includes(customerGroup)) {
  headerElement.classList.add('compact');
} else if (WHOLESALE_GROUPS.includes(customerGroup)) {
  headerElement.classList.add('full-width');
}
```

**Option B:** Let authors specify per customer segment in authoring

---

## Future Phases

### Potential Enhancements

1. **Responsive Variants**
   - Add mobile-specific variants
   - Example: `compact-mobile`, `showcase-mobile`

2. **Category-Based Defaults**
   - Automatic variant selection based on product category
   - Example: Power tools always use `showcase`, fasteners use `compact`

3. **A/B Testing Integration**
   - Metadata-driven variant selection for experiments
   - Track conversion rates per layout variant

4. **Metadata Override**
   - Allow page metadata to control layout
   - `<meta name="layout" content="compact">`
   - Useful for programmatic page generation

5. **Analytics Integration**
   - Track which variants perform best
   - Inform future defaults

---

## Related Documentation

- **Coding Principles:** `docs/CODING-PRINCIPLES.md` (CSS-first approach)
- **Phase 5 Task 4:** Product Detail Page Refactor
- **Volume Pricing UX:** Dynamic tier indicator (implemented alongside this pattern)

---

## Decision History

**Date:** Phase 5, Task 4 (PDP Refactor)  
**Decision:** Option C (Hybrid Approach)  
**Alternatives Considered:**
- Option A: Block variants only (no automatic behavior)
- Option B: Fully automatic (no author control)

**Rationale for Option C:**
- Provides best of both worlds
- Merchandising team may need control for promotions
- System can still optimize for 95% of standard products
- Single template reduces maintenance burden
- Easy to evolve rules over time without breaking content

---

## Summary

The **Hybrid Adaptive Layout Pattern** is BuildRight's approach to balancing **user experience optimization** with **content author flexibility**. It demonstrates EDS best practices:

- ✅ CSS-first layout variants
- ✅ JavaScript for intelligent defaults
- ✅ Author control via block variants
- ✅ Single source of truth (no template duplication)
- ✅ Extensible and maintainable

This pattern can be applied to other components beyond PDPs (catalog grids, hero sections, etc.).

