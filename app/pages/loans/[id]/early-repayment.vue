<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const route = useRoute();

useHead({
  title: $t('meta.earlyRepayment.title'),
  meta: [
    { name: 'description', content: $t('meta.earlyRepayment.description') }
  ]
});

const { data: loan, error } = await useFetch<LoanWithCalculations>(`/api/loan/${route.params.id}`);

// Handle case where loan is not found
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'Loan not found',
    message: error.value.data.message || 'Loan not found'
  });
}
</script>

<template>
  <div class="p-4">
    <div class="max-w-6xl mx-auto mb-6">
      <div class="flex items-center gap-4 mb-4">
        <UButton
          size="lg"
          square
          color="neutral"
          :to="`/loans/${route.params.id}`"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-5 h-5"
          />
        </UButton>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            {{ $t('loan.earlyRepaymentCalculator.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('loan.earlyRepaymentCalculator.description') }}
          </p>
        </div>
      </div>
      <UAlert
        :title="$t('common.notice')"
        icon="i-lucide-info"
        variant="subtle"
        :description="$t('loan.view.notice')"
        color="primary"
        class="mb-4"
      />
    </div>

    <EarlyRepaymentForm
      v-if="loan"
      :loan="loan"
    />
  </div>
</template>
