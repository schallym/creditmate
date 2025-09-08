<script setup lang="ts">
import { LoanType, type Loan } from '~~/server/types';
import { z } from 'zod';

const { loggedIn } = useUserSession();

const schema = computed(() => z.object({
  type: z.enum(LoanType, { message: $t('loan.form.fields.type.validation.required') }),
  lenderName: z.string().min(1, { message: $t('loan.form.fields.lenderName.validation.required') }),
  amount: z.number({ message: $t('loan.form.fields.amount.validation.required') })
    .gt(0, { message: $t('loan.form.fields.amount.validation.mustBePositive') }),
  interestRate: z.number({ message: $t('loan.form.fields.interestRate.validation.required') })
    .gt(0, { message: $t('loan.form.fields.interestRate.validation.mustBePositive') })
    .max(100, { message: $t('loan.form.fields.interestRate.validation.maxValue') }),
  termMonths: z.number({ message: $t('loan.form.fields.term.validation.required') })
    .min(1, { message: $t('loan.form.fields.term.validation.minValue') }),
  monthlyPayment: z.number().optional(),
  startDate: z.coerce.date({ message: $t('loan.form.fields.startDate.validation.required') }),
  description: z.string().optional(),
  termsAccepted: z.boolean().refine(val => loggedIn.value || val === true, {
    message: $t('loan.form.fields.termsAccepted.validation.accept')
  })
}));

const props = defineProps<{
  modelValue?: Loan | null | undefined;
  buttonText?: string;
  hideCancelButton?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Loan): void;
}>();

const loan = reactive<Loan & { termsAccepted: boolean }>({
  type: props.modelValue?.type ?? '' as LoanType,
  lenderName: props.modelValue?.lenderName ?? '',
  amount: props.modelValue?.amount ?? 0,
  interestRate: props.modelValue?.interestRate ?? 0,
  termMonths: props.modelValue?.termMonths ?? 0,
  monthlyPayment: props.modelValue?.monthlyPayment ?? 0,
  startDate: props.modelValue?.startDate ?? new Date(),
  description: props.modelValue?.description ?? '',
  termsAccepted: false
});
const loading = ref(false);

watch(loan, (updatedLoan: Loan) => {
  emit('update:modelValue', updatedLoan);
}, { deep: true });

const onSubmit = async () => {
  loading.value = true;

  try {
    if (!loan.monthlyPayment || Number(loan.monthlyPayment) <= 0) {
      const res = await $fetch('/api/calculate-monthly-payment', {
        method: 'POST',
        body: {
          amount: loan.amount,
          interestRate: loan.interestRate,
          termMonths: loan.termMonths
        }
      });

      loan.monthlyPayment = res.monthlyPayment;
    }

    const isEdit = !!props.modelValue?.id;

    if (isEdit) {
      loan.id = props.modelValue?.id;
      const res = await $fetch(`/api/loan/${props.modelValue?.id}`, {
        method: 'PATCH',
        body: { ...loan }
      });

      emit('update:modelValue', loan);

      useToast().add({
        title: $t('loan.edit.toast.updateSuccess.title'),
        description: $t('loan.edit.toast.updateSuccess.description'),
        color: 'success'
      });

      navigateTo(`/loans/${res.data.id}`);
      return;
    }

    const res = await $fetch('/api/loan', {
      method: 'POST',
      body: { ...loan as Loan }
    });

    emit('update:modelValue', loan);

    useToast().add({
      title: $t('loan.add.toast.createSuccess.title'),
      description: $t('loan.add.toast.createSuccess.title'),
      color: 'success'
    });

    navigateTo(`/loans/${res.data.id}`);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(error);
    useToast().add({
      title: $t('errors.title'),
      description: error.data.message ?? $t('errors.internalServerError.message'),
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UForm
    :schema="schema"
    :state="loan as any"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField
        :label="$t('loan.form.fields.type.label')"
        name="type"
        class="col-span-1"
      >
        <LoanTypeInput
          v-model="loan.type as LoanType"
          class="col-span-1"
        />
      </UFormField>

      <UFormField
        :label="$t('loan.form.fields.lenderName.label')"
        name="lenderName"
        class="col-span-1"
      >
        <UInput
          v-model="loan.lenderName"
          :placeholder="$t('loan.form.fields.lenderName.placeholder')"
          size="lg"
          class="w-full"
        />
      </UFormField>

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
        <div class="relative">
          <LoanMonthlyPaymentInput
            v-model="loan.monthlyPayment"
            :loan="loan"
          />
        </div>
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

      <UFormField
        :label="`${$t('loan.form.fields.amount.label')} (${$t('common.optional')})`"
        name="description"
        class="col-span-1 md:col-span-2"
      >
        <UTextarea
          v-model="loan.description"
          :placeholder="$t('loan.form.fields.description.placeholder')"
          :rows="2"
          size="lg"
          class="w-full"
        />
        <template #help>
          <span class="text-gray-500 text-sm">
            {{ $t('loan.form.fields.description.help') }}
          </span>
        </template>
      </UFormField>
    </div>

    <UFormField
      name="termsAccepted"
      class="mt-4"
      required
      size="xl"
    >
      <UCheckbox
        v-if="!loggedIn"
        v-model="loan.termsAccepted"
      >
        <template #label>
          <span>
            {{ $t('loan.form.fields.termsAccepted.label') }}
            <NuxtLink
              to="/legal/terms"
              class="text-primary-600 hover:underline"
            >
              {{ $t('loan.form.fields.termsAccepted.link') }}
            </NuxtLink>
          </span>
        </template>
      </UCheckbox>
    </UFormField>
    <UAlert
      v-if="!loggedIn"
      :title="$t('common.notice')"
      icon="i-lucide-info"
      variant="subtle"
      :description="$t('loan.add.anonymousNotice')"
      color="primary"
      class="mt-4"
    />

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
        {{ props.buttonText ?? $t('loan.form.action.addLoan') }}
      </UButton>
      <UButton
        v-if="!props.hideCancelButton"
        size="lg"
        :loading="loading"
        color="neutral"
        to="/"
      >
        {{ $t('common.action.cancel') }}
      </UButton>
    </div>
  </UForm>
</template>
