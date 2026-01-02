# BuildRight Documentation

**Quick navigation to all documentation categories**

---

## Structure

```
docs/
├── planning/          # AI/Dev implementation guides
│   ├── index.md       # Feature plans, phase tracker
│   └── features/      # Consolidated feature docs
├── explanations/      # Non-technical visual docs
│   ├── index.md       # System diagrams, flows
│   └── *.md           # ASCII-based explanations
├── adr/               # Architecture Decision Records
│   └── README.md      # 13 decisions documented
├── implementation/    # Detailed specs (reference)
│   ├── sarah-end-to-end/features/
│   └── dropins/
└── archive/           # Historical reference
```

---

## Categories

| Category | Audience | Purpose | Entry Point |
|----------|----------|---------|-------------|
| **Planning** | AI/Dev | Implementation guides, tasks | [planning/index.md](./planning/index.md) |
| **Explanations** | All | Visual diagrams, system flows | [explanations/index.md](./explanations/index.md) |
| **ADRs** | Dev/Architect | Architectural decisions | [adr/README.md](./adr/README.md) |
| **Implementation** | Dev | Detailed specifications | [implementation/](./implementation/) |
| **Archive** | Reference | Historical context | [archive/](./archive/) |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [master-implementation-plan.md](./master-implementation-plan.md) | Authoritative project plan |
| [dropin-architecture.md](./dropin-architecture.md) | Canonical dropin reference |
| [planning/phase-tracker.md](./planning/phase-tracker.md) | Current phase status |

---

## By Topic

| Topic | Planning | Explanation | ADR |
|-------|----------|-------------|-----|
| Dropins | [commerce-dropins.md](./planning/features/commerce-dropins.md) | [dropin-pattern.md](./explanations/dropin-pattern.md) | [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md) |
| Catalog | [catalog-aco.md](./planning/features/catalog-aco.md) | [catalog-flow.md](./explanations/catalog-flow.md) | [ADR-007](./adr/ADR-007-custom-sdk-dropins-for-aco.md) |
| API Mesh | - | [mesh-adapter.md](./explanations/mesh-adapter.md) | [ADR-009](./adr/ADR-009-mesh-adapter-resolver-pattern.md) |
| Personas | - | [persona-system.md](./explanations/persona-system.md) | [ADR-004](./adr/ADR-004-custom-attributes-for-personas.md) |
| Architecture | - | [architecture-overview.md](./explanations/architecture-overview.md) | - |

---

**Last Updated:** 2026-01-01
