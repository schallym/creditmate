import { z } from 'zod';
import AuthService from '~~/server/services/auth.service';

const bodySchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await AuthService.getUserByEmail(email);
  if (!user) throw createError({ statusCode: 401, message: 'Bad credentials', statusMessage: 'Bad credentials' });

  if (!(await AuthService.checkPassword(password, user)))
    throw createError({ statusCode: 401, message: 'Bad credentials', statusMessage: 'Bad credentials' });

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
