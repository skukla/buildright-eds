# Product Data & Images

**Status:** Working with improvements planned

---

## What It Is

Product data management including:
- Product taxonomy and categories
- Image handling and conventions
- Product variants and configuration

---

## Current State

| Component | Status |
|-----------|--------|
| Product data in ACO | Working |
| Image CDN paths | Working |
| Category taxonomy | Working |
| Variant handling | Partial |

---

## Image Convention

```
Pattern: {product-sku}-{variant?}-{angle?}.{ext}

Examples:
- 2x4-8-premium.jpg
- deck-composite-16x20-hero.jpg
- tool-circular-saw-side.jpg
```

---

## Remaining Tasks

- [ ] Complete variant configuration UI
- [ ] Add image zoom on PDP
- [ ] Implement image gallery for products with multiple angles

---

## Key Files

```
docs/implementation/PRODUCT-IMAGES-CONVENTION.md
docs/implementation/PRODUCT-IMAGES-STANDARDIZED-FLOW.md
```

---

## Detailed Specs

Source: `docs/implementation/sarah-martinez/features/`
- `PRODUCT-CATALOG-AUDIT.md`
- `PRODUCT-CATEGORY-TAXONOMY-MAPPING.md`
- `PRODUCT-DATA-ENHANCEMENT-PLAN.md`
- `PRODUCT-IMAGES-STRATEGY.md`
- `VARIANTS-CORRECTED.md`
