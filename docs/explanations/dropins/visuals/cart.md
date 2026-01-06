# Cart Dropin

**What it does**: Displays and manages the shopping cart
**Page**: `/cart`

---

## Container/Slot Architecture

The Cart dropin uses the CartSummaryList container with several customizable slots:

### CartSummaryList Container

```
+-------------------------------------------------------------+
| CartSummaryList Container                                    |
| +----------------------------------------------------------+ |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | CartItem SLOT (repeats for each item)                 | | |
| | | +--------+  +-------------------------------------+   | | |
| | | | [IMG]  |  | Product Name                        |   | | |
| | | |        |  | SKU: ABC-123                        |   | | |
| | | +--------+  | $149.99       Qty: [-] 2 [+]        |   | | |
| | |             | Subtotal: $299.98          [Remove] |   | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | OrderSummary SLOT                                     | | |
| | | Subtotal:                                    $379.97  | | |
| | | Shipping:                            Calculated next  | | |
| | | Tax:                                 Calculated next  | | |
| | | ───────────────────────────────────────────────────── | | |
| | | Total:                                       $379.97  | | |
| | |                                                       | | |
| | |              [ Proceed to Checkout ]                  | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### EmptyCart State

```
+-------------------------------------------------------------+
| CartSummaryList Container (Empty State)                      |
| +----------------------------------------------------------+ |
| | EmptyCart SLOT                                            | |
| |                                                          | |
| |                    🛒 Your cart is empty                 | |
| |                                                          | |
| |         Browse our catalog to find what you need         | |
| |                                                          | |
| |                  [ Continue Shopping ]                    | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Slot Customization Summary

| Slot | Adobe Default | BuildRight Override | Level |
|------|---------------|---------------------|-------|
| **CartItem** | Default item layout | ❌ Using default | Level 1 |
| **EmptyCart** | Basic empty message | ❌ Using default | Level 1 |
| **OrderSummary** | Default totals | ❌ Using default | Level 1 |

**Note**: Cart uses **Level 1** customization (CSS styling only). Adobe's default UI is acceptable for the cart page.

---

## Full Page Layout

```
+-----------------------------------------------------------------------------+
|                              /cart (cart.html)                               |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | header (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +=======================================================================+  |
|  || cart-dropin (EDS Block)                                             ||  |
|  || Uses: @dropins/storefront-cart (DROPIN)                             ||  |
|  ||=====================================================================||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | CartSummaryList (CONTAINER)                                   |  ||  |
|  ||  |                                                               |  ||  |
|  ||  |  +----------------------------------------------------------+ |  ||  |
|  ||  |  | CartItem SLOT (repeats)                                  | |  ||  |
|  ||  |  | [Image] Product Name | Qty Controls | Subtotal | Remove  | |  ||  |
|  ||  |  +----------------------------------------------------------+ |  ||  |
|  ||  |                                                               |  ||  |
|  ||  |  +----------------------------------------------------------+ |  ||  |
|  ||  |  | OrderSummary SLOT                                        | |  ||  |
|  ||  |  | Subtotal | Shipping | Tax | Total | [Checkout Button]    | |  ||  |
|  ||  |  +----------------------------------------------------------+ |  ||  |
|  ||  |                                                               |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  +=======================================================================+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | footer (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Page Layout Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CART PAGE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ SHOPPING CART                                                       ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ CART ITEM                                                     │  ║    │
│  ║  │ ┌───────┐                                                     │  ║    │
│  ║  │ │ [IMG] │  Product Name                                       │  ║    │
│  ║  │ │       │  SKU: ABC-123                                       │  ║    │
│  ║  │ └───────┘  $149.99                                            │  ║    │
│  ║  │            Qty: [ - ]  2  [ + ]              Subtotal: $299.98│  ║    │
│  ║  │                                                      [Remove] │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ CART ITEM                                                     │  ║    │
│  ║  │ ┌───────┐                                                     │  ║    │
│  ║  │ │ [IMG] │  Another Product                                    │  ║    │
│  ║  │ │       │  SKU: XYZ-789                                       │  ║    │
│  ║  │ └───────┘  $79.99                                             │  ║    │
│  ║  │            Qty: [ - ]  1  [ + ]               Subtotal: $79.99│  ║    │
│  ║  │                                                      [Remove] │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ ORDER SUMMARY                                                 │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Subtotal (3 items):                              $379.97      │  ║    │
│  ║  │ Shipping:                                    Calculated next  │  ║    │
│  ║  │ Tax:                                         Calculated next  │  ║    │
│  ║  │ ─────────────────────────────────────────────────────────     │  ║    │
│  ║  │ Estimated Total:                                 $379.97      │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │              [ Proceed to Checkout ]                          │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOOTER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components Explained

### Cart Items

Each item in the cart displays:

| Element | Description |
|---------|-------------|
| **Product image** | Thumbnail of the product |
| **Product name** | Full product title |
| **SKU** | Product identifier |
| **Unit price** | Price per item |
| **Quantity controls** | +/- buttons to adjust quantity |
| **Line subtotal** | Unit price × quantity |
| **Remove button** | Delete item from cart |

### Order Summary

| Element | Description |
|---------|-------------|
| **Subtotal** | Sum of all item subtotals |
| **Shipping** | Shows "Calculated next" (determined at checkout) |
| **Tax** | Shows "Calculated next" (determined by shipping address) |
| **Estimated Total** | Current total before shipping/tax |
| **Checkout button** | Proceeds to checkout flow |

---

## Empty Cart State

When the cart has no items:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    🛒 Your cart is empty                      │
│                                                               │
│         Browse our catalog to find what you need              │
│                                                               │
│                  [ Continue Shopping ]                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Mini-Cart (Header)

A compact cart preview appears in the header:

| Feature | Description |
|---------|-------------|
| **Cart icon** | Shows item count badge |
| **Hover/click** | Opens dropdown with recent items |
| **Quick view** | Shows last 3 items added |
| **View Cart** | Link to full cart page |
| **Checkout** | Direct link to checkout |

---

## Cart Actions

| Action | What Happens |
|--------|--------------|
| **Add to Cart** (from catalog) | Item appears in cart, mini-cart updates |
| **Update quantity** | Line subtotal and total recalculate |
| **Remove item** | Item removed, totals update |
| **Proceed to Checkout** | Navigates to checkout page |

---

## BuildRight Customizations

| Component | Customization |
|-----------|---------------|
| **Cart items** | BuildRight card styling, price format |
| **Empty state** | Custom icon and messaging |
| **Checkout button** | BuildRight brand colors |
| **Mini-cart** | Compact BuildRight styling |

---

## Data Flow

```
Customer adds item to cart
         │
         ▼
Cart dropin sends request to API Mesh
         │
         ▼
Mesh routes to Adobe Commerce (Magento)
         │
         ▼
Commerce creates/updates cart
         │
         ▼
Updated cart data returns to dropin
         │
         ▼
Cart UI updates (item count, totals)
```

---

## Related Pages

- [Product Discovery](./product-discovery.md) - Where customers add items to cart
- [Checkout](./checkout.md) - Next step after cart
