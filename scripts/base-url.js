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
})();

