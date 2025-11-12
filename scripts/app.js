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
      cls.includes('project-filter') || 
      cls.includes('pricing-display') || 
      cls.includes('inventory-status') || 
      cls.includes('tier-badge') || 
      cls.includes('cart-summary') || 
      cls.includes('product-grid')
    );

    if (blockClass) {
      const blockName = blockClass.replace(/-block$/, '').replace(/^block-/, '');
      await decorateBlock(block, blockName);
    }
  }

  // Decorate blocks by class name pattern
  const blockPatterns = [
    'header',
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
      await decorateBlock(block, pattern);
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

