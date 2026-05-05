import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockTryQueryLocale, mockTryHeaderLocale } = vi.hoisted(() => ({
  mockTryQueryLocale: vi.fn(),
  mockTryHeaderLocale: vi.fn()
}));

(globalThis as unknown as { defineI18nLocaleDetector: typeof vi.fn }).defineI18nLocaleDetector = vi.fn(
  detector => detector
);
(globalThis as unknown as { tryQueryLocale: typeof vi.fn }).tryQueryLocale = mockTryQueryLocale;
(globalThis as unknown as { tryHeaderLocale: typeof vi.fn }).tryHeaderLocale = mockTryHeaderLocale;

const event = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('localeDetector', () => {
  it('returns query locale when present', async () => {
    const detector = (await import('~/i18n/localeDetector')).default as unknown as
      (event: unknown, config: { defaultLocale: string }) => string;
    mockTryQueryLocale.mockReturnValue('fr');
    expect(detector(event, { defaultLocale: 'en' })).toBe('fr');
  });

  it('returns cookie locale when query absent', async () => {
    const detector = (await import('~/i18n/localeDetector')).default as unknown as
      (event: unknown, config: { defaultLocale: string }) => string;
    mockTryQueryLocale.mockReturnValue(null);
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue('it');
    expect(detector(event, { defaultLocale: 'en' })).toBe('it');
  });

  it('returns header locale when query and cookie absent', async () => {
    const detector = (await import('~/i18n/localeDetector')).default as unknown as
      (event: unknown, config: { defaultLocale: string }) => string;
    mockTryQueryLocale.mockReturnValue(null);
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    mockTryHeaderLocale.mockReturnValue('de');
    expect(detector(event, { defaultLocale: 'en' })).toBe('de');
  });

  it('returns default locale when nothing else matches', async () => {
    const detector = (await import('~/i18n/localeDetector')).default as unknown as
      (event: unknown, config: { defaultLocale: string }) => string;
    mockTryQueryLocale.mockReturnValue(null);
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    mockTryHeaderLocale.mockReturnValue(null);
    expect(detector(event, { defaultLocale: 'en' })).toBe('en');
  });
});
