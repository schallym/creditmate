export const useFormatters = (locale: string) => {
  const getCurrency = (locale: string): string => {
    const currencyMap: Record<string, string> = {
      en: 'EUR',
      fr: 'EUR'
    };
    return currencyMap[locale] || 'EUR';
  };

  const currency = getCurrency(locale);

  const moneyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const percentFormatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const monthYearFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric'
  });

  const formatDuration = (months: number): string => {
    if (months === 0) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
        .format(0, 'month');
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });

    if (years > 0 && remainingMonths > 0) {
      const yearPart = rtf.format(years, 'year').replace(/^in\s+|^dans\s+/, '');
      const monthPart = rtf.format(remainingMonths, 'month').replace(/^in\s+|^dans\s+/, '');
      return `${yearPart} ${monthPart}`;
    } else if (years > 0) {
      return rtf.format(years, 'year').replace(/^in\s+|^dans\s+/, '');
    } else {
      return rtf.format(remainingMonths, 'month').replace(/^in\s+|^dans\s+/, '');
    }
  };

  return {
    formatMoney: (amount: number | string) => moneyFormatter.format(Number(amount)),
    formatPercent: (rate: number | string) => percentFormatter.format(Number(rate) / 100),
    formatDate: (date: Date | string) => dateFormatter.format(new Date(date)),
    formatMonthYear: (date: Date | string) => monthYearFormatter.format(new Date(date)),
    formatDuration,
    locale,
    currency
  };
};
