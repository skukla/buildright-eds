# BuildRight Component Design Library
## Visual UI Components for Persona-Driven Experiences

---

## Component Inventory

### ✅ Components We Already Have (Reuse)
1. **Photo Tiles** - Large image cards with overlay text
2. **Icon Tiles** - Icon + heading + description cards
3. **Progress Indicator** - Horizontal step circles
4. **Filter Sidebar** - Accordion-style filters
5. **Product Grid** - Card-based product layout
6. **Mini Cart** - Flyout cart summary

### ⭐ Components We Need to Build (New)

---

## New Components

---

### 1. **Template/Floor Plan Card** (Sarah)

**Used In:** Sarah's Dashboard → Template Library

**Visual Design:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📐 THE SEDONA - Standard Framing Package                   ┃
┃ ─────────────────────────────────────────────────────────  ┃
┃                                                             ┃
┃ Plan: 2-story, 2,240 sq ft    │  Usage Stats:              ┃
┃ 45 line items                 │  • Used 24 times           ┃
┃                                │  • Last: 8 units, 5d ago   ┃
┃                                                             ┃
┃ Variants Available:                                         ┃
┃ • Standard (2,240 sq ft)                                    ┃
┃ • With Bonus Room (+800 sq ft)                              ┃
┃                                                             ┃
┃ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     ┃
┃ │ Order Again  │  │  View BOM    │  │ Edit Template│     ┃
┃ └──────────────┘  └──────────────┘  └──────────────┘     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**HTML Structure:**
```html
<div class="template-card">
  <div class="template-card-header">
    <span class="template-icon">📐</span>
    <h3 class="template-name">THE SEDONA - Standard Framing Package</h3>
  </div>
  
  <div class="template-card-body">
    <div class="template-specs">
      <div class="spec-item">
        <span class="spec-label">Plan:</span>
        <span class="spec-value">2-story, 2,240 sq ft</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Line items:</span>
        <span class="spec-value">45</span>
      </div>
    </div>
    
    <div class="template-usage">
      <div class="usage-stat">
        <span class="usage-label">Used:</span>
        <span class="usage-value">24 times</span>
      </div>
      <div class="usage-stat">
        <span class="usage-label">Last:</span>
        <span class="usage-value">8 units, 5d ago</span>
      </div>
    </div>
    
    <div class="template-variants">
      <h4>Variants:</h4>
      <ul>
        <li>Standard (2,240 sq ft)</li>
        <li>With Bonus Room (+800 sq ft)</li>
      </ul>
    </div>
  </div>
  
  <div class="template-card-actions">
    <button class="btn btn-primary">Order Again</button>
    <button class="btn btn-outline">View BOM</button>
    <button class="btn btn-outline">Edit Template</button>
  </div>
</div>
```

**CSS:**
```css
.template-card {
  background: var(--color-surface);
  border: 2px solid var(--color-brand-500);
  border-radius: var(--shape-border-radius-4);
  padding: var(--spacing-large);
  box-shadow: var(--shape-shadow-2);
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: var(--shape-shadow-3);
  transform: translateY(-4px);
}

.template-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-medium);
  border-bottom: 2px solid var(--color-border);
}

.template-icon {
  font-size: 1.5rem;
}

.template-name {
  font: var(--type-headline-3-font);
  margin: 0;
}

.template-card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
}

.template-card-actions {
  display: flex;
  gap: var(--spacing-small);
}
```

**Props/Variants:**
- `featured={true}` - Adds star badge, different border color
- `size="compact"` - Smaller version for lists

---

### 2. **BOM Table with Inline Editing** (Sarah, Marcus)

**Used In:** Sarah's BOM Editor, Marcus's Generated BOM

**Visual Design:**
```
┌─ PHASE 1: FOUNDATION & SLAB (Deliver Week 1) ────── $5,200 ──┐
│                                                                │
│ SKU        │ Product                    │ Qty   │ Unit │ Total│
│────────────┼────────────────────────────┼───────┼──────┼──────│
│ CONC-3000  │ Concrete Mix - 3000 PSI    │ 24 yd │ $150 │$3,600│
│ REBAR-4    │ Rebar #4                   │800 ft │$0.85 │ $680 │
│ ANCHOR-J   │ J-Bolt Anchor 1/2" x 10"   │ 180   │$1.20 │ $216 │
│            │                            │       │      │      │
└────────────────────────────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="bom-phase-section">
  <button class="bom-phase-toggle" data-phase="foundation">
    <span class="toggle-icon">▼</span>
    <span class="phase-name">PHASE 1: FOUNDATION & SLAB</span>
    <span class="phase-delivery">(Deliver Week 1)</span>
    <span class="phase-total">$5,200</span>
  </button>
  
  <div class="bom-phase-content" data-phase="foundation">
    <table class="bom-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr class="bom-item" data-sku="CONC-3000">
          <td class="bom-sku">CONC-3000</td>
          <td class="bom-product">Concrete Mix - 3000 PSI</td>
          <td class="bom-qty">
            <input type="number" value="24" min="1" class="qty-input">
            <span class="qty-unit">yd</span>
          </td>
          <td class="bom-unit-price">$150.00</td>
          <td class="bom-total">$3,600.00</td>
          <td class="bom-actions">
            <button class="btn-icon" title="Remove">
              <svg><!-- trash icon --></svg>
            </button>
          </td>
        </tr>
        <!-- More rows... -->
      </tbody>
    </table>
  </div>
</div>
```

**CSS:**
```css
.bom-phase-section {
  border: 1px solid var(--color-border);
  border-radius: var(--shape-border-radius-3);
  margin-bottom: var(--spacing-medium);
  overflow: hidden;
}

.bom-phase-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  padding: var(--spacing-medium) var(--spacing-large);
  background: var(--color-background);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.bom-phase-toggle:hover {
  background: var(--color-surface-hover);
}

.phase-name {
  flex: 1;
  text-align: left;
}

.phase-total {
  font-weight: 700;
  color: var(--color-brand-500);
}

.bom-table {
  width: 100%;
  border-collapse: collapse;
}

.bom-table thead {
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
}

.bom-table th {
  padding: var(--spacing-small) var(--spacing-medium);
  text-align: left;
  font: var(--type-details-caption-1-font);
  text-transform: uppercase;
  font-weight: 600;
}

.bom-table td {
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--color-border);
}

.bom-item:hover {
  background: var(--color-surface-hover);
}

.qty-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--shape-border-radius-2);
  font-weight: 600;
}

.qty-input:focus {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

**Interactions:**
- Click phase toggle → Expand/collapse accordion
- Edit quantity → Auto-recalculates totals
- Click trash icon → Remove item (with confirmation)

---

### 3. **Package Comparison Grid** (Lisa)

**Used In:** Lisa's Package Comparison page

**Visual Design:**
```
┌────────────────┬────────────────┬────────────────┐
│  GOOD PACKAGE  │ BETTER PACKAGE │  BEST PACKAGE  │
│                │        ✓       │                │
│    $8,500      │    $14,200     │    $23,800     │
│                │                │                │
├────────────────┼────────────────┼────────────────┤
│ Builder-grade  │ Mid-range      │ Premium        │
│                │                │                │
│ • Standard tub │ • Acrylic tub  │ • Soaking tub  │
│ • Laminate     │ • Semi-custom  │ • Custom       │
│   vanity       │   vanity       │   vanity       │
│ • Ceramic tile │ • Porcelain    │ • Natural stone│
│ • Chrome       │ • Brushed      │ • Designer     │
│   fixtures     │   nickel       │   finishes     │
│                │                │                │
│ 14 items       │ 18 items       │ 24 items       │
│                │                │                │
│ [ Select ]     │ [ SELECTED ]   │ [ Select ]     │
└────────────────┴────────────────┴────────────────┘
```

**HTML Structure:**
```html
<div class="package-comparison">
  <div class="package-column" data-tier="good">
    <div class="package-header">
      <h3 class="package-name">GOOD PACKAGE</h3>
      <div class="package-price">$8,500</div>
    </div>
    
    <div class="package-body">
      <div class="package-tier-label">Builder-grade</div>
      
      <ul class="package-features">
        <li>Standard tub</li>
        <li>Laminate vanity</li>
        <li>Ceramic tile</li>
        <li>Chrome fixtures</li>
      </ul>
      
      <div class="package-item-count">14 items</div>
    </div>
    
    <div class="package-footer">
      <button class="btn btn-outline">Select</button>
    </div>
  </div>
  
  <div class="package-column selected" data-tier="better">
    <div class="package-selected-badge">✓</div>
    <div class="package-header">
      <h3 class="package-name">BETTER PACKAGE</h3>
      <div class="package-price">$14,200</div>
    </div>
    
    <div class="package-body">
      <div class="package-tier-label">Mid-range</div>
      
      <ul class="package-features">
        <li>Acrylic tub</li>
        <li>Semi-custom vanity</li>
        <li>Porcelain tile</li>
        <li>Brushed nickel fixtures</li>
      </ul>
      
      <div class="package-item-count">18 items</div>
    </div>
    
    <div class="package-footer">
      <button class="btn btn-primary">SELECTED</button>
    </div>
  </div>
  
  <div class="package-column" data-tier="best">
    <!-- Similar structure... -->
  </div>
</div>
```

**CSS:**
```css
.package-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-large);
  margin: var(--spacing-large) 0;
}

.package-column {
  border: 2px solid var(--color-border);
  border-radius: var(--shape-border-radius-4);
  padding: var(--spacing-large);
  position: relative;
  transition: all 0.3s ease;
}

.package-column:hover {
  border-color: var(--color-brand-500);
  box-shadow: var(--shape-shadow-2);
  transform: translateY(-4px);
}

.package-column.selected {
  border-color: var(--color-brand-500);
  border-width: 3px;
  box-shadow: var(--shape-shadow-3);
  background: rgba(15, 91, 167, 0.02);
}

.package-selected-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  background: var(--color-brand-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: var(--shape-shadow-3);
}

.package-header {
  text-align: center;
  margin-bottom: var(--spacing-large);
  padding-bottom: var(--spacing-large);
  border-bottom: 2px solid var(--color-border);
}

.package-name {
  font: var(--type-headline-3-font);
  margin: 0 0 var(--spacing-small);
}

.package-price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-brand-500);
}

.package-tier-label {
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-medium);
}

.package-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-large);
}

.package-features li {
  padding: var(--spacing-small) 0;
  padding-left: 1.5rem;
  position: relative;
}

.package-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-brand-500);
  font-weight: 700;
}

.package-item-count {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-large);
}

.package-footer button {
  width: 100%;
}
```

**Responsive:**
```css
@media (max-width: 1023px) {
  .package-comparison {
    grid-template-columns: 1fr;
  }
  
  .package-column.selected {
    order: -1; /* Move selected to top on mobile */
  }
}
```

---

### 4. **Within-Tier Customization Accordion** (Lisa)

**Used In:** Lisa's Customize Package page

**Visual Design:**
```
┌─ FIXTURES ────────────────────────────────────────────────────┐
│                                                                │
│ Bathtub                                                        │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ ( ) Acrylic 60" Standard       $680    ← Current       │   │
│ │ (●) Acrylic 66" Soaker          $1,105  +$425          │   │
│ │ ( ) Cast Iron Clawfoot          $1,580  +$900          │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                                │
│ Vanity                                                         │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ (●) 36" Semi-custom, White     $850    ← Current       │   │
│ │ ( ) 36" Semi-custom, Espresso   $850                    │   │
│ │ ( ) 42" Semi-custom, White      $1,020  +$170          │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="customization-section">
  <button class="customization-toggle" data-section="fixtures">
    <span class="toggle-icon">▼</span>
    <span class="section-name">FIXTURES</span>
  </button>
  
  <div class="customization-content" data-section="fixtures">
    <div class="customization-item">
      <h4 class="item-name">Bathtub</h4>
      
      <div class="options-list">
        <label class="option-radio">
          <input type="radio" name="bathtub" value="acrylic-60">
          <div class="option-details">
            <span class="option-name">Acrylic 60" Standard</span>
            <span class="option-price">$680</span>
            <span class="option-badge current">← Current</span>
          </div>
        </label>
        
        <label class="option-radio selected">
          <input type="radio" name="bathtub" value="acrylic-66" checked>
          <div class="option-details">
            <span class="option-name">Acrylic 66" Soaker</span>
            <span class="option-price">$1,105</span>
            <span class="option-delta positive">+$425</span>
          </div>
        </label>
        
        <label class="option-radio">
          <input type="radio" name="bathtub" value="cast-iron">
          <div class="option-details">
            <span class="option-name">Cast Iron Clawfoot</span>
            <span class="option-price">$1,580</span>
            <span class="option-delta positive">+$900</span>
          </div>
        </label>
      </div>
    </div>
    
    <div class="customization-item">
      <h4 class="item-name">Vanity</h4>
      <!-- Similar structure... -->
    </div>
  </div>
</div>
```

**CSS:**
```css
.customization-section {
  border: 1px solid var(--color-border);
  border-radius: var(--shape-border-radius-3);
  margin-bottom: var(--spacing-medium);
  overflow: hidden;
}

.customization-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  padding: var(--spacing-medium) var(--spacing-large);
  background: var(--color-surface);
  border: none;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customization-content {
  padding: var(--spacing-large);
}

.customization-item {
  margin-bottom: var(--spacing-large);
}

.customization-item:last-child {
  margin-bottom: 0;
}

.item-name {
  font: var(--type-body-1-default-font);
  font-weight: 600;
  margin: 0 0 var(--spacing-small);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
  padding: var(--spacing-small);
  background: var(--color-background);
  border-radius: var(--shape-border-radius-3);
}

.option-radio {
  display: flex;
  align-items: center;
  padding: var(--spacing-small) var(--spacing-medium);
  border: 2px solid transparent;
  border-radius: var(--shape-border-radius-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-radio:hover {
  background: var(--color-surface);
  border-color: var(--color-brand-300);
}

.option-radio.selected {
  background: rgba(15, 91, 167, 0.05);
  border-color: var(--color-brand-500);
}

.option-radio input[type="radio"] {
  margin-right: var(--spacing-medium);
  accent-color: var(--color-brand-500);
}

.option-details {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  flex: 1;
}

.option-name {
  flex: 1;
}

.option-price {
  font-weight: 600;
}

.option-delta {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--shape-border-radius-2);
  font-size: 0.875rem;
}

.option-delta.positive {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.option-delta.negative {
  background: var(--color-positive-100);
  color: var(--color-positive-700);
}

.option-badge.current {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
```

---

### 5. **Progressive Disclosure Step Card** (David)

**Used In:** David's Deck Builder steps

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Your Deck Kit: Step 3 of 5                                   │
│ ───────────────────────────────────────────────────────────  │
│ Choose Your Decking Material                                 │
└─────────────────────────────────────────────────────────────┘

┌─ YOUR CHOICES SO FAR ───────────────────────────────────────┐
│ Shape: Rectangular  │  Size: 16' x 20' (320 sq ft)          │
└─────────────────────────────────────────────────────────────┘

┌─ AVAILABLE OPTIONS ─────────────────────────────────────────┐
│                                                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ COMPOSITE DECKING                                  ✓  ┃ │
│ ┃ ─────────────────────────────────────────────────────  ┃ │
│ ┃ Price: $4,850                                          ┃ │
│ ┃ Maintenance: Wash annually                             ┃ │
│ ┃ Lifespan: 25-30 years                                  ┃ │
│ ┃ Best for: Low maintenance, family-friendly             ┃ │
│ ┃                                                         ┃ │
│ ┃ ✓ SELECTED                                             ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ PVC DECKING                               🔒 LOCKED   ┃ │
│ ┃ ─────────────────────────────────────────────────────  ┃ │
│ ┃ Price: $6,200                                          ┃ │
│ ┃ ⚠️ Not available: Requires $6K+ budget                ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─ TIP ───────────────────────────────────────────────────────┐
│ 💡 Composite decking costs more upfront but saves hundreds  │
│    in maintenance over 10 years. Great for busy families!   │
└─────────────────────────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="progressive-step">
  <div class="step-header">
    <span class="step-label">Your Deck Kit: Step 3 of 5</span>
    <h2 class="step-title">Choose Your Decking Material</h2>
  </div>
  
  <div class="step-breadcrumb">
    <span class="breadcrumb-label">Your choices so far:</span>
    <span class="breadcrumb-item">Shape: Rectangular</span>
    <span class="breadcrumb-separator">│</span>
    <span class="breadcrumb-item">Size: 16' x 20' (320 sq ft)</span>
  </div>
  
  <div class="step-options">
    <div class="option-card selected">
      <div class="option-card-badge selected-badge">✓</div>
      <div class="option-card-header">
        <h3 class="option-name">COMPOSITE DECKING</h3>
      </div>
      <div class="option-card-body">
        <div class="option-detail">
          <span class="detail-label">Price:</span>
          <span class="detail-value">$4,850</span>
        </div>
        <div class="option-detail">
          <span class="detail-label">Maintenance:</span>
          <span class="detail-value">Wash annually</span>
        </div>
        <div class="option-detail">
          <span class="detail-label">Lifespan:</span>
          <span class="detail-value">25-30 years</span>
        </div>
        <div class="option-detail">
          <span class="detail-label">Best for:</span>
          <span class="detail-value">Low maintenance, family-friendly</span>
        </div>
      </div>
      <div class="option-card-footer">
        <button class="btn btn-primary" disabled>✓ SELECTED</button>
      </div>
    </div>
    
    <div class="option-card locked">
      <div class="option-card-badge locked-badge">🔒 LOCKED</div>
      <div class="option-card-header">
        <h3 class="option-name">PVC DECKING</h3>
      </div>
      <div class="option-card-body">
        <div class="option-detail">
          <span class="detail-label">Price:</span>
          <span class="detail-value">$6,200</span>
        </div>
        <div class="option-locked-reason">
          ⚠️ Not available: Requires $6K+ budget
        </div>
      </div>
      <div class="option-card-footer">
        <button class="btn btn-outline" disabled>NOT AVAILABLE</button>
      </div>
    </div>
  </div>
  
  <div class="step-tip">
    <span class="tip-icon">💡</span>
    <p class="tip-text">
      Composite decking costs more upfront but saves hundreds in maintenance 
      over 10 years. Great for busy families!
    </p>
  </div>
</div>
```

**CSS:**
```css
.progressive-step {
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: var(--spacing-large);
}

.step-label {
  display: block;
  font: var(--type-details-caption-1-font);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-small);
}

.step-title {
  font: var(--type-headline-2-font);
  margin: 0;
}

.step-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-medium);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--shape-border-radius-3);
  margin-bottom: var(--spacing-large);
}

.breadcrumb-label {
  font-weight: 600;
  margin-right: var(--spacing-small);
}

.step-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
}

.option-card {
  border: 2px solid var(--color-border);
  border-radius: var(--shape-border-radius-4);
  padding: var(--spacing-large);
  position: relative;
  transition: all 0.3s ease;
}

.option-card.selected {
  border-color: var(--color-brand-500);
  background: rgba(15, 91, 167, 0.02);
}

.option-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-card-badge {
  position: absolute;
  top: -12px;
  right: var(--spacing-large);
  padding: 0.25rem 0.75rem;
  border-radius: var(--shape-border-radius-full);
  font-weight: 700;
  font-size: 0.875rem;
}

.selected-badge {
  background: var(--color-brand-500);
  color: white;
}

.locked-badge {
  background: var(--color-text-secondary);
  color: white;
}

.option-card-header {
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-medium);
  border-bottom: 2px solid var(--color-border);
}

.option-name {
  font: var(--type-headline-3-font);
  margin: 0;
}

.option-card-body {
  margin-bottom: var(--spacing-medium);
}

.option-detail {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-small) 0;
}

.detail-label {
  font-weight: 600;
}

.option-locked-reason {
  padding: var(--spacing-medium);
  background: var(--color-warning-100);
  border: 1px solid var(--color-warning-300);
  border-radius: var(--shape-border-radius-2);
  color: var(--color-warning-700);
  margin-top: var(--spacing-small);
}

.step-tip {
  display: flex;
  gap: var(--spacing-medium);
  padding: var(--spacing-medium) var(--spacing-large);
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-300);
  border-radius: var(--shape-border-radius-3);
}

.tip-icon {
  font-size: 1.5rem;
}

.tip-text {
  margin: 0;
  font: var(--type-body-2-default-font);
}
```

---

### 6. **Velocity Dashboard Card** (Kevin)

**Used In:** Kevin's Restock Dashboard

**Visual Design:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔴 FASTENERS                              HIGH PRIORITY ┃
┃ ────────────────────────────────────────────────────── ┃
┃ 18 items low  │  $850 suggested  │  ⏰ 2 days to stock ┃
┃                                                         ┃
┃ [ VIEW & ORDER ]                                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**HTML Structure:**
```html
<div class="velocity-card priority-high">
  <div class="velocity-header">
    <span class="priority-icon">🔴</span>
    <h3 class="category-name">FASTENERS</h3>
    <span class="priority-label">HIGH PRIORITY</span>
  </div>
  
  <div class="velocity-stats">
    <div class="stat-item">
      <span class="stat-value">18</span>
      <span class="stat-label">items low</span>
    </div>
    <div class="stat-separator">│</div>
    <div class="stat-item">
      <span class="stat-value">$850</span>
      <span class="stat-label">suggested</span>
    </div>
    <div class="stat-separator">│</div>
    <div class="stat-item">
      <span class="stat-icon">⏰</span>
      <span class="stat-value">2 days</span>
      <span class="stat-label">to stock out</span>
    </div>
  </div>
  
  <div class="velocity-actions">
    <button class="btn btn-primary">VIEW & ORDER</button>
  </div>
</div>
```

**CSS:**
```css
.velocity-card {
  border: 2px solid var(--color-border);
  border-radius: var(--shape-border-radius-4);
  padding: var(--spacing-large);
  margin-bottom: var(--spacing-medium);
  transition: all 0.3s ease;
}

.velocity-card:hover {
  box-shadow: var(--shape-shadow-2);
  transform: translateY(-2px);
}

.velocity-card.priority-high {
  border-left-width: 8px;
  border-left-color: var(--color-negative-500);
}

.velocity-card.priority-medium {
  border-left-width: 8px;
  border-left-color: var(--color-warning-500);
}

.velocity-card.priority-low {
  border-left-width: 8px;
  border-left-color: var(--color-positive-500);
}

.velocity-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-medium);
  border-bottom: 2px solid var(--color-border);
}

.priority-icon {
  font-size: 1.5rem;
}

.category-name {
  flex: 1;
  font: var(--type-headline-3-font);
  margin: 0;
}

.priority-label {
  font: var(--type-details-caption-1-font);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-negative-500);
}

.velocity-card.priority-medium .priority-label {
  color: var(--color-warning-700);
}

.velocity-card.priority-low .priority-label {
  color: var(--color-positive-700);
}

.velocity-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-brand-500);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.stat-separator {
  color: var(--color-border);
  font-size: 1.5rem;
}

.velocity-actions button {
  width: 100%;
}
```

---

### 7. **SKU Velocity Detail Card** (Kevin)

**Used In:** Kevin's Category Detail page

**Visual Design:**
```
┌──────────────────────────────────────────────────────┐
│ DECK SCREWS - 3" EXTERIOR (SKU: FAST-3001)           │
│ ──────────────────────────────────────────────────   │
│                                                       │
│ Current stock:     4 boxes (24% of optimal)  ⚠️      │
│ Avg daily sales:   3.2 boxes                         │
│ Days until out:    1.2 days                          │
│                                                       │
│ SUGGESTED: Order 15 boxes (2-week supply)            │
│                                                       │
│ Your order: [15] ↕  boxes                            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="sku-velocity-card">
  <div class="sku-header">
    <h4 class="sku-product-name">DECK SCREWS - 3" EXTERIOR</h4>
    <span class="sku-code">(SKU: FAST-3001)</span>
  </div>
  
  <div class="sku-metrics">
    <div class="metric-row">
      <span class="metric-label">Current stock:</span>
      <span class="metric-value warning">
        4 boxes (24% of optimal) ⚠️
      </span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Avg daily sales:</span>
      <span class="metric-value">3.2 boxes</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Days until out:</span>
      <span class="metric-value critical">1.2 days</span>
    </div>
  </div>
  
  <div class="sku-suggestion">
    <strong>SUGGESTED:</strong> Order 15 boxes (2-week supply)
  </div>
  
  <div class="sku-order-control">
    <label for="sku-FAST-3001-qty">Your order:</label>
    <div class="quantity-spinner">
      <button class="qty-btn" data-action="decrease">-</button>
      <input type="number" id="sku-FAST-3001-qty" value="15" min="0" class="qty-input">
      <button class="qty-btn" data-action="increase">+</button>
      <span class="qty-unit">boxes</span>
    </div>
  </div>
</div>
```

**CSS:**
```css
.sku-velocity-card {
  border: 1px solid var(--color-border);
  border-radius: var(--shape-border-radius-3);
  padding: var(--spacing-medium);
  margin-bottom: var(--spacing-small);
  background: var(--color-surface);
}

.sku-header {
  margin-bottom: var(--spacing-small);
  padding-bottom: var(--spacing-small);
  border-bottom: 1px solid var(--color-border);
}

.sku-product-name {
  font: var(--type-body-1-default-font);
  font-weight: 600;
  margin: 0;
}

.sku-code {
  font: var(--type-details-caption-1-font);
  color: var(--color-text-secondary);
}

.sku-metrics {
  margin-bottom: var(--spacing-medium);
}

.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.metric-label {
  color: var(--color-text-secondary);
}

.metric-value {
  font-weight: 600;
}

.metric-value.warning {
  color: var(--color-warning-700);
}

.metric-value.critical {
  color: var(--color-negative-700);
  font-weight: 700;
}

.sku-suggestion {
  padding: var(--spacing-small);
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-300);
  border-radius: var(--shape-border-radius-2);
  margin-bottom: var(--spacing-medium);
}

.sku-order-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
}

.sku-order-control label {
  font-weight: 600;
}

.quantity-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  border-radius: var(--shape-border-radius-2);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: var(--color-brand-500);
  color: white;
  border-color: var(--color-brand-500);
}

.qty-input {
  width: 60px;
  padding: 0.5rem;
  border: 2px solid var(--color-border);
  border-radius: var(--shape-border-radius-2);
  text-align: center;
  font-weight: 700;
}

.qty-input:focus {
  outline: none;
  border-color: var(--color-brand-500);
}

.qty-unit {
  color: var(--color-text-secondary);
}
```

---

## Component States & Variants

### Button States
- **Primary:** Solid brand color, white text
- **Outline:** Transparent with brand border
- **Ghost:** No border, brand text
- **Disabled:** Grayed out, no hover
- **Loading:** Spinner icon, disabled

### Card States
- **Default:** Border, hover lift
- **Selected:** Thicker border, checkmark badge
- **Locked:** Grayed out, lock icon, disabled
- **Expanded:** Accordion open
- **Collapsed:** Accordion closed

### Input States
- **Default:** Gray border
- **Focus:** Brand color border + outline
- **Error:** Red border
- **Success:** Green border
- **Disabled:** Grayed out

---

## Responsive Patterns

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px

### Mobile Adaptations
1. **Package Comparison:** Stack vertically, selected first
2. **BOM Table:** Horizontal scroll or simplified view
3. **Dashboard Cards:** Full-width stack
4. **Progressive Steps:** Full-width option cards

---

## Interaction Patterns

### Accordions
- Click header → Expand/collapse
- Smooth height animation (300ms)
- Rotate icon (▼ → ►)

### Quantity Spinners
- +/- buttons increment/decrement by 1
- Input field allows direct entry
- On blur: Validate (min 0, max 9999)
- On change: Auto-recalculate totals

### Radio Groups
- Single selection within group
- Visual highlight on selected
- Live updates (no "Apply" button needed)

### Live Totals
- Update immediately on quantity/selection change
- Animate number transitions (count-up effect)
- Highlight changed values briefly (yellow flash)

---

## Animation Library

### Micro-interactions
- **Hover lift:** `transform: translateY(-4px)` + shadow
- **Button press:** `transform: scale(0.98)`
- **Checkmark appear:** Scale from 0 → 1 with bounce
- **Number count-up:** Smooth transition over 300ms
- **Flash highlight:** Yellow background fade out

### Page Transitions
- **Wizard steps:** Fade out old, fade in new (400ms)
- **Accordion:** Height transition (300ms ease)
- **Modal:** Fade overlay + slide content (300ms)

---

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements tabbable
- Focus visible (2px outline)
- Enter/Space activates buttons
- Arrow keys navigate radio groups

### Screen Readers
- Proper ARIA labels on all inputs
- `aria-expanded` on accordions
- `aria-selected` on radio options
- `aria-live` for live updates (totals, etc.)

### Color Contrast
- Text: Minimum 4.5:1 contrast
- Large text: Minimum 3:1
- Interactive elements: Distinguishable without color alone

---

## Next Steps

1. **Build Component Storybook** - Document all variants
2. **Create Figma Design System** - Visual specs for designers
3. **Implement Base Components** - Button, Input, Card, Table
4. **Build Persona-Specific Components** - Template Card, Package Grid, etc.
5. **Test Accessibility** - Keyboard nav, screen readers, contrast
6. **Mobile Optimization** - Responsive variants for all components

---

**Goal:** Modular, reusable component library that powers all 5 persona experiences.

