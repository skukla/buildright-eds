# BuildRight Documentation

**Quick navigation to all documentation categories**

---

## Structure

```
docs/
├── planning/          # AI/Dev implementation guides
│   ├── INDEX.md       # Feature plans, phase tracker
│   └── features/      # Consolidated feature docs
├── explanations/      # Non-technical visual docs
│   ├── INDEX.md       # System diagrams, flows
│   └── *.md           # ASCII-based explanations
├── adr/               # Architecture Decision Records
│   └── README.md      # 11 decisions documented
├── implementation/    # Detailed specs (reference)
│   ├── sarah-end-to-end/features/
│   └── completed/
└── archive/           # Historical reference
```

---

## Categories

| Category | Audience | Purpose | Entry Point |
|----------|----------|---------|-------------|
| **Planning** | AI/Dev | Implementation guides, tasks | [planning/INDEX.md](./planning/INDEX.md) |
| **Explanations** | All | Visual diagrams, system flows | [explanations/INDEX.md](./explanations/INDEX.md) |
| **ADRs** | Dev/Architect | Architectural decisions | [adr/README.md](./adr/README.md) |
| **Implementation** | Dev | Detailed specifications | [implementation/](./implementation/) |
| **Archive** | Reference | Historical context | [archive/](./archive/) |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md) | Authoritative project plan |
| [DROPIN-ARCHITECTURE.md](./DROPIN-ARCHITECTURE.md) | Canonical dropin reference |
| [planning/phase-tracker.md](./planning/phase-tracker.md) | Current phase status |

---

## By Topic

| Topic | Planning | Explanation | ADR |
|-------|----------|-------------|-----|
| Dropins | [commerce-dropins.md](./planning/features/commerce-dropins.md) | [DROPIN-PATTERN.md](./explanations/DROPIN-PATTERN.md) | [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md) |
| Catalog | [catalog-aco.md](./planning/features/catalog-aco.md) | [CATALOG-FLOW.md](./explanations/CATALOG-FLOW.md) | [ADR-007](./adr/ADR-007-custom-sdk-dropins-for-aco.md) |
| API Mesh | - | [MESH-ADAPTER.md](./explanations/MESH-ADAPTER.md) | [ADR-009](./adr/ADR-009-mesh-adapter-resolver-pattern.md) |
| Personas | - | [PERSONA-SYSTEM.md](./explanations/PERSONA-SYSTEM.md) | [ADR-004](./adr/ADR-004-custom-attributes-for-personas.md) |
| Architecture | - | [ARCHITECTURE-OVERVIEW.md](./explanations/ARCHITECTURE-OVERVIEW.md) | - |

---

**Last Updated:** 2026-01-01
