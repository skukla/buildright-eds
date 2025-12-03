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
    this.container = container || document.querySelector('.template-dashboard');
    this.templates = [];
    this.activeBuilds = {}; // Track active builds per template
  }
  
  async initialize() {
    // Load templates
    await this.loadTemplates();
    
    // Load active builds count (from localStorage for now)
    this.loadActiveBuilds();
    
    // Render templates into grid
    this.renderTemplates();
    
    // Decorate breadcrumbs
    this.decorateBreadcrumbs();
    
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
  
  renderTemplates() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;
    
    if (this.templates.length === 0) {
      grid.innerHTML = `
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
    } else {
      grid.innerHTML = this.templates.map(template => this.renderTemplateCard(template)).join('');
  }
  
    // Show the grid now that it's populated
    grid.style.visibility = 'visible';
    }
    
  decorateBreadcrumbs() {
    const breadcrumbsBlock = this.container.querySelector('.breadcrumbs');
    if (breadcrumbsBlock) {
      // Import and decorate breadcrumbs
      import('../../blocks/breadcrumbs/breadcrumbs.js')
        .then(module => module.default(breadcrumbsBlock))
        .catch(err => console.error('Error decorating breadcrumbs:', err));
    }
  }
  
  renderTemplateCard(template) {
    const { id, name, sqft, stories, bedrooms, bathrooms, finishedImage } = template;
    const activeCount = this.activeBuilds[id] || 0;
    
    return `
      <div class="template-card" data-template-id="${id}">
        <div class="template-card-thumb">
          <img src="${finishedImage}" alt="${name}" loading="lazy" 
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%236b7280%22%3E${name}%3C/text%3E%3C/svg%3E'">
          ${activeCount > 0 ? `
            <div class="active-builds-badge">
              ${activeCount} active
            </div>
          ` : ''}
        </div>
        
        <div class="template-card-content">
          <h3 class="template-card-title">${name}</h3>
          
          <p class="template-card-specs">
            ${sqft.toLocaleString()} sq ft • 
            ${stories} ${stories === 1 ? 'story' : 'stories'} • 
            ${bedrooms}BR/${bathrooms}BA
          </p>
          
          <button class="btn btn-primary template-card-action" data-action="start-build" data-template="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
              </svg>
            Start New Build
            </button>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Template card clicks - entire card is clickable
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      
      if (card) {
        const templateId = card.dataset.templateId;
        this.startNewBuild(templateId);
      }
    });
  }
    
  startNewBuild(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Navigate to Build Configurator (Phase 6A)
    window.location.href = `/pages/build-configurator.html?template=${template.id}`;
  }
  
  loadActiveBuilds() {
    // Load active builds count from localStorage
    // TODO: In Sub-Phase 5, integrate with ProjectManager
    try {
      const saved = localStorage.getItem('buildright_active_builds');
      this.activeBuilds = saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading active builds:', error);
      this.activeBuilds = {};
    }
  }
  
}

// Auto-initialize when loaded directly on page (not via generic router)
const container = document.querySelector('.template-dashboard');
if (container && !container.dataset.initialized) {
  container.dataset.initialized = 'true';
  const dashboard = new TemplateDashboard(container);
  dashboard.initialize();
  }
