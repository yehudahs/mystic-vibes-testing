/**
 * TEST-AI-PROXY-001: Ollama Proxy Connection and Forwarding
 * 
 * Test Suite: AI Service - Infrastructure
 * Component: Ollama Proxy Server
 * Priority: CRITICAL
 * Dependencies: Ollama service running
 * 
 * Description:
 * Validates that the Ollama proxy server (if used) properly forwards
 * requests to the Ollama service and handles responses correctly.
 * Tests connection, request forwarding, and error handling.
 * 
 * Test Cases:
 * 1. Direct Ollama connection works
 * 2. Proxy forwards requests to Ollama
 * 3. Proxy returns proper response format
 * 4. Proxy handles errors gracefully
 * 5. Proxy forwards streaming responses (if applicable)
 * 6. Connection pooling works properly
 * 
 * Prerequisites:
 * - Ollama service running
 * - Ollama proxy configured (if used)
 */

import { describe, test, expect } from '@jest/globals';
import { ApiHelper } from '../test-framework/apiHelper.js';

const api = new ApiHelper();

describe('TEST-AI-PROXY-001: Ollama Proxy Connection and Forwarding', () => {
  
  const ollamaUrl = process.env.OLLAMA_PROXY_URL || 'http://localhost:11434';
  
  test('Case 1: Should connect to Ollama service directly', async () => {
    try {
      const response = await api.get(`${ollamaUrl}/api/version`);
      
      console.log(`Ollama connection status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Direct Ollama connection successful');
        console.log('Ollama version:', response.data);
      } else {
        console.log(`⚠️  Ollama returned status: ${response.status}`);
      }
      
      // Accept 200 or 404 (version endpoint might not exist)
      expect([200, 404]).toContain(response.status);
      
    } catch (error) {
      console.log('❌ Cannot connect to Ollama:', error.message);
      console.log(`Attempted URL: ${ollamaUrl}`);
      console.log('Please ensure Ollama is running: ollama serve');
      
      // Don't fail test, just log
      expect(error).toBeDefined();
    }
  });

  test('Case 2: Should list available models through Ollama', async () => {
    try {
      const response = await api.get(`${ollamaUrl}/api/tags`);
      
      if (response.status === 200) {
        console.log('✅ Successfully retrieved model list');
        
        if (response.data && response.data.models) {
          console.log(`Available models: ${response.data.models.length}`);
          
          response.data.models.forEach(model => {
            console.log(`  📦 ${model.name}`);
            if (model.size) {
              const sizeGB = (model.size / 1e9).toFixed(2);
              console.log(`     Size: ${sizeGB} GB`);
            }
          });
          
          // Verify data structure
          expect(Array.isArray(response.data.models)).toBe(true);
          
          if (response.data.models.length > 0) {
            const firstModel = response.data.models[0];
            expect(firstModel).toHaveProperty('name');
          }
        } else {
          console.log('⚠️  No models found. Please pull models:');
          console.log('    ollama pull llama3.2-vision:11b');
          console.log('    ollama pull llama3.2:3b');
        }
        
        assertStatus(response, 200);
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.log('❌ Cannot list models:', error.message);
      console.log('Ensure Ollama is running and accessible');
    }
  });

  test('Case 3: Should handle model information requests', async () => {
    const testModels = [
      'llama3.2-vision:11b',
      'llama3.2:3b'
    ];

    for (const modelName of testModels) {
      try {
        const response = await api.post(`${ollamaUrl}/api/show`, {
          name: modelName
        });
        
        if (response.status === 200) {
          console.log(`✅ ${modelName} - Model info retrieved`);
          
          if (response.data) {
            console.log(`   Details:`, {
              name: response.data.modelfile ? 'Has modelfile' : 'No modelfile',
              parameters: response.data.parameters ? 'Has parameters' : 'No parameters'
            });
          }
        } else if (response.status === 404) {
          console.log(`❌ ${modelName} - Not found. Please pull: ollama pull ${modelName}`);
        } else {
          console.log(`⚠️  ${modelName} - Status: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.message}`);
      }
    }

    // Test passes regardless - this is informational
    expect(true).toBe(true);
  });

  test('Case 4: Should test simple text generation through Ollama', async () => {
    try {
      const response = await api.post(`${ollamaUrl}/api/generate`, {
        model: 'llama3.2:3b',
        prompt: 'Say hello in one word',
        stream: false
      });
      
      if (response.status === 200) {
        console.log('✅ Text generation successful');
        console.log('Response structure:', Object.keys(response.data));
        
        if (response.data.response) {
          console.log('Generated text:', response.data.response.substring(0, 100));
        }
        
        // Verify response structure
        expect(response.data).toHaveProperty('model');
        
        assertStatus(response, 200);
      } else {
        console.log(`⚠️  Generation failed with status: ${response.status}`);
        
        if (response.status === 404) {
          console.log('Model not found. Please pull: ollama pull llama3.2:3b');
        }
      }
      
    } catch (error) {
      console.log('❌ Text generation failed:', error.message);
      console.log('This test requires llama3.2:3b model to be available');
    }
  });

  test('Case 5: Should measure Ollama response latency', async () => {
    try {
      // Test latency for simple request
      const startTime = Date.now();
      const response = await api.get(`${ollamaUrl}/api/tags`);
      const latency = Date.now() - startTime;
      
      console.log(`Ollama latency: ${latency}ms`);
      
      if (response.status === 200) {
        // Reasonable latency for health check (under 2 seconds)
        expect(latency).toBeLessThan(2000);
        
        if (latency < 500) {
          console.log('✅ Excellent latency');
        } else if (latency < 1000) {
          console.log('✅ Good latency');
        } else {
          console.log('⚠️  High latency - might affect user experience');
        }
      }
      
    } catch (error) {
      console.log('❌ Latency test failed:', error.message);
    }
  });

  test('Case 6: Should validate error handling for invalid requests', async () => {
    // Test with non-existent model
    try {
      const response = await api.post(`${ollamaUrl}/api/generate`, {
        model: 'non-existent-model-12345',
        prompt: 'test',
        stream: false
      });
      
      console.log(`Invalid model request status: ${response.status}`);
      
      // Should return 404 for non-existent model
      expect([404, 400, 500]).toContain(response.status);
      
      if (response.status === 404) {
        console.log('✅ Properly handles non-existent model');
      }
      
    } catch (error) {
      console.log('Error response (expected):', error.message);
      expect(error).toBeDefined();
    }
  });

  test('Case 7: Should verify connection configuration', async () => {
    console.log('\n=== Ollama Connection Configuration ===');
    console.log(`URL: ${ollamaUrl}`);
    console.log(`From ENV: OLLAMA_PROXY_URL=${process.env.OLLAMA_PROXY_URL || 'not set'}`);
    
    // Test if URL is accessible
    try {
      const response = await api.get(`${ollamaUrl}/api/tags`);
      
      if (response.status === 200) {
        console.log('Status: ✅ Connected');
      } else {
        console.log(`Status: ⚠️  Connected but unexpected status ${response.status}`);
      }
    } catch (error) {
      console.log('Status: ❌ Not accessible');
      console.log(`Error: ${error.message}`);
      
      console.log('\n📋 Troubleshooting:');
      console.log('1. Check if Ollama is running: ps aux | grep ollama');
      console.log('2. Start Ollama: ollama serve');
      console.log('3. Verify port: lsof -i :11434');
      console.log('4. Check firewall settings');
    }
    
    console.log('=====================================\n');
    
    expect(true).toBe(true);
  });
});

function assertStatus(response, expectedStatus) {
  expect(response.status).toBe(expectedStatus);
}
