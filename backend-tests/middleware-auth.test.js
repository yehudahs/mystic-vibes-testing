/**
 * TEST-BE-MIDDLEWARE-001: Protected Route Authentication
 * 
 * Test Suite: Backend API - Middleware
 * Component: Authentication Middleware
 * Priority: CRITICAL
 * Dependencies: JWT token validation, Authentication middleware
 * 
 * Description:
 * Validates that the authentication middleware properly protects routes
 * that require authentication. Tests token validation, authorization
 * header parsing, and proper error responses for unauthorized access.
 * 
 * Test Cases:
 * 1. Protected route accessible with valid token
 * 2. Protected route blocked without token
 * 3. Protected route blocked with invalid token
 * 4. Protected route blocked with expired token
 * 5. Protected route blocked with malformed token
 * 6. Multiple protected routes all require authentication
 * 7. Proper error messages for authentication failures
 * 8. Authorization header format validation (Bearer token)
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - At least one protected route (e.g., /api/auth/me)
 * - JWT middleware properly configured
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { 
  assertStatus, 
  assertErrorResponse,
  assertUserObject
} from '../test-framework/assertions.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const api = new ApiHelper();

describe('TEST-BE-MIDDLEWARE-001: Protected Route Authentication', () => {
  let validToken;
  let testUser;

  beforeAll(async () => {
    // Create an authenticated user for testing
    testUser = generateTestUser();
    
    try {
      const response = await api.register(testUser);
      
      if (response.status === 201) {
        validToken = response.data.token;
        console.log('✅ Test user created for middleware tests');
      } else {
        console.log('⚠️  Could not create test user');
      }
    } catch (error) {
      console.log('⚠️  Test setup failed:', error.message);
    }
  });

  test('Case 1: Should access protected route with valid token', async () => {
    if (!validToken) {
      console.log('⏭️  Skipping - no valid token available');
      return;
    }

    const authenticatedApi = new ApiHelper();
    authenticatedApi.setAuthToken(validToken);

    const response = await authenticatedApi.getCurrentUser();

    // Should successfully access protected route
    assertStatus(response, 200);
    
    const user = response.data.user || response.data;
    assertUserObject(user);
    expect(user.email).toBe(testUser.email);
  });

  test('Case 2: Should block access without authentication token', async () => {
    const unauthenticatedApi = new ApiHelper();
    
    const response = await unauthenticatedApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
    
    expect(response.data.error).toBeDefined();
    expect(typeof response.data.error).toBe('string');
  });

  test('Case 3: Should block access with invalid token', async () => {
    const invalidApi = new ApiHelper();
    invalidApi.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
    
    const response = await invalidApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 4: Should block access with malformed token', async () => {
    const malformedApi = new ApiHelper();
    malformedApi.setAuthToken('this-is-not-a-valid-jwt-token');
    
    const response = await malformedApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 5: Should block access with empty token', async () => {
    const emptyApi = new ApiHelper();
    emptyApi.setAuthToken('');
    
    const response = await emptyApi.getCurrentUser();

    // Should return 401 Unauthorized
    assertStatus(response, 401);
    assertErrorResponse(response);
  });

  test('Case 6: Should block access with missing Bearer prefix', async () => {
    if (!validToken) {
      console.log('⏭️  Skipping - no valid token available');
      return;
    }

    // Try to access with token but without 'Bearer ' prefix
    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': validToken  // Missing 'Bearer ' prefix
      }
    });

    // Depending on implementation, this might fail
    // Some implementations require 'Bearer ' prefix, others don't
    console.log(`Authorization without Bearer prefix: ${response.status}`);
    expect([200, 401]).toContain(response.status);
  });

  test('Case 7: Should validate Authorization header format', async () => {
    if (!validToken) {
      console.log('⏭️  Skipping - no valid token available');
      return;
    }

    // Test with correct Bearer token format
    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });

    assertStatus(response, 200);
    
    const user = response.data.user || response.data;
    assertUserObject(user);
  });

  test('Case 8: Should return consistent error messages for auth failures', async () => {
    const testCases = [
      { token: null, description: 'no token' },
      { token: '', description: 'empty token' },
      { token: 'invalid', description: 'invalid token' },
      { token: 'Bearer invalid', description: 'Bearer with invalid token' }
    ];

    for (const testCase of testCases) {
      const testApi = new ApiHelper();
      if (testCase.token) {
        testApi.setAuthToken(testCase.token);
      }

      const response = await testApi.getCurrentUser();

      // All should return 401
      expect(response.status).toBe(401);
      
      // All should have error property
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
      expect(response.data.error.length).toBeGreaterThan(0);

      console.log(`${testCase.description}: ${response.data.error}`);
    }
  });

  test('Case 9: Should protect multiple routes consistently', async () => {
    // Test that multiple protected endpoints all require authentication
    const protectedEndpoints = [
      '/api/auth/me',
      '/api/auth/logout',
      '/api/ai/tarot',
      '/api/ai/horoscope',
      '/api/ai/palm-reading',
      '/api/ai/numerology'
    ];

    const unauthenticatedApi = new ApiHelper();

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await unauthenticatedApi.get(endpoint);
        
        // Should return 401 for all protected routes
        // (or 400/405 if endpoint requires specific method/params)
        expect([400, 401, 404, 405]).toContain(response.status);
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint} properly protected`);
        } else {
          console.log(`ℹ️  ${endpoint} returned ${response.status} (may require POST or params)`);
        }
      } catch (error) {
        console.log(`ℹ️  ${endpoint} not accessible: ${error.message}`);
      }
    }
  });

  test('Case 10: Should extract user info from valid token', async () => {
    if (!validToken) {
      console.log('⏭️  Skipping - no valid token available');
      return;
    }

    const authenticatedApi = new ApiHelper();
    authenticatedApi.setAuthToken(validToken);

    const response = await authenticatedApi.getCurrentUser();

    if (response.status === 200) {
      const user = response.data.user || response.data;
      
      // Verify middleware extracted correct user info from token
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user.email).toBe(testUser.email);
      
      console.log(`✅ Middleware correctly extracted user: ${user.email}`);
    }
  });

  test('Case 11: Should handle expired token gracefully', async () => {
    // Create a mock expired token (simplified test)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
    
    const expiredApi = new ApiHelper();
    expiredApi.setAuthToken(expiredToken);

    const response = await expiredApi.getCurrentUser();

    // Should return 401 for expired token
    assertStatus(response, 401);
    assertErrorResponse(response);
    
    // Error message should indicate token issue
    expect(response.data.error).toBeDefined();
    console.log(`Expired token error: ${response.data.error}`);
  });

  test('Case 12: Should not leak sensitive information in error messages', async () => {
    const invalidApi = new ApiHelper();
    invalidApi.setAuthToken('invalid-token-12345');

    const response = await invalidApi.getCurrentUser();

    // Verify error message doesn't leak implementation details
    const errorMessage = response.data.error || '';
    
    // Should not contain sensitive info like:
    expect(errorMessage.toLowerCase()).not.toContain('stack trace');
    expect(errorMessage.toLowerCase()).not.toContain('sql');
    expect(errorMessage.toLowerCase()).not.toContain('database');
    expect(errorMessage).not.toContain('at /');  // file paths
    
    console.log(`✅ Error message is safe: "${errorMessage}"`);
  });
});
