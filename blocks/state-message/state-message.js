/**
 * State Message Block
 * 
 * Reusable component for displaying consistent state messages across the site.
 * Supports: error, success, empty, loading states
 * 
 * Usage:
 * ```html
 * <div class="state-message" 
 *      data-type="error"
 *      data-icon="alert-circle"
 *      data-title="Failed to Load"
 *      data-message="Unable to load content. Please try again."
 *      data-button-text="Try Again"
 *      data-button-href="/pages/catalog.html">
 * </div>
 * ```
 * 
 * Or programmatically:
 * ```javascript
 * import { createStateMessage } from './blocks/state-message/state-message.js';
 * 
 * block.innerHTML = '';
 * block.appendChild(createStateMessage({
 *   type: 'error',
 *   icon: 'alert-circle',
 *   title: 'Failed to Load',
 *   message: 'Unable to load content.',
 *   buttons: [
 *     { text: 'Try Again', href: '/pages/catalog.html', primary: true }
 *   ]
 * }));
 * ```
 * 
 * @module blocks/state-message
 */

/**
 * Available icon types
 */
const ICONS = {
  'alert-circle': `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  `,
  'x-circle': `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  `,
  'check-circle': `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  `,
  'shopping-cart': `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  `,
  'spinner': `
    <div class="loading-spinner"></div>
  `
};

/**
 * Create a state message element programmatically
 * @param {Object} options
 * @param {string} options.type - State type: 'error', 'success', 'empty', 'loading'
 * @param {string} options.icon - Icon key from ICONS
 * @param {string} options.title - Message title
 * @param {string} options.message - Message content (supports HTML)
 * @param {Array} options.buttons - Array of button configs: { text, href, onClick, primary }
 * @returns {HTMLElement}
 */
export function createStateMessage({ type = 'error', icon, title, message, buttons = [] }) {
  const container = document.createElement('div');
  container.className = `state-container ${type}-state`;
  
  // Add icon if provided
  if (icon && ICONS[icon]) {
    const iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = ICONS[icon];
    container.appendChild(iconWrapper.firstElementChild || iconWrapper);
  }
  
  // Add title
  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    container.appendChild(titleEl);
  }
  
  // Add message
  if (message) {
    const messageEl = document.createElement('p');
    messageEl.innerHTML = message; // Supports HTML like <strong>
    container.appendChild(messageEl);
  }
  
  // Add buttons
  if (buttons.length > 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;';
    
    buttons.forEach(btn => {
      if (btn.href) {
        const link = document.createElement('a');
        link.href = btn.href;
        link.className = btn.primary ? 'btn btn-primary' : 'btn btn-secondary';
        link.textContent = btn.text;
        buttonContainer.appendChild(link);
      } else if (btn.onClick) {
        const button = document.createElement('button');
        button.className = btn.primary ? 'btn btn-primary' : 'btn btn-secondary';
        button.textContent = btn.text;
        button.addEventListener('click', btn.onClick);
        buttonContainer.appendChild(button);
      }
    });
    
    container.appendChild(buttonContainer);
  }
  
  return container;
}

/**
 * Decorate the state-message block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const basePath = window.BASE_PATH || '/';
  
  // Read configuration from data attributes
  const type = block.dataset.type || 'error';
  const icon = block.dataset.icon || (type === 'error' ? 'x-circle' : 'alert-circle');
  const title = block.dataset.title || 'Error';
  const message = block.dataset.message || 'Something went wrong.';
  const buttonText = block.dataset.buttonText;
  const buttonHref = block.dataset.buttonHref;
  const buttonSecondaryText = block.dataset.buttonSecondaryText;
  const buttonSecondaryHref = block.dataset.buttonSecondaryHref;
  
  // Build buttons array
  const buttons = [];
  if (buttonText && buttonHref) {
    buttons.push({
      text: buttonText,
      href: buttonHref.startsWith('/') ? `${basePath}${buttonHref.slice(1)}` : buttonHref,
      primary: true
    });
  }
  if (buttonSecondaryText && buttonSecondaryHref) {
    buttons.push({
      text: buttonSecondaryText,
      href: buttonSecondaryHref.startsWith('/') ? `${basePath}${buttonSecondaryHref.slice(1)}` : buttonSecondaryHref,
      primary: false
    });
  }
  
  // Clear block and append state message
  block.innerHTML = '';
  block.appendChild(createStateMessage({ type, icon, title, message, buttons }));
}

