# Design System Architecture

**What it does**: Explains how BuildRight's styling system works
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## How BuildRight Stays Consistent

BuildRight uses a **token cascade** - a system where base design values flow through mappings to all components. This means:

- Change one color value → all buttons, links, and accents update
- Consistent spacing throughout the site
- Adobe dropins match BuildRight's brand automatically

---

## The Token Cascade

Think of it like water flowing downhill - values start at the top and flow to all components:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: BASE TOKENS                                            │
│                                                                  │
│  These are BuildRight's core brand values:                       │
│                                                                  │
│  • Sapphire Blue (#0f5ba7) - Primary brand color                │
│  • Tangerine Orange (#ff6b35) - Call-to-action color            │
│  • Standard spacing (1rem base)                                  │
│  • Typography settings                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ These base values are referenced by...
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: DROPIN TOKENS                                          │
│                                                                  │
│  Maps our brand values to what Adobe dropins expect:             │
│                                                                  │
│  • Primary Color ← Sapphire Blue                                 │
│  • CTA Color ← Tangerine Orange                                  │
│  • Base Spacing ← 1rem                                           │
│                                                                  │
│  This translation layer makes Adobe's dropins                    │
│  look like BuildRight's brand                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Dropins and blocks consume these tokens...
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: COMPONENTS                                             │
│                                                                  │
│  Both Adobe dropins and custom blocks use the tokens:            │
│                                                                  │
│  • Buttons show Sapphire Blue                                    │
│  • "Add to Cart" shows Tangerine Orange                          │
│  • Cards have consistent spacing                                 │
│  • Everything looks cohesive                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Categories

BuildRight uses 49 design tokens organized by purpose:

| Category | What It Controls | Examples |
|----------|------------------|----------|
| **Primary Colors** | Brand actions | Button backgrounds, link colors |
| **CTA Colors** | High-priority actions | "Add to Cart", "Buy Now" buttons |
| **Neutral Colors** | Backgrounds, borders | Card backgrounds, divider lines |
| **Semantic Colors** | Status indicators | Success (green), Error (red), Warning (yellow) |
| **Typography** | Text styling | Font sizes, weights, line heights |
| **Spacing** | Margins and padding | Card padding, section gaps |
| **Border Radius** | Corner rounding | Button corners, card corners |
| **Shadows** | Elevation effects | Card shadows, dropdown shadows |

---

## Why This Matters

The token cascade makes brand updates easy:

```
BEFORE TOKENS:                    WITH TOKENS:
─────────────────                 ────────────────
Change brand color?               Change brand color?

→ Update buttons (50 places)      → Update ONE token
→ Update links (30 places)        → Everything updates
→ Update icons (20 places)           automatically
→ Hope you didn't miss any
```

---

## What This Means for Demos

When explaining the design system:

- **"One change, everywhere"** - Show how changing a token updates all components
- **"Adobe dropins match our brand"** - Third-party components look native
- **"Consistent experience"** - Same colors and spacing throughout
- **"Easy to customize"** - For client-specific demos, just adjust the base tokens

---

**Related**: [Components Visual Guide](./components-visual-guide.md) | [Dropins Overview](../dropins/README.md)
