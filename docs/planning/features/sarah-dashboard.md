# Sarah Dashboard (Phase 6A)

**Status:** Partial - Frontend exists, needs backend integration

---

## What It Is

Sarah Martinez's personalized dashboard for:
- Template browsing and selection
- Build configuration (template + package + phases)
- BOM generation via buildright-service

---

## Current State

### ✅ Implemented
- **Template Dashboard** - `scripts/dashboards/template-dashboard.js` (182 lines)
- **Template Grid** - 3-column layout, card rendering
- **Build Configurator** - Navigation to configurator page
- **Local Storage** - Active builds tracking (temporary)

### 🔲 Remaining Work
- [ ] Connect to `bom-from-template` resolver in buildright-service
- [ ] Replace localStorage with Commerce persistence (or keep localStorage for demo)
- [ ] Add configuration sidebar for package/phase selection

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (buildright-eds)               │
│  scripts/dashboards/template-dashboard.js│
│  ├── loadTemplates() → /data/templates.json│
│  ├── startNewBuild() → configurator page │
│  └── activeBuilds → localStorage         │
└───────────────────┬─────────────────────┘
                    │ GraphQL (future)
                    ▼
┌─────────────────────────────────────────┐
│  Backend (buildright-service)            │
│  mesh/resolvers-src/                     │
│  ├── bom-from-template.js → BOM calc    │
│  └── persona.js → Pricing headers       │
└─────────────────────────────────────────┘
```

---

## Key Files

```
Existing:
- scripts/dashboards/template-dashboard.js  # Template grid UI
- styles/dashboards/template-dashboard.css  # Grid styles
- data/templates.json                       # Template data

Future Integration:
- buildright-service/mesh/resolvers-src/bom-from-template.js
```

---

## Integration Example

```javascript
// Future: Call buildright-service for BOM
import { meshQuery } from '../../scripts/services/mesh-client.js';

const bomQuery = `
  query GetBOM($templateId: ID!, $package: String!, $phases: [String!]!) {
    bomFromTemplate(
      templateId: $templateId
      package: $package
      phases: $phases
    ) {
      items { sku, name, quantity, price }
      totals { subtotal, tax, total }
    }
  }
`;

const bom = await meshQuery(bomQuery, {
  templateId: "sedona",
  package: "standard",
  phases: ["foundation", "framing"]
});
```

---

## Reference

- Backend services: [shared-backend-services.md](./shared-backend-services.md)
- Implementation specs: `docs/implementation/sarah-end-to-end/features/`

---

**Depends on:** Phase 5.5 (Commerce dropins for cart/checkout)
**Enables:** Other persona dashboards (6B-6E) reusing same backend services
