/**
 * Add to Cart Button Spinner Tests
 *
 * TDD tests for Step 3: Update Add to Cart Button
 * Validates inline SVG spinner replaced with CSS .loading-spinner-xs.
 *
 * Run with: node --test tests/add-to-cart-spinner.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const PRODUCT_LIST_JS_PATH = path.join(
  __dirname,
  '..',
  'blocks',
  'product-list',
  'product-list.js'
);

// Helper: Read JS file contents
function readJSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Add to Cart Button Spinner Standardization', () => {
  let jsContent;

  it('should load product-list.js', () => {
    jsContent = readJSFile(PRODUCT_LIST_JS_PATH);
    assert.ok(jsContent.length > 0, 'product-list.js should not be empty');
  });

  describe('Inline SVG spinner removal', () => {
    it('should NOT have inline SVG spinner definition', () => {
      // Check that the old SVG spinner is removed
      const hasInlineSVGSpinner = jsContent.includes(
        'spinnerSVG = `<svg class="spin"'
      );
      assert.strictEqual(
        hasInlineSVGSpinner,
        false,
        'Should not have inline SVG spinner definition'
      );
    });

    it('should NOT use SVG-based spinner in loading state', () => {
      // Check that spinnerSVG is not used in button.innerHTML
      const usesSpinnerSVG = jsContent.includes('${spinnerSVG}');
      assert.strictEqual(
        usesSpinnerSVG,
        false,
        'Should not use spinnerSVG variable in button innerHTML'
      );
    });
  });

  describe('CSS spinner implementation', () => {
    it('should use .loading-spinner-xs class in loading state', () => {
      // Check for CSS spinner class usage
      const usesLoadingSpinnerXs = jsContent.includes('loading-spinner-xs');
      assert.ok(
        usesLoadingSpinnerXs,
        'Should use .loading-spinner-xs class for button spinner'
      );
    });

    it('should use .loading-spinner base class', () => {
      // Spinner should have both base and xs classes
      const hasSpinnerHTML =
        jsContent.includes('loading-spinner') &&
        jsContent.includes('loading-spinner-xs');
      assert.ok(
        hasSpinnerHTML,
        'Should use both loading-spinner and loading-spinner-xs classes'
      );
    });

    it('should use span element for spinner', () => {
      // Check for span-based spinner (not SVG)
      const hasSpanSpinner = jsContent.includes('<span class="loading-spinner');
      assert.ok(hasSpanSpinner, 'Should use <span> element for CSS spinner');
    });
  });

  describe('Success and error icons preserved', () => {
    it('should still have check SVG for success state', () => {
      const hasCheckSVG = jsContent.includes('checkSVG');
      assert.ok(hasCheckSVG, 'Check SVG for success state should be preserved');
    });

    it('should still have error SVG for error state', () => {
      const hasErrorSVG = jsContent.includes('errorSVG');
      assert.ok(hasErrorSVG, 'Error SVG for error state should be preserved');
    });
  });
});
