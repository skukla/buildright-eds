# Project Builder Photo Tiles Implementation

## Overview
Successfully implemented **Option 2A (Full Background Photos with Overlay)** for Steps 1 and 2 of the project builder wizard, while keeping Steps 3 and 4 with icon-based tiles.

## What Was Changed

### 1. Added CSS for Photo-Based Tiles

**New Classes:**
- `.wizard-option-photo` - Main photo tile container
- `.wizard-photo-overlay` - Text overlay with gradient
- `.wizard-options-photo` - Grid container for photo tiles

**Key Features:**
- ✅ Full background images with gradient overlay
- ✅ Hover effects (lift + border highlight)
- ✅ Selected state with checkmark badge
- ✅ Smooth transitions
- ✅ Responsive design (mobile optimized)

### 2. Updated Step 1 (Project Type)

**Before:** Icon-based tiles  
**After:** Full photo tiles with:
- **New Construction**: Construction site framing photo
- **Remodel**: Home renovation photo
- **Repair**: Home repair work photo

**Photo URLs:** Curated Unsplash construction images

### 3. Updated Step 2 (Project Details)

**Changes:**
- Created `step2Photos` object with 13 project-specific photos
- Modified `populateStep2()` function to generate photo tiles
- Dynamically switches container class to `wizard-options-photo`

**Photo Categories:**
- Residential Home
- Commercial Building
- Addition
- Bathroom
- Kitchen
- Basement
- Whole House
- Exterior
- Plumbing
- Electrical
- Structural
- Roofing
- Other

### 4. Updated Event Handlers

**Modified Functions:**
- `setupEventListeners()` - Now handles both `.wizard-option` and `.wizard-option-photo`
- `selectOption()` - Works with both tile types
- `restoreWizardState()` - Restores selections for both tile types

### 5. Maintained Steps 3 & 4

**No Changes:**
- Step 3 (Complexity): Still uses icon-based tiles
- Step 4 (Budget): Still uses icon-based tiles

**Reasoning:** Abstract concepts work better with icons

## Photo Specifications

### Current Photos (Unsplash)
- **Format**: JPEG via Unsplash CDN
- **Size**: 800px width (optimized)
- **Quality**: 80%
- **Lazy Loading**: Browser native

### Future Recommendations
When replacing with real BuildRight photos:
- **Dimensions**: 800×600px (4:3 ratio)
- **Format**: WebP with JPEG fallback
- **File Size**: <150KB each
- **Subject**: Real construction/renovation projects
- **Quantity**: 15-18 photos total

## Visual Design Details

### Photo Tile Appearance
```
┌─────────────────────────────┐
│                             │
│     [Background Photo]      │
│                             │
│  ┌─────────────────────┐   │
│  │  ✓ (when selected)  │   │ <- Checkmark badge
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  [Gradient Overlay] │   │
│  │                     │   │
│  │  Project Title      │   │ <- White text
│  │  Short description  │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### States
1. **Default**: 3px transparent border, 240px height
2. **Hover**: Lifts 4px, blue border, larger shadow
3. **Selected**: Blue border, branded shadow, checkmark badge

## Responsive Behavior

### Desktop (>768px)
- 3-column grid (auto-fit)
- 240px tile height
- 1.5rem gap

### Mobile (≤767px)
- 1-column stack
- 200px tile height
- Full-width tiles

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ CSS Grid support required
- ✅ Background images with gradients
- ✅ CSS transitions

## Performance

### Image Loading
- **Current**: CDN-hosted Unsplash images
- **Optimization**: 800px width, 80% quality
- **Future**: Implement lazy loading library if needed

### CSS
- Minimal additional CSS (~100 lines)
- Uses CSS Grid (already supported)
- Smooth transitions without jank

## Accessibility

### Current Implementation
- ✅ Proper color contrast (text over gradient overlay)
- ✅ Keyboard navigation (inherited from existing code)
- ✅ Click/tap targets (240px height, full tile)
- ✅ Focus states (inherited)

### Future Improvements
- Add proper alt text for background images
- Consider aria-labels for better screen reader support

## Testing Checklist

- [x] Step 1 displays photo tiles correctly
- [x] Step 2 displays photo tiles correctly
- [x] Hover effects work
- [x] Selection state works (checkmark appears)
- [x] Click handlers work on both tile types
- [x] Steps 3 & 4 still use icons
- [x] Responsive design works on mobile
- [x] State restoration works
- [x] Navigation between steps works

## Next Steps (Optional)

1. **Replace Unsplash photos** with real BuildRight project photos
2. **Optimize images** (convert to WebP, compress)
3. **Add loading states** for better UX
4. **A/B test** engagement vs. old icon design
5. **Gather feedback** from users

## Files Modified

- `buildright-eds/pages/project-builder.html`
  - Added photo tile CSS
  - Updated Step 1 HTML
  - Updated Step 2 generation logic
  - Modified event handlers
  - Added responsive styles

## Rollback Instructions

If you need to revert to icon-based tiles:

1. Remove `.wizard-option-photo` and related CSS
2. Revert Step 1 HTML to icon-based tiles
3. Revert `populateStep2()` function to use `step2Icons`
4. Update event handlers back to `.wizard-option` only

Or simply:
```bash
git checkout HEAD~1 pages/project-builder.html
```

## Success Metrics to Track

- **Engagement**: Completion rate of wizard
- **Time**: Average time to complete Steps 1 & 2
- **Selection**: Which project types are most common
- **Bounce**: Drop-off rate at each step

