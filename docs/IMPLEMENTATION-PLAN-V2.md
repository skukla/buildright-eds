# BuildRight Implementation Plan v2.0

## Revised Approach: Vertical Slice Implementation

**Created**: December 10, 2025  
**Status**: Active  
**Supersedes**: Original horizontal-layer approach in PERSONA-META-PLAN.md

---

## Key Shift

Instead of implementing all persona UIs first and then integrating backends, we now implement **each persona end-to-end** before moving to the next.

### Why This Approach?

1. **Faster demonstrable value** - Each completed persona is fully functional
2. **Pattern establishment** - Patterns proven in Sarah inform Marcus, etc.
3. **Reduced integration risk** - Backend integration issues surface early
4. **Better testing** - Each persona can be fully tested before moving on

---

## Prerequisites (Complete)

### ✅ Foundation (Phases 0-5)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Research, ADRs documented |
| Phase 1 | ✅ Complete | ACO data generation (buildright-aco) |
| Phase 2 | ⏸️ Deferred | Custom icons (using emojis for now) |
| Phase 3 | ✅ Complete | Core architecture, persona config, auth |
| Phase 4 | ✅ Complete | Shared components |
| Phase 5 | ✅ Complete | Existing page refactors |

### ✅ Commerce Backend Data

| Component | Status | Count |
|-----------|--------|-------|
| Simple Products | ✅ Complete | 146 |
| Bundle Products | ✅ Complete | 12 |
| Categories | ✅ Complete | 37 |
| Product Attributes | ✅ Complete | 13 |
| Customer Groups | ✅ Complete | 5 |
| Demo Customers | ✅ Complete | 5 |
| Product Images | ✅ Complete | 35 |
| Website/Store/View | ✅ Complete | BuildRight dedicated |

### ✅ Backend Service (buildright-service)

| Component | Status |
|-----------|--------|
| GraphQL Mesh | ✅ Deployed |
| BOM Generation | ✅ Working |
| Persona API | ✅ Working |
| ACO Integration | ✅ Connected |

---

## Persona Implementation Order

Each persona follows the same pattern:
1. **Dashboard UI** - The persona's home view
2. **Builder/Wizard UI** - The persona's primary workflow
3. **GraphQL Integration** - Connect to backend services
4. **Commerce Integration** - Verify pricing, cart, checkout
5. **Testing** - End-to-end persona flow
6. **Documentation** - Update completion summary

---

## Phase 6A: Sarah Martinez (Production Builder)

**Status**: 🔄 In Progress  
**Estimated Remaining**: 1-2 weeks

### Completed
- ✅ Sub-Phase 1: Dashboard Simplification

### Remaining Sub-Phases

| Sub-Phase | Description | Time | Status |
|-----------|-------------|------|--------|
| 2 | Persona Integration | 2h | 🚧 Next |
| 3 | Apollo Client Setup | 2-3h | Pending |
| 4 | GraphQL Query Hooks | 1-2h | Pending |
| 5 | Build Configurator | 4-6h | Pending |
| 6 | My Builds Dashboard | 3-4h | Pending |
| 7 | BOM Review Page | 2-3h | Pending |
| 8 | Integration & Polish | 2-3h | Pending |

### Key Deliverables
- Template dashboard with 6 floor plans
- Build configurator (template → variant → package → phases)
- BOM generation via GraphQL
- BOM review with phase grouping
- Add to cart functionality

### Success Criteria
- [ ] Sarah can login and see template dashboard
- [ ] Sarah can select template, variant, package, phases
- [ ] BOM generates via GraphQL (not local calculation)
- [ ] BOM displays with phase grouping
- [ ] Products can be added to cart
- [ ] Pricing reflects Production-Builder customer group

---

## Phase 6B: Marcus Johnson (General Contractor)

**Status**: Not Started  
**Estimated Duration**: 2 weeks  
**Prerequisites**: Phase 6A complete

### Key Features
- Project wizard with vertical progress indicator
- Phase-based material selection (Foundation → Envelope → Interior)
- Quality tier selection (Builder Grade → Professional → Premium)
- CCDM filtering demonstration (visible product count changes)
- Educational content at each step
- Phase-specific BOM generation

### Sub-Phases (Following Sarah's Pattern)
1. Dashboard UI
2. Project Wizard UI
3. GraphQL Integration (reuse patterns from Sarah)
4. CCDM visualization
5. Testing & Documentation

### Key Deliverables
- Project dashboard
- Multi-step wizard with CCDM
- Quality tier filtering
- Educational content panels
- Phase-based BOM

---

## Phase 6C: Lisa Chen (Remodeling Contractor)

**Status**: Not Started  
**Estimated Duration**: 2 weeks  
**Prerequisites**: Phase 6A complete (can parallel with 6B)

### Key Features
- Good/Better/Best package comparison
- Complete bathroom package photos
- Package customization within tier
- Product swaps
- Quote generation
- Client sharing

### Key Deliverables
- Package dashboard
- Package comparison view (3-column)
- Customization interface
- Quote generation
- Visual, immersive experience

---

## Phase 6D: David Thompson (DIY Homeowner - Deck Builder)

**Status**: Not Started  
**Estimated Duration**: 2-3 weeks  
**Prerequisites**: Phase 6A complete

### Key Features (⭐ PRIMARY CCDM DEMO)
- Full-page immersive deck builder
- Large hero images at each step
- Progressive CCDM filtering with product count
- DIY educational content
- Static deck preview
- Visible product count widget

### CCDM Demonstration Flow
```
Entry:     2,847 products available
Shape:     → 643 products (rectangular selected)
Material:  → 127 products (composite selected)
Railing:   → 89 products (aluminum selected)
```

### Key Deliverables
- Deck builder wizard
- Product count widget
- Hero images per step
- Educational content
- BOM with DIY guidance

---

## Phase 6E: Kevin Rodriguez (Store Manager)

**Status**: Not Started  
**Estimated Duration**: 1-1.5 weeks  
**Prerequisites**: Phase 6A complete

### Key Features
- Multi-location restock dashboard (3 stores)
- Velocity-based calculations
- Priority indicators
- Smart restock suggestions
- Location switching via header
- Bulk ordering

### Architecture (See ADR-006)
- **Kevin's Stores**: Austin, San Antonio, Houston (frontend)
- **BuildRight Warehouses**: Phoenix, Denver, etc. (MSI fulfillment)

### Key Deliverables
- Restock dashboard (location-aware)
- Velocity calculations
- Priority indicators
- Bulk add to cart
- Location switching

---

## Phase 7: Final Integration & Polish

**Status**: Partially Complete  
**Estimated Duration**: 2 weeks  
**Prerequisites**: All Phase 6 personas complete

### Already Complete
- ✅ Commerce data setup
- ✅ Website/Store/View configuration

### Remaining Tasks

| Task | Description | Time |
|------|-------------|------|
| Cross-Persona Testing | Login as each, verify no state contamination | 4h |
| Performance Optimization | Image optimization, code splitting | 4h |
| Responsive Design | Test all breakpoints | 2h |
| Accessibility | WCAG 2.1 AA compliance | 3h |
| Component Extraction | Extract proven patterns | 6h |
| Demo Walkthrough Guide | Script for all 5 personas | 3h |
| Bug Fixes | Critical and high priority | 4h |

### Key Deliverables
- Demo walkthrough guide
- Performance report
- Accessibility audit
- Extracted components documentation
- Final QA signoff

---

## Timeline Summary

| Phase | Duration | Status | Dependencies |
|-------|----------|--------|--------------|
| Prerequisites | - | ✅ Complete | None |
| 6A: Sarah | 1-2 weeks | 🔄 In Progress | Prerequisites |
| 6B: Marcus | 2 weeks | Not Started | 6A patterns |
| 6C: Lisa | 2 weeks | Not Started | 6A patterns |
| 6D: David | 2-3 weeks | Not Started | 6A patterns |
| 6E: Kevin | 1-1.5 weeks | Not Started | 6A patterns |
| 7: Final | 2 weeks | Pending | All 6A-6E |

**Parallel Opportunities**:
- 6B and 6C can run in parallel after 6A
- 6D can start after 6A (requires most imagery)
- 6E is shortest, can be last

**Total Remaining**: ~10-13 weeks

---

## Cross-References

### Key Documents

| Document | Purpose |
|----------|---------|
| `docs/phase-6/A-sarah-dashboard/UPDATED-IMPLEMENTATION-PLAN.md` | Detailed Sarah sub-phases |
| `docs/phase-6/B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md` | Other persona details |
| `docs/phase-7-commerce/COMMERCE-DATA-REQUIREMENTS.md` | Commerce data specs |
| `docs/personas/PERSONA-META-PLAN.md` | Original plan (superseded) |

### Repositories

| Repository | Purpose |
|------------|---------|
| `buildright-eds` | Frontend (this repo) |
| `buildright-service` | GraphQL mesh, BOM generation |
| `buildright-aco` | ACO data generation |
| `buildright-commerce` | Commerce import scripts |

---

## Next Steps

1. **Continue Phase 6A**: Sub-Phase 2 (Persona Integration)
2. **Complete Phase 6A**: All 8 sub-phases
3. **Begin Phase 6B/6C**: Apply patterns from Sarah
4. **Complete remaining personas**
5. **Final polish and demo prep**

---

**Document Version**: 2.0  
**Last Updated**: December 10, 2025  
**Status**: Active - Vertical slice approach

