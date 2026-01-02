# ADR-015: Dynamic Pricing Rules (Base Prices with Runtime Tier Calculation)

**Status**: Accepted

**Date**: 2026-01-02

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight uses Adobe Commerce Optimizer (ACO) for catalog and pricing data. When implementing pricing, we faced a fundamental architectural choice about how to store and manage volume/tier pricing:

**Option A - Base Prices Only (Rule-Based)**
- Store 885 base price entries (177 products x 5 price books)
- Apply volume tier discounts dynamically at runtime via rules
- Matches ACO's native architecture

**Option B - Pre-Generated Tier Prices (Entry-Based)**
- Store 2,655 price entries (177 products x 5 price books x 3 tiers)
- Each quantity tier stored as a separate price entry
- Does NOT match how ACO actually works

### Key Factors

1. **ACO Architecture**: Official Adobe documentation confirms ACO uses rule-based pricing:
   > "Volume tier pricing and other complex pricing rules are applied dynamically at runtime. This approach eliminates the need to pre-generate extensive pricing data, reducing storage requirements and enhancing system performance."
   > -- [ACO Data Ingestion API](https://developer.adobe.com/commerce/services/optimizer/data-ingestion/)

2. **Scalability**: ACO supports up to 30,000 unique price points per SKU and 250 million SKUs - pre-generating all tier combinations would be impractical.

3. **Maintenance**: Changing discount percentages should require rule updates, not mass data updates.

4. **Demo Accuracy**: BuildRight demonstrates ACO capabilities - the mock should behave like the real system.

---

## Decision

**We will store 885 base price entries and calculate volume tier discounts dynamically at runtime.**

### Price Storage Architecture

**What We Store (in ACO/mock data):**
```json
{
  "id": "PRICE_Production-Builder_LBR-D0414F1E",
  "sku": "LBR-D0414F1E",
  "priceBookId": "Production-Builder",
  "amount": 8.50,
  "currency": "USD",
  "uom": "EA",
  "effectiveDate": "2025-01-01",
  "explicit": true
}
```

**What We Calculate at Runtime:**
```javascript
const VOLUME_TIERS = {
  tier1: { minQty: 1, maxQty: 99, discount: 0 },
  tier2: { minQty: 100, maxQty: 293, discount: 0.03 },
  tier3: { minQty: 294, maxQty: Infinity, discount: 0.08 }
};

// Runtime calculation
const basePrice = 8.50;           // From stored data
const quantity = 300;             // From request
const tierDiscount = 0.03;        // From rules (qty 300 = tier 2)
const finalPrice = basePrice * (1 - tierDiscount);  // $8.25
```

### Price Books

Five price books with different base price multipliers:

| Price Book | Target Segment | Discount from Retail |
|------------|----------------|---------------------|
| US-Retail | Anonymous/Guest | 0% (base) |
| Retail-Registered | Registered Homeowners | 5% |
| Trade-Professional | Licensed Contractors | 10% |
| Production-Builder | High-Volume Builders | 15% |
| Wholesale-Reseller | Resellers | 25% |

### Volume Tier Rules

Applied dynamically across all price books:

| Tier | Quantity Range | Discount |
|------|----------------|----------|
| Tier 1 | 1-99 units | 0% |
| Tier 2 | 100-293 units | 3% |
| Tier 3 | 294+ units | 8% |

---

## Rationale

### Why Rule-Based Pricing Wins

1. **Matches ACO Architecture**
   - ACO explicitly uses rule-based pricing
   - Our mock accurately simulates real ACO behavior
   - Production migration requires no pricing logic changes

2. **3x Less Data Storage**
   - 885 entries vs 2,655 entries
   - Reduced ingestion time
   - Smaller mock data files

3. **Easier Maintenance**
   - Change one rule to update all tier discounts
   - No need to regenerate thousands of price entries
   - Version control for rule changes is cleaner

4. **Better Scalability**
   - Adding new products: 5 entries (one per price book)
   - Adding new price book: 177 entries (one per product)
   - Adding new tier: 0 entries (just update rule)

5. **Flexible Querying**
   - Can calculate price for ANY quantity (not just tier breakpoints)
   - Supports promotional overrides at runtime
   - Enables real-time pricing adjustments

---

## Consequences

### Positive Outcomes

**Accurate ACO Simulation**
- Mock behaves like production ACO
- Demo accurately represents Adobe's architecture
- No surprises when connecting to real ACO

**Reduced Complexity**
- Simpler data model
- Fewer files to manage
- Clearer separation of data vs rules

**Maintainability**
- Pricing rules in code, not scattered across data
- Easy to test tier calculations
- Clear audit trail for rule changes

**Performance**
- Less data to load and index
- Runtime calculation is trivial (simple math)
- Faster price book queries

### Negative Outcomes

**Runtime Calculation Overhead**
- Every price request requires tier lookup
- Marginally more CPU than pure data lookup
- Mitigated: Calculation is O(1) with 3 tiers

**Rule Synchronization**
- Rules must match between mock and production ACO
- Risk of rule drift if ACO rules change
- Mitigated: Document rules in this ADR, validate periodically

**Testing Complexity**
- Must test both data AND rules
- More edge cases (tier boundaries, rounding)
- Mitigated: Unit tests for tier calculation logic

---

## Alternatives Considered

### Alternative: Pre-Generated Tier Prices (Rejected)

**Approach**: Store separate price entry for each product/price-book/tier combination.

```json
// Would require 2,655 entries like:
{ "sku": "LBR-D0414F1E", "priceBookId": "Production-Builder", "quantity": 1, "price": 8.50 },
{ "sku": "LBR-D0414F1E", "priceBookId": "Production-Builder", "quantity": 100, "price": 8.25 },
{ "sku": "LBR-D0414F1E", "priceBookId": "Production-Builder", "quantity": 294, "price": 7.82 }
```

**Why Rejected:**
- Does NOT match ACO architecture (rule-based, not entry-based)
- 3x more data to store and maintain
- Changing discount rules requires regenerating 1,770 entries
- Cannot handle arbitrary quantities (only stored breakpoints)
- Misleading demo - shows behavior ACO doesn't actually have

---

## Implementation Details

### Production Architecture

**Path**: Product Discovery Dropin → API Mesh → ACO

Pricing in production comes **directly from ACO** via API Mesh. ACO natively implements rule-based pricing as described in this ADR - the concept is accurate, only the implementation path has evolved.

The mesh forwards persona headers to ACO, which returns calculated prices:
- `AC-View-Id`: UUID identifying the catalog view (from persona service)
- `AC-Price-Book-Id`: Price book identifier (e.g., "Production-Builder")

See `buildright-service/mesh/README.md` for mesh architecture details.

### Deprecated Mock Service

**File**: `scripts/aco-service.js` (DEPRECATED)

The original mock ACO service implemented this rule-based pricing pattern for local development when mesh was unavailable. It is now deprecated - BuildRight uses Commerce Dropins and API Mesh for real data. The mock is retained only as a fallback.

### Required Headers

ACO pricing queries require two headers (see CLAUDE.md):

```
AC-View-Id: [UUID from persona service]
AC-Price-Book-Id: [from persona, e.g., "Production-Builder"]
```

### Validation Metric

The `0 / 885 (0%)` volume tier pricing metric is **expected and correct**:
- 0 = No pre-generated tier price entries
- 885 = All base price entries
- 0% = Confirms rule-based approach

---

## Related Decisions

- [ADR-003: Mock ACO Service with CCDM Simulation](./ADR-003-mock-aco-service.md) - Foundation for pricing implementation
- [ADR-004: Custom Attributes for Personas](./ADR-004-custom-attributes-for-personas.md) - How personas map to price books

---

## References

1. **ACO Price Books**: https://experienceleague.adobe.com/en/docs/commerce/optimizer/setup/pricebooks
2. **ACO Data Ingestion**: https://developer.adobe.com/commerce/services/optimizer/data-ingestion/
3. **ACO Boundaries**: https://experienceleague.adobe.com/en/docs/commerce/optimizer/boundaries-limits
4. **Source Research**: [docs/archive/completed/aco-pricing-headers.md](../archive/completed/aco-pricing-headers.md) (archived - superseded by this ADR)

---

**Last Updated**: January 2, 2026 (clarified production architecture, deprecated mock reference)
