/**
 * User Menu Block
 *
 * Renders authenticated user menu (name, account links, logout) or guest sign-in prompt.
 * This is a BuildRight custom block - NOT using the Auth dropin.
 * Used in the header for user account access.
 *
 * Why separate from Auth block:
 * - Auth block uses @dropins/storefront-auth (SignIn, SignUp, ResetPassword containers)
 * - User menu is completely custom BuildRight UI with no dropin involvement
 * - Separating them clarifies architecture and dropin inspector visibility
 *
 * Features:
 * - Reactive updates when auth state changes
 * - Shows authenticated user's name and initials
 * - Account link and logout button
 * - Guest state with login/signup CTAs
 * - Header context dropdown behavior
 *
 * @module blocks/user-menu
 */

import { loadConfig } from '../../scripts/site-config.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[UserMenu]', ...args);

/**
 * Emit custom auth events for cross-component communication
 * @param {string} eventName - Event name (auth:loading, auth:loaded, auth:error)
 * @param {Object} detail - Event detail payload
 */
function emitAuthEvent(eventName, detail = {}) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
  log(`Event emitted: ${eventName}`, detail);
}

/**
 * Wire up header context toggle for user menu dropdown
 * @param {HTMLElement} block - The block element
 */
function wireUpHeaderToggle(block) {
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const menu = block.querySelector('.user-menu-dropdown');

  if (!userMenuToggle || !menu) return;

  userMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = menu.classList.contains('active');
    menu.classList.toggle('active');
    userMenuToggle.setAttribute('aria-expanded', String(!isActive));
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!block.parentElement?.contains(e.target)) {
      userMenuToggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('active');
    }
  });
}

/**
 * Create loading state HTML
 * @param {string} message - Loading message to display
 * @returns {string} HTML string for loading state
 */
function createLoadingState(message = 'Loading...') {
  return `
    <div class="buildright-user-menu-loading">
      <div class="loading-spinner loading-spinner-sm"></div>
    </div>
  `;
}

/**
 * Decorate the user menu block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Check if Commerce Dropins are enabled (needed for auth state)
  if (!config.features?.useCommerceDropins) {
    log('Commerce Dropins not enabled - showing guest state');
  }

  // Show loading state initially
  block.innerHTML = createLoadingState();

  // Wait for dropins to initialize (needed for auth state)
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  // Import auth helpers
  const { isAuthenticated, getCurrentCustomer, logout } = await import('../../scripts/initializers/auth.js');
  const { events } = await import('@dropins/tools/event-bus.js');

  // Check if we're in header context (always true for this block)
  const isHeaderContext = block.dataset.headerContext === 'true';

  /**
   * Update the user menu based on current auth state
   * Extracted to allow re-rendering when auth state changes
   */
  function updateUserMenu() {
    log('Updating UserMenu, authenticated:', isAuthenticated());

    // Clear current content
    block.innerHTML = '';

    if (isAuthenticated()) {
      const customer = getCurrentCustomer();
      // Note: Dropin returns camelCase (firstName, lastName), not lowercase
      const firstname = customer?.firstName || 'User';
      const lastname = customer?.lastName || '';
      const fullName = `${firstname} ${lastname}`.trim();
      const company = customer?.company || '';

      // Get initials for avatar
      const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase() || '--';

      if (isHeaderContext) {
        // Update header button label
        const userLabel = document.querySelector('.user-label');
        if (userLabel) {
          userLabel.textContent = firstname;
        }
      }

      // Render user menu - Security: Use textContent for user-controlled data to prevent XSS
      const menuWrapper = document.createElement('div');
      menuWrapper.className = 'buildright-user-menu user-menu-dropdown';

      // Build static HTML structure (no user data)
      menuWrapper.innerHTML = `
        <div class="user-menu-logged-in">
          <div class="user-menu-header">
            <div class="user-menu-greeting">
              <div class="user-avatar">
                <span class="user-initials"></span>
              </div>
              <div class="user-info">
                <div class="user-name"></div>
                <div class="user-company"></div>
              </div>
            </div>
          </div>
          <div class="user-menu-content">
            <a href="${basePath}pages/account.html" class="user-menu-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>My Account</span>
            </a>
            <button class="user-menu-link user-menu-logout" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      `;

      // Safely insert user-controlled data using textContent (prevents XSS)
      menuWrapper.querySelector('.user-initials').textContent = initials;
      menuWrapper.querySelector('.user-name').textContent = fullName;
      menuWrapper.querySelector('.user-company').textContent = company || 'BuildRight Customer';

      block.appendChild(menuWrapper);

      // Wire up logout button
      const logoutBtn = block.querySelector('.user-menu-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          log('Logout clicked');
          await logout();

          // Clear persona context and reset to guest
          sessionStorage.removeItem('buildright_persona');
          sessionStorage.removeItem('buildright_persona_headers');

          // Emit logout event
          document.dispatchEvent(new CustomEvent('buildright:auth-changed', {
            detail: { authenticated: false, action: 'logout' },
          }));

          window.location.href = `${basePath}pages/login.html`;
        });
      }

      // Wire up toggle if in header context
      if (isHeaderContext) {
        wireUpHeaderToggle(block);
      }
    } else {
      // Not authenticated - show sign in prompt
      block.innerHTML = `
        <div class="buildright-user-menu user-menu-dropdown">
          <div class="user-menu-logged-out">
            <div class="user-menu-header">
              <h3 class="user-menu-title">Welcome to BuildRight</h3>
            </div>
            <div class="user-menu-content">
              <a href="${basePath}pages/login.html" class="btn btn-cta btn-sm user-menu-action">
                Login
              </a>
              <a href="${basePath}pages/signup.html" class="btn btn-secondary btn-sm user-menu-action">
                Create Account
              </a>
            </div>
          </div>
        </div>
      `;

      // Wire up toggle if in header context
      if (isHeaderContext) {
        wireUpHeaderToggle(block);
      }
    }

    emitAuthEvent('user-menu:loaded', { authenticated: isAuthenticated() });
  }

  // Listen to BuildRight auth events (dispatched by auth initializer AFTER customer data is set)
  // These are the reliable events for UI updates - they fire after _currentCustomer is populated
  window.addEventListener('auth:login', () => {
    log('auth:login event - customer data ready, updating menu');
    updateUserMenu();
  });

  window.addEventListener('auth:logout', () => {
    log('auth:logout event - updating menu to guest state');
    updateUserMenu();
  });

  // Also subscribe to dropin event bus with { eager: true } for initial state
  // This handles the case where auth state was determined before this component loaded
  events.on('authenticated', (isAuth) => {
    log('Dropin authenticated event:', isAuth);
    // Only update on false (logout) - for true, we wait for auth:login which has customer data
    if (!isAuth) {
      updateUserMenu();
    }
  }, { eager: true });

  // Initial render
  log('UserMenu initialized');
  updateUserMenu();
}
