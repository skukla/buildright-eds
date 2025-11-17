/**
 * Loading Overlay Block
 * Shows loading state during async operations (especially CCDM filtering)
 */

export default function decorate(block) {
  // Create structure if not already present
  if (!block.querySelector('.loading-spinner')) {
    block.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-message">Loading...</p>
      <div class="loading-details"></div>
    `;
  }
  
  // Add API for showing/hiding
  block.show = function(message, details = '') {
    const messageEl = this.querySelector('.loading-message');
    const detailsEl = this.querySelector('.loading-details');
    
    if (messageEl) messageEl.textContent = message;
    if (detailsEl) detailsEl.textContent = details;
    
    this.classList.add('active');
  };
  
  block.hide = function() {
    this.classList.remove('active');
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
}

/**
 * Helper functions for triggering loading states
 */
export function showLoading(message, details = '') {
  window.dispatchEvent(new CustomEvent('loading:start', {
    detail: { message, details }
  }));
}

export function hideLoading() {
  window.dispatchEvent(new CustomEvent('loading:end'));
}

