<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{
  numberOfActiveLoans: number;
  totalRemainingBalance: string;
  totalMonthlyPayment: string;
  loans: LoanWithCalculations[];
}>();
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          {{ $t('loan.list.dashboard.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ $t('loan.list.dashboard.description') }}
        </p>
      </div>
      <UButton
        color="primary"
        size="lg"
        to="/loans/add"
        variant="solid"
      >
        <template #leading>
          <UIcon name="i-heroicons-plus" />
        </template>
        {{ $t('loan.list.dashboard.cta.addLoan') }}
      </UButton>
    </div>

    <LoansDashboardTopCards
      :number-of-active-loans="numberOfActiveLoans"
      :total-remaining-balance="totalRemainingBalance"
      :total-monthly-payment="totalMonthlyPayment"
    />
    <LoanDashboardCards :loans="props.loans" />
  </div>
</template>
