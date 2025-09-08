<script setup lang="ts">
import { ReviewType } from '~~/server/types';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectedType = ref(props.modelValue || '');
const types = [
  {
    value: ReviewType.general,
    icon: 'i-lucide-message-circle'
  },
  {
    value: ReviewType.bug,
    icon: 'i-lucide-bug'
  },
  {
    value: ReviewType.feature,
    icon: 'i-lucide-lightbulb'
  },
  {
    value: ReviewType.compliment,
    icon: 'i-lucide-heart'
  }
];

watch(() => props.modelValue, (newValue) => {
  selectedType.value = newValue;
});

watch(selectedType, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-2">
      <UIcon
        name="i-lucide-book-marked"
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
      />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('review.form.fields.type.label') }}
      </h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('review.form.fields.type.description') }}
    </p>

    <div>
      <UFormField name="type">
        <URadioGroup
          v-model="selectedType"
          color="primary"
          variant="card"
          :items="types"
          :ui="{
            fieldset: 'grid grid-cols-1 md:grid-cols-2 gap-4',
            item: 'cursor-pointer'
          }"
        >
          <template #label="{ item }">
            <div class="flex items-center">
              <UIcon
                :name="item.icon"
                class="text-lg mx-2"
              />
              <span>{{ $t(`review.form.fields.type.types.${item.value}`) }}</span>
            </div>
          </template>
        </URadioGroup>
      </UFormField>
    </div>
  </UCard>
</template>
