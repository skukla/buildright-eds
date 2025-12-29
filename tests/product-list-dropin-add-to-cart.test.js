/**
 * Product List Dropin Add-to-Cart State Management Tests
 *
 * TDD tests for Step 5: Add-to-Cart Enhancement
 * Validates that product-list-dropin.js ProductActions slot implements
 * proper button state management with loading, success, and error states.
 *
 * Run with: node --test tests/product-list-dropin-add-to-cart.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCKS_DIR = path.join(__dirname, '..', 'blocks');
const PRODUCT_LIST_DROPIN_JS_PATH = path.join(BLOCKS_DIR, 'product-list-dropin', 'product-list-dropin.js');
const PRODUCT_GRID_JS_PATH = path.join(BLOCKS_DIR, 'product-grid', 'product-grid.js');
const PRODUCT_CARD_CSS_PATH = path.join(BLOCKS_DIR, 'product-list-dropin', 'css', 'product-card.css');

// Helper: Read file contents
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper: Extract click handler code block for ProductActions
function extractClickHandlerCode(jsContent) {
  // Find the ProductActions slot definition and its click handler
  // Looking for pattern: viewButton.addEventListener('click', async (e) => { ... }

  // First, find ProductActions slot
  const productActionsMatch = jsContent.match(/ProductActions\s*:\s*\(ctx\)\s*=>\s*\{/);
  if (!productActionsMatch) return null;

  // Extract the content after ProductActions slot definition until the next slot or end
  const startIdx = productActionsMatch.index;
  const afterProductActions = jsContent.substring(startIdx);

  // Find the click handler
  const clickHandlerMatch = afterProductActions.match(/addEventListener\s*\(\s*['"]click['"]\s*,\s*async\s*\([^)]*\)\s*=>\s*\{/);
  if (!clickHandlerMatch) return null;

  // Get the index within afterProductActions
  const clickStartIdx = clickHandlerMatch.index;
  const afterClickStart = afterProductActions.substring(clickStartIdx);

  // Find the matching closing brace by counting braces
  let braceCount = 0;
  let inHandler = false;
  let endIdx = 0;

  for (let i = 0; i < afterClickStart.length; i++) {
    const char = afterClickStart[i];
    if (char === '{') {
      braceCount++;
      inHandler = true;
    } else if (char === '}') {
      braceCount--;
      if (inHandler && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  return afterClickStart.substring(0, endIdx);
}

// Helper: Check if code contains pattern
function codeContains(code, pattern) {
  if (typeof pattern === 'string') {
    return code.includes(pattern);
  }
  return pattern.test(code);
}

// Test suite
describe('Product List Dropin Add-to-Cart State Management', () => {
  let dropinContent;
  let gridContent;
  let cssContent;
  let clickHandlerCode;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(PRODUCT_LIST_DROPIN_JS_PATH),
      `product-list-dropin.js should exist at ${PRODUCT_LIST_DROPIN_JS_PATH}`);
    assert.ok(fileExists(PRODUCT_GRID_JS_PATH),
      `product-grid.js should exist at ${PRODUCT_GRID_JS_PATH} (reference)`);
    assert.ok(fileExists(PRODUCT_CARD_CSS_PATH),
      `product-card.css should exist at ${PRODUCT_CARD_CSS_PATH}`);

    // Read file contents
    dropinContent = readFile(PRODUCT_LIST_DROPIN_JS_PATH);
    gridContent = readFile(PRODUCT_GRID_JS_PATH);
    cssContent = readFile(PRODUCT_CARD_CSS_PATH);

    // Extract click handler
    clickHandlerCode = extractClickHandlerCode(dropinContent);

    console.log('\n=== Click Handler Found ===');
    if (clickHandlerCode) {
      console.log(`  Handler length: ${clickHandlerCode.length} characters`);
      console.log(`  First 200 chars: ${clickHandlerCode.substring(0, 200)}...`);
    } else {
      console.log('  WARNING: Click handler not found in ProductActions slot');
    }
  });

  describe('Test 1: Loading State Disables Button', () => {
    it('should set button.disabled = true when clicked', () => {
      // Given: User clicks Add to Cart button
      // When: Cart operation is in progress
      // Then: button.disabled = true

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'button.disabled = true') ||
        codeContains(clickHandlerCode, /button\s*\.\s*disabled\s*=\s*true/),
        'Click handler should disable button: button.disabled = true'
      );
    });

    it('should show spinner SVG in loading state', () => {
      // Then: innerHTML shows spinner SVG

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Check for spinner/loading SVG pattern
      const hasSpinner =
        codeContains(clickHandlerCode, 'animateTransform') || // SVG animation
        codeContains(clickHandlerCode, /spin/i) ||           // spin class/keyword
        codeContains(clickHandlerCode, 'rotate');             // rotation animation

      assert.ok(hasSpinner,
        'Click handler should show spinner SVG with animation (animateTransform or rotate)'
      );
    });

    it('should show "Adding..." text in loading state', () => {
      // Then: innerHTML shows "Adding..." text

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'Adding...'),
        'Click handler should show "Adding..." text during loading'
      );
    });

    it('should add loading class to button', () => {
      // Then: button.classList.contains('loading')

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.add('loading')") ||
        codeContains(clickHandlerCode, 'classList.add("loading")'),
        'Click handler should add "loading" class to button'
      );
    });
  });

  describe('Test 2: Success State Shows Confirmation', () => {
    it('should show checkmark SVG on success', () => {
      // Given: addProductToCart resolves successfully
      // When: State updates
      // Then: shows checkmark SVG

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Check for checkmark pattern (polyline with points for checkmark)
      const hasCheckmark =
        codeContains(clickHandlerCode, 'polyline') ||
        codeContains(clickHandlerCode, /20\s+6\s+9\s+17\s+4\s+12/) || // checkmark points
        codeContains(clickHandlerCode, 'check');

      assert.ok(hasCheckmark,
        'Click handler should show checkmark SVG on success (polyline or check icon)'
      );
    });

    it('should show "Added!" text on success', () => {
      // Then: shows "Added!" text

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'Added!'),
        'Click handler should show "Added!" text on success'
      );
    });

    it('should add success class to button', () => {
      // Then: button.classList.contains('success')

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.add('success')") ||
        codeContains(clickHandlerCode, 'classList.add("success")'),
        'Click handler should add "success" class to button'
      );
    });

    it('should remove loading class on success', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.remove('loading')") ||
        codeContains(clickHandlerCode, 'classList.remove("loading")'),
        'Click handler should remove "loading" class on success'
      );
    });
  });

  describe('Test 3: Success Resets After 1500ms', () => {
    it('should use setTimeout with 1500ms for success reset', () => {
      // Given: Button is in success state
      // When: 1500ms elapses
      // Then: Button returns to original state

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Look for setTimeout with 1500
      assert.ok(
        codeContains(clickHandlerCode, '1500'),
        'Click handler should use 1500ms timeout for success state reset'
      );
    });

    it('should restore original innerHTML after success timeout', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Check for restoring original HTML
      const restoresOriginal =
        codeContains(clickHandlerCode, 'originalHTML') ||
        codeContains(clickHandlerCode, 'originalContent') ||
        codeContains(clickHandlerCode, 'innerHTML =');

      assert.ok(restoresOriginal,
        'Click handler should restore original button content after success'
      );
    });

    it('should re-enable button after success timeout', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'button.disabled = false') ||
        codeContains(clickHandlerCode, /disabled\s*=\s*false/),
        'Click handler should set button.disabled = false after success timeout'
      );
    });

    it('should remove success class after timeout', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.remove('success')") ||
        codeContains(clickHandlerCode, 'classList.remove("success")'),
        'Click handler should remove "success" class after timeout'
      );
    });
  });

  describe('Test 4: Error State Shows Failure', () => {
    it('should show error SVG on failure', () => {
      // Given: addProductToCart rejects
      // When: State updates
      // Then: shows error icon (circle with X or warning)

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Should have a try-catch block
      assert.ok(
        codeContains(clickHandlerCode, 'catch'),
        'Click handler should have error handling (catch block)'
      );

      // Check for error icon - either inline or via variable reference
      const hasErrorSVG =
        codeContains(clickHandlerCode, 'errorSVG') ||  // Variable reference
        (codeContains(clickHandlerCode, '<svg') && codeContains(clickHandlerCode, 'circle'));

      assert.ok(hasErrorSVG,
        'Click handler should show error SVG icon (via errorSVG variable or inline)'
      );
    });

    it('should show "Error" text on failure', () => {
      // Then: shows "Error" text

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      const hasCatch = clickHandlerCode.indexOf('catch');
      if (hasCatch >= 0) {
        const catchBlock = clickHandlerCode.substring(hasCatch);
        assert.ok(
          codeContains(catchBlock, 'Error'),
          'Click handler should show "Error" text in catch block'
        );
      }
    });

    it('should add error class to button on failure', () => {
      // Then: button.classList.contains('error')

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.add('error')") ||
        codeContains(clickHandlerCode, 'classList.add("error")'),
        'Click handler should add "error" class to button on failure'
      );
    });

    it('should remove loading class on error', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // The loading class should be removed in error path too
      // Count occurrences - should have at least 2 (success and error paths)
      const removeLoadingCount = (clickHandlerCode.match(/classList\.remove\(['"]loading['"]\)/g) || []).length;

      assert.ok(
        removeLoadingCount >= 2 || codeContains(clickHandlerCode, "classList.remove('loading')"),
        'Click handler should remove "loading" class in error handler'
      );
    });
  });

  describe('Test 5: Error Resets After 2000ms', () => {
    it('should use setTimeout with 2000ms for error reset', () => {
      // Given: Button is in error state
      // When: 2000ms elapses
      // Then: Button returns to original state

      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Look for setTimeout with 2000
      assert.ok(
        codeContains(clickHandlerCode, '2000'),
        'Click handler should use 2000ms timeout for error state reset'
      );
    });

    it('should re-enable button after error timeout', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Should have disabled = false at least twice (success and error paths)
      const disabledFalseCount = (clickHandlerCode.match(/disabled\s*=\s*false/g) || []).length;

      assert.ok(
        disabledFalseCount >= 2,
        `Click handler should re-enable button in both success and error paths. Found ${disabledFalseCount} occurrences.`
      );
    });

    it('should remove error class after timeout', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, "classList.remove('error')") ||
        codeContains(clickHandlerCode, 'classList.remove("error")'),
        'Click handler should remove "error" class after timeout'
      );
    });
  });

  describe('Test 6: Button States Have Correct CSS Classes', () => {
    it('should have CSS for .loading class', () => {
      // Given: All button state transitions
      // When: Checking classes
      // Then: Uses 'loading' class

      assert.ok(
        codeContains(cssContent, '.loading') ||
        codeContains(cssContent, '.buildright-btn.loading'),
        'CSS should define .loading class for button loading state'
      );
    });

    it('should have CSS for .success class', () => {
      assert.ok(
        codeContains(cssContent, '.success') ||
        codeContains(cssContent, '.buildright-btn.success'),
        'CSS should define .success class for button success state'
      );
    });

    it('should have CSS for .error class', () => {
      assert.ok(
        codeContains(cssContent, '.error') ||
        codeContains(cssContent, '.buildright-btn.error'),
        'CSS should define .error class for button error state'
      );
    });

    it('should have CSS for :disabled button state', () => {
      assert.ok(
        codeContains(cssContent, ':disabled') ||
        codeContains(cssContent, '.buildright-btn:disabled'),
        'CSS should define :disabled state for button'
      );
    });

    it('should have spin animation for loading spinner', () => {
      // Check for @keyframes spin or similar
      const hasSpinAnimation =
        codeContains(cssContent, '@keyframes spin') ||
        codeContains(cssContent, 'animation') ||
        codeContains(cssContent, '.spin');

      assert.ok(hasSpinAnimation,
        'CSS should define spin animation for loading spinner'
      );
    });

    it('should set success background color to green', () => {
      // Check for green-ish color in success class
      const successSection = cssContent.match(/\.success\s*\{[^}]+\}/g);

      if (successSection) {
        const hasGreen =
          successSection.some(s =>
            s.includes('#10b981') || // Emerald green
            s.includes('#22c55e') || // Green-500
            s.includes('rgb(16, 185, 129)') ||
            s.includes('green')
          );

        assert.ok(hasGreen,
          'CSS .success class should have green background color'
        );
      } else {
        assert.ok(codeContains(cssContent, 'success'),
          'CSS should have success styling'
        );
      }
    });

    it('should set error background color to red', () => {
      // Check for red-ish color in error class
      const errorSection = cssContent.match(/\.error\s*\{[^}]+\}/g);

      if (errorSection) {
        const hasRed =
          errorSection.some(s =>
            s.includes('#ef4444') || // Red-500
            s.includes('#dc2626') || // Red-600
            s.includes('rgb(239, 68, 68)') ||
            s.includes('red')
          );

        assert.ok(hasRed,
          'CSS .error class should have red background color'
        );
      } else {
        assert.ok(codeContains(cssContent, 'error'),
          'CSS should have error styling'
        );
      }
    });
  });

  describe('Test 7: Commerce Helpers Integration', () => {
    it('should import addProductToCart from commerce-helpers.js', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'addProductToCart') ||
        codeContains(dropinContent, 'commerce-helpers'),
        'Click handler should use addProductToCart from commerce-helpers.js'
      );
    });

    it('should import showAddToCartNotification from commerce-helpers.js', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      assert.ok(
        codeContains(clickHandlerCode, 'showAddToCartNotification'),
        'Click handler should use showAddToCartNotification from commerce-helpers.js'
      );
    });

    it('should call addProductToCart with product and quantity', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Pattern: addProductToCart(product, 1) or similar
      assert.ok(
        codeContains(clickHandlerCode, /addProductToCart\s*\(\s*product/),
        'Click handler should call addProductToCart(product, 1)'
      );
    });

    it('should call showAddToCartNotification after successful add', () => {
      assert.ok(clickHandlerCode,
        'Click handler should exist in ProductActions slot');

      // Should be in try block, before the success state
      const tryIndex = clickHandlerCode.indexOf('try');
      const catchIndex = clickHandlerCode.indexOf('catch');

      if (tryIndex >= 0 && catchIndex >= 0) {
        const tryBlock = clickHandlerCode.substring(tryIndex, catchIndex);
        assert.ok(
          codeContains(tryBlock, 'showAddToCartNotification'),
          'showAddToCartNotification should be called in success path (try block)'
        );
      }
    });
  });

  describe('Test 8: Pattern Matches product-grid.js', () => {
    it('should use same button state pattern as product-grid.js', () => {
      // Reference implementation check
      const gridClickHandler = extractClickHandlerCode(gridContent);

      // Both should have disabled, loading, success, error patterns
      const patterns = [
        'disabled = true',
        'Adding...',
        'Added!',
        'classList.add',
        'classList.remove',
        '1500',
        '2000',
        'setTimeout'
      ];

      for (const pattern of patterns) {
        assert.ok(
          codeContains(clickHandlerCode, pattern),
          `Dropin click handler should use pattern "${pattern}" (matching product-grid.js)`
        );
      }
    });
  });
});
