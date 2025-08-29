<script setup lang="ts">
import { z } from 'zod';

const isSaving = ref(false);

const validationSchema = z.object({
  currentPassword: z.string().min(1, $t('auth.profile.changePassword.form.currentPassword.validation.required')),
  newPassword: z.string().min(1, $t('auth.property.password.validation.required'))
    .min(16, $t('auth.property.password.validation.minLength'))
    .regex(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$'), $t('auth.property.password.validation.pattern')),
  confirmPassword: z.string()
}).refine(
  (data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword,
  { path: ['confirmPassword'], message: $t('auth.property.confirmPassword.validation.match') }
);

const formState = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const save = async () => {
  try {
    isSaving.value = true;

    await $fetch('/api/updatePassword', {
      method: 'PATCH',
      body: formState.value
    });

    // Clear form
    formState.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    const toast = useToast();
    toast.add({
      title: $t('auth.profile.changePassword.toast.updateSuccess.title'),
      description: $t('auth.profile.changePassword.toast.updateSuccess.description'),
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const toast = useToast();
    console.error(error);
    toast.add({
      title: $t('errors.title'),
      description: error.data?.message || $t('errors.internalServerError.message'),
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <UCard :ui="{ root: 'divide-none' }">
    <template #header>
      <div class="flex items-center">
        <UIcon
          name="i-heroicons-lock-closed"
          class="w-5 h-5 text-gray-400 mr-2"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('auth.profile.changePassword.title') }}
        </h3>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('auth.profile.changePassword.description') }}
      </p>
    </template>

    <UForm
      :state="formState"
      class="space-y-6"
      :schema="validationSchema"
      @submit="save"
    >
      <PasswordInput
        v-model="formState.currentPassword"
        :label="$t('auth.profile.changePassword.form.currentPassword.label')"
        :placeholder="$t('auth.profile.changePassword.form.currentPassword.input.placeholder')"
        size="lg"
        name="currentPassword"
      />

      <PasswordInput
        v-model="formState.newPassword"
        :label="$t('auth.profile.changePassword.form.newPassword.label')"
        :placeholder="$t('auth.profile.changePassword.form.newPassword.input.placeholder')"
        size="lg"
        name="newPassword"
      />

      <PasswordInput
        v-model="formState.confirmPassword"
        :label="$t('auth.profile.changePassword.form.confirmNewPassword.label')"
        :placeholder="$t('auth.profile.changePassword.form.confirmNewPassword.input.placeholder')"
        size="lg"
        name="confirmPassword"
      />

      <div class="flex justify-end">
        <UButton
          type="submit"
          color="primary"
          icon="i-heroicons-lock-closed"
          :loading="isSaving"
          variant="solid"
        >
          {{ $t('auth.profile.changePassword.button') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
