// Footer block - EDS compatible

import { getCategories, getCategoryDisplayName } from '../../scripts/services/mesh-client.js';

export default async function decorate(block) {
  // Fix static link paths to use BASE_PATH for GitHub Pages compatibility
  const basePath = window.BASE_PATH || '/';
  const pageLinks = block.querySelectorAll('a[href^="pages/"]');
  pageLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.setAttribute('href', `${basePath}${href}`);
  });

  // Update Products column with ACO category names
  await updateProductsColumnWithACO(block);
}

/**
 * Update Products column category links with ACO display names
 * Progressive enhancement - static HTML works as fallback
 * @param {HTMLElement} block - Footer block element
 */
async function updateProductsColumnWithACO(block) {
  try {
    // Find Products column by heading text
    const headings = block.querySelectorAll('.footer-heading');
    let productsColumn = null;

    for (const heading of headings) {
      if (heading.textContent.trim() === 'Products') {
        productsColumn = heading.closest('.footer-column');
        break;
      }
    }

    if (!productsColumn) return;

    // Get ACO categories
    const { categories } = await getCategories();
    if (!categories || categories.length === 0) return;

    // Update category links (skip "All Products")
    const links = productsColumn.querySelectorAll('.footer-links a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.includes('?category=')) return;

      // Extract category slug from URL
      const url = new URL(href, window.location.origin);
      const categorySlug = url.searchParams.get('category');

      if (categorySlug) {
        // Update link text with ACO display name
        link.textContent = getCategoryDisplayName(categorySlug, categories);
      }
    });
  } catch (error) {
    // Graceful degradation - keep static HTML on error
    console.warn('[Footer] Failed to update category names from ACO:', error);
  }
}

