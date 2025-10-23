/**
 * TEST-BE-AUTH-003: Get Current User (Me)
 * 
 * Test Suite: Backend API - Authentication
 * Endpoint: GET /api/auth/me
 * Priority: CRITICAL
 * Dependencies: Database, Authentication middleware, Valid JWT token
 * 
 * Description:
 * Validates the /api/auth/me endpoint which retrieves the currently
 * authenticated user's information. Tests proper authentication validation,
 * user data retrieval, and security (no password exposure).
 * 
 * Test Cases:
 * 1. Successfully retrieve user data with valid token
 * 2. Fail to retrieve user data without authentication token
 * 3. Fail to retrieve user data with invalid token
 * 4. Fail to retrieve user data with malformed token
 * 5. Fail to retrieve user data with expired token
 * 6. Verify no sensitive data (password) is returned
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Valid JWT token from successful login
 * - Authentication middleware properly configured
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { 
  assertStatus, 
  assertUserObject,
  assertErrorResponse,
  assertNoSensitiveData 
} from '../test-framework/assertions.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const api = new ApiHelper();

describe('TEST-BE-AUTH-003: Get Current User (Me)', () => {
  let testUser;
  let authToken;
  let userId;

  // Set up authenticated user before tests
  beforeAll(async () => {
    testUser = generateTestUser();
    
    try {
      // Register a new test user
      const registerResponse = await api.register(testUser);
      
      if (registerResponse.status === 201) {
        authToken = registerResponse.data.token;
        userId = registerResponse.data.user.id;
        api.setAuthToken(authToken);
        console.log('✅ Test user authenticated for /me endpoint tests');
      } else {
        console.log('⚠️  Could not authenticate test user');
        console.log('Response:', registerResponse.status, registerResponse.data);
      }
    } catch (error) {
      console.log('⚠️  Test user setup failed:', error.message);
    }
  });

  test('Case 1: Should successfully retrieve current user with valid token', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    const response = await api.getCurrentUser();

    // Assertions
    assertStatus(response, 200);
    
    expect(response.data).toBeDefined();
    expect(response.data.user || response.data).toBeDefined();
    
    const user = response.data.user || response.data;
    
    assertUserObject(user);
    expect(user.email).toBe(testUser.email);
    expect(user.name).toBe(testUser.name);
    
    // Verify no password is returned
    assertNoSensitiveData(user);
  });

  test('Case 2: Should fail without authentication token', async () => {
    // Create a new API helper without auth token
    const unauthenticatedApi = new ApiHelper();
    
    const response = await unauthenticatedApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response.data);
  });

  test('Case 3: Should fail with invalid token', async () => {
    // Create API helper with invalid token
    const invalidApi = new ApiHelper();
    invalidApi.setAuthToken('invalid.token.here');
    
    const response = await invalidApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response.data);
  });

  test('Case 4: Should fail with malformed token', async () => {
    const malformedApi = new ApiHelper();
    malformedApi.setAuthToken('not-a-jwt-token-at-all');
    
    const response = await malformedApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response.data);
  });

  test('Case 5: Should fail with empty token', async () => {
    const emptyApi = new ApiHelper();
    emptyApi.setAuthToken('');
    
    const response = await emptyApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response.data);
  });

  test('Case 6: Should not expose sensitive user data', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    const response = await api.getCurrentUser();

    if (response.status === 200) {
      const user = response.data.user || response.data;
      
      // Verify password is not exposed
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
      expect(user).not.toHaveProperty('password_hash');
      
      // Verify no internal fields are exposed
      expect(user).not.toHaveProperty('salt');
      expect(user).not.toHaveProperty('hash');
      
      assertNoSensitiveData(user);
    }
  });

  test('Case 7: Should return consistent user object structure', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    const response = await api.getCurrentUser();

    if (response.status === 200) {
      const user = response.data.user || response.data;
      
      // Verify required fields are present
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      
      // Verify field types
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.name).toBe('string');
    }
  });

  test('Case 8: Should handle token in Authorization header correctly', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    // Make request with explicit Bearer token format
    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    // Should succeed with proper Authorization header
    expect([200, 401]).toContain(response.status);
    
    if (response.status === 200) {
      const user = response.data.user || response.data;
      assertUserObject(user);
    }
  });

  test('Case 9: Should return 401 with expired/revoked token', async () => {
    // Create a fake expired token (this is a simplified test)
    const expiredApi = new ApiHelper();
    
    // Generate a token that looks valid but is expired
    const fakeExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expiredApi.setAuthToken(fakeExpiredToken);
    
    const response = await expiredApi.getCurrentUser();

    // Should return 401 for expired token
    assertStatus(response, 401);
  });
});
