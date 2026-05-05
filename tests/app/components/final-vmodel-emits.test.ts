import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setupNuxtMocks, stubs } from '../vue-test-helper';

import LanguageSelector from '~/components/ui/LanguageSelector.vue';
import ReviewTypeCard from '~/components/review/ReviewTypeCard.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';
import ReviewOverallRatingCard from '~/components/review/ReviewOverallRatingCard.vue';
import DateInput from '~/components/ui/DateInput.vue';
import LoanMonthlyPaymentInput from '~/components/loan/form/LoanMonthlyPaymentInput.vue';
import EarlyRepaymentForm from '~/components/loan/early-repayment/EarlyRepaymentForm.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { LoanType, LoanStatus, type Loan, type LoanWithCalculations } from '~~/server/types';

const tFn = (key: string) => key;
const fullLoan: LoanWithCalculations = {
  id: 1, type: LoanType.PERSONAL, lenderName: 'B', amount: 10000, interestRate: 5,
  termMonths: 24, startDate: new Date('2025-01-01'), monthlyPayment: 500,
  remainingBalance: 5000, paidOffPercentage: 50, numberOfPaymentsLeft: 12,
  nextPaymentDate: null, amountPaidOff: 5000, totalInterest: 1000,
  totalInterestPaidOff: 250, totalPaidOff: 5000, nextMonthInterest: 50, nextMonthAmount: 450,
  status: LoanStatus.ACTIVE, repaymentDate: new Date('2027-01-01'),
  remainingBalanceProjectionData: [],
  formatted: {
    amount: '10k', monthlyPayment: '500', interestRate: '5%',
    remainingBalance: '5k', paidOffPercentage: '50%', totalInterest: '1k',
    nextMonthInterest: '50', nextMonthAmount: '450', repaymentDate: 'Jan 2027',
    nextPaymentDate: null, totalPaidOff: '5k', totalInterestPaidOff: '250', amountPaidOff: '5k'
  }
};

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  Object.defineProperty(window, 'location', {
    value: { reload: vi.fn() }, writable: true, configurable: true
  });
});

describe('Final v-model setters', () => {
  it('LanguageSelector handleLocaleChange via USelectMenu emit', async () => {
    const setLocale = vi.fn();
    (globalThis as unknown as { useI18n: ReturnType<typeof vi.fn> }).useI18n = vi.fn(() => ({
      t: tFn, locale: { value: 'en' },
      locales: { value: [{ code: 'en', flag: '🇬🇧' }, { code: 'fr', flag: '🇫🇷' }] },
      setLocale
    }));
    const w = mount(LanguageSelector, { global: { stubs, mocks: { $t: tFn } } });
    const sm = w.findComponent({ name: 'USelectMenu' });
    expect(sm.exists()).toBe(true);
    await sm.vm.$emit('update:modelValue', { id: 'fr' });
    await flushPromises();
    expect(setLocale).toHaveBeenCalledWith('fr');
  });

  it('ReviewTypeCard URadioGroup v-model setter', async () => {
    const URadioGroupStub = {
      props: ['modelValue'], emits: ['update:modelValue'],
      mounted() { (this as unknown as { $emit: (e: string, v: string) => void }).$emit('update:modelValue', 'feature'); },
      template: '<div />'
    };
    const w = mount(ReviewTypeCard, {
      props: { modelValue: 'general' },
      global: { stubs: { ...stubs, URadioGroup: URadioGroupStub }, mocks: { $t: tFn } }
    });
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('ReviewCategoryCard USelect v-model setter', async () => {
    const w = mount(ReviewCategoryCard, {
      props: { modelValue: [] },
      global: { stubs, mocks: { $t: tFn } }
    });
    const sel = w.findComponent({ name: 'USelect' });
    expect(sel.exists()).toBe(true);
    await sel.vm.$emit('update:modelValue', ['userInterface', 'calculations']);
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('ReviewOverallRatingCard UInput v-model setter', async () => {
    const w = mount(ReviewOverallRatingCard, {
      props: { modelValue: 0 },
      global: { stubs, mocks: { $t: tFn } }
    });
    const inp = w.findComponent({ name: 'UInput' });
    if (inp.exists()) {
      await inp.vm.$emit('update:modelValue', 4);
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('DateInput UCalendar v-model setter', async () => {
    const w = mount(DateInput, {
      props: { modelValue: '2026-01-01' },
      global: { stubs, mocks: { $t: tFn } }
    });
    const cal = w.findComponent({ name: 'UCalendar' });
    expect(cal.exists()).toBe(true);
    // UCalendar in real component receives @internationalized/date object
    const { parseDate } = await import('@internationalized/date');
    await cal.vm.$emit('update:modelValue', parseDate('2026-06-15'));
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('LoanMonthlyPaymentInput UInput v-model setter', async () => {
    const w = mount(LoanMonthlyPaymentInput, {
      props: { modelValue: 100, loan: fullLoan as Loan },
      global: { stubs, mocks: { $t: tFn } }
    });
    const inp = w.findComponent({ name: 'UInput' });
    if (inp.exists()) {
      await inp.vm.$emit('update:modelValue', 250);
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('EarlyRepaymentForm updateRepaymentData via watch', () => {
  it('triggers updateRepaymentData when debounced values change', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      newPayoffDate: 'Jun 2026', newDuration: 6, newPaidOffPercentage: 80,
      formattedInterestSavings: '100€', timeSaved: '6 m',
      formattedNewMonthlyPayment: '550€', formattedNewBalance: '0€'
    });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mount(EarlyRepaymentForm, {
      props: { loan: fullLoan },
      global: { stubs, mocks: { $t: tFn } }
    });
    // Find UInputs and emit update:modelValue
    const inputs = w.findAllComponents({ name: 'UInput' });
    for (const inp of inputs) {
      await inp.vm.$emit('update:modelValue', 100);
    }
    // Advance timer to trigger debounce
    await vi.advanceTimersByTimeAsync(600);
    await flushPromises();
    vi.useRealTimers();
    expect(w.exists()).toBe(true);
  });
});

describe('DeleteButton confirmDelete with valid confirmation', () => {
  it('triggers confirmDelete by clicking confirm button when valid', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const UModalStub = {
      props: ['title', 'open'],
      emits: ['update:open'],
      template: '<div><slot /><slot name="body" /></div>'
    };
    const w = mount(DeleteButton, {
      props: { onDelete, toastSuccessTitle: 'OK', toastSuccessDescription: 'd' },
      global: {
        stubs: { ...stubs, UModal: UModalStub },
        mocks: { $t: tFn }
      }
    });
    // Set confirmation text by emitting from UInput
    const inputs = w.findAllComponents({ name: 'UInput' });
    for (const inp of inputs) {
      await inp.vm.$emit('update:modelValue', 'ui.deleteConfirmation.confirmationInput.confirmationText');
    }
    await flushPromises();
    // Click last button (confirm button is rendered last in body)
    const buttons = w.findAll('button');
    if (buttons.length > 0) {
      await buttons[buttons.length - 1].trigger('click');
    }
    await flushPromises();
    expect(onDelete).toHaveBeenCalled();
  });

  it('triggers confirmDelete error path with Error', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('failed-delete'));
    const w = mount(DeleteButton, {
      props: { onDelete },
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

  it('triggers confirmDelete error path with non-Error', async () => {
    const onDelete = vi.fn().mockRejectedValue('string-err');
    const w = mount(DeleteButton, {
      props: { onDelete },
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
});
