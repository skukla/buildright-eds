/**
 * Loading Overlay Block
 * Shows loading state during async operations (especially CCDM filtering)
 * 
 * NOTE: This block uses a programmatic API pattern (not standard EDS)
 * because it's controlled by JavaScript for loading states, not author content.
 * Standard EDS blocks transform author-created content from Google Docs.
 * 
 * @param {HTMLElement} block The block element from the DOM
 * @returns {HTMLElement} The decorated block element
 */

export default function decorate(block) {
  try {
    // Create structure if not already present
    // NOTE: Non-standard pattern - justified for programmatic use
    if (!block.querySelector(':scope > .loading-spinner')) {
      block.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-message">Loading...</p>
        <div class="loading-details"></div>
      `;
    }
    
    /**
     * Show loading overlay with message
     * @param {string} message Main loading message
     * @param {string} details Optional details text
     */
    block.show = function(message, details = '') {
      try {
        const messageEl = this.querySelector(':scope > .loading-message');
        const detailsEl = this.querySelector(':scope > .loading-details');
        
        if (messageEl) messageEl.textContent = message;
        if (detailsEl) detailsEl.textContent = details;
        
        this.classList.add('active');
      } catch (error) {
        console.error('Error showing loading overlay:', error);
      }
    };
    
    /**
     * Hide loading overlay
     */
    block.hide = function() {
      try {
        this.classList.remove('active');
      } catch (error) {
        console.error('Error hiding loading overlay:', error);
      }
    };
    
    // Listen for loading events
    window.addEventListener('loading:start', (e) => {
      const { message, details } = e.detail || {};
      block.show(message || 'Loading...', details || '');
    });
    
    window.addEventListener('loading:end', () => {
      block.hide();
    });
    
    return block;
    
  } catch (error) {
    console.error('Error decorating loading-overlay block:', error);
    return block;
  }
}

/**
 * Helper function to trigger loading start event
 * @param {string} message Main loading message
 * @param {string} details Optional details text
 */
export function showLoading(message, details = '') {
  window.dispatchEvent(new CustomEvent('loading:start', {
    detail: { message, details }
  }));
}

/**
 * Helper function to trigger loading end event
 */
export function hideLoading() {
  window.dispatchEvent(new CustomEvent('loading:end'));
}
