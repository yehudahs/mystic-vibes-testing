# TICKET-001: Database Error on User Registration - Session Token Too Long

**Status**: 🔴 Open  
**Priority**: Critical  
**Test**: TEST-BE-AUTH-001  
**Date**: 2025-10-22  
**Component**: Backend API - Authentication

## Description

User registration fails with a database error. The backend returns HTTP 500 with error message:
```
"value too long for type character varying(255)"
```

This occurs when trying to insert a session token into the database after successful user registration.

## Impact

- **Severity**: Critical - Blocks all user registrations
- **Affected Feature**: User authentication/registration
- **User Impact**: New users cannot create accounts
- **Test Status**: TEST-BE-AUTH-001 fails - all 5 test cases affected

## Steps to Reproduce

1. Start backend API: `cd mystic-vibes-api && npm run dev`
2. Run test: `cd mystic-vibes-testing && npm run test:backend`
3. Observe: POST `/api/auth/register` returns 500 error
4. Or manually: Send POST request to `http://localhost:3001/api/auth/register` with:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "SecurePass123!"
   }
   ```

## Expected Behavior

- User registration should succeed
- HTTP 201 Created status
- Response with user object and JWT token
- Session created in database

## Actual Behavior

- Registration fails with HTTP 500 Internal Server Error
- Error: `value too long for type character varying(255)`
- Stack trace points to:
  - `mystic-vibes-api/config/database.js:48:17`
  - `mystic-vibes-api/middleware/auth.js:146:3` (createSession)
  - `mystic-vibes-api/routes/auth.js:63:3`

## Error Stack Trace

```
error: value too long for type character varying(255)
    at /Users/yehudahs/work/private/mystic-vibes-api/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async query (file:///Users/yehudahs/work/private/mystic-vibes-api/config/database.js:48:17)
    at async createSession (file:///Users/yehudahs/work/private/mystic-vibes-api/middleware/auth.js:146:3)
    at async file:///Users/yehudahs/work/private/mystic-vibes-api/routes/auth.js:63:3
```

## Root Cause Analysis

The error occurs in `createSession` function when inserting into the `sessions` table. The JWT token being generated is longer than 255 characters, but the database column is defined as `VARCHAR(255)`.

**Likely Issue**: The `sessions.token` column is too short to hold JWT tokens.

## Affected Files

- `mystic-vibes-api/middleware/auth.js` - createSession function (line 146)
- `mystic-vibes-api/routes/auth.js` - registration endpoint (line 63)
- Database schema: `sessions` table - `token` column

## Suggested Fix

### Option 1: Increase Column Size (Recommended)
Change the `sessions.token` column from `VARCHAR(255)` to `TEXT` or `VARCHAR(1000)`:

```sql
ALTER TABLE sessions 
ALTER COLUMN token TYPE TEXT;
```

or

```sql
ALTER TABLE sessions 
ALTER COLUMN token TYPE VARCHAR(1000);
```

### Option 2: Shorten JWT Tokens
Reduce JWT token size by:
- Removing unnecessary claims
- Using shorter keys
- Compressing payload

**Recommendation**: Option 1 (increase column size) is simpler and safer.

## Test Evidence

**Test Run**: `npm run test:backend`  
**Date**: October 22, 2025  
**Test Output**:

```
console.log
  Response Status: 500

console.log
  Response Data: {
    "error": "value too long for type character varying(255)",
    "stack": "error: value too long for type character varying(255)..."
  }
```

**Multiple Test Cases Failed**:
- Test Case 1: Successful Registration - ❌ Failed
- Test Case 2: Duplicate Email - ❌ Failed (can't even register first user)
- Test Case 3: Missing Required Fields - ❌ Failed
- Test Case 4: Invalid Email Format - ❌ Failed  
- Test Case 5: Weak Password - ❌ Failed

## Verification Steps (Once Fixed)

1. Apply database schema fix
2. Restart backend API
3. Run test: `npm run test:backend`
4. Verify: All test cases in TEST-BE-AUTH-001 should pass
5. Manual verification:
   - Register new user via API
   - Check user created in database
   - Check session created in database
   - Verify JWT token stored successfully

## Additional Notes

- This is a **blocking issue** - must be fixed before any authentication tests can pass
- Affects all registration attempts (manual and automated)
- May also affect login if session creation fails there too
- Need to check if other VARCHAR columns have similar size limitations

## Related Tests

- TEST-BE-AUTH-001: User Registration (blocked)
- TEST-BE-AUTH-002: User Login (potentially affected)
- TEST-BE-AUTH-003: Get Current User (potentially affected)
- TEST-FE-INT-001: Authentication Flow (blocked)

## Assigned To

[Developer Name]

## Resolution

_To be filled when issue is resolved_

---

**Ticket Created**: October 22, 2025  
**Discovered By**: Automated Test (TEST-BE-AUTH-001)  
**Environment**: Local Development  
**Database**: PostgreSQL (vibely_ai)
