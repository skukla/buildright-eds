# ADR-020: User Context Initialization Pattern

## Status
Accepted

## Date
2026-01-07

## Context

BuildRight implements persona-based pricing where different users see different prices based on their customer group (guest, wholesale, production builder, etc.). This pricing is controlled via ACO headers (`AC-Price-Book-Id`, `AC-View-Id`) that are set during authentication.

We discovered a pricing inconsistency where the Product Listing Page (PLP) showed guest pricing ($14.08) while the Product Detail Page (PDP) showed the correct wholesale pricing ($11.97) for the same product when a user was logged in.

### Root Cause

The initialization order differed between pages:

**PLP (incorrect):**
1. Dropins initialize with guest headers
2. Products load with guest pricing
3. Auth completes, persona headers update
4. Products already rendered with wrong prices

**PDP (correct):**
1. Dropins initialize with guest headers
2. Block waits for `authService.initialize()`
3. Auth completes, persona headers update
4. Products load with correct pricing

### The Anti-Pattern

```javascript
// ❌ WRONG: Load data before auth is ready
export default async function decorate(block) {
  await waitForDropins();
  // Auth may not be complete yet - persona headers might be guest defaults
  const products = await fetchProducts(); // Uses guest pricing!
}
```

### The Correct Pattern

```javascript
// ✅ CORRECT: Wait for auth before loading personalized data
export default async function decorate(block) {
  await waitForDropins();
  
  // Wait for auth to complete - ensures correct persona headers
  const { authService } = await import('../../scripts/auth.js');
  await authService.initialize();
  
  const products = await fetchProducts(); // Uses correct user pricing
}
```

## Decision

**All blocks that fetch user-personalized data MUST wait for `authService.initialize()` before making API calls.**

This applies to any block that:
- Displays prices or pricing tiers
- Shows user-specific content (wishlists, saved items)
- Fetches data that varies by customer group
- Uses persona-specific API headers

### Implementation

```javascript
// In block's decorate function:
try {
  // Step 1: Wait for dropins (basic infrastructure)
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();
  
  // Step 2: Wait for auth (user context)
  const { authService } = await import('../../scripts/auth.js');
  await authService.initialize();
  
  // Step 3: Now safe to fetch user-personalized data
  // Persona headers are guaranteed to be set correctly
  const data = await fetchData();
  
} catch (error) {
  // Handle initialization failures
}
```

### When This Pattern Is NOT Required

- Static content blocks (no API calls)
- Navigation/category blocks (use `ACO_BuildRight` source, not persona-specific)
- Blocks that only need guest-level data
- Blocks that explicitly handle auth state changes via event listeners

## Consequences

### Positive

1. **Consistent pricing** - Users see correct prices on all pages
2. **No flash of wrong content** - Avoids showing guest prices then updating
3. **Single fetch** - Data is fetched once with correct context, not twice
4. **Predictable behavior** - Auth state is resolved before any user-specific operations

### Negative

1. **Slightly delayed render** - Must wait for auth before fetching
2. **Requires awareness** - Developers must know when to apply this pattern

### Performance Consideration

The auth initialization is typically fast (< 500ms) and often completes before blocks begin rendering. The slight delay is preferable to:
- Double network requests (fetch, then re-fetch)
- Flash of incorrect pricing
- User confusion from changing prices

## Related

- **ADR-019**: Attribute Visibility Pattern (mesh-side filtering)
- **ADR-010**: Dropin Slot Customization Pattern
- **Mesh Docs**: `buildright-service/docs/architecture/ACO-API-ARCHITECTURE.md` (header requirements)

## Blocks Following This Pattern

| Block | Requires Auth Wait | Reason |
|-------|-------------------|--------|
| `product-list` | ✅ Yes | Displays product prices |
| `product-detail` | ✅ Yes | Displays product prices, volume tiers |
| `commerce-cart` | ✅ Yes | Cart prices are user-specific |
| `commerce-checkout` | ✅ Yes | Checkout requires user context |
| `header` | ❌ No | Categories use non-persona source |
| `footer` | ❌ No | Static content |

## Example: The Fix

```javascript
// buildright-eds/blocks/product-list/product-list.js

export default async function decorate(block) {
  try {
    emitCatalogEvent('catalogLoading');

    const { waitForDropins } = await import('../../scripts/initializers/index.js');
    await waitForDropins();
    log('Dropins ready');

    // =====================================================
    // CRITICAL: Wait for auth before loading products
    // This ensures products load with correct persona pricing
    // Without this, products load with guest pricing first
    // =====================================================
    const { authService } = await import('../../scripts/auth.js');
    await authService.initialize();
    log('Auth initialized, user context available for correct pricing');

    // Now safe to render - persona headers are set
    log('Rendering containers...');
    // ... rest of block
  }
}
```
