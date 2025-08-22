<script setup lang="ts">
const colorMode = useColorMode();
const { loggedIn } = useUserSession();
</script>

<template>
  <section class="py-16 px-6 md:px-20">
    <div class="flex flex-col lg:flex-row items-center justify-between gap-10 max-w-7xl mx-auto">
      <div class="text-center lg:text-left lg:max-w-xl">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          <i18n-t
            keypath="home.hero.title.text"
            tag="span"
          >
            <template #highlight>
              <span class="text-blue-500">
                {{ $t('home.hero.title.highlighted') }}
              </span>
            </template>
            <template #break>
              <br class="md:hidden">
            </template>
          </i18n-t>
        </h1>
        <p class="text-lg md:text-xl mb-8">
          {{ $t('home.hero.subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
          <UButton
            v-if="!loggedIn"
            color="primary"
            size="xl"
            variant="solid"
            trailing-icon="lucide:arrow-right"
            to="/auth/signup"
          >
            {{ $t('home.hero.cta.startTracking') }}
          </UButton>
          <UButton
            v-if="loggedIn"
            color="primary"
            size="xl"
            variant="solid"
            trailing-icon="lucide:arrow-right"
            to="/loans"
          >
            {{ $t('home.hero.cta.seeLoans') }}
          </UButton>
          <UButton
            color="neutral"
            size="xl"
            to="/loans/add"
          >
            {{ loggedIn ? $t('home.hero.cta.addLoan') : $t('home.hero.cta.addYourFirstLoan') }}
          </UButton>
        </div>
      </div>
      <div class="relative w-full">
        <ClientOnly>
          <img
            :src="colorMode.value === 'dark' ? '/img/hero-dark.png' : '/img/hero.png'"
            alt="Loan Dashboard"
            class="rounded-xl shadow-xl w-full"
          >
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
