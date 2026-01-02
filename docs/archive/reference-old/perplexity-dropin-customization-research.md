<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I have an existing front end design which I am converting to use Adobe commerce storefront. The primary data source is Adobe commerce optimizer. I am now implementing dropins. My original understanding was that drop ins allowed a developer to fully customize the front end they render. And yet I find that in order to match my design perfectly, I do not use the drop in containers, but only their API.

Is this the correct approach or am I missing something?

You're asking an excellent architectural question, and the answer is **nuanced but ultimately validates your approach** — with some important caveats.

## Your Understanding is Partially Correct

You're right that dropins provide flexibility beyond just using the pre-built containers. The official documentation explicitly states:

> **"Using API functions without containers: Call API functions directly for programmatic control without rendering UI"**[^1_1]

This is a fully documented pattern in the Adobe Commerce Storefront SDK. However, this isn't the primary intended use case — it's an advanced extension point.

## The Three-Level Architecture

Adobe's documentation outlines three customization approaches, in this hierarchy:

1. **Extend (RECOMMENDED)** — Use the dropin containers with slots, styling, events, and configuration[^1_2]
2. **Substitute** — Replace dropins with third-party solutions when extensibility is insufficient
3. **Create** — Build entirely new dropins (currently early access, limited support)

**Direct API usage without containers falls into gray territory** — it's technically possible but isn't formally documented as a primary pattern.

## When Direct API Usage Makes Sense

Your approach is appropriate when:

- ✅ **Design-pixel-perfect matching is required** and the container's DOM structure/styling doesn't align with your original design
- ✅ **You need complete control over DOM hierarchy** for accessibility or performance reasons
- ✅ **Your UI library/framework** (e.g., custom web components, Vue, etc.) has strong opinions about component composition
- ✅ **Container slots don't provide sufficient extension points** for your use case
- ✅ **You're leveraging ACO data** with a custom rendering layer (your specific case)


## What You Should Validate

Before committing fully to API-only approach, verify:

1. **Event Bus Integration** — Are you listening to dropin events to keep state synchronized?

```javascript
// Recommended: Subscribe to cart/checkout events
import { eventBus } from '@dropins/tools/event-bus.js'
eventBus.on('cart/updated', (data) => { /* sync UI */ })
```

2. **Mutations \& Side Effects** — Are you properly calling API functions to trigger backend updates, not just reading data?

```javascript
// ✅ Correct: mutate via API
await Cart.addProductsToCart(items)

// ❌ Wrong: only reading, not synchronizing changes
```

3. **Container Composition** — Have you exhausted **slots** as an alternative? Slots might handle your use case without full API bypass.
4. **Performance** — Are you efficiently managing API calls and caching? Dropins handle this; custom implementations must too.

## Documentation Gaps

Here's the honest assessment: **Adobe's docs don't explicitly state "you should skip containers and use only APIs for custom frontends."** But they also don't prohibit it. This suggests:

- ✅ It's allowed and technically sound
- ⚠️ You're responsible for handling concerns containers normally manage (state sync, events, performance optimization)
- ⚠️ Less battle-tested in production scenarios


## Recommendation

**Your approach is correct, but formalize it:**

1. **Document your decision** — Record why containers weren't suitable (e.g., "ACO data model + design system require custom DOM structure")
2. **Implement event synchronization** — Treat your custom UI as a pseudo-container that listens to dropin events and remains synchronized
3. **Create an abstraction layer** — Build a thin wrapper around the APIs you're using to mimic the container interface, making it portable:

```javascript
// scripts/commerce-acо.js
export async function initializeACOCart() {
  // Your custom cart initialization using only APIs
  // Returns interface similar to Cart container
}
```

4. **Test the upgrade path** — If Adobe releases dropin updates, verify your direct API calls remain compatible
5. **Monitor Adobe's roadmap** — The Drop-in SDK is expanding (they just added SDK for creating custom dropins). Future versions might formalize the API-only pattern or provide better alternatives.

## Bottom Line

You're **not missing anything**. Direct API usage is a valid advanced pattern, especially given your ACO data source and design requirements. Just ensure you're handling state management, event synchronization, and performance optimization that containers normally handle invisibly.

Would you like me to review your specific implementation pattern or discuss how to structure the event synchronization layer?
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_16][^1_17][^1_18][^1_19][^1_20][^1_3][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/quick-start/

[^1_2]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/extend-or-create/

[^1_3]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/

[^1_4]: https://experienceleague.adobe.com/en/docs/commerce-operations/implementation-playbook/architecture/enterprise-blueprint

[^1_5]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/

[^1_6]: https://experienceleague.adobe.com/developer/commerce/storefront/get-started/architecture/

[^1_7]: https://adapt.to/2025/schedule/adobe-commerce-as-a-cloud-service-a-deep-dive-into-the-future-of-commerce

[^1_8]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/extending/

[^1_9]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/checkout/tutorials/multi-step/

[^1_10]: https://developer.adobe.com/commerce/docs/

[^1_11]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/styling/

[^1_12]: https://experienceleague.adobe.com/developer/commerce/storefront/sdk/reference/events/

[^1_13]: https://www.ranosys.com/blog/insights/how-adobe-commerce-optimizer-maximizes-store-performance/

[^1_14]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/events/

[^1_15]: https://experienceleague.adobe.com/developer/commerce/storefront/boilerplate/updates/

[^1_16]: https://experienceleague.adobe.com/developer/commerce/storefront/setup/launch/

[^1_17]: https://www.epam.com/insights/blogs/learnings-from-adobe-summit-2025-shaping-the-future-of-adobe-commerce

[^1_18]: https://business.adobe.com/summit/2025/sessions/adobe-commerce-2025-product-roadmap-review-s301.html

[^1_19]: https://business.adobe.com/summit/2025/sessions/a-progressive-approach-to-modernizing-your-adobe-s928.html

[^1_20]: https://www.valtech.com/en-us/blog/adobe-commerce-cloud-service-2025/


---

# Here’s a link to a page in a GitHub repository that has a login form which I would convert to use the authentication drop in:

https://github.com/skukla/buildright-eds/blob/main/pages/login.html

I have since converted this to a block, but I have not committed it yet. Are you able to determine, based on the structure of the login form and the associated CSS in the repository, how best to convert this to a drop in if I want to retain pixel perfect design?

I'm encountering issues retrieving the GitHub content directly. However, I can guide you through the process based on your situation. To give you the most precise recommendations, I need to understand a few specifics about your login form:

**Could you provide:**

1. **Form structure** — Is it:
    - A simple email/password form?
    - Does it include social login options?
    - Two-step flow (email first, then password)?
    - Custom fields beyond standard auth?
2. **Key design constraints** — What aspects must remain pixel-perfect?
    - Input field styling (borders, spacing, focus states)?
    - Button layout (full-width, side-by-side, custom sizing)?
    - Typography (font sizes, weights, line-height)?
    - Error message presentation?
    - Custom branding elements (logo, hero image)?
3. **Current block approach** — You mentioned converting to a block. Have you:
    - Explored the auth dropin's slot-based customization?
    - Attempted styling overrides via CSS variables?
    - Tested the dropin's default DOM output?

## General Strategy for Pixel-Perfect Auth Conversion

Based on typical design requirements, here's the decision tree:

### Option 1: Dropin Containers + Slots + CSS (RECOMMENDED)

**Use if:** Input styling and layout match the dropin's default structure with CSS overrides

```javascript
import { render as renderAuth } from '@dropins/tools/auth.js'

// Initialize dropin with theming/configuration
renderAuth(document.getElementById('auth-container'), {
  // Configuration options for style/behavior
  className: 'your-custom-auth-class'
})
```

**Pros:**

- Maintains event integration \& state sync
- Adobe upgrades benefit you automatically
- Smaller maintenance surface

**Cons:**

- Limited to dropin's DOM structure
- May require aggressive CSS overrides


### Option 2: Substitute Dropin + API Calls (YOUR CURRENT APPROACH)

**Use if:** Design requires complete DOM control or dropin slots are insufficient

```javascript
// Your custom auth form calls APIs directly
export async function handleLogin(email, password) {
  // Call auth API
  const response = await authenticateUser(email, password)
  // Emit events to keep ecosystem in sync
  eventBus.emit('auth/login', { user: response })
}
```

**Pros:**

- Complete design control
- No CSS constraints
- Clean separation of concerns

**Cons:**

- You manage all auth flows
- Not using Adobe's optimized component
- Upgrade path complexity


### Option 3: Hybrid Approach (BEST FOR PIXEL-PERFECT + MAINTAINABILITY)

**Use if:** Dropin can handle business logic but needs custom UI wrapper

```javascript
// Render dropin but hide its default UI
#auth-container {
  display: none; /* Hidden dropin for API access */
}

// Your custom form calls dropin methods
import { authenticate } from '@dropins/tools/auth.js'
const result = await authenticate(email, password)
```

**Pros:**

- Full design control
- Leverages Adobe's auth logic
- Maintains event integration
- Clean upgrade path

**Cons:**

- Slightly more setup
- May render unused DOM


## What I Need to Recommend Specifically

Can you paste or describe:

```html
<!-- Your login form structure -->
<!-- Key things I'm looking for:
     - Input wrapping structure
     - Error message placement
     - Button styling/variants
     - Any custom attributes or data-*
-->
```

And the CSS classes/patterns:

```css
/* Key styling patterns to understand:
   - Form container spacing
   - Input field styling (padding, borders, radius)
   - Focus/error states
   - Button styling
   - Any CSS variables you're using
*/
```

Once I see your actual markup and styles, I can give you specific guidance on:

1. Whether slots would work with CSS overrides
2. How to structure the hybrid approach most cleanly
3. What event listeners to wire up if you bypass containers
4. CSS override specificity needed to maintain design fidelity

Share those details and I can provide a more targeted conversion strategy.

---

# The main issue encountered was that I want the form container and the input fields in the form to look better than those provided by the drop-in experience. I expected to be able to control these look and feel with CSS and JavaScript, but there seems to be only one slot for the drop in which I believe is an error message.

Perfect — I've confirmed your finding. **The User Auth dropin has only ONE slot available** (`SuccessNotification`), and it provides **ZERO slots for customizing form containers or input fields.**[^3_1]

This is a **critical architectural limitation** that completely validates your approach. Here's what you're up against:

## Auth Dropin Slot Reality

According to official documentation:


| Container | Available Slots |
| :-- | :-- |
| `Form` | **None** |
| `useForm` | **None** |
| `Fields` | **None** |
| `SignIn` | `SuccessNotification` (post-auth only) |

**Translation:** You literally cannot customize the form structure, container, or input fields. The only slot is for what shows AFTER successful login.[^3_1]

## Why Design Token Overrides Fall Short

The branding documentation shows that design tokens work well for components with clean separation of concerns (buttons, spacing, colors). However, form inputs in the auth dropin are:

- Deeply nested in the component's internal structure
- Not exposed via slots
- Limited to design token customization for colors/spacing
- **Cannot change container layout, input structure, or wrapper elements**

This is different from other dropins (like User Account, which has 10 slots including `AddressFormInputs`) — the auth dropin is notably restrictive.[^3_2]

## Your Approach is Correct for This Use Case

Given this constraint, **your decision to bypass containers and use only the auth API is the right architectural choice.** Here's why:

✅ **Legitimate reasons to use API-only approach:**

- Form/input containers have NO slots for customization
- Design tokens alone cannot achieve pixel-perfect design fidelity
- SuccessNotification slot doesn't help with form presentation
- You need complete DOM control over the form experience


## Recommended Implementation Pattern

Since you're committed to the API-only path, here's how to structure it for maintainability:

```javascript
// src/scripts/commerce-auth.js
import { authenticate, signOut } from '@dropins/tools/auth.js'
import { eventBus } from '@dropins/tools/event-bus.js'

export const AuthAPI = {
  /**
   * Custom authentication wrapper
   * Calls dropin API but handles all UI rendering
   */
  async login(email, password) {
    try {
      const result = await authenticate(email, password)
      
      // Emit event for ecosystem sync
      eventBus.emit('auth/login', { user: result })
      
      return result
    } catch (error) {
      // Your custom error handling
      this.handleAuthError(error)
    }
  },

  async logout() {
    await signOut()
    eventBus.emit('auth/logout', {})
  },

  handleAuthError(error) {
    // Map auth errors to your design system
    console.error('Auth failed:', error)
  }
}

// src/blocks/login/login.js
export default function decorate(block) {
  block.innerHTML = `
    <form class="login-form">
      <div class="login-container">
        <input type="email" class="login-input" placeholder="Email" />
        <input type="password" class="login-input" placeholder="Password" />
        <button class="login-button">Sign In</button>
      </div>
      <div class="login-error-message" style="display:none;"></div>
    </form>
  `

  const form = block.querySelector('.login-form')
  const errorDiv = block.querySelector('.login-error-message')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = form.querySelector('input[type="email"]').value
    const password = form.querySelector('input[type="password"]').value
    
    const result = await AuthAPI.login(email, password)
    
    if (!result.success) {
      errorDiv.textContent = result.error
      errorDiv.style.display = 'block'
    } else {
      // Redirect or close modal
      window.location.href = '/'
    }
  })
}
```


## What You MUST Handle Yourself

Since you're not using the container, ensure you implement:

1. **Event synchronization** — Listen to auth events from the ecosystem

```javascript
eventBus.on('auth/login', (data) => {
  // Update your app state if needed
})
```

2. **State management** — The container normally manages loading states

```javascript
// Show loading state during auth attempt
button.disabled = true
button.textContent = 'Signing in...'
```

3. **Error handling** — Map auth API errors to your design

```javascript
try {
  await AuthAPI.login(email, password)
} catch (error) {
  // Your error UI
}
```

4. **Session persistence** — Verify the auth API sets auth tokens correctly

```javascript
// The API should handle this, but verify in dev tools
// Check localStorage/sessionStorage/cookies as appropriate
```


## This Is Not a Bug in Your Implementation

This is **a deliberate architectural limitation of the auth dropin.** Adobe prioritized security and standardization over customization for auth flows. Other dropins (cart, checkout, account) are more flexible because they're not security-critical paths.

## Going Forward

**Document this decision:**

```markdown
# Auth Dropin Implementation Notes

## Why API-only approach?
- Auth dropin exposes only 1 slot (SuccessNotification)
- Form/Fields/useForm containers have 0 customization points
- Cannot achieve pixel-perfect design with containers
- Design tokens insufficient for form UI requirements

## Implementation approach
- Call auth API directly from custom form components
- Emit events to maintain ecosystem synchronization
- Handle all error states and loading indicators
- Maintain session state management
```

Your instinct was right. The dropin wasn't designed for deep UI customization. You're implementing the correct pattern for this constraint.
<span style="display:none">[^3_10][^3_11][^3_12][^3_13][^3_14][^3_15][^3_16][^3_17][^3_18][^3_19][^3_20][^3_3][^3_4][^3_5][^3_6][^3_7][^3_8][^3_9]</span>

<div align="center">⁂</div>

[^3_1]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-auth/slots/

[^3_2]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-account/slots/

[^3_3]: https://developer.adobe.com/commerce/extensibility/app-development/examples/

[^3_4]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/branding/

[^3_5]: https://developer.adobe.com/commerce/pwa-studio/guides/general-concepts/extensibility/

[^3_6]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/

[^3_7]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/personalization/slots/

[^3_8]: https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/assets-view/aem-assets-view-ui-extensibility

[^3_9]: https://experienceleague.adobe.com/developer/commerce/storefront/get-started/architecture/

[^3_10]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/styling/

[^3_11]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/extending/

[^3_12]: https://experienceleague.adobe.com/developer/commerce/storefront/boilerplate/updates/

[^3_13]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/

[^3_14]: https://developer.adobe.com/commerce/extensibility/

[^3_15]: https://experienceleague.adobe.com/developer/commerce/storefront/releases/

[^3_16]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/customize/slots/

[^3_17]: https://experienceleague.adobe.com/en/docs/commerce-on-cloud/user-guide/configure/app/properties/variables-property

[^3_18]: https://experienceleaguecommunities.adobe.com/t5/adobe-experience-manager/aem-gems-building-storefronts-on-edge-delivery-services-with/m-p/652692

[^3_19]: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/slots/

[^3_20]: https://developer.adobe.com/commerce/frontend-core/guide/css/

