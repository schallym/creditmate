<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/components/DropdownMenu.vue';

const colorMode = useColorMode();

const options: DropdownMenuItem[] = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun', onClick: () => selected.value = 'light' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon', onClick: () => selected.value = 'dark' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor', onClick: () => selected.value = 'system' }
];

const selected = computed({
  get: () => colorMode.preference || 'system',
  set: (val) => { colorMode.preference = val; }
});
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UDropdownMenu :items="options">
      <UButton
        :icon="options.find(o => o.value === selected)?.icon"
        color="neutral"
        variant="ghost"
      />
    </UDropdownMenu>
    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
