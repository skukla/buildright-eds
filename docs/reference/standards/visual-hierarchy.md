# Visual Hierarchy System

## Background Color Hierarchy for Nested Elements

This document defines the systematic approach to background colors and visual depth for template-specific pages (Build Configurator, BOM Review) where we have multiple levels of nesting (sections → cards → accordions → content → rows).

---

## Design Tokens

### Base Colors

```css
--color-background: #FFFFFF;        /* Pure white */
--color-surface: #F1F5F9;          /* slate-100 - Medium gray (increased contrast) */
--color-surface-hover: #E2E8F0;    /* slate-200 - Hover state */
--color-surface-nested: #F8FAFC;   /* slate-50 - Light gray for nested content */
--color-border: #CBD5E1;           /* slate-300 - Darker borders for visibility */
```

---

## Hierarchy Levels

### Level 0: Page Background
**Color:** `var(--color-surface)` (#F1F5F9 - Medium gray)
- Applied to: `<body>` tag on template pages
- Purpose: Creates stronger contrast for white cards to "float" on

**Example:**
```css
body.page-build-configurator,
body.page-bom-review {
  background-color: var(--color-surface);
}
```

---

### Level 1: Section Cards (Outermost Containers)
**Color:** `var(--color-background)` (#FFFFFF - Pure white)
- Applied to: `.config-section`, `.bom-section`, `.order-summary-card`
- Purpose: Primary content containers that stand out from page background
- Visual: White card with border and shadow

**Properties:**
```css
background: var(--color-background);
border: 1px solid var(--color-border);
border-radius: var(--shape-border-radius-4); /* 12px */
box-shadow: var(--shape-shadow-2);
```

---

### Level 2: Nested Cards & Accordions
**Color:** `var(--color-surface)` (#F1F5F9 - Medium gray)
- Applied to: `.bom-accordion`, `.template-summary-card`
- Purpose: Create visual separation within white section cards
- Visual: Medium gray container within white card (more pronounced contrast)

**Properties:**
```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: var(--shape-border-radius-3); /* 8px */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
```

**Hover State (for headers):**
```css
background: var(--color-surface-hover); /* #E2E8F0 - Noticeably darker gray */
```

---

### Level 3: Expanded Content Areas
**Color:** `var(--color-surface-nested)` (#F8FAFC - Light gray)
- Applied to: `.bom-accordion-content`
- Purpose: Light background for expanded accordion content
- Visual: Clearly lighter than accordion header, but distinct from pure white rows

**Properties:**
```css
background: var(--color-surface-nested);
border-top: 1px solid var(--color-border);
```

---

### Level 4: Individual Items/Rows
**Color:** `var(--color-background)` (#FFFFFF - Pure white)
- Applied to: `.product-row`, `.selection-tile`
- Purpose: Highest contrast for individual interactive items
- Visual: Pure white cards that "pop" from nested background

**Properties:**
```css
background: var(--color-background);
border: 1px solid var(--color-border);
border-radius: var(--shape-border-radius-3); /* 8px */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
```

**Hover State:**
```css
background: var(--color-surface-nested); /* Subtle highlight */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
```

---

## Visual Flow Example: BOM Review Page

```
┌─────────────────────────────────────────────────────────────┐
│ Level 0: Page Background (#F8FAFC - Gray)                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Level 1: Section Card (#FFFFFF - White)              │ │
│  │                                                       │ │
│  │  Materials by Phase                                  │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ Level 2: Accordion (#F8FAFC - Gray)            │ │ │
│  │  │                                                 │ │ │
│  │  │  Building Envelope  |  $12,915.47             │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌───────────────────────────────────────────┐ │ │ │
│  │  │  │ Level 3: Content Area (#FCFDFE - Ultra)  │ │ │ │
│  │  │  │                                           │ │ │ │
│  │  │  │  Sheathing                                │ │ │ │
│  │  │  │                                           │ │ │ │
│  │  │  │  ┌─────────────────────────────────────┐ │ │ │ │
│  │  │  │  │ Level 4: Row (#FFFFFF - White)      │ │ │ │ │
│  │  │  │  │                                     │ │ │ │ │
│  │  │  │  │  OSB Sheathing 7/16"  |  $2,124.15 │ │ │ │ │
│  │  │  │  └─────────────────────────────────────┘ │ │ │ │
│  │  │  │                                           │ │ │ │
│  │  │  └───────────────────────────────────────────┘ │ │ │
│  │  │                                                 │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Gradients & Special Treatments

### Top-Down Gradient (First Section Headers)
```css
background: linear-gradient(to bottom, #EBF4FB 0%, white 100%);
border-bottom: 2px solid var(--color-brand-500);
```

### Bottom-Up Gradient (Last Section Content)
```css
#materials-section::after {
  background: linear-gradient(to top, #EBF4FB 0%, transparent 100%);
  height: 80px;
}
```

### Bottom-Up Gradient (Action Areas)
```css
background: linear-gradient(to top, #EBF4FB 0%, white 100%);
border-top: 2px solid var(--color-border);
box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
```

---

## Border Radius Consistency

- **Large sections:** `--shape-border-radius-4` (12px)
- **Medium cards/accordions:** `--shape-border-radius-3` (8px)
- **Small elements:** `--shape-border-radius-2` (4px)

**Rule:** Section headers should match their container's radius on top corners.

---

## Summary: Color Progression

| Level | Element | Background | Visual Weight |
|-------|---------|------------|---------------|
| 0 | Page | `#F1F5F9` | Medium gray (slate-100) |
| 1 | Section | `#FFFFFF` | **Pure white** (maximum contrast) |
| 2 | Accordion | `#F1F5F9` | Medium gray (slate-100) |
| 3 | Content Area | `#F8FAFC` | Light gray (slate-50) |
| 4 | Individual Row | `#FFFFFF` | **Pure white** (maximum contrast) |

**Principle:** Alternate between white and gray to create clear visual separation at each nesting level. Individual interactive items always get pure white for maximum prominence.

---

## Implementation Files

- **Design Tokens:** `styles/base.css`
- **Build Configurator:** `styles/build-configurator.css`
- **BOM Review:** `styles/bom-review.css`
- **Components:** `styles/components.css`

