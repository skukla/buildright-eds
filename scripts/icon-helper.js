/**
 * Icon Helper Utility
 * Provides simple icon loading from Lucide icon library
 * 
 * Usage:
 *   import { createIcon } from './icon-helper.js';
 *   const icon = createIcon('check-circle', 'medium');
 *   container.appendChild(icon);
 */

const ICON_SIZES = {
  small: '16px',
  medium: '24px',
  large: '32px',
  xlarge: '48px'
};

/**
 * Create an icon element
 * 
 * @param {string} iconName - Name of the Lucide icon (e.g., 'check-circle')
 * @param {string} size - Size key ('small', 'medium', 'large', 'xlarge')
 * @returns {HTMLElement} Icon element
 */
export function createIcon(iconName, size = 'medium') {
  const iconSize = ICON_SIZES[size] || ICON_SIZES.medium;
  
  const iconEl = document.createElement('span');
  iconEl.className = `icon icon-${iconName} icon-${size}`;
  iconEl.setAttribute('role', 'img');
  iconEl.setAttribute('aria-label', iconName.replace(/-/g, ' '));
  
  // Create inline SVG use element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', iconSize);
  svg.setAttribute('height', iconSize);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  
  // Load icon SVG
  loadIconSVG(iconName, svg);
  
  iconEl.appendChild(svg);
  
  return iconEl;
}

/**
 * Load icon SVG content
 * 
 * @param {string} iconName - Icon name
 * @param {SVGElement} svg - SVG element to populate
 */
async function loadIconSVG(iconName, svg) {
  try {
    const basePath = window.BASE_PATH || '';
    const response = await fetch(`${basePath}/icons/lucide/${iconName}.svg`);
    
    if (!response.ok) {
      console.warn(`Icon not found: ${iconName}`);
      return;
    }
    
    const svgText = await response.text();
    
    // Parse SVG and extract paths
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const paths = doc.querySelectorAll('path, circle, rect, line, polyline, polygon');
    
    // Copy paths to our SVG
    paths.forEach(path => {
      svg.appendChild(path.cloneNode(true));
    });
  } catch (error) {
    console.error(`Error loading icon ${iconName}:`, error);
  }
}

/**
 * Icon name mappings for semantic names
 * Maps semantic names to actual Lucide icon names
 */
const ICON_MAPPINGS = {
  // Wizard/Progress icons
  'checkmark-circle': 'check-circle',
  'circle-filled': 'circle-dollar-sign',
  'circle-outline': 'circle-help',
  
  // Construction icons
  'blueprint': 'layout-grid',
  'project': 'building-2',
  'interior': 'home',
  
  // Commerce/Inventory icons
  'inventory-check': 'check-circle',
  'inventory-warning': 'triangle-alert',
  'inventory-error': 'circle-help',
  
  // General icons
  'loading': 'clock',
  'success': 'check-circle',
  'warning': 'triangle-alert',
  'error': 'circle-help',
  'info': 'circle-help'
};

/**
 * Create icon with semantic name mapping
 * 
 * @param {string} category - Icon category (ignored for now, for future expansion)
 * @param {string} semanticName - Semantic icon name
 * @param {string} size - Size key
 * @returns {HTMLElement} Icon element
 */
export function createIconMapped(category, semanticName, size = 'medium') {
  const actualIconName = ICON_MAPPINGS[semanticName] || semanticName;
  return createIcon(actualIconName, size);
}

// Export both as default for compatibility
export default {
  createIcon,
  createIconMapped
};

