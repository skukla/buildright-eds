// Cart Notification - Show success notification when items are added to cart
// This notification appears to the right of the cart icon and provides immediate feedback
// without automatically opening the cart. Users can open the cart manually.

let activeNotification = null;

/**
 * Show cart notification near the cart icon
 * @param {string} productName - Name of the product added
 * @param {number} quantity - Quantity added
 */
export function showCartNotification(productName, quantity = 1) {
  // Remove any existing notification
  if (activeNotification && activeNotification.parentElement) {
    activeNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  
  // Build notification content
  notification.innerHTML = `
    <div class="cart-notification-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="cart-notification-content">
      <span class="cart-notification-text">
        <strong>${escapeHtml(productName)}</strong>
        ${quantity > 1 ? ` × ${quantity}` : ''}
        added
      </span>
    </div>
    <button class="cart-notification-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  
  // Adobe Best Practice: Positioning handled by pure CSS (top-right corner)
  // No JavaScript positioning needed
  
  // Add to DOM
  document.body.appendChild(notification);
  activeNotification = notification;
  
  // Trigger animation
  requestAnimationFrame(() => {
    notification.classList.add('active');
  });
  
  // Setup close button
  const closeBtn = notification.querySelector('.cart-notification-close');
  closeBtn.addEventListener('click', () => {
    dismissNotification(notification);
  });
  
  // Auto-dismiss after 2.5 seconds
  setTimeout(() => {
    dismissNotification(notification);
  }, 2500);
  
  // Adobe Best Practice: No resize listener needed
  // CSS positioning is viewport-independent
}

/**
 * Adobe Best Practice: Position notification function removed
 * Positioning now handled by pure CSS - see styles/components.css
 */

/**
 * Dismiss notification with animation
 */
function dismissNotification(notification) {
  if (!notification || !notification.parentElement) return;
  
  notification.classList.remove('active');
  
  // Remove from DOM after animation completes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
    if (activeNotification === notification) {
      activeNotification = null;
    }
  }, 300); // Match animation duration
}

/**
 * Show info notification (for general informational messages)
 * @param {string} message - The message to display
 * @param {number} duration - Duration in ms (default 4000)
 */
export function showInfoNotification(message, duration = 4000) {
  // Remove any existing notification
  if (activeNotification && activeNotification.parentElement) {
    activeNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification info';
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  
  // Build notification content with info icon
  notification.innerHTML = `
    <div class="cart-notification-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="cart-notification-content">
      <span class="cart-notification-text">${escapeHtml(message)}</span>
    </div>
    <button class="cart-notification-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  activeNotification = notification;
  
  // Trigger animation
  requestAnimationFrame(() => {
    notification.classList.add('active');
  });
  
  // Setup close button
  const closeBtn = notification.querySelector('.cart-notification-close');
  closeBtn.addEventListener('click', () => {
    dismissNotification(notification);
  });
  
  // Auto-dismiss
  setTimeout(() => {
    dismissNotification(notification);
  }, duration);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Initialize cart notification system
 */
export function initCartNotification() {
  // Module is ready to use on import
}

