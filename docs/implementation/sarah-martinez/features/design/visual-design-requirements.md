# Phase 6A: UI/UX Design Requirements (Informed by Backend Service)

**Date**: December 2, 2025  
**Focus**: Screen design, user flows, and interactions  
**Goal**: Design Sarah's persona experience based on backend capabilities

---

## 🎯 Design Philosophy Shift

### Before Backend Analysis
"We need to design screens that collect enough data to calculate BOMs locally"
- Complex forms with measurements, dimensions, formulas
- Multi-step data collection
- User inputs technical specifications

### After Backend Analysis  
"We need to design screens that help Sarah make simple selections"
- Visual selection of pre-defined options
- Backend handles all complexity
- User sees outcomes, not calculations

---

## 📊 Backend Service → UI Design Implications

### What the Backend Provides

```
Backend Input (Simple):
├─ templateId: "sedona-2450"
├─ variantId: "bonus-room" 
├─ packageId: "desert-ridge-premium"
└─ selectedPhases: ["FOUNDATION_FRAMING", "ENVELOPE"]

Backend Output (Rich):
├─ Complete BOM with 100+ line items
├─ Phase-grouped products
├─ Real SKUs and pricing from ACO
├─ Product specifications (brand, quality, species)
├─ Cost breakdowns and percentages
└─ Applied overrides metadata
```

**Design Implication**: UI should focus on **selection** (simple) not **calculation** (complex)

---

## 🎨 Screen Design Requirements

### Screen 1: Templates Dashboard ✅ **DESIGNED**

**Purpose**: Quick template selection  
**User Goal**: "I want to start a build for The Sedona"  
**Backend Support**: Templates list with metadata

**UI Elements Needed**:
```
┌────────────────────────────────────────────────┐
│ Floor Plan Templates                           │
│ Select a template to start a new build        │
└────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ [Photo]  │ │ [Photo]  │ │ [Photo]  │ │ [Photo]  │
│ Sedona   │ │ Prescott │ │ Flagstaff│ │ Tucson   │
│ 2,450 sf │ │ 1,875 sf │ │ 3,120 sf │ │ 2,680 sf │
│ 2 story  │ │ 1 story  │ │ 2 story  │ │ 1 story  │
│ 4BR/2.5BA│ │ 3BR/2BA  │ │ 5BR/3BA  │ │ 4BR/3BA  │
│          │ │          │ │          │ │          │
│ [Start   │ │ [Start   │ │ [Start   │ │ [Start   │
│  New     │ │  New     │ │  New     │ │  New     │
│  Build]  │ │  Build]  │ │  Build]  │ │  Build]  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Status**: ✅ Already designed and built  
**Backend Data**: None needed (static template info)

---

### Screen 2: Build Configurator 🎨 **NEEDS DESIGN**

**Purpose**: Select variant, package, and phases  
**User Goal**: "I want the Sedona with a bonus room, Desert Ridge Premium package"  
**Backend Support**: Validates selections, generates BOM on submit

**Key Design Question**: How to present **selections** in a way that feels fast?

#### Design Option A: Wizard (Multi-Step)

```
┌─────────────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                    Step 1 of 3      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STEP 1: Choose Variant                                         │
│                                                                 │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│ │ ○ Standard      │  │ ○ Bonus Room    │  │ ○ 3-Car Garage  ││
│ │   2,450 sq ft   │  │   2,650 sq ft   │  │   2,450 sq ft   ││
│ │   $0            │  │   +$15,000      │  │   +$8,000       ││
│ │                 │  │                 │  │                 ││
│ │   [Floorplan]   │  │   [Floorplan]   │  │   [Floorplan]   ││
│ └─────────────────┘  └─────────────────┘  └─────────────────┘│
│                                                                 │
│                                   [Cancel] [Next: Package →]   │
└─────────────────────────────────────────────────────────────────┘
```

**Pros**: Focused, one decision at a time  
**Cons**: More clicks, slower for expert users like Sarah

#### Design Option B: Single Page (All Selections)

```
┌──────────────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                        House #47     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Variant                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ ● Standard  │ │ ○ Bonus Rm  │ │ ○ 3-Car Gar │                │
│ │   $0        │ │   +$15K     │ │   +$8K      │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                  │
│ Selection Package                                                │
│ ┌────────────────────────┐ ┌────────────────────────┐           │
│ │ ○ Builder's Choice     │ │ ● Desert Ridge Premium │           │
│ │   Standard materials   │ │   Upgraded materials   │           │
│ │   $0 base              │ │   +$18,000             │           │
│ │   • Standard windows   │ │   • Pella windows      │           │
│ │   • Steel doors        │ │   • Premium doors      │           │
│ └────────────────────────┘ └────────────────────────┘           │
│                                                                  │
│ Phases to Order                                                  │
│ ☑ Foundation & Framing     Est. $45,000                         │
│ ☑ Building Envelope        Est. $38,000                         │
│ ☐ Interior Finish          Est. $28,000                         │
│                                                                  │
│ ────────────────────────────────────────────────                │
│ Estimated Total: $101,000                                        │
│                                                                  │
│                            [Cancel] [Generate BOM →]            │
└──────────────────────────────────────────────────────────────────┘
```

**Pros**: Fast, see everything at once, matches Sarah's expertise  
**Cons**: More dense, could feel overwhelming initially

**RECOMMENDATION for Sarah**: **Option B (Single Page)**
- Sarah is an expert user (knows exactly what she wants)
- Speed is more important than hand-holding
- Can clone previous builds for even faster ordering

---

### Screen 3: BOM Review 🎨 **NEEDS DESIGN**

**Purpose**: Review generated BOM before ordering  
**User Goal**: "Let me verify the materials list is correct"  
**Backend Support**: Provides complete BOM with rich product details

**Key Design Question**: How to display **100+ line items** in a scannable way?

#### Design Approach: Phase-Grouped Accordion

```
┌──────────────────────────────────────────────────────────────────┐
│ Bill of Materials: Sedona #47                                    │
│ Desert Ridge Premium • Bonus Room Variant • 2 Phases Selected    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Total Cost: $83,227.09                                           │
│                                                                  │
│ ▼ Foundation & Framing                    $45,234.00  (54%)     │
│ ├─ Concrete & Foundation                                        │
│ │  • Concrete Ready-Mix 3000 PSI     18 CY × $145.00 = $2,610   │
│ │  • Rebar #4 Grade 60               42 EA × $8.50   = $357     │
│ │                                                                │
│ ├─ Framing Lumber                                               │
│ │  • 2x4 x 8' Kiln-Dried Stud        485 EA × $3.50  = $1,698   │
│ │    Brand: BuildMaster • Species: Spruce-Pine-Fir             │
│ │  • 2x6 x 8' Kiln-Dried Stud        218 EA × $5.75  = $1,254   │
│ │  • 2x10 x 12' Framing Lumber       64 EA × $18.50  = $1,184   │
│ │                                                                │
│ └─ + 15 more items...                                           │
│                                                                  │
│ ▼ Building Envelope                       $37,993.09  (46%)     │
│ ├─ Windows & Doors                                              │
│ │  • Pella 350 Series Double-Hung    14 EA × $425.00 = $5,950   │
│ │    ★ Package Override Applied                                │
│ │    Brand: Pella • Energy Star Rated                          │
│ │  • Premium Entry Door Steel        1 EA × $385.00  = $385     │
│ │    ★ Package Override Applied                                │
│ │                                                                │
│ └─ + 22 more items...                                           │
│                                                                  │
│ ○ Interior Finish                         $0.00  (Not Selected) │
│                                                                  │
│ ────────────────────────────────────────────────────────────────│
│ Metadata:                                                        │
│ • 4 SKU overrides applied (Desert Ridge Premium package)        │
│ • Generated: Dec 2, 2025 10:30 AM                               │
│                                                                  │
│ [← Edit Configuration]  [Print BOM]  [Add All to Cart →]       │
└──────────────────────────────────────────────────────────────────┘
```

**Key UI Features**:
1. **Accordion per phase** - Collapse/expand to manage density
2. **Star icon (★)** - Highlight package overrides (shows value of premium package)
3. **Brand/specs inline** - Rich product data from ACO composable attributes
4. **Visual hierarchy** - Phase → Category → Products
5. **Percentage breakdown** - Shows cost distribution

**Backend Data Powers This**:
```json
{
  "phases": [
    {
      "phase": "FOUNDATION_FRAMING",
      "totalCost": { "value": 45234.00 },
      "percentageOfTotal": 54,
      "lineItems": [
        {
          "sku": "LBR-2X4-8FT-SPF",
          "name": "2x4 x 8' Kiln-Dried Stud",
          "quantity": 485,
          "specifications": {
            "brand": "BuildMaster",
            "species": "spruce_pine_fir",
            "qualityTier": "builder_grade"
          }
        }
      ]
    }
  ],
  "metadata": {
    "appliedOverrides": 4,
    "generatedAt": "2025-12-02T10:30:00Z"
  }
}
```

---

### Screen 4: My Builds Dashboard 🎨 **NEEDS DESIGN**

**Purpose**: Manage active builds, re-order materials  
**User Goal**: "I have 3 Sedonas in progress, need to order materials for House #48"  
**Backend Support**: Saved builds with BOM history

**Design Approach: Project Cards with Quick Actions**

```
┌──────────────────────────────────────────────────────────────────┐
│ My Builds                                       [+ New Build]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Active Builds (3)                                                │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ House #47 • The Sedona                    Status: Framing  │  │
│ │ Bonus Room • Desert Ridge Premium                          │  │
│ │                                                             │  │
│ │ Materials Ordered:                                          │  │
│ │ ✓ Foundation & Framing    $45,234 ordered Nov 28           │  │
│ │ ✓ Building Envelope       $37,993 ordered Dec 1            │  │
│ │ ○ Interior Finish         Not ordered yet                  │  │
│ │                                                             │  │
│ │ [Order Next Phase →]  [View BOM]  [Clone Build]           │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ House #48 • The Sedona                    Status: New      │  │
│ │ Standard • Builder's Choice                                 │  │
│ │                                                             │  │
│ │ Materials Ordered:                                          │  │
│ │ ○ Foundation & Framing    Not ordered yet                  │  │
│ │ ○ Building Envelope       Not ordered yet                  │  │
│ │ ○ Interior Finish         Not ordered yet                  │  │
│ │                                                             │  │
│ │ [Order Materials →]  [Edit Configuration]  [Delete]        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Recent Builds (5)                                                │
│ [Collapsed list...]                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key UI Features**:
1. **Build status tracking** - Visual progress through phases
2. **Quick re-order** - "Order Next Phase" button
3. **Clone builds** - Copy configuration for next house
4. **Material history** - What's ordered, what's pending

**Backend Data NOT Needed** (Frontend state management):
- Builds are saved in ProjectManager (localStorage)
- BOM snapshots are cached with each build
- Can regenerate BOM on demand via GraphQL

---

## 🔄 Complete User Flow Design

### Sarah's Journey: Start to Finish

```
┌─────────────────┐
│ 1. Dashboard    │  Sarah logs in, sees 6 templates
│    (Existing)   │  Clicks "Start New Build" on Sedona
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Configurator │  Single page with:
│    (NEW DESIGN) │  • Variant selection (Standard/Bonus/Garage)
│                 │  • Package selection (Builder's Choice/Premium)
│                 │  • Phase checkboxes (F&F, Envelope, Interior)
│                 │  • Real-time cost preview
│                 │  Clicks "Generate BOM"
└────────┬────────┘
         │
         │ [Backend generates BOM - 2-3 sec loading]
         │
         ▼
┌─────────────────┐
│ 3. BOM Review   │  Accordion view grouped by phase:
│    (NEW DESIGN) │  • Foundation & Framing (54%, $45K)
│                 │    - Concrete, lumber, fasteners...
│                 │  • Building Envelope (46%, $38K)  
│                 │    - ★ Pella windows (override)
│                 │    - ★ Premium doors (override)
│                 │  Shows brand, specs for each product
│                 │  Clicks "Add All to Cart"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Cart/Checkout│  Standard e-commerce flow
│    (Existing)   │  Review, submit order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. My Builds    │  Build saved with:
│    (NEW DESIGN) │  • Configuration (variant, package)
│                 │  • BOM snapshot
│                 │  • Order history per phase
│                 │  Can clone for next house
└─────────────────┘
```

**Total Clicks**: 5-7 (Dashboard → Configure → Generate → Review → Cart)  
**Time to BOM**: 2-3 minutes (expert user like Sarah)

---

## 🎨 Design System Components Needed

### New Components to Design

1. **Variant Selection Cards**
   - Radio button cards with images
   - Cost delta display (+$15K)
   - Square footage difference

2. **Package Comparison Cards**
   - Side-by-side comparison
   - Feature lists with checkmarks
   - Highlight premium upgrades

3. **Phase Selection Checkboxes**
   - Styled checkboxes with cost estimates
   - Select all / none toggle
   - Visual total update

4. **BOM Accordion**
   - Phase-level collapse/expand
   - Category sub-sections
   - Product line items with specs
   - Override indicators (★)

5. **Build Status Cards**
   - Progress indicator (phases)
   - Order history timeline
   - Quick action buttons

### Existing Components to Reuse

✅ **Template Cards** - Already designed (simplified)  
✅ **Header/Footer** - Existing design system  
✅ **Buttons** - `.btn-primary`, `.btn-secondary`  
✅ **Loading Overlays** - Existing pattern  
✅ **Error States** - Existing pattern

---

## 📐 Layout Patterns

### Configurator Layout

```
┌─────────────────────────────────────────────────────┐
│ Header (global navigation)                          │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Sidebar     │  Main Content                        │
│  (200px)     │  (flex-grow)                        │
│              │                                      │
│  • Template  │  ┌────────────────────────────────┐ │
│    preview   │  │ Variant Selection              │ │
│  • Progress  │  └────────────────────────────────┘ │
│    steps     │                                      │
│  • Cost      │  ┌────────────────────────────────┐ │
│    summary   │  │ Package Selection              │ │
│              │  └────────────────────────────────┘ │
│              │                                      │
│              │  ┌────────────────────────────────┐ │
│              │  │ Phase Selection                │ │
│              │  └────────────────────────────────┘ │
│              │                                      │
│              │  [Cancel]      [Generate BOM →]    │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### BOM Review Layout

```
┌─────────────────────────────────────────────────────┐
│ Header (global navigation)                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ BOM Summary Card                                    │
│ • Total: $83,227.09                                │
│ • Template: Sedona #47, Bonus Room                 │
│ • Package: Desert Ridge Premium                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ▼ Phase 1: Foundation & Framing  $45,234 (54%)    │
│   [Accordion content with line items...]           │
│                                                     │
│ ▼ Phase 2: Building Envelope     $37,993 (46%)    │
│   [Accordion content with line items...]           │
│                                                     │
│ ○ Phase 3: Interior Finish        Not Selected     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [← Edit] [Print]         [Add All to Cart →]      │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Design Decisions to Make

### Decision 1: Configurator - Wizard vs. Single Page?

**Question**: Should variant/package/phase selection be one page or multi-step?

**Recommendation**: **Single page**  
**Reasoning**:
- Sarah is an expert (not first-time buyer)
- Speed trumps guidance
- Can see cost impact of all selections at once

### Decision 2: BOM Display - Table vs. Accordion?

**Question**: How to display 100+ line items?

**Recommendation**: **Phase-grouped accordion**  
**Reasoning**:
- Scannable (collapse what you don't need)
- Matches mental model (order by phase)
- Shows rich data without overwhelming

### Decision 3: Package Selection - List vs. Comparison?

**Question**: Show packages in list or side-by-side comparison?

**Recommendation**: **Side-by-side cards (2-3 packages max)**  
**Reasoning**:
- Easy to compare features
- Highlight premium upgrades
- Visual decision-making

### Decision 4: Build Cloning - Where to expose?

**Question**: Where should "clone build" functionality live?

**Recommendation**: **My Builds dashboard as quick action**  
**Reasoning**:
- Sarah builds 10-15 Sedonas per year
- Cloning is frequent operation
- Needs to be one click away

---

## 📊 Backend Data Shapes UI Design

### What Backend Provides → What UI Can Show

| Backend Data | UI Design Opportunity |
|--------------|----------------------|
| **SKU overrides metadata** | ★ Highlight premium selections in BOM |
| **Product specifications** | Show brand, species, quality tier inline |
| **Phase percentages** | Visual cost breakdown (pie chart or %) |
| **Applied overrides count** | "4 upgrades applied" badge |
| **Generation timestamp** | "Generated 5 minutes ago" freshness indicator |
| **Selected phases** | Disable/grey out unselected phases in BOM |

**Key Insight**: Rich backend data enables **educational UI** without complexity

---

## ✅ Design Deliverables Needed

### High Priority (Phase 6A MVP)

- [ ] **Build Configurator screen** - Wireframe + design
- [ ] **BOM Review screen** - Wireframe + design
- [ ] **My Builds dashboard** - Wireframe + design
- [ ] **Component designs**:
  - [ ] Variant selection cards
  - [ ] Package comparison cards
  - [ ] Phase checkboxes
  - [ ] BOM accordion
  - [ ] Build status cards

### Medium Priority (Polish)

- [ ] Loading states for BOM generation
- [ ] Error states for failed BOM requests
- [ ] Empty states for "no builds yet"
- [ ] Success confirmation after BOM generation
- [ ] Mobile responsive layouts

### Low Priority (Future)

- [ ] Real-time cost preview (as selections change)
- [ ] Build cloning wizard
- [ ] Phase-by-phase ordering flow
- [ ] Analytics dashboard (cost trends, etc.)

---

## 🎨 Next Steps for Design

1. **Create wireframes** for 3 new screens (Configurator, BOM Review, My Builds)
2. **Design key components** (variant cards, package cards, BOM accordion)
3. **Prototype interactions** (accordion expand/collapse, phase selection)
4. **User testing** with construction industry persona (if available)
5. **Iterate based on feedback**

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: Ready for design work  
**Focus**: UI/UX design informed by backend capabilities

