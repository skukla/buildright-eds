# Visual Configurator Design for Sarah's Build Configuration

**Date**: December 2, 2025  
**Purpose**: Design a visual, image-based configurator instead of checkbox-heavy forms

---

## 🎯 Design Goal

**Transform this** (Form-based):
```
☐ Bonus Room          +$15,000
☐ 3-Car Garage        +$8,000
☐ Covered Patio       +$12,000
```

**Into this** (Visual):
```
[Interactive floor plan where Sarah clicks on areas to add/remove features]
```

---

## 🎨 Visual Configurator Patterns

### Option A: Interactive Floor Plan with Hotspots

**Concept**: Show floor plan with clickable regions

```
┌────────────────────────────────────────────────────────┐
│ Configure: The Sedona                        House #47 │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Floor Plan (click areas to add options)               │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │                                          │          │
│  │    ┌──────────┐  ┌──────────┐          │          │
│  │    │ Bedroom  │  │ Bedroom  │  [BONUS] │ ← Click  │
│  │    │    2     │  │    3     │  [ROOM?] │   here   │
│  │    └──────────┘  └──────────┘  [+$15K] │          │
│  │                                          │          │
│  │    ┌─────────────────────────┐          │          │
│  │    │                          │          │          │
│  │    │    Living / Dining       │          │          │
│  │    │                          │          │          │
│  │    └─────────────────────────┘          │          │
│  │                                          │          │
│  │    ┌──────────┐  ┌─────────┐            │          │
│  │    │ Primary  │  │ Garage  │ [3RD CAR?] │ ← Click  │
│  │    │ Bedroom  │  │ 2-car   │  [+$8K]   │   here   │
│  │    └──────────┘  └─────────┘            │          │
│  │                                          │          │
│  │                   ┌──────────────────┐   │          │
│  │                   │ [COVERED PATIO?] │   │ ← Click  │
│  │                   │     [+$12K]      │   │   here   │
│  │                   └──────────────────┘   │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  Selected Options:                                     │
│  ✓ Bonus Room (+$15,000)            [Remove]          │
│                                                         │
│  Total: $240,000                                       │
│  [Continue to Package Selection →]                    │
└────────────────────────────────────────────────────────┘
```

**Pros**:
- ✅ Very visual - see exactly where additions go
- ✅ Spatial context - understand how bonus room relates to layout
- ✅ Easy to verify - see what's selected at a glance

**Cons**:
- ⚠️ Requires floor plan SVGs/images for all 6 templates
- ⚠️ Mobile responsive challenges (small screens)
- ⚠️ Design effort: ~2-3 hours per template (18 hours total)

---

### Option B: Photo Tiles with Toggle States

**Concept**: Large photo cards that toggle on/off when clicked

```
┌──────────────────────────────────────────────────────────┐
│ Configure: The Sedona                          House #47 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Base Configuration:                                      │
│ ┌───────────────────────────────────────────┐           │
│ │ [Photo: Standard Sedona exterior]          │           │
│ │ The Sedona • 2,450 sq ft • 3BR/2BA        │           │
│ │ Base Price: $225,000                      │           │
│ └───────────────────────────────────────────┘           │
│                                                           │
│ Optional Features (click to add):                        │
│                                                           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │✓ SELECTED    │ │              │ │              │     │
│ │[Photo: Bonus │ │[Photo: 3-car │ │[Photo: Patio │     │
│ │ Room interior│ │ garage]      │ │ with cover]  │     │
│ │ over garage] │ │              │ │              │     │
│ │              │ │              │ │              │     │
│ │ Bonus Room   │ │ 3-Car Garage │ │ Covered Patio│     │
│ │ +$15,000     │ │ +$8,000      │ │ +$12,000     │     │
│ │              │ │              │ │              │     │
│ │ [✓ Added]    │ │ [+ Add]      │ │ [+ Add]      │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
│  ↑ Green border     Gray border      Gray border        │
│    (selected)       (available)      (available)        │
│                                                           │
│ Estimated Total: $240,000                                │
│ • Base: $225,000                                         │
│ • Bonus Room: +$15,000                                   │
│                                                           │
│ [Continue to Material Package →]                        │
└──────────────────────────────────────────────────────────┘
```

**Interaction**:
- Click card → Green border, "✓ SELECTED" badge, cost adds to total
- Click again → Remove selection, border gray, cost removes

**Pros**:
- ✅ Highly visual - real photos of features
- ✅ Clear toggle state - green border = selected
- ✅ Easy to implement - simpler than interactive floor plan
- ✅ Mobile friendly - cards stack vertically on small screens
- ✅ Reuses existing `.card` design system patterns

**Cons**:
- ⚠️ Need photos for all optional features (but fewer than floor plans)
- ⚠️ Less spatial context than floor plan approach

---

### Option C: Before/After Slider (Per Feature)

**Concept**: Show visual comparison of base vs. with feature

```
┌────────────────────────────────────────────────────┐
│ Add Bonus Room?                          +$15,000  │
├────────────────────────────────────────────────────┤
│                                                     │
│  [Image: Floor plan with slider overlay]           │
│                                                     │
│  ← Without Bonus Room  |  With Bonus Room →       │
│                        ↕ (drag slider)             │
│                                                     │
│  [○────────────────●] 50%                         │
│   Base    ↑ Slider   With feature                 │
│                                                     │
│  [Skip]                          [Add This →]     │
└────────────────────────────────────────────────────┘
```

**Pros**:
- ✅ Shows exact visual difference
- ✅ Educational (good for first-time buyers, less relevant for Sarah)

**Cons**:
- ❌ Too slow for Sarah (expert user, doesn't need education)
- ❌ One feature at a time (multiple steps)
- ⚠️ Not recommended for production builder workflow

---

### Option D: Hybrid - Floor Plan Overview + Photo Details

**Concept**: Small floor plan for spatial context + large photo tiles for selection

```
┌──────────────────────────────────────────────────────────────┐
│ Configure: The Sedona                              House #47 │
├───────────────────┬──────────────────────────────────────────┤
│                   │                                           │
│  [Floor Plan]     │  Optional Features                       │
│  ┌──────────┐    │                                           │
│  │  BR  BR  │    │  ┌────────────────┐ ┌────────────────┐  │
│  │          │    │  │ ✓ SELECTED     │ │                │  │
│  │  [BONUS] │◄───┼──│ [Photo: Bonus  │ │ [Photo: 3-car  │  │
│  │  Living  │    │  │  room interior]│ │  garage ext]   │  │
│  │          │    │  │                 │ │                │  │
│  │  Primary │    │  │ Bonus Room     │ │ 3-Car Garage   │  │
│  │  Garage  │◄───┼──│ +$15,000       │ │ +$8,000        │  │
│  │          │    │  │ [✓ Added]      │ │ [+ Add]        │  │
│  │  [PATIO] │◄───┼──└────────────────┘ └────────────────┘  │
│  └──────────┘    │                                           │
│   200x150px      │  ┌────────────────┐                      │
│                   │  │ [Photo: Patio  │                      │
│                   │  │  with furniture│                      │
│                   │  │  and cover]    │                      │
│                   │  │ Covered Patio  │                      │
│                   │  │ +$12,000       │                      │
│                   │  │ [+ Add]        │                      │
│                   │  └────────────────┘                      │
│                   │                                           │
│                   │  Total: $240,000                         │
│                   │  [Continue →]                            │
└───────────────────┴──────────────────────────────────────────┘
```

**Pros**:
- ✅ Best of both: spatial context + visual appeal
- ✅ Floor plan shows where features go
- ✅ Photos make features tangible
- ✅ Clear selection state

**Cons**:
- ⚠️ More complex layout
- ⚠️ Requires both floor plans AND photos

---

## 🎯 Recommended Approach: **Option B (Photo Tiles)**

### Why This Works Best for Sarah

**Speed** ⚡
- Single click to select/deselect
- All options visible at once (no multi-step wizard)
- Clear visual feedback (green border = selected)

**Clarity** 👁️
- Photos show exactly what buyer is getting
- No ambiguity (checkbox labels can be misread)
- Easy to verify selections at a glance

**Mobile Friendly** 📱
- Cards stack vertically on small screens
- Touch-friendly (large tap targets)
- Responsive grid (3 cols desktop → 1 col mobile)

**Low Implementation Cost** 💰
- Reuses existing `.card` design system
- Photos already exist (finished home images)
- Simple JavaScript (toggle class on click)

---

## 🎨 Detailed Design Spec: Photo Tile Configurator

### Layout Structure

```css
.configurator-section {
  padding: var(--spacing-large);
}

.base-config-card {
  /* Large card showing base template */
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  padding: var(--spacing-large);
  background: var(--color-neutral-50);
  border-radius: var(--shape-border-radius-3);
  margin-bottom: var(--spacing-large);
}

.base-config-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--shape-border-radius-2);
}

.optional-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-large);
  margin-bottom: var(--spacing-large);
}

.feature-card {
  position: relative;
  border: 3px solid var(--color-neutral-200);
  border-radius: var(--shape-border-radius-3);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-card:hover {
  border-color: var(--color-brand-500);
  box-shadow: var(--shape-shadow-3);
}

.feature-card.selected {
  border-color: var(--color-success-500);
  background: var(--color-success-50);
}

.feature-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.feature-card-selected-badge {
  position: absolute;
  top: var(--spacing-small);
  right: var(--spacing-small);
  background: var(--color-success-500);
  color: white;
  padding: var(--spacing-xs) var(--spacing-small);
  border-radius: var(--shape-border-radius-2);
  font-weight: 600;
  font-size: var(--font-size-small);
  display: none;
}

.feature-card.selected .feature-card-selected-badge {
  display: block;
}

.feature-card-content {
  padding: var(--spacing-medium);
}

.feature-card-title {
  font-size: var(--font-size-large);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.feature-card-description {
  font-size: var(--font-size-small);
  color: var(--color-neutral-600);
  margin-bottom: var(--spacing-small);
}

.feature-card-price {
  font-size: var(--font-size-xlarge);
  font-weight: 700;
  color: var(--color-brand-600);
}

.feature-card-action {
  margin-top: var(--spacing-small);
  width: 100%;
}
```

### Interactive Prototype (Wireframe)

```
STEP 1: Initial State (Nothing Selected)
┌────────────────────────────────────────────────────┐
│ Configure: The Sedona                    House #47 │
├────────────────────────────────────────────────────┤
│                                                     │
│ Base Configuration                                 │
│ ┌──────────────────────────────────────────────┐  │
│ │ [Photo]  The Sedona                          │  │
│ │          2,450 sq ft • 3BR/2BA • 2-car garage│  │
│ │          Base Price: $225,000                │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ Optional Features (click to add)                   │
│                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │              │ │              │ │             ││
│ │ [Photo:      │ │ [Photo:      │ │ [Photo:     ││
│ │  Bonus room] │ │  3-car gar]  │ │  Patio]     ││
│ │              │ │              │ │             ││
│ │ Bonus Room   │ │ 3-Car Garage │ │ Covered     ││
│ │ Adds 200 sf  │ │ Extends gar  │ │ Patio       ││
│ │ office/bed   │ │ depth 12 ft  │ │ 12x16 space ││
│ │              │ │              │ │             ││
│ │ +$15,000     │ │ +$8,000      │ │ +$12,000    ││
│ │              │ │              │ │             ││
│ │ [+ Add]      │ │ [+ Add]      │ │ [+ Add]     ││
│ └──────────────┘ └──────────────┘ └─────────────┘│
│   Gray border      Gray border      Gray border   │
│                                                     │
│ Estimated Total: $225,000                          │
│                                                     │
│ [Continue to Package Selection →]                 │
└────────────────────────────────────────────────────┘


STEP 2: After Clicking Bonus Room Card
┌────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │ ✓ SELECTED   │ │              │ │             ││
│ │ [Photo:      │ │ [Photo:      │ │ [Photo:     ││
│ │  Bonus room] │ │  3-car gar]  │ │  Patio]     ││
│ │              │ │              │ │             ││
│ │ Bonus Room   │ │ 3-Car Garage │ │ Covered     ││
│ │ +$15,000     │ │ +$8,000      │ │ Patio       ││
│ │              │ │              │ │ +$12,000    ││
│ │ [✓ Added]    │ │ [+ Add]      │ │ [+ Add]     ││
│ └──────────────┘ └──────────────┘ └─────────────┘│
│   GREEN border     Gray border      Gray border   │
│   (animated)                                       │
│                                                     │
│ Estimated Total: $240,000 ← (Updated)             │
│ • Base: $225,000                                   │
│ • Bonus Room: +$15,000                             │
└────────────────────────────────────────────────────┘


STEP 3: After Clicking Covered Patio (Multiple Selections)
┌────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │ ✓ SELECTED   │ │              │ │ ✓ SELECTED  ││
│ │ [Photo]      │ │ [Photo]      │ │ [Photo]     ││
│ │ Bonus Room   │ │ 3-Car Garage │ │ Covered     ││
│ │ +$15,000     │ │ +$8,000      │ │ Patio       ││
│ │ [✓ Added]    │ │ [+ Add]      │ │ [✓ Added]   ││
│ └──────────────┘ └──────────────┘ └─────────────┘│
│   GREEN            Gray             GREEN         │
│                                                     │
│ Estimated Total: $252,000                          │
│ • Base: $225,000                                   │
│ • Bonus Room: +$15,000                             │
│ • Covered Patio: +$12,000                          │
└────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Responsive Behavior

### Desktop (> 1024px)
- 3-column grid for feature cards
- Side-by-side layout

### Tablet (768px - 1023px)
- 2-column grid for feature cards
- Comfortable touch targets

### Mobile (< 767px)
- 1-column grid (stacked cards)
- Full-width cards
- Larger tap targets (minimum 44x44px per iOS guidelines)

---

## ♿ Accessibility Considerations

### Keyboard Navigation
- Tab to navigate between cards
- Space/Enter to toggle selection
- Visual focus indicator (blue outline)

### Screen Readers
```html
<button 
  class="feature-card" 
  aria-pressed="false"
  aria-label="Add bonus room, adds 200 square feet, costs 15,000 dollars"
>
  <!-- Card content -->
</button>
```

### Color Blindness
- Don't rely only on green border
- Add ✓ icon + "SELECTED" text badge
- Use patterns/icons in addition to colors

---

## 🎬 Animation & Micro-interactions

### Selection Animation
```css
@keyframes select-feature {
  0% {
    transform: scale(1);
    border-color: var(--color-neutral-200);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    border-color: var(--color-success-500);
  }
}

.feature-card.selected {
  animation: select-feature 0.3s ease;
}
```

### Cost Counter Animation
```javascript
// Animate cost change (count up/down effect)
function animateCostChange(oldTotal, newTotal, duration = 500) {
  const start = Date.now();
  const diff = newTotal - oldTotal;
  
  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = oldTotal + (diff * progress);
    
    document.querySelector('.total-cost').textContent = 
      `$${Math.round(current).toLocaleString()}`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}
```

---

## 🖼️ Image Requirements

### Photos Needed (Per Template)

**Base Configuration Photo**:
- Finished home exterior (200x150px minimum)
- Shows standard configuration

**Optional Feature Photos** (per feature):
- Bonus room: Interior shot showing furnished space (280x200px)
- 3-car garage: Exterior showing garage extension (280x200px)
- Covered patio: Outdoor living space with furniture (280x200px)

**Total Images**:
- 6 templates × 4 images (1 base + 3 features) = 24 images
- Can reuse generic bonus room / garage / patio photos across templates

---

## 💻 Implementation Complexity

### Phase 1: Basic Photo Tiles (4-6 hours)
- [ ] HTML structure for configurator page
- [ ] CSS for card grid and selection states
- [ ] JavaScript for click-to-toggle functionality
- [ ] Cost calculator updates

### Phase 2: Polish & Animation (2-3 hours)
- [ ] Selection animations
- [ ] Cost counter animation
- [ ] Hover states
- [ ] Mobile responsive testing

### Phase 3: Image Preparation (6-8 hours)
- [ ] Source/create photos for all features
- [ ] Optimize images for web
- [ ] Add to project

**Total Time**: 12-17 hours (vs. 18+ hours for interactive floor plans)

---

## ✅ Comparison: Visual vs. Form-Based

| Aspect | Form-Based (Checkboxes) | Visual (Photo Tiles) |
|--------|------------------------|----------------------|
| **Speed** | Fast (checkbox = 1 click) | Fast (card click = 1 click) |
| **Clarity** | Text-based | Image + text |
| **Mobile** | Works, but small targets | Better (large cards) |
| **Verification** | Read list of checked items | See green borders at a glance |
| **User Preference** | 3/10 (utilitarian) | 8/10 (engaging) |
| **Implementation** | 2 hours | 12-17 hours |
| **Maintenance** | Easy (just update text) | Medium (need to manage images) |

**Recommendation**: **Photo Tiles** for better UX, worth the extra development time

---

## 🎯 Next Steps

1. **Gather/Create Images**
   - Source finished home photos
   - Photograph/render bonus rooms, garages, patios
   - Optimize for web (WebP format, lazy loading)

2. **Design High-Fidelity Mockup**
   - Create in Figma/Sketch with real images
   - Define exact dimensions, spacing, colors
   - Test on mobile viewport

3. **Build Prototype**
   - HTML/CSS/JS implementation
   - Test interaction states
   - Validate responsive behavior

4. **User Testing** (Optional but Recommended)
   - Show to real production builder (if possible)
   - Time comparison: photo tiles vs. checkboxes
   - Gather feedback on visual clarity

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Recommendation**: Photo Tile Configurator (Option B)  
**Estimated Implementation**: 12-17 hours

