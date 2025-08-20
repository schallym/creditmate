import enLocale from '~/i18n/locales/en.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTranslations = (key: string) => key.split('.').reduce((obj, k) => obj?.[k], enLocale as any) || key;
