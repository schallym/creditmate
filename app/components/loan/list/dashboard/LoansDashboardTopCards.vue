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
      title="Prêts Actifs"
      :main-value="props.numberOfActiveLoans"
      sub-value="1 prêts remboursés"
      icon="i-lucide-euro"
    />
    <LoanTopCard
      title="Total Restant"
      :main-value="props.totalRemainingBalance"
      sub-value="Solde total à rembourser"
      icon="i-lucide-trending-down"
    />
    <LoanTopCard
      title="Mensualités Totales"
      :main-value="props.totalMonthlyPayment"
      sub-value="Paiements mensuels combinés"
      icon="i-lucide-calendar"
    />
  </div>
</template>
