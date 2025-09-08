import { z } from 'zod';
import AuthService from '~~/server/services/auth.service';

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(16).regex(
    new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$')
  ),
  confirmPassword: z.string()
}).refine(
  data => data.password === data.confirmPassword,
  { path: ['confirmPassword'], message: 'Passwords do not match' }
);

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const { token, password } = await readValidatedBody(event, bodySchema.parse);

    const result = await AuthService.resetPassword(token, password);

    if (result.success) {
      return { success: true, message: t('auth.resetPassword.toast.success.description') };
    } else {
      throw createError({
        statusCode: 400,
        message: result.message || t('auth.resetPassword.toast.error.description')
      });
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.statusCode) {
      throw error;
    }

    console.error('Password reset error:', error);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
