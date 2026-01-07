/**
 * Product List Block - BuildRight Catalog
 *
 * Uses Adobe Product Discovery dropins with full slot customization:
 * - SearchResults, Facets, SortBy, Pagination containers
 * - Custom slots for BuildRight design match
 * - Adobe maintains search logic, state management, URL sync
 * - BuildRight controls all visual presentation
 */

import { getCategories, getCategoryDisplayName } from '../../scripts/services/mesh-client.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[ProductList]', ...args);

// Page size for product queries
const PAGE_SIZE = 48;

// Render tracking - used to know when all products have finished rendering
let expectedProductCount = 0;
let renderedProductCount = 0;

// Track selected price ranges for FacetBucket checkbox override
// Key: "from-to" (e.g., "0-10"), Value: boolean
const selectedPriceRanges = new Map();


// Flag to track when we're clearing filters - prevents visual blip during re-render
let isClearingFilters = false;

// ============================================
// EDS PERFORMANCE OPTIMIZATIONS
// ============================================
//
// EDS uses setTimeout(3000) in delayed.js for analytics/tracking.
// We use requestIdleCallback for cache warming because timing matters:
// - Analytics: "run eventually, never interfere" → fixed 3s delay is fine
// - Prefetch: "run ASAP when idle" → sooner prefetch = faster UX
//
// This aligns with EDS philosophy (performance-first) while using
// the right tool for the job.
// ============================================

/**
 * Request deduplication - prevents duplicate in-flight GraphQL requests
 * Key: stringified search params, Value: Promise of search result
 */
const inflightRequests = new Map();

/**
 * Cache warming state - tracks which query patterns have been prefetched
 * Prevents redundant prefetch requests during the session
 */
const prefetchedQueries = new Set();

/**
 * Cross-browser requestIdleCallback with fallback
 * EDS pattern: Use idle time for non-critical background work
 * @param {Function} callback - Function to execute during idle time
 * @param {Object} options - Options with timeout
 */
function scheduleIdleTask(callback, options = { timeout: 5000 }) {
  if (typeof requestIdleCallback === 'function') {
    return requestIdleCallback(callback, options);
  }
  // Fallback for Safari and older browsers
  return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1);
}

/**
 * Generate cache key for search params
 * Used for both deduplication and prefetch tracking
 */
function getSearchCacheKey(params) {
  return JSON.stringify({
    phrase: params.phrase || '',
    filter: params.filter || [],
    pageSize: params.pageSize,
    currentPage: params.currentPage,
  });
}

/**
 * Deduplicated search wrapper
 * EDS pattern: Prevent duplicate network requests for identical queries
 * @param {Function} searchFn - The dropin search function
 * @param {Object} params - Search parameters
 * @returns {Promise} - Search result
 */
async function deduplicatedSearch(searchFn, params) {
  const cacheKey = getSearchCacheKey(params);

  // Check for in-flight request with same params
  if (inflightRequests.has(cacheKey)) {
    log('Deduplicating request:', cacheKey.substring(0, 50));
    return inflightRequests.get(cacheKey);
  }

  // Create and track the request
  const requestPromise = searchFn(params).finally(() => {
    // Clean up after request completes
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Prefetch search results during idle time
 * EDS pattern: Warm server-side caches before user needs the data
 * @param {Function} searchFn - The dropin search function
 * @param {Object} params - Search parameters to prefetch
 * @param {string} label - Description for logging
 */
function prefetchSearch(searchFn, params, label = 'query') {
  const cacheKey = getSearchCacheKey(params);

  // Skip if already prefetched this session
  if (prefetchedQueries.has(cacheKey)) {
    log('Prefetch skipped (already cached):', label);
    return;
  }

  scheduleIdleTask(async (deadline) => {
    // Only prefetch if we have idle time or hit timeout
    if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
      log('Prefetching during idle:', label);

      try {
        await deduplicatedSearch(searchFn, params);
        prefetchedQueries.add(cacheKey);
        log('Prefetch complete:', label);
      } catch (err) {
        // Prefetch failures are non-critical - log but don't throw
        console.warn('[ProductList] Prefetch failed:', label, err.message);
      }
    }
  }, { timeout: 10000 }); // 10s timeout ensures prefetch happens even on busy pages
}

/**
 * Called when all products have finished rendering (based on slot callback count)
 * Removes loading states and shows pagination
 */
function onRenderComplete() {
  log('All products rendered, removing loading states');
  const resultsContainer = document.querySelector('.dropin-search-results-container');
  const facetsEl = document.querySelector('.dropin-facets-container');
  const paginationEl = document.querySelector('.dropin-pagination-container');

  if (resultsContainer) {
    resultsContainer.classList.remove('validating', 'updating');
    // Remove loading spinner
    const spinner = resultsContainer.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
  }
  if (facetsEl) facetsEl.classList.remove('validating', 'clearing');
  if (paginationEl) paginationEl.style.display = '';

  // If we were clearing filters, now is the time to finalize
  // Products have finished loading, so any dropin re-render should be done
  if (isClearingFilters && facetsEl) {
    // Small delay to let any final facet re-renders complete
    setTimeout(() => {
      // Final checkbox reset
      const checkboxes = facetsEl.querySelectorAll(
        'input.dropin-checkbox__checkbox, input.buildright-price-checkbox-input',
      );
      checkboxes.forEach((cb) => { cb.checked = false; });
      log('onRenderComplete: Final checkbox reset:', checkboxes.length);

      // End clearing state - RAF loop will stop automatically
      isClearingFilters = false;
      facetsEl.classList.remove('clearing-filters');
      log('onRenderComplete: Clearing state ended');
    }, 50);
  }

  // Emit event for external listeners
  document.dispatchEvent(new CustomEvent('catalog:facetsValidating', {
    detail: { validating: false },
  }));
}

/**
 * Helper function for consistent event emission (matches product-grid.js patterns)
 * @param {string} eventName - The event name to dispatch
 * @param {Object} detail - Optional detail object for the event
 */
function emitCatalogEvent(eventName, detail = {}) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
  log('Event emitted:', eventName, Object.keys(detail).length > 0 ? detail : '');
}

/**
 * Collect all active facet filters and trigger search
 * Shared by RangeBucket and ScalarBucket checkbox change handlers to avoid duplication
 * @param {Element} facetsContainer - The facets container element
 * @param {string} source - Source identifier for logging (e.g., 'price', 'scalar')
 */
async function collectFiltersAndSearch(facetsContainer, source = 'facet') {
  const combinedFilters = [];

  // Collect filters from checked ScalarBucket checkboxes
  // Mesh adds `attribute` to each bucket, stored as data-attribute on checkbox
  const scalarCheckboxes = facetsContainer.querySelectorAll(
    'input.dropin-checkbox__checkbox[data-attribute]:checked',
  );
  scalarCheckboxes.forEach((cb) => {
    const attribute = cb.getAttribute('data-attribute');
    const value = cb.getAttribute('data-value');
    if (attribute && value) {
      combinedFilters.push({ attribute, eq: value });
    }
  });

  // Add price range filters from tracked state
  selectedPriceRanges.forEach((_, rangeKey) => {
    const [rangeFrom, rangeTo] = rangeKey.split('-').map(Number);
    combinedFilters.push({
      attribute: 'price',
      range: { from: rangeFrom, to: rangeTo },
    });
  });

  log('Combined filters:', combinedFilters);

  // Get base params and search function from global
  const baseParams = window.__productDiscoveryBaseParams || {};
  const search = window.__productDiscoverySearch;

  // Preserve categoryPath from baseParams (navigation context)
  // User-selected facets should add to category filter, not replace it
  const categoryFilter = (baseParams.filter || []).filter(
    (f) => f.attribute === 'categoryPath',
  );

  if (search) {
    // Merge category filter with user-selected facet filters
    const mergedFilters = [...categoryFilter, ...combinedFilters];

    const searchParams = {
      ...baseParams,
      filter: mergedFilters.length > 0 ? mergedFilters : undefined,
      currentPage: 1,
    };

    log(`Triggering ${source} filter search:`, searchParams);

    try {
      await search(searchParams);
      log(`${source} filter search completed`);
    } catch (err) {
      console.error(`[ProductList] ${source} filter search failed:`, err);
    }
  } else {
    console.error('[ProductList] Search function not available');
  }
}

/**
 * Update page title, H1, breadcrumb, and JSON-LD based on active category
 * Uses pre-warmed category data from ACO via singleton promise pattern
 * @param {string|null} categorySlug - The active category URL key
 */
async function updateCategoryUI(categorySlug) {
  const catalogTitle = document.getElementById('catalog-title');

  // EDS Best Practice: Use singleton promise for category data
  // Categories are pre-fetched in scripts.js, so this returns cached data
  const result = await getCategories();
  const categories = result.categories || [];

  // Default values when no category selected
  let displayName = 'All Products';
  let breadcrumbItems = [{ name: 'Home', url: '/' }, { name: 'All Products', url: '/pages/catalog.html' }];

  if (categorySlug && categories.length > 0) {
    displayName = getCategoryDisplayName(categorySlug, categories);

    // Find the category for hierarchy building
    const normalizedSlug = categorySlug.replace(/_/g, '-');
    const category = categories.find((c) => c.slug === categorySlug || c.slug === normalizedSlug);

    if (category) {
      // Build breadcrumb hierarchy
      const hierarchy = [];
      let current = category;
      while (current) {
        hierarchy.unshift(current);
        current = current.parentSlug
          ? categories.find((c) => c.slug === current.parentSlug)
          : null;
      }

      // Build JSON-LD items (functional concat avoids mutation during iteration)
      breadcrumbItems = [{ name: 'Home', url: '/' }].concat(
        hierarchy.map((c) => ({
          name: c.name,
          url: `/pages/catalog.html?category=${c.slug}`,
        })),
      );
    }
  }

  // Update DOM (breadcrumbs handled by breadcrumbs block, not here)
  if (catalogTitle) catalogTitle.textContent = displayName;
  document.title = `${displayName} | BuildRight Solutions`;

  // Inject JSON-LD BreadcrumbList
  let schemaScript = document.getElementById('breadcrumb-schema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'breadcrumb-schema';
    document.head.appendChild(schemaScript);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${window.location.origin}${item.url}`,
    })),
  };
  schemaScript.textContent = JSON.stringify(schema);

  log('Category UI updated:', displayName);
}

export default async function decorate(block) {
  log('Initializing Level 2 integration with full slots...');
  
  // Get containers (facetsContainer queried after dropin init to ensure DOM is ready)
  const searchResultsContainer = block.querySelector('.dropin-search-results-container');
  const sortByContainer = document.querySelector('.dropin-sort-container');
  const paginationContainer = block.querySelector('.dropin-pagination-container');
  const productCount = block.querySelector('.product-count');
  
  if (!searchResultsContainer) {
    console.error('[ProductListDropin] Search results container not found');
    return;
  }
  
  try {
    // Emit loading event immediately (matches product-grid.js pattern)
    emitCatalogEvent('catalogLoading');

    // Wait for dropins to be ready (scripts.js initializes them before blocks)
    // Using waitForDropins() instead of initializeDropins() avoids redundant work
    const { waitForDropins } = await import('../../scripts/initializers/index.js');
    await waitForDropins();
    log('Dropins ready, rendering containers...');

    // =====================================================
    // FCP OPTIMIZATION: Don't block on getCategories() in Promise.all
    // Categories are fetched lazily by updateCategoryUI() on search/result event
    // This reduces FCP by ~2-3 seconds on category pages
    // =====================================================
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    // =====================================================
    // PERFORMANCE: Import dropin modules in parallel (no categories blocking)
    // getCategories() will be called by updateCategoryUI() after search results arrive
    // =====================================================
    const [
      { render },
      { default: SearchResults },
      { default: Facets },
      { default: SortBy },
      { default: Pagination },
      { search },
      { events },
    ] = await Promise.all([
      import('@dropins/storefront-product-discovery/render.js'),
      import('@dropins/storefront-product-discovery/containers/SearchResults.js'),
      import('@dropins/storefront-product-discovery/containers/Facets.js'),
      import('@dropins/storefront-product-discovery/containers/SortBy.js'),
      import('@dropins/storefront-product-discovery/containers/Pagination.js'),
      import('@dropins/storefront-product-discovery/api.js'),
      import('@dropins/tools/event-bus.js'),
    ]);

    // =====================================================
    // FCP OPTIMIZATION: Set immediate title from URL slug (non-blocking)
    // The full display name will be set by updateCategoryUI() on search/result event
    // This avoids blocking FCP on the categories network fetch
    // =====================================================
    if (category) {
      const immediateTitle = getCategoryDisplayName(category, []); // Uses slugToTitle fallback
      const catalogTitle = document.getElementById('catalog-title');
      if (catalogTitle) catalogTitle.textContent = immediateTitle;
      document.title = `${immediateTitle} | BuildRight Solutions`;
      log('Immediate title from slug:', immediateTitle);
    }
    
    // Render SearchResults with FULL slot customization
    log('Rendering SearchResults with custom slots...');
    
    // Configure base path for PDP navigation - used by slots to create product links
    const basePath = window.BASE_PATH || '/';
    
    const slotsConfig = {
      /**
       * ProductImage Slot - BuildRight namespaced wrapper
       * Also sets up card-level click navigation to PDP
       */
      ProductImage: (ctx) => {
        log('ProductImage slot:', ctx.product?.sku);
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
        
        // Add error handler for fallback - use shared .image-placeholder from components.css
        const testImg = new Image();
        testImg.onerror = () => {
          imageWrapper.classList.add('image-placeholder');
        };
        testImg.src = imageUrl;
        
        imageWrapper.appendChild(imageDiv);
        ctx.replaceWith(imageWrapper);
        
        // Make entire card clickable - find parent card and add navigation
        requestAnimationFrame(() => {
          const card = imageWrapper.closest('.dropin-product-item-card');
          if (card && !card.dataset.pdpUrl) {
            const pdpUrl = `${basePath}pages/product-detail.html?sku=${product.sku}`;
            card.dataset.pdpUrl = pdpUrl;
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
              // Don't navigate if clicking a button or link inside the card
              if (e.target.closest('button, a')) return;
              window.location.href = pdpUrl;
            });
          }
        });
      },
          
      /**
       * ProductName Slot - BuildRight header with SKU, linked to PDP
       */
      ProductName: (ctx) => {
        log('ProductName slot:', ctx.product?.sku);
        const { product } = ctx;
        
        // Create link wrapper for navigation to PDP
        const link = document.createElement('a');
        link.href = `${basePath}pages/product-detail.html?sku=${product.sku}`;
        link.className = 'buildright-product-link';
        
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
        link.appendChild(header);
        
        ctx.replaceWith(link);
      },
          
      /**
       * ProductPrice Slot - BuildRight pricing structure
       * ACO returns prices in productView.price structure
       */
      ProductPrice: (ctx) => {
        log('ProductPrice slot:', ctx.product?.sku);
        const { product } = ctx;

        // Debug: Log the actual product structure to find pricing
        if (product) {
          log('Product price structures:', {
            sku: product.sku,
            price: product.price,
            priceRange: product.priceRange,
            productView: product.productView,
            finalPrice: product.price?.final,
            regularPrice: product.price?.regular,
            specialPrice: product.specialPrice,
          });
        }

        // Create BuildRight pricing container
        const pricingContainer = document.createElement('div');
        pricingContainer.className = 'buildright-product-pricing';

        // Try multiple possible price structures:
        // 1. ACO productView structure
        // 2. Adobe Commerce dropin structure
        // 3. Our mesh structure
        // 4. Price range structure
        const priceValue = product.price?.final?.amount?.value
          || product.price?.regular?.amount?.value
          || product.priceRange?.minimum?.final?.amount?.value
          || product.priceRange?.minimum?.regular?.amount?.value
          || product.price?.value
          || product.specialPrice?.value
          || 0;
        const currency = product.price?.final?.amount?.currency
          || product.price?.regular?.amount?.currency
          || product.priceRange?.minimum?.final?.amount?.currency
          || 'USD';
        
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
       * ProductActions Slot - BuildRight button styling with add-to-cart state management
       */
      ProductActions: (ctx) => {
        log('ProductActions slot:', ctx.product?.sku);
        const { product } = ctx;

        // Create BuildRight actions container
        const actions = document.createElement('div');
        actions.className = 'buildright-product-actions';

        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-primary btn-product-card';

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

          const button = e.currentTarget;
          const originalHTML = button.innerHTML;

          // Define icons (spinner uses CSS class, success/error use SVG)
          const spinnerHTML = `<span class="loading-spinner loading-spinner-xs"></span>`;
          const checkSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          const errorSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

          // Loading state
          button.disabled = true;
          button.classList.add('loading');
          button.innerHTML = `${spinnerHTML} Adding...`;

          try {
            // Import commerce helpers
            const { addProductToCart, showAddToCartNotification } =
              await import('../../scripts/commerce-helpers.js');

            // Add to cart
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
            console.error('[ProductListDropin] Add to cart failed:', error);

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

        actions.appendChild(viewButton);
        ctx.replaceWith(actions);

        // Track render completion - ProductActions is the last slot called per product
        renderedProductCount++;
        if (renderedProductCount >= expectedProductCount && expectedProductCount > 0) {
          onRenderComplete();
        }
      },
          
      /**
       * NoResults Slot - BuildRight empty state
       */
      NoResults: (ctx) => {
        const { variables } = ctx;
        const phrase = variables?.phrase?.trim() || '';

        const emptyState = document.createElement('div');
        emptyState.className = 'buildright-empty-state';

        // Security: Use innerHTML only for static content (no user input)
        emptyState.innerHTML = `
          <svg class="buildright-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h2 class="buildright-empty-title">No Products Found</h2>
          <p class="buildright-empty-message"></p>
        `;

        // Security: Use textContent for user input to prevent XSS
        const messageEl = emptyState.querySelector('.buildright-empty-message');
        messageEl.textContent = phrase
          ? `We couldn't find any products matching "${phrase}".`
          : 'No products are available in this category.';

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
    
    log('Slots config defined with keys:', Object.keys(slotsConfig));

    await render.render(SearchResults, {
      imageWidth: 400,
      imageHeight: 400,
      skeletonCount: 0, // Disable Adobe skeletons - we use our own custom ones
      // Route product clicks to PDP page with SKU parameter
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      onSearchResult: (products) => {
        log('Search results callback:', products.length, 'items on page');
        // Note: Loading states are now managed via search/loading event subscription
        // Product count is updated via search/result event subscription below
      },
      slots: slotsConfig
    })(searchResultsContainer);

    log('SearchResults rendered');

    // =====================================================
    // PERFORMANCE: Start search IMMEDIATELY after SearchResults renders
    // This runs the network request in parallel with other container renders
    // =====================================================
    const phrase = urlParams.get('q') || urlParams.get('search') || '';
    const initialFilter = [];
    if (category) {
      initialFilter.push({ attribute: 'categoryPath', in: [category] });
    }
    const searchParams = {
      phrase,
      filter: initialFilter.length > 0 ? initialFilter : undefined,
      pageSize: PAGE_SIZE,
      currentPage: 1
    };

    // Store for Clear All button and future searches
    window.__productDiscoveryBaseParams = searchParams;
    window.__productDiscoverySearch = search;

    // =====================================================
    // CRITICAL: Wait for auth before loading products
    // This ensures products load with correct persona pricing (like PDP does)
    // Without this, products load with guest pricing first, then need re-fetch
    // =====================================================
    const { authService } = await import('../../scripts/auth.js');
    await authService.initialize();
    log('Auth initialized, user context available for correct pricing');

    // Start search NOW (non-blocking) - runs in parallel with container renders below
    log('Starting search in background:', searchParams);
    const searchPromise = deduplicatedSearch(search, searchParams);

    // =====================================================
    // EVENT SUBSCRIPTIONS: Set up BEFORE container renders
    // This ensures we don't miss events if search completes quickly
    // =====================================================

    // Subscribe to search/loading events - the dropin's native loading state
    events.on('search/loading', (isLoading) => {
      log('search/loading event:', isLoading);

      if (isLoading) {
        // Search starting - show loading states and reset render counter
        renderedProductCount = 0;

        const resultsContainer = document.querySelector('.dropin-search-results-container');
        const facetsEl = document.querySelector('.dropin-facets-container');
        const paginationEl = document.querySelector('.dropin-pagination-container');

        if (resultsContainer) {
          resultsContainer.classList.add('validating');
          // Inject loading spinner for product grid
          if (!resultsContainer.querySelector('.loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner loading-spinner-sm';
            resultsContainer.appendChild(spinner);
          }
        }
        if (facetsEl) facetsEl.classList.add('validating');
        if (paginationEl) paginationEl.style.display = 'none';
        emitCatalogEvent('facetsValidating', { validating: true });
      }
    }, { eager: true });

    // Subscribe to search/result events for product count display and render tracking
    events.on('search/result', (searchEvent) => {
      const totalCount = searchEvent?.result?.totalCount
        ?? searchEvent?.result?.pageInfo?.totalItems
        ?? 0;

      const pageItems = searchEvent?.result?.items?.length ?? 0;
      expectedProductCount = pageItems;
      log('Search result event - total:', totalCount, 'page items:', pageItems);

      // Update page title, breadcrumb, and JSON-LD
      const categoryFilter = searchEvent?.request?.filter?.find((f) => f.attribute === 'categoryPath');
      const categorySlug = categoryFilter?.in?.[0] || null;
      updateCategoryUI(categorySlug);

      // Handle empty/non-empty state
      const catalogLayout = document.getElementById('catalog-layout');
      const filtersAside = document.getElementById('filters-aside');
      const paginationEl = document.querySelector('.dropin-pagination-container');
      const catalogControls = document.querySelector('.catalog-controls-wrapper');

      if (totalCount === 0) {
        if (catalogLayout) catalogLayout.classList.add('catalog-empty-state');
        if (filtersAside) filtersAside.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';
        if (productCount) productCount.style.display = 'none';
        if (catalogControls) catalogControls.style.display = 'none';
        log('Empty state: hiding UI elements');
      } else {
        if (catalogLayout) catalogLayout.classList.remove('catalog-empty-state');
        if (filtersAside) filtersAside.style.display = '';
        if (catalogControls) catalogControls.style.display = '';
        if (productCount) {
          productCount.style.display = '';
          productCount.textContent = `${totalCount} Product${totalCount !== 1 ? 's' : ''}`;
        }
      }

      // Sync Clear All button visibility
      const requestFilters = searchEvent?.request?.filter || [];
      const hasActiveFilters = requestFilters.some((f) => f.attribute !== 'categoryPath');
      const clearAllBtn = document.getElementById('buildright-clear-all');
      if (clearAllBtn) {
        clearAllBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
      }

      // Handle edge case: no products to render
      if (pageItems === 0) {
        onRenderComplete();
      }
    }, { eager: true });

    log('Event subscriptions registered');

    // Query facetsContainer after SearchResults renders (DOM must be ready)
    const facetsContainer = document.querySelector('.dropin-facets-container');

    // =====================================================
    // PERFORMANCE: Render Facets, SortBy, Pagination in PARALLEL
    // These containers are independent - they share state via dropin internals, not JS
    // Running them in parallel reduces total render time by ~2/3
    // =====================================================
    const containerPromises = [];

    // Facets render promise (if container exists)
    if (facetsContainer) {
      containerPromises.push((async () => {
        log('Rendering Facets with FacetBucket slot for price checkboxes...');

        // Render Facets with FacetBucket slot for price checkbox override
        // Preserves Adobe's internal state management and SearchResults communication
        // FacetBucket slot intercepts price facets to render as checkboxes (fixes Clear All desync)
        //
        // ARCHITECTURE NOTE: The dropin doesn't pass `id` to FacetBucket slots (only title, __typename,
        // count, selected). The mesh encodes {attribute}:{value} in `id` field, but dropin strips it.
        // Solution: Use Facet slot to build title→attribute map, then DOM traversal in FacetBucket.
        const facetTitleToAttribute = new Map(); // Maps facet display title → ACO attribute

        await render.render(Facets, {
        slots: {
          // Facet slot - builds title→attribute map for FacetBucket to use
          // NOTE: All Facet slots run BEFORE any FacetBucket slots (not interleaved)
          Facet: (ctx) => {
            const { data } = ctx;
            log('Facet slot:', { title: data?.title, attribute: data?.attribute });
            // Store mapping for FacetBucket to look up via DOM traversal
            if (data?.title && data?.attribute) {
              facetTitleToAttribute.set(data.title, data.attribute);
            }
            // Return null to let default rendering proceed
            return null;
          },
          // Custom SelectedFacets - show only Clear All button, no chips
          // Chips clutter UI and have state desync issues with custom price checkboxes
          SelectedFacets: (ctx) => {
            const { data } = ctx;
            log('SelectedFacets slot called:', { data, ctx: Object.keys(ctx) });
            const hasSelectedFacets = data && data.length > 0;

            // Only show Clear All when filters are active
            if (!hasSelectedFacets) {
              const empty = document.createElement('div');
              empty.className = 'buildright-selected-facets-empty';
              ctx.replaceWith(empty);
              return;
            }

            // Create Clear All button only (no chips)
            const container = document.createElement('div');
            container.className = 'buildright-selected-facets';

            const clearBtn = document.createElement('button');
            clearBtn.className = 'buildright-clear-all-btn';
            clearBtn.textContent = 'Clear All';
            clearBtn.addEventListener('click', async () => {
              log('Clear All clicked (custom button)');
              selectedPriceRanges.clear();
              isClearingFilters = true;

              // Use search function stored on window
              const searchFn = window.__productDiscoverySearch;
              const baseParams = window.__productDiscoveryBaseParams || {};

              if (searchFn) {
                try {
                  await searchFn({
                    ...baseParams,
                    filter: baseParams.filter,
                    currentPage: 1,
                  });
                } catch (err) {
                  console.error('[ProductList] Clear All search failed:', err);
                }
              }
            });

            container.appendChild(clearBtn);
            ctx.replaceWith(container);
          },
          FacetBucket: (ctx) => {
            // Extract bucket data from context (dropin provides {data: bucket})
            // RangeBucket: __typename, title, from, to, count, selected
            const { data } = ctx;
            log('FacetBucket slot:', data);

            // Only intercept RangeBucket (price facets) - render as checkboxes
            // ScalarBucket (brand/color) already renders as checkboxes natively
            if (data?.__typename === 'RangeBucket') {
              const rangeKey = `${data.from}-${data.to}`;

              // Sync our tracked state with dropin's state (handles Clear All)
              if (data.selected) {
                selectedPriceRanges.set(rangeKey, true);
              } else {
                selectedPriceRanges.delete(rangeKey);
              }

              // Create checkbox wrapper (no hidden radio needed - we call search API directly)
              const wrapper = document.createElement('div');
              wrapper.className = 'dropin-checkbox buildright-price-checkbox';

              // Visible checkbox
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.id = `price-${data.from}-${data.to}`;
              // If clearing filters, force unchecked regardless of dropin's data.selected
              // This prevents the visual "blip" where dropin re-renders with stale selected state
              checkbox.checked = isClearingFilters ? false : data.selected;
              checkbox.className = 'buildright-price-checkbox-input';
              checkbox.setAttribute('data-testid', `${data.title}-checkbox`);
              checkbox.setAttribute('data-from', data.from);
              checkbox.setAttribute('data-to', data.to);

              // Label
              const label = document.createElement('label');
              label.className = 'buildright-price-label';
              label.htmlFor = checkbox.id;
              label.textContent = `$${data.from} - $${data.to} (${data.count})`;

              // Checkbox click -> call search API directly with price filter
              checkbox.addEventListener('change', async () => {
                const from = parseFloat(checkbox.dataset.from);
                const to = parseFloat(checkbox.dataset.to);
                const key = `${from}-${to}`;

                // Update our tracked state (price is single-select, so clear others first)
                if (checkbox.checked) {
                  selectedPriceRanges.clear();
                  selectedPriceRanges.set(key, true);
                } else {
                  selectedPriceRanges.delete(key);
                }

                log('Price checkbox changed:', key, checkbox.checked);
                await collectFiltersAndSearch(facetsContainer, 'price');
              });

              wrapper.appendChild(checkbox);
              wrapper.appendChild(label);
              ctx.replaceWith(wrapper);
            // ScalarBucket (brand, color, etc.) - Let dropin handle natively
            // With categoryPath filter, dropin automatically preserves category context
            // when facets are clicked (built-in category context preservation)
            }
          },
        },
      })(facetsContainer);

      // Inject header inside sidebar (Adobe's render replaces container contents)
      // Must be done after render to match /catalog reference design
      const existingHeader = facetsContainer.querySelector('.buildright-facets-header');
      if (!existingHeader) {
        const header = document.createElement('div');
        header.className = 'buildright-facets-header';

        const title = document.createElement('h3');
        title.textContent = 'Refine Results';

        const clearBtn = document.createElement('button');
        clearBtn.className = 'buildright-clear-all-btn';
        clearBtn.id = 'buildright-clear-all';
        clearBtn.textContent = 'Clear All';
        clearBtn.style.display = 'none'; // Hidden until filters are active
        clearBtn.addEventListener('click', async () => {
          log('Clear All clicked (header button)');
          selectedPriceRanges.clear();

          // Set clearing flag BEFORE search - FacetBucket slot will check this
          // to prevent visual "blip" when dropin re-renders with stale selected state
          isClearingFilters = true;
          facetsContainer.classList.add('clearing-filters');

          // Immediately uncheck all checkboxes (visual feedback first, before search)
          const checkboxes = facetsContainer.querySelectorAll(
            'input.dropin-checkbox__checkbox, input.buildright-price-checkbox-input',
          );
          checkboxes.forEach((cb) => { cb.checked = false; });
          log('Checkboxes unchecked immediately:', checkboxes.length);

          // Use requestAnimationFrame loop to uncheck any checked checkboxes during clearing
          // More efficient than setInterval - syncs with browser repaint cycle
          function uncheckLoop() {
            if (!isClearingFilters) return; // Stop when clearing is done
            const checkedBoxes = facetsContainer.querySelectorAll(
              'input[type="checkbox"]:checked',
            );
            if (checkedBoxes.length > 0) {
              checkedBoxes.forEach((cb) => { cb.checked = false; });
              log('RAF unchecked:', checkedBoxes.length);
            }
            requestAnimationFrame(uncheckLoop);
          }
          requestAnimationFrame(uncheckLoop);

          // Use search function stored on window (set after dropin initializes)
          const searchFn = window.__productDiscoverySearch;
          const baseParams = window.__productDiscoveryBaseParams || {};

          if (searchFn) {
            try {
              // Clear user-selected facet filters but preserve base params (phrase, category)
              await searchFn({
                ...baseParams,
                filter: baseParams.filter, // Keep base category filter, remove user facet filters
                currentPage: 1,
              });
              log('Clear All search completed');
            } catch (err) {
              console.error('[ProductList] Clear All search failed:', err);
            }
          } else {
            console.error('[ProductList] Search function not available for Clear All');
          }
        });

        header.appendChild(title);
        header.appendChild(clearBtn);
        facetsContainer.insertBefore(header, facetsContainer.firstChild);
        log('Injected Refine Results header with Clear All button');
      }

      // =====================================================
      // FACET GROUP TOGGLES
      // Inject chevron icons into facet headers for collapse/expand
      // CSS :has() selector handles visibility (facets.css:270-276)
      // =====================================================

      /**
       * Inject toggle icons into facet headers and bind click handlers
       * Pattern adapted from filters-sidebar.js:120-134
       */
      function injectFacetToggles() {
        const headers = facetsContainer.querySelectorAll('.product-discovery-facet__header');
        let injectedCount = 0;

        headers.forEach((header) => {
          // Skip if already has toggle icon
          if (header.querySelector('.buildright-toggle-icon')) return;

          // Set initial expanded state
          if (!header.hasAttribute('aria-expanded')) {
            header.setAttribute('aria-expanded', 'true');
          }

          // Create chevron SVG
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          icon.setAttribute('class', 'buildright-toggle-icon');
          icon.setAttribute('width', '16');
          icon.setAttribute('height', '16');
          icon.setAttribute('viewBox', '0 0 24 24');
          icon.setAttribute('fill', 'none');
          icon.setAttribute('stroke', 'currentColor');
          icon.setAttribute('stroke-width', '2');
          icon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';

          header.appendChild(icon);
          injectedCount++;

          // Bind click handler (only if not already bound)
          if (!header.dataset.toggleBound) {
            header.addEventListener('click', (e) => {
              // Don't toggle if clicking on a checkbox or other interactive element
              if (e.target.closest('input, button, a')) return;

              const isExpanded = header.getAttribute('aria-expanded') === 'true';
              header.setAttribute('aria-expanded', !isExpanded);
              log('Facet toggle:', header.textContent?.trim().split('\n')[0], '→', !isExpanded ? 'expanded' : 'collapsed');
            });
            header.dataset.toggleBound = 'true';
          }
        });

        if (injectedCount > 0) {
          log('Injected facet toggle icons:', injectedCount);
        }
      }

      // Initial injection after Facets render
      injectFacetToggles();

      // Re-inject on DOM changes (facets re-render on filter changes)
      const facetToggleObserver = new MutationObserver(() => {
        // Debounce rapid mutations
        clearTimeout(facetToggleObserver._debounce);
        facetToggleObserver._debounce = setTimeout(injectFacetToggles, 50);
      });
      facetToggleObserver.observe(facetsContainer, { childList: true, subtree: true });

      // Filter reset listener - fixes dropin visual desync bug where checkboxes
      // stay visually checked even after filters are cleared
      // This handles both "Clear All" and individual filter pill removal (X buttons)
      facetsContainer.addEventListener('click', (e) => {
        const clickedBtn = e.target.closest('button');
        if (!clickedBtn) return;

        const btnText = clickedBtn.textContent?.toLowerCase() || '';
        const ariaLabel = clickedBtn.getAttribute('aria-label')?.toLowerCase() || '';

        // Check for Clear All button
        const isClearAll = btnText.includes('clear') || ariaLabel.includes('clear');

        // Check for individual filter removal (X buttons on filter pills)
        // These have aria-label like "Remove Price filter: 0.0-10.0" or text containing "Remove"
        const isFilterRemoval = ariaLabel.includes('remove') || btnText.includes('remove');

        if (isClearAll) {
          log('Clear All clicked');
          // Checkbox sync is now handled by search/result event handler (no setTimeout needed)
          // The event fires when dropin completes search, and we sync checkboxes immediately
        } else if (isFilterRemoval) {
          // Individual filter removal - determine which filter was removed
          const filterInfo = ariaLabel || btnText;
          log('Filter removed:', filterInfo);

          // Check if it's a price filter removal
          if (filterInfo.includes('price')) {
            // Extract price range from label (e.g., "remove price filter: 0.0-10.0")
            const rangeMatch = filterInfo.match(/(\d+(?:\.\d+)?)[^\d]+(\d+(?:\.\d+)?)/);
            if (rangeMatch) {
              const rangeKey = `${Math.floor(parseFloat(rangeMatch[1]))}-${Math.floor(parseFloat(rangeMatch[2]))}`;
              selectedPriceRanges.delete(rangeKey);
              const checkbox = facetsContainer.querySelector(`#price-${rangeKey}`);
              if (checkbox) {
                checkbox.checked = false;
                log('Price checkbox unchecked:', rangeKey);
              }
            }
          } else {
            // Non-price filter - find and uncheck the corresponding native checkbox
            // The filter pill text contains the facet value (e.g., "Interior finish")
            // We need to find the checkbox with matching label
            setTimeout(() => {
              // Small delay to let dropin process the click first
              const nativeCheckboxes = facetsContainer.querySelectorAll(
                'input[type="checkbox"]:not(.buildright-price-checkbox-input)',
              );
              nativeCheckboxes.forEach((cb) => {
                // Check if this checkbox's associated label matches the removed filter
                const label = cb.nextElementSibling?.textContent?.toLowerCase() || '';
                const checkboxId = cb.getAttribute('data-testid') || '';
                if (filterInfo.includes(label.split('(')[0].trim())
                    || filterInfo.includes(checkboxId.toLowerCase())) {
                  cb.checked = false;
                  log('Native checkbox unchecked:', label);
                }
              });
            }, 50);
          }
        }
      });

        log('Facets rendered with native Adobe behavior');
      })()); // Close Facets async IIFE
    }

    // SortBy render promise (if container exists)
    if (sortByContainer) {
      containerPromises.push((async () => {
        log('Rendering SortBy...');
        await render.render(SortBy, {})(sortByContainer);

        // Add bidirectional Name sort options (dropin only generates name_DESC for text fields)
        const enhanceNameSort = () => {
          const select = sortByContainer.querySelector('select');
          if (!select) return;

          // Find the name_DESC option (dropin generates this single option for text fields)
          const nameDesc = [...select.options].find((opt) => opt.value === 'name_DESC');
          if (!nameDesc || select.querySelector('[data-name-asc]')) return;

          // Create A to Z option (ASC) and insert before Z to A
          const aToZ = document.createElement('option');
          aToZ.value = 'name_ASC';
          aToZ.textContent = 'Name: A to Z';
          aToZ.dataset.nameAsc = 'true';
          nameDesc.insertAdjacentElement('beforebegin', aToZ);

          // Rename original DESC to Z to A
          nameDesc.textContent = 'Name: Z to A';
          log('Injected bidirectional Name sort options');
        };

        enhanceNameSort();
        new MutationObserver(enhanceNameSort).observe(sortByContainer, { childList: true, subtree: true });
        log('SortBy rendered');
      })()); // Close SortBy async IIFE
    }

    // Pagination render promise (if container exists)
    if (paginationContainer) {
      containerPromises.push((async () => {
        log('Rendering Pagination...');
        await render.render(Pagination, {})(paginationContainer);
        log('Pagination rendered');
      })()); // Close Pagination async IIFE
    }

    // Wait for all container renders to complete in parallel
    log('Awaiting parallel container renders:', containerPromises.length, 'containers');
    await Promise.all(containerPromises);
    log('All containers rendered');

    // =====================================================
    // AWAIT SEARCH: The search was started earlier (after SearchResults render)
    // and has been running in parallel with Facets/SortBy/Pagination renders
    // =====================================================
    try {
      const result = await searchPromise;
      log('Search completed, total:', result?.totalCount ?? result?.pageInfo?.totalItems ?? 'unknown');

      // Mark initial query as prefetched (it's now in ACO cache)
      prefetchedQueries.add(getSearchCacheKey(searchParams));

      // EDS Optimization: If user landed with a search term, prefetch the "cleared" state
      if (phrase) {
        const clearedParams = {
          phrase: '',
          filter: initialFilter.length > 0 ? initialFilter : undefined,
          pageSize: PAGE_SIZE,
          currentPage: 1,
        };
        prefetchSearch(search, clearedParams, 'cleared catalog state');
      }

      // EDS Optimization: Prefetch page 2 for faster pagination
      const totalCount = result?.totalCount ?? result?.pageInfo?.totalItems ?? 0;
      if (totalCount > PAGE_SIZE) {
        const page2Params = {
          phrase,
          filter: initialFilter.length > 0 ? initialFilter : undefined,
          pageSize: PAGE_SIZE,
          currentPage: 2,
        };
        prefetchSearch(search, page2Params, 'page 2');
      }
    } catch (searchError) {
      console.error('[ProductListDropin] Search failed:', searchError);
      throw searchError;
    }

    // =====================================================
    // IN-CATEGORY SEARCH BAR
    // This search bar filters the product grid in place
    // (unlike header search which just shows suggestions)
    // =====================================================
    const catalogSearchInput = document.getElementById('catalog-search-input');
    const searchClearBtn = document.getElementById('search-clear');

    if (catalogSearchInput) {
      let searchDebounceTimer = null;
      const SEARCH_DEBOUNCE_MS = 300;

      // Sync input with URL search param on load
      if (phrase) {
        catalogSearchInput.value = phrase;
        if (searchClearBtn) searchClearBtn.style.display = '';
      }

      // Handle input changes
      catalogSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (searchClearBtn) {
          searchClearBtn.style.display = query ? '' : 'none';
        }

        // Clear previous timer
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
        }

        // Debounce search
        searchDebounceTimer = setTimeout(async () => {
          log('Catalog search:', query || '(empty)');

          // Update URL for shareability (without page reload)
          const url = new URL(window.location);
          if (query) {
            url.searchParams.set('search', query);
          } else {
            url.searchParams.delete('search');
          }
          window.history.replaceState({}, '', url);

          // Build search params
          const searchParams = {
            phrase: query,
            filter: initialFilter.length > 0 ? initialFilter : undefined,
            pageSize: PAGE_SIZE,
            currentPage: 1,
          };

          // Trigger dropin search with deduplication
          try {
            await deduplicatedSearch(search, searchParams);

            // EDS Optimization: After searching, prefetch the "cleared" state
            // so user can quickly return to full catalog
            if (query) {
              const clearedParams = {
                phrase: '',
                filter: initialFilter.length > 0 ? initialFilter : undefined,
                pageSize: PAGE_SIZE,
                currentPage: 1,
              };
              prefetchSearch(search, clearedParams, 'cleared state after search');
            }
          } catch (err) {
            console.error('[ProductList] Catalog search failed:', err);
          }
        }, SEARCH_DEBOUNCE_MS);
      });

      // Handle Enter key
      catalogSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Clear debounce and trigger immediately
          if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
          }
          catalogSearchInput.dispatchEvent(new Event('input'));
        }
      });

      // Handle clear button
      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
          catalogSearchInput.value = '';
          catalogSearchInput.dispatchEvent(new Event('input'));
          catalogSearchInput.focus();
        });
      }

      log('In-category search bar wired up');
    }

    // Dispatch loaded event
    emitCatalogEvent('catalogLoaded');

    log('Initialization complete');
    
  } catch (error) {
    console.error('[ProductListDropin] Error initializing:', error);
    console.error('[ProductListDropin] Error stack:', error.stack);

    // Show error state
    // Security: Only show technical details in DEBUG mode to prevent information disclosure
    if (searchResultsContainer) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'state-container error-state';

      // Static HTML structure (no user-controlled content in innerHTML)
      errorContainer.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h2>Unable to Load Products</h2>
        <p>We're having trouble loading the catalog. Please try again later.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
      `;

      // Security: Only show technical details in DEBUG mode (development)
      // Prevents information disclosure of internal paths and stack traces in production
      if (DEBUG) {
        const detailsEl = document.createElement('details');
        detailsEl.style.cssText = 'margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;';

        const summaryEl = document.createElement('summary');
        summaryEl.style.cssText = 'cursor: pointer; font-weight: 600;';
        summaryEl.textContent = 'Technical Details (DEBUG mode)';

        const preEl = document.createElement('pre');
        preEl.style.cssText = 'margin-top: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; overflow-x: auto; font-size: 0.75rem;';
        // Use textContent to safely display error info without XSS risk
        preEl.textContent = error.stack || error.message || 'No details available';

        detailsEl.appendChild(summaryEl);
        detailsEl.appendChild(preEl);

        // Insert before the reload button
        const button = errorContainer.querySelector('button');
        errorContainer.insertBefore(detailsEl, button);
      }

      searchResultsContainer.textContent = '';
      searchResultsContainer.appendChild(errorContainer);
    }

    // Emit error event (NOT catalogLoaded - matches product-grid.js pattern)
    // Note: Only emit generic error indicator, not detailed message
    emitCatalogEvent('catalogError', { error: 'Product loading failed' });
  }
}

