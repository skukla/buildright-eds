# ACO Delete Strategy

## Overview
The `npm run delete` script (`scripts/workflows/reset-all.js`) now uses the **Commerce data pack as the source of truth** for determining which SKUs to delete from ACO.

## Why This Approach?

### Previous Approach (State Tracker)
- ❌ Required the state tracker to be populated during ingestion
- ❌ If state tracker was cleared or corrupted, couldn't delete
- ❌ Didn't handle orphaned products from failed imports

### New Approach (Commerce Data Pack)
- ✅ Uses the canonical Commerce data as source of truth
- ✅ Works even if state tracker is empty or corrupted
- ✅ Deletes exactly what was intended to be imported
- ✅ Falls back to querying ACO directly if Commerce data unavailable

## How It Works

### Step 1: Read SKUs from Commerce Data Pack
```javascript
const commerceProductsPath = '../../../buildright-data/generated/commerce/data/accs/accs_products.json';
const commerceData = JSON.parse(await readFile(commerceProductsPath, 'utf-8'));
const skus = commerceData.source.items.map(item => item.sku);
```

This includes:
- Simple products
- Configurable products (parents)
- Variant products (children)

### Step 2: Fallback to ACO Query (if Commerce data unavailable)
If the Commerce data pack can't be read, the script falls back to querying ACO directly:

```javascript
const orphanProducts = await detector.queryACOProductsDirect('', 500);
const skus = orphanProducts.map(p => p.sku);
```

### Step 3: Delete via ACO SDK
Uses the same reliable `deleteProductsBySKUs()` function:

```javascript
await deleteProductsBySKUs(skus, { dryRun, silent: true });
```

### Step 4: Validation & Orphan Cleanup
After deletion, the script:
1. Validates that all products were deleted
2. Detects any orphaned products
3. Automatically cleans up orphans
4. Retries up to 3 times for complete cleanup

## Manual Query Script

If you need to query ACO directly for all remaining SKUs:

```bash
node /tmp/query_aco_skus.js
```

This script uses the `BuildRightDetector.queryACOProductsDirect()` method to fetch all visible products from ACO via the `productSearch` GraphQL API.

## Usage

### Delete All ACO Data
```bash
cd buildright-aco
npm run delete
```

### Dry Run (Preview Only)
```bash
cd buildright-aco
node scripts/workflows/reset-all.js --dry-run
```

### Delete and Re-import
```bash
cd buildright-aco
node scripts/workflows/reset-all.js --reingest
```

## Files Modified

- `buildright-aco/scripts/workflows/reset-all.js`
  - Changed SKU source from state tracker to Commerce data pack
  - Added fallback to ACO direct query
  - Removed state tracker clearing logic
  - Updated documentation

## Testing

Verified with:
1. ✅ Dry run shows 281 SKUs from Commerce data pack
2. ✅ Successfully deleted 281 SKUs from Commerce data
3. ✅ Successfully deleted 246 orphaned SKUs via ACO query
4. ✅ ACO is now completely clean

## Key Benefits

1. **Reliability**: Commerce data pack is the canonical source
2. **Flexibility**: Falls back to ACO query if needed
3. **Completeness**: Handles both expected and orphaned products
4. **Simplicity**: No dependency on state tracker
5. **Accuracy**: Deletes exactly what was intended to be imported

