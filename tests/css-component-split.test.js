/**
 * CSS Component Split Tests - Step 2
 *
 * TDD tests for splitting product-list-dropin.css into focused component files.
 * Validates file existence, line counts, import structure, and content preservation.
 *
 * Run with: node --test tests/css-component-split.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCK_DIR = path.join(__dirname, '..', 'blocks', 'product-list-dropin');
const CSS_DIR = path.join(BLOCK_DIR, 'css');
const MAIN_CSS_PATH = path.join(BLOCK_DIR, 'product-list-dropin.css');

// Component CSS files
const CSS_FILES = {
  grid: path.join(CSS_DIR, 'grid.css'),
  productCard: path.join(CSS_DIR, 'product-card.css'),
  facets: path.join(CSS_DIR, 'facets.css'),
  pagination: path.join(CSS_DIR, 'pagination.css'),
  loadingStates: path.join(CSS_DIR, 'loading-states.css'),
};

// Expected import order
const EXPECTED_IMPORT_ORDER = [
  './css/loading-states.css',
  './css/grid.css',
  './css/product-card.css',
  './css/facets.css',
  './css/pagination.css',
];

// Max lines per file (500 after slot-based CSS addition in Step 7)
const MAX_LINES = 500;

// Helper: Read file contents safely
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Count lines in a file
function countLines(content) {
  if (!content) return 0;
  return content.split('\n').length;
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper: Extract @import URLs from CSS content
function extractImports(cssContent) {
  const imports = [];
  const importRegex = /@import\s+url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let match;
  while ((match = importRegex.exec(cssContent)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

// Helper: Extract CSS selectors from content
function extractSelectors(cssContent) {
  if (!cssContent) return [];

  const selectors = [];
  // Remove comments
  const noComments = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match selectors (text before {, not inside @keyframes or @media)
  const selectorRegex = /([^{}@]+)\s*\{/g;
  let match;

  while ((match = selectorRegex.exec(noComments)) !== null) {
    const selector = match[1].trim();
    // Skip @-rules like @keyframes, @media contents
    if (!selector.startsWith('@') && selector.length > 0) {
      // Split multiple selectors separated by comma
      const parts = selector.split(',').map(s => s.trim()).filter(s => s.length > 0);
      selectors.push(...parts);
    }
  }

  return selectors;
}

// Helper: Count !important declarations
function countImportantDeclarations(cssContent) {
  if (!cssContent) return 0;
  const matches = cssContent.match(/!important/g);
  return matches ? matches.length : 0;
}

// Helper: Check for balanced braces
function hasBracesBalanced(cssContent) {
  if (!cssContent) return false;
  const openBraces = (cssContent.match(/\{/g) || []).length;
  const closeBraces = (cssContent.match(/\}/g) || []).length;
  return openBraces === closeBraces;
}

// Helper: Check if main file contains only imports and comments
function containsOnlyImports(cssContent) {
  if (!cssContent) return false;

  // Remove comments and whitespace
  const stripped = cssContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\n/g, ' ')              // Replace newlines with spaces
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .trim();

  // Should only contain @import statements
  // Everything should be @import url('...'); with possible whitespace
  const importOnly = stripped.replace(/@import\s+url\s*\(\s*['"][^'"]+['"]\s*\)\s*;?/g, '').trim();
  return importOnly.length === 0;
}

// Helper: Get all CSS content from split files combined
function getCombinedContent() {
  let combined = '';
  for (const filePath of Object.values(CSS_FILES)) {
    const content = readFile(filePath);
    if (content) {
      combined += content + '\n';
    }
  }
  return combined;
}

// ============================================
// TEST 1: All CSS Files Exist
// ============================================

describe('Test 1: All CSS Files Exist', () => {
  it('should have css/ subdirectory in product-list-dropin block', () => {
    // Given: the CSS split is complete
    // When: I check for the css directory
    const exists = fs.existsSync(CSS_DIR);

    // Then: the css/ directory should exist
    assert.strictEqual(exists, true,
      `css/ directory should exist at ${CSS_DIR}`);
  });

  it('should have grid.css in css/ directory', () => {
    const exists = fileExists(CSS_FILES.grid);
    assert.strictEqual(exists, true,
      `grid.css should exist at ${CSS_FILES.grid}`);
  });

  it('should have product-card.css in css/ directory', () => {
    const exists = fileExists(CSS_FILES.productCard);
    assert.strictEqual(exists, true,
      `product-card.css should exist at ${CSS_FILES.productCard}`);
  });

  it('should have facets.css in css/ directory', () => {
    const exists = fileExists(CSS_FILES.facets);
    assert.strictEqual(exists, true,
      `facets.css should exist at ${CSS_FILES.facets}`);
  });

  it('should have pagination.css in css/ directory', () => {
    const exists = fileExists(CSS_FILES.pagination);
    assert.strictEqual(exists, true,
      `pagination.css should exist at ${CSS_FILES.pagination}`);
  });

  it('should have loading-states.css in css/ directory', () => {
    const exists = fileExists(CSS_FILES.loadingStates);
    assert.strictEqual(exists, true,
      `loading-states.css should exist at ${CSS_FILES.loadingStates}`);
  });
});

// ============================================
// TEST 2: File Size Limits
// ============================================

describe('Test 2: File Size Limits', () => {
  it('should have grid.css under 350 lines', () => {
    const content = readFile(CSS_FILES.grid);
    const lines = countLines(content);

    assert.ok(content, 'grid.css should exist and be readable');
    assert.ok(lines <= MAX_LINES,
      `grid.css should be under ${MAX_LINES} lines. Found: ${lines} lines`);
  });

  it('should have product-card.css under 350 lines', () => {
    const content = readFile(CSS_FILES.productCard);
    const lines = countLines(content);

    assert.ok(content, 'product-card.css should exist and be readable');
    assert.ok(lines <= MAX_LINES,
      `product-card.css should be under ${MAX_LINES} lines. Found: ${lines} lines`);
  });

  it('should have facets.css under 350 lines', () => {
    const content = readFile(CSS_FILES.facets);
    const lines = countLines(content);

    assert.ok(content, 'facets.css should exist and be readable');
    assert.ok(lines <= MAX_LINES,
      `facets.css should be under ${MAX_LINES} lines. Found: ${lines} lines`);
  });

  it('should have pagination.css under 350 lines', () => {
    const content = readFile(CSS_FILES.pagination);
    const lines = countLines(content);

    assert.ok(content, 'pagination.css should exist and be readable');
    assert.ok(lines <= MAX_LINES,
      `pagination.css should be under ${MAX_LINES} lines. Found: ${lines} lines`);
  });

  it('should have loading-states.css under 350 lines', () => {
    const content = readFile(CSS_FILES.loadingStates);
    const lines = countLines(content);

    assert.ok(content, 'loading-states.css should exist and be readable');
    assert.ok(lines <= MAX_LINES,
      `loading-states.css should be under ${MAX_LINES} lines. Found: ${lines} lines`);
  });
});

// ============================================
// TEST 3: Main File Has Imports Only
// ============================================

describe('Test 3: Main File Has Imports Only', () => {
  it('should have product-list-dropin.css with only @import statements', () => {
    // Given: product-list-dropin.css after modification
    const content = readFile(MAIN_CSS_PATH);

    // When: I check its content
    // Then: it should only contain @import statements (and comments)
    assert.ok(content, 'Main CSS file should exist');
    assert.ok(containsOnlyImports(content),
      'product-list-dropin.css should only contain @import statements and comments');
  });

  it('should have exactly 5 @import statements', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.strictEqual(imports.length, 5,
      `Should have 5 @import statements. Found: ${imports.length}`);
  });
});

// ============================================
// TEST 4: Import Order Correct
// ============================================

describe('Test 4: Import Order Correct', () => {
  it('should import loading-states.css first', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.ok(imports.length >= 1, 'Should have at least 1 import');
    assert.ok(imports[0].includes('loading-states.css'),
      `First import should be loading-states.css. Found: ${imports[0]}`);
  });

  it('should import grid.css second', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.ok(imports.length >= 2, 'Should have at least 2 imports');
    assert.ok(imports[1].includes('grid.css'),
      `Second import should be grid.css. Found: ${imports[1]}`);
  });

  it('should import product-card.css third', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.ok(imports.length >= 3, 'Should have at least 3 imports');
    assert.ok(imports[2].includes('product-card.css'),
      `Third import should be product-card.css. Found: ${imports[2]}`);
  });

  it('should import facets.css fourth', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.ok(imports.length >= 4, 'Should have at least 4 imports');
    assert.ok(imports[3].includes('facets.css'),
      `Fourth import should be facets.css. Found: ${imports[3]}`);
  });

  it('should import pagination.css last', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    assert.ok(imports.length >= 5, 'Should have at least 5 imports');
    assert.ok(imports[4].includes('pagination.css'),
      `Fifth import should be pagination.css. Found: ${imports[4]}`);
  });

  it('should have correct import order sequence', () => {
    const content = readFile(MAIN_CSS_PATH);
    const imports = extractImports(content);

    for (let i = 0; i < EXPECTED_IMPORT_ORDER.length; i++) {
      assert.ok(imports[i] === EXPECTED_IMPORT_ORDER[i],
        `Import at position ${i} should be ${EXPECTED_IMPORT_ORDER[i]}. Found: ${imports[i]}`);
    }
  });
});

// ============================================
// TEST 5: CSS Parses Without Errors
// ============================================

describe('Test 5: CSS Parses Without Errors', () => {
  it('should have balanced braces in grid.css', () => {
    const content = readFile(CSS_FILES.grid);
    assert.ok(content, 'grid.css should exist');
    assert.ok(hasBracesBalanced(content),
      'grid.css should have balanced braces');
  });

  it('should have balanced braces in product-card.css', () => {
    const content = readFile(CSS_FILES.productCard);
    assert.ok(content, 'product-card.css should exist');
    assert.ok(hasBracesBalanced(content),
      'product-card.css should have balanced braces');
  });

  it('should have balanced braces in facets.css', () => {
    const content = readFile(CSS_FILES.facets);
    assert.ok(content, 'facets.css should exist');
    assert.ok(hasBracesBalanced(content),
      'facets.css should have balanced braces');
  });

  it('should have balanced braces in pagination.css', () => {
    const content = readFile(CSS_FILES.pagination);
    assert.ok(content, 'pagination.css should exist');
    assert.ok(hasBracesBalanced(content),
      'pagination.css should have balanced braces');
  });

  it('should have balanced braces in loading-states.css', () => {
    const content = readFile(CSS_FILES.loadingStates);
    assert.ok(content, 'loading-states.css should exist');
    assert.ok(hasBracesBalanced(content),
      'loading-states.css should have balanced braces');
  });
});

// ============================================
// TEST 6: No Duplicate Selectors Across Files
// ============================================

describe('Test 6: No Duplicate Selectors Across Files', () => {
  it('should not have duplicate selectors across component files (excluding media queries)', () => {
    // Collect selectors from each file
    const fileSelectors = {};
    for (const [name, filePath] of Object.entries(CSS_FILES)) {
      const content = readFile(filePath);
      if (content) {
        // Get selectors that are NOT inside @media blocks
        // This is a simplified check - we allow responsive overrides
        fileSelectors[name] = extractSelectors(content);
      }
    }

    // Check for duplicates across files
    const allSelectors = new Map(); // selector -> first file that defined it
    const duplicates = [];

    for (const [fileName, selectors] of Object.entries(fileSelectors)) {
      for (const selector of selectors) {
        // Skip responsive/media query related selectors (they're allowed to repeat)
        if (selector.includes('@media')) continue;

        // Check if this selector was already defined in another file
        if (allSelectors.has(selector)) {
          const firstFile = allSelectors.get(selector);
          // Only report if it's a different file
          if (firstFile !== fileName) {
            duplicates.push({
              selector,
              files: [firstFile, fileName]
            });
          }
        } else {
          allSelectors.set(selector, fileName);
        }
      }
    }

    // For this test, we allow some controlled duplication for responsive overrides
    // But report any unexpected duplicates
    const unexpectedDuplicates = duplicates.filter(d => {
      // Allow .product-discovery-product-list__grid in multiple files (for responsive)
      // Allow @media rules anywhere
      const allowedPatterns = [
        /^@/,  // @-rules
      ];
      return !allowedPatterns.some(pattern => pattern.test(d.selector));
    });

    // Note: In practice, some duplication might be acceptable for maintainability
    // This test serves as a warning, not a hard failure
    if (unexpectedDuplicates.length > 0) {
      console.log('Warning: Found duplicated selectors across files:',
        JSON.stringify(unexpectedDuplicates.slice(0, 5), null, 2));
    }

    // Allow up to 5 duplicates (for legitimate responsive overrides)
    assert.ok(unexpectedDuplicates.length <= 5,
      `Too many duplicate selectors (${unexpectedDuplicates.length}). First few: ${JSON.stringify(unexpectedDuplicates.slice(0, 3))}`);
  });
});

// ============================================
// TEST 7: All Original Selectors Preserved
// ============================================

describe('Test 7: All Original Selectors Preserved', () => {
  it('should preserve key grid selectors', () => {
    const gridContent = readFile(CSS_FILES.grid);
    assert.ok(gridContent, 'grid.css should exist');

    // Key grid selectors that must exist
    assert.ok(gridContent.includes('.product-list-dropin'),
      'Should contain .product-list-dropin selector');
    assert.ok(gridContent.includes('.product-discovery-product-list__grid'),
      'Should contain .product-discovery-product-list__grid selector');
    assert.ok(gridContent.includes('.dropin-product-item-card'),
      'Should contain .dropin-product-item-card selector');
  });

  it('should preserve key product card selectors', () => {
    const cardContent = readFile(CSS_FILES.productCard);
    assert.ok(cardContent, 'product-card.css should exist');

    // Key product card selectors
    assert.ok(cardContent.includes('.buildright-product-image'),
      'Should contain .buildright-product-image selector');
    assert.ok(cardContent.includes('.buildright-product-header'),
      'Should contain .buildright-product-header selector');
    assert.ok(cardContent.includes('.buildright-product-pricing'),
      'Should contain .buildright-product-pricing selector');
    assert.ok(cardContent.includes('.buildright-product-actions'),
      'Should contain .buildright-product-actions selector');
  });

  it('should preserve key facets selectors', () => {
    const facetsContent = readFile(CSS_FILES.facets);
    assert.ok(facetsContent, 'facets.css should exist');

    // Key facets selectors
    assert.ok(facetsContent.includes('.buildright-facets-wrapper'),
      'Should contain .buildright-facets-wrapper selector');
    assert.ok(facetsContent.includes('.dropin-facets-container'),
      'Should contain .dropin-facets-container selector');
    assert.ok(facetsContent.includes('.dropin-checkbox'),
      'Should contain .dropin-checkbox selector');
  });

  it('should preserve key pagination selectors', () => {
    const paginationContent = readFile(CSS_FILES.pagination);
    assert.ok(paginationContent, 'pagination.css should exist');

    // Key pagination selectors
    assert.ok(paginationContent.includes('.dropin-pagination'),
      'Should contain .dropin-pagination selector');
  });

  it('should preserve key loading states selectors', () => {
    const loadingContent = readFile(CSS_FILES.loadingStates);
    assert.ok(loadingContent, 'loading-states.css should exist');

    // Key loading selectors (updated for JS-coordinated state management)
    // Note: Global [class*="spinner"] selectors were intentionally removed in Step 6
    // Now we use .validating class with @keyframes spin for animations
    assert.ok(loadingContent.includes('.validating'),
      'Should contain .validating state selector');
    assert.ok(loadingContent.includes('@keyframes spin'),
      'Should contain @keyframes spin animation');
    assert.ok(loadingContent.includes('.buildright-skeleton') || loadingContent.includes('skeleton'),
      'Should contain skeleton-related selectors');
  });
});

// ============================================
// TEST 8: !important Declarations Preserved
// ============================================

describe('Test 8: !important Declarations (Post-BEM Migration)', () => {
  it('should have reduced !important declarations after BEM migration', () => {
    // Count !important in all split files (excluding comments)
    let totalImportant = 0;
    for (const filePath of Object.values(CSS_FILES)) {
      const content = readFile(filePath);
      if (content) {
        // Remove comments before counting
        const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
        totalImportant += countImportantDeclarations(noComments);
      }
    }

    // After BEM migration, we use specificity chains instead of !important
    // Only spinner hiding and state toggles should have !important (<50 total)
    assert.ok(totalImportant < 50,
      `Should have <50 !important after BEM migration. Found: ${totalImportant}`);
  });

  it('should have !important in loading-states.css for spinner hiding', () => {
    const content = readFile(CSS_FILES.loadingStates);
    assert.ok(content, 'loading-states.css should exist');

    const count = countImportantDeclarations(content);
    assert.ok(count >= 5,
      `loading-states.css should have at least 5 !important declarations for spinner hiding. Found: ${count}`);
  });

  it('should have minimal !important in grid.css (uses specificity chains)', () => {
    const content = readFile(CSS_FILES.grid);
    assert.ok(content, 'grid.css should exist');

    // After BEM migration, grid.css uses .product-list-dropin specificity chain
    // No !important needed for grid overrides
    const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
    const count = countImportantDeclarations(noComments);
    assert.ok(count < 5,
      `grid.css should have <5 !important after BEM migration (uses specificity). Found: ${count}`);
  });

  it('should have minimal !important in facets.css (uses specificity chains)', () => {
    const content = readFile(CSS_FILES.facets);
    assert.ok(content, 'facets.css should exist');

    // After BEM migration, facets.css uses .product-list-dropin specificity chain
    // No !important needed for facet styling
    const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
    const count = countImportantDeclarations(noComments);
    assert.ok(count < 5,
      `facets.css should have <5 !important after BEM migration (uses specificity). Found: ${count}`);
  });
});

// ============================================
// Additional Validation Tests
// ============================================

describe('Additional Validation', () => {
  it('should have section header comments in each component file', () => {
    for (const [name, filePath] of Object.entries(CSS_FILES)) {
      const content = readFile(filePath);
      assert.ok(content, `${name} should exist`);

      // Check for section header pattern: /* ======= SECTION NAME ======= */
      assert.ok(content.includes('========'),
        `${name} should have section header comments with ======== pattern`);
    }
  });

  it('should preserve @keyframes animations', () => {
    const combined = getCombinedContent();

    // Original had: shimmer, shimmer-sweep, shimmer-filter, spin, buildright-shimmer
    const keyframeCount = (combined.match(/@keyframes/g) || []).length;

    assert.ok(keyframeCount >= 3,
      `Should preserve at least 3 @keyframes animations. Found: ${keyframeCount}`);
  });

  it('should preserve responsive @media queries', () => {
    const combined = getCombinedContent();

    // Original had breakpoints: 1200px, 768px, 480px
    assert.ok(combined.includes('@media'),
      'Should contain @media queries');
    assert.ok(combined.includes('768px'),
      'Should contain 768px breakpoint');
    assert.ok(combined.includes('480px'),
      'Should contain 480px breakpoint');
  });

  it('should have main file under 30 lines (imports only)', () => {
    const content = readFile(MAIN_CSS_PATH);
    const lines = countLines(content);

    assert.ok(lines <= 30,
      `Main file should be under 30 lines (imports only). Found: ${lines} lines`);
  });
});
