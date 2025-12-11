# AEM Edge Delivery Services (EDS) - Block Patterns

**Research Date**: November 15, 2024  
**Sources**: AEM Live Developer Documentation (via Context7)

This document outlines the core patterns and best practices for building EDS blocks.

---

## EDS Block Architecture

### Fundamental Principle

**EDS blocks transform simple HTML markup into interactive components** through a standard decoration pattern.

**Authors create** → Simple HTML tables in Google Docs/SharePoint  
**EDS converts** → Nested div structure  
**Block JavaScript decorates** → Interactive, styled components

---

## Block File Structure

Each block consists of three files with matching names:

```
blocks/
  └── your-block/
      ├── your-block.js    # Decoration logic
      ├── your-block.css   # Styling
      └── your-block.html  # (optional) Reference markup
```

### Naming Convention

The block name determines:
- ✅ Folder name: `blocks/columns/`
- ✅ File names: `columns.js`, `columns.css`
- ✅ CSS class: `.columns`

**Example:**
```
blocks/columns/ → .columns CSS class
blocks/product-grid/ → .product-grid CSS class
```

---

## Core Pattern: The `decorate()` Function

Every block exports a default `decorate` function that receives the block element.

### Basic Template

```javascript
/**
 * Decorate function for [block name]
 * @param {HTMLElement} block The block element from the DOM
 */
export default function decorate(block) {
  // 1. Read the existing DOM structure
  const rows = block.querySelectorAll(':scope > div');
  
  // 2. Transform or enhance the structure
  rows.forEach((row) => {
    const cols = row.querySelectorAll(':scope > div');
    // Add classes, data attributes, event listeners, etc.
  });
  
  // 3. Optionally replace content entirely
  // block.innerHTML = `<div class="custom-structure">...</div>`;
}
```

---

## DOM Structure Patterns

### EDS-Generated Structure

**Author input** (in Google Docs):

| Column 1 | Column 2 |
|----------|----------|
| Content A | Content B |

**EDS generates:**

```html
<div class="columns">
  <div>
    <div><p>Column 1</p></div>
    <div><p>Column 2</p></div>
  </div>
  <div>
    <div><p>Content A</p></div>
    <div><p>Content B</p></div>
  </div>
</div>
```

**Pattern**: Each table row becomes a `<div>`, each cell becomes a nested `<div>`.

---

### Querying Block Content

**Use `:scope >` to avoid selecting nested blocks:**

```javascript
// ✅ Correct - only direct children
const rows = block.querySelectorAll(':scope > div');

// ❌ Wrong - selects ALL divs, including nested blocks
const rows = block.querySelectorAll('div');
```

**Why**: EDS blocks can be nested. `:scope >` ensures you only target the current block's structure.

---

## Common Decoration Patterns

### Pattern 1: Add Classes Based on Structure

**Use case**: Style variations based on number of columns, rows, etc.

```javascript
export default function decorate(block) {
  const columns = block.querySelectorAll(':scope > div > div');
  
  // Add class based on column count
  if (columns.length === 2) {
    block.classList.add('columns-2');
  } else if (columns.length === 3) {
    block.classList.add('columns-3');
  }
}
```

**CSS:**

```css
.columns-2 > div {
  width: 50%;
}

.columns-3 > div {
  width: 33.33%;
}
```

---

### Pattern 2: Extract Data from Cells

**Use case**: Block configuration via table cells.

```javascript
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  
  // First row is configuration
  const config = {};
  const configRow = rows[0];
  const cells = configRow.querySelectorAll(':scope > div');
  
  config.title = cells[0]?.textContent.trim();
  config.type = cells[1]?.textContent.trim();
  
  // Remaining rows are content
  const contentRows = rows.slice(1);
  
  // Use config to render block
  block.innerHTML = `
    <h2>${config.title}</h2>
    <div class="content ${config.type}">
      ${contentRows.map(row => row.innerHTML).join('')}
    </div>
  `;
}
```

---

### Pattern 3: Progressive Enhancement

**Use case**: Enhance existing markup without replacing it.

```javascript
export default function decorate(block) {
  // Find images and wrap them
  const images = block.querySelectorAll('img');
  images.forEach((img) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    img.parentElement.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  });
  
  // Find links and add click tracking
  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      console.log('Link clicked:', link.href);
    });
  });
}
```

---

### Pattern 4: Complete Replacement

**Use case**: Block needs entirely custom structure.

```javascript
export default async function decorate(block) {
  // Extract data from original structure
  const rows = [...block.querySelectorAll(':scope > div')];
  const items = rows.map(row => {
    const cells = row.querySelectorAll(':scope > div');
    return {
      title: cells[0]?.textContent.trim(),
      description: cells[1]?.textContent.trim(),
    };
  });
  
  // Replace with custom structure
  block.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <button>Add to Cart</button>
    `;
    block.appendChild(card);
  });
}
```

---

## Block Options (Variants)

**Authors can specify options** in parentheses after block name:

```
Columns (wide, dark)
```

**EDS converts to classes:**

```html
<div class="columns wide dark">
```

**Decoration function:**

```javascript
export default function decorate(block) {
  // Check for variant classes
  if (block.classList.contains('wide')) {
    block.style.maxWidth = '100%';
  }
  
  if (block.classList.contains('dark')) {
    block.classList.add('theme-dark');
  }
}
```

**CSS:**

```css
.columns.wide {
  max-width: 100%;
}

.columns.dark {
  background: #1a1a1a;
  color: white;
}
```

---

## Async Patterns (Loading Data)

### Pattern: Fetch External Data

```javascript
export default async function decorate(block) {
  // Show loading state
  block.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    // Fetch data
    const response = await fetch('/api/products.json');
    const products = await response.json();
    
    // Render with data
    block.innerHTML = products.map(product => `
      <div class="product-card">
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading products:', error);
    block.innerHTML = '<div class="error">Failed to load products</div>';
  }
}
```

---

## Event Handling Patterns

### Pattern 1: Delegation

**Use event delegation for dynamically created elements:**

```javascript
export default function decorate(block) {
  // Render items
  block.innerHTML = `
    <div class="items">
      <button data-action="add">Add Item</button>
      <button data-action="remove">Remove Item</button>
    </div>
  `;
  
  // Single event listener for all buttons
  block.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    if (action === 'add') handleAdd();
    if (action === 'remove') handleRemove();
  });
}
```

---

### Pattern 2: Custom Events

**Emit custom events for inter-block communication:**

```javascript
export default function decorate(block) {
  const addButton = block.querySelector('.add-to-cart');
  
  addButton.addEventListener('click', () => {
    const product = {
      sku: block.dataset.sku,
      name: block.dataset.productName,
      price: parseFloat(block.dataset.price),
    };
    
    // Emit custom event
    window.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: { product, quantity: 1 }
    }));
  });
}
```

**Other blocks can listen:**

```javascript
// In cart block
window.addEventListener('cart:item-added', (e) => {
  console.log('Item added to cart:', e.detail);
  updateCartDisplay();
});
```

---

## Best Practices

### DO:

✅ **Use `:scope >` for queries**
```javascript
const rows = block.querySelectorAll(':scope > div');
```

✅ **Export default function**
```javascript
export default function decorate(block) { }
```

✅ **Handle async operations gracefully**
```javascript
export default async function decorate(block) {
  try {
    const data = await fetchData();
    renderBlock(data);
  } catch (error) {
    showError(error);
  }
}
```

✅ **Use semantic HTML**
```javascript
block.innerHTML = `
  <article class="product">
    <h3>Product Name</h3>
    <p>Description</p>
  </article>
`;
```

✅ **Add data attributes for state**
```javascript
button.dataset.productId = '123';
button.dataset.state = 'active';
```

---

### DON'T:

❌ **Don't query without `:scope >`**
```javascript
// Bad - selects nested blocks too
const divs = block.querySelectorAll('div');
```

❌ **Don't use named exports for decorate**
```javascript
// Bad
export function decorate(block) { }
```

❌ **Don't ignore errors**
```javascript
// Bad
async function loadData() {
  const data = await fetch('/api/data');
  // What if fetch fails?
}
```

❌ **Don't hardcode URLs**
```javascript
// Bad
const img = `<img src="/content/dam/image.jpg">`;

// Good
const img = `<img src="${imagePath}">`;
```

❌ **Don't pollute global scope**
```javascript
// Bad
window.myBlockData = { ... };

// Good - use custom events or module scope
const blockData = { ... };
```

---

## Auto-Blocking Pattern

**Auto-blocking** creates blocks programmatically before page loads.

**File**: `scripts.js`

```javascript
function buildAutoBlocks() {
  const main = document.querySelector('main');
  
  // Auto-create hero block from first section
  const firstSection = main.querySelector(':scope > div:first-child');
  if (firstSection && firstSection.querySelector('h1, h2')) {
    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.appendChild(firstSection.cloneNode(true));
    firstSection.replaceWith(hero);
  }
}

// Call before blocks load
buildAutoBlocks();
```

**Use cases:**
- Convert first section to hero block automatically
- Add navigation block to every page
- Inject promotional banners conditionally

---

## Testing Block Decoration

### Manual Testing

1. **Create test HTML file** with block markup:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/columns/columns.css">
</head>
<body>
  <div class="columns">
    <div>
      <div><p>Column 1</p></div>
      <div><p>Column 2</p></div>
    </div>
  </div>
  
  <script type="module">
    import decorate from '/blocks/columns/columns.js';
    const block = document.querySelector('.columns');
    decorate(block);
  </script>
</body>
</html>
```

2. **Open in browser** and verify decoration works

---

### Automated Testing (Conceptual)

```javascript
// test/blocks/columns.test.js
import { expect } from 'chai';
import decorate from '../../blocks/columns/columns.js';

describe('Columns Block', () => {
  it('should add columns-2 class for 2 columns', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div><p>Col 1</p></div>
        <div><p>Col 2</p></div>
      </div>
    `;
    
    decorate(block);
    
    expect(block.classList.contains('columns-2')).to.be.true;
  });
});
```

---

## BuildRight Application

### Our Block Patterns

**Product Grid** (`blocks/product-grid/`):
- Fetch products from ACO mock service
- Render as grid of product cards
- Handle filtering, sorting
- Pattern: **Complete replacement + async data**

**User Menu** (`blocks/user-menu/`):
- Display logged-in user info
- Link to account pages
- Handle logout
- Pattern: **Progressive enhancement + event listeners**

**Cart Summary** (`blocks/cart-summary/`):
- Display cart items and total
- Update on cart changes
- Pattern: **Custom event listening + dynamic updates**

**Wizard Progress** (`blocks/wizard-progress/`):
- Show multi-step progress
- Highlight current step
- Pattern: **Class-based state management**

---

## Alignment with Dropins

### Similarity

**EDS Blocks** and **Dropins** share similar decoration patterns:
- Both export a decorate/initialize function
- Both receive a DOM element
- Both transform/enhance markup

### Key Difference

**EDS Blocks**:
- Content-driven (from Google Docs/SharePoint)
- Decoration happens at page load
- No backend connection (unless you add it)

**Dropins**:
- Commerce-driven (from Adobe Commerce API)
- Initialize with configuration
- Built-in backend connection

### Our Strategy

Use **EDS block patterns** for:
- Content blocks (hero, features, etc.)
- Custom UI components (wizards, dashboards)
- Persona-specific interfaces

Use **Dropin patterns** (mocked now, real later) for:
- Authentication
- Cart management
- Checkout
- Account management

---

## Related Documents

- `DROPIN-ARCHITECTURE.md` - Dropin patterns and APIs
- `DROPIN-INTEGRATION-GUIDE.md` - How to integrate dropins
- `BLOCK-VS-DROPIN-MATRIX.md` - When to use blocks vs dropins

---

## Resources

**AEM Live Documentation**:
- [Markup Sections & Blocks](https://www.aem.live/developer/markup-sections-blocks)
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Block Collection](https://www.aem.live/developer/block-collection)

**BuildRight Examples**:
- `blocks/product-grid/product-grid.js` - Complex async block
- `blocks/header/header.js` - Navigation block
- `blocks/footer/footer.js` - Footer block

---

**Last Updated**: November 15, 2024  
**Status**: EDS block patterns documented from Context7 research

