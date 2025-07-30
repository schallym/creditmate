<script setup lang="ts">
import { getLocalTimeZone, today, parseDate } from '@internationalized/date';

const props = defineProps<{ modelValue?: Date | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void;
}>();

const selectedDate = shallowRef(props.modelValue ? parseDate(props.modelValue.toISOString().substring(0, 10)) : today(getLocalTimeZone()));
const inputDate = computed({
  get: () => selectedDate.value?.toString(),
  set: (val: string) => {
    if (val) selectedDate.value = parseDate(val);
  }
});

watch(selectedDate, (newDate) => {
  emit('update:modelValue', newDate.toDate(getLocalTimeZone()));
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
