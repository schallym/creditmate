<script setup lang="ts">
import { getLocalTimeZone, today, parseDate } from '@internationalized/date';

const props = defineProps<{ modelValue?: string | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectedDate = shallowRef(props.modelValue ? parseDate(props.modelValue) : today(getLocalTimeZone()));
const inputDate = computed({
  get: () => selectedDate.value?.toString(),
  set: (val: string) => {
    if (val) selectedDate.value = parseDate(val);
  }
});

watch(selectedDate, (newDate) => {
  emit('update:modelValue', newDate.toString());
});
</script>

<template>
  <UPopover>
    <UInput
      v-model="inputDate"
      type="date"
      size="lg"
      class="w-full"
    />

    <template #content>
      <UCalendar
        v-model="selectedDate"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
