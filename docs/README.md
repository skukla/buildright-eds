# BuildRight Documentation

**Last Updated:** 2026-01-02

---

## Quick Navigation

| Need | Go Here |
|------|---------|
| **Master plan** | [planning/master-implementation-plan.md](./planning/master-implementation-plan.md) |
| **Dropin patterns** | [reference/dropin-architecture.md](./reference/dropin-architecture.md) |
| **Backend services** | [reference/backend-service-reference.md](./reference/backend-service-reference.md) |
| **Architecture decisions** | [adr/](./adr/) (11 ADRs) |
| **Persona profiles** | [explanations/personas/](./explanations/personas/) |
| **Quick start guides** | [planning/quick-start/](./planning/quick-start/) |

---

## Documentation Structure (ADR-011)

```
docs/
├── README.md                    # This file
├── index.md                     # Quick navigation
│
├── planning/              # AI/Dev implementation guides
│   ├── master-implementation-plan.md
│   ├── phase-tracker.md
│   ├── features/          # Consolidated feature plans
│   ├── quick-start/       # Fast 1-page guides (was planning/quick-start/)
│   ├── testing/           # QA strategies (was testing/)
│   ├── component-extraction/  # EDS blocks analysis (was planning/component-extraction/)
│   └── personas/          # Persona rollout planning
│
├── adr/                   # Architecture Decision Records (11)
│
├── explanations/          # Non-technical visual docs
│   └── personas/          # Persona visual overviews
│
├── reference/             # Technical specifications
│   ├── dropin-architecture.md
│   ├── backend-service-reference.md
│   ├── standards/         # CSS, coding standards (was standards/)
│   ├── backend/           # ACO, Mesh, Product flows
│   ├── authoring/         # Content authoring guides
│   ├── deployment/        # Deployment guides
│   └── decisions/         # Research-backed decisions
│
├── implementation/        # Detailed implementation specs
│   ├── sarah-martinez/    # Sarah persona implementation
│   ├── kevin-rodriguez/   # Kevin persona implementation
│   └── other-personas/    # Future persona planning
│
└── archive/               # Historical reference
```

---

## Current Status

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 5.5 | In Progress | Commerce Dropins (Auth, Cart, Checkout) |
| Phase 6A | In Progress | Sarah Martinez persona |
| Phase 7 | Planned | Custom SDK Dropins for ACO |

---

## Key Concepts

**Hybrid Dropin Architecture** (see [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md)):
- Commerce Dropins (Auth, Cart, Checkout) → Adobe Commerce
- Custom Dropins (Product List, Pricing) → ACO via Mesh

**Mesh Adapter Pattern** (see [ADR-009](./adr/ADR-009-mesh-adapter-resolver-pattern.md)):
- Resolvers intercept dropin queries for extensibility
- Headers control persona pricing (`AC-View-Id`, `AC-Price-Book-Id`)

---

## Category Purpose (ADR-011)

| Category | Audience | Purpose |
|----------|----------|---------|
| `planning/` | AI/Dev | Actionable guides, checklists, task tracking |
| `adr/` | Dev/Architect | Architectural decisions, rationale |
| `explanations/` | Non-technical | Visual diagrams, system overviews |
| `reference/` | Dev/Technical | Technical specs, API docs, standards |

---

**For AI context:** See parent [CLAUDE.md](../CLAUDE.md)
