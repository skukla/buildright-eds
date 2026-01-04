# Order Dropin

**What it does**: Displays order confirmation after a successful purchase
**Page**: `/order-confirmation`

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORDER CONFIRMATION PAGE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER (simplified)                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ ORDER CONFIRMATION                                                  ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ SUCCESS HEADER                                                │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │                        ✓                                      │  ║    │
│  ║  │              Thank You for Your Order!                        │  ║    │
│  ║  │                  Order #12345                                 │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │   A confirmation email has been sent to your inbox.           │  ║    │
│  ║  │                                                               │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  ┌─────────────────────────────┬─────────────────────────────────┐  ║    │
│  ║  │ ITEMS ORDERED               │ ORDER SUMMARY                   │  ║    │
│  ║  │                             │                                 │  ║    │
│  ║  │ ┌───────┐                   │ Subtotal:              $379.97  │  ║    │
│  ║  │ │ [IMG] │ Product Name      │ Shipping:               $12.99  │  ║    │
│  ║  │ │       │ Qty: 2            │ Tax:                    $30.40  │  ║    │
│  ║  │ └───────┘ $149.99           │ ────────────────────────────    │  ║    │
│  ║  │                             │ Total:                 $423.36  │  ║    │
│  ║  │ ┌───────┐                   │                                 │  ║    │
│  ║  │ │ [IMG] │ Another Product   │                                 │  ║    │
│  ║  │ │       │ Qty: 1            │                                 │  ║    │
│  ║  │ └───────┘ $79.99            │                                 │  ║    │
│  ║  │                             │                                 │  ║    │
│  ║  └─────────────────────────────┴─────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ SHIPPING INFORMATION                                          │  ║    │
│  ║  │                                                               │  ║    │
│  ║  │ Ship To:                   Delivery Estimate:                 │  ║    │
│  ║  │ John Smith                 Standard Shipping (5-7 days)       │  ║    │
│  ║  │ 123 Main Street            Expected: January 10-12, 2026      │  ║    │
│  ║  │ Austin, TX 78701                                              │  ║    │
│  ║  │                                                               │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║                      [ Continue Shopping ]                          ║    │
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

### Success Header

The top section confirms the order was placed successfully:

| Element | Description |
|---------|-------------|
| **Checkmark icon** | Visual confirmation of success |
| **Thank you message** | "Thank You for Your Order!" |
| **Order number** | Unique order ID for reference |
| **Email confirmation** | Note that confirmation email was sent |

### Items Ordered

Shows what the customer purchased:

| Element | Description |
|---------|-------------|
| **Product image** | Thumbnail of each item |
| **Product name** | Full product title |
| **Quantity** | How many of each item |
| **Price** | Price paid for each item |

### Order Summary

Final cost breakdown:

| Element | Description |
|---------|-------------|
| **Subtotal** | Sum of all item prices |
| **Shipping** | Shipping cost charged |
| **Tax** | Tax based on shipping address |
| **Total** | Final amount charged to payment method |

### Shipping Information

Where the order is going:

| Element | Description |
|---------|-------------|
| **Ship To** | Full delivery address |
| **Shipping method** | Method selected (Standard, Express, etc.) |
| **Delivery estimate** | Expected arrival date range |

---

## What Happens After Order Placement

```
Customer clicks "Place Order" on Checkout
               │
               ▼
Payment processed successfully
               │
               ▼
Order created in system
               │
               ▼
Customer redirected to Order Confirmation
               │
               ▼
Confirmation email sent
               │
               ▼
Order visible in customer's Order History (if logged in)
```

---

## Guest vs. Logged-In Experience

| Feature | Guest | Logged In |
|---------|-------|-----------|
| See order confirmation | Yes | Yes |
| Receive email | Yes (entered at checkout) | Yes (from account) |
| Track order later | Via email link + order number | In account Order History |
| Reorder items | Must find products again | One-click reorder option |

---

## Order Status Tracking

After the confirmation page, customers can track their order:

| Status | Meaning |
|--------|---------|
| **Order Placed** | Order confirmed and in queue |
| **Processing** | Order being prepared |
| **Shipped** | Order on its way (tracking number provided) |
| **Out for Delivery** | Arriving today |
| **Delivered** | Order complete |

---

## BuildRight Customizations

| Component | Customization |
|-----------|---------------|
| **Success icon** | BuildRight checkmark styling |
| **Order summary** | BuildRight card design |
| **Item display** | BuildRight product card format |
| **Continue Shopping button** | BuildRight brand colors |

---

## Related Pages

- [Checkout](./checkout.md) - Previous step in purchase flow
- [Cart](./cart.md) - Where the purchase journey begins
- [Auth](./auth.md) - Logged-in users see orders in account

