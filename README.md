# Mystic Vibes Testing Repository

## Overview
This repository contains comprehensive test specifications and test suites for the Mystic Vibes application - a mystical platform offering tarot readings, horoscopes, palmistry, and numerology services powered by AI.

## Architecture Overview
The application consists of three main components:

### 1. Frontend (React + TypeScript + Vite)
- User interface for mystical services
- Handles user authentication
- Manages reading requests and displays results
- Runs on: `http://localhost:5173` (development)

### 2. Backend API (Node.js + Express + PostgreSQL)
- RESTful API for all business logic
- User authentication (JWT-based)
- Database operations
- Routes AI requests to the proxy
- Runs on: `http://localhost:3001`

### 3. AI Service (Ollama + Python Annotation Service)
- **Ollama**: Local AI models for generating mystical content
  - Primary port: `11433` (actual Ollama)
  - Proxy port: `11434` (Node.js proxy forwarding to Ollama)
  - Models: `llama3.2:3b`, `llama3.2-vision:11b`
- **Palm Annotation Service**: Python Flask service for annotating palm images
  - Port: `5001`
  - Adds colored lines to palm images highlighting features

### Architecture Flow
```
Frontend (port 5173)
    ↓
Backend API (port 3001)
    ↓
Proxy (port 11434)
    ↓
Ollama (port 11433) + Palm Annotator (port 5001)
```

**CRITICAL**: Frontend should NEVER directly connect to Ollama/Proxy. All AI requests must go through the Backend API.

## Testing Structure

```
mystic-vibes-testing/
├── README.md (this file - overview and architecture)
├── TESTING_CHECKLIST.md (progress tracking with implementation order)
├── INTEGRATION_SECURITY_PERFORMANCE_E2E_TESTS.md (advanced test specs)
├── frontend-tests/
│   ├── README.md (11 detailed frontend test specifications)
│   ├── unit-tests/ (for implemented tests)
│   ├── component-tests/ (for implemented tests)
│   └── integration-tests/ (for implemented tests)
├── backend-tests/
│   ├── README.md (12 detailed backend test specifications)
│   ├── api-tests/ (for implemented tests)
│   ├── database-tests/ (for implemented tests)
│   └── middleware-tests/ (for implemented tests)
├── ai-service-tests/
│   ├── README.md (7 detailed AI service test specifications)
│   ├── ollama-tests/ (for implemented tests)
│   ├── quality-tests/ (for implemented tests)
│   └── annotation-tests/ (for implemented tests)
└── open_tickets/
    ├── README.md (ticket creation guide and examples)
    ├── ISSUES_LOG.md (quick issue tracking)
    ├── .gitkeep (ensures folder tracked in git)
    └── [TICKET-XXX.md files created as issues are found]
```

## Test Categories

### 1. Frontend Tests (11 tests)
- Unit tests for utility functions
- Component rendering and interaction tests
- Integration tests with mock APIs

### 2. Backend API Tests (12 tests)
- Endpoint testing (auth, AI, readings)
- Middleware testing (authentication, rate limiting)
- Database operation testing
- Error handling validation

### 3. AI Service Tests (7 tests)
- Ollama proxy connection and forwarding
- AI quality testing (output validation)
- Performance benchmarking
- Palm annotation service integration

### 4. Integration Tests (4 tests)
- End-to-end flow testing across all components
- Complete user journey validation

### 5. Security Tests (5 tests)
- SQL injection protection
- XSS protection
- CSRF protection
- JWT validation
- Password security

### 6. Performance Tests (4 tests)
- Load testing AI endpoints
- Database performance under load
- Image processing benchmarks
- Frontend bundle size and loading time

### 7. E2E Tests (3 tests)
- Complete user journeys with real browser automation
- Signup to first reading flow
- Reading history management

### 8. Compatibility Tests (2 tests)
- Cross-browser testing
- Mobile responsiveness

## Testing Approach: Black Box Testing

All tests in this repository are designed as **black box tests**. This means:

1. **No code inspection**: Tests should not rely on knowledge of internal implementation
2. **Input/Output validation**: Focus on what goes in and what comes out
3. **API contracts**: Test against documented endpoints and expected responses
4. **User behavior**: Simulate real user interactions
5. **Observable outcomes**: Verify results that users can see/experience

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL database
- Ollama installed locally
- Test framework: Jest/Vitest for frontend, Jest/Supertest for backend
- E2E framework: Playwright or Cypress

### Environment Setup
1. Ensure all services are running:
   - Frontend: `npm run dev` (port 5173)
   - Backend: `npm run dev` (port 3001)
   - Ollama: Running on port 11433
   - Proxy: Running on port 11434
   - Palm Annotator: Running on port 5001

2. Configure test environment variables:
   - Test database credentials
   - API base URLs
   - Test user credentials

3. Review the implementation order in `TESTING_CHECKLIST.md`

### Running Tests
1. **Start Here**: Read `TESTING_CHECKLIST.md` for implementation order
2. **Test Specs**: See individual README files in each test directory
3. **Track Progress**: Update checkboxes in `TESTING_CHECKLIST.md` as you complete tests
4. **Report Issues**: Create tickets in `open_tickets/` when tests fail (see `open_tickets/README.md` for guidelines)

### Issue Reporting Workflow

**When a test fails or you discover a bug:**

1. **Create a Ticket** in `open_tickets/` folder:
   - Individual file: `TICKET-XXX-brief-title.md` (for major issues)
   - Quick log: Add to `ISSUES_LOG.md` (for minor issues)

2. **Include in Ticket**:
   - Test ID that failed (e.g., TEST-BE-AI-003)
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Logs, screenshots, error messages
   - Priority level (Critical/High/Medium/Low)

3. **Notify Developer** (for critical issues)

4. **Wait for Fix**, then re-test and verify

5. **Close Ticket** once verified fixed

See `open_tickets/README.md` for detailed guidelines and examples.

## Test Documentation Structure

Each test specification includes:
- **Test ID**: Unique identifier
- **Test Name**: Descriptive name
- **Category**: Frontend/Backend/AI/Integration/etc.
- **Priority**: Critical/High/Medium/Low
- **Preconditions**: What must be true before test runs
- **Test Steps**: Step-by-step instructions (black box)
- **Expected Results**: What should happen
- **Actual Results**: What actually happened (filled during test execution)
- **Status**: Pass/Fail/Blocked/Skip
- **Notes**: Additional observations

## Contributing
When adding new tests:
1. Follow the black box testing approach
2. Document all preconditions clearly
3. Provide step-by-step instructions
4. Define expected results precisely
5. Include edge cases and error scenarios

## Test Execution Tracking
Use the TODO lists in each section to track test implementation progress.

---

**Last Updated**: October 22, 2025
**Testing Framework**: Jest + Supertest + Playwright (E2E)
**Target Coverage**: 80%+ for critical paths
