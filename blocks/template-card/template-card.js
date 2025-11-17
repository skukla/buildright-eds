/**
 * Template Card Block
 * Display floor plan templates (for Sarah)
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default function decorate(block) {
  // Create structure if not present
  if (!block.querySelector('.template-card-image')) {
    block.innerHTML = `
      <div class="template-card-image">
        <img src="" alt="" loading="lazy">
      </div>
      <div class="template-card-content">
        <h3 class="template-card-title"></h3>
        <div class="template-card-specs"></div>
        <div class="template-card-actions"></div>
      </div>
    `;
  }
  
  // Block can be initialized with data
  block.setData = function(templateData) {
    this.data = templateData;
    this.render();
  };
  
  block.render = function() {
    if (!this.data) return;
    
    const { name, sqft, stories, bedrooms, bathrooms, image, variants } = this.data;
    
    // Update image
    const img = block.querySelector('.template-card-image img');
    img.src = image || '/images/floor-plans/placeholder.png';
    img.alt = `${name} floor plan`;
    
    // Add badge if has variants
    if (variants && variants.length > 1) {
      const imageContainer = block.querySelector('.template-card-image');
      let badge = imageContainer.querySelector('.template-card-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'template-card-badge';
        imageContainer.appendChild(badge);
      }
      badge.textContent = `${variants.length} Variants`;
    }
    
    // Update title
    const title = block.querySelector('.template-card-title');
    title.textContent = name;
    
    // Update specs
    const specsContainer = block.querySelector('.template-card-specs');
    specsContainer.innerHTML = '';
    
    const specs = [
      { icon: 'layout-grid', label: `${sqft.toLocaleString()} sq ft` },
      { icon: 'building-2', label: `${stories} ${stories === 1 ? 'Story' : 'Stories'}` },
      { icon: 'home', label: `${bedrooms} BR / ${bathrooms} BA` }
    ];
    
    specs.forEach(spec => {
      const specEl = document.createElement('div');
      specEl.className = 'template-spec';
      
      const icon = createIcon(spec.icon, 'small');
      specEl.appendChild(icon);
      
      const label = document.createElement('span');
      label.textContent = spec.label;
      specEl.appendChild(label);
      
      specsContainer.appendChild(specEl);
    });
    
    // Update actions
    const actionsContainer = block.querySelector('.template-card-actions');
    actionsContainer.innerHTML = '';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-secondary';
    viewBtn.textContent = 'View Details';
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('template:view', {
        detail: { template: this.data }
      }));
    });
    
    const orderBtn = document.createElement('button');
    orderBtn.className = 'btn btn-primary';
    orderBtn.textContent = 'Order Materials';
    orderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('template:order', {
        detail: { template: this.data }
      }));
    });
    
    actionsContainer.appendChild(viewBtn);
    actionsContainer.appendChild(orderBtn);
  };
  
  // Click on card (excluding buttons)
  block.addEventListener('click', () => {
    if (block.data) {
      window.dispatchEvent(new CustomEvent('template:select', {
        detail: { template: block.data }
      }));
    }
  });
  
  return block;
}

