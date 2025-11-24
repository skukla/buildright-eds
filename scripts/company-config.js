/**
 * Company Configuration
 * Centralized company and location definitions for multi-location personas
 * Used by header location selector and customer context
 */

export const COMPANIES = {
  PRECISION_LUMBER: {
    id: 'precision_lumber',
    name: 'Precision Lumber & Supply',
    type: 'retail_store',
    locations: [
      { 
        id: 'austin', 
        city: 'Austin', 
        state: 'TX', 
        isPrimary: true, 
        region: 'central' 
      },
      { 
        id: 'san_antonio', 
        city: 'San Antonio', 
        state: 'TX', 
        isPrimary: false, 
        region: 'central' 
      },
      { 
        id: 'houston', 
        city: 'Houston', 
        state: 'TX', 
        isPrimary: false, 
        region: 'central' 
      }
    ]
  }
};

/**
 * Get company by ID
 * @param {string} companyId - Company ID
 * @returns {Object|null} Company object or null if not found
 */
export function getCompany(companyId) {
  return Object.values(COMPANIES).find(c => c.id === companyId) || null;
}

/**
 * Get all companies as array
 * @returns {Array} Array of all company objects
 */
export function getAllCompanies() {
  return Object.values(COMPANIES);
}

/**
 * Get company for persona
 * @param {Object} persona - Persona object
 * @returns {Object|null} Company object or null if persona has no company
 */
export function getCompanyForPersona(persona) {
  if (!persona) return null;
  
  // Kevin (Store Manager) uses Precision Lumber
  if (persona.id === 'kevin') {
    return COMPANIES.PRECISION_LUMBER;
  }
  
  // Add other persona -> company mappings here as needed
  
  return null;
}

/**
 * Get default location for company
 * @param {string} companyId - Company ID
 * @returns {Object|null} Default location or null
 */
export function getDefaultLocation(companyId) {
  const company = getCompany(companyId);
  if (!company || !company.locations || company.locations.length === 0) {
    return null;
  }
  
  // Return primary location or first location
  return company.locations.find(loc => loc.isPrimary) || company.locations[0];
}

