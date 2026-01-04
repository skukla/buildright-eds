/**
 * Breadcrumbs block
 * Renders breadcrumb navigation based on block content
 * Supports dynamic breadcrumbs based on URL parameters
 */

import { getCategories, getCategoryDisplayName, getCategoryBreadcrumbs } from '../../scripts/services/mesh-client.js';

/**
 * Convert slug to title case (fallback for immediate display)
 * @param {string} slug - URL slug (e.g., "structural-materials")
 * @returns {string} - Title case (e.g., "Structural Materials")
 */
function slugToTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Navigation section mapping (kept - not category data)
const NAV_SECTION_NAMES = {
  'structural-materials': 'Structural Materials',
  'windows-doors': 'Windows & Doors',
  'fasteners-hardware': 'Fasteners & Hardware'
};

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

    // PERFORMANCE: Render fallback immediately (non-blocking)
    // This prevents the blocking POST request from delaying FCP
    const categorySpan = document.createElement('span');
    categorySpan.id = 'breadcrumb-category';
    categorySpan.textContent = slugToTitle(category);
    categorySpan.setAttribute('aria-current', 'page');
    nav.appendChild(categorySpan);

    // Render the fallback immediately
    block.innerHTML = '';
    block.appendChild(nav);

    // PROGRESSIVE ENHANCEMENT: Fetch hierarchical trail in background
    // Update breadcrumbs with full hierarchy when data arrives
    (async () => {
      try {
        const result = await getCategoryBreadcrumbs(category);
        const { trail } = result;

        // Only update if we got a valid trail (even single item for subcategory name)
        if (trail && trail.length > 0) {
          // Rebuild nav with full hierarchy including Home
          const newNav = document.createElement('nav');
          newNav.setAttribute('aria-label', 'Breadcrumb');

          // Always add Home first
          const homeLink = document.createElement('a');
          homeLink.href = '/';
          homeLink.textContent = 'Home';
          newNav.appendChild(homeLink);

          const homeSep = document.createElement('span');
          homeSep.className = 'breadcrumb-separator';
          homeSep.textContent = '/';
          newNav.appendChild(homeSep);

          // Add category trail (parent categories + current)
          trail.forEach((item, index) => {
            const isLast = index === trail.length - 1;

            if (isLast) {
              const span = document.createElement('span');
              span.id = 'breadcrumb-category';
              span.textContent = item.name;
              span.setAttribute('aria-current', 'page');
              newNav.appendChild(span);
            } else {
              const link = document.createElement('a');
              link.href = item.url;
              link.textContent = item.name;
              newNav.appendChild(link);

              const sep = document.createElement('span');
              sep.className = 'breadcrumb-separator';
              sep.textContent = '/';
              newNav.appendChild(sep);
            }
          });

          // Replace breadcrumbs with full hierarchy
          block.innerHTML = '';
          block.appendChild(newNav);
        }
      } catch (error) {
        console.warn('[Breadcrumbs] Background hierarchy fetch failed:', error);
        // Keep fallback - no action needed
      }
    })();

    return;
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

