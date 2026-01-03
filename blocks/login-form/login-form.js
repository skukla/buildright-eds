/**
 * Login Form Block
 * 
 * Provides dual-mode authentication:
 * 1. Email Login - Uses Commerce Auth Dropin API for real authentication
 * 2. Quick Login (Demo) - Uses persona-based demo authentication
 * 
 * @module blocks/login-form
 */

import { authService } from '../../scripts/auth.js';
import { PERSONAS } from '../../scripts/persona-config.js';
import { loadConfig } from '../../scripts/site-config.js';

/**
 * Security: Validate redirect URL to prevent open redirect attacks
 * Only allows relative URLs or same-origin URLs
 *
 * @param {string} url - URL to validate
 * @returns {string|null} Safe URL or null if invalid
 */
function getSafeRedirectUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const decoded = decodeURIComponent(url);

    // Security: Reject URLs with control characters (newlines, tabs, etc.)
    // These could be used for response splitting attacks
    if (/[\n\r\t]/.test(decoded)) {
      console.warn('[Login Form] Security: Rejected URL with control characters');
      return null;
    }

    // Allow relative URLs (starting with / but not //)
    if (decoded.startsWith('/') && !decoded.startsWith('//')) {
      return decoded;
    }

    // Check if same origin for absolute URLs
    const parsedUrl = new URL(decoded, window.location.origin);
    if (parsedUrl.origin === window.location.origin) {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    }

    // Reject external URLs
    console.warn('[Login Form] Security: Rejected external redirect URL:', decoded);
    return null;
  } catch (e) {
    console.warn('[Login Form] Security: Invalid redirect URL:', url);
    return null;
  }
}

/**
 * Demo account mapping: Email → Persona
 */
const DEMO_ACCOUNTS = {
  'sunbelt_homes': {
    email: 'sarah.martinez@sunbelthomes.com',
    name: 'Sarah Martinez',
    company: 'Sunbelt Homes',
    personaId: 'sarah'
  },
  'custom_builders': {
    email: 'marcus.johnson@custombuilders.com',
    name: 'Marcus Johnson',
    company: 'Custom Builders LLC',
    personaId: 'marcus'
  },
  'elite_remodeling': {
    email: 'lisa.chen@eliteremodeling.com',
    name: 'Lisa Chen',
    company: 'Elite Remodeling',
    personaId: 'lisa'
  },
  'thompson_residence': {
    email: 'david.thompson@gmail.com',
    name: 'David Thompson',
    company: 'Thompson Residence',
    personaId: 'david'
  },
  'precision_lumber': {
    email: 'kevin.rodriguez@precisionlumber.com',
    name: 'Kevin Rodriguez',
    company: 'Precision Lumber & Supply',
    personaId: 'kevin'
  }
};

/**
 * Decorate the login form block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  // Clear any existing content
  block.innerHTML = '';
  
  // Create the login card structure
  const cardSingle = document.createElement('div');
  cardSingle.className = 'login-card-single';
  
  const card = document.createElement('div');
  card.className = 'login-card';
  
  const cardBody = document.createElement('div');
  cardBody.className = 'login-card-body';
  
  // Create tabs
  const tabs = createTabs();
  cardBody.appendChild(tabs);
  
  // Create Email Login tab content
  const emailLogin = createEmailLoginTab();
  cardBody.appendChild(emailLogin);
  
  // Create Persona Login tab content
  const personaLogin = createPersonaLoginTab();
  cardBody.appendChild(personaLogin);
  
  // Create card footer
  const cardFooter = document.createElement('div');
  cardFooter.className = 'login-card-footer';
  cardFooter.innerHTML = `
    <p>
      Don't have an account? <a href="${window.BASE_PATH || ''}/pages/signup.html">Create an account</a>
    </p>
  `;
  
  // Assemble card
  card.appendChild(cardBody);
  card.appendChild(cardFooter);
  cardSingle.appendChild(card);
  block.appendChild(cardSingle);
  
  // Initialize functionality
  setupTabSwitching();
  setupEmailLogin();
  setupPersonaLogin();
}

/**
 * Create login method tabs
 * @returns {HTMLElement}
 */
function createTabs() {
  const tabs = document.createElement('div');
  tabs.className = 'login-tabs';
  
  tabs.innerHTML = `
    <button type="button" class="login-tab active" data-tab="email">
      Email Login
    </button>
    <button type="button" class="login-tab" data-tab="persona">
      Quick Login (Demo)
    </button>
  `;
  
  return tabs;
}

/**
 * Create Email Login tab content
 * @returns {HTMLElement}
 */
function createEmailLoginTab() {
  const tabContent = document.createElement('div');
  tabContent.id = 'email-login';
  tabContent.className = 'login-tab-content active';
  
  tabContent.innerHTML = `
    <form id="login-form">
      <div class="login-form-group">
        <label for="email" class="login-form-label">Email Address</label>
        <input type="email" id="email" class="login-form-input" required placeholder="your.email@company.com">
      </div>

      <div class="login-form-group">
        <label for="password" class="login-form-label">Password</label>
        <input type="password" id="password" class="login-form-input" required placeholder="Enter your password">
      </div>

      <div class="login-form-group">
        <div class="login-checkbox-group">
          <input type="checkbox" id="remember">
          <label for="remember">Remember me</label>
        </div>
      </div>

      <div class="login-form-group">
        <button type="submit" class="btn btn-cta btn-lg" style="width: 100%;">Login</button>
      </div>
    </form>
  `;
  
  return tabContent;
}

/**
 * Create Persona Login tab content
 * @returns {HTMLElement}
 */
function createPersonaLoginTab() {
  const tabContent = document.createElement('div');
  tabContent.id = 'persona-login';
  tabContent.className = 'login-tab-content';
  
  tabContent.innerHTML = `
    <div class="login-form-group">
      <label for="persona-select" class="login-form-label">Choose a Persona</label>
      <select id="persona-select" class="login-form-input">
        <option value="">-- Select a persona --</option>
      </select>
    </div>
    
    <div id="persona-info" class="persona-info" style="display: none;">
      <!-- Persona details will be shown here -->
    </div>
    
    <div class="login-form-group">
      <button id="quick-login-btn" class="btn btn-cta btn-lg" style="width: 100%;" disabled>
        Login as Selected Persona
      </button>
    </div>
  `;
  
  return tabContent;
}

/**
 * Set up tab switching functionality
 */
function setupTabSwitching() {
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update tab buttons
      document.querySelectorAll('.login-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
      });
      
      // Update tab content
      document.querySelectorAll('.login-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-login`);
      });
    });
  });
}

/**
 * Set up Email Login form
 */
function setupEmailLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    console.log('[Login Form] Email login submitted:', email);
    
    // Validate inputs
    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
      const config = await loadConfig();
      
      // Use Commerce Auth Dropin API for real authentication
      if (config.features?.useCommerceDropins) {
        const { getCustomerToken } = await import('@dropins/storefront-auth/api.js');
        
        console.log('[Login Form] Calling Commerce getCustomerToken');
        
        await getCustomerToken({
          email,
          password,
          onErrorCallback: (error) => {
            console.error('[Login Form] Commerce authentication error:', error);
            throw error;
          }
        });
        
        console.log('[Login Form] Commerce authentication successful');
        
        // The auth initializer will handle persona lookup via 'authenticated' event
        // Give it time to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for redirect parameter (with security validation)
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const safeRedirect = getSafeRedirectUrl(redirect);

        // Redirect to validated URL or default
        if (safeRedirect) {
          console.log('[Login Form] Redirecting to:', safeRedirect);
          window.location.href = safeRedirect;
        } else {
          console.log('[Login Form] Redirecting to homepage');
          window.location.href = window.BASE_PATH || '/';
        }
      } else {
        // Fallback to demo mode
        const emailLower = email.toLowerCase();
        const account = Object.values(DEMO_ACCOUNTS).find(
          acc => acc.email.toLowerCase() === emailLower
        );
        
        console.log('[Login Form] Demo account found:', account ? account.name : 'none');
        
        if (!account) {
          throw new Error('Account not found. Please check your email address.');
        }
        
        console.log('[Login Form] Calling loginWithPersona for:', account.personaId);
        const success = await authService.loginWithPersona(account.personaId);
        
        if (success) {
          console.log('[Login Form] Demo authentication successful as:', account.name);

          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          const safeRedirect = getSafeRedirectUrl(redirect);

          await new Promise(resolve => setTimeout(resolve, 100));

          if (safeRedirect) {
            window.location.href = safeRedirect;
          } else {
            window.location.href = window.BASE_PATH || '/';
          }
        } else {
          throw new Error('Login failed');
        }
      }
    } catch (error) {
      console.error('[Login Form] Error:', error);
      alert(error.message || 'Login failed. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Set up Persona Login functionality
 */
function setupPersonaLogin() {
  // Populate persona dropdown
  const select = document.getElementById('persona-select');
  if (!select) return;
  
  const personaOrder = ['sarah', 'marcus', 'lisa', 'david', 'kevin'];
  
  personaOrder.forEach(personaId => {
    const persona = Object.values(PERSONAS).find(p => p.id === personaId);
    if (!persona) return;
    
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = `${persona.name} - ${persona.role}`;
    select.appendChild(option);
  });
  
  // Handle persona selection change
  select.addEventListener('change', (e) => {
    const personaId = e.target.value;
    if (personaId) {
      showPersonaDetails(personaId);
    } else {
      hidePersonaDetails();
    }
  });
  
  // Handle quick login button
  const quickLoginBtn = document.getElementById('quick-login-btn');
  if (quickLoginBtn) {
    quickLoginBtn.addEventListener('click', handleQuickLogin);
  }
}

/**
 * Show persona details when selected
 * @param {string} personaId
 */
function showPersonaDetails(personaId) {
  const persona = Object.values(PERSONAS).find(p => p.id === personaId);
  const infoDiv = document.getElementById('persona-info');
  const loginBtn = document.getElementById('quick-login-btn');
  
  if (!persona || !infoDiv || !loginBtn) return;
  
  // Show persona details
  infoDiv.style.display = 'block';
  
  infoDiv.innerHTML = `
    <p class="persona-info-name">${persona.name}</p>
    <p class="persona-info-detail"><strong>Company:</strong> ${persona.company}</p>
    <p class="persona-info-detail"><strong>Role:</strong> ${persona.role}</p>
    <p class="persona-info-description">${persona.description}</p>
  `;
  
  // Enable login button
  loginBtn.disabled = false;
  loginBtn.textContent = `Login as ${persona.name.split(' ')[0]}`;
}

/**
 * Hide persona details
 */
function hidePersonaDetails() {
  const infoDiv = document.getElementById('persona-info');
  const loginBtn = document.getElementById('quick-login-btn');
  
  if (infoDiv) infoDiv.style.display = 'none';
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Login as Selected Persona';
  }
}

/**
 * Handle quick persona login
 */
async function handleQuickLogin() {
  const select = document.getElementById('persona-select');
  const loginBtn = document.getElementById('quick-login-btn');
  
  if (!select || !loginBtn) return;
  
  const personaId = select.value;
  if (!personaId) {
    alert('Please select a persona');
    return;
  }
  
  const originalText = loginBtn.textContent;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  
  try {
    console.log('[Login Form] Quick login as persona:', personaId);
    const success = await authService.loginWithPersona(personaId);
    
    if (success) {
      console.log('[Login Form] Quick login successful:', personaId);

      // Check for redirect parameter (with security validation)
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      const safeRedirect = getSafeRedirectUrl(redirect);

      // Get default route for persona
      const defaultRoute = authService.getDefaultRoute();
      console.log('[Login Form] Default route:', defaultRoute);

      // Small delay to ensure localStorage is saved
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to validated URL or default
      if (safeRedirect) {
        window.location.href = safeRedirect;
      } else {
        window.location.href = window.BASE_PATH || '/';
      }
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('[Login Form] Quick login error:', error);
    alert('Login failed. Please try again.');
    loginBtn.disabled = false;
    loginBtn.textContent = originalText;
  }
}

