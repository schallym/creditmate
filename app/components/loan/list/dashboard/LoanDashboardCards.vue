<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{
  loans: LoanWithCalculations[];
}>();
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <LoanDashboardCard
      v-for="loan in props.loans"
      :key="loan.id"
      :loan="loan"
    />
  </div>
</template>
