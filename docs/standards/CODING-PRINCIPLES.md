# BuildRight EDS - Coding Principles

**📊 Document Type**: Standards & Best Practices  
**📖 Reading Time**: 10-15 minutes  
**👥 Audience**: All developers

**🔗 Related Docs**:
- **CSS Architecture**: [CSS-ARCHITECTURE.md](./CSS-ARCHITECTURE.md)
- **Architectural Decisions**: [adr/](../adr/)
- **Phase 1 Completion**: [phase-0-5-foundation/PHASE_1_COMPLETE.md](../phase-0-5-foundation/PHASE_1_COMPLETE.md) (CSS/JS separation examples)

**📍 Use This Doc When**:
- Writing any code
- Making implementation decisions
- Code reviews
- Onboarding to the project

## Core Development Principles

### 1. **Prefer CSS Solutions Over JavaScript**

When implementing layout, styling, or visual behavior:

**✅ DO:**
- Use CSS for layout, positioning, spacing, and visual styling
- Leverage CSS custom properties (CSS variables) for dynamic values
- Use CSS media queries for responsive behavior
- Apply CSS flexbox/grid for layout control
- Use CSS `:hover`, `:focus`, `:active` for interactive states

**❌ AVOID:**
- Using JavaScript to manipulate styles directly (`element.style.property = value`)
- Using JavaScript for layout calculations that CSS can handle
- Creating DOM elements in JavaScript when CSS pseudo-elements (`:before`, `:after`) work
- JavaScript-based animations when CSS transitions/animations are sufficient

**Why?**
- **Performance**: CSS is hardware-accelerated and more performant
- **Maintainability**: Styles centralized in CSS files, easier to update
- **Caching**: CSS files cache better than dynamic JS changes
- **Separation of Concerns**: Keep styling in stylesheets, logic in scripts
- **Browser Optimization**: Browsers optimize CSS rendering pipeline

**Example:**
```css
/* ✅ GOOD: CSS handles container layout */
.breadcrumbs {
  padding: var(--spacing-small) var(--spacing-large);
}

.breadcrumbs nav {
  max-width: var(--container-width, 1400px);
  margin: 0 auto;
}
```

```javascript
// ❌ BAD: JavaScript manipulating layout
function layoutBreadcrumbs(element) {
  element.style.maxWidth = '1400px';
  element.style.margin = '0 auto';
  element.style.padding = '0 2rem';
}
```

---

### 2. **Use JavaScript for Behavior, Not Presentation**

JavaScript should handle:
- User interactions and event handling
- Data fetching and state management
- Dynamic content rendering
- Complex business logic
- Accessibility enhancements (ARIA attributes)

---

### 3. **Follow EDS Block Pattern**

- Blocks are the building blocks of pages
- Each block = HTML structure + CSS styling + JS decoration
- Keep blocks self-contained and reusable
- Use semantic HTML in block structure

---

### 4. **Maintain Single Source of Truth**

- Configuration in dedicated files (don't duplicate)
- Centralize common utilities
- Avoid hardcoding values across multiple files
- Use CSS variables for shared design tokens

---

## References

- **Adobe EDS Best Practices**: https://www.aem.live/developer/block-collection
- **CSS-First Approach**: Inspired by progressive enhancement principles

