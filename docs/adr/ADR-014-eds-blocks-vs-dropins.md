# ADR-014: EDS Blocks vs Dropins Decision Framework

**Status**: Accepted

**Date**: 2026-01-02

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight's hybrid architecture combines Adobe Edge Delivery Services (EDS) with Adobe Commerce functionality. When building new components, the team must consistently decide between:

1. **EDS Blocks** - Custom HTML/CSS/JS components following EDS patterns
2. **Adobe Commerce Dropins** - Pre-built commerce components from `@dropins/storefront-*` packages
3. **Hybrid Approach** - Combining EDS blocks with dropin functionality

Without a clear decision framework, teams risk:
- Inconsistent architectural choices across components
- Reimplementing commerce logic that dropins already handle well
- Using dropins for non-commerce UI where EDS blocks are simpler
- Confusion about when hybrid approaches are appropriate

ADR-001 documents the decision to use dropins for commerce functions. ADR-002 documents the decision to use EDS blocks for content-driven components. This ADR provides the **decision framework** for evaluating new components against these patterns.

---

## Decision

**We will use a structured decision tree and criteria matrix to classify all new components.**

### Quick Decision Tree

```
Does this component need real-time Commerce data?
|
+-- YES --> Does a dropin exist for this?
|           |
|           +-- YES --> Use Dropin (mock in demo, real in prod)
|           |
|           +-- NO --> Use EDS Block + Mock Service
|
+-- NO --> Is this content-driven or persona UI?
            |
            +-- YES --> Use EDS Block
```

### Decision Criteria Matrix

| Criteria | Use EDS Block | Use Dropin | Use Hybrid |
|----------|---------------|------------|------------|
| **Data Source** | Content (Google Docs, static JSON) | Adobe Commerce API | Mixed sources |
| **Commerce Connection** | None or custom mock | Built-in | Custom + built-in |
| **Author Control** | High - authors manage content | Low - data from Commerce | Medium |
| **Reusability** | Project-specific | Cross-project standard | Mixed |
| **Maintenance** | We maintain | Adobe maintains | Shared |
| **Complexity** | Simple to complex | Complex (handled by Adobe) | Complex |
| **Customization** | Full control | Via slots and styling | Full + slots |
| **Backend Integration** | Manual | Automatic | Mixed |

### Decision Checklist

Before building any new component, verify:

**1. Data Source**
- [ ] Does this need real-time Commerce data? --> Consider Dropin
- [ ] Is this content from authors? --> EDS Block
- [ ] Is this static/mock data? --> EDS Block

**2. Existing Solutions**
- [ ] Does a dropin exist for this? --> Use Dropin (mocked in demo)
- [ ] Is this a standard commerce pattern? --> Consider Dropin
- [ ] Is this unique to BuildRight? --> EDS Block

**3. Customization Needs**
- [ ] Need full control over markup? --> EDS Block
- [ ] Standard commerce UI is acceptable? --> Dropin
- [ ] Need both standard + custom? --> Hybrid

**4. Maintenance**
- [ ] Want Adobe to maintain updates? --> Dropin
- [ ] Need to customize frequently? --> EDS Block
- [ ] Security-critical? --> Dropin

**5. Performance**
- [ ] Need optimized commerce operations? --> Dropin
- [ ] Simple content display? --> EDS Block
- [ ] Complex client-side logic? --> Either (case-by-case)

### Component Classification

#### Core Commerce: Use Dropins

| Component | Dropin Package | Rationale |
|-----------|----------------|-----------|
| Login/Registration | `@dropins/storefront-auth` | Security-critical, standard pattern |
| User Account | `@dropins/storefront-account` | Address management, profile updates |
| Cart | `@dropins/storefront-cart` | Complex state, pricing calculations |
| Checkout | `@dropins/storefront-checkout` | Order placement, shipping methods |
| Product Search | `@dropins/storefront-product-discovery` | Search performance, relevance |
| Order Management | `@dropins/storefront-order` | Real-time order data, tracking |
| Wishlist | `@dropins/storefront-wishlist` | Standard commerce, user persistence |
| Recommendations | `@dropins/storefront-recommendations` | AI-powered, Adobe Sensei integration |

#### Explicitly NOT Using

| Dropin | Reason |
|--------|--------|
| `@dropins/storefront-payment-services` | We use custom payment gateway integration |
| `@dropins/storefront-personalization` | BuildRight uses custom persona system |

#### Persona UI: Use EDS Blocks (or Page-Level Scripts)

| Component | Persona | Implementation | Rationale |
|-----------|---------|----------------|-----------|
| Template Dashboard | Sarah | Page script (`scripts/dashboards/template-dashboard.js`) | Custom UI, content-driven templates |
| Wizard Progress | All | EDS Block | Custom multi-step visualization |
| Project Filter | Marcus | EDS Block | Persona-specific filter logic |
| Package Configurator | Lisa | Page script (planned) | Custom bundling logic |
| Deck Wizard | David | Page script (planned) | Specialized measurement workflow |
| Restock Dashboard | Kevin | Page script (planned) | Custom analytics visualization |
| Tier Badge | All | EDS Block | Visual persona indicator |

> **Note**: Some persona components are implemented as page-level scripts (`scripts/dashboards/`, `scripts/builders/`) for rapid development. Block extraction is planned for reusability across pages.

#### Hybrid Components

| Component | EDS Block Part | Dropin Part |
|-----------|----------------|-------------|
| Product Grid | Custom filter sidebar | Product listing dropin |
| Product Detail | Custom layout, project context | Standard PDP data |
| Cart Summary | Project summary display | Cart state management |
| Account Page | Persona dashboard layout | Account data access |

---

## Consequences

### Positive Outcomes

**Consistent Decision-Making**
- Clear framework prevents ad-hoc architectural choices
- New team members can apply the framework immediately
- Reduces debates about component implementation approach

**Appropriate Tool Selection**
- Commerce logic handled by battle-tested dropins
- Custom UI gets full flexibility of EDS blocks
- Hybrid approach available when truly needed

**Maintainable Architecture**
- Clear separation of concerns
- Adobe maintains commerce complexity
- We maintain BuildRight-specific features

**Demo-to-Production Path**
- Mock services follow dropin API signatures
- Swap imports when connecting real backend
- Minimal code changes for production deployment

### Negative Outcomes

**Learning Curve**
- Team must understand both EDS blocks and dropin patterns
- Framework requires judgment for edge cases

**Potential Over-Analysis**
- Simple components might not need the full checklist
- Risk of analysis paralysis for straightforward decisions

**Hybrid Complexity**
- Components using both approaches require careful integration
- Must coordinate data flow between EDS and dropin parts

---

## Alternatives Considered

### Alternative 1: Always Use EDS Blocks

**Approach**: Build everything as custom EDS blocks, avoid dropins entirely.

**Pros**:
- Complete control over all code
- No external dependencies
- Simpler architecture (one pattern)

**Cons**:
- Reimplements well-solved commerce problems (auth, cart, checkout)
- Significant security risk for authentication logic
- 3-4 weeks additional development time
- Ongoing maintenance burden

**Why Rejected**: Commerce functionality is complex and security-critical. Adobe's dropins are battle-tested and maintained.

### Alternative 2: Always Use Dropins

**Approach**: Use dropins for everything, customize via slots.

**Pros**:
- Consistent component architecture
- Adobe maintains everything
- Standard patterns throughout

**Cons**:
- No dropins exist for BuildRight-specific features (wizards, dashboards)
- Slot customization has limits
- Forces commerce patterns onto content-driven UI

**Why Rejected**: Dropins are designed for standard commerce patterns, not custom workflow UIs.

### Alternative 3: Case-by-Case Without Framework

**Approach**: Decide individually for each component without a structured framework.

**Pros**:
- Maximum flexibility
- No framework to learn
- Each decision optimized for specific case

**Cons**:
- Inconsistent decisions across team members
- Repeated debates about same trade-offs
- Architectural drift over time
- Hard to onboard new team members

**Why Rejected**: Leads to inconsistent architecture and wasted time re-debating the same trade-offs.

---

## Anti-Patterns to Avoid

### Do Not Reimplement Commerce Logic in EDS Blocks

**Bad**:
```javascript
// blocks/custom-cart/custom-cart.js
export default function decorate(block) {
  calculateTax();        // Dropins handle this
  applyDiscounts();      // Dropins handle this
  validateInventory();   // Dropins handle this
}
```

**Why**: Dropins handle this better, Adobe maintains it, avoid bugs.

### Do Not Use Dropins for Non-Commerce UI

**Bad**:
```javascript
// Trying to force a dropin for custom wizard UI
import SomeDropin from '@dropins/something';
// ... hacking it to work for custom flow
```

**Why**: Dropins are for commerce patterns, not custom workflows.

### Do Not Mix Approaches Inconsistently

**Bad**:
```javascript
// Sometimes using dropin
import { getCart } from '@dropins/storefront-cart';

// Sometimes using custom service for same domain
import { getCart } from '../../services/my-cart-service.js';
```

**Why**: Pick one approach per domain (auth, cart, etc.) to avoid confusion.

---

## Related Decisions

- [ADR-001: Use Adobe Commerce Dropins for Core Commerce Functions](./ADR-001-use-dropins-for-commerce.md) - Specific decision to use dropins
- [ADR-002: Use EDS Blocks for Content-Driven Components](./ADR-002-use-eds-blocks-for-content.md) - Specific decision to use EDS blocks
- [ADR-007: Custom SDK Dropins for ACO-Sourced Components](./ADR-007-custom-sdk-dropins-for-aco.md) - ACO-specific dropin decisions

---

## References

- [Block vs Dropin Decision Matrix](../reference/backend/block-vs-dropin-decision.md) - Full decision framework source
- [Dropin Architecture](../reference/dropin-architecture.md) - Dropin technical patterns
- [Adobe Commerce Storefront SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/) - Adobe documentation

---

**Last Updated**: January 2, 2026
