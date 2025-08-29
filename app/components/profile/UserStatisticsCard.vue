<script setup lang="ts">
import type { User } from '~~/server/types';
import type { ListLoansResponse } from '~~/server/api/loans';

const { locale } = useI18n();
const monthYearFormatter = new Intl.DateTimeFormat(locale.value, {
  month: 'short',
  year: 'numeric'
});

const props = defineProps<{
  user: User;
}>();

const { data: loansData } = await useFetch<ListLoansResponse>(`/api/loans`);

const stats = ref({
  activeLoans: loansData.value?.numberOfActiveLoans,
  memberSince: monthYearFormatter.format(new Date(props.user.createdAt as string))
});
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('auth.profile.stats.title') }}
      </h3>
    </template>

    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-gray-600 dark:text-gray-300">
          {{ $t('auth.profile.stats.activeLoans.label') }}
        </span>
        <span class="font-bold text-blue-600">{{ stats.activeLoans }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-600 dark:text-gray-300">
          {{ $t('auth.profile.stats.memberSince.label') }}
        </span>
        <span class="font-semibold text-gray-900 dark:text-white capitalize">{{ stats.memberSince }}</span>
      </div>
    </div>
  </UCard>
</template>
