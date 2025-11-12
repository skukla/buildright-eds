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
  
  // Determine button text based on current page
  const isProjectBuilder = window.location.pathname.includes('project-builder');
  const dismissButtonText = isProjectBuilder ? 'Start New Project' : 'Not Now';
  
  const html = `
    <div class="kit-mode-resume-banner" id="kit-mode-resume-banner">
      <div class="kit-mode-resume-banner-content">
        <div class="kit-mode-resume-info">
          <div class="kit-mode-resume-title">Continue building your ${escapeHtml(bundleName)}</div>
          <div class="kit-mode-resume-details">
            <span class="kit-mode-resume-count">${itemCount} items</span>
            <span class="kit-mode-resume-separator">•</span>
            <span class="kit-mode-resume-price">$${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div class="kit-mode-resume-actions">
          <button class="btn btn-primary btn-md" id="resume-kit-btn">Continue Editing Kit</button>
          <button class="btn btn-outline btn-md" id="dismiss-banner-btn">${dismissButtonText}</button>
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
  
  // Check if banner was dismissed on non-builder pages
  const isProjectBuilder = window.location.pathname.includes('project-builder');
  const wasDismissed = sessionStorage.getItem('kit_mode_banner_dismissed') === 'true';
  
  // Don't show banner on non-builder pages if it was dismissed
  if (!isProjectBuilder && wasDismissed) {
    return;
  }
  
  // Only show banner if kit has items - empty kits should not be resumable
  const kit = getFullKit();
  if (!kit || !kit.items || kit.items.length === 0) {
    // Kit is empty, clear state and don't show banner
    sessionStorage.removeItem('buildright_wizard_state');
    sessionStorage.removeItem('kit_mode_resume_choice');
    sessionStorage.removeItem('kit_mode_banner_dismissed');
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
  const dismissBtn = document.getElementById('dismiss-banner-btn');
  
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      // Set session flag to enter kit mode
      sessionStorage.setItem('kit_mode_resume_choice', 'edit');
      // Clear dismissed flag so banner can show again if they exit kit mode later
      sessionStorage.removeItem('kit_mode_banner_dismissed');
      // Reload page to ensure all components are properly initialized
      window.location.reload();
    });
  }
  
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const isProjectBuilder = window.location.pathname.includes('project-builder');
      
      if (isProjectBuilder) {
        // On Project Builder: "Start New Project" clears the wizard state and banner disappears everywhere
        sessionStorage.removeItem('buildright_wizard_state');
        sessionStorage.removeItem('kit_mode_banner_dismissed');
        sessionStorage.setItem('kit_mode_resume_choice', 'shop');
        
        // Remove kit sidebar if it exists
        import('./kit-sidebar.js').then(module => {
          module.removeKitSidebar();
        });
        
        // Reload page to refresh all components
        window.location.reload();
      } else {
        // On other pages: "Not Now" just dismisses the banner without clearing state
        // Set flag to not show banner again on non-builder pages during this session
        sessionStorage.setItem('kit_mode_banner_dismissed', 'true');
        
        // Hide banner
        const banner = document.getElementById('kit-mode-resume-banner');
        if (banner) {
          banner.remove();
        }
      }
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

