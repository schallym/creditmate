import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetById, mockUpdateProfile, mockUpdatePassword, mockDelete,
  mockCheckPassword, mockHandleReview
} = vi.hoisted(() => ({
  mockGetById: vi.fn(),
  mockUpdateProfile: vi.fn(),
  mockUpdatePassword: vi.fn(),
  mockDelete: vi.fn(),
  mockCheckPassword: vi.fn(),
  mockHandleReview: vi.fn()
}));

vi.mock('~~/server/services/user.service', () => ({
  default: {
    getById: mockGetById,
    updateProfile: mockUpdateProfile,
    updatePassword: mockUpdatePassword,
    delete: mockDelete
  }
}));

vi.mock('~~/server/services/auth.service', () => ({
  default: { checkPassword: mockCheckPassword }
}));

vi.mock('~~/server/services/review.service', () => ({
  default: { handleReview: mockHandleReview }
}));

const event = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as unknown as { getUserSession: ReturnType<typeof vi.fn> }).getUserSession = vi.fn();
  (globalThis as unknown as { setUserSession: ReturnType<typeof vi.fn> }).setUserSession = vi.fn();
  (globalThis as unknown as { clearUserSession: ReturnType<typeof vi.fn> }).clearUserSession = vi.fn();
  (globalThis as unknown as { readBody: ReturnType<typeof vi.fn> }).readBody = vi.fn();
});

describe('PATCH /api/profile', () => {
  it('throws 401 when no session', async () => {
    const handler = (await import('~~/server/api/profile.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('updates profile and refreshes session', async () => {
    const handler = (await import('~~/server/api/profile.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 1, createdAt: 'c', updatedAt: 'u' }
    });
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ fullName: 'New', email: 'n@b.com' });
    mockUpdateProfile.mockResolvedValue(undefined);
    await handler(event);
    expect(mockUpdateProfile).toHaveBeenCalledWith(1, { fullName: 'New', email: 'n@b.com' });
    expect(globalThis.setUserSession).toHaveBeenCalled();
  });

  it('handles user without id', async () => {
    const handler = (await import('~~/server/api/profile.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: null } });
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ fullName: 'X', email: 'x@b.com' });
    mockUpdateProfile.mockResolvedValue(undefined);
    await handler(event);
    expect(mockUpdateProfile).toHaveBeenCalledWith(0, expect.anything());
  });

  it('throws 500 on update failure', async () => {
    const handler = (await import('~~/server/api/profile.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({});
    mockUpdateProfile.mockRejectedValue(new Error('db'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('DELETE /api/profile', () => {
  it('throws 401 when no session', async () => {
    const handler = (await import('~~/server/api/profile.delete')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('deletes user and clears session', async () => {
    const handler = (await import('~~/server/api/profile.delete')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockResolvedValue(undefined);
    await handler(event);
    expect(mockDelete).toHaveBeenCalledWith(1);
    expect(globalThis.clearUserSession).toHaveBeenCalled();
  });

  it('handles user without id', async () => {
    const handler = (await import('~~/server/api/profile.delete')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: {} });
    mockDelete.mockResolvedValue(undefined);
    await handler(event);
    expect(mockDelete).toHaveBeenCalledWith(0);
  });

  it('throws 500 on failure', async () => {
    const handler = (await import('~~/server/api/profile.delete')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockRejectedValue(new Error('db'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('PATCH /api/updatePassword', () => {
  beforeEach(() => {
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
  });

  it('throws 401 when not logged in', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 400 on validation failure', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ currentPassword: 'x', newPassword: 'short', confirmPassword: 'short' });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 404 when user not found', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue(null);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when user has no password (OAuth-only)', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: null });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when current password is wrong', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(false);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('updates password on success', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(true);
    mockUpdatePassword.mockResolvedValue(undefined);
    await handler(event);
    expect(mockUpdatePassword).toHaveBeenCalledWith(1, 'Aaaaaaaaaaaaaaa1!');
  });

  it('handles user without id (defaults to 0)', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: {} });
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(true);
    mockUpdatePassword.mockResolvedValue(undefined);
    await handler(event);
    expect(mockGetById).toHaveBeenCalledWith(0);
  });

  it('rethrows updatePassword error with statusCode', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(true);
    const err = new Error('rate-limited') as Error & { statusCode: number };
    err.statusCode = 429;
    mockUpdatePassword.mockRejectedValue(err);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 429 });
  });

  it('throws 500 on generic update error', async () => {
    const handler = (await import('~~/server/api/updatePassword.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      currentPassword: 'x',
      newPassword: 'Aaaaaaaaaaaaaaa1!',
      confirmPassword: 'Aaaaaaaaaaaaaaa1!'
    });
    mockGetById.mockResolvedValue({ id: 1, passwordHash: 'h', salt: 's' });
    mockCheckPassword.mockResolvedValue(true);
    mockUpdatePassword.mockRejectedValue(new Error('db'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/review', () => {
  it('handles a valid bug review', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'bug', rating: 4, categories: ['ui'], feedback: 'good'
    });
    mockHandleReview.mockResolvedValue(undefined);
    await handler(event);
    expect(mockHandleReview).toHaveBeenCalled();
  });

  it('exercises refine "return true" branch for bug review with suggestions', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'bug', rating: 4, categories: ['ui'], feedback: 'good', suggestions: 'helpful'
    });
    mockHandleReview.mockResolvedValue(undefined);
    await expect(handler(event)).resolves.toBeUndefined();
  });

  it('handles general review with required suggestions', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'general', rating: 5, categories: ['c'], feedback: 'great', suggestions: 'do x'
    });
    mockHandleReview.mockResolvedValue(undefined);
    await handler(event);
    expect(mockHandleReview).toHaveBeenCalled();
  });

  it('throws 400 when categories array is empty', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'general', rating: 5, categories: [], feedback: 'great', suggestions: 'sug'
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 on invalid email', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'bug', rating: 4, categories: ['ui'], feedback: 'good', email: 'not-email'
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 500 on service error', async () => {
    const handler = (await import('~~/server/api/review.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({
      type: 'bug', rating: 4, categories: ['ui'], feedback: 'good'
    });
    mockHandleReview.mockRejectedValue(new Error('mail-down'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});
