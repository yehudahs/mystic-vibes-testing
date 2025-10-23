# TICKET-002: Authentication Tests Failing - Session Token Issue Persists

**Status**: 🔴 Open  
**Priority**: Critical  
**Related**: TICKET-001  
**Date**: 2025-10-23  
**Component**: Backend API - Authentication

## Summary

Multiple authentication tests are failing due to session creation issues. This appears to be related to TICKET-001 (session token column length), but tests are now running successfully through the registration phase.

## Test Results

### ✅ PASSING (28/62 tests - 45%)
- **TEST-BE-AI-006**: AI Health Check - ALL 6 tests passing
- **TEST-BE-AUTH-001**: Registration - 7/8 tests passing
- Some middleware and logout tests passing

### ❌ FAILING (34/62 tests - 55%)

**TEST-BE-AUTH-002: User Login** - 7/8 failing
- Cannot login after registration
- All validation tests failing

**TEST-BE-AUTH-003: Get Current User** - 5/9 failing  
- Cannot retrieve authenticated user
- Token validation issues

**TEST-BE-AUTH-004: User Logout** - 5/8 failing
- Logout endpoint not requiring authentication (returns 200 instead of 401)
- Session invalidation not working properly

**TEST-BE-MIDDLEWARE-001: Protected Routes** - 7/12 failing
- Authentication middleware not properly protecting routes
- Invalid tokens not being rejected

**TEST-BE-AI-001: Tarot Reading** - 9/11 failing
- All AI generation tests skipped due to auth failures

## Root Cause Analysis

### Issue 1: Logout Not Protected
```
Expected: 401 (Unauthorized without token)
Received: 200 (Success)
```
The `/api/auth/logout` endpoint is not checking for authentication and allows logout without a valid token.

### Issue 2: Session Token Still Too Long
Registration works but session creation may still be failing silently or partially, causing downstream auth issues.

### Issue 3: Middleware Not Enforcing Auth
Protected routes are not properly validating JWT tokens. Invalid/malformed tokens should return 401 but are being accepted or handled incorrectly.

## Affected Files

```
mystic-vibes-api/routes/auth.js
  - POST /api/auth/logout (not protected)
  
mystic-vibes-api/middleware/auth.js
  - JWT validation logic
  - Session validation
  
mystic-vibes-api/config/database.js
  - sessions table schema
```

## Steps to Reproduce

```bash
cd mystic-vibes-testing
npm run test:backend
```

**Specific failures:**
1. Register user - ✅ Works
2. Login with same credentials - ❌ Fails
3. Logout without token - ❌ Succeeds (should fail)
4. Access /api/auth/me with invalid token - ❌ Not properly rejected

## Expected Behavior

1. **Logout endpoint should require authentication**
   - Without token: 401 Unauthorized
   - With invalid token: 401 Unauthorized
   - With valid token: 200 Success + session invalidation

2. **Login should work after registration**
   - User registers successfully
   - Same credentials should allow login
   - Should receive valid JWT token

3. **Middleware should protect routes**
   - No token: 401
   - Invalid token: 401
   - Expired token: 401
   - Valid token: Allow access

## Recommended Fixes

### Fix 1: Protect Logout Endpoint
```javascript
// In routes/auth.js
router.post('/logout', authenticateToken, async (req, res) => {
  // Logout logic
});
```

### Fix 2: Review Session Creation
Check if TICKET-001 fix was applied:
```sql
ALTER TABLE sessions 
ALTER COLUMN token TYPE TEXT;
```

### Fix 3: Fix Middleware Validation
Ensure `authenticateToken` middleware properly:
- Extracts token from Authorization header
- Validates JWT signature
- Checks token expiration
- Returns 401 for any invalid token

## Test Evidence

**Registration Test (Passing)**:
```
✓ should register a new user with valid credentials (808 ms)
✓ should allow immediate login after registration (1507 ms)
```

**Login Test (Failing)**:
```
✕ Case 1: Should successfully login with valid credentials (689 ms)
Expected status 200, got 401
```

**Logout Test (Failing)**:
```
✕ Case 3: Should fail logout without authentication token
Expected: 401
Received: 200
```

## Impact

- **Severity**: Critical
- **Blocks**: All authentication-dependent tests (40+ tests)
- **User Impact**: Authentication flow broken, users cannot:
  - Login after registration
  - Securely logout
  - Access protected endpoints

## Verification Steps

Once fixed:
1. Run: `npm run test:backend`
2. Verify all AUTH tests pass
3. Verify middleware tests pass
4. Verify AI tests can run (they require auth)

## Related Tests

- TEST-BE-AUTH-001: User Registration (mostly passing)
- TEST-BE-AUTH-002: User Login (failing)
- TEST-BE-AUTH-003: Get Current User (failing)
- TEST-BE-AUTH-004: Logout (failing)
- TEST-BE-MIDDLEWARE-001: Protected Routes (failing)
- TEST-BE-AI-001: Tarot Reading (blocked by auth)

## Notes

- Some tests are passing which indicates the API is partially functional
- The inconsistency suggests configuration or middleware ordering issues
- Database connection is working (registration succeeds)
- Token generation works (registration returns token)
- Token validation is the main problem area

---

**Ticket Created**: October 23, 2025  
**Discovered By**: Automated Test Suite  
**Test Run**: npm run test:backend  
**Results**: 28 passed, 34 failed, 62 total
