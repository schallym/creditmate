import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import loanService from '~~/server/services/loan.service';
import type { UpdateLoanDto } from '~~/server/dtos';
import type { Loan, User } from '~~/server/types';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const data = await readBody<UpdateLoanDto>(event);
    const validatedData: Loan = loanService.createLoanValidationSchema(t).parse(data);

    const loan = await prisma.loan.findUnique({ where: { id: data.id } });

    if (!loan) {
      throw createError({
        statusCode: 404,
        statusMessage: t('errors.notFound.message')
      });
    }

    const { user } = await getUserSession(event);
    if (user && loan.userId !== (user as User).id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: t('errors.unauthorized.message')
      });
    }

    await loanService.updateLoan(data.id ?? 0, validatedData);

    setResponseStatus(event, 201);

    return { data: loan };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const t = await useTranslation(event);
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: t('errors.validation.message'),
        data: error
      });
    }

    if (error.statusCode) {
      throw error;
    }

    console.error('Loan update error:', error);

    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  } finally {
    await prisma.$disconnect();
  }
});
