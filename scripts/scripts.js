/*
 * Copyright 2024 Adobe. All rights reserved.
 * BuildRight EDS Migration - Main Entry Point
 */

/**
 * Preload critical data synchronously to prevent FOUC/layout shifts
 * Note: Scroll restoration and initial data preloading now happen in <head> for better timing
 * This runs immediately before any blocks load
 */
(function preloadCriticalData() {
  // Scroll restoration is now handled in <head> for immediate effect
  // Cart count and location are preloaded in <head>
  // This function is kept for future critical data needs
})();

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
  // Determine block name first
  let name = blockName || block.dataset.blockName;
  
  if (!name) {
    // Try to extract from class list
    const classList = Array.from(block.classList);
    const blockClass = classList.find(cls => 
      cls.includes('header') || 
      cls.includes('footer') ||
      cls.includes('site-footer') ||
      cls.includes('breadcrumbs') ||
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
  
  // For data-dependent blocks (pricing, inventory), allow re-decoration if data attribute changes
  const dataDependentBlocks = ['pricing-display', 'inventory-status'];
  const isDataDependent = dataDependentBlocks.includes(name);
  
  // Skip if already loaded (unless it's a data-dependent block with new data)
  if (block.dataset.blockStatus === 'loaded' && !isDataDependent) {
    return;
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
    '.breadcrumbs',
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
    '.project-builder',
    '.auth-dropin',
    '.commerce-mini-cart',
    '.login-form',
    '.cart-dropin',
    '.cart-page',
    '.checkout-dropin',
    '.order-confirmation-dropin',
    '.state-message'
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
    // Check if header HTML is already present (inlined)
    const existingHeader = header.querySelector('.header');
    
    if (existingHeader) {
      // Adobe Best Practice: Header already inlined for instant visibility
      // Just decorate the existing block
      await decorateBlock(existingHeader);
      return;
    }
    
    // Fallback: Load header HTML dynamically (for pages without inlined header)
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
    'breadcrumbs',
    'project-filter',
    'pricing-display',
    'inventory-status',
    'tier-badge',
    'cart-summary',
    'product-grid',
    'project-bundle',
    'wizard-progress',
    'wizard-sidebar',
    'project-builder',
    'auth-dropin',
    'commerce-mini-cart',
    'login-form',
    'cart-dropin',
    'cart-page',
    'checkout-dropin',
    'order-confirmation-dropin'
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
 * Initialize Commerce Dropins if enabled
 * Should be called early but doesn't block LCP
 */
async function initializeDropins() {
  try {
    const { shouldUseDropins, initializeDropins } = await import('./initializers/index.js');

    if (await shouldUseDropins()) {
      console.log('[Scripts] Initializing Commerce Dropins...');
      await initializeDropins();
    }
  } catch (error) {
    console.warn('[Scripts] Failed to initialize Commerce Dropins:', error.message);
    // Non-blocking - demo mode will be used as fallback
  }
}

/**
 * Page Personalization System
 *
 * Registry of page types that need personalization.
 * Each entry maps a page type to a dynamic import of its personalizer module.
 * Personalizers run after dropins init but before block decoration.
 *
 * Convention: Module should export `personalize{PageType}(doc)` function
 * Example: homepage -> personalizeHomepage(doc)
 */
const PAGE_PERSONALIZERS = {
  homepage: () => import('./personalize-page.js'),
  // Add more as needed:
  // dashboard: () => import('./personalizers/dashboard.js'),
};

/**
 * Determine page type from URL path
 * @returns {string|null} Page type key or null if no personalization needed
 */
function getPageType() {
  const path = window.location.pathname.toLowerCase();
  const basePath = (window.BASE_PATH || '/').toLowerCase();

  // Normalize path (remove base path prefix, collapse slashes)
  const normalizedPath = path.replace(basePath, '/').replace(/\/+/g, '/');

  // Homepage detection
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    return 'homepage';
  }

  // Add more page type detection as needed:
  // if (normalizedPath.startsWith('/pages/dashboard')) return 'dashboard';

  return null;
}

/**
 * Load and run page-specific personalization
 * Runs after dropins init, before block decoration
 * @param {Document} doc - The document
 */
async function loadPersonalization(doc) {
  const pageType = getPageType();
  if (!pageType) return;

  const getModule = PAGE_PERSONALIZERS[pageType];
  if (!getModule) return;

  try {
    const module = await getModule();

    // Convention: export function named personalize{PageType}
    const fnName = `personalize${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`;
    const personalizer = module[fnName] || module.default;

    if (typeof personalizer === 'function') {
      console.log(`[Scripts] Running ${pageType} personalization...`);
      await personalizer(doc);
    }
  } catch (error) {
    console.warn(`[Scripts] Personalization failed for ${pageType}:`, error.message);
    // Non-blocking - page will render with default content
  }
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

  // 4. Initialize Commerce Dropins FIRST (blocks need persona headers)
  // This is cached in sessionStorage, so only first visit has network cost
  await initializeDropins();

  // 5. Run page personalization (after dropins ready, before blocks decorated)
  // This allows personalizers to modify DOM (e.g., fragment paths) before decoration
  await loadPersonalization(doc);

  // 6. Decorate main (blocks can now safely call mesh functions)
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
 * Loads everything that doesn't need to be delayed
 * @param {Document} doc - The document
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  
  // Fix static links first
  fixStaticLinks();
  
  // Load header and main blocks in parallel for faster perceived performance
  const header = doc.querySelector('header');
  const footer = doc.querySelector('footer');
  
  const promises = [];
  
  // Load header first (critical above-the-fold content with cached categories)
  if (header) {
    promises.push(loadHeader(header));
  }
  
  // Load blocks in main (in parallel with header)
  if (main) {
    promises.push(loadBlocks(main));
  }
  
  // Wait for both to complete
  await Promise.all(promises);
  
  // Only load footer if it's not already a .site-footer element (from fragments) 
  // and doesn't contain a .site-footer child (already loaded)
  if (footer && !footer.classList.contains('site-footer') && !footer.querySelector('.site-footer')) {
    await loadFooter(footer);
  }
  
  // Cart is now managed by Commerce Cart Dropin
  // See scripts/initializers/cart.js for cart initialization
  
  // Adobe Best Practice: Handle URL hash navigation after layout is stable
  // Delay scroll to prevent jumps during initial page render
  const { hash } = window.location;
  if (hash) {
    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      // Double RAF for better reliability
      requestAnimationFrame(() => {
        const element = doc.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  // Note: Initial scroll to top is handled in <head> for immediate effect
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

