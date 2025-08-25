import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

export function useDebounceValue<T>(
  initialValue: T,
  delay: number = 300
) {
  const value = ref<T>(initialValue);
  const debouncedValue = ref<T>(initialValue);

  const updateDebouncedValue = useDebounceFn((newValue: T) => {
    debouncedValue.value = newValue;
  }, delay);

  watch(value, async (newValue) => {
    await updateDebouncedValue(newValue);
  });

  const immediate = (newValue: T) => {
    value.value = newValue;
    debouncedValue.value = newValue;
  };

  return {
    value,
    debouncedValue,
    immediate
  };
}
