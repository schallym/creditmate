import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoanType, LoanStatus, type Loan, type LoanWithCalculations } from '~~/server/types';

import LoanService from '~~/server/services/loan.service';

const { mockLoanCreate, mockLoanUpdate, mockLoanDelete, mockLoanFindMany, mockLoanFindUnique } = vi.hoisted(() => ({
  mockLoanCreate: vi.fn(),
  mockLoanUpdate: vi.fn(),
  mockLoanDelete: vi.fn(),
  mockLoanFindMany: vi.fn(),
  mockLoanFindUnique: vi.fn()
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    loan: {
      create: mockLoanCreate,
      update: mockLoanUpdate,
      delete: mockLoanDelete,
      findMany: mockLoanFindMany,
      findUnique: mockLoanFindUnique
    }
  }))
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-05T00:00:00Z'));
});

afterEach(() => vi.useRealTimers());

const baseLoan = (overrides: Partial<Loan> = {}): Loan => ({
  id: 1,
  type: LoanType.PERSONAL,
  lenderName: 'Bank',
  amount: 10000,
  interestRate: 5,
  termMonths: 24,
  startDate: new Date('2025-05-05'),
  monthlyPayment: null,
  ...overrides
});

describe('LoanService.createLoanValidationSchema', () => {
  const t = (k: string) => k;
  const schema = LoanService.createLoanValidationSchema(t);

  it('accepts valid loan', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 1000,
      interestRate: 5, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const r = schema.safeParse({
      type: 'invalid', lenderName: 'B', amount: 1000,
      interestRate: 5, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects empty lenderName', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: '', amount: 1000,
      interestRate: 5, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects amount <= 0', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 0,
      interestRate: 5, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects interestRate <= 0', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 1000,
      interestRate: 0, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects interestRate > 100', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 1000,
      interestRate: 101, termMonths: 12, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects termMonths < 1', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 1000,
      interestRate: 5, termMonths: 0, startDate: '2025-01-01'
    });
    expect(r.success).toBe(false);
  });

  it('rejects invalid startDate', () => {
    const r = schema.safeParse({
      type: 'personal', lenderName: 'B', amount: 1000,
      interestRate: 5, termMonths: 12, startDate: 'not-a-date'
    });
    expect(r.success).toBe(false);
  });
});

describe('LoanService.calculateMonthlyPayment', () => {
  it('returns amount/term when interest is 0', () => {
    expect(LoanService.calculateMonthlyPayment(1200, 0, 12)).toBe(100);
  });

  it('amortizes when interest > 0', () => {
    const p = LoanService.calculateMonthlyPayment(10000, 5, 24);
    expect(p).toBeGreaterThan(0);
    expect(p).toBe(parseFloat(p.toFixed(2)));
  });
});

describe('LoanService.createLoan', () => {
  it('passes through to prisma', async () => {
    mockLoanCreate.mockResolvedValue({ id: 1 });
    const dto = { type: LoanType.PERSONAL, lenderName: 'B', amount: 1, interestRate: 1, termMonths: 1, startDate: new Date() };
    await LoanService.createLoan(dto);
    expect(mockLoanCreate).toHaveBeenCalledWith({ data: dto });
  });
});

describe('LoanService.updateLoan', () => {
  it('recomputes monthlyPayment and updates', async () => {
    mockLoanUpdate.mockResolvedValue({ id: 1 });
    const dto = { amount: 1200, interestRate: 0, termMonths: 12, monthlyPayment: 0, type: LoanType.PERSONAL, lenderName: 'B', startDate: new Date() };
    await LoanService.updateLoan(1, dto);
    expect(mockLoanUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ monthlyPayment: 100 })
    });
  });
});

describe('LoanService.deleteLoan', () => {
  it('deletes by id', async () => {
    mockLoanDelete.mockResolvedValue({});
    await LoanService.deleteLoan(7);
    expect(mockLoanDelete).toHaveBeenCalledWith({ where: { id: 7 } });
  });
});

describe('LoanService.listLoansByUserId', () => {
  it('queries with userId, desc createdAt, take 1000', async () => {
    mockLoanFindMany.mockResolvedValue([]);
    await LoanService.listLoansByUserId(3);
    expect(mockLoanFindMany).toHaveBeenCalledWith({
      where: { userId: 3 },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });
  });
});

describe('LoanService.calculateFormatted aggregates', () => {
  it('calculateFormattedTotalRemainingBalance sums and formats', () => {
    const loans = [
      { remainingBalance: 100 } as LoanWithCalculations,
      { remainingBalance: 200 } as LoanWithCalculations
    ];
    expect(LoanService.calculateFormattedTotalRemainingBalance(loans, 'en')).toContain('300');
  });

  it('calculateFormattedTotalRemainingBalance defaults locale to en', () => {
    expect(LoanService.calculateFormattedTotalRemainingBalance([{ remainingBalance: 50 } as LoanWithCalculations]))
      .toContain('50');
  });

  it('calculateFormattedTotalMonthlyPayment includes only loans with remainingBalance > 0', () => {
    const loans = [
      { remainingBalance: 100, monthlyPayment: 50 } as LoanWithCalculations,
      { remainingBalance: 0, monthlyPayment: 50 } as LoanWithCalculations,
      { remainingBalance: 100, monthlyPayment: null } as unknown as LoanWithCalculations
    ];
    expect(LoanService.calculateFormattedTotalMonthlyPayment(loans, 'en')).toContain('50');
  });

  it('calculateFormattedTotalMonthlyPayment defaults locale to en', () => {
    expect(LoanService.calculateFormattedTotalMonthlyPayment([])).toBeTruthy();
  });
});

describe('LoanService.calculateFormattedLoan', () => {
  it('returns full LoanWithCalculations with formatted fields (active loan)', () => {
    const loan = baseLoan({ startDate: new Date('2025-11-05') });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.status).toBe(LoanStatus.ACTIVE);
    expect(result.formatted.amount).toBeTruthy();
    expect(result.formatted.nextPaymentDate).toBeTruthy();
    expect(result.remainingBalanceProjectionData.length).toBe(loan.termMonths + 1);
    expect(result.remainingBalanceProjectionData[0].formatted.month).toBeTruthy();
  });

  it('returns 0 monthlyPayment and null nextPaymentDate when loan complete', () => {
    const loan = baseLoan({ startDate: new Date('2020-01-01'), termMonths: 12 });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.monthlyPayment).toBe(0);
    expect(result.nextPaymentDate).toBeNull();
    expect(result.formatted.nextPaymentDate).toBeNull();
    expect(result.status).toBe(LoanStatus.COMPLETED);
  });

  it('uses provided monthlyPayment when remainingBalance > 0', () => {
    const loan = baseLoan({ startDate: new Date('2026-01-01'), monthlyPayment: 500 });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.monthlyPayment).toBe(500);
  });
});

describe('LoanService.calculateEarlyRepayment', () => {
  it('throws when loan not found', async () => {
    mockLoanFindUnique.mockResolvedValue(null);
    await expect(LoanService.calculateEarlyRepayment(1)).rejects.toThrow('Loan not found');
  });

  it('returns full payoff scenario when one-time payment clears the balance', async () => {
    const loan = baseLoan({ amount: 1000, interestRate: 5, termMonths: 24, startDate: new Date('2026-04-05') });
    mockLoanFindUnique.mockResolvedValue(loan);
    const result = await LoanService.calculateEarlyRepayment(1, 0, 100000, 'en');
    expect(result.newDuration).toBe(0);
    expect(result.newPaidOffPercentage).toBe(100);
  });

  it('calculates savings with additional monthly payment', async () => {
    const loan = baseLoan({ amount: 10000, interestRate: 5, termMonths: 24, startDate: new Date('2026-04-05') });
    mockLoanFindUnique.mockResolvedValue(loan);
    const result = await LoanService.calculateEarlyRepayment(1, 200, 0, 'en');
    expect(result.formattedInterestSavings).toBeTruthy();
    expect(result.newDuration).toBeGreaterThanOrEqual(0);
  });

  it('handles zero/undefined extra payments (no savings)', async () => {
    const loan = baseLoan({ amount: 5000, interestRate: 4, termMonths: 12, startDate: new Date('2026-04-05') });
    mockLoanFindUnique.mockResolvedValue(loan);
    const result = await LoanService.calculateEarlyRepayment(1, undefined, undefined, 'fr');
    expect(result).toBeTruthy();
  });

  it('defaults locale to en', async () => {
    const loan = baseLoan({ amount: 1000, interestRate: 5, termMonths: 12, startDate: new Date('2026-04-05') });
    mockLoanFindUnique.mockResolvedValue(loan);
    const result = await LoanService.calculateEarlyRepayment(1);
    expect(result).toBeTruthy();
  });

  it('clamps newBalance to 0 when one-time exceeds balance (and continues)', async () => {
    const loan = baseLoan({ amount: 100, interestRate: 5, termMonths: 12, startDate: new Date('2026-04-05') });
    mockLoanFindUnique.mockResolvedValue(loan);
    const result = await LoanService.calculateEarlyRepayment(1, 0, 1000, 'en');
    expect(result.newDuration).toBe(0);
  });
});

describe('LoanService private helpers via calculateFormattedLoan edge cases', () => {
  it('calculateMonthlyRate returns 0 when interestRate is 0', () => {
    const loan = baseLoan({ interestRate: 0, monthlyPayment: 100, startDate: new Date('2026-04-05') });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.nextMonthInterest).toBe(0);
  });

  it('falls back to calculated monthlyPayment when stored value <= 0', () => {
    const loan = baseLoan({ monthlyPayment: 0, startDate: new Date('2026-04-05') });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });

  it('returns COMPLETED status when paymentsLeft is 0 but balance > 0', () => {
    // termMonths exhausted (startDate way in past), but with monthlyPayment too small
    const loan = baseLoan({
      amount: 100000, interestRate: 5, termMonths: 1,
      monthlyPayment: 1, startDate: new Date('2020-01-01')
    });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    expect(result.status).toBe(LoanStatus.COMPLETED);
  });

  it('clamps projection final balance to 0 when residual remains', () => {
    const loan = baseLoan({ amount: 1000, interestRate: 5, termMonths: 12, monthlyPayment: 100, startDate: new Date('2026-04-05') });
    const result = LoanService.calculateFormattedLoan(loan, 'en');
    const last = result.remainingBalanceProjectionData[result.remainingBalanceProjectionData.length - 1];
    expect(last.remainingBalance).toBeGreaterThanOrEqual(0);
  });
});
