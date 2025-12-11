/**
 * Auth Dropin Block
 * 
 * Renders Commerce Auth Dropin UI components (login form, register form, etc.)
 * Supports both guest and authenticated states.
 * 
 * Block variations:
 * - auth-dropin (default): Sign In form
 * - auth-dropin sign-in: Sign In form
 * - auth-dropin register: Registration form
 * - auth-dropin reset-password: Password reset form
 * - auth-dropin user-menu: User menu for header (shows name + logout)
 * 
 * @module blocks/auth-dropin
 */

import { loadConfig } from '../../scripts/site-config.js';

/**
 * Decorate the auth-dropin block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const config = await loadConfig();
  
  // Check if dropins are enabled
  if (!config.features?.useCommerceDropins) {
    console.log('[AuthDropin] Commerce Dropins not enabled, falling back to demo');
    await renderDemoMode(block);
    return;
  }
  
  // Determine which variant to render
  const variant = getBlockVariant(block);
  
  console.log('[AuthDropin] Rendering variant:', variant);
  
  // Wait for dropins to be initialized
  const { waitForDropins, areDropinsInitialized } = await import('../../scripts/initializers/index.js');
  
  if (!areDropinsInitialized()) {
    block.innerHTML = '<div class="auth-dropin-loading">Loading...</div>';
    await waitForDropins();
  }
  
  // Render the appropriate component
  switch (variant) {
    case 'register':
      await renderRegisterForm(block);
      break;
    case 'reset-password':
      await renderResetPasswordForm(block);
      break;
    case 'user-menu':
      await renderUserMenu(block);
      break;
    case 'sign-in':
    default:
      await renderSignInForm(block);
      break;
  }
}

/**
 * Get block variant from class names
 * @param {HTMLElement} block
 * @returns {string}
 */
function getBlockVariant(block) {
  if (block.classList.contains('register')) return 'register';
  if (block.classList.contains('reset-password')) return 'reset-password';
  if (block.classList.contains('user-menu')) return 'user-menu';
  if (block.classList.contains('sign-in')) return 'sign-in';
  return 'sign-in';
}

/**
 * Render the Sign In form using Auth Dropin
 * @param {HTMLElement} block
 */
async function renderSignInForm(block) {
  try {
    // The render export is an object with a render method
    const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
    const SignIn = (await import('@dropins/storefront-auth/containers/SignIn.js')).default;
    
    block.innerHTML = '';
    
    await authRenderer.render(SignIn, {
      routeForgotPassword: () => './reset-password.html',
      renderSignUpLink: true,
      routeSignUp: () => './signup.html',
      routeRedirectOnSignIn: () => {
        // Get redirect URL from session storage or default to dashboard
        const redirectUrl = sessionStorage.getItem('auth_redirect') || './dashboard.html';
        sessionStorage.removeItem('auth_redirect');
        return redirectUrl;
      },
      onSuccessCallback: () => {
        console.log('[AuthDropin] Sign in successful');
      },
      onErrorCallback: (error) => {
        console.error('[AuthDropin] Sign in error:', error);
      }
    })(block);
    
  } catch (error) {
    console.error('[AuthDropin] Failed to render SignIn:', error);
    await renderDemoMode(block);
  }
}

/**
 * Render the Registration form using Auth Dropin
 * @param {HTMLElement} block
 */
async function renderRegisterForm(block) {
  try {
    const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
    const SignUp = (await import('@dropins/storefront-auth/containers/SignUp.js')).default;
    
    block.innerHTML = '';
    
    await authRenderer.render(SignUp, {
      routeSignIn: () => './login.html',
      routeRedirectOnSignIn: () => './dashboard.html',
      onSuccessCallback: () => {
        console.log('[AuthDropin] Registration successful');
      },
      onErrorCallback: (error) => {
        console.error('[AuthDropin] Registration error:', error);
      }
    })(block);
    
  } catch (error) {
    console.error('[AuthDropin] Failed to render SignUp:', error);
    block.innerHTML = '<p class="error">Registration form unavailable. Please try again later.</p>';
  }
}

/**
 * Render the Reset Password form using Auth Dropin
 * @param {HTMLElement} block
 */
async function renderResetPasswordForm(block) {
  try {
    const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
    const ResetPassword = (await import('@dropins/storefront-auth/containers/ResetPassword.js')).default;
    
    block.innerHTML = '';
    
    await authRenderer.render(ResetPassword, {
      routeSignIn: () => './login.html',
      onSuccessCallback: () => {
        console.log('[AuthDropin] Password reset email sent');
      },
      onErrorCallback: (error) => {
        console.error('[AuthDropin] Password reset error:', error);
      }
    })(block);
    
  } catch (error) {
    console.error('[AuthDropin] Failed to render ResetPassword:', error);
    block.innerHTML = '<p class="error">Password reset form unavailable. Please try again later.</p>';
  }
}

/**
 * Render the User Menu (for header)
 * Shows user name and logout option when authenticated
 * @param {HTMLElement} block
 */
async function renderUserMenu(block) {
  const { isAuthenticated, getCurrentCustomer, logout } = await import('../../scripts/initializers/auth.js');
  
  block.innerHTML = '';
  
  if (isAuthenticated()) {
    const customer = getCurrentCustomer();
    const name = customer?.firstname || 'User';
    
    const menu = document.createElement('div');
    menu.className = 'auth-dropin-user-menu';
    menu.innerHTML = `
      <button class="user-menu-trigger" aria-expanded="false" aria-haspopup="true">
        <span class="user-name">${name}</span>
        <svg class="icon-chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      <div class="user-menu-dropdown" hidden>
        <a href="./account.html" class="menu-item">My Account</a>
        <a href="./order-history.html" class="menu-item">Order History</a>
        <hr>
        <button class="menu-item logout-btn">Sign Out</button>
      </div>
    `;
    
    // Set up event handlers
    const trigger = menu.querySelector('.user-menu-trigger');
    const dropdown = menu.querySelector('.user-menu-dropdown');
    const logoutBtn = menu.querySelector('.logout-btn');
    
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !isExpanded);
      dropdown.hidden = isExpanded;
    });
    
    logoutBtn.addEventListener('click', async () => {
      await logout();
      window.location.href = './login.html';
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.hidden = true;
      }
    });
    
    block.appendChild(menu);
  } else {
    // Show sign in link
    const signInLink = document.createElement('a');
    signInLink.href = './login.html';
    signInLink.className = 'auth-dropin-signin-link';
    signInLink.textContent = 'Sign In';
    block.appendChild(signInLink);
  }
}

/**
 * Render demo mode fallback (persona selector)
 * Used when Commerce Dropins are not enabled
 * @param {HTMLElement} block
 */
async function renderDemoMode(block) {
  const { PERSONAS } = await import('../../scripts/persona-config.js');
  const { authService } = await import('../../scripts/auth.js');
  
  block.innerHTML = '';
  block.classList.add('demo-mode');
  
  const container = document.createElement('div');
  container.className = 'auth-dropin-demo';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Sign In (Demo Mode)';
  container.appendChild(heading);
  
  const description = document.createElement('p');
  description.textContent = 'Select a persona to experience different customer views:';
  container.appendChild(description);
  
  const personaList = document.createElement('div');
  personaList.className = 'persona-list';
  
  Object.values(PERSONAS).forEach(persona => {
    const button = document.createElement('button');
    button.className = 'persona-button';
    button.innerHTML = `
      <span class="persona-name">${persona.name}</span>
      <span class="persona-role">${persona.role}</span>
    `;
    
    button.addEventListener('click', async () => {
      try {
        button.disabled = true;
        button.textContent = 'Signing in...';
        
        await authService.loginWithPersona(persona.id);
        
        // Redirect to persona's default route
        const redirectUrl = authService.getRedirectUrl();
        window.location.href = redirectUrl;
        
      } catch (error) {
        console.error('[AuthDropin] Demo login failed:', error);
        button.disabled = false;
        button.innerHTML = `
          <span class="persona-name">${persona.name}</span>
          <span class="persona-role">${persona.role}</span>
        `;
      }
    });
    
    personaList.appendChild(button);
  });
  
  container.appendChild(personaList);
  block.appendChild(container);
}

