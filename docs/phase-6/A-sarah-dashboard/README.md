# Phase 6A: Sarah Martinez - Dashboard Redesign

**📊 Status**: 🚧 Planning Complete, Implementation Next  
**⏱️ Timeline**: 2-3 weeks  
**👥 Audience**: Developers implementing Sarah's persona  
**🔗 Depends On**: [Phase 6-0-Foundation](../0-foundation/)

---

## Overview

Phase 6A implements Sarah Martinez's (Production Builder) complete dashboard redesign and materials ordering workflow.

**Key Transformation**: Browsing-oriented template dashboard → Action-oriented materials ordering hub

---

## 📁 Documents in This Folder

### [PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](./PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)
**Reading Time**: 30-40 minutes  
**Purpose**: Complete implementation plan for Sarah's dashboard

**Key Content**:
- 7 sub-phases (Dashboard simplification → Integration)
- Architecture changes (ProjectManager integration)
- Component refactoring (template-dashboard.js)
- New pages (templates.html, build-configurator.html, bom-review.html)
- Success criteria & testing strategy

---

### [PHASE-6A-PERSONA-SARAH.md](./PHASE-6A-PERSONA-SARAH.md)
**Reading Time**: 10-15 minutes  
**Purpose**: Sarah's persona profile, goals, pain points

**Key Content**:
- Role: Production Builder (Sunset Valley Homes)
- Primary goals: Fast materials ordering, delivery tracking
- Pain points: Template browsing, no configuration reuse
- BuildRight features she uses
- Customer group: Commercial-Tier2

---

## 🔗 Foundation Reference

**Before starting Phase 6A, read these foundation docs**:

1. **[../0-foundation/03-SARAH-IMPLEMENTATION.md](../0-foundation/03-SARAH-IMPLEMENTATION.md)** ⭐ MUST READ
   - Complete UX flows (5 flows)
   - ProjectManager integration examples
   - Design system component mapping
   - Before/After user journey

2. **[../0-foundation/02-PROJECT-MANAGER-API.md](../0-foundation/02-PROJECT-MANAGER-API.md)**
   - Complete API reference
   - Sarah-specific usage examples
   - LocalStorage strategy

3. **[../0-foundation/01-PROJECT-ENTITY-SCHEMA.md](../0-foundation/01-PROJECT-ENTITY-SCHEMA.md)**
   - Project entity structure
   - Sarah's required fields
   - Selection packages definition

---

## 🚀 Quick Start

### Implementation Checklist

**Phase 6-0-Foundation (Prerequisite)**:
- [ ] ProjectManager service implemented
- [ ] LocalStorage adapter working
- [ ] Persona config updated with terminology
- [ ] Templates.json updated with packages
- [ ] Tested: Can create/read/update projects

**Phase 6A - Sub-Phase 1: Dashboard Simplification** (Day 1-2):
- [ ] Simplify template-dashboard.css (remove verbose styles)
- [ ] Simplify template-dashboard.js (remove browsing features)
- [ ] Focus on "Start New Build" action
- [ ] Test: Dashboard loads clean, templates show as cards

**Phase 6A - Sub-Phase 2: Template Selection Page** (Day 2-3):
- [ ] Create pages/templates.html
- [ ] Use .grid .grid-3 for layout
- [ ] Large images, clean spacing
- [ ] "Start New Build" buttons
- [ ] Test: Template selection works

**Phase 6A - Sub-Phase 3: Build Configurator** (Day 4-7):
- [ ] Create pages/build-configurator.html
- [ ] Create scripts/builders/project-configurator.js
- [ ] Implement sidebar layout (.catalog-layout)
- [ ] Variant selection (visual tiles)
- [ ] Package selection (card grid)
- [ ] Additional upgrades (checkboxes)
- [ ] ProjectManager integration (create, update config)
- [ ] Test: Full configuration flow

**Phase 6A - Sub-Phase 4: BOM Generation** (Day 8-9):
- [ ] Update scripts/builders/template-builder.js
- [ ] Accept Project entity as input
- [ ] Apply selection package SKU mappings
- [ ] Apply additional upgrades
- [ ] Filter by selected phases
- [ ] ProjectManager.saveBOM() integration
- [ ] Test: BOM generates correctly

**Phase 6A - Sub-Phase 5: My Builds Dashboard** (Day 10-12):
- [ ] Create dashboard view for "My Builds"
- [ ] Use .orders-table for builds list
- [ ] Show project info (name, template, orders)
- [ ] "Order Materials" button per build
- [ ] Phase selection modal
- [ ] ProjectManager.getProjectsByType('template')
- [ ] Test: Dashboard shows real builds

**Phase 6A - Sub-Phase 6: BOM Review Page** (Day 12-14):
- [ ] Create pages/bom-review.html
- [ ] Reuse .simple-list-* components
- [ ] Group by phase & category
- [ ] Edit quantities
- [ ] Add to cart flow
- [ ] ProjectManager.addOrder() after checkout
- [ ] Test: Complete order flow

**Phase 6A - Sub-Phase 7: Integration & Polish** (Day 14-15):
- [ ] Header navigation updates
- [ ] Breadcrumbs on all pages
- [ ] Success/error messages
- [ ] Loading states
- [ ] Mobile responsive testing
- [ ] Cross-browser testing
- [ ] Performance optimization

---

## 🎯 Key Features

### 1. Template Selection
- Clean 3-column grid
- Large images (4:3 aspect ratio)
- Key specs visible
- "Start New Build" CTA

### 2. Build Configurator
- **Sidebar**: Template info, nav, pricing summary
- **Main Content**: 3 panels
  - Panel 1: Variant selection (visual tiles)
  - Panel 2: Selection package (card grid)
  - Panel 3: Additional upgrades (checkboxes with recommendations)
- **Footer**: Cancel, Save Build buttons

### 3. Selection Packages ⭐
Pre-defined material combinations (industry standard):
- Builder's Choice (standard, $0)
- Desert Ridge Premium (subdivision-specific, +$18K)
- Sunset Valley Executive (subdivision-specific, +$35K)

Each package includes: Windows, Doors, Roofing, Siding, Interior finishes

### 4. Phase-Based Ordering
- Modal: Select which phases to order
- BOM Review: Filtered to selected phases
- Grouped by: Phase → Category → Products
- Track: What's ordered vs. what's remaining

### 5. Build Cloning
- Duplicate existing build configuration
- Update: Name, lot number, delivery address
- Order materials in minutes

---

## 🎨 Design System Compliance

**Zero New CSS Required!**

All components reuse existing patterns:

| Screen | Pattern | File Reference |
|--------|---------|----------------|
| Dashboard Landing | `.grid .grid-3` + `.card` | `pages/account.html` |
| Template Selection | `.grid .grid-3` + `.card` | Clean, simple cards |
| Build Configurator | `.catalog-layout` | `pages/catalog.html` |
| BOM Review | `.simple-list-*` | Existing components |
| Builds Table | `.orders-table` | `pages/order-history.html` |

---

## 📊 Success Criteria

### Technical
- [ ] All new pages render correctly
- [ ] ProjectManager integration works
- [ ] Projects persist across sessions
- [ ] BOM generation accurate
- [ ] Order flow complete
- [ ] No console errors
- [ ] No linter errors

### UX
- [ ] Dashboard is action-oriented (not browsing)
- [ ] Configuration is intuitive
- [ ] Build cloning works
- [ ] Phase ordering is clear
- [ ] Materials tracking visible
- [ ] Sales rep info accessible

### Performance
- [ ] Page load < 2s
- [ ] Interactions < 100ms
- [ ] No layout shift
- [ ] Mobile responsive

---

## 🧪 Testing Strategy

### Unit Tests
- ProjectManager CRUD operations
- BOM generation logic
- Package SKU mapping

### Integration Tests
- Complete configuration flow
- Order placement flow
- Build cloning flow

### E2E Tests
- Sarah logs in
- Selects template
- Configures build
- Saves build
- Orders materials
- Views dashboard

---

## 🔗 Related Documentation

**Foundation**:
- [../0-foundation/](../0-foundation/) - Project entity & API

**Personas**:
- [../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md) - Sarah's flow

**Design System**:
- [../../standards/CSS-ARCHITECTURE.md](../../standards/CSS-ARCHITECTURE.md)
- [../../standards/COMPONENT-DESIGN-LIBRARY.md](../../standards/COMPONENT-DESIGN-LIBRARY.md)

---

## ❓ FAQ

**Q: Do I need to read the foundation docs first?**  
**A**: YES! Especially [03-SARAH-IMPLEMENTATION.md](../0-foundation/03-SARAH-IMPLEMENTATION.md). It has all the UX flows and code examples.

**Q: Can I create new CSS classes?**  
**A**: No! Reuse existing design system components. Zero new CSS is the goal.

**Q: How do I test ProjectManager integration?**  
**A**: Use `projectDemo.createSampleProjects()` in browser console. See [0-foundation/05-IMPLEMENTATION-PLAN.md](../0-foundation/05-IMPLEMENTATION-PLAN.md).

**Q: What about the old template-dashboard?**  
**A**: Simplify it! Remove browsing features, make it action-oriented. See [PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](./PHASE-6A-DASHBOARD-REDESIGN-PLAN.md) Sub-Phase 1.

**Q: Where are the selection packages defined?**  
**A**: In `data/templates.json`. See [0-foundation/06-COLLABORATIVE-REVIEW.md](../0-foundation/06-COLLABORATIVE-REVIEW.md) Question 9.

---

**Last Updated**: 2024-11-25  
**Status**: Ready for Implementation  
**Next Step**: Start with Sub-Phase 1 (Dashboard Simplification)

