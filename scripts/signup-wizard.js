/**
 * Sign-Up Wizard
 * Multi-step onboarding that collects business attributes and determines persona
 */

import { authService } from './auth.js';
import { getPersona } from './persona-config.js';

let currentStep = 1;
let formData = {};

// Initialize wizard
document.addEventListener('DOMContentLoaded', () => {
  initializeWizard();
});

function initializeWizard() {
  // Next button handlers
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => nextStep());
  });
  
  // Back button handlers
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => prevStep());
  });
  
  // Submit handler
  document.querySelector('.submit-btn')?.addEventListener('click', () => submitSignup());
  
  // Listen for business attribute changes to update preview
  ['business_type', 'project_scale', 'primary_service', 'buying_behavior'].forEach(field => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener('change', () => {
        if (currentStep === 2) {
          // Store value immediately
          formData[field] = input.value;
        }
      });
    }
  });
}

function nextStep() {
  // Validate current step
  const currentStepEl = document.querySelector(`.signup-step[data-step="${currentStep}"]`);
  const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
  
  let valid = true;
  const errors = [];
  
  inputs.forEach(input => {
    // Remove previous error state
    input.classList.remove('error');
    
    if (!input.value || input.value.trim() === '') {
      input.classList.add('error');
      valid = false;
      errors.push(input.name || input.id);
    } else {
      // Store value
      formData[input.name || input.id] = input.value;
    }
  });
  
  // Special validation for password (min 8 characters)
  if (currentStep === 1) {
    const password = document.getElementById('password');
    if (password && password.value && password.value.length < 8) {
      password.classList.add('error');
      valid = false;
      alert('Password must be at least 8 characters');
      return;
    }
  }
  
  if (!valid) {
    alert('Please fill in all required fields');
    return;
  }
  
  // If moving to step 3, generate preview
  if (currentStep === 2) {
    generateExperiencePreview();
  }
  
  // Move to next step
  currentStep++;
  showStep(currentStep);
}

function prevStep() {
  currentStep--;
  showStep(currentStep);
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.signup-step').forEach(el => {
    el.hidden = true;
  });
  
  // Show current step
  const stepEl = document.querySelector(`.signup-step[data-step="${step}"]`);
  if (stepEl) {
    stepEl.hidden = false;
  }
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    if (stepNum < step) {
      el.classList.add('completed');
      el.classList.remove('active');
    } else if (stepNum === step) {
      el.classList.add('active');
      el.classList.remove('completed');
    } else {
      el.classList.remove('active', 'completed');
    }
  });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Determine persona from business attributes
 * This is the core logic that maps business profile to persona
 */
function determinePersonaFromAttributes(attributes) {
  const {
    business_type,
    project_scale,
    primary_service,
    buying_behavior
  } = attributes;
  
  // Sarah (Production Builder): High-volume residential with template ordering
  if (
    business_type === 'Production Home Builder' &&
    project_scale === 'High Volume' &&
    buying_behavior === 'Template/Repeat Orders'
  ) {
    return 'sarah';
  }
  
  // Marcus (General Contractor): General contractor or medium volume with custom planning
  if (
    business_type === 'General Contractor' ||
    (project_scale === 'Medium Volume' && buying_behavior === 'Custom Project Planning')
  ) {
    return 'marcus';
  }
  
  // Lisa (Remodeling Contractor): Remodeling focus with package deals
  if (
    business_type === 'Remodeling Contractor' ||
    (primary_service === 'Renovation/Remodel' && buying_behavior === 'Package Deals')
  ) {
    return 'lisa';
  }
  
  // David (Specialty Contractor): Specialty contractor or DIY with outdoor focus
  if (
    business_type === 'Specialty Contractor' ||
    business_type === 'Professional Homeowner' ||
    (primary_service === 'Specialty Work' && buying_behavior === 'DIY with Guidance')
  ) {
    return 'david';
  }
  
  // Kevin (Retail/Wholesale): Retail operations or maintenance/restock focus
  if (
    business_type === 'Retail/Wholesale' ||
    (project_scale === 'Maintenance/Restock' && buying_behavior === 'Quick Restock')
  ) {
    return 'kevin';
  }
  
  // Default fallback: Marcus (most versatile experience)
  return 'marcus';
}

function generateExperiencePreview() {
  // Determine which experience they'll get
  const personaId = determinePersonaFromAttributes(formData);
  
  // Get persona details from persona-config
  const persona = getPersona(personaId);
  
  // Persona-specific preview content
  const personaDetails = {
    'sarah': {
      icon: '🏗️',
      title: 'Production Builder Experience',
      subtitle: 'Optimized for high-volume residential construction',
      description: 'Streamlined for production builders with template-based ordering, bulk material management, and volume-based pricing.',
      features: [
        'Pre-configured home templates',
        'Bulk material ordering',
        'Volume-based pricing discounts',
        'Repeat order templates',
        'Multi-property management'
      ],
      productCount: '~156 products'
    },
    'marcus': {
      icon: '📋',
      title: 'General Contractor Experience',
      subtitle: 'Comprehensive tools for commercial projects',
      description: 'Complete project management tools for general contractors with multi-phase planning, custom BOMs, and job site coordination.',
      features: [
        'Project-based material wizard',
        'Multi-phase construction planning',
        'Custom BOMs (Bill of Materials)',
        'Team collaboration tools',
        'Job site delivery tracking'
      ],
      productCount: '~168 products'
    },
    'lisa': {
      icon: '✨',
      title: 'Remodeling Contractor Experience',
      subtitle: 'Premium materials for renovation projects',
      description: 'Curated packages and premium materials for remodeling contractors with room-by-room planning and quality tier selection.',
      features: [
        'Pre-configured remodeling packages',
        'Better/Best/Premium tier selection',
        'Room-by-room material planning',
        'Before/after project visualization',
        'Custom material sourcing'
      ],
      productCount: '~142 products'
    },
    'david': {
      icon: '🪵',
      title: 'Specialty Contractor Experience',
      subtitle: 'Guided workflow for specialty projects',
      description: 'Interactive project wizards for deck builders and specialty contractors with material calculators and DIY-friendly guidance.',
      features: [
        'Interactive deck builder wizard',
        'Material calculator by project',
        'DIY-friendly guidance',
        'Educational content library',
        'Progressive product filtering'
      ],
      productCount: '~35-80 products (filtered by project)'
    },
    'kevin': {
      icon: '🏪',
      title: 'Retail Operations Experience',
      subtitle: 'Quick restock and inventory management',
      description: 'Streamlined ordering for retail and wholesale operations with quick restock, inventory alerts, and scheduled deliveries.',
      features: [
        'Quick reorder dashboard',
        'Inventory velocity tracking',
        'Scheduled deliveries',
        'Multi-location management',
        'Bulk restock suggestions'
      ],
      productCount: '~58 products'
    }
  };
  
  const details = personaDetails[personaId];
  
  // Populate preview
  const previewCard = document.querySelector('.experience-preview .preview-card');
  if (!previewCard) return;
  
  previewCard.querySelector('.preview-icon').textContent = details.icon;
  previewCard.querySelector('.preview-title').textContent = details.title;
  previewCard.querySelector('.preview-subtitle').textContent = details.subtitle;
  previewCard.querySelector('.preview-description').textContent = details.description;
  
  // Features list
  const featureList = previewCard.querySelector('.feature-list');
  if (featureList) {
    featureList.innerHTML = details.features.map(f => `<li>${f}</li>`).join('');
  }
  
  // Product count
  const productCountEl = previewCard.querySelector('.product-count');
  if (productCountEl) {
    productCountEl.textContent = details.productCount;
  }
  
  // Store persona for submission
  formData.determinedPersona = personaId;
  
  console.log('[Signup] Determined persona:', personaId, 'for profile:', formData);
}

async function submitSignup() {
  // Validate terms
  const termsAccepted = document.getElementById('terms')?.checked;
  if (!termsAccepted) {
    alert('Please accept the Terms of Service and Privacy Policy');
    return;
  }
  
  console.log('[Signup] Creating account with profile:', formData);
  
  // Show loading
  const submitBtn = document.querySelector('.submit-btn');
  if (!submitBtn) return;
  
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  
  try {
    // Simulate account creation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Login with determined persona
    const success = await authService.loginWithPersona(formData.determinedPersona);
    
    if (!success) {
      throw new Error('Failed to create account');
    }
    
    console.log('[Signup] Account created successfully');
    
    // Show success message
    showSuccessMessage();
    
    // Redirect to dashboard after brief delay
    setTimeout(() => {
      const defaultRoute = authService.getDefaultRoute();
      window.location.href = defaultRoute || '../pages/dashboard.html';
    }, 2000);
    
  } catch (error) {
    console.error('[Signup] Error:', error);
    alert('Account creation failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function showSuccessMessage() {
  const step3 = document.querySelector('.signup-step[data-step="3"]');
  if (!step3) return;
  
  step3.innerHTML = `
    <div class="success-message">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Welcome to BuildRight, ${formData.firstname}!</h2>
      <p>Your account has been created successfully.</p>
      <p class="redirect-message">Redirecting you to your personalized dashboard...</p>
      <div class="loading-spinner"></div>
    </div>
  `;
}

