# BuildRight Phase Plans Index

> **Authoritative Plan:** [master-implementation-plan.md](./master-implementation-plan.md)
> This index provides links to detailed phase documents.

## Overview

BuildRight uses a phased implementation approach with two major tracks:

1. **Commerce Dropins** — Standard Adobe dropins for Commerce data (auth, cart, checkout, orders)
2. **Custom SDK Dropins** — BuildRight-specific dropins for ACO data (products, pricing, BOM)

---

## Master Plan

### 📋 master-implementation-plan.md ⭐ **START HERE**
**Single source of truth**
- Executive summary and current state
- Architecture overview (Commerce + ACO)
- Key decisions log
- All phases with tasks and timeline
- Progress tracking

---

## Key Decision Documents

### 📄 CODEBASE-AUDIT-DROPINS.md
**Detailed Commerce Dropins integration plan**
- File-by-file audit (DELETE, MODIFY, KEEP)
- Services architecture analysis
- Dropins to integrate
- Custom SDK dropins to create

### 📋 ADR-001: Use Dropins for Commerce
**Decision:** Use Commerce Dropins for auth, cart, checkout, orders

### 📋 ADR-007: Custom SDK Dropins for ACO
**Decision:** Create custom SDK dropins for ACO-sourced components

---

## Persona Reference

### 📋 BUILDRIGHT-PERSONAS-AND-FLOWS.md
**Persona definitions and user journeys**
- Detailed persona profiles
- User flows for each persona
- Pain points and goals

---

## Phase Plans

### Phases 0-5: Foundation ✅ Complete

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ | Research, ADRs, architecture decisions |
| Phase 1 | ✅ | ACO data generation (buildright-aco) |
| Phase 2 | ⏸️ | Design system icons (deferred, using emojis) |
| Phase 3 | ✅ | Core architecture, persona config, auth |
| Phase 4 | ✅ | Shared components |
| Phase 5 | ✅ | Existing page refactors |

---

## Sarah End-to-End (Current Focus)

Complete Sarah's entire experience before other personas.

### Phase 5.5: Commerce Dropins 🔲 Next

**Goal:** Commerce auth, cart, checkout, orders for Sarah  
**Duration:** 2 weeks

| Dropin | Status |
|--------|--------|
| Auth | 🔲 |
| Cart | 🔲 |
| Checkout | 🔲 |
| Order | 🔲 |

### Phase 6A: Sarah's Features 🔄 In Progress

**Goal:** Template dashboard, configurator, BOM review  
**Details:** [implementation/sarah-end-to-end/features/](./implementation/sarah-end-to-end/features/)

### Phase 7: Custom SDK Dropins 🔲 Planned

**Goal:** SDK-based product grid, PDP, project builder for Sarah  
**Duration:** 2-3 weeks

### Phase 8: Polish 🔲 Planned

**Goal:** Complete Sarah's end-to-end experience  
**Duration:** 1 week

---

## Other Personas (End of Project)

After Sarah is complete, apply patterns to remaining personas.

| Phase | Persona | Key Feature |
|-------|---------|-------------|
| 6B | Marcus Johnson (GC) | Project wizard with phases |
| 6C | Lisa Chen (Remodeler) | Good/Better/Best packages |
| 6D | David Thompson (DIY) | Deck builder |
| 6E | Kevin Rodriguez (Store Mgr) | Velocity-based restock |

**Details:** [implementation/other-personas/](./implementation/other-personas/)

---

## Supporting Documents

| Document | Purpose |
|----------|---------|
| [implementation/sarah-end-to-end/dropins/](./implementation/sarah-end-to-end/dropins/) | Dropins implementation docs |
| [reference/backend/](./reference/backend/) | Backend reference docs |
| [AGENT-HANDOFF.md](../archive/session-logs/AGENT-HANDOFF.md) | Context for new developers |

---

## Key Architectural Decisions

### Two Types of Dropins

| Data Source | Dropin Type | Why? |
|-------------|-------------|------|
| **Commerce** | Standard Commerce Dropins | Auth, Cart, Checkout live in Commerce |
| **ACO** | Custom SDK Dropins | Native dropins can't query ACO |

### Auth Dropin + Persona Service

Both are needed:
- **Auth Dropin:** Commerce authentication (login UI, tokens)
- **Persona Service:** ACO context (catalogViewId, priceBookId)

### SDK Dropins Over Plain EDS Blocks

For ACO components, use the Drop-in SDK to ensure:
- Shared design tokens with Commerce dropins
- Standard event bus integration
- Slots for extensibility

---

## Timeline Summary

### Sarah End-to-End (8 weeks)

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0-5 | Complete | ✅ Foundation |
| Phase 5.5 | 2 weeks | 🔲 Commerce Dropins |
| Phase 6A | 2-3 weeks | 🔄 Sarah features |
| Phase 7 | 2 weeks | 🔲 Custom SDK Dropins |
| Phase 8 | 1 week | 🔲 Polish |

### Other Personas (8 weeks, after Sarah)

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 6B-6E | 8 weeks | 🔲 Deferred |

**Sarah complete:** 8 weeks  
**All personas:** 16 weeks total

---

## Getting Started

1. **Read the master plan:** [master-implementation-plan.md](../master-implementation-plan.md)
2. **Understand personas:** [personas-overview.md](../personas/personas-overview.md)
3. **For Dropins details:** [codebase-audit-dropins.md](../implementation/sarah-end-to-end/dropins/codebase-audit-dropins.md)

---

## Archived Documents

The following documents have been superseded by the master plan:

| Document | Status | Notes |
|----------|--------|-------|
| `personas/PERSONA-META-PLAN.md` | Archived | Consolidated into MASTER |
| `personas/PERSONA-IMPLEMENTATION-PLAN.md` | Archived | Consolidated into MASTER |

---

**Index Version**: 2.0  
**Last Updated**: December 2024

