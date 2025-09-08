<script setup lang="ts">
import { reactive, ref } from 'vue';
import { z } from 'zod';

useHead({
  title: $t('meta.forgotPassword.title'),
  meta: [
    { name: 'description', content: $t('meta.forgotPassword.description') }
  ]
});

const schema = z.object({
  email: z.email($t('auth.property.email.validation.invalid'))
});

const state = reactive({ email: '' });
const loading = ref(false);
const submitted = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    // TODO: Implement forgot password API endpoint
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { ...state }
    });

    submitted.value = true;
    useToast().add({
      title: $t('auth.forgotPassword.toast.success.title'),
      description: $t('auth.forgotPassword.toast.success.description'),
      color: 'success'
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    useToast().add({
      title: $t('auth.forgotPassword.toast.error.title'),
      description: error.data?.message || $t('auth.forgotPassword.toast.error.description'),
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center p-6">
    <UCard
      :ui="{ root: 'h-full flex flex-col divide-none' }"
      class="w-full max-w-md shadow-xl"
    >
      <template #header>
        <div class="text-center">
          <div class="mx-auto mb-4 w-40 flex items-center justify-center">
            <img
              src="/img/logo.png"
              alt="Logo"
              class="w-auto block dark:hidden"
            >
            <img
              src="/img/logo-dark.png"
              alt="Logo"
              class="w-auto hidden dark:block"
            >
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ $t('auth.forgotPassword.title') }}
          </h1>
          <p class="mt-2 text-gray-500">
            {{ submitted ? $t('auth.forgotPassword.submitted.description') : $t('auth.forgotPassword.description') }}
          </p>
        </div>
      </template>

      <div
        v-if="submitted"
        class="text-center py-8"
      >
        <UIcon
          name="i-lucide-mail-check"
          class="w-16 h-16 text-blue-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('auth.forgotPassword.submitted.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('auth.forgotPassword.submitted.checkEmail') }}
        </p>
        <UButton
          variant="solid"
          color="primary"
          to="/auth/login"
          class="w-full justify-center"
          size="xl"
        >
          {{ $t('auth.forgotPassword.backToLogin') }}
        </UButton>
      </div>

      <UForm
        v-else
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <UFormField
          :label="$t('auth.property.email.label')"
          name="email"
          required
          size="xl"
        >
          <UInput
            v-model="state.email"
            type="email"
            :placeholder="$t('auth.property.email.input.placeholder')"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          :loading="loading"
          color="primary"
          class="mt-6"
          size="xl"
          block
          variant="solid"
        >
          {{ $t('auth.forgotPassword.button.submit') }}
        </UButton>

        <div class="mt-4 text-center">
          <UButton
            variant="link"
            color="neutral"
            to="/auth/login"
            class="text-sm"
          >
            {{ $t('auth.forgotPassword.backToLogin') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
