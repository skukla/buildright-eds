# BuildRight Documentation

**Quick navigation to all documentation categories**

---

## Structure (ADR-011)

```
docs/
├── planning/              # AI/Dev implementation guides
│   ├── index.md           # Feature plans, phase tracker
│   ├── features/          # Consolidated feature docs
│   ├── quick-start/       # Fast 1-page guides
│   ├── testing/           # QA strategies
│   ├── component-extraction/  # EDS blocks analysis
│   └── personas/          # Persona rollout planning
├── explanations/          # Non-technical visual docs
│   ├── index.md           # System diagrams, flows
│   └── personas/          # Persona visual overviews
├── adr/                   # Architecture Decision Records
│   └── README.md          # 11 decisions documented
├── reference/             # Technical specifications
│   ├── standards/         # CSS, coding standards
│   ├── backend/           # ACO, Mesh, Product flows
│   ├── authoring/         # Content authoring guides
│   └── deployment/        # Deployment guides
├── implementation/        # Detailed specs (reference)
│   ├── sarah-end-to-end/
│   ├── kevin-rodriguez/
│   └── other-personas/
└── archive/               # Historical reference
```

---

## Categories

| Category | Audience | Purpose | Entry Point |
|----------|----------|---------|-------------|
| **Planning** | AI/Dev | Implementation guides, tasks | [planning/index.md](./planning/index.md) |
| **Explanations** | Non-technical | Visual diagrams, system flows | [explanations/index.md](./explanations/index.md) |
| **ADRs** | Dev/Architect | Architectural decisions | [adr/README.md](./adr/README.md) |
| **Reference** | Dev/Technical | Technical specs, standards | [reference/](./reference/) |
| **Implementation** | Dev | Detailed specifications | [implementation/](./implementation/) |
| **Archive** | Reference | Historical context | [archive/](./archive/) |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [planning/master-implementation-plan.md](./planning/master-implementation-plan.md) | Authoritative project plan |
| [reference/dropin-architecture.md](./reference/dropin-architecture.md) | Canonical dropin reference |
| [planning/phase-tracker.md](./planning/phase-tracker.md) | Current phase status |

---

## By Topic

| Topic | Planning | Explanation | ADR |
|-------|----------|-------------|-----|
| Dropins | [commerce-dropins.md](./planning/features/commerce-dropins.md) | [dropin-pattern.md](./explanations/dropin-pattern.md) | [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md) |
| Catalog | [catalog-aco.md](./planning/features/catalog-aco.md) | [catalog-flow.md](./explanations/catalog-flow.md) | [ADR-007](./adr/ADR-007-custom-sdk-dropins-for-aco.md) |
| API Mesh | - | [mesh-adapter.md](./explanations/mesh-adapter.md) | [ADR-009](./adr/ADR-009-mesh-adapter-resolver-pattern.md) |
| Personas | [personas/](./planning/personas/) | [personas/](./explanations/personas/) | [ADR-004](./adr/ADR-004-custom-attributes-for-personas.md) |
| Architecture | - | [architecture-overview.md](./explanations/architecture-overview.md) | - |
| Standards | - | - | [reference/standards/](./reference/standards/) |

---

**Last Updated:** 2026-01-02
