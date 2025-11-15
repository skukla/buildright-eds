# AEM Edge Delivery Services Routing Configuration

## Overview

The BuildRight demo has been migrated from parameter-driven URLs to path-based URLs for better compatibility with AEM Edge Delivery Services, improved caching, and enhanced SEO.

## URL Structure

### Before (Query Parameters)
```
/pages/catalog.html?category=structural
/pages/project-builder.html?projectType=remodel
```

### After (Path-Based)
```
/catalog/structural-materials
/project-builder/remodel
```

## AEM EDS Integration

### 1. Folder Structure

For full AEM EDS compatibility, you should create the following folder structure in your AEM content repository:

```
/
├── catalog/
│   ├── index.html (All Products)
│   ├── structural-materials/
│   │   └── index.html
│   ├── windows-doors/
│   │   └── index.html
│   ├── fasteners-hardware/
│   │   └── index.html
│   ├── roofing/
│   │   └── index.html
│   ├── framing-drywall/
│   │   └── index.html
│   ├── commercial/
│   │   └── index.html
│   ├── residential/
│   │   └── index.html
│   └── pro/
│       └── index.html
└── project-builder/
    ├── index.html
    ├── new-construction/
    │   └── index.html
    ├── remodel/
    │   └── index.html
    └── repair/
        └── index.html
```

### 2. Block Templating

For dynamic content, you can use AEM EDS block templating:

1. Create a `catalog-template` block that accepts a category parameter
2. Use the category from the URL path to filter products
3. Each category folder can use the same template with different metadata

### 3. Redirects

Place the `redirects.xlsx` file in your AEM content repository root. AEM EDS will automatically handle 301 redirects from old URLs to new URLs.

### 4. Metadata Configuration

For each category page, add appropriate metadata in your document:

```markdown
---
title: Structural Materials - BuildRight Supply
description: Browse our selection of structural materials including lumber, beams, and more
category: structural_materials
template: catalog-template
---
```

## Client-Side Routing

The demo includes a JavaScript router (`scripts/url-router.js`) that:

1. Parses path-based URLs to extract category/type information
2. Provides utility functions for generating URLs
3. Handles legacy URL redirects for backward compatibility
4. Integrates with existing blocks (product-grid, header)

## Testing Locally

### Development Server

The included `.htaccess` file provides Apache mod_rewrite rules for local testing:

```bash
# Start a local PHP server (includes .htaccess support)
php -S localhost:8000

# Or use Apache with mod_rewrite enabled
```

### Node.js Development Server

Update `server.js` to handle path-based routing:

```javascript
app.get('/catalog/:category?', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'catalog.html'));
});

app.get('/project-builder/:projectType?/:projectDetail?', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'project-builder.html'));
});
```

## Migration Benefits

1. **SEO**: Clean, descriptive URLs are better for search engines
2. **Caching**: Path-based URLs are easier to cache at CDN level
3. **AEM EDS**: Native compatibility with AEM's content structure
4. **Analytics**: Easier to track page views by category/section
5. **User Experience**: More intuitive and shareable URLs

## Backward Compatibility

The implementation includes automatic redirects from old query-param URLs to new path-based URLs via:

1. Client-side redirect in `header.js` (immediate fallback)
2. Server-side redirects via `.htaccess` (Apache)
3. AEM EDS redirects via `redirects.xlsx`

All existing bookmarks and links will continue to work.

