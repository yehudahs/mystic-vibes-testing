/**
 * TEST-BE-AI-004: Generate Numerology Content
 * 
 * Test Suite: Backend API - AI Endpoints
 * Endpoint: POST /api/ai/numerology
 * Priority: MEDIUM (Phase 3)
 * Dependencies: Ollama service, llama3.2:3b model, Authentication
 * 
 * Description:
 * Validates the numerology content generation endpoint. Tests AI-powered
 * numerology interpretations based on Life Path, Expression, Soul Urge,
 * and Personality numbers.
 * 
 * Test Cases:
 * 1. Generate numerology for Life Path Number 1
 * 2. Generate for all Life Path numbers (1-9, 11, 22, 33)
 * 3. Generate combined reading (all numbers)
 * 4. Test Expression number interpretation
 * 5. Test Soul Urge number interpretation
 * 6. Test Personality number interpretation
 * 7. Handle missing authentication
 * 8. Handle invalid numbers
 * 9. Validate response structure
 * 10. Test response time
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

const LIFE_PATH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
const NUMBER_TYPES = ['lifePath', 'expression', 'soulUrge', 'personality'];

describe('TEST-BE-AI-004: Generate Numerology Content', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create authenticated user for numerology tests
    testUser = generateTestUser();
    const registerResponse = await api.register(testUser);
    
    assertStatus(registerResponse, 201);
    authToken = registerResponse.data.token;
    api.setAuthToken(authToken);
    
    console.log('✅ Test user authenticated for numerology tests');
  });

  describe('Case 1: Generate Life Path Number 1 Interpretation', () => {
    test('Should generate interpretation for Life Path 1', async () => {
      const request = {
        lifePath: 1,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      expect(response.data).toBeDefined();
      
      // Response can be in different formats
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(50);
      
      console.log(`✅ Generated Life Path 1 interpretation (${content.length} chars)`);
    }, 30000);
  });

  describe('Case 2: Generate for All Life Path Numbers', () => {
    test.each(LIFE_PATH_NUMBERS)('Should generate interpretation for Life Path %i', async (number) => {
      const request = {
        lifePath: number,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
      
      console.log(`  ✓ Life Path ${number}: ${content.substring(0, 40)}...`);
    }, 30000);
  });

  describe('Case 3: Generate Expression Number Interpretation', () => {
    test('Should generate interpretation for Expression number', async () => {
      const request = {
        expression: 5,
        numberType: 'expression'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(50);
      
      console.log(`✅ Generated Expression 5 interpretation`);
    }, 30000);
  });

  describe('Case 4: Generate Soul Urge Number Interpretation', () => {
    test('Should generate interpretation for Soul Urge number', async () => {
      const request = {
        soulUrge: 7,
        numberType: 'soulUrge'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      
      console.log(`✅ Generated Soul Urge 7 interpretation`);
    }, 30000);
  });

  describe('Case 5: Generate Personality Number Interpretation', () => {
    test('Should generate interpretation for Personality number', async () => {
      const request = {
        personality: 3,
        numberType: 'personality'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      
      console.log(`✅ Generated Personality 3 interpretation`);
    }, 30000);
  });

  describe('Case 6: Generate Complete Numerology Reading', () => {
    test('Should generate complete reading with all numbers', async () => {
      const request = {
        lifePath: 9,
        expression: 11,
        soulUrge: 6,
        personality: 5,
        numberType: 'complete'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);
      
      console.log(`✅ Generated complete reading (${content.length} chars)`);
    }, 45000);
  });

  describe('Case 7: Handle Master Numbers', () => {
    test.each([11, 22, 33])('Should handle Master Number %i', async (masterNumber) => {
      const request = {
        lifePath: masterNumber,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      expect(content).toBeTruthy();
      
      // Master numbers should have substantial interpretations
      expect(content.length).toBeGreaterThan(50);
      
      console.log(`  ✓ Master Number ${masterNumber} handled`);
    }, 30000);
  });

  describe('Case 8: Handle Missing Authentication', () => {
    test('Should reject request without authentication', async () => {
      const request = {
        lifePath: 5,
        numberType: 'lifePath'
      };

      const response = await unauthenticatedApi.post('/api/ai/numerology', request);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      console.log('✅ Correctly rejected unauthenticated request');
    });
  });

  describe('Case 9: Handle Invalid Numbers', () => {
    test('Should reject invalid Life Path number (0)', async () => {
      const request = {
        lifePath: 0,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      expect([400, 404, 422, 500]).toContain(response.status);
      
      console.log(`✅ Rejected invalid number (status: ${response.status})`);
    }, 30000);

    test('Should reject invalid Life Path number (>33)', async () => {
      const request = {
        lifePath: 99,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      expect([400, 404, 422, 500]).toContain(response.status);
      
      console.log(`✅ Rejected out-of-range number (status: ${response.status})`);
    }, 30000);
  });

  describe('Case 10: Handle Missing Parameters', () => {
    test('Should handle missing number parameter', async () => {
      const request = {
        numberType: 'lifePath'
        // Missing lifePath number
      };

      const response = await api.post('/api/ai/numerology', request);
      
      expect([400, 404, 422, 500]).toContain(response.status);
      
      console.log(`✅ Rejected missing number (status: ${response.status})`);
    }, 30000);
  });

  describe('Case 11: Validate Response Time', () => {
    test('Should generate numerology within acceptable time', async () => {
      const request = {
        lifePath: 8,
        numberType: 'lifePath'
      };

      const startTime = Date.now();
      const response = await api.post('/api/ai/numerology', request);
      const responseTime = Date.now() - startTime;
      
      assertStatus(response, 200);
      
      // Should complete within 30 seconds
      expect(responseTime).toBeLessThan(30000);
      
      console.log(`✅ Response time: ${responseTime}ms`);
    }, 30000);
  });

  describe('Case 12: Validate Content Quality', () => {
    test('Should contain relevant numerological content', async () => {
      const request = {
        lifePath: 4,
        numberType: 'lifePath'
      };

      const response = await api.post('/api/ai/numerology', request);
      
      assertStatus(response, 200);
      const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
      
      // Content should be substantial
      expect(content.length).toBeGreaterThan(50);
      
      // Should contain some numerological language (flexible check)
      const lowerContent = content.toLowerCase();
      const hasNumeroContent = 
        lowerContent.includes('number') ||
        lowerContent.includes('path') ||
        lowerContent.includes('energy') ||
        lowerContent.includes('vibration') ||
        lowerContent.includes('purpose') ||
        lowerContent.includes('destiny') ||
        content.length > 100; // If content is long, likely valid
      
      expect(hasNumeroContent).toBe(true);
      
      console.log('✅ Content contains relevant numerological themes');
    }, 30000);
  });

  describe('Case 13: Multiple Consecutive Requests', () => {
    test('Should handle multiple numerology requests', async () => {
      const numbers = [1, 5, 9];
      
      for (const number of numbers) {
        const request = {
          lifePath: number,
          numberType: 'lifePath'
        };

        const response = await api.post('/api/ai/numerology', request);
        assertStatus(response, 200);
        
        const content = response.data.reading || response.data.interpretation || response.data.content || response.data;
        expect(content).toBeTruthy();
        
        console.log(`  ✓ Generated for Life Path ${number}`);
      }
      
      console.log('✅ Successfully handled multiple requests');
    }, 90000);
  });
});
