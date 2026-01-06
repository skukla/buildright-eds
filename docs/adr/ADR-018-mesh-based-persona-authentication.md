# ADR-018: Mesh-Based Persona Authentication

**Status**: Accepted

**Date**: January 2026

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight requires demo personas to authenticate against Adobe Commerce to obtain JWT tokens for the Commerce dropins (Cart, Checkout, Orders). Each persona has pre-configured credentials stored securely in I/O Runtime.

### The Problem

The initial implementation called the I/O Runtime persona-auth action directly via HTTP POST from the frontend:

```
Frontend → HTTP POST → I/O Runtime Action → Commerce generateCustomerToken
```

This bypassed the established mesh architecture, creating inconsistency:
- All other BuildRight operations use the mesh with `BuildRight_*` prefixed mutations
- Direct HTTP calls fragment the API surface
- No centralized logging or error handling
- Frontend needs to know multiple endpoints (mesh + action URLs)

### Options Considered

1. **Direct HTTP to I/O Action** - Call persona-auth action directly (initial implementation)
2. **Commerce GraphQL** - Use standard `generateCustomerToken` mutation via mesh
3. **Mesh Adapter Resolver** - Add `BuildRight_authenticatePersona` mutation that delegates to action

---

## Decision

**Route persona authentication through a mesh adapter resolver (`BuildRight_authenticatePersona`) that delegates to the I/O Runtime persona-auth action.**

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PERSONA AUTH FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Frontend (Quick Login)                                                     │
│         │                                                                    │
│         │ BuildRight_authenticatePersona(email: "sarah@...")                 │
│         ▼                                                                    │
│   ┌─────────────────────────────────────────────────────┐                   │
│   │  API Mesh                                           │                   │
│   │  ┌───────────────────────────────────────────────┐  │                   │
│   │  │  dropin-persona-auth.js                       │  │                   │
│   │  │                                               │  │                   │
│   │  │  1. Validate email                            │  │                   │
│   │  │  2. Mask PII for logging                      │  │                   │
│   │  │  3. Call I/O Action (via PERSONA_AUTH_ACTION) │  │                   │
│   │  │  4. Return result                             │  │                   │
│   │  │                                               │  │                   │
│   │  └───────────────────────────────────────────────┘  │                   │
│   └─────────────────────────────────────────────────────┘                   │
│         │                                                                    │
│         │ HTTP POST with email                                               │
│         ▼                                                                    │
│   ┌─────────────────────────────────────────────────────┐                   │
│   │  I/O Runtime: persona-auth action                   │                   │
│   │                                                     │                   │
│   │  1. Lookup persona by email                         │                   │
│   │  2. Get credentials from .env                       │                   │
│   │  3. Call Commerce generateCustomerToken             │                   │
│   │  4. Return JWT token                                │                   │
│   │                                                     │                   │
│   └─────────────────────────────────────────────────────┘                   │
│         │                                                                    │
│         │ { success, token, expiresIn, maskedEmail }                         │
│         ▼                                                                    │
│   Frontend: setFetchGraphQlHeader('Authorization', `Bearer ${token}`)        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Elements

**GraphQL Schema:**
```graphql
type BuildRight_PersonaAuthResult {
  success: Boolean!
  token: String
  expiresIn: Int
  maskedEmail: String
  error: String
}

extend type Mutation {
  BuildRight_authenticatePersona(email: String!): BuildRight_PersonaAuthResult!
}
```

**Why I/O Action Still Needed:**
- Demo persona passwords stored securely in I/O Runtime `.env`
- Passwords never sent to or stored in frontend
- Action has direct access to Commerce `generateCustomerToken`
- Mesh resolver simply delegates (no credential access)

**PII Protection:**
- Email masked before logging: `sarah.martinez@sunbelthomes.com` → `sar***@***`
- Tokens never logged in full
- All logging uses masked values

---

## Consequences

### Positive Outcomes

**Consistent API Surface**
- All BuildRight operations now go through mesh
- Frontend only needs to know mesh endpoint
- `BuildRight_*` naming convention maintained

**Centralized Control**
- Logging captured in mesh resolver
- Error handling standardized
- Input validation in resolver layer

**Security Maintained**
- Credentials remain in I/O Runtime only
- PII masking prevents log exposure
- Same security as direct HTTP approach

**Testability Improved**
- GraphQL mutation testable via standard tools
- Mock responses for frontend testing
- Resolver unit tests validate business logic

### Negative Outcomes

**Additional Hop**
- Request: Frontend → Mesh → I/O Action → Commerce
- vs. Direct: Frontend → I/O Action → Commerce
- Negligible latency increase (mesh overhead ~10-20ms)

**Build Complexity**
- `PERSONA_AUTH_ACTION_URL` must be injected at mesh build time
- Additional resolver file to maintain
- Schema extension required

---

## Alternatives Rejected

### Alternative 1: Direct HTTP to I/O Action (Initial Implementation)

**Approach**: Frontend calls I/O action directly via HTTP POST.

**Pros**:
- Simpler (one less hop)
- Already implemented

**Cons**:
- Breaks mesh architecture pattern
- Frontend needs multiple endpoints
- No centralized logging
- Inconsistent with other operations

**Why Rejected**: Architectural inconsistency. Every other BuildRight operation goes through mesh with `BuildRight_*` prefix. Direct calls fragment the API surface.

### Alternative 2: Commerce generateCustomerToken via Mesh

**Approach**: Use Commerce source to call standard `generateCustomerToken` mutation.

**Pros**:
- Standard Commerce approach
- No custom resolver needed

**Cons**:
- Would expose credentials in frontend
- Demo persona passwords would need to be in config
- Security violation

**Why Rejected**: Security. Demo passwords must remain server-side only.

### Alternative 3: Custom Commerce Resolver with Hardcoded Credentials

**Approach**: Put persona credentials in mesh resolver code.

**Pros**:
- No I/O action needed
- Simpler deployment

**Cons**:
- Credentials in source control (even if .env)
- Mesh resolvers don't have secure .env access
- Build artifacts would contain credentials

**Why Rejected**: Security. I/O Runtime provides proper secrets management.

---

## Implementation

**Files Created/Modified:**

| File | Purpose |
|------|---------|
| `mesh/schema/persona-auth.graphql` | GraphQL type and mutation definition |
| `mesh/resolvers-src/dropin-persona-auth.js` | Adapter resolver that calls I/O action |
| `mesh/__tests__/dropin-persona-auth.test.js` | 28 unit tests (validation, PII, etc.) |
| `blocks/login-form/login-form.js` | Updated to use GraphQL mutation |
| `tests/blocks/login-form-quick-auth.test.js` | 44 frontend tests for GraphQL approach |

**Build Configuration:**

`mesh/scripts/build-mesh.js` injects `PERSONA_AUTH_ACTION_URL`:
```javascript
const actionUrls = [
  'PERSONA_ACTION_URL',
  'PERSONA_AUTH_ACTION_URL',  // Added
  'BOM_ACTION_URL',
  // ...
];
```

**Environment Setup:**

`.env` requires:
```
PERSONA_AUTH_ACTION_URL=https://<namespace>.adobeioruntime.net/api/v1/web/buildright-service/persona-auth
```

---

## Related Decisions

- [ADR-001: Use Dropins for Commerce Functions](./ADR-001-use-dropins-for-commerce.md) - Commerce dropins for auth/cart/checkout
- [ADR-009: Mesh Adapter Resolver Pattern](./ADR-009-mesh-adapter-resolver-pattern.md) - The pattern this ADR follows
- [ADR-004: Persona Assignment Strategy](./ADR-004-persona-assignment-strategy.md) - How personas map to pricing

---

## References

- [Persona Auth Technical Reference](../reference/mesh/persona-auth.md) - Implementation details
- [Persona Authentication Explained](../explanations/mesh/persona-authentication.md) - Visual explanation
- [buildright-service/mesh/README.md](../../buildright-service/mesh/README.md) - Mesh architecture

---

**Last Updated**: January 2026
