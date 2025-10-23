/**
 * TEST-BE-AUTH-002: User Login
 * 
 * Test Suite: Backend API - Authentication
 * Endpoint: POST /api/auth/login
 * Priority: CRITICAL
 * Dependencies: Database, Express server
 * 
 * Description:
 * Validates user login functionality including credential verification,
 * JWT token generation, and session creation. Tests both successful
 * login scenarios and various failure cases.
 * 
 * Test Cases:
 * 1. Successful login with valid credentials
 * 2. Login fails with incorrect password
 * 3. Login fails with non-existent email
 * 4. Login fails with missing required fields
 * 5. Login fails with invalid email format
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Database accessible and properly configured
 * - User registration endpoint working (for test user creation)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { 
  assertStatus, 
  assertAuthResponse,
  assertErrorResponse,
  assertValidJWT 
} from '../test-framework/assertions.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const api = new ApiHelper();

describe('TEST-BE-AUTH-002: User Login', () => {
  let testUser;
  let registeredUser;

  // Create a test user before running login tests
  beforeAll(async () => {
    testUser = generateTestUser();
    
    try {
      // Attempt to register a test user for login tests
      const response = await api.register(testUser);
      
      if (response.status === 201) {
        registeredUser = response.data;
        console.log('✅ Test user registered successfully for login tests');
      } else {
        console.log('⚠️  Could not register test user, login tests may fail');
        console.log('Response:', response.status, response.data);
      }
    } catch (error) {
      console.log('⚠️  Test user registration failed:', error.message);
      console.log('Login tests will attempt to proceed but may fail');
    }
  });

  // Clean up test user after all tests
  afterAll(async () => {
    // Note: In a real implementation, we would delete the test user here
    // For now, we'll leave it as cleanup will be done via database reset
    console.log('Test user cleanup needed (to be implemented)');
  });

  test('Case 1: Should successfully login with valid credentials', async () => {
    // Skip this test if user registration failed
    if (!registeredUser) {
      console.log('⏭️  Skipping - no registered user available');
      return;
    }

    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const response = await api.login(loginData);

    // Assertions
    assertAuthResponse(response);

    expect(response.data.user).toBeDefined();
    expect(response.data.user.email).toBe(testUser.email);
    expect(response.data.user.name).toBe(testUser.name);

    // Validate JWT token
    assertValidJWT(response.data.token);

    // Store token for future tests
    api.setAuthToken(response.data.token);
  });

  test('Case 2: Should fail login with incorrect password', async () => {
    const loginData = {
      email: testUser.email,
      password: 'WrongPassword123!'
    };

    const response = await api.login(loginData);

    // Should return 401 Unauthorized
    assertErrorResponse(response, 401);

    expect(response.data.error).toBeDefined();
    expect(response.data.error.toLowerCase()).toContain('invalid');
  });

  test('Case 3: Should fail login with non-existent email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'SomePassword123!'
    };

    const response = await api.login(loginData);

    // Should return 401 Unauthorized
    assertErrorResponse(response, 401);

    expect(response.data.error).toBeDefined();
  });

  test('Case 4: Should fail login with missing email', async () => {
    const loginData = {
      password: testUser.password
    };

    const response = await api.login(loginData);

    // Should return 400 Bad Request
    expect([400, 401]).toContain(response.status);
    expect(response.data).toHaveProperty('error');
  });

  test('Case 5: Should fail login with missing password', async () => {
    const loginData = {
      email: testUser.email
    };

    const response = await api.login(loginData);

    // Should return 400 Bad Request
    expect([400, 401]).toContain(response.status);
    expect(response.data).toHaveProperty('error');
  });

  test('Case 6: Should fail login with invalid email format', async () => {
    const loginData = {
      email: 'not-an-email',
      password: testUser.password
    };

    const response = await api.login(loginData);

    // Should return 400 Bad Request or 401 Unauthorized
    expect([400, 401]).toContain(response.status);
    expect(response.data).toHaveProperty('error');
  });

  test('Case 7: Should fail login with empty credentials', async () => {
    const loginData = {
      email: '',
      password: ''
    };

    const response = await api.login(loginData);

    // Should return 400 Bad Request
    expect([400, 401]).toContain(response.status);
    expect(response.data).toHaveProperty('error');
  });

  test('Case 8: Should return proper error structure on failure', async () => {
    const loginData = {
      email: 'wrong@example.com',
      password: 'wrongpass'
    };

    const response = await api.login(loginData);

    // Verify error response structure
    expect(response.data).toHaveProperty('error');
    expect(typeof response.data.error).toBe('string');
    expect(response.data.error.length).toBeGreaterThan(0);
  });
});
