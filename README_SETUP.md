# Mystic Vibes Testing - Installation & Setup Guide

## Prerequisites

Make sure the following services are running:
- **Backend API**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173`
- **Ollama**: `http://localhost:11433`
- **Ollama Proxy**: `http://localhost:11434`
- **Palm Annotator**: `http://localhost:5001` (if testing palm reading)

## Installation

### Step 1: Install Dependencies

```bash
cd /Users/yehudahs/work/private/mystic-vibes-testing
npm install
```

This will install:
- **Jest**: Test runner for unit/integration tests
- **Playwright**: E2E testing framework
- **Axios**: HTTP client for API testing
- **dotenv**: Environment configuration

### Step 2: Configure Environment

The `.env.test` file is already configured with defaults:
- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- Ollama Proxy: `http://localhost:11434`

If your services run on different ports, edit `.env.test`.

### Step 3: Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers for testing.

## Test Structure

```
mystic-vibes-testing/
├── backend-tests/          # Backend API tests
│   ├── auth.test.js
│   ├── ai-endpoints.test.js
│   └── ...
├── frontend-tests/         # Frontend unit/component tests
├── ai-service-tests/       # AI service tests
├── integration-tests/      # Full-stack integration tests
├── e2e-tests/             # End-to-end browser tests
├── security-tests/        # Security testing
├── performance-tests/     # Load and performance tests
├── test-framework/        # Shared utilities
│   ├── apiHelper.js      # API request helpers
│   ├── assertions.js     # Custom assertions
│   └── fixtures.js       # Test data
├── test-results/          # Test reports (auto-generated)
├── package.json           # Test dependencies
├── .env.test             # Test configuration
└── README_SETUP.md       # This file
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Backend API tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# AI service tests only
npm run test:ai

# Integration tests
npm run test:integration

# E2E tests (requires services running)
npm run test:e2e

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

### Run Phase 1 Tests (Critical Path)
```bash
npm run test:phase1
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Creating Your First Test

### Example: Backend Auth Test

Create `backend-tests/auth.test.js`:

```javascript
import { createApiHelper } from '../test-framework/apiHelper.js';
import { generateTestUser } from '../test-framework/fixtures.js';
import * as assert from '../test-framework/assertions.js';

describe('TEST-BE-AUTH-001: User Registration', () => {
  let api;

  beforeEach(() => {
    api = createApiHelper();
  });

  test('should register a new user successfully', async () => {
    const user = generateTestUser();
    const response = await api.register(user.name, user.email, user.password);
    
    assert.assertStatus(response, 201);
    assert.assertAuthResponse(response);
    expect(response.data.user.name).toBe(user.name);
    expect(response.data.user.email).toBe(user.email);
  });

  test('should reject duplicate email', async () => {
    const user = generateTestUser();
    
    // Register once
    await api.register(user.name, user.email, user.password);
    
    // Try to register again
    const response = await api.register(user.name, user.email, user.password);
    
    assert.assertErrorResponse(response, 409);
  });
});
```

Run it:
```bash
npm run test:backend
```

## Test Helpers

### API Helper
```javascript
import { createApiHelper } from './test-framework/apiHelper.js';

const api = createApiHelper();

// Register
const response = await api.register('Name', 'email@test.com', 'password');

// Login
await api.login('email@test.com', 'password');

// Make authenticated requests
const user = await api.getCurrentUser();
```

### Assertions
```javascript
import * as assert from './test-framework/assertions.js';

// Assert status code
assert.assertStatus(response, 200);

// Assert JWT token
assert.assertValidJWT(token);

// Assert user object structure
assert.assertUserObject(user);

// Assert auth response (user + token)
assert.assertAuthResponse(response);
```

### Fixtures (Test Data)
```javascript
import { 
  generateTestUser, 
  TAROT_CARDS, 
  SAMPLE_QUESTIONS 
} from './test-framework/fixtures.js';

const user = generateTestUser();
const cards = TAROT_CARDS.generateSampleCards(3);
const question = SAMPLE_QUESTIONS.TAROT[0];
```

## Troubleshooting

### Tests Failing with Connection Errors

**Problem**: Cannot connect to `http://localhost:3001`

**Solution**: Make sure backend is running:
```bash
cd /Users/yehudahs/work/private/mystic-vibes-api
npm run dev
```

### Playwright Tests Failing

**Problem**: Browsers not installed

**Solution**: Install Playwright browsers:
```bash
npx playwright install
```

### Timeout Errors

**Problem**: Tests timing out

**Solution**: Increase timeout in `.env.test`:
```
TEST_TIMEOUT=60000
```

Or in specific test:
```javascript
test('long running test', async () => {
  // Test code
}, 60000); // 60 second timeout
```

## Viewing Test Reports

After running tests, view HTML reports:

### Jest Report
```bash
open test-results/test-report.html
```

### Playwright Report
```bash
npx playwright show-report test-results/playwright-report
```

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Install Playwright browsers**: `npx playwright install`
3. **Start all services** (backend, frontend, Ollama, etc.)
4. **Run Phase 1 tests**: `npm run test:phase1`
5. **Check** `TESTING_CHECKLIST.md` and mark completed tests with ✅

Happy Testing! 🧪✨
