# Templates & Orders Table Consolidation

**Date**: December 5, 2025  
**Status**: ✅ Complete

## Overview

Converted the "My Templates" section to use the same **orders table** format as the Orders section, replacing the previous simple-list-table pattern. Both sections now use the same visual pattern and table structure, creating consistency while keeping them as separate, focused sections.

## Rationale

The templates list and orders list were functionally very similar:
- Both show historical/saved items
- Both allow users to review and revisit past work
- Both have similar data structures (date, ID, items, status, actions)

Rather than maintaining two different UI patterns (simple-list vs. orders table), we standardized on the **orders table** as the canonical pattern for all historical data.

## Changes Made

### 1. Repurposed Templates Section

**File**: `pages/account.html`

- ✅ **Kept**: "My Templates" section for Sarah
- ✅ **Replaced**: Simple-list table with orders table format
- ✅ **Kept**: "Start New Build" and "Upload New Template" action buttons
- ✅ **Added**: `loadTemplates()` function to populate templates table
- ✅ **Kept**: Templates navigation item in sidebar
- ✅ **Kept**: "My Templates" quick action card

### 2. Standardized Orders Section

**File**: `pages/account.html`

- ✅ **Kept**: "Order History" section title
- ✅ **Added**: Dynamic orders table with JavaScript loading
- ✅ **Added**: `loadOrders()` function for regular orders only
- ✅ **Added**: Shared `renderOrdersTable()` function used by both sections

### 3. Template Data Structure

Templates are now represented as orders with:
- `type: 'template'` - Identifies it as a template vs. regular order
- `status: 'Template'` - Visual badge showing it's a template
- `projectName` - The floor plan name (e.g., "The Phoenix")
- `templateDetails` - Additional metadata (sqft, beds, baths)
- `orderID` - Format: `TPL-2024-001`

**Sample Template Data**:
```javascript
{
  orderID: 'TPL-2024-001',
  timestamp: '2024-12-03T00:00:00.000Z',
  projectName: 'The Phoenix',
  itemCount: 847,
  total: 234567.89,
  status: 'Template',
  type: 'template',
  templateDetails: '2,950 sq ft • 4 bed • 2.5 bath'
}
```

### 4. Orders Table Styling

**File**: `styles/dashboards/account-dashboard.css`

- ✅ **Added**: Complete orders table styles matching `order-history.html` pattern
- ✅ **Added**: Template-specific status badge styling (blue background)
- ✅ **Added**: Support for project names and template details in table cells
- ✅ **Added**: Responsive mobile layout for orders table
- ✅ **Added**: Templates action buttons styling
- ❌ **Removed**: Old simple-list-table CSS (no longer needed)

**Key Styles**:
- `.order-status.template` - Blue badge for template status
- `.order-project-name` - Bold project name display
- `.order-template-details` - Metadata (sqft/beds/baths)
- Responsive: Stacked card layout on mobile

### 5. Navigation Updates

**For Sarah** (persona with templates feature):
- **Sidebar**: "My Templates" nav item (kept)
- **Quick Action**: "My Templates" card linking to `#templates` section (kept)

**For All Users**:
- **Sidebar**: "Orders" nav item (standard)
- **Quick Action**: "Orders" card linking to `#orders` section

## User Experience Flow

### For Sarah (Production Builder)

1. **Navigation**:
   - Dashboard (default)
   - Profile
   - Orders → View order history
   - **My Templates** → View saved build templates ✨
   - Store Locations
   
2. **My Templates Section**:
   - Action buttons: "Start New Build" | "Upload New Template"
   - Orders table showing only templates
   - Blue "Template" badge on each row
   - Templates show: Project name + floor plan details (sqft, beds, baths)
   - Actions per template: "View BOM" | "Edit Build"
   
3. **Orders Section**:
   - Orders table showing only completed orders
   - Actions per order: "View Details" | "Reorder"

### For Other Personas

1. **Navigation**:
   - Dashboard (default)
   - Profile
   - Orders → View order history
   - Store Locations (if applicable)
   
2. **Orders Section**:
   - Sees only completed orders
   - No templates section
   - Actions: "View Details" | "Reorder"

## Benefits

✅ **Visual Consistency**: Same table pattern for both templates and orders  
✅ **Separation of Concerns**: Templates and orders are distinct sections  
✅ **Familiar Pattern**: Reuses established orders table from `order-history.html`  
✅ **Scalable**: Easy to add new data types using the same table structure  
✅ **Less Code**: Single table pattern replaces custom simple-list pattern  
✅ **Better UX**: Sarah has dedicated section for her templates workflow

## Technical Notes

- `renderOrdersTable()` is a shared function used by both `loadTemplates()` and `loadOrders()`
- Templates are currently hardcoded for Sarah's persona
- Orders are loaded from `localStorage.buildright_orders`
- Both sections use identical table markup and styling
- Tables are fully responsive with mobile-first card layout
- Status badges are extensible (template, completed, pending, etc.)
- Templates only show for Sarah (`persona?.features?.templates`)

## Files Modified

1. `/pages/account.html` - Repurposed templates section to use orders table
2. `/styles/dashboards/account-dashboard.css` - Added orders table styles, removed simple-list styles

## Testing Checklist

- [ ] Sarah sees "My Templates" in sidebar navigation
- [ ] Templates section shows 3 templates in orders table format
- [ ] Templates have blue "Template" badges
- [ ] Template rows show project name and floor plan details
- [ ] Template actions: "View BOM" and "Edit Build" buttons work
- [ ] Action buttons: "Start New Build" and "Upload New Template"
- [ ] Orders section shows only regular orders (empty for new users)
- [ ] Orders and templates are in separate sections
- [ ] No console errors
- [ ] Responsive layout works on mobile
- [ ] Other personas don't see templates section

## Next Steps

Consider:
- [ ] Persist template data in localStorage instead of hardcoding
- [ ] Add filtering/sorting within each table
- [ ] Add search functionality to tables
- [ ] Add order/template details modal
- [ ] Add "Draft" status for in-progress builds
- [ ] Allow deleting/archiving templates

