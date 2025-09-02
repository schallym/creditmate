<script setup lang="ts">
const { modelValue, label, name, placeholder, size = 'md', icon } = defineProps<{
  modelValue: string;
  label: string;
  name: string;
  placeholder: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const value = ref(modelValue);

watch(() => modelValue, (newValue) => {
  value.value = newValue;
});

watch(value, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :size="size ?? 'md'"
  >
    <UInput
      v-model="value"
      :placeholder="placeholder"
      class="w-full"
      :icon="icon"
      :ui="{ trailing: 'pe-1' }"
    >
      <template
        v-if="value?.length"
        #trailing
      >
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          :aria-label="$t('common.action.clear')"
          @click="value = ''"
        />
      </template>
    </UInput>
  </UFormField>
</template>
