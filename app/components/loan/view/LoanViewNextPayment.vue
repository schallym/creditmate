<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{
  loan: LoanWithCalculations;
}>();
</script>

<template>
  <UCard :ui="{ root: 'h-full flex flex-col divide-none', header: 'pb-0' }">
    <template #header>
      <p class="text-lg font-semibold">
        {{ $t('loan.view.nextPayment.title') }}
      </p>
      <p class="text-sm text-gray-500">
        {{ $t('loan.view.nextPayment.description') }}
      </p>
    </template>
    <div class="space-y-2">
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full" />
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ $t('loan.view.nextPayment.principal.label') }}
          </span>
        </div>
        <span class="text-green-600 font-medium">{{ props.loan.formatted.nextMonthAmount }}</span>
      </div>
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full" />
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ $t('loan.view.nextPayment.interest.label') }}
          </span>
        </div>
        <span class="text-yellow-500 font-medium">{{ props.loan.formatted.nextMonthInterest }}</span>
      </div>
      <div class="flex justify-between border-t pt-2 mt-2">
        <span class="text-sm font-semibold">
          {{ $t('loan.view.nextPayment.totalPayment.label') }}
        </span>
        <span class="text-blue-600 font-bold">{{ props.loan.formatted.monthlyPayment }}</span>
      </div>
    </div>
  </UCard>
</template>
