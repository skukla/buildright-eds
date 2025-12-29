/**
 * Loading State Coordination Tests
 *
 * TDD tests for Step 6: Loading State Coordination
 * Validates that CSS spinner-hiding "nuclear option" rules are removed
 * and loading states are coordinated via JS callbacks.
 *
 * Run with: node --test tests/loading-state-coordination.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCKS_DIR = path.join(__dirname, '..', 'blocks');
const LOADING_STATES_CSS_PATH = path.join(BLOCKS_DIR, 'product-list-dropin', 'css', 'loading-states.css');
const PRODUCT_LIST_DROPIN_JS_PATH = path.join(BLOCKS_DIR, 'product-list-dropin', 'product-list-dropin.js');

// Helper: Read file contents
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper: Count occurrences of a pattern
function countOccurrences(content, pattern) {
  if (typeof pattern === 'string') {
    return (content.split(pattern).length - 1);
  }
  return (content.match(pattern) || []).length;
}

// Helper: Check if code contains pattern
function codeContains(code, pattern) {
  if (typeof pattern === 'string') {
    return code.includes(pattern);
  }
  return pattern.test(code);
}

// Test suite
describe('Loading State Coordination - Step 6', () => {
  let cssContent;
  let jsContent;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(LOADING_STATES_CSS_PATH),
      `loading-states.css should exist at ${LOADING_STATES_CSS_PATH}`);
    assert.ok(fileExists(PRODUCT_LIST_DROPIN_JS_PATH),
      `product-list-dropin.js should exist at ${PRODUCT_LIST_DROPIN_JS_PATH}`);

    // Read file contents
    cssContent = readFile(LOADING_STATES_CSS_PATH);
    jsContent = readFile(PRODUCT_LIST_DROPIN_JS_PATH);

    console.log('\n=== File Analysis ===');
    console.log(`  CSS file length: ${cssContent.length} characters, ${cssContent.split('\n').length} lines`);
    console.log(`  JS file length: ${jsContent.length} characters, ${jsContent.split('\n').length} lines`);
  });

  describe('Test 1: validating Class Added on Filter Change', () => {
    it('should add validating class to searchResultsContainer on facet change', () => {
      // Given: User clicks a facet checkbox
      // When: facetsContainer change event fires
      // Then: searchResultsContainer.classList.contains('validating') is true

      // Check for the pattern: searchResultsContainer.classList.add('validating')
      // or similar pattern where validating is added to the results container
      const hasValidatingOnResults =
        codeContains(jsContent, "searchResultsContainer.classList.add('validating')") ||
        codeContains(jsContent, 'searchResultsContainer.classList.add("validating")') ||
        codeContains(jsContent, "resultsContainer.classList.add('validating')") ||
        codeContains(jsContent, "resultsContainer?.classList.add('validating')");

      assert.ok(
        hasValidatingOnResults,
        'Should add validating class to search results container on filter change. ' +
        'Expected: searchResultsContainer.classList.add("validating")'
      );
    });

    it('should add validating class to facetsContainer on facet change', () => {
      // Also check facetsContainer gets validating class
      const hasValidatingOnFacets =
        codeContains(jsContent, "facetsContainer.classList.add('validating')") ||
        codeContains(jsContent, 'facetsContainer.classList.add("validating")');

      assert.ok(
        hasValidatingOnFacets,
        'Should add validating class to facets container on filter change. ' +
        'Expected: facetsContainer.classList.add("validating")'
      );
    });

    it('should emit facetsValidating event with validating: true on change', () => {
      // Check that facetsValidating event is emitted when filter changes
      // Pattern: emitCatalogEvent('facetsValidating', { validating: true })
      const hasValidatingEvent =
        codeContains(jsContent, "emitCatalogEvent('facetsValidating', { validating: true })") ||
        codeContains(jsContent, 'emitCatalogEvent("facetsValidating", { validating: true })');

      assert.ok(
        hasValidatingEvent,
        'Should emit facetsValidating event with { validating: true } on filter change'
      );
    });
  });

  describe('Test 2: validating Class Removed on Search Complete', () => {
    it('should remove validating class in onSearchResult callback', () => {
      // Given: Container has validating class
      // When: onSearchResult callback fires with products
      // Then: searchResultsContainer.classList.contains('validating') is false

      // Check for onSearchResult callback with validating removal
      const hasOnSearchResult = codeContains(jsContent, 'onSearchResult');
      assert.ok(hasOnSearchResult, 'Should have onSearchResult callback');

      // Find the onSearchResult callback and check for class removal
      const hasRemoveValidating =
        codeContains(jsContent, "classList.remove('validating'") ||
        codeContains(jsContent, 'classList.remove("validating"') ||
        codeContains(jsContent, "classList.remove('validating', 'updating')") ||
        codeContains(jsContent, "classList.remove('updating', 'validating')");

      assert.ok(
        hasRemoveValidating,
        'Should remove validating class in onSearchResult callback (not via setTimeout). ' +
        'Expected: classList.remove("validating") inside onSearchResult'
      );
    });

    it('should remove validating from both results and facets containers', () => {
      // Extract the onSearchResult callback section
      const onSearchResultMatch = jsContent.match(/onSearchResult\s*:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s{4}\}/);

      if (onSearchResultMatch) {
        const callbackCode = onSearchResultMatch[0];

        // Check for results container
        const hasResultsRemoval =
          codeContains(callbackCode, "resultsContainer?.classList.remove") ||
          codeContains(callbackCode, "resultsContainer.classList.remove");

        // Check for facets container
        const hasFacetsRemoval =
          codeContains(callbackCode, "facetsEl?.classList.remove") ||
          codeContains(callbackCode, "facetsContainer?.classList.remove") ||
          codeContains(callbackCode, "facetsEl.classList.remove");

        assert.ok(
          hasResultsRemoval && hasFacetsRemoval,
          'onSearchResult should remove validating from both results and facets containers. ' +
          `Found results removal: ${hasResultsRemoval}, facets removal: ${hasFacetsRemoval}`
        );
      } else {
        // Fallback check - just verify the pattern exists somewhere
        assert.ok(
          codeContains(jsContent, "facetsEl?.classList.remove") ||
          codeContains(jsContent, "facetsContainer.classList.remove"),
          'Should remove validating from facets container in search result callback'
        );
      }
    });

    it('should emit facetsValidating event with validating: false on completion', () => {
      const hasValidatingFalseEvent =
        codeContains(jsContent, "emitCatalogEvent('facetsValidating', { validating: false })") ||
        codeContains(jsContent, 'emitCatalogEvent("facetsValidating", { validating: false })');

      assert.ok(
        hasValidatingFalseEvent,
        'Should emit facetsValidating event with { validating: false } after search completes'
      );
    });
  });

  describe('Test 3: clearing Class Used for Clear All', () => {
    it('should add clearing class when Clear All button is clicked', () => {
      // Given: User clicks Clear All button
      // When: Filters reset begins
      // Then: facetsContainer.classList.contains('clearing') is true

      const hasClearingClass =
        codeContains(jsContent, "classList.add('clearing')") ||
        codeContains(jsContent, 'classList.add("clearing")');

      assert.ok(
        hasClearingClass,
        'Should add clearing class when Clear All button is clicked. ' +
        'Expected: facetsContainer.classList.add("clearing")'
      );
    });

    it('should add validating class to results container during clear', () => {
      // During clear, results container should also show loading state
      // Look for pattern in clearAllButton click handler

      // Find the Clear All click handler section
      const clearAllSection = jsContent.match(/clearAllButton\.addEventListener\s*\(\s*['"]click['"]\s*,[\s\S]*?\n\s{8}\}\);/);

      if (clearAllSection) {
        const hasResultsValidating =
          codeContains(clearAllSection[0], "resultsContainer.classList.add('validating')") ||
          codeContains(clearAllSection[0], 'resultsContainer.classList.add("validating")') ||
          codeContains(clearAllSection[0], "searchResultsContainer.classList.add('validating')");

        assert.ok(
          hasResultsValidating,
          'Clear All handler should add validating class to results container'
        );
      } else {
        // Fallback - check if pattern exists near clearing
        const nearClearing = jsContent.includes("classList.add('clearing')") &&
          jsContent.includes("classList.add('validating')");
        assert.ok(nearClearing, 'Should add both clearing and validating classes during Clear All');
      }
    });

    it('should emit facetsValidating event when clearing filters', () => {
      // Check that validating event is emitted during clear
      // The emitCatalogEvent should be called near the clearing class add

      const emitCount = countOccurrences(jsContent, "emitCatalogEvent('facetsValidating', { validating: true })");

      assert.ok(
        emitCount >= 2,
        `Should emit facetsValidating(true) at least twice (filter change AND clear all). Found: ${emitCount}`
      );
    });
  });

  describe('Test 4: Global Spinner Selectors Removed from CSS', () => {
    it('should NOT have * [class*="spinner"] global selector', () => {
      // Given: loading-states.css after modification
      // When: Checking for global spinner patterns
      // Then: No global spinner selectors exist

      const hasGlobalSpinner = codeContains(cssContent, '* [class*="spinner"]');

      assert.ok(
        !hasGlobalSpinner,
        'Should NOT have global spinner selector "* [class*=\\"spinner\\"]" - this is the nuclear option'
      );
    });

    it('should NOT have * [class*="loading"] global selector', () => {
      const hasGlobalLoading = codeContains(cssContent, '* [class*="loading"]');

      assert.ok(
        !hasGlobalLoading,
        'Should NOT have global loading selector "* [class*=\\"loading\\"]"'
      );
    });

    it('should NOT have *[class^="dropin-icon"] selector', () => {
      const hasDropinIcon = codeContains(cssContent, '*[class^="dropin-icon"]');

      assert.ok(
        !hasDropinIcon,
        'Should NOT have dropin-icon global selector "*[class^=\\"dropin-icon\\"]"'
      );
    });

    it('should NOT have role="status" selector in global hide block', () => {
      // Check if role="status" is being hidden globally
      const lines = cssContent.split('\n');
      let inGlobalBlock = false;

      for (const line of lines) {
        if (line.includes('* [class*="spinner"]')) {
          inGlobalBlock = true;
        }
        if (inGlobalBlock && line.includes('[role="status"]')) {
          assert.fail('Should NOT have [role="status"] in global hide block');
        }
        if (inGlobalBlock && line.includes('}')) {
          inGlobalBlock = false;
        }
      }

      assert.ok(true, 'No role="status" in global hide block');
    });

    it('should NOT have NUCLEAR OPTION comment block', () => {
      const hasNuclearOption =
        codeContains(cssContent, 'NUCLEAR OPTION') ||
        codeContains(cssContent, 'nuclear option');

      assert.ok(
        !hasNuclearOption,
        'Should NOT have NUCLEAR OPTION comment block - these rules should be removed'
      );
    });
  });

  describe('Test 5: !important Count Reduced', () => {
    it('should have significantly fewer !important declarations', () => {
      // Given: loading-states.css after modification
      // When: Counting !important declarations
      // Then: Count is reduced (from ~52 in original nuclear option to ~27 for validating/clearing states)

      const importantCount = countOccurrences(cssContent, '!important');

      console.log(`\n  !important count: ${importantCount}`);

      // The original had ~52 !important declarations including nuclear option
      // After removing global spinners/nuclear option, should be ~27 or less
      // We expect reduction of ~25 (the nuclear option block had many)
      assert.ok(
        importantCount <= 30,
        `Should have 30 or fewer !important declarations after removing nuclear option. Found: ${importantCount}`
      );
    });

    it('should not have !important on display:none for global spinners', () => {
      // Check that we don't have the pattern: display: none !important in global selector context
      const lines = cssContent.split('\n');
      let inGlobalSpinnerBlock = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect global spinner block start
        if (line.includes('* [class*="spinner"]') || line.includes('* [class*="loading"]')) {
          inGlobalSpinnerBlock = true;
        }

        // Check for display: none !important in global block
        if (inGlobalSpinnerBlock && line.includes('display: none !important')) {
          assert.fail(`Line ${i + 1}: Should NOT have "display: none !important" in global spinner block`);
        }

        // End of block
        if (inGlobalSpinnerBlock && line.trim() === '}') {
          inGlobalSpinnerBlock = false;
        }
      }

      assert.ok(true, 'No display: none !important in global spinner selectors');
    });
  });

  describe('Test 6: Validating States Still Work Visually', () => {
    it('should keep .validating facets state styles', () => {
      // Given: loading-states.css keeps .validating styles
      // When: Container has validating class
      // Then: Visual overlay styles still apply

      const hasValidatingFacets =
        codeContains(cssContent, '.dropin-facets-container.validating') ||
        codeContains(cssContent, '.product-list-dropin .dropin-facets-container.validating');

      assert.ok(
        hasValidatingFacets,
        'Should keep .validating styles for facets container (opacity, spinner)'
      );
    });

    it('should keep .validating::after spinner pseudo-element', () => {
      const hasValidatingSpinner =
        codeContains(cssContent, '.validating::after') ||
        codeContains(cssContent, '.dropin-facets-container.validating::after');

      assert.ok(
        hasValidatingSpinner,
        'Should keep .validating::after pseudo-element for spinner animation'
      );
    });

    it('should keep .validating product grid overlay styles', () => {
      const hasGridValidating =
        codeContains(cssContent, '.dropin-search-results-container.validating') ||
        codeContains(cssContent, '.product-list-dropin .dropin-search-results-container.validating');

      assert.ok(
        hasGridValidating,
        'Should keep .validating styles for search results container (overlay)'
      );
    });

    it('should keep opacity styles for validating state', () => {
      // The validating state should dim content
      const hasOpacity =
        codeContains(cssContent, '.validating') &&
        codeContains(cssContent, 'opacity');

      assert.ok(
        hasOpacity,
        'Validating state should include opacity for visual dimming'
      );
    });

    it('should keep spin keyframe animation', () => {
      const hasSpinAnimation = codeContains(cssContent, '@keyframes spin');

      assert.ok(
        hasSpinAnimation,
        'Should keep @keyframes spin animation for loading spinner'
      );
    });
  });

  describe('Test 7: Clearing State Preserved', () => {
    it('should keep .clearing facets state styles', () => {
      const hasClearingFacets =
        codeContains(cssContent, '.dropin-facets-container.clearing') ||
        codeContains(cssContent, '.product-list-dropin .dropin-facets-container.clearing');

      assert.ok(
        hasClearingFacets,
        'Should keep .clearing styles for facets container'
      );
    });

    it('should keep .clearing product grid overlay styles', () => {
      const hasClearingGrid =
        codeContains(cssContent, '.dropin-search-results-container.clearing') ||
        codeContains(cssContent, '.product-list-dropin .dropin-search-results-container.clearing');

      assert.ok(
        hasClearingGrid,
        'Should keep .clearing styles for search results container'
      );
    });

    it('should keep skeleton loader animations', () => {
      const hasShimmer =
        codeContains(cssContent, '@keyframes shimmer') ||
        codeContains(cssContent, '@keyframes shimmer-sweep') ||
        codeContains(cssContent, '@keyframes buildright-shimmer');

      assert.ok(
        hasShimmer,
        'Should keep shimmer/skeleton keyframe animations'
      );
    });
  });

  describe('Test 8: JS Uses Callback Instead of setTimeout', () => {
    it('should NOT rely solely on setTimeout for removing validating class', () => {
      // The old pattern used setTimeout to remove updating class
      // The new pattern should use onSearchResult callback

      // Check if onSearchResult is used for class removal
      const onSearchResultMatch = jsContent.match(/onSearchResult\s*:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s{4}\}/);

      if (onSearchResultMatch) {
        const hasClassRemoval =
          codeContains(onSearchResultMatch[0], "classList.remove('validating'") ||
          codeContains(onSearchResultMatch[0], "classList.remove('updating'") ||
          codeContains(onSearchResultMatch[0], 'classList.remove("validating"');

        assert.ok(
          hasClassRemoval,
          'onSearchResult callback should handle class removal (not setTimeout)'
        );
      } else {
        assert.fail('onSearchResult callback should exist and handle class removal');
      }
    });

    it('should remove updating class in onSearchResult callback', () => {
      // Check for removing updating class (the old pattern) in the callback
      const hasRemoveUpdating =
        codeContains(jsContent, "classList.remove('validating', 'updating')") ||
        codeContains(jsContent, "classList.remove('updating'") ||
        codeContains(jsContent, "classList.remove('updating', 'validating')");

      assert.ok(
        hasRemoveUpdating,
        'Should remove updating class along with validating in callback'
      );
    });
  });

  describe('Test 9: CSS Line Count Reduced', () => {
    it('should have fewer lines than original (~321 lines)', () => {
      const lineCount = cssContent.split('\n').length;

      console.log(`\n  CSS line count: ${lineCount}`);

      // Original was ~321 lines, after removing global spinner rules (~90 lines)
      // Should be around 200-230 lines
      assert.ok(
        lineCount <= 250,
        `CSS should have around 200-230 lines after cleanup. Found: ${lineCount}`
      );
    });
  });
});
