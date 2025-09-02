import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import type { SignupDto } from '~~/server/dtos';
import type { FilteredUser, User } from '~~/server/types';
import { PrismaClient } from '@prisma/client';

class AuthService {
  prisma = new PrismaClient();

  createSignupValidationSchema = (t: (key: string) => string) => {
    return z.object({
      fullName: z.string().min(1, t('auth.property.fullName.validation.required'))
    });
  };

  signupValidationSchema = this.createSignupValidationSchema((key: string) => {
    return 'useTranslations(key)';
  });

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
