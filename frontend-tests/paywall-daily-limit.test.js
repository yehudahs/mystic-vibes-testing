/**
 * TEST-FE-PAYWALL-001: DailyLimitNotice + CSS stacking context fix
 *
 * Verifies fixes from the paywall overhaul:
 *   1. DailyLimitNotice has modal (delayed popup) + sticky bottom bar
 *   2. Layout.tsx lost its `z-10` on the footer wrapper — that wrapper was
 *      creating a stacking context that blocked clicks on the sticky bar
 *   3. PostHog events wired up: reading_limit_reached, upgrade_cta_clicked,
 *      paywall_modal_dismissed, paywall_bar_dismissed
 *   4. tailwind.config.ts has the slide-up animation
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE = '/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src';
const DAILY_LIMIT = resolve(`${BASE}/components/DailyLimitNotice.tsx`);
const LAYOUT = resolve(`${BASE}/components/layout/Layout.tsx`);
const TAILWIND = resolve('/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/tailwind.config.ts');

describe('TEST-FE-PAYWALL-001: Paywall DailyLimitNotice', () => {

  test('Case 1: DailyLimitNotice component exists', () => {
    expect(existsSync(DAILY_LIMIT)).toBe(true);
  });

  test('Case 2: sticky bottom bar is rendered', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    // sticky bar must be fixed/sticky at the bottom
    expect(src).toMatch(/fixed.*bottom|sticky.*bottom|bottom-0/);
    console.log('✅ Sticky bottom bar found in DailyLimitNotice');
  });

  test('Case 3: modal overlay is rendered via Dialog component (delayed popup)', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    // modal uses shadcn Dialog (which provides the overlay internally)
    expect(src).toMatch(/<Dialog\b/);
    expect(src).toMatch(/<DialogContent\b/);
    console.log('✅ Modal overlay found (Dialog/DialogContent in DailyLimitNotice)');
  });

  test('Case 4: modal is shown after a delay (setTimeout or similar)', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    expect(src).toContain('setTimeout');
    console.log('✅ Modal appearance is delayed (not instant)');
  });

  test('Case 5: reading_limit_reached event tracked', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    expect(src).toContain('reading_limit_reached');
    console.log('✅ reading_limit_reached PostHog event present');
  });

  test('Case 6: upgrade_cta_clicked event tracked', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    expect(src).toContain('upgrade_cta_clicked');
    console.log('✅ upgrade_cta_clicked PostHog event present');
  });

  test('Case 7: paywall_modal_dismissed event tracked', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    expect(src).toContain('paywall_modal_dismissed');
    console.log('✅ paywall_modal_dismissed PostHog event present');
  });

  test('Case 8: paywall_bar_dismissed event tracked', () => {
    const src = readFileSync(DAILY_LIMIT, 'utf-8');
    expect(src).toContain('paywall_bar_dismissed');
    console.log('✅ paywall_bar_dismissed PostHog event present');
  });

  test('Case 9: Layout.tsx has no <div z-10> wrapper directly around Footer', () => {
    const src = readFileSync(LAYOUT, 'utf-8');
    // The bug: <div className="... z-10 ..."><Footer /></div> created a stacking
    // context that blocked clicks on the sticky bar
    // Fix: Footer rendered directly without a dedicated div wrapper
    const lines = src.split('\n');
    const footerLineIdx = lines.findIndex(l => l.includes('<Footer'));
    expect(footerLineIdx).toBeGreaterThan(-1);

    // Check the line immediately before Footer — must not be a <div opening with z-10
    const lineBefore = lines[footerLineIdx - 1] || '';
    expect(lineBefore).not.toMatch(/<div[^>]*z-10/);
    // Also check Footer itself isn't on the same line as a z-10 div opener
    const footerLine = lines[footerLineIdx];
    expect(footerLine).not.toMatch(/<div[^>]*z-10/);
    console.log('✅ No z-10 div wrapper immediately around <Footer />');
  });

  test('Case 10: tailwind.config.ts has slide-up animation', () => {
    const src = readFileSync(TAILWIND, 'utf-8');
    expect(src).toContain('slide-up');
    console.log('✅ slide-up animation defined in tailwind.config.ts');
  });
});
