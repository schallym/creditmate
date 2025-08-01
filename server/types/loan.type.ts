import type { LoanType as PrismaLoanType } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

export type Loan = {
  id?: number;
  type: LoanType | PrismaLoanType;
  lenderName: string;
  amount: number | Decimal;
  interestRate: number | Decimal;
  termMonths: number;
  startDate: Date;
  monthlyPayment?: number | Decimal | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LoanWithCalculations = Loan & {
  repaymentDate: Date;
  remainingBalance: number;
  paidOffPercentage: number;
  numberOfPaymentsLeft: number;
  nextPaymentDate: Date;
  amountPaidOff: number;
  totalInterest: number;
  totalInterestPaidOff: number;
  totalPaidOff: number;
  nextMonthInterest: number;
  nextMonthAmount: number;
  formatted: {
    amount: string;
    monthlyPayment: string;
    interestRate: string;
    remainingBalance: string;
    paidOffPercentage: string;
    totalInterest: string;
    nextMonthInterest: string;
    nextMonthAmount: string;
    repaymentDate: string;
    nextPaymentDate: string;
    totalPaidOff: string;
    totalInterestPaidOff: string;
    amountPaidOff: string;
  };
};

export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  AUTO = 'auto',
  STUDENT = 'student',
  OTHER = 'other'
}
