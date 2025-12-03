// Wizard Core
// Core wizard state and navigation functions

import { getWizardState, saveWizardState, clearWizardState, getFullKit, hasKitItems } from '../project-builder.js';
import { handleError } from './wizard-utils.js';
import { STEP_STATE_MAP } from '../project-builder-constants.js';
import { parseHTML } from '../utils.js';

// Current step tracker (can be overridden by state)
let currentStep = 1;

/**
 * Get current step
 * @returns {number}
 */
export function getCurrentStep() {
  const state = getWizardState();
  return state.currentStep || currentStep || 1;
}

/**
 * Set current step
 * @param {number} step
 */
export function setCurrentStep(step) {
  currentStep = step;
  const state = getWizardState();
  state.currentStep = step;
  saveWizardState(state);
}

/**
 * Initialize wizard
 * @param {Function} setupEventListeners - Function to setup event listeners
 * @param {Function} showResults - Function to show results
 * @param {Function} showStep - Function to show step (with callbacks)
 */
export async function initWizard(setupEventListeners, showResults, showStep) {
  try {
    const scriptBase = window.BASE_PATH || (window.location.pathname.includes('/buildright-eds/') ? '/buildright-eds/' : '/');
    const { parseProjectBuilderPath } = await import(`${scriptBase}scripts/url-router.js`);
    
    let wizardState = getWizardState() || {};
    
    // Check for path-based parameters first (from Shop By Job links)
    const pathInfo = parseProjectBuilderPath(window.location.pathname);
    const projectType = pathInfo.projectType;
    const projectDetail = pathInfo.projectDetail;
    
    // Check URL query params for backward compatibility and edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const complexity = urlParams.get('complexity');
    const budget = urlParams.get('budget');
    const continueSession = urlParams.get('continue');
    const editBundleId = urlParams.get('edit'); // Check for edit mode
    
    if (projectType) {
      // URL params override saved state - always start fresh when coming from Shop By Job
      clearWizardState();
      wizardState = {
        projectType: projectType,
        projectDetail: projectDetail || null,
        complexity: complexity || null,
        budget: budget || null,
        currentStep: 1
      };
      saveWizardState(wizardState);
      currentStep = 1;
      // Auto-advance through pre-filled steps
      setStepFromUrlParams(projectType, projectDetail, complexity, budget);
      restoreWizardState(showResults, showStep);
    } else if (continueSession === 'true' && wizardState.projectType) {
      // Only restore saved state if explicitly continuing
      currentStep = wizardState.currentStep || 1;
      restoreWizardState(showResults, showStep);
    } else if (editBundleId) {
      // Edit mode - bundle will be loaded by project-builder-wizard.js
      // Don't show banner, user intentionally clicked to edit
      // This is handled by the URL parameter detection in project-builder-wizard.js
      // Just initialize without showing banner
      currentStep = wizardState.currentStep || 5;
      if (showStep) showStep(currentStep);
    } else if (wizardState.projectType && wizardState.bundle) {
      // User has an existing kit but didn't explicitly continue - show prompt
      // Don't auto-restore, wait for user choice
      currentStep = 1;
      if (showStep) showStep(1);
      // Show banner to ask if they want to continue or start fresh
      showProjectBuilderResumeBanner(showResults, showStep);
    } else {
      // Start fresh - clear any old session data
      clearWizardState();
      wizardState = {};
      currentStep = 1;
      if (showStep) showStep(1);
    }
    
    // Note: showStep, updateProgress, updateNavigation, updateSidebar will be called by orchestrator
    if (setupEventListeners) setupEventListeners();
  } catch (error) {
    handleError(error, 'initWizard');
  }
}

/**
 * Set step radio buttons from URL parameters
 * @param {string} projectType
 * @param {string} projectDetail
 * @param {string} complexity
 * @param {string} budget
 */
export function setStepFromUrlParams(projectType, projectDetail, complexity, budget) {
  const stepConfig = [
    { step: 1, name: 'project-type', value: projectType },
    { step: 2, name: 'project-detail', value: projectDetail },
    { step: 3, name: 'complexity', value: complexity },
    { step: 4, name: 'budget', value: budget }
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
}

/**
 * Restore a single step's radio button state
 * @param {number} step - Step number
 * @param {string} value - Value to restore
 * @param {string} name - Radio button name (for step 2)
 */
function restoreStepState(step, value, name) {
  if (!value) return;
  
  if (step === 2) {
    // Step 2 is pre-rendered, just check the radio
    const detailRadio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (detailRadio) detailRadio.checked = true;
  } else {
    // Steps 1, 3, 4: find by radio input value
    const stepContent = document.querySelector(`[data-step="${step}"]`);
    if (stepContent) {
      const radioInput = stepContent.querySelector(`input[type="radio"][value="${value}"]`);
      if (radioInput) {
        radioInput.checked = true;
        const option = radioInput.closest('.wizard-option, .wizard-option-photo');
        if (option) option.classList.add('selected');
      }
    }
  }
}

/**
 * Restore wizard state
 * @param {Function} showResults - Function to show results
 * @param {Function} showStep - Function to show step (with callbacks)
 */
export function restoreWizardState(showResults, showStep) {
  try {
    const wizardState = getWizardState() || {};
    
    // Restore each step's state
    restoreStepState(1, wizardState.projectType, 'project-type');
    restoreStepState(2, wizardState.projectDetail, 'project-detail');
    restoreStepState(3, wizardState.complexity, 'complexity');
    restoreStepState(4, wizardState.budget, 'budget');

    // If we have all data, show results
    if (wizardState.projectType && wizardState.complexity && wizardState.budget) {
      if (wizardState.projectType === 'remodel' && !wizardState.projectDetail) {
        currentStep = 2;
        setCurrentStep(2);
        // showStep will be called by orchestrator with proper callbacks
      } else {
        currentStep = 5;
        setCurrentStep(5);
        // Check the step 5 radio button to ensure CSS states work
        const step5Radio = document.getElementById('wizard-step-5');
        if (step5Radio) {
          step5Radio.checked = true;
        }
        // showStep will be called by orchestrator with proper callbacks
        if (showResults) showResults();
      }
    }
    // Note: showStep will be called by orchestrator with proper callbacks after restore
    
    // Note: updateSidebar will be called by orchestrator after restore
  } catch (error) {
    handleError(error, 'restoreWizardState');
  }
}

/**
 * Go to step (for clickable navigation)
 * @param {number} stepNum
 * @param {Function} updateProgressBar - Callback to update progress bar
 * @param {Function} updateNavigation - Callback to update navigation
 * @param {Function} updateSidebar - Callback to update sidebar
 */
export function goToStep(stepNum, updateProgressBar, updateNavigation, updateSidebar) {
  try {
    const stepEl = document.querySelector(`.wizard-step[data-step="${stepNum}"]`);
    if (!stepEl) return;
    
    // Check if step is completed or active
    if (!stepEl.classList.contains('completed') && !stepEl.classList.contains('active')) {
      return; // Don't allow navigation to future steps
    }
    
    showStep(stepNum, updateProgressBar, updateNavigation, updateSidebar);
  } catch (error) {
    handleError(error, 'goToStep');
  }
}

/**
 * Show step
 * @param {number} step
 * @param {Function} updateProgressBar - Callback to update progress bar
 * @param {Function} updateNavigation - Callback to update navigation
 * @param {Function} updateSidebar - Callback to update sidebar
 */
export function showStep(step, updateProgressBar, updateNavigation, updateSidebar) {
  try {
    currentStep = step;
    setCurrentStep(step);
    
    // Update radio button state to match the step (for CSS-based layout)
    const stepRadio = document.getElementById(`wizard-step-${step}`);
    if (stepRadio) {
      stepRadio.checked = true;
    }
    
    // Hide all steps
    document.querySelectorAll('.wizard-step-content').forEach(content => {
      content.classList.remove('active');
      content.classList.add('hidden');
      content.classList.remove('block');
    });

    // Show current step
    const currentContent = document.querySelector(`.wizard-step-content[data-step="${step}"]`);
    if (currentContent) {
      currentContent.classList.add('active');
      currentContent.classList.remove('hidden');
      currentContent.classList.add('block');
    }

    // Update progress indicators
    const stepNum = typeof step === 'number' ? step : parseFloat(step);
    
    document.querySelectorAll('.wizard-step').forEach((stepEl, index) => {
      const stepIndex = index + 1;
      stepEl.classList.remove('active', 'completed', 'future');
      
      // Update step labels dynamically
      const stepCircle = stepEl.querySelector('.wizard-step-circle');
      const stepLabel = stepEl.querySelector('.wizard-step-label');
      
      // Hide step 6 indicator (no longer needed)
      const step6Indicator = document.getElementById('step-indicator-6');
      if (step6Indicator) {
        step6Indicator.classList.add('hidden');
        step6Indicator.classList.remove('block');
      }
      
      // Step numbering: 1, 2, 3(Complexity), 4(Budget), 5(Results)
      const stepLabels = ['Project Type', 'Details', 'Complexity', 'Budget', 'Results'];
      if (stepIndex >= 1 && stepIndex <= 5) {
        if (stepCircle) stepCircle.textContent = String(stepIndex);
        if (stepLabel) stepLabel.textContent = stepLabels[stepIndex - 1];
        stepEl.style.display = 'flex';
      } else if (stepIndex === 6) {
        stepEl.style.display = 'none';
      }
      
      // Set active/completed/future states
      if (stepIndex < stepNum) {
        stepEl.classList.add('completed');
      } else if (stepIndex === stepNum) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.add('future');
      }
    });

    // Update progress bar and navigation via callbacks
    if (updateProgressBar) updateProgressBar(stepNum);
    if (updateNavigation) updateNavigation();
    if (updateSidebar) updateSidebar();
  } catch (error) {
    handleError(error, 'showStep');
  }
}

/**
 * Previous step
 * @param {Function} updateProgressBar - Callback to update progress bar
 * @param {Function} updateNavigation - Callback to update navigation
 * @param {Function} updateSidebar - Callback to update sidebar
 */
export function prevStep(updateProgressBar, updateNavigation, updateSidebar) {
  try {
    if (currentStep > 1) {
      showStep(currentStep - 1, updateProgressBar, updateNavigation, updateSidebar);
    }
  } catch (error) {
    handleError(error, 'prevStep');
  }
}

/**
 * Update progress (refreshes current step display)
 * @param {Function} updateProgressBar - Callback to update progress bar
 * @param {Function} updateNavigation - Callback to update navigation
 * @param {Function} updateSidebar - Callback to update sidebar
 */
export function updateProgress(updateProgressBar, updateNavigation, updateSidebar) {
  // Refresh current step to update progress indicators
  showStep(currentStep, updateProgressBar, updateNavigation, updateSidebar);
}

/**
 * Show project builder resume banner when user has existing kit
 * @param {Function} showResults - Function to show results
 * @param {Function} showStep - Function to show step
 */
function showProjectBuilderResumeBanner(showResults, showStep) {
  // Only show if kit has items
  if (!hasKitItems()) {
    return;
  }
  
  const kit = getFullKit();
  const bundleName = kit.bundleName || 'Project Kit';
  const itemCount = kit.itemCount || 0;
  const totalPrice = kit.totalPrice || 0;
  
  // Check if banner already exists
  if (document.getElementById('project-builder-resume-banner')) {
    return;
  }
  
  // Find insertion point - after header, before breadcrumb (same as catalog pages)
  const header = document.querySelector('.header');
  if (!header) {
    console.warn('[Project Builder] Header not found, cannot insert banner');
    return;
  }
  
  const bannerHTML = `
    <div class="project-builder-resume-banner" id="project-builder-resume-banner">
      <div class="project-builder-resume-banner-content">
        <div class="project-builder-resume-info">
          <div class="project-builder-resume-title">Continue editing your <span class="project-builder-resume-kit-name">${escapeHtml(bundleName)}</span>?</div>
          <div class="project-builder-resume-details">
            <span class="project-builder-resume-count">${itemCount} items</span>
            <span class="project-builder-resume-separator">•</span>
            <span class="project-builder-resume-price">$${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div class="project-builder-resume-actions">
          <button class="btn btn-primary btn-md" id="continue-existing-kit-btn">Yes, Edit</button>
          <button class="btn btn-secondary btn-md" id="start-new-kit-btn">No, Start New</button>
        </div>
      </div>
    </div>
  `;
  
  const banner = parseHTML(bannerHTML);
  
  // Insert after header (same placement as catalog pages)
  header.insertAdjacentElement('afterend', banner);
  
  // Setup event handlers
  const continueBtn = document.getElementById('continue-existing-kit-btn');
  const startNewBtn = document.getElementById('start-new-kit-btn');
  
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      // Remove banner
      banner.remove();
      // Restore wizard state and go to step 5 (same as View Full Kit with continue=true)
      const wizardState = getWizardState();
      currentStep = wizardState.currentStep || 5;
      setCurrentStep(currentStep);
      
      // Restore wizard state (restores radio buttons and selections)
      restoreWizardState(showResults, showStep);
      
      // Explicitly show step 5 to update UI properly - this ensures step highlighting,
      // content visibility, and progress indicators are correct
      // Note: restoreWizardState already calls showResults() to display the bundle
      if (showStep) {
        showStep(5);
      }
    });
  }
  
  if (startNewBtn) {
    startNewBtn.addEventListener('click', () => {
      // Remove banner
      banner.remove();
      // Clear wizard state and start fresh
      clearWizardState();
      sessionStorage.removeItem('kit_mode_resume_choice');
      // Dispatch event to notify UI that kit mode has exited
      window.dispatchEvent(new CustomEvent('kitModeExited'));
      currentStep = 1;
      if (showStep) showStep(1);
    });
  }
}

// Helper function for escaping HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

