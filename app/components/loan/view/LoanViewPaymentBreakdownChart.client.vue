<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from '@unovis/vue';
import { Donut } from '@unovis/ts';
import type { LoanWithCalculations } from '~~/server/types';

const colorMode = useColorMode();

const props = defineProps<{
  loan: LoanWithCalculations;
}>();

const data = [props.loan.amount, props.loan.totalInterest];
const value = (d: number) => d;
const colors = ['#00C950', '#F0B100'];

const labels = [$t('loan.view.paymentBreakdown.amount'), $t('loan.view.paymentBreakdown.interest')];
const formattedValues = [
  props.loan.formatted.amount,
  props.loan.formatted.totalInterest
];
const legendItems = labels.map((name, i) => ({ name, color: colors[i] }));

const total = data.reduce((a, b) => a + b, 0);
const tooltipTriggers = {
  [Donut.selectors.segment]: (d: { data: number; index: number; value: number }) => {
    const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
    return `
      <div class="font-semibold text-gray-800">${labels[d.index]}</div>
      <div class="font-medium text-blue-600">${formattedValues[d.index]}</div>
      <div class="text-xs text-gray-500">${pct}%</div>
    `;
  }
};
</script>

<template>
  <VisSingleContainer
    :data="data"
    :style="`--vis-donut-segment-stroke-color: ${colorMode.value === 'dark' ? '#000' : '#fff'} ; --vis-donut-segment-stroke-width: 5px;`"
  >
    <VisDonut
      :arc-width="65"
      :value="value"
      :color="colors"
    />
    <VisTooltip :triggers="tooltipTriggers" />
  </VisSingleContainer>

  <div class="mt-3 flex justify-center gap-6">
    <div
      v-for="item in legendItems"
      :key="item.name"
      class="flex items-center gap-2"
    >
      <div
        class="w-3 h-3 rounded-full"
        :style="{ backgroundColor: item.color }"
      />
      <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.name }}</span>
    </div>
  </div>
</template>
