/**
 * Featured Products Block
 * Displays a curated selection of products on the homepage
 * Reuses product-grid rendering logic for consistency
 */

import { authService } from '../../scripts/auth.js';
import { catalogService } from '../../scripts/services/catalog-service.js';
import { formatCurrency, createProductImage } from '../../scripts/utils.js';

/** Number of products to display - controls grid, API fetch, and skeleton count */
const PRODUCTS_COUNT = 5;

export default async function decorate(block) {
  const container = block.querySelector('.products-container');
  if (!container) return;
  
  // Show loading state
  container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem;"><div class="loading-spinner loading-spinner-sm"></div></div>';
  
  try {
    // Initialize auth to get user context (this also initializes catalogService)
    await authService.initialize();
    const currentUser = authService.getCurrentUser();
    
    // Ensure catalogService is initialized
    if (!catalogService.initialized) {
      const personaId = currentUser?.persona?.id || 'guest';
      await catalogService.initialize(personaId);
    }
    
    console.log('[Featured Products] Using strategy:', catalogService.getActiveStrategy());
    
    // Get products via catalogService (uses mesh or mock based on strategy)
    const result = await catalogService.searchProducts(' ', {
      pageSize: PRODUCTS_COUNT,
      currentPage: 1
    });
    
    // Transform mesh response to expected format
    const products = (result.items || []).map(item => ({
      sku: item.sku,
      name: item.name,
      description: item.description,
      image: item.imageUrl,
      price: item.price?.value || 0,
      inStock: item.inStock,
      category: item.category
    }));
    
    if (products.length === 0) {
      // Show skeleton cards (looks professional, not broken)
      container.innerHTML = '';
      for (let i = 0; i < PRODUCTS_COUNT; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'product-card product-card-skeleton';
        skeleton.innerHTML = `
          <div class="product-card-image skeleton-shimmer"></div>
          <div class="product-card-header">
            <div class="skeleton-shimmer" style="width: 80px; height: 14px; margin-bottom: 8px;"></div>
            <div class="skeleton-shimmer" style="width: 100%; height: 20px;"></div>
          </div>
          <div class="product-card-body" style="min-height: 40px;"></div>
          <div class="product-card-footer">
            <div class="product-card-pricing">
              <div class="skeleton-shimmer" style="width: 80px; height: 24px; margin-bottom: 4px;"></div>
              <div class="skeleton-shimmer" style="width: 60px; height: 14px;"></div>
            </div>
            <div class="product-card-actions">
              <div class="skeleton-shimmer" style="width: 120px; height: 36px; border-radius: var(--shape-border-radius-1);"></div>
            </div>
          </div>
        `;
        container.appendChild(skeleton);
      }
      return;
    }
    
    // Build pricing map from mesh response (price already included in items)
    const pricing = {};
    (result.items || []).forEach(item => {
      if (item.price) {
        pricing[item.sku] = {
          unitPrice: item.price.value,
          currency: item.price.currency,
          retailPrice: null,
          savings: 0,
          savingsPercent: 0
        };
      }
    });
    
    console.log('[Featured Products] Got pricing for', Object.keys(pricing).length, 'products');
    
    // Clear container
    container.innerHTML = '';
    
    // Render products (same logic as product-grid)
    const basePath = window.BASE_PATH || '/';
    
    products.forEach(product => {
      const card = document.createElement('a');
      card.className = 'product-card';
      card.href = `${basePath}pages/product-detail.html?sku=${product.sku}`;
      
      // Image with automatic placeholder fallback (uses shared utility)
      const imageContainer = document.createElement('div');
      imageContainer.className = 'product-card-image';
      createProductImage(imageContainer, product.image, product.name);
      
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
          listPrice.textContent = `List: ${formatCurrency(productPricing.retailPrice)}`;
          pricingContainer.appendChild(listPrice);
        }
        
        const priceValue = document.createElement('div');
        priceValue.className = 'product-card-price';
        priceValue.textContent = formatCurrency(productPricing.unitPrice);
        
        const priceLabel = document.createElement('div');
        priceLabel.className = 'product-card-price-label';
        priceLabel.textContent = 'per unit';
        
        pricingContainer.appendChild(priceValue);
        pricingContainer.appendChild(priceLabel);
        
        // Show savings if customer has discount
        if (productPricing.savings > 0) {
          const savings = document.createElement('div');
          savings.className = 'product-card-savings savings-pill'; // Use shared component
          savings.textContent = `Save ${productPricing.savingsPercent}%`;
          pricingContainer.appendChild(savings);
        }
      } else if (product.price) {
        const priceValue = document.createElement('div');
        priceValue.className = 'product-card-price';
        priceValue.textContent = formatCurrency(product.price);
        
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
      addToCartBtn.className = 'btn btn-primary btn-product-card';
      addToCartBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Add to Cart
      `;
      addToCartBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const button = e.currentTarget;
        const originalHTML = button.innerHTML;

        // Icons matching product-list pattern
        const spinnerHTML = '<span class="loading-spinner loading-spinner-xs"></span>';
        const checkSVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        const errorSVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

        // Loading state
        button.disabled = true;
        button.classList.add('loading');
        button.innerHTML = `${spinnerHTML} Adding...`;

        try {
          const { addProductToCart, showAddToCartNotification } = await import('../../scripts/commerce-helpers.js');

          await addProductToCart(product, 1);

          // Success state
          button.classList.remove('loading');
          button.classList.add('success');
          button.innerHTML = `${checkSVG} Added!`;

          // Show notification
          showAddToCartNotification(product, 1);

          // Reset after 1500ms
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('success');
            button.disabled = false;
          }, 1500);
        } catch (error) {
          console.error('[Featured Products] Add to cart failed:', error);

          // Error state
          button.classList.remove('loading');
          button.classList.add('error');
          button.innerHTML = `${errorSVG} Error`;

          // Reset after 2000ms
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('error');
            button.disabled = false;
          }, 2000);
        }
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

