/**
 * Grid Spinner Injection Tests
 *
 * TDD tests for spinner DOM injection in product-list.js
 * Validates that .loading-spinner element is injected/removed during validating state.
 *
 * Run with: node --test tests/grid-spinner-injection.test.js
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

describe('Grid Spinner DOM Injection', () => {
  let jsContent;

  it('should load product-list.js', () => {
    jsContent = readJSFile(PRODUCT_LIST_JS_PATH);
    assert.ok(jsContent.length > 0, 'product-list.js should not be empty');
  });

  describe('Spinner injection on validating state', () => {
    it('should create loading-spinner element when validating starts', () => {
      // Check for spinner creation code
      const createsSpinner =
        jsContent.includes("createElement('div')") &&
        jsContent.includes('loading-spinner') &&
        jsContent.includes('appendChild');
      assert.ok(
        createsSpinner,
        'Should create and append loading-spinner element'
      );
    });

    it('should use loading-spinner class for the spinner element', () => {
      // Check for loading-spinner class (may include size variant like loading-spinner-sm)
      const usesSpinnerClass = jsContent.includes("classList.add('loading-spinner')") ||
        jsContent.includes("className = 'loading-spinner") ||
        jsContent.includes('class="loading-spinner');
      assert.ok(
        usesSpinnerClass,
        'Spinner element should have loading-spinner class'
      );
    });
  });

  describe('Spinner removal on validating end', () => {
    it('should remove loading-spinner element when validating ends', () => {
      // Check for spinner removal code
      const removesSpinner =
        jsContent.includes('.loading-spinner') &&
        (jsContent.includes('.remove()') || jsContent.includes('removeChild'));
      assert.ok(
        removesSpinner,
        'Should remove loading-spinner element when validating ends'
      );
    });
  });
});
