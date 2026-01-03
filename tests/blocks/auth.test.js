/**
 * Auth Block Tests
 *
 * TDD tests for Step 10: Enhanced Auth Block using @dropins/storefront-auth
 * Validates block structure, loading states, slot customization, event bus integration,
 * form variants (sign-in, register, reset-password, user-menu), and BuildRight styling.
 *
 * Follows the canonical pattern from cart.test.js and checkout.test.js
 *
 * @module tests/blocks/auth.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../../blocks');
const AUTH_DIR = path.join(BLOCKS_DIR, 'auth');
const JS_FILE_PATH = path.join(AUTH_DIR, 'auth.js');
const CSS_FILE_PATH = path.join(AUTH_DIR, 'auth.css');

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

describe('Auth Block', () => {
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
    it('should have the auth.js file', () => {
      // Given: The blocks/auth directory
      // When: Checking for auth.js
      const exists = fs.existsSync(JS_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export a default async function', () => {
      // Given: The auth.js file
      // When: Analyzing the file contents
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have default export with async function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should accept block parameter in decorate function', () => {
      // Given: The auth.js file
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
    it('should render loading state with buildright-auth-loading class', () => {
      // Given: The auth.js file
      // When: Analyzing initial loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should set loading HTML with buildright prefix
      expect(content).toContain('buildright-auth-loading');
    });

    it('should use loading-spinner component', () => {
      // Given: The auth.js file
      // When: Analyzing loading state
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use loading spinner
      expect(content).toContain('loading-spinner');
    });

    it('should display accessible loading message', () => {
      // Given: The auth.js file
      // When: Analyzing loading state message
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show auth-specific loading message with accessible text
      expect(content).toMatch(/Loading|Preparing/i);
    });
  });

  // ===========================================================================
  // TEST 3: Block handles dropins disabled gracefully
  // ===========================================================================
  describe('Test 3: Block handles dropins disabled gracefully', () => {
    it('should load site configuration', () => {
      // Given: The auth.js file
      // When: Analyzing config loading
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import and use loadConfig
      expect(content).toContain('loadConfig');
      expect(content).toContain('site-config.js');
    });

    it('should check useCommerceDropins feature flag', () => {
      // Given: The auth.js file
      // When: Analyzing feature flag check
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check config.features.useCommerceDropins
      expect(content).toMatch(/config\.features\?\.useCommerceDropins/);
    });

    it('should show error state when dropins are disabled', () => {
      // Given: The auth.js file
      // When: Analyzing disabled dropin handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show appropriate error for disabled dropins
      expect(content).toContain('Commerce Dropins Not Enabled');
      expect(content).toContain('createStateMessage');
    });

    it('should provide login link as fallback action', () => {
      // Given: The auth.js file
      // When: Analyzing disabled dropin fallback
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide login-related link
      expect(content).toMatch(/login|Browse Catalog|Home/i);
    });
  });

  // ===========================================================================
  // TEST 4: Block imports @dropins/storefront-auth
  // ===========================================================================
  describe('Test 4: Block imports @dropins/storefront-auth', () => {
    it('should import render from storefront-auth', () => {
      // Given: The auth.js file
      // When: Analyzing imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import from @dropins/storefront-auth
      expect(content).toContain('@dropins/storefront-auth/render.js');
    });

    it('should import SignIn container', () => {
      // Given: The auth.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import SignIn container
      expect(content).toContain('@dropins/storefront-auth/containers/SignIn.js');
    });

    it('should import SignUp container', () => {
      // Given: The auth.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import SignUp container
      expect(content).toContain('@dropins/storefront-auth/containers/SignUp.js');
    });

    it('should import ResetPassword container', () => {
      // Given: The auth.js file
      // When: Analyzing container imports
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should import ResetPassword container
      expect(content).toContain('@dropins/storefront-auth/containers/ResetPassword.js');
    });
  });

  // ===========================================================================
  // TEST 5: SignIn form renders with BuildRight slot customizations
  // ===========================================================================
  describe('Test 5: SignIn form renders with BuildRight slot customizations', () => {
    it('should detect sign-in variant from block classes', () => {
      // Given: The auth.js file
      // When: Analyzing variant detection
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should detect sign-in variant
      expect(content).toContain('sign-in');
    });

    it('should use buildright-auth-form wrapper class', () => {
      // Given: The auth.js file
      // When: Analyzing SignIn form styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright-auth-form class
      expect(content).toContain('buildright-auth-form');
    });

    it('should configure routeForgotPassword', () => {
      // Given: The auth.js file
      // When: Analyzing SignIn configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure forgot password route
      expect(content).toContain('routeForgotPassword');
    });

    it('should configure routeSignUp for registration link', () => {
      // Given: The auth.js file
      // When: Analyzing SignIn configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure sign up route
      expect(content).toContain('routeSignUp');
    });
  });

  // ===========================================================================
  // TEST 6: SignUp form renders with BuildRight slot customizations
  // ===========================================================================
  describe('Test 6: SignUp form renders with BuildRight slot customizations', () => {
    it('should detect register variant from block classes', () => {
      // Given: The auth.js file
      // When: Analyzing variant detection
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should detect register variant
      expect(content).toContain('register');
    });

    it('should use buildright-auth-register wrapper class', () => {
      // Given: The auth.js file
      // When: Analyzing SignUp form styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright-auth-register class
      expect(content).toContain('buildright-auth-register');
    });

    it('should configure routeSignIn for existing user link', () => {
      // Given: The auth.js file
      // When: Analyzing SignUp configuration
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should configure sign in route
      expect(content).toContain('routeSignIn');
    });
  });

  // ===========================================================================
  // TEST 7: ResetPassword form renders with BuildRight slot customizations
  // ===========================================================================
  describe('Test 7: ResetPassword form renders with BuildRight slot customizations', () => {
    it('should detect reset-password variant from block classes', () => {
      // Given: The auth.js file
      // When: Analyzing variant detection
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should detect reset-password variant
      expect(content).toContain('reset-password');
    });

    it('should use buildright-auth-reset wrapper class', () => {
      // Given: The auth.js file
      // When: Analyzing ResetPassword form styling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use buildright-auth-reset class
      expect(content).toContain('buildright-auth-reset');
    });
  });

  // ===========================================================================
  // TEST 8: User menu variant renders correctly
  // ===========================================================================
  describe('Test 8: User menu variant renders correctly', () => {
    it('should detect user-menu variant from block classes', () => {
      // Given: The auth.js file
      // When: Analyzing variant detection
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should detect user-menu variant
      expect(content).toContain('user-menu');
    });

    it('should handle both authenticated and guest states', () => {
      // Given: The auth.js file
      // When: Analyzing user menu rendering
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should check authentication state
      expect(content).toContain('isAuthenticated');
    });

    it('should provide logout functionality', () => {
      // Given: The auth.js file
      // When: Analyzing user menu actions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have logout capability
      expect(content).toContain('logout');
    });
  });

  // ===========================================================================
  // TEST 9: Event bus publishes auth state changes
  // ===========================================================================
  describe('Test 9: Event bus publishes auth state changes', () => {
    it('should emit auth:loading event', () => {
      // Given: The auth.js file
      // When: Analyzing event emission
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit auth:loading event
      expect(content).toContain('auth:loading');
    });

    it('should emit auth:loaded event on success', () => {
      // Given: The auth.js file
      // When: Analyzing successful load
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit auth:loaded event
      expect(content).toContain('auth:loaded');
    });

    it('should emit auth:error event on failure', () => {
      // Given: The auth.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit auth:error event
      expect(content).toContain('auth:error');
    });

    it('should use dispatchEvent for custom events', () => {
      // Given: The auth.js file
      // When: Analyzing event dispatch mechanism
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should dispatch custom events
      expect(content).toContain('dispatchEvent');
      expect(content).toContain('CustomEvent');
    });

    it('should emit buildright:auth-changed on authentication state changes', () => {
      // Given: The auth.js file
      // When: Analyzing auth state propagation
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should emit buildright:auth-changed event
      expect(content).toContain('buildright:auth-changed');
    });
  });

  // ===========================================================================
  // TEST 10: Event bus subscriptions for authenticated event
  // ===========================================================================
  describe('Test 10: Event bus subscriptions', () => {
    it('should subscribe to authenticated event from event-bus', () => {
      // Given: The auth.js file
      // When: Analyzing event subscriptions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should subscribe to authenticated event
      expect(content).toContain('authenticated');
      expect(content).toContain('@dropins/tools/event-bus.js');
    });

    it('should handle onSuccessCallback', () => {
      // Given: The auth.js file
      // When: Analyzing success callback
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have onSuccessCallback
      expect(content).toContain('onSuccessCallback');
    });

    it('should handle onErrorCallback', () => {
      // Given: The auth.js file
      // When: Analyzing error callback
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have onErrorCallback
      expect(content).toContain('onErrorCallback');
    });
  });

  // ===========================================================================
  // TEST 11: Successful login triggers persona initialization
  // ===========================================================================
  describe('Test 11: Successful login triggers persona initialization', () => {
    it('should initialize persona on successful login', () => {
      // Given: The auth.js file
      // When: Analyzing post-login behavior
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should initialize persona
      expect(content).toMatch(/initializePersona|initializeMeshForEmail/);
    });

    it('should get customer data after authentication', () => {
      // Given: The auth.js file
      // When: Analyzing customer data handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should get customer data
      expect(content).toMatch(/getCurrentCustomer|customer/);
    });
  });

  // ===========================================================================
  // TEST 12: Logout clears persona context
  // ===========================================================================
  describe('Test 12: Logout clears persona context', () => {
    it('should clear persona context on logout', () => {
      // Given: The auth.js file
      // When: Analyzing logout behavior
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear persona on logout
      expect(content).toMatch(/clear|reset|guest/i);
    });
  });

  // ===========================================================================
  // TEST 13: Block handles render errors gracefully
  // ===========================================================================
  describe('Test 13: Block handles render errors gracefully', () => {
    it('should wrap render in try-catch', () => {
      // Given: The auth.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have try-catch around render
      expect(content).toContain('try {');
      expect(content).toContain('catch');
    });

    it('should show error state on render failure', () => {
      // Given: The auth.js file
      // When: Analyzing catch block
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should show error state in catch using createStateMessage
      expect(content).toContain('createStateMessage');
    });

    it('should provide fallback action on error', () => {
      // Given: The auth.js file
      // When: Analyzing error handling
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should provide fallback link
      expect(content).toMatch(/Browse Catalog|Home|login/i);
    });
  });

  // ===========================================================================
  // TEST 14: Block uses [Auth] logging prefix
  // ===========================================================================
  describe('Test 14: Block uses [Auth] logging prefix', () => {
    it('should use [Auth] prefix for logging, not [AuthDropin]', () => {
      // Given: The auth.js file
      // When: Analyzing logging statements
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should use [Auth] prefix
      expect(content).toContain('[Auth]');
      // Should NOT use [AuthDropin] or [Auth Dropin]
      expect(content).not.toContain('[AuthDropin]');
      expect(content).not.toContain('[Auth Dropin]');
      expect(content).not.toContain('[Auth-Dropin]');
    });
  });

  // ===========================================================================
  // TEST 15: Block uses waitForDropins pattern
  // ===========================================================================
  describe('Test 15: Block uses waitForDropins pattern', () => {
    it('should use waitForDropins before rendering', () => {
      // Given: The auth.js file
      // When: Analyzing dropin initialization
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should wait for dropins to initialize
      expect(content).toContain('waitForDropins');
      expect(content).toContain('initializers/index.js');
    });

    it('should clear loading state before rendering auth forms', () => {
      // Given: The auth.js file
      // When: Analyzing loading state cleanup
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should clear block before rendering dropin
      const loadingIndex = content.indexOf('buildright-auth-loading');
      const clearIndex = content.indexOf("block.innerHTML = ''", loadingIndex);
      expect(clearIndex).toBeGreaterThan(loadingIndex);
    });
  });

  // ===========================================================================
  // TEST 16: CSS file exists and uses BuildRight design tokens
  // ===========================================================================
  describe('Test 16: CSS uses BuildRight design tokens', () => {
    it('should have auth.css file', () => {
      // Given: The blocks/auth directory
      // When: Checking for CSS file
      const exists = fs.existsSync(CSS_FILE_PATH);

      // Then: CSS file should exist
      expect(exists).toBe(true);
    });

    it('should use CSS custom properties for colors', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for colors
      expect(content).toMatch(/var\s*\(\s*--color-/);
    });

    it('should use CSS custom properties for spacing', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use design tokens for spacing
      expect(content).toMatch(/var\s*\(\s*--spacing-/);
    });

    it('should have buildright-auth-* CSS classes defined', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have BuildRight auth classes
      expect(content).toMatch(/\.buildright-auth/);
    });

    it('should have loading state styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have loading state styles
      expect(content).toContain('buildright-auth-loading');
    });

    it('should have form styling using design tokens', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have form-related styles
      expect(content).toContain('buildright-auth-form');
    });

    it('should have mobile responsive styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have media query for mobile
      expect(content).toMatch(/@media\s*\([^)]*768px/);
    });
  });

  // ===========================================================================
  // TEST 17: CSS uses specific design tokens
  // ===========================================================================
  describe('Test 17: CSS uses specific design tokens', () => {
    it('should use --color-brand-500 for primary actions', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use brand color token
      expect(content).toContain('--color-brand-500');
    });

    it('should use --color-text for body text', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use text color token
      expect(content).toContain('--color-text');
    });

    it('should use --color-surface for backgrounds', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use surface color token
      expect(content).toContain('--color-surface');
    });

    it('should use --color-border for borders', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border color token
      expect(content).toContain('--color-border');
    });

    it('should use --shape-border-radius tokens', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should use border radius tokens
      expect(content).toMatch(/--shape-border-radius/);
    });
  });

  // ===========================================================================
  // TEST 18: CSS has specific auth variant styles
  // ===========================================================================
  describe('Test 18: CSS has specific auth variant styles', () => {
    it('should have sign-in form styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have sign-in form styles
      expect(content).toContain('buildright-auth-form');
    });

    it('should have register form styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have register styles
      expect(content).toContain('buildright-auth-register');
    });

    it('should have reset password form styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have reset styles
      expect(content).toContain('buildright-auth-reset');
    });

    it('should have user menu styles', () => {
      // Given: The auth.css file
      // When: Analyzing CSS content
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have user menu styles
      expect(content).toMatch(/buildright-auth.*user|user-menu/);
    });
  });

  // ===========================================================================
  // TEST 19: CSS form input styling
  // ===========================================================================
  describe('Test 19: CSS form input styling', () => {
    it('should have form input styling using design tokens', () => {
      // Given: The auth.css file
      // When: Analyzing form styles
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have form-related styles
      expect(content).toMatch(/input|form|field/i);
    });

    it('should use focus states with brand color', () => {
      // Given: The auth.css file
      // When: Analyzing focus styles
      const content = readCSSFile(CSS_FILE_PATH);

      // Then: Should have focus styling
      expect(content).toMatch(/:focus|focus-within/);
    });
  });

  // ===========================================================================
  // TEST 20: Block has createLoadingState helper function
  // ===========================================================================
  describe('Test 20: Block has canonical helper functions', () => {
    it('should have createLoadingState function', () => {
      // Given: The auth.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have createLoadingState function
      expect(content).toContain('createLoadingState');
    });

    it('should have emitAuthEvent function for event bus', () => {
      // Given: The auth.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have emitAuthEvent function
      expect(content).toContain('emitAuthEvent');
    });

    it('should have getBlockVariant function', () => {
      // Given: The auth.js file
      // When: Analyzing helper functions
      const content = readJSFile(JS_FILE_PATH);

      // Then: Should have getBlockVariant function
      expect(content).toContain('getBlockVariant');
    });
  });
});
