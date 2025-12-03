# Wireframe Refinements Based on User Feedback

**Date**: December 2, 2025  
**Purpose**: Address questions and refine designs based on feedback

---

## ✅ Feedback Summary

1. ✅ **Build Configurator**: Approved!
2. 🔄 **BOM Review**: Remove "Print", add product swap capability (CCDM showcase)
3. 🔄 **My Builds Dashboard**: Clarify build metadata, simplify status tracking

---

## 🔄 Issue 1: BOM Review - Product Swaps (CCDM Opportunity)

### The Question
"Would Sarah ever make selections from her catalog? Looking for opportunities to bring in CCDM features."

### Real-World Scenario

**Yes! Sarah absolutely makes product swaps**:

**Scenario A: Site Conditions**
```
Standard BOM calls for: Dimensional 2x10 joists
Lot 47 has 20-foot span: Needs LVL engineered lumber instead
Sarah swaps: 2x10 → LVL beams (more expensive but required)
```

**Scenario B: Buyer Upgrade**
```
Standard BOM calls for: Basic fiberglass shingles
Buyer pays extra for: Architectural shingles upgrade
Sarah swaps: Basic shingles → Architectural shingles
```

**Scenario C: Code Requirement**
```
Standard BOM calls for: Standard anchor bolts
Phoenix seismic code requires: Heavy-duty seismic anchor bolts
Sarah swaps: Standard → Seismic-rated
```

### CCDM Value Proposition

When Sarah clicks "Swap Product", **CCDM ensures she only sees compatible products**:

**Example: Swapping Lumber**
```
Sarah wants to swap: 2x10 x 12' Dimensional Lumber

CCDM filters catalog to show ONLY:
✓ Products with construction_phase = "foundation_framing"
✓ Products with category = "framing_lumber"
✓ Products with compatible dimensions (load-bearing equivalent)
✓ Products available in her catalog view (Commercial-Tier2)
✓ Products in stock at her warehouse

Result: Sarah sees 5-8 products, not 5,000
```

### Updated BOM Review Wireframe (with Product Swap)

```
┌────────────────────────────────────────────────────────────────┐
│ Bill of Materials: The Sedona #47                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ▼ Phase 1: Foundation & Framing          $45,234.00 (54%)     │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Framing Lumber                                          │   │
│ │                                                          │   │
│ │   • 2x10 x 12' Dimensional Lumber  64 EA × $18.50       │   │
│ │     Brand: BuildMaster • Species: SPF                   │   │
│ │     [Swap Product]  [Remove]                            │   │
│ │     ↑ NEW ACTIONS                                       │   │
│ │                                                          │   │
│ │   • 2x4 x 8' Kiln-Dried Stud      485 EA × $3.50        │   │
│ │     [Swap Product]  [Remove]                            │   │
│ │                                                          │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**When Sarah clicks "Swap Product":**

```
┌────────────────────────────────────────────────────────────────┐
│ Swap Product: 2x10 x 12' Dimensional Lumber                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Showing compatible products (filtered by CCDM):                │
│                                                                 │
│ ○ 2x10 x 12' Dimensional Lumber (current)                     │
│   BuildMaster • SPF • $18.50                                   │
│                                                                 │
│ ○ 2x10 x 12' Pressure-Treated                                 │
│   WeatherShield • Treated Pine • $24.50                        │
│   [Better for outdoor/wet conditions]                          │
│                                                                 │
│ ○ LVL Beam 1.75" × 11.875" × 12'                              │
│   Boise Cascade • Engineered • $45.00                          │
│   [Required for spans >18 feet]                                │
│                                                                 │
│ ○ Glulam Beam 3.5" × 10.5" × 12'                              │
│   Weyerhaeuser • Engineered • $52.00                           │
│   [Premium structural option]                                  │
│                                                                 │
│ [Cancel]                                    [Apply Swap]       │
└────────────────────────────────────────────────────────────────┘
```

**CCDM Magic**:
- Only shows products with `construction_phase: foundation_framing`
- Only shows products with `category: framing_lumber`
- Only shows products with compatible load-bearing specs
- Only shows products in Sarah's catalog view (Commercial-Tier2 pricing)
- Sorted by relevance (most similar first)

**Real-World Value**:
- Sarah doesn't waste time browsing irrelevant products
- Can't accidentally select incompatible products
- Sees her tier pricing immediately
- Makes informed swaps based on use case descriptions

### Implementation Note

**Backend**: `buildright-service` would need a new GraphQL query:
```graphql
query GetCompatibleProducts(
  $productId: ID!
  $catalogViewId: String!
  $priceBookId: String!
) {
  compatibleProducts(
    productId: $productId
    catalogViewId: $catalogViewId
    priceBookId: $priceBookId
  ) {
    id
    sku
    name
    price
    specifications
    useCase
  }
}
```

**Frontend**: Add "Swap Product" button → Modal with filtered product list

---

## 🔄 Issue 2: My Builds Dashboard - Metadata & Status

### Questions Raised

1. **Build Status**: "Is BuildRight the place where Sarah would track build status (Framing, etc.)?"
2. **Subdivision/Lot**: "How does that get entered? How do we know about it?"
3. **Progress Bar**: "How does spend tracking work?"
4. **BOM-to-Order Connection**: "How do we connect BOMs with individual orders?"

### Real-World Analysis

**1. Build Status (Framing, Drywall, etc.)**

**Reality**: Sarah probably tracks this in **project management software** (Buildertrend, CoConstruct, Procore), NOT BuildRight.

**BuildRight's Role**: Track **materials ordering status**
- ✓ Foundation materials ordered
- ✓ Envelope materials ordered
- ○ Interior materials not ordered yet

**Recommendation**: Remove construction status (Framing, Drywall), keep materials status

---

**2. Subdivision & Lot Number**

**When Entered**: During **build creation** (before or after configuration)

**Option A: Enter During Configuration**
```
┌────────────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Build Information                                              │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Project Name:     House #47                  [Auto]     │   │
│ │ Subdivision:      [Desert Ridge ▾]                      │   │
│ │ Lot Number:       [47]                                  │   │
│ │ Delivery Address: [123 Main St, Phoenix, AZ]  [Edit]   │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Rest of configurator...]                                      │
└────────────────────────────────────────────────────────────────┘
```

**Option B: Enter After BOM Generation**
```
After clicking "Generate BOM", before "Add to Cart":

┌────────────────────────────────────────────────────────────────┐
│ Build Details                                                  │
├────────────────────────────────────────────────────────────────┤
│ Before ordering, provide delivery information:                 │
│                                                                 │
│ Project Name:     [House #47]                                  │
│ Subdivision:      [Desert Ridge ▾]                             │
│ Lot Number:       [47]                                         │
│ Delivery Address: [Auto-filled from subdivision]              │
│                                                                 │
│ [Save & Continue to Cart]                                      │
└────────────────────────────────────────────────────────────────┘
```

**Recommendation**: **Option A** (enter during configuration)
- More natural flow
- Subdivision might affect package selection (Desert Ridge requires Premium)
- Lot number helps Sarah track builds

---

**3. Progress Bar (Spend Tracking)**

**How It Works**:

```javascript
// Data structure
Build {
  id: "build-47",
  name: "House #47",
  template: "sedona-2450",
  configuration: { variant: "bonus-room", package: "premium" },
  
  bomEstimate: {
    total: $111,727,
    byPhase: {
      foundation: $45,234,
      envelope: $37,993,
      interior: $28,500
    }
  },
  
  ordersPlaced: [
    {
      orderId: "ORD-12345",
      phase: "foundation",
      amount: $45,234,
      date: "2025-11-28"
    },
    {
      orderId: "ORD-12346",
      phase: "envelope",
      amount: $37,993,
      date: "2025-12-01"
    }
  ],
  
  totalSpent: $83,227,  // Sum of ordersPlaced amounts
  percentComplete: 75%  // totalSpent / bomEstimate.total
}
```

**Progress Bar Calculation**:
```
Estimated Total (from BOM): $111,727
Spent So Far (sum of orders): $83,227
Progress: 75% ($83,227 / $111,727)
```

**Visual**:
```
Total Spent: $83,227 of $111,727 estimated
████████████░░░░░░░░ 75%
```

---

**4. BOM-to-Order Connection**

**Data Flow**:

```
1. Generate BOM (from buildright-service)
   └─ Returns: BOM data with line items, costs, metadata

2. Save BOM to Build
   Build.bomSnapshot = {
     generated: "2025-12-02T10:30:00Z",
     phases: [...],
     total: $111,727
   }

3. Create Order from BOM
   When Sarah clicks "Add to Cart":
   └─ Line items added to cart
   └─ Cart → Checkout → Order placed
   └─ Order saved with reference to Build

4. Link Order to Build
   Build.ordersPlaced.push({
     orderId: "ORD-12345",
     phase: "foundation",
     amount: $45,234,
     bomId: "bom-47-phase1",
     date: "2025-11-28"
   })

5. Update Progress
   Build.totalSpent = sum(ordersPlaced.amount)
   Build.percentComplete = totalSpent / bomEstimate.total
```

**In ProjectManager**:
```javascript
class ProjectManager {
  // Save BOM to build
  async saveBOM(buildId, bomData) {
    const build = await this.getProject(buildId);
    build.bomSnapshot = bomData;
    build.bomEstimate.total = bomData.total;
    await this.save(build);
  }
  
  // Link order to build
  async addOrder(buildId, orderData) {
    const build = await this.getProject(buildId);
    build.ordersPlaced.push({
      orderId: orderData.orderId,
      phase: orderData.phase,
      amount: orderData.amount,
      date: new Date().toISOString()
    });
    build.totalSpent = this.calculateTotalSpent(build);
    build.percentComplete = (build.totalSpent / build.bomEstimate.total) * 100;
    await this.save(build);
  }
}
```

---

## 📋 Updated Dashboard Wireframe (Simplified)

```
┌────────────────────────────────────────────────────────────────┐
│ My Builds                                      [+ New Build]    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Active Builds (3)                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #47 • The Sedona                                  │   │
│ │ Bonus Room • Desert Ridge Premium                       │   │
│ │ Desert Ridge Subdivision • Lot 47                       │   │
│ │                                                          │   │
│ │ Materials Ordered:                                       │   │
│ │ ✓ Foundation & Framing    $45,234  Nov 28, 2025        │   │
│ │   Order #ORD-12345                                      │   │
│ │ ✓ Building Envelope       $37,993  Dec 1, 2025         │   │
│ │   Order #ORD-12346                                      │   │
│ │ ○ Interior Finish         --       Not ordered yet      │   │
│ │                                                          │   │
│ │ Total Spent: $83,227 of $111,727 estimated              │   │
│ │ ████████████░░░░░░░░ 75%                                │   │
│ │                                                          │   │
│ │ [Order Next Phase →] [View BOM] [Clone Build]          │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ House #48 • The Sedona                                  │   │
│ │ Standard • Builder's Choice                             │   │
│ │ Sunset Valley Subdivision • Lot 22                      │   │
│ │                                                          │   │
│ │ Materials Ordered:                                       │   │
│ │ ○ Foundation & Framing    --       Not ordered yet      │   │
│ │ ○ Building Envelope       --       Not ordered yet      │   │
│ │ ○ Interior Finish         --       Not ordered yet      │   │
│ │                                                          │   │
│ │ BOM generated on Nov 30, 2025                           │   │
│ │ Estimated Total: $225,000                               │   │
│ │                                                          │   │
│ │ [Order Materials →] [Edit Configuration] [Delete]       │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
- ❌ Removed: "Status: Framing" (not BuildRight's job)
- ✅ Added: Order numbers for each phase
- ✅ Added: "BOM generated on..." for builds without orders
- ✅ Kept: Spend tracking (relevant to BuildRight)
- ✅ Kept: Subdivision/Lot (entered during configuration)

---

## 📊 Updated Build Configurator (with Metadata)

```
┌────────────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Build Information                                              │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Project Name:     [House #47]           Auto-increment  │   │
│ │ Subdivision:      [Desert Ridge ▾]      Required       │   │
│ │ Lot Number:       [47]                  Optional        │   │
│ │ Delivery Address: 123 Main St, Phoenix, AZ  [Edit]     │   │
│ │                   (Auto-filled from subdivision)        │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Base Configuration                                             │
│ [... rest of configurator as before ...]                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Subdivision Dropdown** pulls from known subdivisions:
- Desert Ridge (requires Desert Ridge Premium package)
- Sunset Valley (allows Builder's Choice or Premium)
- etc.

**Delivery Address** auto-fills based on subdivision + lot number

---

## 🎯 Summary of Changes

### BOM Review
- ✅ Remove "Print" button
- ✅ Add "Swap Product" functionality (CCDM showcase!)
- ✅ Add "Remove" functionality (Sarah can delete line items)
- ✅ Swap shows CCDM-filtered compatible products only

### My Builds Dashboard
- ❌ Remove construction status (Framing, Drywall, etc.)
- ✅ Keep materials ordering status (✓ Foundation ordered, ○ Interior pending)
- ✅ Show order numbers for each phase
- ✅ Spend tracking based on BOM estimate vs actual orders
- ✅ Subdivision/Lot entered during configuration

### Build Configurator
- ✅ Add "Build Information" section at top
- ✅ Subdivision dropdown (affects package requirements)
- ✅ Lot number field
- ✅ Delivery address (auto-filled)

---

## 🎨 CCDM Value Demonstrated

**Product Swap Feature Showcases**:
1. **Filtered Catalog** - Only compatible products shown
2. **Persona-Specific Pricing** - Sarah sees Commercial-Tier2 prices
3. **Composable Attributes** - CCDM uses product attributes to filter
4. **Context-Aware** - Based on construction phase, category, specs
5. **Real-World Use Case** - Site conditions, code requirements, buyer upgrades

---

## ❓ Follow-Up Questions

1. **Product Swap**: Should we build this for Phase 6A MVP, or save for later?
2. **Build Metadata**: Does the "Build Information" section placement work?
3. **Spend Tracking**: Is the progress bar calculation clear?
4. **Anything else** to refine before moving to Day 2 (Component Specs)?

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: ⏸️ Awaiting feedback on refinements

