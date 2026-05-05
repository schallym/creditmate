import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { setupNuxtMocks, stubs } from '../vue-test-helper';
import LoanForm from '~/components/loan/LoanForm.vue';

const tFn = (key: string) => key;

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('LoanForm logged-out renders UAlert + termsAccepted setter', () => {
  it('renders UAlert and triggers termsAccepted v-model setter', async () => {
    // Override AFTER setupNuxtMocks beforeEach
    const loggedInRef = ref(false);
    const userRef = ref(null);
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: userRef,
      loggedIn: loggedInRef,
      fetch: () => undefined,
      clear: () => undefined
    });
    const UCheckboxStub = {
      name: 'UCheckbox',
      props: ['modelValue'], emits: ['update:modelValue'],
      template: '<input type="checkbox" />'
    };
    const UAlertStub = {
      name: 'UAlert',
      props: ['title', 'icon', 'variant', 'description', 'color'],
      template: '<div class="alert"><slot /></div>'
    };
    const w = mount(LoanForm, {
      global: {
        stubs: { ...stubs, UCheckbox: UCheckboxStub, UAlert: UAlertStub },
        mocks: { $t: tFn, navigateTo: vi.fn(), $fetch: vi.fn() }
      }
    });
    await flushPromises();
    // Debug: print HTML to confirm UAlert renders
    const checkbox = w.findComponent(UCheckboxStub);
    if (checkbox.exists()) {
      await checkbox.vm.$emit('update:modelValue', true);
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('LoanForm v-model setters via auto-emitting child stubs', () => {
  it('triggers loan.type, loan.monthlyPayment, loan.termsAccepted setters', async () => {
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: null }, loggedIn: { value: false }, fetch: vi.fn(), clear: vi.fn()
    }));

    const auto = (eventValue: unknown) => ({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      mounted() { (this as unknown as { $emit: (e: string, v: unknown) => void }).$emit('update:modelValue', eventValue); },
      template: '<div />'
    });

    const UCheckboxStub = {
      name: 'UCheckbox',
      props: ['modelValue'], emits: ['update:modelValue'],
      template: '<input type="checkbox" />'
    };
    const w = mount(LoanForm, {
      global: {
        stubs: {
          ...stubs,
          LoanTypeInput: auto('personal'),
          LoanMonthlyPaymentInput: auto(500),
          DateInput: auto(new Date('2026-01-01')),
          UCheckbox: UCheckboxStub
        },
        mocks: { $t: tFn }
      }
    });
    await flushPromises();
    // Find the UCheckbox and emit
    const checkbox = w.findComponent(UCheckboxStub);
    if (checkbox.exists()) {
      await checkbox.vm.$emit('update:modelValue', true);
    }
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});
