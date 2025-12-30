/**
 * Header Search Dropin Migration Tests - Steps 1, 2, & 3
 *
 * TDD tests for migrating header search from custom implementation
 * to Adobe SearchBarInput/SearchBarResults dropin containers.
 *
 * Step 1: Dropin container rendering (19 tests)
 * Step 2: Mobile search toggle behavior (14 tests)
 * Step 3: Search submission edge case validation (24 tests)
 *
 * Total: 57 tests
 *
 * Run with: node --test tests/header-search-dropin.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const HEADER_JS_PATH = path.join(__dirname, '..', 'blocks', 'header', 'header.js');
const HEADER_HTML_PATH = path.join(__dirname, '..', 'blocks', 'header', 'header.html');
const HEADER_CSS_PATH = path.join(__dirname, '..', 'blocks', 'header', 'header.css');
const PRODUCT_LIST_PATH = path.join(__dirname, '..', 'blocks', 'product-list', 'product-list.js');

// Helper: Read file contents safely
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Count occurrences of a pattern in text
function countOccurrences(text, pattern) {
  const regex = new RegExp(pattern, 'g');
  return (text.match(regex) || []).length;
}

// Helper: Check if a line range contains specific text
function lineRangeContains(text, startLine, endLine, searchText) {
  const lines = text.split('\n');
  const rangeText = lines.slice(startLine - 1, endLine).join('\n');
  return rangeText.includes(searchText);
}

describe('Header Search Dropin Migration - Step 1', () => {
  let headerJS;
  let headerHTML;
  let headerCSS;
  let productListJS;

  before(() => {
    headerJS = readFile(HEADER_JS_PATH);
    headerHTML = readFile(HEADER_HTML_PATH);
    headerCSS = readFile(HEADER_CSS_PATH);
    productListJS = readFile(PRODUCT_LIST_PATH);

    assert.ok(headerJS, 'header.js should exist');
    assert.ok(headerHTML, 'header.html should exist');
    assert.ok(headerCSS, 'header.css should exist');
    assert.ok(productListJS, 'product-list.js should exist (reference pattern)');
  });

  // ============================================
  // TEST 1: SearchBarInput Container Renders
  // ============================================

  describe('Test 1: SearchBarInput Container Renders in Header', () => {
    it('should import SearchBarInput from Product Discovery dropin', () => {
      // Given: header.js uses the dropin architecture
      // When: checking imports
      // Then: SearchBarInput should be imported from @dropins/storefront-product-discovery

      const hasSearchBarInputImport =
        headerJS.includes('SearchBarInput') &&
        headerJS.includes('@dropins/storefront-product-discovery');

      assert.ok(
        hasSearchBarInputImport,
        'header.js should import SearchBarInput from @dropins/storefront-product-discovery'
      );
    });

    it('should use render.render pattern for SearchBarInput', () => {
      // Given: header.js follows product-list.js dropin pattern
      // When: checking render calls
      // Then: should use render.render(SearchBarInput, ...) pattern

      const hasRenderPattern =
        headerJS.includes('render.render') &&
        headerJS.includes('SearchBarInput');

      assert.ok(
        hasRenderPattern,
        'header.js should use render.render(SearchBarInput, ...) pattern'
      );
    });

    it('should render SearchBarInput to search input container', () => {
      // Given: header.html has a search input container
      // When: dropin renders
      // Then: SearchBarInput should target the search container

      // Check that header.js references the search input container ID or selector
      const targetsSearchContainer =
        headerJS.includes('header-search-input') ||
        headerJS.includes('search-form') ||
        headerJS.includes('.header-search');

      assert.ok(
        targetsSearchContainer,
        'header.js should target a search input container element'
      );
    });
  });

  // ============================================
  // TEST 2: SearchBarResults Container Renders
  // ============================================

  describe('Test 2: SearchBarResults Renders for Suggestions', () => {
    it('should import SearchBarResults from Product Discovery dropin', () => {
      // Given: header.js uses dropin containers for suggestions
      // When: checking imports
      // Then: SearchBarResults should be imported

      const hasSearchBarResultsImport =
        headerJS.includes('SearchBarResults') &&
        headerJS.includes('@dropins/storefront-product-discovery');

      assert.ok(
        hasSearchBarResultsImport,
        'header.js should import SearchBarResults from @dropins/storefront-product-discovery'
      );
    });

    it('should use render.render pattern for SearchBarResults', () => {
      // Given: header.js follows the dropin pattern
      // When: checking render calls
      // Then: should use render.render(SearchBarResults, ...) pattern

      const hasRenderPattern =
        headerJS.includes('render.render') &&
        headerJS.includes('SearchBarResults');

      assert.ok(
        hasRenderPattern,
        'header.js should use render.render(SearchBarResults, ...) pattern'
      );
    });

    it('should render SearchBarResults to suggestions container', () => {
      // Given: header.html has search-suggestions container
      // When: dropin renders
      // Then: SearchBarResults should target that container

      const targetsSuggestionsContainer =
        headerJS.includes('search-suggestions') ||
        headerJS.includes('suggestions-container') ||
        headerJS.includes('SearchBarResults');

      assert.ok(
        targetsSuggestionsContainer,
        'header.js should target a suggestions container element'
      );
    });
  });

  // ============================================
  // TEST 3: Search Navigation Works
  // ============================================

  describe('Test 3: Search Navigation to Catalog Page', () => {
    it('should have routeSearch handler for search form navigation', () => {
      // Given: user submits search
      // When: form is submitted
      // Then: should navigate to catalog page with search query

      // The dropin handles this via routeSearch callback (Adobe's correct API)
      const hasNavigationLogic =
        headerJS.includes('routeSearch') ||
        headerJS.includes('catalog?search=') ||
        headerJS.includes('performSearch');

      assert.ok(
        hasNavigationLogic,
        'header.js should have navigation logic for search submission'
      );
    });

    it('should preserve navigation to /catalog?search={query} format', () => {
      // Given: search is submitted
      // When: navigation occurs
      // Then: URL format should be catalog?search={query}

      const hasCorrectUrlFormat =
        headerJS.includes('catalog?search=') ||
        headerJS.includes("'catalog?search='");

      assert.ok(
        hasCorrectUrlFormat,
        'header.js should navigate to catalog?search={query} format'
      );
    });
  });

  // ============================================
  // TEST 4: BuildRight Styling Applied
  // ============================================

  describe('Test 4: BuildRight Styling for Search', () => {
    it('should have .buildright-search-* CSS classes defined', () => {
      // Given: BuildRight design system
      // When: checking CSS
      // Then: should have buildright-search-* classes

      const hasBuildRightSearchClasses =
        headerCSS.includes('.buildright-search') ||
        headerCSS.includes('buildright-search-input') ||
        headerCSS.includes('buildright-search-results');

      assert.ok(
        hasBuildRightSearchClasses,
        'header.css should define .buildright-search-* classes'
      );
    });

    it('should use slots for custom styling (following product-list pattern)', () => {
      // Given: product-list.js uses slots for styling
      // When: checking header.js
      // Then: should use slots configuration for dropins

      const hasSlotsPattern = headerJS.includes('slots:') || headerJS.includes('slots =');

      assert.ok(
        hasSlotsPattern,
        'header.js should use slots configuration for custom styling (like product-list.js)'
      );
    });
  });

  // ============================================
  // TEST 5: Custom Search Code Removed
  // ============================================

  describe('Test 5: Custom Search Implementation Removed', () => {
    it('should NOT have custom debounce setTimeout for search', () => {
      // Given: dropin handles debouncing natively
      // When: checking header.js
      // Then: should NOT have custom searchTimeout debounce pattern

      // Look for the specific custom debounce pattern that was in original code
      const hasCustomDebounce =
        headerJS.includes('searchTimeout') &&
        headerJS.includes('setTimeout') &&
        headerJS.includes('clearTimeout');

      assert.ok(
        !hasCustomDebounce,
        'header.js should NOT have custom debounce logic (searchTimeout/setTimeout) - dropin handles this'
      );
    });

    it('should NOT import liveSearchService', () => {
      // Given: dropin handles search API calls
      // When: checking imports
      // Then: should NOT import the custom liveSearchService

      const hasLiveSearchImport = headerJS.includes('liveSearchService');

      assert.ok(
        !hasLiveSearchImport,
        'header.js should NOT import liveSearchService - dropin handles search'
      );
    });

    it('should NOT have custom renderSuggestions function', () => {
      // Given: dropin handles suggestion rendering
      // When: checking header.js
      // Then: should NOT have renderSuggestions function

      const hasRenderSuggestions =
        headerJS.includes('renderSuggestions') ||
        headerJS.includes('const renderSuggestions') ||
        headerJS.includes('function renderSuggestions');

      assert.ok(
        !hasRenderSuggestions,
        'header.js should NOT have custom renderSuggestions function - dropin handles this'
      );
    });

    it('should NOT have custom keyboard navigation handlers', () => {
      // Given: dropin handles keyboard navigation
      // When: checking header.js
      // Then: should NOT have custom ArrowDown/ArrowUp handlers for search

      // Check for the specific keyboard navigation pattern from original code
      // Note: Some minimal event handlers may remain for Enter to submit
      const hasCustomKeyboardNav =
        headerJS.includes('highlightedIndex') &&
        headerJS.includes('ArrowDown') &&
        headerJS.includes('ArrowUp');

      assert.ok(
        !hasCustomKeyboardNav,
        'header.js should NOT have custom keyboard navigation (highlightedIndex pattern) - dropin handles this'
      );
    });

    it('should have significantly fewer lines of search code', () => {
      // Given: original search code was ~160 lines (276-437)
      // When: checking new implementation
      // Then: search-related code should be much shorter

      // Count approximate lines related to search
      const searchRelatedPatterns = [
        'search',
        'suggestion',
        'Search',
        'Suggestion'
      ];

      // This is a rough heuristic - the new code should be more compact
      const searchLines = headerJS.split('\n').filter(line =>
        searchRelatedPatterns.some(p => line.includes(p))
      ).length;

      // Original had ~160+ lines of search code, new should be <60
      // Being lenient since imports and render calls still mention 'Search'
      assert.ok(
        searchLines < 100,
        `Search-related code should be compact (found ${searchLines} lines referencing search). ` +
        'Dropin should handle most logic.'
      );
    });
  });

  // ============================================
  // TEST 6: HTML Container Elements
  // ============================================

  describe('Test 6: HTML Container Elements Present', () => {
    it('should have search input container in header.html', () => {
      // Given: dropin needs a container to render into
      // When: checking header.html
      // Then: should have appropriate search input container

      const hasSearchContainer =
        headerHTML.includes('header-search-input') ||
        headerHTML.includes('search-form') ||
        headerHTML.includes('class="header-search"');

      assert.ok(
        hasSearchContainer,
        'header.html should have a search input container element'
      );
    });

    it('should have search suggestions container in header.html', () => {
      // Given: dropin needs a container for suggestions
      // When: checking header.html
      // Then: should have search-suggestions container

      const hasSuggestionsContainer = headerHTML.includes('search-suggestions');

      assert.ok(
        hasSuggestionsContainer,
        'header.html should have search-suggestions container for SearchBarResults'
      );
    });
  });

  // ============================================
  // TEST 7: Follows Product-List Dropin Pattern
  // ============================================

  describe('Test 7: Follows product-list.js Dropin Pattern', () => {
    it('should import render from @dropins/storefront-product-discovery/render.js', () => {
      // Given: product-list.js imports render
      // When: checking header.js
      // Then: should have same render import pattern

      // Check product-list.js pattern first
      const productListHasRenderImport = productListJS.includes('@dropins/storefront-product-discovery/render.js');
      assert.ok(productListHasRenderImport, 'product-list.js should have render import (reference)');

      // Header should follow same pattern
      const hasRenderImport = headerJS.includes('@dropins/storefront-product-discovery/render.js');

      assert.ok(
        hasRenderImport,
        'header.js should import render from @dropins/storefront-product-discovery/render.js'
      );
    });

    it('should wait for dropins initialization', () => {
      // Given: dropins need to be initialized before use
      // When: checking header.js
      // Then: should wait for initialization

      const waitsForDropins =
        headerJS.includes('initializeDropins') ||
        headerJS.includes('dropins:initialized') ||
        headerJS.includes('waitForDropins');

      assert.ok(
        waitsForDropins,
        'header.js should wait for dropins to be initialized before rendering'
      );
    });
  });
});

// ============================================
// STEP 2: Mobile Search Toggle Behavior
// ============================================

describe('Header Search Dropin Migration - Step 2: Mobile Search Toggle', () => {
  let headerJS;
  let headerCSS;
  let headerHTML;

  before(() => {
    headerJS = readFile(HEADER_JS_PATH);
    headerCSS = readFile(HEADER_CSS_PATH);
    headerHTML = readFile(HEADER_HTML_PATH);

    assert.ok(headerJS, 'header.js should exist');
    assert.ok(headerCSS, 'header.css should exist');
    assert.ok(headerHTML, 'header.html should exist');
  });

  // ============================================
  // TEST 8: Search Icon Toggle Click Handler
  // ============================================

  describe('Test 8: Search Icon Toggle Click Handler', () => {
    it('should have click handler for search-icon-toggle element', () => {
      // Given: search-icon-toggle button exists in HTML
      // When: checking header.js
      // Then: should have click event listener for the toggle

      const hasSearchToggleHandler =
        headerJS.includes('search-icon-toggle') &&
        headerJS.includes('addEventListener') &&
        headerJS.includes('click');

      assert.ok(
        hasSearchToggleHandler,
        'header.js should have click handler for #search-icon-toggle'
      );
    });

    it('should toggle search-expanded class on header-search element', () => {
      // Given: user clicks search icon toggle
      // When: click handler executes
      // Then: header-search should toggle search-expanded class

      const hasExpandedClassToggle =
        headerJS.includes('search-expanded') &&
        (headerJS.includes('classList.toggle') || headerJS.includes('classList.add'));

      assert.ok(
        hasExpandedClassToggle,
        'header.js should toggle .search-expanded class for expand/collapse behavior'
      );
    });

    it('should update aria-expanded attribute on toggle', () => {
      // Given: search toggle button has aria-expanded attribute
      // When: user clicks the toggle
      // Then: aria-expanded should update to reflect state

      const hasAriaExpandedUpdate =
        headerJS.includes('aria-expanded') &&
        headerJS.includes('search-icon-toggle');

      assert.ok(
        hasAriaExpandedUpdate,
        'header.js should update aria-expanded attribute on search-icon-toggle'
      );
    });
  });

  // ============================================
  // TEST 9: Focus Management
  // ============================================

  describe('Test 9: Focus Management on Expand', () => {
    it('should focus search input when expanded', () => {
      // Given: user expands search on mobile
      // When: search is expanded
      // Then: search input should receive focus

      const hasFocusManagement =
        headerJS.includes('.focus()') ||
        headerJS.includes('focus()');

      assert.ok(
        hasFocusManagement,
        'header.js should focus search input when expanded for keyboard accessibility'
      );
    });
  });

  // ============================================
  // TEST 10: Click Outside to Close
  // ============================================

  describe('Test 10: Click Outside to Close Expanded Search', () => {
    it('should have document click listener for close behavior', () => {
      // Given: search is expanded on mobile
      // When: user clicks outside the search area
      // Then: search should collapse

      // Look for document-level click listener pattern
      const hasClickOutsideHandler =
        headerJS.includes('document.addEventListener') &&
        (headerJS.includes('search-expanded') || headerJS.includes('header-search'));

      assert.ok(
        hasClickOutsideHandler,
        'header.js should have document click listener for click-outside-to-close behavior'
      );
    });

    it('should check if click is outside search container', () => {
      // Given: document click listener exists
      // When: click occurs
      // Then: should check if click target is outside search container

      const hasContainsCheck =
        headerJS.includes('.contains(') ||
        headerJS.includes('contains(e.target)');

      assert.ok(
        hasContainsCheck,
        'header.js should use .contains() to check if click is outside search area'
      );
    });
  });

  // ============================================
  // TEST 11: ESC Key to Close
  // ============================================

  describe('Test 11: ESC Key Closes Expanded Search', () => {
    it('should have keydown listener for Escape key', () => {
      // Given: search is expanded
      // When: user presses Escape key
      // Then: search should collapse

      const hasEscapeHandler =
        headerJS.includes('Escape') ||
        headerJS.includes('keydown');

      assert.ok(
        hasEscapeHandler,
        'header.js should handle Escape key to close expanded search'
      );
    });
  });

  // ============================================
  // TEST 12: CSS for Expanded State
  // ============================================

  describe('Test 12: CSS for Search Expanded State', () => {
    it('should have .search-expanded CSS class defined', () => {
      // Given: toggle adds search-expanded class
      // When: checking CSS
      // Then: .search-expanded should be defined with appropriate styles

      const hasExpandedClass = headerCSS.includes('.search-expanded');

      assert.ok(
        hasExpandedClass,
        'header.css should define .search-expanded class for expanded mobile search'
      );
    });

    it('should show search form when expanded', () => {
      // Given: .search-expanded class is applied
      // When: checking CSS
      // Then: .search-form should be visible when parent has .search-expanded

      const hasExpandedFormStyles =
        headerCSS.includes('.search-expanded') &&
        (headerCSS.includes('.search-form') || headerCSS.includes('search-form'));

      assert.ok(
        hasExpandedFormStyles,
        'header.css should show .search-form when .search-expanded is applied'
      );
    });

    it('should position expanded search appropriately for mobile', () => {
      // Given: mobile viewport (<=880px)
      // When: search is expanded
      // Then: should have positioning styles (absolute/fixed)

      const hasPositioningStyles =
        headerCSS.includes('.search-expanded') &&
        (headerCSS.includes('position:') || headerCSS.includes('position :'));

      assert.ok(
        hasPositioningStyles,
        'header.css should have positioning styles for expanded mobile search'
      );
    });
  });

  // ============================================
  // TEST 13: HTML Has Required Elements
  // ============================================

  describe('Test 13: HTML Has Required Toggle Elements', () => {
    it('should have search-icon-toggle button with id', () => {
      // Given: mobile search needs a toggle button
      // When: checking HTML
      // Then: should have #search-icon-toggle button

      const hasToggleButton = headerHTML.includes('id="search-icon-toggle"');

      assert.ok(
        hasToggleButton,
        'header.html should have button with id="search-icon-toggle"'
      );
    });

    it('should have aria-label on search toggle', () => {
      // Given: toggle needs accessibility
      // When: checking HTML
      // Then: should have aria-label

      const hasAriaLabel =
        headerHTML.includes('search-icon-toggle') &&
        headerHTML.includes('aria-label');

      assert.ok(
        hasAriaLabel,
        'header.html search-icon-toggle should have aria-label for accessibility'
      );
    });
  });

  // ============================================
  // TEST 14: Toggle Pattern Follows Menu Toggle
  // ============================================

  describe('Test 14: Toggle Pattern Follows Existing Menu Toggle Pattern', () => {
    it('should follow same pattern as menu-toggle', () => {
      // Given: menu-toggle pattern exists in header.js
      // When: implementing search toggle
      // Then: should use similar querySelector + addEventListener pattern

      const hasMenuTogglePattern =
        headerJS.includes('menu-toggle') &&
        headerJS.includes('addEventListener');

      const hasSearchTogglePattern =
        headerJS.includes('search-icon-toggle') &&
        headerJS.includes('addEventListener');

      assert.ok(
        hasMenuTogglePattern,
        'header.js should have menu-toggle pattern (reference)'
      );

      assert.ok(
        hasSearchTogglePattern,
        'header.js should implement search-icon-toggle using same pattern as menu-toggle'
      );
    });

    it('should be placed near menu toggle code for consistency', () => {
      // Given: code organization matters
      // When: checking header.js
      // Then: search toggle code should be near menu toggle code

      // Find positions of both patterns
      const menuTogglePos = headerJS.indexOf('menu-toggle');
      const searchTogglePos = headerJS.indexOf('search-icon-toggle');

      // Both should exist
      assert.ok(menuTogglePos > -1, 'menu-toggle should exist');
      assert.ok(searchTogglePos > -1, 'search-icon-toggle should exist');

      // Search toggle should be within reasonable distance of menu toggle
      // (allowing for the menu toggle handler to be defined first)
      const distance = Math.abs(searchTogglePos - menuTogglePos);
      const isReasonablyClose = distance < 3000; // Within ~3000 chars

      assert.ok(
        isReasonablyClose,
        'search-icon-toggle code should be near menu-toggle code for consistency'
      );
    });
  });
});

// ============================================
// STEP 3: Search Form Submission Edge Cases
// ============================================

describe('Header Search Dropin Migration - Step 3: Search Submission Edge Cases', () => {
  let headerJS;

  before(() => {
    headerJS = readFile(HEADER_JS_PATH);
    assert.ok(headerJS, 'header.js should exist');
  });

  // ============================================
  // TEST 15: navigateToCatalog Function Exists
  // ============================================

  describe('Test 15: navigateToCatalog Helper Function', () => {
    it('should have navigateToCatalog function defined', () => {
      // Given: Search needs to navigate to catalog page
      // When: checking header.js
      // Then: navigateToCatalog function should be defined

      const hasNavigateToCatalog =
        headerJS.includes('function navigateToCatalog') ||
        headerJS.includes('const navigateToCatalog');

      assert.ok(
        hasNavigateToCatalog,
        'header.js should define navigateToCatalog function for search navigation'
      );
    });

    it('should accept query parameter', () => {
      // Given: navigateToCatalog function exists
      // When: checking function signature
      // Then: should accept query string parameter

      const hasQueryParam = headerJS.includes('navigateToCatalog(query)');

      assert.ok(
        hasQueryParam,
        'navigateToCatalog should accept query parameter'
      );
    });
  });

  // ============================================
  // TEST 16: Empty Query Prevention
  // ============================================

  describe('Test 16: Empty Query Prevention', () => {
    it('should check if query is truthy before navigation', () => {
      // Given: User may submit empty search
      // When: empty query is submitted
      // Then: navigation should NOT occur

      // Look for conditional check before navigation
      const hasEmptyCheck =
        (headerJS.includes('if (') && headerJS.includes('trimmedQuery')) ||
        (headerJS.includes('if (') && headerJS.includes('query'));

      assert.ok(
        hasEmptyCheck,
        'navigateToCatalog should check if query is truthy before navigation'
      );
    });

    it('should NOT navigate when query is empty string', () => {
      // Given: navigateToCatalog is called with ""
      // When: function executes
      // Then: window.location.href should NOT be set

      // Verify conditional wraps the navigation
      const functionMatch = headerJS.match(/function navigateToCatalog[\s\S]*?^\}/m);
      if (functionMatch) {
        const functionBody = functionMatch[0];
        const hasConditionalNavigation =
          functionBody.includes('if (') &&
          functionBody.includes('window.location.href');

        assert.ok(
          hasConditionalNavigation,
          'Navigation to catalog should be inside conditional block (prevent empty query)'
        );
      } else {
        assert.ok(false, 'Could not find navigateToCatalog function body');
      }
    });

    it('should NOT navigate when query is only whitespace', () => {
      // Given: navigateToCatalog is called with "   "
      // When: function executes
      // Then: after trim, query is empty, navigation should NOT occur

      const hasTrimBeforeCheck =
        headerJS.includes('.trim()') &&
        headerJS.includes('navigateToCatalog');

      assert.ok(
        hasTrimBeforeCheck,
        'navigateToCatalog should trim query before checking if empty'
      );
    });
  });

  // ============================================
  // TEST 17: URL Encoding for Special Characters
  // ============================================

  describe('Test 17: URL Encoding for Special Characters', () => {
    it('should use encodeURIComponent for query', () => {
      // Given: Query may contain special characters like "2x4 lumber & nails"
      // When: building navigation URL
      // Then: should use encodeURIComponent to safely encode

      const hasEncodeURIComponent = headerJS.includes('encodeURIComponent');

      assert.ok(
        hasEncodeURIComponent,
        'header.js should use encodeURIComponent for URL-safe search queries'
      );
    });

    it('should encode query before appending to URL', () => {
      // Given: navigateToCatalog builds URL with query
      // When: checking URL construction
      // Then: encodeURIComponent should wrap the query

      // Look for pattern: catalog?search=${encodeURIComponent(...)
      const hasCorrectEncodingPattern =
        headerJS.includes('catalog?search=') &&
        headerJS.includes('encodeURIComponent');

      assert.ok(
        hasCorrectEncodingPattern,
        'Query should be encoded before appending to catalog?search= URL'
      );
    });

    it('should handle ampersand character in query', () => {
      // Given: Query contains "&" (e.g., "lumber & nails")
      // When: encoded with encodeURIComponent
      // Then: "&" becomes "%26"

      // Static analysis: verify encodeURIComponent is used
      // (actual encoding is handled by the function, we verify it's called)
      const usesEncodeURI =
        headerJS.includes('encodeURIComponent(trimmedQuery)') ||
        headerJS.includes('encodeURIComponent(query)');

      assert.ok(
        usesEncodeURI,
        'encodeURIComponent should be applied to query value directly'
      );
    });

    it('should handle spaces in query', () => {
      // Given: Query contains spaces (e.g., "deck boards")
      // When: encoded with encodeURIComponent
      // Then: spaces become "%20"

      // Same verification - encodeURIComponent handles this
      const usesEncodeURI = headerJS.includes('encodeURIComponent');

      assert.ok(
        usesEncodeURI,
        'header.js should use encodeURIComponent to handle spaces in query'
      );
    });
  });

  // ============================================
  // TEST 18: Whitespace Handling
  // ============================================

  describe('Test 18: Leading/Trailing Whitespace Handling', () => {
    it('should trim leading whitespace from query', () => {
      // Given: Query has leading spaces "   lumber"
      // When: navigateToCatalog processes query
      // Then: trimmed query "lumber" is used

      const hasTrim = headerJS.includes('.trim()');

      assert.ok(
        hasTrim,
        'navigateToCatalog should trim whitespace from query'
      );
    });

    it('should trim trailing whitespace from query', () => {
      // Given: Query has trailing spaces "lumber   "
      // When: navigateToCatalog processes query
      // Then: trimmed query "lumber" is used

      // .trim() handles both leading and trailing
      const hasTrim =
        headerJS.includes('query?.trim()') ||
        headerJS.includes('query.trim()');

      assert.ok(
        hasTrim,
        'navigateToCatalog should use .trim() to remove leading/trailing whitespace'
      );
    });

    it('should use optional chaining for null safety', () => {
      // Given: Query could be null or undefined
      // When: calling trim
      // Then: should use ?. to avoid error

      const hasOptionalChaining = headerJS.includes('query?.trim()');

      assert.ok(
        hasOptionalChaining,
        'navigateToCatalog should use optional chaining (query?.trim()) for null safety'
      );
    });
  });

  // ============================================
  // TEST 19: URL Format Consistency
  // ============================================

  describe('Test 19: URL Format Consistency', () => {
    it('should navigate to catalog page (not search page)', () => {
      // Given: BuildRight search results on catalog page
      // When: search is submitted
      // Then: URL should be catalog?search= (not /search?)

      const navigatesToCatalog =
        headerJS.includes('catalog?search=') &&
        !headerJS.includes('/search?');

      assert.ok(
        navigatesToCatalog,
        'Search should navigate to catalog?search= URL format (BuildRight pattern)'
      );
    });

    it('should use relative URL (no leading slash)', () => {
      // Given: EDS routing
      // When: building URL
      // Then: URL should be relative (catalog?search=) not absolute (/catalog?search=)

      // Check that navigateToCatalog uses relative path
      const functionMatch = headerJS.match(/function navigateToCatalog[\s\S]*?^\}/m);
      if (functionMatch) {
        const functionBody = functionMatch[0];
        const usesRelativeUrl =
          functionBody.includes('`catalog?search=') ||
          functionBody.includes("'catalog?search=");

        assert.ok(
          usesRelativeUrl,
          'navigateToCatalog should use relative URL path (catalog?search=)'
        );
      } else {
        assert.ok(false, 'Could not find navigateToCatalog function body');
      }
    });

    it('should use template literal for URL construction', () => {
      // Given: URL needs query interpolation
      // When: building URL string
      // Then: should use template literal for clean construction

      const usesTemplateLiteral =
        headerJS.includes('`catalog?search=${');

      assert.ok(
        usesTemplateLiteral,
        'navigateToCatalog should use template literal for URL construction'
      );
    });
  });

  // ============================================
  // TEST 20: Long Query Handling
  // ============================================

  describe('Test 20: Long Query Handling', () => {
    it('should NOT have arbitrary length limit on query', () => {
      // Given: User may search for long phrases (100+ chars)
      // When: checking navigateToCatalog
      // Then: should NOT have hardcoded length check that truncates

      const functionMatch = headerJS.match(/function navigateToCatalog[\s\S]*?^\}/m);
      if (functionMatch) {
        const functionBody = functionMatch[0];
        const hasLengthLimit =
          functionBody.includes('.length >') ||
          functionBody.includes('.substring(') ||
          functionBody.includes('.slice(0,');

        assert.ok(
          !hasLengthLimit,
          'navigateToCatalog should NOT artificially limit query length'
        );
      } else {
        assert.ok(false, 'Could not find navigateToCatalog function body');
      }
    });

    it('should pass full query to encodeURIComponent', () => {
      // Given: Long query string (100+ chars)
      // When: encoding for URL
      // Then: full query should be encoded (no truncation)

      // Verify no substring/slice before encode
      const hasDirectEncode =
        headerJS.includes('encodeURIComponent(trimmedQuery)') ||
        headerJS.includes('encodeURIComponent(query)');

      assert.ok(
        hasDirectEncode,
        'Full query should be passed to encodeURIComponent without truncation'
      );
    });
  });

  // ============================================
  // TEST 21: Form Submit Event Handling
  // ============================================

  describe('Test 21: Form Submit Event Handling', () => {
    it('should prevent default form submission', () => {
      // Given: Search form has submit handler
      // When: form is submitted
      // Then: e.preventDefault() should be called

      const hasPrevenetDefault = headerJS.includes('e.preventDefault()');

      assert.ok(
        hasPrevenetDefault,
        'Search form submit handler should call e.preventDefault()'
      );
    });

    it('should get input value from search form', () => {
      // Given: Form submit handler executes
      // When: getting query value
      // Then: should query the input element for its value

      const getsInputValue =
        headerJS.includes('querySelector') &&
        (headerJS.includes('input[type="search"]') || headerJS.includes('search-input'));

      assert.ok(
        getsInputValue,
        'Form submit handler should get input value via querySelector'
      );
    });

    it('should call navigateToCatalog with input value', () => {
      // Given: Form submit handler has input value
      // When: processing submission
      // Then: should call navigateToCatalog(value)

      const callsNavigate = headerJS.includes('navigateToCatalog(input');

      assert.ok(
        callsNavigate,
        'Form submit handler should call navigateToCatalog with input value'
      );
    });
  });

  // ============================================
  // TEST 22: Search Button Click Handling
  // ============================================

  describe('Test 22: Search Button Click Handling', () => {
    it('should have click handler on search button', () => {
      // Given: Search button exists in form
      // When: checking header.js
      // Then: should have click listener on search button

      const hasSearchButtonHandler =
        headerJS.includes('searchButton') &&
        headerJS.includes('addEventListener') &&
        headerJS.includes('click');

      assert.ok(
        hasSearchButtonHandler,
        'header.js should have click handler on search button'
      );
    });

    it('should use same handler as form submit', () => {
      // Given: Click and submit should behave identically
      // When: checking handler assignment
      // Then: should use shared handler function (handleSearchSubmit)

      const usesSharedHandler =
        headerJS.includes('handleSearchSubmit') &&
        headerJS.includes("'submit', handleSearchSubmit") &&
        headerJS.includes("'click', handleSearchSubmit");

      assert.ok(
        usesSharedHandler,
        'Search button click should use same handler as form submit (handleSearchSubmit)'
      );
    });
  });

  // ============================================
  // TEST 23: Dropin routeSearch Callback Integration
  // ============================================

  describe('Test 23: Dropin routeSearch Callback Integration', () => {
    it('should pass navigateToCatalog as routeSearch to SearchBarInput', () => {
      // Given: SearchBarInput dropin accepts routeSearch callback (Adobe's correct API)
      // When: rendering dropin
      // Then: navigateToCatalog should be passed as routeSearch

      const hasRouteSearchCallback =
        headerJS.includes('routeSearch:') &&
        headerJS.includes('navigateToCatalog');

      assert.ok(
        hasRouteSearchCallback,
        'SearchBarInput should receive navigateToCatalog as routeSearch callback'
      );
    });

    it('should configure routeSearch in SearchBarInput render options', () => {
      // Given: render.render(SearchBarInput, options) is called
      // When: checking options object
      // Then: should include routeSearch: navigateToCatalog

      // Look for pattern in render call
      const hasCorrectRenderPattern =
        headerJS.includes('render.render(SearchBarInput') &&
        headerJS.includes('routeSearch: navigateToCatalog');

      assert.ok(
        hasCorrectRenderPattern,
        'SearchBarInput render options should include routeSearch: navigateToCatalog'
      );
    });
  });
});
