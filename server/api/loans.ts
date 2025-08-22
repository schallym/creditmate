import LoanService from '~~/server/services/loan.service';
import { LoanStatus, type LoanWithCalculations, type User } from '~~/server/types';

export type ListLoansResponse = {
  numberOfActiveLoans: number;
  formattedTotalRemainingBalance: string;
  formattedTotalMonthlyPayment: string;
  loans: LoanWithCalculations[];
};

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const loans = await LoanService.listLoansByUserId((user as User).id || 0);
  if (!loans || loans.length === 0) {
    return [];
  }

  const { locale } = useLocale(event);
  const loansWithCalculations = loans.map(loan => LoanService.calculateFormattedLoan(loan, locale));

  return {
    numberOfActiveLoans: loansWithCalculations.filter(loan => loan.status === LoanStatus.ACTIVE).length,
    formattedTotalRemainingBalance: LoanService.calculateFormattedTotalRemainingBalance(loansWithCalculations, locale),
    formattedTotalMonthlyPayment: LoanService.calculateFormattedTotalMonthlyPayment(loansWithCalculations, locale),
    loans: loans.map(loan => LoanService.calculateFormattedLoan(loan, locale))
  } as ListLoansResponse;
});
