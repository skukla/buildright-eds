// Lucide Icons Utility Module
// Provides functions to load and use Lucide SVG icons

// Icon cache to avoid repeated fetches
const iconCache = new Map();

// Get base URL for resolving relative paths - EDS-compatible approach
const getScriptBaseUrl = (() => {
  // Check if running in EDS environment (Adobe Edge Delivery Services)
  if (window.hlx?.codeBasePath !== undefined) {
    return window.hlx.codeBasePath;
  }
  // Fallback: use import.meta.url for standalone/prototype mode
  try {
    const scriptUrl = new URL(import.meta.url);
    const scriptsDir = scriptUrl.pathname.replace(/\/[^/]*$/, '/');
    return scriptUrl.origin + scriptsDir.replace(/\/scripts\/$/, '/');
  } catch (e) {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  }
})();

/**
 * Get Lucide icon SVG content
 * @param {string} name - Icon name (e.g., 'chevron-down', 'shopping-cart')
 * @returns {Promise<string>} SVG markup as string
 */
async function getIcon(name) {
  // Check cache first
  if (iconCache.has(name)) {
    return iconCache.get(name);
  }

  try {
    // Construct path to icon file
    // Icons are stored in icons/lucide/{name}.svg
    const iconPath = `${getScriptBaseUrl}icons/lucide/${name}.svg`;
    
    const response = await fetch(iconPath);
    if (!response.ok) {
      throw new Error(`Icon not found: ${iconPath}`);
    }
    
    const svgContent = await response.text();
    
    // Cache the result
    iconCache.set(name, svgContent);
    
    return svgContent;
  } catch (error) {
    console.error(`Error loading icon ${name}:`, error);
    // Return a fallback empty SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=""/></svg>`;
  }
}

/**
 * Get Lucide icon SVG and insert it into an element
 * @param {HTMLElement|string} element - Target element or selector
 * @param {string} name - Icon name
 */
async function insertIcon(element, name) {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) {
    console.error(`Element not found: ${element}`);
    return;
  }
  
  const { parseHTML } = await import('./utils.js');
  const svgContent = await getIcon(name);
  const svgElement = parseHTML(svgContent);
  target.innerHTML = '';
  target.appendChild(svgElement);
}

/**
 * Create an icon element
 * @param {string} name - Icon name
 * @param {string} className - Additional CSS classes
 * @returns {Promise<HTMLElement>} SVG element
 */
async function createIconElement(name, className = '') {
  const { parseHTML } = await import('./utils.js');
  const svgContent = await getIcon(name);
  const svg = parseHTML(svgContent);
  
  if (className) {
    svg.className = className;
  }
  
  return svg;
}

// ES6 exports
export {
  getIcon,
  insertIcon,
  createIconElement
};

// CommonJS exports (for compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getIcon,
    insertIcon,
    createIconElement
  };
}

