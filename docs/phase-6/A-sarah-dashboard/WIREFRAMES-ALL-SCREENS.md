# Phase 6A Wireframes: All 3 Screens

**Date**: December 2, 2025  
**Design Sprint - Day 1**: Lightweight wireframes for user review  
**Status**: Draft for review

---

## 📋 Overview

This document contains wireframes for all 3 screens in Sarah's workflow:
1. **Build Configurator** - Select variants, packages, phases
2. **BOM Review** - Review generated bill of materials
3. **My Builds Dashboard** - Manage active builds

---

## 🎨 Screen 1: Build Configurator

### Purpose
Allow Sarah to quickly configure a build by selecting:
- Optional floor plan features (variants)
- Material package (subdivision-required)
- Construction phases to order

### Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Templates                    BuildRight   [User Menu]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Configure Build: The Sedona                         House #47  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Base Configuration                                             │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ [Photo: Sedona exterior]    The Sedona                  │   │
│ │ 150x100px                    2,450 sq ft • 3BR/2BA      │   │
│ │                              Base Price: $225,000        │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Optional Floor Plan Features                                   │
│ Click photos to add features (can select multiple):            │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │              │  │              │  │              │         │
│ │ [Photo:      │  │ [Photo:      │  │ [Photo:      │         │
│ │  Bonus room  │  │  3-car       │  │  Covered     │         │
│ │  interior]   │  │  garage]     │  │  patio]      │         │
│ │              │  │              │  │              │         │
│ │ 280x240px    │  │ 280x240px    │  │ 280x240px    │         │
│ │              │  │              │  │              │         │
│ │──────────────│  │──────────────│  │──────────────│         │
│ │ Bonus Room   │  │ 3-Car Garage │  │ Covered Patio│         │
│ │ 200 sq ft    │  │ Extends 12ft │  │ 12x16 space  │         │
│ │ +$15,000     │  │ +$8,000      │  │ +$12,000     │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
│   Gray border       Gray border      Gray border             │
│   (clickable)       (clickable)      (clickable)             │
│                                                                 │
│   [When clicked: Green border + ✓ badge in top-right]         │
│                                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Material Package (required)                                    │
│ Select one:                                                    │
│                                                                 │
│ ┌──────────────────────┐  ┌──────────────────────┐           │
│ │ Builder's Choice     │  │ ● Desert Ridge       │           │
│ │                      │  │   Premium            │           │
│ │ Standard materials   │  │                      │           │
│ │                      │  │ Upgraded materials   │           │
│ │                      │  │                      │           │
│ │ • Standard windows   │  │ • Pella windows      │           │
│ │ • Comp shingles      │  │ • Tile roof          │           │
│ │ • Vinyl siding       │  │ • Fiber cement       │           │
│ │                      │  │                      │           │
│ │ Base Price           │  │ +$18,000             │           │
│ │                      │  │                      │           │
│ │ [Select]             │  │ [✓ Selected]         │           │
│ └──────────────────────┘  └──────────────────────┘           │
│   Gray border             GREEN border                        │
│                           (required for Desert Ridge)         │
│                                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Construction Phases                                            │
│ Select which phases to order materials for:                   │
│                                                                 │
│ ☑ Foundation & Framing        Est. $45,234                    │
│ ☑ Building Envelope           Est. $37,993                    │
│ ☐ Interior Finish             Est. $28,500                    │
│                                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Order Summary                                                  │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Base:                                        $225,000    │   │
│ │ Package (Desert Ridge Premium):              +$18,000   │   │
│ │ Optional Features:                           $0         │   │
│ │ ─────────────────────────────────────────────────────── │   │
│ │ Estimated Total:                             $243,000   │   │
│ │                                                          │   │
│ │ Materials for 2 phases selected                         │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Cancel]                              [Generate BOM →]         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Key Interactions

**Photo Tiles (Variants)**:
- Click to select (green border, ✓ badge)
- Click again to deselect
- Multiple selections allowed
- Cost updates in real-time

**Package Cards**:
- Radio button selection (only one)
- Desert Ridge Premium pre-selected (required)
- Shows feature comparison

**Phase Checkboxes**:
- Standard checkboxes
- At least 1 must be selected
- Cost estimates shown per phase

**Generate BOM Button**:
- Validates selections
- Shows loading overlay ("Generating BOM...")
- Navigates to BOM Review screen

---

## 📊 Screen 2: BOM Review

### Purpose
Display generated BOM grouped by construction phase, showing:
- Product line items with quantities and prices
- Package overrides (★ premium products)
- Category sub-groups
- Total cost breakdown

### Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Configure                 BuildRight   [User Menu]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Bill of Materials: The Sedona #47                              │
│ Desert Ridge Premium • Standard • 2 Phases Selected            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Total Cost: $83,227.09                                  │   │
│ │ Generated: Dec 2, 2025 at 2:30 PM                       │   │
│ │ 4 premium upgrades applied                              │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ▼ Phase 1: Foundation & Framing          $45,234.00 (54%)     │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Concrete & Foundation                                   │   │
│ │   • Ready-mix Concrete 3000 PSI    18 CY × $145.00      │   │
│ │   • Rebar #4 Grade 60              42 EA × $8.50        │   │
│ │   • Anchor Bolts 5/8" × 10"        48 EA × $2.25        │   │
│ │                                                          │   │
│ │ Framing Lumber                                          │   │
│ │   • 2x4 x 8' Kiln-Dried Stud      485 EA × $3.50        │   │
│ │     Brand: BuildMaster • Species: Spruce-Pine-Fir       │   │
│ │   • 2x6 x 8' Kiln-Dried Stud      218 EA × $5.75        │   │
│ │   • 2x10 x 12' Framing Lumber      64 EA × $18.50       │   │
│ │                                                          │   │
│ │ Fasteners & Hardware                                    │   │
│ │   • Framing Nails 16d              10 LB × $12.00       │   │
│ │   • Simpson Strong-Tie Brackets    24 EA × $8.50        │   │
│ │                                                          │   │
│ │ [+ 12 more items...]                                    │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ▼ Phase 2: Building Envelope             $37,993.09 (46%)     │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Windows & Doors                                          │   │
│ │   • Pella 350 Series Double-Hung   14 EA × $425.00      │   │
│ │     ★ Premium Package Override                          │   │
│ │     Brand: Pella • Energy Star Rated                    │   │
│ │   • Premium Entry Door Steel        1 EA × $385.00      │   │
│ │     ★ Premium Package Override                          │   │
│ │                                                          │   │
│ │ Roofing                                                  │   │
│ │   • Concrete Tile Roofing          24 SQ × $180.00      │   │
│ │     ★ Premium Package Override                          │   │
│ │   • Roofing Underlayment           26 SQ × $45.00       │   │
│ │                                                          │   │
│ │ Siding & Trim                                            │   │
│ │   • Fiber Cement Siding           2450 SF × $4.50       │   │
│ │     ★ Premium Package Override                          │   │
│ │   • Trim Boards 1x4                180 LF × $2.25       │   │
│ │                                                          │   │
│ │ [+ 18 more items...]                                    │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ○ Phase 3: Interior Finish                Not Selected         │
│                                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Metadata                                                       │
│ • 4 SKU overrides applied (Desert Ridge Premium package)      │
│ • Generated at: Dec 2, 2025 10:30 AM                          │
│ • Valid for 30 days                                           │
│                                                                 │
│ [← Edit Configuration]  [Print BOM]  [Add All to Cart →]      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Key Interactions

**Phase Accordion**:
- Click phase header to expand/collapse
- Shows cost and percentage
- All phases expanded by default

**Category Sub-Groups**:
- Visual hierarchy (indented)
- Bold category headers
- Products listed underneath

**Product Line Items**:
- Show: Name, Quantity, Unit, Price
- Show: Brand, specs (if available)
- ★ icon for package overrides

**Action Buttons**:
- "Edit Configuration" → Returns to configurator
- "Print BOM" → Print-friendly view
- "Add All to Cart" → Adds all items to cart, navigates to cart

---

## 📂 Screen 3: My Builds Dashboard

### Purpose
Display Sarah's active builds, order history, and quick actions for:
- Viewing build status
- Ordering next phase
- Cloning builds for similar houses

### Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ BuildRight                                        [User Menu]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ My Builds                                      [+ New Build]    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Filters: [All Builds ▾] [All Templates ▾] [All Status ▾]      │
│                                                                 │
│ Active Builds (3)                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #47 • The Sedona                   Status: Framing│   │
│ │ Bonus Room • Desert Ridge Premium                       │   │
│ │ Desert Ridge Subdivision • Lot 47                       │   │
│ │                                                          │   │
│ │ Materials Ordered:                                       │   │
│ │ ✓ Foundation & Framing    $45,234  Ordered Nov 28      │   │
│ │ ✓ Building Envelope       $37,993  Ordered Dec 1       │   │
│ │ ○ Interior Finish         --       Not ordered yet      │   │
│ │                                                          │   │
│ │ Total Spent: $83,227 of $111,727 estimated              │   │
│ │ ████████████░░░░░░░░ 75%                                │   │
│ │                                                          │   │
│ │ [Order Next Phase →] [View BOM] [Clone Build]          │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #48 • The Sedona                   Status: New    │   │
│ │ Standard • Builder's Choice                             │   │
│ │ Sunset Valley Subdivision • Lot 22                      │   │
│ │                                                          │   │
│ │ Materials Ordered:                                       │   │
│ │ ○ Foundation & Framing    --       Not ordered yet      │   │
│ │ ○ Building Envelope       --       Not ordered yet      │   │
│ │ ○ Interior Finish         --       Not ordered yet      │   │
│ │                                                          │   │
│ │ Total Spent: $0 of $225,000 estimated                   │   │
│ │ ░░░░░░░░░░░░░░░░░░░░ 0%                                │   │
│ │                                                          │   │
│ │ [Order Materials →] [Edit Configuration] [Delete]       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #49 • The Prescott                Status: Planning│   │
│ │ Bonus Room • Desert Ridge Premium                       │   │
│ │ Desert Ridge Subdivision • Lot 49                       │   │
│ │                                                          │   │
│ │ Materials Ordered:                                       │   │
│ │ ○ Foundation & Framing    --       Not ordered yet      │   │
│ │ ○ Building Envelope       --       Not ordered yet      │   │
│ │ ○ Interior Finish         --       Not ordered yet      │   │
│ │                                                          │   │
│ │ Total Spent: $0 of $246,500 estimated                   │   │
│ │ ░░░░░░░░░░░░░░░░░░░░ 0%                                │   │
│ │                                                          │   │
│ │ [Order Materials →] [Edit Configuration] [Delete]       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│ Recently Completed (2)                         [View All →]    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #45 • The Sedona          Completed: Nov 15, 2025 │   │
│ │ Standard • Desert Ridge Premium                         │   │
│ │ Total Cost: $243,000                                    │   │
│ │                                                          │   │
│ │ [View BOM] [Clone for New Build]                       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #46 • The Sedona          Completed: Nov 22, 2025 │   │
│ │ Bonus Room • Desert Ridge Premium                       │   │
│ │ Total Cost: $258,000                                    │   │
│ │                                                          │   │
│ │ [View BOM] [Clone for New Build]                       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Key Interactions

**Build Cards**:
- Show build name, template, configuration
- Show order status per phase (✓ ordered, ○ pending)
- Show progress bar (% of total cost spent)
- Quick actions vary by status

**Quick Actions**:
- "Order Next Phase" → Opens phase selector modal
- "View BOM" → Shows saved BOM
- "Clone Build" → Copies configuration, prompts for new name/lot
- "Edit Configuration" → Returns to configurator
- "Delete" → Confirms, then deletes build

**Filters**:
- Filter by status (All, Active, Planning, Completed)
- Filter by template (All, Sedona, Prescott, etc.)
- Filters update card list in real-time

**Empty State** (if no builds):
```
┌─────────────────────────────────────────┐
│              📋                         │
│                                         │
│     No builds yet                       │
│                                         │
│     Start your first build by          │
│     selecting a template.               │
│                                         │
│     [Browse Templates →]                │
└─────────────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

```
┌─────────────────┐
│ 1. Templates    │  Sarah logs in
│    Dashboard    │  Sees 6 templates
│    (existing)   │  Clicks "Start New Build" on Sedona
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Build        │  SELECT:
│    Configurator │  • Variants: Bonus Room (+$15K) ✓
│    (NEW)        │  • Package: Desert Ridge Premium (+$18K) ●
│                 │  • Phases: Foundation ✓, Envelope ✓
│                 │  
│                 │  Total: $258,000
│                 │  Clicks "Generate BOM"
└────────┬────────┘
         │
         │ [Loading: 2-3 sec]
         │ Backend generates BOM via buildright-service
         │
         ▼
┌─────────────────┐
│ 3. BOM Review   │  REVIEW:
│    (NEW)        │  • Phase 1: Foundation & Framing ($45K)
│                 │    - Concrete, lumber, fasteners...
│                 │  • Phase 2: Building Envelope ($38K)
│                 │    - ★ Pella windows (premium override)
│                 │    - ★ Tile roof (premium override)
│                 │  
│                 │  Clicks "Add All to Cart"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Cart/        │  Standard e-commerce flow
│    Checkout     │  Review, submit order
│    (existing)   │  
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. My Builds    │  Build saved to dashboard
│    Dashboard    │  Shows:
│    (NEW)        │  • House #47 (Sedona, Bonus Room)
│                 │  • ✓ Foundation ordered Nov 28
│                 │  • ✓ Envelope ordered Dec 1
│                 │  • ○ Interior pending
│                 │  
│                 │  Quick Actions:
│                 │  • Order Next Phase
│                 │  • Clone for House #48
└─────────────────┘
```

### Flow Variations

**Scenario A: Order All Phases at Once**
```
Configurator → Select all 3 phases → BOM Review → Cart → Complete
```

**Scenario B: Phase-by-Phase Ordering**
```
Week 1: Configurator → Select Phase 1 → BOM → Cart → Order
Week 4: My Builds → Order Next Phase → Select Phase 2 → BOM → Cart
Week 7: My Builds → Order Next Phase → Select Phase 3 → BOM → Cart
```

**Scenario C: Clone Previous Build**
```
My Builds → Find House #47 → Clone Build → 
  Configurator (pre-filled) → Adjust if needed → Generate BOM
```

---

## 📐 Layout Patterns

### Configurator Layout
```
┌─────────────────────────────────────┐
│ Header (breadcrumbs, user menu)     │
├─────────────────────────────────────┤
│                                     │
│ Page Title                          │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Base Configuration (compact)    ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Variants (photo tile grid)      ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Packages (comparison cards)     ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Phases (checkboxes)             ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Summary (sticky on scroll)      ││
│ └─────────────────────────────────┘│
│                                     │
│ [Cancel]           [Generate BOM]  │
│                                     │
└─────────────────────────────────────┘
```

### BOM Review Layout
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Summary Card (cost, metadata)       │
├─────────────────────────────────────┤
│                                     │
│ ▼ Phase 1: Foundation & Framing    │
│   [Line items accordion content]   │
│                                     │
│ ▼ Phase 2: Building Envelope       │
│   [Line items accordion content]   │
│                                     │
│ ○ Phase 3: Interior (not selected) │
│                                     │
├─────────────────────────────────────┤
│ [Actions: Edit, Print, Add to Cart]│
└─────────────────────────────────────┘
```

### My Builds Layout
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Page Title + [+ New Build]          │
│ Filters                             │
├─────────────────────────────────────┤
│                                     │
│ Active Builds (3)                   │
│ ┌─────────────────────────────────┐│
│ │ Build Card                      ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Build Card                      ││
│ └─────────────────────────────────┘│
│                                     │
│ Recently Completed (2)              │
│ ┌─────────────────────────────────┐│
│ │ Build Card (collapsed)          ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 Mobile Responsive Behavior

### Configurator (Mobile)
- Photo tiles stack vertically (1 column)
- Package cards stack (1 column)
- Summary sticky at bottom of screen
- Larger touch targets (min 44x44px)

### BOM Review (Mobile)
- Accordions remain functional
- Line items stack (no side-by-side)
- Action buttons stack vertically

### My Builds (Mobile)
- Build cards full-width
- Filters collapse into dropdown menu
- Quick actions stack vertically within cards

---

## ✅ Design Decisions Made

### Photo Tiles for Variants
- ✅ **Decision**: Use existing photo tile pattern from Project Builder
- **Why**: Visual, engaging, already built and tested
- **Implementation**: 280x240px, click to select, green border + ✓ badge

### Package Comparison Cards
- ✅ **Decision**: Side-by-side cards (2 columns)
- **Why**: Easy comparison, shows feature differences
- **Implementation**: Radio button selection, highlight required package

### Phase-Based BOM Accordion
- ✅ **Decision**: Expandable accordions grouped by phase
- **Why**: Matches industry standard (see real-world research)
- **Implementation**: Click header to expand/collapse, all expanded by default

### Build Status Cards
- ✅ **Decision**: Card-based layout with inline status
- **Why**: Scannable, shows key info at a glance
- **Implementation**: Progress bar, phase checklist, quick actions

---

## 📝 Next Steps (Day 2: Component Specifications)

Tomorrow I'll document:
1. **Photo Tile Component** - Exact CSS, HTML structure, JavaScript
2. **BOM Accordion Component** - Expand/collapse behavior, line item structure
3. **Build Card Component** - Status indicators, progress bars, actions
4. **Shared Patterns** - Buttons, forms, loading states

---

## ❓ Questions for Review

**Before proceeding to Day 2, please review and provide feedback on**:

1. **Build Configurator**: Does the layout make sense? Too much on one page?
2. **BOM Review**: Is the accordion pattern clear? Should we show more/less detail per line item?
3. **My Builds**: Do the build cards show the right information? Missing anything?
4. **User Flow**: Does the overall flow make sense? Any steps missing?
5. **Mobile**: Any concerns about mobile experience?

**Your feedback will guide Day 2 (Component Specifications)**

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: ⏸️ Awaiting user review  
**Next**: Day 2 - Component Specifications (after approval)

