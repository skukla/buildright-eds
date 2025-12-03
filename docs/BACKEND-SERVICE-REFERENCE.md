# BuildRight Backend Service Reference

**Location:** `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-service`

## Overview

The **buildright-service** repository contains the **serverless backend** for the BuildRight commerce system, built on Adobe I/O App Builder.

This document serves as a reference from the **buildright-eds** (frontend) repository to the backend service.

---

## Purpose

The buildright-service provides:

1. **BOM Generation** - Server-side Bill of Materials calculation
2. **Product Lookup** - Dynamic product search from ACO catalog
3. **Persona Detection** - Customer group to persona mapping
4. **API Mesh** - Unified GraphQL endpoint (future)

**Why separate repository?**
- Different deployment pipeline (Adobe I/O Runtime vs. Adobe Edge Delivery)
- Serverless architecture requires App Builder structure
- Reusable across multiple frontends (web, mobile, etc.)

---

## Migration Status

### ✅ Successfully Migrated to buildright-service

| Component | Original Location | New Location |
|-----------|------------------|--------------|
| BOM Calculator | `buildright-eds/scripts/bom-calculator.js` | `buildright-service/lib/bom-calculator.js` |
| Product Lookup | `buildright-eds/scripts/product-lookup.js` | `buildright-service/lib/product-lookup.js` |
| ACO Client | Scattered in multiple scripts | `buildright-service/actions/utils/aco-client.js` |
| Persona Mappings | `buildright-eds/scripts/persona-config.js` | `buildright-service/actions/utils/persona-mappings.js` |

### 🔄 To Be Migrated (Future Phases)

| Component | Location | Target Phase |
|-----------|----------|--------------|
| Company Config | `buildright-eds/scripts/company-config.js` | Phase 3 |
| Dashboard Logic | `buildright-eds/scripts/dashboards/*.js` | Phase 4 |
| Project Recommendations | `buildright-eds/data/project-recommendations.json` | Phase 2 |

### ✅ Staying in buildright-eds (Frontend-Specific)

- Block definitions (`blocks/`)
- Page layouts (`pages/`)
- Fragments (`fragments/`)
- Styles (`styles/`)
- Client-side UI logic
- Adobe Edge Delivery Services configuration

---

## Integration Points

### Current (Client-Side)

**buildright-eds** currently handles all logic client-side:

```javascript
// buildright-eds/scripts/bom-calculator.js
const bom = await calculateBOM(template, package);
```

### Future (Server-Side via Runtime Actions)

**buildright-eds** will call backend actions:

```javascript
// buildright-eds/scripts/aco-service.js
async function generateBOM(templateId, packageId, template, packageData) {
  const response = await fetch(
    'https://<namespace>.adobeioruntime.net/api/v1/web/<package>/bom',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adobeToken}`
      },
      body: JSON.stringify({
        templateId,
        packageId,
        template: JSON.stringify(template),
        package: JSON.stringify(packageData)
      })
    }
  );
  
  const result = await response.json();
  return result.body.data.bom;
}
```

---

## Available Actions

### 1. Persona Detection
**Endpoint:** `POST /persona`

**Input:**
```json
{
  "customerGroupId": "1"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "production-builder",
    "name": "Sarah Martinez - Production Builder",
    "tier": 2,
    "priceBookId": "Commercial-Tier-2",
    "features": ["bom_generation", "template_configurator", "phase_ordering"]
  }
}
```

**Use in buildright-eds:**
- Dashboard personalization (`buildright-eds/scripts/personalize-page.js`)
- Feature access control
- Price book selection

---

### 2. BOM Generator
**Endpoint:** `POST /bom`

**Input:**
```json
{
  "templateId": "ranch-1800",
  "packageId": "structural",
  "template": "{...}",
  "package": "{...}",
  "variant": "{...}"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "bom": {
      "id": "bom-ranch-1800-structural",
      "templateId": "ranch-1800",
      "packageId": "structural",
      "items": [...],
      "totals": {...},
      "generated": "2024-11-28T..."
    }
  }
}
```

**Use in buildright-eds:**
- Project builder wizard (`buildright-eds/scripts/project-builder-wizard.js`)
- Dashboard BOM display (`buildright-eds/blocks/project-bundle/`)
- Cart integration

---

### 3. Product Lookup
**Endpoint:** `POST /product-lookup`

**Input:**
```json
{
  "lookupType": "name",
  "name": "2x4x8 SPF Stud",
  "tier": 2
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "sku": "STUD-2X4X8-SPF-STD",
    "name": "2x4x8 SPF Stud - Standard Grade",
    "price": 3.49,
    "category": "Dimensional Lumber"
  }
}
```

**Use in buildright-eds:**
- Product search (`buildright-eds/blocks/product-grid/`)
- BOM product resolution
- Catalog browsing

---

## Development Workflow

### Working on Frontend (buildright-eds)

```bash
cd buildright-eds
npm start  # or use Adobe EDS local server
```

**No changes needed to backend.**

### Working on Backend (buildright-service)

```bash
cd buildright-service

# Make changes to actions or lib/

# Run tests
npm test

# Deploy to Adobe I/O Runtime
npm run deploy:actions
```

**Frontend will automatically use new backend version.**

---

## Testing Strategy

### Phase 0.5 (Completed)
- ✅ Generated 18 reference BOMs client-side
- ✅ Validated BOM calculator logic
- ✅ Cleaned ACO catalog (265 products)

### Phase 1 (Completed)
- ✅ Migrated BOM calculator to buildright-service
- ✅ Created action wrappers
- ✅ Validated against reference BOMs
- ✅ Test scripts for all actions

### Phase 2 (Next)
- 🔜 Update buildright-eds to call backend actions
- 🔜 Compare client-side vs. server-side BOM results
- 🔜 Integration testing

---

## Documentation

### buildright-service Documentation
- [Phase 1 Complete](../../../buildright-service/docs/PHASE-1-COMPLETE.md)
- [Setup Plan](../../../buildright-service/docs/SETUP-PLAN.md)
- [Best Practices](../../../buildright-service/docs/BEST-PRACTICES.md)
- [Deployment Guide](../../../buildright-service/DEPLOYMENT-GUIDE.md)

### buildright-eds Documentation
- [Phase 6A Plan](./PHASE-6A-PERSONA-SARAH.md)
- [Dashboard Redesign](./PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)
- [Project Status](./phase-6/0-foundation/PROJECT-STATUS-OVERVIEW.md)

---

## Deployment Considerations

### buildright-eds (Frontend)
- **Platform:** Adobe Edge Delivery Services
- **Deployment:** `aem.live` (auto-deploy from GitHub)
- **Updates:** Instant on content changes, build for code changes

### buildright-service (Backend)
- **Platform:** Adobe I/O Runtime (serverless)
- **Deployment:** `aio app deploy`
- **Updates:** Independent of frontend, versioned actions

**Key Point:** Frontend and backend can be deployed independently.

---

## Future Integration Plan

### Phase 2: Initial Integration (Sarah's Persona)
1. Update `buildright-eds/scripts/aco-service.js` with action endpoints
2. Replace client-side BOM calculation with action calls
3. Add authentication (Adobe I/O Runtime tokens)
4. Test end-to-end flow

### Phase 3: Multi-Persona Support
1. Add persona detection on page load
2. Personalize dashboard based on persona
3. Filter products by tier and policies
4. Customize UI based on persona features

### Phase 5: Full API Mesh Integration
1. Replace individual action calls with single GraphQL endpoint
2. Client-side GraphQL queries
3. Mesh handles routing to actions and ACO
4. Single authentication flow

---

## Environment Configuration

### buildright-eds (Frontend)

**Current:** Uses `buildright-eds/scripts/base-url.js` to detect environment

```javascript
const isLocal = window.location.hostname === 'localhost';
const isProd = window.location.hostname.includes('aem.live');
```

**Future:** Will need to configure backend action URLs per environment

```javascript
const BACKEND_URLS = {
  development: 'https://dev-namespace.adobeioruntime.net/...',
  staging: 'https://stage-namespace.adobeioruntime.net/...',
  production: 'https://prod-namespace.adobeioruntime.net/...'
};
```

### buildright-service (Backend)

**Configuration:** `buildright-service/config/`
- `defaults.js` - Base configuration
- `staging.js` - Staging overrides
- `production.js` - Production overrides

**Environment Detection:** `NODE_ENV` environment variable

---

## Security & Authentication

### Current (Client-Side)
- No authentication required for ACO queries
- Public access to product catalog
- Client-side pricing calculations

### Future (Server-Side)
- **Adobe I/O Runtime Authentication** - All actions require Adobe auth token
- **Persona-Based Authorization** - Feature access based on customer group
- **Policy Enforcement** - Products filtered by persona policies
- **Price Book Control** - Tier-based pricing from ACO

**Authentication Flow:**
1. User logs into buildright-eds
2. Frontend gets Adobe I/O Runtime token
3. Frontend includes token in action requests
4. Backend validates token and enforces permissions

---

## Performance Considerations

### Current (Client-Side)
- **Pros:** Instant BOM calculation, no network latency
- **Cons:** Large product catalog downloaded to browser, limited caching

### Future (Server-Side)
- **Pros:** 
  - Server-side caching (5 min for products)
  - Reduced browser memory usage
  - Centralized business logic
  - Easier to update calculations
- **Cons:**
  - Network latency for action calls
  - Additional HTTP requests

**Mitigation:**
- Cache action responses in buildright-eds
- Batch multiple requests where possible
- Use API Mesh to combine queries

---

## Monitoring & Debugging

### buildright-eds (Frontend)
- Browser DevTools
- Console logs
- Network inspector

### buildright-service (Backend)
- Adobe I/O Runtime activation logs: `aio runtime activation poll`
- Execution time tracking (in response headers)
- Error tracking in Adobe I/O Console

**Cross-Repository Debugging:**
1. Check frontend request in Network tab
2. Note activation ID from response headers
3. Check backend logs: `aio runtime activation get <activation-id>`

---

## Contact & Support

**Repository Owners:**
- Frontend (buildright-eds): [Your Name]
- Backend (buildright-service): [Your Name]

**Slack Channels:**
- `#buildright-dev` - General development
- `#buildright-frontend` - EDS-specific
- `#buildright-backend` - Runtime actions

**Documentation:**
- Adobe Edge Delivery: https://www.aem.live/docs/
- Adobe I/O Runtime: https://developer.adobe.com/runtime/docs/
- App Builder: https://developer.adobe.com/app-builder/docs/

---

**Last Updated:** November 28, 2024  
**Status:** Phase 1 Complete - Backend Infrastructure Ready  
**Next Step:** Phase 2 - Integrate backend actions into frontend

