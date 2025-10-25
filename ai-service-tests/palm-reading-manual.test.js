import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

/**
 * Manual Palm Reading Test
 *
 * This test uses a real hand image to verify palm reading functionality.
 * It helps diagnose timeout issues and API failures.
 */

describe('Palm Reading - Manual Test with Real Image', () => {
  const imagePathAbsolute = '/Users/yehudahs/work/private/mystic-vibes-testing/resources/my_hand.jpeg'
  const imagePathRelative = path.join(__dirname, 'resources', 'my_hand.jpeg')

  let imageBase64

  beforeAll(() => {
    // Try absolute path first, then relative
    let imagePath = imagePathAbsolute
    if (!fs.existsSync(imagePath)) {
      imagePath = imagePathRelative
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Hand image not found at ${imagePathAbsolute} or ${imagePathRelative}`)
    }

    // Read and convert image to base64
    const imageBuffer = fs.readFileSync(imagePath)
    imageBase64 = imageBuffer.toString('base64')

    console.log('📸 Image loaded:', {
      path: imagePath,
      size: imageBuffer.length,
      base64Length: imageBase64.length
    })
  })

  test('POST /api/ai/palm/reading - should successfully generate palm reading', async () => {
    const startTime = Date.now()

    console.log('🔮 Starting palm reading request...')
    console.log('⏰ Start time:', new Date(startTime).toISOString())

    const response = await fetch(`${API_BASE_URL}/api/ai/palm/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageBase64,
        question: 'What can you tell me about my future and life path?'
      })
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('⏱️ Response received after:', duration, 'ms')
    console.log('📊 Response status:', response.status)

    // Check if request timed out or took too long
    if (duration > 30000) {
      console.warn('⚠️ WARNING: Request took longer than 30 seconds')
    }

    const data = await response.json()

    console.log('📦 Response data:', {
      success: data.success,
      hasReading: !!data.reading,
      readingLength: data.reading?.length || 0,
      hasAnnotatedImage: !!data.annotated_image,
      featuresDetected: data.features_detected?.length || 0,
      provider: data.metadata?.provider,
      model: data.metadata?.model,
      error: data.error
    })

    // Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.reading).toBeDefined()
    expect(data.reading.length).toBeGreaterThan(0)
    expect(data.metadata).toBeDefined()
    expect(data.metadata.provider).toBe('ollama')
    expect(data.metadata.model).toContain('vision')

    // Log the reading for manual verification
    console.log('\n✨ Palm Reading Result:')
    console.log('=' .repeat(60))
    console.log(data.reading)
    console.log('=' .repeat(60))

    if (data.features_detected && data.features_detected.length > 0) {
      console.log('\n🔍 Features Detected:', data.features_detected.join(', '))
    }
  }, 90000) // 90 second timeout for this test

  test('POST /api/ai/palm/reading - should handle missing image', async () => {
    const response = await fetch(`${API_BASE_URL}/api/ai/palm/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: 'Tell me about my future'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error).toContain('Image is required')
  })

  test('POST /api/ai/palm/reading - should work without a question', async () => {
    const startTime = Date.now()

    const response = await fetch(`${API_BASE_URL}/api/ai/palm/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageBase64
      })
    })

    const duration = Date.now() - startTime
    console.log('⏱️ No-question request duration:', duration, 'ms')

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.reading).toBeDefined()
    expect(data.reading.length).toBeGreaterThan(0)
  }, 90000)
})
