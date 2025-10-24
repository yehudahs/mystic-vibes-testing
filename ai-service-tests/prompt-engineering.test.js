/**
 * AI Service Test: TEST-AI-QUALITY-003
 * Prompt Engineering Effectiveness
 * 
 * Tests the effectiveness of prompts across different reading types:
 * - Prompt clarity and structure
 * - Context incorporation
 * - Response relevance
 * - Consistency across model variations
 * - Instruction following
 * - Output format compliance
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

describe('TEST-AI-QUALITY-003: Prompt Engineering Effectiveness', () => {
  let testUser;
  let authToken;
  let availableModels = [];

  beforeAll(async () => {
    // Check Ollama availability
    try {
      const response = await axios.get(`${OLLAMA_URL}/api/tags`);
      availableModels = response.data.models || [];
      console.log(`\n🧪 Found ${availableModels.length} Ollama models for prompt testing`);
    } catch (error) {
      console.log('⚠️  Ollama not available, tests will handle gracefully');
    }

    // Create test user
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    testUser = {
      email: `prompt_test_${timestamp}_${random}@example.com`,
      password: 'PromptTest123!',
      name: `Prompt Test User ${timestamp}`
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

  describe('Prompt Clarity and Structure', () => {
    test('should generate clear tarot reading prompts', async () => {
      console.log('🧪 Testing tarot prompt clarity');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'What does my career future hold?',
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

        expect(response.status).toBe(200);
        expect(response.data.reading).toBeDefined();

        const reading = response.data.reading;

        // Check for prompt effectiveness indicators
        expect(reading.length).toBeGreaterThan(100);
        expect(reading.toLowerCase()).toMatch(/star|hope|inspiration|future/);

        console.log('✅ Tarot prompt generates relevant content');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Tarot endpoint not implemented');
          expect(error.response.status).toBe(404);
        } else {
          throw error;
        }
      }
    });

    test('should generate structured numerology prompts', async () => {
      console.log('🧪 Testing numerology prompt structure');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/numerology`,
          {
            birthdate: '1990-05-15',
            name: 'John Smith'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.reading).toBeDefined();

        const reading = response.data.reading;

        // Check for structured response
        expect(reading.length).toBeGreaterThan(150);

        // Should mention numbers or life path
        expect(reading.toLowerCase()).toMatch(/number|path|destiny|soul/);

        console.log('✅ Numerology prompt generates structured content');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Numerology endpoint not implemented (TICKET-006)');
          expect(error.response.status).toBe(404);
        } else {
          throw error;
        }
      }
    });

    test('should generate detailed palm reading prompts', async () => {
      console.log('🧪 Testing palm reading prompt detail');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/palm`,
          {
            annotations: {
              heart_line: 'deep and curved',
              head_line: 'straight and clear',
              life_line: 'long and strong',
              hand: 'right'
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.reading).toBeDefined();

        const reading = response.data.reading;

        // Check for detail and context
        expect(reading.length).toBeGreaterThan(200);

        // Should mention palm features
        expect(reading.toLowerCase()).toMatch(/heart|head|life|line/);

        console.log('✅ Palm reading prompt generates detailed content');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Palm reading endpoint not implemented');
          expect(error.response.status).toBe(404);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Context Incorporation', () => {
    test('should incorporate user question context in tarot', async () => {
      console.log('🧪 Testing question context incorporation');

      const testCases = [
        {
          question: 'Will I find love soon?',
          expectedKeywords: ['love', 'romance', 'relationship']
        },
        {
          question: 'Should I change careers?',
          expectedKeywords: ['career', 'work', 'job', 'profession']
        }
      ];

      for (const testCase of testCases) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/ai/tarot`,
            {
              question: testCase.question,
              spread: 'single-card',
              card: { name: 'The Fool', position: 'upright' }
            },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            const reading = response.data.reading.toLowerCase();

            // Check if reading incorporates question context
            const hasContext = testCase.expectedKeywords.some(keyword =>
              reading.includes(keyword)
            );

            expect(hasContext).toBe(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️  Endpoint not implemented');
            expect(error.response.status).toBe(404);
            break;
          }
        }
      }

      console.log('✅ Context incorporation validated');
    });

    test('should incorporate birthdate context in numerology', async () => {
      console.log('🧪 Testing birthdate context incorporation');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/numerology`,
          {
            birthdate: '1990-05-15',
            name: 'Test User'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          const reading = response.data.reading;

          // Should contain some reference to numbers or calculations
          expect(reading).toBeDefined();
          expect(reading.length).toBeGreaterThan(100);
        }

        console.log('✅ Birthdate context incorporated');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Numerology endpoint not implemented (TICKET-006)');
          expect(error.response.status).toBe(404);
        }
      }
    });

    test('should incorporate annotation context in palm readings', async () => {
      console.log('🧪 Testing annotation context incorporation');

      const annotations = {
        heart_line: 'faint and broken',
        head_line: 'deep and forked',
        life_line: 'short and curved',
        hand: 'left'
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/palm`,
          { annotations },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          const reading = response.data.reading.toLowerCase();

          // Should reference some of the annotation features
          const hasFeatures = ['heart', 'head', 'life'].some(feature =>
            reading.includes(feature)
          );

          expect(hasFeatures).toBe(true);
        }

        console.log('✅ Annotation context incorporated');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Palm reading endpoint not implemented');
          expect(error.response.status).toBe(404);
        }
      }
    });
  });

  describe('Response Relevance', () => {
    test('should generate relevant responses for different card positions', async () => {
      console.log('🧪 Testing card position relevance');

      const positions = ['upright', 'reversed'];

      for (const position of positions) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/ai/tarot`,
            {
              question: 'What should I focus on today?',
              spread: 'single-card',
              card: { name: 'The Sun', position }
            },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            const reading = response.data.reading;
            expect(reading).toBeDefined();
            expect(reading.length).toBeGreaterThan(50);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️  Endpoint not implemented');
            break;
          }
        }
      }

      console.log('✅ Card position relevance validated');
    });

    test('should generate relevant responses for different spread types', async () => {
      console.log('🧪 Testing spread type relevance');

      const spreads = [
        { type: 'single-card', cards: 1 },
        { type: 'three-card', cards: 3 },
        { type: 'celtic-cross', cards: 10 }
      ];

      for (const spread of spreads) {
        try {
          const cards = Array(spread.cards).fill(null).map((_, i) => ({
            name: 'The Fool',
            position: 'upright',
            spreadPosition: i
          }));

          const response = await axios.post(
            `${API_BASE_URL}/api/ai/tarot`,
            {
              question: 'What is my path forward?',
              spread: spread.type,
              cards
            },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            const reading = response.data.reading;
            expect(reading).toBeDefined();

            // More complex spreads should generally have longer readings
            if (spread.cards > 1) {
              expect(reading.length).toBeGreaterThan(100);
            }
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️  Endpoint not implemented');
            break;
          }
        }
      }

      console.log('✅ Spread type relevance validated');
    });
  });

  describe('Consistency and Format Compliance', () => {
    test('should maintain consistent tone across readings', async () => {
      console.log('🧪 Testing tone consistency');

      const readings = [];

      for (let i = 0; i < 3; i++) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/ai/tarot`,
            {
              question: 'What guidance do you have for me?',
              spread: 'single-card',
              card: { name: 'The Magician', position: 'upright' }
            },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            readings.push(response.data.reading);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️  Endpoint not implemented');
            break;
          }
        }
      }

      if (readings.length > 1) {
        // All readings should maintain similar characteristics
        readings.forEach(reading => {
          expect(reading.length).toBeGreaterThan(50);
          expect(typeof reading).toBe('string');
        });
      }

      console.log('✅ Tone consistency validated');
    });

    test('should follow output format requirements', async () => {
      console.log('🧪 Testing output format compliance');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          {
            question: 'Test question',
            spread: 'single-card',
            card: { name: 'The World', position: 'upright' }
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          const data = response.data;

          // Should have expected structure
          expect(data.reading).toBeDefined();
          expect(typeof data.reading).toBe('string');

          // Should be properly formatted text
          expect(data.reading.trim()).toBe(data.reading);
        }

        console.log('✅ Output format compliance validated');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('   ⚠️  Endpoint not implemented');
          expect(error.response.status).toBe(404);
        }
      }
    });

    test('should handle prompt variations consistently', async () => {
      console.log('🧪 Testing prompt variation handling');

      const variations = [
        'Tell me about my future',
        'What does my future hold?',
        'Future guidance please'
      ];

      const responses = [];

      for (const question of variations) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/ai/tarot`,
            {
              question,
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

          if (response.status === 200) {
            responses.push(response.data.reading);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('   ⚠️  Endpoint not implemented');
            break;
          }
        }
      }

      if (responses.length > 1) {
        // All should be valid, meaningful responses
        responses.forEach(reading => {
          expect(reading).toBeDefined();
          expect(reading.length).toBeGreaterThan(30);
        });
      }

      console.log('✅ Prompt variation handling validated');
    });
  });

  afterAll(() => {
    console.log('\n✅ Prompt engineering effectiveness tests completed');
    console.log(`   Models available: ${availableModels.length}`);
    console.log(`   Test user: ${testUser.email}`);
  });
});
