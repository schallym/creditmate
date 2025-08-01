export default defineI18nLocaleDetector((event, config) => {
  const query = tryQueryLocale(event, { lang: '' });
  if (query) return query.toString();

  const cookie = getCookie(event, 'i18n_redirected');
  if (cookie) return cookie;

  const header = tryHeaderLocale(event, { lang: '' });
  if (header) return header.toString();

  return config.defaultLocale;
});
