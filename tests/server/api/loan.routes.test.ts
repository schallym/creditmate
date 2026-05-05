import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

const {
  mockListLoans, mockCreateLoan, mockUpdateLoan, mockDeleteLoan,
  mockCalcEarly, mockCalcMonthlyPayment, mockCalcFormatted,
  mockCalcFormattedTotalRemainingBalance, mockCalcFormattedTotalMonthlyPayment,
  mockCreateLoanValidationSchema, mockFindUnique, mockDisconnect
} = vi.hoisted(() => ({
  mockListLoans: vi.fn(),
  mockCreateLoan: vi.fn(),
  mockUpdateLoan: vi.fn(),
  mockDeleteLoan: vi.fn(),
  mockCalcEarly: vi.fn(),
  mockCalcMonthlyPayment: vi.fn(),
  mockCalcFormatted: vi.fn(),
  mockCalcFormattedTotalRemainingBalance: vi.fn(),
  mockCalcFormattedTotalMonthlyPayment: vi.fn(),
  mockCreateLoanValidationSchema: vi.fn(),
  mockFindUnique: vi.fn(),
  mockDisconnect: vi.fn()
}));

vi.mock('~~/server/services/loan.service', () => ({
  default: {
    listLoansByUserId: mockListLoans,
    createLoan: mockCreateLoan,
    updateLoan: mockUpdateLoan,
    deleteLoan: mockDeleteLoan,
    calculateEarlyRepayment: mockCalcEarly,
    calculateMonthlyPayment: mockCalcMonthlyPayment,
    calculateFormattedLoan: mockCalcFormatted,
    calculateFormattedTotalRemainingBalance: mockCalcFormattedTotalRemainingBalance,
    calculateFormattedTotalMonthlyPayment: mockCalcFormattedTotalMonthlyPayment,
    createLoanValidationSchema: mockCreateLoanValidationSchema
  }
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    loan: { findUnique: mockFindUnique },
    $disconnect: mockDisconnect
  }))
}));

vi.mock('~~/server/prisma/prisma-client', () => ({
  default: {
    loan: { findUnique: mockFindUnique },
    $disconnect: mockDisconnect
  }
}));

const event = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  (globalThis as unknown as { getUserSession: ReturnType<typeof vi.fn> }).getUserSession = vi.fn();
  (globalThis as unknown as { requireUserSession: ReturnType<typeof vi.fn> }).requireUserSession = vi.fn();
  (globalThis as unknown as { setResponseStatus: ReturnType<typeof vi.fn> }).setResponseStatus = vi.fn();
  (globalThis as unknown as { readBody: ReturnType<typeof vi.fn> }).readBody = vi.fn();
  (globalThis as unknown as { getRouterParam: ReturnType<typeof vi.fn> }).getRouterParam = vi.fn();
});

describe('GET /api/loans', () => {
  it('returns [] when no loans', async () => {
    const handler = (await import('~~/server/api/loans')).default;
    (globalThis.requireUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
    mockListLoans.mockResolvedValue([]);
    expect(await handler(event)).toEqual([]);
  });

  it('returns aggregated response when loans exist', async () => {
    const handler = (await import('~~/server/api/loans')).default;
    (globalThis.requireUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 1 } });
    mockListLoans.mockResolvedValue([{ id: 1 }]);
    mockCalcFormatted.mockReturnValue({ status: 'active', remainingBalance: 100 });
    mockCalcFormattedTotalRemainingBalance.mockReturnValue('100€');
    mockCalcFormattedTotalMonthlyPayment.mockReturnValue('50€');
    const result = await handler(event);
    expect(result.numberOfActiveLoans).toBe(1);
    expect(result.formattedTotalRemainingBalance).toBe('100€');
  });

  it('handles user with id=0', async () => {
    const handler = (await import('~~/server/api/loans')).default;
    (globalThis.requireUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: {} });
    mockListLoans.mockResolvedValue(null);
    expect(await handler(event)).toEqual([]);
  });
});

describe('POST /api/loan', () => {
  beforeEach(() => {
    mockCreateLoanValidationSchema.mockReturnValue({ parse: (b: unknown) => b });
  });

  it('creates loan with userId from session', async () => {
    const handler = (await import('~~/server/api/loan.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ amount: 1000 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 7 } });
    mockCreateLoan.mockResolvedValue({ id: 1 });
    const result = await handler(event);
    expect(result).toEqual({ data: { id: 1 } });
    expect(mockCreateLoan).toHaveBeenCalledWith(expect.objectContaining({ userId: 7 }));
  });

  it('creates loan without userId when not logged in', async () => {
    const handler = (await import('~~/server/api/loan.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ amount: 1000 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    mockCreateLoan.mockResolvedValue({ id: 1 });
    await handler(event);
    expect(mockCreateLoan).toHaveBeenCalled();
  });

  it('throws 400 on Zod error', async () => {
    const handler = (await import('~~/server/api/loan.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({});
    mockCreateLoanValidationSchema.mockReturnValue({
      parse: () => { throw new ZodError([]); }
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 500 on generic error', async () => {
    const handler = (await import('~~/server/api/loan.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    mockCreateLoan.mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/calculate-monthly-payment', () => {
  it('returns calculated payment', async () => {
    const handler = (await import('~~/server/api/calculate-monthly-payment.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ amount: 1200, interestRate: 0, termMonths: 12 });
    mockCalcMonthlyPayment.mockReturnValue(100);
    expect(await handler(event)).toEqual({ monthlyPayment: 100 });
  });

  it('throws 500 on error', async () => {
    const handler = (await import('~~/server/api/calculate-monthly-payment.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('GET /api/loan/[id]', () => {
  it('throws 404 when loan not found', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue(null);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns loan when public (no userId)', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: null });
    mockCalcFormatted.mockReturnValue({ id: 1 });
    expect(await handler(event)).toEqual({ id: 1 });
  });

  it('throws 403 when user does not own the loan', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 9 } });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 403 when no user session for owned loan', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('returns loan when user owns it', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 5 } });
    mockCalcFormatted.mockReturnValue({ id: 1 });
    expect(await handler(event)).toEqual({ id: 1 });
  });

  it('throws 500 on internal error', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('PATCH /api/loan/[id]', () => {
  beforeEach(() => {
    mockCreateLoanValidationSchema.mockReturnValue({ parse: (b: unknown) => b });
  });

  it('updates loan when user owns it', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, amount: 100, interestRate: 5, termMonths: 12 });
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 5 } });
    mockUpdateLoan.mockResolvedValue({ id: 1 });
    const result = await handler(event);
    expect(result.data.id).toBe(1);
  });

  it('throws 404 when loan not found', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    mockFindUnique.mockResolvedValue(null);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when user does not own loan', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 9 } });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('handles null id by passing 0 to updateLoan', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ id: undefined });
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 5 } });
    mockUpdateLoan.mockResolvedValue({});
    await handler(event);
    expect(mockUpdateLoan).toHaveBeenCalledWith(0, expect.anything());
  });

  it('throws 400 on Zod validation error', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({});
    mockCreateLoanValidationSchema.mockReturnValue({
      parse: () => { throw new ZodError([]); }
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 500 on generic error', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.patch')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 5 } });
    mockUpdateLoan.mockRejectedValue(new Error('db'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('DELETE /api/loan/[id]', () => {
  it('throws 404 when loan not found', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.delete')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue(null);
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when user does not own loan', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.delete')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 9 } });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('deletes loan when user owns it', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.delete')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockResolvedValue({ id: 1, userId: 5 });
    (globalThis.getUserSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 5 } });
    mockDeleteLoan.mockResolvedValue(undefined);
    const result = await handler(event);
    expect(result.data.id).toBe(1);
  });

  it('throws 500 on generic error', async () => {
    const handler = (await import('~~/server/api/loan/[id]/index.delete')).default;
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockFindUnique.mockRejectedValue(new Error('db'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe('POST /api/loan/[id]/calculate-early-repayment', () => {
  it('calculates and returns early repayment', async () => {
    const handler = (await import('~~/server/api/loan/[id]/calculate-early-repayment.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockResolvedValue({ additionalMonthlyPayment: 100, oneTimePayment: 0 });
    (globalThis.getRouterParam as ReturnType<typeof vi.fn>).mockReturnValue('1');
    mockCalcEarly.mockResolvedValue({ newDuration: 5 });
    const result = await handler(event);
    expect(result).toEqual({ newDuration: 5 });
    expect(mockCalcEarly).toHaveBeenCalledWith(1, 100, 0, 'en');
  });

  it('throws 500 on error', async () => {
    const handler = (await import('~~/server/api/loan/[id]/calculate-early-repayment.post')).default;
    (globalThis.readBody as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});
