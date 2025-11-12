// Wizard Selection
// Option selection handling and auto-advancement

import { getWizardState, saveWizardState } from '../project-builder.js';
import { WIZARD_CONSTANTS, STEP_STATE_MAP } from '../project-builder-constants.js';
import { handleError } from './wizard-utils.js';
import { updateSidebar } from './wizard-sidebar.js';

/**
 * Centralized function to handle option selection and advancement
 * @param {string} step - Step number
 * @param {string} value - Selected value
 * @param {Function} showStep - Function to show step
 * @param {Function} advanceToNextStep - Function to advance to next step
 */
export function handleOptionSelection(step, value, showStep, advanceToNextStep) {
  try {
    if (!step || !value) {
      console.warn('handleOptionSelection called with invalid parameters');
      return;
    }

    const stepContent = document.querySelector(`[data-step="${step}"]`);
    if (!stepContent) {
      console.error(`Step ${step} content not found`);
      return;
    }

    // Update visual selection
    stepContent.querySelectorAll('.wizard-option, .wizard-option-photo').forEach(opt => opt.classList.remove('selected'));
    
    const radioInput = stepContent.querySelector(`input[type="radio"][value="${value}"]`);
    if (radioInput) {
      const option = radioInput.closest('.wizard-option, .wizard-option-photo');
      if (option) {
        option.classList.add('selected');
      }
    }

    // Save to state
    const wizardState = getWizardState() || {};
    const stateKey = STEP_STATE_MAP[step];
    if (stateKey) {
      wizardState[stateKey] = value;
      // Reset projectDetail when projectType changes
      if (step === '1') {
        wizardState.projectDetail = null;
      }
    }

    wizardState.currentStep = parseInt(step);
    saveWizardState(wizardState);
    updateSidebar();

    // Advance to next step after a short delay
    setTimeout(() => {
      if (advanceToNextStep) {
        advanceToNextStep(step);
      }
    }, WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
  } catch (error) {
    handleError(error, 'handleOptionSelection');
  }
}

/**
 * Centralized function to advance to the next step
 * @param {string|number} currentStep - Current step number
 * @param {Function} showStep - Function to show step
 * @param {Function} generateAndShowResults - Function to generate and show results
 */
export function advanceToNextStep(currentStep, showStep, generateAndShowResults) {
  try {
    const wizardState = getWizardState() || {};
    const stepNum = parseInt(currentStep);
    
    // Step validation mapping
    const stepValidations = {
      1: () => wizardState.projectType,
      2: () => wizardState.projectDetail,
      3: () => wizardState.complexity,
      4: () => wizardState.budget
    };
    
    // Validate current step has required data
    const validate = stepValidations[stepNum];
    if (!validate || !validate()) return;

    // Step advancement mapping
    const stepActions = {
      1: () => {
        const step2Radio = document.getElementById('wizard-step-2');
        if (step2Radio) step2Radio.checked = true;
        if (showStep) showStep(2);
      },
      2: () => {
        const step3Radio = document.getElementById('wizard-step-3');
        if (step3Radio) step3Radio.checked = true;
        if (showStep) showStep(3);
      },
      3: () => {
        const step4Radio = document.getElementById('wizard-step-4');
        if (step4Radio) step4Radio.checked = true;
        if (showStep) showStep(4);
      },
      4: () => {
        const step5Radio = document.getElementById('wizard-step-5');
        if (step5Radio) step5Radio.checked = true;
        // Step 4: Generate bundle - wait for sidebar to render before transitioning
        requestAnimationFrame(() => {
          if (generateAndShowResults) {
            generateAndShowResults();
          }
        });
      }
    };
    
    const action = stepActions[stepNum];
    if (action) action();
  } catch (error) {
    handleError(error, 'advanceToNextStep');
  }
}

/**
 * Setup radio button listeners
 * @param {string} name - Radio button name attribute
 * @param {string} step - Step number
 * @param {number} nextStep - Next step number
 * @param {Function} handleOptionSelection - Function to handle option selection
 */
export function setupRadioListeners(name, step, nextStep, handleOptionSelection) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
    // Handle new selections via change event
    radio.addEventListener('change', function() {
      if (this.checked && handleOptionSelection) {
        handleOptionSelection(step, this.value);
      }
    });
    
    // Handle re-clicks on already selected options
    const optionContainer = radio.closest('.wizard-option, .wizard-option-photo');
    if (optionContainer) {
      optionContainer.addEventListener('click', function(e) {
        // Check if radio was already checked before this click
        const wasAlreadyChecked = radio.checked;
        
        // Wait for radio state to update, then handle re-click
        setTimeout(() => {
          if (wasAlreadyChecked && radio.checked && handleOptionSelection) {
            // Re-click detected - trigger selection and advancement
            handleOptionSelection(step, radio.value);
          }
        }, 0);
      });
    }
  });
}

