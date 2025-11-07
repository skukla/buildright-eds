// Product grid block decoration
export default async function decorate(block) {
  const container = block.querySelector('.products-container');
  const countEl = block.querySelector('.product-count');
  if (!container) return;

  // Import data functions
  const { getProducts, getProductsByProjectType, getPrice, getInventoryStatus, getPrimaryWarehouse } = await import('/scripts/data-mock.js');

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

    for (const product of products) {
      const price = getPrice(product, 1);
      const status = getInventoryStatus(product, primaryWarehouse);
      const inventory = product.inventory[primaryWarehouse] || 0;

      const card = document.createElement('a');
      card.className = 'product-card';
      card.href = `pages/product-detail.html?sku=${product.sku}`;

      // Product image placeholder
      const image = document.createElement('div');
      image.className = 'product-card-image';
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

      footer.appendChild(actions);
      card.appendChild(footer);

      container.appendChild(card);
    }
  }

  // Load and filter products
  async function loadProducts() {
    const projectType = localStorage.getItem('buildright_project_type') || '';
    let products;

    if (projectType) {
      products = await getProductsByProjectType(projectType);
    } else {
      products = await getProducts();
    }

    // If this is the featured products container, limit to 4
    if (container.id === 'featured-products' || container.classList.contains('featured-products')) {
      products = products.slice(0, 4);
    }

    renderProducts(products);
  }

  // Listen for filter changes
  window.addEventListener('projectFilterChanged', loadProducts);

  // Initial load
  loadProducts();
}

