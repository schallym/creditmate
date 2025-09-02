<script setup lang="ts">
import type { ListLoansResponse } from '~~/server/api/loans';

const { loggedIn } = useUserSession();

useHead({
  title: $t('meta.loans.title'),
  meta: [
    { name: 'description', content: $t('meta.loans.description') }
  ]
});

const { data: loansData } = await useFetch<ListLoansResponse>(`/api/loans`);
</script>

<template>
  <LoanListAnonym v-if="!loggedIn" />
  <LoanListDashboard
    v-else-if="loansData && loansData.loans && loansData.loans.length"
    :number-of-active-loans="loansData.numberOfActiveLoans"
    :total-remaining-balance="loansData.formattedTotalRemainingBalance"
    :total-monthly-payment="loansData.formattedTotalMonthlyPayment"
    :loans="loansData.loans"
  />
  <LoanListNoLoan v-else />
</template>
