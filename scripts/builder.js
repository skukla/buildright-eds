/**
 * Generic Builder Router
 * Routes to persona-specific builder modules
 * 
 * This is a generic shell that dynamically loads persona-specific builders.
 * No persona-specific logic should be in this file.
 */

import { authService } from './auth.js';
import { decorateBlocks, loadBlocks } from './scripts.js';

class BuilderRouter {
  constructor() {
    this.contentContainer = null;
    this.builderModule = null;
    this.currentType = null;
  }
  
  /**
   * Initialize builder router
   */
  async initialize() {
    console.log('[Builder] Initializing...');
    
    // Require authentication
    if (!authService.requireAuth()) {
      return;
    }
    
    // Wait for auth to initialize
    await authService.initialize();
    
    // Get content container
    this.contentContainer = document.getElementById('builder-main');
    
    if (!this.contentContainer) {
      console.error('[Builder] Content container not found');
      return;
    }
    
    // Get builder type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (!type) {
      this._showError('No builder type specified');
      return;
    }
    
    // Load builder
    await this.loadBuilder(type);
    
    // Load header/footer blocks
    await this._loadBlocks();
  }
  
  /**
   * Load persona-specific builder
   * 
   * @param {string} type - Builder type (project, deck, package)
   */
  async loadBuilder(type) {
    console.log(`[Builder] Loading builder: ${type}`);
    
    this.currentType = type;
    
    // Show loading
    this._showLoading();
    
    try {
      // Dynamic import of builder module
      this.builderModule = await this._getBuilderModule(type);
      
      // Clear loading
      this.contentContainer.innerHTML = '';
      
      // Initialize builder
      await this.builderModule.initialize(this.contentContainer);
      
      // Decorate blocks
      decorateBlocks(this.contentContainer);
      
      console.log('[Builder] Builder loaded successfully');
      
    } catch (error) {
      console.error('[Builder] Error loading builder:', error);
      this._showError(error.message);
    }
  }
  
  /**
   * Get builder module for type
   * Maps builder types to module paths
   * 
   * @private
   * @param {string} type - Builder type
   * @returns {Promise<Object>} Builder module
   */
  async _getBuilderModule(type) {
    // Map builder types to module paths
    // These modules will be created in Phase 6
    const moduleMap = {
      'project': './builders/project-wizard.js',      // Marcus
      'deck': './builders/deck-builder.js',           // David
      'package': './builders/package-builder.js'      // Lisa
    };
    
    const modulePath = moduleMap[type];
    
    if (!modulePath) {
      throw new Error(`Unknown builder type: ${type}`);
    }
    
    // Dynamic import
    try {
      return await import(modulePath);
    } catch (error) {
      console.error(`[Builder] Failed to load module: ${modulePath}`, error);
      
      // Fallback to placeholder
      return {
        initialize: async (container) => {
          container.innerHTML = `
            <div class="builder-placeholder">
              <h1>${type.toUpperCase()} Builder</h1>
              <p>This builder will be implemented in Phase 6.</p>
              <p><strong>Type:</strong> ${type}</p>
              <p><strong>Persona:</strong> ${authService.getPersona()?.name || 'Unknown'}</p>
              <div class="builder-actions">
                <a href="/pages/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
              </div>
            </div>
          `;
        }
      };
    }
  }
  
  /**
   * Show loading state
   * @private
   */
  _showLoading() {
    // Loading overlay already in HTML, just ensure it's visible
    const loadingOverlay = this.contentContainer.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
    }
  }
  
  /**
   * Show error state
   * @private
   */
  _showError(message) {
    this.contentContainer.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Builder</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        <a href="/pages/dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
      </div>
    `;
  }
  
  /**
   * Load header and footer blocks
   * @private
   */
  async _loadBlocks() {
    try {
      await loadBlocks(document);
    } catch (error) {
      console.error('[Builder] Error loading blocks:', error);
    }
  }
}

// Initialize on page load
const router = new BuilderRouter();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => router.initialize());
} else {
  router.initialize();
}

export { BuilderRouter };

