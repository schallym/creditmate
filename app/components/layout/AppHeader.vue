<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { NavigationMenuItem } from '@nuxt/ui';
import type { FilteredUser } from '~~/server/types';

const route = useRoute();
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const loggedUser = computed(() => user.value as FilteredUser | null);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: $t('header.links.loans'),
    to: '/loans',
    active: route.path.startsWith('/loans')
  }
]);

const userMenuItems = computed(() => [
  [
    {
      label: $t('auth.header.loggedInAs', { name: loggedUser?.value?.fullName }),
      icon: 'i-heroicons-user'
    }
  ],
  [
    {
      label: $t('auth.editProfile.title'),
      icon: 'i-lucide-pencil',
      to: '/profile'
    },
    {
      label: $t('auth.logout.title'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      class: 'cursor-pointer',
      onClick: async () => {
        await $fetch('/api/auth/logout', { method: 'POST' });
        await refreshSession();
        await navigateTo('/');
      }
    }
  ]
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

      <UDropdownMenu
        v-if="loggedIn"
        :items="userMenuItems"
      >
        <UAvatar
          :alt="loggedUser?.fullName"
          size="lg"
          class="cursor-pointer"
        />
      </UDropdownMenu>
      <div
        v-else
        class="flex items-center space-x-2"
      >
        <UButton
          color="neutral"
          class="hidden md:inline-flex"
          to="/auth/login"
          size="lg"
        >
          {{ $t('header.login') }}
        </UButton>
        <UButton
          color="primary"
          class="hidden md:inline-flex"
          to="/auth/signup"
          size="lg"
          trailing-icon="lucide:arrow-right"
        >
          {{ $t('header.getStarted') }}
        </UButton>
      </div>
    </div>
  </header>
</template>
