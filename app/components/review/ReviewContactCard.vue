<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const email = ref(props.modelValue || '');

watch(() => props.modelValue, (newValue) => {
  email.value = newValue;
});

watch(email, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-2">
      <UIcon
        name="i-lucide-user"
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
      />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('review.form.fields.email.label') }}
      </h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ $t('review.form.fields.email.description') }}
    </p>

    <ClearableInput
      v-model="email"
      type="email"
      :placeholder="$t('review.form.fields.email.placeholder')"
      size="lg"
      name="email"
      :label="$t('review.form.fields.email.inputLabel')"
      icon="i-lucide-at-sign"
    />
  </UCard>
</template>
