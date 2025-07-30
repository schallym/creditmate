<script setup lang="ts">
import type { LoanType, Loan } from '~~/server/interfaces';

const loan = ref<Loan>({
  type: '' as LoanType,
  lenderName: '',
  amount: 0,
  interestRate: 0,
  termMonths: 0,
  monthlyPayment: 0,
  startDate: new Date(),
  description: ''
});

const updateLoan = (updatedLoan: Loan) => {
  loan.value = updatedLoan;
};
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-500 mb-4">
          {{ $t('loan.add.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          {{ $t('loan.add.description') }}
        </p>
      </div>
      <UCard :ui="{ root: 'h-full flex flex-col divide-none' }">
        <template #header>
          <div class="px-6 py-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ $t('loan.form.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              {{ $t('loan.form.description') }}
            </p>
          </div>
        </template>

        <div class="px-6 pb-6">
          <LoanForm
            :model-value="loan"
            @update:model-value="updateLoan"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
