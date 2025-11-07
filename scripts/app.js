// Main Application Script

import { decorateBlock } from './utils.js';
import './cart-manager.js';

// Fix navigation paths for GitHub Pages subdirectory
function fixNavigationPaths() {
  // Detect base path (e.g., '/buildright-eds/' or '/')
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const isInPagesDir = window.location.pathname.includes('/pages/');
  const basePath = pathParts.length > 1 && pathParts[0] !== 'pages' ? `/${pathParts[0]}/` : '/';
  
  // Fix logo/home links - use absolute paths from site root
  const logoLinks = document.querySelectorAll('.header-brand a');
  logoLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Convert to absolute path from site root
    if (href === 'index.html' || href === '/index.html' || href === '../index.html') {
      link.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
    }
  });
  
  // Fix breadcrumb home links
  const breadcrumbHomeLinks = document.querySelectorAll('nav a[href*="index.html"]');
  breadcrumbHomeLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === 'index.html' || href === '/index.html' || href === '../index.html') {
      link.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
    }
  });
  
  // Fix navigation links to use absolute paths
  const navLinks = document.querySelectorAll('a[href^="pages/"], a[href^="./"]');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('pages/')) {
      link.setAttribute('href', `${basePath}${href}`.replace('//', '/'));
    } else if (href.startsWith('./') && isInPagesDir) {
      // Convert ./filename.html to /basePath/pages/filename.html
      const filename = href.replace('./', '');
      link.setAttribute('href', `${basePath}pages/${filename}`.replace('//', '/'));
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  fixNavigationPaths();
  initializeApp();
});

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

