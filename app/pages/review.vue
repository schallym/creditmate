<script setup lang="ts">
import { z } from 'zod';
import { ReviewType } from '~~/server/types';

const { loggedIn, user } = useUserSession();
const toast = useToast();
const router = useRouter();

const loading = ref(false);
const state = reactive({
  rating: 0,
  type: ReviewType.general,
  categories: [] as string[],
  feedback: '',
  suggestions: '',
  email: loggedIn.value && (user.value as { email?: string })?.email ? (user.value as { email: string }).email : ''
});

const validationSchema = z.object({
  rating: z.number().min(0, { message: $t('review.form.fields.rating.validation.required') }),
  type: z.enum(ReviewType, { message: $t('review.form.fields.type.validation.required') }),
  categories: z.array(z.string()).min(1, { message: $t('review.form.fields.categories.validation.required') }),
  feedback: z.string().max(600, { message: $t('review.form.fields.feedback.validation.maxLength', { max: 600 }) })
    .min(1, {
      message: $t('review.form.fields.feedback.validation.required')
    }),
  suggestions: z.string().max(600, { message: $t('review.form.fields.suggestions.validation.maxLength', { max: 600 }) })
    .refine((val) => {
      if (state.type === ReviewType.general || state.type === ReviewType.feature) {
        return val && val.length > 0;
      }
      return true;
    }, {
      message: $t('review.form.fields.suggestions.validation.required')
    })
    .optional().or(z.literal('')),
  email: z.email({ message: $t('review.form.fields.email.validation.invalid') }).optional().or(z.literal(''))
});

const onSubmit = async () => {
  loading.value = true;
  try {
    console.log('Submitting feedback:', state);

    await $fetch('/api/review', {
      method: 'POST',
      body: {
        ...state
      }
    });

    toast.add({
      title: $t('review.toast.success.title'),
      description: $t('review.toast.success.description'),
      color: 'success'
    });
    router.push('/');
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(error);
    useToast().add({
      title: $t('review.toast.error.title'),
      description: error.data.message ?? $t('errors.internalServerError.message'),
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-100 rounded-4xl flex items-center justify-center mx-auto mb-6">
          <UIcon
            name="i-lucide-message-circle"
            class="w-8 h-8"
          />
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent mb-4">
          {{ $t('review.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          {{ $t('review.description') }}
        </p>
      </div>

      <UForm
        :schema="validationSchema"
        :state="state as any"
        class="space-y-8"
        @submit="onSubmit"
      >
        <ReviewOverallRatingCard v-model="state.rating" />
        <ReviewTypeCard v-model="state.type" />
        <ReviewCategoryCard v-model="state.categories" />
        <ReviewFeedbackCard v-model="state.feedback" />
        <ReviewSuggestionsCard
          v-if="state.type === ReviewType.feature || state.type === ReviewType.general"
          v-model="state.suggestions"
        />
        <ReviewContactCard v-model="state.email" />

        <div class="max-w-3xl mx-auto">
          <UButton
            :loading="loading"
            type="submit"
            icon="i-lucide-send"
            size="lg"
            color="primary"
            variant="solid"
            class="w-full justify-center"
          >
            {{ $t('review.submitButton') }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
