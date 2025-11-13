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
    let tierPricing = product.pricing[tier] || product.pricing.base;

    // Update current price
    const currentPriceEl = block.querySelector('.current-price');
    const tierIndicatorEl = block.querySelector('.tier-indicator');
    // Look for pricing tiers table in the page (may be outside the block)
    const tiersBody = document.querySelector('.pricing-tiers');

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

    // Update volume pricing table using HTML templates
    const volumePricingSection = document.getElementById('volume-pricing-section');
    
    // Hide volume pricing section for base pricing (no volume discounts)
    if (tier === 'base' && typeof tierPricing === 'number') {
      if (volumePricingSection) {
        volumePricingSection.style.display = 'none';
      }
      return; // Don't populate the table
    } else {
      if (volumePricingSection) {
        volumePricingSection.style.display = 'block';
      }
    }
    
    if (tiersBody && typeof tierPricing === 'object') {
      const breakpoints = Object.keys(tierPricing).sort((a, b) => {
        const aNum = parseInt(a.split('-')[0]) || parseInt(a.split('+')[0]);
        const bNum = parseInt(b.split('-')[0]) || parseInt(b.split('+')[0]);
        return aNum - bNum; // Sort ascending
      });

      // Build HTML template for all pricing tier rows
      const rowsHTML = breakpoints.map(breakpoint => {
        const price = tierPricing[breakpoint];
        const isActive = (breakpoint.includes('+') && quantity >= parseInt(breakpoint)) ||
                        (breakpoint.includes('-') && (() => {
                          const [min, max] = breakpoint.split('-').map(Number);
                          return quantity >= min && quantity <= max;
                        })());

        const activeClass = isActive ? 'active' : '';
        const rangeText = breakpoint.includes('+') 
          ? `${breakpoint.replace('+', '')}+ units`
          : `${breakpoint} units`;

        return `
          <tr class="${activeClass}">
            <td>${rangeText}</td>
            <td>$${price.toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      // Parse and append all rows at once
      tiersBody.innerHTML = rowsHTML;
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

