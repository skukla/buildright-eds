// Wizard Utilities
// Shared utility functions for the Project Builder wizard

import { escapeHtml, WIZARD_CONSTANTS } from '../project-builder-constants.js';

/**
 * DOM element creation helper
 * @param {string} tag - HTML tag name
 * @param {Object} props - Element properties
 * @param {...any} children - Child elements
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  if (props.className) element.className = props.className;
  if (props.id) element.id = props.id;
  if (props.textContent !== undefined) element.textContent = props.textContent;
  if (props.innerHTML) element.innerHTML = props.innerHTML;
  if (props.dataset) Object.assign(element.dataset, props.dataset);
  if (props.style) Object.assign(element.style, props.style);
  if (props.type) element.type = props.type;
  if (props.checked !== undefined) element.checked = props.checked;
  if (props.href) element.href = props.href;
  if (props.placeholder) element.placeholder = props.placeholder;
  if (props.htmlFor) element.htmlFor = props.htmlFor;
  if (props.onclick) element.addEventListener('click', props.onclick);
  if (props.onerror) element.onerror = props.onerror;
  children.forEach(child => {
    if (child) element.appendChild(child);
  });
  return element;
}

/**
 * Parse HTML template string to DOM (reduces DOM manipulation)
 * @param {string} htmlString - HTML string to parse
 * @returns {HTMLElement}
 */
export function parseHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.firstElementChild || doc.body;
}

/**
 * Parse HTML template and return fragment (for multiple root elements)
 * @param {string} htmlString - HTML string to parse
 * @returns {DocumentFragment}
 */
export function parseHTMLFragment(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const fragment = document.createDocumentFragment();
  Array.from(doc.body.children).forEach(child => fragment.appendChild(child));
  return fragment;
}

/**
 * Format category name helper
 * @param {string} cat - Category name (snake_case)
 * @returns {string} Formatted category name
 */
export function formatCategoryName(cat) {
  return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Error handler utility
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  showToast('error', 'Error', error.message || 'An error occurred. Please try again.');
}

/**
 * Show toast notification using HTML template (reduces DOM manipulation)
 * @param {string} type - Toast type ('success', 'error', 'info')
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
export function showToast(type, title, message) {
  try {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };
    
    const icon = icons[type] || icons.info;
    const titleEscaped = escapeHtml(title);
    const messageEscaped = escapeHtml(message);
    
    const html = `
      <div class="toast ${type}">
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
          <div class="toast-title">${titleEscaped}</div>
          <div class="toast-message">${messageEscaped}</div>
        </div>
        <button class="toast-close">×</button>
      </div>
    `;
    
    const toast = parseHTML(html);
    
    // Add close button event listener
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.remove();
      });
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), WIZARD_CONSTANTS.TOAST_ANIMATION_DURATION);
      }
    }, WIZARD_CONSTANTS.TOAST_AUTO_REMOVE_DELAY);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}

