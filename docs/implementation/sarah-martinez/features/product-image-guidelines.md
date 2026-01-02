# Image Recommendations for Configure Build Page

**Created**: December 6, 2025  
**Status**: Recommendations Ready for Review

---

## Summary

Based on the Perplexity research, the current Material Package images show **finished houses** when they should show **materials** (the actual products that differentiate the tiers).

---

## Current Images vs. Recommended

### 1. Covered Patio

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **URL** | `photo-1600566753190-17f0baa2a6c3` | See options below |
| **Shows** | Brutalist building (per user) | Backyard covered patio/pergola |
| **Problem** | Doesn't represent a residential covered patio | - |

**Recommended Unsplash Images for Covered Patio:**

1. **Option A** - Modern pergola with seating:
   - Search: "pergola patio backyard"
   - URL: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop`
   - Shows: Courtyard/patio entry

2. **Option B** - Outdoor living space with roof:
   - Search: "outdoor living space patio"  
   - Example: `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop`

3. **Option C** - Backyard patio furniture:
   - URL: `https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=400&h=300&fit=crop`

---

### 2. Material Packages

**Key Insight from Research:**

> "Packages are about **specific brands and SKUs** - Andersen windows, GAF roofing, Sherwin-Williams paint - not house aesthetics."

The images should show **materials**, not finished homes.

---

#### Builder's Choice (builder_grade tier)

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **URL** | `photo-1600585154340-be6161a56a0c` | See options below |
| **Shows** | Modern house exterior | Construction materials / lumber |
| **Problem** | Doesn't communicate "standard materials" | - |

**Recommended Images:**

1. **Option A** - Lumber at construction site:
   - URL: `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop`
   - Shows: Construction site with lumber framing

2. **Option B** - Wood framing structure:
   - URL: `https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400&h=300&fit=crop`
   - Shows: Wood framing in progress (already used for Foundation phase)

3. **Option C** - Building materials warehouse:
   - URL: `https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=300&fit=crop`
   - Shows: Lumber/materials stacked

---

#### Desert Ridge Premium (premium tier)

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **URL** | `photo-1600596542815-ffad4c1539a9` | See options below |
| **Shows** | Modern house exterior | Premium materials (flooring, windows) |
| **Problem** | Looks same as Builder's Choice | - |

**What Premium Represents (from templates.json):**
- Andersen windows (WINDOW-8F26E917)
- GAF Timberline roofing (ROOF-7B1F4022)
- Hardie Plank siding (SIDING-FIBER-CEMENT-PRO)
- Hardwood flooring (FLOOR-HARDWOOD-OAK)

**Recommended Images:**

1. **Option A** - Hardwood flooring installation:
   - URL: `https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&h=300&fit=crop`
   - Shows: Close-up of hardwood floor being installed

2. **Option B** - Modern interior with premium finishes:
   - URL: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop`
   - Shows: Living room with hardwood floors and premium finishes

3. **Option C** - Window detail:
   - URL: `https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop`
   - Shows: Modern window installation

---

#### Sunset Valley Executive (luxury tier)

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **URL** | `photo-1600607687939-ce8a6c25118c` | See options below |
| **Shows** | Luxury house exterior | Luxury materials (stone, designer finishes) |
| **Problem** | Same style as other tiers | - |

**What Luxury Represents (from templates.json):**
- Spray foam insulation (INSUL-SPRAY-FOAM)
- Stone veneer siding (SIDING-STONE-VENEER)
- Walnut hardwood (FLOOR-HARDWOOD-WALNUT)
- Solid core oak doors (DOOR-SOLID-CORE-OAK)
- Designer fixtures

**Recommended Images:**

1. **Option A** - Stone fireplace / veneer:
   - URL: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop`
   - (Note: This is currently used for builder_grade - need different image)

2. **Option B** - Luxury interior design:
   - URL: `https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400&h=300&fit=crop`
   - Shows: High-end interior with designer finishes

3. **Option C** - Marble/stone materials:
   - Search: "luxury interior stone" or "designer home materials"

---

## Alternative Approach: Keep House Exteriors but Differentiate

If you prefer to keep house exterior images, ensure they **visually differentiate** the tiers:

| Tier | Image Concept |
|------|---------------|
| **Builder's Choice** | Simple tract home, basic siding |
| **Premium** | Upgraded home with visible premium windows, architectural shingles |
| **Executive** | Luxury home with stone facade, designer landscaping |

The challenge: These all look similar on Unsplash.

---

## Implementation

Once you select your preferred images, I can update:

1. **`scripts/build-configurator.js`**
   - `getVariantImageUrl()` - for Covered Patio
   - `getPackageImageUrl()` - for Material Packages

2. Test the new images in the browser

---

## Research Alignment Check ✅

Per the Perplexity research:

| Research Finding | Current State | Recommendation |
|------------------|---------------|----------------|
| "Packages are about specific brands and SKUs" | Images show houses | Show materials |
| "3-5 pre-configured packages tied to specific brands" | Generic house images | Show brand-level materials |
| "Andersen 400 Series Windows, GAF Timberline" | No material visibility | Show windows, roofing |

---

**Next Steps:**

1. Review the image options above
2. Let me know which images you'd like to use
3. I'll update the code with the new URLs

