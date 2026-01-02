# Archived: Phase 6-Foundation Planning Docs

**Archived:** 2026-01-01
**Reason:** Implementation approach was superseded

---

## Why These Are Archived

These documents describe a **frontend ProjectManager service** that was never implemented. The planning was comprehensive but the actual implementation took a different approach:

**Planned (not built):**
- `scripts/project-manager.js` - Frontend project management service
- `scripts/storage-adapter.js` - LocalStorage abstraction
- Complex frontend project entity (~80 fields)

**Actually Built:**
- `buildright-service/mesh/resolvers-src/` - Backend GraphQL resolvers
- `scripts/dashboards/template-dashboard.js` - Simple frontend UI
- Backend-driven architecture for all personas

---

## Valuable Content Preserved

The **business requirements** from these documents were extracted and consolidated into:

**[docs/explanations/BUILDRIGHT-REQUIREMENTS.md](../../explanations/BUILDRIGHT-REQUIREMENTS.md)**

This includes:
- BuildRight scope definition (materials supplier, not PM tool)
- Persona terminology mapping (Build/Job/Project)
- Multi-phase ordering concept
- Selection packages pattern
- Product data requirements

---

## Files In This Archive

| File | Original Purpose |
|------|------------------|
| 00-OVERVIEW.md | Cross-cutting overview of ProjectManager |
| 01-PROJECT-ENTITY-SCHEMA.md | ~80 field project entity definition |
| 02-PROJECT-MANAGER-API.md | Frontend API specification |
| 03-SARAH-IMPLEMENTATION.md | Sarah's frontend flow |
| 04-OTHER-PERSONAS.md | Marcus, Lisa, David frontend flows |
| 05-IMPLEMENTATION-PLAN.md | Frontend implementation tasks |
| 06-COLLABORATIVE-REVIEW.md | Design decisions (valuable - preserved) |
| 07-PRODUCT-DATA-REQUIREMENTS.md | Product catalog requirements |

---

**See Also:**
- [Actual Backend Services](../../explanations/BACKEND-SERVICES.md)
- [Mesh Resolvers](../../explanations/MESH-ADAPTER.md)
- [Consolidated Requirements](../../explanations/BUILDRIGHT-REQUIREMENTS.md)
