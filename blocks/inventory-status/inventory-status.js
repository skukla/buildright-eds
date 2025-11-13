// Inventory status block decoration
import { parseHTMLFragment } from '../../scripts/utils.js';

export default async function decorate(block) {
  const sku = block.getAttribute('data-sku');
  const companyId = block.getAttribute('data-company');
  if (!sku) return;

  // Import data functions
  const { getProductBySKU, getInventory, getInventoryStatus, getWarehouses, getPrimaryWarehouse, getCustomerContext } = await import('../../scripts/data-mock.js');

  // Load product and update inventory using HTML templates
  async function updateInventory() {
    const product = await getProductBySKU(sku);
    if (!product) return;

    const context = getCustomerContext();
    const allWarehouses = await getWarehouses();
    const primaryWarehouse = getPrimaryWarehouse();
    
    // Filter warehouses based on user's company/region
    let warehouses;
    if (context.isLoggedIn && context.company) {
      // For logged-in users, show warehouses relevant to their company
      // In a real implementation, this would filter based on company's service area
      warehouses = allWarehouses.filter(wh => wh.priority === 1);
    } else {
      // For non-logged-in users, show primary distribution centers
      warehouses = allWarehouses.filter(wh => wh.id === primaryWarehouse);
    }
    
    const warehouseList = block.querySelector('.warehouse-list');

    if (!warehouseList) return;

    // Escape HTML helper
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Build HTML template for all warehouse items
    const warehousesHTML = warehouses.map(warehouse => {
      const quantity = getInventory(product, warehouse.id);
      const status = getInventoryStatus(product, warehouse.id);
      const isPrimary = warehouse.id === primaryWarehouse;
      const priorityClass = isPrimary ? 'priority' : '';
      const warehouseName = isPrimary ? `${warehouse.name} (Primary)` : warehouse.name;
      
      // Combine quantity and status into one line
      const stockInfo = status === 'in-stock' ? `${quantity} available` : 
                        status === 'low-stock' ? `${quantity} (Low stock)` : 
                        'Out of stock';

      return `
        <div class="warehouse-item ${priorityClass}">
            <div class="warehouse-name">${escapeHtml(warehouseName)}</div>
          <div class="warehouse-quantity">${escapeHtml(stockInfo)}</div>
        </div>
      `;
    }).join('');

    // Parse and append all warehouse items at once
    warehouseList.innerHTML = '';
    const fragment = parseHTMLFragment(warehousesHTML);
    warehouseList.appendChild(fragment);
  }

  // Initial load
  updateInventory();
}

