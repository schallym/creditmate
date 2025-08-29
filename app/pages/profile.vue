<script setup lang="ts">
import type { User } from '~~/server/types';
import UserProfileCard from '~/components/profile/UserProfileCard.vue';

useHead({
  title: 'Mon Profil - Gestion du compte',
  meta: [
    { name: 'description', content: 'Gérez vos informations personnelles et préférences de compte' }
  ]
});

const { loggedIn, user } = useUserSession();

if (!loggedIn.value) {
  await navigateTo('/login');
}
</script>

<template>
  <div class="p-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center gap-4 mb-4">
        <UButton
          size="lg"
          square
          color="neutral"
          to="/loans"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-5 h-5"
          />
        </UButton>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            {{ $t('auth.profile.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('auth.profile.description') }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <UserProfileCard :user="user as User" />
          <UserStatisticsCard :user="user as User" />
        </div>

        <div class="lg:col-span-2 space-y-6">
          <UserProfilePersonalDataFormCard :user="user as User" />
          <UserProfilePasswordFormCard />
          <UserProfileDangerZone />
        </div>
      </div>
    </div>
  </div>
</template>
