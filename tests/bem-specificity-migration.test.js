/**
 * BEM Specificity Migration Tests - Step 3
 *
 * TDD tests for replacing !important declarations with BEM specificity chains.
 * Goal: Reduce !important count from ~293 to <50.
 *
 * Run with: node --test tests/bem-specificity-migration.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const CSS_DIR = path.join(__dirname, '..', 'blocks', 'product-list-dropin', 'css');

const CSS_FILES = {
  grid: path.join(CSS_DIR, 'grid.css'),
  productCard: path.join(CSS_DIR, 'product-card.css'),
  facets: path.join(CSS_DIR, 'facets.css'),
  loadingStates: path.join(CSS_DIR, 'loading-states.css'),
  pagination: path.join(CSS_DIR, 'pagination.css'),
};

// Maximum allowed !important count after migration
const MAX_IMPORTANT_COUNT = 50;

// Helper: Read file contents safely
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Count !important declarations in content (excluding comments)
function countImportant(content) {
  if (!content) return 0;
  // Remove block comments /* ... */ first
  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
  const matches = noComments.match(/!important/g);
  return matches ? matches.length : 0;
}

// Helper: Check for balanced braces
function hasBracesBalanced(content) {
  if (!content) return false;
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  return openBraces === closeBraces;
}

// Helper: Extract all selectors from CSS (outside @keyframes)
function extractSelectors(content) {
  if (!content) return [];

  const selectors = [];
  // Remove comments
  let noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove @keyframes blocks entirely (they're not selectors)
  noComments = noComments.replace(/@keyframes[^{]+\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g, '');

  // Match selectors (text before {, not @-rules)
  const selectorRegex = /([^{}@]+)\s*\{/g;
  let match;

  while ((match = selectorRegex.exec(noComments)) !== null) {
    const selector = match[1].trim();
    if (selector.length > 0 && !selector.startsWith('@')) {
      // Split multiple selectors separated by comma
      const parts = selector.split(',').map(s => s.trim()).filter(s => s.length > 0);
      selectors.push(...parts);
    }
  }

  return selectors;
}

// Helper: Count class depth in a selector
function getMaxClassDepth(selector) {
  // Count classes in selector (e.g., ".a .b .c .d" = 4)
  // Also count :has(), :not() pseudo-classes as single unit
  const cleanSelector = selector
    .replace(/:has\([^)]+\)/g, '') // Remove :has() content
    .replace(/:not\([^)]+\)/g, ''); // Remove :not() content

  const classes = cleanSelector.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g);
  return classes ? classes.length : 0;
}

// Helper: Extract !important declarations with their selectors and properties
function extractImportantDeclarations(content) {
  if (!content) return [];

  const declarations = [];
  // Remove comments
  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Find each rule block
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(noComments)) !== null) {
    const selector = match[1].trim();
    const body = match[2];

    // Find !important declarations in the body
    const propRegex = /([a-z-]+)\s*:\s*([^;]+!important[^;]*);?/gi;
    let propMatch;

    while ((propMatch = propRegex.exec(body)) !== null) {
      declarations.push({
        selector: selector,
        property: propMatch[1].trim(),
        value: propMatch[2].trim(),
      });
    }
  }

  return declarations;
}

// Helper: Check if declaration is in acceptable category
function isAcceptableImportant(declaration) {
  const { property, value, selector } = declaration;

  // Acceptable categories for !important:
  // 1. Spinner/skeleton hiding (display: none, visibility: hidden)
  // 2. Visibility toggles during state changes
  // 3. Aria-related visibility states
  // 4. Properties fighting inline styles from Adobe

  const acceptablePatterns = [
    // Display none for hiding spinners/skeletons
    { property: 'display', value: /none/ },
    // Visibility for state toggles
    { property: 'visibility', value: /hidden|visible/ },
    // Opacity for hiding/showing
    { property: 'opacity', value: /0|1/ },
    // Position absolute for hiding (left: -9999px pattern)
    { property: 'left', value: /-9999px/ },
    { property: 'position', value: /absolute/ },
    // Width/height 0 for hiding
    { property: 'width', value: /^0$|^0px$/ },
    { property: 'height', value: /^0$|^0px$/ },
    // Pointer events for disabled states
    { property: 'pointer-events', value: /none/ },
  ];

  // Check if selector contains loading/spinner/skeleton/state classes
  const stateSelectors = [
    /spinner/i,
    /loading/i,
    /skeleton/i,
    /preload/i,
    /validating/i,
    /clearing/i,
    /updating/i,
    /\[aria-/,
    /\[role=/,
    /dropin-icon/i,
  ];

  const isStateSelector = stateSelectors.some(pattern => pattern.test(selector));

  // If it's a state-related selector, allow hiding-related !important
  if (isStateSelector) {
    return acceptablePatterns.some(pattern =>
      pattern.property === property && pattern.value.test(value)
    );
  }

  // For validating/clearing states, also allow specific display/visibility overrides
  if (/validating|clearing/.test(selector)) {
    if (['display', 'visibility', 'opacity'].includes(property)) {
      return true;
    }
  }

  return false;
}

// ============================================
// TEST 1: Important Count Reduction
// ============================================

describe('Test 1: Important Count Reduction', () => {
  it('should have total !important count under 50 across all CSS files', () => {
    // Given: all 5 CSS component files
    let totalCount = 0;
    const fileCounts = {};

    for (const [name, filePath] of Object.entries(CSS_FILES)) {
      const content = readFile(filePath);
      const count = countImportant(content);
      fileCounts[name] = count;
      totalCount += count;
    }

    // When: I count !important declarations
    // Then: total should be <50 (down from ~293)
    assert.ok(totalCount < MAX_IMPORTANT_COUNT,
      `Total !important count should be <${MAX_IMPORTANT_COUNT}. Found: ${totalCount}. ` +
      `Breakdown: ${JSON.stringify(fileCounts)}`);
  });

  it('should have grid.css !important count reduced significantly', () => {
    // Given: grid.css had ~30 !important declarations
    const content = readFile(CSS_FILES.grid);
    const count = countImportant(content);

    // When: after BEM migration
    // Then: should have <10 !important (mostly for Adobe container nuclear options)
    assert.ok(count < 10,
      `grid.css should have <10 !important. Found: ${count}`);
  });

  it('should have product-card.css !important count reduced significantly', () => {
    // Given: product-card.css had ~21 !important declarations
    const content = readFile(CSS_FILES.productCard);
    const count = countImportant(content);

    // When: after BEM migration
    // Then: should have <5 !important (mostly for hover state overrides)
    assert.ok(count < 5,
      `product-card.css should have <5 !important. Found: ${count}`);
  });

  it('should have facets.css !important count reduced significantly', () => {
    // Given: facets.css had ~150 !important declarations
    const content = readFile(CSS_FILES.facets);
    const count = countImportant(content);

    // When: after BEM migration using .product-list-dropin specificity
    // Then: should have <10 !important
    assert.ok(count < 10,
      `facets.css should have <10 !important. Found: ${count}`);
  });

  it('should allow loading-states.css to keep !important for spinner hiding', () => {
    // Given: loading-states.css needs !important to override Adobe runtime styles
    const content = readFile(CSS_FILES.loadingStates);
    const count = countImportant(content);

    // When: these are for spinner/skeleton hiding
    // Then: should still have reasonable count (keeping what's necessary)
    // Loading states legitimately need !important for runtime overrides
    assert.ok(count <= 40,
      `loading-states.css should have <=40 !important (for spinner hiding). Found: ${count}`);
  });
});

// ============================================
// TEST 2: BEM Specificity Chain Pattern Used
// ============================================

describe('Test 2: BEM Specificity Chain Pattern Used', () => {
  it('should use .product-list-dropin prefix in grid.css selectors', () => {
    // Given: grid.css and product-card.css
    const content = readFile(CSS_FILES.grid);
    const selectors = extractSelectors(content);

    // When: I check selector patterns for dropin classes
    // Then: selectors with .dropin-* should use .product-list-dropin prefix

    // Find selectors that target dropin classes but don't have parent chain
    const dropinSelectors = selectors.filter(s =>
      s.includes('.dropin-') &&
      !s.includes('.product-list-dropin') &&
      !s.startsWith('.product-list-dropin')
    );

    // Exclude some acceptable patterns (generic resets, keyframes)
    const problematic = dropinSelectors.filter(s =>
      !s.includes('[class*=') && // Attribute selectors are ok
      !s.includes('*') // Universal selectors are ok
    );

    assert.ok(problematic.length === 0,
      `grid.css dropin selectors should use .product-list-dropin prefix. ` +
      `Found without prefix: ${problematic.slice(0, 5).join(', ')}`);
  });

  it('should use .product-list-dropin prefix in product-card.css selectors', () => {
    const content = readFile(CSS_FILES.productCard);
    const selectors = extractSelectors(content);

    // Check that dropin-scoped selectors use the parent chain
    const dropinSelectors = selectors.filter(s =>
      s.includes('.dropin-product-item-card') &&
      !s.includes('.product-list-dropin') &&
      !s.startsWith('.dropin-product-item-card ') // Direct descendant selectors
    );

    // These should be few - main card selectors should have parent
    // Allow .dropin-product-item-card as a chained selector (e.g., ".dropin-product-item-card .buildright-*")
    const needsPrefix = dropinSelectors.filter(s => s === '.dropin-product-item-card');

    assert.ok(needsPrefix.length === 0,
      `product-card.css should scope .dropin-product-item-card with .product-list-dropin. ` +
      `Found: ${needsPrefix.join(', ')}`);
  });

  it('should use .product-list-dropin prefix in facets.css selectors', () => {
    const content = readFile(CSS_FILES.facets);
    const selectors = extractSelectors(content);

    // Check that dropin-facets-container is scoped
    const facetSelectors = selectors.filter(s =>
      s.includes('.dropin-facets-container') &&
      !s.includes('.product-list-dropin')
    );

    assert.ok(facetSelectors.length === 0,
      `facets.css should scope .dropin-facets-container with .product-list-dropin. ` +
      `Found without prefix: ${facetSelectors.slice(0, 5).join(', ')}`);
  });

  it('should have buildright classes scoped under dropin-product-item-card', () => {
    const content = readFile(CSS_FILES.productCard);
    const selectors = extractSelectors(content);

    // .buildright-* selectors should be scoped under card or container
    const buildrightSelectors = selectors.filter(s =>
      s.includes('.buildright-') &&
      !s.includes('.dropin-product-item-card') &&
      !s.includes('.product-list-dropin')
    );

    // Allow standalone buildright classes that are truly standalone (empty state, etc.)
    const standalone = buildrightSelectors.filter(s =>
      !s.includes('.buildright-empty') // Empty state is standalone
    );

    assert.ok(standalone.length < 5,
      `Most .buildright-* selectors should be scoped. ` +
      `Found unscoped: ${standalone.slice(0, 5).join(', ')}`);
  });
});

// ============================================
// TEST 3: CSS Parses Without Errors
// ============================================

describe('Test 3: CSS Parses Without Errors', () => {
  it('should have balanced braces in grid.css after migration', () => {
    const content = readFile(CSS_FILES.grid);
    assert.ok(content, 'grid.css should exist');
    assert.ok(hasBracesBalanced(content),
      'grid.css should have balanced braces after migration');
  });

  it('should have balanced braces in product-card.css after migration', () => {
    const content = readFile(CSS_FILES.productCard);
    assert.ok(content, 'product-card.css should exist');
    assert.ok(hasBracesBalanced(content),
      'product-card.css should have balanced braces after migration');
  });

  it('should have balanced braces in facets.css after migration', () => {
    const content = readFile(CSS_FILES.facets);
    assert.ok(content, 'facets.css should exist');
    assert.ok(hasBracesBalanced(content),
      'facets.css should have balanced braces after migration');
  });

  it('should have balanced braces in loading-states.css after migration', () => {
    const content = readFile(CSS_FILES.loadingStates);
    assert.ok(content, 'loading-states.css should exist');
    assert.ok(hasBracesBalanced(content),
      'loading-states.css should have balanced braces after migration');
  });

  it('should have balanced braces in pagination.css after migration', () => {
    const content = readFile(CSS_FILES.pagination);
    assert.ok(content, 'pagination.css should exist');
    assert.ok(hasBracesBalanced(content),
      'pagination.css should have balanced braces after migration');
  });
});

// ============================================
// TEST 4: Acceptable Important Categories Only
// ============================================

describe('Test 4: Acceptable Important Categories Only', () => {
  it('should have only acceptable !important categories in grid.css', () => {
    const content = readFile(CSS_FILES.grid);
    const declarations = extractImportantDeclarations(content);

    // Filter out acceptable declarations
    const unacceptable = declarations.filter(d => !isAcceptableImportant(d));

    assert.ok(unacceptable.length === 0,
      `grid.css should only have acceptable !important categories. ` +
      `Found unacceptable: ${JSON.stringify(unacceptable.slice(0, 3))}`);
  });

  it('should have only acceptable !important categories in product-card.css', () => {
    const content = readFile(CSS_FILES.productCard);
    const declarations = extractImportantDeclarations(content);

    const unacceptable = declarations.filter(d => !isAcceptableImportant(d));

    assert.ok(unacceptable.length === 0,
      `product-card.css should only have acceptable !important categories. ` +
      `Found unacceptable: ${JSON.stringify(unacceptable.slice(0, 3))}`);
  });

  it('should have only acceptable !important categories in facets.css', () => {
    const content = readFile(CSS_FILES.facets);
    const declarations = extractImportantDeclarations(content);

    const unacceptable = declarations.filter(d => !isAcceptableImportant(d));

    assert.ok(unacceptable.length === 0,
      `facets.css should only have acceptable !important categories. ` +
      `Found unacceptable: ${JSON.stringify(unacceptable.slice(0, 3))}`);
  });

  it('should have acceptable !important categories in loading-states.css', () => {
    const content = readFile(CSS_FILES.loadingStates);
    const declarations = extractImportantDeclarations(content);

    // Loading states should mostly be acceptable (hiding spinners)
    const unacceptable = declarations.filter(d => !isAcceptableImportant(d));

    // Allow some for special animation/state cases
    assert.ok(unacceptable.length < 10,
      `loading-states.css should mostly have acceptable !important. ` +
      `Found ${unacceptable.length} unacceptable: ${JSON.stringify(unacceptable.slice(0, 3))}`);
  });
});

// ============================================
// TEST 5: No Important on BuildRight Classes
// ============================================

describe('Test 5: No Important on BuildRight Classes', () => {
  it('should not use !important on .buildright-* selectors in grid.css', () => {
    const content = readFile(CSS_FILES.grid);
    const declarations = extractImportantDeclarations(content);

    // Filter for buildright selectors
    const buildrightImportant = declarations.filter(d =>
      d.selector.includes('.buildright-')
    );

    assert.strictEqual(buildrightImportant.length, 0,
      `grid.css should not use !important on .buildright-* classes. ` +
      `Found: ${JSON.stringify(buildrightImportant.slice(0, 3))}`);
  });

  it('should not use !important on .buildright-* selectors in product-card.css', () => {
    const content = readFile(CSS_FILES.productCard);
    const declarations = extractImportantDeclarations(content);

    const buildrightImportant = declarations.filter(d =>
      d.selector.includes('.buildright-')
    );

    assert.strictEqual(buildrightImportant.length, 0,
      `product-card.css should not use !important on .buildright-* classes. ` +
      `Found: ${JSON.stringify(buildrightImportant.slice(0, 3))}`);
  });

  it('should not use !important on .buildright-* selectors in facets.css', () => {
    const content = readFile(CSS_FILES.facets);
    const declarations = extractImportantDeclarations(content);

    const buildrightImportant = declarations.filter(d =>
      d.selector.includes('.buildright-')
    );

    assert.strictEqual(buildrightImportant.length, 0,
      `facets.css should not use !important on .buildright-* classes. ` +
      `Found: ${JSON.stringify(buildrightImportant.slice(0, 3))}`);
  });
});

// ============================================
// TEST 6: Max Selector Depth
// ============================================

describe('Test 6: Max Selector Depth', () => {
  it('should have max 4 class depth in grid.css selectors', () => {
    const content = readFile(CSS_FILES.grid);
    const selectors = extractSelectors(content);

    const tooDeep = selectors.filter(s => getMaxClassDepth(s) > 4);

    assert.ok(tooDeep.length === 0,
      `grid.css selectors should have max 4 class depth. ` +
      `Found too deep: ${tooDeep.slice(0, 3).map(s => `"${s}" (depth: ${getMaxClassDepth(s)})`).join(', ')}`);
  });

  it('should have max 4 class depth in product-card.css selectors', () => {
    const content = readFile(CSS_FILES.productCard);
    const selectors = extractSelectors(content);

    const tooDeep = selectors.filter(s => getMaxClassDepth(s) > 4);

    assert.ok(tooDeep.length === 0,
      `product-card.css selectors should have max 4 class depth. ` +
      `Found too deep: ${tooDeep.slice(0, 3).map(s => `"${s}" (depth: ${getMaxClassDepth(s)})`).join(', ')}`);
  });

  it('should have max 4 class depth in facets.css selectors', () => {
    const content = readFile(CSS_FILES.facets);
    const selectors = extractSelectors(content);

    const tooDeep = selectors.filter(s => getMaxClassDepth(s) > 4);

    assert.ok(tooDeep.length === 0,
      `facets.css selectors should have max 4 class depth. ` +
      `Found too deep: ${tooDeep.slice(0, 3).map(s => `"${s}" (depth: ${getMaxClassDepth(s)})`).join(', ')}`);
  });

  it('should have max 4 class depth in loading-states.css selectors', () => {
    const content = readFile(CSS_FILES.loadingStates);
    const selectors = extractSelectors(content);

    const tooDeep = selectors.filter(s => getMaxClassDepth(s) > 4);

    assert.ok(tooDeep.length === 0,
      `loading-states.css selectors should have max 4 class depth. ` +
      `Found too deep: ${tooDeep.slice(0, 3).map(s => `"${s}" (depth: ${getMaxClassDepth(s)})`).join(', ')}`);
  });

  it('should have max 4 class depth in pagination.css selectors', () => {
    const content = readFile(CSS_FILES.pagination);
    const selectors = extractSelectors(content);

    const tooDeep = selectors.filter(s => getMaxClassDepth(s) > 4);

    assert.ok(tooDeep.length === 0,
      `pagination.css selectors should have max 4 class depth. ` +
      `Found too deep: ${tooDeep.slice(0, 3).map(s => `"${s}" (depth: ${getMaxClassDepth(s)})`).join(', ')}`);
  });
});

// ============================================
// TEST 7: Selector Structure Validation
// ============================================

describe('Test 7: Selector Structure Validation', () => {
  it('should preserve responsive breakpoints after migration', () => {
    // All files combined should still have responsive breakpoints
    let allContent = '';
    for (const filePath of Object.values(CSS_FILES)) {
      const content = readFile(filePath);
      if (content) allContent += content;
    }

    assert.ok(allContent.includes('@media'),
      'CSS should contain @media queries');
    assert.ok(allContent.includes('1200px') || allContent.includes('max-width: 75em'),
      'CSS should contain 1200px breakpoint');
    assert.ok(allContent.includes('768px') || allContent.includes('max-width: 48em'),
      'CSS should contain 768px breakpoint');
    assert.ok(allContent.includes('480px') || allContent.includes('max-width: 30em'),
      'CSS should contain 480px breakpoint');
  });

  it('should preserve @keyframes animations', () => {
    const loadingContent = readFile(CSS_FILES.loadingStates);
    assert.ok(loadingContent, 'loading-states.css should exist');

    // Should have key animations
    assert.ok(loadingContent.includes('@keyframes'),
      'loading-states.css should contain @keyframes');
    assert.ok(loadingContent.includes('shimmer') || loadingContent.includes('spin'),
      'loading-states.css should contain shimmer or spin animations');
  });

  it('should have consistent selector patterns for dropin overrides', () => {
    const gridContent = readFile(CSS_FILES.grid);
    assert.ok(gridContent, 'grid.css should exist');

    // Main grid selector should use parent chain
    assert.ok(
      gridContent.includes('.product-list-dropin .product-discovery-product-list__grid') ||
      gridContent.includes('.product-list-dropin .dropin-'),
      'Grid should use .product-list-dropin parent chain for specificity'
    );
  });
});
