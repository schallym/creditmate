<script setup lang="ts">
interface ErrorProps {
  error: {
    statusCode: number;
    statusMessage: string;
    message?: string;
  };
}

const props = defineProps<ErrorProps>();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center px-4">
      <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
        {{ props.error.statusCode }}
      </h1>
      <p class="text-xl text-gray-600 mb-6">
        {{ props.error.statusMessage }}
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
