/**
 * Build Configurator
 * Handles configuration of new builds from floor plan templates
 * Phase 6A - Sarah Martinez (Regional Production Builder) workflow
 */

import { catalogService } from './services/catalog-service.js';
import { authService } from './auth.js';

class BuildConfigurator {
  constructor() {
    // State
    this.template = null;
    this.packages = [];
    this.selectedVariants = new Set();
    this.selectedPackage = null;
    this.selectedPhases = new Set();
    this.editingBundleId = null; // Track if editing existing BOM
    this.isSubmitting = false; // Prevent double-submit
    this.hasUnsavedChanges = false; // Track for navigation guard
    
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
    this.renderPackages();
    this.renderVariants();
    this.renderPhases();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Restore previous selections if editing
    this.restorePreviousSelections();
    
    // Initial summary update
    this.updateOrderSummary();
    
    // Listen for cart updates to detect if edited bundle is removed
    this.setupCartListener();
  }
  
  setupCartListener() {
    window.addEventListener('cartUpdated', async () => {
      if (this.editingBundleId) {
        // Check if the bundle we're editing still exists
        const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
        const bundleExists = cart.some(item => item.bundleId === this.editingBundleId);
        
        if (!bundleExists) {
          // Bundle was removed - switch to "create new" mode
          this.editingBundleId = null;
          
          // Update button text
          const btn = document.getElementById('generate-bom-btn');
          if (btn) {
            btn.textContent = 'Generate BOM';
          }
          
          // Update localStorage to clear editingBundleId
          const storedBuild = JSON.parse(localStorage.getItem('buildright_current_build') || '{}');
          delete storedBuild.editingBundleId;
          localStorage.setItem('buildright_current_build', JSON.stringify(storedBuild));
          
          // Show info notification
          const { showInfoNotification } = await import('./cart-notification.js');
          showInfoNotification('The BOM you were editing was removed from your cart. Your changes will be added as a new item.');
        }
      }
    });
  }
  
  restorePreviousSelections() {
    // Check if we're editing an existing build
    const storedBuild = localStorage.getItem('buildright_current_build');
    if (!storedBuild) return;
    
    try {
      const buildData = JSON.parse(storedBuild);
      
      // Only restore if it's the same template
      if (buildData.templateId !== this.template.id) return;
      
      // Check if we're editing an existing BOM bundle
      this.editingBundleId = buildData.editingBundleId || null;
      
      // Only restore selections if we're editing an existing BOM
      // For fresh builds, start with clean defaults
      if (!this.editingBundleId) {
        // Clear stored build data for fresh start
        localStorage.removeItem('buildright_current_build');
        return;
      }
      
      // Restore package selection
      if (buildData.packageId) {
        const packageTile = document.querySelector(`[data-type="package"][data-id="${buildData.packageId}"]`);
        if (packageTile) {
          // Deselect all packages first
          document.querySelectorAll('[data-type="package"]').forEach(t => {
            t.dataset.selected = 'false';
            t.setAttribute('aria-checked', 'false');
          });
          // Select the saved package
          packageTile.dataset.selected = 'true';
          packageTile.setAttribute('aria-checked', 'true');
          this.selectedPackage = buildData.packageId;
        }
      }
      
      // Restore variant selections
      if (buildData.variants && buildData.variants.length > 0) {
        buildData.variants.forEach(variantId => {
          const variantTile = document.querySelector(`[data-type="variant"][data-id="${variantId}"]`);
          if (variantTile) {
            variantTile.dataset.selected = 'true';
            variantTile.setAttribute('aria-checked', 'true');
            this.selectedVariants.add(variantId);
          }
        });
      }
      
      // Restore phase selections
      if (buildData.phases && buildData.phases.length > 0) {
        // Deselect all phases first
        document.querySelectorAll('[data-type="phase"]').forEach(t => {
          t.dataset.selected = 'false';
          t.setAttribute('aria-checked', 'false');
        });
        this.selectedPhases.clear();
        
        buildData.phases.forEach(phaseId => {
          const phaseTile = document.querySelector(`[data-type="phase"][data-id="${phaseId}"]`);
          if (phaseTile) {
            phaseTile.dataset.selected = 'true';
            phaseTile.setAttribute('aria-checked', 'true');
            this.selectedPhases.add(phaseId);
          }
        });
      }
      
      // Update UI after restoring
      this.updateOrderSummary();
      this.updateGenerateButton();
      
    } catch (error) {
      console.error('Error restoring previous selections:', error);
    }
  }
  
  async loadTemplateData(templateId) {
    try {
      // Load templates, packages, variant images, and phases from single data file
      const basePath = window.BASE_PATH || '/';
      const response = await fetch(`${basePath}data/templates.json`);
      const data = await response.json();
      
      this.packages = data.packages || [];
      this.template = data.templates.find(t => t.id === templateId);
      
      // Load variant images from same data file
      this.variantImages = data.variantImages || {};
      
      // Merge phase data (images and descriptions) from same data file
      if (data.phases) {
        this.phases = this.phases.map(phase => {
          const phaseData = data.phases.find(p => p.id === phase.id);
          return {
            ...phase,
            image: phaseData?.image || null,
            description: phaseData?.description || phase.description
          };
        });
      }
      
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
             onerror="this.parentElement.classList.add('template-summary-image-placeholder', 'image-placeholder-pattern'); this.style.display='none';">
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
    
    // Get image data
    const imageData = this.getVariantImageUrl(name);
    const imageUrl = imageData.url;
    
    return `
      <div class="card-tile card-tile--selection" 
           data-type="variant" 
           data-id="${id}"
           data-selected="false"
           data-cost="${addedCost}"
           role="checkbox"
           aria-checked="false"
           tabindex="0"
           aria-label="${name}, adds ${sqft ? sqft + ' sq ft, ' : ''}$${addedCost.toLocaleString()}">
        <img src="${imageUrl}" alt="${name}" class="card-tile__image">
        <div class="card-tile__content">
          <h4 class="card-tile__title">${name}</h4>
          <p class="card-tile__description">${description}</p>
          <p class="card-tile__price">+$${addedCost.toLocaleString()}</p>
        </div>
      </div>
    `;
  }
  
  getVariantImageUrl(name) {
    // Get variant image from loaded data (data/templates.json -> variantImages)
    const variantData = this.variantImages?.[name];
    
    if (variantData?.url) {
      return { url: variantData.url };
    }
    
    // Fallback to default house image
    return { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' };
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
    
    // Set default selection (Builder's Choice is pre-selected)
    if (!this.selectedPackage) {
      this.selectedPackage = 'builders-choice';
    }
  }
  
  renderPackageTile(pkg) {
    const { id, name, description, tier, addedCost, image } = pkg;
    
    // Use Card Stack tiles for Material Packages (image above, text below)
    // Pre-select Builder's Choice as the default (required field)
    const isDefault = id === 'builders-choice';
    const imageUrl = image || this.getDefaultPackageImage(tier);
    
    return `
      <div class="card-tile card-tile--selection" 
           data-type="package" 
           data-id="${id}"
           data-selected="${isDefault}"
           data-cost="${addedCost}"
           role="radio"
           aria-checked="${isDefault}"
           tabindex="0"
           aria-label="${name}, ${addedCost > 0 ? '+$' + addedCost.toLocaleString() : 'Base Price'}">
        <img src="${imageUrl}" alt="${name}" class="card-tile__image">
        <div class="card-tile__content">
          <h4 class="card-tile__title">${name}</h4>
          <p class="card-tile__description">${description}</p>
          <p class="card-tile__price">${addedCost > 0 ? '+$' + addedCost.toLocaleString() : 'Base Price'}</p>
        </div>
      </div>
    `;
  }
  
  getDefaultPackageImage(tier) {
    // Find package by tier and return its image
    // Package images are already defined in data/templates.json
    const packageWithTier = this.packages.find(p => p.tier === tier);
    if (packageWithTier?.image) {
      return packageWithTier.image;
    }
    
    // Fallback
    return 'https://images.unsplash.com/photo-1723257129172-6315cde654da?w=400&h=300&fit=crop&q=80';
  }
  
  getPhaseImageUrl(name) {
    // Get phase image from loaded data (data/templates.json -> phases)
    const phase = this.phases.find(p => p.name === name);
    if (phase?.image) {
      return phase.image;
    }
    
    // Fallback to construction image
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop';
  }
  
  renderPhases() {
    const container = document.getElementById('phases-grid');
    if (!container || !this.template) return;
    
    container.innerHTML = this.phases.map(phase => this.renderPhaseTile(phase)).join('');
  }
  
  renderPhaseTile(phase) {
    const { id, name, description } = phase;
    
    // Get estimated cost from template BOM summary
    const phaseData = this.template.bomSummary[id];
    const estimatedCost = phaseData?.estimatedCost || 0;
    
    // Use appropriate image based on phase
    const imageUrl = this.getPhaseImageUrl(name);
    
    return `
      <div class="card-tile card-tile--selection" 
           data-type="phase" 
           data-id="${id}"
           data-selected="false"
           data-cost="${estimatedCost}"
           role="checkbox"
           aria-checked="false"
           tabindex="0"
           aria-label="${name}, estimated $${estimatedCost.toLocaleString()}">
        <img src="${imageUrl}" alt="${name}" class="card-tile__image">
        <div class="card-tile__content">
          <h4 class="card-tile__title">${name}</h4>
          <p class="card-tile__description">${description}</p>
          <p class="card-tile__price">Est. $${estimatedCost.toLocaleString()}</p>
        </div>
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
    // Selection tiles (click and keyboard) - includes both .selection-tile and .card-tile--selection
    document.querySelectorAll('.selection-tile, .card-tile--selection').forEach(tile => {
      tile.addEventListener('click', () => {
        this.handleTileClick(tile);
        this.hasUnsavedChanges = true;
      });
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleTileClick(tile);
          this.hasUnsavedChanges = true;
        }
      });
    });
    
    // Form inputs
    document.getElementById('project-name')?.addEventListener('input', (e) => {
      this.buildInfo.projectName = e.target.value;
      this.hasUnsavedChanges = true;
    });
    
    document.getElementById('subdivision')?.addEventListener('change', (e) => {
      this.buildInfo.subdivision = e.target.value;
      this.updateDeliveryAddress();
      this.updatePackageAvailability();
      this.hasUnsavedChanges = true;
    });
    
    document.getElementById('lot-number')?.addEventListener('input', (e) => {
      this.buildInfo.lotNumber = e.target.value;
      this.updateDeliveryAddress();
      this.hasUnsavedChanges = true;
    });
    
    // Generate BOM button
    document.getElementById('generate-bom-btn')?.addEventListener('click', () => {
      this.generateBOM();
    });
    
    // Cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      // Clear unsaved changes flag before navigating
      this.hasUnsavedChanges = false;
      const basePath = window.BASE_PATH || '/';
      window.location.href = `${basePath}pages/dashboard-templates.html`;
    });
    
    // Navigation guard - warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges && !this.isSubmitting) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
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
      variantsLine.classList.remove('summary-line--hidden');
      variantsValue.textContent = `+$${variantsCost.toLocaleString()}`;
    } else {
      variantsLine.classList.add('summary-line--hidden');
    }
    
    document.getElementById('summary-total').textContent = `$${total.toLocaleString()}`;
  }
  
  updateGenerateButton() {
    const btn = document.getElementById('generate-bom-btn');
    if (!btn) return;
    
    // Enable if at least one phase is selected (package is optional, defaults to Builder's Choice)
    const isValid = this.selectedPhases.size > 0;
    btn.disabled = !isValid;
    
    // Update button text based on state
    if (this.isSubmitting) {
      btn.textContent = 'Processing...';
    } else if (this.editingBundleId) {
      btn.textContent = 'Review Changes';
    } else {
      btn.textContent = 'Generate BOM';
    }
  }
  
  // ============================================
  // BOM GENERATION
  // ============================================
  
  async generateBOM() {
    // Button should be disabled if no phases selected, but double-check
    if (this.selectedPhases.size === 0) return;
    
    // Prevent double-submit
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.updateGenerateButton();
    
    // Show loading overlay
    const loadingTitle = this.editingBundleId ? 'Updating Bill of Materials...' : 'Generating Bill of Materials...';
    this.showLoading(loadingTitle, 'This will take just a moment');
    
    try {
      // Initialize catalog service if needed
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      const personaId = currentUser?.persona?.id || 'sarah';
      
      if (!catalogService.initialized) {
        await catalogService.initialize(personaId);
      }
      
      // Prepare build configuration
      const buildConfig = {
        templateId: this.template.id,
        templateName: this.template.name,
        variants: [...this.selectedVariants],
        packageId: this.selectedPackage || 'builders-choice',
        phases: [...this.selectedPhases],
        buildInfo: { ...this.buildInfo }
      };
      
      // Generate BOM via catalog service
      let bomResult = null;
      try {
        bomResult = await catalogService.generateBOM({
          templateId: buildConfig.templateId,
          variantId: buildConfig.variants[0] || null,
          packageId: buildConfig.packageId,
          selectedPhases: buildConfig.phases
        });
        console.log('[Build Configurator] BOM generated:', bomResult?.lineItems?.length || 0, 'items');
      } catch (error) {
        console.warn('[Build Configurator] BOM generation failed, BOM Review will handle fallback:', error.message);
      }
      
      // Save to localStorage for BOM review page
      const buildId = `build-${Date.now()}`;
      const buildData = {
        id: buildId,
        ...buildConfig,
        createdAt: new Date().toISOString(),
        // Include pre-generated BOM data if available
        bomResult: bomResult || null
      };
      
      // Preserve editingBundleId if editing existing BOM
      if (this.editingBundleId) {
        buildData.editingBundleId = this.editingBundleId;
      }
      
      localStorage.setItem('buildright_current_build', JSON.stringify(buildData));
      
      // Update last project number
      const projectNum = parseInt(this.buildInfo.projectName.match(/\d+/)?.[0] || '47', 10);
      localStorage.setItem('buildright_last_project_num', projectNum.toString());
      
      // Clear unsaved changes flag before navigating
      this.hasUnsavedChanges = false;
      
      // Navigate to BOM review with pre-generated data
      const bomPath = window.BASE_PATH || '/';
      window.location.href = `${bomPath}pages/bom-review.html?buildId=${buildId}`;
      
    } catch (error) {
      console.error('Error generating BOM:', error);
      this.hideLoading();
      this.isSubmitting = false;
      this.updateGenerateButton();
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
    // Replace the entire layout with error state (hides sidebar too)
    const container = document.querySelector('.configurator-layout');
    if (container) {
      container.innerHTML = `
        <div class="state-container error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2>Error</h2>
          <p>${message}</p>
          <a href="/pages/dashboard-templates.html" class="btn btn-primary">
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

