<script setup lang="ts">
import type { Loan } from '~~/server/interfaces';
import { calculateMonthlyPayment } from '~~/server/services';

const props = defineProps<{
  modelValue?: number | undefined;
  loan: Loan;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const monthlyPayment = ref<number>(props.modelValue || 0);

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== monthlyPayment.value) {
    monthlyPayment.value = newValue;
  }
}, { immediate: true });

const calculatePayment = () => {
  if (!props.loan.amount || !props.loan.interestRate || !props.loan.termMonths) {
    useToast().add({
      title: $t('common.missingInformation'),
      description: $t('loan.form.fields.monthlyPayment.calculate.missingFieldsMessage'),
      color: 'warning'
    });
    return;
  }

  monthlyPayment.value = calculateMonthlyPayment(props.loan.amount, props.loan.interestRate, props.loan.termMonths);

  emit('update:modelValue', monthlyPayment.value);

  useToast().add({
    title: $t('loan.form.fields.monthlyPayment.calculate.success.title'),
    description: $t('loan.form.fields.monthlyPayment.calculate.success.message', {
      amount: monthlyPayment.value.toFixed(2)
    }),
    color: 'success'
  });
};
</script>

<template>
  <UInput
    v-model="monthlyPayment"
    type="number"
    step="0.01"
    placeholder="0"
    size="lg"
    class="w-full"
  >
    <template #trailing>
      <span class="text-gray-500 text-sm me-1">€</span>
      <UButton
        size="xs"
        variant="ghost"
        icon="i-heroicons-calculator"
        class="mr-2"
        @click="calculatePayment"
      >
        {{ $t('common.action.calculate') }}
      </UButton>
    </template>
  </UInput>
</template>
