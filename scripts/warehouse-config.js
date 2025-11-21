/**
 * Warehouse Configuration
 * Centralized warehouse/distribution center definitions for inventory display
 * Aligns with Multi-Source Inventory (MSI) setup from PHASE-8
 */

export const WAREHOUSES = {
  WAREHOUSE_WEST: {
    code: 'warehouse_west',
    name: 'West Coast Distribution Center',
    city: 'Los Angeles',
    state: 'CA',
    region: 'western',
    priority: 1,
    isPrimary: true
  },
  WAREHOUSE_CENTRAL: {
    code: 'warehouse_central',
    name: 'Central Distribution Center',
    city: 'Dallas',
    state: 'TX',
    region: 'central',
    priority: 2,
    isPrimary: false
  },
  WAREHOUSE_EAST: {
    code: 'warehouse_east',
    name: 'East Coast Distribution Center',
    city: 'Atlanta',
    state: 'GA',
    region: 'eastern',
    priority: 3,
    isPrimary: false
  }
};

/**
 * Get warehouses as an array sorted by priority
 * @returns {Array} Array of warehouse objects
 */
export function getWarehouses() {
  return Object.values(WAREHOUSES).sort((a, b) => a.priority - b.priority);
}

/**
 * Get warehouse by code
 * @param {string} code - Warehouse code
 * @returns {Object|null} Warehouse object or null
 */
export function getWarehouse(code) {
  return Object.values(WAREHOUSES).find(wh => wh.code === code) || null;
}

/**
 * Get primary warehouse
 * @returns {Object} Primary warehouse object
 */
export function getPrimaryWarehouse() {
  return Object.values(WAREHOUSES).find(wh => wh.isPrimary);
}

/**
 * Get warehouses by region
 * @param {string} region - Region identifier
 * @returns {Array} Array of warehouse objects in that region
 */
export function getWarehousesByRegion(region) {
  return Object.values(WAREHOUSES).filter(wh => wh.region === region);
}

