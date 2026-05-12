import { z } from 'zod';
import { type Loan, LoanType } from '~~/server/types';
import loanService from '~~/server/services/loan.service';
import { useLocale } from '~~/server/utils';

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const body = await readBody(event);
    const schema = z.object({
      type: z.enum(LoanType).optional().default(LoanType.PERSONAL),
      lenderName: z.string().optional().default('Simulation'),
      amount: z.number().gt(0),
      interestRate: z.number().gt(0).max(100),
      termMonths: z.number().min(1),
      monthlyPayment: z.number().optional(),
      startDate: z.coerce.date(),
      description: z.string().optional()
    });
    const parsed = schema.parse(body);

    const monthlyPayment = parsed.monthlyPayment && parsed.monthlyPayment > 0
      ? parsed.monthlyPayment
      : loanService.calculateMonthlyPayment(parsed.amount, parsed.interestRate, parsed.termMonths);

    const loan: Loan = {
      type: parsed.type,
      lenderName: parsed.lenderName,
      amount: parsed.amount,
      interestRate: parsed.interestRate,
      termMonths: parsed.termMonths,
      monthlyPayment,
      startDate: parsed.startDate,
      description: parsed.description
    };

    const { locale } = useLocale(event);
    const formattedLoan = loanService.calculateFormattedLoan(loan, locale);

    return { data: formattedLoan };
  } catch (error) {
    console.error('Loan simulation error:', error);
    throw createError({
      statusCode: 400,
      message: t('errors.validation.message')
    });
  }
});
