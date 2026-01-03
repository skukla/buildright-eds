/**
 * Step 00 Verification Tests: Deprecated Blocks Migration
 *
 * Tests that the dropin blocks were successfully moved to _deprecated/
 * and that file integrity is preserved.
 *
 * @module tests/step-00-deprecated-blocks.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BLOCKS_DIR = path.resolve(import.meta.dirname, '../blocks');
const DEPRECATED_DIR = path.join(BLOCKS_DIR, '_deprecated');

/**
 * Expected deprecated block mappings
 * source name -> deprecated name
 */
const DEPRECATED_BLOCKS = {
  'cart-dropin': 'cart-dropin-minimal',
  'checkout-dropin': 'checkout-dropin-minimal',
  'auth-dropin': 'auth-dropin-v1',
  'order-confirmation-dropin': 'order-confirmation-dropin-minimal',
};

/**
 * Expected file counts per block
 */
const EXPECTED_FILES = {
  'cart-dropin-minimal': ['cart-dropin.js', 'cart-dropin.css'],
  'checkout-dropin-minimal': ['checkout-dropin.js', 'checkout-dropin.css'],
  'auth-dropin-v1': ['auth-dropin.js', 'auth-dropin.css'],
  'order-confirmation-dropin-minimal': ['order-confirmation-dropin.js', 'order-confirmation-dropin.css'],
};

/**
 * Calculate MD5 checksum of a file
 */
function getFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

describe('Step 00: Deprecated Blocks Migration', () => {
  describe('Given: Blocks moved to _deprecated/', () => {

    it('should have created the _deprecated directory', () => {
      // When: Checking for _deprecated directory
      const exists = fs.existsSync(DEPRECATED_DIR);

      // Then: Directory should exist
      expect(exists).toBe(true);
    });

    it('should have all 4 deprecated block directories', () => {
      // When: Listing contents of _deprecated
      const deprecatedContents = fs.readdirSync(DEPRECATED_DIR);

      // Then: All expected directories should exist
      const expectedDirs = Object.values(DEPRECATED_BLOCKS);
      for (const dir of expectedDirs) {
        expect(deprecatedContents).toContain(dir);
      }
    });

    it('should have cleared original block locations', () => {
      // When: Checking original locations
      const originalNames = Object.keys(DEPRECATED_BLOCKS);

      // Then: Original directories should not exist at blocks/ root
      for (const name of originalNames) {
        const originalPath = path.join(BLOCKS_DIR, name);
        expect(fs.existsSync(originalPath)).toBe(false);
      }
    });
  });

  describe('When: Verifying file integrity', () => {

    it('should preserve all JS files in deprecated locations', () => {
      // Given: Expected JS files for each deprecated block
      for (const [deprecatedName, files] of Object.entries(EXPECTED_FILES)) {
        const jsFile = files.find(f => f.endsWith('.js'));
        const jsPath = path.join(DEPRECATED_DIR, deprecatedName, jsFile);

        // When: Checking if JS file exists
        // Then: JS file should exist and be readable
        expect(fs.existsSync(jsPath)).toBe(true);

        const content = fs.readFileSync(jsPath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should preserve all CSS files in deprecated locations', () => {
      // Given: Expected CSS files for each deprecated block
      for (const [deprecatedName, files] of Object.entries(EXPECTED_FILES)) {
        const cssFile = files.find(f => f.endsWith('.css'));
        const cssPath = path.join(DEPRECATED_DIR, deprecatedName, cssFile);

        // When: Checking if CSS file exists
        // Then: CSS file should exist and be readable
        expect(fs.existsSync(cssPath)).toBe(true);

        const content = fs.readFileSync(cssPath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should have correct file count per deprecated block (2 files each)', () => {
      // Given: Expected 2 files per block (js + css)
      for (const deprecatedName of Object.values(DEPRECATED_BLOCKS)) {
        const blockDir = path.join(DEPRECATED_DIR, deprecatedName);

        // When: Counting files in deprecated block
        const files = fs.readdirSync(blockDir);

        // Then: Should have exactly 2 files
        expect(files.length).toBe(2);
      }
    });
  });

  describe('Then: Deprecated blocks remain functional', () => {

    it('should have valid JavaScript module exports in cart-dropin-minimal', () => {
      const jsPath = path.join(DEPRECATED_DIR, 'cart-dropin-minimal', 'cart-dropin.js');
      const content = fs.readFileSync(jsPath, 'utf-8');

      // Should have default export function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should have valid JavaScript module exports in checkout-dropin-minimal', () => {
      const jsPath = path.join(DEPRECATED_DIR, 'checkout-dropin-minimal', 'checkout-dropin.js');
      const content = fs.readFileSync(jsPath, 'utf-8');

      // Should have default export function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should have valid JavaScript module exports in auth-dropin-v1', () => {
      const jsPath = path.join(DEPRECATED_DIR, 'auth-dropin-v1', 'auth-dropin.js');
      const content = fs.readFileSync(jsPath, 'utf-8');

      // Should have default export function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should have valid JavaScript module exports in order-confirmation-dropin-minimal', () => {
      const jsPath = path.join(DEPRECATED_DIR, 'order-confirmation-dropin-minimal', 'order-confirmation-dropin.js');
      const content = fs.readFileSync(jsPath, 'utf-8');

      // Should have default export function
      expect(content).toContain('export default');
      expect(content).toContain('async function decorate');
    });

    it('should have valid CSS selectors in deprecated blocks', () => {
      const cssChecks = [
        { dir: 'cart-dropin-minimal', file: 'cart-dropin.css', selector: '.cart-dropin' },
        { dir: 'checkout-dropin-minimal', file: 'checkout-dropin.css', selector: '.checkout-dropin' },
        { dir: 'auth-dropin-v1', file: 'auth-dropin.css', selector: '.auth-dropin' },
        { dir: 'order-confirmation-dropin-minimal', file: 'order-confirmation-dropin.css', selector: '.order-confirmation-dropin' },
      ];

      for (const check of cssChecks) {
        const cssPath = path.join(DEPRECATED_DIR, check.dir, check.file);
        const content = fs.readFileSync(cssPath, 'utf-8');

        // Should have the expected block selector
        expect(content).toContain(check.selector);
      }
    });
  });
});
