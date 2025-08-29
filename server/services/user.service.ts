import type { UpdatePasswordDto, UpdateProfileDto } from '~~/server/dtos';
import { PrismaClient } from '@prisma/client';
import type { User } from '~~/server/types';
import bcryptjs from 'bcryptjs';

class UserService {
  prisma = new PrismaClient();

  async getById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: id }
    });
  }

  async updateProfile(id: number, data: UpdateProfileDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: id },
      data: data
    });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await this.prisma.user.update({
      where: { id: id },
      data: {
        passwordHash: hashedPassword,
        salt: salt
      }
    });
  }

  async delete(id: number): Promise<void> {
    // Delete user loans first due to foreign key constraint
    await this.prisma.loan.deleteMany({
      where: { userId: id }
    });

    // Then delete the user
    await this.prisma.user.delete({
      where: { id: id }
    });
  }
}

export default new UserService();
