import type { H3Event } from 'h3';
import type { UpdateProfileDto } from '~~/server/dtos';
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

  const data = await readBody<UpdateProfileDto>(event);

  try {
    await UserService.updateProfile((user as User)?.id || 0, data);

    await setUserSession(event, {
      user: {
        fullName: data.fullName,
        email: data.email,
        id: (user as User).id,
        createdAt: (user as User).createdAt,
        updatedAt: (user as User).updatedAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
