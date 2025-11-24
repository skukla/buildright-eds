# Adobe Edge Delivery Services (EDS) Migration Guide

## Overview

This guide documents the migration of BuildRight from a traditional multi-page website to an Adobe EDS-compliant architecture, based on the [Adobe Commerce EDS boilerplate](https://github.com/demo-system-stores/accs-citisignal).

## What Changed

### ✅ EDS-Compliant Files Created

1. **`scripts/scripts.js`** - Main entry point (EDS standard)
   - Replaces `scripts/app.js` and `scripts/base-url.js`
   - Handles page initialization (`loadEager`, `loadLazy`, `loadDelayed`)
   - Dynamic header/footer loading
   - Base path setup for GitHub Pages compatibility

2. **`styles/styles.css`** - Main stylesheet entry point (EDS standard)
   - Imports existing styles (`base.css`, `components.css`, `utilities.css`)
   - Adds EDS page reveal animations
   - Maintains all existing design tokens

3. **`head.html`** - Document head template (EDS standard)
   - Minimal head configuration
   - Loaded by EDS for all pages

4. **`index-eds.html`** - Example EDS-compliant page
   - Minimal HTML structure
   - Empty `<header>` and `<footer>` tags
   - Content in `<main>` with sections
   - No duplicated header/footer HTML

### ✅ What Stays the Same

Your **`blocks/` directory is already EDS-compatible!** No changes needed:

- ✅ Each block has `decorate(block)` function
- ✅ Blocks use `.html`, `.css`, `.js` structure
- ✅ Block export default functions
- ✅ Separation of concerns maintained

### ❌ Current Pages Need Refactoring

All pages in `/pages/` currently have:
- Duplicated header HTML (500+ lines)
- Duplicated footer HTML (100+ lines)
- Inline base path scripts
- Inline body class scripts

**EDS Pattern:** Pages should be minimal with dynamic loading.

## EDS Page Structure

### Before (Current)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Page</title>
  <link rel="stylesheet" href="../styles/base.css">
  <link rel="stylesheet" href="../styles/components.css">
  <script>
    // Inline base path setup
    (function() { ... })();
  </script>
</head>
<body>
  <!-- 500+ lines of header HTML copy-pasted -->
  <div class="header">...</div>
  
  <!-- Page content -->
  <div class="container">...</div>
  
  <!-- 100+ lines of footer HTML copy-pasted -->
  <footer class="site-footer">...</footer>
  
  <script type="module" src="../scripts/app.js"></script>
</body>
</html>
```

### After (EDS)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <script src="../scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="../styles/styles.css">
</head>
<body>
  <!-- Empty - header loaded dynamically -->
  <header></header>

  <!-- Page-specific content only -->
  <main>
    <div class="section">
      <div class="product-grid" data-block-name="product-grid" data-block-status="loading">
        <!-- Block content -->
      </div>
    </div>
  </main>

  <!-- Empty - footer loaded dynamically -->
  <footer></footer>
</body>
</html>
```

## How Dynamic Loading Works

### scripts/scripts.js Flow

```javascript
loadPage()
  ↓
loadEager()           // Critical path
  ├── setupBasePath()      // Sets <base> tag
  ├── setupBodyClasses()   // Adds page-catalog, etc.
  └── decorateMain()       // Finds and decorates blocks
  ↓
loadLazy()            // After LCP
  ├── loadBlocks()         // Decorates blocks in main
  ├── loadHeader()         // Fetches blocks/header/header.html
  └── loadFooter()         // Fetches blocks/footer/footer.html
  ↓
loadDelayed()         // After 3 seconds
  └── Analytics, tracking, etc.
```

### Block Loading Pattern

```javascript
export async function loadHeader(header) {
  // 1. Fetch HTML from blocks/header/header.html
  const response = await fetch(`${basePath}blocks/header/header.html`);
  const html = await response.text();
  
  // 2. Parse and create block element
  const block = document.createElement('div');
  block.className = 'header';
  block.dataset.blockName = 'header';
  block.innerHTML = html;
  
  // 3. Inject into page
  header.appendChild(block);
  
  // 4. Decorate (loads CSS + JS, runs decorate function)
  await decorateBlock(block);
}
```

## Migration Steps

### Phase 1: Test EDS Structure (Current)

1. ✅ **Created `scripts/scripts.js`** - EDS entry point
2. ✅ **Created `styles/styles.css`** - EDS stylesheet entry
3. ✅ **Created `head.html`** - EDS head template
4. ✅ **Created `index-eds.html`** - Example minimal page

**Test it:**
```bash
# Start server
npm start

# Visit http://localhost:8000/index-eds.html
# Header and footer should load dynamically
```

### Phase 2: Migrate Pages (Next)

Refactor each page in `/pages/` to minimal structure:

#### Example: Catalog Page

**Before:** `pages/catalog.html` (600+ lines with duplicated header/footer)

**After:** `pages/catalog-eds.html` (minimal)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Catalog - BuildRight Solutions</title>
  <script src="../scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="../styles/styles.css">
</head>
<body>
  <header></header>
  <main>
    <div class="section">
      <div class="product-grid" data-block-name="product-grid" data-block-status="loading"></div>
    </div>
  </main>
  <footer></footer>
</body>
</html>
```

### Phase 3: Update Remaining Scripts

1. **Merge `cart-manager.js` initialization** into `scripts/scripts.js`
2. **Remove `base-url.js`** (functionality moved to scripts.js)
3. **Update `app.js` references** to `scripts.js`

### Phase 4: Clean Up

1. Delete old page files (after testing EDS versions)
2. Rename EDS files to replace old ones
3. Update documentation

## Benefits of EDS Structure

### 1. **DRY Principle** ✅
- Header/footer defined once in `blocks/`
- Changes propagate to all pages automatically

### 2. **Performance** ✅
- Progressive loading (Eager → Lazy → Delayed)
- Optimized for Lighthouse scores
- Reduces initial page weight

### 3. **Maintainability** ✅
- Update header once → all pages updated
- Clear separation of concerns
- Easier to debug

### 4. **EDS Migration Ready** ✅
- Blocks already compatible
- Page structure follows EDS patterns
- When migrating to document authoring, you can keep blocks as-is

## File Mapping

| Current File | EDS Equivalent | Status |
|--------------|----------------|--------|
| `scripts/app.js` | `scripts/scripts.js` | ✅ Created |
| `scripts/base-url.js` | Merged into `scripts.js` | ✅ Obsolete |
| `styles/base.css` | Imported by `styles/styles.css` | ✅ Keep |
| `styles/components.css` | Imported by `styles/styles.css` | ✅ Keep |
| `index.html` | `index-eds.html` | ✅ Example created |
| `pages/*.html` | Need refactoring | ⏳ Next phase |
| `blocks/*` | No changes needed | ✅ Already compliant |

## Testing Checklist

- [ ] Test `index-eds.html` - header/footer load dynamically
- [ ] Test navigation - clicking links works
- [ ] Test cart functionality - add to cart, mini-cart
- [ ] Test product grid - products load and filter
- [ ] Test project builder - wizard works
- [ ] Test login/logout - authentication flows
- [ ] Test GitHub Pages deployment - base paths resolve correctly

## Next Steps

1. **Review and test** the EDS example page (`index-eds.html`)
2. **Validate** header/footer loading works correctly
3. **Migrate one page at a time** (start with simple pages)
4. **Update block imports** if any blocks depend on old structure
5. **Document any custom patterns** specific to BuildRight

## Reference Links

- [Adobe Commerce EDS Boilerplate](https://github.com/demo-system-stores/accs-citisignal)
- [EDS Documentation](https://experienceleague.adobe.com/developer/commerce/storefront/)
- [BuildRight EDS Routing](./aem-eds-routing.md)

## Questions?

- Check existing blocks - they're already EDS-ready!
- Header/footer HTML should never be in pages - only in `blocks/`
- All pages should import `scripts/scripts.js`, not `scripts/app.js`
- Base path is set automatically - no inline scripts needed

---

**Migration Progress:** Phase 1 Complete ✅

**Next:** Test `index-eds.html` and migrate catalog page


