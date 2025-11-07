// Main Application Script

import { decorateBlock } from './utils.js';
import './cart-manager.js';

// Get base path helper (available globally for inline scripts)
window.getBasePath = function() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  return pathParts.length > 1 && pathParts[0] !== 'pages' ? `/${pathParts[0]}/` : '/';
};

// Fix navigation paths for GitHub Pages subdirectory
function fixNavigationPaths() {
  // Detect base path (e.g., '/buildright-eds/' or '/')
  const basePath = window.getBasePath();
  const isInPagesDir = window.location.pathname.includes('/pages/');
  
  // Skip if already on root (no base path needed)
  if (basePath === '/') return;
  
  // Fix ALL internal navigation links (not external URLs, anchors, or mailto)
  const allLinks = document.querySelectorAll('a[href]');
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Skip external links, anchors, mailto, javascript:, and data URIs
    if (!href || 
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('mailto:') || 
        href.startsWith('javascript:') ||
        href.startsWith('data:') ||
        href.startsWith('#') ||
        href.startsWith(basePath)) {
      return;
    }
    
    // Fix absolute paths that start with / but aren't external
    if (href.startsWith('/') && !href.startsWith('//')) {
      // Convert /pages/... to basePath/pages/...
      if (href.startsWith('/pages/')) {
        link.setAttribute('href', `${basePath}${href.substring(1)}`.replace('//', '/'));
        return;
      }
      // Convert /index.html to basePath/index.html
      if (href === '/index.html' || href === '/') {
        link.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
        return;
      }
    }
    
    // Fix index.html links
    if (href === 'index.html' || href === '../index.html') {
      link.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
      return;
    }
    
    // Fix pages/ links (from root pages)
    if (href.startsWith('pages/')) {
      link.setAttribute('href', `${basePath}${href}`.replace('//', '/'));
      return;
    }
    
    // Fix ./ links (from pages directory)
    if (href.startsWith('./') && isInPagesDir) {
      const filename = href.replace('./', '');
      link.setAttribute('href', `${basePath}pages/${filename}`.replace('//', '/'));
      return;
    }
    
    // Fix ../index.html links (from pages directory)
    if (href === '../index.html' && isInPagesDir) {
      link.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
      return;
    }
    
    // Fix ../ links that go to other pages (from pages directory)
    if (href.startsWith('../') && isInPagesDir && !href.startsWith('../index.html')) {
      const relativePath = href.replace('../', '');
      // If it's a pages/ path, keep it; otherwise assume it's a root-level file
      if (relativePath.startsWith('pages/')) {
        link.setAttribute('href', `${basePath}${relativePath}`.replace('//', '/'));
      } else {
        link.setAttribute('href', `${basePath}${relativePath}`.replace('//', '/'));
      }
      return;
    }
  });
}

// Watch for dynamically added links and fix them
function setupDynamicLinkFixer() {
  const basePath = window.getBasePath();
  if (basePath === '/') return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Fix links in the added node
          if (node.tagName === 'A' && node.hasAttribute('href')) {
            const href = node.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith(basePath)) {
              fixNavigationPaths();
            }
          }
          // Fix links within the added node
          const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
          if (links.length > 0) {
            fixNavigationPaths();
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  fixNavigationPaths();
  setupDynamicLinkFixer();
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

