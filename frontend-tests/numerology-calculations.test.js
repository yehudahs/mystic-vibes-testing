/**
 * TEST-FE-UNIT-002: Numerology Calculation Functions
 * 
 * Test Suite: Frontend - Unit Tests
 * Component: Numerology Logic
 * Priority: MEDIUM
 * Dependencies: None (pure function testing)
 * 
 * Description:
 * Tests numerology calculation functions that reduce names and birthdates
 * to single-digit or master numbers (11, 22, 33). These are pure mathematical
 * functions that can be tested in isolation.
 * 
 * Test Cases:
 * 1. Calculate Life Path Number from birthdate
 * 2. Calculate Expression Number from full name
 * 3. Calculate Soul Urge Number from vowels
 * 4. Calculate Personality Number from consonants
 * 5. Handle master numbers (11, 22, 33) correctly
 * 6. Reduce numbers to single digit
 * 7. Letter to number conversion (A=1, B=2, etc.)
 * 8. Handle special characters and spaces
 * 9. Case insensitivity
 * 
 * Numerology Rules:
 * - Letters: A=1, B=2, C=3... Z=26
 * - Reduce by adding digits: 25 = 2+5 = 7
 * - Master numbers (11, 22, 33) are NOT reduced
 * - Life Path: Sum all birthdate digits, reduce to 1-9 or master
 * - Expression: Sum all letters in full name
 * - Soul Urge: Sum only vowels (A,E,I,O,U)
 * - Personality: Sum only consonants
 * 
 * Prerequisites:
 * - Numerology functions exist in codebase
 * - Can be tested without UI/API
 */

import { describe, test, expect } from '@jest/globals';

describe('TEST-FE-UNIT-002: Numerology Calculation Functions', () => {
  
  /**
   * Convert letter to number (A=1, B=2, ..., Z=26)
   */
  function letterToNumber(letter) {
    letter = letter.toUpperCase();
    if (letter < 'A' || letter > 'Z') return 0;
    return letter.charCodeAt(0) - 64; // A=65, so A-64=1
  }

  /**
   * Reduce number to single digit or master number
   */
  function reduceNumber(num) {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  }

  /**
   * Calculate Life Path Number from birthdate
   */
  function calculateLifePath(month, day, year) {
    // Add all digits
    const monthSum = reduceNumber(month);
    const daySum = reduceNumber(day);
    const yearSum = reduceNumber(year);
    
    // Combine and reduce
    return reduceNumber(monthSum + daySum + yearSum);
  }

  /**
   * Calculate Expression Number from full name
   */
  function calculateExpression(fullName) {
    let sum = 0;
    for (let char of fullName.toUpperCase()) {
      if (char >= 'A' && char <= 'Z') {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  }

  /**
   * Calculate Soul Urge Number (vowels only)
   */
  function calculateSoulUrge(fullName) {
    const vowels = 'AEIOU';
    let sum = 0;
    for (let char of fullName.toUpperCase()) {
      if (vowels.includes(char)) {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  }

  /**
   * Calculate Personality Number (consonants only)
   */
  function calculatePersonality(fullName) {
    const vowels = 'AEIOU';
    let sum = 0;
    for (let char of fullName.toUpperCase()) {
      if (char >= 'A' && char <= 'Z' && !vowels.includes(char)) {
        sum += letterToNumber(char);
      }
    }
    return reduceNumber(sum);
  }

  test('Case 1: Should convert letters to numbers correctly', () => {
    expect(letterToNumber('A')).toBe(1);
    expect(letterToNumber('B')).toBe(2);
    expect(letterToNumber('Z')).toBe(26);
    expect(letterToNumber('M')).toBe(13); // Middle of alphabet
    
    // Case insensitive
    expect(letterToNumber('a')).toBe(1);
    expect(letterToNumber('z')).toBe(26);
  });

  test('Case 2: Should reduce numbers to single digit', () => {
    expect(reduceNumber(10)).toBe(1); // 1+0=1
    expect(reduceNumber(25)).toBe(7); // 2+5=7
    expect(reduceNumber(38)).toBe(11); // 3+8=11 (master number!)
    expect(reduceNumber(99)).toBe(9); // 9+9=18, 1+8=9
    expect(reduceNumber(123)).toBe(6); // 1+2+3=6
  });

  test('Case 3: Should preserve master numbers 11, 22, 33', () => {
    expect(reduceNumber(11)).toBe(11); // Master number
    expect(reduceNumber(22)).toBe(22); // Master number
    expect(reduceNumber(33)).toBe(33); // Master number
    
    // But 44, 55, etc. should reduce
    expect(reduceNumber(44)).toBe(8); // 4+4=8
    expect(reduceNumber(55)).toBe(1); // 5+5=10, 1+0=1
  });

  test('Case 4: Should calculate Life Path Number correctly', () => {
    // Example: March 15, 1990
    // Month: 3 = 3
    // Day: 15 = 1+5 = 6
    // Year: 1990 = 1+9+9+0 = 19 = 1+9 = 10 = 1+0 = 1
    // Total: 3+6+1 = 10 = 1+0 = 1
    expect(calculateLifePath(3, 15, 1990)).toBe(1);
    
    // Example: November 11, 1992
    // Month: 11 (master number)
    // Day: 11 (master number)
    // Year: 1992 = 1+9+9+2 = 21 = 2+1 = 3
    // Total: 11+11+3 = 25 = 2+5 = 7
    expect(calculateLifePath(11, 11, 1992)).toBe(7);
  });

  test('Case 5: Should calculate Expression Number from name', () => {
    // "JOHN" = J(10) + O(15) + H(8) + N(14) = 47 = 4+7 = 11
    expect(calculateExpression('JOHN')).toBe(11);
    
    // "MARY" = M(13) + A(1) + R(18) + Y(25) = 57 = 5+7 = 12 = 1+2 = 3
    expect(calculateExpression('MARY')).toBe(3);
    
    // Case insensitive
    expect(calculateExpression('john')).toBe(11);
    expect(calculateExpression('John')).toBe(11);
  });

  test('Case 6: Should handle names with spaces', () => {
    // "JOHN DOE" = J(10)+O(15)+H(8)+N(14)+D(4)+O(15)+E(5) = 71 = 7+1 = 8
    expect(calculateExpression('JOHN DOE')).toBe(8);
    
    // Spaces should be ignored
    expect(calculateExpression('JOHNDOE')).toBe(8);
  });

  test('Case 7: Should calculate Soul Urge Number (vowels only)', () => {
    // "JOHN" = O(15) = 15 = 1+5 = 6
    expect(calculateSoulUrge('JOHN')).toBe(6);
    
    // "MARY" = A(1) (Y not counted as vowel in this context)
    expect(calculateSoulUrge('MARY')).toBe(1);
    
    // "ELIZABETH" = E(5)+I(9)+A(1)+E(5) = 20 = 2+0 = 2
    expect(calculateSoulUrge('ELIZABETH')).toBe(2);
  });

  test('Case 8: Should calculate Personality Number (consonants only)', () => {
    // "JOHN" = J(10)+H(8)+N(14) = 32 = 3+2 = 5
    expect(calculatePersonality('JOHN')).toBe(5);
    
    // "MARY" = M(13)+R(18)+Y(25) = 56 = 5+6 = 11 (master number!)
    expect(calculatePersonality('MARY')).toBe(11);
  });

  test('Case 9: Should verify Expression = Soul Urge + Personality', () => {
    // This is a numerology rule: Expression should equal Soul Urge + Personality (reduced)
    const name = 'JOHN DOE';
    const expression = calculateExpression(name);
    const soulUrge = calculateSoulUrge(name);
    const personality = calculatePersonality(name);
    
    expect(reduceNumber(soulUrge + personality)).toBe(expression);
  });

  test('Case 10: Should handle special characters', () => {
    // Special characters should be ignored
    expect(calculateExpression('JOHN-DOE')).toBe(8);
    expect(calculateExpression("JOHN O'CONNOR")).toBe(reduceNumber(10+15+8+14+15+3+15+14+14+15+18)); // Only letters
    expect(calculateExpression('JOHN!!!')).toBe(reduceNumber(10+15+8+14));
  });

  test('Case 11: Should calculate Life Path for specific dates', () => {
    // January 1, 2000
    // 1 + 1 + 2000(2+0+0+0=2) = 1+1+2 = 4
    expect(calculateLifePath(1, 1, 2000)).toBe(4);
    
    // December 31, 1999
    // 12(1+2=3) + 31(3+1=4) + 1999(1+9+9+9=28=2+8=10=1+0=1) = 3+4+1 = 8
    expect(calculateLifePath(12, 31, 1999)).toBe(8);
  });

  test('Case 12: Should handle names resulting in master numbers', () => {
    // Create a name that sums to 11
    // Need letters that sum to 11
    // "K" = 11 (master number!)
    expect(calculateExpression('K')).toBe(11);
    
    // "AB" = 1+2 = 3
    // "AK" = 1+11 = 12 = 1+2 = 3
    expect(calculateExpression('AB')).toBe(3);
  });

  test('Case 13: Should calculate all numbers for a complete reading', () => {
    const name = 'ALICE SMITH';
    const birthMonth = 7;
    const birthDay = 15;
    const birthYear = 1985;

    const lifePath = calculateLifePath(birthMonth, birthDay, birthYear);
    const expression = calculateExpression(name);
    const soulUrge = calculateSoulUrge(name);
    const personality = calculatePersonality(name);

    // All should be valid numerology numbers (1-9, 11, 22, 33)
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(lifePath);
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(expression);
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(soulUrge);
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(personality);

    console.log(`
      Numerology Reading for ${name} (${birthMonth}/${birthDay}/${birthYear}):
      Life Path: ${lifePath}
      Expression: ${expression}
      Soul Urge: ${soulUrge}
      Personality: ${personality}
    `);
  });

  test('Case 14: Should handle empty or invalid inputs', () => {
    expect(calculateExpression('')).toBe(0);
    expect(calculateSoulUrge('')).toBe(0);
    expect(calculatePersonality('')).toBe(0);
  });

  test('Case 15: Should handle very large numbers', () => {
    // Birth year 9999
    expect(calculateLifePath(12, 31, 9999)).toBeDefined();
    expect(calculateLifePath(12, 31, 9999)).toBeGreaterThanOrEqual(1);
    expect(calculateLifePath(12, 31, 9999)).toBeLessThanOrEqual(33);
  });

  test('Case 16: Should verify alphabet coverage', () => {
    // Test that all letters are handled
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = calculateExpression(alphabet);
    
    // Sum of 1-26 = 351 = 3+5+1 = 9
    expect(result).toBe(9);
  });

  test('Case 17: Should handle Y as consonant in numerology', () => {
    // In numerology, Y is typically treated as a consonant
    // "MARY" = consonants M,R,Y
    const personality = calculatePersonality('MARY');
    
    // M(13) + R(18) + Y(25) = 56 = 5+6 = 11
    expect(personality).toBe(11);
  });
});
