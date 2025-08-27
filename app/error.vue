<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
  error: Object as () => NuxtError
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center px-4">
      <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
        {{ props.error?.statusCode }}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">
        {{ props.error?.message }}
      </p>
      <UButton
        to="/"
        color="primary"
        size="xl"
      >
        Retour à l'accueil
      </UButton>
    </div>
  </div>
</template>
