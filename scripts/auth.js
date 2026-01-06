/**
 * Authentication System
 * 
 * Supports multiple authentication modes:
 * - DEMO MODE: Select persona from login page (default for development)
 * - DROPIN MODE: Use Adobe Commerce Auth Dropin (for real Commerce integration)
 * - HYBRID MODE: Demo UI with real Commerce backend calls
 * 
 * Mode is determined by config.features.useDemoAuth in /config/env.json
 * 
 * This file handles both modes with clear separation for easy transition.
 */

import { getPersona, PERSONAS, isValidPersona } from './persona-config.js';
import { acoService } from './aco-service.js';
import { getCompanyForPersona, getDefaultLocation } from './company-config.js';
import { initializeMeshForPersona } from './services/mesh-integration.js';
import { catalogService } from './services/catalog-service.js';
import { loadConfig } from './site-config.js';

const AUTH_STORAGE_KEY = 'buildright_auth';
const PERSONA_STORAGE_KEY = 'currentPersona';

// Track if dropins are being used
let _useDropins = false;

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isDemo = true; // Default to demo, can be overridden by config
    this.initialized = false;
    this._initializing = null; // Promise to prevent race conditions
  }

  /**
   * Initialize auth service
   * Checks for existing session and restores user state
   * Determines mode from config.features.useDemoAuth
   */
  async initialize() {
    // Already initialized - return immediately
    if (this.initialized) return;

    // Initialization in progress - wait for existing promise
    if (this._initializing) {
      return this._initializing;
    }

    // Start initialization and store the promise
    this._initializing = this._doInitialize();

    try {
      await this._initializing;
    } finally {
      this._initializing = null;
    }
  }

  /**
   * Internal initialization logic
   * @private
   */
  async _doInitialize() {
    console.log('[Auth] Initializing...');

    // Load config to determine mode
    try {
      const config = await loadConfig();
      this.isDemo = config.features?.useDemoAuth !== false;
      _useDropins = config.features?.useCommerceDropins === true;

      console.log('[Auth] Mode:', this.isDemo ? 'demo' : 'production',
                  ', Dropins:', _useDropins ? 'enabled' : 'disabled');
    } catch (error) {
      console.warn('[Auth] Failed to load config, using demo mode:', error.message);
      this.isDemo = true;
    }

    if (this.isDemo) {
      await this._initializeDemoMode();
    } else {
      await this._initializeProductionMode();
    }

    // Set up event listeners for dropin events if dropins are enabled
    if (_useDropins) {
      this._setupDropinEventListeners();
    }

    this.initialized = true;
  }
  
  /**
   * Set up event listeners for Commerce Dropin events
   * Bridges dropin auth events with BuildRight auth state
   * @private
   */
  _setupDropinEventListeners() {
    // Listen for dropin auth:login events (from auth.js initializers)
    window.addEventListener('auth:login', (event) => {
      if (event.detail?.user && !this.currentUser) {
        console.log('[Auth] Received dropin login event');
        // Persona comes directly from mesh - includes features, preferences, company
        this.currentUser = {
          ...event.detail.user,
          isDropinUser: true
          // persona is already in event.detail.user from mesh
        };
      }
    });
    
    // Listen for dropin auth:logout events
    window.addEventListener('auth:logout', (event) => {
      if (this.currentUser?.isDropinUser) {
        console.log('[Auth] Received dropin logout event');
        this.currentUser = null;
      }
    });
    
    console.log('[Auth] Dropin event listeners set up');
  }
  
  /**
   * Demo mode: Load persona from localStorage
   * @private
   */
  async _initializeDemoMode() {
    const personaId = localStorage.getItem(PERSONA_STORAGE_KEY);
    
    if (personaId && isValidPersona(personaId)) {
      const persona = getPersona(personaId);
      
      // Get ACO context for persona
      const acoContext = await acoService.getUserContext(persona.id);
      
      // Initialize mesh with persona (for real ACO API access)
      let meshData = null;
      try {
        meshData = await initializeMeshForPersona(persona.id);
      } catch (error) {
        console.warn('[Auth Demo] Mesh initialization failed on restore:', error.message);
      }
      
      this.currentUser = {
        id: persona.id,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        company: persona.company,
        customerGroup: persona.customerGroup,
        persona,
        acoContext,
        meshData
      };
      
      console.log('[Auth Demo] Restored session:', persona.name);
    } else {
      console.log('[Auth Demo] No active session');
    }
  }
  
  /**
   * Production mode: Use Commerce Auth Dropin
   * Initializes dropins and waits for auth state to be fully resolved
   * @private
   */
  async _initializeProductionMode() {
    console.log('[Auth] Initializing production mode with Commerce Dropins');
    
    if (!_useDropins) {
      console.log('[Auth] Dropins not enabled, skipping production init');
      return;
    }
    
    try {
      // Wait for dropins to be initialized
      const { waitForDropins, areDropinsInitialized, waitForAuthResolved } = await import('./initializers/index.js');
      
      if (!areDropinsInitialized()) {
        console.log('[Auth] Waiting for dropins to initialize...');
        await waitForDropins();
      }
      
      // Wait for auth state to be fully resolved (including persona fetch)
      // This ensures personalization has access to complete user data
      console.log('[Auth] Waiting for auth state to resolve...');
      const user = await waitForAuthResolved();
      
      if (user) {
        // User authenticated - set from auth:login event data
        // Persona comes directly from mesh with features, preferences, company
        this.currentUser = {
          ...user,
          isDropinUser: true
          // persona is already in user from mesh
        };
        console.log('[Auth] Session restored:', this.currentUser.name, 
          'persona:', user.persona?.id || 'unknown',
          'features:', user.persona?.features ? 'loaded' : 'none');
      } else {
        console.log('[Auth] No active Commerce session (guest)');
      }
    } catch (error) {
      console.error('[Auth] Failed to initialize production mode:', error);
    }
  }
  
  /**
   * Login with persona (demo mode)
   * 
   * @param {string} personaId - Persona ID (e.g., 'sarah', 'marcus')
   * @returns {Promise<Object>} User object
   */
  async loginWithPersona(personaId) {
    if (!this.isDemo) {
      throw new Error('loginWithPersona only available in demo mode');
    }
    
    if (!isValidPersona(personaId)) {
      throw new Error(`Invalid persona: ${personaId}`);
    }
    
    const persona = getPersona(personaId);
    
    console.log('[Auth Demo] Logging in as:', persona.name);
    
    // Store persona selection
    localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
    
    // Get ACO context for persona
    const acoContext = await acoService.getUserContext(persona.id);
    
    // Initialize mesh with persona (for real ACO API access)
    // This sets up the proper headers for catalog/pricing queries
    let meshData = null;
    try {
      meshData = await initializeMeshForPersona(persona.id);
      console.log('[Auth Demo] Mesh initialized:', meshData?.mesh ? 'connected' : 'fallback');
    } catch (error) {
      console.warn('[Auth Demo] Mesh initialization failed, using fallback:', error.message);
    }
    
    // Set current user
    this.currentUser = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      company: persona.company,
      customerGroup: persona.customerGroup,
      persona,
      acoContext,
      meshData
    };
    
    // Set customer context for location and pricing
    const customerContext = {
      tier: persona.customerGroup || 'base',
      isLoggedIn: true
    };
    
    // If persona has a company with locations, add company and location data
    const company = getCompanyForPersona(persona);
    if (company) {
      const defaultLocation = getDefaultLocation(company.id);
      if (defaultLocation) {
        customerContext.company = company.id;
        customerContext.location_id = defaultLocation.id;
        customerContext.region = defaultLocation.region;
      }
    }
    
    localStorage.setItem('buildright_customer_context', JSON.stringify(customerContext));
    
    // Dispatch login event for UI updates
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { user: this.currentUser }
    }));
    
    console.log('[Auth Demo] Login successful:', {
      persona: persona.name,
      customerGroup: persona.customerGroup
    });
    
    return this.currentUser;
  }
  
  /**
   * Login with credentials (production mode)
   * 
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User object
   */
  async login(credentials) {
    if (this.isDemo) {
      throw new Error('Use loginWithPersona in demo mode');
    }
    
    // TODO: Implement Commerce Auth Dropin login
    // Example implementation:
    /*
    try {
      const authDropin = window.commerce?.auth;
      const user = await authDropin.login(credentials);
      
      this.currentUser = {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        customerGroup: user.group_id,
        commerceUser: user
      };
      
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { user: this.currentUser }
      }));
      
      console.log('[Auth] Login successful:', this.currentUser.name);
      
      return this.currentUser;
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
    */
    
    console.log('[Auth] Production login not yet implemented');
    throw new Error('Production login not yet implemented');
  }
  
  /**
   * Logout
   * Clears session and redirects to login
   */
  async logout() {
    console.log('[Auth] Logging out...');
    
    if (this.isDemo) {
      localStorage.removeItem(PERSONA_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      // TODO: Call Auth Dropin logout
      // await window.commerce?.auth?.logout();
    }
    
    // Clear persona cache from sessionStorage (used by mesh-client)
    sessionStorage.removeItem('buildright_persona');
    sessionStorage.removeItem('buildright_persona_headers');
    sessionStorage.removeItem('buildright_persona_email');
    
    // Reset and reinitialize catalog service with guest persona
    catalogService.reset();
    try {
      await catalogService.initialize('guest');
      console.log('[Auth] Reinitialized catalog service with guest persona');
    } catch (error) {
      console.error('[Auth] Failed to reinitialize catalog service:', error);
    }
    
    const previousUser = this.currentUser;
    this.currentUser = null;
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { previousUser }
    }));
    
    console.log('[Auth] Logout successful');
  }
  
  /**
   * Check if user is authenticated
   * 
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }
  
  /**
   * Get current user
   * 
   * @returns {Object|null} Current user object or null
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Get customer group
   * 
   * @returns {string|null} Customer group ID
   */
  getCustomerGroup() {
    return this.currentUser?.customerGroup || null;
  }
  
  /**
   * Get persona (demo mode)
   * 
   * @returns {Object|null} Persona object or null
   */
  getPersona() {
    return this.currentUser?.persona || null;
  }
  
  /**
   * Get ACO context
   * 
   * @returns {Object|null} ACO context object or null
   */
  getAcoContext() {
    return this.currentUser?.acoContext || null;
  }
  
  /**
   * Check if user has feature access
   * 
   * @param {string} feature - Feature key
   * @returns {boolean} True if user has access
   */
  hasFeature(feature) {
    if (!this.currentUser?.persona) {
      return false;
    }
    
    return this.currentUser.persona.features[feature] === true;
  }
  
  /**
   * Get user preference
   * 
   * @param {string} prefKey - Preference key
   * @returns {*} Preference value or undefined
   */
  getPreference(prefKey) {
    if (!this.currentUser?.persona) {
      return undefined;
    }
    
    return this.currentUser.persona.preferences[prefKey];
  }
  
  /**
   * Require authentication (redirect if not authenticated)
   * Call this at the top of protected pages
   * 
   * @param {string} redirectUrl - URL to redirect to after login (optional)
   * @returns {boolean} True if authenticated, false if redirecting
   */
  requireAuth(redirectUrl = null) {
    if (!this.isAuthenticated()) {
      // Store intended destination
      if (redirectUrl) {
        sessionStorage.setItem('auth_redirect', redirectUrl);
      } else {
        sessionStorage.setItem('auth_redirect', window.location.href);
      }
      
      // Redirect to login
      console.log('[Auth] Not authenticated, redirecting to login');
      window.location.href = `${window.BASE_PATH || '/'}pages/login.html`;
      return false;
    }
    
    return true;
  }
  
  /**
   * Get redirect URL after login
   * 
   * @returns {string} URL to redirect to
   */
  getRedirectUrl() {
    const stored = sessionStorage.getItem('auth_redirect');
    sessionStorage.removeItem('auth_redirect');
    
    if (stored && stored !== '/pages/login.html') {
      return stored;
    }
    
    // Default to persona's default route
    if (this.currentUser?.persona) {
      return this.currentUser.persona.defaultRoute;
    }
    
    return '/pages/dashboard.html';
  }
  
  /**
   * Switch persona (demo mode only)
   * Useful for testing different personas
   * 
   * @param {string} personaId - New persona ID
   * @returns {Promise<Object>} New user object
   */
  async switchPersona(personaId) {
    if (!this.isDemo) {
      throw new Error('switchPersona only available in demo mode');
    }
    
    console.log('[Auth Demo] Switching persona to:', personaId);
    
    // Logout current persona
    await this.logout();
    
    // Login as new persona
    return await this.loginWithPersona(personaId);
  }
  
  /**
   * Get all available personas (demo mode)
   * Useful for persona selector UI
   * 
   * @returns {Array} Array of persona objects
   */
  getAvailablePersonas() {
    if (!this.isDemo) {
      return [];
    }
    
    return Object.values(PERSONAS);
  }
  
  /**
   * Get the default route for the current user's persona
   * 
   * @returns {string} Default route URL
   */
  getDefaultRoute() {
    if (!this.currentUser || !this.currentUser.persona) {
      return '/pages/dashboard.html';
    }
    
    return this.currentUser.persona.defaultRoute || '/pages/dashboard.html';
  }
}

// Singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };

// Initialize on load (but don't block)
if (typeof window !== 'undefined') {
  authService.initialize().catch(error => {
    console.error('[Auth] Initialization error:', error);
  });
}
