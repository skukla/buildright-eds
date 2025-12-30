// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Header Search Tests
 *
 * Tests the Adobe dropin-based header search functionality:
 * - Live search suggestions with product details
 * - Navigation to catalog page with search parameter
 * - Mobile toggle behavior
 */

test.describe('Header Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog page where dropins are initialized
    await page.goto('/catalog');

    // Wait for dropins to initialize
    await page.waitForSelector('.dropin-search-results-container', { timeout: 10000 });
  });

  test('shows live suggestions when typing in header search', async ({ page }) => {
    // Get the header search input
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });

    // Type a search query
    await headerSearch.fill('lumber');

    // Wait for suggestions to appear (debounce is 300ms + API call)
    await page.waitForSelector('.buildright-search-suggestion-item', { timeout: 5000 });

    // Verify suggestions are displayed
    const suggestions = page.locator('.buildright-search-suggestion-item');
    await expect(suggestions).toHaveCount(4);
  });

  test('suggestions show product name and SKU', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');

    // Wait for suggestions
    await page.waitForSelector('.buildright-search-suggestion-item', { timeout: 5000 });

    // Check first suggestion has required elements
    const firstSuggestion = page.locator('.buildright-search-suggestion-item').first();

    // Product name (required)
    await expect(firstSuggestion.locator('.buildright-search-suggestion-name')).toBeVisible();

    // SKU (required)
    await expect(firstSuggestion.locator('.buildright-search-suggestion-sku')).toBeVisible();

    // Price is optional - depends on mesh response
    // The catalogService.searchProducts may not return prices for all products
  });

  test('View All link shows correct count and navigates to catalog', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');

    // Wait for View All link to appear
    const viewAllLink = page.locator('#search-suggestions-view-all');
    await expect(viewAllLink).toBeVisible({ timeout: 5000 });

    // Verify link text includes count
    await expect(viewAllLink).toContainText(/View all \d+ results/);

    // Click the link
    await viewAllLink.click();

    // Verify navigation to catalog with search parameter
    await expect(page).toHaveURL(/catalog\?search=lumber/);
  });

  test('pressing Enter in search input navigates to catalog', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });

    // Type and press Enter
    await headerSearch.fill('lumber');
    await headerSearch.press('Enter');

    // Verify navigation
    await expect(page).toHaveURL(/catalog\?search=lumber/);
  });

  test('clicking search button navigates to catalog', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');

    // Click search button
    const searchButton = page.locator('.search-button');
    await searchButton.click();

    // Verify navigation
    await expect(page).toHaveURL(/catalog\?search=lumber/);
  });

  test('clicking outside closes suggestions dropdown', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');

    // Wait for suggestions
    await page.waitForSelector('.buildright-search-suggestion-item', { timeout: 5000 });

    // Verify dropdown is visible
    const dropdown = page.locator('#search-suggestions');
    await expect(dropdown).toBeVisible();

    // Blur the input to trigger hide (simulates clicking outside)
    await headerSearch.blur();

    // Wait for the dropdown to be hidden (either via hidden attribute or not visible)
    await expect(dropdown).toBeHidden({ timeout: 5000 });
  });

  test('empty query does not show suggestions', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });

    // Type less than 3 characters
    await headerSearch.fill('lu');

    // Wait a bit for any potential suggestions
    await page.waitForTimeout(500);

    // Verify no suggestions
    const dropdown = page.locator('#search-suggestions');
    await expect(dropdown).toHaveAttribute('hidden');
  });

  test('clicking suggestion navigates to product page', async ({ page }) => {
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');

    // Wait for suggestions
    await page.waitForSelector('.buildright-search-suggestion-item', { timeout: 5000 });

    // Click first suggestion
    const firstSuggestion = page.locator('.buildright-search-suggestion-item').first();
    await firstSuggestion.click();

    // Verify navigation to product page
    await expect(page).toHaveURL(/product\?sku=/);
  });
});

test.describe('Header Search - Catalog Integration', () => {
  test('header search navigates to catalog and syncs search term', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for initial load
    await page.waitForSelector('.dropin-search-results-container', { timeout: 10000 });

    // Perform search via header
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('lumber');
    await headerSearch.press('Enter');

    // Wait for navigation to complete with search parameter
    await page.waitForURL(/catalog\?search=lumber/, { timeout: 10000 });

    // Wait for search results container to load
    await page.waitForSelector('.dropin-search-results-container', { timeout: 10000 });

    // Verify the catalog search input is synced with the URL search parameter
    const catalogSearchInput = page.locator('#catalog-search-input');
    await expect(catalogSearchInput).toHaveValue('lumber', { timeout: 5000 });

    // Verify clear button is visible (search term is active)
    const clearBtn = page.locator('#search-clear');
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe('In-Category Catalog Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('.dropin-search-results-container', { timeout: 10000 });
  });

  test('typing in catalog search filters the product grid', async ({ page }) => {
    // Verify initial product count (all products)
    await expect(page.locator('.product-count')).toContainText(/\d+ Products/);

    // Type in the in-category search bar
    const catalogSearch = page.locator('#catalog-search-input');
    await catalogSearch.fill('lumber');

    // Wait for search to complete (debounce + API call)
    await page.waitForTimeout(500);
    await expect(page.locator('text=8 Products')).toBeVisible({ timeout: 10000 });

    // Verify URL updated
    await expect(page).toHaveURL(/catalog\?search=lumber/);
  });

  test('header search suggestions do NOT affect product grid', async ({ page }) => {
    // Get initial product count
    const initialCount = await page.locator('.product-count').textContent();
    expect(initialCount).toContain('161 Products');

    // Type in header search (just suggestions, no submit)
    const headerSearch = page.getByRole('searchbox', { name: 'Search products, SKUs, or keywords...' });
    await headerSearch.fill('stud');

    // Wait for suggestions to appear
    await page.waitForSelector('.buildright-search-suggestion-item', { timeout: 5000 });

    // Verify product count is UNCHANGED
    const afterCount = await page.locator('.product-count').textContent();
    expect(afterCount).toBe(initialCount);
  });

  test('clear button resets search', async ({ page }) => {
    // Perform a search first
    const catalogSearch = page.locator('#catalog-search-input');
    await catalogSearch.fill('lumber');
    await page.waitForTimeout(500);
    await expect(page.locator('text=8 Products')).toBeVisible({ timeout: 10000 });

    // Click clear button
    const clearBtn = page.locator('#search-clear');
    await clearBtn.click();

    // Verify search is cleared and products reset
    await expect(catalogSearch).toHaveValue('');
    await expect(page.locator('.product-count')).toContainText(/\d+ Products/, { timeout: 10000 });
  });
});
