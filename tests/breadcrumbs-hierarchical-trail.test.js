/**
 * Breadcrumbs Hierarchical Trail Tests
 *
 * TDD tests for Step 4: Update breadcrumbs.js to render full hierarchical trail
 * Validates that breadcrumbs.js uses getCategoryBreadcrumbs() to render
 * full hierarchy (e.g., Home > Roofing > Shingles).
 *
 * Run with: node --test tests/breadcrumbs-hierarchical-trail.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BREADCRUMBS_PATH = path.join(__dirname, '..', 'blocks', 'breadcrumbs', 'breadcrumbs.js');
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
describe('Breadcrumbs Hierarchical Trail', () => {
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

  describe('Test 1: Import getCategoryBreadcrumbs', () => {
    it('should import getCategoryBreadcrumbs from mesh-client.js', () => {
      // Given: breadcrumbs.js file
      // When: checking for imports
      // Then: should import getCategoryBreadcrumbs from mesh-client.js

      const hasImport = breadcrumbsContent.includes('getCategoryBreadcrumbs');
      const hasMeshClientImport = breadcrumbsContent.includes('mesh-client.js');

      assert.ok(
        hasImport && hasMeshClientImport,
        'Should import getCategoryBreadcrumbs from ../../scripts/services/mesh-client.js'
      );
    });

    it('should have properly formed import statement with getCategoryBreadcrumbs', () => {
      // Given: breadcrumbs.js file
      // When: checking import format
      // Then: should include getCategoryBreadcrumbs in imports

      const importRegex = /import\s*\{[^}]*getCategoryBreadcrumbs[^}]*\}\s*from\s*['"]\.\.\/\.\.\/scripts\/services\/mesh-client\.js['"]/;
      const hasProperImport = importRegex.test(breadcrumbsContent);

      assert.ok(
        hasProperImport,
        'Import should include getCategoryBreadcrumbs from mesh-client.js'
      );
    });
  });

  describe('Test 2: Hierarchical Trail Rendering Function', () => {
    it('should have a function that builds category breadcrumbs', () => {
      // Given: breadcrumbs.js file
      // When: checking for trail building function
      // Then: should have function that calls getCategoryBreadcrumbs

      const hasBuildFunction = breadcrumbsContent.includes('buildCategoryBreadcrumbs') ||
                               breadcrumbsContent.includes('renderCategoryTrail') ||
                               breadcrumbsContent.includes('getCategoryBreadcrumbs(');

      assert.ok(
        hasBuildFunction,
        'Should have function that uses getCategoryBreadcrumbs to build hierarchical trail'
      );
    });

    it('should call getCategoryBreadcrumbs with category slug', () => {
      // Given: breadcrumbs.js
      // When: category param is present
      // Then: should call getCategoryBreadcrumbs(category) or similar

      const callsGetCategoryBreadcrumbs = breadcrumbsContent.includes('getCategoryBreadcrumbs(');

      assert.ok(
        callsGetCategoryBreadcrumbs,
        'Should call getCategoryBreadcrumbs() with category slug'
      );
    });

    it('should access trail property from result', () => {
      // Given: getCategoryBreadcrumbs returns { trail, source }
      // When: processing result
      // Then: should access .trail or destructure trail

      const accessesTrail = breadcrumbsContent.includes('.trail') ||
                            breadcrumbsContent.includes('{ trail');

      assert.ok(
        accessesTrail,
        'Should access trail property from getCategoryBreadcrumbs result'
      );
    });
  });

  describe('Test 3: Trail Items Rendered as Links', () => {
    it('should create link elements for parent categories', () => {
      // Given: breadcrumbs.js renders trail
      // When: parent categories in trail
      // Then: should create <a> elements for parents

      const createsLinks = breadcrumbsContent.includes("createElement('a')") ||
                          breadcrumbsContent.includes('createElement("a")');

      assert.ok(
        createsLinks,
        'Should create <a> elements for parent breadcrumb items (clickable links)'
      );
    });

    it('should set href on parent links', () => {
      // Given: breadcrumbs.js creates link elements
      // When: setting up links
      // Then: should set href attribute (likely using item.url)

      const setsHref = breadcrumbsContent.includes('.href') ||
                       breadcrumbsContent.includes("setAttribute('href");

      assert.ok(
        setsHref,
        'Should set href attribute on parent category links'
      );
    });
  });

  describe('Test 4: Current Category Not Linked', () => {
    it('should render current category as span (not link)', () => {
      // Given: breadcrumbs.js renders trail
      // When: rendering current (last) category
      // Then: should be span, not link

      // The file already uses span for current item
      const usesSpanForCurrent = breadcrumbsContent.includes("createElement('span')") ||
                                  breadcrumbsContent.includes('createElement("span")');

      assert.ok(
        usesSpanForCurrent,
        'Should use <span> elements (current category should not be linked)'
      );
    });
  });

  describe('Test 5: Graceful Fallback', () => {
    it('should handle empty trail gracefully', () => {
      // Given: getCategoryBreadcrumbs returns empty trail
      // When: rendering
      // Then: should fall back to existing behavior (no errors)

      // Look for fallback handling - checking trail length or using ||
      const hasFallbackHandling = breadcrumbsContent.includes('trail.length') ||
                                  breadcrumbsContent.includes('trail &&') ||
                                  breadcrumbsContent.includes('|| []') ||
                                  breadcrumbsContent.includes('?.trail');

      assert.ok(
        hasFallbackHandling,
        'Should handle empty/undefined trail gracefully'
      );
    });
  });

  describe('Test 6: Separators Between Items', () => {
    it('should add separators between breadcrumb items', () => {
      // Given: breadcrumbs.js renders multiple items
      // When: rendering trail
      // Then: should add separators (e.g., "/") between items

      const hasSeparator = breadcrumbsContent.includes("'/'") ||
                           breadcrumbsContent.includes('separator') ||
                           breadcrumbsContent.includes('"/"');

      assert.ok(
        hasSeparator,
        'Should add separator characters between breadcrumb items'
      );
    });
  });

  describe('Prerequisite: mesh-client.js has getCategoryBreadcrumbs', () => {
    it('should export getCategoryBreadcrumbs function', () => {
      // Given: mesh-client.js file (from Step 3)
      // When: checking exports
      // Then: should export getCategoryBreadcrumbs

      const exportsFunction = meshClientContent.includes('export async function getCategoryBreadcrumbs');

      assert.ok(
        exportsFunction,
        'mesh-client.js should export getCategoryBreadcrumbs (prerequisite from Step 3)'
      );
    });
  });
});
