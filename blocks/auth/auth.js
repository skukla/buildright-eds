/**
 * Auth Block
 *
 * Renders authentication UI using @dropins/storefront-auth with BuildRight slot customization.
 * Routes through mesh adapter (dropin-auth.js) for extensibility control.
 *
 * Follows the canonical slot pattern from cart.js and checkout.js:
 * - Adobe dropin handles data fetching, state management
 * - BuildRight controls visual presentation via slot callbacks
 * - Mesh adapter intercepts mutations for extensibility
 *
 * Block Variants:
 * - auth (default): Sign In form
 * - auth sign-in: Sign In form
 * - auth register: Registration form
 * - auth reset-password: Password reset form
 * - auth user-menu: User menu for header (shows name + logout)
 *
 * @module blocks/auth
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[Auth]', ...args);

/**
 * Create loading state HTML with accessible text
 * @param {string} message - Loading message to display
 * @returns {string} HTML string for loading state
 */
function createLoadingState(message = 'Loading...') {
  return `
    <div class="buildright-auth-loading">
      <div class="loading-spinner loading-spinner-lg"></div>
      <p class="buildright-auth-loading-text">${message}</p>
    </div>
  `;
}

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
 * Get block variant from class names or context
 * @param {HTMLElement} block
 * @returns {string} Variant name: 'sign-in', 'register', 'reset-password', 'user-menu'
 */
function getBlockVariant(block) {
  // Check for header context first
  if (block.dataset.headerContext === 'true') return 'user-menu';

  // Check for specific variants
  if (block.classList.contains('register')) return 'register';
  if (block.classList.contains('reset-password')) return 'reset-password';
  if (block.classList.contains('user-menu')) return 'user-menu';
  if (block.classList.contains('sign-in')) return 'sign-in';
  return 'sign-in';
}

/**
 * Wire up header context toggle for user menu dropdown
 * Extracted helper to avoid duplication between authenticated/guest states
 * @param {HTMLElement} block - The block element
 */
function wireUpHeaderToggle(block) {
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const menu = block.querySelector('.user-menu');

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
 * Subscribe to auth events and propagate state changes
 */
async function subscribeToAuthEvents() {
  try {
    const { events } = await import('@dropins/tools/event-bus.js');

    events.on('authenticated', (isAuthenticated) => {
      log('Authentication state changed:', isAuthenticated);

      // Emit BuildRight custom event for other blocks to consume
      document.dispatchEvent(new CustomEvent('buildright:auth-changed', {
        detail: {
          authenticated: isAuthenticated,
          timestamp: Date.now(),
        },
      }));
    });

    log('Auth event subscriptions registered');
  } catch (error) {
    console.error('[Auth] Failed to subscribe to auth events:', error);
  }
}

/**
 * Render the Sign In form using Auth Dropin
 * @param {HTMLElement} block
 * @param {string} basePath
 */
async function renderSignInForm(block, basePath) {
  // Parallel imports for performance
  const [{ render }, { default: SignIn }] = await Promise.all([
    import('@dropins/storefront-auth/render.js'),
    import('@dropins/storefront-auth/containers/SignIn.js'),
  ]);

  log('Rendering SignIn form');

  // Clear loading state
  block.innerHTML = '';

  // Add BuildRight wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'buildright-auth-form';
  block.appendChild(wrapper);

  await render.render(SignIn, {
    routeForgotPassword: () => `${basePath}pages/reset-password.html`,
    renderSignUpLink: true,
    routeSignUp: () => `${basePath}pages/signup.html`,
    routeRedirectOnSignIn: () => {
      // Get redirect URL from session storage or default to dashboard
      const redirectUrl = sessionStorage.getItem('auth_redirect') || `${basePath}pages/dashboard.html`;
      sessionStorage.removeItem('auth_redirect');
      return redirectUrl;
    },
    onSuccessCallback: async () => {
      log('Sign in successful');
      emitAuthEvent('auth:success', { action: 'sign-in' });

      // Initialize persona for authenticated user
      try {
        const { getCurrentCustomer } = await import('../../scripts/initializers/auth.js');
        const customer = getCurrentCustomer();
        if (customer?.email) {
          const { initializeMeshForEmail } = await import('../../scripts/services/mesh-integration.js');
          await initializeMeshForEmail(customer.email);
          log('Persona initialized for:', customer.email);
        }
      } catch (personaError) {
        log('Persona initialization failed:', personaError.message);
      }
    },
    onErrorCallback: (error) => {
      console.error('[Auth] Sign in error:', error);
      emitAuthEvent('auth:error', { action: 'sign-in', error: error?.message });
    },
  })(wrapper);

  log('SignIn form rendered successfully');
  emitAuthEvent('auth:loaded', { variant: 'sign-in' });
}

/**
 * Render the Registration form using Auth Dropin
 * @param {HTMLElement} block
 * @param {string} basePath
 */
async function renderRegisterForm(block, basePath) {
  // Parallel imports for performance
  const [{ render }, { default: SignUp }] = await Promise.all([
    import('@dropins/storefront-auth/render.js'),
    import('@dropins/storefront-auth/containers/SignUp.js'),
  ]);

  log('Rendering SignUp form');

  // Clear loading state
  block.innerHTML = '';

  // Add BuildRight wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'buildright-auth-register';
  block.appendChild(wrapper);

  await render.render(SignUp, {
    routeSignIn: () => `${basePath}pages/login.html`,
    routeRedirectOnSignIn: () => `${basePath}pages/dashboard.html`,
    onSuccessCallback: () => {
      log('Registration successful');
      emitAuthEvent('auth:success', { action: 'register' });
    },
    onErrorCallback: (error) => {
      console.error('[Auth] Registration error:', error);
      emitAuthEvent('auth:error', { action: 'register', error: error?.message });
    },
  })(wrapper);

  log('SignUp form rendered successfully');
  emitAuthEvent('auth:loaded', { variant: 'register' });
}

/**
 * Render the Reset Password form using Auth Dropin
 * @param {HTMLElement} block
 * @param {string} basePath
 */
async function renderResetPasswordForm(block, basePath) {
  // Parallel imports for performance
  const [{ render }, { default: ResetPassword }] = await Promise.all([
    import('@dropins/storefront-auth/render.js'),
    import('@dropins/storefront-auth/containers/ResetPassword.js'),
  ]);

  log('Rendering ResetPassword form');

  // Clear loading state
  block.innerHTML = '';

  // Add BuildRight wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'buildright-auth-reset';
  block.appendChild(wrapper);

  await render.render(ResetPassword, {
    routeSignIn: () => `${basePath}pages/login.html`,
    onSuccessCallback: () => {
      log('Password reset email sent');
      emitAuthEvent('auth:success', { action: 'reset-password' });
    },
    onErrorCallback: (error) => {
      console.error('[Auth] Password reset error:', error);
      emitAuthEvent('auth:error', { action: 'reset-password', error: error?.message });
    },
  })(wrapper);

  log('ResetPassword form rendered successfully');
  emitAuthEvent('auth:loaded', { variant: 'reset-password' });
}

/**
 * Render the User Menu (for header)
 * BuildRight Pattern: Updates the existing custom button and populates the dropdown
 * @param {HTMLElement} block
 * @param {string} basePath
 */
async function renderUserMenu(block, basePath) {
  const { isAuthenticated, getCurrentCustomer, logout } = await import('../../scripts/initializers/auth.js');

  log('Rendering UserMenu');

  // Clear loading state
  block.innerHTML = '';

  // Check if we're in header context (BuildRight's custom design)
  const isHeaderContext = block.dataset.headerContext === 'true';

  if (isAuthenticated()) {
    const customer = getCurrentCustomer();
    const firstname = customer?.firstname || 'User';
    const lastname = customer?.lastname || '';
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
    menuWrapper.className = 'buildright-auth-user-menu user-menu';

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
      <div class="buildright-auth-user-menu user-menu">
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

  log('UserMenu rendered successfully');
  emitAuthEvent('auth:loaded', { variant: 'user-menu', authenticated: isAuthenticated() });
}

/**
 * Decorate the auth block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    log('Commerce Dropins not enabled in config');
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Commerce Dropins Not Enabled',
      message: 'Please enable Commerce Dropins to use authentication.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
        { text: 'Home', href: `${basePath}` },
      ],
    }));
    return;
  }

  // Determine which variant to render
  const variant = getBlockVariant(block);
  log('Rendering variant:', variant);

  // Show loading state immediately - emit loading event
  emitAuthEvent('auth:loading', { variant });
  block.innerHTML = createLoadingState('Preparing authentication...');

  // Wait for dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  // Subscribe to auth events for state propagation
  await subscribeToAuthEvents();

  try {
    // Render the appropriate component
    switch (variant) {
      case 'register':
        await renderRegisterForm(block, basePath);
        break;
      case 'reset-password':
        await renderResetPasswordForm(block, basePath);
        break;
      case 'user-menu':
        await renderUserMenu(block, basePath);
        break;
      case 'sign-in':
      default:
        await renderSignInForm(block, basePath);
        break;
    }
  } catch (error) {
    console.error('[Auth] Failed to render:', error);

    // Emit error event
    emitAuthEvent('auth:error', { variant, error: error.message });

    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Unable to Load Authentication',
      message: 'We couldn\'t load the authentication form. Please try again or browse our catalog.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
        { text: 'Home', href: `${basePath}` },
      ],
    }));
  }
}
