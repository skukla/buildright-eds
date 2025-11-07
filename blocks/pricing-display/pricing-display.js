// Pricing display block decoration
export default async function decorate(block) {
  const sku = block.getAttribute('data-sku');
  if (!sku) return;

  // Import data functions
  const { getProductBySKU, getPrice, getCustomerContext } = await import('../../scripts/data-mock.js');

  // Load product and update pricing
  async function updatePricing(quantity = 1) {
    const product = await getProductBySKU(sku);
    if (!product || !product.pricing) return;

    const context = getCustomerContext();
    const tier = context.tier || 'base';
    const tierPricing = product.pricing[tier] || product.pricing.base;

    // Update current price
    const currentPriceEl = block.querySelector('.current-price');
    const tierIndicatorEl = block.querySelector('.tier-indicator');
    const tiersBody = block.querySelector('.pricing-tiers');

    if (currentPriceEl) {
      const price = getPrice(product, quantity);
      currentPriceEl.textContent = `$${price.toFixed(2)}`;
    }

    if (tierIndicatorEl) {
      const tierNames = {
        'commercial_tier1': 'Commercial Tier 1',
        'commercial_tier2': 'Commercial Tier 2',
        'residential_builder': 'Residential Builder',
        'pro_specialty': 'Pro Specialty',
        'base': 'Base Pricing'
      };
      tierIndicatorEl.textContent = tierNames[tier] || 'Standard Pricing';
    }

    // Update volume pricing table
    if (tiersBody && typeof tierPricing === 'object') {
      tiersBody.innerHTML = '';
      const breakpoints = Object.keys(tierPricing).sort((a, b) => {
        const aNum = parseInt(a.split('-')[0]) || parseInt(a.split('+')[0]);
        const bNum = parseInt(b.split('-')[0]) || parseInt(b.split('+')[0]);
        return aNum - bNum; // Sort ascending
      });

      breakpoints.forEach(breakpoint => {
        const price = tierPricing[breakpoint];
        const row = document.createElement('tr');
        const isActive = (breakpoint.includes('+') && quantity >= parseInt(breakpoint)) ||
                        (breakpoint.includes('-') && (() => {
                          const [min, max] = breakpoint.split('-').map(Number);
                          return quantity >= min && quantity <= max;
                        })());

        if (isActive) {
          row.classList.add('active');
        }

        const rangeCell = document.createElement('td');
        rangeCell.textContent = breakpoint.includes('+') 
          ? `${breakpoint.replace('+', '')}+ units`
          : `${breakpoint} units`;
        row.appendChild(rangeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `$${price.toFixed(2)}`;
        row.appendChild(priceCell);

        tiersBody.appendChild(row);
      });
    }
  }

  // Listen for quantity changes
  window.addEventListener('quantityChanged', (e) => {
    if (e.detail.sku === sku) {
      updatePricing(e.detail.quantity);
    }
  });

  // Initial load
  updatePricing();
}

