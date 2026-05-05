import { describe, it, expect, vi } from 'vitest';

(globalThis as unknown as { defineAppConfig: typeof vi.fn }).defineAppConfig = vi.fn(
  config => config
);

describe('app.config', () => {
  it('exports toaster + ui configuration', async () => {
    const config = (await import('~/app.config')).default as {
      toaster: { position: string; expand: boolean; duration: number };
      ui: { colors: { primary: string; secondary: string }; button: object };
    };
    expect(config.toaster.position).toBe('bottom-right');
    expect(config.toaster.expand).toBe(true);
    expect(config.toaster.duration).toBe(5000);
    expect(config.ui.colors.primary).toBe('blue');
    expect(config.ui.colors.secondary).toBe('teal');
  });
});
