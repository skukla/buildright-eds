# ADR-004: Persona Assignment Strategy (via Persona Service)

**Status**: Accepted (Updated January 2026)

**Date**: 2025-11-15 (Original), 2026-01-02 (Updated)

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight needs to map Adobe Commerce customers to one of 5 personas (Sarah, Marcus, Lisa, David, Kevin) to provide personalized experiences. Each persona gets:
- A specific catalog view via ACO (Adobe Commerce Optimizer)
- Persona-specific pricing via price book assignment
- Customized UI and workflows
- Relevant product recommendations

In production, when a customer logs in, we need to determine their persona and set the appropriate ACO headers (`AC-View-Id`, `AC-Price-Book-Id`) for all subsequent requests.

### Key Requirements
1. **Explicit Assignment**: Persona should be explicitly assigned, not inferred dynamically
2. **Persistent**: Assignment should persist across sessions (via sessionStorage)
3. **Single Persona**: Each customer belongs to exactly one persona
4. **Production-Ready**: Must work with real Adobe Commerce
5. **Easy to Query**: Should be simple to retrieve during authentication
6. **ACO Integration**: Must provide catalog view UUID and price book ID for ACO headers

### Research Findings

#### Customer Groups
- **Purpose**: Pricing and tax calculations
- **Cardinality**: Single assignment per customer
- **Use Cases**: Wholesale vs retail pricing
- **Persistence**: Permanent until changed
- **API**: Available via REST and GraphQL
- **Limitation**: Only ~10-20 groups typical, shared across all customers

#### Customer Segments
- **Purpose**: Marketing targeting and promotions
- **Cardinality**: Multiple segments per customer
- **Use Cases**: Dynamic targeting (e.g., "high-value customers")
- **Persistence**: Often recalculated based on rules
- **API**: Available via GraphQL
- **Limitation**: Not designed for explicit, permanent assignments

#### Custom Attributes
- **Purpose**: Flexible customer data storage
- **Cardinality**: Many attributes per customer
- **Use Cases**: Any custom business data
- **Persistence**: Permanent until changed
- **API**: Available via REST and GraphQL
- **Configuration**: Defined in Admin Panel
- **Flexibility**: Can store any data type (text, select, boolean, date, etc.)

---

## Decision

**We use a Persona Service via API Mesh to resolve persona assignments and provide ACO headers.**

### Architecture: Persona Service Pattern

Instead of storing persona as a Commerce custom attribute, we implemented a **Persona Service** that:
1. Receives customer identifier (email or customer group ID) from the frontend
2. Resolves persona from a server-side data source (JSON file or Commerce data)
3. Returns the ACO header values (`catalogViewId`, `priceBookId`) needed for pricing

This approach was chosen because:
- ACO headers require UUIDs, not human-readable strings
- The persona service can evolve independently (JSON → Commerce → external system)
- Centralizes persona logic in the backend, simplifying frontend code

### Persona Values

- `sarah` - Production Builder (catalog: Contractor, pricing: Premium)
- `marcus` - Commercial Project Manager (catalog: General, pricing: Standard)
- `lisa` - Luxury Builder (catalog: Premium, pricing: Premium Plus)
- `david` - Deck Specialist (catalog: DIY, pricing: Standard)
- `kevin` - Facilities Manager (catalog: Facilities, pricing: Basic)

### Implementation

**Primary**: Persona Service via API Mesh (resolves email → persona)
**Demo Mode**: Frontend persona selector with predefined personas
**Default**: Guest persona (default catalog view and price book)

### Frontend Code (mesh-client.js)

```javascript
// Initialize persona by email (recommended)
export async function initializePersonaByEmail(email) {
  const data = await meshQuery(GET_PERSONA_BY_EMAIL, { email });
  const persona = data.BuildRight_personaByEmail;

  if (persona) {
    // Store headers in sessionStorage for subsequent requests
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,  // UUID for AC-View-Id
      priceBookId: persona.priceBookId       // Price book ID for AC-Price-Book-Id
    });
  }
  return persona;
}

// Alternative: by customer group ID
export async function initializePersona(customerGroupId) {
  const data = await meshQuery(GET_PERSONA, { customerGroupId });
  const persona = data.BuildRight_personaForCustomer;
  // ... same pattern
}
```

### Mesh Resolver (buildright-service)

The persona resolver is an App Builder action that:
1. Receives the customer identifier
2. Looks up persona in data source (currently JSON, could be Commerce)
3. Returns `{ name, catalogViewId, priceBookId, tier, ... }`

---

## Consequences

### Positive Outcomes

✅ **Decoupled Architecture**
- Persona logic lives in backend, frontend just consumes headers
- Can evolve data source (JSON → Commerce → external) without frontend changes
- Clear separation between persona resolution and ACO header generation

✅ **ACO-Ready**
- Returns UUIDs directly (not human-readable strings that need mapping)
- Headers (`AC-View-Id`, `AC-Price-Book-Id`) ready to use immediately
- Single source of truth for persona → ACO mapping

✅ **Session Persistence**
- Headers cached in sessionStorage, persist across page navigations
- Single mesh call per session (unless forced refresh)
- No redundant API calls

✅ **Flexible Data Source**
- Currently uses JSON file in buildright-service
- Can migrate to Commerce custom attributes if needed
- Can integrate with external identity providers

✅ **Demo Mode Support**
- Frontend can bypass mesh for demo scenarios
- `persona-config.js` provides fallback persona definitions
- Seamless transition between demo and production modes

### Negative Outcomes

⚠️ **Requires Mesh**
- Persona resolution requires API Mesh to be running
- Additional infrastructure dependency
- Mesh latency on initial load (mitigated by caching)

⚠️ **Not Admin-Visible**
- Persona assignments not visible in Commerce Admin
- Requires buildright-service changes to update mappings
- Less intuitive for non-technical admins

⚠️ **Session-Scoped**
- Headers cleared on browser close (sessionStorage)
- Re-fetched on new session (by design for security)
- Could add localStorage option if needed

---

## Alternatives Considered

### Alternative 1: Use Customer Groups Exclusively

**Approach**: Map personas directly to customer groups (e.g., "Production Builder Group").

**Pros**:
- No custom attribute needed
- Already used for pricing
- Single source of truth
- Simple to query

**Cons**:
- Customer Groups are primarily for pricing/tax
- Limited to ~20 groups (shared with other uses)
- Conflates pricing logic with persona logic
- Less flexible (can't add metadata)
- Misuse of intended purpose

**Why Rejected**: Customer Groups are for pricing, not persona assignment. Using them for personas conflates concerns and limits flexibility.

---

### Alternative 2: Use Customer Segments Exclusively

**Approach**: Create segments for each persona, check which segments customer belongs to.

**Pros**:
- Can use dynamic rules
- Built-in Admin UI
- Can target with promotions

**Cons**:
- Customer can belong to multiple segments (need conflict resolution)
- Segments are designed for dynamic targeting, not explicit assignment
- More complex to query
- May recalculate over time
- Not designed for single, persistent assignment

**Why Rejected**: Segments are for dynamic targeting, not explicit assignment. Multiple segment membership creates complexity.

---

### Alternative 3: Store in External Database

**Approach**: Maintain persona assignments in separate database, key by customer email/ID.

**Pros**:
- Complete control
- Can add any metadata
- Not constrained by Adobe Commerce

**Cons**:
- Additional infrastructure
- Sync issues between systems
- More complex architecture
- Not visible in Admin Panel
- Requires custom API

**Why Rejected**: Adds unnecessary complexity. Adobe Commerce already provides the mechanism we need.

---

### Alternative 4: Infer from Business Attributes

**Approach**: Determine persona dynamically based on custom attributes (business_type, project_scale, etc.).

**Pros**:
- No explicit persona assignment needed
- Persona can change as attributes change
- More "intelligent" system

**Cons**:
- Inference logic could be wrong
- Customer can't override if logic is incorrect
- More complex to debug
- Persona could change unexpectedly
- Harder to predict experience

**Why Rejected**: Too magical. Better to have explicit assignment with option to change. However, we DO use inference during **sign-up** to suggest initial persona.

---

## Implementation Details

### Key Files

| File | Purpose |
|------|---------|
| `scripts/services/mesh-client.js` | `initializePersonaByEmail()`, `setPersonaHeaders()` |
| `scripts/services/queries.js` | GraphQL queries: `GET_PERSONA`, `GET_PERSONA_BY_EMAIL` |
| `scripts/persona-config.js` | Frontend persona definitions (demo mode fallback) |
| `scripts/initializers/index.js` | Dropin initialization, sets headers after persona fetch |
| `buildright-service/mesh/resolvers-src/persona.js` | Mesh resolver for persona queries |

### Flow: Login → Persona → ACO Headers

```
1. User logs in via Auth Dropin
2. Auth dropin emits 'authenticated' event with user email
3. Frontend calls initializePersonaByEmail(email) → API Mesh
4. Mesh resolver looks up email → persona mapping
5. Returns { name, catalogViewId, priceBookId, tier, ... }
6. Frontend stores headers in sessionStorage via setPersonaHeaders()
7. All subsequent mesh queries include AC-View-Id, AC-Price-Book-Id headers
8. ACO returns persona-specific catalog and pricing
```

### GraphQL Queries

```graphql
# By email (recommended - used after auth)
query GetPersonaByEmail($email: String!) {
  BuildRight_personaByEmail(email: $email) {
    id
    name
    email
    catalogViewId
    priceBookId
    tier
  }
}

# By customer group ID (legacy)
query GetPersona($customerGroupId: String!) {
  BuildRight_personaForCustomer(customerGroupId: $customerGroupId) {
    # same fields
  }
}
```

### Header Storage (sessionStorage)

```javascript
// After persona fetch, stored as:
sessionStorage.setItem('buildright_persona_headers', JSON.stringify({
  'AC-View-Id': 'uuid-from-persona-service',
  'AC-Price-Book-Id': 'price-book-id'
}));

// Retrieved by getPersonaHeaders() and added to all mesh queries
```

### Demo Mode Fallback

When Commerce Dropins are disabled (`config.features.useCommerceDropins: false`), the auth-dropin block shows a persona selector using `scripts/persona-config.js`:

```javascript
export const PERSONAS = {
  sarah: { id: 'sarah', name: 'Sarah Martinez', email: 'sarah@buildright.demo', ... },
  marcus: { id: 'marcus', name: 'Marcus Johnson', email: 'marcus@buildright.demo', ... },
  // ... etc
};
```

---

## Related Decisions

- [ADR-003: Mock ACO Service](./ADR-003-mock-aco-service.md) - How persona maps to catalog view
- [ADR-005: Dual-Mode Authentication](./ADR-005-dual-mode-authentication.md) - How auth retrieves persona

---

## References

- [Authentication Strategy Documentation](../archive/reference-old/auth-strategy.md)
- [Adobe Commerce REST API - Customers](https://developer.adobe.com/commerce/webapi/rest/use-rest/customer-setup/)
- [Adobe Commerce Custom Attributes](https://experienceleague.adobe.com/docs/commerce-admin/customers/customer-accounts/attributes/attribute-properties.html)

---

**Last Updated**: January 2, 2026

**Change History**:
- **2026-01-02**: Major update - Rewrote to reflect actual Persona Service implementation via API Mesh. Original decision described Commerce custom attributes which were not implemented.
- **2025-11-15**: Original decision (Commerce custom attribute approach)

