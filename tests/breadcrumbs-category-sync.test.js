/**
 * Breadcrumbs Category Synchronization Tests
 *
 * TDD tests for Step 2: Refactor breadcrumbs.js to use getCategories()
 * Validates that breadcrumbs.js uses ACO category data via shared
 * getCategoryDisplayName() instead of hardcoded CATEGORY_NAMES map.
 *
 * Run with: node --test tests/breadcrumbs-category-sync.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCKS_DIR = path.join(__dirname, '..', 'blocks');
const BREADCRUMBS_PATH = path.join(BLOCKS_DIR, 'breadcrumbs', 'breadcrumbs.js');
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
describe('Breadcrumbs Category Synchronization', () => {
  let breadcrumbsContent;
  let meshClientContent;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(BREADCRUMBS_PATH),
      `breadcrumbs.js should exist at ${BREADCRUMBS_PATH}`);
    assert.ok(fileExists(MESH_CLIENT_PATH),
      `mesh-client.js should exist at ${MESH_CLIENT_PATH}`);

    // Read file contents
    breadcrumbsContent = readJSFile(BREADCRUMBS_PATH);
    meshClientContent = readJSFile(MESH_CLIENT_PATH);

    console.log('\n=== File Analysis ===');
    console.log(`Breadcrumbs file: ${breadcrumbsContent.split('\n').length} lines`);
    console.log(`Mesh client file: ${meshClientContent.split('\n').length} lines`);
  });

  describe('Test 1: CATEGORY_NAMES Map Removed', () => {
    it('should NOT have CATEGORY_NAMES constant', () => {
      // Given: breadcrumbs.js file
      // When: checking for CATEGORY_NAMES constant
      // Then: it should NOT exist (replaced by ACO data)

      const hasCategoryNames = breadcrumbsContent.includes('const CATEGORY_NAMES');
      const hasCategoryNamesMap = breadcrumbsContent.includes('CATEGORY_NAMES = {');

      assert.ok(
        !hasCategoryNames && !hasCategoryNamesMap,
        'CATEGORY_NAMES map should be removed - category data now comes from ACO via getCategories()'
      );
    });

    it('should NOT reference CATEGORY_NAMES in getDynamicBreadcrumbText', () => {
      // Given: getDynamicBreadcrumbText function
      // When: checking for CATEGORY_NAMES usage
      // Then: it should NOT use CATEGORY_NAMES[category]

      const usesCategoryNamesLookup = breadcrumbsContent.includes('CATEGORY_NAMES[category]');

      assert.ok(
        !usesCategoryNamesLookup,
        'getDynamicBreadcrumbText should NOT use CATEGORY_NAMES[category] - use getCategoryDisplayName() instead'
      );
    });
  });

  describe('Test 2: NAV_SECTION_NAMES Still Present', () => {
    it('should still have NAV_SECTION_NAMES constant', () => {
      // Given: breadcrumbs.js file
      // When: checking for NAV_SECTION_NAMES constant
      // Then: it should still exist (navigation sections are NOT category data)

      const hasNavSectionNames = breadcrumbsContent.includes('const NAV_SECTION_NAMES');
      const hasNavSectionNamesMap = breadcrumbsContent.includes('NAV_SECTION_NAMES = {');

      assert.ok(
        hasNavSectionNames || hasNavSectionNamesMap,
        'NAV_SECTION_NAMES map should be kept - these are navigation sections, not ACO categories'
      );
    });

    it('should have structural-materials in NAV_SECTION_NAMES', () => {
      // Given: NAV_SECTION_NAMES map
      // When: checking for structural-materials key
      // Then: it should exist

      const hasStructuralMaterials = breadcrumbsContent.includes("'structural-materials'");

      assert.ok(
        hasStructuralMaterials,
        'NAV_SECTION_NAMES should include structural-materials key'
      );
    });
  });

  describe('Test 3: Import Statement Present', () => {
    it('should import getCategories from mesh-client.js', () => {
      // Given: breadcrumbs.js file
      // When: checking for imports
      // Then: should import getCategories from mesh-client.js

      const hasGetCategoriesImport = breadcrumbsContent.includes('getCategories');
      const hasMeshClientImport = breadcrumbsContent.includes('mesh-client.js');

      assert.ok(
        hasGetCategoriesImport && hasMeshClientImport,
        'Should import getCategories from ../../scripts/services/mesh-client.js'
      );
    });

    it('should import getCategoryDisplayName from mesh-client.js', () => {
      // Given: breadcrumbs.js file
      // When: checking for imports
      // Then: should import getCategoryDisplayName from mesh-client.js

      const hasGetCategoryDisplayNameImport = breadcrumbsContent.includes('getCategoryDisplayName');

      assert.ok(
        hasGetCategoryDisplayNameImport,
        'Should import getCategoryDisplayName from ../../scripts/services/mesh-client.js'
      );
    });

    it('should have properly formed import statement', () => {
      // Given: breadcrumbs.js file
      // When: checking import format
      // Then: should have correct import syntax (may include additional imports like getCategoryBreadcrumbs)

      const importRegex = /import\s*\{[^}]*getCategories[^}]*getCategoryDisplayName[^}]*\}\s*from\s*['"]\.\.\/\.\.\/scripts\/services\/mesh-client\.js['"]/;
      const hasProperImport = importRegex.test(breadcrumbsContent);

      assert.ok(
        hasProperImport,
        "Import should include getCategories and getCategoryDisplayName from '../../scripts/services/mesh-client.js'"
      );
    });
  });

  describe('Test 4: decorate Function is Async', () => {
    it('should have async decorate function', () => {
      // Given: breadcrumbs.js file
      // When: checking decorate function signature
      // Then: should be async export default async function decorate

      const hasAsyncDecorate = breadcrumbsContent.includes('export default async function decorate');

      assert.ok(
        hasAsyncDecorate,
        'decorate function should be async: export default async function decorate(block)'
      );
    });

    it('should await getDynamicBreadcrumbText call', () => {
      // Given: decorate function calls getDynamicBreadcrumbText
      // When: checking for await
      // Then: should use await

      const awaitsGetDynamicBreadcrumbText = breadcrumbsContent.includes('await getDynamicBreadcrumbText');

      assert.ok(
        awaitsGetDynamicBreadcrumbText,
        'decorate should await getDynamicBreadcrumbText() call'
      );
    });

    it('should use for loop instead of forEach for async iteration', () => {
      // Given: decorate function iterates over rows
      // When: checking iteration pattern
      // Then: should use for loop (forEach does not await properly)

      // Check for for loop pattern
      const hasForLoop = breadcrumbsContent.includes('for (let') || breadcrumbsContent.includes('for (const');

      // Check that forEach is NOT used on rows in the decorate function
      // We need to be more specific - check if there's forEach on rows that would need await
      const decorateFunctionMatch = breadcrumbsContent.match(/export default async function decorate[\s\S]*?(?=\n(?:async\s+)?function\s|\nexport\s|$)/);
      let usesForEachOnRows = false;
      if (decorateFunctionMatch) {
        const decorateBody = decorateFunctionMatch[0];
        usesForEachOnRows = decorateBody.includes('rows.forEach');
      }

      assert.ok(
        hasForLoop && !usesForEachOnRows,
        'decorate should use for loop instead of forEach for async iteration over rows'
      );
    });
  });

  describe('Test 5: getDynamicBreadcrumbText is Async and Uses ACO', () => {
    it('should have async getDynamicBreadcrumbText function', () => {
      // Given: breadcrumbs.js file
      // When: checking getDynamicBreadcrumbText function signature
      // Then: should be async

      const hasAsyncGetDynamic = breadcrumbsContent.includes('async function getDynamicBreadcrumbText');

      assert.ok(
        hasAsyncGetDynamic,
        'getDynamicBreadcrumbText function should be async'
      );
    });

    it('should call getCategories() to fetch ACO data', () => {
      // Given: getDynamicBreadcrumbText function
      // When: checking for getCategories call
      // Then: should call getCategories()

      const callsGetCategories = breadcrumbsContent.includes('getCategories()');

      assert.ok(
        callsGetCategories,
        'getDynamicBreadcrumbText should call getCategories() to fetch ACO category data'
      );
    });

    it('should call getCategoryDisplayName with category and categories', () => {
      // Given: getDynamicBreadcrumbText function
      // When: checking for getCategoryDisplayName call
      // Then: should call getCategoryDisplayName(category, categories)

      const callsGetCategoryDisplayName = breadcrumbsContent.includes('getCategoryDisplayName(category');

      assert.ok(
        callsGetCategoryDisplayName,
        'getDynamicBreadcrumbText should call getCategoryDisplayName(category, categories)'
      );
    });

    it('should destructure categories from getCategories result', () => {
      // Given: getDynamicBreadcrumbText function calls getCategories()
      // When: checking how result is used
      // Then: should destructure { categories } from result

      const destructuresCategories = breadcrumbsContent.includes('{ categories }') &&
                                     breadcrumbsContent.includes('await getCategories()');

      assert.ok(
        destructuresCategories,
        'Should destructure categories: const { categories } = await getCategories()'
      );
    });
  });

  describe('Test 6: JSDoc Updated', () => {
    it('should have Promise<string> return type in getDynamicBreadcrumbText JSDoc', () => {
      // Given: getDynamicBreadcrumbText JSDoc comment
      // When: checking return type
      // Then: should be Promise<string>

      const hasPromiseReturnType = breadcrumbsContent.includes('@returns {Promise<string>}');

      assert.ok(
        hasPromiseReturnType,
        'getDynamicBreadcrumbText JSDoc should have @returns {Promise<string>}'
      );
    });
  });

  describe('Test 7: Category Lookup Logic Updated', () => {
    it('should check category existence before fetching', () => {
      // Given: getDynamicBreadcrumbText function
      // When: category URL param exists
      // Then: should fetch categories and use getCategoryDisplayName
      // (Previously: if (category && CATEGORY_NAMES[category]))
      // (Now: if (category) { const { categories } = await getCategories(); return getCategoryDisplayName(category, categories); })

      // The old pattern was: if (category && CATEGORY_NAMES[category])
      // The new pattern should be: if (category) { ... getCategories() ... }
      const oldPattern = breadcrumbsContent.includes('CATEGORY_NAMES[category]');
      const newPattern = breadcrumbsContent.includes('if (category)') &&
                        breadcrumbsContent.includes('getCategories()') &&
                        breadcrumbsContent.includes('getCategoryDisplayName');

      assert.ok(
        !oldPattern && newPattern,
        'Category lookup should use getCategoryDisplayName with ACO data, not CATEGORY_NAMES map'
      );
    });
  });

  describe('Verification: mesh-client.js has required exports', () => {
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
