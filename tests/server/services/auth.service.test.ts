import { describe, it, expect, vi, beforeEach } from 'vitest';

import AuthService from '~~/server/services/auth.service';

const {
  mockUserFindUnique, mockUserCreate, mockUserUpdate,
  mockHash, mockGenSalt,
  mockJwtSign, mockJwtVerify,
  mockSendLocalizedTemplatedMail
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockHash: vi.fn(),
  mockGenSalt: vi.fn(),
  mockJwtSign: vi.fn(),
  mockJwtVerify: vi.fn(),
  mockSendLocalizedTemplatedMail: vi.fn()
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
      update: mockUserUpdate
    }
  }))
}));

vi.mock('bcryptjs', () => ({
  default: { hash: mockHash, genSalt: mockGenSalt }
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: mockJwtSign, verify: mockJwtVerify }
}));

vi.mock('~~/server/services/mailer.service', () => ({
  mailer: { sendLocalizedTemplatedMail: mockSendLocalizedTemplatedMail }
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('AuthService.createSignupValidationSchema', () => {
  const t = (k: string) => k;
  const schema = AuthService.createSignupValidationSchema(t);

  it('accepts valid signup data', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'a@b.com',
      password: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!',
      terms: true
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'a@b.com',
      password: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Bbbbbbbbbbbbbbb1!',
      terms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fullName', () => {
    const result = schema.safeParse({
      fullName: '',
      email: 'a@b.com',
      password: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!',
      terms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'not-email',
      password: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!',
      terms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'a@b.com',
      password: 'short',
      confirmPassword: 'short',
      terms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without complexity', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'a@b.com',
      password: 'aaaaaaaaaaaaaaaa',
      confirmPassword: 'aaaaaaaaaaaaaaaa',
      terms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects unaccepted terms', () => {
    const result = schema.safeParse({
      fullName: 'John',
      email: 'a@b.com',
      password: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!',
      terms: false
    });
    expect(result.success).toBe(false);
  });
});

describe('AuthService.createUser', () => {
  it('creates user with hashed password', async () => {
    mockGenSalt.mockResolvedValue('salt-x');
    mockHash.mockResolvedValue('hash-x');
    mockUserCreate.mockResolvedValue({
      id: 1,
      fullName: 'John',
      email: 'a@b.com',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02')
    });

    const result = await AuthService.createUser({
      fullName: 'John',
      email: 'a@b.com',
      password: 'Pwd',
      confirmPassword: 'Pwd',
      terms: true
    });

    expect(mockGenSalt).toHaveBeenCalledWith(12);
    expect(mockHash).toHaveBeenCalledWith('Pwd', 'salt-x');
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: {
        fullName: 'John',
        email: 'a@b.com',
        passwordHash: 'hash-x',
        salt: 'salt-x'
      }
    });
    expect(result.id).toBe(1);
    expect(result.email).toBe('a@b.com');
  });

  it('throws "Email already exists" on unique constraint violation', async () => {
    mockGenSalt.mockResolvedValue('s');
    mockHash.mockResolvedValue('h');
    mockUserCreate.mockRejectedValue(new Error('Unique constraint failed on email'));

    await expect(
      AuthService.createUser({
        fullName: 'J', email: 'a@b.com', password: 'P', confirmPassword: 'P', terms: true
      })
    ).rejects.toThrow('Email already exists');
  });

  it('rethrows generic errors', async () => {
    mockGenSalt.mockResolvedValue('s');
    mockHash.mockResolvedValue('h');
    mockUserCreate.mockRejectedValue(new Error('DB down'));

    await expect(
      AuthService.createUser({
        fullName: 'J', email: 'a@b.com', password: 'P', confirmPassword: 'P', terms: true
      })
    ).rejects.toThrow('DB down');
  });

  it('rethrows non-Error thrown values', async () => {
    mockGenSalt.mockResolvedValue('s');
    mockHash.mockResolvedValue('h');
    mockUserCreate.mockRejectedValue('string error');

    await expect(
      AuthService.createUser({
        fullName: 'J', email: 'a@b.com', password: 'P', confirmPassword: 'P', terms: true
      })
    ).rejects.toBe('string error');
  });
});

describe('AuthService.getUserByEmail', () => {
  it('queries Prisma by email', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });
    const result = await AuthService.getUserByEmail('a@b.com');
    expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    expect(result).toEqual({ id: 1, email: 'a@b.com' });
  });
});

describe('AuthService.checkPassword', () => {
  it('returns false when passwordHash is null', async () => {
    expect(await AuthService.checkPassword('p', { passwordHash: null, salt: 's' })).toBe(false);
  });

  it('returns false when salt is null', async () => {
    expect(await AuthService.checkPassword('p', { passwordHash: 'h', salt: null })).toBe(false);
  });

  it('returns true when hash matches', async () => {
    mockHash.mockResolvedValue('matching-hash');
    expect(await AuthService.checkPassword('p', { passwordHash: 'matching-hash', salt: 's' })).toBe(true);
  });

  it('returns false when hash does not match', async () => {
    mockHash.mockResolvedValue('not-matching');
    expect(await AuthService.checkPassword('p', { passwordHash: 'expected', salt: 's' })).toBe(false);
  });
});

describe('AuthService.findOrCreateOAuthUser', () => {
  it('returns existing user when email already registered', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 5, fullName: 'Jane', email: 'j@b.com', authProvider: 'credentials',
      createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-02')
    });
    const result = await AuthService.findOrCreateOAuthUser({
      email: 'j@b.com', fullName: 'Jane', provider: 'google'
    });
    expect(result.id).toBe(5);
    expect(result.authProvider).toBe('credentials');
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it('creates new user when email is unknown', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: 7, fullName: 'New', email: 'n@b.com', authProvider: 'google',
      createdAt: new Date(), updatedAt: new Date()
    });
    const result = await AuthService.findOrCreateOAuthUser({
      email: 'n@b.com', fullName: 'New', provider: 'google'
    });
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: { email: 'n@b.com', fullName: 'New', authProvider: 'google' }
    });
    expect(result.id).toBe(7);
    expect(result.authProvider).toBe('google');
  });
});

describe('AuthService.createPasswordResetToken', () => {
  const t = (k: string) => k;

  it('returns success=true silently when user does not exist', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const result = await AuthService.createPasswordResetToken('x@y.com', t, 'en');
    expect(result.success).toBe(true);
    expect(mockJwtSign).not.toHaveBeenCalled();
    expect(mockSendLocalizedTemplatedMail).not.toHaveBeenCalled();
  });

  it('generates token, stores it, and sends email', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 9, email: 'a@b.com' });
    mockJwtSign.mockReturnValue('jwt-token');
    mockUserUpdate.mockResolvedValue({});
    mockSendLocalizedTemplatedMail.mockResolvedValue(undefined);

    const result = await AuthService.createPasswordResetToken('a@b.com', t, 'fr');
    expect(result.success).toBe(true);
    expect(mockJwtSign).toHaveBeenCalledWith(
      { userId: 9, email: 'a@b.com', type: 'password-reset' },
      'test-secret',
      { expiresIn: '1h', issuer: 'creditmate', audience: 'password-reset' }
    );
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { passwordResetToken: 'jwt-token' }
    });
    expect(mockSendLocalizedTemplatedMail).toHaveBeenCalledWith(
      'a@b.com',
      'auth.forgotPassword.email.subject',
      'fr',
      'reset-password',
      { resetUrl: 'http://localhost:3000/auth/reset-password?token=jwt-token' }
    );
  });

  it('throws on database error', async () => {
    mockUserFindUnique.mockRejectedValue(new Error('DB error'));
    await expect(AuthService.createPasswordResetToken('a@b.com', t, 'en'))
      .rejects.toThrow('Failed to create password reset token');
  });
});

describe('AuthService.verifyPasswordResetToken', () => {
  it('returns invalid when JWT verify throws', async () => {
    mockJwtVerify.mockImplementation(() => {
      throw new Error('bad');
    });
    expect(await AuthService.verifyPasswordResetToken('bad-token')).toEqual({ valid: false });
  });

  it('returns invalid when token type is not password-reset', async () => {
    mockJwtVerify.mockReturnValue({ userId: 1, email: 'a@b.com', type: 'other' });
    expect(await AuthService.verifyPasswordResetToken('t')).toEqual({ valid: false });
  });

  it('returns invalid when token not found in DB', async () => {
    mockJwtVerify.mockReturnValue({ userId: 1, email: 'a@b.com', type: 'password-reset' });
    mockUserFindUnique.mockResolvedValue(null);
    expect(await AuthService.verifyPasswordResetToken('t')).toEqual({ valid: false });
  });

  it('returns valid + userId when token matches DB', async () => {
    mockJwtVerify.mockReturnValue({ userId: 3, email: 'a@b.com', type: 'password-reset' });
    mockUserFindUnique.mockResolvedValue({ id: 3 });
    expect(await AuthService.verifyPasswordResetToken('t')).toEqual({ valid: true, userId: 3 });
  });

  it('handles outer try/catch when DB call throws', async () => {
    mockJwtVerify.mockReturnValue({ userId: 3, email: 'a@b.com', type: 'password-reset' });
    mockUserFindUnique.mockRejectedValue(new Error('DB'));
    expect(await AuthService.verifyPasswordResetToken('t')).toEqual({ valid: false });
  });
});

describe('AuthService.resetPassword', () => {
  it('returns failure on invalid token', async () => {
    mockJwtVerify.mockImplementation(() => {
      throw new Error('bad');
    });
    const result = await AuthService.resetPassword('bad', 'newPwd');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired token');
  });

  it('updates password and clears reset token', async () => {
    mockJwtVerify.mockReturnValue({ userId: 4, email: 'a@b.com', type: 'password-reset' });
    mockUserFindUnique.mockResolvedValue({ id: 4 });
    mockGenSalt.mockResolvedValue('s');
    mockHash.mockResolvedValue('h');
    mockUserUpdate.mockResolvedValue({});
    const result = await AuthService.resetPassword('t', 'newPwd');
    expect(result.success).toBe(true);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { passwordHash: 'h', salt: 's', passwordResetToken: null }
    });
  });

  it('returns failure on DB error', async () => {
    mockJwtVerify.mockReturnValue({ userId: 4, email: 'a@b.com', type: 'password-reset' });
    mockUserFindUnique.mockResolvedValue({ id: 4 });
    mockGenSalt.mockResolvedValue('s');
    mockHash.mockResolvedValue('h');
    mockUserUpdate.mockRejectedValue(new Error('DB'));
    const result = await AuthService.resetPassword('t', 'newPwd');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to reset password');
  });
});
