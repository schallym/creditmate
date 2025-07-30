import { z } from 'zod';
import { LoanType } from '~~/server/interfaces';
import enLocale from '~/i18n/locales/en.json';

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
    startDate: z.date({ message: t('loan.form.fields.startDate.validation.required') }),
    description: z.string().optional()
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTranslations(key: string, translations: any): string {
  return key.split('.').reduce((obj, k) => obj?.[k], translations) || key;
}

// Default schema using English translations from locale file
export const loanValidationSchema = createLoanValidationSchema((key: string) => {
  return getTranslations(key, enLocale);
});

export function calculateMonthlyPayment(
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
