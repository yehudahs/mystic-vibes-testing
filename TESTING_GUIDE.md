# 🧪 Testing & Regression Prevention Guide

## Overview

This repository uses automated testing with Git hooks and CI/CD to prevent regression. Every commit is validated before it reaches the repository.

---

## 🚀 Quick Start

### Run All Tests (Regression Check)
```bash
npm run test:all
```

### Run Tests Before Committing
```bash
npm run test:critical
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

---

## 📋 Available Test Commands

### Full Test Suites
| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run test:all` | Run ALL 48 test suites | Before pushing, weekly regression check |
| `npm run test:all:verbose` | All tests with detailed output | Debugging test failures |
| `npm run test:regression` | All tests, stop on first failure | Quick regression detection |
| `npm run test:critical` | Security, auth, integration only | Fast pre-commit check |
| `npm run test:coverage` | All tests + coverage report | Before releases, sprint reviews |

### Category-Specific Tests
| Command | Description | Suites | Tests |
|---------|-------------|--------|-------|
| `npm run test:security` | Security vulnerabilities | 5 | ~60 |
| `npm run test:backend` | Backend API tests | 12 | ~170 |
| `npm run test:frontend` | Frontend components | 11 | ~150 |
| `npm run test:ai` | AI service integration | 7 | ~80 |
| `npm run test:integration` | End-to-end integration | 4 | ~45 |
| `npm run test:e2e` | User journey tests | 3 | ~32 |
| `npm run test:performance` | Performance benchmarks | 4 | ~43 |
| `npm run test:compatibility` | Browser/mobile compat | 2 | ~52 |

### Development Workflow
```bash
# Watch mode - re-runs tests on file changes
npm run test:watch

# Generate HTML report
npm run report

# Coverage + HTML report
npm run report:coverage
```

---

## 🎯 Git Hooks (Automatic)

### Pre-Commit Hook
**Automatically runs before every commit**

**What it does:**
- Detects which files changed
- Runs relevant test suites
- Blocks commit if tests fail
- Fast (~30 seconds for typical commits)

**Example:**
```bash
git add .
git commit -m "Add new feature"
# 🧪 Runs tests automatically
# ✅ Commit allowed if tests pass
# ❌ Commit blocked if tests fail
```

**Skip hook (NOT RECOMMENDED):**
```bash
git commit --no-verify -m "Skip tests (emergency only)"
```

### Pre-Push Hook (Coming Soon)
Will run full test suite before pushing to remote.

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Automatic Triggers
- **Push to `develop`/`main`** → Full test suite
- **Pull Request** → Full test suite
- **Manual** → Can trigger via GitHub UI

### What Runs in CI
1. ✅ **Install dependencies** (`npm ci`)
2. ✅ **Security tests** (critical)
3. ✅ **Authentication tests** (critical)
4. ✅ **Integration tests** (important)
5. ✅ **Backend tests** (all endpoints)
6. ✅ **Frontend tests** (components)
7. ✅ **AI service tests** (model integration)
8. ✅ **Performance tests** (benchmarks)
9. ✅ **E2E tests** (user journeys)
10. ✅ **Compatibility tests** (browsers)
11. 📊 **Coverage report** (generated)
12. 📈 **Upload to Codecov** (optional)
13. 📄 **Test report artifacts** (saved)

### View CI Results
- GitHub Actions tab: https://github.com/yehudahs/mystic-vibes-testing/actions
- Click on workflow run to see detailed results
- Download test reports from artifacts

---

## 🛡️ Regression Prevention Strategy

### 1. Local Development (Fast Feedback)
```bash
# While developing
npm run test:watch

# Before committing (automatic via hook)
git commit  # Pre-commit hook runs critical tests
```

### 2. Before Pushing (Comprehensive)
```bash
# Run full suite locally
npm run test:all

# If all pass, push
git push origin develop
```

### 3. CI/CD Validation (Safety Net)
- GitHub Actions runs all tests on push
- Pull requests blocked if tests fail
- Team gets notifications of failures

### 4. Weekly Regression Checks
```bash
# Run once per week
npm run test:regression

# Generate coverage report
npm run test:coverage
```

---

## 📊 Test Statistics

### Current Status
- **Total Suites**: 48/48 (100% complete)
- **Total Tests**: ~700+ test cases
- **Pass Rate**: 90%+ maintained
- **Coverage**: Full API, Frontend, Security coverage

### By Category
| Category | Suites | Status |
|----------|--------|--------|
| Security | 5/5 | ✅ 100% |
| Backend | 12/12 | ✅ 100% |
| Frontend | 10/11 | 🟡 91% |
| AI Service | 7/7 | ✅ 100% |
| Integration | 4/4 | ✅ 100% |
| Performance | 4/4 | ✅ 100% |
| E2E | 3/3 | ✅ 100% |
| Compatibility | 2/2 | ✅ 100% |

---

## 🐛 Debugging Test Failures

### 1. Identify Failing Test
```bash
# Run with verbose output
npm run test:all:verbose

# Or run specific category
npm run test:backend
```

### 2. Run Single Test File
```bash
npm test -- backend-tests/auth-endpoints.test.js
```

### 3. Check Test Output
- Look for error messages
- Check console logs
- Verify API endpoints are running

### 4. Common Issues

**Backend API not running:**
```bash
# Start backend server
cd /path/to/mystic-vibes-api
npm start
```

**Frontend server not running:**
```bash
# Start frontend server
cd /path/to/mystic-vibes-frontend
npm run dev
```

**Ollama not running:**
```bash
# Start Ollama
ollama serve
```

**Database connection:**
```bash
# Check database is running
# Verify connection string in .env
```

---

## 🔧 Customizing Git Hooks

### Use Full Pre-Commit Hook (Slower, More Thorough)
```bash
# Current hook is at:
.git/hooks/pre-commit

# It runs all test suites (~2-3 minutes)
```

### Use Quick Pre-Commit Hook (Faster)
```bash
# Copy quick version
cp .git/hooks/pre-commit-quick .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Only runs tests for changed files (~30 seconds)
```

### Disable Pre-Commit Hook
```bash
# Rename hook (don't delete)
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable later
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

---

## 📈 Continuous Improvement

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing test patterns
3. Run test to verify: `npm test -- path/to/new-test.test.js`
4. Commit - pre-commit hook will validate
5. Tests automatically run in CI/CD

### Updating Existing Tests
1. Modify test file
2. Run specific test: `npm test -- path/to/test.test.js`
3. Verify changes don't break other tests: `npm run test:all`
4. Commit - hook validates no regression

### Performance Optimization
- Keep tests fast (<30s per suite)
- Use mocks for external services
- Parallel test execution (Jest default)
- Skip slow tests during development: `.skip()`

---

## 🎯 Best Practices

### ✅ Do
- Run `npm run test:all` before pushing
- Fix failing tests immediately
- Add tests for new features
- Keep tests maintainable and readable
- Use descriptive test names
- Mock external dependencies

### ❌ Don't
- Skip pre-commit hook regularly
- Commit failing tests
- Ignore flaky tests (fix them!)
- Write tests that depend on each other
- Hardcode sensitive data in tests
- Push without running tests locally

---

## 📞 Getting Help

### Test Failures
1. Check test output for error message
2. Run specific test: `npm test -- path/to/test.test.js`
3. Verify services are running (backend, frontend, Ollama)
4. Check GitHub issues for known problems

### Hook Issues
1. Verify hook is executable: `ls -la .git/hooks/pre-commit`
2. Make executable: `chmod +x .git/hooks/pre-commit`
3. Test hook manually: `.git/hooks/pre-commit`

### CI/CD Issues
1. Check GitHub Actions logs
2. Verify workflow file: `.github/workflows/test-suite.yml`
3. Check if secret environment variables are set

---

## 📚 Resources

- **Test Reports**: `test-results/test-report.html`
- **Coverage Reports**: `coverage/lcov-report/index.html`
- **GitHub Actions**: https://github.com/yehudahs/mystic-vibes-testing/actions
- **Issue Tracker**: https://github.com/yehudahs/mystic-vibes-testing/issues

---

## 🎉 Success!

You now have:
- ✅ Automated pre-commit testing
- ✅ Full CI/CD pipeline
- ✅ Regression prevention
- ✅ 700+ tests across all categories
- ✅ Comprehensive coverage

**No more "it worked on my machine" bugs!** 🚀
