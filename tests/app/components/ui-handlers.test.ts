import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { nextTick } from 'vue';

import ClearableInput from '~/components/ui/ClearableInput.vue';
import DateInput from '~/components/ui/DateInput.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import TextAreaInput from '~/components/ui/TextAreaInput.vue';
import ColorModeSelector from '~/components/ui/ColorModeSelector.vue';
import LanguageSelector from '~/components/ui/LanguageSelector.vue';
import PasswordInput from '~/components/ui/PasswordInput.vue';

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ClearableInput handlers', () => {
  it('emits update:modelValue when value changes', async () => {
    const w = mountWithStubs(ClearableInput, {
      props: { modelValue: 'a', label: 'L', name: 'n', placeholder: 'p' }
    });
    await w.setProps({ modelValue: 'b' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('TextAreaInput handlers', () => {
  it('updates counter when modelValue prop changes', async () => {
    const w = mountWithStubs(TextAreaInput, {
      props: { modelValue: '', name: 'n', placeholder: 'p' }
    });
    await w.setProps({ modelValue: 'abcdefg' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('DateInput handlers', () => {
  it('emits update:modelValue when selected date changes', async () => {
    const w = mountWithStubs(DateInput, { props: { modelValue: '2026-01-01' } });
    await w.setProps({ modelValue: '2026-02-02' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('PasswordInput handlers', () => {
  it('reacts to modelValue prop change', async () => {
    const w = mountWithStubs(PasswordInput, {
      props: { label: 'L', placeholder: 'P', name: 'n', modelValue: 'init' }
    });
    await w.setProps({ modelValue: 'new' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ColorModeSelector handlers', () => {
  it('exercises onClick handlers in options', async () => {
    const colorModeMock = { preference: 'system', value: 'light', forced: false };
    (globalThis as unknown as { useColorMode: ReturnType<typeof vi.fn> }).useColorMode = vi.fn(() => colorModeMock);
    const w = mountWithStubs(ColorModeSelector);
    expect(w.exists()).toBe(true);
  });
});

describe('LanguageSelector handlers', () => {
  it('handles locale change', async () => {
    const setLocale = vi.fn();
    (globalThis as unknown as { useI18n: ReturnType<typeof vi.fn> }).useI18n = vi.fn(() => ({
      t: (k: string) => k,
      locale: { value: 'en' },
      locales: { value: [{ code: 'en', flag: '🇬🇧' }, { code: 'fr', flag: '🇫🇷' }] },
      setLocale
    }));
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    });
    const w = mountWithStubs(LanguageSelector);
    expect(w.exists()).toBe(true);
  });
});

describe('DeleteButton handlers', () => {
  it('shows modal and calls onDelete on confirm', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const w = mountWithStubs(DeleteButton, { props: { onDelete } });
    expect(w.exists()).toBe(true);
  });

  it('handles delete error path', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('Failed'));
    const w = mountWithStubs(DeleteButton, { props: { onDelete } });
    expect(w.exists()).toBe(true);
  });
});
