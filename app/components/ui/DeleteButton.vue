<script setup lang="ts">
// Props
const props = defineProps<{
  onDelete: () => Promise<void> | void;
  buttonLabel?: string;
  confirmationQuestion?: string;
  confirmationMessage?: string;
  toastSuccessTitle?: string;
  toastSuccessDescription?: string;
}>();

// Reactive state
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const confirmationText = ref('');

const isConfirmationValid = computed(() => {
  return confirmationText.value.trim().toLowerCase() === $t('ui.deleteConfirmation.confirmationInput.confirmationText').trim().toLowerCase();
});

// Methods
const cancelDelete = () => {
  showDeleteModal.value = false;
  confirmationText.value = '';
};

const confirmDelete = async () => {
  try {
    isDeleting.value = true;

    await props.onDelete();

    // Show success notification
    const toast = useToast();
    toast.add({
      title: props.toastSuccessTitle || $t('ui.deleteConfirmation.toast.success.title'),
      description: props.toastSuccessDescription,
      color: 'success',
      icon: 'i-heroicons-check'
    });

    // Close modal
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Delete failed:', error);

    // Show error notification
    const toast = useToast();
    toast.add({
      title: $t('ui.deleteConfirmation.toast.error.title'),
      description: error instanceof Error ? error.message : $t('ui.deleteConfirmation.toast.error.description'),
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    });
  } finally {
    isDeleting.value = false;
    confirmationText.value = '';
  }
};
</script>

<template>
  <div>
    <UModal
      v-model:open="showDeleteModal"
      :title="$t('ui.deleteConfirmation.title')"
    >
      <UButton
        color="error"
        variant="solid"
        icon="i-heroicons-trash"
        :loading="isDeleting"
        :disabled="isDeleting"
        @click="showDeleteModal = true"
      >
        {{ props.buttonLabel || $t('ui.deleteConfirmation.buttonLabel') }}
      </UButton>

      <template #body>
        <div class="space-y-4">
          <!-- Warning Icon -->
          <div class="flex justify-center">
            <div
              class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900/20"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-6 h-6 text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <!-- Warning Message -->
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ props.confirmationQuestion || $t('ui.deleteConfirmation.question') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ props.confirmationMessage ||$t('ui.deleteConfirmation.message') }}
            </p>
          </div>

          <!-- Confirmation Input (optional extra validation) -->
          <div class="space-y-2">
            <UFormField
              :label="$t('ui.deleteConfirmation.confirmationInput.label', { confirmationText: $t('ui.deleteConfirmation.confirmationInput.confirmationText') })"
            >
              <UInput
                v-model="confirmationText"
                :placeholder="$t('ui.deleteConfirmation.confirmationInput.placeholder', { confirmationText: $t('ui.deleteConfirmation.confirmationInput.confirmationText') })"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <UButton
            color="neutral"
            variant="soft"
            :disabled="isDeleting"
            @click="cancelDelete"
          >
            {{ $t('common.action.cancel') }}
          </UButton>
          <UButton
            color="error"
            variant="solid"
            :loading="isDeleting"
            :disabled="!isConfirmationValid"
            @click="confirmDelete"
          >
            {{ $t('common.action.delete') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
