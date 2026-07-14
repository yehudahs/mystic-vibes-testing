/**
 * TEST-FE-PRICING-001: Pricing → Checkout Conversion Fix
 *
 * Verifies the three bugs fixed in fix/pricing-checkout-conversion:
 *   1. Guest pendingPlanId lookup used p.id instead of p.stripePriceId — plan was
 *      never found after login so checkout never triggered (zero revenue bug)
 *   2. checkout_initiated PostHog event fired AFTER Stripe redirect — page navigated
 *      away before event could be sent, making funnel invisible
 *   3. pendingPlanId was never cleared when plan lookup failed — ghost state
 *   4. pricing_viewed event added for full funnel tracking (issue #30)
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PRICING_PAGE = resolve('/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src/pages/PricingPage.tsx');

describe('TEST-FE-PRICING-001: Pricing → Checkout Conversion', () => {

  test('Case 1: PricingPage exists', () => {
    expect(existsSync(PRICING_PAGE)).toBe(true);
  });

  test('Case 2: pendingPlanId lookup uses stripePriceId not p.id', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    // The bug was: availablePlans.find((p) => p.id === pendingPlanId)
    // The fix is:  availablePlans.find((p) => p.stripePriceId === pendingPlanId)
    expect(src).not.toContain('p.id === pendingPlanId');
    expect(src).toContain('p.stripePriceId === pendingPlanId');
    console.log('✅ pendingPlanId lookup correctly uses p.stripePriceId');
  });

  test('Case 3: checkout_initiated event fires before createCheckoutSession redirect', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    const captureIdx = src.indexOf("posthog.capture('checkout_initiated'");
    const checkoutIdx = src.indexOf('await createCheckoutSession');
    // capture must come before createCheckoutSession (page navigates away on redirect)
    expect(captureIdx).toBeGreaterThan(-1);
    expect(checkoutIdx).toBeGreaterThan(-1);
    expect(captureIdx).toBeLessThan(checkoutIdx);
    console.log('✅ checkout_initiated fires before Stripe redirect');
  });

  test('Case 4: pendingPlanId is always cleared (even when plan not found)', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    // setPendingPlanId(null) must appear before the if(plan) check, not only inside it
    const clearIdx = src.indexOf('setPendingPlanId(null)');
    const ifPlanIdx = src.indexOf('if (plan)');
    expect(clearIdx).toBeGreaterThan(-1);
    expect(ifPlanIdx).toBeGreaterThan(-1);
    expect(clearIdx).toBeLessThan(ifPlanIdx);
    console.log('✅ pendingPlanId always cleared — no ghost state');
  });

  test('Case 5: pricing_viewed event is tracked on mount', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).toContain("posthog.capture('pricing_viewed'");
    expect(src).toContain('is_authenticated');
    console.log('✅ pricing_viewed event added for funnel visibility');
  });

  test('Case 6: checkout_initiated includes source prop for funnel attribution', () => {
    const src = readFileSync(PRICING_PAGE, 'utf-8');
    expect(src).toContain("source: 'pricing_page'");
    expect(src).toContain("source: 'post_auth'");
    console.log('✅ checkout_initiated has source prop to distinguish direct vs post-login');
  });
});
