/**
 * Site Configuration
 * 
 * Follows EDS best practices:
 * - Runtime config fetched from /config/env.json
 * - Config file can differ per branch (main/stage/dev)
 * - No sensitive values in client-side code
 * 
 * @module scripts/site-config
 */

// Cache for loaded config
let _configPromise = null;
let _cachedConfig = null;

/**
 * Load environment configuration from /config/env.json
 * This file can differ per Git branch for environment-specific settings
 * 
 * @returns {Promise<Object>} Configuration object
 */
export async function loadConfig() {
  // Return cached config if available
  if (_cachedConfig) {
    return _cachedConfig;
  }
  
  // Return existing promise if loading in progress
  if (_configPromise) {
    return _configPromise;
  }
  
  _configPromise = (async () => {
    try {
      const response = await fetch('/config/env.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      _cachedConfig = await response.json();
      return _cachedConfig;
    } catch (error) {
      console.warn('[SiteConfig] Failed to load /config/env.json, using defaults:', error.message);
      // Fallback defaults for development
      _cachedConfig = {
        meshEndpoint: null,
        environment: 'development'
      };
      return _cachedConfig;
    }
  })();
  
  return _configPromise;
}

/**
 * Get the mesh endpoint URL
 * @returns {Promise<string|null>} Mesh endpoint or null if not configured
 */
export async function getMeshEndpoint() {
  const config = await loadConfig();
  return config.meshEndpoint || null;
}

/**
 * Get the current environment name
 * @returns {Promise<string>} Environment name (development, staging, production)
 */
export async function getEnvironment() {
  const config = await loadConfig();
  return config.environment || 'development';
}

/**
 * Synchronous access to cached config (must call loadConfig first)
 * @returns {Object|null} Cached config or null if not loaded
 */
export function getCachedConfig() {
  return _cachedConfig;
}

// Feature flags (can be extended)
export const FEATURES = {
  debugLogging: true,
};
