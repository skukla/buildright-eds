# Project Builder - Block Structure

## Overview
The Project Builder has been refactored into an AEM Edge Delivery Services-ready block structure.

## Block Architecture

### One-Level Nesting Approach
```
blocks/
  ├── project-builder/           (Main wizard container)
  │   ├── project-builder.html   (Wizard form, steps, navigation)
  │   ├── project-builder.css    (All wizard styles)
  │   └── project-builder.js     (Block initialization)
  │
  ├── wizard-progress/           (Progress indicator - reusable)
  │   ├── wizard-progress.html
  │   ├── wizard-progress.css
  │   └── wizard-progress.js
  │
  └── wizard-sidebar/            (Summary sidebar - reusable)
      ├── wizard-sidebar.html
      ├── wizard-sidebar.css
      └── wizard-sidebar.js
```

## Block Descriptions

### `project-builder`
**Purpose:** Main wizard container with all step content and navigation

**Contains:**
- Multi-step form with radio button CSS navigation
- Step 1: Project Type selection
- Step 2: Project Details (dynamic based on type)
- Step 3: Complexity level
- Step 4: Budget range
- Step 5: Results/Bundle display
- Navigation controls (back, start over, print)

**Dependencies:**
- `wizard-progress` block for progress indicator
- `wizard-sidebar` block for project summary
- `project-builder-wizard.js` module for state management

### `wizard-progress`
**Purpose:** Visual progress indicator for wizard steps

**Features:**
- 5-step progress bar
- Active/completed/future state styling
- Clickable navigation for completed steps
- Animated progress bar

**Reusability:** Can be used in other multi-step processes

### `wizard-sidebar`
**Purpose:** Live project summary display

**Features:**
- Shows user selections as they progress
- Updates dynamically with each step
- Sticky positioning on desktop
- Responsive (moves to top on mobile)

**Reusability:** Can display summaries for other forms/processes

## CSS Organization

All wizard-specific CSS is consolidated in `blocks/project-builder/project-builder.css` (1,533 lines), including:
- Wizard container and layout
- Step content styling
- Navigation controls
- Photo-based and icon-based option styles
- Responsive breakpoints
- Print styles

The `wizard-progress` and `wizard-sidebar` blocks have their own minimal CSS files for component-specific styling.

## JavaScript Modules

**Block initialization:**
- `blocks/project-builder/project-builder.js`
- `blocks/wizard-progress/wizard-progress.js`
- `blocks/wizard-sidebar/wizard-sidebar.js`

**Wizard logic (existing modules):**
- `scripts/project-builder-wizard.js` - Main orchestrator
- `scripts/wizard/wizard-core.js` - Core logic
- `scripts/wizard/wizard-bundle-generation.js` - Bundle creation
- `scripts/wizard/wizard-bundle-display.js` - Results display
- `scripts/wizard/wizard-list-views.js` - Item list management
- `scripts/wizard/wizard-ui-components.js` - UI helpers
- `scripts/wizard/wizard-utils.js` - Utilities

## Page Implementation

In `pages/project-builder.html`:

```html
<head>
  <!-- Block CSS -->
  <link rel="stylesheet" href="blocks/project-builder/project-builder.css">
  <link rel="stylesheet" href="blocks/wizard-progress/wizard-progress.css">
  <link rel="stylesheet" href="blocks/wizard-sidebar/wizard-sidebar.css">
</head>
<body>
  <!-- Wizard structure remains in page HTML for now -->
  <!-- Future: Can be replaced with block placeholders for AEM authoring -->
  <div class="wizard-container">
    <form class="wizard-form" id="wizard-form">
      <!-- Progress block content -->
      <div class="wizard-progress">...</div>
      
      <!-- Wizard layout with main content and sidebar -->
      <div class="wizard-layout">
        <div class="wizard-main">
          <!-- Step content -->
        </div>
        
        <!-- Sidebar block content -->
        <div class="wizard-sidebar">...</div>
      </div>
    </form>
  </div>
</body>
```

## Benefits of This Structure

1. **EDS-Ready:** Blocks follow AEM EDS conventions
2. **Maintainable:** Clear separation of concerns
3. **Reusable:** Progress and sidebar can be used elsewhere
4. **Modular:** Each block is self-contained
5. **No Deep Nesting:** Simple one-level block structure
6. **Testable:** Blocks can be tested independently

## Migration Notes

- **CSS Reduction:** `project-builder.html` went from 2,042 lines to 512 lines
- **Removed:** 1,530 lines of embedded CSS (now in block files)
- **Maintained:** All existing functionality and JavaScript modules
- **No Breaking Changes:** Wizard behavior remains identical

## Future Enhancements

For full AEM EDS authoring, consider:
1. Converting wizard steps to dynamic blocks
2. Making step content authorable in Word/Google Docs
3. Creating block variants for different wizard types
4. Adding block configuration via metadata

## Testing

Test the Project Builder at:
- Local: `http://localhost:8000/pages/project-builder.html`
- GitHub Pages: `https://[user].github.io/buildright-eds/pages/project-builder.html`

Verify:
- ✅ All 5 steps display correctly
- ✅ Progress indicator updates
- ✅ Sidebar shows selections
- ✅ Bundle generates on step 5
- ✅ Navigation works (back, start over)
- ✅ Item removal and quantity controls function
- ✅ Print functionality works
- ✅ Responsive design on mobile

