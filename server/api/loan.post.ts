import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { loanValidationSchema } from '~~/server/services';
import loanService from '~~/server/services/loan.service';
import type { CreateLoanDto } from '~~/server/dtos';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateLoanDto>(event);
    const validatedData = loanValidationSchema.parse(body);

    const loan = await loanService.createLoan(validatedData);

    setResponseStatus(event, 201);

    return { data: loan };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  } finally {
    await prisma.$disconnect();
  }
});
