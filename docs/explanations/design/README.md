# Design System

**What it does**: Explains how BuildRight maintains consistent styling across all components
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What This Section Covers

BuildRight uses a design token system that ensures:
- Consistent colors, spacing, and typography everywhere
- Easy brand customization (change one value, update everywhere)
- Adobe dropins styled to match BuildRight's brand

---

## Documents in This Section

| Document | What It Explains |
|----------|------------------|
| [Design System Architecture](./design-system-architecture.md) | How the token cascade works |
| [Components Visual Guide](./components-visual-guide.md) | The 29 blocks and how they fit together |

---

## The 30-Second Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUILDRIGHT DESIGN SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TOKEN CASCADE: How style values flow through the system                 │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                          │
│       BASE TOKENS                   DROPIN TOKENS                        │
│       (Our brand values)            (Adobe dropin mapping)               │
│                                                                          │
│    Sapphire Blue  ─────────────────▶ Primary Color ──────▶ Buttons      │
│    #0f5ba7                                                   Links       │
│                                                                          │
│    Tangerine Orange ───────────────▶ CTA Color ──────────▶ Add to Cart  │
│    #ff6b35                                                  Buy Now      │
│                                                                          │
│    1rem spacing ───────────────────▶ Base Spacing ────────▶ Card padding│
│                                                             Margins      │
│                                                                          │
│  RESULT: Change Sapphire Blue → All buttons + links update automatically │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## BuildRight's Brand Colors

| Color | Name | Usage |
|-------|------|-------|
| **#0f5ba7** | Sapphire Blue | Primary brand color, buttons, links |
| **#ff6b35** | Tangerine Orange | Call-to-action buttons (Add to Cart) |
| **#1a1a1a** | Dark text | Primary text |
| **#f5f5f5** | Light background | Card backgrounds |

---

## Related Documentation

- [Dropins](../dropins/README.md) - The UI components that use these tokens
- [Architecture](../architecture/README.md) - Where design fits in the system
