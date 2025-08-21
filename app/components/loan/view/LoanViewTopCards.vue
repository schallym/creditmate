<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{ loan: LoanWithCalculations }>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <LoanTopCard
      :title="$t('loan.view.remainingBalance.title')"
      :main-value="props.loan.formatted.remainingBalance"
      :sub-value="$t('loan.view.remainingBalance.subTitle', { percent: props.loan.formatted.paidOffPercentage })"
      icon="i-lucide-euro"
    />
    <LoanTopCard
      :title="$t('loan.view.monthlyPayment.title')"
      :main-value="props.loan.formatted.monthlyPayment"
      :sub-value="$t('loan.view.monthlyPayment.subTitle', { date: props.loan.formatted.nextPaymentDate })"
      icon="i-lucide-calendar"
    />
    <LoanTopCard
      :title="$t('loan.view.interestRate.title')"
      :main-value="props.loan.formatted.interestRate"
      :sub-value="$t('loan.view.interestRate.subTitle')"
      icon="i-lucide-percent"
    />
    <LoanTopCard
      :title="$t('loan.view.repaymentDate.title')"
      :main-value="props.loan.formatted.repaymentDate"
      :sub-value="$t('loan.view.repaymentDate.subTitle', { number: props.loan.numberOfPaymentsLeft })"
      icon="i-lucide-clock"
    />
  </div>
</template>
