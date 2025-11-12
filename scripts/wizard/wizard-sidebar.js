// Wizard Sidebar
// Sidebar management and selection display

import { getWizardState } from '../project-builder.js';
import { getLabel, getProjectDetailLabel, escapeHtml } from '../project-builder-constants.js';
import { el, parseHTML } from './wizard-utils.js';
import { getCurrentStep } from './wizard-core.js';

/**
 * Update sidebar with current selections
 */
export function updateSidebar() {
  try {
    const selectionsContainer = document.getElementById('sidebar-selections');
    const sidebar = document.querySelector('.wizard-sidebar');
    const currentStep = getCurrentStep();

    if (!selectionsContainer) {
      return;
    }

    // Hide sidebar at step 5 (Results)
    if (sidebar) {
      if (currentStep === 5) {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = 'block';
      }
    }

    // Build selections using DOM methods
    selectionsContainer.textContent = '';
    const fragment = document.createDocumentFragment();
    
    const wizardState = getWizardState();
    const selections = [
      { key: 'projectType', label: 'Project Type', getValue: (state) => getLabel('projectType', state.projectType) },
      { key: 'projectDetail', label: 'Details', getValue: (state) => getProjectDetailLabel(state.projectType, state.projectDetail) },
      { key: 'complexity', label: 'Complexity', getValue: (state) => getLabel('complexity', state.complexity) },
      { key: 'budget', label: 'Budget Range', getValue: (state) => getLabel('budget', state.budget) }
    ];

    selections.forEach(({ key, label, getValue }) => {
      if (wizardState[key]) {
        fragment.appendChild(createSelectionElement(label, getValue(wizardState)));
      }
    });

    if (fragment.children.length > 0) {
      selectionsContainer.appendChild(fragment);
    } else {
      selectionsContainer.appendChild(el('p', { className: 'sidebar-empty', textContent: 'Make your selections to see summary' }));
    }
  } catch (error) {
    console.error('Error in updateSidebar:', error);
  }
}

/**
 * Create selection element using HTML template (reduces DOM manipulation)
 * @param {string} label
 * @param {string} value
 * @returns {HTMLElement}
 */
export function createSelectionElement(label, value) {
  const labelEscaped = escapeHtml(label);
  const valueEscaped = escapeHtml(value);
  
  const html = `
    <div class="sidebar-selection">
      <div class="sidebar-selection-label">${labelEscaped}</div>
      <div class="sidebar-selection-value">${valueEscaped}</div>
    </div>
  `;
  
  return parseHTML(html);
}

