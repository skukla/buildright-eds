// Filters sidebar block decoration
export default function decorate(block) {
  // Store current facets
  let currentFacets = {};
  
  // Toggle filter sections
  const filterToggles = block.querySelectorAll('.filter-toggle');
  filterToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const filterId = toggle.getAttribute('data-filter');
      const content = block.querySelector(`#filter-${filterId}`);
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      
      toggle.setAttribute('aria-expanded', !isExpanded);
      if (content) {
        content.classList.toggle('active');
      }
    });
    
    // Set initial state based on HTML attribute
    const filterId = toggle.getAttribute('data-filter');
    const content = block.querySelector(`#filter-${filterId}`);
    const isInitiallyExpanded = toggle.getAttribute('aria-expanded') === 'true';
    if (content && isInitiallyExpanded) {
      content.classList.add('active');
    }
  });

  // Clear filters
  const clearBtn = block.querySelector('#clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const checkboxes = block.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.id.includes('all') || cb.id.includes('proj-all') || cb.id.includes('avail-all')) {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
      });
      
      const priceInputs = block.querySelectorAll('#price-min, #price-max');
      priceInputs.forEach(input => input.value = '');
      
      // Trigger filter update with reset flag
      window.dispatchEvent(new CustomEvent('filtersChanged', { 
        detail: { reset: true }
      }));
    });
  }

  // Collect active filters and emit event
  function emitFilters() {
    const filters = {};
    
    // Category filters
    const categoryCheckboxes = block.querySelectorAll('input[name="category"]:checked');
    const selectedCategories = Array.from(categoryCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== ''); // Exclude "all"
    
    if (selectedCategories.length > 0) {
      filters.category = selectedCategories;
    }
    
    // Project type filters
    const projectCheckboxes = block.querySelectorAll('input[name="project"]:checked');
    const selectedProjects = Array.from(projectCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== '');
    
    if (selectedProjects.length > 0) {
      filters.project_type = selectedProjects;
    }
    
    // Availability filters
    const availCheckboxes = block.querySelectorAll('input[name="availability"]:checked');
    const selectedAvail = Array.from(availCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== '');
    
    if (selectedAvail.length > 0) {
      filters.availability = selectedAvail;
    }
    
    // Price range filters
    const minPrice = block.querySelector('#price-min')?.value;
    const maxPrice = block.querySelector('#price-max')?.value;
    
    if (minPrice || maxPrice) {
      filters.price_range = {
        min: minPrice ? parseFloat(minPrice) : null,
        max: maxPrice ? parseFloat(maxPrice) : null
      };
    }
    
    console.log('[Filters Sidebar] Emitting filters:', filters);
    
    // Dispatch filter change event
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: { filters }
    }));
  }

  // Filter change handlers
  const checkboxes = block.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Uncheck "all" if specific option is selected
      if (!checkbox.id.includes('all') && checkbox.checked) {
        const allCheckbox = checkbox.closest('.filter-content')?.querySelector('input[value=""]');
        if (allCheckbox) {
          allCheckbox.checked = false;
        }
      }
      
      // Check "all" if it's selected
      if (checkbox.id.includes('all') && checkbox.checked) {
        const otherCheckboxes = checkbox.closest('.filter-content')?.querySelectorAll('input:not([value=""])');
        otherCheckboxes?.forEach(cb => cb.checked = false);
      }
      
      // Emit filters
      emitFilters();
    });
  });
  
  // Price range apply button
  const priceApplyBtn = block.querySelector('.filter-price-apply');
  if (priceApplyBtn) {
    priceApplyBtn.addEventListener('click', () => {
      emitFilters();
    });
  }
  
  // Listen for facet updates from ACO
  window.addEventListener('facetsUpdated', (event) => {
    if (!event.detail?.facets) return;
    
    currentFacets = event.detail.facets;
    console.log('[Filters Sidebar] Received facets:', currentFacets);
    
    // Update filter counts based on facets
    updateFilterCounts(block, currentFacets);
  });
}

/**
 * Update filter counts based on facets from ACO
 */
function updateFilterCounts(block, facets) {
  // Update category counts
  if (facets.categories) {
    Object.entries(facets.categories).forEach(([category, count]) => {
      const checkbox = block.querySelector(`input[name="category"][value="${category}"]`);
      if (checkbox) {
        const countEl = checkbox.parentElement.querySelector('.filter-count');
        if (countEl) {
          countEl.textContent = `(${count})`;
        }
      }
    });
  }
  
  // Update other facet counts as needed
  // (Add more facet types here as needed)
}

