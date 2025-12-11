# Industry Realism Analysis: Research vs Implementation

**Created**: December 6, 2025  
**Status**: ✅ Decision Made & Implemented  
**Source**: Research from Perplexity (see `docs/Perplexity-Research.md`)

---

## ✅ Decision Made: Option A - Regional Builder (Direct Ordering)

**Date**: December 6, 2025

After reviewing the research against our implementation, we decided to:

1. **Scale down Sarah's company** from 120 → 20-30 homes/year
2. **Keep the full Adobe Commerce flow** (template → BOM → cart → checkout)
3. **Position as regional builder** without ERP integration who uses portal directly

**Rationale**: The primary goal is showcasing Adobe Commerce capabilities. A verification-only portal wouldn't demonstrate the full commerce funnel. Regional builders at 20-30 homes/year realistically use B2B portals directly.

**Changes Implemented**:
- ✅ Updated `docs/personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md` with new scale
- ✅ Added "Why This Scale?" explanation to persona
- ✅ Updated demo narrative to reflect smaller quantities

---

## Executive Summary

### 🎯 Bottom Line

| Question | Answer |
|----------|--------|
| **Should we abandon Phase 6A?** | **NO** - Keep it with minor reframing |
| **Are changes needed?** | **YES** - Scale down Sarah's company ✅ DONE |
| **Is buildright-service affected?** | **NO** - Research VALIDATES the BOM microservice approach |
| **Are other personas affected?** | **MINIMAL** - Marcus, Lisa, David, Kevin are MORE realistic |

---

## Part 1: Key Research Findings

### The "Backwards Relationship" Discovery

The research reveals a critical insight about **production home builders (Lennar-scale)**:

> "Lennar is the platform. BuildRight is the plug-in."

**What this means:**

| Our Assumption | Industry Reality |
|----------------|------------------|
| Sarah "shops" on BuildRight portal | Lennar's ERP automatically sends POs to suppliers |
| Sarah configures materials per build | National Accounts team configures ONCE annually |
| Sarah makes selections at order time | Selections are locked in the sales contract BEFORE ordering |
| Portal is the primary interface | Portal is for visibility/exceptions, not shopping |

### The Two-Tier Model

Real production builders use a **bifurcated** approach:

1. **National Account Setup (One-Time)**
   - Corporate negotiates master supply agreement
   - Defines approved SKU catalogs per template
   - Locks pricing, rebates, delivery terms
   - Happens once per year

2. **Execution (Per-Build)**
   - Construction Manager releases pre-approved POs
   - Automated via ERP/SupplyPro
   - No "shopping" - just triggering delivery
   - Manual intervention only for exceptions

---

## Part 2: What's VALIDATED by Research ✅

### The BOM Microservice Approach

**HIGHLY REALISTIC** - The research confirms:

> "Your BOM Microservice idea is spot on... It's a logic-based engine. This represents the 'cutting edge' of where the industry is moving."

This validates `buildright-service`:
- ✅ Template-based BOM calculation
- ✅ Parametric estimation (specs → quantities)
- ✅ Package-based product selection
- ✅ Phase-organized output

**Industry parallel**: This is exactly what **Paradigm Estimate** (owned by Builders FirstSource) does.

### The Template Onboarding Concept

**REALISTIC** - Research confirms:

> "Lennar doesn't just hand over a PDF... A modern supplier (BuildRight) takes architectural files and converts them into a 3D BIM digital twin."

Our `data/templates.json` and the template-to-BOM flow mirrors this.

### Phase-Organized BOMs

**REALISTIC** - Research confirms:

> "Splitting the bill of materials by construction phase matches the Just-in-Time workflow. This is CRITICAL because Lennar doesn't want all materials at once."

Our phase structure (Foundation & Framing → Envelope → Interior Finish) is correct.

---

## Part 3: What Needs Adjustment ⚠️

### Problem 1: Sarah's Company Scale

**Current Definition**:
```
Company: Sunset Valley Homes
Scale: 120 homes/year across 3 active subdivisions
Tier: Commercial-Tier2
```

**Issue**: At 120 homes/year, a real builder would have:
- ERP integration (SupplyPro, JD Edwards)
- National account agreements
- Automated PO release, NOT portal shopping

### Recommended Change

**Option A: Scale Down Company (RECOMMENDED)**

```
Company: Sunset Valley Homes
Scale: 20-30 homes/year across 1-2 subdivisions
Tier: Commercial-Tier2
Note: Regional builder without ERP integration
```

**Why this works:**
- Research acknowledges smaller builders DO need manual portal access
- Quote: "One-Off Custom Builds... A smaller builder doesn't have ERP integration. They need a manual portal to order materials."
- 20-30 homes/year is realistic for regional/family builders
- Portal flow becomes appropriate for this scale

**Option B: Add Demo Positioning (Complementary)**

Keep scale, but add explicit positioning:

> "BuildRight Portal on Adobe Commerce demonstrates how a B2B supplier can serve multiple customer types—from fully-integrated enterprise builders to mid-market builders who need a flexible self-service interface."

### Problem 2: "Shopping" vs "Configuration" Mental Model

**Current Flow**:
- Sarah browses templates → Configures materials → Generates BOM → Orders

**Research Reality**:
- Templates are configured ONCE during national account setup
- Per-build ordering is just "release the PO for this lot"

### Recommended Change

**Reframe the Flow as "Setup Mode"**

Position Sarah's template configuration as:
- ✅ "Setting up templates for the subdivision" (one-time)
- ✅ "Validating BOM before season starts" (quarterly)
- ❌ NOT "shopping for materials" (per-build)

**Add this context to documentation**:

> "Sarah uses the configurator to set up and validate templates for her subdivision. Once configured, she can quickly reuse these for subsequent lots without re-configuring."

### Problem 3: Finish Package Selection

**Current Flow**: Sarah can select from multiple finish packages with different SKUs

**Research Reality**:
> "Lennar doesn't let end customers choose freely. They offer 3-5 pre-configured finish packages tied to specific brands because of rebate agreements."

**Assessment**: ✅ Our implementation IS correct!

We already show 3-5 packages (Builder's Choice, Desert Ridge Premium, etc.) - not infinite SKU selection. This matches the research.

---

## Part 4: Impact on Other Personas

### Marcus Johnson (General Contractor) - Phase 6B

| Aspect | Assessment | Notes |
|--------|------------|-------|
| **Scale**: 3-5 custom homes/year | ✅ PERFECT | No ERP integration expected |
| **Portal shopping flow** | ✅ PERFECT | Manual ordering is realistic |
| **Semi-custom configuration** | ✅ PERFECT | Custom homes need project-by-project BOM |
| **Multi-phase ordering** | ✅ PERFECT | Order foundation now, envelope later |

**Verdict**: 🟢 **NO CHANGES NEEDED** - Marcus is MORE realistic than Sarah

### Lisa Chen (Remodeling Contractor) - Phase 6C

| Aspect | Assessment | Notes |
|--------|------------|-------|
| **Scale**: 30-40 remodels/year | ✅ PERFECT | Too small for ERP |
| **Package selection flow** | ✅ PERFECT | Good/Better/Best packages |
| **Quote generation** | ✅ PERFECT | Client-sharing workflow |
| **Per-project configuration** | ✅ PERFECT | Every job is different |

**Verdict**: 🟢 **NO CHANGES NEEDED** - Lisa is highly realistic

### David Thompson (DIY Homeowner) - Phase 6D

| Aspect | Assessment | Notes |
|--------|------------|-------|
| **Consumer persona** | ✅ PERFECT | B2C is completely different |
| **Guided wizard flow** | ✅ PERFECT | Needs help selecting materials |
| **Progressive configuration** | ✅ PERFECT | One-time purchase |

**Verdict**: 🟢 **NO CHANGES NEEDED** - David is a textbook B2C flow

### Kevin Rodriguez (Store Manager) - Phase 6E

| Aspect | Assessment | Notes |
|--------|------------|-------|
| **Inventory restock flow** | ✅ PERFECT | Completely different use case |
| **Velocity-based suggestions** | ✅ PERFECT | Not project-based |
| **Non-construction ordering** | ✅ PERFECT | Retail inventory management |

**Verdict**: 🟢 **NO CHANGES NEEDED** - Kevin is a different paradigm entirely

---

## Part 5: Impact on buildright-service Repository

### Assessment: 🟢 NO CHANGES NEEDED

The research **validates** the buildright-service architecture:

| Service Component | Research Validation |
|-------------------|---------------------|
| **BOM Action** | "BOM Microservice is spot on... cutting edge" |
| **Template Service** | "Onboarding templates is exactly how it works" |
| **Phase Calculations** | "Phase-based delivery matches JIT workflow" |
| **Package SKU Overrides** | "Package-based selection is realistic" |
| **Persona/Pricing** | Valid - different customer groups get different prices |

**Key Insight**: The research says the **backend approach is correct**, only the **frontend positioning** (who uses the portal and how) needs adjustment.

### What buildright-service Does Correctly

1. **BOM Generation from Templates** ✅
   - `BuildRight_generateBOMFromTemplate` query
   - Template + variant + package → BOM with quantities

2. **Context-Based Product Filtering** ✅
   - `X-Catalog-View-Id` header for product visibility
   - `X-Price-Book-Id` header for persona pricing
   - `X-Quality-Tier` header for package filtering

3. **Package-Based SKU Overrides** ✅
   - `packages.json` defines exact SKUs per package
   - Allows "Desert Ridge Premium" to specify exact window model

4. **Phase-Organized Output** ✅
   - Foundation & Framing → Envelope → Interior Finish
   - Matches construction sequence

---

## Part 6: Recommended Action Plan

### Immediate Actions (Before Continuing Phase 6A)

#### 1. Update Sarah's Persona Definition

**File**: `docs/personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md`

**Change**:
```markdown
## Before
- **Scale:** Builds 120 homes/year across 3 active subdivisions

## After
- **Scale:** Builds 20-30 homes/year in Desert Ridge subdivision
- **Note:** Regional builder without ERP integration; uses BuildRight portal directly
```

#### 2. Add Demo Positioning Statement

**File**: `docs/phase-6/A-sarah-dashboard/README.md` (or similar)

**Add section**:
```markdown
## Demo Positioning

This implementation demonstrates how a B2B supplier portal can serve
multiple builder types:

- **Enterprise Builders (Lennar-scale)**: Would typically integrate via API;
  the portal serves for transparency, exception handling, and account setup.
  
- **Mid-Market Builders (Sarah's scale)**: Use the portal directly for 
  template-based ordering without ERP integration.
  
- **Custom Builders (Marcus)**: Use the portal for semi-custom project 
  configuration with phase-by-phase ordering.

The workflow shown demonstrates "best case" capabilities that could be
exposed via API to enterprise customers or directly to smaller builders.
```

#### 3. Reframe Sarah's Use Case Description

**Current**: "Sarah is ordering framing materials for the next 8 units..."

**Updated**: "Sarah is setting up material configurations for her Desert Ridge subdivision. Once configured, she can quickly order for new lots without re-configuration."

### Optional Enhancements (Phase 7+)

#### Add "Configuration History" to Sarah's Dashboard

Shows that templates are set up once and reused:
- "Sedona Standard - Configured Oct 15, 2025"
- "Sedona + Bonus Room - Configured Oct 15, 2025"
- "Last ordered: Lot 18 (Nov 30, 2025)"

#### Add "Lot Quick-Order" Flow

For repeat ordering after initial configuration:
1. Click "Quick Order" on saved configuration
2. Enter lot number
3. Confirm delivery date
4. Done (no re-configuration needed)

---

## Part 7: Summary Table

| Aspect | Original State | Resolution | Status |
|--------|----------------|------------|--------|
| **Sarah's company scale** | 120 homes/year | Changed to 20-30 homes/year | ✅ DONE |
| **Demo positioning** | Not explicit | Added "Why This Scale?" section | ✅ DONE |
| **Use case framing** | "Shopping" mental model | Kept direct ordering (for Adobe Commerce demo) | ✅ DONE |
| **Marcus persona** | 3-5 homes/year | No change needed | ✅ DONE |
| **Lisa persona** | 30-40 remodels/year | No change needed | ✅ DONE |
| **David persona** | DIY homeowner | No change needed | ✅ DONE |
| **Kevin persona** | Store manager | No change needed | ✅ DONE |
| **buildright-service** | BOM microservice | No change needed (validated) | ✅ DONE |
| **BOM calculation logic** | Template → quantities | No change needed | ✅ DONE |
| **Package system** | 3-5 curated packages | No change needed (matches research) | ✅ DONE |

---

## Conclusion

**Don't abandon Phase 6A** - the core implementation is sound and the backend approach is industry-validated.

**Do make these adjustments**:
1. Scale down Sarah's company to 20-30 homes/year
2. Add demo positioning language
3. Reframe from "shopping" to "setup and reuse"

**The research actually validates most of your work**, particularly:
- The BOM microservice concept (cutting-edge)
- Template-based ordering (industry standard)
- Phase-organized delivery (matches JIT)
- Package-based selection (realistic rebate structure)

The adjustment needed is primarily **how you describe the workflow**, not the workflow itself.

---

## Related Documents

- [Perplexity Research](../../Perplexity-Research.md) - Source research document
- [Personas and Flows](../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md) - All persona definitions
- [BOM Service](buildright-service/docs/services/BOM-SERVICE.md) - Technical implementation

---

**Document Version**: 1.0  
**Last Updated**: December 6, 2025

