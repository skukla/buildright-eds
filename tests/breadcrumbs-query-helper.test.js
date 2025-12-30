/**
 * Breadcrumbs Query & Helper Tests
 *
 * TDD tests for Step 3: Add Frontend Query & Helper
 * Validates that GET_CATEGORY_BREADCRUMBS query and getCategoryBreadcrumbs()
 * helper are properly implemented following existing patterns.
 *
 * Run with: node --test tests/breadcrumbs-query-helper.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const QUERIES_PATH = path.join(__dirname, '..', 'scripts', 'services', 'queries.js');
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
describe('Breadcrumbs Query & Helper', () => {
  let queriesContent;
  let meshClientContent;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(QUERIES_PATH),
      `queries.js should exist at ${QUERIES_PATH}`);
    assert.ok(fileExists(MESH_CLIENT_PATH),
      `mesh-client.js should exist at ${MESH_CLIENT_PATH}`);

    // Read file contents
    queriesContent = readJSFile(QUERIES_PATH);
    meshClientContent = readJSFile(MESH_CLIENT_PATH);

    console.log('\n=== File Analysis ===');
    console.log(`Queries file: ${queriesContent.split('\n').length} lines`);
    console.log(`Mesh client file: ${meshClientContent.split('\n').length} lines`);
  });

  describe('Test 1: GET_CATEGORY_BREADCRUMBS Query in queries.js', () => {
    it('should export GET_CATEGORY_BREADCRUMBS query', () => {
      // Given: queries.js file
      // When: checking for GET_CATEGORY_BREADCRUMBS export
      // Then: should have exported constant

      const hasExport = queriesContent.includes('export const GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        hasExport,
        'queries.js should export GET_CATEGORY_BREADCRUMBS query constant'
      );
    });

    it('should query BuildRight_getCategoryBreadcrumbs', () => {
      // Given: GET_CATEGORY_BREADCRUMBS query
      // When: checking query content
      // Then: should call BuildRight_getCategoryBreadcrumbs

      const hasQueryName = queriesContent.includes('BuildRight_getCategoryBreadcrumbs');

      assert.ok(
        hasQueryName,
        'Query should call BuildRight_getCategoryBreadcrumbs (mesh resolver)'
      );
    });

    it('should accept slug parameter', () => {
      // Given: GET_CATEGORY_BREADCRUMBS query
      // When: checking query variables
      // Then: should have $slug: String! parameter

      const hasSlugParam = queriesContent.includes('$slug: String!');

      assert.ok(
        hasSlugParam,
        'Query should accept $slug: String! parameter'
      );
    });

    it('should request trail fields (slug, name, url)', () => {
      // Given: GET_CATEGORY_BREADCRUMBS query
      // When: checking query fields
      // Then: should request trail with slug, name, url

      const hasTrailField = queriesContent.includes('trail {');
      const hasSlugField = queriesContent.includes('slug') && queriesContent.includes('trail');
      const hasNameField = queriesContent.includes('name') && queriesContent.includes('trail');
      const hasUrlField = queriesContent.includes('url') && queriesContent.includes('trail');

      assert.ok(
        hasTrailField,
        'Query should request trail field'
      );
    });

    it('should request source field', () => {
      // Given: GET_CATEGORY_BREADCRUMBS query
      // When: checking query fields
      // Then: should request source field

      // Find the query block and check for source
      const queryMatch = queriesContent.match(/GET_CATEGORY_BREADCRUMBS[\s\S]*?`;/);
      const hasSourceField = queryMatch && queryMatch[0].includes('source');

      assert.ok(
        hasSourceField,
        'Query should request source field to identify data source (aco|commerce)'
      );
    });

    it('should be included in default export', () => {
      // Given: queries.js default export object
      // When: checking export keys
      // Then: should include GET_CATEGORY_BREADCRUMBS

      const defaultExportMatch = queriesContent.match(/export default \{[\s\S]*?\}/);
      const hasInDefaultExport = defaultExportMatch &&
        defaultExportMatch[0].includes('GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        hasInDefaultExport,
        'GET_CATEGORY_BREADCRUMBS should be in default export object'
      );
    });
  });

  describe('Test 2: QUERY_GET_CATEGORY_BREADCRUMBS Re-export in mesh-client.js', () => {
    it('should re-export as QUERY_GET_CATEGORY_BREADCRUMBS', () => {
      // Given: mesh-client.js file
      // When: checking for re-export
      // Then: should have QUERY_GET_CATEGORY_BREADCRUMBS export

      const hasReExport = meshClientContent.includes('QUERY_GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        hasReExport,
        'mesh-client.js should re-export QUERY_GET_CATEGORY_BREADCRUMBS for backwards compatibility'
      );
    });

    it('should reference queries.GET_CATEGORY_BREADCRUMBS', () => {
      // Given: QUERY_GET_CATEGORY_BREADCRUMBS re-export
      // When: checking assignment
      // Then: should reference queries.GET_CATEGORY_BREADCRUMBS

      const hasProperReference = meshClientContent.includes('queries.GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        hasProperReference,
        'Re-export should reference queries.GET_CATEGORY_BREADCRUMBS'
      );
    });
  });

  describe('Test 3: getCategoryBreadcrumbs() Helper Function', () => {
    it('should export getCategoryBreadcrumbs function', () => {
      // Given: mesh-client.js file
      // When: checking for function export
      // Then: should have exported async function

      const hasExport = meshClientContent.includes('export async function getCategoryBreadcrumbs');

      assert.ok(
        hasExport,
        'mesh-client.js should export async function getCategoryBreadcrumbs'
      );
    });

    it('should accept slug parameter', () => {
      // Given: getCategoryBreadcrumbs function
      // When: checking function signature
      // Then: should accept slug parameter

      const functionMatch = meshClientContent.match(/export async function getCategoryBreadcrumbs\s*\(\s*(\w+)/);
      const hasSlugParam = functionMatch && functionMatch[1] === 'slug';

      assert.ok(
        hasSlugParam,
        'getCategoryBreadcrumbs should accept slug parameter'
      );
    });

    it('should call meshQuery with GET_CATEGORY_BREADCRUMBS', () => {
      // Given: getCategoryBreadcrumbs function
      // When: checking implementation
      // Then: should use meshQuery with the query

      const callsMeshQuery = meshClientContent.includes('meshQuery(queries.GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        callsMeshQuery,
        'getCategoryBreadcrumbs should call meshQuery with queries.GET_CATEGORY_BREADCRUMBS'
      );
    });

    it('should return BuildRight_getCategoryBreadcrumbs result or fallback', () => {
      // Given: getCategoryBreadcrumbs function
      // When: checking return statement
      // Then: should return data.BuildRight_getCategoryBreadcrumbs or fallback

      const returnsResult = meshClientContent.includes('BuildRight_getCategoryBreadcrumbs');

      assert.ok(
        returnsResult,
        'getCategoryBreadcrumbs should return data.BuildRight_getCategoryBreadcrumbs'
      );
    });

    it('should have graceful fallback for missing category', () => {
      // Given: getCategoryBreadcrumbs function
      // When: result is null/undefined
      // Then: should return fallback { trail: [], source: 'unknown' }

      const hasFallback = meshClientContent.includes("trail: []") ||
                          meshClientContent.includes('{ trail: [], source:');

      assert.ok(
        hasFallback,
        'getCategoryBreadcrumbs should return fallback { trail: [], source: "unknown" } on failure'
      );
    });

    it('should have JSDoc with proper types', () => {
      // Given: getCategoryBreadcrumbs function
      // When: checking JSDoc
      // Then: should have @param {string} slug and @returns documentation

      const hasParamDoc = meshClientContent.includes('@param {string} slug');
      const hasReturnsDoc = meshClientContent.includes('@returns');

      assert.ok(
        hasParamDoc && hasReturnsDoc,
        'getCategoryBreadcrumbs should have JSDoc with @param and @returns'
      );
    });
  });

  describe('Test 4: Default Export Updated', () => {
    it('should include getCategoryBreadcrumbs in default export', () => {
      // Given: mesh-client.js default export
      // When: checking export object
      // Then: should include getCategoryBreadcrumbs

      const defaultExportMatch = meshClientContent.match(/export default \{[\s\S]*?\}/);
      const hasInDefaultExport = defaultExportMatch &&
        defaultExportMatch[0].includes('getCategoryBreadcrumbs');

      assert.ok(
        hasInDefaultExport,
        'getCategoryBreadcrumbs should be in default export object'
      );
    });
  });

  describe('Test 5: Follows Existing Patterns', () => {
    it('should follow GET_CATEGORIES naming pattern', () => {
      // Given: Existing query naming convention
      // When: checking GET_CATEGORY_BREADCRUMBS
      // Then: should follow GET_* pattern

      const followsPattern = queriesContent.includes('export const GET_CATEGORY_BREADCRUMBS');

      assert.ok(
        followsPattern,
        'Query name should follow existing GET_* naming pattern (like GET_CATEGORIES)'
      );
    });

    it('should follow getCategories() function pattern', () => {
      // Given: Existing function naming convention
      // When: checking getCategoryBreadcrumbs
      // Then: should follow get* camelCase pattern

      const followsPattern = meshClientContent.includes('export async function getCategoryBreadcrumbs');

      assert.ok(
        followsPattern,
        'Function name should follow existing get* naming pattern (like getCategories)'
      );
    });
  });
});
