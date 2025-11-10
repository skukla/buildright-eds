# URL Structure Migration: Query Params to Path-Based

## Overview
Migrating from parameter-driven URLs to path-based URLs for better AEM EDS compatibility, caching, and SEO.

## URL Mappings

### Catalog URLs

| Old URL (Query Params) | New URL (Path-Based) | Description |
|------------------------|----------------------|-------------|
| `/pages/catalog.html` | `/catalog` | All products |
| `/pages/catalog.html?category=all` | `/catalog` | All products (explicit) |
| `/pages/catalog.html?category=structural` | `/catalog/structural-materials` | Structural materials category |
| `/pages/catalog.html?category=windows` | `/catalog/windows-doors` | Windows & doors category |
| `/pages/catalog.html?category=fasteners` | `/catalog/fasteners-hardware` | Fasteners & hardware category |
| `/pages/catalog.html?category=roofing` | `/catalog/roofing` | Roofing category |
| `/pages/catalog.html?category=framing_drywall` | `/catalog/framing-drywall` | Framing & drywall category |
| `/pages/catalog.html?division=commercial` | `/catalog/commercial` | Commercial division |
| `/pages/catalog.html?division=residential` | `/catalog/residential` | Residential division |
| `/pages/catalog.html?division=pro` | `/catalog/pro` | Pro division |

### Project Builder URLs

| Old URL (Query Params) | New URL (Path-Based) | Description |
|------------------------|----------------------|-------------|
| `/pages/project-builder.html` | `/project-builder` | Project builder home |
| `/pages/project-builder.html?projectType=new_construction` | `/project-builder/new-construction` | New construction projects |
| `/pages/project-builder.html?projectType=remodel` | `/project-builder/remodel` | Remodel projects |
| `/pages/project-builder.html?projectType=repair` | `/project-builder/repair` | Repair projects |
| `/pages/project-builder.html?projectType=X&projectDetail=Y` | `/project-builder/X/Y` | Specific project with details |

### Category Code Mapping

| Internal Code | URL Slug | Display Name |
|--------------|----------|--------------|
| `structural` | `structural-materials` | Structural Materials |
| `windows` | `windows-doors` | Windows & Doors |
| `fasteners` | `fasteners-hardware` | Fasteners & Hardware |
| `roofing` | `roofing` | Roofing |
| `framing_drywall` | `framing-drywall` | Framing & Drywall |
| `all` | (omit - use `/catalog`) | All Products |

## Implementation Strategy

1. **Phase 1**: Create URL router and mapping utilities
2. **Phase 2**: Update page scripts to read from path
3. **Phase 3**: Update all internal links
4. **Phase 4**: Update navigation active state detection
5. **Phase 5**: Add redirects from old URLs
6. **Phase 6**: Test all routes

## Technical Notes

- Old URLs will redirect to new URLs for backwards compatibility
- Path segments use kebab-case (lowercase with hyphens)
- Root `/catalog` represents "all products"
- Subfolders represent categories or divisions

