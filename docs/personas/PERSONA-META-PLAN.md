# BuildRight Persona Implementation - Meta Plan

## Overview

This meta-plan orchestrates the implementation of the BuildRight persona-driven experience across 7 major phases and 13 implementation plans. Each phase is designed to be independently testable with clear success criteria.

**Key Principle**: All ACO (Adobe Commerce Optimizer) connections are **MOCKED** in this implementation. The mock should closely mirror the eventual production behavior to enable seamless transition.

---

## Implementation Phases

### Phase 0: Research & Architecture Decisions
**Duration**: 1-2 weeks  
**Dependencies**: None  
**Plan Document**: `PHASE-0-RESEARCH-AND-DECISIONS.md`

Research Adobe Commerce Storefront SDK (Dropins) and EDS patterns to make informed architecture decisions before building.

**Key Deliverables**:
- Block vs Dropin decision matrix
- EDS DOM manipulation patterns documented
- Architecture decision records

---

### Phase 1: ACO Data Foundation (Mocked)
**Duration**: 2-3 weeks  
**Dependencies**: None (can run parallel to Phase 0)  
**Plan Document**: `PHASE-1-ACO-DATA-FOUNDATION.md`

Create mock data structures that mirror ACO format for products, pricing, and policies. Update buildright-aco repository to generate EDS-compatible data.

**Key Deliverables**:
- Enhanced product definitions with persona attributes
- 6 customer group price books
- Policy definitions documentation
- Mock data generation pipeline

---

### Phase 2: Design System & Icons
**Duration**: 1 week  
**Dependencies**: Phase 0  
**Plan Document**: `PHASE-2-DESIGN-SYSTEM-AND-ICONS.md`

Create professional custom icons and formalize design system usage.

**Key Deliverables**:
- ~40 custom SVG icons
- Icon library documentation
- Design system guidelines

---

### Phase 3: Core Architecture
**Duration**: 1-2 weeks  
**Dependencies**: Phase 0, Phase 1  
**Plan Document**: `PHASE-3-CORE-ARCHITECTURE.md`

Build foundational architecture including persona config, mock ACO service layer, and authentication system.

**Key Deliverables**:
- Persona configuration system
- Mock ACO service (mirrors real ACO API)
- Authentication system with persona switching
- Generic page templates

---

### Phase 4: Shared Components
**Duration**: 2 weeks  
**Dependencies**: Phase 2, Phase 3  
**Plan Document**: `PHASE-4-SHARED-COMPONENTS.md`

Build reusable EDS blocks used across multiple persona flows.

**Key Deliverables**:
- 5 shared EDS blocks
- Component documentation
- Block testing suite

---

### Phase 5: Existing Page Refactor
**Duration**: 2-3 weeks  
**Dependencies**: Phase 3, Phase 4  
**Plan Document**: `PHASE-5-EXISTING-PAGE-REFACTOR.md`

Audit and refactor existing pages to support persona-aware experiences and remove deprecated patterns.

**Key Deliverables**:
- Page audit checklist
- Refactored login, account, catalog, PDP, cart pages
- Dropin integration (mocked where needed)

---

### Phase 6: Persona-Specific Implementations
**Duration**: 7-10 weeks (can be partially parallelized)  
**Dependencies**: Phase 4, Phase 5

Individual persona implementations, each with unique dashboards and builder flows.

#### Phase 6A: Sarah (Production Builder)
**Duration**: 1-2 weeks  
**Plan Document**: `PHASE-6A-PERSONA-SARAH.md`

Template-based ordering with floor plans and repeat BOMs.

#### Phase 6B: Marcus (General Contractor)
**Duration**: 2 weeks  
**Plan Document**: `PHASE-6B-PERSONA-MARCUS.md`

Phase-based project wizard with educational content and CCDM demonstration.

#### Phase 6C: Lisa (Remodeling Contractor)
**Duration**: 2 weeks  
**Plan Document**: `PHASE-6C-PERSONA-LISA.md`

Good/Better/Best package builder with visual comparisons and customization.

#### Phase 6D: David (Pro Homeowner)
**Duration**: 2-3 weeks  
**Plan Document**: `PHASE-6D-PERSONA-DAVID.md`

DIY deck builder with progressive disclosure and immersive hero images.

#### Phase 6E: Kevin (Store Manager)
**Duration**: 1 week  
**Plan Document**: `PHASE-6E-PERSONA-KEVIN.md`

Velocity-based restock dashboard with smart suggestions.

---

### Phase 7: Integration & Polish
**Duration**: 2 weeks  
**Dependencies**: All Phase 6 plans  
**Plan Document**: `PHASE-7-INTEGRATION-AND-POLISH.md`

End-to-end testing, performance optimization, and demo preparation.

**Key Deliverables**:
- Cross-persona integration testing
- Performance optimization
- Demo walkthrough guide
- Final QA and bug fixes

---

## Dependency Graph

```
Phase 0 (Research)
    ↓
Phase 2 (Icons) ────┐
                    ↓
Phase 1 (ACO Data) → Phase 3 (Architecture) → Phase 4 (Components) → Phase 5 (Page Refactor)
                                                                            ↓
                                                    ┌───────────────────────┴───────────────────┐
                                                    ↓                                           ↓
                                            Phase 6A (Sarah)                            Phase 6B (Marcus)
                                            Phase 6C (Lisa)                             Phase 6D (David)
                                            Phase 6E (Kevin)
                                                    ↓
                                            Phase 7 (Integration)
```

**Parallel Opportunities**:
- Phase 0 and Phase 1 can run simultaneously
- Phase 6A-6E can be partially parallelized (up to 2-3 at a time)
- Icon creation (Phase 2) can start during Phase 0 research

---

## Mock ACO Strategy

**Critical**: All ACO interactions are mocked in this implementation.

### What Gets Mocked

1. **Product Catalog API**
   - Mock service returns products with persona-specific attributes
   - Simulates ACO's attribute filtering

2. **Pricing API**
   - Mock service returns customer-group-specific pricing
   - Includes volume tier calculations

3. **Triggered Policies (CCDM)**
   - Mock service simulates progressive catalog filtering
   - Shows visual loading states
   - Returns filtered product sets based on user selections

4. **Customer/User API**
   - Mock service returns user context with customer group
   - Simulates authentication state

### How to Build Mocks

**Principle**: Mock the eventual ACO API structure as closely as possible.

```javascript
// Example: Mock ACO service should return data in ACO format
mockACOService.getProducts({
  policy: 'deck_rectangular',
  userContext: { customerGroup: 'retail_homeowner' }
})
// Returns products in ACO response format
```

**Benefits**:
- When real ACO is connected, we swap mock for real API calls
- Data structures remain the same
- Frontend code doesn't change
- Testing validates expected API behavior

### Mock Data Sources

- `data/mock-products.json` - Generated from buildright-aco
- `scripts/aco-service.js` - Mock API implementation
- `scripts/persona-config.js` - User/customer group mappings

---

## Testing Strategy

Each phase has specific testing requirements defined in its plan document.

### Phase-Level Testing

✅ **Phase 0**: Architecture decision documents reviewed and approved  
✅ **Phase 1**: Data validation scripts pass  
✅ **Phase 2**: Visual QA for all icons  
✅ **Phase 3**: Unit tests for persona config and mock ACO  
✅ **Phase 4**: Component isolation testing  
✅ **Phase 5**: Page-level regression testing  
✅ **Phase 6A-6E**: Persona flow end-to-end testing  
✅ **Phase 7**: Cross-persona integration testing

### Integration Testing (Phase 7)

- All 5 personas work end-to-end
- No cross-persona state contamination
- Mock ACO responds correctly for all scenarios
- Customer group pricing displays correctly
- Triggered policies filter as expected

---

## Success Criteria (Overall)

### Technical

✅ All files use generic, persona-agnostic names  
✅ Mock ACO service mirrors expected production API  
✅ 5 distinct persona login flows  
✅ 6 customer groups with differentiated pricing  
✅ CCDM demonstrated with visual loading states  
✅ Professional custom icons throughout (no emojis)  
✅ EDS blocks follow best practices  
✅ Commerce Dropins integrated (or mocked with plan for integration)  
✅ Mobile-responsive layouts  
✅ No console errors or warnings

### User Experience

✅ Visual, immersive experiences with imagery  
✅ Educational content in guided flows  
✅ Professional UX appropriate for each audience  
✅ Clear CCDM catalog filtering demonstration  
✅ Seamless persona switching for demos

### Documentation

✅ All phase plans completed  
✅ Architecture decisions documented  
✅ Component library documented  
✅ Demo walkthrough guide created  
✅ Testing results documented

---

## Risk Management

### High-Risk Areas

1. **Dropin Integration**: Adobe Commerce Dropins may have learning curve
   - **Mitigation**: Phase 0 research, start with documentation

2. **Mock ACO Accuracy**: Mock may not match real ACO behavior
   - **Mitigation**: Review ACO API docs, validate with Adobe team

3. **Cross-Persona State**: Personas may contaminate each other's state
   - **Mitigation**: Strict isolation testing in Phase 7

4. **Scope Creep**: Each persona could expand beyond plan
   - **Mitigation**: Stick to defined success criteria per phase

### Medium-Risk Areas

1. **Image Asset Sourcing**: May be difficult to find appropriate images
   - **Mitigation**: Start image search early, have placeholder strategy

2. **Performance**: Multiple dynamic blocks may impact performance
   - **Mitigation**: Performance testing in Phase 7, lazy loading strategy

---

## Progress Tracking

| Phase | Status | Start Date | End Date | Notes |
|-------|--------|------------|----------|-------|
| Phase 0 | Not Started | - | - | Research & decisions |
| Phase 1 | Not Started | - | - | ACO data foundation |
| Phase 2 | Not Started | - | - | Design system & icons |
| Phase 3 | Not Started | - | - | Core architecture |
| Phase 4 | Not Started | - | - | Shared components |
| Phase 5 | Not Started | - | - | Page refactor |
| Phase 6A | Not Started | - | - | Sarah persona |
| Phase 6B | Not Started | - | - | Marcus persona |
| Phase 6C | Not Started | - | - | Lisa persona |
| Phase 6D | Not Started | - | - | David persona |
| Phase 6E | Not Started | - | - | Kevin persona |
| Phase 7 | Not Started | - | - | Integration & polish |

---

## Communication Plan

### Phase Kickoff
- Review phase plan document
- Confirm dependencies satisfied
- Identify resources needed

### Phase Completion
- Review success criteria
- Demo deliverables
- Document any deviations
- Update progress tracking

### Phase Handoff
- Document integration points for next phase
- Share learnings and gotchas
- Update architecture decisions if needed

---

## Related Documents

- `PERSONA-IMPLEMENTATION-PLAN.md` - Original comprehensive plan
- `BUILDRIGHT-PERSONAS-AND-FLOWS.md` - Persona definitions and user flows
- `CSS-ARCHITECTURE.md` - Design system documentation
- `EDS-MIGRATION-GUIDE.md` - EDS patterns and best practices

---

**Document Version**: 1.0  
**Created**: November 15, 2024  
**Last Updated**: November 15, 2024

