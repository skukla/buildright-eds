// Kit Mode Resume Banner
// Shows when user returns to catalog with an existing project kit

import { getWizardState, getFullKit } from './project-builder.js';
import { escapeHtml } from './project-builder-constants.js';

/**
 * Create kit mode resume banner HTML
 * @returns {string} HTML string
 */
function createKitModeResumeBanner() {
  const kit = getFullKit();
  const bundleName = kit.bundleName || 'Project Kit';
  const itemCount = kit.itemCount || 0;
  const totalPrice = kit.totalPrice || 0;
  
  const html = `
    <div class="kit-mode-resume-banner" id="kit-mode-resume-banner">
      <div class="kit-mode-resume-banner-content">
        <div class="kit-mode-resume-info">
          <div class="kit-mode-resume-title">Your ${escapeHtml(bundleName)} project is still active</div>
          <div class="kit-mode-resume-details">
            <span class="kit-mode-resume-count">${itemCount} items</span>
            <span class="kit-mode-resume-separator">•</span>
            <span class="kit-mode-resume-price">$${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div class="kit-mode-resume-actions">
          <button class="btn btn-primary btn-md" id="resume-kit-btn">Continue Editing Kit</button>
          <button class="btn btn-outline btn-md" id="shop-normal-btn">Start New Project</button>
        </div>
      </div>
    </div>
  `;
  return html;
}

/**
 * Show kit mode resume banner
 */
export function showKitModeResumeBanner() {
  // Check if banner already exists
  if (document.getElementById('kit-mode-resume-banner')) {
    return;
  }
  
  // Only show banner if kit has items - empty kits should not be resumable
  const kit = getFullKit();
  if (!kit || !kit.items || kit.items.length === 0) {
    // Kit is empty, clear state and don't show banner
    sessionStorage.removeItem('buildright_wizard_state');
    sessionStorage.removeItem('kit_mode_resume_choice');
    return;
  }
  
  // Find insertion point - after header, before breadcrumb
  const header = document.querySelector('.header');
  if (!header) {
    console.warn('[Kit Mode Banner] Header not found, cannot insert banner');
    return;
  }
  
  // Create banner element
  const bannerHTML = createKitModeResumeBanner();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = bannerHTML;
  const banner = tempDiv.firstElementChild;
  
  // Insert after header
  header.insertAdjacentElement('afterend', banner);
  
  // Setup event handlers
  setupBannerEventHandlers();
}

/**
 * Setup event handlers for banner buttons
 */
function setupBannerEventHandlers() {
  const resumeBtn = document.getElementById('resume-kit-btn');
  const shopBtn = document.getElementById('shop-normal-btn');
  
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      // Set session flag to enter kit mode
      sessionStorage.setItem('kit_mode_resume_choice', 'edit');
      // Reload page to ensure all components are properly initialized
      window.location.reload();
    });
  }
  
  if (shopBtn) {
    shopBtn.addEventListener('click', () => {
      // Clear wizard state
      sessionStorage.removeItem('buildright_wizard_state');
      sessionStorage.setItem('kit_mode_resume_choice', 'shop');
      
      // Hide banner
      const banner = document.getElementById('kit-mode-resume-banner');
      if (banner) {
        banner.remove();
      }
      
      // Remove kit sidebar if it exists
      import('./kit-sidebar.js').then(module => {
        module.removeKitSidebar();
      });
      
      // Reload page to refresh all components
      window.location.reload();
    });
  }
}

/**
 * Hide kit mode resume banner
 */
export function hideKitModeResumeBanner() {
  const banner = document.getElementById('kit-mode-resume-banner');
  if (banner) {
    banner.remove();
  }
}

