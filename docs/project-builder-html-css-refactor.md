# Project Builder: HTML/CSS Refactoring Analysis

## Current JavaScript-Heavy Areas

### 1. **Step Navigation** (High Priority - Easy Win)
**Current:** JavaScript shows/hides steps using `.active` class and `display: none/block`
**Can Replace With:** Radio button group + CSS `:checked` pseudo-class

**Implementation:**
- Wrap wizard in `<form>` with radio buttons for each step
- Use CSS `:checked` to show/hide step content
- Use CSS `:has()` to update progress indicators

**Benefits:**
- No JS needed for basic navigation
- Browser handles state
- Better accessibility (keyboard navigation)
- Works without JS

### 2. **Option Selection** (High Priority - Easy Win)
**Current:** JavaScript click handlers add `.selected` class
**Can Replace With:** Radio buttons/checkboxes with CSS styling

**Implementation:**
- Convert `.wizard-option` divs to `<label>` wrapping radio buttons
- Hide radio buttons visually with CSS
- Style labels to look like current cards
- Use `:checked` pseudo-class for selected state

**Benefits:**
- Native form behavior
- No JS event listeners needed
- Better form submission handling
- Accessible by default

### 3. **Step 2 Dynamic Content** (Medium Priority - Moderate Complexity)
**Current:** JavaScript dynamically populates Step 2 options based on Step 1 selection
**Can Replace With:** Multiple hidden sections + CSS `:has()` or radio button groups

**Implementation Options:**
- **Option A:** Pre-render all Step 2 variants, hide with CSS, show with `:has(:checked)` on Step 1
- **Option B:** Use CSS `:has()` to conditionally show sections based on Step 1 selection
- **Option C:** Keep minimal JS just for Step 2 population (acceptable compromise)

**Recommendation:** Option A - Pre-render all variants, use CSS to show/hide

### 4. **Progress Bar** (Medium Priority)
**Current:** JavaScript calculates width and position dynamically
**Can Replace With:** CSS with `:checked` states and CSS Grid/Flexbox

**Implementation:**
- Use CSS Grid or Flexbox for progress bar
- Use `:checked` pseudo-class to determine progress percentage
- CSS `calc()` for width calculations

**Benefits:**
- Smooth CSS transitions
- No JS calculations
- More performant

### 5. **Navigation Buttons** (Low Priority - Easy Win)
**Current:** JavaScript shows/hides Back/Start Over/Print buttons
**Can Replace With:** CSS based on step state

**Implementation:**
- Use CSS `:has()` or adjacent sibling selectors
- Hide/show based on which step radio is checked

### 6. **Modal Dialogs** (Low Priority - Easy Win)
**Current:** JavaScript toggles `.active` class
**Can Replace With:** CSS `:target` pseudo-class

**Implementation:**
- Use hash links (`#modal-id`)
- CSS `:target` to show modal
- Close button links to `#`

**Benefits:**
- Browser back button works
- No JS needed
- Better UX

### 7. **Form Validation** (Medium Priority)
**Current:** JavaScript validation
**Can Replace With:** HTML5 validation attributes

**Implementation:**
- Add `required`, `pattern`, `min`, `max` attributes
- Use `:invalid` and `:valid` pseudo-classes for styling
- Keep JS only for custom validation messages if needed

## What MUST Stay in JavaScript

1. **Bundle Generation** - Dynamic product recommendations require JS
2. **State Persistence** - localStorage/sessionStorage for saving progress
3. **URL Parameter Parsing** - For deep linking and sharing
4. **Dynamic Content Loading** - Product data, tips, resources
5. **Cart Integration** - Adding bundles to cart
6. **Print Functionality** - Generating printable summary

## Recommended Refactoring Order

### Phase 1: Quick Wins (High Impact, Low Effort)
1. Convert option selection to radio buttons
2. Convert step navigation to radio button group
3. Use CSS for show/hide instead of JS

### Phase 2: Medium Effort
4. Pre-render Step 2 variants, use CSS to show/hide
5. Convert progress bar to CSS-based
6. Convert navigation buttons to CSS-based

### Phase 3: Polish
7. Convert modals to `:target` approach
8. Add HTML5 form validation
9. Optimize remaining JS (keep only essential)

## Example: Radio Button Approach

```html
<!-- Step Navigation -->
<form class="wizard-form">
  <input type="radio" name="wizard-step" id="step-1" value="1" checked>
  <input type="radio" name="wizard-step" id="step-2" value="2">
  <input type="radio" name="wizard-step" id="step-3" value="3">
  <input type="radio" name="wizard-step" id="step-4" value="4">
  <input type="radio" name="wizard-step" id="step-5" value="5">

  <!-- Step Content -->
  <div class="wizard-step-content" data-step="1">
    <!-- Step 1 content -->
  </div>
  <div class="wizard-step-content" data-step="2">
    <!-- Step 2 content -->
  </div>
  <!-- etc -->
</form>
```

```css
/* Hide radio buttons visually */
.wizard-form input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Show step based on checked radio */
.wizard-step-content {
  display: none;
}

#step-1:checked ~ .wizard-step-content[data-step="1"],
#step-2:checked ~ .wizard-step-content[data-step="2"],
#step-3:checked ~ .wizard-step-content[data-step="3"],
#step-4:checked ~ .wizard-step-content[data-step="4"],
#step-5:checked ~ .wizard-step-content[data-step="5"] {
  display: block;
}

/* Update progress indicators */
#step-1:checked ~ .wizard-progress .wizard-step[data-step="1"],
#step-2:checked ~ .wizard-progress .wizard-step[data-step="2"] {
  /* Active styles */
}
```

## Estimated Impact

- **Current JS:** ~800 lines
- **After Refactor:** ~400-500 lines (50% reduction)
- **Performance:** Faster initial load, less JS parsing
- **Accessibility:** Significantly improved (native form controls)
- **Maintainability:** Easier to maintain (less JS logic)

