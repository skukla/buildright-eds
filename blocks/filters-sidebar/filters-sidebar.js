// Filters sidebar block decoration
export default function decorate(block) {
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
    
    // Set initial state
    toggle.setAttribute('aria-expanded', 'true');
    const filterId = toggle.getAttribute('data-filter');
    const content = block.querySelector(`#filter-${filterId}`);
    if (content) {
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
      
      // Trigger filter update
      window.dispatchEvent(new CustomEvent('filtersChanged'));
    });
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
      
      // Dispatch filter change event
      window.dispatchEvent(new CustomEvent('filtersChanged'));
    });
  });
}

