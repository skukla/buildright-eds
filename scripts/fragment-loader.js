/**
 * Fragment Loader Utility
 * Loads and injects EDS fragments dynamically
 * 
 * Fragments are reusable content sections that can be:
 * - Authored in Google Docs/SharePoint
 * - Loaded dynamically based on user context
 * - Cached for performance
 * - Updated without code changes
 */

import { resolvePath } from './utils.js';

/**
 * Load a fragment and inject it into a container
 * @param {string|HTMLElement} container - CSS selector or DOM element for container
 * @param {string} fragmentPath - Path to fragment (e.g., '/fragments/hero-builder')
 * @returns {Promise<void>}
 */
export async function loadFragment(container, fragmentPath) {
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!containerEl) {
    console.error(`[Fragment Loader] Container not found: ${container}`);
    return;
  }
  
  try {
    // Fetch the fragment HTML
    // In production EDS, use .plain.html (rendered without header/footer)
    // In prototype/demo mode (localhost, GitHub Pages), use .html directly
    const isPrototypeMode = window.location.hostname === 'localhost' 
      || window.location.hostname === '127.0.0.1'
      || window.location.hostname.includes('github.io');
    const extension = isPrototypeMode ? '.html' : '.plain.html';
    const fullPath = resolvePath(fragmentPath);
    const response = await fetch(`${fullPath}${extension}`);
    
    if (!response.ok) {
      throw new Error(`Fragment not found: ${fragmentPath} (${response.status})`);
    }
    
    const html = await response.text();
    
    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Extract the main content (skip header/footer if present)
    const main = temp.querySelector('main');
    const content = main ? main.innerHTML : html;
    
    // Inject the content
    containerEl.innerHTML = content;
    
    // Force a reflow to ensure styles are applied
    void containerEl.offsetHeight;
    
    // Fix all absolute links in the fragment to use BASE_PATH
    const basePath = window.BASE_PATH || '/';
    const absoluteLinks = containerEl.querySelectorAll('a[href^="/"]');
    absoluteLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Skip external absolute URLs and already-fixed paths
      if (!href.startsWith('//') && !href.startsWith(basePath)) {
        link.setAttribute('href', `${basePath}${href.substring(1)}`);
      }
    });
    
    // Decorate any blocks within the fragment (skip for footer to prevent duplication)
    const isFooterFragment = fragmentPath.includes('footer');
    const blocks = containerEl.querySelectorAll('[data-block-name]');
    if (blocks.length > 0 && !isFooterFragment) {
      const { decorateBlocks } = await import('./scripts.js');
      await decorateBlocks(containerEl);
    }
    
    // For footer fragments, mark as already loaded to prevent re-decoration
    if (isFooterFragment) {
      const footerElement = containerEl.querySelector('.site-footer');
      if (footerElement) {
        footerElement.dataset.blockStatus = 'loaded';
        footerElement.dataset.blockName = 'footer';
      }
    }
    
    console.log(`[Fragment Loader] Loaded: ${fragmentPath}`);
    
  } catch (error) {
    console.error(`[Fragment Loader] Error loading fragment ${fragmentPath}:`, error);
    
    // Show error state in container
    containerEl.innerHTML = `
      <div class="fragment-error">
        <p>Content temporarily unavailable</p>
      </div>
    `;
  }
}

/**
 * Load multiple fragments in parallel
 * @param {Array<{container: string, path: string}>} fragments - Array of fragment configs
 * @returns {Promise<void>}
 */
export async function loadFragments(fragments) {
  await Promise.all(
    fragments.map(({ container, path }) => loadFragment(container, path))
  );
}

/**
 * Preload a fragment (fetch but don't inject)
 * Useful for performance optimization
 * @param {string} fragmentPath - Path to fragment
 * @returns {Promise<string|null>} Fragment HTML or null on error
 */
export async function preloadFragment(fragmentPath) {
  try {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const extension = isLocalDev ? '.html' : '.plain.html';
    const response = await fetch(`${fragmentPath}${extension}`);
    if (!response.ok) {
      throw new Error(`Fragment not found: ${fragmentPath}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`[Fragment Loader] Error preloading fragment ${fragmentPath}:`, error);
    return null;
  }
}

