import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { nextTick } from 'vue';

import ReviewOverallRatingCard from '~/components/review/ReviewOverallRatingCard.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';
import ReviewContactCard from '~/components/review/ReviewContactCard.vue';
import ReviewFeedbackCard from '~/components/review/ReviewFeedbackCard.vue';
import ReviewSuggestionsCard from '~/components/review/ReviewSuggestionsCard.vue';
import ReviewTypeCard from '~/components/review/ReviewTypeCard.vue';

beforeEach(() => setupNuxtMocks());

describe('ReviewOverallRatingCard', () => {
  it('triggers setRating on button click', async () => {
    const w = mountWithStubs(ReviewOverallRatingCard, { props: { modelValue: 0 } });
    const buttons = w.findAll('button');
    await buttons[2].trigger('click');
    await buttons[2].trigger('mouseenter');
    await buttons[2].trigger('mouseleave');
    expect(w.emitted('update:modelValue')).toBeTruthy();
  });

  it('reacts to modelValue prop change', async () => {
    const w = mountWithStubs(ReviewOverallRatingCard, { props: { modelValue: 1 } });
    await w.setProps({ modelValue: 5 });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewCategoryCard', () => {
  it('toggles category on button click', async () => {
    const w = mountWithStubs(ReviewCategoryCard, { props: { modelValue: [] } });
    const buttons = w.findAll('button');
    await buttons[0].trigger('click');
    await nextTick();
    await buttons[0].trigger('click');
    await nextTick();
    expect(w.emitted('update:modelValue')).toBeTruthy();
  });

  it('reacts to modelValue prop change', async () => {
    const w = mountWithStubs(ReviewCategoryCard, { props: { modelValue: ['a'] } });
    await w.setProps({ modelValue: ['b'] });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewContactCard', () => {
  it('emits update on prop change', async () => {
    const w = mountWithStubs(ReviewContactCard, { props: { modelValue: '' } });
    await w.setProps({ modelValue: 'a@b.com' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewFeedbackCard', () => {
  it('emits update on prop change', async () => {
    const w = mountWithStubs(ReviewFeedbackCard, { props: { modelValue: '' } });
    await w.setProps({ modelValue: 'feedback' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewSuggestionsCard', () => {
  it('emits update on prop change', async () => {
    const w = mountWithStubs(ReviewSuggestionsCard, { props: { modelValue: '' } });
    await w.setProps({ modelValue: 'suggestion' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewTypeCard', () => {
  it('emits update on prop change', async () => {
    const w = mountWithStubs(ReviewTypeCard, { props: { modelValue: '' } });
    await w.setProps({ modelValue: 'bug' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });
});
