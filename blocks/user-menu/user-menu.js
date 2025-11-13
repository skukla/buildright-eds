/**
 * User Menu Block
 * Displays user account menu with login/logout options
 */

export default async function decorate(block) {
  // Import dependencies
  const basePath = window.BASE_PATH || '/';
  const baseUrl = window.location.origin + basePath;
  const authModule = await import(new URL('scripts/auth.js', baseUrl).href);
  const { isLoggedIn, logout } = authModule;
  
  const dataMockModule = await import(new URL('scripts/data-mock.js', baseUrl).href);
  const { getCustomerContext } = dataMockModule;

  const loggedOutState = block.querySelector('.user-menu-logged-out');
  const loggedInState = block.querySelector('.user-menu-logged-in');
  const logoutBtn = block.querySelector('.user-menu-logout');

  /**
   * Update the menu based on login state
   */
  function updateMenuState() {
    const loggedIn = isLoggedIn();
    
    if (loggedIn) {
      loggedOutState.style.display = 'none';
      loggedInState.style.display = 'block';
      
      // Update user info
      const context = getCustomerContext();
      const userName = context.user || 'User';
      const companyName = context.companyName || 'Company';
      
      // Get initials from user name
      const initials = userName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      block.querySelector('.user-initials').textContent = initials;
      block.querySelector('.user-name').textContent = userName;
      block.querySelector('.user-company').textContent = companyName;
    } else {
      loggedOutState.style.display = 'block';
      loggedInState.style.display = 'none';
    }
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    logout();
    // Close the menu
    block.classList.remove('active');
    const toggle = document.getElementById('user-menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
    // Dispatch event for header to update
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }

  // Attach logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Initial state
  updateMenuState();

  // Listen for login/logout events
  window.addEventListener('userLoggedIn', updateMenuState);
  window.addEventListener('userLoggedOut', updateMenuState);
  window.addEventListener('storage', (e) => {
    if (e.key === 'buildright_logged_in') {
      updateMenuState();
    }
  });
}

