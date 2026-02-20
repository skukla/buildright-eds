/**
 * Demo Inspector Initialization
 *
 * Loads the universal demo-inspector custom element and applies
 * Level 1 block-to-source tagging for API Mesh mode.
 *
 * Level 1: Maps EDS block names to their primary API Mesh data source.
 * Level 2: Per-block sub-container tagging is done in individual block decorators.
 */

// Block name → primary API Mesh data source
const SOURCE_MAP = {
  'product-detail': 'catalog',
  'product-tile': 'catalog',
  'product-list': 'search',
  'featured-products': 'catalog',
  'header': 'commerce',
  'footer': 'commerce',
};

/**
 * Tags block containers with their primary data source (Level 1).
 * Skips blocks that already have data-inspector-source set (Level 2 takes precedence).
 */
function tagBlockSources() {
  document.querySelectorAll('[data-block-name]').forEach((block) => {
    if (block.hasAttribute('data-inspector-source')) return;
    const name = block.getAttribute('data-block-name');
    const source = SOURCE_MAP[name] || (name.startsWith('commerce-') ? 'commerce' : null);
    if (source) {
      block.setAttribute('data-inspector-source', source);
    }
  });
}

/**
 * Loads the universal inspector and applies Level 1 source tagging.
 * Fails silently if the inspector submodule is not installed.
 */
export async function initInspector() {
  try {
    await import('/demo-inspector/dist/demo-inspector.js');
    tagBlockSources();
    const el = document.createElement('demo-inspector');
    el.setAttribute('modes', 'mesh,eds');
    document.body.appendChild(el);
  } catch {
    // Inspector not installed — skip silently
  }
}
