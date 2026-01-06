/**
 * Mesh Integration Service
 *
 * Thin wrapper that re-exports mesh-client functions.
 * Kept for backward compatibility with existing imports.
 *
 * @module scripts/services/mesh-integration
 */

import {
  initializePersona,
  initializePersonaByEmail,
  searchProducts,
  getProductBySKU,
  getPersonaHeaders,
  getCurrentPersona,
} from './mesh-client.js';

/**
 * Initialize persona by ID (for demo quick login)
 * @deprecated Use initializePersona from mesh-client.js directly
 */
export async function initializeMeshForPersona(personaId) {
  console.log('[MeshIntegration] initializeMeshForPersona:', personaId);
  const persona = await initializePersona(personaId);
  return { persona };
}

/**
 * Initialize persona by email (for Commerce auth)
 * @deprecated Use initializePersonaByEmail from mesh-client.js directly
 */
export async function initializeMeshForEmail(email) {
  console.log('[MeshIntegration] initializeMeshForEmail:', email);
  const persona = await initializePersonaByEmail(email);
  return { persona };
}

// Re-export for convenience
export {
  initializePersona,
  initializePersonaByEmail,
  searchProducts,
  getProductBySKU as getProduct,
  getPersonaHeaders,
  getCurrentPersona,
};
