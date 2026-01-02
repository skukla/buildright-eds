# Documentation Flow Guide

**Date**: November 26, 2025  
**Purpose**: Understand how all Phase 6/0.5 documents relate to each other  
**Status**: Reference Guide

---

## Document Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 6: TAXONOMY FOUNDATION                  │
│                      (Strategic Decisions)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ PRODUCT-TAXONOMY-      │
                 │ ANALYSIS.md            │◀─── DEFINES taxonomy
                 │                        │     (construction_phase,
                 │ • Analyzes 5 personas  │      quality_tier, etc.)
                 │ • Defines attributes   │
                 │ • Recommends unified   │
                 └────────────┬───────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
   ┌────────────────────────┐   ┌────────────────────────┐
   │ ACO-CATALOG-           │   │ 01-PROJECT-ENTITY-     │
   │ ARCHITECTURE.md        │   │ SCHEMA.md              │
   │                        │   │                        │
   │ • ACO implementation   │   │ • Project data model   │
   │ • Catalog views        │   │ • Uses taxonomy attrs  │
   │ • Policies             │   │                        │
   └────────────────────────┘   └────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 0.5: PRODUCT EXPANSION                     │
│                  (Applies Taxonomy)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ PRODUCT-EXPANSION-     │
                 │ SUMMARY.md             │◀─── WHAT was added
                 │                        │     (6 categories,
                 │ • 157 new products     │      157 products,
                 │ • 6 new categories     │      6 new UOMs)
                 │ • 6 new UOMs           │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ PRODUCT-CATEGORY-      │
                 │ TAXONOMY-MAPPING.md    │◀─── HOW it maps
                 │                        │     (applies existing
                 │ • Maps to taxonomy     │      taxonomy, no new
                 │ • Validates personas   │      attributes)
                 │ • Shows coverage       │
                 └────────────┬───────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
   ┌────────────────────────┐   ┌────────────────────────┐
   │ MATERIAL-ESTIMATING-   │   │ BOM-CALCULATOR-        │
   │ RULES.md               │   │ SUMMARY.md             │
   │                        │   │                        │
   │ • Industry formulas    │   │ • Service architecture │
   │ • Proper UOMs          │   │ • Uses new products    │
   │ • Waste factors        │   │ • 18 BOMs generated    │
   └────────────┬───────────┘   └────────────┬───────────┘
                │                            │
                └────────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ PERSONA-PRODUCT-       │
                │ PLANNING-PROCESS.md    │◀─── Future expansion
                │                        │     (how to add Marcus,
                │ • 6-step process       │      Lisa, David, Kevin
                │ • Product reuse (92%)  │      products)
                │ • Marcus example       │
                └────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION & BACKEND                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ ACO-APP-BUILDER-       │
                 │ INTEGRATION.md         │◀─── Migration path
                 │                        │     (client-side →
                 │ • 3-layer architecture │      App Builder)
                 │ • Integration patterns │
                 │ • Security/deployment  │
                 └────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    STATUS & SUMMARIES                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
   ┌────────────────────────┐   ┌────────────────────────┐
   │ BOM-SERVICE-           │   │ PROJECT-STATUS-        │
   │ COMPLETE.md            │   │ OVERVIEW.md            │
   │                        │   │                        │
   │ • Deliverables ✅      │   │ • Session summary      │
   │ • Success criteria     │   │ • Current state        │
   │ • Next steps           │   │ • Roadmap position     │
   └────────────────────────┘   └────────────────────────┘
```

---

## Reading Paths by Goal

### Goal: Understand the Taxonomy

**Path 1: Strategic Understanding**
1. [PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md) - Why unified? What attributes?
2. [ACO-CATALOG-ARCHITECTURE.md](./ACO-CATALOG-ARCHITECTURE.md) - How implemented in ACO?
3. [PRODUCT-CATEGORY-TAXONOMY-MAPPING.md](./PRODUCT-CATEGORY-TAXONOMY-MAPPING.md) - How do new categories fit?

**Time**: 60-70 minutes

---

### Goal: Implement BOM Calculator

**Path 2: BOM Implementation**
1. [PRODUCT-EXPANSION-SUMMARY.md](./PRODUCT-EXPANSION-SUMMARY.md) - What products exist?
2. [MATERIAL-ESTIMATING-RULES.md](./MATERIAL-ESTIMATING-RULES.md) - What formulas to use?
3. [BOM-CALCULATOR-SUMMARY.md](./BOM-CALCULATOR-SUMMARY.md) - How does it work?
4. [ACO-APP-BUILDER-INTEGRATION.md](./ACO-APP-BUILDER-INTEGRATION.md) - How to deploy?

**Time**: 70-85 minutes

---

### Goal: Add Products for New Persona

**Path 3: Persona Expansion**
1. [PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md) - Understand taxonomy first
2. [PRODUCT-CATEGORY-TAXONOMY-MAPPING.md](./PRODUCT-CATEGORY-TAXONOMY-MAPPING.md) - See examples
3. [PERSONA-PRODUCT-PLANNING-PROCESS.md](./PERSONA-PRODUCT-PLANNING-PROCESS.md) - Follow process

**Time**: 60-75 minutes

---

### Goal: Quick Status Check

**Path 4: Status Review**
1. [PROJECT-STATUS-OVERVIEW.md](./PROJECT-STATUS-OVERVIEW.md) - Current state
2. [BOM-SERVICE-COMPLETE.md](./BOM-SERVICE-COMPLETE.md) - Phase 0.5 deliverables

**Time**: 35-45 minutes

---

## Key Principles

### 1. No Duplication, Clear Roles

| Document | Role | Defines or Applies? |
|----------|------|---------------------|
| PRODUCT-TAXONOMY-ANALYSIS.md | **DEFINES** taxonomy | Defines ✅ |
| PRODUCT-CATEGORY-TAXONOMY-MAPPING.md | **APPLIES** taxonomy | Applies ✅ |
| ACO-CATALOG-ARCHITECTURE.md | **IMPLEMENTS** taxonomy | Applies ✅ |
| BOM-CALCULATOR-SUMMARY.md | **USES** taxonomy | Uses ✅ |

### 2. Chronological Order

**Phase 6 Planning** (Earlier):
- PRODUCT-TAXONOMY-ANALYSIS.md
- ACO-CATALOG-ARCHITECTURE.md
- 01-PROJECT-ENTITY-SCHEMA.md

**Phase 0.5 Implementation** (This Session):
- PRODUCT-EXPANSION-SUMMARY.md
- PRODUCT-CATEGORY-TAXONOMY-MAPPING.md
- BOM-CALCULATOR-SUMMARY.md

### 3. Cross-References

Each document now has clear cross-references:

```
PRODUCT-TAXONOMY-ANALYSIS.md
    └─▶ See PRODUCT-CATEGORY-TAXONOMY-MAPPING.md for Phase 0.5 expansion

PRODUCT-CATEGORY-TAXONOMY-MAPPING.md
    ├─▶ Applies taxonomy from PRODUCT-TAXONOMY-ANALYSIS.md
    └─▶ See PRODUCT-EXPANSION-SUMMARY.md for what was added

PRODUCT-EXPANSION-SUMMARY.md
    └─▶ See PRODUCT-CATEGORY-TAXONOMY-MAPPING.md for taxonomy mapping

BOM-CALCULATOR-SUMMARY.md
    └─▶ See ACO-APP-BUILDER-INTEGRATION.md for backend integration
```

---

## Common Questions

### Q: Is the taxonomy duplicated across documents?

**A**: No duplication:
- **PRODUCT-TAXONOMY-ANALYSIS.md**: DEFINES the taxonomy (authoritative source)
- **PRODUCT-CATEGORY-TAXONOMY-MAPPING.md**: APPLIES it to new categories (reference + validation)

Both mention the same attributes, but for different purposes:
- One defines them (why, what they mean)
- One shows how they're used (examples, mapping)

---

### Q: Do I need to read all documents?

**A**: No, use the reading paths above based on your goal:
- **Implementing BOM?** → Path 2 (BOM Implementation)
- **Adding persona products?** → Path 3 (Persona Expansion)
- **Understanding system?** → Path 1 (Strategic Understanding)
- **Quick check?** → Path 4 (Status Review)

---

### Q: Which document is the "source of truth" for taxonomy?

**A**: **PRODUCT-TAXONOMY-ANALYSIS.md** is the authoritative definition.

All other documents reference and apply that taxonomy. If there's ever a conflict, PRODUCT-TAXONOMY-ANALYSIS.md wins.

---

### Q: Are all 5 personas considered in the taxonomy?

**A**: Yes! PRODUCT-TAXONOMY-ANALYSIS.md analyzed all 5 personas:
- ✅ Sarah - construction_phase, selection_category
- ✅ Marcus - quality_tier, construction_phase
- ✅ Lisa - room_category, package_tier
- ✅ David - project_type, deck_compatible
- ✅ Kevin - store_velocity_category, restock_priority

The taxonomy was designed to work for all personas from the start.

---

### Q: What happens when we add Marcus/Lisa/David/Kevin?

**A**: Follow the process in PERSONA-PRODUCT-PLANNING-PROCESS.md:
1. Analyze their catalog needs
2. Calculate product reuse (e.g., Marcus reuses 92% of Sarah's)
3. Define delta products (only what's unique)
4. Apply existing taxonomy attributes
5. No changes to taxonomy needed ✅

---

## Document Stats

| Document | Lines | Words | Purpose |
|----------|-------|-------|---------|
| PRODUCT-TAXONOMY-ANALYSIS.md | 920 | ~8,000 | Strategy & Definition |
| PRODUCT-CATEGORY-TAXONOMY-MAPPING.md | 600 | ~5,500 | Application & Validation |
| ACO-CATALOG-ARCHITECTURE.md | 850 | ~7,500 | Implementation Guide |
| BOM-CALCULATOR-SUMMARY.md | 650 | ~5,800 | Service Architecture |
| PERSONA-PRODUCT-PLANNING-PROCESS.md | 800 | ~7,200 | Process Guide |

**Total Phase 6 + 0.5 Docs**: ~3,800 lines, ~34,000 words

---

## Update History

| Date | Document | Change |
|------|----------|--------|
| Nov 26, 2025 | PRODUCT-CATEGORY-TAXONOMY-MAPPING.md | Added intro clarifying it applies existing taxonomy |
| Nov 26, 2025 | PRODUCT-TAXONOMY-ANALYSIS.md | Added note linking to Phase 0.5 mapping |
| Nov 26, 2025 | README.md | Updated reading order to show taxonomy → expansion flow |
| Nov 26, 2025 | DOCUMENTATION-FLOW.md | Created this document |

---

**Status**: Documentation flow clarified ✅  
**No duplication**: Each document has clear, unique purpose ✅  
**All personas considered**: Taxonomy covers all 5 from the start ✅

