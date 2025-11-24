# BuildRight Persona → UX Mapping

## Visual Navigation Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUILDRIGHT LOGIN/LANDING                     │
│                                                                  │
│  "Welcome back, Sarah Martinez | Sunset Valley Homes"           │
│                                                                  │
│  Account Tier: Commercial-Tier2 → Routes to DASHBOARD           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│   B2B PERSONAS            │    │   B2C PERSONAS            │
│   (Higher Priority)       │    │   (Lower Priority)        │
└───────────────────────────┘    └───────────────────────────┘
                │                                │
    ┌───────────┼────────────┐                  │
    │           │            │                  │
    ▼           ▼            ▼                  ▼
┌────────┐ ┌────────┐ ┌────────┐        ┌────────────┐
│ SARAH  │ │ MARCUS │ │ LISA   │        │ DAVID      │
│ Prod   │ │ Gen    │ │ Remod  │        │ Pro        │
│ Builder│ │ Contr. │ │ Contr. │        │ Homeowner  │
└────────┘ └────────┘ └────────┘        └────────────┘
    │           │            │                  │
    │           │            │                  │
    ▼           ▼            ▼                  ▼

┌─────────────────────────────────────────────────────────────────┐
│ SARAH'S UX: Dashboard → Template Selector → BOM Editor          │
├─────────────────────────────────────────────────────────────────┤
│ Visual Paradigm: Lennar Floor Plans + Excel                     │
│                                                                  │
│ Pages:                                                           │
│ 1. Dashboard ("My Projects & Templates")                        │
│    • Active projects cards                                      │
│    • Template library with usage stats                          │
│    • One-click "Order Again" buttons                            │
│                                                                  │
│ 2. BOM Editor                                                    │
│    • Quantity multiplier (8 units → 8x all items)               │
│    • Variant checkboxes (Bonus Room adds materials)             │
│    • Phase accordion (Foundation, Framing, Roof)                │
│    • Excel-like table with inline editing                       │
│    • "Add to Cart" → Done                                       │
│                                                                  │
│ CCDM Value: Template reuse, bulk multiplier, tier pricing       │
│ Reuse from Current: NONE (completely new)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MARCUS'S UX: Wizard → Generated BOM → Catalog Browse            │
├─────────────────────────────────────────────────────────────────┤
│ Visual Paradigm: Home Depot Deck Builder + Spec Sheet           │
│                                                                  │
│ Pages:                                                           │
│ 1. Project Builder Wizard (4 Steps)                             │
│    • Step 1: Project Type (photo tiles) ✅ KEEP                 │
│    • Step 2: Project Scope (sq ft inputs, stories, foundation)  │
│    • Step 3: Material Quality (Builder/Prof/Premium tiers)      │
│    • Step 4: Construction Phase (Foundation, Envelope, Interior)│
│      └─ ACO Triggered Policy: AC-Policy-Phase: foundation       │
│                                                                  │
│ 2. Generated BOM Review (Step 5 - Kit PDP)                      │
│    • Grouped by delivery phase                                  │
│    • "Customize Materials" section (NOT kit mode)               │
│      └─ "Browse Alternative 2x4 Options" (3 alternatives)       │
│      └─ Opens filtered catalog view                             │
│    • "Add to Cart" → Done                                       │
│                                                                  │
│ 3. Catalog Browse (Context-Aware)                               │
│    • Filtered by: Professional Grade • Phase 1 • New Const.    │
│    • "Swap In" button replaces item in BOM                      │
│                                                                  │
│ CCDM Value: Wizard generation, phase filtering, quality tiers   │
│ Reuse from Current: Wizard structure (60%), Step 5 (40%)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LISA'S UX: Package Comparison → Customization → Quote           │
├─────────────────────────────────────────────────────────────────┤
│ Visual Paradigm: Apple Comparison Grid + Tesla Configurator     │
│                                                                  │
│ Pages:                                                           │
│ 1. Package Comparison (Side-by-Side)                            │
│    ┌────────────┬────────────┬────────────┐                    │
│    │ GOOD       │ BETTER ✓   │ BEST       │                    │
│    │ $8,500     │ $14,200    │ $23,800    │                    │
│    ├────────────┼────────────┼────────────┤                    │
│    │ Standard   │ Acrylic    │ Soaking    │                    │
│    │ tub        │ tub        │ tub        │                    │
│    └────────────┴────────────┴────────────┘                    │
│                                                                  │
│ 2. Customize Selected Package                                   │
│    • Accordion sections (Fixtures, Surfaces, Finishes)          │
│    • Radio buttons within tier (can't upgrade beyond tier)      │
│    • Live price updates (+$425, -$65)                           │
│    • Running total always visible                               │
│                                                                  │
│ 3. Add Optional Items                                            │
│    • Checkboxes for frequently-added items                      │
│    • "Heated floor mat (+$425)"                                 │
│    • "LED vanity lighting (+$165)"                              │
│                                                                  │
│ 4. Final Review & Quote                                          │
│    • "Email Quote to Client" button                             │
│    • "Add to Cart" → Done                                       │
│                                                                  │
│ CCDM Value: Package tiers, within-tier customization            │
│ Reuse from Current: NONE (completely new)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DAVID'S UX: Progressive Deck Builder (Step-by-Step Filtering)   │
├─────────────────────────────────────────────────────────────────┤
│ Visual Paradigm: Home Depot Deck Builder (TRUE progressive)     │
│                                                                  │
│ Flow:                                                            │
│ Step 1: Deck Shape                                               │
│   Query: GET /catalog (no policies)                             │
│   Result: Shows Rectangular, L-Shaped, Wrap-Around              │
│   User selects: Rectangular                                     │
│   ↓                                                              │
│ Step 2: Deck Size                                                │
│   Query: GET /catalog                                            │
│   Headers: AC-Policy-Deck-Shape: rectangular                    │
│   Result: Only rectangular-compatible products                  │
│   Shows: 10x12, 12x16, 16x20, 20x24 (calculated from inventory)│
│   User selects: 16x20                                           │
│   ↓                                                              │
│ Step 3: Decking Material                                         │
│   Query: GET /catalog                                            │
│   Headers: AC-Policy-Deck-Shape: rectangular                    │
│            AC-Policy-Deck-Size: 16x20                           │
│   Result: Only materials with enough stock for 320 sq ft        │
│   Shows: Pressure-Treated ($2,850) ✓                            │
│          Composite ($4,850) ✓                                   │
│          PVC ($6,200) 🔒 LOCKED (budget exceeded)              │
│   User selects: Composite                                       │
│   ↓                                                              │
│ Step 4: Railing System                                           │
│   Query: GET /catalog                                            │
│   Headers: AC-Policy-Deck-Shape: rectangular                    │
│            AC-Policy-Deck-Size: 16x20                           │
│            AC-Policy-Material: composite                        │
│   Result: Only railings compatible with composite               │
│   Shows: Composite Railing, Aluminum Railing, Cable Railing    │
│   User selects: Aluminum - Black                                │
│   ↓                                                              │
│ Step 5: Finishing Touches                                        │
│   Query: GET /catalog (with all accumulated policies)           │
│   Shows: Post caps, LED lights, drainage, bench kit             │
│   User selects: Post caps + LED lights                          │
│   ↓                                                              │
│ Step 6: Complete Kit Review                                      │
│   • "What's Included" detailed breakdown                        │
│   • Calculated quantities (320 sq ft + 15% waste)               │
│   • "What's NOT included" (tools, concrete mix)                 │
│   • DIY estimates (4-6 weekends, Intermediate skill)            │
│   • "Add to Cart" → Done                                        │
│                                                                  │
│ CCDM Value: Triggered policies, progressive disclosure          │
│ Reuse from Current: Wizard structure (40%), visual design (30%) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ KEVIN'S UX: Restock Dashboard → Velocity Suggestions → Order    │
├─────────────────────────────────────────────────────────────────┤
│ Visual Paradigm: Shopify Inventory + Amazon Reorder             │
│                                                                  │
│ Pages:                                                           │
│ 1. Restock Dashboard                                             │
│    • Overall health bar (73% optimal)                           │
│    • Priority categories (🔴 High, 🟡 Medium, 🟢 Low)           │
│    • "42 SKUs need attention"                                   │
│    • Weekend forecast (High traffic expected)                   │
│    • One-click "Order All High Priority"                        │
│                                                                  │
│ 2. Category Detail (Fasteners)                                   │
│    ┌──────────────────────────────────────────────┐            │
│    │ DECK SCREWS - 3" EXTERIOR                    │            │
│    │ Current: 4 boxes (24% optimal) ⚠️            │            │
│    │ Avg daily sales: 3.2 boxes                   │            │
│    │ Days until out: 1.2 days                     │            │
│    │ SUGGESTED: Order 15 boxes (2-week supply)    │            │
│    │ Your order: [15] ↕ boxes                     │            │
│    └──────────────────────────────────────────────┘            │
│                                                                  │
│ 3. Order Summary                                                 │
│    • Grouped by category with delivery day                      │
│    • Split deliveries shown (Fri: $3,705, Mon: $380)            │
│    • "Next suggested restock: Monday (4 days)"                  │
│    • "Submit Restock Order" → Done                              │
│                                                                  │
│ CCDM Value: Non-project ordering, velocity-based suggestions    │
│ Reuse from Current: NONE (completely new)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## UX Patterns: Reuse vs. Build New

### ✅ **Reuse from Current UX**

| Pattern | Used By | Notes |
|---------|---------|-------|
| **Photo Tiles** | Marcus (Step 1), David (Steps 1-2) | Large photo cards with overlay text - KEEP |
| **Progress Indicator** | Marcus, David | Horizontal step circles - KEEP |
| **Wizard Structure** | Marcus, David | Radio-based step navigation - ADAPT |
| **Filter Sidebar** | Marcus (catalog), David (catalog) | Left-side filters - KEEP |
| **Product Grid** | All (when browsing) | Card-based grid layout - KEEP |

### ⭐ **Build New**

| Pattern | Used By | Inspiration |
|---------|---------|-------------|
| **Template Cards** | Sarah | Lennar floor plan selector |
| **BOM Table Editor** | Sarah, Marcus | Excel + Tesla configurator |
| **Package Comparison Grid** | Lisa | Apple product comparison |
| **Within-Tier Customization** | Lisa | Car configurator (BMW, Tesla) |
| **Progressive Disclosure** | David | Home Depot Deck Builder |
| **Velocity Dashboard** | Kevin | Shopify inventory alerts |
| **SKU Detail Cards** | Kevin | Amazon Subscribe & Save |

### ❌ **Throw Away**

| Pattern | Problem | Replacement |
|---------|---------|-------------|
| **"Kit Mode"** | Confusing mental model | Persona-specific browsing patterns |
| **Kit Sidebar** | Awkward flyout, unclear purpose | Contextual catalog browsing |
| **Generic Step 5** | Identity crisis (PDP? Mode launcher?) | Persona-specific review pages |
| **One-size-fits-all wizard** | Sarah doesn't need a wizard | Role-based routing |

---

## Page Count by Persona

| Persona | New Pages | Adapted Pages | Total Pages |
|---------|-----------|---------------|-------------|
| **Sarah** | 2 (Dashboard, BOM Editor) | 0 | 2 |
| **Marcus** | 1 (Enhanced Wizard) | 1 (Step 5 adapted) | 2 |
| **Lisa** | 4 (Comparison, Customize, Add-ons, Review) | 0 | 4 |
| **David** | 1 (Progressive Builder) | 1 (Kit Review adapted) | 2 |
| **Kevin** | 3 (Dashboard, Category Detail, Order Summary) | 0 | 3 |
| **Shared** | 0 | 2 (Catalog, Cart) | 2 |

**Total New Pages:** ~15 pages (including variants)

---

## CCDM Feature Map

### Sarah's Flow
```
Dashboard → Template → BOM Editor → Cart
                                      
CCDM Features Used:
✓ Tier pricing (Commercial-Tier2)
✓ Saved configurations (templates)
✓ Bulk multipliers
✓ Static policies (always show professional grade to Sarah)
```

### Marcus's Flow
```
Wizard → Generated BOM → Catalog Browse → Cart
 ↓          ↓              ↓
Step 4    Phase 1        Filtered
(Phase)   filtering      by phase

CCDM Features Used:
✓ Triggered policies (AC-Policy-Phase: foundation_framing)
✓ Quality tier filtering (Professional Grade)
✓ Project persistence (save for Phase 2)
✓ Dynamic BOM generation
```

### Lisa's Flow
```
Package Comparison → Customize → Add-ons → Cart
      ↓                 ↓           ↓
   Tier=Better      Within tier   Smart suggest
                    only          based on tier

CCDM Features Used:
✓ Package tiers (Good/Better/Best)
✓ Within-tier filtering (can't upgrade beyond tier)
✓ Smart suggestions (frequently-added items for tier)
✓ Quote generation
```

### David's Flow
```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Cart
  ↓        ↓        ↓        ↓        ↓
Shape    Size    Material  Railing  Finish
  ↓        ↓        ↓        ↓        ↓
Query   +Policy  +Policy  +Policy  +Policy
        Shape    Size     Material All

CCDM Features Used:
✓ Triggered policies (accumulate at each step)
✓ Progressive disclosure (options appear/disappear)
✓ Inventory filtering (only show if enough stock)
✓ Budget constraints (lock unavailable options)
✓ Educational guidance (tooltips, tips)
```

### Kevin's Flow
```
Dashboard → Category Detail → Order Summary → Submit
    ↓            ↓                ↓
Health bar   Velocity         Split delivery
             suggestions      scheduling

CCDM Features Used:
✓ Store-specific catalog (filtered to Store #7)
✓ Velocity-based suggestions (sales data)
✓ Non-project ordering (inventory replenishment)
✓ Account-based pricing (Store Account #PNW-007)
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Persona routing logic (detect tier → route to correct UX)
- [ ] CCDM triggered policy integration (ACO headers working)
- [ ] Base component library (cards, tables, accordions)
- [ ] Shared pages (updated catalog, cart)

### Phase 2: Quick Win (Week 3-4)
- [ ] **Marcus's Enhanced Wizard** (adapt current, add Steps 2-4)
- [ ] Marcus's Step 5 (Generated BOM Review)
- [ ] Marcus's contextual catalog browsing

**Why Marcus First?**
- Most reuse of current UX (60% exists)
- Showcases CCDM phase filtering
- General Contractors = high volume

### Phase 3: CCDM Showcase (Week 5-6)
- [ ] **David's Progressive Builder** (all 5 steps)
- [ ] David's Kit Review page
- [ ] Educational tooltips and tips

**Why David Second?**
- Showcases triggered policies (killer demo)
- Demonstrates progressive disclosure
- Proves CCDM value (extreme filtering)

### Phase 4: Differentiation (Week 7-8)
- [ ] **Sarah's Dashboard** (My Projects & Templates)
- [ ] Sarah's BOM Editor (Excel-like table)
- [ ] Template management (save, load, edit)

**Why Sarah Third?**
- High-value persona (production builder)
- Unique UX (no overlap with existing)
- Proves BuildRight handles enterprise use case

### Phase 5: Package Selector (Week 9-10)
- [ ] **Lisa's Package Comparison** (3-column grid)
- [ ] Lisa's Customize page (within-tier swaps)
- [ ] Lisa's Add-ons page (checkboxes)
- [ ] Lisa's Quote generation ("Email to Client")

**Why Lisa Fourth?**
- Completely unique UX
- Showcases tier filtering
- Demonstrates quote workflow

### Phase 6: Restock Mode (Week 11-12)
- [ ] **Kevin's Restock Dashboard** (health bar, priority categories)
- [ ] Kevin's Category Detail (velocity suggestions)
- [ ] Kevin's Order Summary (delivery scheduling)

**Why Kevin Last?**
- Completely separate use case
- Demonstrates non-project ordering
- B2B inventory management showcase

---

## Success Criteria

### By Persona

| Persona | Success = User Can... | Demo Metric |
|---------|----------------------|-------------|
| **Sarah** | Order 8 units of "The Sedona" in < 2 minutes using saved template | Time to cart |
| **Marcus** | Generate Phase 1 BOM for 3,000 sq ft custom home, swap LVL beams, add to cart | CCDM accuracy |
| **Lisa** | Compare 3 packages, customize Better tier, add heated floor, email quote | Quote generation |
| **David** | Build 16x20 composite deck, see only compatible options at each step | Filtered SKUs |
| **Kevin** | View velocity dashboard, see 42 low SKUs, order high-priority items in < 3 min | Restock speed |

### Overall
- ✅ Each persona has **visually distinct UX** that matches their mental model
- ✅ **No "kit mode"** confusion - flows are clear and purpose-built
- ✅ **CCDM value** is obvious in each flow (not hidden)
- ✅ **Reuses ~40%** of current UX where appropriate
- ✅ **Builds new ~60%** for persona-specific needs

---

**The North Star:** When Sarah logs in, she should think "This is a production builder's tool."
When David logs in, he should think "This is designed for DIY homeowners like me."

**One backend. Five radically different experiences.**

