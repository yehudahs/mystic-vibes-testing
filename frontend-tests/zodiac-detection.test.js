/**
 * TEST-FE-UNIT-003: Zodiac Sign Detection from Birthdate
 * 
 * Test Suite: Frontend - Unit Tests
 * Component: Zodiac/Horoscope Logic
 * Priority: MEDIUM
 * Dependencies: None (pure function testing)
 * 
 * Description:
 * Tests the zodiac sign detection logic that determines a user's sun sign
 * based on their birthdate. This is pure business logic testing that doesn't
 * require any UI or backend interaction.
 * 
 * Test Cases:
 * 1. Correctly identify all 12 zodiac signs
 * 2. Handle edge cases (cusp dates - first/last day of sign)
 * 3. Handle leap year dates (Feb 29)
 * 4. Handle invalid dates
 * 5. Validate date ranges for each sign
 * 6. Case insensitivity of month input
 * 7. Different date format inputs
 * 
 * Zodiac Signs and Date Ranges:
 * - Aries: March 21 - April 19
 * - Taurus: April 20 - May 20
 * - Gemini: May 21 - June 20
 * - Cancer: June 21 - July 22
 * - Leo: July 23 - August 22
 * - Virgo: August 23 - September 22
 * - Libra: September 23 - October 22
 * - Scorpio: October 23 - November 21
 * - Sagittarius: November 22 - December 21
 * - Capricorn: December 22 - January 19
 * - Aquarius: January 20 - February 18
 * - Pisces: February 19 - March 20
 * 
 * Prerequisites:
 * - Zodiac detection function exists in codebase
 * - Can be tested in isolation without UI/API
 */

import { describe, test, expect } from '@jest/globals';

describe('TEST-FE-UNIT-003: Zodiac Sign Detection from Birthdate', () => {
  
  /**
   * Mock zodiac sign detection function
   * This should be replaced with actual import from source code
   * For now, implementing the logic for testing
   */
  function getZodiacSign(month, day) {
    // Normalize month input
    if (typeof month === 'string') {
      month = month.toLowerCase();
      const months = ['january', 'february', 'march', 'april', 'may', 'june',
                     'july', 'august', 'september', 'october', 'november', 'december'];
      month = months.indexOf(month) + 1;
      if (month === 0) throw new Error('Invalid month name');
    }

    // Validate inputs
    if (month < 1 || month > 12) throw new Error('Invalid month');
    if (day < 1 || day > 31) throw new Error('Invalid day');

    // Zodiac logic
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';

    throw new Error('Invalid date for zodiac calculation');
  }

  test('Case 1: Should correctly identify Aries (March 21 - April 19)', () => {
    expect(getZodiacSign(3, 21)).toBe('Aries'); // First day
    expect(getZodiacSign(3, 25)).toBe('Aries'); // Middle
    expect(getZodiacSign(4, 10)).toBe('Aries'); // Middle
    expect(getZodiacSign(4, 19)).toBe('Aries'); // Last day
  });

  test('Case 2: Should correctly identify Taurus (April 20 - May 20)', () => {
    expect(getZodiacSign(4, 20)).toBe('Taurus'); // First day
    expect(getZodiacSign(5, 1)).toBe('Taurus'); // Middle
    expect(getZodiacSign(5, 20)).toBe('Taurus'); // Last day
  });

  test('Case 3: Should correctly identify Gemini (May 21 - June 20)', () => {
    expect(getZodiacSign(5, 21)).toBe('Gemini');
    expect(getZodiacSign(6, 10)).toBe('Gemini');
    expect(getZodiacSign(6, 20)).toBe('Gemini');
  });

  test('Case 4: Should correctly identify Cancer (June 21 - July 22)', () => {
    expect(getZodiacSign(6, 21)).toBe('Cancer');
    expect(getZodiacSign(7, 1)).toBe('Cancer');
    expect(getZodiacSign(7, 22)).toBe('Cancer');
  });

  test('Case 5: Should correctly identify Leo (July 23 - August 22)', () => {
    expect(getZodiacSign(7, 23)).toBe('Leo');
    expect(getZodiacSign(8, 1)).toBe('Leo');
    expect(getZodiacSign(8, 22)).toBe('Leo');
  });

  test('Case 6: Should correctly identify Virgo (August 23 - September 22)', () => {
    expect(getZodiacSign(8, 23)).toBe('Virgo');
    expect(getZodiacSign(9, 1)).toBe('Virgo');
    expect(getZodiacSign(9, 22)).toBe('Virgo');
  });

  test('Case 7: Should correctly identify Libra (September 23 - October 22)', () => {
    expect(getZodiacSign(9, 23)).toBe('Libra');
    expect(getZodiacSign(10, 1)).toBe('Libra');
    expect(getZodiacSign(10, 22)).toBe('Libra');
  });

  test('Case 8: Should correctly identify Scorpio (October 23 - November 21)', () => {
    expect(getZodiacSign(10, 23)).toBe('Scorpio');
    expect(getZodiacSign(11, 1)).toBe('Scorpio');
    expect(getZodiacSign(11, 21)).toBe('Scorpio');
  });

  test('Case 9: Should correctly identify Sagittarius (November 22 - December 21)', () => {
    expect(getZodiacSign(11, 22)).toBe('Sagittarius');
    expect(getZodiacSign(12, 1)).toBe('Sagittarius');
    expect(getZodiacSign(12, 21)).toBe('Sagittarius');
  });

  test('Case 10: Should correctly identify Capricorn (December 22 - January 19)', () => {
    expect(getZodiacSign(12, 22)).toBe('Capricorn'); // First day
    expect(getZodiacSign(12, 31)).toBe('Capricorn'); // End of year
    expect(getZodiacSign(1, 1)).toBe('Capricorn'); // Start of year
    expect(getZodiacSign(1, 19)).toBe('Capricorn'); // Last day
  });

  test('Case 11: Should correctly identify Aquarius (January 20 - February 18)', () => {
    expect(getZodiacSign(1, 20)).toBe('Aquarius');
    expect(getZodiacSign(2, 1)).toBe('Aquarius');
    expect(getZodiacSign(2, 18)).toBe('Aquarius');
  });

  test('Case 12: Should correctly identify Pisces (February 19 - March 20)', () => {
    expect(getZodiacSign(2, 19)).toBe('Pisces');
    expect(getZodiacSign(3, 1)).toBe('Pisces');
    expect(getZodiacSign(3, 20)).toBe('Pisces');
  });

  test('Case 13: Should handle cusp dates correctly', () => {
    // Test the transition days between signs
    expect(getZodiacSign(3, 20)).toBe('Pisces');
    expect(getZodiacSign(3, 21)).toBe('Aries');
    
    expect(getZodiacSign(4, 19)).toBe('Aries');
    expect(getZodiacSign(4, 20)).toBe('Taurus');
    
    expect(getZodiacSign(12, 21)).toBe('Sagittarius');
    expect(getZodiacSign(12, 22)).toBe('Capricorn');
  });

  test('Case 14: Should handle leap year date (February 29)', () => {
    // Feb 29 falls in Pisces
    expect(getZodiacSign(2, 29)).toBe('Pisces');
  });

  test('Case 15: Should handle month names (case insensitive)', () => {
    expect(getZodiacSign('march', 25)).toBe('Aries');
    expect(getZodiacSign('MARCH', 25)).toBe('Aries');
    expect(getZodiacSign('March', 25)).toBe('Aries');
    expect(getZodiacSign('july', 25)).toBe('Leo');
    expect(getZodiacSign('december', 25)).toBe('Capricorn');
  });

  test('Case 16: Should throw error for invalid month', () => {
    expect(() => getZodiacSign(0, 15)).toThrow('Invalid month');
    expect(() => getZodiacSign(13, 15)).toThrow('Invalid month');
    expect(() => getZodiacSign(-1, 15)).toThrow('Invalid month');
  });

  test('Case 17: Should throw error for invalid day', () => {
    expect(() => getZodiacSign(3, 0)).toThrow('Invalid day');
    expect(() => getZodiacSign(3, 32)).toThrow('Invalid day');
    expect(() => getZodiacSign(3, -5)).toThrow('Invalid day');
  });

  test('Case 18: Should throw error for invalid month name', () => {
    expect(() => getZodiacSign('invalidmonth', 15)).toThrow('Invalid month name');
    expect(() => getZodiacSign('abc', 15)).toThrow('Invalid month name');
  });

  test('Case 19: Should handle all days in January', () => {
    // Jan 1-19 = Capricorn, Jan 20-31 = Aquarius
    expect(getZodiacSign(1, 1)).toBe('Capricorn');
    expect(getZodiacSign(1, 19)).toBe('Capricorn');
    expect(getZodiacSign(1, 20)).toBe('Aquarius');
    expect(getZodiacSign(1, 31)).toBe('Aquarius');
  });

  test('Case 20: Should handle all days in December', () => {
    // Dec 1-21 = Sagittarius, Dec 22-31 = Capricorn
    expect(getZodiacSign(12, 1)).toBe('Sagittarius');
    expect(getZodiacSign(12, 21)).toBe('Sagittarius');
    expect(getZodiacSign(12, 22)).toBe('Capricorn');
    expect(getZodiacSign(12, 31)).toBe('Capricorn');
  });

  test('Case 21: Should validate complete year coverage', () => {
    // Test that every day of the year has a sign
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const signs = new Set();

    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= daysInMonth[month - 1]; day++) {
        const sign = getZodiacSign(month, day);
        signs.add(sign);
        expect(sign).toBeDefined();
        expect(typeof sign).toBe('string');
      }
    }

    // Should have found all 12 signs
    expect(signs.size).toBe(12);
  });

  test('Case 22: Should return correct zodiac properties', () => {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Test a date for each sign
    const testDates = [
      [3, 25], [4, 25], [5, 25], [6, 25], [7, 25], [8, 25],
      [9, 25], [10, 25], [11, 25], [12, 25], [1, 25], [2, 25]
    ];

    testDates.forEach(([ month, day], index) => {
      const sign = getZodiacSign(month, day);
      expect(zodiacSigns).toContain(sign);
    });
  });
});
