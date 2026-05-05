import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { LoanType, LoanStatus, type LoanWithCalculations } from '~~/server/types';

import LoanViewPaymentBreakdownChart from '~/components/loan/view/LoanViewPaymentBreakdownChart.client.vue';
import LoanViewRemainingBalanceProjectionChart from '~/components/loan/view/LoanViewRemainingBalanceProjectionChart.client.vue';
import App from '~/app.vue';
import ErrorPage from '~/error.vue';
import DefaultLayout from '~/layouts/default.vue';

const fullLoan: LoanWithCalculations = {
  id: 1, type: LoanType.PERSONAL, lenderName: 'B', amount: 10000, interestRate: 5,
  termMonths: 24, startDate: new Date('2025-01-01'), monthlyPayment: 500,
  remainingBalance: 5000, paidOffPercentage: 50, numberOfPaymentsLeft: 12,
  nextPaymentDate: null, amountPaidOff: 5000, totalInterest: 1000,
  totalInterestPaidOff: 250, totalPaidOff: 5000, nextMonthInterest: 50, nextMonthAmount: 450,
  status: LoanStatus.ACTIVE, repaymentDate: new Date('2027-01-01'),
  remainingBalanceProjectionData: [{
    month: 0, remainingBalance: 10000, formatted: { month: 'Jan', remainingBalance: '10k€' }
  }],
  formatted: {
    amount: '10k€', monthlyPayment: '500€', interestRate: '5%',
    remainingBalance: '5k€', paidOffPercentage: '50%', totalInterest: '1k€',
    nextMonthInterest: '50€', nextMonthAmount: '450€', repaymentDate: 'Jan 2027',
    nextPaymentDate: null, totalPaidOff: '5k€', totalInterestPaidOff: '250€', amountPaidOff: '5k€'
  }
};

beforeEach(() => {
  setupNuxtMocks();
  (globalThis as unknown as { useAppConfig: ReturnType<typeof vi.fn> }).useAppConfig = vi.fn(() => ({ toaster: {} }));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Chart components', () => {
  it('LoanViewPaymentBreakdownChart mounts', () => {
    expect(mountWithStubs(LoanViewPaymentBreakdownChart, { props: { loan: fullLoan } }).exists()).toBe(true);
  });
  it('LoanViewRemainingBalanceProjectionChart mounts', () => {
    expect(mountWithStubs(LoanViewRemainingBalanceProjectionChart, { props: { loan: fullLoan } }).exists()).toBe(true);
  });
});

describe('App + Error + Layout', () => {
  it('app.vue mounts', () => {
    expect(mountWithStubs(App).exists()).toBe(true);
  });
  it('error.vue mounts with error prop', () => {
    expect(mountWithStubs(ErrorPage, {
      props: { error: { statusCode: 500, message: 'Boom' } }
    }).exists()).toBe(true);
  });
  it('error.vue mounts without error prop', () => {
    expect(mountWithStubs(ErrorPage).exists()).toBe(true);
  });
  it('default layout mounts', () => {
    expect(mountWithStubs(DefaultLayout, { slots: { default: '<div>page</div>' } }).exists()).toBe(true);
  });
});
