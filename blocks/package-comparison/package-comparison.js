/**
 * Package Comparison Block
 * Compare Good/Better/Best packages (for Lisa)
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default function decorate(block) {
  // Create structure if not present
  if (!block.querySelector('.package-comparison-header')) {
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
  
  block.setPackages = function(packages) {
    this.packages = packages;
    this.render();
  };
  
  block.render = function() {
    const grid = block.querySelector('.package-comparison-grid');
    grid.innerHTML = '';
    
    this.packages.forEach((pkg) => {
      const card = this.createPackageCard(pkg);
      grid.appendChild(card);
    });
  };
  
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
      badge.textContent = 'Most Popular';
      card.appendChild(badge);
    }
    
    // Image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'package-card-image';
    const img = document.createElement('img');
    img.src = image || '/images/packages/placeholder.jpg';
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
      const icon = createIcon('check-circle', 'small');
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
    card.addEventListener('click', () => {
      this.selectPackage(tier);
    });
    
    return card;
  };
  
  block.selectPackage = function(tier) {
    this.selectedPackage = tier;
    this.render();
    
    const pkg = this.packages.find(p => p.tier === tier);
    window.dispatchEvent(new CustomEvent('package:select', {
      detail: { package: pkg }
    }));
  };
  
  return block;
}

