/**
 * Product List Dropin - Level 2 Integration with Full Slot Customization
 * 
 * Architecture:
 * - Uses Product Discovery dropin containers (SearchResults, Facets, SortBy, Pagination)
 * - Customizes ALL slots to match BuildRight design exactly
 * - Leverages Adobe's search logic, state management, URL sync
 * - Maintains BuildRight's exact HTML/CSS for product cards
 * 
 * Comparison to Custom Implementation:
 * - WITH Dropin: Adobe maintains search logic | 100% design match (pixel-perfect)
 * - WITHOUT Dropin: You maintain search logic | 100% design match
 */

import { initializers } from '@dropins/tools/initializer.js';

export default async function decorate(block) {
  console.log('[ProductListDropin] Initializing Level 2 integration with full slots...');
  
  // Get containers
  const searchResultsContainer = block.querySelector('.dropin-search-results-container');
  const facetsContainer = document.querySelector('.dropin-facets-container');
  const sortByContainer = document.querySelector('.dropin-sort-container');
  const paginationContainer = block.querySelector('.dropin-pagination-container');
  const productCount = block.querySelector('.product-count');
  
  if (!searchResultsContainer) {
    console.error('[ProductListDropin] Search results container not found');
    return;
  }
  
  try {
    // Ensure dropins are initialized first
    const { shouldUseDropins, initializeDropins } = await import('../../scripts/initializers/index.js');
    if (!await shouldUseDropins()) {
      throw new Error('Commerce Dropins are not enabled in config');
    }
    
    // Wait for dropins initialization
    await initializeDropins();
    console.log('[ProductListDropin] Dropins initialized, rendering containers...');
    
    // Import dropin render function and containers
    const { render } = await import('@dropins/storefront-product-discovery/render.js');
    const SearchResults = (await import('@dropins/storefront-product-discovery/containers/SearchResults.js')).default;
    const Facets = (await import('@dropins/storefront-product-discovery/containers/Facets.js')).default;
    const SortBy = (await import('@dropins/storefront-product-discovery/containers/SortBy.js')).default;
    const Pagination = (await import('@dropins/storefront-product-discovery/containers/Pagination.js')).default;
    
    // Render SearchResults with FULL slot customization
    console.log('[ProductListDropin] Rendering SearchResults with custom slots...');
    
    const slotsConfig = {
      /**
       * ProductImage Slot - BuildRight namespaced wrapper
       */
      ProductImage: (ctx) => {
        console.log('[ProductListDropin] ProductImage slot called for product:', ctx.product?.sku);
        const { product } = ctx;
        
        // Create BuildRight-namespaced wrapper
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'buildright-product-image-wrapper';
        
        // BuildRight image with fallback logic
        let imageUrl = product.images?.[0]?.url;
        if (!imageUrl || imageUrl.trim() === '') {
          const baseSku = product.sku?.replace(/-OPTION$/, '') || '';
          imageUrl = `/images/products/${baseSku}.jpg`;
        }
        
        // Use DIV with background-image for sharper rendering (matches /catalog)
        const imageDiv = document.createElement('div');
        imageDiv.className = 'buildright-product-image';
        imageDiv.style.backgroundImage = `url('${imageUrl}')`;
        imageDiv.setAttribute('role', 'img');
        imageDiv.setAttribute('aria-label', product.name || 'Product image');
        
        // Add error handler for fallback
        const testImg = new Image();
        testImg.onerror = () => {
          imageWrapper.classList.add('buildright-image-error');
        };
        testImg.src = imageUrl;
        
        imageWrapper.appendChild(imageDiv);
        ctx.replaceWith(imageWrapper);
      },
          
      /**
       * ProductName Slot - BuildRight header with SKU
       */
      ProductName: (ctx) => {
        console.log('[ProductListDropin] ProductName slot called for product:', ctx.product?.sku);
        const { product } = ctx;
        
        // Create BuildRight header container
        const header = document.createElement('div');
        header.className = 'buildright-product-header';
        
        // SKU
        const sku = document.createElement('div');
        sku.className = 'buildright-product-sku';
        sku.textContent = product.sku || '';
        
        // Product name
        const name = document.createElement('h3');
        name.className = 'buildright-product-name';
        name.textContent = product.name || 'Unnamed Product';
        
        header.appendChild(sku);
        header.appendChild(name);
        
        ctx.replaceWith(header);
      },
          
      /**
       * ProductPrice Slot - BuildRight pricing structure
       */
      ProductPrice: (ctx) => {
        console.log('[ProductListDropin] ProductPrice slot called for product:', ctx.product?.sku);
        const { product } = ctx;
        
        // Create BuildRight pricing container
        const pricingContainer = document.createElement('div');
        pricingContainer.className = 'buildright-product-pricing';
        
        const priceValue = product.price?.final?.amount?.value || product.price?.value || 0;
        const currency = product.price?.final?.amount?.currency || 'USD';
        
        // Price value
        const priceEl = document.createElement('div');
        priceEl.className = 'buildright-price-value';
        priceEl.textContent = new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: currency 
        }).format(priceValue);
        
        // Price label
        const labelEl = document.createElement('div');
        labelEl.className = 'buildright-price-label';
        labelEl.textContent = 'per unit';
        
        pricingContainer.appendChild(priceEl);
        pricingContainer.appendChild(labelEl);
        
        ctx.replaceWith(pricingContainer);
      },
          
      /**
       * ProductActions Slot - BuildRight button styling
       */
      ProductActions: (ctx) => {
        console.log('[ProductListDropin] ProductActions slot called for product:', ctx.product?.sku);
        const { product } = ctx;
        
        // Create BuildRight actions container
        const actions = document.createElement('div');
        actions.className = 'buildright-product-actions';
        
        const viewButton = document.createElement('button');
        viewButton.className = 'buildright-btn buildright-btn-primary';
        
        // Add icon
        viewButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          Add to Cart
        `;
        
        viewButton.setAttribute('data-sku', product.sku);
        
        viewButton.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const basePath = window.BASE_PATH || '/';
          
          // For now, just navigate to PDP
          // In future, could add to cart directly
          window.location.href = `${basePath}pages/product-detail.html?sku=${product.sku}`;
        });
        
        actions.appendChild(viewButton);
        ctx.replaceWith(actions);
      },
          
      /**
       * NoResults Slot - BuildRight empty state
       */
      NoResults: (ctx) => {
        const { variables } = ctx;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'buildright-empty-state';
        
        emptyState.innerHTML = `
          <svg class="buildright-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h2 class="buildright-empty-title">No Products Found</h2>
          <p class="buildright-empty-message">We couldn't find any products matching your search "${variables?.phrase || ''}".</p>
          <p class="buildright-empty-hint">Try adjusting your filters or search terms.</p>
        `;
        
        ctx.replaceWith(emptyState);
      },
          
          /**
           * Header Slot - Hide (we have our own)
           */
          Header: () => null,
          
      /**
       * Footer Slot - Hide (pagination is separate)
       */
      Footer: () => null
    };
    
    console.log('[ProductListDropin] Slots config defined with keys:', Object.keys(slotsConfig));
    
    await render.render(SearchResults, {
      imageWidth: 400,
      imageHeight: 400,
      skeletonCount: 12,
      onSearchResult: (products) => {
        console.log('[ProductListDropin] Search results:', products.length, 'products');
        
        // Update product count
        const totalCount = products.length;
        if (productCount) {
          productCount.textContent = `${totalCount} Products`;
        }
      },
      slots: slotsConfig
    })(searchResultsContainer);
    
    console.log('[ProductListDropin] SearchResults rendered');
    
    // Render Facets (if container exists) - Use Adobe's default UI with custom CSS
    if (facetsContainer) {
      console.log('[ProductListDropin] Rendering Adobe Facets with BuildRight CSS overrides...');
      await render.render(Facets, {
        // No slots needed - just let Adobe render its default UI
        // We'll style it with CSS
      })(facetsContainer);
      
      // Add "Refine Results" header with custom "Clear All" button
      // Use retry logic to ensure it renders even if Adobe is slow
      const injectCustomHeader = (retryCount = 0) => {
        const facetsParent = facetsContainer.querySelector('.product-discovery-facet-list__facet-options')?.parentElement;
        
        if (!facetsParent && retryCount < 10) {
          // Adobe hasn't rendered yet, retry
          setTimeout(() => injectCustomHeader(retryCount + 1), 200);
          return;
        }
        
        if (facetsParent && !facetsContainer.querySelector('.buildright-facets-header')) {
          // Create header with Clear All button
          const header = document.createElement('div');
          header.className = 'buildright-facets-header';
          header.innerHTML = `
            <h3>Refine Results</h3>
            <button class="buildright-clear-filters" style="display: none;">Clear All</button>
          `;
          facetsParent.insertBefore(header, facetsParent.firstChild);
          console.log('[ProductListDropin] Added Refine Results header');
          
          // Setup Clear All button functionality
          const clearAllButton = header.querySelector('.buildright-clear-filters');
          
          // Function to check if any filters are active and show/hide button
          const updateClearAllVisibility = () => {
            const activeFilters = facetsContainer.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked:not([value=""])');
            clearAllButton.style.display = activeFilters.length > 0 ? 'inline-block' : 'none';
          };
          
          // Clear All click handler - uses optimistic UI for instant feedback
          clearAllButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[ProductListDropin] Clear All clicked');

            // Show validating state
            facetsContainer.classList.add('validating');
            const searchResultsContainer = document.querySelector('.dropin-search-results-container');
            if (searchResultsContainer) {
              searchResultsContainer.classList.add('validating');
            }

            try {
              // Silently uncheck all filters (no change events to avoid multiple re-renders)
              const allChecked = facetsContainer.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
              console.log('[ProductListDropin] Silently unchecking', allChecked.length, 'filters');
              allChecked.forEach(input => {
                input.checked = false;
                // DON'T dispatch change - would cause multiple jumpy re-renders
              });
              
              // Now call Adobe's search API once to do a clean reset
              if (window.__productDiscoverySearch && window.__productDiscoveryBaseParams) {
                console.log('[ProductListDropin] Calling search API with base params:', JSON.stringify(window.__productDiscoveryBaseParams));
                await window.__productDiscoverySearch(window.__productDiscoveryBaseParams);
                console.log('[ProductListDropin] Search completed');
                
                // Safety check: If any filters somehow stayed checked, force uncheck them
                setTimeout(() => {
                  const stillChecked = facetsContainer.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
                  if (stillChecked.length > 0) {
                    console.warn('[ProductListDropin] Forcing uncheck of', stillChecked.length, 'remaining filters');
                    stillChecked.forEach(input => {
                      input.checked = false;
                    });
                  }
                }, 200);
                
                // Remove validating state after search completes
                setTimeout(() => {
                  facetsContainer.classList.remove('validating');
                  if (searchResultsContainer) {
                    searchResultsContainer.classList.remove('validating');
                  }
                }, 300);
              } else {
                console.error('[ProductListDropin] Search API not available');
                // Remove validating state on error
                facetsContainer.classList.remove('validating');
                if (searchResultsContainer) {
                  searchResultsContainer.classList.remove('validating');
                }
              }
            } catch (error) {
              console.error('[ProductListDropin] Error clearing filters:', error);
              // Remove validating state on error
              facetsContainer.classList.remove('validating');
              if (searchResultsContainer) {
                searchResultsContainer.classList.remove('validating');
              }
            }
          });
          
          // Monitor for filter changes to update button visibility
          facetsContainer.addEventListener('change', updateClearAllVisibility);
          // Initial visibility check
          updateClearAllVisibility();
          
          // Add validating state on filter changes (citisignal pattern)
          // Debounce rapid filter changes to prevent artifacts
          let filterChangeTimeout;
          let currentObserver;
          
          facetsContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' || e.target.type === 'radio') {
              console.log('[ProductListDropin] Filter changed, showing validating state');
              
              // Clear any existing timeout to debounce rapid changes
              if (filterChangeTimeout) {
                clearTimeout(filterChangeTimeout);
              }
              
              // Disconnect any existing observer to prevent overlaps
              if (currentObserver) {
                currentObserver.disconnect();
                currentObserver = null;
              }
              
              // Add validating class to both facets and search results
              facetsContainer.classList.add('validating');
              const searchResultsContainer = document.querySelector('.dropin-search-results-container');
              if (searchResultsContainer) {
                searchResultsContainer.classList.add('validating');
              }
              
              // Remove validating state after Adobe re-renders (watch for DOM changes)
              const removeValidatingState = () => {
                console.log('[ProductListDropin] Hiding validating state');
                facetsContainer.classList.remove('validating');
                if (searchResultsContainer) {
                  searchResultsContainer.classList.remove('validating');
                }
              };
              
              // Watch for product grid updates
              const productGrid = document.querySelector('[data-dropin-container="search-results"]');
              if (productGrid) {
                currentObserver = new MutationObserver((mutations) => {
                  // Check if products were added/updated
                  const hasProductChanges = mutations.some(m => 
                    Array.from(m.addedNodes).some(node => 
                      node.nodeType === 1 && (
                        node.classList?.contains('product-card') ||
                        node.querySelector?.('.product-card')
                      )
                    )
                  );
                  
                  if (hasProductChanges) {
                    // Small delay to ensure smooth transition
                    filterChangeTimeout = setTimeout(() => {
                      removeValidatingState();
                      if (currentObserver) {
                        currentObserver.disconnect();
                        currentObserver = null;
                      }
                    }, 300);
                  }
                });
                
                currentObserver.observe(productGrid, { childList: true, subtree: true });
                
                // Fallback timeout in case observer doesn't catch it
                filterChangeTimeout = setTimeout(() => {
                  if (currentObserver) {
                    currentObserver.disconnect();
                    currentObserver = null;
                  }
                  removeValidatingState();
                }, 2000);
              } else {
                // Fallback if we can't find the grid
                filterChangeTimeout = setTimeout(removeValidatingState, 300);
              }
            }
          });
        }
      };
      
      // Start initial injection attempt
      injectCustomHeader();
      
      // Add toggle functionality for facet sections (Adobe doesn't provide this by default)
      setTimeout(() => {
        console.log('[ProductListDropin] Looking for facet headers...');
        const facetSections = facetsContainer.querySelectorAll('.product-discovery-facet');
        console.log('[ProductListDropin] Found facet sections:', facetSections.length);
        
        facetSections.forEach((section, index) => {
          const header = section.querySelector('.product-discovery-facet__header');
          const bucket = section.querySelector('.product-discovery-facet__bucket');
          
          if (!header || !bucket) {
            console.warn('[ProductListDropin] Missing header or bucket in section', index);
            return;
          }
          
          console.log('[ProductListDropin] Setting up toggle for:', header.textContent);
          
          // Set initial state - all expanded
          header.setAttribute('aria-expanded', 'true');
          header.style.cursor = 'pointer';
          
          // Add SVG chevron icon (matching filters-sidebar design)
          const existingIcon = header.querySelector('svg');
          if (!existingIcon) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'buildright-toggle-icon');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '6 9 12 15 18 9');
            
            svg.appendChild(polyline);
            header.appendChild(svg);
          }
          
          // Add click handler
          header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', String(!isExpanded));
            // Also toggle class on parent section for browser compatibility
            if (isExpanded) {
              section.classList.add('collapsed');
            } else {
              section.classList.remove('collapsed');
            }
            console.log('[ProductListDropin] Toggled facet:', header.textContent?.trim(), 'expanded:', !isExpanded);
          });
        });
        
        console.log('[ProductListDropin] Facet toggle handlers attached to', facetSections.length, 'sections');
      }, 1000); // Wait longer for Adobe to render
    }
    
    // Render SortBy (if container exists)
    if (sortByContainer) {
      console.log('[ProductListDropin] Rendering SortBy...');
      await render.render(SortBy, {
        // SortBy configuration
      })(sortByContainer);
    }
    
    // Render Pagination (if container exists)
    if (paginationContainer) {
      console.log('[ProductListDropin] Rendering Pagination...');
      await render.render(Pagination, {
        // Pagination configuration
      })(paginationContainer);
    }
    
    // Import search API for initial search and filter management
    console.log('[ProductListDropin] About to import search API...');
    const { search } = await import('@dropins/storefront-product-discovery/api.js');
    console.log('[ProductListDropin] Search API imported successfully');
    
    // Get initial search params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const phrase = urlParams.get('q') || urlParams.get('search') || '';
    const category = urlParams.get('category');
    
    const initialFilter = [];
    if (category) {
      initialFilter.push({
        attribute: 'categoryUrlKey',
        in: [category]
      });
    }
    
    const searchParams = {
      phrase,
      filter: initialFilter.length > 0 ? initialFilter : undefined,
      pageSize: 48,
      currentPage: 1
    };
    
    // Store base search params and search function for Clear All button
    // Base params (e.g., phrase, category) should be preserved when clearing user-selected facet filters
    window.__productDiscoveryBaseParams = searchParams;
    window.__productDiscoverySearch = search;
    
    console.log('[ProductListDropin] Base search params stored:', JSON.stringify(searchParams));
    console.log('[ProductListDropin] Triggering initial search with params:', searchParams);
    console.log('[ProductListDropin] Dropin will call ACO productSearch query directly (no custom mesh resolver needed)');
    
    try {
      const result = await search(searchParams);
      console.log('[ProductListDropin] Search completed successfully, result:', result);
    } catch (searchError) {
      console.error('[ProductListDropin] Search failed:', searchError);
      throw searchError;
    }
    
    console.log('[ProductListDropin] Search triggered successfully');
    
    // Dispatch loaded event
    window.dispatchEvent(new CustomEvent('catalogLoaded'));
    
    console.log('[ProductListDropin] Initialization complete');
    
  } catch (error) {
    console.error('[ProductListDropin] Error initializing:', error);
    console.error('[ProductListDropin] Error stack:', error.stack);
    
    // Show error state
    if (searchResultsContainer) {
      searchResultsContainer.innerHTML = `
        <div class="state-container error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2>Unable to Load Products</h2>
          <p>We're having trouble loading the catalog with the dropin.</p>
          <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-secondary);">${error.message || 'Unknown error'}</p>
          <details style="margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
            <summary style="cursor: pointer; font-weight: 600;">Technical Details</summary>
            <pre style="margin-top: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; overflow-x: auto; font-size: 0.75rem;">${error.stack || 'No stack trace available'}</pre>
          </details>
          <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
    }
    
    window.dispatchEvent(new CustomEvent('catalogLoaded'));
  }
}

