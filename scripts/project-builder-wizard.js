// Project Builder Wizard - Main Orchestrator
// This file coordinates all wizard modules

(async function() {
  // Determine base path for imports
  const scriptBase = window.BASE_PATH || (window.location.pathname.includes('/buildright-eds/') ? '/buildright-eds/' : '/');
  
  // Import wizard modules
  const { initWizard, showStep, goToStep, prevStep, updateProgress, getCurrentStep, setCurrentStep } = await import(`${scriptBase}scripts/wizard/wizard-core.js`);
  const { handleOptionSelection, advanceToNextStep, setupRadioListeners } = await import(`${scriptBase}scripts/wizard/wizard-selection.js`);
  const { updateProgressBar, updateNavigation } = await import(`${scriptBase}scripts/wizard/wizard-progress.js`);
  const { updateSidebar } = await import(`${scriptBase}scripts/wizard/wizard-sidebar.js`);
  const { generateAndShowResults, showResults, showErrorState } = await import(`${scriptBase}scripts/wizard/wizard-bundle-generation.js`);
  const { displayBundle, displayListView, displayBundleView, getCurrentView, setCurrentView } = await import(`${scriptBase}scripts/wizard/wizard-bundle-display.js`);
  const { setupSimpleListViewEventListeners, setupListViewEventListeners, setupBundleEventListeners, updateComponentToggles, populateResourceLinks } = await import(`${scriptBase}scripts/wizard/wizard-list-views.js`);
  const { WIZARD_CONSTANTS } = await import(`${scriptBase}scripts/project-builder-constants.js`);

  // Create bound functions with callbacks
  const boundShowStep = (step) => showStep(step, updateProgressBar, updateNavigation, updateSidebar);
  const boundGoToStep = (stepNum) => goToStep(stepNum, updateProgressBar, updateNavigation, updateSidebar);
  const boundPrevStep = () => prevStep(updateProgressBar, updateNavigation, updateSidebar);
  const boundUpdateProgress = () => updateProgress(updateProgressBar, updateNavigation, updateSidebar);
  
  const boundAdvanceToNextStep = (currentStep) => advanceToNextStep(
    currentStep,
    boundShowStep,
    boundGenerateAndShowResults
  );
  
  const boundHandleOptionSelection = (step, value) => handleOptionSelection(
    step,
    value,
    boundShowStep,
    boundAdvanceToNextStep
  );
  
  const boundGenerateAndShowResults = () => generateAndShowResults(
    boundShowStep,
    boundDisplayBundle,
    boundPrevStep
  );
  
  const boundShowResults = () => showResults(
    boundDisplayBundle,
    boundGenerateAndShowResults
  );
  
  const boundDisplayBundle = (bundle) => displayBundle(
    bundle,
    boundSetupSimpleListViewEventListeners,
    boundDisplayBundle
  );
  
  const boundSetupSimpleListViewEventListeners = (bundle, allItems) => setupSimpleListViewEventListeners(
    bundle,
    allItems,
    boundDisplayBundle
  );
  
  const boundSetupBundleEventListeners = (bundle, itemsByCategory, includedGroups) => setupBundleEventListeners(
    bundle,
    itemsByCategory,
    includedGroups,
    boundUpdateComponentToggles
  );
  
  const boundUpdateComponentToggles = (bundle, itemsByCategory, includedGroups) => updateComponentToggles(
    bundle,
    itemsByCategory,
    includedGroups
  );

  // Setup event listeners
  function setupEventListeners() {
    try {
      // Listen to radio button changes for all wizard steps
      setupRadioListeners('project-type', '1', 2, boundHandleOptionSelection);
      setupRadioListeners('project-detail', '2', 3, boundHandleOptionSelection);
      setupRadioListeners('complexity', '3', 4, boundHandleOptionSelection);
      setupRadioListeners('budget', '4', 5, boundHandleOptionSelection);
      
      // Option selection - use event delegation on wizard-content
      const wizardContent = document.querySelector('.wizard-content');
      if (wizardContent) {
        wizardContent.addEventListener('click', (e) => {
          const option = e.target.closest('.wizard-option, .wizard-option-photo');
          if (option) {
            const radio = option.querySelector('input[type="radio"]');
            if (radio && !radio.checked) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change'));
            }
          }
        });
      }

      // Make step circles clickable for navigation
      document.querySelectorAll('.wizard-step').forEach(stepEl => {
        const stepNumber = stepEl.dataset.step;
        if (stepNumber) {
          stepEl.addEventListener('click', () => {
            const stepNum = parseFloat(stepNumber);
            if (stepEl.classList.contains('completed') || stepEl.classList.contains('active')) {
              boundGoToStep(stepNum);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error in setupEventListeners:', error);
    }
  }

  // Initialize wizard with bound functions
  async function initializeWizard() {
    await initWizard(setupEventListeners, boundShowResults, boundShowStep);
    
    // Get current step and show it with proper callbacks
    const currentStep = getCurrentStep();
    if (currentStep) {
      boundShowStep(currentStep);
    }
    
    // Call update functions after initialization
    updateNavigation();
    updateSidebar();
  }

  // Recalculate progress bar on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentStep = getCurrentStep();
      if (currentStep) {
        boundUpdateProgress();
      }
    }, WIZARD_CONSTANTS.RESIZE_DEBOUNCE_DELAY);
  });

  // Initialize on load - ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWizard);
  } else {
    initializeWizard();
  }
})();
