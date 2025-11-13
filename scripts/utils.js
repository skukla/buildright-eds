// Utility Functions

// Get URL parameter
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format number with commas
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get base URL for resolving relative paths - EDS-compatible approach
const getScriptBaseUrl = (() => {
  // Check if running in EDS environment (Adobe Edge Delivery Services)
  // EDS sets window.hlx.codeBasePath dynamically based on script location
  if (window.hlx?.codeBasePath !== undefined) {
    return window.hlx.codeBasePath;
  }
  // Fallback: use import.meta.url for standalone/prototype mode
  try {
    // Use import.meta.url to get the current module's URL
    const scriptUrl = new URL(import.meta.url);
    // Get the directory containing this script (scripts/)
    const scriptsDir = scriptUrl.pathname.replace(/\/[^/]*$/, '/');
    // Go up one level to get the root directory
    return scriptUrl.origin + scriptsDir.replace(/\/scripts\/$/, '/');
  } catch (e) {
    // Final fallback: use window location
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  }
})();

// Load block HTML
async function loadBlockHTML(blockName) {
  try {
    const blockPath = `${getScriptBaseUrl}blocks/${blockName}/${blockName}.html`;
    const response = await fetch(blockPath);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error(`Error loading block ${blockName}:`, error);
    return null;
  }
}

// Load block CSS
function loadBlockCSS(blockName) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${getScriptBaseUrl}blocks/${blockName}/${blockName}.css`;
  document.head.appendChild(link);
}

// Load block JS
async function loadBlockJS(blockName) {
  try {
    // Use relative path from scripts/ directory
    // From scripts/utils.js -> blocks/product-grid/product-grid.js
    const blockPath = `../blocks/${blockName}/${blockName}.js`;
    const module = await import(blockPath);
    return module.default;
  } catch (error) {
    console.error(`Error loading block JS ${blockName}:`, error);
    return null;
  }
}

// Decorate block (EDS pattern)
async function decorateBlock(blockElement, blockName) {
  // Load CSS
  loadBlockCSS(blockName);

  // Load and execute JS
  const decorate = await loadBlockJS(blockName);
  if (decorate && typeof decorate === 'function') {
    decorate(blockElement);
  }
}

/**
 * Parse HTML template string to DOM (reduces DOM manipulation)
 * Uses DOMParser for secure parsing without innerHTML on live DOM
 * @param {string} htmlString - HTML string to parse
 * @returns {HTMLElement} First element from parsed HTML
 */
function parseHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.firstElementChild || doc.body;
}

/**
 * Parse HTML template and return fragment (for multiple root elements)
 * @param {string} htmlString - HTML string to parse
 * @returns {DocumentFragment} Fragment containing all parsed elements
 */
function parseHTMLFragment(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const fragment = document.createDocumentFragment();
  Array.from(doc.body.children).forEach(child => fragment.appendChild(child));
  return fragment;
}

/**
 * Safe event listener management - ensures idempotent listener addition
 * Tracks listeners on the target element/object to enable cleanup
 * @param {EventTarget} target - Element or object to attach listener to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 * @param {string} key - Unique key for this listener (for cleanup)
 * @param {object} options - Event listener options
 */
function safeAddEventListener(target, event, handler, key, options = {}) {
  // Create a storage key for tracking listeners
  const storageKey = `_safeListeners_${event}`;
  
  // Initialize storage if it doesn't exist
  if (!target[storageKey]) {
    target[storageKey] = new Map();
  }
  
  // Remove existing listener with same key if it exists
  const existing = target[storageKey].get(key);
  if (existing) {
    target.removeEventListener(event, existing.handler, existing.options);
  }
  
  // Add new listener and store reference
  target.addEventListener(event, handler, options);
  target[storageKey].set(key, { handler, options });
}

/**
 * Remove a safely tracked event listener
 * @param {EventTarget} target - Element or object
 * @param {string} event - Event name
 * @param {string} key - Unique key for the listener
 */
function safeRemoveEventListener(target, event, key) {
  const storageKey = `_safeListeners_${event}`;
  if (!target[storageKey]) return;
  
  const listener = target[storageKey].get(key);
  if (listener) {
    target.removeEventListener(event, listener.handler, listener.options);
    target[storageKey].delete(key);
  }
}

/**
 * Remove all safely tracked listeners for a specific event
 * @param {EventTarget} target - Element or object
 * @param {string} event - Event name (optional, removes all if not provided)
 */
function cleanupEventListeners(target, event = null) {
  if (event) {
    const storageKey = `_safeListeners_${event}`;
    if (target[storageKey]) {
      target[storageKey].forEach((listener, key) => {
        target.removeEventListener(event, listener.handler, listener.options);
      });
      target[storageKey].clear();
    }
  } else {
    // Remove all listeners for all events
    Object.keys(target).forEach(key => {
      if (key.startsWith('_safeListeners_')) {
        const eventName = key.replace('_safeListeners_', '');
        cleanupEventListeners(target, eventName);
      }
    });
  }
}

/**
 * Make a function idempotent - safe to call multiple times
 * Uses a flag to prevent re-execution until cleanup
 * @param {Function} fn - Function to make idempotent
 * @param {string} key - Unique key for tracking initialization state
 * @param {Function} cleanupFn - Optional cleanup function to call before re-initialization
 * @returns {Function} Idempotent version of the function
 */
function makeIdempotent(fn, key = 'default', cleanupFn = null) {
  return function(...args) {
    const initKey = `_initialized_${key}`;
    const context = this;
    
    // If already initialized and no cleanup, skip
    if (context[initKey] && !cleanupFn) {
      return;
    }
    
    // If cleanup function provided, call it before re-initializing
    if (context[initKey] && cleanupFn) {
      cleanupFn.call(context, ...args);
    }
    
    // Mark as initialized and execute
    context[initKey] = true;
    return fn.apply(context, args);
  };
}

/**
 * Replace an element's event listeners by cloning it
 * Useful when you can't track individual listeners
 * @param {HTMLElement} element - Element to clean
 * @returns {HTMLElement} New element with no listeners
 */
function cleanElementListeners(element) {
  if (!element || !element.parentNode) return element;
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

// ES6 exports
export {
  getUrlParameter,
  formatCurrency,
  formatNumber,
  debounce,
  loadBlockHTML,
  loadBlockCSS,
  loadBlockJS,
  decorateBlock,
  parseHTML,
  parseHTMLFragment,
  safeAddEventListener,
  safeRemoveEventListener,
  cleanupEventListeners,
  makeIdempotent,
  cleanElementListeners
};

// CommonJS exports (for compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getUrlParameter,
    formatCurrency,
    formatNumber,
    debounce,
    loadBlockHTML,
    loadBlockCSS,
    loadBlockJS,
    decorateBlock,
    parseHTML,
    parseHTMLFragment,
    safeAddEventListener,
    safeRemoveEventListener,
    cleanupEventListeners,
    makeIdempotent,
    cleanElementListeners
  };
}

