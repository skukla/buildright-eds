# Phase 8: Adobe Commerce Backend Setup

## Overview

**Duration**: 2-3 weeks  
**Dependencies**: Phase 1 (ACO data foundation), Access to Adobe Commerce/ACO instance  
**Status**: Not Started  
**Can Run in Parallel With**: Phase 3-6 (frontend development)

Set up real Adobe Commerce and ACO backend to support the persona-driven demo. This phase takes the data and scripts from Phase 1 (`buildright-aco` repo) and deploys them to a production Adobe Commerce/ACO instance.

**CRITICAL**: This phase can run **in parallel** with frontend development (Phase 3-7). The mock ACO service ensures frontend work isn't blocked.

---

## Objectives

1. Configure customer groups in Adobe Commerce
2. Register custom attributes in Adobe Commerce
3. Set up ACO price books and pricing
4. Configure ACO policies (28 triggered policies)
5. Create demo customer accounts
6. Validate end-to-end data flow

---

## Prerequisites

### Required Access
- [ ] Adobe Commerce Admin access
- [ ] ACO Admin UI access
- [ ] ACO API credentials (tenant, API key, admin token)
- [ ] Ability to create customer groups
- [ ] Ability to register custom attributes

### Environment Configuration
- [ ] Adobe Commerce instance URL
- [ ] ACO tenant ID
- [ ] ACO API endpoint
- [ ] Environment variables configured in `buildright-aco/.env`

**See**: `buildright-aco/docs/SETUP-GUIDE.md` for detailed environment setup

---

## Task 1: Customer Group Configuration

### 1.1 Create Customer Groups in Adobe Commerce Admin

**Location**: Adobe Commerce Admin → Customers → Customer Groups

**Groups to Create**:

| Group Name | Tax Class | Discount % | Persona(s) |
|------------|-----------|------------|------------|
| US-Retail | Retail Customer | 0% | David (base) |
| Retail-Registered | Retail Customer | 5% | David (registered) |
| Trade-Professional | Wholesale | 10% | Marcus, Lisa |
| Production-Builder | Wholesale | 15% | Sarah |
| Wholesale-Reseller | Wholesale | 25% | Kevin |

**Steps**:
1. Navigate to Customers → Customer Groups
2. Click "Add New Customer Group"
3. Enter group name
4. Select tax class
5. Save customer group
6. Repeat for all 5 groups

**Validation**:
```bash
# Query customer groups via API
curl -X GET "https://your-instance.adobe.io/rest/V1/customerGroups/search" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Deliverable**: 5 customer groups created in Adobe Commerce

---

### 1.2 Configure Group Pricing Rules

**Location**: Adobe Commerce Admin → Marketing → Catalog Price Rules

**Rules to Create**:

1. **Trade Professional Discount**
   - Customer Group: Trade-Professional
   - Discount: 10% off catalog price
   - Priority: 10

2. **Production Builder Discount**
   - Customer Group: Production-Builder
   - Discount: 15% off catalog price
   - Priority: 20

3. **Wholesale Reseller Discount**
   - Customer Group: Wholesale-Reseller
   - Discount: 25% off catalog price
   - Priority: 30

4. **Registered Customer Discount**
   - Customer Group: Retail-Registered
   - Discount: 5% off catalog price
   - Priority: 5

**Note**: These rules provide base discounts. ACO price books will provide more granular pricing.

**Deliverable**: 4 catalog price rules configured

---

## Task 2: Custom Attribute Registration

### 2.1 Register Customer Attributes

**Location**: Adobe Commerce Admin → Stores → Attributes → Customer

**Attributes to Register**:

| Attribute Code | Label | Type | Required | Visible | Use Case |
|----------------|-------|------|----------|---------|----------|
| `business_type` | Business Type | Select | No | Yes | Persona determination |
| `project_scale` | Project Scale | Select | No | Yes | Volume/scale filtering |
| `primary_service` | Primary Service | Select | No | Yes | Service type filtering |
| `customer_tier` | Customer Tier | Select | No | Yes | Tier-based features |
| `buying_behavior` | Buying Behavior | Select | No | Yes | Pattern analysis |

**business_type Options**:
- `production_builder` - Production Builder
- `general_contractor` - General Contractor
- `remodeling_contractor` - Remodeling Contractor
- `diy_homeowner` - DIY Homeowner
- `retail_store` - Retail Store

**project_scale Options**:
- `high_volume` - High Volume (50+ units/year)
- `medium_volume` - Medium Volume (10-50 units/year)
- `low_volume` - Low Volume (<10 units/year)
- `single_project` - Single Project

**primary_service Options**:
- `residential_construction` - Residential Construction
- `commercial_construction` - Commercial Construction
- `remodeling` - Remodeling
- `diy` - DIY
- `retail` - Retail

**customer_tier Options**:
- `Production-Builder` - Production Builder
- `Trade-Professional` - Trade Professional
- `Wholesale-Reseller` - Wholesale Reseller
- `Retail-Registered` - Registered Customer

**buying_behavior Options**:
- `repeat_orders` - Repeat Orders
- `project_based` - Project-Based
- `bulk_orders` - Bulk Orders
- `single_items` - Single Items

**Steps**:
1. Navigate to Stores → Attributes → Customer
2. Click "Add New Attribute"
3. Enter attribute code and label
4. Set input type (Dropdown for select)
5. Add options (as listed above)
6. Set "Required" to No
7. Set "Show on Storefront" to Yes
8. Save attribute
9. Repeat for all 5 attributes

**Validation**:
```bash
# Query custom attributes via API
curl -X GET "https://your-instance.adobe.io/rest/V1/customers/attributes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Deliverable**: 5 custom customer attributes registered

---

### 2.2 Register Product Attributes (If Not Already Present)

**Note**: Most product attributes should already exist in Adobe Commerce. Only register if missing.

**Key Attributes for CCDM**:
- `construction_phase` - Construction Phase (for Marcus)
- `quality_tier` - Quality Tier (for Marcus)
- `package_tier` - Package Tier (for Lisa)
- `room_category` - Room Category (for Lisa)
- `deck_compatible` - Deck Compatible (for David)
- `deck_shape` - Deck Shape (for David)
- `deck_material_type` - Deck Material Type (for David)
- `store_velocity_category` - Store Velocity (for Kevin)
- `restock_priority` - Restock Priority (for Kevin)

**See**: `buildright-aco/scripts/config/product-definitions.js` for complete attribute definitions

**Deliverable**: Product attributes verified/registered

---

## Task 3: ACO Price Book Setup

### 3.1 Ingest Price Books to ACO

**Location**: `buildright-aco` repository

**Data Source**: `buildright-aco/data/buildright/price-books.json`

**Command**:
```bash
cd buildright-aco
npm run ingest:price-books
```

**Expected Result**:
```
✓ Ingested 5 price books:
  - US-Retail (base)
  - Production-Builder (parent: US-Retail)
  - Trade-Professional (parent: US-Retail)
  - Wholesale-Reseller (parent: US-Retail)
  - Retail-Registered (parent: US-Retail)
```

**Validation**:
```bash
# Query price books via ACO API
node scripts/validate-ingestion.js --type=price-books
```

**Deliverable**: 5 price books in ACO with correct hierarchy

---

### 3.2 Ingest Pricing Data to ACO

**Data Source**: `buildright-aco/data/buildright/prices.json`

**Command**:
```bash
cd buildright-aco
npm run ingest:prices
```

**Expected Result**:
```
✓ Ingested 885 price entries
  - 177 products × 5 price books
  - Volume tier pricing included
```

**Validation**:
```bash
# Query prices for a sample product
node scripts/validate-ingestion.js --type=prices --sku=LBR-D0414F1E
```

**Deliverable**: 885 price entries in ACO

---

## Task 4: ACO Product Ingestion

### 4.1 Ingest Products to ACO

**Data Source**: `buildright-aco/data/buildright/products.json`

**Command**:
```bash
cd buildright-aco
npm run ingest:products
```

**Expected Result**:
```
✓ Ingested 70 products
  - Simple products: 60
  - Service products: 10
  - All persona attributes included
```

**Validation**:
```bash
# Query products with persona attributes
node scripts/validate-ingestion.js --type=products
```

**Deliverable**: 70 products in ACO with persona attributes

---

### 4.2 Ingest Variants to ACO

**Data Source**: `buildright-aco/data/buildright/variants.json`

**Command**:
```bash
cd buildright-aco
npm run ingest:variants
```

**Expected Result**:
```
✓ Ingested 92 variant products
  - Configurable products: 20
  - Variant products: 72
```

**Deliverable**: 92 variant products in ACO

---

### 4.3 Ingest Bundles to ACO

**Data Source**: `buildright-aco/data/buildright/bundles.json`

**Command**:
```bash
cd buildright-aco
npm run ingest:bundles
```

**Expected Result**:
```
✓ Ingested 15 bundle products
```

**Deliverable**: 15 bundle products in ACO

---

## Task 5: ACO Policy Configuration

### 5.1 Create Triggered Policies in ACO Admin UI

**Location**: ACO Admin UI → Policies

**Guide**: `buildright-aco/data/buildright/POLICY-SETUP-GUIDE.md`

**Policies to Create**: 28 total across 10 categories

**Policy Categories**:
1. Construction Phase (5 policies) - Marcus
2. Quality Tier (3 policies) - Marcus
3. Package Tier (3 policies) - Lisa
4. Room Category (4 policies) - Lisa
5. Deck Compatible (1 policy) - David
6. Deck Shape (3 policies) - David
7. Deck Material (3 policies) - David
8. Deck Railing (1 policy) - David
9. Store Velocity (3 policies) - Kevin
10. Restock Priority (2 policies) - Kevin

**Process for Each Policy**:
1. Open ACO Admin UI
2. Navigate to Policies
3. Click "Create Policy"
4. Select "Triggered Policy"
5. Enter policy name
6. Configure trigger header (e.g., `AC-Policy-Phase: foundation_framing`)
7. Set filter type (attribute match)
8. Configure filter rules
9. Test policy
10. Activate policy

**Example: Foundation & Framing Policy**
```
Name: Foundation & Framing Phase
Trigger: AC-Policy-Phase: foundation_framing
Filter: construction_phase = 'foundation_framing'
Result: Shows only foundation & framing products
```

**Validation**:
```bash
# Test policy via GraphQL
curl -X POST "https://your-aco-instance/graphql" \
  -H "AC-Policy-Phase: foundation_framing" \
  -d '{ "query": "{ products { items { sku name } } }" }'
```

**Deliverable**: 28 active policies in ACO

**Estimated Time**: 2-3 hours (manual UI work)

---

## Task 6: Demo Customer Account Creation

### 6.1 Create 5 Demo Customer Accounts

**Location**: Adobe Commerce Admin → Customers → All Customers

**Accounts to Create**:

#### 1. Sarah Martinez
- **Email**: `sarah.martinez@sunbelthomes.com`
- **First Name**: Sarah
- **Last Name**: Martinez
- **Customer Group**: Production-Builder
- **Custom Attributes**:
  - `business_type`: production_builder
  - `project_scale`: high_volume
  - `primary_service`: residential_construction
  - `customer_tier`: Production-Builder
  - `buying_behavior`: repeat_orders

#### 2. Marcus Johnson
- **Email**: `marcus.johnson@johnsonconstruction.com`
- **First Name**: Marcus
- **Last Name**: Johnson
- **Customer Group**: Trade-Professional
- **Custom Attributes**:
  - `business_type`: general_contractor
  - `project_scale`: medium_volume
  - `primary_service`: residential_construction
  - `customer_tier`: Trade-Professional
  - `buying_behavior`: project_based

#### 3. Lisa Chen
- **Email**: `lisa.chen@chendesignbuild.com`
- **First Name**: Lisa
- **Last Name**: Chen
- **Customer Group**: Trade-Professional
- **Custom Attributes**:
  - `business_type`: remodeling_contractor
  - `project_scale`: medium_volume
  - `primary_service`: remodeling
  - `customer_tier`: Trade-Professional
  - `buying_behavior`: project_based

#### 4. David Thompson
- **Email**: `david.thompson@email.com`
- **First Name**: David
- **Last Name**: Thompson
- **Customer Group**: Retail-Registered
- **Custom Attributes**:
  - `business_type`: diy_homeowner
  - `project_scale`: single_project
  - `primary_service`: diy
  - `customer_tier`: Retail-Registered
  - `buying_behavior`: single_items

#### 5. Kevin Rodriguez
- **Email**: `kevin.rodriguez@buildright.com`
- **First Name**: Kevin
- **Last Name**: Rodriguez
- **Customer Group**: Wholesale-Reseller
- **Custom Attributes**:
  - `business_type`: retail_store
  - `project_scale`: high_volume
  - `primary_service`: retail
  - `customer_tier`: Wholesale-Reseller
  - `buying_behavior`: bulk_orders

**Steps for Each Account**:
1. Navigate to Customers → All Customers
2. Click "Add New Customer"
3. Fill in account information
4. Select customer group
5. Navigate to "Account Information" tab
6. Set custom attributes
7. Save customer

**Validation**:
```bash
# Query customer via API
curl -X GET "https://your-instance.adobe.io/rest/V1/customers/search?searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=sarah.martinez@sunbelthomes.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Deliverable**: 5 demo customer accounts with correct groups and attributes

---

## Task 7: End-to-End Validation

### 7.1 Test Customer Group Pricing

**Test for Each Persona**:
1. Log in as persona customer
2. View product detail page
3. Verify pricing matches customer group discount
4. Add to cart
5. Verify cart pricing

**Expected Results**:
- Sarah (Production-Builder): 15% off retail
- Marcus (Trade-Professional): 10% off retail
- Lisa (Trade-Professional): 10% off retail
- David (Retail-Registered): 5% off retail
- Kevin (Wholesale-Reseller): 25% off retail

**Validation Script**:
```bash
cd buildright-aco
node scripts/validate-pricing.js --customer=sarah
```

**Deliverable**: Pricing validation report

---

### 7.2 Test ACO Policy Filtering

**Test for Each Policy Category**:
1. Send GraphQL query with policy header
2. Verify filtered product list
3. Check product count matches expectations

**Example: Test Marcus's Foundation Phase**
```bash
curl -X POST "https://your-aco-instance/graphql" \
  -H "AC-Policy-Phase: foundation_framing" \
  -d '{ "query": "{ products { totalCount items { sku name attributes { code value } } } }" }'
```

**Expected**: Only products with `construction_phase: foundation_framing`

**Validation Script**:
```bash
cd buildright-aco
node scripts/validate-policies.js
```

**Deliverable**: Policy validation report (28 policies tested)

---

### 7.3 Test Volume Tier Pricing

**Test**:
1. Query product pricing for different quantities
2. Verify volume tier discounts apply correctly

**Example**:
```
Product: LBR-D0414F1E
Customer Group: Production-Builder

Qty 1-99:   $8.50 (base tier price)
Qty 100-293: $8.25 (3% volume discount)
Qty 294+:    $7.82 (8% volume discount)
```

**Validation Script**:
```bash
cd buildright-aco
node scripts/validate-volume-pricing.js
```

**Deliverable**: Volume pricing validation report

---

## Task 8: Documentation

### 8.1 Document Backend Configuration

**File**: `buildright-aco/docs/BACKEND-CONFIGURATION.md`

**Contents**:
- Customer group IDs
- Custom attribute IDs
- ACO price book IDs
- ACO policy IDs
- Demo customer account credentials
- API endpoints and credentials
- Troubleshooting guide

**Deliverable**: Backend configuration documentation

---

### 8.2 Create Runbook for Backend Maintenance

**File**: `buildright-aco/docs/BACKEND-RUNBOOK.md`

**Contents**:
- How to add new products
- How to update pricing
- How to modify policies
- How to create new customer accounts
- How to regenerate data
- Backup and restore procedures

**Deliverable**: Backend maintenance runbook

---

## Success Criteria

✅ 5 customer groups created in Adobe Commerce  
✅ 5 custom customer attributes registered  
✅ 5 price books ingested to ACO  
✅ 885 price entries ingested to ACO  
✅ 177 products ingested to ACO (70 simple, 92 variants, 15 bundles)  
✅ 28 triggered policies configured in ACO  
✅ 5 demo customer accounts created  
✅ Customer group pricing validated  
✅ ACO policy filtering validated  
✅ Volume tier pricing validated  
✅ Backend configuration documented

---

## Testing Checklist

### Customer Groups
- [ ] All 5 groups exist in Adobe Commerce
- [ ] Groups have correct tax classes
- [ ] Catalog price rules configured

### Custom Attributes
- [ ] All 5 customer attributes registered
- [ ] Attributes visible in customer admin
- [ ] Attributes appear in customer records

### ACO Price Books
- [ ] 5 price books exist in ACO
- [ ] Price book hierarchy correct (US-Retail as base)
- [ ] Price books queryable via GraphQL

### ACO Pricing
- [ ] 885 price entries in ACO
- [ ] Pricing correct for each customer group
- [ ] Volume tiers apply correctly

### ACO Products
- [ ] 177 products in ACO
- [ ] Persona attributes present on products
- [ ] Products queryable via GraphQL

### ACO Policies
- [ ] 28 policies active in ACO
- [ ] Policies filter products correctly
- [ ] Policy headers work as expected

### Demo Accounts
- [ ] 5 customer accounts created
- [ ] Accounts assigned to correct groups
- [ ] Custom attributes set correctly
- [ ] Accounts can log in

### End-to-End
- [ ] Can log in as each persona
- [ ] Pricing displays correctly for each group
- [ ] Policies filter products correctly
- [ ] Cart and checkout work

---

## Parallel Work Strategy

**Phase 8 can run in parallel with Phase 3-6:**

```
Phase 3-6 (Frontend)          Phase 8 (Backend)
├─ Use mock ACO service       ├─ Set up customer groups
├─ Build persona UIs          ├─ Register attributes
├─ Test with mock data        ├─ Ingest products/pricing
└─ Complete all UI work       └─ Configure policies

Phase 9: Integration
├─ Switch from mock to real ACO
├─ Test end-to-end
└─ Production ready
```

**Benefits**:
- Frontend not blocked by backend setup
- Backend validated independently
- Can demo with mock while backend is being set up
- Faster overall timeline

---

## Next Steps

After Phase 8 completion:
1. **Phase 9**: Frontend-Backend Integration
   - Update `scripts/aco-service.js` to call real ACO
   - Update `scripts/auth.js` to use Adobe Commerce Auth Dropin
   - End-to-end testing
   - Performance optimization

2. **Phase 7**: Integration & Polish (if not already done)
   - Cross-persona testing
   - Bug fixes
   - Demo walkthrough

---

## Related Documents

- `buildright-aco/docs/SETUP-GUIDE.md` - Detailed setup instructions
- `buildright-aco/docs/POLICY-SETUP-GUIDE.md` - Policy configuration guide
- `buildright-aco/docs/PRICING-STRATEGY.md` - Pricing model documentation
- `buildright-aco/docs/BUILDRIGHT-CASE-STUDY.md` - Complete case study
- `PHASE-9-FRONTEND-BACKEND-INTEGRATION.md` - Integration phase (to be created)

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 16, 2024

