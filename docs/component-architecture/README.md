# Component Extraction & EDS Blocks: Complete Documentation Index

**Last Updated:** December 6, 2025  
**Status:** Research Complete, Implementation Scheduled for Phase 7  
**Implementation Phase:** [Phase 7: Integration & Polish](../phase-6/B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md#task-5-component-extraction--refactoring--new)

## Document Organization

This index organizes all component extraction and EDS block research documents created during the architectural analysis phase.

**⏰ When to Implement:** After completing all persona implementations (Phase 6A-6E), component extraction will occur during **Phase 7: Integration & Polish**. This ensures patterns are proven across multiple use cases before extraction.

**📍 Current Phase:** Phase 6A (Sarah's Dashboard) - Use this documentation as **reference material** when designing. Do NOT extract components yet.

---

## 📚 Core Documentation (Read in Order)

### 1. **START HERE: EDS Blocks Summary**
**File:** `docs/EDS-BLOCKS-SUMMARY.md`  
**Purpose:** Quick-start guide to understanding EDS blocks and how they relate to your component work  
**Reading Time:** 10 minutes  
**Key Takeaways:**
- What EDS blocks are (in plain language)
- Utility vs. Block decision tree
- Red flags and green lights
- Your current work is fundamentally aligned!

**Next:** Read the full analysis document below

---

### 2. **Deep Dive: EDS Blocks vs. Component Extraction Analysis**
**File:** `docs/EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md`  
**Purpose:** Comprehensive research report on how your component extraction approach aligns with Adobe EDS block philosophy  
**Reading Time:** 45-60 minutes  
**Sections:**
1. What Are EDS Blocks? (Official Definition)
2. Your Component Extraction Approach
3. How Your Approach Maps to EDS Blocks
4. The Philosophy Gap (David's Model)
5. Recommended Alignment Strategy
6. Practical Recommendations
7. Your Specific Components Analyzed
8. Migration Path & Implementation Priorities
9. Key Takeaways & Decision Framework
10. Next Steps & Deliverables

**Key Deliverables:**
- Decision tree for utility vs. block classification
- Phase-by-phase implementation plan
- Analysis of all your top component opportunities
- EDS block checklist

**Next:** Review your original audit documents with new context

---

## 🔍 Original Audit Documents (Your Foundation Work)

### 3. **Component Extraction Opportunities**
**File:** `docs/COMPONENT-EXTRACTION-OPPORTUNITIES.md`  
**Purpose:** Comprehensive audit of all reusable UI patterns identified in the codebase  
**Created:** December 6, 2025  
**Components Identified:** 47 total opportunities across 8 categories

**Categories:**
- Loading States & Spinners
- Cards & Card Patterns
- Buttons & Actions
- Forms & Inputs
- Badges & Status Indicators
- Photo Tiles & Image Patterns
- Modals & Overlays
- Tables & Data Display

**Read this NOW with EDS context:**
- Which patterns should be **utilities**?
- Which should be **blocks**?
- Which need **auto-blocking**?

---

### 4. **Component Extraction Quick Reference**
**File:** `docs/COMPONENT-EXTRACTION-QUICK-REFERENCE.md`  
**Purpose:** At-a-glance guide to all identified components with usage examples  
**Format:** Quick-lookup tables and code snippets

**Use for:**
- Rapid reference during development
- Choosing the right pattern for a use case
- Understanding existing component usage

**Update needed:**
- Add "Type" column (Utility/Block/Function)
- Add "EDS Alignment" notes
- Link to block implementations

---

### 5. **Component Extraction Roadmap**
**File:** `docs/COMPONENT-EXTRACTION-ROADMAP.md`  
**Purpose:** Visual timeline and priority matrix for component development  
**Status:** **NEEDS UPDATE** based on EDS block research

**Current Priorities (Pre-EDS Research):**
- Phase 1: Critical Foundation (Weeks 1-2)
- Phase 2: Data-Driven Components (Weeks 3-6)
- Phase 3: Interaction & State (Weeks 7-10)
- Phase 4: Optimization & Polish (Weeks 11-12)

**Updates needed:**
- Reclassify components as Utilities/Blocks/Functions
- Reorder priorities based on EDS patterns
- Add content model development tasks
- Add auto-blocking opportunities

---

### 6. **Component Extraction Executive Summary**
**File:** `docs/COMPONENT-EXTRACTION-SUMMARY.md`  
**Purpose:** High-level overview and business case for component extraction  
**Audience:** Stakeholders, project managers

**Key Metrics:**
- Development time savings
- Maintenance improvements
- Code reuse percentages

**Status:** Still valid—proves value of the work. Just needs EDS context added to recommendations.

---

## 📖 Adobe EDS Official Resources

### Official Documentation (External Links)

1. **[David's Model, Second Take](https://www.aem.live/docs/davidsmodel)**
   - **CRITICAL READING**
   - Content modeling philosophy
   - 14 rules for creating intuitive authoring experiences
   - Answers most "should this be a block?" questions

2. **[Exploring Blocks](https://www.aem.live/docs/exploring-blocks)**
   - Official introduction to blocks
   - How blocks work (authoring → rendering)
   - Simple examples (accordion, quote, etc.)

3. **[Block Collection](https://www.aem.live/developer/block-collection)**
   - Reference implementations
   - 20+ production-tested blocks
   - Content models and code examples
   - **Use these as blueprints!**

4. **[Markup, Sections, Blocks, Auto-Blocking](https://www.aem.live/developer/markup-sections-blocks)**
   - Technical deep dive
   - DOM structure and transformations
   - Auto-blocking patterns
   - Section metadata

5. **[Web Components in EDS](https://www.aem.live/developer/web-components)**
   - When to use web components (rarely!)
   - Performance implications
   - Integration patterns

6. **[Universal Editor Blocks](https://www.aem.live/developer/universal-editor-blocks)**
   - Creating blocks for WYSIWYG authoring
   - Content model JSON structure
   - Field types and options

7. **[Authoring and Publishing](https://www.aem.live/docs/authoring)**
   - Content creator perspective
   - How authors use blocks
   - Preview/publish workflow

---

## 🎯 Next Steps Checklist

### This Week (Week of Dec 9)

- [ ] **Read** `EDS-BLOCKS-SUMMARY.md` (entire team)
- [ ] **Review** `EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md` (lead developers)
- [ ] **Read** [David's Model](https://www.aem.live/docs/davidsmodel) (everyone)
- [ ] **Classify** all 47 components using decision tree
- [ ] **Update** `COMPONENT-EXTRACTION-ROADMAP.md` with new classifications

### Next Sprint (Week of Dec 16)

- [ ] **Create** content models for top 5 blocks
- [ ] **Refactor** `product-tile` as reference implementation
- [ ] **Document** utility class patterns in pattern library
- [ ] **Implement** first auto-block (breadcrumbs or article-header)

### Ongoing

- [ ] **Review** new components against decision tree before implementation
- [ ] **Test** blocks for authoring ease (can non-dev use it?)
- [ ] **Measure** performance impact (maintain 100 Lighthouse scores)
- [ ] **Document** patterns in block library as you go

---

## 🗂️ File Organization

```
docs/
├── COMPONENT-DOCS-INDEX.md              ← You are here
│
├── EDS-BLOCKS-SUMMARY.md                ← Start here (10 min read)
├── EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md ← Full analysis (45 min read)
│
├── COMPONENT-EXTRACTION-OPPORTUNITIES.md ← Original audit (needs reclassification)
├── COMPONENT-EXTRACTION-QUICK-REFERENCE.md ← Quick lookup (needs update)
├── COMPONENT-EXTRACTION-ROADMAP.md      ← Timeline (needs update)
└── COMPONENT-EXTRACTION-SUMMARY.md      ← Business case (still valid)
```

---

## 📊 Research Summary

### What We Learned

1. **Your component extraction work is fundamentally sound**
   - Patterns you identified ARE the building blocks of EDS
   - Architecture instincts are correct
   - Just need proper classification

2. **Not everything should be a block**
   - ~40% should be CSS utilities (buttons, badges, spinners)
   - ~30% should be EDS blocks (product tiles, cards, hero)
   - ~20% should be shared functions (quantity controls, modals)
   - ~10% should be auto-blocks (breadcrumbs, article headers)

3. **You already have one perfect block**
   - `product-tile` is already a proper EDS block
   - Just needs content model JSON added
   - Use it as reference for others

4. **David's Model is the guide**
   - Blocks are NOT always better than default content
   - Simpler authoring experience wins
   - Nested blocks are anti-pattern
   - Context inheritance (colors, sizes) is key

5. **Performance is built-in**
   - EDS three-phase loading (E-L-D)
   - Edge delivery architecture
   - 100 Lighthouse scores by default
   - Just don't break it with heavy blocks!

### Key Decision Points Answered

**Q: Should I make everything a component?**  
A: No. Use utilities for presentation, blocks for authored content.

**Q: How many blocks should I have?**  
A: 10-15 core blocks. More = authoring complexity.

**Q: Can I nest blocks?**  
A: No. Use sections, fragments, or auto-blocks instead.

**Q: When do I use web components?**  
A: Rarely. Only for truly self-contained, portable widgets.

**Q: Is my product-tile component correct?**  
A: Yes! Just add content model JSON for authoring.

---

## 🎓 Team Training Resources

### For Developers

**Read in order:**
1. EDS-BLOCKS-SUMMARY.md (this repo)
2. [Exploring Blocks](https://www.aem.live/docs/exploring-blocks)
3. [David's Model](https://www.aem.live/docs/davidsmodel)
4. [Block Collection](https://www.aem.live/developer/block-collection)
5. EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md (this repo)

**Practice:**
- Build a simple block (quote, card)
- Add content model JSON
- Test authoring in Google Docs
- Review against David's Model rules

### For Content Authors

**Read:**
- [Authoring and Publishing](https://www.aem.live/docs/authoring)
- [Using AEM Sidekick](https://www.aem.live/docs/sidekick)

**Try:**
- Create a test document
- Add a simple block (table format)
- Preview in browser
- Understand authoring → rendering flow

### For Project Managers

**Understand:**
- Component extraction = architectural investment (good!)
- Blocks = authorable components (great for velocity!)
- Utilities = design system (consistency!)
- Timeline: Utilities first (2 weeks), Blocks next (4-6 weeks)

**Expected outcomes:**
- Faster page creation (authors self-serve)
- Consistent design (utilities enforce patterns)
- Less developer bottleneck (reusable blocks)
- Better performance (EDS architecture)

---

## 🚀 Success Metrics

### Developer Velocity
- ✅ Reduce duplicate code by 60%+
- ✅ New page development: < 1 day (from 2-3 days)
- ✅ Block creation: < 1 week (with testing)

### Author Experience  
- ✅ Can create new pages without developer
- ✅ Preview changes in < 30 seconds
- ✅ Understand block structure in < 5 minutes

### Performance
- ✅ Maintain 100 Lighthouse scores
- ✅ LCP < 2.5 seconds
- ✅ CLS < 0.1
- ✅ Total bundle size < 50KB per block

### Maintainability
- ✅ One place to update each pattern
- ✅ Clear documentation for all utilities/blocks
- ✅ Easy onboarding for new developers

---

## 📞 Get Help

### Questions About EDS Blocks?
- Read: [David's Model](https://www.aem.live/docs/davidsmodel) first
- Check: [Block Collection](https://www.aem.live/developer/block-collection) examples
- Ask: Adobe community on [Discord](https://discord.gg/aem-live)

### Questions About Your Implementation?
- Review: Decision tree in EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md
- Check: Your existing product-tile implementation (reference)
- Discuss: Team review sessions

### Questions About Classification?
- Use: Decision tree in summary document
- When in doubt: **Utility first, block if needed**
- Remember: Simpler is better!

---

## 🗓️ Implementation Timeline

### Phase 6A-6E: Design & Build (NOW - 4-6 weeks)
**Your Current Phase:** Phase 6A (Sarah's Dashboard)

**Use this documentation for:**
- ✅ Understanding EDS block patterns
- ✅ Referencing existing utilities in `styles/components.css`
- ✅ Making consistent design choices
- ✅ Avoiding creation of design debt

**DO NOT:**
- ❌ Extract components yet
- ❌ Classify all 47 components
- ❌ Refactor existing code
- ❌ Create block content models

**Rationale:** Patterns must be proven across multiple personas before extraction. Premature abstraction creates maintenance burden.

---

### Phase 7: Integration & Polish (AFTER Phase 6E - 2 weeks)
**Component Extraction Implementation Phase**

**📋 Full Plan:** [Phase 7 - Task 5: Component Extraction & Refactoring](../phase-6/B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md#task-5-component-extraction--refactoring--new)

**Time Allocated:** 1-2 days of Phase 7

**Work to be done:**
1. ✅ Review all Phase 6 implementations (6A-6E)
2. ✅ Classify proven patterns using this documentation
3. ✅ Extract 3-5 high-value CSS utilities
4. ✅ Extract 3-5 shared JavaScript functions
5. ✅ Create 1-2 EDS block content models (if applicable)
6. ✅ Refactor duplicate code to use extracted components
7. ✅ Test all personas after refactoring
8. ✅ Update component documentation

**Success Criteria:**
- All personas still working after refactoring
- High-value patterns extracted and documented
- Duplicate code reduced
- No regressions introduced

**Why Phase 7?**
- All personas built - can see what ACTUALLY repeated
- Patterns proven in production code
- Component extraction IS polish and optimization
- Clean frontend before backend integration (Phase 8)

---

### Phases 8+ (Backend, Deployment, Authoring)
**Ongoing Component Evolution**

**Use extracted components:**
- Build new features with component library
- Continue extracting as new patterns emerge
- Refine component documentation
- Add to block library incrementally

---

## 📝 Document Changelog

### December 6, 2025
- ✅ Created comprehensive EDS blocks analysis
- ✅ Wrote quick-start summary document
- ✅ Compiled this index for navigation
- ⏳ Next: Classify all 47 components
- ⏳ Next: Update roadmap with new priorities

---

**Ready to start? → Go to `EDS-BLOCKS-SUMMARY.md`**

**Questions? → Review `EDS-BLOCKS-VS-COMPONENT-EXTRACTION.md`**

**Need details? → Check [David's Model](https://www.aem.live/docs/davidsmodel)**

