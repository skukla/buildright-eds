# Multi-Location Store Manager - Implementation Guide

This document defines the multi-location architecture for Kevin Rodriguez (Store Manager persona).

**Decision**: Kevin manages 3 store locations (Austin, San Antonio, Houston) for Precision Lumber & Supply, with a header location selector to switch between stores.

---

## Complete User Flow

```
1. LOGIN
   ├─ Kevin logs in with credentials
   ├─ Auth service identifies persona: 'kevin'
   └─ Sets initial customer context:
      { company: 'precision_lumber', location_id: 'austin', tier: 'Wholesale-Reseller' }

2. LOCATION SELECTION
   ├─ Header shows location dropdown (visible only to kevin persona)
   ├─ Current: "Precision Lumber & Supply - Austin, TX"
   ├─ Kevin clicks dropdown
   ├─ Sees 3 locations: Austin (current), San Antonio, Houston
   ├─ Selects "San Antonio"
   └─ Updates customer context:
      { company: 'precision_lumber', location_id: 'san_antonio', region: 'central' }

3. RESTOCK DASHBOARD (Phase 6E)
   ├─ Dashboard loads inventory data for selected location
   ├─ Data source: API call with location_id parameter
   ├─ Shows:
   │  ├─ Low stock items for San Antonio store
   │  ├─ Velocity metrics for San Antonio
   │  ├─ Recommended restock quantities
   │  └─ Priority indicators
   └─ Quick-add products to cart

4. CATALOG SHOPPING
   ├─ Kevin browses catalog or uses quick-add
   ├─ Sees Wholesale-Reseller pricing (customer group)
   ├─ May see San Antonio-specific assortment (future enhancement)
   └─ Adds products to cart

5. CHECKOUT
   ├─ Shipping address: Precision Lumber & Supply - San Antonio, TX
   ├─ Order placed to Adobe Commerce
   └─ Order includes: location_id: 'san_antonio'

6. FULFILLMENT (MSI Backend)
   ├─ Adobe Commerce MSI evaluates order
   ├─ Destination: San Antonio, TX
   ├─ Checks inventory across sources:
   │  ├─ warehouse_phoenix (Phoenix, AZ) - 850 miles
   │  ├─ warehouse_denver (Denver, CO) - 900 miles
   │  └─ warehouse_atlanta (Atlanta, GA) - 925 miles
   ├─ Selects optimal source (likely Phoenix)
   ├─ Allocates inventory
   └─ Creates shipment

7. DELIVERY
   └─ BuildRight ships from warehouse → Kevin's San Antonio store
```

---

## Data Structures

### Customer Context (localStorage: `buildright_customer_context`)

**Before** (Single Location):
```json
{
  "tier": "Wholesale-Reseller",
  "isLoggedIn": true
}
```

**After** (Multi-Location):
```json
{
  "company": "precision_lumber",
  "location_id": "austin",
  "region": "central",
  "tier": "Wholesale-Reseller",
  "isLoggedIn": true
}
```

### Store Inventory Data Structure

**File**: `data/store-inventory.json`

```json
{
  "company": "precision_lumber",
  "stores": [
    {
      "location_id": "austin",
      "storeNumber": "001",
      "city": "Austin",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": true,
      "inventory": [
        {
          "sku": "FAST-001",
          "name": "2\" Deck Screws (1lb box)",
          "category": "Fasteners",
          "currentStock": 8,
          "recommendedStock": 25,
          "daysSupply": 3,
          "velocityCategory": "high",
          "avgDailySales": 2.5,
          "restockPriority": "high",
          "recommendedOrder": 20,
          "unitCost": 8.99,
          "lastRestocked": "2025-11-20"
        }
      ]
    },
    {
      "location_id": "san_antonio",
      "storeNumber": "002",
      "city": "San Antonio",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": false,
      "inventory": [...]
    },
    {
      "location_id": "houston",
      "storeNumber": "003",
      "city": "Houston",
      "state": "TX",
      "region": "central",
      "manager": "Kevin Rodriguez",
      "isPrimary": false,
      "inventory": [...]
    }
  ]
}
```

### Kevin's Retail Store Locations

```javascript
{
  id: 'precision_lumber',
  name: 'Precision Lumber & Supply',
  type: 'retail_store',
  locations: [
    {
      id: 'austin',
      city: 'Austin',
      state: 'TX',
      isPrimary: true,
      region: 'central',
      storeNumber: '001'
    },
    {
      id: 'san_antonio',
      city: 'San Antonio',
      state: 'TX',
      isPrimary: false,
      region: 'central',
      storeNumber: '002'
    },
    {
      id: 'houston',
      city: 'Houston',
      state: 'TX',
      isPrimary: false,
      region: 'central',
      storeNumber: '003'
    }
  ]
}
```

---

## Implementation Files

### Existing (Phase 1-5)

**Company Configuration**:
- `scripts/company-config.js` - Company and location definitions
  - `COMPANIES.PRECISION_LUMBER` object
  - `getCompany(companyId)` function
  - `getCompanyForPersona(persona)` function
  - `getDefaultLocation(companyId)` function

**Persona Configuration**:
- `scripts/persona-config.js` - Kevin persona definition
  - Company: "Precision Lumber & Supply"
  - Customer Group: WHOLESALE_RESELLER
  - Features: `restockDashboard: true`, `velocityAnalysis: true`

**Authentication**:
- `scripts/auth.js` - Auth service with customer context
  - `loginWithPersona()` sets customer context with company + location
  - Uses `getCompanyForPersona()` to determine company
  - Uses `getDefaultLocation()` for initial location

**Header**:
- `blocks/header/header.html` - Location selector HTML
- `blocks/header/header.css` - Location dropdown styling
- `blocks/header/header.js` - Location dropdown logic
  - `initializeLocationDisplay()` - Shows current location
  - `populateLocationDropdown()` - Populates dropdown from company config
  - `updateAuthenticatedElements()` - Shows/hides based on persona
  - Event listener for location selection

### To Be Created (Phase 6E)

**Dashboard**:
- `scripts/dashboards/restock-dashboard.js` - Multi-location restock dashboard
  - Load inventory data for current location
  - Listen for location changes
  - Update display when location changes

**Data**:
- `data/store-inventory.json` - Multi-location inventory data structure

**Styles**:
- `styles/dashboards/restock-dashboard.css` - Dashboard styling

---

## Data Source Architecture

### Demo Mode (Current)

| Data Type | Source | Notes |
|-----------|--------|-------|
| Product Catalog | `data/mock-products.json` | Static file |
| Pricing | `scripts/data-mock.js` | Mock pricing logic |
| Inventory | `data/store-inventory.json` | Static multi-location file |
| Customer Context | `localStorage` | Frontend-only |
| Company/Locations | `scripts/company-config.js` | Static configuration |

**When to Use**: Stakeholder demos, trade shows, offline presentations, development without backend access.

### Production Mode (Future)

| Data Type | API Source | Endpoint |
|-----------|------------|----------|
| Products | Adobe Commerce REST | `/rest/V1/products` |
| Pricing | ACO GraphQL | ACO Catalog Service |
| Inventory (MSI) | Adobe Commerce MSI | `/rest/V1/inventory/source-items` |
| Velocity Metrics | Custom/Analytics | TBD |
| Customer Context | Adobe Commerce REST | `/rest/V1/customers/me` |
| Company/Locations | Adobe Commerce B2B | `/rest/V1/company/:id/team` |

### Hybrid Data Flow (Production)

```
┌─────────────────────────────────────────────────────────────┐
│  KEVIN'S RESTOCK DASHBOARD                                  │
│  (scripts/dashboards/restock-dashboard.js)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ↓                              ↓
┌────────────────────┐      ┌────────────────────┐
│  ADOBE COMMERCE    │      │  ACO               │
│  PaaS              │      │  (Enhancement)     │
├────────────────────┤      ├────────────────────┤
│ • Products         │      │ • Price Books      │
│ • Inventory (MSI)  │      │ • Policies         │
│ • Categories       │      │ • Catalog Views    │
│ • Customer/Company │      │ • Volume Tiers     │
│ • B2B Teams        │      │                    │
└────────────────────┘      └────────────────────┘
```

---

## Demo Script

**Duration**: 4-5 minutes

1. **Login as Kevin** (30 sec)
   - Show "Store Manager" role
   - Header displays: "Precision Lumber & Supply - Austin, TX"

2. **Location Selection** (30 sec)
   - Click location dropdown
   - Show 3 Texas locations
   - Select "San Antonio"
   - Dashboard updates to San Antonio inventory

3. **View Restock Dashboard** (1.5 min)
   - Show inventory health for San Antonio store
   - Velocity-based suggestions
   - Priority indicators (high/medium/low)
   - Low stock alerts

4. **Quick Restock Action** (1.5 min)
   - Select high-priority items
   - Add to cart (bulk action)
   - Show Wholesale-Reseller pricing
   - Proceed to checkout

5. **Checkout** (30 sec)
   - Shipping address: San Antonio store
   - Order summary
   - Place order

6. **Highlight MSI** (30 sec)
   - Explain: "This order will be fulfilled from BuildRight's Phoenix warehouse"
   - Show: Geographic optimization
   - Emphasize: Multi-location support

**Key Demo Points**:
- Multi-location management (unique to Kevin)
- Velocity-based restock (inventory intelligence)
- Wholesale pricing tier
- MSI fulfillment optimization
- B2B retail use case

---

## Adobe Commerce B2B Configuration

**Company Structure**:
- **Company Name**: Precision Lumber & Supply
- **Shared Catalog**: Wholesale-Reseller
- **Teams/Locations**:
  - Team 1: Austin Store
  - Team 2: San Antonio Store
  - Team 3: Houston Store
- **Users**:
  - Kevin Rodriguez (Company Admin) - assigned to Austin team

**MSI Configuration**:
- **Stock**: Default Stock (or "BuildRight Stock")
- **Sources**: All 6 BuildRight warehouses
- **Source Selection Algorithm**: Distance Priority or Custom

**For Texas Store Orders**:
- Expected Source: `warehouse_phoenix` (Phoenix, AZ) - closest major RDC
- Fallback: `warehouse_denver` or `warehouse_west`

---

## Persona Differentiation

| Persona | Location Model | Purpose |
|---------|---------------|---------|
| Sarah | Single location (production builder) | Template-based ordering |
| Marcus | Project-based (no fixed location) | Custom project BOM generation |
| Lisa | Single location (remodeling) | Package-based ordering |
| David | Consumer (home address) | DIY deck building |
| **Kevin** | **Multi-location (3 stores)** | **Inventory restock management** |

Kevin is the **only persona with multi-location management**, showcasing BuildRight's support for retail chain customers.

---

**Last Updated**: January 2026
