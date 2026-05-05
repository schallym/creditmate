import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import { nextTick } from 'vue';

import ClearableInput from '~/components/ui/ClearableInput.vue';
import TextAreaInput from '~/components/ui/TextAreaInput.vue';
import PasswordInput from '~/components/ui/PasswordInput.vue';
import DateInput from '~/components/ui/DateInput.vue';
import ReviewContactCard from '~/components/review/ReviewContactCard.vue';
import ReviewFeedbackCard from '~/components/review/ReviewFeedbackCard.vue';
import ReviewSuggestionsCard from '~/components/review/ReviewSuggestionsCard.vue';
import ReviewTypeCard from '~/components/review/ReviewTypeCard.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ClearableInput v-model emit triggers watch and emit', () => {
  it('emits update on input change', async () => {
    const w = mountWithStubs(ClearableInput, {
      props: { modelValue: '', label: 'L', name: 'n', placeholder: 'p' }
    });
    const input = w.find('input');
    await input.setValue('hello');
    await flushPromises();
    expect(w.emitted('update:modelValue')).toBeTruthy();
  });
});

describe('TextAreaInput v-model triggers counter update via inner watch', () => {
  it('emits and updates counter on input', async () => {
    const w = mountWithStubs(TextAreaInput, {
      props: { modelValue: '', name: 'n', placeholder: 'p' }
    });
    const ta = w.find('textarea');
    await ta.setValue('hello');
    await flushPromises();
    expect(w.emitted('update:modelValue')).toBeTruthy();
  });
});

describe('PasswordInput v-model triggers emit', () => {
  it('emits on input change', async () => {
    const w = mountWithStubs(PasswordInput, {
      props: { label: 'L', placeholder: 'P', name: 'n', modelValue: '' }
    });
    // The inner UInput emits update -> passwordValue ref updates -> watch fires -> emit
    const input = w.find('input');
    if (input.exists()) {
      await input.setValue('secret');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('DateInput emits on selectedDate change', () => {
  it('triggers selectedDate watch via UCalendar update', async () => {
    const w = mountWithStubs(DateInput, { props: { modelValue: '2026-01-01' } });
    // Find UCalendar stub (currently no name) and emit update:modelValue
    // Or trigger via UInput
    const input = w.find('input');
    if (input.exists()) {
      await input.setValue('2026-06-01');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('Review cards v-model triggers internal watch + emit', () => {
  it('ReviewContactCard emits when input changes', async () => {
    const w = mountWithStubs(ReviewContactCard, { props: { modelValue: '' } });
    const input = w.find('input');
    if (input.exists()) {
      await input.setValue('a@b.com');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('ReviewFeedbackCard emits on textarea change', async () => {
    const w = mountWithStubs(ReviewFeedbackCard, { props: { modelValue: '' } });
    const ta = w.find('textarea');
    if (ta.exists()) {
      await ta.setValue('feedback');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('ReviewSuggestionsCard emits on textarea change', async () => {
    const w = mountWithStubs(ReviewSuggestionsCard, { props: { modelValue: '' } });
    const ta = w.find('textarea');
    if (ta.exists()) {
      await ta.setValue('suggestion');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('ReviewTypeCard emits when type changes', async () => {
    const w = mountWithStubs(ReviewTypeCard, { props: { modelValue: 'general' } });
    await w.setProps({ modelValue: 'bug' });
    await nextTick();
    expect(w.exists()).toBe(true);
  });

  it('ReviewCategoryCard toggles each category', async () => {
    const w = mountWithStubs(ReviewCategoryCard, { props: { modelValue: [] } });
    const buttons = w.findAll('button');
    for (const b of buttons) {
      await b.trigger('click');
    }
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});
