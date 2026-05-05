import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import type { User } from '~~/server/types';

import UserProfileCard from '~/components/profile/UserProfileCard.vue';
import UserProfileDangerZone from '~/components/profile/UserProfileDangerZone.vue';
import UserProfilePasswordFormCard from '~/components/profile/UserProfilePasswordFormCard.vue';
import UserProfilePersonalDataFormCard from '~/components/profile/UserProfilePersonalDataFormCard.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';
import ReviewContactCard from '~/components/review/ReviewContactCard.vue';
import ReviewFeedbackCard from '~/components/review/ReviewFeedbackCard.vue';
import ReviewOverallRatingCard from '~/components/review/ReviewOverallRatingCard.vue';
import ReviewSuggestionsCard from '~/components/review/ReviewSuggestionsCard.vue';
import ReviewTypeCard from '~/components/review/ReviewTypeCard.vue';

const sampleUser: User = {
  id: 1, fullName: 'Test', email: 't@b.com',
  passwordHash: 'h', salt: 's', authProvider: 'credentials',
  createdAt: new Date('2025-01-01'), updatedAt: new Date('2026-01-01')
};

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const opts = (props: Record<string, unknown> = {}) => ({ props });

describe('Profile components', () => {
  it('UserProfileCard mounts', () => {
    expect(mountWithStubs(UserProfileCard, opts({ user: sampleUser })).exists()).toBe(true);
  });
  it('UserProfileDangerZone mounts', () => {
    expect(mountWithStubs(UserProfileDangerZone).exists()).toBe(true);
  });
  it('UserProfilePasswordFormCard mounts', () => {
    expect(mountWithStubs(UserProfilePasswordFormCard).exists()).toBe(true);
  });
  it('UserProfilePersonalDataFormCard mounts', () => {
    expect(mountWithStubs(UserProfilePersonalDataFormCard, opts({ user: sampleUser })).exists()).toBe(true);
  });
});

describe('Review components', () => {
  it('ReviewCategoryCard mounts', () => {
    expect(mountWithStubs(ReviewCategoryCard, opts({ modelValue: [], type: 'bug' })).exists()).toBe(true);
  });
  it('ReviewContactCard mounts', () => {
    expect(mountWithStubs(ReviewContactCard, opts({ modelValue: '' })).exists()).toBe(true);
  });
  it('ReviewFeedbackCard mounts', () => {
    expect(mountWithStubs(ReviewFeedbackCard, opts({ modelValue: '' })).exists()).toBe(true);
  });
  it('ReviewOverallRatingCard mounts', () => {
    expect(mountWithStubs(ReviewOverallRatingCard, opts({ modelValue: 0 })).exists()).toBe(true);
  });
  it('ReviewSuggestionsCard mounts', () => {
    expect(mountWithStubs(ReviewSuggestionsCard, opts({ modelValue: '' })).exists()).toBe(true);
  });
  it('ReviewTypeCard mounts', () => {
    expect(mountWithStubs(ReviewTypeCard, opts({ modelValue: '' })).exists()).toBe(true);
  });
});
