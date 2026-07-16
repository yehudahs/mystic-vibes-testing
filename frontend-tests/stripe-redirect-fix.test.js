/**
 * TEST-FE-STRIPE-002: Stripe checkout redirect fix
 *
 * Three bugs fixed in fix/stripe-checkout-redirect:
 *
 *   1. subscriptionStore used the deprecated stripe.redirectToCheckout({ sessionId })
 *      which requires Stripe.js (js.stripe.com) to be loaded. If a browser extension
 *      or in-app browser blocks js.stripe.com, checkout silently failed.
 *      Fix: use window.location.href = session.url — the URL returned by the API,
 *      no Stripe.js required.
 *
 *   2. In-app browsers (Instagram, TikTok, Facebook) block checkout.stripe.com entirely,
 *      so even the session.url redirect won't work. The StripeUnavailableBanner now
 *      shows only for in-app browsers (not for ad-blockers), and the pricing button
 *      is disabled in-app with a clear message.
 *
 *   3. When checkout fails, the button silently reset with no explanation.
 *      Fix: PricingPage now sets checkoutError state and renders it to the user.
 *
 * These tests will FAIL against code without this fix and PASS after.
 */

import { describe, test, expect } from '@jest/globals'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const BASE = '/Users/yehuda/priavte/mystic-vibes/mystic-vibes-ai/src'
const STORE   = resolve(`${BASE}/store/subscriptionStore.ts`)
const PRICING = resolve(`${BASE}/pages/PricingPage.tsx`)
const BANNER  = resolve(`${BASE}/components/StripeUnavailableBanner.tsx`)
const DETECT  = resolve(`${BASE}/utils/browserDetect.ts`)

describe('TEST-FE-STRIPE-002: Stripe checkout redirect fix', () => {

  // ── 1. session.url redirect ─────────────────────────────────────────────

  test('Case 1: browserDetect utility exists', () => {
    expect(existsSync(DETECT)).toBe(true)
    console.log('✅ browserDetect.ts exists')
  })

  test('Case 2: isInAppBrowser checks for Instagram, TikTok, Facebook', () => {
    const src = readFileSync(DETECT, 'utf-8')
    expect(src).toContain('isInAppBrowser')
    expect(src).toContain('Instagram')
    expect(src).toContain('TikTok')
    expect(src).toMatch(/FBAN|Facebook/)
    console.log('✅ isInAppBrowser covers Instagram, TikTok, Facebook')
  })

  test('Case 3: subscriptionStore uses window.location.href = session.url (not redirectToCheckout)', () => {
    const src = readFileSync(STORE, 'utf-8')
    // Find only the createCheckoutSession function body (not type definitions)
    const fnStart = src.indexOf('createCheckoutSession: async')
    const fnEnd = src.indexOf('upgradeSubscription:', fnStart)
    const fnBody = src.slice(fnStart, fnEnd > fnStart ? fnEnd : fnStart + 2000)

    expect(fnBody).not.toContain('redirectToCheckout')
    expect(fnBody).toContain('session.url')
    expect(fnBody).toContain('window.location.href')
    console.log('✅ createCheckoutSession uses window.location.href = session.url')
  })

  test('Case 4: store no longer calls updateSubscriptionState on checkout failure', () => {
    const src = readFileSync(STORE, 'utf-8')
    const fnStart = src.indexOf('createCheckoutSession: async')
    const fnEnd = src.indexOf('upgradeSubscription:', fnStart)
    const fnBody = src.slice(fnStart, fnEnd > fnStart ? fnEnd : fnStart + 2000)
    // This was wrong — calling updateSubscriptionState('unsubscribed', 'Checkout failed')
    // when the user never even reached Stripe corrupts state unnecessarily
    expect(fnBody).not.toMatch(/updateSubscriptionState.*unsubscribed.*Checkout failed|Checkout failed.*unsubscribed/)
    console.log('✅ store does not incorrectly set unsubscribed state on checkout failure')
  })

  // ── 2. In-app browser handling ──────────────────────────────────────────

  test('Case 5: StripeUnavailableBanner uses isInAppBrowser (not stripeService.isAvailable)', () => {
    const src = readFileSync(BANNER, 'utf-8')
    expect(src).toContain('isInAppBrowser')
    // No longer checking stripeService.isAvailable — ad-blocker case is fixed by session.url
    expect(src).not.toContain('stripeService.isAvailable')
    console.log('✅ Banner shows for in-app browsers only, not for ad-blockers')
  })

  test('Case 6: PricingPage imports isInAppBrowser', () => {
    const src = readFileSync(PRICING, 'utf-8')
    expect(src).toContain('isInAppBrowser')
    expect(src).toContain('browserDetect')
    console.log('✅ PricingPage imports isInAppBrowser')
  })

  test('Case 7: PricingPage disables button for in-app browsers', () => {
    const src = readFileSync(PRICING, 'utf-8')
    // inAppBrowser must be part of the disabled condition on PricingCard
    const cardIdx = src.indexOf('<PricingCard')
    const cardEnd = src.indexOf('/>', cardIdx)
    const cardBlock = src.slice(cardIdx, cardEnd)
    expect(cardBlock).toContain('inAppBrowser')
    console.log('✅ PricingCard disabled when inAppBrowser is true')
  })

  // ── 3. Visible error on checkout failure ────────────────────────────────

  test('Case 8: PricingPage has checkoutError state', () => {
    const src = readFileSync(PRICING, 'utf-8')
    expect(src).toContain('checkoutError')
    expect(src).toContain('setCheckoutError')
    console.log('✅ checkoutError state exists in PricingPage')
  })

  test('Case 9: checkoutError is set when checkout fails (not silently swallowed)', () => {
    const src = readFileSync(PRICING, 'utf-8')
    const catchIdx = src.indexOf('catch (error)', src.indexOf('handleSelectPlan'))
    const catchBlock = src.slice(catchIdx, catchIdx + 300)
    expect(catchBlock).toContain('setCheckoutError')
    console.log('✅ catch block sets checkoutError — user sees failure message')
  })

  test('Case 10: checkoutError is rendered in JSX', () => {
    const src = readFileSync(PRICING, 'utf-8')
    // Error must appear in JSX, not just set in state
    expect(src).toMatch(/\{checkoutError\s*&&|checkoutError\s*\?/)
    console.log('✅ checkoutError is rendered to the user')
  })

  // ── 4. Loading state fix ────────────────────────────────────────────────

  test('Case 11: isLoading uses plan.stripePriceId not plan.id (correct comparison)', () => {
    const src = readFileSync(PRICING, 'utf-8')
    // Bug was: selectedPlan === plan.id  (selectedPlan holds stripePriceId, never matches)
    // Fix is:  selectedPlan === plan.stripePriceId
    expect(src).not.toContain('selectedPlan === plan.id')
    expect(src).toContain('selectedPlan === plan.stripePriceId')
    console.log('✅ isLoading comparison uses plan.stripePriceId — spinner shows correctly')
  })

  // ── 5. Copy fix ─────────────────────────────────────────────────────────

  test('Case 12: overclaim copy removed ("Trusted by thousands")', () => {
    const src = readFileSync(PRICING, 'utf-8')
    expect(src).not.toContain('Trusted by thousands')
    expect(src).not.toContain('Join thousands')
    console.log('✅ Overclaim copy removed from pricing page')
  })
})
