import type { H3Event } from 'h3';
import type { UpdatePasswordDto } from '~~/server/dtos';
import UserService from '~~/server/services/user.service';
import type { User } from '~~/server/types';
import AuthService from '~~/server/services/auth.service';
import { z } from 'zod';

export default defineEventHandler(async (event: H3Event) => {
  const { user } = await getUserSession(event);
  const t = await useTranslation(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: t('errors.unauthorized.message')
    });
  }

  const data = await readBody<UpdatePasswordDto>(event);

  const validationSchema = z.object({
    currentPassword: z.string().min(1, t('auth.profile.changePassword.form.currentPassword.validation.required')),
    newPassword: z.string().min(1, t('auth.property.password.validation.required'))
      .min(16, t('auth.property.password.validation.minLength'))
      .regex(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$'), t('auth.property.password.validation.pattern')),
    confirmPassword: z.string()
  }).refine(
    (data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword,
    { path: ['confirmPassword'], message: t('auth.property.confirmPassword.validation.match') }
  );

  const parsed = validationSchema.safeParse(data);
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation error', data: z.treeifyError(parsed.error) });

  const fullUser = await UserService.getById((user as User).id || 0);
  if (!fullUser) {
    throw createError({
      statusCode: 404,
      message: t('errors.notFound.message')
    });
  }

  if (!(await AuthService.checkPassword(data.currentPassword, fullUser))) {
    throw createError({
      statusCode: 400,
      message: t('auth.profile.changePassword.form.currentPassword.validation.incorrect')
    });
  }

  try {
    await UserService.updatePassword((user as User)?.id || 0, data.newPassword);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.statusCode) {
      throw error;
    }

    console.error('Password update error:', error);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
