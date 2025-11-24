/**
 * BASE_PATH Initialization
 * Must run synchronously BEFORE any module scripts load
 * This ensures image paths and navigation work on both localhost and GitHub Pages
 */
(function() {
  const pathname = window.location.pathname;
  const isGitHubPages = pathname.startsWith('/buildright-eds/');
  window.BASE_PATH = isGitHubPages ? '/buildright-eds/' : '/';
})();

