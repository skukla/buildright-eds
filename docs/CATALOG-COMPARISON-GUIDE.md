# Catalog Page Comparison Guide

**Date**: December 20, 2025  
**Purpose**: Side-by-side comparison of two Product Listing Page approaches

---

## 📄 The Two Pages

### 1. **Original Implementation** (`/catalog`)
**Path**: `http://localhost:8000/catalog`

**Architecture:**
```
Frontend → BuildRight_productSearchFilter (mesh resolver) → ACO
```

**Features:**
- ✅ Custom product-grid block (BuildRight design)
- ✅ Custom filters-sidebar block
- ✅ Server-side transformations in mesh
- ✅ 100% design control
- ❌ You maintain search logic
- ❌ You maintain URL sync
- ❌ You maintain state management

**Files:**
- `/pages/catalog.html`
- `/blocks/product-grid/product-grid.js`
- `/blocks/filters-sidebar/filters-sidebar.js`

---

### 2. **Level 2 Dropin Implementation** (`/catalog-dropin`)
**Path**: `http://localhost:8000/catalog-dropin`

**Architecture:**
```
Frontend → Product Discovery Dropin (with custom slots) → ACO
```

**Features:**
- ✅ SearchResults dropin with ALL slots customized
- ✅ Facets, SortBy, Pagination dropins
- ✅ Adobe maintains search logic
- ✅ Adobe maintains URL sync
- ✅ Adobe maintains state management
- ⚠️ 85-90% design control (constrained by dropin grid structure)

**Files:**
- `/pages/catalog-dropin.html`
- `/blocks/product-list-dropin-v2/product-list-dropin-v2.js`
- `/blocks/product-list-dropin-v2/product-list-dropin-v2.css`

---

## 🔍 What to Compare

### **Visual Design**
- [ ] Product card layout (image, name, price, stock, buttons)
- [ ] Grid spacing and responsiveness
- [ ] Typography and colors
- [ ] Hover effects and animations
- [ ] Mobile layout

### **Functionality**
- [ ] Product search (type in search bar)
- [ ] Facet filtering (click categories, price ranges)
- [ ] Sorting (price, name)
- [ ] Pagination/infinite scroll
- [ ] URL sync (refresh page, back button)
- [ ] Loading states

### **Performance**
- [ ] Initial page load speed
- [ ] Filter response time
- [ ] Scroll performance
- [ ] Network requests

### **Developer Experience**
- [ ] Code complexity (lines of code)
- [ ] Maintainability
- [ ] Debugging ease
- [ ] Extensibility

---

## 📊 Expected Differences

| Aspect | `/catalog` (Original) | `/catalog-dropin` (Level 2) |
|--------|----------------------|----------------------------|
| **Grid Structure** | Custom CSS Grid | Dropin's grid (overridden) |
| **Product Cards** | Custom HTML/CSS | Custom slots (BuildRight HTML) |
| **Facets** | Custom component | Dropin component |
| **URL Sync** | Manual (custom code) | Automatic (dropin) |
| **State Management** | Custom events | Dropin events |
| **Code Complexity** | ~800 lines | ~300 lines |
| **Design Match** | 100% | 85-90% |

---

## ✅ Testing Checklist

### **Load Both Pages**
```bash
# Ensure server is running
npm start

# Open in browser:
# http://localhost:8000/catalog
# http://localhost:8000/catalog-dropin
```

### **Test Scenarios**

1. **Initial Load**
   - [ ] Both pages load without errors
   - [ ] Products display correctly
   - [ ] Images load (fallback works for missing images)
   - [ ] Prices display with persona pricing

2. **Search**
   - [ ] Type "lumber" in search box
   - [ ] Products filter in real-time
   - [ ] Clear search works

3. **Facets**
   - [ ] Click "Structural Materials" category
   - [ ] Products filter correctly
   - [ ] Select price range
   - [ ] Multiple filters work together

4. **Sorting**
   - [ ] Sort by Price: Low to High
   - [ ] Sort by Name: A to Z
   - [ ] Products re-order correctly

5. **Pagination**
   - [ ] Scroll to bottom (original has infinite scroll)
   - [ ] Click next page (dropin has pagination)
   - [ ] More products load

6. **URL Sync**
   - [ ] Apply filters
   - [ ] Refresh page
   - [ ] Filters persist
   - [ ] Browser back button works

7. **Mobile**
   - [ ] Resize to mobile (< 768px)
   - [ ] Grid adjusts to 2 columns
   - [ ] Filters work on mobile
   - [ ] Touch interactions work

---

## 🎯 Decision Criteria

After testing, consider:

### **Choose `/catalog` (Original) if:**
- ✅ Design match is critical (100% control needed)
- ✅ You want server-side transformations
- ✅ You're comfortable maintaining search logic
- ✅ Custom UX patterns are important

### **Choose `/catalog-dropin` (Level 2) if:**
- ✅ Adobe-maintained logic is valuable
- ✅ 85-90% design match is acceptable
- ✅ Less frontend code is preferred
- ✅ Automatic URL sync is important
- ✅ Future dropin updates are beneficial

---

## 📝 Evaluation Template

Fill this out after testing:

```
=== VISUAL DESIGN ===
Dropin design match: ___% (your estimate)
Major differences: _______________________
Deal-breakers: ___________________________

=== FUNCTIONALITY ===
Dropin features that work better: _________
Original features that work better: _______
Missing features: ________________________

=== DEVELOPER EXPERIENCE ===
Preferred codebase: ______________________
Easier to maintain: ______________________
Easier to extend: ________________________

=== FINAL DECISION ===
Recommended approach: ____________________
Reasoning: _______________________________
```

---

## 🚀 Next Steps Based on Decision

### **If Choosing Original:**
- Keep `/catalog` as is
- Remove `/catalog-dropin` (or keep for reference)
- Consider using dropin API functions (Level 3) if you want Adobe's algorithms

### **If Choosing Dropin:**
- Replace `/catalog` with dropin implementation
- Archive old `product-grid.js` for reference
- Continue customizing slots to close design gap
- Monitor dropin updates from Adobe

### **If Unsure:**
- Keep both pages temporarily
- Collect feedback from stakeholders
- Test with real users
- Monitor performance metrics

---

## 📞 Questions to Answer

1. **Is 85-90% design match acceptable?**
   - What specific design elements MUST be exact?
   - What can be slightly different?

2. **Is Adobe-maintained logic valuable?**
   - How often do you change search logic?
   - Do you trust Adobe's updates?

3. **What's more important: control or convenience?**
   - Full control (100% design) vs. Less maintenance (dropin)

4. **How often will this need updates?**
   - Frequent updates → Keep custom (easier to change)
   - Infrequent updates → Use dropin (less to maintain)

---

## 🔗 Resources

- **Dropin Docs**: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/
- **Slot Customization**: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/slots
- **Product Discovery API**: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/product-discovery/

---

**Ready to test?** Open both pages and start comparing! 🎨

