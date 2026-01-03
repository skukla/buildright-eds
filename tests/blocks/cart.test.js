/**
 * Cart Block Tests
 *
 * TDD tests for Step 6: Enhanced Cart Block using @dropins/storefront-cart
 * Validates block structure, loading states, slot customization, event bus integration,
 * and BuildRight styling.
 *
 * Follows the canonical pattern from product-detail.test.js
 *
 * @module tests/blocks/cart.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../../blocks');
const CART_DIR = path.join(BLOCKS_DIR, 'cart');
const JS_FILE_PATH = path.join(CART_DIR, 'cart.js');
const CSS_FILE_PATH = path.join(CART_DIR, 'cart.css');

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

describe('Cart Block', () => {
  let jsContent;
  let cssContent;

  beforeAll(() => {
    // Only try to read files if they exist (test will fail if they don't)
    if (fs.existsSync(JS_FILE_PATH)) {
      jsContent = readJSFile(JS_FILE_PATH);
    }
    if (fs.existsSync(CSS_FILE_PATH)) {
      cssContent = readCSSFile(CSS_FILE_PATH);
    }
  });

  describe('Test 1: Block exports default decorate function', () => {
    it('should have the cart.js file', () => {
      // Given: The blocks/cart directory
      // When: Checking for cart.js
      const exists = fs.existsSync(JS_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export a default async function', () => {
      // Given: The cart.js file
      // When: Analyzing the file contents
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have default export with async function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should accept block parameter in decorate function', () => {
      // Given: The cart.js file
      // When: Analyzing the decorate function signature
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have decorate(block) signature
      expect(content).toMatch(/async function decorate\s*\(\s*block\s*\)/);
    });
  });

  describe('Test 2: Block shows loading state initially', () => {
    it('should render loading state before dropin initialization', () => {
      // Given: The cart.js file
      // When: Analyzing initial loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should set loading HTML with buildright prefix
      expect(content).toContain('buildright-cart-loading');
      expect(content).toContain('loading-spinner');
    });

    it('should use waitForDropins before rendering', () => {
      // Given: The cart.js file
      // When: Analyzing dropin initialization
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should wait for dropins to initialize
      expect(content).toContain('waitForDropins');
      expect(content).toContain('initializers/index.js');
    });

    it('should clear loading state before rendering CartSummaryList', () => {
      // Given: The cart.js file
      // When: Analyzing loading state cleanup
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear block before rendering dropin
      const loadingIndex = content.indexOf('buildright-cart-loading');
      const clearIndex = content.indexOf("block.innerHTML = ''", loadingIndex);
      expect(clearIndex).toBeGreaterThan(loadingIndex);
    });
  });

  describe('Test 3: Block handles dropins disabled gracefully', () => {
    it('should load site configuration', () => {
      // Given: The cart.js file
      // When: Analyzing config loading
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import and use loadConfig
      expect(content).toContain('loadConfig');
      expect(content).toContain('site-config.js');
    });

    it('should check useCommerceDropins feature flag', () => {
      // Given: The cart.js file
      // When: Analyzing feature flag check
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check config.features.useCommerceDropins
      expect(content).toMatch(/config\.features\?\.useCommerceDropins/);
    });

    it('should show error state when dropins are disabled', () => {
      // Given: The cart.js file
      // When: Analyzing disabled dropin handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show appropriate error for disabled dropins
      expect(content).toContain('Commerce Dropins Not Enabled');
      // Should use createStateMessage
      expect(content).toContain('createStateMessage');
    });
  });

  describe('Test 4: Block imports @dropins/storefront-cart', () => {
    it('should import render from storefront-cart', () => {
      // Given: The cart.js file
      // When: Analyzing imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from @dropins/storefront-cart
      expect(content).toContain('@dropins/storefront-cart/render.js');
    });

    it('should import CartSummaryList container', () => {
      // Given: The cart.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import CartSummaryList container
      expect(content).toContain('@dropins/storefront-cart/containers/CartSummaryList.js');
    });
  });

  describe('Test 5: EmptyCart slot renders BuildRight styling', () => {
    it('should define slots configuration', () => {
      // Given: The cart.js file
      // When: Analyzing slot configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have slots configuration in render call
      expect(content).toContain('slots:');
    });

    it('should customize EmptyCart slot with BuildRight classes', () => {
      // Given: The cart.js file
      // When: Analyzing EmptyCart slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have EmptyCart slot with buildright prefix
      expect(content).toContain('EmptyCart');
      expect(content).toContain('buildright-cart-empty');
    });
  });

  describe('Test 6: CartItem slot renders product with BuildRight classes', () => {
    it('should customize CartItem slot with BuildRight classes', () => {
      // Given: The cart.js file
      // When: Analyzing CartItem slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have CartItem slot with buildright prefix
      // Note: CartItem or Item slot may be used
      expect(content).toMatch(/buildright-cart-item/);
    });

    it('should customize product image in cart items', () => {
      // Given: The cart.js file
      // When: Analyzing CartItemImage slot or image handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should handle item image with buildright class
      expect(content).toContain('buildright-cart');
    });
  });

  describe('Test 7: Event bus emits cart events', () => {
    it('should emit cart:loading event', () => {
      // Given: The cart.js file
      // When: Analyzing event emission
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit cart:loading event
      expect(content).toContain('cart:loading');
    });

    it('should emit cart:loaded event on success', () => {
      // Given: The cart.js file
      // When: Analyzing successful load
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit cart:loaded event
      expect(content).toContain('cart:loaded');
    });

    it('should emit cart:error event on failure', () => {
      // Given: The cart.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit cart:error event
      expect(content).toContain('cart:error');
    });

    it('should use dispatchEvent for custom events', () => {
      // Given: The cart.js file
      // When: Analyzing event dispatch mechanism
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should dispatch custom events
      expect(content).toContain('dispatchEvent');
      expect(content).toContain('CustomEvent');
    });
  });

  describe('Test 8: Block handles render errors gracefully', () => {
    it('should wrap render in try-catch', () => {
      // Given: The cart.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have try-catch around render
      expect(content).toContain('try {');
      expect(content).toContain('catch');
    });

    it('should show error state on render failure', () => {
      // Given: The cart.js file
      // When: Analyzing catch block
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show error state in catch using createStateMessage
      expect(content).toContain('createStateMessage');
    });

    it('should provide Browse Catalog fallback action', () => {
      // Given: The cart.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide catalog link as fallback
      expect(content).toContain('Browse Catalog');
    });
  });

  describe('Test 9: Block uses [Cart] logging prefix', () => {
    it('should use [Cart] prefix for logging, not [CartDropin]', () => {
      // Given: The cart.js file
      // When: Analyzing logging statements
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use [Cart] prefix
      expect(content).toContain('[Cart]');
      // Should NOT use [CartDropin] or [Cart Dropin]
      expect(content).not.toContain('[CartDropin]');
      expect(content).not.toContain('[Cart Dropin]');
    });
  });

  describe('Test 10: CSS uses BuildRight design tokens', () => {
    it('should have cart.css file', () => {
      // Given: The blocks/cart directory
      // When: Checking for CSS file
      const exists = fs.existsSync(CSS_FILE_PATH);

      // Then: CSS file should exist
      expect(exists).toBe(true);
    });

    it('should use CSS custom properties for colors', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for colors
      expect(content).toMatch(/var\s*\(\s*--color-/);
    });

    it('should use CSS custom properties for spacing', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for spacing
      expect(content).toMatch(/var\s*\(\s*--spacing-/);
    });

    it('should have buildright-cart-* CSS classes defined', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have BuildRight cart classes
      expect(content).toMatch(/\.buildright-cart/);
    });

    it('should have loading state styles', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have loading state styles
      expect(content).toContain('buildright-cart-loading');
    });

    it('should have empty cart state styles', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have empty cart state styles
      expect(content).toContain('buildright-cart-empty');
    });

    it('should have mobile responsive styles', () => {
      // Given: The cart.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have media query for mobile
      expect(content).toMatch(/@media\s*\([^)]*768px/);
    });
  });

  describe('Test 11: Block configures cart routes', () => {
    it('should configure routeEmptyCartCTA', () => {
      // Given: The cart.js file
      // When: Analyzing cart configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure empty cart CTA route
      expect(content).toContain('routeEmptyCartCTA');
    });

    it('should configure routeProduct for item links', () => {
      // Given: The cart.js file
      // When: Analyzing product routing
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure product detail route
      expect(content).toContain('routeProduct');
    });

    it('should enable item quantity updates', () => {
      // Given: The cart.js file
      // When: Analyzing cart features
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should enable quantity updates
      expect(content).toContain('enableUpdateItemQuantity');
    });

    it('should enable item removal', () => {
      // Given: The cart.js file
      // When: Analyzing cart features
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should enable item removal
      expect(content).toContain('enableRemoveItem');
    });
  });
});
