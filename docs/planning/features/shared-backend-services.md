# Shared Backend Services (buildright-service)

**Status:** Production - Reusable across all personas

---

## What It Is

Backend GraphQL services in `buildright-service` that ALL personas consume:

```
buildright-service/mesh/resolvers-src/
├── dropin-search.js      # Product grid for dropins
├── dropin-pdp.js         # Product detail for dropins
├── persona.js            # Catalog view + price book
├── categories.js         # Category navigation
├── bom-from-template.js  # BOM generation
├── breadcrumbs.js        # Navigation breadcrumbs
└── dropin-metadata.js    # Sort options
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  buildright-service (BACKEND)                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  Mesh Resolvers - Called via GraphQL          │  │
│  │  • dropin-search.js   → Product queries       │  │
│  │  • persona.js         → Pricing headers       │  │
│  │  • bom-from-template  → BOM calculation       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ▲
                   GraphQL API
                         │
┌─────────────────────────────────────────────────────┐
│  buildright-eds (FRONTEND)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Sarah   │ │ Marcus  │ │ Lisa    │ │ David   │   │
│  │ UI      │ │ UI      │ │ UI      │ │ UI      │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Key Resolvers

| Resolver | Purpose | Personas |
|----------|---------|----------|
| `dropin-search.js` | Product grid queries for Adobe dropins | All |
| `dropin-pdp.js` | Product detail page queries | All |
| `persona.js` | Resolve catalog view ID + price book | All |
| `bom-from-template.js` | Generate BOM from template + options | Sarah, Marcus, Lisa |
| `categories.js` | Category tree for navigation | All |

---

## Frontend Integration

Frontend calls these services via `scripts/services/mesh-client.js`:

```javascript
// Product search (all personas)
const products = await meshQuery(productSearchQuery, {
  phrase: "",
  filter: { categoryPath: "Building Materials" }
});

// BOM generation (Sarah, Marcus, Lisa)
const bom = await meshQuery(bomFromTemplateQuery, {
  templateId: "sedona",
  package: "standard",
  phases: ["foundation", "framing"]
});
```

---

## Remaining Work

- [ ] Wire Sarah's UI pages to call bom-from-template resolver
- [ ] Add project persistence (currently localStorage, future: Commerce)
- [ ] Extend for Marcus/Lisa-specific BOM variants

---

## Reference

- `buildright-service/mesh/README.md` - Full mesh documentation
- `docs/explanations/MESH-ADAPTER.md` - Query flow diagram

---

**Supersedes:** Phase 6-Foundation planning docs (00-06 series) which described a frontend ProjectManager service that was never built. The backend resolver approach is cleaner.
