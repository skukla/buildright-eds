# EDS Blocks vs Component Extraction: Alignment Analysis

**Date:** December 6, 2025  
**Purpose:** Understand how the component extraction approach in our Adobe EDS-inspired frontend relates to the official Adobe Edge Delivery Services (EDS) block concept.

## Executive Summary

After comprehensive research into Adobe Edge Delivery Services blocks, **your component extraction approach is fundamentally aligned with EDS block philosophy**, but with some important distinctions and opportunities for refinement:

✅ **What You're Doing Right:**
- Identifying reusable UI patterns (exactly what blocks do)
- Planning to modularize CSS and JavaScript
- Focusing on semantic HTML structure
- Creating self-contained, composable units

⚠️ **Key Distinctions to Understand:**
- EDS blocks are **authored as tables** in documents (Word/Google Docs) OR through the Universal Editor
- Your current approach seems to be hard-coded HTML components
- EDS blocks emphasize **content authoring** over developer assembly
- True EDS blocks separate content model from presentation logic

🎯 **Recommended Path Forward:**
1. Continue your component extraction (it's valuable architectural work)
2. Layer in EDS block patterns where authoring flexibility is needed
3. Use your extracted components as the presentation layer for EDS blocks
4. Follow David's Model for content structure decisions

---

## Part 1: What Are EDS Blocks? (Official Definition)

### Core Concept

According to Adobe's official documentation:

> **"Blocks are a foundational concept behind adding form and function to sections of a page."**  
> — [Exploring Blocks, AEM.live](https://www.aem.live/docs/exploring-blocks)

An EDS block is:

1. **Content Structure**: A table in Word/Google Docs OR a component in Universal Editor
2. **Presentation Logic**: CSS + JavaScript that transforms semantic HTML
3. **Reusable Pattern**: Self-contained functionality that can be used across pages

### The Three-File Block Architecture

```
blocks/
  └── quote/
      ├── quote.js         # Decoration logic (transforms DOM)
      ├── quote.css        # Block-specific styles
      └── _quote.json      # Content model (for Universal Editor)
```

**Key Insight:** EDS blocks have TWO representations:
- **Authoring layer** (table in document OR Universal Editor fields)
- **Rendering layer** (decorated HTML/CSS/JS)

### Example: Quote Block

**How it's authored (Google Docs/Word):**
```
+----------------------------------+
| Quote                            |  ← Block name in header
+----------------------------------+
| "Think, McFly! Think!"           |  ← Quote content
+----------------------------------+
| Biff Tannen                      |  ← Author name
+----------------------------------+
```

**What HTML is generated:**
```html
<div class="block quote">
  <div>
    <div>
      <p>"Think, McFly! Think!"</p>
    </div>
  </div>
  <div>
    <div>
      <p>Biff Tannen</p>
    </div>
  </div>
</div>
```

**What JavaScript decoration does:**
```javascript
// blocks/quote/quote.js
export default function decorate(block) {
  const [quoteWrapper] = block.children;
  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
}
```

**What CSS does:**
```css
/* blocks/quote/quote.css */
.block.quote {
    background-color: #ccc;
    padding: 0 0 24px;
}

.block.quote blockquote {
    margin: 16px;
    font-style: italic;
}
```

---

## Part 2: Your Component Extraction Approach

Based on your audit documents, you've identified patterns like:

### Current Approach (Example: Photo Tiles)
```css
/* styles/components.css */
.photo-tile {
  position: relative;
  overflow: hidden;
}

.photo-tile--selection[data-selected="true"]::before {
  content: "✓";
  /* checkmark styling */
}
```

**Usage in HTML:**
```html
<!-- Hard-coded in configurator page -->
<div class="photo-tile photo-tile--selection" data-selected="false">
  <img src="..." alt="...">
  <div class="photo-tile__content">
    <h3 class="photo-tile__title">Option 1</h3>
  </div>
</div>
```

### What This Represents
- ✅ **Reusable visual pattern** (great!)
- ✅ **Self-contained styling** (great!)
- ⚠️ **Developer-assembled HTML** (not authorable)
- ⚠️ **No content/presentation separation** (not EDS-like)

---

## Part 3: How Your Approach Maps to EDS Blocks

### The Conceptual Mapping

| Your Component | EDS Equivalent | Relationship |
|---------------|----------------|--------------|
| Photo Tile (utility class) | **Default Content** + CSS | Used directly in semantic HTML |
| Loading Spinner | **Default Content** + CSS | Utility pattern, not a block |
| Card Pattern | **Could be Block** | If content varies, make it a block |
| Product Tile | **Definitely a Block** | Complex, data-driven, authorable |
| Filters Sidebar | **Could be Block or Fragment** | Shared component across pages |
| Quantity Controls | **Block Element** | Part of larger blocks (cart, PDP) |

### Critical Distinction: Utility vs. Block

**Utilities (keep as CSS classes):**
```css
/* These are NOT blocks - they're styling patterns */
.loading-spinner { /* ... */ }
.savings-pill { /* ... */ }
.photo-tile { /* ... */ }
.btn { /* ... */ }
```

**Blocks (should be separate components):**
```
blocks/
  └── product-tile/
      ├── product-tile.js    # You already have this!
      ├── product-tile.css
      └── _product-tile.json # Add for authoring
```

---

## Part 4: The Philosophy Gap (David's Model)

David Nuescheler's "David's Model, Second Take" provides crucial guidance on content modeling that directly relates to your component extraction:

### Rule #1: "Blocks are not great for authoring"

> **"Generally blocks are not great as they are surfaced as tables on the authoring side... For authors it is often easier to work in 'Default Content' wherever possible."**

**Implication for your components:**
- ✅ **Photo tiles** → Keep as CSS utility for "default content"
- ❌ **Don't** make everything a block just because it's reusable
- ✅ **Product tiles** → Should be block (data-driven, needs variants)

### Rule #2: "No nested blocks for authors"

> **"To a developer it might very often be tempting to nest complex structures... blocks are not desirable, nested blocks are definitely a lot worse."**

**Implication:**
- Your current **flat component structure** is actually MORE aligned with EDS than nested React components would be!
- If you need nesting (e.g., cards inside a carousel), use **sections** or **fragments**, not nested blocks

### Rule #6: "Buttons need to inherit from context"

> **"It is intuitive for authors to treat links that are on a line by themselves as a button. In many cases it is important to inherit from the block and section context."**

**Implication:**
- Your `.btn` utility classes are perfect!
- Blocks should style buttons based on their context
- Example: A button in a hero block auto-sizes larger than in a card

### Rule #9: "Number of Blocks and Variants"

> **"While it is probably not easy to avoid the sprawl of blocks... it is important to make sure that the core set of blocks and variant combinations that authors need to use commonly is limited."**

**Implication:**
- Your **Component Extraction Roadmap** identified 47 opportunities
- Many should be **CSS utilities**, not blocks
- Aim for **10-15 actual blocks** for authoring

---

## Part 5: Recommended Alignment Strategy

### Phase 1: Classify Your Components (NOW)

Go through your extraction list and categorize:

**A. Pure Utilities (CSS only, no block needed):**
- Loading spinners
- Buttons (`.btn`, `.btn-primary`, etc.)
- Badges
- Form inputs
- Spacing/layout utilities

**B. Visual Patterns (might need simple block):**
- Cards (if content structure varies)
- Photo tiles (if authors select images)
- Modals

**C. Data-Driven Blocks (definitely need blocks):**
- Product tiles
- Product grid
- Cart summary
- Filters sidebar
- Breadcrumbs
- Inventory status

### Phase 2: Refactor High-Value Blocks (NEXT SPRINT)

For components in Category C, create proper EDS blocks:

#### Example: Product Tile as EDS Block

**1. Create block structure:**
```
blocks/
  └── product-tile/
      ├── product-tile.js
      ├── product-tile.css
      └── _product-tile.json    # NEW: Content model
```

**2. Define content model (`_product-tile.json`):**
```json
{
  "id": "product-tile",
  "fields": [
    {
      "component": "reference",
      "name": "product",
      "label": "Product",
      "valueType": "string"
    },
    {
      "component": "boolean",
      "name": "showInventory",
      "label": "Show Inventory Status",
      "value": true
    },
    {
      "component": "select",
      "name": "classes",
      "label": "Display Style",
      "options": [
        {"name": "Default", "value": ""},
        {"name": "Compact", "value": "compact"},
        {"name": "Featured", "value": "featured"}
      ]
    }
  ]
}
```

**3. Use your existing JavaScript (keep it!):**
```javascript
// blocks/product-tile/product-tile.js
// Your current decorate() function works perfectly!
export default function decorate(block) {
  // Existing logic from product-tile.js
  // This is EXACTLY what EDS block decoration does
}
```

**4. Authors can now use it:**
```
+----------------------------------+
| Product Tile (Featured)          |  ← Block name + option
+----------------------------------+
| SKU-12345                        |  ← Product reference
+----------------------------------+
```

### Phase 3: Pattern Library Documentation (ONGOING)

Create a **Block Library** page (like Adobe's Block Collection) showing:

1. **Utility Classes** (CSS-only patterns)
   - When to use
   - Code examples
   - Accessibility notes

2. **Blocks** (authorable components)
   - Content model
   - Options/variants
   - Usage examples

3. **Fragments** (reusable content sections)
   - Header/footer
   - Common CTAs
   - Legal disclaimers

---

## Part 6: Practical Recommendations

### DO: Keep Your Component Extraction Work ✅

Your component audit is **excellent foundation work**. The patterns you've identified ARE the building blocks of a good EDS site.

### DO: Layer in EDS Block Patterns ✅

When a component needs to be:
- ✅ **Authorable** by content creators
- ✅ **Data-driven** (pulling from services/spreadsheets)
- ✅ **Variable** across pages

→ Make it an **EDS block** with proper content model

### DO: Use Utilities for Visual Consistency ✅

When a component is:
- ✅ **Pure presentation** (no logic)
- ✅ **Applied consistently** (buttons, badges, etc.)
- ✅ **Developer-controlled** (design system)

→ Keep as **utility class** in `styles/components.css`

### DON'T: Convert Everything to Blocks ❌

**Anti-pattern:**
```
blocks/
  └── button/        ❌ NO! Buttons are default content
  └── heading/       ❌ NO! Headings are semantic HTML
  └── image/         ❌ NO! Images are default content
```

**Better:**
```css
/* styles/components.css */
.btn { /* ... */ }          ✅ Utility class
.savings-pill { /* ... */ } ✅ Utility class
```

### DON'T: Nest Blocks for Authors ❌

**Anti-pattern:**
```
+----------------------------------+
| Carousel                         |
+----------------------------------+
| +------------------------------+ |
| | Card                         | |  ❌ Table in table
| +------------------------------+ |
+----------------------------------+
```

**Better:**
```
+----------------------------------+
| Carousel                         |
+----------------------------------+
| path/to/card-1.html             |  ✅ Fragment reference
+----------------------------------+
| path/to/card-2.html             |
+----------------------------------+
```

---

## Part 7: Your Specific Components Analyzed

Let's evaluate your top extraction opportunities:

### Loading Spinner
**Current:** Utility class  
**EDS Alignment:** ✅ **Perfect as-is**  
**Recommendation:** Keep as CSS utility in `components.css`

**Why:** Loading states are developer-controlled, not authored. They're presentation logic, not content.

### Cards
**Current:** Utility pattern  
**EDS Alignment:** ⚠️ **Depends on usage**  
**Recommendation:** 
- If cards are **static/developer-assembled** → Utility class
- If cards are **authored/data-driven** → Block

**Example decision:**
```html
<!-- Developer-assembled card (utility) -->
<div class="card">
  <div class="card-header">
    <h3>Static Title</h3>
  </div>
</div>

<!-- vs. -->

<!-- Authorable card (block) -->
<!-- Author creates this in Google Docs as table -->
```

### Product Tiles
**Current:** Block (already exists!)  
**EDS Alignment:** ✅ **Perfectly aligned**  
**Recommendation:** Add content model JSON for Universal Editor authoring

### Buttons
**Current:** Utility classes (`.btn`, `.btn-cta`, etc.)  
**EDS Alignment:** ✅ **Perfect as-is**  
**Recommendation:** Keep as utilities, use David's Rule #6 (inherit from context)

### Quantity Controls
**Current:** Repeated pattern in cart/PDP  
**EDS Alignment:** ⚠️ **Block element, not standalone block**  
**Recommendation:** Create as **shared function** or **fragment**, not a block

```javascript
// scripts/utils/quantity-controls.js
export function createQuantityControls(initialValue, onChange) {
  // Shared logic
}

// Use in multiple blocks:
// blocks/cart-item/cart-item.js
import { createQuantityControls } from '../../scripts/utils/quantity-controls.js';
```

### Modals/Overlays
**Current:** Repeated pattern  
**EDS Alignment:** ⚠️ **Could be block or utility**  
**Recommendation:** 
- Create **utility class** for modal shell (`.modal`, `.modal-content`)
- Create **blocks** for specific modal types (e.g., `volume-pricing-modal`)

### Breadcrumbs
**Current:** Repeated across pages  
**EDS Alignment:** ✅ **Should be block or auto-block**  
**Recommendation:** Make it an **auto-block** (programmatically generated from page hierarchy)

```javascript
// scripts/scripts.js
function buildAutoBlocks(main) {
  // Auto-generate breadcrumbs from URL path
  const breadcrumbs = createBreadcrumbsFromPath(window.location.pathname);
  main.prepend(breadcrumbs);
}
```

---

## Part 8: Migration Path & Implementation Priorities

### Immediate Actions (This Sprint)

1. **✅ Create this classification document** (you have it now!)

2. **Classify all 47 component opportunities:**
   - **Utilities:** 15-20 items (buttons, badges, spinners, etc.)
   - **Simple Blocks:** 10-15 items (cards, hero, quote, etc.)
   - **Complex Blocks:** 5-10 items (product-tile, cart, filters, etc.)
   - **Auto-blocks:** 3-5 items (breadcrumbs, article-header, etc.)

3. **Document in Roadmap:**
   Update `COMPONENT-EXTRACTION-ROADMAP.md` with classifications

### Phase 1: Utilities Foundation (Week 1-2)

**Goal:** Consolidate CSS utilities into proper design system

**Tasks:**
- ✅ Audit `styles/components.css` (already good!)
- ✅ Document utility classes in pattern library
- ✅ Remove any utility classes that should be blocks
- ✅ Add missing utilities (spacing, typography, etc.)

**Deliverable:** Comprehensive utility class documentation

### Phase 2: High-Value Blocks (Week 3-6)

**Goal:** Convert top 5 data-driven components to proper blocks

**Priority Order:**
1. **Product Tile** (already exists, add content model)
2. **Product Grid** (container for product tiles)
3. **Cart Summary** (complex, high-value)
4. **Filters Sidebar** (reusable across catalog pages)
5. **Featured Products** (homepage hero component)

**For each block:**
```
✓ Create `_blockname.json` content model
✓ Refactor CSS to use block-specific selectors
✓ Update JavaScript to follow decoration pattern
✓ Document in block library
✓ Create authoring examples
```

### Phase 3: Auto-Blocks (Week 7-8)

**Goal:** Reduce authoring burden with smart auto-blocking

**Candidates:**
- Breadcrumbs (from URL path)
- Article header (from metadata)
- Related products (from product data)

**Implementation:**
```javascript
// scripts/scripts.js
export function buildAutoBlocks(main) {
  // Breadcrumbs
  buildBreadcrumbs(main);
  
  // Article headers for blog posts
  if (getMetadata('template') === 'article') {
    buildArticleHeader(main);
  }
  
  // Related products on PDP
  if (getMetadata('template') === 'product-detail') {
    buildRelatedProducts(main);
  }
}
```

### Phase 4: Content Model Refinement (Ongoing)

**Goal:** Align content structure with David's Model

**Review questions for each block:**
- ✅ Can authors understand this without training?
- ✅ Is the table structure simple (< 4 columns)?
- ✅ Are we using semantic HTML where possible?
- ✅ Could this be "default content" instead?
- ✅ Are we inheriting context (colors, sizes) properly?

---

## Part 9: Key Takeaways & Decision Framework

### The Component vs. Block Decision Tree

```
Is this pattern reusable?
├─ NO → Inline styles/script (page-specific)
└─ YES
    └─ Does it have variable content?
        ├─ NO → Utility class (CSS-only pattern)
        └─ YES
            └─ Is content authored by non-developers?
                ├─ NO → Shared function/module
                └─ YES
                    └─ Is content structure simple?
                        ├─ YES → EDS Block
                        └─ NO → Consider Fragment or Auto-block
```

### EDS Block Checklist

Before creating a block, ensure:

- [ ] **Content varies** across instances (not static)
- [ ] **Authors need control** (not developer-controlled)
- [ ] **Table structure is simple** (< 4 columns, < 3 nesting levels)
- [ ] **Can't be "default content"** (headings, paragraphs, images, lists)
- [ ] **Doesn't nest other blocks** (use fragments if needed)
- [ ] **Has clear authoring model** (authors understand what to put in each cell)

### Red Flags (Don't Make These Blocks)

❌ **Button block** (use semantic `<a>` or `<button>` with utility classes)  
❌ **Heading block** (use semantic `<h1>`-`<h6>`)  
❌ **Image block** (use semantic `<img>` with `<picture>`)  
❌ **Text block** (use semantic `<p>`)  
❌ **Container block** (use sections with metadata)

### Green Lights (Good Block Candidates)

✅ **Hero block** (complex layout, authored content)  
✅ **Product tile block** (data-driven, variable)  
✅ **Teaser block** (image + text + CTA combination)  
✅ **Accordion block** (interactive, structured content)  
✅ **Carousel block** (container for slides)  
✅ **Quote block** (semantic blockquote with attribution)

---

## Part 10: Next Steps & Deliverables

### This Week

1. **Review this document** with team
2. **Classify all 47 components** using decision tree
3. **Update roadmap** with classifications
4. **Prioritize top 5 blocks** for Phase 2

### Next Sprint

1. **Create block content models** for top 5 blocks
2. **Refactor product-tile** as reference implementation
3. **Document pattern library** (utilities + blocks)
4. **Train team** on EDS block philosophy

### Success Metrics

- ✅ **Reduced authoring time** (fewer tables, more default content)
- ✅ **Faster development** (reusable blocks, less duplication)
- ✅ **Better performance** (aligned with EDS three-phase loading)
- ✅ **Easier maintenance** (separation of content/presentation)

---

## Conclusion: You're Closer Than You Think

**Your component extraction work is fundamentally sound.** The patterns you've identified ARE the building blocks of a well-architected EDS site. The key is understanding the distinction between:

1. **Utilities** (CSS patterns for visual consistency)
2. **Blocks** (authorable content components)
3. **Functions** (shared logic for complex interactions)

Your `product-tile` component is **already a proper EDS block**—you just need to add the content model layer. Many of your other "components" are **correctly designed as utilities** and should stay that way.

The path forward is **refinement, not revolution**. Continue your excellent architectural work, layer in EDS patterns where they add value, and trust that simpler is better.

**Key Resource:**
- [David's Model, Second Take](https://www.aem.live/docs/davidsmodel) - THE authoritative guide on content modeling
- [Block Collection](https://www.aem.live/developer/block-collection) - Reference implementations
- [Exploring Blocks](https://www.aem.live/docs/exploring-blocks) - Official introduction
- [Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks) - Technical details

---

## Appendix A: Quick Reference Comparisons

### Traditional Component vs. EDS Block

| Aspect | Traditional Component | EDS Block |
|--------|----------------------|-----------|
| **Authoring** | Developer creates HTML | Author creates table |
| **Content** | Hard-coded or CMS fields | Semantic HTML from table |
| **Styling** | Component-specific CSS | Decoration CSS |
| **Logic** | Component lifecycle | Decoration function |
| **Nesting** | Unlimited | Not allowed |
| **Reuse** | Import/include | Reference in document |

### Utility Class vs. Block

| When to Use | Utility Class | EDS Block |
|-------------|---------------|-----------|
| **Pure presentation** | ✅ Yes | ❌ No |
| **Variable content** | ❌ No | ✅ Yes |
| **Author control** | ❌ No | ✅ Yes |
| **Design system** | ✅ Yes | ❌ No |
| **Interactive** | ⚠️ Simple only | ✅ Yes |

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Next Review:** Sprint Planning (Week of Dec 9)

