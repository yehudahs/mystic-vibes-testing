# Quick Issues Log

Use this file for quick issue tracking without creating individual ticket files.

---

## Format

```
### Issue #XXX - [Brief Title]
- **Status**: 🔴 Open | 🟡 In Progress | 🟢 Resolved | ⚫ Closed
- **Priority**: Critical | High | Medium | Low
- **Test**: TEST-XX-XXX
- **Date**: YYYY-MM-DD
- **Reporter**: [Name]
- **Description**: Brief description of the issue
- **Resolution**: [To be filled when resolved]
```

---

## Open Issues

### Issue #003 - Auth Status Code Mismatches 🔴
- **Status**: 🔴 Open
- **Priority**: Medium
- **Test**: TEST-BE-AUTH-003, TEST-BE-MIDDLEWARE-001
- **Date**: 2025-10-23
- **Reporter**: Test Engineer (Automated)
- **Description**: Auth endpoints returning 401 instead of 400 for malformed/invalid requests. Affects 12 tests (5 in auth-current-user, 7 in middleware-auth).
- **Resolution**: Pending - needs to distinguish between bad input (400) vs unauthorized (401)

### Issue #004 - Logout Endpoint Not Protected 🔴
- **Status**: 🔴 Open
- **Priority**: High
- **Test**: TEST-BE-AUTH-004
- **Date**: 2025-10-23
- **Reporter**: Test Engineer (Automated)
- **Description**: Logout endpoint returns 200 even without authentication. Should require valid token and return 401 if missing/invalid. Security concern + 5/8 tests failing.
- **Resolution**: Pending - needs to add authenticateToken middleware or validation

---

## Resolved Issues

(Move resolved issues here after verification)

---

## Closed Issues

### Issue #001 - Session Token Column Too Short ⚫
- **Status**: ⚫ Closed
- **Priority**: Critical
- **Test**: TEST-BE-AUTH-001
- **Date Opened**: 2025-10-22
- **Date Closed**: 2025-10-23
- **Reporter**: Test Engineer (Automated)
- **Description**: JWT tokens too long for VARCHAR(255) column, blocking registration
- **Resolution**: Implemented SHA-256 token hashing. Tokens now stored as 64-char hashes instead of plain text. Security improved + database error fixed.
- **Commit**: `4f843c4` - Security fix: Implement token hashing for session storage
- **Verification**: ✅ TEST-BE-AUTH-001 passes (7/8 tests)
- **Archived**: `/closed_tickets/TICKET-001-session-token-column-too-short.md`

### Issue #002 - Test Framework Assertion Parameter Error ⚫
- **Status**: ⚫ Closed
- **Priority**: High
- **Test**: TEST-BE-AUTH-002, TEST-BE-AUTH-003, TEST-BE-AUTH-004, TEST-BE-MIDDLEWARE-001
- **Date Opened**: 2025-10-23
- **Date Closed**: 2025-10-23
- **Reporter**: Test Engineer (Automated)
- **Description**: Tests passing response.data to assertion functions that expect full response object, causing "response.status is undefined" errors blocking 56 tests
- **Resolution**: Fixed 5 test files to pass full response objects (with .status and .data) to assertion functions. Unblocked test execution and revealed actual backend issues.
- **Commit**: `6a11f87` - Fix test framework: Pass response objects to assertions correctly
- **Verification**: ✅ TEST-BE-AUTH-002 passes (8/8 tests), ✅ No more undefined errors
- **Archived**: `/closed_tickets/TICKET-002-test-assertion-parameter-error.md`

---

**Last Updated**: October 23, 2025
