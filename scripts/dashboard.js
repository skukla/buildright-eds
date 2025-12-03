/**
 * Generic Dashboard Router
 * Routes to persona-specific dashboard modules
 * 
 * This is a generic shell that dynamically loads persona-specific content.
 * No persona-specific logic should be in this file.
 */

import { authService } from './auth.js';
import { decorateBlocks, loadBlocks } from './scripts.js';

class DashboardRouter {
  constructor() {
    this.contentContainer = null;
    this.currentView = null;
  }
  
  /**
   * Initialize dashboard router
   */
  async initialize() {
    console.log('[Dashboard] Initializing...');
    
    // Wait for auth to initialize FIRST
    await authService.initialize();
    
    // Then require authentication
    if (!authService.requireAuth()) {
      return;
    }
    
    // Get content container
    this.contentContainer = document.getElementById('dashboard-content');
    
    if (!this.contentContainer) {
      console.error('[Dashboard] Content container not found');
      return;
    }
    
    // Get view parameter or use persona default
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || this._getDefaultView();
    
    // Load dashboard
    await this.loadDashboard(view);
    
    // Load header/footer blocks
    await this._loadBlocks();
  }
  
  /**
   * Get default view for current persona
   * @private
   */
  _getDefaultView() {
    const persona = authService.getPersona();
    const defaultView = persona?.preferences?.defaultView || 'overview';
    
    console.log('[Dashboard] Default view:', defaultView);
    return defaultView;
  }
  
  /**
   * Load persona-specific dashboard
   * 
   * @param {string} view - Dashboard view name
   */
  async loadDashboard(view) {
    console.log(`[Dashboard] Loading view: ${view}`);
    
    this.currentView = view;
    
    try {
      // Dynamic import of dashboard module
      const dashboardModule = await this._getDashboardModule(view);
      
      // Initialize dashboard (structure already in HTML)
      await dashboardModule.initialize(this.contentContainer);
      
      // Decorate any blocks in dashboard content
      decorateBlocks(this.contentContainer);
      
      console.log('[Dashboard] View loaded successfully');
      
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard:', error);
      this._showError(error.message);
    }
  }
  
  /**
   * Get dashboard module for view
   * Maps view names to dashboard module paths
   * 
   * @private
   * @param {string} view - View name
   * @returns {Promise<Object>} Dashboard module
   */
  async _getDashboardModule(view) {
    // Map view names to module paths
    // These modules will be created in Phase 6
    const moduleMap = {
      'templates': './dashboards/template-dashboard.js',      // Sarah
      'projects': './dashboards/project-dashboard.js',        // Marcus
      'packages': './dashboards/package-dashboard.js',        // Lisa
      'deck_builder': './dashboards/deck-dashboard.js',       // David
      'restock': './dashboards/restock-dashboard.js',         // Kevin
      'overview': './dashboards/overview-dashboard.js'        // Generic
    };
    
    const modulePath = moduleMap[view];
    
    if (!modulePath) {
      throw new Error(`Unknown dashboard view: ${view}`);
    }
    
    // Dynamic import
    try {
      return await import(modulePath);
    } catch (error) {
      console.error(`[Dashboard] Failed to load module: ${modulePath}`, error);
      
      // Fallback to placeholder
      return {
        initialize: async (container) => {
          container.innerHTML = `
            <div class="dashboard-placeholder">
              <h1>${view.replace('_', ' ').toUpperCase()} Dashboard</h1>
              <p>This dashboard will be implemented in Phase 6.</p>
              <p><strong>View:</strong> ${view}</p>
              <p><strong>Persona:</strong> ${authService.getPersona()?.name || 'Unknown'}</p>
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
        <h2>Error Loading Dashboard</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        <a href="/pages/login.html" class="btn btn-secondary">Back to Login</a>
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
      console.error('[Dashboard] Error loading blocks:', error);
    }
  }
}

// Initialize on page load
const router = new DashboardRouter();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => router.initialize());
} else {
  router.initialize();
}

export { DashboardRouter };

