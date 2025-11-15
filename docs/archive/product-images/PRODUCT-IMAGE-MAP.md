# Product Image Mapping

## Overview
This document maps the 19 product images in `buildright-eds/images/products/` to the 70 products in the BuildRight catalog (`buildright-aco/data/buildright/products.json`).

## Current State

### Images Available
- **Location**: `buildright-eds/images/products/`
- **Count**: 19 AI-generated product images
- **Format**: PNG files
- **Naming**: `generated-image.png` and `generated-image (1-20).png`

### Products in Catalog
- **Total Products**: 70
- **Categories**: 5 main categories

## Product Categories Breakdown

### 1. Structural Materials (16 products)
**Sample Products:**
- LBR-D0414F1E: ToughGrip 2x4 Stud - 8ft
- LBR-2EBB314A: SafeGuard 2x6 Stud - 8ft
- LBR-26852468: FastenPro 2x8 Joist - 10ft
- PLY-7D58FF99: ProFrame OSB Sheathing 7/16" - 4x8
- PLY-AF7C8BA7: FastenPro CDX Plywood 1/2" - 4x8

**Image Examples:**
- `generated-image.png` - 2x4 lumber stud (side view)
- `generated-image (1).png` - 2x6 lumber stud (angle view)
- `generated-image (2).png` - 2x8 lumber board (front view)
- `generated-image (10).png` - Plywood/OSB sheet panel

### 2. Framing & Insulation (15 products)
**Sample Products:**
- STUD-44C79532: BuildRight Pro Metal Stud 20ga - 3.5" x 10ft
- STUD-B6E3E673: ReliaBuild Metal Stud 20ga - 6" x 10ft
- DRYWALL-8F034793: ToughGrip Drywall 1/2" - 4x8
- INSUL-DE9C78C2: InsulPro Fiberglass Batt R-13

**Image Examples:**
- `generated-image (15).png` - Metal stud/track (galvanized steel)

### 3. Fasteners & Hardware (15 products)
**Sample Products:**
- NAIL-244FD20C: MaxStrength Framing Nails 16d - 50lb Box
- NAIL-9D448DAA: ReliaBuild Finish Nails 8d - 5lb Box
- NAIL-2DBD44A2: ReliaBuild Roofing Nails - 50lb Box
- SCREW-1C0EA8BD: PremiumBuild Deck Screws #10 x 3"

### 4. Windows & Doors (15 products)
**Sample Products:**
- WINDOW-8039584D: ToughGrip Single Hung Window - 36"x48"
- WINDOW-6642736C: StructureMaster Double Hung Window - 36"x60"
- DOOR-AF7D27F6: PremiumBuild Steel Entry Door - 36"x80"
- DOOR-DA21ED1F: ToughGrip Fiberglass Entry Door - 36"x80"

### 5. Safety Equipment (9 products)
**Sample Products:**
- SAFE-54709A01: ToughGrip Hard Hat - Type 1 Class E
- SAFE-325D0586: SafeGuard Safety Glasses - ANSI Z87.1
- SAFE-AC3312B9: ReliaBuild Work Gloves - Heavy Duty
- SAFE-4FC3A1D0: BuildRight Pro Safety Vest - Class 2

## Image-to-Product Mapping Strategy

### Current Situation
- **Gap**: 70 products but only 19 images
- **Ratio**: ~3.7 products per image
- **Status**: Images are generic product category representations

### Recommended Mapping Approach

#### Option 1: Category-Based Mapping
Map images to product categories rather than individual SKUs:

```
Image Index → Category → Product Range
0-5    (6 images)  → Structural Materials (lumber, plywood)
6-10   (5 images)  → Framing & Insulation (metal studs, drywall, insulation)
11-13  (3 images)  → Fasteners & Hardware (nails, screws, anchors)
14-16  (3 images)  → Windows & Doors
17-18  (2 images)  → Safety Equipment
```

#### Option 2: Representative Product Mapping
Select 19 flagship products to represent the catalog:

1. `generated-image.png` → LBR-D0414F1E (2x4 Stud)
2. `generated-image (1).png` → LBR-2EBB314A (2x6 Stud)
3. `generated-image (2).png` → LBR-26852468 (2x8 Joist)
4. `generated-image (3).png` → LBR-2D637246 (2x10 Joist)
5. `generated-image (5).png` → LBR-96F409FB (2x12 Beam)
6. `generated-image (6).png` → LBR-9D32768F (4x4 Post)
7. `generated-image (7).png` → PLY-7D58FF99 (OSB Sheathing)
8. `generated-image (8).png` → PLY-AF7C8BA7 (CDX Plywood)
9. `generated-image (9).png` → PLY-3C2EC476 (T&G Subfloor)
10. `generated-image (10).png` → PLY-2BA5387B (Marine Plywood)
11. `generated-image (11).png` → STUD-44C79532 (Metal Stud)
12. `generated-image (13).png` → DRYWALL-8F034793 (Drywall 1/2")
13. `generated-image (14).png` → INSUL-DE9C78C2 (Fiberglass Batt)
14. `generated-image (15).png` → STUD-95E9D258 (Metal Track)
15. `generated-image (16).png` → WINDOW-8039584D (Single Hung Window)
16. `generated-image (17).png` → DOOR-AF7D27F6 (Steel Entry Door)
17. `generated-image (18).png` → SAFE-54709A01 (Hard Hat)
18. `generated-image (19).png` → SAFE-325D0586 (Safety Glasses)
19. `generated-image (20).png` → SAFE-AC3312B9 (Work Gloves)

## Visual Product Mapping

### Lumber/Wood Products
```
┌─────────────────────────────────────────────────────┐
│ Image Type: Dimensional Lumber                      │
├─────────────────────────────────────────────────────┤
│ generated-image.png      → 2x4 Stud (end view)     │
│ generated-image (1).png  → 2x6 Stud (angle)        │
│ generated-image (2).png  → 2x8 Joist               │
│ generated-image (3).png  → 2x10 Joist              │
│ generated-image (5).png  → 2x12 Beam               │
│ generated-image (6).png  → 4x4 Post                │
└─────────────────────────────────────────────────────┘
```

### Sheet Goods (Plywood/OSB)
```
┌─────────────────────────────────────────────────────┐
│ Image Type: Panel Products                          │
├─────────────────────────────────────────────────────┤
│ generated-image (7).png  → OSB Sheathing           │
│ generated-image (8).png  → CDX Plywood             │
│ generated-image (9).png  → T&G Subfloor            │
│ generated-image (10).png → Marine Plywood          │
└─────────────────────────────────────────────────────┘
```

### Metal Framing Products
```
┌─────────────────────────────────────────────────────┐
│ Image Type: Steel/Metal Products                    │
├─────────────────────────────────────────────────────┤
│ generated-image (11).png → Metal Stud 3.5"         │
│ generated-image (13).png → Metal Stud 6"           │
│ generated-image (14).png → Metal Track             │
│ generated-image (15).png → Steel C-Channel         │
└─────────────────────────────────────────────────────┘
```

### Drywall & Insulation
```
┌─────────────────────────────────────────────────────┐
│ Image Type: Wall/Ceiling Materials                  │
├─────────────────────────────────────────────────────┤
│ generated-image (16).png → Drywall Sheets          │
│ generated-image (17).png → Fiberglass Insulation   │
└─────────────────────────────────────────────────────┘
```

### Safety Equipment
```
┌─────────────────────────────────────────────────────┐
│ Image Type: PPE/Safety Gear                         │
├─────────────────────────────────────────────────────┤
│ generated-image (18).png → Hard Hat                │
│ generated-image (19).png → Safety Glasses          │
│ generated-image (20).png → Work Gloves             │
└─────────────────────────────────────────────────────┘
```

## Implementation Recommendations

### For E-commerce Display
1. **Primary Images**: Use specific image for featured products
2. **Fallback Images**: Use category-representative images for products without dedicated images
3. **Image Variants**: Consider generating product family images for related SKUs

### For Product Data Enhancement
```json
{
  "sku": "LBR-D0414F1E",
  "name": "ToughGrip 2x4 Stud - 8ft",
  "images": {
    "primary": "/images/products/generated-image.png",
    "thumbnail": "/images/products/generated-image.png",
    "category_fallback": "/images/products/structural-materials-default.png"
  }
}
```

### Gap Analysis
- **Missing Images**: 51 products without dedicated images (73%)
- **Recommendation**: Generate additional product-specific images or use category placeholders
- **Priority Products**: 
  - Top 20 revenue-generating products
  - Featured/promotional products
  - New construction project essentials

## Next Steps

1. ✅ **Document current mapping** (completed)
2. 🔄 **Implement image assignment logic** in product data
3. 📸 **Generate additional product images** for remaining 51 products
4. 🎨 **Create category placeholder images** for generic fallbacks
5. 🔗 **Update product JSON** with image references
6. 🧪 **Test image display** in BuildRight EDS storefront

## Technical Integration

### File Path Structure
```
buildright-eds/
├── images/
│   └── products/
│       ├── generated-image.png         (Product ID: 0)
│       ├── generated-image (1).png     (Product ID: 1)
│       ├── ...
│       └── generated-image (20).png    (Product ID: 20)
└── data/
    └── products.json (or derived from buildright-aco/data/buildright/products.json)
```

### Suggested Data Enhancement
Add `imageIndex` field to products.json to map to image files:

```json
{
  "sku": "LBR-D0414F1E",
  "name": "ToughGrip 2x4 Stud - 8ft",
  "imageIndex": 0,
  "imagePath": "generated-image.png",
  "category": "structural_materials"
}
```

---

**Last Updated**: November 8, 2025  
**Maintained By**: Adobe Demo System Team

