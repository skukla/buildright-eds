# Phases 6B-7: Remaining Implementation Plans

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

**Duration**: 1 week  
**Dependencies**: Phase 4, Phase 5  
**Persona**: Kevin Rodriguez - Store Manager

### Overview

Kevin needs a velocity-based restock dashboard to manage store inventory efficiently.

### Key Objectives

1. Create restock dashboard
2. Implement velocity calculations
3. Add priority indicators
4. Create smart restock suggestions
5. Support bulk ordering
6. Category-based view

### Dashboard Sections

**1. Inventory Health Overview**
- Total SKUs tracked
- Low stock count
- Out of stock count
- Restock recommendations pending

**2. Priority Categories**
- High velocity items needing restock
- Sorted by urgency
- Color-coded priority (High/Medium/Low)

**3. Smart Suggestions**
- Velocity-based calculations
- Seasonal adjustments
- Promotional considerations
- Recommended restock quantities

**4. Category View**
- Filter by product category
- View velocity by category
- Quick restock by category

### Data Requirements

**File**: `data/store-inventory.json`

```json
{
  "storeInfo": {
    "storeId": "247",
    "location": "Phoenix, AZ",
    "manager": "Kevin Rodriguez"
  },
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
      "lastRestocked": "2024-10-28"
    }
    // ... more items
  ]
}
```

### Implementation Files

**Dashboard**: `scripts/dashboards/restock-dashboard.js`
- Overview widgets
- Priority list
- Smart suggestions
- Quick-add to cart
- Bulk actions

**Styles**: `styles/dashboards/restock-dashboard.css`

### Success Criteria

✅ Dashboard displays inventory health  
✅ Velocity calculations accurate  
✅ Priority indicators clear  
✅ Smart suggestions reasonable  
✅ Quick-add functionality works  
✅ Bulk actions work  
✅ Category filtering works  
✅ Data visualization clear  

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
6. Create demo walkthrough guide
7. Bug fixes and polish
8. Production readiness check

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

### Task 5: Demo Walkthrough Guide

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

5. **Kevin Rodriguez** (4 min)
   - Login as Kevin
   - View restock dashboard
   - Show velocity-based suggestions
   - Priority indicators
   - Quick restock action

### Task 6: Bug Tracking & Fixes

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

**Testing**:
- [ ] Test results for all personas
- [ ] Performance test results
- [ ] Accessibility audit results
- [ ] Browser compatibility matrix

---

## Implementation Timeline

| Phase | Duration | Can Start After | Status |
|-------|----------|-----------------|--------|
| 6B: Marcus | 2 weeks | Phase 4, 5 | Not Started |
| 6C: Lisa | 2 weeks | Phase 4, 5 | Not Started |
| 6D: David | 2-3 weeks | Phase 4, 5 | Not Started |
| 6E: Kevin | 1 week | Phase 4, 5 | Not Started |
| 7: Integration | 2 weeks | All Phase 6 | Not Started |

**Note**: Phases 6B-6E can be partially parallelized (2-3 at a time)

**Total Time**: 8-10 weeks for Phases 6B through 7

---

**Document Version**: 1.0  
**Last Updated**: November 15, 2024

