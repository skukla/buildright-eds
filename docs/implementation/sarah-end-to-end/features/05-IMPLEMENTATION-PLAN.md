# Phase 6-Foundation: Implementation Plan

**📊 Document Type**: Implementation Guide  
**📖 Reading Time**: 10-15 minutes  
**👥 Audience**: Developers implementing Phase 6-Foundation

This is **Part 6 of 7** in the Phase 6-Foundation planning series.

**← Previous**: [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)  
**→ Next**: [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)

---

## Timeline

**Total Time**: 5-7 hours  
**Must Complete Before**: Phase 6A implementation

---

## Task 1: Create ProjectManager Service (2-3 hours)

**File**: `scripts/project-manager.js` (NEW)

**Subtasks**:
1. Create `ProjectManager` class with all API methods (1 hour)
2. Create `LocalStorageAdapter` class (30 min)
3. Add error handling and validation (30 min)
4. Add utility methods (generateProjectId, etc.) (30 min)
5. Create singleton instance and export (15 min)
6. Add JSDoc comments for all methods (30 min)

**Deliverable**: Complete `scripts/project-manager.js` with ~500-600 lines

**Testing**:
```javascript
// Quick test in browser console
import projectManager from './scripts/project-manager.js';

const project = await projectManager.createProject({
  name: 'Test Project',
  type: 'template',
  source: { templateId: 'sedona' }
});

console.log('Created:', project);

const retrieved = await projectManager.getProject(project.id);
console.log('Retrieved:', retrieved);
```

---

## Task 2: Create Storage Adapter (1 hour)

**File**: `scripts/storage-adapter.js` (NEW)

**Contents**:
```javascript
/**
 * Storage Adapter
 * Abstraction layer for project persistence
 * MVP: LocalStorage
 * Future: Adobe Commerce API
 */

/**
 * LocalStorage Implementation
 */
export class LocalStorageAdapter {
  constructor() {
    this.STORAGE_KEY = 'buildright_projects';
  }
  
  async getProjects() {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  }
  
  async saveProject(project) {
    try {
      const projects = await this.getProjects();
      const index = projects.findIndex(p => p.id === project.id);
      
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving project to localStorage:', error);
      throw new Error('Failed to save project');
    }
  }
  
  async deleteProject(projectId) {
    try {
      const projects = await this.getProjects();
      const filtered = projects.filter(p => p.id !== projectId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting project from localStorage:', error);
      throw new Error('Failed to delete project');
    }
  }
}

/**
 * Commerce API Implementation (Future)
 * Placeholder for production implementation
 */
export class CommerceAPIAdapter {
  constructor() {
    this.apiBaseUrl = process.env.COMMERCE_API_URL || '';
    this.apiToken = null;
  }
  
  async getProjects() {
    throw new Error('Commerce API not yet implemented');
  }
  
  async saveProject(project) {
    throw new Error('Commerce API not yet implemented');
  }
  
  async deleteProject(projectId) {
    throw new Error('Commerce API not yet implemented');
  }
}

// Export factory function
export function createStorageAdapter(type = 'localStorage') {
  switch (type) {
    case 'localStorage':
      return new LocalStorageAdapter();
    case 'commerceAPI':
      return new CommerceAPIAdapter();
    default:
      throw new Error(`Unknown storage adapter type: ${type}`);
  }
}
```

**Testing**:
```javascript
import { LocalStorageAdapter } from './scripts/storage-adapter.js';

const adapter = new LocalStorageAdapter();
const testProject = { id: 'test-1', name: 'Test' };

await adapter.saveProject(testProject);
const projects = await adapter.getProjects();
console.log('Saved projects:', projects);

await adapter.deleteProject('test-1');
const afterDelete = await adapter.getProjects();
console.log('After delete:', afterDelete);
```

---

## Task 3: Update ProjectManager to Use Adapter (30 min)

**File**: `scripts/project-manager.js`

**Changes**:
```javascript
import { createStorageAdapter } from './storage-adapter.js';

class ProjectManager {
  constructor() {
    // Use localStorage adapter by default (MVP)
    this.storage = createStorageAdapter('localStorage');
  }
  
  // Update all methods to use this.storage instead of direct localStorage calls
  async saveProject(project) {
    await this.storage.saveProject(project);
  }
  
  async getAllProjects() {
    const allProjects = await this.storage.getProjects();
    const user = authService.getCurrentUser();
    return allProjects.filter(p => p.userId === user.id);
  }
  
  // ... rest of methods
}
```

---

## Task 4: Integration with Auth Service (30 min)

**File**: `scripts/auth.js`

**Add User ID Generation** (if not already present):
```javascript
// Ensure demo accounts have consistent IDs
const DEMO_ACCOUNTS = [
  {
    id: 'sarah-martinez', // Consistent ID
    company: 'Sunset Valley Homes',
    email: 'sarah@sunsetvalley.com',
    persona: 'sarah'
  },
  // ... other accounts
];
```

---

## Task 5: Update Persona Configuration (30 min)

**File**: `scripts/persona-config.js`

**Add Terminology Mapping**:
```javascript
export const PERSONAS = {
  SARAH: {
    id: 'sarah',
    name: 'Sarah Martinez',
    workItemLabel: 'Build',           // NEW
    workItemLabelPlural: 'Builds',    // NEW
    // ... existing fields
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus Johnson',
    workItemLabel: 'Job',             // NEW
    workItemLabelPlural: 'Jobs',      // NEW
    // ... existing fields
  },
  LISA: {
    id: 'lisa',
    name: 'Lisa Chen',
    workItemLabel: 'Job',             // NEW
    workItemLabelPlural: 'Jobs',      // NEW
    // ... existing fields
  },
  DAVID: {
    id: 'david',
    name: 'David Thompson',
    workItemLabel: 'Project',         // NEW
    workItemLabelPlural: 'Projects',  // NEW
    // ... existing fields
  }
};

/**
 * Get work item label for current persona
 */
export function getWorkItemLabel(personaId, plural = false) {
  const persona = getPersona(personaId);
  if (!persona) return plural ? 'Projects' : 'Project';
  return plural ? persona.workItemLabelPlural : persona.workItemLabel;
}
```

---

## Task 6: Update templates.json (1 hour)

**File**: `data/templates.json`

**Add Selection Packages**:
```json
{
  "packages": {
    "builders-choice": {
      "id": "builders-choice",
      "name": "Builder's Choice",
      "subdivisionSpecific": false,
      "addedCost": 0,
      "skuMappings": {
        "windows_double_hung_3660": "WIN-STANDARD-3660",
        "doors_entry": "DOOR-STANDARD-3080",
        "roofing_shingles": "ROOF-STANDARD"
      }
    },
    "desert-ridge-premium": {
      "id": "desert-ridge-premium",
      "name": "Desert Ridge Premium",
      "subdivisionSpecific": "Desert Ridge",
      "addedCost": 18000,
      "skuMappings": {
        "windows_double_hung_3660": "WIN-ANDER-3660",
        "doors_entry": "DOOR-THERM-SS-3080",
        "roofing_shingles": "ROOF-GAF-HDZ-PEWTER"
      }
    },
    "sunset-valley-executive": {
      "id": "sunset-valley-executive",
      "name": "Sunset Valley Executive",
      "subdivisionSpecific": "Sunset Valley",
      "addedCost": 35000,
      "skuMappings": {
        "windows_double_hung_3660": "WIN-PELLA-ARCH-3660",
        "doors_entry": "DOOR-MAHOG-EXEC-3080",
        "roofing_shingles": "ROOF-CERTAINT-PRES"
      }
    }
  }
}
```

---

## Task 7: Create Demo/Testing Interface (1 hour)

**File**: `scripts/project-manager-demo.js` (NEW)

**Purpose**: Quick testing interface for development

```javascript
/**
 * Project Manager Demo/Testing Interface
 * Use in browser console for testing
 */

import projectManager from './project-manager.js';

export const projectDemo = {
  
  // Create sample projects for each persona
  async createSampleProjects() {
    console.log('Creating sample projects...');
    
    // Sarah's template project
    const sarahProject = await projectManager.createProject({
      name: 'House #47',
      type: 'template',
      source: { templateId: 'sedona', variantId: 'sedona-bonus' }
    });
    console.log('Created Sarah project:', sarahProject.id);
    
    // Marcus's custom project
    const marcusProject = await projectManager.createProject({
      name: 'Patterson Residence',
      type: 'semi-custom',
      source: { 
        customSpecs: { sqft: 2400, stories: 2, foundationType: 'slab' }
      },
      configuration: {
        qualityTier: 'professional',
        selectedPhases: ['foundation_framing', 'envelope', 'interior_finish']
      }
    });
    console.log('Created Marcus project:', marcusProject.id);
    
    console.log('✅ Sample projects created!');
  },
  
  // List all projects
  async listAll() {
    const projects = await projectManager.getAllProjects();
    console.table(projects.map(p => ({
      ID: p.id,
      Name: p.name,
      Type: p.type,
      Status: p.status,
      Cost: `$${p.estimatedCost || 0}`
    })));
  },
  
  // Clear all projects
  async clearAll() {
    const confirm = window.confirm('Delete ALL projects? This cannot be undone.');
    if (!confirm) return;
    
    localStorage.removeItem('buildright_projects');
    console.log('✅ All projects cleared!');
  },
  
  // Get statistics
  async stats() {
    const stats = await projectManager.getStatistics();
    console.log('Project Statistics:', stats);
  }
};

// Expose to window for console access
window.projectDemo = projectDemo;
```

**Usage**:
```javascript
// In browser console after loading page
projectDemo.createSampleProjects();
projectDemo.listAll();
projectDemo.stats();
projectDemo.clearAll(); // When needed
```

---

## Success Criteria

### Technical Success

✅ **ProjectManager Service**:
- [ ] All CRUD methods implemented
- [ ] LocalStorage adapter working
- [ ] Error handling in place
- [ ] JSDoc comments complete
- [ ] Singleton export working

✅ **Storage**:
- [ ] Projects persist across page reloads
- [ ] Multiple projects can coexist
- [ ] Updates don't corrupt existing projects
- [ ] Delete operations work correctly

✅ **Integration**:
- [ ] Works with auth service (user IDs)
- [ ] Works with persona-config (customer groups)
- [ ] Demo interface functional

✅ **Testing**:
- [ ] Can create projects for each persona type
- [ ] Can retrieve projects by ID, status, type
- [ ] Can update configurations
- [ ] Can associate orders
- [ ] Can track multi-phase progress (Marcus)
- [ ] Can generate and share quotes (Lisa)

### UX Success

✅ **Consistent Patterns**:
- [ ] All personas use same project creation flow
- [ ] All dashboards show real project data
- [ ] Order history links to projects

✅ **Data Persistence**:
- [ ] Sarah's houses persist between sessions
- [ ] Marcus can resume multi-phase projects
- [ ] Lisa's quotes are saved
- [ ] David can save and resume deck

✅ **No Breaking Changes**:
- [ ] Existing auth flow still works
- [ ] Existing persona routing still works
- [ ] No console errors

---

## Future Enhancements

### NOT in Phase 6-Foundation (Document for Future)

#### 1. Adobe Commerce API Integration

**When**: After Phase 6E complete, during production deployment

**Requirements**:
- Custom Adobe Commerce extension for project metadata
- REST/GraphQL endpoints for projects
- Authentication/session management
- Order association via Commerce API
- Requisition list sync (for Sarah)
- Quote API integration (for Lisa)

**Estimated Effort**: 2-3 weeks

---

#### 2. Advanced Project Features

**Search & Filter**:
- Full-text search across project names
- Filter by date range
- Filter by cost range
- Sort by various fields

**Analytics**:
- Cost trends over time
- Most popular templates (Sarah)
- Average project duration (Marcus)
- Conversion rate quotes → orders (Lisa)

**Bulk Operations**:
- Duplicate project
- Archive multiple projects
- Export project list as CSV

**Estimated Effort**: 1-2 weeks

---

#### 3. Collaboration Features

**Multi-User Projects** (Lisa + client):
- Client can view quote online
- Client can approve/reject
- Comments and feedback
- Version history

**Team Projects** (Marcus + subcontractors):
- Share project with team members
- Role-based permissions
- Activity log

**Estimated Effort**: 3-4 weeks

---

## File Structure

```
buildright-eds/
├── scripts/
│   ├── project-manager.js           ⭐ NEW (main service)
│   ├── storage-adapter.js           ⭐ NEW (storage abstraction)
│   ├── project-manager-demo.js      ⭐ NEW (testing interface)
│   ├── auth.js                      📝 MODIFY (user ID generation)
│   ├── persona-config.js            📝 MODIFY (add terminology)
│   └── dashboards/
│       └── (persona-specific dashboards will use ProjectManager)
│
└── data/
    └── templates.json               📝 MODIFY (add packages)
```

**Legend**:
- ⭐ NEW - Create new file
- 📝 MODIFY - Update existing file
- ✅ EXISTING - No changes needed

---

## Next Steps

Once Phase 6-Foundation is complete:

1. ✅ **Phase 6A**: Sarah's dashboard redesign (uses ProjectManager)
2. ⏭️ **Phase 6B**: Marcus's project wizard (uses ProjectManager)
3. ⏭️ **Phase 6C**: Lisa's quote flow (uses ProjectManager)
4. ⏭️ **Phase 6D**: David's deck builder (uses ProjectManager)
5. ⏭️ **Phase 6E**: Kevin's restock (does NOT use ProjectManager)

---

## Questions?

**→ [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)** - Complete API reference  
**→ [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)** - Sarah's usage examples  
**→ [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)** - Decision rationale

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

