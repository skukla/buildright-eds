// Base URL Detection for GitHub Pages
// This script detects the base URL and sets a <base> tag in the document head
// This allows all relative URLs to work correctly in GitHub Pages subdirectory deployments

(function() {
  // Only run if base tag doesn't already exist
  if (document.querySelector('base')) {
    return;
  }

  // Detect if we're on GitHub Pages subdirectory
  const pathname = window.location.pathname;
  const isGitHubPages = pathname.startsWith('/buildright-eds/');
  
  const basePath = isGitHubPages ? '/buildright-eds/' : '/';
  
  // Create and insert base tag
  const baseTag = document.createElement('base');
  baseTag.href = window.location.origin + basePath;
  document.head.insertBefore(baseTag, document.head.firstChild);
  
  // Store base path globally for JavaScript use
  window.BASE_PATH = basePath;
})();
