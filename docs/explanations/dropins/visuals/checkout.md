# Checkout Dropin

**What it does**: Handles the complete purchase flow - addresses, shipping, payment, and order placement
**Page**: `/checkout`

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CHECKOUT PAGE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER (simplified - no search, minimal navigation)                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ CHECKOUT                                                            ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  ┌──────────────────────────────────┬────────────────────────────┐  ║    │
│  ║  │ CHECKOUT STEPS                   │ ORDER SUMMARY              │  ║    │
│  ║  │                                  │                            │  ║    │
│  ║  │ ┌──────────────────────────────┐ │ ┌────────────────────────┐ │  ║    │
│  ║  │ │ 1. SHIPPING ADDRESS          │ │ │ Item 1          $149.99│ │  ║    │
│  ║  │ │                              │ │ │ Item 2           $79.99│ │  ║    │
│  ║  │ │ First Name    Last Name      │ │ │                        │ │  ║    │
│  ║  │ │ [___________] [___________]  │ │ │ Subtotal:       $229.98│ │  ║    │
│  ║  │ │                              │ │ │ Shipping:        $12.99│ │  ║    │
│  ║  │ │ Street Address               │ │ │ Tax:             $18.40│ │  ║    │
│  ║  │ │ [_________________________]  │ │ │ ────────────────────── │ │  ║    │
│  ║  │ │                              │ │ │ Total:          $261.37│ │  ║    │
│  ║  │ │ City          State   ZIP    │ │ └────────────────────────┘ │  ║    │
│  ║  │ │ [________] [____] [_____]    │ │                            │  ║    │
│  ║  │ │                              │ │                            │  ║    │
│  ║  │ │ ☐ Use as billing address     │ │                            │  ║    │
│  ║  │ └──────────────────────────────┘ │                            │  ║    │
│  ║  │                                  │                            │  ║    │
│  ║  │ ┌──────────────────────────────┐ │                            │  ║    │
│  ║  │ │ 2. SHIPPING METHOD           │ │                            │  ║    │
│  ║  │ │                              │ │                            │  ║    │
│  ║  │ │ ○ Standard (5-7 days) $12.99 │ │                            │  ║    │
│  ║  │ │ ○ Express (2-3 days)  $24.99 │ │                            │  ║    │
│  ║  │ │ ○ Next Day            $39.99 │ │                            │  ║    │
│  ║  │ └──────────────────────────────┘ │                            │  ║    │
│  ║  │                                  │                            │  ║    │
│  ║  │ ┌──────────────────────────────┐ │                            │  ║    │
│  ║  │ │ 3. PAYMENT METHOD            │ │                            │  ║    │
│  ║  │ │                              │ │                            │  ║    │
│  ║  │ │ Card Number                  │ │                            │  ║    │
│  ║  │ │ [____________________________│ │                            │  ║    │
│  ║  │ │                              │ │                            │  ║    │
│  ║  │ │ Expiry      CVV              │ │                            │  ║    │
│  ║  │ │ [MM/YY]     [___]            │ │                            │  ║    │
│  ║  │ └──────────────────────────────┘ │                            │  ║    │
│  ║  │                                  │                            │  ║    │
│  ║  │        [ Place Order ]           │                            │  ║    │
│  ║  │                                  │                            │  ║    │
│  ║  └──────────────────────────────────┴────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOOTER (minimal)                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Checkout Steps

### Step 1: Shipping Address

Customer enters where to ship the order:

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Customer's first name |
| Last Name | Yes | Customer's last name |
| Street Address | Yes | Delivery address |
| City | Yes | City name |
| State/Province | Yes | Dropdown selection |
| ZIP/Postal Code | Yes | Postal code |
| Country | Yes | Country selection |
| Phone | Optional | Contact number for delivery |

**"Use as billing address"** - Checkbox to copy shipping address to billing (checked by default).

### Step 2: Shipping Method

Customer selects delivery speed:

| Option | Typical Timing | Price Range |
|--------|----------------|-------------|
| Standard | 5-7 business days | $10-15 |
| Express | 2-3 business days | $20-30 |
| Next Day | 1 business day | $35-50 |

Shipping costs update in the Order Summary when selected.

### Step 3: Payment Method

Customer enters payment information:

| Field | Description |
|-------|-------------|
| Card Number | Credit/debit card number |
| Expiration | MM/YY format |
| CVV | 3-4 digit security code |
| Cardholder Name | Name as shown on card |

**Supported payment methods**: Visa, Mastercard, American Express, Discover

### Step 4: Place Order

The "Place Order" button:
1. Validates all fields
2. Processes payment
3. Creates order in system
4. Redirects to Order Confirmation page

---

## Order Summary (Right Sidebar)

Always visible during checkout:

| Section | Description |
|---------|-------------|
| **Items list** | Products in cart with prices |
| **Subtotal** | Sum of item prices |
| **Shipping** | Updates when method selected |
| **Tax** | Calculated based on shipping address |
| **Total** | Final amount to be charged |

---

## Checkout Flow

```
Cart Page
    │
    ▼
[ Proceed to Checkout ]
    │
    ▼
Enter Shipping Address
    │
    ▼
Select Shipping Method
(totals update)
    │
    ▼
Enter Payment Info
    │
    ▼
[ Place Order ]
    │
    ▼
Payment Processed
    │
    ▼
Order Confirmation Page
```

---

## Guest vs. Logged-In Checkout

| Feature | Guest | Logged In |
|---------|-------|-----------|
| Address entry | Manual entry required | Can use saved addresses |
| Payment | Manual entry required | Can use saved payment methods |
| Order tracking | Via email link + order number | In account dashboard |
| Account creation | Option to create after checkout | Already have account |

---

## BuildRight Customizations

| Component | Customization |
|-----------|---------------|
| **Form fields** | BuildRight input styling |
| **Shipping options** | BuildRight radio button design |
| **Order summary** | BuildRight card styling |
| **Place Order button** | BuildRight brand colors |
| **Validation messages** | Custom error styling |

---

## Error Handling

| Error Type | What Customer Sees |
|------------|-------------------|
| Invalid address | "Please enter a valid address" |
| Missing required field | Field highlighted, message shown |
| Payment declined | "Payment could not be processed. Please try another method." |
| System error | "Something went wrong. Please try again." |

---

## Related Pages

- [Cart](./cart.md) - Previous step in purchase flow
- [Order Confirmation](./order.md) - After successful checkout
- [Auth](./auth.md) - Sign in for faster checkout
