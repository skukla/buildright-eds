# Commerce Dropins (Phase 5.5)

**Status:** In Progress (~70%)

---

## What It Is

Adobe Commerce dropin integration for:
- Authentication (login/logout)
- Cart management
- Checkout flow
- Order history

---

## Current State

| Dropin | Status | Pattern |
|--------|--------|---------|
| Auth | Done | API-only |
| Cart (MiniCart) | Done | API-only |
| Checkout | Pending | Full dropin |
| Orders | Pending | Full dropin |
| Account | Pending | Full dropin |

---

## Pattern Decision

Two integration patterns used:

**API-Only (Auth, Cart):**
- Custom HTML/CSS with BuildRight design
- Use dropin APIs for business logic
- Full control over presentation

**Full Dropin (Checkout, Orders):**
- Use dropin's default UI with slot overrides
- Less customization, faster implementation
- Appropriate for complex flows

---

## Remaining Tasks

- [ ] Implement Checkout dropin with slots
- [ ] Implement Orders dropin (order history page)
- [ ] Implement Account dropin (My Account)
- [ ] Test complete purchase flow
- [ ] Handle edge cases (empty cart, auth errors)

---

## Key Files

```
blocks/commerce-mini-cart/commerce-mini-cart.js
blocks/commerce-login/commerce-login.js
scripts/initializers/index.js - Dropin init hub
scripts/initializers/auth.js
scripts/initializers/cart.js
```

---

## Reference

- `docs/PHASE-5.5-PROGRESS-SUMMARY.md`
- `docs/implementation/sarah-martinez/dropins/`
- `docs/adr/ADR-001-use-dropins-for-commerce.md`

---

**Blocks:** None (current priority)
**Enables:** Phase 6A (Sarah E2E)
