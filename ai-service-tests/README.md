# AI Service Test Specifications

## Overview
This document contains detailed black-box test specifications for the Mystic Vibes AI services, including Ollama proxy, model quality testing, and palm annotation service.

**Services**:
- Ollama: `http://localhost:11433`
- Proxy: `http://localhost:11434`
- Palm Annotator: `http://localhost:5001`

---

## Ollama Proxy Tests

### TEST-AI-PROXY-001: Ollama Proxy Connection and Forwarding

**Priority**: Critical
**Category**: Infrastructure Test
**Component**: Node.js Proxy Service

**Description**: Verify that the proxy correctly forwards requests from port 11434 to Ollama on port 11433.

**Preconditions**:
- Ollama running on port 11433
- Proxy running on port 11434
- Model `llama3.2:3b` available

**Test Steps**:

**Test Case 1: Direct Ollama Connection (Baseline)**
1. Send direct request to Ollama:
   ```bash
   curl http://localhost:11433/api/tags
   ```
2. Verify response status: `200 OK`
3. Verify response contains list of available models
4. Verify `llama3.2:3b` is in the list

**Test Case 2: Proxy Forwarding**
1. Send request through proxy:
   ```bash
   curl http://localhost:11434/api/tags
   ```
2. Verify response status: `200 OK`
3. Verify response matches direct Ollama response (same model list)
4. Verify proxy logs show request forwarding

**Test Case 3: Generate Text via Proxy**
1. Send generate request through proxy:
   ```bash
   curl -X POST http://localhost:11434/api/generate \
     -H "Content-Type: application/json" \
     -d '{
       "model": "llama3.2:3b",
       "prompt": "What is 2+2?",
       "stream": false
     }'
   ```
2. Verify response status: `200 OK`
3. Verify response contains:
   - `response` field with AI-generated text
   - `model` field: "llama3.2:3b"
   - Token usage stats
4. Verify response is sensible (answers the prompt)

**Test Case 4: Vision Model via Proxy**
1. Prepare small test image (encode to base64)
2. Send vision request through proxy:
   ```bash
   curl -X POST http://localhost:11434/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "model": "llama3.2-vision:11b",
       "messages": [{
         "role": "user",
         "content": "Describe this image",
         "images": ["<base64-encoded-image>"]
       }],
       "stream": false
     }'
   ```
3. Verify response status: `200 OK`
4. Verify response contains image description
5. Verify proxy correctly forwards multimodal requests

**Test Case 5: Ollama Down, Proxy Error Handling**
1. Stop Ollama service (port 11433)
2. Send request through proxy (port 11434)
3. Verify proxy returns error (500 or 502)
4. Verify error message indicates connection failure
5. Restart Ollama

**Test Case 6: Proxy Down, Backend Handling**
1. Stop proxy service (port 11434)
2. Send request from backend to proxy
3. Verify backend returns appropriate error to client
4. Verify error message doesn't crash backend
5. Restart proxy

**Expected Results**:
- Proxy correctly forwards all request types
- Responses match direct Ollama responses
- Text generation works through proxy
- Vision model requests work through proxy
- Error handling is graceful when services unavailable
- Proxy adds no significant latency (< 50ms overhead)

---

## AI Quality Tests

### TEST-AI-QUALITY-001: Palm Reading AI Quality (llama3.2-vision:11b)

**Priority**: Critical
**Category**: Quality Test
**Component**: Vision Model Output

**Description**: Verify that palm reading AI produces detailed, specific, accurate analysis of palm images.

**Preconditions**:
- Ollama running with `llama3.2-vision:11b` model
- Test palm images available (at least 3 different palms)
- Backend and proxy running

**Test Steps**:

**Test Case 1: Generic Palm Image**
1. Use clear palm image showing major lines
2. Send to `/api/ai/palm/reading` endpoint
3. Verify response received within 90 seconds
4. Analyze reading text for quality indicators:

   **MUST HAVE - Specificity**:
   - [ ] Mentions specific lines by name (heart line, head line, life line, fate line)
   - [ ] Describes line characteristics (deep/faint, curved/straight, long/short, broken/continuous)
   - [ ] Notes where lines start and end
   - [ ] Identifies visible mounts (Venus, Jupiter, Saturn, Apollo, Mercury, Luna)

   **MUST HAVE - Actual Observations**:
   - [ ] Contains phrases like "I see", "visible in the image", "your palm shows"
   - [ ] References actual visible features (not just generic interpretations)
   - [ ] Describes placement of lines accurately

   **MUST NOT HAVE - Generic Responses**:
   - [ ] Avoids pure generic interpretations without specific observations
   - [ ] Doesn't say "I cannot see the image" or similar
   - [ ] Doesn't just recite general palm reading meanings

5. Compare against known features in test image
6. Score reading quality (1-5 scale):
   - 5: Highly specific, accurate observations with detailed analysis
   - 4: Good specificity, mostly accurate
   - 3: Mix of specific and generic
   - 2: Mostly generic, few specific observations
   - 1: Completely generic or inaccurate

**Test Case 2: Palm with Clear Deep Lines**
1. Use palm image with prominent, deep lines
2. Generate reading
3. Verify AI notes the depth/prominence of lines
4. Verify interpretation matches the depth (strong lines = strong traits)

**Test Case 3: Palm with Faint Lines**
1. Use palm image with faint lines
2. Generate reading
3. Verify AI notes the faintness
4. Verify interpretation adjusted accordingly

**Test Case 4: Comparison Test (llava vs llama3.2-vision)**
1. Send same palm image to both models
2. Compare response quality:
   - llava (old): Likely more generic
   - llama3.2-vision:11b (new): Should be more specific
3. Verify upgrade resulted in quality improvement

**Test Case 5: Prompt Effectiveness**
1. Use detailed prompt (current implementation)
2. Use simple prompt: "Analyze this palm"
3. Compare outputs to verify detailed prompt produces better results

**Test Case 6: Multiple Palms Uniqueness**
1. Submit 3 different palm images
2. Generate readings for each
3. Verify readings are unique (not copy-paste)
4. Verify each addresses unique features of that specific palm

**Expected Results**:
- Readings score 4 or 5 in quality (specific and accurate)
- AI correctly identifies visible major lines
- AI provides specific observations about line characteristics
- AI doesn't hallucinate features not in the image
- Readings are unique per palm image
- llama3.2-vision:11b outperforms llava significantly
- Response time is acceptable (< 90 seconds)

**Quality Metrics**:
- Specificity Score: ≥ 80% (mentions specific features)
- Accuracy Score: ≥ 90% (doesn't misidentify features)
- Uniqueness Score: ≥ 85% (readings differ across images)
- Length: 400-600 words consistently

---

### TEST-AI-QUALITY-002: Tarot Reading AI Quality (llama3.2:3b)

**Priority**: High
**Category**: Quality Test
**Component**: Text Model Output

**Description**: Verify tarot reading AI produces coherent, relevant, insightful readings.

**Preconditions**:
- Ollama running with `llama3.2:3b` model
- Backend and proxy running

**Test Steps**:

**Test Case 1: Standard Three-Card Reading**
1. Request tarot reading with:
   - Cards: The Fool (Past), The Magician (Present), The Star (Future)
   - Question: "What does my career path hold?"
   - Spread: Three Card Spread
2. Analyze response for quality:

   **MUST HAVE**:
   - [ ] Directly addresses the question about career
   - [ ] Mentions all three cards by name
   - [ ] Discusses each position (Past, Present, Future)
   - [ ] Provides specific interpretations for each card
   - [ ] Synthesizes cards into coherent narrative
   - [ ] Offers actionable guidance
   - [ ] Uses mystical but accessible language
   - [ ] Length: 200-400 words

   **QUALITY INDICATORS**:
   - [ ] Reading feels personalized to the question
   - [ ] Card meanings are accurate (check against standard interpretations)
   - [ ] Narrative flows logically through past → present → future
   - [ ] Advice is specific, not vague platitudes
   - [ ] Tone is warm and supportive yet honest

3. Score reading (1-5):
   - 5: Excellent - all requirements met, highly insightful
   - 4: Good - meets requirements, coherent
   - 3: Adequate - somewhat generic but acceptable
   - 2: Poor - very generic or confused
   - 1: Fail - gibberish or completely off-topic

**Test Case 2: With Reversed Card**
1. Include reversed card in reading
2. Verify AI acknowledges and interprets reversal
3. Verify interpretation differs from upright meaning

**Test Case 3: Complex Spread (Celtic Cross)**
1. Request Celtic Cross reading (10 cards)
2. Verify AI handles complexity
3. Verify all positions addressed
4. Verify reading remains coherent despite length

**Test Case 4: Question Relevance**
1. Test different question types:
   - Career: "Should I change jobs?"
   - Love: "Will I find a partner this year?"
   - Personal: "How can I improve my self-confidence?"
2. Verify each reading tailored to question type
3. Verify advice is specific to the domain

**Test Case 5: Consistency Test**
1. Send same cards and question twice
2. Compare responses
3. Verify responses are similar but not identical
4. Verify interpretation consistency (same cards = same general meaning)

**Expected Results**:
- Readings score 4 or 5 consistently
- All cards mentioned and interpreted
- Questions clearly addressed
- Advice is specific and actionable
- Length requirements met (200-400 words)
- Card meanings are accurate
- Tone is appropriate (mystical, supportive)
- Context continuity works (if feature enabled)

---

### TEST-AI-QUALITY-003: Prompt Engineering Effectiveness

**Priority**: Medium
**Category**: Quality Test
**Component**: Prompt Design

**Description**: Verify that detailed, structured prompts produce significantly better outputs than simple prompts.

**Preconditions**:
- Ollama running
- Backend access to modify prompts temporarily

**Test Steps**:

**Test Case 1: Palm Reading Prompt Comparison**
1. **Simple Prompt**:
   "Analyze this palm image and provide a palm reading."

2. **Detailed Prompt** (current implementation):
   - Includes instructions to examine every detail
   - Lists specific features to look for
   - Defines output format
   - Specifies response length
   - Requests specific observations

3. Send same palm image with both prompts
4. Compare outputs:
   - Count specific observations (line mentions, characteristic descriptions)
   - Measure specificity (generic vs specific language)
   - Assess accuracy (correct features vs hallucinations)
5. Calculate improvement:
   - Specificity increase: ___%
   - Observation count increase: ___%
   - Quality score improvement: ___ points

**Test Case 2: Tarot Reading Prompt Comparison**
1. Compare simple vs detailed tarot prompts
2. Measure:
   - Question addressing (yes/no)
   - Card interpretation depth
   - Coherence of narrative
   - Actionability of advice

**Expected Results**:
- Detailed prompts produce ≥30% more specific observations
- Detailed prompts result in ≥1 point higher quality scores
- Detailed prompts reduce hallucinations
- Response format more consistent with detailed prompts

---

## Performance Tests

### TEST-AI-PERF-001: AI Response Time Benchmarks

**Priority**: High
**Category**: Performance Test
**Component**: Model Inference Speed

**Description**: Measure and verify AI response times are within acceptable limits.

**Preconditions**:
- All services running
- System not under heavy load
- Models preloaded (not cold start)

**Test Steps**:

**Benchmark 1: Text Generation (Tarot)**
1. Send 10 tarot reading requests
2. Measure response time for each
3. Calculate:
   - Average: _____ seconds
   - Min: _____ seconds
   - Max: _____ seconds
   - 95th percentile: _____ seconds

**Benchmark 2: Vision Generation (Palm)**
1. Send 10 palm reading requests (same image)
2. Measure response time for each
3. Calculate statistics

**Benchmark 3: Short Text Generation (Numerology)**
1. Send 10 numerology requests
2. Measure and calculate statistics

**Performance Targets**:
- Text generation (tarot, numerology): < 20 seconds average
- Vision generation (palm): < 90 seconds average
- Cold start penalty: < 15 seconds additional
- 95th percentile: < 120 seconds (vision), < 30 seconds (text)

**Test Case 4: Concurrent Requests**
1. Send 5 tarot requests simultaneously
2. Measure:
   - Total time for all to complete
   - Individual request times
3. Verify no crashes or timeouts
4. Verify all responses are valid

**Test Case 5: Cold Start Performance**
1. Restart Ollama (clears model from memory)
2. Send first request
3. Measure cold start time (includes model loading)
4. Send second request immediately after
5. Measure warm start time (model already loaded)
6. Verify significant difference

**Expected Results**:
- Response times meet targets
- Performance consistent across multiple requests
- Concurrent requests handled without crashes
- Cold start penalty is reasonable
- No memory leaks with repeated requests

---

## Palm Annotation Service Tests

### TEST-AI-ANNOT-001: Palm Annotation Service Integration

**Priority**: High
**Category**: Integration Test
**Component**: Python Flask Annotation Service

**Description**: Verify palm annotation service correctly processes images and adds colored lines.

**Preconditions**:
- Palm annotation service running on port 5001
- Test palm images available

**Test Steps**:

**Test Case 1: Health Check**
1. Send request: `GET http://localhost:5001/health`
2. Verify response status: `200 OK`
3. Verify response: `{"status": "healthy"}`

**Test Case 2: Annotate Palm Image**
1. Prepare request:
   ```json
   POST http://localhost:5001/annotate
   Content-Type: application/json

   {
     "image": "<base64-encoded-palm-image>",
     "analysis": "Palm reading text mentioning heart line, head line, life line..."
   }
   ```
2. Send request
3. Verify response status: `200 OK`
4. Verify response structure:
   ```json
   {
     "success": true,
     "annotated_image": "<base64-png>",
     "features_detected": ["heart_line", "head_line", "life_line"],
     "features": {
       "heart_line": {"color": [255, 0, 0], "detected": true},
       "head_line": {"color": [0, 255, 0], "detected": true},
       ...
     }
   }
   ```
5. Decode `annotated_image` base64 to image file
6. Open image and visually verify:
   - Colored lines drawn on palm
   - Lines correspond to detected features
   - Colors are distinct
   - Lines are visible but not overwhelming

**Test Case 3: Feature Detection**
1. Send analysis text mentioning: "heart line, head line, life line"
2. Verify `features_detected` array contains: ["heart_line", "head_line", "life_line"]
3. Send analysis text mentioning: "fate line, sun line"
4. Verify features array updated accordingly

**Test Case 4: Missing Image**
1. Send request without `image` field
2. Verify response status: `400 Bad Request`
3. Verify error message

**Test Case 5: Invalid Base64**
1. Send request with invalid base64 string
2. Verify graceful error handling
3. Verify response indicates error

**Test Case 6: Service Unavailable**
1. Stop annotation service
2. Backend should still generate palm reading (annotation optional)
3. Verify backend logs show annotation service error
4. Verify no crash or request failure

**Expected Results**:
- Annotation service processes images successfully
- Colored lines accurately placed on palm features
- Feature detection works from analysis text
- Errors handled gracefully
- Service failure doesn't break palm reading feature
- Processing time < 5 seconds per image

---

## AI Error Handling Tests

### TEST-AI-ERROR-001: Model Not Found Handling

**Priority**: High
**Category**: Error Handling Test
**Component**: Ollama Model Management

**Description**: Verify system handles missing models gracefully.

**Preconditions**:
- Ollama running
- Test model NOT installed: `test-nonexistent-model`

**Test Steps**:

**Test Case 1: Request with Missing Model**
1. Modify backend to use non-existent model temporarily
2. Send tarot reading request
3. Verify response status: `500 Internal Server Error`
4. Verify error message indicates model not available
5. Verify suggests pulling model
6. Restore correct model

**Test Case 2: Vision Model Missing**
1. Ensure `llama3.2-vision:11b` NOT installed
2. Send palm reading request
3. Verify appropriate error returned
4. Verify error suggests: "ollama pull llama3.2-vision:11b"

**Expected Results**:
- Missing models detected
- Clear error messages with instructions
- No crashes or hangs
- User instructed how to fix (pull model)

---

### TEST-AI-ERROR-002: Timeout Handling

**Priority**: High
**Category**: Error Handling Test
**Component**: Request Timeout Management

**Description**: Verify system handles slow/hanging AI requests appropriately.

**Preconditions**:
- Backend timeout configured (e.g., 60 seconds for palm reading)

**Test Steps**:

**Test Case 1: Vision Request Timeout**
1. Use very large image (> 5MB) that may cause timeout
2. Send palm reading request
3. If timeout occurs, verify:
   - Response status: `500` or `504 Gateway Timeout`
   - Error message indicates timeout
   - Connection doesn't hang indefinitely
   - Frontend receives error notification

**Test Case 2: Text Request Timeout**
1. Simulate slow AI response
2. Verify timeout handling after configured limit

**Expected Results**:
- Timeouts handled gracefully
- Clear error messages
- No hanging connections
- Appropriate status codes

---

**End of AI Service Test Specifications**

*See ../integration-tests.md for complete end-to-end test scenarios*
*See ../security-tests.md for security-focused test specifications*
*See ../performance-tests.md for load and performance test scenarios*
