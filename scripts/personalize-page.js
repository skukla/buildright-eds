/**
 * Page Personalization System
 * Loads role-based fragments based on authentication state
 * 
 * This system uses role-based fragments (builder, specialty, retail)
 * rather than persona-specific fragments for better maintainability
 * 
 * Updated to use EDS-native fragment blocks instead of custom loader
 */

import { authService } from './auth.js';
import { getPersona, getRoleType, getUseCase } from './persona-config.js';
import { decorateBlock } from './scripts.js';

/**
 * Personalize the homepage with role-based fragments
 * Uses EDS-native fragment blocks
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
    
    // Update fragment blocks with personalized paths
    const heroFragment = document.querySelector('.hero-fragment');
    const featuresFragment = document.querySelector('.features-fragment');
    const ctaFragment = document.querySelector('.cta-fragment');
    
    if (heroFragment) {
      heroFragment.innerHTML = `<div>/fragments/hero-${roleType}</div>`;
    }
    if (featuresFragment) {
      featuresFragment.innerHTML = `<div>/fragments/features-${roleType}</div>`;
    }
    if (ctaFragment) {
      ctaFragment.innerHTML = `<div>/fragments/cta-${useCase}</div>`;
    }
    
    // Decorate all fragment blocks
    const fragments = document.querySelectorAll('.fragment');
    await Promise.all(Array.from(fragments).map(fragment => decorateBlock(fragment, 'fragment')));
    
    // Add dynamic personalization on top of fragments
    personalizeWithDynamicData(persona);
    
  } else {
    // Unauthenticated: fragments already have default paths in HTML
    console.log('[Personalize] Loading default fragments (unauthenticated)');
    
    // Hide features and CTA fragments for unauthenticated users
    const featuresFragment = document.querySelector('.features-fragment');
    const ctaFragment = document.querySelector('.cta-fragment');
    if (featuresFragment) featuresFragment.style.display = 'none';
    if (ctaFragment) ctaFragment.style.display = 'none';
    
    // Show unauthenticated-only sections
    const unauthSections = document.querySelectorAll('.unauthenticated-only');
    unauthSections.forEach(section => {
      section.style.display = 'block';
    });
    
    // Decorate fragment blocks (hero and footer)
    const fragments = document.querySelectorAll('.fragment');
    await Promise.all(Array.from(fragments).map(fragment => {
      if (fragment.style.display !== 'none') {
        return decorateBlock(fragment, 'fragment');
      }
      return Promise.resolve();
    }));
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
 * NOTE: For EDS-native fragment implementation, use the fragment block pattern:
 * 
 * HTML:
 * <div class="fragment" data-block-name="fragment">
 *   <div>/fragments/hero-default</div>
 * </div>
 * 
 * Then personalize by updating the inner content before decorating:
 * fragmentBlock.innerHTML = `<div>/fragments/hero-${roleType}</div>`;
 * await decorateBlock(fragmentBlock, 'fragment');
 * 
 * See personalizeHomepage() for a complete example.
 */

