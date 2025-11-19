/**
 * Featured Products Block
 * Displays a curated selection of products on the homepage
 * Reuses product-grid rendering logic for consistency
 */

import { authService } from '../../scripts/auth.js';
import { acoService } from '../../scripts/aco-service.js';

export default async function decorate(block) {
  const container = block.querySelector('.products-container');
  if (!container) return;
  
  // Show loading state
  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem;"><div class="loading-spinner loading-spinner-sm"></div></div>';
  
  try {
    // Initialize auth to get user context
    await authService.initialize();
    const currentUser = authService.getCurrentUser();
    
    // Build user context for ACO
    let userContext = {};
    if (currentUser && currentUser.persona) {
      const persona = currentUser.persona;
      userContext = {
        userId: currentUser.id || currentUser.email,
        customerGroup: persona.customerGroup,
        personaId: persona.id,
        attributes: persona.attributes
      };
      console.log('[Featured Products] User context:', userContext);
    } else {
      // Default to retail customer group
      userContext = {
        userId: null,
        customerGroup: 'US-Retail',
        personaId: null,
        attributes: {}
      };
      console.log('[Featured Products] Using default retail context');
    }
    
    // Get products from ACO
    const result = await acoService.getProducts({
      filters: {},
      userContext,
      limit: 4,
      offset: 0
    });
    
    const products = result.products || [];
    
    if (products.length === 0) {
      container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No products available</p>';
      return;
    }
    
    // Get pricing for all products
    const productIds = products.map(p => p.sku);
    const pricingResult = await acoService.getPricing({
      productIds,
      customerGroup: userContext.customerGroup,
      quantity: 1
    });
    
    const pricing = pricingResult.pricing || {};
    console.log('[Featured Products] Got pricing for', Object.keys(pricing).length, 'products');
    
    // Clear container
    container.innerHTML = '';
    
    // Render products (same logic as product-grid)
    const basePath = window.BASE_PATH || '/';
    
    products.forEach(product => {
      const card = document.createElement('a');
      card.className = 'product-card';
      card.href = `${basePath}pages/product-detail.html?sku=${product.sku}`;
      
      // Image
      const imageContainer = document.createElement('div');
      imageContainer.className = 'product-card-image';
      
      const imageUrl = product.image || '';
      if (imageUrl && imageUrl.trim() !== '' && imageUrl !== `${basePath}/images/products/placeholder.png`) {
        imageContainer.style.backgroundImage = `url('${imageUrl}')`;
        imageContainer.style.backgroundSize = 'cover';
        imageContainer.style.backgroundPosition = 'center';
        imageContainer.style.backgroundRepeat = 'no-repeat';
      } else {
        imageContainer.classList.add('product-card-image-placeholder', 'image-placeholder-pattern');
      }
      
      // Header
      const header = document.createElement('div');
      header.className = 'product-card-header';
      
      const sku = document.createElement('div');
      sku.className = 'product-card-sku';
      sku.textContent = product.sku;
      
      const name = document.createElement('div');
      name.className = 'product-card-name';
      name.textContent = product.name;
      
      header.appendChild(sku);
      header.appendChild(name);
      
      // Body (empty for featured products)
      const body = document.createElement('div');
      body.className = 'product-card-body';
      
      // Footer
      const footer = document.createElement('div');
      footer.className = 'product-card-footer';
      
      // Pricing section
      const pricingContainer = document.createElement('div');
      pricingContainer.className = 'product-card-pricing';
      
      const productPricing = pricing[product.sku];
      if (productPricing) {
        // Show list price if customer has a discount
        if (productPricing.savings > 0 && productPricing.retailPrice) {
          const listPrice = document.createElement('div');
          listPrice.className = 'product-card-list-price';
          listPrice.textContent = `List: $${productPricing.retailPrice.toFixed(2)}`;
          pricingContainer.appendChild(listPrice);
        }
        
        const priceValue = document.createElement('div');
        priceValue.className = 'product-card-price';
        priceValue.textContent = `$${productPricing.unitPrice.toFixed(2)}`;
        
        const priceLabel = document.createElement('div');
        priceLabel.className = 'product-card-price-label';
        priceLabel.textContent = 'per unit';
        
        pricingContainer.appendChild(priceValue);
        pricingContainer.appendChild(priceLabel);
        
        // Show savings if customer has discount
        if (productPricing.savings > 0) {
          const savings = document.createElement('div');
          savings.className = 'product-card-savings';
          savings.textContent = `Save ${productPricing.savingsPercent}%`;
          pricingContainer.appendChild(savings);
        }
      } else if (product.price) {
        const priceValue = document.createElement('div');
        priceValue.className = 'product-card-price';
        priceValue.textContent = `$${product.price.toFixed(2)}`;
        
        const priceLabel = document.createElement('div');
        priceLabel.className = 'product-card-price-label';
        priceLabel.textContent = 'per unit';
        
        pricingContainer.appendChild(priceValue);
        pricingContainer.appendChild(priceLabel);
      }
      
      // Add to cart button
      const actions = document.createElement('div');
      actions.className = 'product-card-actions';
      
      const addToCartBtn = document.createElement('button');
      addToCartBtn.className = 'btn btn-primary';
      addToCartBtn.textContent = 'Add to Cart';
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('addToCart', {
          detail: { sku: product.sku, quantity: 1, productName: product.name }
        }));
      });
      actions.appendChild(addToCartBtn);
      
      footer.appendChild(pricingContainer);
      footer.appendChild(actions);
      
      // Assemble the card
      card.appendChild(imageContainer);
      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(footer);
      
      container.appendChild(card);
    });
  } catch (error) {
    console.error('[Featured Products] Error loading products:', error);
    container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-negative-500);">Error loading products</p>';
  }
}

