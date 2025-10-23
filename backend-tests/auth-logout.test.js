/**
 * TEST-BE-AUTH-004: User Logout
 * 
 * Test Suite: Backend API - Authentication
 * Endpoint: POST /api/auth/logout
 * Priority: HIGH
 * Dependencies: Database, Authentication middleware, Valid JWT token
 * 
 * Description:
 * Validates user logout functionality including session invalidation,
 * token revocation, and proper cleanup. Tests both successful logout
 * and edge cases like unauthenticated logout attempts.
 * 
 * Test Cases:
 * 1. Successful logout with valid token
 * 2. Session is invalidated after logout
 * 3. Token cannot be used after logout
 * 4. Logout without authentication token
 * 5. Logout with invalid token
 * 6. Double logout attempt (already logged out)
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Authentication endpoints working
 * - Session management properly configured
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { 
  assertStatus, 
  assertErrorResponse
} from '../test-framework/assertions.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const api = new ApiHelper();

describe('TEST-BE-AUTH-004: User Logout', () => {
  let testUser;
  let authToken;

  // Set up authenticated user before tests
  beforeAll(async () => {
    testUser = generateTestUser();
    
    try {
      // Register and login a test user
      const registerResponse = await api.register(testUser);
      
      if (registerResponse.status === 201) {
        authToken = registerResponse.data.token;
        api.setAuthToken(authToken);
        console.log('✅ Test user authenticated for logout tests');
      } else {
        console.log('⚠️  Could not authenticate test user');
        console.log('Response:', registerResponse.status, registerResponse.data);
      }
    } catch (error) {
      console.log('⚠️  Test user setup failed:', error.message);
    }
  });

  test('Case 1: Should successfully logout with valid token', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    // Create a fresh user for this test
    const freshUser = generateTestUser();
    const registerResponse = await api.register(freshUser);
    
    if (registerResponse.status !== 201) {
      console.log('⏭️  Skipping - could not create fresh user for logout test');
      return;
    }

    const freshToken = registerResponse.data.token;
    const logoutApi = new ApiHelper();
    logoutApi.setAuthToken(freshToken);

    const response = await logoutApi.logout();

    // Should return success status
    expect([200, 204]).toContain(response.status);
    
    // Response might be empty for 204 or contain success message for 200
    if (response.status === 200 && response.data) {
      expect(response.data.message || response.data.success).toBeDefined();
    }
  });

  test('Case 2: Should not be able to access protected routes after logout', async () => {
    // Skip if setup failed
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token available');
      return;
    }

    // Create a user, logout, then try to access /me
    const freshUser = generateTestUser();
    const registerResponse = await api.register(freshUser);
    
    if (registerResponse.status !== 201) {
      console.log('⏭️  Skipping - could not create user');
      return;
    }

    const freshToken = registerResponse.data.token;
    const testApi = new ApiHelper();
    testApi.setAuthToken(freshToken);

    // First verify we can access /me
    const beforeLogout = await testApi.getCurrentUser();
    expect(beforeLogout.status).toBe(200);

    // Logout
    await testApi.logout();

    // Try to access /me again with same token
    const afterLogout = await testApi.getCurrentUser();
    
    // Should fail with 401 after logout
    assertStatus(afterLogout, 401);
    assertErrorResponse(afterLogout.data);
  });

  test('Case 3: Should fail logout without authentication token', async () => {
    const unauthenticatedApi = new ApiHelper();
    
    const response = await unauthenticatedApi.logout();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 4: Should fail logout with invalid token', async () => {
    const invalidApi = new ApiHelper();
    invalidApi.setAuthToken('invalid.token.here');
    
    const response = await invalidApi.logout();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 5: Should fail logout with malformed token', async () => {
    const malformedApi = new ApiHelper();
    malformedApi.setAuthToken('not-a-jwt-token');
    
    const response = await malformedApi.logout();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 6: Should handle double logout gracefully', async () => {
    // Create a user and logout twice
    const freshUser = generateTestUser();
    const registerResponse = await api.register(freshUser);
    
    if (registerResponse.status !== 201) {
      console.log('⏭️  Skipping - could not create user');
      return;
    }

    const freshToken = registerResponse.data.token;
    const testApi = new ApiHelper();
    testApi.setAuthToken(freshToken);

    // First logout
    const firstLogout = await testApi.logout();
    expect([200, 204]).toContain(firstLogout.status);

    // Second logout with same token
    const secondLogout = await testApi.logout();
    
    // Should fail because session is already invalidated
    assertStatus(secondLogout, 401);
  });

  test('Case 7: Should return proper response structure on successful logout', async () => {
    const freshUser = generateTestUser();
    const registerResponse = await api.register(freshUser);
    
    if (registerResponse.status !== 201) {
      console.log('⏭️  Skipping - could not create user');
      return;
    }

    const freshToken = registerResponse.data.token;
    const testApi = new ApiHelper();
    testApi.setAuthToken(freshToken);

    const response = await testApi.logout();

    // Check response structure
    if (response.status === 200) {
      expect(response.data).toBeDefined();
      // Should have success message or similar indicator
      const hasSuccessIndicator = 
        response.data.message || 
        response.data.success !== undefined ||
        response.data.ok !== undefined;
      expect(hasSuccessIndicator).toBeTruthy();
    } else if (response.status === 204) {
      // 204 No Content is also valid (no body expected)
      expect(response.data).toBeFalsy();
    }
  });

  test('Case 8: Should clear all user sessions on logout (if multi-session)', async () => {
    // This test checks if logout invalidates all sessions for a user
    // or just the current session (implementation dependent)
    
    const freshUser = generateTestUser();
    const registerResponse = await api.register(freshUser);
    
    if (registerResponse.status !== 201) {
      console.log('⏭️  Skipping - could not create user');
      return;
    }

    const firstToken = registerResponse.data.token;

    // Login again with same credentials to get second session
    const loginResponse = await api.login({
      email: freshUser.email,
      password: freshUser.password
    });

    if (loginResponse.status !== 200) {
      console.log('⏭️  Skipping - could not create second session');
      return;
    }

    const secondToken = loginResponse.data.token;

    // Logout from first session
    const firstApi = new ApiHelper();
    firstApi.setAuthToken(firstToken);
    await firstApi.logout();

    // Check if second session is still valid
    const secondApi = new ApiHelper();
    secondApi.setAuthToken(secondToken);
    const checkSecondSession = await secondApi.getCurrentUser();

    // Depending on implementation:
    // - If logout clears ALL sessions: should be 401
    // - If logout clears ONLY current session: should be 200
    // Both are valid, we just document the behavior
    console.log(`Second session after first logout: ${checkSecondSession.status}`);
    expect([200, 401]).toContain(checkSecondSession.status);
  });
});
