// Header block decoration
export default function decorate(block) {
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

  // Location selector
  const locationSelector = block.querySelector('#location-selector');
  if (locationSelector) {
    locationSelector.addEventListener('click', () => {
      // In a real implementation, this would show a location picker
      const warehouses = [
        { name: 'Sacramento RDC', location: 'Sacramento, CA' },
        { name: 'Charlotte RDC', location: 'Charlotte, NC' },
        { name: 'Phoenix Metro Warehouse', location: 'Phoenix, AZ' },
        { name: 'Denver Warehouse', location: 'Denver, CO' },
        { name: 'Atlanta Metro Warehouse', location: 'Atlanta, GA' }
      ];
      
      const selected = prompt('Select warehouse:\n' + warehouses.map((w, i) => `${i + 1}. ${w.name}, ${w.location}`).join('\n'));
      if (selected) {
        const index = parseInt(selected) - 1;
        if (warehouses[index]) {
          const context = JSON.parse(localStorage.getItem('buildright_customer_context') || '{}');
          context.primary_warehouse = warehouses[index].name.toLowerCase().replace(/\s+/g, '_');
          localStorage.setItem('buildright_customer_context', JSON.stringify(context));
          locationSelector.querySelector('.location-name').textContent = `${warehouses[index].name}, ${warehouses[index].location.split(',')[1]}`;
        }
      }
    });
  }

  // Industry menu toggle
  const industryToggle = block.querySelector('#industry-toggle');
  const industryMenu = block.querySelector('#industry-menu');
  if (industryToggle && industryMenu) {
    industryToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      industryMenu.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!industryMenu.contains(e.target) && !industryToggle.contains(e.target)) {
        industryMenu.classList.remove('active');
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
        // Use absolute path for consistency
        window.location.href = `/pages/catalog.html?search=${encodeURIComponent(query)}`;
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
          window.location.href = '/pages/catalog.html';
        } else {
          window.location.href = `/pages/catalog.html?category=${category}`;
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
