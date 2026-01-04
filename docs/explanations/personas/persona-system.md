# Persona System

**What it does**: Shows different products and prices to different customer types
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Is the Persona System?

BuildRight serves different types of B2B customers - from professional builders who order in bulk to DIY homeowners buying weekend projects. The persona system ensures each customer type sees:

- **The right products** (bulk lumber vs project kits)
- **The right prices** (wholesale vs retail)
- **The right features** (BOM generator vs DIY guides)

---

## How It Works

When a customer logs in, the system identifies their persona and sets special headers that ACO uses to personalize the experience:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CUSTOMER LOGS IN                                             │
│                                                                  │
│     Sarah signs in with sarah@buildco.com                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. SYSTEM IDENTIFIES PERSONA                                    │
│                                                                  │
│     Looks up email in persona configuration                      │
│     Finds: "Production Builder"                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. SETS PRICING HEADERS                                         │
│                                                                  │
│     AC-View-Id: [what products she can see]                     │
│     AC-Price-Book-Id: "Wholesale"                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. ACO RETURNS PERSONALIZED CONTENT                             │
│                                                                  │
│     All product queries now return:                              │
│     • Products visible to Production Builders                    │
│     • Wholesale pricing tier                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## The 5 BuildRight Personas

Each persona represents a different B2B customer type:

| Persona | Role | What They See | Special Features |
|---------|------|---------------|------------------|
| **Sarah Martinez** | Production Builder | Bulk materials, commercial products | BOM generator, volume discounts |
| **Marcus Johnson** | General Contractor | Multi-project ordering, professional products | Phase planning, job accounts |
| **Lisa Chen** | Remodeling Contractor | Room packages, finishing materials | Quote generator, design tools |
| **David Thompson** | DIY Homeowner | Project kits, guides, consumer products | DIY tutorials, weekend projects |
| **Kevin Rodriguez** | Store Manager | Full catalog, all features | Inventory, analytics, admin |

---

## How Pricing Differs

The same product shows different prices based on the customer's persona:

```
┌──────────────────────────────────────────────────────────────┐
│  SAME PRODUCT, DIFFERENT PRICES                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                       Sarah            David                  │
│   Product           (Wholesale)       (Retail)                │
│   ───────────────   ──────────       ─────────                │
│   2×4×8 Lumber        $3.50           $4.99                   │
│   Nail Box            $8.00          $12.99                   │
│   Deck Kit          $450.00         $599.99                   │
│                                                               │
│   Price Book:     "US-Wholesale"    "US-Retail"               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## What Clients Need to Know

When explaining the persona system:

- **"Single storefront, multiple experiences"** - No need for separate B2B and B2C sites
- **"Price books in ACO"** - Pricing tiers are managed in Adobe Commerce Optimizer
- **"Automatic personalization"** - Once logged in, everything adjusts automatically
- **"Demo-friendly"** - Use the persona switcher to show different customer views

---

## For Demos: Persona Switcher

BuildRight includes a demo feature to switch personas without logging out:

1. Look for the persona switcher in the header
2. Select a different persona (e.g., switch from Sarah to David)
3. Watch prices and products update in real-time
4. Great for showing "same store, different experience"

---

**Related**: [Architecture Overview](../architecture/architecture-overview.md) | [Mesh Persona Resolver](../mesh/mesh-adapter.md)
