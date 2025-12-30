/**
 * Breadcrumbs block
 * Renders breadcrumb navigation based on block content
 * Supports dynamic breadcrumbs based on URL parameters
 */

import { getCategories, getCategoryDisplayName, getCategoryBreadcrumbs } from '../../scripts/services/mesh-client.js';

// Navigation section mapping (kept - not category data)
const NAV_SECTION_NAMES = {
  'structural-materials': 'Structural Materials',
  'windows-doors': 'Windows & Doors',
  'fasteners-hardware': 'Fasteners & Hardware'
};

/**
 * Wait for dropins to initialize (persona headers available)
 * @returns {Promise<void>}
 */
function waitForDropins() {
  return new Promise((resolve) => {
    if (window.dropinsReady) {
      resolve();
    } else {
      document.addEventListener('dropins:initialized', resolve, { once: true });
      // Timeout fallback to prevent indefinite wait
      setTimeout(resolve, 3000);
    }
  });
}

/**
 * Build hierarchical breadcrumb trail from mesh query
 * Renders: Home > Parent Category > ... > Current Category
 *
 * @param {string} slug - Category URL slug
 * @param {HTMLElement} nav - Navigation element to append items to
 * @returns {Promise<boolean>} - True if trail was rendered, false if fallback needed
 */
async function buildCategoryBreadcrumbs(slug, nav) {
  try {
    // Wait for dropins to initialize (ensures persona headers are available)
    await waitForDropins();

    const result = await getCategoryBreadcrumbs(slug);
    const { trail } = result;

    if (!trail || trail.length === 0) {
      return false; // Use fallback
    }

    // Render each item in the trail
    trail.forEach((item, index) => {
      const isLast = index === trail.length - 1;

      if (isLast) {
        // Current category - render as span (not clickable)
        const span = document.createElement('span');
        span.textContent = item.name;
        span.setAttribute('aria-current', 'page');
        nav.appendChild(span);
      } else {
        // Parent category - render as link
        const link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.name;
        nav.appendChild(link);

        // Add separator after non-last items
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '/';
        nav.appendChild(separator);
      }
    });

    return true;
  } catch (error) {
    console.warn('[Breadcrumbs] Failed to build category trail:', error);
    return false;
  }
}

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');

  if (rows.length === 0) return;

  // Create nav element
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  // Check for category URL parameter - if present, use hierarchical trail
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  if (category) {
    // Extract Home link from first row (if available)
    const firstRow = rows[0];
    const firstCols = firstRow?.querySelectorAll(':scope > div');
    const firstLink = firstCols?.[0]?.querySelector('a');

    if (firstLink) {
      nav.appendChild(firstLink.cloneNode(true));
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.textContent = '/';
      nav.appendChild(separator);
    }

    // Build hierarchical trail from mesh query
    const trailRendered = await buildCategoryBreadcrumbs(category, nav);

    if (trailRendered) {
      // Successfully rendered hierarchical trail
      block.innerHTML = '';
      block.appendChild(nav);
      return;
    }

    // Trail rendering failed - clear nav to avoid duplicate Home
    nav.innerHTML = '';
    // Fall through to default behavior
  }

  // Default behavior: Process each row from HTML content
  // Using for loop instead of forEach to properly await async operations
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const cols = row.querySelectorAll(':scope > div');
    if (cols.length === 0) continue;

    // First column has the text/link
    const content = cols[0];
    const link = content.querySelector('a');

    if (link) {
      // It's a link
      nav.appendChild(link);
    } else {
      // It's plain text (current page) - may need to be dynamic
      const span = document.createElement('span');
      let breadcrumbText = content.textContent.trim();

      // Check if this is the last breadcrumb and should be dynamic
      if (index === rows.length - 1) {
        breadcrumbText = await getDynamicBreadcrumbText(breadcrumbText);
      }

      span.textContent = breadcrumbText;
      nav.appendChild(span);
    }

    // Add separator unless it's the last item
    if (index < rows.length - 1) {
      const separator = document.createElement('span');
      separator.textContent = '/';
      nav.appendChild(separator);
    }
  }

  // Replace block content with nav
  block.innerHTML = '';
  block.appendChild(nav);
}

/**
 * Determine the dynamic breadcrumb text based on page context
 * @param {string} defaultText - The default text from HTML
 * @returns {Promise<string>} - The dynamic breadcrumb text
 */
async function getDynamicBreadcrumbText(defaultText) {
  // Check URL parameters for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  if (category) {
    // Use ACO data via shared getCategoryDisplayName
    const { categories } = await getCategories();
    return getCategoryDisplayName(category, categories);
  }

  // Check for active navigation section
  const activeNav = document.querySelector('.header-nav-link.active');
  if (activeNav) {
    const navHref = activeNav.getAttribute('href');
    if (navHref) {
      const section = navHref.split('#')[1] || navHref.split('/').pop().replace('.html', '');
      if (NAV_SECTION_NAMES[section]) {
        return NAV_SECTION_NAMES[section];
      }
    }
  }

  // For catalog page with no filter, default to "All Products"
  if (window.location.pathname.includes('catalog')) {
    return 'All Products';
  }

  // Otherwise return the default text
  return defaultText;
}

