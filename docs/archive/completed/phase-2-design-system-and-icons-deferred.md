# Phase 2: Design System & Icons - DEFERRED

## Status: DEFERRED - Work Redistributed to Other Phases

**Original Duration**: 1 week  
**Original Dependencies**: Phase 0 (architecture decisions)  
**Decision Date**: November 16, 2024

---

## Why Deferred

The original Phase 2 plan attempted to design ~40 custom SVG icons **before** implementing persona-specific UIs. This is backwards - we can't know what icons we need until we design the actual screens.

**Problem**: 
- Icons designed in Phase 2 would be speculative
- Phase 6 persona implementations would reveal actual icon needs
- Risk of designing unused icons or missing needed ones

**Solution**:
- Use existing Lucide icons (already in `icons/lucide/`) for generic UI
- Design custom icons incrementally as persona UIs are built
- Create icons when we know the exact context and requirements

---

## Work Redistributed

### Phase 3: Core Architecture
**Icon Work**: None needed - use existing Lucide icons
- User, logout, settings icons already available
- Generic UI icons sufficient for architecture work

### Phase 5: Existing Page Refactor
**Icon Work**: Emoji Replacement
- **Task**: Replace all emoji with existing Lucide icons
- **Scope**: Login, catalog, product detail, cart, account pages
- **Approach**: Use Lucide icon library (already present)
- **Deliverable**: Emoji-free existing pages

**Specific Replacements**:
- ✓ → Lucide `check-circle`
- 🛒 → Lucide `shopping-cart`
- 👤 → Lucide `user`
- 🔍 → Lucide `search`
- ⚙️ → Lucide `settings`

### Phase 6A: Sarah (Production Builder)
**Icon Work**: Template/Floor Plan Icons
- **When**: During Sarah's dashboard implementation
- **Icons Needed**: 
  - Template/floor plan icon (1 custom icon)
  - Or use Lucide `file-text` or `layout`
- **Approach**: Design only if Lucide doesn't fit

### Phase 6B: Marcus (General Contractor)
**Icon Work**: Construction Phase Icons
- **When**: During Marcus's project wizard implementation
- **Icons Needed**: 
  - Foundation (custom)
  - Framing (custom)
  - Envelope (custom)
  - Interior (custom)
- **Approach**: Design 4 custom construction phase icons
- **Alternative**: Use Lucide `hammer`, `wrench`, `home`, `paintbrush` as placeholders

### Phase 6C: Lisa (Remodeling Contractor)
**Icon Work**: Package Tier Icons
- **When**: During Lisa's package builder implementation
- **Icons Needed**: 
  - Good/Better/Best tier indicators
  - Or use Lucide `star` with fill variations
- **Approach**: Use existing icons or simple tier badges (text-based)

### Phase 6D: David (Pro Homeowner - Deck Builder)
**Icon Work**: Deck Shape Icons
- **When**: During David's deck builder implementation
- **Icons Needed**: 
  - Rectangular deck (custom)
  - L-shaped deck (custom)
  - Possibly material icons (wood vs composite)
- **Approach**: Design 2-3 custom deck-specific icons

### Phase 6E: Kevin (Store Manager)
**Icon Work**: Inventory/Velocity Icons
- **When**: During Kevin's restock dashboard implementation
- **Icons Needed**: 
  - High/medium/low velocity indicators
  - Use Lucide `trending-up`, `trending-down`, `activity`
- **Approach**: Use existing Lucide icons

### Phase 7: Integration & Polish
**Icon Work**: Icon Library Consolidation (Optional)
- **When**: After all persona UIs are complete
- **Scope**: 
  - Consolidate custom icons created during Phase 6
  - Document icon library
  - Create icon usage guidelines
  - Optimize SVGs
- **Deliverable**: Complete icon catalog (if needed)

---

## Existing Icon Assets

### Already Available: Lucide Icons
**Location**: `icons/lucide/` (37 icons)

**Available Icons Include**:
- UI: user, settings, search, filter, edit, trash, plus, x
- Commerce: shopping-cart, package, tag
- Navigation: arrow-right, arrow-left, chevron-down, menu
- Status: check-circle, alert-circle, info, help-circle
- Actions: download, upload, save, share

**Usage**: Import as needed, no custom design required

### Already Available: Category Icons
**Location**: `icons/categories/` (6 icons)

**Available Icons**:
- structural.svg
- windows-doors.svg
- fasteners.svg
- roofing.svg
- framing-drywall.svg
- catalog.svg

**Usage**: Product category navigation (already implemented)

---

## Icon Design Guidelines (For Phase 6 Custom Icons)

When designing custom icons during Phase 6:

**Specifications**:
- Format: SVG
- Base Size: 24x24px
- Style: Line icons (consistent with Lucide)
- Stroke Width: 2px
- Color: Monochrome (inherits from CSS)
- Corners: Rounded

**Process**:
1. Check if Lucide has suitable icon first
2. If not, design custom icon matching Lucide style
3. Optimize with SVGO
4. Place in `icons/custom/[persona]/` directory
5. Document in persona phase completion

**Tools**:
- Figma, Sketch, or Adobe Illustrator for design
- SVGO for optimization
- Reference Lucide icons for style consistency

---

## Benefits of This Approach

✅ **Need-Driven**: Icons designed when we know exact requirements  
✅ **Efficient**: No wasted effort on unused icons  
✅ **Consistent**: Icons match actual UI context  
✅ **Flexible**: Can adapt to design changes during implementation  
✅ **Faster**: Don't block Phase 3-5 on icon design  
✅ **Realistic**: Aligns with agile, iterative development

---

## Icon Inventory (To Be Created During Phase 6)

### Estimated Custom Icons Needed

| Phase | Persona | Custom Icons | Estimated Count |
|-------|---------|--------------|-----------------|
| 6A | Sarah | Template/floor plan | 0-1 (use Lucide) |
| 6B | Marcus | Construction phases | 4 |
| 6C | Lisa | Package tiers | 0 (use badges) |
| 6D | David | Deck shapes | 2-3 |
| 6E | Kevin | Inventory velocity | 0 (use Lucide) |

**Total Estimated Custom Icons**: 6-8 (vs original 40)

---

## Next Steps

1. ✅ **Phase 3**: Core Architecture (no custom icons needed)
2. ✅ **Phase 4**: Shared Components (use Lucide icons)
3. ✅ **Phase 5**: Existing Page Refactor + Emoji Replacement
4. ✅ **Phase 6A-E**: Design custom icons as needed per persona
5. ✅ **Phase 7**: Optional icon library consolidation

---

## Related Documents

- `PHASE-3-CORE-ARCHITECTURE.md` - Next phase
- `PHASE-5-EXISTING-PAGE-REFACTOR.md` - Emoji replacement
- `PHASE-6A-PERSONA-SARAH.md` - Sarah's icon needs
- `PHASE-6B-MARCUS.md` (in PHASES-6B-TO-7-CONSOLIDATED.md) - Marcus's icon needs
- `PHASE-6D-DAVID.md` (in PHASES-6B-TO-7-CONSOLIDATED.md) - David's icon needs

---

**Phase Status**: DEFERRED - Work redistributed  
**Decision By**: Implementation team  
**Date**: November 16, 2024  
**Rationale**: Icons should be designed in context of actual UI needs, not speculatively

---

## Summary

Phase 2 work has been **successfully redistributed** into phases where icon needs are clear:
- **Generic UI icons**: Use existing Lucide library
- **Emoji replacement**: Phase 5
- **Custom persona icons**: Phase 6 (as needed per persona)
- **Icon consolidation**: Phase 7 (optional polish)

This approach is more efficient, realistic, and aligned with persona-driven implementation.

**Ready to proceed to Phase 3: Core Architecture** ✅

