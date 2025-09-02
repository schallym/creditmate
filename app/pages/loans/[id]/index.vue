<script setup lang="ts">
import { LoanStatus, type LoanWithCalculations } from '~~/server/types';

const route = useRoute();
const { loggedIn } = useUserSession();

useHead({
  title: $t('meta.viewLoan.title'),
  meta: [
    { name: 'description', content: $t('meta.viewLoan.description') }
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

const handleDelete = async () => {
  await $fetch(`/api/loan/${route.params.id}`, { method: 'DELETE' });
  await navigateTo('/loans');
};
</script>

<template>
  <div
    v-if="loan"
    class="p-6 space-y-6"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          v-if="loggedIn"
          size="lg"
          square
          color="neutral"
          to="/loans"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-5 h-5"
          />
        </UButton>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t(`loan.type.${loan.type}`) }}
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              {{ $t('common.with') }} {{ loan.lenderName }}
            </span>
          </h1>
          <p
            v-if="loan.description"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            {{ loan.description }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <DeleteButton
          v-if="loggedIn"
          :item="{ id: 1, name: 'Sample Item' }"
          :button-label="$t('common.action.delete')"
          @delete="handleDelete"
        />
        <UButton
          v-if="loan.status === LoanStatus.ACTIVE && loggedIn"
          color="primary"
          variant="solid"
          leading-icon="i-heroicons-pencil"
          :to="`/loans/${loan.id}/edit`"
        >
          {{ $t('loan.view.edit.button') }}
        </UButton>
        <UButton
          v-if="loan.status === LoanStatus.ACTIVE"
          leading-icon="i-heroicons-calculator"
          color="secondary"
          variant="solid"
          :to="`/loans/${loan.id}/early-repayment`"
        >
          {{ $t('loan.view.earlyRepaymentCalculator.button') }}
        </UButton>
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
    <LoanViewTopCards :loan="loan" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LoanViewProgress :loan="loan" />
      <LoanViewNextPayment :loan="loan" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LoanViewRemainingBalanceProjection :loan="loan" />
      <LoanViewPaymentsBreakdown :loan="loan" />
    </div>
  </div>
</template>
