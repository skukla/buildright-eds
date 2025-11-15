# Project Builder Progress Indicator - Color Options

**Issue:** The current design "flip-flops" colors as steps complete:
- **Active Step:** Tangerine Orange (`#f97316`)
- **Completed Step:** Light Sapphire Blue (`#1e7cd6`)

This color change can be visually jarring or confusing as users progress.

---

## Current Implementation

```
[1 Blue✓] → [2 Orange] → [3 Gray] → [4 Gray]
          (currently active)
```

**Pros:**
- Orange draws attention to current step
- Blue shows completed progress

**Cons:**
- ❌ Color "flip-flop" is jarring
- ❌ Orange disappears after completion (feels like losing progress)
- ❌ Two different "filled" states can be confusing

---

## Option 1: Keep All Steps Orange (Recommended)

**Concept:** Once a step is activated, it stays orange forever. Completed steps remain orange.

```
[1 Orange✓] → [2 Orange] → [3 Gray] → [4 Gray]
              (currently active)
```

**Visual States:**
- **Future:** Gray circle, gray text, opacity 0.5
- **Active:** Orange circle, orange text, no checkmark
- **Completed:** Orange circle, white checkmark inside, orange text

**Pros:**
- ✅ **No color flip** - Orange indicates "engaged with this step"
- ✅ **Progressive fill** - Visual momentum as orange fills left-to-right
- ✅ **Clear active state** - No checkmark vs. checkmark distinguishes active/completed
- ✅ **Energy maintained** - Orange energy carries through entire experience
- ✅ **Simpler mental model** - One color = progress

**Cons:**
- Less distinction between active and completed
- Checkmark becomes the primary differentiator

**CSS Changes:** Minimal - just change completed circle background to `--color-accent-500`

---

## Option 2: All Sapphire Blue

**Concept:** Professional, consistent blue throughout. Active step is darker/brighter blue.

```
[1 Light Blue✓] → [2 Dark Blue] → [3 Gray] → [4 Gray]
                  (currently active)
```

**Visual States:**
- **Future:** Gray circle
- **Active:** Dark Sapphire (`--color-brand-500`), slightly larger
- **Completed:** Light Sapphire (`--color-brand-400`), checkmark

**Pros:**
- ✅ Professional, cohesive look
- ✅ No jarring color changes
- ✅ Blue = trust/progress

**Cons:**
- Less energy/excitement
- Active step less attention-grabbing
- Orange accent underutilized

---

## Option 3: Green for Completed (Semantic)

**Concept:** Use semantic "success" green for completed steps.

```
[1 Green✓] → [2 Orange] → [3 Gray] → [4 Gray]
             (currently active)
```

**Visual States:**
- **Future:** Gray
- **Active:** Orange
- **Completed:** Success Green (`--color-positive-500` #059669), checkmark

**Pros:**
- ✅ Clear semantic meaning (green = done)
- ✅ Orange remains attention-grabbing for active
- ✅ No flip-flop between two brand colors

**Cons:**
- Introduces third color to progress indicator
- Green may feel out of place with brand colors
- Can look like a form validation (green checkmarks)

---

## Option 4: Orange Active + Orange Outline for Completed

**Concept:** Active is filled orange, completed is orange outline only.

```
[1 Orange○✓] → [2 Orange●] → [3 Gray○] → [4 Gray○]
               (currently active)
```

**Visual States:**
- **Future:** Gray outline, no fill
- **Active:** Orange filled circle, no checkmark
- **Completed:** Orange outline only (white fill), orange checkmark inside

**Pros:**
- ✅ No color flip - all use orange
- ✅ Clear visual distinction (filled vs. outline)
- ✅ Maintains orange brand energy

**Cons:**
- Outline may look "less complete" than filled
- Requires users to understand outline = completed

---

## Option 5: Progressive Darkening (Orange Shades)

**Concept:** All use orange, but completed steps get slightly darker/desaturated.

```
[1 Dark Orange✓] → [2 Bright Orange] → [3 Gray] → [4 Gray]
                    (currently active)
```

**Visual States:**
- **Future:** Gray
- **Active:** Bright Orange (`--color-accent-500` #f97316)
- **Completed:** Darker Orange (`--color-accent-600` #ea580c), checkmark

**Pros:**
- ✅ All orange family
- ✅ Subtle progression without jarring flip
- ✅ Active remains brightest (attention-grabbing)

**Cons:**
- Subtle difference may not be noticeable enough
- Darker orange may look less energetic

---

## Option 6: Blue Active + Orange Accent (Inverted)

**Concept:** Flip the current approach - use blue as primary, orange for completed.

```
[1 Orange✓] → [2 Blue] → [3 Gray] → [4 Gray]
              (currently active)
```

**Visual States:**
- **Future:** Gray
- **Active:** Sapphire Blue (professional focus)
- **Completed:** Tangerine Orange (energetic achievement), checkmark

**Pros:**
- Orange = achievement/completion (positive energy)
- Blue = focused work (current step)
- Orange trail shows accomplishment

**Cons:**
- Still has color flip (just reversed)
- Active step less attention-grabbing in blue

---

## Recommendation: Option 1 (All Orange)

**Why this is the best choice:**

1. **No flip-flop** - Orange means "part of your journey"
2. **Visual momentum** - Orange fills left-to-right like a progress bar
3. **Psychological consistency** - "I engaged with orange, it stays orange"
4. **Checkmark clarity** - Clear differentiator between active and completed
5. **Energy maintained** - Orange energy carries through the entire experience
6. **Minimal changes** - Easy to implement

**Implementation:**
```css
/* Active step - Orange, no checkmark */
.wizard-step.active .wizard-step-circle {
  background: var(--color-accent-500);
  border-color: var(--color-accent-500);
  color: white;
}

/* Completed step - Orange with checkmark */
.wizard-step.completed .wizard-step-circle {
  background: var(--color-accent-500);  /* Changed from --color-brand-400 */
  border-color: var(--color-accent-500);  /* Changed from --color-brand-400 */
  color: white;
}

/* Add checkmark to completed steps */
.wizard-step.completed .wizard-step-circle::after {
  content: '✓';
  font-weight: bold;
}
```

---

## Alternative Recommendation: Option 5 (Progressive Darkening)

If you want more visual distinction between active and completed:

**Active:** Bright Tangerine (`#f97316`)  
**Completed:** Darker Tangerine (`#ea580c`)

This keeps the orange family but provides subtle progression cues.

---

## Quick Comparison Table

| Option | Color Flip? | Visual Clarity | Energy Level | Implementation |
|--------|-------------|----------------|--------------|----------------|
| 1. All Orange | ❌ No | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Easy |
| 2. All Blue | ❌ No | ⭐⭐⭐⭐ | ⭐⭐⭐ | Easy |
| 3. Green Complete | ⚠️ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Easy |
| 4. Outline | ❌ No | ⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| 5. Darkening | ❌ No | ⭐⭐⭐ | ⭐⭐⭐⭐ | Easy |
| 6. Inverted | ⚠️ Yes | ⭐⭐⭐ | ⭐⭐⭐⭐ | Easy |

---

## Decision

Which option would you like to implement?
- **Option 1** for maximum energy and no flip-flop (recommended)
- **Option 2** for professional consistency
- **Option 5** for subtle progression within orange family
- Or another option from above?

