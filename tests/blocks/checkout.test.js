/**
 * Checkout Block Tests
 *
 * TDD tests for Step 7: Enhanced Checkout Block using @dropins/storefront-checkout
 * Validates block structure, loading states, slot customization, event bus integration,
 * order completion handlers, and BuildRight styling.
 *
 * Follows the canonical pattern from cart.test.js
 *
 * @module tests/blocks/checkout.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../../blocks');
const CHECKOUT_DIR = path.join(BLOCKS_DIR, 'checkout');
const JS_FILE_PATH = path.join(CHECKOUT_DIR, 'checkout.js');
const CSS_FILE_PATH = path.join(CHECKOUT_DIR, 'checkout.css');

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

describe('Checkout Block', () => {
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
    it('should have the checkout.js file', () => {
      // Given: The blocks/checkout directory
      // When: Checking for checkout.js
      const exists = fs.existsSync(JS_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export a default async function', () => {
      // Given: The checkout.js file
      // When: Analyzing the file contents
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have default export with async function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should accept block parameter in decorate function', () => {
      // Given: The checkout.js file
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
    it('should render loading state with buildright-checkout-loading class', () => {
      // Given: The checkout.js file
      // When: Analyzing initial loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should set loading HTML with buildright prefix
      expect(content).toContain('buildright-checkout-loading');
    });

    it('should use loading-spinner component', () => {
      // Given: The checkout.js file
      // When: Analyzing loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use loading spinner
      expect(content).toContain('loading-spinner');
    });

    it('should display "Preparing your checkout..." message', () => {
      // Given: The checkout.js file
      // When: Analyzing loading state message
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show checkout-specific loading message
      expect(content).toContain('Preparing your checkout');
    });
  });

  // ===========================================================================
  // TEST 3: Block handles dropins disabled gracefully
  // ===========================================================================
  describe('Test 3: Block handles dropins disabled gracefully', () => {
    it('should load site configuration', () => {
      // Given: The checkout.js file
      // When: Analyzing config loading
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import and use loadConfig
      expect(content).toContain('loadConfig');
      expect(content).toContain('site-config.js');
    });

    it('should check useCommerceDropins feature flag', () => {
      // Given: The checkout.js file
      // When: Analyzing feature flag check
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check config.features.useCommerceDropins
      expect(content).toMatch(/config\.features\?\.useCommerceDropins/);
    });

    it('should show error state when dropins are disabled', () => {
      // Given: The checkout.js file
      // When: Analyzing disabled dropin handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show appropriate error for disabled dropins
      expect(content).toContain('Commerce Dropins Not Enabled');
      expect(content).toContain('createStateMessage');
    });
  });

  // ===========================================================================
  // TEST 4: Block imports @dropins/storefront-checkout
  // ===========================================================================
  describe('Test 4: Block imports @dropins/storefront-checkout', () => {
    it('should import render from storefront-checkout', () => {
      // Given: The checkout.js file
      // When: Analyzing imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from @dropins/storefront-checkout
      expect(content).toContain('@dropins/storefront-checkout/render.js');
    });

    it('should import Checkout container', () => {
      // Given: The checkout.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import Checkout container
      expect(content).toContain('@dropins/storefront-checkout/containers/Checkout.js');
    });
  });

  // ===========================================================================
  // TEST 5: ShippingMethods slot renders with BuildRight styling
  // ===========================================================================
  describe('Test 5: ShippingMethods slot renders with BuildRight styling', () => {
    it('should define slots configuration', () => {
      // Given: The checkout.js file
      // When: Analyzing slot configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have slots configuration in render call
      expect(content).toContain('slots:');
    });

    it('should customize ShippingMethods slot with buildright-checkout-shipping class', () => {
      // Given: The checkout.js file
      // When: Analyzing ShippingMethods slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have ShippingMethods slot with buildright prefix
      expect(content).toContain('ShippingMethods');
      expect(content).toContain('buildright-checkout-shipping');
    });
  });

  // ===========================================================================
  // TEST 6: PaymentMethods slot renders with BuildRight styling
  // ===========================================================================
  describe('Test 6: PaymentMethods slot renders with BuildRight styling', () => {
    it('should customize PaymentMethods slot', () => {
      // Given: The checkout.js file
      // When: Analyzing PaymentMethods slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have PaymentMethods slot
      expect(content).toContain('PaymentMethods');
    });

    it('should use buildright-checkout-payment class', () => {
      // Given: The checkout.js file
      // When: Analyzing PaymentMethods styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright prefix for payment
      expect(content).toContain('buildright-checkout-payment');
    });
  });

  // ===========================================================================
  // TEST 7: OrderSummary slot renders correctly
  // ===========================================================================
  describe('Test 7: OrderSummary slot renders correctly', () => {
    it('should customize OrderSummary slot', () => {
      // Given: The checkout.js file
      // When: Analyzing OrderSummary slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have OrderSummary slot
      expect(content).toContain('OrderSummary');
    });

    it('should use buildright-checkout-summary class', () => {
      // Given: The checkout.js file
      // When: Analyzing OrderSummary styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright prefix for summary
      expect(content).toContain('buildright-checkout-summary');
    });
  });

  // ===========================================================================
  // TEST 8: ShippingAddress slot renders
  // ===========================================================================
  describe('Test 8: ShippingAddress slot renders', () => {
    it('should customize ShippingAddress slot with buildright-checkout-address class', () => {
      // Given: The checkout.js file
      // When: Analyzing ShippingAddress slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have ShippingAddress slot with buildright prefix
      expect(content).toContain('ShippingAddress');
      expect(content).toContain('buildright-checkout-address');
    });
  });

  // ===========================================================================
  // TEST 9: BillingAddress slot renders
  // ===========================================================================
  describe('Test 9: BillingAddress slot renders', () => {
    it('should customize BillingAddress slot with buildright-checkout-billing class', () => {
      // Given: The checkout.js file
      // When: Analyzing BillingAddress slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have BillingAddress slot with buildright prefix
      expect(content).toContain('BillingAddress');
      expect(content).toContain('buildright-checkout-billing');
    });
  });

  // ===========================================================================
  // TEST 10: PlaceOrderButton slot renders
  // ===========================================================================
  describe('Test 10: PlaceOrderButton slot renders', () => {
    it('should customize PlaceOrderButton slot with buildright-checkout-actions class', () => {
      // Given: The checkout.js file
      // When: Analyzing PlaceOrderButton slot
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have actions area with buildright prefix
      expect(content).toMatch(/PlaceOrder|Actions/);
      expect(content).toContain('buildright-checkout-actions');
    });
  });

  // ===========================================================================
  // TEST 11: Event bus emits checkout events
  // ===========================================================================
  describe('Test 11: Event bus emits checkout events', () => {
    it('should emit checkout:loading event', () => {
      // Given: The checkout.js file
      // When: Analyzing event emission
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit checkout:loading event
      expect(content).toContain('checkout:loading');
    });

    it('should emit checkout:loaded event on success', () => {
      // Given: The checkout.js file
      // When: Analyzing successful load
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit checkout:loaded event
      expect(content).toContain('checkout:loaded');
    });

    it('should emit checkout:error event on failure', () => {
      // Given: The checkout.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit checkout:error event
      expect(content).toContain('checkout:error');
    });

    it('should use dispatchEvent for custom events', () => {
      // Given: The checkout.js file
      // When: Analyzing event dispatch mechanism
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should dispatch custom events
      expect(content).toContain('dispatchEvent');
      expect(content).toContain('CustomEvent');
    });
  });

  // ===========================================================================
  // TEST 12: Event bus subscriptions for checkout/updated and checkout/order-placed
  // ===========================================================================
  describe('Test 12: Event bus subscriptions', () => {
    it('should subscribe to checkout/updated event from event-bus', () => {
      // Given: The checkout.js file
      // When: Analyzing event subscriptions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should subscribe to checkout/updated
      expect(content).toContain('checkout/updated');
      expect(content).toContain('@dropins/tools/event-bus.js');
    });

    it('should subscribe to checkout/order-placed event', () => {
      // Given: The checkout.js file
      // When: Analyzing order-placed subscription
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should subscribe to checkout/order-placed
      expect(content).toContain('checkout/order-placed');
    });
  });

  // ===========================================================================
  // TEST 13: Order success handler redirects
  // ===========================================================================
  describe('Test 13: Order success handler redirects', () => {
    it('should configure onOrderSuccess handler', () => {
      // Given: The checkout.js file
      // When: Analyzing order success configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have onOrderSuccess handler
      expect(content).toContain('onOrderSuccess');
    });

    it('should redirect to order confirmation page on success', () => {
      // Given: The checkout.js file
      // When: Analyzing success redirect behavior
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should redirect to confirmation page
      expect(content).toMatch(/order-confirmation|window\.location/);
    });
  });

  // ===========================================================================
  // TEST 14: Order error handler displays message
  // ===========================================================================
  describe('Test 14: Order error handler displays message', () => {
    it('should configure onOrderError handler', () => {
      // Given: The checkout.js file
      // When: Analyzing order error configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have onOrderError handler
      expect(content).toContain('onOrderError');
    });

    it('should log error for debugging', () => {
      // Given: The checkout.js file
      // When: Analyzing error logging
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should log order error
      expect(content).toMatch(/console\.(error|warn).*order|error.*order/i);
    });
  });

  // ===========================================================================
  // TEST 15: Block handles render errors gracefully
  // ===========================================================================
  describe('Test 15: Block handles render errors gracefully', () => {
    it('should wrap render in try-catch', () => {
      // Given: The checkout.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have try-catch around render
      expect(content).toContain('try {');
      expect(content).toContain('catch');
    });

    it('should show error state on render failure', () => {
      // Given: The checkout.js file
      // When: Analyzing catch block
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show error state in catch using createStateMessage
      expect(content).toContain('createStateMessage');
    });

    it('should provide Return to Cart fallback action', () => {
      // Given: The checkout.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide cart link as fallback
      expect(content).toMatch(/Return to Cart|Browse Catalog|cart\.html|catalog\.html/);
    });
  });

  // ===========================================================================
  // TEST 16: Block uses [Checkout] logging prefix
  // ===========================================================================
  describe('Test 16: Block uses [Checkout] logging prefix', () => {
    it('should use [Checkout] prefix for logging, not [CheckoutDropin]', () => {
      // Given: The checkout.js file
      // When: Analyzing logging statements
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use [Checkout] prefix
      expect(content).toContain('[Checkout]');
      // Should NOT use [CheckoutDropin] or [Checkout Dropin]
      expect(content).not.toContain('[CheckoutDropin]');
      expect(content).not.toContain('[Checkout Dropin]');
    });
  });

  // ===========================================================================
  // TEST 17: CSS file exists and uses BuildRight design tokens
  // ===========================================================================
  describe('Test 17: CSS uses BuildRight design tokens', () => {
    it('should have checkout.css file', () => {
      // Given: The blocks/checkout directory
      // When: Checking for CSS file
      const exists = fs.existsSync(CSS_FILE_PATH);

      // Then: CSS file should exist
      expect(exists).toBe(true);
    });

    it('should use CSS custom properties for colors', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for colors
      expect(content).toMatch(/var\s*\(\s*--color-/);
    });

    it('should use CSS custom properties for spacing', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for spacing
      expect(content).toMatch(/var\s*\(\s*--spacing-/);
    });

    it('should have buildright-checkout-* CSS classes defined', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have BuildRight checkout classes
      expect(content).toMatch(/\.buildright-checkout/);
    });

    it('should have loading state styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have loading state styles
      expect(content).toContain('buildright-checkout-loading');
    });

    it('should have shipping section styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have shipping styles
      expect(content).toContain('buildright-checkout-shipping');
    });

    it('should have mobile responsive styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have media query for mobile
      expect(content).toMatch(/@media\s*\([^)]*768px/);
    });
  });

  // ===========================================================================
  // TEST 18: CSS design token usage - specific tokens
  // ===========================================================================
  describe('Test 18: CSS uses specific design tokens', () => {
    it('should use --color-brand-500 for primary actions', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use brand color token
      expect(content).toContain('--color-brand-500');
    });

    it('should use --color-text for body text', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use text color token
      expect(content).toContain('--color-text');
    });

    it('should use --color-surface for backgrounds', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use surface color token
      expect(content).toContain('--color-surface');
    });

    it('should use --color-border for borders', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border color token
      expect(content).toContain('--color-border');
    });

    it('should use --shape-border-radius tokens', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border radius tokens
      expect(content).toMatch(/--shape-border-radius/);
    });
  });

  // ===========================================================================
  // TEST 19: Block uses waitForDropins pattern
  // ===========================================================================
  describe('Test 19: Block uses waitForDropins pattern', () => {
    it('should use waitForDropins before rendering', () => {
      // Given: The checkout.js file
      // When: Analyzing dropin initialization
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should wait for dropins to initialize
      expect(content).toContain('waitForDropins');
      expect(content).toContain('initializers/index.js');
    });

    it('should clear loading state before rendering Checkout', () => {
      // Given: The checkout.js file
      // When: Analyzing loading state cleanup
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear block before rendering dropin
      const loadingIndex = content.indexOf('buildright-checkout-loading');
      const clearIndex = content.indexOf("block.innerHTML = ''", loadingIndex);
      expect(clearIndex).toBeGreaterThan(loadingIndex);
    });
  });

  // ===========================================================================
  // TEST 20: CSS has two-column layout for desktop
  // ===========================================================================
  describe('Test 20: CSS has two-column layout for desktop', () => {
    it('should use grid or flexbox for main layout', () => {
      // Given: The checkout.css file
      // When: Analyzing layout styles
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have grid or flexbox layout
      expect(content).toMatch(/display:\s*(grid|flex)/);
    });

    it('should have checkout-main and checkout-sidebar sections', () => {
      // Given: The checkout.css file
      // When: Analyzing layout sections
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have main and sidebar sections
      expect(content).toMatch(/buildright-checkout-(main|content)/);
      expect(content).toMatch(/buildright-checkout-(sidebar|summary)/);
    });
  });

  // ===========================================================================
  // TEST 21: CSS form input styling
  // ===========================================================================
  describe('Test 21: CSS form input styling', () => {
    it('should have form input styling using design tokens', () => {
      // Given: The checkout.css file
      // When: Analyzing form styles
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have form-related styles
      expect(content).toMatch(/input|form|field/i);
    });

    it('should use focus states with brand color', () => {
      // Given: The checkout.css file
      // When: Analyzing focus styles
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have focus styling
      expect(content).toMatch(/:focus|focus-within/);
    });
  });

  // ===========================================================================
  // TEST 22: Payment and billing slot CSS classes exist
  // ===========================================================================
  describe('Test 22: Payment and billing slot CSS classes exist', () => {
    it('should have payment section styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have payment styles
      expect(content).toContain('buildright-checkout-payment');
    });

    it('should have billing address styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have billing styles
      expect(content).toContain('buildright-checkout-billing');
    });

    it('should have actions/place order button styles', () => {
      // Given: The checkout.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have actions styles
      expect(content).toContain('buildright-checkout-actions');
    });
  });
});
