# Persona Authentication Reference

**Audience:** Developers implementing or debugging persona authentication
**Purpose:** Technical details of the `BuildRight_authenticatePersona` mutation

---

## Overview

The persona auth resolver enables demo personas to authenticate against Adobe Commerce and receive JWT tokens for Commerce dropins (Cart, Checkout, Orders).

```
Frontend → Mesh Resolver → I/O Action → Commerce → JWT Token
              │                │
              └── validates    └── looks up password, calls generateCustomerToken
```

---

## GraphQL Schema

**Location:** `mesh/schema/persona-auth.graphql`

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

---

## Query & Response

### Request

```graphql
mutation AuthenticatePersona($email: String!) {
  BuildRight_authenticatePersona(email: $email) {
    success
    token
    expiresIn
    maskedEmail
    error
  }
}
```

**Variables:**
```json
{
  "email": "sarah.martinez@sunbelthomes.com"
}
```

### Success Response

```json
{
  "data": {
    "BuildRight_authenticatePersona": {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "maskedEmail": "sar***@***",
      "error": null
    }
  }
}
```

### Error Response

```json
{
  "data": {
    "BuildRight_authenticatePersona": {
      "success": false,
      "token": null,
      "expiresIn": null,
      "maskedEmail": "unk***@***",
      "error": "Email not found in demo personas"
    }
  }
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. FRONTEND CALL                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  const mutation = `                                                          │
│    mutation AuthenticatePersona($email: String!) {                           │
│      BuildRight_authenticatePersona(email: $email) {                         │
│        success token expiresIn maskedEmail error                             │
│      }                                                                       │
│    }                                                                         │
│  `;                                                                          │
│                                                                              │
│  fetch(config.meshEndpoint, {                                                │
│    method: 'POST',                                                           │
│    headers: { 'Content-Type': 'application/json' },                          │
│    body: JSON.stringify({                                                    │
│      query: mutation,                                                        │
│      variables: { email }                                                    │
│    })                                                                        │
│  });                                                                         │
│                                                                              │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. MESH RESOLVER (dropin-persona-auth.js)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  async function resolver(root, { email }, context) {                         │
│                                                                              │
│    // 2a. Validate input                                                     │
│    if (!email?.trim()) {                                                     │
│      return { success: false, error: 'Email is required', ... };             │
│    }                                                                         │
│                                                                              │
│    // 2b. Log with masked email (PII protection)                             │
│    context.logger.info('[PersonaAuth] Request', {                            │
│      email: maskEmail(email)  // "sar***@***"                                │
│    });                                                                       │
│                                                                              │
│    // 2c. Call I/O Action (URL injected at build time)                       │
│    const response = await fetch(PERSONA_AUTH_ACTION_URL, {                   │
│      method: 'POST',                                                         │
│      headers: { 'Content-Type': 'application/json' },                        │
│      body: JSON.stringify({ email: email.trim() })                           │
│    });                                                                       │
│                                                                              │
│    // 2d. Return result                                                      │
│    return { success: true, token, expiresIn, maskedEmail, error: null };     │
│  }                                                                           │
│                                                                              │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. I/O RUNTIME ACTION (persona-auth)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  async function main(params) {                                               │
│    const { email } = params;                                                 │
│                                                                              │
│    // 3a. Find persona by email                                              │
│    const persona = personas.find(p => p.email === email);                    │
│    if (!persona) {                                                           │
│      return { success: false, error: 'Email not found' };                    │
│    }                                                                         │
│                                                                              │
│    // 3b. Get password from .env (secure secrets)                            │
│    const password = process.env[`PERSONA_${persona.id}_PASSWORD`];           │
│                                                                              │
│    // 3c. Call Commerce generateCustomerToken                                │
│    const token = await commerceAuth(email, password);                        │
│                                                                              │
│    return { success: true, token, expiresIn: 3600 };                         │
│  }                                                                           │
│                                                                              │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. TOKEN USAGE                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  // Set token for Commerce dropins (Cart, Checkout, Orders)                  │
│  import { setFetchGraphQlHeader } from '@dropins/tools/fetch-graphql.js';    │
│  setFetchGraphQlHeader('Authorization', `Bearer ${token}`);                  │
│                                                                              │
│  // Store in cookie for persistence                                          │
│  document.cookie = `auth_dropin_user_token=${token}; path=/; max-age=3600`;  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resolver Implementation

**Location:** `mesh/resolvers-src/dropin-persona-auth.js`

### Exported Functions

| Function | Purpose |
|----------|---------|
| `maskEmail(email)` | PII protection: `sarah@...` → `sar***@***` |
| `callPersonaAuthAction(email, logger)` | HTTP call to I/O action |
| `resolvers.Mutation.BuildRight_authenticatePersona` | Main resolver |

### maskEmail Behavior

```javascript
maskEmail('sarah.martinez@sunbelthomes.com')  // → "sar***@***"
maskEmail('ab@example.com')                    // → "ab***@***"
maskEmail('a@example.com')                     // → "a***@***"
maskEmail(null)                                // → "***@***"
maskEmail('notanemail')                        // → "***@***"
```

### Error Handling

| Error Condition | Response |
|-----------------|----------|
| Empty email | `{ success: false, error: 'Email is required' }` |
| Whitespace email | `{ success: false, error: 'Email is required' }` |
| Unknown email | `{ success: false, error: 'Email not found in demo personas' }` |
| Network error | `{ success: false, error: 'Network error: ...' }` |
| Action URL not configured | `{ success: false, error: 'Persona auth action URL not configured' }` |

---

## Build Configuration

### Action URL Injection

`mesh/scripts/build-mesh.js` injects the action URL at build time:

```javascript
const actionUrls = [
  'PERSONA_ACTION_URL',
  'PERSONA_AUTH_ACTION_URL',  // ← Required for persona auth
  'BOM_ACTION_URL',
  // ...
];
```

The build script replaces `PERSONA_AUTH_ACTION_URL` with the actual value from `.env`:

```javascript
// Before build
const actionUrl = typeof PERSONA_AUTH_ACTION_URL !== 'undefined'
  ? PERSONA_AUTH_ACTION_URL
  : null;

// After build (in mesh.json)
const actionUrl = "https://namespace.adobeioruntime.net/.../persona-auth";
```

### Environment Variables

**`.env` (buildright-service):**
```bash
PERSONA_AUTH_ACTION_URL=https://<namespace>.adobeioruntime.net/api/v1/web/buildright-service/persona-auth
```

---

## Demo Personas

The resolver works with these 5 demo personas:

| Persona | Email | Role |
|---------|-------|------|
| Sarah Martinez | sarah.martinez@sunbelthomes.com | Production Builder |
| Marcus Johnson | marcus.johnson@johnsonconstruction.com | General Contractor |
| Lisa Chen | lisa.chen@chendesignbuild.com | Remodeling Contractor |
| David Thompson | david.thompson@email.com | Pro Homeowner |
| Kevin Rodriguez | kevin.rodriguez@precisionlumber.com | Store Manager |

---

## Frontend Integration

**Location:** `blocks/login-form/login-form.js`

```javascript
import { getConfig } from '../../scripts/site-config.js';
import { setFetchGraphQlHeader } from '@dropins/tools/fetch-graphql.js';

async function authenticatePersonaViaMesh(email, meshEndpoint) {
  const mutation = `
    mutation AuthenticatePersona($email: String!) {
      BuildRight_authenticatePersona(email: $email) {
        success
        token
        expiresIn
        maskedEmail
        error
      }
    }
  `;

  const response = await fetch(meshEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: { email },
    }),
  });

  const { data, errors } = await response.json();

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data.BuildRight_authenticatePersona;
}

async function handleQuickLogin(email) {
  const config = await getConfig();
  const result = await authenticatePersonaViaMesh(email, config.meshEndpoint);

  if (result.success) {
    // Set token for Commerce dropins
    setFetchGraphQlHeader('Authorization', `Bearer ${result.token}`);

    // Store in cookie for persistence
    document.cookie = `auth_dropin_user_token=${result.token}; path=/; max-age=${result.expiresIn}`;
  }

  return result;
}
```

---

## Testing

### Unit Tests (Resolver)

**Location:** `mesh/__tests__/dropin-persona-auth.test.js`

28 tests covering:
- `maskEmail` utility (9 tests)
- Input validation (4 tests)
- Successful authentication (2 tests)
- Failed authentication (3 tests)
- Action URL configuration (1 test)
- PII protection (2 tests)
- Demo personas (5 tests)
- Response structure (2 tests)

```bash
cd buildright-service/mesh
npm test dropin-persona-auth
```

### Frontend Tests

**Location:** `tests/blocks/login-form-quick-auth.test.js`

44 tests covering:
- GraphQL mutation building
- Response handling
- Cookie management
- Error scenarios

```bash
npm test login-form-quick-auth
```

---

## Debugging

### Common Issues

**1. "Persona auth action URL not configured"**
- Check `.env` has `PERSONA_AUTH_ACTION_URL`
- Rebuild mesh: `npm run build:mesh`

**2. "Email not found in demo personas"**
- Verify email matches exactly (case-sensitive in some cases)
- Check I/O action has persona definitions

**3. Token not working with dropins**
- Verify `setFetchGraphQlHeader` called with correct format
- Check cookie is set: `document.cookie` should contain `auth_dropin_user_token`

### Logging

Mesh resolver logs (visible in mesh logs):
```
[PersonaAuth] Received authentication request { email: "sar***@***" }
[PersonaAuth] Calling action for { email: "sar***@***" }
[PersonaAuth] Authentication successful { email: "sar***@***" }
```

---

## Security Considerations

### What's Protected

| Data | Protection |
|------|------------|
| Persona passwords | Stored in I/O Runtime `.env` only |
| Email addresses | Masked in all logs |
| JWT tokens | Never logged, short-lived (1 hour) |

### Attack Vectors Mitigated

- **Credential exposure**: Passwords never in frontend or mesh code
- **Log harvesting**: PII masked before logging
- **Token theft**: Tokens expire in 1 hour, require cookie + header

---

## Related Documentation

- [ADR-018: Mesh-Based Persona Authentication](../../adr/ADR-018-mesh-based-persona-authentication.md) - Decision rationale
- [Persona Authentication Explained](../../explanations/mesh/persona-authentication.md) - Visual overview
- [Mesh Resolvers Reference](./mesh-resolvers.md) - All mesh resolvers
- [ADR-009: Mesh Adapter Pattern](../../adr/ADR-009-mesh-adapter-resolver-pattern.md) - Pattern this follows
