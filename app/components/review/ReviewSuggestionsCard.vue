<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const suggestions = ref(props.modelValue || '');

watch(() => props.modelValue, (newValue) => {
  suggestions.value = newValue;
});

watch(suggestions, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-2">
      <UIcon
        name="i-lucide-lightbulb"
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
      />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('review.form.fields.suggestions.label') }}
      </h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ $t('review.form.fields.suggestions.description') }}
    </p>

    <div class="mb-8">
      <TextAreaInput
        v-model="suggestions"
        name="suggestions"
        :placeholder="$t('review.form.fields.suggestions.placeholder')"
      />
    </div>
  </UCard>
</template>
