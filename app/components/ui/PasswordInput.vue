<script setup lang="ts">
interface Props {
  label: string;
  placeholder: string;
  name: string;
  modelValue: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const passwordValue = ref<string | null | undefined>();
const showPassword = ref(false);

if (props.modelValue) {
  passwordValue.value = props.modelValue;
}

watch(passwordValue, (newValue) => {
  emit('update:modelValue', newValue || '');
});

watch(() => props.modelValue, () => {
  showPassword.value = false;
  passwordValue.value = props.modelValue;
});
</script>

<template>
  <UFormField
    :label="props.label"
    :name="props.name"
    class="mt-4"
    required
    :size="props.size ?? 'xl'"
  >
    <UInput
      v-model="passwordValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="props.placeholder"
      class="w-full"
    >
      <template #trailing>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-700 cursor-pointer"
          :aria-label="$t('auth.property.confirmPassword.input.display')"
          @click="showPassword = !showPassword"
        >
          <UIcon
            :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            class="h-5 w-5"
          />
        </button>
      </template>
    </UInput>
  </UFormField>
</template>
