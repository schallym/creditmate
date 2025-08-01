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

  return {
    formatMoney: (amount: number | string) => moneyFormatter.format(Number(amount)),
    formatPercent: (rate: number | string) => percentFormatter.format(Number(rate) / 100),
    formatDate: (date: Date | string) => dateFormatter.format(new Date(date)),
    formatMonthYear: (date: Date | string) => monthYearFormatter.format(new Date(date)),
    locale,
    currency
  };
};
