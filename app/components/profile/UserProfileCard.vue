<script setup lang="ts">
import type { User } from '~~/server/types';

const props = defineProps<{
  user: User;
}>();
</script>

<template>
  <UCard class="mb-6">
    <div class="text-center">
      <div class="relative inline-block">
        <UAvatar
          :alt="props.user.fullName"
          size="xl"
          class="cursor-pointer w-20 h-20 mb-2"
        />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ props.user.fullName }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ props.user.email }}
      </p>
    </div>
  </UCard>
</template>
