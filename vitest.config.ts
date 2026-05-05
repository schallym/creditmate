import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', { 'vue-router': ['useRoute', 'useRouter'] }],
      dirs: ['app/composables/**'],
      dts: false
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/app/**', 'happy-dom']
    ],
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'server/**/*.ts',
        'app/**/*.{ts,vue}'
      ],
      exclude: [
        'server/prisma/**',
        'server/dtos/**',
        'server/types/user.type.ts',
        '**/*.d.ts',
        '**/index.ts',
        'app/**/*.config.ts'
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 99,
        statements: 100
      }
    }
  },
  resolve: {
    alias: {
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  }
});
