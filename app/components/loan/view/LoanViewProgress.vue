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
        {{ $t('loan.view.progress.title') }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t('loan.view.progress.description') }}
      </p>
    </template>
    <div>
      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{{ $t('loan.view.progress.principalPaid.label') }}</span>
          <span>{{ props.loan.formatted.amountPaidOff }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <UProgress :model-value="loan.paidOffPercentage" />
        </div>
        <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
          <span>0%</span>
          <span>{{ $t('loan.view.progress.principalPaid.completePercent', { percent: props.loan.formatted.paidOffPercentage }) }}</span>
          <span>100%</span>
        </div>
      </div>
      <div class="text-sm space-y-1 grid grid-cols-2">
        <p>{{ $t('loan.view.progress.originalAmount.label') }}: <span class="font-semibold">{{ props.loan.formatted.amount }}</span></p>
        <p>{{ $t('loan.view.progress.totalPaid.label') }}: <span class="font-semibold">{{ props.loan.formatted.totalPaidOff }}</span></p>
        <p>{{ $t('loan.view.progress.totalInterest.label') }}: <span class="font-semibold text-yellow-500">{{ props.loan.formatted. totalInterest }}</span></p>
        <p>{{ $t('loan.view.progress.totalInterestPaid.label') }}: <span class="font-semibold text-yellow-500">{{ props.loan.formatted.totalInterestPaidOff }}</span></p>
      </div>
    </div>
  </UCard>
</template>
