# Phase 6-0-Foundation: Product Data Requirements

**📊 Document Type**: Product Data Specification  
**📖 Reading Time**: 15-20 minutes  
**⏱️ Timeline**: 2-3 days  
**👥 Audience**: Product managers, content team, developers

This is **Part 8 of 8** in the Phase 6-Foundation series.

**← Previous**: [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)

---

## Overview

**Critical**: Phase 6A (Sarah) and all subsequent persona implementations depend on having proper product data in the buildright-aco repository.

**Why This Matters**:
- Sarah needs house building materials (lumber, windows, doors, roofing, siding)
- Selection packages need real SKU mappings
- BOM generation needs accurate product data
- Configurator needs product images
- All personas will use this same product catalog

**Timeline**: Must complete before Phase 6A implementation begins

---

## 🎯 Product Data Goals

### For Sarah Martinez (Production Builder)
**Use Case**: Order materials for house construction in phases

**Needs**:
- 50-100 house building material SKUs
- Organized by construction phase (Foundation, Envelope, Interior)
- Multiple options per category (standard, premium, executive quality)
- Selection packages with SKU mappings
- Product images for configurator

### For Other Personas
**Marcus** (General Contractor): Same products, quality tier selection  
**Lisa** (Remodeling Contractor): Subset of products (bathroom, kitchen)  
**David** (DIY Homeowner): Deck materials (subset)  
**Kevin** (Store Manager): All products for restock

---

## 📋 Task 1: Product Inventory Audit (buildright-aco)

### Objective
Assess current product catalog in buildright-aco and identify gaps

### Actions

**1. Access buildright-aco Repository**
- Clone/pull latest from buildright-aco
- Locate product data files (likely JSON, CSV, or database export)
- Document current product data structure

**2. Categorize Existing Products**

Create inventory spreadsheet with columns:
- SKU
- Product Name
- Category (lumber, windows, doors, roofing, siding, flooring, etc.)
- Subcategory (2x4, double-hung, entry, shingles, vinyl, carpet, etc.)
- Construction Phase (foundation_framing, envelope, interior_finish)
- Quality Tier (standard, premium, executive)
- Price
- Image Available? (Y/N)
- Notes

**3. Identify Gaps**

**Required Categories** (minimum for Sarah):

| Category | Subcategories | Min SKUs | Purpose |
|----------|---------------|----------|---------|
| Lumber | 2x4, 2x6, 2x8, 2x10, Plywood, OSB | 8-10 | Foundation framing |
| Windows | Double-hung, Casement, Picture | 6-9 | Envelope |
| Doors | Entry, Patio, Garage | 6-9 | Envelope |
| Roofing | Shingles, Underlayment, Flashing | 6-8 | Envelope |
| Siding | Vinyl, Hardie, Stucco | 6-9 | Envelope |
| Flooring | Carpet, Vinyl Plank, Tile, Hardwood | 8-10 | Interior |
| Drywall | 1/2", 5/8", Supplies | 4-6 | Interior |
| Paint | Interior, Exterior, Primer | 6-8 | Interior |
| Fixtures | Faucets, Lighting, Hardware | 8-10 | Interior |
| **TOTAL** | | **60-80 SKUs** | Full house |

**4. Document Findings**

Create: `PRODUCT-INVENTORY-AUDIT.md` with:
- Current product count per category
- Quality tier distribution
- Price ranges
- Image availability
- Gaps to fill

---

## 📦 Task 2: Define Selection Packages

### Objective
Map 3 selection packages to real SKUs from buildright-aco

### Package Definitions

#### Package 1: Builder's Choice (Standard)
**Description**: Standard materials for production building  
**Added Cost**: $0 (baseline)  
**Target**: Value-conscious builders

**SKU Requirements**:
```javascript
{
  "id": "builders-choice",
  "name": "Builder's Choice",
  "addedCost": 0,
  "skuMappings": {
    // Windows
    "windows_double_hung_3660": "WIN-VINYL-STD-3660",      // Standard vinyl
    "windows_casement_2436": "WIN-VINYL-STD-2436",
    
    // Doors
    "doors_entry": "DOOR-FBRG-STD-3080",                  // Fiberglass standard
    "doors_patio": "DOOR-VINYL-SLIDE-6080",
    
    // Roofing
    "roofing_shingles": "ROOF-3TAB-BLACK",                // 3-tab shingles
    "roofing_underlayment": "ROOF-FELT-30LB",
    
    // Siding
    "siding_primary": "SIDING-VINYL-STD-WHITE",           // Standard vinyl
    "siding_trim": "SIDING-VINYL-TRIM-WHITE",
    
    // Flooring
    "flooring_carpet": "FLOOR-CARP-POLY-BEIGE",           // Standard carpet
    "flooring_vinyl": "FLOOR-VINYL-STD-OAK",
    "flooring_tile": "FLOOR-TILE-CERA-12X12",
    
    // Paint
    "paint_interior": "PAINT-INT-EGGSHELL-WHITE",
    "paint_exterior": "PAINT-EXT-SATIN-BEIGE",
    
    // (Continue for all material categories...)
  }
}
```

---

#### Package 2: Desert Ridge Premium
**Description**: Upgraded materials tailored for Desert Ridge subdivision  
**Added Cost**: +$18,000  
**Target**: Mid-range production builders

**SKU Requirements**:
```javascript
{
  "id": "desert-ridge-premium",
  "name": "Desert Ridge Premium",
  "subdivisionSpecific": "Desert Ridge",
  "addedCost": 18000,
  "skuMappings": {
    // Windows
    "windows_double_hung_3660": "WIN-ANDER-400-3660",     // Andersen 400 Series
    "windows_casement_2436": "WIN-ANDER-400-2436",
    
    // Doors
    "doors_entry": "DOOR-THERM-SS-3080",                  // Therma-Tru Smooth Star
    "doors_patio": "DOOR-ANDER-GLIDE-6080",
    
    // Roofing
    "roofing_shingles": "ROOF-GAF-HDZ-PEWTER",            // GAF Timberline HDZ
    "roofing_underlayment": "ROOF-SYNTH-PREMIUM",
    
    // Siding
    "siding_primary": "SIDING-HARDIE-MONTEREY",           // Hardie Plank
    "siding_trim": "SIDING-HARDIE-TRIM-WHITE",
    
    // Flooring
    "flooring_carpet": "FLOOR-CARP-NYLON-TAUPE",          // Nylon carpet
    "flooring_vinyl": "FLOOR-VINYL-PREM-DRIFTWOOD",       // Shaw vinyl plank
    "flooring_tile": "FLOOR-TILE-PORC-18X18",
    
    // Paint
    "paint_interior": "PAINT-SW-AGRAY",                   // Sherwin Williams Agreeable Gray
    "paint_exterior": "PAINT-SW-MONTAUK-DUSK",
    
    // (Continue for all material categories...)
  }
}
```

---

#### Package 3: Sunset Valley Executive
**Description**: Premium materials for executive homes  
**Added Cost**: +$35,000  
**Target**: High-end production builders

**SKU Requirements**:
```javascript
{
  "id": "sunset-valley-executive",
  "name": "Sunset Valley Executive",
  "subdivisionSpecific": "Sunset Valley",
  "addedCost": 35000,
  "skuMappings": {
    // Windows
    "windows_double_hung_3660": "WIN-PELLA-ARCH-3660",    // Pella Architect
    "windows_casement_2436": "WIN-PELLA-ARCH-2436",
    
    // Doors
    "doors_entry": "DOOR-MAHOG-EXEC-3080",                // Mahogany executive
    "doors_patio": "DOOR-PELLA-MULTI-8080",
    
    // Roofing
    "roofing_shingles": "ROOF-CERT-PRES-CHARCOAL",        // CertainTeed Presidential
    "roofing_underlayment": "ROOF-SYNTH-EXEC",
    
    // Siding
    "siding_primary": "SIDING-HARDIE-ARTISAN-CUSTOM",     // Hardie Artisan
    "siding_trim": "SIDING-AZEK-TRIM-WHITE",
    
    // Flooring
    "flooring_carpet": "FLOOR-CARP-WOOL-GRAY",            // Wool blend carpet
    "flooring_vinyl": "FLOOR-VINYL-EXEC-WALNUT",
    "flooring_tile": "FLOOR-TILE-STONE-24X24",            // Natural stone
    
    // Paint
    "paint_interior": "PAINT-BM-CHANTILLY",               // Benjamin Moore premium
    "paint_exterior": "PAINT-BM-COPLEY-GRAY",
    
    // (Continue for all material categories...)
  }
}
```

---

### Package Mapping Deliverables

Create: `SELECTION-PACKAGES.json` with complete mappings:

```javascript
{
  "packages": {
    "builders-choice": { /* full mappings */ },
    "desert-ridge-premium": { /* full mappings */ },
    "sunset-valley-executive": { /* full mappings */ }
  },
  
  "materialSlots": [
    {
      "id": "windows_double_hung_3660",
      "name": "Double Hung Windows 36x60",
      "category": "windows",
      "phase": "envelope",
      "quantity": 18,
      "unit": "each"
    },
    // ... all material slots
  ]
}
```

---

## 🖼️ Task 3: Product Images

### Objective
Ensure all house building materials have appropriate product images

### Image Requirements

**Specifications**:
- **Format**: PNG or JPEG
- **Size**: 800x600px minimum
- **Background**: White or transparent
- **Style**: Professional product photography
- **Naming**: `SKU.png` (e.g., `WIN-ANDER-400-3660.png`)

**Storage Location**: `buildright-eds/images/products/`

### Image Audit

Create checklist for each SKU:
- [ ] Product image exists
- [ ] Image meets quality standards
- [ ] Image properly named
- [ ] Image optimized for web

### Image Sources

**Options**:
1. **Manufacturer websites**: Download product images
2. **Stock photography**: Purchase/license images
3. **Placeholders**: Use temporary placeholder images
4. **Custom photography**: Hire photographer (if budget allows)

**Recommendation**: Start with manufacturer images and placeholders, upgrade later

---

## 📊 Task 4: Product Data Enhancement (buildright-aco)

### Objective
Add metadata to products for Phase 6 functionality

### Required Product Attributes

**Add to each product**:

```javascript
{
  "sku": "WIN-ANDER-400-3660",
  "name": "Andersen 400 Series Double Hung 36x60",
  "category": "windows",
  "subcategory": "double_hung",
  "constructionPhase": "envelope",          // ⭐ NEW
  "qualityTier": "premium",                  // ⭐ NEW
  "brand": "Andersen",
  "size": "36x60",
  "description": "Premium vinyl double-hung window...",
  "price": 425.00,
  "image": "/images/products/WIN-ANDER-400-3660.png",
  "attributes": {
    "energyStar": true,
    "material": "vinyl",
    "color": "white"
  },
  "relationships": {                         // ⭐ NEW
    "upgrades": ["WIN-PELLA-ARCH-3660"],    // Higher tier option
    "downgrades": ["WIN-VINYL-STD-3660"],   // Lower tier option
    "substitutes": ["WIN-MILG-ULTRA-3660"]  // Alternative if out of stock
  }
}
```

### Bulk Update Process

1. Export products from buildright-aco
2. Add new fields (constructionPhase, qualityTier, relationships)
3. Validate data
4. Import back to buildright-aco
5. Test queries for new attributes

---

## 📄 Task 5: Update templates.json

### Objective
Add selection packages and material requirements to templates

### Current templates.json Structure
```javascript
{
  "templates": [
    {
      "id": "sedona",
      "name": "The Sedona",
      "sqft": 2450,
      "bedrooms": 3,
      "bathrooms": 2.5,
      "stories": 1,
      "variants": [
        {
          "id": "sedona-standard",
          "name": "Standard",
          "sqft": 2450
        },
        {
          "id": "sedona-bonus",
          "name": "Bonus Room",
          "sqft": 2680,
          "addedCost": 8000
        }
      ]
    }
  ]
}
```

### Enhanced templates.json Structure

Add packages and material requirements:

```javascript
{
  "templates": [
    {
      "id": "sedona",
      "name": "The Sedona",
      "sqft": 2450,
      "bedrooms": 3,
      "bathrooms": 2.5,
      "stories": 1,
      "basePrice": 93000,
      
      // ⭐ NEW: Material requirements
      "materialRequirements": {
        "foundation_framing": {
          "lumber_2x4": { qty: 400, unit: "linear_feet" },
          "lumber_2x6": { qty: 200, unit: "linear_feet" },
          "plywood_3_4": { qty: 80, unit: "sheets" }
        },
        "envelope": {
          "windows_double_hung_3660": { qty: 18, unit: "each" },
          "doors_entry": { qty: 1, unit: "each" },
          "roofing_shingles": { qty: 32, unit: "squares" },
          "siding_primary": { qty: 2450, unit: "sqft" }
        },
        "interior_finish": {
          "flooring_carpet": { qty: 1200, unit: "sqft" },
          "flooring_vinyl": { qty: 800, unit: "sqft" },
          "flooring_tile": { qty: 450, unit: "sqft" },
          "paint_interior": { qty: 25, unit: "gallons" }
        }
      },
      
      "variants": [ /* ... */ ]
    }
  ],
  
  // ⭐ NEW: Selection packages
  "packages": {
    "builders-choice": { /* from Task 2 */ },
    "desert-ridge-premium": { /* from Task 2 */ },
    "sunset-valley-executive": { /* from Task 2 */ }
  }
}
```

### Update Process

1. Load current templates.json
2. Add materialRequirements to each template
3. Add packages section
4. Validate JSON structure
5. Test BOM generation logic
6. Commit changes

---

## 🧪 Task 6: Validation & Testing

### Objective
Verify product data works for Phase 6 use cases

### Test Scenarios

**Test 1: Package Resolution**
```javascript
// Given: Sarah selects "Desert Ridge Premium" package
const package = packages['desert-ridge-premium'];

// When: System resolves SKUs
const windowSku = package.skuMappings['windows_double_hung_3660'];
// Should return: "WIN-ANDER-400-3660"

// Then: Fetch product from buildright-aco
const product = await getProduct(windowSku);
// Should return: Full product details with image
```

**Test 2: BOM Generation**
```javascript
// Given: Sedona template with Desert Ridge Premium package
const template = templates.find(t => t.id === 'sedona');
const package = packages['desert-ridge-premium'];

// When: Generate BOM for envelope phase
const bom = generateBOM({
  template,
  package,
  phases: ['envelope']
});

// Then: BOM should contain correct products
// - 18x Andersen 400 Series windows @ $425 each = $7,650
// - 1x Therma-Tru entry door @ $1,200 = $1,200
// - 32 squares GAF roofing @ $85/sq = $2,720
// - 2450 sqft Hardie siding @ $4.50/sqft = $11,025
// Total: ~$22,595
```

**Test 3: Product Filtering**
```javascript
// When: Filter products by phase
const envelopeProducts = products.filter(p => 
  p.constructionPhase === 'envelope'
);

// Then: Should return windows, doors, roofing, siding
// Should NOT return lumber, flooring, paint
```

**Test 4: Image Loading**
```javascript
// Given: Product with image path
const product = await getProduct('WIN-ANDER-400-3660');

// When: Load image
const imageUrl = `/images/products/${product.sku}.png`;

// Then: Image should load without 404
// Image should display in configurator
```

---

## 📁 Deliverables Checklist

### Documentation
- [ ] `PRODUCT-INVENTORY-AUDIT.md` - Current state assessment
- [ ] `SELECTION-PACKAGES.json` - Complete package definitions
- [ ] `PRODUCT-DATA-ENHANCEMENT-GUIDE.md` - How to add new products

### buildright-aco (Product Data)
- [ ] Minimum 60 house building material SKUs
- [ ] Products categorized by constructionPhase
- [ ] Products categorized by qualityTier
- [ ] Product relationships (upgrades, substitutes)
- [ ] All required categories covered

### buildright-eds (Frontend)
- [ ] `data/templates.json` updated with packages
- [ ] `data/templates.json` updated with materialRequirements
- [ ] Product images in `images/products/` (or placeholders)
- [ ] Image naming matches SKU convention

### Testing
- [ ] Package resolution works
- [ ] BOM generation works
- [ ] Product filtering works
- [ ] Images load correctly
- [ ] No broken SKU references

---

## 🎯 Success Criteria

**Product Catalog Completeness**:
- ✅ 60+ house building SKUs available
- ✅ All 3 quality tiers represented
- ✅ All construction phases covered
- ✅ Product images available (or placeholders)

**Package Definitions**:
- ✅ 3 packages fully mapped to SKUs
- ✅ Cost differentials calculated
- ✅ All material slots filled

**Data Integration**:
- ✅ templates.json updated and validated
- ✅ BOM generation testable
- ✅ No broken references

**Documentation**:
- ✅ Product inventory documented
- ✅ Package definitions documented
- ✅ Enhancement guide created

---

## 🚀 Implementation Timeline

| Day | Task | Hours | Owner |
|-----|------|-------|-------|
| 1 | Product inventory audit | 3-4h | Product/Dev |
| 1 | Define selection packages | 2-3h | Product |
| 2 | Product data enhancement | 3-4h | Dev |
| 2 | Product images | 2-3h | Content |
| 3 | Update templates.json | 1-2h | Dev |
| 3 | Validation & testing | 2-3h | Dev |
| **Total** | | **13-19h** | **2-3 days** |

---

## ❓ FAQ

**Q: Do we need real manufacturer SKUs?**  
**A**: No. Use realistic-looking SKUs (e.g., WIN-ANDER-400-3660). Real SKUs come during ACO integration.

**Q: What if we don't have product images?**  
**A**: Use placeholder images initially. Real images can be added later.

**Q: How detailed should product descriptions be?**  
**A**: Minimal for MVP. Focus on: name, category, price, phase, tier.

**Q: Can we add more packages later?**  
**A**: Yes! Start with 3, add more as needed per subdivision.

**Q: Do all products need all attributes?**  
**A**: No. Only products used in packages need full metadata.

---

## 🔗 Next Steps

After completing product data preparation:

1. **Commit changes** to `phase-6-0-foundation` branch
2. **Implement ProjectManager** (scripts/project-manager.js)
3. **Test with real product data**
4. **Create `phase-6-sarah` branch**
5. **Begin Phase 6A implementation**

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Product Data Preparation

