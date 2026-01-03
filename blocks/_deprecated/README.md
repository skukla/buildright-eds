# Deprecated Blocks

This directory contains deprecated versions of commerce dropin blocks that have been preserved for:

1. **UX Comparison** - A/B testing between minimal and extensible implementations
2. **Rollback Safety** - Quick restoration if new implementations have issues
3. **Reference** - Understanding the original patterns before extensibility

## Block Mappings

| Deprecated Block | Original Location | Description |
|------------------|-------------------|-------------|
| `cart-dropin-minimal/` | `blocks/cart-dropin/` | Original cart dropin (minimal implementation) |
| `checkout-dropin-minimal/` | `blocks/checkout-dropin/` | Original checkout dropin (minimal implementation) |
| `auth-dropin-v1/` | `blocks/auth-dropin/` | Original auth dropin (v1 implementation) |
| `order-confirmation-dropin-minimal/` | `blocks/order-confirmation-dropin/` | Original order confirmation dropin (minimal implementation) |

## Usage

To reference a deprecated block for comparison:

```javascript
// Load deprecated version for A/B testing
import deprecatedCart from '../../blocks/_deprecated/cart-dropin-minimal/cart-dropin.js';
```

## When to Remove

These deprecated blocks can be removed after:

1. New extensible implementations are production-stable
2. UX testing confirms new implementations are preferred
3. At least one full release cycle with no rollback needs

---

*Created: Phase 5.5 - Commerce Dropin Extensibility Framework*
