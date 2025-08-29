<script setup lang="ts">
const isDeleting = ref(false);
const { fetch: refreshSession } = useUserSession();

const deleteAccount = async () => {
  try {
    isDeleting.value = true;

    await $fetch('/api/profile', { method: 'delete' });
    await refreshSession();

    // Redirect to homepage
    await useRouter().push('/');
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
    isDeleting.value = false;
  }
};
</script>

<template>
  <UCard
    :ui="{ root: 'divide-none' }"
    class="border-red-200 dark:border-red-800"
  >
    <template #header>
      <div class="flex items-center">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-5 h-5 text-red-500 mr-2"
        />
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
          {{ $t('auth.profile.dangerZone.title') }}
        </h3>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('auth.profile.dangerZone.description') }}
      </p>
    </template>

    <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <h4 class="font-medium text-red-800 dark:text-red-300 mb-2">
        {{ $t('auth.profile.dangerZone.deleteAccount.title') }}
      </h4>
      <p class="text-sm text-red-600 dark:text-red-400 mb-4">
        {{ $t('auth.profile.dangerZone.deleteAccount.description') }}
      </p>
      <DeleteButton
        :on-delete="deleteAccount"
        :button-label="$t('auth.profile.dangerZone.deleteAccount.button')"
        :confirmation-question="$t('auth.profile.dangerZone.deleteAccount.confirmation.question')"
        :confirmation-message="$t('auth.profile.dangerZone.deleteAccount.confirmation.message')"
        :toast-success-title="$t('auth.profile.dangerZone.deleteAccount.toast.deleteSuccess.title')"
        :toast-success-description="$t('auth.profile.dangerZone.deleteAccount.toast.deleteSuccess.description')"
      />
    </div>
  </UCard>
</template>
