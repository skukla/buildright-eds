# Quick Reference: What's Already Built

**⏱️ Reading time**: 3 minutes

This is your inventory of reusable components, existing systems, and demo data.

---

## 🎨 Shared Components (Reuse These!)

### 1. **Loading Overlay** 
**Location**: `blocks/loading-overlay/`  
**Use for**: Async operations, CCDM filtering  
**API**: `showLoading(message, details)`, `hideLoading()`  
**Example**: "Filtering to products for your deck..."

### 2. **Wizard Vertical Progress**
**Location**: `blocks/wizard-vertical-progress/`  
**Use for**: Multi-step wizards (Marcus, David)  
**API**: `initialize(steps)`, `setActiveStep(index)`  
**States**: pending, active, completed, disabled

### 3. **Product Tile**
**Location**: `blocks/product-tile/`  
**Use for**: Product grids, search results  
**Features**: Image, name, SKU, price, tier pricing badge

### 4. **Template Card**
**Location**: `blocks/template-card/`  
**Use for**: Floor plan templates, pre-defined packages  
**Features**: Image, specifications, statistics

### 5. **Package Comparison**
**Location**: `blocks/package-comparison/`  
**Use for**: Good/Better/Best displays (Lisa)  
**Features**: Side-by-side comparison, feature lists

**See**: [phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY.md)

---

## 🔐 Authentication & Personas

### Demo Accounts

| Company | Email | Persona |
|---------|-------|---------|
| Sunbelt Homes | sarah.martinez@sunbelthomes.com | Sarah (Production Builder) |
| Custom Builders LLC | marcus.johnson@custombuilders.com | Marcus (General Contractor) |
| Elite Remodeling | lisa.chen@eliteremodeling.com | Lisa (Remodeling Contractor) |
| Thompson Residence | david.thompson@gmail.com | David (DIY Homeowner) |
| Precision Lumber | kevin.rodriguez@precisionlumber.com | Kevin (Store Manager) |

**Password**: Any (demo mode)

### Auth Service
**Location**: `scripts/auth.js`  
**Features**: Persona detection, login/logout, session management  
**API**: `loginWithPersona(id)`, `logout()`, `getCurrentUser()`

**See**: [phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md)

---

## 🧩 Fragments (15 Available)

### Persona-Specific Hero Fragments (6)
- `/fragments/hero-sarah.html`
- `/fragments/hero-marcus.html`
- `/fragments/hero-lisa.html`
- `/fragments/hero-david.html`
- `/fragments/hero-kevin.html`
- `/fragments/hero-default.html`

### Persona-Specific Features (5)
- `/fragments/features-sarah.html`
- `/fragments/features-marcus.html`
- `/fragments/features-lisa.html`
- `/fragments/features-david.html`
- `/fragments/features-kevin.html`

### Shared Fragments (4)
- `/fragments/footer-buildright.html`
- `/fragments/support-links.html`
- `/fragments/legal-disclaimer.html`
- `/fragments/promo-banner.html`

**API**: `loadFragment(container, path)`, `loadFragments(fragments[])`  
**Location**: `scripts/fragment-loader.js`

**See**: [phase-0-5-foundation/FRAGMENT-IMPLEMENTATION-SUMMARY.md](../phase-0-5-foundation/FRAGMENT-IMPLEMENTATION-SUMMARY.md)

---

## 🏗️ Core Architecture

### Persona Configuration
**Location**: `scripts/persona-config.js`  
**Defines**: All 5 personas, customer groups, features, preferences

### Mock ACO Service
**Location**: `scripts/aco-service.js`  
**Features**: Product queries, pricing, CCDM policies, catalog views  
**Mimics**: Real ACO API format for seamless production transition

### Data Mock
**Location**: `scripts/data-mock.js`  
**Features**: Customer context, pricing logic, product lookups

**See**: [phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY.md)

---

## 📦 Mock Data Files

### Products
- `data/mock-products.json` (70 products)
- Attributes: SKU, name, description, price, images, custom attributes

### Store Inventory
- `data/store-inventory.json` (Kevin's multi-location inventory)
- 3 Texas locations: Austin, San Antonio, Houston

### Templates
- `data/templates.json` (Sarah's 6 floor plan templates)
- Arizona-themed: Sedona, Prescott, Flagstaff, Tucson, Phoenix, Scottsdale

---

## 🎨 Coding Patterns Established

### CSS/JS Separation (Phase 1)
✅ **DO**: Use CSS classes (`.hidden`, `.show-flex`, `.no-scroll`)  
❌ **DON'T**: Use inline styles (`element.style.display = 'none'`)

### Pure CSS Positioning (Phase 2)
✅ **DO**: Use CSS `position: absolute` with parent wrapper  
❌ **DON'T**: Use JavaScript positioning with `getBoundingClientRect()`

### Event Handling
✅ **DO**: Use `safeAddEventListener()` for automatic cleanup  
❌ **DON'T**: Add listeners without cleanup strategy

**See**: 
- [phase-0-5-foundation/PHASE_1_COMPLETE.md](../phase-0-5-foundation/PHASE_1_COMPLETE.md)
- [phase-0-5-foundation/PHASE-2-FINAL-SUMMARY.md](../phase-0-5-foundation/PHASE-2-FINAL-SUMMARY.md)

---

## 🛠️ Utilities Available

**Location**: `scripts/utils.js`

### Actively Used (7 functions):
1. `getUrlParameter(name)` - Get URL query params
2. `loadBlockHTML(path)` - Load block HTML
3. `parseHTML(html)` - Parse HTML string to DOM
4. `parseHTMLFragment(html)` - Parse HTML fragment
5. `safeAddEventListener()` - Add listener with cleanup
6. `cleanupEventListeners()` - Remove all listeners
7. `cleanElementListeners(element)` - Remove element listeners

**See**: [phase-0-5-foundation/PHASE_4_COMPLETE.md](../phase-0-5-foundation/PHASE_4_COMPLETE.md)

---

## 📐 Design System

### CSS Variables
**Location**: `styles/base.css`

Key variables:
- Colors: `--color-brand-500`, `--color-neutral-*`
- Spacing: `--spacing-small/medium/large`
- Typography: `--type-heading-*/body-*`
- Borders: `--shape-border-radius-*`
- Shadows: `--shape-shadow-*`

### Component Patterns
**Location**: `standards/COMPONENT-DESIGN-LIBRARY.md`

Documented patterns for cards, buttons, forms, modals, etc.

**See**: [standards/CSS-ARCHITECTURE.md](../standards/CSS-ARCHITECTURE.md)

---

## 🧪 Testing Resources

### Testing Checklist
**Location**: `testing/PAGE-AUDIT-CHECKLIST.md`

Covers: Visual QA, functionality, responsive design, performance, accessibility

### Testing Guide
**Location**: `testing/TESTING-GUIDE.md`

Strategies for unit, integration, E2E, and persona-specific testing

---

## 🎯 Customer Groups (6)

1. **Commercial-Tier1** - Large production builders
2. **Commercial-Tier2** - Mid-size production builders (Sarah)
3. **Residential-Builder** - Custom home builders (Marcus)
4. **Pro-Specialty** - Remodeling contractors (Lisa)
5. **Retail-Homeowner** - DIY homeowners (David)
6. **Wholesale-Reseller** - Retail store buyers (Kevin)

**Each has**: Differentiated pricing, catalog views, CCDM policies

---

## 📊 Quick Stats

- ✅ **5 personas defined**
- ✅ **5 shared components**
- ✅ **15 fragments**
- ✅ **5 demo accounts**
- ✅ **70 products**
- ✅ **6 customer groups**
- ✅ **6 floor plan templates**
- ✅ **3 store locations**

---

## Need More Detail?

**Component APIs**: [phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY.md)  
**Auth & demo accounts**: [phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md)  
**Fragments**: [phase-0-5-foundation/FRAGMENT-IMPLEMENTATION-SUMMARY.md](../phase-0-5-foundation/FRAGMENT-IMPLEMENTATION-SUMMARY.md)  
**Core architecture**: [phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY.md](../phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY.md)

---

**Back to**: [IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)


