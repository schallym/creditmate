import { readBody, createError } from 'h3';
import { z } from 'zod';
import type { SignupDto } from '~~/server/dtos';
import { signupValidationSchema } from '~~/server/services';
import AuthService from '~~/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = signupValidationSchema.safeParse(body);
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation error', data: z.treeifyError(parsed.error) });

  try {
    const user = await AuthService.createUser(parsed.data as SignupDto);

    return { user };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Email already exists')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already used'
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
