# BuildRight EDS Blocks - AI Assistant Context

## Block Inventory (30 Blocks)

### Commerce Dropins (Phase 5.5 - Complete)

| Block | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `auth` | Commerce authentication (SignIn, SignUp, ResetPassword, UpdatePassword) | 458 | **Production** |
| `cart` | Shopping cart with BuildRight slots | - | **Production** |
| `checkout` | Checkout flow with BuildRight slots | - | **Production** |
| `commerce-mini-cart` | Mini-cart in header | - | **Production** |
| `order-confirmation` | Order confirmation with BuildRight slots | 277 | **Production** |

**Mesh Adapters:** Each commerce dropin has a corresponding mesh adapter resolver:
- `dropin-auth.js` - Intercepts auth queries
- `dropin-cart.js` - Intercepts cart mutations/queries
- `dropin-checkout.js` - Intercepts checkout flow
- `dropin-order.js` - Intercepts order queries

**Integration Pattern:**
```javascript
import { initializers } from '@dropins/tools/initializer.js';
import * as auth from '@dropins/storefront-auth/api.js';

export default async function decorate(block) {
  // Wait for dropins to be ready
  await waitForDropins();

  // Render dropin container with BuildRight slots
  const container = auth.render.SignIn(block, {
    slots: {
      // BuildRight customizations
    },
    onSuccess: (user) => {
      // Bridge to persona system
      initializeMeshForEmail(user.email);
    }
  });
}
```

---

### Product & Catalog Blocks (Working)

| Block | Purpose | Lines | Notes |
|-------|---------|-------|-------|
| `product-list` | **Canonical PLP** - Adobe Product Discovery dropin | 1401 | Refactored per ADR-008 |
| `product-detail` | PDP layout wrapper | - | CSS only |
| `product-gallery` | Product images carousel | - | Working |
| `product-tile` | Reusable product card | - | Working |
| `featured-products` | Featured products section | - | Working |

**product-list CSS Architecture (ADR-008):**
- Main file imports 5 component CSS files: `grid.css`, `product-card.css`, `facets.css`, `pagination.css`, `loading-states.css`
- Design tokens in `styles/dropin-tokens.css` (49 tokens)
- Only 26 `!important` declarations (reduced from 299)
- Events emitted: `catalogLoading`, `catalogLoaded`, `catalogError`, `facetsValidating`

---

### Commerce Features

| Block | Purpose | Status |
|-------|---------|--------|
| `pricing-display` | Tier-based pricing with volume breakpoints | Working |
| `inventory-status` | Multi-warehouse availability | Working |
| `tier-badge` | Customer tier indicator | Working |
| `cart-summary` | Cart totals and breakdown | Working |
| `cart-page` | Cart page layout | Working |

---

### BuildRight-Specific

| Block | Purpose | Status |
|-------|---------|--------|
| `project-builder` | Multi-step wizard (5 steps) | Working |
| `project-bundle` | Dynamic bundle display | Working |
| `project-filter` | Project type selector | Working |

---

### Foundation & Navigation

| Block | Purpose |
|-------|---------|
| `header` | Site navigation & user menu |
| `footer` | Site footer |
| `breadcrumbs` | Navigation breadcrumbs |
| `fragment` | Content fragment loader |
| `login-form` | Login form with dual-mode auth: Email Login (Commerce Auth Dropin) and Quick Login (persona auth via I/O Runtime action) |

---

### Wizard Components

| Block | Purpose |
|-------|---------|
| `wizard-progress` | Linear progress indicator |
| `wizard-vertical-progress` | Vertical stepper |
| `wizard-sidebar` | Wizard sidebar navigation |
| `state-message` | Status/error messages |

---

## Block Development Pattern

### Standard EDS Block Structure

```javascript
// blocks/example-block/example-block.js
export default function decorate(block) {
  // block is the outer div with class "example-block"
  // Content comes from the nested divs

  const rows = [...block.children];
  rows.forEach((row) => {
    const cols = [...row.children];
    // Process content
  });

  // Replace content
  block.textContent = '';
  block.appendChild(newContent);
}
```

### Async Block (for API calls)

```javascript
export default async function decorate(block) {
  // Show loading state
  block.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await fetchFromMesh(query);
    renderContent(block, data);
  } catch (error) {
    block.innerHTML = '<div class="error">Failed to load</div>';
  }
}
```

---

## Dropin Integration Pattern

> **See `docs/reference/dropin-architecture.md`** for the canonical reference on dropins, containers, slots, and the mesh adapter pattern.

### Quick Reference: Slot Customization

```javascript
// blocks/product-list/product-list.js
const slotsConfig = {
  // Replace entire component
  ProductCardImage: (ctx) => {
    const el = document.createElement('div');
    el.className = 'buildright-product-image';
    el.style.backgroundImage = `url(${ctx.product.image.url})`;
    ctx.replaceWith(el);
  },

  // Hide default content
  Description: () => null,
};
```

### Key Rules for Slots:
1. Use `ctx.replaceWith(element)` - don't just return
2. Use `.buildright-*` CSS class prefix
3. Access product data via `ctx.product` or `ctx.data`

---

## CSS Patterns

### Block CSS File

```css
/* blocks/example-block/example-block.css */

/* Block container */
.example-block {
  padding: var(--spacing-medium);
}

/* Elements use BEM-like naming */
.example-block__title {
  font: var(--type-headline-1-font);
  color: var(--color-brand-700);
}

.example-block__content {
  display: grid;
  gap: var(--spacing-small);
}

/* Modifiers */
.example-block--featured {
  background: var(--color-surface-100);
}
```

### Design Tokens (from styles/base.css)

```css
/* Colors */
--color-brand-500: #0f5ba7;      /* Sapphire Blue */
--color-secondary-500: #475569;  /* Slate Gray */
--color-accent-500: #f97316;     /* Tangerine Orange */

/* Spacing */
--spacing-small: 0.5rem;
--spacing-medium: 1rem;
--spacing-large: 1.5rem;

/* Typography */
--type-headline-1-font: 700 2rem/1.2 var(--font-family-primary);
--type-body-1-default-font: 400 1rem/1.5 var(--font-family-primary);
```

---

## Common Patterns

### Fetching Product Data

```javascript
import { catalogService } from '../../scripts/services/catalog-service.js';

export default async function decorate(block) {
  const categoryId = block.dataset.category;
  const products = await catalogService.getProductsByCategory(categoryId);
  // Render products...
}
```

### Using Persona Context

```javascript
import { getPersonaHeaders } from '../../scripts/services/mesh-integration.js';

async function fetchWithPersona(query) {
  const headers = getPersonaHeaders();
  return fetch(MESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query }),
  });
}
```

### Waiting for Dropins

```javascript
function waitForDropins() {
  return new Promise((resolve) => {
    if (window.dropinsReady) {
      resolve();
    } else {
      document.addEventListener('dropins:initialized', resolve, { once: true });
    }
  });
}
```

---

## Block Checklist

When creating or modifying blocks:

- [ ] Follow EDS block structure (div > div > content)
- [ ] Use design tokens for colors, spacing, typography
- [ ] Use `.buildright-*` prefix for custom classes
- [ ] Handle loading and error states
- [ ] Use async/await for API calls
- [ ] Include persona headers for ACO queries
- [ ] Test with different personas
- [ ] Check mobile responsiveness
