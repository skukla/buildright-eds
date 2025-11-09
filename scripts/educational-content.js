// Educational Content - Tooltips, tips, and resource links

/**
 * Tooltip content for wizard steps
 */
export const TOOLTIPS = {
  projectType: {
    new_construction: {
      text: 'Building new structures from foundation up. Includes framing, roofing, exterior finishing.',
      icon: '🏗️'
    },
    remodel: {
      text: 'Renovating existing spaces. Includes demo, reconstruction, finishing work.',
      icon: '🔨'
    },
    repair: {
      text: 'Fixing or maintaining existing structures. Targeted material lists for specific issues.',
      icon: '🔧'
    }
  },
  complexity: {
    basic: {
      text: 'DIY-friendly, standard materials. Simple layouts. Est. completion: 1-2 weeks.',
      icon: '⭐'
    },
    moderate: {
      text: 'Some pro help recommended. Mid-range materials. Est. completion: 2-4 weeks.',
      icon: '⭐⭐'
    },
    complex: {
      text: 'Professional required. Premium materials. Custom work. Est. completion: 4+ weeks.',
      icon: '⭐⭐⭐'
    }
  },
  budget: {
    text: 'Material costs only. Labor and permits not included.',
    icon: '💰'
  }
};

/**
 * Project tips by type and complexity
 */
export const PROJECT_TIPS = {
  'remodel.bathroom': {
    basic: [
      'Typical timeline: 1-2 weeks',
      'Check local permit requirements',
      'Plan for temporary facilities',
      'Order 10% extra tile for cuts'
    ],
    moderate: [
      'Typical timeline: 2-3 weeks',
      'May require licensed plumber',
      'Consider waterproofing membrane',
      'Order 15% extra materials for waste'
    ],
    complex: [
      'Typical timeline: 3-4 weeks',
      'Requires licensed professionals',
      'Plan for custom fixtures',
      'Order 20% extra for custom work'
    ]
  },
  'remodel.kitchen': {
    basic: [
      'Typical timeline: 2-3 weeks',
      'Coordinate appliance delivery',
      'Plan for temporary cooking space',
      'Order extra drywall for patches'
    ],
    moderate: [
      'Typical timeline: 3-4 weeks',
      'May require electrical/plumbing permits',
      'Consider cabinet installation timing',
      'Order 15% extra materials'
    ],
    complex: [
      'Typical timeline: 4-6 weeks',
      'Requires multiple trades',
      'Plan for custom cabinetry',
      'Order 20% extra for custom work'
    ]
  },
  'remodel.basement': {
    basic: [
      'Typical timeline: 2-3 weeks',
      'Check moisture levels first',
      'May need vapor barrier',
      'Order extra framing lumber'
    ],
    moderate: [
      'Typical timeline: 3-4 weeks',
      'Consider egress window requirements',
      'Plan for insulation',
      'Order 15% extra materials'
    ],
    complex: [
      'Typical timeline: 4-6 weeks',
      'May require structural engineering',
      'Plan for full bathroom rough-in',
      'Order 20% extra for custom work'
    ]
  },
  'new_construction.residential_home': {
    basic: [
      'Typical timeline: 3-4 months',
      'Requires building permits',
      'Coordinate multiple trades',
      'Order materials in phases'
    ],
    moderate: [
      'Typical timeline: 4-6 months',
      'Requires general contractor',
      'Plan for inspections',
      'Order materials 2-3 weeks ahead'
    ],
    complex: [
      'Typical timeline: 6-12 months',
      'Requires architect/engineer',
      'Multiple inspections required',
      'Order custom materials early'
    ]
  },
  'new_construction.addition': {
    basic: [
      'Typical timeline: 2-3 months',
      'Requires building permits',
      'Match existing structure',
      'Order materials in phases'
    ],
    moderate: [
      'Typical timeline: 3-4 months',
      'May require structural engineer',
      'Plan for foundation work',
      'Order materials 2-3 weeks ahead'
    ],
    complex: [
      'Typical timeline: 4-6 months',
      'Requires architect approval',
      'Multiple inspections required',
      'Order custom materials early'
    ]
  },
  'repair.plumbing': {
    basic: [
      'Typical timeline: 1-2 days',
      'Shut off water supply first',
      'Have replacement parts ready',
      'Test thoroughly before finishing'
    ],
    moderate: [
      'Typical timeline: 2-3 days',
      'May require licensed plumber',
      'Check local code requirements',
      'Plan for wall/floor access'
    ],
    complex: [
      'Typical timeline: 1-2 weeks',
      'Requires licensed professional',
      'May need permits',
      'Plan for extensive repairs'
    ]
  },
  'repair.electrical': {
    basic: [
      'Typical timeline: 1 day',
      'Turn off power at breaker',
      'Use proper wire gauge',
      'Test with multimeter'
    ],
    moderate: [
      'Typical timeline: 2-3 days',
      'May require licensed electrician',
      'Check local code requirements',
      'Plan for panel upgrades'
    ],
    complex: [
      'Typical timeline: 1-2 weeks',
      'Requires licensed professional',
      'May need permits',
      'Plan for panel/service upgrade'
    ]
  },
  'repair.structural': {
    basic: [
      'Typical timeline: 3-5 days',
      'Assess damage thoroughly',
      'Use proper support materials',
      'Check load requirements'
    ],
    moderate: [
      'Typical timeline: 1-2 weeks',
      'May require structural engineer',
      'Plan for temporary supports',
      'Order engineered lumber'
    ],
    complex: [
      'Typical timeline: 2-4 weeks',
      'Requires structural engineer',
      'May need permits',
      'Plan for extensive reconstruction'
    ]
  },
  'repair.roofing': {
    basic: [
      'Typical timeline: 1-2 days',
      'Check weather forecast',
      'Use proper safety equipment',
      'Match existing shingles'
    ],
    moderate: [
      'Typical timeline: 3-5 days',
      'May require professional help',
      'Plan for underlayment replacement',
      'Order extra shingles for waste'
    ],
    complex: [
      'Typical timeline: 1-2 weeks',
      'Requires licensed roofer',
      'May need permits',
      'Plan for full roof replacement'
    ]
  }
};

/**
 * Get tips for a project
 */
export function getProjectTips(projectType, projectDetail, complexity) {
  const key = projectDetail ? `${projectType}.${projectDetail}` : projectType;
  const tips = PROJECT_TIPS[key];
  if (!tips) return [];
  
  return tips[complexity] || tips.basic || [];
}

/**
 * Resource links by project type
 */
export const RESOURCE_LINKS = {
  'remodel.bathroom': [
    { text: 'How to Frame a Bathroom Wall', url: '#' },
    { text: 'Tile Installation Guide', url: '#' },
    { text: 'Plumbing Rough-In Basics', url: '#' }
  ],
  'remodel.kitchen': [
    { text: 'Kitchen Framing Guide', url: '#' },
    { text: 'Cabinet Installation Tips', url: '#' },
    { text: 'Electrical Planning Guide', url: '#' }
  ],
  'remodel.basement': [
    { text: 'Basement Framing Basics', url: '#' },
    { text: 'Moisture Control Guide', url: '#' },
    { text: 'Egress Window Requirements', url: '#' }
  ],
  'new_construction.residential_home': [
    { text: 'Home Framing Guide', url: '#' },
    { text: 'Building Code Basics', url: '#' },
    { text: 'Material Ordering Tips', url: '#' }
  ],
  'new_construction.addition': [
    { text: 'Addition Framing Guide', url: '#' },
    { text: 'Foundation Basics', url: '#' },
    { text: 'Matching Existing Structure', url: '#' }
  ],
  'repair.plumbing': [
    { text: 'Plumbing Repair Basics', url: '#' },
    { text: 'Pipe Sizing Guide', url: '#' },
    { text: 'Code Requirements', url: '#' }
  ],
  'repair.electrical': [
    { text: 'Electrical Safety Guide', url: '#' },
    { text: 'Wire Gauge Chart', url: '#' },
    { text: 'Code Requirements', url: '#' }
  ],
  'repair.structural': [
    { text: 'Structural Repair Basics', url: '#' },
    { text: 'Load Calculations', url: '#' },
    { text: 'When to Call an Engineer', url: '#' }
  ],
  'repair.roofing': [
    { text: 'Roofing Repair Guide', url: '#' },
    { text: 'Shingle Installation', url: '#' },
    { text: 'Safety Best Practices', url: '#' }
  ]
};

/**
 * Get resource links for a project
 */
export function getResourceLinks(projectType, projectDetail) {
  const key = projectDetail ? `${projectType}.${projectDetail}` : projectType;
  return RESOURCE_LINKS[key] || [];
}

