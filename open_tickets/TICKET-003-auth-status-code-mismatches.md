# TICKET-003: Auth Endpoints Returning 401 Instead of 400 for Invalid Requests

**Status**: 🔴 Open
**Priority**: Medium
**Opened By**: Test Engineer (Automated)
**Date Opened**: 2025-10-23
**Related Test(s)**: TEST-BE-AUTH-003, TEST-BE-MIDDLEWARE-001

## Issue Description
After fixing TICKET-002 (test framework issue), tests revealed that some authentication endpoints are returning `401 Unauthorized` when they should return `400 Bad Request` for malformed or invalid input.

## Affected Endpoints
1. **GET /api/auth/me** - Returns 401 for missing/invalid token (should be 400 for malformed requests)
2. **Protected routes middleware** - Returns 401 for all auth failures (should differentiate between bad input and unauthorized)

## Root Cause
The authentication middleware and endpoints are not properly distinguishing between:
- **400 Bad Request**: Malformed input, invalid format, missing required fields
- **401 Unauthorized**: Valid format but invalid credentials or expired/missing token

## Steps to Reproduce
Run the following tests and observe status code mismatches:

1. **TEST-BE-AUTH-003** (Get Current User):
   ```bash
   npm test backend-tests/auth-current-user.test.js
   ```
   - 5 tests failing with "Expected: 400, Received: 401"

2. **TEST-BE-MIDDLEWARE-001** (Protected Route Authentication):
   ```bash
   npm test backend-tests/middleware-auth.test.js
   ```
   - 7 tests failing with "Expected: 400, Received: 401"

## Expected Behavior
- **400 Bad Request**: For malformed requests, invalid input format
- **401 Unauthorized**: For missing/invalid/expired authentication tokens
- **403 Forbidden**: For authenticated users without permissions (if applicable)

## Actual Behavior
All authentication failures return `401 Unauthorized` regardless of the reason.

## Evidence
Test output shows:
```
Expected: 400
Received: 401
```

## Impact
- [ ] Blocks test execution
- [x] Tests fail but can continue
- [ ] Minor issue, doesn't affect testing
- [ ] Security concern
- [x] API contract issue (incorrect HTTP status codes)

**Blocks**:
- TEST-BE-AUTH-003: 5/9 tests failing
- TEST-BE-MIDDLEWARE-001: 7/12 tests failing

## Suggested Fix
Update authentication middleware in `/Users/yehudahs/work/private/mystic-vibes-api/middleware/auth.js`:

1. Distinguish between malformed requests (400) and unauthorized requests (401)
2. Return 400 for:
   - Invalid token format (not a valid JWT structure)
   - Missing Authorization header when required
3. Return 401 for:
   - Valid JWT format but invalid signature
   - Expired token
   - Token not found in database

## Notes
This is a backend API correctness issue. While the app may function, proper HTTP status codes are important for:
- API consumers understanding the error type
- Proper error handling in frontend
- Following REST API best practices

Lower priority than critical auth failures, but should be addressed for API correctness.

---

## Resolution
**Resolved By**:
**Date Resolved**:
**Fix Description**:
**Commit/PR**:
**Verified By**:
**Verification Date**:
