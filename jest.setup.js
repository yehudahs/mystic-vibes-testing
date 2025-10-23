/**
 * Jest Setup File
 * Runs before all tests
 */

// Add custom matchers if needed
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
    };
  },
  
  toBeValidJWT(received) {
    const pass = typeof received === 'string' && received.split('.').length === 3;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid JWT`
          : `expected ${received} to be a valid JWT (format: header.payload.signature)`,
    };
  },
});

// Global test setup
beforeAll(() => {
  console.log('\n🚀 Starting Mystic Vibes Test Suite...\n');
  console.log('Environment:', {
    API: process.env.API_BASE_URL || 'http://localhost:3001',
    Frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    Ollama: process.env.OLLAMA_PROXY_URL || 'http://localhost:11434',
  });
  console.log('\n');
});

// Global test teardown
afterAll(() => {
  console.log('\n✅ Test Suite Completed\n');
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});
