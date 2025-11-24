/**
 * Fragment Block (EDS Native Pattern)
 * 
 * ⚠️ PROTOTYPE MODE ONLY ⚠️
 * This decorator is ONLY needed for local development and GitHub Pages.
 * In production EDS, fragments are processed SERVER-SIDE automatically.
 * 
 * DELETION INSTRUCTIONS:
 * When migrating to production Adobe Edge Delivery Services:
 * 1. Delete this entire blocks/fragment/ directory
 * 2. Keep the HTML markup unchanged - EDS will process it server-side
 * 3. No other code changes needed
 * 
 * WHAT THIS DOES (Prototype Only):
 * Mimics EDS server-side fragment behavior on the client-side:
 * - Fetches fragment HTML files
 * - Injects content into the page
 * - Decorates any blocks within fragments
 * 
 * HTML markup (same in prototype and production):
 * <div class="fragment" data-block-name="fragment">
 *   <div>/fragments/hero-default</div>
 * </div>
 * 
 * @param {HTMLElement} block - The fragment block element
 */

import { resolvePath } from '../../scripts/utils.js';

export default async function decorate(block) {
  // Extract the fragment path from the block content
  const link = block.querySelector('a[href]');
  const fragmentPath = link ? link.getAttribute('href') : block.textContent.trim();
  
  if (!fragmentPath) {
    console.error('[Fragment Block] No fragment path specified');
    return;
  }
  
  try {
    // Determine file extension based on environment
    // Prototype mode (localhost, GitHub Pages): use .html
    // Production EDS: use .plain.html
    const isPrototypeMode = window.location.hostname === 'localhost' 
      || window.location.hostname === '127.0.0.1'
      || window.location.hostname.includes('github.io');
    const extension = isPrototypeMode ? '.html' : '.plain.html';
    
    // Resolve the full path with BASE_PATH
    const fullPath = resolvePath(fragmentPath);
    const response = await fetch(`${fullPath}${extension}`);
    
    if (!response.ok) {
      throw new Error(`Fragment not found: ${fragmentPath} (${response.status})`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Extract main content (skip header/footer if present)
    const main = temp.querySelector('main');
    const content = main ? main.innerHTML : html;
    
    // Replace block content with fragment content
    block.innerHTML = content;
    
    // Decorate any blocks within the fragment
    const { decorateBlocks } = await import('../../scripts/scripts.js');
    await decorateBlocks(block);
    
    console.log(`[Fragment Block] Loaded: ${fragmentPath}`);
    
  } catch (error) {
    console.error(`[Fragment Block] Error loading ${fragmentPath}:`, error);
    block.innerHTML = `<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">Content temporarily unavailable</p>`;
  }
}

