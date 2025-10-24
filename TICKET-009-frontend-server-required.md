# TICKET-009: Frontend Server Required for Component Tests

## Priority: LOW
## Category: Testing Infrastructure
## Status: Open
## Created: 2024-10-23

## Summary
Frontend component tests require the Vite development server to be running on `http://localhost:5173`. Currently getting connection errors when tests run.

## Impact
- **Scope**: Frontend component tests (TEST-FE-COMP-001 through TEST-FE-COMP-006)
- **Affected Tests**: 15 test cases require running frontend
- **Severity**: Low - Tests can run when server is available

## Current Behavior
- Tests attempt to connect to `http://localhost:5173`
- Connection fails with AggregateError
- Tests skip gracefully with warning messages
- 14/15 tests passing (93%) by skipping unavailable tests
- 1 test fails when server not available

## Expected Behavior
- Frontend server should be running during test execution
- Tests should access actual rendered pages
- Full component testing with JavaScript execution
- All navigation tests should pass

## Technical Details

### Error Message
```
AggregateError: Error
  at axios.get(FRONTEND_URL)
  at frontend-tests/navigation-component.test.js:206:26
```

### Test Requirements
1. Vite dev server running on port 5173
2. Frontend build compiled
3. All routes accessible
4. Authentication state manageable

### Current Test Coverage (Without Server)
- ✅ 14/15 tests passing (93%)
- ❌ 1 test fails (homepage load)
- ⚠️  Most tests skip gracefully

## Proposed Solutions

### Solution 1: Start Frontend Before Tests (Recommended)
**Approach**: Add frontend startup to test setup
**Pros**:
- Complete test coverage
- Real component testing
- JavaScript execution
- Route validation

**Cons**:
- Slower test execution
- Server startup overhead
- Port conflicts possible

**Implementation**:
```bash
# In test script
npm run dev & 
sleep 5  # Wait for server
npm test frontend
kill %1  # Stop server
```

### Solution 2: Mock Frontend Responses
**Approach**: Mock HTML responses for testing
**Pros**:
- Fast execution
- No server required
- Predictable results

**Cons**:
- Not testing real application
- Misses JavaScript issues
- Limited value

**Implementation**: Not recommended for component tests

### Solution 3: Integration with E2E Tests
**Approach**: Move component tests to E2E suite with Playwright
**Pros**:
- Full browser testing
- JavaScript execution
- User interaction testing
- Screenshot capabilities

**Cons**:
- Requires Playwright setup
- Slower execution
- More complex setup

## Recommendation

**Use Solution 1**: Start frontend before component tests

```bash
# Update package.json test script
"test:frontend": "npm run dev & sleep 5 && jest frontend-tests/ && kill %1"
```

Or manual approach:
```bash
# Terminal 1
cd mystic-vibes-ai
npm run dev

# Terminal 2
cd mystic-vibes-testing
npm test frontend-tests/
```

## Acceptance Criteria
- [ ] Frontend server starts before component tests
- [ ] All 15 navigation tests pass (100%)
- [ ] Tests can access all routes
- [ ] Server stops after tests complete
- [ ] Process documented in README

## Notes
- Frontend component tests have inherent limitations without JavaScript execution
- For full component testing, consider E2E tests with Playwright
- Current tests validate HTML structure and routing
- Interactive components require browser automation (E2E tests)

## Related Tickets
- TICKET-004: Frontend auth flow tests
- E2E Tests (TEST-E2E-001, TEST-E2E-002, TEST-E2E-003)

## Test Results
- **With Server**: Not tested yet
- **Without Server**: 14/15 passing (93%)
- **Expected**: 15/15 passing (100%) with server running
