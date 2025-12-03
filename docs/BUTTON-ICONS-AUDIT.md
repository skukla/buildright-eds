# Button Icons Audit - BuildRight B2B Portal

## Current State Analysis

### BOM Review Page

**Primary Actions (Sidebar):**
- ✅ **Add All to Cart** - Has shopping cart icon
  - Justification: Primary conversion action, icon reinforces cart metaphor
- ✅ **Edit Configuration** - Has pencil/edit icon
  - Justification: Secondary action, icon clarifies "edit" vs other actions

**Product Row Actions:**
- ✅ **Swap** (btn-primary btn-xs) - Has refresh/swap icon
  - Justification: Icon helps distinguish from Remove
- ✅ **Remove** (btn-secondary btn-xs) - Has trash icon
  - Justification: Standard pattern for destructive actions

**Swap Panel Actions:**
- ❌ **Cancel** (btn-secondary btn-sm) - NO icon
- ❌ **Apply Swap** (btn-cta btn-sm) - NO icon

### Configure Build Page

**Primary Actions:**
- ❌ **Generate BOM** (btn-cta btn-lg) - NO icon (previously had →, we removed it)

### Account Dashboard

**Navigation Items (Sidebar):**
- ✅ All nav items have icons (Dashboard, Profile, Orders, Locations)
  - Justification: Navigation aids - icons help with scanning/recognition

**Quick Action Cards:**
- ✅ All cards have inline icons (View Orders, My Templates, etc.)
  - Justification: Visual distinction between card types

**Location Cards:**
- ✅ **Phone number** - Has phone icon (inline, not button)
- ✅ **Primary indicator** - Has checkmark icon (inline, not button)

### Templates Dashboard

- ❌ **Start New Build** (btn-cta) - NO icon
- ❌ **Upload New Template** (btn-secondary) - NO icon

---

## Recommended B2B Button Icon Strategy

### Principle: **Icons for Clarity, Not Decoration**

In B2B portals, button icons should serve a **functional purpose**, not just aesthetics:

1. **Use icons when they ADD clarity**
   - Distinguish similar actions (Swap vs Remove)
   - Reinforce familiar metaphors (Cart, Edit, Delete)
   - Aid quick scanning in dense interfaces (navigation, tables)

2. **Skip icons when they're redundant**
   - Text is already clear ("Generate BOM" doesn't need an icon)
   - Single primary action (no confusion possible)
   - Short, obvious labels

---

## Recommended Standards

### **Primary/CTA Buttons**

**Large CTAs (btn-lg):**
- ✅ **Add to Cart** / **Add All to Cart** - Keep shopping cart icon
  - Reason: Universal e-commerce pattern, aids conversion
- ❌ **Generate BOM**, **Start New Build**, **Proceed to Checkout** - NO icons
  - Reason: Text is clear, icon adds clutter at large size

**Standard CTAs:**
- ❌ Generally NO icons unless part of a pattern
  - Reason: Orange color already provides emphasis

### **Secondary/Utility Buttons**

**Editing Actions:**
- ✅ **Edit**, **Edit Configuration** - Keep pencil icon
  - Reason: Universal edit metaphor

**Cancel/Back:**
- ❌ NO icons
  - Reason: Text is sufficient, gray color indicates secondary nature

**Destructive Actions:**
- ✅ **Remove**, **Delete** - Keep trash icon
  - Reason: Visual warning, universal pattern for destructive action

### **Small/Compact Buttons (btn-xs, btn-sm)**

**In Dense Tables/Rows:**
- ✅ **Swap** - Keep refresh icon
- ✅ **Remove** - Keep trash icon
- Reason: Icons help distinguish in space-constrained contexts

**In Panels/Modals:**
- ❌ Generally NO icons
- Exception: If panel has 3+ similar actions, icons can help

### **Navigation**

- ✅ **Sidebar navigation** - Keep icons
  - Reason: Aids recognition and scanning

- ✅ **Card-based navigation** (Quick Actions) - Keep icons
  - Reason: Visual distinction between card types

---

## Specific Recommendations

### Keep Icons (Justified):
1. ✅ **Add All to Cart** (BOM sidebar) - cart icon
2. ✅ **Edit Configuration** (BOM sidebar) - pencil icon
3. ✅ **Swap** (product rows) - refresh icon
4. ✅ **Remove** (product rows) - trash icon
5. ✅ **Account nav items** - home, profile, orders, locations icons
6. ✅ **Quick Action cards** - inline icons for card types

### Remove Icons (Not Needed):
1. ❌ **Cancel** buttons - text is clear
2. ❌ **Apply Swap** - text is clear
3. ❌ **Generate BOM** - already removed ✓
4. ❌ **Large CTAs** (Start New Build, Upload Template) - text is clear

### Consider Adding (For Consistency):
None identified - current usage is appropriate

---

## Implementation Guidelines

### Icon Properties for Buttons:
```html
<!-- Standard button icon sizing -->
<button class="btn btn-cta btn-lg">
  <svg width="20" height="20" viewBox="0 0 24 24" stroke-width="2">
    <!-- icon paths -->
  </svg>
  Button Text
</button>

<!-- Small button icon sizing -->
<button class="btn btn-primary btn-xs">
  <svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2">
    <!-- icon paths -->
  </svg>
  Text
</button>
```

### CSS Pattern:
```css
.btn svg {
  flex-shrink: 0;
  vertical-align: middle;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem; /* standard for btn */
  gap: 0.25rem; /* for btn-xs */
}
```

---

## Icon Library

Use **Lucide Icons** (stroke-based, consistent style):
- Cart: shopping-cart
- Edit: pencil, edit-2
- Delete/Remove: trash-2
- Swap/Refresh: refresh-cw
- Home: home
- User: user
- Orders: shopping-bag
- Location: map-pin

Avoid:
- ❌ Filled icons (inconsistent with our stroke-based system)
- ❌ Emojis (unprofessional for B2B)
- ❌ Decorative icons without clear meaning

---

## Decision Framework

**Before adding an icon to a button, ask:**

1. **Does the icon ADD clarity beyond the text?**
   - If text alone is clear → NO icon
   - If icon reinforces universal pattern (cart, trash) → YES

2. **Is this a dense UI where icons aid scanning?**
   - Small table actions, compact rows → YES
   - Large prominent CTA → NO

3. **Does the icon serve a functional purpose?**
   - Distinguishes similar actions → YES
   - Just looks nice → NO

4. **Is this a B2B professional context?**
   - Always favor clarity over decoration
   - When in doubt, leave it out

---

## Conclusion

**Current state is mostly good!** 

Key actions:
- ✅ Keep icons on: Cart, Edit, Swap, Remove, Navigation
- ❌ No changes needed for Cancel/Apply buttons - text is sufficient
- ✅ Already removed → icon from Generate BOM (correct)

The site follows a practical B2B pattern: **icons where they help, text where it's clear.**

