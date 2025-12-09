// Filters sidebar block decoration
// Handles dynamic facets from ACO with loading states (citisignal pattern)

export default function decorate(block) {
  // Store current facets and state
  let currentFacets = [];
  let isValidating = false;
  let activeFilters = {};
  
  // Elements
  const dynamicFacetsContainer = block.querySelector('.dynamic-facets') || createDynamicFacetsContainer(block);
  
  /**
   * Create container for dynamic facets if not present
   */
  function createDynamicFacetsContainer(block) {
    const container = document.createElement('div');
    container.className = 'dynamic-facets';
    
    // Insert after header, before static filters
    const filterSections = block.querySelector('.filter-sections');
    if (filterSections) {
      filterSections.insertBefore(container, filterSections.firstChild);
    } else {
      block.appendChild(container);
    }
    
    return container;
  }
  
  /**
   * Render facets from ACO response
   */
  function renderFacets(facets) {
    if (!dynamicFacetsContainer) return;
    
    if (!facets || facets.length === 0) {
      dynamicFacetsContainer.innerHTML = '';
      return;
    }
    
    dynamicFacetsContainer.innerHTML = facets.map(facet => `
      <div class="filter-section filter-section--dynamic ${isValidating ? 'filter-section--validating' : ''}" 
           data-facet-key="${facet.key}">
        <button class="filter-toggle" 
                data-filter="${facet.key}" 
                aria-expanded="true"
                aria-controls="filter-${facet.key}">
          <span class="filter-toggle-label">${facet.title}</span>
          <svg class="filter-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="filter-content active" id="filter-${facet.key}">
          ${renderFacetOptions(facet)}
        </div>
        ${isValidating ? '<div class="filter-section-spinner"></div>' : ''}
      </div>
    `).join('');
    
    // Bind toggle events
    bindToggleEvents(dynamicFacetsContainer);
    
    // Bind checkbox events
    bindCheckboxEvents(dynamicFacetsContainer);
  }
  
  /**
   * Render facet options with counts and disabled state
   */
  function renderFacetOptions(facet) {
    return facet.options.map(option => {
      const isDisabled = option.count === 0;
      const isSelected = activeFilters[facet.key]?.includes(option.id);
      
      return `
        <label class="filter-option ${isDisabled ? 'filter-option--disabled' : ''} ${isSelected ? 'filter-option--selected' : ''}">
          <input type="checkbox" 
                 name="${facet.key}" 
                 value="${option.id}"
                 ${isSelected ? 'checked' : ''}
                 ${isDisabled ? 'disabled' : ''}>
          <span class="filter-option-checkbox"></span>
          <span class="filter-option-label">${option.name}</span>
          <span class="filter-count">(${option.count})</span>
        </label>
      `;
    }).join('');
  }
  
  /**
   * Bind toggle events for collapsible sections
   */
  function bindToggleEvents(container) {
    const toggles = container.querySelectorAll('.filter-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const filterId = toggle.getAttribute('data-filter');
        const content = container.querySelector(`#filter-${filterId}`);
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        toggle.setAttribute('aria-expanded', !isExpanded);
        if (content) {
          content.classList.toggle('active');
        }
      });
    });
  }
  
  /**
   * Bind checkbox change events
   */
  function bindCheckboxEvents(container) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const facetKey = checkbox.name;
        const value = checkbox.value;
        const isChecked = checkbox.checked;
        
        // Update active filters
        if (!activeFilters[facetKey]) {
          activeFilters[facetKey] = [];
        }
        
        if (isChecked) {
          if (!activeFilters[facetKey].includes(value)) {
            activeFilters[facetKey].push(value);
          }
        } else {
          activeFilters[facetKey] = activeFilters[facetKey].filter(v => v !== value);
        }
        
        // Clean up empty arrays
        if (activeFilters[facetKey].length === 0) {
          delete activeFilters[facetKey];
        }
        
        emitFilters();
      });
    });
  }
  
  /**
   * Show validating state on facet sections
   */
  function showValidating() {
    isValidating = true;
    const sections = dynamicFacetsContainer.querySelectorAll('.filter-section--dynamic');
    sections.forEach(section => {
      section.classList.add('filter-section--validating');
      
      // Add spinner if not present
      if (!section.querySelector('.filter-section-spinner')) {
        const spinner = document.createElement('div');
        spinner.className = 'filter-section-spinner';
        section.appendChild(spinner);
      }
    });
  }
  
  /**
   * Hide validating state
   */
  function hideValidating() {
    isValidating = false;
    const sections = dynamicFacetsContainer.querySelectorAll('.filter-section--dynamic');
    sections.forEach(section => {
      section.classList.remove('filter-section--validating');
      const spinner = section.querySelector('.filter-section-spinner');
      if (spinner) spinner.remove();
    });
  }
  
  /**
   * Update option counts without full re-render
   */
  function updateOptionCounts(facets) {
    facets.forEach(facet => {
      facet.options.forEach(option => {
        const checkbox = dynamicFacetsContainer.querySelector(
          `input[name="${facet.key}"][value="${option.id}"]`
        );
        
        if (checkbox) {
          const label = checkbox.closest('.filter-option');
          const countEl = label?.querySelector('.filter-count');
          
          if (countEl) {
            countEl.textContent = `(${option.count})`;
          }
          
          // Update disabled state
          const isDisabled = option.count === 0;
          checkbox.disabled = isDisabled;
          label?.classList.toggle('filter-option--disabled', isDisabled);
        }
      });
    });
  }

  // Toggle filter sections (static)
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
      // Clear static checkboxes
      const checkboxes = block.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.id.includes('all') || cb.id.includes('proj-all') || cb.id.includes('avail-all')) {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
      });
      
      // Clear dynamic checkboxes
      const dynamicCheckboxes = dynamicFacetsContainer.querySelectorAll('input[type="checkbox"]');
      dynamicCheckboxes.forEach(cb => cb.checked = false);
      
      // Clear price inputs
      const priceInputs = block.querySelectorAll('#price-min, #price-max');
      priceInputs.forEach(input => input.value = '');
      
      // Reset active filters
      activeFilters = {};
      
      // Trigger filter update with reset flag
      window.dispatchEvent(new CustomEvent('filtersChanged', { 
        detail: { reset: true }
      }));
    });
  }

  // Collect active filters and emit event
  function emitFilters() {
    const filters = { ...activeFilters };
    
    // Category filters (static)
    const categoryCheckboxes = block.querySelectorAll('input[name="category"]:checked');
    const selectedCategories = Array.from(categoryCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== ''); // Exclude "all"
    
    if (selectedCategories.length > 0) {
      filters.category = [...(filters.category || []), ...selectedCategories];
    }
    
    // Project type filters (static)
    const projectCheckboxes = block.querySelectorAll('input[name="project"]:checked');
    const selectedProjects = Array.from(projectCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== '');
    
    if (selectedProjects.length > 0) {
      filters.project_type = selectedProjects;
    }
    
    // Availability filters (static)
    const availCheckboxes = block.querySelectorAll('input[name="availability"]:checked');
    const selectedAvail = Array.from(availCheckboxes)
      .map(cb => cb.value)
      .filter(v => v !== '');
    
    if (selectedAvail.length > 0) {
      filters.availability = selectedAvail;
    }
    
    // Price range filters (static)
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

  // Filter change handlers for static checkboxes
  const checkboxes = block.querySelectorAll('.filter-sections > .filter-section input[type="checkbox"]');
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
  
  // Listen for facet updates from product-grid
  window.addEventListener('facetsUpdated', (event) => {
    if (!event.detail?.facets) return;
    
    const newFacets = event.detail.facets;
    console.log('[Filters Sidebar] Received facets:', newFacets);
    
    // If facets structure changed significantly, re-render
    const facetsChanged = JSON.stringify(currentFacets.map(f => f.key)) !== 
                          JSON.stringify(newFacets.map(f => f.key));
    
    if (facetsChanged || currentFacets.length === 0) {
      currentFacets = newFacets;
      renderFacets(newFacets);
    } else {
      // Just update counts
      updateOptionCounts(newFacets);
    }
    
    hideValidating();
  });
  
  // Listen for validating state from product-grid
  window.addEventListener('facetsValidating', (event) => {
    if (event.detail?.validating) {
      showValidating();
    } else {
      hideValidating();
    }
  });
}
