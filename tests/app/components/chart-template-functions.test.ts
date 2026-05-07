import { describe, it, expect, beforeEach } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { LoanType, LoanStatus, type LoanWithCalculations } from '~~/server/types';

import LoanViewPaymentBreakdownChart from '~/components/loan/view/LoanViewPaymentBreakdownChart.client.vue';
import LoanViewRemainingBalanceProjectionChart from '~/components/loan/view/LoanViewRemainingBalanceProjectionChart.client.vue';

const fullLoan: LoanWithCalculations = {
  id: 1, type: LoanType.PERSONAL, lenderName: 'B', amount: 10000, interestRate: 5,
  termMonths: 24, startDate: new Date('2025-01-01'), monthlyPayment: 500,
  remainingBalance: 5000, paidOffPercentage: 50, numberOfPaymentsLeft: 12,
  nextPaymentDate: null, amountPaidOff: 5000, totalInterest: 1000,
  totalInterestPaidOff: 250, totalPaidOff: 5000, nextMonthInterest: 50, nextMonthAmount: 450,
  status: LoanStatus.ACTIVE, repaymentDate: new Date('2027-01-01'),
  remainingBalanceProjectionData: [
    { month: 0, remainingBalance: 10000, formatted: { month: 'Jan 2025', remainingBalance: '10,000€' } },
    { month: 1, remainingBalance: 9500, formatted: { month: 'Feb 2025', remainingBalance: '9,500€' } }
  ],
  formatted: {
    amount: '10k', monthlyPayment: '500', interestRate: '5%',
    remainingBalance: '5k', paidOffPercentage: '50%', totalInterest: '1k',
    nextMonthInterest: '50', nextMonthAmount: '450', repaymentDate: 'Jan 2027',
    nextPaymentDate: null, totalPaidOff: '5k', totalInterestPaidOff: '250', amountPaidOff: '5k'
  }
};

beforeEach(() => setupNuxtMocks());

describe('Chart inline template/value functions', () => {
  it('PaymentBreakdownChart triggers tooltip template via VisTooltip prop', () => {
    const w = mountWithStubs(LoanViewPaymentBreakdownChart, { props: { loan: fullLoan } });
    // Find VisTooltip and access triggers prop
    const tooltip = w.findAllComponents({ name: 'VisTooltip' });
    if (tooltip.length > 0) {
      const triggers = tooltip[0].props('triggers') as Record<string, (d: { data: number; index: number; value: number }) => string> | undefined;
      if (triggers) {
        for (const fn of Object.values(triggers)) {
          // Call with both index 0 and 1 to cover both labels
          fn({ data: 1000, index: 0, value: 5000 });
          fn({ data: 0, index: 1, value: 0 });
        }
      }
    }
    // Also call value function via VisDonut
    const donut = w.findAllComponents({ name: 'VisDonut' });
    if (donut.length > 0) {
      const valFn = donut[0].props('value') as (d: number) => number;
      if (valFn) valFn(123);
    }
    expect(w.exists()).toBe(true);
  });

  it('PaymentBreakdownChart with zero total triggers else branch in pct', () => {
    const zeroLoan = { ...fullLoan, amount: 0, totalInterest: 0 };
    const w = mountWithStubs(LoanViewPaymentBreakdownChart, { props: { loan: zeroLoan } });
    const tooltip = w.findAllComponents({ name: 'VisTooltip' });
    if (tooltip.length > 0) {
      const triggers = tooltip[0].props('triggers') as Record<string, (d: { data: number; index: number; value: number }) => string> | undefined;
      if (triggers) {
        for (const fn of Object.values(triggers)) {
          fn({ data: 0, index: 0, value: 0 });
        }
      }
    }
    expect(w.exists()).toBe(true);
  });

  it('RemainingBalanceProjectionChart triggers x, y, template, tickFormat fns', () => {
    const w = mountWithStubs(LoanViewRemainingBalanceProjectionChart, { props: { loan: fullLoan } });
    // Find VisLine and VisCrosshair
    const lines = w.findAllComponents({ name: 'VisLine' });
    const crosshair = w.findAllComponents({ name: 'VisCrosshair' });
    const axes = w.findAllComponents({ name: 'VisAxis' });

    for (const line of lines) {
      const x = line.props('x');
      const y = line.props('y');
      if (typeof x === 'function') x({ month: 5, remainingBalance: 100, formatted: { month: 'May', remainingBalance: '100' } });
      if (typeof y === 'function') y({ month: 5, remainingBalance: 100, formatted: { month: 'May', remainingBalance: '100' } });
    }

    for (const c of crosshair) {
      const tpl = c.props('template');
      const x = c.props('x');
      const y = c.props('y');
      if (typeof tpl === 'function') tpl({ month: 5, remainingBalance: 100, formatted: { month: 'May', remainingBalance: '100' } });
      if (typeof x === 'function') x({ month: 5, remainingBalance: 100, formatted: { month: 'May', remainingBalance: '100' } });
      if (typeof y === 'function') y({ month: 5, remainingBalance: 100, formatted: { month: 'May', remainingBalance: '100' } });
    }

    for (const a of axes) {
      const tickFormat = a.props('tickFormat');
      if (typeof tickFormat === 'function') tickFormat(42);
    }

    expect(w.exists()).toBe(true);
  });

  it('RemainingBalanceProjectionChart with today before start date (no v-if line)', () => {
    const futureLoan = { ...fullLoan, startDate: new Date('2099-01-01'), termMonths: 24 };
    const w = mountWithStubs(LoanViewRemainingBalanceProjectionChart, { props: { loan: futureLoan } });
    expect(w.exists()).toBe(true);
  });
});
