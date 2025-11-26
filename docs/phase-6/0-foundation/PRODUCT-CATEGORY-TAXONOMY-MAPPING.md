# Product Category Taxonomy Mapping

**Date**: November 26, 2025  
**Purpose**: Map new product categories to existing taxonomy structure  
**Status**: ✅ Complete  
**Applies**: Taxonomy defined in [PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md)

---

## Overview

**IMPORTANT**: This is an **application document**, not a taxonomy definition.

The unified multi-level taxonomy was already defined in **[PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md)** during Phase 6 planning. That document:
- Analyzed all 5 personas (Sarah, Marcus, Lisa, David, Kevin)
- Defined the attribute schema (construction_phase, quality_tier, selection_category, etc.)
- Established the unified taxonomy approach

**This document** shows how the **6 new product categories** added in Phase 0.5 (Concrete & Foundation, Electrical Systems, Plumbing Pipes & Fittings, HVAC Systems, Drywall & Supplies, Kitchen Appliances) **fit into that existing taxonomy**.

### What Changed

**Before (Phase 6 Product Data)**:
- 108 products
- 5 basic categories (Structural Materials, Windows & Doors, Roofing, Interior Finishes, Hardware)

**After (Phase 0.5 Expansion)**:
- 265 products (+157)
- 11 comprehensive categories
- **6 NEW categories**: Concrete & Foundation, Electrical Systems, Plumbing Pipes & Fittings, HVAC Systems, Drywall & Supplies, Kitchen Appliances

---

## New Category Taxonomy Mapping

### Category 1: Concrete & Foundation

**ACO Category**: `concrete_foundation`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `foundation_framing` | Phase 1 (first materials ordered) |
| `quality_tier` | `builder_grade`, `professional`, `premium` | 3 tiers available |
| `selection_category` (Sarah) | N/A | Not a selection category (not buyer-visible) |
| `room_category` (Lisa) | N/A | Not relevant for room remodels |
| `project_type` (David) | `deck`, `fence`, `shed` | Used for footings/foundations |
| `store_velocity_category` (Kevin) | `medium` | Sells steadily but not daily |

**Products Added** (6):
1. Ready-Mix Concrete - 3000 PSI
2. Ready-Mix Concrete - 4000 PSI  
3. Ready-Mix Concrete - 5000 PSI High-Strength
4. Concrete Bags - 80lb
5. Concrete Repair Compound
6. Foundation Waterproofing Membrane

**Sarah's Mental Model**: 
- Not a selection category (homebuyers don't choose concrete types)
- Automatically included in foundation phase
- Quantities calculated by BOM based on sqft

**Marcus's Mental Model**:
- Primary category: "Foundation & Structural"
- Used in Phase 1 (foundation work)
- Often needs repair products

**David's Mental Model**:
- Primary category: "Foundation Materials"
- Critical for deck/shed footings
- Educational content: "How to calculate concrete for deck footings"

---

### Category 2: Electrical Systems

**ACO Category**: `electrical_systems`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `interior_finish` | Phase 3 (roughed in during framing, finished in interior) |
| `quality_tier` | `professional`, `premium` | 2 tiers (no builder_grade for safety) |
| `selection_category` (Sarah) | `lighting` | Partially visible (fixtures are selected) |
| `room_category` (Lisa) | `bathroom`, `kitchen`, `basement` | Room-specific lighting |
| `project_type` (David) | N/A | Not typically DIY electrical work |
| `store_velocity_category` (Kevin) | `high` | Fast-moving commodity items |

**Products Added** (8):
1. Electrical Panel - 100 Amp
2. Electrical Panel - 200 Amp
3. Romex Wire 12/2 - 250ft
4. Romex Wire 14/2 - 250ft
5. Outlet - Duplex 15A
6. Light Switch - Single Pole
7. Recessed LED Light - 6"
8. GFCI Outlet - 20A

**Sarah's Mental Model**:
- **Selection Category**: `lighting` (buyers choose fixtures)
- Wire/panels: Not selected, auto-calculated in BOM
- Light fixtures: Part of selection packages (e.g., "Recessed LED - 6" Professional")

**Marcus's Mental Model**:
- Primary category: "Electrical & Lighting"
- Used in Phase 2 (rough-in) and Phase 3 (finish)
- Frequently needs both commodity (wire, boxes) and selection (fixtures)

**Lisa's Mental Model**:
- Room category: Lighting fixtures by room
- "Kitchen Lighting Package" includes recessed cans, pendants
- "Bathroom Lighting Package" includes vanity lights, exhaust fan

---

### Category 3: Plumbing Pipes & Fittings

**ACO Category**: `plumbing_pipes`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `interior_finish` | Phase 3 (roughed in during framing, finished in interior) |
| `quality_tier` | `professional` | 1 tier (commodity items) |
| `selection_category` (Sarah) | N/A | Not selected (see fixtures below) |
| `room_category` (Lisa) | `bathroom`, `kitchen` | Behind-the-wall infrastructure |
| `project_type` (David) | N/A | Not typically DIY plumbing |
| `store_velocity_category` (Kevin) | `high` | Very high velocity commodity |

**Products Added** (9):
1. PEX Tubing 1/2" - 100ft
2. PEX Tubing 3/4" - 100ft
3. PEX Fittings - Elbow 1/2"
4. PEX Fittings - Tee 1/2"
5. Copper Pipe 1/2" - 10ft
6. Copper Pipe 3/4" - 10ft
7. PVC Pipe 2" - 10ft (drain)
8. PVC Pipe 3" - 10ft (drain)
9. PVC Fittings Kit

**Note**: This is separate from **Plumbing Fixtures** (faucets, sinks, toilets), which ARE a selection category.

**Sarah's Mental Model**:
- Pipes: Not a selection category (auto-calculated in BOM)
- Fixtures: Selection category (buyers choose faucet styles, toilet types)
- **Selection Category**: `plumbing_fixtures` (already exists from Phase 6)

**Marcus's Mental Model**:
- Primary category: "Plumbing & Fixtures"
- Subcategories: "Pipes & Fittings" (commodity) vs "Fixtures" (selection)

---

### Category 4: HVAC Systems

**ACO Category**: `hvac_systems`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `interior_finish` | Phase 3 (ductwork during framing, units at finish) |
| `quality_tier` | `professional`, `premium`, `luxury` | 3 tiers (SEER ratings) |
| `selection_category` (Sarah) | N/A | Typically subcontracted out |
| `room_category` (Lisa) | N/A | Whole-home system |
| `project_type` (David) | N/A | Not DIY |
| `store_velocity_category` (Kevin) | `low` | Seasonal, low volume |

**Products Added** (10):
1. Central AC Unit - 2 Ton 14 SEER
2. Central AC Unit - 3 Ton 16 SEER
3. Central AC Unit - 4 Ton 18 SEER
4. Gas Furnace - 80k BTU 80% AFUE
5. Gas Furnace - 100k BTU 95% AFUE
6. Ductwork - Flexible 6"
7. Ductwork - Flexible 8"
8. Vent Register - 4"x10"
9. Thermostat - Programmable
10. Thermostat - Smart WiFi

**Sarah's Mental Model**:
- Not a selection category (HVAC subcontracted)
- May be included in BOM for cost estimation
- Builder handles HVAC contractor coordination

**Marcus's Mental Model**:
- Secondary category: "HVAC & Mechanical"
- Rarely orders directly (uses HVAC subs)
- May stock thermostats and registers

**Kevin's Mental Model**:
- Low velocity category
- Seasonal demand (AC in summer, furnaces in fall)
- Typically special order

---

### Category 5: Drywall & Supplies

**ACO Category**: `drywall_supplies`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `foundation_framing` | Phase 1/2 transition (framed, then drywalled) |
| `quality_tier` | `builder_grade`, `professional`, `premium` | 3 tiers (standard, moisture-resistant, fire-rated) |
| `selection_category` (Sarah) | N/A | Not selected (standard spec) |
| `room_category` (Lisa) | `bathroom`, `kitchen`, `basement` | Moisture-resistant for wet areas |
| `project_type` (David) | `shed` | Interior walls (if finishing) |
| `store_velocity_category` (Kevin) | `high` | Very high velocity |

**Products Added** (7):
1. Drywall 1/2" - 4x8 Sheet
2. Drywall 5/8" - 4x8 Sheet
3. Drywall - Moisture Resistant 1/2" - 4x8
4. Joint Compound - All-Purpose 5 Gallon
5. Joint Compound - Lightweight 5 Gallon
6. Drywall Screws - 1-1/4" (5lb box)
7. Drywall Tape - Paper 250ft

**Sarah's Mental Model**:
- Not a selection category
- Auto-calculated in BOM based on sqft
- Moisture-resistant auto-spec'd for bathrooms

**Marcus's Mental Model**:
- Primary category: "Framing & Drywall"
- High-volume commodity purchases
- Needs variety (standard, moisture-resistant, fire-rated)

**Lisa's Mental Model**:
- Room category: "Finishes"
- Critical for bathroom/kitchen remodels
- Always moisture-resistant in wet areas

---

### Category 6: Kitchen Appliances

**ACO Category**: `kitchen_appliances`

**Maps to Existing Taxonomy**:

| Taxonomy Attribute | Value | Notes |
|-------------------|-------|-------|
| `construction_phase` | `interior_finish` | Phase 3 (final installation) |
| `quality_tier` | `professional`, `premium`, `luxury` | 3 tiers (standard, upgraded, high-end) |
| `selection_category` (Sarah) | `appliances` | **NEW selection category** |
| `room_category` (Lisa) | `kitchen` | Kitchen-specific |
| `project_type` (David) | N/A | Not relevant |
| `store_velocity_category` (Kevin) | `low` | Special order, project-based |

**Products Added** (8):
1. Dishwasher - Stainless Steel
2. Dishwasher - Panel-Ready
3. Range - Electric 30"
4. Range - Gas 30"
5. Refrigerator - French Door 36"
6. Refrigerator - Side-by-Side 42"
7. Microwave - Over-the-Range
8. Range Hood - 30"

**Sarah's Mental Model**:
- **NEW Selection Category**: `appliances`
- Part of selection packages:
  - Builder's Choice: Standard appliances (dishwasher, range, fridge, microwave)
  - Desert Ridge Premium: Upgraded (stainless, panel-ready)
  - Sunset Valley Executive: High-end (professional-grade)

**Marcus's Mental Model**:
- Secondary category: "Appliances"
- Typically customer-supplied or special order
- Coordinates delivery/installation

**Lisa's Mental Model**:
- **Primary category**: "Kitchen Appliances"
- Major decision point in kitchen remodels
- Presents Good/Better/Best packages

---

## Updated Selection Category List (Sarah)

**Phase 6 Original** (7 categories):
1. Windows
2. Doors
3. Roofing
4. Siding
5. Flooring
6. Paint
7. Plumbing Fixtures

**Phase 0.5 Additions** (2 categories):
8. Lighting (from Electrical Systems)
9. **Appliances** (new category)

**Total**: 9 selection categories

---

## Construction Phase Distribution

### Foundation & Framing Phase

**Existing Categories**:
- Structural Materials (lumber, engineered wood, sheet goods)
- Hardware & Fasteners

**NEW Categories Added**:
- ✅ Concrete & Foundation (footings, slabs)
- ✅ Drywall & Supplies (late in phase)

### Envelope Phase

**Existing Categories**:
- Windows & Doors
- Roofing & Siding

**NEW Categories Added**:
- (None - envelope was already well-covered)

### Interior Finish Phase

**Existing Categories**:
- Interior Finishes (flooring, paint)
- Plumbing Fixtures

**NEW Categories Added**:
- ✅ Electrical Systems (wiring, panels, lighting)
- ✅ Plumbing Pipes & Fittings (supply lines, drains)
- ✅ HVAC Systems (AC, furnace, ductwork)
- ✅ Kitchen Appliances (dishwasher, range, fridge)

---

## Persona-Specific Category Views

### Sarah (Home Builder)

**Top-Level Categories** (Construction Phase):
1. Foundation & Framing
   - Concrete & Foundation ✨ NEW
   - Structural Materials
   - Drywall & Supplies ✨ NEW
   - Hardware & Fasteners

2. Envelope
   - Windows & Doors
   - Roofing & Siding

3. Interior Finish
   - Flooring & Paint
   - Electrical & Lighting ✨ NEW
   - Plumbing (Pipes & Fixtures)
   - HVAC Systems ✨ NEW
   - Kitchen Appliances ✨ NEW

**Selection Categories** (Buyer Choices):
- Windows, Doors, Roofing, Siding, Flooring, Paint, Plumbing Fixtures, Lighting ✨ NEW, Appliances ✨ NEW

### Marcus (Custom Builder)

**Top-Level Categories** (Traditional Supply):
1. Foundation & Structural
   - Concrete & Foundation ✨ NEW
   - Framing Lumber
   - Engineered Wood

2. Envelope
   - Windows & Doors
   - Roofing Materials

3. Interior Systems
   - Electrical & Lighting ✨ NEW
   - Plumbing & Fixtures
   - HVAC & Mechanical ✨ NEW
   - Drywall & Finishes ✨ NEW

4. Finishes
   - Flooring
   - Paint & Stain
   - Appliances ✨ NEW

### Lisa (Interior Designer/Remodeler)

**Top-Level Categories** (Room-Based):
1. Kitchen
   - Appliances ✨ NEW
   - Plumbing Fixtures
   - Lighting ✨ NEW
   - Flooring
   - Paint

2. Bathroom
   - Plumbing Fixtures
   - Lighting ✨ NEW
   - Tile & Flooring
   - Paint

3. Basement
   - Drywall & Supplies ✨ NEW
   - Electrical & Lighting ✨ NEW
   - Plumbing (if adding bath)
   - Flooring
   - HVAC (if adding zone)

### David (DIY Homeowner)

**Top-Level Categories** (Project-Based):
1. Deck Building
   - Concrete & Foundation ✨ NEW (footings)
   - Framing Lumber
   - Decking Materials
   - Railing Systems

2. Fence Building
   - Concrete & Foundation ✨ NEW (post holes)
   - Fence Posts & Panels
   - Hardware & Fasteners

3. Shed Building
   - Concrete & Foundation ✨ NEW (slab)
   - Framing Materials
   - Drywall & Supplies ✨ NEW (if finishing interior)
   - Doors & Windows

### Kevin (Store Manager)

**Top-Level Categories** (Velocity-Based):
1. High Velocity (Daily Orders)
   - Electrical Supplies ✨ NEW
   - Plumbing Pipes ✨ NEW
   - Drywall Supplies ✨ NEW
   - Concrete (bags) ✨ NEW

2. Medium Velocity (Weekly Orders)
   - Structural Lumber
   - Hardware & Fasteners
   - Concrete (ready-mix) ✨ NEW

3. Low Velocity (Special Order)
   - HVAC Systems ✨ NEW
   - Kitchen Appliances ✨ NEW
   - High-end Fixtures

---

## ACO Attribute Mapping

All 265 products (including the 157 new ones) have these attributes:

```javascript
// Core Taxonomy Attributes (All Products)
{
  // Construction context
  construction_phase: 'foundation_framing' | 'envelope' | 'interior_finish',
  quality_tier: 'builder_grade' | 'professional' | 'premium' | 'luxury',
  package_tier: 'good' | 'better' | 'best',
  
  // Persona-specific
  selection_category: 'windows' | 'doors' | 'roofing' | 'siding' | 'flooring' | 
                      'paint' | 'plumbing_fixtures' | 'lighting' | 'appliances',
  
  room_category: 'bathroom' | 'kitchen' | 'basement' | 'outdoor',
  
  project_type: 'deck' | 'fence' | 'shed' | 'patio',
  
  store_velocity_category: 'high' | 'medium' | 'low',
  
  // Product category (ACO internal)
  product_category: 'concrete_foundation' | 'electrical_systems' | 
                    'plumbing_pipes' | 'hvac_systems' | 
                    'drywall_supplies' | 'kitchen_appliances' | ...
}
```

---

## BOM Calculator Impact

The new categories enable **complete house BOMs**:

### Foundation & Framing Phase BOM

**NEW line items**:
- ✅ Concrete for slab foundation (CY)
- ✅ Drywall sheets (SHEET)
- ✅ Joint compound (BUCKET)
- ✅ Drywall screws (BOX)

### Envelope Phase BOM

No changes (already complete)

### Interior Finish Phase BOM

**NEW line items**:
- ✅ Electrical panel (EA)
- ✅ Romex wire (LF)
- ✅ Outlets & switches (EA)
- ✅ Recessed lighting (EA)
- ✅ PEX tubing (LF)
- ✅ PEX fittings (EA)
- ✅ HVAC unit (EA)
- ✅ Ductwork (LF)
- ✅ Thermostat (EA)
- ✅ Kitchen appliances (EA each: dishwasher, range, fridge, microwave)

**Result**: Complete, realistic BOMs for all house templates ✅

---

## Validation

### Category Coverage Check

| Construction System | Category Exists? | Products Count |
|---------------------|------------------|----------------|
| Foundation | ✅ Concrete & Foundation | 6 |
| Framing | ✅ Structural Materials | 18 |
| Drywall | ✅ Drywall & Supplies | 7 |
| Envelope | ✅ Windows & Doors, Roofing | 22 |
| Electrical | ✅ Electrical Systems | 8 |
| Plumbing | ✅ Plumbing Pipes + Fixtures | 9 + existing |
| HVAC | ✅ HVAC Systems | 10 |
| Interior | ✅ Flooring, Paint | existing |
| Appliances | ✅ Kitchen Appliances | 8 |

**Coverage**: ✅ All major construction systems represented

### Persona Coverage Check

| Persona | Can Build Complete Catalog View? | New Categories Needed? |
|---------|----------------------------------|------------------------|
| Sarah | ✅ Yes | ✅ All 6 categories support her workflow |
| Marcus | ✅ Yes | ✅ All 6 categories align with contractor needs |
| Lisa | ✅ Yes | ✅ Electrical, Appliances critical for remodels |
| David | ⚠️ Partial | ❌ Still needs deck/fence specialty materials |
| Kevin | ✅ Yes | ✅ All categories have velocity tags |

**Result**: 4 of 5 personas fully supported ✅

---

## Next Steps

### For Sarah Dashboard (Phase 6A)
- Display products organized by construction phase
- Filter by selection category
- Use package tier to auto-select products

### For Marcus (Phase 7)
- Show traditional contractor categories
- Enable quality tier filtering
- Support multi-phase ordering

### For David (Future)
- Add 60 deck/fence specialty products
- Organize by project type (deck, fence, shed)
- Educational content per category

---

## Conclusion

The 6 new product categories integrate seamlessly into the existing unified multi-level taxonomy:

✅ **Construction Phase Alignment**: All categories map to foundation_framing, envelope, or interior_finish  
✅ **Quality Tier Support**: All categories support 2-4 quality tiers  
✅ **Persona Compatibility**: Categories work for Sarah, Marcus, Lisa, and Kevin  
✅ **Selection Categories**: 2 new buyer-facing categories (Lighting, Appliances)  
✅ **BOM Calculator**: All categories support realistic estimating formulas  
✅ **ACO Implementation**: All 265 products properly attributed  

**Status**: Taxonomy integration complete ✅

---

**Related Docs**:
- [PRODUCT-TAXONOMY-ANALYSIS.md](PRODUCT-TAXONOMY-ANALYSIS.md) - Original taxonomy decision
- [PRODUCT-EXPANSION-SUMMARY.md](PRODUCT-EXPANSION-SUMMARY.md) - What was added
- [ACO-CATALOG-ARCHITECTURE.md](ACO-CATALOG-ARCHITECTURE.md) - How it's implemented in ACO

