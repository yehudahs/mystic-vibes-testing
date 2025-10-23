/**
 * TEST-BE-AUTH-001: User Registration
 * 
 * Priority: Critical
 * Category: API Test
 * Endpoint: POST /api/auth/register
 * 
 * Description: Verify that new users can successfully register with valid credentials.
 */

import { createApiHelper } from '../test-framework/apiHelper.js';
import { generateTestUser, TEST_USER_TEMPLATES } from '../test-framework/fixtures.js';
import * as assert from '../test-framework/assertions.js';

describe('TEST-BE-AUTH-001: User Registration', () => {
  let api;

  beforeEach(() => {
    api = createApiHelper();
  });

  describe('Test Case 1: Successful Registration', () => {
    test('should register a new user with valid credentials', async () => {
      // Arrange
      const user = generateTestUser();
      
      // Act
      const response = await api.register(user.name, user.email, user.password);
      
      // Assert
      assert.assertStatus(response, 201, 'Should return 201 Created');
      assert.assertHasFields(response.data, ['user', 'token'], 'Response should contain user and token');
      
      // Verify user object
      assert.assertUserObject(response.data.user);
      expect(response.data.user.name).toBe(user.name);
      expect(response.data.user.email).toBe(user.email);
      
      // Verify JWT token
      assert.assertValidJWT(response.data.token);
      
      // Verify password is NOT in response
      assert.assertNoSensitiveData(response.data.user, ['password']);
      
      console.log('✅ User registered successfully:', response.data.user.email);
    });

    test('should allow immediate login after registration', async () => {
      // Arrange
      const user = generateTestUser();
      
      // Act - Register
      const registerResponse = await api.register(user.name, user.email, user.password);
      assert.assertStatus(registerResponse, 201);
      
      // Act - Login with same credentials
      const loginResponse = await api.login(user.email, user.password);
      
      // Assert
      assert.assertStatus(loginResponse, 200, 'Login should succeed with registered credentials');
      assert.assertAuthResponse(loginResponse);
      expect(loginResponse.data.user.email).toBe(user.email);
      
      console.log('✅ Immediate login successful after registration');
    });
  });

  describe('Test Case 2: Duplicate Email', () => {
    test('should reject registration with duplicate email', async () => {
      // Arrange
      const user = generateTestUser();
      
      // Act - Register first time
      const firstResponse = await api.register(user.name, user.email, user.password);
      assert.assertStatus(firstResponse, 201, 'First registration should succeed');
      
      // Act - Try to register again with same email
      const secondResponse = await api.register(user.name, user.email, user.password);
      
      // Assert
      expect([400, 409]).toContain(secondResponse.status);
      assert.assertErrorResponse(secondResponse, secondResponse.status);
      
      // Verify error message mentions email or duplicate
      const errorMessage = secondResponse.data.error.toLowerCase();
      const hasRelevantError = 
        errorMessage.includes('email') || 
        errorMessage.includes('already') || 
        errorMessage.includes('exists') ||
        errorMessage.includes('duplicate');
      
      expect(hasRelevantError).toBe(true);
      
      console.log('✅ Duplicate email correctly rejected');
    });
  });

  describe('Test Case 3: Missing Required Fields', () => {
    test('should reject registration without name field', async () => {
      // Act
      const response = await api.post('/api/auth/register', {
        email: 'test@example.com',
        password: 'SecurePass123!',
        // missing name
      });
      
      // Assert
      assert.assertErrorResponse(response, 400);
      
      const errorMessage = response.data.error.toLowerCase();
      expect(errorMessage).toContain('name');
      
      console.log('✅ Missing name field correctly rejected');
    });

    test('should reject registration without email field', async () => {
      // Act
      const response = await api.post('/api/auth/register', {
        name: 'Test User',
        password: 'SecurePass123!',
        // missing email
      });
      
      // Assert
      assert.assertErrorResponse(response, 400);
      
      const errorMessage = response.data.error.toLowerCase();
      expect(errorMessage).toContain('email');
      
      console.log('✅ Missing email field correctly rejected');
    });

    test('should reject registration without password field', async () => {
      // Act
      const response = await api.post('/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        // missing password
      });
      
      // Assert
      assert.assertErrorResponse(response, 400);
      
      const errorMessage = response.data.error.toLowerCase();
      expect(errorMessage).toContain('password');
      
      console.log('✅ Missing password field correctly rejected');
    });
  });

  describe('Test Case 4: Invalid Email Format', () => {
    test('should reject registration with invalid email format', async () => {
      // Arrange
      const user = generateTestUser();
      
      // Act - Try with invalid email formats
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@missinglocal.com',
        'spaces in@email.com',
        'double@@domain.com',
      ];
      
      for (const invalidEmail of invalidEmails) {
        const response = await api.register(user.name, invalidEmail, user.password);
        
        // Assert
        assert.assertErrorResponse(response, 400);
        
        const errorMessage = response.data.error.toLowerCase();
        const hasEmailError = 
          errorMessage.includes('email') || 
          errorMessage.includes('invalid') ||
          errorMessage.includes('format');
        
        expect(hasEmailError).toBe(true);
        
        console.log(`✅ Invalid email "${invalidEmail}" correctly rejected`);
      }
    });
  });

  describe('Test Case 5: Weak Password', () => {
    test('should reject registration with weak password', async () => {
      // Arrange
      const user = generateTestUser();
      
      // Act - Try with weak passwords
      const weakPasswords = [
        '123',           // too short
        'abc',           // too short, no numbers
        'password',      // common, no numbers
        '12345678',      // only numbers
      ];
      
      for (const weakPassword of weakPasswords) {
        const response = await api.register(user.name, user.email, weakPassword);
        
        // Assert - should reject with 400
        assert.assertErrorResponse(response, 400);
        
        const errorMessage = response.data.error.toLowerCase();
        const hasPasswordError = 
          errorMessage.includes('password') || 
          errorMessage.includes('weak') ||
          errorMessage.includes('strength') ||
          errorMessage.includes('requirement');
        
        expect(hasPasswordError).toBe(true);
        
        console.log(`✅ Weak password "${weakPassword}" correctly rejected`);
      }
    });
  });
});
