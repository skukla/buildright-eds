// Cart summary block decoration
export default async function decorate(block) {
  // Import data functions
  const { getProductBySKU, getPrice } = await import('../../scripts/data-mock.js');

  // Update cart summary
  async function updateCartSummary() {
    const itemsContainer = block.querySelector('.summary-items');
    const subtotalEl = block.querySelector('.subtotal');
    const savingsEl = block.querySelector('.savings');
    const totalEl = block.querySelector('.total-amount');

    if (!itemsContainer) return;

    // Load cart from localStorage
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
    } catch (e) {
      cart = [];
    }

    itemsContainer.innerHTML = '';

    let subtotal = 0;
    let baseTotal = 0;

    for (const item of cart) {
      // Handle bundles
      if (item.type === 'bundle') {
        const itemTotal = item.totalPrice || 0;
        subtotal += itemTotal;
        // For bundles, use bundle price as base (no savings calculation for now)
        baseTotal += itemTotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';

        const info = document.createElement('div');
        info.className = 'summary-item-info';

        const name = document.createElement('div');
        name.className = 'summary-item-name';
        name.textContent = item.bundleName || 'Project Bundle';
        info.appendChild(name);

        const details = document.createElement('div');
        details.className = 'summary-item-details';
        details.textContent = `${item.itemCount || 0} items`;
        info.appendChild(details);

        itemEl.appendChild(info);

        const priceEl = document.createElement('div');
        priceEl.className = 'summary-item-price';
        priceEl.textContent = `$${itemTotal.toFixed(2)}`;
        itemEl.appendChild(priceEl);

        itemsContainer.appendChild(itemEl);
        continue;
      }

      // Handle regular products
      const product = await getProductBySKU(item.sku);
      if (!product) continue;

      const price = getPrice(product, item.quantity);
      const basePrice = product.pricing?.base || price;
      const itemTotal = price * item.quantity;
      const itemBaseTotal = basePrice * item.quantity;

      subtotal += itemTotal;
      baseTotal += itemBaseTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'summary-item';

      const info = document.createElement('div');
      info.className = 'summary-item-info';

      const name = document.createElement('div');
      name.className = 'summary-item-name';
      name.textContent = product.name;
      info.appendChild(name);

      const details = document.createElement('div');
      details.className = 'summary-item-details';
      details.textContent = `${item.quantity} × $${price.toFixed(2)}`;
      info.appendChild(details);

      itemEl.appendChild(info);

      const priceEl = document.createElement('div');
      priceEl.className = 'summary-item-price';
      priceEl.textContent = `$${itemTotal.toFixed(2)}`;
      itemEl.appendChild(priceEl);

      itemsContainer.appendChild(itemEl);
    }

    const savings = baseTotal - subtotal;

    if (subtotalEl) {
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    if (savingsEl) {
      savingsEl.textContent = `$${savings.toFixed(2)}`;
      if (savings <= 0) {
        savingsEl.textContent = '$0.00';
      }
    }

    if (totalEl) {
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
  }

  // Listen for cart updates
  window.addEventListener('cartUpdated', updateCartSummary);

  // Initial load
  updateCartSummary();
}

