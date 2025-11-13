// Footer block - EDS compatible

export default function decorate(block) {
  // Fix static link paths to use BASE_PATH for GitHub Pages compatibility
  const basePath = window.BASE_PATH || '/';
  const pageLinks = block.querySelectorAll('a[href^="pages/"]');
  pageLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.setAttribute('href', `${basePath}${href}`);
  });
}

