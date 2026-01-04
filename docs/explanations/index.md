# Explanations

**Audience**: Technical consultants, solution architects, pre-sales engineers
**Purpose**: Visual "how it works" documentation for client explanations and presentations

---

## How to Use This Section

These documents explain BuildRight's architecture using:
- ASCII diagrams (easy to recreate in PowerPoint)
- Plain language (no code examples)
- Clear tables for comparisons
- Practical talking points for demos

---

## Section Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION SECTIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   architecture/     How components connect                       │
│       │             System overview, data ownership              │
│       │                                                          │
│   mesh/             The API layer                                │
│       │             Routes requests to ACO or Commerce           │
│       │                                                          │
│   dropins/          Pre-built UI components                      │
│       │             Adobe's commerce widgets we customize        │
│       │                                                          │
│   personas/         Customer personalization                     │
│       │             5 B2B customer types with different views    │
│       │                                                          │
│   design/           Visual consistency                           │
│                     Token cascade, 29 UI blocks                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sections

| Section | What It Covers | Start Here |
|---------|----------------|------------|
| [Architecture](./architecture/README.md) | System overview, data flow, service ownership | [Architecture Overview](./architecture/architecture-overview.md) |
| [Mesh](./mesh/README.md) | API routing, resolvers, request handling | [Unified Routing](./mesh/unified-routing.md) |
| [Dropins](./dropins/README.md) | Adobe's 5 commerce components | [Dropins Overview](./dropins/README.md) |
| [Personas](./personas/README.md) | 5 B2B customer types, pricing tiers | [Persona System](./personas/persona-system.md) |
| [Design](./design/README.md) | Token cascade, 29 UI blocks | [Design System](./design/design-system-architecture.md) |

---

## Quick Links by Topic

**"How does the catalog work?"**
→ [Catalog Flow](./architecture/catalog-flow.md) + [Product Query Flows](./mesh/product-query-flows.md)

**"How do we customize Adobe components?"**
→ [Dropin Pattern](./dropins/dropin-pattern.md) + [Dropins Overview](./dropins/README.md)

**"How do different customers see different prices?"**
→ [Persona System](./personas/persona-system.md)

**"What's the difference between ACO and Commerce?"**
→ [Data Ownership](./architecture/data-ownership.md)

**"How do dropins connect to backends?"**
→ [Unified Routing](./mesh/unified-routing.md)

**"Why do we intercept dropin requests?"**
→ [Adapter Pattern](./mesh/adapter-pattern.md)

**"How do the 3 mesh sources work together?"**
→ [Source Architecture](./mesh/source-architecture.md)

---

## Other Documents

| Document | Purpose |
|----------|---------|
| [BuildRight Requirements](./buildright-requirements.md) | Business scope, terminology, project overview |

---

**Navigation:**
- [← Back to Docs](../README.md)
- [ADRs](../adr/README.md) (Architecture Decision Records)
- [Reference](../reference/) (Technical specifications)
