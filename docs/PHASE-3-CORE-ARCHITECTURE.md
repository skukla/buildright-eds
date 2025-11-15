# Phase 3: Core Architecture

## Overview

**Duration**: 1-2 weeks  
**Dependencies**: Phase 0 (research), Phase 1 (data)  
**Status**: Not Started

Build foundational architecture including persona configuration system, mock ACO service layer, authentication system, and generic page templates.

**CRITICAL**: All ACO interactions are MOCKED to mirror eventual production API behavior.

---

## Objectives

1. Create persona configuration system
2. Build mock ACO service layer
3. Implement authentication system (demo + production plan)
4. Create generic dashboard and builder page templates
5. Establish routing patterns
6. Set up state management

---

## Task 1: Persona Configuration System

### 1.1 Create Persona Config Module

**File**: `scripts/persona-config.js`

```javascript
/**
 * Persona Configuration System
 * Defines all personas and their attributes
 */

export const CUSTOMER_GROUPS = {
  COMMERCIAL_TIER1: 'commercial_tier1',
  COMMERCIAL_TIER2: 'commercial_tier2',
  RESIDENTIAL_BUILDER: 'residential_builder',
  PRO_SPECIALTY: 'pro_specialty',
  RETAIL_HOMEOWNER: 'retail_homeowner',
  RETAIL_CHAIN_BUYER: 'retail_chain_buyer'
};

export const PERSONAS = {
  SARAH: {
    id: 'sarah_martinez',
    name: 'Sarah Martinez',
    role: 'Production Builder',
    company: 'Sunbelt Homes',
    customerGroup: CUSTOMER_GROUPS.COMMERCIAL_TIER2,
    avatar: '/images/avatars/sarah.jpg',
    defaultRoute: '/pages/dashboard.html?view=templates',
    features: {
      templates: true,
      bomGeneration: true,
      phaseOrdering: true,
      repeatOrdering: true
    },
    preferences: {
      defaultView: 'templates',
      showFloorPlans: true,
      showAnalytics: true
    }
  },
  
  MARCUS: {
    id: 'marcus_johnson',
    name: 'Marcus Johnson',
    role: 'General Contractor',
    company: 'Johnson Construction',
    customerGroup: CUSTOMER_GROUPS.RESIDENTIAL_BUILDER,
    avatar: '/images/avatars/marcus.jpg',
    defaultRoute: '/pages/builder.html?type=project',
    features: {
      projectWizard: true,
      phaseSelection: true,
      qualityTiers: true,
      bomGeneration: true
    },
    preferences: {
      defaultView: 'projects',
      showEducationalContent: true,
      guidedMode: true
    }
  },
  
  LISA: {
    id: 'lisa_chen',
    name: 'Lisa Chen',
    role: 'Remodeling Contractor',
    company: 'Chen Design Build',
    customerGroup: CUSTOMER_GROUPS.PRO_SPECIALTY,
    avatar: '/images/avatars/lisa.jpg',
    defaultRoute: '/pages/builder.html?type=package',
    features: {
      packageBuilder: true,
      customization: true,
      visualization: true,
      quoteGeneration: true
    },
    preferences: {
      defaultView: 'packages',
      showVisuals: true,
      comparePackages: true
    }
  },
  
  DAVID: {
    id: 'david_thompson',
    name: 'David Thompson',
    role: 'Pro Homeowner',
    company: null,
    customerGroup: CUSTOMER_GROUPS.RETAIL_HOMEOWNER,
    avatar: '/images/avatars/david.jpg',
    defaultRoute: '/pages/builder.html?type=deck',
    features: {
      deckBuilder: true,
      educationalContent: true,
      diyGuidance: true,
      productRecommendations: true
    },
    preferences: {
      defaultView: 'deck_builder',
      showEducationalContent: true,
      guidedMode: true
    }
  },
  
  KEVIN: {
    id: 'kevin_rodriguez',
    name: 'Kevin Rodriguez',
    role: 'Store Manager',
    company: 'BuildRight Store #247',
    customerGroup: CUSTOMER_GROUPS.RETAIL_CHAIN_BUYER,
    avatar: '/images/avatars/kevin.jpg',
    defaultRoute: '/pages/dashboard.html?view=restock',
    features: {
      restockDashboard: true,
      velocityAnalysis: true,
      smartSuggestions: true,
      bulkOrdering: true
    },
    preferences: {
      defaultView: 'restock',
      showVelocity: true,
      priorityIndicators: true
    }
  }
};

/**
 * Get persona by ID
 */
export function getPersona(personaId) {
  return Object.values(PERSONAS).find(p => p.id === personaId);
}

/**
 * Get all personas as array
 */
export function getAllPersonas() {
  return Object.values(PERSONAS);
}

/**
 * Get personas by customer group
 */
export function getPersonasByGroup(customerGroup) {
  return Object.values(PERSONAS).filter(p => p.customerGroup === customerGroup);
}

/**
 * Check if persona has feature
 */
export function hasFeature(personaId, feature) {
  const persona = getPersona(personaId);
  return persona?.features[feature] === true;
}

/**
 * Get persona preference
 */
export function getPreference(personaId, prefKey) {
  const persona = getPersona(personaId);
  return persona?.preferences[prefKey];
}
```

**Deliverable**: `scripts/persona-config.js`

---

### 1.2 Unit Tests for Persona Config

**File**: `scripts/__tests__/persona-config.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import {
  PERSONAS,
  getPersona,
  getAllPersonas,
  getPersonasByGroup,
  hasFeature,
  getPreference
} from '../persona-config.js';

describe('Persona Configuration', () => {
  it('should have 5 personas defined', () => {
    expect(getAllPersonas()).toHaveLength(5);
  });
  
  it('should get persona by ID', () => {
    const sarah = getPersona('sarah_martinez');
    expect(sarah).toBeDefined();
    expect(sarah.name).toBe('Sarah Martinez');
  });
  
  it('should filter personas by customer group', () => {
    const builders = getPersonasByGroup('residential_builder');
    expect(builders.length).toBeGreaterThan(0);
  });
  
  it('should check feature availability', () => {
    expect(hasFeature('sarah_martinez', 'templates')).toBe(true);
    expect(hasFeature('sarah_martinez', 'deckBuilder')).toBe(false);
  });
  
  it('should get persona preferences', () => {
    const view = getPreference('marcus_johnson', 'defaultView');
    expect(view).toBe('projects');
  });
});
```

**Deliverable**: Unit tests for persona config

---

## Task 2: Mock ACO Service Layer

### 2.1 Create Mock ACO Service

**File**: `scripts/aco-service.js`

```javascript
/**
 * Mock ACO Service Layer
 * Simulates Adobe Commerce Optimizer API behavior
 * 
 * NOTE: This is a MOCK. Real production will connect to ACO API.
 * Keep API signatures matching expected ACO format.
 */

import { loadMockProducts } from './data-mock.js';
import { CUSTOMER_GROUPS } from './persona-config.js';

// Simulate network latency for realistic loading states
const MOCK_LATENCY_MS = 300;

class MockACOService {
  constructor() {
    this.products = [];
    this.initialized = false;
  }
  
  /**
   * Initialize service (load mock data)
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('[Mock ACO] Initializing...');
    this.products = await loadMockProducts();
    this.initialized = true;
    console.log(`[Mock ACO] Loaded ${this.products.length} products`);
  }
  
  /**
   * Get products with filtering
   * Simulates ACO catalog query with triggered policies
   */
  async getProducts(options = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const {
      filters = {},
      userContext = {},
      policy = null,
      limit = 100,
      offset = 0
    } = options;
    
    console.log('[Mock ACO] getProducts:', { filters, policy, userContext });
    
    let filteredProducts = [...this.products];
    
    // Apply triggered policy if specified
    if (policy) {
      filteredProducts = this._applyPolicy(filteredProducts, policy);
    }
    
    // Apply attribute filters
    Object.entries(filters).forEach(([attr, value]) => {
      filteredProducts = filteredProducts.filter(product => {
        const attrValue = product.attributes?.[attr];
        if (Array.isArray(attrValue)) {
          return attrValue.includes(value);
        }
        return attrValue === value;
      });
    });
    
    // Apply customer group filtering (if needed)
    if (userContext.customerGroup) {
      // In production, this would filter based on visibility rules
      // For mock, we show all products but log the context
      console.log(`[Mock ACO] Customer group: ${userContext.customerGroup}`);
    }
    
    // Pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
    
    return {
      products: paginatedProducts,
      totalCount: filteredProducts.length,
      offset,
      limit,
      facets: this._generateFacets(filteredProducts),
      appliedPolicy: policy
    };
  }
  
  /**
   * Get pricing for products (customer-group-specific)
   * Simulates ACO pricing API
   */
  async getPricing(options = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const {
      productIds = [],
      customerGroup = CUSTOMER_GROUPS.RETAIL_HOMEOWNER,
      quantity = 1
    } = options;
    
    console.log('[Mock ACO] getPricing:', { productIds, customerGroup, quantity });
    
    const pricing = {};
    
    productIds.forEach(sku => {
      const product = this.products.find(p => p.sku === sku);
      if (product) {
        pricing[sku] = this._calculatePrice(product, customerGroup, quantity);
      }
    });
    
    return { pricing, customerGroup, quantity };
  }
  
  /**
   * Apply triggered policy (CCDM filtering)
   */
  _applyPolicy(products, policyName) {
    console.log(`[Mock ACO] Applying policy: ${policyName}`);
    
    // Define policy filters
    const policies = {
      // Project type policies
      'project_new_construction': (p) => {
        const categories = ['structural_materials', 'fasteners_hardware', 'roofing'];
        return categories.includes(p.category);
      },
      'project_remodel': (p) => true, // Show all
      
      // Construction phase policies
      'phase_foundation_framing': (p) => {
        return p.attributes?.construction_phase === 'foundation_framing';
      },
      'phase_envelope': (p) => {
        return p.attributes?.construction_phase === 'envelope';
      },
      'phase_interior_finish': (p) => {
        return p.attributes?.construction_phase === 'interior_finish';
      },
      
      // Quality tier policies
      'quality_builder_grade': (p) => {
        return p.attributes?.quality_tier === 'builder_grade';
      },
      'quality_professional': (p) => {
        return p.attributes?.quality_tier === 'professional';
      },
      'quality_premium': (p) => {
        return p.attributes?.quality_tier === 'premium';
      },
      
      // Deck builder policies
      'deck_compatible': (p) => {
        return p.attributes?.deck_compatible === true;
      },
      'deck_rectangular': (p) => {
        return p.attributes?.deck_shape?.includes('rectangular');
      },
      'deck_l_shaped': (p) => {
        return p.attributes?.deck_shape?.includes('l_shaped');
      },
      'deck_material_wood': (p) => {
        return p.attributes?.deck_material_type === 'wood';
      },
      'deck_material_composite': (p) => {
        return p.attributes?.deck_material_type === 'composite';
      },
      
      // Package tier policies
      'package_good': (p) => {
        return p.attributes?.package_tier?.includes('good');
      },
      'package_better': (p) => {
        return p.attributes?.package_tier?.includes('better');
      },
      'package_best': (p) => {
        return p.attributes?.package_tier?.includes('best');
      }
    };
    
    const policyFilter = policies[policyName];
    
    if (!policyFilter) {
      console.warn(`[Mock ACO] Unknown policy: ${policyName}`);
      return products;
    }
    
    return products.filter(policyFilter);
  }
  
  /**
   * Calculate price based on customer group and quantity
   */
  _calculatePrice(product, customerGroup, quantity) {
    const basePrice = product.price || 0;
    
    // Customer group pricing multipliers (from Phase 1)
    const groupMultipliers = {
      [CUSTOMER_GROUPS.COMMERCIAL_TIER1]: 0.93,
      [CUSTOMER_GROUPS.COMMERCIAL_TIER2]: 0.95,
      [CUSTOMER_GROUPS.RESIDENTIAL_BUILDER]: 0.97,
      [CUSTOMER_GROUPS.PRO_SPECIALTY]: 0.98,
      [CUSTOMER_GROUPS.RETAIL_HOMEOWNER]: 1.07,
      [CUSTOMER_GROUPS.RETAIL_CHAIN_BUYER]: 0.88
    };
    
    // Volume tiers
    const volumeMultipliers = {
      '1-99': 1.0,
      '100-293': 0.98,
      '294+': 0.96
    };
    
    let volumeTier = '1-99';
    if (quantity >= 294) volumeTier = '294+';
    else if (quantity >= 100) volumeTier = '100-293';
    
    const groupMultiplier = groupMultipliers[customerGroup] || 1.0;
    const volumeMultiplier = volumeMultipliers[volumeTier];
    
    const unitPrice = basePrice * groupMultiplier * volumeMultiplier;
    const totalPrice = unitPrice * quantity;
    
    return {
      basePrice,
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      customerGroup,
      volumeTier,
      quantity
    };
  }
  
  /**
   * Generate facets for filtering
   */
  _generateFacets(products) {
    const facets = {
      categories: {},
      construction_phase: {},
      quality_tier: {},
      deck_material_type: {},
      package_tier: {}
    };
    
    products.forEach(product => {
      // Category facet
      if (product.category) {
        facets.categories[product.category] = 
          (facets.categories[product.category] || 0) + 1;
      }
      
      // Attribute facets
      if (product.attributes) {
        ['construction_phase', 'quality_tier', 'deck_material_type'].forEach(attr => {
          const value = product.attributes[attr];
          if (value) {
            facets[attr][value] = (facets[attr][value] || 0) + 1;
          }
        });
        
        // Package tier (array attribute)
        if (Array.isArray(product.attributes.package_tier)) {
          product.attributes.package_tier.forEach(tier => {
            facets.package_tier[tier] = (facets.package_tier[tier] || 0) + 1;
          });
        }
      }
    });
    
    return facets;
  }
  
  /**
   * Simulate network latency
   */
  async _simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS));
  }
  
  /**
   * Get user context (mock)
   */
  async getUserContext(userId) {
    await this._simulateLatency();
    
    // In production, this would fetch from ACO
    // For mock, return based on localStorage persona
    const personaId = localStorage.getItem('currentPersona');
    const persona = await import('./persona-config.js')
      .then(m => m.getPersona(personaId));
    
    if (!persona) {
      return {
        userId,
        customerGroup: CUSTOMER_GROUPS.RETAIL_HOMEOWNER,
        policies: []
      };
    }
    
    return {
      userId,
      customerGroup: persona.customerGroup,
      personaId: persona.id,
      policies: [] // Policies applied server-side in production
    };
  }
}

// Singleton instance
export const acoService = new MockACOService();

// Export for testing
export { MockACOService };
```

**Deliverable**: `scripts/aco-service.js`

---

### 2.2 Unit Tests for ACO Service

**File**: `scripts/__tests__/aco-service.test.js`

```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import { MockACOService } from '../aco-service.js';

describe('Mock ACO Service', () => {
  let service;
  
  beforeAll(async () => {
    service = new MockACOService();
    await service.initialize();
  });
  
  it('should load mock products', async () => {
    const result = await service.getProducts();
    expect(result.products.length).toBeGreaterThan(0);
  });
  
  it('should filter by policy', async () => {
    const result = await service.getProducts({
      policy: 'deck_compatible'
    });
    
    expect(result.products.every(p => p.attributes?.deck_compatible)).toBe(true);
  });
  
  it('should filter by attribute', async () => {
    const result = await service.getProducts({
      filters: { construction_phase: 'foundation_framing' }
    });
    
    expect(result.products.every(p => 
      p.attributes?.construction_phase === 'foundation_framing'
    )).toBe(true);
  });
  
  it('should calculate customer group pricing', async () => {
    const result = await service.getPricing({
      productIds: ['PROD123'],
      customerGroup: 'commercial_tier2',
      quantity: 1
    });
    
    expect(result.pricing['PROD123']).toBeDefined();
    expect(result.pricing['PROD123'].customerGroup).toBe('commercial_tier2');
  });
  
  it('should apply volume pricing', async () => {
    const result = await service.getPricing({
      productIds: ['PROD123'],
      customerGroup: 'residential_builder',
      quantity: 150
    });
    
    expect(result.pricing['PROD123'].volumeTier).toBe('100-293');
  });
  
  it('should return facets', async () => {
    const result = await service.getProducts();
    expect(result.facets).toBeDefined();
    expect(result.facets.categories).toBeDefined();
  });
});
```

**Deliverable**: Unit tests for ACO service

---

## Task 3: Authentication System

### 3.1 Create Auth Module

**File**: `scripts/auth.js`

```javascript
/**
 * Authentication System
 * 
 * DEMO MODE: Select persona from login page
 * PRODUCTION MODE (Future): Integrate with Adobe Commerce Auth Dropin
 * 
 * This file handles both modes with clear separation.
 */

import { getPersona, PERSONAS } from './persona-config.js';
import { acoService } from './aco-service.js';

const AUTH_STORAGE_KEY = 'buildright_auth';
const PERSONA_STORAGE_KEY = 'currentPersona';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isDemo = true; // Set to false for production
  }
  
  /**
   * Initialize auth service
   */
  async initialize() {
    if (this.isDemo) {
      await this._initializeDemoMode();
    } else {
      await this._initializeProductionMode();
    }
  }
  
  /**
   * Demo mode: Load persona from localStorage
   */
  async _initializeDemoMode() {
    const personaId = localStorage.getItem(PERSONA_STORAGE_KEY);
    
    if (personaId) {
      const persona = getPersona(personaId);
      if (persona) {
        this.currentUser = {
          id: persona.id,
          name: persona.name,
          role: persona.role,
          company: persona.company,
          customerGroup: persona.customerGroup,
          persona
        };
        
        console.log('[Auth Demo] Loaded persona:', persona.name);
      }
    }
  }
  
  /**
   * Production mode: Use Commerce Auth Dropin (future)
   */
  async _initializeProductionMode() {
    // TODO: Initialize Adobe Commerce Auth Dropin
    // const authDropin = await window.commerce?.auth?.initialize();
    // this.currentUser = await authDropin.getUser();
    
    console.log('[Auth] Production mode not yet implemented');
  }
  
  /**
   * Login (demo mode)
   */
  async loginWithPersona(personaId) {
    if (!this.isDemo) {
      throw new Error('loginWithPersona only available in demo mode');
    }
    
    const persona = getPersona(personaId);
    if (!persona) {
      throw new Error(`Invalid persona: ${personaId}`);
    }
    
    // Store persona selection
    localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
    
    this.currentUser = {
      id: persona.id,
      name: persona.name,
      role: persona.role,
      company: persona.company,
      customerGroup: persona.customerGroup,
      persona
    };
    
    // Get user context from mock ACO
    const userContext = await acoService.getUserContext(persona.id);
    this.currentUser.acoContext = userContext;
    
    console.log('[Auth Demo] Logged in as:', persona.name);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { user: this.currentUser }
    }));
    
    return this.currentUser;
  }
  
  /**
   * Login (production mode)
   */
  async login(credentials) {
    if (this.isDemo) {
      throw new Error('Use loginWithPersona in demo mode');
    }
    
    // TODO: Implement Commerce Auth Dropin login
    // const authDropin = window.commerce?.auth;
    // this.currentUser = await authDropin.login(credentials);
    
    console.log('[Auth] Production login not yet implemented');
  }
  
  /**
   * Logout
   */
  async logout() {
    if (this.isDemo) {
      localStorage.removeItem(PERSONA_STORAGE_KEY);
    } else {
      // TODO: Call Auth Dropin logout
      // await window.commerce?.auth?.logout();
    }
    
    this.currentUser = null;
    
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    console.log('[Auth] Logged out');
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }
  
  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Get customer group
   */
  getCustomerGroup() {
    return this.currentUser?.customerGroup || null;
  }
  
  /**
   * Get persona (demo mode)
   */
  getPersona() {
    return this.currentUser?.persona || null;
  }
  
  /**
   * Check if user has feature access
   */
  hasFeature(feature) {
    return this.currentUser?.persona?.features[feature] === true;
  }
  
  /**
   * Require authentication (redirect if not authenticated)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  }
}

// Singleton instance
export const authService = new AuthService();

// Export for testing
export { AuthService };
```

**Deliverable**: `scripts/auth.js`

---

### 3.2 Unit Tests for Auth Service

**File**: `scripts/__tests__/auth.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../auth.js';

describe('Auth Service (Demo Mode)', () => {
  let authService;
  
  beforeEach(() => {
    authService = new AuthService();
    authService.isDemo = true;
    localStorage.clear();
  });
  
  it('should login with persona', async () => {
    await authService.loginWithPersona('sarah_martinez');
    
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getCurrentUser().name).toBe('Sarah Martinez');
  });
  
  it('should store persona in localStorage', async () => {
    await authService.loginWithPersona('marcus_johnson');
    
    const stored = localStorage.getItem('currentPersona');
    expect(stored).toBe('marcus_johnson');
  });
  
  it('should logout', async () => {
    await authService.loginWithPersona('lisa_chen');
    await authService.logout();
    
    expect(authService.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('currentPersona')).toBeNull();
  });
  
  it('should get customer group', async () => {
    await authService.loginWithPersona('david_thompson');
    
    const group = authService.getCustomerGroup();
    expect(group).toBe('retail_homeowner');
  });
  
  it('should check feature access', async () => {
    await authService.loginWithPersona('sarah_martinez');
    
    expect(authService.hasFeature('templates')).toBe(true);
    expect(authService.hasFeature('deckBuilder')).toBe(false);
  });
});
```

**Deliverable**: Unit tests for auth service

---

## Task 4: Generic Page Templates

### 4.1 Create Generic Dashboard Page

**File**: `pages/dashboard.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - BuildRight</title>
  <link rel="stylesheet" href="/styles/styles.css">
  <script type="module" src="/scripts/dashboard.js"></script>
</head>
<body>
  <!-- Header block -->
  <div class="header-block" data-block-name="header"></div>
  
  <!-- Main content -->
  <main class="dashboard-container">
    <!-- Persona-specific content loaded by dashboard.js -->
    <div id="dashboard-content" class="dashboard-content">
      <!-- Loading state -->
      <div class="loading-overlay" data-block-name="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  </main>
  
  <!-- Footer block -->
  <div class="footer-block" data-block-name="footer"></div>
</body>
</html>
```

**Deliverable**: `pages/dashboard.html`

---

### 4.2 Create Dashboard Router

**File**: `scripts/dashboard.js`

```javascript
/**
 * Generic Dashboard Router
 * Routes to persona-specific dashboard modules
 */

import { authService } from './auth.js';
import { loadBlock, decorateBlocks } from './scripts.js';

class DashboardRouter {
  constructor() {
    this.contentContainer = null;
  }
  
  async initialize() {
    // Require authentication
    if (!authService.requireAuth()) return;
    
    await authService.initialize();
    
    this.contentContainer = document.getElementById('dashboard-content');
    
    // Get view parameter or use persona default
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || this._getDefaultView();
    
    await this.loadDashboard(view);
  }
  
  /**
   * Get default view for current persona
   */
  _getDefaultView() {
    const persona = authService.getPersona();
    return persona?.preferences?.defaultView || 'overview';
  }
  
  /**
   * Load persona-specific dashboard
   */
  async loadDashboard(view) {
    console.log(`[Dashboard] Loading view: ${view}`);
    
    // Show loading
    this._showLoading();
    
    try {
      // Dynamic import of dashboard module
      const dashboardModule = await this._getDashboardModule(view);
      
      // Clear loading
      this.contentContainer.innerHTML = '';
      
      // Initialize dashboard
      await dashboardModule.initialize(this.contentContainer);
      
      // Decorate any blocks in dashboard content
      decorateBlocks(this.contentContainer);
      
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard:', error);
      this._showError(error.message);
    }
  }
  
  /**
   * Get dashboard module for view
   */
  async _getDashboardModule(view) {
    const moduleMap = {
      'templates': './dashboards/template-dashboard.js',
      'projects': './dashboards/project-dashboard.js',
      'packages': './dashboards/package-dashboard.js',
      'restock': './dashboards/restock-dashboard.js',
      'overview': './dashboards/overview-dashboard.js'
    };
    
    const modulePath = moduleMap[view];
    if (!modulePath) {
      throw new Error(`Unknown dashboard view: ${view}`);
    }
    
    return await import(modulePath);
  }
  
  /**
   * Show loading state
   */
  _showLoading() {
    // Loading overlay already in HTML
  }
  
  /**
   * Show error state
   */
  _showError(message) {
    this.contentContainer.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Dashboard</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
}

// Initialize on page load
const router = new DashboardRouter();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => router.initialize());
} else {
  router.initialize();
}

export { DashboardRouter };
```

**Deliverable**: `scripts/dashboard.js`

---

### 4.3 Create Generic Builder Page

**File**: `pages/builder.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Builder - BuildRight</title>
  <link rel="stylesheet" href="/styles/styles.css">
  <script type="module" src="/scripts/builder.js"></script>
</head>
<body>
  <!-- Header block -->
  <div class="header-block" data-block-name="header"></div>
  
  <!-- Builder layout: sidebar + main -->
  <div class="builder-layout">
    <!-- Wizard progress sidebar -->
    <aside class="builder-sidebar">
      <div id="wizard-progress" data-block-name="wizard-vertical-progress"></div>
    </aside>
    
    <!-- Main builder content -->
    <main class="builder-content">
      <div id="builder-main">
        <!-- Loading state -->
        <div class="loading-overlay" data-block-name="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Loading builder...</p>
        </div>
      </div>
    </main>
  </div>
  
  <!-- Footer block -->
  <div class="footer-block" data-block-name="footer"></div>
</body>
</html>
```

**Deliverable**: `pages/builder.html`

---

### 4.4 Create Builder Router

**File**: `scripts/builder.js`

```javascript
/**
 * Generic Builder Router
 * Routes to persona-specific builder modules
 */

import { authService } from './auth.js';
import { decorateBlocks } from './scripts.js';

class BuilderRouter {
  constructor() {
    this.contentContainer = null;
    this.builderModule = null;
  }
  
  async initialize() {
    // Require authentication
    if (!authService.requireAuth()) return;
    
    await authService.initialize();
    
    this.contentContainer = document.getElementById('builder-main');
    
    // Get builder type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (!type) {
      this._showError('No builder type specified');
      return;
    }
    
    await this.loadBuilder(type);
  }
  
  /**
   * Load persona-specific builder
   */
  async loadBuilder(type) {
    console.log(`[Builder] Loading builder: ${type}`);
    
    // Show loading
    this._showLoading();
    
    try {
      // Dynamic import of builder module
      this.builderModule = await this._getBuilderModule(type);
      
      // Clear loading
      this.contentContainer.innerHTML = '';
      
      // Initialize builder
      await this.builderModule.initialize(this.contentContainer);
      
      // Decorate blocks
      decorateBlocks(this.contentContainer);
      
    } catch (error) {
      console.error('[Builder] Error loading builder:', error);
      this._showError(error.message);
    }
  }
  
  /**
   * Get builder module for type
   */
  async _getBuilderModule(type) {
    const moduleMap = {
      'project': './builders/project-wizard.js',
      'deck': './builders/deck-builder.js',
      'package': './builders/package-builder.js'
    };
    
    const modulePath = moduleMap[type];
    if (!modulePath) {
      throw new Error(`Unknown builder type: ${type}`);
    }
    
    return await import(modulePath);
  }
  
  /**
   * Show loading state
   */
  _showLoading() {
    // Loading overlay already in HTML
  }
  
  /**
   * Show error state
   */
  _showError(message) {
    this.contentContainer.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Builder</h2>
        <p>${message}</p>
        <a href="/pages/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
      </div>
    `;
  }
}

// Initialize on page load
const router = new BuilderRouter();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => router.initialize());
} else {
  router.initialize();
}

export { BuilderRouter };
```

**Deliverable**: `scripts/builder.js`

---

## Success Criteria

✅ Persona configuration system created with 5 personas  
✅ Mock ACO service layer implemented  
✅ Mock ACO matches expected production API format  
✅ Authentication system supports demo mode  
✅ Authentication has plan for Commerce Auth Dropin integration  
✅ Generic dashboard page created  
✅ Generic builder page created  
✅ Dashboard router dynamically loads persona dashboards  
✅ Builder router dynamically loads persona builders  
✅ Unit tests pass for all modules  
✅ No hard-coded persona logic in generic files

---

## Testing/Validation

### Unit Tests
- [ ] Persona config tests pass
- [ ] ACO service tests pass
- [ ] Auth service tests pass

### Integration Tests
- [ ] Dashboard router loads all dashboard types
- [ ] Builder router loads all builder types
- [ ] Auth service integrates with ACO service
- [ ] Persona switching works correctly

### Manual Testing
- [ ] Login with each persona
- [ ] Verify persona context persists across pages
- [ ] Verify customer group affects pricing
- [ ] Verify policy filtering works
- [ ] Test logout and re-login

---

## Deliverables Checklist

### Code Files
- [ ] `scripts/persona-config.js`
- [ ] `scripts/aco-service.js`
- [ ] `scripts/auth.js`
- [ ] `scripts/dashboard.js`
- [ ] `scripts/builder.js`
- [ ] `pages/dashboard.html`
- [ ] `pages/builder.html`

### Test Files
- [ ] `scripts/__tests__/persona-config.test.js`
- [ ] `scripts/__tests__/aco-service.test.js`
- [ ] `scripts/__tests__/auth.test.js`

### Documentation
- [ ] Architecture decision records updated
- [ ] API documentation for mock ACO service

---

## Next Steps

Upon completion of Phase 3:
1. **Phase 4**: Build shared EDS blocks using this architecture
2. **Phase 5**: Refactor existing pages to use auth system
3. **Phase 6**: Build persona-specific dashboards and builders

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `PHASE-0-RESEARCH-AND-DECISIONS.md` - Architecture decisions
- `PHASE-1-ACO-DATA-FOUNDATION.md` - Data structure

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

