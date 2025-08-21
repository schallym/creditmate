<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const props = defineProps<{
  loan: LoanWithCalculations;
}>();
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
        color="success"
        variant="soft"
      >
        Actif <!-- TODO -->
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
          Solde restant
        </p>
        <p class="font-semibold text-blue-600 dark:text-blue-400">
          {{ props.loan.formatted.remainingBalance }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Mensualité
        </p>
        <p class="font-semibold">
          {{ props.loan.formatted.monthlyPayment }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Taux
        </p>
        <p class="font-semibold">
          {{ props.loan.formatted.interestRate }}
        </p>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Mois restants
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
        Détails
      </UButton>
      <UButton
        size="lg"
        color="neutral"
        class="flex-1 w-full justify-center"
      >
        <template #leading>
          <UIcon name="i-heroicons-calculator" />
        </template>
        Calculer
      </UButton>
    </div>
  </ucard>
</template>
