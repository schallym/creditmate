<script setup lang="ts">
import LoanViewTopCards from '~/components/loan/view/LoanViewTopCards.vue';
import type { LoanWithCalculations } from '~~/server/types';

const route = useRoute();

const { data: loan, error } = await useFetch<LoanWithCalculations>(`/api/loan/${route.params.id}`);

// Handle case where loan is not found
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'Loan not found'
  });
}
</script>

<template>
  <div
    v-if="loan"
    class="p-6 space-y-6"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('loan.label') }} <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> {{ $t('common.with') }} {{ loan.lenderName }} </span>
          </h1>
          <p
            v-if="loan.description"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            {{ loan.description }}
          </p>
        </div>
      </div>
      <UBadge
        :label="$t(`loan.type.${loan.type}`)"
        variant="subtle"
        color="primary"
        size="lg"
      />
    </div>
    <LoanViewTopCards :loan="loan" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LoanViewProgress :loan="loan" />
      <LoanViewNextPayment :loan="loan" />
    </div>

    <div class="flex flex-wrap gap-3 pt-4">
      <UButton
        color="primary"
        variant="solid"
      >
        {{ $t('loan.view.earlyRepaymentCalculator.button') }}
      </UButton>
    </div>
  </div>
</template>
