// Pricing Calculator - Tier-based pricing calculations

// Import data functions
async function getPriceCalculator() {
  const { getProductBySKU, getCustomerContext } = await import('./data-mock.js');
  
  return {
    // Calculate price for product at quantity
    calculatePrice: async (sku, quantity = 1) => {
      const product = await getProductBySKU(sku);
      if (!product || !product.pricing) return null;

      const context = getCustomerContext();
      const tier = context.tier || 'base';
      const tierPricing = product.pricing[tier] || product.pricing.base;

      if (typeof tierPricing === 'number') {
        return tierPricing;
      }

      // Find the right price tier based on quantity
      const breakpoints = Object.keys(tierPricing).sort((a, b) => {
        const aNum = parseInt(a.split('-')[0]) || parseInt(a.split('+')[0]);
        const bNum = parseInt(b.split('-')[0]) || parseInt(b.split('+')[0]);
        return bNum - aNum; // Sort descending
      });

      for (const breakpoint of breakpoints) {
        if (breakpoint.includes('+')) {
          const min = parseInt(breakpoint);
          if (quantity >= min) return tierPricing[breakpoint];
        } else {
          const [min, max] = breakpoint.split('-').map(Number);
          if (quantity >= min && quantity <= max) return tierPricing[breakpoint];
        }
      }

      // Fallback to first price
      return Object.values(tierPricing)[0];
    },

    // Calculate total for cart item
    calculateItemTotal: async (sku, quantity) => {
      const price = await this.calculatePrice(sku, quantity);
      return price ? price * quantity : 0;
    },

    // Calculate savings vs base pricing
    calculateSavings: async (sku, quantity) => {
      const product = await getProductBySKU(sku);
      if (!product || !product.pricing) return 0;

      const basePrice = product.pricing.base || 0;
      const tierPrice = await this.calculatePrice(sku, quantity);
      
      if (!tierPrice || !basePrice) return 0;
      
      return (basePrice - tierPrice) * quantity;
    },

    // Get price breakpoints for product
    getPriceBreakpoints: async (sku) => {
      const product = await getProductBySKU(sku);
      if (!product || !product.pricing) return [];

      const context = getCustomerContext();
      const tier = context.tier || 'base';
      const tierPricing = product.pricing[tier] || product.pricing.base;

      if (typeof tierPricing === 'number') {
        return [{ range: '1+', price: tierPricing }];
      }

      return Object.entries(tierPricing).map(([range, price]) => ({
        range,
        price
      }));
    }
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getPriceCalculator };
}

