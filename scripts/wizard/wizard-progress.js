// Wizard Progress
// Progress indicator and navigation updates

import { WIZARD_CONSTANTS } from '../project-builder-constants.js';

/**
 * Update progress bar
 * @param {number} progressStep
 */
export function updateProgressBar(progressStep) {
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

/**
 * Update navigation
 * Note: Navigation visibility is primarily controlled by CSS via :checked pseudo-class
 * This function is kept for any additional JavaScript-based navigation logic if needed
 */
export function updateNavigation() {
  // Navigation is handled by CSS, so this function is intentionally a no-op
  // CSS controls button visibility via :checked pseudo-class on wizard-step radio buttons
  // No JavaScript manipulation needed - all navigation buttons are controlled by CSS
  return;
}

