# Page Audit Checklist

**Purpose**: Document the current state of all existing pages and identify required updates for persona-driven implementation.

**Created**: November 17, 2025  
**Status**: Complete ✅

---

## Summary

This audit covers **7 existing pages** that need to be refactored for the persona-driven experience. Each page is analyzed for:
- Current implementation state
- Persona-specific requirements
- Component decisions (Block vs. Dropin)
- Required updates
- Testing checklist

---

## 1. Home Page (`index.html`)

### Current State
- ✅ Hero banner with static content
- ✅ Featured products section (loads from mock data)
- ✅ Ideas Center (4 content cards)
- ✅ Featured Categories (6 category cards)
- ✅ Shop By Job (6 project cards)
- ❌ No authentication awareness
- ❌ No persona-specific content
- ❌ Generic CTAs for all users
- ❌ Uses emoji in empty state (📦 in order-history.html)

### Persona Requirements
- **Authenticated Users**: Show persona-specific hero, features, and CTAs
- **Unauthenticated Users**: Show generic marketing content
- **Sarah (Production Builder)**: Emphasize templates, bulk ordering, phase-based workflow
- **Marcus (GC)**: Highlight construction phase wizard, quality tiers
- **Lisa (Remodeler)**: Focus on room packages, before/after inspiration
- **David (Homeowner)**: Showcase DIY guides, deck builder
- **Kevin (Store Manager)**: Display inventory alerts, restock priorities

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Hero Banner | Static HTML | **Fragment-based** | Convert to fragment containers (persona-specific) |
| Featured Products | Inline JS | EDS Block | Already uses product-card pattern, keep as-is |
| Ideas Center | Static HTML | **Fragment-based** | Convert to fragment (persona-specific content) |
| Featured Categories | Static HTML | Static or Fragment | Keep static (universal) or make fragment |
| Shop By Job | Static HTML with links | **Fragment-based** | Convert to fragment (persona-specific projects) |
| CTAs | Hardcoded links | Dynamic | Route based on persona context |

### Updates Required
- [x] **Fragment Integration** (Task 5):
  - [x] Create `.hero-container` for persona-specific hero fragments
  - [x] Create `.features-container` for persona-specific feature fragments
  - [x] Create `.footer-container` for shared footer fragment
  - [x] Add loading skeletons to prevent FOUC
  - [x] Integrate `personalize-page.js` to load fragments
- [ ] **CTA Updates**:
  - [ ] Update "Build a Project Kit" button to route to persona dashboard
  - [ ] Update "Browse Catalog" to pass persona context
- [ ] **Remove Deprecated Code**:
  - [ ] Remove inline featured products JS (migrate to block if needed)
  - [ ] Clean up inline styles
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `index.html` ✅

### Testing
- [ ] Test with each persona (5 personas)
- [ ] Verify fragments load correctly
- [ ] Check CTAs route to correct dashboards
- [ ] Test unauthenticated state (generic content)
- [ ] Mobile responsive check
- [ ] Performance: Measure FOUC prevention

### Priority
**HIGH** - This is the entry point for all users

---

## 2. Login Page (`pages/login.html`)

### Current State
- ✅ Basic login form (email, password, company dropdown)
- ✅ Company selection maps to customer tiers
- ✅ Sets `buildright_customer_context` in localStorage
- ❌ Uses old authentication pattern (not `auth.js`)
- ❌ No persona selection UI
- ❌ No demo mode vs. production mode toggle
- ❌ Hardcoded company list (not persona-based)

### Persona Requirements
- **Demo Mode**: Persona selection cards with avatars and descriptions
- **Production Mode**: Standard email/password login (future)
- **Clear Mode Toggle**: Hidden toggle for switching between demo and production
- **Persona Mapping**: Map login to persona configuration

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Login Form | Standard HTML | Dual-mode (demo/production) | Add persona selection for demo mode |
| Auth Integration | Inline JS | `auth.js` service | Replace with `authService.loginWithPersona()` |
| Company Dropdown | Hardcoded | Persona Cards | Create persona selection UI |

### Updates Required
- [ ] **Replace Authentication System** (Task 2.2):
  - [ ] Remove inline login handler
  - [ ] Integrate `auth.js` service
  - [ ] Use `authService.loginWithPersona(personaId)`
  - [ ] Handle redirect after login
- [ ] **Create Persona Selection UI** (Task 2.2):
  - [ ] Design persona cards (avatar, name, role, company)
  - [ ] Add persona descriptions
  - [ ] Style professionally (not just a dropdown)
  - [ ] Use Lucide icons for personas
- [ ] **Mode Toggle** (Task 2.2):
  - [ ] Add hidden demo/production mode toggle
  - [ ] Show persona cards in demo mode
  - [ ] Show standard form in production mode
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `login.html` ✅

### Testing
- [ ] Test login with each persona (5 personas)
- [ ] Verify redirect to correct dashboard
- [ ] Test production login flow (mocked)
- [ ] Check error handling (invalid persona)
- [ ] Test "Remember me" functionality
- [ ] Mobile responsive check

### Priority
**CRITICAL** - This is the authentication entry point

---

## 3. Account/Dashboard Page (`pages/account.html`)

### Current State
- ✅ Generic account dashboard
- ✅ Displays company information from localStorage
- ✅ Tier badge block integration
- ✅ Quick action cards (Orders, Projects, Settings)
- ❌ No persona-specific routing
- ❌ Not using `dashboard.js` router
- ❌ Static quick actions (not persona-aware)

### Persona Requirements
- **Route to Persona Dashboard**: This page should redirect to `pages/dashboard.html?view={persona-default}`
- **OR**: This page becomes a generic shell that loads persona-specific content
- **Show Persona Features**: Display only features available to the persona
- **Customer Group Info**: Display pricing tier and savings information

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Account Nav | Generic | Persona-aware | Filter by `hasFeature()` from persona-config |
| Dashboard Content | Static | Dynamic Router | Use `dashboard.js` router |
| Tier Badge | EDS Block | EDS Block | Already integrated ✅ |
| Quick Actions | Static cards | Dynamic | Show/hide based on persona features |

### Updates Required
- [ ] **Integrate Dashboard Router** (Already done in Phase 3):
  - [ ] Redirect to `pages/dashboard.html` with persona context
  - [ ] OR: Load persona-specific content dynamically
- [ ] **Add Persona Context**:
  - [ ] Display persona name and role
  - [ ] Show customer group and pricing tier
  - [ ] Display available features
- [ ] **Feature Visibility**:
  - [ ] Use `hasFeature()` to show/hide quick actions
  - [ ] Filter navigation based on persona
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `account.html` ✅

### Testing
- [ ] Test with each persona (5 personas)
- [ ] Verify correct dashboard loads
- [ ] Check feature visibility (templates, BOM, phase ordering)
- [ ] Test navigation links
- [ ] Verify tier badge displays correctly

### Priority
**HIGH** - Post-login landing page

---

## 4. Catalog Page (`pages/catalog.html`)

### Current State
- ✅ Product grid block
- ✅ Filters sidebar block
- ✅ Category, project type, price, availability filters
- ✅ Mobile filter toggle
- ❌ No CCDM integration (no policy-based filtering)
- ❌ No customer-group-specific pricing
- ❌ Products loaded by block, not from `acoService`
- ❌ No authentication awareness

### Persona Requirements
- **Customer-Group Pricing**: Display tier-specific pricing
- **CCDM Filtering**: Apply triggered policies based on persona attributes
- **Policy Headers**: Send `AC-Policy-*` headers to mock ACO service
- **Volume Pricing**: Show volume tier indicators
- **No Kit Mode**: Kit mode was deprecated (already removed ✅)

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Product Grid | EDS Block | EDS Block with ACO | Integrate `acoService.getProducts()` |
| Filters Sidebar | EDS Block | EDS Block with CCDM | Add policy-based filters |
| Product Tiles | Static | `product-tile` block | Use Phase 4 product-tile component |
| Pricing | Hardcoded | Dynamic | Fetch from `acoService.getPricing()` |

### Updates Required
- [ ] **Remove Kit Mode** (Already done ✅):
  - [x] Kit sidebar removed
  - [x] Kit mode banner removed
  - [x] No kit mode remnants found
- [ ] **Integrate Mock ACO Service** (Task 3):
  - [ ] Update `product-grid` block to use `acoService.getProducts()`
  - [ ] Pass persona context (customer group, attributes)
  - [ ] Send policy headers for CCDM filtering
- [ ] **Add CCDM Filtering** (Task 3):
  - [ ] Update filters to trigger policies
  - [ ] Add policy-specific filters (construction phase, quality tier, etc.)
  - [ ] Show filtered product counts
- [ ] **Display Customer-Group Pricing** (Task 3):
  - [ ] Use `product-tile` block from Phase 4
  - [ ] Fetch pricing from `acoService.getPricing()`
  - [ ] Display tier badges
  - [ ] Show volume pricing indicators
- [ ] **Add Loading States** (Task 3):
  - [ ] Show skeleton loaders during ACO queries
  - [ ] Handle empty states (no products match filters)
  - [ ] Error handling for ACO service failures
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `catalog.html` ✅

### Testing
- [ ] Test with each customer group (5 groups)
- [ ] Verify pricing displays correctly per tier
- [ ] Test CCDM filtering (construction phase, quality tier, etc.)
- [ ] Verify no kit mode remnants
- [ ] Check loading states and error handling
- [ ] Mobile responsive check
- [ ] Performance: Measure ACO query times

### Priority
**HIGH** - Core shopping experience

---

## 5. Product Detail Page (`pages/product-detail.html`)

### Current State
- ✅ Product gallery block
- ✅ Pricing display block
- ✅ Inventory status block
- ✅ Volume pricing table
- ✅ Add to cart functionality
- ✅ Quantity controls
- ❌ Pricing is hardcoded (not from `acoService`)
- ❌ No customer-group pricing
- ❌ No volume tier pricing calculation
- ❌ No persona-relevant recommendations

### Persona Requirements
- **Customer-Group Pricing**: Display tier-specific pricing
- **Volume Tier Pricing**: Show quantity-based discounts
- **Discount Display**: Show savings vs. retail price
- **Persona Recommendations**: CCDM-driven product recommendations
- **Inventory Icons**: Use custom inventory status icons

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Product Gallery | EDS Block | EDS Block | Already integrated ✅ |
| Pricing Display | EDS Block | EDS Block with ACO | Integrate `acoService.getPricing()` |
| Inventory Status | EDS Block | EDS Block | Already integrated ✅ |
| Volume Pricing | Static table | Dynamic | Calculate from ACO pricing data |
| Recommendations | None | CCDM-driven | Add recommendations section |

### Updates Required
- [ ] **Integrate Mock ACO for Pricing** (Task 4):
  - [ ] Update `pricing-display` block to use `acoService.getPricing()`
  - [ ] Pass customer group context
  - [ ] Calculate volume tiers dynamically
- [ ] **Display Volume Tiers** (Task 4):
  - [ ] Populate volume pricing table from ACO data
  - [ ] Highlight current quantity tier
  - [ ] Show savings per tier
- [ ] **Show Customer Group Discount** (Task 4):
  - [ ] Display tier badge
  - [ ] Show savings vs. retail price
  - [ ] Calculate total savings
- [ ] **Update Inventory Display** (Task 4):
  - [ ] Use Lucide icons for inventory status
  - [ ] Show multi-warehouse availability
  - [ ] Display lead times if out of stock
- [ ] **CCDM-Based Recommendations** (Task 4):
  - [ ] Add "Recommended for You" section
  - [ ] Query `acoService.getProducts()` with persona policies
  - [ ] Display 4-6 recommended products
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `product-detail.html` ✅

### Testing
- [ ] Test with each customer group (5 groups)
- [ ] Verify pricing calculation (base + tier + volume)
- [ ] Test volume tier display (1-99, 100-293, 294+)
- [ ] Check recommendations (persona-specific)
- [ ] Test add to cart with different quantities
- [ ] Verify inventory status icons
- [ ] Mobile responsive check

### Priority
**HIGH** - Critical for conversion

---

## 6. Cart Page (`pages/cart.html`)

### Current State
- ✅ Cart items display
- ✅ Cart summary block
- ✅ Quantity controls
- ✅ Remove item functionality
- ✅ Bundle support (project builder bundles)
- ❌ Pricing is from `getPrice()` (not `acoService`)
- ❌ No customer-group pricing
- ❌ No volume discounts reflected
- ❌ No phase/project context for B2B personas

### Persona Requirements
- **Customer-Group Pricing**: Display tier-specific pricing in cart
- **Volume Discounts**: Reflect quantity-based discounts
- **Savings Display**: Show total savings vs. retail
- **Phase/Project Context**: For Sarah/Marcus, show project/phase info
- **Bundle Preservation**: Maintain bundle structure from project builder

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Cart Items | Inline HTML | EDS Block or keep inline | Consider `cart-items` block |
| Cart Summary | EDS Block | EDS Block with ACO | Integrate `acoService.getPricing()` |
| Pricing | `getPrice()` | `acoService.getPricing()` | Update to use ACO service |
| Cart State | `cart-manager.js` | `cart-manager.js` | Already integrated ✅ |

### Updates Required
- [ ] **Integrate Cart Manager** (Already done ✅):
  - [x] Uses `cart-manager.js`
  - [x] Update and remove functionality working
- [ ] **Display Customer-Group Pricing**:
  - [ ] Update pricing to use `acoService.getPricing()`
  - [ ] Pass customer group context
  - [ ] Show tier badges on items
- [ ] **Show Volume Discounts**:
  - [ ] Calculate volume tier for each item
  - [ ] Display discount percentage
  - [ ] Show savings per item
- [ ] **Add Phase/Project Context** (B2B personas):
  - [ ] For Sarah: Show template name
  - [ ] For Marcus: Show project name and phase
  - [ ] Add context metadata to cart items
- [ ] **Update Inventory Icons**:
  - [ ] Use Lucide icons for inventory status
  - [ ] Show availability warnings
- [ ] **Emoji Removal** (Task 6):
  - [ ] No emojis found in `cart.html` ✅

### Testing
- [ ] Test with each customer group (5 groups)
- [ ] Verify pricing updates on quantity change
- [ ] Test volume discount calculation
- [ ] Check savings display (tier + volume)
- [ ] Test bundle preservation
- [ ] Verify checkout flow
- [ ] Mobile responsive check

### Priority
**MEDIUM** - Important for conversion, but less traffic than catalog/PDP

---

## 7. Order History Page (`pages/order-history.html`)

### Current State
- ✅ Order list from localStorage
- ✅ Order details modal
- ✅ Reorder functionality (saves wizard state)
- ✅ Empty state with CTA
- ✅ Responsive table design
- ❌ Uses emoji in empty state (📦)
- ❌ No persona-specific order views
- ❌ No template/project context display
- ❌ Reorder is generic (not persona-aware)

### Persona Requirements
- **Persona-Specific Views**: Different order displays per persona
- **Template/Project Context**: For Sarah, show template name; for Marcus, show project
- **Enhanced Reorder**: Link to template or project builder with context
- **Order Metadata**: Display persona-specific order details

### Components

| Component | Current | Should Be | Action Required |
|-----------|---------|-----------|-----------------|
| Order List | Inline HTML table | Inline or Block | Keep inline (works well) |
| Order Details | Modal | Modal | Keep modal pattern |
| Reorder | Generic | Context-aware | Enhance with persona context |

### Updates Required
- [ ] **Add Persona Context to Orders**:
  - [ ] Store persona ID with each order
  - [ ] Display persona-specific metadata (template, project, phase)
  - [ ] Show order type (template, custom, restock)
- [ ] **Enhanced Reorder for Templates** (Sarah):
  - [ ] Link to template builder with saved template
  - [ ] Pre-populate quantities
  - [ ] Show "Reorder Template" instead of "Build Similar"
- [ ] **Project Reference for Marcus Orders**:
  - [ ] Display project name and phase
  - [ ] Link to project builder with phase context
  - [ ] Show "Reorder for Phase" CTA
- [ ] **Emoji Removal** (Task 6):
  - [ ] Replace 📦 emoji with Lucide icon (package icon)
  - [ ] Update empty state to use icon helper

### Testing
- [ ] Test with each persona (5 personas)
- [ ] Verify order display (persona-specific metadata)
- [ ] Test reorder functionality (context preservation)
- [ ] Check empty state (no emoji)
- [ ] Test order details modal
- [ ] Mobile responsive check

### Priority
**LOW** - Important for repeat customers, but lower traffic

---

## Summary

### High Priority Updates (Critical Path)
1. ✅ **Login Page** - Persona selection (Task 2) - CRITICAL
2. **Account/Dashboard** - Routing (Task 2) - HIGH
3. **Catalog** - Remove kit mode, add CCDM (Task 3) - HIGH
4. **Product Detail** - Customer group pricing (Task 4) - HIGH
5. ✅ **Home Page** - Fragment integration (Task 5) - HIGH

### Medium Priority Updates
1. **Cart** - Integrate cart manager, pricing (Task 4) - MEDIUM
2. **Order History** - Enhanced reorder (Task 4) - MEDIUM

### Low Priority Updates
1. **Static Content Pages** - Footer, header enhancements - LOW
2. **Error Pages** - 404, 500 pages - LOW

---

## Emoji Removal Checklist (Task 6)

### Files to Check
- [x] `index.html` - No emojis found ✅
- [x] `pages/login.html` - No emojis found ✅
- [x] `pages/account.html` - No emojis found ✅
- [x] `pages/catalog.html` - No emojis found ✅
- [x] `pages/product-detail.html` - No emojis found ✅
- [x] `pages/cart.html` - No emojis found ✅
- [ ] `pages/order-history.html` - **📦 emoji found** (line 362)
- [ ] Fragment documents (new) - To be checked after creation
- [ ] All JS files - To be checked
- [ ] All CSS files - To be checked (content properties)
- [ ] Data files (`mock-products.json`, `project-recommendations.json`) - To be checked

### Replacement Strategy
- Use `createIcon()` from `icon-helper.js`
- Use Lucide icons for all UI elements
- Replace emoji with semantic HTML + CSS where appropriate

---

## Component Decision Matrix

| Page | Component | Decision | Rationale |
|------|-----------|----------|-----------|
| Home | Hero | **Fragment** | Persona-specific content, author-managed |
| Home | Featured Products | **Block** | Dynamic data, programmatic |
| Home | Ideas Center | **Fragment** | Persona-specific content, author-managed |
| Home | Featured Categories | **Static** | Universal, no personalization needed |
| Home | Shop By Job | **Fragment** | Persona-specific projects |
| Login | Login Form | **Block** | Complex logic, dual-mode |
| Account | Dashboard | **Router** | Dynamic content loading |
| Catalog | Product Grid | **Block + ACO** | Dynamic data, CCDM filtering |
| Catalog | Filters | **Block + ACO** | Dynamic data, policy-based |
| PDP | Product Gallery | **Block** | Already implemented ✅ |
| PDP | Pricing | **Block + ACO** | Dynamic pricing, volume tiers |
| PDP | Inventory | **Block** | Multi-warehouse data |
| Cart | Cart Items | **Inline** | Simple, works well |
| Cart | Cart Summary | **Block** | Reusable, pricing logic |
| Orders | Order List | **Inline** | Simple table, works well |

---

## Testing Strategy

### Component-Level Testing
- [ ] Test each block in isolation
- [ ] Verify ACO service integration
- [ ] Test error handling and loading states

### Integration Testing
- [ ] Test persona flow (login → catalog → PDP → cart)
- [ ] Verify pricing consistency across pages
- [ ] Test CCDM filtering end-to-end

### Persona Testing
- [ ] Test complete journey for each persona (5 personas)
- [ ] Verify persona-specific features
- [ ] Check feature visibility per persona

### Cross-Browser Testing
- [ ] Chrome (primary)
- [ ] Safari
- [ ] Firefox
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Testing
- [ ] Measure page load times
- [ ] Test ACO service response times
- [ ] Verify FOUC prevention
- [ ] Check fragment loading performance

---

## Dependencies

### Phase 3 (Complete ✅)
- [x] `persona-config.js` - Persona definitions
- [x] `aco-service.js` - Mock ACO service
- [x] `auth.js` - Authentication system
- [x] `dashboard.js` - Dashboard router
- [x] `builder.js` - Builder router

### Phase 4 (Complete ✅)
- [x] `product-tile` block - Product display
- [x] `template-card` block - Template display
- [x] `package-comparison` block - Package comparison
- [x] `wizard-vertical-progress` block - Wizard progress
- [x] `loading-overlay` block - Loading states

### Phase 5 (In Progress)
- [x] `fragment-loader.js` - Fragment loading utility
- [x] `personalize-page.js` - Page personalization
- [ ] Fragment documents (15 total) - To be created in Task 5
- [ ] `FRAGMENT-AUTHORING-GUIDE.md` - To be created in Task 5

---

## Next Steps

1. ✅ **Task 1: Page Audit** - Complete this document
2. **Task 2: Authentication Pages** - Create persona selection UI and sign-up wizard
3. **Task 3: Catalog Page Refactor** - Integrate ACO service and CCDM filtering
4. **Task 4: Product Detail Page Refactor** - Customer group pricing and volume tiers
5. **Task 5: Fragment-Based Personalization** - Create fragments and integrate
6. **Task 6: Remove All Emojis** - Search and replace with icons

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Status**: Complete ✅

