// Product grid block decoration
import { parseCatalogPath } from '../../scripts/url-router.js';
import { parseHTMLFragment, parseHTML } from '../../scripts/utils.js';

export default async function decorate(block) {
  const container = block.querySelector('.products-container');
  const countEl = block.querySelector('.product-count');
  if (!container) return;

  // Import data functions
  const { getProducts, getProductsByProjectType, getProductsByCategory, getPrice, getInventoryStatus, getPrimaryWarehouse, getProductImageUrl } = await import('../../scripts/data-mock.js');

  // Render products using HTML templates (reduces DOM manipulation)
  async function renderProducts(products) {
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
      const emptyMessage = parseHTML('<p class="text-center py-5" style="grid-column: 1 / -1;">No products found matching your criteria.</p>');
      container.appendChild(emptyMessage);
      if (countEl) countEl.textContent = '0 products';
      return;
    }

    if (countEl) {
      countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    }

    const primaryWarehouse = getPrimaryWarehouse();
    
    // Check if kit mode is active (show "Add to Kit" if kit has items and user chose to edit)
    const { getWizardState, hasKitItems } = await import('../../scripts/project-builder.js');
    const wizardState = getWizardState();
    const resumeChoice = sessionStorage.getItem('kit_mode_resume_choice');
    // Show "Add to Kit" buttons only if user explicitly chose to edit kit and kit has items
    const hasActiveKit = resumeChoice === 'edit' && hasKitItems();

    // Escape HTML helper
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Build HTML template for all products
    const productsHTML = products.map(product => {
      const price = getPrice(product, 1);
      const status = getInventoryStatus(product, primaryWarehouse);
      const inventory = product.inventory[primaryWarehouse] || 0;
      const imageUrl = getProductImageUrl(product);
      const imageStyle = imageUrl ? `style="background-image: url('${imageUrl.replace(/'/g, "\\'")}')"` : '';
      
      const statusText = status === 'in-stock' ? `${inventory} available` : 
                        status === 'low-stock' ? `Low stock (${inventory})` : 
                        'Out of stock';
      
      const actionButton = hasActiveKit 
        ? `<button class="btn btn-primary btn-sm" data-action="add-to-kit" data-sku="${escapeHtml(product.sku)}">Add to Kit</button>`
        : `<button class="btn btn-primary btn-sm" data-action="add-to-cart" data-sku="${escapeHtml(product.sku)}">Add to Cart</button>`;

      return `
        <a class="product-card" href="pages/product-detail.html?sku=${escapeHtml(product.sku)}">
          <div class="product-card-image bg-image" ${imageStyle}></div>
          <div class="product-card-header">
            <div class="product-card-sku">${escapeHtml(product.sku)}</div>
            <div class="product-card-name">${escapeHtml(product.name)}</div>
          </div>
          <div class="product-card-body">
            <div class="product-card-description">${escapeHtml(product.description || '')}</div>
          </div>
          <div class="product-card-footer">
            <div class="product-card-pricing">
              <span class="product-card-price">$${price.toFixed(2)}</span>
              <span class="product-card-price-label">per unit</span>
            </div>
            <div class="product-card-inventory">
              <span class="status ${status}">${escapeHtml(statusText)}</span>
            </div>
            <div class="product-card-actions">
              ${actionButton}
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Parse and append all products at once
    const fragment = parseHTMLFragment(productsHTML);
    container.appendChild(fragment);

    // Setup event listeners for action buttons
    container.querySelectorAll('[data-action="add-to-kit"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sku = btn.getAttribute('data-sku');
        
        // Check if item already exists before adding
        const { getFullKit } = await import('../../scripts/project-builder.js');
        const fullKit = getFullKit();
        const itemExists = fullKit?.items?.some(item => item.sku === sku) || false;
        
        // Add item and update sidebar
        const { addCustomItemToKit } = await import('../../scripts/project-builder.js');
        await addCustomItemToKit(sku, 1, `Added from catalog`);
        
        // Update kit sidebar - scroll and highlight if existing, fade in if new
        const { updateKitSidebar } = await import('../../scripts/kit-sidebar.js');
        await updateKitSidebar(true, itemExists ? sku : null);
      });
    });

    container.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sku = btn.getAttribute('data-sku');
        window.dispatchEvent(new CustomEvent('addToCart', {
          detail: { sku, quantity: 1 }
        }));
      });
    });
  }

  // Load and filter products
  async function loadProducts() {
    try {
      // Check if we're on the catalog page and parse the path
      // First check if we were redirected via 404 (sessionStorage will have the original path)
      const redirectPath = sessionStorage.getItem('spa_redirect_path');
      const currentPath = redirectPath || window.location.pathname;
      
      // Clear the redirect path now that we've used it
      if (redirectPath) {
        sessionStorage.removeItem('spa_redirect_path');
      }
      
      const catalogInfo = parseCatalogPath(currentPath);
      
      let products;

      // Filter by category from path if on catalog page
      if (catalogInfo.type === 'category') {
        console.log(`Loading products for category: ${catalogInfo.value}`);
        products = await getProductsByCategory(catalogInfo.value);
      } else if (catalogInfo.type === 'division') {
        console.log(`Loading products for division: ${catalogInfo.value}`);
        // For now, divisions show all products (could be enhanced later)
        products = await getProducts();
      } else {
        // Check for project type from localStorage as fallback
        const projectType = localStorage.getItem('buildright_project_type') || '';
      if (projectType) {
        products = await getProductsByProjectType(projectType);
      } else {
        products = await getProducts();
        }
      }

      if (!products || products.length === 0) {
        console.warn('No products found');
        if (container) {
          const emptyMessage = parseHTML('<p class="text-center py-5" style="grid-column: 1 / -1;">No products found.</p>');
          container.innerHTML = '';
          container.appendChild(emptyMessage);
        }
        return;
      }

      // If this is the featured products container, limit to 4
      if (container.id === 'featured-products' || container.classList.contains('featured-products')) {
        products = products.slice(0, 4);
      }

      renderProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      if (container) {
        const errorMessage = parseHTML('<p class="text-center py-5 text-error" style="grid-column: 1 / -1;">Error loading products. Please refresh the page.</p>');
        container.innerHTML = '';
        container.appendChild(errorMessage);
      }
    }
  }

  // Listen for filter changes
  window.addEventListener('projectFilterChanged', loadProducts);

  // Initial load
  loadProducts();
}

