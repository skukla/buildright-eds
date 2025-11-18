/**
 * Page Personalization System
 * Loads role-based fragments based on authentication state
 * 
 * This system uses role-based fragments (builder, specialty, retail)
 * rather than persona-specific fragments for better maintainability
 */

import { authService } from './auth.js';
import { getPersona, getRoleType, getUseCase } from './persona-config.js';
import { loadFragment, loadFragments } from './fragment-loader.js';

/**
 * Personalize the homepage with role-based fragments
 * @returns {Promise<void>}
 */
export async function personalizeHomepage() {
  // Wait for auth service to initialize before checking authentication
  await authService.initialize();
  
  const isAuth = authService.isAuthenticated();
  
  if (isAuth) {
    const user = authService.getCurrentUser();
    console.log('[Personalize] User:', user);
    
    // Use user.id (not user.personaId) to get the persona
    const persona = getPersona(user.id);
    console.log('[Personalize] Persona:', persona);
    
    // Get role-based attributes
    const roleType = getRoleType(persona);    // e.g., 'builder', 'specialty', 'retail'
    const useCase = getUseCase(persona);      // e.g., 'templates', 'projects', 'diy'
    
    console.log(`[Personalize] Loading fragments for role: ${roleType}, use-case: ${useCase}`);
    
    // Hide unauthenticated-only sections
    const unauthSections = document.querySelectorAll('.unauthenticated-only');
    unauthSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Load role-based fragments in parallel
    await loadFragments([
      {
        container: '.hero-container',
        path: `/fragments/hero-${roleType}`
      },
      {
        container: '.features-container',
        path: `/fragments/features-${roleType}`
      },
      {
        container: '.cta-container',
        path: `/fragments/cta-${useCase}`
      },
      {
        container: '.footer-fragment',
        path: '/fragments/footer-buildright'
      }
    ]);
    
    // Optionally: Add dynamic personalization on top of fragments
    personalizeWithDynamicData(persona);
    
  } else {
    // Load unauthenticated fragments
    console.log('[Personalize] Loading default fragments (unauthenticated)');
    
    // Clear features and CTA containers for unauthenticated users
    const featuresContainer = document.querySelector('.features-container');
    const ctaContainer = document.querySelector('.cta-container');
    if (featuresContainer) featuresContainer.innerHTML = '';
    if (ctaContainer) ctaContainer.innerHTML = '';
    
    // Show unauthenticated-only sections
    const unauthSections = document.querySelectorAll('.unauthenticated-only');
    unauthSections.forEach(section => {
      section.style.display = 'block';
    });
    
    await loadFragments([
      {
        container: '.hero-container',
        path: '/fragments/hero-default'
      },
      {
        container: '.footer-fragment',
        path: '/fragments/footer-buildright'
      }
    ]);
  }
  
  // Show content after personalization (prevents FOUC)
  document.body.classList.add('ready');
}

/**
 * Add dynamic data on top of fragment content
 * This allows for runtime personalization without creating new fragments
 * @param {Object} persona - Persona object
 */
function personalizeWithDynamicData(persona) {
  // Example: Update name dynamically (first name only)
  const nameElements = document.querySelectorAll('[data-persona-name]');
  nameElements.forEach(el => {
    const firstName = persona.name.split(' ')[0];
    el.textContent = firstName;
  });
  
  // Example: Update company dynamically
  const companyElements = document.querySelectorAll('[data-persona-company]');
  companyElements.forEach(el => {
    el.textContent = persona.company;
  });
  
  // Example: Update role dynamically
  const roleElements = document.querySelectorAll('[data-persona-role]');
  roleElements.forEach(el => {
    el.textContent = persona.role;
  });
}

/**
 * Personalize any page with fragment support
 * Generic function for pages that need custom fragment configurations
 * 
 * @param {Object} config - Configuration object
 * @param {Array<{container: string, path: string, useRole?: boolean, useUseCase?: boolean}>} config.fragments - Array of fragment configs
 * @param {Function} config.onComplete - Callback after personalization
 * @returns {Promise<void>}
 * 
 * @example
 * await personalizePage({
 *   fragments: [
 *     { container: '.hero', path: '/fragments/hero-{role}', useRole: true },
 *     { container: '.cta', path: '/fragments/cta-{useCase}', useUseCase: true }
 *   ],
 *   onComplete: (persona) => console.log('Personalized for', persona.name)
 * });
 */
export async function personalizePage(config = {}) {
  const isAuth = authService.isAuthenticated();
  
  if (!config.fragments || config.fragments.length === 0) {
    console.warn('[Personalize] No fragments configured');
    return;
  }
  
  const user = isAuth ? authService.getCurrentUser() : null;
  const persona = user ? getPersona(user.personaId) : null;
  
  // Resolve fragment paths based on persona
  const resolvedFragments = config.fragments.map(fragment => {
    let path = fragment.path;
    
    // Replace {role} placeholder
    if (fragment.useRole && path.includes('{role}')) {
      const roleType = persona ? getRoleType(persona) : 'default';
      path = path.replace('{role}', roleType);
    }
    
    // Replace {useCase} placeholder
    if (fragment.useUseCase && path.includes('{useCase}')) {
      const useCase = persona ? getUseCase(persona) : 'default';
      path = path.replace('{useCase}', useCase);
    }
    
    // Replace {persona} placeholder (for backward compatibility)
    if (path.includes('{persona}')) {
      path = path.replace('{persona}', persona ? persona.id : 'default');
    }
    
    return {
      container: fragment.container,
      path
    };
  });
  
  // Load all fragments
  await loadFragments(resolvedFragments);
  
  // Run callback if provided
  if (config.onComplete && persona) {
    config.onComplete(persona);
  }
  
  // Show content
  document.body.classList.add('ready');
}

