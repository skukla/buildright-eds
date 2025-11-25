# Phase 6-Foundation: Project Entity & ProjectManager Service

**📊 Status**: ✅ Planning Complete, Ready for Implementation  
**⏱️ Implementation Time**: 5-7 hours  
**👥 Must Read**: All developers implementing Phases 6A-6E

---

## 📚 Documentation Structure

This planning document has been organized into **7 focused files** for easier navigation:

### 1. [00-OVERVIEW.md](./00-OVERVIEW.md) ← **START HERE**
**Reading Time**: 10-15 minutes  
**Purpose**: Why we need this, BuildRight's scope, industry research, final decisions summary

**Key Content**:
- Rationale for Project entity
- BuildRight's role as materials supplier
- Industry research on production builders
- Quick overview of all decisions

---

### 2. [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md)
**Reading Time**: 10-15 minutes  
**Purpose**: Complete data structure, terminology mapping, cross-persona requirements

**Key Content**:
- Terminology: "Project" (code) vs "Build/Job/Project" (UI)
- Complete schema (~80 fields)
- Requirements analysis per persona
- Schema design principles

---

### 3. [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)
**Reading Time**: 15-20 minutes  
**Purpose**: Complete API reference, method signatures, usage examples

**Key Content**:
- All CRUD operations
- BOM operations
- Order operations
- Quote operations (Lisa)
- Storage strategy (LocalStorage MVP)
- Usage examples per persona

---

### 4. [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)
**Reading Time**: 20-25 minutes  
**Purpose**: Sarah Martinez's complete UX flow, design system compliance

**Key Content**:
- Before/After user journey
- Complete user flows (5 flows)
- Dashboard design (clean, multi-screen)
- ProjectManager integration code
- Component mapping (zero new CSS!)

---

### 5. [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)
**Reading Time**: 15-20 minutes  
**Purpose**: Marcus, Lisa, David usage patterns and flows

**Key Content**:
- Marcus: Multi-phase ordering
- Lisa: Quote generation & sharing
- David: Save & resume configuration
- Dashboard integration per persona
- Common patterns

---

### 6. [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)
**Reading Time**: 10-15 minutes  
**Purpose**: Tasks, timeline, success criteria, file structure

**Key Content**:
- 7 implementation tasks (5-7 hours total)
- Complete code examples
- Success criteria checklists
- Future enhancements (NOT in Phase 6)
- File structure diagram

---

### 7. [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)
**Reading Time**: 5-10 minutes  
**Purpose**: All 12 decisions documented with rationale

**Key Content**:
- Complete decision log
- Question-by-question summary
- Key highlights (⭐)
- Implementation readiness checklist

---

## 🚀 Quick Start

### For First-Time Readers

**Recommended Reading Order**:
1. [00-OVERVIEW.md](./00-OVERVIEW.md) - Start here! (10-15 min)
2. [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md) - Understand the data (10-15 min)
3. [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md) - Learn the API (15-20 min)
4. Your persona's implementation:
   - **Sarah?** → [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md) (20-25 min)
   - **Others?** → [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md) (15-20 min)
5. [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md) - Tasks & timeline (10-15 min)
6. [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md) - Decision log (5-10 min)

**Total Reading Time**: ~60-90 minutes

---

### For Implementers

**Quick Reference**:

```javascript
// 1. Import ProjectManager
import projectManager from '../project-manager.js';

// 2. Create Project
const project = await projectManager.createProject({
  name: 'Project Name',
  type: 'your-type',
  source: { /* ... */ }
});

// 3. Update Configuration
await projectManager.updateConfiguration(project.id, { /* ... */ });

// 4. Save BOM
await projectManager.saveBOM(project.id, bomData);

// 5. Add Order
await projectManager.addOrder(project.id, { orderId, totalCost });

// 6. Load Projects (in dashboard)
const projects = await projectManager.getProjectsByType('your-type');
```

**Full API**: See [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)

---

## 🎯 Implementation Order

**Phase 6-Foundation** (5-7 hours):
1. Create `scripts/project-manager.js`
2. Create `scripts/storage-adapter.js`
3. Update `scripts/persona-config.js`
4. Update `data/templates.json`
5. Create demo interface
6. Test end-to-end

**Then**:
- **Phase 6A**: Sarah's dashboard redesign (uses ProjectManager)
- **Phase 6B**: Marcus's project wizard (uses ProjectManager)
- **Phase 6C**: Lisa's quote flow (uses ProjectManager)
- **Phase 6D**: David's deck builder (uses ProjectManager)
- **Phase 6E**: Kevin's restock (does NOT use ProjectManager)

---

## 📋 Key Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Terminology | Code: "Project", UI: persona-specific |
| 2 | Naming | Smart defaults (subdivision + lot) |
| 3 | Organization | Subdivision-first tracking |
| 4 | Storage | LocalStorage MVP |
| 5 | Template Selection | 3-col grid, clean spacing |
| 6 | Configuration | Sidebar layout, single page |
| 7 | Selection Packages | Pre-defined combinations ⭐ |
| 8 | Post-Config | Save → Dashboard |
| 9 | Phase Ordering | Modal → Filtered BOM |
| 10 | BOM Display | Existing components (zero new CSS) |
| 11 | Package Management | Hard-coded in templates.json |
| 12 | BOM Storage | Custom Entity (LocalStorage) ⭐ |

**Full details**: [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)

---

## 🔗 External References

- **Persona Flows**: [../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)
- **Phase 6A Plan**: [../A-sarah-dashboard/PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](../A-sarah-dashboard/PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)
- **Remaining Phases**: [../B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md](../B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md)

---

## ❓ FAQ

**Q: Do I need to implement ProjectManager in my persona phase?**  
**A**: No! ProjectManager is implemented in Phase 6-Foundation. You just USE it.

**Q: What if I need a field that's not in the Project schema?**  
**A**: Add it as an optional field. Use `?` notation and document which personas use it.

**Q: When do we switch from localStorage to Adobe Commerce API?**  
**A**: After Phase 7 complete. It's a production enhancement, not part of the demo.

---

## ✅ Status

**Planning**: ✅ Complete  
**Implementation**: ⏭️ Ready to start  
**Estimated Effort**: 5-7 hours

**Next Step**: [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Last Updated**: 2024-11-25  
**Status**: ✅ Ready for Implementation

