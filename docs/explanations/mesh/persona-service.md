# Persona Service

**What it does**: Explains how the system determines what products and pricing each customer sees
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Core Question

When Sarah Martinez logs in, how does the system know to show her Production Builder pricing instead of Retail pricing? The **Persona Service** answers: "Who is this customer, and what should they see?"

---

## What Changes Based on Persona

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SAME PRODUCT, DIFFERENT EXPERIENCE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Product: Premium Deck Lumber (SKU: PDL-001)                                │
│                                                                              │
│   ┌─────────────────────┐    ┌─────────────────────┐                        │
│   │  GUEST USER         │    │  SARAH MARTINEZ     │                        │
│   │  (Not logged in)    │    │  (Production Builder)│                        │
│   ├─────────────────────┤    ├─────────────────────┤                        │
│   │                     │    │                     │                        │
│   │  Price: $45.99      │    │  Price: $38.50      │                        │
│   │  (Retail pricing)   │    │  (Wholesale pricing)│                        │
│   │                     │    │                     │                        │
│   │  Catalog: Default   │    │  Catalog: Pro       │                        │
│   │  (Consumer products)│    │  (Builder products) │                        │
│   │                     │    │                     │
│   └─────────────────────┘    └─────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

The persona service provides two pieces of context:

| Context | What It Controls | Example |
|---------|------------------|---------|
| **Catalog View** | Which products are visible | Pro builders see commercial-grade items |
| **Price Book** | What prices are shown | Wholesale vs retail pricing |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PERSONA SERVICE FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. USER LOGS IN                                                            │
│   ══════════════                                                             │
│                                                                              │
│   Sarah clicks "Quick Login" or enters email/password                        │
│   Commerce returns: "This is sarah.martinez@sunbelthomes.com"                │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│   2. PERSONA LOOKUP                                                          │
│   ═════════════════                                                          │
│                                                                              │
│   Frontend asks Mesh: "Who is sarah.martinez@sunbelthomes.com?"              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Mesh Resolver → I/O Action                                         │   │
│   │                                                                     │   │
│   │  Looks up email in persona mappings:                                │   │
│   │  sarah.martinez@sunbelthomes.com → "Production Builder" persona     │   │
│   │                                                                     │   │
│   │  Returns:                                                           │   │
│   │  • name: "Production Builder"                                       │   │
│   │  • catalogViewId: "22c02790-7c5e-474d-a3b6-c72b22203be5"           │   │
│   │  • priceBookId: "Production-Builder"                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│   3. HEADERS SET                                                             │
│   ══════════════                                                             │
│                                                                              │
│   Frontend stores these as headers for all future requests:                  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  AC-View-Id: 22c02790-7c5e-474d-a3b6-c72b22203be5                   │   │
│   │  AC-Price-Book-Id: Production-Builder                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│   4. PERSONALIZED RESULTS                                                    │
│   ═══════════════════════                                                    │
│                                                                              │
│   Every product query includes these headers                                 │
│   ACO returns products and prices for Sarah's persona                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Guest vs Authenticated

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TWO PATHS TO PERSONA                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   GUEST (Not logged in)                 AUTHENTICATED (Logged in)            │
│   ═════════════════════                 ═════════════════════════            │
│                                                                              │
│   Page loads                            User logs in                         │
│        │                                     │                               │
│        ▼                                     ▼                               │
│   No auth token found                   Auth token found                     │
│        │                                     │                               │
│        ▼                                     ▼                               │
│   Lookup by customer group "0"          Lookup by email                      │
│   (default/guest group)                 "sarah@sunbelthomes.com"             │
│        │                                     │                               │
│        ▼                                     ▼                               │
│   Returns: "Guest" persona              Returns: "Production Builder"        │
│   • Default catalog view                • Pro catalog view                   │
│   • Retail pricing                      • Wholesale pricing                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Five BuildRight Personas

| Persona | Customer Type | Catalog View | Price Book |
|---------|---------------|--------------|------------|
| **Sarah Martinez** | Production Builder | Pro Builder | Production-Builder |
| **Marcus Johnson** | General Contractor | Contractor | Contractor |
| **Lisa Chen** | Remodeling Specialist | Remodeler | Remodeler |
| **David Thompson** | Pro DIY Homeowner | Consumer | US-Retail |
| **Kevin Rodriguez** | Store Manager | All Products | Staff |
| **Guest** | Anonymous visitor | Default | US-Retail |

---

## Where the Data Lives

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PERSONA MAPPINGS                      ACO (Commerce Optimizer)             │
│   ════════════════                      ════════════════════════             │
│                                                                              │
│   I/O Runtime Action stores:            Adobe Commerce Optimizer stores:     │
│                                                                              │
│   Email → Persona mapping               Catalog Views (UUIDs)                │
│   • sarah@ → Production Builder         • What products each view contains   │
│   • marcus@ → Contractor                • Product visibility rules           │
│   • lisa@ → Remodeler                                                        │
│                                         Price Books                          │
│   Customer Group → Persona              • Price tiers per book               │
│   • Group 0 → Guest                     • Volume discounts                   │
│   • Group 1 → Production Builder        • Customer-specific pricing          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key point**: The persona service maps identities to ACO context. ACO itself handles the actual product filtering and pricing.

---

## Timing: When Persona Is Set

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PAGE LOAD TIMELINE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Page loads                                                                 │
│        │                                                                     │
│        ├──► Check for auth token cookie                                      │
│        │                                                                     │
│        ├──► If NO token: Fetch guest persona (fast, ~100ms)                  │
│        │         └──► Headers set, page renders with guest pricing           │
│        │                                                                     │
│        └──► If token EXISTS: Wait for auth event                             │
│                  │                                                           │
│                  ├──► Commerce validates token                               │
│                  ├──► Get customer email                                     │
│                  ├──► Fetch persona by email (~100ms)                        │
│                  └──► Headers set, page renders with user pricing            │
│                                                                              │
│   Total time: ~100-200ms (persona fetch is fast, no caching needed)          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Common Questions

**Q: Why not cache the persona?**
A: The persona query is fast (~100ms). Caching adds complexity and can cause stale pricing bugs when users log in/out.

**Q: What if the email isn't found?**
A: Falls back to guest persona. The user sees default catalog and retail pricing.

**Q: How is this different from Persona Auth?**
A: Persona Auth handles *logging in* (getting a JWT token). Persona Service handles *identification* (what catalog/pricing to show).

**Q: Can a user have multiple personas?**
A: No. Each email maps to exactly one persona. The mapping is determined by customer group in Commerce.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [Persona Authentication](./persona-authentication.md) | How Quick Login works |
| [Unified Routing](./unified-routing.md) | How dropins route through mesh |
| [Persona Reference](../../reference/mesh/persona-auth.md) | GraphQL schema and code examples |

---

**Navigation:**
- [← Back to Mesh Explanations](./README.md)
- [Persona System](../personas/persona-system.md)
