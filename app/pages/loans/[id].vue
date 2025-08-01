<script setup lang="ts">
import LoanViewTopCards from '~/components/loan/view/LoanViewTopCards.vue';
import { LoanType, type LoanWithCalculations } from '~~/server/types';

const route = useRoute();

const { data: loan, error } = await useFetch<LoanWithCalculations>(`/api/loan/${route.params.id}`);

// Handle case where loan is not found
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'Loan not found'
  });
}

const loanTypeIcon = computed(() => {
  switch (loan.value?.type) {
    case LoanType.MORTGAGE:
      return 'i-lucide-house';
    case LoanType.AUTO:
      return 'i-lucide-car';
    case LoanType.PERSONAL:
      return 'i-lucide-credit-card';
    case LoanType.STUDENT:
      return 'i-lucide-book';
    case LoanType.BUSINESS:
      return 'i-lucide-building-2';
    default:
      return '';
  }
});
</script>

<template>
  <div
    v-if="loan"
    class="p-6 space-y-6"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t(`loan.type.${loan.type}`) }} <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> {{ $t('common.with') }} {{ loan.lenderName }} </span>
          </h1>
          <p
            v-if="loan.description"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            {{ loan.description }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <UBadge
          :label="$t(`loan.type.${loan.type}`)"
          variant="subtle"
          color="primary"
          size="lg"
          :icon="loanTypeIcon"
        />
        <UButton
          color="primary"
          variant="solid"
        >
          {{ $t('loan.view.earlyRepaymentCalculator.button') }}
        </UButton>
      </div>
    </div>
    <LoanViewTopCards :loan="loan" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LoanViewProgress :loan="loan" />
      <LoanViewNextPayment :loan="loan" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LoanViewRemainingBalanceProjection :loan="loan" />
    </div>
  </div>
</template>
