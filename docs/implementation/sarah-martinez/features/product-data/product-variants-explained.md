# Variants vs. Upgrades: Sarah's Configuration Options

**Date**: December 2, 2025  
**Purpose**: Clarify what Sarah CAN configure vs. what's pre-determined

---

## 🏗️ The Two Types of Configuration

### 1. Variants (Structural Modifications) - **PRE-DESIGNED OPTIONS**

**What They Are**: Architectural variations of the floor plan designed by Sunset Valley Homes' architecture team

**Real-World Example**:
```
The Sedona (Base: 2,450 sq ft, 4BR/2.5BA)

Approved Variants:
├─ Standard (2,450 sq ft) - $0
├─ + Bonus Room (2,650 sq ft) - +$15,000
│   └─ Adds 200 sq ft over garage
│   └─ Requires: +240 2x4 studs, +20 OSB sheets, +800 sq ft drywall
├─ + Extended 3-Car Garage (2,450 sq ft) - +$8,000
│   └─ Extends garage from 2-car to 3-car
│   └─ Requires: +12 ft foundation, +180 2x4 studs, +1 garage door
└─ + Covered Patio (2,450 sq ft) - +$12,000
    └─ Adds 12x16 covered outdoor space
    └─ Requires: +4 posts, +192 sq ft roofing, +6 beams
```

**Key Characteristics**:
- ✅ **PRE-DESIGNED** by architect (not custom)
- ✅ **APPROVED** by subdivision (meets covenants)
- ✅ **PRICED** with fixed cost deltas
- ✅ **BOM IMPACTS** are pre-calculated (material quantities known)
- ✅ **LIMITED OPTIONS** (3-5 per template, not infinite)

**Sarah's Decision Process**:
```
Buyer: "We want the Sedona with a bonus room for a home office"
Sarah: [Picks "Bonus Room" variant from dropdown]
System: Automatically adds 200 sq ft of materials to BOM (+$15K)
Sarah: [Generates BOM, places order]
```

**UI Implication**: **Radio button selection** (pick ONE variant)

---

### 2. Upgrades (Material Quality/Features) - **SARAH HAS DISCRETION**

**What They Are**: Optional enhancements that don't change the floor plan structure

**Real-World Example**:
```
Phase 1: Foundation & Framing Upgrades

Optional Upgrades Sarah CAN Add:
├─ Seismic Strapping (+$800)
│   └─ Adds: Hurricane ties, seismic straps
│   └─ When: Required by code in earthquake zones OR buyer requests
├─ Upgraded Subflooring (+$1,200)
│   └─ Replaces: 5/8" OSB with 3/4" T&G plywood
│   └─ When: Buyer wants quieter floors OR tile installation
├─ Engineered Lumber Upgrade (+$2,500)
│   └─ Replaces: Dimensional lumber with LVL beams
│   └─ When: Longer spans or structural requirements
└─ Advanced Framing Package (+$1,800)
    └─ Adds: 2x6 exterior walls (instead of 2x4)
    └─ When: Buyer wants better insulation/energy efficiency
```

**Key Characteristics**:
- ✅ **DISCRETIONARY** - Sarah decides based on buyer needs or site conditions
- ✅ **ADDITIVE** - Can select 0, 1, or multiple upgrades
- ✅ **PRICED** individually (not bundled)
- ✅ **SKU-SPECIFIC** - Each upgrade adds specific products to BOM
- ⚠️ **CONTEXTUAL** - Some upgrades only make sense for certain conditions

**Sarah's Decision Process**:
```
Scenario 1: Seismic Zone
Site: Phoenix, AZ (moderate seismic zone)
Code: Requires seismic strapping
Sarah: [Checks "Seismic Strapping" upgrade - REQUIRED]

Scenario 2: Tile Floors
Buyer: Wants tile in kitchen, baths, hallways (instead of carpet)
Sarah: [Checks "Upgraded Subflooring" - RECOMMENDED for tile]

Scenario 3: Energy Efficiency
Buyer: Wants LEED certification
Sarah: [Checks "Advanced Framing" + "Energy Star Windows"]
```

**UI Implication**: **Checkboxes** (select MULTIPLE upgrades, optional)

---

## 🎨 UI Design Impact

### Build Configurator Layout

```
┌────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                  House #47 │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 1. SELECT VARIANT (choose ONE)                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│ │ ● Standard  │ │ ○ Bonus Rm  │ │ ○ 3-Car Gar │      │
│ │   2,450 sf  │ │   2,650 sf  │ │   2,450 sf  │      │
│ │   $0        │ │   +$15,000  │ │   +$8,000   │      │
│ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│ 2. SELECT PACKAGE (choose ONE)                         │
│ ┌──────────────────┐ ┌──────────────────┐            │
│ │ ○ Builder's      │ │ ● Desert Ridge   │            │
│ │   Choice         │ │   Premium        │            │
│ │   Standard       │ │   Upgraded       │            │
│ │   $0             │ │   +$18,000       │            │
│ │   • Basic windows│ │   • Pella windows│            │
│ │   • Comp shingles│ │   • Tile roof    │            │
│ └──────────────────┘ └──────────────────┘            │
│                                                         │
│ 3. OPTIONAL UPGRADES (select any)                      │
│                                                         │
│ Phase 1: Foundation & Framing                          │
│ ☑ Seismic Strapping         +$800   [REQUIRED]        │
│ ☐ Upgraded Subflooring      +$1,200 [Recommended]     │
│ ☐ Engineered Lumber         +$2,500                    │
│                                                         │
│ Phase 2: Building Envelope                             │
│ ☐ Impact-Resistant Doors    +$1,800                    │
│ ☐ R-30 Attic Insulation     +$900                      │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│ Estimated Total: $110,700                              │
│ Base ($225K) + Variant ($0) + Package ($18K)           │
│ + Upgrades ($800)                                      │
│                                                         │
│ [Cancel]                        [Generate BOM →]       │
└────────────────────────────────────────────────────────┘
```

---

## 🔍 Real-World Scenarios

### Scenario 1: Standard Build (No Discretion Needed)

```
Buyer Request: "Standard Sedona with Desert Ridge Premium package"

Sarah's Configuration:
├─ Variant: Standard (0 clicks - default selected)
├─ Package: Desert Ridge Premium (1 click - required by subdivision)
├─ Upgrades: None (0 clicks)
└─ Total Clicks: 1

Result: BOM ready in 30 seconds
```

---

### Scenario 2: Custom Request (Discretion Required)

```
Buyer Request: "Sedona with bonus room, we want tile floors throughout"

Sarah's Configuration:
├─ Variant: Bonus Room (+$15K) - 1 click
├─ Package: Desert Ridge Premium (+$18K) - 1 click (required)
├─ Upgrades:
│   ☑ Upgraded Subflooring (+$1.2K) - 1 click (recommended for tile)
│   ☑ Seismic Strapping (+$800) - 1 click (code required)
└─ Total Clicks: 4

Sarah's Thought Process:
1. Bonus room → Structural variant (pre-designed)
2. Tile floors → Need better subflooring (discretion)
3. Phoenix location → Seismic code (required)

Result: BOM with correct materials for tile-ready floors
```

---

### Scenario 3: Energy-Efficient Build (Multiple Upgrades)

```
Buyer Request: "Energy Star certified Sedona"

Sarah's Configuration:
├─ Variant: Standard (no structural changes)
├─ Package: Desert Ridge Premium (already includes some energy features)
├─ Upgrades:
│   ☑ Advanced Framing (2x6 walls) - +$1,800
│   ☑ R-30 Attic Insulation - +$900
│   ☑ Energy Star Windows (already in Premium package) - $0
│   ☑ Low-E Glass Doors - +$650
└─ Total: +$3,350 in upgrades

Result: Meets Energy Star requirements, BOM includes all spec'd materials
```

---

## 📋 What Sarah CANNOT Configure

**These are NOT options** (pre-determined by template):

❌ **Floor Plan Layout**
- Room sizes, wall locations, door placements
- Reason: Templates are fixed designs

❌ **Foundation Type**
- Slab vs. crawlspace vs. basement
- Reason: Determined by template and lot characteristics

❌ **Roof Pitch/Style**
- Hip vs. gable, pitch angle
- Reason: Part of the architectural design

❌ **Exterior Style**
- Stucco vs. brick vs. siding
- Reason: Subdivision covenants dictate this

❌ **Window Sizes/Locations**
- Number of windows, placement, size
- Reason: Part of the floor plan design

**Why Not?**: These would require **architectural re-design** (expensive, slow). Production builders use **fixed templates** for efficiency.

---

## 🎯 Configuration Decision Tree

```
Sarah receives buyer order for "The Sedona"

Step 1: Which VARIANT?
├─ Does buyer want extra space?
│   ├─ YES: Bonus Room, 3-Car Garage, or Covered Patio?
│   └─ NO: Standard variant
└─ [SELECT ONE VARIANT]

Step 2: Which PACKAGE?
├─ Which subdivision?
│   ├─ Desert Ridge: Must use Desert Ridge Premium
│   ├─ Sunset Valley: Can use Builder's Choice or Executive
│   └─ Other: Check HOA covenants
└─ [SELECT ONE PACKAGE]

Step 3: Any UPGRADES needed?
├─ Code requirements?
│   ├─ Seismic zone: Add seismic strapping
│   ├─ Wind zone: Add hurricane ties
│   └─ Flood zone: Add flood vents
├─ Buyer requests?
│   ├─ Tile floors: Add upgraded subflooring
│   ├─ Energy efficiency: Add advanced framing + insulation
│   └─ Structural needs: Add engineered lumber
└─ [SELECT 0-N UPGRADES]

Step 4: Generate BOM
└─ System calculates materials based on selections
```

---

## 📊 Configuration Complexity Levels

### Simple Build (80% of Sarah's orders)
- **Variant**: Standard (default)
- **Package**: Subdivision-required (1 choice)
- **Upgrades**: 0-1 (code requirements only)
- **Time to BOM**: 30 seconds
- **Sarah's Effort**: Minimal

### Moderate Build (15% of Sarah's orders)
- **Variant**: One structural addition (bonus room)
- **Package**: Subdivision-required
- **Upgrades**: 1-3 (buyer requests + code)
- **Time to BOM**: 2 minutes
- **Sarah's Effort**: Low

### Complex Build (5% of Sarah's orders)
- **Variant**: Multiple structural additions
- **Package**: Upgraded tier
- **Upgrades**: 4+ (custom buyer requests)
- **Time to BOM**: 5 minutes
- **Sarah's Effort**: Moderate (still fast compared to custom home builders)

---

## ✅ Design Principles

### For Variants
1. **Show visual impact** - Thumbnail of floor plan change
2. **Clear cost delta** - "+$15,000" prominently displayed
3. **One choice only** - Radio buttons, not checkboxes
4. **Default to Standard** - Most common choice pre-selected
5. **Explain what changes** - "Adds 200 sq ft bonus room over garage"

### For Packages
1. **Side-by-side comparison** - Easy to see differences
2. **Highlight subdivision requirements** - "Required for Desert Ridge"
3. **Feature lists** - Show material differences (Pella vs. basic windows)
4. **Cost delta** - "+$18,000" vs. base package
5. **One choice only** - Radio button selection

### For Upgrades
1. **Grouped by phase** - Foundation upgrades, Envelope upgrades, etc.
2. **Context indicators** - [REQUIRED], [RECOMMENDED], [OPTIONAL]
3. **Multiple selections** - Checkboxes (0 to many)
4. **Explanatory text** - "Recommended for tile floor installation"
5. **Individual pricing** - Each upgrade shows "+$800"

---

## 🎨 UI Component Specs

### Variant Selector Component
```
Type: Radio button cards (horizontal layout)
Count: 3-5 options per template
Required: YES (must select one)
Default: Standard (first option)
Visual: Small floor plan thumbnail + specs
```

### Package Selector Component
```
Type: Radio button cards (2-column comparison)
Count: 2-3 options (Builder's Choice, Premium, Executive)
Required: YES (must select one)
Default: Subdivision-required package (if applicable)
Visual: Feature checklist + cost delta
```

### Upgrades Selector Component
```
Type: Checkboxes grouped by phase
Count: 3-8 options per phase (15-20 total)
Required: NO (all optional except code-required ones)
Default: Code-required upgrades pre-checked (disabled)
Visual: Name + cost + explanatory note
```

---

## 📝 Summary

**Variants** (Structural):
- ✅ Pre-designed by architect
- ✅ Limited options (3-5)
- ✅ Radio button selection (choose ONE)
- ✅ No discretion (pick from menu)

**Packages** (Material Tier):
- ✅ Pre-configured bundles
- ✅ Subdivision-driven (limited choice)
- ✅ Radio button selection (choose ONE)
- ✅ Minimal discretion (usually dictated)

**Upgrades** (Optional Features):
- ✅ Sarah HAS discretion
- ✅ Can select 0 to many
- ✅ Checkbox selection (choose MULTIPLE)
- ✅ Context-driven (code, buyer request, site conditions)

**Result**: Sarah's configuration is **guided but flexible** - she picks from pre-designed options but can add discretionary upgrades as needed.

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: Ready for design integration

