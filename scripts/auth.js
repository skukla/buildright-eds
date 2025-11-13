/**
 * Authentication utilities
 * Handles login/logout state management
 */

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return localStorage.getItem('buildright_logged_in') === 'true';
}

/**
 * Get current user context
 * @returns {Object|null}
 */
export function getUserContext() {
  try {
    const context = localStorage.getItem('buildright_customer_context');
    return context ? JSON.parse(context) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Set user as logged in
 * @param {Object} userContext - User context object
 */
export function setLoggedIn(userContext) {
  localStorage.setItem('buildright_logged_in', 'true');
  if (userContext) {
    localStorage.setItem('buildright_customer_context', JSON.stringify(userContext));
  }
  
  // Dispatch login event
  window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userContext }));
}

/**
 * Logout user
 */
export function logout() {
  // Clear login state
  localStorage.removeItem('buildright_logged_in');
  
  // Optionally clear customer context (or keep it for next login)
  // localStorage.removeItem('buildright_customer_context');
  
  // Dispatch logout event
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
  
  // Redirect to home page
  window.location.href = 'index.html';
}

/**
 * Handle logout action
 * @param {Event} event - Click event
 */
export function handleLogout(event) {
  if (event) {
    event.preventDefault();
  }
  
  if (confirm('Are you sure you want to log out?')) {
    logout();
  }
}

