/**
 * TEST-FE-STRIPE-001: StripeUnavailableBanner — copy link button fix
 *
 * Verifies that StripeUnavailableBanner.tsx uses a working "Copy Link" button
 * (navigator.clipboard.writeText) instead of dead bold text that told users
 * to "Copy the link" with no mechanism to do so.
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BANNER = resolve('/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src/components/StripeUnavailableBanner.tsx');

describe('TEST-FE-STRIPE-001: StripeUnavailableBanner Copy Link', () => {

  test('Case 1: StripeUnavailableBanner component exists', () => {
    expect(existsSync(BANNER)).toBe(true);
  });

  test('Case 2: uses navigator.clipboard.writeText to copy the URL', () => {
    const src = readFileSync(BANNER, 'utf-8');
    expect(src).toContain('navigator.clipboard.writeText');
    console.log('✅ navigator.clipboard.writeText found');
  });

  test('Case 3: copies window.location.href (the current page URL)', () => {
    const src = readFileSync(BANNER, 'utf-8');
    expect(src).toContain('window.location.href');
    console.log('✅ window.location.href used as copy target');
  });

  test('Case 4: has a clickable button element (not just dead text)', () => {
    const src = readFileSync(BANNER, 'utf-8');
    expect(src).toMatch(/<button/);
    console.log('✅ <button> element present');
  });

  test('Case 5: no dead "Copy the link" text without functionality', () => {
    const src = readFileSync(BANNER, 'utf-8');
    // The old code had bold text saying "Copy the link manually" with no onClick
    // Make sure any copy-link text is now inside or adjacent to a button
    const lines = src.split('\n');
    const copyTextLines = lines.filter(l =>
      l.toLowerCase().includes('copy') &&
      l.toLowerCase().includes('link') &&
      !l.includes('navigator.clipboard') &&
      !l.includes('onClick') &&
      !l.toLowerCase().includes('button') &&
      // allow JSX text inside button context
      l.trim().startsWith('<') === false
    );
    // Filter out lines that are clearly inside a button context (they pass by proximity)
    // The key check: no standalone <b> or <strong> "copy the link" without a button nearby
    const deadBoldText = copyTextLines.filter(l => l.match(/<(b|strong)>.*copy.*link/i));
    expect(deadBoldText.length).toBe(0);
    console.log('✅ No dead bold "copy link" text without click handler');
  });
});
