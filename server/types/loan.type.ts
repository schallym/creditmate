import type { LoanType as PrismaLoanType } from '@prisma/client';

export type Loan = {
  id?: number;
  type: LoanType | PrismaLoanType;
  lenderName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  monthlyPayment?: number | null;
  description?: string | null;
  userId?: number | null;
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
  status: LoanStatus;
  remainingBalanceProjectionData: {
    month: number;
    remainingBalance: number;
    formatted: {
      month: string;
      remainingBalance: string;
    };
  }[];
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

export enum LoanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed'
}
