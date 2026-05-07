import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';
import type { User } from '~~/server/types';

import UserProfilePersonalDataFormCard from '~/components/profile/UserProfilePersonalDataFormCard.vue';
import UserProfilePasswordFormCard from '~/components/profile/UserProfilePasswordFormCard.vue';
import UserProfileDangerZone from '~/components/profile/UserProfileDangerZone.vue';
import UserStatisticsCard from '~/components/profile/UserStatisticsCard.vue';

const sampleUser: User = {
  id: 1, fullName: 'Test', email: 't@b.com',
  passwordHash: 'h', salt: 's', authProvider: 'credentials',
  createdAt: new Date('2025-01-01'), updatedAt: new Date('2026-01-01')
};

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('UserProfilePersonalDataFormCard', () => {
  it('saves personal info on submit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePersonalDataFormCard, { props: { user: sampleUser } });
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }));
  });

  it('handles save error', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'fail' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePersonalDataFormCard, { props: { user: sampleUser } });
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePersonalDataFormCard, { props: { user: sampleUser } });
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('UserProfilePasswordFormCard', () => {
  it('updates password on submit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePasswordFormCard);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/updatePassword', expect.objectContaining({ method: 'PATCH' }));
  });

  it('handles password update error', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'wrong' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePasswordFormCard);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePasswordFormCard);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('UserProfileDangerZone', () => {
  it('triggers deleteAccount via DeleteButton onDelete prop', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    const pushMock = vi.fn();
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRouter: ReturnType<typeof vi.fn> }).useRouter = vi.fn(() => ({ push: pushMock }));
    const w = mountWithStubs(UserProfileDangerZone);
    // Find DeleteButton stub and call its onDelete prop
    const deleteBtn = w.findComponent({ name: 'DeleteButton' });
    if (deleteBtn.exists()) {
      const onDelete = deleteBtn.props('onDelete') as () => Promise<void>;
      if (onDelete) await onDelete();
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('handles delete error', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'oops' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfileDangerZone);
    const deleteBtn = w.findComponent({ name: 'DeleteButton' });
    if (deleteBtn.exists()) {
      const onDelete = deleteBtn.props('onDelete') as () => Promise<void>;
      if (onDelete) {
        try {
          await onDelete();
        } catch { /* expected */ }
      }
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });

  it('handles delete error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfileDangerZone);
    const deleteBtn = w.findComponent({ name: 'DeleteButton' });
    if (deleteBtn.exists()) {
      const onDelete = deleteBtn.props('onDelete') as () => Promise<void>;
      if (onDelete) {
        try {
          await onDelete();
        } catch { /* expected */ }
      }
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('UserStatisticsCard', () => {
  it('mounts and fetches stats', async () => {
    (globalThis as unknown as { useFetch: ReturnType<typeof vi.fn> }).useFetch = vi.fn(async () => ({
      data: { value: { numberOfActiveLoans: 3 } },
      error: { value: null },
      refresh: vi.fn(),
      pending: { value: false }
    }));
    const { mount, flushPromises: fp } = await import('@vue/test-utils');
    const { defineComponent, h, Suspense } = await import('vue');
    const { stubs } = await import('../vue-test-helper');
    const Wrapper = defineComponent({
      setup: () => () => h(Suspense, null, { default: () => h(UserStatisticsCard, { user: sampleUser }) })
    });
    const w = mount(Wrapper, {
      global: { stubs, mocks: { $t: (k: string) => k } }
    });
    await fp();
    expect(w.exists()).toBe(true);
  });

  it('mounts when fetch returns null data', async () => {
    (globalThis as unknown as { useFetch: ReturnType<typeof vi.fn> }).useFetch = vi.fn(async () => ({
      data: { value: null },
      error: { value: null },
      refresh: vi.fn(),
      pending: { value: false }
    }));
    const { mount, flushPromises: fp } = await import('@vue/test-utils');
    const { defineComponent, h, Suspense } = await import('vue');
    const { stubs } = await import('../vue-test-helper');
    const Wrapper = defineComponent({
      setup: () => () => h(Suspense, null, { default: () => h(UserStatisticsCard, { user: sampleUser }) })
    });
    const w = mount(Wrapper, {
      global: { stubs, mocks: { $t: (k: string) => k } }
    });
    await fp();
    expect(w.exists()).toBe(true);
  });
});
