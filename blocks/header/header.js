// Header block decoration
import { getCatalogUrl, parseCatalogPath, parseProjectBuilderPath, handleLegacyRedirect } from '../../scripts/url-router.js';
import { authService } from '../../scripts/auth.js';
import { parseHTMLFragment } from '../../scripts/utils.js';
import { showCartNotification } from '../../scripts/cart-notification.js';

export default async function decorate(block) {
  // Check for legacy URLs and redirect if needed
  handleLegacyRedirect();
  
  // URLs are now handled by base tag - no path fixing needed
  
  // Show/hide location selector based on login status
  async function updateAuthenticatedElements() {
    // Wait for auth to initialize
    await authService.initialize();
    
    const loggedIn = authService.isAuthenticated();
    
    // Find location section - try ID first, then fallback to class
    const locationSection = block.querySelector('#header-location') || 
                           block.querySelector('.header-location');
      
    if (loggedIn) {
      if (locationSection) locationSection.style.display = '';
    } else {
      if (locationSection) locationSection.style.display = 'none';
    }
  }
  
  // Check login state on load (async)
  updateAuthenticatedElements();
  
  // Listen for login state changes (e.g., after login/logout)
  window.addEventListener('storage', (e) => {
    if (e.key === 'buildright_auth') {
      updateAuthenticatedElements();
    }
  });
  
  // Also check on custom login/logout events
  window.addEventListener('auth:login', updateAuthenticatedElements);
  window.addEventListener('auth:logout', updateAuthenticatedElements);
  window.addEventListener('auth:signup-complete', updateAuthenticatedElements);
  
  // Use absolute URL to avoid path resolution issues with dynamic imports
  const basePath = window.BASE_PATH || '/';
  const baseUrl = window.location.origin + basePath;
  const utilsModule = await import(new URL('scripts/utils.js', baseUrl).href);
  const { loadBlockHTML, loadBlockCSS } = utilsModule;
  
  // User Menu functionality
  let userMenuToggle = block.querySelector('#user-menu-toggle');
  let userMenu = null;
  
  // Load user-menu block
  const userMenuContainer = block.querySelector('#user-menu-container');
  if (userMenuContainer) {
    try {
      // Load CSS first
      loadBlockCSS('user-menu');
      
      // Load and parse HTML
      const userMenuHTML = await loadBlockHTML('user-menu');
      if (userMenuHTML) {
        const userMenuFragment = parseHTMLFragment(userMenuHTML);
        userMenuContainer.appendChild(userMenuFragment);
        userMenu = userMenuContainer.querySelector('.user-menu');
        
        // Decorate the user-menu block
        if (userMenu) {
          const userMenuModule = await import(new URL('blocks/user-menu/user-menu.js', baseUrl).href);
          const decorateUserMenu = userMenuModule.default;
          await decorateUserMenu(userMenu);
          
          // Setup user menu toggle AFTER user-menu is loaded
          setupUserMenuToggle();
        }
      }
    } catch (error) {
      console.error('Error loading user menu:', error);
    }
  }
  
  // Mini Cart functionality
  let cartLinkToggle = block.querySelector('#cart-link-toggle');
  let miniCart = null;
  
  // Load mini-cart block
  const miniCartContainer = block.querySelector('#mini-cart-container');
  if (miniCartContainer) {
    try {
      
      // Load CSS first
      loadBlockCSS('mini-cart');
      
      // Load and parse HTML
      const miniCartHTML = await loadBlockHTML('mini-cart');
      if (miniCartHTML) {
        const miniCartFragment = parseHTMLFragment(miniCartHTML);
        miniCartContainer.appendChild(miniCartFragment);
        miniCart = miniCartContainer.querySelector('.mini-cart');
        
        // Decorate the mini-cart block
        if (miniCart) {
          const miniCartModule = await import(new URL('blocks/mini-cart/mini-cart.js', baseUrl).href);
          const decorateMiniCart = miniCartModule.default;
          await decorateMiniCart(miniCart);
          
          // Setup cart link toggle AFTER mini-cart is loaded
          setupCartToggle();
        }
      }
    } catch (error) {
      console.error('Error loading mini-cart block:', error);
    }
  }
  
  // Legacy: If no button exists, convert anchor tag to button (mini-cart is now loaded separately)
  if (!cartLinkToggle) {
    const cartAnchor = block.querySelector('a.cart-link');
    if (cartAnchor) {
      const cartCountEl = cartAnchor.querySelector('.cart-count');
      const cartIcon = cartAnchor.querySelector('.cart-icon');
      const cartLabel = cartAnchor.querySelector('.cart-label');
      
      const button = document.createElement('button');
      button.className = 'cart-link';
      button.id = 'cart-link-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Shopping cart');
      
      // Copy content from anchor or create if missing
      if (cartIcon) {
        button.appendChild(cartIcon.cloneNode(true));
      } else {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'cart-icon';
        iconSpan.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
        button.appendChild(iconSpan);
      }
      
      if (cartLabel) {
        button.appendChild(cartLabel.cloneNode(true));
      } else {
        const labelSpan = document.createElement('span');
        labelSpan.className = 'cart-label';
        labelSpan.textContent = 'Cart';
        button.appendChild(labelSpan);
      }
      
      // Add count badge after the label
      if (cartCountEl) {
        button.appendChild(cartCountEl.cloneNode(true));
      } else {
        const countSpan = document.createElement('span');
        countSpan.className = 'cart-count';
        countSpan.textContent = '0';
        button.appendChild(countSpan);
      }
      
      cartAnchor.parentNode.replaceChild(button, cartAnchor);
      cartLinkToggle = button;
      
      // If mini-cart was already loaded, setup toggle now
      if (miniCart) {
        setupCartToggle();
      }
    }
  }
  
  // Get cart count element
  const cartCountEl = block.querySelector('.cart-count');

  // Update cart count from localStorage
  function updateCartCount() {
    const countEl = cartCountEl || (cartLinkToggle ? cartLinkToggle.querySelector('.cart-count') : null);
    if (countEl) {
      try {
        const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
        const count = cart.reduce((sum, item) => {
          if (item.type === 'bundle') {
            return sum + (item.itemCount || 0);
          }
          return sum + (item.quantity || 0);
        }, 0);
        countEl.textContent = count;
      } catch (e) {
        countEl.textContent = '0';
      }
    }
  }

  // Use pre-loaded cart count if available (prevents layout shift)
  const countEl = cartCountEl || (cartLinkToggle ? cartLinkToggle.querySelector('.cart-count') : null);
  if (countEl && typeof window.__INITIAL_CART_COUNT__ !== 'undefined') {
    countEl.textContent = window.__INITIAL_CART_COUNT__;
  } else {
    // Fallback to loading from localStorage
    updateCartCount();
  }

  // Also update after a short delay to ensure mini-cart has initialized
  setTimeout(() => {
    updateCartCount();
  }, 100);


  // Toggle mini cart
  function toggleMiniCart() {
    if (!cartLinkToggle || !miniCart) return;
    
    const isActive = miniCart.classList.toggle('active');
    cartLinkToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    
    if (isActive) {
      // Close user menu if it's open
      if (userMenu && userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        if (userMenuToggle) {
          userMenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
      
      positionMiniCart();
    }
  }

  // Position mini cart dropdown
  function positionMiniCart() {
    if (!miniCart || !cartLinkToggle) return;
    
    const rect = cartLinkToggle.getBoundingClientRect();
    miniCart.style.top = `${rect.bottom + 8}px`;
    miniCart.style.right = `${window.innerWidth - rect.right}px`;
  }

  // Setup cart link toggle (called after mini-cart is loaded)
  // Setup user menu toggle
  function setupUserMenuToggle() {
    if (!userMenuToggle || !userMenu) return;
    
    function toggleUserMenu() {
      const isActive = userMenu.classList.contains('active');
      
      if (isActive) {
        userMenu.classList.remove('active');
        userMenuToggle.setAttribute('aria-expanded', 'false');
      } else {
        // Close mini cart if it's open
        if (miniCart && miniCart.classList.contains('active')) {
          miniCart.classList.remove('active');
          if (cartLinkToggle) {
            cartLinkToggle.setAttribute('aria-expanded', 'false');
          }
        }
        
        userMenu.classList.add('active');
        userMenuToggle.setAttribute('aria-expanded', 'true');
      }
    }
    
    userMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleUserMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && !userMenuToggle.contains(e.target)) {
        userMenu.classList.remove('active');
        userMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  function setupCartToggle() {
    if (!cartLinkToggle || !miniCart) return;
    
    cartLinkToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMiniCart();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!miniCart.contains(e.target) && !cartLinkToggle.contains(e.target)) {
        miniCart.classList.remove('active');
        cartLinkToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Update position on scroll/resize
    window.addEventListener('scroll', positionMiniCart, { passive: true });
    window.addEventListener('resize', positionMiniCart);
  }

  // Listen for cart updates
  window.addEventListener('cartUpdated', () => {
    updateCartCount();
  });


  // Listen for open mini cart event (from kit sidebar and add-to-cart)
  window.addEventListener('openMiniCart', (e) => {
    const highlightBundleId = e.detail?.highlightBundleId;
    if (miniCart && cartLinkToggle) {
      // Close user menu if it's open
      if (userMenu && userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        if (userMenuToggle) {
          userMenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
      
      if (highlightBundleId) {
        miniCart.setAttribute('data-highlight-bundle', highlightBundleId);
      }
      miniCart.classList.add('active');
      cartLinkToggle.setAttribute('aria-expanded', 'true');
      positionMiniCart();
      // Re-dispatch event so mini-cart block can handle highlighting
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  });

  // Define company locations (not warehouses)
  const companyLocations = {
    'premium_commercial': {
      name: 'Premium Commercial Builders',
      locations: [
        { id: 'los_angeles', city: 'Los Angeles', state: 'CA', isPrimary: true, region: 'western' },
        { id: 'phoenix', city: 'Phoenix', state: 'AZ', isPrimary: false, region: 'western' }
      ]
    },
    'coastal_residential': {
      name: 'Coastal Residential Builders',
      locations: [
        { id: 'dallas', city: 'Dallas', state: 'TX', isPrimary: true, region: 'central' },
        { id: 'denver', city: 'Denver', state: 'CO', isPrimary: false, region: 'central' }
      ]
    },
    'elite_trade': {
      name: 'Elite Trade Contractors',
      locations: [
        { id: 'charlotte', city: 'Charlotte', state: 'NC', isPrimary: true, region: 'eastern' },
        { id: 'atlanta', city: 'Atlanta', state: 'GA', isPrimary: false, region: 'eastern' }
      ]
    },
    'precision_lumber': {
      name: 'Precision Lumber & Supply',
      locations: [
        { id: 'austin', city: 'Austin', state: 'TX', isPrimary: true, region: 'central' },
        { id: 'san_antonio', city: 'San Antonio', state: 'TX', isPrimary: false, region: 'central' },
        { id: 'houston', city: 'Houston', state: 'TX', isPrimary: false, region: 'central' }
      ]
    }
  };

  // Initialize location display from customer context
  function initializeLocationDisplay() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    const currentCompany = context.company || 'premium_commercial';
    const currentLocationId = context.location_id || 'los_angeles';
    
    const company = companyLocations[currentCompany];
    if (!company) {
      console.warn('Company not found in companyLocations:', currentCompany);
      return;
    }
    const location = company.locations.find(loc => loc.id === currentLocationId) || company.locations[0];
    
    // Set display - compact format for main header
    const locationNameEl = block.querySelector('.location-name');
    if (locationNameEl) {
      locationNameEl.textContent = `${location.city}, ${location.state}`;
    }
    
    // Ensure context is saved
    if (!context.company || !context.location_id) {
      context.company = currentCompany;
      context.location_id = location.id;
      context.region = location.region;
      localStorage.setItem('buildright_customer_context', JSON.stringify(context));
    }
  }

  // Call initialization on load
  initializeLocationDisplay();

  // Populate location dropdown using HTML templates
  function populateLocationDropdown() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    const currentCompany = context.company || 'premium_commercial';
    const company = companyLocations[currentCompany];
    
    if (!company) {
      console.warn('Company not found in companyLocations:', currentCompany);
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
    
    // Update dropdown positioning
    function positionDropdown() {
      if (!locationMenu.classList.contains('active')) return;
      
      const rect = locationSelector.getBoundingClientRect();
      
      // Position dropdown below button - no gap, seamless connection
      locationMenu.style.top = `${rect.bottom}px`;
      locationMenu.style.left = `${rect.left}px`;
      locationMenu.style.width = `${rect.width}px`; /* Exact width, not min-width */
    }
    
    // Toggle dropdown on click
    locationSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = locationMenu.classList.toggle('active');
      locationSelector.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      // Refresh dropdown content in case company changed
      populateLocationDropdown();
      // Position dropdown after toggle
      if (isActive) {
        positionDropdown();
      }
    });
    
    // Handle location selection
    locationMenu.addEventListener('click', (e) => {
      const button = e.target.closest('.location-menu-item-button');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        const locationId = button.getAttribute('data-location-id');
        const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
        const currentCompany = context.company || 'premium_commercial';
        const company = companyLocations[currentCompany];
        const location = company.locations.find(loc => loc.id === locationId);
        
        if (location) {
          // Update context
          context.company = currentCompany;
          context.location_id = location.id;
          context.region = location.region;
          localStorage.setItem('buildright_customer_context', JSON.stringify(context));
          
          // Update display - compact format for main header
          const locationNameEl = locationSelector.querySelector('.location-name');
          if (locationNameEl) {
            locationNameEl.textContent = `${location.city}, ${location.state}`;
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
    
    // Update position on scroll
    window.addEventListener('scroll', () => {
      if (locationMenu.classList.contains('active')) {
        positionDropdown();
      }
    }, { passive: true });
    
    // Update position on resize
    window.addEventListener('resize', () => {
      if (locationMenu.classList.contains('active')) {
        positionDropdown();
      }
    });
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
      const iconSpan = parseHTML(iconHTML);
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

  // Search functionality
  const searchInput = block.querySelector('#header-search-input');
  const searchButton = block.querySelector('.search-button');
  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        // Use clean URL with search param
        window.location.href = `catalog?search=${encodeURIComponent(query)}`;
      }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
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
  
  // Listen for cart item added events to show notification
  window.addEventListener('cartItemAdded', (e) => {
    const { productName, quantity } = e.detail;
    showCartNotification(productName, quantity);
  });
}
