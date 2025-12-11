# BuildRight Codebase Audit: Commerce Dropins Integration

**Date:** December 2024  
**Goal:** Replace ALL mock implementations with Commerce Dropins as primary citizens

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Auth Dropin vs Persona Service: The Key Question](#auth-dropin-vs-persona-service)
3. [Complete List of Available Commerce Dropins](#available-dropins)
4. [Custom Dropins with the SDK](#custom-dropins-sdk)
5. [Current Mock Implementations to Replace](#current-mocks)
6. [Services Architecture Analysis](#services-architecture)
7. [Integration Strategy](#integration-strategy)
8. [File-by-File Audit](#file-audit)
9. [Migration Roadmap](#migration-roadmap)

---

## Executive Summary {#executive-summary}

BuildRight currently uses a **hybrid architecture**. The migration strategy uses **two types of dropins**:

1. **Commerce Dropins** — For data that lives in Commerce (auth, cart, checkout, orders)
2. **Custom SDK Dropins** — For data that comes from ACO (products, pricing, BOM)

| Capability | Current Implementation | Target |
|------------|----------------------|--------|
| **Authentication** | Demo persona selection via `localStorage` | `@dropins/storefront-auth` |
| **Cart** | Mock cart via `localStorage` | `@dropins/storefront-cart` |
| **Checkout** | None (cart page only) | `@dropins/storefront-checkout` |
| **User Account** | Demo dashboard | `@dropins/storefront-account` |
| **Order History** | None | `@dropins/storefront-order` |
| **Wishlists** | None | `@dropins/storefront-wishlist` |
| **Product Catalog** | Plain EDS blocks | `@buildright/product-discovery` (custom SDK dropin) |
| **Product Details** | Custom pages | `@buildright/product-detail` (custom SDK dropin) |
| **Project Builder** | Plain EDS block | `@buildright/project-builder` (custom SDK dropin) |
| **Persona Resolution** | Custom action via API Mesh | **Keep** - Core BuildRight feature |

### Why Two Types of Dropins?

| Data Source | Dropin Type | Examples |
|-------------|-------------|----------|
| **Commerce** | Standard Commerce Dropins | Auth, Cart, Checkout, Orders |
| **ACO** | Custom SDK Dropins | Product Grid, PDP, Project Builder |

### Why Can't We Use Commerce's Native Product Dropins?

Commerce's `@dropins/storefront-product-discovery` and `@dropins/storefront-pdp` are **hardcoded to Commerce data sources**:
- Product Discovery → Uses **Live Search** (Commerce)
- PDP → Uses **Commerce Catalog Service**

BuildRight products live in **ACO**, not Commerce. The native dropins cannot query ACO — they don't know it exists.

### Why SDK Dropins Instead of Plain EDS Blocks?

Plain EDS blocks work, but create inconsistency:

| Issue | Plain Blocks | SDK Dropins |
|-------|--------------|-------------|
| **Styling** | Manual CSS, looks different | Shared design tokens, matches Commerce |
| **Events** | Custom events | Standard event bus, interoperates with Commerce dropins |
| **Extensibility** | Fork to customize | Slots system for extension |
| **Maintenance** | Custom patterns | Standard patterns, SDK updates |

**Bottom line:** SDK dropins ensure BuildRight's ACO components look and behave like Commerce components.

---

## Auth Dropin vs Persona Service: The Key Question {#auth-dropin-vs-persona-service}

### TL;DR: They WORK TOGETHER. The Auth Dropin does NOT replace the Persona Service.

### Why Both Are Needed

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐          ┌────────────────────────┐               │
│  │  Auth Dropin         │          │  Persona Service       │               │
│  │  (@dropins/auth)     │          │  (I/O Runtime Action)  │               │
│  ├──────────────────────┤          ├────────────────────────┤               │
│  │                      │          │                        │               │
│  │  • Login UI          │──email──▶│  • Look up customer    │               │
│  │  • Registration UI   │          │    in Commerce         │               │
│  │  • Password reset    │          │  • Get customer_group  │               │
│  │  • Session tokens    │          │  • Get ACO attributes: │               │
│  │  • Cookie management │          │    - catalog_view_id   │               │
│  │                      │          │    - price_book_id     │               │
│  │                      │          │  • Return persona data │               │
│  └──────────┬───────────┘          └───────────┬────────────┘               │
│             │                                   │                            │
│             │   events.on('authenticated')      │                            │
│             └──────────────────────────────────▶│                            │
│                                                 │                            │
│                                                 ▼                            │
│                                    ┌────────────────────────┐               │
│                                    │  Catalog Service       │               │
│                                    │  (mesh-client.js)      │               │
│                                    ├────────────────────────┤               │
│                                    │  Sets headers:         │               │
│                                    │  X-Catalog-View-Id     │               │
│                                    │  X-Price-Book-Id       │               │
│                                    │                        │               │
│                                    │  For all ACO queries   │               │
│                                    └────────────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What Each Component Does

| Component | Responsibility | Replaceable? |
|-----------|---------------|--------------|
| **Auth Dropin** | Login/logout UI, session management, Commerce customer API | YES - replaces demo login |
| **Persona Service** | Maps customer → ACO catalog view & price book | NO - core BuildRight feature |
| **Catalog Service** | Applies persona headers to all ACO queries | NO - bridges persona to catalog |

### The Integration Point

When the Auth Dropin fires the `authenticated` event:

```javascript
// In scripts/initializers/auth.js
import { events } from '@dropins/tools/event-bus.js';
import { initializeMeshForEmail } from '../services/mesh-integration.js';

events.on('authenticated', async (payload) => {
  if (payload?.customer?.email) {
    // THIS is where Auth Dropin meets Persona Service
    const personaData = await initializeMeshForEmail(payload.customer.email);
    // personaData now contains catalogViewId, priceBookId from ACO
    // These headers are set in sessionStorage for all future queries
  }
});
```

### Why We Can't Just Use Auth Dropin Alone

Commerce Auth Dropin manages:
- ✅ User credentials (email/password)
- ✅ Session tokens
- ✅ Customer data (name, addresses, etc.)
- ❌ **Does NOT know about ACO catalog views**
- ❌ **Does NOT know about ACO price books**

BuildRight's unique value is **persona-based catalog and pricing**:
- Sarah (Production Builder) sees different prices than David (DIY Homeowner)
- This requires custom ACO attributes on the Commerce customer
- The Persona Service translates customer → ACO context

---

## Complete List of Available Commerce Dropins {#available-dropins}

### 1. `@dropins/storefront-auth` — Authentication

**Purpose:** User login, registration, password management

**Containers:**
| Container | Description |
|-----------|-------------|
| `SignIn` | Login form with email/password |
| `SignUp` | Registration form |
| `ResetPassword` | Password reset request |
| `UpdatePassword` | Change password (requires token) |
| `SuccessNotification` | Post-action success messages |

**Key Events:**
- `authenticated` — Fired when user logs in/out

**BuildRight Status:** Partially implemented (`auth-dropin` block exists)

**Integration Notes:**
- Must call `initializeMeshForEmail()` on `authenticated` event
- Replace `pages/login.html` with dropin
- Replace `blocks/user-menu` with dropin

---

### 2. `@dropins/storefront-account` — User Account

**Purpose:** Customer account management

**Containers:**
| Container | Description |
|-----------|-------------|
| `CustomerInformation` | Profile display/edit |
| `Addresses` | Address book management |
| `Sidebar` | Account navigation menu |

**BuildRight Status:** Not implemented

**Integration Notes:**
- Replace `pages/account.html` 
- Integrate with existing tier/company displays

---

### 3. `@dropins/storefront-cart` — Shopping Cart

**Purpose:** Cart management and display

**Containers:**
| Container | Description |
|-----------|-------------|
| `Cart` | Full cart page |
| `MiniCart` | Header dropdown cart |
| `OrderSummary` | Cart totals display |
| `GiftOptions` | Gift wrapping (optional) |

**Key API Functions:**
```javascript
import { 
  addProductsToCart,    // Add by SKU
  removeItemFromCart,   // Remove item
  updateQuantity,       // Change quantity
  getCart              // Get current cart
} from '@dropins/storefront-cart/api.js';
```

**Key Events:**
- `cart/initialized` — Cart loaded
- `cart/updated` — Cart changed
- `cart/product/added` — Item added

**BuildRight Status:** Partially implemented (`commerce-mini-cart` block exists)

**Integration Notes:**
- ACO products must be added by SKU
- Cart totals come from Commerce (not ACO pricing!)
- May need custom pricing display for persona prices

---

### 4. `@dropins/storefront-checkout` — Checkout

**Purpose:** Complete checkout flow

**Containers:**
| Container | Description |
|-----------|-------------|
| `LoginForm` | Guest email / auth check |
| `ShippingMethods` | Shipping options |
| `PaymentMethods` | Payment selection |
| `PlaceOrder` | Order submission |
| `ServerError` | Error handling |
| `OrderConfirmation` | Success page |

**BuildRight Status:** Not implemented

**Integration Notes:**
- Create `pages/checkout.html`
- Configure Commerce shipping/payment methods
- Handle order placement

---

### 5. `@dropins/storefront-order` — Order Management

**Purpose:** Order history and status

**Containers:**
| Container | Description |
|-----------|-------------|
| `OrderStatus` | Single order details |
| `OrdersList` | Order history list |
| `CreateReturn` | Return request form |
| `ReturnsListWidget` | Returns history |

**Key API Functions:**
```javascript
import { 
  getOrder,           // Get order by ID
  placeOrder,         // Place order (from checkout)
  confirmCancelOrder  // Cancel order
} from '@dropins/storefront-order/api.js';
```

**BuildRight Status:** Not implemented

**Integration Notes:**
- Create `pages/order-history.html`
- Create `pages/order-details.html`
- Replace mock order data

---

### 6. `@dropins/storefront-pdp` (Product Details Page)

**Purpose:** Product detail display

**Containers:**
| Container | Description |
|-----------|-------------|
| `ProductDetails` | Main product display |
| `ProductGallery` | Image carousel |
| `ProductPrice` | Price display |
| `ProductQuantity` | Quantity selector |
| `ProductOptions` | Variant selection |

**BuildRight Status:** Custom implementation exists

**Integration Decision: CREATE CUSTOM SDK DROPIN**

The Commerce PDP dropin expects products from **Commerce Catalog Service**, but BuildRight products come from **ACO**. 

**Recommendation:** Create `@buildright/product-detail` custom dropin using the SDK:
- Uses SDK components (`ProductItemCard`, `Price`, `Skeleton`, etc.)
- Connects to ACO via `catalog-service.js`
- Displays persona-based tiered pricing
- Integrates with Commerce Cart dropin for add-to-cart
- Benefits from SDK design tokens for visual consistency

See [Custom Dropins with the SDK](#custom-dropins-sdk) for implementation details.

---

### 7. `@dropins/storefront-product-discovery` — Search & Listing

**Purpose:** Product search and category listings

**Containers:**
| Container | Description |
|-----------|-------------|
| `ProductList` | Product grid |
| `Facets` | Filter sidebar |
| `ResultsInfo` | Search results header |
| `SearchBarInput` | Search input field |
| `SearchBarResults` | Search suggestions |

**BuildRight Status:** Custom implementation exists (`product-grid`, `filters-sidebar`)

**Integration Decision: CREATE CUSTOM SDK DROPIN**

The Commerce Product Discovery dropin uses **Live Search** (Commerce). BuildRight uses **ACO Search**. These are incompatible data sources — cannot use Commerce dropin directly.

**Recommendation:** Create `@buildright/product-discovery` custom dropin using the SDK:
- Uses SDK components (`ProductItemCard`, `Pagination`, `Skeleton`, etc.)
- Connects to ACO search via `catalog-service.js`
- Displays ACO facets in SDK-styled filter sidebar
- Emits standard SDK events (`search/query`, `product/clicked`)
- Benefits from SDK design tokens for visual consistency with Commerce dropins

See [Custom Dropins with the SDK](#custom-dropins-sdk) for implementation details.

---

### 8. `@dropins/storefront-wishlist` — Wishlists

**Purpose:** Save products for later

**Containers:**
| Container | Description |
|-----------|-------------|
| `Wishlist` | Wishlist display |
| `EmptyWishlist` | Empty state |

**Key API Functions:**
```javascript
import { 
  addProductsToWishlist,
  removeProductsFromWishlist,
  getWishlists
} from '@dropins/storefront-wishlist/api.js';
```

**BuildRight Status:** Not implemented

**Integration Notes:**
- Add wishlist buttons to PDP and product tiles
- Create `pages/wishlist.html`

---

### 9. `@dropins/storefront-recommendations` — Product Recommendations

**Purpose:** AI-powered product suggestions

**Recommendation Types:**
- `viewed` — Products viewed by others
- `bought` — Products bought with this
- `related` — Related by category
- `trending` — Currently popular
- `recently-viewed` — User's recent views

**BuildRight Status:** Not implemented

**Integration Notes:**
- Requires Adobe Commerce Product Recommendations
- Add to PDP, cart, home page
- May work with ACO products (needs testing)

---

## Custom Dropins with the SDK {#custom-dropins-sdk}

### Why Custom SDK Dropins?

Commerce's native product dropins (`@dropins/storefront-product-discovery`, `@dropins/storefront-pdp`) are hardcoded to **Commerce Catalog Service** and **Live Search**. They cannot query ACO.

For ACO-sourced components, we have two options:

1. ❌ **Plain EDS blocks** — Works, but inconsistent styling/events with Commerce dropins
2. ✅ **Custom SDK dropins** — Same design tokens, event bus, and patterns as Commerce dropins

### What the SDK Provides

The [Drop-in SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/) gives us:

| Feature | What It Does |
|---------|--------------|
| **Design Tokens** | Shared CSS variables — automatic visual consistency |
| **UI Components** | 30+ components: `Button`, `Card`, `Price`, `ProductItemCard`, `Skeleton`, etc. |
| **Event Bus** | Standard `events.emit()` / `events.on()` — interoperates with Commerce dropins |
| **Slots** | Extension points without forking |
| **CLI** | `npx elsie generate container --pathname <name>` |

### SDK Components Available

```javascript
// Pre-built UI components from @dropins/tools/components.js
import { 
  Button,           // Buttons with variants
  Card,             // Product cards
  Price,            // Price display with formatting
  PriceRange,       // Min-max pricing
  ProductItemCard,  // Product tile with image, title, price
  Skeleton,         // Loading states
  Input,            // Form inputs with validation
  Incrementer,      // Quantity +/- controls
  InlineAlert,      // Notifications and messages
  Icon,             // Icon system
  Tag,              // Badges and labels
  Modal,            // Dialog overlays
  Pagination,       // Page navigation
  Breadcrumbs,      // Navigation trail
  ProgressSpinner,  // Loading indicator
  // ... 30+ more components
} from '@dropins/tools/components.js';
```

### Recommended Custom Dropins for BuildRight

| Custom Dropin | Replaces | Purpose |
|---------------|----------|---------|
| **`@buildright/product-discovery`** | `product-grid/`, `filters-sidebar/` | Product listing with ACO data source |
| **`@buildright/product-detail`** | `product-detail.html` | PDP with ACO data and persona pricing |
| **`@buildright/project-builder`** | `project-builder/` | BOM wizard with SDK components |
| **`@buildright/pricing-display`** | `pricing-display/` | Tiered pricing with SDK Price component |
| **`@buildright/tier-badge`** | `tier-badge/` | Customer tier indicator using SDK Tag |

### Example: Product Grid as SDK Dropin

**Current (plain EDS block):**
```javascript
// blocks/product-grid/product-grid.js
export default async function decorate(block) {
  // Custom HTML generation
  // Custom event handling
  // Custom styling
  // Inconsistent with Commerce dropins
}
```

**With SDK (custom dropin):**
```javascript
// @buildright/product-discovery/containers/ProductList.js
import { ProductItemCard, Skeleton, Pagination } from '@dropins/tools/components.js';
import { events } from '@dropins/tools/event-bus.js';
import { catalogService } from '../../../scripts/services/catalog-service.js';

export const ProductList = async (props) => {
  const { pageSize = 20, routeProduct, routeAddToCart } = props;
  
  // Uses standard SDK event patterns
  events.on('search/query', async (query) => {
    const results = await catalogService.searchProducts(query);
    renderProducts(results);
  });
  
  // Uses SDK components for consistency
  const renderProducts = (results) => {
    return results.items.map(product => 
      ProductItemCard({
        sku: product.sku,
        name: product.name,
        price: { value: product.price.value, currency: 'USD' },
        image: { url: product.imageUrl, label: product.name },
        onClick: () => routeProduct(product),
        onAddToCart: () => routeAddToCart(product.sku)
      })
    );
  };
};
```

### Installation

```bash
# Install the SDK
npm install @adobe-commerce/elsie

# Generate a new dropin structure
npx elsie generate container --pathname ProductDiscovery
npx elsie generate component --pathname ProductTile
```

### Phased Approach

| Phase | Approach | Effort | Consistency |
|-------|----------|--------|-------------|
| **Phase 1** | Use SDK components in existing blocks | Low | Medium |
| **Phase 2** | Create full custom dropins | Medium | High |
| **Phase 3** | Publish as `@buildright/*` packages | Medium | Full |

### Phase 1: Quick Win — SDK Components in Existing Blocks

Before creating full custom dropins, we can incrementally adopt SDK components:

```javascript
// blocks/product-grid/product-grid.js (updated)
import { ProductItemCard, Skeleton, Pagination } from '@dropins/tools/components.js';
import { events } from '@dropins/tools/event-bus.js';

export default async function decorate(block) {
  // Keep existing block structure
  // BUT use SDK components for rendering
  
  const renderProduct = (product) => {
    const container = document.createElement('div');
    ProductItemCard({
      sku: product.sku,
      name: product.name,
      price: { value: product.price.value, currency: 'USD' },
      image: { url: product.imageUrl }
    })(container);
    return container;
  };
  
  // Use SDK event bus
  events.emit('product-grid/loaded', { count: products.length });
}
```

### Phase 2: Full Custom Dropins

After Commerce dropin integration is stable, create proper SDK-based dropins:

```
scripts/dropins/
├── product-discovery/
│   ├── api.js              # Public API functions
│   ├── render.js           # Rendering utilities
│   ├── containers/
│   │   ├── ProductList.js
│   │   ├── Facets.js
│   │   └── SearchBar.js
│   └── components/
│       ├── ProductTile.js
│       └── FacetGroup.js
├── product-detail/
│   ├── api.js
│   ├── render.js
│   └── containers/
│       ├── ProductDetail.js
│       ├── ProductGallery.js
│       └── PersonaPricing.js
└── project-builder/
    ├── api.js
    ├── render.js
    └── containers/
        ├── ProjectWizard.js
        ├── BOMPreview.js
        └── PhaseSelector.js
```

---

## Current Mock Implementations to Replace {#current-mocks}

### High Priority — MUST Replace

| Mock | File(s) | Dropin Replacement |
|------|---------|-------------------|
| **Demo Auth** | `auth.js`, `login.html`, `user-menu/` | `@dropins/storefront-auth` |
| **localStorage Cart** | `cart-manager.js`, `mini-cart/` | `@dropins/storefront-cart` |
| **Mock ACO Service** | `aco-service.js` | **Remove** — use real ACO via mesh |
| **Mock Products** | `data-mock.js`, `mock-products.json` | **Remove** — use real ACO data |

### Medium Priority — Should Replace

| Mock | File(s) | Dropin Replacement |
|------|---------|-------------------|
| **Demo Dashboard** | `dashboard.html` | Custom + dropin account widgets |
| **Order History Mock** | `order-history.html` | `@dropins/storefront-order` |

### Keep As-Is (Not Mocks)

| Component | File(s) | Why Keep |
|-----------|---------|----------|
| **Catalog Service** | `catalog-service.js` | Bridges persona → ACO |
| **Mesh Client** | `mesh-client.js` | ACO API access |
| **Mesh Integration** | `mesh-integration.js` | Persona initialization |
| **Persona Config** | `persona-config.js` | UI preferences (keep for demos) |
| **BOM Calculator** | `bom-calculator.js` | Custom BuildRight feature |
| **Product Grid** | `product-grid/` | Uses ACO, not Commerce catalog |
| **Project Builder** | `project-builder/` | Custom BuildRight feature |

---

## Services Architecture Analysis {#services-architecture}

### Current Service Layer

```
scripts/services/
├── bom-calculator.js      # BOM generation logic
├── catalog-service.js     # Strategy pattern for product data
├── live-search.js         # Unused? (Commerce Live Search)
├── mesh-client.js         # GraphQL client for API Mesh
├── mesh-integration.js    # Bridges auth → catalog
├── product-lookup.js      # Product data utilities
└── queries.js             # GraphQL query definitions
```

### Service Roles

#### `catalog-service.js` — The Hub

**Purpose:** Unified interface for product data, abstracts data source (mesh vs mock)

**Strategy Pattern:**
```javascript
// MeshStrategy — Real ACO data via API Mesh
// MockStrategy — Local mock data (for offline/dev)

// The service selects strategy automatically:
// - Try mesh first
// - Fall back to mock if mesh unavailable
```

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `initialize(personaId)` | Set up for a persona (demo mode) |
| `initializeByEmail(email)` | Set up for authenticated user (dropin mode) |
| `searchProducts(phrase)` | Search ACO catalog |
| `getProduct(sku)` | Get product by SKU |
| `generateBOM(config)` | Generate bill of materials |
| `searchWithFacets(options)` | Search with filters |

**After Dropin Integration:** Still needed! Called when Auth Dropin fires `authenticated` event.

#### `mesh-client.js` — ACO Access

**Purpose:** GraphQL client for API Mesh (ACO + I/O Runtime Actions)

**Key Functions:**
| Function | Purpose |
|----------|---------|
| `meshQuery(query, variables)` | Execute GraphQL query |
| `initializePersona(customerGroupId)` | Get persona by group |
| `initializePersonaByEmail(email)` | Get persona by email |
| `searchProducts(phrase)` | Search products |
| `getProductBySKU(sku)` | Get single product |
| `generateBOM(config)` | Generate BOM |

**After Dropin Integration:** Still needed! This is how we talk to ACO.

#### `mesh-integration.js` — The Bridge

**Purpose:** Connects auth system with catalog service

**Key Functions:**
| Function | Purpose |
|----------|---------|
| `initializeMeshForPersona(personaId)` | Demo mode init |
| `initializeMeshForEmail(email)` | Dropin mode init |

**After Dropin Integration:** Critical! This is called from the Auth Dropin `authenticated` event handler.

#### `aco-service.js` — DEPRECATED

**Purpose:** Mock ACO API for local development

**After Dropin Integration:** DELETE. All ACO access goes through `mesh-client.js`.

---

## Integration Strategy {#integration-strategy}

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Use Commerce Dropins for Commerce data** | Auth, Cart, Checkout, Orders live in Commerce — use standard dropins |
| **Create custom SDK dropins for ACO data** | Native `product-discovery` and `pdp` dropins are hardcoded to Commerce Catalog/Live Search — cannot query ACO |
| **SDK dropins over plain EDS blocks** | Ensures visual/behavioral consistency with Commerce dropins (shared design tokens, event bus, slots) |
| **Keep Persona Service** | Auth Dropin handles login; Persona Service maps customer → ACO catalog view + price book. Both needed. |
| **Keep catalog-service.js and mesh-client.js** | Core infrastructure for ACO access — used by custom SDK dropins |

### Phase 1: Commerce Dropins (Foundation)

**Goal:** Replace all mocks with real Commerce functionality  
**Dropins used:** `@dropins/storefront-auth`, `@dropins/storefront-cart`, `@dropins/storefront-checkout`, `@dropins/storefront-order`

1. **Replace Demo Auth with Auth Dropin**
   - Create full `auth-dropin` block implementation
   - Wire `authenticated` event to `initializeMeshForEmail()`
   - Remove `pages/login.html` form logic
   - Replace `blocks/user-menu` with dropin

2. **Replace localStorage Cart with Cart Dropin**
   - Initialize Cart Dropin in `scripts/initializers/cart.js`
   - Create `commerce-mini-cart` block (done)
   - Update `pages/cart.html` to use Cart container
   - Remove `cart-manager.js`
   - Update all "Add to Cart" buttons to use `addProductsToCart()`

3. **Remove Mock Data**
   - Delete `aco-service.js`
   - Delete `data-mock.js`
   - Delete `data/mock-products.json`
   - Update `catalog-service.js` to remove MockStrategy (or keep for offline)

4. **Add Checkout Dropin**
   - Create `pages/checkout.html`
   - Implement full checkout flow
   - Configure Commerce payment/shipping

5. **Add Order Dropin**
   - Replace `pages/order-history.html`
   - Add order detail pages
   - Connect to Commerce order API

### Phase 2: Custom SDK Dropins (ACO Components)

**Goal:** Replace plain EDS blocks with SDK-based dropins  
**Why not native dropins?** Commerce's `product-discovery` uses Live Search; `pdp` uses Commerce Catalog. Neither can query ACO.  
**Why not plain blocks?** Plain blocks have custom styling/events — inconsistent with Commerce dropins.

6. **Create `@buildright/product-discovery` Dropin**
   - Install SDK: `npm install @adobe-commerce/elsie`
   - Create containers: `ProductList`, `Facets`, `SearchBar`
   - Use SDK components: `ProductItemCard`, `Pagination`, `Skeleton`
   - Wire to `catalog-service.js` for ACO data
   - Emit standard SDK events

7. **Create `@buildright/product-detail` Dropin**
   - Create containers: `ProductDetail`, `PersonaPricing`, `ProductGallery`
   - Display persona-based tiered pricing
   - Integrate with Commerce Cart dropin for add-to-cart
   - Use SDK `Price` component for formatting

8. **Create `@buildright/project-builder` Dropin**
   - Create containers: `ProjectWizard`, `BOMPreview`, `PhaseSelector`
   - Use SDK components for wizard UI
   - Maintain BOM calculation logic

### Phase 3: Extended Features

**Goal:** Complete feature parity and polish

9. **Add Account Dropin**
   - Update `pages/account.html`
   - Add address management
   - Extend with custom tier/company displays using SDK components

10. **Add Wishlist Dropin**
    - Create wishlist page
    - Add wishlist buttons to products

11. **Create Utility Dropins**
    - `@buildright/pricing-display` — Tiered pricing with SDK `Price`
    - `@buildright/tier-badge` — Customer tier using SDK `Tag`

12. **Evaluate Recommendations Dropin**
    - Test compatibility with ACO products
    - Add to PDP, cart if compatible

---

## File-by-File Audit {#file-audit}

### Files to DELETE

| File | Reason |
|------|--------|
| `scripts/aco-service.js` | Mock service, use mesh-client instead |
| `scripts/data-mock.js` | Mock data loader |
| `data/mock-products.json` | Mock product data |
| `blocks/user-menu/` | Replace with auth dropin user menu |
| `blocks/mini-cart/` | Replace with commerce-mini-cart |

### Files to MODIFY

| File | Changes |
|------|---------|
| `scripts/auth.js` | Remove demo mode, keep dropin integration |
| `scripts/cart-manager.js` | Replace with dropin API calls |
| `scripts/scripts.js` | Ensure dropin initialization |
| `pages/login.html` | Use auth-dropin block only |
| `pages/cart.html` | Use cart dropin container |
| `blocks/header/header.js` | Use dropin cart count, user menu |
| `blocks/product-grid/product-grid.js` | Update add-to-cart to use dropin |
| `config/env.json` | Remove demo mode flags |

### Files to KEEP (Services Layer)

| File | Why |
|------|-----|
| `scripts/services/catalog-service.js` | ACO abstraction layer — used by custom dropins |
| `scripts/services/mesh-client.js` | ACO API access — core infrastructure |
| `scripts/services/mesh-integration.js` | Auth → catalog bridge — critical for dropins |
| `scripts/services/queries.js` | GraphQL queries for ACO |
| `scripts/services/bom-calculator.js` | Core BuildRight feature |
| `scripts/persona-config.js` | UI preferences (useful for demos) |

### Files to MIGRATE to SDK Dropins

| Current File | Target SDK Dropin | Priority |
|--------------|-------------------|----------|
| `blocks/product-grid/` | `@buildright/product-discovery` | Phase 2 |
| `blocks/filters-sidebar/` | `@buildright/product-discovery` | Phase 2 |
| `blocks/product-detail/` | `@buildright/product-detail` | Phase 2 |
| `blocks/pricing-display/` | `@buildright/pricing-display` | Phase 2 |
| `blocks/tier-badge/` | `@buildright/tier-badge` | Phase 3 |
| `blocks/project-builder/` | `@buildright/project-builder` | Phase 3 |

### New Files to CREATE

#### Phase 1: Commerce Dropin Integration

| File | Purpose |
|------|---------|
| `scripts/initializers/index.js` | Dropin initialization hub |
| `scripts/initializers/auth.js` | Auth dropin setup |
| `scripts/initializers/cart.js` | Cart dropin setup |
| `scripts/initializers/checkout.js` | Checkout dropin setup |
| `scripts/commerce-helpers.js` | Helper functions for dropins |
| `blocks/commerce-checkout/` | Checkout page block |
| `blocks/commerce-orders/` | Order history block |
| `blocks/commerce-account/` | Account management block |
| `pages/checkout.html` | Checkout page |
| `pages/order-detail.html` | Order detail page |

#### Phase 2: Custom SDK Dropins

```
scripts/dropins/
├── product-discovery/           # @buildright/product-discovery
│   ├── api.js                   # Public API functions
│   ├── render.js                # Rendering utilities
│   ├── index.js                 # Main entry point
│   ├── containers/
│   │   ├── ProductList.js       # Product grid container
│   │   ├── Facets.js            # Filter sidebar container
│   │   └── SearchBar.js         # Search input container
│   ├── components/
│   │   ├── ProductTile.js       # Individual product card
│   │   └── FacetGroup.js        # Filter group
│   └── styles/
│       └── product-discovery.css
│
├── product-detail/              # @buildright/product-detail
│   ├── api.js
│   ├── render.js
│   ├── index.js
│   ├── containers/
│   │   ├── ProductDetail.js     # Main PDP container
│   │   ├── ProductGallery.js    # Image gallery
│   │   └── PersonaPricing.js    # Tiered pricing display
│   └── styles/
│       └── product-detail.css
│
└── project-builder/             # @buildright/project-builder
    ├── api.js
    ├── render.js
    ├── index.js
    ├── containers/
    │   ├── ProjectWizard.js     # Main wizard container
    │   ├── BOMPreview.js        # Bill of materials preview
    │   └── PhaseSelector.js     # Construction phase selector
    └── styles/
        └── project-builder.css
```

---

## Migration Roadmap {#migration-roadmap}

### Summary of Decisions

| # | Decision | Status |
|---|----------|--------|
| 1 | Replace demo auth with `@dropins/storefront-auth` | 🔲 Planned |
| 2 | Replace localStorage cart with `@dropins/storefront-cart` | 🔲 Planned |
| 3 | Add `@dropins/storefront-checkout` for checkout flow | 🔲 Planned |
| 4 | Add `@dropins/storefront-order` for order history | 🔲 Planned |
| 5 | Keep Persona Service — works WITH Auth Dropin, not replaced by it | ✅ Decided |
| 6 | Keep `catalog-service.js` and `mesh-client.js` — core ACO infrastructure | ✅ Decided |
| 7 | Create `@buildright/product-discovery` (custom SDK dropin) — native dropin can't query ACO | 🔲 Planned |
| 8 | Create `@buildright/product-detail` (custom SDK dropin) — native dropin can't query ACO | 🔲 Planned |
| 9 | Create `@buildright/project-builder` (custom SDK dropin) — no equivalent native dropin | 🔲 Planned |
| 10 | Use SDK dropins over plain EDS blocks — ensures consistency with Commerce dropins | ✅ Decided |

### Phase 1: Commerce Dropins Integration (Weeks 1-2)

**Goal:** Replace all mocks with real Commerce functionality  
**Key insight:** Commerce Dropins handle Commerce data (auth, cart, orders). Persona Service still needed to map customer → ACO context.

#### Week 1: Auth & Cart Foundation

- [ ] Finalize `scripts/initializers/` structure
- [ ] Complete `auth-dropin` block with all containers (SignIn, SignUp, etc.)
- [ ] Wire `authenticated` event to persona service (`initializeMeshForEmail`)
- [ ] Test login → persona → catalog flow end-to-end
- [ ] Complete `commerce-mini-cart` block
- [ ] Update all add-to-cart buttons to use `addProductsToCart()`

#### Week 2: Cart, Checkout & Orders

- [ ] Update `pages/cart.html` with Cart container
- [ ] Remove `cart-manager.js`
- [ ] Create `pages/checkout.html` with Checkout dropin
- [ ] Configure Commerce payment/shipping methods
- [ ] Test order placement end-to-end
- [ ] Implement order history with Order dropin

### Phase 2: Custom SDK Dropins (Weeks 3-4)

**Why custom dropins?** Native `product-discovery` and `pdp` dropins query Commerce Catalog/Live Search — they cannot query ACO.  
**Why SDK over plain blocks?** SDK provides shared design tokens, event bus, and slots — ensures consistency with Commerce dropins.

#### Week 3: Product Discovery Dropin

- [ ] Install SDK: `npm install @adobe-commerce/elsie`
- [ ] Scaffold `@buildright/product-discovery` structure
- [ ] Create `ProductList` container using SDK components
- [ ] Create `Facets` container for ACO facets
- [ ] Create `SearchBar` container
- [ ] Wire to `catalog-service.js` for data
- [ ] Test search and filter flows

#### Week 4: Product Detail Dropin

- [ ] Scaffold `@buildright/product-detail` structure
- [ ] Create `ProductDetail` container with SDK components
- [ ] Create `PersonaPricing` container for tiered pricing display
- [ ] Create `ProductGallery` using SDK patterns
- [ ] Integrate with Commerce Cart dropin for add-to-cart
- [ ] Test PDP flows with persona pricing

### Phase 3: Extended Features (Weeks 5-6)

**Goal:** Complete feature parity and additional dropins

#### Week 5: Account & Project Builder

- [ ] Implement Account dropin integration
- [ ] Scaffold `@buildright/project-builder` structure
- [ ] Create `ProjectWizard` container
- [ ] Create `BOMPreview` container
- [ ] Create `PhaseSelector` container
- [ ] Test BOM generation flows

#### Week 6: Polish & Cleanup

- [ ] Scaffold `@buildright/pricing-display` dropin
- [ ] Scaffold `@buildright/tier-badge` dropin
- [ ] Add Wishlist dropin integration
- [ ] Delete deprecated files (mocks, old blocks)
- [ ] Final testing across all flows
- [ ] Documentation update

---

## Key Takeaways

### 1. Auth Dropin + Persona Service = Team Players
- Auth Dropin handles Commerce authentication (login UI, tokens, session)
- Persona Service provides ACO catalog/pricing context (catalog view, price book)
- They connect via the `authenticated` event
- **Neither replaces the other — they work together**

### 2. Commerce Dropins for Commerce Data
Use the standard Commerce dropins for data that lives in Commerce:
- `@dropins/storefront-auth` → User authentication
- `@dropins/storefront-cart` → Shopping cart
- `@dropins/storefront-checkout` → Checkout flow
- `@dropins/storefront-order` → Order history
- `@dropins/storefront-account` → User account
- `@dropins/storefront-wishlist` → Saved items

### 3. Custom SDK Dropins for ACO Data
Create custom dropins using the SDK for data that comes from ACO:
- `@buildright/product-discovery` → Product grid, search, filters (ACO data)
- `@buildright/product-detail` → PDP with persona pricing (ACO data)
- `@buildright/project-builder` → BOM wizard (ACO + custom logic)

**Why SDK dropins instead of plain blocks?**
- Visual consistency with Commerce dropins (shared design tokens)
- Standard event bus integration
- Built-in extensibility via slots
- Reusable as NPM packages

### 4. The Persona Action is the Bridge
- Takes customer email from Auth Dropin
- Queries Commerce for customer group
- Returns ACO `catalogViewId` and `priceBookId`
- Sets headers for all subsequent ACO queries
- **Enables persona-based pricing and catalog views**

### 5. Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Commerce Dropins              Custom SDK Dropins                   │
│  ┌─────────────────┐          ┌─────────────────┐                  │
│  │ Auth            │──────────│ Product         │                  │
│  │ Cart            │  events  │ Discovery       │                  │
│  │ Checkout        │◄────────►│ Product Detail  │                  │
│  │ Orders          │          │ Project Builder │                  │
│  │ Account         │          │ Pricing Display │                  │
│  └────────┬────────┘          └────────┬────────┘                  │
│           │                            │                            │
│           │ Commerce API               │ ACO API (via Mesh)        │
│           ▼                            ▼                            │
├─────────────────────────────────────────────────────────────────────┤
│                         BACKEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Adobe Commerce              API Mesh              ACO              │
│  ┌─────────────────┐        ┌──────────┐        ┌─────────────┐    │
│  │ Customers       │        │ Persona  │        │ Products    │    │
│  │ Cart/Checkout   │◄──────►│ Action   │◄──────►│ Pricing     │    │
│  │ Orders          │        │ BOM      │        │ Catalog     │    │
│  │ Addresses       │        │ Action   │        │ Views       │    │
│  └─────────────────┘        └──────────┘        └─────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
