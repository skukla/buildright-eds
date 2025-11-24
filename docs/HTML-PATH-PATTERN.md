# HTML Path Pattern Guide

## ⚠️ CRITICAL RULE: Always Use Relative Paths in HTML

**Why?** GitHub Pages deploys to `/buildright-eds/` subdirectory, but `<link>` and `<script>` tags in `<head>` are processed **before** JavaScript can set `window.BASE_PATH`.

---

## ✅ CORRECT Pattern

### Root-Level Pages (`index.html`)
```html
<head>
  <script src="./scripts/critical-init.js"></script>
  <link rel="stylesheet" href="./styles/styles.css">
  <link rel="stylesheet" href="./blocks/header/header.css">
</head>
```

### Subdirectory Pages (`pages/*.html`)
```html
<head>
  <script src="../scripts/critical-init.js"></script>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../blocks/product-detail/product-detail.css">
  <script src="../scripts/scripts.js" type="module"></script>
</head>
```

### Dynamic Paths (JavaScript)
```javascript
// ✅ Use path utilities for runtime paths
import { resolvePath, resolveImagePath } from '../../scripts/utils.js';

const imgUrl = resolveImagePath(product.image);
const fragmentUrl = resolvePath('/fragments/hero');
```

---

## ❌ NEVER Do This

```html
<!-- ❌ WRONG: Absolute paths won't work on GitHub Pages -->
<link rel="stylesheet" href="/styles/styles.css">
<script src="/scripts/scripts.js"></script>

<!-- ❌ WRONG: These need BASE_PATH which isn't available yet -->
<img src="/images/logo.png">
<a href="/pages/catalog.html">
```

---

## Validation Checklist

When creating or editing HTML files:

- [ ] All `<link>` tags use relative paths (`./` or `../`)
- [ ] All `<script>` tags in `<head>` use relative paths
- [ ] Critical init always loads first: `<script src="../scripts/critical-init.js"></script>`
- [ ] Dynamic content (images, AJAX) uses `resolvePath()` utilities
- [ ] Test on both localhost:8000 AND GitHub Pages

---

## Why This Pattern Works

### Localhost (Development)
```
Path: /pages/catalog.html
CSS:  ../styles/styles.css → /styles/styles.css ✅
```

### GitHub Pages (Production)
```
Path: /buildright-eds/pages/catalog.html
CSS:  ../styles/styles.css → /buildright-eds/styles/styles.css ✅
```

### What Breaks It
```html
<!-- Absolute path -->
<link href="/styles/styles.css">

Localhost:     /styles/styles.css ✅
GitHub Pages:  /styles/styles.css ❌ (should be /buildright-eds/styles/styles.css)
```

---

## File-by-File Reference

| File | Path Pattern | Example |
|------|-------------|---------|
| `index.html` | `./path/` | `<link href="./styles/styles.css">` |
| `pages/*.html` | `../path/` | `<link href="../styles/styles.css">` |
| JavaScript | Use utils | `resolvePath('/fragments/hero')` |
| CSS | Relative | `background: url('../images/bg.png')` |

---

## Common Mistakes

### 1. Copy/Paste from index.html
```html
<!-- index.html uses ./ -->
<link href="./styles/styles.css">

<!-- pages/*.html needs ../ -->
<link href="../styles/styles.css">  ← Remember to change!
```

### 2. Forgetting critical-init.js
```html
<!-- ❌ WRONG: scripts.js loads before BASE_PATH is set -->
<script src="../scripts/scripts.js"></script>
<script src="../scripts/critical-init.js"></script>

<!-- ✅ CORRECT: critical-init.js MUST load first -->
<script src="../scripts/critical-init.js"></script>
<script src="../scripts/scripts.js"></script>
```

### 3. Mixing Patterns
```html
<!-- ❌ WRONG: Inconsistent -->
<link href="../styles/styles.css">
<link href="/blocks/header/header.css">

<!-- ✅ CORRECT: All relative -->
<link href="../styles/styles.css">
<link href="../blocks/header/header.css">
```

---

## Automated Validation

Run this before committing:

```bash
npm run validate-paths
```

This checks:
- No absolute paths in HTML `<head>` sections
- critical-init.js loads first
- Relative paths match file depth

---

## Migration to Production EDS

On production EDS, absolute paths will work because:
- No subdirectory deployment
- Server-side rendering handles paths

But **keep relative paths anyway** because:
- ✅ Works in all environments
- ✅ No migration needed
- ✅ More portable code

