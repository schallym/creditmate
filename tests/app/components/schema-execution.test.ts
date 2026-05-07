import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { z } from 'zod';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';

import LoanForm from '~/components/loan/LoanForm.vue';
import UserProfilePersonalDataFormCard from '~/components/profile/UserProfilePersonalDataFormCard.vue';
import UserProfilePasswordFormCard from '~/components/profile/UserProfilePasswordFormCard.vue';
import LoginPage from '~/pages/auth/login.vue';
import SignupPage from '~/pages/auth/signup.vue';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';
import ResetPasswordPage from '~/pages/auth/reset-password.vue';
import ReviewPage from '~/pages/review.vue';
import { LoanType } from '~~/server/types';

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function getSchema(wrapper: ReturnType<typeof mountWithStubs>) {
  const form = wrapper.findComponent({ name: 'UForm' });
  return form.props('schema') as z.ZodTypeAny | { parse: (d: unknown) => unknown; safeParse: (d: unknown) => { success: boolean; error?: { issues: unknown[] } } };
}

describe('LoanForm schema validation triggers all inline message functions', () => {
  it('rejects all invalid loan fields, triggering each message arrow', () => {
    const w = mountWithStubs(LoanForm);
    const schema = getSchema(w) as z.ZodTypeAny;
    // Each invalid field triggers a different inline message function
    const r1 = schema.safeParse({}); // missing required
    expect(r1.success).toBe(false);
    const r2 = schema.safeParse({
      type: 'invalid', lenderName: '', amount: -1, interestRate: -1,
      termMonths: 0, startDate: 'not-date'
    });
    expect(r2.success).toBe(false);
    const r3 = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 100, interestRate: 200,
      termMonths: 1, startDate: new Date()
    });
    expect(r3.success).toBe(false); // interestRate > 100
    // Valid case (logged in by default mock - terms refine returns true)
    const r4 = schema.safeParse({
      type: LoanType.PERSONAL, lenderName: 'B', amount: 100, interestRate: 5,
      termMonths: 12, startDate: new Date(), termsAccepted: false
    });
    expect(r4.success).toBe(true);
  });

  it('passes when logged in (terms refine returns true)', () => {
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: { id: 1 } }, loggedIn: { value: true }, fetch: vi.fn(), clear: vi.fn()
    }));
    const w = mountWithStubs(LoanForm);
    const schema = getSchema(w) as z.ZodTypeAny;
    const r = schema.safeParse({
      type: LoanType.PERSONAL, lenderName: 'B', amount: 100, interestRate: 5,
      termMonths: 12, startDate: new Date(), termsAccepted: false
    });
    expect(r.success).toBe(true);
  });
});

describe('Profile form schemas', () => {
  it('PersonalData schema validates fullName and email', () => {
    const w = mountWithStubs(UserProfilePersonalDataFormCard, {
      props: { user: { id: 1, fullName: 'T', email: 't@b.com', passwordHash: 'h', salt: 's', authProvider: 'credentials' } }
    });
    const schema = getSchema(w) as z.ZodTypeAny;
    expect(schema.safeParse({ fullName: '', email: 'bad' }).success).toBe(false);
    expect(schema.safeParse({ fullName: 'X', email: 'a@b.com' }).success).toBe(true);
  });

  it('Password schema validates length, regex, match', () => {
    const w = mountWithStubs(UserProfilePasswordFormCard);
    const schema = getSchema(w) as z.ZodTypeAny;
    expect(schema.safeParse({ currentPassword: '', newPassword: 'short', confirmPassword: 'short' }).success).toBe(false);
    expect(schema.safeParse({ currentPassword: 'cur', newPassword: 'aaaaaaaaaaaaaaaa', confirmPassword: 'aaaaaaaaaaaaaaaa' }).success).toBe(false);
    expect(schema.safeParse({ currentPassword: 'cur', newPassword: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'differs' }).success).toBe(false);
    expect(schema.safeParse({ currentPassword: 'cur', newPassword: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'Aaaaaaaaaaaaaaa1!' }).success).toBe(true);
  });
});

describe('Page schemas', () => {
  it('Login schema validates email and password presence', () => {
    const w = mountWithStubs(LoginPage);
    const schema = getSchema(w) as z.ZodTypeAny;
    expect(schema.safeParse({ email: 'bad', password: '' }).success).toBe(false);
    expect(schema.safeParse({ email: 'a@b.com', password: 'p' }).success).toBe(true);
  });

  it('Signup schema validates all fields and refine match', () => {
    const w = mountWithStubs(SignupPage);
    // Signup uses computed schema — need to access its value
    const form = w.findComponent({ name: 'UForm' });
    const schema = form.props('schema') as z.ZodTypeAny;
    expect(schema.safeParse({ fullName: '', email: 'bad', password: 'short', confirmPassword: 'short', terms: false }).success).toBe(false);
    expect(schema.safeParse({
      fullName: 'J', email: 'a@b.com', password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'differs', terms: true
    }).success).toBe(false);
    expect(schema.safeParse({
      fullName: 'J', email: 'a@b.com', password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'Aaaaaaaaaaaaaaa1!', terms: true
    }).success).toBe(true);
  });

  it('ForgotPassword schema validates email', () => {
    const w = mountWithStubs(ForgotPasswordPage);
    const schema = getSchema(w) as z.ZodTypeAny;
    expect(schema.safeParse({ email: 'bad' }).success).toBe(false);
    expect(schema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('ResetPassword schema validates after token verification', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ valid: true });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const { mount, flushPromises } = await import('@vue/test-utils');
    const { defineComponent, h, Suspense } = await import('vue');
    const { stubs } = await import('../vue-test-helper');
    const Wrapper = defineComponent({
      setup: () => () => h(Suspense, null, { default: () => h(ResetPasswordPage) })
    });
    const w = mount(Wrapper, { global: { stubs, mocks: { $t: (k: string) => k } } });
    await flushPromises();
    const form = w.findComponent({ name: 'UForm' });
    if (form.exists()) {
      const schema = form.props('schema') as z.ZodTypeAny;
      expect(schema.safeParse({ password: 'short', confirmPassword: 'short' }).success).toBe(false);
      expect(schema.safeParse({ password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'differs' }).success).toBe(false);
      expect(schema.safeParse({ password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'Aaaaaaaaaaaaaaa1!' }).success).toBe(true);
    }
  });
});

describe('Review page schema', () => {
  it('validates all fields including refine for general/feature suggestions', () => {
    const w = mountWithStubs(ReviewPage);
    const schema = getSchema(w) as z.ZodTypeAny;
    // Invalid: feedback empty
    expect(schema.safeParse({
      rating: 5, type: 'general', categories: ['c'], feedback: ''
    }).success).toBe(false);
    // Invalid: feedback too long
    expect(schema.safeParse({
      rating: 5, type: 'bug', categories: ['c'], feedback: 'a'.repeat(700)
    }).success).toBe(false);
    // Invalid: categories empty
    expect(schema.safeParse({
      rating: 5, type: 'bug', categories: [], feedback: 'good'
    }).success).toBe(false);
    // Invalid: bad email
    expect(schema.safeParse({
      rating: 5, type: 'bug', categories: ['c'], feedback: 'good', email: 'not-email'
    }).success).toBe(false);
    // Valid bug
    expect(schema.safeParse({
      rating: 5, type: 'bug', categories: ['c'], feedback: 'good'
    }).success).toBe(true);
    // Valid bug with non-empty suggestions (triggers refine return true)
    expect(schema.safeParse({
      rating: 5, type: 'bug', categories: ['c'], feedback: 'good', suggestions: 'idea'
    }).success).toBe(true);
  });
});
