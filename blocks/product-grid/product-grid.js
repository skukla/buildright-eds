// Product grid block decoration
import { parseCatalogPath } from '../../scripts/url-router.js';
import { parseHTMLFragment, parseHTML, safeAddEventListener, cleanupEventListeners, cleanElementListeners, resolveImagePath } from '../../scripts/utils.js';
import { catalogService } from '../../scripts/services/catalog-service.js';
import { authService } from '../../scripts/auth.js';
import { getPersona } from '../../scripts/persona-config.js';

export default async function decorate(block) {
  // Ensure idempotent - if already decorated, cleanup first
  if (block._decorated) {
    cleanupEventListeners(window, 'projectFilterChanged');
    cleanupEventListeners(window, 'filtersChanged');
  }
  block._decorated = true;
  
  const container = block.querySelector('.products-container');
  const countEl = block.querySelector('.product-count');
  if (!container) return;

  // Store current filters and persona context
  let currentFilters = {};
  let userContext = null;
  let isValidating = false;

  // Show loading state
  function showLoading() {
    // Show catalog-level loading overlay (if on catalog page)
    window.dispatchEvent(new CustomEvent('catalogLoading'));
    if (!container) return;
    container.innerHTML = ''; // Clear any existing content
  }
  
  // Show validating state (for filter changes)
  function showValidating() {
    isValidating = true;
    container?.classList.add('products-container--validating');
    window.dispatchEvent(new CustomEvent('facetsValidating', { detail: { validating: true }}));
  }
  
  // Hide validating state
  function hideValidating() {
    isValidating = false;
    container?.classList.remove('products-container--validating');
    window.dispatchEvent(new CustomEvent('facetsValidating', { detail: { validating: false }}));
  }
  
  // Render products using product-tile blocks
  let isRendering = false;
  async function renderProducts(products, pricing = {}) {
    if (!container) return;
    
    // Prevent concurrent execution
    if (isRendering) return;
    isRendering = true;
    
    try {
      container.innerHTML = '';

      if (products.length === 0) {
        const emptyMessage = parseHTML(`
          <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xxlarge);">
            <p>No products found matching your criteria.</p>
            <p style="margin-top: var(--spacing-medium);">
              <button class="btn btn-secondary" onclick="window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { reset: true }}))">
                Clear Filters
              </button>
            </p>
          </div>
        `);
        container.appendChild(emptyMessage);
        if (countEl) {
          countEl.textContent = '0 products';
          countEl.style.visibility = 'visible';
        }
        return;
      }

      if (countEl) {
        countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
        countEl.style.visibility = 'visible';
      }

      const basePath = window.BASE_PATH || '/';
      
      // Create product cards using modern card layout
      products.forEach(product => {
        // Create product card wrapper with link
        const card = document.createElement('a');
        card.className = 'product-card';
        card.href = `${basePath}pages/product-detail.html?sku=${product.sku}`;
        
        // Create image container with background image (same as home page)
        const imageContainer = document.createElement('div');
        imageContainer.className = 'product-card-image';
        
        // Only set background image if we have a valid image URL
        const imageUrl = resolveImagePath(product.image || '');
        if (imageUrl && imageUrl.trim() !== '' && !imageUrl.includes('placeholder.png')) {
          imageContainer.style.backgroundImage = `url('${imageUrl}')`;
          imageContainer.style.backgroundSize = 'cover';
          imageContainer.style.backgroundPosition = 'center';
          imageContainer.style.backgroundRepeat = 'no-repeat';
        } else {
          // Add placeholder class if no image
          imageContainer.classList.add('product-card-image-placeholder');
        }
        
        // Create header section (SKU + Name)
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
        
        // Create body section (description - currently empty)
        const body = document.createElement('div');
        body.className = 'product-card-body';
        
        // Create footer section (pricing + actions)
        const footer = document.createElement('div');
        footer.className = 'product-card-footer';
        
        // Pricing section
        const pricingContainer = document.createElement('div');
        pricingContainer.className = 'product-card-pricing';
        
        const productPricing = pricing[product.sku];
        if (productPricing) {
          console.log('Product pricing for', product.sku, productPricing);
          
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
            console.log('Creating savings badge for', product.sku, productPricing.savingsPercent);
            const savings = document.createElement('div');
            savings.className = 'product-card-savings savings-pill'; // Use shared component
            savings.textContent = `Save ${productPricing.savingsPercent}%`;
            pricingContainer.appendChild(savings);
            console.log('Savings badge appended', savings);
          }
        } else if (product.price) {
          const priceValue = document.createElement('div');
          priceValue.className = 'product-card-price';
          priceValue.textContent = `$${product.price.toFixed(2)}`;
          
          const priceLabel = document.createElement('span');
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
        addToCartBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          Add to Cart
        `;
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
    } finally {
      isRendering = false;
    }
  }

  // Load and filter products using faceted search
  async function loadProducts(isFilterUpdate = false) {
    // Show appropriate loading state
    if (isFilterUpdate) {
      showValidating();
    } else {
      showLoading();
    }
    
    try {
      // Initialize auth to get user context (this also initializes catalogService)
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      
      // Ensure catalog service is initialized
      if (!catalogService.initialized) {
        const personaId = currentUser?.persona?.id || null;
        if (personaId) {
          await catalogService.initialize(personaId);
        } else {
          // Use mock strategy for unauthenticated users
          await catalogService.initialize('guest', { forceStrategy: 'mock' });
        }
      }
      
      // Store user context for reference
      if (currentUser && currentUser.persona) {
        const persona = currentUser.persona;
        userContext = {
          userId: currentUser.id || currentUser.email,
          customerGroup: persona.customerGroup,
          personaId: persona.id,
          attributes: persona.attributes
        };
        console.log('[Product Grid] User context:', userContext);
      } else {
        userContext = {
          userId: null,
          customerGroup: 'US-Retail',
          personaId: null,
          attributes: {}
        };
        console.log('[Product Grid] Using default customer group (US-Retail)');
      }
      
      // Parse URL params for category/search filtering
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      const searchQuery = urlParams.get('q') || urlParams.get('search') || '';
      
      // Build search phrase - use category or search query
      let searchPhrase = searchQuery || '';
      
      // Build filter object for faceted search
      const filter = {};
      
      // Add category from URL
      if (category) {
        filter.categoryUrlKey = category;
      }
      
      // Add category from UI filters
      if (currentFilters.category?.length > 0) {
        filter.product_category = currentFilters.category;
      }
      
      // Add price range from UI filters
      if (currentFilters.price_range) {
        const { min, max } = currentFilters.price_range;
        if (min !== null || max !== null) {
          filter.price = [`${min || 0}-${max || 999999}`];
        }
      }
      
      // Query products with facets via catalogService
      console.log('[Product Grid] Fetching products with facets via catalogService:', { 
        searchPhrase, 
        filter,
        strategy: catalogService.getActiveStrategy() 
      });
      
      const result = await catalogService.searchWithFacets({
        phrase: searchPhrase || undefined,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit: 100,
        page: 1
      });
      
      // Transform products to expected format
      const products = (result.products?.items || []).map(item => ({
        sku: item.sku,
        name: item.name,
        description: item.description,
        image: item.imageUrl,
        price: item.price?.value || 0,
        inStock: item.inStock,
        category: item.category,
        attributes: item.attributes?.reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}) || {}
      }));
      
      console.log(`[Product Grid] Loaded ${products.length} products via ${catalogService.getActiveStrategy()}`);
      
      // Emit facets for filter sidebar
      if (result.facets?.facets) {
        console.log('[Product Grid] Emitting facets:', result.facets.facets);
        window.dispatchEvent(new CustomEvent('facetsUpdated', {
          detail: { 
            facets: result.facets.facets,
            totalCount: result.totalCount
          }
        }));
      }
      
      if (products.length === 0) {
        renderProducts([]);
        window.dispatchEvent(new CustomEvent('catalogLoaded'));
        hideValidating();
        return;
      }

      // Build pricing map from response (price already included in items)
      const pricing = {};
      (result.products?.items || []).forEach(item => {
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
      
      console.log('[Product Grid] Got pricing for', Object.keys(pricing).length, 'products');
      
      // Render products with pricing
      renderProducts(products, pricing);
      
      // Emit catalog loaded event (for catalog page loading overlay)
      window.dispatchEvent(new CustomEvent('catalogLoaded'));
      hideValidating();
      
    } catch (error) {
      console.error('[Product Grid] Error loading products:', error);
      container.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xxlarge);">
          <h3>Error Loading Products</h3>
          <p>${error.message || 'Failed to load products. Please try again.'}</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
      window.dispatchEvent(new CustomEvent('catalogLoaded'));
      hideValidating();
    }
  }

  // Listen for filter changes using safe listener management
  safeAddEventListener(window, 'filtersChanged', (event) => {
    if (event.detail?.reset) {
      // Reset filters
      currentFilters = {};
    } else if (event.detail?.filters) {
      // Update filters
      currentFilters = event.detail.filters;
    }
    // Pass true to indicate this is a filter update (show validating state)
    loadProducts(true);
  }, 'product-grid-filters');

  // Initial load
  loadProducts(false);
}
