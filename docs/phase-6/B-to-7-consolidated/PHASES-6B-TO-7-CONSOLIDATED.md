# Phases 6B-7: Remaining Implementation Plans

**📊 Document Type**: Implementation Plan  
**📖 Reading Time**: 60-90 minutes (comprehensive)  
**🎯 Current Status**: 🚧 **ACTIVE IMPLEMENTATION**  
**👥 Audience**: Developers implementing personas

**🔗 Related Docs**:
- **Quick Start**: [quick-reference/implement-persona.md](./quick-reference/implement-persona.md)
- **What Exists**: [quick-reference/what-exists.md](./quick-reference/what-exists.md)
- **Persona Profiles**: [personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](./personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)
- **Completion Summaries**: [phase-0-5-foundation/](./phase-0-5-foundation/)
- **Architectural Decisions**: [adr/ADR-004](./adr/ADR-004-custom-attributes-for-personas.md), [adr/ADR-006](./adr/ADR-006-multi-location-store-manager.md)

**📍 Reading Path**:
1. Read persona profile in personas/ (15 min)
2. Read this doc's phase section for your persona (20 min)
3. Check quick-reference/what-exists.md for reusable components (5 min)
4. Start implementing tasks
5. Reference completion summaries as needed

---

This document consolidates the remaining persona implementations (Marcus, Lisa, David, Kevin) and final integration phase. For full implementation details, each section below should be expanded into its own dedicated phase plan document.

---

## Phase 6B: Marcus Johnson (General Contractor)

**Duration**: 2 weeks  
**Dependencies**: Phase 4, Phase 5  
**Persona**: Marcus Johnson - General Contractor

### Overview

Marcus needs a guided wizard to plan materials for custom construction projects across multiple phases. The wizard demonstrates CCDM filtering as Marcus progresses through project definition steps.

### Key Objectives

1. Create project wizard with vertical progress indicator
2. Implement phase-based material selection
3. Add educational content at each step
4. Demonstrate CCDM filtering visibly
5. Generate phase-specific BOMs
6. Support quality tier selection

### Wizard Steps

**Step 1: Project Type**
- New Construction vs. Remodel
- Triggers policy: `project_new_construction` or `project_remodel`
- Shows product count change

**Step 2: Project Scope**
- Square footage input
- Number of stories
- Foundation type
- Lot considerations

**Step 3: Construction Phases**
- Select phases needed:
  - Foundation & Framing
  - Building Envelope
  - Interior Finish
- Each triggers phase policy
- Visual: Product count widget shows filtering

**Step 4: Quality Tier**
- Builder Grade
- Professional
- Premium
- Affects product filtering and pricing
- Educational content: quality comparisons

**Step 5: BOM Generation**
- Generate materials list per phase
- Show phase-by-phase breakdown
- Display pricing with customer group discount
- Option to order by phase or all at once

### Research & Assets

**Research References**:
- Builder Trend workflows
- CoConstruct project planning
- Construction project management UX

**Visual Assets**:
- Phase illustrations (foundation, framing, envelope, interior)
- Quality comparison images
- Project type imagery

**Educational Content**:
- Tips for each construction phase
- Material quality comparisons
- Quantity estimation guidance
- Delivery scheduling recommendations

### Data Requirements

**File**: `data/project-wizard-config.json`

```json
{
  "projectTypes": [
    {
      "id": "new_construction",
      "name": "New Construction",
      "description": "Building from ground up",
      "policy": "project_new_construction",
      "phases": ["foundation_framing", "envelope", "interior_finish"]
    },
    {
      "id": "remodel",
      "name": "Remodeling",
      "description": "Renovation or addition",
      "policy": "project_remodel",
      "phases": ["all"]
    }
  ],
  "phases": [
    {
      "id": "foundation_framing",
      "name": "Foundation & Framing",
      "policy": "phase_foundation_framing",
      "icon": "icon-foundation",
      "education": {
        "title": "Foundation & Framing Phase",
        "tips": [
          "Order structural materials 2 weeks before foundation pour",
          "Account for 10% waste on framing lumber",
          "Coordinate delivery with concrete schedule"
        ]
      }
    }
    // ... more phases
  ],
  "qualityTiers": [
    {
      "id": "builder_grade",
      "name": "Builder Grade",
      "policy": "quality_builder_grade",
      "description": "Cost-effective materials for spec homes"
    },
    {
      "id": "professional",
      "name": "Professional",
      "policy": "quality_professional",
      "description": "Balance of quality and cost"
    },
    {
      "id": "premium",
      "name": "Premium",
      "policy": "quality_premium",
      "description": "High-end materials for luxury homes"
    }
  ]
}
```

### Implementation Files

**Dashboard**: `scripts/dashboards/project-dashboard.js`
- List active projects
- Create new project button
- Project history

**Wizard**: `scripts/builders/project-wizard.js`
- Multi-step wizard
- CCDM filtering at each step
- Loading states with messages: "Filtering to {phase} products..."
- BOM generation

**Styles**: `styles/builders/project-wizard.css`

### Success Criteria

✅ Wizard guides through all steps  
✅ CCDM filtering visible with product counts  
✅ Loading states show filtering messages  
✅ Educational content displays at relevant steps  
✅ Phase-based BOM generates correctly  
✅ Quality tier affects product selection  
✅ Vertical progress indicator tracks progress  
✅ Can navigate back to previous steps  

---

## Phase 6C: Lisa Chen (Remodeling Contractor)

**Duration**: 2 weeks  
**Dependencies**: Phase 4, Phase 5  
**Persona**: Lisa Chen - Remodeling Contractor

### Overview

Lisa needs to select and customize Good/Better/Best bathroom packages for clients. Visual comparison and complete package photos are critical.

### Key Objectives

1. Create package comparison view
2. Source complete bathroom package photos (NOT before/after)
3. Implement customization within tier
4. Support product swaps
5. Generate quotes
6. Enable client sharing

### Package Structure

**Good Package** ($8,500)
- Builder-grade fixtures
- Standard vanity
- Ceramic tile
- Chrome finishes
- Complete bathroom photo showing this tier

**Better Package** ($14,200) ⭐ Recommended
- Mid-range fixtures
- Semi-custom vanity
- Porcelain tile
- Brushed nickel finishes
- Customization options
- Complete bathroom photo showing this tier

**Best Package** ($23,800)
- Premium fixtures
- Custom vanity
- Natural stone
- Designer finishes
- Full customization
- Complete bathroom photo showing this tier

### Visual Assets

**Required Images**:
1. Complete bathroom photo for Good tier
2. Complete bathroom photo for Better tier
3. Complete bathroom photo for Best tier
4. Individual product images:
   - Vanities (3 tiers)
   - Faucets (3 tiers)
   - Toilets (3 tiers)
   - Tile samples (multiple options)
   - Lighting fixtures

**Image Sources**:
- Houzz portfolios
- Interior design stock photos
- Manufacturer product photos
- Styled bathroom photography

### Data Requirements

**File**: `data/bathroom-packages.json`

```json
{
  "packages": [
    {
      "tier": "good",
      "name": "Good Package",
      "basePrice": 8500,
      "image": "/images/packages/bathroom-good.jpg",
      "description": "Quality basics for budget-conscious remodels",
      "included": {
        "vanity": { "sku": "VAN-BG-001", "name": "24\" Standard Vanity" },
        "toilet": { "sku": "TOI-BG-001", "name": "Standard Toilet" },
        "faucet": { "sku": "FAU-BG-001", "name": "Chrome Faucet Set" },
        "tile": { "sku": "TIL-BG-001", "name": "Ceramic Tile - White" },
        "lighting": { "sku": "LIG-BG-001", "name": "Basic Vanity Light" }
      },
      "features": [
        "Builder-grade fixtures",
        "Standard 24\" vanity",
        "Ceramic tile floor & walls",
        "Chrome finish hardware",
        "Basic lighting"
      ],
      "customization": {
        "tile": {
          "canCustomize": true,
          "options": ["white", "beige", "gray"]
        },
        "hardware": {
          "canCustomize": false
        }
      }
    },
    {
      "tier": "better",
      "name": "Better Package",
      "basePrice": 14200,
      "image": "/images/packages/bathroom-better.jpg",
      "description": "Enhanced features and style options",
      "recommended": true,
      "included": {
        "vanity": { "sku": "VAN-PR-001", "name": "30\" Semi-Custom Vanity" },
        "toilet": { "sku": "TOI-PR-001", "name": "Comfort Height Toilet" },
        "faucet": { "sku": "FAU-PR-001", "name": "Brushed Nickel Faucet" },
        "tile": { "sku": "TIL-PR-001", "name": "Porcelain Tile - Gray" },
        "lighting": { "sku": "LIG-PR-001", "name": "Designer Vanity Light" }
      },
      "features": [
        "Mid-range fixtures",
        "30\" semi-custom vanity",
        "Porcelain tile with accent",
        "Brushed nickel finishes",
        "Designer lighting",
        "Soft-close vanity doors"
      ],
      "customization": {
        "vanity": {
          "canCustomize": true,
          "options": ["white", "gray", "navy", "custom-color"]
        },
        "tile": {
          "canCustomize": true,
          "options": ["multiple-colors", "patterns", "accent-walls"]
        },
        "hardware": {
          "canCustomize": true,
          "options": ["brushed-nickel", "matte-black", "brass"]
        }
      }
    },
    {
      "tier": "best",
      "name": "Best Package",
      "basePrice": 23800,
      "image": "/images/packages/bathroom-best.jpg",
      "description": "Premium materials and full customization",
      "included": {
        "vanity": { "sku": "VAN-PM-001", "name": "36\" Custom Vanity" },
        "toilet": { "sku": "TOI-PM-001", "name": "Designer Toilet" },
        "faucet": { "sku": "FAU-PM-001", "name": "Designer Faucet Set" },
        "tile": { "sku": "TIL-PM-001", "name": "Natural Stone Tile" },
        "lighting": { "sku": "LIG-PM-001", "name": "Luxury Light Fixtures" }
      },
      "features": [
        "Premium fixtures",
        "36\" custom vanity",
        "Natural stone tile",
        "Designer finish options",
        "Statement lighting",
        "Heated floors",
        "Premium hardware"
      ],
      "customization": {
        "everything": true,
        "options": "Full customization available"
      }
    }
  ]
}
```

### Implementation Files

**Dashboard**: `scripts/dashboards/package-dashboard.js`
- Show package projects
- Quick links to create package
- Client quotes saved

**Builder**: `scripts/builders/package-builder.js`
- Use `package-comparison` block from Phase 4
- Package selection
- Customization interface
- Product swaps
- Quote generation
- Save and share

**Styles**: `styles/builders/package-builder.css`

### Success Criteria

✅ Three packages display side-by-side  
✅ Complete bathroom photos for each tier  
✅ Package features clearly differentiated  
✅ Customization options work  
✅ Product swaps update pricing  
✅ Quote generation works  
✅ Visual, immersive experience  
✅ Mobile responsive comparison view  

---

## Phase 6D: David Thompson (Pro Homeowner - Deck Builder)

**Duration**: 2-3 weeks  
**Dependencies**: Phase 4, Phase 5  
**Persona**: David Thompson - Pro Homeowner (DIY)

### Overview

David needs a guided deck builder that progressively filters products based on his selections. This is the PRIMARY CCDM demonstration with visible product count changes and educational DIY content.

### Key Objectives

1. Create immersive, full-page deck builder experience
2. Source large hero images for each step
3. Implement progressive disclosure (policy at each step)
4. Add product count visualization
5. Include educational DIY content
6. Create static deck preview
7. Demonstrate CCDM filtering clearly

### Wizard Steps

**Entry**: Deck Builder Introduction
- Hero image of beautiful deck
- "Build Your Dream Deck" headline
- Policy: `deck_compatible` (all deck products)
- Product count widget: "2,847 products available"

**Step 1: Deck Shape**
- Large hero images:
  - Rectangular deck (overhead diagram + photo)
  - L-shaped deck (overhead diagram + photo)
- Selection triggers policy: `deck_rectangular` or `deck_l_shaped`
- **CCDM Demo**: Loading state: "Filtering to products for rectangular decks..."
- Product count updates: "643 products available" ⬇

**Step 2: Deck Size**
- Size calculator (length x width)
- Popular size suggestions
- Cost estimate per size
- Educational: "Most popular size: 16x20 (320 sq ft)"

**Step 3: Decking Material** 
- **Large hero images**:
  - Wood decking (close-up texture + installed photo)
  - Composite decking (texture + installed photo)
  - PVC decking (texture + installed photo)
- Comparison table: maintenance, lifespan, cost
- Selection triggers policy: `deck_material_wood` or `deck_material_composite`
- **CCDM Demo**: Loading state: "Finding materials for your 16x20 composite deck..."
- Product count updates: "127 products available" ⬇
- Educational: Maintenance comparison, lifespan info

**Step 4: Railing System**
- **Hero images of each railing type**:
  - Aluminum railing
  - Composite railing
  - Cable railing
- Compatibility indicator ("Works with composite decking")
- Selection triggers policy based on material
- **CCDM Demo**: Loading state: "Finding railings compatible with composite decking..."
- Product count updates: "89 products available" ⬇

**Step 5: Accessories (Optional)**
- Post caps
- LED deck lighting
- Under-deck drainage
- Built-in benches
- No additional filtering (add-ons)

**Step 6: Complete Kit Review**
- Static deck preview image (matches selections)
- Complete materials list organized by:
  - Decking boards
  - Framing lumber
  - Fasteners & hardware
  - Railing system
  - Accessories
- Installation guide link
- DIY time estimate
- Skill level indicator
- Total cost with customer group pricing

### Research & Assets

**Research References**:
- Home Depot Deck Builder: https://www.homedepot.com/project-seller/decking-calculator
- Lowe's Deck Designer: https://deckdesigner.lowes.com/
- DIY deck building guides

**Visual Assets Required**:

1. **Hero Images** (large, immersive):
   - Entry: Beautiful completed deck
   - Shape: Rectangular overhead + photo
   - Shape: L-shaped overhead + photo
   - Material: Wood texture + installed
   - Material: Composite texture + installed
   - Material: PVC texture + installed
   - Railings: 3-4 railing styles installed
   - Accessories: Examples of additions

2. **Static Deck Previews**:
   - Multiple deck configurations
   - Match common shape/material combos

3. **Educational Graphics**:
   - Size comparison chart
   - Maintenance comparison
   - Cost per sq ft chart

**Image Sources**:
- Manufacturer websites (Trex, TimberTech, Azek)
- Unsplash/Pexels deck photography
- DIY project galleries
- Create custom overhead diagrams

### Data Requirements

**File**: `data/deck-builder-config.json`

```json
{
  "shapes": [
    {
      "id": "rectangular",
      "name": "Rectangular Deck",
      "policy": "deck_rectangular",
      "image": "/images/decks/rectangular-overhead.png",
      "photo": "/images/decks/rectangular-photo.jpg",
      "description": "Classic shape, easy to build, maximizes space"
    },
    {
      "id": "l_shaped",
      "name": "L-Shaped Deck",
      "policy": "deck_l_shaped",
      "image": "/images/decks/l-shaped-overhead.png",
      "photo": "/images/decks/l-shaped-photo.jpg",
      "description": "Wraps around corner, creates defined spaces"
    }
  ],
  "materials": [
    {
      "id": "wood",
      "name": "Pressure-Treated Wood",
      "policy": "deck_material_wood",
      "texture": "/images/materials/wood-texture.jpg",
      "installed": "/images/materials/wood-installed.jpg",
      "pricePerSqFt": 4.50,
      "maintenance": "High - Annual staining required",
      "lifespan": "15-20 years",
      "pros": ["Natural look", "Lower initial cost", "Readily available"],
      "cons": ["Requires maintenance", "Can warp or crack", "Splinters"]
    },
    {
      "id": "composite",
      "name": "Composite Decking",
      "policy": "deck_material_composite",
      "texture": "/images/materials/composite-texture.jpg",
      "installed": "/images/materials/composite-installed.jpg",
      "pricePerSqFt": 8.50,
      "maintenance": "Low - Occasional cleaning",
      "lifespan": "25-30 years",
      "pros": ["Low maintenance", "No splinters", "Fade resistant", "Many colors"],
      "cons": ["Higher cost", "Can retain heat", "Limited repair options"],
      "recommended": true
    },
    {
      "id": "pvc",
      "name": "PVC Decking",
      "policy": "deck_material_pvc",
      "texture": "/images/materials/pvc-texture.jpg",
      "installed": "/images/materials/pvc-installed.jpg",
      "pricePerSqFt": 11.00,
      "maintenance": "Minimal - Soap and water",
      "lifespan": "30+ years",
      "pros": ["Lowest maintenance", "Stain resistant", "Waterproof", "Longest lifespan"],
      "cons": ["Highest cost", "Can feel plasticky", "Limited color options"]
    }
  ],
  "railings": [
    {
      "id": "aluminum",
      "name": "Aluminum Railing",
      "image": "/images/railings/aluminum.jpg",
      "compatibleWith": ["wood", "composite", "pvc"],
      "pricePerFoot": 45,
      "description": "Durable, low maintenance, modern look"
    },
    {
      "id": "composite",
      "name": "Composite Railing",
      "image": "/images/railings/composite.jpg",
      "compatibleWith": ["wood", "composite", "pvc"],
      "pricePerFoot": 55,
      "description": "Matches composite decking, various colors"
    },
    {
      "id": "cable",
      "name": "Cable Railing",
      "image": "/images/railings/cable.jpg",
      "compatibleWith": ["wood", "composite", "pvc"],
      "pricePerFoot": 85,
      "description": "Modern, unobstructed views, sleek design"
    }
  ],
  "accessories": [
    {
      "id": "post_caps",
      "name": "Decorative Post Caps",
      "image": "/images/accessories/post-caps.jpg",
      "priceEach": 25
    },
    {
      "id": "led_lighting",
      "name": "LED Deck Lighting",
      "image": "/images/accessories/led-lights.jpg",
      "pricePerLight": 35
    },
    {
      "id": "under_deck",
      "name": "Under-Deck Drainage System",
      "image": "/images/accessories/drainage.jpg",
      "pricePerSqFt": 8
    }
  ]
}
```

### Product Count Widget

**Visual Component**: Shows how CCDM filtering works

```
┌─────────────────────────────┐
│  Products Available         │
│                             │
│      ⬇ 127                  │
│  ━━━━━━━━━━━━━━━━━          │
│                             │
│  Filtered from 2,847        │
│  based on your selections   │
└─────────────────────────────┘
```

Updates at each step showing the progressive filtering.

### Implementation Files

**Builder**: `scripts/builders/deck-builder.js`
- Full-page immersive experience
- Wizard progress (vertical sidebar)
- Product count widget
- CCDM loading states with specific messages
- Educational content panels
- BOM generation
- Static preview selection

**Styles**: `styles/builders/deck-builder.css`
- Hero image layouts
- Immersive full-screen steps
- Product count widget animations
- Educational content panels

### Success Criteria

✅ Immersive, full-page experience  
✅ Large hero images at each step  
✅ Progressive CCDM filtering demonstrated  
✅ Product count widget updates visibly  
✅ Loading states show filtering messages  
✅ Educational content at each step  
✅ DIY-friendly language and guidance  
✅ Static deck preview displays  
✅ Complete materials list organized  
✅ Mobile responsive  

---

## Phase 6E: Kevin Rodriguez (Store Manager)

**Duration**: 1-1.5 weeks  
**Dependencies**: Phase 4, Phase 5  
**Persona**: Kevin Rodriguez - Store Manager  
**Architecture**: Multi-location (see ADR-006)

### Overview

Kevin manages 3 locations of Precision Lumber & Supply (Austin, San Antonio, Houston) and needs a velocity-based restock dashboard to manage inventory across his stores. He uses the header location selector to switch between stores, and the dashboard displays location-specific inventory data.

**Key Architecture** (see [ADR-006](../adr/ADR-006-multi-location-store-manager.md)):
- **Kevin's Stores** (Frontend): 3 Texas retail locations he manages
- **BuildRight Warehouses** (Backend/MSI): 6 distribution centers that fulfill orders to Kevin's stores
- **Location Selector**: Header dropdown to switch between Austin/San Antonio/Houston
- **Customer Context**: `{ company: 'precision_lumber', location_id: 'austin', region: 'central' }`

### Key Objectives

1. Create multi-location restock dashboard
2. Implement velocity calculations per location
3. Add priority indicators
4. Create smart restock suggestions
5. Support bulk ordering
6. Category-based view
7. **Handle location switching** ⭐ NEW
8. **Demonstrate MSI fulfillment** ⭐ NEW

### Two-Layer Architecture

**Layer 1: Kevin's Retail Stores** (Frontend - Customer Context)
- **Company**: Precision Lumber & Supply
- **Type**: Retail building supply stores Kevin manages
- **Locations**: Austin (001), San Antonio (002), Houston (003)
- **Purpose of Location Selector**: 
  - Kevin selects which store he's restocking
  - Sets shipping destination
  - Displays that store's inventory data
  - Updates customer context: `{ company: 'precision_lumber', location_id: 'san_antonio' }`

**Layer 2: BuildRight Warehouses** (Backend - MSI Fulfillment)
- **Company**: BuildRight (the vendor/supplier)
- **Type**: Distribution centers and regional warehouses
- **Primary Sources for Texas**: 
  - `warehouse_phoenix` (Phoenix, AZ) - closest major RDC
  - `warehouse_denver` (Denver, CO) - central region backup
- **Purpose**: 
  - Fulfill orders TO Kevin's stores
  - MSI determines optimal warehouse based on proximity and availability
  - Ships from BuildRight warehouse → Kevin's selected store

**Complete Flow**:
```
Kevin selects "San Antonio" → 
  Dashboard shows San Antonio inventory → 
    Kevin adds items to cart → 
      Checkout address: San Antonio store → 
        Order placed → 
          MSI selects warehouse_phoenix → 
            Shipment: Phoenix warehouse → San Antonio store
```

### Dashboard Sections

**1. Inventory Health Overview** (per selected location)
- Store name and location
- Total SKUs tracked
- Low stock count
- Out of stock count
- Restock recommendations pending

**2. Priority Categories**
- High velocity items needing restock
- Sorted by urgency
- Color-coded priority (High/Medium/Low)

**3. Smart Suggestions**
- Velocity-based calculations (location-specific)
- Seasonal adjustments
- Promotional considerations
- Recommended restock quantities

**4. Category View**
- Filter by product category
- View velocity by category
- Quick restock by category

**5. Location Indicator** ⭐ NEW
- Clearly shows which store's data is displayed
- Synced with header location selector
- Updates when location changes

### Data Requirements

**IMPORTANT**: Phase 6E implements **Demo Mode** only. Production mode (Adobe Commerce API integration) is a future enhancement.

#### Demo Mode Data Structure

**File**: `data/store-inventory.json` (Static JSON file for offline demos)

**Multi-Location Structure** (3 stores):

```json
{
  "company": "precision_lumber",
  "companyName": "Precision Lumber & Supply",
  "stores": [
    {
      "location_id": "austin",
      "storeNumber": "001",
      "city": "Austin",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": true,
      "address": "1234 Commerce St, Austin, TX 78701",
      "phone": "512-555-0100",
      "inventory": [
        {
          "sku": "FAST-001",
          "name": "2\" Deck Screws (1lb box)",
          "category": "Fasteners",
          "currentStock": 8,
          "recommendedStock": 25,
          "daysSupply": 3,
          "velocityCategory": "high",
          "avgDailySales": 2.5,
          "restockPriority": "high",
          "recommendedOrder": 20,
          "unitCost": 8.99,
          "lastRestocked": "2024-11-20"
        }
        // ... more items for Austin
      ]
    },
    {
      "location_id": "san_antonio",
      "storeNumber": "002",
      "city": "San Antonio",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": false,
      "address": "5678 Industrial Blvd, San Antonio, TX 78216",
      "phone": "210-555-0200",
      "inventory": [
        // ... inventory for San Antonio (similar structure, different quantities)
      ]
    },
    {
      "location_id": "houston",
      "storeNumber": "003",
      "city": "Houston",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": false,
      "address": "9012 Distribution Way, Houston, TX 77002",
      "phone": "713-555-0300",
      "inventory": [
        // ... inventory for Houston (similar structure, different quantities)
      ]
    }
  ]
}
```

**Data Strategy**:
- Use same base inventory template for all 3 stores
- Vary stock quantities (±20%) per location
- Vary velocity metrics to create different priorities
- Austin (primary) has most complete inventory
- San Antonio and Houston may have some items out of stock

---

#### Production Mode Data Sources (Future Enhancement)

**NOT IMPLEMENTED IN PHASE 6E** - Documented for future reference

**Data Flow**:
```
Restock Dashboard
    ↓
┌───────────────────────────────────────────┐
│  Adobe Commerce PaaS (via REST/GraphQL)   │
├───────────────────────────────────────────┤
│  • Products: /rest/V1/products            │
│  • Inventory: /rest/V1/inventory/...      │
│  • Customer: /rest/V1/customers/me        │
│  • Company: /rest/V1/company/:id          │
│  • Teams: /rest/V1/company/:id/team       │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  ACO (via GraphQL)                        │
├───────────────────────────────────────────┤
│  • Pricing: Price Books API               │
│  • Catalog: Filtered assortment           │
│  • Policies: CCDM rules (if applicable)   │
└───────────────────────────────────────────┘
    ↓
Customer Context + Location
{ company: 'precision_lumber',
  location_id: 'austin',
  group: 'Wholesale-Reseller' }
```

**Key Production APIs**:

1. **Inventory Data** (replaces `store-inventory.json`):
   ```javascript
   // Adobe Commerce Inventory API
   GET /rest/V1/inventory/source-items
   GET /rest/V1/inventory/stock-resolver
   // Returns: Stock levels from BuildRight warehouses
   ```

2. **Product Catalog**:
   ```javascript
   // Adobe Commerce Product API
   GET /rest/V1/products
   // Returns: Synced from Commerce, enhanced by ACO
   ```

3. **Pricing**:
   ```javascript
   // ACO Catalog Service GraphQL
   query {
     products(customerGroup: "Wholesale-Reseller") {
       sku, price
     }
   }
   // Returns: Wholesale pricing from ACO price books
   ```

4. **Customer Context**:
   ```javascript
   // Adobe Commerce Customer API
   GET /rest/V1/customers/me
   // Returns: Company, team (location), customer group
   ```

**Upgrade Path** (Post Phase 6E):
1. Create Adobe Commerce API service layer (`scripts/services/commerce-api.js`)
2. Add ACO GraphQL client (`scripts/services/aco-client.js`)
3. Replace static JSON loads with API calls
4. Add authentication/session management
5. Implement real-time inventory updates
6. Calculate velocity from order history API

### Implementation Files

**Dashboard**: `scripts/dashboards/restock-dashboard.js`
- Overview widgets (per location)
- Priority list
- Smart suggestions
- Quick-add to cart
- Bulk actions
- **Location change listener** ⭐ NEW
- **Load inventory for current location** ⭐ NEW
- **Update dashboard when location changes** ⭐ NEW

**Data**: `data/store-inventory.json`
- Multi-location structure (3 stores)
- Per-store inventory data
- Velocity metrics per location

**Styles**: `styles/dashboards/restock-dashboard.css`

**Existing Foundation** (from Phase 1-5):
- `scripts/company-config.js` - Company and location definitions
- `blocks/header/header.js` - Location selector (already implemented)
- `scripts/auth.js` - Customer context with location

### Deliverables

**Phase 6E Deliverables - DEMO MODE** (NEW):
- [ ] `data/store-inventory.json` - Multi-location static inventory data (3 stores)
- [ ] `scripts/dashboards/restock-dashboard.js` - Location-aware dashboard (loads static JSON)
- [ ] `styles/dashboards/restock-dashboard.css` - Dashboard styling
- [ ] Updated testing checklist for all 3 locations
- [ ] Demo script with location switching

**Already Implemented** (Phase 1-5):
- [x] `scripts/company-config.js` - Company and location definitions
- [x] `blocks/header/header.js` - Location selector in header
- [x] `blocks/header/header.css` - Location dropdown styling
- [x] `scripts/auth.js` - Customer context with location support
- [x] `scripts/persona-config.js` - Kevin persona with multi-location features

**Future Enhancement - PRODUCTION MODE** (Not in Phase 6E):
- [ ] `scripts/services/commerce-api.js` - Adobe Commerce REST/GraphQL client
- [ ] `scripts/services/aco-client.js` - ACO Catalog Service GraphQL client
- [ ] Replace static JSON with API queries
- [ ] Implement velocity calculation from order history
- [ ] Add real-time inventory updates
- [ ] Add authentication/session management

### Success Criteria

✅ Dashboard displays inventory health **per location**  
✅ Velocity calculations accurate  
✅ Priority indicators clear  
✅ Smart suggestions reasonable  
✅ Quick-add functionality works  
✅ Bulk actions work  
✅ Category filtering works  
✅ Data visualization clear  
✅ **Location selector works in header** (already implemented)  
✅ **Dashboard updates when location changes** ⭐ NEW  
✅ **All 3 locations (Austin, San Antonio, Houston) tested** ⭐ NEW  
✅ **Customer context reflects selected location** (already implemented)  
✅ **Checkout shipping address matches selected location** ⭐ NEW

---

## Phase 7: Integration & Polish

**Duration**: 2 weeks  
**Dependencies**: All Phase 6 plans  
**Status**: Not Started

### Overview

Final integration testing, performance optimization, bug fixes, and demo preparation.

### Objectives

1. End-to-end testing for all 5 personas
2. Cross-persona integration testing
3. Performance optimization
4. Responsive design verification
5. Accessibility testing
6. **⭐ Component extraction & refactoring** (NEW)
7. Create demo walkthrough guide
8. Bug fixes and polish
9. Production readiness check

### Task 1: Cross-Persona Testing

**Test Matrix**:
- Login as each persona
- Complete primary user journey
- Verify no state contamination between personas
- Test logout and re-login as different persona
- Verify customer group pricing throughout
- Test CCDM filtering for each use case

### Task 2: Performance Optimization

**Targets**:
- Page load < 2s
- First Contentful Paint < 1s
- Time to Interactive < 3s
- Lighthouse score > 90

**Optimizations**:
- Image optimization (WebP, lazy loading)
- Code splitting
- Mock ACO response caching
- CSS optimization
- JavaScript minification

### Task 3: Responsive Design

**Breakpoints to Test**:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

**Components to Verify**:
- All dashboards
- All builders/wizards
- Product grids
- Package comparison
- Template cards
- Navigation

### Task 4: Accessibility

**WCAG 2.1 AA Compliance**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels
- Semantic HTML

### Task 5: Component Extraction & Refactoring ⭐ NEW

**Duration**: 1-2 days  
**Dependencies**: Phases 6A-6E complete  
**Reference**: [Component Architecture Documentation](../../component-architecture/README.md)

**Overview**:

After building all 5 persona experiences (Phases 6A-6E), review the codebase for proven patterns that emerged and extract them into reusable components following Adobe EDS block principles.

**Why Phase 7?**
- All personas are now built - can identify what ACTUALLY repeated
- Patterns are proven in production code, not speculative
- Component extraction IS polish and optimization
- Clean up frontend before moving to backend integration (Phase 8)

**Task Breakdown**:

**Step 1: Pattern Review** (2-3 hours)
- Review all Phase 6 implementations (6A-6E)
- Reference the component audit: [`component-architecture/COMPONENT-EXTRACTION-OPPORTUNITIES.md`](../../component-architecture/COMPONENT-EXTRACTION-OPPORTUNITIES.md)
- Identify which of the 47+ identified patterns actually repeated across multiple personas
- Document what was built multiple times vs. what was unique

**Step 2: Component Classification** (1-2 hours)
- Use the classification framework from [`component-architecture/EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md`](../../component-architecture/EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md)
- Categorize proven patterns:
  - **Utilities**: Reusable CSS classes (buttons, badges, loading states)
  - **Shared Functions**: JavaScript utilities (quantity controls, modals, formatters)
  - **EDS Blocks**: Content-driven components (should be rare at this stage)
  - **Auto-blocks**: Programmatic block creation patterns
- Focus on high-value, frequently-used patterns

**Step 3: Extract High-Value Utilities** (3-4 hours)
- Extract 3-5 proven CSS utilities to `styles/utilities.css`
- Document in `docs/standards/CSS-ARCHITECTURE.md`
- Examples might include:
  - Consistent card patterns
  - Loading spinner variants
  - Status badge styles
  - Form input groups
  - Empty state displays

**Step 4: Extract Shared JavaScript Functions** (2-3 hours)
- Extract 3-5 proven JavaScript utilities to `scripts/utils.js` or create specialized utility files
- Document in code with JSDoc comments
- Examples might include:
  - Product list filtering/sorting
  - Quantity increment/decrement
  - Price formatting
  - Date/time utilities
  - Modal/dialog helpers

**Step 5: Create EDS Block Content Models** (1-2 hours) - OPTIONAL
- **ONLY if patterns emerged that authors should control**
- Create 1-2 block content models (JSON definitions)
- Document block authoring in [`docs/phase-10-authoring/`](../../phase-10-authoring/)
- Likely candidates:
  - Info cards (if repeated across personas)
  - Educational content panels
  - Package comparison layouts

**Step 6: Refactor Duplicate Code** (2-3 hours)
- Replace duplicate implementations with extracted components
- Test each persona after refactoring
- Ensure no regressions

**Step 7: Update Documentation** (1 hour)
- Update [`component-architecture/COMPONENT-EXTRACTION-QUICK-REFERENCE.md`](../../component-architecture/COMPONENT-EXTRACTION-QUICK-REFERENCE.md) with what was extracted
- Update [`component-architecture/COMPONENT-EXTRACTION-ROADMAP.md`](../../component-architecture/COMPONENT-EXTRACTION-ROADMAP.md) for future extractions
- Document in [`docs/standards/CSS-ARCHITECTURE.md`](../../docs/standards/CSS-ARCHITECTURE.md)
- Add notes to [`docs/standards/COMPONENT-DESIGN-LIBRARY.md`](../../docs/standards/COMPONENT-DESIGN-LIBRARY.md)

**Success Criteria**:
- [ ] Reviewed all Phase 6 implementations
- [ ] Classified proven patterns using EDS framework
- [ ] Extracted 3-5 high-value CSS utilities
- [ ] Extracted 3-5 shared JavaScript functions
- [ ] Created 1-2 EDS block content models (if applicable)
- [ ] Refactored duplicate code to use extracted components
- [ ] All personas still working after refactoring
- [ ] Component documentation updated
- [ ] No regressions introduced

**What NOT to Extract**:
- ❌ Persona-specific logic (keep this in persona configs)
- ❌ One-off patterns that only appear once
- ❌ Patterns that might change significantly
- ❌ Premature abstractions

**Key Principle**:
> **Rule of Three**: Only extract patterns that appeared in at least 3 different places. Otherwise, duplication is acceptable.

**Reference Documents**:
- 📚 [Component Architecture README](../../component-architecture/README.md) - Master index
- 📊 [Component Extraction Opportunities](../../component-architecture/COMPONENT-EXTRACTION-OPPORTUNITIES.md) - Full audit
- 🎯 [EDS Blocks vs Component Extraction](../../component-architecture/EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md) - Classification guide
- 📋 [Component Extraction Quick Reference](../../component-architecture/COMPONENT-EXTRACTION-QUICK-REFERENCE.md) - Lookup table
- 🗺️ [Component Extraction Roadmap](../../component-architecture/COMPONENT-EXTRACTION-ROADMAP.md) - Planning doc

### Task 6: Demo Walkthrough Guide

**File**: `docs/DEMO-WALKTHROUGH.md`

**Contents**:
- Demo script for each persona
- Key features to highlight
- CCDM demonstration points
- Customer group pricing examples
- Common questions and answers
- Reset instructions

**Demo Flow**:

1. **Sarah Martinez** (5 min)
   - Login as Sarah
   - View templates
   - Select "The Sedona"
   - Choose variant
   - Generate BOM
   - Show repeat ordering efficiency

2. **Marcus Johnson** (7 min)
   - Login as Marcus
   - Start project wizard
   - Select "New Construction"
   - Choose phases
   - Select quality tier
   - **Highlight CCDM filtering at each step**
   - Generate phase-based BOM

3. **Lisa Chen** (6 min)
   - Login as Lisa
   - View bathroom packages
   - Compare Good/Better/Best
   - Select Better package
   - Customize fixtures
   - Generate quote

4. **David Thompson** (10 min) ⭐ **PRIMARY CCDM DEMO**
   - Login as David
   - Enter deck builder
   - **Product count: 2,847 products**
   - Select rectangular shape
   - **Loading: "Filtering to rectangular deck products..."**
   - **Product count: 643 products** ⬇
   - Enter deck size: 16x20
   - Select composite material
   - **Loading: "Finding materials for your 16x20 composite deck..."**
   - **Product count: 127 products** ⬇
   - Select aluminum railing
   - **Loading: "Finding railings compatible with composite..."**
   - **Product count: 89 products** ⬇
   - Review complete kit
   - Show DIY guidance

5. **Kevin Rodriguez** (4-5 min)
   - Login as Kevin
   - **Header shows: "Precision Lumber & Supply - Austin, TX"** ⭐
   - View restock dashboard (Austin store)
   - **Click location dropdown, select "San Antonio"** ⭐
   - **Dashboard updates to San Antonio inventory** ⭐
   - Show velocity-based suggestions
   - Priority indicators (high/medium/low)
   - Quick restock action (bulk add to cart)
   - **Checkout shows San Antonio shipping address** ⭐
   - **Explain: "Order fulfilled from BuildRight's Phoenix warehouse via MSI"** ⭐

### Task 7: Bug Tracking & Fixes

**Bug Categories**:
- Critical (blocks core functionality)
- High (affects user experience)
- Medium (minor issues)
- Low (cosmetic)

**Testing Checklist**:
- [ ] All personas can login
- [ ] All dashboards load correctly
- [ ] All builders/wizards complete successfully
- [ ] Mock ACO service responds correctly
- [ ] Customer group pricing displays
- [ ] CCDM filtering works
- [ ] Cart functionality works
- [ ] No console errors
- [ ] No broken images
- [ ] All custom icons display
- [ ] Responsive layouts work
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

### Success Criteria

✅ All 5 personas work end-to-end  
✅ No cross-persona state contamination  
✅ Mock ACO service functions correctly  
✅ Customer group pricing displays throughout  
✅ CCDM filtering demonstrated clearly  
✅ **⭐ High-value components extracted and documented** (NEW)  
✅ **⭐ Duplicate code refactored to use shared components** (NEW)  
✅ Performance targets met  
✅ Mobile responsive  
✅ Accessibility compliant  
✅ Demo walkthrough guide complete  
✅ All critical/high bugs fixed  
✅ Production-ready

### Deliverables

**Documentation**:
- [ ] `docs/DEMO-WALKTHROUGH.md`
- [ ] `docs/PERFORMANCE-REPORT.md`
- [ ] `docs/ACCESSIBILITY-AUDIT.md`
- [ ] `docs/BROWSER-COMPATIBILITY.md`
- [ ] `docs/KNOWN-ISSUES.md`
- [ ] **⭐ Updated `docs/component-architecture/` documentation** (NEW)

**Component Extraction** (NEW):
- [ ] Extracted CSS utilities in `styles/utilities.css`
- [ ] Extracted JavaScript utilities in `scripts/utils.js` (or specialized files)
- [ ] EDS block content models (if applicable)
- [ ] Updated `docs/standards/CSS-ARCHITECTURE.md`
- [ ] Updated `docs/standards/COMPONENT-DESIGN-LIBRARY.md`
- [ ] Updated `docs/component-architecture/COMPONENT-EXTRACTION-QUICK-REFERENCE.md`
- [ ] Updated `docs/component-architecture/COMPONENT-EXTRACTION-ROADMAP.md`

**Testing**:
- [ ] Test results for all personas
- [ ] Performance test results
- [ ] Accessibility audit results
- [ ] Browser compatibility matrix
- [ ] **⭐ Regression tests after component refactoring** (NEW)

---

## Implementation Timeline

| Phase | Duration | Can Start After | Status |
|-------|----------|-----------------|--------|
| 6B: Marcus | 2 weeks | Phase 4, 5 | Not Started |
| 6C: Lisa | 2 weeks | Phase 4, 5 | Not Started |
| 6D: David | 2-3 weeks | Phase 4, 5 | Not Started |
| 6E: Kevin | **1-1.5 weeks** | Phase 4, 5 | Not Started |
| 7: Integration | 2 weeks | All Phase 6 | Not Started |

**Note**: Phases 6B-6E can be partially parallelized (2-3 at a time)

**Phase 6E Update**: Duration extended from 1 week to 1-1.5 weeks due to multi-location architecture (see [ADR-006](../adr/ADR-006-multi-location-store-manager.md)). Foundation already implemented in Phase 1-5 (location selector, company config, customer context).

**Phase 6E Data Architecture**: Demo mode only (static files). See [DATA-SOURCE-MATRIX](../DATA-SOURCE-MATRIX.md) for full hybrid Commerce PaaS + ACO architecture. Production API integration is a future enhancement.

**Total Time**: 8-10.5 weeks for Phases 6B through 7

---

**Document Version**: 1.0  
**Last Updated**: November 15, 2024

