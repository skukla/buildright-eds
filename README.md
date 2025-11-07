# BuildRight Solutions Website

A functional HTML/CSS/JavaScript prototype for BuildRight Solutions, demonstrating personalized B2B commerce use cases for building materials distribution. This prototype is structured with Adobe Edge Delivery Services (EDS) block patterns for easy migration to the EDS Commerce boilerplate.

## Overview

BuildRight Solutions is a national building materials distributor serving professional contractors across three divisions: Commercial, Residential, and Pro. This website prototype demonstrates:

- **Project-based filtering**: Dynamic catalog filtering by project type (new construction, remodel, repair, restoration)
- **Project Builder wizard**: Guided step-by-step workflow to create customized material kits based on project type, complexity, and budget
- **Dynamic bundle products**: Generated bundles that appear as single cart items with expandable component views
- **Tier-based pricing**: Automatic volume discounts based on customer tier (Commercial-Tier2, Residential-Builder, Pro-Specialty)
- **Regional inventory**: Multi-warehouse inventory display with priority-based fulfillment
- **Personalized catalogs**: Single catalog that adapts to customer segment, project type, and pricing tier

## Project Structure

```
buildright-website/
├── index.html                    # Homepage
├── pages/                        # Individual page HTML files
│   ├── catalog.html             # Product catalog with filtering
│   ├── product-detail.html      # Product detail page
│   ├── project-builder.html     # Project Builder wizard
│   ├── project-selector.html    # Project type selection (legacy)
│   ├── cart.html                # Shopping cart (supports bundles)
│   ├── account.html             # Account dashboard
│   └── login.html               # B2B login page
├── blocks/                       # EDS-compatible blocks
│   ├── header/                  # Site header and navigation
│   ├── project-filter/          # Project type filter dropdown (legacy)
│   ├── project-bundle/          # Dynamic bundle product display
│   ├── pricing-display/         # Tier-based pricing with volume breakpoints
│   ├── inventory-status/        # Regional warehouse availability
│   ├── tier-badge/              # Customer pricing tier indicator
│   ├── cart-summary/            # Shopping cart summary (supports bundles)
│   └── product-grid/            # Product catalog grid
├── styles/
│   ├── base.css                 # Base styles, CSS variables, design system
│   ├── components.css           # Reusable component styles
│   └── utilities.css            # Utility classes (Tailwind-like)
├── scripts/
│   ├── app.js                   # Main application logic
│   ├── data-mock.js             # Mock data manager
│   ├── project-builder.js       # Project Builder wizard and bundle generation
│   ├── cart-manager.js          # Shopping cart functionality
│   ├── pricing-calculator.js    # Tier-based pricing calculations
│   └── utils.js                 # Utility functions
└── data/
    ├── mock-products.json       # Sample product data with pricing and inventory
    └── project-recommendations.json  # Product-to-project mapping rules
```

## Design System

### Color Palette (B2B Construction Aesthetic - Muted Blue Theme)

- **Primary Blue**: `#1e3a8a` (blue-900) - Darker, muted professional blue
- **Primary Dark**: `#1e40af` (blue-800) - Hover states
- **Primary Light**: `#3b82f6` (blue-500) - Lighter variant for accents
- **Secondary Gray**: `#475569` (slate-600) - Secondary actions, text
- **Secondary Dark**: `#334155` (slate-700) - Secondary hover states
- **Accent Teal**: `#0d9488` (teal-600) - Informational badges, Project Builder features, highlights
- **Accent Light**: `#14b8a6` (teal-500) - Lighter accent variant
- **CTA Teal**: `#0d9488` (teal-600) - **High-priority CTAs only** (checkout, major conversions)
- **CTA Dark**: `#0f766e` (teal-700) - CTA hover states
- **Success Green**: `#10B981` (green-500) - In stock, success states
- **Warning Yellow**: `#F59E0B` (amber-500) - Low stock warnings
- **Error Red**: `#EF4444` (red-500) - Out of stock, errors

### Color Usage Guidelines

**Primary Blue** - Standard actions:
- Add to Cart buttons (product cards, detail pages)
- Navigation links
- Standard form buttons (Login, Submit)
- Default interactive elements

**Teal Accent** - Informational and branded:
- Project Builder features (navigation link, badges, bundle indicators)
- Content badges (Ideas Center tags, category labels)
- Informational highlights
- Secondary emphasis (not for actions)

**Teal CTA** - High-priority conversions only:
- Checkout button
- "Start New Project" hero CTA
- "Add Kit to Cart" in Project Builder
- Final conversion steps
- **Not** for standard "Add to Cart" buttons

### Typography

- **Headings**: Bold, sans-serif (Arial/Helvetica fallback)
  - H1: 2.5rem (40px), font-weight: 700
  - H2: 2rem (32px), font-weight: 700
  - H3: 1.5rem (24px), font-weight: 600
- **Body**: Regular weight, readable sizes
  - Base: 1rem (16px), line-height: 1.5
  - Small: 0.875rem (14px)

### Spacing System

- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
- Container max-width: 1280px
- Section padding: 80px vertical, 24px horizontal

## Pages and Features

### Homepage (`index.html`)

- Hero section with company messaging
- Three division cards (Commercial, Residential, Pro)
- Featured products section
- Call-to-action for account login

### Project Selector (`pages/project-selector.html`)

- Four project type cards: New Construction, Remodel, Repair, Restoration
- Visual indicators and descriptions for each project type
- Sets project context for catalog filtering

### Project Builder (`pages/project-builder.html`)

- **Multi-Step Wizard**: Guided workflow through 5 steps
  - Step 1: Select project type (New Construction, Remodel, Repair, Restoration)
  - Step 2: Select project details (conditional based on type, e.g., Bathroom, Kitchen for Remodel)
  - Step 3: Select complexity level (Basic, Moderate, Complex)
  - Step 4: Select budget range (Under $5K to $50K+)
  - Step 5: View recommended bundle kit
- **Dynamic Bundle Generation**: Creates customized material kit based on selections
- **Bundle Display**: Shows bundle name, total price, item count, and expandable item list
- **Item Details**: Each item shows name, SKU, quantity, unit price, subtotal, and inclusion reason
- **Add to Cart**: Bundle added as single cart item with expandable component view
- **Customize Option**: Link to filtered catalog based on wizard selections

### Product Catalog (`pages/catalog.html`)

- **Category Navigation**: Sidebar with product categories
- **Product Grid**: Responsive grid showing filtered products
- **Pricing Display**: Shows tier-based pricing per product
- **Inventory Status**: Regional availability badges
- **Quick Add to Cart**: Add products without leaving page
- **Project Builder Link**: Quick access to start new project

### Product Detail (`pages/product-detail.html`)

- Product name, SKU, description
- **Tier Badge**: Visual indicator of customer's pricing tier
- **Volume Pricing Table**: Shows pricing at different quantity breakpoints (1-99, 100-293, 294+)
- **Regional Inventory**: Shows availability at 6 warehouse locations
- **Project Type Tags**: Shows which project types this product serves
- **Add to Cart**: Quantity selector and add button
- **Specifications**: Product attributes table

### Shopping Cart (`pages/cart.html`)

- Cart item list with quantities (supports both regular products and bundles)
- **Bundle Display**: Bundles shown as expandable items with component breakdown
- **Bundle Customization**: Adjust quantities of individual items within bundles
- **Pricing Summary**: Shows tier pricing per item and bundle totals
- **Volume Discount Indicator**: Highlights when quantity breakpoints are met
- **Total Calculation**: Subtotal, estimated savings, total (includes bundles)
- **Regional Fulfillment**: Shows which warehouse will fulfill each item

### Account Dashboard (`pages/account.html`)

- Company information display
- **Pricing Tier Status**: Shows current tier (Tier1, Tier2, etc.)
- Quick access to orders, saved projects, and settings

### Login Page (`pages/login.html`)

- B2B authentication form
- Company selection dropdown
- Sets customer context (tier, region, warehouse)

## Custom EDS Blocks

All blocks follow EDS naming convention and structure:

### Header Block (`blocks/header/`)

Site-wide header with navigation, cart link, and account access.

### Project Filter Block (`blocks/project-filter/`)

Dropdown selector for project type filtering. Updates localStorage and dispatches events for other components.

### Pricing Display Block (`blocks/pricing-display/`)

Shows tier-based pricing with volume breakpoints. Displays current price and pricing table based on customer tier.

### Inventory Status Block (`blocks/inventory-status/`)

Lists all 6 warehouse locations with quantity availability and status indicators (in-stock, low-stock, out-of-stock).

### Tier Badge Block (`blocks/tier-badge/`)

Visual indicator of customer's pricing tier with savings percentage. Color-coded by tier level.

### Cart Summary Block (`blocks/cart-summary/`)

Shopping cart summary with itemized pricing, subtotal, savings calculation, and total. Supports both regular products and bundle products.

### Project Bundle Block (`blocks/project-bundle/`)

Displays dynamic bundle products with expandable item views, quantity modification, and add-to-cart functionality. Bundles are generated by the Project Builder wizard.

### Product Grid Block (`blocks/product-grid/`)

Responsive grid displaying filtered products with pricing, inventory status, and add-to-cart functionality.

## Block Structure Compliance

All blocks follow EDS patterns:

- **Naming**: `blocks/{block-name}/` folder structure
- **Files**: Each block has `{block-name}.html`, `{block-name}.css`, and `{block-name}.js`
- **HTML Structure**: EDS nested div pattern: `<div class="blockname"><div><div>...</div></div></div>`
- **JavaScript**: Exports default `decorate()` function
- **CSS**: Scoped to block class name

### Nesting Rules

- **Sections** can contain blocks (standard pattern)
- **Blocks** generally contain default content (text, images, links), not other blocks
- **Exception**: Container blocks like `columns` can contain other blocks in their cells through `component-filters.json` configuration
- Custom container blocks can be created following the columns pattern with proper filter configuration

## Functional Features

### Project Type Filtering

- Stores active project type in localStorage
- Filters product catalog based on `project_types` attribute
- Updates URL parameter for shareability
- Shows count of filtered products

### Tier-Based Pricing Display

- Mock customer data includes tier assignment (Commercial-Tier2, Residential-Builder, Pro-Specialty)
- Pricing calculated from hierarchical price books
- Volume breakpoints: 1-99, 100-293, 294+ units
- Savings calculation vs base pricing

### Regional Inventory

- Mock inventory data for 6 warehouses
- Priority-based display (nearest warehouse first)
- Quantity availability per location
- "In Stock" / "Low Stock" / "Out of Stock" statuses

### Shopping Cart

- LocalStorage-based cart persistence
- Quantity updates recalculate pricing
- Volume discount indicators
- Regional fulfillment routing display

## Mock Data

### Products (`data/mock-products.json`)

Sample products with:
- SKU, name, category, description
- Project type tags
- Hierarchical pricing (base, tier1, tier2, etc.)
- Volume breakpoint pricing
- Multi-warehouse inventory quantities
- Product attributes (dimensions, grade, species, etc.)

### Customer Context

Default customer context (can be changed via login):
- Company: Premium Commercial Builders Inc.
- Tier: Commercial-Tier2
- Region: Western
- Primary Warehouse: warehouse_west
- Locations: Los Angeles, Phoenix

## Usage

### Local Development

1. Serve files using a local web server (required for fetch API):

   **Option 1: Using the included Node.js server (Recommended)**
   ```bash
   cd buildright-aco/buildright-website
   npm start
   # or
   node server.js
   ```

   **Option 2: Using http-server (via npx, no installation needed)**
   ```bash
   cd buildright-aco/buildright-website
   npm run serve
   # or
   npx http-server -p 8000 -c-1
   ```

   **Option 3: Using Python**
   ```bash
   cd buildright-aco/buildright-website
   python -m http.server 8000
   ```

   **Option 4: Using PHP**
   ```bash
   cd buildright-aco/buildright-website
   php -S localhost:8000
   ```

2. Open in browser:
   ```
   http://localhost:8000
   ```

### Testing Features

1. **Project Filtering**: 
   - Go to `/pages/project-selector.html`
   - Select a project type
   - Browse catalog to see filtered products

2. **Tier Pricing**:
   - Login at `/pages/login.html`
   - Select "Premium Commercial Builders Inc." for Tier2 pricing
   - View products to see tier-based pricing

3. **Shopping Cart**:
   - Add products to cart from catalog or product detail pages
   - View cart at `/pages/cart.html`
   - Update quantities to see volume pricing changes

4. **Regional Inventory**:
   - View product detail pages
   - See inventory status at all 6 warehouse locations
   - Primary warehouse highlighted

## EDS Migration Path

This prototype is structured for easy migration to Adobe Edge Delivery Services:

### Phase 1: Current Prototype ✅
- HTML/CSS/JS prototype with EDS block structure
- Functional features with mock data
- Design system matching B2B construction aesthetic

### Phase 2: Convert to EDS Format
- Move blocks to EDS `blocks/` folder structure
- Ensure all blocks export default `decorate()` function
- Update HTML to match EDS nested div patterns

### Phase 3: Integrate with EDS Boilerplate
- Clone `accs-citisignal` boilerplate
- Copy blocks into boilerplate structure
- Update `component-definition.json` for Universal Editor
- Configure `component-filters.json` for block nesting rules

### Phase 4: Connect to ACO APIs
- Replace mock data with ACO GraphQL queries
- Implement trigger policies for project filtering (`AC-Policy-Project-Type` header)
- Connect pricing to ACO price books
- Integrate inventory with Adobe Commerce MSI

### Phase 5: Add Commerce Drop-ins
- Integrate `@dropins/storefront-cart`
- Add `@dropins/storefront-checkout`
- Implement `@dropins/storefront-pdp` for product details
- Add `@dropins/storefront-account` for B2B account management

## Design Approach

### Based on Adobe Edge Delivery Services Documentation

1. **Block-First Architecture**: Structure all UI as reusable blocks following EDS patterns
2. **Nested Blocks Rules**: 
   - Sections can contain blocks (standard pattern)
   - Blocks generally contain default content, not other blocks
   - Container blocks like `columns` can contain other blocks via filter configuration
3. **Use Existing Blocks**: Leverage AEM Block Collection blocks (Header, Footer, Columns, Cards, Table, Tabs, Search)
4. **Plain JavaScript**: Use vanilla JS for blocks (no frameworks) for optimal performance
5. **JavaScript Coordination**: Use JavaScript and data attributes to coordinate between blocks
6. **CSS Variables**: Use CSS custom properties for theming
7. **Progressive Enhancement**: Start with HTML structure, enhance with JS
8. **Content Separation**: Keep content separate from structure for easy AEM authoring
9. **Performance**: Minimize dependencies, use native browser APIs
10. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- LocalStorage API

## Notes

- **No Images**: Per requirements, design uses no images (similar to citisignal-nextjs experience)
- **Mock Data**: All product and pricing data is mocked for prototype purposes
- **LocalStorage**: Cart and customer context stored in browser localStorage
- **No Backend**: Pure frontend prototype, no server-side functionality

## Future Enhancements

- Integration with Adobe Commerce Optimizer (ACO) GraphQL APIs
- Real-time inventory updates
- Order history and tracking
- Saved project types and favorites
- Advanced search and filtering
- Product recommendations
- Quote management
- Multi-location company support

## License

[Specify License]

## Support

For questions or issues:
1. Review this README
2. Check block documentation in `blocks/` folders
3. Review BuildRight case study in `../docs/BUILDRIGHT-CASE-STUDY.md`

