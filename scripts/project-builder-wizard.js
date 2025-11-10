(async function() {
  // Determine base path for imports
  const scriptBase = window.BASE_PATH || (window.location.pathname.includes('/buildright-eds/') ? '/buildright-eds/' : '/');
  
  // Import dependencies
  const { saveWizardState, getWizardState, generateBundle, addBundleToCart } = await import(`${scriptBase}scripts/project-builder.js`);
  const { getProjectTips, getResourceLinks } = await import(`${scriptBase}scripts/educational-content.js`);
  const { getProductImageUrl, getInventoryStatus, getPrimaryWarehouse } = await import(`${scriptBase}scripts/data-mock.js`);
  const {
    WIZARD_CONSTANTS,
    STEP_2_OPTIONS,
    LABELS,
    ESTIMATION_MULTIPLIERS,
    CATEGORY_MAPPING,
    COMPONENT_GROUPS,
    escapeHtml,
    getLabel,
    getProjectDetailLabel
  } = await import(`${scriptBase}scripts/project-builder-constants.js`);

  // Wizard state
  let currentStep = 1;
  let wizardState = getWizardState() || {};

  // Step to state property mapping
  const STEP_STATE_MAP = {
    '1': 'projectType',
    '2': 'projectDetail',
    '3': 'complexity',
    '4': 'budget'
  };

  // DOM element creation helper
  function el(tag, props = {}, ...children) {
    const element = document.createElement(tag);
    if (props.className) element.className = props.className;
    if (props.id) element.id = props.id;
    if (props.textContent !== undefined) element.textContent = props.textContent;
    if (props.innerHTML) element.innerHTML = props.innerHTML;
    if (props.dataset) Object.assign(element.dataset, props.dataset);
    if (props.style) Object.assign(element.style, props.style);
    if (props.type) element.type = props.type;
    if (props.checked !== undefined) element.checked = props.checked;
    if (props.href) element.href = props.href;
    if (props.placeholder) element.placeholder = props.placeholder;
    if (props.htmlFor) element.htmlFor = props.htmlFor;
    if (props.onclick) element.addEventListener('click', props.onclick);
    if (props.onerror) element.onerror = props.onerror;
    children.forEach(child => {
      if (child) element.appendChild(child);
    });
    return element;
  }

  // Parse HTML template string to DOM (reduces DOM manipulation)
  function parseHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.firstElementChild || doc.body;
  }

  // Parse HTML template and return fragment (for multiple root elements)
  function parseHTMLFragment(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const fragment = document.createDocumentFragment();
    Array.from(doc.body.children).forEach(child => fragment.appendChild(child));
    return fragment;
  }

  // Format category name helper
  function formatCategoryName(cat) {
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Error handler utility
  function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    showToast('error', 'Error', error.message || 'An error occurred. Please try again.');
  }

  // Initialize wizard
  async function initWizard() {
    try {
      const { parseProjectBuilderPath } = await import(`${scriptBase}scripts/url-router.js`);
      
      // Check for path-based parameters first (from Shop By Job links)
      const pathInfo = parseProjectBuilderPath(window.location.pathname);
      const projectType = pathInfo.projectType;
      const projectDetail = pathInfo.projectDetail;
      
      // Check URL query params for backward compatibility
      const urlParams = new URLSearchParams(window.location.search);
      const complexity = urlParams.get('complexity');
      const budget = urlParams.get('budget');
      
      if (projectType) {
        // URL params override saved state
        wizardState = {
          projectType: projectType,
          projectDetail: projectDetail || null,
          complexity: complexity || null,
          budget: budget || null,
          currentStep: 1
        };
        saveWizardState(wizardState);
        // Auto-advance through pre-filled steps
        setStepFromUrlParams(projectType, projectDetail, complexity, budget);
        restoreWizardState();
      } else if (wizardState.projectType) {
        // Load saved state if no URL params
        currentStep = wizardState.currentStep || 1;
        restoreWizardState();
        showStep(currentStep);
      } else {
        // Start fresh
        showStep(1);
      }
      
      updateProgress();
      updateNavigation();
      setupEventListeners();
      updateSidebar();
    } catch (error) {
      handleError(error, 'initWizard');
    }
  }

  // Set step radio buttons from URL parameters
  function setStepFromUrlParams(projectType, projectDetail, complexity, budget) {
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

  // Restore wizard state
  function restoreWizardState() {
    try {
      // Restore step 1
      if (wizardState.projectType) {
        const option = document.querySelector(`[data-step="1"] [data-value="${wizardState.projectType}"]`);
        if (option) option.classList.add('selected');
      }

      // Restore step 2 - Step 2 is pre-rendered, just check the radio
      if (wizardState.projectDetail) {
        const detailRadio = document.querySelector(`input[name="project-detail"][value="${wizardState.projectDetail}"]`);
        if (detailRadio) detailRadio.checked = true;
      }

      // Restore step 3
      if (wizardState.complexity) {
        const option = document.querySelector(`[data-step="3"] .wizard-option[data-value="${wizardState.complexity}"]`);
        if (option) option.classList.add('selected');
      }

      // Restore step 4
      if (wizardState.budget) {
        const option = document.querySelector(`[data-step="4"] .wizard-option[data-value="${wizardState.budget}"]`);
        if (option) option.classList.add('selected');
      }

      // If we have all data, show results
      if (wizardState.projectType && wizardState.complexity && wizardState.budget) {
        if (wizardState.projectType === 'remodel' && !wizardState.projectDetail) {
          currentStep = 2;
        } else {
          currentStep = 5;
          showResults();
        }
      }
      
      // Update sidebar with restored state
      updateSidebar();
    } catch (error) {
      handleError(error, 'restoreWizardState');
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    try {
      // Listen to radio button changes for all wizard steps
      setupRadioListeners('project-type', '1', 2);
      setupRadioListeners('project-detail', '2', 3);
      setupRadioListeners('complexity', '3', 4);
      setupRadioListeners('budget', '4', 5, true);
      
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

      // Navigation buttons - handled by CSS and label 'for' attributes in HTML
      // Back buttons are labels that automatically check the previous step radio
      // Start Over button is a label that checks wizard-step-1 radio
      // No JavaScript event listeners needed for navigation buttons

      // Make step circles clickable for navigation
      document.querySelectorAll('.wizard-step').forEach(stepEl => {
        const stepNumber = stepEl.dataset.step;
        if (stepNumber) {
          stepEl.addEventListener('click', () => {
            const stepNum = parseFloat(stepNumber);
            if (stepEl.classList.contains('completed') || stepEl.classList.contains('active')) {
              goToStep(stepNum);
            }
          });
        }
      });
    } catch (error) {
      handleError(error, 'setupEventListeners');
    }
  }

  // Setup radio button listeners
  function setupRadioListeners(name, step, nextStep, generateOnChange = false) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          selectOption(step, this.value);
          const advanceStep = () => {
            const nextStepRadio = document.getElementById(`wizard-step-${nextStep}`);
            if (nextStepRadio) nextStepRadio.checked = true;
            if (generateOnChange) generateAndShowResults();
          };
          setTimeout(advanceStep, WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
        }
      });
    });
  }

  // Select option
  function selectOption(step, value) {
    try {
      if (!step || !value) {
        console.warn('selectOption called with invalid parameters');
        return;
      }

      const stepContent = document.querySelector(`[data-step="${step}"]`);
      if (!stepContent) {
        console.error(`Step ${step} content not found`);
        return;
      }

      // Remove previous selection
      stepContent.querySelectorAll('.wizard-option, .wizard-option-photo').forEach(opt => opt.classList.remove('selected'));
      
      // Add new selection
      const option = stepContent.querySelector(`[data-value="${value}"]`);
      if (option) option.classList.add('selected');

      // Save to state
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

      // Auto-advance logic
      if (step === '1' || step === '2' || step === '3') {
        setTimeout(() => nextStep(), WIZARD_CONSTANTS.STEP_TRANSITION_DELAY);
      } else if (step === '4') {
        // Step 4: Generate bundle
        generateAndShowResults();
      }
    } catch (error) {
      handleError(error, 'selectOption');
    }
  }

  // Update sidebar with current selections
  function updateSidebar() {
    try {
      const selectionsContainer = document.getElementById('sidebar-selections');
      const estimateContainer = document.getElementById('sidebar-estimate');
      const itemsElement = document.getElementById('sidebar-items');
      const totalElement = document.getElementById('sidebar-total');

      if (!selectionsContainer || !estimateContainer || !itemsElement || !totalElement) {
        return;
      }

      // Build selections using DOM methods
      selectionsContainer.textContent = '';
      const fragment = document.createDocumentFragment();
      
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

      // Show estimate if we have enough data
      if (wizardState.complexity && wizardState.budget) {
        estimateContainer.style.display = 'flex';
        
        const budgetMult = ESTIMATION_MULTIPLIERS.budget[wizardState.budget] || 1.0;
        const complexMult = ESTIMATION_MULTIPLIERS.complexity[wizardState.complexity] || 1.0;
        
        const estimatedItems = Math.round(WIZARD_CONSTANTS.ESTIMATION.BASE_ITEMS * budgetMult * complexMult);
        const estimatedTotal = Math.round(WIZARD_CONSTANTS.ESTIMATION.BASE_PRICE * budgetMult * complexMult);
        
        itemsElement.textContent = estimatedItems;
        totalElement.textContent = `$${estimatedTotal.toLocaleString()}`;
      } else {
        estimateContainer.style.display = 'none';
      }

      // Update project tips using HTML template (reduces DOM manipulation)
      const tipsContainer = document.getElementById('sidebar-tips');
      const tipsList = document.getElementById('project-tips-list');
      if (tipsContainer && tipsList && wizardState.projectType && wizardState.projectDetail && wizardState.complexity) {
        const tips = getProjectTips(wizardState.projectType, wizardState.projectDetail, wizardState.complexity);
        if (tips && tips.length > 0) {
          const tipsHTML = tips.map(tip => {
            const tipEscaped = escapeHtml(tip);
            return `<li>${tipEscaped}</li>`;
          }).join('');
          
          // tipsList is already a <ul>, so we just need the <li> elements
          const html = tipsHTML;
          const fragment = parseHTMLFragment(html);
          
          tipsList.textContent = '';
          Array.from(fragment.children).forEach(li => {
            tipsList.appendChild(li);
          });
          
          tipsContainer.style.display = 'block';
        } else {
          tipsContainer.style.display = 'none';
        }
      } else if (tipsContainer) {
        tipsContainer.style.display = 'none';
      }
    } catch (error) {
      handleError(error, 'updateSidebar');
    }
  }

  // Create selection element using HTML template (reduces DOM manipulation)
  function createSelectionElement(label, value) {
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

  // Go to step (for clickable navigation)
  function goToStep(stepNum) {
    try {
      const stepEl = document.querySelector(`.wizard-step[data-step="${stepNum}"]`);
      if (!stepEl) return;
      
      // Check if step is completed or active
      if (!stepEl.classList.contains('completed') && !stepEl.classList.contains('active')) {
        return; // Don't allow navigation to future steps
      }
      
      showStep(stepNum);
    } catch (error) {
      handleError(error, 'goToStep');
    }
  }

  // Show step
  function showStep(step) {
    try {
      currentStep = step;
      
      // Hide all steps
      document.querySelectorAll('.wizard-step-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });

      // Show current step
      const currentContent = document.querySelector(`.wizard-step-content[data-step="${step}"]`);
      if (currentContent) {
        currentContent.classList.add('active');
        currentContent.style.display = 'block';
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
          step6Indicator.style.display = 'none';
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

      // Update progress bar
      updateProgressBar(stepNum);
      updateNavigation();
    } catch (error) {
      handleError(error, 'showStep');
    }
  }

  // Update progress bar
  function updateProgressBar(progressStep) {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    requestAnimationFrame(() => {
      const container = progressBar.parentElement;
      if (!container) return;

      const stepElements = Array.from(container.querySelectorAll('.wizard-step')).filter(step => {
        const style = window.getComputedStyle(step);
        return style.display !== 'none' && step.style.display !== 'none';
      });
      
      if (stepElements.length > 0) {
        const firstStep = stepElements[0];
        const lastStep = stepElements[stepElements.length - 1];
        const firstCircle = firstStep.querySelector('.wizard-step-circle');
        const lastCircle = lastStep.querySelector('.wizard-step-circle');
        const currentStepIndex = Math.min(progressStep, stepElements.length);
        const targetStep = stepElements[currentStepIndex - 1];
        const targetCircle = targetStep ? targetStep.querySelector('.wizard-step-circle') : null;
        
        if (firstCircle && lastCircle && targetCircle) {
          const containerRect = container.getBoundingClientRect();
          const firstCircleRect = firstCircle.getBoundingClientRect();
          const lastCircleRect = lastCircle.getBoundingClientRect();
          const targetCircleRect = targetCircle.getBoundingClientRect();
          
          const firstCenter = firstCircleRect.left - containerRect.left + (firstCircleRect.width / 2);
          const lastCenter = lastCircleRect.left - containerRect.left + (lastCircleRect.width / 2);
          const targetCenter = targetCircleRect.left - containerRect.left + (targetCircleRect.width / 2);
          
          container.style.setProperty('--line-start', `${firstCenter}px`);
          container.style.setProperty('--line-end', `${lastCenter}px`);
          
          progressBar.style.left = `${firstCenter}px`;
          progressBar.style.width = `${Math.max(0, targetCenter - firstCenter)}px`;
          
          requestAnimationFrame(() => {
            progressBar.classList.add('initialized');
          });
        }
      } else {
        // Fallback: use percentage calculation
        const progressSteps = WIZARD_CONSTANTS.TOTAL_STEPS;
        const progress = ((progressStep - 1) / (progressSteps - 1)) * 100;
        const containerWidth = container.offsetWidth;
        const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft);
        const paddingRight = parseFloat(getComputedStyle(container).paddingRight);
        const availableWidth = containerWidth - paddingLeft - paddingRight;
        const progressWidth = (availableWidth * progress) / 100;
        progressBar.style.left = `${paddingLeft}px`;
        progressBar.style.width = `${progressWidth}px`;
        
        requestAnimationFrame(() => {
          progressBar.classList.add('initialized');
        });
      }
    });
  }

  // Next step
  function nextStep() {
    try {
      // Validate current step
      if (currentStep === 1 && !wizardState.projectType) return;
      if (currentStep === 2 && !wizardState.projectDetail) return;
      if (currentStep === 3 && !wizardState.complexity) return;
      if (currentStep === 4 && !wizardState.budget) return;

      // Advance to next step
      if (currentStep === 1) {
        showStep(2);
      } else if (currentStep === 2) {
        showStep(3);
      } else if (currentStep === 3) {
        showStep(4);
      } else if (currentStep === 4) {
        generateAndShowResults();
      }
    } catch (error) {
      handleError(error, 'nextStep');
    }
  }

  // Previous step
  function prevStep() {
    try {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    } catch (error) {
      handleError(error, 'prevStep');
    }
  }

  // Update progress
  function updateProgress() {
    showStep(currentStep);
  }

  // Update navigation
  // Note: Navigation visibility is primarily controlled by CSS via :checked pseudo-class
  // This function is kept for any additional JavaScript-based navigation logic if needed
  function updateNavigation() {
    try {
      // Navigation is handled by CSS, so this function can be a no-op
      // If we need to add IDs to HTML elements later, we can uncomment this:
      /*
      const backBtn = document.getElementById('wizard-back');
      const startOverBtn = document.getElementById('wizard-start-over');
      const printBtn = document.getElementById('wizard-print');

      if (!backBtn || !startOverBtn) return;

      if (currentStep === 5) {
        backBtn.style.display = 'none';
        startOverBtn.style.display = 'inline-block';
        if (printBtn) printBtn.style.display = 'inline-block';
      } else {
        backBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        startOverBtn.style.display = 'none';
        if (printBtn) printBtn.style.display = 'none';
      }
      */
    } catch (error) {
      handleError(error, 'updateNavigation');
    }
  }

  // Generate and show results
  async function generateAndShowResults() {
    try {
      showStep(5);
      
      const container = document.getElementById('bundle-container');
      if (!container) {
        throw new Error('Bundle container not found');
      }

      // Show loading state using DOM methods
      container.textContent = '';
      container.appendChild(
        el('div', { style: { textAlign: 'center', padding: '3rem' } },
          el('div', { style: { fontSize: '2rem', marginBottom: '1rem' }, textContent: '⏳' }),
          el('p', { textContent: 'Generating your project kit...' })
        )
      );
      
      const bundle = await generateBundle(wizardState);
      if (bundle) {
        displayBundle(bundle);
        showToast('success', 'Project kit generated successfully!', 'Your customized bundle is ready.');
      } else {
        throw new Error('Failed to generate bundle');
      }
    } catch (error) {
      handleError(error, 'generateAndShowResults');
      const container = document.getElementById('bundle-container');
      if (container) {
        showErrorState(container, error);
      }
    }
  }

  // Show error state using HTML template (reduces DOM manipulation)
  function showErrorState(container, error) {
    const svgIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>';
    const errorMessage = escapeHtml(error.message || 'Please check your selections and try again.');
    
    const html = `
      <div class="error-message">
        <span class="error-message-icon">${svgIcon}</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">Unable to generate bundle</div>
          <div style="font-size: 0.875rem;">${errorMessage}</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 1.5rem;">
        <button class="btn btn-primary" id="error-go-back-btn">← Go Back</button>
      </div>
    `;
    
    container.textContent = '';
    const errorDiv = parseHTML(html);
    
    // Add event listener for go back button
    const goBackBtn = errorDiv.querySelector('#error-go-back-btn');
    if (goBackBtn) {
      goBackBtn.addEventListener('click', prevStep);
    }
    
    container.appendChild(errorDiv);
  }

  // Show results (if already generated)
  async function showResults() {
    try {
      if (wizardState.bundle) {
        displayBundle(wizardState.bundle);
      } else {
        await generateAndShowResults();
      }
    } catch (error) {
      handleError(error, 'showResults');
    }
  }

  // Display bundle - refactored to use DOM methods and fix scope issues
  function displayBundle(bundle) {
    const container = document.getElementById('bundle-container');
    if (!container) {
      console.error('Bundle container not found');
      return;
    }

    // Group items by category
    const itemsByCategory = bundle.items.reduce((acc, item) => {
      const category = item.category || 'Other';
      (acc[category] = acc[category] || []).push(item);
      return acc;
    }, {});

    // Calculate prices per component group
    const componentPrices = Object.fromEntries(
      Object.entries(COMPONENT_GROUPS).map(([group, categories]) => [
        group,
        categories.flatMap(cat => itemsByCategory[cat] || [])
          .reduce((sum, item) => sum + item.subtotal, 0)
      ])
    );

    // Default included groups
    const includedGroups = new Set(['Primary Materials', 'Fasteners & Hardware']);

    // Build bundle HTML using templates (reduces DOM manipulation significantly)
    const notes = sessionStorage.getItem('buildright_project_notes');
    const printHeaderHTML = createPrintHeader(bundle).outerHTML;
    const printNotesHTML = notes && notes.trim() ? createPrintNotes(notes).outerHTML : '';
    const bundleHeaderHTML = createBundleHeader(bundle).outerHTML;
    const bundleSummaryHTML = createBundleSummary(bundle).outerHTML;
    const componentTogglesHTML = createComponentToggles(componentPrices, includedGroups, bundle).outerHTML;
    const bundleProductsHTML = createBundleProducts(itemsByCategory, includedGroups, bundle).outerHTML;
    const bundleActionsHTML = createBundleActions().outerHTML;
    const quoteActionsHTML = createQuoteActions().outerHTML;
    const projectNotesHTML = createProjectNotes().outerHTML;
    
    const bundleHTML = `
      <div class="project-bundle" data-bundle-id="${bundle.bundleId}">
        ${printHeaderHTML}
        ${printNotesHTML}
        ${bundleHeaderHTML}
        ${bundleSummaryHTML}
        ${componentTogglesHTML}
        ${bundleProductsHTML}
        ${bundleActionsHTML}
        <div class="resource-links" id="resource-links-section"></div>
        ${quoteActionsHTML}
        ${projectNotesHTML}
      </div>
    `;
    
    // Single DOM operation instead of many appendChild calls
    container.textContent = '';
    const bundleDiv = parseHTML(bundleHTML);
    container.appendChild(bundleDiv);
    
    // Get resource links section reference
    const resourceLinksSection = bundleDiv.querySelector('#resource-links-section');

    // Setup event listeners for bundle
    setupBundleEventListeners(bundle, itemsByCategory, includedGroups);

    // Populate resource links
    populateResourceLinks(resourceLinksSection);

    // Save bundle to state
    wizardState.bundle = bundle;
    saveWizardState(wizardState);
    updateSidebar();
  }

  // Create print header using HTML template (reduces DOM manipulation)
  function createPrintHeader(bundle) {
    const projectTypeLabel = escapeHtml(getLabel('projectType', wizardState.projectType));
    const projectDetailLabel = escapeHtml(getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail));
    const complexityLabel = escapeHtml(getLabel('complexity', wizardState.complexity));
    const generatedDate = escapeHtml(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    
    const html = `
      <div class="print-header" style="display: none;">
        <div class="print-header-logo">BuildRight Solutions</div>
        <div class="print-header-title">Project Materials Quote</div>
        <div class="print-header-details">Project: ${projectDetailLabel} ${projectTypeLabel} (${complexityLabel})</div>
        <div class="print-header-date">Generated on ${generatedDate}</div>
      </div>
    `;
    
    return parseHTML(html);
  }

  // Create print notes using HTML template (reduces DOM manipulation)
  function createPrintNotes(notes) {
    const escapedNotes = escapeHtml(notes);
    const html = `
      <div class="print-notes" style="display: none;">
        <div class="print-notes-label">Project Notes:</div>
        <div>${escapedNotes}</div>
      </div>
    `;
    return parseHTML(html);
  }

  // Create bundle header using HTML template (reduces DOM manipulation)
  function createBundleHeader(bundle) {
    const bundleName = escapeHtml(bundle.bundleName);
    const html = `
      <div class="bundle-header">
        <div class="bundle-badge">PROJECT KIT</div>
        <h3 class="bundle-title">${bundleName}</h3>
        <p class="bundle-subtitle">${bundle.itemCount} items included</p>
      </div>
    `;
    return parseHTML(html);
  }

  // Create bundle summary using HTML template (reduces DOM manipulation)
  function createBundleSummary(bundle) {
    const html = `
      <div class="bundle-summary">
        <div class="bundle-total">
          <div class="bundle-total-label">Total Price</div>
          <div class="bundle-total-value" id="bundle-total-value">$${bundle.totalPrice.toFixed(2)}</div>
        </div>
        <button class="btn btn-cta btn-lg" id="add-bundle-btn">Add Kit to Cart</button>
      </div>
    `;
    return parseHTML(html);
  }

  // Create component toggles using HTML template (reduces DOM manipulation)
  function createComponentToggles(componentPrices, includedGroups, bundle) {
    const toggleItems = Object.keys(COMPONENT_GROUPS)
      .filter(group => {
        const price = componentPrices[group];
        return price !== 0 || group === 'Tools & Accessories';
      })
      .map(group => {
        const price = componentPrices[group];
        const checked = includedGroups.has(group) ? 'checked' : '';
        const groupEscaped = escapeHtml(group);
        return `
          <div class="component-toggle-item">
            <label class="component-toggle-label">
              <input type="checkbox" class="component-toggle-checkbox" data-group="${groupEscaped}" ${checked}>
              <span>${groupEscaped}</span>
            </label>
            <span class="component-toggle-price">$${price.toFixed(2)}</span>
          </div>
        `;
      })
      .join('');
    
    const html = `
      <div class="component-toggles">
        <h4 class="component-toggles-title">Customize Your Kit</h4>
        ${toggleItems}
        <div class="component-toggle-item">
          <span class="component-toggle-label">Total:</span>
          <span class="component-toggle-price" id="component-total-price">$${bundle.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    `;
    
    return parseHTML(html);
  }

  // Create bundle products using HTML template (reduces DOM manipulation)
  function createBundleProducts(itemsByCategory, includedGroups, bundle) {
    const categorySections = Object.keys(itemsByCategory).map(category => {
      const groupName = CATEGORY_MAPPING[category] || 'Other';
      const isIncluded = includedGroups.has(groupName);
      const categoryEscaped = escapeHtml(category);
      const groupNameEscaped = escapeHtml(groupName);
      const categoryName = escapeHtml(formatCategoryName(category));
      const categoryTotal = itemsByCategory[category].reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = itemsByCategory[category].length;
      const tableHTML = createProductsTable(itemsByCategory[category]).outerHTML;
      const excludedClass = isIncluded ? '' : 'excluded';
      const displayStyle = isIncluded ? 'block' : 'none';
      
      return `
        <div class="bundle-category-section ${excludedClass}" data-category="${categoryEscaped}" data-group="${groupNameEscaped}">
          <div class="category-toggle ${excludedClass}">
            <span class="category-name">${categoryName}</span>
            <span class="category-count">${itemCount} items</span>
            <span class="category-price">$${categoryTotal.toFixed(2)}</span>
          </div>
          <div class="category-items ${excludedClass}" id="category-${categoryEscaped}" style="display: ${displayStyle};">
            ${tableHTML}
          </div>
        </div>
      `;
    }).join('');
    
    const html = `
      <div class="bundle-products">
        <h4 class="bundle-products-title">Kit Contents</h4>
        ${categorySections}
      </div>
    `;
    
    return parseHTML(html);
  }

  // Create products table using HTML template (reduces DOM manipulation)
  function createProductsTable(items) {
    const tbodyRows = items.map(item => createProductRow(item).outerHTML).join('');
    
    const html = `
      <table class="products-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${tbodyRows}
        </tbody>
      </table>
    `;
    
    return parseHTML(html);
  }

  // Create product row using HTML template (reduces DOM manipulation)
  function createProductRow(item) {
    const inventoryStatus = getInventoryStatus({ sku: item.sku }, getPrimaryWarehouse());
    const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
    const imageUrl = escapeHtml(getProductImageUrl(item.sku));
    const itemName = escapeHtml(item.name);
    const itemReason = escapeHtml(item.reason);
    const itemSku = escapeHtml(item.sku);
    
    let stockText, stockClass;
    if (inventoryStatus === 'in_stock') {
      stockText = '✓ In Stock';
      stockClass = 'stock-status stock-in';
    } else if (inventoryStatus === 'low_stock') {
      stockText = '⚠ Low Stock';
      stockClass = 'stock-status stock-low';
    } else {
      stockText = '✗ Out of Stock';
      stockClass = 'stock-status stock-out';
    }
    
    const html = `
      <tr>
        <td>
          <img src="${imageUrl}" alt="${itemName}" class="product-thumbnail" onerror="this.style.display='none'">
        </td>
        <td>
          <div class="product-info">
            <div class="product-name">${itemName}</div>
            <div class="product-reason">${itemReason}</div>
          </div>
        </td>
        <td class="product-sku">${itemSku}</td>
        <td>
          <span class="${stockClass}">${stockText}</span>
        </td>
        <td>
          <div class="quantity-controls">
            <button class="qty-btn" data-sku="${itemSku}" data-action="decrease">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" data-sku="${itemSku}" data-action="increase">+</button>
          </div>
        </td>
        <td class="product-unit-price">$${unitPrice.toFixed(2)}</td>
        <td class="product-subtotal">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `;
    
    return parseHTML(html);
  }

  // Create bundle actions using HTML template (reduces DOM manipulation)
  function createBundleActions() {
    const html = `
      <div class="bundle-actions">
        <a href="catalog" class="btn btn-outline-accent">Customize Kit in Catalog</a>
      </div>
    `;
    return parseHTML(html);
  }

  // Create quote actions using HTML template (reduces DOM manipulation)
  function createQuoteActions() {
    const html = `
      <div class="quote-actions">
        <button class="btn btn-outline quote-action-btn" id="copy-materials-btn">📋 Copy Materials List</button>
        <button class="btn btn-outline quote-action-btn" id="email-quote-btn">✉️ Email Quote</button>
      </div>
    `;
    return parseHTML(html);
  }

  // Create project notes using HTML template (reduces DOM manipulation)
  function createProjectNotes() {
    const html = `
      <div class="project-notes">
        <label for="project-notes-textarea" class="project-notes-label">Project Notes (Optional)</label>
        <textarea id="project-notes-textarea" class="project-notes-textarea" placeholder="Add contractor notes, special instructions, or reminders..."></textarea>
        <div class="project-notes-hint">Notes are saved locally and included in printed quotes</div>
      </div>
    `;
    return parseHTML(html);
  }

  // Setup bundle event listeners
  function setupBundleEventListeners(bundle, itemsByCategory, includedGroups) {
    try {
      // Add bundle to cart button
      const addBtn = document.getElementById('add-bundle-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          saveOrderToHistory(bundle);
          addBundleToCart(bundle);
          window.location.href = 'pages/cart.html';
        });
      }

      // Component toggle functionality
      const componentCheckboxes = document.querySelectorAll('.component-toggle-checkbox');
      componentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const group = checkbox.dataset.group;
          if (checkbox.checked) {
            includedGroups.add(group);
          } else {
            includedGroups.delete(group);
          }
          updateComponentToggles(bundle, itemsByCategory, includedGroups);
        });
      });

      // Quantity controls
      document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sku = btn.dataset.sku;
          const action = btn.dataset.action;
          const qtyElement = btn.parentElement.querySelector('.qty-value');
          if (!qtyElement) return;
          
          let qty = parseInt(qtyElement.textContent);
          if (action === 'increase') {
            qty++;
          } else if (action === 'decrease' && qty > 1) {
            qty--;
          }
          
          qtyElement.textContent = qty;
          
          const item = bundle.items.find(i => i.sku === sku);
          if (item) {
            const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
            item.quantity = qty;
            item.subtotal = unitPrice * qty;
            
            const row = btn.closest('tr');
            if (row) {
              const subtotalCell = row.querySelector('.product-subtotal');
              if (subtotalCell) {
                subtotalCell.textContent = `$${item.subtotal.toFixed(2)}`;
              }
            }
            
            bundle.totalPrice = bundle.items.reduce((sum, i) => sum + i.subtotal, 0);
            const totalValue = document.querySelector('.bundle-total-value');
            if (totalValue) {
              totalValue.textContent = `$${bundle.totalPrice.toFixed(2)}`;
            }
            
            wizardState.bundle = bundle;
            saveWizardState(wizardState);
          }
        });
      });

      // Print button - visibility is controlled by CSS, just ensure click handler is set
      const printBtn = document.querySelector('.wizard-nav-print');
      if (printBtn) {
        // Remove existing onclick handler if present and add event listener
        printBtn.onclick = null; // Clear inline onclick
        printBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.print();
        });
      }

      // Copy materials list button
      const copyBtn = document.getElementById('copy-materials-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          copyMaterialsList(bundle, wizardState);
        });
      }

      // Email quote button
      const emailBtn = document.getElementById('email-quote-btn');
      if (emailBtn) {
        emailBtn.addEventListener('click', () => {
          emailQuote(bundle, wizardState);
        });
      }

      // Project notes handling
      const notesTextarea = document.getElementById('project-notes-textarea');
      if (notesTextarea) {
        const savedNotes = sessionStorage.getItem('buildright_project_notes');
        if (savedNotes) {
          notesTextarea.value = savedNotes;
        }

        notesTextarea.addEventListener('input', () => {
          sessionStorage.setItem('buildright_project_notes', notesTextarea.value);
        });
      }
    } catch (error) {
      handleError(error, 'setupBundleEventListeners');
    }
  }

  // Update component toggles - fixed scope issue
  function updateComponentToggles(bundle, itemsByCategory, includedGroups) {
    try {
      let newTotal = 0;
      
      document.querySelectorAll('.bundle-category-section').forEach(section => {
        const group = section.dataset.group;
        const isIncluded = includedGroups.has(group);
        
        if (isIncluded) {
          section.classList.remove('excluded');
          const itemsContainer = section.querySelector('.category-items');
          if (itemsContainer) itemsContainer.style.display = 'block';
          const toggle = section.querySelector('.category-toggle');
          if (toggle) toggle.classList.remove('excluded');
        } else {
          section.classList.add('excluded');
          const itemsContainer = section.querySelector('.category-items');
          if (itemsContainer) itemsContainer.style.display = 'none';
          const toggle = section.querySelector('.category-toggle');
          if (toggle) toggle.classList.add('excluded');
        }
        
        if (isIncluded) {
          const category = section.dataset.category;
          if (itemsByCategory[category]) {
            itemsByCategory[category].forEach(item => {
              newTotal += item.subtotal;
            });
          }
        }
      });
      
      const totalValue = document.getElementById('bundle-total-value');
      const componentTotal = document.getElementById('component-total-price');
      if (totalValue) totalValue.textContent = `$${newTotal.toFixed(2)}`;
      if (componentTotal) componentTotal.textContent = `$${newTotal.toFixed(2)}`;
      
      bundle.totalPrice = newTotal;
      wizardState.bundle = bundle;
      saveWizardState(wizardState);
    } catch (error) {
      handleError(error, 'updateComponentToggles');
    }
  }

  // Populate resource links using HTML template (reduces DOM manipulation)
  function populateResourceLinks(container) {
    try {
      if (wizardState.projectType && wizardState.projectDetail) {
        const links = getResourceLinks(wizardState.projectType, wizardState.projectDetail);
        if (links && links.length > 0) {
          const linksHTML = links.map(link => {
            const url = escapeHtml(link.url);
            const text = escapeHtml(link.text);
            return `<li><a href="${url}" class="resource-link">${text}</a></li>`;
          }).join('');
          
          const html = `
            <div class="resource-links-title">📚 Related Resources</div>
            <ul class="resource-links-list">${linksHTML}</ul>
          `;
          
          // Use parseHTMLFragment instead of innerHTML for better security
          container.textContent = '';
          const fragment = parseHTMLFragment(html);
          Array.from(fragment.children).forEach(child => {
            container.appendChild(child);
          });
        }
      }
    } catch (error) {
      handleError(error, 'populateResourceLinks');
    }
  }

  // Save order to history
  function saveOrderToHistory(bundle) {
    try {
      const orders = JSON.parse(localStorage.getItem('buildright_orders') || '[]');
      const order = {
        orderID: 'ORD-' + Date.now(),
        timestamp: new Date().toISOString(),
        wizardState: { ...wizardState },
        products: bundle.items.map(item => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.subtotal / item.quantity,
          subtotal: item.subtotal
        })),
        total: bundle.totalPrice,
        itemCount: bundle.itemCount,
        status: 'Completed'
      };
      orders.unshift(order);
      localStorage.setItem('buildright_orders', JSON.stringify(orders));
      
      updateLoyaltySpend(bundle.totalPrice);
    } catch (e) {
      handleError(e, 'saveOrderToHistory');
    }
  }

  // Update loyalty spend
  function updateLoyaltySpend(amount) {
    try {
      const loyaltyData = JSON.parse(localStorage.getItem('buildright_loyalty') || '{"totalSpend": 0}');
      loyaltyData.totalSpend = (loyaltyData.totalSpend || 0) + amount;
      localStorage.setItem('buildright_loyalty', JSON.stringify(loyaltyData));
    } catch (e) {
      handleError(e, 'updateLoyaltySpend');
    }
  }

  // Format materials list for copy/email
  function formatMaterialsList(bundle, wizardState) {
    const projectTypeLabel = getLabel('projectType', wizardState.projectType);
    const projectDetailLabel = getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail);
    const complexityLabel = getLabel('complexity', wizardState.complexity);
    
    const projectName = `${projectDetailLabel} ${projectTypeLabel} (${complexityLabel})`;
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const categoryMapping = {
      'Lumber & Framing': 'Primary Materials',
      'Drywall & Panels': 'Primary Materials',
      'Windows & Doors': 'Primary Materials',
      'Fasteners & Hardware': 'Fasteners & Hardware',
      'Tools & Accessories': 'Tools & Accessories',
      'Finishing Materials': 'Finishing Materials',
      'Insulation': 'Finishing Materials',
      'Paint & Coatings': 'Finishing Materials'
    };

    const itemsByGroup = {};
    bundle.items.forEach(item => {
      const group = categoryMapping[item.category] || 'Other';
      if (!itemsByGroup[group]) {
        itemsByGroup[group] = [];
      }
      itemsByGroup[group].push(item);
    });

    let text = `BUILDRIGHT MATERIALS LIST\n`;
    text += `Project: ${projectName}\n`;
    text += `Generated: ${generatedDate}\n\n`;

    const notes = sessionStorage.getItem('buildright_project_notes');
    if (notes && notes.trim()) {
      text += `NOTES:\n${notes}\n\n`;
    }

    Object.keys(itemsByGroup).forEach(group => {
      text += `${group.toUpperCase()}\n`;
      itemsByGroup[group].forEach(item => {
        const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
        text += `- ${item.name} (${item.sku}) x${item.quantity} @ $${unitPrice.toFixed(2)} = $${item.subtotal.toFixed(2)}\n`;
      });
      text += `\n`;
    });

    text += `TOTAL: $${bundle.totalPrice.toFixed(2)}\n`;
    
    return text;
  }

  // Copy materials list to clipboard
  async function copyMaterialsList(bundle, wizardState) {
    try {
      const text = formatMaterialsList(bundle, wizardState);
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied!', 'Materials list copied to clipboard');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = formatMaterialsList(bundle, wizardState);
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast('success', 'Copied!', 'Materials list copied to clipboard');
      } catch (e) {
        showToast('error', 'Error', 'Failed to copy materials list');
      }
      document.body.removeChild(textarea);
    }
  }

  // Email quote
  function emailQuote(bundle, wizardState) {
    try {
      const projectTypeLabel = getLabel('projectType', wizardState.projectType);
      const projectDetailLabel = getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail);
      
      const subject = encodeURIComponent(`BuildRight Quote - ${projectDetailLabel} ${projectTypeLabel}`);
      const body = encodeURIComponent(formatMaterialsList(bundle, wizardState));
      
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (error) {
      handleError(error, 'emailQuote');
    }
  }

  // Start over
  function startOver() {
    try {
      saveWizardState({});
      window.location.reload();
    } catch (error) {
      handleError(error, 'startOver');
    }
  }

  // Show toast notification using HTML template (reduces DOM manipulation)
  function showToast(type, title, message) {
    try {
      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
      };
      
      const icon = icons[type] || icons.info;
      const titleEscaped = escapeHtml(title);
      const messageEscaped = escapeHtml(message);
      
      const html = `
        <div class="toast ${type}">
          <span class="toast-icon">${icon}</span>
          <div class="toast-content">
            <div class="toast-title">${titleEscaped}</div>
            <div class="toast-message">${messageEscaped}</div>
          </div>
          <button class="toast-close">×</button>
        </div>
      `;
      
      const toast = parseHTML(html);
      
      // Add close button event listener
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          toast.remove();
        });
      }
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'slideIn 0.3s ease reverse';
          setTimeout(() => toast.remove(), WIZARD_CONSTANTS.TOAST_ANIMATION_DURATION);
        }
      }, WIZARD_CONSTANTS.TOAST_AUTO_REMOVE_DELAY);
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }

  // Recalculate progress bar on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentStep) {
        updateProgress();
      }
    }, WIZARD_CONSTANTS.RESIZE_DEBOUNCE_DELAY);
  });

  // Initialize on load - ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWizard);
  } else {
    initWizard();
  }
})();
