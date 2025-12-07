// Main Application Script

import { decorateBlock } from './utils.js';
import './cart-manager.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  // Fix all static links that start with "pages/" or "/pages/" to use BASE_PATH
  // This ensures links work on both localhost and GitHub Pages
  const basePath = window.BASE_PATH || '/';
  
  // Fix relative paths: pages/...
  const relativePageLinks = document.querySelectorAll('a[href^="pages/"]');
  relativePageLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.setAttribute('href', `${basePath}${href}`);
  });
  
  // Fix absolute paths: /pages/... (only when basePath is not '/')
  if (basePath !== '/') {
    const absolutePageLinks = document.querySelectorAll('a[href^="/pages/"]');
    absolutePageLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Replace /pages/ with {basePath}pages/
      link.setAttribute('href', href.replace(/^\/pages\//, `${basePath}pages/`));
    });
  }
  
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

