/**
 * Package Comparison Block
 * Compare Good/Better/Best packages (for Lisa)
 * 
 * NOTE: This block uses a programmatic API pattern (not standard EDS)
 * because it's controlled by JavaScript with package data, not author content.
 * Standard EDS blocks transform author-created content from Google Docs.
 * 
 * @param {HTMLElement} block The block element from the DOM
 * @returns {HTMLElement} The decorated block element
 */

import { createIcon } from '../../scripts/icon-helper.js';

// Configuration
const CONFIG = {
  PLACEHOLDER_IMAGE: '/images/packages/placeholder.jpg',
  ICONS: {
    FEATURE_CHECK: 'check-circle'
  },
  LABELS: {
    RECOMMENDED: 'Most Popular'
  }
};

export default function decorate(block) {
  try {
    const basePath = window.BASE_PATH || '';
    
    // Create structure if not present
    // NOTE: Non-standard pattern - justified for programmatic use
    if (!block.querySelector(':scope > .package-comparison-header')) {
      block.innerHTML = `
        <div class="package-comparison-header">
          <h2>Choose Your Package</h2>
          <p>Compare features and pricing across tiers</p>
        </div>
        <div class="package-comparison-grid"></div>
      `;
    }
    
    block.packages = [];
    block.selectedPackage = null;
    
    /**
     * Set packages to display
     * @param {Array} packages Array of package objects
     */
    block.setPackages = function(packages) {
      try {
        this.packages = packages;
        this.render();
      } catch (error) {
        console.error('Error setting packages:', error);
        this.showError('Failed to load packages');
      }
    };
    
    /**
     * Render package comparison grid
     */
    block.render = function() {
      try {
        const grid = block.querySelector(':scope > .package-comparison-grid');
        if (!grid) return;
        
        grid.replaceChildren(); // Clear existing content
        
        this.packages.forEach((pkg) => {
          const card = this.createPackageCard(pkg);
          grid.appendChild(card);
        });
      } catch (error) {
        console.error('Error rendering packages:', error);
        this.showError('Failed to render packages');
      }
    };
    
    /**
     * Create a single package card
     * @param {Object} pkg Package data
     * @returns {HTMLElement} Package card element
     */
    block.createPackageCard = function(pkg) {
      const { tier, name, price, image, features, recommended } = pkg;
      
      const card = document.createElement('div');
      card.className = 'package-card';
      if (recommended) card.classList.add('recommended');
      if (this.selectedPackage === tier) card.classList.add('selected');
      
      // Badge (if recommended)
      if (recommended) {
        const badge = document.createElement('div');
        badge.className = 'package-card-badge';
        badge.textContent = CONFIG.LABELS.RECOMMENDED;
        card.appendChild(badge);
      }
      
      // Image
      const imageContainer = document.createElement('div');
      imageContainer.className = 'package-card-image';
      const img = document.createElement('img');
      img.src = image || `${basePath}${CONFIG.PLACEHOLDER_IMAGE}`;
      img.alt = `${name} bathroom`;
      img.loading = 'lazy';
      imageContainer.appendChild(img);
      card.appendChild(imageContainer);
      
      // Content
      const content = document.createElement('div');
      content.className = 'package-card-content';
      
      // Header
      const header = document.createElement('div');
      header.className = 'package-card-header';
      
      const tierEl = document.createElement('h3');
      tierEl.className = 'package-card-tier';
      tierEl.textContent = name;
      
      const priceEl = document.createElement('div');
      priceEl.className = 'package-card-price';
      priceEl.textContent = `$${price.toLocaleString()}`;
      
      header.appendChild(tierEl);
      header.appendChild(priceEl);
      content.appendChild(header);
      
      // Features
      const featuresList = document.createElement('ul');
      featuresList.className = 'package-card-features';
      
      features.forEach(feature => {
        const li = document.createElement('li');
        li.className = 'package-feature';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'package-feature-icon';
        const icon = createIcon(CONFIG.ICONS.FEATURE_CHECK, 'small');
        iconContainer.appendChild(icon);
        
        const text = document.createElement('span');
        text.className = 'package-feature-text';
        text.textContent = feature;
        
        li.appendChild(iconContainer);
        li.appendChild(text);
        featuresList.appendChild(li);
      });
      
      content.appendChild(featuresList);
      
      // Action button
      const button = document.createElement('button');
      button.className = 'btn btn-primary package-card-action';
      button.textContent = this.selectedPackage === tier ? 'Selected' : 'Select Package';
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectPackage(tier);
      });
      
      content.appendChild(button);
      card.appendChild(content);
      
      // Click on card
      card.addEventListener('click', (e) => {
        // Don't select if clicking on button
        if (e.target.closest('button')) return;
        this.selectPackage(tier);
      });
      
      return card;
    };
    
    /**
     * Select a package
     * @param {string} tier Package tier identifier
     */
    block.selectPackage = function(tier) {
      try {
        this.selectedPackage = tier;
        this.render();
        
        const pkg = this.packages.find(p => p.tier === tier);
        window.dispatchEvent(new CustomEvent('package:select', {
          detail: { package: pkg }
        }));
      } catch (error) {
        console.error('Error selecting package:', error);
      }
    };
    
    /**
     * Show error message
     * @param {string} message Error message to display
     */
    block.showError = function(message) {
      const grid = block.querySelector(':scope > .package-comparison-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="package-comparison-error">
            <p>${message}</p>
          </div>
        `;
      }
    };
    
    return block;
    
  } catch (error) {
    console.error('Error decorating package-comparison block:', error);
    block.innerHTML = '<div class="package-comparison-error"><p>Failed to initialize package comparison</p></div>';
    return block;
  }
}
