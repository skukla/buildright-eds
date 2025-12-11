# BuildRight Documentation Navigation Map

**Purpose**: Visual guide to finding the right documentation quickly

**Last Updated**: November 24, 2025

---

## 🎯 START HERE: What Are You Doing?

```
┌─────────────────────────────────────────────────────┐
│          🚀 IMPLEMENTATION-GUIDE.md                 │
│              (Your Main Entry Point)                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
        [What are you doing?]
                  │
        ┌─────────┼─────────────┬─────────────┬──────────────┐
        │         │             │             │              │
        ↓         ↓             ↓             ↓              ↓
   Implementing  Understanding  Setting Up  Deploying  Understanding
    Personas     What Exists     Backend   Production   Big Picture
```

---

## 🛤️ Path 1: Implementing Personas (MOST COMMON)

```
START: IMPLEMENTATION-GUIDE.md
   ↓
[Implementing Personas section]
   ↓
PHASES-6B-TO-7-CONSOLIDATED.md ⭐ YOUR IMPLEMENTATION PLAN
   ↓
┌─────────────────┴─────────────────┐
│  Find your phase:                 │
│  • Phase 6B → Marcus              │
│  • Phase 6C → Lisa                │
│  • Phase 6D → David               │
│  • Phase 6E → Kevin               │
└─────────────────┬─────────────────┘
                  │
     Need more context? →
                  │
    ┌─────────────┼─────────────┬──────────────┬──────────────┐
    │             │             │              │              │
    ↓             ↓             ↓              ↓              ↓
Persona       What Exists   Coding       Architectural   Testing
Profiles      Inventory     Standards    Decisions       Guides
    │             │             │              │              │
    ↓             ↓             ↓              ↓              ↓
personas/   quick-reference/  standards/    adr/         testing/
BUILDRIGHT-  what-exists.md  CSS-         ADR-004      TESTING-
PERSONAS...                  ARCHITECTURE              GUIDE.md
```

---

## 🛤️ Path 2: Understanding What Exists

```
START: IMPLEMENTATION-GUIDE.md
   ↓
[Understanding What's Built section]
   ↓
quick-reference/what-exists.md ⭐ INVENTORY
   ↓
┌────────────────────────────────────┐
│  Quick inventory of:               │
│  • 5 shared components             │
│  • 5 demo accounts                 │
│  • 15 fragments                    │
│  • Core services (auth, ACO mock)  │
└────────────────┬───────────────────┘
                 │
    Need details? →
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
    ↓            ↓            ↓              ↓
Shared      Auth & Demo   Fragments    Core
Components   Accounts                  Architecture
    │            │            │              │
    ↓            ↓            ↓              ↓
PHASE-4-    PHASE-5-     FRAGMENT-      PHASE-3-
COMPLETION- TASK-2-      IMPLEMENTATION- COMPLETION-
SUMMARY     COMPLETION-  SUMMARY         SUMMARY
            SUMMARY
```

---

## 🛤️ Path 3: Setting Up Backend (Phase 8 - Future)

```
START: IMPLEMENTATION-GUIDE.md
   ↓
[Setting Up Backend section]
   ↓
phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED.md
   ↓
┌────────────────────────────────────┐
│  Backend setup includes:           │
│  • Adobe Commerce PaaS             │
│  • Adobe Commerce Optimizer (ACO)  │
│  • API Mesh configuration          │
│  • Commerce Dropins integration    │
└────────────────┬───────────────────┘
                 │
    Need specifics? →
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    │            │            │              │              │
    ↓            ↓            ↓              ↓              ↓
ACO Setup   Dropins     Data Source   Auth         Product
Guides      Integration  Matrix        Strategy     Data Flow
    │            │            │              │              │
    ↓            ↓            ↓              ↓              ↓
phase-8-    DROPIN-     DATA-SOURCE-  AUTH-       PRODUCT-
backend/    ARCHITECTURE MATRIX        STRATEGY    FLOW...
ACO-*.md
```

---

## 🛤️ Path 4: Deploying to Production (Phase 9 - Future)

```
START: IMPLEMENTATION-GUIDE.md
   ↓
[Deploying to Production section]
   ↓
phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md
   ↓
┌────────────────────────────────────┐
│  Migration guide covers:           │
│  • Replace mock data with live APIs│
│  • Configure API Mesh              │
│  • Set up Commerce backend         │
│  • Deploy EDS storefront           │
└────────────────┬───────────────────┘
                 │
    Also see: →
                 │
                 ↓
     PHASE-9-PRODUCTION-DEPLOYMENT.md
     (Detailed deployment architecture)
```

---

## 🛤️ Path 5: Understanding the Big Picture

```
START: IMPLEMENTATION-GUIDE.md
   ↓
[Understanding Overall Plan section]
   ↓
┌────────────────────────────────────┐
│  Three navigation hubs:            │
│  1. PHASE-PLANS-INDEX.md           │
│  2. PERSONA-PLAN-CORE-DOCS.md      │
│  3. PHASE-PLANS-SUMMARY.md         │
└────────────────┬───────────────────┘
                 │
    Pick based on need: →
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
    ↓            ↓            ↓              ↓
Complete    Task-Based   Quick         Architecture
Roadmap     Navigation   Overview      Decisions
    │            │            │              │
    ↓            ↓            ↓              ↓
PHASE-      PERSONA-     PHASE-         adr/
PLANS-      PLAN-CORE-   PLANS-         README.md
INDEX       DOCS         SUMMARY
```

---

## 📂 Cross-Phase Reference Folders (Used Throughout)

These folders are referenced across ALL phases:

```
┌─────────────────────────────────────────────────────────┐
│  Cross-Phase Folders (Always Relevant)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  personas/          All 5 persona profiles & flows      │
│     ↓                                                    │
│     Use when: Implementing any persona feature          │
│                                                          │
│  standards/         CSS, coding, components, animations │
│     ↓                                                    │
│     Use when: Writing any code                          │
│                                                          │
│  testing/           Testing strategies, QA checklists   │
│     ↓                                                    │
│     Use when: Testing any feature                       │
│                                                          │
│  adr/               Architectural Decision Records      │
│     ↓                                                    │
│     Use when: Making architectural decisions            │
│                                                          │
│  quick-reference/   1-page guides for common tasks      │
│     ↓                                                    │
│     Use when: Need fast answers                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Phase-Specific Folders (Used When Needed)

```
┌─────────────────────────────────────────────────────────┐
│  Phase Folders (Reference When in That Phase)           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  phase-0-5-foundation/   ✅ Completed work (reference)  │
│     ↓                                                    │
│     Contains: 30 files covering Phases 0-5              │
│     Use when: Understanding what's already built        │
│                                                          │
│  phase-8-backend/        📋 Backend setup (future)      │
│     ↓                                                    │
│     Contains: 19 files for Commerce + ACO setup         │
│     Use when: Setting up production backend             │
│                                                          │
│  phase-9-deployment/     📋 Production deployment       │
│     ↓                                                    │
│     Contains: 3 files for going live                    │
│     Use when: Deploying to production                   │
│                                                          │
│  phase-10-authoring/     📋 Content authoring           │
│     ↓                                                    │
│     Contains: 3 files for author transition             │
│     Use when: Transitioning to author-managed content   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Task → Document Mapping

| I want to... | Start here | Then go to |
|--------------|------------|------------|
| **Implement Marcus persona** | IMPLEMENTATION-GUIDE | PHASES-6B-TO-7-CONSOLIDATED (6B) |
| **Implement Lisa persona** | IMPLEMENTATION-GUIDE | PHASES-6B-TO-7-CONSOLIDATED (6C) |
| **Implement David persona** | IMPLEMENTATION-GUIDE | PHASES-6B-TO-7-CONSOLIDATED (6D) |
| **Implement Kevin persona** | IMPLEMENTATION-GUIDE | PHASES-6B-TO-7-CONSOLIDATED (6E) |
| **Add a demo account** | quick-reference/add-demo-account.md | scripts/auth.js |
| **Find reusable components** | quick-reference/what-exists.md | phase-0-5-foundation/PHASE-4-COMPLETION-SUMMARY |
| **Understand architecture** | quick-reference/architecture-overview.md | phase-0-5-foundation/PHASE-3-COMPLETION-SUMMARY |
| **Check demo accounts** | quick-reference/what-exists.md | phase-0-5-foundation/PHASE-5-TASK-2-COMPLETION-SUMMARY |
| **See coding standards** | IMPLEMENTATION-GUIDE | standards/CODING-PRINCIPLES |
| **Understand why we built X** | adr/README.md | Specific ADR |
| **Set up backend** | IMPLEMENTATION-GUIDE | phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED |
| **Deploy to production** | IMPLEMENTATION-GUIDE | phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE |

---

## 🔗 Document Relationships

### Implementation Docs Reference:
- **PHASES-6B-TO-7-CONSOLIDATED** references:
  - personas/ (for profiles)
  - quick-reference/what-exists (for reusable components)
  - phase-0-5-foundation/ (for completion summaries)
  - adr/ (for architectural decisions)

### Quick References Link To:
- **what-exists.md** links to:
  - PHASE-4-COMPLETION-SUMMARY (shared components)
  - PHASE-5-TASK-2-COMPLETION-SUMMARY (auth & demo accounts)
  - FRAGMENT-IMPLEMENTATION-SUMMARY (fragments)
  - PHASE-3-COMPLETION-SUMMARY (core architecture)

### Architecture Docs Connect:
- **adr/** links to:
  - Phase implementation docs (where decisions are applied)
  - Backend setup docs (phase-8-backend/)
  - Standards docs (standards/)

---

## 💡 Navigation Tips

### Tip 1: Always Start with IMPLEMENTATION-GUIDE.md
It's your single entry point that routes you to the right place.

### Tip 2: Use Quick References First
If you need fast context, check quick-reference/ before diving into full docs.

### Tip 3: Completion Summaries = What Exists
To understand what's already built, read the completion summaries in phase-0-5-foundation/.

### Tip 4: ADRs Explain "Why"
If you're wondering why we made a technical choice, check adr/.

### Tip 5: Standards = "How to Build"
Before writing code, review standards/ for patterns and principles.

---

## 🎉 You're Ready to Navigate!

Start at [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) and follow the paths above.

**The docs are organized to get you to the right information in 1-3 clicks!**


