/**
 * Product Detail Block Tests
 *
 * TDD tests for Step 3: Product Detail Block using @dropins/storefront-pdp
 * Validates block structure, error handling, and loading states.
 *
 * @module tests/blocks/product-detail.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../../blocks');
const PRODUCT_DETAIL_DIR = path.join(BLOCKS_DIR, 'product-detail');
const JS_FILE_PATH = path.join(PRODUCT_DETAIL_DIR, 'product-detail.js');
const CSS_FILE_PATH = path.join(PRODUCT_DETAIL_DIR, 'product-detail.css');

/**
 * Helper: Read JavaScript file contents
 */
function readJSFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Helper: Read CSS file contents
 */
function readCSSFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Product Detail Block', () => {
  let jsContent;
  let cssContent;

  beforeAll(() => {
    // Only try to read JS if it exists (test will fail if it doesn't)
    if (fs.existsSync(JS_FILE_PATH)) {
      jsContent = readJSFile(JS_FILE_PATH);
    }
    if (fs.existsSync(CSS_FILE_PATH)) {
      cssContent = readCSSFile(CSS_FILE_PATH);
    }
  });

  describe('Test 1: Block exports default decorate function', () => {
    it('should have the product-detail.js file', () => {
      // Given: The blocks/product-detail directory
      // When: Checking for product-detail.js
      const exists = fs.existsSync(JS_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export a default async function', () => {
      // Given: The product-detail.js file
      // When: Analyzing the file contents
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have default export with async function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should accept block parameter in decorate function', () => {
      // Given: The product-detail.js file
      // When: Analyzing the decorate function signature
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have decorate(block) signature
      expect(content).toMatch(/async function decorate\s*\(\s*block\s*\)/);
    });
  });

  describe('Test 2: Block handles missing SKU parameter gracefully', () => {
    it('should check for SKU in URL parameters', () => {
      // Given: The product-detail.js file
      // When: Analyzing SKU handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should parse URL for SKU parameter
      expect(content).toContain('URLSearchParams');
      expect(content).toMatch(/\.get\s*\(\s*['"`]sku['"`]\s*\)/);
    });

    it('should show error state when SKU is missing', () => {
      // Given: The product-detail.js file
      // When: Analyzing missing SKU handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check for missing SKU and show error
      expect(content).toMatch(/if\s*\(\s*!sku\s*\)/);
      expect(content).toContain('createStateMessage');
    });

    it('should display "Product Not Found" message for missing SKU', () => {
      // Given: The product-detail.js file
      // When: Analyzing error message
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show appropriate error message
      expect(content).toContain('Product Not Found');
      expect(content).toContain('No product SKU specified');
    });
  });

  describe('Test 3: Block handles disabled dropin flag gracefully', () => {
    it('should load site configuration', () => {
      // Given: The product-detail.js file
      // When: Analyzing config loading
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import and use loadConfig
      expect(content).toContain('loadConfig');
      expect(content).toContain('site-config.js');
    });

    it('should check useCommerceDropins feature flag', () => {
      // Given: The product-detail.js file
      // When: Analyzing feature flag check
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check config.features.useCommerceDropins
      expect(content).toMatch(/config\.features\?\.useCommerceDropins/);
    });

    it('should show error state when dropins are disabled', () => {
      // Given: The product-detail.js file
      // When: Analyzing disabled dropin handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show appropriate error for disabled dropins
      expect(content).toContain('Commerce Dropins Not Enabled');
      // Should provide a fallback action
      expect(content).toContain('Browse Catalog');
    });
  });

  describe('Test 4: Block shows loading state initially', () => {
    it('should render loading state before dropin initialization', () => {
      // Given: The product-detail.js file
      // When: Analyzing initial loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should set loading HTML before dropin renders
      expect(content).toContain('pdp-loading');
      expect(content).toContain('loading-spinner');
    });

    it('should use waitForDropins before rendering', () => {
      // Given: The product-detail.js file
      // When: Analyzing dropin initialization
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should wait for dropins to initialize
      expect(content).toContain('waitForDropins');
      expect(content).toContain('initializers/index.js');
    });

    it('should clear loading state before rendering ProductDetails', () => {
      // Given: The product-detail.js file
      // When: Analyzing loading state cleanup
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear block before rendering dropin
      // Look for clearing innerHTML after loading state
      const loadingIndex = content.indexOf('pdp-loading');
      const clearIndex = content.indexOf("block.innerHTML = ''", loadingIndex);
      expect(clearIndex).toBeGreaterThan(loadingIndex);
    });
  });

  describe('Test 5: Block imports @dropins/storefront-pdp', () => {
    it('should import render from storefront-pdp', () => {
      // Given: The product-detail.js file
      // When: Analyzing imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from @dropins/storefront-pdp
      expect(content).toContain('@dropins/storefront-pdp/render.js');
    });

    it('should import ProductDetails container', () => {
      // Given: The product-detail.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import ProductDetails container
      expect(content).toContain('@dropins/storefront-pdp/containers/ProductDetails.js');
    });
  });

  describe('Test 6: Block uses slot customization pattern', () => {
    it('should define slots configuration', () => {
      // Given: The product-detail.js file
      // When: Analyzing slot configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have slots configuration in render call
      expect(content).toContain('slots:');
    });

    it('should customize Image slot with BuildRight classes', () => {
      // Given: The product-detail.js file
      // When: Analyzing Image slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have Image slot with buildright prefix
      expect(content).toContain('Image:');
      expect(content).toContain('buildright-pdp-image');
    });

    it('should customize Title slot with BuildRight classes', () => {
      // Given: The product-detail.js file
      // When: Analyzing Title slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have Title slot with buildright prefix
      expect(content).toContain('Title:');
      expect(content).toContain('buildright-pdp');
    });

    it('should customize Price slot with BuildRight classes', () => {
      // Given: The product-detail.js file
      // When: Analyzing Price slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have Price slot with buildright prefix
      expect(content).toContain('Price:');
      expect(content).toContain('buildright-pdp-pricing');
    });
  });

  describe('Test 7: CSS uses BuildRight design tokens', () => {
    it('should have product-detail.css file', () => {
      // Given: The blocks/product-detail directory
      // When: Checking for CSS file
      const exists = fs.existsSync(CSS_FILE_PATH);

      // Then: CSS file should exist
      expect(exists).toBe(true);
    });

    it('should use CSS custom properties for colors', () => {
      // Given: The product-detail.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for colors
      expect(content).toMatch(/var\s*\(\s*--color-/);
    });

    it('should use CSS custom properties for spacing', () => {
      // Given: The product-detail.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for spacing/borders
      expect(content).toMatch(/var\s*\(\s*--/);
    });

    it('should have buildright-pdp-* CSS classes defined', () => {
      // Given: The product-detail.css file (may be in existing or new section)
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have BuildRight PDP classes
      // Check for at least one .buildright-pdp class
      expect(content).toMatch(/\.buildright-pdp/);
    });
  });

  describe('Test 8: Block handles render errors gracefully', () => {
    it('should wrap render in try-catch', () => {
      // Given: The product-detail.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have try-catch around render
      expect(content).toContain('try {');
      expect(content).toContain('catch');
    });

    it('should show error state on render failure', () => {
      // Given: The product-detail.js file
      // When: Analyzing catch block
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show error state in catch
      expect(content).toContain('Unable to Load Product');
      expect(content).toContain('createStateMessage');
    });
  });
});
