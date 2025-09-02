<script setup lang="ts">
const { maxLength = 600, placeholder, modelValue, label, name, size = 'md' } = defineProps<{
  maxLength?: number;
  label?: string;
  name: string;
  placeholder: string;
  modelValue: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const value = ref(modelValue);
const counter = ref(0);

watch(() => modelValue, (newValue) => {
  value.value = newValue;
  counter.value = newValue.length;
});

watch(value, (newValue) => {
  counter.value = newValue.length;
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :size="size ?? 'md'"
  >
    <UTextarea
      v-model="value"
      :placeholder="placeholder"
      :rows="6"
      size="lg"
      class="w-full"
      :maxlength="maxLength"
    />
    <div class="flex justify-end mt-2">
      <span
        :class="[
          'text-xs',
          counter >= maxLength
            ? 'text-red-500'
            : counter >= maxLength * 0.9
              ? 'text-amber-500'
              : 'text-gray-500'
        ]"
      >
        {{ counter }}/{{ maxLength }}
      </span>
    </div>
  </UFormField>
</template>

<style scoped>

</style>
