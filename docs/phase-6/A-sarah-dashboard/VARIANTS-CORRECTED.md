# CORRECTED: Variants in Production Home Building

**Date**: December 2, 2025  
**Purpose**: Correct understanding of Sarah's discretion in variant selection

---

## ❌ Previous (Incorrect) Understanding

**What I said**: "Variants are pre-designed structural options with no discretion - Sarah just picks from a fixed menu"

**Why that was wrong**: I misunderstood Sarah's role. She DOES have discretion based on buyer contracts.

---

## ✅ Corrected Understanding (Based on buildright-service + DR Horton Research)

### What Variants Actually Are

**Variants** = **Optional floor plan features that Sarah selects based on buyer contracts**

**Example from buildright-service**:
```json
{
  "sedona-2450": {
    "baseSpecs": {
      "sqft": 2450,
      "bedrooms": 3,
      "bathrooms": 2
    },
    "availableVariants": [
      "standard",
      "bonus-room",
      "3-car-garage"
    ]
  }
}
```

**Translation**:
- **Base**: The Sedona (2,450 sq ft, 3BR/2BA)
- **Optional Add-Ons** (Sarah decides which to include):
  - Bonus room (adds ~200 sq ft)
  - 3-car garage (extends garage from 2-car to 3-car)
  - OR neither (standard configuration)

---

## 🏗️ Real-World Workflow (DR Horton Model)

### Scenario 1: Buyer Contract Specifies Variant

```
Buyer Contract:
├─ Model: The Sedona
├─ Lot: Desert Ridge subdivision, Lot 47
├─ Options: WITH bonus room
└─ Package: Desert Ridge Premium (required by subdivision)

Sarah's Configuration:
├─ Template: sedona-2450
├─ Variant: "bonus-room" ← SARAH SELECTS THIS
├─ Package: "desert-ridge-premium" (subdivision requirement)
└─ Phases: Foundation & Framing, Envelope

Sarah's Discretion: ✅ YES
├─ She chooses "bonus-room" variant because buyer contract specifies it
├─ She could have chosen "standard" or "3-car-garage" if buyer wanted
└─ These are BUYER REQUESTS, not pre-determined configurations
```

---

### Scenario 2: Standard Configuration (No Variants)

```
Buyer Contract:
├─ Model: The Sedona
├─ Lot: Sunset Valley subdivision, Lot 22
├─ Options: Standard (no additions)
└─ Package: Builder's Choice

Sarah's Configuration:
├─ Template: sedona-2450
├─ Variant: "standard" ← SARAH SELECTS THIS (no additions)
├─ Package: "builders-choice"
└─ Phases: All phases

Sarah's Discretion: ✅ YES
├─ She chooses "standard" because buyer doesn't want extras
├─ She could add bonus room or 3-car garage if buyer changes mind
└─ Buyer can upgrade later (if early enough in construction)
```

---

## 🎯 Sarah's Decision-Making Process

### Step 1: Receive Buyer Contract
```
Buyer: "We want The Sedona with a bonus room for our home office"
```

### Step 2: Sarah Reviews Available Variants
```
Available for sedona-2450:
□ Standard (2,450 sq ft) - $0
□ + Bonus Room (2,650 sq ft) - +$15,000
□ + 3-Car Garage (2,450 sq ft) - +$8,000
```

### Step 3: Sarah Selects Variant Based on Buyer Request
```
Sarah's Selection:
☑ Bonus Room - +$15,000

Reasoning:
├─ Buyer contract specifies bonus room
├─ Adds 200 sq ft to floor plan
├─ Requires additional materials (studs, drywall, flooring)
└─ BOM will auto-calculate material increase
```

### Step 4: System Generates BOM
```
BOM Calculation:
├─ Base Sedona materials (2,450 sq ft)
├─ + Bonus room materials (200 sq ft)
├─ + Desert Ridge Premium package (SKU overrides)
└─ = Complete materials list for this specific build
```

---

## 🔑 Key Insight: Variants ARE Discretionary

### What Sarah Controls (Discretionary Decisions)

✅ **Variants** - Which optional floor plan features to include
- Bonus room? (buyer wants it)
- 3-car garage? (buyer wants extra parking)
- Standard configuration? (buyer doesn't want extras)

✅ **Upgrades** - Which material/quality enhancements to add
- Seismic strapping (code requirement)
- Upgraded subflooring (buyer wants tile)
- Engineered lumber (site conditions)

⚠️ **Packages** - Material bundle selection
- MOSTLY subdivision-driven (Desert Ridge requires Premium)
- SOMETIMES buyer-driven (buyer wants luxury finishes)
- Sarah has SOME discretion (if subdivision allows choice)

---

## 📐 UI Design Implications (CORRECTED)

### Previous Design (Wrong)
```
❌ "Select Variant (choose ONE, no discretion)"
   Implied: Sarah just picks from pre-configured combos
```

### Corrected Design
```
✅ "Select Optional Features (choose any that apply)"

Base Configuration:
• The Sedona - 2,450 sq ft, 3BR/2BA, 2-car garage

Optional Additions (select based on buyer contract):
□ Bonus Room (+200 sq ft, +$15,000)
   └─ Adds 4th bedroom / home office over garage
   
□ 3-Car Garage (extend garage, +$8,000)
   └─ Extends garage depth by 12 ft
   
□ Covered Patio (+192 sq ft, +$12,000)
   └─ Adds 12x16 outdoor living space
```

**UI Pattern**: **Checkboxes** (not radio buttons!)
- Sarah can select 0, 1, or MULTIPLE variants
- Buyer might want bonus room AND covered patio
- System calculates cumulative cost (+$15K + $12K = +$27K)

---

## 🎨 Build Configurator (Revised Design)

```
┌────────────────────────────────────────────────────┐
│ Configure Build: The Sedona              House #47 │
├────────────────────────────────────────────────────┤
│                                                     │
│ BASE FLOOR PLAN                                    │
│ The Sedona: 2,450 sq ft • 3BR/2BA • 2-car garage  │
│ Estimated Cost: $225,000                           │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ OPTIONAL FEATURES (select any)                     │
│                                                     │
│ ☐ Bonus Room                           +$15,000    │
│    Adds 200 sq ft 4th bedroom/office over garage   │
│                                                     │
│ ☐ 3-Car Garage                         +$8,000     │
│    Extends garage depth by 12 ft                   │
│                                                     │
│ ☐ Covered Patio                        +$12,000    │
│    Adds 12x16 outdoor living space                 │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ MATERIAL PACKAGE (required)                        │
│                                                     │
│ ○ Builder's Choice                     Base        │
│    Standard materials, competitive pricing          │
│    • Standard windows                              │
│    • Composition shingles                          │
│    • Vinyl siding                                  │
│                                                     │
│ ● Desert Ridge Premium                +$18,000     │
│    Premium materials for Desert Ridge subdivision   │
│    • Pella 350 Series windows                      │
│    • Architectural shingles                        │
│    • Fiber cement siding                           │
│    [REQUIRED for Desert Ridge subdivision]         │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ ADDITIONAL UPGRADES (optional)                     │
│                                                     │
│ Foundation & Framing:                              │
│ ☑ Seismic Strapping                    +$800       │
│    [REQUIRED by Phoenix building code]             │
│ ☐ Upgraded Subflooring                 +$1,200     │
│ ☐ Engineered Lumber                    +$2,500     │
│                                                     │
│ Building Envelope:                                 │
│ ☐ Impact-Resistant Doors               +$1,800     │
│ ☐ R-30 Attic Insulation                +$900       │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ ESTIMATED TOTAL: $244,800                          │
│ • Base: $225,000                                   │
│ • Package: +$18,000 (Desert Ridge Premium)         │
│ • Upgrades: +$800 (Seismic strapping)              │
│ • Optional Features: $0 (none selected)            │
│                                                     │
│ [Cancel]                        [Generate BOM →]   │
└────────────────────────────────────────────────────┘
```

---

## 🔍 Real-World Example: Your DR Horton Experience

### What You Experienced

**Community Sales Manager** (similar to Sarah's role):
- Showed you different floor plan models
- Asked which optional features you wanted
- Could add bonus room, study, 3-car garage, etc.
- Finalized configuration before construction

**Your Choices**:
- ✅ Which model? (The Sedona vs. The Prescott vs. The Flagstaff)
- ✅ Which options? (Bonus room? 3-car garage? Covered patio?)
- ✅ Which material package? (Standard vs. Premium vs. Luxury)
- ✅ Which upgrades? (Granite counters? Premium flooring?)

**What Was Pre-Determined**:
- ❌ Subdivision covenants (required materials, colors, styles)
- ❌ Lot characteristics (size, orientation, setbacks)
- ❌ Building codes (seismic, wind, flood requirements)

---

## ✅ Corrected Definitions

### Variants (Floor Plan Options)
**Definition**: Optional architectural features Sarah selects based on buyer contracts

**Examples**:
- Bonus room (adds bedroom/office)
- 3-car garage (extends garage)
- Covered patio (adds outdoor space)
- Finished basement (if applicable)

**Sarah's Discretion**: ✅ **YES** - Selects based on buyer request

**UI Pattern**: ☐ **Checkboxes** (can select 0 to many)

**When Selected**: During initial configuration (before construction starts)

---

### Packages (Material Bundles)
**Definition**: Pre-configured material selections (windows, doors, roofing, siding)

**Examples**:
- Builder's Choice (standard materials)
- Desert Ridge Premium (upgraded materials for specific subdivision)
- Executive Luxury (high-end materials)

**Sarah's Discretion**: ⚠️ **LIMITED** - Often dictated by subdivision covenants

**UI Pattern**: ○ **Radio buttons** (select ONE package)

**When Selected**: During initial configuration (required choice)

---

### Upgrades (Individual Product Enhancements)
**Definition**: Optional material/quality improvements Sarah adds as needed

**Examples**:
- Seismic strapping (code requirement)
- Upgraded subflooring (tile floors)
- Engineered lumber (structural needs)
- Energy-efficient windows (buyer request)

**Sarah's Discretion**: ✅ **YES** - Selects based on codes, site conditions, buyer requests

**UI Pattern**: ☐ **Checkboxes** (can select 0 to many)

**When Selected**: During initial configuration OR early construction phase

---

## 📊 Decision Matrix

| Selection Type | Sarah's Discretion | Driven By | UI Pattern | Can Select Multiple? |
|----------------|-------------------|-----------|------------|---------------------|
| **Template** | ⚠️ Limited | Buyer chooses model | Radio | No (1 template) |
| **Variants** | ✅ **YES** | **Buyer contract** | **Checkboxes** | **Yes (0 to many)** |
| **Package** | ⚠️ Limited | Subdivision covenants | Radio | No (1 package) |
| **Upgrades** | ✅ YES | Codes, buyer, site | Checkboxes | Yes (0 to many) |

---

## 🎯 Summary of Correction

### What Changed

**Before** (Incorrect):
- Variants = Pre-designed structural options (no discretion)
- UI = Radio buttons (pick ONE variant)
- Sarah's role = Just selecting from fixed menu

**After** (Correct):
- Variants = **Optional floor plan features Sarah selects based on buyer needs**
- UI = **Checkboxes** (select ANY combination)
- Sarah's role = **Configuration based on buyer contracts and requests**

### Why This Matters for Design

**Impact on Build Configurator UI**:
1. Variants section uses **checkboxes** (not radio buttons)
2. Cost calculator updates **cumulatively** (bonus room + patio = +$27K)
3. Label changes from "Select Variant" to "Optional Floor Plan Features"
4. Explanatory text emphasizes **buyer-driven** selections

**Impact on User Flow**:
1. Sarah receives buyer contract → reviews requests
2. Sarah checks applicable variants → system calculates materials
3. Sarah selects package → system applies SKU overrides
4. Sarah adds upgrades → system adds specific products
5. Sarah generates BOM → system combines all selections

---

## 📝 Next Steps

### Update Design Documents
- [ ] Revise Build Configurator wireframes (checkboxes for variants)
- [ ] Update VARIANTS-VS-UPGRADES.md (correct definitions)
- [ ] Update DESIGN-REQUIREMENTS.md (UI patterns)
- [ ] Update COMPLETE-PLAN-HIERARCHY.md (clarify terminology)

### Align with buildright-service
- [x] Confirm `availableVariants` in templates.json aligns with understanding ✅
- [x] Confirm packages.json structure matches ✅
- [ ] Test BOM generation with multiple variants selected

---

**Document Version**: 2.0 (CORRECTED)  
**Last Updated**: December 2, 2025  
**Status**: Aligns with buildright-service implementation  
**Thanks**: User's real-world DR Horton experience for the correction!

