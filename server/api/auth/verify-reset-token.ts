import { z } from 'zod';
import AuthService from '~~/server/services/auth.service';

const bodySchema = z.object({
  token: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const { token } = await readValidatedBody(event, bodySchema.parse);

    const result = await AuthService.verifyPasswordResetToken(token);

    return { valid: result.valid };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Token verification error:', error);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
