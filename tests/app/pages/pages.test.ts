import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';

import LoginPage from '~/pages/auth/login.vue';
import SignupPage from '~/pages/auth/signup.vue';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';
import ResetPasswordPage from '~/pages/auth/reset-password.vue';
import IndexPage from '~/pages/index.vue';
import LegalNoticePage from '~/pages/legal/legal-notice.vue';
import PrivacyPage from '~/pages/legal/privacy.vue';
import TermsPage from '~/pages/legal/terms.vue';
import LoansAddPage from '~/pages/loans/add.vue';
import LoansIndexPage from '~/pages/loans/index.vue';
import ProfilePage from '~/pages/profile.vue';
import ReviewPage from '~/pages/review.vue';

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Pages smoke tests', () => {
  it('login page mounts', () => {
    expect(mountWithStubs(LoginPage).exists()).toBe(true);
  });
  it('login page handles oauth error query', () => {
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { error: 'oauth' }, path: '/auth/login', name: 'login'
    }));
    expect(mountWithStubs(LoginPage).exists()).toBe(true);
  });
  it('signup page mounts', () => {
    expect(mountWithStubs(SignupPage).exists()).toBe(true);
  });
  it('forgot password page mounts', () => {
    expect(mountWithStubs(ForgotPasswordPage).exists()).toBe(true);
  });
  it('reset password page mounts', () => {
    expect(mountWithStubs(ResetPasswordPage).exists()).toBe(true);
  });
  it('index page mounts', () => {
    expect(mountWithStubs(IndexPage).exists()).toBe(true);
  });
  it('legal notice mounts', () => {
    expect(mountWithStubs(LegalNoticePage).exists()).toBe(true);
  });
  it('privacy mounts', () => {
    expect(mountWithStubs(PrivacyPage).exists()).toBe(true);
  });
  it('terms mounts', () => {
    expect(mountWithStubs(TermsPage).exists()).toBe(true);
  });
  it('loans add page mounts', () => {
    expect(mountWithStubs(LoansAddPage).exists()).toBe(true);
  });
  it('loans index page mounts', () => {
    expect(mountWithStubs(LoansIndexPage).exists()).toBe(true);
  });
  it('profile page mounts', () => {
    expect(mountWithStubs(ProfilePage).exists()).toBe(true);
  });
  it('review page mounts', () => {
    expect(mountWithStubs(ReviewPage).exists()).toBe(true);
  });
});
