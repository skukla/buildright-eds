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

// Load block HTML
async function loadBlockHTML(blockName) {
  try {
    const response = await fetch(`/blocks/${blockName}/${blockName}.html`);
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
  link.href = `/blocks/${blockName}/${blockName}.css`;
  document.head.appendChild(link);
}

// Load block JS
async function loadBlockJS(blockName) {
  try {
    const module = await import(`/blocks/${blockName}/${blockName}.js`);
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

