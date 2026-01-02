# BuildRight Personas, Use Cases & User Flows

**📊 Document Type**: Reference (Persona Profiles)  
**📖 Reading Time**: 30-40 minutes (all personas)  
**👥 Audience**: Everyone (product, UX, developers)

**🔗 Related Docs**:
- **Meta Strategy**: [personas-strategy.md](./personas-strategy.md)
- **UX Patterns**: [personas-ux-patterns.md](./personas-ux-patterns.md)
- **Implementation Plan**: [personas-implementation-plan.md](./personas-implementation-plan.md)

**📍 Use This Doc When**:
- Understanding who our users are
- Learning persona goals and pain points
- Planning user flows
- Implementing persona-specific features

---

## Persona 1: Regional Production Builder

### **Profile**
- **Name:** Sarah Martinez
- **Title:** Purchasing Manager
- **Company:** Sunset Valley Homes (Regional Production Builder)
- **Location:** Phoenix, AZ
- **Scale:** Builds 20-30 homes/year in the Desert Ridge subdivision
- **Tier:** Commercial-Tier2 (volume pricing)
- **Note:** Regional builder without ERP integration; uses BuildRight portal directly for ordering

### **Why This Scale?**
Regional builders at 20-30 homes/year are large enough to benefit from template-based ordering and negotiated pricing, but small enough that they don't have ERP systems that would automate supplier integration. They use the BuildRight B2B portal directly—making this persona ideal for demonstrating Adobe Commerce's full B2B capabilities.

### **Use Case**
Sarah is ordering framing materials for the next 3 units of "The Sedona" floor plan in their Desert Ridge subdivision. She's already ordered materials for 8 units of this plan this year, so she has a saved template. She needs to adjust quantities slightly because 1 of the 3 units will have an optional bonus room.

### **User Flow: Template-Based Repeat Ordering**

```
1. LOGIN & DASHBOARD
   └─ Login → Dashboard shows "My Projects" and "Saved Templates"

2. SELECT TEMPLATE
   └─ Click "The Sedona - Standard Framing Package"
   └─ System loads saved BOM (45 line items, quantities for 1 unit)

3. ADJUST FOR QUANTITY
   └─ Enter: "3 units" in quantity multiplier
   └─ System calculates: 3x all quantities
   └─ Total updates: $25,200

4. CUSTOMIZE FOR VARIANTS
   └─ See option: "1 unit includes bonus room (+200 sq ft)"
   └─ Check box → System adds:
      • 2x4 studs: +80 units
      • OSB sheathing: +7 sheets
      • Additional fasteners
   └─ Revised total: $27,450

5. REVIEW BY CONSTRUCTION PHASE
   └─ BOM displayed in sections:
      • Foundation & Slab (deliver Week 1)
      • Framing Package (deliver Week 3)
      • Roof Trusses (deliver Week 5)
   └─ Delivery scheduling: "Stagger deliveries by phase"

6. SUBMIT ORDER
   └─ "Add to Cart" → Cart shows:
      • Order for: Desert Ridge - The Sedona x3 units
      • Phased delivery: 3 shipments
      • Tier2 pricing applied
      • Total: $27,450
   └─ Checkout

7. SAVE UPDATES TO TEMPLATE
   └─ Prompt: "Save bonus room variant to template?"
   └─ Yes → Template now has "Standard" and "+Bonus Room" options
```

**Adobe Commerce Value Demonstrated:** 
- B2B catalog personalization (tier-specific pricing)
- App Builder integration (BOM microservice)
- Full cart/checkout flow
- Requisition list functionality (saved templates)
- Customer group pricing (Commercial-Tier2)

---

## Persona 2: General Contractor

### **Profile**
- **Name:** Marcus Johnson
- **Title:** Owner/General Contractor
- **Company:** Johnson Custom Builders
- **Location:** Denver, CO
- **Scale:** 3-5 custom homes/year, $800K-$1.5M each
- **Tier:** Residential-Builder

### **Use Case**
Marcus just finalized plans for the Patterson residence - a 2,400 sq ft custom home with a 600 sq ft detached garage. He needs to order Phase 1 materials (foundation and framing). This is a unique design, so he can't use a template - he needs BuildRight to help him generate a comprehensive materials list based on the project specs.

### **User Flow: Semi-Custom Project Builder with Phase Ordering**

```
1. LOGIN & START PROJECT
   └─ Login → "Start New Project"
   └─ Enter project name: "Patterson Residence"

2. PROJECT BUILDER WIZARD
   └─ Step 1: Project Type → "New Construction - Residential Home"
   
   └─ Step 2: Project Scope
      • Square footage: 2,400 main + 600 garage = 3,000 total
      • Stories: 2-story main, 1-story garage
      • Foundation: Slab for main, Slab for garage
      • [ACO Query with: AC-Policy-Project-Type: new_construction]
   
   └─ Step 3: Material Quality
      • Select: "Professional Grade" (his clients expect quality)
      • [ACO Query adds: AC-Policy-Quality: professional]
   
   └─ Step 4: Which Phase Today?
      • ○ Complete project (all materials now)
      • ● Phase 1: Foundation & Framing only ← SELECT THIS
      • ○ Phase 2: Envelope (windows, doors, roofing)
      • ○ Phase 3: Interior finish
      • [ACO Query adds: AC-Policy-Phase: foundation_framing]

3. GENERATED BOM REVIEW
   └─ System generates BOM for Phase 1:
      
      FOUNDATION (Deliver Week 1)
      • Concrete - 24 yards @ $150/yard = $3,600
      • Rebar #4 - 800 ft @ $0.85/ft = $680
      • Anchor bolts, moisture barrier, etc.
      Subtotal: $5,200
      
      FRAMING (Deliver Week 3)
      • 2x4 studs (professional grade) - 450 units
      • 2x6 plates - 180 units
      • LVL beams (engineered)
      • Fasteners package
      • Sheathing
      Subtotal: $18,500
      
      TOTAL PHASE 1: $23,700

4. CUSTOMIZE MATERIALS
   └─ Browse similar products: "View alternative 2x4 options"
   └─ Catalog shows filtered view: professional-grade framing lumber
   └─ Swap: Upgrade to LVL headers for all openings (+$1,200)
   └─ Add: Simpson strong-ties structural hardware package (+$850)
   └─ Updated total: $25,750

5. SAVE & ORDER
   └─ "Save project for future phases" → Saved
   └─ "Add Phase 1 to Cart"
   └─ Cart shows:
      • Patterson Residence - Phase 1: Foundation & Framing
      • 2 scheduled deliveries (foundation then framing)
      • Total: $25,750
   └─ Checkout

6. FUTURE PHASES
   └─ In 3 weeks: Return to "Patterson Residence" project
   └─ Order Phase 2: Envelope materials
   └─ System remembers project specs, suggests appropriate materials
```

**CCDM Value Demonstrated:** Wizard-driven generation, phase filtering, quality tiers, project persistence, catalog browsing with context

---

## Persona 3: Remodeling Contractor

### **Profile**
- **Name:** Lisa Chen
- **Title:** Owner
- **Company:** Chen Kitchen & Bath Remodeling
- **Location:** Charlotte, NC
- **Scale:** 30-40 kitchen/bath remodels/year, $20K-$60K each
- **Tier:** Residential-Builder

### **Use Case**
Lisa has a new client wanting a bathroom remodel. During the consultation, the client expressed interest in a "premium" finish but wants to see pricing before committing. Lisa needs to quickly show the client package options (Good/Better/Best) and then customize the selected package to match their style preferences.

### **User Flow: Package Selection with Customization**

```
1. LOGIN & SELECT PACKAGE BUILDER
   └─ Login → "Bathroom Remodel Packages"

2. CHOOSE PROJECT SIZE
   └─ Question: "Bathroom size?"
      • ○ Half bath (under 40 sq ft)
      • ● Full bath (40-100 sq ft) ← SELECT
      • ○ Master suite (100+ sq ft)

3. PACKAGE COMPARISON VIEW
   └─ See 3 packages side-by-side:
   
   ┌─────────────────────────────────────────────────────┐
   │ GOOD PACKAGE        │ BETTER PACKAGE  │ BEST PACKAGE│
   │ $8,500             │ $14,200         │ $23,800     │
   ├─────────────────────────────────────────────────────┤
   │ Builder-grade      │ Mid-range       │ Premium     │
   │ • Standard tub     │ • Acrylic tub   │ • Soaking tub│
   │ • Laminate vanity  │ • Semi-custom   │ • Custom     │
   │ • Ceramic tile     │ • Porcelain     │ • Natural st│
   │ • Chrome fixtures  │ • Brushed nick  │ • Designer   │
   └─────────────────────────────────────────────────────┘
   
   └─ Select: "BETTER PACKAGE - $14,200"

4. CUSTOMIZE SELECTED PACKAGE
   └─ Package includes 18 items, grouped by category:
   
   FIXTURES (can swap within tier)
   • Bathtub: Acrylic 60" standard ▼
     └─ Swap to: Acrylic 66" soaker (+$425)
   • Vanity: 36" semi-custom, white ▼
     └─ Keep as-is
   • Toilet: Elongated, dual-flush ▼
     └─ Keep as-is
   
   SURFACES
   • Tile: 12x24 porcelain, gray ▼
     └─ Swap to: Large format 24x48 (+$680)
   • Vanity top: Engineered quartz ▼
     └─ Upgrade to: Natural quartz (+$320)
   
   FINISHES
   • Fixtures: Brushed nickel ▼
     └─ Swap all to: Matte black (+$180)
   
   Updated total: $15,805

5. ADD OPTIONAL ITEMS
   └─ System suggests: "Items often added to Better packages:"
      • Heated floor mat (+$425)
      • Recessed medicine cabinet (+$285)
      • LED vanity lighting (+$165)
   └─ Select: Heated floor + LED lighting
   └─ Final total: $16,680

6. REVIEW & ORDER
   └─ Package Summary:
      • Better Package (customized)
      • 20 items total
      • Includes: Installation hardware, moisture barrier, cement board
      • Total: $16,680
   └─ Save as: "Chen Project #2401 - Wilson Bathroom"
   └─ Add to Cart → Checkout

7. SHARE WITH CLIENT (Optional)
   └─ "Email quote to client" → Sends itemized breakdown
   └─ Client can view online, approve
```

**CCDM Value Demonstrated:** Package tiers, within-tier customization, smart suggestions, quote generation

---

## Persona 4: Pro Homeowner (B2C)

### **Profile**
- **Name:** David Thompson
- **Title:** Software Engineer (DIY enthusiast)
- **Company:** Personal project
- **Location:** Portland, OR
- **Tier:** Retail-Homeowner

### **Use Case**
David wants to build a deck for his backyard. He's handy but not a professional. He knows roughly what he wants (16x20 deck, doesn't want to spend $10K to hire a contractor) but doesn't know exactly what materials he needs or if his choices are compatible. He needs the system to guide him through selections and prevent mistakes.

### **User Flow: Progressive Deck Builder with Triggered Policies**

```
1. LOGIN & START BUILDER
   └─ Login (or guest) → "Build Your Deck"
   └─ See: Interactive deck builder with 3D preview placeholder

2. STEP 1: DECK SHAPE
   └─ [ACO Query: Get available deck shapes from master catalog]
   └─ Options shown:
      • Rectangular ✓
      • L-Shaped ✓
      • Wrap-Around (grayed - no kits available)
   └─ SELECT: Rectangular
   └─ [Triggered Policy: AC-Policy-Deck-Shape: rectangular]

3. STEP 2: DECK SIZE
   └─ [ACO Query with: deck_shape=rectangular → get available sizes]
   └─ System calculates options based on available products:
   
   ┌────────────────────────────────────────┐
   │ Size    │ Sq Ft │ Est. Price │ Common? │
   ├────────────────────────────────────────┤
   │ 10x12   │ 120   │ $2,100    │ ⭐⭐    │
   │ 12x16   │ 192   │ $2,850    │ ⭐⭐⭐  │
   │ 16x20   │ 320   │ $4,200    │ ⭐⭐⭐  │
   │ 20x24   │ 480   │ $5,800    │ ⭐     │
   └────────────────────────────────────────┘
   
   └─ Educational note: "16x20 is most popular for family entertaining"
   └─ SELECT: 16x20 (320 sq ft)
   └─ [Triggered Policy: AC-Policy-Deck-Size: 16x20]

4. STEP 3: DECKING MATERIAL
   └─ [ACO Query with: shape=rect + size=16x20 → materials available for this size]
   └─ Options shown (only materials with sufficient stock for 320 sq ft):
   
   PRESSURE-TREATED LUMBER
   • Price: $2,850
   • Maintenance: Seal every 2 years
   • Lifespan: 15-20 years
   • Best for: Budget-conscious
   [Select This]
   
   COMPOSITE DECKING
   • Price: $4,850
   • Maintenance: Wash annually
   • Lifespan: 25-30 years
   • Best for: Low maintenance
   [Select This]
   
   PVC DECKING
   • Price: $6,200 (grayed - budget exceeded)
   • Requires: $6K+ budget
   [Not Available]
   
   └─ SELECT: Composite Decking ($4,850)
   └─ [Triggered Policy: AC-Policy-Material: composite]

5. STEP 4: RAILING SYSTEM
   └─ [ACO Query with: accumulated policies → railings compatible with composite]
   └─ Options shown:
   
   COMPOSITE RAILING (Matches decking)
   • Price: +$1,450
   • Style: Traditional
   [Select This]
   
   ALUMINUM RAILING
   • Price: +$1,680
   • Color options: Black, Bronze, White
   [Select This]
   
   CABLE RAILING (Modern look)
   • Price: +$2,100
   • Not recommended for: Homes with small children
   [Select This]
   
   └─ SELECT: Aluminum - Black (+$1,680)
   └─ [Triggered Policy: AC-Policy-Railing: aluminum]

6. STEP 5: FINISHING TOUCHES
   └─ [ACO Query with: accumulated → compatible accessories]
   └─ Optional add-ons shown:
   
   ☑ Post Caps - Pyramid style - $12 ea × 16 posts = $192
   ☑ LED Deck Lighting - 6-pack recessed = $285
   ☐ Under-deck drainage system = $980 (not selected)
   ☐ Built-in bench kit = $420 (not selected)
   
   └─ Select: Post caps + LED lighting

7. COMPLETE KIT REVIEW
   └─ "Your Deck Kit: 16x20 Composite with Aluminum Railing"
   
   WHAT'S INCLUDED:
   ├─ Decking boards (composite) - calculated for 320 sq ft + 15% waste
   ├─ Joist lumber (pressure-treated) - calculated for structure
   ├─ Concrete footings - quantity for 16x20
   ├─ Joist hangers & structural hardware
   ├─ Decking screws (hidden fasteners for composite)
   ├─ Aluminum railing system - 60 linear feet
   ├─ Pyramid post caps - 16 units
   ├─ LED deck lights - 6-pack
   └─ Installation guide + material cut list
   
   TOTAL: $6,817
   
   ✅ Everything needed for complete installation
   ⚠️ Not included: Tools, concrete mix, post-hole digger
   📋 Estimated DIY time: 4-6 weekends
   🎓 Skill level required: Intermediate

8. ADD TO CART
   └─ "Complete Deck Kit - 16x20 Composite" added to cart
   └─ System suggests: "Need tools? View our deck building tool kit"
   └─ Checkout

9. POST-PURCHASE
   └─ Confirmation email includes:
      • Detailed cut list
      • Step-by-step assembly guide
      • Video tutorial links
      • Local permit office info
```

**CCDM Value Demonstrated:** Progressive disclosure via triggered policies, dynamic filtering at each step, educational guidance, completeness validation, extreme catalog filtering (only saw ~35 products from 184)

---

## Persona 5: Hardware Store Manager

### **Profile**
- **Name:** Kevin Rodriguez
- **Title:** Store Manager
- **Company:** Pacific Northwest Hardware (Regional chain - 15 stores)
- **Location:** Store #7 - Tacoma, WA
- **Scale:** Orders 2-3x per week for store inventory
- **Tier:** Retail-Chain-Buyer

### **Use Case**
It's Thursday morning, and Kevin is doing his weekly restock order. His POS system shows he's low on fasteners, common lumber sizes, and hand tools. He needs to replenish these items before the weekend rush. He wants the system to suggest quantities based on his store's sales velocity, but he also needs the flexibility to adjust based on upcoming promotions.

### **User Flow: Inventory Restock Mode**

```
1. LOGIN & RESTOCK DASHBOARD
   └─ Login → Lands on "Store #7 - Tacoma Restock Dashboard"
   └─ See overview:
      • Last restock: 4 days ago
      • Current inventory status: 73% optimal
      • Items needing attention: 42 SKUs
      • Weekend forecast: High traffic expected

2. QUICK RESTOCK VIEW
   └─ System shows categories needing restock:
   
   ┌──────────────────────────────────────────────────────┐
   │ Category        │ Low Stock │ Suggested │ Priority  │
   ├──────────────────────────────────────────────────────┤
   │ Fasteners       │ 18 items  │ $850     │ 🔴 High   │
   │ Common Lumber   │ 8 items   │ $2,400   │ 🔴 High   │
   │ Hand Tools      │ 12 items  │ $620     │ 🟡 Medium │
   │ Power Tools     │ 3 items   │ $340     │ 🟢 Low    │
   │ Paint Supplies  │ 15 items  │ $480     │ 🟡 Medium │
   └──────────────────────────────────────────────────────┘

3. REVIEW FASTENERS (High Priority)
   └─ Click "Fasteners - 18 items low"
   └─ System shows smart restock suggestions:
   
   DECK SCREWS - 3" EXTERIOR (SKU: FAST-3001)
   • Current: 4 boxes (24% of optimal)
   • Avg daily sales: 3.2 boxes
   • Days until out: 1.2 days ⚠️
   • SUGGESTED: Order 15 boxes (2-week supply)
   • Your call: [15] boxes    [Update]
   
   FRAMING NAILS - 16D (SKU: FAST-1120)
   • Current: 12 boxes (40% of optimal)
   • Avg daily sales: 2.1 boxes
   • Days until out: 5.7 days
   • SUGGESTED: Order 10 boxes
   • Your call: [10] boxes    [Update]
   
   [View all 18 fastener items...]

4. ADJUST FOR PROMOTION
   └─ Kevin knows there's a deck-building promotion this weekend
   └─ Manual override:
      • Deck screws: Change from 15 → 25 boxes
      • Joist hangers: Change from 8 → 15 boxes
      • Reason: "Weekend deck promo" (optional note)

5. REVIEW LUMBER (High Priority)
   └─ Click "Common Lumber - 8 items"
   
   2x4x8 STUD - STANDARD (SKU: LBR-2408)
   • Current: 45 units (30% of optimal)
   • Avg daily sales: 18 units
   • Days until out: 2.5 days ⚠️
   • SUGGESTED: Order 120 units (week supply)
   • Delivery: Standard truck (Fri delivery) ✓
   • Your call: [120] units   [Update]
   
   2x6x10 TREATED BOARD (SKU: LBR-2610T)
   • Current: 22 units (50% of optimal)
   • Avg daily sales: 5.2 units
   • Days until out: 4.2 days
   • SUGGESTED: Order 30 units
   • Your call: [30] units    [Update]

6. QUICK-ADD FROM SEASONAL DISPLAY
   └─ Kevin remembers the spring gardening display needs supplies
   └─ Switch to: "Browse by Store Department"
   └─ Seasonal/Garden Center
   └─ Quick-add common seasonal items:
      • Potting soil - 50 bags
      • Garden gloves - 24 pairs
      • Hand trowels - 12 units

7. REVIEW ORDER SUMMARY
   └─ Restock Order Summary:
   
   FASTENERS (18 items)          $1,020  🚚 Fri delivery
   LUMBER (8 items)              $2,400  🚚 Fri delivery
   HAND TOOLS (6 selected)       $380    🚚 Mon delivery
   SEASONAL (3 items)            $285    🚚 Fri delivery
   ───────────────────────────────────────
   TOTAL ORDER:                  $4,085
   
   Estimated delivery: Friday AM (fasteners, lumber, seasonal)
                      Monday AM (hand tools - supplier delay)
   
   ☑ Charge to Store Account #PNW-007
   ☑ Delivery to: Store #7 rear receiving dock

8. SUBMIT & SCHEDULE
   └─ "Submit Restock Order"
   └─ Confirmation:
      • Order #RS-2847 created
      • Email receipt sent
      • Delivery tracking available
      • Next suggested restock: Monday (4 days)

9. ORDER HISTORY
   └─ View "Store #7 Order History"
   └─ See pattern:
      • Weekly restocks: Fasteners, lumber
      • Bi-weekly: Hand tools, paint
      • Seasonal adjustments visible
      • Sales velocity trends shown
```

**CCDM Value Demonstrated:** Non-project ordering pattern, velocity-based suggestions, store-specific catalog, inventory management use case, different persona/use case than construction projects

---

## Summary: 5 Personas, 5 Flows, Adobe Commerce Value

| Persona | Flow Type | Key Adobe Commerce Capability |
|---------|-----------|-------------------------------|
| **Sarah** (Regional Builder) | Template & Repeat | B2B pricing, App Builder BOM service, full checkout |
| **Marcus** (GC) | Semi-Custom Builder | Wizard generation, phase filtering, catalog browsing |
| **Lisa** (Remodeler) | Package Selection | Tier comparison, quote generation, client sharing |
| **David** (Homeowner) | Progressive Builder | Guided configuration, step-by-step revelation |
| **Kevin** (Store Mgr) | Restock Mode | Inventory management, velocity-based suggestions |

**Each flow is distinct. No overlap. All demonstrate unique Adobe Commerce + App Builder value.**

