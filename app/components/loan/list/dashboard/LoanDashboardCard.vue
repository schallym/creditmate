<script setup lang="ts">
import { LoanStatus, type LoanWithCalculations } from '~~/server/types';

const props = defineProps<{
  loan: LoanWithCalculations;
}>();

const statusColor = computed(() => {
  switch (props.loan.status) {
    case LoanStatus.ACTIVE:
      return 'success';
    default:
      return 'neutral';
  }
});
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div>
          <UIcon
            name="i-heroicons-home"
            class="size-5 text-blue-600 dark:text-blue-400"
          />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t(`loan.type.${props.loan.type}`) }}
          </h3>
          <p
            v-if="!!props.loan.description"
            class="text-sm text-gray-500"
          >
            {{ props.loan.description }}
          </p>
        </div>
      </div>
      <UBadge
        :color="statusColor"
        variant="soft"
      >
        {{ $t(`loan.list.dashboard.card.status.${props.loan.status}`) }}
      </UBadge>
    </div>

    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Progression</span>
        <span class="text-sm font-medium">{{ props.loan.formatted.paidOffPercentage }}</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-1">
        <UProgress :model-value="loan.paidOffPercentage" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("loan.list.dashboard.card.remainingBalance.title") }}
        </p>
        <p class="font-semibold text-blue-600 dark:text-blue-400">
          {{ props.loan.formatted.remainingBalance }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("loan.list.dashboard.card.monthlyPayment.title") }}
        </p>
        <p class="font-semibold">
          {{ props.loan.formatted.monthlyPayment }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("loan.list.dashboard.card.rate.title") }}
        </p>
        <p class="font-semibold">
          {{ props.loan.formatted.interestRate }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("loan.list.dashboard.card.remainingMonthNumber.title") }}
        </p>
        <p class="font-semibold">
          {{ props.loan.numberOfPaymentsLeft }}
        </p>
      </div>
    </div>

    <div class="flex gap-2">
      <UButton
        size="lg"
        color="neutral"
        class="flex-1 w-full justify-center"
        :to="`/loans/${props.loan.id}`"
      >
        <template #leading>
          <UIcon name="i-heroicons-eye" />
        </template>
        {{ $t("loan.list.dashboard.card.cta.viewDetails") }}
      </UButton>
      <UButton
        v-if="props.loan.status === LoanStatus.ACTIVE"
        size="lg"
        color="neutral"
        class="flex-1 w-full justify-center"
        :to="`loans/${props.loan.id}/early-repayment`"
      >
        <template #leading>
          <UIcon name="i-heroicons-calculator" />
        </template>
        {{ $t("loan.list.dashboard.card.cta.calculate") }}
      </UButton>
    </div>
  </ucard>
</template>
