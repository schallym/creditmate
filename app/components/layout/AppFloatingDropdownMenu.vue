<script setup lang="ts">
const isRotated = ref(false);
const menuItems = [
  [
    {
      label: $t('review.layoutButton.label'),
      description: $t('review.layoutButton.description'),
      icon: 'i-lucide-message-square',
      class: 'cursor-pointer',
      to: '/review'
    }
  ]
];
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <UDropdownMenu
      :items="menuItems"
      @update:open="isRotated = !isRotated;"
    >
      <UButton
        icon="i-heroicons-plus"
        size="xl"
        color="primary"
        variant="solid"
        :class="[
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
          { 'rotate-45': isRotated }
        ]"
      />
      <template #item="{ item }">
        <UIcon
          :name="item.icon"
          class="flex-shrink-0 h-5 w-5"
        />
        <div class="flex flex-col">
          <span class="font-medium text-sm">{{ item.label }}</span>
          <span class="text-xs w-50 text-gray-500">{{ item.description }}</span>
        </div>
      </template>
    </UDropdownMenu>
  </div>
</template>
