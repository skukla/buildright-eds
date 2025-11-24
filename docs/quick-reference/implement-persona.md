# Quick Reference: Implement a Persona

**⏱️ Reading time**: 2 minutes  
**🔨 Implementation time**: 2-3 weeks per persona

---

## TL;DR

1. Read persona profile → Find implementation plan → Check what exists → Start coding
2. Update 3 core files: `persona-config.js`, dashboard script, demo data
3. Reuse existing shared components (loading overlay, wizard progress, etc.)

---

## Step-by-Step

### 1. **Read Persona Profile** (5 min)

📖 **Where**: [personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)

**Find your persona**:
- Sarah Martinez - Production Builder
- Marcus Johnson - General Contractor
- Lisa Chen - Remodeling Contractor
- David Thompson - DIY Homeowner
- Kevin Rodriguez - Store Manager

**Learn**: Goals, pain points, user flow, CCDM value

---

### 2. **Read Implementation Plan** (20 min)

📖 **Where**: [PHASES-6B-TO-7-CONSOLIDATED.md](../PHASES-6B-TO-7-CONSOLIDATED.md)

**Find your phase**:
- Phase 6B = Marcus
- Phase 6C = Lisa
- Phase 6D = David
- Phase 6E = Kevin

**Get**: Objectives, data requirements, implementation files, success criteria

---

### 3. **Check What Exists** (10 min)

📖 **Where**: [what-exists.md](./what-exists.md)

**Review**:
- Shared components you can reuse
- Demo accounts and auth flow
- Fragments available
- Existing patterns

---

### 4. **Start Implementing** (2-3 weeks)

#### A. Add Persona to Config
**File**: `scripts/persona-config.js`

```javascript
export const PERSONAS = {
  // ... existing personas
  
  YOUR_PERSONA: {
    id: 'your_persona_id',
    name: 'Full Name',
    role: 'Role Title',
    company: 'Company Name',
    customerGroup: CUSTOMER_GROUPS.APPROPRIATE_GROUP,
    defaultRoute: '/pages/dashboard.html?view=your-view',
    features: {
      yourFeature: true,
      // ... more features
    }
  }
};
```

#### B. Create Demo Account
**File**: `scripts/auth.js` (add to demo accounts)

```javascript
const DEMO_ACCOUNTS = [
  // ... existing accounts
  {
    company: 'Your Company',
    email: 'email@company.com',
    persona: 'your_persona_id'
  }
];
```

#### C. Create Dashboard
**File**: `scripts/dashboards/your-dashboard.js`

Use existing patterns from other dashboards. Reuse shared components!

#### D. Add Demo Data
**File**: `data/your-data.json`

Create data specific to your persona's needs.

#### E. Create Styles
**File**: `styles/dashboards/your-dashboard.css`

Follow patterns in [standards/CSS-ARCHITECTURE.md](../standards/CSS-ARCHITECTURE.md)

---

## Key Files You'll Touch

### Must Update:
- ✅ `scripts/persona-config.js` - Add persona definition
- ✅ `scripts/auth.js` - Add demo account
- ✅ `scripts/dashboards/your-dashboard.js` - NEW dashboard
- ✅ `data/your-data.json` - NEW demo data
- ✅ `styles/dashboards/your-dashboard.css` - NEW styles

### Reuse (Don't Create):
- ✅ `blocks/loading-overlay/` - For async operations
- ✅ `blocks/wizard-vertical-progress/` - For wizard flows
- ✅ `scripts/fragment-loader.js` - For loading fragments
- ✅ `scripts/utils.js` - Common utilities

---

## Example: Marcus Implementation

**Persona**: Marcus Johnson (General Contractor)  
**Feature**: Project wizard with CCDM filtering  
**Time**: 2 weeks

**What was created**:
1. Added Marcus to `persona-config.js`
2. Created `scripts/dashboards/project-dashboard.js`
3. Created `scripts/builders/project-wizard.js`
4. Created `data/project-wizard-config.json`
5. Added demo account for Marcus
6. Reused: loading-overlay, wizard-vertical-progress

**Result**: Guided wizard with phase selection and CCDM demonstration

---

## Testing Checklist

After implementation:

- [ ] Login as persona works
- [ ] Dashboard loads correctly
- [ ] All features functional
- [ ] CCDM filtering works (if applicable)
- [ ] Customer group pricing displays
- [ ] Mobile responsive
- [ ] No console errors

---

## Need More Detail?

**Full implementation plan**: [PHASES-6B-TO-7-CONSOLIDATED.md](../PHASES-6B-TO-7-CONSOLIDATED.md)  
**Persona profiles**: [personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)  
**What exists**: [what-exists.md](./what-exists.md)  
**Coding standards**: [standards/CODING-PRINCIPLES.md](../standards/CODING-PRINCIPLES.md)

---

**Back to**: [IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)


