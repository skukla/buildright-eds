# Product Catalog Audit for Sarah's Template Configurator

**📊 Document Type**: Analysis Report  
**📖 Purpose**: Assess current product catalog and identify gaps for realistic BOM generation  
**👥 Audience**: Product managers, developers  
**📅 Created**: 2024-11-26

---

## Executive Summary

**Current State**: 108 products across 11 categories  
**Coverage**: 60% complete for house construction needs  
**Critical Gaps**: Electrical (0 products), Plumbing pipes/fittings (0 products), HVAC (0 products), Concrete (0 products), Appliances (0 products)  
**Recommendation**: Add 60-100 products to achieve 95%+ coverage

---

## Current Product Inventory

### By Construction Phase

| Phase | Product Count | Percentage | Status |
|-------|--------------|------------|--------|
| Interior Finish | 41 | 38% | ✅ Good |
| Envelope | 37 | 34% | ✅ Good |
| Foundation & Framing | 16 | 15% | ⚠️ Limited |
| Unassigned | 10 | 9% | ❌ Needs classification |
| Finish Work | 2 | 2% | ⚠️ Limited |
| Exterior | 1 | 1% | ⚠️ Limited |
| Rough-In | 1 | 1% | ❌ Severely limited |

**Analysis**: Interior finish and envelope phases are well-stocked, but foundation/framing and rough-in (electrical, plumbing, HVAC) are severely understocked.

### By Quality Tier

| Tier | Product Count | Percentage | Target | Status |
|------|--------------|------------|--------|--------|
| Professional | 32 | 30% | 33% | ✅ On target |
| Premium | 29 | 27% | 33% | ✅ Close |
| Builder Grade | 20 | 19% | 33% | ⚠️ Below target |
| Luxury | 14 | 13% | - | ✅ Sufficient (niche) |
| Unassigned | 10 | 9% | 0% | ❌ Needs classification |
| Mid-Tier | 3 | 3% | - | ⚠️ Redundant? |

**Analysis**: Good distribution across tiers, but need more builder_grade products to support "Builder's Choice" package.

### By Product Category

| Category | Product Count | Status | Notes |
|----------|--------------|--------|-------|
| Framing & Drywall | 17 | ✅ Good | Has drywall, but missing joint compound, tape |
| Structural Materials | 14 | ✅ Good | Lumber well-covered |
| Windows & Doors | 14 | ✅ Good | Good variety across tiers |
| Fasteners & Hardware | 14 | ✅ Good | Basic fasteners present |
| Roofing | 14 | ✅ Good | Shingles, underlayment covered |
| Flooring | 8 | ⚠️ Limited | Need tile, carpet padding |
| Plumbing Fixtures | 6 | ⚠️ Limited | Fixtures only, no pipes/fittings |
| Lighting Fixtures | 6 | ⚠️ Limited | Need more recessed, switches |
| Siding | 6 | ⚠️ Limited | Need stucco, stone veneer |
| Paint | 6 | ⚠️ Limited | Need primer, exterior paint |
| Insulation | 3 | ❌ Severely limited | Need blown-in, spray foam |
| **MISSING CATEGORIES** | | | |
| Electrical | 0 | ❌ Critical | Wiring, outlets, switches, panels |
| Plumbing Pipes/Fittings | 0 | ❌ Critical | PEX, copper, PVC, fittings |
| HVAC | 0 | ❌ Critical | Units, ductwork, vents |
| Concrete | 0 | ❌ Critical | Ready-mix, bags, rebar |
| Appliances | 0 | ❌ Critical | Kitchen appliances |
| Drywall Supplies | 0 | ❌ Critical | Joint compound, tape, corner bead |

---

## Units of Measure Analysis

### Current UOM Distribution

```
EA (Each): ~95% of products
BUNDLE: ~3% of products (roofing)
SF (Square Feet): ~2% of products (flooring)
```

### Missing UOMs for House Construction

| UOM | Category Needed | Example Products |
|-----|----------------|------------------|
| CY (Cubic Yards) | Concrete | Ready-mix concrete, gravel |
| BAG | Concrete, drywall | Concrete mix bags (60-80lb), joint compound |
| SQ (Squares) | Roofing, siding | Currently have BUNDLE, need SQ |
| LF (Linear Feet) | Lumber, pipe, wire | Dimensional lumber, PEX pipe, Romex wire |
| GAL (Gallons) | Paint | Interior/exterior paint (5-gal buckets) |
| CASE/CARTON | Flooring | Hardwood, tile cartons |
| SY (Square Yards) | Carpet | Carpet rolls |
| LB (Pounds) | Fasteners | Bulk nails, screws |
| BOX | Fasteners, electrical | Nail boxes, outlet boxes |
| ROLL | Insulation, underlayment | Batt insulation, felt paper |
| TON | HVAC | HVAC unit capacity |

**Critical**: Need to update [`buildright-aco/scripts/config/product-definitions.js`](buildright-aco/scripts/config/product-definitions.js) to include all UOMs.

---

## Gap Analysis by Construction Phase

### Foundation & Framing Phase

**Current Products**: 16  
**Target Products**: 40-50  
**Gap**: 24-34 products

#### Missing Products:

**Concrete (8-10 products):**
- Ready-mix concrete (CY) - 3 quality tiers
- Concrete bags (60-80 lb BAG) - 3 quality tiers
- Rebar (#3, #4, #5) (LF or 20ft pieces)
- Anchor bolts
- Expansion joints

**Additional Lumber (5-8 products):**
- LVL beams (various sizes)
- Engineered I-joists
- Treated lumber for foundation contact
- Pressure-treated posts (4x4, 6x6)

**Foundation Materials (3-5 products):**
- Gravel/crushed stone (CY or TON)
- Vapor barrier (ROLL)
- Foundation coating/waterproofing (GAL)

**Drywall Supplies (5-7 products):**
- Joint compound (5-gal bucket)
- Drywall tape (ROLL)
- Corner bead (LF or 8ft pieces)
- Drywall screws (LB or BOX)
- Sanding mesh (SHEET or ROLL)

### Envelope Phase

**Current Products**: 37  
**Target Products**: 45-55  
**Gap**: 8-18 products

#### Missing Products:

**Additional Roofing (3-5 products):**
- Drip edge (LF or 10ft pieces)
- Valley flashing (LF or rolls)
- Roof vents (EA)
- Ice & water shield (ROLL)

**Additional Siding (4-6 products):**
- Stucco finish (BAG or 5-gal bucket)
- Stone veneer (SF or CASE)
- House wrap/Tyvek (ROLL)
- Trim boards (LF or 12ft pieces)

**Additional Insulation (3-5 products):**
- Blown-in insulation (BAG)
- Spray foam kits (EA or CASE)
- Foam board (SHEET)
- Acoustic insulation (ROLL)

### Interior Finish Phase

**Current Products**: 41  
**Target Products**: 50-60  
**Gap**: 9-19 products

#### Missing Products:

**Additional Flooring (4-6 products):**
- Tile (12x12, 18x18, 24x24) (SF or CASE)
- Carpet padding (ROLL or SY)
- Hardwood stain (GAL or QT)
- Tile grout (BAG or bucket)
- Floor leveling compound (BAG)

**Additional Paint (3-4 products):**
- Primer (GAL, 5-gal bucket)
- Exterior paint (GAL, 5-gal bucket)
- Stain/sealer (GAL or QT)
- Caulk (tubes, cases)

**Additional Fixtures (5-7 products):**
- More lighting variety (pendants, chandeliers)
- Bathroom exhaust fans
- Door hardware sets (various finishes)
- Cabinet hardware (knobs, pulls)

**Trim & Molding (3-5 products):**
- Baseboard (LF or 8ft/12ft pieces)
- Crown molding (LF or pieces)
- Door/window casing (LF or pieces)
- Chair rail (LF or pieces)

### Rough-In Systems Phase (NEW)

**Current Products**: 1  
**Target Products**: 35-45  
**Gap**: 34-44 products

#### Electrical (12-15 products):

**Wiring:**
- 14/2 Romex wire (LF or 250ft spool) - 3 tiers
- 12/2 Romex wire (LF or 250ft spool) - 3 tiers
- 10/2 Romex wire for appliances (LF or spool)

**Devices:**
- Standard outlets (15A, 20A) - EA or 10-pack
- GFCI outlets - EA
- Light switches (single, 3-way, dimmer) - EA or 10-pack
- Switch plates / outlet covers - EA or multi-packs

**Panels & Boxes:**
- 200A main panel - EA
- Circuit breakers (15A, 20A, 30A) - EA
- Junction boxes - EA or 10-pack

#### Plumbing (12-15 products):

**Pipes:**
- PEX pipe (1/2", 3/4", 1") - LF or 100ft coils - 3 colors (hot/cold/recirculation)
- Copper pipe (1/2", 3/4") - LF or 10ft pieces
- PVC drain pipe (1.5", 2", 3", 4") - LF or 10ft pieces

**Fittings:**
- PEX fittings assortment (elbows, tees, couplings) - EA or kits
- Copper fittings - EA or kits
- PVC fittings - EA or kits
- Shut-off valves - EA

**Other:**
- Pipe insulation (LF or 6ft pieces)
- Water heater (40-gal, 50-gal) - EA

#### HVAC (10-12 products):

**Units:**
- HVAC systems (3-ton, 4-ton, 5-ton) - EA - 3 quality tiers

**Ductwork:**
- Round duct (6", 8", 10", 12") - LF or 10ft pieces
- Flexible duct - LF or 25ft pieces
- Duct fittings (elbows, reducers, boots) - EA

**Vents & Accessories:**
- Supply registers (various sizes) - EA
- Return grilles - EA
- Thermostat (programmable, smart) - EA - 3 tiers

### Appliances (NEW Category)

**Current Products**: 0  
**Target Products**: 5-8  
**Gap**: 5-8 products

#### Kitchen Appliances (by tier):

**Builder Grade:**
- Range (30" electric) - EA
- Dishwasher (standard) - EA
- Microwave (over-range) - EA

**Premium:**
- Range (30" gas or dual-fuel) - EA
- Dishwasher (stainless, quiet) - EA
- Microwave (built-in) - EA

**Luxury:**
- Professional range (36" or 48") - EA
- Dishwasher (panel-ready, ultra-quiet) - EA
- Built-in microwave drawer - EA

---

## Selection Package SKU Validation

### Current Package Mappings

From [`data/templates.json`](../../data/templates.json):

#### Builder's Choice Package

| Category | SKU | Product Name | Exists? |
|----------|-----|--------------|---------|
| Windows | WINDOW-8039584D | BuildRight Pro Single Hung Window - 36"x48" | ✅ Yes |
| Doors | DOOR-34C72FD2 | FastenPro Entry Door - Steel 36"x80" | ✅ Yes |
| Roofing | ROOF-23151318 | SafeGuard Asphalt Shingles 3-Tab - Bundle | ✅ Yes |
| Flooring (carpet) | FLOOR-CARPET-STAND | Standard Carpet - Beige Neutral | ✅ Yes |
| Flooring (vinyl) | FLOOR-VINYL-LUX-OAK | Luxury Vinyl Plank - Oak Finish | ✅ Yes |
| Kitchen faucet | PLUMB-FAUCET-KIT-CHROME | ❌ Missing |
| Bath faucet | PLUMB-FAUCET-BATH-CHROME | ❌ Missing |
| Lighting (ceiling) | LIGHT-CEILING-FLUSH | ❌ Missing |
| Lighting (recessed) | LIGHT-RECESSED-4IN | ❌ Missing |
| Siding | SIDING-VINYL-STANDARD | ❌ Missing |
| Paint (interior) | PAINT-INT-FLAT-WHT | ❌ Missing |
| Paint (exterior) | PAINT-INT-EGGSHELL-BG | ❌ Missing (typo: INT vs EXT?) |
| Insulation | INSUL-FIBERGLASS-R15 | ❌ Missing |
| Drywall | DRYWALL-HALF-4X8 | ❌ Missing |

**Status**: 5/14 SKUs exist (36% coverage)

#### Desert Ridge Premium Package

| Category | SKU | Product Name | Exists? |
|----------|-----|--------------|---------|
| Windows | WINDOW-8F26E917 | MaxStrength Casement Window - 30"x48" | ✅ Yes |
| Doors | DOOR-E93CC71C | StructureMaster Sliding Patio Door - 72"x80" | ✅ Yes |
| Roofing | ROOF-7B1F4022 | SafeGuard Premium Designer Shingles - Bundle | ✅ Yes |
| Flooring (hardwood) | FLOOR-HARDWOOD-OAK | Engineered Hardwood - Red Oak | ✅ Yes |
| Flooring (tile) | FLOOR-TILE-CERAMIC-12 | ❌ Missing |
| Flooring (carpet) | FLOOR-VINYL-PREMIUM | ❌ Missing (name mismatch - vinyl not carpet) |
| Kitchen faucet | PLUMB-FAUCET-KIT-BRUSH | ❌ Missing |
| Bath faucet | PLUMB-FAUCET-BATH-BRUSH | ❌ Missing |
| Lighting (ceiling) | LIGHT-CEILING-SEMI | ❌ Missing |
| Lighting (recessed) | LIGHT-RECESSED-6IN-LED | ❌ Missing |
| Siding | SIDING-STUCCO-STANDARD | ❌ Missing |
| Paint (interior) | PAINT-INT-SATIN-SW | ❌ Missing |
| Paint (exterior) | PAINT-EXT-SATIN-SW | ❌ Missing |
| Insulation | INSUL-FIBERGLASS-R30 | ❌ Missing |
| Drywall | DRYWALL-HALF-4X12 | ❌ Missing |

**Status**: 4/15 SKUs exist (27% coverage)

#### Sunset Valley Executive Package

| Category | SKU | Product Name | Exists? |
|----------|-----|--------------|---------|
| Windows | WINDOW-8F26E917 | MaxStrength Casement Window | ✅ Yes (reused) |
| Doors | DOOR-E93CC71C | StructureMaster Sliding Patio Door | ✅ Yes (reused) |
| Roofing | ROOF-7B1F4022 | SafeGuard Premium Designer Shingles | ✅ Yes (reused) |
| Flooring (hardwood) | FLOOR-HARDWOOD-WALNUT | ❌ Missing |
| Flooring (tile) | FLOOR-TILE-PORCELAIN-24 | ❌ Missing |
| Flooring (carpet) | FLOOR-CARPET-PREMIUM | ❌ Missing |
| Kitchen faucet | PLUMB-FAUCET-KIT-DELTA | ❌ Missing |
| Bath faucet | PLUMB-FAUCET-BATH-KOHLER | ❌ Missing |
| Lighting (chandelier) | LIGHT-CHANDELIER-DINING | ❌ Missing |
| Lighting (pendant) | LIGHT-PENDANT-ISLAND | ❌ Missing |
| Siding | SIDING-STONE-VENEER | ❌ Missing |
| Paint (interior) | PAINT-INT-BENJAMIN | ❌ Missing |
| Paint (exterior) | PAINT-EXT-BENJAMIN | ❌ Missing |
| Insulation | INSUL-SPRAY-FOAM | ❌ Missing |
| Drywall | DRYWALL-MOISTURE | ❌ Missing |

**Status**: 3/15 SKUs exist (20% coverage)

### Critical Action Items

1. **Create missing SKUs** for all selection package mappings
2. **Verify SKU naming conventions** (e.g., PAINT-INT vs PAINT-EXT typo)
3. **Add product variants** to differentiate between tiers (chrome vs brushed nickel, standard vs premium)

---

## Recommendations

### Immediate Actions (Phase 3)

1. **Add 60-80 products** to fill critical gaps:
   - Electrical: 12-15 products
   - Plumbing pipes/fittings: 12-15 products
   - HVAC: 10-12 products
   - Concrete: 8-10 products
   - Drywall supplies: 5-7 products
   - Appliances: 5-8 products
   - Additional flooring/paint/siding: 8-12 products

2. **Update product-definitions.js** to include:
   - New categories (electrical, plumbing_pipes, hvac, concrete, appliances)
   - All UOMs (CY, BAG, SQ, LF, GAL, CASE, SY, LB, BOX, ROLL, TON)
   - Products for all 3 selection package tiers

3. **Create missing package SKUs**:
   - 36 missing SKUs across 3 packages
   - Prioritize Builder's Choice (most SKUs missing)

4. **Classify 10 unassigned products**:
   - Assign construction_phase
   - Assign quality_tier

### Medium-Term Actions (Phases 4-5)

1. **Add product images** for critical products (windows, doors, fixtures)
2. **Create product bundles** in ACO for common combinations
3. **Add product attributes** needed for BOM calculator (coverage rates, typical quantities)
4. **Document product relationships** (cross-sell, upsell, alternatives)

### Long-Term Actions (Phase 8+)

1. **Expand to 250-300 products** for Marcus's semi-custom use case
2. **Add specialty products** for Lisa's remodeling use case
3. **Add DIY-specific products** for David's deck builder

---

## Gap Summary Table

| Category | Current | Target | Gap | Priority |
|----------|---------|--------|-----|----------|
| Electrical | 0 | 12-15 | 12-15 | 🔴 Critical |
| Plumbing Pipes/Fittings | 0 | 12-15 | 12-15 | 🔴 Critical |
| HVAC | 0 | 10-12 | 10-12 | 🔴 Critical |
| Concrete | 0 | 8-10 | 8-10 | 🔴 Critical |
| Appliances | 0 | 5-8 | 5-8 | 🔴 Critical |
| Drywall Supplies | 0 | 5-7 | 5-7 | 🔴 Critical |
| Additional Flooring | 8 | 12-15 | 4-7 | 🟡 High |
| Additional Paint | 6 | 9-10 | 3-4 | 🟡 High |
| Additional Insulation | 3 | 8-10 | 5-7 | 🟡 High |
| Additional Siding | 6 | 10-12 | 4-6 | 🟡 High |
| Trim & Molding | 0 | 3-5 | 3-5 | 🟢 Medium |
| Additional Roofing | 14 | 17-19 | 3-5 | 🟢 Medium |
| **TOTAL** | **108** | **170-210** | **62-102** | |

---

## Next Steps

1. ✅ **Complete**: Material estimating rules documented
2. ✅ **Complete**: Current catalog audited
3. ⏭️ **Next**: Generate reference BOMs to validate gaps
4. ⏭️ **Next**: Update product-definitions.js with new products
5. ⏭️ **Next**: Regenerate and ingest expanded catalog

---

**Last Updated**: 2024-11-26  
**Audit Run**: `node scripts/tools/product-audit.js`  
**Status**: ✅ Complete - Ready for Product Expansion

