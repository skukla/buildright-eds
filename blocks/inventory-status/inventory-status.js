// Inventory status block decoration
export default async function decorate(block) {
  const sku = block.getAttribute('data-sku');
  if (!sku) return;

  // Import data functions
  const { getProductBySKU, getInventory, getInventoryStatus, getWarehouses, getPrimaryWarehouse } = await import('scripts/data-mock.js');

  // Load product and update inventory
  async function updateInventory() {
    const product = await getProductBySKU(sku);
    if (!product) return;

    const warehouses = await getWarehouses();
    const primaryWarehouse = getPrimaryWarehouse();
    const warehouseList = block.querySelector('.warehouse-list');

    if (!warehouseList) return;

    warehouseList.innerHTML = '';

    warehouses.forEach(warehouse => {
      const quantity = getInventory(product, warehouse.id);
      const status = getInventoryStatus(product, warehouse.id);
      const isPrimary = warehouse.id === primaryWarehouse;

      const item = document.createElement('div');
      item.className = 'warehouse-item';
      if (isPrimary) {
        item.classList.add('priority');
      }

      const info = document.createElement('div');
      info.className = 'warehouse-info';

      const name = document.createElement('div');
      name.className = 'warehouse-name';
      name.textContent = warehouse.name;
      if (isPrimary) {
        name.textContent += ' (Primary)';
      }
      info.appendChild(name);

      const location = document.createElement('div');
      location.className = 'warehouse-location';
      location.textContent = warehouse.location;
      info.appendChild(location);

      item.appendChild(info);

      const statusDiv = document.createElement('div');
      statusDiv.className = 'warehouse-status';

      const qty = document.createElement('div');
      qty.className = 'warehouse-quantity';
      qty.textContent = `${quantity} in stock`;
      statusDiv.appendChild(qty);

      const statusBadge = document.createElement('span');
      statusBadge.className = `status ${status}`;
      statusBadge.textContent = status === 'in-stock' ? 'Available' : 
                                status === 'low-stock' ? 'Low Stock' : 
                                'Out of Stock';
      statusDiv.appendChild(statusBadge);

      item.appendChild(statusDiv);
      warehouseList.appendChild(item);
    });
  }

  // Initial load
  updateInventory();
}

