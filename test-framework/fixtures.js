/**
 * Test Data Fixtures
 * Provides sample data for testing
 */

export const TAROT_CARDS = {
  MAJOR_ARCANA: [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ],
  
  /**
   * Generate sample tarot cards for testing
   */
  generateSampleCards(count = 3) {
    const positions = ['Past', 'Present', 'Future', 'Challenge', 'Advice', 'Outcome'];
    const cards = [];
    
    for (let i = 0; i < count; i++) {
      cards.push({
        name: this.MAJOR_ARCANA[i % this.MAJOR_ARCANA.length],
        position: positions[i % positions.length],
        isReversed: Math.random() > 0.5,
      });
    }
    
    return cards;
  }
};

export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export const HOROSCOPE_TYPES = ['daily', 'weekly', 'monthly'];

export const SAMPLE_QUESTIONS = {
  TAROT: [
    'What does my career path hold?',
    'How can I improve my relationships?',
    'What should I focus on this month?',
    'What are my hidden talents?',
  ],
  PALM: [
    'What does my love line reveal?',
    'Tell me about my career prospects',
    'What is my life path?',
  ],
  GENERAL: [
    'What guidance do the cards have for me?',
    'What do I need to know right now?',
  ],
};

export const SAMPLE_IMAGES = {
  /**
   * Generate a tiny base64 test image (1x1 transparent PNG)
   */
  TINY_PNG: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  
  /**
   * Base64 of a small test palm image (you can replace this with actual test image)
   */
  PALM_SAMPLE: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCZABmX/9k=',
};

export const TEST_USER_TEMPLATES = {
  VALID: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'SecurePass123!',
  },
  
  WEAK_PASSWORD: {
    name: 'Weak User',
    email: 'weakuser@example.com',
    password: '123',
  },
  
  INVALID_EMAIL: {
    name: 'Invalid Email User',
    email: 'not-an-email',
    password: 'SecurePass123!',
  },
  
  MISSING_FIELDS: {
    email: 'incomplete@example.com',
    // missing name and password
  },
};

export const NUMEROLOGY_TEST_CASES = [
  {
    name: 'John Smith',
    birthdate: '1990-05-15',
    expected: {
      lifePathNumber: 3,
      destinyNumber: 8,
    },
  },
  {
    name: 'Jane Doe',
    birthdate: '1985-11-22',
    expected: {
      lifePathNumber: 11, // master number
    },
  },
];

export const ZODIAC_TEST_CASES = [
  { birthdate: '1990-03-21', expected: 'aries' },
  { birthdate: '1990-04-19', expected: 'aries' },
  { birthdate: '1990-04-20', expected: 'taurus' },
  { birthdate: '1990-12-25', expected: 'capricorn' },
  { birthdate: '2000-02-29', expected: 'pisces' }, // leap year
  { birthdate: '1995-01-01', expected: 'capricorn' },
];

/**
 * Generate random test user
 */
export function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    name: `Test User ${random}`,
    email: `testuser_${timestamp}_${random}@example.com`,
    password: 'TestPassword123!',
  };
}

/**
 * Generate random email
 */
export function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test_${timestamp}_${random}@example.com`;
}

/**
 * Convert local image file to base64 (for testing)
 */
export async function imageToBase64(filePath) {
  const fs = await import('fs');
  const imageBuffer = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

export default {
  TAROT_CARDS,
  ZODIAC_SIGNS,
  HOROSCOPE_TYPES,
  SAMPLE_QUESTIONS,
  SAMPLE_IMAGES,
  TEST_USER_TEMPLATES,
  NUMEROLOGY_TEST_CASES,
  ZODIAC_TEST_CASES,
  generateTestUser,
  generateRandomEmail,
  imageToBase64,
};
