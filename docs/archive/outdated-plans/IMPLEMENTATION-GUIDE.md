# BuildRight Implementation Guide

**🎯 You're implementing features? Start here.**

This is your **single entry point** for all implementation work. Everything else is reference material.

**Last Updated**: November 24, 2025

---

## 🚀 What Are You Doing Right Now?

### → Implementing Personas (Phases 6B-7) 🚧 **CURRENT WORK**

**Go directly to**: [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)

This doc contains complete implementation plans for:
- **Phase 6B**: Marcus Johnson (General Contractor) - Project wizard
- **Phase 6C**: Lisa Chen (Remodeling Contractor) - Package builder
- **Phase 6D**: David Thompson (DIY Homeowner) - Deck builder ⭐ **Primary CCDM demo**
- **Phase 6E**: Kevin Rodriguez (Store Manager) - Multi-location restock dashboard
- **Phase 7**: Integration & Polish

**Reading time**: 20-30 min per persona  
**Implementation time**: 2-3 weeks per persona

**Quick start**:
1. Find your persona's phase section in the consolidated doc
2. Read the objectives and data requirements
3. Check [quick-reference/what-exists.md](./quick-reference/what-exists.md) for reusable components
4. Follow the implementation tasks
5. Use completion summaries to see what's already built

---

### → Understanding What's Already Built ✅

**Go directly to**: [phase-0-5-foundation/](./phase-0-5-foundation/)

**Key completion summaries** (read these first):

| What You Need | Document | Why Read It |
|---------------|----------|-------------|
| **Demo accounts & auth** | [PHASE-5-TASK-2-COMPLETION-SUMMARY.md](./phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY.md) | Lists all 5 demo companies, emails, persona mappings, auth flow |
| **Shared components** | [PHASE-4-COMPLETION-SUMMARY.md](./phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY.md) | 5 reusable blocks (loading overlay, wizard progress, etc.) |
| **Fragments catalog** | [FRAGMENT-IMPLEMENTATION-SUMMARY.md](./phase-0-5-foundation/FRAGMENT-IMPLEMENTATION-SUMMARY.md) | 15 fragments (persona-specific + shared) |
| **Core architecture** | [PHASE-3-COMPLETION-SUMMARY.md](./phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY.md) | Auth service, persona config, mock ACO |
| **Coding patterns** | [PHASE_1_COMPLETE.md](./phase-0-5-foundation/PHASE_1_COMPLETE.md) | CSS/JS separation, avoid inline styles |

**Reading time**: 10 min per summary

---

### → Setting Up Backend (Phase 8) 📋 **FUTURE**

**Go directly to**: [phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED.md](./phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED.md)

This covers Adobe Commerce PaaS + ACO backend setup:
- Product data ingestion
- Customer groups configuration
- MSI warehouse setup
- ACO price books and policies
- API Mesh configuration

**Also see**: [phase-8-backend/](./phase-8-backend/) for all backend docs

---

### → Deploying to Production (Phase 9) 📋 **FUTURE**

**Go directly to**: [phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md](./phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md)

Step-by-step migration from static mocks to live Adobe Commerce + ACO APIs.

**Also see**: [phase-9-deployment/](./phase-9-deployment/) for all deployment docs

---

### → Understanding the Overall Plan 📊

**Go directly to**: [PHASE-PLANS-INDEX.md](./PHASE-PLANS-INDEX.md)

Complete roadmap with all phases, dependencies, and status tracking.

**Also see**: 
- [PERSONA-PLAN-CORE-DOCS.md](./PERSONA-PLAN-CORE-DOCS.md) - Curated navigation
- [PHASE-PLANS-SUMMARY.md](./PHASE-PLANS-SUMMARY.md) - Quick overview

---

## 🎯 Quick Reference Guides

**Need fast answers?** These 1-page guides cover common tasks:

| Task | Guide | Time |
|------|-------|------|
| Implement a new persona | [quick-reference/implement-persona.md](./quick-reference/implement-persona.md) | 2 min read |
| Add a demo account | [quick-reference/add-demo-account.md](./quick-reference/add-demo-account.md) | 2 min read |
| Find existing components | [quick-reference/what-exists.md](./quick-reference/what-exists.md) | 3 min read |
| Understand the architecture | [quick-reference/architecture-overview.md](./quick-reference/architecture-overview.md) | 5 min read |

---

## 📚 Reference Material (When You Need More Context)

### Personas (All Documentation)
**Location**: [personas/](./personas/)

- All 5 persona profiles and user flows
- Overall strategy and phased rollout
- Technical implementation details
- UX patterns by persona

**See**: [personas/README.md](./personas/README.md)

---

### Standards & Best Practices
**Location**: [standards/](./standards/)

- CSS architecture and design system
- Coding principles
- Component design library
- Responsive patterns
- Animation standards

**See**: [standards/README.md](./standards/README.md)

---

### Testing & QA
**Location**: [testing/](./testing/)

- Testing strategies and checklists
- QA audit procedures
- Persona-specific testing scenarios

**See**: [testing/README.md](./testing/README.md)

---

### Architectural Decisions
**Location**: [adr/](./adr/)

- ADR-001: Use Dropins for Commerce
- ADR-002: Use EDS Blocks for Content
- ADR-003: Mock ACO Service
- ADR-004: Custom Attributes for Personas
- ADR-005: Dual Mode Authentication
- ADR-006: Multi-Location Store Manager

**See**: [adr/README.md](./adr/README.md)

---

## 🗺️ Visual Navigation

Need a map? See [NAVIGATION-MAP.md](./NAVIGATION-MAP.md) for a visual diagram of doc relationships.

---

## 💡 Tips for Efficient Navigation

### If you're NEW to the project:
1. Read [README.md](./README.md) (project overview) - 5 min
2. Read [quick-reference/architecture-overview.md](./quick-reference/architecture-overview.md) - 5 min
3. Read [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md) intro - 10 min
4. Start implementing!

### If you're IMPLEMENTING a persona:
1. Go directly to [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)
2. Read [quick-reference/what-exists.md](./quick-reference/what-exists.md) for reusable components
3. Check Phase 0-5 completion summaries for details on existing systems
4. Follow implementation plan tasks

### If you're DEBUGGING or UNDERSTANDING existing code:
1. Check [phase-0-5-foundation/](./phase-0-5-foundation/) completion summaries
2. Look at [quick-reference/what-exists.md](./quick-reference/what-exists.md) for component inventory
3. Read relevant ADRs in [adr/](./adr/) for architectural decisions

---

## 🎯 Document Types & How to Use Them

### 📋 **Implementation Plans** (What to build)
- Main source: `PHASES-6B-TO-7-CONSOLIDATED.md`
- Individual phase plans in `phase-0-5-foundation/`

**Use when**: Starting new work

---

### ✅ **Completion Summaries** (What's already built)
- Location: `phase-0-5-foundation/*SUMMARY.md`
- Lists: What was built, how it works, APIs, demo data

**Use when**: Understanding existing systems

---

### 🏗️ **Architecture Decision Records (ADRs)** (Why we built it this way)
- Location: `adr/ADR-*.md`
- Explains: Context, decision, consequences, alternatives

**Use when**: Understanding architectural choices

---

### 📖 **Standards & Patterns** (How to build)
- Location: `standards/`
- Defines: CSS patterns, coding principles, component library

**Use when**: Writing code

---

### 🧪 **Testing Guides** (How to verify)
- Location: `testing/`
- Provides: Testing strategies, QA checklists

**Use when**: Testing features

---

## 📞 Need Help?

**Can't find what you need?**
1. Check [NAVIGATION-MAP.md](./NAVIGATION-MAP.md) for visual overview
2. Read [PERSONA-PLAN-CORE-DOCS.md](./PERSONA-PLAN-CORE-DOCS.md) for task-based navigation
3. Look at folder READMEs for detailed inventories

**Found a documentation gap?** Note it and we'll add it!

---

## 🎉 You're Ready!

Pick your task above and dive in. The docs are organized to support you every step of the way.

**Most common path**: [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md) → Start implementing! 🚀


