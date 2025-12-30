/**
 * Spinner XS Variant Tests
 *
 * TDD tests for Step 1: Add XS Spinner Variant
 * Validates .loading-spinner-xs (16px) for button/inline contexts.
 *
 * Run with: node --test tests/spinner-xs.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const COMPONENTS_CSS_PATH = path.join(__dirname, '..', 'styles', 'components.css');

// Helper: Read CSS file contents
function readCSSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Extract CSS rule block for a selector
function extractCSSRule(cssContent, selector) {
  // Escape special regex characters in selector
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 's');
  const match = cssContent.match(regex);
  return match ? match[1].trim() : null;
}

// Helper: Extract property value from CSS rule
function extractPropertyValue(ruleContent, property) {
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+);`);
  const match = ruleContent.match(regex);
  return match ? match[1].trim() : null;
}

describe('Spinner XS Variant', () => {
  let cssContent;

  // Load CSS before tests
  it('should load components.css', () => {
    cssContent = readCSSFile(COMPONENTS_CSS_PATH);
    assert.ok(cssContent.length > 0, 'components.css should not be empty');
  });

  describe('.loading-spinner-xs class', () => {
    it('should exist in components.css', () => {
      const rule = extractCSSRule(cssContent, '.loading-spinner-xs');
      assert.ok(rule, '.loading-spinner-xs class should exist');
    });

    it('should have width: 16px', () => {
      const rule = extractCSSRule(cssContent, '.loading-spinner-xs');
      assert.ok(rule, '.loading-spinner-xs class should exist');
      const width = extractPropertyValue(rule, 'width');
      assert.strictEqual(width, '16px', 'width should be 16px');
    });

    it('should have height: 16px', () => {
      const rule = extractCSSRule(cssContent, '.loading-spinner-xs');
      assert.ok(rule, '.loading-spinner-xs class should exist');
      const height = extractPropertyValue(rule, 'height');
      assert.strictEqual(height, '16px', 'height should be 16px');
    });

    it('should have proportional border-width: 2px', () => {
      const rule = extractCSSRule(cssContent, '.loading-spinner-xs');
      assert.ok(rule, '.loading-spinner-xs class should exist');
      const borderWidth = extractPropertyValue(rule, 'border-width');
      assert.strictEqual(borderWidth, '2px', 'border-width should be 2px');
    });
  });

  describe('Spinner variant naming convention', () => {
    it('should follow existing variant pattern (sm, lg, xs)', () => {
      const hasBase = cssContent.includes('.loading-spinner {');
      const hasSm = cssContent.includes('.loading-spinner-sm');
      const hasLg = cssContent.includes('.loading-spinner-lg');
      const hasXs = cssContent.includes('.loading-spinner-xs');

      assert.ok(hasBase, 'Base .loading-spinner should exist');
      assert.ok(hasSm, '.loading-spinner-sm variant should exist');
      assert.ok(hasLg, '.loading-spinner-lg variant should exist');
      assert.ok(hasXs, '.loading-spinner-xs variant should exist');
    });
  });
});
