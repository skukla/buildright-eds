# Fragment Block

## ⚠️ PROTOTYPE MODE ONLY

**This entire directory should be DELETED when migrating to production Adobe Edge Delivery Services.**

---

## Purpose

This block decorator mimics Adobe EDS server-side fragment processing on the client-side for:
- **Local development** (localhost:8000)
- **GitHub Pages demos** (github.io)

## What It Does

1. Reads fragment paths from block markup
2. Fetches fragment HTML files (`.html` for prototype, `.plain.html` for EDS)
3. Injects content into the page
4. Decorates any blocks within fragments

## HTML Markup

```html
<!-- This markup is IDENTICAL in prototype and production -->
<div class="fragment" data-block-name="fragment">
  <div>/fragments/hero-default</div>
</div>
```

## Migration to Production EDS

### Step 1: Delete This Directory
```bash
rm -rf blocks/fragment/
```

### Step 2: Nothing Else!
- HTML markup stays the same ✅
- EDS processes fragments server-side automatically ✅
- No code changes needed ✅

---

## Why This Pattern?

**In Prototype (Now):**
- Browser receives: `<div class="fragment"><div>/fragments/hero-default</div></div>`
- Decorator fetches fragment client-side
- Decorator injects content

**In Production EDS (Later):**
- EDS server fetches fragment from Google Docs/SharePoint
- EDS server injects content before sending HTML
- Browser receives fully-assembled page
- Decorator not executed (directory deleted)

**Result:** Zero HTML changes during migration! 🎯

---

## Environment Detection

The decorator automatically detects the environment:

```javascript
const isPrototypeMode = 
  window.location.hostname === 'localhost' 
  || window.location.hostname === '127.0.0.1'
  || window.location.hostname.includes('github.io');

const extension = isPrototypeMode ? '.html' : '.plain.html';
```

This ensures compatibility if you deploy to a staging environment before deleting the decorator.

