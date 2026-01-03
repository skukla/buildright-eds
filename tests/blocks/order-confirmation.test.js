/**
 * Order Confirmation Block Tests
 *
 * TDD tests for Step 11: Enhanced Order Confirmation Block using @dropins/storefront-order
 * Validates block structure, loading states, slot customization, event bus integration,
 * order details display, and BuildRight styling.
 *
 * Follows the canonical pattern from cart.test.js, checkout.test.js, and auth.test.js
 *
 * @module tests/blocks/order-confirmation.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../../blocks');
const ORDER_CONFIRMATION_DIR = path.join(BLOCKS_DIR, 'order-confirmation');
const JS_FILE_PATH = path.join(ORDER_CONFIRMATION_DIR, 'order-confirmation.js');
const CSS_FILE_PATH = path.join(ORDER_CONFIRMATION_DIR, 'order-confirmation.css');

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

describe('Order Confirmation Block', () => {
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

  // ===========================================================================
  // TEST 1: Block exports default decorate function
  // ===========================================================================
  describe('Test 1: Block exports default decorate function', () => {
    it('should have the order-confirmation.js file', () => {
      // Given: The blocks/order-confirmation directory
      // When: Checking for order-confirmation.js
      const exists = fs.existsSync(JS_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export a default async function', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing the file contents
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have default export with async function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should accept block parameter in decorate function', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing the decorate function signature
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have decorate(block) signature
      expect(content).toMatch(/async function decorate\s*\(\s*block\s*\)/);
    });
  });

  // ===========================================================================
  // TEST 2: Block shows loading state initially
  // ===========================================================================
  describe('Test 2: Block shows loading state initially', () => {
    it('should render loading state with buildright-order-loading class', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing initial loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should set loading HTML with buildright prefix
      expect(content).toContain('buildright-order-loading');
    });

    it('should use loading-spinner component', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use loading spinner
      expect(content).toContain('loading-spinner');
    });

    it('should display order-specific loading message', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing loading state message
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show order-specific loading message
      expect(content).toMatch(/Loading|Fetching|order/i);
    });
  });

  // ===========================================================================
  // TEST 3: Block handles missing order number gracefully
  // ===========================================================================
  describe('Test 3: Block handles missing order number gracefully', () => {
    it('should check for order number in URL', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing URL parameter handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check for order or orderNumber parameter
      expect(content).toMatch(/URLSearchParams|searchParams|order/);
    });

    it('should show Order Not Found state when order number missing', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing missing order handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show Order Not Found message
      expect(content).toContain('Order Not Found');
      expect(content).toContain('createStateMessage');
    });

    it('should provide View Order History option when order not found', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing fallback actions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide order history or browse catalog option
      expect(content).toMatch(/Order History|Browse Catalog|account/i);
    });
  });

  // ===========================================================================
  // TEST 4: Block handles dropins disabled gracefully
  // ===========================================================================
  describe('Test 4: Block handles dropins disabled gracefully', () => {
    it('should load site configuration', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing config loading
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import and use loadConfig
      expect(content).toContain('loadConfig');
      expect(content).toContain('site-config.js');
    });

    it('should check useCommerceDropins feature flag', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing feature flag check
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check config.features.useCommerceDropins
      expect(content).toMatch(/config\.features\?\.useCommerceDropins/);
    });

    it('should show fallback success message when dropins disabled', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing disabled dropin handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show fallback order confirmation message
      expect(content).toMatch(/Thank you|Order Confirmed|success/i);
    });

    it('should display order number in fallback state', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing fallback state with order number
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should display the order number
      expect(content).toContain('orderNumber');
    });
  });

  // ===========================================================================
  // TEST 5: Block imports @dropins/storefront-order
  // ===========================================================================
  describe('Test 5: Block imports @dropins/storefront-order', () => {
    it('should import render from storefront-order', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from @dropins/storefront-order
      expect(content).toContain('@dropins/storefront-order/render.js');
    });

    it('should import OrderConfirmation container', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import OrderConfirmation container
      expect(content).toContain('@dropins/storefront-order/containers/OrderConfirmation.js');
    });
  });

  // ===========================================================================
  // TEST 6: OrderHeader slot renders with BuildRight styling
  // ===========================================================================
  describe('Test 6: OrderHeader slot renders with BuildRight styling', () => {
    it('should define slots configuration', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing slot configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have slots configuration in render call
      expect(content).toContain('slots:');
    });

    it('should customize OrderHeader slot with buildright-order-header class', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing OrderHeader slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have OrderHeader slot with buildright prefix
      expect(content).toContain('OrderHeader');
      expect(content).toContain('buildright-order-header');
    });

    it('should include success icon in header', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing header slot styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have success icon (checkmark/check or svg)
      expect(content).toMatch(/check|success|svg/i);
    });
  });

  // ===========================================================================
  // TEST 7: OrderItems slot renders with BuildRight styling
  // ===========================================================================
  describe('Test 7: OrderItems slot renders with BuildRight styling', () => {
    it('should customize OrderItems slot', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing OrderItems slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have OrderItems or Items slot
      expect(content).toMatch(/OrderItems|Items/);
    });

    it('should use buildright-order-items class', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing OrderItems styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright prefix for items
      expect(content).toContain('buildright-order-items');
    });
  });

  // ===========================================================================
  // TEST 8: OrderTotals slot renders correctly
  // ===========================================================================
  describe('Test 8: OrderTotals slot renders correctly', () => {
    it('should customize OrderTotals slot', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing OrderTotals slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have OrderTotals or Totals slot
      expect(content).toMatch(/OrderTotals|Totals/);
    });

    it('should use buildright-order-totals class', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing OrderTotals styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright prefix for totals
      expect(content).toContain('buildright-order-totals');
    });
  });

  // ===========================================================================
  // TEST 9: ShippingInfo slot renders with BuildRight styling
  // ===========================================================================
  describe('Test 9: ShippingInfo slot renders with BuildRight styling', () => {
    it('should customize ShippingInfo or ShippingAddress slot', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing ShippingInfo slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have ShippingInfo or ShippingAddress slot
      expect(content).toMatch(/ShippingInfo|ShippingAddress|Shipping/);
    });

    it('should use buildright-order-shipping class', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing ShippingInfo styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright prefix for shipping
      expect(content).toContain('buildright-order-shipping');
    });
  });

  // ===========================================================================
  // TEST 10: Event bus emits order confirmation events
  // ===========================================================================
  describe('Test 10: Event bus emits order confirmation events', () => {
    it('should emit order:loading event', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing event emission
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit order:loading event
      expect(content).toContain('order:loading');
    });

    it('should emit order:loaded event on success', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing successful load
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit order:loaded event
      expect(content).toContain('order:loaded');
    });

    it('should emit order:error event on failure', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit order:error event
      expect(content).toContain('order:error');
    });

    it('should use dispatchEvent for custom events', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing event dispatch mechanism
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should dispatch custom events
      expect(content).toContain('dispatchEvent');
      expect(content).toContain('CustomEvent');
    });
  });

  // ===========================================================================
  // TEST 11: Event bus subscriptions
  // ===========================================================================
  describe('Test 11: Event bus subscriptions', () => {
    it('should import from @dropins/tools/event-bus.js', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing event bus import
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from event-bus
      expect(content).toContain('@dropins/tools/event-bus.js');
    });

    it('should subscribe to order events', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing event subscriptions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should subscribe to order-related events
      expect(content).toMatch(/events\.on|subscribe/);
    });
  });

  // ===========================================================================
  // TEST 12: Block handles render errors gracefully
  // ===========================================================================
  describe('Test 12: Block handles render errors gracefully', () => {
    it('should wrap render in try-catch', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have try-catch around render
      expect(content).toContain('try {');
      expect(content).toContain('catch');
    });

    it('should show error state on render failure', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing catch block
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show error state in catch using createStateMessage
      expect(content).toContain('createStateMessage');
    });

    it('should provide fallback action on error', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide browse catalog or home link
      expect(content).toMatch(/Browse Catalog|Home|catalog\.html/);
    });
  });

  // ===========================================================================
  // TEST 13: Block uses [OrderConfirmation] logging prefix
  // ===========================================================================
  describe('Test 13: Block uses [OrderConfirmation] logging prefix', () => {
    it('should use [OrderConfirmation] prefix for logging, not [OrderConfirmationDropin]', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing logging statements
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use [OrderConfirmation] prefix
      expect(content).toContain('[OrderConfirmation]');
      // Should NOT use [OrderConfirmationDropin]
      expect(content).not.toContain('[OrderConfirmationDropin]');
      expect(content).not.toContain('[Order Confirmation Dropin]');
      expect(content).not.toContain('[Order-Confirmation-Dropin]');
    });
  });

  // ===========================================================================
  // TEST 14: Block uses waitForDropins pattern
  // ===========================================================================
  describe('Test 14: Block uses waitForDropins pattern', () => {
    it('should use waitForDropins before rendering', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing dropin initialization
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should wait for dropins to initialize
      expect(content).toContain('waitForDropins');
      expect(content).toContain('initializers/index.js');
    });

    it('should clear loading state before rendering OrderConfirmation', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing loading state cleanup
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear block before rendering dropin
      const loadingIndex = content.indexOf('buildright-order-loading');
      const clearIndex = content.indexOf("block.innerHTML = ''", loadingIndex);
      expect(clearIndex).toBeGreaterThan(loadingIndex);
    });
  });

  // ===========================================================================
  // TEST 15: CSS file exists and uses BuildRight design tokens
  // ===========================================================================
  describe('Test 15: CSS uses BuildRight design tokens', () => {
    it('should have order-confirmation.css file', () => {
      // Given: The blocks/order-confirmation directory
      // When: Checking for CSS file
      const exists = fs.existsSync(CSS_FILE_PATH);

      // Then: CSS file should exist
      expect(exists).toBe(true);
    });

    it('should use CSS custom properties for colors', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for colors
      expect(content).toMatch(/var\s*\(\s*--color-/);
    });

    it('should use CSS custom properties for spacing', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for spacing
      expect(content).toMatch(/var\s*\(\s*--spacing-/);
    });

    it('should have buildright-order-* CSS classes defined', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have BuildRight order classes
      expect(content).toMatch(/\.buildright-order/);
    });

    it('should have loading state styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have loading state styles
      expect(content).toContain('buildright-order-loading');
    });

    it('should have mobile responsive styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have media query for mobile
      expect(content).toMatch(/@media\s*\([^)]*768px/);
    });
  });

  // ===========================================================================
  // TEST 16: CSS uses specific design tokens
  // ===========================================================================
  describe('Test 16: CSS uses specific design tokens', () => {
    it('should use --color-brand-500 for primary actions', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use brand color token
      expect(content).toContain('--color-brand-500');
    });

    it('should use --color-text for body text', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use text color token
      expect(content).toContain('--color-text');
    });

    it('should use --color-surface for backgrounds', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use surface color token
      expect(content).toContain('--color-surface');
    });

    it('should use --color-border for borders', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border color token
      expect(content).toContain('--color-border');
    });

    it('should use --shape-border-radius tokens', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border radius tokens
      expect(content).toMatch(/--shape-border-radius/);
    });
  });

  // ===========================================================================
  // TEST 17: CSS has order confirmation specific styles
  // ===========================================================================
  describe('Test 17: CSS has order confirmation specific styles', () => {
    it('should have header section styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have header styles
      expect(content).toContain('buildright-order-header');
    });

    it('should have success icon styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have success icon/check styles
      expect(content).toMatch(/success|check|icon/i);
    });

    it('should have items section styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have items styles
      expect(content).toContain('buildright-order-items');
    });

    it('should have totals section styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have totals styles
      expect(content).toContain('buildright-order-totals');
    });

    it('should have shipping section styles', () => {
      // Given: The order-confirmation.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have shipping styles
      expect(content).toContain('buildright-order-shipping');
    });
  });

  // ===========================================================================
  // TEST 18: Block has canonical helper functions
  // ===========================================================================
  describe('Test 18: Block has canonical helper functions', () => {
    it('should have createLoadingState function', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have createLoadingState function
      expect(content).toContain('createLoadingState');
    });

    it('should have emitOrderEvent function for event bus', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have emitOrderEvent function
      expect(content).toContain('emitOrderEvent');
    });

    it('should have getOrderNumberFromURL function', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have function to get order number from URL
      expect(content).toMatch(/getOrderNumber|extractOrderNumber|orderNumber.*URL|URLSearchParams/);
    });
  });

  // ===========================================================================
  // TEST 19: Block configures order routes
  // ===========================================================================
  describe('Test 19: Block configures order routes', () => {
    it('should configure routeProduct for item links', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing product routing
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure product detail route
      expect(content).toContain('routeProduct');
    });

    it('should pass order number to dropin', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing order number configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should pass order number
      expect(content).toMatch(/orderNumber|orderRef|number/);
    });
  });

  // ===========================================================================
  // TEST 20: Block has section titles for order sections
  // ===========================================================================
  describe('Test 20: Block has section titles for order sections', () => {
    it('should have order items title', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing section titles
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have items section title
      expect(content).toMatch(/Order Items|Items Ordered|Your Items/i);
    });

    it('should have order totals title', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing section titles
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have totals section title
      expect(content).toMatch(/Order Total|Summary|Totals/i);
    });

    it('should have shipping info title', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing section titles
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have shipping section title
      expect(content).toMatch(/Shipping|Delivery/i);
    });
  });

  // ===========================================================================
  // TEST 21: Block passes orderNumber or token to dropin
  // ===========================================================================
  describe('Test 21: Block passes order identifier to dropin', () => {
    it('should support orderNumber parameter', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing dropin configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should support orderNumber parameter
      expect(content).toContain('orderNumber');
    });

    it('should support guest order token', () => {
      // Given: The order-confirmation.js file
      // When: Analyzing guest order support
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should support token for guest orders
      expect(content).toMatch(/token|guest/i);
    });
  });
});
