# Phase 0: Research & Architecture Decisions

## Overview

**Duration**: 1-2 weeks  
**Dependencies**: None  
**Status**: Not Started

This phase focuses on research and architecture decisions that will inform all subsequent implementation. No code is written in this phase—only documentation and decision records.

---

## Setup: Create Branch

**Before starting research**, create a feature branch:

```bash
cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-eds
git checkout -b persona-implementation
```

All Phase 0 documentation will be committed to this branch.

---

## Objectives

1. Understand Adobe Commerce Storefront SDK (Dropins) architecture
2. Document EDS DOM manipulation best practices
3. Define when to use Dropins vs. EDS blocks
4. Create architecture decision records
5. Plan mock ACO service design

---

## What If Information Is Missing?

**Reality**: Some documentation may be incomplete or unavailable. This is normal.

### Simple Fallback Process

1. **Try Context7 first** (as requested in user preferences)
2. **If Context7 doesn't have it**: Check these sources (spend max 2 hours total)
   - Adobe Experience League: https://experienceleague.adobe.com
   - GitHub: https://github.com/adobe-commerce
   - Existing code in `docs/EDS-MIGRATION-GUIDE.md`
3. **If still not found**: Make an informed assumption
4. **Document it**: Create simple note in `docs/gaps/[topic].md`
5. **Keep going**: Don't let missing docs block progress

### Gap Document (Simple Template)

```markdown
# Gap: [Topic Name]

**What we need to know**: [Question]

**What we found**: [Partial info or "Nothing"]

**Our assumption**: [What we're assuming and why]

**Risk**: Low / Medium / High

**Plan**: [How we'll validate this later, if needed]
```

### When to Escalate

Only escalate if:
- The gap blocks critical architecture decisions
- Multiple unknowns compound into high risk
- You're stuck for more than 4 hours

Otherwise: document, assume, proceed.

---

## Research Areas

### 1. Adobe Commerce Storefront SDK (Dropins)

**Primary Documentation**:
- Storefront SDK Overview: https://experienceleague.adobe.com/developer/commerce/storefront/sdk/
- User Auth Dropin: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-auth/
- User Account Dropin: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-account/
- Cart Dropin: (search Adobe Experience League)
- Product Dropin: (search Adobe Experience League)

**Key Questions to Answer**:
- How do dropins integrate with EDS?
- What's the dropin lifecycle (initialization, state management, events)?
- How do dropins communicate with each other?
- How do dropins handle authentication and user context?
- What's the API for passing data to dropins?
- Can dropins be styled with custom CSS?
- How do dropins handle server-side vs. client-side rendering?

**Deliverables**:
- `docs/DROPIN-ARCHITECTURE.md` - Summary of dropin patterns
- `docs/DROPIN-INTEGRATION-GUIDE.md` - How to integrate dropins with our app
- `docs/gaps/` - Gap documents (if any unknowns found)

---

### 2. EDS DOM Manipulation Patterns

**Documentation Sources**:
- Existing `docs/EDS-MIGRATION-GUIDE.md`
- EDS official documentation
- Franklin/AEM Edge Delivery examples

**Key Questions to Answer**:
- Should HTML be in `.html` files or generated in `.js`?
- What's the pattern for dynamic content blocks?
- How does EDS handle conditional rendering?
- When should we manipulate DOM vs. regenerate blocks?
- What are the performance implications of different approaches?
- How do we handle block decoration timing?

**Patterns to Document**:
1. **Static HTML + JS Enhancement** - HTML file loaded, JS adds interactivity
2. **Dynamic HTML Generation** - JS generates all HTML
3. **Hybrid Approach** - HTML shell with JS-generated dynamic sections

**Deliverables**:
- `docs/EDS-DOM-PATTERNS.md` - Recommended patterns for different scenarios
- Examples of each pattern with use cases

---

### 3. Block vs. Dropin Decision Matrix

Create a decision tree for determining when to use EDS blocks vs. Commerce Dropins.

**Decision Factors**:
- Does component need Commerce backend data?
- Is component content-driven or data-driven?
- Does component exist as a pre-built dropin?
- Does component need to share state with other components?
- Is component persona-specific or universal?

**Components to Evaluate**:

| Component | Commerce Data? | Content/Data | Pre-built? | State Sharing | Recommendation |
|-----------|----------------|--------------|------------|---------------|----------------|
| User Authentication | Yes | Data | Yes | Yes | Dropin (or mock for demo) |
| User Account Dashboard | Yes | Data | Yes | Yes | Dropin (or mock) |
| Shopping Cart | Yes | Data | Yes | Yes | Dropin (or mock) |
| Product Detail | Yes | Data | Maybe | No | Research needed |
| Product Tiles (selection) | Yes | Data | No | No | EDS Block + Mock API |
| Wizard Progress | No | Content | No | No | EDS Block |
| Loading Overlay | No | Content | No | No | EDS Block |
| Template Cards | No | Data (mock) | No | No | EDS Block |
| Package Comparison | Yes | Data | No | No | EDS Block + Mock API |
| Deck Builder Wizard | Yes | Data | No | Yes | EDS Block + Mock API |

**Deliverables**:
- `docs/BLOCK-VS-DROPIN-MATRIX.md` - Decision matrix with rationale
- Component architecture diagram

---

### 4. Mock ACO Service Design

**Goal**: Design mock service that closely mirrors real ACO API behavior.

**Research Tasks**:
- Review ACO API documentation (if available)
- Understand ACO response formats
- Document ACO authentication patterns
- Map ACO concepts to our mock implementation

**Mock Service Requirements**:

1. **Product Catalog API** (Mock)
   ```javascript
   mockACO.getProducts({
     filters: { construction_phase: 'foundation_framing' },
     userContext: { customerGroup: 'residential_builder' },
     policy: 'project_new_construction'
   })
   // Returns: { products: [...], totalCount: 234, facets: {...} }
   ```

2. **Pricing API** (Mock)
   ```javascript
   mockACO.getPricing({
     productIds: ['PROD123', 'PROD456'],
     customerGroup: 'commercial_tier2',
     quantity: 100
   })
   // Returns: { prices: { PROD123: { unit: 32.76, total: 3276 }, ... } }
   ```

3. **Triggered Policies (CCDM)** (Mock)
   ```javascript
   mockACO.applyPolicy({
     policyType: 'deck_shape',
     value: 'rectangular',
     currentCatalog: [...],
     userContext: {...}
   })
   // Returns: { filteredProducts: [...], appliedRules: [...] }
   ```

4. **User/Customer API** (Mock)
   ```javascript
   mockACO.getUserContext(userId)
   // Returns: { customerGroup: '...', pricing: '...', policies: [...] }
   ```

**Design Principles**:
- API signatures match expected ACO format
- Response structures mirror ACO
- Simulate network latency (for loading states)
- Support error scenarios
- Log all requests for debugging

**Deliverables**:
- `docs/MOCK-ACO-API-SPEC.md` - Complete API specification
- `docs/MOCK-ACO-DATA-FORMAT.md` - Data structure documentation

---

### 5. Authentication Strategy

**Research Questions**:
- How does Auth Dropin work with demo persona system?
- How do we switch between personas in demo mode?
- What's the migration path from demo to production auth?
- How do we store user context (localStorage vs. session vs. dropin state)?

**Demo Mode Requirements**:
- 5 persona cards on login page
- One-click persona selection (no password)
- Persona context persists across pages
- Easy reset to select different persona

**Production Mode (Future)**:
- Real authentication via Auth Dropin
- Customer group assigned by Commerce backend
- User context from Commerce API

**Deliverables**:
- `docs/AUTH-STRATEGY.md` - Demo and production authentication flows
- Sequence diagrams for both modes

---

## Architecture Decision Records

Create ADRs for key decisions made during research.

**Format** (per ADR):
```markdown
# ADR-001: [Decision Title]

## Status
Accepted

## Context
[Why we need to make this decision]

## Decision
[What we decided]

## Consequences
[Positive and negative outcomes]

## Alternatives Considered
[What else we looked at]
```

**Expected ADRs**:
1. **ADR-001**: Use EDS Blocks for Content-Driven Components
2. **ADR-002**: Mock ACO Service Implementation Strategy
3. **ADR-003**: Authentication Approach for Demo vs. Production
4. **ADR-004**: Data Structure for Mock Products (ACO Format)
5. **ADR-005**: HTML Generation Strategy (File vs. JS)

**Deliverables**:
- `docs/adr/ADR-001-xxxxxx.md` through `ADR-005-xxxxxx.md`

---

## Deliverables Checklist

### Documentation

- [ ] `docs/DROPIN-ARCHITECTURE.md`
- [ ] `docs/DROPIN-INTEGRATION-GUIDE.md`
- [ ] `docs/EDS-DOM-PATTERNS.md`
- [ ] `docs/BLOCK-VS-DROPIN-MATRIX.md`
- [ ] `docs/MOCK-ACO-API-SPEC.md`
- [ ] `docs/MOCK-ACO-DATA-FORMAT.md`
- [ ] `docs/AUTH-STRATEGY.md`
- [ ] `docs/adr/ADR-001-*.md` through `ADR-005-*.md`
- [ ] `docs/gaps/` - Any gap documents (if needed)

### Diagrams

- [ ] Dropin integration architecture diagram
- [ ] Component architecture diagram (blocks + dropins)
- [ ] Mock ACO service architecture diagram
- [ ] Authentication flow diagram (demo mode)
- [ ] Authentication flow diagram (production mode)

---

## Success Criteria

✅ All research questions answered OR documented as gaps with assumptions  
✅ Clear decision matrix for Block vs. Dropin  
✅ Mock ACO API fully specified  
✅ Authentication strategy defined for both demo and production  
✅ All ADRs written and reviewed  
✅ Architecture diagrams created  
✅ No code written (documentation only)  
✅ No critical unknowns blocking Phase 3 implementation

---

## Testing/Validation

Since this is a research phase, "testing" means:

1. **Peer Review**: Have another developer review all documentation
2. **Feasibility Check**: Ensure all decisions are implementable
3. **Completeness Check**: All questions answered, no TBDs remaining
4. **Alignment Check**: Decisions align with overall project goals

**Review Checklist**:
- [ ] All documentation is clear and unambiguous
- [ ] Decisions are justified with reasoning
- [ ] No conflicts between different documents
- [ ] Implementation path is clear from documentation
- [ ] Mock ACO API covers all required use cases
- [ ] Gaps documented with assumptions and risk levels
- [ ] No critical unknowns remain unaddressed

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Context7 lacks needed docs | High | Medium | Use Adobe Experience League, GitHub repos, make informed assumptions |
| Dropin documentation insufficient | High | Medium | Analyze examples, reverse-engineer patterns, design flexible interfaces |
| Mock ACO doesn't match real ACO | High | Medium | Design with adapter pattern, plan for refactoring, review with Adobe if possible |
| Architecture decisions prove wrong | Medium | Low | ADRs allow revisiting, abstractions enable refactoring |
| Research takes too long | Medium | Medium | Timebox to 2 hours per topic, document gaps, make informed decisions |
| Critical information unavailable | High | Low | Escalate to Adobe team, proceed with flexible design |

---

## Next Steps

Upon completion of Phase 0:
1. Review all documentation with team
2. Get stakeholder approval on architecture decisions
3. Begin Phase 1 (ACO Data Foundation) and Phase 2 (Icons) in parallel
4. Reference this phase's documentation throughout implementation

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall implementation plan
- `PERSONA-IMPLEMENTATION-PLAN.md` - Original comprehensive plan
- `CSS-ARCHITECTURE.md` - Existing design system
- `EDS-MIGRATION-GUIDE.md` - Existing EDS patterns

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

