/**
 * Image Placeholder Utility
 * Handles failed image loads with a consistent placeholder pattern
 * 
 * Usage in HTML:
 *   <img src="..." onerror="handleImageError(this)">
 * 
 * Usage in JS:
 *   import { handleImageError, setupImagePlaceholders } from './image-placeholder.js';
 *   
 *   // Single image
 *   img.onerror = () => handleImageError(img);
 *   
 *   // All images in a container
 *   setupImagePlaceholders(container);
 */

/**
 * Handle a single image error
 * Hides the image and adds placeholder class to parent
 * @param {HTMLImageElement} img - The image element that failed to load
 */
export function handleImageError(img) {
  if (!img || !img.parentElement) return;
  
  // Hide the broken image
  img.style.display = 'none';
  
  // Add placeholder class to parent container
  img.parentElement.classList.add('image-placeholder');
}

/**
 * Setup error handlers for all images in a container
 * @param {HTMLElement} container - Container to find images in
 */
export function setupImagePlaceholders(container = document) {
  const images = container.querySelectorAll('img:not([data-placeholder-setup])');
  
  images.forEach(img => {
    img.dataset.placeholderSetup = 'true';
    
    // If image already failed (broken), handle it now
    if (img.complete && img.naturalWidth === 0) {
      handleImageError(img);
    } else {
      // Otherwise, setup error handler
      img.addEventListener('error', () => handleImageError(img));
    }
  });
}

/**
 * Initialize image placeholders globally
 * Call this once on page load
 */
export function initImagePlaceholders() {
  // Handle images that are already in the DOM
  setupImagePlaceholders(document);
  
  // Watch for new images added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node is an image
          if (node.tagName === 'IMG') {
            setupImagePlaceholders(node.parentElement);
          }
          // Check for images inside the added node
          else if (node.querySelectorAll) {
            setupImagePlaceholders(node);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Make handleImageError available globally for inline onerror handlers
if (typeof window !== 'undefined') {
  window.handleImageError = handleImageError;
}

