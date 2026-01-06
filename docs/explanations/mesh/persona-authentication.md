# Persona Authentication

**What it does**: Explains how demo personas log in and get personalized pricing
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Core Question

BuildRight has 5 demo personas (Sarah, Marcus, Lisa, David, Kevin) that need to log in instantly without typing passwords. How do we authenticate them securely while keeping passwords hidden?

---

## The Quick Login Experience

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WHAT THE USER SEES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  Quick Login (Demo Only)                                           │    │
│   ├────────────────────────────────────────────────────────────────────┤    │
│   │                                                                    │    │
│   │    [Sarah Martinez]  [Marcus Johnson]  [Lisa Chen]                 │    │
│   │                                                                    │    │
│   │    [David Thompson]  [Kevin Rodriguez]                             │    │
│   │                                                                    │    │
│   │    Click any name to instantly log in as that persona              │    │
│   │                                                                    │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   User clicks "Sarah Martinez"                                               │
│           │                                                                  │
│           ▼                                                                  │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  ✓ Logged in as Sarah Martinez                                    │    │
│   │                                                                    │    │
│   │  You now see:                                                      │    │
│   │  • Wholesale pricing (not retail)                                  │    │
│   │  • Pro Builder product catalog                                     │    │
│   │  • Volume discount tiers                                           │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Challenge: Passwords Without Passwords

Demo personas need to log in without typing passwords. But we can't skip authentication entirely - Adobe Commerce requires a JWT token to identify users for cart, checkout, and order history.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE PROBLEM                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Normal Login (Not Demo-Friendly):                                          │
│   ═════════════════════════════════                                          │
│                                                                              │
│   User types: email + password                                               │
│   Commerce validates: generateCustomerToken(email, password)                 │
│   Returns: JWT token                                                         │
│                                                                              │
│   ❌ Demo users don't know persona passwords                                 │
│   ❌ Sharing passwords is a security risk                                    │
│   ❌ Ruins the demo experience                                               │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────      │
│                                                                              │
│   What We Need:                                                              │
│   ══════════════                                                             │
│                                                                              │
│   ✅ One-click login (no password typing)                                    │
│   ✅ Real Commerce authentication (not fake)                                 │
│   ✅ Passwords stay hidden server-side                                       │
│   ✅ Same flow as production auth                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Solution: Server-Side Password Lookup

We store demo passwords securely on the server. When a user clicks a persona, we look up their password and authenticate on their behalf.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     HOW IT WORKS                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Step 1: User Clicks Persona                                                │
│   ════════════════════════════                                               │
│                                                                              │
│   [Sarah Martinez] ← Click                                                   │
│           │                                                                  │
│           │ "sarah.martinez@sunbelthomes.com"                                │
│           ▼                                                                  │
│                                                                              │
│   Step 2: Frontend Calls Mesh                                                │
│   ═══════════════════════════                                                │
│                                                                              │
│   BuildRight_authenticatePersona(email: "sarah.martinez@...")                │
│           │                                                                  │
│           │ (Goes through same mesh as all other queries)                    │
│           ▼                                                                  │
│                                                                              │
│   Step 3: Mesh Resolver Validates & Delegates                                │
│   ════════════════════════════════════════════                               │
│                                                                              │
│   ┌─────────────────────────────────────────┐                               │
│   │  Mesh Resolver                          │                               │
│   │  ┌───────────────────────────────────┐  │                               │
│   │  │ • Validate email format           │  │                               │
│   │  │ • Log request (email masked)      │  │                               │
│   │  │ • Call I/O Runtime action         │  │                               │
│   │  └───────────────────────────────────┘  │                               │
│   └─────────────────────────────────────────┘                               │
│           │                                                                  │
│           ▼                                                                  │
│                                                                              │
│   Step 4: I/O Action Looks Up Password                                       │
│   ═════════════════════════════════════                                      │
│                                                                              │
│   ┌─────────────────────────────────────────┐                               │
│   │  I/O Runtime (Secure Server)            │                               │
│   │  ┌───────────────────────────────────┐  │                               │
│   │  │ 1. Find persona by email          │  │                               │
│   │  │    sarah.martinez@... → "Sarah"   │  │                               │
│   │  │                                   │  │                               │
│   │  │ 2. Get password from .env         │  │                               │
│   │  │    PERSONA_SARAH_PASSWORD=***     │  │  ← Password never leaves      │
│   │  │                                   │  │     the server!               │
│   │  │ 3. Call Commerce auth             │  │                               │
│   │  │    generateCustomerToken(...)     │  │                               │
│   │  │                                   │  │                               │
│   │  │ 4. Return JWT token               │  │                               │
│   │  └───────────────────────────────────┘  │                               │
│   └─────────────────────────────────────────┘                               │
│           │                                                                  │
│           │ { token: "eyJhbG...", expiresIn: 3600 }                          │
│           ▼                                                                  │
│                                                                              │
│   Step 5: Frontend Uses Token                                                │
│   ═══════════════════════════                                                │
│                                                                              │
│   Commerce dropins now work with personalized cart/checkout                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Through the Mesh?

We could call the I/O action directly. But routing through the mesh keeps everything consistent:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DIRECT VS MESH                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   WITHOUT MESH (Inconsistent):                                               │
│   ════════════════════════════                                               │
│                                                                              │
│   Product queries ────► Mesh ────► ACO                                       │
│   Cart queries ───────► Mesh ────► Commerce                                  │
│   Persona auth ───────► I/O Action directly       ❌ Different path!         │
│                                                                              │
│   Problems:                                                                  │
│   • Frontend needs multiple endpoints                                        │
│   • Logging scattered across systems                                         │
│   • No central error handling                                                │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────      │
│                                                                              │
│   WITH MESH (Consistent):                                                    │
│   ═══════════════════════                                                    │
│                                                                              │
│   Product queries ────► Mesh ────► ACO                                       │
│   Cart queries ───────► Mesh ────► Commerce                                  │
│   Persona auth ───────► Mesh ────► I/O Action     ✅ Same path!              │
│                                                                              │
│   Benefits:                                                                  │
│   ✅ Frontend only knows mesh endpoint                                       │
│   ✅ All logging in one place                                                │
│   ✅ Consistent error handling                                               │
│   ✅ BuildRight_* naming convention maintained                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Privacy: Masked Emails in Logs

All logging masks personal information. Even if logs are exposed, emails are protected:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PII PROTECTION                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   What Gets Logged:                                                          │
│   ══════════════════                                                         │
│                                                                              │
│   [PersonaAuth] Received authentication request                              │
│   { email: "sar***@***" }                                                    │
│                                                                              │
│   [PersonaAuth] Authentication successful                                    │
│   { email: "sar***@***" }                                                    │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────      │
│                                                                              │
│   What NEVER Gets Logged:                                                    │
│   ════════════════════════                                                   │
│                                                                              │
│   ❌ Full email addresses                                                    │
│   ❌ Passwords (not even masked)                                             │
│   ❌ JWT tokens                                                              │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────      │
│                                                                              │
│   Email Masking Examples:                                                    │
│   ════════════════════════                                                   │
│                                                                              │
│   sarah.martinez@sunbelthomes.com  →  sar***@***                             │
│   marcus.johnson@johnsonconstruction.com  →  mar***@***                      │
│   a@example.com  →  a***@***                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 5 Demo Personas

| Persona | Email | Role | Sees |
|---------|-------|------|------|
| **Sarah Martinez** | sarah.martinez@sunbelthomes.com | Production Builder | Wholesale pricing, bulk discounts |
| **Marcus Johnson** | marcus.johnson@johnsonconstruction.com | General Contractor | Contractor pricing, project tools |
| **Lisa Chen** | lisa.chen@chendesignbuild.com | Remodeling Contractor | Design materials, specialty items |
| **David Thompson** | david.thompson@email.com | Pro Homeowner | DIY-friendly products, how-tos |
| **Kevin Rodriguez** | kevin.rodriguez@precisionlumber.com | Store Manager | Admin view, all pricing tiers |

Each persona has a unique combination of:
- **Catalog View** - What products they can see
- **Price Book** - What prices they pay
- **Features** - What tools they can access

---

## Demo Talking Points

When explaining persona authentication to clients:

1. **"One-click login"** - Demo users click a name, no password typing
2. **"Real authentication"** - We generate actual Commerce JWT tokens
3. **"Passwords stay secure"** - Stored only on server, never in browser
4. **"Same flow as production"** - Uses same GraphQL mutation pattern
5. **"Centralized logging"** - All auth goes through mesh, easy to debug
6. **"Privacy first"** - Emails masked in all logs

---

## Technical Flow Summary

```
User clicks persona
       │
       ▼
Frontend: BuildRight_authenticatePersona(email)
       │
       ▼
Mesh Resolver: validates, masks PII, delegates
       │
       ▼
I/O Action: looks up password, calls Commerce
       │
       ▼
Commerce: generateCustomerToken → JWT
       │
       ▼
Frontend: stores token, dropins authenticated
```

---

## Related Documentation

- [Adapter Pattern](./adapter-pattern.md) - How mesh intercepts all queries
- [Source Architecture](./source-architecture.md) - Mesh source configuration
- [Technical Reference](../../reference/mesh/persona-auth.md) - Implementation details
- [ADR-018](../../adr/ADR-018-mesh-based-persona-authentication.md) - Decision rationale
