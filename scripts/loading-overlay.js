/**
 * Global loading overlay helper
 * Manages the full-page blocking overlay with standard spinner
 */

/**
 * Show the loading overlay
 * @param {Object} options - Configuration
 * @param {string} options.title - Main message (default: "Loading...")
 * @param {string} options.subtitle - Optional secondary message
 */
export function showLoadingOverlay(options = {}) {
  let overlay = document.querySelector('.loading-overlay');
  
  if (!overlay) {
    overlay = createLoadingOverlay();
  }
  
  const title = overlay.querySelector('h3');
  const subtitle = overlay.querySelector('p');
  
  if (title) {
    title.textContent = options.title || 'Loading...';
  }
  
  if (subtitle) {
    subtitle.textContent = options.subtitle || '';
    subtitle.style.display = options.subtitle ? 'block' : 'none';
  }
  
  overlay.dataset.visible = 'true';
  document.body.style.overflow = 'hidden';
}

/**
 * Hide the loading overlay
 */
export function hideLoadingOverlay() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.dataset.visible = 'false';
    document.body.style.overflow = '';
  }
}

/**
 * Create the overlay HTML structure
 * @returns {HTMLElement}
 */
function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.dataset.visible = 'false';
  
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <h3>Loading...</h3>
      <p></p>
    </div>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}
