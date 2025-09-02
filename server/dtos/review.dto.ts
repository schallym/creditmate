import type { ReviewType } from '~~/server/types';

export type PostReviewDto = {
  rating: number;
  type: ReviewType;
  categories: string[];
  feedback: string;
  suggestions?: string;
  email?: string;
};
