// Wizard Bundle Generation
// Bundle generation and loading states

import { generateBundle, getWizardState } from '../project-builder.js';
import { escapeHtml } from '../project-builder-constants.js';
import { parseHTML, handleError } from './wizard-utils.js';

/**
 * Generate and show results
 * @param {Function} showStep - Function to show step
 * @param {Function} displayBundle - Function to display bundle
 * @param {Function} prevStep - Function to go to previous step
 */
export async function generateAndShowResults(showStep, displayBundle, prevStep) {
  try {
    if (showStep) showStep(5);
    
    const container = document.getElementById('bundle-container');
    if (!container) {
      throw new Error('Bundle container not found');
    }

    // Show skeleton loader that matches final layout
    container.textContent = '';
    const skeletonHTML = `
      <div class="project-kit-list-view-simple">
        <div class="simple-list-header">
          <div class="simple-list-header-content">
            <div class="skeleton-text mb-2" style="width: 300px; height: 24px; background: var(--color-border); border-radius: 4px;"></div>
            <div class="skeleton-text" style="width: 120px; height: 16px; background: var(--color-border); border-radius: 4px;"></div>
          </div>
          <div class="skeleton-text" style="width: 100px; height: 28px; background: var(--color-border); border-radius: 4px;"></div>
        </div>
        <div class="simple-list-table">
          <div class="simple-list-table-header">
            <div class="simple-list-col-item">Item</div>
            <div class="simple-list-col-qty">Quantity</div>
            <div class="simple-list-col-price">Price</div>
            <div class="simple-list-col-total">Total</div>
            <div class="simple-list-col-actions"></div>
          </div>
          <div class="simple-list-items">
            ${Array(5).fill(0).map(() => `
              <div class="simple-list-row">
                <div class="simple-list-col-item">
                  <div class="skeleton-image flex-shrink-0" style="width: 60px; height: 60px; background: var(--color-border); border-radius: 4px;"></div>
                  <div class="flex-1" style="min-width: 0;">
                    <div class="skeleton-text mb-2" style="width: 80%; height: 16px; background: var(--color-border); border-radius: 4px;"></div>
                    <div class="skeleton-text" style="width: 60%; height: 14px; background: var(--color-border); border-radius: 4px;"></div>
                  </div>
                </div>
                <div class="simple-list-col-qty">
                  <div class="skeleton-text mx-auto" style="width: 80px; height: 32px; background: var(--color-border); border-radius: 4px;"></div>
                </div>
                <div class="simple-list-col-price">
                  <div class="skeleton-text ml-auto" style="width: 60px; height: 16px; background: var(--color-border); border-radius: 4px;"></div>
                </div>
                <div class="simple-list-col-total">
                  <div class="skeleton-text ml-auto" style="width: 70px; height: 18px; background: var(--color-border); border-radius: 4px;"></div>
                </div>
                <div class="simple-list-col-actions">
                  <div class="skeleton-text mx-auto" style="width: 24px; height: 24px; background: var(--color-border); border-radius: 4px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(parseHTML(skeletonHTML));
    
    const wizardState = getWizardState() || {};
    const bundle = await generateBundle(wizardState);
    if (bundle && bundle.items && bundle.items.length > 0) {
      console.log('[Project Builder] Bundle generated:', bundle);
      if (displayBundle) {
        displayBundle(bundle);
      }
    } else {
      console.error('[Project Builder] Bundle generation failed or returned empty:', bundle);
      throw new Error('Failed to generate bundle or bundle is empty');
    }
  } catch (error) {
    console.error('[Project Builder] Error in generateAndShowResults:', error);
    handleError(error, 'generateAndShowResults');
    const container = document.getElementById('bundle-container');
    if (container) {
      showErrorState(container, error, prevStep);
    }
  }
}

/**
 * Show error state using HTML template (reduces DOM manipulation)
 * @param {HTMLElement} container - Container element
 * @param {Error} error - Error object
 * @param {Function} prevStep - Function to go to previous step
 */
export function showErrorState(container, error, prevStep) {
  const svgIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>';
  const errorMessage = escapeHtml(error.message || 'Please check your selections and try again.');
  
  const html = `
    <div class="error-message">
      <span class="error-message-icon">${svgIcon}</span>
      <div>
        <div class="font-semibold mb-1">Unable to generate bundle</div>
        <div class="text-sm">${errorMessage}</div>
      </div>
    </div>
    <div class="text-center mt-6">
      <button class="btn btn-primary" id="error-go-back-btn">← Go Back</button>
    </div>
  `;
  
  container.textContent = '';
  const errorDiv = parseHTML(html);
  
  // Add event listener for go back button
  const goBackBtn = errorDiv.querySelector('#error-go-back-btn');
  if (goBackBtn && prevStep) {
    goBackBtn.addEventListener('click', prevStep);
  }
  
  container.appendChild(errorDiv);
}

/**
 * Show results (if already generated)
 * @param {Function} displayBundle - Function to display bundle
 * @param {Function} generateAndShowResults - Function to generate and show results
 */
export async function showResults(displayBundle, generateAndShowResults) {
  try {
    const wizardState = getWizardState() || {};
    if (wizardState.bundle) {
      if (displayBundle) {
        displayBundle(wizardState.bundle);
      }
    } else {
      if (generateAndShowResults) {
        await generateAndShowResults();
      }
    }
  } catch (error) {
    handleError(error, 'showResults');
  }
}

