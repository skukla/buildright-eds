# Product Data Enhancement Plan for Sarah's Template Configurator

**Status:** 🚧 In Progress  
**Branch:** `phase-6-0-foundation`  
**Related:** `07-PRODUCT-DATA-REQUIREMENTS.md`

---

## 📊 Current State (Audit Results)

### ✅ Strengths
- **70 products** in buildright-aco repository
- **86%** have `construction_phase` attribute (60/70)
- **86%** have `quality_tier` attribute (60/70)
- **Good coverage:** windows_doors (14), roofing (14), structural_materials (14), fasteners_hardware (14)

### ⚠️ Gaps Identified
1. **Missing Categories** (0 products):
   - Siding
   - Flooring
   - Paint
   - Fixtures (plumbing, lighting)
   - Insulation
   - Drywall
   - Electrical
   - Plumbing

2. **No Product Images** (0% coverage)

3. **Quality Tier Imbalance**:
   - Professional: 32 products (too many)
   - Builder Grade: 8 products (too few)
   - Luxury: 1 product (too few)

4. **10 products** missing phase/tier attributes

---

## 🎯 Enhancement Strategy

### Phase 1: Fix Existing Products (30 min)
- [ ] Add phase/tier to 10 unassigned products
- [ ] Rebalance quality tiers (convert some professional → builder_grade/premium/luxury)

### Phase 2: Add Critical Missing Products (2 hours)
- [ ] Flooring (6-8 products across tiers)
- [ ] Fixtures - Plumbing (4-6 products)
- [ ] Fixtures - Lighting (4-6 products)
- [ ] Siding (4-6 products)
- [ ] Paint (4-6 products)
- [ ] Insulation (2-4 products)
- [ ] Drywall (2-4 products)

### Phase 3: Product Images (1.5 hours)
- [ ] Source/create images for key products (windows, doors, roofing, flooring, fixtures)
- [ ] Focus on products used in selection packages
- [ ] Aim for 40-50% coverage minimum

### Phase 4: Selection Package SKU Mapping (1 hour)
- [ ] Map Builder's Choice package (builder_grade SKUs)
- [ ] Map Desert Ridge Premium package (premium SKUs)
- [ ] Map Sunset Valley Executive package (luxury SKUs)

### Phase 5: Update templates.json (30 min)
- [ ] Add package definitions with SKU mappings
- [ ] Update material requirements per template

### Phase 6: Testing & Validation (30 min)
- [ ] Re-run audit script
- [ ] Validate all packages have required SKUs
- [ ] Test BOM generation logic

---

## 📋 Detailed Task List

### Task 1: Create New Products Script

**File:** `buildright-aco/scripts/add-sarah-products.js`

**New Products to Add:**

#### Flooring (8 products)
```javascript
// Builder Grade
- FLOOR-VINYL-LUX-OAK (Luxury Vinyl Plank - Oak, builder_grade)
- FLOOR-CARPET-STAND (Standard Carpet - Beige, builder_grade)

// Premium
- FLOOR-HARDWOOD-OAK (Engineered Hardwood - Oak, premium)
- FLOOR-TILE-CERAMIC-12 (Ceramic Tile 12x12, premium)
- FLOOR-VINYL-PREMIUM (Premium Vinyl Plank - Gray, premium)

// Luxury
- FLOOR-HARDWOOD-WALNUT (Solid Hardwood - Walnut, luxury)
- FLOOR-TILE-PORCELAIN-24 (Porcelain Tile 24x24, luxury)
- FLOOR-CARPET-PREMIUM (Premium Carpet - Neutral, luxury)
```

#### Fixtures - Plumbing (6 products)
```javascript
// Builder Grade
- PLUMB-FAUCET-KIT-CHROME (Kitchen Faucet - Chrome, builder_grade)
- PLUMB-FAUCET-BATH-CHROME (Bathroom Faucet - Chrome, builder_grade)

// Premium
- PLUMB-FAUCET-KIT-BRUSH (Kitchen Faucet - Brushed Nickel, premium)
- PLUMB-FAUCET-BATH-BRUSH (Bathroom Faucet - Brushed Nickel, premium)

// Luxury
- PLUMB-FAUCET-KIT-DELTA (Kitchen Faucet - Delta Touch, luxury)
- PLUMB-FAUCET-BATH-KOHLER (Bathroom Faucet - Kohler Premium, luxury)
```

#### Fixtures - Lighting (6 products)
```javascript
// Builder Grade
- LIGHT-CEILING-FLUSH (Flush Mount Ceiling - Basic, builder_grade)
- LIGHT-RECESSED-4IN (4" Recessed Can Light, builder_grade)

// Premium
- LIGHT-CEILING-SEMI (Semi-Flush Ceiling - Brushed Nickel, premium)
- LIGHT-RECESSED-6IN-LED (6" LED Recessed Light, premium)

// Luxury
- LIGHT-CHANDELIER-DINING (Dining Chandelier - Modern, luxury)
- LIGHT-PENDANT-ISLAND (Kitchen Island Pendant Set, luxury)
```

#### Siding (6 products)
```javascript
// Builder Grade
- SIDING-VINYL-STANDARD (Vinyl Siding - Standard, builder_grade)
- SIDING-FIBER-SMOOTH (Fiber Cement - Smooth, builder_grade)

// Premium
- SIDING-FIBER-WOOD (Fiber Cement - Wood Texture, premium)
- SIDING-STUCCO-STANDARD (Stucco System - Standard, premium)

// Luxury
- SIDING-STONE-VENEER (Stone Veneer - Natural, luxury)
- SIDING-STUCCO-PREMIUM (Stucco System - Premium Finish, luxury)
```

#### Paint (6 products)
```javascript
// Builder Grade
- PAINT-INT-FLAT-WHT (Interior Flat White - 5gal, builder_grade)
- PAINT-INT-EGGSHELL-BG (Interior Eggshell Beige - 5gal, builder_grade)

// Premium
- PAINT-INT-SATIN-SW (Sherwin Williams Satin - 5gal, premium)
- PAINT-EXT-SATIN-SW (Sherwin Williams Exterior - 5gal, premium)

// Luxury
- PAINT-INT-BENJAMIN (Benjamin Moore Aura Interior - 5gal, luxury)
- PAINT-EXT-BENJAMIN (Benjamin Moore Aura Exterior - 5gal, luxury)
```

#### Insulation & Drywall (6 products)
```javascript
// Builder Grade
- INSUL-FIBERGLASS-R15 (Fiberglass Batt R-15, builder_grade)
- DRYWALL-HALF-4X8 (1/2" Drywall 4x8 Sheet, builder_grade)

// Premium
- INSUL-FIBERGLASS-R30 (Fiberglass Batt R-30, premium)
- DRYWALL-HALF-4X12 (1/2" Drywall 4x12 Sheet, premium)

// Luxury
- INSUL-SPRAY-FOAM (Spray Foam Insulation Kit, luxury)
- DRYWALL-MOISTURE (Moisture-Resistant Drywall 4x8, luxury)
```

---

## 🏷️ Selection Package SKU Mappings

### Builder's Choice Package
```javascript
{
  "id": "builders-choice",
  "name": "Builder's Choice",
  "tier": "builder_grade",
  "addedCost": 0,
  "skuMappings": {
    // Windows & Doors
    "windows_double_hung": "WINDOW-8039584D",
    "doors_entry": "DOOR-34C72FD2",
    
    // Roofing
    "roofing_shingles": "ROOF-23151318",
    
    // Flooring
    "flooring_carpet": "FLOOR-CARPET-STAND",
    "flooring_vinyl": "FLOOR-VINYL-LUX-OAK",
    
    // Fixtures
    "fixtures_kitchen_faucet": "PLUMB-FAUCET-KIT-CHROME",
    "fixtures_bath_faucet": "PLUMB-FAUCET-BATH-CHROME",
    "fixtures_lighting_ceiling": "LIGHT-CEILING-FLUSH",
    "fixtures_lighting_recessed": "LIGHT-RECESSED-4IN",
    
    // Finishes
    "siding": "SIDING-VINYL-STANDARD",
    "paint_interior": "PAINT-INT-FLAT-WHT",
    "paint_exterior": "PAINT-INT-EGGSHELL-BG",
    
    // Insulation & Drywall
    "insulation": "INSUL-FIBERGLASS-R15",
    "drywall": "DRYWALL-HALF-4X8"
  }
}
```

### Desert Ridge Premium Package
```javascript
{
  "id": "desert-ridge-premium",
  "name": "Desert Ridge Premium",
  "subdivisionSpecific": "Desert Ridge",
  "tier": "premium",
  "addedCost": 18000,
  "skuMappings": {
    // Windows & Doors
    "windows_double_hung": "WINDOW-8F26E917",
    "doors_entry": "DOOR-E93CC71C",
    
    // Roofing
    "roofing_shingles": "ROOF-7B1F4022",
    
    // Flooring
    "flooring_hardwood": "FLOOR-HARDWOOD-OAK",
    "flooring_tile": "FLOOR-TILE-CERAMIC-12",
    "flooring_carpet": "FLOOR-CARPET-PREMIUM",
    
    // Fixtures
    "fixtures_kitchen_faucet": "PLUMB-FAUCET-KIT-BRUSH",
    "fixtures_bath_faucet": "PLUMB-FAUCET-BATH-BRUSH",
    "fixtures_lighting_ceiling": "LIGHT-CEILING-SEMI",
    "fixtures_lighting_recessed": "LIGHT-RECESSED-6IN-LED",
    
    // Finishes
    "siding": "SIDING-STUCCO-STANDARD",
    "paint_interior": "PAINT-INT-SATIN-SW",
    "paint_exterior": "PAINT-EXT-SATIN-SW",
    
    // Insulation & Drywall
    "insulation": "INSUL-FIBERGLASS-R30",
    "drywall": "DRYWALL-HALF-4X12"
  }
}
```

### Sunset Valley Executive Package
```javascript
{
  "id": "sunset-valley-executive",
  "name": "Sunset Valley Executive",
  "subdivisionSpecific": "Sunset Valley",
  "tier": "luxury",
  "addedCost": 42000,
  "skuMappings": {
    // Windows & Doors
    "windows_double_hung": "WINDOW-[TBD-LUXURY]",
    "doors_entry": "DOOR-E93CC71C",
    
    // Roofing
    "roofing_tile": "ROOF-[TBD-TILE]",
    
    // Flooring
    "flooring_hardwood": "FLOOR-HARDWOOD-WALNUT",
    "flooring_tile": "FLOOR-TILE-PORCELAIN-24",
    "flooring_carpet": "FLOOR-CARPET-PREMIUM",
    
    // Fixtures
    "fixtures_kitchen_faucet": "PLUMB-FAUCET-KIT-DELTA",
    "fixtures_bath_faucet": "PLUMB-FAUCET-BATH-KOHLER",
    "fixtures_lighting_chandelier": "LIGHT-CHANDELIER-DINING",
    "fixtures_lighting_pendant": "LIGHT-PENDANT-ISLAND",
    
    // Finishes
    "siding": "SIDING-STONE-VENEER",
    "paint_interior": "PAINT-INT-BENJAMIN",
    "paint_exterior": "PAINT-EXT-BENJAMIN",
    
    // Insulation & Drywall
    "insulation": "INSUL-SPRAY-FOAM",
    "drywall": "DRYWALL-MOISTURE"
  }
}
```

---

## ✅ Success Criteria

- [ ] All critical categories have 4+ products
- [ ] Each quality tier has balanced representation
- [ ] 3 complete selection packages with all SKUs mapped
- [ ] 40%+ products have images
- [ ] templates.json updated with packages
- [ ] Audit script shows 0 critical gaps
- [ ] All changes committed to buildright-aco repository

---

## 📝 Implementation Notes

### Where to Make Changes

1. **buildright-aco/data/buildright/products.json**
   - Add new products
   - Update existing products (fix tiers, add attributes)

2. **buildright-eds/data/templates.json**
   - Add `packages` array at root level
   - Link templates to compatible packages

3. **buildright-eds/images/products/**
   - Add product images (can start with placeholders)

### Testing Strategy

1. Run `product-audit.js` after each batch of changes
2. Verify SKU mappings resolve to real products
3. Test BOM generation with each package
4. Validate cost calculations

---

**Next:** Begin implementation with Task 1 (Add New Products)

