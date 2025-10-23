# TICKET-004: Logout Endpoint Not Properly Protected (Returns 200 Instead of 401)

**Status**: 🔴 Open
**Priority**: High
**Opened By**: Test Engineer (Automated)
**Date Opened**: 2025-10-23
**Related Test(s)**: TEST-BE-AUTH-004

## Issue Description
The logout endpoint (`POST /api/auth/logout`) is returning `200 OK` even when no authentication token is provided, when it should return `401 Unauthorized` for unauthenticated requests.

## Root Cause
The logout endpoint is likely not using the `authenticateToken` middleware, or is using `optionalAuth` instead of required auth.

## Steps to Reproduce
1. Run logout tests:
   ```bash
   npm test backend-tests/auth-logout.test.js
   ```
2. Observe that tests expect `401` but receive `200` when:
   - No Authorization header is provided
   - Invalid/expired token is provided
   - User is not authenticated

## Expected Behavior
Logout should:
- **Require authentication** (must have valid token)
- Return `401 Unauthorized` if no token provided
- Return `401 Unauthorized` if token is invalid/expired
- Return `200 OK` only if:
  - Valid token provided
  - Session successfully terminated

## Actual Behavior
Logout returns `200 OK` even without authentication, suggesting:
- Endpoint is not protected
- Anyone can call logout endpoint
- No validation of token/session

## Evidence
Test output:
```
Expected: 401
Received: 200
```

From TEST-BE-AUTH-004: 5 out of 8 tests failing with this status mismatch.

## Impact
- [x] Blocks test execution (5/8 tests failing)
- [ ] Test fails but can continue
- [ ] Minor issue, doesn't affect testing
- [x] Security concern (endpoint should be protected)
- [ ] Performance issue

**Severity**: While this doesn't expose user data, it indicates improper endpoint protection which could lead to security issues.

## Suggested Fix
Check `/Users/yehudahs/work/private/mystic-vibes-api/routes/auth.js` logout endpoint:

**Current** (likely):
```javascript
router.post('/logout', optionalAuth, async (req, res) => {
  // Logout logic
})
```

**Should be**:
```javascript
router.post('/logout', authenticateToken, async (req, res) => {
  // Logout logic - only runs if user is authenticated
})
```

Or if using `optionalAuth`, add validation:
```javascript
router.post('/logout', optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  // Logout logic
})
```

## Notes
- This is a **High priority** issue because it indicates improper auth middleware usage
- Similar pattern might exist in other endpoints
- Should audit all protected endpoints to ensure proper middleware

## Related Issues
- May be related to TICKET-003 (status code mismatches)
- Could indicate broader middleware configuration issues

---

## Resolution
**Resolved By**:
**Date Resolved**:
**Fix Description**:
**Commit/PR**:
**Verified By**:
**Verification Date**:
