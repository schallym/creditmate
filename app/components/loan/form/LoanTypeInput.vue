<script setup lang="ts">
import { ref, computed } from 'vue';
import { LoanType } from '~~/server/types';

const props = defineProps<{ modelValue?: LoanType | null | undefined }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: LoanType): void;
}>();

const selectedLoanType = ref<LoanType | undefined>(props.modelValue ?? undefined);

const loanTypes = ref([
  { label: $t(`loan.type.${LoanType.MORTGAGE}`), value: LoanType.MORTGAGE, icon: 'i-lucide-house' },
  { label: $t(`loan.type.${LoanType.AUTO}`), value: LoanType.AUTO, icon: 'i-lucide-car' },
  { label: $t(`loan.type.${LoanType.PERSONAL}`), value: LoanType.PERSONAL, icon: 'i-lucide-credit-card' },
  { label: $t(`loan.type.${LoanType.STUDENT}`), value: LoanType.STUDENT, icon: 'i-lucide-book' },
  { label: $t(`loan.type.${LoanType.BUSINESS}`), value: LoanType.BUSINESS, icon: 'i-lucide-building-2' },
  { label: $t(`loan.type.${LoanType.OTHER}`), value: LoanType.OTHER }
]);
const loanTypeIcon = computed(() => loanTypes.value.find(item => item.value === selectedLoanType.value)?.icon);
</script>

<template>
  <USelect
    v-model="selectedLoanType"
    :items="loanTypes"
    :placeholder="$t('loan.form.fields.type.placeholder')"
    size="lg"
    :icon="loanTypeIcon"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
