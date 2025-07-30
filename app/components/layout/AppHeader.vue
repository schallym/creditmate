<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: $t('header.links.loans'),
    to: '/loans',
    active: route.path.startsWith('/loans')
  },
  {
    label: $t('header.links.simulationCenter'),
    to: '/simulation-center',
    active: route.path.startsWith('/simulation-center')
  }
]);
</script>

<template>
  <header class="flex items-center justify-between px-20 py-1 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center space-x-2">
      <NuxtLink
        to="/"
        class="flex items-end gap-2"
      >
        <img
          src="/img/logo.png"
          alt="Logo"
          class="h-18 w-auto block dark:hidden"
        >
        <img
          src="/img/logo-dark.png"
          alt="Logo"
          class="h-18 w-auto hidden dark:block"
        >
      </NuxtLink>
    </div>
    <div class="flex items-center space-x-2">
      <UNavigationMenu
        class="flex items-center space-x-4"
        :items="navItems"
        active-class="bg-blue-200 text-blue-800"
      />
      <ColorModeSelector class="mr-1" />
      <UButton
        color="neutral"
        class="hidden md:inline-flex"
        to="/get-started"
        size="lg"
      >
        {{ $t('header.login') }}
      </UButton>
      <UButton
        color="primary"
        class="hidden md:inline-flex"
        to="/get-started"
        size="lg"
        trailing-icon="lucide:arrow-right"
      >
        {{ $t('header.getStarted') }}
      </UButton>
    </div>
  </header>
</template>
