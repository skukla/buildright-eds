# Kit Mode Architecture Analysis

## Current State Analysis

### Session Storage Keys
1. **`buildright_wizard_state`** - Contains bundle data and custom items
2. **`kit_mode_resume_choice`** - Values: `'edit'`, `'shop'`, or `null`
3. **`buildright_kit_sidebar_expanded`** - UI state for sidebar

### Current Flow
```
User starts Project Builder
  → Steps 1-4: Configure project
  → Step 5: Review bundle
    → Can add to cart directly
    → Can "Browse Catalog" which sets kit_mode_resume_choice='edit'
  → Navigate to catalog with kit_mode_resume_choice='edit'
    → Kit sidebar appears
    → Can add/remove items
  → User can "Exit Kit Mode"
  → User can "Add All to Cart"
```

### Key Questions

## 1. What Defines "Kit Mode"?

**Current Implementation:**
- Kit Mode = `kit_mode_resume_choice === 'edit'` + sidebar visible on catalog pages

**Problem:**
- Unclear distinction between "has a kit" vs "actively editing a kit"
- Step 5 and Kit Sidebar show similar content but in different contexts

**Proposed Mental Model:**

### Kit Lifecycle States

1. **Draft Kit (Building)**
   - Location: Project Builder Steps 1-5
   - State: `buildright_wizard_state` exists but not "completed"
   - UI: Project Builder wizard
   - User is actively configuring the bundle

2. **Active Kit (Shopping/Editing)**
   - Location: Catalog pages with kit sidebar
   - State: `kit_mode_resume_choice === 'edit'`
   - UI: Kit sidebar visible, can add/remove items
   - User is actively customizing the kit while browsing

3. **Completed Kit (In Cart)**
   - Location: Cart page
   - State: Kit added to cart, wizard state can be cleared
   - UI: Bundle item in cart
   - Kit is "finalized" for this shopping session

4. **No Kit**
   - State: No `buildright_wizard_state` or empty
   - UI: Normal catalog browsing
   - User is shopping without a project context

## 2. Is Step 5 the "Product Detail Page" for a Kit?

**YES - This is the right mental model!**

### Analogy to Regular Products

| Regular Product Flow | Kit/Bundle Flow |
|---------------------|-----------------|
| Browse Catalog | Project Builder Steps 1-4 |
| Click Product | Generate Bundle (Step 4→5) |
| Product Detail Page | **Project Builder Step 5** |
| Customize variants/qty | Add custom items from catalog |
| Add to Cart | Add All to Cart |

### Step 5 Should Be:
- The "canonical" view of the kit/bundle
- Where user reviews and finalizes the kit
- Where primary "Add to Cart" action happens
- The "Product Detail" for this dynamic bundle

## 3. Kit Mode Should Be:

**"Extended Product Customization Mode"**

Think of it as:
- An extended PDP experience that spans multiple pages
- User is still "on" the kit's PDP, but can browse catalog to customize
- Kit sidebar = Mini PDP that follows you around
- "Exit Kit Mode" = Leave this extended PDP experience

## 4. Proposed Architecture

### State Management

```javascript
// buildright_wizard_state structure
{
  // Configuration (Steps 1-4)
  projectType: 'bathroom_remodel',
  projectDetail: 'full',
  complexity: 'professional',
  budget: 5000,
  
  // Bundle Definition (Generated at Step 4→5)
  bundle: {
    bundleId: 'bundle-123',
    projectName: 'Bathroom Basic Project Kit',
    items: [...],
    totalPrice: 378.50,
    itemCount: 6,
    createdAt: '2024-01-15T...',
    completedAt: null, // Set when user finalizes/adds to cart
  },
  
  // Custom Additions (Added during Kit Mode)
  customItems: [
    { sku: 'PROD-789', quantity: 2, reason: 'Added from catalog', ... }
  ],
  
  // Current Step (for resuming wizard)
  currentStep: 5
}
```

### Mode Definitions

#### 1. **Draft Mode** (Building in Project Builder)
- **When:** User is in Project Builder, Steps 1-5
- **Flag:** `currentStep < 5` or just entered Step 5
- **Behavior:**
  - Can navigate between wizard steps
  - Can modify configuration
  - Step 5 shows bundle review

#### 2. **Kit Mode** (Active Editing/Shopping)
- **When:** User clicks "Browse Catalog" from Step 5
- **Flag:** `kit_mode_resume_choice === 'edit'`
- **Behavior:**
  - Kit sidebar visible on catalog pages
  - Can add/remove items
  - Can navigate freely
  - "Return to Kit" goes back to Step 5 (the PDP)
  - "Add All to Cart" completes the kit

#### 3. **Completed** (Added to Cart)
- **When:** User adds kit to cart
- **Flag:** `bundle.completedAt` is set
- **Behavior:**
  - Clear wizard state
  - Clear kit_mode_resume_choice
  - Return to normal browsing

### User Flows

#### Flow A: Quick Add (No Customization)
```
Project Builder Steps 1-4
  → Step 5 (Kit PDP)
  → "Add All to Cart"
  → Cart (Completed)
```

#### Flow B: Browse & Customize
```
Project Builder Steps 1-4
  → Step 5 (Kit PDP)
  → "Browse Catalog for More Items"
    → ENTER KIT MODE
    → Kit sidebar appears
    → Browse/add items
  → "View Full Kit" in sidebar
    → RETURN TO STEP 5 (Kit PDP)
    → Review full kit
  → "Add All to Cart"
    → EXIT KIT MODE
    → Cart (Completed)
```

#### Flow C: Resume Later
```
User exits browser
  → Returns to catalog
  → Resume banner appears: "You have a kit in progress"
  → Option 1: "Resume Editing"
    → ENTER KIT MODE
    → Kit sidebar appears
  → Option 2: "Start Fresh"
    → CLEAR STATE
    → Normal browsing
```

## 5. Kit Sidebar Functions

### Current Issues
- "Add All to Cart" button duplicates Step 5 functionality
- "Exit Kit Mode" is ambiguous
- Not clear how to return to Step 5

### Proposed Kit Sidebar

**Purpose:** Mini-PDP / Quick summary while browsing

**Primary Actions:**
1. **"View Full Kit"** → Navigate to Step 5 (the full PDP)
2. **"Exit Kit Mode"** → Clear kit_mode_resume_choice, stay on catalog

**Secondary Actions:**
- Add/remove items inline
- Adjust quantities
- See total

**Remove:**
- "Add All to Cart" (should only be on Step 5, the canonical PDP)

## 6. Step 5 Enhancements

**Treat as Full Product Detail Page:**

1. **Hero Section**
   - Kit name (editable?)
   - Total price
   - Item count
   - Project details (type, complexity, etc.)

2. **Items List**
   - All bundle items + custom items
   - Quantity controls
   - Remove options
   - Category grouping

3. **Actions**
   - **Primary:** "Add All to Cart" → Complete the kit
   - **Secondary:** "Browse Catalog for More Items" → Enter Kit Mode
   - **Tertiary:** "Save Kit" / "Print" / "Share"

4. **Metadata**
   - Educational content
   - Resource links
   - Project notes

## 7. Implementation Changes Needed

### High Priority
1. Remove "Add All to Cart" from kit sidebar
2. Add "View Full Kit" button to return to Step 5
3. Clarify "Exit Kit Mode" behavior
4. Ensure Step 5 is the canonical place to add to cart

### Medium Priority
5. Add visual distinction: Step 5 = Full PDP, Sidebar = Mini view
6. Improve navigation: Kit Mode breadcrumb/indicator
7. Add "completed" state to bundle
8. Clear wizard state when kit added to cart (or save to "order history")

### Low Priority
9. Kit naming/editing in Step 5
10. Save multiple kits (not just one active kit)
11. Share/export kit functionality

## 8. Terminology Clarification

| Term | Meaning |
|------|---------|
| **Bundle** | The recommended items from Project Builder algorithm |
| **Kit** | Bundle + any custom items user added |
| **Draft Kit** | Kit being configured in Project Builder |
| **Active Kit** | Kit in "Kit Mode" (being customized while browsing) |
| **Completed Kit** | Kit that's been added to cart |
| **Kit Mode** | Extended PDP mode where user can browse and customize |
| **Step 5** | The "Product Detail Page" for the kit |

## 9. Cart Integration: Editing Kits

### The Problem
If "Add All to Cart" is available in the kit sidebar, users can add kits to cart. But what happens when they want to view/edit that kit?

### The Solution: Cart → Kit PDP Flow

**Mental Model:** Clicking a bundle in the mini cart = Opening its Product Detail Page

```
User clicks bundle in mini cart
  → Load bundle data into wizard state
  → Navigate to project-builder.html?edit=bundleId
  → Project Builder loads Step 5 with bundle data
  → User views/edits kit (Kit PDP)
  → Button changes: "Update Cart" (not "Add All to Cart")
  → Clicking "Update Cart" UPDATES existing cart bundle (doesn't create new one)
```

### Implementation Requirements

#### 1. Bundle Identity
- Each bundle needs persistent `bundleId`
- Bundle in cart maintains same `bundleId`
- When editing, track which cart bundle we're editing

#### 2. Edit Mode Detection
```javascript
// New state flags
{
  bundle: {
    bundleId: 'bundle-123',
    inCart: true,  // NEW: Is this bundle currently in cart?
    isEditing: true,  // NEW: Are we editing existing cart bundle?
    // ... rest of bundle data
  }
}
```

#### 3. Navigation Flow
```javascript
// Mini cart bundle item becomes a link:
<a href="pages/project-builder.html?edit=bundle-123">
  View/Edit Kit
</a>

// On project-builder.html load:
const urlParams = new URLSearchParams(window.location.search);
const editBundleId = urlParams.get('edit');

if (editBundleId) {
  const bundle = getBundleFromCart(editBundleId);
  if (bundle) {
    loadBundleIntoWizardState(bundle);
    showStep(5); // Go directly to Kit PDP
  }
}
```

#### 4. Button States on Step 5

```javascript
if (bundle.isEditing && bundle.inCart) {
  // Editing existing cart bundle
  buttonText = "Update Cart";
  buttonAction = () => updateBundleInCart(bundle.bundleId, bundle);
} else if (bundle.inCart) {
  // Viewing cart bundle (read-only?)
  buttonText = "Already in Cart";
  buttonDisabled = true;
} else {
  // New bundle
  buttonText = "Add All to Cart";
  buttonAction = () => addBundleToCart(bundle);
}
```

#### 5. Update vs Add Logic

```javascript
// New function: Update existing bundle in cart
export function updateBundleInCart(bundleId, updatedBundle) {
  const cart = getCart();
  const index = cart.findIndex(item => 
    item.bundleId === bundleId && item.type === 'bundle'
  );
  
  if (index !== -1) {
    // Update existing bundle
    cart[index] = {
      ...cart[index],
      items: updatedBundle.items,
      customItems: updatedBundle.customItems,
      totalPrice: updatedBundle.totalPrice,
      itemCount: updatedBundle.itemCount,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('buildright_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
}
```

### User Flows with Cart Editing

#### Flow D: Edit Cart Bundle
```
Cart page or Mini cart
  → Click "View/Edit" on bundle
  → Navigate to Step 5 (Kit PDP) in edit mode
  → Make changes (add/remove items)
  → "Update Cart" button
  → Returns to cart with updated bundle
```

#### Flow E: Add Multiple Kits
```
Create Kit #1 → Add to Cart
  → Start new Project Builder
  → Create Kit #2 → Add to Cart
  → Cart now has 2 distinct bundles
  → Can edit each independently
```

## 10. Mini Cart Bundle Display

### Current State
Mini cart shows bundle as a single line item with item count

### Enhanced State (Recommended)

```html
<div class="mini-cart-bundle">
  <div class="mini-cart-bundle-header">
    <a href="pages/project-builder.html?edit=bundle-123" class="mini-cart-bundle-name">
      Bathroom Basic Project Kit
    </a>
    <span class="mini-cart-bundle-count">6 items</span>
  </div>
  <div class="mini-cart-bundle-price">$378.50</div>
  <div class="mini-cart-bundle-actions">
    <a href="pages/project-builder.html?edit=bundle-123" class="btn-link">
      View/Edit
    </a>
    <button onclick="removeBundle('bundle-123')">Remove</button>
  </div>
</div>
```

### Clicking Bundle Behavior

**Option A: Direct Navigation (Recommended)**
- Click anywhere on bundle → Navigate to Step 5 (Kit PDP)
- User can view/edit full kit
- Clear "Back" navigation to cart

**Option B: Expand/Collapse**
- Click to expand and show all items inline
- "Edit Kit" button navigates to Step 5
- More clicks required

**Recommendation:** Option A - treat bundle like a product with its own PDP

## Summary

**Key Insight:** Step 5 IS the Product Detail Page for kits.

- Project Builder = Product Configuration
- Step 5 = Product Detail Page (canonical kit view)
- Kit Mode = Extended PDP experience (browse while customizing)
- Kit Sidebar = Mini PDP (quick reference/edits)
- Cart = Completed kit (with "Edit" back to Step 5)
- **Cart Bundle Links → Kit PDP (Step 5)** for viewing/editing

This mental model makes the UX much clearer and aligns with e-commerce patterns users already understand. Bundles in cart are just like any other product - they have a PDP where you can view and edit them.

