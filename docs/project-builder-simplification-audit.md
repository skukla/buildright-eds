# Project Builder Code Simplification Audit

**Date:** 2025-01-27  
**File:** `scripts/project-builder-wizard.js`

## Simplification Opportunities Identified

### 1. **DOM Element Creation Helper** ⭐ High Impact
**Issue:** Repetitive pattern of creating DOM elements:
```javascript
const element = document.createElement('div');
element.className = 'some-class';
element.textContent = 'some text';
parent.appendChild(element);
```

**Occurrences:** ~50+ instances throughout the file

**Solution:** Create a helper function:
```javascript
function el(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  if (props.className) element.className = props.className;
  if (props.textContent !== undefined) element.textContent = props.textContent;
  if (props.id) element.id = props.id;
  if (props.style) Object.assign(element.style, props.style);
  children.forEach(child => element.appendChild(child));
  return element;
}
```

**Impact:** Reduces ~200 lines to ~50 lines

---

### 2. **Wizard State Mapping** ⭐ Medium Impact
**Issue:** Repetitive if/else chain in `selectOption`:
```javascript
if (step === '1') {
  wizardState.projectType = value;
} else if (step === '2') {
  wizardState.projectDetail = value;
} // etc...
```

**Solution:** Use a mapping object:
```javascript
const STEP_STATE_MAP = {
  '1': 'projectType',
  '2': 'projectDetail',
  '3': 'complexity',
  '4': 'budget'
};
wizardState[STEP_STATE_MAP[step]] = value;
```

**Impact:** Reduces 10 lines to 2 lines

---

### 3. **setStepFromUrlParams Simplification** ⭐ Medium Impact
**Issue:** Repetitive code for setting radio buttons:
```javascript
const step1Radio = document.getElementById('wizard-step-1');
const projectTypeRadio = document.querySelector(`input[name="project-type"][value="${projectType}"]`);
if (step1Radio && projectTypeRadio) {
  step1Radio.checked = true;
  projectTypeRadio.checked = true;
}
// Repeated 4 times...
```

**Solution:** Use a loop with configuration:
```javascript
const stepConfig = [
  { step: 1, name: 'project-type', value: projectType },
  { step: 2, name: 'project-detail', value: projectDetail },
  // etc...
];
stepConfig.forEach(({ step, name, value }) => {
  if (!value) return;
  const stepRadio = document.getElementById(`wizard-step-${step}`);
  const valueRadio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (stepRadio && valueRadio) {
    stepRadio.checked = true;
    valueRadio.checked = true;
  }
});
```

**Impact:** Reduces 40 lines to 15 lines

---

### 4. **updateSidebar Selections** ⭐ Low Impact
**Issue:** Repetitive code for creating selection elements:
```javascript
if (wizardState.projectType) {
  hasSelections = true;
  const selectionDiv = createSelectionElement('Project Type', getLabel('projectType', wizardState.projectType));
  fragment.appendChild(selectionDiv);
}
// Repeated 4 times...
```

**Solution:** Use a configuration array:
```javascript
const selections = [
  { key: 'projectType', label: 'Project Type', getValue: (state) => getLabel('projectType', state.projectType) },
  { key: 'projectDetail', label: 'Details', getValue: (state) => getProjectDetailLabel(state.projectType, state.projectDetail) },
  // etc...
];
selections.forEach(({ key, label, getValue }) => {
  if (wizardState[key]) {
    fragment.appendChild(createSelectionElement(label, getValue(wizardState)));
  }
});
```

**Impact:** Reduces 20 lines to 10 lines

---

### 5. **setupRadioListeners Duplication** ⭐ Low Impact
**Issue:** Duplicate setTimeout logic:
```javascript
if (generateOnChange) {
  setTimeout(() => {
    const nextStepRadio = document.getElementById(`wizard-step-${nextStep}`);
    if (nextStepRadio) nextStepRadio.checked = true;
    generateAndShowResults();
  }, WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
} else {
  setTimeout(() => {
    const nextStepRadio = document.getElementById(`wizard-step-${nextStep}`);
    if (nextStepRadio) nextStepRadio.checked = true;
  }, WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
}
```

**Solution:** Extract common logic:
```javascript
const advanceStep = () => {
  const nextStepRadio = document.getElementById(`wizard-step-${nextStep}`);
  if (nextStepRadio) nextStepRadio.checked = true;
  if (generateOnChange) generateAndShowResults();
};
setTimeout(advanceStep, WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
```

**Impact:** Reduces 10 lines to 5 lines

---

### 6. **Group Items by Category** ⭐ Low Impact
**Issue:** Manual grouping logic:
```javascript
const itemsByCategory = {};
bundle.items.forEach(item => {
  const category = item.category || 'Other';
  if (!itemsByCategory[category]) {
    itemsByCategory[category] = [];
  }
  itemsByCategory[category].push(item);
});
```

**Solution:** Use reduce:
```javascript
const itemsByCategory = bundle.items.reduce((acc, item) => {
  const category = item.category || 'Other';
  (acc[category] = acc[category] || []).push(item);
  return acc;
}, {});
```

**Impact:** Reduces 7 lines to 4 lines

---

### 7. **Component Prices Calculation** ⭐ Low Impact
**Issue:** Nested loops:
```javascript
const componentPrices = {};
Object.keys(COMPONENT_GROUPS).forEach(group => {
  componentPrices[group] = 0;
  COMPONENT_GROUPS[group].forEach(cat => {
    if (itemsByCategory[cat]) {
      itemsByCategory[cat].forEach(item => {
        componentPrices[group] += item.subtotal;
      });
    }
  });
});
```

**Solution:** Use reduce/flatMap:
```javascript
const componentPrices = Object.fromEntries(
  Object.entries(COMPONENT_GROUPS).map(([group, categories]) => [
    group,
    categories.flatMap(cat => itemsByCategory[cat] || [])
      .reduce((sum, item) => sum + item.subtotal, 0)
  ])
);
```

**Impact:** Reduces 10 lines to 5 lines

---

### 8. **Error State Creation** ⭐ Low Impact
**Issue:** Manual element creation in `showErrorState`:
```javascript
const errorDiv = document.createElement('div');
errorDiv.className = 'error-message';
const iconSpan = document.createElement('span');
iconSpan.className = 'error-message-icon';
// etc...
```

**Solution:** Use DOM helper function (see #1)

**Impact:** Reduces 30 lines to 10 lines

---

### 9. **Loading State Creation** ⭐ Low Impact
**Issue:** Manual element creation in `generateAndShowResults`:
```javascript
const loadingDiv = document.createElement('div');
loadingDiv.style.textAlign = 'center';
loadingDiv.style.padding = '3rem';
// etc...
```

**Solution:** Use DOM helper function (see #1)

**Impact:** Reduces 10 lines to 3 lines

---

### 10. **Format Category Name** ⭐ Low Impact
**Issue:** Function defined inside `displayBundle` but also used elsewhere:
```javascript
function formatCategoryName(cat) {
  return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
```

**Solution:** Move to module level or constants file

**Impact:** Better organization, no code reduction

---

## Summary

| Opportunity | Current Lines | Simplified Lines | Reduction | Priority |
|------------|---------------|------------------|-----------|----------|
| DOM Helper | ~200 | ~50 | 150 lines | ⭐⭐⭐ High |
| State Mapping | 10 | 2 | 8 lines | ⭐⭐ Medium |
| setStepFromUrlParams | 40 | 15 | 25 lines | ⭐⭐ Medium |
| updateSidebar | 20 | 10 | 10 lines | ⭐ Low |
| setupRadioListeners | 10 | 5 | 5 lines | ⭐ Low |
| Group Items | 7 | 4 | 3 lines | ⭐ Low |
| Component Prices | 10 | 5 | 5 lines | ⭐ Low |
| Error State | 30 | 10 | 20 lines | ⭐ Low |
| Loading State | 10 | 3 | 7 lines | ⭐ Low |
| **TOTAL** | **~337** | **~104** | **~233 lines** | |

**Estimated Reduction:** ~18% of file size (from ~1,584 lines to ~1,351 lines)

**Maintainability Impact:** 
- ✅ Easier to read
- ✅ Less repetitive code
- ✅ Easier to modify DOM creation patterns
- ✅ More consistent code style


