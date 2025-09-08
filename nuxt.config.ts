// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    'nuxt-auth-utils'
  ],
  components: [
    { path: '~/components', pathPrefix: false }
  ],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'CreditMate',
      htmlAttrs: {
        lang: 'en'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }
      ]
    }
  },
  css: ['@/assets/css/main.css'],
  runtimeConfig: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    session: {
      maxAge: 60 * 60 * 24 // 1 day
    },
    // Server-side only (secure)
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    },
    jwtSecret: process.env.JWT_SECRET || 'secret',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },
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
    experimental: {
      localeDetector: 'localeDetector.ts'
    },
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
