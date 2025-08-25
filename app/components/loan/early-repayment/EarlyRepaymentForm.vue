<script setup lang="ts">
import type { EarlyRepaymentData, LoanWithCalculations } from '~~/server/types';

const props = defineProps<{ loan: LoanWithCalculations }>();

const { value: additionalMonthlyPayment, debouncedValue: debouncedAdditionalPayment } = useDebounceValue<number>(0, 500);
const { value: oneTimePayment, debouncedValue: debouncedOneTimePayment } = useDebounceValue<number>(0, 500);

const isCalculating = ref(false);

const repaymentData = reactive({
  newPayoffDate: props.loan.formatted.repaymentDate,
  newDuration: props.loan.termMonths,
  newPaidOffPercentage: props.loan.paidOffPercentage,
  formattedInterestSavings: '0 €',
  timeSaved: '0 m',
  newMonthlyPayment: props.loan.formatted.monthlyPayment,
  newBalance: props.loan.formatted.remainingBalance
});

watch([debouncedAdditionalPayment, debouncedOneTimePayment], async () => {
  isCalculating.value = true;
  await updateRepaymentData(debouncedAdditionalPayment, debouncedOneTimePayment);
  isCalculating.value = false;
});

const updateRepaymentData = async (additionalMonthlyPayment?: Ref<number>, oneTimePayment?: Ref<number>): Promise<void> => {
  const res: EarlyRepaymentData = await $fetch(`/api/loan/${props.loan.id}/calculate-early-repayment`, {
    method: 'POST',
    body: {
      additionalMonthlyPayment: additionalMonthlyPayment?.value,
      oneTimePayment: oneTimePayment?.value
    }
  });

  repaymentData.newPayoffDate = res.newPayoffDate;
  repaymentData.newDuration = res.newDuration;
  repaymentData.newPaidOffPercentage = res.newPaidOffPercentage;
  repaymentData.formattedInterestSavings = res.formattedInterestSavings;
  repaymentData.timeSaved = res.timeSaved;
  repaymentData.newMonthlyPayment = res.formattedNewMonthlyPayment;
  repaymentData.newBalance = res.formattedNewBalance;
};
</script>

<template>
  <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="space-y-6">
      <UCard :ui="{ root: 'divide-none' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-calculator"
              class="w-6 h-6 text-blue-500"
            />
            <h3 class="text-lg font-semibold">
              {{ $t('loan.earlyRepaymentCalculator.parameters.title') }}
            </h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('loan.earlyRepaymentCalculator.parameters.description') }}
          </p>
        </template>

        <div class="space-y-6">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('loan.earlyRepaymentCalculator.parameters.summary.title') }}
            </h4>
            <div class="grid grid-cols-1 gap-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">
                  {{ $t('loan.earlyRepaymentCalculator.parameters.summary.remainingBalance') }}:
                </span>
                <span class="font-semibold">{{ props.loan.formatted.remainingBalance }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">
                  {{ $t('loan.earlyRepaymentCalculator.parameters.summary.monthlyPayment') }}:
                </span>
                <span class="font-semibold">{{ props.loan.formatted.monthlyPayment }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">
                  {{ $t('loan.earlyRepaymentCalculator.parameters.summary.remainingMonths') }}:
                </span>
                <span class="font-semibold">{{ props.loan.numberOfPaymentsLeft }}</span>
              </div>
            </div>
          </div>

          <div>
            <UFormField
              :label="$t('loan.earlyRepaymentCalculator.parameters.fields.monthlyExtraPayment.label')"
              size="lg"
            >
              <UInput
                v-model="additionalMonthlyPayment"
                type="number"
                placeholder="0"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">€</span>
                </template>
                <template #trailing>
                  <span class="text-gray-500 text-sm me-1">
                    {{ repaymentData.newMonthlyPayment }}
                    {{ $t('loan.earlyRepaymentCalculator.parameters.fields.monthlyExtraPayment.perMonth') }}
                  </span>
                </template>
              </UInput>
              <template #help>
                <span class="text-gray-500 text-sm">
                  {{ $t('loan.earlyRepaymentCalculator.parameters.fields.monthlyExtraPayment.help') }}
                </span>
              </template>
            </UFormField>
          </div>

          <div>
            <UFormField
              :label="$t('loan.earlyRepaymentCalculator.parameters.fields.oneTimeExtraPayment.label')"
              size="lg"
            >
              <UInput
                v-model="oneTimePayment"
                type="number"
                placeholder="0"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">€</span>
                </template>
                <template #trailing>
                  <span class="text-gray-500 text-sm me-1">
                    {{ repaymentData.newBalance }} {{ $t('loan.earlyRepaymentCalculator.parameters.fields.oneTimeExtraPayment.remaining') }}
                  </span>
                </template>
              </UInput>
              <template #help>
                <span class="text-gray-500 text-sm">
                  {{ $t('loan.earlyRepaymentCalculator.parameters.fields.oneTimeExtraPayment.help') }}
                </span>
              </template>
            </UFormField>
          </div>
        </div>
      </UCard>
    </div>

    <div class="space-y-6">
      <UCard :ui="{ root: 'divide-none' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-trending-down"
              class="w-6 h-6 text-teal-500"
            />
            <h3 class="text-lg font-semibold">
              {{ $t('loan.earlyRepaymentCalculator.impact.title') }}
            </h3>
            <UButton
              v-if="isCalculating"
              loading
              variant="ghost"
              size="sm"
              disabled
            >
              {{ $t('loan.earlyRepaymentCalculator.impact.calculating') }}
            </UButton>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('loan.earlyRepaymentCalculator.impact.description') }}
          </p>
        </template>

        <div class="space-y-6">
          <div class="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-green-700 dark:text-green-300 font-medium">
                {{ $t('loan.earlyRepaymentCalculator.impact.savedInterests.title') }}
              </span>
              <UIcon
                name="i-lucide-piggy-bank"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {{ repaymentData.formattedInterestSavings }}
            </div>
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ $t('loan.earlyRepaymentCalculator.impact.savedInterests.description') }}
            </p>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-blue-700 dark:text-blue-300 font-medium">
                {{ $t('loan.earlyRepaymentCalculator.impact.savedTime.title') }}
              </span>
              <UIcon
                name="i-lucide-clock"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {{ repaymentData.timeSaved }}
            </div>
            <p class="text-sm text-blue-600 dark:text-blue-400">
              {{ $t('loan.earlyRepaymentCalculator.impact.savedTime.description') }}
            </p>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('loan.earlyRepaymentCalculator.impact.progression.title') }}
            </h4>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>{{ $t('loan.earlyRepaymentCalculator.impact.progression.actual') }}</span>
                  <span>{{ props.loan.termMonths }} {{ $t('common.month') }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <UProgress :model-value="props.loan.paidOffPercentage" />
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>{{ $t('loan.earlyRepaymentCalculator.impact.progression.withExtraPayments') }}</span>
                  <span>{{ repaymentData.newDuration }} {{ $t('common.month') }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <UProgress
                    :ui="{ indicator: 'bg-teal-500' }"
                    :model-value="repaymentData.newPaidOffPercentage"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {{ $t('loan.earlyRepaymentCalculator.impact.newPaymentDate.title') }}
            </h4>
            <div class="text-xl font-semibold text-gray-800 dark:text-gray-200">
              <span v-if="repaymentData.newPayoffDate !== props.loan.formatted.repaymentDate">
                {{ props.loan.formatted.repaymentDate }} →
              </span>
              {{ repaymentData.newPayoffDate }}
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
