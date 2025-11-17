/**
 * Authentication System
 * 
 * DEMO MODE: Select persona from login page (current implementation)
 * PRODUCTION MODE: Integrate with Adobe Commerce Auth Dropin (future)
 * 
 * This file handles both modes with clear separation for easy transition.
 */

import { getPersona, PERSONAS, isValidPersona } from './persona-config.js';
import { acoService } from './aco-service.js';

const AUTH_STORAGE_KEY = 'buildright_auth';
const PERSONA_STORAGE_KEY = 'currentPersona';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isDemo = true; // Set to false for production
    this.initialized = false;
  }
  
  /**
   * Initialize auth service
   * Checks for existing session and restores user state
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('[Auth] Initializing...');
    
    if (this.isDemo) {
      await this._initializeDemoMode();
    } else {
      await this._initializeProductionMode();
    }
    
    this.initialized = true;
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
      
      this.currentUser = {
        id: persona.id,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        company: persona.company,
        customerGroup: persona.customerGroup,
        persona,
        acoContext
      };
      
      console.log('[Auth Demo] Restored session:', persona.name);
    } else {
      console.log('[Auth Demo] No active session');
    }
  }
  
  /**
   * Production mode: Use Commerce Auth Dropin (future)
   * @private
   */
  async _initializeProductionMode() {
    // TODO: Initialize Adobe Commerce Auth Dropin
    // Example implementation:
    /*
    try {
      const authDropin = await window.commerce?.auth?.initialize();
      const user = await authDropin.getUser();
      
      if (user) {
        // Map Commerce user to our user structure
        this.currentUser = {
          id: user.id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          customerGroup: user.group_id,
          commerceUser: user
        };
        
        console.log('[Auth] Restored Commerce session:', this.currentUser.name);
      }
    } catch (error) {
      console.error('[Auth] Failed to initialize Commerce Auth:', error);
    }
    */
    
    console.log('[Auth] Production mode not yet implemented');
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
    
    // Set current user
    this.currentUser = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      company: persona.company,
      customerGroup: persona.customerGroup,
      persona,
      acoContext
    };
    
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
      window.location.href = '/pages/login.html';
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
