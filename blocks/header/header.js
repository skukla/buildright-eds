// Header block decoration
export default function decorate(block) {
  // Fix navigation paths for GitHub Pages subdirectory
  function fixNavigationPaths() {
    // Detect base path (e.g., '/buildright-eds/' or '/')
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const basePath = pathParts.length > 1 && pathParts[0] !== 'pages' ? `/${pathParts[0]}/` : '/';
    
    // Fix logo link to use absolute path from site root
    const logoLink = block.querySelector('.header-brand a');
    if (logoLink) {
      const currentHref = logoLink.getAttribute('href');
      if (currentHref && (currentHref.includes('index.html') || currentHref === '/buildright-eds/index.html')) {
        logoLink.setAttribute('href', `${basePath}index.html`.replace('//', '/'));
      }
    }
    
    // Fix all navigation links in header to use absolute paths
    const navLinks = block.querySelectorAll('a[href^="/pages/"], a[href^="pages/"], a[href^="./"]');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('/pages/')) {
        link.setAttribute('href', `${basePath}${href.substring(1)}`.replace('//', '/'));
      } else if (href.startsWith('pages/')) {
        link.setAttribute('href', `${basePath}${href}`.replace('//', '/'));
      } else if (href.startsWith('./')) {
        const filename = href.replace('./', '');
        link.setAttribute('href', `${basePath}pages/${filename}`.replace('//', '/'));
      }
    });
  }
  
  // Fix paths on load
  fixNavigationPaths();
  
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

  // Get base path for navigation
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const basePath = pathParts.length > 1 && pathParts[0] !== 'pages' ? `/${pathParts[0]}/` : '/';
  
  // Search functionality
  const searchInput = block.querySelector('#header-search-input');
  const searchButton = block.querySelector('.search-button');
  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        // Use absolute path with base path
        window.location.href = `${basePath}pages/catalog.html?search=${encodeURIComponent(query)}`.replace('//', '/');
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
          window.location.href = `${basePath}pages/catalog.html`.replace('//', '/');
        } else {
          window.location.href = `${basePath}pages/catalog.html?category=${category}`.replace('//', '/');
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
