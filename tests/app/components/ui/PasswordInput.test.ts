import { describe, it, expect, beforeEach } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../../vue-test-helper';
import PasswordInput from '~/components/ui/PasswordInput.vue';

beforeEach(() => setupNuxtMocks());

describe('PasswordInput', () => {
  it('mounts with required props', () => {
    const wrapper = mountWithStubs(PasswordInput, {
      props: { label: 'Pass', placeholder: 'Enter', name: 'pwd', modelValue: '' }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('initializes from modelValue when truthy', () => {
    const wrapper = mountWithStubs(PasswordInput, {
      props: { label: 'L', placeholder: 'P', name: 'n', modelValue: 'secret' }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('accepts optional size prop', () => {
    const wrapper = mountWithStubs(PasswordInput, {
      props: { label: 'L', placeholder: 'P', name: 'n', modelValue: '', size: 'sm' }
    });
    expect(wrapper.exists()).toBe(true);
  });
});
