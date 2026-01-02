# BuildRight Dropin Implementation Guide

**Purpose**: Show how BuildRight uses Adobe dropins with custom design  
**Audience**: Non-technical stakeholders  
**Date**: December 19, 2025

---

## What Are Dropins?

**Dropins** = Pre-built UI components from Adobe that handle complex commerce functionality

**Containers** = The dropin component itself (e.g., `SignIn`, `MiniCart`, `Checkout`)

**Slots** = Customization points where we inject BuildRight's custom HTML/design

---

## BuildRight's Approach

```
┌─────────────────────────────────────────────────────────────┐
│ Adobe Dropin Container                                      │
│ • Handles data fetching, updates, and logic                 │
│ • We configure with routes and options                      │
├─────────────────────────────────────────────────────────────┤
│ BuildRight Custom Design (via Slots)                        │
│ • Our HTML templates                                        │
│ • Our CSS styling                                           │
│ • Our branding                                              │
└─────────────────────────────────────────────────────────────┘
```

**Result**: Adobe's functionality + BuildRight's design

---

## Three Implementation Patterns

### Level 1: Adobe's Default UI
**When**: Adobe's design is acceptable  
**Customization**: Configuration options only (routes, callbacks)  
**Slots**: None needed  
**Examples**: Auth forms, Cart page, Checkout page

```
┌──────────────────────────┐
│ Adobe Container          │
│ ┌──────────────────────┐ │
│ │ Adobe's Default UI   │ │
│ └──────────────────────┘ │
│ • We configure routes    │
│ • We configure behavior  │
└──────────────────────────┘
```

---

### Level 2: Custom Design via Slots
**When**: Need BuildRight-specific design  
**Customization**: Configuration + Custom slots  
**Slots**: 4-5 slots used  
**Examples**: Mini Cart, PLP (Product Listing Page)

```
┌──────────────────────────────────────┐
│ Adobe Container                      │
│ ┌──────────────────────────────────┐ │
│ │ Slot 1: BuildRight HTML          │ │
│ │ Slot 2: BuildRight HTML          │ │
│ │ Slot 3: BuildRight HTML          │ │
│ │ Slot 4: BuildRight HTML          │ │
│ └──────────────────────────────────┘ │
│ • Adobe handles data & updates       │
│ • We provide HTML templates          │
└──────────────────────────────────────┘
```

---

### Level 3: Fully Custom
**When**: No suitable Adobe container exists  
**Customization**: Custom HTML + Adobe APIs  
**Slots**: N/A  
**Examples**: User Menu (no container available)

```
┌──────────────────────────┐
│ BuildRight Custom HTML   │
│ • We create structure    │
│ • We call Adobe APIs     │
│ • We handle updates      │
└──────────────────────────┘
```

---

## Implementation Overview

| Component | Pattern | Container | Slots | Why |
|-----------|---------|-----------|-------|-----|
| **Auth Forms** | Level 1 | `SignIn`, `SignUp` | 0 | Default UI works |
| **Cart Page** | Level 1 | `CartSummaryList` | 0 | Default UI works |
| **Mini Cart** | Level 2 | `MiniCart` | 4 | Custom header design |
| **Product Listing** | Level 2 | `ProductList`, `Facets` | 5 | Custom product tiles |
| **Shopping Cart** | Level 2 | `CartSummaryList` | 5 | Custom 2-col layout |
| **User Menu** | Level 3 | None | N/A | No container exists |

---

## Visual Examples

### Example 1: Mini Cart (Level 2)

**What Adobe Provides**: `MiniCart` container

**What We Customize**: 4 slots

```
┌────────────────────────────────────────────────┐
│ MINICART CONTAINER (Adobe)                     │
├────────────────────────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SLOT: Heading (BuildRight custom)         ┃  │
│ ┃ ┌──────────────────────────────────────┐  ┃  │
│ ┃ │ Shopping Cart             [X]        │  ┃  │
│ ┃ │ 3 items                              │  ┃  │
│ ┃ └──────────────────────────────────────┘  ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SLOT: CartItem (BuildRight custom)        ┃  │
│ ┃ ┌──────────────────────────────────────┐  ┃  │
│ ┃ │ [IMG] Product Name            [X]    │  ┃  │
│ ┃ │       Qty: 2          $29.99         │  ┃  │
│ ┃ └──────────────────────────────────────┘  ┃  │
│ ┃ ┌──────────────────────────────────────┐  ┃  │
│ ┃ │ [IMG] Product Name            [X]    │  ┃  │
│ ┃ │       Qty: 1          $15.00         │  ┃  │
│ ┃ └──────────────────────────────────────┘  ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SLOT: Footer (BuildRight custom)          ┃  │
│ ┃ ┌──────────────────────────────────────┐  ┃  │
│ ┃ │ Subtotal             $74.98          │  ┃  │
│ ┃ │ ┌────────────┐  ┌─────────────────┐  │  ┃  │
│ ┃ │ │ View Cart  │  │    Checkout     │  │  ┃  │
│ ┃ │ └────────────┘  └─────────────────┘  │  ┃  │
│ ┃ └──────────────────────────────────────┘  ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└────────────────────────────────────────────────┘

Adobe Handles:
✓ Fetching cart data
✓ Updating totals
✓ Removing items
✓ Event synchronization

BuildRight Provides:
✓ Header HTML (title, count, close button)
✓ Item HTML (layout, styling)
✓ Footer HTML (buttons, subtotal)
```

---

### Example 2: Product Listing (Level 2)

**What Adobe Provides**: `ProductList` + `Facets` containers

**What We Customize**: 5 slots

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CATEGORY LANDING PAGE                                                                  │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ SIDEBAR         │ MAIN CONTENT                                                         │
│                 │                                                                      │
│ ┏━━━━━━━━━━━━┓  │                                                                      │
│ ┃   FACETS   ┃  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓      │
│ ┃   (Adobe)  ┃  │  ┃ PRODUCTLIST CONTAINER (Adobe)                              ┃      │
│ ┃            ┃  │  ┃                                                            ┃      │
│ ┃ ┌────────┐ ┃  │  ┃  ┌──────────────────────────────────────────────────────┐  ┃      │
│ ┃ │  SLOT  │ ┃  │  ┃  │ SLOT: ProductCard (BuildRight custom)                │  ┃      │
│ ┃ │        │ ┃  │  ┃  │                                                      │  ┃      │
│ ┃ │  Mfr   │ ┃  │  ┃  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │  ┃      │
│ ┃ │  ☐ ABC │ ┃  │  ┃  │  │  GOLD★   │  │  SILV★   │  │          │  │       │ │  ┃      │
│ ┃ │  ☐ XYZ │ ┃  │  ┃  │  │  [IMG]   │  │  [IMG]   │  │  [IMG]   │  │ [IMG] │ │  ┃      │
│ ┃ │        │ ┃  │  ┃  │  │          │  │          │  │          │  │       │ │  ┃      │
│ ┃ │  Grade │ ┃  │  ┃  │  │  Name    │  │  Name    │  │  Name    │  │ Name  │ │  ┃      │
│ ┃ │  ☐ #1  │ ┃  │  ┃  │  │  SKU     │  │  SKU     │  │  SKU     │  │ SKU   │ │  ┃      │
│ ┃ │  ☐ #2  │ ┃  │  ┃  │  │  Mfg     │  │  Mfg     │  │  Mfg     │  │ Mfg   │ │  ┃      │
│ ┃ │        │ ┃  │  ┃  │  │  $9.99   │  │  $12.00  │  │  $15.00  │  │ $45   │ │  ┃      │
│ ┃ └────────┘ ┃  │  ┃  │  └──────────┘  └──────────┘  └──────────┘  └───────┘ │  ┃      │
│ ┃            ┃  │  ┃  │                                                      │  ┃      │
│ ┃ BuildRight ┃  │  ┃  └──────────────────────────────────────────────────────┘  ┃      │
│ ┃    HTML    ┃  │  ┃                                                            ┃      │
│ ┗━━━━━━━━━━━━┛  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛      │
│                 │                                                                      │
└─────────────────┴──────────────────────────────────────────────────────────────────────┘

Adobe ProductList Handles:
✓ Fetching products from catalog
✓ Infinite scroll
✓ Loading states
✓ Empty states

BuildRight ProductCard Slot Provides:
✓ Tier badges (GOLD, SILVER)
✓ Manufacturer display
✓ Grade indicators
✓ Custom styling
```

---

### Example 3: Shopping Cart (Level 2)

**What Adobe Provides**: `CartSummaryList` container

**What We Customize**: Custom 2-column layout + 5 slots

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Shopping Cart                                                 [BuildRight Logo]     │
├──────────────────────────────────────┬──────────────────────────────────────────────┤
│ LEFT: CART ITEMS                     │ RIGHT: ORDER SUMMARY                         │
│                                      │                                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ┌──────────────────────────────────────┐     │
│ ┃ CARTSUMMARYLIST (Adobe)          ┃ │ │ Order Summary                        │     │
│ ┃                                  ┃ │ │                                      │     │
│ ┃ ┌──────────────────────────────┐ ┃ │ ├──────────────────────────────────────┤     │
│ ┃ │SLOT: CartItem (custom)       │ ┃ │ │ Subtotal:            $700.00         │     │
│ ┃ │ ┌─────┐                      │ ┃ │ │                                      │     │
│ ┃ │ │[IMG]│ 2x4 Studs         [X]│ ┃ │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │     │
│ ┃ │ └─────┘ SKU: BR-2X4-8     $10│ ┃ │ │ ┃ SLOT: PromoCode (custom)       ┃   │     │
│ ┃ │         Qty: [-][50][+] $500 │ ┃ │ │ ┃ ┌──────────────────────────┐   ┃   │     │
│ ┃ └──────────────────────────────┘ ┃ │ │ ┃ │ [Enter Code]   [Apply]   │   ┃   │     │
│ ┃                                  ┃ │ │ ┃ └──────────────────────────┘   ┃   │     │
│ ┃ ┌──────────────────────────────┐ ┃ │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │     │
│ ┃ │SLOT: CartItem (custom)       │ ┃ │ │                                      │     │
│ ┃ │ ┌─────┐                      │ ┃ │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │     │
│ ┃ │ │[IMG]│ Plywood           [X]│ ┃ │ │ ┃ SLOT: TierSavings (custom)     ┃   │     │
│ ┃ │ └─────┘ SKU: BR-PLY-4X8   $20│ ┃ │ │ ┃ 🏆 Tier Savings:    -$50.00    ┃   │     │
│ ┃ │         Qty: [-][10][+] $200 │ ┃ │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │     │
│ ┃ └──────────────────────────────┘ ┃ │ │                                      │     │
│ ┃                                  ┃ │ │ Shipping:            Free 🚚         │     │
│ ┃ ┌──────────────────────────────┐ ┃ │ │ Tax (est.):          $52.50          │     │
│ ┃ │SLOT: EmptyCart (custom)      │ ┃ │ ├──────────────────────────────────────┤     │
│ ┃ │ [Shows when cart is empty]   │ ┃ │ │ Total:               $702.50         │     │
│ ┃ └──────────────────────────────┘ ┃ │ │                                      │     │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ ┌──────────────────────────────────────┐     │
│                                      │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │     │
│                                      │ │ ┃ SLOT: CheckoutButton (custom)  ┃   │     │
│                                      │ │ ┃ ┌──────────────────────────┐   ┃   │     │
│                                      │ │ ┃ │   [Proceed to Checkout]  │   ┃   │     │
│                                      │ │ ┃ └──────────────────────────┘   ┃   │     │
│                                      │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │     │
│                                      │ └──────────────────────────────────────┘     │
└──────────────────────────────────────┴──────────────────────────────────────────────┘

Adobe Cart Handles:
✓ Cart data & updates
✓ Quantity management
✓ Item removal
✓ Price calculations

BuildRight Provides:
✓ Custom 2-column layout
✓ Custom cart item cards (slot)
✓ Promo code section (slot)
✓ Tier savings display (slot)
✓ Branded checkout button (slot)
✓ Empty cart state (slot)
```

---

## Summary by Dropin

### 🟢 Level 1: Adobe's Default UI (2 dropins)

#### **Authentication**
- **Container**: `SignIn`, `SignUp`, `ResetPassword`
- **Slots**: 0
- **Config**: Routes, callbacks
- **Why**: Adobe's forms are professional and functional

#### **Cart Page**
- **Container**: `CartSummaryList`
- **Slots**: 0
- **Config**: Routes, feature flags
- **Why**: Adobe's cart UI is comprehensive

---

### 🟡 Level 2: Custom Design via Slots (3 dropins)

#### **Mini Cart**
- **Container**: `MiniCart`
- **Slots**: 4 (Heading, EmptyCart, CartItem, Footer)
- **Config**: 7 options
- **Why**: Header dropdown needs BuildRight branding

**Slots Used**:
1. `Heading` - Custom title, count, close button
2. `EmptyCart` - Custom icon and message
3. `CartItem` - Custom item layout and styling
4. `Footer` - Custom subtotal and buttons

---

#### **Product Listing (PLP)**
- **Container**: `ProductList`, `Facets`
- **Slots**: 5 (ProductCard, EmptyState, LoadingState, FacetGroup, FacetOption)
- **Config**: 3+ options
- **Why**: Need to show tier badges, manufacturer, grade

**Slots Used**:
1. `ProductCard` - Custom product tile with BuildRight attributes
2. `EmptyState` - Custom "no results" message
3. `LoadingState` - Custom loading spinner
4. `FacetGroup` - Custom filter section styling
5. `FacetOption` - Custom checkbox styling

---

#### **Shopping Cart**
- **Container**: `CartSummaryList`
- **Slots**: 5 (CartItem, EmptyCart, PromoCode, TierSavings, CheckoutButton)
- **Config**: Routes, quantity controls
- **Layout**: Custom 2-column BuildRight design
- **Why**: Need BuildRight branded experience with tier savings

**Slots Used**:
1. `CartItem` - Custom card design with image, qty controls, remove
2. `EmptyCart` - Custom empty state with CTA
3. `PromoCode` - Custom promo code input section
4. `TierSavings` - Custom tier discount display with badge
5. `CheckoutButton` - Branded checkout button

---

### 🔴 Level 3: Fully Custom (1 dropin)

#### **User Menu**
- **Container**: None (no suitable container exists)
- **Slots**: N/A
- **Approach**: Custom HTML + Adobe auth APIs
- **Why**: Adobe doesn't provide a user menu container

---

## Benefits of This Approach

### For Development

| Benefit | Description |
|---------|-------------|
| **Less Code** | 35-66% reduction vs. fully custom |
| **Automatic Updates** | Adobe handles data, events, state |
| **Built-in Features** | Loading, errors, empty states included |
| **Faster Development** | Focus on design, not logic |

### For Business

| Benefit | Description |
|---------|-------------|
| **Reduced Maintenance** | Adobe maintains the logic |
| **Future Features** | New commerce features come free |
| **Reliability** | Adobe tests and supports the code |
| **Flexibility** | Can customize design via slots |

### For Users

| Benefit | Description |
|---------|-------------|
| **BuildRight Design** | Same branding and look-and-feel |
| **Better Performance** | Adobe-optimized functionality |
| **Reliability** | Tested commerce logic |
| **Consistent Experience** | Same across all pages |

---

## Key Metrics

### Code Efficiency

| Metric | Before (Fully Custom) | After (Dropin + Slots) | Improvement |
|--------|-----------------------|------------------------|-------------|
| **Mini Cart Lines** | ~308 | ~200 | 35% reduction |
| **Manual Logic Lines** | ~200 | ~50 | 75% reduction |
| **Maintenance Burden** | High | Low | Significant |

### Pattern Distribution

| Pattern | Count | Percentage | Examples |
|---------|-------|------------|----------|
| **Level 1** (Default UI) | 2 | 33% | Auth, Checkout |
| **Level 2** (Custom Slots) | 3 | 50% | Mini Cart, PLP, Shopping Cart |
| **Level 3** (Fully Custom) | 1 | 17% | User Menu |

---

## Quick Reference: What Each Pattern Means

### Level 1: Adobe's UI = Good Enough ✅
**What we do**: Configure routes and behavior  
**What Adobe does**: Everything else  
**Result**: Fast implementation, minimal maintenance

### Level 2: BuildRight Design Required 🎨
**What we do**: Provide HTML templates via slots  
**What Adobe does**: Data, events, updates, logic  
**Result**: Custom design + automatic functionality

### Level 3: No Container Available 🔧
**What we do**: Build everything (HTML + logic)  
**What Adobe does**: Provide APIs we call  
**Result**: Complete control, more maintenance

---

## Conclusion

**BuildRight's dropin strategy**:
1. Use Adobe's default UI when acceptable (33% of cases)
2. Use slots for custom design when needed (50% of cases)
3. Build custom only when no container exists (17% of cases)

**Result**: Fast development, low maintenance, BuildRight design, Adobe reliability

---

**Document Version**: 1.0  
**Date**: December 19, 2025  
**Audience**: Non-technical stakeholders
