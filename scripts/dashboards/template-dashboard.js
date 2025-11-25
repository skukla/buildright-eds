/**
 * Template Dashboard
 * Sarah's view for managing floor plan templates
 */

import { authService } from '../auth.js';
import { acoService } from '../aco-service.js';

export async function initialize(container) {
  const dashboard = new TemplateDashboard(container);
  await dashboard.initialize();
}

class TemplateDashboard {
  constructor(container) {
    this.container = container;
    this.templates = [];
    this.selectedTemplate = null;
    this.sortBy = 'recent';
    this.filterBy = 'all';
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
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
  }
  
  renderTemplates() {
    if (this.templates.length === 0) {
      return `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <h3>No templates found</h3>
          <p>Check back later for available floor plans</p>
        </div>
      `;
    }
    
    const filteredTemplates = this.getFilteredTemplates();
    const sortedTemplates = this.getSortedTemplates(filteredTemplates);
    
    return sortedTemplates.map(template => this.renderTemplateCard(template)).join('');
  }
  
  getFilteredTemplates() {
    if (this.filterBy === 'all') return this.templates;
    
    if (this.filterBy === '1-story') {
      return this.templates.filter(t => t.stories === 1);
    }
    
    if (this.filterBy === '2-story') {
      return this.templates.filter(t => t.stories === 2);
    }
    
    return this.templates;
  }
  
  getSortedTemplates(templates) {
    const sorted = [...templates];
    
    switch (this.sortBy) {
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.statistics.lastOrdered) - new Date(a.statistics.lastOrdered)
        );
      case 'popular':
        return sorted.sort((a, b) => 
          b.statistics.timesBuilt - a.statistics.timesBuilt
        );
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'sqft':
        return sorted.sort((a, b) => a.sqft - b.sqft);
      default:
        return sorted;
    }
  }
  
  renderTemplateCard(template) {
    const { id, name, sqft, stories, bedrooms, bathrooms, image, finishedImage, variants, statistics } = template;
    
    return `
      <div class="template-card" data-template-id="${id}">
        <div class="template-card-images">
          <div class="template-card-image template-card-floorplan">
            <img src="${image}" alt="${name} floor plan" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3EFloor Plan%3C/text%3E%3C/svg%3E'">
            <div class="template-card-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h20"></path>
              </svg>
              ${variants.length} Variants
            </div>
          </div>
          <div class="template-card-image template-card-finished">
            <img src="${finishedImage}" alt="${name} finished home" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3EFinished Home%3C/text%3E%3C/svg%3E'">
          </div>
        </div>
        
        <div class="template-card-content">
          <h3 class="template-card-title">${name}</h3>
          
          <div class="template-card-specs">
            <div class="template-spec">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18"></rect>
              </svg>
              <span>${sqft.toLocaleString()} sq ft</span>
            </div>
            <div class="template-spec">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span>${stories} ${stories === 1 ? 'Story' : 'Stories'}</span>
            </div>
            <div class="template-spec">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"></path>
                <rect x="3" y="3" width="18" height="6"></rect>
              </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
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
      
      if (viewBtn) {
        const templateId = viewBtn.dataset.template;
        this.viewTemplateDetails(templateId);
      } else if (orderBtn) {
        const templateId = orderBtn.dataset.template;
        this.orderTemplate(templateId);
      }
    });
    
    // Sort change
    const sortSelect = this.container.querySelector('#template-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.updateGrid();
      });
    }
    
    // Filter change
    const filterSelect = this.container.querySelector('#template-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterBy = e.target.value;
        this.updateGrid();
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
  
  updateGrid() {
    const grid = this.container.querySelector('.templates-grid');
    if (grid) {
      grid.innerHTML = this.renderTemplates();
    }
  }
  
  viewTemplateDetails(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Show modal with full details
    this.showTemplateModal(template);
  }
  
  async orderTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Navigate to builder page
    window.location.href = `/pages/builder.html?type=template&template=${template.id}`;
  }
  
  showTemplateModal(template) {
    // Create and show modal with full template details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay template-details-modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h2>${template.name}</h2>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="template-details-grid">
            <div class="template-details-images">
              <img src="${template.image}" alt="Floor plan" class="detail-floorplan">
              <img src="${template.finishedImage}" alt="Finished home" class="detail-finished">
            </div>
            <div class="template-details-info">
              <p class="template-description">${template.description}</p>
              
              <div class="detail-specs">
                <div class="detail-spec-row">
                  <span class="spec-label">Square Footage:</span>
                  <span class="spec-value">${template.sqft.toLocaleString()} sq ft</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Stories:</span>
                  <span class="spec-value">${template.stories}</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Bedrooms:</span>
                  <span class="spec-value">${template.bedrooms}</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Bathrooms:</span>
                  <span class="spec-value">${template.bathrooms}</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Foundation:</span>
                  <span class="spec-value">${template.foundation}</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Exterior:</span>
                  <span class="spec-value">${template.exteriorFinish}</span>
                </div>
                <div class="detail-spec-row">
                  <span class="spec-label">Roof Type:</span>
                  <span class="spec-value">${template.roofType}</span>
                </div>
              </div>
              
              <h4>Available Variants</h4>
              <div class="variants-list">
                ${template.variants.map(v => `
                  <div class="variant-item">
                    <strong>${v.name}</strong> - ${v.description}
                    ${v.addedCost > 0 ? `<span class="variant-cost">+$${v.addedCost.toLocaleString()}</span>` : ''}
                  </div>
                `).join('')}
              </div>
              
              <h4>Build History</h4>
              <div class="detail-stats">
                <div class="detail-stat">
                  <span class="stat-label">Times Built:</span>
                  <span class="stat-value">${template.statistics.timesBuilt}</span>
                </div>
                <div class="detail-stat">
                  <span class="stat-label">Average Cost:</span>
                  <span class="stat-value">$${template.statistics.averageCost.toLocaleString()}</span>
                </div>
                <div class="detail-stat">
                  <span class="stat-label">Average Days:</span>
                  <span class="stat-value">${template.statistics.averageDays} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-modal-close>Close</button>
          <button class="btn btn-primary" data-action="order" data-template="${template.id}">
            Order Materials
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-modal-close]').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Order button in modal
    const orderBtn = modal.querySelector('[data-action="order"]');
    if (orderBtn) {
      orderBtn.addEventListener('click', () => {
        modal.remove();
        this.orderTemplate(template.id);
      });
    }
  }
  
  viewAnalytics() {
    // Future: Navigate to analytics view
    console.log('Analytics view coming soon');
    alert('Analytics dashboard coming in Phase 7!');
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

