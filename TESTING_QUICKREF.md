# 🎯 Quick Reference: Running Tests

## Most Common Commands

```bash
# Run all tests (regression check)
npm run test:all

# Run tests before commit (critical tests only)
npm run test:critical

# Run specific category
npm run test:backend
npm run test:frontend
npm run test:security
npm run test:ai

# Watch mode (development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Git Hooks

Pre-commit hook is **ACTIVE** - tests run automatically on every commit!

To skip (emergency only):
```bash
git commit --no-verify -m "Message"
```

## CI/CD

GitHub Actions runs automatically on:
- Push to `develop`/`main`
- Pull requests
- Manual trigger

View results: https://github.com/yehudahs/mystic-vibes-testing/actions

## Test Statistics

- **Total**: 48 test suites, 700+ tests
- **Pass Rate**: 90%+
- **Categories**: Security, Backend, Frontend, AI, Integration, E2E, Performance, Compatibility

## Need Help?

See detailed guide: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
