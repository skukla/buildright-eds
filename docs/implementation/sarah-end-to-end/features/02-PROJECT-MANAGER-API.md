# Phase 6-Foundation: ProjectManager API Reference

**📊 Document Type**: API Reference  
**📖 Reading Time**: 15-20 minutes  
**👥 Audience**: All developers

This is **Part 3 of 6** in the Phase 6-Foundation planning series.

**← Previous**: [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md)  
**→ Next**: [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)

---

## Overview

`ProjectManager` is a singleton service that provides CRUD operations for all project types across all personas (except Kevin).

**File**: `scripts/project-manager.js`  
**Storage**: LocalStorage (MVP) → Adobe Commerce API (production)  
**Used by**: All persona dashboards, builders, wizards, configurators

---

## Quick Start

```javascript
import projectManager from './scripts/project-manager.js';

// Create a project
const project = await projectManager.createProject({
  name: 'House #47',
  type: 'template',
  source: { templateId: 'sedona', variantId: 'sedona-bonus' }
});

// Update configuration
await projectManager.updateConfiguration(project.id, {
  selectionPackage: { id: 'desert-ridge-premium' }
});

// Save BOM
await projectManager.saveBOM(project.id, bomData);

// Add order
await projectManager.addOrder(project.id, {
  orderId: 'ORD-001',
  totalCost: 111000
});

// Get all active projects
const activeProjects = await projectManager.getActiveProjects();
```

---

## API Methods

### CREATE

#### `createProject(params)`

Create a new project.

**Parameters**:
```javascript
{
  name: string,              // User-facing name
  type: string,              // 'template' | 'semi-custom' | 'package' | 'deck'
  source: object,            // Type-specific source configuration
  configuration?: object     // Optional initial configuration
}
```

**Returns**: `Promise<Project>` - Created project object

**Examples**:
```javascript
// Sarah (Template)
const project = await projectManager.createProject({
  name: 'Desert Ridge Lot 12',
  type: 'template',
  source: { 
    templateId: 'sedona', 
    variantId: 'sedona-bonus',
    subdivision: 'Desert Ridge',
    lotNumber: '12'
  }
});

// Marcus (Semi-Custom)
const project = await projectManager.createProject({
  name: 'Patterson Residence',
  type: 'semi-custom',
  source: { 
    customSpecs: { 
      sqft: 2400, 
      stories: 2, 
      foundationType: 'slab' 
    } 
  },
  configuration: {
    qualityTier: 'professional',
    selectedPhases: ['foundation_framing', 'envelope', 'interior_finish']
  }
});

// Lisa (Package)
const project = await projectManager.createProject({
  name: 'Wilson Bathroom Remodel',
  type: 'package',
  source: { 
    packageId: 'bathroom-better', 
    roomCategory: 'bathroom' 
  }
});

// David (Deck)
const project = await projectManager.createProject({
  name: 'My Backyard Deck',
  type: 'deck',
  source: { 
    deckConfig: { 
      shape: 'rectangular', 
      size: '16x20', 
      material: 'composite' 
    } 
  }
});
```

---

### READ

#### `getProject(projectId)`

Get a single project by ID.

**Parameters**: `projectId: string`  
**Returns**: `Promise<Project|null>`

```javascript
const project = await projectManager.getProject('proj-2024-11-25-001');
```

---

#### `getAllProjects()`

Get all projects for current user.

**Returns**: `Promise<Project[]>`

```javascript
const allProjects = await projectManager.getAllProjects();
```

---

#### `getProjectsByStatus(status)`

Get projects filtered by status.

**Parameters**: `status: string` ('draft', 'configured', 'quoted', 'ordered', 'active', 'completed', 'cancelled')  
**Returns**: `Promise<Project[]>`

```javascript
const activeProjects = await projectManager.getProjectsByStatus('active');
const drafts = await projectManager.getProjectsByStatus('draft');
```

---

#### `getActiveProjects()`

Get all active projects (not completed or cancelled).

**Returns**: `Promise<Project[]>`

```javascript
const activeProjects = await projectManager.getActiveProjects();
// Returns projects with status: 'draft', 'configured', 'quoted', 'ordered', 'active'
```

---

#### `getProjectsByType(type)`

Get projects filtered by type (for persona-specific dashboards).

**Parameters**: `type: string` ('template', 'semi-custom', 'package', 'deck')  
**Returns**: `Promise<Project[]>`

```javascript
// Sarah's dashboard
const templateProjects = await projectManager.getProjectsByType('template');

// Marcus's dashboard
const customProjects = await projectManager.getProjectsByType('semi-custom');
```

---

### UPDATE

#### `updateConfiguration(projectId, configuration)`

Update project configuration (merges with existing).

**Parameters**:
- `projectId: string`
- `configuration: object` - Configuration to merge

**Returns**: `Promise<Project>`

```javascript
// Sarah updates selection package
await projectManager.updateConfiguration('proj-001', {
  selectionPackage: {
    id: 'desert-ridge-premium',
    name: 'Desert Ridge Premium',
    addedCost: 18000
  },
  additionalUpgrades: ['seismic_strapping']
});

// David updates completed steps
await projectManager.updateConfiguration('proj-003', {
  completedSteps: ['shape', 'size', 'material'],
  currentStep: 'railing'
});
```

---

#### `updateStatus(projectId, status)`

Update project status.

**Parameters**:
- `projectId: string`
- `status: string` ('draft', 'configured', 'quoted', 'ordered', 'active', 'completed', 'cancelled')

**Returns**: `Promise<Project>`

```javascript
await projectManager.updateStatus('proj-001', 'active');
```

---

#### `updateName(projectId, name)`

Update project name.

**Parameters**:
- `projectId: string`
- `name: string` - New name

**Returns**: `Promise<Project>`

```javascript
await projectManager.updateName('proj-001', 'Desert Ridge Lot 25');
```

---

#### `touchProject(projectId)`

Update last accessed timestamp (for "recent projects" features).

**Parameters**: `projectId: string`  
**Returns**: `Promise<void>`

```javascript
await projectManager.touchProject('proj-001');
```

---

### BOM OPERATIONS

#### `saveBOM(projectId, bomData)`

Associate generated BOM with project.

**Parameters**:
- `projectId: string`
- `bomData: object` - BOM from template-builder or project-wizard

**BOM Structure**:
```javascript
{
  phases: [
    {
      phase: 'foundation_framing',
      phaseName: 'Foundation & Framing',
      products: [...],          // Array of product objects
      estimatedCost: 95000,
      totalItems: 287
    }
  ],
  totalCost: 111000,
  totalItems: 425
}
```

**Returns**: `Promise<Project>`

```javascript
const bom = await templateBuilder.generateBOM(project);
await projectManager.saveBOM(project.id, bom);
```

---

### ORDER OPERATIONS

#### `addOrder(projectId, orderData)`

Associate order with project.

**Parameters**:
- `projectId: string`
- `orderData: object`

**Order Data Structure**:
```javascript
{
  orderId: string,       // Order ID from commerce system
  totalCost: number,
  phase?: string,        // Optional: for Marcus's multi-phase ordering
  items?: number         // Optional: number of items
}
```

**Returns**: `Promise<Project>`

**Examples**:
```javascript
// Sarah orders materials
await projectManager.addOrder('proj-001', {
  orderId: 'ORD-2024-123',
  totalCost: 111000,
  items: 425
});

// Marcus orders Phase 1
await projectManager.addOrder('proj-002', {
  orderId: 'ORD-2024-124',
  phase: 'foundation_framing',
  totalCost: 45000
});
```

**Behavior for Multi-Phase (Marcus)**:
- Marks phase as completed
- Updates `currentPhase` to next phase
- Changes status to 'in_progress'
- When all phases complete, sets status to 'completed'

---

### QUOTE OPERATIONS (Lisa only)

#### `generateQuote(projectId, clientInfo)`

Generate quote for project.

**Parameters**:
- `projectId: string`
- `clientInfo: object` - { name, email, phone? }

**Returns**: `Promise<Project>`

```javascript
await projectManager.generateQuote('proj-003', {
  name: 'Wilson Family',
  email: 'wilson@email.com',
  phone: '555-0123'
});
```

---

#### `shareQuote(projectId, emails)`

Share quote with email addresses.

**Parameters**:
- `projectId: string`
- `emails: string[]` - Array of email addresses

**Returns**: `Promise<Project>`

```javascript
await projectManager.shareQuote('proj-003', ['wilson@email.com']);
```

---

### DELETE

#### `deleteProject(projectId)`

Soft delete - marks project as 'cancelled'.

**Parameters**: `projectId: string`  
**Returns**: `Promise<void>`

```javascript
await projectManager.deleteProject('proj-001');
```

---

#### `permanentlyDeleteProject(projectId)`

**⚠️ USE WITH CAUTION** - Hard delete, cannot be undone.

**Parameters**: `projectId: string`  
**Returns**: `Promise<void>`

```javascript
await projectManager.permanentlyDeleteProject('proj-001');
```

---

### UTILITY

#### `generateProjectName(type, options)`

Auto-generate project name with smart suggestions.

**Parameters**:
- `type: string` - Project type
- `options?: object` - { subdivision?, lotNumber? }

**Returns**: `Promise<string>`

```javascript
// Sarah: Smart suggestion based on subdivision + lot
const name = await projectManager.generateProjectName('template', {
  subdivision: 'Desert Ridge',
  lotNumber: '12'
});
// Returns: "Desert Ridge Lot 12"

// Fallback: Auto-increment if no subdivision
const name = await projectManager.generateProjectName('template');
// Returns: "Build #47"
```

---

#### `getStatistics()`

Get project statistics for dashboard widgets.

**Returns**: `Promise<Statistics>`

**Statistics Structure**:
```javascript
{
  total: number,            // Total projects
  active: number,           // In progress
  drafts: number,           // Draft status
  completed: number,        // Completed
  totalSpent: number,       // Sum of actualCost
  totalEstimated: number    // Sum of estimatedCost
}
```

```javascript
const stats = await projectManager.getStatistics();
console.log(`You have ${stats.active} active builds`);
```

---

## Storage Strategy

### MVP: LocalStorage

```javascript
class LocalStorageAdapter {
  constructor() {
    this.STORAGE_KEY = 'buildright_projects';
  }
  
  async getProjects() {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }
  
  async saveProject(project) {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
  }
  
  async deleteProject(projectId) {
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}
```

**Why LocalStorage for MVP**:
- ✅ No backend required - focus demo on Commerce + ACO
- ✅ Fast development
- ✅ Works offline
- ✅ Perfect for demo purposes

**Limitations**:
- ❌ Not shared across devices
- ❌ Limited storage (~5-10MB)
- ❌ Cleared if user clears browser data

---

### Production: Adobe Commerce API

**Future enhancement** (NOT in Phase 6):

| Project Type | Commerce Entity | Purpose |
|--------------|----------------|---------|
| Sarah's Templates | Requisition Lists | Saved BOMs for repeat ordering |
| Marcus's Semi-Custom | Quotes (multi-line items) | Phase-based ordering |
| Lisa's Packages | Quotes + Custom Attributes | Quote generation & sharing |
| David's Decks | Cart | Direct to cart (no saved state needed) |

---

## Usage Examples by Persona

### Sarah's Complete Flow

```javascript
// 1. Create build
const project = await projectManager.createProject({
  name: await projectManager.generateProjectName('template', {
    subdivision: 'Desert Ridge',
    lotNumber: '12'
  }),
  type: 'template',
  source: {
    templateId: 'sedona',
    variantId: 'sedona-bonus',
    subdivision: 'Desert Ridge',
    lotNumber: '12'
  }
});

// 2. Configure selection package
await projectManager.updateConfiguration(project.id, {
  selectionPackage: {
    id: 'desert-ridge-premium',
    name: 'Desert Ridge Premium',
    addedCost: 18000
  }
});

// 3. Generate & save BOM
const bom = await templateBuilder.generateBOM(project);
await projectManager.saveBOM(project.id, bom);

// 4. Order materials
const orderId = await cartManager.checkout();
await projectManager.addOrder(project.id, {
  orderId,
  totalCost: 111000,
  items: 425
});

// 5. View active builds
const activeBuilds = await projectManager.getProjectsByType('template');
```

---

### Marcus's Multi-Phase Flow

```javascript
// 1. Create project
const project = await projectManager.createProject({
  name: 'Patterson Residence',
  type: 'semi-custom',
  source: {
    customSpecs: {
      sqft: 2400,
      stories: 2,
      foundationType: 'slab'
    }
  },
  configuration: {
    qualityTier: 'professional',
    selectedPhases: ['foundation_framing', 'envelope', 'interior_finish']
  }
});

// 2. Order Phase 1
const phase1BOM = await projectWizard.generateBOMForPhase(project, 'foundation_framing');
await projectManager.saveBOM(project.id, phase1BOM);
const orderId1 = await cartManager.checkout();
await projectManager.addOrder(project.id, {
  orderId: orderId1,
  phase: 'foundation_framing',
  totalCost: 45000
});
// Now: project.currentPhase = 'envelope', project.status = 'in_progress'

// 3. THREE WEEKS LATER: Order Phase 2
const savedProject = await projectManager.getProject(project.id);
console.log('Current phase:', savedProject.currentPhase); // "envelope"
```

---

### Lisa's Quote Flow

```javascript
// 1. Create project
const project = await projectManager.createProject({
  name: 'Wilson Bathroom Remodel',
  type: 'package',
  source: { packageId: 'bathroom-better', roomCategory: 'bathroom' }
});

// 2. Customize
await projectManager.updateConfiguration(project.id, {
  packageCustomizations: {
    vanity: { selectedSku: 'VAN-PR-002', addedCost: 425 }
  }
});

// 3. Generate & share quote
await projectManager.generateQuote(project.id, {
  name: 'Wilson Family',
  email: 'wilson@email.com'
});
await projectManager.shareQuote(project.id, ['wilson@email.com']);
```

---

### David's Save & Resume Flow

```javascript
// 1. Create project
const project = await projectManager.createProject({
  name: 'My Backyard Deck',
  type: 'deck',
  source: { deckConfig: { shape: null, size: null } },
  configuration: { completedSteps: [], currentStep: 'shape' }
});

// 2. Complete some steps, then stop
await projectManager.updateConfiguration(project.id, {
  completedSteps: ['shape', 'size', 'material'],
  currentStep: 'railing'
});
project.source.deckConfig.shape = 'rectangular';
project.source.deckConfig.size = '16x20';
project.source.deckConfig.material = 'composite';
await projectManager.saveProject(project);

// 3. TWO DAYS LATER: Resume
const savedProject = await projectManager.getProject(project.id);
console.log('Resume at:', savedProject.configuration.currentStep); // "railing"
```

---

## Next Steps

**→ [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)** - Sarah's complete UX flow  
**→ [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)** - Marcus, Lisa, David flows  
**→ [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)** - Tasks & timeline

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

