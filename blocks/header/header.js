// Header block decoration
import { getCatalogUrl, parseCatalogPath, parseProjectBuilderPath, handleLegacyRedirect } from '../../scripts/url-router.js';

export default function decorate(block) {
  // Check for legacy URLs and redirect if needed
  handleLegacyRedirect();
  
  // URLs are now handled by base tag - no path fixing needed
  
  // Update cart count from localStorage
  function updateCartCount() {
    const cartCountEl = block.querySelector('.cart-count');
    if (cartCountEl) {
      try {
        const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
        const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCountEl.textContent = count;
      } catch (e) {
        cartCountEl.textContent = '0';
      }
    }
  }

  // Use pre-loaded cart count if available (prevents layout shift)
  const cartCountEl = block.querySelector('.cart-count');
  if (cartCountEl && typeof window.__INITIAL_CART_COUNT__ !== 'undefined') {
    cartCountEl.textContent = window.__INITIAL_CART_COUNT__;
  } else {
    // Fallback to loading from localStorage
    updateCartCount();
  }

  // Listen for cart updates
  window.addEventListener('cartUpdated', updateCartCount);

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
    }
  };

  // Initialize location display from customer context
  function initializeLocationDisplay() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    const currentCompany = context.company || 'premium_commercial';
    const currentLocationId = context.location_id || 'los_angeles';
    
    const company = companyLocations[currentCompany];
    const location = company.locations.find(loc => loc.id === currentLocationId) || company.locations[0];
    
    // Set display
    const locationNameEl = block.querySelector('.location-name');
    if (locationNameEl) {
      locationNameEl.textContent = `${company.name} - ${location.city}, ${location.state}`;
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

  // Populate location dropdown
  function populateLocationDropdown() {
    const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
    const currentCompany = context.company || 'premium_commercial';
    const company = companyLocations[currentCompany];
    const currentLocationId = context.location_id || company.locations[0].id;
    
    const listEl = block.querySelector('#location-menu-list');
    
    if (listEl) {
      listEl.innerHTML = '';
      
      company.locations.forEach((location) => {
        const li = document.createElement('li');
        li.className = 'location-menu-item';
        if (location.id === currentLocationId) {
          li.classList.add('active');
        }
        
        const button = document.createElement('button');
        button.className = 'location-menu-item-button';
        button.type = 'button';
        button.setAttribute('data-location-id', location.id);
        
        const locationText = document.createElement('span');
        locationText.className = 'location-menu-item-text';
        locationText.textContent = `${location.city}, ${location.state}`;
        
        const locationBadge = document.createElement('span');
        locationBadge.className = 'location-menu-item-badge';
        locationBadge.textContent = location.isPrimary ? 'Primary' : 'Secondary';
        
        button.appendChild(locationText);
        button.appendChild(locationBadge);
        li.appendChild(button);
        listEl.appendChild(li);
      });
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
      industryToggle.innerHTML = label;
      const iconSpan = document.createElement('span');
      iconSpan.className = 'industry-toggle-icon';
      iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
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
}
