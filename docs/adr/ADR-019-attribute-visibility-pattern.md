# ADR-019: Attribute Visibility Pattern

## Status
Accepted

## Date
2026-01-06

## Context

Product attributes in a commerce catalog serve multiple purposes:
- **Customer-facing display** - Brand, material, dimensions shown in product specs
- **Internal operations** - Restock priority, velocity category used for inventory logic
- **Navigation/filtering** - Category, subcategory used for faceted navigation

We needed a pattern to control which attributes appear in the Product Detail Page (PDP) specifications list, while still making all attributes available for business logic, filtering, and API consumers.

### Requirements
1. Control attribute visibility at the **attribute definition level** (not per-SKU)
2. Follow standard **Adobe Commerce patterns** (`is_visible_on_front`)
3. Work across both **Commerce** and **ACO** catalog backends
4. Keep the **frontend simple** - no visibility logic in the UI layer
5. Make visibility **data-driven** - no hardcoded lists in code

## Decision

We implement a **data-driven attribute visibility pattern** that flows from canonical data definitions through to the mesh layer:

```
Canonical Data                Commerce                  ACO Metadata              Mesh
─────────────────────────    ──────────────────────    ─────────────────────    ─────────────────────
isVisibleOnFront: false  →   is_visible_on_front: 0 →  visibility: []        →  Filtered out
isVisibleOnFront: true   →   is_visible_on_front: 1 →  visibility:           →  Included in response
                                                       ["PRODUCT_DETAIL",...]
```

### Implementation Layers

#### 1. Canonical Data (Source of Truth)
Attribute definitions include `isVisibleOnFront`:

```json
{
  "attributeCode": "br_store_velocity_category",
  "frontendLabel": "Store Velocity Category",
  "isVisibleOnFront": false,
  "isFilterable": false
}
```

#### 2. Commerce Generator
Maps to Commerce's native `is_visible_on_front` setting:

```javascript
is_visible_on_front: isVisibleOnFront ? 1 : 0
```

#### 3. ACO Generator
Maps to ACO's `visibility` array in attribute metadata:

```javascript
function mapToACOVisibility(attr) {
  const visibility = [];
  
  // Only add PRODUCT_DETAIL if visible on front
  if (attr.is_visible_on_front === 1) {
    visibility.push('PRODUCT_DETAIL');
  }
  // ... other visibility contexts
  return visibility;
}
```

#### 4. Mesh Layer
Dynamically reads ACO metadata and filters attributes:

```javascript
// Fetch and cache attribute metadata
const visibilityMap = await fetchAttributeVisibility(context, logger);

// Transform product with visibility filtering
const product = transformACOProduct(item.productView, visibilityMap);
```

The mesh:
- Fetches attribute metadata from ACO once per request
- Caches results for 5 minutes (configurable TTL)
- Filters attributes based on `PRODUCT_DETAIL` visibility
- Falls back to showing all attributes if metadata unavailable

## Consequences

### Positive
- **Single source of truth** - Visibility controlled in canonical data
- **Standard patterns** - Uses Commerce's native `is_visible_on_front`
- **No hardcoding** - No lists of attribute names in code
- **Flexible** - Attributes available for logic but hidden from display
- **Frontend simplicity** - UI receives only display-ready attributes

### Negative
- **Additional API call** - Mesh fetches metadata (mitigated by caching)
- **Data regeneration required** - Changing visibility requires regenerating data

### Neutral
- Visibility is per-attribute, not per-SKU (matches Commerce standard)

## Examples

### Internal Attribute (Hidden)
```json
{
  "attributeCode": "br_restock_priority",
  "frontendLabel": "Restock Priority",
  "isVisibleOnFront": false
}
```
- Available in product data for B2B dashboards, inventory logic
- NOT shown in PDP specifications list

### Customer-Facing Attribute (Visible)
```json
{
  "attributeCode": "br_brand",
  "frontendLabel": "Brand",
  "isVisibleOnFront": true
}
```
- Shown in PDP specifications list
- Available for filtering and search

## Related
- [ADR-009: Mesh Adapter Resolver Pattern](ADR-009-mesh-adapter-resolver-pattern.md)
- [ADR-007: ACO Catalog Integration Strategy](ADR-007-aco-catalog-integration-strategy.md)
- [Canonical Format Documentation](../../../commerce-demo-generator/docs/CANONICAL-FORMAT.md)
