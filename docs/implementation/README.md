# Implementation Documentation

**Purpose**: Detailed implementation specifications for BuildRight persona features.

---

## Persona-Directory Map

| Persona | Directory | Phase | Status |
|---------|-----------|-------|--------|
| **Sarah Martinez** | [sarah-martinez/](./sarah-martinez/) | 6A | In Progress |
| **Marcus Johnson** | [other-personas/](./other-personas/) | 6B | Planned |
| **Lisa Chen** | [other-personas/](./other-personas/) | 6C | Planned |
| **David Thompson** | [other-personas/](./other-personas/) | 6D | Planned |
| **Kevin Rodriguez** | [kevin-rodriguez/](./kevin-rodriguez/) | 6E | Planned |

---

## Directory Structure

```
implementation/
├── README.md                 # This file
├── sarah-martinez/           # Sarah Martinez (Production Builder)
│   ├── features/             # 30 feature documents (4 subdirs)
│   └── dropins/              # Commerce dropin integration
├── kevin-rodriguez/          # Kevin Rodriguez (Store Manager)
│   └── multi-location-architecture.md
└── other-personas/           # Marcus, Lisa, David (consolidated planning)
    └── phases-6b-to-7-consolidated.md
```

---

## Quick Links by Persona

### Sarah Martinez (Production Builder) - Phase 6A
- **Overview**: [sarah-martinez/features/README.md](./sarah-martinez/features/README.md)
- **Implementation Plan**: [sarah-implementation-plan.md](./sarah-martinez/features/plans/sarah-implementation-plan.md)
- **Wireframes**: [sarah-wireframes.md](./sarah-martinez/features/design/sarah-wireframes.md)
- **BOM Service**: [bom-service-implementation.md](./sarah-martinez/features/architecture/bom-service-implementation.md)

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

## Cross-Cutting Standards

These documents have been moved to appropriate locations:

| Document | New Location | Purpose |
|----------|--------------|---------|
| Product Image Convention | [reference/standards/](../reference/standards/product-images-convention.md) | Image naming conventions |
| Product Image Flow | [reference/standards/](../reference/standards/product-images-standardized-flow.md) | Standardized image flow |
| Dropin CSS Refactor | [archive/completed/](../archive/completed/dropin-css-refactor-plan.md) | Historical (see ADR-008) |

---

## Related Documentation

- **Persona Profiles**: [explanations/personas/](../explanations/personas/)
- **Quick Start**: [planning/quick-start/](../planning/quick-start/)
- **Master Plan**: [planning/master-implementation-plan.md](../planning/master-implementation-plan.md)
- **ADRs**: [adr/](../adr/)

---

**Last Updated**: 2026-01-02
