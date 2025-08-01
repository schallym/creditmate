import type { H3Event } from 'h3';

export const useLocale = (event: H3Event, options?: {
  defaultLocale?: string;
  cookieName?: string;
}) => {
  const {
    defaultLocale = 'en',
    cookieName = 'i18n_redirected'
  } = options || {};

  const getLocaleFromCookie = () => {
    return (getCookie(event, cookieName)) ?? defaultLocale;
  };

  return {
    locale: getLocaleFromCookie()
  };
};
