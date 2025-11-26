# Phase 6-Foundation: Other Personas (Marcus, Lisa, David)

**📊 Document Type**: Persona-Specific Implementation Guide  
**📖 Reading Time**: 15-20 minutes  
**👥 Audience**: Developers implementing Phases 6B-6D

This is **Part 5 of 6** in the Phase 6-Foundation planning series.

**← Previous**: [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)  
**→ Next**: [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)

**🔗 Related Architecture**:
- ⭐ [PRODUCT-TAXONOMY-ANALYSIS.md](./PRODUCT-TAXONOMY-ANALYSIS.md#persona-shopping-behavior-analysis) - All personas' mental models
- ⭐ [ACO-CATALOG-ARCHITECTURE.md](./ACO-CATALOG-ARCHITECTURE.md#3-catalog-views-aco-feature) - Catalog views for Marcus, Lisa, David

---

## Overview

This document details how Marcus, Lisa, and David use the Project entity for their respective workflows.

---

## Marcus Johnson (General Contractor) - Phase 6B

### Project Type: Semi-Custom

**Primary Use Case**: Multi-phase ordering over weeks/months

### Complete Flow

```javascript
// ============================================================================
// FLOW: Marcus orders Patterson Residence across 3 phases
// ============================================================================

// 1. Marcus completes project wizard
const project = await projectManager.createProject({
  name: 'Patterson Residence',
  type: 'semi-custom',
  source: {
    customSpecs: {
      sqft: 2400,
      sqftGarage: 600,
      stories: 2,
      foundationType: 'slab',
      projectType: 'new_construction'
    }
  },
  configuration: {
    qualityTier: 'professional',
    selectedPhases: ['foundation_framing', 'envelope', 'interior_finish']
  }
});

// 2. Marcus orders Phase 1: Foundation & Framing
const phase1BOM = await projectWizard.generateBOMForPhase(project, 'foundation_framing');
await projectManager.saveBOM(project.id, phase1BOM);

const orderId1 = await cartManager.checkout();
await projectManager.addOrder(project.id, {
  orderId: orderId1,
  phase: 'foundation_framing',
  totalCost: 45000
});

// At this point:
// - project.status = 'in_progress'
// - project.completedPhases = ['foundation_framing']
// - project.currentPhase = 'envelope'

// 3. THREE WEEKS LATER: Marcus returns for Phase 2
const savedProject = await projectManager.getProject(project.id);
console.log('Current phase:', savedProject.currentPhase); // "envelope"

const phase2BOM = await projectWizard.generateBOMForPhase(savedProject, 'envelope');
// ... order Phase 2

// 4. Dashboard shows multi-phase progress
const marcusProjects = await projectManager.getProjectsByType('semi-custom');
// Shows: "Patterson Residence - Phase 2 of 3 - In Progress"
```

### Dashboard Integration

```javascript
// In marcus-dashboard.js

async loadActiveJobs() {
  const projects = await projectManager.getProjectsByType('semi-custom');
  
  const activeJobs = projects.filter(p => p.status === 'in_progress');
  
  this.renderJobsList(activeJobs);
}

renderJobCard(project) {
  const totalPhases = project.configuration.selectedPhases.length;
  const completedCount = project.completedPhases?.length || 0;
  const currentPhase = project.currentPhase;
  
  return `
    <div class="card job-card">
      <div class="card-header">
        <h3>${project.name}</h3>
      </div>
      <div class="card-body">
        <p><strong>Phase ${completedCount + 1} of ${totalPhases}</strong></p>
        <p>Current: ${this.formatPhaseName(currentPhase)}</p>
        <p>Completed: ${project.completedPhases.map(p => this.formatPhaseName(p)).join(', ')}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" onclick="this.orderNextPhase('${project.id}')">
          Order ${this.formatPhaseName(currentPhase)}
        </button>
      </div>
    </div>
  `;
}
```

---

## Lisa Chen (Remodeling Contractor) - Phase 6C

### Project Type: Package-based

**Primary Use Case**: Quote generation, client sharing, eventual ordering

### Complete Flow

```javascript
// ============================================================================
// FLOW: Lisa creates quote for Wilson Bathroom, shares with client
// ============================================================================

// 1. Lisa selects Better package and customizes
const project = await projectManager.createProject({
  name: 'Wilson Bathroom Remodel',
  type: 'package',
  source: {
    packageId: 'bathroom-better',
    roomCategory: 'bathroom'
  }
});

// 2. Lisa customizes package
await projectManager.updateConfiguration(project.id, {
  packageCustomizations: {
    vanity: { selectedSku: 'VAN-PR-002', addedCost: 425 },
    tile: { selectedSku: 'TIL-PR-003', addedCost: 680 }
  },
  optionalAddons: ['heated_floor', 'led_lighting']
});

// 3. Lisa generates quote
await projectManager.generateQuote(project.id, {
  name: 'Wilson Family',
  email: 'wilson@email.com',
  phone: '555-0123'
});

// 4. Lisa shares quote via email
await projectManager.shareQuote(project.id, ['wilson@email.com']);

// 5. Client approves, Lisa converts to order (future)
const orderId = await cartManager.checkout();
await projectManager.addOrder(project.id, {
  orderId,
  totalCost: 16680
});

// 6. Dashboard shows quotes
const quotes = await projectManager.getProjectsByStatus('quoted');
// Shows: "Wilson Bathroom Remodel - Quoted - $16,680 - Shared with client"
```

### Dashboard Integration

```javascript
// In lisa-dashboard.js

async loadQuotes() {
  const projects = await projectManager.getProjectsByType('package');
  
  const activeQuotes = projects.filter(p => 
    p.status === 'quoted' || p.status === 'shared'
  );
  
  this.renderQuotesList(activeQuotes);
}

renderQuoteCard(project) {
  const client = project.client;
  const sharedCount = project.sharedWith?.length || 0;
  
  return `
    <div class="card quote-card">
      <div class="card-header">
        <h3>${project.name}</h3>
        <span class="badge ${project.status}">${project.status}</span>
      </div>
      <div class="card-body">
        <p><strong>Client:</strong> ${client.name}</p>
        <p><strong>Quote:</strong> $${project.estimatedCost.toLocaleString()}</p>
        <p>Generated: ${this.formatDate(project.quoteGeneratedAt)}</p>
        ${sharedCount > 0 ? `<p>Shared with ${sharedCount} recipients</p>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn btn-outline btn-sm" onclick="this.viewQuote('${project.id}')">
          View Quote
        </button>
        <button class="btn btn-primary btn-sm" onclick="this.shareQuote('${project.id}')">
          Share Again
        </button>
      </div>
    </div>
  `;
}

async shareQuote(projectId) {
  const emails = await this.promptEmailAddresses();
  if (emails.length === 0) return;
  
  await projectManager.shareQuote(projectId, emails);
  
  this.showNotification(`Quote shared with ${emails.length} recipients`);
  this.loadQuotes(); // Refresh
}
```

---

## David Thompson (DIY Homeowner) - Phase 6D

### Project Type: Deck builder

**Primary Use Case**: Save and resume configuration, educational guidance

### Complete Flow

```javascript
// ============================================================================
// FLOW: David builds deck, saves halfway, resumes later
// ============================================================================

// 1. David starts deck builder
const project = await projectManager.createProject({
  name: 'My Backyard Deck',
  type: 'deck',
  source: {
    deckConfig: {
      shape: null,
      size: null,
      material: null,
      railing: null,
      accessories: []
    }
  },
  configuration: {
    completedSteps: [],
    currentStep: 'shape'
  }
});

// 2. David completes Steps 1-3, then needs to stop
await projectManager.updateConfiguration(project.id, {
  ...project.configuration,
  completedSteps: ['shape', 'size', 'material'],
  currentStep: 'railing'
});

project.source.deckConfig.shape = 'rectangular';
project.source.deckConfig.size = '16x20';
project.source.deckConfig.material = 'composite';
await projectManager.saveProject(project);

// 3. David closes browser, comes back 2 days later
const savedProject = await projectManager.getProject(project.id);
console.log('Resume at:', savedProject.configuration.currentStep); // "railing"

// 4. David completes remaining steps
// ... finishes configuration

// 5. David orders
const orderId = await cartManager.checkout();
await projectManager.addOrder(project.id, { orderId, totalCost: 6817 });

// Project status changes: 'draft' → 'configured' → 'ordered' → 'completed'
```

### Wizard Integration

```javascript
// In deck-wizard.js

async initWizard() {
  // Check for existing draft project
  const drafts = await projectManager.getProjectsByStatus('draft');
  const deckDraft = drafts.find(p => p.type === 'deck');
  
  if (deckDraft) {
    // Resume existing project
    const resume = await this.promptResume(deckDraft);
    if (resume) {
      this.project = deckDraft;
      this.currentStep = this.project.configuration.currentStep;
      this.renderStep(this.currentStep);
      return;
    }
  }
  
  // Start new project
  this.project = await projectManager.createProject({
    name: 'My Backyard Deck',
    type: 'deck',
    source: { deckConfig: {} },
    configuration: { completedSteps: [], currentStep: 'shape' }
  });
}

async handleStepComplete(step, data) {
  // Update project with step data
  this.project.source.deckConfig[step] = data.value;
  
  // Mark step as completed
  const completedSteps = this.project.configuration.completedSteps;
  if (!completedSteps.includes(step)) {
    completedSteps.push(step);
  }
  
  // Determine next step
  const nextStep = this.getNextStep(step);
  this.project.configuration.currentStep = nextStep;
  
  // Save progress
  await projectManager.saveProject(this.project);
  
  // Render next step
  if (nextStep) {
    this.renderStep(nextStep);
  } else {
    this.renderReview();
  }
}
```

### Dashboard Integration

```javascript
// In david-dashboard.js

async loadProjects() {
  const projects = await projectManager.getProjectsByType('deck');
  
  // Separate drafts from completed
  const drafts = projects.filter(p => p.status === 'draft');
  const completed = projects.filter(p => p.status === 'completed');
  
  this.renderDrafts(drafts);
  this.renderCompleted(completed);
}

renderDraftCard(project) {
  const config = project.configuration;
  const completedCount = config.completedSteps.length;
  const totalSteps = 6; // shape, size, material, railing, accessories, review
  
  return `
    <div class="card draft-card">
      <div class="card-header">
        <h3>${project.name}</h3>
        <span class="badge draft">Draft</span>
      </div>
      <div class="card-body">
        <p>Progress: ${completedCount} of ${totalSteps} steps</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(completedCount / totalSteps) * 100}%"></div>
        </div>
        <p style="margin-top: 1rem;">
          <strong>Resume at:</strong> ${this.formatStepName(config.currentStep)}
        </p>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" onclick="this.resumeProject('${project.id}')">
          Resume Building
        </button>
        <button class="btn btn-outline btn-sm" onclick="this.deleteProject('${project.id}')">
          Delete
        </button>
      </div>
    </div>
  `;
}
```

---

## Common Patterns Across All Personas

### Dashboard Widgets

**Active Projects Count**:
```javascript
async getActiveProjectsCount() {
  const projects = await projectManager.getActiveProjects();
  return projects.length;
}
```

**Recent Projects**:
```javascript
async getRecentProjects(limit = 5) {
  const projects = await projectManager.getAllProjects();
  return projects
    .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
    .slice(0, limit);
}
```

**Project Statistics**:
```javascript
async loadStatistics() {
  const stats = await projectManager.getStatistics();
  
  document.querySelector('.total-projects').textContent = stats.total;
  document.querySelector('.active-projects').textContent = stats.active;
  document.querySelector('.total-spent').textContent = `$${stats.totalSpent.toLocaleString()}`;
}
```

---

### UI Terminology

**Helper Usage**:
```javascript
import { getWorkItemLabel } from './scripts/persona-config.js';

// Marcus's dashboard
<h2>My ${getWorkItemLabel('marcus', true)}</h2>
// Renders: "My Jobs"

// Lisa's dashboard
<h2>Active ${getWorkItemLabel('lisa', true)}</h2>
// Renders: "Active Jobs"

// David's dashboard
<h2>My ${getWorkItemLabel('david', true)}</h2>
// Renders: "My Projects"
```

---

## Next Steps

**→ [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)** - Tasks & timeline  
**→ [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)** - Decisions recap

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

