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
          Tous mes Prêts
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gérez tous vos prêts en un seul endroit
        </p>
      </div>
      <UButton
        color="primary"
        size="lg"
        to="/loans/add"
      >
        <template #leading>
          <UIcon name="i-heroicons-plus" />
        </template>
        Nouveau Prêt
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
