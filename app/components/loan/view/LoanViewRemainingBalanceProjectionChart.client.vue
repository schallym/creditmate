<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair } from '@unovis/vue';
import type { LoanWithCalculations } from '~~/server/types';

const { locale } = useI18n();
const localeValue = locale.value ?? 'en';
const moneyFormatter = new Intl.NumberFormat(localeValue, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

type DataRecord = { x: number; y: number };

const props = defineProps<{
  loan: LoanWithCalculations;
}>();

const x = (d: DataRecord) => d.x;
const y = (d: DataRecord) => d.y;

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
    // Calculate the date based on start date + months
    const startDate = new Date(props.loan.startDate);
    const targetDate = new Date(startDate);
    targetDate.setMonth(startDate.getMonth() + d.x);

    const formattedDate = targetDate.toLocaleDateString(localeValue, {
      month: 'long',
      year: 'numeric'
    });

    return `
      <div class="font-semibold text-gray-800">
        ${$t('loan.view.remainingBalanceProjection.tooltip.month', { month: d.x })}
      </div>
      <div class="text-sm text-gray-600">${formattedDate}</div>
      <div class="font-medium text-blue-600">${moneyFormatter.format(d.y)}</div>
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
      :tick-format="(d: any) => `Mois ${d}`"
      :num-ticks="Math.min(loan.termMonths, 12)"
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
