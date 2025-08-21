<template>
  <div class="flex flex-col items-center justify-center mt-20">
    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8">
        <div class="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <UIcon
            name="i-heroicons-lock-closed"
            class="w-10 h-10 text-blue-500"
          />
        </div>
      </div>

      <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        <span class="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          {{ $t('loan.anonym.title.highlight') }}
        </span>
        <br>
        <span class="text-gray-800 dark:text-gray-200">
          {{ $t('loan.anonym.title.text') }}
        </span>
      </h1>

      <p class="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-8 leading-relaxed max-w-xl mx-auto">
        {{ $t('loan.anonym.description') }}
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <UButton
          size="xl"
          variant="solid"
          to="auth/signup"
        >
          {{ $t('loan.anonym.cta.signup') }}
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right" />
          </template>
        </UButton>
        <UButton
          variant="ghost"
          size="lg"
          class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline decoration-1 underline-offset-4 hover:decoration-2"
          to="/auth/login"
        >
          {{ $t('loan.anonym.cta.login') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
