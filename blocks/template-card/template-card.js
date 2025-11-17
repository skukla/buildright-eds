/**
 * Template Card Block
 * Display floor plan templates (for Sarah)
 * 
 * NOTE: This block uses a programmatic API pattern (not standard EDS)
 * because it's controlled by JavaScript with template data, not author content.
 * Standard EDS blocks transform author-created content from Google Docs.
 * 
 * @param {HTMLElement} block The block element from the DOM
 * @returns {HTMLElement} The decorated block element
 */

import { createIcon } from '../../scripts/icon-helper.js';

// Configuration
const CONFIG = {
  PLACEHOLDER_IMAGE: '/images/floor-plans/placeholder.png',
  ICONS: {
    SQFT: 'layout-grid',
    STORIES: 'building-2',
    BEDROOMS: 'home'
  }
};

export default function decorate(block) {
  try {
    const basePath = window.BASE_PATH || '';
    
    // Create structure if not present
    // NOTE: Non-standard pattern - justified for programmatic use
    if (!block.querySelector(':scope > .template-card-image')) {
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
    
    /**
     * Set template data
     * @param {Object} templateData Template information
     */
    block.setData = function(templateData) {
      try {
        this.data = templateData;
        this.render();
      } catch (error) {
        console.error('Error setting template data:', error);
        this.showError('Failed to load template data');
      }
    };
    
    /**
     * Render template card content
     */
    block.render = function() {
      try {
        if (!this.data) return;
        
        const { name, sqft, stories, bedrooms, bathrooms, image, variants } = this.data;
        
        // Update image
        const img = block.querySelector(':scope > .template-card-image img');
        if (img) {
          img.src = image || `${basePath}${CONFIG.PLACEHOLDER_IMAGE}`;
          img.alt = `${name} floor plan`;
        }
        
        // Add badge if has variants
        if (variants && variants.length > 1) {
          const imageContainer = block.querySelector(':scope > .template-card-image');
          let badge = imageContainer?.querySelector(':scope > .template-card-badge');
          if (imageContainer && !badge) {
            badge = document.createElement('div');
            badge.className = 'template-card-badge';
            imageContainer.appendChild(badge);
          }
          if (badge) {
            badge.textContent = `${variants.length} Variants`;
          }
        }
        
        // Update title
        const title = block.querySelector(':scope > .template-card-content .template-card-title');
        if (title) title.textContent = name;
        
        // Update specs
        const specsContainer = block.querySelector(':scope > .template-card-content .template-card-specs');
        if (specsContainer) {
          specsContainer.replaceChildren(); // Clear existing content
          
          const specs = [
            { icon: CONFIG.ICONS.SQFT, label: `${sqft.toLocaleString()} sq ft` },
            { icon: CONFIG.ICONS.STORIES, label: `${stories} ${stories === 1 ? 'Story' : 'Stories'}` },
            { icon: CONFIG.ICONS.BEDROOMS, label: `${bedrooms} BR / ${bathrooms} BA` }
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
        }
        
        // Update actions
        const actionsContainer = block.querySelector(':scope > .template-card-content .template-card-actions');
        if (actionsContainer) {
          actionsContainer.replaceChildren(); // Clear existing content
          
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
        }
      } catch (error) {
        console.error('Error rendering template card:', error);
        this.showError('Failed to render template');
      }
    };
    
    /**
     * Show error message
     * @param {string} message Error message to display
     */
    block.showError = function(message) {
      block.innerHTML = `
        <div class="template-card-error">
          <p>${message}</p>
        </div>
      `;
    };
    
    // Click on card (excluding buttons)
    block.addEventListener('click', (e) => {
      // Don't emit event if clicking on a button
      if (e.target.closest('button')) return;
      
      if (block.data) {
        window.dispatchEvent(new CustomEvent('template:select', {
          detail: { template: block.data }
        }));
      }
    });
    
    return block;
    
  } catch (error) {
    console.error('Error decorating template-card block:', error);
    block.innerHTML = '<div class="template-card-error"><p>Failed to initialize template card</p></div>';
    return block;
  }
}
