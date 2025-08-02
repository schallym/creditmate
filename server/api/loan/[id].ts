import prisma from '~~/server/prisma/prisma-client';
import loanService from '~~/server/services/loan.service';
import { useLocale } from '~~/server/utils/useLocale';
import { useFormatters } from '~~/server/utils/useFormatters';
import type { LoanWithCalculations } from '~~/server/types';

export default defineEventHandler(async (event) => {
  try {
    const { locale } = useLocale(event);
    const formatters = useFormatters(locale);

    const id: number = Number(getRouterParam(event, 'id'));
    const loan = await prisma.loan.findUnique({ where: { id: id } });

    // Check if loan exists
    if (!loan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Loan not found'
      });
    }

    return {
      ...loan,
      repaymentDate: loanService.calculateRepaymentDate(loan),
      remainingBalance: loanService.calculateRemainingBalance(loan),
      paidOffPercentage: loanService.calculatePaidOffPercentage(loan),
      numberOfPaymentsLeft: loanService.calculateNumberOfPaymentsLeft(loan),
      nextPaymentDate: loanService.calculateNextPaymentDate(loan),
      amountPaidOff: loanService.calculateAmountPaidOff(loan),
      totalInterest: loanService.calculateTotalInterest(loan),
      totalInterestPaidOff: loanService.calculateInterestPaidOff(loan),
      totalPaidOff: loanService.calculateTotalPaidOff(loan),
      nextMonthInterest: loanService.calculateNextPaymentInterestAmount(loan),
      nextMonthAmount: loanService.calculateNextPaymentAmount(loan),
      remainingBalanceProjectionData: loanService.calculateRemainingBalanceProjectionData(loan).map(
        (data) => {
          const startDate = new Date(loan.startDate);
          const targetDate = new Date(startDate);
          targetDate.setMonth(startDate.getMonth() + data.month);

          return {
            month: data.month,
            remainingBalance: data.remainingBalance,
            formatted: {
              month: formatters.formatMonthYear(targetDate),
              remainingBalance: formatters.formatMoney(data.remainingBalance)
            }
          };
        }),
      formatted: {
        amount: formatters.formatMoney(loan.amount),
        monthlyPayment: formatters.formatMoney(loan.monthlyPayment || 0),
        interestRate: formatters.formatPercent(loan.interestRate),
        remainingBalance: formatters.formatMoney(loanService.calculateRemainingBalance(loan)),
        paidOffPercentage: formatters.formatPercent(loanService.calculatePaidOffPercentage(loan)),
        totalInterest: formatters.formatMoney(loanService.calculateTotalInterest(loan)),
        nextMonthInterest: formatters.formatMoney(loanService.calculateNextPaymentInterestAmount(loan)),
        nextMonthAmount: formatters.formatMoney(loanService.calculateNextPaymentAmount(loan)),
        repaymentDate: formatters.formatMonthYear(loanService.calculateRepaymentDate(loan)),
        nextPaymentDate: formatters.formatDate(loanService.calculateNextPaymentDate(loan)),
        totalPaidOff: formatters.formatMoney(loanService.calculateTotalPaidOff(loan)),
        totalInterestPaidOff: formatters.formatMoney(loanService.calculateInterestPaidOff(loan)),
        amountPaidOff: formatters.formatMoney(loanService.calculateAmountPaidOff(loan))
      }
    } as LoanWithCalculations;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Re-throw createError instances
    if (error.statusCode) {
      throw error;
    }

    // Handle other errors
    console.error('Loan fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
)
;
