# Component Extraction Roadmap

**Project Timeline:** 6 weeks  
**Team Size:** 1-2 developers  
**Start Date:** TBD

---

## Visual Roadmap

```
Week 1-2: FOUNDATION COMPONENTS 🔴
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Quantity Control]  [Loading Overlay]                     │
│         ↓                    ↓                              │
│    10+ pages            8+ pages                            │
│    ~250 LOC             ~150 LOC                            │
│                                                             │
│  [Card Component]    [Data Table]                          │
│         ↓                    ↓                              │
│    35+ instances        6 table types                       │
│    ~300 LOC             ~420 LOC                            │
│                                                             │
│  TOTAL IMPACT: ~1,120 lines saved                          │
└─────────────────────────────────────────────────────────────┘

Week 3-4: UI PATTERNS 🟡
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Tabs]  [Breadcrumbs]  [Status Badges]                    │
│    ↓          ↓               ↓                             │
│  3 pages   7 pages       15+ instances                      │
│  ~90 LOC   ~80 LOC        ~120 LOC                          │
│                                                             │
│  [Modal]  [Summary Sidebar]  [Empty State]                 │
│    ↓            ↓                  ↓                        │
│  3+ uses    3 sidebars        8+ instances                  │
│  ~150 LOC   ~180 LOC          ~100 LOC                      │
│                                                             │
│  TOTAL IMPACT: ~720 lines saved                            │
└─────────────────────────────────────────────────────────────┘

Week 5-6: ENHANCEMENTS 🟢
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Lower priority components + Polish + Documentation        │
│  [Search] [Filters] [Nav] [Forms] [Notifications]         │
│                                                             │
│  Component Library Documentation                           │
│  Migration Guide                                           │
│  Usage Examples                                            │
│                                                             │
│  TOTAL IMPACT: ~160 lines saved + Better DX                │
└─────────────────────────────────────────────────────────────┘

CUMULATIVE IMPACT: ~2,000 lines eliminated
```

---

## Component Dependency Graph

```
FOUNDATION (No dependencies - build first)
├── Loading Overlay
│   └── Used by: All pages with async operations
│
├── Quantity Control
│   └── Used by: PDP, Cart, Kit Sidebar, Tables
│
├── Card Component
│   ├── Used by: Homepage, Account, Forms
│   └── Enables: Empty State (needs card variant)
│
└── Data Table
    ├── Depends on: Status Badge (optional)
    ├── Depends on: Empty State (optional)
    └── Used by: Account, BOM, Orders

UI PATTERNS (Can depend on Foundation)
├── Tabs
│   └── Used by: Login, PDP, Forms
│
├── Breadcrumbs
│   └── Used by: All content pages
│
├── Status Badge
│   ├── Used by: Data Table, Product Tiles, Cart
│   └── Standalone component
│
├── Modal/Dialog
│   ├── Used by: PDP (volume pricing), Confirmations
│   └── Standalone component
│
├── Summary Sidebar
│   ├── Depends on: Card Component
│   └── Used by: Configurator, BOM, Cart
│
└── Empty State
    ├── Depends on: Card Component (variant)
    └── Used by: Cart, Account, Sidebars

ENHANCEMENTS (Depend on Foundation + UI)
├── Search Bar
│   └── Standalone
│
├── Filter Sidebar
│   ├── Depends on: Accordion (optional)
│   └── Used by: Catalog
│
├── Navigation Sidebar
│   └── Used by: Account, Dashboards
│
├── Form Fields
│   └── Used by: All forms
│
├── Notification/Toast
│   └── Global utility
│
├── Accordion
│   └── Used by: Filters, FAQs
│
└── [Other enhancements...]
```

---

## Week-by-Week Plan

### Week 1: Foundation Part 1

**Goal:** Build quantity controls and loading overlays

#### Day 1-2: Quantity Control
- [ ] Create `blocks/quantity-control/` structure
- [ ] Build HTML structure
- [ ] Style with size variants (small, medium, large)
- [ ] Add JavaScript increment/decrement logic
- [ ] Add min/max validation
- [ ] Add keyboard support
- [ ] Test in isolation
- [ ] Write README with examples

#### Day 3-4: Loading Overlay
- [ ] Create `blocks/loading-overlay/` structure
- [ ] Build unified HTML structure
- [ ] Consolidate CSS from 3 sources
- [ ] Create show/hide/update API
- [ ] Add message/subtitle support
- [ ] Add size variants
- [ ] Test in isolation
- [ ] Write README with examples

#### Day 5: Integration Testing
- [ ] Test quantity control in PDP
- [ ] Test loading overlay in catalog
- [ ] Fix any bugs
- [ ] Update documentation

**Deliverable:** 2 fully tested components, ~400 lines saved

---

### Week 2: Foundation Part 2

**Goal:** Build card and data table components

#### Day 1-2: Card Component
- [ ] Create `blocks/card/` structure
- [ ] Build base card HTML
- [ ] Add variants:
  - [ ] Basic
  - [ ] Interactive
  - [ ] Empty state
  - [ ] Quick action
  - [ ] Category
- [ ] Style all variants
- [ ] Add JavaScript for interactive variant
- [ ] Test in isolation
- [ ] Write README with all variant examples

#### Day 3-5: Data Table
- [ ] Create `blocks/data-table/` structure
- [ ] Build base table HTML
- [ ] Add responsive CSS (stacks on mobile)
- [ ] Add JavaScript:
  - [ ] Data binding
  - [ ] Sorting
  - [ ] Filtering
  - [ ] Empty state handling
- [ ] Test with orders data
- [ ] Test with builds data
- [ ] Write README with examples

**Deliverable:** 2 powerful components, ~720 lines saved

---

### Week 3: UI Patterns Part 1

**Goal:** Build tabs, breadcrumbs, and status badges

#### Day 1-2: Tabs Component
- [ ] Create `blocks/tabs/` structure
- [ ] Build desktop tabs HTML
- [ ] Auto-generate mobile select
- [ ] Add CSS for both variants
- [ ] Add JavaScript:
  - [ ] Tab switching
  - [ ] Mobile/desktop sync
  - [ ] Keyboard navigation
  - [ ] ARIA attributes
- [ ] Test in login page
- [ ] Test in PDP
- [ ] Write README

#### Day 3: Breadcrumbs
- [ ] Create `blocks/breadcrumbs/` structure
- [ ] Extract existing CSS
- [ ] Build HTML pattern
- [ ] Add JavaScript for auto-generation
- [ ] Add structured data markup
- [ ] Test on all 7 pages
- [ ] Write README

#### Day 4-5: Status Badges
- [ ] Create `blocks/status-badge/` structure
- [ ] Build HTML structure
- [ ] Add variants:
  - [ ] Inventory status
  - [ ] Order status
  - [ ] Savings
  - [ ] Custom/info
- [ ] Style all variants
- [ ] Add icon support (optional)
- [ ] Test in all contexts
- [ ] Write README

**Deliverable:** 3 reusable components, ~290 lines saved

---

### Week 4: UI Patterns Part 2

**Goal:** Build modal, summary sidebar, and empty state

#### Day 1-2: Modal/Dialog
- [ ] Create `blocks/modal/` structure
- [ ] Build modal HTML with backdrop
- [ ] Add CSS for overlay and content
- [ ] Add JavaScript:
  - [ ] Show/hide API
  - [ ] Backdrop click handling
  - [ ] Escape key handling
  - [ ] Body scroll lock
  - [ ] Focus trap
  - [ ] ARIA attributes
- [ ] Add size variants
- [ ] Test volume pricing modal
- [ ] Write README

#### Day 3: Summary Sidebar
- [ ] Create `blocks/summary-sidebar/` structure
- [ ] Build sticky sidebar HTML
- [ ] Add CSS for sticky behavior
- [ ] Add JavaScript:
  - [ ] Line item updates
  - [ ] Total calculation
  - [ ] Update API
- [ ] Test in configurator
- [ ] Test in BOM review
- [ ] Write README

#### Day 4-5: Empty State
- [ ] Create `blocks/empty-state/` structure
- [ ] Build HTML structure
- [ ] Add variants:
  - [ ] With icon
  - [ ] With illustration
  - [ ] With CTA
  - [ ] Compact
- [ ] Style all variants
- [ ] Integrate with card component
- [ ] Test in cart
- [ ] Test in account
- [ ] Write README

**Deliverable:** 3 essential components, ~430 lines saved

---

### Week 5: Enhancements & Migration

**Goal:** Build remaining components and start migrating pages

#### Day 1: Search Bar + Filter Sidebar
- [ ] Create `blocks/search-bar/`
- [ ] Create `blocks/filter-sidebar/`
- [ ] Build and test both
- [ ] Write READMEs

#### Day 2: Navigation Sidebar + Form Fields
- [ ] Create `blocks/nav-sidebar/`
- [ ] Create `blocks/form-field/`
- [ ] Build and test both
- [ ] Write READMEs

#### Day 3-5: Page Migration
- [ ] Migrate homepage to new components
- [ ] Migrate product-detail.html
- [ ] Migrate cart.html
- [ ] Migrate catalog.html
- [ ] Test all pages thoroughly

**Deliverable:** 4 enhancement components, 4 migrated pages

---

### Week 6: Polish & Documentation

**Goal:** Complete migration, polish, and document

#### Day 1-2: Complete Migration
- [ ] Migrate account.html
- [ ] Migrate build-configurator.html
- [ ] Migrate bom-review.html
- [ ] Migrate dashboard-templates.html
- [ ] Test all pages

#### Day 3-4: Component Library Documentation
- [ ] Create component library index
- [ ] Add usage guidelines
- [ ] Add code examples for each component
- [ ] Add visual examples (screenshots)
- [ ] Create migration guide
- [ ] Update coding standards

#### Day 5: Quality Assurance
- [ ] Full regression testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Fix any bugs

**Deliverable:** Complete component library, fully migrated codebase

---

## Phased Migration Strategy

### Phase 1: Build Without Breaking (Weeks 1-2)
- Build all foundation components
- Test in isolation
- Don't touch existing pages yet
- Components live alongside old code

### Phase 2: Migrate High-Value Pages (Weeks 3-4)
- Start with pages that benefit most
- Product detail (uses quantity, loading, tabs, breadcrumbs)
- Cart (uses quantity, empty state, cards)
- Migrate one page at a time
- Test thoroughly before moving to next

### Phase 3: Sweep Remaining Pages (Week 5)
- Migrate account dashboard (uses tables, cards, empty states)
- Migrate configurator & BOM (uses summary sidebar, loading, tables)
- Migrate catalog (uses search, filters, loading)

### Phase 4: Clean Up (Week 6)
- Remove old CSS for replaced patterns
- Remove duplicate JavaScript
- Update documentation
- Final testing

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation:**
- Build components first, migrate second
- Test each component in isolation
- Migrate one page at a time
- Keep old code until migration complete
- Use feature flags if needed

### Risk 2: Performance Regression
**Mitigation:**
- Profile before and after
- Lazy load components where appropriate
- Use CSS containment
- Minimize JavaScript bundle size
- Test on slow networks/devices

### Risk 3: Scope Creep
**Mitigation:**
- Stick to extraction, not refactoring
- Don't add features beyond current functionality
- Use "future enhancement" list for ideas
- Time-box each component (1-2 days max)

### Risk 4: Inconsistent Adoption
**Mitigation:**
- Clear documentation for each component
- Code review to ensure component usage
- Linter rules to prevent old patterns
- Team training session

---

## Success Criteria

### Code Quality
- [ ] All components follow EDS patterns
- [ ] Zero linter errors
- [ ] Zero accessibility violations
- [ ] All components have unit tests
- [ ] Code coverage > 80%

### Performance
- [ ] No page load time regression
- [ ] Lighthouse scores maintained or improved
- [ ] Bundle size reduced by 10%+
- [ ] No CLS introduced

### Maintainability
- [ ] 2,000+ lines of code eliminated
- [ ] All instances of each pattern use same component
- [ ] Bug fixes apply to all instances automatically
- [ ] New features can be built faster

### Documentation
- [ ] Every component has README
- [ ] Usage examples for all variants
- [ ] Migration guide complete
- [ ] Component library catalog created

---

## Post-Launch Activities

### Week 7: Monitor & Iterate
- [ ] Monitor for bugs
- [ ] Gather developer feedback
- [ ] Update documentation based on feedback
- [ ] Create component showcase page
- [ ] Plan future enhancements

### Ongoing: Component Library Maintenance
- [ ] Regular component audits
- [ ] Keep documentation up to date
- [ ] Add new variants as needed
- [ ] Deprecate unused variants
- [ ] Performance monitoring

---

## Quick Reference: Component Sizes

| Component | Complexity | Build Time | Lines Saved |
|-----------|-----------|------------|-------------|
| Quantity Control | Medium | 2 days | ~250 |
| Loading Overlay | Low | 2 days | ~150 |
| Card Component | Low-Medium | 2 days | ~300 |
| Data Table | High | 3 days | ~420 |
| Tabs | Medium | 2 days | ~90 |
| Breadcrumbs | Low | 1 day | ~80 |
| Status Badge | Low | 2 days | ~120 |
| Modal | Medium-High | 2 days | ~150 |
| Summary Sidebar | Medium | 1 day | ~180 |
| Empty State | Low | 2 days | ~100 |
| **TOTAL** | **Mixed** | **~19 days** | **~1,840** |

---

## Resources Needed

### Tools
- EDS Block Collection reference
- Component testing framework
- Visual regression testing
- Accessibility testing tools

### Knowledge
- Adobe EDS block patterns
- Web Components best practices
- CSS architecture
- JavaScript module patterns
- Accessibility guidelines (WCAG 2.1)

### Support
- Code review from senior developer
- Design review for variants
- QA testing support
- Documentation review

---

## Approval & Sign-off

- [ ] Technical approach approved
- [ ] Timeline approved
- [ ] Resource allocation approved
- [ ] Risk mitigation plan approved
- [ ] Success criteria agreed upon

---

**Ready to start? See `COMPONENT-EXTRACTION-QUICK-REFERENCE.md` for the checklist version.**

