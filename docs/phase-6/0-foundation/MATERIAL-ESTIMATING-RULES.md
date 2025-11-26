# Material Estimating Rules for Residential Construction

**📊 Document Type**: Technical Reference  
**📖 Purpose**: Define formulas for calculating material quantities in house construction BOMs  
**👥 Audience**: Developers implementing BOM calculator service  
**📅 Created**: 2024-11-26

---

## Overview

This document provides industry-standard estimating formulas for calculating material quantities based on house specifications (square footage, stories, bedrooms, bathrooms). These formulas are used by the BOM calculator service to generate realistic bills of materials.

**Sources**: Construction industry standards, professional estimating guides, material manufacturer specifications

---

## Units of Measure (UOM)

### Standard Construction UOMs

| Category | Material Type | Unit | Abbreviation | Description |
|----------|--------------|------|--------------|-------------|
| **Lumber** | Dimensional lumber | Each | EA | Individual pieces (2x4, 2x6, etc.) |
| | Dimensional lumber | Board Feet | BF | Volume measurement (1" thick × 12" wide × 12" long) |
| | Dimensional lumber | Linear Feet | LF | Length measurement for continuous materials |
| **Sheet Goods** | Plywood, OSB, drywall | Sheet | SHEET | 4'×8' or 4'×12' panels |
| **Concrete** | Ready-mix concrete | Cubic Yards | CY | 27 cubic feet (3'×3'×3') |
| | Concrete mix | Bag | BAG | 60-80 lb bags of dry mix |
| | Concrete | Pallet | PALLET | Multiple bags on pallet |
| **Roofing** | Shingles, felt | Square | SQ | 100 square feet of coverage |
| | Shingles | Bundle | BUNDLE | 1/3 of a square (33.3 sqft coverage) |
| **Flooring** | Tile, hardwood, carpet | Square Feet | SF | Area coverage |
| | Hardwood, laminate | Carton/Case | CASE | Pre-packaged quantity (varies by product) |
| | Carpet | Square Yard | SY | 9 square feet (3'×3') |
| **Paint** | Interior/exterior paint | Gallon | GAL | Liquid gallon (~350-400 sqft coverage per coat) |
| | Paint, stain | Quart | QT | 1/4 gallon |
| **Siding** | Vinyl, fiber cement | Square | SQ | 100 square feet |
| | Lap siding | Linear Feet | LF | Length measurement |
| **Fasteners** | Nails, screws | Pound | LB | Weight measurement |
| | Nails, screws | Box | BOX | Pre-packaged quantity (varies: 1lb, 5lb, etc.) |
| **Electrical** | Wire | Linear Feet | LF | Length of wire/cable |
| | Outlets, switches | Each | EA | Individual devices |
| **Plumbing** | Pipe | Linear Feet | LF | Length of pipe |
| | Fittings, valves | Each | EA | Individual components |
| **HVAC** | Ductwork | Linear Feet | LF | Length of duct runs |
| | Units, vents | Each | EA | Individual units |
| | Capacity | Ton | TON | Cooling/heating capacity (12,000 BTU/hr) |

---

## Foundation & Framing Phase

### Concrete Foundation

**Slab Foundation:**
```
Cubic Yards = (Square Footage × Slab Thickness in inches) / 324

Example (2,450 sqft house with 4" slab):
= (2,450 × 4) / 324
= 30.2 CY
≈ 31 CY (round up)

Rule: Round up to nearest whole number
Waste Factor: Add 5% for waste
```

**Pier & Beam Foundation:**
```
Cubic Yards = (Number of Piers × Pier Volume) / 27

Typical: 8-10 piers per 1,000 sqft
Pier volume: ~0.5 CY each

Example (2,450 sqft house):
Piers needed = 2,450 / 1,000 × 9 = 22 piers
= 22 × 0.5 = 11 CY
```

### Framing Lumber

**Wall Studs (2x4 or 2x6):**
```
Studs per Square Foot = 0.18 (16" on-center spacing)
Studs per Square Foot = 0.24 (12" on-center spacing)

Total Studs = Square Footage × 0.18

Example (2,450 sqft house, 16" OC):
= 2,450 × 0.18
= 441 studs (2x4 8ft length)

Additional for Load-Bearing Walls: Add 10%
Corner Studs: Add 4 per corner (typically 8-12 corners)
```

**Top/Bottom Plates:**
```
Linear Feet = (Square Footage / 10) × 3

Explanation: ~10 LF of wall per 100 sqft × 3 plates (2 bottom, 1 top)

Example (2,450 sqft):
= (2,450 / 10) × 3
= 735 LF
= Convert to 2x4 pieces: 735 / 8 (if using 8ft boards) = 92 pieces
```

**Floor/Ceiling Joists:**
```
Joists per Square Foot = 0.075 (16" OC spacing)

Example (2,450 sqft house):
= 2,450 × 0.075
= 184 joists (2x10 or 2x12)

Adjust for Stories:
- Single story: Floor joists only
- Two story: Floor joists + ceiling joists = 2× calculation
```

**Roof Trusses/Rafters:**
```
Trusses = (Building Width × 1.5) + 2 (for gable ends)

Example (40ft wide house, 60ft long):
= (60 / 2) + 2  // 24" OC spacing
= 32 trusses

Pre-fabricated trusses typically priced per EA
```

### Plywood/OSB Sheathing

**Wall Sheathing:**
```
Sheets (4'×8') = (Wall Height × Perimeter) / 32
Add 10% for waste

Example (2,450 sqft, ~200 LF perimeter, 8ft walls):
= (8 × 200) / 32
= 50 sheets + 5 waste = 55 sheets
```

**Roof Sheathing:**
```
Sheets (4'×8') = (Roof Area) / 32
Roof Area = Square Footage × Roof Pitch Factor

Pitch Factors:
- 4/12 pitch: 1.05
- 6/12 pitch: 1.12
- 8/12 pitch: 1.20
- 12/12 pitch: 1.41

Example (2,450 sqft, 6/12 pitch):
Roof Area = 2,450 × 1.12 = 2,744 sqft
Sheets = 2,744 / 32 = 86 sheets + 10% waste = 95 sheets
```

### Fasteners

**Framing Nails:**
```
Pounds = Square Footage / 100

Example (2,450 sqft):
= 2,450 / 100
= 24.5 lbs ≈ 25 lbs

Typical Box Sizes: 1lb, 5lb, 50lb
Convert: 25 lbs = 5 boxes of 5lb each
```

**Structural Screws:**
```
Box Count = Number of Sheets / 20

Example (95 roof sheathing sheets):
= 95 / 20
= 4.75 ≈ 5 boxes
```

---

## Envelope Phase

### Windows & Doors

**Windows:**
```
Total Windows = Square Footage / 200

Distribution:
- Living areas: 1 window per 150 sqft
- Bedrooms: 2 windows per bedroom
- Bathrooms: 1 window per bathroom (if exterior wall)

Example (2,450 sqft, 4 bedrooms, 2.5 bathrooms):
Base = 2,450 / 200 = 12.25
Bedrooms = 4 × 2 = 8
Bathrooms = 2 × 1 = 2
Total ≈ 12-14 windows

Sizes:
- Standard: 36"×48" (most common)
- Large: 48"×60" or 60"×72"
- Small: 24"×36" (bathrooms)
```

**Doors:**
```
Exterior Doors:
- Entry door: 1 (typically 36"×80")
- Garage door: 1-2 (single 9'×7' or double 16'×7')
- Patio/sliding door: 0-1 (72"×80")
- Back door: 1 (36"×80")

Interior Doors:
Doors = (Bedrooms × 2) + (Bathrooms × 1) + 4 (closets/utility)

Example (4 bedrooms, 2.5 bathrooms):
= (4 × 2) + (3 × 1) + 4
= 15 interior doors (typically 30"×80" or 32"×80")
```

### Roofing

**Asphalt Shingles:**
```
Squares = (Roof Area / 100) × 1.10 (10% waste)
Bundles = Squares × 3 (3 bundles per square)

Example (2,450 sqft house, 6/12 pitch):
Roof Area = 2,450 × 1.12 = 2,744 sqft
Squares = (2,744 / 100) × 1.10 = 30.2 squares
Bundles = 30.2 × 3 = 91 bundles ≈ 31 squares

Note: Order by squares, delivered in bundles
```

**Underlayment (Felt/Synthetic):**
```
Rolls = Roof Area / 400 (typical roll coverage)

Example (2,744 sqft roof):
= 2,744 / 400
= 6.9 ≈ 7 rolls
```

**Flashing:**
```
Linear Feet = (Perimeter × 0.5) + (Valleys × 1.5) + (Chimneys × 20)

Example (200 LF perimeter, 2 valleys at 15ft each):
= (200 × 0.5) + (30 × 1.5)
= 100 + 45 = 145 LF
Convert to 10ft pieces: 145 / 10 = 15 pieces
```

### Siding

**Vinyl Siding:**
```
Squares = ((Perimeter × Wall Height) - Window/Door Area) / 100
Add 10% for waste

Example (2,450 sqft, 200 LF perimeter, 8ft walls, 200 sqft openings):
Wall Area = (200 × 8) - 200 = 1,400 sqft
Squares = (1,400 / 100) × 1.10 = 15.4 ≈ 16 squares
```

**Stucco:**
```
Square Feet = Wall Area (same as siding calculation)
Coverage: ~100 sqft per bag of finish coat

Bags = Wall Area / 100

Example (1,400 sqft):
= 1,400 / 100 = 14 bags
```

### Insulation

**Batt Insulation (Walls):**
```
Square Feet = Wall Area (exterior walls only)

Example (2,450 sqft, ~600 sqft exterior walls):
= 600 sqft
Convert to Rolls: Each roll covers ~40-50 sqft
= 600 / 45 ≈ 14 rolls

R-Value Selection:
- R-13: Standard walls (2x4 framing)
- R-19/R-21: Enhanced walls (2x6 framing)
```

**Blown-In Insulation (Attic):**
```
Bags = (Attic Area × Desired R-Value) / Coverage per Bag

Coverage per bag (varies by R-value):
- R-30: ~40 sqft per bag
- R-38: ~32 sqft per bag
- R-49: ~24 sqft per bag

Example (2,450 sqft attic, R-38):
= (2,450 × 1) / 32
= 76.6 ≈ 77 bags
```

---

## Interior Finish Phase

### Drywall

**Wall & Ceiling Drywall:**
```
Sheets (4'×8') = Total Surface Area / 32
Add 10% for waste

Wall Area = Perimeter × Wall Height × 2 (both sides of interior walls)
Ceiling Area = Square Footage

Example (2,450 sqft, 200 LF perimeter, 8ft walls):
Walls = (200 × 8 × 2) / 32 = 100 sheets
Ceilings = 2,450 / 32 = 77 sheets
Total = 177 sheets + 10% = 195 sheets

Sheet Sizes:
- 4'×8': Standard walls
- 4'×12': Ceilings (fewer seams)
```

**Joint Compound:**
```
Gallons = Sheets / 4 (for taping & finishing)

Example (195 sheets):
= 195 / 4
= 48.75 ≈ 49 gallons

Comes in 5-gallon buckets: 49 / 5 = 10 buckets
```

**Drywall Screws:**
```
Pounds = Sheets / 10

Example (195 sheets):
= 195 / 10
= 19.5 ≈ 20 lbs
```

### Flooring

**Hardwood Flooring:**
```
Square Feet = Floor Area × 1.10 (10% waste)

Example (2,450 sqft total, 1,800 sqft hardwood areas):
= 1,800 × 1.10
= 1,980 sqft

Convert to Cartons: Varies by product (typically 20-25 sqft per carton)
= 1,980 / 22 ≈ 90 cartons
```

**Tile Flooring:**
```
Square Feet = Floor Area × 1.15 (15% waste for tile)

Example (650 sqft tile areas - bathrooms, kitchen, entry):
= 650 × 1.15
= 748 sqft

Tile sizes vary: 12"×12", 18"×18", 24"×24"
Order by sqft, comes in boxes (varies by size)
```

**Carpet:**
```
Square Yards = (Square Feet / 9) × 1.10

Example (800 sqft carpet areas - bedrooms):
= (800 / 9) × 1.10
= 97.8 ≈ 98 square yards

Carpet sold by SY, comes in 12ft or 15ft wide rolls
```

**Underlayment:**
```
Square Feet = Same as flooring area (no waste factor needed)

Types:
- Felt paper: ~500 sqft per roll
- Foam: ~100 sqft per roll
- Cork: ~200 sqft per package
```

### Paint

**Interior Paint:**
```
Gallons = (Wall Area + Ceiling Area) / 350 (per coat)
Multiply by 2 for 2 coats

Wall Area = Perimeter × Wall Height
Ceiling Area = Square Footage

Example (2,450 sqft, 200 LF perimeter, 8ft walls):
Walls = 200 × 8 = 1,600 sqft
Ceilings = 2,450 sqft
Total = 4,050 sqft

Gallons = (4,050 / 350) × 2 = 23.1 ≈ 24 gallons

Typical: 5-gallon buckets for walls, 1-gallon for trim
```

**Exterior Paint:**
```
Gallons = (Siding Area / 300) × 2 coats

Example (1,400 sqft siding):
= (1,400 / 300) × 2
= 9.3 ≈ 10 gallons

Note: Exterior coverage is lower than interior due to texture
```

**Trim Paint:**
```
Gallons = (Window Count + Door Count) × 0.25

Example (14 windows, 15 interior doors, 4 exterior doors):
= (14 + 19) × 0.25
= 8.25 ≈ 9 gallons

Typically white/off-white semi-gloss
```

### Fixtures & Hardware

**Lighting Fixtures:**
```
Recessed Lights = Rooms × 4 (average per room)
Ceiling Fixtures = Rooms × 1
Pendant/Chandelier = Dining/Kitchen areas

Example (4 bedrooms, 3 bathrooms, living, kitchen, dining):
Rooms = 10
Recessed = 10 × 4 = 40 lights
Ceiling = 10 fixtures
Pendants = 3 (kitchen island, dining)
```

**Plumbing Fixtures:**
```
Kitchen:
- Sink: 1
- Faucet: 1
- Disposal: 1

Bathrooms (per full bath):
- Toilet: 1
- Sink/vanity: 1-2
- Shower/tub: 1
- Faucets: 2-3

Example (2.5 bathrooms):
Full Bath 1: 1 toilet, 1 sink, 1 tub/shower, 2 faucets
Full Bath 2: Same as above
Half Bath: 1 toilet, 1 sink, 1 faucet
Total: 3 toilets, 3 sinks, 2 tub/showers, 5 faucets
```

**Door Hardware:**
```
Interior Doors:
- Lever sets: 1 per door
- Hinges: 3 per door

Exterior Doors:
- Handlesets with deadbolt: 1 per door
- Hinges: 3 per door (heavy duty)

Example (15 interior, 4 exterior):
Interior lever sets: 15
Interior hinges: 45
Exterior handlesets: 4
Exterior hinges: 12
```

---

## Systems (Electrical, Plumbing, HVAC)

### Electrical

**Outlets & Switches:**
```
Outlets per Square Foot = 0.01 (1 per 100 sqft minimum)
Switches = Rooms × 2 (entry + feature switching)

Example (2,450 sqft, 10 rooms):
Outlets = 2,450 × 0.01 = 24.5 ≈ 25
Switches = 10 × 2 = 20
Total devices = 45

Note: Code requires outlet within 6ft of any point along wall
```

**Electrical Wire:**
```
Romex Wire (14/2 or 12/2):
Linear Feet = Square Footage × 4 (rough estimate for circuits)

Example (2,450 sqft):
= 2,450 × 4
= 9,800 LF

Comes in 250ft spools: 9,800 / 250 = 39.2 ≈ 40 spools

14/2: Lighting circuits (15 amp)
12/2: Outlet circuits (20 amp)
```

**Electrical Panels:**
```
Main Panel: 1 (200 amp typical for 2,000-3,000 sqft house)
Sub-Panel: 0-1 (if garage/detached structure)
Circuit Breakers: 20-30 (varies by circuits)
```

### Plumbing

**Plumbing Pipe:**
```
Water Supply (PEX or Copper):
Linear Feet = Square Footage × 2.5

Example (2,450 sqft):
= 2,450 × 2.5
= 6,125 LF

Breakdown:
- Hot water: 40%
- Cold water: 60%

Drain/Waste/Vent (PVC):
Linear Feet = (Bathrooms × 50) + (Kitchen × 30)

Example (2.5 bathrooms, 1 kitchen):
= (2.5 × 50) + (1 × 30)
= 125 + 30 = 155 LF
```

**Plumbing Fittings:**
```
Rough estimate: 1 fitting per 8 LF of pipe

Example (6,125 LF supply + 155 LF drain = 6,280 LF):
= 6,280 / 8
= 785 fittings (elbows, tees, couplings, valves)
```

### HVAC

**HVAC Capacity:**
```
Tonnage = Square Footage / 500 (in moderate climates)

Example (2,450 sqft):
= 2,450 / 500
= 4.9 tons ≈ 5 ton unit

Factors:
- Hot climates: / 400 (higher tonnage)
- Cold climates: / 600 (lower tonnage)
- Stories: +0.5 ton per additional story
```

**Ductwork:**
```
Supply Duct = Square Footage / 5 (linear feet)
Return Duct = Square Footage / 10

Example (2,450 sqft):
Supply = 2,450 / 5 = 490 LF
Return = 2,450 / 10 = 245 LF
Total = 735 LF

Typical sizes: 6", 8", 10", 12" diameter round duct
```

**Vents & Registers:**
```
Supply Registers = Rooms × 1-2
Return Grilles = Floors × 1-2

Example (10 rooms, 2 stories):
Supply = 10 × 1.5 = 15 registers
Return = 2 × 2 = 4 grilles
```

---

## Variant Adjustments

### Bonus Room Addition

When a variant adds square footage (e.g., "Sedona Bonus Room" adds 200 sqft):

```javascript
Delta Calculations:
- Studs: +200 × 0.18 = +36 EA
- Drywall: +200 / 32 = +6.25 ≈ +7 sheets
- Flooring: +200 × 1.10 = +220 SF
- Paint: +200 / 350 = +0.57 gal (add to total)
- Insulation: +200 SF batt insulation
- Electrical: +200 × 0.01 = +2 outlets
- HVAC: +200 / 500 = +0.4 tons (may not require larger unit)
```

### Garage Extension

When extending garage from 2-car to 3-car (~240 sqft addition):

```javascript
Delta Calculations:
- Concrete slab: +240 × 4 / 324 = +2.96 ≈ +3 CY
- Studs: +240 × 0.18 = +43 EA
- Garage door: +1 EA (9'×7')
- Overhead lighting: +4 EA (recessed or fixtures)
- Electrical outlets: +3 EA
```

### Covered Patio

Non-conditioned space addition (~300-400 sqft):

```javascript
Delta Calculations:
- Concrete pad: +350 × 4 / 324 = +4.32 ≈ +5 CY
- Posts/beams: +8 EA posts, +4 EA beams
- Roofing: +350 / 100 = +3.5 squares
- Electrical (if wired): +2 outlets, +2 fixtures
- No HVAC, no interior finishes
```

---

## Package Tier Adjustments

Selection packages (Builder's Choice, Desert Ridge Premium, Sunset Valley Executive) use the **same quantities** but **different SKUs** based on quality tier:

```javascript
// Example: Windows for 2,450 sqft house = 14 windows
// All packages need 14 windows, but different products:

Builder's Choice:
- SKU: "WINDOW-VINYL-DBL-36X48"
- Quality: builder_grade
- Price: $285/ea

Desert Ridge Premium:
- SKU: "WINDOW-VINYL-PREM-36X48"
- Quality: premium  
- Price: $425/ea

Sunset Valley Executive:
- SKU: "WINDOW-WOOD-LUX-36X48"
- Quality: luxury
- Price: $785/ea

Quantity: 14 EA (same for all)
Cost Difference: $285×14 = $3,990 vs $785×14 = $10,990
```

This is handled by the package SKU mappings in [`data/templates.json`](../../data/templates.json).

---

## Construction Phase Distribution

Typical cost distribution for 2,450 sqft house ($111,000 materials):

| Phase | Percentage | Estimated Cost | Key Categories |
|-------|-----------|----------------|----------------|
| Foundation & Framing | 40% | $44,400 | Concrete, lumber, fasteners, sheathing |
| Envelope | 34% | $37,740 | Roofing, windows, doors, siding, insulation |
| Interior Finish | 26% | $28,860 | Drywall, flooring, paint, fixtures, hardware |

**Note**: These are materials-only costs. Labor, permits, and appliances are additional.

---

## Formula Application Example

### Complete Calculation: The Sedona (2,450 sqft, Desert Ridge Premium)

```javascript
Foundation & Framing:
- Concrete slab: 2,450 × 4 / 324 = 30.2 → 31 CY
- 2x4 studs: 2,450 × 0.18 = 441 EA
- 2x6 joists: 2,450 × 0.075 = 184 EA
- Plywood sheathing: ((200 × 8) / 32) + (2,744 / 32) = 50 + 86 = 136 sheets
- Framing nails: 2,450 / 100 = 25 lbs

Envelope:
- Windows: 2,450 / 200 = 12 EA (rounded based on rooms)
- Doors (exterior): 4 EA, Doors (interior): 15 EA
- Roofing shingles: (2,744 / 100) × 1.10 = 30.2 squares
- Siding: 1,400 / 100 × 1.10 = 15.4 squares
- Insulation (walls): 600 sqft = 14 rolls

Interior Finish:
- Drywall: 177 sheets (walls + ceilings) + 10% = 195 sheets
- Hardwood flooring: 1,800 × 1.10 = 1,980 SF
- Carpet: 800 / 9 × 1.10 = 98 SY
- Paint (interior): (4,050 / 350) × 2 = 23 gallons
- Fixtures: 3 toilets, 3 sinks, 2 tub/showers, 1 kitchen sink
- Lighting: 40 recessed, 10 ceiling fixtures, 3 pendants
```

---

## Waste Factors & Rounding Rules

### Standard Waste Factors

| Material | Waste Factor | Reason |
|----------|-------------|---------|
| Lumber | 10% | Cuts, defects, mistakes |
| Concrete | 5% | Spillage, over-excavation |
| Drywall | 10% | Cuts around openings |
| Tile | 15% | Breakage, pattern matching, cuts |
| Flooring | 10% | Cuts, mistakes, future repairs |
| Paint | 5% | Touch-ups, uneven surfaces |
| Roofing | 10% | Valleys, hips, starter courses |
| Siding | 10% | Cuts around openings, gables |
| Fasteners | 0% | Packaged quantities already account for needs |

### Rounding Rules

1. **Always round UP** for structural materials (lumber, concrete)
2. **Round to nearest whole** for sheet goods (plywood, drywall)
3. **Round to package quantities** for boxed items (nails, screws)
4. **Round to nearest gallon** for paint (prefer 5-gal buckets for large quantities)
5. **Round to nearest square** for roofing (ordered by square, delivered in bundles)

---

## Implementation Notes

### For BOM Calculator Developers

1. **Formula Storage**: Store formulas as JavaScript functions for easy testing
2. **Unit Conversion**: Implement converter utilities (sqft → squares, EA → boxes, etc.)
3. **Validation**: Validate calculated quantities against min/max thresholds
4. **Adjustable Factors**: Allow override of waste factors and regional adjustments
5. **Audit Trail**: Log which formula was used for each calculation

### For Product Catalog Managers

1. Ensure products exist for all UOMs referenced in formulas
2. Map package tiers to appropriate quality_tier values
3. Verify pricing is realistic for each quality tier
4. Include product attributes needed for filtering (construction_phase, category, etc.)

---

## References & Sources

- **International Residential Code (IRC)**: Structural requirements
- **RS Means Cost Data**: Industry-standard estimating reference
- **National Association of Home Builders (NAHB)**: Best practices
- **Material Manufacturer Specifications**: Coverage rates and application guides
- **Construction Estimating Software**: ProEst, PlanSwift, BuilderTREND formulas

---

**Last Updated**: 2024-11-26  
**Version**: 1.0  
**Status**: ✅ Complete - Ready for Implementation

