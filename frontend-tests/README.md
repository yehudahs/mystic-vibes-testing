# Frontend Test Specifications

## Overview
This document contains detailed black-box test specifications for the Mystic Vibes frontend application. These tests can be implemented without access to the source code by following the step-by-step instructions.

**Frontend URL**: `http://localhost:5173`

---

## Unit Tests

### TEST-FE-UNIT-001: Tarot Card Selection and Shuffling Logic

**Priority**: High
**Category**: Unit Test
**Component**: Tarot Card Utilities

**Description**: Verify that the tarot card selection mechanism correctly shuffles a deck of 78 cards and returns the requested number of unique cards without duplicates.

**Preconditions**:
- Access to the card selection API or utility function
- Standard tarot deck has 78 cards (22 Major Arcana + 56 Minor Arcana)

**Test Steps**:
1. Request to draw 3 cards from a shuffled deck
2. Verify that exactly 3 cards are returned
3. Verify that all 3 cards are unique (no duplicates)
4. Verify each card has required properties: `id`, `name`, `suit`, `arcana`
5. Request to draw 10 cards
6. Verify that exactly 10 cards are returned and all are unique
7. Request to draw 1 card multiple times (at least 10 times)
8. Verify that different cards are returned across multiple draws (randomness check)

**Expected Results**:
- Card count matches requested amount
- No duplicate cards in a single draw
- All cards have valid structure
- Multiple draws produce different results (statistical randomness)
- Cards come from standard 78-card tarot deck

**Edge Cases**:
- Request 0 cards → Should return empty array or error
- Request 79 cards (more than deck size) → Should return error or max 78 cards
- Request negative number → Should return error

---

### TEST-FE-UNIT-002: Numerology Calculation Functions

**Priority**: Critical
**Category**: Unit Test
**Component**: Numerology Service

**Description**: Verify that numerology calculations correctly reduce names and dates to single-digit or master numbers (11, 22, 33).

**Preconditions**:
- Understanding of numerology calculation rules:
  - A=1, B=2, C=3, ..., Z=26
  - Reduce to single digit by adding digits repeatedly
  - Exception: Master numbers 11, 22, 33 are NOT reduced

**Test Steps**:

**Test Case 1: Life Path Number (from birthdate)**
1. Input: Birthdate `1990-05-15`
2. Calculation: 1+9+9+0 = 19, 0+5 = 5, 1+5 = 6 → Add all: 19+5+6 = 30 → 3+0 = 3
3. Expected Life Path Number: `3`

**Test Case 2: Master Number (11)**
1. Input: Birthdate `1992-11-29`
2. Calculation: 1+9+9+2 = 21, 11 (master), 2+9 = 11 (master) → 21+11+11 = 43 → 4+3 = 7
3. Expected Life Path Number: `7`

**Test Case 3: Destiny Number (from full name)**
1. Input: Name `John Smith`
2. Calculation:
   - J(1)+O(6)+H(8)+N(5) = 20 → 2+0 = 2
   - S(1)+M(4)+I(9)+T(2)+H(8) = 24 → 2+4 = 6
   - Total: 2+6 = 8
3. Expected Destiny Number: `8`

**Test Case 4: Soul Urge Number (vowels only)**
1. Input: Name `John Smith`
2. Calculation: O(6) + I(9) = 15 → 1+5 = 6
3. Expected Soul Urge Number: `6`

**Test Case 5: Personality Number (consonants only)**
1. Input: Name `John Smith`
2. Calculation: J(1)+H(8)+N(5)+S(1)+M(4)+T(2)+H(8) = 29 → 2+9 = 11 (master)
3. Expected Personality Number: `11`

**Expected Results**:
- All calculations return correct single-digit numbers (1-9) or master numbers (11, 22, 33)
- Master numbers are preserved and NOT reduced
- Birthday number equals the day of birth (1-31)
- Current year number calculated correctly for given year

**Edge Cases**:
- Empty name → Should return error
- Name with special characters → Should ignore non-alphabetic characters
- Invalid date → Should return error

---

### TEST-FE-UNIT-003: Zodiac Sign Detection from Birthdate

**Priority**: High
**Category**: Unit Test
**Component**: Horoscope Utilities

**Description**: Verify that zodiac sign detection correctly identifies the astrological sign based on birth month and day.

**Preconditions**:
- Zodiac date ranges:
  - Aries: Mar 21 - Apr 19
  - Taurus: Apr 20 - May 20
  - Gemini: May 21 - Jun 20
  - Cancer: Jun 21 - Jul 22
  - Leo: Jul 23 - Aug 22
  - Virgo: Aug 23 - Sep 22
  - Libra: Sep 23 - Oct 22
  - Scorpio: Oct 23 - Nov 21
  - Sagittarius: Nov 22 - Dec 21
  - Capricorn: Dec 22 - Jan 19
  - Aquarius: Jan 20 - Feb 18
  - Pisces: Feb 19 - Mar 20

**Test Steps**:
1. Input birthdate `1990-03-21` → Expected: `Aries` (first day)
2. Input birthdate `1990-04-19` → Expected: `Aries` (last day)
3. Input birthdate `1990-04-20` → Expected: `Taurus` (boundary)
4. Input birthdate `1985-12-25` → Expected: `Capricorn`
5. Input birthdate `2000-02-29` → Expected: `Pisces` (leap year)
6. Input birthdate `1995-01-01` → Expected: `Capricorn`
7. Test all 12 signs with at least one date in the middle of their range

**Expected Results**:
- Each date correctly maps to its zodiac sign
- Boundary dates (cusp dates) are handled correctly
- Leap year dates (Feb 29) are handled correctly
- Sign name is returned in lowercase or standardized format

**Edge Cases**:
- Invalid date (Feb 30) → Should return error
- Date without year → Should still detect sign
- Future dates → Should still work (sign doesn't depend on year)

---

### TEST-FE-UNIT-004: Image Upload and Base64 Conversion for Palm Reading

**Priority**: High
**Category**: Unit Test
**Component**: Image Upload Utilities

**Description**: Verify that image file selection, validation, and base64 conversion work correctly before sending to backend.

**Preconditions**:
- Test images available:
  - Valid JPG image (< 5MB)
  - Valid PNG image (< 5MB)
  - Oversized image (> 5MB)
  - Invalid file (PDF, text file)

**Test Steps**:

**Test Case 1: Valid JPG Upload**
1. Select a JPG image file (2MB, 800x600 pixels)
2. Verify file type validation passes
3. Verify file size validation passes (< 5MB)
4. Convert image to base64 string
5. Verify base64 string starts with data URL format: `data:image/jpeg;base64,`
6. Verify base64 string is not empty
7. Strip `data:image/jpeg;base64,` prefix
8. Verify remaining string contains only base64 characters (A-Z, a-z, 0-9, +, /, =)

**Test Case 2: Valid PNG Upload**
1. Select a PNG image file (1.5MB)
2. Verify converts to `data:image/png;base64,`
3. Verify successful conversion

**Test Case 3: Oversized Image Rejection**
1. Select an image file > 5MB (e.g., 6MB)
2. Verify validation fails
3. Verify error message indicates "File too large"
4. Verify image is NOT uploaded

**Test Case 4: Invalid File Type Rejection**
1. Select a PDF file
2. Verify validation fails
3. Verify error message indicates "Invalid file type"
4. Verify file is NOT processed

**Test Case 5: No File Selected**
1. Trigger upload without selecting a file
2. Verify validation fails
3. Verify error message indicates "No file selected"

**Expected Results**:
- Valid images (JPG, PNG, GIF, WebP) are accepted
- File size limit (5MB) is enforced
- Invalid file types are rejected
- Base64 conversion produces valid output
- Data URL prefix can be stripped correctly

---

## Component Tests

### TEST-FE-COMP-001: PalmReading Component Rendering and Interactions

**Priority**: Critical
**Category**: Component Test
**Component**: PalmReading.tsx

**Description**: Verify that the palm reading component renders correctly and handles user interactions properly.

**Preconditions**:
- Frontend application is running
- Navigate to Palm Reading page/section
- User may or may not be authenticated

**Test Steps**:

**Step 1: Initial Render**
1. Navigate to palm reading page
2. Verify instructions card is visible with these elements:
   - Hand icon
   - Title: "How to Get Your Palm Reading"
   - Numbered list of 5 instructions
3. Verify question input field is visible with placeholder text
4. Verify upload area is visible with:
   - Upload icon
   - "Upload Your Palm Image" heading
   - "Click to browse or drag and drop" text
   - "JPG, PNG (Max 5MB)" file type hint

**Step 2: Image Upload**
1. Click on upload area
2. Select a valid palm image (JPG, 2MB)
3. Verify upload area transforms to show:
   - Selected image preview
   - Remove button (X icon) in top-right corner
   - "Generate Palm Reading" button (enabled)

**Step 3: Optional Question Input**
1. Type question: "What does my future hold?"
2. Verify text appears in input field
3. Verify character limit (if any) is enforced

**Step 4: Generate Reading**
1. Click "Generate Palm Reading" button
2. Verify button shows loading state:
   - Spinner icon visible
   - Text changes to "Analyzing Your Palm..."
   - Button is disabled during generation
3. Wait for AI response (may take 30-60 seconds for vision model)
4. Verify loading indicator appears with:
   - Spinner animation
   - "Analyzing Your Palm..." message
   - "Our AI is examining the lines, mounts, and features" subtext

**Step 5: View Results**
1. After generation completes, verify annotated image section appears (if annotation service is available):
   - "Annotated Palm Analysis" heading
   - Two side-by-side images: Original vs Annotated
   - Features legend showing detected features (e.g., Heart Line, Head Line, Life Line)
   - Feature count badge
2. Verify reading text section appears below:
   - "Your Palm Reading" heading
   - "AI-Powered Palmistry Analysis" subtitle
   - Reading text (400-600 words)
   - Question displayed at bottom if provided
3. Verify success toast/notification appears

**Step 6: Remove Image**
1. Click X button on image
2. Verify image is removed
3. Verify component resets to initial upload state
4. Verify reading results are cleared

**Expected Results**:
- All UI elements render correctly
- Image upload and preview work smoothly
- Loading states are clear and informative
- Reading results display properly with both annotated image and text
- Component handles errors gracefully (show error message if API fails)
- Remove functionality resets component state

**Edge Cases**:
- Upload invalid file → Shows error toast
- Upload oversized file → Shows error toast
- Generate without image → Shows error toast
- API timeout → Shows error message
- Annotation service unavailable → Shows reading without annotated image

---

### TEST-FE-COMP-002: TarotReading Component with Mock Data

**Priority**: Critical
**Category**: Component Test
**Component**: TarotReading Component

**Description**: Verify that the tarot reading component correctly displays spread selection, card drawing, and reading generation.

**Preconditions**:
- Frontend running
- Navigate to Tarot Reading page
- User may or may not be authenticated

**Test Steps**:

**Step 1: Spread Selection**
1. Navigate to tarot reading page
2. Verify spread options are displayed (e.g., Three Card, Celtic Cross, etc.)
3. Select "Three Card" spread
4. Verify spread information displays:
   - Spread name
   - Spread description
   - Number of cards to draw
   - Position meanings (Past, Present, Future)

**Step 2: Question Input**
1. Locate question input field
2. Enter question: "Will I find success in my career?"
3. Verify text appears correctly
4. Verify "Draw Cards" button becomes enabled

**Step 3: Card Drawing**
1. Click "Draw Cards" button
2. Verify card drawing animation (cards shuffling/appearing)
3. Verify exactly 3 cards are displayed
4. Verify each card shows:
   - Card image
   - Card name
   - Position label (Past/Present/Future)
   - Reversed indicator (if applicable)

**Step 4: Generate AI Reading**
1. Click "Generate Reading" button
2. Verify loading state with spinner
3. Verify button text changes to "Generating Your Reading..."
4. Wait for AI response (10-20 seconds)

**Step 5: View Reading Results**
1. Verify reading section appears with:
   - Heading: "Your Tarot Reading"
   - Question displayed prominently
   - Individual card interpretations (one per card with position)
   - Overall reading/synthesis (200-400 words)
   - Timestamp
2. Verify "Save Reading" button appears (if user authenticated)
3. Verify "Draw Again" button appears

**Step 6: Save Reading (if authenticated)**
1. Click "Save Reading"
2. Verify success message
3. Navigate to reading history
4. Verify saved reading appears in list

**Expected Results**:
- Spread selection works correctly
- Card drawing produces unique cards
- AI reading generation completes successfully
- Reading is comprehensive and addresses the question
- Save functionality works for authenticated users
- Component handles all user interactions smoothly

---

### TEST-FE-COMP-003: Horoscope Component Rendering

**Priority**: High
**Category**: Component Test
**Component**: Horoscope Component

**Description**: Verify horoscope component correctly handles sign selection, type selection, and displays generated horoscopes.

**Preconditions**:
- Frontend running
- Navigate to Horoscope page

**Test Steps**:

**Step 1: Sign Selection**
1. Navigate to horoscope page
2. Verify all 12 zodiac signs are displayed as selection options
3. Click on "Leo" sign
4. Verify Leo becomes selected (highlighted/active state)

**Step 2: Horoscope Type Selection**
1. Verify horoscope type options: Daily, Weekly, Monthly
2. Select "Daily"
3. Verify selection updates

**Step 3: Optional Question**
1. Locate optional question input
2. Enter: "What should I focus on today?"
3. Verify text appears

**Step 4: Generate Horoscope**
1. Click "Generate Horoscope" button
2. Verify loading state appears
3. Wait for generation (5-10 seconds)

**Step 5: View Results**
1. Verify horoscope card displays:
   - Sign name and symbol
   - Horoscope type (Daily)
   - Date/date range
   - Horoscope text (150-250 words)
   - Question addressed (if provided)
2. Verify "Generate New" button appears

**Expected Results**:
- All 12 signs selectable
- Horoscope types work correctly
- Generated horoscope is relevant to selected sign
- Question integration works properly
- Content is appropriate length

---

### TEST-FE-COMP-004: Numerology Form Validation

**Priority**: High
**Category**: Component Test
**Component**: Numerology Form Component

**Description**: Verify numerology form correctly validates inputs and displays calculation results.

**Preconditions**:
- Frontend running
- Navigate to Numerology page

**Test Steps**:

**Step 1: Form Field Validation**
1. Navigate to numerology page
2. Verify form fields present:
   - First Name (required)
   - Last Name (required)
   - Birth Date (required)
   - Optional question(s)

**Test 2: Empty Submission**
1. Leave all fields empty
2. Click "Calculate Numerology"
3. Verify validation errors appear:
   - "First name is required"
   - "Last name is required"
   - "Birth date is required"

**Test 3: Invalid Date**
1. Enter first name: "John"
2. Enter last name: "Doe"
3. Enter invalid date: "2025-13-45"
4. Click "Calculate Numerology"
5. Verify error: "Invalid birth date"

**Test 4: Valid Submission**
1. Enter first name: "John"
2. Enter last name: "Smith"
3. Enter birth date: "1990-05-15"
4. Optionally enter question: "What is my life purpose?"
5. Click "Calculate Numerology"
6. Verify loading state

**Test 5: View Results**
1. Wait for calculation (5-10 seconds)
2. Verify results display:
   - Life Path Number with interpretation
   - Destiny Number with interpretation
   - Soul Urge Number with interpretation
   - Personality Number with interpretation
   - Birthday Number with interpretation
   - Maturity Number with interpretation
   - Current Year Number with interpretation
   - Overall synthesis
   - Personal guidance (if question provided)
3. Verify each number is between 1-9 or master number (11, 22, 33)

**Expected Results**:
- Form validation prevents invalid submissions
- All required fields enforced
- Date validation works correctly
- Calculations complete successfully
- Results display all 7 numerology numbers
- Interpretations are meaningful and personalized

---

## Integration Tests

### TEST-FE-INT-001: Authentication Flow (Login/Register/Logout)

**Priority**: Critical
**Category**: Integration Test
**Module**: Authentication

**Description**: Verify complete authentication flow from registration through login to logout.

**Preconditions**:
- Frontend and backend running
- Database accessible
- Test email not already registered: `testuser_${timestamp}@example.com`

**Test Steps**:

**Phase 1: Registration**
1. Navigate to registration page/modal
2. Enter details:
   - Name: "Test User"
   - Email: `testuser_${timestamp}@example.com`
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
3. Click "Register" button
4. Verify success message appears
5. Verify user is automatically logged in
6. Verify user name appears in header/navbar
7. Verify JWT token is stored (check localStorage/cookies)

**Phase 2: Logout**
1. Click logout button in header
2. Verify user is logged out
3. Verify redirected to home/login page
4. Verify JWT token is removed
5. Verify protected routes are inaccessible

**Phase 3: Login**
1. Navigate to login page/modal
2. Enter credentials:
   - Email: (same as registered)
   - Password: "SecurePass123!"
3. Click "Login" button
4. Verify success message
5. Verify user is logged in
6. Verify user name appears in header
7. Verify JWT token is stored

**Phase 4: Invalid Login Attempts**
1. Logout
2. Attempt login with wrong password
3. Verify error message: "Invalid credentials"
4. Attempt login with non-existent email
5. Verify error message: "User not found" or "Invalid credentials"

**Phase 5: Protected Routes**
1. Logout (ensure not authenticated)
2. Try to access protected route (e.g., /profile, /readings/history)
3. Verify redirected to login page
4. Login successfully
5. Verify can now access protected routes

**Expected Results**:
- Registration creates new user account
- Auto-login after registration works
- Logout clears session completely
- Login with correct credentials succeeds
- Login with incorrect credentials fails with appropriate errors
- Protected routes enforce authentication
- JWT tokens managed correctly

---

### TEST-FE-INT-002: API Service Integration with Mock Responses

**Priority**: High
**Category**: Integration Test
**Module**: API Service Layer

**Description**: Verify that the frontend API service correctly handles requests and responses from the backend, including error scenarios.

**Preconditions**:
- Frontend running with API configured
- Backend may be running OR mocked

**Test Steps**:

**Test Case 1: Successful API Call**
1. Make API call to `/api/auth/me` with valid token
2. Verify request headers include:
   - `Authorization: Bearer {token}`
   - `Content-Type: application/json`
3. Verify response is parsed correctly
4. Verify user data is returned with expected structure

**Test Case 2: 401 Unauthorized**
1. Make API call with invalid/expired token
2. Verify 401 response is caught
3. Verify user is logged out automatically
4. Verify token is cleared from storage
5. Verify redirect to login page

**Test Case 3: 404 Not Found**
1. Make API call to non-existent endpoint
2. Verify 404 error is handled gracefully
3. Verify user-friendly error message is displayed

**Test Case 4: 500 Server Error**
1. Simulate 500 error from backend
2. Verify error is caught
3. Verify appropriate error message: "Server error, please try again"
4. Verify no app crash

**Test Case 5: Network Error**
1. Simulate network disconnection (backend offline)
2. Make API call
3. Verify timeout or network error is caught
4. Verify message: "Cannot connect to server"

**Test Case 6: Request Timeout**
1. Make API call that takes > 10 seconds
2. Verify request times out
3. Verify timeout error message displayed

**Expected Results**:
- API service correctly formats requests
- Auth tokens included automatically
- Responses parsed correctly
- Errors handled gracefully with user-friendly messages
- No unhandled exceptions that crash the app
- Appropriate actions taken (logout on 401, retry prompts on network error)

---

**End of Frontend Test Specifications**

*See backend-tests/README.md for backend test specifications*
*See ai-service-tests/README.md for AI service test specifications*
