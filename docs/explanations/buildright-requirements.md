# BuildRight Business Requirements

**Audience:** All stakeholders
**Purpose:** Business scope, terminology, and product requirements

---

## BuildRight's Scope: Materials Supplier

**BuildRight is a materials supplier/distributor**, NOT a construction management platform.

```
                    BuildRight's Domain
┌─────────────────────────────────────────────────┐
│  ✅ What BuildRight Does                         │
├─────────────────────────────────────────────────┤
│  • Generate Bills of Materials (BOMs)            │
│  • Enable materials ordering (with config)       │
│  • Track delivery of materials to job sites      │
│  • Provide pricing, availability, recs           │
│  • Support multi-phase ordering                  │
│  • Enable configuration reuse across builds      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  ❌ What BuildRight Does NOT Do                  │
├─────────────────────────────────────────────────┤
│  • Track construction schedules/timelines        │
│  • Manage project budgets (beyond materials)     │
│  • Coordinate subcontractors or labor            │
│  • Track inspections, permits, compliance        │
│  • General project status (on schedule, etc.)    │
└─────────────────────────────────────────────────┘
```

**Example (Sarah's Workflow)**:
- Uses BuildRight: Order materials, track deliveries, generate BOMs
- Uses other tools (Buildertrend, Procore): Schedule, budget, inspections

---

## Terminology: Code vs. UI

### The Project Entity

A "Project" in BuildRight represents:
> **"A materials ordering context for a specific construction job"**

It tracks what materials are needed, ordered, delivered, and what configuration applies—NOT overall construction status.

### Persona-Specific Labels

**In Code**: Always use "Project" (`ProjectManager`, `createProject()`, `project.id`)

**In UI**: Persona-specific terminology

| Persona | UI Term | Example |
|---------|---------|---------|
| **Sarah Martinez** | Build | "Active Builds", "3 builds in progress" |
| **Marcus Johnson** | Job | "My Jobs", "Job in progress" |
| **Lisa Chen** | Job | "Active Jobs", "Client jobs" |
| **David Thompson** | Project | "My Projects", "Home projects" |
| **Kevin Rodriguez** | N/A | Restock workflow (no projects) |

**Implementation**: `persona-config.js` provides `workItemLabel` and `workItemLabelPlural` per persona.

---

## Persona Requirements Summary

### Sarah Martinez (Production Builder)
- **Project Type**: Template-based house builds
- **Organization**: Subdivision-first (Desert Ridge Lot 12)
- **Configuration**: Selection packages (pre-defined material combinations)
- **Ordering**: Multi-phase (foundation now, envelope later)

### Marcus Johnson (General Contractor)
- **Project Type**: Custom home construction
- **Configuration**: Quality tier + custom specs
- **Ordering**: Phase-based over weeks/months

### Lisa Chen (Remodeling Contractor)
- **Project Type**: Package-based remodels (bathroom, kitchen)
- **Configuration**: Good/Better/Best tiers with customizations
- **Features**: Client quote sharing, quote-to-order conversion

### David Thompson (DIY Homeowner)
- **Project Type**: DIY projects (deck builder)
- **Configuration**: Step-by-step guided configuration
- **Features**: Save/resume, educational guidance

### Kevin Rodriguez (Store Manager)
- **Project Type**: NONE (restock is NOT project-based)
- **Workflow**: Inventory replenishment, cyclical, independent

---

## Multi-Phase Ordering

Production builders order materials in phases aligned with construction stages:

```
┌─────────────────────────────────────────────────────────────┐
│  Construction Phase           Materials                      │
├─────────────────────────────────────────────────────────────┤
│  1. Foundation & Framing      Lumber, concrete, hardware     │
│  2. Envelope                  Windows, doors, roofing, siding│
│  3. Interior Finish           Flooring, drywall, paint, trim │
└─────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Sarah clicks "Order Materials" → Modal shows phase selection
2. Selects phase(s) to order
3. Reviews filtered BOM grouped by category
4. Edits quantities, adds to cart

**Tracking**: Project stores `phasesOrdered` and `phasesRemaining`

---

## Selection Packages

Production builders use pre-defined material combinations (industry standard from M/I Homes, Conaway, Ivory Home):

```
┌───────────────────────────────────────────────────────────────┐
│  Package                      Added Cost    Materials          │
├───────────────────────────────────────────────────────────────┤
│  Builder's Choice (Standard)  +$0           Standard materials │
│  Desert Ridge Premium         +$18,000      Premium finishes   │
│  Sunset Valley Executive      +$35,000      Luxury materials   │
└───────────────────────────────────────────────────────────────┘
```

**Package Structure**:
```
Package = {
  id: "desert-ridge-premium",
  name: "Desert Ridge Premium",
  addedCost: 18000,
  skuMappings: {
    windows: "WIN-ANDER-400-3660",    // Andersen 400 Series
    roofing: "ROOF-GAF-HDZ-PEWTER",   // GAF Timberline HDZ
    siding: "SIDING-HARDIE-MONTEREY"  // Hardie Plank
  }
}
```

**Benefits**:
- Faster configuration (1 package vs 50+ SKUs)
- Realistic workflow (matches industry practice)
- Demonstrates CCDM policy-based filtering

---

## Product Data Requirements

### Minimum Catalog (60-80 SKUs)

| Category | Subcategories | Min SKUs | Phase |
|----------|---------------|----------|-------|
| Lumber | 2x4, 2x6, 2x8, Plywood, OSB | 8-10 | Foundation |
| Windows | Double-hung, Casement, Picture | 6-9 | Envelope |
| Doors | Entry, Patio, Garage | 6-9 | Envelope |
| Roofing | Shingles, Underlayment | 6-8 | Envelope |
| Siding | Vinyl, Hardie, Stucco | 6-9 | Envelope |
| Flooring | Carpet, Vinyl, Tile, Hardwood | 8-10 | Interior |
| Drywall | 1/2", 5/8", Supplies | 4-6 | Interior |
| Paint | Interior, Exterior, Primer | 6-8 | Interior |
| Fixtures | Faucets, Lighting, Hardware | 8-10 | Interior |

### Required Product Attributes

```
{
  sku: "WIN-ANDER-400-3660",
  name: "Andersen 400 Series Double Hung 36x60",
  category: "windows",
  constructionPhase: "envelope",    // For phase filtering
  qualityTier: "premium",           // For package mapping
  price: 425.00
}
```

### Quality Tiers

| Tier | Target | Price Point |
|------|--------|-------------|
| Standard | Value builders | Baseline |
| Premium | Mid-range | +20-40% |
| Executive | High-end | +50-100% |

---

## Dashboard Organization

### Sarah: Template Dashboard vs. Active Builds

**Two Separate Views** (based on industry research):

1. **Template Dashboard** (Browsing):
   - Purpose: Catalog for selecting templates
   - Action: "Start New Build"
   - Analogy: Product catalog

2. **Active Builds Dashboard** (Operations):
   - Purpose: Manage ongoing construction
   - Organization: Subdivision-first (with template filtering)
   - Actions: View details, track orders, manage deliveries

This separation matches how production builders actually work.

---

## Key Decisions (From Planning)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Terminology | Code="Project", UI=persona-specific | Single model, multiple presentations |
| Naming | Smart defaults (subdivision + lot) | Industry standard organization |
| Organization | Subdivision-first tracking | Matches real-world workflows |
| Material Selection | Pre-defined packages | Industry standard, faster config |
| Phase Ordering | Modal → filtered BOM → cart | Clean, focused workflow |

---

**Source:** Consolidated from Phase 6-Foundation planning (2024-11)
**See Also:** [Persona System](./PERSONA-SYSTEM.md) | [Backend Services](./BACKEND-SERVICES.md)
