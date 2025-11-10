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
 * Parse a catalog path and extract category/division
 * @param {string} pathname - e.g., "/catalog/structural-materials"
 * @returns {Object} - { type: 'category'|'division'|'all', value: string|null }
 */
export function parseCatalogPath(pathname) {
  // Normalize path
  const path = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const segments = path.split('/').filter(Boolean);
  
  // Root catalog = all products
  if (segments.length === 1 && segments[0] === 'catalog') {
    return { type: 'all', value: null };
  }
  
  // /catalog/something
  if (segments[0] === 'catalog' && segments.length === 2) {
    const slug = segments[1];
    
    // Check if it's a category
    if (CATEGORY_MAP[slug]) {
      return { type: 'category', value: CATEGORY_MAP[slug] };
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
 * @param {string} pathname - e.g., "/project-builder/remodel/bathroom"
 * @returns {Object} - { projectType: string|null, projectDetail: string|null }
 */
export function parseProjectBuilderPath(pathname) {
  const path = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
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
 * Generate a catalog URL from category code
 * @param {string} categoryCode - Internal category code (e.g., 'structural')
 * @returns {string} - Path-based URL (e.g., '/catalog/structural-materials')
 */
export function getCatalogUrl(categoryCode) {
  if (!categoryCode || categoryCode === 'all') {
    return '/catalog';
  }
  
  // Check if it's a division
  if (DIVISION_SLUGS.includes(categoryCode)) {
    return `/catalog/${categoryCode}`;
  }
  
  // Convert code to slug
  const slug = CODE_TO_SLUG[categoryCode];
  if (slug) {
    return `/catalog/${slug}`;
  }
  
  return '/catalog';
}

/**
 * Generate a project builder URL
 * @param {string} projectType - Project type (e.g., 'new_construction')
 * @param {string} projectDetail - Optional project detail (e.g., 'bathroom')
 * @returns {string} - Path-based URL
 */
export function getProjectBuilderUrl(projectType, projectDetail) {
  if (!projectType) {
    return '/project-builder';
  }
  
  // Convert snake_case to kebab-case
  const typeSlug = projectType.replace(/_/g, '-');
  
  if (projectDetail) {
    const detailSlug = projectDetail.replace(/_/g, '-');
    return `/project-builder/${typeSlug}/${detailSlug}`;
  }
  
  return `/project-builder/${typeSlug}`;
}

/**
 * Check if current URL is legacy (query param based) and needs redirect
 * @returns {string|null} - New URL if redirect needed, null otherwise
 */
export function checkLegacyUrl() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const params = url.searchParams;
  
  // Check catalog with category param
  if (pathname.includes('catalog.html')) {
    const category = params.get('category');
    const division = params.get('division');
    
    if (category) {
      return getCatalogUrl(category);
    }
    if (division) {
      return `/catalog/${division}`;
    }
    // No params = all products
    return '/catalog';
  }
  
  // Check project builder
  if (pathname.includes('project-builder.html')) {
    const projectType = params.get('projectType');
    const projectDetail = params.get('projectDetail');
    
    if (projectType) {
      return getProjectBuilderUrl(projectType, projectDetail);
    }
    return '/project-builder';
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

