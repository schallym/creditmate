import type { CalculateEarlyRepaymentDto } from '~~/server/dtos';
import loanService from '~~/server/services/loan.service';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CalculateEarlyRepaymentDto>(event);
    const { additionalMonthlyPayment, oneTimePayment } = body;
    const loanId: number = Number(getRouterParam(event, 'id'));

    const { locale } = useLocale(event);

    return loanService.calculateEarlyRepayment(loanId, additionalMonthlyPayment, oneTimePayment, locale);
  } catch (error) {
    // Handle other errors
    console.error('Early repayment calculation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
});
