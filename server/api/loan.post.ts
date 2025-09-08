import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import loanService from '~~/server/services/loan.service';
import type { CreateLoanDto } from '~~/server/dtos';
import type { Loan, User } from '~~/server/types';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  try {
    const body = await readBody<CreateLoanDto>(event);
    const validatedData: Loan = loanService.createLoanValidationSchema(t).parse(body);

    const { user } = await getUserSession(event);
    if (user) {
      validatedData.userId = (user as User).id;
    }

    const loan = await loanService.createLoan(validatedData);

    setResponseStatus(event, 201);

    return { data: loan };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: t('errors.validation.message'),
        data: error
      });
    }

    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  } finally {
    await prisma.$disconnect();
  }
});
