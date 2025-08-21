<script setup lang="ts">
const props = defineProps<{
  title: string;
  mainValue: string | number;
  subValue?: string;
  icon?: string;
}>();
</script>

<template>
  <UCard :ui="{ root: 'h-full flex flex-col divide-none', header: 'pb-0', body: 'pt-0 sm:pt-0' }">
    <template #header>
      <div class="flex items-center justify-between">
        <p class="text-sm">
          {{ props.title }}
        </p>
        <UIcon
          v-if="props.icon"
          :name="props.icon"
          class="size-4"
        />
      </div>
    </template>
    <div>
      <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
        {{ props.mainValue }}
      </p>
      <p
        v-if="props.subValue"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        {{ props.subValue }}
      </p>
    </div>
  </UCard>
</template>
