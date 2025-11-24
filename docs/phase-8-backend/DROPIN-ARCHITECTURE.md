# Adobe Commerce Storefront Dropins - Architecture

**Research Date**: November 15, 2024  
**Sources**: Adobe Experience League, Context7

---

## What Are Dropins?

**Dropins** are pre-built, NPM-packaged UI components for Adobe Commerce storefronts built with Edge Delivery Services (EDS). They handle specific commerce functionality and connect to Adobe Commerce APIs.

**Built on Drop-in SDK**: Dropins are powered by a comprehensive SDK framework that provides:
- **Design system** with tokens for quick rebranding
- **Component library** for consistent UI
- **Event system** for inter-component communication
- **Slot system** for customization injection
- **Rendering engine** for efficient DOM updates
- **CLI tooling** for development workflow

**Source**: [Adobe Commerce Storefront SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/)

### Available Dropins

```bash
npm install @dropins/storefront-account        # User account management
npm install @dropins/storefront-auth          # Authentication
npm install @dropins/storefront-cart          # Shopping cart
npm install @dropins/storefront-checkout      # Checkout process
npm install @dropins/storefront-order         # Order details
npm install @dropins/storefront-payment-services  # Payment handling
npm install @dropins/storefront-pdp           # Product detail page
npm install @dropins/storefront-recommendations   # Product recommendations
npm install @dropins/storefront-wishlist      # Wishlist functionality
npm install @dropins/storefront-personalization   # Personalization
npm install @dropins/storefront-product-discovery # Product search/discovery
```

---

## Key Characteristics

### 1. **Pre-Built Commerce Functionality**
- Dropins provide ready-made commerce features (auth, cart, checkout, etc.)
- Connect directly to Adobe Commerce backend via GraphQL
- Handle complex state management internally

### 2. **NPM Package Distribution**
- Installed via npm like regular dependencies
- Versioned and maintained by Adobe
- Regular updates and patches

### 3. **EDS Integration**
- Designed to work with Edge Delivery Services
- Can be imported into EDS blocks
- Follow EDS patterns and conventions

---

## Drop-in SDK Framework

The SDK provides the complete infrastructure for building and customizing dropins.

### SDK Components

**Design System**
- **Design Tokens** - Variables for colors, typography, spacing, shapes, grid
- **Rebranding** - Quick merchant customization via token overrides
- **UI Components** - Pre-built, reusable interface elements

**Core Framework**
- **Mounting** - Attaches dropins to DOM elements
- **Rendering** - Display logic and component lifecycle  
- **Eventing** - Pub/sub system for component communication
- **Hydrating** - Data binding from Commerce backend
- **Testing** - Built-in testing framework

**Developer Tools**
- **CLI** - Command-line tools for development workflow
- **Utilities** - Helper functions for common tasks

### Design Token System

Dropins use design tokens for consistent, rebrandable styling:

**Token Categories**:
- **Colors** - Brand colors, semantic colors (success, warning, error)
- **Typography** - Font families, sizes, weights, line heights
- **Spacing** - Consistent spacing scale
- **Shapes** - Border radius, shadows, borders
- **Grid** - Layout grid system

**Rebranding Strategy**:
```css
/* Override dropin design tokens */
:root {
  --dropin-color-brand-primary: #1E40AF;  /* Your brand blue */
  --dropin-spacing-unit: 8px;
  --dropin-border-radius: 8px;
}
```

**For BuildRight**: Our design tokens (Phase 2) should align with dropin token names for seamless integration.

### SDK Component Library

Pre-built UI components available across all dropins:

**Form Elements**:
- Button, Input, InputPassword, InputDate, InputFile
- Checkbox, RadioButton, ToggleButton
- TextArea, Picker

**Layout Components**:
- Card, ContentGrid, Divider, Header
- Accordion, Modal, Portal

**Commerce Components**:
- CartItem, CartList, ProductItemCard
- Price, PriceRange
- Incrementer (quantity selector)

**Feedback Components**:
- AlertBanner, InlineAlert
- ProgressSpinner, Skeleton (loading states)
- IllustratedMessage

**Swatches**:
- ColorSwatch, ImageSwatch, TextSwatch

**Navigation**:
- Breadcrumbs, Pagination

**Source**: [SDK Components Overview](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/)

### Slots System

**Slots** allow injecting custom content into dropins without modifying core code.

**How Slots Work**:
- Dropins expose named "slot" injection points
- Developers render custom content into these slots
- Maintains upgradeability (dropins can update, slots remain)

**Example Slots** (from dropin documentation):
- Cart dropin: Multiple slots for customization
- Checkout dropin: Payment method slots, shipping slots
- PDP dropin: Product detail slots, gallery slots

**Usage Pattern** (conceptual):
```javascript
// Inject custom content into dropin slot
cartDropin.slot('order-summary-custom').render(myCustomComponent);
```

**For BuildRight**: Our EDS blocks should consider similar slot patterns for extensibility.

### Events System

Dropins communicate via a standardized event system.

**Event Types** (from documentation):
- **Common events** - Shared across all dropins
- **Dropin-specific events** - Unique to each dropin (Cart, Auth, etc.)

**Event Pattern**:
```javascript
// Emit event
dropin.emit('cart:updated', { items: [...], total: 100 });

// Listen for event
window.addEventListener('cart:updated', (event) => {
  console.log('Cart changed:', event.detail);
});
```

**For BuildRight**: Use same event naming and patterns in mocks.

### SDK Utilities

Helper functions for common tasks:

- **`classList`** - CSS class manipulation utilities
- **`debounce`** - Performance optimization for frequent events
- **`deepmerge`** - Deep object merging
- **`getCookie`** - Cookie management
- **`getFormErrors`** - Form validation helpers
- **`getFormValues`** - Form data extraction
- **`getPathValue`** - Object path traversal

### SDK Reference Modules

**Core Modules**:
- **Events** - Event system implementation
- **GraphQL** - GraphQL client for Commerce API
- **Initializer** - Dropin initialization pattern
- **Links** - Link handling and routing
- **Render** - Component rendering engine
- **reCAPTCHA** - Google reCAPTCHA integration
- **Slots** - Slot system implementation
- **VComponent** - Virtual component system (efficient rendering)

### CLI Tooling

The SDK includes command-line tools for development (details not fully documented).

**Expected capabilities**:
- Scaffolding new dropins
- Building and bundling
- Testing
- Development server

**For BuildRight**: Not needed in mock phase; relevant when building production dropins.

---

## Dropin Lifecycle

### Initialization

Dropins are initialized by importing their initializer scripts:

```javascript
// Import account dropin initializer
import "/scripts/initializers/account.js";

// Import auth dropin initializer  
import "/scripts/initializers/auth.js";
```

### Configuration

Dropins connect to Commerce backend via configured endpoints:

```javascript
const endpoint = 'https://your-commerce-api-mesh.com/graphql';
const headers = {
  'Content-Type': 'application/json',
  'Store-Code': 'your-store-code',
  'Authorization': 'Bearer YOUR_API_KEY'
};
```

### State Management

Dropins manage their own state and expose it through:
- **Event emitters** - Emit events when state changes
- **API functions** - Programmatic access to dropin functionality
- **Shared models** - Data structures accessible across dropins

---

## Authentication Dropin (`@dropins/storefront-auth`)

### Key Functions

**`getCustomerToken(email, password)`**
- Handles sign-in process
- Generates customer token via `generateCustomerToken` mutation
- Sets authentication cookies
- Publishes authentication events

**`createCustomer(forms, apiVersion2)`**
- Creates new customer account
- Uses `createCustomer` or `createCustomerV2` mutation
- Returns customer data

**`getStoreConfig()`**
- Retrieves store configuration (password requirements, etc.)
- Uses `storeConfig` GraphQL query

**`getAttributesForm(formCode)`**
- Retrieves EAV attributes for forms
- Valid form codes: `customer_account_create`, `customer_account_edit`, etc.

### Authentication Flow

```javascript
// 1. User logs in
const token = await getCustomerToken(email, password);

// 2. Token stored in cookie
// Auth dropin handles this automatically

// 3. Customer data fetched
const customer = await getCustomerData();

// 4. User context available throughout app
```

---

## Account Dropin (`@dropins/storefront-account`)

### Key Functions

**`getCustomer()`**
- Retrieves logged-in customer details
- Uses `customer` GraphQL query
- Returns `CustomerDataModelShort`

**`getCustomerAddress()`**
- Returns array of customer addresses
- Includes default shipping/billing flags

**`createCustomerAddress(address)`**
- Creates new address for customer
- Uses `createCustomerAddress` mutation

**`removeCustomerAddress(addressId)`**
- Removes customer address
- Uses `deleteCustomerAddress` mutation

**`getOrderHistoryList(pageSize, currentPage, selectOrdersDate)`**
- Retrieves customer order history
- Supports pagination and filtering

**`getCountries()` / `getRegions(countryCode)`**
- Retrieves country and region data for address forms

---

## Cart Dropin (`@dropins/storefront-cart`)

### Key Functions

**`getCart()`**
- Fetches cart for guest or authenticated user
- Returns transformed cart data with items, prices

### Cart Model

The Cart dropin exposes a `CartModel` that can be configured with transformers:

```javascript
import { CartModel } from '@dropins/storefront-cart';

CartModel.configure({
  transformers: {
    cart: (graphqlData) => ({
      ...graphqlData,
      giftMessage: graphqlData.gift_message  // Transform GraphQL to payload format
    })
  }
});
```

### Event Listeners

Cart events can be subscribed to:

```javascript
// Listen for cart updates
cart.addEventListener('cart:updated', (event) => {
  console.log('Cart updated:', event.detail);
});
```

---

## Checkout Dropin (`@dropins/storefront-checkout`)

Handles checkout flow including:
- Delivery options
- Pickup options (BOPIS - Buy Online Pickup In Store)
- Payment method selection
- Order placement

---

## Integration with EDS Blocks

### Pattern 1: Dropin Inside EDS Block

```javascript
// blocks/user-profile/user-profile.js
import { getCustomer } from '@dropins/storefront-account';

export default async function decorate(block) {
  const customer = await getCustomer();
  
  block.innerHTML = `
    <div class="user-profile">
      <h2>Welcome, ${customer.firstname}!</h2>
      <p>${customer.email}</p>
    </div>
  `;
}
```

### Pattern 2: EDS Block Consuming Dropin Data

```javascript
// blocks/cart-summary/cart-summary.js
import { getCart } from '@dropins/storefront-checkout';

export default async function decorate(block) {
  const cart = await getCart();
  
  // Render cart using EDS block patterns
  block.innerHTML = renderCartItems(cart.items);
}
```

---

## State Sharing Between Dropins

Dropins can share state through:

1. **Shared authentication context** - Auth dropin provides token used by all other dropins
2. **Event bus** - Dropins emit events that others can listen to
3. **GraphQL backend** - All dropins query same backend, ensuring consistency

---

## Styling Dropins

**Question from research**: Can dropins be styled with custom CSS?

**Finding**: Yes, dropins expose CSS classes that can be overridden:
- Use standard CSS cascade to override dropin styles
- Dropins follow BEM-like naming conventions
- Design system tokens can be applied via CSS variables

```css
/* Override dropin button styles */
.dropin-auth .btn-primary {
  background: var(--color-brand-500);
  border-radius: var(--shape-border-radius-3);
}
```

---

## Server-Side vs. Client-Side Rendering

**Finding**: Dropins are **client-side** components that:
- Load and initialize in the browser
- Make GraphQL requests from client to Commerce backend
- Handle their own loading states
- Can be progressively enhanced

**EDS Consideration**: EDS pages are server-rendered HTML that load dropins client-side when needed.

---

## Gated Content / Authentication

For protecting pages that require authentication:

```javascript
// Check if user is authenticated
const isAuthenticated = checkAuthStatus();

if (!isAuthenticated) {
  // Redirect to login
  window.location.href = '/login?redirect=/account';
}
```

Authentication tokens are typically stored in cookies and automatically included in dropin requests.

---

## API Endpoints

All dropins connect to Adobe Commerce GraphQL endpoint:

```
https://your-commerce-instance.com/graphql
```

**Required Headers**:
- `Content-Type: application/json`
- `Store-Code: {your-store-code}` (for multi-store)
- `Authorization: Bearer {token}` (for authenticated requests)

---

## Production Considerations

### For BuildRight Demo

**Since we're mocking ACO**:
- We **won't use real dropins** initially (no Commerce backend)
- We'll **build mock services** that mimic dropin APIs
- We'll **design our code** so dropins can be swapped in later

### Migration Path to Real Dropins

1. **Phase 0-5**: Mock dropin functionality
2. **Phase 6-7**: Test with demo data
3. **Post-Launch**: Connect to real Commerce backend
4. **Swap**: Replace mock services with real dropin imports

---

## Recommendations for BuildRight

### Design System Alignment (Phase 2)

✅ **Align our design tokens with SDK tokens**:
```css
/* Map our tokens to dropin-compatible names */
--color-brand-500        → --dropin-color-brand-primary
--spacing-medium         → --dropin-spacing-md
--shape-border-radius-3  → --dropin-border-radius
```

Benefits:
- Seamless dropin integration later
- Consistent styling across custom blocks and dropins
- Easy rebranding

### Event System (Phase 3-7)

✅ **Use dropin event patterns in our mocks**:
```javascript
// Emit events with dropin naming convention
window.dispatchEvent(new CustomEvent('cart:updated', {
  detail: { items: [...], total: 100 }
}));

// Same pattern for auth, user, order events
window.dispatchEvent(new CustomEvent('auth:login', {
  detail: { user: {...} }
}));
```

Benefits:
- Code works with or without real dropins
- Easy swap when connecting to Commerce backend

### Slot-Like Patterns (Phase 4+)

✅ **Consider slot injection in our EDS blocks**:
```javascript
// block decoration with slots
export default function decorate(block) {
  // Core block rendering
  renderBlockContent(block);
  
  // Allow slot injection
  if (block.dataset.slot) {
    renderSlotContent(block, block.dataset.slot);
  }
}
```

Benefits:
- Extensible without editing core blocks
- Mirrors dropin slot system
- Easier future dropin integration

### Use Dropins For:
- ✅ **Authentication** (when connected to Commerce) - Clear, well-documented API
- ✅ **User Account** (when connected to Commerce) - Handles addresses, orders
- ✅ **Cart** (when connected to Commerce) - Complex state management handled

### Use EDS Blocks + Mock Services For:
- ✅ **Template selection** (Sarah) - Custom business logic
- ✅ **Project wizard** (Marcus) - Custom workflow
- ✅ **Package builder** (Lisa) - Custom UI
- ✅ **Deck builder** (David) - Custom wizard with CCDM
- ✅ **Restock dashboard** (Kevin) - Custom analytics

### Hybrid Approach:
- ✅ Use dropin **data models** as reference for our mocks
- ✅ Design mock APIs to match dropin signatures
- ✅ Enable easy swap to real dropins later

---

## Key Takeaways

1. **Dropins are pre-built NPM packages** for common commerce features
2. **They integrate with EDS** through initializer scripts and imports
3. **They use GraphQL** to connect to Adobe Commerce backend
4. **They manage their own state** and expose it via events and APIs
5. **They can be styled** with custom CSS
6. **For our demo**, we'll mock their functionality but design for eventual integration

---

## Next Steps

1. Review `BLOCK-VS-DROPIN-MATRIX.md` for component decisions
2. Design mock services that mirror dropin APIs (see `MOCK-ACO-API-SPEC.md`)
3. Plan authentication strategy that supports both demo and dropin modes

---

**Related Documents**:
- `DROPIN-INTEGRATION-GUIDE.md` - How to integrate with our app
- `BLOCK-VS-DROPIN-MATRIX.md` - Decision matrix
- `AUTH-STRATEGY.md` - Authentication approach
- `MOCK-ACO-API-SPEC.md` - Mock service design

**Sources**:
- Adobe Experience League: Commerce Storefront Documentation
- Context7: `/websites/experienceleague_adobe_developer_commerce_storefront`

