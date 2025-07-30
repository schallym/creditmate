<script setup lang="ts">
export type HomeFeature = {
  title: string;
  text: string;
  icon: string;
};

defineProps<HomeFeature>();
</script>

<template>
  <UCard
    variant="outline"
    :ui="{ root: 'h-full flex flex-col divide-none', body: 'flex-1 pt-2', footer: 'mt-auto', header: 'pb-0' }"
  >
    <template #header>
      <UIcon
        :name="icon"
        class="size-12 text-blue-500 mb-2"
      />
      <h3 class="text-xl font-semibold">
        {{ title }}
      </h3>
    </template>
    <div class="text-gray-600 dark:text-gray-300">
      {{ text }}
    </div>
  </UCard>
</template>
