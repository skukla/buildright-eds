/**
 * CRITICAL INITIALIZATION
 * 
 * Adobe EDS Best Practice: Keep <head> minimal
 * Performance Reality: Some init must happen synchronously before modules load
 * 
 * This script runs BEFORE scripts.js (module) to prevent:
 * - Image path errors (BASE_PATH needed immediately)
 * - Layout shifts (cart count needed for header rendering)
 * - Style flashes (variant detection needed before paint)
 * 
 * Trade-off: ~50 lines in <head> vs. perfect Core Web Vitals
 * 
 * © 2024 Adobe. All rights reserved.
 */

// ============================================================================
// 1. BASE_PATH DETECTION
// ============================================================================
// Detects GitHub Pages subdirectory deployment vs. localhost root
// Needed immediately for image URLs and block loading paths
(function initBasePath() {
  const pathname = window.location.pathname;
  const isGitHubPages = pathname.startsWith('/buildright-eds/');
  window.BASE_PATH = isGitHubPages ? '/buildright-eds/' : '/';
})();

// ============================================================================
// 2. CART PRELOAD (Prevent Header Layout Shift)
// ============================================================================
// Preload cart count from localStorage to prevent header badge from
// popping in after header renders (CLS prevention)
window.__INITIAL_CART_COUNT__ = (() => {
  try {
    const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  } catch (e) {
    return 0;
  }
})();

// Preload selected location for multi-location personas (Kevin)
window.__INITIAL_LOCATION__ = localStorage.getItem('buildright_selected_location') || null;

// ============================================================================
// 3. VARIANT DETECTION (Prevent Style Flash)
// ============================================================================
// Detect ?variant=white query parameter and apply class before first paint
// This prevents a flash of gray background before white variant styles load
(function initVariant() {
  const urlParams = new URLSearchParams(window.location.search);
  const variant = urlParams.get('variant');
  
  if (variant === 'white') {
    // Apply to documentElement first (available immediately)
    document.documentElement.classList.add('white-variant');
    
    // Transfer to body when it becomes available
    if (document.body) {
      document.body.classList.add('white-variant');
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('white-variant');
      });
    }
  }
})();

