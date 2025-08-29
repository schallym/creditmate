<script setup lang="ts">
import { z } from 'zod';
import type { User } from '~~/server/types';

const { fetch: refreshSession } = useUserSession();

const props = defineProps<{
  user: User;
}>();

const isSaving = ref(false);

const validationSchema = z.object({
  fullName: z.string().min(1, $t('auth.property.fullName.validation.required')),
  email: z.email($t('auth.property.email.validation.invalid'))
});

const formState = ref({
  fullName: props.user.fullName,
  email: props.user.email
});

const save = async () => {
  try {
    isSaving.value = true;

    await $fetch('/api/profile', {
      method: 'PATCH',
      body: formState.value
    });

    await refreshSession();

    const toast = useToast();
    toast.add({
      title: $t('auth.profile.personalInfo.toast.updateSuccess.title'),
      description: $t('auth.profile.personalInfo.toast.updateSuccess.description'),
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(error);
    const toast = useToast();
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
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-user"
            class="w-5 h-5 text-gray-400 mr-2"
          />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('auth.profile.personalInfo.title') }}
          </h3>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('auth.profile.personalInfo.description') }}
      </p>
    </template>

    <UForm
      :state="formState"
      class="space-y-6"
      :schema="validationSchema"
      @submit="save"
    >
      <UFormField
        :label="$t('auth.property.fullName.label')"
        size="lg"
        name="fullName"
      >
        <UInput
          v-model="formState.fullName"
          :placeholder="$t('auth.property.fullName.input.placeholder')"
          icon="i-heroicons-user"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="$t('auth.property.email.label')"
        size="lg"
        name="email"
      >
        <UInput
          v-model="formState.email"
          type="email"
          :placeholder="$t('auth.property.email.input.placeholder')"
          icon="i-heroicons-envelope"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end">
        <UButton
          type="submit"
          color="primary"
          icon="i-lucide-check"
          :loading="isSaving"
          variant="solid"
        >
          {{ $t('auth.profile.personalInfo.button') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
