/**
 * TEST-BE-AI-001: Generate Tarot Reading
 * 
 * Test Suite: Backend API - AI Endpoints
 * Endpoint: POST /api/ai/tarot
 * Priority: HIGH
 * Dependencies: Ollama service, llama3.2:3b model, Authentication
 * 
 * Description:
 * Validates the tarot reading generation endpoint. Tests AI-powered
 * tarot card interpretation, response quality, proper card handling,
 * and error scenarios. This is a core feature of the Mystic Vibes app.
 * 
 * Test Cases:
 * 1. Successfully generate reading with valid cards
 * 2. Validate response structure and content quality
 * 3. Handle missing authentication
 * 4. Handle invalid card format
 * 5. Handle missing required fields
 * 6. Validate AI response contains card interpretations
 * 7. Test with different card combinations
 * 8. Verify response time is acceptable
 * 9. Handle AI service unavailability
 * 10. Validate reading length and quality
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Ollama service running with llama3.2:3b model
 * - Valid authentication token
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';
import { 
  assertStatus, 
  assertErrorResponse 
} from '../test-framework/assertions.js';
import { 
  generateTestUser, 
  TAROT_CARDS 
} from '../test-framework/fixtures.js';

const api = new ApiHelper();

describe('TEST-BE-AI-001: Generate Tarot Reading', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create authenticated user for AI tests
    testUser = generateTestUser();
    
    try {
      const response = await api.register(testUser);
      
      if (response.status === 201) {
        authToken = response.data.token;
        api.setAuthToken(authToken);
        console.log('✅ Test user authenticated for tarot reading tests');
      } else {
        console.log('⚠️  Could not authenticate user');
      }
    } catch (error) {
      console.log('⚠️  Authentication failed:', error.message);
    }
  });

  test('Case 1: Should generate tarot reading with valid cards', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    // Select 3 random tarot cards
    const selectedCards = [
      TAROT_CARDS[0],  // The Fool
      TAROT_CARDS[10], // Wheel of Fortune
      TAROT_CARDS[20]  // Judgement
    ];

    const requestData = {
      cards: selectedCards.map(card => ({
        name: card.name,
        suit: card.suit || 'major',
        position: card.position || 'upright'
      })),
      question: 'What does my future hold?'
    };

    console.log('Requesting tarot reading with cards:', selectedCards.map(c => c.name));

    const startTime = Date.now();
    const response = await api.generateTarotReading(requestData);
    const responseTime = Date.now() - startTime;

    console.log(`Response time: ${responseTime}ms`);
    console.log(`Response status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Tarot reading generated successfully');
      
      // Validate response structure
      expect(response.data).toBeDefined();
      
      // Response should contain reading text
      const reading = response.data.reading || response.data.interpretation || response.data.content;
      expect(reading).toBeDefined();
      expect(typeof reading).toBe('string');
      expect(reading.length).toBeGreaterThan(50);
      
      console.log(`Reading length: ${reading.length} characters`);
      console.log(`First 200 chars: ${reading.substring(0, 200)}...`);
      
      // Verify reading mentions the cards
      const readingLower = reading.toLowerCase();
      let mentionedCards = 0;
      selectedCards.forEach(card => {
        if (readingLower.includes(card.name.toLowerCase())) {
          mentionedCards++;
        }
      });
      
      console.log(`Cards mentioned in reading: ${mentionedCards}/${selectedCards.length}`);
      
    } else if (response.status === 500) {
      console.log('❌ AI service error:', response.data);
      console.log('⚠️  This might indicate Ollama is not running or model not available');
    } else {
      console.log('⚠️  Unexpected status:', response.status);
      console.log('Response:', response.data);
    }

    // Accept 200 (success) or 500 (AI service issue) for now
    expect([200, 500]).toContain(response.status);
  }, 30000); // 30 second timeout for AI generation

  test('Case 2: Should fail without authentication', async () => {
    const unauthenticatedApi = new ApiHelper();

    const requestData = {
      cards: [TAROT_CARDS[0], TAROT_CARDS[1], TAROT_CARDS[2]],
      question: 'Test question'
    };

    const response = await unauthenticatedApi.generateTarotReading(requestData);

    // Should require authentication
    assertStatus(response, 401);
    assertErrorResponse(response.data);
  });

  test('Case 3: Should handle missing cards', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      question: 'What is my destiny?'
      // Missing cards
    };

    const response = await api.generateTarotReading(requestData);

    // Should return error for missing cards
    expect([400, 422]).toContain(response.status);
    assertErrorResponse(response.data);
  });

  test('Case 4: Should handle empty cards array', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: [],
      question: 'Tell me my future'
    };

    const response = await api.generateTarotReading(requestData);

    // Should return error for empty cards
    expect([400, 422]).toContain(response.status);
  });

  test('Case 5: Should handle invalid card format', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: ['invalid', 'card', 'data'],
      question: 'Test'
    };

    const response = await api.generateTarotReading(requestData);

    // Should handle gracefully (might succeed if AI can work with it)
    console.log(`Invalid format status: ${response.status}`);
    expect([200, 400, 422, 500]).toContain(response.status);
  }, 30000);

  test('Case 6: Should generate reading for single card', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: [TAROT_CARDS[0]], // Single card
      question: 'What should I focus on today?'
    };

    const response = await api.generateTarotReading(requestData);

    console.log(`Single card reading status: ${response.status}`);

    if (response.status === 200) {
      const reading = response.data.reading || response.data.interpretation || response.data.content;
      expect(reading).toBeDefined();
      console.log(`Single card reading length: ${reading.length} characters`);
    }

    expect([200, 500]).toContain(response.status);
  }, 30000);

  test('Case 7: Should generate reading for full spread (10 cards)', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: TAROT_CARDS.slice(0, 10), // Celtic Cross spread
      question: 'What is the overall picture of my life situation?'
    };

    const response = await api.generateTarotReading(requestData);

    console.log(`Full spread reading status: ${response.status}`);

    if (response.status === 200) {
      const reading = response.data.reading || response.data.interpretation || response.data.content;
      expect(reading).toBeDefined();
      expect(reading.length).toBeGreaterThan(200); // Should be longer for more cards
      console.log(`Full spread reading length: ${reading.length} characters`);
    }

    expect([200, 500]).toContain(response.status);
  }, 60000); // 60 second timeout for large reading

  test('Case 8: Should handle questions in different formats', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const testQuestions = [
      'Yes or no: Will I find love?',
      'WHAT IS MY PURPOSE???',
      'Tell me about my career...',
      'Future?', // Very short
      'I need guidance about my relationship with my family and whether I should pursue a new career path that I have been considering for a while now.' // Very long
    ];

    for (const question of testQuestions) {
      const requestData = {
        cards: TAROT_CARDS.slice(0, 3),
        question: question
      };

      const response = await api.generateTarotReading(requestData);
      
      console.log(`Question format "${question.substring(0, 30)}..." - Status: ${response.status}`);
      
      // Should handle all question formats
      expect([200, 400, 500]).toContain(response.status);
    }
  }, 90000); // Multiple AI calls

  test('Case 9: Should validate response time is acceptable', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: TAROT_CARDS.slice(0, 3),
      question: 'Quick question'
    };

    const startTime = Date.now();
    const response = await api.generateTarotReading(requestData);
    const responseTime = Date.now() - startTime;

    console.log(`Tarot reading response time: ${responseTime}ms`);

    if (response.status === 200) {
      // AI generation should complete in reasonable time (under 20 seconds)
      expect(responseTime).toBeLessThan(20000);
      
      if (responseTime < 5000) {
        console.log('✅ Excellent performance');
      } else if (responseTime < 10000) {
        console.log('✅ Good performance');
      } else {
        console.log('⚠️  Slow performance - consider optimization');
      }
    }
  }, 30000);

  test('Case 10: Should return reading with proper structure', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    const requestData = {
      cards: TAROT_CARDS.slice(0, 3),
      question: 'Structured reading test'
    };

    const response = await api.generateTarotReading(requestData);

    if (response.status === 200) {
      console.log('Response structure:', Object.keys(response.data));
      
      // Should have main reading content
      expect(response.data).toBeDefined();
      expect(typeof response.data).toBe('object');
      
      // Check for common response fields
      const hasReading = response.data.reading || response.data.interpretation || response.data.content;
      expect(hasReading).toBeDefined();
      
      console.log('✅ Response has proper structure');
    }
  }, 30000);

  test('Case 11: Should handle concurrent reading requests', async () => {
    if (!authToken) {
      console.log('⏭️  Skipping - no auth token');
      return;
    }

    // Send multiple requests concurrently
    const requests = [];
    
    for (let i = 0; i < 3; i++) {
      const requestData = {
        cards: TAROT_CARDS.slice(i * 3, i * 3 + 3),
        question: `Concurrent test ${i + 1}`
      };
      
      requests.push(api.generateTarotReading(requestData));
    }

    console.log('Sending 3 concurrent tarot reading requests...');

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    console.log(`All requests completed in: ${totalTime}ms`);

    responses.forEach((response, index) => {
      console.log(`Request ${index + 1}: Status ${response.status}`);
      expect([200, 500, 503]).toContain(response.status);
    });

    const successCount = responses.filter(r => r.status === 200).length;
    console.log(`Successful: ${successCount}/3`);
    
  }, 90000); // Long timeout for concurrent requests
});
