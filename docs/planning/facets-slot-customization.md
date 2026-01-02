# Custom Facets Slot Implementation

**Date**: December 21, 2025  
**Status**: ✅ Implemented - Ready for Testing  
**Block**: `product-list-dropin`

---

## Overview

Custom Facets slots have been implemented in the **Product List Dropin** to match BuildRight's design from the `/catalog` page's `filters-sidebar` block. This implementation uses Adobe Commerce Product Discovery's Facets component slots to replace the default UI with BuildRight's custom HTML/CSS.

## Available Facets Slots (Adobe)

Adobe provides the following slots for customization:

| Slot | Purpose | BuildRight Usage |
|------|---------|------------------|
| **Facet** | Individual facet option | ✅ Custom checkbox with label + count |
| **SelectedFacets** | Display of selected facets | ⏳ Not yet implemented |
| **Facets** | Overall facets container | ❌ Using default (container only) |
| **FacetBucket** | Groups of facet values | ✅ Custom collapsible section |
| **FacetBucketLabel** | Labels for facet buckets | ❌ Handled within FacetBucket |

## Implementation

### JavaScript (`blocks/product-list-dropin/product-list-dropin.js`)

**Location**: Lines 242-335

**Slots Implemented**:

1. **FacetBucket Slot** - Creates collapsible filter sections
   - Matches `/catalog` filter-section structure
   - Collapsible toggle button with arrow icon
   - Content container for facet options
   - Click handler for expand/collapse

2. **Facet Slot** - Creates individual checkbox options
   - Matches `/catalog` filter-option structure
   - Native checkbox input
   - Custom visual styling
   - Option label with count

**Key Code**:

```javascript
const facetsSlots = {
  FacetBucket: (ctx) => {
    const { data } = ctx;
    const section = document.createElement('div');
    section.className = 'buildright-filter-section';
    // ... create toggle button and content container
    ctx.replaceWith(section);
  },
  
  Facet: (ctx) => {
    const { data } = ctx;
    const label = document.createElement('label');
    label.className = 'buildright-filter-option';
    // ... create checkbox, visual, and label
    ctx.replaceWith(label);
  }
};

await render.render(Facets, {
  slots: facetsSlots,
  onFilterChange: (filters) => {
    console.log('[ProductListDropin] Facets filters changed:', filters);
  }
})(facetsContainer);
```

### CSS (`blocks/product-list-dropin/product-list-dropin.css`)

**Location**: Lines ~60-155

**Namespaced Classes**:
- `.buildright-filter-section` - Collapsible section container
- `.buildright-filter-toggle` - Toggle button for sections
- `.buildright-filter-toggle-icon` - Arrow icon (rotates on expand)
- `.buildright-filter-content` - Content wrapper (collapsible)
- `.buildright-filter-option` - Individual checkbox option
- `.buildright-filter-option-checkbox` - Custom checkbox visual (hidden, using native)
- `.buildright-filter-option-label` - Option text label
- `.buildright-filter-count` - Count badge
- `.buildright-filter-option--selected` - Selected state styling

**Key Features**:
- Matches `/catalog` filters-sidebar design exactly
- Native checkbox with `accent-color` for brand color
- Collapsible sections with smooth transitions
- Hover states for labels
- Selected state with bold font and brand color

## Design Parity with `/catalog`

| Element | `/catalog` Class | Dropin Class | Match Status |
|---------|------------------|--------------|--------------|
| Section Container | `.filter-section` | `.buildright-filter-section` | ✅ Exact |
| Toggle Button | `.filter-toggle` | `.buildright-filter-toggle` | ✅ Exact |
| Toggle Icon | `.filter-toggle-icon` | `.buildright-filter-toggle-icon` | ✅ Exact |
| Content Wrapper | `.filter-content` | `.buildright-filter-content` | ✅ Exact |
| Checkbox Option | `.filter-option` | `.buildright-filter-option` | ✅ Exact |
| Option Label | `.filter-option-label` | `.buildright-filter-option-label` | ✅ Exact |
| Count Badge | `.filter-count` | `.buildright-filter-count` | ✅ Exact |

## Testing Checklist

### Visual Tests
- [ ] Navigate to `/catalog-dropin`
- [ ] Verify facets render in left sidebar
- [ ] Check that sections are collapsible
- [ ] Verify arrow icon rotates on expand/collapse
- [ ] Check checkbox styling matches original
- [ ] Verify count badges appear
- [ ] Test hover states on labels

### Functional Tests
- [ ] Click checkboxes - verify state changes
- [ ] Click facet - verify URL updates
- [ ] Verify products filter when facets are selected
- [ ] Test multiple facet selections
- [ ] Test clearing all filters
- [ ] Verify selected facets show in bold + brand color

### Console Checks
- [ ] No JavaScript errors
- [ ] `[ProductListDropin] FacetBucket slot called` logs appear
- [ ] `[ProductListDropin] Facet slot called` logs appear
- [ ] `[ProductListDropin] Facets filters changed` logs when clicking

## Known Limitations

1. **SelectedFacets Slot**: Not yet implemented
   - This would show a "Clear all" button or selected facet pills
   - Can be added if needed

2. **Price Range Facets**: Not tested
   - May need special handling for min/max values
   - Current implementation should work but needs testing

3. **Filter Synchronization**: 
   - Adobe handles filter state internally
   - BuildRight's custom filter sidebar may need sync if used simultaneously
   - Recommend using ONLY dropin facets or ONLY custom filters, not both

## Integration with Search

The Facets component automatically:
- ✅ Updates when search results change
- ✅ Shows available filter options based on current results
- ✅ Updates product count per facet
- ✅ Emits filter change events that trigger new searches
- ✅ Syncs with URL parameters

No additional integration code needed - Adobe handles this.

## Future Enhancements

1. **SelectedFacets Slot** (Show active filters)
   ```javascript
   SelectedFacets: (ctx) => {
     const { data } = ctx;
     const selectedContainer = document.createElement('div');
     selectedContainer.className = 'buildright-selected-facets';
     // ... render selected filter pills with clear buttons
     ctx.replaceWith(selectedContainer);
   }
   ```

2. **Custom Facet Icons** (Category icons, brand logos)
   ```javascript
   FacetBucketLabel: (ctx) => {
     const { data } = ctx;
     const label = document.createElement('span');
     if (data.icon) {
       const icon = document.createElement('img');
       icon.src = data.icon;
       label.appendChild(icon);
     }
     label.appendChild(document.createTextNode(data.title));
     ctx.replaceWith(label);
   }
   ```

3. **Loading/Validating States** (Match citisignal pattern)
   - Add spinner overlay when facets are updating
   - Dim facets during search operations

## Related Files

- **JavaScript**: `blocks/product-list-dropin/product-list-dropin.js` (lines 242-335)
- **CSS**: `blocks/product-list-dropin/product-list-dropin.css` (lines ~60-155)
- **Page**: `pages/catalog-dropin.html` (facets container div)
- **Reference**: `blocks/filters-sidebar/filters-sidebar.css` (original design)

## Documentation References

- [Adobe Facets Container Docs](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/product-discovery/containers/facets/)
- [Dropin Slots Inventory](../reference/dropin-slots-inventory.md)
- [Product List Dropin Canonical](../archive/product-list-dropin-canonical.md)

---

**Next Step**: Test on `/catalog-dropin` to verify facets render and function correctly.

