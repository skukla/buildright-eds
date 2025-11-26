# Product Taxonomy Analysis: Unified vs. Catalog-Per-Persona

**📊 Document Type**: Strategic Architecture Decision  
**📖 Reading Time**: 20-25 minutes  
**👥 Audience**: Product managers, architects, stakeholders  
**⚠️ Impact**: This decision affects the entire BuildRight data architecture

---

## Executive Summary

**Decision Required**: Should BuildRight use:
- **Option A**: Single unified taxonomy with multi-level attributes (one catalog for all)
- **Option B**: Separate ACO catalogs per persona (5 catalogs)

**Recommendation**: **Option A - Unified Multi-Level Taxonomy** ✅

**Why**: More maintainable, more realistic for a materials supplier, enables cross-persona features, and demonstrates ACO's attribute-based filtering capabilities better.

---

## Problem Statement

### Current Situation
- BuildRight has **5 distinct personas** with different mental models for organizing materials
- Current taxonomy is **contractor/retail-focused** (general purpose)
- **Sarah's workflow** (production builder) doesn't align with current categories
- Need to scale to support all personas without creating data chaos

### The Core Question
Do production builders, general contractors, remodelers, DIY homeowners, and store managers need **completely different product catalogs**, or can we organize a **single catalog** in a way that makes sense for everyone?

---

## Persona Shopping Behavior Analysis

### Sarah Martinez - Production Home Builder
**Mental Model**: Construction phase → Selection category → Package tier

**How She Organizes Materials**:
1. **Primary**: By **construction phase** (when she orders)
   - Foundation & Framing (order first)
   - Envelope (order 2-3 weeks later)
   - Interior Finish (order 4-6 weeks later)

2. **Secondary**: By **selection category** (what buyers choose)
   - Windows, Doors, Roofing, Siding, Flooring, Paint, Fixtures

3. **Tertiary**: By **package tier** (quality/price level)
   - Good: Builder's Choice
   - Better: Desert Ridge Premium (+$18k)
   - Best: Sunset Valley Executive (+$35k)

**Key Insight**: Sarah doesn't browse individual SKUs. She selects a **package** (e.g., "Desert Ridge Premium"), which automatically maps selection categories to specific SKUs.

**Example**:
```
Package: Desert Ridge Premium
├── Windows → "WIN-ANDER-400-3660" (Andersen 400 Series)
├── Doors → "DOOR-THERM-SS-3080" (Therma-Tru)
├── Roofing → "ROOF-GAF-HDZ-PEWTER" (GAF Timberline HDZ)
└── Flooring → "FLOOR-VINYL-PREM-DRIFTWOOD" (Shaw Luxury Vinyl)
```

---

### Marcus Johnson - General Contractor
**Mental Model**: Project phase → Quality tier → Product type

**How He Organizes Materials**:
1. **Primary**: By **project phase** (what he's working on now)
   - Foundation & Framing
   - Envelope
   - Interior Finish

2. **Secondary**: By **quality tier** (client budget)
   - Builder Grade (value projects)
   - Professional (standard commercial)
   - Premium (high-end custom)

3. **Tertiary**: By **product category** (traditional building supply)
   - Lumber, Windows, Doors, Roofing, Drywall, etc.

**Key Insight**: Marcus uses the Project Wizard to generate a custom BOM based on project specs (sqft, stories, foundation type). He adjusts quantities and substitutes products based on quality tier.

**Example Flow**:
```
1. Enter project specs (2,400 sqft, 2 story, slab)
2. Select quality tier: Professional
3. System generates BOM with Professional-tier products
4. Marcus reviews, adjusts quantities, substitutes as needed
5. Orders Phase 1 materials
```

---

### Lisa Chen - Remodeling Contractor
**Mental Model**: Room → Package tier → Product category

**How She Organizes Materials**:
1. **Primary**: By **room type** (scope of work)
   - Bathroom, Kitchen, Basement, Outdoor

2. **Secondary**: By **package tier** (good/better/best)
   - Good: Budget remodel
   - Better: Standard remodel
   - Best: Premium remodel

3. **Tertiary**: By **product category within room**
   - Bathroom: Vanity, Toilet, Tub/Shower, Tile, Fixtures, Lighting
   - Kitchen: Cabinets, Countertops, Sink, Faucet, Appliances, Backsplash

**Key Insight**: Lisa presents Good/Better/Best package options to clients, then customizes individual selections within the chosen package.

**Example**:
```
Package: Bathroom Better
├── Vanity: $850 (can upgrade to $1,200 option)
├── Toilet: $320 (can upgrade to dual-flush $480)
├── Tub/Shower: $1,100 (can upgrade to tile shower $2,400)
└── Tile: $4.50/sqft (can upgrade to $8/sqft)
```

---

### David Thompson - DIY Homeowner
**Mental Model**: Project type → Step-by-step → Individual products

**How He Organizes Materials**:
1. **Primary**: By **project type** (what he's building)
   - Deck, Fence, Shed, Patio

2. **Secondary**: By **step in the process** (guided wizard)
   - Deck: Foundation → Framing → Decking → Railing → Finishes

3. **Tertiary**: By **specific product choice**
   - Decking: Composite vs. Pressure-Treated
   - Railing: Aluminum vs. Wood vs. Cable

**Key Insight**: David needs **educational guidance** and wants to understand **why** he needs each product. He doesn't know construction phases or industry terms.

**Example Flow**:
```
1. "I want to build a deck"
2. What size? → 12' x 20'
3. What height? → 18" above ground
4. Foundation type? (shows pictures, explains options)
5. Decking material? (shows samples, pros/cons, prices)
6. System generates shopping list with quantities
```

---

### Kevin Rodriguez - Store Manager
**Mental Model**: Velocity → Department → Product type

**How He Organizes Materials**:
1. **Primary**: By **velocity category** (how fast it sells)
   - High Velocity (fasteners, 2x4s, drywall)
   - Medium Velocity (windows, doors, specialty lumber)
   - Low Velocity (luxury finishes, specialty hardware)

2. **Secondary**: By **department** (store layout)
   - Lumber & Building Materials
   - Hardware & Fasteners
   - Doors & Windows
   - Flooring
   - Paint

3. **Tertiary**: By **restock priority**
   - Critical (< 3 days supply, high velocity)
   - High (< 7 days supply, high velocity)
   - Medium (< 14 days supply, medium velocity)
   - Low (> 14 days supply, low velocity)

**Key Insight**: Kevin doesn't care about construction phases or project types. He cares about **what's selling fast** and **what needs to be restocked**.

**Example Dashboard**:
```
CRITICAL RESTOCKS (5)
├── 2x4x8 PT Lumber: 2.3 days supply → Order 500 units
├── 3" Deck Screws: 1.8 days supply → Order 200 boxes
└── 1/2" Drywall 4x8: 2.9 days supply → Order 150 sheets

HIGH PRIORITY (12)
├── Pressure-Treated 2x6x10: 5.2 days supply → Order 300 units
└── ...
```

---

## Option A: Unified Multi-Level Taxonomy

### Proposed Structure

**Primary Categories** (Main Navigation):
```
├── Lumber & Building Materials
│   ├── Dimensional Lumber (2x4, 2x6, 2x8, 2x10)
│   ├── Engineered Lumber (LVL, I-Joists, Glulam)
│   ├── Sheet Goods (Plywood, OSB)
│   └── Specialty Lumber (Cedar, Redwood, Composite)
│
├── Doors & Windows
│   ├── Windows (Double-Hung, Casement, Picture, Slider)
│   ├── Entry Doors (Fiberglass, Steel, Wood, Mahogany)
│   ├── Patio Doors (Sliding, French, Bifold)
│   └── Garage Doors (Sectional, Carriage)
│
├── Roofing & Siding
│   ├── Roofing (Shingles, Underlayment, Flashing, Ventilation)
│   ├── Siding (Vinyl, Fiber Cement, Stucco, Stone Veneer)
│   └── Trim (PVC, Fiber Cement, Wood, Aluminum)
│
├── Framing & Drywall
│   ├── Framing Hardware (Hangers, Brackets, Straps)
│   ├── Fasteners (Nails, Screws, Bolts, Anchors)
│   ├── Insulation (Fiberglass, Spray Foam, Rigid)
│   └── Drywall (Sheets, Supplies, Tools)
│
├── Interior Finishes
│   ├── Flooring (Carpet, Vinyl, Tile, Hardwood)
│   ├── Paint (Interior, Exterior, Primer, Stain)
│   ├── Lighting (Flush Mount, Recessed, Pendant, Chandelier)
│   └── Plumbing Fixtures (Faucets, Sinks, Toilets, Showers)
│
└── Hardware & Tools
    ├── Fasteners (Nails, Screws, Bolts)
    ├── Power Tools (Saws, Drills, Sanders)
    ├── Hand Tools (Hammers, Levels, Tape Measures)
    └── Safety Equipment (Gloves, Glasses, Harnesses)
```

### Multi-Level Attributes (Applied to Every Product)

**Attribute Set 1: Construction Context**
```javascript
{
  construction_phase: [
    'foundation_framing',    // Sarah Phase 1, Marcus Phase 1
    'envelope',              // Sarah Phase 2, Marcus Phase 2
    'interior_finish'        // Sarah Phase 3, Marcus Phase 3, Lisa focus
  ],
  
  quality_tier: [
    'builder_grade',         // Entry level, value-conscious
    'professional',          // Standard commercial quality
    'premium',               // High-end residential
    'luxury'                 // Executive/custom homes
  ],
  
  package_tier: [
    'good',                  // Sarah: Builder's Choice, Lisa: Budget
    'better',                // Sarah: Desert Ridge Premium, Lisa: Standard
    'best'                   // Sarah: Sunset Valley Executive, Lisa: Premium
  ]
}
```

**Attribute Set 2: Persona-Specific Context**
```javascript
{
  // For Sarah (Selection Categories)
  selection_category: [
    'windows', 'doors', 'roofing', 'siding', 'flooring', 'paint',
    'lighting', 'plumbing_fixtures', 'hardware', 'appliances'
  ],
  
  // For Lisa (Room Categories)
  room_category: [
    'bathroom', 'kitchen', 'basement', 'outdoor', 'flooring',
    'fixtures', 'finishes', 'appliances'
  ],
  
  // For David (Project Types)
  project_type: [
    'deck', 'fence', 'shed', 'patio', 'general_construction'
  ],
  
  deck_compatible: true,
  deck_shape: ['rectangular', 'l_shaped', 'wrap_around'],
  
  // For Kevin (Velocity & Restock)
  store_velocity_category: [
    'high',      // Sells in < 7 days
    'medium',    // Sells in 7-21 days
    'low'        // Sells in > 21 days
  ],
  
  recommended_restock_quantity: 500,
  typical_days_supply: 14,
  restock_priority: ['critical', 'high', 'medium', 'low']
}
```

**Attribute Set 3: Product Characteristics**
```javascript
{
  // General attributes
  brand: 'Anderson', 'GAF', 'Hardie', 'Sherwin Williams', etc.
  color_family: 'neutral', 'white', 'gray', 'brown', etc.
  finish: 'matte', 'satin', 'gloss', 'textured'
  material: 'vinyl', 'fiberglass', 'wood', 'composite', 'metal'
  
  // Technical specs
  dimensions: { width: 36, height: 80, depth: 1.75, uom: 'inches' }
  weight: { value: 120, uom: 'lbs' }
  coverage: { value: 33, uom: 'sqft' }
  
  // Compliance
  certifications: ['Energy Star', 'LEED', 'Fire Rated']
  building_codes: ['IBC 2021', 'IRC 2021', 'Florida Building Code']
}
```

### How Each Persona Uses the Unified Catalog

#### Sarah's Experience
**URL**: `/pages/catalog.html?persona=sarah&phase=envelope&package=desert-ridge-premium`

**Catalog View**:
```
Filter Applied (Behind the Scenes):
- construction_phase: "envelope"
- package_tier: "better"
- selection_category: IN ("windows", "doors", "roofing", "siding")

Shows: 42 products
Organized by: Selection Category
  ├── Windows (12 products, filtered to "better" tier)
  ├── Doors (8 products, filtered to "better" tier)
  ├── Roofing (10 products, filtered to "better" tier)
  └── Siding (12 products, filtered to "better" tier)
```

**Key Feature**: Sarah rarely browses this view. She picks a **package** which auto-selects SKUs.

#### Marcus's Experience
**URL**: `/pages/catalog.html?persona=marcus&phase=foundation_framing&tier=professional`

**Catalog View**:
```
Filter Applied:
- construction_phase: "foundation_framing"
- quality_tier: "professional"

Shows: 78 products
Organized by: Main Category → Subcategory
  ├── Lumber & Building Materials (45 products)
  │   ├── Dimensional Lumber (18)
  │   ├── Engineered Lumber (12)
  │   └── Sheet Goods (15)
  ├── Framing & Drywall (23 products)
  │   ├── Framing Hardware (10)
  │   └── Fasteners (13)
  └── ...
```

**Key Feature**: Marcus generates a BOM via wizard, then shops this filtered catalog to make substitutions.

#### Lisa's Experience
**URL**: `/pages/catalog.html?persona=lisa&room=bathroom&tier=better`

**Catalog View**:
```
Filter Applied:
- room_category: "bathroom"
- package_tier: "better"

Shows: 35 products
Organized by: Product Type (within room)
  ├── Vanities (6 products)
  ├── Toilets (4 products)
  ├── Tubs & Showers (8 products)
  ├── Tile (10 products)
  └── Fixtures (7 products)
```

**Key Feature**: Lisa presents Good/Better/Best packages to clients, then customizes.

#### David's Experience
**URL**: `/pages/catalog.html?persona=david&project=deck`

**Catalog View**:
```
Filter Applied:
- project_type: "deck"
- deck_compatible: true

Shows: 52 products
Organized by: Construction Step (wizard-driven)
  ├── Foundation (8 products)
  │   ├── Concrete Footings
  │   └── Post Anchors
  ├── Framing (15 products)
  │   ├── Joists (Pressure-Treated 2x8, 2x10)
  │   └── Beams (Pressure-Treated 4x6, 6x6)
  ├── Decking (12 products)
  │   ├── Composite (Trex, TimberTech)
  │   └── Wood (Cedar, Pressure-Treated)
  └── ...
```

**Key Feature**: Wizard guides David step-by-step, showing only relevant products for each step.

#### Kevin's Experience
**URL**: `/pages/catalog.html?persona=kevin&velocity=high&priority=critical`

**Catalog View**:
```
Filter Applied:
- store_velocity_category: "high"
- restock_priority: "critical"

Shows: 18 products
Organized by: Days Supply (ascending)
  ├── 2x4x8 PT Lumber (2.3 days, restock: 500 units)
  ├── 3" Deck Screws (1.8 days, restock: 200 boxes)
  ├── 1/2" Drywall 4x8 (2.9 days, restock: 150 sheets)
  └── ...

Plus: Smart restock quantity suggestions based on velocity
```

**Key Feature**: Kevin's dashboard is **not** about browsing—it's about **alerts and actions**.

---

### Pros of Unified Taxonomy

✅ **Single Source of Truth**
- One product catalog to maintain
- Consistent SKUs across all personas
- Easier to add new products (add once, available to all)

✅ **Real-World Accuracy**
- BuildRight is a **materials supplier**, not 5 separate stores
- Real suppliers serve all customer types from the same inventory
- Cross-persona features possible (Marcus can use Sarah's templates)

✅ **Attribute-Based Filtering**
- Demonstrates **ACO's core strength**: filtering by attributes
- Each persona sees the same products, organized differently
- More flexible than rigid catalog separation

✅ **Easier Maintenance**
- Update a product once (price, description, image)
- Add attributes as needed without catalog duplication
- Simpler data governance

✅ **Scalability**
- Add new personas without creating new catalogs
- Add new attributes without restructuring catalogs
- Add new products once, tag appropriately

✅ **Demo Value**
- Shows how **one catalog** can serve multiple use cases
- Highlights ACO's attribute-based policies and filtering
- More impressive than "we made 5 separate stores"

### Cons of Unified Taxonomy

❌ **Complex Attribute Management**
- Every product needs 15-20 attributes
- Risk of inconsistent tagging
- Requires discipline to maintain attribute quality

❌ **Navigation Challenges**
- Main nav categories need to work for everyone
- Some compromise required (can't optimize for one persona)
- Need smart default filters per persona

❌ **Performance Considerations**
- Larger catalog = more filtering required
- Need efficient ACO queries
- Cache strategies important

❌ **Initial Setup Effort**
- Defining comprehensive attribute schema is work
- Tagging all existing products takes time
- Testing filters for each persona

---

## Option B: Catalog-Per-Persona

### Proposed Structure

**5 Separate ACO Catalogs**:

#### Catalog 1: Sarah's Production Builder Catalog
**Categories**:
```
├── Foundation & Framing Phase
│   ├── Lumber (2x4, 2x6, 2x8, 2x10, Plywood, OSB)
│   ├── Fasteners (Nails, Screws, Brackets)
│   └── Insulation (Fiberglass, Spray Foam)
│
├── Envelope Phase
│   ├── Windows (by selection package tier)
│   ├── Doors (by selection package tier)
│   ├── Roofing (by selection package tier)
│   └── Siding (by selection package tier)
│
└── Interior Finish Phase
    ├── Flooring (by selection package tier)
    ├── Paint (by selection package tier)
    ├── Lighting (by selection package tier)
    └── Plumbing Fixtures (by selection package tier)
```

**Products**: ~150-200 SKUs (house building materials only)

#### Catalog 2: Marcus's General Contractor Catalog
**Categories**:
```
├── Lumber & Building Materials
├── Doors & Windows
├── Roofing
├── Framing & Drywall
├── Insulation
├── Siding & Trim
└── Hardware & Fasteners
```

**Products**: ~300-400 SKUs (broader than Sarah, general construction)

#### Catalog 3: Lisa's Remodeling Catalog
**Categories**:
```
├── Bathroom
│   ├── Vanities
│   ├── Toilets
│   ├── Tubs & Showers
│   ├── Tile
│   └── Fixtures
│
├── Kitchen
│   ├── Cabinets
│   ├── Countertops
│   ├── Sinks & Faucets
│   ├── Appliances
│   └── Backsplash
│
└── General Finishes
    ├── Flooring
    ├── Paint
    └── Lighting
```

**Products**: ~200-250 SKUs (finish materials, no structural lumber)

#### Catalog 4: David's DIY Homeowner Catalog
**Categories**:
```
├── Deck Building
│   ├── Foundation (Concrete, Anchors)
│   ├── Framing (Joists, Beams)
│   ├── Decking (Composite, Wood)
│   ├── Railing (Aluminum, Cable, Wood)
│   └── Finishes (Stain, Sealant)
│
└── General Home Improvement
    ├── Paint
    ├── Hardware
    └── Tools
```

**Products**: ~100-150 SKUs (simplified, DIY-focused)

#### Catalog 5: Kevin's Store Inventory Catalog
**Categories**:
```
├── High Velocity Products
├── Medium Velocity Products
├── Low Velocity Products
└── Seasonal Products
```

**Products**: ~500-600 SKUs (everything in the store)

### Pros of Catalog-Per-Persona

✅ **Perfect Personalization**
- Each catalog is 100% optimized for its persona
- No irrelevant products cluttering the view
- Categories make perfect sense for that user

✅ **Simpler Categories**
- No need for complex multi-level attributes
- Categories can be persona-specific terms
- Easier to understand for each persona

✅ **Performance**
- Smaller catalogs = faster queries
- No filtering needed (pre-filtered by catalog)
- Simpler ACO policies

✅ **Clear Separation**
- No risk of showing wrong products to wrong persona
- Easier to A/B test persona experiences
- Simpler access control

### Cons of Catalog-Per-Persona

❌ **Data Duplication**
- Same product (e.g., "2x4x8 PT Lumber") exists in 4 catalogs
- Price updates must happen 4 times
- Image updates must happen 4 times
- Description updates must happen 4 times

❌ **Maintenance Nightmare**
- Add a new window? Add to Sarah, Marcus, and potentially Lisa catalogs
- Change a price? Update 3-5 catalogs
- Update an image? Update 3-5 catalogs
- High risk of inconsistency

❌ **Not Realistic**
- Real building suppliers have **one inventory**
- This feels like 5 separate companies, not one supplier
- Doesn't reflect how businesses actually operate

❌ **Scalability Issues**
- Add a 6th persona? Create a 6th catalog (and duplicate products again)
- Want cross-persona features? Very hard (different catalogs)
- Data governance becomes complex

❌ **Demo Impact**
- Demonstrates **data silos**, not **flexible commerce**
- "We made 5 separate catalogs" is less impressive than "one catalog serves 5 personas via intelligent filtering"
- Misses the point of ACO's attribute-based architecture

❌ **SKU Management**
- Do SKUs differ across catalogs? (SKU-SARAH-WIN-001 vs. SKU-MARCUS-WIN-001?)
- Or are they the same? (Then why separate catalogs?)
- Order history across catalogs becomes messy

---

## Recommendation: Option A (Unified Multi-Level Taxonomy)

### Why Unified is Better

**1. Reflects BuildRight's Business Model**
BuildRight is a **building materials supplier** serving diverse customers. They have:
- One warehouse
- One inventory system
- One pricing system
- One product catalog

The website should reflect this reality.

**2. Demonstrates ACO's Core Value**
ACO's **primary strength** is:
- Attribute-based product modeling
- Policy-based filtering
- Context-aware experiences

Unified taxonomy + smart filtering showcases this. Separate catalogs hide it.

**3. Easier to Maintain**
- Update a product **once**
- Add attributes as needed
- Scale to new personas without duplication

**4. Enables Cross-Persona Features**
- Marcus can browse Sarah's templates
- Lisa can use Marcus's quality tier filtering
- David can see "pro-grade" vs. "DIY-friendly" versions of same product

**5. More Impressive Demo**
"Watch how the **same catalog** adapts to 5 different personas" > "We made 5 separate catalogs"

---

---

## Phase 0.5 Update: Product Expansion

**Note**: This taxonomy was applied to the Phase 0.5 product expansion (108 → 265 products). 

See **[PRODUCT-CATEGORY-TAXONOMY-MAPPING.md](./PRODUCT-CATEGORY-TAXONOMY-MAPPING.md)** for details on how the 6 new product categories (Concrete & Foundation, Electrical Systems, Plumbing Pipes & Fittings, HVAC Systems, Drywall & Supplies, Kitchen Appliances) map to this taxonomy.

**Key Validation**: All new categories successfully use the existing attribute schema with no modifications needed. ✅

---

## Implementation Strategy for Unified Taxonomy

### Phase 1: Define Attribute Schema (1-2 days)
Create master attribute list in `buildright-aco`:

```javascript
// scripts/config/attribute-schema.js
export const PRODUCT_ATTRIBUTES = {
  // Construction Context
  construction_phase: ['foundation_framing', 'envelope', 'interior_finish'],
  quality_tier: ['builder_grade', 'professional', 'premium', 'luxury'],
  package_tier: ['good', 'better', 'best'],
  
  // Persona-Specific
  selection_category: ['windows', 'doors', 'roofing', 'siding', 'flooring', 'paint', 'lighting', 'plumbing_fixtures'],
  room_category: ['bathroom', 'kitchen', 'basement', 'outdoor', 'flooring', 'fixtures'],
  project_type: ['deck', 'fence', 'shed', 'patio', 'general'],
  deck_compatible: true,
  deck_shape: ['rectangular', 'l_shaped', 'wrap_around'],
  
  // Store Operations
  store_velocity_category: ['high', 'medium', 'low'],
  recommended_restock_quantity: 0,
  typical_days_supply: 0,
  restock_priority: ['critical', 'high', 'medium', 'low']
};
```

### Phase 2: Update Main Categories (2-3 days)
Revise to be **persona-neutral** and **materials-focused**:

**New Main Categories** (`buildright-eds`):
```javascript
export const MAIN_CATEGORIES = {
  lumber_building_materials: {
    name: 'Lumber & Building Materials',
    icon: 'lucide/package',
    subcategories: ['dimensional_lumber', 'engineered_lumber', 'sheet_goods', 'specialty_lumber']
  },
  doors_windows: {
    name: 'Doors & Windows',
    icon: 'lucide/door-open',
    subcategories: ['windows', 'entry_doors', 'patio_doors', 'garage_doors']
  },
  roofing_siding: {
    name: 'Roofing & Siding',
    icon: 'lucide/home',
    subcategories: ['roofing', 'siding', 'trim']
  },
  framing_drywall: {
    name: 'Framing & Drywall',
    icon: 'lucide/hammer',
    subcategories: ['framing_hardware', 'fasteners', 'insulation', 'drywall']
  },
  interior_finishes: {
    name: 'Interior Finishes',
    icon: 'lucide/palette',
    subcategories: ['flooring', 'paint', 'lighting', 'plumbing_fixtures']
  },
  hardware_tools: {
    name: 'Hardware & Tools',
    icon: 'lucide/wrench',
    subcategories: ['fasteners', 'power_tools', 'hand_tools', 'safety']
  }
};
```

### Phase 3: Tag Existing Products (3-4 days)
Update `scripts/config/product-definitions.js`:

```javascript
// Example: Premium Window
{
  name: 'Andersen 400 Series Double-Hung Window 36"x60"',
  sku: 'WIN-ANDER-400-3660',
  category: 'doors_windows',
  subcategory: 'windows',
  
  // NEW: Multi-level attributes
  attributes: {
    // Construction context
    construction_phase: ['envelope'],
    quality_tier: 'premium',
    package_tier: ['better', 'best'],
    
    // Persona-specific
    selection_category: 'windows',
    room_category: 'windows',
    project_type: ['general'],
    deck_compatible: false,
    
    // Store operations
    store_velocity_category: 'medium',
    recommended_restock_quantity: 20,
    typical_days_supply: 21,
    restock_priority: 'medium',
    
    // Product characteristics
    brand: 'Andersen',
    material: 'vinyl_clad_wood',
    color_family: 'white',
    window_type: 'double_hung',
    energy_star: true,
    dimensions: { width: 36, height: 60, uom: 'inches' }
  }
}
```

### Phase 4: Create Persona-Specific Filters (2-3 days)
Update `scripts/persona-config.js`:

```javascript
export const PERSONA_CATALOG_FILTERS = {
  sarah: {
    defaultFilters: {
      // Only show products relevant to house construction
      construction_phase: ['foundation_framing', 'envelope', 'interior_finish']
    },
    categoryView: 'construction_phase', // Group by phase
    defaultSort: 'selection_category'
  },
  
  marcus: {
    defaultFilters: {
      // Show all construction products
      construction_phase: ['foundation_framing', 'envelope', 'interior_finish']
    },
    categoryView: 'main_category', // Traditional categories
    defaultSort: 'category'
  },
  
  lisa: {
    defaultFilters: {
      // Only show finish materials
      room_category: ['bathroom', 'kitchen', 'flooring', 'fixtures']
    },
    categoryView: 'room_category', // Group by room
    defaultSort: 'package_tier'
  },
  
  david: {
    defaultFilters: {
      // Only show DIY-friendly products
      project_type: ['deck', 'fence', 'patio', 'general']
    },
    categoryView: 'project_type', // Group by project
    defaultSort: 'quality_tier'
  },
  
  kevin: {
    defaultFilters: {
      // Show all products
    },
    categoryView: 'store_velocity_category', // Group by velocity
    defaultSort: 'restock_priority'
  }
};
```

### Phase 5: Update Catalog UI (3-4 days)
Modify `pages/catalog.html` to adapt to persona:

```javascript
// scripts/catalog.js

async function loadCatalog() {
  const persona = getPersona();
  const config = PERSONA_CATALOG_FILTERS[persona.id];
  
  // Apply persona-specific filters
  const filters = {
    ...config.defaultFilters,
    ...getURLFilters() // User can further filter
  };
  
  // Fetch products from ACO
  const products = await fetchProducts(filters);
  
  // Render using persona-specific category view
  if (config.categoryView === 'construction_phase') {
    renderByPhase(products);
  } else if (config.categoryView === 'room_category') {
    renderByRoom(products);
  } else if (config.categoryView === 'main_category') {
    renderByCategory(products);
  } else if (config.categoryView === 'store_velocity_category') {
    renderByVelocity(products);
  }
}
```

---

## Success Criteria

### For Demo
✅ Sarah sees **~150 products** organized by **construction phase** and **selection category**  
✅ Marcus sees **~300 products** organized by **traditional categories** with **quality tier** filters  
✅ Lisa sees **~200 products** organized by **room** with **package tier** filters  
✅ David sees **~100 products** organized by **project type** with **educational content**  
✅ Kevin sees **~500 products** organized by **velocity** with **restock alerts**

### For Architecture
✅ **One** product catalog in ACO  
✅ **15-20** attributes per product  
✅ **Zero** product duplication  
✅ Persona switching works instantly (filter change, not catalog change)  
✅ Adding a new product means adding it **once** with appropriate attributes

### For Maintenance
✅ Update product price → Updates for all personas  
✅ Update product image → Updates for all personas  
✅ Add new attribute → Tag relevant products, enables new filters  
✅ Add new persona → Define filter config, no product changes needed

---

## Next Steps

1. **Review & Approve** this analysis
2. **Create** `scripts/config/attribute-schema.js` in `buildright-aco`
3. **Update** `MAIN_CATEGORIES` in `buildright-eds`
4. **Tag** all products in `product-definitions.js` with new attributes
5. **Update** `persona-config.js` with catalog filters
6. **Test** catalog rendering for each persona
7. **Document** attribute tagging standards

---

## Questions for Stakeholders

1. **Attribute Management**: Who owns maintaining attribute quality? (Product team? Content team?)
2. **Tagging Standards**: Should we create a tagging checklist to ensure consistency?
3. **Future Personas**: If we add a 6th persona, are we confident unified taxonomy will still work?
4. **ACO Limits**: Are there performance concerns with filtering a 500-600 SKU catalog?
5. **Demo Focus**: Which persona's experience should we showcase first? (Sarah?)

---

**Status**: ✅ Analysis Complete, Awaiting Decision  
**Recommendation**: Option A - Unified Multi-Level Taxonomy  
**Next Action**: Approve and begin implementation OR discuss concerns


