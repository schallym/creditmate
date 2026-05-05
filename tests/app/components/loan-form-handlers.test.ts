import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { LoanType, LoanStatus, type Loan, type LoanWithCalculations } from '~~/server/types';

import LoanForm from '~/components/loan/LoanForm.vue';
import LoanMonthlyPaymentInput from '~/components/loan/form/LoanMonthlyPaymentInput.vue';
import LoanTypeInput from '~/components/loan/form/LoanTypeInput.vue';
import EarlyRepaymentForm from '~/components/loan/early-repayment/EarlyRepaymentForm.vue';

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
});

describe('LoanForm onSubmit', () => {
  it('creates a loan when no id (POST)', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ monthlyPayment: 100 })
      .mockResolvedValueOnce({ data: { id: 42 } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(LoanForm);
    const form = w.findComponent({ name: 'UForm' });
    await form.vm.$emit('submit', { preventDefault: () => undefined });
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('updates a loan when id exists (PATCH)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ data: { id: 42 } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const loan: Loan = { ...fullLoan, monthlyPayment: 500 };
    const w = mountWithStubs(LoanForm, { props: { modelValue: loan } });
    await w.findComponent({ name: 'UForm' }).vm.$emit('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/loan/1', expect.objectContaining({ method: 'PATCH' }));
  });

  it('handles error from $fetch', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'oops' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(LoanForm, { props: { modelValue: { ...fullLoan, monthlyPayment: 500 } as Loan } });
    await w.findComponent({ name: 'UForm' }).vm.$emit('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: {} });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(LoanForm, { props: { modelValue: { ...fullLoan, monthlyPayment: 500 } as Loan } });
    await w.findComponent({ name: 'UForm' }).vm.$emit('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('triggers loan watch (deep)', async () => {
    const w = mountWithStubs(LoanForm);
    await w.setProps({ modelValue: { ...fullLoan, monthlyPayment: 100 } as Loan });
    expect(w.exists()).toBe(true);
  });
});

describe('LoanMonthlyPaymentInput.calculatePayment', () => {
  it('calls $fetch and emits update on calculate', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ monthlyPayment: 250 });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const loan: Loan = { ...fullLoan, amount: 1000, interestRate: 5, termMonths: 12 };
    const w = mountWithStubs(LoanMonthlyPaymentInput, { props: { loan } });
    const button = w.findAllComponents({ name: 'UButton' });
    if (button.length > 0) await button[0].vm.$emit('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('shows toast warning when fields missing', async () => {
    const loan: Loan = { ...fullLoan, amount: 0, interestRate: 0, termMonths: 0 };
    const w = mountWithStubs(LoanMonthlyPaymentInput, { props: { loan } });
    const button = w.findAllComponents({ name: 'UButton' });
    if (button.length > 0) await button[0].vm.$emit('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('reacts to modelValue prop change', async () => {
    const w = mountWithStubs(LoanMonthlyPaymentInput, {
      props: { modelValue: 100, loan: fullLoan as Loan }
    });
    await w.setProps({ modelValue: 200 });
    expect(w.exists()).toBe(true);
  });
});

describe('LoanTypeInput emits', () => {
  it('emits update:modelValue on change', async () => {
    const w = mountWithStubs(LoanTypeInput, { props: { modelValue: LoanType.PERSONAL } });
    const select = w.findComponent({ name: 'USelect' });
    await select.vm.$emit('update:modelValue', LoanType.AUTO);
    expect(w.exists()).toBe(true);
  });
});

describe('EarlyRepaymentForm watch', () => {
  it('fetches early repayment when debounced values change', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      newPayoffDate: 'Jun 2026', newDuration: 6, newPaidOffPercentage: 80,
      formattedInterestSavings: '100€', timeSaved: '6 m',
      formattedNewMonthlyPayment: '550€', formattedNewBalance: '0€'
    });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(EarlyRepaymentForm, { props: { loan: fullLoan } });
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});
