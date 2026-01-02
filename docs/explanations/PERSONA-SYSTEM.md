# Persona System

## What It Does

Shows different products and prices to different customer types. A "Production Builder" sees wholesale pricing and bulk materials. A "DIY Homeowner" sees retail pricing and project kits.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER LOGS IN                                │
│                           │                                      │
│                           ▼                                      │
│              ┌─────────────────────────┐                        │
│              │   Match email to        │                        │
│              │   persona config        │                        │
│              └───────────┬─────────────┘                        │
│                          │                                      │
│    ┌─────────────────────┼─────────────────────┐                │
│    ▼                     ▼                     ▼                │
│  ┌────────┐         ┌────────┐         ┌────────┐              │
│  │ Sarah  │         │ Marcus │         │ David  │   ...        │
│  │ Builder│         │ Contr. │         │ DIY    │              │
│  └───┬────┘         └───┬────┘         └───┬────┘              │
│      │                  │                  │                    │
│      ▼                  ▼                  ▼                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Headers:  AC-View-Id + AC-Price-Book-Id            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│              ┌─────────────────────────┐                        │
│              │  ACO returns products   │                        │
│              │  for that persona       │                        │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## The 5 Personas

| Persona | Role | What They See |
|---------|------|---------------|
| **Sarah Martinez** | Production Builder | Bulk materials, wholesale pricing, project BOMs |
| **Marcus Johnson** | General Contractor | Multi-phase ordering, professional tier |
| **Lisa Chen** | Remodeling Contractor | Room packages, quote generation |
| **David Thompson** | DIY Homeowner | Project kits, retail pricing, guides |
| **Kevin Rodriguez** | Store Manager | All products, inventory management |

## How Pricing Works

```
Same SKU, Different Prices:

┌──────────────┬─────────────┬─────────────┐
│   Product    │   Sarah     │   David     │
│              │  (Pro)      │  (Retail)   │
├──────────────┼─────────────┼─────────────┤
│  2x4 Lumber  │   $3.50     │   $4.99     │
│  Nail Box    │   $8.00     │   $12.99    │
│  Deck Kit    │   $450.00   │   $599.99   │
└──────────────┴─────────────┴─────────────┘
```

Each persona has a `price_book_id` that determines their pricing tier.

---

**Source of Truth:** `scripts/persona-config.js`

**See Also:** [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md)
