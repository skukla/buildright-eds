# Phases 6B-7: Remaining Personas & Integration

**Status**: Planned (After Phase 6A Complete)
**Timeline**: 2-3 weeks total
**Depends On**: Phase 6A (Sarah)

---

## Architecture Note

The original planning referenced a frontend `ProjectManager` service that was **never implemented**. The actual architecture uses `buildright-service` backend resolvers.

For business requirements (terminology, multi-phase ordering, etc.), see:
**[docs/explanations/BUILDRIGHT-REQUIREMENTS.md](../../explanations/BUILDRIGHT-REQUIREMENTS.md)**

---

## Implementation Order

| Phase | Persona | Focus | Timeline |
|-------|---------|-------|----------|
| 6B | Marcus Johnson | Multi-phase project ordering | 1 week |
| 6C | Lisa Chen | Quote generation & sharing | 1 week |
| 6D | David Thompson | Deck builder save/resume | 1 week |
| 6E | Kevin Rodriguez | Smart restock (NO projects) | 3-4 days |
| 7 | Integration | Testing, performance, polish | 1 week |

---

## Key Reference Documents

### Business Requirements
- [BUILDRIGHT-REQUIREMENTS.md](../../explanations/BUILDRIGHT-REQUIREMENTS.md) - Scope, terminology, personas

### Backend Services (Shared by All Personas)
- [BACKEND-SERVICES.md](../../explanations/BACKEND-SERVICES.md) - Architecture overview
- [MESH-ADAPTER.md](../../explanations/MESH-ADAPTER.md) - Per-resolver documentation

### Persona Details
- [PERSONA-SYSTEM.md](../../explanations/PERSONA-SYSTEM.md) - 5 personas, pricing tiers

---

## Detailed Plans

See [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md) for:
- Phase 6B (Marcus): Multi-phase project wizard
- Phase 6C (Lisa): Package configurator, quote sharing
- Phase 6D (David): Deck builder wizard
- Phase 6E (Kevin): Smart restock (does NOT use projects)
- Phase 7: Integration testing, performance

---

## FAQ

**Q: Does Kevin use the Project entity?**
**A**: NO. Kevin's restock workflow is fundamentally different - it's inventory replenishment, not project-based ordering.

**Q: What terminology does each persona see?**
**A**: Sarah sees "Build", Marcus/Lisa see "Job", David sees "Project". Code always uses "Project".

---

**Last Updated**: 2026-01-01
