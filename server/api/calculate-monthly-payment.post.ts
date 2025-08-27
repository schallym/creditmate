import type { CalculateMonthlyPaymentDto } from '~~/server/dtos';
import loanService from '~~/server/services/loan.service';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CalculateMonthlyPaymentDto>(event);
    const { amount, interestRate, termMonths } = body;

    return {
      monthlyPayment: parseFloat(loanService.calculateMonthlyPayment(amount, interestRate, termMonths).toFixed(2))
    };
  } catch (error) {
    // Handle other errors
    console.error('Monthly payment calculation error:', error);
    const t = await useTranslation(event);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
