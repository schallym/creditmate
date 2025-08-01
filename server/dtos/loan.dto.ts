import type { Loan } from '~~/server/types';

export type CalculateMonthlyPaymentDto = {
  amount: number;
  interestRate: number;
  termMonths: number;
};

export type CreateLoanDto = Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>;
