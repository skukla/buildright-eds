/**
 * Build Configurator
 * Handles configuration of new builds from floor plan templates
 * Phase 6A - Sarah Martinez (Production Builder) workflow
 */

class BuildConfigurator {
  constructor() {
    // State
    this.template = null;
    this.packages = [];
    this.selectedVariants = new Set();
    this.selectedPackage = null;
    this.selectedPhases = new Set();
    
    // Form data
    this.buildInfo = {
      projectName: '',
      subdivision: '',
      lotNumber: '',
      deliveryAddress: ''
    };
    
    // Construction phases config
    this.phases = [
      { 
        id: 'foundation_framing', 
        name: 'Foundation & Framing', 
        icon: 'foundation',
        description: 'Structural materials and hardware'
      },
      { 
        id: 'envelope', 
        name: 'Building Envelope', 
        icon: 'envelope',
        description: 'Roofing, windows, doors, siding'
      },
      { 
        id: 'interior_finish', 
        name: 'Interior Finish', 
        icon: 'interior',
        description: 'Flooring, paint, fixtures'
      }
    ];
    
    // Subdivision addresses (mock data)
    this.subdivisionAddresses = {
      'desert-ridge': '1234 Desert Ridge Pkwy, Phoenix, AZ 85050',
      'sunset-valley': '5678 Sunset Valley Rd, Scottsdale, AZ 85260',
      'mountain-view': '9012 Mountain View Dr, Mesa, AZ 85201'
    };
  }
  
  async initialize() {
    // Get template ID from URL
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');
    
    if (!templateId) {
      this.showError('No template specified. Please select a template first.');
      return;
    }
    
    // Load template data
    await this.loadTemplateData(templateId);
    
    if (!this.template) {
      this.showError('Template not found. Please select a valid template.');
      return;
    }
    
    // Auto-increment project name
    this.autoIncrementProjectName();
    
    // Render all sections
    this.renderTemplateSummary();
    this.renderVariants();
    this.renderPackages();
    this.renderPhases();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial summary update
    this.updateOrderSummary();
  }
  
  async loadTemplateData(templateId) {
    try {
      const response = await fetch('/data/templates.json');
      const data = await response.json();
      
      this.packages = data.packages || [];
      this.template = data.templates.find(t => t.id === templateId);
      
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  }
  
  autoIncrementProjectName() {
    // Get last project number from localStorage
    const lastNum = parseInt(localStorage.getItem('buildright_last_project_num') || '46', 10);
    const nextNum = lastNum + 1;
    
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
      projectNameInput.value = `House #${nextNum}`;
      this.buildInfo.projectName = `House #${nextNum}`;
    }
  }
  
  // ============================================
  // RENDER METHODS
  // ============================================
  
  renderTemplateSummary() {
    const container = document.getElementById('template-summary');
    if (!container || !this.template) return;
    
    const { name, sqft, stories, bedrooms, bathrooms, finishedImage, bomSummary } = this.template;
    
    // Calculate base price from BOM summary
    const basePrice = Object.values(bomSummary).reduce((sum, phase) => sum + phase.estimatedCost, 0);
    
    container.innerHTML = `
      <div class="template-summary-image">
        <img src="${finishedImage}" alt="${name}" loading="lazy"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3E${name}%3C/text%3E%3C/svg%3E'">
      </div>
      <div class="template-summary-info">
        <h3 class="template-summary-name">${name}</h3>
        <p class="template-summary-specs">
          ${sqft.toLocaleString()} sq ft • ${stories} ${stories === 1 ? 'story' : 'stories'} • ${bedrooms}BR/${bathrooms}BA
        </p>
        <p class="template-summary-price">Base Materials: $${basePrice.toLocaleString()}</p>
      </div>
    `;
  }
  
  renderVariants() {
    const container = document.getElementById('variants-grid');
    if (!container || !this.template) return;
    
    // Filter out "Standard" variant (it's the base)
    const variants = this.template.variants.filter(v => v.name !== 'Standard');
    
    if (variants.length === 0) {
      container.innerHTML = `
        <p class="empty-message">No optional features available for this template.</p>
      `;
      return;
    }
    
    container.innerHTML = variants.map(variant => this.renderVariantTile(variant)).join('');
  }
  
  renderVariantTile(variant) {
    const { id, name, description, addedCost, sqft } = variant;
    
    // Use placeholder image based on variant type
    const imageUrl = this.getVariantImageUrl(name);
    
    return `
      <div class="selection-tile selection-tile-photo" 
           data-type="variant" 
           data-id="${id}"
           data-selected="false"
           data-cost="${addedCost}"
           style="background-image: url('${imageUrl}')"
           role="checkbox"
           aria-checked="false"
           tabindex="0"
           aria-label="${name}, adds ${sqft ? sqft + ' sq ft, ' : ''}$${addedCost.toLocaleString()}">
        <div class="tile-overlay">
          <h4 class="tile-title">${name}</h4>
          <p class="tile-description">${description}</p>
          <p class="tile-price">+$${addedCost.toLocaleString()}</p>
        </div>
      </div>
    `;
  }
  
  getVariantImageUrl(name) {
    // Map variant names to appropriate images
    const imageMap = {
      'Bonus Room': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      'Extended Garage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Covered Patio': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      'Home Office': 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
      'Courtyard Entry': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Bonus Loft': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      'Rooftop Deck': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      'Casita Addition': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      'Guest Casita': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      'Outdoor Living': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      'Resort Package': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      'Media Room': 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop'
    };
    
    return imageMap[name] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';
  }
  
  renderPackages() {
    const container = document.getElementById('packages-grid');
    if (!container) return;
    
    // Filter packages compatible with this template
    const compatiblePackages = this.packages.filter(pkg => 
      this.template.compatiblePackages.includes(pkg.id)
    );
    
    if (compatiblePackages.length === 0) {
      container.innerHTML = `
        <p class="empty-message">No packages available for this template.</p>
      `;
      return;
    }
    
    container.innerHTML = compatiblePackages.map(pkg => this.renderPackageTile(pkg)).join('');
  }
  
  renderPackageTile(pkg) {
    const { id, name, description, tier, addedCost, subdivisionSpecific } = pkg;
    
    // Use appropriate image based on tier
    const imageUrl = this.getPackageImageUrl(tier);
    
    // Check if this is the default (Builder's Choice)
    const isDefault = id === 'builders-choice';
    
    return `
      <div class="selection-tile selection-tile-photo" 
           data-type="package" 
           data-id="${id}"
           data-selected="${isDefault}"
           data-cost="${addedCost}"
           style="background-image: url('${imageUrl}')"
           role="radio"
           aria-checked="${isDefault}"
           tabindex="0"
           aria-label="${name}, ${subdivisionSpecific ? 'for ' + subdivisionSpecific + ', ' : ''}${addedCost > 0 ? '+$' + addedCost.toLocaleString() : 'Base Price'}">
        <div class="tile-overlay">
          <h4 class="tile-title">${name}</h4>
          <p class="tile-description">${description}${subdivisionSpecific ? ' (' + subdivisionSpecific + ')' : ''}</p>
          <p class="tile-price">${addedCost > 0 ? '+$' + addedCost.toLocaleString() : 'Base Price'}</p>
        </div>
      </div>
    `;
  }
  
  getPackageImageUrl(tier) {
    const imageMap = {
      'builder_grade': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      'premium': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      'luxury': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop'
    };
    
    return imageMap[tier] || imageMap['builder_grade'];
  }
  
  renderPhases() {
    const container = document.getElementById('phases-grid');
    if (!container || !this.template) return;
    
    container.innerHTML = this.phases.map(phase => this.renderPhaseTile(phase)).join('');
  }
  
  renderPhaseTile(phase) {
    const { id, name, icon } = phase;
    
    // Get estimated cost from template BOM summary
    const phaseData = this.template.bomSummary[id];
    const estimatedCost = phaseData?.estimatedCost || 0;
    
    // Get icon SVG
    const iconSvg = this.getPhaseIcon(icon);
    
    return `
      <div class="selection-tile selection-tile-icon" 
           data-type="phase" 
           data-id="${id}"
           data-selected="false"
           data-cost="${estimatedCost}"
           role="checkbox"
           aria-checked="false"
           tabindex="0"
           aria-label="${name}, estimated $${estimatedCost.toLocaleString()}">
        <div class="tile-icon">
          ${iconSvg}
        </div>
        <h4 class="tile-title">${name}</h4>
        <p class="tile-price">Est. $${estimatedCost.toLocaleString()}</p>
      </div>
    `;
  }
  
  getPhaseIcon(iconType) {
    const icons = {
      foundation: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="14" width="16" height="6" rx="1"/>
        <path d="M4 14V8l8-4 8 4v6"/>
        <path d="M12 4v10"/>
      </svg>`,
      envelope: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`,
      interior: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>`
    };
    
    return icons[iconType] || icons.foundation;
  }
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  setupEventListeners() {
    // Selection tiles (click and keyboard)
    document.querySelectorAll('.selection-tile').forEach(tile => {
      tile.addEventListener('click', () => this.handleTileClick(tile));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleTileClick(tile);
        }
      });
    });
    
    // Form inputs
    document.getElementById('project-name')?.addEventListener('input', (e) => {
      this.buildInfo.projectName = e.target.value;
    });
    
    document.getElementById('subdivision')?.addEventListener('change', (e) => {
      this.buildInfo.subdivision = e.target.value;
      this.updateDeliveryAddress();
      this.updatePackageAvailability();
    });
    
    document.getElementById('lot-number')?.addEventListener('input', (e) => {
      this.buildInfo.lotNumber = e.target.value;
      this.updateDeliveryAddress();
    });
    
    // Generate BOM button
    document.getElementById('generate-bom-btn')?.addEventListener('click', () => {
      this.generateBOM();
    });
    
    // Cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      window.location.href = '/pages/dashboard-templates.html';
    });
  }
  
  handleTileClick(tile) {
    const type = tile.dataset.type;
    const id = tile.dataset.id;
    
    if (type === 'variant') {
      this.toggleVariant(tile, id);
    } else if (type === 'package') {
      this.selectPackage(tile, id);
    } else if (type === 'phase') {
      this.togglePhase(tile, id);
    }
    
    this.updateOrderSummary();
    this.updateGenerateButton();
  }
  
  toggleVariant(tile, id) {
    const isSelected = tile.dataset.selected === 'true';
    
    if (isSelected) {
      this.selectedVariants.delete(id);
      tile.dataset.selected = 'false';
      tile.setAttribute('aria-checked', 'false');
    } else {
      this.selectedVariants.add(id);
      tile.dataset.selected = 'true';
      tile.setAttribute('aria-checked', 'true');
    }
  }
  
  selectPackage(tile, id) {
    // Deselect all packages
    document.querySelectorAll('[data-type="package"]').forEach(t => {
      t.dataset.selected = 'false';
      t.setAttribute('aria-checked', 'false');
    });
    
    // Select this package
    tile.dataset.selected = 'true';
    tile.setAttribute('aria-checked', 'true');
    this.selectedPackage = id;
  }
  
  togglePhase(tile, id) {
    const isSelected = tile.dataset.selected === 'true';
    
    if (isSelected) {
      this.selectedPhases.delete(id);
      tile.dataset.selected = 'false';
      tile.setAttribute('aria-checked', 'false');
    } else {
      this.selectedPhases.add(id);
      tile.dataset.selected = 'true';
      tile.setAttribute('aria-checked', 'true');
    }
  }
  
  updateDeliveryAddress() {
    const addressInput = document.getElementById('delivery-address');
    if (!addressInput) return;
    
    const subdivision = this.buildInfo.subdivision;
    const lotNumber = this.buildInfo.lotNumber;
    
    if (subdivision && this.subdivisionAddresses[subdivision]) {
      const baseAddress = this.subdivisionAddresses[subdivision];
      const lotSuffix = lotNumber ? `, Lot ${lotNumber}` : '';
      addressInput.value = baseAddress + lotSuffix;
      this.buildInfo.deliveryAddress = addressInput.value;
    } else {
      addressInput.value = '';
      this.buildInfo.deliveryAddress = '';
    }
  }
  
  updatePackageAvailability() {
    // TODO: Disable packages that aren't available for selected subdivision
    // For now, all packages remain available
  }
  
  // ============================================
  // ORDER SUMMARY
  // ============================================
  
  updateOrderSummary() {
    // Calculate base price
    const basePrice = Object.values(this.template.bomSummary).reduce(
      (sum, phase) => sum + phase.estimatedCost, 0
    );
    
    // Calculate variants cost
    const variantsCost = [...this.selectedVariants].reduce((sum, variantId) => {
      const variant = this.template.variants.find(v => v.id === variantId);
      return sum + (variant?.addedCost || 0);
    }, 0);
    
    // Calculate package cost
    const selectedPkg = this.packages.find(p => p.id === this.selectedPackage);
    const packageCost = selectedPkg?.addedCost || 0;
    const packageName = selectedPkg?.name || 'None selected';
    
    // Calculate total
    const total = basePrice + variantsCost + packageCost;
    
    // Update DOM
    document.getElementById('summary-base').textContent = `$${basePrice.toLocaleString()}`;
    
    document.getElementById('summary-package').textContent = 
      packageCost > 0 ? `+$${packageCost.toLocaleString()}` : 'Base Price';
    
    const variantsLine = document.getElementById('summary-variants-line');
    const variantsValue = document.getElementById('summary-variants');
    if (variantsCost > 0) {
      variantsLine.style.display = 'flex';
      variantsValue.textContent = `+$${variantsCost.toLocaleString()}`;
    } else {
      variantsLine.style.display = 'none';
    }
    
    document.getElementById('summary-total').textContent = `$${total.toLocaleString()}`;
  }
  
  updateGenerateButton() {
    const btn = document.getElementById('generate-bom-btn');
    if (!btn) return;
    
    // Enable if at least one phase is selected
    const isValid = this.selectedPhases.size > 0;
    btn.disabled = !isValid;
  }
  
  // ============================================
  // BOM GENERATION
  // ============================================
  
  async generateBOM() {
    // Validate
    if (this.selectedPhases.size === 0) {
      alert('Please select at least one construction phase.');
      return;
    }
    
    // Show loading overlay
    this.showLoading('Generating Bill of Materials...', 'This will take just a moment');
    
    try {
      // Prepare build configuration
      const buildConfig = {
        templateId: this.template.id,
        templateName: this.template.name,
        variants: [...this.selectedVariants],
        packageId: this.selectedPackage || 'builders-choice',
        phases: [...this.selectedPhases],
        buildInfo: { ...this.buildInfo }
      };
      
      // Save to localStorage for BOM review page
      const buildId = `build-${Date.now()}`;
      localStorage.setItem('buildright_current_build', JSON.stringify({
        id: buildId,
        ...buildConfig,
        createdAt: new Date().toISOString()
      }));
      
      // Update last project number
      const projectNum = parseInt(this.buildInfo.projectName.match(/\d+/)?.[0] || '47', 10);
      localStorage.setItem('buildright_last_project_num', projectNum.toString());
      
      // Simulate API call delay (replace with actual buildright-service call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to BOM review
      window.location.href = `/pages/bom-review.html?buildId=${buildId}`;
      
    } catch (error) {
      console.error('Error generating BOM:', error);
      this.hideLoading();
      alert('Failed to generate BOM. Please try again.');
    }
  }
  
  // ============================================
  // UTILITY METHODS
  // ============================================
  
  showLoading(title, subtitle) {
    const overlay = document.getElementById('loading-overlay');
    const titleEl = document.getElementById('loading-title');
    const subtitleEl = document.getElementById('loading-subtitle');
    
    if (overlay) {
      if (titleEl) titleEl.textContent = title;
      if (subtitleEl) subtitleEl.textContent = subtitle;
      overlay.dataset.visible = 'true';
      document.body.style.overflow = 'hidden';
    }
  }
  
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.dataset.visible = 'false';
      document.body.style.overflow = '';
    }
  }
  
  showError(message) {
    const container = document.querySelector('.configurator-main');
    if (container) {
      container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-negative-500)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2 style="margin-top: 1rem;">Error</h2>
          <p style="color: var(--color-text-secondary);">${message}</p>
          <a href="/pages/dashboard-templates.html" class="btn btn-primary" style="margin-top: 1rem;">
            Back to Templates
          </a>
        </div>
      `;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const configurator = new BuildConfigurator();
  configurator.initialize();
});

