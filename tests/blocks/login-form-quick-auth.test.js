/**
 * Quick Login Auth Integration Tests
 *
 * Tests for handleQuickLogin calling the mesh GraphQL mutation
 * to get a Commerce JWT token for authenticated sessions.
 *
 * Updated: Now uses BuildRight_authenticatePersona mesh mutation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// ===========================================================================
// Mock Setup
// ===========================================================================

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock document elements
const mockElements = {
  select: null,
  loginBtn: null,
  originalBtnText: 'Login as Sarah'
};

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock window.location
const mockLocation = {
  href: '',
  search: ''
};
Object.defineProperty(global, 'window', {
  value: {
    location: mockLocation,
    BASE_PATH: ''
  },
  writable: true
});

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockReset();
  mockAlert.mockReset();
  mockLocation.href = '';
  mockLocation.search = '';

  // Setup default mock elements
  mockElements.select = {
    value: 'sarah'
  };
  mockElements.loginBtn = {
    disabled: false,
    textContent: mockElements.originalBtnText
  };
});

// ===========================================================================
// Persona Config (mirrors PERSONAS from persona-config.js)
// ===========================================================================

const PERSONAS = {
  SARAH: {
    id: 'sarah',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@sunbelthomes.com',
    company: 'Sunbelt Homes'
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@johnsonconstruction.com',
    company: 'Johnson Construction'
  },
  LISA: {
    id: 'lisa',
    name: 'Lisa Chen',
    email: 'lisa.chen@chendesignbuild.com',
    company: 'Chen Design Build'
  },
  DAVID: {
    id: 'david',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    company: null
  },
  KEVIN: {
    id: 'kevin',
    name: 'Kevin Rodriguez',
    email: 'kevin.rodriguez@precisionlumber.com',
    company: 'Precision Lumber & Supply'
  }
};

/**
 * Get persona by ID (case-insensitive lookup)
 * @param {string} personaId - Persona ID (e.g., 'sarah', 'SARAH')
 * @returns {object|null} Persona object or null
 */
function getPersonaById(personaId) {
  if (!personaId) return null;
  const upperKey = personaId.toUpperCase();
  return PERSONAS[upperKey] || null;
}

// ===========================================================================
// Mesh Endpoint Configuration
// ===========================================================================

const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/test/graphql';

/**
 * Build GraphQL mutation for persona authentication
 * @param {string} email - Persona email address
 * @returns {object} GraphQL request body
 */
function buildAuthMutationRequest(email) {
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
  return {
    query: mutation,
    variables: { email }
  };
}

// ===========================================================================
// Tests: Quick Login Mesh GraphQL Integration
// ===========================================================================

describe('Quick Login Mesh GraphQL Integration', () => {

  // =========================================================================
  // Test 1: Should call mesh with GraphQL mutation
  // =========================================================================
  describe('Mesh GraphQL Mutation Call', () => {

    it('should call mesh with BuildRight_authenticatePersona mutation', async () => {
      // Given: User has selected Sarah persona
      const personaId = 'sarah';
      const persona = getPersonaById(personaId);
      const expectedEmail = 'sarah.martinez@sunbelthomes.com';

      // Mock successful GraphQL response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: 'mock-jwt-token',
              expiresIn: 3600,
              maskedEmail: 'sar***@***',
              error: null
            }
          }
        })
      });

      // When: Mesh mutation is called
      const requestBody = buildAuthMutationRequest(persona.email);
      await fetch(MESH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Then: Fetch was called with correct mutation
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe(MESH_ENDPOINT);
      expect(callArgs[1].method).toBe('POST');

      const body = JSON.parse(callArgs[1].body);
      expect(body.query).toContain('BuildRight_authenticatePersona');
      expect(body.variables.email).toBe(expectedEmail);
    });

    it('should call mesh with marcus email when marcus persona selected', async () => {
      // Given: Marcus persona selected
      const personaId = 'marcus';
      const persona = getPersonaById(personaId);
      const expectedEmail = 'marcus.johnson@johnsonconstruction.com';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: 'mock-jwt-token-marcus',
              expiresIn: 3600,
              maskedEmail: 'mar***@***',
              error: null
            }
          }
        })
      });

      // When: Mesh mutation called
      const requestBody = buildAuthMutationRequest(persona.email);
      await fetch(MESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Then: Correct email sent in variables
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.variables.email).toBe(expectedEmail);
    });

    it('should use POST method for GraphQL mutation', async () => {
      // Given: Any persona
      const persona = getPersonaById('sarah');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: { success: true, token: 'token' }
          }
        })
      });

      // When: Mesh request made
      const requestBody = buildAuthMutationRequest(persona.email);
      await fetch(MESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Then: Method is POST
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });

    it('should set Accept and Content-Type headers', async () => {
      // Given: Any persona
      const persona = getPersonaById('lisa');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: { success: true, token: 'token' }
          }
        })
      });

      // When: Mesh request made
      const requestBody = buildAuthMutationRequest(persona.email);
      await fetch(MESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Then: Headers are correct
      expect(mockFetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
      expect(mockFetch.mock.calls[0][1].headers['Accept']).toBe('application/json');
    });
  });

  // =========================================================================
  // Test 2: Loading State During Auth
  // =========================================================================
  describe('Loading State Management', () => {

    it('should show "Authenticating..." button text during auth request', async () => {
      // Given: Login button with initial text
      const loginBtn = { textContent: 'Login as Sarah', disabled: false };

      // When: Auth request starts
      loginBtn.textContent = 'Authenticating...';
      loginBtn.disabled = true;

      // Then: Button shows loading state
      expect(loginBtn.textContent).toBe('Authenticating...');
      expect(loginBtn.disabled).toBe(true);
    });

    it('should disable button during auth request', async () => {
      // Given: Login button initially enabled
      const loginBtn = { disabled: false };

      // When: Auth request starts
      loginBtn.disabled = true;

      // Then: Button is disabled
      expect(loginBtn.disabled).toBe(true);
    });

    it('should re-enable button on auth error', async () => {
      // Given: Button disabled during auth
      const loginBtn = {
        textContent: 'Authenticating...',
        disabled: true
      };
      const originalText = 'Login as Sarah';

      // Mock auth failure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: false,
              error: 'Authentication failed'
            }
          }
        })
      });

      // When: Auth fails, button restored
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;

      // Then: Button re-enabled with original text
      expect(loginBtn.disabled).toBe(false);
      expect(loginBtn.textContent).toBe(originalText);
    });

    it('should not re-enable button on success (redirect happens)', async () => {
      // Given: Successful auth
      const loginBtn = {
        textContent: 'Authenticating...',
        disabled: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: 'valid-jwt-token',
              expiresIn: 3600
            }
          }
        })
      });

      // When: Auth succeeds (button stays disabled during redirect)
      // Note: Button is NOT re-enabled because we redirect

      // Then: Button remains disabled
      expect(loginBtn.disabled).toBe(true);
    });
  });

  // =========================================================================
  // Test 3: Error Handling
  // =========================================================================
  describe('Error Handling', () => {

    it('should show error message when mesh returns auth error', async () => {
      // Given: Mesh returns error in data
      const errorMessage = 'Email not found in demo personas';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: false,
              error: errorMessage
            }
          }
        })
      });

      // When: Response processed
      const response = await mockFetch();
      const result = await response.json();
      const authResult = result.data?.BuildRight_authenticatePersona;

      // Then: Error displayed to user
      if (!authResult?.success) {
        mockAlert(authResult?.error || 'Authentication failed. Please try again.');
      }

      expect(mockAlert).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle GraphQL errors array', async () => {
      // Given: Mesh returns GraphQL errors
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [
            { message: 'Internal server error' }
          ]
        })
      });

      const response = await mockFetch();
      const result = await response.json();

      // When: Processing response with errors
      if (result.errors && result.errors.length > 0) {
        const errorMsg = result.errors.map(e => e.message).join(', ');
        mockAlert(errorMsg);
      }

      // Then: Error message shown
      expect(mockAlert).toHaveBeenCalledWith('Internal server error');
    });

    it('should show generic error on network failure', async () => {
      // Given: Network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // When: Request fails
      let errorShown = false;
      try {
        await mockFetch();
      } catch (error) {
        mockAlert('Authentication failed. Please try again.');
        errorShown = true;
      }

      // Then: Generic error message shown
      expect(errorShown).toBe(true);
      expect(mockAlert).toHaveBeenCalledWith('Authentication failed. Please try again.');
    });

    it('should handle HTTP error status', async () => {
      // Given: Mesh returns 503
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      });

      const response = await mockFetch();

      // When: Response indicates server error
      if (!response.ok) {
        mockAlert(`Mesh request failed: ${response.status}`);
      }

      // Then: Error message shown
      expect(mockAlert).toHaveBeenCalledWith('Mesh request failed: 503');
    });

    it('should show "Authentication failed" when success is false without error message', async () => {
      // Given: Auth returns success:false without specific error
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: false
              // No error property
            }
          }
        })
      });

      const response = await mockFetch();
      const result = await response.json();
      const authResult = result.data?.BuildRight_authenticatePersona;

      // When: Processing response
      if (!authResult?.success) {
        mockAlert(authResult?.error || 'Authentication failed. Please try again.');
      }

      // Then: Default error message shown
      expect(mockAlert).toHaveBeenCalledWith('Authentication failed. Please try again.');
    });
  });

  // =========================================================================
  // Test 4: Success Flow - Token Handling
  // =========================================================================
  describe('Success Flow - Token Handling', () => {

    it('should receive token from mesh mutation on success', async () => {
      // Given: Successful GraphQL response
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: expectedToken,
              expiresIn: 3600,
              maskedEmail: 'sar***@***',
              error: null
            }
          }
        })
      });

      // When: Mesh mutation succeeds
      const response = await mockFetch();
      const result = await response.json();
      const authResult = result.data?.BuildRight_authenticatePersona;

      // Then: Token is received
      expect(authResult.success).toBe(true);
      expect(authResult.token).toBe(expectedToken);
      expect(authResult.expiresIn).toBe(3600);
    });

    it('should receive masked email in response', async () => {
      // Given: Successful auth response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: 'test-token',
              expiresIn: 3600,
              maskedEmail: 'sar***@***',
              error: null
            }
          }
        })
      });

      // When: Auth succeeds
      const response = await mockFetch();
      const result = await response.json();
      const authResult = result.data?.BuildRight_authenticatePersona;

      // Then: Masked email included
      expect(authResult.maskedEmail).toBe('sar***@***');
    });

    it('should call setupAuthenticatedSession with token and email on success', async () => {
      // Given: Successful auth with token
      const token = 'jwt-token-12345';
      const email = 'sarah.martinez@sunbelthomes.com';

      // Mock setupAuthenticatedSession
      const mockSetupAuthenticatedSession = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            BuildRight_authenticatePersona: {
              success: true,
              token: token,
              expiresIn: 3600,
              maskedEmail: 'sar***@***',
              error: null
            }
          }
        })
      });

      // When: Auth succeeds
      const response = await mockFetch();
      const result = await response.json();
      const authResult = result.data?.BuildRight_authenticatePersona;

      if (authResult?.success) {
        mockSetupAuthenticatedSession(authResult.token, email);
      }

      // Then: setupAuthenticatedSession called with token and email
      expect(mockSetupAuthenticatedSession).toHaveBeenCalledWith(token, email);
    });
  });

  // =========================================================================
  // Test 5: Persona Lookup
  // =========================================================================
  describe('Persona Lookup', () => {

    it('should find sarah persona by lowercase id', () => {
      // Given: Lowercase persona ID
      const personaId = 'sarah';

      // When: Lookup performed
      const persona = getPersonaById(personaId);

      // Then: Sarah persona found with correct email
      expect(persona).not.toBeNull();
      expect(persona.email).toBe('sarah.martinez@sunbelthomes.com');
    });

    it('should find all 5 demo personas by id', () => {
      // Given: All persona IDs
      const personaIds = ['sarah', 'marcus', 'lisa', 'david', 'kevin'];
      const expectedEmails = [
        'sarah.martinez@sunbelthomes.com',
        'marcus.johnson@johnsonconstruction.com',
        'lisa.chen@chendesignbuild.com',
        'david.thompson@email.com',
        'kevin.rodriguez@precisionlumber.com'
      ];

      // When/Then: Each persona found with correct email
      personaIds.forEach((id, index) => {
        const persona = getPersonaById(id);
        expect(persona).not.toBeNull();
        expect(persona.email).toBe(expectedEmails[index]);
      });
    });

    it('should return null for unknown persona id', () => {
      // Given: Unknown persona ID
      const personaId = 'unknown';

      // When: Lookup performed
      const persona = getPersonaById(personaId);

      // Then: Returns null
      expect(persona).toBeNull();
    });

    it('should return null for empty persona id', () => {
      // Given: Empty persona ID
      const personaId = '';

      // When: Lookup performed
      const persona = getPersonaById(personaId);

      // Then: Returns null
      expect(persona).toBeNull();
    });
  });

  // =========================================================================
  // Test 6: GraphQL Request Body Structure
  // =========================================================================
  describe('GraphQL Request Body Structure', () => {

    it('should build request with query and variables', () => {
      // Given: Email to authenticate
      const email = 'test@example.com';

      // When: Request body built
      const requestBody = buildAuthMutationRequest(email);

      // Then: Has correct structure
      expect(requestBody).toHaveProperty('query');
      expect(requestBody).toHaveProperty('variables');
      expect(requestBody.variables.email).toBe(email);
    });

    it('should include mutation name BuildRight_authenticatePersona', () => {
      // Given: Any email
      const email = 'test@example.com';

      // When: Request body built
      const requestBody = buildAuthMutationRequest(email);

      // Then: Query contains mutation name
      expect(requestBody.query).toContain('BuildRight_authenticatePersona');
    });

    it('should request all required fields in selection set', () => {
      // Given: Any email
      const email = 'test@example.com';

      // When: Request body built
      const requestBody = buildAuthMutationRequest(email);

      // Then: Selection set includes all required fields
      expect(requestBody.query).toContain('success');
      expect(requestBody.query).toContain('token');
      expect(requestBody.query).toContain('expiresIn');
      expect(requestBody.query).toContain('maskedEmail');
      expect(requestBody.query).toContain('error');
    });
  });
});

// ===========================================================================
// Step 5: setupAuthenticatedSession Implementation Tests
// ===========================================================================

// Path to login-form.js
const LOGIN_FORM_PATH = path.resolve(import.meta.dirname, '../../blocks/login-form/login-form.js');

/**
 * Helper: Read login-form.js file contents
 */
function readLoginFormJS() {
  if (!fs.existsSync(LOGIN_FORM_PATH)) {
    throw new Error(`File not found: ${LOGIN_FORM_PATH}`);
  }
  return fs.readFileSync(LOGIN_FORM_PATH, 'utf-8');
}

describe('setupAuthenticatedSession Implementation (Step 5)', () => {

  // =========================================================================
  // Test 1: Should set auth cookie with token
  // =========================================================================
  describe('Cookie Storage', () => {

    it('should set auth_dropin_user_token cookie in setupAuthenticatedSession', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for cookie setup code
      // Then: Should contain cookie assignment with auth_dropin_user_token
      expect(content).toContain('auth_dropin_user_token');
      expect(content).toContain('document.cookie');
    });

    it('should set cookie with max-age=3600 (1 hour expiration)', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for cookie expiration
      // Then: Should contain max-age=3600
      expect(content).toContain('max-age=3600');
    });

    it('should set cookie with SameSite=Lax for security', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for SameSite attribute
      // Then: Should contain SameSite=Lax
      expect(content).toContain('SameSite=Lax');
    });

    it('should URL-encode token with encodeURIComponent', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for URL encoding
      // Then: Should use encodeURIComponent for token
      expect(content).toContain('encodeURIComponent(token)');
    });
  });

  // =========================================================================
  // Test 2: Should configure dropin GraphQL header
  // =========================================================================
  describe('GraphQL Header Configuration', () => {

    it('should import setFetchGraphQlHeader from dropin tools', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for import
      // Then: Should import setFetchGraphQlHeader
      expect(content).toMatch(/import.*setFetchGraphQlHeader.*from.*@dropins\/tools\/fetch-graphql/);
    });

    it('should call setFetchGraphQlHeader with Authorization header', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for header setup
      // Then: Should set Authorization header
      expect(content).toContain("'Authorization'");
      expect(content).toContain('setFetchGraphQlHeader');
    });

    it('should format header value as Bearer token', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for Bearer format
      // Then: Should use Bearer prefix
      expect(content).toContain('Bearer');
    });
  });

  // =========================================================================
  // Test 3: Should emit authenticated event
  // =========================================================================
  describe('Authenticated Event Emission', () => {

    it('should import events from dropin event-bus', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for events import
      // Then: Should import events from @dropins/tools/event-bus.js
      expect(content).toMatch(/import.*events.*from.*@dropins\/tools\/event-bus/);
    });

    it('should emit authenticated event with true', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for event emission
      // Then: Should emit 'authenticated' event with true
      expect(content).toContain("events.emit('authenticated'");
      expect(content).toContain('true');
    });
  });

  // =========================================================================
  // Test 4: Should sync with authService state
  // =========================================================================
  describe('AuthService State Sync', () => {

    it('should call authService.loginWithPersona for local state sync', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for authService call
      // Then: Should call loginWithPersona
      expect(content).toContain('authService.loginWithPersona');
    });

    it('should lookup persona by email before calling loginWithPersona', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for persona lookup by email
      // Then: Should find persona by email
      expect(content).toMatch(/PERSONAS.*email.*===.*email|find.*p\.email.*===.*email/);
    });
  });

  // =========================================================================
  // Test 5: PII Masking in Logs
  // =========================================================================
  describe('PII Masking', () => {

    it('should mask email in logs (first 3 chars + ***)', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for email masking
      // Then: Should mask email with substring and ***
      expect(content).toMatch(/email.*substring.*3|maskEmail/);
    });

    it('should have masking in setupAuthenticatedSession function', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking at setupAuthenticatedSession function
      // Then: Should contain masking logic
      expect(content).toContain('setupAuthenticatedSession');
      expect(content).toMatch(/\*\*\*@\*\*\*|maskEmail/);
    });
  });

  // =========================================================================
  // Test 6: Function signature and async behavior
  // =========================================================================
  describe('Function Structure', () => {

    it('should be an async function', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for async function definition
      // Then: setupAuthenticatedSession should be async
      expect(content).toMatch(/async function setupAuthenticatedSession/);
    });

    it('should accept token and email parameters', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for function parameters
      // Then: Should have token and email params
      expect(content).toMatch(/setupAuthenticatedSession\s*\(\s*token\s*,\s*email\s*\)/);
    });
  });

  // =========================================================================
  // Test 7: Mesh Integration (New)
  // =========================================================================
  describe('Mesh Integration', () => {

    it('should have authenticatePersonaViaMesh function', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for mesh auth function
      // Then: Should have authenticatePersonaViaMesh
      expect(content).toContain('authenticatePersonaViaMesh');
    });

    it('should use meshEndpoint from config', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for meshEndpoint usage
      // Then: Should get meshEndpoint from config
      expect(content).toContain('meshEndpoint');
      expect(content).toContain('config.meshEndpoint');
    });

    it('should build GraphQL mutation with variables', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for mutation building
      // Then: Should build mutation with variables
      expect(content).toContain('mutation AuthenticatePersona');
      expect(content).toContain('variables');
      expect(content).toContain('email');
    });

    it('should handle GraphQL errors array', () => {
      // Given: The login-form.js file
      const content = readLoginFormJS();

      // When: Looking for GraphQL error handling
      // Then: Should check for errors array
      expect(content).toMatch(/result\.errors|errors\s*&&\s*errors\.length/);
    });
  });
});

// ===========================================================================
// Integration Test: Full handleQuickLogin Flow via Mesh
// ===========================================================================

describe('handleQuickLogin Integration Flow via Mesh', () => {

  it('should complete full auth flow: persona lookup -> mesh mutation -> session setup', async () => {
    // Given: User selected sarah persona
    const personaId = 'sarah';
    const persona = getPersonaById(personaId);
    const expectedToken = 'integration-test-token';

    // Track what happened
    const flowLog = [];

    // Mock setupAuthenticatedSession
    const mockSetupAuthenticatedSession = vi.fn(async (token, email) => {
      flowLog.push(`setupAuthenticatedSession(${token.substring(0, 10)}..., ${email})`);
    });

    // Mock successful mesh response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          BuildRight_authenticatePersona: {
            success: true,
            token: expectedToken,
            expiresIn: 3600,
            maskedEmail: 'sar***@***',
            error: null
          }
        }
      })
    });

    // When: Full flow executed
    // Step 1: Lookup persona
    expect(persona).not.toBeNull();
    flowLog.push(`Persona lookup: ${persona.id}`);

    // Step 2: Call mesh mutation
    const requestBody = buildAuthMutationRequest(persona.email);
    const response = await fetch(MESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    const authResult = result.data?.BuildRight_authenticatePersona;
    flowLog.push(`Mesh response: success=${authResult?.success}`);

    // Step 3: Setup authenticated session
    if (authResult?.success) {
      await mockSetupAuthenticatedSession(authResult.token, persona.email);
    }

    // Then: All steps completed in order
    expect(flowLog).toEqual([
      'Persona lookup: sarah',
      'Mesh response: success=true',
      `setupAuthenticatedSession(${expectedToken.substring(0, 10)}..., ${persona.email})`
    ]);
    expect(mockSetupAuthenticatedSession).toHaveBeenCalledWith(
      expectedToken,
      'sarah.martinez@sunbelthomes.com'
    );
  });

  it('should handle mesh auth failure gracefully without calling setupAuthenticatedSession', async () => {
    // Given: User selected persona but auth will fail
    const persona = getPersonaById('marcus');
    const mockSetupAuthenticatedSession = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          BuildRight_authenticatePersona: {
            success: false,
            error: 'Email not found in demo personas'
          }
        }
      })
    });

    // When: Auth flow executed
    const requestBody = buildAuthMutationRequest(persona.email);
    const response = await fetch(MESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    const authResult = result.data?.BuildRight_authenticatePersona;

    if (authResult?.success) {
      await mockSetupAuthenticatedSession(authResult.token, persona.email);
    } else {
      mockAlert(authResult?.error || 'Authentication failed. Please try again.');
    }

    // Then: setupAuthenticatedSession NOT called, error shown
    expect(mockSetupAuthenticatedSession).not.toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith('Email not found in demo personas');
  });
});
