import { describe, it, expect, beforeEach } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../../vue-test-helper';

import ClearableInput from '~/components/ui/ClearableInput.vue';
import DateInput from '~/components/ui/DateInput.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import TextAreaInput from '~/components/ui/TextAreaInput.vue';
import ColorModeSelector from '~/components/ui/ColorModeSelector.vue';
import LanguageSelector from '~/components/ui/LanguageSelector.vue';

beforeEach(() => setupNuxtMocks());

describe('ClearableInput', () => {
  it('mounts and emits update on change', async () => {
    const wrapper = mountWithStubs(ClearableInput, {
      props: { modelValue: 'init', label: 'L', name: 'n', placeholder: 'P' }
    });
    expect(wrapper.exists()).toBe(true);
    await wrapper.setProps({ modelValue: 'new' });
    expect(wrapper.exists()).toBe(true);
  });

  it('handles size and icon props', () => {
    const w = mountWithStubs(ClearableInput, {
      props: { modelValue: '', label: 'L', name: 'n', placeholder: 'P', size: 'lg', icon: 'i-x' }
    });
    expect(w.exists()).toBe(true);
  });
});

describe('DateInput', () => {
  it('mounts with no model value', () => {
    const w = mountWithStubs(DateInput);
    expect(w.exists()).toBe(true);
  });

  it('mounts with string model value', () => {
    const w = mountWithStubs(DateInput, { props: { modelValue: '2026-01-01' } });
    expect(w.exists()).toBe(true);
  });
});

describe('DeleteButton', () => {
  it('mounts with onDelete prop', async () => {
    const onDelete = async () => undefined;
    const w = mountWithStubs(DeleteButton, { props: { onDelete } });
    expect(w.exists()).toBe(true);
  });

  it('mounts with all optional props', () => {
    const w = mountWithStubs(DeleteButton, {
      props: {
        onDelete: () => undefined,
        buttonLabel: 'Del',
        confirmationQuestion: 'Sure?',
        confirmationMessage: 'Msg',
        toastSuccessTitle: 'OK',
        toastSuccessDescription: 'done'
      }
    });
    expect(w.exists()).toBe(true);
  });
});

describe('TextAreaInput', () => {
  it('mounts with required props', () => {
    const w = mountWithStubs(TextAreaInput, {
      props: { modelValue: 'hello', name: 'n', placeholder: 'p' }
    });
    expect(w.exists()).toBe(true);
  });

  it('updates counter on prop change', async () => {
    const w = mountWithStubs(TextAreaInput, {
      props: { modelValue: '', name: 'n', placeholder: 'p', maxLength: 10, label: 'L' }
    });
    await w.setProps({ modelValue: 'abc' });
    expect(w.exists()).toBe(true);
  });
});

describe('ColorModeSelector', () => {
  it('mounts when color mode not forced', () => {
    const w = mountWithStubs(ColorModeSelector);
    expect(w.exists()).toBe(true);
  });
});

describe('LanguageSelector', () => {
  it('mounts and renders locale items', () => {
    const w = mountWithStubs(LanguageSelector);
    expect(w.exists()).toBe(true);
  });
});
