import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import type { SignupDto } from '~~/server/dtos';
import { useTranslations } from '~~/server/utils';
import type { FilteredUser, User } from '~~/server/types';
import { PrismaClient } from '@prisma/client';

export const createSignupValidationSchema = (t: (key: string) => string) => {
  return z.object({
    fullName: z.string().min(1, t('auth.property.fullName.validation.required')),
    email: z.email(t('auth.property.email.validation.invalid')),
    password: z.string().min(1, t('auth.property.password.validation.required'))
      .min(16, t('auth.property.password.validation.minLength'))
      .regex(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$'), t('auth.property.password.validation.pattern')),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v: boolean) => v, { message: t('auth.property.terms.validation.accept') })
  }).refine(
    (data: SignupDto) => data.password === data.confirmPassword,
    { path: ['confirmPassword'], message: t('auth.property.confirmPassword.validation.match') }
  );
};

// Default schema using English translations from locale file
export const signupValidationSchema = createSignupValidationSchema((key: string) => {
  return useTranslations(key);
});

class AuthService {
  prisma = new PrismaClient();

  async createUser(signupDto: SignupDto): Promise<FilteredUser> {
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(signupDto.password, salt);

    const data: User = {
      fullName: signupDto.fullName,
      email: signupDto.email,
      passwordHash: hashedPassword,
      salt: salt
    };

    try {
      const user = await this.prisma.user.create({ data });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async checkPassword(
    password: string,
    user: Pick<User, 'passwordHash' | 'salt'>
  ): Promise<boolean> {
    const hashedPassword = await bcryptjs.hash(password, user.salt);

    return hashedPassword === user.passwordHash;
  }
}

export default new AuthService();
