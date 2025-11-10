# Project Builder Tile Design Options

## Current State Analysis

### What We Have Now
The project builder wizard uses **tiles** with:
- **Custom SVG icons** (56px, blue brand color)
- **Heading text** (h3 - 1.125rem)
- **Description text** (small secondary text)

### Current Tiles
1. **Step 1 - Project Type**: New Construction, Remodel, Repair
2. **Step 2 - Project Details**: Varies (residential home, bathroom, kitchen, etc.)
3. **Step 3 - Complexity**: Basic, Moderate, Complex
4. **Step 4 - Budget**: Under $5k, $5k-$15k, $15k-$30k, $30k+

---

## Option 1: Icons + Text (Current)

### Pros
✅ Clean, professional appearance  
✅ Icons provide visual recognition  
✅ Text provides clarity  
✅ Works well for abstract concepts (complexity, budget)  
✅ Lightweight (no image loading)  
✅ Scalable and responsive  
✅ Consistent with modern B2B design patterns  

### Cons
❌ Icons can feel generic or abstract  
❌ May not emotionally connect with users  
❌ Harder to differentiate project types visually  

### Best For
- Abstract concepts (complexity levels, budget ranges)
- Technical categories
- Situations where speed/performance is critical

---

## Option 2: Photos + Text

### Example Use Case
Replace Step 1 & 2 tiles with photos:
- **New Construction**: Photo of framed house under construction
- **Remodel**: Photo of partially renovated kitchen
- **Repair**: Photo of someone fixing drywall
- **Bathroom**: Photo of modern bathroom
- **Kitchen**: Photo of professional kitchen

### Pros
✅ Emotionally engaging  
✅ Immediately recognizable  
✅ Shows real-world context  
✅ Builds trust (shows actual projects)  
✅ Differentiates each option clearly  
✅ Appeals to contractors and DIY users  

### Cons
❌ Requires high-quality photography  
❌ Larger file sizes (performance impact)  
❌ Photos may not represent user's exact project  
❌ Harder to maintain consistency  
❌ May need multiple photos for diversity  
❌ Accessibility considerations (need good alt text)  

### Best For
- Project type selection (Step 1)
- Project details selection (Step 2)
- Helping users visualize their project

---

## Option 3: Icons + Text + Small Photos (Hybrid)

### Layout Example
```
┌─────────────────────┐
│  [Icon]             │ <- 40px icon, top-left
│                     │
│  [Small Photo]      │ <- Background photo, subtle
│                     │
│  New Construction   │ <- Bold heading
│  Building from...   │ <- Description
└─────────────────────┘
```

### Pros
✅ Best of both worlds  
✅ Visual interest without overwhelming  
✅ Icon provides quick recognition  
✅ Photo adds context  
✅ Maintains professional appearance  

### Cons
❌ More complex design  
❌ Requires careful photo selection  
❌ Risk of visual clutter  
❌ Harder to implement consistently  

### Best For
- High-impact first steps (Step 1)
- Creating emotional engagement while maintaining structure

---

## Option 4: Illustrations/Diagrams + Text

### Example Use Case
Custom illustrated diagrams:
- **New Construction**: Simple line art of house framing
- **Bathroom**: Bathroom floor plan diagram
- **Kitchen**: Kitchen layout diagram

### Pros
✅ Clean, professional  
✅ More distinctive than generic icons  
✅ Can show spatial concepts (floor plans)  
✅ Lighter weight than photos  
✅ Easier to maintain brand consistency  

### Cons
❌ Requires custom illustration work  
❌ May still feel abstract  
❌ Not as emotionally engaging as photos  

### Best For
- Step 2 (project details with spatial elements)
- Complex projects that benefit from diagrams

---

## Option 5: Text Only (Minimal)

### Example Use Case
Remove icons/images entirely:
```
┌─────────────────────┐
│                     │
│  New Construction   │ <- Large, bold
│                     │
│  Building from the  │
│  ground up          │
│                     │
└─────────────────────┘
```

### Pros
✅ Maximum clarity  
✅ Fastest loading  
✅ No visual design needed  
✅ Forces clear, descriptive text  
✅ Very accessible  

### Cons
❌ Less visually engaging  
❌ Harder to scan quickly  
❌ Feels less modern  
❌ No visual differentiation  

### Best For
- Budget/complexity steps (abstract concepts)
- Users who value speed and simplicity

---

## Recommendation Matrix

| Step | Current | Recommended | Reasoning |
|------|---------|-------------|-----------|
| **Step 1: Project Type** | Icons | **Photos** | Concrete project types benefit from real-world imagery |
| **Step 2: Project Details** | Icons (dynamic) | **Photos** | Helps users visualize their specific project |
| **Step 3: Complexity** | Icons | **Icons + Text** | Abstract concept, icons work well |
| **Step 4: Budget** | Icons (chart bars) | **Icons + Text** | Abstract concept, icons work well |

---

## Hybrid Approach (RECOMMENDED)

### Strategy
Use different approaches for different step types:

**Steps 1 & 2 (Concrete Choices):**
- Use **photos with overlay text**
- Emotional engagement for key decision points
- Example: Actual construction/renovation photos

**Steps 3 & 4 (Abstract Concepts):**
- Use **icons with text** (current approach)
- Clean, professional for complexity/budget
- No need for imagery

### Benefits
✅ Balances engagement with performance  
✅ Uses photos where they add real value  
✅ Keeps abstract concepts clean  
✅ Creates visual hierarchy (important steps get photos)  
✅ Maintains professional B2B appearance  

---

## Implementation Considerations

### Photo Requirements (if using photos)
- **Dimensions**: 400x300px (4:3 ratio)
- **Quality**: High-res, professional
- **Subjects**: Real construction/renovation projects
- **Diversity**: Various project styles
- **Lighting**: Consistent, well-lit
- **Overlay**: Text readable over image

### Performance
- **Lazy loading**: Load images as needed
- **WebP format**: Modern format for smaller files
- **Fallback**: Show icon while loading
- **Responsive**: Different sizes for mobile

### Accessibility
- **Alt text**: Descriptive for all images
- **Contrast**: Text must be readable over images
- **Focus states**: Clear keyboard navigation

---

## Next Steps

1. **Decide on approach** for each step type
2. **Source/create visuals** (photos, illustrations, or refine icons)
3. **Create mockups** showing the proposed design
4. **Test with users** (if possible)
5. **Implement** starting with Step 1
6. **Measure impact** on engagement/completion rates

