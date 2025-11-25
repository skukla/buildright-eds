# Phase 6A: Sarah (Production Builder)

## Overview

**Duration**: 1-2 weeks  
**Dependencies**: Phase 4 (shared components), Phase 5 (page refactor)  
**Status**: Not Started

**Persona**: Sarah Martinez - Production Builder  
**Customer Group**: Commercial Tier 2  
**Use Case**: Template-based repeat ordering for production home building

---

## Objectives

1. Create template dashboard for Sarah
2. Generate floor plan data with fictitious templates
3. Source or create floor plan images
4. Source finished home images
5. Implement template selection and BOM ordering
6. Demonstrate repeat ordering efficiency

---

## Persona Profile

**Sarah Martinez**
- Role: Production Builder
- Company: Sunbelt Homes
- Build Volume: 50-75 homes per year
- Use Case: Orders materials repeatedly for same floor plans
- Pain Points: Need to quickly reorder for same template, track variants
- Goals: Fast ordering, consistent materials, track costs per template

---

## Task 1: Research & Visual Assets

### 1.1 Research Production Home Builders

**Reference Sites**:
- Builder Trend: https://buildertrend.com/
- CoConstruct: https://www.coconstruct.com/
- Production builder portfolios

**Research Goals**:
- How do builders organize floor plan templates?
- What information is most important?
- How do they visualize floor plans?
- What analytics do they track?

**Deliverable**: Research notes on production builder UX patterns

---

### 1.2 Create Fictitious Floor Plans

**Floor Plan Names** (Arizona-themed for Sunbelt Homes):

1. **The Sedona** - 2,450 sq ft, 2 story, 4BR/2.5BA
2. **The Prescott** - 1,875 sq ft, 1 story, 3BR/2BA
3. **The Flagstaff** - 3,120 sq ft, 2 story, 5BR/3BA
4. **The Tucson** - 2,680 sq ft, 1 story, 4BR/3BA
5. **The Phoenix** - 2,950 sq ft, 2 story, 4BR/2.5BA
6. **The Scottsdale** - 3,450 sq ft, 2 story, 5BR/3.5BA

**Variants for Each**:
- Standard
- Bonus Room option
- Extended garage option
- Covered patio option

**Deliverable**: Floor plan specifications document

---

### 1.3 Create Floor Plan Diagrams

**Options**:
1. Design custom floor plans (Figma, Illustrator)
2. Use floor plan software (RoomSketcher, Floorplanner)
3. Source royalty-free floor plans

**Requirements**:
- Simple, clear layout
- Show room labels
- Include dimensions
- Professional appearance
- Consistent visual style

**Format**: PNG or SVG, 800x600px minimum

**File Location**: `images/floor-plans/`
- `sedona.png`
- `prescott.png`
- `flagstaff.png`
- `tucson.png`
- `phoenix.png`
- `scottsdale.png`

**Deliverable**: 6 floor plan diagrams

---

### 1.4 Source Finished Home Images

**Requirements**:
- Modern residential homes
- Similar architectural style
- Professional photography
- Royalty-free or licensed

**Sources**:
- Unsplash (free)
- Pexels (free)
- Stock photo sites
- Builder websites (with permission)

**File Location**: `images/finished-homes/`
- `sedona.jpg`
- `prescott.jpg`
- `flagstaff.jpg`
- `tucson.jpg`
- `phoenix.jpg`
- `scottsdale.jpg`

**Deliverable**: 6 finished home photos

---

## Task 2: Template Data Generation

### 2.1 Create Templates Data File

**File**: `data/templates.json`

```json
{
  "templates": [
    {
      "id": "sedona",
      "name": "The Sedona",
      "description": "Popular two-story family home with open floor plan",
      "sqft": 2450,
      "stories": 2,
      "bedrooms": 4,
      "bathrooms": 2.5,
      "foundation": "Slab",
      "exteriorFinish": "Stucco",
      "roofType": "Tile",
      "image": "/images/floor-plans/sedona.png",
      "finishedImage": "/images/finished-homes/sedona.jpg",
      "variants": [
        {
          "id": "sedona-standard",
          "name": "Standard",
          "sqft": 2450,
          "addedCost": 0,
          "description": "Standard configuration"
        },
        {
          "id": "sedona-bonus",
          "name": "Bonus Room",
          "sqft": 2650,
          "addedCost": 15000,
          "description": "Adds 200 sq ft bonus room over garage"
        },
        {
          "id": "sedona-extended",
          "name": "Extended Garage",
          "sqft": 2450,
          "addedCost": 8000,
          "description": "Extends garage from 2-car to 3-car"
        }
      ],
      "bomSummary": {
        "foundation_framing": {
          "categories": ["structural_materials", "fasteners_hardware"],
          "estimatedCost": 45000,
          "itemCount": 180
        },
        "envelope": {
          "categories": ["roofing", "windows_doors", "siding"],
          "estimatedCost": 38000,
          "itemCount": 95
        },
        "interior_finish": {
          "categories": ["flooring", "paint", "fixtures"],
          "estimatedCost": 28000,
          "itemCount": 150
        }
      },
      "statistics": {
        "timesBuilt": 23,
        "lastOrdered": "2024-10-15",
        "averageCost": 111000,
        "averageDays": 120
      }
    },
    {
      "id": "prescott",
      "name": "The Prescott",
      "description": "Efficient single-story starter home",
      "sqft": 1875,
      "stories": 1,
      "bedrooms": 3,
      "bathrooms": 2,
      "foundation": "Slab",
      "exteriorFinish": "Stucco",
      "roofType": "Shingle",
      "image": "/images/floor-plans/prescott.png",
      "finishedImage": "/images/finished-homes/prescott.jpg",
      "variants": [
        {
          "id": "prescott-standard",
          "name": "Standard",
          "sqft": 1875,
          "addedCost": 0,
          "description": "Standard configuration"
        },
        {
          "id": "prescott-patio",
          "name": "Covered Patio",
          "sqft": 1875,
          "addedCost": 6000,
          "description": "Adds 300 sq ft covered patio"
        }
      ],
      "bomSummary": {
        "foundation_framing": {
          "categories": ["structural_materials", "fasteners_hardware"],
          "estimatedCost": 32000,
          "itemCount": 145
        },
        "envelope": {
          "categories": ["roofing", "windows_doors", "siding"],
          "estimatedCost": 28000,
          "itemCount": 72
        },
        "interior_finish": {
          "categories": ["flooring", "paint", "fixtures"],
          "estimatedCost": 21000,
          "itemCount": 110
        }
      },
      "statistics": {
        "timesBuilt": 41,
        "lastOrdered": "2024-11-02",
        "averageCost": 81000,
        "averageDays": 105
      }
    }
    // ... more templates
  ]
}
```

**Generation**: Can be generated from buildright-aco via `generate-eds-data.js` (Phase 1)

**Deliverable**: Complete templates.json with all 6 floor plans

---

## Task 3: Template Dashboard

### 3.1 Create Template Dashboard Module

**File**: `scripts/dashboards/template-dashboard.js`

```javascript
/**
 * Template Dashboard
 * Sarah's view for managing floor plan templates
 */

import { authService } from '../auth.js';
import { acoService } from '../aco-service.js';
import { createIcon } from '../icon-helper.js';

export async function initialize(container) {
  const dashboard = new TemplateDashboard(container);
  await dashboard.initialize();
}

class TemplateDashboard {
  constructor(container) {
    this.container = container;
    this.templates = [];
    this.selectedTemplate = null;
  }
  
  async initialize() {
    // Load templates
    await this.loadTemplates();
    
    // Render dashboard
    this.render();
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  async loadTemplates() {
    try {
      const response = await fetch('/data/templates.json');
      const data = await response.json();
      this.templates = data.templates;
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templates = [];
    }
  }
  
  render() {
    this.container.innerHTML = `
      <div class="template-dashboard">
        <header class="dashboard-header">
          <div class="dashboard-title">
            <h1>Floor Plan Templates</h1>
            <p class="subtitle">Select a template to order materials</p>
          </div>
          <div class="dashboard-actions">
            <button class="btn btn-secondary" id="view-analytics">
              <span class="icon-wrapper"></span>
              View Analytics
            </button>
          </div>
        </header>
        
        <div class="dashboard-filters">
          <div class="filter-group">
            <label>Sort by:</label>
            <select id="template-sort">
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name A-Z</option>
              <option value="sqft">Square Footage</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Filter:</label>
            <select id="template-filter">
              <option value="all">All Templates</option>
              <option value="1-story">Single Story</option>
              <option value="2-story">Two Story</option>
            </select>
          </div>
        </div>
        
        <div class="templates-grid">
          ${this.renderTemplates()}
        </div>
      </div>
    `;
    
    // Add analytics icon
    const analyticsBtn = this.container.querySelector('#view-analytics .icon-wrapper');
    const analyticsIcon = createIcon('dashboard', 'analytics', 'small');
    analyticsBtn.appendChild(analyticsIcon);
  }
  
  renderTemplates() {
    if (this.templates.length === 0) {
      return '<div class="empty-state">No templates found</div>';
    }
    
    return this.templates.map(template => this.renderTemplateCard(template)).join('');
  }
  
  renderTemplateCard(template) {
    const { id, name, sqft, stories, bedrooms, bathrooms, image, finishedImage, variants, statistics } = template;
    
    return `
      <div class="template-card" data-template-id="${id}">
        <div class="template-card-images">
          <div class="template-card-image template-card-floorplan">
            <img src="${image}" alt="${name} floor plan" loading="lazy">
            <div class="template-card-badge">
              <span class="icon-wrapper"></span>
              ${variants.length} Variants
            </div>
          </div>
          <div class="template-card-image template-card-finished">
            <img src="${finishedImage}" alt="${name} finished home" loading="lazy">
          </div>
        </div>
        
        <div class="template-card-content">
          <h3 class="template-card-title">${name}</h3>
          
          <div class="template-card-specs">
            <div class="template-spec">
              <span class="icon-wrapper spec-icon"></span>
              <span>${sqft.toLocaleString()} sq ft</span>
            </div>
            <div class="template-spec">
              <span class="icon-wrapper spec-icon"></span>
              <span>${stories} ${stories === 1 ? 'Story' : 'Stories'}</span>
            </div>
            <div class="template-spec">
              <span class="icon-wrapper spec-icon"></span>
              <span>${bedrooms} BR / ${bathrooms} BA</span>
            </div>
          </div>
          
          <div class="template-card-stats">
            <div class="template-stat">
              <span class="stat-label">Times Built:</span>
              <span class="stat-value">${statistics.timesBuilt}</span>
            </div>
            <div class="template-stat">
              <span class="stat-label">Avg Cost:</span>
              <span class="stat-value">$${statistics.averageCost.toLocaleString()}</span>
            </div>
            <div class="template-stat">
              <span class="stat-label">Last Ordered:</span>
              <span class="stat-value">${this.formatDate(statistics.lastOrdered)}</span>
            </div>
          </div>
          
          <div class="template-card-actions">
            <button class="btn btn-secondary" data-action="view" data-template="${id}">
              View Details
            </button>
            <button class="btn btn-primary" data-action="order" data-template="${id}">
              <span class="icon-wrapper"></span>
              Order Materials
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Template card clicks
    this.container.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-action="view"]');
      const orderBtn = e.target.closest('[data-action="order"]');
      const card = e.target.closest('.template-card');
      
      if (viewBtn) {
        const templateId = viewBtn.dataset.template;
        this.viewTemplateDetails(templateId);
      } else if (orderBtn) {
        const templateId = orderBtn.dataset.template;
        this.orderTemplate(templateId);
      } else if (card && !viewBtn && !orderBtn) {
        const templateId = card.dataset.templateId;
        this.selectTemplate(templateId);
      }
    });
    
    // Sort change
    const sortSelect = this.container.querySelector('#template-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortTemplates(e.target.value);
      });
    }
    
    // Filter change
    const filterSelect = this.container.querySelector('#template-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterTemplates(e.target.value);
      });
    }
    
    // Analytics button
    const analyticsBtn = this.container.querySelector('#view-analytics');
    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', () => {
        this.viewAnalytics();
      });
    }
  }
  
  selectTemplate(templateId) {
    this.selectedTemplate = this.templates.find(t => t.id === templateId);
    console.log('Selected template:', this.selectedTemplate);
  }
  
  viewTemplateDetails(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Show modal or navigate to details page
    this.showTemplateModal(template);
  }
  
  async orderTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Show variant selection modal
    this.showVariantSelectionModal(template);
  }
  
  showTemplateModal(template) {
    // Create modal with full template details
    // Including:
    // - Large floor plan image
    // - Finished home image
    // - Full specifications
    // - BOM breakdown by phase
    // - Historical statistics
    // - Variant comparison
  }
  
  showVariantSelectionModal(template) {
    // Create modal for selecting variant
    // Then proceed to BOM generation
    // Route to order page with template context
    
    // For now, navigate directly
    window.location.href = `/pages/builder.html?type=template&template=${template.id}`;
  }
  
  sortTemplates(sortBy) {
    // Sort templates array
    // Re-render
  }
  
  filterTemplates(filterBy) {
    // Filter templates array
    // Re-render
  }
  
  viewAnalytics() {
    // Navigate to analytics view or show analytics modal
    console.log('View analytics');
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
```

**Deliverable**: Template dashboard module

---

### 3.2 Template Dashboard Styles

**File**: `styles/dashboards/template-dashboard.css` (create)

```css
/* Template Dashboard */
.template-dashboard {
  padding: var(--spacing-large);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-large);
}

.dashboard-title h1 {
  font-size: var(--type-heading-1-font-size);
  font-weight: var(--type-heading-1-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-small);
}

.dashboard-title .subtitle {
  font-size: var(--type-body-1-font-size);
  color: var(--color-neutral-600);
  margin: 0;
}

.dashboard-filters {
  display: flex;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
  padding: var(--spacing-medium);
  background: var(--color-neutral-50);
  border-radius: var(--shape-border-radius-3);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.filter-group label {
  font-size: var(--type-body-2-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-neutral-700);
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-large);
}

.template-card {
  background: white;
  border-radius: var(--shape-border-radius-3);
  box-shadow: var(--shape-shadow-2);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shape-shadow-3);
}

.template-card-images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--color-neutral-200);
}

.template-card-image {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 aspect ratio */
  background: var(--color-neutral-100);
  overflow: hidden;
}

.template-card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-card-badge {
  position: absolute;
  top: var(--spacing-small);
  right: var(--spacing-small);
  background: var(--color-brand-500);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--shape-border-radius-2);
  font-size: var(--type-body-2-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.template-card-content {
  padding: var(--spacing-medium);
}

.template-card-title {
  font-size: var(--type-heading-4-font-size);
  font-weight: var(--type-heading-4-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-medium);
}

.template-card-specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-medium);
  border-bottom: 1px solid var(--color-neutral-200);
}

.template-spec {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-700);
}

.template-card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
}

.template-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-brand-600);
}

.template-card-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-small);
}

/* Responsive */
@media (max-width: 1024px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-medium);
  }
  
  .dashboard-filters {
    flex-direction: column;
  }
  
  .template-card-actions {
    grid-template-columns: 1fr;
  }
}
```

**Import in main stylesheet**:
```css
/* In styles/styles.css */
@import 'dashboards/template-dashboard.css';
```

**Deliverable**: Template dashboard styles

---

## Task 4: Template Order Flow

### 4.1 Create Template Builder Module

**File**: `scripts/builders/template-builder.js`

```javascript
/**
 * Template Builder
 * Handles ordering materials for a specific template
 */

import { authService } from '../auth.js';
import { acoService } from '../aco-service.js';
import { showLoading, hideLoading } from '../../blocks/loading-overlay/loading-overlay.js';

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
    await this.loadTemplate(templateId);
    
    // Render
    this.render();
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
          <h1>${this.template.name}</h1>
          <p>Select a variant to generate Bill of Materials</p>
        </header>
        
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
    
    return `
      <div class="variant-card">
        <h3>${variant.name}</h3>
        <p class="variant-sqft">${variant.sqft.toLocaleString()} sq ft</p>
        <p class="variant-description">${variant.description}</p>
        <p class="variant-cost">${addedCostText}</p>
        <button class="btn btn-primary" data-action="select-variant" data-variant="${variant.id}">
          Select Variant
        </button>
      </div>
    `;
  }
  
  async selectVariant(variantId) {
    this.selectedVariant = this.template.variants.find(v => v.id === variantId);
    this.currentPhase = 'bom_generation';
    
    // Generate BOM
    await this.generateBOM();
  }
  
  async generateBOM() {
    showLoading('Generating Bill of Materials...', 'Calculating materials for ' + this.template.name);
    
    try {
      // Simulate BOM generation using mock ACO
      // In production, this would query ACO with template requirements
      
      // For each phase, get products
      const phases = ['foundation_framing', 'envelope', 'interior_finish'];
      this.bom = [];
      
      for (const phase of phases) {
        const phaseData = this.template.bomSummary[phase];
        
        const result = await acoService.getProducts({
          filters: { construction_phase: phase },
          policy: `phase_${phase}`,
          userContext: await acoService.getUserContext(authService.getCurrentUser().id),
          limit: phaseData.itemCount
        });
        
        this.bom.push({
          phase,
          products: result.products.slice(0, 20), // Limit for demo
          estimatedCost: phaseData.estimatedCost
        });
      }
      
      this.currentPhase = 'bom_review';
      this.render();
      
    } catch (error) {
      console.error('Error generating BOM:', error);
      alert('Error generating BOM. Please try again.');
    } finally {
      hideLoading();
    }
  }
  
  renderBOMGeneration() {
    // Show loading state
    this.container.innerHTML = `
      <div class="template-builder bom-generation">
        <div class="loading-state">
          <h2>Generating Bill of Materials</h2>
          <p>Please wait while we calculate materials for ${this.template.name} (${this.selectedVariant.name})</p>
        </div>
      </div>
    `;
  }
  
  renderBOMReview() {
    this.container.innerHTML = `
      <div class="template-builder bom-review">
        <header class="builder-header">
          <h1>Bill of Materials</h1>
          <p>${this.template.name} - ${this.selectedVariant.name}</p>
        </header>
        
        <div class="bom-phases">
          ${this.bom.map(phase => this.renderPhaseSection(phase)).join('')}
        </div>
        
        <div class="bom-actions">
          <button class="btn btn-secondary" data-action="back">
            Back to Variants
          </button>
          <button class="btn btn-primary" data-action="add-to-cart">
            Add All to Cart
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
        <h3>${this.formatPhase(phaseData.phase)}</h3>
        <p class="phase-summary">
          ${phaseData.products.length} items · 
          Estimated: $${phaseData.estimatedCost.toLocaleString()}
        </p>
        <div class="phase-products">
          ${phaseData.products.slice(0, 5).map(product => `
            <div class="bom-product">
              <span class="product-name">${product.name}</span>
              <span class="product-sku">${product.sku}</span>
            </div>
          `).join('')}
          ${phaseData.products.length > 5 ? `
            <p class="products-more">+ ${phaseData.products.length - 5} more items</p>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  async addToCart() {
    showLoading('Adding to cart...', 'Adding all template materials');
    
    try {
      // Add all products to cart
      // This would integrate with cart-manager.js
      
      const allProducts = this.bom.flatMap(phase => phase.products);
      
      // For demo, just show success and redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Added ${allProducts.length} items to cart for ${this.template.name}`);
      window.location.href = '/pages/cart.html';
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    } finally {
      hideLoading();
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
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/pages/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
      </div>
    `;
  }
}
```

**Deliverable**: Template builder module

---

## Success Criteria

✅ Template dashboard displays 6 floor plans  
✅ Floor plan images created and displayed  
✅ Finished home images displayed  
✅ Template statistics shown (times built, avg cost, last ordered)  
✅ Variant selection works  
✅ BOM generation integrates with mock ACO  
✅ BOM organized by construction phase  
✅ Add to cart functionality works  
✅ Professional, data-driven UI  
✅ Custom icons used throughout

---

## Testing/Validation

### Functional Testing
- [ ] Login as Sarah
- [ ] Dashboard displays all templates
- [ ] Template cards show correct information
- [ ] Floor plan and finished home images load
- [ ] Click template to view details
- [ ] Select "Order Materials"
- [ ] Choose variant
- [ ] BOM generates correctly
- [ ] Products organized by phase
- [ ] Add to cart works

### Visual Testing
- [ ] Floor plans are clear and readable
- [ ] Finished home images are professional
- [ ] Layout is clean and organized
- [ ] Custom icons display correctly
- [ ] Responsive design works

### Data Testing
- [ ] All 6 templates have complete data
- [ ] BOM calculations are reasonable
- [ ] Pricing reflects Commercial Tier 2
- [ ] Statistics are realistic

---

## Deliverables Checklist

### Data Files
- [ ] `data/templates.json` (6 complete templates)

### Image Assets
- [ ] `images/floor-plans/` (6 floor plan diagrams)
- [ ] `images/finished-homes/` (6 home photos)

### Code Files
- [ ] `scripts/dashboards/template-dashboard.js`
- [ ] `scripts/builders/template-builder.js`

### Styles
- [ ] `styles/dashboards/template-dashboard.css`

### Documentation
- [ ] Floor plan specifications document
- [ ] Image sourcing documentation

---

## Next Steps

Upon completion of Phase 6A:
1. Test Sarah's complete flow end-to-end
2. Gather feedback on UX
3. Move to Phase 6B (Marcus)

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `BUILDRIGHT-PERSONAS-AND-FLOWS.md` - Sarah's user journey
- `PHASE-4-SHARED-COMPONENTS.md` - Shared blocks used

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

