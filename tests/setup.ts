import { vi } from 'vitest';

// Mock vue-router — delegate to globalThis so tests can override per-test
vi.mock('vue-router', () => ({
  useRoute: () => {
    const fn = (globalThis as unknown as { useRoute?: () => unknown }).useRoute;
    return fn ? fn() : { params: {}, query: {}, path: '/', name: 'home' };
  },
  useRouter: () => {
    const fn = (globalThis as unknown as { useRouter?: () => unknown }).useRouter;
    return fn ? fn() : { push: vi.fn(), replace: vi.fn(), back: vi.fn(), go: vi.fn(), resolve: vi.fn() };
  }
}));

// Stub chart libraries — they need complex DOM setup
vi.mock('@unovis/vue', () => ({
  VisSingleContainer: { name: 'VisSingleContainer', props: ['data', 'style'], template: '<div><slot /></div>' },
  VisXYContainer: { name: 'VisXYContainer', props: ['data', 'padding'], template: '<div><slot /></div>' },
  VisDonut: { name: 'VisDonut', props: ['arcWidth', 'value', 'color'], template: '<div />' },
  VisLine: { name: 'VisLine', props: ['x', 'y', 'color', 'lineDashArray'], template: '<div />' },
  VisAxis: { name: 'VisAxis', props: ['type', 'gridLine', 'domainLine', 'tickLine', 'tickFormat', 'numTicks'], template: '<div />' },
  VisTooltip: { name: 'VisTooltip', props: ['triggers'], template: '<div />' },
  VisCrosshair: { name: 'VisCrosshair', props: ['template', 'x', 'y'], template: '<div />' }
}));

vi.mock('@unovis/ts', () => ({
  Donut: { selectors: { segment: '.segment' } }
}));

// Mock h3 — some files import readBody/createError directly from 'h3'
vi.mock('h3', () => {
  const createError = (opts: { statusCode?: number; message?: string; statusMessage?: string; data?: unknown }) => {
    const err = new Error(opts.message || opts.statusMessage || 'Error') as Error & { statusCode?: number; data?: unknown; statusMessage?: string };
    err.statusCode = opts.statusCode;
    err.data = opts.data;
    err.statusMessage = opts.statusMessage;
    return err;
  };
  return {
    readBody: (...args: unknown[]) => (globalThis as unknown as { readBody: (...a: unknown[]) => unknown }).readBody(...args),
    readValidatedBody: (...args: unknown[]) => (globalThis as unknown as { readValidatedBody: (...a: unknown[]) => unknown }).readValidatedBody(...args),
    getRouterParam: (...args: unknown[]) => (globalThis as unknown as { getRouterParam: (...a: unknown[]) => unknown }).getRouterParam(...args),
    getQuery: (...args: unknown[]) => (globalThis as unknown as { getQuery: (...a: unknown[]) => unknown }).getQuery(...args),
    sendRedirect: (...args: unknown[]) => (globalThis as unknown as { sendRedirect: (...a: unknown[]) => unknown }).sendRedirect(...args),
    createError,
    defineEventHandler: (handler: unknown) => handler,
    setResponseStatus: (...args: unknown[]) => (globalThis as unknown as { setResponseStatus: (...a: unknown[]) => unknown }).setResponseStatus(...args),
    getCookie: (...args: unknown[]) => (globalThis as unknown as { getCookie: (...a: unknown[]) => unknown }).getCookie(...args)
  };
});

// Stub Nuxt globals used in server code
(globalThis as unknown as { useRuntimeConfig: typeof vi.fn }).useRuntimeConfig = vi.fn(() => ({
  jwtSecret: 'test-secret',
  smtp: {
    host: 'smtp.test.com',
    port: 587,
    auth: { user: 'test', pass: 'test' }
  },
  public: {
    appUrl: 'http://localhost:3000'
  }
}));

(globalThis as unknown as { defineEventHandler: typeof vi.fn }).defineEventHandler = vi.fn(
  handler => handler
);

(globalThis as unknown as { createError: typeof vi.fn }).createError = vi.fn((opts: { statusCode?: number; message?: string; statusMessage?: string; data?: unknown }) => {
  const err = new Error(opts.message || opts.statusMessage || 'Error') as Error & { statusCode?: number; data?: unknown; statusMessage?: string };
  err.statusCode = opts.statusCode;
  err.data = opts.data;
  err.statusMessage = opts.statusMessage;
  return err;
});

(globalThis as unknown as { readBody: typeof vi.fn }).readBody = vi.fn();
(globalThis as unknown as { readValidatedBody: typeof vi.fn }).readValidatedBody = vi.fn();
(globalThis as unknown as { getRouterParam: typeof vi.fn }).getRouterParam = vi.fn();
(globalThis as unknown as { getQuery: typeof vi.fn }).getQuery = vi.fn();
(globalThis as unknown as { sendRedirect: typeof vi.fn }).sendRedirect = vi.fn();
(globalThis as unknown as { setUserSession: typeof vi.fn }).setUserSession = vi.fn();
(globalThis as unknown as { getUserSession: typeof vi.fn }).getUserSession = vi.fn();
(globalThis as unknown as { clearUserSession: typeof vi.fn }).clearUserSession = vi.fn();
(globalThis as unknown as { defineOAuthGoogleEventHandler: typeof vi.fn }).defineOAuthGoogleEventHandler = vi.fn(
  config => config
);
(globalThis as unknown as { useTranslation: typeof vi.fn }).useTranslation = vi.fn(
  async () => (key: string) => key
);
(globalThis as unknown as { requireUserSession: typeof vi.fn }).requireUserSession = vi.fn();
(globalThis as unknown as { setResponseStatus: typeof vi.fn }).setResponseStatus = vi.fn();
(globalThis as unknown as { getCookie: typeof vi.fn }).getCookie = vi.fn();
(globalThis as unknown as { useLocale: typeof vi.fn }).useLocale = vi.fn(() => ({ locale: 'en' }));
(globalThis as unknown as { useStorage: typeof vi.fn }).useStorage = (globalThis as unknown as { useStorage: typeof vi.fn }).useStorage || vi.fn();
