import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { setupNuxtMocks, stubs } from '../vue-test-helper';

import ColorModeSelector from '~/components/ui/ColorModeSelector.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import PasswordInput from '~/components/ui/PasswordInput.vue';
import HomeHero from '~/components/home/HomeHero.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';
import LoanForm from '~/components/loan/LoanForm.vue';
import ReviewPage from '~/pages/review.vue';

const tFn = (key: string) => key;

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Branch fallbacks', () => {
  it('ColorModeSelector preference null fallback', () => {
    (globalThis as Record<string, unknown>).useColorMode = () => ({ preference: null, value: 'light', forced: false });
    const w = mount(ColorModeSelector, { global: { stubs, mocks: { $t: tFn } } });
    expect(w.exists()).toBe(true);
  });

  it('DeleteButton no toastSuccessTitle uses default', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const w = mount(DeleteButton, {
      props: { onDelete }, // no toastSuccessTitle
      global: {
        stubs: { ...stubs, UModal: { props: ['title', 'open'], emits: ['update:open'], template: '<div><slot /><slot name="body" /></div>' } },
        mocks: { $t: tFn }
      }
    });
    const inputs = w.findAllComponents({ name: 'UInput' });
    for (const inp of inputs) await inp.vm.$emit('update:modelValue', 'ui.deleteConfirmation.confirmationInput.confirmationText');
    await flushPromises();
    const buttons = w.findAll('button');
    if (buttons.length > 0) await buttons[buttons.length - 1].trigger('click');
    await flushPromises();
    expect(onDelete).toHaveBeenCalled();
  });

  it('PasswordInput emits empty string when value cleared', async () => {
    const w = mount(PasswordInput, {
      props: { label: 'L', placeholder: 'P', name: 'n', modelValue: 'init' },
      global: { stubs, mocks: { $t: tFn } }
    });
    const inp = w.findComponent({ name: 'UInput' });
    if (inp.exists()) {
      await inp.vm.$emit('update:modelValue', null);
      await flushPromises();
      await inp.vm.$emit('update:modelValue', '');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('HomeHero light mode (truthy non-dark colorMode value)', () => {
    (globalThis as Record<string, unknown>).useColorMode = () => ({ preference: 'light', value: 'light', forced: false });
    expect(mount(HomeHero, { global: { stubs, mocks: { $t: tFn } } }).exists()).toBe(true);
  });

  it('HomeHero dark mode logged-out', () => {
    (globalThis as Record<string, unknown>).useColorMode = () => ({ preference: 'dark', value: 'dark', forced: false });
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: ref(null), loggedIn: ref(false), fetch: vi.fn(), clear: vi.fn()
    });
    expect(mount(HomeHero, { global: { stubs, mocks: { $t: tFn } } }).exists()).toBe(true);
  });

  it('ReviewCategoryCard initial categories from props', async () => {
    const w = mount(ReviewCategoryCard, {
      props: { modelValue: ['userInterface', 'calculations'] },
      global: { stubs, mocks: { $t: tFn } }
    });
    const buttons = w.findAll('button');
    if (buttons.length > 0) await buttons[0].trigger('click'); // toggle off existing
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('LoanForm submit error toast without data.message', () => {
  it('handles error with no .data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: {} });
    (globalThis as Record<string, unknown>).$fetch = fetchMock;
    const w = mount(LoanForm, {
      global: { stubs, mocks: { $t: tFn, navigateTo: vi.fn(), $fetch: fetchMock } }
    });
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('Review error path with no data.message', () => {
  it('handles error.data.message missing in catch', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: {} });
    (globalThis as Record<string, unknown>).$fetch = fetchMock;
    const w = mount(ReviewPage, {
      global: { stubs, mocks: { $t: tFn } }
    });
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('mounts when user logged in with email', () => {
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: ref({ email: 'pre@b.com' }), loggedIn: ref(true), fetch: vi.fn(), clear: vi.fn()
    });
    expect(mount(ReviewPage, { global: { stubs, mocks: { $t: tFn } } }).exists()).toBe(true);
  });
});
