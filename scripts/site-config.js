/**
 * Site Configuration
 * Central configuration for environment-specific settings
 * 
 * In production, these values would come from environment variables
 * or a deployment configuration. For local development, defaults are provided.
 */

// API Mesh Configuration
// The mesh ID changes when the mesh is recreated
export const MESH_CONFIG = {
  // Sandbox mesh endpoint
  endpoint: 'https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql',
  
  // Production endpoint would be:
  // endpoint: 'https://graph.adobe.io/api/YOUR_PRODUCTION_MESH_ID/graphql',
};

// Commerce Configuration (for future use with dropins)
export const COMMERCE_CONFIG = {
  // Commerce GraphQL endpoint (when using Commerce directly)
  // endpoint: 'https://your-commerce-instance.com/graphql',
};

// Feature Flags
export const FEATURES = {
  // Use real ACO/mesh data vs. local mock data
  useMeshData: true,
  
  // Enable debug logging
  debugLogging: true,
};

// Export a frozen config to prevent accidental mutation
export default Object.freeze({
  mesh: MESH_CONFIG,
  commerce: COMMERCE_CONFIG,
  features: FEATURES,
});

