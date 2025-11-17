/**
 * Product Tile Block
 * Display selectable product tiles
 */

import { createIcon } from '../../scripts/icon-helper.js';
import { acoService } from '../../scripts/aco-service.js';
import { authService } from '../../scripts/auth.js';

export default function decorate(block) {
  // Create structure if not present
  if (!block.querySelector('.product-tile-image')) {
    block.innerHTML = `
      <div class="product-tile-image">
        <img src="" alt="" loading="lazy">
        <div class="product-tile-inventory"></div>
      </div>
      <div class="product-tile-content">
        <h4 class="product-tile-title"></h4>
        <p class="product-tile-sku"></p>
        <div class="product-tile-price"></div>
        <div class="product-tile-actions"></div>
      </div>
    `;
  }
  
  block.selected = false;
  block.data = null;
  
  block.setData = async function(productData) {
    this.data = productData;
    
    // Get pricing for current customer group
    const customerGroup = authService.getCustomerGroup();
    if (customerGroup) {
      try {
        const pricing = await acoService.getPricing({
          productIds: [productData.sku],
          customerGroup,
          quantity: 1
        });
        
        this.data.pricing = pricing.pricing[productData.sku];
      } catch (error) {
        console.error('Error getting pricing:', error);
      }
    }
    
    this.render();
  };
  
  block.render = function() {
    if (!this.data) return;
    
    const { name, sku, image, inStock, pricing } = this.data;
    
    // Update image
    const img = block.querySelector('.product-tile-image img');
    img.src = image || '/images/products/placeholder.png';
    img.alt = name;
    
    // Add select indicator
    const imageContainer = block.querySelector('.product-tile-image');
    let selectIndicator = imageContainer.querySelector('.product-tile-select-indicator');
    if (!selectIndicator) {
      selectIndicator = document.createElement('div');
      selectIndicator.className = 'product-tile-select-indicator';
      const icon = createIcon('check-circle', 'medium');
      selectIndicator.appendChild(icon);
      imageContainer.insertBefore(selectIndicator, imageContainer.firstChild);
    }
    
    // Update inventory status
    const inventoryEl = block.querySelector('.product-tile-inventory');
    inventoryEl.innerHTML = '';
    
    let inventoryIcon, inventoryText, inventoryClass;
    if (inStock === false || inStock === 0) {
      inventoryIcon = 'circle-help';
      inventoryText = 'Out of Stock';
      inventoryClass = 'out-of-stock';
    } else if (inStock < 10) {
      inventoryIcon = 'triangle-alert';
      inventoryText = 'Low Stock';
      inventoryClass = 'low-stock';
    } else {
      inventoryIcon = 'check-circle';
      inventoryText = 'In Stock';
      inventoryClass = 'in-stock';
    }
    
    inventoryEl.className = `product-tile-inventory ${inventoryClass}`;
    const icon = createIcon(inventoryIcon, 'small');
    inventoryEl.appendChild(icon);
    
    const statusText = document.createElement('span');
    statusText.textContent = inventoryText;
    inventoryEl.appendChild(statusText);
    
    // Update title and SKU
    block.querySelector('.product-tile-title').textContent = name;
    block.querySelector('.product-tile-sku').textContent = `SKU: ${sku}`;
    
    // Update price
    const priceEl = block.querySelector('.product-tile-price');
    if (pricing) {
      priceEl.textContent = `$${pricing.unitPrice.toFixed(2)}`;
    } else if (this.data.price) {
      priceEl.textContent = `$${this.data.price.toFixed(2)}`;
    }
    
    // Update actions
    const actionsContainer = block.querySelector('.product-tile-actions');
    actionsContainer.innerHTML = '';
    
    const selectBtn = document.createElement('button');
    selectBtn.className = this.selected ? 'btn btn-primary' : 'btn btn-secondary';
    selectBtn.textContent = this.selected ? 'Selected' : 'Select';
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    actionsContainer.appendChild(selectBtn);
  };
  
  block.toggle = function() {
    this.selected = !this.selected;
    
    if (this.selected) {
      block.classList.add('selected');
    } else {
      block.classList.remove('selected');
    }
    
    this.render();
    
    window.dispatchEvent(new CustomEvent('product:toggle', {
      detail: { product: this.data, selected: this.selected }
    }));
  };
  
  block.setSelected = function(selected) {
    this.selected = selected;
    
    if (selected) {
      block.classList.add('selected');
    } else {
      block.classList.remove('selected');
    }
    
    this.render();
  };
  
  // Click on tile (excluding buttons)
  block.addEventListener('click', () => {
    this.toggle();
  });
  
  return block;
}

