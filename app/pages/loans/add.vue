<script setup lang="ts">
import { loanValidationSchema } from '~~/server/services';
import type { LoanType } from '~~/server/interfaces';

const loading = ref(false);
const autoCalculate = ref(false);

// Form state
const state = reactive<{
  loanType: LoanType | null;
  lenderName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  loanTerm: number | null;
  monthlyPayment: number | null;
  startDate: string | null;
  description: string;
}>({
  loanType: null,
  lenderName: null,
  principalAmount: null,
  interestRate: null,
  loanTerm: null,
  monthlyPayment: null,
  startDate: null,
  description: ''
});

// Calculate monthly payment
const calculatePayment = () => {
  if (!state.principalAmount || !state.interestRate || !state.loanTerm) {
    useToast().add({
      title: 'Missing Information',
      description: 'Please fill in principal amount, interest rate, and loan term first.',
      color: 'warning'
    });
    return;
  }

  const monthlyRate = state.interestRate / 100 / 12;
  const numberOfPayments = state.loanTerm * 12;

  if (monthlyRate === 0) {
    state.monthlyPayment = Number((state.principalAmount / numberOfPayments).toFixed(2));
  } else {
    const monthlyPayment = state.principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
      / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    state.monthlyPayment = Number(monthlyPayment.toFixed(2));
  }

  useToast().add({
    title: 'Payment Calculated',
    description: `Monthly payment: $${state.monthlyPayment}`,
    color: 'success'
  });
};

// Form submission
const onSubmit = async (data: unknown) => {
  loading.value = true;

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Loan data:', data);

    useToast().add({
      title: 'Loan Added Successfully',
      description: 'Your loan has been added to your dashboard.',
      color: 'success'
    });

    // Redirect to dashboard or loan list
    await navigateTo('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: 'Failed to add loan. Please try again.',
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-500 mb-4">
          Add Your Loan
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          Enter your loan details to start tracking your financial journey with CreditMate
        </p>
      </div>

      <!-- Form Card -->
      <UCard :ui="{ root: 'h-full flex flex-col divide-none' }">
        <template #header>
          <div class="px-6 py-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Loan Information
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              Fill in the details below to add your loan to the dashboard
            </p>
          </div>
        </template>

        <div class="px-6 pb-6">
          <UForm
            :schema="loanValidationSchema"
            :state="state as any"
            @submit="onSubmit"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Loan Type -->
              <UFormField
                label="Loan Type"
                name="loanType"
                class="col-span-1"
              >
                <LoanTypeInput
                  v-model="state.loanType"
                  class="col-span-1"
                />
              </UFormField>

              <!-- Lender Name -->
              <UFormField
                label="Lender Name"
                name="lenderName"
                class="col-span-1"
              >
                <UInput
                  v-model="state.lenderName"
                  placeholder="e.g., Wells Fargo, Chase Bank"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <!-- Principal Amount -->
              <UFormField
                label="Principal Amount"
                name="principalAmount"
                class="col-span-1"
              >
                <UInput
                  v-model="state.principalAmount"
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
                  <span class="text-gray-500 text-sm">The total amount you borrowed</span>
                </template>
              </UFormField>

              <!-- Interest Rate -->
              <UFormField
                label="Interest Rate (%)"
                name="interestRate"
                class="col-span-1"
              >
                <UInput
                  v-model="state.interestRate"
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
                  <span class="text-gray-500 text-sm">Annual percentage rate (APR)</span>
                </template>
              </UFormField>

              <!-- Loan Term -->
              <UFormField
                label="Loan Term (months)"
                name="loanTerm"
                class="col-span-1"
              >
                <UInput
                  v-model="state.loanTerm"
                  type="number"
                  placeholder="0"
                  size="lg"
                  class="w-full"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">Length of the loan in months</span>
                </template>
              </UFormField>

              <!-- Monthly Payment -->
              <UFormField
                label="Monthly Payment"
                name="monthlyPayment"
                class="col-span-1"
              >
                <div class="relative">
                  <UInput
                    v-model="state.monthlyPayment"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    size="lg"
                    :disabled="autoCalculate"
                    class="w-full"
                  >
                    <template #trailing>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-heroicons-calculator"
                        class="mr-2"
                        @click="calculatePayment"
                      >
                        Calculate
                      </UButton>
                    </template>
                  </UInput>
                </div>
                <template #help>
                  <span class="text-gray-500 text-sm">Leave empty to calculate automatically</span>
                </template>
              </UFormField>

              <!-- Loan Start Date -->
              <UFormField
                label="Loan Start Date"
                name="startDate"
                class="col-span-1 md:col-span-2"
              >
                <DateInput
                  v-model="state.startDate"
                  size="lg"
                  class="w-full"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">When did you start this loan?</span>
                </template>
              </UFormField>

              <!-- Description -->
              <UFormField
                label="Description (Optional)"
                name="description"
                class="col-span-1 md:col-span-2"
              >
                <UTextarea
                  v-model="state.description"
                  placeholder="e.g., Primary residence mortgage, Car loan for Honda Civic"
                  :rows="2"
                  size="lg"
                  class="w-full"
                />
                <template #help>
                  <span class="text-gray-500 text-sm">Add a note to help you identify this loan</span>
                </template>
              </UFormField>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 mt-8 pt-6">
              <UButton
                type="submit"
                size="lg"
                :loading="loading"
                color="success"
                variant="solid"
                class="w-full justify-center"
              >
                Add Loan
              </UButton>
              <UButton
                size="lg"
                :loading="loading"
                color="neutral"
                to="/"
              >
                Cancel
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </div>
  </div>
</template>
