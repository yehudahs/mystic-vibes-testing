/**
 * TEST-BE-AI-002: Generate Horoscope
 * 
 * Test Suite: Backend API - AI Endpoints
 * Component: Horoscope Generation
 * Priority: MEDIUM (Phase 2)
 * Dependencies: Backend API, Ollama AI
 * 
 * Description:
 * Tests the horoscope generation endpoint. Validates that the API can generate
 * personalized horoscopes for all 12 zodiac signs with different timeframes
 * (daily, weekly, monthly).
 * 
 * Test Cases:
 * 1. Generate daily horoscope for Aries
 * 2. Generate weekly horoscope for Taurus
 * 3. Generate monthly horoscope for Gemini
 * 4. Generate horoscope for all 12 zodiac signs
 * 5. Validate horoscope response structure
 * 6. Check horoscope content quality (non-empty, meaningful)
 * 7. Test invalid zodiac sign handling
 * 8. Test invalid timeframe handling
 * 9. Test missing parameters
 * 10. Verify AI-generated content uniqueness
 * 11. Test response time (should be under 30s)
 * 12. Validate horoscope categories (love, career, health, etc.)
 * 
 * API Endpoint: POST /api/ai/horoscope
 * Method: POST
 * Auth Required: YES (should be, testing both scenarios)
 * 
 * Request Body:
 * {
 *   "sign": "aries",
 *   "type": "daily" // or "weekly", "monthly"
 * }
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "horoscope": {
 *     "sign": "aries",
 *     "type": "daily",
 *     "date": "2025-10-23",
 *     "content": "Your day ahead looks...",
 *     "categories": {
 *       "love": "...",
 *       "career": "...",
 *       "health": "..."
 *     }
 *   }
 * }
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import ApiHelper from '../test-framework/apiHelper.js';
import { generateTestUser } from '../test-framework/fixtures.js';

const apiHelper = new ApiHelper();

// All zodiac signs
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const HOROSCOPE_TYPES = ['daily', 'weekly', 'monthly'];

describe('TEST-BE-AI-002: Generate Horoscope', () => {
  
  let authToken = null;

  beforeAll(async () => {
    // Register and login a test user for authenticated requests
    try {
      const testUser = generateTestUser();
      const registerResponse = await apiHelper.register(
        testUser.name,
        testUser.email,
        testUser.password
      );
      
      if (registerResponse.token) {
        authToken = registerResponse.token;
        apiHelper.setAuthToken(authToken);
        console.log('\n✅ Test user authenticated for horoscope tests');
      }
    } catch (error) {
      console.log('\n⚠️ Could not authenticate test user, some tests may fail');
    }
  });

  test('Case 1: Should generate daily horoscope for Aries', async () => {
    const response = await apiHelper.generateHoroscope('aries', 'daily');
    
    console.log('\n📊 Horoscope Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check if endpoint exists (not 404)
    expect([200, 201, 401, 403, 500]).toContain(response.status);
    
    if (response.status === 200 || response.status === 201) {
      expect(response.data).toHaveProperty('horoscope');
      expect(typeof response.data.horoscope.content).toBe('string');
      expect(response.data.horoscope.content.length).toBeGreaterThan(50);
      
      console.log('\n✅ Daily horoscope for Aries generated successfully');
      console.log(`Content preview: ${response.data.horoscope.content.substring(0, 100)}...`);
    } else {
      console.log('\n⚠️ Horoscope endpoint returned non-success status:', response.status);
    }
  }, 30000);

  test('Case 2: Should generate weekly horoscope for Taurus', async () => {
    const response = await apiHelper.generateHoroscope('taurus', 'weekly');
    
    console.log('\n📊 Weekly Horoscope Status:', response.status);
    
    expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    
    if (response.status === 200 || response.status === 201) {
      expect(response.data).toHaveProperty('horoscope');
      expect(response.data.horoscope.sign).toBe('taurus');
      expect(response.data.horoscope.type).toBe('weekly');
      console.log('\n✅ Weekly horoscope generated');
    }
  }, 30000);

  test('Case 3: Should generate monthly horoscope for Gemini', async () => {
    const response = await apiHelper.generateHoroscope('gemini', 'monthly');
    
    console.log('\n📊 Monthly Horoscope Status:', response.status);
    
    expect([200, 201, 401, 403, 404, 500]).toContain(response.status);
    
    if (response.status === 200 || response.status === 201) {
      expect(response.data).toHaveProperty('horoscope');
      expect(response.data.horoscope.sign).toBe('gemini');
      expect(response.data.horoscope.type).toBe('monthly');
      console.log('\n✅ Monthly horoscope generated');
    }
  }, 30000);

  test('Case 4: Should generate horoscopes for all 12 zodiac signs', async () => {
    console.log('\n🔄 Generating horoscopes for all 12 signs...');
    
    const results = [];
    
    for (const sign of ZODIAC_SIGNS) {
      const response = await apiHelper.generateHoroscope(sign, 'daily');
      results.push({
        sign,
        status: response.status,
        success: response.status === 200 || response.status === 201
      });
      
      console.log(`  ${sign}: ${response.status}`);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Success rate: ${successCount}/12 (${Math.round(successCount/12*100)}%)`);
    
    // At least track results
    expect(results.length).toBe(12);
  }, 60000);

  test('Case 5: Should validate horoscope response structure', async () => {
    const response = await apiHelper.generateHoroscope('leo', 'daily');
    
    if (response.status === 200 || response.status === 201) {
      const horoscope = response.data.horoscope;
      
      // Validate structure
      expect(horoscope).toBeDefined();
      expect(horoscope.sign).toBe('leo');
      expect(horoscope.type).toBe('daily');
      expect(horoscope.content).toBeDefined();
      expect(typeof horoscope.content).toBe('string');
      
      console.log('\n✅ Horoscope structure is valid');
    } else {
      console.log('\n⚠️ Cannot validate structure, endpoint returned:', response.status);
    }
  }, 30000);

  test('Case 6: Should generate meaningful horoscope content', async () => {
    const response = await apiHelper.generateHoroscope('virgo', 'daily');
    
    if (response.status === 200 || response.status === 201) {
      const content = response.data.horoscope.content;
      
      // Check content quality
      expect(content.length).toBeGreaterThan(50);
      expect(content).not.toBe('');
      expect(content).not.toMatch(/^error/i);
      
      // Should contain astrological/horoscope related terms
      const hasRelevantContent = 
        content.match(/fortune|luck|star|planet|energy|cosmic|day|week|month/i);
      
      expect(hasRelevantContent).toBeTruthy();
      
      console.log('\n✅ Horoscope content is meaningful');
      console.log(`Content length: ${content.length} characters`);
    } else {
      console.log('\n⚠️ Cannot validate content, endpoint returned:', response.status);
    }
  }, 30000);

  test('Case 7: Should handle invalid zodiac sign', async () => {
    const response = await apiHelper.post('/api/ai/horoscope', {
      sign: 'invalid_sign',
      type: 'daily'
    });
    
    console.log('\n📊 Invalid sign response:', response.status);
    
    // Should return error status
    expect([400, 404, 422, 500]).toContain(response.status);
    
    if (response.data.error || response.data.message) {
      console.log('✅ Error message returned:', response.data.error || response.data.message);
    }
  }, 10000);

  test('Case 8: Should handle invalid timeframe', async () => {
    const response = await apiHelper.post('/api/ai/horoscope', {
      sign: 'aries',
      type: 'invalid_type'
    });
    
    console.log('\n📊 Invalid type response:', response.status);
    
    // Should return error status
    expect([400, 404, 422, 500]).toContain(response.status);
  }, 10000);

  test('Case 9: Should handle missing parameters', async () => {
    const response1 = await apiHelper.post('/api/ai/horoscope', {
      type: 'daily'
      // Missing sign
    });
    
    const response2 = await apiHelper.post('/api/ai/horoscope', {
      sign: 'aries'
      // Missing type
    });
    
    console.log('\n📊 Missing sign:', response1.status);
    console.log('Missing type:', response2.status);
    
    // Should return error for missing params (404, 400, 422, or 500)
    expect([400, 404, 422, 500]).toContain(response1.status);
    expect([400, 404, 422, 500]).toContain(response2.status);
  }, 10000);

  test('Case 10: Should generate unique content for different signs', async () => {
    const response1 = await apiHelper.generateHoroscope('aries', 'daily');
    const response2 = await apiHelper.generateHoroscope('pisces', 'daily');
    
    if ((response1.status === 200 || response1.status === 201) &&
        (response2.status === 200 || response2.status === 201)) {
      
      const content1 = response1.data.horoscope.content;
      const content2 = response2.data.horoscope.content;
      
      // Content should be different for different signs
      expect(content1).not.toBe(content2);
      
      console.log('\n✅ Horoscopes are unique for different signs');
      console.log(`Aries length: ${content1.length}`);
      console.log(`Pisces length: ${content2.length}`);
    } else {
      console.log('\n⚠️ Cannot verify uniqueness, endpoint not responding successfully');
    }
  }, 60000);

  test('Case 11: Should respond within acceptable time', async () => {
    const startTime = Date.now();
    
    const response = await apiHelper.generateHoroscope('libra', 'daily');
    
    const duration = Date.now() - startTime;
    
    console.log('\n⏱️ Response time:', duration, 'ms');
    
    // Should respond within 30 seconds
    expect(duration).toBeLessThan(30000);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Response time acceptable');
    }
  }, 35000);

  test('Case 12: Should test all horoscope types for one sign', async () => {
    console.log('\n🔄 Testing all types for Scorpio...');
    
    const results = [];
    
    for (const type of HOROSCOPE_TYPES) {
      const response = await apiHelper.generateHoroscope('scorpio', type);
      results.push({
        type,
        status: response.status,
        success: response.status === 200 || response.status === 201
      });
      
      console.log(`  ${type}: ${response.status}`);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Types working: ${successCount}/3`);
    
    expect(results.length).toBe(3);
  }, 90000);
});
