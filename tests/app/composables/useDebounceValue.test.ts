import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useDebounceValue } from '~/composables/useDebounceValue';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebounceValue', () => {
  it('initializes both refs to initial value', () => {
    const { value, debouncedValue } = useDebounceValue('a');
    expect(value.value).toBe('a');
    expect(debouncedValue.value).toBe('a');
  });

  it('debounces value updates', async () => {
    const { value, debouncedValue } = useDebounceValue('a', 100);
    value.value = 'b';
    await nextTick();
    expect(debouncedValue.value).toBe('a');
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(debouncedValue.value).toBe('b');
  });

  it('immediate sets both synchronously', () => {
    const { value, debouncedValue, immediate } = useDebounceValue('a');
    immediate('z');
    expect(value.value).toBe('z');
    expect(debouncedValue.value).toBe('z');
  });

  it('uses default delay of 300', async () => {
    const { value, debouncedValue } = useDebounceValue(0);
    value.value = 1;
    await nextTick();
    vi.advanceTimersByTime(299);
    await Promise.resolve();
    expect(debouncedValue.value).toBe(0);
    vi.advanceTimersByTime(2);
    await Promise.resolve();
    expect(debouncedValue.value).toBe(1);
  });
});
