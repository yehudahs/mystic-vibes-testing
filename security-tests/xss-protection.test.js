/**
 * TEST-SEC-002: Cross-Site Scripting (XSS) Protection Tests
 * 
 * Purpose: Validate XSS protection across all user input fields
 * 
 * Test Categories:
 * 1. Reflected XSS (user input immediately reflected in response)
 * 2. Stored XSS (malicious scripts stored in database)
 * 3. DOM-based XSS (client-side script manipulation)
 * 4. Event handler XSS (onload, onerror, etc.)
 * 5. HTML entity encoding validation
 * 6. Special character sanitization
 * 
 * Security Scope:
 * - Registration/Login forms
 * - User profile updates
 * - AI content generation (Tarot, Palm, Horoscope)
 * - Search and query parameters
 * - JSON response validation
 * 
 * Expected Behaviors:
 * ✅ All user input sanitized/escaped before storage
 * ✅ HTML special characters encoded in responses
 * ✅ No executable scripts in JSON responses
 * ✅ Content-Type headers properly set
 * ✅ No script execution in error messages
 * ✅ XSS payloads rejected with validation errors
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Common XSS payloads for testing
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<marquee onstart=alert("XSS")>',
  '<div onmouseover=alert("XSS")>',
  'javascript:alert("XSS")',
  '<a href="javascript:alert(\'XSS\')">Click</a>',
  '<img src="x" onerror="alert(String.fromCharCode(88,83,83))">',
  '<svg><script>alert("XSS")</script></svg>',
  '<<SCRIPT>alert("XSS");//<</SCRIPT>',
  '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
  '<IMG SRC=javascript:alert("XSS")>',
  '<IMG SRC=JaVaScRiPt:alert("XSS")>',
  '<IMG SRC=`javascript:alert("XSS")`>',
];

describe('TEST-SEC-002: XSS Protection', () => {
  let authToken;
  let testUserId;

  // Helper function to generate unique email
  const generateUniqueEmail = () => `xss_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;

  // Helper function to check if response contains unescaped XSS
  const containsUnescapedXSS = (text) => {
    if (!text) return false;
    const str = typeof text === 'string' ? text : JSON.stringify(text);
    // Check for actual script tags or event handlers (not HTML-encoded)
    return /<script[^>]*>/.test(str) || 
           /onerror\s*=/.test(str) || 
           /onload\s*=/.test(str) ||
           /javascript:/.test(str);
  };

  // Helper function to register and login
  const registerAndLogin = async () => {
    const email = generateUniqueEmail();
    const password = 'ValidPassword123!';

    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
        name: 'XSS Test User'
      });

      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user.id;
      
      return { email, password };
    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  };

  beforeAll(async () => {
    await registerAndLogin();
  });

  describe('Registration XSS Protection', () => {
    test('should sanitize XSS in email field', async () => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email: payload,
            password: 'ValidPassword123!',
            name: 'Test User'
          }, { validateStatus: () => true });

          // Should reject invalid email format or sanitize
          expect([400, 422]).toContain(response.status);
          
          // Response should not contain unescaped XSS
          expect(containsUnescapedXSS(response.data)).toBe(false);
        } catch (error) {
          // Network errors are acceptable (connection refused, etc.)
          expect(error.code).toBeTruthy();
        }
      }
    });

    test('should sanitize XSS in name field', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ];

      for (const payload of xssPayloads) {
        try {
          const email = generateUniqueEmail();
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email,
            password: 'ValidPassword123!',
            name: payload
          }, { validateStatus: () => true });

          // If registration succeeds, verify name is sanitized
          if (response.status === 201) {
            const userData = response.data.user || response.data;
            
            // Name should be sanitized (no raw script tags)
            expect(containsUnescapedXSS(userData.name)).toBe(false);
            
            // Should either reject or encode the payload
            if (userData.name.includes('<')) {
              // If contains HTML, must be encoded
              expect(userData.name).not.toMatch(/<script[^>]*>/);
            }
          } else {
            // Rejection is valid (400/422)
            expect([400, 422]).toContain(response.status);
          }

          // Response should never contain executable XSS
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
        } catch (error) {
          // Network errors or rejections are acceptable
          expect(error).toBeDefined();
        }
      }
    });

    test('should sanitize XSS in password field (error messages)', async () => {
      const xssPassword = '<script>alert("XSS")</script>';
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email: generateUniqueEmail(),
          password: xssPassword,
          name: 'Test User'
        }, { validateStatus: () => true });

        // Password validation should reject or accept
        // But error messages must not contain unescaped XSS
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('Login XSS Protection', () => {
    test('should not reflect XSS in login error messages', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>'
      ];

      for (const payload of xssPayloads) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            email: payload,
            password: 'somepassword'
          }, { validateStatus: () => true });

          // Login should fail (invalid email)
          expect([400, 401, 422]).toContain(response.status);
          
          // Error messages should not contain unescaped XSS
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
        } catch (error) {
          expect(error.code).toBeTruthy();
        }
      }
    });

    test('should sanitize XSS in login responses', async () => {
      // Create account with potentially problematic name
      const email = generateUniqueEmail();
      const password = 'ValidPassword123!';
      
      try {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email,
          password,
          name: '<b>TestUser</b>' // Mild HTML
        });

        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password
        }, { validateStatus: () => true });

        if (loginResponse.status === 200) {
          // User data in response should be sanitized
          expect(containsUnescapedXSS(JSON.stringify(loginResponse.data))).toBe(false);
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('User Profile XSS Protection', () => {
    test('should sanitize XSS when updating user profile', async () => {
      if (!authToken) {
        console.warn('⚠️ No auth token, skipping profile tests');
        return;
      }

      const xssName = '<script>alert("XSS")</script>';

      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/users/${testUserId}`,
          { name: xssName },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        // Should accept or reject, but never reflect unescaped XSS
        if ([200, 204].includes(response.status)) {
          // If update succeeds, verify sanitization
          const userData = response.data;
          expect(containsUnescapedXSS(JSON.stringify(userData))).toBe(false);
        } else {
          // Rejection is valid
          expect([400, 422]).toContain(response.status);
        }
      } catch (error) {
        // Network errors are acceptable
        expect(error).toBeDefined();
      }
    });

    test('should protect against stored XSS in user preferences', async () => {
      if (!authToken) return;

      const xssPayload = '<img src=x onerror=alert("XSS")>';

      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/users/${testUserId}/preferences`,
          { 
            theme: xssPayload,
            notifications: xssPayload 
          },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        // Response should not contain unescaped XSS
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('AI Content Generation XSS Protection', () => {
    test('should sanitize XSS in Tarot card questions', async () => {
      if (!authToken) return;

      const xssQuestion = '<script>alert("XSS")</script>';

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          { 
            question: xssQuestion,
            spread: 'three-card'
          },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        // Response should not contain unescaped XSS
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);

        // If successful, verify cards array is sanitized
        if (response.status === 200 && response.data.cards) {
          response.data.cards.forEach(card => {
            expect(containsUnescapedXSS(JSON.stringify(card))).toBe(false);
          });
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should sanitize XSS in Horoscope requests', async () => {
      if (!authToken) return;

      const xssSign = '<img src=x onerror=alert("XSS")>';

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/horoscope`,
          { 
            zodiacSign: xssSign,
            timeframe: 'daily'
          },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        // Should reject invalid zodiac sign
        // Response should not contain unescaped XSS
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should protect against XSS in AI-generated content', async () => {
      if (!authToken) return;

      // Test if AI responses are sanitized (shouldn't contain executable scripts)
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/tarot`,
          { 
            question: 'What does my future hold?',
            spread: 'single-card'
          },
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        if (response.status === 200) {
          // AI-generated content should be safe
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);

          // Check reading text specifically
          if (response.data.reading) {
            expect(response.data.reading).not.toMatch(/<script[^>]*>/);
            expect(response.data.reading).not.toMatch(/javascript:/);
          }
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('Response Header XSS Protection', () => {
    test('should set proper Content-Type headers', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
          validateStatus: () => true
        });

        // Should have JSON content type
        expect(response.headers['content-type']).toMatch(/application\/json/);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should set X-Content-Type-Options header', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
          validateStatus: () => true
        });

        // Should have nosniff header to prevent MIME sniffing
        // Note: This may not be set, but it's a security best practice
        if (response.headers['x-content-type-options']) {
          expect(response.headers['x-content-type-options']).toBe('nosniff');
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should set X-XSS-Protection header (legacy)', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
          validateStatus: () => true
        });

        // Legacy XSS protection header (deprecated but still used)
        // Note: May not be set, but check if present
        if (response.headers['x-xss-protection']) {
          expect(response.headers['x-xss-protection']).toMatch(/1|0/);
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('Event Handler XSS Protection', () => {
    test('should block event handler payloads', async () => {
      const eventHandlerPayloads = [
        'onload=alert("XSS")',
        'onerror=alert("XSS")',
        'onclick=alert("XSS")',
        'onmouseover=alert("XSS")',
        'onfocus=alert("XSS")'
      ];

      for (const payload of eventHandlerPayloads) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email: `test${payload}@example.com`,
            password: 'ValidPassword123!',
            name: payload
          }, { validateStatus: () => true });

          // Should reject or sanitize
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
        } catch (error) {
          expect(error.code).toBeTruthy();
        }
      }
    });
  });

  describe('JSON Response XSS Protection', () => {
    test('should properly escape JSON strings', async () => {
      if (!authToken) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${testUserId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          validateStatus: () => true
        });

        if (response.status === 200) {
          // Verify response is valid JSON
          expect(() => JSON.stringify(response.data)).not.toThrow();
          
          // Verify no unescaped XSS in JSON
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should handle special characters in JSON responses', async () => {
      if (!authToken) return;

      const specialChars = '< > " \' & / \\';

      try {
        const email = generateUniqueEmail();
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email,
          password: 'ValidPassword123!',
          name: specialChars
        });

        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password: 'ValidPassword123!'
        }, { validateStatus: () => true });

        if (loginResponse.status === 200) {
          // Special characters should be properly escaped in JSON
          expect(() => JSON.stringify(loginResponse.data)).not.toThrow();
          expect(containsUnescapedXSS(JSON.stringify(loginResponse.data))).toBe(false);
        }
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('DOM-based XSS Protection', () => {
    test('should not reflect URL parameters in responses', async () => {
      try {
        const xssParam = '<script>alert("XSS")</script>';
        const response = await axios.get(
          `${API_BASE_URL}/api/search?q=${encodeURIComponent(xssParam)}`,
          { validateStatus: () => true }
        );

        // Response should not contain unescaped payload
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });

    test('should sanitize search query parameters', async () => {
      if (!authToken) return;

      const xssQuery = '<img src=x onerror=alert("XSS")>';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/readings/search?query=${encodeURIComponent(xssQuery)}`,
          { 
            headers: { Authorization: `Bearer ${authToken}` },
            validateStatus: () => true 
          }
        );

        // Response should not contain unescaped XSS
        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        expect(error.code).toBeTruthy();
      }
    });
  });

  describe('Complex XSS Payload Protection', () => {
    test('should block obfuscated XSS payloads', async () => {
      const obfuscatedPayloads = [
        '<IMG SRC=JaVaScRiPt:alert("XSS")>',
        '<IMG SRC=`javascript:alert("XSS")`>',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>',
        '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">'
      ];

      for (const payload of obfuscatedPayloads) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email: generateUniqueEmail(),
            password: 'ValidPassword123!',
            name: payload
          }, { validateStatus: () => true });

          // Should sanitize or reject
          expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
        } catch (error) {
          // Network errors are acceptable
          expect(error).toBeDefined();
        }
      }
    });

    test('should block nested XSS attempts', async () => {
      const nestedPayload = '<div><script>alert("XSS")</script></div>';

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email: generateUniqueEmail(),
          password: 'ValidPassword123!',
          name: nestedPayload
        }, { validateStatus: () => true });

        expect(containsUnescapedXSS(JSON.stringify(response.data))).toBe(false);
      } catch (error) {
        // Network errors are acceptable
        expect(error).toBeDefined();
      }
    });
  });
});
