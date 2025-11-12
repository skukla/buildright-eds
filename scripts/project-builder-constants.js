// Project Builder Constants
// Shared configuration and label mappings

export const WIZARD_CONSTANTS = {
  STEP_TRANSITION_DELAY: 300, // milliseconds
  TOTAL_STEPS: 5,
  RESIZE_DEBOUNCE_DELAY: 150, // milliseconds
  TOAST_AUTO_REMOVE_DELAY: 5000, // milliseconds
  TOAST_ANIMATION_DURATION: 300, // milliseconds
  ESTIMATION: {
    BASE_ITEMS: 12,
    BASE_PRICE: 5000
  }
};

// Step to state property mapping
export const STEP_STATE_MAP = {
  '1': 'projectType',
  '2': 'projectDetail',
  '3': 'complexity',
  '4': 'budget'
};

export const STEP_2_OPTIONS = {
  new_construction: [
    { value: 'residential_home', label: 'Residential Home' },
    { value: 'commercial_building', label: 'Commercial Building' },
    { value: 'addition', label: 'Addition' },
    { value: 'other', label: 'Other' }
  ],
  remodel: [
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'basement', label: 'Basement' },
    { value: 'whole_house', label: 'Whole House' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'other', label: 'Other' }
  ],
  repair: [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'structural', label: 'Structural' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'other', label: 'Other' }
  ]
};

export const LABELS = {
  projectType: {
    new_construction: 'New Construction',
    remodel: 'Remodel',
    repair: 'Repair'
  },
  complexity: {
    basic: 'Basic',
    moderate: 'Moderate',
    complex: 'Complex'
  },
  budget: {
    under_5k: 'Under $5,000',
    '5k_15k': '$5,000 - $15,000',
    '15k_30k': '$15,000 - $30,000'
  }
};

export const ESTIMATION_MULTIPLIERS = {
  budget: {
    under_5k: 0.5,
    '5k_15k': 1.0,
    '15k_30k': 1.8
  },
  complexity: {
    basic: 0.6,
    moderate: 1.0,
    complex: 1.5
  }
};

export const CATEGORY_MAPPING = {
  'structural_materials': 'Primary Materials',
  'framing_drywall': 'Primary Materials',
  'windows_doors': 'Primary Materials',
  'fasteners_hardware': 'Fasteners & Hardware',
  'roofing': 'Finishing Materials'
};

export const COMPONENT_GROUPS = {
  'Primary Materials': ['structural_materials', 'framing_drywall', 'windows_doors'],
  'Fasteners & Hardware': ['fasteners_hardware'],
  'Tools & Accessories': [],
  'Finishing Materials': ['roofing']
};

// Helper function to escape HTML
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper function to get label
export function getLabel(type, key) {
  return LABELS[type]?.[key] || key;
}

// Helper function to get project detail label
export function getProjectDetailLabel(projectType, projectDetail) {
  const options = STEP_2_OPTIONS[projectType] || [];
  const option = options.find(opt => opt.value === projectDetail);
  return option ? option.label : projectDetail;
}


