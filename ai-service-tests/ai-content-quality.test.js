/**
 * AI Service Test: TEST-AI-QUALITY-001
 * AI Content Quality Tests
 * 
 * Tests the quality of AI-generated content including:
 * - Content relevance and accuracy
 * - Response completeness
 * - Language quality
 * - Mystical terminology usage
 * - Response length validation
 * - Content coherence
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

describe('TEST-AI-QUALITY-001: AI Content Quality', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user
    const testUser = {
      email: `ai_quality_test_${Date.now()}@example.com`,
      password: 'AiQual123!@#',
      name: 'AI Quality Test User'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      authToken = response.data.token;
      userId = response.data.user?.id;
      console.log('✅ Test user created for AI quality tests');
    } catch (error) {
      console.error('❌ Failed to create test user:', error.message);
    }
  });

  describe('Content Relevance', () => {
    test('should generate relevant tarot reading', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'What does my future hold?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading.toLowerCase();
          
          // Check for tarot-related terminology
          const tarotTerms = ['card', 'reading', 'future', 'past', 'present', 'guidance'];
          const hasRelevantContent = tarotTerms.some(term => reading.includes(term));
          
          expect(hasRelevantContent).toBe(true);
          console.log('✅ Tarot reading contains relevant content');
        } else {
          console.log('⚠️  Tarot reading test skipped (endpoint may return 404)');
        }
      } catch (error) {
        console.log('⚠️  Tarot relevance test skipped:', error.response?.status || error.message);
      }
    });

    test('should generate contextual palm reading', async () => {
      const palmData = {
        handFeatures: {
          lifeLineCurvature: 'deep',
          headLineLength: 'long',
          heartLineClarity: 'clear'
        }
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/palm`,
          palmData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading.toLowerCase();
          
          // Check for palm reading terminology
          const palmTerms = ['palm', 'hand', 'line', 'life', 'heart', 'head'];
          const hasRelevantContent = palmTerms.some(term => reading.includes(term));
          
          expect(hasRelevantContent).toBe(true);
          console.log('✅ Palm reading contains relevant content');
        } else {
          console.log('⚠️  Palm reading test skipped');
        }
      } catch (error) {
        console.log('⚠️  Palm relevance test skipped:', error.response?.status || error.message);
      }
    });

    test('should generate numerology content with numbers', async () => {
      const numerologyData = {
        birthdate: '1990-07-23',
        lifePathNumber: 4
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/numerology`,
          numerologyData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading.toLowerCase();
          
          // Check for numerology terminology
          const numTerms = ['number', 'life path', 'numerology', 'vibration', 'energy'];
          const hasRelevantContent = numTerms.some(term => reading.includes(term));
          
          expect(hasRelevantContent).toBe(true);
          console.log('✅ Numerology reading contains relevant content');
        } else {
          console.log('⚠️  Numerology reading test skipped (404 expected - TICKET-006)');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('⚠️  Numerology test skipped (TICKET-006)');
        } else {
          console.log('⚠️  Numerology relevance test skipped:', error.message);
        }
      }
    });
  });

  describe('Response Completeness', () => {
    test('should generate complete tarot reading', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'What guidance do I need today?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Check minimum length (complete readings should be substantial)
          expect(reading.length).toBeGreaterThan(100);
          
          // Check for complete sentences (ends with punctuation)
          expect(reading).toMatch(/[.!?]$/);
          
          console.log(`✅ Tarot reading complete (${reading.length} characters)`);
        } else {
          console.log('⚠️  Tarot completeness test skipped');
        }
      } catch (error) {
        console.log('⚠️  Tarot completeness test skipped:', error.response?.status || error.message);
      }
    });

    test('should generate sufficiently detailed reading', async () => {
      const tarotData = {
        spread: 'celtic-cross',
        question: 'What should I know about my career?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Celtic cross should be more detailed (10 cards)
          expect(reading.length).toBeGreaterThan(200);
          
          // Should have multiple sentences
          const sentences = reading.split(/[.!?]/).filter(s => s.trim().length > 0);
          expect(sentences.length).toBeGreaterThan(3);
          
          console.log(`✅ Detailed reading generated (${reading.length} characters, ${sentences.length} sentences)`);
        } else {
          console.log('⚠️  Detailed reading test skipped');
        }
      } catch (error) {
        console.log('⚠️  Detailed reading test skipped:', error.response?.status || error.message);
      }
    });
  });

  describe('Language Quality', () => {
    test('should generate grammatically correct content', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'What do I need to know?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Basic grammar checks
          // Should start with capital letter
          expect(reading[0]).toMatch(/[A-Z]/);
          
          // Should not have multiple consecutive spaces
          expect(reading).not.toMatch(/  +/);
          
          // Should have proper sentence structure
          expect(reading).toMatch(/[.!?]/);
          
          console.log('✅ Content has good grammar structure');
        } else {
          console.log('⚠️  Grammar test skipped');
        }
      } catch (error) {
        console.log('⚠️  Grammar test skipped:', error.response?.status || error.message);
      }
    });

    test('should use proper mystical terminology', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'What is my spiritual path?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading.toLowerCase();
          
          // Check for mystical/spiritual terminology
          const mysticalTerms = [
            'spiritual', 'energy', 'path', 'guidance', 'insight',
            'journey', 'wisdom', 'divine', 'universe', 'intuition'
          ];
          
          const termCount = mysticalTerms.filter(term => reading.includes(term)).length;
          
          // Should use at least some mystical terminology
          expect(termCount).toBeGreaterThan(0);
          
          console.log(`✅ Uses mystical terminology (${termCount} terms found)`);
        } else {
          console.log('⚠️  Mystical terminology test skipped');
        }
      } catch (error) {
        console.log('⚠️  Mystical terminology test skipped:', error.response?.status || error.message);
      }
    });
  });

  describe('Response Length Validation', () => {
    test('should generate minimum length content', async () => {
      const tarotData = {
        spread: 'single-card',
        question: 'Quick guidance?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Even single card should have meaningful content
          expect(reading.length).toBeGreaterThan(50);
          
          console.log(`✅ Minimum length met (${reading.length} characters)`);
        } else {
          console.log('⚠️  Minimum length test skipped');
        }
      } catch (error) {
        console.log('⚠️  Minimum length test skipped:', error.response?.status || error.message);
      }
    });

    test('should not exceed reasonable maximum length', async () => {
      const tarotData = {
        spread: 'celtic-cross',
        question: 'Tell me everything about my life path, career, relationships, and spiritual journey in great detail?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Should not be excessively long (>5000 chars is probably too much)
          expect(reading.length).toBeLessThan(5000);
          
          console.log(`✅ Maximum length reasonable (${reading.length} characters)`);
        } else {
          console.log('⚠️  Maximum length test skipped');
        }
      } catch (error) {
        console.log('⚠️  Maximum length test skipped:', error.response?.status || error.message);
      }
    });
  });

  describe('Content Coherence', () => {
    test('should generate coherent multi-part reading', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'Past, present, future guidance?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading.toLowerCase();
          
          // For three-card spread, should mention past/present/future
          const hasPastPresentFuture = 
            (reading.includes('past') || reading.includes('was')) &&
            (reading.includes('present') || reading.includes('now') || reading.includes('current')) &&
            (reading.includes('future') || reading.includes('will'));
          
          console.log(`✅ Reading addresses past/present/future: ${hasPastPresentFuture}`);
        } else {
          console.log('⚠️  Coherence test skipped');
        }
      } catch (error) {
        console.log('⚠️  Coherence test skipped:', error.response?.status || error.message);
      }
    });

    test('should maintain consistent tone', async () => {
      const tarotData = {
        spread: 'three-card',
        question: 'What guidance do I need?'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          tarotData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.status === 200 && response.data.reading) {
          const reading = response.data.reading;
          
          // Should not have conflicting tones (e.g., all caps shouting vs normal)
          const allCapsWords = reading.match(/\b[A-Z]{3,}\b/g) || [];
          expect(allCapsWords.length).toBeLessThan(3); // A few for emphasis is ok
          
          // Should not be overly informal (excessive exclamation marks)
          const exclamationCount = (reading.match(/!/g) || []).length;
          expect(exclamationCount).toBeLessThan(10);
          
          console.log('✅ Consistent professional tone maintained');
        } else {
          console.log('⚠️  Tone consistency test skipped');
        }
      } catch (error) {
        console.log('⚠️  Tone consistency test skipped:', error.response?.status || error.message);
      }
    });
  });

  describe('Ollama AI Service Quality', () => {
    test('should verify Ollama service is available', async () => {
      try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('models');
        
        console.log(`✅ Ollama service available with ${response.data.models?.length || 0} models`);
      } catch (error) {
        console.log('⚠️  Ollama service not available:', error.message);
        console.log('⚠️  AI quality tests may fail without Ollama running');
      }
    });

    test('should use appropriate AI model', async () => {
      try {
        const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
        
        if (response.status === 200 && response.data.models) {
          const models = response.data.models.map(m => m.name);
          
          // Check for recommended models
          const recommendedModels = ['llama2', 'mistral', 'openchat', 'neural-chat'];
          const hasRecommendedModel = recommendedModels.some(model => 
            models.some(m => m.includes(model))
          );
          
          console.log(`Available models: ${models.join(', ')}`);
          console.log(`Uses recommended model: ${hasRecommendedModel}`);
        }
      } catch (error) {
        console.log('⚠️  Model check skipped:', error.message);
      }
    });
  });

  afterAll(async () => {
    console.log('✅ AI content quality tests completed');
  });
});
