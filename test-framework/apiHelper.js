/**
 * API Test Helper
 * Provides utilities for making HTTP requests to the backend API
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 30000;

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on any status code
});

/**
 * Log request/response for debugging
 */
function logRequest(method, endpoint, data, response) {
  if (process.env.ENABLE_DEBUG_LOGS === 'true') {
    console.log(`\n[${method.toUpperCase()}] ${endpoint}`);
    if (data) console.log('Request:', JSON.stringify(data, null, 2));
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  }
}

/**
 * Make authenticated request with JWT token
 */
function makeAuthRequest(token) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    validateStatus: () => true,
  });
}

/**
 * API Helper Class
 */
export class ApiHelper {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Alias for setToken
   */
  setAuthToken(token) {
    this.setToken(token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * GET request
   */
  async get(endpoint, config = {}) {
    const client = this.token ? makeAuthRequest(this.token) : apiClient;
    const response = await client.get(endpoint, config);
    logRequest('get', endpoint, null, response);
    return response;
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, config = {}) {
    const client = this.token ? makeAuthRequest(this.token) : apiClient;
    const response = await client.post(endpoint, data, config);
    logRequest('post', endpoint, data, response);
    return response;
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, config = {}) {
    const client = this.token ? makeAuthRequest(this.token) : apiClient;
    const response = await client.put(endpoint, data, config);
    logRequest('put', endpoint, data, response);
    return response;
  }

  /**
   * DELETE request
   */
  async delete(endpoint, config = {}) {
    const client = this.token ? makeAuthRequest(this.token) : apiClient;
    const response = await client.delete(endpoint, config);
    logRequest('delete', endpoint, null, response);
    return response;
  }

  /**
   * Auth Helper: Register user
   * Accepts either (name, email, password) or ({name, email, password})
   */
  async register(nameOrUser, email, password) {
    // Handle both parameter styles
    if (typeof nameOrUser === 'object') {
      return this.post('/api/auth/register', nameOrUser);
    } else {
      return this.post('/api/auth/register', { name: nameOrUser, email, password });
    }
  }

  /**
   * Auth Helper: Login user
   * Accepts either (email, password) or ({email, password})
   */
  async login(emailOrCreds, password) {
    // Handle both parameter styles
    let credentials;
    if (typeof emailOrCreds === 'object') {
      credentials = emailOrCreds;
    } else {
      credentials = { email: emailOrCreds, password };
    }
    
    const response = await this.post('/api/auth/login', credentials);
    if (response.status === 200 && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  /**
   * Auth Helper: Get current user
   */
  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  /**
   * Auth Helper: Logout
   */
  async logout() {
    const response = await this.post('/api/auth/logout');
    this.clearToken();
    return response;
  }

  /**
   * AI Helper: Generate tarot reading
   */
  async generateTarotReading(cards, question, spread) {
    return this.post('/api/ai/tarot/reading', { cards, question, spread });
  }

  /**
   * AI Helper: Generate horoscope
   */
  async generateHoroscope(sign, type) {
    return this.post('/api/ai/horoscope/generate', { sign, type });
  }

  /**
   * AI Helper: Generate palm reading
   */
  async generatePalmReading(image, question = null) {
    return this.post('/api/ai/palm/reading', { image, question });
  }

  /**
   * AI Helper: Check AI health
   */
  async checkAiHealth() {
    return this.get('/api/ai/health');
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.get('/health');
  }
}

/**
 * Create a new API helper instance
 */
export function createApiHelper() {
  return new ApiHelper();
}

/**
 * Generate random test user credentials
 */
export function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    name: `Test User ${random}`,
    email: `testuser${timestamp}${random}@example.com`,
    password: 'TestPassword123!',
  };
}

/**
 * Wait for specified milliseconds
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function n times with delay
 */
export async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await wait(delay);
    }
  }
}

export default ApiHelper;
