// Tier badge block decoration
export default async function decorate(block) {
  // Import data functions
  const { getCustomerContext } = await import('../../scripts/data-mock.js');

  // Update tier badge
  function updateTierBadge() {
    const context = getCustomerContext();
    const tier = context.tier || 'base';
    const tierLabel = block.querySelector('.tier-label');
    const savingsIndicator = block.querySelector('.savings-indicator');

    const tierNames = {
      'commercial_tier1': 'Commercial Tier 1',
      'commercial_tier2': 'Commercial Tier 2',
      'residential_builder': 'Residential Builder',
      'pro_specialty': 'Pro Specialty',
      'base': 'Standard Pricing'
    };

    const savings = {
      'commercial_tier1': 'Volume Pricing Benefits',
      'commercial_tier2': 'Volume Pricing Benefits',
      'residential_builder': 'Volume Pricing Benefits',
      'pro_specialty': 'Volume Pricing Benefits',
      'base': ''
    };

    if (tierLabel) {
      tierLabel.textContent = tierNames[tier] || 'Standard Pricing';
    }

    if (savingsIndicator) {
      savingsIndicator.textContent = savings[tier] || '';
    }

    // Add tier class for styling
    block.className = 'tier-badge';
    if (tier !== 'base') {
      block.classList.add(tier.replace('_', '-'));
    }
  }

  // Initial load
  updateTierBadge();

  // Listen for context changes
  window.addEventListener('customerContextChanged', updateTierBadge);
}

