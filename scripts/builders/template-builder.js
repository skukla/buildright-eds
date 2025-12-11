/**
 * Template Builder
 * Handles ordering materials for a specific template
 */

import { authService } from '../auth.js';
import { acoService } from '../aco-service.js';
import { formatCurrency } from '../utils.js';

export async function initialize(container) {
  const builder = new TemplateBuilder(container);
  await builder.initialize();
}

class TemplateBuilder {
  constructor(container) {
    this.container = container;
    this.template = null;
    this.selectedVariant = null;
    this.bom = [];
    this.currentPhase = 'variant_selection';
  }
  
  async initialize() {
    // Get template from URL
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    
    if (!templateId) {
      this.renderError('No template specified');
      return;
    }
    
    // Load template
    try {
      await this.loadTemplate(templateId);
      // Render
      this.render();
    } catch (error) {
      this.renderError('Template not found');
    }
  }
  
  async loadTemplate(templateId) {
    try {
      const response = await fetch('/data/templates.json');
      const data = await response.json();
      this.template = data.templates.find(t => t.id === templateId);
      
      if (!this.template) {
        throw new Error('Template not found');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }
  
  render() {
    switch (this.currentPhase) {
      case 'variant_selection':
        this.renderVariantSelection();
        break;
      case 'bom_generation':
        this.renderBOMGeneration();
        break;
      case 'bom_review':
        this.renderBOMReview();
        break;
      case 'cart':
        this.addToCart();
        break;
    }
  }
  
  renderVariantSelection() {
    this.container.innerHTML = `
      <div class="template-builder variant-selection">
        <header class="builder-header">
          <div class="builder-breadcrumb">
            <a href="/pages/dashboard.html">Templates</a>
            <span>/</span>
            <span>${this.template.name}</span>
          </div>
          <h1>${this.template.name}</h1>
          <p class="builder-subtitle">Select a variant to generate Bill of Materials</p>
        </header>
        
        <div class="builder-template-info">
          <div class="builder-template-images">
            <img src="${this.template.image}" alt="${this.template.name} floor plan" class="builder-floorplan">
            <img src="${this.template.finishedImage}" alt="${this.template.name} finished home" class="builder-finished">
          </div>
          <div class="builder-template-specs">
            <h3>Specifications</h3>
            <div class="spec-grid">
              <div class="spec-item">
                <span class="spec-label">Square Footage:</span>
                <span class="spec-value">${this.template.sqft.toLocaleString()} sq ft</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Stories:</span>
                <span class="spec-value">${this.template.stories}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Bedrooms:</span>
                <span class="spec-value">${this.template.bedrooms}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Bathrooms:</span>
                <span class="spec-value">${this.template.bathrooms}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Foundation:</span>
                <span class="spec-value">${this.template.foundation}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Exterior:</span>
                <span class="spec-value">${this.template.exteriorFinish}</span>
              </div>
            </div>
          </div>
        </div>
        
        <h2>Select Variant</h2>
        <div class="variant-grid">
          ${this.template.variants.map(variant => this.renderVariantCard(variant)).join('')}
        </div>
      </div>
    `;
    
    // Add event listeners
    this.container.querySelectorAll('[data-action="select-variant"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const variantId = e.target.dataset.variant;
        this.selectVariant(variantId);
      });
    });
  }
  
  renderVariantCard(variant) {
    const addedCostText = variant.addedCost > 0 
      ? `+$${variant.addedCost.toLocaleString()} added cost` 
      : 'Base price';
    
    const sqftDiff = variant.sqft - this.template.sqft;
    const sqftText = sqftDiff > 0 
      ? `${variant.sqft.toLocaleString()} sq ft (+${sqftDiff} sq ft)`
      : `${variant.sqft.toLocaleString()} sq ft`;
    
    return `
      <div class="variant-card">
        <div class="variant-header">
          <h3>${variant.name}</h3>
          ${variant.addedCost > 0 ? `<span class="variant-cost-badge">${addedCostText}</span>` : ''}
        </div>
        <p class="variant-sqft">${sqftText}</p>
        <p class="variant-description">${variant.description}</p>
        <button class="btn btn-primary" data-action="select-variant" data-variant="${variant.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Select Variant
        </button>
      </div>
    `;
  }
  
  async selectVariant(variantId) {
    this.selectedVariant = this.template.variants.find(v => v.id === variantId);
    this.currentPhase = 'bom_generation';
    this.render();
    
    // Generate BOM
    await this.generateBOM();
  }
  
  async generateBOM() {
    try {
      // Show loading
      const loadingEl = this.container.querySelector('.bom-loading');
      if (loadingEl) {
        loadingEl.textContent = 'Generating Bill of Materials...';
      }
      
      // Simulate BOM generation using mock ACO
      // In production, this would query ACO with template requirements
      
      // For each phase, get products
      const phases = ['foundation_framing', 'envelope', 'interior_finish'];
      this.bom = [];
      
      const user = authService.getCurrentUser();
      
      for (const phase of phases) {
        const phaseData = this.template.bomSummary[phase];
        
        // Fetch products for this phase
        const result = await acoService.getProducts({
          filters: { 
            // In real implementation, would filter by construction phase
          },
          policy: 'template_bom',
          userContext: await acoService.getUserContext(user.id),
          limit: 20 // Sample products for demo
        });
        
        this.bom.push({
          phase,
          phaseName: this.formatPhase(phase),
          products: result.products,
          estimatedCost: phaseData.estimatedCost,
          totalItems: phaseData.itemCount
        });
      }
      
      this.currentPhase = 'bom_review';
      this.render();
      
    } catch (error) {
      console.error('Error generating BOM:', error);
      this.renderError('Error generating Bill of Materials. Please try again.');
    }
  }
  
  renderBOMGeneration() {
    // Show loading state
    this.container.innerHTML = `
      <div class="template-builder bom-generation">
        <div class="bom-loading">
          <div class="loading-spinner"></div>
          <h2>Generating Bill of Materials</h2>
          <p>Please wait while we calculate materials for ${this.template.name} (${this.selectedVariant.name})</p>
          <div class="loading-phases">
            <div class="loading-phase">✓ Foundation & Framing</div>
            <div class="loading-phase">✓ Building Envelope</div>
            <div class="loading-phase">⏳ Interior Finish</div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderBOMReview() {
    const totalCost = this.bom.reduce((sum, phase) => sum + phase.estimatedCost, 0);
    const totalProducts = this.bom.reduce((sum, phase) => sum + phase.products.length, 0);
    
    this.container.innerHTML = `
      <div class="template-builder bom-review">
        <header class="builder-header">
          <div class="builder-breadcrumb">
            <a href="/pages/dashboard.html">Templates</a>
            <span>/</span>
            <a href="/pages/builder.html?type=template&template=${this.template.id}">${this.template.name}</a>
            <span>/</span>
            <span>Bill of Materials</span>
          </div>
          <h1>Bill of Materials</h1>
          <p class="builder-subtitle">${this.template.name} - ${this.selectedVariant.name}</p>
        </header>
        
        <div class="bom-summary">
          <div class="bom-summary-card">
            <span class="summary-label">Total Products</span>
            <span class="summary-value">${totalProducts} items</span>
            <span class="summary-note">(Showing ${totalProducts} sample items)</span>
          </div>
          <div class="bom-summary-card">
            <span class="summary-label">Estimated Cost</span>
            <span class="summary-value">$${totalCost.toLocaleString()}</span>
            <span class="summary-note">Materials only</span>
          </div>
          <div class="bom-summary-card">
            <span class="summary-label">Construction Phases</span>
            <span class="summary-value">${this.bom.length} phases</span>
            <span class="summary-note">Foundation to Finish</span>
          </div>
        </div>
        
        <div class="bom-phases">
          ${this.bom.map(phase => this.renderPhaseSection(phase)).join('')}
        </div>
        
        <div class="bom-actions">
          <button class="btn btn-secondary" data-action="back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Back to Variants
          </button>
          <button class="btn btn-primary btn-large" data-action="add-to-cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add All to Cart (${totalProducts} items)
          </button>
        </div>
      </div>
    `;
    
    // Event listeners
    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.currentPhase = 'variant_selection';
      this.render();
    });
    
    this.container.querySelector('[data-action="add-to-cart"]')?.addEventListener('click', () => {
      this.addToCart();
    });
  }
  
  renderPhaseSection(phaseData) {
    return `
      <div class="bom-phase">
        <div class="bom-phase-header">
          <h3>${phaseData.phaseName}</h3>
          <p class="phase-summary">
            ${phaseData.products.length} sample items · 
            Estimated: $${phaseData.estimatedCost.toLocaleString()} 
            (${phaseData.totalItems} total items in full BOM)
          </p>
        </div>
        <div class="phase-products">
          ${phaseData.products.slice(0, 10).map(product => `
            <div class="bom-product">
              <div class="bom-product-image">
                <img src="${product.images?.[0] || '/images/placeholder-product.png'}" 
                     alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2260%22 height=%2260%22/%3E%3C/svg%3E'">
              </div>
              <div class="bom-product-info">
                <span class="product-name">${product.name}</span>
                <span class="product-sku">${product.sku}</span>
              </div>
              <div class="bom-product-price">
                <span class="product-price">${this.formatPrice(product)}</span>
              </div>
            </div>
          `).join('')}
          ${phaseData.products.length > 10 ? `
            <p class="products-more">+ ${phaseData.products.length - 10} more sample items shown</p>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  formatPrice(product) {
    if (product.price) {
      return formatCurrency(product.price);
    }
    return 'Price on request';
  }
  
  async addToCart() {
    try {
      // Show loading
      const btn = this.container.querySelector('[data-action="add-to-cart"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
          Adding to cart...
        `;
      }
      
      // In production, this would integrate with cart-manager.js
      const allProducts = this.bom.flatMap(phase => phase.products);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      alert(`Success! Added ${allProducts.length} sample items to cart for ${this.template.name} (${this.selectedVariant.name})\n\nIn production, this would add all ${this.bom.reduce((sum, p) => sum + p.totalItems, 0)} items from the complete BOM.`);
      
      // Redirect to cart
      window.location.href = '/pages/cart.html';
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
      
      // Re-enable button
      const btn = this.container.querySelector('[data-action="add-to-cart"]');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Add All to Cart';
      }
    }
  }
  
  formatPhase(phase) {
    const names = {
      'foundation_framing': 'Foundation & Framing',
      'envelope': 'Building Envelope',
      'interior_finish': 'Interior Finish'
    };
    return names[phase] || phase;
  }
  
  renderError(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/pages/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
      </div>
    `;
  }
}

