# Savings Badge Design Variants

## Overview
The savings badge has been redesigned to be a prominent top-right corner overlay on product cards, replacing the previous inline pricing element.

## Default: Subtle Rounding (Implemented)

**Visual**: Rectangular badge with 4px border radius  
**Position**: Top-right corner, 8px from edges (6px for featured products)  
**Style**:
- Background: Solid green (`var(--color-positive-600)`)
- Text: White, bold (700 weight)
- Font size: 0.75rem (0.6875rem for featured)
- Padding: 0.25rem 0.5rem
- Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`

**Use case**: Modern "sticker" feel, clean and professional

```css
/* Applied by default */
.savings-pill {
  border-radius: 4px;
}
```

---

## Variant: Full Pill Shape

**Visual**: Fully rounded pill shape  
**Position**: Same as default  
**Style**: Same as default, but with full pill rounding

**Use case**: Softer, more playful aesthetic

```css
/* Add this class to enable pill shape */
.savings-pill.pill-shape {
  border-radius: 999px;
  padding: 0.25rem 0.625rem; /* Slightly more horizontal padding */
}
```

---

## How to Switch Variants

### JavaScript (in product card rendering):
```javascript
// Default (subtle rounding):
savings.className = 'product-card-savings savings-pill';

// Pill shape variant:
savings.className = 'product-card-savings savings-pill pill-shape';
```

### To make pill shape the global default:
Change `border-radius` in `styles/components.css`:
```css
.savings-pill {
  border-radius: 999px; /* Change from 4px to 999px */
}
```

---

## Before vs After Comparison

### Before:
- Position: Below price, in pricing grid
- Style: Green border + green text, transparent background
- Visual weight: Low (blends with pricing)
- Scannability: Medium (requires reading pricing area)

### After:
- Position: Top-right corner overlay
- Style: Solid green background + white text
- Visual weight: High (draws immediate attention)
- Scannability: Excellent (visible at a glance)

---

## Design Rationale

1. **Immediate visibility**: Savings badges are now the first thing users see
2. **Familiar pattern**: Top-right badge is an established e-commerce convention
3. **Cleaner pricing area**: Removes clutter from the already-dense pricing section
4. **High contrast**: White-on-green is more eye-catching than outlined text
5. **Promotional hierarchy**: Positions savings as special/urgent information

---

## When Badges Appear: Promotions Only

**Important Design Decision**: Savings badges only appear for **promotional discounts** that beat the customer's contract price, not for contract pricing itself.

### Why This Matters:

**Contract Pricing = Customer's Normal**
- Sarah (contractor with 20% discount) doesn't see "Save 20%" on every product
- Kevin (store manager with 10% discount) doesn't see "Save 10%" on every product
- Their negotiated discount is their baseline, not a "savings"

**Promotional Pricing = Special Deal**
- Badge appears when a flash sale, clearance, or promotion beats their contract price
- Example: Sarah's contract price is $80, promotion brings it to $70 → Badge shows "Save $10" or "Save 13%"
- Clear signal: "This is better than your normal price - act now!"

### Benefits:
1. **Reduces badge fatigue** - Clean cards become the norm, badges stand out
2. **Creates urgency** - Badge = limited-time opportunity
3. **Matches mental model** - Contract = expected, Promotion = unexpected win
4. **Improves scannability** - Easy to spot actual deals when browsing

### Current State:
- **No promotions engine yet** → Badges don't appear (savings = 0)
- **When promotions are added** → Logic compares promotional price to contract price
- **See**: `scripts/aco-service.js` lines 368-390 for implementation details

