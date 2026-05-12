<script setup lang="ts">
import { type Loan, LoanType, type LoanWithCalculations } from '~~/server/types';
import { z } from 'zod';

useHead({
  title: $t('meta.simulation.title'),
  meta: [
    { name: 'description', content: $t('meta.simulation.description') }
  ]
});

const schema = computed(() => z.object({
  amount: z.number({ message: $t('loan.form.fields.amount.validation.required') })
    .gt(0, { message: $t('loan.form.fields.amount.validation.mustBePositive') }),
  interestRate: z.number({ message: $t('loan.form.fields.interestRate.validation.required') })
    .gt(0, { message: $t('loan.form.fields.interestRate.validation.mustBePositive') })
    .max(100, { message: $t('loan.form.fields.interestRate.validation.maxValue') }),
  termMonths: z.number({ message: $t('loan.form.fields.term.validation.required') })
    .min(1, { message: $t('loan.form.fields.term.validation.minValue') }),
  monthlyPayment: z.number().optional(),
  startDate: z.coerce.date({ message: $t('loan.form.fields.startDate.validation.required') }),
  description: z.string().optional()
}));

const loan = reactive<Loan>({
  type: LoanType.PERSONAL,
  lenderName: 'Simulation',
  amount: 0,
  interestRate: 0,
  termMonths: 0,
  monthlyPayment: 0,
  startDate: new Date(),
  description: ''
});

const loading = ref(false);
const simulationResult = ref<LoanWithCalculations | null>(null);
const resultsSection = ref<HTMLElement | null>(null);

const onSubmit = async () => {
  loading.value = true;
  simulationResult.value = null;

  try {
    const res = await $fetch<{ data: LoanWithCalculations }>('/api/simulate-loan', {
      method: 'POST',
      body: { ...loan }
    });

    simulationResult.value = res.data;

    nextTick(() => {
      resultsSection.value?.scrollIntoView({ behavior: 'smooth' });
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(error);
    useToast().add({
      title: $t('errors.title'),
      description: error.data?.message ?? $t('errors.internalServerError.message'),
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent mb-4">
          {{ $t('simulation.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          {{ $t('simulation.description') }}
        </p>
      </div>

      <UCard :ui="{ root: 'h-full flex flex-col divide-none' }">
        <template #header>
          <div class="px-6 py-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ $t('simulation.form.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              {{ $t('simulation.form.description') }}
            </p>
          </div>
        </template>

        <div class="px-6 pb-6">
          <UForm
            :schema="schema"
            :state="loan as any"
            @submit="onSubmit"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField
                :label="$t('loan.form.fields.amount.label')"
                name="amount"
                class="col-span-1"
              >
                <UInput
                  v-model="loan.amount"
                  type="number"
                  placeholder="0"
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-gray-500 text-sm">€</span>
                  </template>
                </UInput>
                <template #help>
                  <span class="text-gray-500 text-sm">
                    {{ $t('loan.form.fields.amount.help') }}
                  </span>
                </template>
              </UFormField>

              <UFormField
                :label="$t('loan.form.fields.interestRate.label')"
                name="interestRate"
                class="col-span-1"
              >
                <UInput
                  v-model="loan.interestRate"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-gray-500 text-sm">%</span>
                  </template>
                </UInput>
                <template #help>
                  <span class="text-gray-500 text-sm">
                    {{ $t('loan.form.fields.interestRate.help') }}
                  </span>
                </template>
              </UFormField>

              <UFormField
                :label="$t('loan.form.fields.term.label')"
                name="termMonths"
                class="col-span-1"
              >
                <UInput
                  v-model="loan.termMonths"
                  type="number"
                  placeholder="0"
                  size="lg"
                  class="w-full"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">
                    {{ $t('loan.form.fields.term.help') }}
                  </span>
                </template>
              </UFormField>

              <UFormField
                :label="$t('loan.form.fields.monthlyPayment.label')"
                name="monthlyPayment"
                class="col-span-1"
              >
                <LoanMonthlyPaymentInput
                  v-model="loan.monthlyPayment"
                  :loan="loan"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">
                    {{ $t('loan.form.fields.monthlyPayment.help') }}
                  </span>
                </template>
              </UFormField>

              <UFormField
                :label="$t('loan.form.fields.startDate.label')"
                name="startDate"
                class="col-span-1 md:col-span-2"
              >
                <DateInput
                  v-model="loan.startDate"
                  size="lg"
                  class="w-full"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">
                    {{ $t('loan.form.fields.startDate.help') }}
                  </span>
                </template>
              </UFormField>


            </div>

            <div class="flex justify-end mt-8 pt-6">
              <UButton
                type="submit"
                size="lg"
                :loading="loading"
                color="primary"
                variant="solid"
                class="w-full justify-center"
                leading-icon="i-heroicons-calculator"
              >
                {{ $t('simulation.form.action.simulate') }}
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>

      <UAlert
        :title="$t('common.notice')"
        icon="i-lucide-info"
        variant="subtle"
        :description="$t('loan.view.notice')"
        color="primary"
        class="mt-6"
      />

      <div
        v-if="simulationResult"
        ref="resultsSection"
        class="mt-8 space-y-6"
      >
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('simulation.results.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {{ $t('simulation.results.description') }}
          </p>
        </div>

        <LoanViewTopCards :loan="simulationResult" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoanViewProgress :loan="simulationResult" />
          <LoanViewNextPayment :loan="simulationResult" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoanViewRemainingBalanceProjection :loan="simulationResult" />
          <LoanViewPaymentsBreakdown :loan="simulationResult" />
        </div>
      </div>
    </div>
  </div>
</template>
