import { z } from 'zod';
import AuthService from '~~/server/services/auth.service';

const bodySchema = z.object({
  email: z.email()
});

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const { email } = await readValidatedBody(event, bodySchema.parse);

    const result = await AuthService.createPasswordResetToken(email);

    if (result.success) {
      return { success: true, message: t('auth.forgotPassword.toast.success.description') };
    } else {
      throw createError({
        statusCode: 500,
        message: result.message || t('auth.forgotPassword.toast.error.description')
      });
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.statusCode) {
      throw error;
    }

    console.error('Forgot password error:', error);
    throw createError({
      statusCode: 500,
      message: t('auth.forgotPassword.toast.error.description')
    });
  }
});
