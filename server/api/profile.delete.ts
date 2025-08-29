import type { H3Event } from 'h3';
import UserService from '~~/server/services/user.service';
import type { User } from '~~/server/types';

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

  try {
    await UserService.delete((user as User)?.id || 0);
    await clearUserSession(event);
  } catch (error) {
    console.error('Profile update error:', error);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
