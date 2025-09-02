<script setup lang="ts">
import type { LoanWithCalculations } from '~~/server/types';

const route = useRoute();

useHead({
  title: $t('meta.editLoan.title'),
  meta: [
    { name: 'description', content: $t('meta.editLoan.description') }
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
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {{ $t('loan.edit.title') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('loan.edit.description') }}
            </p>
          </div>
        </div>
      </div>
      <UCard :ui="{ root: 'h-full flex flex-col divide-none' }">
        <template #header>
          <div class="px-6 py-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ $t('loan.form.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              {{ $t('loan.form.description') }}
            </p>
          </div>
        </template>

        <div class="px-6 pb-6">
          <LoanForm
            :model-value="loan"
            :button-text="$t('loan.edit.button')"
            :hide-cancel-button="true"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
