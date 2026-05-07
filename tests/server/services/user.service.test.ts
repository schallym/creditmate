import { describe, it, expect, vi, beforeEach } from 'vitest';

import UserService from '~~/server/services/user.service';

const { mockUserFindUnique, mockUserUpdate, mockUserDelete, mockLoanDeleteMany, mockHash, mockGenSalt } = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockUserDelete: vi.fn(),
  mockLoanDeleteMany: vi.fn(),
  mockHash: vi.fn(),
  mockGenSalt: vi.fn()
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: { findUnique: mockUserFindUnique, update: mockUserUpdate, delete: mockUserDelete },
    loan: { deleteMany: mockLoanDeleteMany }
  }))
}));

vi.mock('bcryptjs', () => ({
  default: { hash: mockHash, genSalt: mockGenSalt }
}));

beforeEach(() => vi.clearAllMocks());

describe('UserService', () => {
  it('getById queries by id', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 1 });
    const result = await UserService.getById(1);
    expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ id: 1 });
  });

  it('updateProfile passes data through', async () => {
    mockUserUpdate.mockResolvedValue({});
    await UserService.updateProfile(2, { fullName: 'New' });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 2 }, data: { fullName: 'New' }
    });
  });

  it('updatePassword hashes and stores new password', async () => {
    mockGenSalt.mockResolvedValue('salt-x');
    mockHash.mockResolvedValue('hash-x');
    mockUserUpdate.mockResolvedValue({});

    await UserService.updatePassword(3, 'newPwd');

    expect(mockGenSalt).toHaveBeenCalledWith(12);
    expect(mockHash).toHaveBeenCalledWith('newPwd', 'salt-x');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { passwordHash: 'hash-x', salt: 'salt-x' }
    });
  });

  it('delete removes loans first then user', async () => {
    mockLoanDeleteMany.mockResolvedValue({ count: 2 });
    mockUserDelete.mockResolvedValue({});

    await UserService.delete(5);

    expect(mockLoanDeleteMany).toHaveBeenCalledWith({ where: { userId: 5 } });
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(mockLoanDeleteMany.mock.invocationCallOrder[0])
      .toBeLessThan(mockUserDelete.mock.invocationCallOrder[0]);
  });
});
