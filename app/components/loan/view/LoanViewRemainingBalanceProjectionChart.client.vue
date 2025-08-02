<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair } from '@unovis/vue';
import type { LoanWithCalculations } from '~~/server/types';

type DataRecord = {
  month: number;
  remainingBalance: number;
  formatted: {
    month: string;
    remainingBalance: string;
  };
};

const props = defineProps<{
  loan: LoanWithCalculations;
}>();

const x = (d: DataRecord) => d.month;
const y = (d: DataRecord) => d.remainingBalance;

// Calculate today's position in months from start date
const todayMonthOffset = () => {
  const startDate = new Date(props.loan.startDate);
  const today = new Date();

  const yearDiff = today.getFullYear() - startDate.getFullYear();
  const monthDiff = today.getMonth() - startDate.getMonth();

  return yearDiff * 12 + monthDiff;
};
const todayMonth = todayMonthOffset();

const template = (d: DataRecord) => {
  {
    return `
      <div class="font-semibold text-gray-800">
        ${$t('loan.view.remainingBalanceProjection.tooltip.month', { month: d.month })}
      </div>
      <div class="text-sm text-gray-600">${d.formatted.month}</div>
      <div class="font-medium text-blue-600">${d.formatted.remainingBalance}</div>
      <div class="text-xs text-gray-500">${$t('loan.view.remainingBalance.title')}</div>
  `;
  }
};
</script>

<template>
  <VisXYContainer
    :padding="{ right: 20 }"
    :data="props.loan.remainingBalanceProjectionData"
  >
    <VisLine
      v-if="todayMonth > 0"
      :x="todayMonth"
      :y="y"
      color="#6a7282"
      :line-dash-array="[5]"
    />
    <VisLine
      :x="x"
      :y="y"
    />
    <VisCrosshair
      :template="template"
      :x="x"
      :y="y"
    />
    <VisTooltip />
    <VisAxis
      type="x"
      :grid-line="false"
      :domain-line="false"
      :tick-line="false"
      :tick-format="(d: any) => `${$t('loan.view.remainingBalanceProjection.tooltip.month')} ${d}`"
      :num-ticks="Math.min(loan.termMonths, 8)"
    />
    <VisAxis
      type="y"
      :grid-line="false"
      :domain-line="false"
      :tick-line="false"
      :tick-format="(d: any) => `${d} €`"
    />
  </VisXYContainer>
</template>
