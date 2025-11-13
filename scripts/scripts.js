/*
 * Copyright 2024 Adobe. All rights reserved.
 * BuildRight EDS Migration - Main Entry Point
 */

/**
 * Setup base tag for path resolution (GitHub Pages + localhost support)
 */
function setupBasePath() {
  if (document.querySelector('base')) return;
  
  const pathname = window.location.pathname;
  const isGitHubPages = pathname.startsWith('/buildright-eds/');
  const basePath = isGitHubPages ? '/buildright-eds/' : '/';
  
  const baseTag = document.createElement('base');
  baseTag.href = window.location.origin + basePath;
  document.head.insertBefore(baseTag, document.head.firstChild);
  
  window.BASE_PATH = basePath;
}

/**
 * Setup body classes for page-specific styling (catalog, project-builder, etc.)
 */
function setupBodyClasses() {
  const redirectPath = sessionStorage.getItem('spa_redirect_path');
  const currentPath = redirectPath || window.location.pathname;
  const normalizePath = (path) => path ? path.replace(/^\/+|\/+$/g, '').toLowerCase() : '';
  const normalizedPath = normalizePath(currentPath);
  
  // Set page type classes
  if (normalizedPath.includes('catalog')) {
    document.body.classList.add('page-catalog');
    
    // Set category data attribute
    const pathParts = normalizedPath.split('/');
    if (pathParts.length > 1 && pathParts[0] === 'catalog') {
      const categorySlug = pathParts[1];
      const categoryMap = {
        'structural-materials': 'structural_materials',
        'windows-doors': 'windows_doors',
        'fasteners-hardware': 'fasteners_hardware',
        'roofing': 'roofing',
        'framing-drywall': 'framing_drywall'
      };
      const category = categoryMap[categorySlug];
      if (category) {
        document.body.setAttribute('data-category', category);
      }
    }
  } else if (normalizedPath.includes('project-builder')) {
    document.body.classList.add('page-project-builder');
  }
}

/**
 * Load CSS files
 * @param {string} href - The href of the stylesheet
 */
export function loadCSS(href) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', href);
  document.head.appendChild(link);
}

/**
 * Loads a block's CSS file
 */
export function loadBlockCSS(blockName) {
  const basePath = window.BASE_PATH || '/';
  const cssPath = `${basePath}blocks/${blockName}/${blockName}.css`;
  loadCSS(cssPath);
}

/**
 * Loads a block's JavaScript file
 */
export async function loadBlockJS(blockName) {
  const basePath = window.BASE_PATH || '/';
  const jsPath = `${basePath}blocks/${blockName}/${blockName}.js`;
  
  try {
    const module = await import(jsPath);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load block JS: ${blockName}`, error);
    return null;
  }
}

/**
 * Decorates a block (EDS pattern)
 * @param {Element} block - The block element
 * @param {string} blockName - Optional block name (if not in dataset/class)
 */
export async function decorateBlock(block, blockName = null) {
  // Determine block name from dataset, class, or parameter
  let name = blockName || block.dataset.blockName;
  
  if (!name) {
    // Try to extract from class list
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
      cls.includes('product-grid') ||
      cls.includes('project-bundle') ||
      cls.includes('wizard-progress') ||
      cls.includes('wizard-sidebar') ||
      cls.includes('project-builder')
    );
    
    if (blockClass) {
      name = blockClass.replace(/-block$/, '').replace(/^block-/, '');
      // Map site-footer to footer
      if (name === 'site-footer') name = 'footer';
    } else {
      name = classList[0];
    }
  }
  
  if (!name) return;
  
  // Load CSS
  loadBlockCSS(name);
  
  // Load and execute JS
  const decorate = await loadBlockJS(name);
  if (decorate && typeof decorate === 'function') {
    await decorate(block);
  }
  
  block.dataset.blockStatus = 'loaded';
}

/**
 * Decorates all blocks in a container element
 * @param {Element} main - The main element
 */
export function decorateBlocks(main) {
  if (!main) return;
  
  // Find all potential blocks
  const blockSelectors = [
    'div.header',
    'div.footer',
    'div.site-footer',
    '[data-block-name]',
    '.product-grid',
    '.project-filter',
    '.pricing-display',
    '.inventory-status',
    '.tier-badge',
    '.cart-summary',
    '.project-bundle',
    '.wizard-progress',
    '.wizard-sidebar',
    '.project-builder'
  ];
  
  blockSelectors.forEach(selector => {
    const blocks = main.querySelectorAll(selector);
    blocks.forEach((block) => {
      if (!block.dataset.blockStatus) {
        block.dataset.blockStatus = 'loading';
      }
    });
  });
}

/**
 * Load and decorate the header block
 * @param {Element} header - The header element
 */
export async function loadHeader(header) {
  const basePath = window.BASE_PATH || '/';
  
  try {
    // Load header HTML
    const response = await fetch(`${basePath}blocks/header/header.html`);
    const html = await response.text();
    
    // Parse and insert HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headerContent = doc.querySelector('.header');
    
    if (headerContent) {
      // Create a block div for decoration
      const block = document.createElement('div');
      block.className = 'header';
      block.dataset.blockName = 'header';
      block.innerHTML = headerContent.innerHTML;
      
      header.appendChild(block);
      
      // Decorate the block
      await decorateBlock(block);
    }
  } catch (error) {
    console.error('Failed to load header:', error);
  }
}

/**
 * Load and decorate the footer block
 * @param {Element} footer - The footer element
 */
export async function loadFooter(footer) {
  const basePath = window.BASE_PATH || '/';
  
  try {
    // Load footer HTML
    const response = await fetch(`${basePath}blocks/footer/footer.html`);
    const html = await response.text();
    
    // Parse and insert HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const footerContent = doc.querySelector('.site-footer');
    
    if (footerContent) {
      // Create a block div for decoration
      const block = document.createElement('div');
      block.className = 'site-footer';
      block.dataset.blockName = 'footer';
      block.innerHTML = footerContent.innerHTML;
      
      footer.appendChild(block);
      
      // Decorate the block
      await decorateBlock(block);
    }
  } catch (error) {
    console.error('Failed to load footer:', error);
  }
}

/**
 * Load blocks within the main element
 * @param {Element} main - The main element
 */
export async function loadBlocks(main) {
  if (!main) return;
  
  // Decorate blocks by class name pattern (from app.js)
  const blockPatterns = [
    'header',
    'site-footer',
    'project-filter',
    'pricing-display',
    'inventory-status',
    'tier-badge',
    'cart-summary',
    'product-grid',
    'project-bundle',
    'wizard-progress',
    'wizard-sidebar',
    'project-builder'
  ];

  for (const pattern of blockPatterns) {
    const blocks = main.querySelectorAll(`.${pattern}`);
    for (const block of blocks) {
      if (!block.dataset.blockStatus || block.dataset.blockStatus === 'loading') {
        const blockName = pattern === 'site-footer' ? 'footer' : pattern;
        await decorateBlock(block, blockName);
      }
    }
  }
  
  // Also decorate any blocks marked with data-block-status="loading"
  const loadingBlocks = main.querySelectorAll('[data-block-status="loading"]');
  for (const block of loadingBlocks) {
    await decorateBlock(block);
  }
}

/**
 * Decorates the main element
 * @param {Element} main - The main element
 */
export function decorateMain(main) {
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP
 * @param {Document} doc - The document
 */
async function loadEager(doc) {
  // 1. Setup base path
  setupBasePath();
  
  // 2. Setup body classes
  setupBodyClasses();
  
  // 3. Set language
  document.documentElement.lang = 'en';
  
  // 4. Decorate main
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
  }
}

/**
 * Fix static links to use BASE_PATH (from app.js)
 */
function fixStaticLinks() {
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
      link.setAttribute('href', href.replace(/^\/pages\//, `${basePath}pages/`));
    });
  }
}

/**
 * Initialize kit sidebar only on catalog pages (from app.js)
 */
async function initializeKitSidebar() {
  const pathname = window.location.pathname.toLowerCase();
  const hasCatalogPath = pathname.includes('catalog');
  const hasCatalogClass = document.body.classList.contains('page-catalog');
  const hasProjectBuilderPath = pathname.includes('project-builder');
  const hasProjectBuilderClass = document.body.classList.contains('page-project-builder');
  
  const isCatalogPage = hasCatalogPath || hasCatalogClass;
  const isProjectBuilderPage = hasProjectBuilderPath || hasProjectBuilderClass;
  
  // Only show kit sidebar on catalog pages, NOT on project builder pages
  if (isCatalogPage && !isProjectBuilderPage) {
    const { getWizardState, hasKitItems } = await import('./project-builder.js');
    const wizardState = getWizardState();
    const resumeChoice = sessionStorage.getItem('kit_mode_resume_choice');
    
    // Only show resume banner if kit has items
    if (wizardState && hasKitItems() && !resumeChoice) {
      const { showKitModeResumeBanner } = await import('./kit-mode-banner.js');
      showKitModeResumeBanner();
    } else if (resumeChoice === 'edit') {
      // Check if kit still has items - if not, exit kit mode
      if (!hasKitItems()) {
        sessionStorage.removeItem('kit_mode_resume_choice');
        sessionStorage.removeItem('buildright_wizard_state');
        return;
      }
      // User chose to edit kit - show sidebar
      const { initKitSidebar } = await import('./kit-sidebar.js');
      await initKitSidebar();
      
      // Listen for kit updates
      const existingKitUpdatedHandler = window._kitUpdatedHandler;
      if (existingKitUpdatedHandler) {
        window.removeEventListener('kitUpdated', existingKitUpdatedHandler);
      }
      
      const kitUpdatedHandler = async (event) => {
        if (event?.detail?.skipRerender) {
          return;
        }
        const { updateKitSidebar } = await import('./kit-sidebar.js');
        await updateKitSidebar();
      };
      window._kitUpdatedHandler = kitUpdatedHandler;
      window.addEventListener('kitUpdated', kitUpdatedHandler);
      
      // Listen for kit mode exit to remove sidebar
      const existingKitExitedHandler = window._kitModeExitedHandler;
      if (existingKitExitedHandler) {
        window.removeEventListener('kitModeExited', existingKitExitedHandler);
      }
      
      const kitModeExitedHandler = async () => {
        const { removeKitSidebar } = await import('./kit-sidebar.js');
        removeKitSidebar();
        // Clean up listeners
        if (window._kitUpdatedHandler) {
          window.removeEventListener('kitUpdated', window._kitUpdatedHandler);
          window._kitUpdatedHandler = null;
        }
        if (window._kitModeExitedHandler) {
          window.removeEventListener('kitModeExited', window._kitModeExitedHandler);
          window._kitModeExitedHandler = null;
        }
      };
      window._kitModeExitedHandler = kitModeExitedHandler;
      window.addEventListener('kitModeExited', kitModeExitedHandler);
    }
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

/**
 * Loads everything that doesn't need to be delayed
 * @param {Document} doc - The document
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  
  // Fix static links first
  fixStaticLinks();
  
  // Load blocks in main
  if (main) {
    await loadBlocks(main);
  }
  
  // Load header and footer
  const header = doc.querySelector('header');
  const footer = doc.querySelector('footer');
  
  if (header && !header.querySelector('.header')) {
    await loadHeader(header);
  }
  
  if (footer && !footer.querySelector('.site-footer')) {
    await loadFooter(footer);
  }
  
  // Initialize cart manager (BuildRight-specific)
  await import('./cart-manager.js');
  
  // Initialize kit sidebar (BuildRight-specific)
  await initializeKitSidebar();
  
  // Handle URL hash navigation
  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) {
    element.scrollIntoView();
  }
}

/**
 * Loads everything that happens later, without impacting UX
 */
function loadDelayed() {
  // Load delayed features after 3 seconds
  window.setTimeout(async () => {
    // Load analytics, tracking, etc.
  }, 3000);
}

/**
 * Main page load function
 */
async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// Start page load
loadPage();

