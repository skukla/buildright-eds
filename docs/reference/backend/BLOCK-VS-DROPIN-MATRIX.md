# Block vs. Dropin Decision Matrix

**Research Date**: November 15, 2024  
**Purpose**: Framework for deciding when to use EDS blocks vs. Adobe Commerce Dropins

This document provides a clear decision framework for BuildRight's architecture, ensuring we use the right tool for each component.

---

## Quick Decision Tree

```
Does this component need real-time Commerce data?
│
├─ YES → Does a dropin exist for this?
│         │
│         ├─ YES → Use Dropin (mock in demo, real in prod)
│         │
│         └─ NO → Use EDS Block + ACO Mock Service
│
└─ NO → Is this content-driven or persona UI?
          │
          └─ YES → Use EDS Block
```

---

## Decision Matrix

| Criteria | Use EDS Block | Use Dropin | Use Both |
|----------|---------------|------------|----------|
| **Data Source** | Content (Google Docs, static JSON) | Adobe Commerce API | Mixed |
| **Commerce Connection** | None or custom | Built-in | Custom + built-in |
| **Author Control** | High - authors manage content | Low - data from Commerce | Medium |
| **Reusability** | Project-specific | Cross-project standard | Mixed |
| **Maintenance** | We maintain | Adobe maintains | Shared |
| **Complexity** | Simple to complex | Complex (handled by Adobe) | Complex |
| **Customization** | Full control | Via slots & styling | Full + slots |
| **Performance** | Depends on implementation | Optimized by Adobe | Mixed |
| **Backend Integration** | Manual | Automatic | Mixed |

---

## When to Use EDS Blocks

### ✅ Use EDS Blocks For:

**1. Content-Driven Components**
- Hero banners
- Feature sections
- Testimonials
- Blog posts
- Marketing content
- Static informational sections

**Why**: Authors manage content directly in Google Docs/SharePoint.

---

**2. Persona-Specific UI**
- Dashboard layouts unique to personas
- Wizard interfaces (Sarah's template selector)
- Custom workflows (Marcus's project builder)
- Specialized tools (Lisa's package configurator)
- Navigation unique to persona journeys

**Why**: These are custom UX flows not provided by standard dropins.

**Examples from BuildRight**:
```
✅ wizard-progress (Sarah's multi-step flow)
✅ template-card (Sarah's template selection)
✅ project-filter (Marcus's project type selector)
✅ wizard-sidebar (David's deck wizard navigation)
✅ tier-badge (Visual persona tier indicator)
```

---

**3. Data Visualization & Dashboards**
- Order history charts
- Spending analytics
- Project timelines
- Inventory status displays
- Custom reports

**Why**: Require custom data aggregation and visualization not provided by dropins.

**Examples from BuildRight**:
```
✅ inventory-status (shows stock with ACO data)
✅ project-bundle (displays package contents)
```

---

**4. Custom Interactive Components**
- Calculators (pricing, measurements)
- Configurators (product options beyond standard)
- Comparison tools
- Interactive guides
- Multi-step wizards

**Why**: Unique business logic and interaction patterns.

---

**5. Layout & Navigation**
- Headers
- Footers
- Sidebars
- Breadcrumbs
- Custom menus

**Why**: Site-specific structure and branding.

**Examples from BuildRight**:
```
✅ header (with persona-aware navigation)
✅ footer (standard site footer)
✅ user-menu (custom dropdown with persona context)
```

---

## When to Use Dropins

### ✅ Use Dropins For:

**1. Authentication & User Management**
- Login forms
- Registration forms
- Password reset
- User profile management
- Address management

**Why**: Security-critical, requires Commerce backend integration, Adobe maintains updates.

**Dropin**: `@dropins/storefront-auth`, `@dropins/storefront-account`

**BuildRight Strategy**:
```javascript
// Demo mode: Mock auth service
import { getCustomer } from '../../scripts/mock-dropins/auth.js';

// Production: Real dropin
import { getCustomer } from '@dropins/storefront-auth';
```

---

**2. Cart Management**
- Cart display
- Add to cart
- Update quantities
- Remove items
- Cart totals
- Shipping estimates

**Why**: Complex state management, pricing calculations, Commerce integration.

**Dropin**: `@dropins/storefront-cart`

**BuildRight Strategy**:
```javascript
// Demo: Mock cart with localStorage
// Production: Real cart dropin with Commerce backend
```

---

**3. Checkout**
- Checkout forms
- Payment methods
- Shipping methods
- Order placement
- Order confirmation

**Why**: PCI compliance, payment integration, order processing.

**Dropin**: `@dropins/storefront-checkout`

**BuildRight Strategy**:
```
Demo: Simplified mock checkout (capture intent)
Production: Full dropin checkout with payment processing
```

---

**4. Product Display Pages (PDP)**
- Product details
- Image galleries
- Product options (size, color)
- Add to cart button
- Product pricing

**Why**: Standard commerce patterns, variant management, pricing rules.

**Dropin**: `@dropins/storefront-pdp`

**BuildRight Strategy**:
```
Demo: Enhanced EDS block with mock product data
Production: PDP dropin with real Commerce API
```

---

**5. Search & Product Discovery**
- Search bar
- Search results
- Faceted filters
- Sort options
- Pagination

**Why**: Search indexing, relevance, performance optimization.

**Dropin**: `@dropins/storefront-product-discovery`

**BuildRight Strategy**:
```
Demo: Client-side filtering of mock products
Production: Real search dropin with Elasticsearch/Live Search
```

---

**6. Order Management**
- Order history
- Order details
- Order tracking
- Returns & cancellations

**Why**: Requires real-time order data from Commerce.

**Dropin**: `@dropins/storefront-order`

---

**7. Wishlist**
- Add to wishlist
- Wishlist display
- Remove from wishlist
- Move to cart
- Share wishlist

**Why**: Standard commerce pattern, requires user data persistence.

**Dropin**: `@dropins/storefront-wishlist`

**BuildRight Strategy**:
```
Demo: Mock wishlist with localStorage
Production: Real wishlist dropin with Commerce backend
```

---

**8. Product Recommendations**
- Recommended products
- Related products
- Cross-sells, up-sells
- "Customers also bought"
- Personalized recommendations

**Why**: AI/ML-powered recommendations, requires Commerce data and Adobe Sensei integration.

**Dropin**: `@dropins/storefront-recommendations`

**BuildRight Strategy**:
```
Demo: Simple mock recommendations (hardcoded related products)
Production: Real recommendations dropin with Adobe Sensei
```

---

**9. Payment Services**
- Payment method selection
- Credit card forms
- Apple Pay, Google Pay
- Payment validation
- PCI compliance

**Why**: Security-critical, PCI DSS compliance, payment gateway integration.

**Dropin**: `@dropins/storefront-payment-services`

**BuildRight Decision**: ❌ **We will NOT use this dropin**

**Reason**: This dropin integrates with **Adobe Payment Services**, which we don't want to use. 

**Our Strategy Instead**:
```
Demo Mode: Mock payment forms (capture intent only, no processing)
Production: Integrate with your preferred payment gateway directly
  - Stripe, Square, Authorize.net, etc.
  - Build custom payment integration as needed
  - Or use payment gateway's own SDK/components
```

**Note**: The checkout dropin can work without Adobe Payment Services - you can integrate your own payment methods.

---

**10. Personalization**
- Personalized content blocks
- A/B testing
- Targeted promotions
- Adobe Target integration

**Why**: Integrates with Adobe Target for experimentation and personalization.

**Dropin**: `@dropins/storefront-personalization`

**BuildRight Strategy**:
```
Demo: Not needed (we have persona-driven content via EDS blocks)
Production: Optional - could enhance with Adobe Target
```

**Note**: Our persona system is different from Adobe Target personalization. We may not need this dropin.

---

## When to Use Both (Hybrid Approach)

### 🔀 Use Both For:

**1. Enhanced Product Listings**

**Scenario**: Standard product grid + custom persona-aware filters

**Approach**:
```javascript
// EDS Block: Custom filter sidebar (persona-specific)
// blocks/filters-sidebar/filters-sidebar.js
export default function decorate(block) {
  // Custom persona filter UI
  renderPersonaFilters(block);
}

// Dropin: Product grid (standard commerce)
// Or mock in demo mode
import { getProducts } from '@dropins/storefront-product-discovery';
```

**BuildRight Example**:
```
✅ filters-sidebar (EDS block - persona-specific)
+ product-grid (mock now, dropin later - standard commerce)
```

---

**2. Enhanced Cart**

**Scenario**: Standard cart + custom order summary enhancements

**Approach**:
```javascript
// Dropin: Core cart functionality
import { getCart, addToCart } from '@dropins/storefront-cart';

// EDS Block: Custom order summary with project context
// blocks/cart-summary/cart-summary.js
export default function decorate(block) {
  // Listen for cart updates
  window.addEventListener('cart:updated', (e) => {
    renderProjectContext(e.detail.cart);
  });
}
```

**BuildRight Example**:
```
✅ cart (dropin - standard cart)
+ cart-summary (EDS block - custom project summary)
```

---

**3. Persona-Aware Account Pages**

**Scenario**: Standard account management + persona dashboard

**Approach**:
```javascript
// Dropin: User account data
import { getCustomer, getOrders } from '@dropins/storefront-account';

// EDS Block: Persona dashboard layout
// blocks/persona-dashboard/persona-dashboard.js
export default async function decorate(block) {
  const customer = await getCustomer();
  const persona = getPersonaForUser(customer);
  
  // Render persona-specific dashboard
  renderDashboard(block, persona);
}
```

---

## BuildRight Component Decisions

### Core Commerce (Use Dropins - Mocked in Demo)

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Login/Registration** | Dropin (mocked) | Security-critical, standard pattern |
| **User Account** | Dropin (mocked) | Address management, profile updates |
| **Cart** | Dropin (mocked) | Complex state, pricing calculations |
| **Checkout** | Dropin (mocked) | Order placement, shipping methods |
| **Product Search** | Dropin (mocked) | Search performance, relevance |
| **Order Management** | Dropin (mocked) | Real-time order data, tracking |
| **Wishlist** | Dropin (mocked) | Standard commerce, user persistence |
| **Recommendations** | Dropin (mocked) | AI-powered, Adobe Sensei integration |
| **Payment Services** | ❌ **NOT using** | We don't want Adobe Payment Services |
| **Personalization** | ❌ **NOT using** | We use custom persona system instead |

---

### Persona UI (Use EDS Blocks)

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Template Dashboard** (Sarah) | EDS Block | Custom UI, content-driven templates |
| **Wizard Progress** | EDS Block | Custom multi-step visualization |
| **Project Filter** (Marcus) | EDS Block | Persona-specific filter logic |
| **Package Configurator** (Lisa) | EDS Block | Custom bundling logic |
| **Deck Wizard** (David) | EDS Block | Specialized measurement workflow |
| **Restock Dashboard** (Kevin) | EDS Block | Custom analytics visualization |
| **Tier Badge** | EDS Block | Visual persona indicator |

---

### Hybrid Components (Use Both)

| Component | EDS Block Part | Dropin Part (Mocked) |
|-----------|----------------|----------------------|
| **Product Grid** | Custom filters sidebar | Product listing |
| **Product Detail** | Custom layout, project context | Standard PDP data |
| **Cart Summary** | Project summary display | Cart state management |
| **Account Page** | Persona dashboard layout | Account data access |

---

## Implementation Strategy

### Demo Mode (Phases 0-7)

**For Dropin-designated components**:
1. Create mock service with dropin API signature
2. Use dropin event patterns
3. Store state in localStorage (simulating backend)
4. Document which dropin this will become

**Example**:
```javascript
// File: scripts/mock-dropins/cart.js
// PRODUCTION DROPIN: @dropins/storefront-cart

export async function getCart() {
  // Mock implementation
  return JSON.parse(localStorage.getItem('cart') || '{}');
}

export async function addToCart(sku, quantity) {
  // Mock implementation
  const cart = await getCart();
  // ... add logic
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { cart }
  }));
  return cart;
}
```

---

### Production Mode (Post-Launch)

**Swap mocks for real dropins**:

**Before** (demo):
```javascript
import { getCart } from '../../scripts/mock-dropins/cart.js';
```

**After** (production):
```javascript
import { getCart } from '@dropins/storefront-cart';
```

**Everything else stays the same** - API signatures match!

---

## Decision Checklist

Before building a new component, ask:

### 1. Data Source
- [ ] Does this need real-time Commerce data? → **Consider Dropin**
- [ ] Is this content from authors? → **EDS Block**
- [ ] Is this static/mock data? → **EDS Block**

### 2. Existing Solutions
- [ ] Does a dropin exist for this? → **Use Dropin (mocked)**
- [ ] Is this a standard commerce pattern? → **Consider Dropin**
- [ ] Is this unique to BuildRight? → **EDS Block**

### 3. Customization Needs
- [ ] Need full control over markup? → **EDS Block**
- [ ] Standard commerce UI is fine? → **Dropin**
- [ ] Need both standard + custom? → **Hybrid**

### 4. Maintenance
- [ ] Want Adobe to maintain updates? → **Dropin**
- [ ] Need to customize frequently? → **EDS Block**
- [ ] Security-critical? → **Dropin**

### 5. Performance
- [ ] Need optimized commerce operations? → **Dropin**
- [ ] Simple content display? → **EDS Block**
- [ ] Complex client-side logic? → **Either (depends)**

---

## Anti-Patterns (Don't Do This)

### ❌ Don't: Reimplement Commerce Logic in EDS Blocks

**Bad**:
```javascript
// blocks/custom-cart/custom-cart.js
export default function decorate(block) {
  // Reimplementing cart logic that dropins already handle
  calculateTax();
  applyDiscounts();
  validateInventory();
  // ... 500 lines of cart logic
}
```

**Why**: Dropins handle this better, Adobe maintains it, avoid bugs.

**Do Instead**: Use cart dropin (mocked in demo).

---

### ❌ Don't: Use Dropins for Non-Commerce UI

**Bad**:
```javascript
// Trying to force a dropin for custom wizard UI
import SomeDropin from '@dropins/something';
// ... hacking it to work for custom flow
```

**Why**: Dropins are for commerce patterns, not custom workflows.

**Do Instead**: Build custom EDS block.

---

### ❌ Don't: Mix Approaches Inconsistently

**Bad**:
```javascript
// Sometimes using dropin pattern
import { getCart } from '@dropins/storefront-cart';

// Sometimes using custom service
import { getCart } from '../../services/my-cart-service.js';

// Which one is it?!
```

**Why**: Confusing, hard to maintain, difficult to swap later.

**Do Instead**: Pick one approach per domain (auth, cart, etc.).

---

## Migration Path

### Phase 0-5: Build with Clarity

Every component decision documented:
```javascript
/**
 * Product Grid Block
 * 
 * DEMO MODE: Uses mock product service
 * PRODUCTION: Will use @dropins/storefront-product-discovery
 * 
 * Decision: Hybrid approach
 * - Filter sidebar: EDS block (persona-specific)
 * - Product grid: Dropin (standard commerce)
 */
```

---

### Phase 6-7: Validate Swap Strategy

Test mock → dropin swap on one component:
1. Pick simple component (e.g., user menu)
2. Ensure mock API matches dropin exactly
3. Swap import, verify it works
4. Document any issues

---

### Post-Launch: Production Integration

1. Install dropin NPM packages
2. Configure Commerce backend
3. Update imports (search/replace)
4. Test thoroughly
5. Deploy

**Expected changes**: ~2 lines per file (just import statements)

---

## Summary Table

| Use Case | Tool | Reason | BuildRight Examples |
|----------|------|--------|---------------------|
| **Content display** | EDS Block | Author-managed content | Hero, features, footer |
| **Persona dashboards** | EDS Block | Custom UX flows | Template selector, wizard |
| **Custom tools** | EDS Block | Unique business logic | Calculators, configurators |
| **Authentication** | Dropin (mocked) | Security, maintenance | Login, registration |
| **Cart/Checkout** | Dropin (mocked) | Complex commerce | Cart, checkout (no Adobe payments) |
| **Payment processing** | Custom Integration | We don't use Adobe Payment Services | Stripe/Square/etc. |
| **Product display** | Dropin (mocked) | Standard commerce | PDP, search, listings |
| **Account management** | Dropin (mocked) | User data access | Profile, addresses, orders |
| **Wishlist** | Dropin (mocked) | Standard commerce pattern | Wishlist |
| **Recommendations** | Dropin (mocked) | AI-powered suggestions | Related products |
| **Personalization** | ❌ NOT using | We use custom persona system | N/A |
| **Enhanced commerce** | Both | Standard + custom | Product grid + custom filters |

---

## All Available Adobe Commerce Dropins

For reference, here are **all native dropins** provided by Adobe Commerce:

| Dropin Package | Purpose | BuildRight Usage |
|----------------|---------|------------------|
| `@dropins/storefront-auth` | Authentication (login, register, password reset) | ✅ Yes (mocked) |
| `@dropins/storefront-account` | User account management (profile, addresses) | ✅ Yes (mocked) |
| `@dropins/storefront-cart` | Shopping cart management | ✅ Yes (mocked) |
| `@dropins/storefront-checkout` | Checkout process | ✅ Yes (mocked, without Adobe payments) |
| `@dropins/storefront-order` | Order management (history, details, tracking) | ✅ Yes (mocked) |
| `@dropins/storefront-pdp` | Product detail page | ✅ Yes (mocked) |
| `@dropins/storefront-product-discovery` | Product search, filters, facets | ✅ Yes (mocked) |
| `@dropins/storefront-wishlist` | Wishlist functionality | ✅ Yes (mocked) |
| `@dropins/storefront-recommendations` | AI-powered product recommendations | ✅ Yes (mocked) |
| `@dropins/storefront-payment-services` | Adobe Payment Services integration | ❌ **No - we don't use Adobe payments** |
| `@dropins/storefront-personalization` | Adobe Target integration for A/B testing | ❌ No (we use persona system) |

**Payment Strategy**: We'll integrate with a non-Adobe payment gateway (Stripe, Square, etc.) directly, either as:
- Demo: Mock payment forms (capture intent only)
- Production: Custom integration with your chosen payment provider

**Note**: All "Yes" dropins will be mocked in demo mode and can be swapped for real implementations in production.

---

## Related Documents

- `DROPIN-ARCHITECTURE.md` - What dropins are and how they work
- `DROPIN-INTEGRATION-GUIDE.md` - How to integrate dropins
- `EDS-BLOCK-PATTERNS.md` - How to build EDS blocks
- `MOCK-ACO-API-SPEC.md` - Mock service specifications (Step 4)

---

## Next Steps (Phase 0)

After completing this decision matrix:

1. **Step 4**: Design mock ACO service architecture
2. **Step 5**: Plan authentication strategy (persona selection + future dropin)
3. **Step 6**: Document decisions in ADRs

---

**Last Updated**: November 15, 2024  
**Status**: Decision framework complete, ready for component architecture decisions

