import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { LoanType, LoanStatus, type LoanWithCalculations } from '~~/server/types';

import LoanForm from '~/components/loan/LoanForm.vue';
import LoanTopCard from '~/components/loan/LoanTopCard.vue';
import EarlyRepaymentForm from '~/components/loan/early-repayment/EarlyRepaymentForm.vue';
import LoanMonthlyPaymentInput from '~/components/loan/form/LoanMonthlyPaymentInput.vue';
import LoanTypeInput from '~/components/loan/form/LoanTypeInput.vue';
import LoanListAnonym from '~/components/loan/list/LoanListAnonym.vue';
import LoanListDashboard from '~/components/loan/list/LoanListDashboard.vue';
import LoanListNoLoan from '~/components/loan/list/LoanListNoLoan.vue';
import LoanDashboardCard from '~/components/loan/list/dashboard/LoanDashboardCard.vue';
import LoanDashboardCards from '~/components/loan/list/dashboard/LoanDashboardCards.vue';
import LoansDashboardTopCards from '~/components/loan/list/dashboard/LoansDashboardTopCards.vue';
import NoLoanFeature from '~/components/loan/list/no-loans/NoLoanFeature.vue';
import LoanViewNextPayment from '~/components/loan/view/LoanViewNextPayment.vue';
import LoanViewPaymentsBreakdown from '~/components/loan/view/LoanViewPaymentsBreakdown.vue';
import LoanViewProgress from '~/components/loan/view/LoanViewProgress.vue';
import LoanViewRemainingBalanceProjection from '~/components/loan/view/LoanViewRemainingBalanceProjection.vue';
import LoanViewTopCards from '~/components/loan/view/LoanViewTopCards.vue';

const fullLoan: LoanWithCalculations = {
  id: 1, type: LoanType.PERSONAL, lenderName: 'Bank', amount: 10000, interestRate: 5,
  termMonths: 24, startDate: new Date('2025-01-01'), monthlyPayment: 500, description: '',
  remainingBalance: 5000, paidOffPercentage: 50, numberOfPaymentsLeft: 12,
  nextPaymentDate: new Date('2026-06-01'), amountPaidOff: 5000, totalInterest: 1000,
  totalInterestPaidOff: 250, totalPaidOff: 5000, nextMonthInterest: 50, nextMonthAmount: 450,
  status: LoanStatus.ACTIVE, repaymentDate: new Date('2027-01-01'),
  remainingBalanceProjectionData: [{
    month: 0, remainingBalance: 10000, formatted: { month: 'Jan 2025', remainingBalance: '10,000€' }
  }],
  formatted: {
    amount: '10,000€', monthlyPayment: '500€', interestRate: '5%',
    remainingBalance: '5,000€', paidOffPercentage: '50%', totalInterest: '1,000€',
    nextMonthInterest: '50€', nextMonthAmount: '450€', repaymentDate: 'Jan 2027',
    nextPaymentDate: '01/06/2026', totalPaidOff: '5,000€', totalInterestPaidOff: '250€',
    amountPaidOff: '5,000€'
  }
};

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const opts = (props: Record<string, unknown> = {}) => ({ props });

describe('Loan components smoke tests', () => {
  it('LoanForm mounts (no model value)', () => {
    expect(mountWithStubs(LoanForm).exists()).toBe(true);
  });
  it('LoanForm mounts with edit mode', () => {
    expect(mountWithStubs(LoanForm, opts({ modelValue: fullLoan, buttonText: 'Save', hideCancelButton: true })).exists()).toBe(true);
  });
  it('LoanTopCard mounts with required props', () => {
    expect(mountWithStubs(LoanTopCard, opts({ title: 'T', mainValue: '100€' })).exists()).toBe(true);
  });
  it('LoanTopCard mounts with optional props', () => {
    expect(mountWithStubs(LoanTopCard, opts({ title: 'T', mainValue: 100, subValue: 'sub', icon: 'i' })).exists()).toBe(true);
  });
  it('EarlyRepaymentForm mounts', () => {
    expect(mountWithStubs(EarlyRepaymentForm, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanMonthlyPaymentInput mounts', () => {
    expect(mountWithStubs(LoanMonthlyPaymentInput, opts({ modelValue: 100, loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanMonthlyPaymentInput mounts with no model value', () => {
    expect(mountWithStubs(LoanMonthlyPaymentInput, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanTypeInput mounts', () => {
    expect(mountWithStubs(LoanTypeInput, opts({ modelValue: LoanType.PERSONAL })).exists()).toBe(true);
  });
  it('LoanTypeInput mounts with no value', () => {
    expect(mountWithStubs(LoanTypeInput).exists()).toBe(true);
  });
  it('LoanListAnonym mounts', () => {
    expect(mountWithStubs(LoanListAnonym).exists()).toBe(true);
  });
  it('LoanListDashboard mounts', () => {
    expect(mountWithStubs(LoanListDashboard, opts({
      loans: [fullLoan], formattedTotalRemainingBalance: '5k€', formattedTotalMonthlyPayment: '500€', numberOfActiveLoans: 1
    })).exists()).toBe(true);
  });
  it('LoanListNoLoan mounts', () => {
    expect(mountWithStubs(LoanListNoLoan).exists()).toBe(true);
  });
  it('LoanDashboardCard mounts', () => {
    expect(mountWithStubs(LoanDashboardCard, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanDashboardCards mounts', () => {
    expect(mountWithStubs(LoanDashboardCards, opts({ loans: [fullLoan] })).exists()).toBe(true);
  });
  it('LoansDashboardTopCards mounts', () => {
    expect(mountWithStubs(LoansDashboardTopCards, opts({
      loans: [fullLoan], formattedTotalRemainingBalance: '5k€', formattedTotalMonthlyPayment: '500€', numberOfActiveLoans: 1
    })).exists()).toBe(true);
  });
  it('NoLoanFeature mounts', () => {
    expect(mountWithStubs(NoLoanFeature, opts({ title: 'T', text: 'X', icon: 'i' })).exists()).toBe(true);
  });
  it('LoanViewNextPayment mounts', () => {
    expect(mountWithStubs(LoanViewNextPayment, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanViewPaymentsBreakdown mounts', () => {
    expect(mountWithStubs(LoanViewPaymentsBreakdown, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanViewProgress mounts', () => {
    expect(mountWithStubs(LoanViewProgress, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanViewRemainingBalanceProjection mounts', () => {
    expect(mountWithStubs(LoanViewRemainingBalanceProjection, opts({ loan: fullLoan })).exists()).toBe(true);
  });
  it('LoanViewTopCards mounts', () => {
    expect(mountWithStubs(LoanViewTopCards, opts({ loan: fullLoan })).exists()).toBe(true);
  });
});
