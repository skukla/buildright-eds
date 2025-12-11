# Reusing Project Builder Visual Patterns for Sarah's Configurator

**Date**: December 2, 2025  
**Purpose**: Adapt existing photo tile design from Project Builder for Build Configurator

---

## 🎉 Great News: We Already Have This Built!

The Project Builder (`blocks/project-builder/`) already has the **exact photo tile pattern** we need:

### Existing Implementation

**CSS Classes** (already in `project-builder.css`):
- `.wizard-option-photo` - Photo tile container
- `.wizard-photo-overlay` - Text overlay with gradient
- `.wizard-options-photo` - Grid container

**Visual Features**:
- ✅ Full background images with gradient overlay
- ✅ Hover effects (lift + border highlight)
- ✅ Selected state with checkmark badge (✓)
- ✅ Smooth transitions
- ✅ Responsive (240px desktop, 200px mobile)

---

## 📋 What We Can Reuse

### 1. **Photo Tile Component** (Lines 336-404 in `project-builder.css`)

```css
.wizard-option-photo {
  position: relative;
  border-radius: var(--shape-border-radius-3);
  overflow: hidden;
  cursor: pointer;
  height: 240px;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  background-size: cover !important;
  background-position: center !important;
}

.wizard-option-photo:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--color-brand-500);
}

/* Selected state with checkmark */
.wizard-option-photo:has(.wizard-option-input:checked)::after {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: var(--color-brand-500);
  color: white;
  border-radius: 50%;
  /* ... */
}

.wizard-photo-overlay {
  background: linear-gradient(to top, 
    rgba(0,0,0,0.85) 0%, 
    rgba(0,0,0,0.5) 60%, 
    transparent 100%);
  padding: 2rem 1.5rem 1.5rem;
  color: white;
}
```

**Perfect for**: Variant selection (Bonus Room, 3-Car Garage, Covered Patio)

---

### 2. **Grid Layout** (Lines 407-412)

```css
.wizard-options-photo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
```

**Perfect for**: Laying out 3 variant options side-by-side

---

## 🎨 Adaptation for Sarah's Build Configurator

### Option A: Direct Reuse (Minimal Changes)

**Just rename classes for clarity:**

```html
<!-- Build Configurator: Optional Features -->
<div class="optional-features-grid wizard-options-photo">
  
  <!-- Bonus Room -->
  <div class="feature-tile wizard-option-photo" 
       style="background-image: url('/images/bonus-room.jpg')">
    <input type="checkbox" class="wizard-option-input" 
           name="variant" value="bonus-room" id="variant-bonus">
    <div class="wizard-photo-overlay">
      <h3>Bonus Room</h3>
      <p>Adds 200 sq ft office/bedroom</p>
      <p class="feature-price">+$15,000</p>
    </div>
  </div>
  
  <!-- 3-Car Garage -->
  <div class="feature-tile wizard-option-photo" 
       style="background-image: url('/images/3-car-garage.jpg')">
    <input type="checkbox" class="wizard-option-input" 
           name="variant" value="3-car-garage" id="variant-garage">
    <div class="wizard-photo-overlay">
      <h3>3-Car Garage</h3>
      <p>Extends garage depth 12 ft</p>
      <p class="feature-price">+$8,000</p>
    </div>
  </div>
  
  <!-- Covered Patio -->
  <div class="feature-tile wizard-option-photo" 
       style="background-image: url('/images/covered-patio.jpg')">
    <input type="checkbox" class="wizard-option-input" 
           name="variant" value="covered-patio" id="variant-patio">
    <div class="wizard-photo-overlay">
      <h3>Covered Patio</h3>
      <p>12x16 outdoor living space</p>
      <p class="feature-price">+$12,000</p>
    </div>
  </div>
  
</div>
```

**CSS Changes**: None! Reuse existing classes.

**JavaScript**: Adapt existing event handlers from `project-builder.js`

---

### Option B: Extract to Shared Component (Best Practice)

**Create reusable component**: `blocks/photo-tile/photo-tile.css`

```css
/* Photo Tile - Reusable Component */
.photo-tile {
  position: relative;
  border-radius: var(--shape-border-radius-3);
  overflow: hidden;
  cursor: pointer;
  height: 240px;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  background-size: cover;
  background-position: center;
}

.photo-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--color-brand-500);
}

.photo-tile.selected {
  border-color: var(--color-brand-500);
  box-shadow: 0 8px 20px rgba(15, 91, 167, 0.3);
}

.photo-tile.selected::after {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: var(--color-brand-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.photo-tile-overlay {
  position: relative;
  width: 100%;
  background: linear-gradient(to top, 
    rgba(0,0,0,0.85) 0%, 
    rgba(0,0,0,0.5) 60%, 
    transparent 100%);
  padding: 2rem 1.5rem 1.5rem;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.photo-tile h3 {
  font-size: 1.375rem;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

.photo-tile p {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.25rem 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.photo-tile .feature-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-top: 0.5rem;
}

.photo-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Mobile responsive */
@media (max-width: 767px) {
  .photo-tile {
    height: 200px;
  }
  
  .photo-tile-grid {
    grid-template-columns: 1fr;
  }
}
```

**Usage**:
```html
<div class="photo-tile-grid">
  <div class="photo-tile" data-value="bonus-room"
       style="background-image: url('/images/bonus-room.jpg')">
    <div class="photo-tile-overlay">
      <h3>Bonus Room</h3>
      <p>Adds 200 sq ft office/bedroom</p>
      <p class="feature-price">+$15,000</p>
    </div>
  </div>
  <!-- More tiles... -->
</div>
```

---

## 🎨 Visual Mock-up: Build Configurator with Photo Tiles

```
┌──────────────────────────────────────────────────────────┐
│ Configure Build: The Sedona                    House #47 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Base Configuration                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Photo: Standard Sedona]  The Sedona               │ │
│ │                            2,450 sq ft • 3BR/2BA    │ │
│ │                            Base: $225,000           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Optional Floor Plan Features                             │
│ Click photos to add features to this build:              │
│                                                           │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────┐│
│ │ ✓              │ │                │ │               ││
│ │[Photo: Bonus   │ │[Photo: 3-car   │ │[Photo: Patio  ││
│ │ room interior] │ │ garage ext]    │ │ with cover]   ││
│ │                │ │                │ │               ││
│ │                │ │                │ │               ││
│ │────────────────│ │────────────────│ │───────────────││
│ │ Bonus Room     │ │ 3-Car Garage   │ │ Covered Patio ││
│ │ Adds 200 sf    │ │ Extends 12 ft  │ │ 12x16 space   ││
│ │ +$15,000       │ │ +$8,000        │ │ +$12,000      ││
│ └────────────────┘ └────────────────┘ └───────────────┘│
│   GREEN border       Gray               Gray            │
│   with ✓ badge                                          │
│                                                           │
│ Total: $240,000                                          │
│ • Base: $225,000                                         │
│ • Bonus Room: +$15,000                                   │
│                                                           │
│ [Continue to Material Package →]                        │
└──────────────────────────────────────────────────────────┘
```

---

## 💻 JavaScript Integration

### Reuse Existing Event Handlers

**From `project-builder.js`** (adapt for checkboxes):

```javascript
// Existing pattern from project-builder.js
function setupPhotoTiles() {
  const photoTiles = document.querySelectorAll('.wizard-option-photo');
  
  photoTiles.forEach(tile => {
    tile.addEventListener('click', function() {
      const checkbox = this.querySelector('.wizard-option-input');
      
      // Toggle checkbox
      checkbox.checked = !checkbox.checked;
      
      // Update selected state
      this.classList.toggle('selected', checkbox.checked);
      
      // Update cost calculator
      updateTotalCost();
    });
  });
}

function updateTotalCost() {
  const basePrice = 225000;
  let totalCost = basePrice;
  
  // Get all checked variant checkboxes
  const selectedVariants = document.querySelectorAll(
    'input[name="variant"]:checked'
  );
  
  selectedVariants.forEach(variant => {
    const price = parseFloat(variant.dataset.price || 0);
    totalCost += price;
  });
  
  // Animate cost change
  animateCostUpdate(totalCost);
}
```

---

## 📸 Images Needed

### Photos for Variants (3 images per template)

**The Sedona** (template ID: `sedona-2450`):
- `bonus-room.jpg` - Interior shot of furnished bonus room
- `3-car-garage.jpg` - Exterior showing garage extension
- `covered-patio.jpg` - Outdoor living space with furniture

**Photo Specs**:
- Dimensions: 800×600px minimum (4:3 ratio)
- Format: WebP with JPEG fallback
- File size: <150KB each
- Quality: High-res, professional shots

**Total Images**: 6 templates × 3 variants = **18 images**

**Note**: Can reuse generic photos across templates (e.g., same bonus room photo for all)

---

## 🚀 Implementation Plan

### Phase 1: Copy Existing Styles (30 minutes)
- [ ] Extract photo tile CSS from `project-builder.css`
- [ ] Create `blocks/photo-tile/photo-tile.css` (shared component)
- [ ] Import in `styles/styles.css`

### Phase 2: Build Configurator HTML (1 hour)
- [ ] Create `pages/build-configurator.html`
- [ ] Add photo tile grid for variants
- [ ] Add photo tile grid for material packages (optional)
- [ ] Add cost summary section

### Phase 3: JavaScript Interaction (2 hours)
- [ ] Adapt event handlers from `project-builder.js`
- [ ] Add cost calculator logic
- [ ] Add form submission to ProjectManager
- [ ] Add navigation to BOM review

### Phase 4: Images (2-3 hours)
- [ ] Source/create variant photos (18 total)
- [ ] Optimize images (WebP + JPEG)
- [ ] Add to `/images/features/` folder

**Total Time**: 5-6 hours (vs. 12-15 hours building from scratch)

---

## ✅ Benefits of Reusing Existing Pattern

**Pros**:
- ✅ **70% faster** - Styles already exist
- ✅ **Consistent UX** - Same pattern as Project Builder
- ✅ **Tested & working** - Already in production
- ✅ **Responsive** - Mobile layout already handled
- ✅ **Accessible** - Keyboard nav, screen readers work

**Cons**:
- ⚠️ Need to source/create 18 photos (but would need them anyway)

---

## 📋 Next Steps

1. **Review existing Project Builder** - See photo tiles in action
2. **Decide: Reuse directly or extract to shared component?**
   - Option A: Copy CSS into build-configurator
   - Option B: Extract to `blocks/photo-tile/` (recommended for reusability)
3. **Source images** - Bonus room, garage, patio photos
4. **Build configurator page** - Adapt HTML structure
5. **Test interaction** - Click to select, cost updates

---

## 🎯 Recommendation

**Use Option B (Extract to Shared Component)**:
- Create `blocks/photo-tile/` for reusability
- Both Project Builder AND Build Configurator can use it
- Future pages (package selection, etc.) can reuse
- Single source of truth for photo tile pattern

**Time Savings**: ~7 hours vs. building from scratch

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: Ready to implement  
**Estimated Time**: 5-6 hours (vs. 12-15 hours new build)

