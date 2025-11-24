# Image Selection Guidelines

## Overview

This document outlines the process for selecting, verifying, and managing images used throughout the BuildRight Solutions website. All images currently use Unsplash with keyword-based selection to ensure they match content intent.

## Current Implementation: Unsplash with Keyword Search

All images use Unsplash with a structured keyword-based selection process:

### Selection Process

1. **Use Adobe Stock Keywords**: Reference the HTML comments that contain Adobe Stock keyword suggestions (e.g., `<!-- Adobe Stock: "roofing construction shingles installation" -->`)
2. **Search Unsplash**: Navigate to `unsplash.com/s/photos/[keywords]` with the Adobe Stock keywords
3. **Select Relevant Image**: Choose an image that clearly depicts the subject matter
4. **Test in Context**: Verify the image works well with:
   - Card dimensions and aspect ratios
   - Dark overlays (for Shop By Job cards)
   - Text readability (white text must be legible)
5. **Document Photo ID**: Record the Unsplash photo ID in the HTML

### Photo ID Format

All Unsplash images use this URL format:

```
https://images.unsplash.com/photo-[PHOTO_ID]?ixlib=rb-4.0.3&auto=format&fit=crop&w=[WIDTH]&q=80
```

**Parameters:**
- `PHOTO_ID`: Unique identifier for the Unsplash photo
- `ixlib=rb-4.0.3`: Unsplash library version
- `auto=format`: Automatic format optimization (WebP when supported)
- `fit=crop`: Crop to fill container
- `w=[WIDTH]`: Requested width (800 for cards, 2070 for hero)
- `q=80`: Quality setting (80% compression)

## Image Inventory

### Hero Banner (1 image)

**Location:** `index.html` line 138  
**Keywords:** "construction warehouse interior building materials"  
**Current Photo ID:** `photo-1581092160562-40aa08e78837`  
**Requirements:**
- Minimum resolution: 2070x1080
- Shows professional building materials warehouse/supplies
- Professional lighting and composition
- Suitable for split-screen layout

### Ideas Center (4 cards)

#### 1. How to Choose the Right Lumber Grade

**Location:** `index.html` line 201  
**Keywords:** "lumber grade wood texture"  
**Current Photo ID:** `photo-1513467535987-fd81bc7d62f8`  
**Requirements:**
- Shows lumber, wood grades, or wood texture
- Clear, detailed view
- 800x800 minimum, good for cropping

#### 2. 10 Kitchen Remodel Ideas

**Location:** `index.html` line 213  
**Keywords:** "modern kitchen remodel"  
**Current Photo ID:** `photo-1556912173-46c336c7fd55`  
**Requirements:**
- Shows modern kitchen renovation
- Bright, appealing interior
- Inspires renovation ideas

#### 3. Pro Tips for Framing

**Location:** `index.html` line 225  
**Keywords:** "contractor framing wall construction"  
**Current Photo ID:** `photo-1504307651254-35680f356dfd`  
**Requirements:**
- Shows wall framing construction
- Professional contractor at work
- Clear view of framing techniques

#### 4. Best Fasteners for Outdoor Projects

**Location:** `index.html` line 237  
**Keywords:** "construction fasteners hardware assortment"  
**Current Photo ID:** `photo-1581244277943-fe4a9c777189`  
**Requirements:**
- Shows fasteners, screws, nails, or hardware
- Clear product detail
- Professional product photography

### Shop By Job (6 cards)

#### 1. Frame a Wall

**Location:** `index.html` line 295  
**Keywords:** "residential wall framing construction"  
**Current Photo ID:** `photo-1541888946425-d81bb19240f5`  
**Requirements:**
- Shows residential wall framing
- Construction site context
- Works well with dark gradient overlay

#### 2. Remodel a Bathroom

**Location:** `index.html` line 305  
**Keywords:** "bathroom renovation modern"  
**Current Photo ID:** `photo-1552321554-5fefe8c9ef14`  
**Requirements:**
- Shows bathroom remodeling
- Modern design
- Text readable over image with overlay

#### 3. Install Windows

**Location:** `index.html` line 315  
**Keywords:** "window installation construction"  
**Current Photo ID:** `photo-1509644851169-2acc08aa25b5`  
**Requirements:**
- Shows window installation or construction
- Clear view of windows being installed
- Professional installation context

#### 4. Roof a House

**Location:** `index.html` line 325  
**Keywords:** "roofing construction shingles installation"  
**Current Photo ID:** `photo-1632580669317-22d1c20a4bb9`  
**Requirements:**
- Shows roofing work (shingles, installation)
- Clear roofing context
- Professional roofer at work preferred

#### 5. Repair Plumbing

**Location:** `index.html` line 335  
**Keywords:** "plumbing tools pipes repair"  
**Current Photo ID:** `photo-1607472586893-edb57bdc0e39`  
**Requirements:**
- Shows plumbing tools, pipes, or repair work
- Clear plumbing context
- Professional tools visible

#### 6. Build a Deck

**Location:** `index.html` line 345  
**Keywords:** "outdoor deck construction lumber"  
**Current Photo ID:** `photo-1416879595882-3373a0480b5b`  
**Requirements:**
- Shows deck construction or outdoor lumber work
- Outdoor/exterior context
- Construction materials visible

## Verification Checklist

When adding or replacing an image, verify:

- [ ] Image clearly depicts the intended subject
- [ ] Photo ID is correctly formatted in HTML
- [ ] Image loads without 404 errors
- [ ] Image aspect ratio works with container
- [ ] Text remains readable (especially for Shop By Job cards with overlays)
- [ ] Image is appropriate resolution for container
- [ ] Adobe Stock keyword comment is present for future migration

## Future: Adobe Stock Migration

When Adobe Stock images become available, follow this migration process:

### Migration Steps

1. **Locate Keywords**: Use the Adobe Stock keyword comments already in HTML
2. **Search Adobe Stock**: Search using the documented keywords
3. **Maintain Composition**: Choose images with similar composition to current Unsplash images
4. **Update URLs**: Replace Unsplash URLs with Adobe Stock URLs
5. **Test Thoroughly**: Verify all images load and display correctly
6. **Document Changes**: Update this guide with new photo sources

### Preserving Design Consistency

When migrating to Adobe Stock:
- Maintain similar aspect ratios
- Keep similar color palettes
- Match lighting and mood
- Preserve text readability with overlays
- Ensure professional quality standards

## Best Practices

1. **Always Test with Overlay**: Shop By Job cards use a dark gradient overlay. Always preview images with this overlay to ensure text readability.

2. **Check Mobile Responsiveness**: Verify images work well at smaller sizes and different aspect ratios.

3. **Avoid Text in Images**: Don't select images with text overlay or watermarks that could conflict with our card text.

4. **Consistent Quality**: Maintain consistent image quality across all cards (minimum 800x800 for cards, 2070x1080 for hero).

5. **Document Changes**: When replacing an image, note the reason in git commit messages.

6. **Keep Keywords Current**: If replacing an image, update Adobe Stock keyword comments if better keywords are identified.

## Troubleshooting

### Image Shows Wrong Subject

**Problem:** Image doesn't match the card content (e.g., thermostat on window installation card)  
**Solution:** Search Unsplash using the Adobe Stock keywords and select a more relevant image

### Image Too Dark/Light for Overlay

**Problem:** Text not readable on Shop By Job cards  
**Solution:** Choose images with good contrast areas or adjust overlay gradient in CSS

### Image Not Loading

**Problem:** 404 error for Unsplash URL  
**Solution:** Verify photo ID is correct and image still exists on Unsplash

### Image Aspect Ratio Issues

**Problem:** Image cropped awkwardly in container  
**Solution:** Use Unsplash crop parameter or choose image with better composition for the aspect ratio

## Resources

- **Unsplash Search**: https://unsplash.com/s/photos/
- **Unsplash License**: https://unsplash.com/license (free to use, attribution appreciated)
- **Image Optimization**: Handled automatically via Unsplash URL parameters
- **Adobe Stock** (future): Keywords documented in HTML comments

## Contact

For questions about image selection or to report mismatched images, contact the development team.

---

**Last Updated:** 2025-01-07  
**Document Version:** 1.0

