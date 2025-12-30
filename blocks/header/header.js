// Header block decoration
import { getCatalogUrl, parseCatalogPath, handleLegacyRedirect } from '../../scripts/url-router.js';
import { parseHTMLFragment } from '../../scripts/utils.js';
import { getCompany } from '../../scripts/company-config.js';
import { decorateBlock } from '../../scripts/scripts.js';
import { getCategories } from '../../scripts/services/mesh-client.js';

/**
 * Escape HTML special characters to prevent XSS
 * Security: Always use when interpolating dynamic data into HTML strings
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Navigate to catalog page with search query
 * @param {string} query - Search query string
 */
function navigateToCatalog(query) {
  const trimmedQuery = query?.trim();
  if (trimmedQuery) {
    window.location.href = `catalog?search=${encodeURIComponent(trimmedQuery)}`;
  }
}

/**
 * Initialize Header Search with direct GraphQL queries
 *
 * IMPORTANT: Header search uses catalogService for suggestions (isolated, no side effects).
 * This does NOT affect the catalog page product grid.
 * The in-category search bar on catalog page uses the dropin's search() API to filter the grid.
 *
 * @param {HTMLElement} block - The header block element
 */
async function initializeHeaderSearch(block) {
  const searchContainer = block.querySelector('.header-search');
  const searchForm = block.querySelector('.search-form');
  const searchSuggestionsContainer = block.querySelector('#search-suggestions');
  const searchSuggestionsList = block.querySelector('#search-suggestions-list');
  const searchSuggestionsFooter = block.querySelector('#search-suggestions-footer');
  const viewAllLink = block.querySelector('#search-suggestions-view-all');

  if (!searchContainer || !searchForm) {
    console.warn('[Header Search] Search container not found');
    return;
  }

  // Track current search query for "View All" link
  let currentQuery = '';

  // State for lazy loading catalog service
  let catalogServiceLoaded = false;
  let catalogService = null;

  /**
   * Lazy-load catalog service on first search interaction
   * Uses direct GraphQL queries - does NOT affect catalog page grid
   */
  async function ensureCatalogServiceLoaded() {
    if (catalogServiceLoaded) return true;

    try {
      const module = await import('../../scripts/services/catalog-service.js');
      catalogService = module.catalogService;

      // Wait for catalog service to initialize
      if (!catalogService.isInitialized) {
        const maxWait = 5000;
        const startTime = Date.now();
        while (!catalogService.isInitialized && (Date.now() - startTime) < maxWait) {
          await new Promise((resolve) => { setTimeout(resolve, 100); });
        }
      }

      catalogServiceLoaded = true;
      console.log('[Header Search] Catalog service loaded (isolated from dropin events)');
      return true;
    } catch (error) {
      console.error('[Header Search] Failed to load catalog service:', error);
      return false;
    }
  }

  /**
   * Render a single product suggestion item
   * Handles both catalogService format (imageUrl, price.value) and dropin format (images, price.final)
   * @param {Object} product - Product data
   * @returns {HTMLElement} - Suggestion item element
   */
  function renderSuggestionItem(product) {
    const item = document.createElement('a');
    item.href = `product?sku=${encodeURIComponent(product.sku)}`;
    item.className = 'buildright-search-suggestion-item';

    // Product image - handle both formats
    const imageUrl = product.imageUrl // catalogService format
      || product.images?.[0]?.url // dropin format (array)
      || product.image?.url // dropin format (object)
      || '';
    const imageEl = document.createElement('div');
    imageEl.className = 'buildright-search-suggestion-image';
    if (imageUrl) {
      imageEl.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Product info container
    const infoEl = document.createElement('div');
    infoEl.className = 'buildright-search-suggestion-info';

    // Product name
    const nameEl = document.createElement('div');
    nameEl.className = 'buildright-search-suggestion-name';
    nameEl.textContent = product.name || 'Unnamed Product';

    // SKU
    const skuEl = document.createElement('div');
    skuEl.className = 'buildright-search-suggestion-sku';
    skuEl.textContent = product.sku || '';

    infoEl.appendChild(nameEl);
    infoEl.appendChild(skuEl);

    // Price - handle both formats
    const priceValue = product.price?.value // catalogService format
      || product.price?.final?.amount?.value // dropin format
      || product.price?.regular?.amount?.value
      || product.priceRange?.minimum?.final?.amount?.value
      || 0;
    if (priceValue > 0) {
      const currency = product.price?.currency // catalogService format
        || product.price?.final?.amount?.currency // dropin format
        || product.price?.regular?.amount?.currency
        || 'USD';
      const priceEl = document.createElement('div');
      priceEl.className = 'buildright-search-suggestion-price';
      priceEl.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(priceValue);
      infoEl.appendChild(priceEl);
    }

    item.appendChild(imageEl);
    item.appendChild(infoEl);
    return item;
  }

  /**
   * Perform live search and display suggestions
   * Uses direct catalogService query - does NOT affect catalog page grid
   * @param {string} phrase - Search query
   */
  async function performSearch(phrase) {
    if (!phrase || phrase.length < 3) {
      hideSuggestions();
      return;
    }

    currentQuery = phrase;

    // Show loading state
    searchSuggestionsContainer.removeAttribute('hidden');
    searchSuggestionsList.innerHTML = '<div class="search-suggestions-loading"><div class="loading-spinner loading-spinner-sm"></div><span>Searching...</span></div>';

    try {
      // Ensure catalog service is loaded
      if (!await ensureCatalogServiceLoaded()) {
        hideSuggestions();
        return;
      }

      // Use direct GraphQL query - isolated from dropin event bus
      const result = await catalogService.searchProducts(phrase, {
        pageSize: 4,
        currentPage: 1,
      });

      // Check if this is still the current query (user might have typed more)
      if (phrase !== currentQuery) {
        console.log('[Header Search] Ignoring stale result for:', phrase);
        return;
      }

      // Clear loading state
      searchSuggestionsList.innerHTML = '';

      // Get products from result
      const products = result?.items || [];
      const totalCount = result?.totalCount ?? result?.total_count ?? products.length;

      console.log('[Header Search] Search results for:', phrase, `(${products.length} of ${totalCount} items)`);

      if (products.length === 0) {
        searchSuggestionsList.innerHTML = '<div class="search-suggestions-empty">No products found</div>';
        if (searchSuggestionsFooter) {
          searchSuggestionsFooter.setAttribute('hidden', '');
        }
        return;
      }

      // Render product suggestions
      products.forEach((product) => {
        searchSuggestionsList.appendChild(renderSuggestionItem(product));
      });

      // Update "View All" link
      if (viewAllLink) {
        viewAllLink.href = `catalog?search=${encodeURIComponent(phrase)}`;
        viewAllLink.textContent = `View all ${totalCount} results`;
        searchSuggestionsFooter.removeAttribute('hidden');
      }

    } catch (error) {
      console.error('[Header Search] Search failed:', error);
      searchSuggestionsList.innerHTML = '<div class="search-suggestions-error">Search unavailable</div>';
    }
  }

  /**
   * Hide suggestions dropdown
   */
  function hideSuggestions() {
    searchSuggestionsContainer.setAttribute('hidden', '');
    searchSuggestionsList.innerHTML = '';
    if (searchSuggestionsFooter) {
      searchSuggestionsFooter.setAttribute('hidden', '');
    }
  }

  // Get the native search input
  const searchInput = searchForm.querySelector('input.search-input');
  if (searchInput) {
    // Debounce timer
    let debounceTimer = null;

    // Add input event listener for live search
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce search (300ms)
      debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);
    });

    // Hide suggestions on blur (with delay for click handling)
    searchInput.addEventListener('blur', () => {
      setTimeout(hideSuggestions, 200);
    });

    // Show suggestions on focus if there's a query
    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query.length >= 3) {
        performSearch(query);
      }
    });
  }

  // Handle form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const input = searchForm.querySelector('input[type="search"], input[type="text"]');
    navigateToCatalog(input?.value);
  };

  searchForm.addEventListener('submit', handleSearchSubmit);

  const searchButton = searchForm.querySelector('.search-button');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearchSubmit);
  }

  // Click outside to close suggestions
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      hideSuggestions();
    }
  });

  console.log('[Header Search] Initialized with live search support');
}

export default async function decorate(block) {
  // Check for legacy URLs and redirect if needed
  handleLegacyRedirect();
  
  // URLs are now handled by base tag - no path fixing needed
  
  // Show/hide location selector based on login status
  // Note: With Commerce Dropins, we listen to auth events directly
  async function updateAuthenticatedElements() {
    // Find location section - try ID first, then fallback to class
    const locationSection = block.querySelector('#header-location') || 
                           block.querySelector('.header-location');
    
    // Location selector is now only shown for specific use cases
    // Default to hidden, will be shown by persona-specific logic if needed
    if (locationSection) {
      locationSection.style.visibility = 'hidden';
    }
  }
  
  // Check login state on load
  updateAuthenticatedElements();
  
  // Listen for auth events from Commerce Dropins
  window.addEventListener('auth:login', updateAuthenticatedElements);
  window.addEventListener('auth:logout', updateAuthenticatedElements);
  
  // Initialize cart badge to hidden state (prevent race condition)
  const cartBadge = block.querySelector('.cart-badge, [data-cart-badge]');
  if (cartBadge) {
    cartBadge.textContent = '';
    cartBadge.classList.remove('has-items');
    console.log('[Header] Cart badge initialized to hidden state');
  }
  
  // Initialize Commerce Dropins in custom BuildRight containers
  // This is the BuildRight pattern: Keep our design, use Dropin APIs
  
  const userMenuContainer = block.querySelector('#user-menu-container');
  if (userMenuContainer) {
    // Create auth-dropin block and insert into custom container
    const authDropinBlock = document.createElement('div');
    authDropinBlock.className = 'auth-dropin';
    authDropinBlock.dataset.headerContext = 'true'; // Signal this is in header
    userMenuContainer.appendChild(authDropinBlock);
    await decorateBlock(authDropinBlock, 'auth-dropin');
  }
  
  const miniCartContainer = block.querySelector('#mini-cart-container');
  if (miniCartContainer) {
    // Create commerce-mini-cart block and insert into custom container
    const miniCartBlock = document.createElement('div');
    miniCartBlock.className = 'commerce-mini-cart';
    miniCartBlock.dataset.headerContext = 'true'; // Signal this is in header
    miniCartContainer.appendChild(miniCartBlock);
    await decorateBlock(miniCartBlock, 'commerce-mini-cart');
  }

  // Initialize location display from customer context
  function initializeLocationDisplay() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    
    // Get company from context
    if (!context.company) {
      return; // No company context, nothing to display
    }
    
    const company = getCompany(context.company);
    if (!company) {
      console.warn('Company not found:', context.company);
      return;
    }
    
    const currentLocationId = context.location_id;
    const location = company.locations.find(loc => loc.id === currentLocationId) || company.locations[0];
    
    // Set display
    const locationNameEl = block.querySelector('.location-name');
    if (locationNameEl) {
      locationNameEl.textContent = `${company.name} - ${location.city}, ${location.state}`;
    }
  }

  // Call initialization on load
  initializeLocationDisplay();

  // Populate location dropdown using HTML templates
  function populateLocationDropdown() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    
    // Get company from context
    if (!context.company) {
      return; // No company context, nothing to populate
    }
    
    const company = getCompany(context.company);
    if (!company) {
      console.warn('Company not found:', context.company);
      return;
    }
    
    const currentLocationId = context.location_id || company.locations[0].id;
    
    const listEl = block.querySelector('#location-menu-list');
    
    if (listEl) {
      // Build HTML template for all location items
      // Security: Uses module-level escapeHtml() to prevent XSS
      const locationsHTML = company.locations.map((location) => {
        const activeClass = location.id === currentLocationId ? 'active' : '';
        const badgeText = location.isPrimary ? 'Primary' : 'Secondary';
        
        return `
          <li class="location-menu-item ${activeClass}">
            <button class="location-menu-item-button" type="button" data-location-id="${escapeHtml(location.id)}">
              <span class="location-menu-item-text">${escapeHtml(`${location.city}, ${location.state}`)}</span>
              <span class="location-menu-item-badge">${escapeHtml(badgeText)}</span>
            </button>
          </li>
        `;
      }).join('');

      // Parse and append all location items at once
      listEl.innerHTML = '';
      const fragment = parseHTMLFragment(locationsHTML);
      listEl.appendChild(fragment);
    }
  }

  // Location selector dropdown
  const locationSelector = block.querySelector('#location-selector');
  const locationMenu = block.querySelector('#location-menu');
  
  if (locationSelector && locationMenu) {
    // Initialize aria-expanded
    locationSelector.setAttribute('aria-expanded', 'false');
    
    // Populate dropdown on load
    populateLocationDropdown();
    
    // Adobe Best Practice: Location menu positioning now handled by pure CSS
    // No JavaScript positioning needed - see header.css
    
    // Toggle dropdown on click
    locationSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = locationMenu.classList.toggle('active');
      locationSelector.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      // Refresh dropdown content in case company changed
      populateLocationDropdown();
      // CSS handles positioning automatically
    });
    
    // Handle location selection
    locationMenu.addEventListener('click', (e) => {
      const button = e.target.closest('.location-menu-item-button');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        const locationId = button.getAttribute('data-location-id');
        const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
        
        if (!context.company) return;
        
        const company = getCompany(context.company);
        if (!company) return;
        
        const location = company.locations.find(loc => loc.id === locationId);
        
        if (location) {
          // Update context
          context.company = currentCompany;
          context.location_id = location.id;
          context.region = location.region;
          localStorage.setItem('buildright_customer_context', JSON.stringify(context));
          
          // Update display
          const locationNameEl = locationSelector.querySelector('.location-name');
          if (locationNameEl) {
            locationNameEl.textContent = `${company.name} - ${location.city}, ${location.state}`;
          }
          
          // Close dropdown
          locationMenu.classList.remove('active');
          locationSelector.setAttribute('aria-expanded', 'false');
          
          // Refresh dropdown to update active state
          populateLocationDropdown();
        }
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!locationMenu.contains(e.target) && !locationSelector.contains(e.target)) {
        locationMenu.classList.remove('active');
        locationSelector.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Prevent page scrolling when mouse is over the flyout
    // Always capture scroll events when hovering over the flyout, regardless of boundaries
    locationMenu.addEventListener('wheel', (e) => {
      const { scrollHeight, clientHeight } = locationMenu;
      
      // If content doesn't overflow, allow page scroll (flyout doesn't need scrolling)
      if (scrollHeight <= clientHeight) {
        return;
      }
      
      // Always prevent page scroll when mouse is over the flyout
      // The flyout will handle its own scrolling (or do nothing if at boundaries)
      e.stopPropagation();
    }, { passive: false });
    
    // Adobe Best Practice: No scroll/resize listeners needed for positioning
    // CSS positioning handles this automatically
  }

  // Industry menu toggle
  const industryToggle = block.querySelector('#industry-toggle');
  const industryMenu = block.querySelector('#industry-menu');
  if (industryToggle && industryMenu) {
    if (!industryToggle.querySelector('.industry-toggle-icon')) {
      const label = industryToggle.textContent.replace(/▼/g, '').trim();
      // Remove any existing SVG icons and text content
      const existingIcon = industryToggle.querySelector('.industry-toggle-icon');
      if (existingIcon) {
        existingIcon.remove();
      }
      const iconHTML = '<span class="industry-toggle-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';
      const iconSpan = parseHTMLFragment(iconHTML);
      industryToggle.textContent = label;
      industryToggle.appendChild(iconSpan);
    }

    industryToggle.setAttribute('aria-expanded', 'false');
    industryToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = industryMenu.classList.toggle('active');
      industryToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!industryMenu.contains(e.target) && !industryToggle.contains(e.target)) {
        industryMenu.classList.remove('active');
        industryToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mobile menu toggle
  const menuToggle = block.querySelector('#menu-toggle');
  const mainNav = block.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // Mobile search toggle - expand/collapse search on compact screens
  const searchIconToggle = block.querySelector('#search-icon-toggle');
  const headerSearch = block.querySelector('.header-search');
  if (searchIconToggle && headerSearch) {
    // Initialize aria-expanded
    searchIconToggle.setAttribute('aria-expanded', 'false');

    // Helper: Collapse the expanded search
    const collapseSearch = (returnFocus = false) => {
      headerSearch.classList.remove('search-expanded');
      searchIconToggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) {
        searchIconToggle.focus();
      }
    };

    // Toggle search expanded state on click
    searchIconToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = headerSearch.classList.toggle('search-expanded');
      searchIconToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      // Focus the search input when expanded
      if (isExpanded) {
        const searchInput = headerSearch.querySelector('input[type="search"]');
        if (searchInput) {
          // Use setTimeout to ensure DOM is updated before focusing
          setTimeout(() => searchInput.focus(), 10);
        }
      }
    });

    // Close expanded search when clicking outside
    document.addEventListener('click', (e) => {
      if (headerSearch.classList.contains('search-expanded') && !headerSearch.contains(e.target)) {
        collapseSearch();
      }
    });

    // Close expanded search on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && headerSearch.classList.contains('search-expanded')) {
        collapseSearch(true); // Return focus to toggle button
      }
    });
  }

  // Search functionality using Adobe Product Discovery Dropin
  // Replaces custom debouncing, suggestion rendering, and keyboard navigation
  // The dropin handles: debouncing (300ms), live suggestions, keyboard nav, API calls
  await initializeHeaderSearch(block);

  // Navigation links
  const navLinks = block.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const category = link.getAttribute('data-category');
      if (category) {
        e.preventDefault();
        // Use path-based URL routing
        const catalogUrl = getCatalogUrl(category);
        window.location.href = catalogUrl;
      }
    });
  });

  // Set active nav link based on current page
  // Check if we were redirected via 404 (sessionStorage will have the original path)
  const redirectPath = sessionStorage.getItem('spa_redirect_path');
  const currentPath = redirectPath || window.location.pathname;
    
    // Normalize paths for comparison
    const normalizePath = (path) => {
      if (!path) return '';
      // Remove leading/trailing slashes and convert to lowercase for comparison
      return path.replace(/^\/+|\/+$/g, '').toLowerCase();
    };
    
    const normalizedCurrentPath = normalizePath(currentPath);
  const isOnCatalog = normalizedCurrentPath.includes('catalog');
  const isOnProjectBuilder = normalizedCurrentPath.includes('project-builder');
  
  // Parse current page to get active category
  let currentCategory = null;
  if (isOnCatalog) {
    const catalogInfo = parseCatalogPath(currentPath);
    if (catalogInfo.type === 'category') {
      currentCategory = catalogInfo.value;
    } else if (catalogInfo.type === 'division') {
      currentCategory = catalogInfo.value;
    }
  }
  
  navLinks.forEach(link => {
    const linkCategory = link.getAttribute('data-category');
    const linkHref = link.getAttribute('href');
    const normalizedLinkHref = normalizePath(linkHref);
    let isActive = false;
    
    // Determine if this link should be active (mutually exclusive logic)
    if (isOnProjectBuilder) {
      // On project builder page - only highlight Project Builder link
      const isProjectBuilderLink = linkHref && normalizedLinkHref.includes('project-builder');
      isActive = isProjectBuilderLink;
    } else if (isOnCatalog) {
      // On catalog page - highlight based on category
      if (currentCategory) {
        // Specific category selected - only highlight that category button
        isActive = linkCategory === currentCategory;
      } else {
        // No category (showing all products) - only highlight "All Products"
        isActive = linkCategory === 'all';
      }
    }
    
    // Apply active class (CSS handles the styling)
    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      // Remove active styling
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
  
  // Cart notifications are now handled by the Commerce Mini-Cart Dropin
  // The dropin listens to cart/product/added events and shows notifications
  
  // Load dynamic categories from ACO
  async function loadDynamicCategories() {
    try {
      console.log('[Header] Waiting for catalog service to initialize...');

      // Wait for catalog service to be initialized (which sets persona headers)
      const { catalogService } = await import('../../scripts/services/catalog-service.js');

      // Wait up to 10 seconds for catalog service initialization
      const maxWait = 10000;
      const startTime = Date.now();
      while (!catalogService.isInitialized && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!catalogService.isInitialized) {
        throw new Error('Catalog service failed to initialize within 10 seconds');
      }

      // Use singleton promise pattern - getCategories() handles caching and deduplication
      // If scripts.js already triggered the fetch, this returns the same promise
      // The global window.__acoCategories is populated by mesh-client.js when the promise resolves
      console.log('[Header] Loading categories via singleton promise...');
      const result = await getCategories();
      const categories = result.categories || [];

      // Filter to get only top-level categories (no parent)
      const topCategories = categories
        .filter(cat => !cat.parentSlug);
      
      console.log(`[Header] Loaded ${topCategories.length} top-level categories from ACO`);
      
      // Find the main nav container
      const mainNav = block.querySelector('.main-nav');
      if (!mainNav) {
        console.warn('[Header] Main nav not found');
        return;
      }
      
      // Always show nav bar (keep blue bar visible)
      const navBar = block.querySelector('.header-nav-bar');
      if (navBar) {
        navBar.style.display = '';
      }
      
      // Only show navigation if we have categories
      if (topCategories.length === 0) {
        // Show subtle placeholder navigation (minimal, not intrusive)
        mainNav.innerHTML = `
          <div class="nav-item">
            <span class="nav-link-skeleton"></span>
          </div>
          <div class="nav-item">
            <span class="nav-link-skeleton" style="width: 140px;"></span>
          </div>
          <div class="nav-item">
            <span class="nav-link-skeleton" style="width: 120px;"></span>
          </div>
          <div class="nav-item">
            <span class="nav-link-skeleton" style="width: 160px;"></span>
          </div>
          <div class="nav-item">
            <span class="nav-link-skeleton" style="width: 130px;"></span>
          </div>
        `;
        // Hide "Shop By Industry" when no categories
        const industrySection = block.querySelector('.nav-industry');
        if (industrySection) {
          industrySection.style.display = 'none';
        }
        return;
      }
      
      // Show "Shop By Industry" when we have categories
      const industrySection = block.querySelector('.nav-industry');
      if (industrySection) {
        industrySection.style.display = 'flex';
      }
      
      // Build navigation HTML with "All Products" + categories with dropdowns
      // Security: All dynamic data escaped with escapeHtml() to prevent XSS
      const navHTML = `
        <div class="nav-item">
          <a href="catalog" class="nav-link" data-category="all">All Products</a>
        </div>
        ${topCategories.map(cat => {
          // Get subcategories for this category
          const subcategories = categories.filter(sub => sub.parentSlug === cat.slug);

          return `
            <div class="nav-item nav-item-with-dropdown">
              <button class="nav-link" data-category="${escapeHtml(cat.slug)}" data-category-name="${escapeHtml(cat.name)}">
                ${escapeHtml(cat.name)}
                ${subcategories.length > 0 ? '<span class="dropdown-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' : ''}
              </button>
              ${subcategories.length > 0 ? `
                <div class="category-dropdown" data-parent="${escapeHtml(cat.slug)}">
                  <div class="category-dropdown-content">
                    <ul class="subcategory-list">
                      ${subcategories.map(sub => `
                        <li><a href="#" data-subcategory="${escapeHtml(sub.slug)}" data-parent-slug="${escapeHtml(cat.slug)}">${escapeHtml(sub.name)}</a></li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      `;
      
      // Replace navigation
      mainNav.innerHTML = navHTML;
      
      // Add hover and click handlers for category dropdowns
      mainNav.querySelectorAll('.nav-item-with-dropdown').forEach(navItem => {
        const button = navItem.querySelector('.nav-link');
        const dropdown = navItem.querySelector('.category-dropdown');
        
        if (!dropdown) return;
        
        let hoverTimeout;
        
        // Desktop: Hover behavior
        if (window.matchMedia('(min-width: 1024px)').matches) {
          navItem.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            
            // Close all other dropdowns first to prevent bleed
            mainNav.querySelectorAll('.category-dropdown.active').forEach(d => {
              if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.add('active');
          });
          
          navItem.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
              dropdown.classList.remove('active');
            }, 200);
          });
        }
        
        // Mobile/Tablet: Click behavior
        button.addEventListener('click', (e) => {
          if (window.matchMedia('(max-width: 1023px)').matches) {
            e.stopPropagation();
            
            // Close other dropdowns
            mainNav.querySelectorAll('.category-dropdown.active').forEach(d => {
              if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active');
          } else {
            // Desktop: Navigate to category using slug (categoryUrlKey filter)
            const categorySlug = button.dataset.category;
            
            // Build catalog URL with category slug parameter
            const catalogUrl = window.location.pathname.includes('/catalog') 
              ? `${window.location.pathname}?category=${categorySlug}`
              : `catalog?category=${categorySlug}`;
            
            // Navigate to catalog with category filter
            window.location.href = catalogUrl;
          }
        });
      });
      
      // Add click handlers for subcategory links
      mainNav.querySelectorAll('[data-subcategory]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Products are assigned to full hierarchical paths (parent/subcategory)
          // When clicking "Lumber" (subcategory), filter by "structural-materials/lumber"
          const subcategorySlug = link.dataset.subcategory;
          
          // Build catalog URL with full subcategory path parameter
          const catalogUrl = window.location.pathname.includes('/catalog') 
            ? `${window.location.pathname}?category=${subcategorySlug}`
            : `catalog?category=${subcategorySlug}`;
          
          // Navigate to catalog with subcategory filter
          window.location.href = catalogUrl;
        });
      });
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item-with-dropdown')) {
          mainNav.querySelectorAll('.category-dropdown.active').forEach(d => {
            d.classList.remove('active');
          });
        }
      });
      
      console.log(`[Header] Loaded ${topCategories.length} categories from ACO`);
    } catch (error) {
      console.error('[Header] Error loading dynamic categories from ACO:', error);
      
      // On error, keep nav bar visible but show nothing (empty blue bar)
      const mainNav = block.querySelector('.main-nav');
      if (mainNav) {
        mainNav.innerHTML = '';
      }
      
      // Ensure nav bar is visible
      const navBar = block.querySelector('.header-nav-bar');
      if (navBar) {
        navBar.style.display = '';
      }
    }
  }
  
  // Load categories after persona is initialized
  loadDynamicCategories();
  
  // Mark header as loaded to prevent FOUC
  document.body.classList.add('header-loaded');
}
