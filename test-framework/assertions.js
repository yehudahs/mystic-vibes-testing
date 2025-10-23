/**
 * Test Assertions Helper
 * Common assertion functions for API testing
 */

/**
 * Assert response status code
 */
export function assertStatus(response, expectedStatus, message = '') {
  const msg = message || `Expected status ${expectedStatus}, got ${response.status}`;
  expect(response.status).toBe(expectedStatus);
}

/**
 * Assert response has required fields
 */
export function assertHasFields(obj, fields, message = '') {
  fields.forEach(field => {
    const msg = message || `Expected object to have field '${field}'`;
    expect(obj).toHaveProperty(field);
  });
}

/**
 * Assert JWT token format (three base64 parts separated by dots)
 */
export function assertValidJWT(token) {
  expect(typeof token).toBe('string');
  const parts = token.split('.');
  expect(parts.length).toBe(3);
  parts.forEach(part => {
    expect(part.length).toBeGreaterThan(0);
  });
}

/**
 * Assert UUID format
 */
export function assertValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  expect(uuid).toMatch(uuidRegex);
}

/**
 * Assert email format
 */
export function assertValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(email).toMatch(emailRegex);
}

/**
 * Assert timestamp format (ISO 8601)
 */
export function assertValidTimestamp(timestamp) {
  const date = new Date(timestamp);
  expect(date).toBeInstanceOf(Date);
  expect(isNaN(date.getTime())).toBe(false);
}

/**
 * Assert error response format
 */
export function assertErrorResponse(response, expectedStatus = 400) {
  assertStatus(response, expectedStatus);
  expect(response.data).toHaveProperty('error');
  expect(typeof response.data.error).toBe('string');
}

/**
 * Assert success response format
 */
export function assertSuccessResponse(response, expectedStatus = 200) {
  assertStatus(response, expectedStatus);
  expect(response.data).toBeDefined();
}

/**
 * Assert user object structure
 */
export function assertUserObject(user) {
  assertHasFields(user, ['id', 'name', 'email']);
  assertValidUUID(user.id);
  assertValidEmail(user.email);
  expect(typeof user.name).toBe('string');
  
  // Password should NEVER be in user object
  expect(user).not.toHaveProperty('password');
}

/**
 * Assert auth response structure (user + token)
 */
export function assertAuthResponse(response) {
  assertSuccessResponse(response, 200);
  assertHasFields(response.data, ['user', 'token']);
  assertUserObject(response.data.user);
  assertValidJWT(response.data.token);
}

/**
 * Assert AI response structure
 */
export function assertAiResponse(response, expectedFields = ['success', 'reading', 'metadata']) {
  assertSuccessResponse(response, 200);
  assertHasFields(response.data, expectedFields);
  
  if (response.data.metadata) {
    assertHasFields(response.data.metadata, ['provider', 'model']);
  }
}

/**
 * Assert response time is within acceptable range
 */
export function assertResponseTime(startTime, maxMs = 5000) {
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(maxMs);
}

/**
 * Assert array contains unique items
 */
export function assertUniqueItems(array, keyFn = (item) => item) {
  const seen = new Set();
  array.forEach(item => {
    const key = keyFn(item);
    expect(seen.has(key)).toBe(false);
    seen.add(key);
  });
}

/**
 * Assert object does not contain sensitive data
 */
export function assertNoSensitiveData(obj, sensitiveFields = ['password', 'secret', 'token']) {
  sensitiveFields.forEach(field => {
    expect(obj).not.toHaveProperty(field);
  });
}

export default {
  assertStatus,
  assertHasFields,
  assertValidJWT,
  assertValidUUID,
  assertValidEmail,
  assertValidTimestamp,
  assertErrorResponse,
  assertSuccessResponse,
  assertUserObject,
  assertAuthResponse,
  assertAiResponse,
  assertResponseTime,
  assertUniqueItems,
  assertNoSensitiveData,
};
