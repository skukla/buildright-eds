# BuildRight Documentation

**Last Updated:** 2026-01-01

---

## Quick Navigation

| Need | Go Here |
|------|---------|
| **Master plan** | [MASTER-IMPLEMENTATION-PLAN.md](./MASTER-IMPLEMENTATION-PLAN.md) |
| **Dropin patterns** | [DROPIN-ARCHITECTURE.md](./DROPIN-ARCHITECTURE.md) |
| **Backend services** | [BACKEND-SERVICE-REFERENCE.md](./BACKEND-SERVICE-REFERENCE.md) |
| **Architecture decisions** | [adr/](./adr/) (13 ADRs) |
| **Persona profiles** | [personas/](./personas/) |

---

## Documentation Structure

```
docs/
├── README.md                    # This file
├── MASTER-IMPLEMENTATION-PLAN.md # Authoritative plan
├── DROPIN-ARCHITECTURE.md       # Canonical dropin reference
├── BACKEND-SERVICE-REFERENCE.md # Backend service docs
├── INDEX.md                     # Quick navigation
│
├── adr/                    # Architecture Decision Records (13)
├── explanations/           # Visual "how it works" docs (8)
├── planning/               # AI/Dev implementation guides (13)
├── implementation/         # Feature specs (43)
│   ├── sarah-end-to-end/  # Sarah persona implementation
│   ├── dropins/           # Dropin integration docs
│   └── other-personas/    # Future persona planning
├── reference/              # Technical reference (20)
│   ├── backend/           # ACO, Mesh, Product flows
│   ├── authoring/         # Content authoring guides
│   └── deployment/        # Deployment guides
├── personas/               # Persona definitions (5)
├── standards/              # Coding standards (10)
├── testing/                # Testing guides (3)
├── quick-reference/        # Quick lookup (7)
├── component-architecture/ # Component patterns (7)
└── archive/                # Historical docs (156)
```

---

## Current Status

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 5.5 | 🔄 In Progress | Commerce Dropins (Auth, Cart, Checkout) |
| Phase 6A | 🔄 In Progress | Sarah Martinez persona |
| Phase 7 | 🔲 Planned | Custom SDK Dropins for ACO |

---

## Key Concepts

**Hybrid Dropin Architecture** (see [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md)):
- Commerce Dropins (Auth, Cart, Checkout) → Adobe Commerce
- Custom Dropins (Product List, Pricing) → ACO via Mesh

**Mesh Adapter Pattern** (see [ADR-009](./adr/ADR-009-mesh-adapter-resolver-pattern.md)):
- Resolvers intercept dropin queries for extensibility
- Headers control persona pricing (`AC-View-Id`, `AC-Price-Book-Id`)

---

## File Counts

| Category | Files | Purpose |
|----------|-------|---------|
| Active docs | 134 | Current implementation |
| Archive | 156 | Historical reference |
| **Total** | **290** | |

---

**For AI context:** See parent [CLAUDE.md](../CLAUDE.md)
