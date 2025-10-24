#!/bin/bash

# Script to create all testing tickets on GitHub
# Run: ./create-github-issues.sh
# Note: Requires GitHub CLI (gh) to be authenticated

echo "Creating GitHub issues for Mystic Vibes Testing..."
echo ""

# TICKET-001: Session token column size
echo "Creating TICKET-001..."
gh issue create \
  --title "TICKET-001: Session token column size insufficient" \
  --body "## Problem
Database column for session tokens is too small, causing token truncation.

## Impact
- Infrastructure issue
- May cause authentication failures with longer tokens

## Priority
🟡 Low (infrastructure improvement)

## Tests Affected
- Backend authentication tests may experience intermittent failures

## Recommended Fix
- Increase session_token column size in database schema
- Update migration scripts
- Test with various token lengths

## Related Tests
- Backend authentication tests" \
  --label "bug,infrastructure,low-priority"

# TICKET-002: Backend auth endpoints
echo "Creating TICKET-002..."
gh issue create \
  --title "TICKET-002: Backend auth endpoints failing (current user & logout)" \
  --body "## Problem
Authentication endpoints for current user and logout are failing.

## Impact
- 🔴 HIGH PRIORITY
- ~11 tests failing
- Blocks user session management

## Failing Endpoints
- \`GET /api/auth/me\` - Returns 401/500 errors
- \`POST /api/auth/logout\` - Not properly clearing sessions

## Tests Affected
- TEST-BE-AUTH-003: Get Current User (4/9 passing)
- TEST-BE-AUTH-004: Logout (3/8 passing)
- TEST-BE-MIDDLEWARE-001: Protected routes (5/12 passing)

## Status
✅ PARTIALLY FIXED:
- Login: 8/8 passing
- Registration: 8/8 passing

❌ STILL FAILING:
- Current user endpoint
- Logout endpoint

## Recommended Fix
1. Fix /api/auth/me to properly validate and return user data
2. Fix /api/auth/logout to clear session and return success
3. Ensure middleware properly validates tokens
4. Re-run affected tests

## Related Tests
- backend-tests/auth-endpoints.test.js
- backend-tests/protected-routes.test.js" \
  --label "bug,high-priority,backend,authentication"

# TICKET-003: Weak password validation
echo "Creating TICKET-003..."
gh issue create \
  --title "TICKET-003: Weak password validation (security issue)" \
  --body "## Problem
Password validation is too weak, allowing insecure passwords.

## Impact
- 🟡 MEDIUM PRIORITY
- Security vulnerability
- Users can create easily guessable passwords

## Current Behavior
- Accepts weak passwords like 'pass', '12345'
- No complexity requirements

## Tests Affected
- TEST-SEC-002: Input validation and sanitization

## Recommended Fix
- Implement strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Update validation logic in backend
- Add clear error messages for users
- Update tests to verify new requirements

## Related Tests
- security-tests/input-validation.test.js" \
  --label "security,medium-priority,backend"

# TICKET-004: Frontend auth flow
echo "Creating TICKET-004..."
gh issue create \
  --title "TICKET-004: Frontend auth flow tests need re-testing" \
  --body "## Problem
Frontend authentication flow tests need to be re-tested after backend fixes.

## Impact
- ⚠️ BLOCKED by TICKET-002
- Frontend tests waiting for backend auth fix

## Status
- Tests implemented but blocked by backend issues
- Ready to re-test once TICKET-002 is resolved

## Tests Affected
- TEST-FE-INT-001: Authentication Flow (Login/Register/Logout)

## Recommended Action
1. Wait for TICKET-002 to be resolved
2. Re-run frontend auth tests
3. Fix any remaining frontend-specific issues
4. Verify complete auth flow works end-to-end

## Related Tests
- frontend-tests/auth-flow.test.js" \
  --label "frontend,blocked,testing"

# TICKET-005: Palm reading vision API
echo "Creating TICKET-005..."
gh issue create \
  --title "TICKET-005: Palm reading vision API failing (500 errors)" \
  --body "## Problem
Palm reading endpoint is returning 500 errors. Vision model integration not working.

## Impact
- 🔴 HIGH PRIORITY
- 12 tests failing with 500 errors
- Core feature completely broken

## Failing Endpoint
- \`POST /api/readings/palm\` - Returns 500 Internal Server Error

## Tests Affected
- TEST-BE-AI-003: Generate Palm Reading (0/12 passing)
- TEST-AI-ANNOT-001: Palm Annotation (gracefully handling 404s)

## Error Details
- Vision model not responding
- Possible issues:
  - Ollama vision model not loaded
  - Image processing failing
  - Model communication error

## Recommended Fix
1. Verify Ollama vision model is installed and running
2. Check vision model endpoint configuration
3. Debug image upload and processing pipeline
4. Add proper error handling for vision failures
5. Test with sample palm images
6. Re-run affected tests

## Related Tests
- backend-tests/ai-endpoints.test.js
- ai-service-tests/palm-annotation.test.js" \
  --label "bug,high-priority,backend,ai-service"

# TICKET-006: Numerology endpoint not implemented
echo "Creating TICKET-006..."
gh issue create \
  --title "TICKET-006: Numerology endpoint not implemented (404)" \
  --body "## Problem
Numerology endpoint is not implemented, returning 404 errors.

## Impact
- 🔴 HIGH PRIORITY - Biggest test impact
- 24 tests failing with 404 errors
- Core feature completely missing

## Missing Endpoint
- \`POST /api/readings/numerology\` - Not Found (404)

## Tests Affected
- TEST-BE-AI-004: Generate Numerology Content (3/27 passing)
- Multiple numerology-related tests

## Expected Behavior
Endpoint should:
- Accept numerology calculation requests
- Process birthdate and name
- Calculate life path, destiny, soul urge numbers
- Generate AI-powered interpretations
- Return formatted numerology reading

## Recommended Implementation
1. Create /api/readings/numerology endpoint
2. Implement numerology calculation logic:
   - Life path number
   - Destiny number
   - Soul urge number
   - Personality number
3. Integrate with AI for interpretations
4. Add validation for input data
5. Return proper response format
6. Re-run all 27 numerology tests

## Related Tests
- backend-tests/ai-endpoints.test.js (numerology section)
- frontend-tests/numerology-form-validation.test.js" \
  --label "enhancement,high-priority,backend,ai-service"

# TICKET-007: Personalization endpoint
echo "Creating TICKET-007..."
gh issue create \
  --title "TICKET-007: Personalization endpoint not implemented (gracefully handled)" \
  --body "## Problem
Personalization endpoint is not implemented, returning 404 errors.

## Impact
- 🟡 LOW PRIORITY
- Tests are passing with graceful 404 handling
- Optional feature, not blocking

## Missing Endpoint
- \`POST /api/readings/personalization\` - Not Found (404)

## Tests Status
- TEST-BE-AI-005: Generate Personalization Content (14/14 passing)
- All tests gracefully handle 404 responses
- No blocking issues

## Expected Behavior (When Implemented)
- Personalized recommendations based on user readings
- Combined insights from multiple reading types
- User preference integration

## Recommended Action
- LOW PRIORITY - implement when core features are stable
- Tests already handle missing endpoint gracefully
- Can be added as enhancement in future sprint

## Related Tests
- backend-tests/ai-endpoints.test.js (personalization section)" \
  --label "enhancement,low-priority,backend,future"

# TICKET-009: Frontend server required
echo "Creating TICKET-009..."
gh issue create \
  --title "TICKET-009: Frontend server required for component rendering tests" \
  --body "## Problem
Some frontend component tests require the frontend server to be running.

## Impact
- ⚠️ MEDIUM PRIORITY
- 1 test failing in navigation component
- Frontend performance tests gracefully handle server absence

## Tests Affected
- TEST-FE-COMP-001: Navigation Component (14/15 passing)
- TEST-PERF-004: Frontend Performance (handles gracefully)

## Issue
- Navigation component test requires actual HTML rendering
- Frontend server must be running on http://localhost:5173

## Recommended Fix
- Start frontend development server before running tests
- OR: Use JSDOM/React Testing Library for pure component tests
- OR: Mock the navigation component behavior
- Update test to handle server absence gracefully

## Workaround
\`\`\`bash
# Start frontend server
cd /path/to/frontend
npm run dev

# Then run tests
cd /path/to/mystic-vibes-testing
npm test -- frontend-tests/
\`\`\`

## Related Tests
- frontend-tests/navigation-component.test.js
- performance-tests/frontend-performance.test.js" \
  --label "testing,medium-priority,frontend,infrastructure"

echo ""
echo "✅ All GitHub issues created successfully!"
echo ""
echo "View issues at: https://github.com/yehudahs/mystic-vibes-testing/issues"
