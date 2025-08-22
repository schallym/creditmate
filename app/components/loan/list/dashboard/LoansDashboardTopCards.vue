<script setup lang="ts">
const props = defineProps<{
  numberOfActiveLoans: number;
  totalRemainingBalance: string;
  totalMonthlyPayment: string;
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    <LoanTopCard
      :title="$t('loan.list.dashboard.activeLoans.title')"
      :main-value="props.numberOfActiveLoans"
      :sub-value="$t('loan.list.dashboard.activeLoans.description')"
      icon="i-lucide-euro"
    />
    <LoanTopCard
      :title="$t('loan.list.dashboard.totalRemainingBalance.title')"
      :main-value="props.totalRemainingBalance"
      :sub-value="$t('loan.list.dashboard.totalRemainingBalance.description')"
      icon="i-lucide-trending-down"
    />
    <LoanTopCard
      :title="$t('loan.list.dashboard.totalMonthlyPayment.title')"
      :main-value="props.totalMonthlyPayment"
      :sub-value="$t('loan.list.dashboard.totalMonthlyPayment.description')"
      icon="i-lucide-calendar"
    />
  </div>
</template>
