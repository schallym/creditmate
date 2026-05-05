import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockCreateUser, mockGetUserByEmail, mockCheckPassword,
  mockCreatePasswordResetToken, mockResetPassword, mockVerifyPasswordResetToken,
  mockFindOrCreateOAuthUser, mockCreateSignupValidationSchema
} = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockGetUserByEmail: vi.fn(),
  mockCheckPassword: vi.fn(),
  mockCreatePasswordResetToken: vi.fn(),
  mockResetPassword: vi.fn(),
  mockVerifyPasswordResetToken: vi.fn(),
  mockFindOrCreateOAuthUser: vi.fn(),
  mockCreateSignupValidationSchema: vi.fn()
}));

vi.mock('~~/server/services/auth.service', () => ({
  default: {
    createUser: mockCreateUser,
    getUserByEmail: mockGetUserByEmail,
    checkPassword: mockCheckPassword,
    createPasswordResetToken: mockCreatePasswordResetToken,
    resetPassword: mockResetPassword,
    verifyPasswordResetToken: mockVerifyPasswordResetToken,
    findOrCreateOAuthUser: mockFindOrCreateOAuthUser,
    createSignupValidationSchema: mockCreateSignupValidationSchema
  }
}));

const event = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as unknown as { setUserSession: ReturnType<typeof vi.fn> }).setUserSession = vi.fn();
  (globalThis as unknown as { clearUserSession: ReturnType<typeof vi.fn> }).clearUserSession = vi.fn();
  (globalThis as unknown as { sendRedirect: ReturnType<typeof vi.fn> }).sendRedirect = vi.fn();
  (globalThis as unknown as { readBody: ReturnType<typeof vi.fn> }).readBody = vi.fn();
  (globalThis as unknown as { readValidatedBody: ReturnType<typeof vi.fn> }).readValidatedBody = vi.fn();
});

describe('POST /api/auth/login', () => {
  it('throws 401 when user not found', async () => {
    const handler = (await import('~~/server/api/auth/login.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com', password: 'p' });
    mockGetUserByEmail.mockResolvedValue(null);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 when password is wrong', async () => {
    const handler = (await import('~~/server/api/auth/login.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com', password: 'p' });
    mockGetUserByEmail.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(false);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('sets user session on success', async () => {
    const handler = (await import('~~/server/api/auth/login.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com', password: 'p' });
    mockGetUserByEmail.mockResolvedValue({
      id: 1, fullName: 'J', email: 'a@b.com', passwordHash: 'h', salt: 's',
      authProvider: 'credentials', createdAt: new Date(), updatedAt: new Date()
    });
    mockCheckPassword.mockResolvedValue(true);
    await handler(event);
    expect(globalThis.setUserSession).toHaveBeenCalledWith(event, expect.objectContaining({
      user: expect.objectContaining({ email: 'a@b.com', authProvider: 'credentials' })
    }));
  });
});

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    mockCreateSignupValidationSchema.mockReturnValue({
      safeParse: (b: unknown) => ({ success: true, data: b })
    });
  });

  it('returns 400 on validation failure', async () => {
    const handler = (await import('~~/server/api/auth/signup.post')).default;
    mockCreateSignupValidationSchema.mockReturnValue({
      safeParse: () => ({ success: false, error: { issues: [] } })
    });
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('returns user on success', async () => {
    const handler = (await import('~~/server/api/auth/signup.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreateUser.mockResolvedValue({ id: 1 });
    const result = await handler(event);
    expect(result).toEqual({ user: { id: 1 } });
  });

  it('returns 409 when email already exists', async () => {
    const handler = (await import('~~/server/api/auth/signup.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreateUser.mockRejectedValue(new Error('Email already exists'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('returns 500 on generic error', async () => {
    const handler = (await import('~~/server/api/auth/signup.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreateUser.mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the session', async () => {
    const handler = (await import('~~/server/api/auth/logout.post')).default;
    await handler(event);
    expect(globalThis.clearUserSession).toHaveBeenCalledWith(event);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns success message', async () => {
    const handler = (await import('~~/server/api/auth/forgot-password')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreatePasswordResetToken.mockResolvedValue({ success: true });
    const result = await handler(event);
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it('throws 500 when service returns failure', async () => {
    const handler = (await import('~~/server/api/auth/forgot-password')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreatePasswordResetToken.mockResolvedValue({ success: false, message: 'oops' });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });

  it('throws 500 when service returns failure without message', async () => {
    const handler = (await import('~~/server/api/auth/forgot-password')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ email: 'a@b.com' });
    mockCreatePasswordResetToken.mockResolvedValue({ success: false });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });

  it('rethrows existing error with statusCode', async () => {
    const handler = (await import('~~/server/api/auth/forgot-password')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockImplementation(() => {
      const err = new Error('bad') as Error & { statusCode: number };
      err.statusCode = 422;
      throw err;
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('catches non-statusCode errors and throws 500', async () => {
    const handler = (await import('~~/server/api/auth/forgot-password')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('zod'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/auth/reset-password schema refine triggers', () => {
  it('triggers refine fn when passwords do NOT match (rejects)', async () => {
    // Use real readValidatedBody to actually run schema refine
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockImplementation(async (_event, parser) => {
      // Call the parser with mismatched passwords to trigger refine
      try {
        return parser({ token: 't', password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'Differs1234567890' });
      } catch (e) {
        throw e;
      }
    });
    await expect(handler(event)).rejects.toBeTruthy();
  });

  it('triggers refine fn when passwords MATCH (passes)', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockImplementation(async (_event, parser) => {
      return parser({ token: 't', password: 'Aaaaaaaaaaaaaaa1!', confirmPassword: 'Aaaaaaaaaaaaaaa1!' });
    });
    mockResetPassword.mockResolvedValue({ success: true });
    const result = await handler(event);
    expect(result).toBeTruthy();
  });
});

describe('POST /api/auth/reset-password', () => {
  it('returns success on success', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 't', password: 'p' });
    mockResetPassword.mockResolvedValue({ success: true });
    const result = await handler(event);
    expect(result.success).toBe(true);
  });

  it('throws 400 when service returns failure', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 't', password: 'p' });
    mockResetPassword.mockResolvedValue({ success: false, message: 'bad' });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 with default message when service returns failure without message', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 't', password: 'p' });
    mockResetPassword.mockResolvedValue({ success: false });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rethrows existing statusCode error', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockImplementation(() => {
      const err = new Error('e') as Error & { statusCode: number };
      err.statusCode = 422;
      throw err;
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('catches generic errors and throws 500', async () => {
    const handler = (await import('~~/server/api/auth/reset-password.post')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/auth/verify-reset-token', () => {
  it('returns valid status', async () => {
    const handler = (await import('~~/server/api/auth/verify-reset-token')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 't' });
    mockVerifyPasswordResetToken.mockResolvedValue({ valid: true });
    expect(await handler(event)).toEqual({ valid: true });
  });

  it('throws 500 on internal error', async () => {
    const handler = (await import('~~/server/api/auth/verify-reset-token')).default;
    (globalThis.readValidatedBody as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('GET /api/auth/google', () => {
  it('creates session and redirects to /loans on success', async () => {
    const config = (await import('~~/server/api/auth/google.get')).default as unknown as {
      onSuccess: (event: unknown, payload: { user: { email: string; name: string } }) => Promise<unknown>;
      onError: (event: unknown, error: unknown) => unknown;
      config: { scope: string[] };
    };
    mockFindOrCreateOAuthUser.mockResolvedValue({
      id: 1, fullName: 'J', email: 'a@b.com', authProvider: 'google',
      createdAt: new Date(), updatedAt: new Date()
    });
    await config.onSuccess(event, { user: { email: 'a@b.com', name: 'J' } });
    expect(mockFindOrCreateOAuthUser).toHaveBeenCalledWith({
      email: 'a@b.com', fullName: 'J', provider: 'google'
    });
    expect(globalThis.setUserSession).toHaveBeenCalled();
    expect(globalThis.sendRedirect).toHaveBeenCalledWith(event, '/loans');
  });

  it('redirects to login with error param on failure', async () => {
    const config = (await import('~~/server/api/auth/google.get')).default as unknown as {
      onError: (event: unknown, error: Error) => unknown;
    };
    config.onError(event, new Error('fail'));
    expect(globalThis.sendRedirect).toHaveBeenCalledWith(event, '/auth/login?error=oauth');
  });

  it('configures with email + profile scope', async () => {
    const config = (await import('~~/server/api/auth/google.get')).default as unknown as {
      config: { scope: string[] };
    };
    expect(config.config.scope).toEqual(['email', 'profile']);
  });
});
