// Base URL Detection for GitHub Pages
// This script detects the base URL and sets a <base> tag in the document head
// This allows all relative URLs to work correctly in GitHub Pages subdirectory deployments

(function() {
  // Only run if base tag doesn't already exist
  if (document.querySelector('base')) {
    return;
  }

  // Detect base path from current location
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  
  let basePath = '/';
  
  // If we're in a subdirectory (GitHub Pages deployment)
  // Example: /buildright-eds/index.html -> /buildright-eds/
  // Example: /buildright-eds/pages/catalog.html -> /buildright-eds/
  if (pathParts.length > 0 && pathParts[0] !== 'pages' && pathParts[0] !== 'index.html') {
    basePath = `/${pathParts[0]}/`;
  }
  
  // Create and insert base tag
  const baseTag = document.createElement('base');
  baseTag.href = window.location.origin + basePath;
  document.head.insertBefore(baseTag, document.head.firstChild);
  
  // Store base path globally for JavaScript use
  window.BASE_PATH = basePath;
  
  // Handle redirects from 404.html
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || sessionStorage.getItem('redirect_path');
  
  if (redirect) {
    sessionStorage.removeItem('redirect_path');
    
    // Parse the redirect path
    let redirectPath = redirect;
    
    // Remove base path from redirect if present
    if (basePath !== '/' && redirectPath.startsWith(basePath)) {
      redirectPath = redirectPath.substring(basePath.length);
    }
    
    // Clean up leading slash
    if (!redirectPath.startsWith('/')) {
      redirectPath = '/' + redirectPath;
    }
    
    // Map common routes to actual file locations
    const routeMap = {
      '/catalog': '/pages/catalog.html',
      '/project-builder': '/pages/project-builder.html',
      '/cart': '/pages/cart.html',
      '/login': '/pages/login.html',
      '/order-history': '/pages/order-history.html',
      '/account': '/pages/account.html',
      '/product': '/pages/product-detail.html'
    };
    
    // Check if redirect path matches a route
    let targetPath = redirectPath;
    for (const [route, file] of Object.entries(routeMap)) {
      if (redirectPath === route || redirectPath.startsWith(route + '/') || redirectPath.startsWith(route + '?')) {
        targetPath = file + redirectPath.substring(route.length);
        break;
      }
    }
    
    // Navigate to the correct location
    const newUrl = window.location.origin + basePath.substring(1) + targetPath.substring(1);
    window.location.replace(newUrl);
  }
})();

