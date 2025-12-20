# Custom Dropin with Custom Slots: Deep Dive

## Question: Would a custom dropin allow us to define slots specific to our design?

**Short Answer:** ✅ **YES** - You can define any slots you want, perfectly tailored to BuildRight's architecture.

**Better Question:** Should you? Let's analyze.

---

## What Are Custom Slots?

### Adobe's Generic Slots (Product Discovery Dropin)
```javascript
// Adobe defines generic e-commerce slots
ProductList.render({
  slots: {
    ProductCard: (ctx) => { /* Your HTML */ },
    EmptyState: (ctx) => { /* Your HTML */ },
    LoadingState: (ctx) => { /* Your HTML */ }
  }
});
```

**Adobe decides:**
- What slots exist (`ProductCard`, `EmptyState`, etc.)
- What data each slot receives (`ctx.product`, `ctx.isLoading`, etc.)
- When slots are called (lifecycle)

**You decide:**
- What HTML to render in each slot

### Your Custom Slots (BuildRight PLP Dropin)
```javascript
// You define BuildRight-specific slots
BuildRightPLP.render({
  slots: {
    // BuildRight-specific slots
    TierBadge: (ctx) => { /* Render tier badge */ },
    ProductSKU: (ctx) => { /* Render SKU display */ },
    ManufacturerBadge: (ctx) => { /* Render manufacturer */ },
    GradeIndicator: (ctx) => { /* Render grade */ },
    PriceWithTier: (ctx) => { /* Render tiered pricing */ },
    
    // Granular control
    ProductCard: {
      slots: {
        ImageWrapper: (ctx) => { /* Custom image area */ },
        InfoSection: (ctx) => { /* Product info */ },
        ActionButtons: (ctx) => { /* Add to cart, etc */ }
      }
    },
    
    // Category-specific customization
    CategoryHeader: {
      slots: {
        BreadcrumbTrail: (ctx) => { /* Breadcrumbs */ },
        CategoryTitle: (ctx) => { /* Title with icon */ },
        CategoryDescription: (ctx) => { /* Description */ },
        CategoryFilters: (ctx) => { /* Quick filters */ }
      }
    },
    
    // Filter-specific slots
    FilterGroup: {
      slots: {
        FilterHeader: (ctx) => { /* Collapsible header */ },
        ManufacturerFilter: (ctx) => { /* Manufacturer-specific */ },
        GradeFilter: (ctx) => { /* Grade-specific */ },
        PriceRangeFilter: (ctx) => { /* Price slider */ }
      }
    }
  }
});
```

**You decide everything:**
- What slots exist
- What data each slot receives
- Slot hierarchy and nesting
- When slots are called
- Default implementations

---

## Example: BuildRight Custom Dropin Architecture

### 1. Define Your Dropin Structure

```typescript
// buildright-plp/types/slots.ts

export interface BuildRightPLPSlots {
  // Product Card Slots
  ProductCard?: {
    slots?: {
      TierBadge?: (ctx: TierBadgeContext) => HTMLElement;
      ImageArea?: (ctx: ProductImageContext) => HTMLElement;
      SKUDisplay?: (ctx: SKUContext) => HTMLElement;
      ProductName?: (ctx: ProductNameContext) => HTMLElement;
      ManufacturerBadge?: (ctx: ManufacturerContext) => HTMLElement;
      GradeIndicator?: (ctx: GradeContext) => HTMLElement;
      PricingSection?: (ctx: PricingContext) => HTMLElement;
      AddToCartButton?: (ctx: AddToCartContext) => HTMLElement;
    };
    // Or override entire card
    render?: (ctx: ProductCardContext) => HTMLElement;
  };
  
  // Category Header Slots
  CategoryHeader?: {
    slots?: {
      Breadcrumbs?: (ctx: BreadcrumbContext) => HTMLElement;
      CategoryTitle?: (ctx: CategoryTitleContext) => HTMLElement;
      CategoryIcon?: (ctx: CategoryIconContext) => HTMLElement;
      CategoryDescription?: (ctx: CategoryDescriptionContext) => HTMLElement;
      FilterToolbar?: (ctx: FilterToolbarContext) => HTMLElement;
    };
  };
  
  // Filter Sidebar Slots
  FilterSidebar?: {
    slots?: {
      FilterGroup?: (ctx: FilterGroupContext) => HTMLElement;
      ManufacturerFilter?: (ctx: ManufacturerFilterContext) => HTMLElement;
      GradeFilter?: (ctx: GradeFilterContext) => HTMLElement;
      PriceRangeFilter?: (ctx: PriceRangeFilterContext) => HTMLElement;
      MaterialTypeFilter?: (ctx: MaterialTypeFilterContext) => HTMLElement;
    };
  };
  
  // Grid Layout Slots
  ProductGrid?: {
    slots?: {
      GridContainer?: (ctx: GridContext) => HTMLElement;
      EmptyState?: (ctx: EmptyStateContext) => HTMLElement;
      LoadingState?: (ctx: LoadingStateContext) => HTMLElement;
      ErrorState?: (ctx: ErrorStateContext) => HTMLElement;
    };
  };
  
  // Pagination Slots
  Pagination?: {
    slots?: {
      PageNumbers?: (ctx: PaginationContext) => HTMLElement;
      PrevButton?: (ctx: PaginationButtonContext) => HTMLElement;
      NextButton?: (ctx: PaginationButtonContext) => HTMLElement;
      PageInfo?: (ctx: PageInfoContext) => HTMLElement;
    };
  };
}

// Define rich context objects
export interface TierBadgeContext {
  product: Product;
  tier: 'gold' | 'silver' | 'bronze' | null;
  tierDiscount: number;
  element: HTMLElement;
  dictionary: Record<string, string>;
}

export interface PricingContext {
  product: Product;
  basePrice: number;
  tierPrice: number | null;
  discount: number | null;
  quantity: number;
  element: HTMLElement;
  dictionary: Record<string, string>;
}

// ... more context types
```

### 2. Implement the Dropin with Default Slots

```javascript
// buildright-plp/containers/ProductList.tsx

import { Container } from '@adobe-commerce/elsie';

export class BuildRightProductList extends Container {
  constructor(config) {
    super(config);
    this.slots = config.slots || {};
  }
  
  renderProduct(product) {
    const cardSlots = this.slots.ProductCard?.slots || {};
    
    // Call each slot with rich context
    const tierBadge = cardSlots.TierBadge 
      ? cardSlots.TierBadge({
          product,
          tier: product.tier,
          tierDiscount: product.tierDiscount,
          element: this.element,
          dictionary: this.dictionary
        })
      : this.renderDefaultTierBadge(product);
    
    const skuDisplay = cardSlots.SKUDisplay
      ? cardSlots.SKUDisplay({
          product,
          sku: product.sku,
          formattedSKU: this.formatSKU(product.sku),
          element: this.element,
          dictionary: this.dictionary
        })
      : this.renderDefaultSKU(product);
    
    const manufacturerBadge = cardSlots.ManufacturerBadge
      ? cardSlots.ManufacturerBadge({
          product,
          manufacturer: product.manufacturer,
          manufacturerLogo: product.manufacturerLogo,
          element: this.element,
          dictionary: this.dictionary
        })
      : this.renderDefaultManufacturer(product);
    
    // ... more slots
    
    // Compose final card
    return this.composeProductCard({
      tierBadge,
      skuDisplay,
      manufacturerBadge,
      // ... more elements
    });
  }
  
  // Default implementations
  renderDefaultTierBadge(product) {
    if (!product.tier) return null;
    return `<span class="tier-badge tier-${product.tier}">${product.tier.toUpperCase()}</span>`;
  }
  
  renderDefaultSKU(product) {
    return `<div class="product-sku">SKU: ${product.sku}</div>`;
  }
  
  // ... more defaults
}
```

### 3. Usage: Default (No Customization)

```javascript
// pages/catalog.html - Using defaults
import { BuildRightPLP } from '@buildright/plp-dropin';

BuildRightPLP.initialize({
  endpoint: ACO_ENDPOINT,
  apiKey: API_KEY
});

// Use with default BuildRight design (no slots needed!)
BuildRightPLP.render(ProductList, {
  // No slots specified = use all defaults
});

// Automatically renders:
// - Tier badges (gold/silver/bronze)
// - SKU displays (formatted)
// - Manufacturer badges
// - Grade indicators
// - Tiered pricing
// - BuildRight styling
```

**Result:** Perfectly matches BuildRight design out-of-box

### 4. Usage: Custom Slots (When Needed)

```javascript
// pages/catalog-custom.html - Different design for special category
import { BuildRightPLP } from '@buildright/plp-dropin';

BuildRightPLP.render(ProductList, {
  slots: {
    ProductCard: {
      slots: {
        // Override just the tier badge for this category
        TierBadge: (ctx) => {
          if (ctx.tier === 'gold') {
            return `
              <div class="premium-badge">
                <img src="/icons/crown.svg" alt="Premium" />
                <span>Premium ${ctx.tierDiscount}% OFF</span>
              </div>
            `;
          }
          return null; // Use default for other tiers
        },
        
        // Override pricing for custom display
        PricingSection: (ctx) => {
          return `
            <div class="pricing-special">
              <div class="was-price">$${ctx.basePrice}</div>
              <div class="now-price">$${ctx.tierPrice}</div>
              <div class="savings">Save $${ctx.basePrice - ctx.tierPrice}!</div>
            </div>
          `;
        }
        
        // Other slots use defaults
      }
    }
  }
});
```

**Result:** Custom design for specific pages, defaults for others

---

## Comparison: Adobe's Generic Slots vs. Your Custom Slots

### Adobe's Product Discovery Dropin

**Adobe provides:**
```javascript
slots: {
  ProductCard: (ctx) => {
    // Generic context
    ctx.product = {
      name, price, image, sku
      // Generic e-commerce fields
    }
  }
}
```

**Limitations:**
- ❌ No tier badge concept
- ❌ No manufacturer badge
- ❌ No grade indicator
- ❌ No BuildRight-specific fields
- ✅ You render ALL BuildRight-specific elements yourself

**Your responsibility:**
```javascript
ProductCard: (ctx) => `
  <div class="product-card">
    ${ctx.product.image}
    ${ctx.product.name}
    ${ctx.product.price}
    
    <!-- You manually add BuildRight features -->
    ${ctx.product.attributes.find(a => a.code === 'tier') 
      ? `<span class="tier-badge">${getTier()}</span>` 
      : ''}
    ${ctx.product.attributes.find(a => a.code === 'manufacturer')
      ? `<div class="manufacturer">${getManufacturer()}</div>`
      : ''}
    ${ctx.product.attributes.find(a => a.code === 'grade')
      ? `<div class="grade">${getGrade()}</div>`
      : ''}
    
    <!-- Manual logic for each BuildRight feature -->
  </div>
`
```

### Your BuildRight PLP Dropin

**You provide:**
```javascript
slots: {
  ProductCard: {
    slots: {
      TierBadge: (ctx) => {
        // Rich, BuildRight-specific context
        ctx.tier = 'gold' | 'silver' | 'bronze'
        ctx.tierDiscount = 15
        ctx.tierLevel = 3
      },
      ManufacturerBadge: (ctx) => {
        ctx.manufacturer = 'Pacific Northwest Lumber'
        ctx.manufacturerLogo = '/logos/pacific.png'
        ctx.manufacturerCertified = true
      },
      GradeIndicator: (ctx) => {
        ctx.grade = 'Grade A'
        ctx.gradeDescription = 'Premium quality'
        ctx.gradeIcon = '/icons/grade-a.svg'
      }
    }
  }
}
```

**Benefits:**
- ✅ BuildRight concepts are **first-class** (tier, manufacturer, grade)
- ✅ Granular control (override just tier badge, keep rest)
- ✅ Rich context (pre-computed values, formatted data)
- ✅ Default implementations (works out-of-box for BuildRight)
- ✅ Type-safe (TypeScript knows about BuildRight fields)

**Your responsibility (if customizing):**
```javascript
TierBadge: (ctx) => `
  <span class="tier-badge ${ctx.tier}">
    ${ctx.tier.toUpperCase()} - ${ctx.tierDiscount}% OFF
  </span>
`
// Much simpler! All BuildRight logic handled by dropin
```

---

## When Custom Dropin with Custom Slots Makes Sense

### ✅ **YES** - Build Custom Dropin If:

#### 1. Multiple Related Projects
```
BuildRight Scenarios:
- BuildRight Professional (contractors)
- BuildRight Retail (homeowners)  
- BuildRight Commercial (large projects)
- BuildRight Wholesale (dealers)

Each needs:
- Same core features (tier, manufacturer, grade)
- Different UI customization
- Shared business logic
```

**Custom dropin value:**
- One dropin, four implementations
- Customize via slots per site
- Maintain one codebase
- Share updates across all

#### 2. White-Label Platform
```
You build a platform for other building supply companies:
- BuildRight
- HomeDepot-like stores
- Regional lumber yards
- Each with their own branding
```

**Custom dropin value:**
- Reusable across clients
- Clients customize via slots
- You maintain core functionality
- Revenue opportunity (sell dropin)

#### 3. Internal Platform Team
```
Company structure:
- Platform team (builds dropin)
- Product teams (use dropin)
- Multiple storefronts
- Shared component library
```

**Custom dropin value:**
- Platform team maintains dropin
- Product teams consume via slots
- Centralized updates
- Consistent architecture

#### 4. Complex, Unique Domain Logic
```
BuildRight has highly specialized needs:
- Complex tiered pricing
- Manufacturer certification system
- Grade classification logic
- Quantity-based discounting
- Project-based bundling
- And this is needed across multiple properties
```

**Custom dropin value:**
- Encapsulate complex logic
- Reusable business rules
- Type-safe API
- Testable components

### ❌ **NO** - Don't Build Custom Dropin If:

#### 1. Single Storefront (BuildRight's Current Situation)
```
Reality:
- One storefront (buildright.com)
- No plans for multiple sites
- No platform ambitions
- Just need catalog page
```

**Better approach:** API-only or Adobe's dropin + slots

**Why:**
- Massive effort for single use
- No reusability benefit
- You maintain everything
- Adobe's dropin already works

#### 2. Adobe's Dropin Already Fits
```
If you can achieve 90%+ design with:
- Adobe's generic slots
- CSS customization
- Design tokens
```

**Better approach:** Extend Adobe's dropin

**Why:**
- Adobe maintains it
- Future updates free
- Community support
- Proven reliability

#### 3. Time Constraints
```
Deadlines:
- Need catalog live in 2 weeks
- Other priorities
- Limited team
```

**Better approach:** API-only (2-3 days) or Adobe dropin (1-2 days)

**Why:**
- Custom dropin takes 4-6 weeks
- High opportunity cost
- Risk of scope creep

---

## Effort Comparison: Implementing BuildRight Features

### Scenario: Add Tier Badge to Product Cards

#### Option 1: Adobe Dropin (Generic Slots)
```javascript
// You manually extract and render tier badge
ProductCard: (ctx) => {
  const tierAttr = ctx.product.attributes.find(a => a.code === 'br_tier');
  const tier = tierAttr ? tierAttr.value : null;
  
  let tierBadge = '';
  if (tier) {
    const tierClass = tier.toLowerCase();
    const tierLabel = tier.toUpperCase();
    const discount = getTierDiscount(tier); // You write this
    tierBadge = `<span class="tier-badge ${tierClass}">${tierLabel} - ${discount}% OFF</span>`;
  }
  
  return `
    <div class="product-card">
      <div class="image-wrapper">
        ${ctx.product.image}
        ${tierBadge}
      </div>
      <!-- Rest of card -->
    </div>
  `;
}
```

**Effort:** You write all logic every time you use `ProductCard`

#### Option 2: BuildRight Custom Dropin (Custom Slots)
```javascript
// Tier badge is built-in, just customize rendering
TierBadge: (ctx) => `
  <span class="tier-badge ${ctx.tier}">
    ${ctx.tier.toUpperCase()} - ${ctx.tierDiscount}% OFF
  </span>
`

// Or use default (no code needed):
// (dropin renders tier badge automatically)
```

**Effort:** Write once in dropin, reuse everywhere

---

## Cost-Benefit Analysis for BuildRight

### Custom Dropin Investment

**Initial Development:**
- Week 1: Project setup, API layer
- Week 2: Core components (ProductCard, FilterGroup)
- Week 3: Containers (ProductList, Facets)
- Week 4: Slots system, defaults
- Week 5: Testing, documentation
- Week 6: Polish, edge cases

**Total:** 6 weeks × $5,000/week = **$30,000**

### Return on Investment

#### Scenario A: Single Storefront (Current)
**Reusability:** 1 project  
**ROI:** **$30,000 / 1 = $30,000 per use**

**Alternative:** API-only (2 days × $1,000/day = $2,000)  
**Savings with API-only:** **$28,000**

❌ **Not worth it**

#### Scenario B: Four Storefronts
**Reusability:** 4 projects  
**ROI:** **$30,000 / 4 = $7,500 per use**

**Alternative:** API-only for each (4 × $2,000 = $8,000)  
**Savings with custom dropin:** **$1,000** (slight savings)

⚠️ **Barely worth it** (and only if all 4 are planned)

#### Scenario C: Ten Storefronts
**Reusability:** 10 projects  
**ROI:** **$30,000 / 10 = $3,000 per use**

**Alternative:** API-only for each (10 × $2,000 = $20,000)  
**Savings with custom dropin:** **$10,000** (significant savings)

✅ **Worth it** at scale

---

## Decision Matrix: Which Approach?

### For BuildRight (Single Storefront)

| Need | Solution | Why |
|------|----------|-----|
| 100% design control | **API-Only** | Full control, reasonable effort |
| 90% design, less code | **Adobe Dropin + Slots** | Pre-built UI, some customization |
| Multiple storefronts | **Custom Dropin** | (Not applicable) |
| Future platform | **Custom Dropin** | (Not current need) |

**Recommendation: API-Only**

### For Multi-Storefront BuildRight (Hypothetical)

| Project | Solution | Why |
|---------|----------|-----|
| BuildRight Pro | **Custom Dropin (base)** | Default implementation |
| BuildRight Retail | **Custom Dropin (slots)** | Customize via `TierBadge` slot |
| BuildRight Commercial | **Custom Dropin (slots)** | Customize via `PricingSection` slot |
| BuildRight Wholesale | **Custom Dropin (slots)** | Customize via `FilterSidebar` slots |

**Recommendation: Custom Dropin** (with custom slots)

---

## Alternative: Hybrid Approach

### Middle Ground: Extend Adobe's Dropin

Instead of building from scratch, you could **extend** Adobe's dropin:

```javascript
// buildright-extensions/enhanced-product-card.js

import { ProductCard as AdobeProductCard } from '@dropins/storefront-product-discovery/containers';

export class BuildRightProductCard extends AdobeProductCard {
  // Add BuildRight-specific slots
  constructor(config) {
    super(config);
    
    // Define additional slots
    this.buildRightSlots = {
      TierBadge: config.slots?.TierBadge || this.defaultTierBadge,
      ManufacturerBadge: config.slots?.ManufacturerBadge || this.defaultManufacturerBadge,
      GradeIndicator: config.slots?.GradeIndicator || this.defaultGradeIndicator
    };
  }
  
  render(product) {
    const baseCard = super.render(product);
    
    // Enhance with BuildRight features
    const tierBadge = this.buildRightSlots.TierBadge({ product, tier: product.tier });
    const manufacturerBadge = this.buildRightSlots.ManufacturerBadge({ product });
    const gradeIndicator = this.buildRightSlots.GradeIndicator({ product });
    
    return this.injectBuildRightFeatures(baseCard, {
      tierBadge,
      manufacturerBadge,
      gradeIndicator
    });
  }
  
  defaultTierBadge({ product, tier }) {
    // Your default implementation
  }
}
```

**Benefits:**
- ✅ Leverage Adobe's base functionality
- ✅ Add BuildRight-specific slots
- ✅ Less code than full custom dropin
- ✅ Keep Adobe's updates

**Effort:** ~2 weeks (not 6 weeks)

**Tradeoff:** Less control than full custom, but more than pure Adobe

---

## Final Answer to Your Question

### Yes, custom dropins allow custom slots. Here's the reality:

#### **Custom Slots Enable:**
1. ✅ BuildRight-specific concepts (tier, manufacturer, grade) as first-class citizens
2. ✅ Granular customization (override just tier badge, keep rest)
3. ✅ Rich, pre-computed context (no manual attribute parsing)
4. ✅ Default implementations (works perfectly out-of-box for BuildRight)
5. ✅ Type safety (TypeScript knows BuildRight structure)
6. ✅ Reusability across multiple BuildRight properties

#### **But for BuildRight's Current Need (Single Storefront):**
- ❌ **6 weeks effort** vs. 2 days (API-only)
- ❌ **$30,000 investment** vs. $2,000
- ❌ **No reusability benefit** (single use)
- ❌ **You maintain everything** vs. Adobe maintains data layer
- ❌ **Same design result** as API-only (both 100%)

#### **Custom Dropin Makes Sense When:**
- ✅ Building 4+ related storefronts
- ✅ Creating a white-label platform
- ✅ Selling/distributing to others
- ✅ Internal platform team serving multiple product teams

#### **For BuildRight Today:**
**Recommendation: API-Only Mode**

**If you grow to multiple storefronts later:**
- Then invest in custom dropin
- Define BuildRight-specific slots
- Migrate existing storefronts to use it
- Benefit from reusability

---

## Summary

**Q: Would a custom dropin allow us to define slots specific to our design?**  
**A: Yes, absolutely. You define everything.**

**Q: Should BuildRight build a custom dropin?**  
**A: No, not for a single storefront. Use API-only mode instead.**

**Q: When would BuildRight need a custom dropin?**  
**A: When expanding to 4+ storefronts or building a platform.**

**Current Best Path:**
1. Implement API-only mode (2-3 days)
2. Get catalog working perfectly
3. If BuildRight expands to multiple storefronts, revisit
4. At that point, custom dropin investment pays off

---

**Document Version**: 1.0  
**Date**: December 19, 2024  
**Author**: AI Agent  
**Status**: Custom Slots Deep Dive

