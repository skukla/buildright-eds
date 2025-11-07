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

// Get base URL for resolving relative paths using import.meta.url
const getScriptBaseUrl = (() => {
  try {
    // Use import.meta.url to get the current module's URL
    const scriptUrl = new URL(import.meta.url);
    // Get the directory containing this script (scripts/)
    const scriptsDir = scriptUrl.pathname.replace(/\/[^/]*$/, '/');
    // Go up one level to get the root directory
    return scriptUrl.origin + scriptsDir.replace(/\/scripts\/$/, '/');
  } catch (e) {
    // Fallback: use window location
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
    const blockPath = `${getScriptBaseUrl}blocks/${blockName}/${blockName}.js`;
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

// ES6 exports
export {
  getUrlParameter,
  formatCurrency,
  formatNumber,
  debounce,
  loadBlockHTML,
  loadBlockCSS,
  loadBlockJS,
  decorateBlock
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
    decorateBlock
  };
}

