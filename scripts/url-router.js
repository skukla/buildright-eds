/**
 * URL Router for path-based navigation
 * Converts between path-based URLs and internal category/type codes
 */

// Category slug to internal code mapping
const CATEGORY_MAP = {
  'structural-materials': 'structural_materials',
  'windows-doors': 'windows_doors',
  'fasteners-hardware': 'fasteners_hardware',
  'roofing': 'roofing',
  'framing-drywall': 'framing_drywall'
};

// Reverse mapping: internal code to slug
const CODE_TO_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([slug, code]) => [code, slug])
);

// Division mapping
const DIVISION_SLUGS = ['commercial', 'residential', 'pro'];

/**
 * Get base path from window.BASE_PATH or default to '/'
 */
function getBasePath() {
  return window.BASE_PATH || '/';
}

/**
 * Strip base path from pathname
 * @param {string} pathname - Full pathname
 * @returns {string} - Pathname without base path
 */
function stripBasePath(pathname) {
  const basePath = getBasePath();
  if (basePath !== '/' && pathname.startsWith(basePath)) {
    return pathname.substring(basePath.length);
  }
  return pathname;
}

/**
 * Parse a catalog path and extract category/division
 * Handles clean URLs like /catalog/structural-materials
 * @param {string} pathname - e.g., "/catalog/structural-materials" or "/buildright-eds/catalog/structural-materials"
 * @returns {Object} - { type: 'category'|'division'|'all', value: string|null }
 */
export function parseCatalogPath(pathname) {
  // Strip base path if present (e.g., /buildright-eds/)
  let path = stripBasePath(pathname);
  
  // Normalize path - remove leading/trailing slashes
  path = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  
  // Remove pages/ prefix if present (when we're on the actual file)
  // e.g., "pages/catalog.html" -> "catalog"
  path = path.replace(/^pages\//, '').replace(/\.html$/, '');
  
  const segments = path.split('/').filter(Boolean);
  
  // Root catalog = all products
  if (segments.length === 1 && segments[0] === 'catalog') {
    return { type: 'all', value: null };
  }
  
  // /catalog/something (e.g., /catalog/structural-materials)
  if (segments[0] === 'catalog' && segments.length === 2) {
    const slug = segments[1];
    
    // Convert kebab-case to internal format
    // e.g., "structural-materials" -> "structural_materials"
    const internalSlug = slug.replace(/-/g, '_');
    
    // Check if it's a category
    if (CATEGORY_MAP[slug]) {
      return { type: 'category', value: CATEGORY_MAP[slug] };
    }
    
    // Try as underscore format directly
    const categoryValues = Object.values(CATEGORY_MAP);
    if (categoryValues.includes(internalSlug)) {
      return { type: 'category', value: internalSlug };
    }
    
    // Check if it's a division
    if (DIVISION_SLUGS.includes(slug)) {
      return { type: 'division', value: slug };
    }
  }
  
  return { type: 'unknown', value: null };
}

/**
 * Parse a project builder path
 * @param {string} pathname - e.g., "/project-builder/remodel/bathroom" or "/buildright-eds/project-builder/remodel/bathroom"
 * @returns {Object} - { projectType: string|null, projectDetail: string|null }
 */
export function parseProjectBuilderPath(pathname) {
  // Strip base path if present
  let path = stripBasePath(pathname);
  
  path = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  const segments = path.split('/').filter(Boolean);
  
  // /project-builder = home
  if (segments.length === 1 && segments[0] === 'project-builder') {
    return { projectType: null, projectDetail: null };
  }
  
  // /project-builder/new-construction
  if (segments[0] === 'project-builder' && segments.length === 2) {
    return { 
      projectType: segments[1].replace(/-/g, '_'), // Convert kebab to snake_case
      projectDetail: null 
    };
  }
  
  // /project-builder/remodel/bathroom
  if (segments[0] === 'project-builder' && segments.length === 3) {
    return {
      projectType: segments[1].replace(/-/g, '_'),
      projectDetail: segments[2].replace(/-/g, '_')
    };
  }
  
  return { projectType: null, projectDetail: null };
}

/**
 * Generate a clean catalog URL from category code
 * @param {string} categoryCode - Internal category code (e.g., 'structural_materials')
 * @returns {string} - Clean URL path (e.g., 'catalog' or 'catalog/structural-materials')
 */
export function getCatalogUrl(categoryCode) {
  const basePath = getBasePath();
  
  if (!categoryCode || categoryCode === 'all') {
    return `${basePath}catalog`;
  }
  
  // Convert internal format to URL slug
  // e.g., 'structural_materials' -> 'structural-materials'
  const slug = categoryCode.replace(/_/g, '-');
  
  // Return absolute path with BASE_PATH for consistent navigation
  return `${basePath}catalog/${slug}`;
}

/**
 * Generate a project builder URL
 * @param {string} projectType - Project type (e.g., 'new_construction')
 * @param {string} projectDetail - Optional project detail (e.g., 'bathroom')
 * @returns {string} - Path-based URL with base path
 */
export function getProjectBuilderUrl(projectType, projectDetail) {
  const basePath = getBasePath();
  const basePrefix = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  
  if (!projectType) {
    return `${basePrefix}/project-builder`;
  }
  
  // Convert snake_case to kebab-case
  const typeSlug = projectType.replace(/_/g, '-');
  
  if (projectDetail) {
    const detailSlug = projectDetail.replace(/_/g, '-');
    return `${basePrefix}/project-builder/${typeSlug}/${detailSlug}`;
  }
  
  return `${basePrefix}/project-builder/${typeSlug}`;
}

/**
 * Check if current URL is legacy (query param based) and needs redirect
 * @returns {string|null} - New URL if redirect needed, null otherwise
 */
export function checkLegacyUrl() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const params = url.searchParams;
  
  // Catalog URLs are now direct file paths, so no redirect needed
  // (catalog.html already handles query params correctly)
  
  // Check project builder - still support query param redirects
  if (pathname.includes('project-builder.html')) {
    const projectType = params.get('projectType');
    const projectDetail = params.get('projectDetail');
    
    if (projectType) {
      // Determine path based on current location
      const isInPagesDir = pathname.includes('/pages/');
      const builderPath = isInPagesDir ? 'project-builder.html' : 'pages/project-builder.html';
      let redirectUrl = builderPath;
      
      if (projectDetail) {
        redirectUrl += `?projectType=${projectType}&projectDetail=${projectDetail}`;
      } else {
        redirectUrl += `?projectType=${projectType}`;
      }
      
      return redirectUrl;
    }
  }
  
  return null;
}

/**
 * Perform redirect from legacy URL to new path-based URL if needed
 */
export function handleLegacyRedirect() {
  const newUrl = checkLegacyUrl();
  if (newUrl) {
    // Use replace to avoid adding to history
    window.location.replace(newUrl);
    return true;
  }
  return false;
}

