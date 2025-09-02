import type { PostReviewDto } from '~~/server/dtos';
import { ReviewType } from '~~/server/types';
import { z } from 'zod';
import ReviewService from '~~/server/services/review.service';

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const body = await readBody<PostReviewDto>(event);

    const validationSchema = z.object({
      rating: z.number().min(0, { message: t('review.form.fields.rating.validation.required') }),
      type: z.enum(ReviewType, { message: t('review.form.fields.type.validation.required') }),
      categories: z.array(z.string()).min(1, { message: t('review.form.fields.categories.validation.required') }),
      feedback: z.string().max(600, { message: t('review.form.fields.feedback.validation.maxLength', { max: 600 }) })
        .min(1, {
          message: t('review.form.fields.feedback.validation.required')
        }),
      suggestions: z.string().max(600, { message: t('review.form.fields.suggestions.validation.maxLength', { max: 600 }) })
        .refine((val) => {
          if (body.type === ReviewType.general || body.type === ReviewType.feature) {
            return val && val.length > 0;
          }
          return true;
        }, {
          message: t('review.form.fields.suggestions.validation.required')
        })
        .optional().or(z.literal('')),
      email: z.email({ message: t('review.form.fields.email.validation.invalid') }).optional().or(z.literal(''))
    });

    const validatedData: PostReviewDto = validationSchema.parse(body);

    await ReviewService.handleReview(validatedData);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: t('errors.validation.message'),
        data: error
      });
    }

    throw createError({
      statusCode: 500,
      message: t('errors.internalServerError.message')
    });
  }
});
