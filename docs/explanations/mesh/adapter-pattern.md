# The Adapter Pattern

**What it does**: Explains why BuildRight intercepts dropin queries instead of connecting them directly
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Core Question

Adobe's dropins (Product Discovery, Cart, Checkout) are designed to work directly with Adobe's backends. So why do we put an "adapter" in between?

---

## Without vs. With Adapters

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WHY THE ADAPTER PATTERN?                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   WITHOUT ADAPTER (Direct Connection)                                       │
│   ════════════════════════════════════                                      │
│                                                                             │
│   Dropin ──────────────────────────────────► Adobe Backend                  │
│                                                                             │
│   ❌ No way to add persona pricing headers                                  │
│   ❌ No way to transform filters for our category structure                 │
│   ❌ No way to log requests for debugging                                   │
│   ❌ No way to add BuildRight-specific fields                               │
│   ❌ Locked into Adobe's exact data format                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   WITH ADAPTER (BuildRight's Approach)                                      │
│   ═════════════════════════════════════                                     │
│                                                                             │
│   Dropin ────► Adapter ────► Backend                                        │
│                   │                                                         │
│                   ├── Intercept request                                     │
│                   ├── Add persona headers                                   │
│                   ├── Transform filters                                     │
│                   ├── Log for debugging                                     │
│                   ├── Delegate to backend                                   │
│                   └── Transform response                                    │
│                                                                             │
│   ✅ Full control over every request                                        │
│   ✅ Persona-specific pricing works                                         │
│   ✅ Custom business logic supported                                        │
│   ✅ Future-proof (can swap backends)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The "Intercept and Delegate" Flow

Think of the adapter as a **concierge** sitting between the dropin and the backend. The dropin doesn't know the concierge is there.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INTERCEPT AND DELEGATE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. INTERCEPT                                                              │
│   ════════════                                                              │
│                                                                             │
│   Dropin sends:   "productSearch(category: Lumber)"                         │
│   Adapter catches: ← (dropin thinks it's talking to Adobe)                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   2. ENHANCE                                                                │
│   ═══════════                                                               │
│                                                                             │
│   Adapter adds:                                                             │
│   • AC-Price-Book-Id: "Wholesale"    (from persona)                         │
│   • AC-View-Id: "uuid-for-sarah"     (from persona)                         │
│   • Transforms category path to ACO format                                  │
│   • Validates page_size ≤ 100                                               │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   3. DELEGATE                                                               │
│   ════════════                                                              │
│                                                                             │
│   Adapter calls ACO:  BuildRight_productSearch(...)                         │
│   (Uses the prefixed query that goes to our execution source)               │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   4. TRANSFORM                                                              │
│   ═════════════                                                             │
│                                                                             │
│   ACO returns:    { __typename: "BuildRight_SimpleProductView" }            │
│   Adapter strips: { __typename: "SimpleProductView" }                       │
│   (Dropin expects unprefixed types)                                         │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   5. RETURN                                                                 │
│   ═════════                                                                 │
│                                                                             │
│   Dropin receives clean response                                            │
│   (Unaware adapter was ever involved)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What Adapters Enable

| Capability | What It Does | Why It Matters |
|------------|--------------|----------------|
| **Persona Headers** | Adds pricing/visibility context | Different customers see different prices |
| **Filter Transformation** | Converts category paths | Our categories work with dropins |
| **Validation** | Checks inputs | Prevents bad requests |
| **Logging** | Records requests | Debugging and monitoring |
| **Type Transformation** | Strips/adds prefixes | Keeps dropin compatible |
| **Extensibility** | Future custom fields | Add features without touching dropins |

---

## The Business Value

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BUSINESS VALUE                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   "We don't modify Adobe's dropins"                                         │
│   ═══════════════════════════════════                                       │
│   Dropins stay standard → Easy upgrades → No lock-in                        │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   "Full customization without breaking anything"                            │
│   ══════════════════════════════════════════════                            │
│   Business logic in mesh → Clean separation → Easy testing                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   "Persona pricing just works"                                              │
│   ═════════════════════════════                                             │
│   Every request gets context → Right prices → Right products                │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   "Easy to debug"                                                           │
│   ════════════════                                                          │
│   All requests through one place → Centralized logging → Clear flow         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Demo Talking Points

When explaining the adapter pattern to clients:

1. **"Dropins are untouched"** - We intercept at the API level, not in the UI components
2. **"Centralized control"** - All customization happens in one place (the mesh)
3. **"Transparent to users"** - Customers don't know adapters exist
4. **"Future-proof"** - Can change backends without touching the frontend
5. **"Adobe upgrades work"** - Because we don't modify their code

---

## Related Documentation

- [Source Architecture](./source-architecture.md) - How the 3 mesh sources work together
- [Unified Routing](./unified-routing.md) - Which adapters handle which dropins
- [Mesh Resolvers](./mesh-resolvers.md) - Individual resolver details
- [Technical Reference](../../reference/mesh/mesh-resolvers.md) - Code-level documentation
