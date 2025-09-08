<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const rating = ref(props.modelValue || 0);
const hoveredRating = ref(0);

watch(() => props.modelValue, (newValue) => {
  rating.value = newValue;
});

const setRating = (star: number) => {
  rating.value = star;
  emit('update:modelValue', star);
};

const setHoveredRating = (star: number) => {
  hoveredRating.value = star;
};
</script>

<template>
  <UCard class="p-8">
    <div class="flex items-center gap-3 mb-4">
      <UIcon
        name="i-lucide-star"
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
      />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('review.form.fields.rating.label') }}
      </h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('review.form.fields.rating.description') }}
    </p>

    <div class="flex gap-2">
      <UButton
        v-for="star in 5"
        :key="star"
        variant="ghost"
        size="lg"
        class="p-2 rounded-lg transition-all duration-200"
        @click="setRating(star)"
        @mouseenter="setHoveredRating(star)"
        @mouseleave="setHoveredRating(0)"
      >
        <UIcon
          :name="star <= (hoveredRating || rating) ? 'i-heroicons-star-20-solid' : 'i-heroicons-star'"
          :class="[
            'w-8 h-8 transition-all duration-200',
            star <= (hoveredRating || rating)
              ? 'text-yellow-400'
              : 'text-gray-300 hover:text-gray-400'
          ]"
        />
      </UButton>
    </div>
    <UFormField
      name="rating"
      class="hidden"
    >
      <UInput
        v-model="rating"
        type="hidden"
      />
    </UFormField>
  </UCard>
</template>
