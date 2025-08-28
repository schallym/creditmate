import { z } from 'zod';
import { type EarlyRepaymentData, type Loan, LoanStatus, LoanType, type LoanWithCalculations } from '~~/server/types';
import type { CreateLoanDto, UpdateLoanDto } from '~~/server/dtos';
import { PrismaClient } from '@prisma/client';
import type { Loan as PrismaLoan } from '@prisma/client';
import { useFormatters, useTranslations } from '~~/server/utils';

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

  async updateLoan(id: number, data: UpdateLoanDto): Promise<PrismaLoan> {
    return this.prisma.loan.update({
      where: { id: id },
      data
    });
  }

  async listLoansByUserId(userId: number): Promise<Loan[]> {
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // We assume a maximum of 1000 loans per users.
      take: 1000
    });
  }

  calculateFormattedTotalRemainingBalance(loans: LoanWithCalculations[], locale: string = 'en'): string {
    const totalRemainingBalance = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    const formatters = useFormatters(locale);

    return formatters.formatMoney(totalRemainingBalance);
  }

  calculateFormattedTotalMonthlyPayment(loans: LoanWithCalculations[], locale: string = 'en'): string {
    const totalMonthlyPayment = loans.reduce(
      (sum, loan) => sum + (loan.remainingBalance > 0 ? (loan.monthlyPayment || 0) : 0),
      0
    );
    const formatters = useFormatters(locale);

    return formatters.formatMoney(totalMonthlyPayment);
  }

  calculateFormattedLoan(loan: Loan, locale: string): LoanWithCalculations {
    const formatters = useFormatters(locale);

    const nextPaymentDate = this.calculateNextPaymentDate(loan);
    const remainingBalance = this.calculateRemainingBalance(loan);
    const monthlyPayment = remainingBalance > 0 ? (loan.monthlyPayment || this.getMonthlyPayment(loan)) : 0;

    return {
      ...loan,
      monthlyPayment: monthlyPayment,
      repaymentDate: this.calculateRepaymentDate(loan),
      remainingBalance: remainingBalance,
      paidOffPercentage: this.calculatePaidOffPercentage(loan),
      numberOfPaymentsLeft: this.calculateNumberOfPaymentsLeft(loan),
      nextPaymentDate: nextPaymentDate,
      amountPaidOff: this.calculateAmountPaidOff(loan),
      totalInterest: this.calculateTotalInterest(loan),
      totalInterestPaidOff: this.calculateInterestPaidOff(loan),
      totalPaidOff: this.calculateTotalPaidOff(loan),
      nextMonthInterest: this.calculateNextPaymentInterestAmount(loan),
      nextMonthAmount: this.calculateNextPaymentAmount(loan),
      status: this.calculateStatus(loan),
      remainingBalanceProjectionData: this.calculateRemainingBalanceProjectionData(loan).map(
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
        monthlyPayment: formatters.formatMoney(monthlyPayment),
        interestRate: formatters.formatPercent(loan.interestRate),
        remainingBalance: formatters.formatMoney(remainingBalance),
        paidOffPercentage: formatters.formatPercent(this.calculatePaidOffPercentage(loan)),
        totalInterest: formatters.formatMoney(this.calculateTotalInterest(loan)),
        nextMonthInterest: formatters.formatMoney(this.calculateNextPaymentInterestAmount(loan)),
        nextMonthAmount: formatters.formatMoney(this.calculateNextPaymentAmount(loan)),
        repaymentDate: formatters.formatMonthYear(this.calculateRepaymentDate(loan)),
        nextPaymentDate: nextPaymentDate ? formatters.formatDate(nextPaymentDate) : null,
        totalPaidOff: formatters.formatMoney(this.calculateTotalPaidOff(loan)),
        totalInterestPaidOff: formatters.formatMoney(this.calculateInterestPaidOff(loan)),
        amountPaidOff: formatters.formatMoney(this.calculateAmountPaidOff(loan))
      }
    } as LoanWithCalculations;
  }

  async calculateEarlyRepayment(loanId: number, additionalMonthlyPayment?: number, oneTimePayment?: number, locale: string = 'en'): Promise<EarlyRepaymentData> {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });

    if (!loan) {
      throw new Error('Loan not found');
    }

    const originalMonthlyPayment = this.getMonthlyPayment(loan);
    const monthlyRate = loan.interestRate / 100 / 12;

    // Get current remaining balance based on payments made so far
    const currentBalance = this.calculateRemainingBalance(loan);
    const originalPaymentsLeft = this.calculateNumberOfPaymentsLeft(loan);

    // Calculate original scenario (without extra payments)
    const originalTotalInterest = this.calculateRemainingInterest(currentBalance, originalMonthlyPayment, monthlyRate);

    // Apply one-time payment first
    const oneTime = oneTimePayment && oneTimePayment > 0 ? oneTimePayment : 0;
    let newBalance = currentBalance - oneTime;
    if (newBalance < 0) newBalance = 0;

    // Calculate with additional monthly payments
    const additionalPayment = additionalMonthlyPayment && additionalMonthlyPayment > 0 ? additionalMonthlyPayment : 0;
    const totalMonthlyPayment = originalMonthlyPayment + additionalPayment;

    if (newBalance === 0) {
      const formatters = useFormatters(locale);
      return {
        newDuration: 0,
        timeSaved: formatters.formatDuration(originalPaymentsLeft),
        formattedInterestSavings: formatters.formatMoney(originalTotalInterest),
        newPayoffDate: formatters.formatMonthYear(new Date()),
        newPaidOffPercentage: 100,
        formattedNewMonthlyPayment: formatters.formatMoney(totalMonthlyPayment),
        formattedNewBalance: formatters.formatMoney(0)
      };
    }

    let months = 0;
    let totalInterestPaid = 0;
    let balance = newBalance;

    // Simulate monthly payments
    while (balance > 0) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = totalMonthlyPayment - interestPayment;

      // Handle final payment
      if (principalPayment >= balance) {
        principalPayment = balance;
        totalInterestPaid += (balance * monthlyRate);
        balance = 0;
      } else {
        balance -= principalPayment;
        totalInterestPaid += interestPayment;
      }

      months++;
    }

    const interestSavings = originalTotalInterest - totalInterestPaid;
    const monthsSaved = originalPaymentsLeft - months;

    // Calculate new paid off percentage
    const currentAmountPaidOff = this.calculateAmountPaidOff(loan);
    const totalAmountThatWillBePaidOff = currentAmountPaidOff + oneTime;
    const newPaidOffPercentage = Math.min(100, (totalAmountThatWillBePaidOff / loan.amount) * 100);

    const formatters = useFormatters(locale);
    const newPayoffDate = new Date();
    newPayoffDate.setMonth(newPayoffDate.getMonth() + months);

    return {
      newDuration: loan.termMonths - Math.max(0, monthsSaved),
      timeSaved: formatters.formatDuration(Math.max(0, monthsSaved)),
      formattedInterestSavings: formatters.formatMoney(Math.max(0, interestSavings)),
      formattedNewMonthlyPayment: formatters.formatMoney(totalMonthlyPayment),
      formattedNewBalance: formatters.formatMoney(Math.max(0, newBalance)),
      newPayoffDate: formatters.formatMonthYear(newPayoffDate),
      newPaidOffPercentage: Math.round(newPaidOffPercentage * 100) / 100
    };
  }

  private calculateRepaymentDate(loan: Loan): Date {
    const repaymentDate = new Date(loan.startDate);
    repaymentDate.setMonth(repaymentDate.getMonth() + loan.termMonths);

    return repaymentDate;
  }

  private calculateNumberOfPaymentsLeft(loan: Loan): number {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

    return Math.max(0, loan.termMonths - monthsDiff);
  }

  private calculateInterestPaidOff(loan: Loan): number {
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

  private calculateAmountPaidOff(loan: Loan): number {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const yearDiff = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();

    return Math.min(loan.amount, this.getMonthlyPayment(loan) * (yearDiff * 12 + monthDiff) - this.calculateInterestPaidOff(loan));
  }

  private calculateTotalPaidOff(loan: Loan): number {
    return Math.min(loan.amount, this.calculateAmountPaidOff(loan) + this.calculateInterestPaidOff(loan));
  }

  private calculateRemainingBalance(loan: Loan): number {
    return Math.max(0, loan.amount - this.calculateAmountPaidOff(loan));
  }

  private calculatePaidOffPercentage(loan: Loan): number {
    return Math.min(100, ((loan.amount - this.calculateRemainingBalance(loan)) / (loan.amount)) * 100);
  }

  private calculateNextPaymentDate(loan: Loan): Date | null {
    const startDate = new Date(loan.startDate);
    const now = new Date();
    const yearDiff = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();
    const monthsPassed = yearDiff * 12 + monthDiff;
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsPassed + 1);

    if (monthsPassed >= loan.termMonths) {
      return null;
    }

    return nextPaymentDate;
  }

  private calculateTotalInterest(loan: Loan): number {
    return this.getMonthlyPayment(loan) * loan.termMonths - (loan.amount);
  }

  private calculateNextPaymentInterestAmount(loan: Loan): number {
    return this.calculateRemainingBalance(loan) * this.calculateMonthlyRate(loan);
  }

  private calculateNextPaymentAmount(loan: Loan): number {
    if (this.calculateRemainingBalance(loan) <= 0) {
      return 0;
    }

    return this.getMonthlyPayment(loan) - this.calculateNextPaymentInterestAmount(loan);
  }

  private calculateRemainingBalanceProjectionData(loan: Loan): { month: number; remainingBalance: number }[] {
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

      if (month === totalMonths && balance > 0) {
        balance = 0;
      }

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

  private calculateStatus(loan: Loan): LoanStatus {
    const remainingBalance = this.calculateRemainingBalance(loan);
    const numberOfPaymentsLeft = this.calculateNumberOfPaymentsLeft(loan);

    if (remainingBalance <= 0) {
      return LoanStatus.COMPLETED;
    } else if (numberOfPaymentsLeft === 0) {
      return LoanStatus.COMPLETED;
    } else {
      return LoanStatus.ACTIVE;
    }
  }

  private calculateRemainingInterest(balance: number, monthlyPayment: number, monthlyRate: number): number {
    let totalInterest = 0;
    let currentBalance = balance;
    let months = 0;

    while (currentBalance > 0.01 && months < 600) {
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;

      if (principalPayment >= currentBalance) {
        totalInterest += (currentBalance * monthlyRate);
        break;
      }

      totalInterest += interestPayment;
      currentBalance -= principalPayment;
      months++;
    }

    return totalInterest;
  }
}

export default new LoanService();
