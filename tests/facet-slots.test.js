/**
 * Facet Slots Tests - Step 7
 *
 * TDD tests for FacetBucket and Facet slot implementations in product-list-dropin.
 * Validates DOM structure, CSS class names, and slot behavior.
 *
 * Run with: node --test tests/facet-slots.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const DROPIN_JS_PATH = path.join(__dirname, '..', 'blocks', 'product-list-dropin', 'product-list-dropin.js');
const FACETS_CSS_PATH = path.join(__dirname, '..', 'blocks', 'product-list-dropin', 'css', 'facets.css');
const CATALOG_HTML_PATH = path.join(__dirname, '..', 'pages', 'catalog-dropin.html');

// Helper: Read file contents safely
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// ============================================
// TEST 1: FacetBucket Slot Implementation
// ============================================

describe('Test 1: FacetBucket Slot Implementation', () => {
  it('should have facetsSlots object in Facets render call', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check for facetsSlots in Facets render
    // Then: facetsSlots should be defined with slots property
    assert.ok(
      content.includes('FacetBucket') && content.includes('slots'),
      'Should have FacetBucket slot defined in slots configuration'
    );
  });

  it('should create buildright-filter-section elements in FacetBucket slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the FacetBucket slot implementation
    // Then: it should create elements with buildright-filter-section class
    assert.ok(
      content.includes("'buildright-filter-section'") ||
      content.includes('"buildright-filter-section"'),
      'FacetBucket slot should create buildright-filter-section elements'
    );
  });

  it('should create buildright-filter-toggle buttons in FacetBucket slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the FacetBucket slot implementation
    // Then: it should create toggle buttons
    assert.ok(
      content.includes("'buildright-filter-toggle'") ||
      content.includes('"buildright-filter-toggle"'),
      'FacetBucket slot should create buildright-filter-toggle buttons'
    );
  });

  it('should create buildright-filter-content container in FacetBucket slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the FacetBucket slot implementation
    // Then: it should create content container (may have additional classes)
    assert.ok(
      content.includes('buildright-filter-content'),
      'FacetBucket slot should create buildright-filter-content container'
    );
  });

  it('should have aria-expanded attribute for accessibility', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the FacetBucket slot implementation
    // Then: it should set aria-expanded for accessibility
    assert.ok(
      content.includes('aria-expanded'),
      'FacetBucket slot should use aria-expanded for accessibility'
    );
  });
});

// ============================================
// TEST 2: Facet Slot Implementation
// ============================================

describe('Test 2: Facet Slot Implementation', () => {
  it('should have Facet slot defined in slots configuration', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check for Facet slot
    // Then: Facet slot should be defined
    // Need to check for the pattern: Facet: (ctx) => { (not part of FacetBucket)
    const hasFacetSlot = /\bFacet\s*:\s*\(ctx\)\s*=>/.test(content);
    assert.ok(hasFacetSlot, 'Should have Facet slot defined separately from FacetBucket');
  });

  it('should create buildright-filter-option elements in Facet slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the Facet slot implementation
    // Then: it should create elements with buildright-filter-option class
    assert.ok(
      content.includes("'buildright-filter-option'") ||
      content.includes('"buildright-filter-option"'),
      'Facet slot should create buildright-filter-option elements'
    );
  });

  it('should create native checkbox inputs in Facet slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the Facet slot implementation
    // Then: it should create native checkbox inputs
    assert.ok(
      content.includes("type = 'checkbox'") ||
      content.includes('type = "checkbox"') ||
      content.includes("type='checkbox'") ||
      content.includes('type="checkbox"') ||
      content.includes(".type = 'checkbox'") ||
      content.includes('.type = "checkbox"') ||
      content.includes('.type = data.type'),
      'Facet slot should create native checkbox inputs'
    );
  });

  it('should include filter count in Facet slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the Facet slot implementation
    // Then: it should include count display
    assert.ok(
      content.includes("'buildright-filter-count'") ||
      content.includes('"buildright-filter-count"'),
      'Facet slot should include buildright-filter-count element'
    );
  });
});

// ============================================
// TEST 3: Slot-Based CSS Structure
// ============================================

describe('Test 3: Slot-Based CSS Structure', () => {
  it('should have buildright-filter-section styles in facets.css', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for slot-based CSS
    // Then: it should have buildright-filter-section styles
    assert.ok(
      content.includes('.buildright-filter-section'),
      'facets.css should have .buildright-filter-section styles'
    );
  });

  it('should have buildright-filter-toggle styles in facets.css', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for slot-based CSS
    // Then: it should have buildright-filter-toggle styles
    assert.ok(
      content.includes('.buildright-filter-toggle'),
      'facets.css should have .buildright-filter-toggle styles'
    );
  });

  it('should have buildright-filter-option styles in facets.css', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for slot-based CSS
    // Then: it should have buildright-filter-option styles
    assert.ok(
      content.includes('.buildright-filter-option'),
      'facets.css should have .buildright-filter-option styles'
    );
  });

  it('should have buildright-filter-content styles in facets.css', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for slot-based CSS
    // Then: it should have buildright-filter-content styles
    assert.ok(
      content.includes('.buildright-filter-content'),
      'facets.css should have .buildright-filter-content styles'
    );
  });
});

// ============================================
// TEST 4: Collapsible Behavior
// ============================================

describe('Test 4: Collapsible Facet Behavior', () => {
  it('should have toggle click handler in FacetBucket slot', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the FacetBucket slot
    // Then: it should have click event listener for toggle
    assert.ok(
      content.includes("addEventListener('click'") ||
      content.includes('addEventListener("click"'),
      'FacetBucket slot should have click event listener for toggle'
    );
  });

  it('should have CSS for collapsed state', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for collapsed state styles
    // Then: it should have styles for hidden content
    const hasCollapsedState =
      content.includes('.buildright-filter-content:not(.active)') ||
      content.includes('.buildright-filter-content {') ||
      content.includes('aria-expanded="false"') ||
      content.includes('[aria-expanded="false"]');

    assert.ok(hasCollapsedState, 'facets.css should have styles for collapsed/hidden state');
  });

  it('should toggle content visibility class on click', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the toggle handler
    // Then: it should toggle 'active' class on content
    assert.ok(
      content.includes("classList.toggle('active')") ||
      content.includes('classList.toggle("active")'),
      'Toggle handler should toggle active class on content'
    );
  });
});

// ============================================
// TEST 5: Sort Dropdown Labels
// ============================================

describe('Test 5: Sort Dropdown Human-Readable Labels', () => {
  it('should have sort label mapping after SortBy render', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check for sort label processing
    // Then: it should have logic to map sort options to human-readable labels
    const hasSortLabelMapping =
      content.includes('Best Match') ||
      content.includes('Price: Low to High') ||
      content.includes('Price: High to Low') ||
      content.includes('sortLabelMap') ||
      content.includes('relevance');

    assert.ok(hasSortLabelMapping, 'Should have sort label mapping for human-readable labels');
  });
});

// ============================================
// TEST 6: Catalog-Dropin Page Labels
// ============================================

describe('Test 6: Catalog-Dropin Page Labels', () => {
  it('should NOT have "(Dropin)" in breadcrumb text', () => {
    // Given: catalog-dropin.html exists
    const content = readFile(CATALOG_HTML_PATH);
    assert.ok(content, 'catalog-dropin.html should exist');

    // When: I check the breadcrumb text
    // Then: it should NOT contain "(Dropin)" suffix
    assert.ok(
      !content.includes('All Products (Dropin)'),
      'Breadcrumb should NOT have "(Dropin)" suffix'
    );
  });

  it('should NOT have "(Level 2 Dropin)" in page title', () => {
    // Given: catalog-dropin.html exists
    const content = readFile(CATALOG_HTML_PATH);
    assert.ok(content, 'catalog-dropin.html should exist');

    // When: I check the page title
    // Then: it should NOT contain "(Level 2 Dropin)" suffix
    assert.ok(
      !content.includes('All Products (Level 2 Dropin)'),
      'Page title should NOT have "(Level 2 Dropin)" suffix'
    );
  });

  it('should have clean "All Products" text in both locations', () => {
    // Given: catalog-dropin.html exists
    const content = readFile(CATALOG_HTML_PATH);
    assert.ok(content, 'catalog-dropin.html should exist');

    // When: I check for clean text
    // Then: it should have "All Products" without suffixes
    // Count occurrences - should have at least 2 (breadcrumb and title)
    const matches = content.match(/>All Products</g);
    const cleanCount = matches ? matches.length : 0;

    assert.ok(cleanCount >= 2,
      `Should have at least 2 occurrences of ">All Products<" (found: ${cleanCount})`
    );
  });
});

// ============================================
// TEST 7: Slots Object Structure
// ============================================

describe('Test 7: Facets Slots Object Structure', () => {
  it('should pass slots object to Facets render call', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check the Facets render call
    // Then: it should include slots in the configuration
    // Pattern: render.render(Facets, { slots: ...
    const hasSlots = /render\.render\s*\(\s*Facets\s*,\s*\{[^}]*slots\s*:/s.test(content);

    assert.ok(hasSlots, 'Facets render should include slots configuration');
  });

  it('should use ctx.replaceWith in both slot implementations', () => {
    // Given: product-list-dropin.js exists
    const content = readFile(DROPIN_JS_PATH);
    assert.ok(content, 'product-list-dropin.js should exist');

    // When: I check slot implementations
    // Then: both should use ctx.replaceWith pattern
    const replaceWithCount = (content.match(/ctx\.replaceWith/g) || []).length;

    // Should have replaceWith in: ProductImage, ProductName, ProductPrice, ProductActions, NoResults
    // Plus new: FacetBucket, Facet
    assert.ok(replaceWithCount >= 7,
      `Should have at least 7 ctx.replaceWith calls (found: ${replaceWithCount})`
    );
  });
});

// ============================================
// TEST 8: CSS Quality - No !important for Slot Content
// ============================================

describe('Test 8: CSS Quality for Slot-Based Content', () => {
  it('should have minimal !important for slot-based selectors', () => {
    // Given: facets.css exists
    const content = readFile(FACETS_CSS_PATH);
    assert.ok(content, 'facets.css should exist');

    // When: I check for !important in buildright-filter-* selectors
    // Count !important only in lines containing buildright-filter
    const lines = content.split('\n');
    let importantCount = 0;

    lines.forEach(line => {
      if (line.includes('buildright-filter') && line.includes('!important')) {
        importantCount++;
      }
    });

    // Then: slot-based content should not need !important (specificity is controlled)
    assert.ok(importantCount === 0,
      `Slot-based CSS should not need !important (found: ${importantCount})`
    );
  });
});
