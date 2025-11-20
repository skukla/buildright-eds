// Pricing display block decoration
import { acoService } from '../../scripts/aco-service.js';
import { authService } from '../../scripts/auth.js';

export default async function decorate(block) {
  const sku = block.getAttribute('data-sku');
  if (!sku) return;

  // Get user context from data attribute or auth service
  let userContext = block.getAttribute('data-user-context');
  if (userContext) {
    try {
      userContext = JSON.parse(userContext);
    } catch (e) {
      userContext = null;
    }
  }

  if (!userContext && authService.isAuthenticated()) {
    userContext = authService.getAcoContext();
  }

  // Load product and update pricing
  async function updatePricing(quantity = 1) {
    try {
      // Get pricing from ACO service
      const pricingResult = await acoService.getPricing({
        productIds: [sku],
        customerGroup: userContext?.customerGroup || 'US-Retail',
        quantity: quantity
      });

      const pricing = pricingResult.pricing[sku];
      if (!pricing) return;

      // Update current price
      const currentPriceEl = block.querySelector('.current-price');
      const tierIndicatorEl = block.querySelector('.tier-indicator');
      
      if (currentPriceEl) {
        currentPriceEl.textContent = `$${pricing.unitPrice.toFixed(2)}`;
      }

      if (tierIndicatorEl) {
        const groupNames = {
          'US-Retail': 'Retail Pricing',
          'Retail-Registered': 'Registered Customer',
          'Trade-Professional': 'Trade Professional',
          'Production-Builder': 'Production Builder',
          'Wholesale-Reseller': 'Wholesale Pricing'
        };
        tierIndicatorEl.textContent = groupNames[pricing.customerGroup] || 'Standard Pricing';
      }

      // Update volume pricing table
      const volumePricingSection = document.getElementById('volume-pricing-section');
      const tiersBody = document.querySelector('.pricing-tiers');
      
      // Show/hide volume pricing section
      if (!pricing.volumeTiers || pricing.volumeTiers.length === 0) {
        if (volumePricingSection) {
          volumePricingSection.style.display = 'none';
        }
        return;
      } else {
        if (volumePricingSection) {
          volumePricingSection.style.display = 'block';
        }
      }
      
      if (tiersBody) {
        // Build HTML for volume pricing tiers
        const rowsHTML = pricing.volumeTiers.map(tier => {
          const isActive = quantity >= tier.minQuantity && 
                          (tier.maxQuantity ? quantity <= tier.maxQuantity : true);
          const activeClass = isActive ? 'active' : '';
          
          const rangeText = tier.maxQuantity 
            ? `${tier.minQuantity}-${tier.maxQuantity} units`
            : `${tier.minQuantity}+ units`;

          return `
            <tr class="${activeClass}">
              <td>${rangeText}</td>
              <td>$${tier.unitPrice.toFixed(2)}</td>
            </tr>
          `;
        }).join('');

        tiersBody.innerHTML = rowsHTML;
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
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

