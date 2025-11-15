# Phase 2: Design System & Icons

## Overview

**Duration**: 1 week  
**Dependencies**: Phase 0 (architecture decisions)  
**Status**: Not Started

Create professional custom SVG icons and formalize design system usage. Remove all emoji icons and replace with professional, accessible SVG graphics.

---

## Objectives

1. Create ~40 custom SVG icons
2. Document icon library
3. Formalize design system guidelines
4. Create icon usage patterns
5. Establish icon export standards

---

## Task 1: Icon Inventory & Design

### 1.1 Icon Categories

**Total Icons**: ~40

#### Dashboard Icons (5 icons)
- `icon-template` - Floor plan/template (for Sarah)
- `icon-project` - Project folder (for Marcus)
- `icon-package` - Package/bundle (for Lisa)
- `icon-restock` - Inventory/restock (for Kevin)
- `icon-analytics` - Charts/stats (general)

#### Wizard Progress Icons (5 icons)
- `icon-checkmark-circle` - Completed step
- `icon-circle-outline` - Pending step
- `icon-circle-filled` - Active step
- `icon-arrow-right` - Next/forward
- `icon-arrow-left` - Back/previous

#### Product/Commerce Icons (5 icons)
- `icon-cart` - Shopping cart
- `icon-inventory-check` - In stock
- `icon-inventory-warning` - Low stock
- `icon-inventory-error` - Out of stock
- `icon-price-tag` - Pricing

#### Construction/Building Icons (5 icons)
- `icon-foundation` - Foundation phase
- `icon-framing` - Framing phase
- `icon-envelope` - Building envelope
- `icon-interior` - Interior finish
- `icon-blueprint` - Floor plan

#### Deck Builder Icons (5 icons)
- `icon-deck-shape-rect` - Rectangular deck
- `icon-deck-shape-l` - L-shaped deck
- `icon-deck-material-wood` - Wood decking
- `icon-deck-material-composite` - Composite decking
- `icon-deck-railing` - Railing system

#### Remodeling Icons (5 icons)
- `icon-bathroom` - Bathroom
- `icon-kitchen` - Kitchen
- `icon-fixtures` - Fixtures
- `icon-surfaces` - Surfaces/tile
- `icon-finishes` - Finishes/paint

#### General UI Icons (10 icons)
- `icon-user` - User profile
- `icon-logout` - Logout
- `icon-settings` - Settings
- `icon-help` - Help/info
- `icon-search` - Search
- `icon-filter` - Filter
- `icon-edit` - Edit
- `icon-delete` - Delete/remove
- `icon-add` - Add/plus
- `icon-close` - Close/X

---

### 1.2 Icon Design Specifications

**Format**: SVG  
**Base Size**: 24x24px  
**Style**: Line icons with consistent stroke width  
**Stroke Width**: 2px  
**Color**: Monochrome (inherits from CSS)  
**Corners**: Rounded (consistent with brand)  
**Export**: Clean SVG, minimal paths

**Design Principles**:
- Simple, recognizable shapes
- Consistent visual weight across all icons
- Professional, not playful
- Accessible (clear at small sizes)
- Align to pixel grid for crispness

---

### 1.3 Icon Creation Options

**Option 1: Design Custom Icons**
- Use Figma, Sketch, or Adobe Illustrator
- Export as optimized SVG
- Ensure consistency across set

**Option 2: Use Icon Library**
- Source from professional library (Lucide, Heroicons, etc.)
- Customize to match brand
- Ensure license allows commercial use

**Option 3: Hybrid Approach**
- Use library for generic icons (cart, user, etc.)
- Design custom icons for domain-specific needs (deck shapes, construction phases)

**Recommended**: Option 3 (Hybrid)

---

### 1.4 Icon File Organization

**Directory**: `icons/custom/`

**File Structure**:
```
icons/
├── custom/
│   ├── dashboard/
│   │   ├── icon-template.svg
│   │   ├── icon-project.svg
│   │   ├── icon-package.svg
│   │   ├── icon-restock.svg
│   │   └── icon-analytics.svg
│   ├── wizard/
│   │   ├── icon-checkmark-circle.svg
│   │   ├── icon-circle-outline.svg
│   │   ├── icon-circle-filled.svg
│   │   ├── icon-arrow-right.svg
│   │   └── icon-arrow-left.svg
│   ├── commerce/
│   │   ├── icon-cart.svg
│   │   ├── icon-inventory-check.svg
│   │   ├── icon-inventory-warning.svg
│   │   ├── icon-inventory-error.svg
│   │   └── icon-price-tag.svg
│   ├── construction/
│   │   ├── icon-foundation.svg
│   │   ├── icon-framing.svg
│   │   ├── icon-envelope.svg
│   │   ├── icon-interior.svg
│   │   └── icon-blueprint.svg
│   ├── deck/
│   │   ├── icon-deck-shape-rect.svg
│   │   ├── icon-deck-shape-l.svg
│   │   ├── icon-deck-material-wood.svg
│   │   ├── icon-deck-material-composite.svg
│   │   └── icon-deck-railing.svg
│   ├── remodeling/
│   │   ├── icon-bathroom.svg
│   │   ├── icon-kitchen.svg
│   │   ├── icon-fixtures.svg
│   │   ├── icon-surfaces.svg
│   │   └── icon-finishes.svg
│   └── ui/
│       ├── icon-user.svg
│       ├── icon-logout.svg
│       ├── icon-settings.svg
│       ├── icon-help.svg
│       ├── icon-search.svg
│       ├── icon-filter.svg
│       ├── icon-edit.svg
│       ├── icon-delete.svg
│       ├── icon-add.svg
│       └── icon-close.svg
└── icon-sprite.svg (optional: combined sprite)
```

**Deliverable**: Organized icon directory structure

---

## Task 2: Icon Implementation

### 2.1 SVG Optimization

**Tool**: SVGO (SVG Optimizer)

```bash
npm install -g svgo

# Optimize all icons
svgo -f icons/custom -r --config=svgo.config.js
```

**SVGO Config** (`svgo.config.js`):
```javascript
module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false, // Keep viewBox for scaling
          cleanupIDs: true,
          removeXMLNS: false // Keep xmlns for standalone SVG
        }
      }
    }
  ]
};
```

**Deliverable**: Optimized SVG files

---

### 2.2 Icon Sprite (Optional)

Create SVG sprite for all icons:

**File**: `icons/icon-sprite.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="icon-template" viewBox="0 0 24 24">
    <!-- icon paths -->
  </symbol>
  <symbol id="icon-project" viewBox="0 0 24 24">
    <!-- icon paths -->
  </symbol>
  <!-- ... all icons -->
</svg>
```

**Usage in HTML**:
```html
<svg class="icon" width="24" height="24">
  <use href="/icons/icon-sprite.svg#icon-template"></use>
</svg>
```

**Benefits**:
- Single HTTP request for all icons
- Easier caching
- Simpler icon updates

**Deliverable**: Icon sprite file (if using sprite approach)

---

### 2.3 Icon CSS Classes

**File**: `styles/icons.css`

```css
/* Base icon styles */
.icon {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 0;
}

/* Size variants */
.icon--small {
  width: 1rem;
  height: 1rem;
}

.icon--medium {
  width: 1.5rem;
  height: 1.5rem;
}

.icon--large {
  width: 2rem;
  height: 2rem;
}

.icon--xlarge {
  width: 3rem;
  height: 3rem;
}

/* Color variants (inherits from parent) */
.icon--brand {
  color: var(--color-brand-500);
}

.icon--accent {
  color: var(--color-accent-500);
}

.icon--positive {
  color: var(--color-positive-500);
}

.icon--warning {
  color: var(--color-warning-500);
}

.icon--negative {
  color: var(--color-negative-500);
}

.icon--neutral {
  color: var(--color-neutral-500);
}

/* State variants */
.icon--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon--interactive {
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon--interactive:hover {
  color: var(--color-brand-600);
}

/* Specific icon positioning */
.icon--inline {
  margin-right: 0.5rem;
}

.icon--suffix {
  margin-left: 0.5rem;
}
```

**Import in main stylesheet**:
```css
/* In styles/styles.css */
@import 'icons.css';
```

**Deliverable**: Icon CSS stylesheet

---

### 2.4 Icon Helper Function

**File**: `scripts/icon-helper.js`

```javascript
/**
 * Icon helper utilities for loading and displaying SVG icons
 */

const ICON_BASE_PATH = '/icons/custom';

/**
 * Load an icon SVG
 * @param {string} category - Icon category (dashboard, wizard, etc.)
 * @param {string} name - Icon name (without 'icon-' prefix or .svg extension)
 * @returns {Promise<string>} SVG content
 */
export async function loadIcon(category, name) {
  const iconName = name.startsWith('icon-') ? name : `icon-${name}`;
  const path = `${ICON_BASE_PATH}/${category}/${iconName}.svg`;
  
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Icon not found: ${path}`);
    return await response.text();
  } catch (error) {
    console.error('Failed to load icon:', error);
    return ''; // Return empty string on failure
  }
}

/**
 * Create an icon element
 * @param {string} category - Icon category
 * @param {string} name - Icon name
 * @param {string} size - Size class (small, medium, large, xlarge)
 * @param {string} color - Color class (brand, accent, positive, etc.)
 * @returns {HTMLElement} Icon element
 */
export function createIcon(category, name, size = 'medium', color = null) {
  const span = document.createElement('span');
  span.className = `icon icon--${size}`;
  if (color) span.classList.add(`icon--${color}`);
  span.dataset.icon = `${category}/${name}`;
  
  // Load SVG content
  loadIcon(category, name).then(svg => {
    span.innerHTML = svg;
  });
  
  return span;
}

/**
 * Replace emoji icons with SVG icons in DOM
 * @param {HTMLElement} container - Container element
 */
export function replaceEmojiIcons(container) {
  // Map common emojis to icon names
  const emojiMap = {
    '✓': { category: 'wizard', name: 'checkmark-circle' },
    '○': { category: 'wizard', name: 'circle-outline' },
    '●': { category: 'wizard', name: 'circle-filled' },
    '🏗️': { category: 'dashboard', name: 'project' },
    '📋': { category: 'dashboard', name: 'template' },
    '📦': { category: 'dashboard', name: 'package' },
    // ... add more mappings
  };
  
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const nodesToReplace = [];
  let node;
  
  while (node = walker.nextNode()) {
    Object.keys(emojiMap).forEach(emoji => {
      if (node.textContent.includes(emoji)) {
        nodesToReplace.push({ node, emoji });
      }
    });
  }
  
  nodesToReplace.forEach(({ node, emoji }) => {
    const { category, name } = emojiMap[emoji];
    const icon = createIcon(category, name);
    const newContent = node.textContent.replace(emoji, '');
    
    const span = document.createElement('span');
    span.appendChild(icon);
    span.appendChild(document.createTextNode(newContent));
    
    node.parentNode.replaceChild(span, node);
  });
}

/**
 * Preload all icons for faster rendering
 */
export async function preloadIcons() {
  // List of critical icons to preload
  const criticalIcons = [
    { category: 'wizard', name: 'checkmark-circle' },
    { category: 'wizard', name: 'circle-outline' },
    { category: 'commerce', name: 'cart' },
    { category: 'ui', name: 'user' },
    { category: 'ui', name: 'search' }
  ];
  
  await Promise.all(
    criticalIcons.map(({ category, name }) => loadIcon(category, name))
  );
}
```

**Deliverable**: Icon helper JavaScript module

---

## Task 3: Design System Documentation

### 3.1 Update Design System Guide

**File**: `docs/DESIGN-SYSTEM.md` (update or create)

Add icon usage guidelines to existing design system documentation.

**Content to Add**:

```markdown
## Icons

### Icon Library

BuildRight uses a custom icon library with ~40 professional SVG icons organized by category.

**Location**: `icons/custom/`

### Icon Usage

#### HTML (Inline SVG)

```html
<span class="icon icon--medium icon--brand">
  <svg><!-- SVG content --></svg>
</span>
```

#### JavaScript (Helper Function)

```javascript
import { createIcon } from './scripts/icon-helper.js';

const icon = createIcon('dashboard', 'template', 'large', 'brand');
container.appendChild(icon);
```

### Icon Sizes

- `icon--small` (16px) - Inline text, compact spaces
- `icon--medium` (24px) - Default, buttons, cards
- `icon--large` (32px) - Page headers, empty states
- `icon--xlarge` (48px) - Hero sections, major CTAs

### Icon Colors

Icons inherit color from parent or use explicit color classes:

- `icon--brand` - Brand blue (primary actions)
- `icon--accent` - Accent orange (secondary actions)
- `icon--positive` - Green (success, in-stock)
- `icon--warning` - Yellow (caution, low-stock)
- `icon--negative` - Red (error, out-of-stock)
- `icon--neutral` - Gray (informational)

### Accessibility

- Icons should have descriptive `aria-label` when used standalone
- Decorative icons should have `aria-hidden="true"`
- Icon buttons must include accessible text

```html
<!-- Standalone icon -->
<span class="icon" aria-label="Shopping cart">
  <svg><!-- cart icon --></svg>
</span>

<!-- Decorative icon -->
<span class="icon" aria-hidden="true">
  <svg><!-- icon --></svg>
</span>
<span class="sr-only">Cart</span>

<!-- Icon button -->
<button type="button" aria-label="Add to cart">
  <span class="icon" aria-hidden="true">
    <svg><!-- cart icon --></svg>
  </span>
</button>
```

### Icon Categories

See `docs/ICON-LIBRARY.md` for complete icon catalog.
```

**Deliverable**: Updated design system documentation

---

### 3.2 Create Icon Library Documentation

**File**: `docs/ICON-LIBRARY.md`

```markdown
# BuildRight Icon Library

Complete catalog of custom SVG icons.

## Dashboard Icons

| Icon | Filename | Usage | Personas |
|------|----------|-------|----------|
| 📐 | `icon-template.svg` | Floor plan templates | Sarah |
| 📁 | `icon-project.svg` | Project folders | Marcus |
| 📦 | `icon-package.svg` | Product packages | Lisa |
| 📊 | `icon-restock.svg` | Inventory management | Kevin |
| 📈 | `icon-analytics.svg` | Statistics & reports | All |

## Wizard Progress Icons

| Icon | Filename | Usage |
|------|----------|-------|
| ✅ | `icon-checkmark-circle.svg` | Completed step |
| ⭕ | `icon-circle-outline.svg` | Pending step |
| ⚫ | `icon-circle-filled.svg` | Active step |
| → | `icon-arrow-right.svg` | Next/Forward |
| ← | `icon-arrow-left.svg` | Back/Previous |

## Commerce Icons

| Icon | Filename | Usage |
|------|----------|-------|
| 🛒 | `icon-cart.svg` | Shopping cart |
| ✅ | `icon-inventory-check.svg` | In stock |
| ⚠️ | `icon-inventory-warning.svg` | Low stock |
| ❌ | `icon-inventory-error.svg` | Out of stock |
| 💲 | `icon-price-tag.svg` | Pricing information |

## Construction Icons

| Icon | Filename | Usage | Phase |
|------|----------|-------|-------|
| 🏗️ | `icon-foundation.svg` | Foundation work | Marcus |
| 🏗️ | `icon-framing.svg` | Framing work | Marcus |
| 🏠 | `icon-envelope.svg` | Building envelope | Marcus |
| 🎨 | `icon-interior.svg` | Interior finish | Marcus |
| 📐 | `icon-blueprint.svg` | Floor plans | Sarah, Marcus |

## Deck Builder Icons

| Icon | Filename | Usage |
|------|----------|-------|
| ▭ | `icon-deck-shape-rect.svg` | Rectangular deck |
| ⅃ | `icon-deck-shape-l.svg` | L-shaped deck |
| 🪵 | `icon-deck-material-wood.svg` | Wood decking |
| 🟫 | `icon-deck-material-composite.svg` | Composite decking |
| ══ | `icon-deck-railing.svg` | Railing systems |

## Remodeling Icons

| Icon | Filename | Usage | Room Type |
|------|----------|-------|-----------|
| 🚿 | `icon-bathroom.svg` | Bathroom projects | Lisa |
| 🍳 | `icon-kitchen.svg` | Kitchen projects | Lisa |
| 🚰 | `icon-fixtures.svg` | Plumbing fixtures | Lisa |
| 🔲 | `icon-surfaces.svg` | Tile & surfaces | Lisa |
| 🎨 | `icon-finishes.svg` | Paint & finishes | Lisa |

## UI Icons

| Icon | Filename | Usage |
|------|----------|-------|
| 👤 | `icon-user.svg` | User profile |
| 🚪 | `icon-logout.svg` | Logout action |
| ⚙️ | `icon-settings.svg` | Settings menu |
| ❓ | `icon-help.svg` | Help & info |
| 🔍 | `icon-search.svg` | Search functionality |
| 🔽 | `icon-filter.svg` | Filter controls |
| ✏️ | `icon-edit.svg` | Edit action |
| 🗑️ | `icon-delete.svg` | Delete action |
| ➕ | `icon-add.svg` | Add action |
| ✖️ | `icon-close.svg` | Close/dismiss |

## Icon Preview

[TODO: Add visual preview grid showing all icons]

## Adding New Icons

1. Design icon following specifications (24x24px, 2px stroke)
2. Export as SVG
3. Optimize with SVGO
4. Place in appropriate category folder
5. Update this documentation
6. Test icon in context
```

**Deliverable**: Icon library documentation

---

## Task 4: Emoji Replacement Plan

### 4.1 Identify All Emoji Usage

Search codebase for emoji usage:

```bash
# From buildright-eds directory
grep -r "[\U0001F300-\U0001F9FF]" --include="*.html" --include="*.js" .
```

**Common Locations**:
- Wizard progress indicators
- Dashboard cards
- Product tiles
- Category icons
- Status indicators

### 4.2 Create Replacement Mapping

**File**: `docs/EMOJI-REPLACEMENT-MAP.md`

| Current Emoji | New Icon | File Location | Priority |
|---------------|----------|---------------|----------|
| ✓ | `icon-checkmark-circle.svg` | wizard-progress | High |
| 🏗️ | `icon-project.svg` | dashboard | High |
| 📋 | `icon-template.svg` | template-card | High |
| ... | ... | ... | ... |

### 4.3 Replacement Script

**File**: `scripts/replace-emojis.js`

```javascript
/**
 * Script to identify and help replace emoji usage with SVG icons
 * Run this to generate a report of emoji usage
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]/gu;

async function findEmojis() {
  const files = await glob('**/*.{html,js}', {
    ignore: ['node_modules/**', 'dist/**']
  });
  
  const findings = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(EMOJI_REGEX);
    
    if (matches) {
      findings.push({
        file,
        emojis: [...new Set(matches)],
        count: matches.length
      });
    }
  }
  
  return findings;
}

async function generateReport() {
  const findings = await findEmojis();
  
  console.log('\n=== Emoji Usage Report ===\n');
  console.log(`Total files with emojis: ${findings.length}\n`);
  
  findings.forEach(({ file, emojis, count }) => {
    console.log(`${file} (${count} emoji${count > 1 ? 's' : ''}):`);
    console.log(`  ${emojis.join(' ')}`);
  });
  
  console.log('\nNext steps:');
  console.log('1. Review each file');
  console.log('2. Replace emoji with appropriate SVG icon');
  console.log('3. Update HTML/JS to use icon helper');
  console.log('4. Test visual appearance');
}

generateReport();
```

**Run report**:
```bash
node scripts/replace-emojis.js
```

**Deliverable**: Emoji usage report and replacement plan

---

## Success Criteria

✅ All ~40 icons designed and exported as SVG  
✅ Icons follow design specifications (24x24px, 2px stroke)  
✅ Icons organized in category folders  
✅ SVGs optimized for web  
✅ Icon CSS classes defined  
✅ Icon helper JavaScript module created  
✅ Icon library documented  
✅ Design system updated with icon usage guidelines  
✅ All emoji usage identified and mapped to replacements  
✅ No emojis remain in production code

---

## Testing/Validation

### Visual QA
- [ ] All icons display correctly at all sizes
- [ ] Icons inherit color from CSS correctly
- [ ] Icons align properly with text
- [ ] Icons look crisp at all zoom levels
- [ ] Icons maintain consistent visual weight

### Technical QA
- [ ] SVG files are optimized (small file size)
- [ ] No accessibility violations
- [ ] Icons work in all target browsers
- [ ] Icon helper functions work correctly
- [ ] CSS classes apply correctly

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Deliverables Checklist

### Icon Files
- [ ] ~40 SVG icon files in `icons/custom/`
- [ ] Icon sprite (optional) `icons/icon-sprite.svg`
- [ ] SVGO configuration `svgo.config.js`

### Code Files
- [ ] `styles/icons.css` - Icon styles
- [ ] `scripts/icon-helper.js` - Icon utilities
- [ ] `scripts/replace-emojis.js` - Emoji detection script

### Documentation
- [ ] `docs/ICON-LIBRARY.md` - Icon catalog
- [ ] `docs/DESIGN-SYSTEM.md` - Updated with icon guidelines
- [ ] `docs/EMOJI-REPLACEMENT-MAP.md` - Replacement mapping

---

## Next Steps

Upon completion of Phase 2:
1. **Phase 3**: Use icons in core architecture components
2. **Phase 4**: Apply icons in shared EDS blocks
3. **Phase 5**: Replace emojis in existing pages

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `CSS-ARCHITECTURE.md` - Existing design system
- `PHASE-0-RESEARCH-AND-DECISIONS.md` - Architecture decisions

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

