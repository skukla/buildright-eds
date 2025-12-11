/**
 * Mesh Integration Service
 * 
 * Thin integration layer that connects the auth system with the catalog service.
 * No hardcoded persona data - all persona info comes from the mesh service.
 * 
 * @module scripts/services/mesh-integration
 */

import { catalogService } from './catalog-service.js';
import { getPersona } from '../persona-config.js';

/**
 * Initialize catalog service for the current persona
 * Should be called on login or session restore
 * 
 * @param {string} personaId - Persona ID (e.g., 'sarah')
 * @param {Object} options - Options to pass to catalog service
 * @returns {Promise<Object>} Combined persona data (local + mesh)
 */
export async function initializeMeshForPersona(personaId, options = {}) {
  console.log('[MeshIntegration] Initializing for persona:', personaId);
  
  // Get local persona config (UI preferences, etc.)
  const localPersona = getPersona(personaId);
  if (!localPersona) {
    console.error('[MeshIntegration] Unknown persona:', personaId);
    return null;
  }
  
  // Initialize catalog service (handles strategy selection internally)
  await catalogService.initialize(personaId, options);
  
  // Return combined data
  return {
    ...localPersona,
    mesh: catalogService.personaData,
    dataSource: catalogService.getActiveStrategy()
  };
}

/**
 * Initialize catalog service using customer email
 * Used by Commerce Auth Dropin integration to bridge to BuildRight persona system
 * 
 * @param {string} email - Customer email address
 * @param {Object} options - Options to pass to catalog service
 * @returns {Promise<Object>} Persona data from mesh
 */
export async function initializeMeshForEmail(email, options = {}) {
  console.log('[MeshIntegration] Initializing for email:', email);
  
  try {
    // Use catalog service's email-based initialization
    // This calls the persona action via mesh to get ACO context
    await catalogService.initializeByEmail(email, options);
    
    return {
      email,
      persona: catalogService.personaData,
      dataSource: catalogService.getActiveStrategy()
    };
  } catch (error) {
    console.error('[MeshIntegration] Failed to initialize for email:', error);
    throw error;
  }
}

/**
 * Get products using the active strategy
 * Delegates to catalog service
 */
export async function getProducts(phrase = '', options = {}) {
  return catalogService.searchProducts(phrase, options);
}

/**
 * Get product by SKU using the active strategy
 * Delegates to catalog service
 */
export async function getProduct(sku) {
  return catalogService.getProduct(sku);
}

/**
 * Generate BOM using the active strategy
 * Delegates to catalog service
 */
export async function getBOM(config) {
  return catalogService.generateBOM(config);
}

/**
 * Check if mesh is available and being used
 */
export function isUsingMesh() {
  return catalogService.isUsingRealData();
}

/**
 * Get the active data source name
 */
export function getDataSource() {
  return catalogService.getActiveStrategy();
}

// Re-export catalog service for direct access
export { catalogService };

export default {
  initializeMeshForPersona,
  initializeMeshForEmail,
  getProducts,
  getProduct,
  getBOM,
  isUsingMesh,
  getDataSource,
  catalogService
};
