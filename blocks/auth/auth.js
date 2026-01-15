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
 *
 * Note: User menu is now a separate block (blocks/user-menu) as it doesn't use
 * the auth dropin - it's completely custom BuildRight UI.
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
 * Get block variant from class names
 * @param {HTMLElement} block
 * @returns {string} Variant name: 'sign-in', 'register', 'reset-password'
 */
function getBlockVariant(block) {
  // Check for specific variants
  if (block.classList.contains('register')) return 'register';
  if (block.classList.contains('reset-password')) return 'reset-password';
  if (block.classList.contains('sign-in')) return 'sign-in';
  return 'sign-in';
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
    onSuccessCallback: () => {
      log('Sign in successful');
      emitAuthEvent('auth:success', { action: 'sign-in' });
      // Persona initialization handled by auth initializer via 'authenticated' event
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
