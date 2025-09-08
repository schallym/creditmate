<script setup lang="ts">
import { reactive, ref } from 'vue';
import { z } from 'zod';

useHead({
  title: $t('meta.resetPassword.title'),
  meta: [
    { name: 'description', content: $t('meta.resetPassword.description') }
  ]
});

const route = useRoute();
const router = useRouter();

const token = route.query.token as string;
const loading = ref(false);
const verifying = ref(true);
const tokenValid = ref(false);

const schema = z.object({
  password: z.string().min(16, $t('auth.property.password.validation.minLength'))
    .regex(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$'),
      $t('auth.property.password.validation.pattern')),
  confirmPassword: z.string()
}).refine(
  data => data.password === data.confirmPassword,
  { path: ['confirmPassword'], message: $t('auth.property.confirmPassword.validation.match') }
);

const state = reactive({
  password: '',
  confirmPassword: ''
});

// Verify token on mount
onMounted(async () => {
  if (!token) {
    await router.push('/auth/login');
    return;
  }

  try {
    const response: { valid: boolean } = await $fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token }
    });

    tokenValid.value = response.valid;

    if (!response.valid) {
      useToast().add({
        title: $t('auth.resetPassword.toast.error.title'),
        description: $t('auth.resetPassword.invalidToken'),
        color: 'error'
      });
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    tokenValid.value = false;
    console.error(error);
    useToast().add({
      title: $t('auth.resetPassword.toast.error.title'),
      description: $t('auth.resetPassword.invalidToken'),
      color: 'error'
    });
  } finally {
    verifying.value = false;
  }
});

async function onSubmit() {
  if (!tokenValid.value) return;

  loading.value = true;
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password: state.password,
        confirmPassword: state.confirmPassword
      }
    });

    useToast().add({
      title: $t('auth.resetPassword.toast.success.title'),
      description: $t('auth.resetPassword.toast.success.description'),
      color: 'success'
    });

    await router.push('/auth/login');
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    useToast().add({
      title: $t('auth.resetPassword.toast.error.title'),
      description: error.data?.message || $t('auth.resetPassword.toast.error.description'),
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
            {{ $t('auth.resetPassword.title') }}
          </h1>
          <p class="mt-2 text-gray-500">
            {{ $t('auth.resetPassword.description') }}
          </p>
        </div>
      </template>

      <!-- Loading state while verifying token -->
      <div
        v-if="verifying"
        class="text-center py-8"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin"
        />
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('auth.resetPassword.verifying') }}
        </p>
      </div>

      <!-- Invalid token state -->
      <div
        v-else-if="!tokenValid"
        class="text-center py-8"
      >
        <UIcon
          name="i-lucide-x-circle"
          class="w-16 h-16 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('auth.resetPassword.invalidTokenTitle') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('auth.resetPassword.invalidTokenMessage') }}
        </p>
        <UButton
          variant="solid"
          color="primary"
          to="/auth/forgot-password"
          class="w-full justify-center"
          size="xl"
        >
          {{ $t('auth.resetPassword.requestNewLink') }}
        </UButton>
      </div>

      <!-- Reset password form -->
      <UForm
        v-else
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <PasswordInput
          v-model="state.password"
          :label="$t('auth.resetPassword.form.newPassword.label')"
          name="password"
          :placeholder="$t('auth.resetPassword.form.newPassword.placeholder')"
        />

        <PasswordInput
          v-model="state.confirmPassword"
          :label="$t('auth.resetPassword.form.confirmPassword.label')"
          name="confirmPassword"
          :placeholder="$t('auth.resetPassword.form.confirmPassword.placeholder')"
        />

        <UButton
          type="submit"
          :loading="loading"
          color="primary"
          class="mt-6"
          size="xl"
          block
          variant="solid"
        >
          {{ $t('auth.resetPassword.button.submit') }}
        </UButton>

        <div class="mt-4 text-center">
          <UButton
            variant="link"
            color="neutral"
            to="/auth/login"
            class="text-sm"
          >
            {{ $t('auth.resetPassword.backToLogin') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
