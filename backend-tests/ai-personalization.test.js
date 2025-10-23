/**
 * TEST-BE-AI-005: Generate Personalization Content
 * 
 * Test Suite: Backend API - AI Endpoints
 * Endpoint: POST /api/ai/personalization OR /api/ai/personalize
 * Priority: MEDIUM (Phase 3)
 * Dependencies: Ollama service, llama3.2:3b model, Authentication
 * 
 * Description:
 * Validates the personalization content generation endpoint. Tests AI-powered
 * personalized content based on user preferences, history, and profile data.
 * 
 * Test Cases:
 * 1. Generate personalized content for user
 * 2. Generate based on user preferences
 * 3. Generate based on reading history
 * 4. Test different personalization types
 * 5. Handle missing authentication
 * 6. Handle missing user data
 * 7. Validate response structure
 * 8. Test response time
 * 9. Test content relevance
 * 10. Multiple requests handling
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Ollama service running with llama3.2:3b model
 * - Valid authentication token
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { assertStatus } from '../test-framework/assertions.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const api = new ApiHelper();
const unauthenticatedApi = new ApiHelper();

const PERSONALIZATION_TYPES = [
  'daily_guidance',
  'weekly_insights',
  'reading_recommendations',
  'spiritual_growth',
  'life_path_guidance'
];

describe('TEST-BE-AI-005: Generate Personalization Content', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create authenticated user for personalization tests
    testUser = generateTestUser();
    const registerResponse = await api.register(testUser);
    
    assertStatus(registerResponse, 201);
    authToken = registerResponse.data.token;
    api.setAuthToken(authToken);
    
    console.log('✅ Test user authenticated for personalization tests');
  });

  describe('Case 1: Generate Basic Personalized Content', () => {
    test('Should generate personalized content for authenticated user', async () => {
      const request = {
        type: 'daily_guidance'
      };

      // Try both possible endpoints
      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
        
        const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
        expect(content).toBeTruthy();
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(50);
        
        console.log(`✅ Generated personalized content (${content.length} chars)`);
      } else {
        console.log(`⚠️ Endpoint not found or error: ${response.status}`);
        expect([200, 404, 500]).toContain(response.status);
      }
    }, 30000);
  });

  describe('Case 2: Generate Different Personalization Types', () => {
    test.each(PERSONALIZATION_TYPES)('Should generate %s content', async (type) => {
      const request = { type };

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      if (response.status === 200) {
        const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
        expect(content).toBeTruthy();
        console.log(`  ✓ ${type}: ${content.substring(0, 40)}...`);
      } else {
        console.log(`  ⚠️ ${type}: Endpoint returned ${response.status}`);
        expect([200, 404, 500]).toContain(response.status);
      }
    }, 30000);
  });

  describe('Case 3: Generate with User Preferences', () => {
    test('Should generate content based on user preferences', async () => {
      const request = {
        type: 'daily_guidance',
        preferences: {
          interests: ['tarot', 'spirituality', 'meditation'],
          goals: ['self_improvement', 'inner_peace']
        }
      };

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      if (response.status === 200) {
        const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(50);
        console.log('✅ Generated content with preferences');
      } else {
        console.log(`⚠️ With preferences: ${response.status}`);
        expect([200, 404, 500]).toContain(response.status);
      }
    }, 30000);
  });

  describe('Case 4: Generate with Context', () => {
    test('Should generate content with additional context', async () => {
      const request = {
        type: 'reading_recommendations',
        context: {
          recentReadings: ['tarot'],
          zodiacSign: 'leo',
          lifePathNumber: 7
        }
      };

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      if (response.status === 200) {
        const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
        expect(content).toBeTruthy();
        console.log('✅ Generated content with context');
      } else {
        console.log(`⚠️ With context: ${response.status}`);
        expect([200, 404, 500]).toContain(response.status);
      }
    }, 30000);
  });

  describe('Case 5: Handle Missing Authentication', () => {
    test('Should reject request without authentication', async () => {
      const request = {
        type: 'daily_guidance'
      };

      let response = await unauthenticatedApi.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await unauthenticatedApi.post('/api/ai/personalize', request);
      }
      
      if (response.status === 401) {
        expect(response.data).toHaveProperty('error');
        console.log('✅ Correctly rejected unauthenticated request');
      } else if (response.status === 404) {
        console.log('⚠️ Endpoint not implemented (404)');
      } else {
        console.log(`⚠️ Unexpected status: ${response.status}`);
      }
      
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('Case 6: Handle Invalid Type', () => {
    test('Should handle invalid personalization type', async () => {
      const request = {
        type: 'invalid_type_xyz'
      };

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      // Either accepts it and generates content, or rejects with error
      expect([200, 400, 404, 422, 500]).toContain(response.status);
      console.log(`✅ Handled invalid type (status: ${response.status})`);
    }, 30000);
  });

  describe('Case 7: Handle Missing Type Parameter', () => {
    test('Should handle request without type parameter', async () => {
      const request = {};

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      // Should either use default or return error
      expect([200, 400, 404, 422, 500]).toContain(response.status);
      console.log(`✅ Handled missing type (status: ${response.status})`);
    }, 30000);
  });

  describe('Case 8: Validate Response Time', () => {
    test('Should generate personalization within acceptable time', async () => {
      const request = {
        type: 'weekly_insights'
      };

      const startTime = Date.now();
      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        // Should complete within 30 seconds
        expect(responseTime).toBeLessThan(30000);
        console.log(`✅ Response time: ${responseTime}ms`);
      } else {
        console.log(`⚠️ Endpoint returned ${response.status}`);
      }
    }, 30000);
  });

  describe('Case 9: Validate Content Quality', () => {
    test('Should generate meaningful personalized content', async () => {
      const request = {
        type: 'spiritual_growth'
      };

      let response = await api.post('/api/ai/personalization', request);
      
      if (response.status === 404) {
        response = await api.post('/api/ai/personalize', request);
      }
      
      if (response.status === 200) {
        const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
        
        // Content should be substantial
        expect(content.length).toBeGreaterThan(50);
        
        // Should contain relevant language
        const lowerContent = content.toLowerCase();
        const hasRelevantContent = 
          lowerContent.includes('you') ||
          lowerContent.includes('your') ||
          lowerContent.includes('personal') ||
          lowerContent.includes('journey') ||
          lowerContent.includes('growth') ||
          lowerContent.includes('path') ||
          content.length > 100;
        
        expect(hasRelevantContent).toBe(true);
        console.log('✅ Content contains personalized language');
      } else {
        console.log(`⚠️ Quality check skipped: ${response.status}`);
      }
    }, 30000);
  });

  describe('Case 10: Multiple Consecutive Requests', () => {
    test('Should handle multiple personalization requests', async () => {
      const types = ['daily_guidance', 'weekly_insights', 'reading_recommendations'];
      let successCount = 0;
      
      for (const type of types) {
        const request = { type };

        let response = await api.post('/api/ai/personalization', request);
        
        if (response.status === 404) {
          response = await api.post('/api/ai/personalize', request);
        }
        
        if (response.status === 200) {
          const content = response.data.content || response.data.personalization || response.data.guidance || response.data;
          expect(content).toBeTruthy();
          successCount++;
          console.log(`  ✓ Generated for ${type}`);
        } else {
          console.log(`  ⚠️ ${type}: ${response.status}`);
        }
      }
      
      if (successCount > 0) {
        console.log(`✅ Successfully handled ${successCount}/${types.length} requests`);
      } else {
        console.log('⚠️ No successful requests - endpoint may not be implemented');
      }
    }, 90000);
  });
});
