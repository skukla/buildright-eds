# Design System Architecture

BuildRight uses a **token cascade** - base tokens flow through dropin mappings to final UI.

## Token Cascade Flow

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: BASE TOKENS (base.css)                            │
│  Core design values defined once                            │
│                                                              │
│  --color-brand-500: #0f5ba7    (sapphire blue)              │
│  --color-accent-500: #ff6b35   (tangerine orange)           │
│  --spacing-medium: 1rem                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ referenced by
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: DROPIN TOKENS (dropin-tokens.css)                 │
│  Maps Adobe dropin variables to BuildRight tokens           │
│                                                              │
│  --dropin-color-primary: var(--color-brand-500)             │
│  --dropin-color-cta: var(--color-accent-500)                │
│  --dropin-spacing-base: var(--spacing-medium)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ consumed by
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: COMPONENTS                                         │
│  Dropins and custom blocks use the mapped tokens            │
│                                                              │
│  .dropin-button { background: var(--dropin-color-cta); }    │
│  .buildright-card { padding: var(--spacing-medium); }       │
└─────────────────────────────────────────────────────────────┘
```

## Token Categories (49 tokens in dropin-tokens.css)

| Category | Count | Purpose |
|----------|-------|---------|
| Colors - Primary | 3 | Brand actions (buttons, links) |
| Colors - CTA | 3 | High-priority CTAs (Add to Cart) |
| Colors - Neutral | 10 | Backgrounds, borders, text |
| Colors - Semantic | 6 | Success, warning, error states |
| Typography | 12 | Font sizes, weights, families |
| Spacing | 8 | Margins, padding, gaps |
| Border Radius | 4 | Corner rounding |
| Shadows | 3 | Elevation effects |

## Why This Architecture?

```
CHANGE ONE VALUE → UPDATES EVERYWHERE

  base.css                   dropin-tokens.css           Components
  ─────────                  ─────────────────           ──────────
  --color-brand-500  ───────▶ --dropin-color-primary ──▶ All buttons
       │                                                  All links
       └─────────────────────────────────────────────────▶ Custom blocks
```

---

**See Also:** [styles/dropin-tokens.css](../../styles/dropin-tokens.css) | [ADR-008](../adr/ADR-008-dropin-css-refactoring.md)
