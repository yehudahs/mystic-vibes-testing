# Backend API Test Specifications

## Overview
This document contains detailed black-box test specifications for the Mystic Vibes backend API. Tests focus on endpoint behavior, request/response validation, authentication, and error handling.

**Backend API URL**: `http://localhost:3001`
**Base Path**: `/api`

---

## Authentication Endpoint Tests

### TEST-BE-AUTH-001: User Registration

**Priority**: Critical
**Category**: API Test
**Endpoint**: `POST /api/auth/register`

**Description**: Verify that new users can successfully register with valid credentials.

**Preconditions**:
- Backend and database running
- Test email not already in database

**Request Format**:
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "newuser@example.com",
  "password": "SecurePass123!"
}
```

**Test Steps**:

**Test Case 1: Successful Registration**
1. Send POST request with valid data
2. Verify response status: `201 Created`
3. Verify response body contains:
   ```json
   {
     "user": {
       "id": "<uuid>",
       "name": "Test User",
       "email": "newuser@example.com",
       "created_at": "<timestamp>"
     },
     "token": "<jwt-token>"
   }
   ```
4. Verify JWT token is a valid format (three base64 parts separated by dots)
5. Verify password is NOT returned in response
6. Verify user can immediately login with registered credentials

**Test Case 2: Duplicate Email**
1. Register user with email `duplicate@example.com`
2. Attempt to register again with same email
3. Verify response status: `409 Conflict` or `400 Bad Request`
4. Verify error message: "Email already exists" or similar

**Test Case 3: Missing Required Fields**
1. Send request missing `name` field
2. Verify response status: `400 Bad Request`
3. Verify error indicates which field is missing
4. Repeat for `email` and `password` fields

**Test Case 4: Invalid Email Format**
1. Send request with email: "notanemail"
2. Verify response status: `400 Bad Request`
3. Verify error message: "Invalid email format"

**Test Case 5: Weak Password**
1. Send request with password: "123"
2. Verify response status: `400 Bad Request`
3. Verify error message indicates password requirements
   - (e.g., minimum 8 characters, contains letters and numbers)

**Expected Results**:
- Valid registrations succeed with 201 status
- User object and JWT token returned
- Password is hashed in database (never stored plain text)
- Duplicate emails rejected
- Invalid inputs rejected with clear error messages
- Password requirements enforced

---

### TEST-BE-AUTH-002: User Login

**Priority**: Critical
**Category**: API Test
**Endpoint**: `POST /api/auth/login`

**Description**: Verify that registered users can login with correct credentials.

**Preconditions**:
- Backend and database running
- Test user registered with:
  - Email: `testuser@example.com`
  - Password: `SecurePass123!`

**Request Format**:
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

**Test Steps**:

**Test Case 1: Successful Login**
1. Send POST request with valid credentials
2. Verify response status: `200 OK`
3. Verify response body contains:
   ```json
   {
     "user": {
       "id": "<uuid>",
       "name": "Test User",
       "email": "testuser@example.com"
     },
     "token": "<jwt-token>"
   }
   ```
4. Verify JWT token can be used for authenticated requests

**Test Case 2: Wrong Password**
1. Send request with correct email but wrong password
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Invalid credentials" (should not specify if email or password is wrong for security)

**Test Case 3: Non-existent User**
1. Send request with email not in database
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Invalid credentials"

**Test Case 4: Missing Fields**
1. Send request without email field
2. Verify response status: `400 Bad Request`
3. Repeat for password field

**Test Case 5: Empty Password**
1. Send request with empty password: ""
2. Verify response status: `400 Bad Request`

**Expected Results**:
- Valid login succeeds with 200 status
- JWT token returned and is valid
- Wrong credentials return 401
- Error messages don't leak information about which field is wrong
- Missing fields return 400

---

### TEST-BE-AUTH-003: Get Current User (Me)

**Priority**: High
**Category**: API Test
**Endpoint**: `GET /api/auth/me`

**Description**: Verify that authenticated users can retrieve their own profile information.

**Preconditions**:
- Backend running
- Valid JWT token from login/registration

**Request Format**:
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

**Test Steps**:

**Test Case 1: Valid Token**
1. Send GET request with valid JWT token in Authorization header
2. Verify response status: `200 OK`
3. Verify response contains user object:
   ```json
   {
     "user": {
       "id": "<uuid>",
       "name": "Test User",
       "email": "testuser@example.com",
       "created_at": "<timestamp>",
       "avatar": "<url or null>"
     }
   }
   ```
4. Verify password is NOT included in response

**Test Case 2: Missing Token**
1. Send GET request without Authorization header
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Authentication required" or "No token provided"

**Test Case 3: Invalid Token**
1. Send GET request with malformed token: "invalid.token.here"
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Invalid token"

**Test Case 4: Expired Token**
1. Use an expired JWT token (if available)
2. Send GET request
3. Verify response status: `401 Unauthorized`
4. Verify error message: "Token expired"

**Expected Results**:
- Valid token returns user data
- No sensitive data (password) exposed
- Missing/invalid/expired tokens return 401
- Error messages are clear

---

### TEST-BE-AUTH-004: Logout

**Priority**: Medium
**Category**: API Test
**Endpoint**: `POST /api/auth/logout`

**Description**: Verify logout functionality (if implemented server-side).

**Preconditions**:
- User logged in with valid token

**Request Format**:
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

**Test Steps**:

**Test Case 1: Successful Logout**
1. Send POST request with valid token
2. Verify response status: `200 OK` or `204 No Content`
3. If token blacklisting is implemented:
   - Attempt to use same token for authenticated request
   - Verify request fails with 401
4. If client-side only logout:
   - Verify response confirms logout
   - Token invalidation handled by client

**Expected Results**:
- Logout endpoint responds successfully
- If token blacklisting exists, old token becomes invalid
- If client-side only, response confirms logout

**Note**: Many JWT implementations handle logout purely client-side (deleting token from storage). This test applies if server-side invalidation exists.

---

## AI Endpoint Tests

### TEST-BE-AI-001: Generate Tarot Reading

**Priority**: Critical
**Category**: API Test
**Endpoint**: `POST /api/ai/tarot/reading`

**Description**: Verify that tarot reading generation works correctly with valid card and question data.

**Preconditions**:
- Backend, proxy, and Ollama running
- Model `llama3.2:3b` available in Ollama
- Endpoint supports `optionalAuth` (works with or without authentication)

**Request Format**:
```json
POST /api/ai/tarot/reading
Content-Type: application/json
Authorization: Bearer <jwt-token> (optional)

{
  "cards": [
    {
      "name": "The Fool",
      "position": "Past",
      "isReversed": false
    },
    {
      "name": "The Magician",
      "position": "Present",
      "isReversed": false
    },
    {
      "name": "The Star",
      "position": "Future",
      "isReversed": true
    }
  ],
  "question": "What does my career path hold?",
  "spread": "Three Card Spread"
}
```

**Test Steps**:

**Test Case 1: Successful Reading Generation**
1. Send POST request with valid data
2. Verify response status: `200 OK`
3. Verify response time is < 30 seconds
4. Verify response body structure:
   ```json
   {
     "success": true,
     "reading": "<string 200-400 words>",
     "metadata": {
       "provider": "ollama",
       "model": "llama3.2:3b",
       "usage": {
         "prompt_tokens": <number>,
         "completion_tokens": <number>,
         "total_tokens": <number>
       }
     }
   }
   ```
5. Verify `reading` field contains:
   - Reference to the user's question
   - Interpretation of each card mentioned
   - Mention of positions (Past, Present, Future)
   - Note about reversed card if applicable
   - Coherent narrative (not gibberish)
   - Length between 200-400 words

**Test Case 2: Missing Cards Array**
1. Send request without `cards` field
2. Verify response status: `400 Bad Request`
3. Verify error message: "Cards array is required"

**Test Case 3: Empty Cards Array**
1. Send request with `cards: []`
2. Verify response status: `400 Bad Request`
3. Verify error message indicates cards are required

**Test Case 4: Missing Question**
1. Send request without `question` field
2. Verify response status: `400 Bad Request`
3. Verify error message: "Question is required"

**Test Case 5: Empty Question String**
1. Send request with `question: ""`
2. Verify response status: `400 Bad Request`

**Test Case 6: Ollama Service Unavailable**
1. Stop Ollama service
2. Send valid request
3. Verify response status: `500 Internal Server Error`
4. Verify error message indicates service unavailability
5. Restart Ollama

**Test Case 7: With Authentication (Context Saving)**
1. Send request with valid JWT token
2. Verify request succeeds
3. Send another request with same token
4. Verify AI may use context from previous conversation
5. Check logs for "Loaded user context" message

**Expected Results**:
- Valid requests return comprehensive tarot reading
- Reading quality is coherent and relevant
- Validation errors return 400
- Service errors return 500
- Authenticated users may get context continuity
- Response times are acceptable (< 30s)

---

### TEST-BE-AI-002: Generate Horoscope

**Priority**: High
**Category**: API Test
**Endpoint**: `POST /api/ai/horoscope/generate`

**Description**: Verify horoscope generation for all zodiac signs and types.

**Preconditions**:
- Backend, proxy, and Ollama running
- User authenticated (endpoint requires authentication)

**Request Format**:
```json
POST /api/ai/horoscope/generate
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "sign": "leo",
  "type": "daily",
  "question": "What should I focus on today?" (optional)
}
```

**Test Steps**:

**Test Case 1: Daily Horoscope**
1. Send request for Leo, daily horoscope
2. Verify response status: `200 OK`
3. Verify response structure:
   ```json
   {
     "success": true,
     "horoscope": "<string 150-250 words>",
     "sign": "leo",
     "type": "daily",
     "metadata": {
       "provider": "ollama",
       "model": "llama3.2:3b",
       "usage": {...}
     }
   }
   ```
4. Verify horoscope content:
   - Mentions Leo traits or characteristics
   - Appropriate to daily timeframe
   - Includes specific advice or insights
   - 150-250 words in length

**Test Case 2: Weekly Horoscope**
1. Send request with `type: "weekly"`
2. Verify response mentions week-long timeframe

**Test Case 3: Monthly Horoscope**
1. Send request with `type: "monthly"`
2. Verify response mentions monthly timeframe

**Test Case 4: All 12 Zodiac Signs**
1. Test each sign: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces
2. Verify each generates successfully
3. Verify content is unique and appropriate to each sign

**Test Case 5: With Question**
1. Send request with optional question field
2. Verify horoscope addresses the question

**Test Case 6: Invalid Zodiac Sign**
1. Send request with `sign: "notasign"`
2. Verify response status: `400 Bad Request`
3. Verify error message: "Invalid zodiac sign"

**Test Case 7: Invalid Type**
1. Send request with `type: "yearly"` (if not supported)
2. Verify response status: `400 Bad Request`
3. Verify error message indicates valid types

**Test Case 8: Missing Authentication**
1. Send request without JWT token
2. Verify response status: `401 Unauthorized`

**Expected Results**:
- All zodiac signs generate successfully
- All horoscope types work correctly
- Content is relevant and appropriate length
- Optional questions are addressed
- Invalid inputs rejected with clear errors
- Authentication required

---

### TEST-BE-AI-003: Generate Palm Reading

**Priority**: Critical
**Category**: API Test
**Endpoint**: `POST /api/ai/palm/reading`

**Description**: Verify palm reading generation from image data with vision AI model.

**Preconditions**:
- Backend, proxy, Ollama, and palm annotator service running
- Vision model `llama3.2-vision:11b` available
- Test palm image available (base64 encoded)

**Request Format**:
```json
POST /api/ai/palm/reading
Content-Type: application/json
Authorization: Bearer <jwt-token> (optional)

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "question": "What does my palm say about my future?" (optional)
}
```

**Test Steps**:

**Test Case 1: Successful Palm Reading**
1. Prepare base64-encoded palm image
2. Send POST request with image data
3. Verify response status: `200 OK`
4. Verify response time is < 90 seconds (vision models are slower)
5. Verify response structure:
   ```json
   {
     "success": true,
     "reading": "<string 400-600 words>",
     "annotated_image": "<base64-string>",
     "features_detected": ["heart_line", "head_line", "life_line", ...],
     "metadata": {
       "provider": "ollama",
       "model": "llama3.2-vision:11b",
       "usage": {...}
     }
   }
   ```
6. Verify `reading` field:
   - Contains specific observations about palm features
   - Mentions lines (heart, head, life, fate)
   - References actual visible features
   - Provides interpretation and guidance
   - 400-600 words in length
   - Detailed and specific (not generic)
7. Verify `annotated_image`:
   - Is valid base64 string
   - Can be decoded to PNG image
   - Shows colored lines overlaid on original palm
8. Verify `features_detected`:
   - Contains array of detected features
   - Includes major lines if visible in image

**Test Case 2: With Question**
1. Include optional question in request
2. Verify reading addresses the question specifically

**Test Case 3: Missing Image**
1. Send request without `image` field
2. Verify response status: `400 Bad Request`
3. Verify error: "Image is required"

**Test Case 4: Invalid Image Format**
1. Send request with invalid base64 string
2. Verify response status: `400 Bad Request` or `500 Internal Server Error`

**Test Case 5: Palm Annotator Service Unavailable**
1. Stop palm annotation service (port 5001)
2. Send valid request
3. Verify reading still generated (annotation is optional)
4. Verify `annotated_image` field is absent or null
5. Verify no crash or error
6. Verify logs show annotation service error is caught

**Test Case 6: Vision Model Not Available**
1. Stop Ollama or ensure vision model not pulled
2. Send request
3. Verify response status: `500 Internal Server Error`
4. Verify error message indicates model unavailability

**Expected Results**:
- Palm readings generated from images successfully
- Vision model produces detailed, specific analysis
- Annotated images provided when service available
- Features detected and listed
- Reading quality is high (specific vs generic)
- Annotation service failure doesn't break reading generation
- Response times acceptable (< 90s for vision processing)

---

### TEST-BE-AI-004: Generate Numerology Content

**Priority**: High
**Category**: API Test
**Endpoint**: `POST /api/ai/numerology/generate`

**Description**: Verify numerology reading generation endpoint (newly added).

**Preconditions**:
- Backend, proxy, and Ollama running
- Endpoint supports `optionalAuth`

**Request Format**:
```json
POST /api/ai/numerology/generate
Content-Type: application/json
Authorization: Bearer <jwt-token> (optional)

{
  "prompt": "<detailed numerology prompt with calculations>",
  "model": "llama3.2:3b" (optional, defaults to llama3.2:3b)
}
```

**Test Steps**:

**Test Case 1: Successful Generation**
1. Create detailed numerology prompt including:
   - Person's name: "John Smith"
   - Birth date: "1990-05-15"
   - Calculated numbers: Life Path 3, Destiny 8, etc.
   - Any personal questions
2. Send POST request
3. Verify response status: `200 OK`
4. Verify response structure:
   ```json
   {
     "success": true,
     "response": "<numerology reading>",
     "metadata": {
       "provider": "ollama",
       "model": "llama3.2:3b",
       "usage": {...}
     }
   }
   ```
5. Verify response is relevant to numerology and addresses the prompt

**Test Case 2: Missing Prompt**
1. Send request without `prompt` field
2. Verify response status: `400 Bad Request`
3. Verify error: "Prompt is required"

**Test Case 3: Empty Prompt**
1. Send request with `prompt: ""`
2. Verify response status: `400 Bad Request`

**Expected Results**:
- Numerology readings generated successfully
- AI produces relevant content based on prompt
- Validation errors handled correctly
- Uses correct model (llama3.2:3b)

---

### TEST-BE-AI-005: Generate Personalization Content

**Priority**: Medium
**Category**: API Test
**Endpoint**: `POST /api/ai/personalization/generate`

**Description**: Verify personalization content generation (welcome messages, etc.).

**Preconditions**:
- Backend, proxy, and Ollama running
- Endpoint supports `optionalAuth`

**Request Format**:
```json
POST /api/ai/personalization/generate
Content-Type: application/json
Authorization: Bearer <jwt-token> (optional)

{
  "prompt": "Generate a personalized welcome message for John, a returning user visiting in the evening...",
  "model": "llama3.2:3b" (optional)
}
```

**Test Steps**:

**Test Case 1: Successful Generation**
1. Create personalization prompt
2. Send POST request
3. Verify response status: `200 OK`
4. Verify response structure similar to numerology endpoint
5. Verify response contains personalized content

**Test Case 2: Validation**
1. Test missing/empty prompt
2. Verify appropriate validation errors

**Expected Results**:
- Personalization content generated successfully
- Responses are coherent and relevant

---

### TEST-BE-AI-006: AI Health Check

**Priority**: Medium
**Category**: API Test
**Endpoint**: `GET /api/ai/health`

**Description**: Verify AI service health check endpoint.

**Preconditions**:
- Backend running
- Ollama may or may not be running

**Request Format**:
```http
GET /api/ai/health
```

**Test Steps**:

**Test Case 1: AI Service Healthy**
1. Ensure Ollama is running
2. Send GET request
3. Verify response status: `200 OK`
4. Verify response:
   ```json
   {
     "status": "healthy",
     "provider": "ollama",
     "model": "llama3.2:3b"
   }
   ```

**Test Case 2: AI Service Unhealthy**
1. Stop Ollama service
2. Send GET request
3. Verify response status: `500 Internal Server Error` or `503 Service Unavailable`
4. Verify response indicates unhealthy status

**Expected Results**:
- Health check accurately reflects AI service status
- Returns current provider and model information

---

## Authentication Middleware Tests

### TEST-BE-MIDDLEWARE-001: Protected Route Authentication

**Priority**: Critical
**Category**: Middleware Test
**Component**: Authentication Middleware

**Description**: Verify that protected routes enforce authentication correctly.

**Preconditions**:
- Backend running
- Multiple endpoints using `authenticateToken` middleware

**Test Steps**:

**Test Case 1: Valid Token Accepted**
1. Obtain valid JWT token via login
2. Access protected endpoint with token in Authorization header
3. Verify request succeeds (200 OK or appropriate success status)

**Test Case 2: No Token Provided**
1. Access protected endpoint without Authorization header
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Authentication required" or similar

**Test Case 3: Malformed Token**
1. Send request with Authorization header: "Bearer invalidtoken"
2. Verify response status: `401 Unauthorized`
3. Verify error message: "Invalid token"

**Test Case 4: Token with Wrong Format**
1. Send request with Authorization header: "invalidtoken" (missing "Bearer")
2. Verify response status: `401 Unauthorized`

**Test Case 5: Expired Token**
1. Create or obtain expired JWT token
2. Use token to access protected endpoint
3. Verify response status: `401 Unauthorized`
4. Verify error message: "Token expired"

**Test Case 6: User Extracted from Token**
1. Access protected endpoint with valid token
2. Verify that user information from token is available to route handler
3. Verify route can access `req.user.id`, `req.user.email`, etc.

**Expected Results**:
- Valid tokens allow access
- Missing/invalid/expired tokens return 401
- User data properly extracted from token
- Error messages are clear and consistent

---

## Error Handling Tests

### TEST-BE-ERROR-001: Error Response Formats

**Priority**: High
**Category**: Error Handling Test
**Component**: Global Error Handler

**Description**: Verify that all error responses follow consistent format and provide appropriate information.

**Preconditions**:
- Backend running

**Test Steps**:

**Test Case 1: 400 Bad Request**
1. Trigger 400 error (e.g., missing required field)
2. Verify response status: `400`
3. Verify response format:
   ```json
   {
     "error": "Validation error",
     "message": "Specific error details"
   }
   ```

**Test Case 2: 401 Unauthorized**
1. Trigger 401 error (access protected route without token)
2. Verify response status: `401`
3. Verify error message present

**Test Case 3: 404 Not Found**
1. Access non-existent endpoint
2. Verify response status: `404`
3. Verify error message: "Endpoint not found" or similar

**Test Case 4: 500 Internal Server Error**
1. Trigger 500 error (e.g., database connection failure)
2. Verify response status: `500`
3. Verify error message present but doesn't leak sensitive info
4. Verify stack traces NOT exposed in production

**Expected Results**:
- All errors return JSON format
- Error messages are user-friendly
- Sensitive information not leaked
- Status codes are appropriate

---

## Database Tests

### TEST-BE-DB-001: User CRUD Operations

**Priority**: Critical
**Category**: Database Test
**Component**: Users Table

**Description**: Verify user database operations work correctly.

**Preconditions**:
- Backend and database running
- Database has users table

**Test Steps**:

**Test Case 1: Create User**
1. Register new user via API
2. Directly query database: `SELECT * FROM users WHERE email = 'newuser@example.com'`
3. Verify user record exists
4. Verify password is hashed (not plain text)
5. Verify created_at timestamp is set

**Test Case 2: Read User**
1. Query user by ID
2. Verify all fields returned correctly

**Test Case 3: Update User**
1. Update user profile via API
2. Query database to verify changes persisted

**Test Case 4: User Soft Delete (if implemented)**
1. Delete user account via API
2. Verify user marked as deleted or removed

**Expected Results**:
- User records created correctly
- Passwords always hashed
- Updates persisted
- Queries return accurate data

---

### TEST-BE-DB-002: Readings Storage and Retrieval

**Priority**: High
**Category**: Database Test
**Component**: Readings Table

**Description**: Verify tarot reading storage in database.

**Preconditions**:
- Backend and database running
- User authenticated

**Test Steps**:

**Test Case 1: Save Reading**
1. Generate tarot reading via API
2. Save reading (if save endpoint exists)
3. Query database to verify reading stored
4. Verify reading data includes: user_id, spread_id, cards, interpretation, timestamp

**Test Case 2: Retrieve Reading History**
1. User has multiple saved readings
2. Call GET /api/readings endpoint
3. Verify returns user's readings only (not other users')
4. Verify pagination works if implemented

**Expected Results**:
- Readings saved correctly
- Foreign keys maintained (user_id references users)
- Only user's own readings accessible

---

**End of Backend Test Specifications**

*See ai-service-tests/README.md for AI service test specifications*
*See integration-tests.md for integration test specifications*
