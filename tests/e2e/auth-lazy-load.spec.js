// @ts-check
/**
 * Auth Lazy Load E2E Tests - Step 2
 *
 * Verifies that the conditional auth loading from Step 1 works correctly:
 * - Guest users: No auth dropin network requests on catalog page
 * - Guest users: Header shows login/signup links (not user name)
 * - Authenticated users: Auth dropin loads when cookie present
 *
 * @module tests/e2e/auth-lazy-load.spec
 */

import { test, expect } from '@playwright/test';

// Constants
const CATALOG_URL = '/catalog';
const CATALOG_LOADED_SELECTOR = '.dropin-search-results-container';
const USER_MENU_SELECTOR = '#user-menu-container .user-menu';
const USER_MENU_TOGGLE_SELECTOR = '#user-menu-toggle';
const PAGE_LOAD_TIMEOUT = 30000;

/**
 * Helper: Navigate to catalog and wait for dropins to initialize
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function navigateToCatalogAndWaitForDropins(page) {
  await page.goto(CATALOG_URL);
  await page.waitForSelector(CATALOG_LOADED_SELECTOR, { timeout: PAGE_LOAD_TIMEOUT });
}

/**
 * Helper: Wait for user menu to be decorated and open it
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function openUserMenu(page) {
  await page.waitForSelector(USER_MENU_SELECTOR, { state: 'attached', timeout: 10000 });
  await page.locator(USER_MENU_TOGGLE_SELECTOR).click();
}

/**
 * Helper: Set auth cookie for authenticated user simulation
 * @param {import('@playwright/test').BrowserContext} context - Playwright context
 */
async function setAuthCookie(context) {
  await context.addCookies([
    {
      name: 'auth_dropin_user_token',
      value: 'test-token-12345',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

test.describe('Auth Lazy Load - Guest User Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure we start as guest (clear any auth cookies)
    await context.clearCookies();
  });

  test('should NOT load auth dropin modules on catalog page for guest users', async ({ page }) => {
    // Given: Track all network requests for auth dropin modules
    const authModuleRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('storefront-auth')) {
        authModuleRequests.push(request.url());
      }
    });

    // When: Navigate to catalog page as guest
    await navigateToCatalogAndWaitForDropins(page);
    await page.waitForTimeout(1000); // Extra time for async auth loading

    // Then: No auth dropin modules should have been requested
    expect(authModuleRequests).toHaveLength(0);
  });

  test('should show login link in header for guest users', async ({ page }) => {
    // Given: Guest user (cookies cleared in beforeEach)

    // When: Navigate to catalog and open user menu
    await navigateToCatalogAndWaitForDropins(page);
    await openUserMenu(page);

    // Then: Should see login link
    const loginLink = page.locator('.user-menu-logged-out a[href*="login"]');
    await expect(loginLink).toBeVisible({ timeout: 5000 });
  });

  test('should show signup/create account link in header for guest users', async ({ page }) => {
    // Given: Guest user (cookies cleared in beforeEach)

    // When: Navigate to catalog and open user menu
    await navigateToCatalogAndWaitForDropins(page);
    await openUserMenu(page);

    // Then: Should see signup/create account link
    const signupLink = page.locator('.user-menu-logged-out a[href*="signup"]');
    await expect(signupLink).toBeVisible({ timeout: 5000 });
  });

  test('should NOT show user name in header for guest users', async ({ page }) => {
    // Given: Guest user (cookies cleared in beforeEach)

    // When: Navigate to catalog and open user menu
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Should NOT show authenticated user elements
    const loggedInMenu = page.locator('.user-menu-logged-in');
    await expect(loggedInMenu).not.toBeVisible();

    // Open menu and verify logged-out state
    await openUserMenu(page);
    const loggedOutMenu = page.locator('.user-menu-logged-out');
    await expect(loggedOutMenu).toBeVisible({ timeout: 5000 });
  });

  test('should load cart dropin for guest users (cart still works)', async ({ page }) => {
    // Given: Track network requests for cart dropin
    const cartModuleRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('storefront-cart')) {
        cartModuleRequests.push(request.url());
      }
    });

    // When: Navigate to catalog page as guest
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Cart dropin should have loaded (not conditional)
    expect(cartModuleRequests.length).toBeGreaterThan(0);
  });

  test('should load search dropin for guest users (search still works)', async ({ page }) => {
    // Given: Track network requests for search/product-discovery dropin
    const searchModuleRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('storefront-product-discovery')) {
        searchModuleRequests.push(request.url());
      }
    });

    // When: Navigate to catalog page as guest
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Search dropin should have loaded (not conditional)
    expect(searchModuleRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Auth Lazy Load - Console Logging Verification', () => {
  test('should log guest user detection message when no auth cookie', async ({ page, context }) => {
    // Given: Clear cookies to ensure guest state
    await context.clearCookies();

    // Track console messages
    const consoleMessages = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    // When: Navigate to catalog page
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Should see console message about guest user
    const guestLogMessage = consoleMessages.find((msg) =>
      msg.includes('[Dropins]') && msg.toLowerCase().includes('guest')
    );
    expect(guestLogMessage).toBeDefined();
  });
});

test.describe('Auth Lazy Load - Authenticated User Flow', () => {
  test('should load auth dropin when auth cookie is present', async ({ page, context }) => {
    // Given: Set auth cookie to simulate authenticated user
    await setAuthCookie(context);

    // Track network requests for auth dropin
    const authModuleRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('storefront-auth')) {
        authModuleRequests.push(request.url());
      }
    });

    // When: Navigate to catalog page with auth cookie
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Auth dropin modules should have been requested
    expect(authModuleRequests.length).toBeGreaterThan(0);
  });

  test('should log authenticated user detection message when auth cookie present', async ({ page, context }) => {
    // Given: Set auth cookie
    await setAuthCookie(context);

    // Track console messages
    const consoleMessages = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    // When: Navigate to catalog page
    await navigateToCatalogAndWaitForDropins(page);

    // Then: Should see console message about authenticated user
    const authLogMessage = consoleMessages.find((msg) =>
      msg.includes('[Dropins]') && msg.includes('authenticated')
    );
    expect(authLogMessage).toBeDefined();
  });
});
