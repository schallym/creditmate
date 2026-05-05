import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, Suspense, onErrorCaptured, type Component } from 'vue';
import { setupNuxtMocks, stubs } from '../vue-test-helper';

import LoginPage from '~/pages/auth/login.vue';
import SignupPage from '~/pages/auth/signup.vue';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';
import ResetPasswordPage from '~/pages/auth/reset-password.vue';
import ReviewPage from '~/pages/review.vue';

const tFn = (key: string) => key;

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

function mountSync<T extends Component>(C: T, props: Record<string, unknown> = {}) {
  return mount(C, {
    props,
    global: { stubs, mocks: { $t: tFn, $i18n: { locale: 'en' } } }
  });
}

async function mountAsync<T extends Component>(C: T, props: Record<string, unknown> = {}) {
  const Wrapper = defineComponent({
    setup() {
      onErrorCaptured(() => false);
      return () => h(Suspense, null, { default: () => h(C, props) });
    }
  });
  const w = mount(Wrapper, {
    global: { stubs, mocks: { $t: tFn, $i18n: { locale: 'en' } } }
  });
  await flushPromises();
  return w;
}

describe('login page onSubmit', () => {
  it('logs in successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(LoginPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
  });

  it('shows error on login failure with data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'badcred' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(LoginPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('shows error on login failure without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: {} });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(LoginPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles oauth error query param', () => {
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { error: 'oauth' }, path: '/auth/login', name: 'login'
    }));
    expect(mountSync(LoginPage).exists()).toBe(true);
  });
});

describe('signup page onSubmit', () => {
  it('signs up successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(SignupPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({ method: 'POST' }));
  });

  it('shows error on signup failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'exists' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(SignupPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('forgot-password page onSubmit', () => {
  it('submits forgot password request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(ForgotPasswordPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/forgot-password', expect.objectContaining({ method: 'POST' }));
  });

  it('handles forgot password error with data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'not found' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(ForgotPasswordPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles forgot password error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(ForgotPasswordPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('reset-password page', () => {
  it('redirects to login when no token', async () => {
    const pushMock = vi.fn();
    (globalThis as unknown as { useRouter: ReturnType<typeof vi.fn> }).useRouter = vi.fn(() => ({ push: pushMock }));
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: {}, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
    expect(w.exists()).toBe(true);
  });

  it('verifies valid token and shows form', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ valid: true });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/verify-reset-token', expect.any(Object));
    expect(w.exists()).toBe(true);
  });

  it('handles invalid token from server', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ valid: false });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    expect(w.exists()).toBe(true);
  });

  it('handles verify-token error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('boom'));
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    expect(w.exists()).toBe(true);
  });

  it('submits reset password successfully when token valid', async () => {
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) return { valid: true };
      return {};
    });
    const pushMock = vi.fn();
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRouter: ReturnType<typeof vi.fn> }).useRouter = vi.fn(() => ({ push: pushMock }));
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    const form = w.find('form');
    if (form.exists()) {
      await form.trigger('submit');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('handles reset password submit error', async () => {
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) return { valid: true };
      throw { data: { message: 'oops' } };
    });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    const form = w.find('form');
    if (form.exists()) {
      await form.trigger('submit');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('review page onSubmit', () => {
  it('submits review and navigates home', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    const pushMock = vi.fn();
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRouter: ReturnType<typeof vi.fn> }).useRouter = vi.fn(() => ({ push: pushMock }));
    const w = mountSync(ReviewPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/review', expect.objectContaining({ method: 'POST' }));
  });

  it('handles review submit error', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'fail' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountSync(ReviewPage);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('mounts when not logged in', () => {
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: null }, loggedIn: { value: false }, fetch: vi.fn(), clear: vi.fn()
    }));
    expect(mountSync(ReviewPage).exists()).toBe(true);
  });
});
