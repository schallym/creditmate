<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  icon: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center text-center">
    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <UIcon
        :name="props.icon"
        class="w-8 h-8 text-blue-500"
      />
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
      {{ props.title }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
      {{ props.description }}
    </p>
  </div>
</template>
