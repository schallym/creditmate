import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import type { SignupDto } from '~~/server/dtos';
import type { FilteredUser, User } from '~~/server/types';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { mailer } from '~~/server/services/mailer.service';
import type { TFunction } from '~~/server/utils';

class AuthService {
  prisma = new PrismaClient();

  createSignupValidationSchema = (t: (key: string) => string) => {
    return z.object({
      fullName: z.string().min(1, t('auth.property.fullName.validation.required')),
      email: z.email(t('auth.property.email.validation.invalid')),
      password: z.string().min(16, t('auth.property.password.validation.minLength'))
        .regex(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$'), t('auth.property.password.validation.pattern')),
      confirmPassword: z.string(),
      terms: z.boolean().refine(val => val, {
        message: t('auth.property.terms.validation.accept')
      })
    }).refine(
      data => data.password === data.confirmPassword,
      { path: ['confirmPassword'], message: t('auth.property.confirmPassword.validation.match') }
    );
  };

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
      console.error(error);
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

  async createPasswordResetToken(email: string, t: TFunction, locale: string): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.warn('Password reset requested for non-existent email:', email);
        // Don't reveal if email exists or not for security
        return { success: true };
      }

      // Generate new token
      const token = this.generateResetToken(user.id!, email);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

      // Store token in user record
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token
        }
      });

      // Send email with reset link
      const config = useRuntimeConfig();
      const resetUrl = `${config.public.appUrl}/auth/reset-password?token=${token}`;

      await this.sendPasswordResetEmail(user.email, resetUrl, t, locale);

      return { success: true };
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw new Error('Failed to create password reset token');
    }
  }

  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: number }> {
    try {
      // First verify JWT signature and decode
      const decodedToken = this.verifyResetToken(token);
      if (!decodedToken) {
        return { valid: false };
      }

      // Check if token exists in database and hasn't expired
      const user = await this.prisma.user.findUnique({
        where: {
          id: decodedToken.userId,
          email: decodedToken.email,
          passwordResetToken: token
        }
      });

      if (!user) {
        return { valid: false };
      }

      return { valid: true, userId: user.id };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const verification = await this.verifyPasswordResetToken(token);

      if (!verification.valid || !verification.userId) {
        return { success: false, message: 'Invalid or expired token' };
      }

      // Hash the new password
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      // Update user password and clear reset token
      await this.prisma.user.update({
        where: { id: verification.userId },
        data: {
          passwordHash: hashedPassword,
          salt,
          passwordResetToken: null
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  private generateResetToken(userId: number, email: string): string {
    const config = useRuntimeConfig();
    const payload = {
      userId,
      email,
      type: 'password-reset'
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '1h',
      issuer: 'creditmate',
      audience: 'password-reset'
    });
  }

  private async sendPasswordResetEmail(email: string, resetUrl: string, t: TFunction, locale: string = 'fr'): Promise<void> {
    const subject = t('auth.forgotPassword.email.subject');

    await mailer.sendLocalizedTemplatedMail(email, subject, locale, 'reset-password', { resetUrl: resetUrl });
  }

  private verifyResetToken(token: string): { userId: number; email: string } | null {
    try {
      const config = useRuntimeConfig();
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'creditmate',
        audience: 'password-reset'
      }) as { userId: number; email: string; type: string };

      if (decoded.type !== 'password-reset') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

export default new AuthService();
