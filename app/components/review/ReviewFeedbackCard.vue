<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const feedback = ref(props.modelValue || '');

watch(() => props.modelValue, (newValue) => {
  feedback.value = newValue;
});

watch(feedback, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-2">
      <UIcon
        name="i-lucide-message-square"
        class="w-6 h-6 text-blue-600"
      />
      <h2 class="text-xl font-semibold text-gray-900">
        {{ $t('review.form.fields.feedback.label') }}
      </h2>
    </div>
    <p class="text-gray-600 mb-6">
      {{ $t('review.form.fields.feedback.description') }}
    </p>

    <div class="mb-4">
      <TextAreaInput
        v-model="feedback"
        name="feedback"
        :placeholder="$t('review.form.fields.feedback.placeholder')"
      />
    </div>
  </UCard>
</template>
