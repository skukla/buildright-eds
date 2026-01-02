# BuildRight Project Builder Enhancement Plan

## Executive Summary

Research-based enhancements to BuildRight's project builder focusing on:

1. **Conditional visualization** for room-based projects (bathroom, kitchen, basement, additions)
2. **Educational tooltips** to guide users through selections
3. **Enhanced bundle presentation** with images and stock indicators
4. **Component toggles** to customize what's included
5. **Better quote sharing** (print, copy, email)

All features are **frontend-only** with no backend dependencies.

---

## Competitor Research Summary

**Key Insights from Home Depot, Lowe's, Menards:**

- Visual-first approach with real-time 2D previews
- Precise measurement inputs for accurate material calculations
- Component flexibility (toggle what to include)
- Educational support with inline tips
- Professional quote output options

**What BuildRight Will Adopt:**

- Conditional visualization (only for room/framing projects)
- Educational tooltips and tips
- Enhanced bundle display with images
- Better print/share functionality

---

## Phase 1: Conditional Visualization

### Which Projects Get Visualization

**✅ WITH Visualization** (room-based, BuildRight's core):

- `remodel.bathroom` - Bathroom renovation
- `remodel.kitchen` - Kitchen renovation  
- `remodel.basement` - Basement finishing (includes framing)
- `new_construction.residential_home` - Home framing
- `new_construction.addition` - Home addition

**❌ WITHOUT Visualization** (skip to complexity step):

- All `repair.*` projects (targeted fixes, not spatial)
- `remodel.whole_house` (too large/complex)
- `remodel.exterior` (varies: siding, roofing, etc.)
- `new_construction.commercial_building` (too complex)
- All `*.other` categories (undefined scope)

### Visualization Types

**Room Visualization** (bathroom, kitchen):

- 2D floor plan showing room dimensions
- Door and window openings marked
- Calculated floor area and wall area
- Materials estimate based on measurements

**Room + Framing** (basement, addition, residential_home):

- Floor plan view + wall framing elevation
- Shows stud spacing (16" on center)
- Door/window headers indicated
- Calculated: studs needed, plate footage, drywall sheets

### Implementation: SVG Generation

**JavaScript generates SVG markup** dynamically:

```javascript
// Room floor plan
function renderRoomVisualization(measurements) {
  const { length, width, height, doors, windows } = measurements;
  const scale = 20; // pixels per foot
  
  return `
    <svg viewBox="0 0 ${width * scale + 100} ${length * scale + 100}">
      <!-- Room outline -->
      <rect x="50" y="50" 
            width="${width * scale}" 
            height="${length * scale}" 
            fill="#f5f5f5" stroke="#333" stroke-width="3"/>
      
      <!-- Door opening -->
      ${doors > 0 ? `<line ... stroke="#ff6b6b" stroke-width="4"/>` : ''}
      
      <!-- Window -->
      ${windows > 0 ? `<rect ... fill="#87ceeb"/>` : ''}
      
      <!-- Dimensions -->
      <text>Width: ${width} ft</text>
      <text>Length: ${length} ft</text>
      
      <!-- Calculations -->
      <text>Floor Area: ${length * width} sq ft</text>
      <text>Wall Area: ${2 * (length + width) * height} sq ft</text>
    </svg>
  `;
}
```

**For Framing Projects:**

- Wall elevation view showing vertical studs
- Headers over openings
- Material calculations displayed

### Measurement Inputs

**Step 2.5: "Project Measurements"** (conditional, inserted after Details)

**Inputs:**

- Length (ft): 4-50, default 10
- Width (ft): 4-50, default 10  
- Height (ft): 7-12, default 8
- Doors: dropdown 0-4
- Windows: dropdown 0-6

**Features:**

- Real-time SVG update as values change
- "Skip This Step" button for quick estimates
- Validation prevents unrealistic values

---

## Phase 2: Enhanced Bundle Presentation

### Product Images

**Add throughout:**

- Material selection wizard (Step 2): Add product thumbnails to cards
- Bundle results table (Step 5): Image column before product name
- Fallback to placeholder if image unavailable

**Size:** 60x60px thumbnails

### Stock Availability Indicators

**Visual indicators in bundle table:**

- ✓ Green + "In Stock" (>100 units at warehouse)
- ⚠️ Yellow + "Low Stock" (10-100 units)
- ✗ Red + "Out of Stock" (0 units)
- Show warehouse: "Sacramento RDC"

### Why This Item Tooltips

Add (?) icon next to each product:

- Hover/click shows: "Included because: Structural framing for 8ft walls"
- Helps contractors understand bundle logic

### Component Category Toggles

**Toggle controls above bundle:**

```
☑ Primary Materials (lumber, drywall, panels)     $450.00
☑ Fasteners & Hardware (nails, screws, brackets)  $85.00
☐ Tools & Accessories (blades, bits, gear)        $120.00
☑ Finishing Materials (compound, tape, paint)     $95.00
                                          Total: $630.00
```

**Functionality:**

- Check/uncheck to include/exclude entire category
- Price updates dynamically
- Show/hide category sections in table
- Defaults: Primary + Fasteners ON, others OFF

---

## Phase 3: Educational Content

### Contextual Tooltips

**Throughout wizard, add (?) icons with explanations:**

**Step 1 - Project Type:**

- "New Construction": Building new structures from foundation up
- "Remodel": Renovating existing spaces
- "Repair": Fixing or maintaining existing structures

**Step 3 - Complexity:**

- "Basic": DIY-friendly, standard materials, 1-2 weeks
- "Moderate": Some pro help, mid-range materials, 2-4 weeks
- "Complex": Professional required, premium materials, 4+ weeks

**Step 4 - Budget:**

- "Material costs only. Labor and permits not included."

### Project Tips Sidebar

**Add below project summary:**

```
💡 Project Tips
• Typical timeline: 2-3 weeks
• Check local permit requirements
• Order 10% extra for waste/cuts
• Consider hiring licensed pro
```

Tips vary by project type and complexity.

### Resource Links

**At Step 5 (Results), add:**

```
📚 Related Resources
• How to Frame a Wall
• Drywall Installation Guide
• [View All Guides →] (links to Ideas Center)
```

---

## Phase 4: Quote Sharing & Output

### Enhanced Printing

**Improve print stylesheet:**

- BuildRight logo at top
- Professional header with project details
- Clean table (no interactive elements)
- Project summary and totals
- "Generated on [date]" timestamp

### Copy Materials List

**Button copies formatted text:**

```
BUILDRIGHT MATERIALS LIST
Project: Bathroom Remodel (Moderate)
Generated: Nov 8, 2025

PRIMARY MATERIALS
- 2x4x8 SPF Stud (BR-001) x24 @ $4.50 = $108.00
- 1/2" Drywall 4x8 (BR-002) x12 @ $8.75 = $105.00

FASTENERS & HARDWARE
- 3" Framing Nails (BR-150) x1 @ $12.50 = $12.50

TOTAL: $225.50
```

### Email Quote

Opens `mailto:` with pre-filled:

- Subject: "BuildRight Quote - Bathroom Remodel"
- Body: Formatted materials list (same as copy)

### Shareable URL

Encode selections in URL parameters:

`/project-builder.html?type=remodel&detail=bathroom&complexity=moderate&budget=5k_15k&measurements=10x8x8`

Anyone with link sees same configuration.

### Project Notes

**Add at Step 5:**

- Optional textarea for contractor notes
- Examples: "Client prefers dark stain", "Check permits"
- Stored in sessionStorage only
- Included in printed quote

---

## Implementation Details

### Files to Modify

**1. `buildright-eds/pages/project-builder.html`**

- Add Step 2.5 (measurements) conditionally
- Add educational tooltips (? icons)
- Add component toggles above bundle
- Add copy/email/print buttons
- Add project notes field
- Update print styles

**2. `buildright-eds/scripts/project-builder.js`**

- Add conditional visualization logic
- Handle measurement inputs
- Component toggle functionality
- URL parameter encoding/decoding
- Copy to clipboard function
- Email quote function

### New Files

**3. `buildright-eds/scripts/project-visualizer.js`**

- SVG generation for room views
- SVG generation for framing views
- Material calculation functions
- Real-time update handlers

**4. `buildright-eds/scripts/educational-content.js`**

- Tooltip content mapping
- Tips by project type
- Resource links

### Project Feature Mapping

```javascript
const PROJECT_FEATURES = {
  'new_construction.residential_home': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'new_construction.addition': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.bathroom': {
    hasVisualization: true,
    visualizationType: 'room',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.kitchen': {
    hasVisualization: true,
    visualizationType: 'room',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.basement': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  // All others: hasVisualization: false
};
```

---

## Success Metrics

- **Visualization Engagement:** % of users who input measurements
- **Bundle Customization:** % who toggle components on/off
- **Educational Engagement:** Tooltip click rate
- **Quote Sharing:** Usage of print/copy/email features
- **Conversion:** Bundle-to-cart rate

---

## Scope Summary

### ✅ IN SCOPE (Frontend Only)

- Conditional 2D visualization (SVG)
- Measurement inputs with validation
- Product images/thumbnails
- Stock availability indicators
- Component category toggles
- Educational tooltips and tips
- Enhanced printing
- Copy/email materials list
- Shareable URLs
- Project notes (sessionStorage)

### ❌ OUT OF SCOPE (Requires Backend/Too Complex)

- Save/load projects persistently
- My Projects management page
- Multi-project comparison
- PDF export (complex library)
- Material comparison modal (removed for simplicity)
- Delivery preferences (requires checkout)
- Team collaboration (requires backend)
- Order tracking (requires backend)

---

## Key Principles

1. **Keep it simple** - Focus on high-value features only
2. **Frontend only** - No backend dependencies
3. **BuildRight focus** - Framing, drywall, windows/doors (no decks)
4. **Professional contractors** - Design for pros who know their trade
5. **Visual when it helps** - Room projects only, not everything