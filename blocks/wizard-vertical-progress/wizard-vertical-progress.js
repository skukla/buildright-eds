/**
 * Wizard Vertical Progress Block
 * Displays progress through wizard steps
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default async function decorate(block) {
  // Create structure if not present
  if (!block.querySelector('.wizard-steps')) {
    block.innerHTML = '<div class="wizard-steps"></div>';
  }
  
  const stepsContainer = block.querySelector('.wizard-steps');
  
  // Block API
  block.steps = [];
  block.currentStep = 0;
  
  /**
   * Initialize wizard with steps
   */
  block.initialize = function(steps) {
    this.steps = steps;
    this.render();
  };
  
  /**
   * Set active step
   */
  block.setActiveStep = function(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    this.currentStep = stepIndex;
    this.render();
    
    // Emit event
    window.dispatchEvent(new CustomEvent('wizard:step-changed', {
      detail: { step: stepIndex, stepData: this.steps[stepIndex] }
    }));
  };
  
  /**
   * Mark step as completed
   */
  block.completeStep = function(stepIndex) {
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].completed = true;
      this.render();
    }
  };
  
  /**
   * Render wizard steps
   */
  block.render = function() {
    stepsContainer.innerHTML = '';
    
    this.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'wizard-step';
      
      // Determine state
      const isCompleted = step.completed;
      const isActive = index === this.currentStep;
      const isDisabled = step.disabled || index > this.currentStep + 1;
      
      if (isCompleted) stepEl.classList.add('completed');
      if (isActive) stepEl.classList.add('active');
      if (isDisabled) stepEl.classList.add('disabled');
      
      // Icon
      const iconContainer = document.createElement('div');
      iconContainer.className = 'wizard-step-icon';
      
      let iconName, iconClass;
      if (isCompleted) {
        iconName = 'check-circle';
        iconClass = 'completed';
      } else if (isActive) {
        iconName = 'circle-dollar-sign';
        iconClass = 'active';
      } else {
        iconName = 'circle-help';
        iconClass = 'pending';
      }
      
      iconContainer.classList.add(iconClass);
      const icon = createIcon(iconName, 'medium');
      iconContainer.appendChild(icon);
      
      // Content
      const contentEl = document.createElement('div');
      contentEl.className = 'wizard-step-content';
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'wizard-step-title';
      titleEl.textContent = step.title;
      
      const descEl = document.createElement('p');
      descEl.className = 'wizard-step-description';
      descEl.textContent = step.description || '';
      
      contentEl.appendChild(titleEl);
      if (step.description) contentEl.appendChild(descEl);
      
      stepEl.appendChild(iconContainer);
      stepEl.appendChild(contentEl);
      
      // Click handler (if not disabled)
      if (!isDisabled) {
        stepEl.addEventListener('click', () => {
          this.setActiveStep(index);
        });
      }
      
      stepsContainer.appendChild(stepEl);
    });
  };
  
  return block;
}

