# Fragment Authoring Guide

**Audience**: Content Authors  
**Purpose**: Guide for creating and managing EDS fragments for personalized content  
**Last Updated**: November 17, 2025

---

## What Are Fragments?

Fragments are reusable content sections that can be:
- **Authored** in Google Docs or SharePoint (just like regular pages)
- **Used** across multiple pages
- **Updated** centrally (change once, update everywhere)
- **Personalized** based on user role or context

**Think of fragments as building blocks** - small, focused pieces of content that you can mix and match to create personalized experiences.

---

## Why Use Fragments?

### ✅ Benefits for Authors
- **No code required** - Author in familiar Google Docs interface
- **Instant updates** - Changes appear immediately after publishing
- **Reusable** - Create once, use everywhere
- **Personalized** - Different content for different user roles

### ✅ Benefits for Users
- **Relevant content** - See content tailored to their role
- **Consistent experience** - Same quality across all pages
- **Fast loading** - Fragments are optimized for performance

---

## Fragment Types in BuildRight

### 1. **Hero Fragments** (Role-Based)

**Purpose**: Main banner at the top of the homepage

**Fragments**:
- `hero-builder.html` - For builders (Sarah, Marcus, Lisa)
- `hero-specialty.html` - For specialty contractors (David)
- `hero-retail.html` - For retail managers (Kevin)
- `hero-default.html` - For unauthenticated visitors

**Content**:
- Welcome message with user's name
- Role-specific value proposition
- 3 key benefits
- 2 CTA buttons

**Example**: When Sarah (Production Builder) logs in, she sees `hero-builder.html` with:
- "Welcome Back, Sarah!"
- Benefits: Volume discounts, job site delivery, account manager
- CTAs: "View Dashboard" and "Browse Catalog"

---

### 2. **Features Fragments** (Role-Based)

**Purpose**: Showcase key features and benefits

**Fragments**:
- `features-builder.html` - Builder-specific features
- `features-specialty.html` - Specialty contractor features
- `features-retail.html` - Retail manager features

**Content**:
- Section heading
- 4 feature cards with images, badges, titles, and descriptions

**Example**: `features-builder.html` highlights:
- Volume Discounts
- Project Tracking
- Reusable Templates
- Account Manager

---

### 3. **CTA Fragments** (Use-Case-Based)

**Purpose**: Call-to-action sections tailored to user's workflow

**Fragments**:
- `cta-templates.html` - For template-based ordering (Sarah)
- `cta-projects.html` - For project-based ordering (Marcus)
- `cta-packages.html` - For package-based ordering (Lisa)
- `cta-diy.html` - For DIY workflows (David)
- `cta-restock.html` - For restock workflows (Kevin)

**Content**:
- Compelling headline
- Brief description
- 2 CTA buttons

**Example**: `cta-templates.html` for Sarah:
- "Ready to Order from Your Templates?"
- CTAs: "View My Templates" and "Browse Catalog"

---

### 4. **Shared Fragments** (Universal)

**Purpose**: Content used across all roles

**Fragments**:
- `footer-buildright.html` - Site footer
- `support-links.html` - Help and support section
- `legal-disclaimer.html` - Demo notice
- `promo-banner.html` - Promotional announcements

**Content**: Same for all users

---

## How to Create a Fragment

### Step 1: Create Document in Google Docs

1. Navigate to the `/fragments/` folder in Google Drive
2. Create a new Google Doc
3. Name it using the convention: `[type]-[role/use-case].gdoc`
   - Example: `hero-builder.gdoc`
   - Example: `cta-templates.gdoc`

### Step 2: Author the Content

Use standard EDS authoring patterns:

**Example: Hero Fragment**

```
| Hero |
|------|
| Welcome Back, [Name]! |
| Your personalized catalog is ready with volume pricing and project-specific recommendations. |
| ![Builder Hero](https://images.unsplash.com/photo-1541888946425-d81bb19240f5) |
| [View Dashboard](/pages/dashboard.html) |
| [Browse Catalog](/pages/catalog.html) |
```

**Key Points**:
- Use EDS block syntax (tables)
- Include descriptive alt text for images
- Use relative URLs for internal links
- Keep content focused and concise

### Step 3: Preview the Fragment

1. Install the AEM Sidekick browser extension
2. Open your fragment document
3. Click "Preview" in the Sidekick
4. Review the rendered HTML

### Step 4: Publish the Fragment

1. Click "Publish" in the AEM Sidekick
2. Fragment is now live and will appear on pages that reference it
3. No code deployment needed!

---

## Fragment Best Practices

### Content Guidelines

✅ **DO**:
- Keep fragments focused on a single purpose
- Use semantic HTML (proper heading hierarchy)
- Include descriptive alt text for all images
- Use relative URLs for internal links (e.g., `/pages/catalog.html`)
- Write clear, action-oriented CTAs
- Test on mobile, tablet, and desktop

❌ **DON'T**:
- Mix multiple unrelated sections in one fragment
- Use inline styles (use EDS classes instead)
- Hardcode absolute URLs (use relative paths)
- Include page-specific metadata
- Use emojis in production content (except promo banners)
- Create fragments larger than 50KB

### Performance Tips

- **Optimize images** before adding to fragments
  - Recommended: 1200px wide for hero images
  - Use WebP format when possible
  - Compress to < 200KB per image
- **Keep HTML lightweight** (< 50KB per fragment)
- **Avoid embedding videos** directly (use links instead)
- **Use lazy loading** for images below the fold

### Accessibility

- **Heading hierarchy**: Use H1 → H2 → H3 in order
- **Alt text**: Describe what's in the image, not "image of..."
- **Link text**: Use descriptive text, not "click here"
- **Color contrast**: Ensure text is readable (4.5:1 ratio minimum)
- **Focus states**: Don't remove button/link outlines

---

## Role-Based Fragment Mapping

| User Role | Hero Fragment | Features Fragment | CTA Fragment |
|-----------|---------------|-------------------|--------------|
| **Builder** (Sarah, Marcus, Lisa) | `hero-builder.html` | `features-builder.html` | `cta-templates.html` (Sarah)<br>`cta-projects.html` (Marcus)<br>`cta-packages.html` (Lisa) |
| **Specialty** (David) | `hero-specialty.html` | `features-specialty.html` | `cta-diy.html` |
| **Retail** (Kevin) | `hero-retail.html` | `features-retail.html` | `cta-restock.html` |
| **Unauthenticated** | `hero-default.html` | _(none)_ | _(none)_ |

**Key Insight**: Multiple personas can share the same role-based fragments. This reduces duplication while still providing personalized experiences.

---

## Dynamic Personalization

Fragments can include placeholders that are replaced with user-specific data at runtime:

### Available Placeholders

- `<span data-persona-name>Default Name</span>` - User's first name
- `<span data-persona-company>Company</span>` - User's company name
- `<span data-persona-role>Role</span>` - User's role/title

**Example**:

```html
<h1>Welcome Back, <span data-persona-name>Builder</span>!</h1>
```

When Sarah logs in, this becomes:
```html
<h1>Welcome Back, Sarah!</h1>
```

**Note**: Placeholders are replaced by JavaScript after the fragment loads.

---

## Testing Your Fragments

### Before Publishing

1. **Preview in Sidekick** - Check rendering
2. **Validate links** - Ensure all links work
3. **Check images** - Verify images load and have alt text
4. **Test responsive** - View on mobile, tablet, desktop
5. **Accessibility check** - Use browser dev tools
6. **Proofread** - Check spelling and grammar

### After Publishing

1. **Clear cache** - Force refresh (Cmd+Shift+R / Ctrl+Shift+F5)
2. **Test on live site** - Verify fragment appears correctly
3. **Test with different roles** - If role-based, test each role
4. **Check page load speed** - Ensure no performance issues

---

## Updating Fragments

### To Update a Fragment:

1. Open the fragment document in Google Docs
2. Make your changes
3. Preview in Sidekick to verify
4. Publish when ready
5. Changes appear on **all pages** using that fragment

**No code changes required!**

### Version Control

- EDS automatically tracks versions in Google Docs
- Use "Version History" in Google Docs to see changes
- You can revert to previous versions if needed

---

## Common Use Cases

### Use Case 1: Update Promotional Banner

**Scenario**: Change the promotional offer for Black Friday

**Steps**:
1. Open `promo-banner.gdoc`
2. Update the offer text and code
3. Publish
4. Banner updates on all pages immediately

**Time**: < 5 minutes

---

### Use Case 2: Add New Feature to Builder Hero

**Scenario**: Highlight a new "Express Delivery" feature

**Steps**:
1. Open `hero-builder.gdoc`
2. Add a new feature bullet: "Express delivery in 24 hours"
3. Publish
4. All builders see the new feature on next page load

**Time**: < 5 minutes

---

### Use Case 3: A/B Test Different CTAs

**Scenario**: Test "View Dashboard" vs "Get Started"

**Steps**:
1. Create `hero-builder-test.gdoc` with new CTA
2. Ask developer to route 50% of traffic to test fragment
3. Monitor conversion rates
4. Publish winning version to `hero-builder.gdoc`

**Time**: Setup 10 minutes, test 1-2 weeks

---

## Troubleshooting

### Fragment Not Appearing

**Possible Causes**:
- Fragment not published (check Sidekick)
- Browser cache (force refresh)
- Incorrect fragment name (check spelling)
- Network issue (check console for errors)

**Solution**: Publish fragment, clear cache, verify name

---

### Fragment Looks Different Than Preview

**Possible Causes**:
- CSS not loaded yet
- JavaScript personalization pending
- Browser compatibility issue

**Solution**: Wait 1-2 seconds for full load, test in different browser

---

### Fragment Loading Slowly

**Possible Causes**:
- Large images (> 500KB)
- Too much content (> 50KB HTML)
- External resources not loading

**Solution**: Optimize images, reduce content, use CDN for images

---

## Getting Help

### For Content Questions:
- Review this guide
- Check existing fragments for examples
- Ask the content team lead

### For Technical Issues:
- Contact the development team
- Include: fragment name, page URL, error message
- Attach screenshot if applicable

### For New Fragment Requests:
- Submit via project board
- Include: purpose, target role, content outline
- Development team will create template

---

## Fragment Naming Conventions

### Format: `[type]-[role/use-case].html`

**Type**:
- `hero` - Hero banners
- `features` - Feature highlights
- `cta` - Call-to-action sections
- `footer` - Footer content
- `promo` - Promotional banners

**Role** (for role-based fragments):
- `builder` - All builders
- `specialty` - Specialty contractors
- `retail` - Retail managers
- `default` - Unauthenticated

**Use-Case** (for use-case-based fragments):
- `templates` - Template workflows
- `projects` - Project workflows
- `packages` - Package workflows
- `diy` - DIY workflows
- `restock` - Restock workflows

**Examples**:
- `hero-builder.html` ✅
- `cta-templates.html` ✅
- `footer-buildright.html` ✅
- `hero-sarah.html` ❌ (too specific, use role instead)

---

## Summary

**Fragments enable**:
- ✅ Author-managed personalized content
- ✅ Instant updates without code changes
- ✅ Reusable content across pages
- ✅ Role-based experiences

**Remember**:
- Author in Google Docs
- Use EDS block syntax
- Publish via Sidekick
- Changes appear everywhere instantly

**Questions?** Contact the content team or development team for support.

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Maintained By**: BuildRight Content Team

