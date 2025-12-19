// Header block decoration
import { getCatalogUrl, parseCatalogPath, parseProjectBuilderPath, handleLegacyRedirect } from '../../scripts/url-router.js';
import { parseHTMLFragment, formatCurrency } from '../../scripts/utils.js';
import { getCompany } from '../../scripts/company-config.js';
import { decorateBlock } from '../../scripts/scripts.js';
import { getCategories } from '../../scripts/services/mesh-client.js';

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
      // Escape HTML helper
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      // Build HTML template for all location items
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

  // Search functionality with live suggestions
  const searchInput = block.querySelector('#header-search-input');
  const searchButton = block.querySelector('.search-button');
  const searchSuggestions = block.querySelector('#search-suggestions');
  const suggestionsList = block.querySelector('#search-suggestions-list');
  const suggestionsLoading = block.querySelector('#search-suggestions-loading');
  const suggestionsFooter = block.querySelector('#search-suggestions-footer');
  const viewAllLink = block.querySelector('#search-suggestions-view-all');
  
  if (searchInput && searchButton) {
    let highlightedIndex = -1;
    let currentSuggestions = [];
    
    const performSearch = (query) => {
      const searchQuery = query || searchInput.value.trim();
      if (searchQuery) {
        hideSuggestions();
        window.location.href = `catalog?search=${encodeURIComponent(searchQuery)}`;
      }
    };
    
    const showSuggestions = () => {
      if (searchSuggestions) {
        searchSuggestions.hidden = false;
      }
    };
    
    const hideSuggestions = () => {
      if (searchSuggestions) {
        searchSuggestions.hidden = true;
      }
      highlightedIndex = -1;
    };
    
    const renderSuggestions = (suggestions) => {
      currentSuggestions = suggestions;
      highlightedIndex = -1;
      
      if (!suggestionsList) return;
      
      if (suggestions.length === 0) {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          suggestionsList.innerHTML = `
            <div class="search-suggestions-empty">
              No products found for "${query}"
            </div>
          `;
          if (suggestionsFooter) suggestionsFooter.hidden = true;
        } else {
          suggestionsList.innerHTML = '';
        }
        return;
      }
      
      suggestionsList.innerHTML = suggestions.map((item, index) => `
        <a href="${item.url}" class="search-suggestion-item" data-index="${index}">
          ${item.image 
            ? `<img src="${item.image}" alt="${item.name}" class="search-suggestion-image" loading="lazy">`
            : `<div class="search-suggestion-image-placeholder"></div>`
          }
          <div class="search-suggestion-info">
            <div class="search-suggestion-name">${item.name}</div>
            <div class="search-suggestion-sku">${item.sku}</div>
          </div>
          ${item.price ? `<div class="search-suggestion-price">${formatCurrency(item.price)}</div>` : ''}
        </a>
      `).join('');
      
      // Show "View all results" link
      if (suggestionsFooter && viewAllLink) {
        const query = searchInput.value.trim();
        viewAllLink.href = `catalog?search=${encodeURIComponent(query)}`;
        suggestionsFooter.hidden = false;
      }
    };
    
    const updateHighlight = () => {
      const items = suggestionsList?.querySelectorAll('.search-suggestion-item') || [];
      items.forEach((item, index) => {
        item.classList.toggle('highlighted', index === highlightedIndex);
      });
    };
    
    // Live search integration
    let searchTimeout;
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      
      clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        hideSuggestions();
        return;
      }
      
      showSuggestions();
      if (suggestionsLoading) suggestionsLoading.hidden = false;
      if (suggestionsList) suggestionsList.innerHTML = '';
      
      // Debounce search
      searchTimeout = setTimeout(async () => {
        try {
          // Dynamic import to avoid loading until needed
          const { liveSearchService } = await import('../../scripts/services/live-search.js');
          await liveSearchService.search(query);
          const { suggestions } = liveSearchService.getState();
          
          if (suggestionsLoading) suggestionsLoading.hidden = true;
          renderSuggestions(suggestions);
        } catch (error) {
          console.error('[Header] Live search error:', error);
          if (suggestionsLoading) suggestionsLoading.hidden = true;
          renderSuggestions([]);
        }
      }, 300);
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const items = suggestionsList?.querySelectorAll('.search-suggestion-item') || [];
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateHighlight();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          items[highlightedIndex].click();
        } else {
          performSearch();
        }
      } else if (e.key === 'Escape') {
        hideSuggestions();
        searchInput.blur();
      }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchSuggestions?.contains(e.target)) {
        hideSuggestions();
      }
    });
    
    // Focus shows suggestions if there's a query
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2 && currentSuggestions.length > 0) {
        showSuggestions();
      }
    });

    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch();
    });
  }

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
      
      console.log('[Header] Catalog service initialized, loading categories from ACO...');
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
      
      // Only show navigation if we have categories (empty blue bar if no categories)
      if (topCategories.length === 0) {
        mainNav.innerHTML = ''; // Empty nav bar
        return;
      }
      
      // Build navigation HTML with "All Products" + categories with dropdowns
      const navHTML = `
        <div class="nav-item">
          <a href="catalog" class="nav-link" data-category="all">All Products</a>
        </div>
        ${topCategories.map(cat => {
          // Get subcategories for this category
          const subcategories = categories.filter(sub => sub.parentSlug === cat.slug);
          
          return `
            <div class="nav-item nav-item-with-dropdown">
              <button class="nav-link" data-category="${cat.slug}" data-category-name="${cat.name}">
                ${cat.name}
                ${subcategories.length > 0 ? '<span class="dropdown-icon">▼</span>' : ''}
              </button>
              ${subcategories.length > 0 ? `
                <div class="category-dropdown" data-parent="${cat.slug}">
                  <div class="category-dropdown-content">
                    <ul class="subcategory-list">
                      ${subcategories.map(sub => `
                        <li><a href="#" data-subcategory="${sub.slug}" data-subcategory-name="${sub.name}">${sub.name}</a></li>
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
            // Desktop: Navigate to category
            const categoryName = button.dataset.categoryName;
            
            // Navigate to catalog page if not already there
            if (!window.location.pathname.includes('/catalog')) {
              window.location.href = 'catalog';
              return;
            }
            
            // Dispatch filter change event to apply category filter
            window.dispatchEvent(new CustomEvent('filtersChanged', {
              detail: {
                filters: {
                  br_product_category: [categoryName]
                }
              }
            }));
          }
        });
      });
      
      // Add click handlers for subcategory links
      mainNav.querySelectorAll('[data-subcategory]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const subcategoryName = link.dataset.subcategoryName;
          
          // Navigate to catalog page if not already there
          if (!window.location.pathname.includes('/catalog')) {
            window.location.href = 'catalog';
            // Store filter to apply after page load
            sessionStorage.setItem('pendingCategoryFilter', subcategoryName);
            return;
          }
          
          // Close all dropdowns
          mainNav.querySelectorAll('.category-dropdown.active').forEach(d => {
            d.classList.remove('active');
          });
          
          // Dispatch filter change event to apply subcategory filter
          window.dispatchEvent(new CustomEvent('filtersChanged', {
            detail: {
              filters: {
                br_product_category: [subcategoryName]
              }
            }
          }));
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
