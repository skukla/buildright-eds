# Phases 6B-7: Remaining Personas & Integration

**📊 Status**: ⏭️ Planned (After Phase 6A Complete)  
**⏱️ Timeline**: 2-3 weeks total  
**👥 Audience**: Developers implementing Marcus, Lisa, David, Kevin  
**🔗 Depends On**: [Phase 6A Sarah](../A-sarah-dashboard/)

---

## Overview

This consolidated document covers the implementation of the remaining four personas plus final integration and polish.

**Implementation Order** (MUST be sequential):
1. **Phase 6B**: Marcus Johnson (General Contractor)
2. **Phase 6C**: Lisa Chen (Remodeling Contractor)
3. **Phase 6D**: David Thompson (DIY Homeowner)
4. **Phase 6E**: Kevin Rodriguez (Store Manager)
5. **Phase 7**: Integration & Polish

---

## 📁 Document in This Folder

### [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)
**Reading Time**: 45-60 minutes  
**Purpose**: Complete implementation plan for all remaining phases

**Key Content**:
- **Phase 6B (Marcus)**: Multi-phase project wizard, save & resume, quality tier selection
- **Phase 6C (Lisa)**: Package configurator, quote generation, client sharing
- **Phase 6D (David)**: Deck builder wizard, save & resume, educational content
- **Phase 6E (Kevin)**: Smart restock workflow, velocity tracking (NO Projects)
- **Phase 7**: Integration testing, performance optimization, documentation

---

## 🔗 Foundation Reference

**Before starting any of these phases, read**:

1. **[../0-foundation/04-OTHER-PERSONAS.md](../0-foundation/04-OTHER-PERSONAS.md)** ⭐ MUST READ
   - Complete usage patterns for Marcus, Lisa, David
   - ProjectManager integration examples
   - Dashboard code samples

2. **[../0-foundation/02-PROJECT-MANAGER-API.md](../0-foundation/02-PROJECT-MANAGER-API.md)**
   - Complete API reference
   - Multi-phase ordering (Marcus)
   - Quote operations (Lisa)
   - Save & resume (David)

3. **[../0-foundation/01-PROJECT-ENTITY-SCHEMA.md](../0-foundation/01-PROJECT-ENTITY-SCHEMA.md)**
   - Cross-persona requirements
   - Data structures per persona
   - Kevin's exception (no Projects)

---

## Phase 6B: Marcus Johnson (General Contractor)

**Timeline**: 1 week  
**Status**: ⏭️ Planned

### Overview
Marcus needs a multi-phase ordering system for custom home construction projects.

### Key Features
- **Project Wizard**: Multi-step form (specs → phases → quality tier)
- **Save & Resume**: Return weeks later, continue from current phase
- **Phase Tracking**: Visual progress (Phase 2 of 3)
- **BOM per Phase**: Generate materials list for current phase only
- **Order History**: See which phases ordered, which remaining

### Implementation Highlights
```javascript
// Marcus's multi-phase flow
const project = await projectManager.createProject({
  name: 'Patterson Residence',
  type: 'semi-custom',
  source: { customSpecs: { sqft: 2400, stories: 2 } },
  configuration: {
    qualityTier: 'professional',
    selectedPhases: ['foundation_framing', 'envelope', 'interior_finish']
  }
});

// Order Phase 1
await projectManager.addOrder(project.id, {
  orderId: 'ORD-001',
  phase: 'foundation_framing',
  totalCost: 45000
});
// Now: project.currentPhase = 'envelope'

// THREE WEEKS LATER: Resume
const savedProject = await projectManager.getProject(project.id);
// Continue with Phase 2
```

### Files to Create
- `scripts/builders/project-wizard.js`
- `scripts/dashboards/marcus-dashboard.js`
- `styles/dashboards/marcus-dashboard.css`

### Success Criteria
- [ ] Multi-step wizard works
- [ ] Projects persist across sessions
- [ ] Phase progression automatic
- [ ] Dashboard shows phase status

---

## Phase 6C: Lisa Chen (Remodeling Contractor)

**Timeline**: 1 week  
**Status**: ⏭️ Planned

### Overview
Lisa needs to generate quotes for clients, customize packages, and share via email.

### Key Features
- **Package Selection**: Good/Better/Best tiers
- **Customization**: Swap specific items within tier
- **Quote Generation**: Professional PDF-style quote
- **Client Info**: Name, email, phone
- **Share Quote**: Email link to client
- **Convert to Order**: When client approves

### Implementation Highlights
```javascript
// Lisa's quote flow
const project = await projectManager.createProject({
  name: 'Wilson Bathroom Remodel',
  type: 'package',
  source: { packageId: 'bathroom-better' }
});

// Customize
await projectManager.updateConfiguration(project.id, {
  packageCustomizations: {
    vanity: { selectedSku: 'VAN-PR-002', addedCost: 425 }
  }
});

// Generate quote
await projectManager.generateQuote(project.id, {
  name: 'Wilson Family',
  email: 'wilson@email.com'
});

// Share with client
await projectManager.shareQuote(project.id, ['wilson@email.com']);
```

### Files to Create
- `scripts/builders/package-builder.js`
- `scripts/dashboards/lisa-dashboard.js`
- `styles/dashboards/lisa-dashboard.css`

### Success Criteria
- [ ] Package configurator works
- [ ] Quote generation accurate
- [ ] Client info captured
- [ ] Share functionality working
- [ ] Dashboard shows quote status

---

## Phase 6D: David Thompson (DIY Homeowner)

**Timeline**: 1 week  
**Status**: ⏭️ Planned

### Overview
David needs a guided wizard to build his deck, with ability to save and resume.

### Key Features
- **Wizard Flow**: 6 steps (shape → size → material → railing → accessories → review)
- **Save & Resume**: Come back days later
- **Visual Progress**: Step indicators
- **Educational Content**: Tips, how-tos per step
- **Cost Estimate**: Live pricing as he configures
- **Shopping List**: Downloadable materials list

### Implementation Highlights
```javascript
// David's save & resume flow
const project = await projectManager.createProject({
  name: 'My Backyard Deck',
  type: 'deck',
  source: { deckConfig: { shape: null } },
  configuration: { completedSteps: [], currentStep: 'shape' }
});

// Complete 3 steps, then stop
await projectManager.updateConfiguration(project.id, {
  completedSteps: ['shape', 'size', 'material'],
  currentStep: 'railing'
});

// TWO DAYS LATER: Resume
const savedProject = await projectManager.getProject(project.id);
// Continue from 'railing' step
```

### Files to Create
- `scripts/builders/deck-builder.js`
- `scripts/dashboards/david-dashboard.js`
- `styles/dashboards/david-dashboard.css`

### Success Criteria
- [ ] Wizard flow intuitive
- [ ] Save & resume works
- [ ] Progress indicators clear
- [ ] Educational content helpful
- [ ] Cost estimates accurate

---

## Phase 6E: Kevin Rodriguez (Store Manager)

**Timeline**: 3-4 days  
**Status**: ⏭️ Planned

### Overview
Kevin's restock workflow is fundamentally different - **does NOT use Projects**.

### Key Features
- **Smart Suggestions**: Based on velocity & stock levels
- **Multi-Location**: Separate inventory per store
- **Category Filtering**: Focus on specific departments
- **Velocity Indicators**: Fast/medium/slow movers
- **Quick Reorder**: Add to cart from suggestions

### Implementation Highlights
```javascript
// Kevin's workflow (NO ProjectManager)
const suggestions = await restockService.getSmartSuggestions({
  locationId: 'phoenix-central',
  categoryId: 'plumbing'
});

// Add to cart
suggestions.forEach(item => {
  await addToCart(item.sku, item.suggestedQuantity);
});

// Checkout (standard flow)
```

### Files to Create
- `scripts/dashboards/kevin-dashboard.js`
- `scripts/restock-service.js`
- `styles/dashboards/kevin-dashboard.css`

### Success Criteria
- [ ] Smart suggestions accurate
- [ ] Multi-location works
- [ ] Velocity indicators clear
- [ ] Quick reorder easy
- [ ] **Does NOT use Projects** ✅

---

## Phase 7: Integration & Polish

**Timeline**: 1 week  
**Status**: ⏭️ Planned

### Overview
Final integration, testing, performance optimization, and documentation.

### Key Tasks

**Integration Testing**:
- [ ] All personas work independently
- [ ] Switching personas works
- [ ] Shared components (header, cart) work
- [ ] Data isolation per user
- [ ] LocalStorage doesn't conflict

**Performance Optimization**:
- [ ] Page load times < 2s
- [ ] Interaction latency < 100ms
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching strategy

**Cross-Browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile (iOS & Android)

**Documentation**:
- [ ] Update all READMEs
- [ ] Code comments complete
- [ ] API documentation current
- [ ] Testing guide updated
- [ ] Deployment checklist

**Polish**:
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications
- [ ] Empty states
- [ ] 404 pages
- [ ] Accessibility (WCAG AA)

### Success Criteria
- [ ] All personas functional
- [ ] Performance benchmarks met
- [ ] No console errors
- [ ] No linter warnings
- [ ] Documentation complete
- [ ] Ready for Phase 8 (Backend)

---

## 🎯 Overall Success Criteria

### All Personas Working
- [ ] Sarah: Materials ordering for builds
- [ ] Marcus: Multi-phase project ordering
- [ ] Lisa: Quote generation & sharing
- [ ] David: Deck builder save/resume
- [ ] Kevin: Smart restock

### Data Persistence
- [ ] Projects persist across sessions
- [ ] No data loss
- [ ] User isolation working
- [ ] LocalStorage limits not exceeded

### UX Consistency
- [ ] Consistent navigation
- [ ] Consistent terminology per persona
- [ ] Consistent design patterns
- [ ] Consistent error handling

### Performance
- [ ] All pages < 2s load
- [ ] No layout shift
- [ ] Smooth animations
- [ ] Mobile responsive

---

## 🔗 Related Documentation

**Foundation**:
- [../0-foundation/](../0-foundation/) - Project entity & API
- [../0-foundation/04-OTHER-PERSONAS.md](../0-foundation/04-OTHER-PERSONAS.md) ⭐ Key reference

**Phase 6A**:
- [../A-sarah-dashboard/](../A-sarah-dashboard/) - Sarah's implementation (reference for patterns)

**Personas**:
- [../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)

**Design System**:
- [../../standards/](../../standards/) - CSS & component guidelines

---

## ❓ FAQ

**Q: Which persona should we implement first after Sarah?**  
**A**: Marcus (6B). He has the most complex multi-phase flow and will validate the foundation architecture.

**Q: Can we implement multiple personas in parallel?**  
**A**: Not recommended. Sequential implementation allows each persona to build on learnings from the previous one.

**Q: Does Kevin use the Project entity?**  
**A**: NO! Kevin's restock workflow is fundamentally different. See Phase 6E details.

**Q: How long will all of this take?**  
**A**: Approximately 2-3 weeks for 6B-7 combined (1 week each for B/C/D, 3-4 days for E, 1 week for 7).

**Q: Can we skip any of these personas?**  
**A**: No. All five personas are required for the complete demo experience.

---

**Last Updated**: 2024-11-25  
**Status**: Planned (Depends on 6A Completion)  
**Next Step**: Wait for Phase 6A completion, then start 6B

