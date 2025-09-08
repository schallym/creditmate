import { readBody, createError } from 'h3';
import { z } from 'zod';
import type { SignupDto } from '~~/server/dtos';
import AuthService from '~~/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  const body = await readBody(event);
  const parsed = AuthService.createSignupValidationSchema(t).safeParse(body);
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation error', data: z.treeifyError(parsed.error) });

  try {
    const user = await AuthService.createUser(parsed.data as SignupDto);

    return { user };
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('Email already exists')) {
      throw createError({
        statusCode: 409,
        message: t('auth.signup.validation.emailExists.message')
      });
    }
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
