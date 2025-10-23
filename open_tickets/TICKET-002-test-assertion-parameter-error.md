# TICKET-002: Test Framework Assertion Functions Receiving Wrong Parameters

**Status**: 🟢 Resolved
**Priority**: High
**Opened By**: Test Engineer (Automated)
**Date Opened**: 2025-10-23
**Related Test(s)**: TEST-BE-AUTH-002, TEST-BE-AUTH-003, TEST-BE-AUTH-004, and many others

## Issue Description
Multiple backend auth tests are failing with `response.status is undefined` errors. Investigation revealed that the test code is incorrectly passing `response.data` to assertion functions (`assertAuthResponse`, `assertErrorResponse`) that expect the full axios response object (with `.status` and `.data` properties).

## Root Cause
The assertion functions in `test-framework/assertions.js` are designed to receive the full axios response object:

```javascript
// assertions.js
export function assertAuthResponse(response) {
  assertSuccessResponse(response, 200);  // Expects response.status
  assertHasFields(response.data, ['user', 'token']);  // Expects response.data
  assertUserObject(response.data.user);
  assertValidJWT(response.data.token);
}

export function assertErrorResponse(response, expectedStatus = 400) {
  assertStatus(response, expectedStatus);  // Expects response.status
  expect(response.data).toHaveProperty('error');
  expect(typeof response.data.error).toBe('string');
}
```

But the test files are calling them with `response.data` instead of `response`:

```javascript
// auth-login.test.js (line 87)
const response = await api.login(loginData);
assertStatus(response, 200);        // ✓ Correct
assertAuthResponse(response.data);  // ✗ WRONG - should be just 'response'
```

## Steps to Reproduce
1. Run any backend auth test: `npm test backend-tests/auth-login.test.js`
2. Observe errors: `Expected: 200, Received: undefined`
3. Check stack trace showing `assertStatus` trying to access `response.status` which is undefined

## Expected Behavior
Tests should pass the full axios response object to assertion functions:
```javascript
assertAuthResponse(response);  // ✓ Correct
assertErrorResponse(response);  // ✓ Correct
```

## Actual Behavior
Tests are passing only the data portion:
```javascript
assertAuthResponse(response.data);  // ✗ Wrong
assertErrorResponse(response.data);  // ✗ Wrong
```

## Evidence
Test output shows API is working correctly:
```
Response Status: 200
Response Data: { "message": "Login successful", "user": {...}, "token": "..." }
```

But assertion fails:
```
expect(received).toBe(expected)
Expected: 200
Received: undefined
```

## Impact
- [x] Blocks test execution (multiple auth tests failing)
- [ ] Test fails but can continue
- [ ] Minor issue, doesn't affect testing
- [ ] Security concern
- [ ] Performance issue

**Blocks**:
- TEST-BE-AUTH-002: User Login (7/8 tests failing)
- TEST-BE-AUTH-003: Get Current User (potentially affected)
- TEST-BE-AUTH-004: Logout (potentially affected)
- TEST-BE-MIDDLEWARE-001: Protected routes (potentially affected)
- Multiple AI endpoint tests that require auth

## Suggested Fix
Two options:

**Option 1: Fix all test files** (Recommended - preserves assertion function design)
Update all test files to pass `response` instead of `response.data`:

```javascript
// Before:
assertAuthResponse(response.data);
assertErrorResponse(response.data);

// After:
assertAuthResponse(response);
assertErrorResponse(response);
```

**Option 2: Refactor assertion functions** (More work, breaks existing pattern)
Change assertion functions to accept just the data object and receive status separately.

## Files Affected
- `/Users/yehudahs/work/private/mystic-vibes-testing/backend-tests/auth-login.test.js`
- Potentially other auth test files
- Potentially middleware and AI endpoint test files

## Notes
This is a test framework issue, not a backend API issue. The API is working correctly - the console logs prove it's returning proper status codes and data structures. The bug is entirely in how the test code calls the assertion functions.

---

## Resolution
**Resolved By**: Claude Code
**Date Resolved**: 2025-10-23
**Fix Description**: Updated `auth-login.test.js` to pass full response objects to assertion functions instead of just response.data
**Commit/PR**: (To be filled after commit)
**Verified By**: (To be filled after verification)
**Verification Date**: (To be filled after verification)
