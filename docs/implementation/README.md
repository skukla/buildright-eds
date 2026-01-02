# Implementation Documentation

**Purpose**: Detailed implementation specifications for BuildRight persona features.

---

## Persona-Directory Map

| Persona | Directory | Phase | Status |
|---------|-----------|-------|--------|
| **Sarah Martinez** | [sarah-end-to-end/](./sarah-end-to-end/) | 6A | In Progress |
| **Marcus Johnson** | [other-personas/](./other-personas/) | 6B | Planned |
| **Lisa Chen** | [other-personas/](./other-personas/) | 6C | Planned |
| **David Thompson** | [other-personas/](./other-personas/) | 6D | Planned |
| **Kevin Rodriguez** | [kevin-rodriguez/](./kevin-rodriguez/) | 6E | Planned |

---

## Directory Structure

```
implementation/
├── README.md                 # This file
├── sarah-end-to-end/         # Sarah Martinez (Production Builder)
│   ├── features/             # 33 feature documents
│   └── dropins/              # Commerce dropin integration
├── kevin-rodriguez/          # Kevin Rodriguez (Store Manager)
│   └── multi-location-architecture.md
├── other-personas/           # Marcus, Lisa, David (consolidated planning)
│   └── phases-6b-to-7-consolidated.md
└── [root files]              # Cross-cutting implementation docs
    ├── dropin-css-refactor-plan.md
    └── product-images-*.md
```

---

## Quick Links by Persona

### Sarah Martinez (Production Builder) - Phase 6A
- **Overview**: [sarah-end-to-end/features/README.md](./sarah-end-to-end/features/README.md)
- **Implementation Plan**: [sarah-implementation-plan.md](./sarah-end-to-end/features/sarah-implementation-plan.md)
- **Wireframes**: [sarah-wireframes.md](./sarah-end-to-end/features/sarah-wireframes.md)
- **BOM Service**: [bom-service-implementation.md](./sarah-end-to-end/features/bom-service-implementation.md)

### Kevin Rodriguez (Store Manager) - Phase 6E
- **Multi-Location Architecture**: [multi-location-architecture.md](./kevin-rodriguez/multi-location-architecture.md)
- **Phase 6E Plan**: [phases-6b-to-7-consolidated.md#phase-6e](./other-personas/phases-6b-to-7-consolidated.md)

### Marcus Johnson (General Contractor) - Phase 6B
- **Phase 6B Plan**: [phases-6b-to-7-consolidated.md#phase-6b](./other-personas/phases-6b-to-7-consolidated.md)

### Lisa Chen (Remodeling Contractor) - Phase 6C
- **Phase 6C Plan**: [phases-6b-to-7-consolidated.md#phase-6c](./other-personas/phases-6b-to-7-consolidated.md)

### David Thompson (Pro Homeowner) - Phase 6D
- **Phase 6D Plan**: [phases-6b-to-7-consolidated.md#phase-6d](./other-personas/phases-6b-to-7-consolidated.md)

---

## Cross-Cutting Documentation

| Document | Purpose |
|----------|---------|
| [dropin-css-refactor-plan.md](./dropin-css-refactor-plan.md) | CSS refactoring for Commerce dropins |
| [product-images-convention.md](./product-images-convention.md) | Product image naming conventions |
| [product-images-implementation-summary.md](./product-images-implementation-summary.md) | Image implementation summary |
| [product-images-standardized-flow.md](./product-images-standardized-flow.md) | Standardized image flow |

---

## Related Documentation

- **Persona Profiles**: [explanations/personas/](../explanations/personas/)
- **Quick Start**: [planning/quick-start/](../planning/quick-start/)
- **Master Plan**: [planning/master-implementation-plan.md](../planning/master-implementation-plan.md)
- **ADRs**: [adr/](../adr/)

---

**Last Updated**: 2026-01-02
