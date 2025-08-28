<script setup lang="ts">
import { getLocalTimeZone, today, parseDate } from '@internationalized/date';

const props = defineProps<{ modelValue?: Date | null | string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void;
}>();

const date = ref<Date | null>(null);
if (props.modelValue && typeof props.modelValue === 'string') {
  date.value = new Date(props.modelValue);
}

const selectedDate = shallowRef(date.value ? parseDate(date.value.toISOString().substring(0, 10)) : today(getLocalTimeZone()));
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
