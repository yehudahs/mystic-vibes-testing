# Integration, Security, Performance & E2E Test Specifications

## Overview
This document contains detailed black-box test specifications for:
- Integration Tests (cross-component flows)
- Security Tests (vulnerability testing)
- Performance Tests (load and stress testing)
- E2E Tests (complete user journeys)

---

# INTEGRATION TESTS

## TEST-INT-001: Complete Tarot Reading Flow

**Priority**: Critical
**Category**: Integration Test
**Flow**: Frontend → Backend → Proxy → Ollama → Response

**Description**: Verify complete tarot reading functionality across all system components.

**Preconditions**:
- All services running (frontend, backend, proxy, Ollama)
- User registered and authenticated
- Model `llama3.2:3b` available

**Test Steps**:

**Phase 1: User Authentication**
1. Open browser to `http://localhost:5173`
2. Navigate to login page
3. Login with test credentials
4. Verify successful authentication
5. Verify JWT token stored in browser

**Phase 2: Spread Selection**
1. Navigate to Tarot Reading section
2. Select "Three Card Spread"
3. Verify spread description displays
4. Verify positions shown: Past, Present, Future

**Phase 3: Question Input**
1. Enter question: "What career path should I pursue?"
2. Verify character count updates (if applicable)
3. Click "Draw Cards" button

**Phase 4: Card Drawing**
1. Verify 3 cards drawn
2. Verify cards are unique (no duplicates)
3. Verify each card shows:
   - Card image
   - Card name
   - Position label
   - Reversed status (if applicable)
4. Note the specific cards drawn

**Phase 5: Reading Generation**
1. Click "Generate Reading" button
2. Monitor browser network tab:
   - Verify POST request sent to `http://localhost:3001/api/ai/tarot/reading`
   - Verify Authorization header present
   - Verify request body contains cards, question, spread
3. Monitor backend logs:
   - Verify request received
   - Verify forwarding to proxy (port 11434)
4. Monitor proxy logs:
   - Verify request received from backend
   - Verify forwarding to Ollama (port 11433)
5. Verify loading indicator appears on frontend
6. Wait for response (< 30 seconds)
7. Verify loading indicator disappears

**Phase 6: Reading Display**
1. Verify reading text displayed
2. Verify reading contains:
   - Reference to user's question
   - Mention of all 3 cards by name
   - Discussion of positions (Past, Present, Future)
   - Coherent narrative
   - 200-400 words length
3. Verify no error messages

**Phase 7: Save Reading (Optional)**
1. Click "Save Reading" button
2. Verify success message
3. Navigate to Reading History
4. Verify reading appears in list

**Phase 8: Context Continuity (If Enabled)**
1. Generate another reading with same account
2. Verify backend loads previous context
3. Verify AI may reference previous reading (continuity)

**Expected Results**:
- Complete flow executes without errors
- Each component receives and processes requests correctly
- Data flows: Frontend → Backend → Proxy → Ollama → Proxy → Backend → Frontend
- Reading quality is high
- Authentication enforced throughout
- Save functionality works
- Response time acceptable (< 30 seconds total)

**Verification Points**:
- Browser Network Tab: Request sent to correct endpoint with auth header
- Backend Logs: Request received, forwarded, response returned
- Proxy Logs: Request forwarded to Ollama, response received
- Ollama Logs: Generation request processed
- Database: Reading saved if requested

---

## TEST-INT-002: Complete Palm Reading Flow with Image Upload

**Priority**: Critical
**Category**: Integration Test
**Flow**: Frontend → Backend → Proxy → Ollama (Vision) + Annotator → Response

**Description**: Verify complete palm reading flow including image upload, vision AI analysis, and annotation.

**Preconditions**:
- All services running including palm annotation service (port 5001)
- User authenticated (or anonymous if allowed)
- Model `llama3.2-vision:11b` available
- Test palm image available (< 5MB, clear hand photo)

**Test Steps**:

**Phase 1: Image Selection**
1. Navigate to Palm Reading section
2. Click upload area
3. Select valid palm image (JPG, 2MB)
4. Verify image preview appears
5. Verify file size validation passes
6. Verify image encoded to base64 (check browser console if debugging)

**Phase 2: Optional Question**
1. Enter question: "What does my palm reveal about my future?"
2. Verify text appears in input field

**Phase 3: Reading Request**
1. Click "Generate Palm Reading" button
2. Monitor browser network tab:
   - Verify POST request to `/api/ai/palm/reading`
   - Verify request body contains base64 image
   - Verify request timeout set to 60+ seconds
3. Verify loading indicator appears
4. Verify button disabled during processing

**Phase 4: Backend Processing**
1. Backend receives request
2. Backend strips data URL prefix if present
3. Backend forwards to Ollama via proxy
4. Monitor backend logs for:
   - "Palm Reading Request" message
   - Request forwarded to proxy
   - Ollama response received
5. Backend calls palm annotation service (port 5001):
   - Sends image and reading text
   - Receives annotated image with colored lines
6. Backend returns complete response

**Phase 5: Response Display**
1. Wait for response (< 90 seconds)
2. Verify annotated image section appears:
   - Original image shown on left
   - Annotated image (with colored lines) on right
   - Features detected listed (e.g., Heart Line, Head Line, Life Line)
   - Feature count badge
3. Verify reading text section appears:
   - 400-600 words
   - Specific observations about palm features
   - Interpretation and guidance
   - Question addressed (if provided)
4. Verify no error messages
5. Verify success toast notification

**Phase 6: Annotation Verification**
1. Right-click and save annotated image
2. Open in image viewer
3. Visually verify:
   - Colored lines drawn on palm
   - Lines correspond to detected features
   - Multiple colors used for different lines
   - Lines are clear and visible

**Phase 7: Error Scenario - Annotation Service Down**
1. Stop palm annotation service
2. Generate new palm reading
3. Verify reading still generated successfully
4. Verify annotated image section absent or shows fallback
5. Verify no crash or complete failure

**Expected Results**:
- Image upload and encoding works correctly
- Vision model processes image successfully
- Reading is specific and detailed (not generic)
- Palm annotation service adds colored lines
- Annotation service failure doesn't break core functionality
- Complete flow < 90 seconds
- All data flows correctly through architecture

**Architecture Validation**:
- ✅ Frontend sends image to Backend (not directly to proxy)
- ✅ Backend forwards to Proxy (port 11434)
- ✅ Proxy forwards to Ollama (port 11433)
- ✅ Backend calls Annotation service (port 5001)
- ✅ Response flows back through same path

---

## TEST-INT-003: Complete Numerology Flow with Calculations

**Priority**: High
**Category**: Integration Test
**Flow**: Frontend → Calculations → Backend → AI → Response

**Description**: Verify numerology calculation and interpretation flow.

**Preconditions**:
- All services running
- User authenticated or anonymous

**Test Steps**:

**Phase 1: Form Input**
1. Navigate to Numerology section
2. Enter details:
   - First Name: "Sarah"
   - Last Name: "Johnson"
   - Birth Date: "1995-08-22"
   - Optional questions: ["What is my life purpose?", "Will I find success?"]
3. Verify form validation accepts input

**Phase 2: Client-Side Calculations**
1. Click "Calculate" button
2. Frontend calculates numerology numbers:
   - Life Path Number
   - Destiny Number
   - Soul Urge Number
   - Personality Number
   - Birthday Number
   - Maturity Number
   - Current Year Number
3. Verify calculations complete (check console/logs)
4. Frontend constructs detailed prompt including:
   - Person's name and birth date
   - All calculated numbers
   - Personal questions

**Phase 3: AI Generation Request**
1. Frontend sends request to backend endpoint
2. Verify request NOT sent directly to proxy (architecture check)
3. Backend receives prompt
4. Backend forwards to AI service via proxy
5. AI generates personalized numerology interpretation

**Phase 4: Response Processing**
1. Backend returns AI-generated interpretation
2. Frontend parses response
3. Frontend extracts sections:
   - Life Path interpretation
   - Destiny interpretation
   - Soul Urge interpretation
   - Personality interpretation
   - Birthday interpretation
   - Maturity interpretation
   - Current Year interpretation
   - Overall synthesis
   - Personal guidance (for questions)

**Phase 5: Display Results**
1. Verify all calculated numbers displayed correctly
2. Verify each number has interpretation
3. Verify personal questions addressed in guidance section
4. Verify standard meanings also shown (from local data)
5. Verify AI interpretation adds personalization

**Expected Results**:
- Calculations accurate and match expected values
- AI interpretation relevant to calculated numbers
- Personal questions addressed in output
- Complete flow < 15 seconds
- Architecture properly followed (frontend → backend → proxy → AI)

---

## TEST-INT-004: User Authentication Flow Across All Components

**Priority**: Critical
**Category**: Integration Test
**Flow**: Registration → Login → Protected Routes → Token Refresh → Logout

**Description**: Verify authentication works seamlessly across all features.

**Preconditions**:
- All services running
- Database accessible

**Test Steps**:

**Phase 1: Registration**
1. Navigate to registration page
2. Register new user:
   - Name: "Integration Test User"
   - Email: `test_${timestamp}@example.com`
   - Password: "SecurePass123!"
3. Verify:
   - User created in database
   - JWT token returned
   - Token stored in browser (localStorage or httpOnly cookie)
   - Automatic login after registration
   - User name appears in header

**Phase 2: Access Protected Features**
1. Navigate to Profile page
2. Verify access granted (not redirected to login)
3. Generate tarot reading
4. Verify request includes Authorization header
5. Navigate to Reading History
6. Verify user's readings displayed (not others')

**Phase 3: Token Validation**
1. Use browser dev tools to inspect JWT token
2. Decode token (jwt.io or similar)
3. Verify token contains:
   - User ID
   - Email
   - Issued at timestamp
   - Expiration timestamp
4. Make API request with token
5. Verify backend validates token correctly

**Phase 4: Logout**
1. Click Logout button
2. Verify:
   - Token removed from storage
   - Redirected to home/login page
   - Protected routes now inaccessible
3. Attempt to access /profile
4. Verify redirected to login

**Phase 5: Re-Login**
1. Login with same credentials
2. Verify successful login
3. Verify new token issued
4. Verify access to protected routes restored

**Phase 6: Expired Token Handling**
1. Manually edit token to expire it (change exp claim)
2. Attempt API request
3. Verify:
   - Backend returns 401 Unauthorized
   - Frontend intercepts 401
   - User logged out automatically
   - Redirected to login

**Phase 7: Invalid Token Handling**
1. Manually corrupt token in storage
2. Attempt API request
3. Verify 401 response and auto-logout

**Expected Results**:
- Registration creates account and logs in
- JWT tokens issued and validated correctly
- Protected routes enforce authentication
- Token included in all authenticated requests
- Logout clears session completely
- Expired/invalid tokens handled gracefully
- Auto-logout on 401 response

---

# SECURITY TESTS

## TEST-SEC-001: SQL Injection Protection

**Priority**: Critical
**Category**: Security Test
**Attack Vector**: SQL Injection

**Description**: Verify that all API endpoints properly sanitize inputs and are not vulnerable to SQL injection attacks.

**Preconditions**:
- Backend and database running
- Knowledge of SQL injection techniques

**Test Steps**:

**Test Case 1: Login Endpoint**
1. Attempt login with SQL injection payloads:
   ```
   Email: "admin'--"
   Password: "anything"

   Email: "' OR '1'='1"
   Password: "' OR '1'='1"

   Email: "'; DROP TABLE users; --"
   Password: "anything"
   ```
2. Verify for each:
   - Login fails (401 Unauthorized)
   - Database not compromised
   - No SQL error messages exposed
   - No tables dropped

**Test Case 2: Search/Filter Endpoints**
1. If there's a search feature, inject SQL:
   ```
   Search: "' OR 1=1 --"
   Search: "'; DELETE FROM readings WHERE '1'='1"
   ```
2. Verify queries fail safely
3. Verify no unauthorized data returned

**Test Case 3: User Profile Update**
1. Attempt to update profile with SQL injection:
   ```
   Name: "'); DROP TABLE users; --"
   Email: "' OR '1'='1' --@example.com"
   ```
2. Verify:
   - Input rejected or safely escaped
   - No SQL execution
   - User profile updates only with valid data

**Expected Results**:
- All SQL injection attempts fail
- No data leakage
- No database corruption
- Parameterized queries or ORM used (verify in code review)
- Error messages don't reveal SQL structure

**Pass Criteria**: Zero SQL injections successful

---

## TEST-SEC-002: Cross-Site Scripting (XSS) Protection

**Priority**: Critical
**Category**: Security Test
**Attack Vector**: XSS

**Description**: Verify that user inputs are properly sanitized and XSS attacks cannot inject malicious scripts.

**Preconditions**:
- Frontend and backend running

**Test Steps**:

**Test Case 1: Stored XSS in Tarot Question**
1. Generate tarot reading with question:
   ```
   Question: "<script>alert('XSS')</script>"
   Question: "<img src=x onerror=alert('XSS')>"
   Question: "javascript:alert('XSS')"
   ```
2. Verify:
   - Script tags not executed
   - Input sanitized or escaped
   - When reading displayed, no alert popup
3. View saved reading in history
4. Verify script still not executed

**Test Case 2: XSS in User Name**
1. Register or update profile with:
   ```
   Name: "<script>alert('XSS')</script>"
   Name: "User<img src=x onerror=alert('XSS')>"
   ```
2. Verify:
   - Name displayed safely (HTML escaped)
   - No script execution
   - Header/navbar shows escaped text

**Test Case 3: XSS in Comments/Notes (if exists)**
1. If users can add notes, try XSS payloads
2. Verify sanitization

**Test Case 4: Reflected XSS in URL Parameters**
1. If any URL params displayed on page:
   ```
   http://localhost:5173/reading?id=<script>alert('XSS')</script>
   ```
2. Verify script not executed

**Expected Results**:
- All HTML/JS in user input is escaped or sanitized
- No script execution in any context
- React's default XSS protection working (no dangerouslySetInnerHTML misuse)
- Content Security Policy headers set (check response headers)

**Pass Criteria**: Zero XSS attacks successful

---

## TEST-SEC-003: CSRF Protection

**Priority**: High
**Category**: Security Test
**Attack Vector**: Cross-Site Request Forgery

**Description**: Verify that state-changing operations are protected against CSRF attacks.

**Preconditions**:
- User authenticated in browser
- Understanding of CSRF attack techniques

**Test Steps**:

**Test Case 1: External Site POST Attempt**
1. Create malicious HTML page:
   ```html
   <form action="http://localhost:3001/api/users/profile" method="POST">
     <input name="name" value="Hacked">
     <input name="email" value="hacker@evil.com">
   </form>
   <script>document.forms[0].submit();</script>
   ```
2. User logged into Mystic Vibes
3. User visits malicious page
4. Verify:
   - Request blocked by CORS or CSRF token validation
   - Profile not updated
   - Error logged

**Test Case 2: AJAX Request from External Site**
1. From external domain, attempt:
   ```javascript
   fetch('http://localhost:3001/api/readings', {
     method: 'POST',
     credentials: 'include',
     body: JSON.stringify({...})
   })
   ```
2. Verify:
   - Request blocked by CORS policy
   - No reading created

**Test Case 3: CSRF Token Validation (if implemented)**
1. If CSRF tokens used:
   - Make request without token → Verify blocked
   - Make request with invalid token → Verify blocked
   - Make request with expired token → Verify blocked
   - Make request with valid token → Verify succeeds

**Expected Results**:
- CORS headers properly configured
- Same-origin policy enforced
- CSRF tokens validated (if implemented)
- Cookie settings secure (SameSite attribute)
- State-changing requests protected

**Pass Criteria**: No successful CSRF attacks

---

## TEST-SEC-004: JWT Token Security

**Priority**: Critical
**Category**: Security Test
**Component**: Authentication Tokens

**Description**: Verify JWT tokens are secure and cannot be tampered with.

**Preconditions**:
- User authenticated with JWT token

**Test Steps**:

**Test Case 1: Token Tampering**
1. Obtain valid JWT token
2. Decode token (3 parts: header.payload.signature)
3. Modify payload (e.g., change user ID, add admin role)
4. Recalculate signature with wrong secret or skip
5. Attempt API request with tampered token
6. Verify:
   - Request rejected (401 Unauthorized)
   - Error: "Invalid token"
   - Backend detects tampering

**Test Case 2: Token Without Signature**
1. Remove signature portion of JWT
2. Use token for API request
3. Verify rejected

**Test Case 3: Algorithm Confusion Attack**
1. Change token algorithm from HS256 to "none"
2. Attempt request
3. Verify rejected (algorithm validated)

**Test Case 4: Token Expiration**
1. Wait for token to expire (or manually set expiration in past)
2. Attempt API request
3. Verify:
   - 401 Unauthorized
   - Error: "Token expired"
   - User required to re-login

**Test Case 5: Token Storage Security**
1. Inspect browser storage
2. Verify token stored securely:
   - If localStorage: Acceptable but note XSS risk
   - If httpOnly cookie: Better (protected from JS access)
3. Verify no sensitive data in token payload (no passwords)

**Test Case 6: Insufficient Token Secret**
1. Attempt to brute-force token secret (use jwt_tool)
2. Verify secret is strong (long random string)
3. If weak secret, report critical vulnerability

**Expected Results**:
- Tampered tokens rejected
- Token signature validated
- Algorithm strictly validated (no "none" algorithm)
- Expiration enforced
- Strong secret used (>= 256 bits)
- Minimal data in payload (no sensitive info)

**Pass Criteria**: All token security measures in place

---

## TEST-SEC-005: Password Security

**Priority**: Critical
**Category**: Security Test
**Component**: Password Handling

**Description**: Verify passwords are properly hashed and stored securely.

**Preconditions**:
- Access to database (read-only for testing)
- User registered

**Test Steps**:

**Test Case 1: Password Storage**
1. Register user with password: "TestPassword123!"
2. Query database:
   ```sql
   SELECT password FROM users WHERE email = 'testuser@example.com';
   ```
3. Verify:
   - Password is NOT stored in plain text
   - Password hash present (bcrypt format: $2b$...)
   - Hash length appropriate (60 characters for bcrypt)

**Test Case 2: Password Hashing Algorithm**
1. Verify bcrypt or argon2 used (strong algorithms)
2. Verify cost factor:
   - bcrypt: 10-12 rounds minimum
   - argon2: Appropriate memory and time parameters
3. Not MD5, SHA1, or other weak algorithms

**Test Case 3: Same Password, Different Hashes**
1. Register two users with same password
2. Query both password hashes
3. Verify hashes are different (salt used)

**Test Case 4: Password Validation**
1. Attempt login with correct password → Success
2. Attempt login with slightly wrong password → Fail
3. Verify hash comparison secure (constant-time)

**Test Case 5: Password Requirements**
1. Attempt registration with weak passwords:
   - "123" → Rejected
   - "password" → Rejected
   - "aaaaaaaa" → Rejected
2. Verify password policy enforced:
   - Minimum 8 characters
   - Contains letters and numbers
   - Special characters encouraged

**Test Case 6: Password Never Logged**
1. Review application logs
2. Verify passwords never appear in:
   - Console logs
   - Error logs
   - Debug logs
3. Verify only hash stored, password immediately discarded

**Expected Results**:
- Passwords hashed with strong algorithm
- Unique salt per password
- Plain text passwords never stored or logged
- Password policy enforced
- Secure comparison used

**Pass Criteria**: All password security best practices followed

---

# PERFORMANCE TESTS

## TEST-PERF-001: AI Endpoint Load Testing

**Priority**: High
**Category**: Performance Test
**Component**: AI Generation Endpoints

**Description**: Verify system handles concurrent AI requests without crashes or excessive degradation.

**Preconditions**:
- All services running
- Load testing tool available (Apache Bench, k6, Artillery, etc.)
- System monitored (CPU, memory, response times)

**Test Steps**:

**Load Test 1: Tarot Reading Concurrent Requests**
1. Configure load test:
   - Endpoint: POST `/api/ai/tarot/reading`
   - Concurrent users: 5
   - Duration: 5 minutes
   - Valid authentication tokens
2. Execute load test
3. Monitor:
   - Response times (average, min, max, P95, P99)
   - Success rate (% of 200 OK responses)
   - Error rate (% of 500 errors)
   - Backend CPU and memory usage
   - Ollama CPU and memory usage
4. Record results:
   - Throughput: ___ requests/minute
   - Average response time: ___ seconds
   - P95 response time: ___ seconds
   - Success rate: ____%
   - Error rate: ____%

**Load Test 2: Palm Reading Concurrent Requests**
1. Configure load test:
   - Endpoint: POST `/api/ai/palm/reading`
   - Concurrent users: 3 (vision model slower)
   - Duration: 5 minutes
2. Execute and record results

**Load Test 3: Mixed Load**
1. Simulate realistic usage:
   - 60% tarot readings
   - 20% palm readings
   - 10% horoscopes
   - 10% numerology
2. Run for 10 minutes with 10 concurrent users
3. Monitor and record results

**Performance Targets**:
- Tarot readings: 90% success rate under 5 concurrent users
- Average response time: < 30 seconds (tarot), < 90 seconds (palm)
- P95 response time: < 45 seconds (tarot), < 120 seconds (palm)
- No crashes or memory leaks
- Error rate: < 5%

**Expected Results**:
- System handles concurrent load gracefully
- Performance degrades linearly, not exponentially
- No crashes after sustained load
- Memory usage stable (no leaks)
- Backend properly queues requests to Ollama

---

## TEST-PERF-002: Database Performance Under Load

**Priority**: High
**Category**: Performance Test
**Component**: Database Operations

**Description**: Verify database handles high request volume efficiently.

**Preconditions**:
- Database running
- Test data populated (at least 1000 users, 10000 readings)

**Test Steps**:

**Load Test 1: User Authentication**
1. Simulate 50 concurrent login requests
2. Measure:
   - Average query time
   - Database CPU usage
   - Connection pool status
3. Verify:
   - All logins succeed
   - No connection pool exhaustion
   - Response time < 500ms average

**Load Test 2: Reading History Retrieval**
1. Simulate 20 concurrent requests for reading history
2. Measure query performance:
   - SELECT queries with pagination
   - JOIN operations (user + readings)
3. Verify:
   - Response time < 1 second
   - Proper indexes used
   - No N+1 query problems

**Load Test 3: Concurrent Writes**
1. Simulate 30 concurrent reading saves
2. Verify:
   - No deadlocks
   - All writes committed
   - Transaction handling correct

**Performance Targets**:
- Query response time: < 500ms average
- Connection pool: No exhaustion
- Concurrent writes: No deadlocks
- Index usage: Verified in query plans

**Expected Results**:
- Database performance acceptable under load
- Proper indexing on frequently queried fields
- Connection pooling configured correctly
- No bottlenecks

---

## TEST-PERF-003: Image Processing Performance

**Priority**: Medium
**Category**: Performance Test
**Component**: Image Upload and Processing

**Description**: Verify image handling is efficient and doesn't cause timeouts.

**Preconditions**:
- All services running
- Test images of various sizes available

**Test Steps**:

**Test Case 1: Different Image Sizes**
1. Test images:
   - Small: 500KB
   - Medium: 2MB
   - Large: 4.9MB (just under limit)
2. Upload each and measure:
   - Upload time
   - Base64 encoding time
   - Vision model processing time
   - Annotation service time
   - Total end-to-end time
3. Record results for each size

**Test Case 2: Concurrent Image Uploads**
1. Upload 5 palm images simultaneously
2. Measure:
   - Individual processing times
   - System resource usage
   - Memory consumption
3. Verify no OOM errors

**Test Case 3: Image Format Comparison**
1. Test same palm in different formats:
   - JPEG (lossy)
   - PNG (lossless)
   - WebP
2. Compare processing times and quality

**Performance Targets**:
- Upload + encoding: < 5 seconds for 5MB image
- Vision processing: < 90 seconds
- Annotation: < 5 seconds
- Total: < 100 seconds for large images
- Memory usage: Stable, no leaks

**Expected Results**:
- Image processing performant
- Large images handled without crashes
- Memory usage reasonable
- Timeouts configured appropriately

---

## TEST-PERF-004: Frontend Performance

**Priority**: Medium
**Category**: Performance Test
**Component**: Frontend Bundle and Loading

**Description**: Verify frontend loads quickly and is optimized.

**Preconditions**:
- Frontend built for production

**Test Steps**:

**Test Case 1: Bundle Size Analysis**
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Analyze bundle size:
   - Total bundle size: ___ MB
   - JavaScript: ___ MB
   - CSS: ___ MB
   - Assets (images, fonts): ___ MB
3. Verify:
   - JS bundle < 1MB (gzipped)
   - Code splitting used for routes
   - Lazy loading implemented

**Test Case 2: Initial Load Performance**
1. Clear browser cache
2. Open frontend in incognito mode
3. Measure with Chrome DevTools Lighthouse:
   - Performance score: ___/100
   - First Contentful Paint (FCP): ___ seconds
   - Largest Contentful Paint (LCP): ___ seconds
   - Time to Interactive (TTI): ___ seconds
4. Target scores:
   - Performance: > 80
   - FCP: < 2s
   - LCP: < 2.5s
   - TTI: < 3s

**Test Case 3: Runtime Performance**
1. Navigate through application
2. Measure using Chrome DevTools Performance:
   - Frame rate: Should be 60 FPS
   - Main thread activity
   - Memory usage over time
3. Verify:
   - No excessive re-renders
   - No memory leaks
   - Smooth animations

**Expected Results**:
- Lighthouse performance score > 80
- Bundle optimized and split
- Fast initial load
- Smooth runtime performance
- No memory leaks

---

# E2E TESTS

## TEST-E2E-001: Signup to First Reading Journey

**Priority**: Critical
**Category**: E2E Test
**Tool**: Playwright or Cypress

**Description**: Complete user journey from account creation to generating first tarot reading.

**Preconditions**:
- All services running
- E2E testing framework configured
- Clean browser state (no existing sessions)

**Test Steps**:

**Step 1: Landing Page**
1. Navigate to `http://localhost:5173`
2. Verify homepage loads
3. Verify main navigation visible
4. Verify "Sign Up" or "Get Started" button present

**Step 2: Registration**
1. Click "Sign Up" button
2. Fill registration form:
   - Name: "E2E Test User"
   - Email: `e2etest_${timestamp}@example.com`
   - Password: "E2eTestPass123!"
   - Confirm Password: "E2eTestPass123!"
3. Click "Register" button
4. Verify:
   - Success message or automatic login
   - Redirected to dashboard or home
   - User name appears in header

**Step 3: Navigate to Tarot Reading**
1. Click "Tarot Reading" in navigation or dashboard
2. Verify tarot reading page loads
3. Verify spread selection visible

**Step 4: Select Spread**
1. Click "Three Card Spread"
2. Verify spread details displayed:
   - Spread name
   - Description
   - Number of cards: 3
   - Positions: Past, Present, Future

**Step 5: Enter Question**
1. Locate question input field
2. Type: "Will I achieve my dreams?"
3. Verify text appears in field

**Step 6: Draw Cards**
1. Click "Draw Cards" button
2. Wait for card animation (if any)
3. Verify 3 cards displayed
4. Verify each card has:
   - Card image (or placeholder)
   - Card name
   - Position label

**Step 7: Generate Reading**
1. Click "Generate Reading" button
2. Verify:
   - Button shows loading state
   - Spinner appears
   - Button disabled
3. Wait up to 30 seconds

**Step 8: View Reading**
1. Verify loading indicator disappears
2. Verify reading section appears
3. Verify reading contains:
   - Question displayed
   - All 3 cards mentioned
   - Coherent text (not error message)
   - Reasonable length (visually 2-3 paragraphs)
4. Verify "Save Reading" button visible

**Step 9: Save Reading**
1. Click "Save Reading" button
2. Verify success notification
3. Navigate to "My Readings" or "History"
4. Verify saved reading appears in list
5. Click on saved reading
6. Verify reading details displayed correctly

**Step 10: Logout**
1. Click user menu or logout button
2. Verify logged out
3. Verify redirected to login or home page

**Expected Results**:
- Complete journey executes without errors
- User can register, generate reading, save, and view it
- All UI elements responsive and functional
- No console errors (check browser console)
- No network errors (check network tab)

**Execution Time**: < 2 minutes (excluding AI generation time)

---

## TEST-E2E-002: Palm Reading Complete Journey

**Priority**: Critical
**Category**: E2E Test
**Tool**: Playwright or Cypress

**Description**: Complete palm reading journey with image upload.

**Preconditions**:
- All services running
- Test palm image available in test fixtures
- User logged in (from previous test or fresh login)

**Test Steps**:

**Step 1: Navigate to Palm Reading**
1. From logged-in state, navigate to Palm Reading section
2. Verify page loads with upload area

**Step 2: Upload Image**
1. Locate file upload input (may be hidden, use file selector)
2. Select test palm image from fixtures:
   ```javascript
   await page.setInputFiles('input[type="file"]', './fixtures/test-palm.jpg')
   ```
3. Verify:
   - Image preview appears
   - Image dimensions shown (optional)
   - "Generate Reading" button enabled

**Step 3: Add Question (Optional)**
1. Type in question field: "What does my palm say about love?"
2. Verify text appears

**Step 4: Generate Reading**
1. Click "Generate Palm Reading" button
2. Verify loading state:
   - Spinner or progress indicator
   - Message: "Analyzing Your Palm..."
   - Estimated time displayed (optional)
3. Wait up to 90 seconds

**Step 5: View Annotated Image**
1. Verify annotated image section appears
2. Verify two images displayed:
   - Original palm image (uploaded)
   - Annotated image (with colored lines)
3. Verify features legend displayed:
   - List of detected features
   - Each feature as a badge/chip
4. Take screenshot for manual verification

**Step 6: View Reading Text**
1. Scroll to reading section
2. Verify reading displayed:
   - 400-600 words (several paragraphs)
   - Mentions specific palm features
   - Addresses question if provided
3. Verify reading quality (spot check for specificity)

**Step 7: Try Another Image**
1. Click "Upload New Palm" or remove button
2. Verify UI resets to initial state
3. Upload different palm image
4. Generate another reading
5. Verify results are different from first reading

**Expected Results**:
- Image upload works smoothly
- Vision AI processes image successfully
- Annotated image shows colored lines
- Reading is detailed and specific
- Multiple uploads work without errors
- Complete flow takes < 2 minutes (excluding 90s AI time)

---

## TEST-E2E-003: Reading History Management

**Priority**: High
**Category**: E2E Test
**Tool**: Playwright or Cypress

**Description**: Verify user can view, filter, and manage reading history.

**Preconditions**:
- User logged in with multiple saved readings
- If no readings, generate 3-5 readings first

**Test Steps**:

**Step 1: Navigate to History**
1. Click "My Readings" or "History" in navigation
2. Verify history page loads
3. Verify list of readings displayed

**Step 2: Verify Reading List**
1. Verify each reading card/item shows:
   - Reading type (Tarot, Palm, Numerology, Horoscope)
   - Date/timestamp
   - Question (if available)
   - Preview or snippet
2. Verify readings sorted by date (newest first)

**Step 3: Filter Readings (if implemented)**
1. If filter controls present:
   - Filter by type (e.g., "Tarot only")
   - Verify list updates to show only tarot readings
   - Clear filter
   - Verify all readings shown again

**Step 4: View Reading Details**
1. Click on a specific reading
2. Verify detail view opens (modal or new page)
3. Verify complete reading displayed:
   - Full text
   - Cards/images (if applicable)
   - Date
   - Question

**Step 5: Delete Reading (if implemented)**
1. Locate delete button on a reading
2. Click delete
3. Verify confirmation dialog appears
4. Confirm deletion
5. Verify reading removed from list
6. Verify success notification

**Step 6: Pagination (if many readings)**
1. If pagination present:
   - Navigate to page 2
   - Verify different readings loaded
   - Navigate back to page 1
   - Verify original readings shown

**Expected Results**:
- History accessible and displays all user's readings
- Filtering/sorting works correctly
- Reading details viewable
- Deletion works (if implemented)
- UI responsive and performant
- No access to other users' readings (security check)

---

**End of Testing Specifications**

---

## Summary

This comprehensive testing suite covers:
- **51 Frontend Unit/Component/Integration Tests**
- **12 Backend API Tests**
- **7 AI Service Tests**
- **4 Cross-Component Integration Tests**
- **5 Security Tests**
- **4 Performance Tests**
- **3 E2E User Journey Tests**

**Total: 86 detailed test specifications**

All tests designed for black-box testing approach, executable by engineers or automated agents without access to source code.

For test implementation, see individual README files in each test directory.
