<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{ loan: LoanWithCalculations }>();
</script>

<template>
  <UCard :ui="{ root: 'h-full flex flex-col divide-none', header: 'pb-0' }">
    <template #header>
      <p class="text-lg font-semibold">
        {{ $t('loan.view.paymentBreakdown.title') }}
      </p>
      <p class="text-sm text-gray-500">
        {{ $t('loan.view.paymentBreakdown.description') }}
      </p>
    </template>
    <div class="space-y-2">
      <LoanViewPaymentBreakdownChart :loan="props.loan" />
    </div>
  </UCard>
</template>
