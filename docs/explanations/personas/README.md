# Persona System

**What it does**: Shows different products and prices to different customer types
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The 30-Second Summary

BuildRight serves different B2B customers - from professional builders to DIY homeowners. The persona system ensures each customer type sees appropriate products and pricing.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOW PERSONAS WORK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Customer Login                                                 │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────┐     Sets special headers                  │
│   │ Identify Persona │────────────────────────────┐              │
│   └─────────────────┘                             │              │
│                                                   ▼              │
│                                            AC-View-Id            │
│                                            AC-Price-Book-Id      │
│                                                   │              │
│                                                   ▼              │
│                                        ┌───────────────────┐    │
│                                        │   ACO Returns     │    │
│                                        │ - Right products  │    │
│                                        │ - Right prices    │    │
│                                        └───────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Documents in This Section

| Document | What It Explains |
|----------|------------------|
| [Persona System](./persona-system.md) | The 5 personas and how pricing differs |
| [Personas Overview](./personas-overview.md) | Detailed profiles, goals, and pain points |
| [Personas UX Patterns](./personas-ux-patterns.md) | Visual journey maps and navigation |

---

## The 5 BuildRight Personas

| Persona | Customer Type | What They See |
|---------|---------------|---------------|
| **Sarah Martinez** | Production Builder | Bulk materials, wholesale pricing |
| **Marcus Johnson** | General Contractor | Multi-project ordering, volume discounts |
| **Lisa Chen** | Remodeling Contractor | Room packages, finishing materials |
| **David Thompson** | DIY Homeowner | Project kits, retail pricing |
| **Kevin Rodriguez** | Store Manager | Full catalog, admin features |

---

## For Demos

Use the persona switcher in the header to show "same store, different experience" - watch prices and products update in real-time.

---

**Related**: [Architecture](../architecture/README.md) | [Mesh Adapters](../mesh/README.md)
