import prisma from '~~/server/prisma/prisma-client';
import loanService from '~~/server/services/loan.service';
import type { H3Event } from 'h3';
import { useLocale } from '~~/server/utils';
import type { User } from '~~/server/types';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { locale } = useLocale(event);
    const id: number = Number(getRouterParam(event, 'id'));
    const loan = await prisma.loan.findUnique({ where: { id: id } });

    // Check if loan exists
    if (!loan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Loan not found'
      });
    }

    if (loan.userId) {
      const { user } = await getUserSession(event);
      if (!user || (user as User).id !== loan.userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden'
        });
      }
    }

    return loanService.calculateFormattedLoan(loan, locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Re-throw createError instances
    if (error.statusCode) {
      throw error;
    }

    // Handle other errors
    console.error('Loan fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  } finally {
    await prisma.$disconnect();
  }
});
