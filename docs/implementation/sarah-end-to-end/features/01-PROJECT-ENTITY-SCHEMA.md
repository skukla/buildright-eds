# Phase 6-Foundation: Project Entity Schema

**📊 Document Type**: Data Structure Reference  
**📖 Reading Time**: 10-15 minutes  
**👥 Audience**: All developers

This is **Part 2 of 6** in the Phase 6-Foundation planning series.

**← Previous**: [00-OVERVIEW.md](./00-OVERVIEW.md)  
**→ Next**: [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)

---

## Terminology: Project vs. Job vs. Build

### Code vs. UI Terminology

**In Code** (data model, API, variables):
- Always use **"Project"** - `ProjectManager`, `createProject()`, `project.id`
- Reason: Semantically accurate, aligns with software conventions, Adobe Commerce compatible

**In UI** (what users see):
- **Persona-specific terminology** based on real-world industry usage

### Per-Persona Terminology Mapping

| Persona | UI Term | Example Usage | Industry Context |
|---------|---------|---------------|------------------|
| **Sarah Martinez** | **Build** | "House #47 build", "Active builds", "3 builds in progress" | Production builders track "builds" - active construction of spec homes |
| **Marcus Johnson** | **Job** | "Patterson job", "My jobs", "Job in progress" | General contractors use "job" universally - industry standard |
| **Lisa Chen** | **Job** | "Wilson job", "Client jobs", "Active jobs" | Remodeling contractors also use "job" for all project types |
| **David Thompson** | **Project** | "My deck project", "My projects", "Home projects" | DIY/homeowner terminology - Home Depot, Lowe's all use "project" |

### Implementation

**Persona Configuration** (`scripts/persona-config.js`):
```javascript
export const PERSONAS = {
  SARAH: {
    id: 'sarah',
    name: 'Sarah Martinez',
    workItemLabel: 'Build',           // Singular: "this build"
    workItemLabelPlural: 'Builds',    // Plural: "my builds"
    // ...
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus Johnson',
    workItemLabel: 'Job',
    workItemLabelPlural: 'Jobs',
    // ...
  },
  LISA: {
    id: 'lisa',
    name: 'Lisa Chen',
    workItemLabel: 'Job',
    workItemLabelPlural: 'Jobs',
    // ...
  },
  DAVID: {
    id: 'david',
    name: 'David Thompson',
    workItemLabel: 'Project',
    workItemLabelPlural: 'Projects',
    // ...
  }
};
```

**Helper Function**:
```javascript
/**
 * Get work item label for current persona
 * @param {string} personaId - Persona ID
 * @param {boolean} plural - Return plural form
 * @returns {string} Label (e.g., "Build", "Builds", "Job", "Jobs", "Project", "Projects")
 */
export function getWorkItemLabel(personaId, plural = false) {
  const persona = getPersona(personaId);
  return plural ? persona.workItemLabelPlural : persona.workItemLabel;
}
```

**Usage in Dashboards**:
```javascript
// Sarah's dashboard
<h2>Active ${getWorkItemLabel('sarah', true)}</h2>
// Renders: "Active Builds"

// Marcus's dashboard
<h2>My ${getWorkItemLabel('marcus', true)}</h2>
// Renders: "My Jobs"

// David's dashboard
<h2>My ${getWorkItemLabel('david', true)}</h2>
// Renders: "My Projects"
```

### Why This Approach

**Benefits**:
- ✅ Code remains consistent and semantically clear
- ✅ UI matches real-world terminology each persona uses
- ✅ Single data model, multiple presentations
- ✅ Easy to add new personas with different terminology
- ✅ Maps cleanly to Adobe Commerce (quotes, requisition lists, etc.)

**Avoids**:
- ❌ Confusing developers with terms like "WorkItem" or "JobOrProject"
- ❌ Misaligned UX (showing "Projects" to contractors who think in "Jobs")
- ❌ Multiple data models for same concept

---

## Cross-Persona Requirements Analysis

### Sarah Martinez (Production Builder)

**Project Type**: Template-based house builds  
**Primary Use Case**: Repeat ordering of same template with different configurations

**BuildRight's Role**: Materials supplier, NOT construction management platform
- BuildRight provides: Materials ordering, BOM generation, delivery tracking
- Sarah uses separate tools for: Schedule management, budget tracking, inspections

**Requirements**:
- ✅ Store template ID + variant ID
- ✅ Store material configuration (selection packages, upgrades per phase)
- ✅ Smart naming ("Desert Ridge Lot 12" - subdivision + lot number)
- ✅ Reusability: Save configuration, reuse for multiple houses
- ✅ Track materials orders per build (not general project status)
- ✅ Associate orders with specific job sites
- ✅ Delivery location tracking per build
- ✅ Multi-phase ordering (order foundation now, envelope later)
- ✅ Sales rep integration (Adobe Commerce B2B)

**Data Example**:
```javascript
{
  name: "Desert Ridge Lot 12",
  type: "template",
  source: {
    templateId: "sedona",
    variantId: "sedona-bonus",
    subdivision: "Desert Ridge",
    lotNumber: "12"
  },
  configuration: {
    selectionPackage: {
      id: "desert-ridge-premium",
      name: "Desert Ridge Premium",
      addedCost: 18000
    },
    additionalUpgrades: ["seismic_strapping"]
  },
  deliveryLocation: { address: "123 Desert Ridge Way", city: "Phoenix", ... },
  salesRep: { name: "John Smith", email: "john.smith@buildright.com", ... }
}
```

---

### Marcus Johnson (General Contractor)

**Project Type**: Custom home construction  
**Primary Use Case**: Multi-phase ordering over weeks/months

**Requirements**:
- ✅ Store custom project specs (sqft, stories, foundation type)
- ✅ Phase-based ordering (order Phase 1, return later for Phase 2)
- ✅ Track completed phases vs. pending phases
- ✅ Multiple orders per project (one per phase)
- ✅ Quality tier selection
- ✅ Project persistence across sessions

**Data Example**:
```javascript
{
  name: "Patterson Residence",
  type: "semi-custom",
  source: {
    customSpecs: {
      sqft: 2400,
      sqftGarage: 600,
      stories: 2,
      foundationType: "slab"
    }
  },
  configuration: {
    qualityTier: "professional",
    selectedPhases: ["foundation_framing", "envelope", "interior_finish"]
  },
  currentPhase: "envelope",
  completedPhases: ["foundation_framing"]
}
```

---

### Lisa Chen (Remodeling Contractor)

**Project Type**: Remodel jobs (bathroom, kitchen)  
**Primary Use Case**: Quote generation, client sharing, eventual ordering

**Requirements**:
- ✅ Store package tier selection (Good/Better/Best)
- ✅ Store customizations within tier
- ✅ Client information (name, email for quote sharing)
- ✅ Quote generation and versioning
- ✅ Share project via URL
- ✅ Convert quote to order (maybe - not guaranteed)

**Data Example**:
```javascript
{
  name: "Wilson Bathroom Remodel",
  type: "package",
  source: {
    packageId: "bathroom-better",
    roomCategory: "bathroom"
  },
  configuration: {
    packageCustomizations: {
      vanity: { selectedSku: "VAN-PR-002", addedCost: 425 },
      tile: { selectedSku: "TIL-PR-003", addedCost: 680 }
    },
    optionalAddons: ["heated_floor", "led_lighting"]
  },
  client: { name: "Wilson Family", email: "wilson@email.com" },
  status: "quoted",
  quoteUrl: "https://buildright.com/quotes/proj-2024-001"
}
```

---

### David Thompson (DIY Homeowner)

**Project Type**: DIY projects (deck builder)  
**Primary Use Case**: Save and resume configuration, educational guidance

**Requirements**:
- ✅ Store deck configuration (shape, size, material, railing)
- ✅ Save partially complete configuration
- ✅ Resume from any step
- ✅ Track which steps completed
- ✅ Educational content progress tracking (optional)
- ✅ DIY guidance and skill level

**Data Example**:
```javascript
{
  name: "My Backyard Deck",
  type: "deck",
  source: {
    deckConfig: {
      shape: "rectangular",
      size: "16x20",
      sqft: 320,
      material: "composite",
      railing: "aluminum-black",
      accessories: ["post_caps", "led_lighting"]
    }
  },
  configuration: {
    completedSteps: ["shape", "size", "material", "railing", "accessories"],
    currentStep: "review"
  },
  status: "draft",
  estimatedCost: 6817,
  estimatedDIYTime: "4-6 weekends"
}
```

---

### Kevin Rodriguez (Store Manager)

**Project Type**: NONE - Restock is NOT project-based  
**Exception Documented**: Kevin's workflow is fundamentally different

**Why No Projects**:
- ❌ Restock is inventory replenishment, not a "project"
- ❌ No concept of "starting" or "completing" a restock
- ❌ Ongoing, cyclical workflow (restock every 3-4 days)
- ❌ No persistence needed (each restock is independent)

**What Kevin Uses Instead**:
- Store inventory data (per location)
- Velocity calculations
- Smart suggestions
- Restock cart (temporary, not saved)

**Documentation Note**: Kevin explicitly excluded from Project system. His dashboard uses different data structures defined in Phase 6E.

---

## Project Entity Schema

### Complete Schema (~80 fields)

The unified Project entity that adapts to all personas (except Kevin):

```javascript
/**
 * Project Entity - Universal structure for all persona project types
 * Stored in localStorage (MVP) or Adobe Commerce API (production)
 */
{
  // ============================================================================
  // IDENTITY & OWNERSHIP
  // ============================================================================
  
  id: string,                    // "proj-2024-11-25-001" (auto-generated)
  name: string,                  // User-facing: "House #47", "Patterson Residence"
  type: 'template' | 'semi-custom' | 'package' | 'deck',
  
  userId: string,                // "sarah-martinez" (from auth.js)
  persona: string,               // "sarah" (from persona-config.js)
  customerGroup: string,         // "Commercial-Tier2" (for pricing)
  
  // ============================================================================
  // SOURCE - What are they building from?
  // ============================================================================
  
  source: {
    // FOR SARAH (Template-based)
    templateId?: string,         // "sedona"
    variantId?: string,          // "sedona-bonus"
    subdivision?: string,        // "Desert Ridge" (for smart naming)
    lotNumber?: string,          // "12" (for smart naming)
    
    // FOR MARCUS (Semi-custom)
    customSpecs?: {
      sqft: number,
      sqftGarage?: number,
      stories: number,
      foundationType: string,    // "slab", "crawl", "basement"
      projectType: string        // "new_construction", "remodel"
    },
    
    // FOR LISA (Package-based)
    packageId?: string,          // "bathroom-better"
    roomCategory?: string,       // "bathroom", "kitchen"
    
    // FOR DAVID (Deck builder)
    deckConfig?: {
      shape: string,             // "rectangular", "l_shaped"
      size: string,              // "16x20"
      sqft: number,              // 320
      material: string,          // "composite", "wood", "pvc"
      railing: string,           // "aluminum-black"
      accessories: string[]      // ["post_caps", "led_lighting"]
    }
  },
  
  // ============================================================================
  // CONFIGURATION - HOW are they building it?
  // ============================================================================
  
  configuration: {
    // FOR SARAH (Selection package - pre-defined material combinations)
    selectionPackage?: {
      id: string,                // "desert-ridge-premium"
      name: string,              // "Desert Ridge Premium"
      subdivisionSpecific: boolean, // true (tailored to subdivision)
      selections: {
        windows: string,         // "andersen-400-series"
        doors: string,           // "thermatru-smooth-star"
        roofing: string,         // "gaf-timberline-hdz-pewter-gray"
        siding: string,          // "hardie-plank-monterey-taupe"
        interior_paint: string,  // "sherwin-williams-agreeable-gray"
        flooring: string,        // "shaw-vinyl-plank-driftwood"
        // ... all pre-defined SKU selections
      },
      addedCost: number          // 18000 (cost above base)
    },
    additionalUpgrades?: string[], // ["seismic_strapping"] (beyond package)
    
    
    // FOR MARCUS (Quality tier + selected phases)
    qualityTier?: 'builder_grade' | 'professional' | 'premium',
    selectedPhases?: string[],   // ["foundation_framing", "envelope"]
    
    // FOR LISA (Package customizations)
    packageCustomizations?: {
      [category: string]: {      // "vanity", "tile", "hardware"
        selectedSku: string,
        addedCost: number
      }
    },
    optionalAddons?: string[],   // ["heated_floor", "led_lighting"]
    
    // FOR DAVID (Completed steps tracking)
    completedSteps?: string[],   // ["shape", "size", "material"]
    currentStep?: string         // "railing"
  },
  
  // ============================================================================
  // DELIVERY LOCATION (Sarah, Marcus, Lisa)
  // ============================================================================
  
  deliveryLocation?: {
    address: string,             // "123 Desert Ridge Way"
    address2?: string,           // "Suite 100"
    city: string,                // "Phoenix"
    state: string,               // "AZ"
    zip: string,                 // "85001"
    country?: string,            // "US"
    notes?: string               // "Gate code: 1234, Deliver to lot 12"
  },
  
  // ============================================================================
  // SALES REP (Adobe Commerce B2B)
  // ============================================================================
  
  salesRep?: {
    id: string,                  // Commerce sales rep ID
    name: string,                // "John Smith"
    email: string,               // "john.smith@buildright.com"
    phone?: string               // "555-0123"
  },
  
  // ============================================================================
  // LIFECYCLE & STATUS
  // ============================================================================
  
  status: 'draft' | 'configured' | 'quoted' | 'ordered' | 'active' | 'completed' | 'cancelled',
  
  // FOR SARAH (Materials ordering phases)
  phasesOrdered?: string[],      // ["foundation_framing", "envelope"]
  phasesRemaining?: string[],    // ["interior_finish"]
  
  // FOR MARCUS (Multi-phase ordering)
  currentPhase?: string,         // "envelope" (currently ordering)
  completedPhases?: string[],    // ["foundation_framing"] (already ordered)
  
  // ============================================================================
  // ORDERS & COMMERCE
  // ============================================================================
  
  orders: [
    {
      orderId: string,           // "ORD-2024-123"
      phase?: string,            // "foundation_framing" (for Marcus)
      orderDate: string,         // ISO 8601
      totalCost: number,
      status: string,            // "pending", "processing", "delivered"
      items?: number             // Number of items in order
    }
  ],
  
  // ============================================================================
  // BOM (Bill of Materials)
  // ============================================================================
  
  generatedBOM?: {
    phases: [
      {
        phase: string,           // "foundation_framing"
        phaseName: string,       // "Foundation & Framing"
        products: Product[],     // Array of product objects
        estimatedCost: number,
        totalItems: number
      }
    ],
    totalCost: number,
    totalItems: number,
    generatedAt: string          // ISO 8601
  },
  
  // ============================================================================
  // COST TRACKING
  // ============================================================================
  
  estimatedCost: number,         // Before ordering
  actualCost?: number,           // After orders placed (sum of order costs)
  
  // ============================================================================
  // CLIENT INFO (Lisa only)
  // ============================================================================
  
  client?: {
    name: string,
    email: string,
    phone?: string
  },
  
  // ============================================================================
  // SHARING & COLLABORATION (Lisa only)
  // ============================================================================
  
  sharedWith?: string[],         // Email addresses
  quoteUrl?: string,             // Public quote URL
  quoteGeneratedAt?: string,     // ISO 8601
  
  // ============================================================================
  // DIY GUIDANCE (David only)
  // ============================================================================
  
  estimatedDIYTime?: string,     // "4-6 weekends"
  skillLevel?: string,           // "beginner", "intermediate", "advanced"
  
  // ============================================================================
  // METADATA
  // ============================================================================
  
  createdAt: string,             // ISO 8601
  updatedAt: string,             // ISO 8601
  lastAccessedAt: string,        // ISO 8601
  
  // ============================================================================
  // RECOMMENDATIONS & SUBSTITUTES (BuildRight features)
  // ============================================================================
  
  recommendedUpgrades?: [         // Template-based recommendations
    {
      name: string,               // "Seismic strapping"
      description: string,        // "Recommended for this template"
      addedCost: number,          // 850
      adoptionRate?: number       // 0.78 (78% of builders choose this)
    }
  ],
  
  substitutesOffered?: [          // If items unavailable
    {
      originalSku: string,        // "LUMBER-001"
      substituteSku: string,      // "LUMBER-002"
      reason: string,             // "Original out of stock"
      priceDifference: number,    // -50 (cheaper) or +100 (more expensive)
      acceptedByUser: boolean     // Did user accept the substitute?
    }
  ],
  
  // ============================================================================
  // TAGS & SEARCH (Future)
  // ============================================================================
  
  tags?: string[],               // ["urgent", "repeat_order"]
  notes?: string                 // User notes
}
```

### Schema Design Principles

1. **Flexible, Not Bloated**: Each persona only uses relevant fields
2. **Optional Fields**: Use `?` for persona-specific fields
3. **Type Safety**: Clear type definitions for each field
4. **Future-Proof**: Room for expansion without breaking changes
5. **Adobe Commerce Compatible**: Schema maps to Commerce API structures

---

## Next: Learn the API

Now that you understand the data structure, learn how to use it:

**→ [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)**

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

