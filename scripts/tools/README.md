# Build Tools

This directory contains **build-time only** scripts that should **NOT** be served to production.

## Scripts:

### `build.js`
Block injection build script for EDS preparation. Injects reusable blocks into HTML files at build time.

**Usage:** Run at build time to process HTML templates.

### `generate-mock-data.js`
Generates mock product data for development and testing.

**Usage:** `node scripts/tools/generate-mock-data.js`

### `generate-product-images.js`
Generates product images for the catalog.

**Usage:** `node scripts/tools/generate-product-images.js`

### `download-product-images.js`
Downloads product images from external sources.

**Usage:** `node scripts/tools/download-product-images.js`

### `update-product-images.js`
Updates product image references in the codebase.

**Usage:** `node scripts/tools/update-product-images.js`

---

## Important Notes:

- ⚠️ **These scripts are NOT for production deployment**
- They use Node.js APIs (fs, path, etc.) and will not run in browsers
- Run these during development or build process only
- Do not import these in any client-side JavaScript

---

## Server Configuration:

If using a web server, ensure this directory is **not served** to clients:

**Nginx example:**
```nginx
location /scripts/tools/ {
    deny all;
    return 404;
}
```

**Apache example:**
```apache
<Directory "/path/to/scripts/tools">
    Require all denied
</Directory>
```

