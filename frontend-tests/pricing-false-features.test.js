/**
 * TEST-FE-PRICING-002: False pricing features removed
 *
 * Verifies that PricingPage.tsx no longer advertises features that don't exist:
 *   - "Priority AI Support" (Bot icon)
 *   - "Exclusive premium readings" (BookOpen icon)
 *   - "Premium themes" (Palette icon)
 *
 * These were removed because they caused user trust issues — subscribers
 * would see features advertised on the pricing page that the app never delivered.
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PRICING_PAGE = resolve('/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src/pages/PricingPage.tsx');

describe('TEST-FE-PRICING-002: False Features Removed', () => {

  test('Case 1: PricingPage exists', () => {
    expect(existsSync(PRICING_PAGE)).toBe(true);
  });

  test('Case 2: Bot icon not imported (no Priority AI Support feature)', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).not.toMatch(/import.*\bBot\b.*from/);
    console.log('✅ Bot import removed');
  });

  test('Case 3: BookOpen icon not imported (no Exclusive Premium Readings feature)', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).not.toMatch(/import.*\bBookOpen\b.*from/);
    console.log('✅ BookOpen import removed');
  });

  test('Case 4: Palette icon not imported (no Premium Themes feature)', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).not.toMatch(/import.*\bPalette\b.*from/);
    console.log('✅ Palette import removed');
  });

  test('Case 5: "Priority AI" text not present', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).not.toContain('Priority AI');
    console.log('✅ "Priority AI" text removed');
  });

  test('Case 6: "Exclusive premium" text not present', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src.toLowerCase()).not.toContain('exclusive premium');
    console.log('✅ "Exclusive premium" text removed');
  });

  test('Case 7: "Premium themes" text not present', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src.toLowerCase()).not.toContain('premium themes');
    console.log('✅ "Premium themes" text removed');
  });
});
