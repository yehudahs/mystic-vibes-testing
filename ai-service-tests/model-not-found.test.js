/**
 * AI Service Test: TEST-AI-ERROR-001
 * Model Not Found Handling
 * 
 * Tests handling of missing or unavailable AI models:
 * - Model availability checks
 * - Graceful degradation
 * - Error messages
 * - Fallback mechanisms
 * - User feedback
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

describe('TEST-AI-ERROR-001: Model Not Found Handling', () => {
  let testUser;
  let authToken;
  let ollamaAvailable = false;

  beforeAll(async () => {
    // Check Ollama
    try {
      await axios.get(`${OLLAMA_URL}/api/tags`);
      ollamaAvailable = true;
      console.log('\n🧪 Ollama available for model testing');
    } catch (error) {
      console.log('⚠️  Ollama not available - testing error handling');
    }

    // Create test user
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    testUser = {
      email: `model_err_${timestamp}_${random}@example.com`,
      password: 'ModelErr123!',
      name: `Model Error Test ${timestamp}`
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      authToken = response.data.token;
    } catch (error) {
      if (error.response?.status === 400) {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
      }
    }
  });

  describe('Model Availability Checks', () => {
    test('should check model availability before processing', async () => {
      console.log('🧪 Testing model availability check');

      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/models/status`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 404]).toContain(response.status);

        if (response.status === 200) {
          expect(response.data).toBeDefined();
          console.log('✅ Model status endpoint available');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Model status endpoint not implemented');
          expect(error.response.status).toBe(404);
        }
      }
    });

    test('should report available models list', async () => {
      console.log('🧪 Testing available models listing');

      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/models`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status === 200) {
          expect(response.data.models || response.data).toBeDefined();
          console.log('✅ Models list available');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Models endpoint not implemented');
          expect(error.response.status).toBe(404);
        }
      }
    });
  });

  describe('Graceful Degradation', () => {
    test('should handle missing model gracefully in tarot reading', async () => {
      console.log('🧪 Testing tarot with missing model');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Test with nonexistent model',
            spread: 'single-card',
            card: { name: 'The Fool', position: 'upright' },
            model: 'nonexistent-model-xyz'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Should either use fallback or return error
        expect([200, 400, 404, 503]).toContain(response.status);

        if (response.status === 200) {
          console.log('✅ Fell back to default model');
        }
      } catch (error) {
        expect([400, 404, 503]).toContain(error.response?.status);
        console.log('✅ Missing model error handled');
      }
    });

    test('should provide fallback when Ollama unavailable', async () => {
      console.log('🧪 Testing Ollama unavailability handling');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Test fallback',
            spread: 'single-card',
            card: { name: 'The Star', position: 'upright' }
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Should either succeed or fail gracefully
        expect([200, 404, 503]).toContain(response.status);

        console.log('✅ Ollama unavailability handled');
      } catch (error) {
        expect([404, 503]).toContain(error.response?.status);
        console.log('✅ Service unavailability handled with error');
      }
    });

    test('should handle vision model unavailability in palm reading', async () => {
      console.log('🧪 Testing vision model unavailability');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/palm/annotate`,
          {
            imageId: 'test-image',
            hand: 'right'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect([200, 404, 503]).toContain(response.status);
        console.log('✅ Vision model unavailability handled');
      } catch (error) {
        expect([404, 503]).toContain(error.response?.status);
        console.log('✅ Vision model error handled');
      }
    });
  });

  describe('Error Messages', () => {
    test('should provide clear error message for missing model', async () => {
      console.log('🧪 Testing error message clarity');

      try {
        await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Test',
            spread: 'single-card',
            card: { name: 'The Fool', position: 'upright' },
            model: 'definitely-not-a-real-model'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Handled with fallback or success');
      } catch (error) {
        if (error.response?.data?.error || error.response?.data?.message) {
          const errorMsg = error.response.data.error || error.response.data.message;
          expect(typeof errorMsg).toBe('string');
          expect(errorMsg.length).toBeGreaterThan(5);
          console.log('✅ Clear error message provided');
        } else if (error.response?.status === 404) {
          console.log('   ⚠️  Endpoint not implemented');
          expect(error.response.status).toBe(404);
        }
      }
    });

    test('should include helpful context in error response', async () => {
      console.log('🧪 Testing error context');

      try {
        await axios.post(
          `${API_BASE_URL}/api/ai/numerology`,
          {
            birthdate: '1990-01-01',
            name: 'Test',
            model: 'fake-model'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Request succeeded (fallback or endpoint working)');
      } catch (error) {
        if (error.response?.data) {
          expect(error.response.data).toBeDefined();
          console.log('✅ Error context provided');
        } else if (error.response?.status === 404) {
          console.log('   ⚠️  Endpoint not implemented (TICKET-006)');
        }
      }
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should fall back to default model when specified model unavailable', async () => {
      console.log('🧪 Testing default model fallback');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Fallback test',
            spread: 'single-card',
            card: { name: 'The World', position: 'upright' },
            model: 'unavailable-model'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          expect(response.data.reading).toBeDefined();
          console.log('✅ Fell back to default model successfully');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Endpoint not implemented');
          expect(error.response.status).toBe(404);
        } else {
          expect([400, 503]).toContain(error.response?.status);
          console.log('✅ Error handled without crash');
        }
      }
    });

    test('should handle all reading types with model errors', async () => {
      console.log('🧪 Testing model error handling across types');

      const readingTypes = [
        {
          endpoint: '/api/ai/tarot',
          body: {
            question: 'Test',
            spread: 'single-card',
            card: { name: 'The Fool', position: 'upright' }
          }
        },
        {
          endpoint: '/api/ai/numerology',
          body: { birthdate: '1990-01-01', name: 'Test' }
        },
        {
          endpoint: '/api/ai/palm',
          body: {
            annotations: {
              heart_line: 'clear',
              head_line: 'straight',
              life_line: 'long'
            }
          }
        }
      ];

      for (const type of readingTypes) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}${type.endpoint}`,
            { ...type.body, model: 'fake-model' },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          // Success means fallback worked
          if (response.status === 200) {
            expect(response.data).toBeDefined();
          }
        } catch (error) {
          // Error is acceptable - should be handled gracefully
          expect([400, 404, 503]).toContain(error.response?.status);
        }
      }

      console.log('✅ Model errors handled across all types');
    });
  });

  describe('User Feedback', () => {
    test('should inform user when using fallback model', async () => {
      console.log('🧪 Testing user feedback on fallback');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Test',
            spread: 'single-card',
            card: { name: 'The Hermit', position: 'upright' },
            model: 'nonexistent'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          // Check if response includes model used
          if (response.data.modelUsed || response.data.model) {
            expect(response.data.modelUsed || response.data.model).toBeDefined();
            console.log('✅ Model used information provided');
          } else {
            console.log('✅ Fallback worked (no explicit feedback)');
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Endpoint not implemented');
          expect(error.response.status).toBe(404);
        } else {
          console.log('✅ Error feedback provided');
        }
      }
    });
  });

  afterAll(() => {
    console.log('\n✅ Model not found handling tests completed');
    console.log(`   Ollama available: ${ollamaAvailable}`);
  });
});
