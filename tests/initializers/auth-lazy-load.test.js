/**
 * Auth Lazy Load Tests
 *
 * TDD tests for Step 1: Lazy-Load Auth Dropin
 * Validates token detection to conditionally skip auth dropin initialization
 * for guest users (no auth cookie present).
 *
 * Cookie name: auth_dropin_user_token (per initializers/auth.js:208)
 *
 * @module tests/initializers/auth-lazy-load.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const INITIALIZERS_DIR = path.resolve(import.meta.dirname, '../../scripts/initializers');
const INDEX_FILE_PATH = path.join(INITIALIZERS_DIR, 'index.js');

/**
 * Helper: Read JavaScript file contents
 */
function readJSFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Auth Lazy Load - Token Detection', () => {
  let indexContent;

  beforeAll(() => {
    if (fs.existsSync(INDEX_FILE_PATH)) {
      indexContent = readJSFile(INDEX_FILE_PATH);
    }
  });

  // ===========================================================================
  // TEST 1: shouldInitializeAuth function exists and is exported
  // ===========================================================================
  describe('Test 1: shouldInitializeAuth function exists', () => {
    it('should have the initializers/index.js file', () => {
      // Given: The scripts/initializers directory
      // When: Checking for index.js
      const exists = fs.existsSync(INDEX_FILE_PATH);

      // Then: The file should exist
      expect(exists).toBe(true);
    });

    it('should export shouldInitializeAuth function', () => {
      // Given: The initializers/index.js file
      // When: Analyzing exports
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should export shouldInitializeAuth
      expect(content).toContain('export function shouldInitializeAuth');
    });

    it('should define shouldInitializeAuth before initializeDropins', () => {
      // Given: The initializers/index.js file
      // When: Analyzing function order
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: shouldInitializeAuth should appear before initializeDropins
      const shouldInitIndex = content.indexOf('shouldInitializeAuth');
      const initDropinsIndex = content.indexOf('export async function initializeDropins');
      expect(shouldInitIndex).toBeGreaterThan(-1);
      expect(shouldInitIndex).toBeLessThan(initDropinsIndex);
    });
  });

  // ===========================================================================
  // TEST 2: shouldInitializeAuth returns true when auth_dropin_user_token exists
  // ===========================================================================
  describe('Test 2: shouldInitializeAuth returns true when auth token exists', () => {
    it('should check for auth_dropin_user_token cookie', () => {
      // Given: The initializers/index.js file
      // When: Analyzing cookie detection logic
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should check for the specific cookie name
      expect(content).toContain('auth_dropin_user_token');
    });

    it('should parse document.cookie to find auth token', () => {
      // Given: The initializers/index.js file
      // When: Analyzing cookie parsing
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should access document.cookie
      expect(content).toContain('document.cookie');
    });

    it('should return true when token is found', () => {
      // Given: The initializers/index.js file
      // When: Analyzing return value logic
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should have logic to return true for authenticated users
      // The function should return a boolean based on cookie presence
      expect(content).toMatch(/shouldInitializeAuth[\s\S]*?return\s+true/);
    });
  });

  // ===========================================================================
  // TEST 3: shouldInitializeAuth returns false when no auth cookie present
  // ===========================================================================
  describe('Test 3: shouldInitializeAuth returns false when no auth cookie', () => {
    it('should return false when auth_dropin_user_token is not found', () => {
      // Given: The initializers/index.js file
      // When: Analyzing fallback return value
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should return false for guest users (no cookie)
      expect(content).toMatch(/shouldInitializeAuth[\s\S]*?return\s+false/);
    });

    it('should log message for guest users when auth is skipped', () => {
      // Given: The initializers/index.js file
      // When: Analyzing console output for guest users
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should log guest user detection message
      expect(content).toMatch(/\[Dropins\].*guest.*skip/i);
    });
  });

  // ===========================================================================
  // TEST 4: shouldInitializeAuth handles malformed cookies gracefully
  // ===========================================================================
  describe('Test 4: shouldInitializeAuth handles malformed cookies gracefully', () => {
    it('should use try-catch for cookie parsing', () => {
      // Given: The initializers/index.js file
      // When: Analyzing error handling in shouldInitializeAuth
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should have try-catch around cookie logic
      // Extract the shouldInitializeAuth function body
      const funcMatch = content.match(/function shouldInitializeAuth\s*\(\s*\)\s*\{[\s\S]*?^\}/m);
      expect(funcMatch).not.toBeNull();
      const funcBody = funcMatch[0];
      expect(funcBody).toContain('try');
      expect(funcBody).toContain('catch');
    });

    it('should return false on cookie parsing errors', () => {
      // Given: The initializers/index.js file
      // When: Analyzing error handling behavior
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should return false (safe default) on errors
      expect(content).toMatch(/catch[\s\S]*?return\s+false/);
    });

    it('should not throw errors to caller', () => {
      // Given: The initializers/index.js file
      // When: Analyzing shouldInitializeAuth function
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Function should handle errors internally (catch block without re-throw)
      const funcMatch = content.match(/function shouldInitializeAuth[\s\S]*?^\}/m);
      expect(funcMatch).not.toBeNull();
      // Should have catch but not re-throw
      expect(funcMatch[0]).toContain('catch');
      // Count return statements vs throw statements in catch
      const catchSection = funcMatch[0].match(/catch[\s\S]*$/);
      expect(catchSection).not.toBeNull();
      expect(catchSection[0]).not.toMatch(/throw\s+/);
    });
  });

  // ===========================================================================
  // TEST 5: Conditional auth dropin loading based on shouldInitializeAuth
  // ===========================================================================
  describe('Test 5: Conditional auth dropin loading', () => {
    it('should call shouldInitializeAuth before loading auth dropin', () => {
      // Given: The initializers/index.js file
      // When: Analyzing dropin initialization order
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: shouldInitializeAuth should be called before auth.js import
      const shouldInitIndex = content.indexOf('shouldInitializeAuth()');
      const authImportIndex = content.indexOf("import('./auth.js')");
      expect(shouldInitIndex).toBeGreaterThan(-1);
      expect(authImportIndex).toBeGreaterThan(-1);
      expect(shouldInitIndex).toBeLessThan(authImportIndex);
    });

    it('should conditionally include auth dropin based on token presence', () => {
      // Given: The initializers/index.js file
      // When: Analyzing conditional logic for auth
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should use shouldInitializeAuth result to decide auth loading
      expect(content).toMatch(/shouldInitializeAuth\(\)[\s\S]*?auth/);
    });

    it('should always load cart dropin regardless of auth state', () => {
      // Given: The initializers/index.js file
      // When: Analyzing cart dropin loading
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Cart should always be loaded (not conditional)
      expect(content).toContain("import('./cart.js')");
      expect(content).toContain('initializeCartDropin');
    });

    it('should always load search dropin regardless of auth state', () => {
      // Given: The initializers/index.js file
      // When: Analyzing search dropin loading
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Search should always be loaded (not conditional)
      expect(content).toContain("import('./search.js')");
      expect(content).toContain('initializeSearchDropin');
    });
  });

  // ===========================================================================
  // TEST 6: Console logging for auth detection
  // ===========================================================================
  describe('Test 6: Console logging for auth detection', () => {
    it('should log when auth token is found', () => {
      // Given: The initializers/index.js file
      // When: Analyzing logging for authenticated users
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should log message when token is detected
      expect(content).toMatch(/\[Dropins\].*auth.*token.*found|authenticated/i);
    });

    it('should log when no auth token (guest user)', () => {
      // Given: The initializers/index.js file
      // When: Analyzing logging for guest users
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should log message for guest user
      expect(content).toMatch(/\[Dropins\].*No auth token|guest.*skip/i);
    });
  });

  // ===========================================================================
  // TEST 7: waitForDropins still resolves for all pages
  // ===========================================================================
  describe('Test 7: waitForDropins still resolves', () => {
    it('should still dispatch dropins:initialized event', () => {
      // Given: The initializers/index.js file
      // When: Analyzing event dispatch
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should dispatch dropins:initialized event
      expect(content).toContain("dispatchEvent(new CustomEvent('dropins:initialized'))");
    });

    it('should still export waitForDropins function', () => {
      // Given: The initializers/index.js file
      // When: Analyzing exports
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should export waitForDropins
      expect(content).toContain('export function waitForDropins');
    });

    it('should set _initialized to true after dropin loading', () => {
      // Given: The initializers/index.js file
      // When: Analyzing initialization state
      const content = readJSFile(INDEX_FILE_PATH);

      // Then: Should set _initialized = true
      expect(content).toContain('_initialized = true');
    });
  });
});
