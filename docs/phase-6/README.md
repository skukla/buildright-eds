# Phase 6: Persona Implementations & Dashboard Redesign

**📊 Status**: In Progress (Foundation Complete)  
**⏱️ Total Timeline**: 4-6 weeks  
**👥 Audience**: All developers implementing persona-specific features

---

## Overview

Phase 6 implements persona-specific dashboards and workflows for all BuildRight users. This phase is broken into multiple sub-phases, each focused on a specific persona or foundation work.

**Key Innovation**: The Project entity unifies all persona workflows while allowing UI customization per persona.

---

## 📁 Phase 6 Structure

### [0-foundation/](./0-foundation/) - **Project Entity & ProjectManager Service** ✅ COMPLETE

**Status**: ✅ Planning Complete, Ready for Implementation  
**Time**: 5-7 hours  
**Must Complete First**: This is the foundation for all persona implementations

**What It Is**:
- Unified Project entity (~80 fields) that adapts to all personas
- ProjectManager service (CRUD operations, 20+ methods)
- LocalStorage MVP storage strategy
- Terminology mapping (Build/Job/Project)

**Key Documents**:
- [README.md](./0-foundation/README.md) - Start here!
- [00-OVERVIEW.md](./0-foundation/00-OVERVIEW.md) - Rationale & decisions
- [02-PROJECT-MANAGER-API.md](./0-foundation/02-PROJECT-MANAGER-API.md) - Complete API
- [05-IMPLEMENTATION-PLAN.md](./0-foundation/05-IMPLEMENTATION-PLAN.md) - Tasks & timeline

**Why First**: All other persona implementations depend on the Project entity and ProjectManager.

---

### [A-sarah-dashboard/](./A-sarah-dashboard/) - **Sarah Martinez (Production Builder)** 🚧 IN PROGRESS

**Status**: 🚧 Planning Complete, Implementation Next  
**Time**: 2-3 weeks  
**Depends On**: Phase 6-0-Foundation

**What It Is**:
- Dashboard redesign (browsing → action-oriented)
- Template configurator with selection packages
- BOM generation & phase-based ordering
- Materials tracking & delivery scheduling
- Build cloning & reuse

**Key Documents**:
- [README.md](./A-sarah-dashboard/README.md) - Navigation guide
- [DASHBOARD-REDESIGN-PLAN.md](./A-sarah-dashboard/PHASE-6A-DASHBOARD-REDESIGN-PLAN.md) - Complete plan
- [PERSONA-SARAH.md](./A-sarah-dashboard/PHASE-6A-PERSONA-SARAH.md) - Persona details

**Implementation Reference**: See [0-foundation/03-SARAH-IMPLEMENTATION.md](./0-foundation/03-SARAH-IMPLEMENTATION.md)

---

### [B-to-7-consolidated/](./B-to-7-consolidated/) - **Remaining Personas & Integration** ⏭️ PLANNED

**Status**: ⏭️ Planned (After 6A Complete)  
**Time**: 2-3 weeks  
**Depends On**: Phase 6A

**What It Is**:
- **Phase 6B**: Marcus Johnson (General Contractor) - Multi-phase ordering
- **Phase 6C**: Lisa Chen (Remodeling Contractor) - Quote generation & sharing
- **Phase 6D**: David Thompson (DIY Homeowner) - Deck builder with save/resume
- **Phase 6E**: Kevin Rodriguez (Store Manager) - Restock workflow (no Projects)
- **Phase 7**: Integration & polish across all personas

**Key Document**:
- [PHASES-6B-TO-7-CONSOLIDATED.md](./B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md) - Complete plan

**Implementation Reference**: See [0-foundation/04-OTHER-PERSONAS.md](./0-foundation/04-OTHER-PERSONAS.md)

---

## 🚀 Quick Start

### For New Developers

**Start Here**:
1. Read [0-foundation/README.md](./0-foundation/README.md) first (60-90 min)
2. Then read your assigned phase:
   - **Phase 6A?** → [A-sarah-dashboard/README.md](./A-sarah-dashboard/README.md)
   - **Phase 6B-7?** → [B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md](./B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md)

### For Implementers

**Implementation Order** (MUST follow this sequence):

```
1. Phase 6-0-Foundation (5-7 hours)
   └─ Implement ProjectManager service
   └─ Test with all persona types
   
2. Phase 6A: Sarah (2-3 weeks)
   └─ Dashboard redesign
   └─ Template configurator
   └─ BOM generation
   
3. Phase 6B: Marcus (1 week)
   └─ Multi-phase ordering
   
4. Phase 6C: Lisa (1 week)
   └─ Quote generation & sharing
   
5. Phase 6D: David (1 week)
   └─ Deck builder save/resume
   
6. Phase 6E: Kevin (3-4 days)
   └─ Restock workflow (separate from Projects)
   
7. Phase 7: Integration (1 week)
   └─ Cross-persona polish
   └─ Performance optimization
   └─ Testing
```

---

## 📋 Key Concepts

### Project Entity

**What**: Unified data structure representing a "work item" for each persona

**Terminology**:
- **In Code**: Always "Project" (`ProjectManager`, `project.id`)
- **In UI**: Persona-specific
  - Sarah: "Build" (e.g., "My Builds")
  - Marcus & Lisa: "Job" (e.g., "My Jobs")
  - David: "Project" (e.g., "My Projects")

**Why**: Single data model, multiple presentations. Consistent backend, personalized frontend.

### ProjectManager Service

**What**: Singleton service providing CRUD operations for all project types

**Key Methods**:
```javascript
// Create
await projectManager.createProject({ name, type, source })

// Read
await projectManager.getProject(id)
await projectManager.getProjectsByType('template')
await projectManager.getActiveProjects()

// Update
await projectManager.updateConfiguration(id, config)
await projectManager.saveBOM(id, bomData)
await projectManager.addOrder(id, orderData)

// Delete
await projectManager.deleteProject(id)
```

**Full API**: See [0-foundation/02-PROJECT-MANAGER-API.md](./0-foundation/02-PROJECT-MANAGER-API.md)

---

## 🎯 Success Criteria

### Phase 6-0-Foundation ✅
- [ ] ProjectManager implemented
- [ ] LocalStorage adapter working
- [ ] All persona types can create projects
- [ ] Data persists across sessions

### Phase 6A (Sarah) 🚧
- [ ] Dashboard simplified (action-oriented)
- [ ] Template configurator working
- [ ] Selection packages implemented
- [ ] BOM generation with phase filtering
- [ ] Order materials flow complete

### Phase 6B-E (Other Personas) ⏭️
- [ ] Marcus: Multi-phase ordering
- [ ] Lisa: Quote generation & sharing
- [ ] David: Save & resume deck builder
- [ ] Kevin: Restock workflow

### Phase 7 (Integration) ⏭️
- [ ] All personas working
- [ ] Cross-persona features tested
- [ ] Performance optimized
- [ ] Documentation complete

---

## 📖 Related Documentation

**Prerequisites**:
- [../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md) - All persona definitions
- [../personas/PERSONA-UX-MAP.md](../personas/PERSONA-UX-MAP.md) - UX patterns

**Architecture**:
- [../standards/CSS-ARCHITECTURE.md](../standards/CSS-ARCHITECTURE.md) - Design system
- [../standards/COMPONENT-DESIGN-LIBRARY.md](../standards/COMPONENT-DESIGN-LIBRARY.md) - Reusable components

**Testing**:
- [../testing/](../testing/) - Testing strategies

---

## 🔗 External References

- **Original Consolidated Plan**: Now split into 0-foundation, A-sarah, B-to-7
- **Phase 6A Original**: Now in [A-sarah-dashboard/](./A-sarah-dashboard/)
- **Phase 6B-7 Original**: Now in [B-to-7-consolidated/](./B-to-7-consolidated/)

---

## 📊 Progress Tracker

| Phase | Status | Progress | Est. Time | Actual Time |
|-------|--------|----------|-----------|-------------|
| 6-0-Foundation | ✅ Complete | 100% | 5-7h | - |
| 6A: Sarah | 🚧 In Progress | 0% | 2-3w | - |
| 6B: Marcus | ⏭️ Planned | 0% | 1w | - |
| 6C: Lisa | ⏭️ Planned | 0% | 1w | - |
| 6D: David | ⏭️ Planned | 0% | 1w | - |
| 6E: Kevin | ⏭️ Planned | 0% | 3-4d | - |
| 7: Integration | ⏭️ Planned | 0% | 1w | - |

---

## ❓ FAQ

**Q: Where do I start?**  
**A**: [0-foundation/README.md](./0-foundation/README.md) - This is mandatory reading for all Phase 6 work.

**Q: Can I skip the foundation and go straight to my persona?**  
**A**: No! Foundation must be implemented first. All personas depend on the Project entity.

**Q: Which persona should we implement first?**  
**A**: Sarah (Phase 6A). She has the most complex workflow and will validate the foundation architecture.

**Q: Do all personas use the same Project entity?**  
**A**: Yes! The schema is flexible - each persona uses only the fields they need. Kevin is the exception (no Projects).

**Q: Where are the wireframes/designs?**  
**A**: Embedded in each phase's documentation. See Sarah's implementation guide for complete UX flows.

---

**Last Updated**: 2024-11-25  
**Status**: Phase 6-0-Foundation Complete, 6A In Progress  
**Next Milestone**: Complete Phase 6A Sarah Dashboard Redesign

