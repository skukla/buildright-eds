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

This design system follows **Adobe Commerce Storefront / Edge Delivery Services** design token conventions for consistency and compatibility with Adobe's ecosystem.

### Design Token Structure

Design tokens are organized using Adobe's naming conventions:
- **Brand Colors**: `--color-brand-*` (numbered scale: 300-700)
- **Semantic Colors**: `--color-positive-*`, `--color-negative-*`, `--color-warning-*`
- **Typography**: `--type-*` prefix (display, headline, body, button, details)
- **Spacing**: `--spacing-*` (semantic names: xsmall, small, medium, large, xlarge)
- **Shape**: `--shape-*` (border-radius, shadows)

### Color Palette (B2B Construction Aesthetic - Deep Blue + Warm Orange Theme)

#### Brand Colors

**Primary Brand - Sapphire Blue** (`--color-brand-*`):
- `--color-brand-500`: `#0f5ba7` - Base color (Professional authority, headers, navigation, standard actions)
- `--color-brand-600`: `#0a4580` - Darker (Hover states)
- `--color-brand-700`: `#083d6f` - Darkest (Active/pressed states)
- `--color-brand-400`: `#1e7cd6` - Lighter (Accents, completed project builder steps)
- `--color-brand-300`: `#3d9ae8` - Lightest (Subtle backgrounds)

**Secondary Brand - Slate Gray** (`--color-secondary-*`):
- `--color-secondary-500`: `#475569` - Base (Secondary actions, text)
- `--color-secondary-600`: `#334155` - Darker (Secondary hover)
- `--color-secondary-400`: `#64748b` - Lighter (Secondary text)
- `--color-secondary-300`: `#94a3b8` - Lightest (Disabled states)

**Accent Brand - Tangerine Orange** (`--color-accent-*`):
- `--color-accent-500`: `#f97316` - Base (Project Builder features, informational badges, high-priority CTAs)
- `--color-accent-600`: `#ea580c` - Darker (Hover states)
- `--color-accent-700`: `#c2410c` - Darkest (Active/pressed states)
- `--color-accent-400`: `#fb923c` - Lighter (Light accent variant)
- `--color-accent-300`: `#fdba74` - Lightest (Subtle backgrounds)

#### Semantic Colors

**Positive/Success** (`--color-positive-*`):
- `--color-positive-500`: `#059669` - Base (In stock, success states)
- `--color-positive-600`: `#047857` - Darker (Success hover)
- `--color-positive-200`: `#d1fae5` - Light background (Success messages)
- `--color-positive-100`: `#ecfdf5` - Lightest background

**Warning** (`--color-warning-*`):
- `--color-warning-500`: `#d97706` - Base (Low stock warnings)
- `--color-warning-600`: `#b45309` - Darker (Warning hover)
- `--color-warning-200`: `#fef3c7` - Light background (Warning messages)
- `--color-warning-100`: `#fffbeb` - Lightest background

**Negative/Error** (`--color-negative-*`):
- `--color-negative-500`: `#dc2626` - Base (Out of stock, errors)
- `--color-negative-600`: `#b91c1c` - Darker (Error hover)
- `--color-negative-200`: `#fee2e2` - Light background (Error messages)
- `--color-negative-100`: `#fef2f2` - Lightest background

### Color Usage Guidelines

**Primary Sapphire Blue** (`--color-brand-500`) - Standard actions:
- Add to Cart buttons (product cards, detail pages)
- Navigation links
- Standard form buttons (Login, Submit)
- Default interactive elements
- Completed project builder steps (`--color-brand-400`)

**Tangerine Orange** (`--color-accent-500`) - High-priority actions and Project Builder:
- Project Builder active step indicator
- Project Builder navigation link and badges
- High-priority CTAs (checkout, "Start New Project", "Add Kit to Cart")
- Informational highlights and bundle indicators
- Content badges (Ideas Center tags, category labels)

**Tangerine CTA** - High-priority conversions only:
- Checkout button
- "Start New Project" hero CTA
- "Add Kit to Cart" in Project Builder
- Final conversion steps
- **Not** for standard "Add to Cart" buttons

### Typography Tokens

Following Adobe Commerce Storefront typography conventions (`--type-*`):

**Display** (Hero titles, banners):
- `--type-display-1-font`: 2.5rem/1.25, weight 700 (40px - Hero title)
- `--type-display-2-font`: 2rem/1.25, weight 700 (32px - Banner title)
- `--type-display-3-font`: 1.5rem/1.25, weight 600 (24px - Section title)

**Headline** (Page titles, section headers):
- `--type-headline-1-font`: 2rem/1.25, weight 700 (32px - Page title)
- `--type-headline-2-font`: 1.5rem/1.25, weight 600 (24px - Section header)
- `--type-headline-2-strong-font`: 1.5rem/1.25, weight 700 (24px - Strong header)

**Body** (Paragraphs, general text):
- `--type-body-1-default-font`: 1rem/1.5, weight 400 (16px - Normal text)
- `--type-body-1-strong-font`: 1rem/1.5, weight 600 (16px - Strong text)
- `--type-body-1-emphasized-font`: 1rem/1.5, weight 700 (16px - Emphasized text)
- `--type-body-2-default-font`: 0.875rem/1.5, weight 400 (14px - Small text)
- `--type-body-2-strong-font`: 0.875rem/1.5, weight 600 (14px - Small strong)

**Button** (Button text):
- `--type-button-1-font`: 1.125rem/1.5, weight 600 (18px - Primary button)
- `--type-button-2-font`: 1rem/1.5, weight 600 (16px - Secondary button)

**Details** (Captions, labels, overline):
- `--type-details-caption-1-font`: 0.75rem/1.33, weight 400 (12px - Caption)
- `--type-details-caption-2-font`: 0.75rem/1.33, weight 300 (12px - Light caption)
- `--type-details-overline-font`: 0.75rem/1.67, weight 700 (12px - Overline)

### Spacing System

Following Adobe Commerce Storefront spacing conventions (`--spacing-*`):

- `--spacing-xsmall`: 0.25rem (4px)
- `--spacing-small`: 0.5rem (8px)
- `--spacing-medium`: 1rem (16px)
- `--spacing-large`: 1.5rem (24px)
- `--spacing-xlarge`: 2rem (32px)
- `--spacing-xxlarge`: 3rem (48px)

**Backward compatibility**: Numbered scale (`--spacing-1` through `--spacing-20`) is also available.

### Shape Tokens

Following Adobe Commerce Storefront shape conventions (`--shape-*`):

**Border Radius**:
- `--shape-border-radius-1`: 0 (Square)
- `--shape-border-radius-2`: 0.25rem (4px - Small)
- `--shape-border-radius-3`: 0.5rem (8px - Default for buttons)
- `--shape-border-radius-4`: 0.75rem (12px - Large)
- `--shape-border-radius-5`: 1rem (16px - Extra large)
- `--shape-border-radius-full`: 9999px (Pill shape)

**Shadows**:
- `--shape-shadow-1`: Subtle shadow
- `--shape-shadow-2`: Medium shadow
- `--shape-shadow-3`: Large shadow

### Backward Compatibility

All existing variable names are maintained as aliases to the new Adobe-style tokens, ensuring existing code continues to work without modification. For example:
- `--color-primary` → `var(--color-brand-500)`
- `--color-cta` → `var(--color-accent-500)`
- `--spacing-4` → `var(--spacing-medium)`
- `--radius-md` → `var(--shape-border-radius-3)`

### Usage Examples

```css
/* Using Adobe Commerce Storefront conventions */
.button-primary {
  background-color: var(--color-brand-500);
  border-radius: var(--shape-border-radius-3);
  padding: var(--spacing-small) var(--spacing-medium);
  font: var(--type-button-1-font);
}

.button-primary:hover {
  background-color: var(--color-brand-600);
}

/* Using backward-compatible names (still works) */
.button-primary {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
}
```

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

## GitHub Pages Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the `wip` branch. The deployment is scoped exclusively to the `buildright-eds` directory.

### How It Works

- **Automatic Deployment**: A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) automatically deploys the site when files in `buildright-eds/` are changed on the `wip` branch
- **Deployment Scope**: Only the `buildright-eds/` directory is deployed - other directories in the repository are not included
- **Trigger**: The workflow only runs when files matching `buildright-eds/**` are changed, ensuring deployments only happen for relevant changes

### Accessing the Deployed Site

Once deployed, the site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

The exact URL depends on your GitHub repository settings. Check the repository's GitHub Pages settings or the Actions workflow run logs for the deployment URL.

### Theme Exploration Files

Theme exploration files are accessible but tucked away in the `docs/theme-exploration/` directory:
- **Main Landing Page**: `/docs/index.html` - Overview of all color palette options
- **Individual Previews**: `/docs/theme-exploration/palette-option-*.html` - Detailed previews for each palette option
- **Comparison View**: `/docs/theme-exploration/palette-comparison.html` - Side-by-side comparison of all options
- **Color Palette Preview**: `/docs/theme-exploration/color-palette-preview.html` - Comprehensive color palette exploration

These files are kept in the repository for reference and are accessible via GitHub Pages, but are organized separately from the main site content.

### Manual Deployment

If you need to manually trigger a deployment:
1. Make a small change to any file in `buildright-eds/`
2. Commit and push to the `wip` branch
3. The GitHub Actions workflow will automatically deploy the changes

### Configuration

The deployment configuration is located in `.github/workflows/deploy-pages.yml` in the repository root. The workflow:
- Uses GitHub's official Pages deployment actions
- Requires `pages: write` permission (configured in repository settings)
- Deploys only the `buildright-eds` directory contents

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

