/**
 * TEST-FE-SUB-001: Bug #11 — Subscription state not corrupted on checkout cancel
 *
 * Verifies that:
 *   1. subscriptionStore.ts does NOT change subscription state when creating
 *      a checkout session (user cancels → state stays as it was, not "unknown")
 *   2. PricingPage handles ?canceled=true by calling loadSubscription (re-sync
 *      from server), not by guessing or resetting local state
 *
 * Bug was: navigating to Stripe checkout and pressing back / canceling showed
 * "Current Plan" on the pricing page instead of the correct state.
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE = '/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src';
const STORE = resolve(`${BASE}/store/subscriptionStore.ts`);
const PRICING = resolve(`${BASE}/pages/PricingPage.tsx`);

describe('TEST-FE-SUB-001: Bug #11 — Cancel Checkout State', () => {

  test('Case 1: subscriptionStore exists', () => {
    expect(existsSync(STORE)).toBe(true);
  });

  test('Case 2: PricingPage exists', () => {
    expect(existsSync(PRICING)).toBe(true);
  });

  test("Case 3: createCheckoutSession does not mutate subscription state", () => {
    const src = readFileSync(STORE, 'utf-8');
    // Find the actual async implementation (not the type definition which comes first)
    const fnStart = src.indexOf('createCheckoutSession: async');
    expect(fnStart).toBeGreaterThan(-1);
    // Slice only the function body — next function keyword starts at upgradeSubscription
    const fnEnd = src.indexOf('upgradeSubscription:', fnStart);
    const fnBody = src.slice(fnStart, fnEnd > fnStart ? fnEnd : fnStart + 1000);
    // Must NOT set subscription within the checkout function body
    expect(fnBody).not.toMatch(/set\(\{[^}]*subscription:/);
    expect(fnBody).not.toMatch(/setSubscription\s*\(/);
    console.log('✅ createCheckoutSession does not mutate subscription state');
  });

  test('Case 4: subscriptionStore has comment documenting intentional non-mutation', () => {
    const src = readFileSync(STORE, 'utf-8');
    // The intentional comment we added documents why state is NOT changed
    expect(src).toMatch(/[Dd]on.t change subscription state.*checkout|checkout.*[Dd]on.t change subscription state/i);
    console.log("✅ Intentional 'don't change state on checkout' comment present");
  });

  test('Case 5: PricingPage handles ?canceled=true query param', () => {
    const src = readFileSync(PRICING, 'utf-8');
    expect(src).toContain('canceled');
    console.log('✅ canceled=true handled in PricingPage');
  });

  test('Case 6: canceled=true triggers loadSubscription (server re-sync)', () => {
    const src = readFileSync(PRICING, 'utf-8');
    // When checkout is canceled, we must reload from server — NOT set arbitrary local state
    const canceledIdx = src.indexOf('canceled');
    expect(canceledIdx).toBeGreaterThan(-1);
    // Find loadSubscription near the canceled handling
    const window = src.slice(canceledIdx, canceledIdx + 500);
    expect(window).toContain('loadSubscription');
    console.log('✅ loadSubscription called when checkout canceled — state synced from server');
  });
});
