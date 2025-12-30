/**
 * Footer Category Synchronization Tests
 *
 * TDD tests for Step 3: Refactor footer to use ACO data
 * Validates that footer.js updates Products column category links
 * with ACO-sourced category names via getCategories() and getCategoryDisplayName().
 *
 * Run with: node --test tests/footer-category-sync.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCKS_DIR = path.join(__dirname, '..', 'blocks');
const FOOTER_PATH = path.join(BLOCKS_DIR, 'footer', 'footer.js');
const MESH_CLIENT_PATH = path.join(__dirname, '..', 'scripts', 'services', 'mesh-client.js');

// Helper: Read JavaScript file contents
function readJSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Test suite
describe('Footer Category Synchronization', () => {
  let footerContent;
  let meshClientContent;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(FOOTER_PATH),
      `footer.js should exist at ${FOOTER_PATH}`);
    assert.ok(fileExists(MESH_CLIENT_PATH),
      `mesh-client.js should exist at ${MESH_CLIENT_PATH}`);

    // Read file contents
    footerContent = readJSFile(FOOTER_PATH);
    meshClientContent = readJSFile(MESH_CLIENT_PATH);

    console.log('\n=== File Analysis ===');
    console.log(`Footer file: ${footerContent.split('\n').length} lines`);
    console.log(`Mesh client file: ${meshClientContent.split('\n').length} lines`);
  });

  // ============================================
  // TEST 1: Import Statement Present
  // ============================================

  describe('Test 1: Import Statement Present', () => {
    it('should import getCategories from mesh-client.js', () => {
      // Given: footer.js file
      // When: checking for imports
      // Then: should import getCategories from mesh-client.js

      const hasGetCategoriesImport = footerContent.includes('getCategories');
      const hasMeshClientImport = footerContent.includes('mesh-client.js');

      assert.ok(
        hasGetCategoriesImport && hasMeshClientImport,
        'Should import getCategories from ../../scripts/services/mesh-client.js'
      );
    });

    it('should import getCategoryDisplayName from mesh-client.js', () => {
      // Given: footer.js file
      // When: checking for imports
      // Then: should import getCategoryDisplayName from mesh-client.js

      const hasGetCategoryDisplayNameImport = footerContent.includes('getCategoryDisplayName');

      assert.ok(
        hasGetCategoryDisplayNameImport,
        'Should import getCategoryDisplayName from ../../scripts/services/mesh-client.js'
      );
    });

    it('should have properly formed import statement', () => {
      // Given: footer.js file
      // When: checking import format
      // Then: should have correct import syntax

      const importRegex = /import\s*\{\s*getCategories\s*,\s*getCategoryDisplayName\s*\}\s*from\s*['"]\.\.\/\.\.\/scripts\/services\/mesh-client\.js['"]/;
      const hasProperImport = importRegex.test(footerContent);

      assert.ok(
        hasProperImport,
        "Import should be: import { getCategories, getCategoryDisplayName } from '../../scripts/services/mesh-client.js'"
      );
    });
  });

  // ============================================
  // TEST 2: decorate Function is Async
  // ============================================

  describe('Test 2: decorate Function is Async', () => {
    it('should have async decorate function', () => {
      // Given: footer.js file
      // When: checking decorate function signature
      // Then: should be async export default async function decorate

      const hasAsyncDecorate = footerContent.includes('export default async function decorate');

      assert.ok(
        hasAsyncDecorate,
        'decorate function should be async: export default async function decorate(block)'
      );
    });

    it('should await updateProductsColumnWithACO call', () => {
      // Given: decorate function calls updateProductsColumnWithACO
      // When: checking for await
      // Then: should use await

      const awaitsUpdateProductsColumn = footerContent.includes('await updateProductsColumnWithACO');

      assert.ok(
        awaitsUpdateProductsColumn,
        'decorate should await updateProductsColumnWithACO(block) call'
      );
    });
  });

  // ============================================
  // TEST 3: updateProductsColumnWithACO Function Exists
  // ============================================

  describe('Test 3: updateProductsColumnWithACO Function Exists', () => {
    it('should have async updateProductsColumnWithACO function', () => {
      // Given: footer.js file
      // When: checking function definitions
      // Then: should have async updateProductsColumnWithACO function

      const hasAsyncUpdateFunction = footerContent.includes('async function updateProductsColumnWithACO');

      assert.ok(
        hasAsyncUpdateFunction,
        'Should have async function updateProductsColumnWithACO(block)'
      );
    });

    it('should accept block parameter', () => {
      // Given: updateProductsColumnWithACO function
      // When: checking function signature
      // Then: should accept block parameter

      const hasBlockParam = footerContent.includes('updateProductsColumnWithACO(block)');

      assert.ok(
        hasBlockParam,
        'updateProductsColumnWithACO should accept block parameter'
      );
    });

    it('should have JSDoc comment for function', () => {
      // Given: updateProductsColumnWithACO function
      // When: checking for documentation
      // Then: should have JSDoc comment

      const hasJSDoc = footerContent.includes('* Update Products column');

      assert.ok(
        hasJSDoc,
        'updateProductsColumnWithACO should have JSDoc documentation'
      );
    });
  });

  // ============================================
  // TEST 4: Products Column Detection
  // ============================================

  describe('Test 4: Products Column Detection', () => {
    it('should find Products column by heading text', () => {
      // Given: footer HTML has Products column with .footer-heading
      // When: updateProductsColumnWithACO executes
      // Then: should find heading with text "Products"

      const findsHeadings = footerContent.includes('.footer-heading');
      const checksTextContent = footerContent.includes('.textContent');
      const checksProducts = footerContent.includes("'Products'") || footerContent.includes('"Products"');

      assert.ok(
        findsHeadings && checksProducts,
        'Should find Products column by querying .footer-heading with text "Products"'
      );
    });

    it('should use closest to find footer-column container', () => {
      // Given: heading element is found
      // When: finding the column container
      // Then: should use closest(.footer-column)

      const usesClosest = footerContent.includes(".closest('.footer-column')") ||
                          footerContent.includes('.closest(".footer-column")');

      assert.ok(
        usesClosest,
        'Should use closest(".footer-column") to find the Products column container'
      );
    });

    it('should return early if Products column not found', () => {
      // Given: Products column might not exist
      // When: column is not found
      // Then: should return early without error

      const hasEarlyReturn = footerContent.includes('if (!productsColumn) return');

      assert.ok(
        hasEarlyReturn,
        'Should return early if Products column is not found'
      );
    });
  });

  // ============================================
  // TEST 5: ACO Categories Fetch
  // ============================================

  describe('Test 5: ACO Categories Fetch', () => {
    it('should call getCategories() to fetch ACO data', () => {
      // Given: updateProductsColumnWithACO function
      // When: fetching categories
      // Then: should call getCategories()

      const callsGetCategories = footerContent.includes('await getCategories()');

      assert.ok(
        callsGetCategories,
        'Should call await getCategories() to fetch ACO category data'
      );
    });

    it('should destructure categories from getCategories result', () => {
      // Given: getCategories() returns { categories: [...] }
      // When: using result
      // Then: should destructure { categories }

      const destructuresCategories = footerContent.includes('{ categories }') &&
                                     footerContent.includes('await getCategories()');

      assert.ok(
        destructuresCategories,
        'Should destructure categories: const { categories } = await getCategories()'
      );
    });

    it('should return early if categories is empty', () => {
      // Given: getCategories() might return empty array
      // When: categories is empty
      // Then: should return early (graceful fallback)

      const hasEmptyCheck = footerContent.includes('categories.length === 0') ||
                            footerContent.includes('!categories') ||
                            footerContent.includes('categories || categories.length');

      assert.ok(
        hasEmptyCheck,
        'Should return early if categories is empty or undefined'
      );
    });
  });

  // ============================================
  // TEST 6: Category Link Updates
  // ============================================

  describe('Test 6: Category Link Updates', () => {
    it('should query footer-links anchor elements', () => {
      // Given: Products column has .footer-links ul with links
      // When: updating links
      // Then: should query for .footer-links a

      const queriesLinks = footerContent.includes(".footer-links a") ||
                           footerContent.includes('.footer-links a');

      assert.ok(
        queriesLinks,
        'Should query for .footer-links a elements in Products column'
      );
    });

    it('should skip links without category query param', () => {
      // Given: "All Products" link has no ?category= param
      // When: processing links
      // Then: should skip links without category param

      const checksForCategoryParam = footerContent.includes('?category=');

      assert.ok(
        checksForCategoryParam,
        'Should check for ?category= in href to identify category links'
      );
    });

    it('should extract category slug from URL', () => {
      // Given: link href contains ?category=structural_materials
      // When: parsing URL
      // Then: should extract category slug

      const extractsSlug = footerContent.includes('searchParams.get') ||
                           footerContent.includes("'category'");

      assert.ok(
        extractsSlug,
        'Should extract category slug from URL searchParams'
      );
    });

    it('should use getCategoryDisplayName for link text', () => {
      // Given: category slug is extracted
      // When: updating link text
      // Then: should use getCategoryDisplayName(slug, categories)

      const usesGetCategoryDisplayName = footerContent.includes('getCategoryDisplayName(');

      assert.ok(
        usesGetCategoryDisplayName,
        'Should call getCategoryDisplayName(slug, categories) to get display name'
      );
    });

    it('should update link textContent with display name', () => {
      // Given: getCategoryDisplayName returns display name
      // When: updating link
      // Then: should set link.textContent

      const updatesTextContent = footerContent.includes('link.textContent =');

      assert.ok(
        updatesTextContent,
        'Should update link.textContent with ACO display name'
      );
    });
  });

  // ============================================
  // TEST 7: Error Handling for Graceful Degradation
  // ============================================

  describe('Test 7: Error Handling for Graceful Degradation', () => {
    it('should wrap ACO calls in try-catch', () => {
      // Given: updateProductsColumnWithACO function
      // When: checking error handling
      // Then: should have try-catch block

      const hasTryCatch = footerContent.includes('try {') && footerContent.includes('catch (');

      assert.ok(
        hasTryCatch,
        'Should wrap ACO operations in try-catch for graceful degradation'
      );
    });

    it('should log warning on error (not throw)', () => {
      // Given: error occurs during ACO fetch
      // When: catch block executes
      // Then: should console.warn (not throw)

      const logsWarning = footerContent.includes('console.warn');

      assert.ok(
        logsWarning,
        'Should use console.warn for errors (graceful degradation, not error)'
      );
    });

    it('should have informative error message', () => {
      // Given: catch block logs warning
      // When: checking message
      // Then: should mention Footer and ACO

      const hasInformativeMessage = footerContent.includes('[Footer]') ||
                                    footerContent.includes('category names from ACO');

      assert.ok(
        hasInformativeMessage,
        'Error message should be informative (mention Footer and ACO context)'
      );
    });
  });

  // ============================================
  // TEST 8: basePath Logic Preserved
  // ============================================

  describe('Test 8: basePath Logic Preserved', () => {
    it('should still have BASE_PATH logic', () => {
      // Given: footer.js had basePath logic for GitHub Pages
      // When: checking after refactor
      // Then: basePath logic should still exist

      const hasBasePathLogic = footerContent.includes('window.BASE_PATH') ||
                               footerContent.includes('basePath');

      assert.ok(
        hasBasePathLogic,
        'basePath logic for GitHub Pages compatibility should be preserved'
      );
    });

    it('should still fix static link paths', () => {
      // Given: original code fixed links starting with pages/
      // When: checking after refactor
      // Then: logic should still exist

      const hasPageLinksLogic = footerContent.includes('pages/') ||
                                footerContent.includes('pageLinks');

      assert.ok(
        hasPageLinksLogic,
        'Static link path fixing logic should be preserved'
      );
    });

    it('should have basePath applied before ACO update', () => {
      // Given: decorate function has both basePath and ACO logic
      // When: checking order
      // Then: basePath logic should come before ACO update

      const basePathIndex = footerContent.indexOf('basePath');
      const acoUpdateIndex = footerContent.indexOf('updateProductsColumnWithACO');

      assert.ok(
        basePathIndex < acoUpdateIndex,
        'basePath logic should execute before ACO category update'
      );
    });
  });

  // ============================================
  // TEST 9: URL Parsing Robustness
  // ============================================

  describe('Test 9: URL Parsing Robustness', () => {
    it('should use URL constructor for parsing', () => {
      // Given: href attribute needs to be parsed
      // When: extracting category slug
      // Then: should use URL constructor

      const usesURLConstructor = footerContent.includes('new URL(');

      assert.ok(
        usesURLConstructor,
        'Should use new URL() constructor for robust URL parsing'
      );
    });

    it('should handle relative URLs by providing origin', () => {
      // Given: href might be relative (/pages/catalog.html?category=...)
      // When: constructing URL
      // Then: should provide window.location.origin as base

      const handlesRelativeURLs = footerContent.includes('window.location.origin');

      assert.ok(
        handlesRelativeURLs,
        'Should provide window.location.origin as base for URL constructor'
      );
    });

    it('should use searchParams.get for category extraction', () => {
      // Given: URL object is created
      // When: extracting category param
      // Then: should use url.searchParams.get("category")

      const usesSearchParams = footerContent.includes("searchParams.get('category')") ||
                               footerContent.includes('searchParams.get("category")');

      assert.ok(
        usesSearchParams,
        'Should use url.searchParams.get("category") for safe extraction'
      );
    });
  });

  // ============================================
  // TEST 10: Comment Quality
  // ============================================

  describe('Test 10: Comment Quality', () => {
    it('should have EDS compatible comment at top', () => {
      // Given: footer.js file
      // When: checking first line
      // Then: should have EDS compatible comment

      const hasEDSComment = footerContent.includes('// Footer block - EDS compatible');

      assert.ok(
        hasEDSComment,
        'Should preserve "// Footer block - EDS compatible" comment'
      );
    });

    it('should have comment about ACO category update', () => {
      // Given: decorate function has ACO update
      // When: checking comments
      // Then: should have comment explaining the ACO update

      const hasACOComment = footerContent.includes('// Update Products column') ||
                            footerContent.includes('// ACO category') ||
                            footerContent.includes('ACO');

      assert.ok(
        hasACOComment,
        'Should have comment explaining the ACO category update purpose'
      );
    });
  });

  // ============================================
  // Verification: mesh-client.js has required exports
  // ============================================

  describe('Verification: mesh-client.js has required exports (from Step 1)', () => {
    it('should export getCategories function', () => {
      // Given: mesh-client.js file
      // When: checking exports
      // Then: should export getCategories

      const exportsGetCategories = meshClientContent.includes('export async function getCategories') ||
                                   meshClientContent.includes('export function getCategories');

      assert.ok(
        exportsGetCategories,
        'mesh-client.js should export getCategories function (from Step 1)'
      );
    });

    it('should export getCategoryDisplayName function', () => {
      // Given: mesh-client.js file
      // When: checking exports
      // Then: should export getCategoryDisplayName

      const exportsGetCategoryDisplayName = meshClientContent.includes('export function getCategoryDisplayName');

      assert.ok(
        exportsGetCategoryDisplayName,
        'mesh-client.js should export getCategoryDisplayName function (from Step 1)'
      );
    });
  });
});
