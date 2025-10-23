/**
 * TEST-SEC-001: SQL Injection Protection
 * 
 * Test Suite: Security Tests
 * Target: All database-interacting endpoints
 * Priority: HIGH (Phase 4 - Security Hardening)
 * Dependencies: Backend API, Database
 * 
 * Description:
 * Validates that the application is protected against SQL injection attacks.
 * Tests various SQL injection techniques on all endpoints that accept user input
 * and interact with the database.
 * 
 * Test Cases:
 * 1. Test login endpoint with SQL injection attempts
 * 2. Test registration endpoint with SQL injection
 * 3. Test search/query endpoints with SQL injection
 * 4. Test numeric parameter injection
 * 5. Test boolean-based blind SQL injection
 * 6. Test time-based blind SQL injection
 * 7. Test UNION-based SQL injection
 * 8. Test stacked queries injection
 * 9. Test comment-based injection
 * 10. Test hex-encoded injection
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:3001
 * - Database configured and running
 */

import { describe, test, expect } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';

const api = new ApiHelper();

// Common SQL injection payloads
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "' OR '1'='1'--",
  "admin'--",
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL,NULL--",
  "1' OR '1'='1",
  "' OR 'a'='a",
  "') OR ('1'='1",
  "' OR '1'='1' /*",
  "'; DROP TABLE users--",
  "1; DROP TABLE users--",
  "' AND 1=0 UNION ALL SELECT 'admin', 'password'--",
  "admin' OR '1'='1'#",
  "' WAITFOR DELAY '00:00:05'--",
  "1' AND SLEEP(5)--",
  "' OR EXISTS(SELECT * FROM users)--"
];

describe('TEST-SEC-001: SQL Injection Protection', () => {
  
  describe('Case 1: Login Endpoint SQL Injection Attempts', () => {
    SQL_INJECTION_PAYLOADS.forEach((payload, index) => {
      test(`Should reject SQL injection in email field: payload ${index + 1}`, async () => {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test123'
        });
        
        // Should either reject with error or not execute malicious SQL
        // Valid responses: 400, 401, 422 (validation error or auth failure)
        // Invalid responses: 200 (successful login would indicate vulnerability), 500 (SQL error might indicate injection)
        expect(response.status).not.toBe(200);
        
        if (response.status === 500) {
          // 500 with SQL error messages might indicate vulnerability
          const errorMsg = JSON.stringify(response.data).toLowerCase();
          const hasSQLError = errorMsg.includes('sql') || 
                             errorMsg.includes('syntax') ||
                             errorMsg.includes('mysql') ||
                             errorMsg.includes('postgres') ||
                             errorMsg.includes('sqlite');
          
          expect(hasSQLError).toBe(false);
          console.log(`  ⚠️ Got 500 error (should be 400/401/422): ${payload.substring(0, 20)}`);
        } else {
          console.log(`  ✓ Rejected: ${payload.substring(0, 20)}... (${response.status})`);
        }
      });
    });

    SQL_INJECTION_PAYLOADS.forEach((payload, index) => {
      test(`Should reject SQL injection in password field: payload ${index + 1}`, async () => {
        const response = await api.post('/api/auth/login', {
          email: 'test@example.com',
          password: payload
        });
        
        expect(response.status).not.toBe(200);
        
        if (response.status === 500) {
          const errorMsg = JSON.stringify(response.data).toLowerCase();
          const hasSQLError = errorMsg.includes('sql') || 
                             errorMsg.includes('syntax') ||
                             errorMsg.includes('mysql') ||
                             errorMsg.includes('postgres');
          expect(hasSQLError).toBe(false);
        }
      });
    });
  });

  describe('Case 2: Registration Endpoint SQL Injection', () => {
    test('Should reject SQL injection in registration email', async () => {
      const response = await api.post('/api/auth/register', {
        name: 'Test User',
        email: "admin'--",
        password: 'SecurePass123!'
      });
      
      // Should reject with validation error, not execute SQL
      expect([400, 422]).toContain(response.status);
      console.log(`✅ Registration rejected SQL injection (${response.status})`);
    });

    test('Should reject SQL injection in registration name', async () => {
      const response = await api.post('/api/auth/register', {
        name: "'; DROP TABLE users--",
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
      
      // Should either reject or sanitize, but not execute
      expect(response.status).not.toBe(500);
      console.log(`✅ Name SQL injection handled (${response.status})`);
    });
  });

  describe('Case 3: Numeric Parameter Injection', () => {
    test('Should handle SQL injection in numeric IDs', async () => {
      // Test with user ID or reading ID endpoints
      const maliciousIds = [
        "1' OR '1'='1",
        "1 OR 1=1",
        "1; DROP TABLE readings--"
      ];
      
      for (const id of maliciousIds) {
        // Try various endpoints that might accept IDs
        const endpoints = [
          `/api/users/${id}`,
          `/api/readings/${id}`,
          `/api/auth/user/${id}`
        ];
        
        for (const endpoint of endpoints) {
          const response = await api.get(endpoint);
          
          // Should return error, not execute SQL
          if (response.status === 500) {
            const errorMsg = JSON.stringify(response.data).toLowerCase();
            const hasSQLError = errorMsg.includes('sql') || errorMsg.includes('syntax');
            expect(hasSQLError).toBe(false);
          }
        }
      }
      
      console.log('✅ Numeric parameter injection protected');
    });
  });

  describe('Case 4: UNION-Based SQL Injection', () => {
    test('Should block UNION SELECT attacks', async () => {
      const unionPayloads = [
        "' UNION SELECT NULL--",
        "' UNION SELECT NULL,NULL,NULL--",
        "' UNION SELECT username,password FROM users--",
        "1 UNION SELECT 1,2,3,4,5--"
      ];
      
      for (const payload of unionPayloads) {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        // Should not return 200 or leak database structure
        expect(response.status).not.toBe(200);
        
        if (response.status === 500) {
          const errorMsg = JSON.stringify(response.data);
          // Should not leak column information
          expect(errorMsg).not.toContain('column');
          expect(errorMsg.toLowerCase()).not.toContain('field');
        }
      }
      
      console.log('✅ UNION attacks blocked');
    });
  });

  describe('Case 5: Comment-Based Injection', () => {
    test('Should handle SQL comment characters safely', async () => {
      const commentPayloads = [
        "admin'--",
        "admin'#",
        "admin'/*",
        "admin' -- comment",
        "admin' # comment"
      ];
      
      for (const payload of commentPayloads) {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        expect(response.status).not.toBe(200);
      }
      
      console.log('✅ Comment-based injection protected');
    });
  });

  describe('Case 6: Boolean-Based Blind SQL Injection', () => {
    test('Should not allow boolean-based blind injection', async () => {
      const booleanPayloads = [
        "admin' AND '1'='1",
        "admin' AND '1'='2",
        "admin' OR '1'='1",
        "admin' AND 1=1--",
        "admin' AND 1=2--"
      ];
      
      const responses = [];
      
      for (const payload of booleanPayloads) {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        responses.push({
          payload,
          status: response.status,
          data: response.data
        });
      }
      
      // All responses should be consistent (not revealing true/false conditions)
      const statuses = responses.map(r => r.status);
      const uniqueStatuses = [...new Set(statuses)];
      
      // Should have consistent error responses
      expect(uniqueStatuses.length).toBeLessThanOrEqual(2);
      console.log(`✅ Boolean injection protected (consistent responses: ${uniqueStatuses.join(', ')})`);
    });
  });

  describe('Case 7: Stacked Queries Injection', () => {
    test('Should block stacked queries attempts', async () => {
      const stackedPayloads = [
        "'; DROP TABLE users--",
        "'; DELETE FROM users--",
        "1; DROP TABLE readings--",
        "admin'; UPDATE users SET password='hacked'--"
      ];
      
      for (const payload of stackedPayloads) {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        // Should reject, not execute multiple queries
        expect(response.status).not.toBe(200);
        
        if (response.status === 500) {
          const errorMsg = JSON.stringify(response.data).toLowerCase();
          // Check for signs of query execution
          expect(errorMsg).not.toContain('drop');
          expect(errorMsg).not.toContain('delete');
          expect(errorMsg).not.toContain('update');
        }
      }
      
      console.log('✅ Stacked queries blocked');
    });
  });

  describe('Case 8: Time-Based Blind SQL Injection', () => {
    test('Should not allow time-based blind injection', async () => {
      const timePayloads = [
        "' OR SLEEP(5)--",
        "' WAITFOR DELAY '00:00:05'--",
        "' AND SLEEP(5)--",
        "1' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--"
      ];
      
      for (const payload of timePayloads) {
        const startTime = Date.now();
        
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        const duration = Date.now() - startTime;
        
        // Response should not be delayed by SQL SLEEP/WAITFOR
        expect(duration).toBeLessThan(3000); // Should respond in < 3 seconds
        expect(response.status).not.toBe(200);
      }
      
      console.log('✅ Time-based injection protected');
    }, 30000);
  });

  describe('Case 9: Special Characters Sanitization', () => {
    test('Should properly escape special SQL characters', async () => {
      const specialChars = [
        "'",
        '"',
        ';',
        '--',
        '#',
        '/*',
        '*/',
        'xp_',
        'sp_',
        '0x',
        '\\'
      ];
      
      for (const char of specialChars) {
        const response = await api.post('/api/auth/login', {
          email: `test${char}@example.com`,
          password: `test${char}123`
        });
        
        // Should handle gracefully, not cause SQL errors
        if (response.status === 500) {
          const errorMsg = JSON.stringify(response.data).toLowerCase();
          const hasSQLError = errorMsg.includes('sql') || errorMsg.includes('syntax');
          expect(hasSQLError).toBe(false);
        }
      }
      
      console.log('✅ Special characters sanitized');
    });
  });

  describe('Case 10: Hex-Encoded Injection', () => {
    test('Should block hex-encoded SQL injection', async () => {
      const hexPayloads = [
        '0x61646d696e', // 'admin' in hex
        "0x' OR '1'='1",
        '0x3b44524f50205441424c452075736572733b' // ;DROP TABLE users; in hex
      ];
      
      for (const payload of hexPayloads) {
        const response = await api.post('/api/auth/login', {
          email: payload,
          password: 'test'
        });
        
        expect(response.status).not.toBe(200);
      }
      
      console.log('✅ Hex-encoded injection blocked');
    });
  });
});
