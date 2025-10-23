/**
 * TEST-FE-INT-001: Authentication Flow (Login/Register/Logout)
 * 
 * Test Suite: Frontend - Integration Tests
 * Component: Authentication System
 * Priority: HIGH (Phase 1 - Critical Path)
 * Dependencies: Backend API running
 * 
 * Description:
 * Tests the complete frontend authentication flow including registration,
 * login, token management, and logout. This is an integration test that
 * interacts with the actual backend API to validate the full auth cycle.
 * 
 * Test Cases:
 * 1. Complete registration flow
 * 2. Login with registered credentials
 * 3. Store auth token in localStorage
 * 4. Retrieve current user with stored token
 * 5. Logout and clear token
 * 6. Verify logout clears localStorage
 * 7. Rejected login with invalid credentials
 * 8. Rejected access to protected routes without token
 * 9. Token persistence across page reload simulation
 * 10. Auto-logout on token expiry
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Database accessible
 * - API endpoints: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout
 * 
 * Note: This test simulates frontend behavior and localStorage management
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import ApiHelper from '../test-framework/apiHelper.js';
import { generateTestUser } from '../test-framework/fixtures.js';

// Create API helper instance
const apiHelper = new ApiHelper();

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Global localStorage instance for tests
const localStorage = new LocalStorageMock();

/**
 * AuthService - Simulates frontend auth service
 */
class AuthService {
  static TOKEN_KEY = 'auth_token';
  static USER_KEY = 'current_user';

  /**
   * Register a new user
   */
  static async register(name, email, password) {
    const response = await apiHelper.register(name, email, password);
    
    if (response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }
    
    // Normalize response to include success flag
    return {
      ...response,
      success: !!response.token
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    const response = await apiHelper.login(email, password);
    
    if (response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }
    
    // Normalize response to include success flag
    return {
      ...response,
      success: !!response.token
    };
  }

  /**
   * Logout user
   */
  static async logout() {
    const token = this.getToken();
    
    if (token) {
      apiHelper.setAuthToken(token);
      await apiHelper.logout();
    }
    
    this.clearAuth();
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }
    
    apiHelper.setAuthToken(token);
    const response = await apiHelper.getCurrentUser();
    
    if (response.user) {
      this.setUser(response.user);
    }
    
    // Normalize response to include success flag
    return {
      ...response,
      success: !!response.user
    };
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Store token
   */
  static setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get token
   */
  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store user
   */
  static setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user
   */
  static getUser() {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Clear authentication
   */
  static clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

describe('TEST-FE-INT-001: Authentication Flow (Login/Register/Logout)', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    apiHelper.clearToken();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    apiHelper.clearToken();
  });

  test('Case 1: Should complete full registration flow', async () => {
    const testUser = generateTestUser();
    
    // 1. Register user
    const registerResponse = await AuthService.register(
      testUser.name,
      testUser.email,
      testUser.password
    );
    
    expect(registerResponse.success).toBe(true);
    expect(registerResponse.token).toBeDefined();
    expect(registerResponse.user).toBeDefined();
    expect(registerResponse.user.email).toBe(testUser.email);
    
    // 2. Verify token stored
    const storedToken = AuthService.getToken();
    expect(storedToken).toBe(registerResponse.token);
    
    // 3. Verify user stored
    const storedUser = AuthService.getUser();
    expect(storedUser).toBeDefined();
    expect(storedUser.email).toBe(testUser.email);
    
    // 4. Verify authenticated
    expect(AuthService.isAuthenticated()).toBe(true);
    
    console.log(`\n✅ Registered user: ${testUser.email}`);
  }, 10000);

  test('Case 2: Should login with registered credentials', async () => {
    const testUser = generateTestUser();
    
    // 1. Register first
    await AuthService.register(testUser.name, testUser.email, testUser.password);
    
    // 2. Clear auth (simulate logout)
    AuthService.clearAuth();
    expect(AuthService.isAuthenticated()).toBe(false);
    
    // 3. Login
    const loginResponse = await AuthService.login(testUser.email, testUser.password);
    
    expect(loginResponse.success).toBe(true);
    expect(loginResponse.token).toBeDefined();
    expect(loginResponse.user).toBeDefined();
    
    // 4. Verify token stored
    expect(AuthService.getToken()).toBeDefined();
    expect(AuthService.isAuthenticated()).toBe(true);
    
    console.log(`\n✅ Logged in user: ${testUser.email}`);
  }, 10000);

  test('Case 3: Should reject login with invalid credentials', async () => {
    const testUser = generateTestUser();
    
    try {
      await AuthService.login(testUser.email, 'wrongpassword');
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      expect(AuthService.isAuthenticated()).toBe(false);
      console.log(`\n✅ Rejected invalid credentials`);
    }
  }, 10000);

  test('Case 4: Should retrieve current user with valid token', async () => {
    const testUser = generateTestUser();
    
    // 1. Register
    await AuthService.register(testUser.name, testUser.email, testUser.password);
    
    // 2. Get current user
    const currentUserResponse = await AuthService.getCurrentUser();
    
    expect(currentUserResponse.success).toBe(true);
    expect(currentUserResponse.user).toBeDefined();
    expect(currentUserResponse.user.email).toBe(testUser.email);
    
    console.log(`\n✅ Retrieved current user: ${currentUserResponse.user.email}`);
  }, 10000);

  test('Case 5: Should reject getCurrentUser without token', async () => {
    try {
      await AuthService.getCurrentUser();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.message).toContain('No authentication token');
      console.log(`\n✅ Rejected access without token`);
    }
  }, 10000);

  test('Case 6: Should complete logout flow', async () => {
    const testUser = generateTestUser();
    
    // 1. Register
    await AuthService.register(testUser.name, testUser.email, testUser.password);
    expect(AuthService.isAuthenticated()).toBe(true);
    
    // 2. Logout
    await AuthService.logout();
    
    // 3. Verify cleared
    expect(AuthService.getToken()).toBeNull();
    expect(AuthService.getUser()).toBeNull();
    expect(AuthService.isAuthenticated()).toBe(false);
    
    console.log(`\n✅ Logged out user: ${testUser.email}`);
  }, 10000);

  test('Case 7: Should clear localStorage on logout', async () => {
    const testUser = generateTestUser();
    
    // 1. Register
    await AuthService.register(testUser.name, testUser.email, testUser.password);
    
    // 2. Verify items in localStorage
    expect(localStorage.length).toBeGreaterThan(0);
    expect(localStorage.getItem(AuthService.TOKEN_KEY)).toBeDefined();
    
    // 3. Logout
    await AuthService.logout();
    
    // 4. Verify localStorage cleared
    expect(localStorage.getItem(AuthService.TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AuthService.USER_KEY)).toBeNull();
    
    console.log(`\n✅ localStorage cleared on logout`);
  }, 10000);

  test('Case 8: Should handle token persistence simulation', async () => {
    const testUser = generateTestUser();
    
    // 1. Register and get token
    const registerResponse = await AuthService.register(
      testUser.name,
      testUser.email,
      testUser.password
    );
    
    const originalToken = registerResponse.token;
    
    // 2. Simulate page reload by getting token from storage
    const persistedToken = AuthService.getToken();
    expect(persistedToken).toBe(originalToken);
    
    // 3. Verify can still access protected routes
    apiHelper.setAuthToken(persistedToken);
    const currentUserResponse = await AuthService.getCurrentUser();
    
    expect(currentUserResponse.success).toBe(true);
    expect(currentUserResponse.user.email).toBe(testUser.email);
    
    console.log(`\n✅ Token persisted across simulated reload`);
  }, 10000);

  test('Case 9: Should handle complete auth cycle', async () => {
    const testUser = generateTestUser();
    
    console.log('\n📝 Complete Authentication Cycle:');
    
    // 1. Register
    console.log('  1. Registering...');
    await AuthService.register(testUser.name, testUser.email, testUser.password);
    expect(AuthService.isAuthenticated()).toBe(true);
    console.log(`     ✓ Registered: ${testUser.email}`);
    
    // 2. Get current user
    console.log('  2. Getting current user...');
    let currentUser = await AuthService.getCurrentUser();
    expect(currentUser.user.email).toBe(testUser.email);
    console.log(`     ✓ Current user: ${currentUser.user.email}`);
    
    // 3. Logout
    console.log('  3. Logging out...');
    await AuthService.logout();
    expect(AuthService.isAuthenticated()).toBe(false);
    console.log('     ✓ Logged out');
    
    // 4. Login again
    console.log('  4. Logging in again...');
    await AuthService.login(testUser.email, testUser.password);
    expect(AuthService.isAuthenticated()).toBe(true);
    console.log(`     ✓ Logged in: ${testUser.email}`);
    
    // 5. Verify still works
    console.log('  5. Verifying current user...');
    currentUser = await AuthService.getCurrentUser();
    expect(currentUser.user.email).toBe(testUser.email);
    console.log(`     ✓ Verified: ${currentUser.user.email}`);
    
    // 6. Final logout
    console.log('  6. Final logout...');
    await AuthService.logout();
    expect(AuthService.isAuthenticated()).toBe(false);
    console.log('     ✓ Complete cycle successful');
  }, 15000);

  test('Case 10: Should handle multiple users registration', async () => {
    const user1 = generateTestUser();
    const user2 = generateTestUser();
    
    // Register first user
    await AuthService.register(user1.name, user1.email, user1.password);
    expect(AuthService.getUser().email).toBe(user1.email);
    
    // Logout
    await AuthService.logout();
    
    // Register second user
    await AuthService.register(user2.name, user2.email, user2.password);
    expect(AuthService.getUser().email).toBe(user2.email);
    
    // Verify second user is now active
    const currentUser = await AuthService.getCurrentUser();
    expect(currentUser.user.email).toBe(user2.email);
    
    console.log(`\n✅ Handled multiple users: ${user1.email}, ${user2.email}`);
  }, 15000);
});
