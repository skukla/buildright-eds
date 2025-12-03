/**
 * BOM Review Page Controller
 * Displays generated Bill of Materials with phase accordions and product swap functionality
 */

class BOMReview {
  constructor() {
    this.buildId = new URLSearchParams(window.location.search).get('buildId');
    this.bomData = null;
    this.templateData = null;
    this.packagesData = null;
    this.expandedPanels = new Set(); // Track which swap panels are open
    this.selectedSwaps = new Map();  // Track swap selections
    
    // DOM Elements
    this.elements = {
      configureBreadcrumb: document.getElementById('breadcrumb-configure'),
      subtitle: document.getElementById('bom-subtitle'),
      generatedDate: document.getElementById('bom-generated-date'),
      summaryTotal: document.getElementById('summary-total'),
      summaryItems: document.getElementById('summary-items'),
      summaryPhases: document.getElementById('summary-phases'),
      summaryBadges: document.getElementById('summary-badges'),
      phasesContainer: document.getElementById('bom-phases'),
      sidebarTotal: document.getElementById('sidebar-total'),
      sidebarItemsCount: document.getElementById('sidebar-items-count'),
      editConfigBtn: document.getElementById('edit-config-btn'),
      addToCartBtn: document.getElementById('add-to-cart-btn'),
      loadingOverlay: document.getElementById('loading-overlay'),
      successMessage: document.getElementById('success-message'),
    };
    
    // Phase icons (SVG)
    this.phaseIcons = {
      foundation_framing: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="14" width="16" height="6" rx="1"/>
        <path d="M4 14V8l8-4 8 4v6"/>
        <path d="M12 4v10"/>
      </svg>`,
      envelope: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`,
      interior_finish: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>`
    };
  }
  
  async init() {
    await this.loadData();
    
    if (!this.bomData) {
      this.showError('No BOM data found. Please configure a build first.');
      return;
    }
    
    this.renderHeader();
    this.renderSummary();
    this.renderPhases();
    this.setupEventListeners();
  }
  
  async loadData() {
    // Load BOM from localStorage (saved by configurator as 'buildright_current_build')
    const storedBuild = localStorage.getItem('buildright_current_build');
    if (storedBuild) {
      this.bomData = JSON.parse(storedBuild);
      // Map field names from configurator format
      this.bomData.selectedVariants = this.bomData.variants || [];
      this.bomData.selectedPackage = this.bomData.packageId;
      this.bomData.selectedPhases = this.bomData.phases || [];
      this.bomData.projectDetails = this.bomData.buildInfo;
      this.bomData.generatedDate = this.bomData.createdAt;
    }
    
    // Load templates and packages directly from JSON
    try {
      const response = await fetch('/data/templates.json');
      const data = await response.json();
      
      this.packagesData = data.packages || [];
      this.templateData = data.templates?.find(t => t.id === this.bomData?.templateId);
    } catch (error) {
      console.error('Error loading template data:', error);
    }
    
    // Generate mock line items based on selections
    if (this.bomData && this.templateData) {
      this.bomData.lineItems = this.generateMockLineItems();
    }
  }
  
  generateMockLineItems() {
    // Generate realistic BOM line items based on template and selections
    const items = [];
    // Ensure phases is an array
    let phases = this.bomData.selectedPhases;
    if (!Array.isArray(phases)) {
      phases = ['foundation_framing', 'envelope', 'interior_finish'];
    }
    if (phases.length === 0) {
      phases = ['foundation_framing', 'envelope', 'interior_finish'];
    }
    
    const phaseProducts = {
      foundation_framing: [
        { category: 'Lumber', name: '2x4 Studs', brand: 'BigBear Lumber', sku: 'BBL-2X4-8', unit: 'ea', qty: 450, price: 4.99, image: '/images/products/lumber-2x4.png' },
        { category: 'Lumber', name: '2x6 Studs', brand: 'BigBear Lumber', sku: 'BBL-2X6-8', unit: 'ea', qty: 220, price: 6.99, image: '/images/products/lumber-2x6.png' },
        { category: 'Lumber', name: 'LVL Beam 11-7/8"', brand: 'BigBear Lumber', sku: 'BBL-LVL-12', unit: 'ea', qty: 8, price: 189.00, image: '/images/products/lvl-beam.png' },
        { category: 'Concrete', name: 'Ready-Mix Concrete', brand: 'QuikCrete', sku: 'QC-RM-80', unit: 'bag', qty: 120, price: 6.50, image: '/images/products/concrete-bag.png' },
        { category: 'Fasteners', name: 'Framing Nails 3.5"', brand: 'FastenMaster', sku: 'FM-FN-35', unit: 'box', qty: 25, price: 45.00, image: '/images/products/nails-framing.png' },
        { category: 'Hardware', name: 'Hurricane Ties', brand: 'Simpson Strong-Tie', sku: 'SST-HT', unit: 'ea', qty: 180, price: 2.75, image: '/images/products/hurricane-tie.png' },
      ],
      envelope: [
        { category: 'Sheathing', name: 'OSB Sheathing 7/16"', brand: 'LP Building', sku: 'LP-OSB-716', unit: 'sheet', qty: 85, price: 24.99, image: '/images/products/osb-sheathing.png' },
        { category: 'Insulation', name: 'R-19 Batt Insulation', brand: 'Owens Corning', sku: 'OC-R19-24', unit: 'roll', qty: 35, price: 52.00, image: '/images/products/insulation-r19.png' },
        { category: 'Insulation', name: 'R-38 Batt Insulation', brand: 'Owens Corning', sku: 'OC-R38-24', unit: 'roll', qty: 28, price: 78.00, image: '/images/products/insulation-r38.png' },
        { category: 'Roofing', name: 'Architectural Shingles', brand: 'GAF Timberline', sku: 'GAF-HDZ-CHAR', unit: 'bundle', qty: 68, price: 35.99, image: '/images/products/shingles.png' },
        { category: 'Roofing', name: 'Synthetic Underlayment', brand: 'GAF FeltBuster', sku: 'GAF-FB-4', unit: 'roll', qty: 8, price: 115.00, image: '/images/products/underlayment.png' },
        { category: 'Windows', name: 'Vinyl Window 3x4', brand: 'Pella', sku: 'PELLA-3040-V', unit: 'ea', qty: 12, price: 285.00, image: '/images/products/window-vinyl.png' },
      ],
      interior_finish: [
        { category: 'Drywall', name: 'Drywall 4x8 1/2"', brand: 'USG Sheetrock', sku: 'USG-DW-48', unit: 'sheet', qty: 165, price: 14.50, image: '/images/products/drywall.png' },
        { category: 'Drywall', name: 'Joint Compound', brand: 'USG Plus 3', sku: 'USG-P3-48', unit: 'bucket', qty: 12, price: 18.99, image: '/images/products/joint-compound.png' },
        { category: 'Flooring', name: 'Engineered Hardwood', brand: 'Shaw Reflections', sku: 'SHAW-OAK-5', unit: 'sqft', qty: 1200, price: 4.25, image: '/images/products/hardwood.png' },
        { category: 'Paint', name: 'Interior Eggshell White', brand: 'Sherwin-Williams', sku: 'SW-EGG-WHT', unit: 'gal', qty: 24, price: 52.00, image: '/images/products/paint-interior.png' },
        { category: 'Trim', name: 'Baseboard 3-1/4"', brand: 'Woodgrain Millwork', sku: 'WM-BB-325', unit: 'lft', qty: 450, price: 1.89, image: '/images/products/baseboard.png' },
        { category: 'Doors', name: 'Interior Door Prehung', brand: 'Masonite', sku: 'MAS-ID-28', unit: 'ea', qty: 14, price: 165.00, image: '/images/products/door-interior.png' },
      ],
    };
    
    // Build line items from selected phases
    phases.forEach(phaseId => {
      const products = phaseProducts[phaseId] || [];
      products.forEach(product => {
        items.push({
          ...product,
          phase: phaseId,
          lineTotal: product.qty * product.price,
          isOverride: this.isPackageOverride(product.sku),
        });
      });
    });
    
    return items;
  }
  
  isPackageOverride(sku) {
    // Check if this product is a package override (premium product)
    const selectedPackage = this.packagesData?.find(p => p.id === this.bomData?.selectedPackage);
    if (!selectedPackage?.skuOverrides) return false;
    return Object.values(selectedPackage.skuOverrides).flat().some(
      override => override.sku === sku || override === sku
    );
  }
  
  renderHeader() {
    const templateName = this.templateData?.name || 'Unknown Template';
    const packageName = this.packagesData?.find(p => p.id === this.bomData.selectedPackage)?.name || '';
    
    this.elements.subtitle.textContent = `${templateName} ${packageName ? `• ${packageName}` : ''}`;
    
    const date = new Date(this.bomData.generatedDate);
    this.elements.generatedDate.textContent = `Generated ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    
    // Set breadcrumb link for Configure Build
    if (this.elements.configureBreadcrumb) {
      this.elements.configureBreadcrumb.href = `/pages/build-configurator.html?template=${this.bomData.templateId}`;
    }
  }
  
  renderSummary() {
    const total = this.bomData.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = this.bomData.lineItems.length;
    const phaseCount = Array.isArray(this.bomData.selectedPhases) ? this.bomData.selectedPhases.length : 0;
    
    // Update summary stats
    this.elements.summaryTotal.textContent = this.formatCurrency(total);
    this.elements.summaryItems.textContent = itemCount;
    this.elements.summaryPhases.textContent = phaseCount;
    
    // Update sidebar
    this.elements.sidebarTotal.textContent = this.formatCurrency(total);
    this.elements.sidebarItemsCount.textContent = `${itemCount} items across ${phaseCount} phases`;
    
    // Package badge
    const selectedPackage = this.packagesData?.find(p => p.id === this.bomData.selectedPackage);
    let badgesHtml = '';
    
    if (selectedPackage) {
      badgesHtml += `
        <span class="package-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          ${selectedPackage.name}
        </span>
      `;
    }
    
    // Variants badges
    const variants = this.bomData.selectedVariants || [];
    if (variants.length > 0) {
      variants.forEach(vId => {
        const variant = this.templateData?.variants?.find(v => v.id === vId);
        if (variant) {
          badgesHtml += `<span class="package-badge" style="background: var(--color-accent-500);">${variant.name}</span>`;
        }
      });
    }
    
    this.elements.summaryBadges.innerHTML = badgesHtml;
  }
  
  renderPhases() {
    const phaseNames = {
      foundation_framing: { name: 'Foundation & Framing', description: 'Structural materials and hardware' },
      envelope: { name: 'Building Envelope', description: 'Roofing, windows, doors, siding' },
      interior_finish: { name: 'Interior Finish', description: 'Flooring, paint, fixtures' },
    };
    
    // Group items by phase
    const itemsByPhase = {};
    this.bomData.lineItems.forEach(item => {
      if (!itemsByPhase[item.phase]) {
        itemsByPhase[item.phase] = [];
      }
      itemsByPhase[item.phase].push(item);
    });
    
    const totalBOM = this.bomData.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Ensure selectedPhases is an array
    const selectedPhases = Array.isArray(this.bomData.selectedPhases) 
      ? this.bomData.selectedPhases 
      : ['foundation_framing', 'envelope', 'interior_finish'];
    
    // Render each phase accordion
    this.elements.phasesContainer.innerHTML = selectedPhases.map(phaseId => {
      const phaseInfo = phaseNames[phaseId] || { name: phaseId, description: '' };
      const phaseItems = itemsByPhase[phaseId] || [];
      const phaseTotal = phaseItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const phasePercent = totalBOM > 0 ? Math.round((phaseTotal / totalBOM) * 100) : 0;
      const phaseIcon = this.phaseIcons[phaseId] || this.phaseIcons.foundation_framing;
      
      // Group by category within phase
      const itemsByCategory = {};
      phaseItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
          itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
      });
      
      return `
        <div class="bom-accordion" data-phase="${phaseId}" data-expanded="true">
          <div class="bom-accordion-header">
            <div class="accordion-icon-wrapper">
              ${phaseIcon}
            </div>
            <div class="accordion-info">
              <h3 class="accordion-title">${phaseInfo.name}</h3>
              <p class="accordion-subtitle">${phaseItems.length} items • ${phaseInfo.description}</p>
            </div>
            <div class="accordion-price">
              <span class="accordion-total">${this.formatCurrency(phaseTotal)}</span>
              <span class="accordion-percent">${phasePercent}% of total</span>
            </div>
            <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div class="bom-accordion-content">
            ${Object.entries(itemsByCategory).map(([category, items]) => `
              <div class="bom-category">
                <div class="category-header">
                  <h4 class="category-name">${category}</h4>
                  <span class="category-count">${items.length} items</span>
                </div>
                <div class="product-rows">
                  ${items.map(item => this.renderProductRow(item)).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
  
  renderProductRow(item) {
    return `
      <div class="product-row" data-sku="${item.sku}">
        <div class="product-row-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
        </div>
        <div class="product-row-info">
          <p class="product-row-name">${item.name}</p>
          <p class="product-row-meta">${item.brand} • SKU: ${item.sku}</p>
          ${item.isOverride ? '<span class="product-row-badge">✓ Package Selection</span>' : ''}
        </div>
        <div class="product-row-qty">${item.qty} ${item.unit}</div>
        <div class="product-row-price">${this.formatCurrency(item.lineTotal)}</div>
        <div class="product-row-actions">
          <button class="btn btn-secondary btn-sm" data-action="swap" data-sku="${item.sku}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Swap
          </button>
          <button class="btn btn-ghost btn-sm btn-danger" data-action="remove" data-sku="${item.sku}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
            Remove
          </button>
        </div>
      </div>
      <div class="product-swap-panel" data-sku="${item.sku}" data-expanded="false">
        <!-- Populated when expanded -->
      </div>
    `;
  }
  
  renderSwapPanel(sku, targetElement) {
    // Find similar products to swap (mock data)
    const currentItem = this.bomData.lineItems.find(i => i.sku === sku);
    if (!currentItem) return;
    
    const alternatives = this.getMockAlternatives(currentItem);
    
    targetElement.innerHTML = `
      <div class="swap-panel-header">
        <h5>🔄 Select Replacement</h5>
        <span class="swap-panel-count">${alternatives.length} alternatives</span>
      </div>
      <div class="swap-panel-options">
        ${alternatives.map((alt, idx) => `
          <div class="swap-product-tile" data-sku="${alt.sku}" data-selected="${idx === 0}">
            <div class="swap-tile-image">
              <img src="${alt.image}" alt="${alt.name}" onerror="this.style.display='none'">
            </div>
            <p class="swap-tile-name">${alt.name}</p>
            <p class="swap-tile-brand">${alt.brand}</p>
            <p class="swap-tile-price">${this.formatCurrency(alt.price)}/${alt.unit}</p>
            ${alt.tier ? `<span class="swap-tile-badge">${alt.tier}</span>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="swap-panel-actions">
        <button class="btn btn-secondary btn-sm" data-action="cancel-swap">Cancel</button>
        <button class="btn btn-cta btn-sm" data-action="apply-swap" data-original-sku="${sku}">Apply Swap</button>
      </div>
    `;
  }
  
  getMockAlternatives(item) {
    // Return mock alternatives based on category
    const alternatives = {
      Lumber: [
        { name: '2x4 Premium Studs', brand: 'BigBear Select', sku: 'BBS-2X4-8', unit: 'ea', price: 6.49, tier: 'Premium', image: '/images/products/lumber-2x4.png' },
        { name: '2x4 Economy Studs', brand: 'ValueWood', sku: 'VW-2X4-8', unit: 'ea', price: 3.99, tier: 'Economy', image: '/images/products/lumber-2x4.png' },
        { name: '2x4 Fire-Rated', brand: 'FireBlock', sku: 'FB-2X4-8', unit: 'ea', price: 7.99, tier: 'Specialty', image: '/images/products/lumber-2x4.png' },
      ],
      Insulation: [
        { name: 'R-19 High Density', brand: 'Owens Corning HD', sku: 'OC-R19HD-24', unit: 'roll', price: 68.00, tier: 'Premium', image: '/images/products/insulation-r19.png' },
        { name: 'R-19 Standard', brand: 'Johns Manville', sku: 'JM-R19-24', unit: 'roll', price: 45.00, tier: 'Standard', image: '/images/products/insulation-r19.png' },
        { name: 'R-19 Economy', brand: 'InsulFast', sku: 'IF-R19-24', unit: 'roll', price: 38.00, tier: 'Economy', image: '/images/products/insulation-r19.png' },
      ],
      Roofing: [
        { name: 'Designer Shingles', brand: 'GAF Grand Canyon', sku: 'GAF-GC-CHAR', unit: 'bundle', price: 52.99, tier: 'Premium', image: '/images/products/shingles.png' },
        { name: '3-Tab Shingles', brand: 'GAF Royal Sovereign', sku: 'GAF-RS-CHAR', unit: 'bundle', price: 24.99, tier: 'Economy', image: '/images/products/shingles.png' },
        { name: 'Metal Panels', brand: 'Fabral', sku: 'FAB-MP-24', unit: 'panel', price: 28.50, tier: 'Premium', image: '/images/products/shingles.png' },
      ],
      default: [
        { name: `${item.name} Premium`, brand: item.brand, sku: `${item.sku}-P`, unit: item.unit, price: item.price * 1.3, tier: 'Premium', image: item.image },
        { name: `${item.name} Economy`, brand: 'Generic', sku: `${item.sku}-E`, unit: item.unit, price: item.price * 0.7, tier: 'Economy', image: item.image },
      ],
    };
    
    return alternatives[item.category] || alternatives.default;
  }
  
  setupEventListeners() {
    // Accordion toggle
    this.elements.phasesContainer.addEventListener('click', (e) => {
      const accordionHeader = e.target.closest('.bom-accordion-header');
      if (accordionHeader) {
        const accordion = accordionHeader.closest('.bom-accordion');
        const isExpanded = accordion.dataset.expanded === 'true';
        accordion.dataset.expanded = (!isExpanded).toString();
      }
    });
    
    // Product actions (swap/remove)
    this.elements.phasesContainer.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      
      const action = actionBtn.dataset.action;
      const sku = actionBtn.dataset.sku;
      
      if (action === 'swap') {
        this.toggleSwapPanel(sku);
      } else if (action === 'remove') {
        this.removeProduct(sku);
      } else if (action === 'cancel-swap') {
        const panel = actionBtn.closest('.product-swap-panel');
        if (panel) panel.dataset.expanded = 'false';
      } else if (action === 'apply-swap') {
        const originalSku = actionBtn.dataset.originalSku;
        this.applySwap(originalSku);
      }
    });
    
    // Swap tile selection
    this.elements.phasesContainer.addEventListener('click', (e) => {
      const swapTile = e.target.closest('.swap-product-tile');
      if (swapTile) {
        const panel = swapTile.closest('.product-swap-panel');
        // Deselect all in this panel
        panel.querySelectorAll('.swap-product-tile').forEach(t => t.dataset.selected = 'false');
        // Select clicked tile
        swapTile.dataset.selected = 'true';
      }
    });
    
    // Edit config button
    this.elements.editConfigBtn.addEventListener('click', () => {
      window.location.href = `/pages/build-configurator.html?template=${this.bomData.templateId}`;
    });
    
    // Add to cart button
    this.elements.addToCartBtn.addEventListener('click', () => {
      this.addAllToCart();
    });
  }
  
  toggleSwapPanel(sku) {
    const panel = this.elements.phasesContainer.querySelector(`.product-swap-panel[data-sku="${sku}"]`);
    if (!panel) return;
    
    const isExpanded = panel.dataset.expanded === 'true';
    
    if (!isExpanded) {
      // Render the swap options
      this.renderSwapPanel(sku, panel);
    }
    
    panel.dataset.expanded = (!isExpanded).toString();
  }
  
  removeProduct(sku) {
    if (!confirm('Remove this product from the BOM?')) return;
    
    // Remove from lineItems
    this.bomData.lineItems = this.bomData.lineItems.filter(i => i.sku !== sku);
    
    // Re-render
    this.renderPhases();
    this.renderSummary();
  }
  
  applySwap(originalSku) {
    const panel = this.elements.phasesContainer.querySelector(`.product-swap-panel[data-sku="${originalSku}"]`);
    if (!panel) return;
    
    const selectedTile = panel.querySelector('.swap-product-tile[data-selected="true"]');
    if (!selectedTile) return;
    
    const newSku = selectedTile.dataset.sku;
    const newName = selectedTile.querySelector('.swap-tile-name').textContent;
    const newBrand = selectedTile.querySelector('.swap-tile-brand').textContent;
    const newPrice = parseFloat(selectedTile.querySelector('.swap-tile-price').textContent.replace(/[^0-9.]/g, ''));
    
    // Find and update the line item
    const itemIndex = this.bomData.lineItems.findIndex(i => i.sku === originalSku);
    if (itemIndex !== -1) {
      const item = this.bomData.lineItems[itemIndex];
      item.sku = newSku;
      item.name = newName;
      item.brand = newBrand;
      item.price = newPrice;
      item.lineTotal = item.qty * newPrice;
      item.isOverride = true; // Mark as swapped
    }
    
    // Close panel and re-render
    panel.dataset.expanded = 'false';
    this.renderPhases();
    this.renderSummary();
  }
  
  async addAllToCart() {
    this.elements.loadingOverlay.dataset.visible = 'true';
    document.getElementById('loading-title').textContent = 'Adding to cart...';
    document.getElementById('loading-subtitle').textContent = `${this.bomData.lineItems.length} items`;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.elements.loadingOverlay.dataset.visible = 'false';
    
    // Show success
    this.elements.successMessage.dataset.visible = 'true';
    document.getElementById('success-title').textContent = 'Items added to cart!';
    document.getElementById('success-subtitle').textContent = `${this.bomData.lineItems.length} items totaling ${this.elements.summaryTotal.textContent}`;
    
    // Save build to localStorage for dashboard
    this.saveBuildToHistory();
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = '/pages/cart.html';
    }, 2500);
  }
  
  saveBuildToHistory() {
    // Get existing builds
    const builds = JSON.parse(localStorage.getItem('sarah_builds') || '[]');
    
    // Add this build
    builds.push({
      id: `build-${Date.now()}`,
      templateId: this.bomData.templateId,
      templateName: this.templateData?.name || 'Unknown',
      package: this.bomData.selectedPackage,
      variants: this.bomData.selectedVariants,
      phases: this.bomData.selectedPhases,
      project: this.bomData.projectDetails,
      totalCost: this.bomData.lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
      itemCount: this.bomData.lineItems.length,
      createdDate: new Date().toISOString(),
      status: 'ordered',
    });
    
    localStorage.setItem('sarah_builds', JSON.stringify(builds));
  }
  
  showError(message) {
    this.elements.phasesContainer.innerHTML = `
      <div class="error-state" style="padding: 3rem; text-align: center;">
        <h2 style="color: var(--color-negative-500);">Error</h2>
        <p>${message}</p>
        <a href="/pages/dashboard-templates.html" class="btn btn-primary">Back to Templates</a>
      </div>
    `;
  }
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const bomReview = new BOMReview();
  bomReview.init();
});

