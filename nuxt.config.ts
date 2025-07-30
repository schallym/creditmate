// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxtjs/i18n'
  ],
  components: [
    { path: '~/components', pathPrefix: false }
  ],
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  srcDir: 'app',
  serverDir: 'server',
  compatibilityDate: '2025-07-24',
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
        semi: true
      }
    }
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fr',
    restructureDir: 'app/i18n',
    locales: [
      { code: 'fr', name: 'french', file: 'fr.json', flag: '🇫🇷' },
      { code: 'en', name: 'english', file: 'en.json', flag: '🇬🇧' }
    ]
  },
  icon: {
    customCollections: [{
      prefix: 'custom',
      dir: 'app/assets/icons'
    }]
  }
});
