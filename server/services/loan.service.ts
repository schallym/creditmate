import { z } from 'zod';
import { type Loan, LoanType } from '~~/server/types';
import type { CreateLoanDto } from '~~/server/dtos';
import { PrismaClient } from '@prisma/client';
import type { Loan as PrismaLoan } from '@prisma/client';
import { useTranslations } from '~~/server/utils';

export const createLoanValidationSchema = (t: (key: string) => string) => {
  return z.object({
    type: z.enum(LoanType, { message: t('loan.form.fields.type.validation.required') }),
    lenderName: z.string().min(1, { message: t('loan.form.fields.lenderName.validation.required') }),
    amount: z.number({ message: t('loan.form.fields.amount.validation.required') })
      .gt(0, { message: t('loan.form.fields.amount.validation.mustBePositive') }),
    interestRate: z.number({ message: t('loan.form.fields.interestRate.validation.required') })
      .gt(0, { message: t('loan.form.fields.interestRate.validation.mustBePositive') })
      .max(100, { message: t('loan.form.fields.interestRate.validation.maxValue') }),
    termMonths: z.number({ message: t('loan.form.fields.term.validation.required') })
      .min(1, { message: t('loan.form.fields.term.validation.minValue') }),
    monthlyPayment: z.number().optional(),
    startDate: z.coerce.date({ message: t('loan.form.fields.startDate.validation.required') }),
    description: z.string().optional()
  });
};

// Default schema using English translations from locale file
export const loanValidationSchema = createLoanValidationSchema((key: string) => {
  return useTranslations(key);
});

class LoanService {
  prisma = new PrismaClient();

  calculateMonthlyPayment(
    amount: number,
    interestRate: number,
    termMonths: number
  ): number {
    if (interestRate === 0) {
      return amount / termMonths;
    }

    const monthlyRate = interestRate / 100 / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

    return parseFloat(payment.toFixed(2));
  }

  async createLoan(data: CreateLoanDto): Promise<PrismaLoan> {
    return this.prisma.loan.create({ data });
  }

  calculateRepaymentDate(loan: Loan): Date {
    const repaymentDate = new Date(loan.startDate);
    repaymentDate.setMonth(repaymentDate.getMonth() + loan.termMonths);

    return repaymentDate;
  }

  calculateNumberOfPaymentsLeft(loan: Loan): number {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

    return Math.max(0, loan.termMonths - monthsDiff);
  }

  calculateInterestPaidOff(loan: Loan): number {
    const diffMonths = Math.max(0, loan.termMonths - this.calculateNumberOfPaymentsLeft(loan));
    const monthlyRate = this.calculateMonthlyRate(loan);
    const monthly = loan.monthlyPayment || this.getMonthlyPayment(loan);
    let balance = loan.amount;
    let interestPaid = 0;

    for (let m = 1; m <= diffMonths && m <= loan.termMonths; m++) {
      const interest = balance * monthlyRate;
      const principalPaid = monthly - interest;
      balance -= principalPaid;
      interestPaid += interest;
    }

    return interestPaid;
  }

  calculateAmountPaidOff(loan: Loan): number {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const yearDiff = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();

    return this.getMonthlyPayment(loan) * (yearDiff * 12 + monthDiff) - this.calculateInterestPaidOff(loan);
  }

  calculateTotalPaidOff(loan: Loan): number {
    return this.calculateAmountPaidOff(loan) + this.calculateInterestPaidOff(loan);
  }

  calculateRemainingBalance(loan: Loan): number {
    return loan.amount - this.calculateAmountPaidOff(loan);
  }

  calculatePaidOffPercentage(loan: Loan): number {
    return ((loan.amount - this.calculateRemainingBalance(loan)) / (loan.amount)) * 100;
  }

  calculateNextPaymentDate(loan: Loan): Date {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const yearDiff = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();
    const monthsPassed = yearDiff * 12 + monthDiff;
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsPassed + 1);

    return nextPaymentDate;
  }

  calculateTotalInterest(loan: Loan): number {
    return this.getMonthlyPayment(loan) * loan.termMonths - (loan.amount);
  }

  calculateNextPaymentInterestAmount(loan: Loan): number {
    return this.calculateRemainingBalance(loan) * this.calculateMonthlyRate(loan);
  }

  calculateNextPaymentAmount(loan: Loan): number {
    return this.getMonthlyPayment(loan) - this.calculateNextPaymentInterestAmount(loan);
  }

  calculateRemainingBalanceProjectionData(loan: Loan): { month: number; remainingBalance: number }[] {
    const projectionData: { month: number; remainingBalance: number }[] = [
      { month: 0, remainingBalance: parseFloat((loan.amount).toFixed(2)) }
    ];
    const monthlyPayment = this.getMonthlyPayment(loan);
    const monthlyRate = this.calculateMonthlyRate(loan);
    let balance = loan.amount;
    const totalMonths = loan.termMonths;

    for (let month = 1; month <= totalMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPaid = monthlyPayment - interest;
      balance -= principalPaid;

      projectionData.push({
        month: month,
        remainingBalance: Math.max(0, parseFloat(balance.toFixed(2)))
      });
    }

    return projectionData;
  }

  private getMonthlyPayment(loan: Loan): number {
    if (!loan.monthlyPayment || loan.monthlyPayment <= 0) {
      return this.calculateMonthlyPayment(loan.amount, loan.interestRate, loan.termMonths);
    }
    return loan.monthlyPayment;
  }

  private calculateMonthlyRate(loan: Loan): number {
    if (!loan.interestRate || !loan.interestRate) return 0;

    const monthlyRate = loan.interestRate / 12 / 100;

    return parseFloat(monthlyRate.toFixed(5));
  }
}

export default new LoanService();
