# ACO and Adobe Commerce Backend: Catalog Relationship

## Executive Summary

**Key Finding**: Adobe Commerce Optimizer (ACO) and Adobe Commerce PaaS operate as **independent platforms** with **separate catalog systems**. There is **NO automatic synchronization** between them. Integration requires **custom data ingestion** from Adobe Commerce PaaS to ACO.

**For BuildRight Demo**: We will use ACO as the **primary catalog source** and ingest data directly to ACO. The Adobe Commerce PaaS backend will primarily handle **customer management, authentication, and order processing**, NOT catalog management.

---

## Research Sources

This document is based on research from:
- ✅ Context7: `/adobedocs/commerce-services` library
- ✅ Adobe Experience League: [Adobe Commerce Optimizer Overview](https://experienceleague.adobe.com/en/docs/commerce/optimizer/overview)
- ✅ Adobe Experience League: [Catalog Views for Merchandising Services](https://experienceleague.adobe.com/en/docs/commerce/optimizer/setup/catalog-view)
- ✅ Adobe Experience League: [Salesforce Commerce Connector for ACO](https://experienceleague.adobe.com/en/docs/commerce/optimizer/developer/salesforce-connector)

---

## Platform Architecture

### Adobe Commerce PaaS (Platform as a Service)
**Role**: Backend commerce platform

**Capabilities**:
- Comprehensive e-commerce backend
- Product catalog management (traditional)
- Customer management
- Order management
- Payment processing
- Inventory management
- Customizable backend infrastructure

**Catalog Model**: Traditional Magento/Adobe Commerce catalog structure

---

### Adobe Commerce Optimizer (ACO)
**Role**: High-performance storefront layer (SaaS)

**Capabilities**:
- Catalog data ingestion from **any source**
- Composable Catalog Data Model (CCDM)
- Catalog Views and Policies
- AI-powered search and recommendations
- Edge Delivery Services integration
- Multi-brand, multi-region, multi-language support

**Catalog Model**: CCDM (Composable Catalog Data Model)

---

## Critical Understanding: They Are Independent

### No Automatic Synchronization

> **IMPORTANT**: Adobe Commerce PaaS and Adobe Commerce Optimizer **DO NOT automatically sync catalogs**. They are **separate platforms** with **separate catalog databases**.

**What This Means**:
1. Products added to Adobe Commerce PaaS **DO NOT** automatically appear in ACO
2. Products added to ACO **DO NOT** automatically appear in Adobe Commerce PaaS
3. Catalog Views and Policies in ACO are **ACO-specific** concepts
4. Integration requires **custom data ingestion** or **middleware**

### Adobe's Connectors

Adobe provides connectors for **third-party platforms**, but **NOT** for Adobe Commerce PaaS:

**Available**:
- ✅ Salesforce Commerce Connector for ACO
- ✅ Generic data ingestion APIs

**NOT Available**:
- ❌ Adobe Commerce PaaS ↔ ACO Connector (out-of-the-box)

**Implication**: Organizations using both platforms must build **custom integration solutions**.

---

## Data Flow Architecture

### Option 1: ACO as Primary Catalog (Recommended for BuildRight)

```
Product Data Source (PIM/ERP/Manual)
          ↓
    ACO Data Ingestion
    (GraphQL/REST API)
          ↓
    Adobe Commerce Optimizer
    ├─ Catalog Views
    ├─ Policies (CCDM)
    ├─ Price Books
    └─ Merchandising Services
          ↓
    Edge Delivery Services
    (accs-citisignal)
          ↓
    Storefront Experience
```

**Adobe Commerce PaaS Role**:
- Customer accounts and authentication
- Customer groups (for pricing)
- Custom attributes (for persona)
- Order processing
- Payment processing
- **NOT catalog management**

---

### Option 2: Adobe Commerce PaaS as Primary Catalog

```
Adobe Commerce PaaS
    ├─ Product Catalog
    ├─ Pricing
    └─ Inventory
          ↓
    Custom Sync Process
    (GraphQL/REST API)
          ↓
    Adobe Commerce Optimizer
    ├─ Catalog Views
    ├─ Policies
    └─ Merchandising Services
          ↓
    Edge Delivery Services
          ↓
    Storefront Experience
```

**Challenges**:
- Requires custom sync logic
- Duplicate catalog management
- Sync latency and complexity
- Potential data inconsistencies

---

### Option 3: Hybrid Approach

```
Adobe Commerce PaaS
    ├─ Customer Management ✅
    ├─ Order Processing ✅
    └─ Basic Product Data
          ↓
    Custom Middleware
          ↓
    Adobe Commerce Optimizer
    ├─ Enhanced Catalog (CCDM) ✅
    ├─ Catalog Views ✅
    ├─ Policies ✅
    └─ Merchandising ✅
          ↓
    Edge Delivery Services
          ↓
    Storefront Experience
```

**Complexity**: High - requires careful orchestration

---

## ACO Catalog Concepts (CCDM)

### 1. Catalog Views

**Definition**: Filters that determine product visibility based on business structure.

**Purpose**:
- Define which products are visible
- Link to price books
- Apply policies (filters)
- Support multi-brand/multi-region scenarios

**Example**:
```
Catalog View: "US-Production-Builder"
├─ Visible Products: Foundation & framing materials
├─ Price Book: "Production-Builder" (15% off)
├─ Policies: construction_phase=foundation_framing
└─ Locale: en-US
```

**Relationship to Adobe Commerce PaaS**: 
- **NONE** - Catalog Views are ACO-specific
- Adobe Commerce PaaS has "Store Views" (different concept)

---

### 2. Policies (Triggered Policies)

**Definition**: Rules that filter products based on attributes.

**Purpose**:
- Dynamic catalog filtering
- Persona-driven product visibility
- Progressive disclosure
- Context-aware merchandising

**Example**:
```
Policy: "Foundation & Framing Phase"
Trigger Header: AC-Policy-Phase: foundation_framing
Filter: construction_phase = 'foundation_framing'
Result: Shows only foundation & framing products
```

**Relationship to Adobe Commerce PaaS**:
- **NONE** - Policies are ACO-specific
- Adobe Commerce PaaS uses category rules (different concept)

---

### 3. Price Books

**Definition**: Hierarchical pricing structures for different customer segments.

**Purpose**:
- Customer-tier pricing
- Volume-tier pricing
- Multi-currency support
- Hierarchical price inheritance

**Example**:
```
Price Book Hierarchy:
US-Retail (base)
├─ Production-Builder (15% off)
├─ Trade-Professional (10% off)
└─ Wholesale-Reseller (25% off)
```

**Relationship to Adobe Commerce PaaS**:
- **Conceptually similar** to customer group pricing
- **Technically separate** - ACO price books are independent
- Can be **mapped** to Adobe Commerce customer groups

---

## BuildRight Implementation Strategy

### Phase 8: Backend Setup (Revised Understanding)

Based on this research, here's what Phase 8 should actually do:

#### 1. Adobe Commerce PaaS Configuration

**Purpose**: Customer management, authentication, order processing

**Tasks**:
- ✅ Create 5 customer groups (Production-Builder, Trade-Professional, etc.)
- ✅ Register 5 custom attributes (business_type, project_scale, etc.)
- ✅ Create 5 demo customer accounts
- ✅ Configure customer group pricing rules (optional - for fallback)
- ❌ **DO NOT** manage product catalog in Adobe Commerce PaaS
- ❌ **DO NOT** try to sync ACO catalog to Adobe Commerce PaaS

**Rationale**: Adobe Commerce PaaS handles **customer identity** and **order processing**, NOT catalog.

---

#### 2. ACO Configuration

**Purpose**: Primary catalog source with CCDM capabilities

**Tasks**:
- ✅ Ingest 177 products to ACO (Phase 1 data)
- ✅ Ingest 885 prices to ACO (Phase 1 data)
- ✅ Configure 5 price books in ACO
- ✅ Configure 28 triggered policies in ACO
- ✅ Create catalog views for each persona (optional)

**Rationale**: ACO is the **source of truth** for catalog data.

---

#### 3. Integration Points

**What Connects**:

| Component | Adobe Commerce PaaS | ACO |
|-----------|---------------------|-----|
| **Customer Data** | ✅ Primary | ❌ Not stored |
| **Customer Groups** | ✅ Defined | 🔗 Referenced in price books |
| **Custom Attributes** | ✅ Stored | 🔗 Used for policy headers |
| **Product Catalog** | ❌ Not used | ✅ Primary |
| **Pricing** | ⚠️ Fallback only | ✅ Primary (price books) |
| **Policies** | ❌ Not applicable | ✅ Primary (CCDM) |
| **Orders** | ✅ Primary | ❌ Not handled |
| **Payments** | ✅ Primary | ❌ Not handled |

**Integration Flow**:
```
1. User logs in
   → Adobe Commerce Auth Dropin
   → Adobe Commerce PaaS backend
   → Returns customer data (group, attributes)

2. Storefront queries products
   → API Mesh
   → ACO (with policy headers from customer attributes)
   → Returns filtered products with persona pricing

3. User adds to cart
   → Adobe Commerce Cart Dropin
   → Adobe Commerce PaaS backend
   → Cart uses ACO pricing

4. User checks out
   → Adobe Commerce Checkout Dropin
   → Adobe Commerce PaaS backend
   → Order created in Adobe Commerce PaaS
```

---

## Revised Phase 8 Plan

### What Changed

**BEFORE** (Incorrect Understanding):
- Thought ACO catalog would mirror Adobe Commerce PaaS catalog
- Planned to manage products in both systems
- Expected automatic synchronization

**AFTER** (Correct Understanding):
- ACO catalog is **independent** from Adobe Commerce PaaS
- Products managed **only in ACO**
- Adobe Commerce PaaS handles **customers and orders**, NOT catalog

---

### Updated Phase 8 Tasks

#### Task 1: Adobe Commerce PaaS - Customer Management Only

**Scope**: Customer groups, attributes, accounts

**What to Configure**:
1. ✅ 5 customer groups (for pricing mapping)
2. ✅ 5 custom attributes (for persona determination)
3. ✅ 5 demo customer accounts
4. ❌ **SKIP**: Product catalog management
5. ❌ **SKIP**: Catalog price rules (use ACO price books instead)

**Rationale**: Adobe Commerce PaaS is **NOT** the catalog source.

---

#### Task 2: ACO - Primary Catalog Source

**Scope**: Products, prices, policies, catalog views

**What to Configure**:
1. ✅ Ingest 177 products (from Phase 1)
2. ✅ Ingest 885 prices (from Phase 1)
3. ✅ Configure 5 price books
4. ✅ Configure 28 triggered policies
5. ✅ (Optional) Create catalog views per persona

**Rationale**: ACO is the **source of truth** for catalog.

---

#### Task 3: Integration - Mapping Customer Groups to Price Books

**Scope**: Ensure customer groups map to ACO price books

**Configuration**:
```
Adobe Commerce Customer Group → ACO Price Book
────────────────────────────────────────────────
US-Retail                     → US-Retail
Production-Builder            → Production-Builder
Trade-Professional            → Trade-Professional
Wholesale-Reseller            → Wholesale-Reseller
Retail-Registered             → Retail-Registered
```

**Implementation**: API Mesh resolver maps customer group to price book ID.

---

#### Task 4: Integration - Mapping Custom Attributes to Policy Headers

**Scope**: Ensure custom attributes trigger ACO policies

**Configuration**:
```
Customer Attribute            → ACO Policy Header
────────────────────────────────────────────────
construction_phase            → AC-Policy-Phase
quality_tier                  → AC-Policy-Quality
package_tier                  → AC-Policy-Package
room_category                 → AC-Policy-Room
deck_shape                    → AC-Policy-Shape
deck_material_type            → AC-Policy-Material
store_velocity_category       → AC-Policy-Velocity
restock_priority              → AC-Policy-Restock
```

**Implementation**: API Mesh resolver reads customer attributes and sets policy headers.

---

## API Mesh Role (Phase 9)

### Why API Mesh is Critical

**Problem**: Adobe Commerce PaaS and ACO are separate platforms.

**Solution**: API Mesh acts as the **orchestration layer**.

**API Mesh Responsibilities**:
1. **Authenticate** with Adobe Commerce PaaS (get customer data)
2. **Map** customer group to ACO price book
3. **Map** customer attributes to ACO policy headers
4. **Query** ACO with policy headers (filtered catalog)
5. **Return** unified data to storefront

---

### API Mesh Resolver Example

```javascript
// persona-resolver.js
export default {
  Query: {
    personaProducts: async (parent, args, context) => {
      // 1. Get customer from Adobe Commerce PaaS
      const customer = await context.AdobeCommerce.Query.customer();
      
      // 2. Map customer group to ACO price book
      const priceBookId = customer.group_id; // e.g., "Production-Builder"
      
      // 3. Build ACO policy headers from customer attributes
      const policyHeaders = {};
      if (customer.custom_attributes.construction_phase) {
        policyHeaders['AC-Policy-Phase'] = customer.custom_attributes.construction_phase;
      }
      if (customer.custom_attributes.quality_tier) {
        policyHeaders['AC-Policy-Quality'] = customer.custom_attributes.quality_tier;
      }
      // ... other attributes
      
      // 4. Query ACO with policy headers and price book
      const products = await context.ACO.Query.products(
        {
          ...args,
          priceBookId
        },
        { headers: policyHeaders }
      );
      
      // 5. Return filtered, priced products
      return products;
    }
  }
};
```

---

## Key Takeaways for BuildRight

### 1. ACO is the Catalog Source ✅

**What This Means**:
- All 177 products live in ACO
- All 885 prices live in ACO
- All 28 policies live in ACO
- All catalog views (if used) live in ACO

**Action**: Continue with Phase 1 data ingestion to ACO as planned.

---

### 2. Adobe Commerce PaaS is for Customers & Orders ✅

**What This Means**:
- Customer accounts live in Adobe Commerce PaaS
- Customer groups live in Adobe Commerce PaaS
- Custom attributes live in Adobe Commerce PaaS
- Orders live in Adobe Commerce PaaS
- **Products DO NOT live in Adobe Commerce PaaS**

**Action**: Simplify Phase 8 to focus on customer management only.

---

### 3. API Mesh is the Integration Layer ✅

**What This Means**:
- API Mesh connects Adobe Commerce PaaS (customers) with ACO (catalog)
- API Mesh maps customer groups to price books
- API Mesh maps customer attributes to policy headers
- API Mesh orchestrates the complete persona experience

**Action**: Phase 9 API Mesh implementation is **critical** for production.

---

### 4. No Catalog Duplication Required ✅

**What This Means**:
- We do **NOT** need to manage products in Adobe Commerce PaaS
- We do **NOT** need to sync ACO catalog to Adobe Commerce PaaS
- We do **NOT** need to worry about catalog consistency between platforms

**Action**: Remove any tasks related to Adobe Commerce PaaS product management.

---

## Updated Architecture Diagram

### Production Architecture (Corrected)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Storefront)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Edge Delivery Services (accs-citisignal)            │
│         - Adobe Commerce Dropins                            │
│         - Custom EDS Blocks                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Adobe API Mesh (buildright-mesh)               │
│         - Orchestration Layer                               │
│         - Customer → Price Book Mapping                     │
│         - Attributes → Policy Headers Mapping               │
└─────────────────────────────────────────────────────────────┘
         ↓                                       ↓
┌────────────────────────┐         ┌────────────────────────────┐
│ Adobe Commerce PaaS    │         │ Adobe Commerce Optimizer   │
│ ────────────────────── │         │ ────────────────────────── │
│ ✅ Customer Accounts   │         │ ✅ Product Catalog (177)   │
│ ✅ Customer Groups (5) │         │ ✅ Prices (885)            │
│ ✅ Custom Attributes   │         │ ✅ Price Books (5)         │
│ ✅ Orders              │         │ ✅ Policies (28)           │
│ ✅ Payments            │         │ ✅ Catalog Views           │
│ ❌ Product Catalog     │         │ ✅ Merchandising Services  │
└────────────────────────┘         └────────────────────────────┘
```

**Key Insight**: Two separate platforms, unified by API Mesh.

---

## Recommendations for Phase 8

### Simplify Phase 8 Scope

**REMOVE** from Phase 8:
- ❌ Product ingestion to Adobe Commerce PaaS
- ❌ Catalog price rules in Adobe Commerce PaaS
- ❌ Product attribute management in Adobe Commerce PaaS
- ❌ Any catalog synchronization logic

**KEEP** in Phase 8:
- ✅ Customer group configuration (5 groups)
- ✅ Custom attribute registration (5 attributes)
- ✅ Demo customer account creation (5 accounts)
- ✅ ACO product ingestion (177 products)
- ✅ ACO price ingestion (885 prices)
- ✅ ACO policy configuration (28 policies)

**RESULT**: Simpler, faster, more accurate Phase 8.

---

### Emphasize Phase 9 (API Mesh)

**Why**: API Mesh is the **critical integration layer** that makes everything work.

**Focus Areas**:
1. Customer data retrieval from Adobe Commerce PaaS
2. Customer group → Price book mapping
3. Custom attributes → Policy headers mapping
4. ACO query orchestration
5. Unified data response to storefront

**Outcome**: Seamless persona experience despite separate platforms.

---

## Questions & Answers

### Q: Can we use Adobe Commerce PaaS catalog instead of ACO?

**A**: Yes, but you would lose ACO's CCDM capabilities:
- ❌ No Catalog Views
- ❌ No Triggered Policies
- ❌ No dynamic filtering
- ❌ No progressive disclosure
- ❌ Limited persona experience

**Recommendation**: Use ACO as primary catalog source.

---

### Q: Do we need to maintain products in both systems?

**A**: **NO**. Products should **only** be in ACO. Adobe Commerce PaaS handles customers and orders, NOT catalog.

---

### Q: How do orders work if products aren't in Adobe Commerce PaaS?

**A**: Orders reference products by SKU. The SKU exists in ACO (catalog) and is stored in the order record in Adobe Commerce PaaS (transaction). Adobe Commerce PaaS doesn't need the full product data to process orders.

---

### Q: What about inventory management?

**A**: This is a **gap** in the current architecture. Options:
1. Manage inventory in ACO (if supported)
2. Manage inventory in Adobe Commerce PaaS (requires custom sync)
3. Use a third-party inventory management system

**For BuildRight Demo**: Mock inventory is sufficient.

---

### Q: Can we skip Adobe Commerce PaaS entirely?

**A**: Not recommended. Adobe Commerce PaaS provides:
- ✅ Production-ready authentication
- ✅ Customer account management
- ✅ Order processing
- ✅ Payment processing
- ✅ Established integrations

**Recommendation**: Use both platforms for their strengths.

---

## Conclusion

### Key Findings

1. **ACO and Adobe Commerce PaaS are independent platforms** with separate catalogs
2. **No automatic synchronization** exists between them
3. **ACO is the catalog source** (products, prices, policies)
4. **Adobe Commerce PaaS is the customer/order source** (accounts, groups, orders)
5. **API Mesh is the integration layer** that unifies both platforms

### Impact on BuildRight Implementation

**Phase 8 Simplified**:
- Focus on customer management in Adobe Commerce PaaS
- Focus on catalog management in ACO
- Remove any catalog duplication or sync logic

**Phase 9 Emphasized**:
- API Mesh is **critical** for production
- API Mesh maps customers to catalog
- API Mesh enables persona experience

### Next Steps

1. ✅ **Update Phase 8 plan** to reflect correct architecture
2. ✅ **Remove product management** from Adobe Commerce PaaS tasks
3. ✅ **Emphasize API Mesh** in Phase 9
4. ✅ **Document integration points** clearly
5. ✅ **Proceed with Phase 3** (frontend with mock)

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Research Date**: November 16, 2024  
**Sources**: Context7, Adobe Experience League, Web Search

