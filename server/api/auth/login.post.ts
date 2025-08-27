import { z } from 'zod';
import AuthService from '~~/server/services/auth.service';

const bodySchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const badCredentialsMessage = t('auth.login.badCredentials.message');

  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await AuthService.getUserByEmail(email);
  if (!user) throw createError({ statusCode: 401, message: badCredentialsMessage });

  if (!(await AuthService.checkPassword(password, user)))
    throw createError({ statusCode: 401, message: badCredentialsMessage });

  await setUserSession(event, {
    user: {
      fullName: user.fullName,
      email: user.email,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});
