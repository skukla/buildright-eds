// Product grid block decoration
import { parseCatalogPath } from '../../scripts/url-router.js';

export default async function decorate(block) {
  const container = block.querySelector('.products-container');
  const countEl = block.querySelector('.product-count');
  if (!container) return;

  // Import data functions
  const { getProducts, getProductsByProjectType, getProductsByCategory, getPrice, getInventoryStatus, getPrimaryWarehouse, getProductImageUrl } = await import('../../scripts/data-mock.js');

  // Render products
  async function renderProducts(products) {
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 3rem;">No products found matching your criteria.</p>';
      if (countEl) countEl.textContent = '0 products';
      return;
    }

    if (countEl) {
      countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    }

    const primaryWarehouse = getPrimaryWarehouse();
    
    // Check if kit mode is active (show "Add to Kit" if wizard state exists, even if empty)
    const { getWizardState } = await import('../../scripts/project-builder.js');
    const wizardState = getWizardState();
    // Show "Add to Kit" buttons if there's a bundle (even if empty) or customItems exist
    // This allows users to add items back even if kit became empty
    const hasActiveKit = wizardState && (wizardState.bundle || wizardState.customItems);

    for (const product of products) {
      const price = getPrice(product, 1);
      const status = getInventoryStatus(product, primaryWarehouse);
      const inventory = product.inventory[primaryWarehouse] || 0;
      const imageUrl = getProductImageUrl(product);

      const card = document.createElement('a');
      card.className = 'product-card';
      card.href = `pages/product-detail.html?sku=${product.sku}`;

      // Product image with background
      const image = document.createElement('div');
      image.className = 'product-card-image';
      if (imageUrl) {
        image.style.backgroundImage = `url('${imageUrl}')`;
        image.style.backgroundSize = 'cover';
        image.style.backgroundPosition = 'center';
        image.style.backgroundRepeat = 'no-repeat';
      }
      card.appendChild(image);

      const header = document.createElement('div');
      header.className = 'product-card-header';

      const sku = document.createElement('div');
      sku.className = 'product-card-sku';
      sku.textContent = product.sku;
      header.appendChild(sku);

      const name = document.createElement('div');
      name.className = 'product-card-name';
      name.textContent = product.name;
      header.appendChild(name);

      card.appendChild(header);

      const body = document.createElement('div');
      body.className = 'product-card-body';

      const description = document.createElement('div');
      description.className = 'product-card-description';
      description.textContent = product.description || '';
      body.appendChild(description);

      card.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'product-card-footer';

      const pricing = document.createElement('div');
      pricing.className = 'product-card-pricing';

      const priceEl = document.createElement('span');
      priceEl.className = 'product-card-price';
      priceEl.textContent = `$${price.toFixed(2)}`;
      pricing.appendChild(priceEl);

      const priceLabel = document.createElement('span');
      priceLabel.className = 'product-card-price-label';
      priceLabel.textContent = 'per unit';
      pricing.appendChild(priceLabel);

      footer.appendChild(pricing);

      const inventoryDiv = document.createElement('div');
      inventoryDiv.className = 'product-card-inventory';

      const statusBadge = document.createElement('span');
      statusBadge.className = `status ${status}`;
      statusBadge.textContent = status === 'in-stock' ? `${inventory} available` : 
                                status === 'low-stock' ? `Low stock (${inventory})` : 
                                'Out of stock';
      inventoryDiv.appendChild(statusBadge);

      footer.appendChild(inventoryDiv);

      const actions = document.createElement('div');
      actions.className = 'product-card-actions';

      if (hasActiveKit) {
        // Kit mode: Only show "Add to Kit" button
        const addToKitBtn = document.createElement('button');
        addToKitBtn.className = 'btn btn-primary btn-sm';
        addToKitBtn.textContent = 'Add to Kit';
        addToKitBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { addCustomItemToKit } = await import('../../scripts/project-builder.js');
          await addCustomItemToKit(product.sku, 1, `Added from catalog`);
          
          // Update kit sidebar (will show empty state if needed, or recreate if missing)
          const { updateKitSidebar } = await import('../../scripts/kit-sidebar.js');
          await updateKitSidebar();
          
          // Show feedback
          const originalText = addToKitBtn.textContent;
          addToKitBtn.textContent = 'Added!';
          addToKitBtn.disabled = true;
          setTimeout(() => {
            addToKitBtn.textContent = originalText;
            addToKitBtn.disabled = false;
          }, 2000);
        };
        actions.appendChild(addToKitBtn);
      } else {
        // Normal mode: Show "Add to Cart" button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-primary btn-sm';
        addBtn.textContent = 'Add to Cart';
        addBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('addToCart', {
            detail: { sku: product.sku, quantity: 1 }
          }));
        };
        actions.appendChild(addBtn);
      }

      footer.appendChild(actions);
      card.appendChild(footer);

      container.appendChild(card);
    }
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
          container.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 3rem;">No products found.</p>';
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
        container.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 3rem; color: var(--color-negative-500);">Error loading products. Please refresh the page.</p>';
      }
    }
  }

  // Listen for filter changes
  window.addEventListener('projectFilterChanged', loadProducts);

  // Initial load
  loadProducts();
}

