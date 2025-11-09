// Header block decoration
export default function decorate(block) {
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

  // Update cart count on load
  updateCartCount();

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
      industryToggle.textContent = label;
      const iconSpan = document.createElement('span');
      iconSpan.className = 'industry-toggle-icon';
      iconSpan.textContent = '▼';
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
        // Use relative path - base tag handles GitHub Pages subdirectory
        window.location.href = `pages/catalog.html?search=${encodeURIComponent(query)}`;
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
        if (category === 'all') {
          window.location.href = 'pages/catalog.html';
        } else {
          window.location.href = `pages/catalog.html?category=${category}`;
        }
      }
    });
  });

  // Set active nav link based on current page
  const currentPath = window.location.pathname;
  const currentCategory = new URLSearchParams(window.location.search).get('category');
  navLinks.forEach(link => {
    const linkCategory = link.getAttribute('data-category');
    const linkHref = link.getAttribute('href');
    
    // Normalize paths for comparison
    const normalizePath = (path) => {
      if (!path) return '';
      // Remove leading/trailing slashes and convert to lowercase for comparison
      return path.replace(/^\/+|\/+$/g, '').toLowerCase();
    };
    
    const normalizedCurrentPath = normalizePath(currentPath);
    const normalizedLinkHref = normalizePath(linkHref);
    
    // Check if link matches current page by href (must be exact match)
    const isActiveByHref = linkHref && (
      normalizedCurrentPath === normalizedLinkHref ||
      normalizedCurrentPath === normalizedLinkHref.replace(/^pages\//, '') ||
      normalizedCurrentPath.endsWith('/' + normalizedLinkHref) ||
      normalizedCurrentPath.endsWith('/' + normalizedLinkHref.replace(/^pages\//, ''))
    );
    
    // Check if link matches by category (only on catalog page)
    const isActiveByCategory = currentPath.includes('catalog') && (
      linkCategory === currentCategory || 
      (linkCategory === 'all' && !currentCategory)
    );
    
    // Only highlight if we're actually on the catalog page (not homepage)
    if (isActiveByHref && currentPath.includes('catalog')) {
      link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      link.setAttribute('aria-current', 'page');
    } else if (isActiveByCategory) {
      link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      link.setAttribute('aria-current', 'page');
    }
  });
}
