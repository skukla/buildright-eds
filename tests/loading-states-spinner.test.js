/**
 * Loading States Spinner Tests
 *
 * TDD tests for Step 2: Update Loading States CSS
 * Validates DOM-based spinner positioning replaces ::before pseudo-elements.
 *
 * Run with: node --test tests/loading-states-spinner.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const LOADING_STATES_CSS_PATH = path.join(
  __dirname,
  '..',
  'blocks',
  'product-list',
  'css',
  'loading-states.css'
);

// Helper: Read CSS file contents
function readCSSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Loading States Spinner Standardization', () => {
  let cssContent;

  it('should load loading-states.css', () => {
    cssContent = readCSSFile(LOADING_STATES_CSS_PATH);
    assert.ok(cssContent.length > 0, 'loading-states.css should not be empty');
  });

  describe('Product Grid ::before spinner removal', () => {
    it('should NOT have ::before pseudo-element spinner for validating state', () => {
      // Check that the old ::before spinner is removed for product grid validating
      const hasOldValidatingSpinner = cssContent.includes(
        '.dropin-search-results-container.validating::before'
      );
      assert.strictEqual(
        hasOldValidatingSpinner,
        false,
        'Should not have ::before spinner for .dropin-search-results-container.validating'
      );
    });

    it('should NOT have ::before pseudo-element spinner for clearing state', () => {
      // Check that the old ::before spinner is removed for product grid clearing
      const hasOldClearingSpinner = cssContent.includes(
        '.dropin-search-results-container.clearing::before'
      );
      assert.strictEqual(
        hasOldClearingSpinner,
        false,
        'Should not have ::before spinner for .dropin-search-results-container.clearing'
      );
    });
  });

  describe('DOM-based .loading-spinner positioning', () => {
    it('should have positioning rules for .loading-spinner in validating container', () => {
      // Check for new DOM-based spinner positioning
      const hasValidatingSpinnerRule = cssContent.includes(
        '.validating .loading-spinner'
      );
      assert.ok(
        hasValidatingSpinnerRule,
        'Should have .loading-spinner positioning for validating state'
      );
    });

    it('should have positioning rules for .loading-spinner in clearing container', () => {
      const hasClearingSpinnerRule = cssContent.includes(
        '.clearing .loading-spinner'
      );
      assert.ok(
        hasClearingSpinnerRule,
        'Should have .loading-spinner positioning for clearing state'
      );
    });

    it('should position spinner with absolute positioning', () => {
      // Look for the combined rule with absolute positioning
      const hasAbsolutePositioning =
        cssContent.includes('.loading-spinner') &&
        cssContent.includes('position: absolute');
      assert.ok(
        hasAbsolutePositioning,
        'Spinner should have position: absolute'
      );
    });

    it('should center spinner horizontally with margin auto', () => {
      // Use margin: auto centering to avoid transform conflict with rotation animation
      const hasCenteringRules =
        cssContent.includes('left: 0') &&
        cssContent.includes('right: 0') &&
        cssContent.includes('margin-left: auto') &&
        cssContent.includes('margin-right: auto');
      assert.ok(
        hasCenteringRules,
        'Spinner should be centered with left/right: 0 and margin: auto'
      );
    });
  });

  describe('Facet spinners unchanged', () => {
    it('should still have ::before pseudo-element for facet validating state', () => {
      // Facet spinners should remain unchanged - they use per-section ::before
      const hasFacetValidatingSpinner = cssContent.includes(
        '.dropin-facets-container.validating .product-discovery-facet::before'
      );
      assert.ok(
        hasFacetValidatingSpinner,
        'Facet ::before spinners should be preserved'
      );
    });

    it('should still have ::before pseudo-element for facet clearing state', () => {
      const hasFacetClearingSpinner = cssContent.includes(
        '.dropin-facets-container.clearing .product-discovery-facet::before'
      );
      assert.ok(
        hasFacetClearingSpinner,
        'Facet ::before spinners should be preserved'
      );
    });
  });

  describe('Facet spinners brand-friendly colors', () => {
    it('should use gray track color (--color-text-disabled) for facet spinners', () => {
      // Facet spinners should use brand-friendly gray track
      const hasGrayTrack = cssContent.includes('border: 2px solid var(--color-text-disabled)');
      assert.ok(
        hasGrayTrack,
        'Facet spinners should use --color-text-disabled for gray track'
      );
    });

    it('should use blue top color (--color-brand-500) for facet spinners', () => {
      // Facet spinners should use brand-friendly blue progress arc
      const hasBlueToptop = cssContent.includes('border-top-color: var(--color-brand-500)');
      assert.ok(
        hasBlueToptop,
        'Facet spinners should use --color-brand-500 for blue progress arc'
      );
    });

    it('should NOT use transparent border-top for facet spinners', () => {
      // Old pattern used transparent top - should be removed
      const hasTransparentTop = cssContent.includes('border-top-color: transparent');
      assert.strictEqual(
        hasTransparentTop,
        false,
        'Facet spinners should not use transparent border-top'
      );
    });
  });
});
