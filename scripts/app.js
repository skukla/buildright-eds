// Main Application Script

import { decorateBlock } from './utils.js';
import './cart-manager.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  initializeKitSidebar();
});

// Initialize kit sidebar only on catalog pages (NOT on project builder pages)
async function initializeKitSidebar() {
  // Check if we're on a page that should show the kit sidebar
  // Body classes are set synchronously in inline scripts before DOMContentLoaded
  const pathname = window.location.pathname.toLowerCase();
  const hasCatalogPath = pathname.includes('catalog');
  const hasCatalogClass = document.body.classList.contains('page-catalog');
  const hasProjectBuilderPath = pathname.includes('project-builder');
  const hasProjectBuilderClass = document.body.classList.contains('page-project-builder');
  
  const isCatalogPage = hasCatalogPath || hasCatalogClass;
  const isProjectBuilderPage = hasProjectBuilderPath || hasProjectBuilderClass;
  
  // Only show kit sidebar on catalog pages, NOT on project builder pages
  if (isCatalogPage && !isProjectBuilderPage) {
    // Check for kit mode resume banner first
    const { getWizardState, hasKitItems } = await import('./project-builder.js');
    const wizardState = getWizardState();
    const resumeChoice = sessionStorage.getItem('kit_mode_resume_choice');
    
    // Only show resume banner if kit has items
    if (wizardState && hasKitItems() && !resumeChoice) {
      // User has a kit with items but hasn't made a choice yet - show resume banner
      const { showKitModeResumeBanner } = await import('./kit-mode-banner.js');
      showKitModeResumeBanner();
    } else if (resumeChoice === 'edit') {
      // Check if kit still has items - if not, exit kit mode
      if (!hasKitItems()) {
        // Kit is empty, exit kit mode
        sessionStorage.removeItem('kit_mode_resume_choice');
        sessionStorage.removeItem('buildright_wizard_state');
        return;
      }
      // User chose to edit kit - show sidebar
      const { initKitSidebar } = await import('./kit-sidebar.js');
      await initKitSidebar();
      
      // Listen for kit updates (use updateKitSidebar for smoother updates)
      // Remove any existing listeners to avoid duplicates
      const existingHandler = window._kitUpdatedHandler;
      if (existingHandler) {
        window.removeEventListener('kitUpdated', existingHandler);
      }
      
      const kitUpdatedHandler = async (event) => {
        // Skip re-render if the event indicates it's just a quantity update
        if (event?.detail?.skipRerender) {
          return;
        }
        const { updateKitSidebar } = await import('./kit-sidebar.js');
        await updateKitSidebar();
      };
      window._kitUpdatedHandler = kitUpdatedHandler;
      window.addEventListener('kitUpdated', kitUpdatedHandler);
    }
    // If resumeChoice === 'shop' or no wizard state, normal shopping mode (no sidebar)
  } else if (isProjectBuilderPage) {
    // Explicitly remove kit sidebar if we're on a project builder page
    const { removeKitSidebar } = await import('./kit-sidebar.js');
    removeKitSidebar();
    
    // Remove any existing kit update listeners
    const existingHandler = window._kitUpdatedHandler;
    if (existingHandler) {
      window.removeEventListener('kitUpdated', existingHandler);
      window._kitUpdatedHandler = null;
    }
  }
}

async function initializeApp() {
  // Decorate all blocks on the page
  const blocks = document.querySelectorAll('[class*="block"], [class*="-block"]');
  
  for (const block of blocks) {
    // Extract block name from class
    const classList = Array.from(block.classList);
    const blockClass = classList.find(cls => 
      cls.includes('header') || 
      cls.includes('footer') ||
      cls.includes('site-footer') ||
      cls.includes('project-filter') || 
      cls.includes('pricing-display') || 
      cls.includes('inventory-status') || 
      cls.includes('tier-badge') || 
      cls.includes('cart-summary') || 
      cls.includes('product-grid')
    );

    if (blockClass) {
      let blockName = blockClass.replace(/-block$/, '').replace(/^block-/, '');
      // Map site-footer to footer
      if (blockName === 'site-footer') blockName = 'footer';
      await decorateBlock(block, blockName);
    }
  }

  // Decorate blocks by class name pattern
  const blockPatterns = [
    'header',
    'site-footer',
    'project-filter',
    'pricing-display',
    'inventory-status',
    'tier-badge',
    'cart-summary',
    'product-grid',
    'project-bundle'
  ];

  for (const pattern of blockPatterns) {
    const blocks = document.querySelectorAll(`.${pattern}`);
    for (const block of blocks) {
      // Map site-footer to footer for block loading
      const blockName = pattern === 'site-footer' ? 'footer' : pattern;
      await decorateBlock(block, blockName);
    }
  }
}

// Handle navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href && !link.href.startsWith('http') && !link.href.startsWith('mailto:')) {
    // Allow default navigation for relative links
    // In a real SPA, you might want to prevent default and handle routing
  }
});

