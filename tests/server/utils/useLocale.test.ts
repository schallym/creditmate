import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocale } from '~~/server/utils/useLocale';

const event = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLocale', () => {
  it('returns cookie value when present', () => {
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue('fr');
    expect(useLocale(event).locale).toBe('fr');
  });

  it('returns default locale when no cookie', () => {
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    expect(useLocale(event).locale).toBe('en');
  });

  it('uses custom defaultLocale option', () => {
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    expect(useLocale(event, { defaultLocale: 'es' }).locale).toBe('es');
  });

  it('uses custom cookieName option', () => {
    (globalThis.getCookie as ReturnType<typeof vi.fn>).mockReturnValue('it');
    expect(useLocale(event, { cookieName: 'my_cookie' }).locale).toBe('it');
    expect(globalThis.getCookie).toHaveBeenCalledWith(event, 'my_cookie');
  });
});
