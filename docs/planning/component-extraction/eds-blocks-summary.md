# EDS Blocks: Quick Summary for Developers

## TL;DR

**Your component extraction work is fundamentally aligned with EDS philosophy.** You're identifying the right patterns—you just need to understand when they should be:

1. **Utility Classes** (CSS only) - Buttons, badges, spinners → `styles/components.css`
2. **EDS Blocks** (authorable components) - Product tiles, cards, hero → `blocks/*/`
3. **Shared Functions** (reusable logic) - Quantity controls, modals → `scripts/utils/`

## The Core Concept

### What is an EDS Block?

An EDS block has **two layers**:

**Layer 1: Authoring** (Content creators use this)
- A table in Google Docs/Word OR
- A component in Universal Editor

**Layer 2: Rendering** (Developers build this)
- `blockname.js` - Decoration logic (transforms DOM)
- `blockname.css` - Block-specific styles  
- `_blockname.json` - Content model (defines authoring fields)

### Example: Quote Block

**Author creates:**
```
+----------------------------------+
| Quote                            |
+----------------------------------+
| "Think, McFly! Think!"           |
+----------------------------------+
| Biff Tannen                      |
+----------------------------------+
```

**System generates:**
```html
<div class="block quote">
  <div><div><p>"Think, McFly! Think!"</p></div></div>
  <div><div><p>Biff Tannen</p></div></div>
</div>
```

**Developer decorates:**
```javascript
// blocks/quote/quote.js
export default function decorate(block) {
  const [quoteWrapper] = block.children;
  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
}
```

## The Key Difference: Utility vs. Block

### Utilities (CSS Patterns)

**Use when:**
- Pure presentation (no variable content)
- Design system standards (buttons, badges)
- Developer-controlled (no author input needed)

**Examples from your audit:**
- ✅ Loading spinners
- ✅ Buttons (`.btn`, `.btn-primary`, etc.)
- ✅ Badges
- ✅ Form inputs
- ✅ Photo tile base styles

**Location:** `styles/components.css`

### Blocks (Authorable Components)

**Use when:**
- Content varies across instances
- Authors need control
- Data-driven (from services/spreadsheets)

**Examples from your audit:**
- ✅ Product tiles (data from ACO service)
- ✅ Product grid (container for tiles)
- ✅ Cart summary (dynamic content)
- ✅ Featured products (authored selections)

**Location:** `blocks/blockname/`

## Decision Tree

```
Is this reusable?
├─ NO → Inline styles (page-specific)
└─ YES
    └─ Does content vary?
        ├─ NO → Utility class
        └─ YES
            └─ Do authors control it?
                ├─ NO → Shared function
                └─ YES → EDS Block
```

## What You're Already Doing Right

Your **product-tile** component is ALREADY a proper EDS block! It has:
- ✅ `product-tile.js` (decoration logic)
- ✅ `product-tile.css` (styling)
- ⚠️ Just needs `_product-tile.json` (content model for authoring)

Many of your other patterns (buttons, spinners, badges) are **correctly designed as utilities** and should stay that way.

## Red Flags (DON'T Make These Blocks)

❌ Button block (use semantic `<a>` or `<button>` with `.btn` class)  
❌ Heading block (use semantic `<h1>`-`<h6>`)  
❌ Image block (use semantic `<img>`)  
❌ Text block (use semantic `<p>`)

**Why?** These are "default content"—semantic HTML that doesn't need special treatment.

## David's Model: The Philosophy

David Nuescheler's content modeling guidelines:

### Rule #1: "Blocks are not great for authoring"
Use default content (headings, paragraphs, images) whenever possible. Only create blocks when you need special structure or functionality.

### Rule #2: "No nested blocks"
Don't nest blocks inside blocks. Use sections or fragments instead.

### Rule #6: "Buttons inherit from context"
Buttons should look different based on where they are (hero vs. card). Don't create separate button blocks for each context.

### Rule #9: "Limit blocks and variants"
Aim for **10-15 core blocks**, not 47. Most of your patterns should be utilities.

## Your 47 Components: Expected Breakdown

After proper classification:
- **Utilities:** ~15-20 (buttons, badges, spinners, forms, etc.)
- **Simple Blocks:** ~10-15 (cards, hero, quote, etc.)
- **Complex Blocks:** ~5-10 (product-tile, cart, filters, etc.)
- **Auto-blocks:** ~3-5 (breadcrumbs, article-header, etc.)
- **Shared Functions:** ~5-8 (quantity controls, modals, etc.)

## Immediate Next Steps

1. **Review full analysis:** `docs/EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md`
2. **Classify your 47 components** using the decision tree
3. **Update roadmap** with proper classifications
4. **Prioritize top 5 blocks** for implementation

## Key Resources

- [David's Model](https://www.aem.live/docs/davidsmodel) - **START HERE**
- [Exploring Blocks](https://www.aem.live/docs/exploring-blocks) - Official intro
- [Block Collection](https://www.aem.live/developer/block-collection) - Reference implementations
- [Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks) - Technical details
- [Web Components](https://www.aem.live/developer/web-components) - When to use (rarely!)

## Bottom Line

**You're doing great work.** Your architectural instincts are sound. Now it's just about:
1. Understanding which patterns are utilities vs. blocks
2. Adding content models to your data-driven blocks
3. Following David's Model to keep things simple

Continue extracting components—just classify them properly as you go.

---

**Quick Start:** Read `EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md` for full details and implementation guidance.

