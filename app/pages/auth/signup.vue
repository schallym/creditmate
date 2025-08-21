<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createSignupValidationSchema } from '~~/server/services';

const { t } = useI18n();
const schema = computed(() => createSignupValidationSchema(t));

const user = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
});
const showPassword = ref(false);
const showConfirm = ref(false);
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: { ...user }
    });
    useToast().add({
      title: t('auth.signup.toast.success.title'),
      description: t('auth.signup.toast.success.description'),
      color: 'success'
    });
    await navigateTo('/auth/login');
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    useToast().add({
      title: t('auth.signup.toast.error.title'),
      description: t(error.statusMessage),
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
            {{ $t('auth.signup.title') }}
          </h1>
          <p class="mt-2 text-gray-500">
            {{ $t('auth.signup.description') }}
          </p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="user"
        @submit="onSubmit"
      >
        <UFormField
          :label="$t('auth.property.fullName.label')"
          name="fullName"
          required
          size="xl"
        >
          <UInput
            v-model="user.fullName"
            type="text"
            :placeholder="$t('auth.property.fullName.input.placeholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('auth.property.email.label')"
          name="email"
          required
          size="xl"
          class="mt-4"
        >
          <UInput
            v-model="user.email"
            type="email"
            :placeholder="$t('auth.property.email.input.placeholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('auth.property.password.label')"
          name="password"
          class="mt-4"
          required
          size="xl"
        >
          <UInput
            v-model="user.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('auth.property.password.input.placeholder')"
            class="w-full"
            size="xl"
          >
            <template #trailing>
              <button
                type="button"
                class="text-gray-500 hover:text-gray-700 cursor-pointer"
                :aria-label="$t('auth.property.password.input.display')"
                @click="showPassword = !showPassword"
              >
                <UIcon
                  :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="h-5 w-5"
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <UFormField
          :label="$t('auth.property.confirmPassword.label')"
          name="confirmPassword"
          class="mt-4"
          required
          size="xl"
        >
          <UInput
            v-model="user.confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            :placeholder="$t('auth.property.confirmPassword.input.placeholder')"
            class="w-full"
            size="xl"
          >
            <template #trailing>
              <button
                type="button"
                class="text-gray-500 hover:text-gray-700 cursor-pointer"
                :aria-label="$t('auth.property.confirmPassword.input.display')"
                @click="showConfirm = !showConfirm"
              >
                <UIcon
                  :name="showConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="h-5 w-5"
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <UFormField
          name="terms"
          class="mt-4"
          required
          size="xl"
        >
          <UCheckbox v-model="user.terms">
            <template #label>
              <span>
                {{ $t('auth.property.terms.label.prefix') }}
                <NuxtLink
                  to="/legal/terms"
                  class="text-primary-600 hover:underline"
                >
                  {{ $t('auth.property.terms.label.link') }}
                </NuxtLink>
              </span>
            </template>
          </UCheckbox>
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
          {{ $t('auth.signup.button.submit') }}
        </UButton>

        <!--        <div class="relative my-8"> -->
        <!--          <div class="border-t border-gray-200 dark:border-gray-700" /> -->
        <!--          <span -->
        <!--            class="absolute -top-3 left-1/2 -translate-x-1/2 select-none -->
        <!--           bg-white dark:bg-gray-900 px-3 py-1 -->
        <!--           text-[11px] font-medium tracking-wide uppercase -->
        <!--           text-gray-400" -->
        <!--          > -->
        <!--            OU CONTINUER AVEC -->
        <!--          </span> -->
        <!--        </div> -->

        <!--        <div> -->
        <!--          <UButton -->
        <!--            variant="outline" -->
        <!--            icon="i-logos-google-icon" -->
        <!--            class="w-full justify-center" -->
        <!--            size="lg" -->
        <!--            color="neutral" -->
        <!--            @click="signInWithProvider('google')" -->
        <!--          > -->
        <!--            Google -->
        <!--          </UButton> -->
        <!--        </div> -->
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.signup.login.text') }}
          <NuxtLink
            to="/auth/login"
            class="text-primary-600 dark:text-gray-400 hover:underline"
          >
            {{ $t('auth.signup.login.link') }}
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
