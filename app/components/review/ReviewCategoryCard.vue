<script setup lang="ts">
const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const selectedCategories = ref<string[]>(props.modelValue || []);
const categories = [
  'userInterface',
  'calculations',
  'performance',
  'navigation',
  'content',
  'mobileExperience',
  'accessibility',
  'other'
];

watch(() => props.modelValue, (newValue) => {
  selectedCategories.value = newValue;
});

watch(selectedCategories, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-2">
      <UIcon
        name="i-lucide-library-big"
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
      />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('review.form.fields.categories.label') }}
      </h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('review.form.fields.categories.description') }}
    </p>

    <div class="flex flex-wrap gap-3">
      <UButton
        v-for="category in categories"
        :key="category"
        :variant="selectedCategories.includes(category) ? 'solid' : 'outline'"
        :color="selectedCategories.includes(category) ? 'primary' : 'neutral'"
        size="md"
        class="transition-all duration-200"
        @click="selectedCategories.includes(category) ? selectedCategories = selectedCategories.filter(c => c !== category) : selectedCategories.push(category)"
      >
        {{ $t(`review.form.fields.categories.categories.${category}`) }}
      </UButton>
    </div>
    <UFormField name="categories">
      <USelect
        v-model="selectedCategories"
        multiple
        :items="categories"
        class="hidden"
      />
    </UFormField>
  </UCard>
</template>
