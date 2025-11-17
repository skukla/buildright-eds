# Phase 10: Authoring Transition

**Status**: 📋 Planned (Not Yet Started)  
**Duration**: 3-4 weeks  
**Dependencies**: Phase 9 (Production Deployment)  
**Priority**: Optional (for content team enablement)

---

## Overview

Phase 10 transitions BuildRight from **programmatic authoring** (JavaScript-controlled blocks) to **document-based authoring** (Google Docs/SharePoint) with **Universal Editor** support, enabling content creators to manage and update pages without developer involvement.

**Current State** (Phase 9):
- ✅ Blocks controlled by JavaScript
- ✅ Data from ACO via API Mesh
- ✅ Developers create/update content
- ❌ Content creators cannot edit pages

**Target State** (Phase 10):
- ✅ Blocks authored in Google Docs/SharePoint
- ✅ Content creators edit via Universal Editor
- ✅ Data still from ACO (for commerce features)
- ✅ Hybrid approach: author-driven content + data-driven commerce

---

## Why This Transition?

### Current Limitations (Programmatic Authoring)

**❌ Developer Dependency**
- Content changes require code updates
- No self-service for content team
- Slow iteration on messaging/copy

**❌ No Visual Editing**
- Can't preview changes in context
- Must deploy to see results
- No WYSIWYG experience

**❌ Limited Content Management**
- No version history for content
- No approval workflows
- No content scheduling

### Benefits of Document-Based Authoring

**✅ Content Team Empowerment**
- Edit pages in familiar tools (Google Docs)
- Visual editing via Universal Editor
- No developer required for content updates

**✅ Faster Iteration**
- Preview changes instantly
- A/B test messaging easily
- Update copy without deployment

**✅ Enterprise Content Management**
- Version history in Google Drive/SharePoint
- Approval workflows
- Content scheduling
- Multi-language support

---

## Scope: What to Transition

### ✅ Should Transition (Content-Driven)

These blocks should become author-editable:

| Block | Current | Target | Reason |
|-------|---------|--------|--------|
| **Hero Banners** | Programmatic | Document-based | Marketing content changes frequently |
| **Feature Grids** | Programmatic | Document-based | Feature messaging needs flexibility |
| **Text Sections** | Programmatic | Document-based | Copy updates common |
| **Footer** | Programmatic | Document-based | Links/legal text changes |
| **Promotional Banners** | Programmatic | Document-based | Campaign-driven content |
| **FAQ Sections** | Programmatic | Document-based | Questions/answers evolve |
| **Testimonials** | Programmatic | Document-based | Customer stories rotate |

### ❌ Should NOT Transition (Data-Driven)

These blocks should remain programmatic:

| Block | Reason |
|-------|--------|
| **Product Tiles** | Data from ACO, complex pricing logic |
| **Template Cards** | Dynamic template data, user selection |
| **Wizard Progress** | Interactive state management |
| **Package Comparison** | Dynamic pricing, user selection |
| **Loading Overlay** | Runtime loading states |
| **Pricing Display** | Real-time pricing from ACO |
| **Inventory Status** | Real-time inventory from ACO |
| **Cart** | Commerce Dropin, complex state |
| **Checkout** | Commerce Dropin, payment integration |

### 🔄 Hybrid Approach (Both)

These blocks have both content and data:

| Block | Content (Author) | Data (Programmatic) |
|-------|------------------|---------------------|
| **Product Grid** | Page title, filters, layout | Products from ACO |
| **PDP** | Product description, specs | Pricing, inventory from ACO |
| **Dashboard Header** | Welcome message, navigation | User name, account data |

---

## Implementation Strategy

### Phase 10A: Document-Based Authoring (2 weeks)

**Objective**: Enable content creators to author pages in Google Docs

#### Task 1: Set Up Document Sources
**Duration**: 2 days

1. **Create Google Drive Folder Structure**
   ```
   BuildRight Content/
   ├── Home Page/
   │   ├── hero.docx
   │   ├── features.docx
   │   └── testimonials.docx
   ├── Catalog Page/
   │   ├── header.docx
   │   └── filters.docx
   ├── Persona Pages/
   │   ├── sarah-dashboard.docx
   │   ├── marcus-dashboard.docx
   │   └── ...
   └── Shared/
       ├── footer.docx
       └── navigation.docx
   ```

2. **Configure EDS Project**
   ```json
   // fstab.yaml
   mountpoints:
     /: https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

3. **Set Up Sidekick**
   - Install AEM Sidekick Chrome extension
   - Configure project URL
   - Enable preview/publish workflow

#### Task 2: Refactor Content Blocks to Read DOM
**Duration**: 5 days

**Example: Hero Banner**

**Before (Programmatic)**:
```javascript
export default function decorate(block) {
  block.innerHTML = `
    <h1>Welcome to BuildRight</h1>
    <p>Professional building supplies for every project</p>
    <button>Shop Now</button>
  `;
}
```

**After (Document-Based)**:

**Author creates in Google Docs**:
```
Hero
Welcome to BuildRight
Professional building supplies for every project
https://buildright.com/catalog | Shop Now
```

**Block decorates existing DOM**:
```javascript
export default function decorate(block) {
  // Read existing DOM structure (from author content)
  const rows = block.querySelectorAll(':scope > div');
  const [titleRow, descRow, ctaRow] = rows;
  
  // Extract content
  const title = titleRow.querySelector('div').textContent;
  const description = descRow.querySelector('div').textContent;
  const link = ctaRow.querySelector('a');
  
  // Enhance structure
  block.innerHTML = `
    <div class="hero-content">
      <h1>${title}</h1>
      <p>${description}</p>
      <a href="${link.href}" class="btn btn-primary">${link.textContent}</a>
    </div>
  `;
}
```

**Blocks to Refactor**:
1. Hero banner
2. Feature grid
3. Text sections
4. Footer
5. Promotional banners
6. FAQ sections
7. Testimonials

#### Task 3: Create Author Documentation
**Duration**: 2 days

**Deliverable**: `AUTHOR-GUIDE.md`

**Contents**:
- How to create pages in Google Docs
- Block syntax and examples
- Image guidelines
- Link formatting
- Preview and publish workflow
- Troubleshooting common issues

#### Task 4: Content Migration
**Duration**: 3 days

1. **Identify Existing Content**
   - Audit all hardcoded content
   - Extract to spreadsheet

2. **Create Google Docs**
   - One doc per page section
   - Follow block syntax
   - Add images from DAM

3. **Test and Validate**
   - Preview each page
   - Verify block decoration
   - Check responsive behavior

4. **Publish**
   - Publish all docs
   - Verify live site
   - Update internal links

---

### Phase 10B: Universal Editor Integration (1-2 weeks)

**Objective**: Enable visual editing with Universal Editor

#### Task 1: Configure Universal Editor
**Duration**: 2 days

1. **Update EDS Project Configuration**
   ```javascript
   // head.html
   <script src="https://experience.adobe.com/solutions/CQ-universal-editor/1.0/universal-editor-embedded.js" async></script>
   ```

2. **Add Block Instrumentation**
   ```javascript
   // Each block needs data attributes for Universal Editor
   export default function decorate(block) {
     block.setAttribute('data-aue-resource', 'urn:aem:/content/buildright/hero');
     block.setAttribute('data-aue-type', 'component');
     block.setAttribute('data-aue-label', 'Hero Banner');
     
     // ... decoration logic
   }
   ```

3. **Configure Content Sources**
   ```json
   // .aem/config.json
   {
     "contentSources": {
       "google": {
         "type": "googledrive",
         "folderId": "[FOLDER_ID]"
       }
     }
   }
   ```

#### Task 2: Enable In-Context Editing
**Duration**: 3 days

**Add Editable Regions**:
```javascript
export default function decorate(block) {
  const title = block.querySelector('h1');
  
  // Make title editable in Universal Editor
  title.setAttribute('data-aue-prop', 'title');
  title.setAttribute('data-aue-type', 'text');
  title.setAttribute('data-aue-label', 'Hero Title');
  
  const description = block.querySelector('p');
  description.setAttribute('data-aue-prop', 'description');
  description.setAttribute('data-aue-type', 'richtext');
  description.setAttribute('data-aue-label', 'Hero Description');
}
```

**Editable Properties**:
- Text fields (headings, paragraphs)
- Rich text (formatted content)
- Images (with DAM picker)
- Links (with URL validation)
- Component properties (layout, style variants)

#### Task 3: Create Component Library
**Duration**: 2 days

**Deliverable**: Component palette in Universal Editor

**Components to Register**:
1. Hero (multiple variants)
2. Feature grid (2-col, 3-col, 4-col)
3. Text section (left-aligned, centered, right-aligned)
4. Image + text (image left, image right)
5. CTA banner
6. Testimonial card
7. FAQ accordion

**Component Definition**:
```json
{
  "id": "hero",
  "title": "Hero Banner",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "buildright/components/hero",
        "template": {
          "title": "Hero Title",
          "description": "Hero Description",
          "cta": {
            "text": "Call to Action",
            "url": "/catalog"
          }
        }
      }
    }
  }
}
```

#### Task 4: Author Training
**Duration**: 2 days

**Training Sessions**:
1. **Universal Editor Basics** (1 hour)
   - Navigation and interface
   - Editing text and images
   - Adding/removing components
   - Preview and publish

2. **BuildRight Components** (1 hour)
   - Available components
   - Component properties
   - Layout options
   - Best practices

3. **Hands-On Practice** (2 hours)
   - Create a new page
   - Edit existing content
   - Add images from DAM
   - Publish changes

**Deliverable**: `UNIVERSAL-EDITOR-GUIDE.md`

---

## Hybrid Architecture

### Content Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Content Authors                       │
│  (Google Docs / SharePoint / Universal Editor)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Edge Delivery Services                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Author-Driven Blocks (Document-Based)           │  │
│  │  - Hero banners                                   │  │
│  │  - Feature grids                                  │  │
│  │  - Text sections                                  │  │
│  │  - Footer                                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Data-Driven Blocks (Programmatic)               │  │
│  │  - Product tiles ──────┐                         │  │
│  │  - Pricing display     │                         │  │
│  │  - Cart/Checkout       │                         │  │
│  └────────────────────────┼──────────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Mesh       │
                    │   (GraphQL)      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Adobe Commerce   │
                    │      + ACO       │
                    └──────────────────┘
```

### Block Decision Matrix

| Block Type | Authoring Method | Data Source | Editing Tool |
|------------|------------------|-------------|--------------|
| **Marketing Content** | Document-based | Google Docs | Universal Editor |
| **Commerce Features** | Programmatic | ACO/Commerce | Code |
| **Hybrid (e.g., PDP)** | Both | Both | Both |

---

## Migration Checklist

### Pre-Migration
- [ ] Audit all existing content
- [ ] Identify blocks to transition
- [ ] Set up Google Drive/SharePoint
- [ ] Configure EDS project
- [ ] Install Sidekick extension

### Block Refactoring
- [ ] Refactor hero banner to read DOM
- [ ] Refactor feature grid to read DOM
- [ ] Refactor text sections to read DOM
- [ ] Refactor footer to read DOM
- [ ] Refactor promotional banners to read DOM
- [ ] Refactor FAQ sections to read DOM
- [ ] Refactor testimonials to read DOM

### Content Migration
- [ ] Create Google Docs for all pages
- [ ] Migrate existing content
- [ ] Add images to DAM
- [ ] Test preview for all pages
- [ ] Publish all pages
- [ ] Verify live site

### Universal Editor Setup
- [ ] Configure Universal Editor
- [ ] Add block instrumentation
- [ ] Enable in-context editing
- [ ] Create component library
- [ ] Test editing workflow
- [ ] Train content team

### Validation
- [ ] All pages render correctly
- [ ] All blocks decorate properly
- [ ] Universal Editor works
- [ ] Content team can edit
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## Success Criteria

### Functional
- ✅ Content creators can edit pages in Google Docs
- ✅ Content creators can edit pages in Universal Editor
- ✅ Changes preview instantly
- ✅ Changes publish to live site
- ✅ All blocks decorate correctly from authored content
- ✅ Commerce features still work (products, pricing, cart)

### Performance
- ✅ Page load time < 2s (same as before)
- ✅ Block decoration < 15ms (same as before)
- ✅ No regression in Core Web Vitals

### Usability
- ✅ Content team trained and confident
- ✅ Documentation clear and comprehensive
- ✅ Editing workflow intuitive
- ✅ No developer required for content updates

---

## Risks and Mitigation

### Risk 1: Content Team Adoption
**Risk**: Content team struggles with new workflow  
**Mitigation**: 
- Comprehensive training
- Clear documentation
- Ongoing support
- Start with simple pages

### Risk 2: Block Decoration Complexity
**Risk**: Refactored blocks don't handle all author inputs  
**Mitigation**:
- Thorough testing
- Validation rules
- Error handling
- Fallback content

### Risk 3: Performance Regression
**Risk**: Document-based authoring slower than programmatic  
**Mitigation**:
- Performance testing
- Optimization
- Caching strategy
- Monitor Core Web Vitals

### Risk 4: Hybrid Complexity
**Risk**: Mix of document-based and programmatic confusing  
**Mitigation**:
- Clear documentation
- Decision matrix
- Consistent patterns
- Team alignment

---

## Timeline

### Phase 10A: Document-Based Authoring (2 weeks)
```
Week 1:
- Day 1-2: Set up document sources
- Day 3-5: Refactor content blocks (hero, features, text)
- Day 6-7: Refactor remaining blocks (footer, banners, FAQ)

Week 2:
- Day 8-9: Create author documentation
- Day 10-12: Content migration
- Day 13-14: Testing and validation
```

### Phase 10B: Universal Editor (1-2 weeks)
```
Week 3:
- Day 15-16: Configure Universal Editor
- Day 17-19: Enable in-context editing
- Day 20-21: Create component library

Week 4:
- Day 22-23: Author training
- Day 24-25: Hands-on practice and support
- Day 26-28: Final testing and documentation
```

**Total Duration**: 3-4 weeks

---

## Deliverables

### Code
- [ ] Refactored blocks (7 blocks)
- [ ] Universal Editor instrumentation
- [ ] Component library definitions

### Content
- [ ] Google Docs for all pages
- [ ] Migrated content
- [ ] Images in DAM

### Documentation
- [ ] `AUTHOR-GUIDE.md` - How to author in Google Docs
- [ ] `UNIVERSAL-EDITOR-GUIDE.md` - How to use Universal Editor
- [ ] `BLOCK-AUTHORING-REFERENCE.md` - Block syntax reference
- [ ] `HYBRID-ARCHITECTURE.md` - Document-based vs programmatic

### Training
- [ ] Training materials
- [ ] Video tutorials
- [ ] Quick reference guides
- [ ] Support documentation

---

## Post-Migration

### Ongoing Support
- Weekly office hours for content team
- Slack channel for questions
- Regular check-ins
- Continuous improvement

### Monitoring
- Track content update frequency
- Monitor page performance
- Gather content team feedback
- Identify optimization opportunities

### Iteration
- Add new components as needed
- Refine editing experience
- Optimize performance
- Expand Universal Editor capabilities

---

## Related Documents

- `EDS-BLOCK-PATTERNS.md` - Standard EDS patterns
- `EDS-PATTERN-DEVIATIONS.md` - Programmatic pattern justification
- `PHASE-9-PRODUCTION-DEPLOYMENT.md` - Production deployment
- `IMPLEMENTATION-ROADMAP.md` - Overall roadmap

---

## Conclusion

Phase 10 is **optional but recommended** for long-term content management. It enables:

✅ **Content team empowerment** - Self-service editing  
✅ **Faster iteration** - No developer for content updates  
✅ **Better content management** - Version history, workflows  
✅ **Visual editing** - WYSIWYG with Universal Editor  
✅ **Hybrid approach** - Best of both worlds

**When to do Phase 10**:
- After Phase 9 (production deployment) is stable
- When content team is ready to take ownership
- When content update frequency justifies investment
- When visual editing would improve workflow

**When to skip Phase 10**:
- Demo-only implementation (no ongoing content updates)
- Developer-managed content is acceptable
- Budget/timeline constraints
- Content rarely changes

---

**Last Updated**: November 17, 2025  
**Status**: Planned (awaiting Phase 9 completion)

