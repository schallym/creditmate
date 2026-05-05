import { describe, it, expect } from 'vitest';
import { useFormatters } from '~~/server/utils/useFormatters';

describe('useFormatters', () => {
  it('formatMoney returns EUR formatted string', () => {
    const f = useFormatters('en');
    expect(f.formatMoney(1234.5)).toMatch(/1,234\.50/);
    expect(f.currency).toBe('EUR');
  });

  it('formatMoney accepts string input', () => {
    expect(useFormatters('en').formatMoney('100')).toContain('100');
  });

  it('formatPercent divides by 100', () => {
    expect(useFormatters('en').formatPercent(5)).toMatch(/5\.00/);
  });

  it('formatPercent accepts string input', () => {
    expect(useFormatters('en').formatPercent('10')).toContain('10');
  });

  it('formatDate produces day/month/year', () => {
    expect(useFormatters('en').formatDate('2026-05-05')).toMatch(/05/);
  });

  it('formatMonthYear produces short month + year', () => {
    expect(useFormatters('en').formatMonthYear('2026-05-05')).toMatch(/May/);
  });

  it('formatMonthYear accepts Date', () => {
    expect(useFormatters('fr').formatMonthYear(new Date('2026-01-01'))).toBeTruthy();
  });

  it('formatDuration returns "0 month" via RelativeTimeFormat for zero', () => {
    expect(useFormatters('en').formatDuration(0)).toMatch(/month/);
  });

  it('formatDuration returns months for < 12', () => {
    expect(useFormatters('en').formatDuration(5)).toMatch(/month/);
  });

  it('formatDuration returns years for multiples of 12', () => {
    expect(useFormatters('en').formatDuration(24)).toMatch(/year/);
  });

  it('formatDuration combines years and months', () => {
    const r = useFormatters('en').formatDuration(13);
    expect(r).toMatch(/year/);
    expect(r).toMatch(/month/);
  });

  it('formatDuration works in French', () => {
    expect(useFormatters('fr').formatDuration(13)).toBeTruthy();
  });

  it('falls back to EUR for unknown locale', () => {
    expect(useFormatters('xx').currency).toBe('EUR');
  });

  it('exposes locale field', () => {
    expect(useFormatters('fr').locale).toBe('fr');
  });
});
