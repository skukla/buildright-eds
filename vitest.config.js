/**
 * Vitest Configuration
 *
 * Configuration for static file analysis tests (block structure, CSS validation).
 * Browser-based tests use Playwright (playwright.config.js).
 *
 * @module vitest.config
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include test files in tests/ directory with .test.js extension
    include: ['tests/**/*.test.js'],
    // Exclude Playwright spec files
    exclude: ['tests/**/*.spec.js'],
    // Use node environment for file system tests
    environment: 'node',
    // Global test timeout
    testTimeout: 10000,
    // Reporter
    reporters: ['verbose'],
  },
});
